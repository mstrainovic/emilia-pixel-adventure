import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ITEMS, REMOVED_ITEMS, ITEM_SUCCESSORS, getItem } from '../../src/data/items';
import { RECIPES, getRecipesForStation } from '../../src/data/recipes';
import { QUESTS, QUEST_ORDER } from '../../src/data/quests';
import { NPCS } from '../../src/data/npcs';
import { ENEMIES } from '../../src/data/enemies';
import { BOSSES, isBossUnlocked } from '../../src/data/bosses';
import { FISH_TYPES, getAvailableFish, pickRandomFish } from '../../src/data/fish';
import { SHELL_TYPES } from '../../src/data/shells';
import { RARE_FIND_PLACEMENTS } from '../../src/data/rareFinds';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../../src/data/achievements';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { ITEMS as LEGACY_ITEMS, getItem as legacyGetItem } from '../../../src/data/items.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { RECIPES as LEGACY_RECIPES, getRecipesForStation as legacyRecipesFor } from '../../../src/data/recipes.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { QUESTS as LEGACY_QUESTS } from '../../../src/data/quests.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { FAMILY_NPCS as LEGACY_NPCS } from '../../../src/data/npcs.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { MOB_TYPES as LEGACY_MOBS } from '../../../src/data/mobs.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { BOSS_TYPES as LEGACY_BOSSES, isBossUnlocked as legacyIsBossUnlocked } from '../../../src/data/bosses.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { FISH_TYPES as LEGACY_FISH, getAvailableFish as legacyAvailable } from '../../../src/data/fish.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { SHELL_TYPES as LEGACY_SHELLS } from '../../../src/data/shells.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { RARE_FIND_PLACEMENTS as LEGACY_RARE } from '../../../src/data/rare_finds.js';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { ACHIEVEMENTS as LEGACY_ACH, ACHIEVEMENT_CATEGORIES as LEGACY_ACH_CATS } from '../../../src/data/achievements.js';

/* eslint-disable @typescript-eslint/no-explicit-any -- Altbestand ist untypisiertes JavaScript */

const deUmlaut = (s: string) => s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
  .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');

/** Tippfehler im Altbestand (Umlaut ohne Ersatzschreibung weggelassen), die bewusst korrigiert wurden:
 *  altes Wort -> Altschreibung der korrigierten Form. */
const OLD_TYPO_FIXES: Record<string, string> = { Krauter: 'Kraeuter', Zaubertranke: 'Zaubertraenke' };
const fixOld = (s: string): string =>
  Object.entries(OLD_TYPO_FIXES).reduce((acc, [from, to]) => acc.replaceAll(from, to), s);

/** Gegenstandskennung aus dem Altbestand auf den neuen Stand abbilden. */
const mapId = (id: string): string => ITEM_SUCCESSORS[id] ?? id;

describe('Gegenstände', () => {
  it('enthält jeden alten Gegenstand außer den entfernten, mit gleichen Werten', () => {
    for (const [id, old] of Object.entries(LEGACY_ITEMS) as [string, any][]) {
      if ((REMOVED_ITEMS as readonly string[]).includes(id)) { expect(ITEMS[id]).toBeUndefined(); continue; }
      const cur = ITEMS[id]!;
      expect(cur, id).toBeDefined();
      expect(cur.id).toBe(old.id);
      expect(deUmlaut(cur.name)).toBe(old.name);
      expect(cur.color).toBe(old.color);
      for (const k of ['category', 'stackSize', 'sellValue', 'damage', 'healAmount', 'value'] as const)
        expect(cur[k], `${id}.${k}`).toBe(old[k]);
    }
    expect(Object.keys(ITEMS).length).toBe(Object.keys(LEGACY_ITEMS).length - REMOVED_ITEMS.length);
  });
  it('behält die alte Reihenfolge', () => {
    const expected = Object.keys(LEGACY_ITEMS).filter((k) => !(REMOVED_ITEMS as readonly string[]).includes(k));
    expect(Object.keys(ITEMS)).toEqual(expected);
  });
  it('getItem verhält sich wie früher', () => {
    expect(getItem('wood')).toBe(ITEMS.wood);
    expect(getItem('gibt_es_nicht')).toBeNull();
    expect(getItem('fish_generic')).toBeNull();
    expect(legacyGetItem('wood')).not.toBeNull();
  });
  it('Nachfolger von fish_generic ist goldfish', () => {
    expect(ITEM_SUCCESSORS.fish_generic).toBe('goldfish');
  });
});

