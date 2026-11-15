import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page, type Locator } from '@playwright/test';

/*
 * Reden im Dorf (Plan 1b, Task 7). Mama Tanja steht auf Kachel 8/11 (Blick nach unten); rechts neben ihr (9/11) ist
 * frei. Zeit wird in Spielzeit oder über Bedingungen abgewartet, nie mit kurzen Grenzen auf der Wanduhr (regeln.md).
 */

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
const MAMA = { x: 8 * 16 + 8, y: 11 * 16 + 8 };

type Marker = { visible: boolean; npcId: string | null; x: number; y: number };
interface TalkState {
  open: boolean;
  talks: number;
  cooldown: number;
  context: { kind: string; npcId?: string; target?: string } | null;
  keyHint: Marker;
  questHint: Marker;
}

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

/** Wartet auf Welt, Test-Zugang und sichtbare Anzeige. */
async function openWorld(page: Page): Promise<void> {
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.talkState === 'function' && typeof h.skipTime === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await expect(page.locator('.hud-quest')).toBeVisible();
}

const talkState = (page: Page): Promise<TalkState> => page.evaluate(() => (window as any).__emilia2.talkState());
const state = (page: Page): Promise<any> => page.evaluate(() => (window as any).__emilia2.state());
const player = (page: Page): Promise<{ x: number; y: number }> => page.evaluate(() => (window as any).__emilia2.player());
const mama = (page: Page): Promise<{ facing: string; x: number; y: number }> =>
  page.evaluate(() => (window as any).__emilia2.villagers().find((v: { npcId: string }) => v.npcId === 'mama_tanja'));
const box = (page: Page): Locator => page.locator('.dialogue__box');
const toasts = (page: Page): Locator => page.locator('.toast');

/** Wartet `count` gezeichnete Bilder ab (Spielzeit statt Wanduhr). */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

/** Rechts neben Mama, bis sie ansprechbar ist (Tasten-Bild über ihr). */
async function besideMama(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).__emilia2.teleport(9, 11));
  await expect.poll(async () => (await talkState(page)).keyHint).toMatchObject({ visible: true, npcId: 'mama_tanja' });
}

/** E drücken und warten, bis das Gespräch offen bzw. zu ist. */
async function pressE(page: Page, open: boolean): Promise<void> {
  await page.keyboard.press('KeyE');
  await expect.poll(async () => (await talkState(page)).open).toBe(open);
}

/** Wartet, bis die Sperre nach dem Gespräch abgelaufen ist (in Spielzeit). */
async function cooledDown(page: Page): Promise<void> {
  await expect.poll(async () => (await talkState(page)).cooldown).toBe(0);
}

