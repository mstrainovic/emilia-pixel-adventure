import { describe, expect, it } from 'vitest';
// @ts-expect-error -- Altbestand ist untypisiertes JavaScript (Grenze zum Altspiel)
import { convertLegacyMap, seededRandom } from '../../tools/legacy-maps/convert.mjs';

const legacy = {
  width: 3, height: 2, ground: [[0, 4, -1], [8, 0, 0]], collision: [[0, 0, 1], [0, 0, 0]],
  props: [{ type: 'chest', x: 1, y: 1, loot: 'coins' }, { type: 'station', x: 0, y: 0, w: 2, h: 1, stationId: 'cooking' }],
  exits: [{ id: 'east', x: 2, y: 1, w: 1, h: 1, target: 'forest', spawnX: 5, spawnY: 6 }],
  npcs: [{ id: 'oma', name: 'Oma', x: 0, y: 1 }], playerSpawn: { x: 1, y: 0 },
};

describe('Umwandlung alter Karten', () => {
  it('wandelt eine kleine Karte um', () => {
    const m = convertLegacyMap('hub', legacy);
    const layer = (n: string) => m.layers.find((l: { name: string }) => l.name === n)!;
    expect([m.width, m.height, m.tilewidth, m.tileheight]).toEqual([3, 2, 16, 16]);
    expect(layer('ground').data).toEqual([1, 5, 0, 9, 1, 1]);
    expect(layer('collision').data).toEqual([0, 0, 1, 0, 0, 0]);
    const objs = layer('objects').objects;
    expect(objs[0]).toMatchObject({ type: 'chest', x: 16, y: 16, width: 16, height: 16 });
    expect(objs[0].properties).toContainEqual({ name: 'loot', type: 'string', value: 'coins' });
    expect(objs[1]).toMatchObject({ type: 'station', x: 0, y: 0, width: 32, height: 16 });
    expect(layer('npcs').objects[0]).toMatchObject({ name: 'oma', x: 0, y: 16 });
    const exit = layer('exits').objects[0];
    expect(exit).toMatchObject({ x: 32, y: 16, width: 16, height: 16 });
    expect(exit.properties).toContainEqual({ name: 'target', type: 'string', value: 'forest' });
    expect(layer('spawn').objects[0]).toMatchObject({ x: 16, y: 0, point: true });
  });

  it('typisiert Eigenschaften und vergibt eindeutige Kennungen', () => {
    const m = convertLegacyMap('x', {
      ...legacy,
      props: [{ type: 'resource', x: 0, y: 0, n: 3, f: 0.5, b: true, list: [1, 2], o: null, u: undefined, fn: () => 1 }],
    });
    const props = m.layers[2].objects[0].properties;
    expect(props).toEqual([
      { name: 'n', type: 'int', value: 3 }, { name: 'f', type: 'float', value: 0.5 },
      { name: 'b', type: 'bool', value: true }, { name: 'list', type: 'string', value: '[1,2]' },
      { name: 'o', type: 'string', value: 'null' },
    ]);
    const ids = m.layers.flatMap((l: { objects?: { id: number }[] }) => (l.objects ?? []).map((o) => o.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(m.nextobjectid).toBe(Math.max(...ids) + 1);
  });

  it('brennt für Truhen ohne Kennung die Kennung des alten Spiels ein', () => {
    const m = convertLegacyMap('hub', {
      ...legacy,
      props: [
        { type: 'chest', x: 1, y: 1, loot: 'coins' },
        { type: 'chest', x: 4, y: 5, id: 'x1' },
        { type: 'station', x: 0, y: 0, stationId: 'cooking' },
      ],
    });
    const props = (i: number) => m.layers[2].objects[i].properties;
    expect(props(0)).toContainEqual({ name: 'id', type: 'string', value: 'chest_hub_1_1' });
    expect(props(1)).toContainEqual({ name: 'id', type: 'string', value: 'x1' });
    expect(props(1).filter((p: { name: string }) => p.name === 'id')).toHaveLength(1);
    expect(props(2).some((p: { name: string }) => p.name === 'id')).toBe(false);
  });

  it('seededRandom ist wiederholbar', () => {
    const a = seededRandom(1), b = seededRandom(1);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
