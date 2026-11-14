// Schneidet aus dem Pack „Ninja Adventure" nur die Teile der Auswahlliste aus und schreibt sie samt
// Lizenz und Quellenverzeichnis nach src/assets/gfx/ (oder in den als Argument genannten Ordner).
// Aufruf: NINJA_PACK_DIR=<Pack-Ordner> node tools/art/build.mjs [Zielordner]
// Gleiche Liste → bytegleiche Dateien (keine Zeitstempel, feste Reihenfolge).
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as png from './png.mjs';
import { FIGURE_SHADOW, FIGURES, PROPS, TILES, UI } from './selection.mjs';

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

/*
 * Gegenstände: entweder ein Ausschnitt (source, x, y, w, h) oder ein aus Pack-Teilen zusammengesetztes
 * Bild (parts: [{ source, x, y, w, h, dx, dy }], Größe w×h): das erste Teil wird mit blit gesetzt, jedes
 * weitere mit blitOver darübergelegt. frames: n erzeugt n Bilder <id>_0 … <id>_(n-1); dabei rückt jedes
 * Teil (bzw. der Ausschnitt) mit stepX um stepX Pixel im Quellbild weiter. anchorX/anchorY: der Punkt im
 * Bild, der auf dem Fußpunkt des Objekts steht.
 */
const PROP_ATLAS_WIDTH = 512;

function propParts(p) {
  return p.parts ?? [{ source: p.source, x: p.x, y: p.y, w: p.w, h: p.h, dx: 0, dy: 0, stepX: p.stepX }];
}

function propFrame(p, parts, i) {
  const img = png.emptyImage(p.w, p.h);
  parts.forEach((part, k) => {
    const cut = png.crop(source(part.source), part.x + i * (part.stepX ?? 0), part.y, part.w, part.h);
    (k === 0 ? png.blit : png.blitOver)(img, cut, part.dx, part.dy);
  });
  return img;
}

function describeParts(parts, count) {
  const step = (part) => (count > 1 && part.stepX ? `, je Bild ${part.stepX} px weiter` : '');
  return parts.map((part, k) => `${k === 0 ? 'blit' : 'blitOver'} ${part.source} ${part.x},${part.y} ${part.w}×${part.h} → ${part.dx},${part.dy}${step(part)}`).join('; ');
}

function buildProps() {
  if (PROPS.length === 0) return;
  // Regale zu je höchstens PROP_ATLAS_WIDTH Pixeln, in fester Reihenfolge der Liste.
  const placed = [];
  let x = 0, y = 0, rowHeight = 0;
  for (const p of PROPS) {
    const parts = propParts(p);
    const count = p.frames ?? 1;
    for (let i = 0; i < count; i++) {
      if (x + p.w > PROP_ATLAS_WIDTH) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }
      placed.push({ name: count > 1 ? `${p.id}_${i}` : p.id, img: propFrame(p, parts, i), x, y, p });
      x += p.w;
      rowHeight = Math.max(rowHeight, p.h);
    }
    const composite = Boolean(p.parts) || count > 1;
    record(
      { ...p, source: [...new Set(parts.map((part) => part.source))].join(' + ') },
      'props/dorf.png',
      composite ? null : { x: p.x, y: p.y, w: p.w, h: p.h },
      composite ? `${p.parts ? 'zusammengesetzt: ' : ''}${describeParts(parts, count)}${count > 1 ? `; ${count} Bilder` : ''}` : 'unverändert ausgeschnitten',
    );
  }
  const atlas = png.emptyImage(PROP_ATLAS_WIDTH, y + rowHeight);
  const frames = {};
  for (const f of placed) {
    png.blit(atlas, f.img, f.x, f.y);
    frames[f.name] = { x: f.x, y: f.y, w: f.p.w, h: f.p.h, anchorX: f.p.anchorX, anchorY: f.p.anchorY };
  }
  writeImage('props/dorf.png', atlas);
  writeJson('props/dorf.json', frames);
}

