# Server

Authoritative race room server powered by [Colyseus](https://colyseus.io/). The entrypoint registers the shared
`netRoomNames.race` room that accepts players, collects playlines, resolves turns on a timer, and broadcasts state snapshots
using the shared network schemas.

### Race flow

- Each player joins with a placeholder card that is used to autofill empty slots.
- Players toggle readiness via the `ready` message; a turn starts once the server has enough ready players.
- Submitted playlines are validated against `submitPlayLineMessageSchema` before they are accepted.
- At the deadline, the room auto-fills any empty slots, computes per-slot summaries, broadcasts a turn resolution payload, and
  schedules the next turn.

## Development

Run the server locally with pnpm and the workspace script:

```bash
pnpm --filter @cars-and-magic/server dev
```

The service listens on port `2567` by default; override with the `PORT` environment variable. Build and production entrypoints
mirror what Render expects:

```bash
pnpm --filter @cars-and-magic/server build
pnpm --filter @cars-and-magic/server start
```

### Render and greybox assets

- `.env.example` at the repo root lists the Render-specific environment variables expected by this service. Copy it to `.env`
  locally or configure values in the Render dashboard.
- `GET /healthz` returns a simple `ok` string for health checks.
- `GET /assets/greybox-manifest.json` returns a JSON manifest of greybox primitives (track, car capsule, smoke effect) so the
  client can render placeholders without bundling assets on the server. No asset files are required server-side.
