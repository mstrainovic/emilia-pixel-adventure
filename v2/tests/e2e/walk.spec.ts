import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { blockProblems, readPng, type GridSnapshot } from './helpers/png';

type PlayerInfo = { x: number; y: number; facing: string; moving: boolean };
type CameraInfo = { scrollX: number; scrollY: number };
type Depths = { player: number; objects: Record<number, number> };

const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1a/', import.meta.url));
const hub = JSON.parse(readFileSync(fileURLToPath(new URL('../../src/assets/maps/hub.json', import.meta.url)), 'utf8')) as {
  layers: { name: string; objects?: { id: number; type: string; x: number; y: number }[] }[];
};
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

test('D gedrückt: Emilia läuft nach rechts und bleibt nach dem Loslassen stehen', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  const before = await player(page);
  expect(before.moving).toBe(false);
  // Wie lange die Taste in der Seite wirklich gedrückt war (zur Einordnung bei langsamer Maschine)
  await page.evaluate(() => {
    const w = window as any;
    w.__keyTimes = [];
    for (const type of ['keydown', 'keyup']) addEventListener(type, () => w.__keyTimes.push(performance.now()), { once: true });
  });
  await hold(page, ['KeyD'], 600);
  const after = await player(page);
  const walked = after.x - before.x;
  const [down, up] = await page.evaluate(() => (window as any).__keyTimes as number[]);
  console.log(`600 ms D: ${walked.toFixed(2)} Bildpunkte, Taste in der Seite ${(up! - down!).toFixed(0)} ms gedrückt`);
  expect(walked).toBeGreaterThanOrEqual(25);
  expect(walked).toBeLessThanOrEqual(45);
  expect(after.facing).toBe('right');
  expect(after.y).toBe(before.y);
  await expect.poll(async () => (await player(page)).moving, { timeout: 200, intervals: [16] }).toBe(false);
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

test('beim Laufen steht die Kamera auf ganzen Bildpunkten, das Bild bleibt pixelgenau', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(300);
  const cams: CameraInfo[] = [];
  for (let i = 0; i < 5; i++) {
    cams.push(await camera(page));
    await page.waitForTimeout(40);
  }
  const shot = await page.screenshot({ scale: 'device' });
  const snapshot = await grid(page);
  await page.keyboard.up('KeyD');
  for (const c of cams) {
    expect(Number.isInteger(c.scrollX)).toBe(true);
    expect(Number.isInteger(c.scrollY)).toBe(true);
  }
  // die Kamera folgt wirklich
  expect(cams[cams.length - 1]!.scrollX).toBeGreaterThan(cams[0]!.scrollX);
  const png = readPng(shot);
  expect(blockProblems(png, snapshot)).toEqual([]);
  // Die Kamera zeigt nie über die Karte hinaus und der Boden ist gezeichnet: kein Schwarz im Ausschnitt
  // (kein Bild des Dorfs enthält reines Schwarz; schwarz ist nur der Rand außerhalb des Ausschnitts).
  expect(blackPixelsInView(png, snapshot)).toBe(0);
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

test('Fenstergröße ändern, während D gehalten wird: kein Fehler, Emilia im Bild', async ({ page }) => {
  const errors: string[] = [];
  await openWorld(page, errors);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 1367, height: 769 });
  await page.waitForFunction(() => (window as any).__emilia2.pixelGrid.deviceWidth === Math.round(1367 * window.devicePixelRatio));
  await page.waitForTimeout(300);
  const p = await player(page);
  const c = await camera(page);
  const { layout } = await grid(page);
  await page.keyboard.up('KeyD');
  expect(p.x - c.scrollX).toBeGreaterThanOrEqual(0);
  expect(p.x - c.scrollX).toBeLessThanOrEqual(layout.viewWidth);
  expect(p.y - c.scrollY).toBeGreaterThanOrEqual(0);
  expect(p.y - c.scrollY).toBeLessThanOrEqual(layout.viewHeight);
  expect(Number.isInteger(c.scrollX) && Number.isInteger(c.scrollY)).toBe(true);
  expect(errors).toEqual([]);
});
