import { test, expect } from '@playwright/test';

test('startet ohne Fehler und ohne fremde Anfragen', async ({ page }) => {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5183\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForFunction(() => (window as any).__emilia2?.ready === true);
  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
});

test('zoomt ganzzahlig', async ({ browser, baseURL }) => {
  // eigene Dichte 1: das iPad-Gerät bringt sonst Dichte 2 mit, die Zahlen unten gelten für Dichte 1
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('./');
  // großer Bildschirm: mindestens 288×216 Bildpunkte, also floor(720 / 216) = 3
  await page.waitForFunction(() => (window as any).__emilia2?.pixelGrid?.layout.zoom === 3);
  const size = await page.evaluate(() => {
    const grid = (window as any).__emilia2.pixelGrid;
    const c = document.querySelector('canvas')!;
    const r = c.getBoundingClientRect();
    return {
      grid: { w: grid.deviceWidth, h: grid.deviceHeight },
      canvas: { w: c.width, h: c.height },
      css: { w: Math.round(r.width), h: Math.round(r.height) },
    };
  });
  expect(size).toEqual({ grid: { w: 1280, h: 720 }, canvas: { w: 1280, h: 720 }, css: { w: 1280, h: 720 } });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForFunction(() => (window as any).__emilia2?.pixelGrid?.layout.zoom === 5);
  const size2 = await page.evaluate(() => {
    const grid = (window as any).__emilia2.pixelGrid;
    const c = document.querySelector('canvas')!;
    return { grid: { w: grid.deviceWidth, h: grid.deviceHeight }, canvas: { w: c.width, h: c.height } };
  });
  expect(size2).toEqual({ grid: { w: 1920, h: 1080 }, canvas: { w: 1920, h: 1080 } });
  await context.close();
});

test('bleibt bei hoher Pixeldichte ganzzahlig und bildet Zeiger richtig ab', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: 'http://localhost:5183/',
    viewport: { width: 812, height: 375 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const read = () =>
    page.evaluate(() => {
      const h = (window as any).__emilia2;
      const grid = h.pixelGrid;
      const c = document.querySelector('canvas')!;
      const r = c.getBoundingClientRect();
      return {
        zoom: grid.layout.zoom,
        dpr: grid.dpr,
        device: { width: grid.deviceWidth, height: grid.deviceHeight },
        canvasSize: { width: c.width, height: c.height },
        css: { width: Math.round(r.width), height: Math.round(r.height) },
        mapped: h.toCanvas(406, 100),
      };
    });
  await page.goto('./');
  await page.waitForFunction(() => (window as any).__emilia2?.pixelGrid?.layout.zoom === 4);
  expect(await read()).toEqual({
    zoom: 4,
    dpr: 2,
    device: { width: 1624, height: 750 },
    canvasSize: { width: 1624, height: 750 },
    css: { width: 812, height: 375 },
    mapped: { x: 812, y: 200 },
  });
  await page.setViewportSize({ width: 1024, height: 768 });
  // iPad: großer Bildschirm, floor(1536 / 216) = 7 (das Handy darüber bleibt bei mindestens 240×180)
  await page.waitForFunction(() => (window as any).__emilia2?.pixelGrid?.layout.zoom === 7);
  expect(await read()).toMatchObject({
    zoom: 7,
    dpr: 2,
    device: { width: 2048, height: 1536 },
    canvasSize: { width: 2048, height: 1536 },
    css: { width: 1024, height: 768 },
  });
  await context.close();
});
