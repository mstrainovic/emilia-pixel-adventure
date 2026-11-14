// Kleidet die Dorfkarte neu ein: aus der eingefrorenen Vorlage tools/legacy-maps/exported/hub.json
// (altes Spiel) wird src/assets/maps/hub.json im Look von „Ninja Adventure". Orte von Wegen, Ausgängen,
// Figuren, Stationen und allem, womit Emilia etwas tut, bleiben wie im alten Spiel.
// Aufruf: node tools/maps/restyle-hub.mjs [Zieldatei]   — gleiche Eingaben → bytegleiche Datei.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readPng } from '../art/png.mjs';
import { edgeTile } from './autotile.mjs';

const TILE = 16;
const BORDER = 2;
const TEMPLATE = fileURLToPath(new URL('../legacy-maps/exported/hub.json', import.meta.url));
const TILE_INDEX = fileURLToPath(new URL('../../src/assets/gfx/tiles/dorf.json', import.meta.url));
const TILE_IMAGE = fileURLToPath(new URL('../../src/assets/gfx/tiles/dorf.png', import.meta.url));
const DEFAULT_OUT = fileURLToPath(new URL('../../src/assets/maps/hub.json', import.meta.url));

/*
 * Kachelkennungen der Vorlage = Kennung im alten Spiel + 1 (src/world/maps/hub.js TILE_DEFS,
 * src/utils/AutoTiler.js PATH_EDGES): 1–4 Gras (dunkel, mittel, hell, Abwechslung), 5–6 Erdweg,
 * 7–8 Holzboden, 9 Blumenwiese, 10 Steinboden, 36–47 Wegränder (PATH_EDGES 35–46).
 */
const isOldPath = (id) => id === 5 || id === 6 || (id >= 36 && id <= 47);
const isOldWood = (id) => id === 7 || id === 8;
const OLD_FLOWERS = 9;
const OLD_STONE = 10;
/** Dieselben Abwechslungs-Stellen wie im alten Spiel; das häufigste Gras (mittel) wird schlichte Wiese. */
const GRASS = { 1: 'wiese_c', 2: 'wiese', 3: 'wiese_b', 4: 'wiese_d' };

/** Wegstücke, die um eine Kachel verbreitert werden (Rechtecke in Kacheln); nur auf freien Kacheln. */
export const PATH_WIDEN = [
  { x: 16, y: 11, w: 8, h: 1, reason: 'Ring um den Dorfplatz nach Norden verbreitert; schließt die Lücke zum Nordweg (Vorlage: Gras auf 19–20/11)' },
  { x: 16, y: 18, w: 8, h: 1, reason: 'Ring um den Dorfplatz nach Süden verbreitert; schließt die Lücke zum Südweg (Vorlage: Gras auf 19–20/18)' },
  { x: 16, y: 12, w: 1, h: 6, reason: 'Ring um den Dorfplatz nach Westen verbreitert (in der Vorlage nur eine Kachel breit)' },
  { x: 23, y: 12, w: 1, h: 6, reason: 'Ring um den Dorfplatz nach Osten verbreitert (in der Vorlage nur eine Kachel breit)' },
  { x: 19, y: 28, w: 2, h: 2, reason: 'Südweg bis zum Ausgang zum See durchgezogen (Vorlage: Gras auf 19–20/28–29)' },
  { x: 10, y: 9, w: 2, h: 1, reason: 'Stich zur Küche: Vorplatz zu einem Rechteck verbreitert' },
  { x: 28, y: 9, w: 1, h: 1, reason: 'Stich zur Werkstatt: Vorplatz bis unter die Werkbank verbreitert' },
  { x: 10, y: 20, w: 2, h: 1, reason: 'Stich zum Garten: Weg bis an Omas Gartenzaun verlängert' },
];

