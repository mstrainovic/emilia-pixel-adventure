/** Kennungen aller Karten. Die Reihenfolge entspricht den Szenen des alten Spiels. */
export const MAP_IDS = [
  'hub', 'forest', 'dungeon', 'lake', 'unicorn_meadow', 'beach', 'grotto', 'cloud_castle', 'starsky',
] as const;

export type MapId = (typeof MAP_IDS)[number];

export function isMapId(value: unknown): value is MapId {
  return typeof value === 'string' && (MAP_IDS as readonly string[]).includes(value);
}

/** Startpunkt eines neuen Spiels: Fußpunkt in Kacheln, Mitte der Kachel 19/14 (Quelle: playerSpawn im alten hub.js). */
export const HUB_START = { map: 'hub', x: 19.5, y: 14.5 } as const;
