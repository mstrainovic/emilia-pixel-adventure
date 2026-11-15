import type { GameState } from '../core/state';
import type { Services, StartNotice } from '../core/services';
import type { SaveService } from '../save/service';
import { parseImport, serializeForExport } from '../save/store';
import { backupFilename, downloadText, shouldRemind } from '../save/file';
import { TEXTS } from '../data/texts';
import { MENU_ID, type Menu } from './menu';
import { openNotice, toastWhenRunning, windowWhenFree } from './notices';

/** Kennung des Fensters mit der Rückfrage vor dem Laden aus Datei. */
export const BACKUP_LOAD_ID = 'backup-load';
/** Kennung des Fensters mit der Erinnerung beim Start (Fix-Welle F4). */
export const BACKUP_REMIND_ID = 'backup-remind';
/** So oft (Sekunden Spielzeit) wird geprüft, ob die Erinnerung an eine Sicherung fällig ist. */
export const REMIND_CHECK_SECONDS = 60;

/**
 * „Spielstand sichern": `lastBackupAt` setzen, speichern (nur in einer Sitzung, die speichern darf), dann die Datei
 * herunterladen – so trägt auch die Datei den Zeitpunkt. Scheitert das Speichern, kommt die Datei trotzdem (um sie geht
 * es); die Hinweise zum Speichern (notices.ts) melden den Fehlschlag.
 * Nicht in einer Sitzung mit neuerem Spielstand (`save-newer`, Fix-Welle F5): Sie hält nur ein leeres neues Spiel, der
 * echte Stand ist neuer und unberührt – eine Datei davon führte in die Irre. Dann geschieht nichts, Ergebnis `false`.
 * Ohne lesbaren Speicher (`storage-unavailable`) bleibt Sichern erlaubt: dort ist die Datei der einzige Weg.
 */
export function exportBackup(
  target: { state: GameState; persist: boolean; save: Pick<SaveService, 'saveNow'>; startNotice: StartNotice | null },
  download: (filename: string, text: string) => void,
  now: number,
): boolean {
  if (target.startNotice === 'save-newer') return false;
  target.state.lastBackupAt = now;
  if (target.persist) target.save.saveNow('backup');
  download(backupFilename(new Date(now)), serializeForExport(target.state));
  return true;
}

/**
 * Sicherung als Datei (Plan 1b, Task 10): zwei Knöpfe im Menü und die Erinnerung daran.
 * - „Spielstand sichern" (exportBackup), danach Menü zu und Hinweis „Datei ist fertig …"; in einer Sitzung mit
 *   neuerem Spielstand statt dessen der Hinweis `notice.save-newer`.
 * - „Spielstand laden": Dateiauswahl (`.json`) → parseImport. Passt die Datei nicht: Hinweis, nichts ändert sich.
 *   Passt sie: Rückfrage „Spielstand laden?" mit „Ja"/„Nein" (×, Esc = „Nein"; Tippen daneben schließt nicht); „Ja"
 *   ersetzt den gespeicherten Stand, hält das Speichern an und lädt die Seite neu (services.replacer, wie die
 *   Übernahme des alten Stands; ein zweites „Ja" vor dem Neuladen tut nichts). Reihenfolge in einer Sitzung ohne
 *   Speichern: Datei prüfen („keine Spielstand-Datei" wie sonst), Rückfrage, erst „Ja" endet mit dem Hinweis
 *   `notice.storage-unavailable`; kein Neuladen.
 * - Erinnerung höchstens einmal je Sitzung, wenn `shouldRemind` wahr ist: beim Start als Fenster mit „Jetzt sichern"
 *   und „Später" (nach dem Hinweis beim Start und der Frage zum alten Spiel, nie darüber); wird sie erst im Lauf fällig
 *   (je Minute Spielzeit geprüft), als Hinweis.
 * Alle Hinweise über toastWhenRunning (sie warten, solange ein Fenster offen ist).
 */
export class Backup {
  private readonly picker: HTMLInputElement;
  private readonly toast: (text: string) => void;
  private readonly whenFree: (open: () => void) => void;
  private reminded = false;
  private checkedMinute: number | null = null;

  /** `reload` lädt die Seite neu (nach „Ja"). */
  constructor(private readonly services: Services, private readonly doc: Document, private readonly reload: () => void) {
    this.toast = toastWhenRunning(services);
    this.whenFree = windowWhenFree(services);
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
    const { state, persist, save, windows, startNotice } = this.services;
    const done = exportBackup({ state, persist, save, startNotice }, (name, text) => downloadText(this.doc, name, text), Date.now());
    if (windows.openId === MENU_ID) windows.close();
    this.toast(done ? TEXTS['backup.saved'] : TEXTS['notice.save-newer']);
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
    openNotice(windows, {
      id: BACKUP_LOAD_ID, title: TEXTS['backup.title'], text: TEXTS['backup.question'], dismiss: 'buttons',
      buttons: [
        { label: TEXTS['backup.yes'], close: false, onClick: () => this.load(loaded) },
        { label: TEXTS['backup.no'], close: true },
      ],
    });
  }

  /** Einmal beim Start, wenn die Oberfläche steht: ist die Erinnerung fällig, das Fenster (wartet auf seinen Platz). */
  start(): void {
    this.checkedMinute = this.minute();
    if (this.reminded || !shouldRemind(this.services.state, Date.now())) return;
    this.reminded = true;
    this.whenFree(() => openNotice(this.services.windows, {
      id: BACKUP_REMIND_ID, title: TEXTS['notice.title'], text: TEXTS['backup.remindWindow'], dismiss: 'buttons',
      buttons: [
        { label: TEXTS['backup.now'], close: true, onClick: () => this.exportNow() },
        { label: TEXTS['backup.later'], close: true },
      ],
    }));
  }

  /** Jedes Bild, solange das Spiel läuft (WorldScene); prüft nur, wenn eine neue Minute Spielzeit begonnen hat. */
  tick(): void {
    if (this.reminded) return;
    const minute = this.minute();
    if (minute === this.checkedMinute) return;
    this.checkedMinute = minute;
    if (!shouldRemind(this.services.state, Date.now())) return;
    this.reminded = true;
    this.toast(TEXTS['backup.remind']);
  }

  private minute(): number {
    return Math.floor(this.services.state.dayNight.totalTime / REMIND_CHECK_SECONDS);
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
    const { replacer, windows } = this.services;
    // höchstens einmal je Sitzung; nie in einer Sitzung ohne Speichern (SaveReplacer)
    const outcome = replacer.replace(state, Date.now());
    if (outcome === 'replaced') {
      this.reload();
      return;
    }
    // schon ersetzt (zweites „Ja" vor dem Neuladen): nichts tun
    if (outcome === 'busy') return;
    windows.close();
    this.toast(TEXTS['notice.storage-unavailable']);
  }
}
