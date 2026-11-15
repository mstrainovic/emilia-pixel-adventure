import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Browser, type Page } from '@playwright/test';

/*
 * Touch-Bedienung (Plan 1b, Task 8). Läuft in Chromium und WebKit, je in einem eigenen Kontext mit `hasTouch`.
 * Berührungen sind `PointerEvent`s mit `pointerType: 'touch'` und eigener `pointerId` je Finger, im Seitenkontext
 * am Element unter dem Punkt ausgelöst (wie der Browser: das Element unter dem Finger, Ereignisse steigen auf).
 * Tempo und Abbremsen werden in Spielzeit gemessen (`dayNight.totalTime`), UI-Zeitgeber über Bedingungen mit
 * großzügiger Frist (regeln.md: der Rechner der Auslieferung stockt kurz nach dem Start).
 */

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1b/', import.meta.url));
const IPAD = { viewport: { width: 1080, height: 810 }, deviceScaleFactor: 2, hasTouch: true };
/** Daumen links unten in der Stick-Zone (iPad quer). */
const THUMB = { x: 150, y: 650 };
const WALK_SPEED = 64;
const RUN_SPEED = 112;
/**
 * Auslenkung 0,9 (8 + 0,9 × 32 Pixel): Emilia geht. Aus dem Rennen bremst sie mit der Beschleunigung des Gehens
 * (stepMover: nach dem Loslassen ist run falsch), 112 / 640 = 0,175 s – das ist das Bewegungsmodell, nicht der Stick.
 */
const WALK_DX = 36.8;

test.use(IPAD);

type PointerType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

async function openWorld(page: Page): Promise<void> {
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.touchState === 'function' && typeof h.talkState === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await expect(page.locator('.hud-quest')).toBeVisible();
}

/** Ein Finger: Zeiger-Ereignis am Element unter dem Punkt (wie der Browser ohne Zeiger-Fang). */
async function finger(page: Page, type: PointerType, id: number, x: number, y: number): Promise<void> {
  await page.evaluate(({ type, id, x, y }) => {
    const target = document.elementFromPoint(x, y) ?? document.body;
    const up = type === 'pointerup' || type === 'pointercancel';
    target.dispatchEvent(new PointerEvent(type, {
      pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: x, clientY: y,
      button: type === 'pointermove' ? -1 : 0, buttons: up ? 0 : 1, bubbles: true, cancelable: true, composed: true,
    }));
  }, { type, id, x, y });
}

/** Kurz tippen (Aufsetzen und Abheben an derselben Stelle). */
async function tap(page: Page, id: number, x: number, y: number): Promise<void> {
  await finger(page, 'pointerdown', id, x, y);
  await finger(page, 'pointerup', id, x, y);
}

interface TouchState { device: string; move: { x: number; y: number }; run: boolean; held: boolean }
const touchState = (page: Page): Promise<TouchState> => page.evaluate(() => (window as any).__emilia2.touchState());
const talkState = (page: Page): Promise<{ open: boolean; talks: number; cooldown: number; keyHint: { visible: boolean } }> =>
  page.evaluate(() => (window as any).__emilia2.talkState());
const player = (page: Page): Promise<{ x: number; y: number; moving: boolean }> => page.evaluate(() => (window as any).__emilia2.player());

