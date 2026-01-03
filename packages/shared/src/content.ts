import { z } from 'zod';
import {
  assetKeySchema,
  cardIdSchema,
  contentKeySchema,
  deckIdSchema,
  registryIdSchema,
  statusIdSchema,
  trackIdSchema
} from './registry.js';

const baseContentSchema = <T extends 'Card' | 'Status' | 'Car' | 'Deck' | 'Track'>(domain: T) =>
  z.object({
    id: registryIdSchema(domain),
    key: contentKeySchema,
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    iconAsset: assetKeySchema.optional(),
    artAsset: assetKeySchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional()
  });

export const cardDefinitionSchema = baseContentSchema('Card').extend({
  cost: z.number().int().nonnegative().default(0),
  tags: z.array(z.string().min(1)).default([])
});

export const statusDefinitionSchema = baseContentSchema('Status').extend({
  maxStacks: z.number().int().positive().optional(),
  duration: z.number().int().nonnegative().optional()
});

export const carDefinitionSchema = baseContentSchema('Car').extend({
  acceleration: z.number().nonnegative().optional(),
  handling: z.number().nonnegative().optional(),
  topSpeed: z.number().nonnegative().optional()
});

export const deckDefinitionSchema = baseContentSchema('Deck').extend({
  cards: z.array(cardIdSchema).min(1, 'Decks must reference at least one card')
});

export const trackDefinitionSchema = baseContentSchema('Track').extend({
  length: z.number().int().positive().optional(),
  laps: z.number().int().positive().optional(),
  featuredStatuses: z.array(statusIdSchema).default([]),
  featuredDecks: z.array(deckIdSchema).default([])
});

export const contentPackSchema = z.object({
  cards: z.array(cardDefinitionSchema).default([]),
  statuses: z.array(statusDefinitionSchema).default([]),
  cars: z.array(carDefinitionSchema).default([]),
  decks: z.array(deckDefinitionSchema).default([]),
  tracks: z.array(trackDefinitionSchema).default([])
});

export type CardDefinition = z.infer<typeof cardDefinitionSchema>;
export type StatusDefinition = z.infer<typeof statusDefinitionSchema>;
export type CarDefinition = z.infer<typeof carDefinitionSchema>;
export type DeckDefinition = z.infer<typeof deckDefinitionSchema>;
export type TrackDefinition = z.infer<typeof trackDefinitionSchema>;
export type ContentPack = z.infer<typeof contentPackSchema>;
