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
  // sichtbar „Level 1": das Wort in der Leseschrift, die Zahl in der Ziffernschrift
  await expect(page.locator('.hud-level__word')).toHaveText('Level');
  await expect(page.locator('.hud-level__word')).toHaveCSS('font-family', /Nunito/);
  await expect(page.locator('.hud-level__num')).toHaveText('1');
  await expect(page.locator('.hud-level__num')).toHaveCSS('font-family', /EmiliaZahlen/);
  await expect(page.locator('.hud-level')).toHaveAttribute('aria-label', 'Level 1');
  // Balken: Münzgelb auf Tinte (Fix-Welle F14)
  await expect(page.locator('.hud-level__bar')).toHaveCSS('background-color', 'rgb(20, 27, 27)');
  await expect(page.locator('.hud-level__fill')).toHaveCSS('background-color', 'rgb(241, 196, 113)');
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
  // für Vorlese-Programme: genau ein Platz ist der gewählte, keine acht Umschalter
  await expect(first).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('.hotbar .is-selected')).toHaveCount(1);
  await expect(page.locator('.hotbar [aria-current="true"]')).toHaveCount(1);
  await expect(page.locator('.hotbar [aria-pressed]')).toHaveCount(0);

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

  // per Tastatur erreichbar: Fokus auf Platz 2, Enter wählt ihn – und gibt den Fokus danach ebenso ab (Fix-Welle F15)
  await slots(page).nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(slots(page).nth(1)).toHaveClass(/is-selected/);
  expect(await selected(page)).toBe(1);
  await expect(slots(page).nth(1)).toHaveAttribute('aria-current', 'true');
  expect(await page.evaluate(() => document.activeElement?.closest('.hotbar') ?? null)).toBeNull();
  // die Leertaste danach wählt nicht wieder Platz 2, sie gehört dem Spiel
  await page.keyboard.press('Digit3');
  await page.keyboard.press('Space');
  await frames(page, 3);
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
});

test('Level 30 passt in die feste Breite der Tafel; die Münze liegt daneben', async ({ page }) => {
  await openWorld(page);
  await expect.poll(() => page.evaluate(() => document.fonts.check('bold 20px Nunito') && document.fonts.check('27px EmiliaZahlen', '30'))).toBe(true);
  const fit = await page.evaluate(() => {
    document.querySelector('.hud-level__num')!.textContent = '30';
    const level = document.querySelector('.hud-level')!.getBoundingClientRect();
    const label = document.querySelector<HTMLElement>('.hud-level__label')!;
    const coin = document.querySelector('.hud-coins__img')!.getBoundingClientRect();
    return { label: label.scrollWidth, width: level.width, coinLeft: coin.left, levelRight: level.right };
  });
  expect(fit.label).toBeLessThanOrEqual(fit.width);
  expect(fit.coinLeft).toBeGreaterThan(fit.levelRight);
});

