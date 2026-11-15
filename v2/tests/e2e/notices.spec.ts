import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { LEGACY_FIRST_COMMIT } from '../save/legacySaves';
import { createNewGameState, type GameState } from '../../src/core/state';

/*
 * Hinweise zu Start und Speichern, Frage nach dem alten Stand (Plan 1b, Task 9). Zeitgrenzen nur über Bedingungen
 * (regeln.md). Hinweise (Toasts) stehen nur 3 s: Ein Beobachter in der Seite schreibt jeden neuen mit.
 */

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
const SAVE_KEY = 'emilia2_save';
const BACKUP_SAVE_KEY = 'emilia2_save_backup';
const LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save';
const FAILED = 'Speichern hat nicht geklappt.';
const OTHER_TAB = 'Das Spiel ist noch in einem anderen Fenster offen. Bitte lade die Seite neu.';
const QUESTION = 'Im alten Spiel bist du weitergekommen. Den Stand von dort holen?';

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

/** Schreibt ab jetzt jeden neuen Hinweis (Toast) mit. */
async function recordToasts(page: Page): Promise<void> {
  await page.evaluate(() => {
    const log: string[] = [];
    (window as any).__testToasts = log;
    new MutationObserver((records) => {
      for (const r of records) {
        for (const n of Array.from(r.addedNodes)) {
          if (n instanceof HTMLElement && n.classList.contains('toast')) log.push(n.querySelector('.toast__text')?.textContent ?? '');
        }
      }
    }).observe(document.getElementById('ui')!, { childList: true, subtree: true });
  });
}
const toasts = (page: Page): Promise<string[]> => page.evaluate(() => [...(window as any).__testToasts]);
const saveNow = (page: Page): Promise<{ kind: string }> => page.evaluate(() => (window as any).__emilia2.saveNow());
const readKey = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => localStorage.getItem(k), key);
const state = (page: Page): Promise<GameState> => page.evaluate(() => (window as any).__emilia2.state());
const win = (page: Page, id: string) => page.locator(`.ui-shade.is-open .ui-window[data-window="${id}"]`);
const anyWindow = (page: Page) => page.locator('.ui-shade.is-open .ui-window');

/** Wartet `count` gezeichnete Bilder ab. */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

/** Der Hinweis beim Start steht im Fenster „Hinweis"; „Gut" schließt es. */
async function expectNotice(page: Page, text: string): Promise<void> {
  const notice = win(page, 'notice');
  await expect(notice).toBeVisible();
  await expect(notice.locator('.ui-window__title')).toHaveText('Hinweis');
  await expect(notice.locator('.notice__text')).toHaveText(text);
  expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(true);
}

test('Stand mit formatVersion 2: Hinweis save-newer im Fenster, „Gut" schließt, Emilia läuft', async ({ page }) => {
  const errors = watchErrors(page);
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify({ formatVersion: 2, savedAt: 5 }) });
  await page.goto('./');
  await waitForWorld(page);
  await expectNotice(page, 'Bitte lade die Seite neu, damit dein Spielstand passt.');
  const ok = win(page, 'notice').locator('.notice__button', { hasText: 'Gut' });
  const box = (await ok.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(56);
  await ok.click();
  await expect(anyWindow(page)).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(false);
  expect(errors).toEqual([]);
});

test('Hinweise save-repaired und save-corrupt-legacy erscheinen mit ihrem Text, Esc schließt', async ({ browser, baseURL }) => {
  const repaired = JSON.parse(JSON.stringify(createNewGameState(5))) as GameState;
  repaired.inventory.slots[1] = { itemId: 'gibt_es_nicht', count: 2 };
  const cases: Array<[Record<string, string>, string]> = [
    [{ [SAVE_KEY]: JSON.stringify(repaired) }, 'Dein Spielstand wurde repariert. Vielleicht fehlt etwas.'],
    [{ [SAVE_KEY]: '{kaputt', [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) },
      'Dein Spielstand war kaputt. Wir haben den aus dem alten Spiel geholt.'],
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

test('Schreiben wirft: nach dem zweiten Speichern genau ein „Speichern hat nicht geklappt.", auch nach dem vierten', async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = function setItem(): void {
      throw new DOMException('Schreiben gesperrt', 'SecurityError');
    };
  });
  await page.goto('./');
  await waitForWorld(page);
  await expect(anyWindow(page)).toHaveCount(0);
  await recordToasts(page);
  expect((await saveNow(page)).kind).toBe('unavailable');
  await frames(page, 3);
  expect(await toasts(page)).toEqual([]);
  await saveNow(page);
  await expect.poll(() => toasts(page)).toEqual([FAILED]);
  await expect(page.locator('.toast__text', { hasText: FAILED })).toBeVisible();
  await saveNow(page);
  await saveNow(page);
  await frames(page, 3);
  expect(await toasts(page)).toEqual([FAILED]);
  expect(errors).toEqual([]);
});