test('mit Mama reden: Feld mit einem Satz, Spiel hält an, danach Aufgabe geschafft, Beeren und Freundschaft', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await besideMama(page);
  const before = await talkState(page);
  expect(before.context).toEqual({ kind: 'talk', npcId: 'mama_tanja' });
  // Hinweis-Symbol über Mamas Kopf (ihre Aufgabe „Guten Morgen!"), Tasten-Bild darüber; beide auf ganzen Bildpunkten
  expect(before.questHint).toMatchObject({ visible: true, npcId: 'mama_tanja' });
  for (const m of [before.keyHint, before.questHint]) {
    expect(Number.isInteger(m.x) && Number.isInteger(m.y)).toBe(true);
    expect(m.y).toBeLessThan(MAMA.y - 16);
    expect(Math.abs(m.x - MAMA.x)).toBeLessThanOrEqual(8);
  }
  expect(before.keyHint.y).toBeLessThan(before.questHint.y);
  expect((await mama(page)).facing).toBe('down');

  await pressE(page, true);
  await expect(box(page)).toBeVisible();
  await expect(box(page).locator('.dialogue__name')).toHaveText('Mama Tanja');
  await expect(box(page).locator('.dialogue__face')).toHaveAttribute('src', /mama_tanja-gesicht/);
  // höchstens zwei Zeilen, jede auch im Bild genau eine Zeile hoch
  const lines = box(page).locator('.dialogue__line');
  expect(await lines.count()).toBeGreaterThanOrEqual(1);
  expect(await lines.count()).toBeLessThanOrEqual(2);
  const heights = await lines.evaluateAll((list) => list.map((l) => l.getBoundingClientRect().height / parseFloat(getComputedStyle(l).lineHeight)));
  for (const h of heights) expect(h).toBeLessThan(1.5);
  // Mama dreht sich zu Emilia (rechts von ihr)
  expect((await mama(page)).facing).toBe('right');
  expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(true);
  // während des Gesprächs läuft Emilia nicht
  const start = await player(page);
  await page.keyboard.down('KeyD');
  await frames(page, 30);
  expect((await player(page)).x).toBe(start.x);
  await page.keyboard.up('KeyD');
  // der Hinweis zur Aufgabe wartet, bis das Gespräch zu ist
  await expect(toasts(page)).toHaveCount(0);

  await pressE(page, false);
  await expect(box(page)).toBeHidden();
  const done = toasts(page).filter({ hasText: 'Aufgabe geschafft!' });
  await expect(done).toBeVisible();
  await expect(done.locator('.toast__icon')).toHaveAttribute('src', /beere/);
  const quest = page.locator('.hud-quest');
  await expect(quest.locator('.hud-quest__name')).toHaveText('Opas Auftrag');
  await expect(quest.locator('.hud-quest__count')).toHaveText('0/5');
  // Beeren in der Schnellleiste, die Anzahl liegt innerhalb des Rahmens ihres Platzes
  const berries = page.locator('.hotbar .ui-slot[aria-label="Beere, 5 Stück"]');
  await expect(berries).toHaveCount(1);
  await expect(berries.locator('.hotbar__count')).toHaveText('5');
  const fit = await berries.evaluate((slot) => {
    const s = slot.getBoundingClientRect();
    const c = slot.querySelector('.hotbar__count')!.getBoundingClientRect();
    const st = getComputedStyle(slot);
    const inner = {
      left: s.left + parseFloat(st.paddingLeft), top: s.top + parseFloat(st.paddingTop),
      right: s.right - parseFloat(st.paddingRight), bottom: s.bottom - parseFloat(st.paddingBottom),
    };
    return { inner, count: { left: c.left, top: c.top, right: c.right, bottom: c.bottom } };
  });
  expect(fit.count.left).toBeGreaterThanOrEqual(fit.inner.left - 0.01);
  expect(fit.count.top).toBeGreaterThanOrEqual(fit.inner.top - 0.01);
  expect(fit.count.right).toBeLessThanOrEqual(fit.inner.right + 0.01);
  expect(fit.count.bottom).toBeLessThanOrEqual(fit.inner.bottom + 0.01);
  expect((await state(page)).friendship.mama_tanja.points).toBe(12);
  // Aufgabe erledigt: kein Symbol mehr über Mama, sie dreht sich zurück, das Spiel läuft wieder
  await expect.poll(async () => (await talkState(page)).questHint.visible).toBe(false);
  expect((await mama(page)).facing).toBe('down');
  expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(false);
  expect(errors).toEqual([]);
});

test('E gehalten öffnet das Gespräch genau einmal; zwei schnelle Drücke nach dem Schließen öffnen es nicht wieder', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await besideMama(page);
  // fern vom Seitenstart (dort stockt der Rechner der Auslieferung bis zu 1 s)
  await expect.poll(async () => (await state(page)).dayNight.totalTime, { timeout: 10_000 }).toBeGreaterThan(2);
  // gehalten: der erste keydown, danach Wiederholungen der Tastatur (repeat) für 1,5 s
  await page.keyboard.down('KeyE');
  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(33);
    await page.keyboard.down('KeyE');
  }
  await page.keyboard.up('KeyE');
  await frames(page, 5);
  expect(await talkState(page)).toMatchObject({ open: true, talks: 1 });
  // Nach dem Loslassen schließt ein weiterer Druck, gleich darauf zwei Drücke im Abstand von 100 ms SPIELZEIT – alles
  // in der Seite, Bild für Bild, ohne Rundreisen und ohne Wanduhr. Gemessen wird, wie viel Spielzeit seit dem Schließen
  // bei jedem Druck vergangen war; beide müssen in der Sperre (0,3 s) liegen, sonst ist der Lauf ungültig.
  const run = await page.evaluate(() => new Promise<{ atFirst: number; atSecond: number; talks: number; open: boolean }>((resolve) => {
    const h = (window as any).__emilia2;
    const clock = (): number => h.state().dayNight.totalTime;
    const tap = (): void => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE', key: 'e', bubbles: true }));
    };
    tap();
    let closedAt = -1, atFirst = -1, atSecond = -1, after = 0;
    const step = (): void => {
      const s = h.talkState();
      if (closedAt < 0) {
        if (!s.open) { closedAt = clock(); tap(); }
      } else if (s.open) {
        // wieder offen: das Spiel steht, die Spielzeit liefe nicht weiter – sofort melden
        resolve({ atFirst, atSecond, talks: s.talks, open: s.open });
        return;
      } else if (atFirst < 0) {
        // ein Bild später ist der erste Druck abgeholt: so viel Spielzeit war seit dem Schließen vergangen
        atFirst = clock() - closedAt;
      } else if (atSecond < 0) {
        if (clock() - closedAt >= 0.1) { atSecond = clock() - closedAt; tap(); }
      } else if (++after >= 10) {
        resolve({ atFirst, atSecond, talks: s.talks, open: s.open });
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }));
  // kein neues Gespräch; beide Drücke lagen sicher in der Sperre (ein Bild Verzug für das Abholen eingerechnet)
  expect(run, 'ein Druck in der Sperre hat das Gespräch wieder geöffnet').toMatchObject({ open: false, talks: 1 });
  expect(run.atFirst, 'erster Druck kam erst nach der Sperre – Rechner hat gestockt, Lauf ungültig').toBeLessThan(0.15);
  expect(run.atSecond, 'zweiter Druck kam erst nach der Sperre – Rechner hat gestockt, Lauf ungültig').toBeLessThan(0.2);
  // nichts klemmt: nach der Sperre öffnet E wieder
  await cooledDown(page);
  await pressE(page, true);
  expect((await talkState(page)).talks).toBe(2);
  expect(errors).toEqual([]);
});

