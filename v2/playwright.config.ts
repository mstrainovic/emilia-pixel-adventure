import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '../test-artifacts/v2-e2e',
  reporter: 'list',
  webServer: {
    command: 'npm run dev -- --port 5183 --strictPort',
    url: 'http://localhost:5183/emilia-pixel-adventure/v2/',
    reuseExistingServer: false,
  },
  use: {
    baseURL: 'http://localhost:5183/emilia-pixel-adventure/v2/',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
        },
      },
    },
  ],
});
