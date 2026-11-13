import { describe, it, expect } from 'vitest';
import {
  SaveStore, SAVE_KEY, REJECTED_SAVE_KEY, migrateState, serializeForExport, parseImport,
} from '../../src/save/store';
import { LEGACY_SAVE_KEY, LEGACY_MUTED_KEY, migrateLegacySave } from '../../src/save/legacy';
import { createNewGameState, type GameState } from '../../src/core/state';
import {
  LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_PARTIAL, LEGACY_NGPLUS,
} from './legacySaves';

function mem(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const writtenKeys: string[] = [];
  return {
    writtenKeys,
    getItem: (k: string): string | null => data.get(k) ?? null,
    setItem: (k: string, v: string): void => { writtenKeys.push(k); data.set(k, v); },
  };
}

function throwing() {
  return {
    getItem: (): string | null => { throw new Error('Speicher gesperrt'); },
    setItem: (): void => { throw new Error('Speicher voll'); },
  };
}

describe('SaveStore', () => {
  it('leerer Speicher', () => { expect(new SaveStore(mem()).load()).toBeNull(); });

  it('speichert und lädt verlustfrei', () => {
    const m = mem(); const store = new SaveStore(m); const s = createNewGameState(1);
    expect(store.save(s, 99)).toBe(true);
    expect(store.load()).toEqual({ ...s, savedAt: 99 });
    expect(store.hasSave()).toBe(true);
  });

  it('verändert den übergebenen Zustand nicht', () => {
    const store = new SaveStore(mem()); const s = createNewGameState(1);
    store.save(s, 99);
    expect(s.savedAt).toBe(1);
  });

  it('schreibt nie in die alten Schlüssel', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_V3_FULL), [LEGACY_MUTED_KEY]: 'true' });
    const store = new SaveStore(m);
    const imported = store.importLegacy(10)!; store.save(imported.state, 11);
    expect(m.writtenKeys).toEqual([SAVE_KEY]);
    expect(m.getItem(LEGACY_SAVE_KEY)).toBe(JSON.stringify(LEGACY_V3_FULL));
  });

  it('importLegacy schreibt selbst nichts', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_V3_FULL) });
    expect(new SaveStore(m).importLegacy(10)).not.toBeNull();
    expect(m.writtenKeys).toEqual([]);
    expect(new SaveStore(mem()).importLegacy(10)).toBeNull();
  });

  it('bietet die erneute Übernahme nur bei neuerem altem Stand an', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify({ ...LEGACY_PARTIAL, timestamp: 2000 }) });
    const store = new SaveStore(m); const s = createNewGameState(1);
    expect(store.shouldOfferReimport({ ...s, importedLegacyAt: 1000 })).toBe(true);
    expect(store.shouldOfferReimport({ ...s, importedLegacyAt: 2000 })).toBe(false);
    expect(new SaveStore(mem()).shouldOfferReimport(s)).toBe(false);
    expect(new SaveStore(mem({ [LEGACY_SAVE_KEY]: '{kaputt' })).shouldOfferReimport(s)).toBe(false);
  });

  it('bietet die Übernahme an, wenn noch nie übernommen wurde', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify({ ...LEGACY_PARTIAL, timestamp: 2000 }) });
    const s = createNewGameState(1);
    expect(s.importedLegacyAt).toBeNull();
    expect(new SaveStore(m).shouldOfferReimport(s)).toBe(true);
  });

  it('übersteht einen Speicher, der wirft', () => {
    const store = new SaveStore(throwing());
    expect(store.load()).toBeNull(); expect(store.hasSave()).toBe(false);
    expect(store.save(createNewGameState(1), 2)).toBe(false);
    expect(store.importLegacy(1)).toBeNull();
    expect(store.shouldOfferReimport(createNewGameState(1))).toBe(false);
  });

  it('lädt und überschreibt keinen neueren Stand', () => {
    const newer = JSON.stringify({ ...createNewGameState(1), formatVersion: 2 });
    const m = mem({ [SAVE_KEY]: newer }); const store = new SaveStore(m);
    expect(store.load()).toBeNull();
    expect(store.save(createNewGameState(1), 2)).toBe(false);
    expect(m.getItem(SAVE_KEY)).toBe(newer);
  });

  it('überschreibt unlesbaren Müll, denn da gibt es nichts zu schützen', () => {
    for (const garbage of ['{kaputt', '[]', '{"formatVersion":1}', '{"formatVersion":0}', '42']) {
      const m = mem({ [SAVE_KEY]: garbage }); const store = new SaveStore(m);
      expect(store.load()).toBeNull();
      expect(store.save(createNewGameState(1), 5)).toBe(true);
      expect(store.load()).toEqual({ ...createNewGameState(1), savedAt: 5 });
    }
  });
});

describe('migrateState', () => {
  it('prüft die Mindestform', () => {
    const ok = createNewGameState(1);
    expect(migrateState(ok)).toEqual(ok);
    expect(migrateState({ ...ok, extra: 1 })).toEqual({ ...ok, extra: 1 });
    const bad: unknown[] = [
      null, 'x', [], 7, {},
      { ...ok, formatVersion: 2 }, { ...ok, formatVersion: undefined },
      { ...ok, player: { ...ok.player, map: 'nirgends' } }, { ...ok, player: null },
      { ...ok, inventory: { ...ok.inventory, slots: [] } }, { ...ok, inventory: null },
      { ...ok, progression: null },
    ];
    for (const b of bad) expect(migrateState(b)).toBeNull();
  });
});