test('Esc, Enter, Leertaste und ein Klick auf das Feld schließen das Gespräch genau einmal, ohne es wieder zu öffnen', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await besideMama(page);
  const ways: Array<[string, () => Promise<void>]> = [
    ['Esc', () => page.keyboard.press('Escape')],
    ['Enter', () => page.keyboard.press('Enter')],
    ['Leertaste', () => page.keyboard.press('Space')],
    ['Klick', () => box(page).click()],
  ];
  let talks = 0;
  for (const [name, close] of ways) {
    await cooledDown(page);
    await pressE(page, true);
    talks += 1;
    await close();
    await expect.poll(async () => (await talkState(page)).open, { message: name }).toBe(false);
    await expect(box(page), name).toBeHidden();
    await frames(page, 10);
    expect(await talkState(page), name).toMatchObject({ open: false, talks });
    expect(await page.evaluate(() => (window as any).__emilia2.paused()), name).toBe(false);
    // auch auf diesen Wegen dreht Mama sich zurück
    expect((await mama(page)).facing, name).toBe('down');
  }
  expect(errors).toEqual([]);
});

test('zweites Gespräch am selben Tag: anderer Satz, keine Punkte; am nächsten Tag wieder zwei Punkte', async ({ page }) => {
  await openWorld(page);
  await besideMama(page);
  const lineText = (): Promise<string> => box(page).locator('.dialogue__lines').innerText();
  await pressE(page, true);
  const first = await lineText();
  await pressE(page, false);
  expect((await state(page)).friendship.mama_tanja.points).toBe(12);

  await cooledDown(page);
  await pressE(page, true);
  expect(await lineText()).not.toBe(first);
  await pressE(page, false);
  expect((await state(page)).friendship.mama_tanja.points).toBe(12);

  await cooledDown(page);
  await page.evaluate(() => (window as any).__emilia2.skipTime(750));
  await pressE(page, true);
  await pressE(page, false);
  expect((await state(page)).friendship.mama_tanja.points).toBe(14);
});

test('nach dem Neuladen bleibt die Aufgabe „Opas Auftrag" und die Beeren bleiben', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await besideMama(page);
  await pressE(page, true);
  await pressE(page, false);
  await expect(page.locator('.hud-quest__name')).toHaveText('Opas Auftrag');
  // gespeichert wurde gleich nach der Aufgabe, nicht erst beim Verlassen der Seite
  expect(await page.evaluate(() => (window as any).__emilia2.lastSaveResult())).toMatchObject({ reason: 'quest', result: { kind: 'saved' } });
  await page.reload();
  await openWorld(page);
  await expect(page.locator('.hud-quest__name')).toHaveText('Opas Auftrag');
  await expect(page.locator('.hotbar .ui-slot[aria-label="Beere, 5 Stück"]')).toHaveCount(1);
  expect((await state(page)).inventory.slots.some((s: { itemId: string | null; count: number }) => s.itemId === 'berry' && s.count === 5)).toBe(true);
  expect(errors).toEqual([]);
});

