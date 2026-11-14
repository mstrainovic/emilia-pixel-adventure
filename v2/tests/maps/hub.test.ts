import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PROP_DEFS, propKey } from '../../src/data/props';
import type { TiledMap, TiledObject, TiledObjectLayer, TiledTileLayer } from '../../src/maps/tiled';
import { validateMap } from '../../src/maps/validate';
// @ts-expect-error -- Karten-Werkzeuge sind untypisiertes JavaScript (laufen nur in Node, nicht im Spiel)
import { COLLISION_CHANGES, GARDEN_GATE, PATH_WIDEN, SIGNPOST_MOVE, SOLID_TYPES } from '../../tools/maps/restyle-hub.mjs';
import { loadGameMaps, loadLegacyMaps } from './loadMaps';

const HUB_JSON = fileURLToPath(new URL('../../src/assets/maps/hub.json', import.meta.url));
const TOOL = fileURLToPath(new URL('../../tools/maps/restyle-hub.mjs', import.meta.url));
const GFX = fileURLToPath(new URL('../../src/assets/gfx/', import.meta.url));

interface CollisionChange {
  x: number;
  y: number;
  blocked: boolean;
  reason: string;
}
interface Widen {
  x: number;
  y: number;
  w: number;
  h: number;
  reason: string;
}
const changes = COLLISION_CHANGES as CollisionChange[];
const widen = PATH_WIDEN as Widen[];
const solidTypes = SOLID_TYPES as string[];
const gardenGate = (GARDEN_GATE as [number, number][]).map(([x, y]) => `${x}/${y}`);
const signpostMove = SIGNPOST_MOVE as { from: [number, number]; to: [number, number] };

const template = loadLegacyMaps().hub;
const maps = loadGameMaps();
const hub = maps.hub;

const tiles = (m: TiledMap, name: string): number[] =>
  m.layers.find((l): l is TiledTileLayer => l.type === 'tilelayer' && l.name === name)!.data;
const objects = (m: TiledMap, name: string): TiledObject[] =>
  m.layers.filter((l): l is TiledObjectLayer => l.type === 'objectgroup' && l.name === name).flatMap((l) => l.objects);
const prop = (o: TiledObject, name: string) => o.properties?.find((p) => p.name === name)?.value;
const tileOf = (o: TiledObject): string => `${Math.floor(o.x / 16)}/${Math.floor(o.y / 16)}`;

/** Wegkennungen der Vorlage (altes Spiel + 1): 5, 6 Erdweg, 36–47 Wegränder (PATH_EDGES 35–46). */
const isTemplatePath = (id: number): boolean => id === 5 || id === 6 || (id >= 36 && id <= 47);

