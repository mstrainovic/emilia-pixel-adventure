import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Browser, type Page } from '@playwright/test';

/*
 * Menü, Hilfe und Bildraten-Anzeige (Plan 1b, Task 9). Zeitgrenzen nur über Bilder oder Bedingungen (regeln.md: der
 * Rechner der Auslieferung stockt kurz nach dem Seitenstart).
 */

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
const PC = { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

/**
 * Zählt Meldungen „ResizeObserver loop …" (das Einrasten der Fenster darf keine Schleife auslösen; der Browser meldet
 * sie als Fehler-Ereignis, nicht in der Konsole).
 */
async function countResizeLoops(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__testResizeLoops = 0;
    window.addEventListener('error', (e) => { if (String(e.message).includes('ResizeObserver')) (window as any).__testResizeLoops++; });
  });
}
const resizeLoops = (page: Page): Promise<number> => page.evaluate(() => (window as any).__testResizeLoops as number);

async function openWorld(page: Page): Promise<void> {
  await countResizeLoops(page);
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.talkState === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await expect(page.locator('.hud-quest')).toBeVisible();
}

/** Wartet `count` gezeichnete Bilder ab (Spielzeit statt Wanduhr). */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

const player = (page: Page): Promise<{ x: number; y: number; moving: boolean }> => page.evaluate(() => (window as any).__emilia2.player());
const paused = (page: Page): Promise<boolean> => page.evaluate(() => (window as any).__emilia2.paused());
const talkState = (page: Page): Promise<{ open: boolean; context: { kind: string } | null }> =>
  page.evaluate(() => (window as any).__emilia2.talkState());
const win = (page: Page, id: string) => page.locator(`.ui-shade.is-open .ui-window[data-window="${id}"]`);
const anyWindow = (page: Page) => page.locator('.ui-shade.is-open .ui-window');

/** Hält D, bis Emilia sich bewegt hat (Bedingung statt Wanduhr), dann loslassen. */
async function walksAgain(page: Page): Promise<void> {
  const from = await player(page);
  await page.keyboard.down('KeyD');
  try {
    await expect.poll(async () => (await player(page)).x > from.x + 4, { timeout: 5000, message: 'Emilia läuft nicht' }).toBe(true);
  } finally {
    await page.keyboard.up('KeyD');
  }
}

/** Hält D 30 Bilder lang: Emilia darf sich nicht bewegen. */
async function staysStill(page: Page): Promise<void> {
  const from = await player(page);
  await page.keyboard.down('KeyD');
  await frames(page, 30);
  await page.keyboard.up('KeyD');
  const to = await player(page);
  expect([to.x, to.y]).toEqual([from.x, from.y]);
}