/** Häuser hinter ihren Werkstätten: linke Kachel und Fußreihe; das Haus belegt w×3 Kacheln darüber. */
const HOUSES = [
  { variant: 'orange', x: 6, y: 7, w: 4, who: 'Mama Tanja (Küche)' },
  { variant: 'shop', x: 28, y: 7, w: 4, who: 'Papa Milos (Werkstatt)' },
  { variant: 'stone', x: 32, y: 10, w: 3, who: 'Deda (Alchemie)' },
  { variant: 'wood', x: 30, y: 21, w: 3, who: 'Opa (Sägewerk)' },
];
const HOUSE_ROWS = 3;

/** Der alte „Brunnen" war ein Fels genau auf dem Startpunkt 19/14; der neue Brunnen steht daneben. */
const WELL = { x: 20, y: 13 };
const OLD_WELL_ROCK = { x: 19, y: 14 };

/**
 * Das Lagerfeuer stand im alten Spiel mitten auf dem Südweg (20/19, die einzige gesperrte Wegkachel).
 * Auf Wunsch des Auftraggebers (Stil-Prüfung 2026-11-14) steht es östlich neben dem Weg, in Babas Blickrichtung.
 */
export const BONFIRE = { from: [20, 19], to: [22, 20] };

/**
 * Im alten Spiel lief Emilia durch Zäune, Truhen, Wegweiser und Büsche hindurch. Seit der Stil-Prüfung
 * (Antwort des Auftraggebers, 2026-11-14) sind sie fest: Ihre Kachel ist gesperrt. Hühner bleiben durchlaufbar.
 */
export const SOLID_TYPES = ['real_fence', 'chest', 'signpost', 'bush'];

/** Gartentor: Wo der Weg zum Garten auf Omas Zaun trifft, entfallen die Zaunstücke, sonst endete der Weg an einer Wand. */
export const GARDEN_GATE = [[10, 21], [11, 21]];

/** Der Wegweiser zur Höhle stand mitten auf dem Ostweg; als festes Hindernis steht er neben dem Weg, wie die anderen vier. */
export const SIGNPOST_MOVE = { from: [37, 14], to: [37, 13] };

/** Objekte, die ihren Platz wechseln (Schmuck, Bäume und der Wegweiser aus SIGNPOST_MOVE, sonst nichts aus der festen Liste). */
const MOVES = [
  { type: 'signpost', from: SIGNPOST_MOVE.from, to: SIGNPOST_MOVE.to, reason: 'stand auf dem Ostweg und versperrte als festes Hindernis den halben Weg zum Ausgang' },
  { type: 'tree', from: [23, 3], to: [24, 3], reason: 'Krone würde den Wegweiser 22/3 halb verdecken' },
  { type: 'tree', from: [23, 28], to: [24, 28], reason: 'Laubkrone würde den Wegweiser 22/27 verdecken' },
  { type: 'tree', from: [13, 24], to: [14, 24], reason: 'Tannenkrone würde die Samen 12/23 und 12/24 verdecken' },
  { type: 'chicken', from: [11, 24], to: [13, 25], reason: 'stand auf demselben Feld wie das Gemüse 11/24' },
  // Blumen, die in der Vorlage auf dem Weg (oder dem verbreiterten Ring) standen, rücken ins Gras daneben.
  { type: 'flower', from: [18, 20], to: [17, 21], reason: 'stand auf dem Südweg (und auf Babas Feld)' },
  { type: 'flower', from: [21, 20], to: [22, 21], reason: 'stand auf dem Südweg' },
  { type: 'flower', from: [12, 15], to: [12, 16], reason: 'stand auf dem Westweg' },
  { type: 'flower', from: [32, 15], to: [32, 16], reason: 'stand auf dem Ostweg' },
  { type: 'flower', from: [31, 11], to: [35, 11], reason: 'stand auf Dedas Steinboden' },
  { type: 'flower', from: [16, 16], to: [15, 17], reason: 'stand auf dem verbreiterten Ring um den Dorfplatz' },
  { type: 'flower', from: [23, 16], to: [24, 17], reason: 'stand auf dem verbreiterten Ring um den Dorfplatz' },
  { type: 'flower', from: [11, 19], to: [12, 19], reason: 'stand auf dem Weg zum Garten' },
  { type: 'flower', from: [25, 26], to: [26, 26], reason: 'läge unter der Krone des versetzten Laubbaums 24/28' },
];

