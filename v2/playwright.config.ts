import { defineConfig, devices } from '@playwright/test';

const DEV = 'http://localhost:5183/emilia-pixel-adventure/v2/';
const PREVIEW = 'http://localhost:5184/emilia-pixel-adventure/v2/';

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Der Rechner der Auslieferung zeichnet ohne Grafikkarte: Bildschirmfotos bei hoher Pixeldichte dauern dort bis
  // zu fünfmal so lang wie am eigenen Rechner (Probelauf 2026-11-15: mehrere Tests bei 25 bis 30 s).
  timeout: process.env.CI ? 90_000 : 30_000,
  // Zwei Worker: WebGL-Seiten mit Pixelprüfungen (bis Pixeldichte 3) in drei Projekten überlasten die Maschine
  // bei der Standardzahl; Zeit-Tests messen dann die Last statt des Spiels.
  workers: 2,
  outputDir: '../test-artifacts/v2-e2e',
  reporter: 'list',
  webServer: [
    {
      command: 'npm run dev -- --port 5183 --strictPort',
      url: DEV,
      reuseExistingServer: false,
    },
    {
      // das gebaute Paket (vorher npm run build)
      command: 'npx vite preview --port 5184 --strictPort',
      url: PREVIEW,
      reuseExistingServer: false,
    },
  ],
  use: {
    baseURL: DEV,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: '**/*.preview.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
        },
      },
    },
    {
      // Die Kinder spielen auf dem iPad (WebKit)
      name: 'webkit',
      testIgnore: '**/*.preview.spec.ts',
      use: { ...devices['iPad (gen 7) landscape'] },
    },
    {
      name: 'ausgeliefert',
      testMatch: '**/*.preview.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: PREVIEW,
        launchOptions: {
          args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
        },
      },
    },
  ],
});
