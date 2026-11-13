import { describe, expect, it } from 'vitest';
import { convertLegacyMap } from '../../tools/legacy-maps/convert.mjs';
import { validateMap } from '../../src/maps/validate';
import type { MapId } from '../../src/data/maps';
import type { TiledMap, TiledObjectLayer } from '../../src/maps/tiled';

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
  });

  it('meldet ein Objekt außerhalb der Karte', () => {
    const maps = build((l) => { l.hub.props.push({ type: 'tree', x: 20, y: 1 } as never); });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('20/1');
    expect(msgs[0]).toContain('außerhalb');
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

  // Hilfen für die folgenden Fälle: Wandring um die Kachel 3/3 im gegebenen Chebyshev-Abstand.
  const ring = (l: Legacy, d: number): void => {
    for (let y = 3 - d; y <= 3 + d; y++) {
      for (let x = 3 - d; x <= 3 + d; x++) {
        if (Math.max(Math.abs(x - 3), Math.abs(y - 3)) === d) l.hub.collision[y]![x] = 1;
      }
    }
    l.hub.playerSpawn = { x: 0, y: 0 };
    l.hub.npcs = [];
  };
  const spawnObjects = (maps: Record<MapId, TiledMap>) =>
    (maps.hub.layers.find((l) => l.name === 'spawn') as TiledObjectLayer).objects;

  it('meldet einen eingemauerten Ausgang (Regel 3)', () => {
    // Die Ausgangsfläche 7/2 bis 7/3 ist frei, aber ringsum gesperrt.
    const maps = build((l) => {
      for (const [x, y] of [[6, 2], [6, 3], [7, 1], [7, 4]] as const) l.hub.collision[y]![x] = 1;
    });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('7/2');
  });

  it('meldet einen fehlenden Startpunkt', () => {
    const maps = build();
    spawnObjects(maps).length = 0;
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('Startpunkt');
  });

  it('meldet zwei Startpunkte', () => {
    const maps = build();
    const objs = spawnObjects(maps);
    objs.push({ ...objs[0]!, id: 999, x: 32, y: 32 });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('Startpunkt');
  });

  it('meldet einen Startpunkt außerhalb der Karte', () => {
    const maps = build();
    spawnObjects(maps)[0]!.x = 20 * 16;
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('20/1');
    expect(msgs[0]).toContain('außerhalb');
  });

  it('meldet eine gültige Zielkarte, die nicht im Satz liegt, ohne Ausnahme', () => {
    const maps = build((l) => { l.hub.exits[0]!.target = 'lake'; });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('7/2');
    expect(msgs[0]).toContain('lake');
  });

  it('lässt eine Truhe zu, deren nächste erreichbare Kachel genau 2 entfernt ist', () => {
    const maps = build((l) => ring(l, 1));
    expect(validateMap('hub', maps)).toEqual([]);
  });

  it('meldet eine Truhe, deren nächste erreichbare Kachel 3 entfernt ist', () => {
    const maps = build((l) => ring(l, 2));
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('chest');
    expect(msgs[0]).toContain('3/3');
  });

  it('prüft nur interaktive Typen auf Erreichbarkeit', () => {
    const maps = build((l) => {
      ring(l, 2);
      l.hub.props = [{ type: 'tree', x: 3, y: 3 } as never];
    });
    expect(validateMap('hub', maps)).toEqual([]);
  });

  it('meldet einen Ausgang, der über den Kartenrand ragt', () => {
    const maps = build((l) => { Object.assign(l.hub.exits[0]!, { y: 5, h: 2 }); });
    const msgs = validateMap('hub', maps);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toContain('hub');
    expect(msgs[0]).toContain('7/5');
  });
});