/*
 * Figuren: Blatt 64×80 aus 16×16-Zellen. Spalte = Richtung (unten, oben, links, rechts), Zeile 0 = stehen,
 * Zeilen 1–4 = gehen. ops ist eine Liste von Schritten [Funktionsname aus png.mjs, ...Argumente], angewandt
 * auf jede Zelle einzeln; ein Schritt der Form { where: { facing?: [...], rows?: [...] }, step: [...] } gilt
 * nur für die genannten Richtungen und Blattzeilen. Jede Zelle muss am Ende wieder 16×16 sein
 * (also mit anchorBottomCenter 16, 16 enden, wenn Zeilen oder Spalten entfernt wurden).
 * Das Gesicht (Faceset, 38×38) bekommt nur die recolor-Schritte ohne where.
 */
const FIGURE_OPS = ['crop', 'recolor', 'dropRows', 'dropCols', 'anchorBottomCenter'];
const FACINGS = ['down', 'up', 'left', 'right'];
const SHEET_ROWS = 5;
const FACE = 38;

/** Die fünf 64×16-Streifen (stehen, gehen 1–4) einer Vorlage, dazu die Quellangabe. */
function figureStrips(f) {
  if (f.sheetRows) {
    // Vorlagen ohne SeparateAnim (z. B. OldWoman): Zeilen aus SpriteSheet.png.
    if (f.sheetRows.length !== SHEET_ROWS) throw new Error(`sheetRows bei Figur ${f.id} braucht ${SHEET_ROWS} Einträge`);
    const rel = `${f.source}/SpriteSheet.png`;
    const sheet = source(rel);
    return { strips: f.sheetRows.map((r) => png.crop(sheet, 0, r * TILE, 4 * TILE, TILE)), quelle: `${rel} (Zeilen ${f.sheetRows.join(', ')})` };
  }
  const idleRel = `${f.source}/SeparateAnim/Idle.png`;
  const walkRel = `${f.source}/SeparateAnim/Walk.png`;
  const idle = png.crop(source(idleRel), 0, 0, 4 * TILE, TILE);
  const walk = source(walkRel);
  return {
    strips: [idle, ...[0, 1, 2, 3].map((r) => png.crop(walk, 0, r * TILE, 4 * TILE, TILE))],
    quelle: `${idleRel} + ${walkRel}`,
  };
}

function normalizeStep(f, s) {
  const step = Array.isArray(s) ? s : s.step;
  const where = Array.isArray(s) ? null : s.where;
  if (!Array.isArray(step) || !FIGURE_OPS.includes(step[0])) throw new Error(`Unbekannter Schritt „${step?.[0]}" bei Figur ${f.id}`);
  if (where && (where.facing ?? []).some((d) => !FACINGS.includes(d))) throw new Error(`Unbekannte Richtung bei Figur ${f.id}`);
  return { op: step[0], args: step.slice(1), where };
}

function applies(where, facing, row) {
  return !where || ((!where.facing || where.facing.includes(facing)) && (!where.rows || where.rows.includes(row)));
}

/** Höhe (höchste belegte Zeile über alle Zellen) und Breite (alle Zellen übereinander) des fertigen Blatts. */
function measure(sheet) {
  let top = TILE, left = TILE, right = -1;
  for (let y = 0; y < sheet.height; y++) {
    for (let x = 0; x < sheet.width; x++) {
      if (sheet.data[(y * sheet.width + x) * 4 + 3] === 0) continue;
      top = Math.min(top, y % TILE);
      left = Math.min(left, x % TILE);
      right = Math.max(right, x % TILE);
    }
  }
  return { hoehe: TILE - top, breite: right - left + 1 };
}

const FACING_DE = { down: 'unten', up: 'oben', left: 'links', right: 'rechts' };
function describeWhere(where) {
  return [
    where.facing && `Richtung ${where.facing.map((d) => FACING_DE[d]).join('/')}`,
    where.rows && `Blattzeile ${where.rows.join('/')}`,
  ].filter(Boolean).join(', ');
}

function describeSteps(steps) {
  return steps.map(({ op, args, where }) => `${op} ${JSON.stringify(args)}${where ? ` nur ${describeWhere(where)}` : ''}`).join('; ');
}

