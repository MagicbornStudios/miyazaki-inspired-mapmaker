import { registryLookups } from '@cars-and-magic/registry';
import { assetKeySchema } from '@cars-and-magic/shared';
import { z } from 'zod';
import manifestJson from '../../../../asset-manifest.json';

const primitiveAssetDescriptorSchema = z.object({
  kind: z.literal('primitive'),
  shape: z.enum(['box', 'plane', 'rounded-rect']),
  color: z.string().optional(),
});

const assetManifestSchema = z.object({
  defaults: z.object({
    model: primitiveAssetDescriptorSchema,
    texture: primitiveAssetDescriptorSchema,
    ui: primitiveAssetDescriptorSchema,
  }),
  assets: z
    .record(
      assetKeySchema,
      z.object({
        type: z.enum(['model', 'texture', 'ui']),
        descriptor: primitiveAssetDescriptorSchema,
      })
    )
    .default({}),
});

const manifest = assetManifestSchema.parse(manifestJson);

export type PrimitiveAssetDescriptor = z.infer<typeof primitiveAssetDescriptorSchema>;
export type AssetDescriptor = PrimitiveAssetDescriptor;
export type AssetType = keyof typeof manifest.defaults;

export type ResolvedAsset = {
  key: string;
  type: AssetType;
  descriptor: AssetDescriptor;
  source: 'manifest' | 'default';
  registryId?: number;
};

const DEFAULT_ASSET_TYPE: AssetType = 'texture';

export const assetManifest = manifest;
export const defaultAssetPlaceholder = manifest.defaults[DEFAULT_ASSET_TYPE];

function pickDefaultDescriptor(type?: AssetType): AssetDescriptor {
  const preferredType = type ?? DEFAULT_ASSET_TYPE;
  return manifest.defaults[preferredType] ?? manifest.defaults[DEFAULT_ASSET_TYPE];
}

function normalizeAssetKey(rawKey: string): string | null {
  const parsed = assetKeySchema.safeParse(rawKey);
  return parsed.success ? parsed.data : null;
}

export function resolveAssetByKey(assetKey: string, hintType?: AssetType): ResolvedAsset {
  const normalizedKey = normalizeAssetKey(assetKey);
  const manifestEntry = normalizedKey ? manifest.assets[normalizedKey] : undefined;
  const fallbackType = manifestEntry?.type ?? hintType ?? DEFAULT_ASSET_TYPE;

  if (manifestEntry) {
    return {
      key: normalizedKey,
      type: manifestEntry.type,
      descriptor: manifestEntry.descriptor,
      source: 'manifest',
    } satisfies ResolvedAsset;
  }

  return {
    key: normalizedKey ?? assetKey,
    type: fallbackType,
    descriptor: pickDefaultDescriptor(fallbackType),
    source: 'default',
  } satisfies ResolvedAsset;
}

export function resolveAssetByRegistryId(assetId: number, hintType?: AssetType): ResolvedAsset {
  const lookup = registryLookups.byId[assetId];

  if (lookup?.domain === 'Asset') {
    return {
      ...resolveAssetByKey(lookup.key, hintType),
      registryId: assetId,
    } satisfies ResolvedAsset;
  }

  return {
    key: lookup?.key ?? `asset:${assetId}`,
    type: hintType ?? DEFAULT_ASSET_TYPE,
    descriptor: pickDefaultDescriptor(hintType),
    source: 'default',
    registryId: lookup ? assetId : undefined,
  } satisfies ResolvedAsset;
}
