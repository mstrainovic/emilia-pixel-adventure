import { describe, it, expect } from 'vitest';
import { computeZoom, computeLayout, snapToScreen, canvasToView } from '../../src/core/pixel';

describe('snapToScreen', () => {
  it('rundet auf ganze Bildschirmpixel: Vielfache von 1/Zoom Bildpunkt', () => {
    expect(snapToScreen(10.4, 1)).toBe(10);
    expect(snapToScreen(10.26, 4)).toBe(10.25);
    expect(snapToScreen(10.1, 6) * 6).toBeCloseTo(61, 9);
    for (const zoom of [1, 2, 3, 4, 5, 6, 7, 8, 12]) {
      for (const v of [0, 0.49, 17.3333, 311.99, 333.5, -4.2]) {
        const s = snapToScreen(v, zoom);
        expect(Math.abs(s * zoom - Math.round(s * zoom)), `${v} bei Zoom ${zoom}`).toBeLessThan(1e-9);
        expect(Math.abs(s - v)).toBeLessThanOrEqual(0.5 / zoom + 1e-9);
      }
    }
  });

  it('ganze Bildpunkte bleiben bei jedem Zoom genau', () => {
    for (const zoom of [1, 3, 5, 6, 7]) for (const v of [0, 1, 232, 312, 640]) expect(snapToScreen(v, zoom)).toBe(v);
  });

  it('unbrauchbarer Zoom → ganze Bildpunkte', () => {
    for (const zoom of [0, -2, Number.NaN, Number.POSITIVE_INFINITY, 2.5]) expect(snapToScreen(10.4, zoom)).toBe(10);
  });
});

