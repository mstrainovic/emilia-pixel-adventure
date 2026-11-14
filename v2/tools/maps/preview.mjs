// Vorschaubild einer neu gestalteten Karte: Boden, Bodendetail, dann flache Objekte, dann stehende
// Objekte und Figuren nach Fußpunkt sortiert. Schreibt nach test-artifacts/maps/: <id>.png (1-fach),
// <id>-4x.png (4-fach) und <id>-sperren.png (gesperrte Kacheln rot getönt, Ausgänge blau).
// Meldet Dinge, die von einem später gezeichneten Objekt verdeckt werden.
// Aufruf: node tools/maps/preview.mjs [Kartenkennung, Standard hub]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { emptyImage, readPng, writePng } from '../art/png.mjs';
import { PROP_DEFS, propKey } from '../../src/data/props.ts';

const TILE = 16;
const SCALE = 4;
const id = process.argv[2] ?? 'hub';
if (!/^[a-z_]+$/.test(id)) throw new Error(`Ungültige Kartenkennung „${id}"`);
const asset = (rel) => fileURLToPath(new URL(`../../src/assets/${rel}`, import.meta.url));
const artifact = (name) => fileURLToPath(new URL(`../../../test-artifacts/maps/${name}`, import.meta.url));

const map = JSON.parse(readFileSync(asset(`maps/${id}.json`), 'utf8'));
const tileAtlas = readPng(asset('gfx/tiles/dorf.png'));
const propAtlas = readPng(asset('gfx/props/dorf.png'));
const propFrames = JSON.parse(readFileSync(asset('gfx/props/dorf.json'), 'utf8'));
const shadow = readPng(asset('gfx/figuren/schatten.png'));
const figures = new Map();
const figure = (name) => {
  if (!figures.has(name)) figures.set(name, readPng(asset(`gfx/figuren/${name}.png`)));
  return figures.get(name);
};

const W = map.width * TILE;
const H = map.height * TILE;
const out = emptyImage(W, H);

/** Zeichnet einen Ausschnitt von src nach out, beschnitten an den Kartenrändern; durchsichtige Pixel bleiben aus. */
function draw(src, sx, sy, sw, sh, dx, dy) {
  for (let y = 0; y < sh; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= H) continue;
    for (let x = 0; x < sw; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= W) continue;
      const s = ((sy + y) * src.width + sx + x) * 4;
      if (src.data[s + 3] === 0) continue;
      out.data.set(src.data.subarray(s, s + 4), (ty * W + tx) * 4);
    }
  }
}

const layer = (name) => map.layers.find((l) => l.name === name);
const prop = (o, name) => o.properties?.find((p) => p.name === name)?.value;

// Boden und Bodendetail
const columns = tileAtlas.width / TILE;
for (const name of ['ground', 'ground_detail']) {
  layer(name).data.forEach((gid, i) => {
    if (gid === 0) return;
    const t = gid - 1;
    draw(tileAtlas, (t % columns) * TILE, Math.floor(t / columns) * TILE, TILE, TILE, (i % map.width) * TILE, Math.floor(i / map.width) * TILE);
  });
}

// Alles, was steht oder liegt, mit Bild, Fußpunkt und Rechteck im Bild der Karte
const items = [];
for (const o of layer('objects').objects) {
  const variant = prop(o, 'variant');
  const key = propKey(o.type, typeof variant === 'string' ? variant : null);
  const def = PROP_DEFS[key];
  if (!def) throw new Error(`Kein Bild für ${key}`);
  const f = propFrames[def.frame];
  const footX = o.x + o.width / 2;
  const footY = o.y + o.height;
  items.push({
    label: `${key} ${Math.floor(o.x / TILE)}/${Math.floor(o.y / TILE)}`, type: o.type, flat: def.layer === 'flat', footX, footY,
    rect: { x: Math.round(footX - f.anchorX), y: footY - f.anchorY, w: f.w, h: f.h },
    paint() { draw(propAtlas, f.x, f.y, f.w, f.h, this.rect.x, this.rect.y); },
  });
}
const people = layer('npcs').objects.map((n) => ({ name: n.name, x: n.x, y: n.y, facing: String(prop(n, 'facing') ?? 'down') }));
const spawn = layer('spawn').objects[0];
if (spawn) people.push({ name: 'emilia', x: Math.floor(spawn.x / TILE) * TILE, y: Math.floor(spawn.y / TILE) * TILE, facing: 'down' });
const COLUMN = { down: 0, up: 1, left: 2, right: 3 };
for (const p of people) {
  const footX = p.x + TILE / 2;
  const footY = p.y + TILE;
  items.push({
    label: `Figur ${p.name} ${p.x / TILE}/${p.y / TILE}`, type: 'npc', flat: false, footX, footY,
    rect: { x: p.x, y: p.y, w: TILE, h: TILE },
    paint() {
      draw(shadow, 0, 0, shadow.width, shadow.height, footX - Math.floor(shadow.width / 2), footY - shadow.height);
      draw(figure(p.name), COLUMN[p.facing] * TILE, 0, TILE, TILE, p.x, p.y);
    },
  });
}

const order = (a, b) => Number(a.flat === false) - Number(b.flat === false) || a.footY - b.footY || a.footX - b.footX;
items.sort(order);
for (const it of items) it.paint();

// Verdeckt? Wichtiges, das ein später gezeichnetes stehendes Bild überlappt; Ausgänge unter Bildern.
const MUST_SEE = new Set(['npc', 'station', 'chest', 'signpost', 'resource', 'wilted_plant', 'garden_plot', 'trophy_shelf', 'bonfire', 'well']);
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const warnings = [];
items.forEach((it, i) => {
  if (!MUST_SEE.has(it.type)) return;
  for (const later of items.slice(i + 1)) {
    const px = overlap(it.rect, later.rect);
    if (!later.flat && px > 0) warnings.push(`${it.label} wird von ${later.label} überdeckt (${px} px²)`);
  }
});
for (const e of layer('exits').objects) {
  const r = { x: e.x, y: e.y, w: e.width, h: e.height };
  for (const it of items) if (!it.flat && overlap(r, it.rect) > 0) warnings.push(`Ausgang ${e.name} wird von ${it.label} überdeckt`);
}

writePng(artifact(`${id}.png`), out);
const big = emptyImage(W * SCALE, H * SCALE);
for (let y = 0; y < big.height; y++) {
  for (let x = 0; x < big.width; x++) {
    const s = (Math.floor(y / SCALE) * W + Math.floor(x / SCALE)) * 4;
    big.data.set(out.data.subarray(s, s + 4), (y * big.width + x) * 4);
  }
}
writePng(artifact(`${id}-4x.png`), big);

// Sperrflächen und Ausgänge zum Prüfen
const tint = emptyImage(W, H);
tint.data.set(out.data);
const shade = (x0, y0, w, h, rgb) => {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) tint.data[i + c] = Math.round(tint.data[i + c] * 0.5 + rgb[c] * 0.5);
    }
  }
};
layer('collision').data.forEach((v, i) => { if (v !== 0) shade((i % map.width) * TILE, Math.floor(i / map.width) * TILE, TILE, TILE, [255, 0, 0]); });
for (const e of layer('exits').objects) shade(e.x, e.y, e.width, e.height, [0, 80, 255]);
writePng(artifact(`${id}-sperren.png`), tint);

console.log(`Vorschau: ${artifact(`${id}.png`)} (+ -4x, -sperren)`);
for (const w of warnings) console.log(`Achtung: ${w}`);