/** Beiwerk auf Mauerkacheln der alten Häuser, die gesperrt bleiben, wo jetzt kein Haus steht. */
const DECOR = [
  { variant: 'barrel', x: 6, y: 8 },
  { variant: 'crate', x: 10, y: 6 },
  { variant: 'basket_apples', x: 10, y: 7 },
  { variant: 'basket_vegetables', x: 10, y: 8 },
  { variant: 'barrel', x: 28, y: 8 },
  { variant: 'crate', x: 32, y: 6 },
  { variant: 'barrel', x: 32, y: 7 },
  { variant: 'bookshelf', x: 34, y: 12 },
];

const house = (h, why) => {
  const out = [];
  for (let y = h.y - HOUSE_ROWS + 1; y <= h.y; y++) for (let x = h.x; x < h.x + h.w; x++) out.push({ x, y, blocked: true, reason: `${why}: ${h.who}` });
  return out;
};
const TEMPLATE_DATA = JSON.parse(readFileSync(TEMPLATE, 'utf8'));
const templateBlocked = (x, y) => TEMPLATE_DATA.layers.find((l) => l.name === 'collision').data[y * TEMPLATE_DATA.width + x] !== 0;

/**
 * Jede Abweichung der Sperrflächen von der Vorlage, mit Begründung. Die Ebene collision ist die Vorlage
 * mit genau diesen Änderungen.
 */
export const COLLISION_CHANGES = [
  ...HOUSES.flatMap((h) => house(h, 'Haus steht hinter der Werkstatt (3 Reihen hoch, das Haus ist nicht begehbar)'))
    .filter((c) => !templateBlocked(c.x, c.y)),
  { ...WELL, blocked: true, reason: 'Neuer Dorfbrunnen neben dem Startpunkt (statt des begehbaren Felses auf 19/14)' },
  { x: 22, y: 8, blocked: true, reason: 'Rosa Baum (alter maple_tree): gesperrt ist die Stammkachel wie bei allen Bäumen' },
  { x: 22, y: 22, blocked: true, reason: 'Rosa Baum (alter maple_tree): gesperrt ist die Stammkachel wie bei allen Bäumen' },
  { x: 5, y: 10, blocked: true, reason: 'Trophäenregal ist ein stehendes Möbel; Emilia erreicht es von den Nachbarkacheln' },
  { x: BONFIRE.from[0], y: BONFIRE.from[1], blocked: false, reason: `Lagerfeuer vom Südweg nach ${BONFIRE.to.join('/')} versetzt (Wunsch des Auftraggebers): der Weg ist hier wieder frei` },
  { x: BONFIRE.to[0], y: BONFIRE.to[1], blocked: true, reason: `Lagerfeuer steht jetzt neben dem Weg (vorher ${BONFIRE.from.join('/')}, Wunsch des Auftraggebers)` },
  ...MOVES.filter((m) => m.type === 'tree').flatMap((m) => [
    { x: m.from[0], y: m.from[1], blocked: false, reason: `Baum versetzt nach ${m.to.join('/')}: ${m.reason}` },
    { x: m.to[0], y: m.to[1], blocked: true, reason: `Stammkachel des versetzten Baums (vorher ${m.from.join('/')}): ${m.reason}` },
  ]),
];

/** Rand der Karte (zwei Kacheln): dichter Wald auf dunkler Wiese; Kronen decken jede Randkachel außer den Ausgängen. */
const inBorder = (map, x, y) => x < BORDER || y < BORDER || x >= map.width - BORDER || y >= map.height - BORDER;