describe('Sicherung als Datei', () => {
  it('geht hin und zurück, auch aus dem alten Spiel', () => {
    const s = createNewGameState(1);
    expect(parseImport(serializeForExport(s), 7)).toEqual(s);
    expect(parseImport(JSON.stringify(LEGACY_FIRST_COMMIT), 7)!.progression.level).toBe(3);
    for (const bad of ['', 'kein json', '[]', '{"formatVersion":1}', 'null', '{}']) {
      expect(parseImport(bad, 7)).toBeNull();
    }
  });

  it('lehnt eine neuere v2-Sicherung ab und ist eingerückt', () => {
    const s = createNewGameState(1);
    expect(parseImport(JSON.stringify({ ...s, formatVersion: 2 }), 7)).toBeNull();
    expect(serializeForExport(s)).toBe(JSON.stringify(s, null, 2));
  });
});

describe('Schutz vor Verlust', () => {
  it('schreibt nichts, wenn das Lesen des vorhandenen Eintrags scheitert', () => {
    const m = mem();
    const store = new SaveStore({ getItem: () => { throw new Error('gesperrt'); }, setItem: m.setItem });
    expect(store.save(createNewGameState(1), 2)).toBe(false);
    expect(m.writtenKeys).toEqual([]);
  });

  it('sichert einen abgelehnten Eintrag vor dem Überschreiben', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt' }); const store = new SaveStore(m);
    expect(store.save(createNewGameState(1), 5)).toBe(true);
    expect(m.getItem(REJECTED_SAVE_KEY)).toBe('{kaputt');
    expect(store.load()).toEqual({ ...createNewGameState(1), savedAt: 5 });
    expect(m.writtenKeys).toEqual([REJECTED_SAVE_KEY, SAVE_KEY]);
    expect(store.save(createNewGameState(1), 6)).toBe(true);
    expect(m.writtenKeys).toEqual([REJECTED_SAVE_KEY, SAVE_KEY, SAVE_KEY]);
  });

  it('sichert denselben abgelehnten Text nicht zweimal', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt', [REJECTED_SAVE_KEY]: '{kaputt' });
    new SaveStore(m).save(createNewGameState(1), 5);
    expect(m.writtenKeys).toEqual([SAVE_KEY]);
  });

  it('schreibt trotzdem, wenn die Sicherung des abgelehnten Eintrags scheitert', () => {
    const base = mem({ [SAVE_KEY]: '{kaputt' });
    const store = new SaveStore({
      getItem: base.getItem,
      setItem: (k, v) => { if (k === REJECTED_SAVE_KEY) throw new Error('voll'); base.setItem(k, v); },
    });
    expect(store.save(createNewGameState(1), 5)).toBe(true);
    expect(store.load()?.savedAt).toBe(5);
  });
});

function roundTrip<T>(v: T): T { return JSON.parse(JSON.stringify(v)) as T; }

describe('migrateState: Reparatur statt Verwerfen', () => {
  it('ist die Identität auf gültigen Ständen, auch aus der Übernahme', () => {
    const states: GameState[] = [createNewGameState(1)];
    for (const f of [LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_NGPLUS, LEGACY_PARTIAL]) {
      states.push(migrateLegacySave(JSON.stringify(f), null, 5)!.state);
    }
    for (const s of states) expect(migrateState(roundTrip(s))).toEqual(s);
  });

  function damaged(): Record<string, unknown> {
    const s = roundTrip(createNewGameState(1)) as unknown as Record<string, any>;
    s.progression.level = 12; s.inventory.coins = 37;
    s.inventory.slots[3] = null; s.inventory.slots[4] = 7;
    s.inventory.slots[5] = { itemId: 'gibt_es_nicht', count: 2 };
    s.player.x = 'a'; s.player.hp = null; s.visitedMaps = 'x';
    delete s.progression.stats; s.progression.completedQuests = { first_steps: true };
    s.friendship = []; s.pet = 'cat'; s.settings = {};
    s.progression.level = 31.7; s.zukunft = 1;
    return s;
  }

  it('repariert einen beschädigten, aber rettbaren Stand', () => {
    const r = migrateState(roundTrip(damaged()))!;
    expect(r).not.toBeNull();
    expect(r.inventory.slots).toHaveLength(48);
    for (const i of [3, 4, 5]) expect(r.inventory.slots[i]).toEqual({ itemId: null, count: 0 });
    expect(r.progression.level).toBe(30);
    expect(r.inventory.coins).toBe(37);
    expect(r.player).toEqual({ map: 'hub', x: 20, y: 15, hp: 40 });
    expect(r.visitedMaps).toEqual(['hub']);
    expect(r.progression.stats).toEqual(createNewGameState(1).progression.stats);
    expect(r.progression.completedQuests).toEqual([]);
    expect(r.friendship).toEqual({});
    expect(r.pet).toBeNull();
    expect(r.settings).toEqual({ muted: false, difficulty: 'sanft' });
    expect((r as unknown as Record<string, unknown>)['zukunft']).toBe(1);
    expect(roundTrip(r)).toEqual(r);
  });

  it('verlangt das harte Minimum', () => {
    const ok = roundTrip(createNewGameState(1));
    const bad: unknown[] = [
      { ...ok, inventory: { ...ok.inventory, slots: ok.inventory.slots.slice(1) } },
      { ...ok, player: { ...ok.player, map: 'moon' } },
      { ...ok, formatVersion: '1' },
      { ...ok, progression: { ...ok.progression, level: 'x' } },
      { ...ok, inventory: undefined },
    ];
    for (const b of bad) expect(migrateState(b)).toBeNull();
  });

  it('lädt den reparierten Stand und speichert danach nur den Hauptschlüssel', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify(damaged()) }); const store = new SaveStore(m);
    const loaded = store.load()!;
    expect(loaded.progression.level).toBe(30);
    expect(store.save(loaded, 9)).toBe(true);
    expect(m.writtenKeys).toEqual([SAVE_KEY]);
  });
});
