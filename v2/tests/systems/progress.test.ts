import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../../src/core/state';
import { xpToNext } from '../../src/core/levels';
import { maxHp, heartQuarters, addXp } from '../../src/systems/progress';

describe('maxHp und heartQuarters', () => {
  it('maxHp = Herzen × 4', () => {
    const s = createNewGameState(0);
    expect(maxHp(s)).toBe(20);
    s.progression.level = 5; expect(maxHp(s)).toBe(24);
    s.progression.level = 30; expect(maxHp(s)).toBe(40);
  });

  it('Level 1, 20 Lebenspunkte: fünf volle Herzen', () => {
    expect(heartQuarters(createNewGameState(0))).toEqual([4, 4, 4, 4, 4]);
  });

  it('9 Lebenspunkte: [4, 4, 1, 0, 0]', () => {
    const s = createNewGameState(0); s.player.hp = 9;
    expect(heartQuarters(s)).toEqual([4, 4, 1, 0, 0]);
  });

  it('Level 5, 24 Lebenspunkte: sechs Einträge', () => {
    const s = createNewGameState(0); s.progression.level = 5; s.player.hp = 24;
    expect(heartQuarters(s)).toEqual([4, 4, 4, 4, 4, 4]);
  });

  it('Lebenspunkte außerhalb von 0…max werden begrenzt', () => {
    const s = createNewGameState(0);
    s.player.hp = -5; expect(heartQuarters(s)).toEqual([0, 0, 0, 0, 0]);
    s.player.hp = 99; expect(heartQuarters(s)).toEqual([4, 4, 4, 4, 4]);
  });
});

describe('addXp', () => {
  it('+20 auf Level 1: nur XP', () => {
    const s = createNewGameState(0);
    expect(addXp(s, 20)).toEqual({ levelsGained: 0 });
    expect(s.progression.level).toBe(1); expect(s.progression.xp).toBe(20);
  });

  it('+60: Level 2, Rest 10, Herzen ganz aufgefüllt', () => {
    const s = createNewGameState(0); s.player.hp = 3;
    expect(addXp(s, 60)).toEqual({ levelsGained: 1 });
    expect(s.progression.level).toBe(2); expect(s.progression.xp).toBe(10);
    expect(s.player.hp).toBe(maxHp(s));
  });

  it('ohne Stufenaufstieg bleiben die Lebenspunkte', () => {
    const s = createNewGameState(0); s.player.hp = 3;
    addXp(s, 10);
    expect(s.player.hp).toBe(3);
  });

  it('Stufenaufstieg auf ein Herz-Level füllt auf die neue Obergrenze', () => {
    const s = createNewGameState(0); s.progression.level = 4; s.player.hp = 1;
    addXp(s, xpToNext(4));
    expect(s.progression.level).toBe(5); expect(s.player.hp).toBe(24);
  });

  it('mehrere Stufen auf einmal', () => {
    const s = createNewGameState(0);
    expect(addXp(s, 50 + 75 + 5)).toEqual({ levelsGained: 2 });
    expect(s.progression.level).toBe(3); expect(s.progression.xp).toBe(5);
  });

  it('+10000 von Level 29: Level 30, XP 0', () => {
    const s = createNewGameState(0); s.progression.level = 29; s.progression.xp = 100;
    expect(addXp(s, 10000)).toEqual({ levelsGained: 1 });
    expect(s.progression.level).toBe(30); expect(s.progression.xp).toBe(0);
  });

  it('auf Höchststufe bleibt XP 0', () => {
    const s = createNewGameState(0); s.progression.level = 30;
    expect(addXp(s, 500)).toEqual({ levelsGained: 0 });
    expect(s.progression.xp).toBe(0);
  });

  it.each([[-5], [Number.NaN], [Number.POSITIVE_INFINITY], [0]])('Menge %s: nichts geschieht', (amount) => {
    const s = createNewGameState(0); const before = JSON.stringify(s);
    expect(addXp(s, amount)).toEqual({ levelsGained: 0 });
    expect(JSON.stringify(s)).toBe(before);
  });
});