function layerOf(map, name) {
  const l = map.layers.find((layer) => layer.name === name);
  if (!l) throw new Error(`Vorlage: Ebene „${name}" fehlt`);
  return l;
}

const prop = (o, name) => o.properties?.find((p) => p.name === name)?.value;
const tileX = (o) => Math.floor(o.x / TILE);
const tileY = (o) => Math.floor(o.y / TILE);
const at = (o, x, y) => tileX(o) === x && tileY(o) === y;

function property(name, value) {
  return { name, type: typeof value === 'number' ? 'int' : 'string', value };
}

function newObject(id, type, x, y, w, properties) {
  return { id, name: '', type, x: x * TILE, y: y * TILE, width: w * TILE, height: TILE, rotation: 0, visible: true, properties };
}

/** Wegmaske: Weg der Vorlage plus PATH_WIDEN. */
function pathMask(map, ground) {
  const mask = Array.from({ length: map.height }, (_, y) => Array.from({ length: map.width }, (_, x) => isOldPath(ground[y * map.width + x])));
  for (const r of PATH_WIDEN) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) mask[y][x] = true;
  return mask;
}

function buildGround(map, ground, mask, edgeMask, plots, tileIndex) {
  const gid = (name) => {
    if (!(name in tileIndex)) throw new Error(`Kachel „${name}" fehlt in tiles/dorf.json (npm run art:build)`);
    return tileIndex[name] + 1;
  };
  const base = [];
  const detail = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const old = ground[y * map.width + x];
      let name;
      let deco = 0;
      if (mask[y][x]) name = `weg_${edgeTile(edgeMask, x, y)}`;
      else if (isOldWood(old)) name = 'hof';
      else if (old === OLD_STONE) name = 'stein';
      else if (plots.has(`${x}/${y}`)) name = 'beet';
      else if (inBorder(map, x, y)) name = 'wiese_dunkel';
      else if (old === OLD_FLOWERS) {
        name = 'wiese';
        // Die Blumen der alten Blumenwiese wandern nach ground_detail, in festem Muster.
        const pick = (x * 7 + y * 13) % 6;
        deco = pick < 2 ? gid('blumen_rot') : pick === 2 ? gid('blume_weiss') : pick === 3 ? gid('grasbuschel') : 0;
      } else if (old in GRASS) name = GRASS[old];
      else throw new Error(`Unbekannte Kachel ${old} auf ${x}/${y}`);
      base.push(gid(name));
      detail.push(deco);
    }
  }
  return { base, detail };
}

function buildCollision(map, collision, objects) {
  const data = collision.map((v) => (v !== 0 ? 1 : 0));
  const seen = new Set();
  for (const c of COLLISION_CHANGES) {
    const i = c.y * map.width + c.x;
    if (seen.has(i)) throw new Error(`COLLISION_CHANGES nennt ${c.x}/${c.y} doppelt`);
    seen.add(i);
    if ((data[i] === 1) === c.blocked) throw new Error(`COLLISION_CHANGES ${c.x}/${c.y}: keine Abweichung von der Vorlage`);
    data[i] = c.blocked ? 1 : 0;
  }
  // Feste Objekte sperren ihre Kachel (Regel statt Einzeleinträgen in COLLISION_CHANGES).
  for (const o of objects) {
    if (!SOLID_TYPES.includes(o.type)) continue;
    const i = tileY(o) * map.width + tileX(o);
    if (seen.has(i) && data[i] === 0) throw new Error(`${o.type} ${tileX(o)}/${tileY(o)} steht auf einer Kachel, die COLLISION_CHANGES freigibt`);
    data[i] = 1;
  }
  return data;
}

