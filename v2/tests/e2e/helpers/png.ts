import { PNG } from 'pngjs';

/**
 * Für Bildschirmfotos, die das Spielbild selbst prüfen: blendet die HTML-Oberfläche (Anzeige, Schnellleiste) aus,
 * damit nur die Zeichenfläche geprüft wird (page.screenshot({ style: HIDE_UI })).
 */
export const HIDE_UI = '#ui { visibility: hidden !important; }';

export interface PngImage {
  width: number;
  height: number;
  /** Farbe eines Pixels als [Rot, Grün, Blau]. */
  at(x: number, y: number): [number, number, number];
}

/** Liest ein PNG (z. B. einen Screenshot in Gerätepixeln). */
export function readPng(buffer: Buffer): PngImage {
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;
  return {
    width,
    height,
    at(x, y) {
      const i = (y * width + x) * 4;
      return [data[i]!, data[i + 1]!, data[i + 2]!];
    },
  };
}

/** Aufteilung der Zeichenfläche wie `PixelLayout` und Messung wie `PixelGridSnapshot`. */
export interface GridSnapshot {
  deviceWidth: number;
  deviceHeight: number;
  dpr: number;
  layout: { zoom: number; viewWidth: number; viewHeight: number; offsetX: number; offsetY: number };
}

/** Rechteck in Gerätepixeln des Bildes (rechte und untere Kante ausgeschlossen). */
export interface DeviceRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Rechteck um die laufende Spielfigur (Bild 16×16 über dem Fußpunkt, Schatten darunter) samt `margin` Bildpunkten
 * Spiel für den Weg zwischen Bildschirmfoto und Abfrage. Die Figur rastet auf Bildschirmpixel ein und liegt darum
 * meist nicht auf dem Raster der Welt; dieses Rechteck nimmt blockProblems aus.
 */
export function figureRect(snapshot: GridSnapshot, foot: { x: number; y: number }, scroll: { scrollX: number; scrollY: number }, margin = 16): DeviceRect {
  const { zoom, offsetX, offsetY } = snapshot.layout;
  const sx = offsetX + (foot.x - scroll.scrollX) * zoom;
  const sy = offsetY + (foot.y - scroll.scrollY) * zoom;
  return {
    x0: Math.floor(sx - (8 + margin) * zoom),
    x1: Math.ceil(sx + (8 + margin) * zoom),
    y0: Math.floor(sy - (16 + margin) * zoom),
    y1: Math.ceil(sy + (4 + margin) * zoom),
  };
}

/**
 * Das Bild im Kamera-Ausschnitt besteht aus einfarbigen zoom × zoom-Blöcken; liefert die ersten Abweichungen.
 *
 * Die Kamera rastet auf ganze Bildschirmpixel ein, das Raster der Welt liegt also um 0 … zoom − 1 Gerätepixel
 * verschoben im Ausschnitt. Die Verschiebung wird aus dem Bild gelesen: Farbwechsel zwischen Nachbarpixeln dürfen
 * je Achse nur in einer Restklasse (Ort mod zoom) vorkommen. `ignore` nimmt ein Rechteck aus (die laufende Figur).
 */
export function blockProblems(png: PngImage, snapshot: GridSnapshot, ignore?: DeviceRect): string[] {
  if (png.width !== snapshot.deviceWidth || png.height !== snapshot.deviceHeight) {
    return [`Bildgröße ${png.width}×${png.height} statt ${snapshot.deviceWidth}×${snapshot.deviceHeight}`];
  }
  const { zoom, viewWidth, viewHeight, offsetX, offsetY } = snapshot.layout;
  const width = viewWidth * zoom;
  const height = viewHeight * zoom;
  const skipped = (x: number, y: number): boolean => ignore !== undefined && x >= ignore.x0 && x < ignore.x1 && y >= ignore.y0 && y < ignore.y1;
  const same = (ax: number, ay: number, bx: number, by: number): boolean => {
    const a = png.at(ax, ay);
    const b = png.at(bx, by);
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  };
  // Farbwechsel je Restklasse, mit dem ersten Fundort
  const changesX = new Map<number, { count: number; where: string }>();
  const changesY = new Map<number, { count: number; where: string }>();
  const note = (map: Map<number, { count: number; where: string }>, rest: number, where: string): void => {
    const entry = map.get(rest);
    if (entry) entry.count++;
    else map.set(rest, { count: 1, where });
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = offsetX + x;
      const py = offsetY + y;
      if (skipped(px, py)) continue;
      if (x > 0 && !skipped(px - 1, py) && !same(px, py, px - 1, py)) note(changesX, x % zoom, `${px}/${py}`);
      if (y > 0 && !skipped(px, py - 1) && !same(px, py, px, py - 1)) note(changesY, y % zoom, `${px}/${py}`);
    }
  }
  const problems: string[] = [];
  for (const [axis, changes] of [['waagrecht', changesX], ['senkrecht', changesY]] as const) {
    if (changes.size <= 1) continue;
    const sorted = [...changes].sort((a, b) => b[1].count - a[1].count);
    const [mainRest, main] = sorted[0]!;
    for (const [rest, c] of sorted.slice(1)) {
      if (problems.length < 10) {
        problems.push(`Farbwechsel ${axis} außerhalb des Rasters: Rest ${rest} (${c.count}-mal, zuerst bei Pixel ${c.where}); das Raster liegt bei Rest ${mainRest} (${main.count}-mal), Zoom ${zoom}`);
      }
    }
  }
  return problems;
}
