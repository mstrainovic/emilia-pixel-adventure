import { describe, it, expect } from 'vitest';
import { normalizeState } from '../../src/save/normalize';
import { createNewGameState, type GameState } from '../../src/core/state';
import { HUB_START } from '../../src/data/maps';
import { heartsForLevel, HP_PER_HEART, xpToNext } from '../../src/core/levels';
import { getItem } from '../../src/data/items';
import { migrateLegacySave } from '../../src/save/legacy';
import { LEGACY_FIRST_COMMIT } from './legacySaves';

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

const CLEAN = {
  droppedItems: [], droppedQuests: [], resetQuests: [], relocated: false, resizedInventory: false, lossy: false,
};
const BERRY_STACK = getItem('berry')!.stackSize;

describe('normalizeState: keine stillen Verluste', () => {
  it('gültiger Stand: Bericht leer, Stand unverändert (gleiche Werte)', () => {
    const raw = base();
    raw.inventory.slots[0] = { itemId: 'berry', count: BERRY_STACK };
    raw.progression.activeQuests = { wood_collector: { progress: 2 } };
    const { state, report } = run(raw);
    expect(state).toEqual(raw);
    expect(report).toEqual(CLEAN);
  });

  it.each([['x'], [-3], [Number.NaN], [undefined]])(
    'aktive Aufgabe mit ungültigem Stand %s: bleibt mit 0, steht in resetQuests, kein Verlust',
    (progress) => {
      const raw = base();
      raw.progression.activeQuests = { wood_collector: progress === undefined ? {} : { progress } };
      const { state, report } = run(raw);
      expect(state.progression.activeQuests).toEqual({ wood_collector: { progress: 0 } });
      expect(report.resetQuests).toEqual(['wood_collector']);
      expect(report.droppedQuests).toEqual([]);
      expect(report.lossy).toBe(false);
    },
  );

  it('zu großer Stapel: auf stackSize gekürzt, der Rest steht im Bericht', () => {
    const raw = base(); raw.inventory.slots[4] = { itemId: 'berry', count: BERRY_STACK + 7 };
    const { state, report } = run(raw);
    expect(state.inventory.slots[4]).toEqual({ itemId: 'berry', count: BERRY_STACK });
    expect(report.droppedItems).toEqual([{ itemId: 'berry', count: 7 }]);
    expect(report.lossy).toBe(true);
  });

  it.each([[0], [-1], ['viel']])('ungültige Stückzahl %s: Platz leer, Bericht mit 0 Stück', (count) => {
    const raw = base(); raw.inventory.slots[2] = { itemId: 'berry', count };
    const { state, report } = run(raw);
    expect(state.inventory.slots[2]).toEqual({ itemId: null, count: 0 });
    expect(report.droppedItems).toEqual([{ itemId: 'berry', count: 0 }]);
    expect(report.lossy).toBe(true);
  });

  it('100 Plätze, die 48 vorderen voll, Platz 97 hält Holz: gemeldet', () => {
    const raw = base();
    raw.inventory.slots = [
      ...Array.from({ length: 48 }, () => ({ itemId: 'stone', count: 1 })),
      ...Array.from({ length: 52 }, () => ({ itemId: null, count: 0 })),
    ];
    raw.inventory.slots[97] = { itemId: 'wood', count: 3 };
    const { state, report } = run(raw);
    expect(state.inventory.slots).toHaveLength(48);
    expect(state.inventory.slots.every((s) => s.itemId === 'stone')).toBe(true);
    expect(report.droppedItems).toEqual([{ itemId: 'wood', count: 3 }]);
    expect(report.lossy).toBe(true);
  });

  it('100 Plätze mit Lücke vorn: Platz 97 rückt in den freien Platz', () => {
    const raw = base();
    raw.inventory.slots = Array.from({ length: 100 }, () => ({ itemId: null, count: 0 }));
    raw.inventory.slots[97] = { itemId: 'wood', count: 3 };
    const { state, report } = run(raw);
    expect(state.inventory.slots[0]).toEqual({ itemId: 'wood', count: 3 });
    expect(report.droppedItems).toEqual([]);
    expect(report.lossy).toBe(false);
  });
});

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

describe('normalizeState: legacyDeclinedAt', () => {
  it('ergänzt ein fehlendes Feld zu null, ohne etwas zu verlieren', () => {
    const raw = base(); delete raw.legacyDeclinedAt;
    const { state, report } = run(raw);
    expect(state.legacyDeclinedAt).toBeNull();
    expect(report).toEqual(CLEAN);
  });

  it('behält einen gültigen Wert und verwirft Unfug', () => {
    const raw = base(); raw.legacyDeclinedAt = 200;
    expect(run(raw).state.legacyDeclinedAt).toBe(200);
    raw.legacyDeclinedAt = 'x';
    expect(run(raw).state.legacyDeclinedAt).toBeNull();
  });
});

