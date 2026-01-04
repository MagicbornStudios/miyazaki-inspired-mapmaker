# Registry

Manifest and asset registry helpers for coordinating content references across the project. Use this package to centralize how identifiers map to assets and metadata.

## Locks

Deterministic ID reservations for each registry domain live in `locks/*.json`. Use the `pnpm registry` commands from `packages/tools` to allocate, rename, or retire IDs without breaking ranges:

- Card: 1000-1999
- Asset: 2000-2999
- VFX: 3000-3999
- Status: 4000-4999
- Car: 5000-5999
- Deck: 6000-6999
- Track: 7000-7999
- Net: 8000-8999
