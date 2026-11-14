/** Gesperrte Kacheln einer Karte. Alles außerhalb der Karte gilt als fest. */
export interface SolidGrid {
  readonly width: number;
  readonly height: number;
  isSolid(tileX: number, tileY: number): boolean;
}
