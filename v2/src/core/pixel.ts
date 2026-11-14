/** Kantenlänge einer Kachel in Bildpunkten. */
export const TILE_SIZE = 16;
/**
 * Mindestens sichtbares Feld in Bildpunkten. Große Bildschirme (PC, Tablet) zeigen mehr von der Welt als Handys:
 * Am PC war das Bild mit 240×180 zu nah, am Handy passte es (Rückmeldung des Auftraggebers, 2026-11-14).
 */
export const MIN_VIEW = { width: 288, height: 216 } as const;
export const MIN_VIEW_SMALL = { width: 240, height: 180 } as const;
/** Ab dieser kürzeren Seite in CSS-Pixeln gilt ein Bildschirm als groß (Handys liegen bei 360–430, das kleinste iPad bei 744). */
export const LARGE_SCREEN_CSS = 500;

/**
 * Ganzzahliger Zoom: ein Bildpunkt entspricht immer ganzen Bildschirmpixeln.
 * Z = max(1, floor(min(Breite / Mindestbreite, Höhe / Mindesthöhe))) in Gerätepixeln; das Mindestfeld hängt von
 * der kürzeren Seite in CSS-Pixeln ab (Gerätepixel / `dpr`). Unbrauchbare Größen ergeben 1, unbrauchbare Dichte gilt als 1.
 */
export function computeZoom(physicalWidth: number, physicalHeight: number, dpr = 1): number {
  if (!Number.isFinite(physicalWidth) || !Number.isFinite(physicalHeight)) return 1;
  if (physicalWidth <= 0 || physicalHeight <= 0) return 1;
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  const shortCss = Math.min(physicalWidth, physicalHeight) / ratio;
  const min = shortCss >= LARGE_SCREEN_CSS ? MIN_VIEW : MIN_VIEW_SMALL;
  const zoom = Math.floor(Math.min(physicalWidth / min.width, physicalHeight / min.height));
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
export function computeLayout(deviceWidth: number, deviceHeight: number, dpr = 1): PixelLayout {
  const usable = Number.isFinite(deviceWidth) && Number.isFinite(deviceHeight) && deviceWidth > 0 && deviceHeight > 0;
  if (!usable) return { zoom: 1, viewWidth: 1, viewHeight: 1, offsetX: 0, offsetY: 0 };
  const width = Math.max(1, Math.floor(deviceWidth));
  const height = Math.max(1, Math.floor(deviceHeight));
  const zoom = computeZoom(width, height, dpr);
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

/**
 * Vertrag der Zeiger-Abbildung: Ort im sichtbaren Feld für einen Ort auf der Zeichenfläche (Gerätepixel).
 * `x = (canvasX − offsetX) / zoom`, `y` ebenso; in Bildpunkten, ungerundet. `inside` ist wahr genau für
 * `0 ≤ x < viewWidth` und `0 ≤ y < viewHeight`. Werte außerhalb werden nicht gekappt: der schwarze Rand liefert
 * negative Werte oder Werte ab der Feldbreite bzw. -höhe. Nicht endliche Eingaben ergeben `{ x: NaN, y: NaN, inside: false }`.
 */
export function canvasToView(layout: PixelLayout, canvasX: number, canvasY: number): { x: number; y: number; inside: boolean } {
  if (!Number.isFinite(canvasX) || !Number.isFinite(canvasY)) return { x: Number.NaN, y: Number.NaN, inside: false };
  const x = (canvasX - layout.offsetX) / layout.zoom;
  const y = (canvasY - layout.offsetY) / layout.zoom;
  return { x, y, inside: x >= 0 && x < layout.viewWidth && y >= 0 && y < layout.viewHeight };
}
