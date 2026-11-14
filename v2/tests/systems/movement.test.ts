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

describe('Eckenrutschen im Spiel (stepMover, 60 Bilder/s)', () => {
  const tile = gridOf((x, y) => x === 8 && y === 5); // 128..144 × 80..96
  const DT = 1 / 60;

  /** Läuft bis zu `maxFrames` Bilder; liefert alle Zustände. */
  function walk(start: Partial<Mover>, intent: MoveIntent, maxFrames: number, done: (m: Mover) => boolean): Mover[] {
    let m = still(start);
    const states: Mover[] = [];
    for (let i = 0; i < maxFrames; i++) {
      m = stepMover(m, intent, DT, tile);
      states.push(m);
      if (done(m)) break;
    }
    return states;
  }

  /** Größte Querbewegung je Bild; beim Gleiten höchstens so viel, wie die Figur in einem Bild läuft. */
  function maxSideways(startPos: number, states: Mover[], axis: 'x' | 'y'): number {
    let prev = startPos;
    let worst = 0;
    for (const m of states) {
      worst = Math.max(worst, Math.abs(m[axis] - prev));
      prev = m[axis];
    }
    return worst;
  }

  it('nach rechts, 4 Bildpunkte Überlappung (frei oben): gleitet im Lauftempo, in unter 0,7 s vorbei', () => {
    // Kastenunterkante 84 überlappt die Kachel (Oberkante 80) um 4.
    const states = walk({ x: 122, y: 84, facing: 'right' }, go(1, 0), 42, (m) => m.x - 5 >= 144);
    const last = states[states.length - 1]!;
    expect(maxSideways(84, states, 'y')).toBeLessThanOrEqual(WALK_SPEED / 60 + 0.01);
    expect(last.x - 5).toBeGreaterThanOrEqual(144);
    expect(states.length).toBeLessThanOrEqual(42);
    for (const m of states) {
      expect(m.moving).toBe(true);
      expect(m.vx).toBeGreaterThan(0);
    }
    expect(last.y).toBeLessThanOrEqual(80); // über die Kachel gerutscht
  });

  it('nach unten, 4 Bildpunkte Überlappung (frei links): gleitet im Lauftempo, in unter 0,7 s vorbei', () => {
    // Kasten rechts 132 überlappt die Kachel (linke Kante 128) um 4.
    const states = walk({ x: 127, y: 76, facing: 'down' }, go(0, 1), 42, (m) => m.y - 6 >= 96);
    const last = states[states.length - 1]!;
    expect(maxSideways(127, states, 'x')).toBeLessThanOrEqual(WALK_SPEED / 60 + 0.01);
    expect(last.y - 6).toBeGreaterThanOrEqual(96);
    for (const m of states) {
      expect(m.moving).toBe(true);
      expect(m.vy).toBeGreaterThan(0);
    }
    expect(last.x + 5).toBeLessThanOrEqual(128);
  });

  it('nach links, 4 Bildpunkte Überlappung (frei unten): gleitet im Lauftempo, in unter 0,7 s vorbei', () => {
    // Kastenoberkante 92 überlappt die Kachel (Unterkante 96) um 4.
    const states = walk({ x: 150, y: 98, facing: 'left' }, go(-1, 0), 42, (m) => m.x + 5 <= 128);
    const last = states[states.length - 1]!;
    expect(maxSideways(98, states, 'y')).toBeLessThanOrEqual(WALK_SPEED / 60 + 0.01);
    expect(last.x + 5).toBeLessThanOrEqual(128);
    for (const m of states) {
      expect(m.moving).toBe(true);
      expect(m.vx).toBeLessThan(0);
    }
    expect(last.y - 6).toBeGreaterThanOrEqual(96);
  });

  it('nach oben, 4 Bildpunkte Überlappung (frei rechts): gleitet im Lauftempo, in unter 0,7 s vorbei', () => {
    // Kasten links 140 überlappt die Kachel (rechte Kante 144) um 4.
    const states = walk({ x: 145, y: 106, facing: 'up' }, go(0, -1), 42, (m) => m.y <= 80);
    const last = states[states.length - 1]!;
    expect(maxSideways(145, states, 'x')).toBeLessThanOrEqual(WALK_SPEED / 60 + 0.01);
    expect(last.y).toBeLessThanOrEqual(80);
    for (const m of states) {
      expect(m.moving).toBe(true);
      expect(m.vy).toBeLessThan(0);
    }
    expect(last.x - 5).toBeGreaterThanOrEqual(144);
  });

  it('6 Bildpunkte Überlappung (mehr als CORNER_NUDGE): bleibt an der Kachel stehen', () => {
    const states = walk({ x: 122, y: 86, facing: 'right' }, go(1, 0), 60, () => false);
    const last = states[states.length - 1]!;
    expect(last.x + 5).toBe(128);
    expect(last.y).toBe(86);
    expect(last.vx).toBe(0);
    expect(last.moving).toBe(false);
  });
});

