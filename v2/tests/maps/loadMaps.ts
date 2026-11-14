import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MAP_IDS, type MapId } from '../../src/data/maps';
import type { TiledMap } from '../../src/maps/tiled';

const read = (rel: string): TiledMap =>
  JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')) as TiledMap;

/** Die eingefrorenen Vorlagen aus dem alten Spiel (tools/legacy-maps/exported). */
export function loadLegacyMaps(): Record<MapId, TiledMap> {
  return Object.fromEntries(
    MAP_IDS.map((id) => [id, read(`../../tools/legacy-maps/exported/${id}.json`)]),
  ) as Record<MapId, TiledMap>;
}

/**
 * Die Karten, die das Spiel lädt: src/assets/maps/<id>.json, solange eine neu gestaltete Karte
 * existiert, sonst die alte Vorlage (die Neugestaltung läuft Karte für Karte).
 */
export function loadGameMaps(): Record<MapId, TiledMap> {
  const legacy = loadLegacyMaps();
  return Object.fromEntries(
    MAP_IDS.map((id) => {
      const url = new URL(`../../src/assets/maps/${id}.json`, import.meta.url);
      return [id, existsSync(fileURLToPath(url)) ? read(`../../src/assets/maps/${id}.json`) : legacy[id]];
    }),
  ) as Record<MapId, TiledMap>;
}
