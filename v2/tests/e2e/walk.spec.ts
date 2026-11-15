import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { HIDE_UI, blockProblems, figureRect, readPng, type GridSnapshot } from './helpers/png';
import { LOOKAHEAD } from '../../src/systems/camera';

type PlayerInfo = { x: number; y: number; facing: string; moving: boolean };
type CameraInfo = { scrollX: number; scrollY: number };
type Depths = { player: number; objects: Record<number, number> };

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1a/', import.meta.url));
const hub = JSON.parse(readFileSync(fileURLToPath(new URL('../../src/assets/maps/hub.json', import.meta.url)), 'utf8')) as {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: { name: string; objects?: { id: number; type: string; x: number; y: number }[] }[];
};
const MAP_WIDTH = hub.width * hub.tilewidth;
const MAP_HEIGHT = hub.height * hub.tileheight;
/** Baum mitten im Dorf, Stamm auf Kachel 13/6 (Kacheln darüber und darunter sind frei). */
const TREE = hub.layers.find((l) => l.name === 'objects')!.objects!.find((o) => o.type === 'tree' && o.x === 13 * 16 && o.y === 6 * 16)!;
/** Westlicher Waldrand: Kacheln 0 und 1 sind fest, die Wandkante liegt bei x = 32. */
const WALL_EDGE = 32;
const BODY_HALF_WIDTH = 5;

async function openWorld(page: Page, errors: string[]): Promise<void> {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('./');
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && typeof h.player === 'function' && h.pixelGrid?.deviceWidth > 1;
  });
  await nextFrames(page);
}

/** Zwei Bilder abwarten, damit Zeichenstand und Test-Zugang zusammenpassen. */
async function nextFrames(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}

const player = (page: Page): Promise<PlayerInfo> => page.evaluate(() => (window as any).__emilia2.player());
const camera = (page: Page): Promise<CameraInfo> => page.evaluate(() => (window as any).__emilia2.camera());
const depths = (page: Page): Promise<Depths> => page.evaluate(() => (window as any).__emilia2.depths());
const grid = (page: Page): Promise<GridSnapshot> => page.evaluate(() => (window as any).__emilia2.pixelGrid);

async function teleport(page: Page, tileX: number, tileY: number): Promise<void> {
  await page.evaluate(([x, y]) => (window as any).__emilia2.teleport(x, y), [tileX, tileY]);
  await nextFrames(page);
}

async function hold(page: Page, keys: string[], ms: number): Promise<void> {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
}

/** Längster Zeitschritt des Spiels in Millisekunden (MAX_DT in movement.ts): längere Bildabstände zählen nur so weit. */
const MAX_STEP_MS = 100;

interface WalkRun {
  /** Zeit, die die Taste in der Seite gedrückt war, auf der Wanduhr. */
  heldMs: number;
  /** Dieselbe Spanne in Spielzeit: Summe der Bildabstände, jeder höchstens MAX_STEP_MS. */
  heldGameMs: number;
  frames: number;
  /** Spielzeit vom Loslassen bis zum ersten Bild, in dem Emilia steht. */
  stopGameMs: number;
  longestGapMs: number;
}

/**
 * Hält D und misst in der Seite, Bild für Bild. Gemessen wird in Spielzeit, nicht auf der Wanduhr: Stockt das Bild
 * (auf dem Rechner der Auslieferung kurz nach dem Seitenstart bis etwa 1 s), rückt das Spiel in diesem Bild nur
 * MAX_DT weiter. Ein Test, der Strecke durch Wanduhr-Zeit teilt oder 200 ms auf den Stillstand wartet, misst dort
 * das Stocken statt des Spiels (zwei rote Erstversuche auf GitHub am 2026-11-14: 35 px/s; Taste 1500 ms gedrückt).
 * Zeitlupe bei niedriger Bildrate fällt weiter auf: Bildabstände bis MAX_STEP_MS zählen voll.
 */