/*
 * Bäume des Waldrands. Krone 32 px breit, höchstens 31 px hoch, unten auf der Fußkachel. Fußpunkt im Bild:
 * mittig (pine_dark, round_dark: Krone über halber Nachbarkachel links und rechts), forest_left (Krone genau
 * über Fußkachel und linkem Nachbarn) oder forest_right (Fußkachel und rechter Nachbar).
 */
const CROWN = { w: 32, h: 31 };
const CROWN_ANCHOR_X = { centered: 16, forest_left: 24, forest_right: 8 };

function crownRect(x, y, anchor) {
  return { x: x * TILE + TILE / 2 - CROWN_ANCHOR_X[anchor], y: (y + 1) * TILE - CROWN.h, w: CROWN.w, h: CROWN.h };
}

/**
 * Oben und unten eine Reihe Kronen (Fußreihe 1 bzw. letzte Reihe), links und rechts eine Spalte bündiger
 * Kronen (Fuß in Spalte 1 bzw. vorletzter Spalte) über beiden Randkacheln. Keine Krone ragt in einen Ausgang;
 * neben einem Ausgang wird die Krone bündig an seinen Rand gesetzt.
 */
function forestBorder(map, exits) {
  const exitRects = exits.map((e) => ({ x: e.x, y: e.y, w: e.width, h: e.height }));
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const clear = (x, y, anchor) => !exitRects.some((r) => overlaps(r, crownRect(x, y, anchor)));
  const trees = [];
  const place = (x, y, anchors) => {
    const anchor = anchors.find((a) => clear(x, y, a));
    if (!anchor) return;
    const variant = anchor === 'centered' ? ((x * 5 + y * 3) % 4 === 0 ? 'round_dark' : 'pine_dark') : anchor;
    trees.push({ x, y, variant });
  };
  for (let x = 0; x < map.width; x++) {
    place(x, BORDER - 1, ['centered', 'forest_left', 'forest_right']);
    place(x, map.height - 1, ['centered', 'forest_left', 'forest_right']);
  }
  for (let y = BORDER; y < map.height - BORDER; y++) {
    place(BORDER - 1, y, ['forest_left']);
    place(map.width - BORDER, y, ['forest_right']);
  }
  return trees;
}
function restyleObjects(map, objectsLayer, exits) {
  let nextId = map.nextobjectid;
  const exitByDir = new Map(exits.map((e) => [e.name, prop(e, 'target')]));
  const out = [];
  for (const o of objectsLayer.objects) {
    if (o.type === 'house') continue; // neue Häuser siehe HOUSES
    if (o.type === 'rock' && at(o, OLD_WELL_ROCK.x, OLD_WELL_ROCK.y)) continue; // wird der Brunnen
    if (o.type === 'real_fence' && GARDEN_GATE.some(([x, y]) => at(o, x, y))) continue; // Gartentor
    const copy = { ...o, properties: [...(o.properties ?? [])] };
    const move = MOVES.find((m) => m.type === o.type && at(o, m.from[0], m.from[1]));
    if (move) {
      copy.x = move.to[0] * TILE;
      copy.y = move.to[1] * TILE;
    }
    if (o.type === 'bonfire') {
      if (!at(o, BONFIRE.from[0], BONFIRE.from[1])) throw new Error(`Lagerfeuer der Vorlage steht auf ${tileX(o)}/${tileY(o)} statt ${BONFIRE.from.join('/')}`);
      copy.x = BONFIRE.to[0] * TILE;
      copy.y = BONFIRE.to[1] * TILE;
    }
    if (o.type === 'maple_tree') {
      copy.type = 'tree';
      copy.properties.push(property('variant', 'maple'));
    } else if (o.type === 'station') {
      copy.properties.push(property('variant', String(prop(o, 'station'))));
    } else if (o.type === 'resource') {
      const item = String(prop(o, 'itemId'));
      copy.properties.push(property('variant', item.startsWith('seed') ? 'seed' : item));
    } else if (o.type === 'signpost') {
      const target = exitByDir.get(String(prop(o, 'dir')));
      if (typeof target !== 'string') throw new Error(`Wegweiser ${tileX(o)}/${tileY(o)}: kein Ausgang „${String(prop(o, 'dir'))}"`);
      copy.properties = [property('target', target)];
    }
    if (copy.properties.length === 0) delete copy.properties;
    out.push(copy);
  }
  const add = (type, x, y, w, properties) => out.push(newObject(nextId++, type, x, y, w, properties));
  for (const h of HOUSES) add('house', h.x, h.y, h.w, [property('variant', h.variant)]);
  add('well', WELL.x, WELL.y, 1, undefined);
  for (const d of DECOR) add('decor', d.x, d.y, 1, [property('variant', d.variant)]);
  for (const t of forestBorder(map, exits)) add('tree', t.x, t.y, 1, [property('variant', t.variant)]);
  for (const o of out) if (o.properties === undefined) delete o.properties;
  return { objects: out, nextId };
}

