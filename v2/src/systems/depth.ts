/**
 * Zeichentiefe: Boden, Bodendetail, flach Liegendes, dann alles Stehende nach Standlinie
 * (weiter unten = weiter vorn), ganz oben die Oberfläche.
 *
 * Eine Regel für alles, was steht: Der Tiefenschlüssel ist das y der Linie, auf der sein Bild steht.
 * - Objekte der Karte: Ihr Ort (WorldObject.y) ist die Kachelmitte; ihr Bild steht auf der Unterkante dieser
 *   Kachel. Bildanker und Tiefe kommen beide aus standLineOf(y, Kachelhöhe), nirgends sonst wird gerechnet.
 * - Figuren (Task 12): Bildunterkante und Tiefenschlüssel sind beide ihr Fußpunkt (depthForFoot(footY)).
 * Folge: Eine Figur, deren Fuß in der Kachel eines Objekts oberhalb von dessen Unterkante steht, liegt dahinter;
 * steht sie in der Kachel darunter, liegt sie davor. Gleichstand (Fuß genau auf der Standlinie des Objekts):
 * gleiche Tiefe, es entscheidet die Reihenfolge des Anlegens (stabile Sortierung). Figuren werden nach den
 * Objekten angelegt und stehen damit davor – sie stehen auf derselben Linie, ihre Füße sind also nicht verdeckt.
 */
export const DEPTH = { ground: 0, groundDetail: 1, flat: 2, standing: 1000, top: 100000 } as const;

/** Tiefe eines stehenden Dings, dessen Bild auf der Linie `footY` (Bildpunkte) steht. */
export function depthForFoot(footY: number): number {
  return DEPTH.standing + footY;
}

/** Standlinie eines Objekts der Karte: Unterkante der Kachel, deren Mitte bei `tileCentreY` liegt. */
export function standLineOf(tileCentreY: number, tileHeight: number): number {
  return tileCentreY + tileHeight / 2;
}
