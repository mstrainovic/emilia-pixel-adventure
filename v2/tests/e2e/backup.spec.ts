import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Browser, type Download, type Page } from '@playwright/test';
import { createNewGameState, type GameState } from '../../src/core/state';

/*
 * Spielstand als Datei sichern und laden, Erinnerung daran (Plan 1b, Task 10). Chromium und WebKit. Zeitgrenzen nur
 * über Bedingungen und Bilder (regeln.md). Hinweise (Toasts) stehen nur 3 s: ein Beobachter, der schon vor dem Start
 * der Seite läuft, schreibt jeden neuen mit.
 */

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
const SAVE_KEY = 'emilia2_save';
const BACKUP_SAVE_KEY = 'emilia2_save_backup';
const FILENAME = /^emilia2-spielstand-\d{4}-\d{2}-\d{2}\.json$/;
const SAVED = 'Gesichert!';
const UNFIT = 'Diese Datei passt nicht.';
const QUESTION = 'Diesen Spielstand laden? Der jetzige wird ersetzt.';
const NO_STORAGE = 'Hier kann das Spiel nicht speichern.';
const REMIND = 'Zeit für eine Sicherung: Menü, dann Spielstand sichern';
const PC = { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 };

test.use(PC);

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

/** Vor jedem Laden der Seite: jeden neuen Hinweis mitschreiben und Meldungen „ResizeObserver loop …" zählen. */
async function watchPage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: string[] = [];
    (window as any).__testToasts = log;
    (window as any).__testResizeLoops = 0;
    window.addEventListener('error', (e) => { if (String(e.message).includes('ResizeObserver')) (window as any).__testResizeLoops++; });
    new MutationObserver((records) => {
      for (const r of records) {
        for (const n of Array.from(r.addedNodes)) {
          if (n instanceof HTMLElement && n.classList.contains('toast')) log.push(n.querySelector('.toast__text')?.textContent ?? '');
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
}

/** Legt Einträge vor dem ersten Laden ab, aber nur einmal je Tab (nicht noch einmal beim Neuladen). */
async function prepareStorage(page: Page, entries: Record<string, string>): Promise<void> {
  await page.addInitScript((e) => {
    if (sessionStorage.getItem('__vorbereitet') !== null) return;
    for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v);
    sessionStorage.setItem('__vorbereitet', '1');
  }, entries);
}

async function waitForWorld(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.talkState === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await expect(page.locator('.hud-quest')).toBeVisible();
}

async function openWorld(page: Page): Promise<void> {
  await watchPage(page);
  await page.goto('./');
  await waitForWorld(page);
}

/** Wartet `count` gezeichnete Bilder ab (Spielzeit statt Wanduhr). */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

const toasts = (page: Page): Promise<string[]> => page.evaluate(() => [...(window as any).__testToasts]);
const resizeLoops = (page: Page): Promise<number> => page.evaluate(() => (window as any).__testResizeLoops as number);
const readKey = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => localStorage.getItem(k), key);
const state = (page: Page): Promise<GameState> => page.evaluate(() => (window as any).__emilia2.state());
const talkState = (page: Page): Promise<{ open: boolean; keyHint: { visible: boolean; npcId: string | null } }> =>
  page.evaluate(() => (window as any).__emilia2.talkState());
const win = (page: Page, id: string) => page.locator(`.ui-shade.is-open .ui-window[data-window="${id}"]`);
const anyWindow = (page: Page) => page.locator('.ui-shade.is-open .ui-window');
const questName = (page: Page) => page.locator('.hud-quest .hud-quest__name');
const menuButton = (page: Page, text: string) => win(page, 'menu').locator('.menu__button', { hasText: text });

async function openMenu(page: Page): Promise<void> {
  await page.keyboard.press('KeyM');
  await expect(win(page, 'menu')).toBeVisible();
}

/** Menü → „Spielstand sichern": liefert den Download. */
async function exportSave(page: Page): Promise<Download> {
  await openMenu(page);
  const [download] = await Promise.all([page.waitForEvent('download'), menuButton(page, 'Spielstand sichern').click()]);
  return download;
}

/** Menü → „Spielstand laden" → Dateiauswahl; wählt `file`. */
async function importFile(page: Page, file: string | { name: string; mimeType: string; buffer: Buffer }): Promise<void> {
  await openMenu(page);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), menuButton(page, 'Spielstand laden').click()]);
  expect(chooser.isMultiple()).toBe(false);
  await chooser.setFiles(file);
}

