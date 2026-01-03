import { registriesByDomain, type RegistryDomain } from '@cars-and-magic/registry';
import { z } from 'zod';

export const ASSET_KEY_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export const assetKeySchema = z
  .string()
  .min(1, 'Asset keys cannot be empty')
  .regex(ASSET_KEY_PATTERN, 'Asset keys must use dot/slug notation (e.g., ui.panel.default)');

export const contentKeySchema = assetKeySchema;

export function registryIdSchema<TDomain extends RegistryDomain>(domain: TDomain) {
  const range = registriesByDomain[domain].range;
  return z
    .number()
    .int()
    .gte(range.start, `${domain} IDs must be >= ${range.start}`)
    .lte(range.end, `${domain} IDs must be <= ${range.end}`);
}

export const cardIdSchema = registryIdSchema('Card');
export const statusIdSchema = registryIdSchema('Status');
export const carIdSchema = registryIdSchema('Car');
export const deckIdSchema = registryIdSchema('Deck');
export const trackIdSchema = registryIdSchema('Track');
