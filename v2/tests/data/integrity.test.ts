import { describe, it, expect } from 'vitest';
import { ITEMS } from '../../src/data/items';
import { RECIPES } from '../../src/data/recipes';
import { QUESTS, QUEST_ORDER } from '../../src/data/quests';
import { NPCS } from '../../src/data/npcs';
import { ENEMIES } from '../../src/data/enemies';
import { BOSSES } from '../../src/data/bosses';
import { FISH_TYPES } from '../../src/data/fish';
import { SHELL_TYPES } from '../../src/data/shells';
import { RARE_FIND_PLACEMENTS } from '../../src/data/rareFinds';
import { ACHIEVEMENTS } from '../../src/data/achievements';
import { MAP_IDS, isMapId } from '../../src/data/maps';

const exists = (id: string) => ITEMS[id] !== undefined;
const categories = new Set(Object.values(ITEMS).map((i) => i.category));

describe('Schlüssel und Kennungen', () => {
  it.each([
    ['ITEMS', ITEMS], ['QUESTS', QUESTS], ['FISH_TYPES', FISH_TYPES],
    ['SHELL_TYPES', SHELL_TYPES], ['ACHIEVEMENTS', ACHIEVEMENTS],
  ])('%s: Schlüssel gleich id', (name, table) => {
    for (const [key, entry] of Object.entries(table as Record<string, { id: string }>)) {
      expect(entry.id, `${name}.${key}`).toBe(key);
    }
  });
  it('Rezept-Kennungen sind eindeutig', () => {
    const ids = Object.values(RECIPES).flat().map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('NPC-Kennungen sind eindeutig', () => {
    expect(new Set(NPCS.map((n) => n.id)).size).toBe(NPCS.length);
  });
});

describe('Verweise auf Gegenstände', () => {
  it('Rezepte: Zutaten und Ergebnisse existieren', () => {
    for (const list of Object.values(RECIPES)) for (const r of list) {
      expect(exists(r.result.itemId), `${r.id} Ergebnis`).toBe(true);
      for (const ing of r.ingredients) {
        if ('itemId' in ing) expect(exists(ing.itemId), `${r.id} Zutat ${ing.itemId}`).toBe(true);
        else expect(categories.has(ing.category), `${r.id} Kategorie ${ing.category}`).toBe(true);
      }
    }
  });
  it('Aufgaben: Belohnungen existieren', () => {
    for (const q of Object.values(QUESTS)) for (const r of q.itemReward)
      expect(exists(r.itemId), `${q.id} -> ${r.itemId}`).toBe(true);
  });
  it('Dorfbewohner: Lieblingsgeschenke existieren', () => {
    for (const n of NPCS) for (const g of n.favoriteGifts) expect(exists(g), `${n.id} -> ${g}`).toBe(true);
  });
  it('Gegner, Bosse, Fische, Muscheln, Fundstücke verweisen auf vorhandene Gegenstände', () => {
    for (const [id, e] of Object.entries(ENEMIES)) for (const d of e.drops) expect(exists(d.itemId), `${id} -> ${d.itemId}`).toBe(true);
    for (const [id, b] of Object.entries(BOSSES)) for (const d of b.drops) expect(exists(d.itemId), `${id} -> ${d.itemId}`).toBe(true);
    for (const id of Object.keys(FISH_TYPES)) expect(exists(id), `Fisch ${id}`).toBe(true);
    for (const id of Object.keys(SHELL_TYPES)) expect(exists(id), `Muschel ${id}`).toBe(true);
    for (const list of Object.values(RARE_FIND_PLACEMENTS)) for (const p of list) expect(exists(p.itemId), p.itemId).toBe(true);
  });
  it('fish_generic kommt nirgends mehr vor', () => {
    const all = JSON.stringify([ITEMS, RECIPES, QUESTS, NPCS, ENEMIES, BOSSES, RARE_FIND_PLACEMENTS]);
    expect(all).not.toContain('fish_generic');
  });
});

describe('Aufgabenfolge', () => {
  it('QUEST_ORDER und QUESTS enthalten dieselben 25 Kennungen', () => {
    expect(QUEST_ORDER.length).toBe(25);
    expect(new Set(QUEST_ORDER).size).toBe(25);
    expect([...QUEST_ORDER].sort()).toEqual(Object.keys(QUESTS).sort());
  });
});

describe('Karten', () => {
  it('isMapId', () => {
    expect(isMapId('hub')).toBe(true);
    expect(isMapId('moon')).toBe(false);
    expect(isMapId(42)).toBe(false);
    expect(isMapId(undefined)).toBe(false);
    expect(MAP_IDS.length).toBe(9);
  });
  it('Fundstück-Karten und Boss-Szenen sind gültige Karten', () => {
    for (const k of Object.keys(RARE_FIND_PLACEMENTS)) expect(isMapId(k), k).toBe(true);
    for (const b of Object.values(BOSSES)) expect(isMapId(b.scene), b.scene).toBe(true);
  });
});
