# Packages

Workspace libraries shared across the applications. Each package owns a focused slice of functionality to keep gameplay, content, rendering, and tooling concerns isolated.

- `shared`: contracts, schemas, and utilities used across runtime targets.
- `game`: deterministic gameplay logic and resolution systems.
- `content`: authored content, definitions, and registries that feed the game engine.
- `rendering`: client-side rendering layers and adapters (e.g., Phaser integrations).
- `tools`: developer tooling, pipelines, and codegen utilities.
- `registry`: manifest and asset registry helpers.
