import { describe, expect, it } from 'vitest';
import { buildWorldMap } from '../../src/maps/model';
import type { TiledLayer, TiledMap, TiledObject } from '../../src/maps/tiled';
import { loadGameMaps } from './loadMaps';

const W = 4;
const H = 3;

function obj(id: number, type: string, x: number, y: number, extra: Partial<TiledObject> = {}): TiledObject {
  return { id, name: '', type, x, y, width: 16, height: 16, rotation: 0, visible: true, ...extra };
}

/** Kleine 4×3-Karte: Mauer auf Kachel 0/0, eine Figur auf 2/1, ein Brunnen, ein Ausgang, Startpunkt bei 16/16. */
function smallMap(drop: string | null = null): TiledMap {
  const tiles = (fill: number): number[] => Array<number>(W * H).fill(fill);
  const collision = tiles(0);
  collision[0] = 1;
  const layers: TiledLayer[] = [
    { id: 1, name: 'ground', type: 'tilelayer', width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: tiles(1) },
    { id: 2, name: 'ground_detail', type: 'tilelayer', width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: tiles(0) },
    { id: 3, name: 'collision', type: 'tilelayer', width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: collision },
    {
      id: 4, name: 'objects', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true,
      objects: [
        obj(1, 'tree', 48, 32, {
          properties: [
            { name: 'variant', type: 'string', value: 'pine_dark' },
            { name: 'loot', type: 'string', value: 'apfel' },
            { name: 'count', type: 'int', value: 3 },
          ],
        }),
        obj(2, 'well', 0, 32, { width: 32 }),
      ],
    },
    {
      id: 5, name: 'npcs', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true,
      objects: [obj(3, 'npc', 32, 16, { name: 'oma', properties: [{ name: 'facing', type: 'string', value: 'left' }] })],
    },
    {
      id: 6, name: 'exits', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true,
      objects: [obj(4, 'exit', 48, 0, {
        name: 'east', height: 32,
        properties: [
          { name: 'target', type: 'string', value: 'forest' },
          { name: 'spawnX', type: 'int', value: 1 },
          { name: 'spawnY', type: 'int', value: 2 },
        ],
      })],
    },
    {
      id: 7, name: 'spawn', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true,
      objects: [obj(5, 'spawn', 16, 16, { width: 0, height: 0, point: true })],
    },
  ];
  return {
    type: 'map', version: '1.10', tiledversion: '1.11.0', orientation: 'orthogonal', renderorder: 'right-down',
    infinite: false, width: W, height: H, tilewidth: 16, tileheight: 16, nextlayerid: 8, nextobjectid: 6,
    tilesets: [{ firstgid: 1, name: 'dorf', tilewidth: 16, tileheight: 16, tilecount: 32, columns: 16, image: 'dorf.png', imagewidth: 256, imageheight: 32, margin: 0, spacing: 0 }],
    layers: layers.filter((l) => l.name !== drop),
  };
}

describe('Kartenmodell', () => {
  it('misst die Karte in Bildpunkten', () => {
    const world = buildWorldMap('hub', smallMap());
    expect(world.id).toBe('hub');
    expect(world.widthPx).toBe(64);
    expect(world.heightPx).toBe(48);
    expect(world.solid.width).toBe(4);
    expect(world.solid.height).toBe(3);
  });

  it('behandelt alles außerhalb der Karte als fest', () => {
    const { solid } = buildWorldMap('hub', smallMap());
    expect(solid.isSolid(-1, 0)).toBe(true);
    expect(solid.isSolid(4, 0)).toBe(true);
    expect(solid.isSolid(0, -1)).toBe(true);
    expect(solid.isSolid(0, 3)).toBe(true);
  });

  it('liest gesperrte Kacheln aus der Ebene collision', () => {
    const { solid } = buildWorldMap('hub', smallMap());
    expect(solid.isSolid(0, 0)).toBe(true);
    expect(solid.isSolid(1, 0)).toBe(false);
    expect(solid.isSolid(3, 2)).toBe(false);
  });

  it('setzt Figuren auf die Mitte ihrer Kachel und sperrt diese Kachel', () => {
    const world = buildWorldMap('hub', smallMap());
    expect(world.npcs).toEqual([{ npcId: 'oma', x: 40, y: 24, facing: 'left' }]);
    expect(world.solid.isSolid(2, 1)).toBe(true);
  });

  it('legt den Startpunkt auf die Mitte seiner Kachel', () => {
    expect(buildWorldMap('hub', smallMap()).spawn).toEqual({ x: 24, y: 24 });
  });

  it('trennt variant von den übrigen Eigenschaften', () => {
    const [tree, well] = buildWorldMap('hub', smallMap()).objects;
    expect(tree).toEqual({ id: 1, type: 'tree', variant: 'pine_dark', x: 56, y: 40, props: { loot: 'apfel', count: 3 } });
    // zwei Kacheln breit: Fußpunkt mittig unter dem ganzen Objekt
    expect(well).toEqual({ id: 2, type: 'well', variant: null, x: 16, y: 40, props: {} });
  });

  it('übernimmt Ausgänge mit Zielpunkt in Bildpunkten', () => {
    expect(buildWorldMap('hub', smallMap()).exits).toEqual([
      { name: 'east', x: 48, y: 0, width: 16, height: 32, target: 'forest', spawnX: 24, spawnY: 40 },
    ]);
  });

  it('wirft, wenn eine Ebene fehlt', () => {
    expect(() => buildWorldMap('hub', smallMap('collision'))).toThrow('Karte hub: Ebene „collision" fehlt');
    expect(() => buildWorldMap('hub', smallMap('npcs'))).toThrow('Karte hub: Ebene „npcs" fehlt');
  });

  it('liest das echte Dorf', () => {
    const hub = loadGameMaps().hub;
    const world = buildWorldMap('hub', hub);
    expect(world.widthPx).toBe(640);
    expect(world.heightPx).toBe(512);
    expect(world.npcs).toHaveLength(9);
    expect(world.exits).toHaveLength(3);
    expect(world.objects.length).toBeGreaterThan(200);
    expect(world.solid.isSolid(Math.floor(world.spawn.x / 16), Math.floor(world.spawn.y / 16))).toBe(false);
  });
});