describe('Eckenrutschen mit schräger Eingabe: kein Laufen auf der Stelle', () => {
  const DT = 1 / 60;
  const D = Math.SQRT1_2;
  const tile = gridOf((x, y) => x === 8 && y === 5); // 128..144 × 80..96

  function simulate(grid: SolidGrid, start: Partial<Mover>, intent: MoveIntent, frames: number): Mover[] {
    let m = still(start);
    const out: Mover[] = [];
    for (let i = 0; i < frames; i++) {
      m = stepMover(m, intent, DT, grid);
      out.push(m);
    }
    return out;
  }

  /** Längste Folge von Bildern mit `moving` und unveränderter Lage. */
  function longestStall(from: Mover, states: Mover[]): number {
    let prev = from;
    let run = 0;
    let worst = 0;
    for (const m of states) {
      const same = Math.hypot(m.x - prev.x, m.y - prev.y) < 1e-6;
      run = m.moving && same ? run + 1 : 0;
      worst = Math.max(worst, run);
      prev = m;
    }
    return worst;
  }

  const cases: Array<{ name: string; start: Partial<Mover>; intent: MoveIntent; dx: number; dy: number }> = [
    { name: 'rechts+unten gegen die obere linke Ecke', start: { x: 122, y: 84 }, intent: go(D, D), dx: 1, dy: 1 },
    { name: 'links+unten gegen die obere rechte Ecke', start: { x: 150, y: 84 }, intent: go(-D, D), dx: -1, dy: 1 },
    { name: 'rechts+oben gegen die untere linke Ecke', start: { x: 122, y: 98 }, intent: go(D, -D), dx: 1, dy: -1 },
    { name: 'links+oben gegen die untere rechte Ecke', start: { x: 150, y: 98 }, intent: go(-D, -D), dx: -1, dy: -1 },
    { name: 'Hauptachse y blockiert (unten+rechts, Überstand links)', start: { x: 127, y: 76 }, intent: go(D, D), dx: 1, dy: 0 },
  ];

  for (const c of cases) {
    it(`kommt weiter: ${c.name}`, () => {
      const start = still(c.start);
      const states = simulate(tile, c.start, c.intent, 120);
      const last = states[states.length - 1]!;
      expect(longestStall(start, states)).toBeLessThanOrEqual(3);
      const along = (last.x - start.x) * c.dx + (last.y - start.y) * c.dy;
      expect(along).toBeGreaterThan(40);
    });
  }

  it('rechts+unten (Szenario der Prüfung): y wächst um mehr als 40', () => {
    const states = simulate(tile, { x: 122, y: 84 }, go(0.707, 0.707), 120);
    expect(states[119]!.y - 84).toBeGreaterThan(40);
  });

  const single = tile;
  const ell = gridOf((x, y) => (x === 8 && y === 5) || (x === 8 && y === 6) || (x === 9 && y === 6));
  const intents: MoveIntent[] = [
    go(1, 0), go(-1, 0), go(0, 1), go(0, -1),
    go(D, D), go(-D, D), go(D, -D), go(-D, -D), go(1, 0.3), go(0.3, -1), go(-1, -0.2),
  ];

  function overlapsSolid(grid: SolidGrid, x: number, y: number): boolean {
    const x0 = Math.floor((x - 5) / 16);
    const x1 = Math.ceil((x + 5) / 16) - 1;
    const y0 = Math.floor((y - 6) / 16);
    const y1 = Math.ceil(y / 16) - 1;
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (grid.isSolid(tx, ty)) return true;
    return false;
  }

  for (const [label, grid] of [['einzelne Kachel', single], ['L aus drei Kacheln', ell]] as const) {
    it(`Invariante: nie 10 Bilder lang „Gehen" ohne Ortswechsel (${label})`, () => {
      for (const intent of intents) {
        for (let sx = 108; sx <= 170; sx += 6) {
          for (let sy = 70; sy <= 130; sy += 5) {
            if (overlapsSolid(grid, sx, sy)) continue;
            const states = simulate(grid, { x: sx, y: sy }, { ...intent }, 90);
            const all = [still({ x: sx, y: sy }), ...states];
            for (let i = 0; i + 10 < all.length; i++) {
              const win = all.slice(i + 1, i + 11);
              if (!win.every((m) => m.moving)) continue;
              const moved = Math.hypot(win[9]!.x - all[i]!.x, win[9]!.y - all[i]!.y);
              expect(
                moved,
                `Start (${sx},${sy}), Absicht (${intent.x},${intent.y}), Bild ${i}`,
              ).toBeGreaterThan(1);
            }
          }
        }
      }
    });
  }
});
