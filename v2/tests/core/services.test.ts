import { describe, it, expect } from 'vitest';
import { startGame } from '../../src/core/services';
import { createNewGameState, type GameState } from '../../src/core/state';
import { SaveStore, SAVE_KEY, REJECTED_SAVE_KEY } from '../../src/save/store';
import { SaveService } from '../../src/save/service';
import { LEGACY_SAVE_KEY, LEGACY_MUTED_KEY } from '../../src/save/legacy';
import { normalizeState } from '../../src/save/normalize';
import {
  LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_NGPLUS, LEGACY_NGPLUS_REAL, LEGACY_PARTIAL, LEGACY_LONG_INVENTORY,
} from '../save/legacySaves';

/** Fake-Speicher, der jeden Schreibzugriff je Schlüssel zählt. */
function mem(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const writes = new Map<string, number>();
  return {
    data,
    writesTo: (k: string): number => writes.get(k) ?? 0,
    getItem: (k: string): string | null => data.get(k) ?? null,
    setItem: (k: string, v: string): void => { writes.set(k, (writes.get(k) ?? 0) + 1); data.set(k, v); },
  };
}

const NOW = 1_800_000_000_000;

describe('startGame', () => {
  it('ok: lädt den v2-Stand, speichert nichts', () => {
    const saved = { ...createNewGameState(5), savedAt: 7 };
    saved.progression.level = 4;
    const m = mem({ [SAVE_KEY]: JSON.stringify(saved) });
    const start = startGame(new SaveStore(m), NOW);
    expect(start).toEqual({
      state: saved, notice: null, persist: true, legacyNewer: false, repair: null, importSave: null,
    });
    expect(m.writesTo(SAVE_KEY)).toBe(0);
  });

  it('ok mit Verlust beim Reparieren: Hinweis save-repaired samt Bericht, es wird weiter gespeichert', () => {
    const saved = JSON.parse(JSON.stringify(createNewGameState(5))) as GameState;
    saved.inventory.slots[1] = { itemId: 'gibt_es_nicht', count: 2 };
    const m = mem({ [SAVE_KEY]: JSON.stringify(saved) });
    const start = startGame(new SaveStore(m), NOW);
    expect(start.notice).toBe('save-repaired');
    expect(start.persist).toBe(true);
    expect(start.repair).toMatchObject({ lossy: true, droppedItems: [{ itemId: 'gibt_es_nicht', count: 2 }] });
    expect(start.importSave).toBeNull();
  });

  it('ok mit Reparatur ohne Verlust: kein Hinweis, aber der Bericht', () => {
    const saved = JSON.parse(JSON.stringify(createNewGameState(5))) as GameState;
    saved.player.map = 'mond' as GameState['player']['map'];
    const start = startGame(new SaveStore(mem({ [SAVE_KEY]: JSON.stringify(saved) })), NOW);
    expect(start.notice).toBeNull();
    expect(start.repair).toMatchObject({ lossy: false, relocated: true });
  });

  it('kaputt und alter Stand übernommen: Hinweis save-corrupt-legacy, Sofort-Speichern gemeldet', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt', [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) });
    const start = startGame(new SaveStore(m), NOW);
    expect(start.notice).toBe('save-corrupt-legacy');
    expect(start.importSave).toEqual({ kind: 'saved' });
    expect(start.repair).toBeNull();
    expect(start.state.progression.level).toBe(3);
  });

  it('kaputt ohne alten Stand: save-corrupt, kein Sofort-Speichern', () => {
    const start = startGame(new SaveStore(mem({ [SAVE_KEY]: '{kaputt' })), NOW);
    expect(start.notice).toBe('save-corrupt');
    expect(start.importSave).toBeNull();
  });

  it('leer, alter Stand, Speicher voll: übernommen, das Sofort-Speichern meldet full', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) });
    const store = new SaveStore({
      getItem: m.getItem,
      setItem: (): void => { throw Object.assign(new Error('voll'), { name: 'QuotaExceededError' }); },
    });
    const start = startGame(store, NOW);
    expect(start.notice).toBe('legacy-imported');
    expect(start.importSave).toEqual({ kind: 'full' });
    expect(start.state.progression.level).toBe(3);
  });

  it('ok und alter Stand neuer als die letzte Übernahme: legacyNewer, der v2-Stand bleibt', () => {
    const saved = { ...createNewGameState(5), importedLegacyAt: 1 };
    const text = JSON.stringify(saved);
    const m = mem({ [SAVE_KEY]: text, [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) });
    const start = startGame(new SaveStore(m), NOW);
    expect(start.legacyNewer).toBe(true);
    expect(start.notice).toBeNull();
    expect(start.state).toEqual(saved);
    expect(m.data.get(SAVE_KEY)).toBe(text);
    expect(m.writesTo(SAVE_KEY)).toBe(0);
  });

  it('empty ohne alten Stand: neues Spiel ohne Hinweis', () => {
    const m = mem();
    const start = startGame(new SaveStore(m), NOW);
    expect(start).toEqual({ state: createNewGameState(NOW), notice: null, persist: true, legacyNewer: false, repair: null, importSave: null });
  });

  it('empty mit LEGACY_FIRST_COMMIT: übernommen, Hinweis legacy-imported, sofort gespeichert', () => {
    const legacyText = JSON.stringify(LEGACY_FIRST_COMMIT);
    const m = mem({ [LEGACY_SAVE_KEY]: legacyText });
    const start = startGame(new SaveStore(m), NOW);
    expect(start.notice).toBe('legacy-imported');
    expect(start.persist).toBe(true);
    expect(start.legacyNewer).toBe(false);
    expect(start.state.progression.level).toBe(3);
    expect(start.state.importedLegacyAt).toBe(1711300000000);
    expect(start.state.player.map).toBe('forest');
    expect(m.writesTo(SAVE_KEY)).toBe(1);
    expect(start.importSave).toEqual({ kind: 'saved' });
    expect(new SaveStore(m).load()).toEqual({ kind: 'ok', state: { ...start.state, savedAt: NOW }, repair: null });
    expect(m.data.get(LEGACY_SAVE_KEY)).toBe(legacyText);
    expect(m.writesTo(LEGACY_SAVE_KEY)).toBe(0);
  });

  it('empty mit unlesbarem alten Stand [1,2]: neues Spiel, Hinweis legacy-failed', () => {
    const m = mem({ [LEGACY_SAVE_KEY]: '[1,2]' });
    const start = startGame(new SaveStore(m), NOW);
    expect(start).toEqual({ state: createNewGameState(NOW), notice: 'legacy-failed', persist: true, legacyNewer: false, repair: null, importSave: null });
    expect(m.data.get(LEGACY_SAVE_KEY)).toBe('[1,2]');
    expect(m.writesTo(LEGACY_SAVE_KEY)).toBe(0);
  });

  it('corrupt: wie empty, ein Hinweis auf den kaputten Stand hat Vorrang, der Rohtext ist gesichert', () => {
    const m = mem({ [SAVE_KEY]: '{kaputt', [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) });
    const start = startGame(new SaveStore(m), NOW);
    expect(start.notice).toBe('save-corrupt-legacy');
    expect(start.persist).toBe(true);
    expect(start.state.progression.level).toBe(3);
    expect(m.data.get(REJECTED_SAVE_KEY)).toBe('{kaputt');
    expect(m.writesTo(SAVE_KEY)).toBe(1);

    const alone = mem({ [SAVE_KEY]: '{kaputt' });
    const fresh = startGame(new SaveStore(alone), NOW);
    expect(fresh).toEqual({ state: createNewGameState(NOW), notice: 'save-corrupt', persist: true, legacyNewer: false, repair: null, importSave: null });
  });

  it('newer: neues Spiel, Hinweis save-newer, es wird nie gespeichert', () => {
    const newerText = JSON.stringify({ formatVersion: 2, savedAt: 1, zukunft: true });
    const m = mem({ [SAVE_KEY]: newerText, [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_FIRST_COMMIT) });
    const store = new SaveStore(m);
    const start = startGame(store, NOW);
    expect(start).toEqual({ state: createNewGameState(NOW), notice: 'save-newer', persist: false, legacyNewer: false, repair: null, importSave: null });
    const service = new SaveService(store, () => start.state, () => NOW + 1);
    expect(service.saveNow('timer').kind).toBe('blocked-newer');
    expect(m.data.get(SAVE_KEY)).toBe(newerText);
    expect(m.writesTo(SAVE_KEY)).toBe(0);
  });

  it('unavailable: neues Spiel, Hinweis storage-unavailable, es wird nicht gespeichert', () => {
    let writes = 0;
    const store = new SaveStore({
      getItem: (): string | null => { throw new Error('gesperrt'); },
      setItem: (): void => { writes++; },
    });
    const start = startGame(store, NOW);
    expect(start).toEqual({ state: createNewGameState(NOW), notice: 'storage-unavailable', persist: false, legacyNewer: false, repair: null, importSave: null });
    expect(writes).toBe(0);
  });
});