test.describe('mit Tastatur', () => {
  test.use(PC);

  test('M öffnet „Menü" mit „Hilfe"; Klick → Hilfe mit Taste E und „reden"; Esc → zu, Emilia läuft wieder', async ({ page }) => {
    const errors = watchErrors(page);
    await openWorld(page);
    await page.keyboard.press('KeyM');
    const menu = win(page, 'menu');
    await expect(menu).toBeVisible();
    await expect(menu.locator('.ui-window__title')).toHaveText('Menü');
    const help = menu.locator('.menu__button', { hasText: 'Hilfe' });
    await expect(help).toBeVisible();
    const box = (await help.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(96);
    expect(box.height).toBeGreaterThanOrEqual(56);
    expect(await paused(page)).toBe(true);
    await staysStill(page);

    await help.click();
    const helpWin = win(page, 'help');
    await expect(helpWin).toBeVisible();
    await expect(win(page, 'menu')).toHaveCount(0);
    await expect(helpWin.locator('.ui-window__title')).toHaveText('Hilfe');
    const talkRow = helpWin.locator('.help__row', { hasText: 'reden' });
    await expect(talkRow.locator('.help__word')).toHaveText('reden');
    await expect(talkRow.locator('img.help__key')).toHaveAttribute('src', /taste_e/);
    const words = await helpWin.locator('.help__word').allTextContents();
    expect(words).toEqual(['laufen', 'rennen', 'reden', 'wählen', 'Menü', 'schließen']);
    await expect(helpWin.locator('.help__stick')).toHaveCount(0);
    // laufen: W A S D und daneben die Pfeiltasten; Menü: Taste M (Fix-Welle F15)
    const moveKeys = await helpWin.locator('.help__row', { hasText: 'laufen' }).locator('img.help__key')
      .evaluateAll((imgs) => imgs.map((i) => (i as HTMLElement).dataset.key));
    expect(moveKeys).toEqual(['w', 'a', 's', 'd', 'up', 'left', 'down', 'right']);
    await expect(helpWin.locator('.help__row', { hasText: 'Menü' }).locator('img.help__key')).toHaveAttribute('src', /taste_m/);
    // Tasten-Bilder ganzzahlig vergrößert: Breite und Höhe ein Vielfaches ihrer Pixel (erst, wenn alle geladen sind)
    await expect.poll(() => helpWin.locator('img.help__key').evaluateAll((imgs) =>
      imgs.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const sizes = await helpWin.locator('img.help__key').evaluateAll((imgs) => imgs.map((i) => {
      const img = i as HTMLImageElement;
      const r = img.getBoundingClientRect();
      return { w: r.width / img.naturalWidth, h: r.height / img.naturalHeight, loaded: img.complete && img.naturalWidth > 0 };
    }));
    expect(sizes.length).toBe(4 + 4 + 1 + 1 + 8 + 1 + 1);
    for (const s of sizes) {
      expect(s.loaded).toBe(true);
      expect(s.w).toBe(s.h);
      expect(Number.isInteger(s.w)).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(anyWindow(page)).toHaveCount(0);
    expect(await paused(page)).toBe(false);
    await walksAgain(page);
    expect(errors).toEqual([]);
    expect(await resizeLoops(page)).toBe(0);
  });

  test('H öffnet die Hilfe direkt; dieselbe Taste schließt Menü und Hilfe wieder, die andere wechselt', async ({ page }) => {
    await openWorld(page);
    await page.keyboard.press('KeyH');
    await expect(win(page, 'help')).toBeVisible();
    await page.keyboard.press('KeyH');
    await expect(anyWindow(page)).toHaveCount(0);
    await page.keyboard.press('KeyM');
    await expect(win(page, 'menu')).toBeVisible();
    await page.keyboard.press('KeyH');
    await expect(win(page, 'help')).toBeVisible();
    await page.keyboard.press('KeyM');
    await expect(win(page, 'menu')).toBeVisible();
    await page.keyboard.press('KeyM');
    await expect(anyWindow(page)).toHaveCount(0);
    expect(await paused(page)).toBe(false);
    await walksAgain(page);
  });

  test('neben Mama öffnet M das Menü (kein Gespräch); bei offenem Gespräch öffnen M und H nichts', async ({ page }) => {
    await openWorld(page);
    await page.evaluate(() => (window as any).__emilia2.teleport(9, 11));
    await expect.poll(async () => (await talkState(page)).context?.kind ?? null).toBe('talk');
    await page.keyboard.press('KeyM');
    await expect(win(page, 'menu')).toBeVisible();
    expect((await talkState(page)).open).toBe(false);
    await page.keyboard.press('Escape');
    await expect(anyWindow(page)).toHaveCount(0);

    await expect.poll(async () => (await talkState(page)).context?.kind ?? null).toBe('talk');
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await talkState(page)).open).toBe(true);
    await page.keyboard.press('KeyM');
    await page.keyboard.press('KeyH');
    await frames(page, 10);
    await expect(anyWindow(page)).toHaveCount(0);
    // auch der Menü-Knopf öffnet bei offenem Gespräch nichts
    await page.locator('.hud-menu').click();
    await frames(page, 5);
    await expect(anyWindow(page)).toHaveCount(0);
    expect((await talkState(page)).open).toBe(true);
    await page.keyboard.press('KeyE');
    await expect.poll(async () => (await talkState(page)).open).toBe(false);
    await frames(page, 10);
    await expect(anyWindow(page)).toHaveCount(0);
  });

  test('Menü-Knopf öffnet das Menü; ×, Esc und Klick daneben schließen es', async ({ page }) => {
    await openWorld(page);
    for (const how of ['close', 'escape', 'shade'] as const) {
      await page.locator('.hud-menu').click();
      await expect(win(page, 'menu')).toBeVisible();
      if (how === 'close') await win(page, 'menu').locator('.ui-close').click();
      if (how === 'escape') await page.keyboard.press('Escape');
      if (how === 'shade') await page.mouse.click(5, 5);
      await expect(anyWindow(page), how).toHaveCount(0);
    }
    expect(await paused(page)).toBe(false);
  });

  test('Tab und Umschalt+Tab kreisen im offenen Menü; der Menü-Knopf gibt den Fokus auch nach Enter ab', async ({ page }) => {
    await openWorld(page);
    const menuButton = page.locator('.hud-menu');
    for (let i = 0; i < 12 && !(await menuButton.evaluate((n) => n === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(menuButton).toBeFocused();
    await page.keyboard.press('Enter');
    const menu = win(page, 'menu');
    await expect(menu).toBeVisible();
    // × hat den Fokus; danach die drei Knöpfe, dann wieder × – nie etwas außerhalb des Fensters
    const close = menu.locator('.ui-close');
    await expect(close).toBeFocused();
    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      order.push(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.menu ?? document.activeElement?.className ?? ''));
    }
    expect(order).toEqual(['help', 'save-export', 'save-import', 'ui-button ui-close']);
    await page.keyboard.press('Shift+Tab');
    await expect(menu.locator('[data-menu="save-import"]')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(anyWindow(page)).toHaveCount(0);
    // der Fokus kehrt nicht auf den Menü-Knopf zurück: die Leertaste gehört dem Spiel
    await expect(menuButton).not.toBeFocused();
    await page.keyboard.press('Space');
    await frames(page, 5);
    await expect(anyWindow(page)).toHaveCount(0);
  });

  test('Hilfe mit Tasten auf dem Handy quer (844×390): passt aufs Bild oder rollt', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 844, height: 390 }, deviceScaleFactor: 3 });
    const page = await context.newPage();
    await openWorld(page);
    await page.keyboard.press('KeyH');
    const help = win(page, 'help');
    await expect(help).toBeVisible();
    await expect(help.locator('.help__key[data-key="up"]')).toBeVisible();
    // das Fenster liegt im Bild; was nicht hineinpasst, rollt im Inhalt (der Kopf mit × bleibt stehen)
    const inView = async (selector: ReturnType<typeof page.locator>): Promise<boolean> => {
      const b = await selector.boundingBox();
      return b !== null && b.y >= 0 && b.y + b.height <= 390 && b.x >= 0 && b.x + b.width <= 844;
    };
    expect(await inView(help)).toBe(true);
    expect(await inView(help.locator('.ui-close'))).toBe(true);
    const scrolls = await help.locator('.ui-window__body').evaluate((n) => n.scrollHeight > n.clientHeight);
    expect(scrolls || await inView(help.locator('.help__row').last())).toBe(true);
    await context.close();
  });

  test('?fps=1 in der Adresse: die Bildraten-Anzeige ist gleich beim Start an, F2 schaltet sie aus', async ({ page }) => {
    await countResizeLoops(page);
    await page.goto('./?fps=1');
    await page.waitForFunction(() => (window as any).__emilia2?.ready === true);
    const fps = page.locator('.fps');
    await expect(fps).toBeVisible();
    await expect.poll(async () => /^\d+$/.test((await fps.textContent()) ?? ''), { timeout: 10_000 }).toBe(true);
    await page.keyboard.press('F2');
    await expect(fps).toBeHidden();
  });

  test('F2 blendet oben in der Mitte die Bilder je Sekunde ein (1 bis 240) und wieder aus', async ({ page }) => {
    await openWorld(page);
    const fps = page.locator('.fps');
    await expect(fps).toBeHidden();
    await page.keyboard.press('F2');
    await expect(fps).toBeVisible();
    await expect.poll(async () => /^\d+$/.test((await fps.textContent()) ?? ''), { timeout: 10_000 }).toBe(true);
    const value = Number(await fps.textContent());
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(240);
    const box = (await fps.boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - 640)).toBeLessThanOrEqual(1);
    expect(box.y).toBeLessThan(60);
    const style = await fps.evaluate((n) => ({ events: getComputedStyle(n).pointerEvents, font: getComputedStyle(n).fontFamily, parent: n.parentElement?.className }));
    expect(style.events).toBe('none');
    expect(style.font).toContain('EmiliaZahlen');
    expect(style.parent).toBe('ui-root');
    await page.keyboard.press('F2');
    await expect(fps).toBeHidden();
  });
});

