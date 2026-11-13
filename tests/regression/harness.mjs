// Gemeinsame Hilfen fuer die Regressionspruefungen im echten Spiel.
import { createServer } from 'vite';
import { createRequire } from 'node:module';

// CJS-Eintrag: umgeht die ESM-Datei von playwright, die auf OneDrive-Ordnern unlesbar sein kann.
const { chromium } = createRequire(import.meta.url)('playwright');

let failed = false;

export async function startServer() {
  const server = await createServer({
    logLevel: 'error',
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
  });
  await server.listen();
  const url = server.resolvedUrls.local[0];
  return { url, close: () => server.close() };
}

export async function launchBrowser() {
  return chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
}

export async function startNewGame(page, url) {
  await page.goto(url);
  await page.getByText('Neues Spiel').first().click();
  await page.waitForFunction(() => window.__game && window.__game.running === true, null, { timeout: 60000 });
}

export async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (err) {
    failed = true;
    console.log(`FAIL ${name}`);
    console.log(`  ${err && err.message ? err.message : err}`);
  }
}

export function finish() {
  process.exit(failed ? 1 : 0);
}
