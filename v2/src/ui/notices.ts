import type { GameState } from '../core/state';
import type { Services, StartNotice } from '../core/services';
import type { SaveService } from '../save/service';
import type { SaveResult, SaveStore } from '../save/store';
import { TEXTS } from '../data/texts';
import { el } from './el';
import { keepSnapped } from './grid';
import type { WindowManager } from './windows';
// Baukasten vor menu.css (gleich spezifische Regeln, siehe toasts.ts)
import './kit.css';
import './menu.css';

/** Kennung des Fensters mit dem Hinweis beim Start. */
export const NOTICE_ID = 'notice';
/** Kennung des Fensters mit der Frage nach dem alten Stand. */
export const LEGACY_ID = 'legacy';
/** Kennungen der Fenster zum Speichern (Fix-Welle F1, F2). */
export const OTHER_TAB_ID = 'save-other-tab';
export const SAVE_FAILED_ID = 'save-failed';

/** Text des Hinweises beim Start (TEXTS['notice.<Wert>']). */
export function noticeText(notice: StartNotice): string {
  return TEXTS[`notice.${notice}`];
}

/** Was ein Speicherergebnis auslöst: das Fenster zum anderen Tab oder das Fenster „Speichern klappt gerade nicht". */
export type SaveAlert = 'other-tab' | 'failed';

/**
 * Entscheidet, welches Fenster ein Speicherergebnis auslöst, und ob die Marke „Nicht gespeichert" steht:
 * - zwei Fehlschläge in Folge → einmal je Sitzung `failed` (ein Erfolg setzt die Folge zurück);
 * - `blocked-other-tab` → `other-tab`; zählt nicht als Fehlschlag und setzt die Folge nicht zurück. Darum eine eigene
 *   Zählung statt `SaveService.consecutiveFailures` (die zählt jeden Nicht-Erfolg). Dieser Tab speichert danach bis
 *   zum Neuladen nicht mehr: Wird das Fenster ohne Neuladen geschlossen (`otherTabClosed`), kommt es wieder beim
 *   nächsten gesperrten Versuch oder sobald die Seite sichtbar wird und weiter gesperrt ist (`onVisible`). Solange es
 *   offen ist oder auf seinen Platz wartet, kein zweites.
 * - `unsaved`: das letzte Ergebnis ist nicht `saved`; beim Start auch in einer Sitzung ohne Speichern und nach
 *   gescheitertem Sofort-Speichern der Übernahme.
 */
export class SaveAlerts {
  private failures = 0;
  private failedShown = false;
  private otherTab: 'none' | 'open' | 'dismissed' = 'none';
  private blocked = false;
  private notSaved: boolean;

  constructor(start: { persist: boolean; importSave: SaveResult | null } = { persist: true, importSave: null }) {
    this.notSaved = !start.persist || (start.importSave !== null && start.importSave.kind !== 'saved');
  }

  /** Ergebnis eines Speicherversuchs; liefert das zu öffnende Fenster oder `null`. */
  onResult(result: SaveResult): SaveAlert | null {
    this.notSaved = result.kind !== 'saved';
    this.blocked = result.kind === 'blocked-other-tab';
    if (result.kind === 'saved') {
      this.failures = 0;
      if (this.otherTab === 'dismissed') this.otherTab = 'none';
      return null;
    }
    if (result.kind === 'blocked-other-tab') return this.showOtherTab();
    this.failures += 1;
    return this.failures >= 2 ? this.failed() : null;
  }

  /** Das Fenster zum anderen Tab wurde ohne Neuladen geschlossen (×, Esc). */
  otherTabClosed(): void {
    if (this.otherTab === 'open') this.otherTab = 'dismissed';
  }

  /** Die Seite ist wieder sichtbar: das Fenster zum anderen Tab erneut, wenn es weggeklickt wurde und weiter gesperrt ist. */
  onVisible(): SaveAlert | null {
    return this.otherTab === 'dismissed' && this.blocked ? this.showOtherTab() : null;
  }

  /** Das Sofort-Speichern nach der Übernahme beim Start ist gescheitert: gleich melden (zählt als dieselbe Meldung). */
  importFailed(): SaveAlert | null {
    return this.failed();
  }

  /** Marke „Nicht gespeichert" zeigen? */
  get unsaved(): boolean {
    return this.notSaved;
  }

  private showOtherTab(): SaveAlert | null {
    if (this.otherTab === 'open') return null;
    this.otherTab = 'open';
    return 'other-tab';
  }

  private failed(): SaveAlert | null {
    if (this.failedShown) return null;
    this.failedShown = true;
    return 'failed';
  }
}

/**
 * Ausgang von SaveReplacer.replace: `replaced` – jetzt neu laden; `failed` – nichts ersetzt, das Speichern läuft
 * weiter; `busy` – schon ersetzt, die Seite lädt gleich neu: nichts tun.
 */
export type ReplaceOutcome = 'replaced' | 'failed' | 'busy';

