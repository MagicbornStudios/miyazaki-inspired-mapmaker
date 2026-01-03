# Project Plan & Architecture

This document distills the current direction for the Cars and Magic MVP so future work can proceed without re-deriving requirements. It prioritizes tech stack, gameplay rules, asset strategy, and workstreams for agents to execute. The Git repo name is legacy; the project name is **Cars and Magic**.

## Tech Stack (non-optional foundation)
- **Monorepo/tooling:** pnpm workspaces, TypeScript, ESLint, Prettier, Vitest; Turbo optional for caching.
- **Client:** Next.js (App Router) + React, TailwindCSS, shadcn/ui + Radix UI, Zustand, zod, **Three.js** for rendering (greybox primitives first, replace with authored assets later); optional framer-motion/clsx/tailwind-merge/react-use.
- **Server:** Node.js + TypeScript, Colyseus, zod, nanoid.
- **Shared:** zod schemas + TS types shared via a package.
- **Deployment:** Render (separate services for web and server) with client retry UI for sleeping instances.

## Gameplay Model
- Four-turn races; each turn contains a **4-slot playline** per player.
- Server resolves slot-by-slot (1→4) deterministically and emits a `TurnSummary` composed of four `SlotSummary` beats.
- Timeout auto-fills remaining slots with a default `card_coast` (content-defined).
- Asset usage remains manifest-driven so client rendering can animate beats without guessing file paths.

## Repository Layout (target)
```
/apps
  /web         # Next.js + React overlay + Three.js scene renderer
  /server      # Colyseus authoritative server
/packages
  /shared      # zod schemas + shared TS types
  /game        # deterministic gameplay engine + tests
  /content     # TS-authored content modules + manifests and registry outputs
  /rendering   # Three.js scene, renderer bridge (no gameplay logic)
  /tools       # registry/codegen + audits
/assets
  /placeholders
  /production
```

## Asset & Content Pipeline
- All content references **asset keys**, not file paths; code resolves via `asset-manifest.json`.
- Placeholder assets guaranteed to exist; production art swaps through manifest updates.
- Assets are reusable primitives (UI frames, icons, VFX presets, track layers) rather than unique per card.
- Planned audits: verify referenced keys exist in the manifest and files are present; optional unused-key detection.

## Workstreams (concurrency-first)
- **B0 Repo bootstrap:** pnpm workspace, scripts, hello web+server, lint/test wiring.
- **W1 Shared contracts:** zod schemas for content + network, `PlayLine` length 4, `TurnSummary/SlotSummary`, asset key patterns.
- **W2 Rules engine:** slot-by-slot resolver with tests (mana spend, immobilize, auto-fill coast cards).
- **W3 Colyseus room:** message handlers for playline submit, timers, auto-fill, slot summary emission.
- **W4 Client UX:** Next routes for play/lobby/match, PlayLine UI (4 slots), lobby ready state, Zustand stores, networking wrapper.
- **W5 Assets/content:** asset taxonomy + placeholder manifest + starter content pack referencing keys, asset audit script.
- **W6 Rendering:** Three.js scene using greybox primitives (track, cars, effects), beat sequencer for slot summaries, and a rendering bridge keyed by manifest-provided asset URLs.
- **W7 Tooling:** `/dev/assets` preview, asset/content audits wired into scripts/CI.
- **W8 Deployment:** Render configs and client “waking server” experience.

## Architectural Rules
- Keep gameplay deterministic and free of rendering code; rendering should consume summaries/commands only.
- Use numeric identifiers generated via registries rather than ad-hoc string IDs; avoid string message names in runtime paths when possible.
- Prefer pure functions for systems; isolate side effects (networking, rendering, file IO) to boundaries.
- Validation at boundaries via zod; avoid unchecked `any`.

## Immediate Next Steps (suggested for agents)
1. Flesh out package scaffolding to match the target layout with minimal starter code per folder.
2. Add registry/codegen stubs in `packages/tools` to enforce numeric IDs and generate lookup tables once content arrives.
3. Author initial zod schemas for content + network messages (including `PlayLine`, `TurnSummary`, asset key patterns) in `packages/shared`.
4. Prepare starter manifests and placeholder asset taxonomy under `/assets/placeholders` with `asset-manifest.json` and a short `ASSET_GUIDE.md`.
5. Define root scripts (`dev`, `gen`, `audit`, `test`, `typecheck`, `lint`, `check`) to align with the planned workflows.
