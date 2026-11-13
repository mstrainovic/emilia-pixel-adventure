import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MAP_IDS, type MapId } from '../../src/data/maps';
import type { TiledMap } from '../../src/maps/tiled';
import { validateMap } from '../../src/maps/validate';

const maps = Object.fromEntries(
  MAP_IDS.map((id) => [
    id,
    JSON.parse(readFileSync(fileURLToPath(new URL(`../../src/assets/maps/${id}.json`, import.meta.url)), 'utf8')) as TiledMap,
  ]),
) as Record<MapId, TiledMap>;

// Nur mit Begründung im Kommentar füllen: echte Mängel der alten Karten, behoben erst mit der Neugestaltung.
const KNOWN_LEGACY_ISSUES: Record<string, string[]> = {
  lake: [
    // Der Südausgang (y 34, Höhe 2) ragt eine Kachel über den Kartenrand (Höhe 35) hinaus; Spielen ist möglich, der Rand schneidet ihn ab.
    'lake: Ausgang bei 20/34 liegt außerhalb der Karte',
  ],
  grotto: [
    // Zwei Muschel-Rohstoffe liegen mitten im Fels (Kollision 1 ringsum), im alten Spiel nicht erreichbar.
    'grotto: Rohstoff (resource) bei 10/15 ist nicht erreichbar',
    'grotto: Rohstoff (resource) bei 32/25 ist nicht erreichbar',
  ],
  cloud_castle: [
    // Der Zielpunkt 12/2 des Südausgangs in der Einhornwiese liegt auf einer gesperrten Kachel (alter Rückweg setzt die Spielerin in eine Wand).
    'cloud_castle: Ausgang bei 13/44 nach unicorn_meadow: Zielpunkt 12/2 liegt in einer Wand oder außerhalb der Karte',
  ],
};

describe('exportierte Karten', () => {
  it.each(MAP_IDS)('%s ist stimmig', (id) => {
    expect(validateMap(id, maps)).toEqual(KNOWN_LEGACY_ISSUES[id] ?? []);
  });

  it('Größen wie im alten Spiel', () => {
    expect(Object.fromEntries(MAP_IDS.map((id) => [id, [maps[id].width, maps[id].height]]))).toEqual({
      hub: [40, 32], forest: [50, 40], dungeon: [35, 30], lake: [45, 35], unicorn_meadow: [25, 20],
      beach: [55, 35], grotto: [45, 40], cloud_castle: [50, 45], starsky: [30, 25],
    });
  });

  it('jede Truhe hat eine eindeutige Kennung, auch die ohne eigene im alten Spiel', () => {
    const ids: string[] = [];
    for (const id of MAP_IDS) {
      for (const layer of maps[id].layers) {
        if (layer.type !== 'objectgroup') continue;
        for (const o of layer.objects) {
          if (o.type !== 'chest') continue;
          const prop = o.properties?.find((p) => p.name === 'id');
          expect(typeof prop?.value, `${id}: Truhe ${o.id}`).toBe('string');
          expect((prop?.value as string).length).toBeGreaterThan(0);
          ids.push(prop?.value as string);
        }
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('chest_hub_9_9');
    expect(ids).toContain('chest_hub_33_12');
  });
});
