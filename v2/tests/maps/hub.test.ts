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
import { COLLISION_CHANGES, PATH_WIDEN } from '../../tools/maps/restyle-hub.mjs';
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

  it('Stationen, Beete, Truhen, Regal, Lagerfeuer, welke Pflanzen, Rohstoffe und Wegweiser liegen wie in der Vorlage', () => {
    const fixed = ['station', 'garden_plot', 'chest', 'trophy_shelf', 'bonfire', 'wilted_plant', 'resource', 'signpost'];
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
    const old = new Map(objects(template, 'objects').filter((o) => o.type === 'signpost').map((o) => [tileOf(o), String(prop(o, 'dir'))]));
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

  it('jede Wegkachel der Vorlage ist begehbar (bis auf die, die schon die Vorlage sperrt)', () => {
    const ground = tiles(template, 'ground');
    const oldCol = tiles(template, 'collision');
    const col = tiles(hub, 'collision');
    const blockedInTemplate: string[] = [];
    const blockedNow: string[] = [];
    ground.forEach((id, i) => {
      if (!isTemplatePath(id)) return;
      const pos = `${i % 40}/${Math.floor(i / 40)}`;
      if (oldCol[i] !== 0) blockedInTemplate.push(pos);
      else if (col[i] !== 0) blockedNow.push(pos);
    });
    expect(blockedNow).toEqual([]);
    // Einzige Ausnahme der Vorlage: das Lagerfeuer steht auf dem Südweg (altes hub.js: collision[19][20] = 1).
    expect(blockedInTemplate).toEqual(['20/19']);
  });

  it('jede Abweichung der Sperrflächen steht in COLLISION_CHANGES (höchstens 40 Einträge, je mit Begründung)', () => {
    const oldCol = tiles(template, 'collision');
    const col = tiles(hub, 'collision');
    const deviations = col.flatMap((v, i) => ((v !== 0) !== (oldCol[i] !== 0) ? [`${i % 40}/${Math.floor(i / 40)}:${v !== 0}`] : []));
    const listed = changes.map((c) => `${c.x}/${c.y}:${c.blocked}`);
    expect(listed.sort()).toEqual(deviations.sort());
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
