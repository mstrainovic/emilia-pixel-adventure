import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page, type Locator } from '@playwright/test';

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
type PlayerInfo = { x: number; y: number; moving: boolean };

async function openWorld(page: Page, errors: string[]): Promise<void> {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.openTestWindow === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
}

const player = (page: Page): Promise<PlayerInfo> => page.evaluate(() => (window as any).__emilia2.player());
const paused = (page: Page): Promise<boolean> => page.evaluate(() => (window as any).__emilia2.paused());
const openTestWindow = (page: Page): Promise<void> => page.evaluate(() => (window as any).__emilia2.openTestWindow());
const testWindow = (page: Page): Locator => page.locator('.ui-window[data-window="test"]');
const closeButton = (page: Page): Locator => testWindow(page).locator('.ui-close');

/** Wartet `count` gezeichnete Bilder ab (Spielzeit statt Wanduhr). */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

/** D gedrückt halten: Emilia bleibt, wo sie ist, solange das Spiel angehalten ist. */
async function expectFrozen(page: Page): Promise<void> {
  const before = await player(page);
  await page.keyboard.down('KeyD');
  await frames(page, 30);
  const after = await player(page);
  await page.keyboard.up('KeyD');
  expect(after.x).toBe(before.x);
  expect(after.y).toBe(before.y);
}

async function expectWalksRight(page: Page): Promise<void> {
  const before = await player(page);
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await player(page)).x, { timeout: 5000 }).toBeGreaterThan(before.x + 5);
  await page.keyboard.up('KeyD');
}

/** Das Fenster liegt ganz im sichtbaren Bereich. */
async function expectInside(page: Page): Promise<void> {
  const view = page.viewportSize()!;
  await expect.poll(async () => {
    const box = await testWindow(page).boundingBox();
    if (!box) return 'kein Fenster';
    const inside = box.x >= 0 && box.y >= 0 && box.x + box.width <= view.width + 0.01 && box.y + box.height <= view.height + 0.01;
    return inside ? 'im Bild' : `${box.x},${box.y} ${box.width}×${box.height} in ${view.width}×${view.height}`;
  }).toBe('im Bild');
}

test('die Schrift Nunito ist geladen, alle Anfragen gehen an die eigene Adresse', async ({ page, baseURL }) => {
  const errors: string[] = [];
  const foreign: string[] = [];
  const own = new URL(baseURL!).origin;
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(`${own}/`) && !/^(data|blob):/.test(u)) foreign.push(u); });
  await openWorld(page, errors);
  await expect.poll(() => page.evaluate(() => document.fonts.check('16px Nunito') && document.fonts.check('bold 16px Nunito')), { timeout: 10_000 }).toBe(true);
  // die Schrift kommt wirklich aus dem Paket, nicht vom System
  const faces = await page.evaluate(() => [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === 'Nunito' && f.status === 'loaded').length);
  expect(faces).toBeGreaterThan(0);
  expect(foreign).toEqual([]);
  expect(errors).toEqual([]);
});

test('Testfenster: Titel, Schließen-Knopf rechts oben, hält das Spiel an, schließt mit Esc, daneben und ×', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await openTestWindow(page);
  await expect(testWindow(page)).toBeVisible();
  const title = testWindow(page).locator('.ui-window__title');
  await expect(title).toHaveCSS('font-size', '24px');
  const win = (await testWindow(page).boundingBox())!;
  const close = (await closeButton(page).boundingBox())!;
  expect(close.width).toBeGreaterThanOrEqual(48);
  expect(close.height).toBeGreaterThanOrEqual(48);
  expect(win.x + win.width - (close.x + close.width)).toBeLessThanOrEqual(32);
  expect(close.y - win.y).toBeLessThanOrEqual(32);
  await expect(closeButton(page)).toHaveText('×');
  expect(await paused(page)).toBe(true);
  await expectFrozen(page);

  await page.keyboard.press('Escape');
  await expect(testWindow(page)).toHaveCount(0);
  expect(await paused(page)).toBe(false);
  await expectWalksRight(page);

  await openTestWindow(page);
  await expect(testWindow(page)).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(testWindow(page)).toHaveCount(0);

  await openTestWindow(page);
  await closeButton(page).click();
  await expect(testWindow(page)).toHaveCount(0);
  expect(await paused(page)).toBe(false);

  // Ereignisse: angehalten und weiter, Töne für Öffnen und Schließen
  const log = await page.evaluate(() => (window as any).__emilia2.uiLog() as string[]);
  expect(log.filter((e) => e === 'paused:true')).toHaveLength(3);
  expect(log.filter((e) => e === 'paused:false')).toHaveLength(3);
  expect(log.filter((e) => e === 'sound:open')).toHaveLength(3);
  expect(log.filter((e) => e === 'sound:close')).toHaveLength(3);
  expect(errors).toEqual([]);
});

test('Fenstergröße ändert sich bei offenem Fenster: bleibt im Bild, Spiel bleibt angehalten, Esc schließt', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await openTestWindow(page);
  for (const size of [{ width: 1024, height: 768 }, { width: 811, height: 375 }]) {
    await page.setViewportSize(size);
    await page.waitForFunction((w) => (window as any).__emilia2.pixelGrid.deviceWidth === Math.round(w * window.devicePixelRatio), size.width);
    await expect(testWindow(page)).toBeVisible();
    await expectInside(page);
    expect(await paused(page)).toBe(true);
    await expectFrozen(page);
  }
  await page.keyboard.press('Escape');
  await expect(testWindow(page)).toHaveCount(0);
  await expectWalksRight(page);
  expect(errors).toEqual([]);
});

