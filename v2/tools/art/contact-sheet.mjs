// Kontaktbogen zum Aussuchen: ein Bild aus dem Pack 4-fach vergrößert, mit 16-Pixel-Gitter und
// Spalten-/Zeilennummern (in 16er-Schritten), nach test-artifacts/art/.
// Aufruf: NINJA_PACK_DIR=<Pack-Ordner> node tools/art/contact-sheet.mjs <Datei im Pack>
import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emptyImage, readPng, writePng } from './png.mjs';

const SCALE = 4;
const CELL = 16 * SCALE;
const DIGIT_SCALE = 2;
const LEFT = 4 * 4 * DIGIT_SCALE;
const TOP = 8 * DIGIT_SCALE;
const BACKGROUND = [64, 64, 64, 255];
const GRID = [255, 0, 255, 255];
const TEXT = [255, 255, 255, 255];

// Ziffern als festes 3×5-Raster, Zeile für Zeile.
const DIGITS = [
  '111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001',
  '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111',
];

const packDir = process.env.NINJA_PACK_DIR;
const rel = process.argv[2];
if (!packDir || !rel) throw new Error('Aufruf: NINJA_PACK_DIR=<Pack-Ordner> node tools/art/contact-sheet.mjs <Datei im Pack>');
const full = resolve(packDir, rel);
const inside = relative(resolve(packDir), full);
if (isAbsolute(rel) || inside.startsWith('..') || isAbsolute(inside) || !existsSync(full)) {
  throw new Error(`„${rel}" ist keine Datei im Pack`);
}

const src = readPng(full);
const out = emptyImage(LEFT + src.width * SCALE, TOP + src.height * SCALE);

function put(x, y, color) {
  if (x < 0 || y < 0 || x >= out.width || y >= out.height) return;
  out.data.set(color, (y * out.width + x) * 4);
}
function fill(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) put(xx, yy, color);
}
function number(n, x, y) {
  [...String(n)].forEach((ch, i) => {
    const bits = DIGITS[Number(ch)];
    for (let b = 0; b < 15; b++) {
      if (bits[b] === '1') fill(x + (i * 4 + (b % 3)) * DIGIT_SCALE, y + Math.floor(b / 3) * DIGIT_SCALE, DIGIT_SCALE, DIGIT_SCALE, TEXT);
    }
  });
}

fill(0, 0, out.width, out.height, BACKGROUND);
for (let y = 0; y < src.height; y++) {
  for (let x = 0; x < src.width; x++) {
    const i = (y * src.width + x) * 4;
    const a = src.data[i + 3] / 255;
    const color = [0, 1, 2].map((c) => Math.round(src.data[i + c] * a + BACKGROUND[c] * (1 - a)));
    fill(LEFT + x * SCALE, TOP + y * SCALE, SCALE, SCALE, [...color, 255]);
  }
}
for (let c = 0; c * CELL <= src.width * SCALE; c++) {
  fill(LEFT + c * CELL, TOP, 1, src.height * SCALE, GRID);
  if (c * CELL < src.width * SCALE) number(c, LEFT + c * CELL + 4, 2);
}
for (let r = 0; r * CELL <= src.height * SCALE; r++) {
  fill(LEFT, TOP + r * CELL, src.width * SCALE, 1, GRID);
  if (r * CELL < src.height * SCALE) number(r, 2, TOP + r * CELL + 4);
}

const name = inside.split(/[\\/]/).join('_');
const target = fileURLToPath(new URL(`../../../test-artifacts/art/${name}`, import.meta.url));
writePng(target, out);
console.log(`Kontaktbogen: ${target} (Spalte/Zeile × 16 = Pixel im Quellbild)`);
