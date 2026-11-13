import { describe, it, expect } from 'vitest';
import {
  MAX_LEVEL, HP_PER_HEART, xpToNext, cumulativeXp, heartsForLevel, LEGACY_XP_TO_NEXT, convertLegacyXp,
} from '../../src/core/levels';

describe('Level-Kurve', () => {
  it('Konstanten', () => {
    expect(MAX_LEVEL).toBe(30);
    expect(HP_PER_HEART).toBe(4);
  });
  it('Kurve aus Spec 7.2', () => {
    expect(xpToNext(1)).toBe(50); expect(xpToNext(19)).toBe(500); expect(xpToNext(29)).toBe(750);
    expect(xpToNext(30)).toBe(Number.POSITIVE_INFINITY);
    expect(cumulativeXp(1)).toBe(0); expect(cumulativeXp(20)).toBe(5225); expect(cumulativeXp(30)).toBe(11600);
  });
  it('Herzen: 5 zu Beginn, je eines auf Level 5, 10, 15, 20, 25', () => {
    expect([1, 4, 5, 9, 10, 15, 20, 24, 25, 30].map(heartsForLevel)).toEqual([5, 5, 6, 6, 7, 8, 9, 9, 10, 10]);
  });
  it('alte Kurve ist vollständig hinterlegt', () => {
    expect(LEGACY_XP_TO_NEXT).toEqual([25, 40, 60, 100, 130, 160, 200, 250, 300, 400, 500, 650, 800, 1000, 1300, 1600,
      2000, 2500, 3000, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800]);
  });
  it('rechnet den Balken anteilig um', () => {
    expect(convertLegacyXp(3, 30)).toBe(50);   // 30 von 60 → 50 von 100
    expect(convertLegacyXp(1, 25)).toBe(49);   // voller alter Balken bleibt knapp unter dem Aufstieg
    expect(convertLegacyXp(1, -5)).toBe(0);
    expect(convertLegacyXp(30, 500)).toBe(0);
  });
  it('rechnet auch am oberen Ende der alten Kurve richtig um', () => {
    expect(convertLegacyXp(29, 3800)).toBe(xpToNext(29) - 1);
    expect(convertLegacyXp(29, 3800)).toBe(749);
    expect(convertLegacyXp(29, 1900)).toBe(375);
  });
  it('wirft bei ungültigen Leveln nicht', () => {
    for (const level of [0, 31]) {
      const v = convertLegacyXp(level, 10);
      expect(Number.isFinite(v)).toBe(true);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('XP-Umrechnung ganzzahlig', () => {
  it('verliert kein XP durch Gleitkomma (Level 7, 29 XP)', () => {
    expect(convertLegacyXp(7, 29)).toBe(29);
  });
  it('stimmt für alle Level und alle XP-Werte mit der BigInt-Rechnung überein', () => {
    for (let level = 1; level < MAX_LEVEL; level++) {
      const need = xpToNext(level);
      const legacyNeed = LEGACY_XP_TO_NEXT[level - 1];
      let previous = -1;
      for (let xp = 0; xp <= legacyNeed; xp++) {
        const result = convertLegacyXp(level, xp);
        const exact = (BigInt(xp) * BigInt(need)) / BigInt(legacyNeed);
        const expected = Math.min(need - 1, Number(exact));
        if (!Number.isInteger(result) || result < 0 || result > need - 1 || result < previous || result !== expected) {
          throw new Error(`Level ${level}, XP ${xp}: ${result} statt ${expected} (vorher ${previous})`);
        }
        previous = result;
      }
    }
  });
});
