// Sicherung des Spielstands als Datei: Dateiname, Download, wann daran erinnert wird (Plan 1b, Task 10).
// Grund schon in Etappe 1: Safari auf dem iPad kann localStorage nach längerer Nichtnutzung löschen (Spec 11.1,
// „Schutz vor Verlust"). Dateiname und Download wie im alten Spiel: src/utils/SaveExport.js.
import type { GameState } from '../core/state';

/** Ist die letzte Sicherung älter als so viele Tage, erinnert das Spiel daran. */
export const BACKUP_REMIND_DAYS = 7;
/** Noch nie gesichert: Erinnerung ab so viel Spielzeit (Sekunden, `dayNight.totalTime`). */
export const BACKUP_FIRST_REMIND_SECONDS = 1800;
/**
 * So lange bleibt die Adresse der Datei gültig (ms). iOS/iPadOS fragt vor dem Download nach; eine zu früh
 * freigegebene Adresse lässt ihn ins Leere laufen (Alt: src/utils/SaveExport.js, Zeilen 5–6).
 */
export const REVOKE_DELAY_MS = 60_000;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Dateiname aus dem lokalen Datum, z. B. emilia2-spielstand-2026-11-13.json (Alt: SaveExport.js, Zeilen 9–14). */
export function backupFilename(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `emilia2-spielstand-${y}-${m}-${d}.json`;
}

/**
 * Erinnern? Noch nie gesichert und mindestens 30 Minuten gespielt, oder die letzte Sicherung ist älter als 7 Tage.
 * Eine Sicherung „in der Zukunft" (Uhr des Geräts verstellt) gilt als frisch: lieber keine Erinnerung als jede Sitzung eine.
 */
export function shouldRemind(state: GameState, now: number): boolean {
  if (state.lastBackupAt === null) return state.dayNight.totalTime >= BACKUP_FIRST_REMIND_SECONDS;
  return now - state.lastBackupAt > BACKUP_REMIND_DAYS * DAY_MS;
}

/**
 * Lädt einen Text als Datei herunter: Blob, Objekt-Adresse, unsichtbarer Link mit `download`, geklickt und wieder
 * entfernt; die Adresse wird erst nach REVOKE_DELAY_MS freigegeben (Alt: SaveExport.js, Zeilen 17–28).
 * Braucht keine Ausnahme in der CSP: ein Link-Download ist kein Laden eines Bilds, Skripts oder Stils.
 */
export function downloadText(doc: Document, filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = doc.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  doc.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
