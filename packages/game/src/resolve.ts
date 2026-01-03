import { PLAYLINE_SLOT_COUNT, type SlotOutcome, type SlotSummary, type TurnSummary } from '@cars-and-magic/shared';

import { applyCardEffects, spendResources } from './effects.js';
import { canAfford } from './resources.js';
import { hasStatusWithTag, tickStatuses } from './status.js';
import type { CardDefinition, CardLibrary, PlayerState, ResolveContext, SlotResolutionResult } from './types.js';

export const IMMOBILIZED_TAG = 'immobilized';

export const SLOT_NOTES = {
  noCardPlayed: 'No card played',
  immobilized: 'Immobilized',
  unknownCard: 'Unknown card',
  insufficientResources: 'Insufficient resources'
} as const;

function clonePlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    playline: [...player.playline],
    statuses: player.statuses.map((status) => ({ ...status }))
  };
}

function replacePlayer(players: PlayerState[], updated: PlayerState): PlayerState[] {
  return players.map((player) => (player.id === updated.id ? updated : player));
}

function sortPlayers(players: PlayerState[]): PlayerState[] {
  return [...players].sort((a, b) => a.id.localeCompare(b.id));
}

function resolveCard(
  card: CardDefinition,
  actor: PlayerState,
  players: PlayerState[]
): { players: PlayerState[]; outcome: SlotOutcome } {
  let updatedPlayers = spendResources(card, actor, players);
  const actorAfterSpend = updatedPlayers.find((player) => player.id === actor.id) ?? actor;
  const { outcome, players: playersAfterEffects } = applyCardEffects(card, actorAfterSpend, updatedPlayers);
  updatedPlayers = playersAfterEffects;

  return { players: updatedPlayers, outcome };
}

export function resolveSlot(
  slotIndex: number,
  cardLibrary: CardLibrary,
  players: PlayerState[],
  defaultCardId?: number
): SlotResolutionResult {
  let workingPlayers = sortPlayers(players).map(clonePlayer);
  const outcomes: SlotOutcome[] = [];

  for (let i = 0; i < workingPlayers.length; i += 1) {
    const actor = workingPlayers[i];
    const cardId = actor.playline[slotIndex] ?? defaultCardId ?? null;
    if (cardId === null) {
      outcomes.push({
        playerId: actor.id,
        cardId: null,
        distanceDelta: 0,
        statusesApplied: [],
        notes: SLOT_NOTES.noCardPlayed
      });
      continue;
    }

    if (hasStatusWithTag(actor.statuses, IMMOBILIZED_TAG)) {
      outcomes.push({
        playerId: actor.id,
        cardId,
        distanceDelta: 0,
        statusesApplied: [],
        notes: SLOT_NOTES.immobilized
      });
      continue;
    }

    const card = cardLibrary[cardId];
    if (!card) {
      outcomes.push({
        playerId: actor.id,
        cardId,
        distanceDelta: 0,
        statusesApplied: [],
        notes: SLOT_NOTES.unknownCard
      });
      continue;
    }

    if (!canAfford(card.cost, actor.resources)) {
      outcomes.push({
        playerId: actor.id,
        cardId,
        distanceDelta: 0,
        statusesApplied: [],
        notes: SLOT_NOTES.insufficientResources
      });
      continue;
    }

    const { players: afterCard, outcome } = resolveCard(card, actor, workingPlayers);
    workingPlayers = afterCard;
    outcomes.push(outcome);
  }

  const tickedPlayers = workingPlayers.map((player) => ({
    ...player,
    statuses: tickStatuses(player.statuses)
  }));

  return { players: tickedPlayers, outcomes };
}

export function resolveTurn(context: ResolveContext): { players: PlayerState[]; summary: TurnSummary } {
  const { cardLibrary } = context;
  let workingPlayers = sortPlayers(context.players).map(clonePlayer);
  const slots: [SlotSummary, SlotSummary, SlotSummary, SlotSummary] = [
    { slotIndex: 0, outcomes: [], tags: [] },
    { slotIndex: 1, outcomes: [], tags: [] },
    { slotIndex: 2, outcomes: [], tags: [] },
    { slotIndex: 3, outcomes: [], tags: [] }
  ];

  for (let slotIndex = 0; slotIndex < PLAYLINE_SLOT_COUNT; slotIndex += 1) {
    const { players: afterSlot, outcomes } = resolveSlot(
      slotIndex,
      cardLibrary,
      workingPlayers,
      context.defaultCardId
    );
    workingPlayers = afterSlot;
    slots[slotIndex] = { slotIndex, outcomes, tags: [] };
  }

  const leader = workingPlayers.reduce<{ id: string | null; distance: number; tied: boolean }>(
    (acc, player) => {
      if (player.distance > acc.distance) {
        return { id: player.id, distance: player.distance, tied: false };
      }
      if (player.distance === acc.distance) {
        return { ...acc, tied: true };
      }
      return acc;
    },
    { id: null, distance: Number.NEGATIVE_INFINITY, tied: false }
  );

  const summary: TurnSummary = {
    turn: context.turn,
    slots,
    winnerId: leader.tied ? undefined : leader.id ?? undefined
  };

  return { players: workingPlayers, summary };
}
