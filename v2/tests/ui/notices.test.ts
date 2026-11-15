import { describe, it, expect, vi } from 'vitest';
import { noticeText, SaveAlerts, SaveReplacer, acceptLegacy, declineLegacy } from '../../src/ui/notices';
import { MAX_TOASTS, MIN_SHOWN_MS, displaceDelay, toastDuration } from '../../src/ui/toasts';
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
  it('ein Fehlschlag allein meldet nichts, der zweite in Folge einmal das Fenster „Speichern klappt gerade nicht"', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(UNAVAILABLE)).toBe('failed');
    expect(alerts.onResult(UNAVAILABLE)).toBeNull();
    expect(alerts.onResult(UNAVAILABLE)).toBeNull();
  });

  it('ein Erfolg dazwischen setzt die Folge zurück', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(SAVED)).toBeNull();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(FULL)).toBe('failed');
  });

  it('nach dem Fenster einmal je Sitzung, auch nach einem Erfolg und zwei neuen Fehlschlägen nicht wieder', () => {
    const alerts = new SaveAlerts();
    alerts.onResult(FULL);
    alerts.onResult(FULL);
    alerts.onResult(SAVED);
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(FULL)).toBeNull();
  });

  it('anderer Tab: beim ersten Mal das Fenster; zählt weder als Fehlschlag noch setzt es die Folge zurück', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(OTHER_TAB)).toBe('other-tab');
    // das Fenster ist offen (oder wartet): kein zweites
    expect(alerts.onResult(OTHER_TAB)).toBeNull();
    expect(alerts.onResult(FULL)).toBeNull();
    expect(alerts.onResult(OTHER_TAB)).toBeNull();
    expect(alerts.onResult(FULL)).toBe('failed');
  });

  it('anderer Tab, ohne Neuladen geschlossen: wieder beim nächsten gesperrten Versuch', () => {
    const alerts = new SaveAlerts();
    expect(alerts.onResult(OTHER_TAB)).toBe('other-tab');
    alerts.otherTabClosed();
    expect(alerts.onResult(OTHER_TAB)).toBe('other-tab');
    expect(alerts.onResult(OTHER_TAB)).toBeNull();
    alerts.otherTabClosed();
    expect(alerts.onResult(OTHER_TAB)).toBe('other-tab');
  });

  it('anderer Tab, ohne Neuladen geschlossen: wieder, sobald die Seite sichtbar wird und weiter gesperrt ist', () => {
    const alerts = new SaveAlerts();
    // noch nie gesperrt: sichtbar werden zeigt nichts
    expect(alerts.onVisible()).toBeNull();
    alerts.onResult(OTHER_TAB);
    // offen: sichtbar werden zeigt kein zweites
    expect(alerts.onVisible()).toBeNull();
    alerts.otherTabClosed();
    expect(alerts.onVisible()).toBe('other-tab');
    expect(alerts.onVisible()).toBeNull();
    alerts.otherTabClosed();
    // inzwischen wieder gespeichert: nicht mehr gesperrt, kein Fenster
    alerts.onResult(SAVED);
    expect(alerts.onVisible()).toBeNull();
    // erneut gesperrt: wieder das Fenster
    expect(alerts.onResult(OTHER_TAB)).toBe('other-tab');
  });

  it('das Sofort-Speichern nach der Übernahme scheitert: gleich das Fenster, später nicht noch einmal', () => {
    const alerts = new SaveAlerts();
    expect(alerts.importFailed()).toBe('failed');
    expect(alerts.importFailed()).toBeNull();
    alerts.onResult(FULL);
    expect(alerts.onResult(FULL)).toBeNull();
  });

  it('Marke „Nicht gespeichert": an, solange das letzte Ergebnis nicht `saved` ist', () => {
    const alerts = new SaveAlerts();
    expect(alerts.unsaved).toBe(false);
    alerts.onResult(FULL);
    expect(alerts.unsaved).toBe(true);
    alerts.onResult(SAVED);
    expect(alerts.unsaved).toBe(false);
    alerts.onResult(OTHER_TAB);
    expect(alerts.unsaved).toBe(true);
    alerts.onResult(UNAVAILABLE);
    expect(alerts.unsaved).toBe(true);
    alerts.onResult({ kind: 'blocked-newer', storedVersion: 2 });
    expect(alerts.unsaved).toBe(true);
    alerts.onResult(SAVED);
    expect(alerts.unsaved).toBe(false);
  });

  it('Marke beim Start: an in einer Sitzung ohne Speichern und nach gescheitertem Sofort-Speichern der Übernahme', () => {
    expect(new SaveAlerts({ persist: true, importSave: null }).unsaved).toBe(false);
    expect(new SaveAlerts({ persist: true, importSave: SAVED }).unsaved).toBe(false);
    expect(new SaveAlerts({ persist: true, importSave: FULL }).unsaved).toBe(true);
    expect(new SaveAlerts({ persist: false, importSave: null }).unsaved).toBe(true);
  });
});

describe('Hinweise (Toasts): Dauer nach Länge, kein Verdrängen vor 3 s', () => {
  it('Dauer = max(5 s, 4 s + 0,6 s je Wort)', () => {
    expect(toastDuration('Level 2!')).toBe(5000);
    expect(toastDuration('Aufgabe geschafft!')).toBe(5200);
    expect(toastDuration('Hier geht es bald weiter.')).toBe(6400);
    expect(toastDuration(TEXTS['backup.remind'])).toBe(4000 + 600 * 10);
    // Leerzeichen am Rand und doppelte Leerzeichen zählen nicht als Wörter
    expect(toastDuration('  ein   zwei   drei  ')).toBe(5800);
  });

  it('ist Platz frei, kommt ein neuer Hinweis sofort', () => {
    expect(displaceDelay([], 1000)).toBe(0);
    expect(displaceDelay(Array.from({ length: MAX_TOASTS - 1 }, () => 990), 1000)).toBe(0);
  });

  it('sind alle Plätze belegt, wartet er, bis der älteste 3 s stand – dann verdrängt er ihn', () => {
    const full = Array.from({ length: MAX_TOASTS }, (_, i) => 1000 + i * 100);
    expect(MIN_SHOWN_MS).toBe(3000);
    expect(displaceDelay(full, 1000)).toBe(3000);
    expect(displaceDelay(full, 2500)).toBe(1500);
    expect(displaceDelay(full, 4000)).toBe(0);
    expect(displaceDelay(full, 9000)).toBe(0);
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
