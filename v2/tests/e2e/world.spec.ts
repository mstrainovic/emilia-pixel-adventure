import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';
import { HIDE_UI, blockProblems, readPng, type GridSnapshot, type PngImage } from './helpers/png';

type Snapshot = GridSnapshot;

const hub = JSON.parse(readFileSync(fileURLToPath(new URL('../../src/assets/maps/hub.json', import.meta.url)), 'utf8')) as {
  layers: { name: string; objects?: unknown[] }[];
};
const HUB_OBJECTS = hub.layers.find((l) => l.name === 'objects')!.objects!.length;
const ARTIFACTS = fileURLToPath(new URL('../../../test-artifacts/etappe-1a/', import.meta.url));

/** Wartet, bis die Welt gezeichnet ist und zwei Bilder auf dem Bildschirm waren. */
async function waitForWorld(page: Page): Promise<Snapshot> {
  await page.waitForFunction(() => {
    const h = (window as any).__emilia2;
    return h?.ready === true && h.world && h.pixelGrid?.deviceWidth > 1;
  });
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  return page.evaluate(() => (window as any).__emilia2.pixelGrid as Snapshot);
}

function colorCount(png: PngImage): number {
  const colors = new Set<number>();
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const [r, g, b] = png.at(x, y);
      colors.add((r << 16) | (g << 8) | b);
    }
  }
  return colors.size;
}

async function checkWorld(page: Page, name: string): Promise<void> {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5183\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  await page.goto('./');
  const snapshot = await waitForWorld(page);
  expect(await page.evaluate(() => (window as any).__emilia2.world)).toEqual({ map: 'hub', objects: HUB_OBJECTS, npcs: 9 });

  const shot = await page.screenshot({ scale: 'device', style: HIDE_UI });
  mkdirSync(ARTIFACTS, { recursive: true });
  writeFileSync(`${ARTIFACTS}${name}.png`, shot);
  const png = readPng(shot);
  expect(colorCount(png)).toBeGreaterThanOrEqual(16);
  expect(blockProblems(png, snapshot)).toEqual([]);
  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
}

test('zeichnet das Dorf pixelgenau', async ({ page, browserName }) => {
  await checkWorld(page, `welt-${browserName}`);
});

type VillagerInfo = { npcId: string; texture: string; frame: number; x: number; y: number };
type NpcObject = { name: string; x: number; y: number; properties?: { name: string; value: unknown }[] };
const NPCS = hub.layers.find((l) => l.name === 'npcs')!.objects as NpcObject[];

test('neun Dorfbewohner stehen auf ihren Kacheln, jeder mit eigenem Figurenblatt und Blickrichtung', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('./');
  await waitForWorld(page);
  const villagers = await page.evaluate(() => (window as any).__emilia2.villagers() as VillagerInfo[]);
  expect(NPCS).toHaveLength(9);
  expect(villagers).toHaveLength(9);
  const facingColumn: Record<string, number> = { down: 0, up: 1, left: 2, right: 3 };
  for (const npc of NPCS) {
    const v = villagers.find((c) => c.npcId === npc.name);
    expect(v, npc.name).toBeDefined();
    // Fuß = Mitte der Kachel aus der Ebene npcs, Bild unten mittig daran
    expect([v!.x, v!.y], npc.name).toEqual([npc.x + 8, npc.y + 8]);
    expect(v!.texture, npc.name).toBe(`figure:${npc.name}`);
    const facing = String(npc.properties?.find((p) => p.name === 'facing')?.value ?? 'down');
    expect(v!.frame, npc.name).toBe(facingColumn[facing]);
  }
  expect(new Set(villagers.map((v) => v.texture)).size).toBe(9);

  // Bilder für die Sichtprüfung: Emilia zwei Kacheln unter jedem Dorfbewohner
  mkdirSync(ARTIFACTS, { recursive: true });
  for (const npc of NPCS) {
    await page.evaluate(([x, y]) => (window as any).__emilia2.teleport(x, y), [npc.x / 16, npc.y / 16 + 2]);
    await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
    writeFileSync(`${ARTIFACTS}dorfbewohner-${npc.name}-${test.info().project.name}.png`, await page.screenshot({ scale: 'device' }));
  }
  expect(errors).toEqual([]);
});

test('gegen einen Dorfbewohner laufen: Emilia bleibt davor stehen', async ({ page }) => {
  await page.goto('./');
  await waitForWorld(page);
  // Ferdinand steht auf Kachel 25/15, die Kacheln 21–24 davor sind frei
  const ferdinand = NPCS.find((n) => n.name === 'ferdinand')!;
  expect([ferdinand.x / 16, ferdinand.y / 16]).toEqual([25, 15]);
  await page.evaluate(() => (window as any).__emilia2.teleport(22, 15));
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(1200);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(200);
  const p = await page.evaluate(() => (window as any).__emilia2.player() as { x: number; y: number });
  const bodyRight = p.x + 5;
  expect(bodyRight).toBeLessThanOrEqual(ferdinand.x);
  expect(bodyRight).toBeGreaterThan(ferdinand.x - 0.5);
});

test('Stilprobe: Lena und Julian stehen neben Emilia am Startpunkt', async ({ page, browserName }) => {
  await page.goto('./?stilprobe=1');
  await waitForWorld(page);
  const all = await page.evaluate(() => (window as any).__emilia2.villagers() as VillagerInfo[]);
  const p = await page.evaluate(() => (window as any).__emilia2.player() as { x: number; y: number });
  const lena = all.find((v) => v.npcId === 'lena');
  const julian = all.find((v) => v.npcId === 'julian');
  expect(all).toHaveLength(11);
  expect([lena?.x, lena?.y]).toEqual([p.x + 16, p.y]);
  expect([julian?.x, julian?.y]).toEqual([p.x - 16, p.y]);
  mkdirSync(ARTIFACTS, { recursive: true });
  writeFileSync(`${ARTIFACTS}stilprobe-${browserName}.png`, await page.screenshot({ scale: 'device' }));
});

test('ohne ?stilprobe=1 stehen Lena und Julian nicht im Dorf', async ({ page }) => {
  await page.goto('./');
  await waitForWorld(page);
  const ids = await page.evaluate(() => ((window as any).__emilia2.villagers() as VillagerInfo[]).map((v) => v.npcId));
  expect(ids).not.toContain('lena');
  expect(ids).not.toContain('julian');
});

test('zeichnet das Dorf pixelgenau bei gebrochener Pixeldichte', async ({ browser, baseURL, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Pixeldichte');
  // 1366 × 1,5 und 768 × 1,5 ergeben ganze Gerätepixel (siehe avoidHalfDevicePixels in pixelgrid.spec.ts)
  const context = await browser.newContext({ baseURL, viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1.5 });
  await checkWorld(await context.newPage(), `welt-${browserName}-dichte-1.5`);
  await context.close();
});
