import { describe, it, expect, vi } from 'vitest';
import {
  SaveStore, SAVE_KEY, REJECTED_SAVE_KEY, BACKUP_SAVE_KEY, migrateState, serializeForExport, parseImport,
} from '../../src/save/store';
import { LEGACY_SAVE_KEY, LEGACY_MUTED_KEY, migrateLegacySave } from '../../src/save/legacy';
import { QUEST_ORDER } from '../../src/data/quests';
import { createNewGameState, type GameState } from '../../src/core/state';
import {
  LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_PARTIAL, LEGACY_NGPLUS, LEGACY_NGPLUS_REAL,
} from './legacySaves';

function mem(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const writtenKeys: string[] = [];
  return {
    writtenKeys,
    getItem: (k: string): string | null => data.get(k) ?? null,
    setItem: (k: string, v: string): void => { writtenKeys.push(k); data.set(k, v); },
    /** Löscht von außen, wie ein anderer Tab oder die Website-Daten-Einstellungen es täten. */
    remove: (k: string): void => { data.delete(k); },
  };
}

function throwing() {
  return {
    getItem: (): string | null => { throw new Error('Speicher gesperrt'); },
    setItem: (): void => { throw new Error('Speicher voll'); },
  };
}

/** Speicher, dessen Schreiben mit dem gegebenen Fehler scheitert. */
function failingWrites(error: unknown, initial: Record<string, string> = {}) {
  const base = mem(initial);
  return { ...base, setItem: (): void => { throw error; } };
}

function quota(extra: Record<string, unknown> = {}): Error {
  return Object.assign(new Error('voll'), { name: 'QuotaExceededError', ...extra });
}

function ok(state: GameState, repair: unknown = null) { return { kind: 'ok', state, repair }; }