describe('neu gestaltete Dorfkarte hub', () => {
  it('ist erzeugt (npm run maps:build)', () => {
    expect(existsSync(HUB_JSON)).toBe(true);
  });

  it('hat die Größe der Vorlage, den Kachelsatz dorf und die Ebenen in fester Reihenfolge', () => {
    expect([hub.width, hub.height, hub.tilewidth, hub.tileheight]).toEqual([template.width, template.height, 16, 16]);
    expect([hub.width, hub.height]).toEqual([40, 32]);
    expect(hub.tilesets.map((t) => [t.name, t.image, t.firstgid])).toEqual([['dorf', '../gfx/tiles/dorf.png', 1]]);
    expect(hub.layers.map((l) => l.name)).toEqual(['ground', 'ground_detail', 'collision', 'objects', 'npcs', 'exits', 'spawn']);
  });

  it('übernimmt die Ausgänge unverändert (Name, Rechteck, Eigenschaften)', () => {
    const pick = (o: TiledObject) => ({ name: o.name, x: o.x, y: o.y, w: o.width, h: o.height, properties: o.properties });
    expect(objects(hub, 'exits').map(pick)).toEqual(objects(template, 'exits').map(pick));
  });

  it('übernimmt den Startpunkt', () => {
    const pick = (o: TiledObject) => [o.x, o.y, o.point];
    expect(objects(hub, 'spawn').map(pick)).toEqual(objects(template, 'spawn').map(pick));
  });

  it('jeder Dorfbewohner steht auf seiner Kachel und behält seine Blickrichtung', () => {
    const pick = (o: TiledObject) => `${o.name}@${tileOf(o)}:${String(prop(o, 'facing'))}`;
    expect(objects(hub, 'npcs').map(pick).sort()).toEqual(objects(template, 'npcs').map(pick).sort());
  });

  it('Stationen, Beete, Truhen, Regal, welke Pflanzen und Rohstoffe liegen wie in der Vorlage', () => {
    const fixed = ['station', 'garden_plot', 'chest', 'trophy_shelf', 'wilted_plant', 'resource'];
    const key = (o: TiledObject) => {
      const id = o.type === 'chest' || o.type === 'resource' ? `#${String(prop(o, 'id'))}` : '';
      const station = o.type === 'station' ? `:${String(prop(o, 'station'))}` : '';
      return `${o.type}${station}@${tileOf(o)}${id}`;
    };
    const pickAll = (m: TiledMap) => objects(m, 'objects').filter((o) => fixed.includes(o.type)).map(key).sort();
    expect(pickAll(hub)).toEqual(pickAll(template));
  });

  it('Wegweiser tragen das Ziel statt eines Textes', () => {
    const exitTarget = new Map(objects(template, 'exits').map((e) => [e.name, prop(e, 'target')]));
    const signs = objects(hub, 'objects').filter((o) => o.type === 'signpost');
    const moved = (pos: string) => (pos === signpostMove.from.join('/') ? signpostMove.to.join('/') : pos);
    const old = new Map(objects(template, 'objects').filter((o) => o.type === 'signpost').map((o) => [moved(tileOf(o)), String(prop(o, 'dir'))]));
    expect(signs.map(tileOf).sort()).toEqual([...old.keys()].sort());
    for (const s of signs) {
      expect(prop(s, 'target'), tileOf(s)).toBe(exitTarget.get(old.get(tileOf(s))!));
      expect(prop(s, 'label'), tileOf(s)).toBeUndefined();
    }
  });

  it('der Brunnen steht auf 20/13 und ist gesperrt; der alte Fels auf 19/14 ist fort', () => {
    const objs = objects(hub, 'objects');
    expect(objs.filter((o) => o.type === 'well').map(tileOf)).toEqual(['20/13']);
    expect(objs.some((o) => tileOf(o) === '19/14')).toBe(false);
    expect(tiles(hub, 'collision')[13 * 40 + 20]).not.toBe(0);
  });

  it('das Lagerfeuer steht neben dem Weg auf 22/20 (Wunsch des Auftraggebers), nicht mehr auf dem Südweg 20/19', () => {
    const fires = objects(hub, 'objects').filter((o) => o.type === 'bonfire');
    expect(fires.map(tileOf)).toEqual(['22/20']);
    expect(objects(template, 'objects').filter((o) => o.type === 'bonfire').map(tileOf)).toEqual(['20/19']);
    const col = tiles(hub, 'collision');
    expect(col[20 * 40 + 22], 'neuer Platz gesperrt').not.toBe(0);
    expect(col[19 * 40 + 20], 'alter Platz frei').toBe(0);
    // Der neue Platz ist Wiese, und kein anderes Objekt steht auf seiner Kachel.
    const weg = new Set(Object.entries(JSON.parse(readFileSync(join(GFX, 'tiles/dorf.json'), 'utf8')) as Record<string, number>)
      .filter(([k]) => k.startsWith('weg_')).map(([, v]) => v + 1));
    expect(weg.has(tiles(hub, 'ground')[20 * 40 + 22]!)).toBe(false);
    expect(objects(hub, 'objects').filter((o) => tileOf(o) === '22/20').map((o) => o.type)).toEqual(['bonfire']);
    expect(objects(hub, 'npcs').some((o) => tileOf(o) === '22/20')).toBe(false);
  });

  it('jede Wegkachel der Vorlage ist begehbar, auch die unter dem alten Lagerfeuer', () => {
    const ground = tiles(template, 'ground');
    const oldCol = tiles(template, 'collision');
    const col = tiles(hub, 'collision');
    const blockedInTemplate: string[] = [];
    const blockedNow: string[] = [];
    ground.forEach((id, i) => {
      if (!isTemplatePath(id)) return;
      const pos = `${i % 40}/${Math.floor(i / 40)}`;
      if (oldCol[i] !== 0) blockedInTemplate.push(pos);
      if (col[i] !== 0) blockedNow.push(pos);
    });
    // Einzige Ausnahme: die Truhe auf dem Vorplatz der Küche (fest seit der Stil-Prüfung); der Vorplatz ist 5×2 Kacheln groß.
    expect(blockedNow).toEqual(['9/9']);
    expect(objects(hub, 'objects').filter((o) => tileOf(o) === '9/9').map((o) => o.type)).toEqual(['chest']);
    // Die Vorlage sperrte genau eine Wegkachel: das Lagerfeuer auf dem Südweg (altes hub.js: collision[19][20] = 1).
    expect(blockedInTemplate).toEqual(['20/19']);
  });

  it('jede Abweichung der Sperrflächen steht in COLLISION_CHANGES (höchstens 40 Einträge, je mit Begründung) oder ist die Kachel eines festen Objekts', () => {
    const oldCol = tiles(template, 'collision');
    const col = tiles(hub, 'collision');
    const deviations = col.flatMap((v, i) => ((v !== 0) !== (oldCol[i] !== 0) ? [`${i % 40}/${Math.floor(i / 40)}:${v !== 0}`] : []));
    const listed = changes.map((c) => `${c.x}/${c.y}:${c.blocked}`);
    const solid = objects(hub, 'objects')
      .filter((o) => solidTypes.includes(o.type))
      .filter((o) => oldCol[Math.floor(o.y / 16) * 40 + Math.floor(o.x / 16)] === 0)
      .map((o) => `${tileOf(o)}:true`);
    // Als Menge: Der Busch 33/9 steht auf einer Kachel, die schon Dedas Haus sperrt.
    expect([...new Set([...listed, ...solid])].sort()).toEqual(deviations.sort());
    expect(listed.filter((l) => solid.includes(l))).toEqual(['33/9:true']);
    expect(changes.length).toBeLessThanOrEqual(40);
    for (const c of changes) expect(c.reason.length, `${c.x}/${c.y}`).toBeGreaterThan(10);
  });

  it('PATH_WIDEN legt Weg nur auf Kacheln, die frei sind', () => {
    const col = tiles(hub, 'collision');
    for (const w of widen) {
      for (let y = w.y; y < w.y + w.h; y++) {
        for (let x = w.x; x < w.x + w.w; x++) expect(col[y * 40 + x], `${x}/${y}`).toBe(0);
      }
      expect(w.reason.length).toBeGreaterThan(10);
    }
  });

  it('besteht die Kartenprüfung', () => {
    expect(validateMap('hub', maps)).toEqual([]);
  });

  it('jede Kachelnummer in ground und ground_detail stammt aus tiles/dorf.json', () => {
    const index = JSON.parse(readFileSync(join(GFX, 'tiles/dorf.json'), 'utf8')) as Record<string, number>;
    const allowed = new Set([0, ...Object.values(index).map((i) => i + 1)]);
    for (const name of ['ground', 'ground_detail']) {
      expect(tiles(hub, name).filter((v) => !allowed.has(v)), name).toEqual([]);
    }
    expect(tiles(hub, 'ground').filter((v) => v === 0)).toEqual([]);
  });

  it('jedes Objekt hat ein Bild in PROP_DEFS, dessen Bilder in props/dorf.json stehen', () => {
    const frames = JSON.parse(readFileSync(join(GFX, 'props/dorf.json'), 'utf8')) as Record<string, unknown>;
    const missing: string[] = [];
    for (const o of objects(hub, 'objects')) {
      const variant = prop(o, 'variant');
      const key = propKey(o.type, typeof variant === 'string' ? variant : null);
      const def = PROP_DEFS[key];
      if (!def) {
        missing.push(`${key} (${tileOf(o)})`);
        continue;
      }
      for (const f of [def.frame, ...(def.frames ?? [])]) if (!(f in frames)) missing.push(`${key}: Bild ${f}`);
    }
    expect(missing).toEqual([]);
  });

  describe('Waldrand (zwei Kacheln)', () => {
    interface Frame { w: number; h: number; anchorX: number; anchorY: number }
    interface Rect { x: number; y: number; w: number; h: number }
    const frames = JSON.parse(readFileSync(join(GFX, 'props/dorf.json'), 'utf8')) as Record<string, Frame>;
    const tileIndex = JSON.parse(readFileSync(join(GFX, 'tiles/dorf.json'), 'utf8')) as Record<string, number>;
    const exitRects: Rect[] = objects(hub, 'exits').map((e) => ({ x: e.x, y: e.y, w: e.width, h: e.height }));
    const inRect = (r: Rect, px: number, py: number) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
    const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const inExit = (x: number, y: number) => exitRects.some((r) => inRect(r, x * 16 + 8, y * 16 + 8));
    const border: [number, number][] = [];
    for (let y = 0; y < 32; y++) for (let x = 0; x < 40; x++) if (x < 2 || y < 2 || x >= 38 || y >= 30) border.push([x, y]);
    /** Bildrechteck jedes Baums, dessen Fußkachel im Rand liegt. */
    const treeRects: Rect[] = objects(hub, 'objects')
      .filter((o) => o.type === 'tree' && border.some(([x, y]) => `${x}/${y}` === tileOf(o)))
      .map((o) => {
        const variant = prop(o, 'variant');
        const f = frames[PROP_DEFS[propKey('tree', typeof variant === 'string' ? variant : null)]!.frame]!;
        return { x: o.x + o.width / 2 - f.anchorX, y: o.y + o.height - f.anchorY, w: f.w, h: f.h };
      });

    it('außer den Ausgängen ist jede Randkachel gesperrt, dunkle Wiese und von einer Baumkrone bedeckt', () => {
      const col = tiles(hub, 'collision');
      const ground = tiles(hub, 'ground');
      const wrong = border.filter(([x, y]) => !inExit(x, y)).flatMap(([x, y]) => {
        const i = y * 40 + x;
        const problems = [];
        if (col[i] === 0) problems.push('frei');
        if (ground[i] !== tileIndex['wiese_dunkel']! + 1) problems.push('keine dunkle Wiese');
        if (!treeRects.some((r) => inRect(r, x * 16 + 8, y * 16 + 8))) problems.push('ohne Baumkrone');
        return problems.map((p) => `${x}/${y}: ${p}`);
      });
      expect(wrong).toEqual([]);
    });

    it('jede Ausgangskachel ist begehbarer Weg, und keine Krone des Waldrands ragt in einen Ausgang', () => {
      const col = tiles(hub, 'collision');
      const ground = tiles(hub, 'ground');
      const weg = new Set(Object.entries(tileIndex).filter(([k]) => k.startsWith('weg_')).map(([, v]) => v + 1));
      const exitTiles = border.filter(([x, y]) => inExit(x, y));
      expect(exitTiles).toHaveLength(24);
      for (const [x, y] of exitTiles) {
        expect(col[y * 40 + x], `${x}/${y}`).toBe(0);
        expect(weg.has(ground[y * 40 + x]!), `${x}/${y}`).toBe(true);
      }
      expect(treeRects.filter((t) => exitRects.some((e) => overlaps(t, e)))).toEqual([]);
    });
  });

  describe('feste Gegenstände (Stil-Prüfung 2026-11-14: Zäune, Truhen, Wegweiser, Büsche)', () => {
    const col = tiles(hub, 'collision');
    const free = (x: number, y: number) => x >= 0 && y >= 0 && x < 40 && y < 32 && col[y * 40 + x] === 0;
    const tx = (o: TiledObject) => Math.floor(o.x / 16);
    const ty = (o: TiledObject) => Math.floor(o.y / 16);
    const weg = new Set(Object.entries(JSON.parse(readFileSync(join(GFX, 'tiles/dorf.json'), 'utf8')) as Record<string, number>)
      .filter(([k]) => k.startsWith('weg_')).map(([, v]) => v + 1));
    const onPath = (x: number, y: number) => weg.has(tiles(hub, 'ground')[y * 40 + x]!);
    /** Alle vom Startpunkt 19/14 aus über freie Kacheln (4er-Nachbarschaft) erreichbaren Kacheln. */
    const reached = (() => {
      const seen = new Set(['19/14']);
      const queue: [number, number][] = [[19, 14]];
      for (let i = 0; i < queue.length; i++) {
        const [x, y] = queue[i]!;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const key = `${x + dx}/${y + dy}`;
          if (!seen.has(key) && free(x + dx, y + dy)) {
            seen.add(key);
            queue.push([x + dx, y + dy]);
          }
        }
      }
      return seen;
    })();

    it('genau diese vier Arten sind fest; Hühner, Blumen, Steine, Beete und Rohstoffe bleiben durchlaufbar', () => {
      expect([...solidTypes].sort()).toEqual(['bush', 'chest', 'real_fence', 'signpost']);
      const walkable = objects(hub, 'objects').filter((o) => ['chicken', 'flower', 'rock', 'resource', 'wilted_plant', 'garden_plot'].includes(o.type));
      expect(walkable.length).toBeGreaterThan(40);
      expect(walkable.filter((o) => !free(tx(o), ty(o))).map((o) => `${o.type}@${tileOf(o)}`)).toEqual([]);
    });

    it('jeder Zaun, jede Truhe, jeder Wegweiser und jeder Busch steht auf einer gesperrten Kachel, allein auf seiner Kachel', () => {
      const solid = objects(hub, 'objects').filter((o) => solidTypes.includes(o.type));
      const count = (type: string) => solid.filter((o) => o.type === type).length;
      expect([count('bush'), count('chest'), count('real_fence'), count('signpost')]).toEqual([11, 2, 12, 5]);
      expect(solid.filter((o) => free(tx(o), ty(o))).map((o) => `${o.type}@${tileOf(o)}`)).toEqual([]);
      const others = [...objects(hub, 'objects'), ...objects(hub, 'npcs'), ...objects(hub, 'spawn')];
      for (const s of solid) expect(others.filter((o) => tileOf(o) === tileOf(s)).length, `${s.type}@${tileOf(s)}`).toBe(1);
    });

    it('Gartentor: wo der Weg auf Omas Zaun trifft (10/21 und 11/21), steht kein Zaun mehr; sonst stehen alle Zäune der Vorlage', () => {
      expect(gardenGate).toEqual(['10/21', '11/21']);
      const fences = (m: TiledMap) => objects(m, 'objects').filter((o) => o.type === 'real_fence').map(tileOf).sort();
      expect(fences(hub)).toEqual(fences(template).filter((pos) => !gardenGate.includes(pos)));
      for (const [x, y] of [[10, 21], [11, 21]] as const) {
        expect(free(x, y), `${x}/${y}`).toBe(true);
        expect(objects(hub, 'objects').some((o) => tileOf(o) === `${x}/${y}`), `${x}/${y}`).toBe(false);
        // Direkt über dem Tor endet der Weg zum Garten.
        expect(onPath(x, y - 1), `${x}/${y}`).toBe(true);
      }
    });

    it('der Wegweiser zur Höhle steht neben dem Ostweg auf 37/13, nicht mehr auf dem Weg 37/14', () => {
      expect([signpostMove.from, signpostMove.to]).toEqual([[37, 14], [37, 13]]);
      expect(objects(template, 'objects').filter((o) => o.type === 'signpost' && tileOf(o) === '37/14')).toHaveLength(1);
      const sign = objects(hub, 'objects').filter((o) => tileOf(o) === '37/13');
      expect(sign.map((o) => `${o.type}:${String(prop(o, 'target'))}`)).toEqual(['signpost:dungeon']);
      expect(objects(hub, 'objects').some((o) => tileOf(o) === '37/14')).toBe(false);
      expect(free(37, 14)).toBe(true);
      expect(onPath(37, 13)).toBe(false);
    });

    it('kein Wegweiser und kein Busch steht auf einer Wegkachel', () => {
      const wrong = objects(hub, 'objects').filter((o) => (o.type === 'signpost' || o.type === 'bush') && onPath(tx(o), ty(o)));
      expect(wrong.map((o) => `${o.type}@${tileOf(o)}`)).toEqual([]);
    });

    it('die neuen Sperren schneiden nichts ab: jede freie Kachel ist vom Startpunkt aus erreichbar (außer der Nische hinter der Küchentruhe)', () => {
      const cutOff: string[] = [];
      for (let y = 0; y < 32; y++) for (let x = 0; x < 40; x++) if (free(x, y) && !reached.has(`${x}/${y}`)) cutOff.push(`${x}/${y}`);
      // 9/8 liegt zwischen Kochstelle, Haus und Körben; ihr einziger Zugang war die Kachel der Truhe 9/9. Dort steht nichts.
      expect(cutOff).toEqual(['9/8']);
      expect([...objects(hub, 'objects'), ...objects(hub, 'npcs')].some((o) => tileOf(o) === '9/8')).toBe(false);
    });

    it('Truhen, Beete, Rohstoffe, Regal und Stationen sind begehbar oder haben eine erreichbare Kachel direkt daneben', () => {
      const targets = objects(hub, 'objects').filter((o) => ['chest', 'garden_plot', 'resource', 'trophy_shelf', 'station'].includes(o.type));
      expect(targets).toHaveLength(23);
      const near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] as const;
      const stuck = targets.filter((o) => {
        const xs = Array.from({ length: Math.max(1, o.width / 16) }, (_, i) => tx(o) + i);
        return !xs.some((x) => near.some(([dx, dy]) => reached.has(`${x + dx}/${ty(o) + dy}`)));
      });
      expect(stuck.map((o) => `${o.type}@${tileOf(o)}`)).toEqual([]);
    });
  });

  it('enthält kein Emoji und keinen Verweis auf die alten Kacheln', () => {
    const text = readFileSync(HUB_JSON, 'utf8');
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
    expect(text).not.toContain('legacy');
  });

  it('das Werkzeug ist wiederholbar (bytegleiche Karte)', () => {
    const out = mkdtempSync(join(tmpdir(), 'emilia-hub-'));
    try {
      const file = join(out, 'hub.json');
      execFileSync(process.execPath, [TOOL, file], { stdio: 'pipe' });
      // Git darf beim Auschecken CRLF setzen; verglichen wird der Inhalt.
      const norm = (p: string) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
      expect(norm(file)).toBe(norm(HUB_JSON));
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 30_000);
});