async function measureWalk(page: Page, holdMs: number, stallMs = 0): Promise<WalkRun> {
  await page.evaluate((maxStep) => {
    const w = window as any;
    const run = { down: null as number | null, up: null as number | null, heldGameMs: 0, frames: 0, stopGameMs: -1, afterUp: 0, longestGapMs: 0, last: performance.now() };
    w.__walk = run;
    addEventListener('keydown', (e) => { if (e.code === 'KeyD' && run.down === null) run.down = performance.now(); });
    addEventListener('keyup', (e) => { if (e.code === 'KeyD' && run.up === null) run.up = performance.now(); });
    const tick = (): void => {
      const now = performance.now();
      const gap = now - run.last;
      run.last = now;
      if (run.down !== null && run.up === null) {
        run.heldGameMs += Math.min(gap, maxStep);
        run.frames++;
        run.longestGapMs = Math.max(run.longestGapMs, gap);
      } else if (run.up !== null && run.stopGameMs < 0) {
        run.afterUp += Math.min(gap, maxStep);
        if (w.__emilia2.player().moving === false) run.stopGameMs = run.afterUp;
      }
      if (run.stopGameMs < 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, MAX_STEP_MS);
  await page.keyboard.down('KeyD');
  if (stallMs > 0) {
    await page.waitForTimeout(200);
    // Die Seite hängt: kein Bild, keine Eingabe (wie das Stocken auf dem Rechner der Auslieferung). Erst danach
    // läuft die restliche Haltezeit, damit das Stocken sicher vor dem Loslassen endet.
    await page.evaluate((ms) => { const until = performance.now() + ms; while (performance.now() < until) { /* warten */ } }, stallMs);
    await page.waitForTimeout(holdMs - 200);
  } else {
    await page.waitForTimeout(holdMs);
  }
  await page.keyboard.up('KeyD');
  // Warten auf den Stillstand ist hier keine Zeitmessung; die Messung steht in stopGameMs
  await page.waitForFunction(() => (window as any).__walk.stopGameMs >= 0, undefined, { timeout: 10_000 });
  return page.evaluate(() => {
    const r = (window as any).__walk;
    return { heldMs: r.up - r.down, heldGameMs: r.heldGameMs, frames: r.frames, stopGameMs: r.stopGameMs, longestGapMs: r.longestGapMs };
  });
}

function checkWalk(label: string, run: WalkRun, walked: number): void {
  const speed = walked / (run.heldGameMs / 1000);
  console.log(
    `${label}: ${walked.toFixed(2)} Bildpunkte in ${run.heldGameMs.toFixed(0)} ms Spielzeit (${run.heldMs.toFixed(0)} ms gedrückt) = ${speed.toFixed(1)} px/s, ` +
    `${(run.frames / (run.heldMs / 1000)).toFixed(0)} Bilder/s, längster Bildabstand ${run.longestGapMs.toFixed(0)} ms, steht nach ${run.stopGameMs.toFixed(0)} ms Spielzeit`,
  );
  expect(run.heldGameMs, `nur ${run.heldGameMs.toFixed(0)} ms Spielzeit gedrückt – der Lauf sagt nichts aus`).toBeGreaterThanOrEqual(300);
  // Gehtempo 64 Bildpunkte je Sekunde Spielzeit; Spielraum für An- und Auslauf und ein Bild Unschärfe beim Zählen
  expect(speed).toBeGreaterThanOrEqual(41);
  expect(speed).toBeLessThanOrEqual(80);
  // Stillstand nach ACCEL_TIME (100 ms Spielzeit), höchstens ein langes Bild später
  expect(run.stopGameMs).toBeLessThanOrEqual(250);
}

test('D gedrückt: Emilia läuft nach rechts und bleibt nach dem Loslassen stehen', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  const before = await player(page);
  expect(before.moving).toBe(false);
  const run = await measureWalk(page, 600);
  const after = await player(page);
  expect(after.moving).toBe(false);
  checkWalk('D', run, after.x - before.x);
  expect(after.facing).toBe('right');
  expect(after.y).toBe(before.y);
  expect(errors).toEqual([]);
});

test('die gelaufene Strecke (distanceWalked, in Kacheln) passt zu den gelaufenen Bildpunkten', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  const distance = (): Promise<number> => page.evaluate(() => (window as any).__emilia2.state().progression.stats.distanceWalked as number);
  const startDistance = await distance();
  const before = await player(page);
  await measureWalk(page, 600);
  const after = await player(page);
  const walked = after.x - before.x;
  const gained = (await distance()) - startDistance;
  expect(walked).toBeGreaterThan(10);
  expect(gained).toBeGreaterThanOrEqual((walked / 16) * 0.9);
  expect(gained).toBeLessThanOrEqual((walked / 16) * 1.1);
  expect(errors).toEqual([]);
});

test('stockt das Bild mitten im Laufen fast eine Sekunde, springt Emilia nicht und läuft danach normal weiter', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  const before = await player(page);
  const run = await measureWalk(page, 600, 900);
  const after = await player(page);
  expect(after.moving).toBe(false);
  // das Stocken ist wirklich passiert …
  expect(run.longestGapMs).toBeGreaterThan(500);
  // … und zählt als ein Zeitschritt von MAX_DT: Tempo in Spielzeit wie ohne Stocken, kein Sprung über die Strecke
  checkWalk('D mit Stocken', run, after.x - before.x);
  expect(after.x - before.x).toBeLessThan(64 * (run.heldGameMs / 1000) + 12);
  expect(after.facing).toBe('right');
  expect(after.y).toBe(before.y);
  expect(errors).toEqual([]);
});