describe('SaveStore', () => {
  it('leerer Speicher', () => { expect(new SaveStore(mem()).load()).toEqual({ kind: 'empty' }); });

  it('speichert und lädt verlustfrei', () => {
    const m = mem(); const store = new SaveStore(m); const s = createNewGameState(1);
    expect(store.save(s, 99)).toEqual({ kind: 'saved' });
    expect(store.load()).toEqual(ok({ ...s, savedAt: 99 }));
  });

  it('verändert den übergebenen Zustand nicht', () => {
    const store = new SaveStore(mem()); const s = createNewGameState(1);
    store.save(s, 99);
    expect(s.savedAt).toBe(1);
  });

  it('schreibt nie in die alten Schlüssel', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_V3_FULL), [LEGACY_MUTED_KEY]: 'true' });
    const store = new SaveStore(m);
    const imported = store.importLegacy(10);
    expect(imported.kind).toBe('ok');
    if (imported.kind !== 'ok') return;
    store.save(imported.state, 11);
    store.replaceWith(imported.state, 12);
    expect(m.writtenKeys.every((k) => k === SAVE_KEY || k === BACKUP_SAVE_KEY)).toBe(true);
    expect(m.writtenKeys).not.toContain(LEGACY_SAVE_KEY);
    expect(m.writtenKeys).not.toContain(LEGACY_MUTED_KEY);
    expect(m.getItem(LEGACY_SAVE_KEY)).toBe(JSON.stringify(LEGACY_V3_FULL));
  });

  it('übersteht einen Speicher, der wirft', () => {
    const m = mem(); const store = new SaveStore({ getItem: throwing().getItem, setItem: m.setItem });
    expect(store.load()).toEqual({ kind: 'unavailable' });
    expect(store.save(createNewGameState(1), 2)).toEqual({ kind: 'unavailable' });
    expect(store.replaceWith(createNewGameState(1), 2)).toEqual({ kind: 'unavailable' });
    expect(m.writtenKeys).toEqual([]);
    const all = new SaveStore(throwing());
    expect(all.importLegacy(1)).toEqual({ kind: 'none' });
    expect(all.legacyOffer(null)).toBe('none');
    expect(all.readRejected()).toBeNull();
  });

  it('meldet Müll als kaputt und sichert den Rohtext', () => {
    for (const garbage of ['{kaputt', '[]', '{"formatVersion":1}', '{"formatVersion":0}', '42', 'null']) {
      const m = mem({ [SAVE_KEY]: garbage }); const store = new SaveStore(m);
      expect(store.load()).toEqual({ kind: 'corrupt' });
      expect(m.getItem(REJECTED_SAVE_KEY)).toBe(garbage);
      expect(store.readRejected()).toBe(garbage);
    }
  });

  it('überschreibt unlesbaren Müll beim Speichern, nachdem er gesichert ist', () => {
    for (const garbage of ['{kaputt', '[]', '{"formatVersion":1}', '42']) {
      const m = mem({ [SAVE_KEY]: garbage }); const store = new SaveStore(m);
      expect(store.save(createNewGameState(1), 5)).toEqual({ kind: 'saved' });
      expect(m.getItem(REJECTED_SAVE_KEY)).toBe(garbage);
      expect(store.load()).toEqual(ok({ ...createNewGameState(1), savedAt: 5 }));
    }
  });

  it('meldet einen neueren Stand, lädt und überschreibt ihn nicht', () => {
    const newer = JSON.stringify({ ...createNewGameState(1), formatVersion: 2 });
    const m = mem({ [SAVE_KEY]: newer }); const store = new SaveStore(m);
    expect(store.load()).toEqual({ kind: 'newer', storedVersion: 2 });
    expect(store.save(createNewGameState(1), 2)).toEqual({ kind: 'blocked-newer', storedVersion: 2 });
    expect(m.getItem(SAVE_KEY)).toBe(newer);
    expect(m.writtenKeys).toEqual([]);
  });

  it('meldet einen reparierten Stand mit Bericht und sichert bei Verlust den Rohtext', () => {
    const raw = JSON.parse(JSON.stringify(createNewGameState(1))) as GameState;
    raw.inventory.slots[2] = { itemId: 'gibt_es_nicht', count: 3 };
    const text = JSON.stringify(raw);
    const m = mem({ [SAVE_KEY]: text }); const store = new SaveStore(m);
    const result = store.load();
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.repair).toMatchObject({ lossy: true, droppedItems: [{ itemId: 'gibt_es_nicht', count: 3 }] });
    expect(result.state.inventory.slots[2]).toEqual({ itemId: null, count: 0 });
    expect(m.getItem(REJECTED_SAVE_KEY)).toBe(text);
    expect(store.readRejected()).toBe(text);
  });

  it('meldet eine zurückgesetzte Aufgabe als Reparatur ohne Verlust und sichert nichts', () => {
    const raw = JSON.parse(JSON.stringify(createNewGameState(1))) as GameState;
    raw.progression.activeQuests = { wood_collector: { progress: -3 } };
    const m = mem({ [SAVE_KEY]: JSON.stringify(raw) });
    const result = new SaveStore(m).load();
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.repair).toMatchObject({ lossy: false, resetQuests: ['wood_collector'] });
    expect(result.state.progression.activeQuests).toEqual({ wood_collector: { progress: 0 } });
    expect(m.writtenKeys).toEqual([]);
  });

  it('meldet einen gültigen Stand ohne Bericht und sichert nichts', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify(createNewGameState(1)) });
    expect(new SaveStore(m).load()).toEqual(ok(createNewGameState(1)));
    expect(m.writtenKeys).toEqual([]);
  });

  it('unterscheidet voll von nicht verfügbar beim Schreiben', () => {
    const s = createNewGameState(1);
    expect(new SaveStore(failingWrites(quota())).save(s, 1)).toEqual({ kind: 'full' });
    expect(new SaveStore(failingWrites(Object.assign(new Error('x'), { code: 22 }))).save(s, 1)).toEqual({ kind: 'full' });
    expect(new SaveStore(failingWrites(Object.assign(new Error('x'), { code: 1014 }))).save(s, 1)).toEqual({ kind: 'full' });
    expect(new SaveStore(failingWrites(new Error('gesperrt'))).save(s, 1)).toEqual({ kind: 'unavailable' });
    expect(new SaveStore(failingWrites('kein Fehlerobjekt')).save(s, 1)).toEqual({ kind: 'unavailable' });
    expect(new SaveStore(failingWrites(null)).save(s, 1)).toEqual({ kind: 'unavailable' });
  });

  it('schreibt trotzdem, wenn die Sicherung des abgelehnten Eintrags scheitert', () => {
    const base = mem({ [SAVE_KEY]: '{kaputt' });
    const store = new SaveStore({
      getItem: base.getItem,
      setItem: (k, v) => { if (k === REJECTED_SAVE_KEY) throw new Error('voll'); base.setItem(k, v); },
    });
    expect(store.save(createNewGameState(1), 5)).toEqual({ kind: 'saved' });
    expect(store.load()).toEqual(ok({ ...createNewGameState(1), savedAt: 5 }));
  });

  it('sichert denselben abgelehnten Text nicht zweimal', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt', [REJECTED_SAVE_KEY]: '{kaputt' });
    new SaveStore(m).save(createNewGameState(1), 5);
    expect(m.writtenKeys).toEqual([SAVE_KEY]);
  });
});