/** Mit Mama reden: die erste Aufgabe ist geschafft, die nächste heißt „Opas Auftrag". */
async function talkToMama(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).__emilia2.teleport(9, 11));
  await expect.poll(async () => (await talkState(page)).keyHint).toMatchObject({ visible: true, npcId: 'mama_tanja' });
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await talkState(page)).open).toBe(true);
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await talkState(page)).open).toBe(false);
  await expect(questName(page)).toHaveText('Opas Auftrag');
}

test('sichern lädt die Datei herunter; laden mit „Nein" ändert nichts, mit „Ja" kommt der Stand nach dem Neuladen zurück', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await expect(questName(page)).toHaveText('Guten Morgen!');

  // sichern: ein Download mit Datum im Namen, Inhalt ist der Spielstand, Hinweis „Gesichert!", Menü zu
  const before = Date.now();
  const download = await exportSave(page);
  expect(download.suggestedFilename()).toMatch(FILENAME);
  const file = await download.path();
  const saved = JSON.parse(readFileSync(file, 'utf8')) as GameState;
  expect(saved.formatVersion).toBe(1);
  expect(saved.lastBackupAt).toBeGreaterThanOrEqual(before);
  expect(saved.progression.activeQuests).toHaveProperty('first_steps');
  await expect(anyWindow(page)).toHaveCount(0);
  await expect.poll(() => toasts(page)).toContain(SAVED);
  // die Sicherung ist auch im Speicher vermerkt (gespeichert vor dem Download)
  expect(JSON.parse((await readKey(page, SAVE_KEY))!).lastBackupAt).toBe(saved.lastBackupAt);

  await talkToMama(page);
  expect((await state(page)).progression.completedQuests).toContain('first_steps');

  // laden, dann „Nein": nichts ändert sich, kein Neuladen
  await page.evaluate(() => { (window as any).__testVorDemLaden = true; });
  const storedBefore = await readKey(page, SAVE_KEY);
  await importFile(page, file);
  const question = win(page, 'backup-load');
  await expect(question).toBeVisible();
  await expect(question.locator('.notice__text')).toHaveText(QUESTION);
  expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(true);
  await question.locator('.notice__button', { hasText: 'Nein' }).click();
  await expect(anyWindow(page)).toHaveCount(0);
  await frames(page, 10);
  expect(await page.evaluate(() => (window as any).__testVorDemLaden)).toBe(true);
  await expect(questName(page)).toHaveText('Opas Auftrag');
  expect(await readKey(page, SAVE_KEY)).toBe(storedBefore);
  expect(await readKey(page, BACKUP_SAVE_KEY)).toBeNull();

  // dieselbe Datei noch einmal, Esc zählt als „Nein"
  await importFile(page, file);
  await expect(win(page, 'backup-load')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(anyWindow(page)).toHaveCount(0);
  expect(await readKey(page, SAVE_KEY)).toBe(storedBefore);

  // und noch einmal, jetzt „Ja", doppelt getippt: die Seite lädt neu, die Aufgabe heißt wieder „Guten Morgen!"; ersetzt
  // wird nur einmal (unten: unter BACKUP_SAVE_KEY liegt der vorige Stand, nicht der geladene)
  await importFile(page, file);
  await win(page, 'backup-load').locator('.notice__button', { hasText: 'Ja' }).dblclick();
  await page.waitForFunction(() => (window as any).__testVorDemLaden === undefined && (window as any).__emilia2?.ready === true);
  await waitForWorld(page);
  await expect(questName(page)).toHaveText('Guten Morgen!');
  const now = await state(page);
  expect(now.progression.completedQuests).not.toContain('first_steps');
  expect(now.lastBackupAt).toBe(saved.lastBackupAt);
  // der ersetzte Stand (mit Mamas Aufgabe erledigt) liegt unter BACKUP_SAVE_KEY; das Speichern beim Verlassen hat
  // ihn nicht über den geladenen geschrieben
  const replaced = JSON.parse((await readKey(page, BACKUP_SAVE_KEY))!) as GameState;
  expect(replaced.progression.completedQuests).toContain('first_steps');
  const stored = JSON.parse((await readKey(page, SAVE_KEY))!) as GameState;
  expect(stored.progression.completedQuests).not.toContain('first_steps');
  expect(await toasts(page)).not.toContain(REMIND);
  expect(await resizeLoops(page)).toBe(0);
  expect(errors).toEqual([]);
});

