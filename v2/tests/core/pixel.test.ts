import { describe, it, expect } from 'vitest';
import { computeZoom, computeLayout } from '../../src/core/pixel';

describe('computeZoom', () => {
  it.each([
    [1920, 1080, 6], [1280, 720, 4], [3840, 2160, 12], [2436, 1125, 6],
    [2048, 1536, 8], [1125, 2436, 4], [800, 450, 2], [239, 179, 1],
  ])('%i×%i → %i', (w, h, z) => expect(computeZoom(w, h)).toBe(z));

  it('liefert bei unbrauchbaren Größen 1', () => {
    for (const [w, h] of [[0, 0], [-5, 100], [Number.NaN, 100], [100, Number.POSITIVE_INFINITY]]) {
      expect(computeZoom(w as number, h as number)).toBe(1);
    }
  });
});

describe('computeLayout', () => {
  it.each([
    [1920, 1080, { zoom: 6, viewWidth: 320, viewHeight: 180, offsetX: 0, offsetY: 0 }],
    [2436, 1125, { zoom: 6, viewWidth: 406, viewHeight: 187, offsetX: 0, offsetY: 1 }],
    [1366, 768, { zoom: 4, viewWidth: 341, viewHeight: 192, offsetX: 1, offsetY: 0 }],
    [2400, 1350, { zoom: 7, viewWidth: 342, viewHeight: 192, offsetX: 3, offsetY: 3 }],
  ])('%i×%i', (w, h, layout) => expect(computeLayout(w, h)).toEqual(layout));

  it('liefert bei unbrauchbaren Größen ein Feld aus einem Bildpunkt', () => {
    for (const [w, h] of [[0, 0], [-5, 100], [Number.NaN, 100], [100, Number.POSITIVE_INFINITY]]) {
      expect(computeLayout(w as number, h as number)).toEqual({ zoom: 1, viewWidth: 1, viewHeight: 1, offsetX: 0, offsetY: 0 });
    }
  });
});
