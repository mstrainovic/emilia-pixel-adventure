import { writeFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import { HIDE_UI, readPng, type PngImage } from './helpers/png';

type Layout = { zoom: number; viewWidth: number; viewHeight: number; offsetX: number; offsetY: number };
type Snapshot = { deviceWidth: number; deviceHeight: number; dpr: number; layout: Layout };

const DENSITIES = [1, 1.25, 1.5, 2, 2.625, 3];
const WINDOWS = [
  { width: 1280, height: 720 },
  { width: 1367, height: 769 },
  { width: 811, height: 375 },
  { width: 411, height: 731 },
  { width: 1080, height: 810 }, // iPad quer
  { width: 810, height: 1080 }, // iPad hochkant
];
const SAMPLE_STEP = 7;
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const RED = [255, 0, 0];

/** Wartet, bis die Probe den aktuellen Schnappschuss gezeichnet hat und ein Bild gerendert ist. */
async function waitForProbe(page: Page, previous?: Snapshot): Promise<Snapshot> {
  await page.waitForFunction((prev) => {
    const h = (window as any).__emilia2;
    const s = h?.pixelGrid;
    if (!h?.ready || !s || !h.probe) return false;
    if (prev && s.deviceWidth === prev.deviceWidth && s.deviceHeight === prev.deviceHeight) return false;
    return h.probe.deviceWidth === s.deviceWidth && h.probe.deviceHeight === s.deviceHeight;
  }, previous ?? null);
  // zwei Bilder abwarten, damit das neu gezeichnete Schachbrett sicher auf dem Bildschirm ist
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  return page.evaluate(() => (window as any).__emilia2.pixelGrid as Snapshot);
}

/** Prüft den Screenshot Pixel für Pixel; liefert die ersten Abweichungen. */
async function checkBoard(page: Page, snapshot: Snapshot, name: string): Promise<string[]> {
  const shot = await page.screenshot({ scale: 'device', style: HIDE_UI });
  const png = readPng(shot);
  const problems: string[] = [];
  try {
    collectProblems(png, snapshot, problems);
  } finally {
    if (problems.length > 0) writeFileSync(test.info().outputPath(`${name}.png`), shot);
  }
  return problems;
}

function collectProblems(png: PngImage, snapshot: Snapshot, problems: string[]): void {
  const note = (msg: string): void => { if (problems.length < 10) problems.push(msg); };
  if (png.width !== snapshot.deviceWidth || png.height !== snapshot.deviceHeight) {
    note(`Bildgröße ${png.width}×${png.height} statt ${snapshot.deviceWidth}×${snapshot.deviceHeight}`);
    return;
  }
  const { zoom, viewWidth, viewHeight, offsetX, offsetY } = snapshot.layout;
  const same = (a: number[], b: number[]): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  for (let fy = 0; fy < viewHeight; fy += SAMPLE_STEP) {
    for (let fx = 0; fx < viewWidth; fx += SAMPLE_STEP) {
      const expected = (fx + fy) % 2 === 0 ? WHITE : BLACK;
      for (let dy = 0; dy < zoom; dy++) {
        for (let dx = 0; dx < zoom; dx++) {
          const x = offsetX + fx * zoom + dx;
          const y = offsetY + fy * zoom + dy;
          const got = png.at(x, y);
          if (!same(got, expected)) note(`Feld ${fx}/${fy}, Pixel ${x}/${y}: ${got} statt ${expected}`);
        }
      }
    }
  }
  const right = offsetX + viewWidth * zoom;
  const bottom = offsetY + viewHeight * zoom;
  for (let y = 0; y < png.height; y++) {
    const outsideRow = y < offsetY || y >= bottom;
    for (let x = 0; x < png.width; x++) {
      if (!outsideRow && x >= offsetX && x < right) {
        x = right - 1; // Ausschnitt überspringen
        continue;
      }
      const got = png.at(x, y);
      if (!same(got, RED)) note(`Rand ${x}/${y}: ${got} statt ${RED}`);
    }
  }
}

async function checkPointer(page: Page, snapshot: Snapshot, css: { width: number; height: number }): Promise<void> {
  const { viewWidth, viewHeight, offsetX, offsetY } = snapshot.layout;
  const mapped = await page.evaluate(
    ([cx, cy, ox, oy]) => {
      const h = (window as any).__emilia2;
      return { center: h.cssToView(cx, cy), corner: h.cssToView(ox, oy), outside: h.cssToView((ox as number) - 1 / window.devicePixelRatio, cy as number) };
    },
    [css.width / 2, css.height / 2, offsetX / snapshot.dpr, offsetY / snapshot.dpr],
  );
  expect(Math.abs(mapped.center.x - Math.floor(viewWidth / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(mapped.center.y - Math.floor(viewHeight / 2))).toBeLessThanOrEqual(1);
  expect(mapped.corner.x).toBeCloseTo(0, 1);
  expect(mapped.corner.y).toBeCloseTo(0, 1);
  // `inside` gehört zum Vertrag von cssToView: Feldmitte innen, ein Pixel vor dem Feld außen
  expect(mapped.center.inside).toBe(true);
  expect(mapped.corner.inside).toBe(true);
  expect(mapped.outside.inside).toBe(false);
  expect(mapped.outside.x).toBeLessThan(0);
}

/**
 * Echte Bildschirme haben immer ganze Gerätepixel. Die Chromium-Emulation rundet bei genau halben Gerätepixeln
 * Screenshot und Zeichenfläche unterschiedlich (ohne Phaser nachgestellt), darum meidet der Test genau diese
 * Größen: Ergibt eine Seite × Dichte genau ,5, wird sie um 1 CSS-Pixel kleiner.
 */
function avoidHalfDevicePixels(win: { width: number; height: number }, dpr: number): { width: number; height: number } {
  const isHalf = (size: number): boolean => Math.abs(((size * dpr) % 1) - 0.5) < 1e-9;
  let { width, height } = win;
  while (isHalf(width)) width -= 1;
  while (isHalf(height)) height -= 1;
  return { width, height };
}

const RESIZED = { width: 1024, height: 768 };

test('Fenstergrößen enthalten keine halben Gerätepixel', () => {
  for (const dpr of DENSITIES) {
    expect(avoidHalfDevicePixels(RESIZED, dpr)).toEqual(RESIZED);
  }
  expect(avoidHalfDevicePixels({ width: 1367, height: 769 }, 1.5)).toEqual({ width: 1366, height: 768 });
  expect(avoidHalfDevicePixels({ width: 810, height: 1080 }, 1.25)).toEqual({ width: 809, height: 1080 });
});

// WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte; gebrochene Dichte ist dort ein reiner
// Emulationszustand (WebKit rastert CSS-Größen auf 1/64 px). Dort laufen nur ganzzahlige Dichten.
for (const dpr of DENSITIES) {
  for (const planned of WINDOWS) {
    const win = avoidHalfDevicePixels(planned, dpr);
    test(`Schachbrett exakt bei Dichte ${dpr}, Fenster ${win.width}×${win.height}`, async ({ browser, baseURL, browserName }) => {
      test.skip(
        browserName === 'webkit' && !Number.isInteger(dpr),
        'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte; gebrochene Dichte ist dort ein reiner Emulationszustand',
      );
      const context = await browser.newContext({ baseURL, viewport: win, deviceScaleFactor: dpr });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('./?probe=schach');

      const first = await waitForProbe(page);
      expect(first.dpr).toBe(dpr);
      expect(await checkBoard(page, first, 'vorher')).toEqual([]);
      await checkPointer(page, first, win);

      await page.setViewportSize(RESIZED);
      const second = await waitForProbe(page, first);
      expect(await checkBoard(page, second, 'nachher')).toEqual([]);
      await checkPointer(page, second, RESIZED);

      expect(errors).toEqual([]);
      await context.close();
    });
  }
}