/**
 * Ersetzt den gespeicherten Stand (der bisherige liegt danach unter BACKUP_SAVE_KEY) und hält dann das Speichern an –
 * sonst schriebe das Speichern beim Verlassen der Seite den alten Stand aus dem Arbeitsspeicher über den gerade
 * ersetzten (Plan 1b, Vorab 4). Eine Stelle je Sitzung für die Übernahme des alten Stands (Notices) und das Laden aus
 * Datei (backup.ts), mit zwei Sperren:
 * - Höchstens einmal: Bis die Seite neu lädt, bleibt „Ja" bedienbar. Ein zweites Ersetzen (Doppeltippen) legte den
 *   eben geladenen Stand unter BACKUP_SAVE_KEY und der vorige ginge verloren.
 * - In einer Sitzung, die nicht speichern darf (`persist` falsch), nie – auch wenn der Speicher inzwischen wieder
 *   lesbar und beschreibbar wäre.
 */
export class SaveReplacer {
  private done = false;

  constructor(
    private readonly store: Pick<SaveStore, 'replaceWith'>,
    private readonly save: Pick<SaveService, 'stop'>,
    private readonly persist: boolean,
  ) {}

  /** Wahr, sobald ersetzt wurde (die Seite lädt dann neu). */
  get replaced(): boolean {
    return this.done;
  }

  replace(state: GameState, now: number): ReplaceOutcome {
    if (this.done) return 'busy';
    if (!this.persist) return 'failed';
    if (this.store.replaceWith(state, now).kind !== 'saved') return 'failed';
    this.done = true;
    this.save.stop();
    return 'replaced';
  }
}

/** „Ja" auf die Frage nach dem alten Stand: holen, dann ersetzen (SaveReplacer). */
export function acceptLegacy(store: Pick<SaveStore, 'importLegacy'>, replacer: SaveReplacer, now: number): ReplaceOutcome {
  if (replacer.replaced) return 'busy';
  const imported = store.importLegacy(now);
  if (imported.kind !== 'ok') return 'failed';
  return replacer.replace(imported.state, now);
}

/**
 * „Nein" (nur der Knopf; × und Esc heißen „später"): der Zeitstempel des alten Stands wird als abgelehnt gemerkt und
 * gespeichert; gefragt wird erst wieder, wenn sich der alte Stand erneut ändert (SaveStore.legacyOffer).
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

/**
 * Öffnet ein Fenster erst, wenn keins offen ist und das Spiel läuft (kein Gespräch, kein Dreh-Hinweis): nie über einem
 * anderen Fenster oder einem Gespräch, sondern danach, in der Reihenfolge der Aufrufe. Versucht wird erst nach dem
 * laufenden Ablauf (Mikroaufgabe): Schließt ein Fenster und öffnet sein `onClose` gleich das nächste (Hinweis beim
 * Start → Frage zum alten Spiel), kommt das wartende erst nach diesem.
 */
export function windowWhenFree(services: Pick<Services, 'bus' | 'windows'>): (open: () => void) => void {
  const { bus, windows } = services;
  const waiting: Array<() => void> = [];
  let scheduled = false;
  const run = (): void => {
    scheduled = false;
    while (waiting.length > 0 && !windows.paused && windows.openId === null) waiting.shift()!();
  };
  const schedule = (): void => {
    if (scheduled || waiting.length === 0) return;
    scheduled = true;
    queueMicrotask(run);
  };
  bus.on('ui:paused', ({ paused }) => { if (!paused) schedule(); });
  return (open) => {
    waiting.push(open);
    schedule();
  };
}

/** Ein Knopf eines kleinen Fensters; `close`: schließt danach das Fenster. */
export interface NoticeButton { label: string; close: boolean; onClick?: () => void }

