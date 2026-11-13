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
