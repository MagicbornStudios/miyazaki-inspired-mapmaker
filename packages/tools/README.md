# Tools

Developer tooling, build pipelines, and code generation utilities that support the monorepo. Use this space for scripts that improve iteration and quality.

## Registry lock CLI

The registry helper CLI manages deterministic ID allocations for each registry domain. Usage examples:

- List current allocations for a domain:

  ```bash
  pnpm registry list Card
  ```

- Reserve the next available ID for a new key:

  ```bash
  pnpm registry add VFX spark-burst
  ```

- Rename or retire entries while keeping the numeric ID stable:

  ```bash
  pnpm registry rename Card 1000 fireball
  pnpm registry retire Card 1000 deprecated art swap
  ```

Supported domains and their ranges:

- Card: 1000-1999
- Asset: 2000-2999
- VFX: 3000-3999
- Status: 4000-4999
- Car: 5000-5999
- Deck: 6000-6999
- Track: 7000-7999
- Net: 8000-8999
