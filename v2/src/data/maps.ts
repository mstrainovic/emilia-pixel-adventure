/** Kennungen aller Karten. Die Reihenfolge entspricht den Szenen des alten Spiels. */
export const MAP_IDS = [
  'hub', 'forest', 'dungeon', 'lake', 'unicorn_meadow', 'beach', 'grotto', 'cloud_castle', 'starsky',
] as const;

export type MapId = (typeof MAP_IDS)[number];

export function isMapId(value: unknown): value is MapId {
  return typeof value === 'string' && (MAP_IDS as readonly string[]).includes(value);
}