test('Tastatur: × hat den Fokus, Enter schließt, kein confirm bleibt liegen, der Fokus kehrt zurück', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await page.evaluate(() => {
    const b = document.createElement('button');
    b.id = 'vorher';
    b.textContent = 'vorher';
    document.body.appendChild(b);
    b.focus();
  });
  await openTestWindow(page);
  await expect(closeButton(page)).toBeFocused();
  await page.keyboard.press('Enter');
  // zwei Bilder: ein Druck stünde dann im Puffer des InputHub (dort wartet er 0,3 s auf einen Abnehmer)
  await frames(page, 2);
  expect(await page.evaluate(() => (window as any).__emilia2.consumeInput('confirm'))).toBe(false);
  expect(await paused(page)).toBe(false);
  await expect(testWindow(page)).toHaveCount(0);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('vorher');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  // E neben niemandem tut nichts, D läuft
  await page.keyboard.press('KeyE');
  await frames(page, 5);
  expect(await paused(page)).toBe(false);
  await expectWalksRight(page);
  expect(errors).toEqual([]);
});

test('bei offenem Fenster ist der Rest der Oberfläche unerreichbar (inert), danach wieder frei', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await page.evaluate(() => {
    const b = document.createElement('button');
    b.id = 'nachbar';
    b.textContent = 'Nachbar';
    document.querySelector('.ui-root')!.appendChild(b);
  });
  const inert = (): Promise<boolean> => page.evaluate(() => (document.getElementById('nachbar') as HTMLElement).inert);
  expect(await inert()).toBe(false);
  await openTestWindow(page);
  expect(await inert()).toBe(true);
  // Tab bleibt aus dem Nachbarn heraus
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.id)).not.toBe('nachbar');
  }
  // ein zweites Fenster ersetzt das erste: der Nachbar bleibt unerreichbar
  await openTestWindow(page);
  expect(await inert()).toBe(true);
  await page.keyboard.press('Escape');
  await expect(testWindow(page)).toHaveCount(0);
  expect(await inert()).toBe(false);
  expect(errors).toEqual([]);
});

test.describe('Maßstab der Oberfläche', () => {
  for (const dpr of [1, 1.25, 1.5]) {
    test(`--hud-px × Pixeldichte ist bei Dichte ${dpr} eine ganze Zahl`, async ({ browser, baseURL, browserName }) => {
      test.skip(browserName === 'webkit' && !Number.isInteger(dpr), 'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte');
      const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: dpr });
      const page = await context.newPage();
      await openWorld(page, []);
      const value = await hudDevicePixels(page);
      expect(Math.abs(value - Math.round(value))).toBeLessThan(0.01);
      expect(Math.round(value)).toBeGreaterThanOrEqual(1);
      const px = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('ui')!).getPropertyValue('--px')) * window.devicePixelRatio);
      expect(px).toBeCloseTo(1, 2);
      await context.close();
    });
  }

  test('bei 1920×1080 (Zoom 5) sind es 3 Gerätepixel, bei 1280×720 (Zoom 3) 2', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await openWorld(page, []);
    await page.waitForFunction(() => (window as any).__emilia2.pixelGrid.layout.zoom === 5);
    await expect.poll(() => hudDevicePixels(page)).toBeCloseTo(3, 2);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForFunction(() => (window as any).__emilia2.pixelGrid.layout.zoom === 3);
    await expect.poll(() => hudDevicePixels(page)).toBeCloseTo(2, 2);
    // der Kamera-Ausschnitt in CSS-Pixeln folgt dem Raster
    const view = await page.evaluate(() => {
      const s = getComputedStyle(document.getElementById('ui')!);
      const g = (window as any).__emilia2.pixelGrid;
      return { w: parseFloat(s.getPropertyValue('--view-w')), expected: g.layout.viewWidth * g.layout.zoom / g.dpr };
    });
    expect(view.w).toBeCloseTo(view.expected, 2);
    await context.close();
  });
});

async function hudDevicePixels(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('ui')!).getPropertyValue('--hud-px')) * window.devicePixelRatio);
}

test('Bilder des offenen Testfensters für die Durchsicht', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium', 'ein Satz Bilder genügt');
  mkdirSync(ARTIFACTS, { recursive: true });
  for (const shot of [{ width: 1280, height: 720, dpr: 1 }, { width: 1024, height: 768, dpr: 2 }]) {
    const context = await browser.newContext({ baseURL, viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: shot.dpr });
    const page = await context.newPage();
    await openWorld(page, []);
    await expect.poll(() => page.evaluate(() => document.fonts.check('bold 16px Nunito'))).toBe(true);
    await openTestWindow(page);
    await expect(testWindow(page)).toBeVisible();
    // die Blende ist durch
    await expect(page.locator('.ui-shade')).toHaveCSS('opacity', '1');
    writeFileSync(`${ARTIFACTS}task-5-fenster-${shot.width}x${shot.height}@${shot.dpr}x.png`, await page.screenshot({ scale: 'device' }));
    await context.close();
  }
  // gedrückter Knopf: × bei 1280×720 gedrückt halten, Ausschnitt um das Fenster
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await openWorld(page, []);
  await openTestWindow(page);
  await expect(page.locator('.ui-shade')).toHaveCSS('opacity', '1');
  const box = (await closeButton(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(closeButton(page)).toHaveCSS('border-image-source', /knopf_gedrueckt/);
  const win = (await testWindow(page).boundingBox())!;
  writeFileSync(`${ARTIFACTS}task-5-knopf-gedrueckt.png`, await page.screenshot({ clip: { x: win.x + win.width - 90, y: win.y, width: 90, height: 80 } }));
  await page.mouse.up();
  await context.close();
});
