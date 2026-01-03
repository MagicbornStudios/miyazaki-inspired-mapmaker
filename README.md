# Cars and Magic

Cars and Magic is being bootstrapped as a pnpm-based monorepo for a two-player racing card game inspired by cozy Ghibli aesthetics. The Git repo name is historical; treat **Cars and Magic** as the authoritative project name. The project is in early planning, so this README captures the authoritative context for agents and humans contributing to the repo.

## Vision
Build a lightweight online MVP where two players race across four turns. Each turn they arrange a **4-card playline** (slots 1–4), then the server resolves slot-by-slot and emits summaries the client can animate. Assets start as placeholders referenced through manifests so art can be swapped without code changes.

## Tech Stack (authoritative)
- **Monorepo tooling:** pnpm workspaces, TypeScript everywhere, ESLint, Prettier, Vitest; Turbo optional later for caching.
- **Client:** Next.js (App Router) + React, TailwindCSS, shadcn/ui + Radix UI, Zustand for client state, zod for validation, Phaser 3 with selective phaser3-rex-plugins, optional framer-motion/clsx/tailwind-merge for ergonomics.
- **Server:** Node.js + TypeScript with Colyseus for authoritative rooms, zod for message validation, nanoid for lobby codes.
- **Shared:** zod schemas + TypeScript types for content and networking shared via a package.
- **Deployment:** Render (one service for web, one for server) with client-side retry UX for sleeping instances.

## Gameplay Pillars
- Races last **4 turns**.
- Each turn players choose **4 ordered cards** (playline slots 1→4).
- Resolution is deterministic: resolve slot 1 for both players, then slot 2, 3, 4.
- Server emits `TurnSummary` with four `SlotSummary` beats so the client can animate without guessing.
- Timeout auto-fills empty slots with a default “coast” card.

## Project Structure (planned)
```
/apps
  /web           # Next.js + React overlay + Phaser scene renderer
  /server        # Colyseus authoritative server
/packages
  /shared        # zod schemas + shared TS types
  /game          # deterministic gameplay engine and tests
  /content       # content pack (cards/cars/status/track/decks) + manifests
  /rendering     # Phaser scene + VFX director (no game logic)
  /tools         # codegen, audits, registry management
/assets
  /placeholders  # guaranteed placeholder pack
  /production    # real art replaces placeholders over time
```

## Asset & Content Principles
- Content references **asset keys only**; code resolves keys via `asset-manifest.json`.
- Placeholder assets always exist; production art swaps through manifest updates.
- Assets are reusable primitives (UI frames, icons, VFX, track layers) rather than unique per card.
- Audits should verify referenced keys exist and files are present.

## Workstreams (concurrency-friendly)
- **B0 Repo bootstrap:** pnpm workspace, scripts, hello web+server, lint/test wiring.
- **W1 Shared contracts:** zod schemas for content + network, `PlayLine` fixed length 4, `TurnSummary/SlotSummary` payloads, asset key patterns.
- **W2 Rules engine:** deterministic slot-by-slot resolution with tests (mana, immobilize, auto-fill).
- **W3 Colyseus room:** playline submission, timers, auto-fill, emit summaries.
- **W4 Client UX:** Next routes, lobby/match flows, PlayLine UI, Zustand state, networking wrapper.
- **W5 Assets/content:** asset taxonomy + placeholder manifest, starter content pack using keys, asset audit script.
- **W6 Rendering:** Phaser scene + VFX director consuming slot summaries.
- **W7 Tooling:** `/dev/assets` preview + asset/content audits.
- **W8 Deployment:** Render configs and “server waking” UX.

## Coding Conventions
- Use TypeScript; prefer pure functions in gameplay packages and keep rendering free of gameplay logic.
- Keep identifiers numeric via generated registries; avoid hardcoded string message names where possible.
- Scripts (planned): `pnpm dev`, `pnpm gen`, `pnpm audit`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm check`.
- Placeholder-first: never block on art; wire manifests and audits to keep asset references stable.

## Getting Started
Tooling is bootstrapped with pnpm. Once apps/packages land, you can:
1. Install: `pnpm install`
2. Generate codegen once content/registry exists: `pnpm gen`
3. Run all checks: `pnpm check`

Until the codebase fills in, treat this README and `AGENTS.md` as the source of truth for architecture and priorities.