test('am Waldrand bleibt Emilia an der Wandkante stehen und rutscht schräg daran entlang', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await teleport(page, 2, 14);
  await hold(page, ['KeyA'], 1000);
  const atWall = await player(page);
  expect(atWall.x - BODY_HALF_WIDTH).toBeGreaterThanOrEqual(WALL_EDGE);
  // wirklich bis an die Wand gelaufen
  expect(atWall.x - BODY_HALF_WIDTH).toBeLessThan(WALL_EDGE + 0.5);

  const start = await player(page);
  await hold(page, ['KeyA', 'KeyS'], 600);
  const slid = await player(page);
  expect(slid.y).toBeGreaterThan(start.y + 5);
  expect(slid.x - BODY_HALF_WIDTH).toBeGreaterThanOrEqual(WALL_EDGE);
  expect(errors).toEqual([]);
});

test('hinter dem Baum liegt Emilia dahinter, davor davor', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  expect(TREE).toBeDefined();
  await teleport(page, 13, 5);
  const behind = await depths(page);
  const treeDepth = behind.objects[TREE.id]!;
  expect(treeDepth).toBeDefined();
  expect(behind.player).toBeLessThan(treeDepth);
  await teleport(page, 13, 7);
  const front = await depths(page);
  expect(front.player).toBeGreaterThan(front.objects[TREE.id]!);

  // Bilder für die Sichtprüfung
  mkdirSync(ARTIFACTS, { recursive: true });
  await teleport(page, 13, 5);
  writeFileSync(`${ARTIFACTS}baum-dahinter-${test.info().project.name}.png`, await page.screenshot({ scale: 'device' }));
  await teleport(page, 13, 7);
  writeFileSync(`${ARTIFACTS}baum-davor-${test.info().project.name}.png`, await page.screenshot({ scale: 'device' }));
  expect(errors).toEqual([]);
});

interface Place {
  p: PlayerInfo;
  c: CameraInfo;
}

/** Ort der Figur und Stand der Kamera im selben Augenblick. */
const where = (page: Page): Promise<Place> =>
  page.evaluate(() => ({ p: (window as any).__emilia2.player(), c: (window as any).__emilia2.camera() }));

/**
 * Rechteck um die Figur an beiden Orten, vor und nach einem Bildschirmfoto: Solange eine Taste gehalten wird, läuft
 * Emilia während des Fotos weiter; das Foto zeigt sie irgendwo dazwischen.
 */
function figureSpan(snapshot: GridSnapshot, a: Place, b: Place): ReturnType<typeof figureRect> {
  const from = figureRect(snapshot, a.p, a.c);
  const to = figureRect(snapshot, b.p, b.c);
  return { x0: Math.min(from.x0, to.x0), x1: Math.max(from.x1, to.x1), y0: Math.min(from.y0, to.y0), y1: Math.max(from.y1, to.y1) };
}

/** Liegt der Wert auf einem ganzen Bildschirmpixel (Vielfaches von 1/Zoom Bildpunkt)? */
const onScreenPixel = (v: number, zoom: number): boolean => Math.abs(v * zoom - Math.round(v * zoom)) < 1e-6;

