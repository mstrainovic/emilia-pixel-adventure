import { describe, it, expect, vi } from 'vitest';
import { exportBackup } from '../../src/ui/backup';
import { SaveReplacer } from '../../src/ui/notices';
import { createNewGameState, type GameState } from '../../src/core/state';
import type { StartNotice } from '../../src/core/services';
import { BACKUP_SAVE_KEY, SAVE_KEY, SaveStore, parseImport, type SaveResult } from '../../src/save/store';

const NOW = new Date(2026, 10, 13, 9, 0).getTime();

describe('exportBackup („Spielstand sichern")', () => {
  function run(persist: boolean, result: SaveResult = { kind: 'saved' }, startNotice: StartNotice | null = null) {
    const calls: string[] = [];
    const state = createNewGameState(5);
    const save = { saveNow: vi.fn(() => { calls.push(`saveNow:${String(state.lastBackupAt)}`); return result; }) };
    const files: Array<{ filename: string; text: string }> = [];
    const done = exportBackup({ state, persist, save, startNotice }, (filename, text) => { calls.push('download'); files.push({ filename, text }); }, NOW);
    return { calls, state, save, files, done };
  }

  it('setzt lastBackupAt, speichert, lädt dann herunter – die Datei trägt den Zeitpunkt', () => {
    const { calls, state, save, files, done } = run(true);
    expect(done).toBe(true);
    expect(calls).toEqual([`saveNow:${NOW}`, 'download']);
    expect(save.saveNow).toHaveBeenCalledWith('backup');
    expect(state.lastBackupAt).toBe(NOW);
    expect(files).toHaveLength(1);
    expect(files[0]!.filename).toBe('emilia2-spielstand-2026-11-13.json');
    const parsed = JSON.parse(files[0]!.text) as GameState;
    expect(parsed.formatVersion).toBe(1);
    expect(parsed.lastBackupAt).toBe(NOW);
    // die Datei lässt sich wieder laden
    expect(parseImport(files[0]!.text, NOW)?.lastBackupAt).toBe(NOW);
  });

  it('Speichern scheitert: die Datei kommt trotzdem', () => {
    const { calls, files } = run(true, { kind: 'full' });
    expect(calls).toEqual([`saveNow:${NOW}`, 'download']);
    expect(files).toHaveLength(1);
  });

  it('Sitzung ohne Speichern (Speicher nicht lesbar): kein Speicherversuch, die Datei mit dem jetzigen Stand kommt', () => {
    const { calls, save, files, done } = run(false, { kind: 'saved' }, 'storage-unavailable');
    expect(done).toBe(true);
    expect(save.saveNow).not.toHaveBeenCalled();
    expect(calls).toEqual(['download']);
    expect((JSON.parse(files[0]!.text) as GameState).lastBackupAt).toBe(NOW);
  });

  it('Sitzung mit neuerem Spielstand (save-newer): keine Datei, kein Speicherversuch, der Stand bleibt unberührt', () => {
    const { calls, state, save, files, done } = run(false, { kind: 'saved' }, 'save-newer');
    expect(done).toBe(false);
    expect(save.saveNow).not.toHaveBeenCalled();
    expect(files).toEqual([]);
    expect(calls).toEqual([]);
    expect(state.lastBackupAt).toBeNull();
  });
});

describe('SaveReplacer (Laden aus Datei und Übernahme des alten Stands)', () => {
  const loaded = createNewGameState(9);

  function fakes(replaced: SaveResult, persist = true) {
    const calls: string[] = [];
    const store = {
      replaceWith: vi.fn((state: GameState, now: number) => { calls.push(`replaceWith:${now}:${state === loaded}`); return replaced; }),
    };
    const save = { stop: vi.fn(() => { calls.push('stop'); }) };
    return { calls, replacer: new SaveReplacer(store, save, persist) };
  }

  it('ersetzt, hält dann das Speichern an – in dieser Reihenfolge', () => {
    const { calls, replacer } = fakes({ kind: 'saved' });
    expect(replacer.replace(loaded, 77)).toBe('replaced');
    expect(replacer.replaced).toBe(true);
    expect(calls).toEqual(['replaceWith:77:true', 'stop']);
  });

  it.each<SaveResult>([{ kind: 'full' }, { kind: 'unavailable' }, { kind: 'blocked-newer', storedVersion: 2 }])(
    'Ersetzen scheitert (%o): Speichern läuft weiter, kein Neuladen, ein neuer Versuch ist möglich',
    (result) => {
      const { calls, replacer } = fakes(result);
      expect(replacer.replace(loaded, 77)).toBe('failed');
      expect(replacer.replace(loaded, 78)).toBe('failed');
      expect(replacer.replaced).toBe(false);
      expect(calls).toEqual(['replaceWith:77:true', 'replaceWith:78:true']);
    },
  );

  it('Sitzung ohne Speichern: ersetzt nie, auch wenn der Speicher inzwischen schreiben könnte', () => {
    const { calls, replacer } = fakes({ kind: 'saved' }, false);
    expect(replacer.replace(loaded, 77)).toBe('failed');
    expect(calls).toEqual([]);
  });

  it('doppelt getippt („Ja" zweimal vor dem Neuladen): nur einmal ersetzt, die Sicherung bleibt der vorige Stand', () => {
    const storage = memory();
    const store = new SaveStore(storage);
    const previous = createNewGameState(1);
    previous.progression.completedQuests = ['first_steps'];
    expect(store.save(previous, 2).kind).toBe('saved');
    const previousRaw = storage.getItem(SAVE_KEY);
    const replaceWith = vi.spyOn(store, 'replaceWith');
    const save = { stop: vi.fn() };
    const replacer = new SaveReplacer(store, save, true);
    expect(replacer.replace(loaded, 10)).toBe('replaced');
    expect(replacer.replace(loaded, 11)).toBe('busy');
    expect(replaceWith).toHaveBeenCalledTimes(1);
    expect(save.stop).toHaveBeenCalledTimes(1);
    expect(storage.getItem(BACKUP_SAVE_KEY)).toBe(previousRaw);
    expect(JSON.parse(storage.getItem(SAVE_KEY)!).progression.completedQuests).toEqual([]);
  });
});

/** Speicher im Arbeitsspeicher (wie localStorage, nur getItem/setItem). */
function memory(entries: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> {
  const map = new Map(Object.entries(entries));
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => { map.set(k, v); } };
}
