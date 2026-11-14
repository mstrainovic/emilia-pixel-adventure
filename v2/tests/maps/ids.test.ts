import { describe, expect, it } from 'vitest';
import { HUB_START, MAP_IDS } from '../../src/data/maps';
import { ITEMS } from '../../src/data/items';
import { NPCS } from '../../src/data/npcs';
import { RECIPES } from '../../src/data/recipes';
import type { TiledMap, TiledObject, TiledObjectLayer } from '../../src/maps/tiled';
import { loadGameMaps } from './loadMaps';

const maps = loadGameMaps();

const layerObjects = (map: TiledMap, name: string): TiledObject[] =>
  map.layers.filter((l): l is TiledObjectLayer => l.type === 'objectgroup' && l.name === name).flatMap((l) => l.objects);
const prop = (o: TiledObject, name: string) => o.properties?.find((p) => p.name === name)?.value;

/** Figuren vom Typ npc in der Ebene objects (nicht npcs), die noch nicht in die Ebene npcs gehören.
 *  Die Sternenhimmel-Karte stellt die acht Familienmitglieder als Dekoration auf; Etappe 6 gestaltet sie neu. */
const KNOWN = new Set([
  'starsky:mama_tanja', 'starsky:papa_milos', 'starsky:oma', 'starsky:opa',
  'starsky:baba', 'starsky:deda', 'starsky:marie', 'starsky:liam', // Etappe 6
]);

describe('Kennungen in den Karten', () => {
  it('jeder Name in npcs ist ein Dorfbewohner und kommt je Karte einmal vor', () => {
    const known = new Set(NPCS.map((n) => n.id));
    for (const id of MAP_IDS) {
      const names = layerObjects(maps[id], 'npcs').map((o) => o.name);
      for (const name of names) expect(known.has(name), `${id}: ${name}`).toBe(true);
      expect(new Set(names).size, `${id}: doppelte Figur`).toBe(names.length);
    }
  });

  it('alle neun Dorfbewohner stehen in hub', () => {
    const names = layerObjects(maps.hub, 'npcs').map((o) => o.name).sort();
    expect(names).toEqual(NPCS.map((n) => n.id).sort());
    expect(names).toHaveLength(9);
  });

  it('jede Figur hat eine Blickrichtung', () => {
    for (const id of MAP_IDS) {
      for (const o of layerObjects(maps[id], 'npcs')) {
        expect(['down', 'up', 'left', 'right'], `${id}: ${o.name}`).toContain(prop(o, 'facing'));
      }
    }
  });

  it('Figuren vom Typ npc in objects sind nur die bekannten Reste', () => {
    const found = MAP_IDS.flatMap((id) =>
      layerObjects(maps[id], 'objects').filter((o) => o.type === 'npc').map((o) => `${id}:${String(prop(o, 'id'))}`));
    expect(found.filter((f) => !KNOWN.has(f))).toEqual([]);
  });

  it('jede Station hat Rezepte', () => {
    for (const id of MAP_IDS) {
      for (const o of layerObjects(maps[id], 'objects').filter((x) => x.type === 'station')) {
        expect(Object.keys(RECIPES), `${id}: Station ${String(prop(o, 'station'))}`).toContain(prop(o, 'station'));
      }
    }
  });

  it('jeder Gegenstand eines Rohstoffs gibt es', () => {
    for (const id of MAP_IDS) {
      for (const o of layerObjects(maps[id], 'objects').filter((x) => x.type === 'resource')) {
        const itemId = prop(o, 'itemId');
        if (itemId === undefined) continue; // Bäume, Erz und Erde nennen ihren Gegenstand nicht; er folgt aus resourceType.
        expect(ITEMS[itemId as string], `${id}: ${String(itemId)}`).toBeDefined();
      }
    }
  });

  it('der Startpunkt eines neuen Spiels liegt auf der Startkachel von hub', () => {
    const s = layerObjects(maps.hub, 'spawn')[0]!;
    expect(HUB_START.map).toBe('hub');
    expect([Math.floor(HUB_START.x), Math.floor(HUB_START.y)]).toEqual([Math.floor(s.x / 16), Math.floor(s.y / 16)]);
  });
});