/** Neuer Kontext mit Touch in der gegebenen Größe; die Welt ist geladen. */
async function touchPage(browser: Browser, baseURL: string | undefined, width: number, height: number, dpr: number): Promise<Page> {
  const context = await browser.newContext({ baseURL, viewport: { width, height }, deviceScaleFactor: dpr, hasTouch: true });
  const page = await context.newPage();
  await openWorld(page);
  return page;
}

/** Nach einer Berührung: Menü-Knopf → Menü → Hilfe (alles per Tippen). */
async function openTouchHelp(page: Page): Promise<void> {
  await page.locator('.hud-menu').tap();
  await expect(win(page, 'menu')).toBeVisible();
  await win(page, 'menu').locator('.menu__button', { hasText: 'Hilfe' }).tap();
  await expect(win(page, 'help')).toBeVisible();
}

test('nach einer Berührung zeigt die Hilfe Stick und Knöpfe statt der Tasten', async ({ browser, baseURL }) => {
  const page = await touchPage(browser, baseURL, 1080, 810, 2);
  await openTouchHelp(page);
  const help = win(page, 'help');
  await expect(help.locator('img.help__key')).toHaveCount(0);
  await expect(help.locator('.help__stick')).toHaveCount(2);
  await expect(help.locator('.help__act img')).toHaveAttribute('src', /sprechblase/);
  expect(await help.locator('.help__word').allTextContents()).toEqual(['laufen', 'rennen', 'reden', 'wählen', 'schließen']);
  await help.locator('.ui-window__head .ui-close').tap();
  await expect(anyWindow(page)).toHaveCount(0);
  expect(await resizeLoops(page)).toBe(0);
  await page.context().close();
});

