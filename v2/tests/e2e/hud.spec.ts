import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page, type Locator } from '@playwright/test';

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));

async function openWorld(page: Page, errors: string[] = []): Promise<void> {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.setHp === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
}

const hearts = (page: Page): Locator => page.locator('.hud-hearts');
const slots = (page: Page): Locator => page.locator('.hotbar .ui-slot');
const selected = (page: Page): Promise<number> => page.evaluate(() => (window as any).__emilia2.state().inventory.selectedHotbar);
const quarters = (page: Page): Promise<string[]> =>
  page.locator('.hud-heart').evaluateAll((list) => list.map((h) => (h as HTMLElement).dataset.quarters ?? ''));

test('neues Spiel: fünf volle Herzen, Level 1, 0 Münzen, Aufgabe mit Mamas Gesicht, Holzschwert gewählt', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await expect(hearts(page)).toHaveAttribute('aria-label', '5 von 5 Herzen');
  expect(await quarters(page)).toEqual(['4', '4', '4', '4', '4']);
  await expect(page.locator('.hud-level__num')).toHaveText('1');
  await expect(page.locator('.hud-coins__num')).toHaveText('0');
  const quest = page.locator('.hud-quest');
  await expect(quest).toBeVisible();
  await expect(quest.locator('.hud-quest__name')).toHaveText('Guten Morgen!');
  await expect(quest.locator('.hud-quest__face')).toHaveAttribute('src', /mama_tanja-gesicht/);
  // „Hallo sagen" zählt nur einmal: kein Stand „0/1"
  await expect(quest.locator('.hud-quest__count')).toHaveCount(0);

  await expect(slots(page)).toHaveCount(8);
  const first = slots(page).nth(0);
  await expect(first).toHaveAttribute('aria-label', 'Holzschwert');
  await expect(first).toHaveAttribute('title', 'Holzschwert');
  await expect(first).toHaveClass(/is-selected/);
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.hotbar .is-selected')).toHaveCount(1);
  await expect(page.locator('.hotbar [aria-pressed="true"]')).toHaveCount(1);

  const menu = page.locator('.hud-menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('aria-label', 'Menü');
  const box = (await menu.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(48);
  expect(box.height).toBeGreaterThanOrEqual(48);
  expect(errors).toEqual([]);
});

test('Schnellleiste: Taste 3 wählt Platz 3, Klick auf Platz 1 wählt Platz 1 und gibt den Fokus ab', async ({ page }) => {
  await openWorld(page);
  await page.keyboard.press('Digit3');
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
  await expect(slots(page).nth(0)).not.toHaveClass(/is-selected/);
  expect(await selected(page)).toBe(2);

  await slots(page).nth(0).click();
  await expect(slots(page).nth(0)).toHaveClass(/is-selected/);
  expect(await selected(page)).toBe(0);
  // nach dem Zeiger-Klick hat der Platz keinen Fokus mehr: die Leertaste gehört wieder dem Spiel
  expect(await page.evaluate(() => document.activeElement?.closest('.hotbar') ?? null)).toBeNull();

  // per Tastatur erreichbar: Fokus auf Platz 2, Enter wählt ihn
  await slots(page).nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(slots(page).nth(1)).toHaveClass(/is-selected/);
  expect(await selected(page)).toBe(1);
});

test('Lebenspunkte 9: Herzen voll, voll, viertel, leer, leer', async ({ page }) => {
  await openWorld(page);
  await page.evaluate(() => (window as any).__emilia2.setHp(9));
  await expect.poll(() => quarters(page)).toEqual(['4', '4', '1', '0', '0']);
  await expect(hearts(page)).toHaveAttribute('aria-label', /^2,25 von 5 Herzen$/);
});

test('bei offenem Fenster sind Anzeige und Schnellleiste unerreichbar (inert)', async ({ page }) => {
  await openWorld(page);
  const inert = (): Promise<boolean[]> => page.evaluate(() => ['.hud', '.hotbar'].map((s) => (document.querySelector(s) as HTMLElement).inert));
  expect(await inert()).toEqual([false, false]);
  await page.evaluate(() => (window as any).__emilia2.openTestWindow());
  expect(await inert()).toEqual([true, true]);
  await page.keyboard.press('Escape');
  await expect.poll(inert).toEqual([false, false]);
});

test('kein Element der Anzeige überdeckt bei 1280×720 die Bildmitte', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await openWorld(page);
  await expect(page.locator('.hud-quest')).toBeVisible();
  const hits = await page.evaluate(() => {
    const center = { x0: 640 - 80, x1: 640 + 80, y0: 360 - 45, y1: 360 + 45 };
    const out: string[] = [];
    // die Behälter .hud (ganze Fläche, ohne Zeiger) zählen nicht, nur was darin gezeichnet ist
    for (const node of document.querySelectorAll('.hud *, .hotbar, .hotbar *')) {
      const r = node.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left < center.x1 && r.right > center.x0 && r.top < center.y1 && r.bottom > center.y0) out.push(node.className);
    }
    return out;
  });
  expect(hits).toEqual([]);
  await context.close();
});