test('Fokus per Tab auf dem Menü-Knopf: Ring in Tinte mit einem Bildpunkt Papier dazwischen', async ({ page }) => {
  await openWorld(page);
  const menu = page.locator('.hud-menu');
  for (let i = 0; i < 12 && !(await menu.evaluate((n) => n === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(menu).toBeFocused();
  const ring = await menu.evaluate((n) => {
    const s = getComputedStyle(n);
    return { color: s.outlineColor, style: s.outlineStyle, offset: parseFloat(s.outlineOffset), shadow: s.boxShadow };
  });
  expect(ring.color).toBe('rgb(20, 27, 27)');
  expect(ring.style).toBe('solid');
  expect(ring.offset).toBeGreaterThan(0);
  expect(ring.shadow).toContain('rgb(252, 226, 202)');
});

test('Fokus per Tab auf den Plätzen der Schnellleiste: Ring in Tinte, beim gewählten Platz außen herum', async ({ page }) => {
  await openWorld(page);
  await page.keyboard.press('Digit3');
  await frames(page, 3);
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
  const tabTo = async (index: number) => {
    const slot = slots(page).nth(index);
    for (let i = 0; i < 16 && !(await slot.evaluate((n) => n === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(slot).toBeFocused();
    return slot.evaluate((n) => {
      const s = getComputedStyle(n);
      return { color: s.outlineColor, style: s.outlineStyle, width: parseFloat(s.outlineWidth), offset: parseFloat(s.outlineOffset), shadow: s.boxShadow };
    });
  };
  const plain = await tabTo(0);
  expect(plain.style).toBe('solid');
  expect(plain.color).toBe('rgb(20, 27, 27)');
  expect(plain.width).toBeGreaterThan(0);
  expect(plain.offset).toBeGreaterThan(0);
  expect(plain.shadow).toContain('rgb(252, 226, 202)');
  // gewählter Platz: der Fokusring liegt außerhalb des Rings der Auswahl
  const selected = await tabTo(2);
  expect(selected.style).toBe('solid');
  expect(selected.color).toBe('rgb(20, 27, 27)');
  expect(selected.offset).toBeGreaterThan(plain.offset);
});

test('Lebenspunkte 9: Herzen voll, voll, viertel, leer, leer', async ({ page }) => {
  await openWorld(page);
  await page.evaluate(() => (window as any).__emilia2.setHp(9));
  await expect.poll(() => quarters(page)).toEqual(['4', '4', '1', '0', '0']);
  await expect(hearts(page)).toHaveAttribute('aria-label', /^2,25 von 5 Herzen$/);
});

test('ein unbekannter Gegenstand im Platz zeigt den Beutel, eine neutrale Beschriftung und die Anzahl', async ({ page }) => {
  await openWorld(page);
  await page.evaluate(() => (window as any).__emilia2.setSlot(4, 'gibt_es_nicht', 3));
  const slot = slots(page).nth(4);
  await expect(slot).toHaveAttribute('aria-label', 'Gegenstand, 3 Stück');
  await expect(slot).toHaveAttribute('title', 'Gegenstand');
  await expect(slot.locator('.hotbar__icon')).toHaveAttribute('src', /beutel/);
  await expect(slot.locator('.hotbar__icon')).toBeVisible();
  await expect(slot.locator('.hotbar__count')).toHaveText('3');
  // ein bekannter Gegenstand ohne eigenes Symbol: Beutel mit seinem Namen
  await page.evaluate(() => (window as any).__emilia2.setSlot(5, 'pearl', 1));
  await expect(slots(page).nth(5)).toHaveAttribute('aria-label', 'Perle');
  await expect(slots(page).nth(5).locator('.hotbar__icon')).toHaveAttribute('src', /beutel/);
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

test('Handy quer 812×375@2x: Herzen, Tafel, Marke, Aufgabe, Menü-Knopf und Schnellleiste überlappen sich nicht', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 812, height: 375 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  // eine Sitzung, die nicht speichert (neuerer Stand): die Marke „Nicht gespeichert" steht
  await page.addInitScript(() => localStorage.setItem('emilia2_save', JSON.stringify({ formatVersion: 2, savedAt: 5 })));
  await openWorld(page);
  await expect(page.locator('.hud-quest')).toBeVisible();
  await expect(page.locator('.hud-unsaved')).toBeVisible();
  const parts = ['.hud-hearts', '.hud-row', '.hud-unsaved', '.hud-quest', '.hud-menu', '.hotbar'];
  const boxes = await Promise.all(parts.map(async (s) => ({ s, box: (await page.locator(s).boundingBox())! })));
  const overlaps: string[] = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i]!.box, b = boxes[j]!.box;
    if (a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height) overlaps.push(`${boxes[i]!.s} / ${boxes[j]!.s}`);
  }
  expect(overlaps).toEqual([]);
  for (const { s, box } of boxes) {
    expect(box.x, s).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, s).toBeLessThanOrEqual(812);
    expect(box.y + box.height, s).toBeLessThanOrEqual(375);
  }
  await context.close();
});

test.describe('Pixelgenau', () => {
  for (const dpr of [1, 1.25, 1.5]) {
    test(`Herzen, Münze, Symbole und Gesicht liegen bei Dichte ${dpr} auf ganzen Gerätepixeln`, async ({ browser, baseURL, browserName }) => {
      test.skip(browserName === 'webkit' && !Number.isInteger(dpr), 'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte');
      const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: dpr });
      const page = await context.newPage();
      await openWorld(page);
      const boxes = await page.evaluate(() => {
        const pick = (selector: string, size: number) => [...document.querySelectorAll(selector)].map((n) => {
          const r = n.getBoundingClientRect();
          return { selector, size, left: r.left, top: r.top, width: r.width, height: r.height };
        });
        return {
          dpr: window.devicePixelRatio,
          list: [...pick('.hud-heart', 16), ...pick('.hud-coins__img', 10), ...pick('.hotbar__icon:not([hidden])', 16), ...pick('.hud-quest__face', 38)],
        };
      });
      expect(boxes.list.filter((b) => b.selector === '.hud-heart')).toHaveLength(5);
      expect(boxes.list.filter((b) => b.selector === '.hud-quest__face')).toHaveLength(1);
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
  test.skip(browserName !== 'chromium' || !!process.env.CI, 'ein Satz Bilder genügt; auf dem Rechner der Auslieferung sieht sie niemand');
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
  // Fix-Welle: „Level 1" und die Marke „Nicht gespeichert" (Sitzung mit neuerem Stand, Hinweis geschlossen)
  for (const shot of [{ width: 1280, height: 720, dpr: 1 }, { width: 812, height: 375, dpr: 2 }]) {
    const context = await browser.newContext({ baseURL, viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: shot.dpr });
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('emilia2_save', JSON.stringify({ formatVersion: 2, savedAt: 5 })));
    await openWorld(page);
    await page.locator('.ui-window .notice__button', { hasText: 'Okay' }).click();
    await expect(page.locator('.ui-shade')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.fonts.check('bold 16px Nunito') && document.fonts.check('16px EmiliaZahlen', '0'))).toBe(true);
    await expect(page.locator('.hud-unsaved')).toBeVisible();
    await frames(page, 3);
    writeFileSync(`${ARTIFACTS}fix-welle-anzeige-${shot.width}x${shot.height}@${shot.dpr}x.png`, await page.screenshot({ scale: 'device' }));
    await context.close();
  }
});

/** Wartet `count` gezeichnete Bilder ab (Spielzeit statt Wanduhr). */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}