test('Handy quer (844×390): die Hilfe scrollt per Finger, das Kreuz bleibt sichtbar', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium', 'Wischen über das DevTools-Protokoll gibt es nur in Chromium');
  const page = await touchPage(browser, baseURL, 844, 390, 3);
  await openTouchHelp(page);
  const body = win(page, 'help').locator('.ui-window__body');
  const close = win(page, 'help').locator('.ui-window__head .ui-close');
  const inView = async (selector: ReturnType<typeof page.locator>): Promise<boolean> => {
    const b = (await selector.boundingBox())!;
    return b.y >= 0 && b.y + b.height <= 390 && b.x >= 0 && b.x + b.width <= 844;
  };
  // das Fenster passt aufs Bild, sein Inhalt ist höher: der Inhalt scrollt, der Kopf nicht
  expect(await inView(win(page, 'help'))).toBe(true);
  const sizes = await body.evaluate((n) => ({ scroll: n.scrollHeight, client: n.clientHeight, touch: getComputedStyle(n).touchAction }));
  expect(sizes.scroll).toBeGreaterThan(sizes.client);
  expect(sizes.touch).toBe('pan-y');
  expect(await inView(close)).toBe(true);

  const cdp = await page.context().newCDPSession(page);
  const swipe = async (): Promise<void> => {
    const b = (await body.boundingBox())!;
    const x = b.x + b.width / 2;
    const from = b.y + b.height - 10;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from - i * 20 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe();
  await expect.poll(() => body.evaluate((n) => n.scrollTop)).toBeGreaterThan(0);
  await swipe();
  await swipe();
  await expect.poll(async () => inView(win(page, 'help').locator('.help__row').last())).toBe(true);
  expect(await inView(close)).toBe(true);

  // Gegenprobe: mit touch-action none am Inhalt scrollt derselbe Finger nicht (der Test erkennt das Fehlen)
  await body.evaluate((n) => { n.scrollTop = 0; (n as HTMLElement).style.touchAction = 'none'; });
  await swipe();
  await frames(page, 5);
  expect(await body.evaluate((n) => n.scrollTop)).toBe(0);
  expect(await resizeLoops(page)).toBe(0);
  await page.context().close();
});

test('Bilder von Menü und Hilfe für die Durchsicht', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium' || !!process.env.CI, 'ein Satz Bilder genügt; auf dem Rechner der Auslieferung sieht sie niemand');
  mkdirSync(ARTIFACTS, { recursive: true });
  const shot = async (page: Page, name: string): Promise<void> => {
    await page.evaluate(() => document.fonts.ready);
    await frames(page, 10);
    writeFileSync(`${ARTIFACTS}task-9-${name}.png`, await page.screenshot({ scale: 'device' }));
  };
  const pcContext = await browser.newContext({ baseURL, ...PC });
  const pc = await pcContext.newPage();
  await openWorld(pc);
  await pc.keyboard.press('KeyM');
  await expect(win(pc, 'menu')).toBeVisible();
  await shot(pc, 'menue-1280x720@1x');
  await pc.keyboard.press('KeyH');
  await expect(win(pc, 'help')).toBeVisible();
  await shot(pc, 'hilfe-tasten-1280x720@1x');
  // Fix-Welle F15: dieselbe Hilfe, jetzt mit Pfeiltasten und M
  writeFileSync(`${ARTIFACTS}fix-welle-hilfe-tasten-1280x720@1x.png`, await pc.screenshot({ scale: 'device' }));
  await pcContext.close();
  for (const [w, h, dpr] of [[1080, 810, 2], [844, 390, 3]] as const) {
    const page = await touchPage(browser, baseURL, w, h, dpr);
    await openTouchHelp(page);
    await shot(page, `hilfe-touch-${w}x${h}@${dpr}x`);
    await page.context().close();
  }
});