describe('Zwei Tabs über demselben Speicher', () => {
  it('ein veralteter Tab überschreibt den Stand des anderen nicht', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify({ ...createNewGameState(1), savedAt: 1000 }) });
    const a = new SaveStore(m); const b = new SaveStore(m);
    expect(a.load().kind).toBe('ok'); expect(b.load().kind).toBe('ok');
    expect(b.save(createNewGameState(2), 2000)).toEqual({ kind: 'saved' });
    const fromB = m.getItem(SAVE_KEY);
    expect(a.save(createNewGameState(3), 3000)).toEqual({ kind: 'blocked-other-tab' });
    expect(m.getItem(SAVE_KEY)).toBe(fromB);
    expect(b.save(createNewGameState(2), 4000)).toEqual({ kind: 'saved' });
    expect(a.load().kind).toBe('ok');
    expect(a.save(createNewGameState(3), 5000)).toEqual({ kind: 'saved' });
  });

  it('nach dem Laden eines leeren Speichers sperrt ein fremder Stand ebenso', () => {
    const m = mem(); const a = new SaveStore(m); const b = new SaveStore(m);
    expect(a.load()).toEqual({ kind: 'empty' }); expect(b.load()).toEqual({ kind: 'empty' });
    expect(b.save(createNewGameState(2), 2000)).toEqual({ kind: 'saved' });
    expect(a.save(createNewGameState(3), 3000)).toEqual({ kind: 'blocked-other-tab' });
  });

  it('von außen gelöschter Eintrag: der Tab schreibt wieder', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify({ ...createNewGameState(1), savedAt: 1000 }) });
    const a = new SaveStore(m); const b = new SaveStore(m);
    a.load(); b.load();
    expect(b.save(createNewGameState(2), 2000)).toEqual({ kind: 'saved' });
    m.remove(SAVE_KEY);
    expect(a.save(createNewGameState(3), 3000)).toEqual({ kind: 'saved' });
    expect(new SaveStore(m).load()).toEqual(ok({ ...createNewGameState(3), savedAt: 3000 }));
  });

  it('kaputter Eintrag ohne lesbaren Stempel: schreibt, der Rohtext ist gesichert', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify({ ...createNewGameState(1), savedAt: 1000 }) });
    const a = new SaveStore(m); a.load();
    m.setItem(SAVE_KEY, '{kaputt');
    expect(a.save(createNewGameState(3), 3000)).toEqual({ kind: 'saved' });
    expect(m.getItem(REJECTED_SAVE_KEY)).toBe('{kaputt');
  });

  it('neuere Version hat Vorrang vor dem fremden Stempel', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify({ ...createNewGameState(1), savedAt: 1000 }) });
    const a = new SaveStore(m); a.load();
    const newer = JSON.stringify({ ...createNewGameState(1), formatVersion: 2, savedAt: 2000 });
    m.setItem(SAVE_KEY, newer);
    expect(a.save(createNewGameState(3), 3000)).toEqual({ kind: 'blocked-newer', storedVersion: 2 });
    expect(m.getItem(SAVE_KEY)).toBe(newer);
  });

  it('replaceWith prüft den fremden Stempel nicht, merkt sich aber den eigenen', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify({ ...createNewGameState(1), savedAt: 1000 }) });
    const a = new SaveStore(m); const b = new SaveStore(m);
    a.load(); b.load();
    expect(b.save(createNewGameState(2), 2000)).toEqual({ kind: 'saved' });
    const fromB = m.getItem(SAVE_KEY);
    expect(a.replaceWith(createNewGameState(3), 3000)).toEqual({ kind: 'saved' });
    expect(m.getItem(BACKUP_SAVE_KEY)).toBe(fromB);
    expect(a.save(createNewGameState(3), 4000)).toEqual({ kind: 'saved' });
  });

  it('ein Speicher ohne vorheriges Laden schreibt beim ersten Mal und merkt sich den Stempel', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify({ ...createNewGameState(1), savedAt: 1000 }) });
    const a = new SaveStore(m);
    expect(a.save(createNewGameState(3), 3000)).toEqual({ kind: 'saved' });
    expect(a.save(createNewGameState(3), 4000)).toEqual({ kind: 'saved' });
    m.setItem(SAVE_KEY, JSON.stringify({ ...createNewGameState(1), savedAt: 4500 }));
    expect(a.save(createNewGameState(3), 5000)).toEqual({ kind: 'blocked-other-tab' });
  });
});

