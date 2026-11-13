// Wandelt eine Karte des alten Spiels (Generator-Ergebnis) in das Tiled-JSON-Format um.
const TILE = 16;
const RESERVED = new Set(['type', 'x', 'y', 'w', 'h']);

/** Wiederholbarer Zufallsgenerator (mulberry32), Werte in [0, 1). */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toProperty(name, value) {
  if (value === undefined || typeof value === 'function') return null;
  if (typeof value === 'string') return { name, type: 'string', value };
  if (typeof value === 'boolean') return { name, type: 'bool', value };
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { name, type: Number.isInteger(value) ? 'int' : 'float', value };
  }
  return { name, type: 'string', value: JSON.stringify(value) ?? 'null' };
}

function toProperties(source, skip = RESERVED) {
  const out = [];
  for (const [name, value] of Object.entries(source)) {
    if (skip.has(name)) continue;
    const p = toProperty(name, value);
    if (p) out.push(p);
  }
  return out;
}

function flatten(grid, map) {
  const data = [];
  for (const row of grid) for (const v of row) data.push(map(v));
  return data;
}

/** @param {string} id Kartenkennung  @param {object} legacy Ergebnis des alten Generators */
export function convertLegacyMap(id, legacy) {
  const { width, height } = legacy;
  let nextObjectId = 1;
  const objectId = () => nextObjectId++;

  const ground = flatten(legacy.ground, (v) => (v < 0 ? 0 : v + 1));
  let maxTile = 0;
  for (const v of ground) if (v > maxTile) maxTile = v;
  const rows = Math.max(8, Math.ceil(maxTile / 8 / 8) * 8);
  const tilecount = rows * 8;

  const tileLayer = (lid, name, data) => ({
    id: lid, name, type: 'tilelayer', width, height, x: 0, y: 0, opacity: 1, visible: true, data,
  });
  const objectLayer = (lid, name, objects) => ({
    id: lid, name, type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects,
  });

  // Truhen ohne eigene Kennung bekommen die Kennung, die das alte Spiel aus Karte und Kachel bildet.
  const propProperties = (p) => {
    const props = toProperties(p);
    if (p.type === 'chest' && !props.some((q) => q.name === 'id')) {
      props.push(toProperty('id', `chest_${id}_${p.x}_${p.y}`));
    }
    return props;
  };
  const objects = (legacy.props ?? []).map((p) => ({
    id: objectId(), name: '', type: p.type,
    x: p.x * TILE, y: p.y * TILE, width: (p.w ?? 1) * TILE, height: (p.h ?? 1) * TILE,
    rotation: 0, visible: true, properties: propProperties(p),
  }));
  const npcs = (legacy.npcs ?? []).map((n) => ({
    id: objectId(), name: n.id, type: 'npc',
    x: n.x * TILE, y: n.y * TILE, width: TILE, height: TILE, rotation: 0, visible: true,
  }));
  const exits = (legacy.exits ?? []).map((e) => ({
    id: objectId(), name: e.id ?? '', type: 'exit',
    x: e.x * TILE, y: e.y * TILE, width: e.w * TILE, height: e.h * TILE, rotation: 0, visible: true,
    properties: [
      toProperty('target', e.target), toProperty('spawnX', e.spawnX), toProperty('spawnY', e.spawnY),
    ],
  }));
  const spawn = [{
    id: objectId(), name: 'spawn', type: 'spawn', point: true,
    x: legacy.playerSpawn.x * TILE, y: legacy.playerSpawn.y * TILE,
    width: 0, height: 0, rotation: 0, visible: true,
  }];

  return {
    type: 'map', version: '1.10', tiledversion: '1.10.2', orientation: 'orthogonal',
    renderorder: 'right-down', infinite: false, width, height, tilewidth: TILE, tileheight: TILE,
    nextlayerid: 7, nextobjectid: nextObjectId,
    tilesets: [{
      firstgid: 1, name: 'legacy', tilewidth: TILE, tileheight: TILE, tilecount, columns: 8,
      image: 'legacy-tiles.png', imagewidth: 128, imageheight: rows * TILE, margin: 0, spacing: 0,
    }],
    layers: [
      tileLayer(1, 'ground', ground),
      tileLayer(2, 'collision', flatten(legacy.collision, (v) => (v ? 1 : 0))),
      objectLayer(3, 'objects', objects),
      objectLayer(4, 'npcs', npcs),
      objectLayer(5, 'exits', exits),
      objectLayer(6, 'spawn', spawn),
    ],
  };
}
