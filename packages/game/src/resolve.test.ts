import { PLAYLINE_SLOT_COUNT } from '@cars-and-magic/shared';
import { describe, expect, it } from 'vitest';

import { resolveSlot, resolveTurn } from './resolve.js';
import type { CardLibrary, PlayerState, StatusState } from './types.js';

const baseStatus: StatusState = { id: 1, duration: 1, tags: [] };

function createPlayer(overrides: Partial<PlayerState>): PlayerState {
  return {
    id: 'player',
    distance: 0,
    playline: [null, null, null, null],
    resources: { current: 3, max: 3 },
    statuses: [{ ...baseStatus }],
    ...overrides
  };
}

describe('resolveSlot', () => {
  it('spends resources and advances distance for a played card', () => {
    const cardLibrary: CardLibrary = {
      101: { id: 101, cost: 2, effects: [{ type: 'move', amount: 3 }] }
    };

    const players: PlayerState[] = [
      createPlayer({ id: 'A', playline: [101, null, null, null] }),
      createPlayer({ id: 'B' })
    ];

    const result = resolveSlot(0, cardLibrary, players);
    const actor = result.players.find((player) => player.id === 'A');

    expect(actor?.distance).toBe(3);
    expect(actor?.resources.current).toBe(1);
    expect(result.outcomes[0].distanceDelta).toBe(3);
  });

  it('blocks play when immobilized and ticks duration', () => {
    const cardLibrary: CardLibrary = {
      102: { id: 102, cost: 1, effects: [{ type: 'move', amount: 2 }] }
    };

    const immobilized: StatusState = { id: 9, duration: 1, tags: ['immobilized'] };
    const players: PlayerState[] = [
      createPlayer({ id: 'A', statuses: [immobilized], playline: [102, null, null, null] })
    ];

    const result = resolveSlot(0, cardLibrary, players);
    const outcome = result.outcomes[0];

    expect(outcome.notes).toContain('Immobilized');
    expect(result.players[0].statuses.length).toBe(0);
    expect(result.players[0].distance).toBe(0);
    expect(result.players[0].resources.current).toBe(3);
  });

  it('applies statuses to opponents and drains distance', () => {
    const hex: StatusState = { id: 7, duration: 2, tags: ['hex'] };
    const cardLibrary: CardLibrary = {
      103: {
        id: 103,
        cost: 1,
        effects: [
          { type: 'applyStatus', status: hex },
          { type: 'drain', amount: 2 }
        ]
      }
    };

    const players: PlayerState[] = [
      createPlayer({ id: 'A', playline: [103, null, null, null] }),
      createPlayer({ id: 'B', distance: 3 })
    ];

    const result = resolveSlot(0, cardLibrary, players);
    const opponent = result.players.find((player) => player.id === 'B');
    const outcome = result.outcomes.find((entry) => entry.playerId === 'A');

    expect(opponent?.statuses).toContainEqual({ ...hex, duration: 1 });
    expect(opponent?.distance).toBe(1);
    expect(outcome?.statusesApplied).toContain(7);
  });
});

describe('resolveTurn', () => {
  it('plays through all four slots and selects a leader', () => {
    const cardLibrary: CardLibrary = {
      201: { id: 201, cost: 1, effects: [{ type: 'move', amount: 2 }] },
      202: { id: 202, cost: 1, effects: [{ type: 'move', amount: 1 }] }
    };

    const players: PlayerState[] = [
      createPlayer({ id: 'A', playline: [201, 201, null, null] }),
      createPlayer({ id: 'B', playline: [202, null, null, null] })
    ];

    const { players: afterTurn, summary } = resolveTurn({ turn: 1, cardLibrary, players });

    expect(afterTurn.find((player) => player.id === 'A')?.distance).toBe(4);
    expect(afterTurn.find((player) => player.id === 'B')?.distance).toBe(1);
    expect(summary.slots).toHaveLength(PLAYLINE_SLOT_COUNT);
    expect(summary.winnerId).toBe('A');
  });
});
