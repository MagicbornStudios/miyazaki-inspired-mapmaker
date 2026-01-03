import type { SlotOutcome } from '@cars-and-magic/shared';

import { gain, spend } from './resources.js';
import { applyStatus, cleanseByTag } from './status.js';
import { resolveTargets } from './targeting.js';
import type { CardDefinition, PlayerState, Targeting } from './types.js';

interface CardEffectResult {
  players: PlayerState[];
  outcome: SlotOutcome;
}

function replacePlayer(players: PlayerState[], updated: PlayerState): PlayerState[] {
  return players.map((player) => (player.id === updated.id ? updated : player));
}

function applyEffect(
  effect: CardDefinition['effects'][number],
  actor: PlayerState,
  players: PlayerState[],
  outcome: SlotOutcome,
  targeting: Targeting | undefined
): { players: PlayerState[]; outcome: SlotOutcome } {
  switch (effect.type) {
    case 'move': {
      const updated = { ...actor, distance: actor.distance + effect.amount };
      return {
        players: replacePlayer(players, updated),
        outcome: { ...outcome, distanceDelta: outcome.distanceDelta + effect.amount }
      };
    }
    case 'drain': {
      const targets = resolveTargets(targeting ?? { type: 'opponent' }, actor, players);
      let updatedPlayers = players;
      for (const target of targets) {
        const updated = { ...target, distance: Math.max(0, target.distance - effect.amount) };
        updatedPlayers = replacePlayer(updatedPlayers, updated);
      }
      return { players: updatedPlayers, outcome };
    }
    case 'resource': {
      const updated = { ...actor, resources: gain(effect.amount, actor.resources) };
      return { players: replacePlayer(players, updated), outcome };
    }
    case 'applyStatus': {
      const targets = resolveTargets(targeting, actor, players);
      let updatedPlayers = players;
      for (const target of targets) {
        const updated = { ...target, statuses: applyStatus(target.statuses, effect.status) };
        updatedPlayers = replacePlayer(updatedPlayers, updated);
      }
      return {
        players: updatedPlayers,
        outcome: {
          ...outcome,
          statusesApplied: [...outcome.statusesApplied, effect.status.id]
        }
      };
    }
    case 'cleanse': {
      const targets = resolveTargets(targeting, actor, players);
      let updatedPlayers = players;
      for (const target of targets) {
        const updated = { ...target, statuses: cleanseByTag(target.statuses, effect.tag, effect.limit) };
        updatedPlayers = replacePlayer(updatedPlayers, updated);
      }
      return { players: updatedPlayers, outcome };
    }
    default:
      return { players, outcome };
  }
}

export function applyCardEffects(card: CardDefinition, actor: PlayerState, players: PlayerState[]): CardEffectResult {
  const baseOutcome: SlotOutcome = {
    playerId: actor.id,
    cardId: card.id,
    distanceDelta: 0,
    statusesApplied: []
  };

  let workingPlayers = players;
  let workingOutcome = baseOutcome;

  for (const effect of card.effects) {
    const result = applyEffect(effect, actor, workingPlayers, workingOutcome, card.targeting);
    workingPlayers = result.players;
    workingOutcome = result.outcome;
    const actorAfterEffect = workingPlayers.find((player) => player.id === actor.id);
    if (actorAfterEffect) {
      actor = actorAfterEffect;
    }
  }

  return { players: workingPlayers, outcome: workingOutcome };
}

export function spendResources(card: CardDefinition, actor: PlayerState, players: PlayerState[]): PlayerState[] {
  const updated = { ...actor, resources: spend(card.cost, actor.resources) };
  return replacePlayer(players, updated);
}
