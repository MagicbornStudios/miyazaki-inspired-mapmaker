import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const fromRoot = (relativePath: string) =>
  resolve(fileURLToPath(new URL('.', import.meta.url)), relativePath);

export default defineConfig({
  resolve: {
    alias: {
      '@cars-and-magic/content': fromRoot('./packages/content/src'),
      '@cars-and-magic/game': fromRoot('./packages/game/src'),
      '@cars-and-magic/registry': fromRoot('./packages/registry/src'),
      '@cars-and-magic/shared': fromRoot('./packages/shared/src')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'lcov']
    }
  }
});