/** Prüft, dass alles, was stehen muss, auf gesperrten Kacheln steht, und alle Wege frei sind. */
function checkConsistency(map, collision, objects, mask, edgeMask) {
  const blocked = (x, y) => collision[y * map.width + x] !== 0;
  const problems = [];
  for (const h of HOUSES) {
    for (let y = h.y - HOUSE_ROWS + 1; y <= h.y; y++) for (let x = h.x; x < h.x + h.w; x++) if (!blocked(x, y)) problems.push(`Haus ${h.variant}: ${x}/${y} frei`);
  }
  for (const o of objects) {
    const mustBlock = ['tree', 'station', 'well', 'decor', 'bonfire', 'trophy_shelf', ...SOLID_TYPES].includes(o.type);
    for (let x = tileX(o); x < tileX(o) + o.width / TILE; x++) if (mustBlock && !blocked(x, tileY(o))) problems.push(`${o.type} auf ${x}/${tileY(o)} steht auf freier Kachel`);
  }
  for (const r of PATH_WIDEN) {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (blocked(x, y)) problems.push(`PATH_WIDEN ${x}/${y} ist gesperrt`);
  }
  for (const m of MOVES) {
    const found = objects.filter((o) => o.type === m.type && at(o, m.to[0], m.to[1])).length;
    if (found !== 1) problems.push(`MOVES ${m.type} ${m.from.join('/')}: am Ziel ${m.to.join('/')} ${found} statt 1 Objekt`);
  }
  // Schmuck, der am Boden steht oder läuft, das Lagerfeuer und die Wegweiser gehören nicht auf den Weg.
  for (const o of objects) {
    if (['flower', 'bush', 'rock', 'chicken', 'bonfire', 'signpost'].includes(o.type) && edgeMask[tileY(o)][tileX(o)]) problems.push(`${o.type} ${tileX(o)}/${tileY(o)} steht auf Weg oder Hof`);
  }
  // Gartentor: Die Zaunstücke der Vorlage sind fort, die Kacheln frei, und der Weg endet direkt darüber.
  for (const [x, y] of GARDEN_GATE) {
    if (!TEMPLATE_DATA.layers.find((l) => l.name === 'objects').objects.some((o) => o.type === 'real_fence' && at(o, x, y))) problems.push(`Gartentor ${x}/${y}: in der Vorlage steht dort kein Zaun`);
    if (blocked(x, y) || objects.some((o) => at(o, x, y))) problems.push(`Gartentor ${x}/${y} ist nicht frei`);
    if (!mask[y - 1][x]) problems.push(`Gartentor ${x}/${y}: darüber endet kein Weg`);
  }
  // Auf der Kachel eines festen Objekts steht sonst nichts.
  for (const o of objects.filter((s) => SOLID_TYPES.includes(s.type))) {
    const same = objects.filter((p) => at(p, tileX(o), tileY(o)));
    if (same.length !== 1) problems.push(`${o.type} ${tileX(o)}/${tileY(o)} teilt seine Kachel mit ${same.filter((p) => p !== o).map((p) => p.type).join(', ')}`);
  }
  // Auf der Kachel des Lagerfeuers steht sonst nichts.
  const onFire = objects.filter((o) => at(o, BONFIRE.to[0], BONFIRE.to[1]));
  if (onFire.length !== 1 || onFire[0].type !== 'bonfire') problems.push(`Lagerfeuer ${BONFIRE.to.join('/')}: dort stehen ${onFire.map((o) => o.type).join(', ') || 'keine Objekte'}`);
  // Wegkacheln mit Gras auf zwei gegenüberliegenden Seiten kennt der Kachelsatz nicht.
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (!mask[y][x]) continue;
      const p = (dx, dy) => edgeMask[y + dy]?.[x + dx] ?? true;
      if ((!p(0, -1) && !p(0, 1)) || (!p(-1, 0) && !p(1, 0))) problems.push(`Weg ${x}/${y} ist nur eine Kachel breit`);
    }
  }
  if (problems.length > 0) throw new Error(`Dorfkarte nicht stimmig:\n${problems.join('\n')}`);
}

