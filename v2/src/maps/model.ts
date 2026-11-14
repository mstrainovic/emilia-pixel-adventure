import { isMapId, type MapId } from '../data/maps';
import type { Facing } from '../data/types';
import type { SolidGrid } from '../systems/collision';
import { bodyFits } from '../systems/movement';
import type { TiledMap, TiledObject, TiledObjectLayer, TiledTileLayer } from './tiled';

/*
 * Kartenmodell für die Welt-Szene, ohne Phaser. Alle Orte in Bildpunkten; der Fußpunkt eines Objekts ist
 * die Mitte der Kachel(n), die es in Tiled belegt (ein Punkt belegt die Kachel, in der er liegt).
 */

export type PropValue = string | number | boolean;

export interface WorldObject {
  id: number;
  type: string;
  variant: string | null;
  x: number;
  y: number;
  props: Readonly<Record<string, PropValue>>;
}

export interface WorldNpc {
  npcId: string;
  x: number;
  y: number;
  facing: Facing;
}

/** Rechteck des Ausgangs wie in Tiled (links oben, Bildpunkte); Zielpunkt = Mitte der Zielkachel in Bildpunkten. */
export interface WorldExit {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  target: MapId;
  spawnX: number;
  spawnY: number;
}

export interface WorldMap {
  id: MapId;
  widthPx: number;
  heightPx: number;
  solid: SolidGrid;
  objects: readonly WorldObject[];
  npcs: readonly WorldNpc[];
  exits: readonly WorldExit[];
  spawn: { x: number; y: number };
}

const FACINGS: readonly Facing[] = ['down', 'up', 'left', 'right'];

function layerMissing(id: MapId, name: string): Error {
  return new Error(`Karte ${id}: Ebene „${name}“ fehlt`);
}

function tileLayer(id: MapId, tiled: TiledMap, name: string): TiledTileLayer {
  const layer = tiled.layers.find((l) => l.name === name);
  if (layer?.type !== 'tilelayer') throw layerMissing(id, name);
  return layer;
}

function objectLayer(id: MapId, tiled: TiledMap, name: string): TiledObjectLayer {
  const layer = tiled.layers.find((l) => l.name === name);
  if (layer?.type !== 'objectgroup') throw layerMissing(id, name);
  return layer;
}

function propOf(o: TiledObject, name: string): PropValue | undefined {
  return o.properties?.find((p) => p.name === name)?.value;
}

/** Kacheln, die ein Objekt belegt (ein Punkt belegt eine Kachel). */
function tileSpan(tiled: TiledMap, o: TiledObject): { x0: number; y0: number; x1: number; y1: number } {
  const x0 = Math.floor(o.x / tiled.tilewidth);
  const y0 = Math.floor(o.y / tiled.tileheight);
  const x1 = Math.max(x0, Math.ceil((o.x + o.width) / tiled.tilewidth) - 1);
  const y1 = Math.max(y0, Math.ceil((o.y + o.height) / tiled.tileheight) - 1);
  return { x0, y0, x1, y1 };
}

/** Fußpunkt: Mitte der belegten Kacheln, in Bildpunkten. */
function footOf(tiled: TiledMap, o: TiledObject): { x: number; y: number } {
  const s = tileSpan(tiled, o);
  return { x: ((s.x0 + s.x1 + 1) * tiled.tilewidth) / 2, y: ((s.y0 + s.y1 + 1) * tiled.tileheight) / 2 };
}

function toObject(tiled: TiledMap, o: TiledObject): WorldObject {
  const props: Record<string, PropValue> = {};
  let variant: string | null = null;
  for (const p of o.properties ?? []) {
    if (p.name === 'variant') variant = String(p.value);
    else props[p.name] = p.value;
  }
  return { id: o.id, type: o.type, variant, ...footOf(tiled, o), props };
}

function toNpc(id: MapId, tiled: TiledMap, o: TiledObject): WorldNpc {
  const facing = propOf(o, 'facing') ?? 'down';
  if (!FACINGS.includes(facing as Facing)) throw new Error(`Karte ${id}: Figur ${o.name} hat eine unbekannte Blickrichtung (${String(facing)})`);
  return { npcId: o.name, ...footOf(tiled, o), facing: facing as Facing };
}