/* ---------- Verstümmelte alte Stände ---------- */

/** Kleiner Zufallsgenerator mit festem Keim (mulberry32), damit die Fassungen reproduzierbar sind. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Path = Array<string | number>;

/** Alle Pfade zu Feldern und Listeneinträgen (nicht die Wurzel). */
function pathsOf(value: unknown, prefix: Path = []): Path[] {
  if (value === null || typeof value !== 'object') return [];
  const keys: Array<string | number> = Array.isArray(value) ? value.map((_, i) => i) : Object.keys(value);
  return keys.flatMap((k) => {
    const path = [...prefix, k];
    return [path, ...pathsOf((value as Record<string | number, unknown>)[k], path)];
  });
}

const REPLACEMENTS: readonly unknown[] = [null, 0, -1, 3.5, 1e308, '', 'x', 'forest', true, [], {}];

/** Eine verstümmelte Fassung: ein bis drei Felder entfernt oder ersetzt. */
function mutate(template: unknown, rand: () => number): unknown {
  const copy = structuredClone(template);
  const ops = 1 + Math.floor(rand() * 3);
  for (let i = 0; i < ops; i++) {
    const paths = pathsOf(copy);
    if (paths.length === 0) break;
    const path = paths[Math.floor(rand() * paths.length)]!;
    let parent = copy as Record<string | number, unknown>;
    for (const k of path.slice(0, -1)) parent = parent[k] as Record<string | number, unknown>;
    const last = path[path.length - 1]!;
    if (rand() < 0.3) {
      if (Array.isArray(parent)) parent.splice(last as number, 1);
      else delete parent[last];
    } else {
      parent[last] = structuredClone(REPLACEMENTS[Math.floor(rand() * REPLACEMENTS.length)]);
    }
  }
  return copy;
}

