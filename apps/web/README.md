# Web App

Next.js App Router frontend powered by Tailwind CSS, Radix primitives, and shared workspace tooling.

## Scripts

Run commands from the repository root with pnpm:

- `pnpm --filter @cars-and-magic/web dev` – start the development server.
- `pnpm --filter @cars-and-magic/web build` – create an optimized production build.
- `pnpm --filter @cars-and-magic/web start` – run the production server after building.
- `pnpm --filter @cars-and-magic/web lint` – lint the project with Next.js rules.

## Notes

- Styling is driven by Tailwind and a small Radix-based button component. Extend patterns in `components/ui`.
- App Router pages live under `app/` and share a common shell with navigation and footer.
- Tailwind v4 uses `@source` entries in `app/globals.css` to control class scanning; add new glob patterns there when introducing directories.