describe('computeZoom', () => {
  // Große Bildschirme (kürzere Seite ab 500 CSS-Pixel): mindestens 288×216 Bildpunkte sichtbar.
  // Wunsch des Auftraggebers am 2026-11-14: am PC war das Bild zu nah (vorher 240×180, Full HD mit Zoom 6).
  it.each([
    [1920, 1080, 1, 5], [1280, 720, 1, 3], [1366, 768, 1, 3], [2560, 1440, 1, 6], [3840, 2160, 1, 10],
    [1920, 1080, 1.25, 5], [3840, 2160, 2, 10],
    // iPad quer und hochkant (1024×768 CSS-Pixel, Dichte 2)
    [2048, 1536, 2, 7], [1536, 2048, 2, 5],
  ])('groß: %i×%i bei Dichte %f → %i', (w, h, dpr, z) => expect(computeZoom(w, h, dpr)).toBe(z));

  // Handys (kürzere Seite unter 500 CSS-Pixel) bleiben wie bisher: mindestens 240×180 Bildpunkte.
  it.each([
    [2436, 1125, 3, 6], [1125, 2436, 3, 4], [2532, 1170, 3, 6], [1624, 750, 2, 4], [800, 450, 1, 2], [239, 179, 1, 1],
  ])('klein: %i×%i bei Dichte %f → %i', (w, h, dpr, z) => expect(computeZoom(w, h, dpr)).toBe(z));

  it('die Grenze liegt bei 500 CSS-Pixeln der kürzeren Seite', () => {
    expect(computeZoom(1600, 998, 2)).toBe(5); // 499 CSS-Pixel: 240×180
    expect(computeZoom(1600, 1000, 2)).toBe(4); // 500 CSS-Pixel: 288×216
    expect(computeZoom(998, 1600, 2)).toBe(4); // hochkant, 499 CSS-Pixel: floor(998 / 240)
    expect(computeZoom(1000, 1600, 2)).toBe(3); // hochkant, 500 CSS-Pixel: floor(1000 / 288)
  });

  it('ohne oder mit unbrauchbarer Dichte gilt Dichte 1', () => {
    expect(computeZoom(1920, 1080)).toBe(5);
    for (const dpr of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(computeZoom(1920, 1080, dpr)).toBe(5);
  });

  it('liefert bei unbrauchbaren Größen 1', () => {
    for (const [w, h] of [[0, 0], [-5, 100], [Number.NaN, 100], [100, Number.POSITIVE_INFINITY]]) {
      expect(computeZoom(w as number, h as number)).toBe(1);
    }
  });
});

describe('computeLayout', () => {
  it.each([
    [1920, 1080, 1, { zoom: 5, viewWidth: 384, viewHeight: 216, offsetX: 0, offsetY: 0 }],
    [2436, 1125, 3, { zoom: 6, viewWidth: 406, viewHeight: 187, offsetX: 0, offsetY: 1 }],
    [1366, 768, 1, { zoom: 3, viewWidth: 455, viewHeight: 256, offsetX: 0, offsetY: 0 }],
    [2048, 1536, 2, { zoom: 7, viewWidth: 292, viewHeight: 219, offsetX: 2, offsetY: 1 }],
    [2400, 1350, 1, { zoom: 6, viewWidth: 400, viewHeight: 225, offsetX: 0, offsetY: 0 }],
  ])('%i×%i bei Dichte %f', (w, h, dpr, layout) => expect(computeLayout(w, h, dpr)).toEqual(layout));

  it('auf großen Bildschirmen sind mindestens 288×216 Bildpunkte zu sehen, auf Handys mindestens 240×180', () => {
    for (const [w, h, dpr] of [[1920, 1080, 1], [1280, 720, 1], [2048, 1536, 2], [1536, 2048, 2], [3440, 1440, 1], [1024, 768, 1]] as const) {
      const l = computeLayout(w, h, dpr);
      expect(l.viewWidth, `${w}×${h}`).toBeGreaterThanOrEqual(288);
      expect(l.viewHeight, `${w}×${h}`).toBeGreaterThanOrEqual(216);
    }
    for (const [w, h, dpr] of [[2436, 1125, 3], [1125, 2436, 3], [1624, 750, 2], [1080, 2400, 2.625]] as const) {
      const l = computeLayout(w, h, dpr);
      expect(l.viewWidth, `${w}×${h}`).toBeGreaterThanOrEqual(240);
      expect(l.viewHeight, `${w}×${h}`).toBeGreaterThanOrEqual(180);
    }
  });

  it('liefert bei unbrauchbaren Größen ein Feld aus einem Bildpunkt', () => {
    for (const [w, h] of [[0, 0], [-5, 100], [Number.NaN, 100], [100, Number.POSITIVE_INFINITY]]) {
      expect(computeLayout(w as number, h as number)).toEqual({ zoom: 1, viewWidth: 1, viewHeight: 1, offsetX: 0, offsetY: 0 });
    }
  });
});

describe('canvasToView', () => {
  const plain = computeLayout(1920, 1080, 1); // Zoom 5, Rand 0/0, Feld 384×216
  const framed = { zoom: 5, viewWidth: 384, viewHeight: 216, offsetX: 3, offsetY: 7 };

  it('ohne Rand: Ecke, letzter Gerätepixel und erster Pixel dahinter', () => {
    expect(canvasToView(plain, 0, 0)).toEqual({ x: 0, y: 0, inside: true });
    const last = canvasToView(plain, 1919, 1079);
    expect(last.x).toBeCloseTo(383.8, 9);
    expect(last.y).toBeCloseTo(215.8, 9);
    expect(last.inside).toBe(true);
    const past = canvasToView(plain, 1920, 500);
    expect(past.x).toBe(384);
    expect(past.inside).toBe(false);
  });

  it('mit Rand 3/7: der Rand liefert negative Werte und liegt außerhalb, der Feldanfang ist 0/0', () => {
    const edge = canvasToView(framed, 2, 7);
    expect(edge.x).toBeLessThan(0);
    expect(edge.inside).toBe(false);
    expect(canvasToView(framed, 3, 7)).toEqual({ x: 0, y: 0, inside: true });
    const above = canvasToView(framed, 3, 6);
    expect(above.y).toBeLessThan(0);
    expect(above.inside).toBe(false);
  });

  it('Werte außerhalb werden nicht gekappt, ungerundet', () => {
    const r = canvasToView(framed, 3 + 5 * 400 + 2, 7 - 10);
    expect(r.x).toBeCloseTo(400.4, 9);
    expect(r.y).toBe(-2);
    expect(r.inside).toBe(false);
  });

  it('nicht endliche Eingaben → NaN und außerhalb', () => {
    for (const [x, y] of [[Number.NaN, 5], [5, Number.NaN], [Number.POSITIVE_INFINITY, 5], [5, Number.NEGATIVE_INFINITY]]) {
      const r = canvasToView(plain, x as number, y as number);
      expect(r.x).toBeNaN();
      expect(r.y).toBeNaN();
      expect(r.inside).toBe(false);
    }
  });
});
