export type GreyboxAssetDescriptor = {
  kind: 'primitive';
  primitive: 'track' | 'car' | 'effect';
  color: string;
  description: string;
};

export type GreyboxAssetManifest = {
  version: 1;
  baseUrl?: string;
  assets: Record<string, GreyboxAssetDescriptor>;
};

export function createGreyboxAssetManifest(baseUrl?: string): GreyboxAssetManifest {
  return {
    version: 1,
    baseUrl,
    assets: {
      'greybox.track': {
        kind: 'primitive',
        primitive: 'track',
        color: '#94a3b8',
        description: 'Rendered as a simple grey ribbon; clients can swap with real track assets when available.'
      },
      'greybox.car': {
        kind: 'primitive',
        primitive: 'car',
        color: '#a3b18a',
        description: 'Placeholder car capsule used until authored models land.'
      },
      'greybox.vfx.smoke': {
        kind: 'primitive',
        primitive: 'effect',
        color: '#cbd5e1',
        description: 'Simple quad-based smoke used while VFX sprites are still in production.'
      }
    }
  };
}