function toExit(id: MapId, tiled: TiledMap, o: TiledObject): WorldExit {
  const target = propOf(o, 'target');
  const spawnX = propOf(o, 'spawnX');
  const spawnY = propOf(o, 'spawnY');
  if (!isMapId(target)) throw new Error(`Karte ${id}: Ausgang ${o.name} führt zu einer unbekannten Karte (${String(target)})`);
  if (typeof spawnX !== 'number' || typeof spawnY !== 'number') throw new Error(`Karte ${id}: Ausgang ${o.name} hat keinen Zielpunkt`);
  return {
    name: o.name, x: o.x, y: o.y, width: o.width, height: o.height, target,
    spawnX: spawnX * tiled.tilewidth + tiled.tilewidth / 2,
    spawnY: spawnY * tiled.tileheight + tiled.tileheight / 2,
  };
}

/**
 * Wo die Spielerin auf dieser Karte beginnt, in Bildpunkten. `saved` ist der Fußpunkt aus dem Spielstand in
 * Kacheln (Gleitkomma). Er gilt nur auf derselben Karte und nur, wenn ihr ganzer Körper (PLAYER_BODY) dort frei
 * steht – ragt er auch nur teilweise in eine Wand, käme sie nie wieder los. Sonst (andere Karte, Wand, außerhalb,
 * NaN) beginnt sie am Startpunkt der Karte.
 */
export function resolveStart(map: WorldMap, saved: { map: MapId; x: number; y: number }): { x: number; y: number } {
  const fallback = { ...map.spawn };
  if (saved.map !== map.id || !Number.isFinite(saved.x) || !Number.isFinite(saved.y)) return fallback;
  const tileWidth = map.widthPx / map.solid.width;
  const tileHeight = map.heightPx / map.solid.height;
  const start = { x: saved.x * tileWidth, y: saved.y * tileHeight };
  // Der Fußpunkt selbst liegt in der Karte (nicht auf ihrem Rand); außerhalb gilt isSolid ohnehin als fest.
  const inside = start.x >= 0 && start.y >= 0 && start.x < map.widthPx && start.y < map.heightPx;
  return inside && bodyFits(map.solid, start.x, start.y) ? start : fallback;
}

/** Baut das Kartenmodell aus Tiled-JSON. Wirft, wenn eine Ebene fehlt. Die Kacheln der Figuren sind fest. */
export function buildWorldMap(id: MapId, tiled: TiledMap): WorldMap {
  const collision = tileLayer(id, tiled, 'collision');
  const objectsLayer = objectLayer(id, tiled, 'objects');
  const npcLayer = objectLayer(id, tiled, 'npcs');
  const exitLayer = objectLayer(id, tiled, 'exits');
  const spawnLayer = objectLayer(id, tiled, 'spawn');
  const spawnObject = spawnLayer.objects[0];
  if (!spawnObject) throw new Error(`Karte ${id}: Startpunkt fehlt`);

  const { width, height } = tiled;
  const blocked = collision.data.map((v) => v !== 0);
  const npcs = npcLayer.objects.map((o) => toNpc(id, tiled, o));
  for (const o of npcLayer.objects) {
    const s = tileSpan(tiled, o);
    for (let y = s.y0; y <= s.y1; y++) {
      for (let x = s.x0; x <= s.x1; x++) if (x >= 0 && y >= 0 && x < width && y < height) blocked[y * width + x] = true;
    }
  }
  const solid: SolidGrid = {
    width,
    height,
    isSolid: (x, y) => !(x >= 0 && y >= 0 && x < width && y < height) || blocked[y * width + x] === true,
  };

  return {
    id,
    widthPx: width * tiled.tilewidth,
    heightPx: height * tiled.tileheight,
    solid,
    objects: objectsLayer.objects.map((o) => toObject(tiled, o)),
    npcs,
    exits: exitLayer.objects.map((o) => toExit(id, tiled, o)),
    spawn: footOf(tiled, spawnObject),
  };
}
