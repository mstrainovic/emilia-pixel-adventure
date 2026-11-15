import type { GameState } from '../core/state';
import type { Services } from '../core/services';
import type { SaveService } from '../save/service';
import { parseImport, serializeForExport } from '../save/store';
import { backupFilename, downloadText, shouldRemind } from '../save/file';
import { TEXTS } from '../data/texts';
import { MENU_ID, type Menu } from './menu';
import { openNotice, replaceSaved, toastWhenRunning } from './notices';

/** Kennung des Fensters mit der Rückfrage vor dem Laden aus Datei. */
export const BACKUP_LOAD_ID = 'backup-load';
/** So oft (Sekunden Spielzeit) wird geprüft, ob die Erinnerung an eine Sicherung fällig ist. */
export const REMIND_CHECK_SECONDS = 60;

/**
 * „Spielstand sichern": `lastBackupAt` setzen, speichern (nur in einer Sitzung, die speichern darf), dann die Datei
 * herunterladen – so trägt auch die Datei den Zeitpunkt. Scheitert das Speichern, kommt die Datei trotzdem (um sie geht
 * es); die Hinweise zum Speichern (notices.ts) melden den Fehlschlag.
 */
export function exportBackup(
  target: { state: GameState; persist: boolean; save: Pick<SaveService, 'saveNow'> },
  download: (filename: string, text: string) => void,
  now: number,
): void {
  target.state.lastBackupAt = now;
  if (target.persist) target.save.saveNow('backup');
  download(backupFilename(new Date(now)), serializeForExport(target.state));
}

/**
 * Sicherung als Datei (Plan 1b, Task 10): zwei Knöpfe im Menü und die Erinnerung daran.
 * - „Spielstand sichern" (exportBackup), danach Menü zu und Hinweis „Gesichert!".
 * - „Spielstand laden": Dateiauswahl (`.json`) → parseImport. Passt die Datei nicht: Hinweis, nichts ändert sich.
 *   Passt sie: Rückfrage mit „Ja"/„Nein" (Schließen jeder Art = „Nein"); „Ja" ersetzt den gespeicherten Stand, hält
 *   das Speichern an und lädt die Seite neu (replaceSaved, wie die Übernahme des alten Stands). Kann nicht gespeichert
 *   werden (auch in einer Sitzung ohne Speichern): kein Neuladen, Hinweis „Hier kann das Spiel nicht speichern.".
 * - Erinnerung höchstens einmal je Sitzung, wenn `shouldRemind` wahr ist: beim Start und dann je Minute Spielzeit.
 * Alle Hinweise über toastWhenRunning (sie warten, solange ein Fenster offen ist).
 */
export class Backup {
  private readonly picker: HTMLInputElement;
  private readonly toast: (text: string) => void;
  private reminded = false;
  private checkedMinute: number | null = null;

  /** `reload` lädt die Seite neu (nach „Ja"). */
  constructor(private readonly services: Services, private readonly doc: Document, private readonly reload: () => void) {
    this.toast = toastWhenRunning(services);
    // Dateiauswahl außerhalb der Oberfläche (#ui): dort wäre sie bei offenem Fenster `inert`
    this.picker = doc.createElement('input');
    this.picker.type = 'file';
    this.picker.accept = '.json,application/json';
    this.picker.hidden = true;
    this.picker.addEventListener('change', () => { void this.readPicked(); });
    doc.body.appendChild(this.picker);
  }

  /** Hängt „Spielstand sichern" und „Spielstand laden" an das Menü (nach den vorhandenen Knöpfen). */
  addTo(menu: Menu): void {
    menu.add({ id: 'save-export', label: TEXTS['menu.saveExport'], onSelect: () => this.exportNow() });
    menu.add({ id: 'save-import', label: TEXTS['menu.saveImport'], onSelect: () => this.chooseFile() });
  }

  exportNow(): void {
    const { state, persist, save, windows } = this.services;
    exportBackup({ state, persist, save }, (name, text) => downloadText(this.doc, name, text), Date.now());
    if (windows.openId === MENU_ID) windows.close();
    this.toast(TEXTS['backup.saved']);
  }

  /** Öffnet die Dateiauswahl (im Klick des Knopfs: Browser verlangen dafür eine Handlung). Das Menü bleibt offen. */
  chooseFile(): void {
    this.picker.value = '';
    this.picker.click();
  }

  /** Text einer gewählten Datei (`null`: nicht lesbar): passt er, die Rückfrage; sonst der Hinweis. */
  offer(text: string | null): void {
    const { windows } = this.services;
    const loaded = text === null ? null : parseImport(text, Date.now());
    if (loaded === null) {
      if (windows.openId === MENU_ID) windows.close();
      this.toast(TEXTS['backup.unfit']);
      return;
    }
    openNotice(windows, BACKUP_LOAD_ID, TEXTS['backup.question'], [
      { label: TEXTS['backup.yes'], close: false, onClick: () => this.load(loaded) },
      { label: TEXTS['backup.no'], close: true },
    ], () => {});
  }

  /** Einmal beim Start, wenn die Oberfläche steht. */
  start(): void {
    this.tick();
  }

  /** Jedes Bild, solange das Spiel läuft (WorldScene); prüft nur, wenn eine neue Minute Spielzeit begonnen hat. */
  tick(): void {
    if (this.reminded) return;
    const minute = Math.floor(this.services.state.dayNight.totalTime / REMIND_CHECK_SECONDS);
    if (minute === this.checkedMinute) return;
    this.checkedMinute = minute;
    if (!shouldRemind(this.services.state, Date.now())) return;
    this.reminded = true;
    this.toast(TEXTS['backup.remind']);
  }

  private async readPicked(): Promise<void> {
    const file = this.picker.files?.[0];
    // zurücksetzen: dieselbe Datei lässt sich gleich noch einmal wählen
    this.picker.value = '';
    if (file === undefined) return;
    let text: string | null;
    try {
      text = await file.text();
    } catch {
      text = null;
    }
    this.offer(text);
  }

  private load(state: GameState): void {
    const { store, save, windows } = this.services;
    if (replaceSaved(store, save, state, Date.now())) {
      this.reload();
      return;
    }
    windows.close();
    this.toast(TEXTS['notice.storage-unavailable']);
  }
}