describe('Übernahme des alten Stands', () => {
  it('liest nur und schreibt nichts', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_V3_FULL), [LEGACY_MUTED_KEY]: 'true' });
    const result = new SaveStore(m).importLegacy(10);
    expect(result.kind).toBe('ok');
    if (result.kind === 'ok') expect(result.state.settings.muted).toBe(true);
    expect(m.writtenKeys).toEqual([]);
  });

  it('unterscheidet fehlend, unlesbar und Fehler beim Umbau', () => {
    expect(new SaveStore(mem()).importLegacy(10)).toEqual({ kind: 'none' });
    expect(new SaveStore(mem({ [LEGACY_SAVE_KEY]: '[1,2]' })).importLegacy(10)).toEqual({ kind: 'unreadable' });
    expect(new SaveStore(mem({ [LEGACY_SAVE_KEY]: '{kaputt' })).importLegacy(10)).toEqual({ kind: 'unreadable' });
    const spy = vi.spyOn(QUEST_ORDER, 'filter').mockImplementation(() => { throw new Error('Umbau kaputt'); });
    try {
      expect(new SaveStore(mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_V3_FULL) })).importLegacy(10))
        .toEqual({ kind: 'failed', message: 'Umbau kaputt' });
    } finally { spy.mockRestore(); }
  });
});

describe('replaceWith', () => {
  it('sichert den bisherigen Rohtext bytegleich und speichert den neuen Stand', () => {
    const old = JSON.stringify(createNewGameState(1), null, 3);
    const m = mem({ [SAVE_KEY]: old }); const store = new SaveStore(m);
    const next = createNewGameState(2);
    expect(store.replaceWith(next, 50)).toEqual({ kind: 'saved' });
    expect(m.getItem(BACKUP_SAVE_KEY)).toBe(old);
    expect(store.load()).toEqual(ok({ ...next, savedAt: 50 }));
    expect(m.writtenKeys).toEqual([BACKUP_SAVE_KEY, SAVE_KEY]);
  });

  it('sichert auch einen unlesbaren bisherigen Eintrag', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt' });
    expect(new SaveStore(m).replaceWith(createNewGameState(2), 50)).toEqual({ kind: 'saved' });
    expect(m.getItem(BACKUP_SAVE_KEY)).toBe('{kaputt');
  });

  it('ändert bei neuerem Stand nichts', () => {
    const newer = JSON.stringify({ ...createNewGameState(1), formatVersion: 2 });
    const m = mem({ [SAVE_KEY]: newer });
    expect(new SaveStore(m).replaceWith(createNewGameState(2), 50)).toEqual({ kind: 'blocked-newer', storedVersion: 2 });
    expect(m.writtenKeys).toEqual([]);
    expect(m.getItem(SAVE_KEY)).toBe(newer);
  });

  it('speichert nur, wenn es nichts zu sichern gibt', () => {
    const m = mem(); const store = new SaveStore(m);
    expect(store.replaceWith(createNewGameState(2), 50)).toEqual({ kind: 'saved' });
    expect(m.writtenKeys).toEqual([SAVE_KEY]);
  });

  it('ersetzt nicht, wenn die Sicherung scheitert', () => {
    const base = mem({ [SAVE_KEY]: JSON.stringify(createNewGameState(1)) });
    const store = new SaveStore({
      getItem: base.getItem,
      setItem: (k, v) => { if (k === BACKUP_SAVE_KEY) throw quota(); base.setItem(k, v); },
    });
    expect(store.replaceWith(createNewGameState(2), 50)).toEqual({ kind: 'full' });
    expect(base.writtenKeys).toEqual([]);
  });
});

