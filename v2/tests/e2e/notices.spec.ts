import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { LEGACY_FIRST_COMMIT } from '../save/legacySaves';
import { createNewGameState, type GameState } from '../../src/core/state';

/*
 * Hinweise zu Start und Speichern, Frage nach dem alten Stand (Plan 1b, Task 9; Fix-Welle F1, F2, F6). Zeitgrenzen
 * nur über Bedingungen (regeln.md). Ein Beobachter in der Seite schreibt jedes neu geöffnete Fenster mit.
 */

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
const SAVE_KEY = 'emilia2_save';
const BACKUP_SAVE_KEY = 'emilia2_save_backup';
const LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save';
const FAILED = 'Speichern klappt gerade nicht. Sichere den Spielstand im Menü.';
const OTHER_TAB = 'Das Spiel ist zweimal offen. Hier wird nicht gespeichert. Schließ das andere und lade neu.';
const QUESTION = 'Im alten Spiel bist du weiter. Diesen Spielstand holen? Der jetzige wird ersetzt.';
const OK = 'Okay';

test.use({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

async function waitForWorld(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.saveNow === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

/** Legt Einträge vor dem ersten Laden ab, aber nur einmal je Tab (nicht noch einmal beim Neuladen). */
async function prepareStorage(page: Page, entries: Record<string, string>): Promise<void> {
  await page.addInitScript((e) => {
    if (sessionStorage.getItem('__vorbereitet') !== null) return;
    for (const [k, v] of Object.entries(e)) localStorage.setItem(k, v);
    sessionStorage.setItem('__vorbereitet', '1');
  }, entries);
}

/** Schreibt ab dem Laden der Seite jedes geöffnete Fenster (seine Kennung) und jeden Hinweis (Toast) mit. */
async function recordUi(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const windows: string[] = [];
    const toasts: string[] = [];
    (window as any).__testWindows = windows;
    (window as any).__testToasts = toasts;
    new MutationObserver((records) => {
      for (const r of records) {
        for (const n of Array.from(r.addedNodes)) {
          if (!(n instanceof HTMLElement)) continue;
          if (n.classList.contains('ui-shade')) windows.push(n.querySelector<HTMLElement>('.ui-window')?.dataset.window ?? '');
          if (n.classList.contains('toast')) toasts.push(n.querySelector('.toast__text')?.textContent ?? '');
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
}
const openedWindows = (page: Page): Promise<string[]> => page.evaluate(() => [...(window as any).__testWindows]);
const toasts = (page: Page): Promise<string[]> => page.evaluate(() => [...(window as any).__testToasts]);
const saveNow = (page: Page): Promise<{ kind: string }> => page.evaluate(() => (window as any).__emilia2.saveNow());
const readKey = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => localStorage.getItem(k), key);
const state = (page: Page): Promise<GameState> => page.evaluate(() => (window as any).__emilia2.state());
const paused = (page: Page): Promise<boolean> => page.evaluate(() => (window as any).__emilia2.paused());
const win = (page: Page, id: string) => page.locator(`.ui-shade.is-open .ui-window[data-window="${id}"]`);
const anyWindow = (page: Page) => page.locator('.ui-shade.is-open .ui-window');
const mark = (page: Page) => page.locator('.hud-unsaved');

/** Wartet `count` gezeichnete Bilder ab. */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

/** Der Hinweis beim Start steht im Fenster „Hinweis"; „Okay" schließt es. */
async function expectNotice(page: Page, text: string): Promise<void> {
  const notice = win(page, 'notice');
  await expect(notice).toBeVisible();
  await expect(notice.locator('.ui-window__title')).toHaveText('Hinweis');
  await expect(notice.locator('.notice__text')).toHaveText(text);
  expect(await paused(page)).toBe(true);
}

/** Fenster für Fragen und Speichern (F6): Fokus auf dem Titel; Tippen daneben schließt nicht. */
async function expectButtonsOnly(page: Page, id: string): Promise<void> {
  const w = win(page, id);
  await expect(w.locator('.ui-window__title')).toBeFocused();
  await page.mouse.click(5, 5);
  await frames(page, 5);
  await expect(w).toBeVisible();
}

test('Stand mit formatVersion 2: Hinweis save-newer im Fenster mit „Okay" und „Neu laden", „Okay" schließt', async ({ page }) => {
  const errors = watchErrors(page);
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify({ formatVersion: 2, savedAt: 5 }) });
  await page.goto('./');
  await waitForWorld(page);
  await expectNotice(page, 'Dein Spielstand ist neuer als diese Seite. Bitte lade die Seite neu.');
  const buttons = win(page, 'notice').locator('.notice__button');
  await expect(buttons).toHaveText([OK, 'Neu laden']);
  const ok = buttons.filter({ hasText: OK });
  const box = await ok.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(56);
  // in dieser Sitzung wird nie gespeichert: die Marke steht von Anfang an
  await expect(mark(page)).toBeVisible();
  await ok.click();
  await expect(anyWindow(page)).toHaveCount(0);
  expect(await paused(page)).toBe(false);
  await expect(mark(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test('save-newer: „Neu laden" lädt die Seite neu', async ({ page }) => {
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify({ formatVersion: 2, savedAt: 5 }) });
  await page.goto('./');
  await waitForWorld(page);
  await page.evaluate(() => { (window as any).__testVorDemLaden = true; });
  await Promise.all([page.waitForEvent('load'), win(page, 'notice').locator('.notice__button', { hasText: 'Neu laden' }).click()]);
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__testVorDemLaden)).toBeUndefined();
  await expect(win(page, 'notice')).toBeVisible();
});

test('Hinweise save-repaired und save-corrupt-legacy erscheinen mit ihrem Text, Esc schließt', async ({ browser, baseURL }) => {
  const repaired = JSON.parse(JSON.stringify(createNewGameState(5))) as GameState;
  repaired.inventory.slots[1] = { itemId: 'gibt_es_nicht', count: 2 };
  const cases: Array<[Record<string, string>, string]> = [
    [{ [SAVE_KEY]: JSON.stringify(repaired) }, 'Dein Spielstand war kaputt. Wir haben ihn repariert. Vielleicht fehlt etwas.'],
    [{ [SAVE_KEY]: '{kaputt', [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) },
      'Dein Spielstand war kaputt. Wir nehmen den Spielstand aus dem alten Spiel.'],
  ];
  for (const [entries, text] of cases) {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    await prepareStorage(page, entries);
    await page.goto('./');
    await waitForWorld(page);
    await expectNotice(page, text);
    await page.keyboard.press('Escape');
    await expect(anyWindow(page)).toHaveCount(0);
    await context.close();
  }
});

test('Schreiben wirft: nach dem zweiten Speichern einmal das Fenster, die Marke steht; geht es wieder, ist sie weg', async ({ page }) => {
  const errors = watchErrors(page);
  await recordUi(page);
  await page.addInitScript(() => {
    (window as any).__testWritesFail = true;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(this: Storage, key: string, value: string): void {
      if ((window as any).__testWritesFail) throw new DOMException('Schreiben gesperrt', 'SecurityError');
      original.call(this, key, value);
    };
  });
  await page.goto('./');
  await waitForWorld(page);
  await expect(anyWindow(page)).toHaveCount(0);
  await expect(mark(page)).toBeHidden();
  expect((await saveNow(page)).kind).toBe('unavailable');
  await frames(page, 3);
  expect(await openedWindows(page)).toEqual([]);
  // schon nach dem ersten Fehlschlag: die Marke oben links, eine Tafel ohne Zeiger
  await expect(mark(page)).toBeVisible();
  await expect(mark(page)).toHaveText('Nicht gespeichert');
  await expect(mark(page)).toHaveCSS('pointer-events', 'none');
  await saveNow(page);
  const failed = win(page, 'save-failed');
  await expect(failed).toBeVisible();
  await expect(failed.locator('.ui-window__title')).toHaveText('Hinweis');
  await expect(failed.locator('.notice__text')).toHaveText(FAILED);
  await expectButtonsOnly(page, 'save-failed');
  await failed.locator('.notice__button', { hasText: OK }).click();
  await expect(anyWindow(page)).toHaveCount(0);
  // einmal je Sitzung
  await saveNow(page);
  await saveNow(page);
  await frames(page, 3);
  expect(await openedWindows(page)).toEqual(['save-failed']);
  expect(await toasts(page)).toEqual([]);
  await expect(mark(page)).toBeVisible();
  // der Speicher geht wieder: nach dem nächsten Speichern ist die Marke weg
  await page.evaluate(() => { (window as any).__testWritesFail = false; });
  expect((await saveNow(page)).kind).toBe('saved');
  await expect(mark(page)).toBeHidden();
  expect(errors).toEqual([]);
});

test('Übernahme gelingt, ihr Sofort-Speichern nicht: Hinweis im Fenster, danach das Fenster „Speichern klappt gerade nicht"', async ({ page }) => {
  await recordUi(page);
  await page.addInitScript((legacy) => {
    localStorage.setItem('emilia_pixel_adventure_save', legacy);
    Storage.prototype.setItem = function setItem(): void {
      throw new DOMException('voll', 'QuotaExceededError');
    };
  }, JSON.stringify(LEGACY_FIRST_COMMIT));
  await page.goto('./');
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.importSave)).toEqual({ kind: 'full' });
  await expectNotice(page, 'Dein Spielstand aus dem alten Spiel ist da!');
  await expect(mark(page)).toBeVisible();
  // das Fenster zum Speichern wartet, bis der Hinweis zu ist (nie darüber)
  await frames(page, 5);
  expect(await openedWindows(page)).toEqual(['notice']);
  await win(page, 'notice').locator('.notice__button').click();
  await expect(win(page, 'save-failed')).toBeVisible();
  await expect(win(page, 'save-failed').locator('.notice__text')).toHaveText(FAILED);
  await win(page, 'save-failed').locator('.notice__button').click();
  await expect(anyWindow(page)).toHaveCount(0);
  // dieselbe Meldung kommt in dieser Sitzung nicht noch einmal
  await saveNow(page);
  await saveNow(page);
  await frames(page, 3);
  expect(await openedWindows(page)).toEqual(['notice', 'save-failed']);
});

test('zwei Tabs: Seite 1 zeigt das Fenster „zweimal offen" (nie über einem anderen), wieder nach dem Wegklicken; „Neu laden" – danach speichert sie wieder', async ({ context }) => {
  const one = await context.newPage();
  await recordUi(one);
  await one.goto('./');
  await waitForWorld(one);
  const two = await context.newPage();
  await two.goto('./');
  await waitForWorld(two);
  expect((await saveNow(two)).kind).toBe('saved');

  // Seite 1 hat das Menü offen: das Fenster wartet, bis es zu ist
  await one.bringToFront();
  await one.keyboard.press('KeyM');
  await expect(win(one, 'menu')).toBeVisible();
  expect((await saveNow(one)).kind).toBe('blocked-other-tab');
  await frames(one, 5);
  await expect(win(one, 'save-other-tab')).toHaveCount(0);
  await expect(mark(one)).toBeVisible();
  await one.keyboard.press('Escape');
  const other = win(one, 'save-other-tab');
  await expect(other).toBeVisible();
  await expect(other.locator('.notice__text')).toHaveText(OTHER_TAB);
  await expect(other.locator('.notice__button')).toHaveText(['Neu laden']);
  await expectButtonsOnly(one, 'save-other-tab');
  // ein zweiter gesperrter Versuch bei offenem Fenster: kein zweites
  expect((await saveNow(one)).kind).toBe('blocked-other-tab');
  await frames(one, 3);
  expect((await openedWindows(one)).filter((w) => w === 'save-other-tab')).toHaveLength(1);

  // weggeklickt (Esc, ohne neu zu laden): beim nächsten gesperrten Versuch wieder da
  await one.keyboard.press('Escape');
  await expect(anyWindow(one)).toHaveCount(0);
  expect((await saveNow(one)).kind).toBe('blocked-other-tab');
  await expect(other).toBeVisible();
  // kein „Speichern klappt gerade nicht" in diesem Fall
  expect(await openedWindows(one)).not.toContain('save-failed');

  // „Neu laden": die Seite lädt neu und speichert danach wieder
  await one.evaluate(() => { (window as any).__testVorDemLaden = true; });
  await Promise.all([one.waitForEvent('load'), other.locator('.notice__button', { hasText: 'Neu laden' }).click()]);
  await waitForWorld(one);
  expect(await one.evaluate(() => (window as any).__testVorDemLaden)).toBeUndefined();
  expect((await saveNow(one)).kind).toBe('saved');
  await expect(mark(one)).toBeHidden();
  await expect(anyWindow(one)).toHaveCount(0);
});

test('alter Stand neuer als die letzte Übernahme: Frage „Alter Spielstand"; Esc heißt später; „Nein" merkt es sich; „Ja" holt ihn', async ({ page }) => {
  const errors = watchErrors(page);
  const at = LEGACY_FIRST_COMMIT.timestamp;
  const v2 = { ...createNewGameState(5), importedLegacyAt: at, savedAt: 5 };
  const legacy1 = JSON.stringify({ ...LEGACY_FIRST_COMMIT, timestamp: at + 1000 });
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify(v2), [LEGACY_SAVE_KEY]: legacy1 });
  await page.goto('./');
  await waitForWorld(page);
  const question = win(page, 'legacy');
  await expect(question).toBeVisible();
  await expect(question.locator('.ui-window__title')).toHaveText('Alter Spielstand');
  await expect(question.locator('.notice__text')).toHaveText(QUESTION);
  for (const label of ['Ja', 'Nein']) {
    const box = await question.locator('.notice__button', { hasText: label }).boundingBox();
    expect(box?.height ?? 0, label).toBeGreaterThanOrEqual(56);
    expect(box?.width ?? 0, label).toBeGreaterThanOrEqual(96);
  }
  // Fokus auf dem Titel: die Leertaste gleich nach dem Öffnen beantwortet nichts; Tippen daneben schließt nicht
  await page.keyboard.press('Space');
  await frames(page, 5);
  await expect(question).toBeVisible();
  await expectButtonsOnly(page, 'legacy');
  expect((await state(page)).legacyDeclinedAt).toBeNull();

  // Esc heißt „später": nichts gemerkt, beim nächsten Start kommt die Frage wieder
  await page.keyboard.press('Escape');
  await expect(anyWindow(page)).toHaveCount(0);
  expect((await state(page)).legacyDeclinedAt).toBeNull();
  await page.reload();
  await waitForWorld(page);
  await expect(win(page, 'legacy')).toBeVisible();

  // „Nein": abgelehnt wird der Stand mit genau diesem Zeitstempel, und es wird gespeichert
  await win(page, 'legacy').locator('.notice__button', { hasText: 'Nein' }).click();
  await expect(anyWindow(page)).toHaveCount(0);
  expect((await state(page)).legacyDeclinedAt).toBe(at + 1000);
  expect(JSON.parse((await readKey(page, SAVE_KEY))!).legacyDeclinedAt).toBe(at + 1000);
  await page.reload();
  await waitForWorld(page);
  await frames(page, 5);
  await expect(anyWindow(page)).toHaveCount(0);

  // im alten Spiel weitergespielt: die Frage kommt wieder
  const legacy2 = JSON.stringify({ ...LEGACY_FIRST_COMMIT, timestamp: at + 2000 });
  await page.evaluate(([k, v]) => localStorage.setItem(k!, v!), [LEGACY_SAVE_KEY, legacy2]);
  await page.reload();
  await waitForWorld(page);
  await expect(win(page, 'legacy')).toBeVisible();
  expect((await state(page)).progression.level).toBe(1);
  const before = await readKey(page, SAVE_KEY);

  // „Ja" doppelt getippt: holen, ersetzen, Speichern anhalten, neu laden – nur einmal (sonst läge unter
  // BACKUP_SAVE_KEY der eben geholte Stand statt des vorigen)
  await Promise.all([
    page.waitForEvent('load'),
    win(page, 'legacy').locator('.notice__button', { hasText: 'Ja' }).dblclick(),
  ]);
  await waitForWorld(page);
  // gespeichert ist der geholte Stand, nicht der alte aus dem Arbeitsspeicher (das Speichern beim Verlassen schrieb nicht)
  const saved = JSON.parse((await readKey(page, SAVE_KEY))!) as GameState;
  expect(saved.progression.level).toBe(3);
  expect(saved.importedLegacyAt).toBe(at + 2000);
  expect((await state(page)).progression.level).toBe(3);
  expect(await readKey(page, BACKUP_SAVE_KEY)).toBe(before);
  expect(await readKey(page, LEGACY_SAVE_KEY)).toBe(legacy2);
  await frames(page, 5);
  await expect(anyWindow(page)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Fenster „Hinweis" zuerst, nach dem Schließen die Frage; × auf der Frage heißt „später", nichts wird gemerkt', async ({ page }) => {
  const at = LEGACY_FIRST_COMMIT.timestamp;
  const repaired = { ...(JSON.parse(JSON.stringify(createNewGameState(5))) as GameState), importedLegacyAt: at };
  repaired.inventory.slots[1] = { itemId: 'gibt_es_nicht', count: 2 };
  await prepareStorage(page, {
    [SAVE_KEY]: JSON.stringify(repaired),
    [LEGACY_SAVE_KEY]: JSON.stringify({ ...LEGACY_FIRST_COMMIT, timestamp: at + 1000 }),
  });
  await page.goto('./');
  await waitForWorld(page);
  await expectNotice(page, 'Dein Spielstand war kaputt. Wir haben ihn repariert. Vielleicht fehlt etwas.');
  await expect(win(page, 'legacy')).toHaveCount(0);
  await win(page, 'notice').locator('.notice__button').click();
  await expect(win(page, 'legacy')).toBeVisible();
  await win(page, 'legacy').locator('.ui-window__head .ui-close').click();
  await expect(anyWindow(page)).toHaveCount(0);
  expect((await state(page)).legacyDeclinedAt).toBeNull();
});

test('Bilder der Hinweise für die Durchsicht', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'ein Satz Bilder genügt');
  mkdirSync(ARTIFACTS, { recursive: true });
  const at = LEGACY_FIRST_COMMIT.timestamp;
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify({ formatVersion: 2, savedAt: 5 }) });
  await page.goto('./');
  await waitForWorld(page);
  await expect(win(page, 'notice')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await frames(page, 10);
  writeFileSync(`${ARTIFACTS}task-9-hinweis-save-newer-1280x720@1x.png`, await page.screenshot({ scale: 'device' }));

  await page.evaluate(([k1, v1, k2, v2]) => {
    localStorage.setItem(k1!, v1!);
    localStorage.setItem(k2!, v2!);
  }, [SAVE_KEY, JSON.stringify({ ...createNewGameState(5), importedLegacyAt: at, savedAt: 5 }),
    LEGACY_SAVE_KEY, JSON.stringify({ ...LEGACY_FIRST_COMMIT, timestamp: at + 1000 })]);
  await page.reload();
  await waitForWorld(page);
  await expect(win(page, 'legacy')).toBeVisible();
  await frames(page, 10);
  writeFileSync(`${ARTIFACTS}fix-welle-frage-altes-spiel-1280x720@1x.png`, await page.screenshot({ scale: 'device' }));
  await win(page, 'legacy').locator('.ui-close').click();

  // anderer Tab: Seite 2 speichert, diese Seite zeigt das Fenster mit „Neu laden"
  const two = await context.newPage();
  await two.goto('./');
  await waitForWorld(two);
  await saveNow(two);
  await page.bringToFront();
  await saveNow(page);
  await expect(win(page, 'save-other-tab')).toBeVisible();
  await frames(page, 10);
  writeFileSync(`${ARTIFACTS}fix-welle-anderer-tab-1280x720@1x.png`, await page.screenshot({ scale: 'device' }));
});