test('Übernahme gelingt, ihr Sofort-Speichern nicht: Hinweis im Fenster, danach „Speichern hat nicht geklappt."', async ({ page }) => {
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
  await recordToasts(page);
  await win(page, 'notice').locator('.notice__button').click();
  await expect.poll(() => toasts(page)).toEqual([FAILED]);
  // dieselbe Meldung kommt in dieser Sitzung nicht noch einmal
  await saveNow(page);
  await saveNow(page);
  await frames(page, 3);
  expect(await toasts(page)).toEqual([FAILED]);
});

test('zwei Tabs: Seite 2 speichert, Seite 1 zweimal → genau ein Hinweis „anderes Fenster", kein „nicht geklappt"', async ({ context }) => {
  const one = await context.newPage();
  await one.goto('./');
  await waitForWorld(one);
  await recordToasts(one);
  const two = await context.newPage();
  await two.goto('./');
  await waitForWorld(two);
  expect((await saveNow(two)).kind).toBe('saved');
  expect((await saveNow(one)).kind).toBe('blocked-other-tab');
  expect((await saveNow(one)).kind).toBe('blocked-other-tab');
  await expect.poll(() => toasts(one)).toEqual([OTHER_TAB]);
  await saveNow(one);
  await frames(one, 3);
  expect(await toasts(one)).toEqual([OTHER_TAB]);
});

test('alter Stand neuer als die letzte Übernahme: Frage; „Nein" merkt es sich; neuer Stand → wieder; „Ja" holt ihn', async ({ page }) => {
  const errors = watchErrors(page);
  const at = LEGACY_FIRST_COMMIT.timestamp;
  const v2 = { ...createNewGameState(5), importedLegacyAt: at, savedAt: 5 };
  const legacy1 = JSON.stringify({ ...LEGACY_FIRST_COMMIT, timestamp: at + 1000 });
  await prepareStorage(page, { [SAVE_KEY]: JSON.stringify(v2), [LEGACY_SAVE_KEY]: legacy1 });
  await page.goto('./');
  await waitForWorld(page);
  const question = win(page, 'legacy');
  await expect(question).toBeVisible();
  await expect(question.locator('.notice__text')).toHaveText(QUESTION);
  for (const label of ['Ja', 'Nein']) {
    const box = (await question.locator('.notice__button', { hasText: label }).boundingBox())!;
    expect(box.height, label).toBeGreaterThanOrEqual(56);
    expect(box.width, label).toBeGreaterThanOrEqual(96);
  }

  // „Nein": abgelehnt wird der Stand mit genau diesem Zeitstempel, und es wird gespeichert
  await question.locator('.notice__button', { hasText: 'Nein' }).click();
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

  // „Ja": holen, ersetzen, Speichern anhalten, neu laden
  await Promise.all([
    page.waitForEvent('load'),
    win(page, 'legacy').locator('.notice__button', { hasText: 'Ja' }).click(),
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

test('Fenster „Hinweis" zuerst, nach dem Schließen die Frage; × auf der Frage zählt als „Nein"', async ({ page }) => {
  const at = LEGACY_FIRST_COMMIT.timestamp;
  const repaired = { ...(JSON.parse(JSON.stringify(createNewGameState(5))) as GameState), importedLegacyAt: at };
  repaired.inventory.slots[1] = { itemId: 'gibt_es_nicht', count: 2 };
  await prepareStorage(page, {
    [SAVE_KEY]: JSON.stringify(repaired),
    [LEGACY_SAVE_KEY]: JSON.stringify({ ...LEGACY_FIRST_COMMIT, timestamp: at + 1000 }),
  });
  await page.goto('./');
  await waitForWorld(page);
  await expectNotice(page, 'Dein Spielstand wurde repariert. Vielleicht fehlt etwas.');
  await expect(win(page, 'legacy')).toHaveCount(0);
  await win(page, 'notice').locator('.notice__button').click();
  await expect(win(page, 'legacy')).toBeVisible();
  await win(page, 'legacy').locator('.ui-window__head .ui-close').click();
  await expect(anyWindow(page)).toHaveCount(0);
  expect((await state(page)).legacyDeclinedAt).toBe(at + 1000);
});

test('Bilder der Hinweise für die Durchsicht', async ({ page, browserName }) => {
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
  writeFileSync(`${ARTIFACTS}task-9-frage-altes-spiel-1280x720@1x.png`, await page.screenshot({ scale: 'device' }));
});
