/** Kantenlänge einer Kachel in Bildpunkten. */
export const TILE_SIZE = 16;
/** Mindestens sichtbare Breite in Bildpunkten. */
export const MIN_VIEW_WIDTH = 240;
/** Mindestens sichtbare Höhe in Bildpunkten. */
export const MIN_VIEW_HEIGHT = 180;

/**
 * Ganzzahliger Zoom: ein Bildpunkt entspricht immer ganzen Bildschirmpixeln.
 * Z = max(1, floor(min(Breite / 240, Höhe / 180))). Unbrauchbare Größen ergeben 1.
 */
export function computeZoom(physicalWidth: number, physicalHeight: number): number {
  if (!Number.isFinite(physicalWidth) || !Number.isFinite(physicalHeight)) return 1;
  if (physicalWidth <= 0 || physicalHeight <= 0) return 1;
  const zoom = Math.floor(Math.min(physicalWidth / MIN_VIEW_WIDTH, physicalHeight / MIN_VIEW_HEIGHT));
  return Math.max(1, zoom);
}

/** Zoom und sichtbares Feld in Bildpunkten (Breite = physische Breite / Zoom). */
export function computeView(
  physicalWidth: number,
  physicalHeight: number,
): { zoom: number; width: number; height: number } {
  const zoom = computeZoom(physicalWidth, physicalHeight);
  return { zoom, width: physicalWidth / zoom, height: physicalHeight / zoom };
}
