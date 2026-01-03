# Agent Guidance

This file defines expectations for any automated or human contributor working in this repository. Its scope covers the entire repo unless a more specific `AGENTS.md` is added in a subdirectory.

## Workflow
- Use **pnpm** for all package management and workspace commands.
- Follow the scripts defined in `package.json` (or README) when running dev, lint, test, typecheck, or audit tasks.
- Keep generated files in source control once codegen tooling exists; avoid hand-editing generated outputs.
- Prefer smaller, testable modules over large monoliths—especially in gameplay and rendering code.

## Architecture Expectations
- Honor the monorepo layout described in `README.md`: separate gameplay (`packages/game`), content (`packages/content`), rendering (`packages/rendering`), shared contracts (`packages/shared`), and tools (`packages/tools`).
- Keep Phaser/rendering free of gameplay logic; the server and gameplay packages own deterministic resolution.
- Use zod for validation at boundaries; avoid unchecked `any` types.
- Use numeric identifiers and registry/codegen flows instead of hardcoded string message names where feasible.

## Coding Style
- Use TypeScript with ES modules.
- Maintain lint/format standards via ESLint and Prettier configurations in the repo.
- Favor pure functions and clear side-effect boundaries.
- Do not wrap imports in try/catch; fix the root cause instead.

## Assets & Content
- Reference assets via manifest keys and resolvers; never hardcode file paths in gameplay logic.
- Ensure placeholders exist for all referenced assets; add audits when adding new content.

## Documentation
- Keep README and supporting docs in sync with architectural decisions and gameplay rules (4-turn races, 4-card playlines, slot-by-slot resolution).
- When adding new areas of the repo, include brief README/AGENTS guidance in that directory to explain purpose, constraints, and any special instructions.
