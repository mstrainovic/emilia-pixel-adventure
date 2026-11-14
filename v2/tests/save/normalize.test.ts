import { describe, it, expect } from 'vitest';
import { normalizeState } from '../../src/save/normalize';
import { createNewGameState, type GameState } from '../../src/core/state';
import { HUB_START } from '../../src/data/maps';
import { heartsForLevel, HP_PER_HEART, xpToNext } from '../../src/core/levels';

type Loose = Record<string, any>;

/** Ausgangsstand als lose getypte JSON-Kopie, damit Tests Felder frei beschädigen können. */
function base(): Loose {
  return JSON.parse(JSON.stringify(createNewGameState(1000))) as Loose;
}

function run(raw: unknown) {
  const result = normalizeState(raw);
  expect(result).not.toBeNull();
  return result!;
}

const CLEAN = { droppedItems: [], droppedQuests: [], relocated: false, resizedInventory: false, lossy: false };

describe('normalizeState: Bericht', () => {
  it('gültiger Stand: Zustand unverändert, Bericht leer', () => {
    const raw = base();
    const { state, report } = run(raw);
    expect(state).toEqual(raw);
    expect(report).toEqual(CLEAN);
  });

  it('unbekannte Karte: Startpunkt, hp bleibt', () => {
    const raw = base(); raw.player.map = 'moon'; raw.player.hp = 12;
    const { state, report } = run(raw);
    expect(state.player).toEqual({ ...HUB_START, hp: 12 });
    expect(report.relocated).toBe(true);
    expect(report.lossy).toBe(false);
  });

  it('Position NaN: Startpunkt, hp bleibt', () => {
    const raw = base(); raw.player.x = NaN; raw.player.hp = 12;
    const { state, report } = run(raw);
    expect(state.player).toEqual({ ...HUB_START, hp: 12 });
    expect(report.relocated).toBe(true);
    expect(report.lossy).toBe(false);
  });

  it('40 Plätze: auf 48 aufgefüllt, Platz 3 bleibt', () => {
    const raw = base();
    raw.inventory.slots = raw.inventory.slots.slice(0, 40);
    raw.inventory.slots[3] = { itemId: 'wood', count: 7 };
    const { state, report } = run(raw);
    expect(state.inventory.slots).toHaveLength(48);
    expect(state.inventory.slots[3]).toEqual({ itemId: 'wood', count: 7 });
    expect(state.inventory.slots[47]).toEqual({ itemId: null, count: 0 });
    expect(report.resizedInventory).toBe(true);
    expect(report.lossy).toBe(false);
  });

  it('60 Plätze, Holz auf Platz 59: landet im ersten freien Platz', () => {
    const raw = base();
    raw.inventory.slots = [...raw.inventory.slots, ...Array.from({ length: 12 }, () => ({ itemId: null, count: 0 }))];
    raw.inventory.slots[59] = { itemId: 'wood', count: 5 };
    raw.inventory.slots[0] = { itemId: 'stone', count: 2 };
    const { state, report } = run(raw);
    expect(state.inventory.slots).toHaveLength(48);
    expect(state.inventory.slots[0]).toEqual({ itemId: 'stone', count: 2 });
    expect(state.inventory.slots[1]).toEqual({ itemId: 'wood', count: 5 });
    expect(report.resizedInventory).toBe(true);
    expect(report.droppedItems).toEqual([]);
    expect(report.lossy).toBe(false);
  });

  it('60 volle Plätze: zwölf Einträge gehen verloren', () => {
    const raw = base();
    raw.inventory.slots = Array.from({ length: 60 }, () => ({ itemId: 'wood', count: 3 }));
    const { state, report } = run(raw);
    expect(state.inventory.slots).toHaveLength(48);
    expect(report.droppedItems).toHaveLength(12);
    expect(report.droppedItems[0]).toEqual({ itemId: 'wood', count: 3 });
    expect(report.lossy).toBe(true);
  });

  it('unbekannter Gegenstand: Platz leer, Verlust gemeldet', () => {
    const raw = base(); raw.inventory.slots[0] = { itemId: 'made_up', count: 3 };
    const { state, report } = run(raw);
    expect(state.inventory.slots[0]).toEqual({ itemId: null, count: 0 });
    expect(report.droppedItems).toEqual([{ itemId: 'made_up', count: 3 }]);
    expect(report.lossy).toBe(true);
  });

  it('unbekannte Aufgaben: gemeldet', () => {
    const raw = base();
    raw.progression.completedQuests = ['first_steps', 'made_up_quest'];
    raw.progression.activeQuests = { nope: { progress: 1 } };
    const { state, report } = run(raw);
    expect(state.progression.completedQuests).toEqual(['first_steps']);
    expect(state.progression.activeQuests).toEqual({});
    expect(report.droppedQuests).toEqual(['made_up_quest', 'nope']);
    expect(report.lossy).toBe(true);
  });
});

describe('normalizeState: Klemmen', () => {
  it('Werte außerhalb des Bereichs', () => {
    const raw = base(); raw.player.hp = 999;
    expect(run(raw).state.player.hp).toBe(heartsForLevel(1) * HP_PER_HEART);

    const neg = base(); neg.player.hp = -5;
    expect(run(neg).state.player.hp).toBe(0);

    const xp = base(); xp.progression.xp = 1e9;
    expect(run(xp).state.progression.xp).toBe(xpToNext(1) - 1);

    const lvl = base(); lvl.progression.level = 99;
    expect(run(lvl).state.progression.level).toBe(30);

    const hot = base(); hot.inventory.selectedHotbar = 8;
    expect(run(hot).state.inventory.selectedHotbar).toBe(0);

    const fr = base(); fr.friendship = { oma: { points: 140, lastTalkDay: 0, giftsGiven: 0 } };
    expect(run(fr).state.friendship['oma']?.points).toBe(100);

    const coins = base(); coins.inventory.coins = -3;
    expect(run(coins).state.inventory.coins).toBe(0);
  });
});

describe('normalizeState: hartes Minimum', () => {
  it('liefert null', () => {
    const ok = base();
    const bad: unknown[] = [
      null, 'x', [], 7, {},
      { ...ok, formatVersion: undefined }, { ...ok, formatVersion: 2 }, { ...ok, formatVersion: '1' },
      { ...ok, progression: { ...ok.progression, level: 'x' } }, { ...ok, progression: null },
    ];
    for (const b of bad) expect(normalizeState(b)).toBeNull();
  });

  it('Typ des Ergebnisses ist GameState', () => {
    const s: GameState = run(base()).state;
    expect(s.formatVersion).toBe(1);
  });
});
