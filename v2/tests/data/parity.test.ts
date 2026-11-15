import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ITEMS, REMOVED_ITEMS, ITEM_SUCCESSORS, getItem } from '../../src/data/items';
import { RECIPES, getRecipesForStation } from '../../src/data/recipes';
import { QUESTS, QUEST_ORDER, QUEST_GIVERS } from '../../src/data/quests';
import { NPCS } from '../../src/data/npcs';
import { ENEMIES } from '../../src/data/enemies';
import { BOSSES, isBossUnlocked } from '../../src/data/bosses';
import { FISH_TYPES, getAvailableFish, pickRandomFish } from '../../src/data/fish';
import { SHELL_TYPES } from '../../src/data/shells';
import { RARE_FIND_PLACEMENTS } from '../../src/data/rareFinds';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../../src/data/achievements';
import type { TiledObjectLayer } from '../../src/maps/tiled';
import { loadLegacyMaps } from '../maps/loadMaps';
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

/** Serbische Sonderzeichen zurück in die Schreibung des alten Spiels (dort nur einfache Buchstaben). */
const deSerbian = (s: string) => s.replace(/đ/g, 'dj').replace(/Đ/g, 'Dj').replace(/[čć]/g, 'c').replace(/[ČĆ]/g, 'C')
  .replace(/š/g, 's').replace(/Š/g, 'S').replace(/ž/g, 'z').replace(/Ž/g, 'Z');
/** Satz eines Dorfbewohners in der Schreibung des alten Spiels. */
const toOld = (s: string) => deSerbian(deUmlaut(s));

/** Tippfehler im Altbestand (Umlaut ohne Ersatzschreibung weggelassen), die bewusst korrigiert wurden:
 *  altes Wort -> Altschreibung der korrigierten Form. */
const OLD_TYPO_FIXES: Record<string, string> = {
  Krauter: 'Kraeuter',
  Zaubertranke: 'Zaubertraenke',
  // Grammatikfehler im Altbestand (src/data/npcs.js Zeile 227: „Opa ist maechtiger stolz auf dich!")
  'maechtiger stolz': 'maechtig stolz',
};
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
  it('QUEST_GIVERS entspricht QUEST_NPC_MAP in FriendshipSystem.js', () => {
    const src = readFileSync(new URL('../../../src/systems/FriendshipSystem.js', import.meta.url), 'utf8');
    const block = /const QUEST_NPC_MAP = \{([\s\S]*?)\};/.exec(src)![1]!;
    const pairs = [...block.matchAll(/([a-z0-9_]+):\s*'([a-z0-9_]+)'/g)].map((m) => [m[1]!, m[2]!] as const);
    expect(pairs.length).toBe(25);
    expect(QUEST_GIVERS).toEqual(Object.fromEntries(pairs));
    const npcIds = NPCS.map((n) => n.id);
    for (const [quest, giver] of Object.entries(QUEST_GIVERS)) {
      expect(QUESTS[quest], quest).toBeDefined();
      expect(npcIds, quest).toContain(giver);
    }
  });
});

describe('Dorfbewohner', () => {
  it('Ort und Richtung stehen nur in der Ebene npcs der Vorlage hub und stimmen mit dem alten Spiel überein', () => {
    const layer = loadLegacyMaps().hub.layers.find((l) => l.name === 'npcs') as TiledObjectLayer;
    expect(layer.objects.map((o) => o.name)).toEqual(LEGACY_NPCS.map((n: any) => n.id));
    for (const old of LEGACY_NPCS as any[]) {
      const o = layer.objects.find((x) => x.name === old.id)!;
      const facing = o.properties?.find((p) => p.name === 'facing')?.value;
      expect([o.x / 16, o.y / 16, facing], old.id).toEqual([old.x, old.y, old.direction === 'side' ? 'right' : old.direction]);
    }
  });
  it('jeder Dorfbewohner stimmt überein', () => {
    expect(NPCS.length).toBe(LEGACY_NPCS.length);
    LEGACY_NPCS.forEach((old: any, i: number) => {
      const cur = NPCS[i]!;
      expect(cur.id).toBe(old.id);
      expect(deUmlaut(cur.name)).toBe(old.name);
      expect(deUmlaut(cur.role)).toBe(old.role);
      expect(cur.type).toBe(old.type);
      expect(cur.favoriteGifts).toEqual(old.favoriteGifts.map(mapId));
      expect(cur.dialogs.map(toOld)).toEqual(old.dialogs.map(fixOld));
      expect(Object.keys(cur.friendshipDialogs)).toEqual(Object.keys(old.friendshipDialogs));
      for (const lvl of Object.keys(old.friendshipDialogs)) {
        expect((cur.friendshipDialogs as any)[lvl].map(toOld), `${old.id} Stufe ${lvl}`).toEqual(old.friendshipDialogs[lvl].map(fixOld));
      }
      // Nur diese Felder sind erlaubt; Haar- und Kleidungsfelder entfallen.
      const allowed = ['id', 'name', 'role', 'type', 'favoriteGifts', 'dialogs', 'friendshipDialogs'];
      expect(Object.keys(cur).every((k) => allowed.includes(k)), old.id).toBe(true);
    });
    expect(NPCS.find((n) => n.id === 'mama_tanja')!.favoriteGifts).toEqual(['goldfish', 'cooked_meat']);
  });
  it('Serbische Sätze von Baba und Deda: mit Sonderzeichen, ekavisch, sonst wie im alten Spiel', () => {
    // Entscheidung des Auftraggebers vom 2026-11-15 (Liste test-artifacts/texte/serbisch.md): č, ć, š, ž, đ schreiben,
    // ekavisch lassen („dve", „na svetu"), „Pita" groß, sonst nichts ändern.
    const serbian = ['Dođi ovamo', 'Moja mala! Dođi,', 'Svaka čast', 'Ko rano rani, dve sreće grabi', 'Jesi gladna', 'Volim te',
      'Volim te najviše na svetu', 'Moja najdraža unuka', 'Moja najdraža!', 'Ti si moje sunce', 'Donesi mi kristale',
      'Ponosan sam na tebe', 'Moja mala čarobnica', 'Kraljević Marko', 'Zmaj', 'Baba hat Pita gemacht'];
    const lines = NPCS.filter((n) => n.id === 'baba' || n.id === 'deda')
      .flatMap((n) => [...n.dialogs, ...Object.values(n.friendshipDialogs).flat()]);
    const all = lines.join('\n');
    for (const s of serbian) expect(all, s).toContain(s);
    // keine Schreibung ohne Sonderzeichen übrig, keine ijekavische Form
    const plain = /Dodji|\bcast\b|srece|najvise|najdraza|Kraljevic|carobnica|dvije|svijetu/i;
    expect(lines.filter((l) => plain.test(l))).toEqual([]);
    // genau elf Sätze tragen Sonderzeichen (Nr. 3, 4, 6, 9, 10, 13, 14, 21, 22, 23, 25 der Liste)
    expect(lines.filter((l) => /[čćšžđ]/i.test(l)).length).toBe(11);
  });
  it('außer Baba und Deda trägt niemand serbische Sonderzeichen', () => {
    const others = NPCS.filter((n) => n.id !== 'baba' && n.id !== 'deda')
      .flatMap((n) => [...n.dialogs, ...Object.values(n.friendshipDialogs).flat()]);
    expect(others.filter((l) => /[čćšžđ]/i.test(l))).toEqual([]);
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
