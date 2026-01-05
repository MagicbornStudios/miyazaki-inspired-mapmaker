import { registryLookups } from '@cars-and-magic/registry';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';

import {
  assetManifest,
  defaultAssetPlaceholder,
  resolveAssetByKey,
  resolveAssetByRegistryId,
} from './resolver.js';

describe('resolveAssetByKey', () => {
  test('returns manifest entries for known keys', () => {
    const result = resolveAssetByKey('ui.panel.default');

    expect(result).toMatchObject({
      key: 'ui.panel.default',
      type: 'ui',
      source: 'manifest',
      descriptor: assetManifest.assets['ui.panel.default'].descriptor,
    });
  });

  test('falls back to defaults when the key is missing', () => {
    const result = resolveAssetByKey('world.tree.missing', 'model');

    expect(result).toMatchObject({
      key: 'world.tree.missing',
      type: 'model',
      source: 'default',
      descriptor: assetManifest.defaults.model,
    });
  });
});

describe('resolveAssetByRegistryId', () => {
  const tempRegistryId = 9000;

  beforeEach(() => {
    delete registryLookups.byId[tempRegistryId];
  });

  afterEach(() => {
    delete registryLookups.byId[tempRegistryId];
  });

  test('resolves registry Asset domain entries through the manifest', () => {
    registryLookups.byId[tempRegistryId] = {
      id: tempRegistryId,
      domain: 'Asset',
      key: 'world.prototype.ground',
      status: 'active',
    };

    const result = resolveAssetByRegistryId(tempRegistryId);

    expect(result).toMatchObject({
      key: 'world.prototype.ground',
      registryId: tempRegistryId,
      type: 'texture',
      source: 'manifest',
      descriptor: assetManifest.assets['world.prototype.ground'].descriptor,
    });
  });

  test('falls back to defaults when registry entries are not in the Asset domain', () => {
    const netRegistryId = 8000; // existing Net registry ID

    const result = resolveAssetByRegistryId(netRegistryId);

    expect(result).toMatchObject({
      key: 'submit_playline',
      registryId: netRegistryId,
      type: 'texture',
      source: 'default',
      descriptor: defaultAssetPlaceholder,
    });
  });
});