/** Wartet `count` gezeichnete Bilder ab (Spielzeit statt Wanduhr). */
async function frames(page: Page, count: number): Promise<void> {
  await page.evaluate((n) => new Promise<void>((resolve) => {
    let left = n;
    const step = (): void => { if (--left <= 0) resolve(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), count);
}

/** Mitte eines Elements in CSS-Pixeln. */
async function center(page: Page, selector: string): Promise<{ x: number; y: number }> {
  const box = (await page.locator(selector).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Stick um `dx` nach rechts auslenken und das Tempo in Spielzeit messen: nach `settle` Sekunden Anlauf werden Weg
 * und Spielzeit Bild für Bild summiert, bis `span` Sekunden beisammen sind. Bilder mit mehr als 0,1 s Spielzeit
 * (Stocken; stepMover rechnet dann nur MAX_DT) zählen nicht. Danach hebt der Finger ab.
 */
async function measureStick(page: Page, dx: number, settle: number, span: number): Promise<{ speed: number; x: number }> {
  return page.evaluate(({ start, dx, settle, span }) => new Promise<{ speed: number; x: number }>((resolve) => {
    const h = (window as any).__emilia2;
    const fire = (type: string, x: number, y: number): void => {
      (document.elementFromPoint(x, y) ?? document.body).dispatchEvent(new PointerEvent(type, {
        pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, button: type === 'pointermove' ? -1 : 0,
        buttons: type === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true, composed: true,
      }));
    };
    const sample = (): { x: number; t: number } => ({ x: h.player().x, t: h.state().dayNight.totalTime });
    fire('pointerdown', start.x, start.y);
    fire('pointermove', start.x + dx, start.y);
    const t0 = sample().t;
    let prev = sample();
    let dist = 0;
    let time = 0;
    const tick = (): void => {
      const now = sample();
      const dt = now.t - prev.t;
      if (now.t - t0 > settle && dt > 0 && dt <= 0.1) {
        dist += now.x - prev.x;
        time += dt;
      }
      prev = now;
      if (time >= span) {
        fire('pointerup', start.x + dx, start.y);
        resolve({ speed: dist / time, x: now.x });
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }), { start: THUMB, dx, settle, span });
}

/** Rechts neben Mama (sie steht auf 8/11), bis sie ansprechbar ist. */
async function besideMama(page: Page): Promise<void> {
  await page.evaluate(() => (window as any).__emilia2.teleport(9, 11));
  await expect.poll(async () => (await page.evaluate(() => (window as any).__emilia2.talkState())).context).toEqual({ kind: 'talk', npcId: 'mama_tanja' });
}

test('Stick: 40 Pixel nach rechts → Emilia rennt nach rechts; halbe Auslenkung → halbes Gehtempo (± 20 %)', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  // freie Strecke nach rechts
  await page.evaluate(() => (window as any).__emilia2.teleport(12, 13));
  const before = await player(page);
  const full = await measureStick(page, 40, 0.2, 0.4);
  expect(full.x).toBeGreaterThan(before.x + 20);
  expect(full.speed).toBeGreaterThan(RUN_SPEED * 0.8);
  expect(full.speed).toBeLessThan(RUN_SPEED * 1.2);
  await expect.poll(async () => (await player(page)).moving).toBe(false);
  await page.evaluate(() => (window as any).__emilia2.teleport(12, 13));
  // Betrag 0,5: 8 Pixel tote Zone + 16 von 32
  const half = await measureStick(page, 24, 0.2, 0.8);
  expect(half.speed).toBeGreaterThan((WALK_SPEED / 2) * 0.8);
  expect(half.speed).toBeLessThan((WALK_SPEED / 2) * 1.2);
  expect((await touchState(page)).held).toBe(false);
  expect(errors).toEqual([]);
});

test('neben Mama: Finger 1 hält den Stick, Finger 2 tippt den Kontext-Knopf → Gespräch öffnet; Tippen schließt genau einmal', async ({ page }) => {
  const errors = watchErrors(page);
  await openWorld(page);
  await besideMama(page);
  // Finger 1 hält den Stick (in der toten Zone, damit Emilia bei Mama bleibt)
  await finger(page, 'pointerdown', 1, THUMB.x, THUMB.y);
  await finger(page, 'pointermove', 1, THUMB.x + 3, THUMB.y);
  expect((await touchState(page)).held).toBe(true);
  // der Knopf zeigt die Sprechblase und ist nicht blass
  const button = page.locator('.touch-act__button');
  await expect(button).toBeVisible();
  await expect(button.locator('.touch-act__icon')).toBeVisible();
  await expect(button.locator('.touch-act__icon')).toHaveAttribute('src', /sprechblase/);
  await expect(button).not.toHaveClass(/is-idle/);
  await expect(button).toHaveAttribute('aria-label', 'Reden');
  const knopf = await center(page, '.touch-act__button');
  await tap(page, 2, knopf.x, knopf.y);
  await expect.poll(async () => (await talkState(page)).open).toBe(true);
  expect((await talkState(page)).talks).toBe(1);
  // das Gespräch hält an und lässt den Stick los: Emilia läuft danach nicht weiter
  expect((await touchState(page)).held).toBe(false);
  await finger(page, 'pointerup', 1, THUMB.x + 3, THUMB.y);
  // ohne Ziel (angehalten) ist der Knopf blass
  await expect(button).toHaveClass(/is-idle/);

  // Knopf schließt genau einmal, ohne wieder zu öffnen
  await tap(page, 2, knopf.x, knopf.y);
  await expect.poll(async () => (await talkState(page)).open).toBe(false);
  await frames(page, 10);
  expect(await talkState(page)).toMatchObject({ open: false, talks: 1 });

  // nach der Sperre: öffnen, dann Tippen ins Spielbild schließt
  await expect.poll(async () => (await talkState(page)).cooldown).toBe(0);
  await tap(page, 2, knopf.x, knopf.y);
  await expect.poll(async () => (await talkState(page)).open).toBe(true);
  await tap(page, 3, 540, 200);
  await expect.poll(async () => (await talkState(page)).open).toBe(false);
  await frames(page, 10);
  expect(await talkState(page)).toMatchObject({ open: false, talks: 2 });

  // nach der Sperre: öffnen, Tippen in die Stick-Zone schließt und startet keinen Stick
  await expect.poll(async () => (await talkState(page)).cooldown).toBe(0);
  await tap(page, 2, knopf.x, knopf.y);
  await expect.poll(async () => (await talkState(page)).open).toBe(true);
  await finger(page, 'pointerdown', 4, THUMB.x, THUMB.y);
  await expect.poll(async () => (await talkState(page)).open).toBe(false);
  expect((await touchState(page)).held).toBe(false);
  await finger(page, 'pointerup', 4, THUMB.x, THUMB.y);
  await frames(page, 10);
  expect(await talkState(page)).toMatchObject({ open: false, talks: 3 });
  expect(errors).toEqual([]);
});

for (const end of ['pointercancel', 'lostpointercapture', 'pointerup'] as const) {
  test(`${end} beim Laufen → Emilia steht binnen 0,2 s Spielzeit`, async ({ page }) => {
    const errors = watchErrors(page);
    await openWorld(page);
    await page.evaluate(() => (window as any).__emilia2.teleport(12, 13));
    await finger(page, 'pointerdown', 1, THUMB.x, THUMB.y);
    await finger(page, 'pointermove', 1, THUMB.x + WALK_DX, THUMB.y);
    await expect.poll(async () => (await player(page)).moving).toBe(true);
    // Abbruch und Messen in einem Zug, Bild für Bild in Spielzeit
    const stopped = await page.evaluate(({ end, x, y }) => new Promise<number>((resolve) => {
      const h = (window as any).__emilia2;
      const zone = document.querySelector('.touch-zone')!;
      const init = { pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, composed: true };
      // lostpointercapture kommt am fangenden Element an (hier: die Zone), die anderen am Element unter dem Finger
      const target = end === 'lostpointercapture' ? zone : (document.elementFromPoint(x, y) ?? document.body);
      // Spielzeit je Bild höchstens MAX_DT (0,1 s), wie stepMover sie rechnet: ein gestocktes Bild zählt nicht voll
      let last = h.state().dayNight.totalTime;
      let elapsed = 0;
      target.dispatchEvent(new PointerEvent(end, init));
      const tick = (): void => {
        const now = h.state().dayNight.totalTime;
        elapsed += Math.min(Math.max(0, now - last), 0.1);
        last = now;
        if (h.player().moving === false) resolve(elapsed);
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { end, x: THUMB.x + WALK_DX, y: THUMB.y });
    expect(stopped).toBeLessThanOrEqual(0.2);
    expect(await touchState(page)).toMatchObject({ held: false, move: { x: 0, y: 0 } });
    expect(errors).toEqual([]);
  });
}

for (const leave of ['blur', 'pagehide', 'visibilitychange'] as const) {
  test(`Seite verschwindet beim Laufen (${leave}) → der Stick lässt los, ein neuer Finger steuert wieder`, async ({ page }) => {
    const errors = watchErrors(page);
    await openWorld(page);
    await page.evaluate(() => (window as any).__emilia2.teleport(12, 13));
    await finger(page, 'pointerdown', 1, THUMB.x, THUMB.y);
    await finger(page, 'pointermove', 1, THUMB.x + WALK_DX, THUMB.y);
    await expect.poll(async () => (await player(page)).moving).toBe(true);
    // wie der Browser: das Fenster verliert den Fokus, die Seite wird verlassen oder verborgen – ein pointerup kommt nie
    await page.evaluate((how) => {
      if (how === 'visibilitychange') {
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
        Object.defineProperty(document, 'hidden', { value: true, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        delete (document as any).visibilityState;
        delete (document as any).hidden;
      } else {
        window.dispatchEvent(new Event(how));
      }
    }, leave);
    expect(await touchState(page)).toMatchObject({ held: false, move: { x: 0, y: 0 } });
    await expect.poll(async () => (await player(page)).moving).toBe(false);
    await expect(page.locator('.touch-stick')).not.toHaveClass(/is-active/);
    // die Zone ist frei: ein neuer Finger steuert sofort
    await finger(page, 'pointerdown', 2, THUMB.x, THUMB.y);
    await finger(page, 'pointermove', 2, THUMB.x + WALK_DX, THUMB.y);
    expect((await touchState(page)).held).toBe(true);
    await expect.poll(async () => (await player(page)).moving).toBe(true);
    await finger(page, 'pointerup', 2, THUMB.x + WALK_DX, THUMB.y);
    expect((await touchState(page)).held).toBe(false);
    expect(errors).toEqual([]);
  });
}

test('Finger rutscht weit aus der Zone → Stick bleibt bei Betrag 1 und lässt beim Abheben los', async ({ page }) => {
  await openWorld(page);
  await page.evaluate(() => (window as any).__emilia2.teleport(12, 13));
  await finger(page, 'pointerdown', 1, THUMB.x, THUMB.y);
  // 300 Pixel nach rechts und 300 nach oben: über der Zone (linke untere Fläche) hinaus
  await finger(page, 'pointermove', 1, THUMB.x + 300, THUMB.y - 300);
  const zone = (await page.locator('.touch-zone').boundingBox())!;
  expect(THUMB.y - 300).toBeLessThan(zone.y);
  const s = await touchState(page);
  expect(s.held).toBe(true);
  expect(Math.hypot(s.move.x, s.move.y)).toBeCloseTo(1, 5);
  expect(s.run).toBe(true);
  await finger(page, 'pointerup', 1, THUMB.x + 300, THUMB.y - 300);
  expect(await touchState(page)).toMatchObject({ held: false, move: { x: 0, y: 0 }, run: false });
  await expect.poll(async () => (await player(page)).moving).toBe(false);
});

/** Alle Knöpfe und die acht Plätze: je mindestens 48 × 48 CSS-Pixel, keine zwei überlappen. */
async function checkTapTargets(page: Page): Promise<void> {
  const boxes = await page.locator('.hud-menu, .touch-act__button, .hotbar .ui-slot').evaluateAll((list) =>
    list.map((n) => {
      const r = n.getBoundingClientRect();
      return { name: n.className, x: r.x, y: r.y, w: r.width, h: r.height };
    }));
  expect(boxes).toHaveLength(10);
  const { width, height } = page.viewportSize()!;
  for (const b of boxes) {
    expect(b.w, b.name).toBeGreaterThanOrEqual(48);
    expect(b.h, b.name).toBeGreaterThanOrEqual(48);
    expect(b.x >= 0 && b.y >= 0 && b.x + b.w <= width && b.y + b.h <= height, `${b.name} im Bild`).toBe(true);
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!, b = boxes[j]!;
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      expect(overlap, `${a.name} und ${b.name}`).toBe(false);
    }
  }
}

async function withContext(browser: Browser, baseURL: string | undefined, size: { width: number; height: number; dpr: number },
  run: (page: Page) => Promise<void>): Promise<void> {
  const context = await browser.newContext({ baseURL, viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.dpr, hasTouch: true });
  try {
    await run(await context.newPage());
  } finally {
    await context.close();
  }
}

test('Tippflächen: alle Knöpfe und acht Plätze mindestens 48 × 48, ohne Überlappung (iPad quer und hochkant, Handy quer)', async ({ browser, baseURL }) => {
  for (const size of [{ width: 1080, height: 810, dpr: 2 }, { width: 810, height: 1080, dpr: 2 }, { width: 844, height: 390, dpr: 3 }]) {
    await withContext(browser, baseURL, size, async (page) => {
      await openWorld(page);
      await tap(page, 1, size.width / 2, size.height / 3);
      await expect(page.locator('.touch-act__button')).toBeVisible();
      await checkTapTargets(page);
    });
  }
});

test('Schnellleiste: 500 ms auf Platz 1 → „Holzschwert" erscheint 2 s lang; kurzes Tippen wählt nur', async ({ page }) => {
  await openWorld(page);
  const slot = (i: number): string => `.hotbar .ui-slot[data-slot="${i}"]`;
  const tip = page.locator('.hotbar__tip');
  // kurzes Tippen auf Platz 3: wählt (der Browser schickt nach dem Abheben einen Klick), kein Name
  const third = await center(page, slot(2));
  await tap(page, 1, third.x, third.y);
  await page.locator(slot(2)).dispatchEvent('click');
  await expect(page.locator(slot(2))).toHaveClass(/is-selected/);
  await page.waitForTimeout(1000);
  await expect(tip).toBeHidden();
  // langes Drücken auf Platz 1: Name erscheint, die Wahl bleibt bei Platz 3
  const first = await center(page, slot(0));
  await finger(page, 'pointerdown', 2, first.x, first.y);
  await expect(tip).toBeVisible({ timeout: 5000 });
  await expect(tip).toHaveText('Holzschwert');
  await finger(page, 'pointerup', 2, first.x, first.y);
  await page.locator(slot(0)).dispatchEvent('click');
  await expect(page.locator(slot(2))).toHaveClass(/is-selected/);
  // der Name steht über Platz 1 und verschwindet wieder
  const tipBox = (await tip.boundingBox())!;
  const slotBox = (await page.locator(slot(0)).boundingBox())!;
  expect(tipBox.y + tipBox.height).toBeLessThanOrEqual(slotBox.y);
  expect(Math.abs(tipBox.x + tipBox.width / 2 - (slotBox.x + slotBox.width / 2))).toBeLessThanOrEqual(2);
  await expect(tip).toBeHidden({ timeout: 10_000 });
});

test('erste Berührung zeigt Stick und Knopf statt des Tasten-Bilds „E", ein Tastendruck kehrt es um; ein Mausklick nicht', async ({ page }) => {
  await openWorld(page);
  await besideMama(page);
  const ring = page.locator('.touch-stick');
  const button = page.locator('.touch-act__button');
  // Anfang: Tasten
  expect((await touchState(page)).device).toBe('keys');
  await expect(ring).toBeHidden();
  await expect(button).toBeHidden();
  await expect.poll(async () => (await talkState(page)).keyHint.visible).toBe(true);
  // ein Mausklick ins Spielbild ändert nichts
  await page.mouse.click(540, 200);
  await frames(page, 5);
  expect((await touchState(page)).device).toBe('keys');
  await expect(button).toBeHidden();
  // erste Berührung (ohne Bewegung, ohne Handlung)
  await tap(page, 1, 540, 200);
  expect((await touchState(page)).device).toBe('touch');
  await expect(ring).toBeVisible();
  await expect(button).toBeVisible();
  await expect.poll(async () => (await talkState(page)).keyHint.visible).toBe(false);
  // nächster Tastendruck
  await page.keyboard.press('ShiftLeft');
  expect((await touchState(page)).device).toBe('keys');
  await expect(ring).toBeHidden();
  await expect(button).toBeHidden();
  await expect.poll(async () => (await talkState(page)).keyHint.visible).toBe(true);
});

test('Handy hochkant: Dreh-Hinweis, Spiel hält an; quer: weg; Tablet hochkant: kein Hinweis, Stick läuft', async ({ browser, baseURL }) => {
  const hint = (page: Page) => page.locator('.rotate-hint');
  await withContext(browser, baseURL, { width: 390, height: 844, dpr: 3 }, async (page) => {
    const errors = watchErrors(page);
    await openWorld(page);
    await expect(hint(page)).toBeVisible();
    await expect(hint(page)).toContainText('Bitte dreh das Gerät quer.');
    expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(true);
    // der Hinweis deckt alles ab: weder Daumen noch Taste bewegen Emilia
    const start = await player(page);
    await finger(page, 'pointerdown', 1, 80, 700);
    await finger(page, 'pointermove', 1, 120, 700);
    await page.keyboard.down('KeyD');
    await frames(page, 30);
    await page.keyboard.up('KeyD');
    await finger(page, 'pointerup', 1, 120, 700);
    expect(await player(page)).toMatchObject({ x: start.x, y: start.y });
    // quer gedreht, ohne Neuladen
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(hint(page)).toBeHidden();
    await expect.poll(() => page.evaluate(() => (window as any).__emilia2.paused())).toBe(false);
    // und wieder hochkant
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(hint(page)).toBeVisible();
    expect(errors).toEqual([]);
  });
  await withContext(browser, baseURL, { width: 820, height: 1180, dpr: 2 }, async (page) => {
    await openWorld(page);
    await page.evaluate(() => (window as any).__emilia2.teleport(12, 13));
    await expect(hint(page)).toBeHidden();
    expect(await page.evaluate(() => (window as any).__emilia2.paused())).toBe(false);
    const start = await player(page);
    await finger(page, 'pointerdown', 1, 150, 1000);
    await finger(page, 'pointermove', 1, 190, 1000);
    await expect.poll(async () => (await player(page)).x).toBeGreaterThan(start.x + 8);
    await finger(page, 'pointerup', 1, 190, 1000);
  });
});

test('Bilder für die Durchsicht: iPad quer und hochkant, Handy quer und hochkant', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName !== 'chromium', 'ein Satz Bilder genügt');
  mkdirSync(ARTIFACTS, { recursive: true });
  const shots = [
    { name: 'ipad-quer', width: 1080, height: 810, dpr: 2 },
    { name: 'ipad-hochkant', width: 810, height: 1080, dpr: 2 },
    { name: 'handy-quer', width: 844, height: 390, dpr: 3 },
    { name: 'handy-hochkant', width: 390, height: 844, dpr: 3 },
  ];
  for (const shot of shots) {
    await withContext(browser, baseURL, shot, async (page) => {
      await openWorld(page);
      await expect.poll(() => page.evaluate(() => document.fonts.check('bold 16px Nunito'))).toBe(true);
      const file = `${ARTIFACTS}task-8-${shot.name}-${shot.width}x${shot.height}@${shot.dpr}x.png`;
      if (shot.name === 'handy-hochkant') {
        await expect(page.locator('.rotate-hint')).toBeVisible();
        writeFileSync(file, await page.screenshot({ scale: 'device' }));
        return;
      }
      await besideMama(page);
      // Stick ausgelenkt (nach oben, gegen die Hauswand: Emilia bleibt bei Mama), Knopf mit Sprechblase
      const thumb = { x: 120, y: shot.height - 120 };
      await finger(page, 'pointerdown', 1, thumb.x, thumb.y);
      await finger(page, 'pointermove', 1, thumb.x, thumb.y - 30);
      await expect(page.locator('.touch-act__icon')).toBeVisible();
      await frames(page, 5);
      writeFileSync(file, await page.screenshot({ scale: 'device' }));
      await finger(page, 'pointerup', 1, thumb.x, thumb.y - 30);
    });
  }
});
