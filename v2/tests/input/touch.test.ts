import { describe, expect, it } from 'vitest';
import {
  STICK_AXIS_SNAP,
  STICK_DEAD_ZONE,
  STICK_RADIUS,
  STICK_RUN_AT,
  TouchSource,
  stickVector,
} from '../../src/input/touch';
import type { SolidGrid } from '../../src/systems/collision';
import { stepMover, type Mover } from '../../src/systems/movement';

describe('Konstanten des Sticks', () => {
  it('wie im Plan: Radius 40, tote Zone 8 (CSS-Pixel), Rennen ab 0,95, Einrasten unter 0,2', () => {
    expect(STICK_RADIUS).toBe(40);
    expect(STICK_DEAD_ZONE).toBe(8);
    expect(STICK_RUN_AT).toBe(0.95);
    expect(STICK_AXIS_SNAP).toBe(0.2);
  });
});

describe('stickVector', () => {
  it('unter 8 Pixel Auslenkung: Betrag 0', () => {
    expect(stickVector(100, 100, 104, 100)).toEqual({ x: 0, y: 0, magnitude: 0 });
    expect(stickVector(100, 100, 100, 100)).toEqual({ x: 0, y: 0, magnitude: 0 });
  });

  it('stufenlos zwischen toter Zone und Radius: 24 Pixel nach rechts → x 0,5', () => {
    const v = stickVector(100, 100, 124, 100);
    expect(v.x).toBeGreaterThanOrEqual(0.48);
    expect(v.x).toBeLessThanOrEqual(0.52);
    expect(v.y).toBe(0);
  });

  it('weit über den Radius hinaus: Betrag 1', () => {
    const v = stickVector(100, 100, 300, 100);
    expect(v.x).toBe(1);
    expect(v.y).toBe(0);
    expect(v.magnitude).toBe(1);
  });

  it('schräg: Betrag höchstens 1, Vektor und Betrag passen zusammen', () => {
    for (const [x, y] of [[140, 140], [300, 250], [60, 70], [130, 75]] as const) {
      const v = stickVector(100, 100, x, y);
      expect(v.magnitude).toBeLessThanOrEqual(1);
      expect(Math.hypot(v.x, v.y)).toBeCloseTo(v.magnitude, 10);
    }
  });

  it('rastet nahe der Achse ein (Queranteil 0,1 → x genau 0, y 1), bei Queranteil 0,5 nicht', () => {
    const snapped = stickVector(100, 100, 104, 140);
    expect(snapped.x).toBe(0);
    expect(Object.is(snapped.x, -0)).toBe(false);
    expect(snapped.y).toBe(1);
    expect(stickVector(100, 100, 120, 140).x).toBeGreaterThan(0);
    // auch nach links und oben, ohne negative Null
    const up = stickVector(100, 100, 97, 70);
    expect(Object.is(up.x, 0)).toBe(true);
    expect(up.y).toBeLessThan(0);
  });

  it('der Betrag bleibt beim Einrasten erhalten', () => {
    const v = stickVector(100, 100, 102, 124);
    const raw = (Math.hypot(2, 24) - STICK_DEAD_ZONE) / (STICK_RADIUS - STICK_DEAD_ZONE);
    expect(v.x).toBe(0);
    expect(v.magnitude).toBeCloseTo(raw, 10);
    expect(v.y).toBeCloseTo(raw, 10);
  });

  it('ungültige Werte ergeben Stillstand', () => {
    expect(stickVector(Number.NaN, 100, 140, 100)).toEqual({ x: 0, y: 0, magnitude: 0 });
    expect(stickVector(100, 100, Number.POSITIVE_INFINITY, 100)).toEqual({ x: 0, y: 0, magnitude: 0 });
  });
});

/** 40×40 Kacheln, Zeile 22 fest (Wand quer unter der Figur). */
const wallBelow: SolidGrid = {
  width: 40,
  height: 40,
  isSolid: (x, y) => x < 0 || y < 0 || x >= 40 || y >= 40 || y === 22,
};

