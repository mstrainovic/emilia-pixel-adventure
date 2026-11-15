import type { GameState } from '../core/state';
import type { Services, StartNotice } from '../core/services';
import type { SaveService } from '../save/service';
import type { SaveResult, SaveStore } from '../save/store';
import { TEXTS } from '../data/texts';
import { el } from './el';
import { keepSnapped } from './grid';
// Baukasten vor menu.css (gleich spezifische Regeln, siehe toasts.ts)
import './kit.css';
import './menu.css';

/** Kennung des Fensters mit dem Hinweis beim Start. */
export const NOTICE_ID = 'notice';
/** Kennung des Fensters mit der Frage nach dem alten Stand. */
export const LEGACY_ID = 'legacy';

/** Text des Hinweises beim Start (TEXTS['notice.<Wert>']). */
export function noticeText(notice: StartNotice): string {
  return TEXTS[`notice.${notice}`];
}

/**
 * Entscheidet, welcher Hinweis ein Speicherergebnis auslöst; jeder höchstens einmal je Sitzung:
 * - zwei Fehlschläge in Folge → „Speichern hat nicht geklappt." (ein Erfolg setzt die Folge zurück);
 * - `blocked-other-tab` → „… in einem anderen Fenster offen …"; zählt nicht als Fehlschlag und setzt die Folge nicht
 *   zurück. Darum eine eigene Zählung statt `SaveService.consecutiveFailures` (die zählt jeden Nicht-Erfolg).
 */
export class SaveAlerts {
  private failures = 0;
  private failedShown = false;
  private otherTabShown = false;

  /** Ergebnis eines Speicherversuchs; liefert den zu zeigenden Text oder `null`. */
  onResult(result: SaveResult): string | null {
    if (result.kind === 'saved') {
      this.failures = 0;
      return null;
    }
    if (result.kind === 'blocked-other-tab') {
      if (this.otherTabShown) return null;
      this.otherTabShown = true;
      return TEXTS['save.otherTab'];
    }
    this.failures += 1;
    return this.failures >= 2 ? this.failed() : null;
  }

  /** Das Sofort-Speichern nach der Übernahme beim Start ist gescheitert: gleich melden (zählt als dieselbe Meldung). */
  importFailed(): string | null {
    return this.failed();
  }

  private failed(): string | null {
    if (this.failedShown) return null;
    this.failedShown = true;
    return TEXTS['save.failed'];
  }
}

/**
 * „Ja" auf die Frage nach dem alten Stand: holen, den gespeicherten Stand ersetzen (der bisherige liegt danach unter
 * BACKUP_SAVE_KEY), dann das Speichern anhalten – sonst schriebe das Speichern beim Verlassen der Seite den alten Stand
 * aus dem Arbeitsspeicher über den gerade ersetzten. `true`: jetzt neu laden. `false`: nichts ersetzt, weiterspielen.
 */
export function acceptLegacy(
  store: Pick<SaveStore, 'importLegacy' | 'replaceWith'>, save: Pick<SaveService, 'stop'>, now: number,
): boolean {
  const imported = store.importLegacy(now);
  if (imported.kind !== 'ok') return false;
  if (store.replaceWith(imported.state, now).kind !== 'saved') return false;
  save.stop();
  return true;
}

/**
 * „Nein" oder Schließen: der Zeitstempel des alten Stands wird als abgelehnt gemerkt und gespeichert; gefragt wird
 * erst wieder, wenn sich der alte Stand erneut ändert (SaveStore.legacyOffer).
 */
export function declineLegacy(
  state: GameState, store: Pick<SaveStore, 'legacyStamp'>, save: Pick<SaveService, 'saveNow'>,
): void {
  const stamp = store.legacyStamp();
  if (stamp === null) return;
  state.legacyDeclinedAt = stamp;
  save.saveNow('legacy-declined');
}

/**
 * Zeigt einen Hinweis (Toast), sobald das Spiel läuft: Solange es angehalten ist (Fenster, Gespräch, Dreh-Hinweis),
 * wartet er – so läuft er nicht ungesehen hinter einer Abdunklung ab.
 */
