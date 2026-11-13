/**
 * Hilfen, um den Spielstand als Datei zu sichern.
 */

/** Dateiname aus dem lokalen Datum, z. B. emilia-spielstand-2026-11-13.json */
export function buildSaveExportFilename(date) {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `emilia-spielstand-${y}-${m}-${d}.json`;
}

/** Löst den Download einer Textdatei aus (Blob, Objekt-URL, unsichtbarer Link). */
export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
