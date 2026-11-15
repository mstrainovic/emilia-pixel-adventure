import { describe, it, expect, vi } from 'vitest';
import { exportBackup } from '../../src/ui/backup';
import { replaceSaved } from '../../src/ui/notices';
import { createNewGameState, type GameState } from '../../src/core/state';
import { parseImport, type SaveResult } from '../../src/save/store';

const NOW = new Date(2026, 10, 13, 9, 0).getTime();

describe('exportBackup („Spielstand sichern")', () => {
  function run(persist: boolean, result: SaveResult = { kind: 'saved' }) {
    const calls: string[] = [];
    const state = createNewGameState(5);
    const save = { saveNow: vi.fn(() => { calls.push(`saveNow:${String(state.lastBackupAt)}`); return result; }) };
    const files: Array<{ filename: string; text: string }> = [];
    exportBackup({ state, persist, save }, (filename, text) => { calls.push('download'); files.push({ filename, text }); }, NOW);
    return { calls, state, save, files };
  }

  it('setzt lastBackupAt, speichert, lädt dann herunter – die Datei trägt den Zeitpunkt', () => {
    const { calls, state, save, files } = run(true);
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

  it('Sitzung ohne Speichern: kein Speicherversuch, die Datei mit dem jetzigen Stand kommt', () => {
    const { calls, save, files } = run(false);
    expect(save.saveNow).not.toHaveBeenCalled();
    expect(calls).toEqual(['download']);
    expect((JSON.parse(files[0]!.text) as GameState).lastBackupAt).toBe(NOW);
  });
});

describe('replaceSaved (Laden aus Datei und Übernahme des alten Stands)', () => {
  const loaded = createNewGameState(9);

  function fakes(replaced: SaveResult) {
    const calls: string[] = [];
    const store = {
      replaceWith: vi.fn((state: GameState, now: number) => { calls.push(`replaceWith:${now}:${state === loaded}`); return replaced; }),
    };
    const save = { stop: vi.fn(() => { calls.push('stop'); }) };
    return { calls, store, save };
  }

  it('ersetzt, hält dann das Speichern an – in dieser Reihenfolge', () => {
    const { calls, store, save } = fakes({ kind: 'saved' });
    expect(replaceSaved(store, save, loaded, 77)).toBe(true);
    expect(calls).toEqual(['replaceWith:77:true', 'stop']);
  });

  it.each<SaveResult>([{ kind: 'full' }, { kind: 'unavailable' }, { kind: 'blocked-newer', storedVersion: 2 }])(
    'Ersetzen scheitert (%o): Speichern läuft weiter, kein Neuladen',
    (result) => {
      const { calls, store, save } = fakes(result);
      expect(replaceSaved(store, save, loaded, 77)).toBe(false);
      expect(calls).toEqual(['replaceWith:77:true']);
    },
  );
});
