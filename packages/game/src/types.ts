import type { PlayLine, SlotOutcome } from '@cars-and-magic/shared';

export interface ResourcePool {
  current: number;
  max: number;
}

export interface StatusState {
  id: number;
  duration: number;
  tags?: string[];
}

export type Targeting =
  | { type: 'self' }
  | { type: 'opponent' }
  | { type: 'all' }
  | { type: 'player'; playerId: string };

export type Effect =
  | { type: 'move'; amount: number }
  | { type: 'drain'; amount: number }
  | { type: 'resource'; amount: number }
  | { type: 'applyStatus'; status: StatusState }
  | { type: 'cleanse'; tag: string; limit?: number };

export interface CardDefinition {
  id: number;
  cost: number;
  targeting?: Targeting;
  effects: Effect[];
  tags?: string[];
}

export type CardLibrary = Record<number, CardDefinition>;

export interface PlayerState {
  id: string;
  distance: number;
  playline: PlayLine;
  resources: ResourcePool;
  statuses: StatusState[];
}

export interface SlotResolutionResult {
  players: PlayerState[];
  outcomes: SlotOutcome[];
}

export interface ResolveContext {
  turn: number;
  players: PlayerState[];
  cardLibrary: CardLibrary;
  defaultCardId?: number;
}
