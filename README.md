# Cars and Magic

Cars and Magic is being bootstrapped as a pnpm-based monorepo for a two-player racing card game inspired by cozy Ghibli aesthetics. The Git repo name is historical; treat **Cars and Magic** as the authoritative project name. The project is in early planning, so this README captures the authoritative context for agents and humans contributing to the repo.

## Vision
Build a lightweight online MVP where two players race across **four turns**. Each turn they arrange a **4-card playline** (slots 1–4), then the server resolves slot-by-slot and emits summaries the client can animate. Assets start as placeholders referenced through manifests so art can be swapped without code changes. The tech stack and plugin choices below are the **authoritative foundation** and should not be substituted without an explicit plan change.

## Tech Stack (authoritative)
The stack below is **non-optional** for the MVP; new tooling should be added only if it cleanly composes with these choices.

- **Monorepo / tooling:** pnpm workspaces, TypeScript everywhere, ESLint, Prettier, Vitest; Turbo recommended later for cached builds/tests.
- **Client:** Next.js (App Router) + React, TailwindCSS, shadcn/ui + Radix UI (Popover, Dialog, ScrollArea, DropdownMenu, Toast), Zustand for client state, zod for validation, Phaser 3 with selective phaser3-rex-plugins. Optional: framer-motion, clsx, tailwind-merge, react-use.
- **Server:** Node.js + TypeScript with Colyseus for authoritative rooms, zod for message validation, nanoid for lobby codes.
- **Shared contracts:** zod schemas + TypeScript types for content and networking shared via a package.
- **Deployment:** Render (one service for web, one for server) with client-side retry UX for sleeping instances.

## Current Repository State
- The repo is in **scaffolding** mode; app/package folders are not yet generated.
- Tooling is pinned to pnpm 9.11.0 with TypeScript, ESLint, Prettier, and Vitest installed at the root.
- Use this README + `docs/PROJECT_PLAN.md` + `AGENTS.md` as the authoritative guide until codegen/packages are created.

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

### Folder responsibilities (authoritative)
- `/apps/web`: Next.js routes for marketing/play/lobby/match, React overlay UI (shadcn/radix), Zustand stores, net client, and Phaser mount/bridge.
- `/apps/server`: Colyseus rooms, message handlers, timers, lobby state, and integration with deterministic gameplay package.
- `/packages/game`: Pure, testable gameplay systems (`resolveTurn`, `resolveSlot`, mana/status/distance systems) that never import rendering.
- `/packages/shared`: zod schemas + TS types for content/network, render commands, and numeric enums for protocol messages.
- `/packages/content`: TS-authored content definitions + manifests and generated registries keyed by stable IDs.
- `/packages/rendering`: Phaser DragStripScene + BeatSequencer + VfxDirector consuming render commands/asset resolvers (no gameplay decisions).
- `/packages/tools`: Registry/codegen CLI, audits (content ↔ assets), and any generators that output committed files.
- `/assets`: Placeholder and production media; `asset-manifest.json` maps asset keys → files; `ASSET_GUIDE.md` documents sizes/naming.

## Asset & Content Principles
- Content references **asset keys only**; code resolves keys via `asset-manifest.json`.
- Placeholder assets always exist; production art swaps through manifest updates.
- Assets are reusable primitives (UI frames, icons, VFX, track layers) rather than unique per card.
- Audits should verify referenced keys exist and files are present.
- Suggested manifest shape (example):

  ```json
  {
    "version": 1,
    "assets": {
      "ui.panel.default": { "path": "assets/placeholders/ui/panel.png", "type": "image" },
      "card.frame.common": { "path": "assets/placeholders/cards/frame_common.png", "type": "image" },
      "icon.tag.movement": { "path": "assets/placeholders/ui/icon_movement.png", "type": "image" },
      "vfx.smoke.01": { "path": "assets/placeholders/vfx/smoke_01.png", "type": "image" },
      "track.bg.01": { "path": "assets/placeholders/tracks/bg_01.png", "type": "image" }
    }
  }
  ```

- Asset categories to plan for early: UI primitives, card frames/icons/art, track layers/cars, and reusable VFX presets.

## Workstreams (concurrency-friendly)
- **B0 Repo bootstrap:** pnpm workspace, scripts, hello web+server, lint/test wiring. Outcome: `pnpm dev` runs both targets.
- **W1 Shared contracts:** zod schemas for content + network, `PlayLine` fixed length 4, `TurnSummary/SlotSummary` payloads, asset key patterns.
- **W2 Rules engine:** deterministic slot-by-slot resolution with tests (mana, immobilize, auto-fill). Outcome: `resolveTurn` + fixtures.
- **W3 Colyseus room:** playline submission, timers, auto-fill, emit summaries. Outcome: room emits snapshots + turn events.
- **W4 Client UX:** Next routes, lobby/match flows, PlayLine UI, Zustand state, networking wrapper. Outcome: two tabs can submit playlines.
- **W5 Assets/content:** asset taxonomy + placeholder manifest, starter content pack using keys, asset audit script. Outcome: manifest + placeholders.
- **W6 Rendering:** Phaser scene + VFX director consuming slot summaries. Outcome: 4-beat animations per turn via render commands.
- **W7 Tooling:** `/dev/assets` preview + asset/content audits wired into `pnpm check` once available.
- **W8 Deployment:** Render configs and “server waking” UX with retry messaging.

### Ordered execution plan (what to do next)
1. **Scaffold folders** matching the planned structure, including `packages/tools` stubs for registry/codegen.
2. **Implement registry + lockfiles** (numeric IDs for Card/Asset/VFX/etc.) and add `pnpm gen` to emit generated constants.
3. **Author shared schemas** (`packages/shared`) for content + network messages (playline of length 4, slot/turn summaries, asset keys).
4. **Stand up gameplay systems** (`packages/game`) with `resolveTurn` tests covering mana flow, immobilize, and coast auto-fill.
5. **Wire Colyseus room** (`apps/server`) to accept `SUBMIT_PLAYLINE`, run the resolver, and emit slot-based summaries.
6. **Build client overlay** (`apps/web`) with PlayLine UI, hand display, HUD, networking wrapper, and Phaser bridge stub.
7. **Establish asset pipeline** (`packages/content` + `/assets`): placeholder manifest, `ASSET_GUIDE.md`, and audit script.
8. **Replace Phaser stub** with DragStripScene + BeatSequencer + VfxDirector consuming render commands and manifest-driven assets.
9. **Add dev tooling + deploy hooks**: `/dev/assets` preview, `pnpm check` wiring, Render configs, and client retry UX.

## Data Flow & Messaging (planned)
- **Client → Server:** `SUBMIT_PLAYLINE { cards: [cardId, cardId, cardId, cardId] }` using numeric IDs and registry-generated message codes.
- **Server → Client:** `STATE_SNAPSHOT` for lobby/match state and `TURN_RESOLVE` events carrying `TurnSummary` with four `SlotSummary` beats.
- **React ↔ Phaser:** React converts `TurnSummary` into typed render commands (TurnStart → SlotResolve x4 → TurnEnd) consumed by a beat sequencer.

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
