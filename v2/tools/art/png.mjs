// Kleine Bildwerkzeuge für die Grafik-Aufbereitung. Bilder sind { width, height, data: Uint8Array (RGBA) }.
// Alle Funktionen außer blit liefern neue Bilder und lassen die Eingabe unverändert.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PNG } from 'pngjs';

/** Leeres (voll durchsichtiges) Bild. */
export function emptyImage(width, height) {
  return { width, height, data: new Uint8Array(width * height * 4) };
}

export function readPng(path) {
  const png = PNG.sync.read(readFileSync(path));
  return { width: png.width, height: png.height, data: new Uint8Array(png.data) };
}

/** Schreibt immer gleich: RGBA, 8 Bit, feste Kompression, keine Zeitstempel. */
export function writePng(path, img) {
  const png = new PNG({ width: img.width, height: img.height });
  png.data = Buffer.from(img.data);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, PNG.sync.write(png, { colorType: 6, bitDepth: 8, inputHasAlpha: true, deflateLevel: 9 }));
}

function checkInside(img, x, y, w, h, what) {
  const ok = Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(w) && Number.isInteger(h)
    && w > 0 && h > 0 && x >= 0 && y >= 0 && x + w <= img.width && y + h <= img.height;
  if (!ok) {
    throw new Error(`${what} ${x},${y} ${w}×${h} liegt außerhalb des Bildes (${img.width}×${img.height})`);
  }
}

export function crop(img, x, y, w, h) {
  checkInside(img, x, y, w, h, 'Ausschnitt');
  const out = emptyImage(w, h);
  for (let row = 0; row < h; row++) {
    const start = ((y + row) * img.width + x) * 4;
    out.data.set(img.data.subarray(start, start + w * 4), row * w * 4);
  }
  return out;
}

/** Kopiert src (samt Alpha) nach dst an dx, dy; verändert dst. */
export function blit(dst, src, dx, dy) {
  checkInside(dst, dx, dy, src.width, src.height, 'Zielbereich');
  for (let row = 0; row < src.height; row++) {
    const start = row * src.width * 4;
    dst.data.set(src.data.subarray(start, start + src.width * 4), ((dy + row) * dst.width + dx) * 4);
  }
  return dst;
}

/** Wie blit, aber durchsichtige Pixel von src bleiben aus (Teile übereinanderlegen); verändert dst. */
export function blitOver(dst, src, dx, dy) {
  checkInside(dst, dx, dy, src.width, src.height, 'Zielbereich');
  for (let row = 0; row < src.height; row++) {
    for (let col = 0; col < src.width; col++) {
      const s = (row * src.width + col) * 4;
      if (src.data[s + 3] === 0) continue;
      dst.data.set(src.data.subarray(s, s + 4), ((dy + row) * dst.width + dx + col) * 4);
    }
  }
  return dst;
}

function parseColor(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`Ungültige Farbe „${hex}" (erwartet #rrggbb)`);
  }
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** Ersetzt exakt passende RGB-Farben; Alpha bleibt, wie es ist. */
export function recolor(img, map) {
  const pairs = new Map(Object.entries(map).map(([from, to]) => {
    const [r, g, b] = parseColor(from);
    return [(r << 16) | (g << 8) | b, parseColor(to)];
  }));
  const out = { width: img.width, height: img.height, data: new Uint8Array(img.data) };
  for (let i = 0; i < out.data.length; i += 4) {
    const to = pairs.get((out.data[i] << 16) | (out.data[i + 1] << 8) | out.data[i + 2]);
    if (to) out.data.set(to, i);
  }
  return out;
}

/** Entfernt Zeilen (Indizes im Quellbild). */
export function dropRows(img, rows) {
  const drop = new Set(rows);
  const keep = [...Array(img.height).keys()].filter((y) => !drop.has(y));
  const out = emptyImage(img.width, keep.length);
  keep.forEach((y, row) => blit(out, crop(img, 0, y, img.width, 1), 0, row));
  return out;
}

/** Entfernt Spalten (Indizes im Quellbild). */
export function dropCols(img, cols) {
  const drop = new Set(cols);
  const keep = [...Array(img.width).keys()].filter((x) => !drop.has(x));
  const out = emptyImage(keep.length, img.height);
  keep.forEach((x, col) => blit(out, crop(img, x, 0, 1, img.height), col, 0));
  return out;
}

/** Setzt das Bild unten mittig in ein leeres w×h-Bild (bei ungerader Differenz eine Spalte mehr rechts). */
export function anchorBottomCenter(img, w, h) {
  if (img.width > w || img.height > h) {
    throw new Error(`Bild ${img.width}×${img.height} passt nicht in ${w}×${h}`);
  }
  return blit(emptyImage(w, h), img, Math.floor((w - img.width) / 2), h - img.height);
}
