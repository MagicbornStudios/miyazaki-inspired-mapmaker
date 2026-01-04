#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const DOMAIN_NAMES = ['Card', 'Asset', 'VFX', 'Status', 'Car', 'Deck', 'Track', 'Net'] as const;
type RegistryDomain = (typeof DOMAIN_NAMES)[number];

const DOMAIN_RANGES: Record<RegistryDomain, { start: number; end: number }> = {
  Card: { start: 1000, end: 1999 },
  Asset: { start: 2000, end: 2999 },
  VFX: { start: 3000, end: 3999 },
  Status: { start: 4000, end: 4999 },
  Car: { start: 5000, end: 5999 },
  Deck: { start: 6000, end: 6999 },
  Track: { start: 7000, end: 7999 },
  Net: { start: 8000, end: 8999 }
};

const domainSchema = z.enum(DOMAIN_NAMES);
const registryEntrySchema = z.object({
  id: z.number().int().nonnegative(),
  key: z.string().trim().min(1),
  status: z.enum(['active', 'retired']),
  notes: z.string().optional()
});

const registryLockSchema = z.object({
  domain: domainSchema,
  range: z.object({ start: z.number().int(), end: z.number().int() }),
  entries: z.array(registryEntrySchema)
});

type RegistryEntry = z.infer<typeof registryEntrySchema>;
type RegistryLock = z.infer<typeof registryLockSchema>;

const SUPPORTED_DOMAINS = domainSchema.options as RegistryDomain[];

const moduleDir = path.dirname(fileURLToPath(new URL(import.meta.url)));
const repoRoot = path.resolve(moduleDir, '..', '..', '..');
const locksDir = path.join(repoRoot, 'packages', 'registry', 'locks');

function usage(): never {
  console.error(`Usage: pnpm --filter @cars-and-magic/tools registry <command> [args]\n\nCommands:\n  list <domain>                         List entries for a domain\n  add <domain> <key>                    Reserve the next ID for a key\n  rename <domain> <id> <newKey>         Rename an existing key\n  retire <domain> <id> [reason]         Mark an entry as retired\n\nDomains: ${SUPPORTED_DOMAINS.join(', ')}`);
  process.exit(1);
}

function parseDomain(value: string | undefined): RegistryDomain {
  if (!value || !SUPPORTED_DOMAINS.includes(value)) {
    console.error(`Unknown or missing domain: ${value ?? 'undefined'}`);
    usage();
  }
  return value as RegistryDomain;
}

function parseId(idArg: string | undefined): number {
  if (!idArg) {
    console.error('Missing ID argument.');
    usage();
  }

  const id = Number.parseInt(idArg, 10);
  if (Number.isNaN(id)) {
    throw new Error(`Invalid ID: ${idArg}`);
  }
  return id;
}

async function ensureDirExists() {
  await mkdir(locksDir, { recursive: true });
}

async function loadLock(domain: RegistryDomain): Promise<RegistryLock> {
  const lockPath = getLockPath(domain);
  const expectedRange = DOMAIN_RANGES[domain];

  try {
    const contents = await readFile(lockPath, 'utf8');
    return parseAndValidateLock(contents, domain, expectedRange);
  } catch (error: unknown) {
    if (isMissingFileError(error)) {
      return { domain, range: expectedRange, entries: [] };
    }

    throw error;
  }
}

function parseAndValidateLock(
  raw: string,
  domain: RegistryDomain,
  expectedRange: { start: number; end: number }
): RegistryLock {
  const parsed = registryLockSchema.parse(JSON.parse(raw));

  if (parsed.domain !== domain) {
    throw new Error(`Lock domain mismatch: expected ${domain} but found ${parsed.domain}`);
  }

  if (parsed.range.start !== expectedRange.start || parsed.range.end !== expectedRange.end) {
    throw new Error(`Lock range mismatch for ${domain}. Expected ${expectedRange.start}-${expectedRange.end}.`);
  }

  const seenIds = new Set<number>();
  const activeKeys = new Set<string>();

  for (const entry of parsed.entries) {
    assertIdWithinRange(entry.id, parsed.range, parsed.domain);

    if (seenIds.has(entry.id)) {
      throw new Error(`Duplicate ID ${entry.id} in ${parsed.domain} lock.`);
    }
    seenIds.add(entry.id);

    if (entry.status === 'active') {
      if (activeKeys.has(entry.key)) {
        throw new Error(`Duplicate active key '${entry.key}' in ${parsed.domain} lock.`);
      }
      activeKeys.add(entry.key);
    }
  }

  parsed.entries.sort((a, b) => a.id - b.id);
  return parsed;
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT');
}

function getLockPath(domain: RegistryDomain) {
  return path.join(locksDir, `${domain}.json`);
}