describe('legacyOffer', () => {
  const legacy = (timestamp?: number) => ({
    [LEGACY_SAVE_KEY]: JSON.stringify(timestamp === undefined ? LEGACY_PARTIAL : { ...LEGACY_PARTIAL, timestamp }),
  });
  const withState = (patch: Partial<GameState>): GameState => ({ ...createNewGameState(1), ...patch });

  it('bietet beim ersten Mal an, wenn es keinen v2-Stand gibt und der alte lesbar ist', () => {
    expect(new SaveStore(mem(legacy(100))).legacyOffer(null)).toBe('first');
    expect(new SaveStore(mem(legacy())).legacyOffer(null)).toBe('first');
    expect(new SaveStore(mem()).legacyOffer(null)).toBe('none');
    expect(new SaveStore(mem({ [LEGACY_SAVE_KEY]: '{kaputt' })).legacyOffer(null)).toBe('none');
  });

  it('bietet erneut an, nur wenn der alte Stand neuer ist als Übernahme und Ablehnung', () => {
    expect(new SaveStore(mem()).legacyOffer(withState({ importedLegacyAt: 100 }))).toBe('none');
    expect(new SaveStore(mem(legacy(100))).legacyOffer(withState({ importedLegacyAt: 100 }))).toBe('none');
    expect(new SaveStore(mem(legacy(200))).legacyOffer(withState({ importedLegacyAt: 100 }))).toBe('newer');
    expect(new SaveStore(mem(legacy(200))).legacyOffer(withState({ importedLegacyAt: 100, legacyDeclinedAt: 200 }))).toBe('none');
    expect(new SaveStore(mem(legacy(300))).legacyOffer(withState({ importedLegacyAt: 100, legacyDeclinedAt: 200 }))).toBe('newer');
  });

  it('bietet einen alten Stand ohne Zeitstempel nach der ersten Übernahme nicht mehr an', () => {
    expect(new SaveStore(mem(legacy())).legacyOffer(withState({ importedLegacyAt: 0 }))).toBe('none');
    expect(new SaveStore(mem(legacy())).legacyOffer(withState({ importedLegacyAt: null }))).toBe('none');
  });

  it('bietet bei v2-Stand ohne bisherige Übernahme einen alten Stand mit Zeitstempel an', () => {
    expect(new SaveStore(mem(legacy(2000))).legacyOffer(createNewGameState(1))).toBe('newer');
  });

  it('legacyStamp: Zeitstempel des alten Stands (für „Nein" auf die Frage), nur lesend', () => {
    const m = mem(legacy(2000));
    expect(new SaveStore(m).legacyStamp()).toBe(2000);
    expect(m.writtenKeys).toEqual([]);
    expect(new SaveStore(mem(legacy())).legacyStamp()).toBeNull();
    expect(new SaveStore(mem()).legacyStamp()).toBeNull();
    expect(new SaveStore(throwing()).legacyStamp()).toBeNull();
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
    expect(store.save(createNewGameState(1), 2)).toEqual({ kind: 'unavailable' });
    expect(m.writtenKeys).toEqual([]);
  });

  it('sichert einen abgelehnten Eintrag vor dem Überschreiben', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt' }); const store = new SaveStore(m);
    expect(store.save(createNewGameState(1), 5)).toEqual({ kind: 'saved' });
    expect(m.getItem(REJECTED_SAVE_KEY)).toBe('{kaputt');
    expect(store.load()).toEqual(ok({ ...createNewGameState(1), savedAt: 5 }));
    expect(m.writtenKeys).toEqual([REJECTED_SAVE_KEY, SAVE_KEY]);
    expect(store.save(createNewGameState(1), 6)).toEqual({ kind: 'saved' });
    expect(m.writtenKeys).toEqual([REJECTED_SAVE_KEY, SAVE_KEY, SAVE_KEY]);
  });
});

function roundTrip<T>(v: T): T { return JSON.parse(JSON.stringify(v)) as T; }

describe('migrateState: Reparatur statt Verwerfen', () => {
  it('ist die Identität auf gültigen Ständen, auch aus der Übernahme', () => {
    const states: GameState[] = [createNewGameState(1)];
    for (const f of [LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_NGPLUS, LEGACY_NGPLUS_REAL, LEGACY_PARTIAL]) {
      const r = migrateLegacySave(JSON.stringify(f), null, 5);
      if (r.kind !== 'ok') throw new Error('Vorlage nicht übernehmbar');
      states.push(r.state);
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
    expect(r.player).toEqual({ map: 'hub', x: 19.5, y: 14.5, hp: 40 });
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
      { ...ok, formatVersion: '1' },
      { ...ok, progression: { ...ok.progression, level: 'x' } },
    ];
    for (const b of bad) expect(migrateState(b)).toBeNull();
  });

  it('lädt den reparierten Stand, sichert den Rohtext einmal und speichert danach den Hauptschlüssel', () => {
    const m = mem({ [SAVE_KEY]: JSON.stringify(damaged()) }); const store = new SaveStore(m);
    const result = store.load();
    if (result.kind !== 'ok') throw new Error('nicht geladen');
    const loaded = result.state;
    expect(loaded.progression.level).toBe(30);
    expect(m.getItem(REJECTED_SAVE_KEY)).toBe(JSON.stringify(damaged()));
    expect(store.save(loaded, 9)).toEqual({ kind: 'saved' });
    expect(m.writtenKeys).toEqual([REJECTED_SAVE_KEY, SAVE_KEY]);
  });
});
