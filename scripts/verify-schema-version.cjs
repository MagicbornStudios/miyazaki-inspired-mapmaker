#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { rmSync } = require('node:fs');
const { homedir } = require('node:os');
const { join, resolve } = require('node:path');

const EXPECTED_VERSION = '3.0.76';
const workspaceRoot = resolve(__dirname, '..');

function extractSchemaVersions(dependencies, versions) {
  if (!dependencies) {
    return;
  }

  for (const dependency of Object.values(dependencies)) {
    if (dependency?.from === '@colyseus/schema' && dependency.version) {
      versions.add(dependency.version);
    }

    extractSchemaVersions(dependency?.dependencies, versions);
  }
}

function readInstalledVersions() {
  const output = execSync('pnpm list -r @colyseus/schema --depth 1 --json', {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });

  const parsed = JSON.parse(output);
  const versions = new Set();

  for (const workspace of parsed) {
    extractSchemaVersions(workspace.dependencies, versions);
  }

  return versions;
}

function clearNodeModulesAndCache() {
  const nodeModuleRoots = [
    'node_modules',
    'apps/server/node_modules',
    'apps/web/node_modules',
    'packages/node_modules',
    'packages/game/node_modules',
    'packages/registry/node_modules',
    'packages/shared/node_modules',
    'packages/tools/node_modules',
  ];

  for (const nodeModulesPath of nodeModuleRoots) {
    rmSync(join(workspaceRoot, nodeModulesPath), { recursive: true, force: true });
  }

  rmSync(join(homedir(), '.pnpm-store'), { recursive: true, force: true });
}

function runFrozenInstall(reason) {
  console.log(`Running pnpm install --frozen-lockfile (${reason})...`);
  execSync('pnpm install --frozen-lockfile', {
    stdio: 'inherit',
    cwd: workspaceRoot,
  });
}

function ensureSchemaVersion() {
  let initialVersions = readInstalledVersions();

  if (initialVersions.size === 0) {
    console.error('Unable to resolve @colyseus/schema; attempting a fresh install.');
    clearNodeModulesAndCache();
    runFrozenInstall('package missing');
    initialVersions = readInstalledVersions();
  }

  if (initialVersions.size === 1 && initialVersions.has(EXPECTED_VERSION)) {
    console.log(`@colyseus/schema resolved to ${EXPECTED_VERSION} as expected.`);
    return;
  }

  console.error(
    `@colyseus/schema resolved to [${[...initialVersions].join(', ')}], expected ${EXPECTED_VERSION}. Clearing caches and reinstalling.`,
  );

  clearNodeModulesAndCache();
  runFrozenInstall('schema mismatch');

  const finalVersions = readInstalledVersions();

  if (!(finalVersions.size === 1 && finalVersions.has(EXPECTED_VERSION))) {
    throw new Error(
      `@colyseus/schema resolved to [${[...finalVersions].join(', ')}] after reinstall; expected ${EXPECTED_VERSION}. Aborting.`,
    );
  }

  console.log(`@colyseus/schema resolved to ${EXPECTED_VERSION} after reinstall.`);
}

ensureSchemaVersion();
