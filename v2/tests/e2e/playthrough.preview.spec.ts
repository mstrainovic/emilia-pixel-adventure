import { test, expect, type Page } from '@playwright/test';
import { readPng } from './helpers/png';

/*
 * Durchspiel-Test gegen das gebaute Paket (Projekt „ausgeliefert", ohne Test-Zugang): nur Tasten und sichtbare Texte.
 * Ohne Ortsangabe wird Emilia mit festen Tastendauern geführt, und jede Strecke endet an etwas Festem, das sie
 * ausrichtet. Jede Taste wird mindestens doppelt so lange plus 1 s gehalten wie nötig: Der Rechner der Auslieferung
 * stockt etwa 1 s nach dem Seitenstart bis zu 1 s, und ein Bild rückt höchstens MAX_DT (0,1 s) weiter – fällt das
 * Stocken in eine Strecke, fehlen ihr bis zu 0,9 s Weg.
 *
 * Weg (Kacheln von hub.json, Fußpunkt in Bildpunkten; Körper 10×6, Unterkante am Fuß; Tempo 64 px/s, schräg je
 * Achse 45 px/s):
 * 1. A: vom Start 19/14 (312/232) auf Zeile 14 nach links bis an den Busch 5/14 → Fuß x = 101 (211 px, 3,3 s).
 * 2. W: Spalte 6 hinauf bis an den Busch 6/11 → Fuß y = 198 (34 px, 0,5 s).
 * 3. W+D: schräg nach rechts oben. Der Busch hält y fest, bis der Körper rechts an ihm vorbei ist; dann geht es in
 *    der Lücke 7/11 links an Mama (8/11, fest) entlang hinauf, über ihr nach rechts oben bis in die Ecke 8/9 zwischen
 *    Haus (8/8, oben) und Truhe (9/9, rechts) → Fuß 139/150 (etwa 70 px je Achse gerechnet, 1,6 s).
 * 4. S: Spalte 8 hinab bis an Mama → Fuß 139/176, 8 px über und 3 px neben ihrem Fuß 136/184 (Reichweite 26 px).
 * Mit dem Test-Zugang nachgemessen (Chromium und WebKit, auch mit 1 s künstlichem Stocken in jeder Strecke): nach den
 * vier Strecken stand Emilia jedes Mal genau auf 101/232, 101/198, 139/150, 139/176.
 * An keiner Wand rutscht Emilia um die Ecke: jeder Überstand ist größer als CORNER_NUDGE (5 px).
 */
const LEGS: readonly { name: string; keys: readonly string[]; ms: number }[] = [
  { name: '1. A: auf Zeile 14 nach links bis an den Busch 5/14', keys: ['KeyA'], ms: 8000 },
  { name: '2. W: Spalte 6 hinauf bis an den Busch 6/11', keys: ['KeyW'], ms: 2500 },
  { name: '3. W+D: schräg an Mama vorbei in die Ecke 8/9 zwischen Haus und Truhe', keys: ['KeyW', 'KeyD'], ms: 4500 },
  { name: '4. S: Spalte 8 hinab bis an Mama', keys: ['KeyS'], ms: 2500 },
];

const LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save';
const LEGACY_MUTED_KEY = 'emilia_muted';

function watchProblems(page: Page): { errors: string[]; foreign: string[] } {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5184\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  return { errors, foreign };
}

/** Ohne Test-Zugang gibt es kein ready-Signal: warten, bis die Anzeige sichtbar und das Dorf gezeichnet ist. */
async function waitForVillage(page: Page): Promise<void> {
  await expect(page.locator('.hud-quest')).toBeVisible();
  await expect
    .poll(async () => {
      const png = readPng(await page.screenshot({ scale: 'device' }));
      const colors = new Set<number>();
      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          const [r, g, b] = png.at(x, y);
          colors.add((r << 16) | (g << 8) | b);
        }
      }
      return colors.size;
    }, { timeout: 15_000 })
    .toBeGreaterThanOrEqual(16);
}

async function hold(page: Page, keys: readonly string[], ms: number): Promise<void> {
  for (const k of keys) await page.keyboard.down(k);
  try {
    await page.waitForTimeout(ms);
  } finally {
    for (const k of keys) await page.keyboard.up(k);
  }
}

const legacyKeys = (page: Page): Promise<(string | null)[]> =>
  page.evaluate((keys) => keys.map((k) => localStorage.getItem(k)), [LEGACY_SAVE_KEY, LEGACY_MUTED_KEY]);

const quest = (page: Page) => page.locator('.hud-quest');
const berries = (page: Page) => page.locator('.hotbar .ui-slot[aria-label="Beere, 5 Stück"]');
const slots = (page: Page) => page.locator('.hotbar .ui-slot');

/** Erwartet Aufgabe und Beeren so, wie sie nach dem Gespräch mit Mama sind. */
async function expectAfterMama(page: Page): Promise<void> {
  await expect(quest(page).locator('.hud-quest__name')).toHaveText('Opas Auftrag');
  await expect(quest(page).locator('.hud-quest__count')).toHaveText('0/5');
  await expect(berries(page).locator('.hotbar__count')).toHaveText('5');
}

/** E öffnet das Gespräch mit Mama, E schließt es wieder. */
async function talkToMama(page: Page): Promise<void> {
  const box = page.locator('.dialogue__box');
  await page.keyboard.press('KeyE');
  await expect(box).toBeVisible();
  await expect(box.locator('.dialogue__name')).toHaveText('Mama Tanja');
  await page.keyboard.press('KeyE');
  await expect(box).toBeHidden();
}

test('Durchspiel im gebauten Paket: mit festen Tasten zu Mama, reden, Platz 3, Hilfe, neu laden', async ({ page }) => {
  test.setTimeout(120_000);
  const { errors, foreign } = watchProblems(page);
  await page.goto('./');
  await waitForVillage(page);
  expect(await page.evaluate(() => (window as any).__emilia2)).toBeUndefined();
  // frischer Browser-Kontext: kein Hinweis, keine Frage nach dem alten Stand, die alten Schlüssel gibt es nicht
  await expect(page.locator('.ui-window')).toHaveCount(0);
  expect(await legacyKeys(page)).toEqual([null, null]);

  // je Wegstück ein Schritt: scheitert der Durchspiel-Test, nennt der Bericht das Wegstück
  for (const leg of LEGS) await test.step(`Weg ${leg.name}`, () => hold(page, leg.keys, leg.ms));

  await talkToMama(page);
  await expectAfterMama(page);

  await page.keyboard.press('Digit3');
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
  await expect(page.locator('.hotbar .ui-slot.is-selected')).toHaveCount(1);

  await page.keyboard.press('KeyH');
  const help = page.locator('.ui-window[data-window="help"]');
  await expect(help).toBeVisible();
  await expect(help.locator('.ui-window__title')).toHaveText('Hilfe');
  await page.keyboard.press('Escape');
  await expect(page.locator('.ui-window')).toHaveCount(0);
  expect(await legacyKeys(page)).toEqual([null, null]);

  await page.reload();
  await waitForVillage(page);
  await expectAfterMama(page);
  await expect(slots(page).nth(2)).toHaveClass(/is-selected/);
  await expect(page.locator('.hotbar .ui-slot.is-selected')).toHaveCount(1);
  await expect(page.locator('.ui-window')).toHaveCount(0);
  // Emilia steht noch bei Mama: E öffnet das Gespräch ohne einen Schritt
  await talkToMama(page);

  expect(await legacyKeys(page)).toEqual([null, null]);
  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
});
