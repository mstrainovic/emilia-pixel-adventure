// Schneidet aus dem Pack „Ninja Adventure" nur die Teile der Auswahlliste aus und schreibt sie samt
// Lizenz und Quellenverzeichnis nach src/assets/gfx/ (oder in den als Argument genannten Ordner).
// Aufruf: NINJA_PACK_DIR=<Pack-Ordner> node tools/art/build.mjs [Zielordner]
// Gleiche Liste → bytegleiche Dateien (keine Zeitstempel, feste Reihenfolge).
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as png from './png.mjs';
import { FIGURES, PROPS, TILES, UI } from './selection.mjs';

const PACK = {
  name: 'Ninja Adventure Asset Pack',
  seite: 'https://pixel-boy.itch.io/ninja-adventure-asset-pack',
  urheber: [
    { name: 'Pixel-boy', link: 'https://pixel-boy.itch.io/' },
    { name: 'AAA', link: 'https://www.instagram.com/challenger.aaa/?hl=fr' },
  ],
  lizenz: 'CC0 1.0',
};
const LICENSE_FILE = 'LIZENZ-ninja-adventure.txt';
const TILE = 16;
const TILES_PER_ROW = 16;
const MANAGED = ['tiles', 'props', 'figuren', 'ui', LICENSE_FILE, 'QUELLEN.md', 'quellen.json'];

const packDir = process.env.NINJA_PACK_DIR;
if (!packDir || !existsSync(packDir)) {
  throw new Error('NINJA_PACK_DIR muss auf den entpackten Ordner „Ninja Adventure - Asset Pack" zeigen');
}
const outDir = resolve(process.argv[2] ?? fileURLToPath(new URL('../../src/assets/gfx', import.meta.url)));

/** Pfad im Pack; Pfade, die aus dem Pack herausführen, werden abgelehnt. */
function packPath(rel) {
  const full = resolve(packDir, rel);
  const inside = relative(resolve(packDir), full);
  if (isAbsolute(rel) || inside === '' || inside.startsWith('..') || isAbsolute(inside)) {
    throw new Error(`Quellpfad „${rel}" liegt nicht im Pack`);
  }
  return full;
}

function checkLicense() {
  const license = readFileSync(packPath('LICENSE.txt'));
  const readme = readFileSync(packPath('README.md'), 'utf8');
  const ok = license.toString('utf8').startsWith('CC0 1.0 Universal')
    && readme.includes('Creative Commons Zero (CC0)')
    && PACK.urheber.every((u) => readme.includes(u.name));
  if (!ok) throw new Error('Lizenz im Pack ist nicht mehr wie erwartet CC0 – bitte prüfen, nichts erzeugt');
  return license;
}

const images = new Map();
function source(rel) {
  if (!images.has(rel)) images.set(rel, png.readPng(packPath(rel)));
  return images.get(rel);
}

function checkIds(list) {
  const seen = new Set();
  for (const { id } of list) {
    if (!/^[a-z0-9_]+$/.test(id) || seen.has(id)) throw new Error(`Kennung „${id}" ist ungültig oder doppelt`);
    seen.add(id);
  }
}

const entries = [];
const files = [];
function writeImage(rel, img) {
  png.writePng(join(outDir, rel), img);
  files.push(rel);
}
function writeJson(rel, value) {
  mkdirSync(join(outDir, rel, '..'), { recursive: true });
  writeFileSync(join(outDir, rel), JSON.stringify(value, null, 2) + '\n');
  files.push(rel);
}
function record(item, ziel, ausschnitt, aenderungen) {
  entries.push({ kennung: item.id, ziel, quelle: item.source, ausschnitt, aenderungen, verwendung: item.use, lizenz: PACK.lizenz });
}

function buildTiles() {
  if (TILES.length === 0) return;
  const rows = Math.ceil(TILES.length / TILES_PER_ROW);
  const atlas = png.emptyImage(TILES_PER_ROW * TILE, rows * TILE);
  const index = {};
  TILES.forEach((t, i) => {
    png.blit(atlas, png.crop(source(t.source), t.x, t.y, TILE, TILE), (i % TILES_PER_ROW) * TILE, Math.floor(i / TILES_PER_ROW) * TILE);
    index[t.id] = i;
    record(t, 'tiles/dorf.png', { x: t.x, y: t.y, w: TILE, h: TILE }, 'unverändert ausgeschnitten');
  });
  writeImage('tiles/dorf.png', atlas);
  writeJson('tiles/dorf.json', index);
}

