import { isMapId, type MapId } from '../data/maps';
import type { TiledMap, TiledObject, TiledObjectLayer, TiledTileLayer } from './tiled';

/** Objekttypen, die die Spielerin erreichen können muss. */
export const INTERACTIVE_TYPES = [
  'resource', 'wilted_plant', 'chest', 'station', 'fishing_spot', 'garden_plot',
  'trophy_shelf', 'mob_spawn', 'boss_spawn', 'unicorn_spawn', 'shell_spawn', 'npc',
] as const;

/** Abstand in Kacheln (Chebyshev) um das Objekt, in dem eine erreichbare Kachel liegen muss. */
const REACH = 2;

/** Größter Abstand in Kacheln (Chebyshev) zwischen dem Zielpunkt eines Ausgangs und dem Rück-Ausgang der Zielkarte. */
const COUNTERPART_REACH = 3;

const TYPE_NAMES: Record<string, string> = {
  resource: 'Rohstoff', wilted_plant: 'Welke Pflanze', chest: 'Truhe', station: 'Station',
  fishing_spot: 'Angelstelle', garden_plot: 'Gartenbeet', trophy_shelf: 'Trophäenregal',
  mob_spawn: 'Gegnerstelle', boss_spawn: 'Bossstelle', unicorn_spawn: 'Einhornstelle',
  shell_spawn: 'Muschelstelle', npc: 'Figur',
};

interface Grid {
  width: number;
  height: number;
  free: (x: number, y: number) => boolean;
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function tileLayer(map: TiledMap, name: string): TiledTileLayer | undefined {
  const l = map.layers.find((layer) => layer.name === name);
  return l?.type === 'tilelayer' ? l : undefined;
}

function objectLayer(map: TiledMap, name: string): TiledObjectLayer | undefined {
  const l = map.layers.find((layer) => layer.name === name);
  return l?.type === 'objectgroup' ? l : undefined;
}

function prop(o: TiledObject, name: string): string | number | boolean | undefined {
  return o.properties?.find((p) => p.name === name)?.value;
}

function gridOf(map: TiledMap, collision: TiledTileLayer): Grid {
  const { width, height } = map;
  return {
    width,
    height,
    free: (x, y) => x >= 0 && y >= 0 && x < width && y < height && collision.data[y * width + x] === 0,
  };
}

/** Rechteck eines Objekts in Kacheln (Punkte belegen eine Kachel). */
function tileRect(map: TiledMap, o: TiledObject): Rect {
  const x0 = Math.floor(o.x / map.tilewidth);
  const y0 = Math.floor(o.y / map.tileheight);
  const x1 = Math.max(x0, Math.ceil((o.x + o.width) / map.tilewidth) - 1);
  const y1 = Math.max(y0, Math.ceil((o.y + o.height) / map.tileheight) - 1);
  return { x0, y0, x1, y1 };
}

function inside(map: TiledMap, r: Rect): boolean {
  return r.x0 >= 0 && r.y0 >= 0 && r.x1 < map.width && r.y1 < map.height;
}

/** Alle von (sx, sy) aus über freie Kacheln (4er-Nachbarschaft) erreichbaren Kacheln. */
function flood(grid: Grid, sx: number, sy: number): Set<number> {
  const start = sy * grid.width + sx;
  const seen = new Set<number>([start]);
  const queue: number[] = [start];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i]!;
    const x = cur % grid.width;
    const y = Math.floor(cur / grid.width);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      const key = ny * grid.width + nx;
      if (!seen.has(key) && grid.free(nx, ny)) {
        seen.add(key);
        queue.push(key);
      }
    }
  }
  return seen;
}

function anyReachable(grid: Grid, reach: Set<number>, r: Rect, margin: number): boolean {
  for (let y = r.y0 - margin; y <= r.y1 + margin; y++) {
    for (let x = r.x0 - margin; x <= r.x1 + margin; x++) {
      if (x >= 0 && y >= 0 && x < grid.width && y < grid.height && reach.has(y * grid.width + x)) return true;
    }
  }
  return false;
}

function label(o: TiledObject): string {
  return `${TYPE_NAMES[o.type] ?? o.type} (${o.type})`;
}

