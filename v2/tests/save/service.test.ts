import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveStore } from '../../src/save/store';
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
    expect(service.saveNow('boss')).toBe(true);
    expect(service.lastReason).toBe('boss');
    expect(store.load()?.savedAt).toBe(5);
  });

  it('ein getState, das wirft, bringt weder Zeitgeber noch Ereignis zu Fall', () => {
    const service = new SaveService(store, () => { throw new Error('kaputt'); }, () => 1);
    service.start(doc, win);
    expect(() => vi.advanceTimersByTime(60_000)).not.toThrow();
    expect(() => win.dispatchEvent(new Event('pagehide'))).not.toThrow();
    expect(service.saveNow('map-change')).toBe(false);
    service.stop();
  });
});