function buildProps() {
  if (PROPS.length === 0) return;
  const width = PROPS.reduce((sum, p) => sum + p.w, 0);
  const atlas = png.emptyImage(width, Math.max(...PROPS.map((p) => p.h)));
  const frames = {};
  let x = 0;
  for (const p of PROPS) {
    png.blit(atlas, png.crop(source(p.source), p.x, p.y, p.w, p.h), x, 0);
    frames[p.id] = { x, y: 0, w: p.w, h: p.h, anchorX: p.anchorX, anchorY: p.anchorY };
    record(p, 'props/dorf.png', { x: p.x, y: p.y, w: p.w, h: p.h }, 'unverändert ausgeschnitten');
    x += p.w;
  }
  writeImage('props/dorf.png', atlas);
  writeJson('props/dorf.json', frames);
}

/** Figuren: ops ist eine Liste [Funktionsname, ...Argumente] aus png.mjs, angewandt auf das ganze Quellbild. */
const FIGURE_OPS = ['crop', 'recolor', 'dropRows', 'dropCols', 'anchorBottomCenter'];
function buildFigures() {
  for (const f of FIGURES) {
    let img = source(f.source);
    for (const [op, ...args] of f.ops) {
      if (!FIGURE_OPS.includes(op)) throw new Error(`Unbekannter Schritt „${op}" bei Figur ${f.id}`);
      img = png[op](img, ...args);
    }
    const ziel = `figuren/${f.id}.png`;
    writeImage(ziel, img);
    record(f, ziel, null, f.ops.map(([op, ...args]) => `${op} ${JSON.stringify(args)}`).join('; '));
  }
}

function buildUi() {
  for (const u of UI) {
    const ziel = `ui/${u.id}.png`;
    writeImage(ziel, png.crop(source(u.source), u.x, u.y, u.w, u.h));
    record(u, ziel, { x: u.x, y: u.y, w: u.w, h: u.h }, 'unverändert ausgeschnitten');
  }
}

function sourcesMarkdown() {
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  const cut = (a) => (a ? `${a.x},${a.y} ${a.w}×${a.h}` : 'siehe Änderungen');
  return [
    '# Grafik-Quellen',
    '',
    'Diese Datei wird von `tools/art/build.mjs` erzeugt – nicht von Hand ändern.',
    '',
    `Alle Grafiken stammen aus dem „${PACK.name}" (${PACK.seite})`,
    `von ${PACK.urheber.map((u) => `[${u.name}](${u.link})`).join(' und ')}`,
    `oder sind daraus abgeleitet. Lizenz: ${PACK.lizenz} (Creative Commons Zero), siehe \`${LICENSE_FILE}\`.`,
    'Eine Namensnennung ist nicht verlangt; wir nennen die Urheber trotzdem gern.',
    '',
    '| Kennung | Zieldatei | Quelldatei im Pack | Ausschnitt | Änderungen | Verwendung | Lizenz |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...entries.map((e) => `| ${[e.kennung, e.ziel, e.quelle, cut(e.ausschnitt), e.aenderungen, e.verwendung, e.lizenz].map(cell).join(' | ')} |`),
    '',
  ].join('\n');
}

const license = checkLicense();
[TILES, PROPS, FIGURES, UI].forEach(checkIds);
for (const name of MANAGED) rmSync(join(outDir, name), { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

buildTiles();
buildProps();
buildFigures();
buildUi();

writeFileSync(join(outDir, LICENSE_FILE), license);
writeFileSync(join(outDir, 'quellen.json'), JSON.stringify({
  paket: { name: PACK.name, seite: PACK.seite, urheber: PACK.urheber.map((u) => u.name), lizenz: PACK.lizenz, lizenzdatei: LICENSE_FILE },
  dateien: [...files].sort(),
  eintraege: entries,
}, null, 2) + '\n');
writeFileSync(join(outDir, 'QUELLEN.md'), sourcesMarkdown());
console.log(`${entries.length} Einträge, ${files.length} Dateien → ${outDir}`);
