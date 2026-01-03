import type { PlayerState, Targeting } from './types.js';

export function resolveTargets(targeting: Targeting | undefined, actor: PlayerState, players: PlayerState[]): PlayerState[] {
  const resolved = targeting ?? { type: 'opponent' };
  switch (resolved.type) {
    case 'self':
      return [actor];
    case 'all':
      return players;
    case 'player': {
      const target = players.find((player) => player.id === resolved.playerId);
      return target ? [target] : [];
    }
    case 'opponent':
    default:
      return players.filter((player) => player.id !== actor.id);
  }
}