async function persistLock(lock: RegistryLock) {
  await ensureDirExists();
  const sorted = {
    ...lock,
    entries: [...lock.entries].sort((a, b) => a.id - b.id)
  } satisfies RegistryLock;

  await writeFile(getLockPath(lock.domain), `${JSON.stringify(sorted, null, 2)}\n`);
}

function nextId(lock: RegistryLock): number {
  const taken = new Set(lock.entries.map((entry) => entry.id));
  for (let candidate = lock.range.start; candidate <= lock.range.end; candidate += 1) {
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No IDs remaining in range ${lock.range.start}-${lock.range.end} for ${lock.domain}`);
}

function assertIdWithinRange(id: number, range: { start: number; end: number }, domain: RegistryDomain) {
  if (id < range.start || id > range.end) {
    throw new Error(`ID ${id} is outside the reserved ${domain} range ${range.start}-${range.end}.`);
  }
}

function findEntry(lock: RegistryLock, id: number): RegistryEntry {
  const entry = lock.entries.find((item) => item.id === id);
  if (!entry) {
    throw new Error(`No entry found for ID ${id} in ${lock.domain}`);
  }
  return entry;
}

function assertUniqueKey(lock: RegistryLock, key: string) {
  const existing = lock.entries.find((entry) => entry.key === key && entry.status === 'active');
  if (existing) {
    throw new Error(`Key '${key}' is already active with ID ${existing.id}`);
  }
}

function normalizeKey(key: string): string {
  const normalized = key.trim();
  if (!normalized) {
    throw new Error('Key cannot be empty.');
  }
  return normalized;
}

function formatEntry(entry: RegistryEntry): string {
  const suffix = entry.status === 'retired' && entry.notes ? ` (notes: ${entry.notes})` : entry.status === 'retired' ? ' (retired)' : '';
  return `${entry.id}: ${entry.key}${suffix}`;
}

async function list(domainArg: string | undefined) {
  const domain = parseDomain(domainArg);
  const lock = await loadLock(domain);

  console.log(`${domain} IDs ${lock.range.start}-${lock.range.end}`);
  if (lock.entries.length === 0) {
    console.log('No allocations yet.');
    return;
  }

  for (const entry of lock.entries) {
    console.log(formatEntry(entry));
  }
}

async function add(domainArg: string | undefined, key: string | undefined) {
  if (!key) {
    console.error('Missing key to add.');
    usage();
  }

  const domain = parseDomain(domainArg);
  const lock = await loadLock(domain);

  const normalizedKey = normalizeKey(key);

  assertUniqueKey(lock, normalizedKey);

  const id = nextId(lock);
  lock.entries.push({ id, key: normalizedKey, status: 'active' });
  await persistLock(lock);
  console.log(`Reserved ${domain} ID ${id} for key '${normalizedKey}'.`);
}

async function rename(domainArg: string | undefined, idArg: string | undefined, newKey: string | undefined) {
  if (!idArg || !newKey) {
    console.error('Rename requires an ID and new key.');
    usage();
  }

  const id = parseId(idArg);
  const domain = parseDomain(domainArg);
  const lock = await loadLock(domain);

  assertIdWithinRange(id, lock.range, lock.domain);

  const normalizedKey = normalizeKey(newKey);
  assertUniqueKey(lock, normalizedKey);
  const entry = findEntry(lock, id);
  if (entry.status !== 'active') {
    throw new Error(`Cannot rename retired ${lock.domain} ID ${id}.`);
  }
  entry.key = normalizedKey;
  await persistLock(lock);

  console.log(`Renamed ${domain} ID ${id} to key '${normalizedKey}'.`);
}

async function retire(domainArg: string | undefined, idArg: string | undefined, reasonParts: string[]) {
  const id = parseId(idArg);
  const domain = parseDomain(domainArg);
  const lock = await loadLock(domain);
  assertIdWithinRange(id, lock.range, lock.domain);
  const entry = findEntry(lock, id);

  entry.status = 'retired';
  const notes = reasonParts.join(' ').trim();
  if (notes.length > 0) {
    entry.notes = notes;
  }

  await persistLock(lock);
  console.log(`Retired ${domain} ID ${id}${entry.notes ? ` (${entry.notes})` : ''}.`);
}

async function main() {
  const [, , command, domain, ...rest] = process.argv;

  try {
    switch (command) {
      case 'list':
        await list(domain);
        break;
      case 'add':
        await add(domain, rest[0]);
        break;
      case 'rename':
        await rename(domain, rest[0], rest[1]);
        break;
      case 'retire':
        await retire(domain, rest[0], rest.slice(1));
        break;
      default:
        usage();
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
