import { describe, it, expect } from 'vitest';
import { computeZoom, computeView } from '../../src/core/pixel';

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

it('computeView liefert das Sichtfeld in Bildpunkten', () => {
  expect(computeView(1920, 1080)).toEqual({ zoom: 6, width: 320, height: 180 });
  expect(computeView(2436, 1125)).toEqual({ zoom: 6, width: 406, height: 187.5 });
});
