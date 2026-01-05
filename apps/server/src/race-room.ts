import { cardIdSchema, netMessageCodes, playLineSchema, PLAYLINE_SLOT_COUNT, stateSnapshotMessageSchema, submitPlayLineMessageSchema, turnResolvedMessageSchema, turnSummarySchema, type PlayLine, type PlayerState, type SlotSummary } from '@cars-and-magic/shared';
import * as colyseus from 'colyseus';
import { z } from 'zod';

const readyMessageSchema = z.object({
  ready: z.boolean()
});

type RaceRoomOptions = {
  turnDurationMs: number;
  minReadyPlayers: number;
  autofillCardId: number;
};

type PlayerSession = {
  client: colyseus.Client;
  state: PlayerState;
  ready: boolean;
};

function createEmptyPlayLine(): PlayLine {
  return [null, null, null, null];
}

/**
 * RaceRoom coordinates a four-slot turn loop for multiple players:
 * - Joins hand each player a basic autofill card and tracks ready state.
 * - Validates inbound playline submissions with the shared schemas.
 * - Starts a timed turn once enough players are ready, auto-fills empty
 *   slots at deadline, and computes per-slot summaries.
 * - Broadcasts authoritative state snapshots and turn resolution payloads
 *   using shared network message codes to keep clients in sync.
 */
export class RaceRoom extends colyseus.Room {
  private options!: RaceRoomOptions;
  private turnTimer?: colyseus.Delayed;
  private turnDeadline?: number;
  private turn = 1;
  private readonly players = new Map<string, PlayerSession>();

  onCreate(options: Partial<RaceRoomOptions> = {}) {
    this.options = {
      turnDurationMs: options.turnDurationMs ?? 20000,
      minReadyPlayers: options.minReadyPlayers ?? 2,
      autofillCardId: cardIdSchema.parse(options.autofillCardId ?? 1000)
    };

    this.maxClients = 4;

    this.onMessage('ready', (client, payload) => this.handleReady(client, payload));
    this.onMessage(netMessageCodes.submitPlayLine, (client, payload) => this.handleSubmitPlayLine(client, payload));
  }

  onJoin(client: colyseus.Client) {
    const playerState: PlayerState = {
      id: client.sessionId,
      hand: [this.options.autofillCardId],
      playLine: createEmptyPlayLine(),
      statuses: [],
      distance: 0
    };

    this.players.set(client.sessionId, {
      client,
      ready: false,
      state: playerState
    });

    this.broadcastSnapshot();
  }

  onLeave(client: colyseus.Client) {
    this.players.delete(client.sessionId);

    if (this.players.size === 0) {
      this.clearTurnTimer();
      this.turnDeadline = undefined;
    }

    this.resetTurnCountdownIfInsufficientPlayers();
    this.broadcastSnapshot();
  }

  private handleReady(client: colyseus.Client, payload: unknown) {
    const parsed = readyMessageSchema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    const session = this.players.get(client.sessionId);
    if (!session) {
      return;
    }

    session.ready = parsed.data.ready;
    this.broadcastSnapshot();
    this.resetTurnCountdownIfInsufficientPlayers();
    this.maybeStartTurn();
  }

  private handleSubmitPlayLine(client: colyseus.Client, payload: unknown) {
    const parsed = submitPlayLineMessageSchema.safeParse({
      code: netMessageCodes.submitPlayLine,
      payload
    });

    if (!parsed.success) {
      return;
    }

    const session = this.players.get(client.sessionId);
    if (!session) {
      return;
    }

    const playLine = playLineSchema.parse(parsed.data.payload.playLine);
    session.state.playLine = playLine;
    this.broadcastSnapshot();
  }

  private maybeStartTurn() {
    if (this.turnTimer || this.players.size < this.options.minReadyPlayers) {
      return;
    }

    if (!this.hasMinimumReadyPlayers()) {
      return;
    }

    this.startTurn();
  }

