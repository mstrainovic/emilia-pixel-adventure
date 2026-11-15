import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../../src/core/state';
import { DAY_SECONDS, PHASE_SECONDS, advanceClock, dayNumber, normalizeClock } from '../../src/systems/dayclock';

function run(seconds: number, step: number, state = createNewGameState(0)) {
  for (let t = 0; t < seconds - 1e-9; t += step) advanceClock(state, step);
  return state;
}

describe('Spieltag-Uhr', () => {
  it('hat die Maße des alten Spiels', () => {
    expect(PHASE_SECONDS).toBe(187.5);
    expect(DAY_SECONDS).toBe(750);
  });

  it('wechselt nach 187,5 s von Phase 1 zu Phase 2 mit Phasenzeit 0', () => {
    const s = run(187.5, 0.5);
    expect(s.dayNight.phaseIndex).toBe(2);
    expect(s.dayNight.phaseTime).toBeCloseTo(0, 2);
  });

  it('steht nach 750 s wieder in Phase 1 und zählt Tag 1', () => {
    const s = run(750, 0.5);
    expect(s.dayNight.phaseIndex).toBe(1);
    expect(dayNumber(s)).toBe(1);
    expect(s.dayNight.totalTime).toBeCloseTo(750, 2);
  });

  it('läuft der Reihe nach 1 → 2 → 3 → 0 → 1', () => {
    const s = createNewGameState(0);
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) { run(PHASE_SECONDS, 0.5, s); seen.push(s.dayNight.phaseIndex); }
    expect(seen).toEqual([2, 3, 0, 1]);
  });

  it('beginnt am Tag 0', () => {
    expect(dayNumber(createNewGameState(0))).toBe(0);
  });

  it('begrenzt dt auf 1 s', () => {
    const s = createNewGameState(0);
    advanceClock(s, 5);
    expect(s.dayNight.totalTime).toBe(1);
    expect(s.dayNight.phaseTime).toBe(1);
  });

  it('ignoriert negatives, null und NaN, begrenzt unendliches dt', () => {
    const s = createNewGameState(0);
    advanceClock(s, -1);
    advanceClock(s, NaN);
    advanceClock(s, 0);
    expect(s.dayNight).toEqual({ totalTime: 0, phaseIndex: 1, phaseTime: 0 });
    advanceClock(s, Infinity);   // zählt wie die Obergrenze
    expect(s.dayNight.totalTime).toBe(1);
  });

  it.each([
    ['phaseTime 1e12', { totalTime: 10, phaseIndex: 1, phaseTime: 1e12 }],
    ['phaseIndex 99', { totalTime: 10, phaseIndex: 99, phaseTime: 3 }],
    ['phaseIndex −1', { totalTime: 10, phaseIndex: -1, phaseTime: 3 }],
    ['phaseIndex 1,5', { totalTime: 10, phaseIndex: 1.5, phaseTime: 3 }],
    ['NaN überall', { totalTime: NaN, phaseIndex: NaN, phaseTime: NaN }],
    ['unendlich', { totalTime: Infinity, phaseIndex: Infinity, phaseTime: -Infinity }],
    ['negativ', { totalTime: -50, phaseIndex: 2, phaseTime: -10 }],
  ])('absurde Uhr im Arbeitsspeicher (%s): kein Hänger, danach gültig, die Uhr läuft', (_name, clock) => {
    const s = createNewGameState(0);
    s.dayNight = { ...clock };
    advanceClock(s, 0.5);
    const { totalTime, phaseIndex, phaseTime } = s.dayNight;
    expect(Number.isFinite(totalTime) && totalTime >= 0.5).toBe(true);
    expect([0, 1, 2, 3]).toContain(phaseIndex);
    expect(phaseTime >= 0 && phaseTime < PHASE_SECONDS).toBe(true);
    const before = s.dayNight.totalTime;
    advanceClock(s, 0.5);
    expect(s.dayNight.totalTime).toBeCloseTo(before + 0.5, 6);
  });

  it('normalizeClock: gültige Werte bleiben genau, ungültige werden begrenzt', () => {
    const valid = { totalTime: 5400.5, phaseIndex: 2, phaseTime: 41.25 };
    expect(normalizeClock(valid)).toEqual(valid);
    expect(normalizeClock({ totalTime: 0, phaseIndex: 0, phaseTime: 0 })).toEqual({ totalTime: 0, phaseIndex: 0, phaseTime: 0 });
    expect(normalizeClock({ totalTime: 1, phaseIndex: 99, phaseTime: 3 }).phaseIndex).toBe(3);
    expect(normalizeClock({ totalTime: 1, phaseIndex: -1, phaseTime: 3 }).phaseIndex).toBe(3);
    expect(normalizeClock({ totalTime: 1, phaseIndex: 1, phaseTime: 200 }).phaseTime).toBeCloseTo(12.5, 9);
    expect(normalizeClock({ totalTime: -3, phaseIndex: 1, phaseTime: 0 }).totalTime).toBe(0);
    expect(normalizeClock({ totalTime: NaN, phaseIndex: NaN, phaseTime: NaN })).toEqual({ totalTime: 0, phaseIndex: 1, phaseTime: 0 });
  });

  it('die Gesamtzeit wächst nur', () => {
    const s = createNewGameState(0);
    let last = 0;
    for (const dt of [0.3, -2, 0.9, NaN, 4, 0.016]) {
      advanceClock(s, dt);
      expect(s.dayNight.totalTime).toBeGreaterThanOrEqual(last);
      last = s.dayNight.totalTime;
    }
  });
});