test('im Nordausgang: Hinweis „Hier geht es bald weiter.", die Karte wechselt nicht', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await page.evaluate(() => (window as any).__emilia2.teleport(19, 3));
  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await player(page)).y, { timeout: 10_000 }).toBeLessThan(32);
  await page.keyboard.up('KeyW');
  const soon = toasts(page).filter({ hasText: 'Hier geht es bald weiter.' });
  await expect(soon).toBeVisible();
  expect((await talkState(page)).context).toEqual({ kind: 'exit', target: 'forest' });
  // einmal je Betreten: Stehenbleiben bringt keinen zweiten Hinweis
  await frames(page, 20);
  await expect(soon).toHaveCount(1);
  expect(await page.evaluate(() => (window as any).__emilia2.world.map)).toBe('hub');
  expect(errors).toEqual([]);
});

test.describe('Gesprächsfeld und Hinweis auf ganzen Pixeln', () => {
  for (const dpr of [1, 1.25, 1.5]) {
    test(`bei Dichte ${dpr}: Lage auf ganzen CSS- und Gerätepixeln, Größe in ganzen Bildpunkten`, async ({ browser, baseURL, browserName }) => {
      test.skip(browserName === 'webkit' && !Number.isInteger(dpr), 'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte');
      const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 720 }, deviceScaleFactor: dpr });
      const page = await context.newPage();
      await openWorld(page);
      await expect.poll(() => page.evaluate(() => document.fonts.check('bold 16px Nunito'))).toBe(true);
      await besideMama(page);
      await pressE(page, true);
      const measure = (selector: string): Promise<{ left: number; top: number; width: number; height: number; hud: number }> =>
        page.locator(selector).first().evaluate((n) => {
          const r = n.getBoundingClientRect();
          const hud = parseFloat(getComputedStyle(n).getPropertyValue('--hud-px'));
          return { left: r.left, top: r.top, width: r.width, height: r.height, hud };
        });
      const problems: string[] = [];
      const check = async (selector: string): Promise<void> => {
        const b = await measure(selector);
        const whole = (v: number): boolean => Math.abs(v - Math.round(v)) <= 0.01;
        if (!whole(b.left) || !whole(b.top) || !whole(b.left * dpr) || !whole(b.top * dpr)) problems.push(`${selector}: Ecke ${b.left},${b.top}`);
        if (!whole(b.width / b.hud) || !whole(b.height / b.hud)) problems.push(`${selector}: Größe ${b.width}×${b.height} bei --hud-px ${b.hud}`);
      };
      // warten, bis das Feld eingerastet ist (ResizeObserver)
      await frames(page, 3);
      await check('.dialogue__box');
      await pressE(page, false);
      await expect(toasts(page).first()).toBeVisible();
      await frames(page, 3);
      await check('.toast');
      expect(problems).toEqual([]);
      await context.close();
    });
  }
});

test('Bilder vom Reden für die Durchsicht', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium', 'ein Satz Bilder genügt');
  mkdirSync(ARTIFACTS, { recursive: true });
  for (const shot of [{ width: 1280, height: 720, dpr: 1 }, { width: 1024, height: 768, dpr: 2 }]) {
    const context = await browser.newContext({ baseURL, viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: shot.dpr });
    const page = await context.newPage();
    await openWorld(page);
    await expect.poll(() => page.evaluate(() => document.fonts.check('bold 16px Nunito') && document.fonts.check('16px EmiliaZahlen', '0'))).toBe(true);
    await besideMama(page);
    await frames(page, 3);
    const name = `${shot.width}x${shot.height}@${shot.dpr}x`;
    writeFileSync(`${ARTIFACTS}task-7-vor-dem-gespraech-${name}.png`, await page.screenshot({ scale: 'device' }));
    await pressE(page, true);
    await frames(page, 3);
    writeFileSync(`${ARTIFACTS}task-7-gespraech-${name}.png`, await page.screenshot({ scale: 'device' }));
    if (shot.dpr === 1) {
      await pressE(page, false);
      await expect(toasts(page).filter({ hasText: 'Aufgabe geschafft!' })).toBeVisible();
      await expect(page.locator('.hud-quest__name')).toHaveText('Opas Auftrag');
      await frames(page, 3);
      writeFileSync(`${ARTIFACTS}task-7-nach-dem-gespraech-${name}.png`, await page.screenshot({ scale: 'device' }));
    }
    await context.close();
  }
});