test('beim Laufen steht die Kamera auf ganzen Bildschirmpixeln, das Bild bleibt pixelgenau', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(300);
  const cams: CameraInfo[] = [];
  for (let i = 0; i < 5; i++) {
    cams.push(await camera(page));
    await page.waitForTimeout(40);
  }
  // Die Karte ist kaum breiter als der Ausschnitt: Nach kurzer Strecke hängt die Kamera am Kartenrand, und die Figur
  // wandert im Bild. Ihr Ort wird deshalb vor UND nach dem Bildschirmfoto gelesen (siehe figureSpan); auf dem Rechner
  // der Auslieferung dauert das Foto länger, als der Spielraum um einen einzigen Ort erlaubt (Probelauf 2026-11-15).
  const before = await where(page);
  const shot = await page.screenshot({ scale: 'device', style: HIDE_UI });
  const snapshot = await grid(page);
  const after = await where(page);
  await page.keyboard.up('KeyD');
  const { zoom } = snapshot.layout;
  for (const c of cams) {
    expect(onScreenPixel(c.scrollX, zoom), `scrollX ${c.scrollX}`).toBe(true);
    expect(onScreenPixel(c.scrollY, zoom), `scrollY ${c.scrollY}`).toBe(true);
  }
  // die Kamera folgt wirklich
  expect(cams[cams.length - 1]!.scrollX).toBeGreaterThan(cams[0]!.scrollX);
  const png = readPng(shot);
  // Die Welt liegt auf einem Raster aus ganzen Blöcken; die laufende Figur rastet für sich auf Bildschirmpixel ein
  expect(blockProblems(png, snapshot, figureSpan(snapshot, before, after))).toEqual([]);
  // Die Kamera zeigt nie über die Karte hinaus und der Boden ist gezeichnet: kein Schwarz im Ausschnitt
  // (kein Bild des Dorfs enthält reines Schwarz; schwarz ist nur der Rand außerhalb des Ausschnitts).
  expect(blackPixelsInView(png, snapshot)).toBe(0);
  expect(errors).toEqual([]);
});

test('beim Rennen gleitet das Bild in Bildschirmpixeln, nicht in Sprüngen ganzer Bildpunkte', async ({ page }) => {
  // Meldung des Auftraggebers (2026-11-14): beim Rennen „wackelt alles etwas". Ursache war das Einrasten der Kamera
  // auf ganze Bildpunkte (bei Zoom 6 Sprünge von 6 und 12 Bildschirmpixeln); die Rechnung prüft camera.test.ts.
  const errors: string[] = [];
  await openWorld(page, errors);
  // Mitte der Karte auf dem Ost-West-Weg: Hier hängt die Kamera bei keiner Fenstergröße am Kartenrand
  // (von Kachel 8 aus stand sie bei 426 Bildpunkten Sichtbreite zunächst still; auf GitHub scheiterte der Test daran einmal).
  await teleport(page, 14, 14);
  await page.keyboard.down('ShiftLeft');
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(400);
  const frames = await page.evaluate(() => new Promise<{ cam: number; foot: number; drawn: number }[]>((resolve) => {
    const h = (window as any).__emilia2;
    const out: { cam: number; foot: number; drawn: number }[] = [];
    const tick = (): void => {
      out.push({ cam: h.camera().scrollX, foot: h.player().x, drawn: h.playerPose().x });
      if (out.length < 40) requestAnimationFrame(tick);
      else resolve(out);
    };
    requestAnimationFrame(tick);
  }));
  await page.keyboard.up('KeyD');
  await page.keyboard.up('ShiftLeft');
  const { zoom } = (await grid(page)).layout;
  expect(zoom).toBeGreaterThan(1);
  expect(frames[frames.length - 1]!.cam).toBeGreaterThan(frames[0]!.cam + 20);
  for (const f of frames) {
    expect(onScreenPixel(f.cam, zoom), `Kamera ${f.cam}`).toBe(true);
    expect(onScreenPixel(f.drawn, zoom), `Figur ${f.drawn}`).toBe(true);
    // gezeichnet wird der Fußpunkt, höchstens einen halben Bildschirmpixel daneben
    expect(Math.abs(f.drawn - f.foot)).toBeLessThanOrEqual(0.5 / zoom + 1e-9);
  }
  // Kamera und Figur nutzen die Zwischenschritte wirklich (bei 40 Bildern nie zufällig alle auf ganzen Bildpunkten)
  expect(frames.some((f) => !Number.isInteger(f.cam))).toBe(true);
  expect(frames.some((f) => !Number.isInteger(f.drawn))).toBe(true);
  expect(errors).toEqual([]);
});

