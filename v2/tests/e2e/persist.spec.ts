import { test, expect, type Page } from '@playwright/test';
import { LEGACY_FIRST_COMMIT } from '../save/legacySaves';
import { createNewGameState } from '../../src/core/state';

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

/**
 * Hält eine Taste, bis Emilia sich von `from` weg bewegt hat (Bedingung abwarten statt festes Wanduhr-Fenster: Auf dem
 * Rechner der Auslieferung stockt das Bild etwa 1 s nach jedem Seitenstart). Danach loslassen.
 */
async function holdUntil(page: Page, keys: string[], reached: (p: PlayerInfo) => boolean, message: string): Promise<void> {
  for (const k of keys) await page.keyboard.down(k);
  try {
    await expect.poll(async () => reached(await player(page)), { timeout: 5000, message }).toBe(true);
  } finally {
    for (const k of keys) await page.keyboard.up(k);
  }
  await expect.poll(async () => (await player(page)).moving, { timeout: 5000 }).toBe(false);
}

const holdUntilMoved = (page: Page, key: string, from: PlayerInfo): Promise<void> =>
  holdUntil(page, [key], (p) => p.x > from.x + 5, 'Emilia bewegt sich nicht');

/**
 * Hält Tasten und wartet dann, bis Emilia steht. Das Warten ist hier keine Zeitmessung (die steht in walk.spec.ts):
 * Auf dem Rechner der Auslieferung (Linux, Software-Grafik, zwei Worker) stockt das Bild kurz nach dem Seitenstart
 * bis zu etwa 1 s (gemessen 1007 ms ohne ein einziges Bild; Tasten kamen an, Emilia stand 110 ms nach dem nächsten
 * Bild). Eine Grenze von 1000 ms ließ den Test dort dreimal in Folge scheitern.
 */
async function hold(page: Page, keys: string[], ms: number): Promise<void> {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
  await expect.poll(async () => (await player(page)).moving, { timeout: 5000 }).toBe(false);
}

test('laufen, speichern, neu laden: Emilia steht wieder da', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./');
  await waitForWorld(page);
  const start = await player(page);
  await holdUntil(page, ['KeyD', 'KeyS'], (p) => Math.hypot(p.x - start.x, p.y - start.y) > 12, 'Emilia bewegt sich nicht');
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
  // bis an die Wand (Wandkante 32, halbe Körperbreite 5); das Abwarten des Stillstands steht in holdUntil
  await holdUntil(page, ['KeyA'], (p) => p.x < 37.5, 'Emilia erreicht die Wand nicht');
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
  await holdUntilMoved(page, 'KeyD', start);
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

test('Speicher, dessen Lesen wirft: Spiel startet mit storage-unavailable, Laufen geht, nichts gespeichert', async ({ page }) => {
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    Storage.prototype.getItem = function getItem(): string | null {
      throw new DOMException('Lesen gesperrt', 'SecurityError');
    };
  });
  await page.goto('./');
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.startNotice)).toBe('storage-unavailable');
  // der Hinweis steht im Fenster „Hinweis" und hält das Spiel an, bis er bestätigt ist (Task 9)
  await expect(page.locator('.ui-shade.is-open .ui-window[data-window="notice"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ui-shade.is-open')).toHaveCount(0);
  const start = await player(page);
  await holdUntilMoved(page, 'KeyD', start);
  expect((await saveNow(page)).kind).not.toBe('saved');
  expect(errors).toEqual([]);
});

test('gespeicherter Ort mitten im Dorfbrunnen (Kachel 20/13): Emilia steht am Startpunkt 19/14', async ({ page }) => {
  const errors = watchErrors(page);
  // gültiger v2-Stand, nur der Ort liegt in der festen Kachel des Brunnens (Fußpunkt in der Kachelmitte)
  const fresh = createNewGameState(5);
  const inWall = JSON.stringify({ ...fresh, player: { ...fresh.player, map: 'hub', x: 20.5, y: 13.5 } });
  await prepareStorage(page, { [SAVE_KEY]: inWall });
  await page.goto('./');
  await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.startNotice)).toBeNull();
  const p = await player(page);
  expect([p.x, p.y]).toEqual([HUB_SPAWN.x, HUB_SPAWN.y]);
  expect(errors).toEqual([]);
});

test('zwei Tabs: der zuerst geladene überschreibt den Stand des anderen nicht', async ({ context }) => {
  const one = await context.newPage(); const errorsOne = watchErrors(one);
  await one.goto('./');
  await waitForWorld(one);
  const entryAfterOne = await readKey(one, SAVE_KEY);
  const two = await context.newPage(); const errorsTwo = watchErrors(two);
  await two.goto('./');
  await waitForWorld(two);
  // Der Test setzt voraus, dass zwischen beiden Ladevorgängen niemand geschrieben hat (sonst wäre der Stand von Seite 1
  // schon überholt und die Meldung unten kein Befund über das Speichern, sondern über diese Annahme).
  expect(await readKey(two, SAVE_KEY), 'zwischen dem Laden von Seite 1 und Seite 2 hat eine Seite den Eintrag verändert (z. B. Speichern beim Verbergen)').toBe(entryAfterOne);
  await two.evaluate(() => (window as any).__emilia2.teleport(25, 14));
  expect((await saveNow(two)).kind).toBe('saved');
  const fromTwo = await readKey(two, SAVE_KEY);
  expect(fromTwo).not.toBeNull();
  expect((await saveNow(one)).kind).toBe('blocked-other-tab');
  expect(await readKey(one, SAVE_KEY)).toBe(fromTwo);
  expect(errorsOne).toEqual([]);
  expect(errorsTwo).toEqual([]);
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