test('eine Datei, die nicht passt: Hinweis „Diese Datei passt nicht.", nichts ändert sich', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await page.evaluate(() => (window as any).__emilia2.saveNow());
  const storedBefore = await readKey(page, SAVE_KEY);
  const stateBefore = await state(page);
  await importFile(page, { name: 'kaputt.json', mimeType: 'application/json', buffer: Buffer.from('kaputt') });
  await expect.poll(() => toasts(page)).toContain(UNFIT);
  await expect(anyWindow(page)).toHaveCount(0);
  expect(await readKey(page, SAVE_KEY)).toBe(storedBefore);
  expect(await readKey(page, BACKUP_SAVE_KEY)).toBeNull();
  expect((await state(page)).progression).toEqual(stateBefore.progression);
  // auch gültiges JSON ohne Spielstand passt nicht
  await importFile(page, { name: 'leer.json', mimeType: 'application/json', buffer: Buffer.from('{"a":1}') });
  await expect.poll(async () => (await toasts(page)).filter((t) => t === UNFIT).length).toBe(2);
  await expect(anyWindow(page)).toHaveCount(0);
  expect(await readKey(page, SAVE_KEY)).toBe(storedBefore);
  expect(await resizeLoops(page)).toBe(0);
  expect(errors).toEqual([]);
});

test('Erinnerung: 30 Minuten gespielt, nie gesichert → der Hinweis erscheint genau einmal', async ({ page }) => {
  const errors = watchErrors(page);
  const due = createNewGameState(5);
  due.dayNight.totalTime = 1800;
  due.lastBackupAt = null;
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify(due) });
  await openWorld(page);
  await expect.poll(() => toasts(page)).toContain(REMIND);
  // weitere Minuten Spielzeit: geprüft wird je Minute, gezeigt nur einmal je Sitzung
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => (window as any).__emilia2.skipTime(61));
    await frames(page, 5);
  }
  expect((await toasts(page)).filter((t) => t === REMIND)).toHaveLength(1);
  // der Hinweis erscheint, während die Seite noch Schrift und Maßstab einrichtet: sein Einrasten löst keine Schleife aus
  expect(await resizeLoops(page)).toBe(0);
  expect(errors).toEqual([]);
});

test('Erinnerung kommt mit der Spielzeit: bei 29 Minuten noch nicht, nach der 30. Minute einmal', async ({ page }) => {
  const errors = watchErrors(page);
  const almost = createNewGameState(5);
  almost.dayNight.totalTime = 1740;
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify(almost) });
  await openWorld(page);
  await frames(page, 10);
  expect(await toasts(page)).not.toContain(REMIND);
  await page.evaluate(() => (window as any).__emilia2.skipTime(61));
  await expect.poll(async () => (await toasts(page)).filter((t) => t === REMIND).length).toBe(1);
  expect(await resizeLoops(page)).toBe(0);
  expect(errors).toEqual([]);
});

test('Sitzung ohne Speichern: sichern lädt trotzdem herunter, laden endet mit „Hier kann das Spiel nicht speichern."', async ({ page }) => {
  const errors = watchErrors(page);
  const newer = JSON.stringify({ formatVersion: 2, savedAt: 5 });
  await prepareStorage(page, { [SAVE_KEY]: newer });
  await openWorld(page);
  await win(page, 'notice').locator('.notice__button', { hasText: 'Gut' }).click();
  await expect(anyWindow(page)).toHaveCount(0);

  const download = await exportSave(page);
  expect(download.suggestedFilename()).toMatch(FILENAME);
  const file = await download.path();
  expect((JSON.parse(readFileSync(file, 'utf8')) as GameState).formatVersion).toBe(1);
  await expect.poll(() => toasts(page)).toContain(SAVED);

  await page.evaluate(() => { (window as any).__testVorDemLaden = true; });
  await importFile(page, file);
  await win(page, 'backup-load').locator('.notice__button', { hasText: 'Ja' }).click();
  await expect.poll(() => toasts(page)).toContain(NO_STORAGE);
  await expect(anyWindow(page)).toHaveCount(0);
  await frames(page, 10);
  expect(await page.evaluate(() => (window as any).__testVorDemLaden)).toBe(true);
  expect(await readKey(page, SAVE_KEY)).toBe(newer);
  expect(await readKey(page, BACKUP_SAVE_KEY)).toBeNull();
  // die Fehlermeldungen des Speicherns erscheinen dabei nicht (es wurde gar nicht versucht)
  expect(await toasts(page)).not.toContain('Speichern hat nicht geklappt.');
  expect(await resizeLoops(page)).toBe(0);
  expect(errors).toEqual([]);
});

