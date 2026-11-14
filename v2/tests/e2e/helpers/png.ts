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
