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

test('zoomt ganzzahlig', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('./');
  await page.waitForFunction(() => (window as any).__emilia2?.zoom === 4);
  const size = await page.evaluate(() => {
    const c = document.querySelector('canvas')!;
    const r = c.getBoundingClientRect();
    return { w: c.width, h: c.height, cw: Math.round(r.width), ch: Math.round(r.height) };
  });
  expect(size).toEqual({ w: 1280, h: 720, cw: 1280, ch: 720 });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForFunction(() => (window as any).__emilia2?.zoom === 6);
  const size2 = await page.evaluate(() => {
    const c = document.querySelector('canvas')!;
    return { w: c.width, h: c.height };
  });
  expect(size2).toEqual({ w: 1920, h: 1080 });
});