  /**
   * Sets a new deadline for the current turn and schedules resolution. Clients
   * receive a snapshot immediately so they can surface the timer locally.
   */
  private startTurn() {
    this.turnDeadline = Date.now() + this.options.turnDurationMs;
    this.clearTurnTimer();
    this.turnTimer = this.clock.setTimeout(() => this.resolveTurn(), this.options.turnDurationMs);
    this.broadcastSnapshot();
  }

  private hasMinimumReadyPlayers() {
    const readyPlayers = Array.from(this.players.values()).filter((player) => player.ready);
    return readyPlayers.length >= this.options.minReadyPlayers;
  }

  /**
   * Cancels an in-progress countdown when the table no longer meets readiness
   * requirements (e.g., players unready or leave). Clears the deadline so
   * snapshots no longer show an outdated timer.
   */
  private resetTurnCountdownIfInsufficientPlayers() {
    if (!this.turnTimer) {
      return;
    }

    if (this.hasMinimumReadyPlayers()) {
      return;
    }

    this.clearTurnTimer();
    this.turnDeadline = undefined;
    this.broadcastSnapshot();
  }

  /**
   * Autofills missing card slots, computes per-slot outcomes, and broadcasts
   * a turn resolution payload before scheduling the next turn. Player state is
   * reset for the next planning phase once the summary is emitted.
   */
  private resolveTurn() {
    const autofilledPlayLines = new Map<string, PlayLine>();

    for (const [playerId, session] of this.players.entries()) {
      const filled = session.state.playLine.map((slot) => slot ?? this.options.autofillCardId) as PlayLine;
      autofilledPlayLines.set(playerId, filled);
    }

    const slotSummaries: SlotSummary[] = Array.from({ length: PLAYLINE_SLOT_COUNT }, (_, slotIndex) => {
      const outcomes = Array.from(autofilledPlayLines.entries()).map(([playerId, playLine]) => {
        const cardId = playLine[slotIndex];
        const distanceDelta = cardId === this.options.autofillCardId ? 0 : 1;

        return {
          playerId,
          cardId,
          statusesApplied: [],
          distanceDelta,
          notes: cardId === this.options.autofillCardId ? 'Auto-filled slot with coast card' : undefined
        };
      });

      return {
        slotIndex,
        outcomes,
        tags: []
      };
    });

    for (const [playerId, session] of this.players.entries()) {
      const playerOutcomes = slotSummaries.flatMap((slot) => slot.outcomes.filter((outcome) => outcome.playerId === playerId));
      const distanceDelta = playerOutcomes.reduce((delta, outcome) => delta + outcome.distanceDelta, 0);
      session.state.distance += distanceDelta;
      session.state.playLine = createEmptyPlayLine();
    }

    const turnSummary = turnSummarySchema.parse({
      turn: this.turn,
      slots: slotSummaries as unknown as [SlotSummary, SlotSummary, SlotSummary, SlotSummary]
    });

    const nextTurnDeadline = Date.now() + this.options.turnDurationMs;
    const resolvedMessage = turnResolvedMessageSchema.parse({
      code: netMessageCodes.turnResolved,
      payload: {
        turnSummary,
        nextTurnAt: new Date(nextTurnDeadline).toISOString()
      }
    });

    this.broadcast(resolvedMessage.code, resolvedMessage);

    this.turn += 1;
    this.turnDeadline = nextTurnDeadline;
    this.turnTimer = this.clock.setTimeout(() => this.resolveTurn(), this.options.turnDurationMs);

    this.broadcastSnapshot();
  }

  private broadcastSnapshot() {
    const message = stateSnapshotMessageSchema.parse({
      code: netMessageCodes.stateSnapshot,
      payload: {
        turn: this.turn,
        players: Array.from(this.players.values()).map((player) => player.state),
        expiresAt: this.turnDeadline ? new Date(this.turnDeadline).toISOString() : undefined
      }
    });

    this.broadcast(message.code, message);
  }

  private clearTurnTimer() {
    if (this.turnTimer) {
      this.turnTimer.clear();
      this.turnTimer = undefined;
    }
  }
}
