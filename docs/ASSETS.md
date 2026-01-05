# Assets, registry, and runtime placeholders

This project keeps asset identifiers in the shared registry while the web client resolves those identifiers into renderable placeholders. The goal is to avoid shipping binary art while still letting gameplay and content reference stable asset keys.

## How the pieces fit together

1. **Registry IDs and keys**: the `packages/registry` package reserves ID ranges for the `Asset` domain. Asset keys are expected to match `assetKeySchema` from `@cars-and-magic/shared` (e.g. `ui.panel.default`).
2. **Manifest descriptors**: `asset-manifest.json` maps asset keys to lightweight primitive descriptors and provides defaults for each asset type (`model`, `texture`, and `ui`). These descriptors are the only source of rendering info; no binaries are committed.
3. **Runtime resolution**: the web client loads the manifest through `apps/web/lib/assets/resolver.ts` to turn either an asset key or a registry ID into a `ResolvedAsset` containing the descriptor and the chosen fallback source.

## Manifest shape

```jsonc
{
  "defaults": {
    "model": { "kind": "primitive", "shape": "box", "color": "#9ca3af" },
    "texture": { "kind": "primitive", "shape": "plane", "color": "#9ca3af" },
    "ui": { "kind": "primitive", "shape": "rounded-rect", "color": "#d1d5db" }
  },
  "assets": {
    "ui.panel.default": {
      "type": "ui",
      "descriptor": { "kind": "primitive", "shape": "rounded-rect", "color": "#cbd5e1" }
    },
    "world.prototype.tree": {
      "type": "model",
      "descriptor": { "kind": "primitive", "shape": "box", "color": "#22c55e" }
    },
    "world.prototype.ground": {
      "type": "texture",
      "descriptor": { "kind": "primitive", "shape": "plane", "color": "#86efac" }
    }
  }
}
```

Add new entries using registry-friendly keys and a primitive descriptor. If an entry is missing, the resolver falls back to the type-specific default.

## Resolver usage examples

```ts
import {
  defaultAssetPlaceholder,
  resolveAssetByKey,
  resolveAssetByRegistryId
} from '@/lib/assets/resolver';

// Use a manifest-backed UI asset
const uiPanel = resolveAssetByKey('ui.panel.default');
// -> { key: 'ui.panel.default', type: 'ui', descriptor: { kind: 'primitive', ... }, source: 'manifest' }

// Request an unknown key but supply the intended type to pick the right default
const missingTree = resolveAssetByKey('world.tree.oak', 'model');
// -> { key: 'world.tree.oak', type: 'model', descriptor: defaults.model, source: 'default' }

// Resolve from a registry ID (works once the Asset registry has populated entries)
const fromRegistry = resolveAssetByRegistryId(2000, 'texture');
// -> uses registryLookups to find the key and then resolves via the manifest

// Access the shared fallback directly when you just need "some" placeholder
const placeholder = defaultAssetPlaceholder; // defaults to the texture descriptor
```

The resolver validates keys with `assetKeySchema` so mistakes are caught early while still allowing graceful fallbacks. Registry IDs for the `Asset` domain route through the same manifest, keeping gameplay/content references decoupled from the render-time descriptors.
