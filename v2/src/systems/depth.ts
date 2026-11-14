/**
 * Zeichentiefe: Boden, Bodendetail, flach Liegendes, dann alles Stehende nach Fußpunkt
 * (weiter unten = weiter vorn), ganz oben die Oberfläche.
 */
export const DEPTH = { ground: 0, groundDetail: 1, flat: 2, standing: 1000, top: 100000 } as const;

/** Tiefe eines stehenden Dings mit Fußpunkt `footY` (Bildpunkte). */
export function depthForFoot(footY: number): number {
  return DEPTH.standing + footY;
}