export function toastWhenRunning(services: Pick<Services, 'bus' | 'windows' | 'toasts'>): (text: string, icons?: readonly string[]) => void {
  const { bus, windows } = services;
  const waiting: Array<() => void> = [];
  bus.on('ui:paused', ({ paused }) => {
    if (!paused) for (const show of waiting.splice(0)) show();
  });
  return (text, icons) => {
    const show = (): void => services.toasts.show(text, icons);
    if (windows.paused) waiting.push(show);
    else show();
  };
}

/** Inhalt eines kleinen Fensters: ein Satz und große Knöpfe darunter. */
function noticeBody(text: string, buttons: ReadonlyArray<{ label: string; onClick: () => void }>): HTMLElement {
  const body = el('div', 'notice');
  body.appendChild(el('p', 'notice__text', text));
  const row = el('div', 'notice__buttons');
  for (const b of buttons) {
    const button = el('button', 'ui-button notice__button', b.label);
    button.type = 'button';
    button.addEventListener('click', b.onClick);
    row.appendChild(button);
  }
  body.appendChild(row);
  return body;
}

/**
 * Hinweise zu Start und Speichern:
 * - beim Start der Hinweis aus `startNotice` im Fenster „Hinweis" mit „Gut" (muss bestätigt werden; schließt auch mit
 *   ×, Esc, Tippen daneben); danach, wenn `legacyNewer`, die Frage nach dem alten Stand mit „Ja" und „Nein"
 *   (Schließen zählt als „Nein"). Nie ein Fenster über ein anderes.
 * - Hinweise (Toasts), unabhängig von den Fenstern, je Sitzung höchstens einmal: das Sofort-Speichern der Übernahme
 *   ist gescheitert; zwei Speicherversuche in Folge gescheitert; ein anderer Tab hat gespeichert (SaveAlerts).
 */
export class Notices {
  private readonly alerts = new SaveAlerts();
  private readonly toast: (text: string) => void;

  /** `reload` lädt die Seite neu (nach „Ja"). */
  constructor(private readonly services: Services, private readonly reload: () => void) {
    this.toast = toastWhenRunning(services);
    services.bus.on('save:result', ({ result }) => {
      const text = this.alerts.onResult(result);
      if (text !== null) this.toast(text);
    });
  }

  /** Einmal beim Start, wenn die Oberfläche steht. Erst die Fenster, dann der Hinweis (er wartet, bis sie zu sind). */
  start(): void {
    const { importSave, startNotice, legacyNewer } = this.services;
    const next = (): void => { if (legacyNewer) this.askLegacy(); };
    if (startNotice !== null) this.openWindow(NOTICE_ID, noticeText(startNotice), [{ label: TEXTS['notice.ok'], close: true }], next);
    else next();
    if (importSave !== null && importSave.kind !== 'saved') {
      const text = this.alerts.importFailed();
      if (text !== null) this.toast(text);
    }
  }

  private askLegacy(): void {
    const { store, save, state, windows } = this.services;
    let decided = false;
    const yes = (): void => {
      decided = true;
      if (acceptLegacy(store, save, Date.now())) {
        this.reload();
        return;
      }
      windows.close();
      this.toast(TEXTS['notice.legacy-failed']);
    };
    this.openWindow(LEGACY_ID, TEXTS['legacy.question'], [
      { label: TEXTS['legacy.yes'], close: false, onClick: yes },
      { label: TEXTS['legacy.no'], close: true },
    ], () => { if (!decided) declineLegacy(state, store, save); });
  }

  /** Kleines Fenster mit Satz und Knöpfen; `onClose` läuft bei jedem Schließen (auch ×, Esc, daneben). */
  private openWindow(
    id: string, text: string,
    buttons: ReadonlyArray<{ label: string; close: boolean; onClick?: () => void }>,
    onClose: () => void,
  ): void {
    const { windows } = this.services;
    const body = noticeBody(text, buttons.map((b) => ({
      label: b.label,
      onClick: () => {
        b.onClick?.();
        if (b.close) windows.close();
      },
    })));
    let release: (() => void) | null = null;
    windows.open({
      id, title: TEXTS['notice.title'], body,
      onClose: () => {
        release?.();
        onClose();
      },
    });
    release = keepSnapped(body, () => Array.from(body.querySelectorAll<HTMLElement>('.notice__button')));
  }
}
