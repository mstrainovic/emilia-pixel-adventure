import { test, expect, type Page } from '@playwright/test';

type PlayerInfo = { x: number; y: number; facing: string; moving: boolean };

async function openWorld(page: Page, errors: string[]): Promise<void> {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.player === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
}

const player = (page: Page): Promise<PlayerInfo> => page.evaluate(() => (window as any).__emilia2.player());

async function startWalking(page: Page): Promise<void> {
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await player(page)).moving, { timeout: 1000, intervals: [16] }).toBe(true);
}

/** Löst in der Seite ein Ereignis aus, obwohl die Taste noch physisch gedrückt ist. */
async function expectReleasedBy(page: Page, dispatch: () => void): Promise<void> {
  await startWalking(page);
  await page.evaluate(dispatch);
  await expect.poll(async () => (await player(page)).moving, { timeout: 300, intervals: [16] }).toBe(false);
  await page.keyboard.up('KeyD');
  // nichts ist dauerhaft kaputt: neu drücken, sie läuft wieder
  await startWalking(page);
  await page.keyboard.up('KeyD');
  await expect.poll(async () => (await player(page)).moving, { timeout: 500, intervals: [16] }).toBe(false);
}

test('blur in der Seite lässt eine gehaltene Taste los', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await expectReleasedBy(page, () => { window.dispatchEvent(new Event('blur')); });
  expect(errors).toEqual([]);
});

test('Rechtsklick-Menü (contextmenu) lässt eine gehaltene Taste los', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await expectReleasedBy(page, () => { window.dispatchEvent(new Event('contextmenu')); });
  expect(errors).toEqual([]);
});

test('Enter und Leertaste lösen einen fokussierten HTML-Knopf aus, D bewegt Emilia trotzdem', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  // Knopf außerhalb von #game, vom Test selbst eingefügt
  await page.evaluate(() => {
    const w = window as any;
    w.__clicks = 0;
    const b = document.createElement('button');
    b.id = 'test-knopf';
    b.textContent = 'Test';
    b.addEventListener('click', () => { w.__clicks++; });
    document.body.appendChild(b);
    b.focus();
  });
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('test-knopf');
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => (window as any).__clicks)).toBe(1);
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => (window as any).__clicks)).toBe(2);
  // der Fokus liegt weiter auf dem Knopf, und das Laufen geht trotzdem
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('test-knopf');
  const before = await player(page);
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await player(page)).x, { timeout: 5000 }).toBeGreaterThan(before.x + 5);
  await page.keyboard.up('KeyD');
  expect(await page.evaluate(() => (window as any).__clicks)).toBe(2);
  expect(errors).toEqual([]);
});
