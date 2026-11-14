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

/**
 * Rundet einen Ort in Bildpunkten auf ganze Bildschirmpixel, also auf Vielfache von 1/Zoom Bildpunkt.
 * Bewegtes (Kamera, laufende Figur) rastet so ein: Das Bild bleibt scharf, rückt aber gleichmäßig weiter statt
 * in Sprüngen von einem ganzen Bildpunkt (bei Zoom 6 sechs Bildschirmpixel). Unbrauchbarer Zoom → ganze Bildpunkte.
 */
export function snapToScreen(value: number, zoom: number): number {
  if (!Number.isInteger(zoom) || zoom < 1) return Math.round(value);
  return Math.round(value * zoom) / zoom;
}

/** Aufteilung der Zeichenfläche: ganzzahliger Zoom, sichtbares Feld und schwarzer Rand. */
export interface PixelLayout {
  zoom: number;
  /** Sichtbare Bildpunkte: floor(Gerätepixel / Zoom). */
  viewWidth: number;
  viewHeight: number;
  /** Rand in Gerätepixeln: floor(Rest / 2). */
  offsetX: number;
  offsetY: number;
}

/**
 * Teilt eine Zeichenfläche von Gerätepixeln in ganze Bildpunkte auf. Der Rest (höchstens
 * Zoom − 1 Pixel) wird auf beide Seiten verteilt. Unbrauchbare Größen ergeben ein Feld aus einem Bildpunkt.
 */
export function computeLayout(deviceWidth: number, deviceHeight: number): PixelLayout {
  const usable = Number.isFinite(deviceWidth) && Number.isFinite(deviceHeight) && deviceWidth > 0 && deviceHeight > 0;
  if (!usable) return { zoom: 1, viewWidth: 1, viewHeight: 1, offsetX: 0, offsetY: 0 };
  const width = Math.max(1, Math.floor(deviceWidth));
  const height = Math.max(1, Math.floor(deviceHeight));
  const zoom = computeZoom(width, height);
  const viewWidth = Math.max(1, Math.floor(width / zoom));
  const viewHeight = Math.max(1, Math.floor(height / zoom));
  return {
    zoom,
    viewWidth,
    viewHeight,
    offsetX: Math.max(0, Math.floor((width - viewWidth * zoom) / 2)),
    offsetY: Math.max(0, Math.floor((height - viewHeight * zoom) / 2)),
  };
}