/** Ein kleines Fenster: Titel, ein Satz, große Knöpfe darunter. */
export interface NoticeSpec {
  id: string;
  title: string;
  text: string;
  buttons: readonly NoticeButton[];
  /** Läuft bei jedem Schließen (auch ×, Esc, daneben, ersetzt). */
  onClose?: () => void;
  /** `buttons`: Frage oder Hinweis zum Speichern – kein Schließen durch Tippen daneben, Fokus auf dem Titel. */
  dismiss?: 'any' | 'buttons';
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
 * - beim Start der Hinweis aus `startNotice` im Fenster „Hinweis" mit „Okay" (bei `save-newer` dazu „Neu laden");
 *   schließt auch mit ×, Esc, Tippen daneben. Danach, wenn `legacyNewer`, die Frage „Alter Spielstand" mit „Ja" und
 *   „Nein": nur „Nein" merkt die Ablehnung; × und Esc heißen „später", gefragt wird beim nächsten Start wieder.
 * - Fenster zum Speichern, nie über einem anderen Fenster oder Gespräch (windowWhenFree): anderer Tab mit „Neu laden"
 *   (SaveAlerts entscheidet, wann erneut); Speichern oder Sofort-Speichern der Übernahme gescheitert, mit „Okay",
 *   einmal je Sitzung.
 * - die Marke „Nicht gespeichert" in der Anzeige (`hud.setUnsaved`).
 */
export class Notices {
  private readonly alerts: SaveAlerts;
  private readonly toast: (text: string) => void;
  private readonly whenFree: (open: () => void) => void;

  /** `reload` lädt die Seite neu (nach „Ja" oder „Neu laden"). */
  constructor(private readonly services: Services, private readonly reload: () => void, doc: Document = document) {
    const { bus, hud, persist, importSave } = services;
    this.alerts = new SaveAlerts({ persist, importSave });
    this.toast = toastWhenRunning(services);
    this.whenFree = windowWhenFree(services);
    hud.setUnsaved(this.alerts.unsaved);
    bus.on('save:result', ({ result }) => {
      const alert = this.alerts.onResult(result);
      hud.setUnsaved(this.alerts.unsaved);
      this.handle(alert);
    });
    doc.addEventListener('visibilitychange', () => {
      if (doc.visibilityState === 'visible') this.handle(this.alerts.onVisible());
    });
  }

  /** Einmal beim Start, wenn die Oberfläche steht. Erst die Fenster des Starts, dann die zum Speichern (sie warten). */
  start(): void {
    const { importSave, startNotice, legacyNewer } = this.services;
    const next = (): void => { if (legacyNewer) this.askLegacy(); };
    if (startNotice !== null) {
      const buttons: NoticeButton[] = [{ label: TEXTS['notice.ok'], close: true }];
      if (startNotice === 'save-newer') buttons.push({ label: TEXTS['notice.reload'], close: false, onClick: () => this.reload() });
      this.open({ id: NOTICE_ID, title: TEXTS['notice.title'], text: noticeText(startNotice), buttons, onClose: next });
    } else {
      next();
    }
    if (importSave !== null && importSave.kind !== 'saved') this.handle(this.alerts.importFailed());
  }

  private handle(alert: SaveAlert | null): void {
    if (alert === 'other-tab') this.whenFree(() => this.showOtherTab());
    if (alert === 'failed') this.whenFree(() => this.showFailed());
  }

  /** „Neu laden": vorher das Speichern anhalten (sonst versuchte es beim Verlassen der Seite noch einmal). */
  private showOtherTab(): void {
    const { save } = this.services;
    this.open({
      id: OTHER_TAB_ID, title: TEXTS['notice.title'], text: TEXTS['save.otherTab'], dismiss: 'buttons',
      buttons: [{ label: TEXTS['notice.reload'], close: false, onClick: () => { save.stop(); this.reload(); } }],
      onClose: () => this.alerts.otherTabClosed(),
    });
  }

  private showFailed(): void {
    this.open({
      id: SAVE_FAILED_ID, title: TEXTS['notice.title'], text: TEXTS['save.failed'], dismiss: 'buttons',
      buttons: [{ label: TEXTS['notice.ok'], close: true }],
    });
  }

  private askLegacy(): void {
    const { store, save, state, windows, replacer } = this.services;
    let decided = false;
    const yes = (): void => {
      // ein zweites „Ja" (Doppeltippen, bevor die Seite neu lädt) tut nichts
      if (decided) return;
      decided = true;
      const outcome = acceptLegacy(store, replacer, Date.now());
      if (outcome === 'replaced') {
        this.reload();
        return;
      }
      if (outcome === 'busy') return;
      windows.close();
      this.toast(TEXTS['notice.legacy-failed']);
    };
    const no = (): void => {
      if (decided) return;
      decided = true;
      declineLegacy(state, store, save);
    };
    this.open({
      id: LEGACY_ID, title: TEXTS['legacy.title'], text: TEXTS['legacy.question'], dismiss: 'buttons',
      buttons: [
        { label: TEXTS['legacy.yes'], close: false, onClick: yes },
        { label: TEXTS['legacy.no'], close: true, onClick: no },
      ],
    });
  }

  private open(spec: NoticeSpec): void {
    openNotice(this.services.windows, spec);
  }
}

/**
 * Kleines Fenster mit Titel, Satz und Knöpfen (Hinweis beim Start, Fragen, Speichern); `onClose` läuft bei jedem
 * Schließen. Die Knöpfe rasten ein (grid.ts).
 */
export function openNotice(windows: WindowManager, spec: NoticeSpec): void {
  const body = noticeBody(spec.text, spec.buttons.map((b) => ({
    label: b.label,
    onClick: () => {
      b.onClick?.();
      if (b.close) windows.close();
    },
  })));
  let release: (() => void) | null = null;
  windows.open({
    id: spec.id, title: spec.title, body, dismiss: spec.dismiss,
    onClose: () => {
      release?.();
      spec.onClose?.();
    },
  });
  release = keepSnapped(body, () => Array.from(body.querySelectorAll<HTMLElement>('.notice__button')));
}