test.describe('Pixelgenau', () => {
  for (const dpr of [1, 1.25, 1.5]) {
    test(`Herzen, Münze und Symbole liegen bei Dichte ${dpr} auf ganzen Gerätepixeln`, async ({ browser, baseURL, browserName }) => {
      test.skip(browserName === 'webkit' && !Number.isInteger(dpr), 'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte');
      const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: dpr });
      const page = await context.newPage();
      await openWorld(page);
      const boxes = await page.evaluate(() => {
        const pick = (selector: string, size: number) => [...document.querySelectorAll(selector)].map((n) => {
          const r = n.getBoundingClientRect();
          return { selector, size, left: r.left, top: r.top, width: r.width, height: r.height };
        });
        return { dpr: window.devicePixelRatio, list: [...pick('.hud-heart', 16), ...pick('.hud-coins__img', 10), ...pick('.hotbar__icon:not([hidden])', 16)] };
      });
      expect(boxes.list.filter((b) => b.selector === '.hud-heart')).toHaveLength(5);
      expect(boxes.list.filter((b) => b.selector.startsWith('.hotbar__icon')).length).toBeGreaterThan(0);
      const problems: string[] = [];
      const whole = (v: number): boolean => Math.abs(v * boxes.dpr - Math.round(v * boxes.dpr)) <= 0.01;
      for (const b of boxes.list) {
        const scale = (b.width * boxes.dpr) / b.size;
        if (!whole(b.left) || !whole(b.top)) problems.push(`${b.selector}: Ecke ${b.left},${b.top}`);
        if (Math.abs(scale - Math.round(scale)) > 0.01 || Math.round(scale) < 1) problems.push(`${b.selector}: Breite ${b.width} ist kein Vielfaches von ${b.size} Gerätepixeln`);
        if (Math.abs(b.height * boxes.dpr - b.size * Math.round(scale)) > 0.01) problems.push(`${b.selector}: Höhe ${b.height}`);
      }
      expect(problems).toEqual([]);
      await context.close();
    });
  }
});

test('Bilder der Anzeige für die Durchsicht', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium', 'ein Satz Bilder genügt');
  mkdirSync(ARTIFACTS, { recursive: true });
  const shots = [
    { width: 1280, height: 720, dpr: 1 }, { width: 1920, height: 1080, dpr: 1 },
    { width: 1024, height: 768, dpr: 2 }, { width: 812, height: 375, dpr: 2 },
  ];
  for (const shot of shots) {
    const context = await browser.newContext({ baseURL, viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: shot.dpr });
    const page = await context.newPage();
    await openWorld(page);
    await expect.poll(() => page.evaluate(() => document.fonts.check('bold 16px Nunito') && document.fonts.check('16px EmiliaZahlen', '0'))).toBe(true);
    await expect(page.locator('.hud-quest')).toBeVisible();
    writeFileSync(`${ARTIFACTS}task-6-anzeige-${shot.width}x${shot.height}@${shot.dpr}x.png`, await page.screenshot({ scale: 'device' }));
    await context.close();
  }
});
