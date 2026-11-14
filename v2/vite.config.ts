import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/emilia-pixel-adventure/v2/',
  build: {
    outDir: '../dist/v2',
    emptyOutDir: true,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'tests/guards/bundle.test.ts', 'node_modules/**'],
  },
});
