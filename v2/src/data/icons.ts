/**
 * Symbol je Gegenstand: Name eines 16×16-Bildes in src/assets/gfx/ui (ohne „.png"), ausgeschnitten von
 * tools/art/build.mjs aus „Items/" des Packs (Liste UI in tools/art/selection.mjs).
 * In Etappe 1 nur Start und Belohnungen der ersten drei Aufgaben; die übrigen Symbole kommen mit dem Rucksack
 * (Etappe 2). Bis dahin zeigt jeder andere Gegenstand den neutralen Beutel.
 */
export const ITEM_ICONS: Readonly<Record<string, string>> = {
  sword_wood: 'schwert',
  berry: 'beere',
  wood: 'holz',
  magic_herb: 'kraut',
  seed_carrot: 'samen_karotte',
  seed_tomato: 'samen_tomate',
};

/** Neutrales Symbol für Gegenstände ohne eigenes Bild (auch unbekannte Kennungen). */
export const FALLBACK_ICON = 'beutel';

/** Bildname des Symbols; nie ein Absturz, nie ein leeres Feld. */
export function iconFor(itemId: string): string {
  return Object.hasOwn(ITEM_ICONS, itemId) ? ITEM_ICONS[itemId]! : FALLBACK_ICON;
}
