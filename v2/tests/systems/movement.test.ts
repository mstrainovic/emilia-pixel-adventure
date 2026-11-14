import { describe, expect, it } from 'vitest';
import type { SolidGrid } from '../../src/systems/collision';
import {
  ACCEL_TIME,
  MAX_DT,
  PLAYER_BODY,
  RUN_SPEED,
  WALK_SPEED,
  stepMover,
  walkFrameRow,
  type MoveIntent,
  type Mover,
} from '../../src/systems/movement';

function gridOf(solid: (x: number, y: number) => boolean): SolidGrid {
  return {
    width: 40,
    height: 40,
    isSolid: (x, y) => x < 0 || y < 0 || x >= 40 || y >= 40 || solid(x, y),
  };
}

const open = gridOf(() => false);
const still = (over: Partial<Mover> = {}): Mover => ({
  x: 320,
  y: 320,
  vx: 0,
  vy: 0,
  facing: 'down',
  moving: false,
  walkTime: 0,
  ...over,
});
const go = (x: number, y: number, run = false): MoveIntent => ({ x, y, run });

describe('Konstanten', () => {
  it('Tempo wie im alten Spiel (4 und 7 Kacheln je Sekunde)', () => {
    expect(WALK_SPEED).toBe(4 * 16);
    expect(RUN_SPEED).toBe(7 * 16);
    expect(ACCEL_TIME).toBe(0.1);
    expect(MAX_DT).toBe(0.1);
    expect(PLAYER_BODY).toEqual({ halfW: 5, halfH: 3, footOffset: 3 });
  });
});

describe('Anlaufen und Bremsen', () => {
  it('aus dem Stand: halbes Tempo nach 0,05 s, volles nach 0,1 s', () => {
    const a = stepMover(still(), go(1, 0), 0.05, open);
    expect(Math.abs(a.vx - 32)).toBeLessThanOrEqual(1);
    const b = stepMover(a, go(1, 0), 0.05, open);
    expect(b.vx).toBeCloseTo(64, 5);
  });

  it('nach dem Loslassen steht sie nach 0,1 s', () => {
    const r = stepMover(still({ vx: 64, moving: true }), go(0, 0), 0.1, open);
    expect(r.vx).toBe(0);
    expect(r.moving).toBe(false);
  });

  it('schräg ist nicht schneller', () => {
    const r = stepMover(still(), go(1, 1), 0.1, open);
    expect(Math.abs(Math.hypot(r.vx, r.vy) - 64)).toBeLessThanOrEqual(0.5);
    const big = stepMover(still(), go(5, 5), 0.1, open);
    expect(Math.abs(Math.hypot(big.vx, big.vy) - 64)).toBeLessThanOrEqual(0.5);
  });

  it('halber Ausschlag gibt halbes Tempo', () => {
    expect(stepMover(still(), go(0.5, 0), 0.1, open).vx).toBeCloseTo(32, 5);
  });

  it('rennen gibt 112', () => {
    expect(stepMover(still(), go(1, 0, true), 0.1, open).vx).toBeCloseTo(112, 5);
  });
});

describe('Zeitschritte', () => {
  it('dt = 5 bewegt höchstens 11,2 Bildpunkte', () => {
    const r = stepMover(still(), go(1, 0, true), 5, open);
    expect(r.x - 320).toBeLessThanOrEqual(11.2 + 1e-9);
    expect(r.x - 320).toBeGreaterThan(0);
  });

  it('dt = 5 geht nie durch eine eine Kachel dicke Wand', () => {
    const wall = gridOf((x) => x === 20); // Wand 320..336
    let m = still({ x: 300 });
    for (let i = 0; i < 20; i++) m = stepMover(m, go(1, 0, true), 5, wall);
    expect(m.x + PLAYER_BODY.halfW).toBe(320);
    expect(m.vx).toBe(0);
  });

  it('dt ≤ 0 oder NaN lässt alles unverändert', () => {
    const m = still({ vx: 10, walkTime: 1 });
    for (const dt of [0, -1, NaN, Infinity]) {
      expect(stepMover(m, go(1, 0), dt, open)).toBe(m);
    }
  });

  it('ungültige Absicht wird wie Stillstand behandelt', () => {
    const r = stepMover(still(), go(NaN, NaN), 0.1, open);
    expect(r.vx).toBe(0);
    expect(r.x).toBe(320);
  });
});

describe('Blickrichtung', () => {
  it('folgt der stärkeren Achse', () => {
    expect(stepMover(still(), go(1, 0.4), 0.05, open).facing).toBe('right');
    expect(stepMover(still(), go(-1, 0.4), 0.05, open).facing).toBe('left');
    expect(stepMover(still(), go(0.3, -1), 0.05, open).facing).toBe('up');
    expect(stepMover(still({ facing: 'left' }), go(0.3, 1), 0.05, open).facing).toBe('down');
  });

  it('im Stand bleibt die letzte', () => {
    expect(stepMover(still({ facing: 'up' }), go(0, 0), 0.05, open).facing).toBe('up');
  });

  it('bei exakt schräger Absicht bleibt die bisherige, wenn sie eine der Achsen ist', () => {
    expect(stepMover(still({ facing: 'down' }), go(1, 1), 0.05, open).facing).toBe('down');
    expect(stepMover(still({ facing: 'right' }), go(1, 1), 0.05, open).facing).toBe('right');
    expect(stepMover(still({ facing: 'up' }), go(1, 1), 0.05, open).facing).toBe('right');
  });
});

describe('Laufbild', () => {
  it('walkTime wächst nur, solange sie sich bewegt, und ist im Stand 0', () => {
    let m = stepMover(still(), go(1, 0), 0.05, open);
    expect(m.moving).toBe(true);
    expect(m.walkTime).toBeCloseTo(0.05, 9);
    m = stepMover(m, go(1, 0), 0.05, open);
    expect(m.walkTime).toBeCloseTo(0.1, 9);
    m = stepMover(m, go(0, 0), 0.2, open);
    expect(m.moving).toBe(false);
    expect(m.walkTime).toBe(0);
  });

  it('Richtungswechsel setzt den Takt nicht zurück', () => {
    let m = stepMover(still(), go(1, 0), 0.1, open);
    m = stepMover(m, go(1, 0), 0.1, open);
    const before = m.walkTime;
    m = stepMover(m, go(0, -1), 0.02, open);
    expect(m.walkTime).toBeCloseTo(before + 0.02, 9);
  });

  it('walkFrameRow: Zeilen 1…4, gehen 8 und rennen 12 Bilder je Sekunde', () => {
    expect(walkFrameRow(0, false)).toBe(1);
    expect(walkFrameRow(0.125, false)).toBe(2);
    expect(walkFrameRow(0.25, false)).toBe(3);
    expect(walkFrameRow(0.375, false)).toBe(4);
    expect(walkFrameRow(0.5, false)).toBe(1);
    expect(walkFrameRow(1 / 12 + 1e-9, true)).toBe(2);
    expect(walkFrameRow(4 / 12 + 1e-9, true)).toBe(1);
    expect(walkFrameRow(NaN, false)).toBe(1);
    expect(walkFrameRow(-1, false)).toBe(1);
  });
});
