import { test, expect } from '@playwright/test';
import { readPng } from './helpers/png';

// Läuft nur im Projekt „ausgeliefert" gegen das gebaute Paket (vite preview, Port 5184).
test('gebautes Paket startet ohne Fehler, ohne fremde Anfragen und ohne Test-Zugang', async ({ page }) => {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5184\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => (window as any).__emilia2)).toBeUndefined();

  // Ohne Test-Zugang gibt es kein ready-Signal: warten, bis in der Mitte wirklich gezeichnet ist.
  await expect
    .poll(async () => {
      const png = readPng(await page.screenshot({ scale: 'device' }));
      return png.at(Math.floor(png.width / 2), Math.floor(png.height / 2));
    })
    .toEqual([45, 90, 39]);

  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
});