/** Neuer Kontext mit Touch in der gegebenen Größe; die Welt ist geladen. */
async function touchPage(browser: Browser, baseURL: string | undefined, width: number, height: number, dpr: number): Promise<Page> {
  const context = await browser.newContext({ baseURL, viewport: { width, height }, deviceScaleFactor: dpr, hasTouch: true });
  const page = await context.newPage();
  await openWorld(page);
  return page;
}

test('Menü mit drei gleich breiten Knöpfen am PC und auf dem Handy quer, Rückfrage – Bilder für die Durchsicht', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium', 'ein Satz Bilder genügt');
  mkdirSync(ARTIFACTS, { recursive: true });
  const shot = async (page: Page, name: string): Promise<void> => {
    await page.evaluate(() => document.fonts.ready);
    await frames(page, 10);
    writeFileSync(`${ARTIFACTS}task-10-${name}.png`, await page.screenshot({ scale: 'device' }));
  };
  const labels = ['Hilfe', 'Spielstand sichern', 'Spielstand laden'];
  const checkMenu = async (page: Page, width: number, height: number): Promise<void> => {
    const buttons = win(page, 'menu').locator('.menu__button');
    expect(await buttons.allTextContents()).toEqual(labels);
    const boxes = await Promise.all(labels.map(async (_, i) => (await buttons.nth(i).boundingBox())!));
    for (const b of boxes) {
      expect(b.width).toBeCloseTo(boxes[0]!.width, 1);
      expect(b.height).toBeGreaterThanOrEqual(48);
    }
    // das Fenster wächst nicht mit den Knöpfen (grid.ts), das × ist sichtbar, alles im Bild oder per Scrollen
    const windowBox = (await win(page, 'menu').boundingBox())!;
    expect(windowBox.width).toBeLessThan(width);
    const close = (await win(page, 'menu').locator('.ui-window__head .ui-close').boundingBox())!;
    expect(close.y).toBeGreaterThanOrEqual(0);
    expect(close.x + close.width).toBeLessThanOrEqual(width);
    const body = win(page, 'menu').locator('.ui-window__body');
    const fits = windowBox.y >= 0 && windowBox.y + windowBox.height <= height;
    const scrolls = await body.evaluate((n) => n.scrollHeight > n.clientHeight);
    expect(fits || scrolls).toBe(true);
    await frames(page, 10);
    const widths = await Promise.all([win(page, 'menu').boundingBox(), buttons.first().boundingBox()]);
    expect(widths[0]!.width).toBeCloseTo(windowBox.width, 1);
    expect(widths[1]!.width).toBeCloseTo(boxes[0]!.width, 1);
    expect(await resizeLoops(page)).toBe(0);
  };

  const pcContext = await browser.newContext({ baseURL, ...PC });
  const pc = await pcContext.newPage();
  await openWorld(pc);
  await openMenu(pc);
  await checkMenu(pc, 1280, 720);
  await shot(pc, 'menue-1280x720@1x');
  await pc.keyboard.press('Escape');
  await expect(anyWindow(pc)).toHaveCount(0);
  const download = await exportSave(pc);
  await importFile(pc, await download.path());
  await expect(win(pc, 'backup-load')).toBeVisible();
  await shot(pc, 'frage-laden-1280x720@1x');
  await pcContext.close();

  const phone = await touchPage(browser, baseURL, 844, 390, 3);
  await phone.locator('.hud-menu').tap();
  await expect(win(phone, 'menu')).toBeVisible();
  await checkMenu(phone, 844, 390);
  await shot(phone, 'menue-844x390@3x');
  await phone.context().close();
});