describe('Rezepte', () => {
  it('jede Station und jedes Rezept stimmt überein', () => {
    expect(Object.keys(RECIPES)).toEqual(Object.keys(LEGACY_RECIPES));
    for (const [station, oldList] of Object.entries(LEGACY_RECIPES) as [string, any[]][]) {
      const curList = (RECIPES as Record<string, any[]>)[station]!;
      expect(curList.length, station).toBe(oldList.length);
      oldList.forEach((old, i) => {
        const cur = curList[i]!;
        expect(cur.id).toBe(old.id);
        expect(deUmlaut(cur.name)).toBe(old.name);
        expect(cur.result).toEqual(old.result);
        if (old.id === 'r_cooked_fish') {
          expect(cur.ingredients).toEqual([{ category: 'fish', count: 1 }]);
        } else {
          expect(cur.ingredients).toEqual(old.ingredients);
        }
      });
    }
  });
  it('getRecipesForStation verhält sich wie früher', () => {
    expect(getRecipesForStation('anvil')).toEqual(legacyRecipesFor('anvil'));
    expect(getRecipesForStation('gibt_es_nicht' as never)).toEqual([]);
  });
});

describe('Aufgaben', () => {
  it('jede Aufgabe stimmt überein', () => {
    expect(Object.keys(QUESTS)).toEqual(Object.keys(LEGACY_QUESTS));
    for (const [id, old] of Object.entries(LEGACY_QUESTS) as [string, any][]) {
      const cur = QUESTS[id]!;
      expect(cur.id).toBe(old.id);
      expect(deUmlaut(cur.name)).toBe(old.name);
      expect(deUmlaut(cur.description)).toBe(old.description);
      for (const k of ['type', 'target', 'count', 'xpReward'] as const) expect(cur[k], `${id}.${k}`).toBe(old[k]);
      const expectedReward = old.itemReward.map((r: any) => ({ itemId: mapId(r.itemId), count: r.count }));
      expect(cur.itemReward, id).toEqual(expectedReward);
    }
    expect(QUESTS.lake_visitor!.itemReward).toEqual([{ itemId: 'goldfish', count: 3 }]);
  });
  it('QUEST_ORDER entspricht Progression.js', () => {
    const src = readFileSync(new URL('../../../src/systems/Progression.js', import.meta.url), 'utf8');
    const block = /const QUEST_ORDER = \[([\s\S]*?)\];/.exec(src)![1]!;
    const ids = [...block.matchAll(/'([a-z0-9_]+)'/g)].map((m) => m[1]);
    expect(ids.length).toBe(25);
    expect([...QUEST_ORDER]).toEqual(ids);
  });
});

describe('Dorfbewohner', () => {
  it('jeder Dorfbewohner stimmt überein', () => {
    expect(NPCS.length).toBe(LEGACY_NPCS.length);
    LEGACY_NPCS.forEach((old: any, i: number) => {
      const cur = NPCS[i]!;
      expect(cur.id).toBe(old.id);
      expect(deUmlaut(cur.name)).toBe(old.name);
      expect(deUmlaut(cur.role)).toBe(old.role);
      expect([cur.x, cur.y, cur.direction]).toEqual([old.x, old.y, old.direction]);
      expect(cur.type).toBe(old.type);
      expect(cur.favoriteGifts).toEqual(old.favoriteGifts.map(mapId));
      expect(cur.dialogs.map(deUmlaut)).toEqual(old.dialogs.map(fixOld));
      expect(Object.keys(cur.friendshipDialogs)).toEqual(Object.keys(old.friendshipDialogs));
      for (const lvl of Object.keys(old.friendshipDialogs)) {
        expect((cur.friendshipDialogs as any)[lvl].map(deUmlaut), `${old.id} Stufe ${lvl}`).toEqual(old.friendshipDialogs[lvl]);
      }
      // Nur diese Felder sind erlaubt; Haar- und Kleidungsfelder entfallen.
      const allowed = ['id', 'name', 'role', 'type', 'x', 'y', 'direction', 'favoriteGifts', 'dialogs', 'friendshipDialogs'];
      expect(Object.keys(cur).every((k) => allowed.includes(k)), old.id).toBe(true);
    });
    expect(NPCS.find((n) => n.id === 'mama_tanja')!.favoriteGifts).toEqual(['goldfish', 'cooked_meat']);
  });
  it('Serbische Sätze von Baba und Deda sind unverändert', () => {
    const serbian = ['Dodji ovamo', 'Svaka cast', 'Ko rano rani, dve srece grabi', 'Jesi gladna', 'Volim te',
      'Moja najdraza', 'Ti si moje sunce', 'Donesi', 'Ponosan sam na tebe', 'Moja mala carobnica', 'Kraljevic Marko', 'Zmaj'];
    const all = NPCS.filter((n) => n.id === 'baba' || n.id === 'deda')
      .flatMap((n) => [...n.dialogs, ...Object.values(n.friendshipDialogs).flat()]).join('\n');
    for (const s of serbian) expect(all, s).toContain(s);
  });
});

describe('Gegner', () => {
  it('jeder Gegner stimmt überein', () => {
    expect(Object.keys(ENEMIES)).toEqual(Object.keys(LEGACY_MOBS));
    for (const [id, old] of Object.entries(LEGACY_MOBS) as [string, any][]) {
      const { name, ...rest } = ENEMIES[id]! as any;
      const { name: oldName, ...oldRest } = old;
      expect(deUmlaut(name)).toBe(oldName);
      expect(rest, id).toEqual(oldRest);
    }
  });
});

