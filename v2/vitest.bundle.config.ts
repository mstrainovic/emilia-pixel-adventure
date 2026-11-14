import { defineConfig } from 'vitest/config';

// Prüft das gebaute Paket (dist/v2); vorher `npm run build` ausführen.
export default defineConfig({
  test: {
    include: ['tests/guards/bundle.test.ts'],
  },
});