function summarizeSteps(steps) {
  const parts = [];
  const colors = steps.filter((s) => s.op === 'recolor').reduce((n, s) => n + Object.keys(s.args[0]).length, 0);
  if (colors > 0) parts.push(`${colors} Farben umgefärbt`);
  for (const { op, args, where } of steps) {
    if (op !== 'dropRows' && op !== 'dropCols') continue;
    const what = op === 'dropRows' ? 'Zeile' : 'Spalte';
    parts.push(`${what} ${args[0].join(', ')} entfernt${where ? ` (${describeWhere(where)})` : ''}`);
  }
  return parts.length > 0 ? parts.join('; ') : 'unverändert';
}

const figureTable = [];
function buildFigures() {
  if (FIGURES.length === 0) return;
  for (const f of FIGURES) {
    const steps = f.ops.map((s) => normalizeStep(f, s));
    const { strips, quelle } = figureStrips(f);
    const sheet = png.emptyImage(4 * TILE, SHEET_ROWS * TILE);
    strips.forEach((strip, row) => {
      FACINGS.forEach((facing, col) => {
        let cell = png.crop(strip, col * TILE, 0, TILE, TILE);
        for (const { op, args, where } of steps) {
          if (applies(where, facing, row)) cell = png[op](cell, ...args);
        }
        if (cell.width !== TILE || cell.height !== TILE) {
          throw new Error(`Figur ${f.id}, ${facing}/${row}: Zelle ist ${cell.width}×${cell.height} statt 16×16 (anchorBottomCenter fehlt?)`);
        }
        png.blit(sheet, cell, col * TILE, row * TILE);
      });
    });
    const ziel = `figuren/${f.id}.png`;
    writeImage(ziel, sheet);
    record({ ...f, source: quelle }, ziel, null, describeSteps(steps));

    const faceRel = `${f.source}/${f.face ?? 'Faceset.png'}`;
    let face = source(faceRel);
    const faceSteps = steps.filter((s) => s.op === 'recolor' && !s.where);
    for (const { op, args } of faceSteps) face = png[op](face, ...args);
    const faceNotes = faceSteps.length > 0 ? [describeSteps(faceSteps)] : [];
    if (face.width !== FACE || face.height !== FACE) {
      // Einzelne Facesets im Pack sind schmaler (Cavegirl2: 37×38); durchsichtig auf 38×38 ergänzt.
      faceNotes.push(`anchorBottomCenter [${FACE},${FACE}] (Quelle ${face.width}×${face.height})`);
      face = png.anchorBottomCenter(face, FACE, FACE);
    }
    const faceZiel = `figuren/${f.id}-gesicht.png`;
    writeImage(faceZiel, face);
    record({ ...f, source: faceRel }, faceZiel, null, faceNotes.length > 0 ? faceNotes.join('; ') : 'unverändert');

    figureTable.push({ kennung: f.id, vorlage: f.source.split('/').pop(), aenderungen: summarizeSteps(steps), ...measure(sheet), verwendung: f.use });
  }
  const shadow = source(FIGURE_SHADOW.source);
  writeImage('figuren/schatten.png', shadow);
  record(FIGURE_SHADOW, 'figuren/schatten.png', { x: 0, y: 0, w: shadow.width, h: shadow.height }, 'unverändert');
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
    ...(figureTable.length === 0 ? [] : [
      '## Figuren',
      '',
      'Vorlagen aus `Actor/Character/` im Pack; Höhe und Breite in Bildpunkten, gemessen am fertigen Blatt',
      '(höchste und äußerste belegte Stelle über alle Zellen).',
      '',
      '| Figur | Vorlage | Änderungen | Höhe | Breite | Aussehen |',
      '| --- | --- | --- | --- | --- | --- |',
      ...figureTable.map((t) => `| ${[t.kennung, t.vorlage, t.aenderungen, t.hoehe, t.breite, t.verwendung].map(cell).join(' | ')} |`),
      '',
    ]),
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