/** Zehn verschiedene Fassungen je Vorlage, aus dem Keim reproduzierbar. */
function variantsOf(template: unknown, seed: number): string[] {
  const rand = seeded(seed);
  const original = JSON.stringify(template);
  const out: string[] = [];
  for (let tries = 0; out.length < 10 && tries < 1000; tries++) {
    const text = JSON.stringify(mutate(template, rand));
    if (text !== original && !out.includes(text)) out.push(text);
  }
  return out;
}

const TEMPLATES = {
  LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_NGPLUS, LEGACY_PARTIAL, LEGACY_LONG_INVENTORY, LEGACY_NGPLUS_REAL,
};

describe('startGame mit jeder Form eines alten Stands', () => {
  it('die Fassungen sind reproduzierbar und wirklich verschieden', () => {
    for (const [i, template] of Object.values(TEMPLATES).entries()) {
      const a = variantsOf(template, 1000 + i);
      expect(a).toHaveLength(10);
      expect(new Set(a).size).toBe(10);
      expect(variantsOf(template, 1000 + i)).toEqual(a);
    }
  });

  for (const [i, [name, template]] of Object.entries(TEMPLATES).entries()) {
    it(`${name} und zehn verstümmelte Fassungen: Stand ohne Verlust, alte Schlüssel nie geschrieben`, () => {
      for (const legacyText of [JSON.stringify(template), ...variantsOf(template, 1000 + i)]) {
        const m = mem({ [LEGACY_SAVE_KEY]: legacyText, [LEGACY_MUTED_KEY]: 'true' });
        const start = startGame(new SaveStore(m), NOW);
        expect(start.notice, legacyText).toBe('legacy-imported');
        const normalized = normalizeState(JSON.parse(JSON.stringify(start.state)));
        expect(normalized, legacyText).not.toBeNull();
        expect(normalized!.report.lossy, legacyText).toBe(false);
        expect(m.writesTo(SAVE_KEY), legacyText).toBe(1);
        expect(m.writesTo(LEGACY_SAVE_KEY), legacyText).toBe(0);
        expect(m.writesTo(LEGACY_MUTED_KEY), legacyText).toBe(0);
        expect(m.data.get(LEGACY_SAVE_KEY)).toBe(legacyText);
      }
    });
  }
});