describe('Stick an der Wand (Vorab 5)', () => {
  it('fast gerade auf die Wand: nach 30 Schritten steht sie, kein Versatz quer zur Wand', () => {
    const v = stickVector(100, 100, 104, 140);
    const intent = { x: v.x, y: v.y, run: v.magnitude >= STICK_RUN_AT };
    // mitten auf der langen Wand (weit weg von jeder Ecke, also außerhalb der Rutschzone), knapp darüber
    let m: Mover = { x: 320, y: 340, vx: 0, vy: 0, facing: 'down', moving: false, walkTime: 0 };
    for (let i = 0; i < 30; i++) m = stepMover(m, intent, 1 / 60, wallBelow);
    expect(m.moving).toBe(false);
    expect(m.x).toBe(320);
    expect(m.y).toBeLessThanOrEqual(22 * 16);
  });
});

describe('TouchSource', () => {
  it('ist ein Touch-Gerät und ruht am Anfang', () => {
    const t = new TouchSource();
    expect(t.device).toBe('touch');
    expect(t.move).toEqual({ x: 0, y: 0 });
    expect(t.run).toBe(false);
    expect(t.drainPressed()).toEqual([]);
  });

  it('stickStart und stickMove desselben Fingers liefern den Vektor', () => {
    const t = new TouchSource();
    t.stickStart(1, 100, 100);
    expect(t.move).toEqual({ x: 0, y: 0 });
    t.stickMove(1, 124, 100);
    expect(t.move.x).toBeCloseTo(0.5, 2);
    expect(t.move.y).toBe(0);
    expect(t.run).toBe(false);
  });

  it('ein fremder Finger ändert nichts, auch sein Abheben nicht', () => {
    const t = new TouchSource();
    t.stickStart(1, 100, 100);
    t.stickMove(1, 140, 100);
    t.stickStart(2, 500, 500);
    t.stickMove(2, 300, 300);
    t.stickEnd(2);
    expect(t.move).toEqual({ x: 1, y: 0 });
    expect(t.holds(1)).toBe(true);
    expect(t.holds(2)).toBe(false);
    expect(t.held).toBe(true);
    t.stickEnd(1);
    expect(t.held).toBe(false);
  });

  it('stickEnd des eigenen Fingers lässt los', () => {
    const t = new TouchSource();
    t.stickStart(1, 100, 100);
    t.stickMove(1, 140, 100);
    t.stickEnd(1);
    expect(t.move).toEqual({ x: 0, y: 0 });
    expect(t.run).toBe(false);
    expect(t.holds(1)).toBe(false);
    // danach wirkt ein Ziehen desselben Fingers nicht mehr
    t.stickMove(1, 140, 140);
    expect(t.move).toEqual({ x: 0, y: 0 });
  });

  it('press: genau einmal in drainPressed', () => {
    const t = new TouchSource();
    t.press('interact');
    expect(t.drainPressed()).toEqual(['interact']);
    expect(t.drainPressed()).toEqual([]);
  });

  it('Auslenkung 0,96 → rennt, 0,9 → geht', () => {
    const t = new TouchSource();
    t.stickStart(1, 100, 100);
    // 8 + 0,96 × 32 = 38,72 Pixel
    t.stickMove(1, 138.72, 100);
    expect(t.run).toBe(true);
    t.stickMove(1, 100 + 8 + 0.9 * 32, 100);
    expect(t.run).toBe(false);
  });

  it('reset lässt den Stick los und verwirft Drücke', () => {
    const t = new TouchSource();
    t.stickStart(1, 100, 100);
    t.stickMove(1, 140, 100);
    t.press('interact');
    t.reset();
    expect(t.move).toEqual({ x: 0, y: 0 });
    expect(t.drainPressed()).toEqual([]);
    expect(t.holds(1)).toBe(false);
  });

  it('ein zweiter Start übernimmt den Stick nur, wenn er frei ist', () => {
    const t = new TouchSource();
    t.stickStart(1, 100, 100);
    t.stickStart(2, 200, 200);
    expect(t.holds(1)).toBe(true);
    t.stickEnd(1);
    t.stickStart(2, 200, 200);
    t.stickMove(2, 200, 240);
    expect(t.move).toEqual({ x: 0, y: 1 });
  });
});
