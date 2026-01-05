import { netMessageCodes } from '@cars-and-magic/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as colyseus from 'colyseus';

vi.mock('colyseus', () => {
  class FakeDelayed {
    private elapsed = 0;
    private cleared = false;

    constructor(private readonly callback: () => void, private readonly delay: number) {}

    tick(deltaMs: number) {
      if (this.cleared) return;
      this.elapsed += deltaMs;
      if (this.elapsed >= this.delay) {
        this.callback();
        this.cleared = true;
      }
    }

    clear() {
      this.cleared = true;
    }
  }

  class FakeRoom {
    broadcast = (..._args: unknown[]) => {};
    clock = {
      setTimeout: (callback: () => void, delay: number) => new FakeDelayed(callback, delay)
    };
    maxClients = 0;
    onMessageHandlers: Record<string | number, (client: unknown, payload: unknown) => void> = {};

    onMessage(type: string | number, handler: (client: unknown, payload: unknown) => void) {
      this.onMessageHandlers[type] = handler;
    }
  }

  class FakeClient {}

  return { Client: FakeClient, Delayed: FakeDelayed, Room: FakeRoom };
});
import { RaceRoom } from './race-room.js';

function createClient(id: string): colyseus.Client {
  return { sessionId: id } as colyseus.Client;
}

describe('RaceRoom', () => {
  let broadcasts: unknown[];

  beforeEach(() => {
    broadcasts = [];
  });

  it('clears the countdown when ready players drop below the minimum', () => {
    const room = new RaceRoom();
    room.broadcast = ((type: unknown, message?: unknown) =>
      broadcasts.push(message ?? type)) as unknown as typeof room.broadcast;
    room.onCreate({ turnDurationMs: 50, minReadyPlayers: 2, autofillCardId: 1000 });

    const playerA = createClient('A');
    const playerB = createClient('B');
    room.onJoin(playerA);
    room.onJoin(playerB);

    (room as any).onMessageHandlers.ready(playerA, { ready: true });
    (room as any).onMessageHandlers.ready(playerB, { ready: true });

    expect((room as any).turnDeadline).toBeDefined();
    expect((room as any).turnTimer).toBeDefined();

    (room as any).onMessageHandlers.ready(playerB, { ready: false });

    expect((room as any).turnDeadline).toBeUndefined();
    expect((room as any).turnTimer).toBeUndefined();
    expect(broadcasts.some((message) => (message as any).code === netMessageCodes.stateSnapshot)).toBe(true);
  });

  it('resolves turns with autofilled slots and broadcasts the summary', () => {
    const room = new RaceRoom();
    room.broadcast = ((type: unknown, message?: unknown) =>
      broadcasts.push(message ?? type)) as unknown as typeof room.broadcast;
    room.onCreate({ turnDurationMs: 5, minReadyPlayers: 2, autofillCardId: 1000 });

    const playerA = createClient('A');
    const playerB = createClient('B');
    room.onJoin(playerA);
    room.onJoin(playerB);

    (room as any).onMessageHandlers.ready(playerA, { ready: true });
    (room as any).onMessageHandlers.ready(playerB, { ready: true });

    (room as any).onMessageHandlers[netMessageCodes.submitPlayLine](playerA, {
      playLine: [1001, null, null, null]
    });

    const turnTimer = (room as any).turnTimer;
    expect(turnTimer).toBeDefined();
    turnTimer.tick(10);

    const resolvedMessages = broadcasts.filter((message) => (message as any).code === netMessageCodes.turnResolved);
    expect(resolvedMessages).toHaveLength(1);

    const resolved = resolvedMessages[0] as any;
    expect(resolved.payload.turnSummary.turn).toBe(1);

    const autofilledOutcome = resolved.payload.turnSummary.slots[0].outcomes.find(
      (outcome: any) => outcome.playerId === playerB.sessionId
    );

    expect(autofilledOutcome.cardId).toBe(1000);
    expect(autofilledOutcome.notes).toContain('Auto-filled slot with coast card');
    expect((room as any).players.get(playerA.sessionId).state.distance).toBe(1);

    (room as any).clearTurnTimer();
  });
});
