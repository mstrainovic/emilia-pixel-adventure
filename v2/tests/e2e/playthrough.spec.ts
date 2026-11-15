import { test, expect, type Page } from '@playwright/test';
import { TILE, player, walkToTile } from './helpers/walk';

/*
 * Durchspiel-Test (Plan 1b, Task 11): die ersten Minuten so, wie ein Kind sie spielt – mit echten Tasten vom
 * Startpunkt über den Weg zu Mama, reden, Aufgabe, Schnellleiste, Hilfe, neu laden. Der Test-Zugang LIEST hier nur
 * den Ort (walkToTile), er setzt nichts. Zeit nur über Bedingungen oder lange Grenzen (regeln.md).
 */

const LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save';
const LEGACY_MUTED_KEY = 'emilia_muted';

/**
 * Weg vom Startpunkt (19/14) zu Mama (steht auf 8/11): auf Zeile 14 nach links bis an den senkrechten Weg (11/14),
 * ihn hinauf bis 11/12, dann auf Zeile 12 nach links bis 8/12, eine Kachel unter Mama. Alle Kacheln dazwischen sind
 * frei (Kollisionsebene von hub.json und Figuren; nachgesehen für die Zeilen 12–14 und die Spalten 8–19). Der
 * Brunnen (20/13) und die Blumen (18/13, 9/11) liegen neben dem Weg bzw. sind nicht fest.
 */
const ROUTE: readonly (readonly [number, number])[] = [[11, 14], [11, 12], [8, 12]];
const BELOW_MAMA = { x: 8 * TILE + TILE / 2, y: 12 * TILE + TILE / 2 };
const WALK_TIMEOUT_MS = 20_000;

function watchProblems(page: Page): { errors: string[]; foreign: string[] } {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5183\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  return { errors, foreign };
}

/** Wartet auf Welt, Test-Zugang und sichtbare Anzeige. */
async function waitForWorld(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.player === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await expect(page.locator('.hud-quest')).toBeVisible();
}

const legacyKeys = (page: Page): Promise<(string | null)[]> =>
  page.evaluate((keys) => keys.map((k) => localStorage.getItem(k)), [LEGACY_SAVE_KEY, LEGACY_MUTED_KEY]);

const slots = (page: Page) => page.locator('.hotbar .ui-slot');
const quest = (page: Page) => page.locator('.hud-quest');
const berries = (page: Page) => page.locator('.hotbar .ui-slot[aria-label="Beere, 5 Stück"]');

test('Durchspiel: zu Mama laufen, reden, Aufgabe, Platz 3, Hilfe, neu laden – alles bleibt', async ({ page }) => {
  test.setTimeout(90_000);
  const { errors, foreign } = watchProblems(page);
  await page.goto('./');
  await waitForWorld(page);
  // frischer Browser-Kontext: kein Hinweis, keine Frage nach dem alten Stand, die alten Schlüssel gibt es nicht
  await expect(page.locator('.ui-window')).toHaveCount(0);
  expect(await legacyKeys(page)).toEqual([null, null]);
  expect(await player(page)).toMatchObject({ x: 19 * TILE + TILE / 2, y: 14 * TILE + TILE / 2 });

  for (const [x, y] of ROUTE) await walkToTile(page, x, y, WALK_TIMEOUT_MS);

  await page.keyboard.press('KeyE');
  const box = page.locator('.dialogue__box');
  await expect(box).toBeVisible();
  await expect(box.locator('.dialogue__name')).toHaveText('Mama Tanja');
  await page.keyboard.press('KeyE');
  await expect(box).toBeHidden();
  await expect(quest(page).locator('.hud-quest__name')).toHaveText('Opas Auftrag');
  await expect(quest(page).locator('.hud-quest__count')).toHaveText('0/5');
  await expect(berries(page).locator('.hotbar__count')).toHaveText('5');

  await page.keyboard.press('Digit3');
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
  await expect(page.locator('.hotbar .ui-slot.is-selected')).toHaveCount(1);

  await page.keyboard.press('KeyH');
  const help = page.locator('.ui-window[data-window="help"]');
  await expect(help).toBeVisible();
  await expect(help.locator('.ui-window__title')).toHaveText('Hilfe');
  await page.keyboard.press('Escape');
  await expect(page.locator('.ui-window')).toHaveCount(0);
  const before = await player(page);
  expect(await legacyKeys(page)).toEqual([null, null]);

  await page.reload();
  await waitForWorld(page);
  // Ort höchstens eine Kachel neben dem vorigen (unter Mama), Aufgabe, Beeren und Platz 3 wie vorher
  const after = await player(page);
  expect(Math.hypot(after.x - BELOW_MAMA.x, after.y - BELOW_MAMA.y)).toBeLessThanOrEqual(TILE);
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThanOrEqual(TILE);
  await expect(quest(page).locator('.hud-quest__name')).toHaveText('Opas Auftrag');
  await expect(quest(page).locator('.hud-quest__count')).toHaveText('0/5');
  await expect(berries(page).locator('.hotbar__count')).toHaveText('5');
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
  await expect(page.locator('.hotbar .ui-slot.is-selected')).toHaveCount(1);
  await expect(page.locator('.ui-window')).toHaveCount(0);

  expect(await legacyKeys(page)).toEqual([null, null]);
  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
});
