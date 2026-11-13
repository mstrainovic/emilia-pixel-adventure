import { describe, it, expect } from 'vitest';
import {
  SaveStore, SAVE_KEY, migrateState, serializeForExport, parseImport,
} from '../../src/save/store';
import { LEGACY_SAVE_KEY, LEGACY_MUTED_KEY } from '../../src/save/legacy';
import { createNewGameState } from '../../src/core/state';
import {
  LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_PARTIAL,
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
      { ...ok, progression: { ...ok.progression, level: 0 } },
      { ...ok, progression: { ...ok.progression, level: 31 } },
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