describe('normalizeState: pendingItems', () => {
  it('ergänzt ein fehlendes Feld zu [] ohne Verlust', () => {
    const raw = base(); delete raw.pendingItems;
    const { state, report } = run(raw);
    expect(state.pendingItems).toEqual([]);
    expect(report).toEqual(CLEAN);
  });

  it('gültige Einträge bleiben unverändert', () => {
    const raw = base(); raw.pendingItems = [{ itemId: 'berry', count: 5 }, { itemId: 'wood', count: 120 }];
    const { state, report } = run(raw);
    expect(state.pendingItems).toEqual([{ itemId: 'berry', count: 5 }, { itemId: 'wood', count: 120 }]);
    expect(report).toEqual(CLEAN);
  });

  it('unbekannte Kennung: entfernt und als droppedItems gemeldet', () => {
    const raw = base(); raw.pendingItems = [{ itemId: 'gibt_es_nicht', count: 2 }, { itemId: 'berry', count: 1 }];
    const { state, report } = run(raw);
    expect(state.pendingItems).toEqual([{ itemId: 'berry', count: 1 }]);
    expect(report.droppedItems).toEqual([{ itemId: 'gibt_es_nicht', count: 2 }]);
    expect(report.lossy).toBe(true);
  });

  it.each([[0], [-2], ['viel'], [1.5]])('ungültige Stückzahl %s: entfernt und gemeldet', (count) => {
    const raw = base(); raw.pendingItems = [{ itemId: 'berry', count }];
    const { state, report } = run(raw);
    expect(state.pendingItems).toEqual(count === 1.5 ? [{ itemId: 'berry', count: 1 }] : []);
    expect(report.lossy).toBe(count !== 1.5);
  });

  it('kein Feld-Array: wird zu []', () => {
    const raw = base(); raw.pendingItems = 'Unsinn';
    expect(run(raw).state.pendingItems).toEqual([]);
  });
});

describe('normalizeState: kein geschenktes Schwert', () => {
  it('leerer Platz 0 bleibt leer', () => {
    const raw = base(); raw.inventory.slots[0] = { itemId: null, count: 0 };
    const { state, report } = run(raw);
    expect(state.inventory.slots[0]).toEqual({ itemId: null, count: 0 });
    expect(state.inventory.slots.some((s) => s.itemId === 'sword_wood')).toBe(false);
    expect(report).toEqual(CLEAN);
  });

  it('60 Plätze, Platz 0 leer, zwölf überzählige mit Beeren: kein Schwert, Beeren landen in freien Plätzen', () => {
    const raw = base();
    raw.inventory.slots[0] = { itemId: null, count: 0 };
    raw.inventory.slots = [...raw.inventory.slots, ...Array.from({ length: 12 }, () => ({ itemId: 'berry', count: 2 }))];
    const { state } = run(raw);
    expect(state.inventory.slots.some((s) => s.itemId === 'sword_wood')).toBe(false);
    expect(state.inventory.slots.filter((s) => s.itemId === 'berry')).toHaveLength(12);
  });

  it('gültiger Stand mit Schwert auf Platz 0 bleibt unverändert (Identität)', () => {
    const raw = base();
    expect(run(raw).state).toEqual(raw);
  });

  it('alter Stand ohne Schwert: nach der Übernahme keins', () => {
    const noSword = { ...LEGACY_FIRST_COMMIT, inventory: Array.from({ length: 48 }, () => ({ itemId: null, count: 0 })) };
    const result = migrateLegacySave(JSON.stringify(noSword), null, 1);
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.state.inventory.slots.some((s) => s.itemId === 'sword_wood')).toBe(false);
    expect(result.state.inventory.slots.every((s) => s.itemId === null && s.count === 0)).toBe(true);
    expect(result.state.pendingItems).toEqual([]);
  });

  it('alter Stand mit Schwert auf Platz 0: genau ein Schwert', () => {
    const result = migrateLegacySave(JSON.stringify(LEGACY_FIRST_COMMIT), null, 1);
    if (result.kind !== 'ok') throw new Error('Übernahme fehlgeschlagen');
    expect(result.state.inventory.slots.filter((s) => s.itemId === 'sword_wood')).toHaveLength(1);
  });
});