function blackPixelsInView(png: ReturnType<typeof readPng>, snapshot: GridSnapshot): number {
  const { zoom, viewWidth, viewHeight, offsetX, offsetY } = snapshot.layout;
  let black = 0;
  for (let fy = 0; fy < viewHeight; fy++) {
    for (let fx = 0; fx < viewWidth; fx++) {
      const [r, g, b] = png.at(offsetX + fx * zoom, offsetY + fy * zoom);
      if (r === 0 && g === 0 && b === 0) black++;
    }
  }
  return black;
}

test('Fenstergröße ändern, während D gehalten wird: kein Fehler, Bild bleibt scharf, Kamera folgt Emilia', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  expect((await grid(page)).deviceWidth).not.toBe(Math.round(1367 * (await page.evaluate(() => window.devicePixelRatio))));
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(200);
  // Läuft mit der Standard-Pixeldichte des Projekts (Chromium 1, iPad 2): 1367×769 ergibt dort ganze
  // Gerätepixel, avoidHalfDevicePixels (pixelgrid.spec.ts) ist nur bei gebrochener Dichte nötig.
  await page.setViewportSize({ width: 1367, height: 769 });
  // neue Messung des Pixelrasters abwarten (vorher 1280×720 bzw. iPad-Größe)
  await page.waitForFunction(() => {
    const g = (window as any).__emilia2.pixelGrid;
    return g.deviceWidth === Math.round(1367 * window.devicePixelRatio) && g.deviceHeight === Math.round(769 * window.devicePixelRatio);
  });
  await nextFrames(page);
  await page.waitForTimeout(300);
  // Emilia läuft weiter, und hier hängt die Kamera am Kartenrand: Die Figur wandert also im Bild. Ihr Ort wird
  // deshalb vor UND nach dem Bildschirmfoto gelesen; ausgenommen wird das Rechteck um beide Orte. Auf dem Rechner
  // der Auslieferung dauert das Foto länger, als der Spielraum um einen einzigen Ort erlaubt (Probelauf 2026-11-15).
  const before = await where(page);
  const shot = await page.screenshot({ scale: 'device', style: HIDE_UI });
  const snapshot = await grid(page);
  const after = await where(page);
  const { p, c } = after;
  await page.keyboard.up('KeyD');

  // neues Raster wirklich angewandt: jeder Block einfarbig, kein Schwarz im Ausschnitt
  const png = readPng(shot);
  expect(blockProblems(png, snapshot, figureSpan(snapshot, before, after))).toEqual([]);
  expect(blackPixelsInView(png, snapshot)).toBe(0);
  expect(onScreenPixel(c.scrollX, snapshot.layout.zoom) && onScreenPixel(c.scrollY, snapshot.layout.zoom)).toBe(true);

  const { viewWidth, viewHeight } = snapshot.layout;
  const clampedX = c.scrollX === 0 || c.scrollX + viewWidth === MAP_WIDTH;
  const clampedY = c.scrollY === 0 || c.scrollY + viewHeight === MAP_HEIGHT;
  if (clampedX) {
    expect(p.x - c.scrollX).toBeGreaterThanOrEqual(0);
    expect(p.x - c.scrollX).toBeLessThanOrEqual(viewWidth);
  } else {
    expect(Math.abs(p.x - (c.scrollX + viewWidth / 2))).toBeLessThanOrEqual(LOOKAHEAD + 2);
  }
  if (clampedY) {
    expect(p.y - c.scrollY).toBeGreaterThanOrEqual(0);
    expect(p.y - c.scrollY).toBeLessThanOrEqual(viewHeight);
  } else {
    expect(Math.abs(p.y - (c.scrollY + viewHeight / 2))).toBeLessThanOrEqual(LOOKAHEAD + 2);
  }
  expect(errors).toEqual([]);
});
