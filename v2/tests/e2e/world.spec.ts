import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { blockProblems, readPng, type GridSnapshot, type PngImage } from './helpers/png';

type Snapshot = GridSnapshot;

const hub = JSON.parse(readFileSync(fileURLToPath(new URL('../../src/assets/maps/hub.json', import.meta.url)), 'utf8')) as {
  layers: { name: string; objects?: unknown[] }[];
};
const HUB_OBJECTS = hub.layers.find((l) => l.name === 'objects')!.objects!.length;
const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1a/', import.meta.url));

/** Wartet, bis die Welt gezeichnet ist und zwei Bilder auf dem Bildschirm waren. */
async function waitForWorld(page: Page): Promise<Snapshot> {
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && h.world && h.pixelGrid?.deviceWidth > 1;
  });
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  return page.evaluate(() => (window as any).__emilia2.pixelGrid as Snapshot);
}

function colorCount(png: PngImage): number {
  const colors = new Set<number>();
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const [r, g, b] = png.at(x, y);
      colors.add((r << 16) | (g << 8) | b);
    }
  }
  return colors.size;
}

async function checkWorld(page: Page, name: string): Promise<void> {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5183\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  await page.goto('./');
  const snapshot = await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.world)).toEqual({ map: 'hub', objects: HUB_OBJECTS, npcs: 9 });

  const shot = await page.screenshot({ scale: 'device' });
  mkdirSync(ARTIFACTS, { recursive: true });
  writeFileSync(`${ARTIFACTS}${name}.png`, shot);
  const png = readPng(shot);
  expect(colorCount(png)).toBeGreaterThanOrEqual(16);
  expect(blockProblems(png, snapshot)).toEqual([]);
  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
}

test('zeichnet das Dorf pixelgenau', async ({ page, browserName }) => {
  await checkWorld(page, `welt-${browserName}`);
});

test('zeichnet das Dorf pixelgenau bei gebrochener Pixeldichte', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte');
  // 1366 × 1,5 und 768 × 1,5 ergeben ganze Gerätepixel (siehe avoidHalfDevicePixels in pixelgrid.spec.ts)
  const context = await browser.newContext({ baseURL, viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1.5 });
  await checkWorld(await context.newPage(), `welt-${browserName}-dichte-1.5`);
  await context.close();
});
