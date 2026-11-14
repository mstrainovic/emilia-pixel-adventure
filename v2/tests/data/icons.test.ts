import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { FALLBACK_ICON, ITEM_ICONS, iconFor } from '../../src/data/icons';
import { ITEMS } from '../../src/data/items';

const GFX = fileURLToPath(new URL('../../src/assets/gfx/', import.meta.url));
const sources = JSON.parse(readFileSync(`${GFX}quellen.json`, 'utf8')) as { eintraege: Array<{ ziel: string; quelle: string }> };
const entry = (icon: string) => sources.eintraege.find((e) => e.ziel === `ui/${icon}.png`);

/** Start und Belohnungen der ersten drei Aufgaben (Plan 1b, Task 6). */
const FIRST_ITEMS = ['sword_wood', 'berry', 'wood', 'magic_herb', 'seed_carrot', 'seed_tomato'];

describe('Symbole der Gegenstände', () => {
  it.each(FIRST_ITEMS)('%s hat ein eigenes Symbol aus Items/ des Packs, 16×16', (itemId) => {
    expect(ITEMS[itemId], itemId).toBeDefined();
    const icon = iconFor(itemId);
    expect(icon).not.toBe(FALLBACK_ICON);
    expect(entry(icon)?.quelle, icon).toMatch(/^Items\//);
    const png = PNG.sync.read(readFileSync(`${GFX}ui/${icon}.png`));
    expect([png.width, png.height]).toEqual([16, 16]);
  });

  it('die sechs Symbole sind verschieden', () => {
    expect(new Set(FIRST_ITEMS.map(iconFor)).size).toBe(FIRST_ITEMS.length);
  });

  it('jeder Eintrag der Liste gehört zu einem Gegenstand und hat ein Bild in quellen.json', () => {
    for (const [itemId, icon] of Object.entries(ITEM_ICONS)) {
      expect(ITEMS[itemId], itemId).toBeDefined();
      expect(entry(icon), icon).toBeDefined();
    }
  });

  it('unbekannte Gegenstände und solche ohne Symbol zeigen den Beutel', () => {
    expect(FALLBACK_ICON).toBe('beutel');
    expect(iconFor('made_up')).toBe('beutel');
    expect(iconFor('pearl')).toBe('beutel');
    expect(iconFor('')).toBe('beutel');
    // Kennungen wie „constructor" sind kein Eintrag der Liste
    expect(iconFor('constructor')).toBe('beutel');
  });

  it('der Beutel steht in quellen.json und stammt aus dem Pack', () => {
    expect(entry('beutel')?.quelle).toMatch(/^Items\//);
  });
});
