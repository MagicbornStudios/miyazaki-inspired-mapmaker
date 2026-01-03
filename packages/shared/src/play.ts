import { z } from 'zod';
import { cardIdSchema, statusIdSchema } from './registry.js';

export const PLAYLINE_SLOT_COUNT = 4;

export const playSlotSchema = z.union([cardIdSchema, z.null()]);

export const playLineSchema = z.tuple([
  playSlotSchema,
  playSlotSchema,
  playSlotSchema,
  playSlotSchema
]);

const slotOutcomeSchema = z.object({
  playerId: z.string().min(1),
  cardId: playSlotSchema,
  statusesApplied: z.array(statusIdSchema).default([]),
  distanceDelta: z.number().default(0),
  notes: z.string().optional()
});

export const slotSummarySchema = z.object({
  slotIndex: z
    .number()
    .int()
    .min(0, 'Slot index starts at 0')
    .max(PLAYLINE_SLOT_COUNT - 1, `Slot index must be < ${PLAYLINE_SLOT_COUNT}`),
  outcomes: z.array(slotOutcomeSchema),
  tags: z.array(z.string()).default([])
});

export const turnSummarySchema = z.object({
  turn: z.number().int().min(1),
  slots: z.tuple([
    slotSummarySchema,
    slotSummarySchema,
    slotSummarySchema,
    slotSummarySchema
  ]),
  winnerId: z.string().optional()
});

export type PlaySlot = z.infer<typeof playSlotSchema>;
export type PlayLine = z.infer<typeof playLineSchema>;
export type SlotOutcome = z.infer<typeof slotOutcomeSchema>;
export type SlotSummary = z.infer<typeof slotSummarySchema>;
export type TurnSummary = z.infer<typeof turnSummarySchema>;
