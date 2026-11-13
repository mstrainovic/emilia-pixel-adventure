import { describe, expect, it } from 'vitest';
import { convertLegacyMap } from '../../tools/legacy-maps/convert.mjs';
import { validateMap } from '../../src/maps/validate';
import type { MapId } from '../../src/data/maps';
import type { TiledMap } from '../../src/maps/tiled';

const free = (w: number, h: number): number[][] => Array.from({ length: h }, () => Array<number>(w).fill(0));
const ground = (w: number, h: number): number[][] => Array.from({ length: h }, () => Array<number>(w).fill(0));

/** Zwei verbundene 8x6-Karten: hub (Ausgang rechts) und forest (Ausgang links). */
function legacyPair() {
  const hub = {
    width: 8, height: 6, ground: ground(8, 6), collision: free(8, 6),
    props: [{ type: 'chest', x: 3, y: 3, loot: 'coins' }],
    exits: [{ id: 'east', x: 7, y: 2, w: 1, h: 2, target: 'forest', spawnX: 1, spawnY: 2 }],
    npcs: [{ id: 'oma', x: 2, y: 1 }], playerSpawn: { x: 1, y: 1 },
  };
  const forest = {
    width: 8, height: 6, ground: ground(8, 6), collision: free(8, 6), props: [],
    exits: [{ id: 'west', x: 0, y: 2, w: 1, h: 2, target: 'hub', spawnX: 6, spawnY: 2 }],
    playerSpawn: { x: 2, y: 2 },
  };
  return { hub, forest };
}

type Legacy = ReturnType<typeof legacyPair>;

function build(mutate: (l: Legacy) => void = () => {}): Record<MapId, TiledMap> {
  const l = legacyPair();
  mutate(l);
  const maps = { hub: convertLegacyMap('hub', l.hub), forest: convertLegacyMap('forest', l.forest) };
  return maps as unknown as Record<MapId, TiledMap>;
}

describe('Kartenprüfung', () => {
  it('akzeptiert die gültige Kombination', () => {
    const maps = build();
    expect(validateMap('hub', maps)).toEqual([]);
    expect(validateMap('forest', maps)).toEqual([]);
  });

  it('meldet einen Startpunkt in der Wand', () => {
    const maps = build((l) => { l.hub.collision[1]![1] = 1; });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('1/1');
  });

  it('meldet einen Ausgang ohne Gegenstück', () => {
    const maps = build((l) => { l.forest.exits = []; });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('7/2');
  });

  it('meldet einen Zielpunkt in der Wand', () => {
    const maps = build((l) => { l.forest.collision[2]![1] = 1; });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('1/2');
  });

  it('meldet eine eingemauerte Truhe', () => {
    // Ein Ring aus Wänden im Abstand 2 um die Truhe bei 3/3: innen ist alles frei, aber vom Startpunkt nicht erreichbar.
    const maps = build((l) => {
      for (let y = 1; y <= 5; y++) {
        for (let x = 1; x <= 5; x++) if (x === 1 || x === 5 || y === 1 || y === 5) l.hub.collision[y]![x] = 1;
      }
      l.hub.playerSpawn = { x: 0, y: 0 };
      l.hub.npcs = [];
    });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('chest');
    expect(msgs[0]).toContain('3/3');
    expect(maps).toBeDefined();
  });

  it('meldet ein Objekt außerhalb der Karte', () => {
    const maps = build((l) => { l.hub.props.push({ type: 'tree', x: 20, y: 1 } as never); });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('20/1');
  });

  it('meldet ein unbekanntes Ziel', () => {
    const maps = build((l) => { l.hub.exits[0]!.target = 'mars'; });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('mars');
  });

  it('meldet eine fehlende Ebene als Meldung statt als Ausnahme', () => {
    const maps = build();
    maps.hub.layers = maps.hub.layers.filter((l) => l.name !== 'collision');
    const msgs = validateMap('hub', maps);
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs[0]).toContain('collision');
  });
});
