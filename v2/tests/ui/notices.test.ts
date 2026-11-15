import { describe, it, expect, vi } from 'vitest';
import { noticeText, SaveAlerts, SaveReplacer, acceptLegacy, declineLegacy } from '../../src/ui/notices';
import { LEGACY_FIRST_COMMIT } from '../save/legacySaves';
import { LEGACY_SAVE_KEY } from '../../src/save/legacy';
import { TEXTS } from '../../src/data/texts';
import { createNewGameState, type GameState } from '../../src/core/state';
import type { StartNotice } from '../../src/core/services';
import { BACKUP_SAVE_KEY, SAVE_KEY, SaveStore, type SaveResult } from '../../src/save/store';

const SAVED: SaveResult = { kind: 'saved' };
const FULL: SaveResult = { kind: 'full' };
const UNAVAILABLE: SaveResult = { kind: 'unavailable' };
const OTHER_TAB: SaveResult = { kind: 'blocked-other-tab' };

describe('noticeText', () => {
  it('jeder Hinweis beim Start hat seinen Text aus TEXTS', () => {
    const all: StartNotice[] = ['save-corrupt', 'save-corrupt-legacy', 'save-repaired', 'save-newer',
      'storage-unavailable', 'legacy-imported', 'legacy-failed'];
    for (const n of all) expect(noticeText(n), n).toBe(TEXTS[`notice.${n}`]);
    expect(new Set(all.map(noticeText)).size).toBe(all.length);
  });
});

describe('SaveAlerts', () => {
  it('ein Fehlschlag allein meldet nichts, der zweite in Folge einmal „Speichern hat nicht geklappt."', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(UNAVAILABLE)).toBe(TEXTS['save.failed']);
    expect(alerts.onResult(UNAVAILABLE)).toBeNull();
    expect(alerts.onResult(UNAVAILABLE)).toBeNull();
  });

  it('ein Erfolg dazwischen setzt die Folge zurück', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(SAVED)).toBeNull();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(FULL)).toBe(TEXTS['save.failed']);
  });

  it('nach der Meldung einmal je Sitzung, auch nach einem Erfolg und zwei neuen Fehlschlägen nicht wieder', () => {
    const alerts = new SaveAlerts();
    alerts.onResult(FULL);
    alerts.onResult(FULL);
    alerts.onResult(SAVED);
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(FULL)).toBeNull();
  });

  it('anderer Tab: einmal je Sitzung der eigene Hinweis; zählt weder als Fehlschlag noch setzt es die Folge zurück', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(OTHER_TAB)).toBe(TEXTS['save.otherTab']);
    expect(alerts.onResult(OTHER_TAB)).toBeNull();
    expect(alerts.onResult(OTHER_TAB)).toBeNull();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(OTHER_TAB)).toBeNull();
    expect(alerts.onResult(FULL)).toBe(TEXTS['save.failed']);
  });

  it('das Sofort-Speichern nach der Übernahme scheitert: gleich „Speichern hat nicht geklappt.", später nicht noch einmal', () => {
    const alerts = new SaveAlerts();
    expect(alerts.importFailed()).toBe(TEXTS['save.failed']);
    expect(alerts.importFailed()).toBeNull();
    alerts.onResult(FULL);
    expect(alerts.onResult(FULL)).toBeNull();
  });
});

describe('acceptLegacy („Ja" auf die Frage nach dem alten Stand)', () => {
  const imported = createNewGameState(9);

  function fakes(importKind: 'ok' | 'none' | 'unreadable', replaced: SaveResult) {
    const calls: string[] = [];
    const store = {
      importLegacy: vi.fn((now: number) => {
        calls.push(`importLegacy:${now}`);
        return importKind === 'ok'
          ? { kind: 'ok' as const, state: imported, report: { droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [], cutItems: [] } }
          : { kind: importKind };
      }),
      replaceWith: vi.fn((state: GameState, now: number) => {
        calls.push(`replaceWith:${now}:${state === imported}`);
        return replaced;
      }),
    };
    const save = { stop: vi.fn(() => { calls.push('stop'); }) };
    return { calls, store, replacer: new SaveReplacer(store, save, true) };
  }

  it('holt, ersetzt, hält dann das Speichern an – in dieser Reihenfolge', () => {
    const { calls, store, replacer } = fakes('ok', SAVED);
    expect(acceptLegacy(store, replacer, 77)).toBe('replaced');
    expect(calls).toEqual(['importLegacy:77', 'replaceWith:77:true', 'stop']);
  });

  it('alter Stand nicht lesbar: nichts ersetzt, Speichern läuft weiter', () => {
    const { calls, store, replacer } = fakes('unreadable', SAVED);
    expect(acceptLegacy(store, replacer, 77)).toBe('failed');
    expect(calls).toEqual(['importLegacy:77']);
  });

  it('Ersetzen scheitert: Speichern läuft weiter (kein Neuladen)', () => {
    const { calls, store, replacer } = fakes('ok', FULL);
    expect(acceptLegacy(store, replacer, 77)).toBe('failed');
    expect(calls).toEqual(['importLegacy:77', 'replaceWith:77:true']);
  });

  it('doppelt getippt: nur einmal ersetzt, unter BACKUP_SAVE_KEY bleibt der vorige v2-Stand', () => {
    const map = new Map<string, string>([[LEGACY_SAVE_KEY, JSON.stringify(LEGACY_FIRST_COMMIT)]]);
    const storage = { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } };
    const store = new SaveStore(storage);
    const previous = createNewGameState(1);
    previous.progression.completedQuests = ['first_steps'];
    expect(store.save(previous, 2).kind).toBe('saved');
    const previousRaw = map.get(SAVE_KEY);
    const replaceWith = vi.spyOn(store, 'replaceWith');
    const save = { stop: vi.fn() };
    const replacer = new SaveReplacer(store, save, true);
    expect(acceptLegacy(store, replacer, 10)).toBe('replaced');
    expect(acceptLegacy(store, replacer, 11)).toBe('busy');
    expect(replaceWith).toHaveBeenCalledTimes(1);
    expect(save.stop).toHaveBeenCalledTimes(1);
    expect(map.get(BACKUP_SAVE_KEY)).toBe(previousRaw);
  });
});

describe('declineLegacy („Nein" oder Schließen)', () => {
  it('merkt sich den Zeitstempel des alten Stands und speichert', () => {
    const state = createNewGameState(1);
    const save = { saveNow: vi.fn(() => SAVED) };
    declineLegacy(state, { legacyStamp: () => 4321 }, save);
    expect(state.legacyDeclinedAt).toBe(4321);
    expect(save.saveNow).toHaveBeenCalledTimes(1);
    expect(save.saveNow).toHaveBeenCalledWith('legacy-declined');
  });

  it('ohne lesbaren Zeitstempel bleibt der Stand unverändert und es wird nicht gespeichert', () => {
    const state = createNewGameState(1);
    const save = { saveNow: vi.fn(() => SAVED) };
    declineLegacy(state, { legacyStamp: () => null }, save);
    expect(state.legacyDeclinedAt).toBeNull();
    expect(save.saveNow).not.toHaveBeenCalled();
  });
});
