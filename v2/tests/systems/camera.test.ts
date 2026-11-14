import { describe, expect, it } from 'vitest';
import { CAMERA_HALF_LIFE, LOOKAHEAD, cameraScroll, stepCamera, type CameraState } from '../../src/systems/camera';

const VIEW = { width: 320, height: 180 };
const WORLD = { width: 640, height: 512 };

type Target = { x: number; y: number; vx: number; vy: number };

function run(cam: CameraState, target: Target, steps: number, dt: number, view = VIEW, world = WORLD): CameraState {
  let c = cam;
  for (let i = 0; i < steps; i++) c = stepCamera(c, target, dt, view, world);
  return c;
}

describe('stepCamera', () => {
  it('60 Schritte zu 1/60 s und 30 Schritte zu 1/30 s enden höchstens 0,5 Bildpunkte auseinander', () => {
    const start = { x: 200, y: 200 };
    const target = { x: 400, y: 300, vx: 0, vy: 0 };
    const a = run(start, target, 60, 1 / 60);
    const b = run(start, target, 30, 1 / 30);
    expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(0.5);
  });

  it('auch mit laufendem Ziel hängt das Ergebnis kaum von der Bildrate ab', () => {
    let a: CameraState = { x: 200, y: 200 };
    let b: CameraState = { x: 200, y: 200 };
    for (let i = 0; i < 60; i++) a = stepCamera(a, { x: 200 + 64 * ((i + 1) / 60), y: 200, vx: 64, vy: 0 }, 1 / 60, VIEW, WORLD);
    for (let i = 0; i < 30; i++) b = stepCamera(b, { x: 200 + 64 * ((i + 1) / 30), y: 200, vx: 64, vy: 0 }, 1 / 30, VIEW, WORLD);
    expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(1);
  });

  it(`nach ${CAMERA_HALF_LIFE} s ist die halbe Strecke zurückgelegt (± 1)`, () => {
    const start = { x: 200, y: 200 };
    const target = { x: 300, y: 260, vx: 0, vy: 0 };
    const c = run(start, target, 12, CAMERA_HALF_LIFE / 12);
    expect(c.x).toBeGreaterThanOrEqual(249);
    expect(c.x).toBeLessThanOrEqual(251);
    expect(c.y).toBeGreaterThanOrEqual(229);
    expect(c.y).toBeLessThanOrEqual(231);
  });

  it(`bei Bewegung nach rechts liegt das Ziel ${LOOKAHEAD} Bildpunkte vor der Figur`, () => {
    const c = run({ x: 300, y: 250 }, { x: 300, y: 250, vx: 64, vy: 0 }, 600, 1 / 60);
    expect(c.x).toBeCloseTo(300 + LOOKAHEAD, 3);
    expect(c.y).toBeCloseTo(250, 3);
  });

  it('beim Rennen bleibt die Vorausschau bei 12, nach unten zeigt sie nach unten', () => {
    expect(run({ x: 300, y: 250 }, { x: 300, y: 250, vx: 112, vy: 0 }, 600, 1 / 60).x).toBeCloseTo(312, 3);
    expect(run({ x: 300, y: 250 }, { x: 300, y: 250, vx: 0, vy: 64 }, 600, 1 / 60).y).toBeCloseTo(262, 3);
  });

  it('am Kartenrand zeigt die Kamera nie über die Karte hinaus', () => {
    const corners = [
      { x: 0, y: 0, vx: -64, vy: -64 },
      { x: WORLD.width, y: WORLD.height, vx: 64, vy: 64 },
      { x: 0, y: WORLD.height, vx: -112, vy: 0 },
    ];
    for (const target of corners) {
      let c: CameraState = { x: 320, y: 256 };
      for (let i = 0; i < 300; i++) {
        c = stepCamera(c, target, 1 / 60, VIEW, WORLD);
        const { scrollX, scrollY } = cameraScroll(c, VIEW);
        expect(scrollX).toBeGreaterThanOrEqual(0);
        expect(scrollY).toBeGreaterThanOrEqual(0);
        expect(scrollX + VIEW.width).toBeLessThanOrEqual(WORLD.width);
        expect(scrollY + VIEW.height).toBeLessThanOrEqual(WORLD.height);
      }
    }
  });

  it('ist die Karte kleiner als der Ausschnitt, steht sie mittig', () => {
    const small = { width: 200, height: 100 };
    const c = run({ x: 0, y: 0 }, { x: 10, y: 90, vx: 64, vy: 0 }, 10, 1 / 60, VIEW, small);
    const { scrollX, scrollY } = cameraScroll(c, VIEW);
    // Rand links und rechts gleich groß (höchstens ein Bildpunkt Unterschied)
    expect(Math.abs(-scrollX - (scrollX + VIEW.width - small.width))).toBeLessThanOrEqual(1);
    expect(Math.abs(-scrollY - (scrollY + VIEW.height - small.height))).toBeLessThanOrEqual(1);
  });

  it('dt = NaN, negativ oder unendlich → unverändert', () => {
    const cam = { x: 250, y: 220 };
    const target = { x: 400, y: 300, vx: 64, vy: 0 };
    expect(stepCamera(cam, target, Number.NaN, VIEW, WORLD)).toEqual(cam);
    expect(stepCamera(cam, target, -1, VIEW, WORLD)).toEqual(cam);
    expect(stepCamera(cam, target, Number.POSITIVE_INFINITY, VIEW, WORLD)).toEqual(cam);
  });

  it('dt = 0 rückt nur in die Karte', () => {
    const c = stepCamera({ x: -50, y: 9999 }, { x: 400, y: 300, vx: 0, vy: 0 }, 0, VIEW, WORLD);
    expect(c).toEqual({ x: VIEW.width / 2, y: WORLD.height - VIEW.height / 2 });
  });
});

describe('cameraScroll', () => {
  it('liefert ganze Zahlen: linke obere Ecke des Ausschnitts', () => {
    for (const x of [160, 160.2, 160.5, 161.7, 333.49]) {
      const s = cameraScroll({ x, y: x + 0.3 }, VIEW);
      expect(Number.isInteger(s.scrollX)).toBe(true);
      expect(Number.isInteger(s.scrollY)).toBe(true);
      expect(Math.abs(s.scrollX - (x - VIEW.width / 2))).toBeLessThanOrEqual(0.5);
    }
  });

  it('mit Anker bleibt die Figur an derselben Stelle im Bild, solange der Abstand gleich bleibt', () => {
    // Kamera und Figur laufen gleich schnell, Abstand 0,92 Bildpunkte (Nachlauf im Gehen)
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const px = 300 + i * (64 / 60);
      const s = cameraScroll({ x: px + 0.92, y: 200 }, VIEW, { x: px, y: 200 });
      expect(Number.isInteger(s.scrollX)).toBe(true);
      expect(Math.abs(s.scrollX - (px + 0.92 - VIEW.width / 2))).toBeLessThan(1);
      seen.add(Math.round(px) - s.scrollX);
    }
    expect(seen.size).toBe(1);
  });

  it('mit Anker: ganzzahlige Ecke (Kartenrand) bleibt genau', () => {
    for (const px of [10, 10.3, 10.5, 11.9]) {
      expect(cameraScroll({ x: VIEW.width / 2, y: VIEW.height / 2 }, VIEW, { x: px, y: px })).toEqual({ scrollX: 0, scrollY: 0 });
    }
  });
});