/** Prüft eine Karte. Eine leere Liste bedeutet: in Ordnung. */
export function validateMap(id: MapId, maps: Record<MapId, TiledMap>): string[] {
  const map = maps[id];
  if (!map) return [`${id}: Karte fehlt`];
  const errors: string[] = [];

  const collision = tileLayer(map, 'collision');
  const spawnLayer = objectLayer(map, 'spawn');
  const exitLayer = objectLayer(map, 'exits');
  const objectsLayer = objectLayer(map, 'objects');
  const npcLayer = objectLayer(map, 'npcs');
  if (!collision) errors.push(`${id}: Ebene „collision“ fehlt`);
  if (!spawnLayer) errors.push(`${id}: Ebene „spawn“ fehlt`);
  if (!exitLayer) errors.push(`${id}: Ebene „exits“ fehlt`);
  if (!objectsLayer) errors.push(`${id}: Ebene „objects“ fehlt`);
  if (!npcLayer) errors.push(`${id}: Ebene „npcs“ fehlt`);
  if (!collision) return errors;
  const grid = gridOf(map, collision);

  // Regel 1: genau ein Startpunkt, innerhalb der Karte, auf freier Kachel
  let reach: Set<number> | null = null;
  if (spawnLayer) {
    if (spawnLayer.objects.length !== 1) {
      errors.push(`${id}: Es muss genau einen Startpunkt geben, gefunden: ${spawnLayer.objects.length}`);
    } else {
      const s = spawnLayer.objects[0]!;
      const sx = Math.floor(s.x / map.tilewidth);
      const sy = Math.floor(s.y / map.tileheight);
      if (!inside(map, { x0: sx, y0: sy, x1: sx, y1: sy })) {
        errors.push(`${id}: Startpunkt bei ${sx}/${sy} liegt außerhalb der Karte`);
      } else if (!grid.free(sx, sy)) {
        errors.push(`${id}: Startpunkt bei ${sx}/${sy} liegt in einer Wand`);
      } else {
        reach = flood(grid, sx, sy);
      }
    }
  }

  // Regeln 2, 3 und 5 für Ausgänge
  for (const e of exitLayer?.objects ?? []) {
    const r = tileRect(map, e);
    const pos = `${r.x0}/${r.y0}`;
    if (!inside(map, r)) {
      errors.push(`${id}: Ausgang bei ${pos} liegt außerhalb der Karte`);
      continue;
    }
    const target = prop(e, 'target');
    const sx = prop(e, 'spawnX');
    const sy = prop(e, 'spawnY');
    if (typeof target !== 'string' || !isMapId(target) || !maps[target]) {
      errors.push(`${id}: Ausgang bei ${pos} führt zu einer unbekannten Karte (${String(target)})`);
    } else {
      const tmap = maps[target];
      const backs = (objectLayer(tmap, 'exits')?.objects ?? []).filter((o) => prop(o, 'target') === id);
      if (backs.length === 0) errors.push(`${id}: Ausgang bei ${pos} nach ${target} hat kein Gegenstück (kein Ausgang zurück)`);
      const tcol = tileLayer(tmap, 'collision');
      if (typeof sx !== 'number' || typeof sy !== 'number') {
        errors.push(`${id}: Ausgang bei ${pos} nach ${target} hat keinen Zielpunkt`);
      } else {
        if (tcol && !gridOf(tmap, tcol).free(sx, sy)) {
          errors.push(`${id}: Ausgang bei ${pos} nach ${target}: Zielpunkt ${sx}/${sy} liegt in einer Wand oder außerhalb der Karte`);
        }
        // Gegenstück-Regel: Der Zielpunkt liegt höchstens COUNTERPART_REACH Kacheln neben einem Ausgang, der zurückführt.
        const near = backs.some((b) => {
          const br = tileRect(tmap, b);
          const dx = Math.max(br.x0 - sx, 0, sx - br.x1);
          const dy = Math.max(br.y0 - sy, 0, sy - br.y1);
          return Math.max(dx, dy) <= COUNTERPART_REACH;
        });
        if (backs.length > 0 && !near) {
          errors.push(`${id}: Ausgang bei ${pos} nach ${target}: Zielpunkt liegt nicht beim Rück-Ausgang`);
        }
      }
    }
    if (reach && !anyReachable(grid, reach, r, 0)) {
      errors.push(`${id}: Ausgang bei ${pos} ist vom Startpunkt aus nicht erreichbar`);
    }
  }

  // Regeln 4 und 5 für Objekte und Figuren
  for (const layer of [objectsLayer, npcLayer]) {
    for (const o of layer?.objects ?? []) {
      const r = tileRect(map, o);
      const pos = `${r.x0}/${r.y0}`;
      if (!inside(map, r)) {
        errors.push(`${id}: ${label(o)} bei ${pos} liegt außerhalb der Karte`);
        continue;
      }
      const interactive = (INTERACTIVE_TYPES as readonly string[]).includes(o.type);
      if (interactive && reach && !anyReachable(grid, reach, r, REACH)) {
        errors.push(`${id}: ${label(o)} bei ${pos} ist nicht erreichbar`);
      }
    }
  }
  return errors;
}
