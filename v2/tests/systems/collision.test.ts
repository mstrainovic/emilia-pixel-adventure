import { describe, expect, it } from 'vitest';
import { CORNER_NUDGE, MAX_STEP, moveAndSlide, type Box, type SolidGrid } from '../../src/systems/collision';

/** Karte aus festen Kacheln; alles außerhalb gilt als fest. */
function gridOf(width: number, height: number, solid: (x: number, y: number) => boolean): SolidGrid {
  return {
    width,
    height,
    isSolid: (x, y) => x < 0 || y < 0 || x >= width || y >= height || solid(x, y),
  };
}

const open = gridOf(30, 30, () => false);
const body = (x: number, y: number): Box => ({ x, y, halfW: 5, halfH: 3 });

describe('Konstanten', () => {
  it('Teilschritt ist dünner als eine Kachel', () => {
    expect(MAX_STEP).toBe(4);
    expect(CORNER_NUDGE).toBe(5);
  });
});

describe('moveAndSlide', () => {
  it('auf freier Fläche: Ziel = Start + Weg', () => {
    const r = moveAndSlide(body(80, 80), 10, -7, open);
    expect(r).toEqual({ x: 90, y: 73, blockedX: false, blockedY: false });
  });

  it('Wand rechts: endet mit der Kastenkante genau an der Wandkante, auch bei Weg > MAX_STEP', () => {
    const wall = gridOf(30, 30, (x) => x === 8); // Wand ab x = 128
    const r = moveAndSlide(body(100, 80), 40, 0, wall);
    expect(r.x + 5).toBe(128);
    expect(r.blockedX).toBe(true);
    expect(r.blockedY).toBe(false);
  });

  it('Wand links, oben und unten: genau an der Kante', () => {
    const wall = gridOf(30, 30, (x, y) => x === 4 || y === 4 || y === 10);
    expect(moveAndSlide(body(100, 120), -80, 0, wall).x - 5).toBe(80);
    expect(moveAndSlide(body(100, 120), 0, -80, wall).y - 3).toBe(80);
    expect(moveAndSlide(body(100, 120), 0, 80, wall).y + 3).toBe(160);
  });

  it('schräg gegen eine Wand: x bleibt an der Wand, y wächst', () => {
    const wall = gridOf(30, 30, (x) => x === 8);
    const r = moveAndSlide(body(115, 60), 10, 10, wall);
    expect(r.x).toBe(123);
    expect(r.y).toBe(70);
    expect(r.blockedX).toBe(true);
    expect(r.blockedY).toBe(false);
  });

  it('Ecke: 4 Bildpunkte Überlappung werden umrutscht', () => {
    const tile = gridOf(30, 30, (x, y) => x === 8 && y === 5); // 128..144 × 80..96
    let b = body(115, 81); // Unterkante 84: überlappt die Kachel quer um 4
    for (let i = 0; i < 6; i++) {
      const r = moveAndSlide(b, 4, 0, tile);
      b = { ...b, x: r.x, y: r.y };
    }
    expect(b.x).toBe(139); // 24 weiter, nichts verloren
    expect(b.y + 3).toBeLessThanOrEqual(80); // über der Kachel
    for (let i = 0; i < 6; i++) {
      const r = moveAndSlide(b, 4, 0, tile);
      b = { ...b, x: r.x, y: r.y };
    }
    expect(b.x - 5).toBeGreaterThan(144); // ganz vorbei
  });

  it('Ecke: 6 Bildpunkte Überlappung bleiben hängen', () => {
    const tile = gridOf(30, 30, (x, y) => x === 8 && y === 5);
    let b = body(115, 83); // Unterkante 86: Überstand 6 > CORNER_NUDGE
    let last = moveAndSlide(b, 0, 0, tile);
    for (let i = 0; i < 10; i++) {
      last = moveAndSlide(b, 4, 0, tile);
      b = { ...b, x: last.x, y: last.y };
    }
    expect(last.blockedX).toBe(true);
    expect(b.x + 5).toBe(128);
    expect(b.y).toBe(83);
  });

  it('Lücke von genau einer Kachel ist mit 3 Bildpunkten Versatz passierbar', () => {
    const gap = gridOf(30, 30, (x, y) => x === 8 && y !== 5); // Lücke y 80..96
    let b: Box = { x: 110, y: 91, halfW: 5, halfH: 8 }; // 16 hoch, Mitte der Lücke 88: Versatz 3
    for (let i = 0; i < 20; i++) {
      const r = moveAndSlide(b, 2, 0, gap);
      b = { ...b, x: r.x, y: r.y };
    }
    expect(b.x - 5).toBeGreaterThanOrEqual(144); // durch die Lücke hindurch
    expect(b.y).toBe(88); // mittig in der Lücke eingerastet
  });

  it('ungültige Werte bewegen nichts', () => {
    expect(moveAndSlide(body(80, 80), NaN, 3, open)).toEqual({ x: 80, y: 80, blockedX: false, blockedY: false });
  });
});
