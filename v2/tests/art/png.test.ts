import { describe, expect, it } from 'vitest';
// @ts-expect-error -- Grafik-Werkzeuge sind untypisiertes JavaScript (laufen nur in Node, nicht im Spiel)
import { anchorBottomCenter, blit, blitOver, crop, dropCols, dropRows, recolor } from '../../tools/art/png.mjs';

interface Img {
  width: number;
  height: number;
  data: Uint8Array;
}

/** Bild, dessen Pixel (x, y) die Farbe (x, y, Kennwert, Alpha) trägt. */
function makeImage(width: number, height: number, alpha = 255): Img {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data.set([x, y, 7, alpha], i);
    }
  }
  return { width, height, data };
}

function pixel(img: Img, x: number, y: number): number[] {
  const i = (y * img.width + x) * 4;
  return Array.from(img.data.subarray(i, i + 4));
}

describe('png.mjs', () => {
  it('recolor ändert nur exakte Treffer und lässt Alpha stehen', () => {
    const img: Img = { width: 3, height: 1, data: new Uint8Array([
      0x11, 0x22, 0x33, 128,
      0x11, 0x22, 0x34, 255,
      0x11, 0x22, 0x33, 0,
    ]) };
    const out: Img = recolor(img, { '#112233': '#aabbcc' });
    expect(pixel(out, 0, 0)).toEqual([0xaa, 0xbb, 0xcc, 128]);
    expect(pixel(out, 1, 0)).toEqual([0x11, 0x22, 0x34, 255]);
    expect(pixel(out, 2, 0)).toEqual([0xaa, 0xbb, 0xcc, 0]);
    expect(pixel(img, 0, 0)).toEqual([0x11, 0x22, 0x33, 128]);
  });

  it('recolor lehnt ungültige Farben ab', () => {
    expect(() => recolor(makeImage(1, 1), { red: '#000000' })).toThrow(/Farbe/);
  });

  it('dropRows([2]) macht aus 4×4 ein 4×3 mit den Zeilen 0, 1, 3', () => {
    const out: Img = dropRows(makeImage(4, 4), [2]);
    expect([out.width, out.height]).toEqual([4, 3]);
    expect([0, 1, 2].map((y) => pixel(out, 1, y)[1])).toEqual([0, 1, 3]);
  });

  it('dropCols([1]) macht aus 4×4 ein 3×4 mit den Spalten 0, 2, 3', () => {
    const out: Img = dropCols(makeImage(4, 4), [1]);
    expect([out.width, out.height]).toEqual([3, 4]);
    expect([0, 1, 2].map((x) => pixel(out, x, 2)[0])).toEqual([0, 2, 3]);
    expect(pixel(out, 0, 2)[1]).toBe(2);
  });

  it('anchorBottomCenter setzt 14×13 unten mittig in 16×16', () => {
    const out: Img = anchorBottomCenter(makeImage(14, 13), 16, 16);
    expect([out.width, out.height]).toEqual([16, 16]);
    const opaque = (x: number, y: number) => pixel(out, x, y)[3] === 255;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const inside = y >= 3 && x >= 1 && x <= 14;
        expect(opaque(x, y), `Pixel ${x},${y}`).toBe(inside);
      }
    }
    expect(pixel(out, 1, 3)).toEqual([0, 0, 7, 255]);
    expect(pixel(out, 14, 15)).toEqual([13, 12, 7, 255]);
  });

  it('crop schneidet den Ausschnitt aus', () => {
    const out: Img = crop(makeImage(8, 8), 2, 3, 4, 2);
    expect([out.width, out.height]).toEqual([4, 2]);
    expect(pixel(out, 0, 0)).toEqual([2, 3, 7, 255]);
    expect(pixel(out, 3, 1)).toEqual([5, 4, 7, 255]);
  });

  it('crop über den Rand wirft mit deutscher Meldung', () => {
    expect(() => crop(makeImage(8, 8), 6, 0, 4, 4)).toThrow(/außerhalb/);
    expect(() => crop(makeImage(8, 8), -1, 0, 2, 2)).toThrow(/außerhalb/);
  });

  it('blit kopiert ein Bild an die Zielstelle', () => {
    const dst: Img = { width: 4, height: 4, data: new Uint8Array(64) };
    blit(dst, makeImage(2, 2), 2, 1);
    expect(pixel(dst, 2, 1)).toEqual([0, 0, 7, 255]);
    expect(pixel(dst, 3, 2)).toEqual([1, 1, 7, 255]);
    expect(pixel(dst, 1, 1)).toEqual([0, 0, 0, 0]);
    expect(() => blit(dst, makeImage(2, 2), 3, 3)).toThrow(/außerhalb/);
  });

  it('blitOver kopiert nur die nicht durchsichtigen Pixel (Teile übereinanderlegen)', () => {
    const dst: Img = makeImage(3, 1);
    const src: Img = { width: 2, height: 1, data: new Uint8Array([9, 9, 9, 0, 8, 8, 8, 255]) };
    blitOver(dst, src, 1, 0);
    expect(pixel(dst, 1, 0)).toEqual([1, 0, 7, 255]);
    expect(pixel(dst, 2, 0)).toEqual([8, 8, 8, 255]);
    expect(() => blitOver(dst, src, 2, 0)).toThrow(/außerhalb/);
  });
});
