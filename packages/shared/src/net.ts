import { registryLookups } from '@cars-and-magic/registry';
import { z } from 'zod';
import { cardIdSchema, carIdSchema, deckIdSchema, statusIdSchema } from './registry.js';
import { playLineSchema, turnSummarySchema } from './play.js';

function requireNetCode(key: string): number {
  const code = registryLookups.byKey.Net[key];
  if (typeof code !== 'number') {
    throw new Error(`Missing Net registry entry for ${key}`);
  }
  return code;
}

export const netMessageCodes = {
  submitPlayLine: requireNetCode('submit_playline'),
  stateSnapshot: requireNetCode('state_snapshot'),
  turnResolved: requireNetCode('turn_resolved')
} as const;

const playerStateSchema = z.object({
  id: z.string().min(1),
  hand: z.array(cardIdSchema),
  playLine: playLineSchema,
  statuses: z.array(statusIdSchema).default([]),
  carId: carIdSchema.optional(),
  deckId: deckIdSchema.optional(),
  distance: z.number().default(0)
});

export const submitPlayLineMessageSchema = z.object({
  code: z.literal(netMessageCodes.submitPlayLine),
  payload: z.object({
    playLine: playLineSchema
  })
});

export const stateSnapshotMessageSchema = z.object({
  code: z.literal(netMessageCodes.stateSnapshot),
  payload: z.object({
    turn: z.number().int().min(1),
    players: z.array(playerStateSchema),
    expiresAt: z.string().datetime().optional()
  })
});

export const turnResolvedMessageSchema = z.object({
  code: z.literal(netMessageCodes.turnResolved),
  payload: z.object({
    turnSummary: turnSummarySchema,
    nextTurnAt: z.string().datetime().optional()
  })
});

export const netMessageSchema = z.discriminatedUnion('code', [
  submitPlayLineMessageSchema,
  stateSnapshotMessageSchema,
  turnResolvedMessageSchema
]);

export type PlayerState = z.infer<typeof playerStateSchema>;
export type SubmitPlayLineMessage = z.infer<typeof submitPlayLineMessageSchema>;
export type StateSnapshotMessage = z.infer<typeof stateSnapshotMessageSchema>;
export type TurnResolvedMessage = z.infer<typeof turnResolvedMessageSchema>;
export type NetMessage = z.infer<typeof netMessageSchema>;