export function restyleHub() {
  const map = TEMPLATE_DATA;
  const tileIndex = JSON.parse(readFileSync(TILE_INDEX, 'utf8'));
  const atlas = readPng(TILE_IMAGE);
  const ground = layerOf(map, 'ground').data;
  const objectsLayer = layerOf(map, 'objects');
  const exits = layerOf(map, 'exits').objects;
  const plots = new Set(objectsLayer.objects.filter((o) => o.type === 'garden_plot').map((o) => `${tileX(o)}/${tileY(o)}`));

  const mask = pathMask(map, ground);
  // Hof- und Steinboden zählen für die Wegränder wie Weg: wo der Weg auf einen Hof stößt, kein Grasrand.
  const edgeMask = mask.map((row, y) => row.map((p, x) => p || isOldWood(ground[y * map.width + x]) || ground[y * map.width + x] === OLD_STONE));
  const { base, detail } = buildGround(map, ground, mask, edgeMask, plots, tileIndex);
  const { objects, nextId } = restyleObjects(map, objectsLayer, exits);
  const collision = buildCollision(map, layerOf(map, 'collision').data, objects);
  checkConsistency(map, collision, objects, mask, edgeMask);

  const tileLayer = (id, name, data) => ({ id, name, type: 'tilelayer', width: map.width, height: map.height, x: 0, y: 0, opacity: 1, visible: true, data });
  const objectLayer = (id, name, objs) => ({ id, name, type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects: objs });
  const columns = atlas.width / TILE;
  return {
    type: 'map', version: map.version, tiledversion: map.tiledversion, orientation: 'orthogonal', renderorder: 'right-down',
    infinite: false, width: map.width, height: map.height, tilewidth: TILE, tileheight: TILE,
    nextlayerid: 8, nextobjectid: nextId,
    tilesets: [{
      firstgid: 1, name: 'dorf', tilewidth: TILE, tileheight: TILE, tilecount: columns * (atlas.height / TILE), columns,
      image: '../gfx/tiles/dorf.png', imagewidth: atlas.width, imageheight: atlas.height, margin: 0, spacing: 0,
    }],
    layers: [
      tileLayer(1, 'ground', base),
      tileLayer(2, 'ground_detail', detail),
      tileLayer(3, 'collision', collision),
      objectLayer(4, 'objects', objects),
      objectLayer(5, 'npcs', layerOf(map, 'npcs').objects),
      objectLayer(6, 'exits', exits),
      objectLayer(7, 'spawn', layerOf(map, 'spawn').objects),
    ],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const out = resolve(process.argv[2] ?? DEFAULT_OUT);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(restyleHub()) + '\n', 'utf8');
  console.log(`hub → ${out} (${COLLISION_CHANGES.length} Abweichungen der Sperrflächen)`);
}