describe('Bosse', () => {
  it('jeder Boss stimmt überein', () => {
    expect(Object.keys(BOSSES)).toEqual(Object.keys(LEGACY_BOSSES));
    for (const [id, old] of Object.entries(LEGACY_BOSSES) as [string, any][]) {
      const { name, phases, ...rest } = BOSSES[id]! as any;
      const { name: oldName, phases: oldPhases, ...oldRest } = old;
      expect(deUmlaut(name)).toBe(oldName);
      expect(rest, id).toEqual(oldRest);
      expect(phases.map((p: any) => ({ ...p, name: deUmlaut(p.name) }))).toEqual(oldPhases);
    }
  });
  it('isBossUnlocked verhält sich wie früher', () => {
    const quests = (ids: string[]) => Object.fromEntries(ids.map((i) => [i, true]));
    const cases: [string, any, number][] = [
      ['coconut_king', { completedQuests: quests(['shell_collector', 'master_angler', 'crab_problem']), level: 1 }, 0],
      ['coconut_king', { completedQuests: quests(['shell_collector']), level: 1 }, 0],
      ['leviathan', { completedQuests: quests(['coral_healer', 'deep_explorer', 'best_friend', 'collector_page1', 'sunken_treasure']), level: 1 }, 0],
      ['leviathan', { completedQuests: quests(['coral_healer']), level: 1 }, 0],
      ['shadow_knight', { completedQuests: {}, level: 15 }, 1],
      ['shadow_knight', { completedQuests: {}, level: 14 }, 1],
      ['shadow_knight', { completedQuests: {}, level: 15 }, 0],
      ['shadow_knight', { level: 20 }, 2],
      ['gibt_es_nicht', { completedQuests: {}, level: 99 }, 9],
    ];
    for (const [id, prog, petted] of cases)
      expect(isBossUnlocked(id, prog, {}, petted), JSON.stringify([id, prog, petted])).toBe(legacyIsBossUnlocked(id, prog, {}, petted));
  });
});

describe('Fische', () => {
  it('jeder Fisch stimmt überein', () => {
    expect(Object.keys(FISH_TYPES)).toEqual(Object.keys(LEGACY_FISH));
    for (const [id, old] of Object.entries(LEGACY_FISH) as [string, any][]) {
      const { name, ...rest } = FISH_TYPES[id]! as any;
      const { name: oldName, ...oldRest } = old;
      expect(deUmlaut(name)).toBe(oldName);
      expect(rest, id).toEqual(oldRest);
    }
  });
  it('getAvailableFish und pickRandomFish verhalten sich wie früher', () => {
    for (const loc of ['lake', 'beach', 'grotto', 'nirgends'])
      for (const t of ['morning', 'day', 'evening', 'night'])
        expect(getAvailableFish(loc, t)).toEqual(legacyAvailable(loc, t));
    expect(pickRandomFish([])).toBeNull();
    expect(pickRandomFish([{ fishId: 'a', weight: 1 }])).toBe('a');
  });
});

describe('Muscheln', () => {
  it('jede Muschel stimmt überein', () => {
    expect(Object.keys(SHELL_TYPES)).toEqual(Object.keys(LEGACY_SHELLS));
    for (const [id, old] of Object.entries(LEGACY_SHELLS) as [string, any][]) {
      const { name, ...rest } = SHELL_TYPES[id]! as any;
      const { name: oldName, ...oldRest } = old;
      expect(deUmlaut(name)).toBe(oldName);
      expect(rest, id).toEqual(oldRest);
    }
  });
});

describe('Fundstücke', () => {
  it('jede Platzierung stimmt überein', () => {
    expect(RARE_FIND_PLACEMENTS).toEqual(LEGACY_RARE);
  });
});

describe('Erfolge', () => {
  it('jeder Erfolg stimmt überein', () => {
    expect(Object.keys(ACHIEVEMENTS)).toEqual(Object.keys(LEGACY_ACH));
    for (const [id, old] of Object.entries(LEGACY_ACH) as [string, any][]) {
      const cur = ACHIEVEMENTS[id]! as any;
      expect(cur.id).toBe(old.id);
      expect(deUmlaut(cur.name)).toBe(old.name);
      expect(deUmlaut(cur.description)).toBe(old.description);
      expect(cur.category).toBe(old.category);
      expect(cur.condition, id).toEqual(old.condition);
    }
  });
  it('Kategorien stimmen überein', () => {
    expect(Object.keys(ACHIEVEMENT_CATEGORIES)).toEqual(Object.keys(LEGACY_ACH_CATS));
    for (const [k, old] of Object.entries(LEGACY_ACH_CATS) as [string, any][]) {
      const cur = (ACHIEVEMENT_CATEGORIES as Record<string, any>)[k];
      expect(deUmlaut(cur.name)).toBe(old.name);
      expect(cur.icon).toBe(old.icon);
    }
  });
});
