import { PNG } from 'pngjs';

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

/** Jeder zoom × zoom-Block im Kamera-Ausschnitt ist einfarbig; liefert die ersten Abweichungen. */
export function blockProblems(png: PngImage, snapshot: GridSnapshot): string[] {
  const problems: string[] = [];
  if (png.width !== snapshot.deviceWidth || png.height !== snapshot.deviceHeight) {
    return [`Bildgröße ${png.width}×${png.height} statt ${snapshot.deviceWidth}×${snapshot.deviceHeight}`];
  }
  const { zoom, viewWidth, viewHeight, offsetX, offsetY } = snapshot.layout;
  for (let fy = 0; fy < viewHeight; fy++) {
    for (let fx = 0; fx < viewWidth; fx++) {
      const x0 = offsetX + fx * zoom;
      const y0 = offsetY + fy * zoom;
      const [r, g, b] = png.at(x0, y0);
      for (let dy = 0; dy < zoom; dy++) {
        for (let dx = 0; dx < zoom; dx++) {
          const got = png.at(x0 + dx, y0 + dy);
          if (got[0] !== r || got[1] !== g || got[2] !== b) {
            if (problems.length < 10) problems.push(`Bildpunkt ${fx}/${fy}, Pixel ${x0 + dx}/${y0 + dy}: ${got} statt ${[r, g, b]}`);
          }
        }
      }
    }
  }
  return problems;
}
