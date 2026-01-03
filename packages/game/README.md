# Game

Deterministic gameplay rules, resolution systems, and simulation code. Avoid coupling to rendering or transport layers to keep logic portable.

## Modules
- `resources.ts`: Pure helpers for spending and gaining resource pools.
- `status.ts`: Status lifecycle helpers (tick, apply, cleanse) that operate without side effects.
- `effects.ts`: Card effect appliers that update player snapshots without mutating inputs.
- `targeting.ts`: Shared targeting resolver used by effects.
- `resolve.ts`: Orchestrators for per-slot and per-turn resolution of four-slot playlines.
