import { test, expect, type Page } from '@playwright/test';
import { LEGACY_FIRST_COMMIT } from '../save/legacySaves';

type PlayerInfo = { x: number; y: number; facing: string; moving: boolean };

const SAVE_KEY = 'emilia2_save';
const LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save';
const LEGACY_MUTED_KEY = 'emilia_muted';
/** Startpunkt des Dorfs: Kachel 19/14 aus der Ebene spawn, Fuß in der Kachelmitte. */
const HUB_SPAWN = { x: 19 * 16 + 8, y: 14 * 16 + 8 };

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

async function waitForWorld(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.player === 'function' && typeof h.saveNow === 'function' && h.pixelGrid?.deviceWidth > 1;
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

const player = (page: Page): Promise<PlayerInfo> => page.evaluate(() => (window as any).__emilia2.player());
const saveNow = (page: Page): Promise<{ kind: string }> => page.evaluate(() => (window as any).__emilia2.saveNow());
const readKey = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => localStorage.getItem(k), key);

async function hold(page: Page, keys: string[], ms: number): Promise<void> {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
  await expect.poll(async () => (await player(page)).moving, { timeout: 1000 }).toBe(false);
}

test('laufen, speichern, neu laden: Emilia steht wieder da', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await waitForWorld(page);
  const start = await player(page);
  await hold(page, ['KeyD', 'KeyS'], 500);
  const before = await player(page);
  expect(Math.hypot(before.x - start.x, before.y - start.y)).toBeGreaterThan(10);
  expect((await saveNow(page)).kind).toBe('saved');
  const walked = await page.evaluate(() => (window as any).__emilia2.state().progression.stats.distanceWalked as number);
  // gelaufene Strecke in Kacheln (mindestens die Luftlinie)
  expect(walked).toBeGreaterThanOrEqual(Math.hypot(before.x - start.x, before.y - start.y) / 16 - 1e-9);
  await page.reload();
  await waitForWorld(page);
  const after = await player(page);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test('direkt an der Wand gespeichert: nach dem Neuladen steht Emilia noch an der Wand, nicht am Startpunkt', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await waitForWorld(page);
  // Westlicher Waldrand: Kacheln 0 und 1 sind fest, die Wandkante liegt bei x = 32
  await page.evaluate(() => (window as any).__emilia2.teleport(2, 14));
  await hold(page, ['KeyA'], 1000);
  const before = await player(page);
  expect(before.x - 5).toBeLessThan(32.5);
  expect((await saveNow(page)).kind).toBe('saved');
  await page.reload();
  await waitForWorld(page);
  const after = await player(page);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  expect(after.x).not.toBe(HUB_SPAWN.x);
  expect(errors).toEqual([]);
});

test('die alten Schlüssel bleiben beim Spielen und Speichern unverändert', async ({ page }) => {
  const errors = watchErrors(page);
  const legacy = JSON.stringify(LEGACY_FIRST_COMMIT);
  await prepareStorage(page, { [LEGACY_SAVE_KEY]: legacy, [LEGACY_MUTED_KEY]: 'true' });
  await page.goto('./');
  await waitForWorld(page);
  await hold(page, ['KeyD'], 300);
  expect((await saveNow(page)).kind).toBe('saved');
  await page.reload();
  await waitForWorld(page);
  await hold(page, ['KeyA'], 300);
  await saveNow(page);
  expect(await readKey(page, LEGACY_SAVE_KEY)).toBe(legacy);
  expect(await readKey(page, LEGACY_MUTED_KEY)).toBe('true');
  expect(errors).toEqual([]);
});

test('Speicher, der beim Schreiben wirft: Spiel startet, Laufen geht, kein Konsolenfehler', async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = function setItem(): void {
      throw new DOMException('Schreiben gesperrt', 'SecurityError');
    };
  });
  await page.goto('./');
  await waitForWorld(page);
  const start = await player(page);
  await hold(page, ['KeyD'], 400);
  expect((await player(page)).x).toBeGreaterThan(start.x + 5);
  const result = await saveNow(page);
  const reported = await page.evaluate(() => {
    const h = (window as any).__emilia2;
    return { notice: h.startNotice as string | null, last: h.lastSaveResult() as { reason: string; result: { kind: string } } | null };
  });
  expect(result.kind).toBe('unavailable');
  expect(reported.notice === 'storage-unavailable' || reported.last?.result.kind === 'unavailable').toBe(true);
  expect(reported.last).toEqual({ reason: 'timer', result: { kind: 'unavailable' } });
  expect(errors).toEqual([]);
});

test('Stand mit formatVersion 2: Hinweis save-newer, der Eintrag bleibt bytegleich', async ({ page }) => {
  const errors = watchErrors(page);
  const newer = JSON.stringify({ formatVersion: 2, savedAt: 5, zukunft: { a: [1, 2, 3] } });
  await prepareStorage(page, { [SAVE_KEY]: newer });
  await page.goto('./');
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.startNotice)).toBe('save-newer');
  await hold(page, ['KeyD'], 300);
  expect((await saveNow(page)).kind).toBe('blocked-newer');
  expect(await readKey(page, SAVE_KEY)).toBe(newer);
  // auch Verstecken und Verlassen der Seite schreiben nicht
  await page.reload();
  await waitForWorld(page);
  expect(await readKey(page, SAVE_KEY)).toBe(newer);
  expect(errors).toEqual([]);
});

test('alter Stand aus dem Wald, v2 leer: übernommen, Emilia am Startpunkt des Dorfs, alter Schlüssel bytegleich', async ({ page }) => {
  const errors = watchErrors(page);
  const legacy = JSON.stringify(LEGACY_FIRST_COMMIT);
  await prepareStorage(page, { [LEGACY_SAVE_KEY]: legacy });
  await page.goto('./');
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.startNotice)).toBe('legacy-imported');
  const p = await player(page);
  expect([p.x, p.y]).toEqual([HUB_SPAWN.x, HUB_SPAWN.y]);
  expect(await page.evaluate(() => (window as any).__emilia2.state().progression.level)).toBe(3);
  // sofort nach der Übernahme gespeichert
  expect(await readKey(page, SAVE_KEY)).not.toBeNull();
  await hold(page, ['KeyD'], 300);
  expect((await saveNow(page)).kind).toBe('saved');
  expect(await readKey(page, LEGACY_SAVE_KEY)).toBe(legacy);
  // nach dem Speichern steht im Stand der Ort, an dem sie wirklich steht: das Dorf
  const saved = JSON.parse((await readKey(page, SAVE_KEY))!) as { player: { map: string }; progression: { level: number } };
  expect(saved.player.map).toBe('hub');
  expect(saved.progression.level).toBe(3);
  // beim nächsten Start wird nicht noch einmal übernommen
  await page.reload();
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.startNotice)).toBeNull();
  expect(await readKey(page, LEGACY_SAVE_KEY)).toBe(legacy);
  expect(errors).toEqual([]);
});
