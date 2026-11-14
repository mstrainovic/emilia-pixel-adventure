import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveStore, type SaveResult } from '../../src/save/store';
import { SaveService } from '../../src/save/service';
import { createNewGameState } from '../../src/core/state';

function mem() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string): string | null => data.get(k) ?? null,
    setItem: (k: string, v: string): void => { data.set(k, v); },
  };
}

function makeDoc() {
  const doc = new EventTarget() as EventTarget & { visibilityState: DocumentVisibilityState };
  doc.visibilityState = 'visible';
  return doc;
}

describe('SaveService', () => {
  const state = createNewGameState(1);
  let store: SaveStore; let doc: ReturnType<typeof makeDoc>; let win: EventTarget;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new SaveStore(mem()); doc = makeDoc(); win = new EventTarget();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('speichert alle 60 Sekunden, beim Verlassen und beim Verstecken', () => {
    const service = new SaveService(store, () => state, () => 123); const spy = vi.spyOn(store, 'save');
    service.start(doc, win);
    vi.advanceTimersByTime(60_000); expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(state, 123);
    win.dispatchEvent(new Event('pagehide')); expect(spy).toHaveBeenCalledTimes(2);
    doc.visibilityState = 'hidden';
    doc.dispatchEvent(new Event('visibilitychange')); expect(spy).toHaveBeenCalledTimes(3);
    service.stop(); vi.advanceTimersByTime(120_000); win.dispatchEvent(new Event('pagehide'));
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('speichert nicht, wenn die Seite wieder sichtbar wird', () => {
    const service = new SaveService(store, () => state, () => 1); const spy = vi.spyOn(store, 'save');
    service.start(doc, win);
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(spy).not.toHaveBeenCalled();
    service.stop();
  });

  it('start() zweimal erzeugt weder zweiten Zeitgeber noch doppelte Hörer', () => {
    const service = new SaveService(store, () => state, () => 1); const spy = vi.spyOn(store, 'save');
    service.start(doc, win); service.start(doc, win);
    vi.advanceTimersByTime(60_000); expect(spy).toHaveBeenCalledTimes(1);
    win.dispatchEvent(new Event('pagehide')); expect(spy).toHaveBeenCalledTimes(2);
    service.stop();
  });

  it('stop() ohne start() ist harmlos', () => {
    const service = new SaveService(store, () => state, () => 1);
    expect(() => service.stop()).not.toThrow();
  });

  it('saveNow gibt das Ergebnis zurück und merkt sich den Grund', () => {
    const service = new SaveService(store, () => state, () => 5);
    expect(service.lastReason).toBeNull();
    expect(service.saveNow('boss')).toEqual({ kind: 'saved' });
    expect(service.lastReason).toBe('boss');
    expect(store.load()).toMatchObject({ kind: 'ok', state: { savedAt: 5 } });
  });

  it('ein getState, das wirft, bringt weder Zeitgeber noch Ereignis zu Fall', () => {
    const service = new SaveService(store, () => { throw new Error('kaputt'); }, () => 1);
    service.start(doc, win);
    expect(() => vi.advanceTimersByTime(60_000)).not.toThrow();
    expect(() => win.dispatchEvent(new Event('pagehide'))).not.toThrow();
    expect(service.saveNow('map-change')).toEqual({ kind: 'unavailable' });
    service.stop();
  });

  it('start, stop, start ergibt genau ein Speichern je Takt und je pagehide', () => {
    const service = new SaveService(store, () => state, () => 1); const spy = vi.spyOn(store, 'save');
    service.start(doc, win); service.stop(); service.start(doc, win);
    vi.advanceTimersByTime(60_000); expect(spy).toHaveBeenCalledTimes(1);
    win.dispatchEvent(new Event('pagehide')); expect(spy).toHaveBeenCalledTimes(2);
    service.stop();
  });

  it('nach einem Takt mit werfendem getState speichert der nächste wieder', () => {
    let broken = true;
    const service = new SaveService(store, () => { if (broken) throw new Error('x'); return state; }, () => 1);
    const spy = vi.spyOn(store, 'save');
    service.start(doc, win);
    vi.advanceTimersByTime(60_000); expect(spy).not.toHaveBeenCalled();
    broken = false;
    vi.advanceTimersByTime(60_000); expect(spy).toHaveBeenCalledTimes(1);
    service.stop();
  });

  it('lastReason ist von außen nur lesbar', () => {
    const service = new SaveService(store, () => state, () => 1);
    service.saveNow('quest');
    expect(() => { (service as unknown as { lastReason: string }).lastReason = 'x'; }).toThrow();
    expect(service.lastReason).toBe('quest');
  });
});

describe('SaveService: Ergebnisse', () => {
  const state = createNewGameState(1);

  function storeReturning(...results: SaveResult[]) {
    const queue = [...results];
    return { save: () => queue.shift() ?? { kind: 'saved' } } as unknown as SaveStore;
  }

  it('meldet Grund und Ergebnis an onResult', () => {
    const calls: Array<[string, SaveResult]> = [];
    const service = new SaveService(storeReturning({ kind: 'full' }), () => state, () => 1, (r, res) => { calls.push([r, res]); });
    service.saveNow('quest'); service.saveNow('boss');
    expect(calls).toEqual([['quest', { kind: 'full' }], ['boss', { kind: 'saved' }]]);
  });

  it('zählt Fehlschläge in Folge und setzt nach einem Erfolg zurück', () => {
    const service = new SaveService(
      storeReturning({ kind: 'full' }, { kind: 'unavailable' }, { kind: 'saved' }, { kind: 'blocked-newer', storedVersion: 2 }),
      () => state, () => 1);
    expect(service.consecutiveFailures).toBe(0);
    service.saveNow('timer'); expect(service.consecutiveFailures).toBe(1);
    service.saveNow('timer'); expect(service.consecutiveFailures).toBe(2);
    service.saveNow('timer'); expect(service.consecutiveFailures).toBe(0);
    service.saveNow('timer'); expect(service.consecutiveFailures).toBe(1);
  });

  it('liefert unavailable und zählt, wenn getState wirft; nichts wirft', () => {
    const seen: SaveResult[] = [];
    const service = new SaveService(storeReturning(), () => { throw new Error('kaputt'); }, () => 1, (_r, res) => { seen.push(res); });
    expect(() => service.saveNow('timer')).not.toThrow();
    expect(service.saveNow('timer')).toEqual({ kind: 'unavailable' });
    expect(service.consecutiveFailures).toBe(2);
    expect(seen).toEqual([{ kind: 'unavailable' }, { kind: 'unavailable' }]);
  });

  it('übersteht einen onResult, der wirft', () => {
    const service = new SaveService(storeReturning(), () => state, () => 1, () => { throw new Error('x'); });
    expect(service.saveNow('timer')).toEqual({ kind: 'saved' });
    expect(service.consecutiveFailures).toBe(0);
  });
});
