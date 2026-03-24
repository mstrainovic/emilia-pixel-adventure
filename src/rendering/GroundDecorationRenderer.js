import * as THREE from 'three';

/**
 * Scatters small decoration sprites (flowers, grass tufts, pebbles, mushrooms)
 * over grass tiles to create a natural meadow look and break up the tile grid.
 *
 * Uses InstancedMesh per decoration variant for performance.
 */

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// Ground tile IDs that receive decorations
const GRASS_IDS = new Set([0, 1, 2, 3, 8]);
const STONE_IDS = new Set([9]);

// Outdoor_Decor_Free.png dimensions
const SHEET_W = 112;
const SHEET_H = 192;

// Sprite regions in the decor sheet (each 16×16)
const FLOWER_SPRITES = [
  { sx: 0, sy: 176 }, { sx: 16, sy: 176 }, { sx: 32, sy: 176 },
  { sx: 48, sy: 176 }, { sx: 64, sy: 176 }, { sx: 80, sy: 176 },
  { sx: 96, sy: 176 },
];
const STONE_SPRITES = [
  { sx: 0, sy: 64 }, { sx: 16, sy: 64 },
];
const MUSHROOM_SPRITES = [
  { sx: 0, sy: 144 }, { sx: 16, sy: 144 },
];

// Per-scene decoration mix
const SCENE_CONFIGS = {
  hub: {
    seed: 12345,
    density: 0.55,
    types: [
      { kind: 'tuft', weight: 40, sizeMin: 0.45, sizeMax: 0.7 },
      { kind: 'flower', weight: 35, sizeMin: 0.4, sizeMax: 0.6 },
      { kind: 'pebble', weight: 25, sizeMin: 0.3, sizeMax: 0.45 },
    ],
  },
  forest: {
    seed: 67890,
    density: 0.58,
    types: [
      { kind: 'tuft', weight: 35, sizeMin: 0.45, sizeMax: 0.7 },
      { kind: 'mushroom', weight: 25, sizeMin: 0.4, sizeMax: 0.55 },
      { kind: 'pebble', weight: 25, sizeMin: 0.3, sizeMax: 0.45 },
      { kind: 'flower', weight: 15, sizeMin: 0.35, sizeMax: 0.5 },
    ],
  },
  lake: {
    seed: 11111,
    density: 0.52,
    types: [
      { kind: 'tuft', weight: 38, sizeMin: 0.45, sizeMax: 0.65 },
      { kind: 'flower', weight: 42, sizeMin: 0.45, sizeMax: 0.6 },
      { kind: 'pebble', weight: 20, sizeMin: 0.3, sizeMax: 0.4 },
    ],
  },
  unicorn_meadow: {
    seed: 99999,
    density: 0.68,
    types: [
      { kind: 'flower', weight: 55, sizeMin: 0.5, sizeMax: 0.7 },
      { kind: 'tuft', weight: 35, sizeMin: 0.4, sizeMax: 0.6 },
      { kind: 'pebble', weight: 10, sizeMin: 0.25, sizeMax: 0.35 },
    ],
  },
  dungeon: {
    seed: 22222,
    density: 0.15,
    allowedTiles: STONE_IDS,
    types: [
      { kind: 'pebble', weight: 75, sizeMin: 0.25, sizeMax: 0.4 },
      { kind: 'mushroom', weight: 25, sizeMin: 0.35, sizeMax: 0.45 },
    ],
  },
};

// ---------- Canvas-drawn grass tufts ----------

const TUFT_VARIANTS = 4;
let _tuftTextures = null;

function getTuftTextures() {
  if (_tuftTextures) return _tuftTextures;
  _tuftTextures = [];
  for (let v = 0; v < TUFT_VARIANTS; v++) {
    _tuftTextures.push(createTuftTexture(v));
  }
  return _tuftTextures;
}

function createTuftTexture(variant) {
  const s = 16;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d');

  const palettes = [
    { dark: [28, 100, 20], mid: [42, 130, 32], light: [58, 155, 48] },
    { dark: [34, 108, 24], mid: [48, 135, 38], light: [62, 158, 50] },
    { dark: [24, 95, 18],  mid: [38, 122, 28], light: [52, 145, 42] },
    { dark: [36, 112, 26], mid: [50, 138, 40], light: [66, 162, 54] },
  ];
  const pal = palettes[variant];

  // Each variant: thicker grass blade clusters (3px wide, closer together)
  const bladesets = [
    [[2, 9], [5, 11], [8, 8], [11, 10]],
    [[1, 10], [4, 8], [7, 11], [10, 9], [13, 7]],
    [[3, 11], [6, 9], [9, 10], [12, 8]],
    [[2, 8], [5, 10], [8, 9], [11, 11], [13, 7]],
  ];
  const blades = bladesets[variant];

  for (let i = 0; i < blades.length; i++) {
    const [bx, bh] = blades[i];
    const baseY = s;

    // Thick blade body (3px wide)
    ctx.fillStyle = `rgb(${pal.dark[0]},${pal.dark[1]},${pal.dark[2]})`;
    ctx.fillRect(bx, baseY - bh, 3, bh);

    // Mid-tone highlight stripe
    ctx.fillStyle = `rgb(${pal.mid[0]},${pal.mid[1]},${pal.mid[2]})`;
    ctx.fillRect(bx + 1, baseY - bh + 1, 1, bh - 1);

    // Light tip (top 2 pixels)
    ctx.fillStyle = `rgb(${pal.light[0]},${pal.light[1]},${pal.light[2]})`;
    ctx.fillRect(bx, baseY - bh, 2, 2);

    // Dark base (ground connection)
    ctx.fillStyle = `rgb(${pal.dark[0] - 8},${pal.dark[1] - 15},${pal.dark[2] - 5})`;
    ctx.fillRect(bx, baseY - 2, 3, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

// ---------- Main renderer ----------

export class GroundDecorationRenderer {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
  }

  /**
   * Scatter decorations over grass tiles.
   * @param {number[][]} ground - 2D tile ID array
   * @param {number[][]} collision - 2D collision array
   * @param {string} sceneName - hub/forest/lake/unicorn_meadow/dungeon
   * @param {THREE.Texture|null} decorTexture - Outdoor_Decor_Free.png texture
   */
  build(ground, collision, sceneName, decorTexture) {
    const config = SCENE_CONFIGS[sceneName];
    if (!config) return;

    const rng = seededRandom(config.seed);
    const rows = ground.length;
    const cols = ground[0].length;
    const allowed = config.allowedTiles || GRASS_IDS;

    // Pre-compute total weight for weighted random
    const totalWeight = config.types.reduce((s, t) => s + t.weight, 0);

    // Collect placements grouped by sprite key
    const placements = {};

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!allowed.has(ground[r][c])) continue;
        if (collision[r][c]) continue;
        if (rng() > config.density) continue;

        // Weighted random pick
        let roll = rng() * totalWeight;
        let chosen = config.types[0];
        for (const t of config.types) {
          roll -= t.weight;
          if (roll <= 0) { chosen = t; break; }
        }

        // Sprite variant
        const key = pickSpriteKey(chosen.kind, rng);
        if (!key) continue;

        // Sub-tile position (avoid edges slightly so nothing looks cut off)
        const margin = 0.12;
        const ox = margin + rng() * (1 - 2 * margin);
        const oy = margin + rng() * (1 - 2 * margin);
        const size = chosen.sizeMin + rng() * (chosen.sizeMax - chosen.sizeMin);

        if (!placements[key]) placements[key] = [];
        placements[key].push({ x: c + ox, y: r + oy, size });

        // 20% chance of a second, smaller decoration on the same tile
        if (rng() < 0.20) {
          const key2 = pickSpriteKey(chosen.kind, rng);
          if (key2) {
            const ox2 = margin + rng() * (1 - 2 * margin);
            const oy2 = margin + rng() * (1 - 2 * margin);
            const size2 = chosen.sizeMin + rng() * (chosen.sizeMax - chosen.sizeMin) * 0.7;
            if (!placements[key2]) placements[key2] = [];
            placements[key2].push({ x: c + ox2, y: r + oy2, size: size2 });
          }
        }
      }
    }

    // Build InstancedMesh per variant
    const geo = new THREE.PlaneGeometry(1, 1);
    const tuftTextures = getTuftTextures();

    for (const [key, positions] of Object.entries(placements)) {
      const mat = this._makeMaterial(key, decorTexture, tuftTextures);
      if (!mat) continue;

      const mesh = new THREE.InstancedMesh(geo, mat, positions.length);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        dummy.position.set(p.x, -p.y, 0.04 + p.y * 0.0001);
        dummy.scale.set(p.size, p.size, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      this.group.add(mesh);
    }

    geo.dispose(); // shared geo was cloned internally by InstancedMesh
  }

  _makeMaterial(key, decorTexture, tuftTextures) {
    if (key.startsWith('tuft_')) {
      const idx = parseInt(key.split('_')[1]);
      return new THREE.MeshBasicMaterial({
        map: tuftTextures[idx],
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
      });
    }

    if (!decorTexture) return null;

    const sprite = getSpriteRegion(key);
    if (!sprite) return null;

    const tex = decorTexture.clone();
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.set(16 / SHEET_W, 16 / SHEET_H);
    tex.offset.set(
      sprite.sx / SHEET_W,
      1 - (sprite.sy + 16) / SHEET_H,
    );

    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
  }

  dispose() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
      this.group.remove(child);
    }
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}

// ---------- Helpers ----------

function pickSpriteKey(kind, rng) {
  switch (kind) {
    case 'tuft': return 'tuft_' + Math.floor(rng() * TUFT_VARIANTS);
    case 'flower': return 'flower_' + Math.floor(rng() * FLOWER_SPRITES.length);
    case 'pebble': return 'pebble_' + Math.floor(rng() * STONE_SPRITES.length);
    case 'mushroom': return 'mushroom_' + Math.floor(rng() * MUSHROOM_SPRITES.length);
    default: return null;
  }
}

function getSpriteRegion(key) {
  const [kind, idxStr] = key.split('_');
  const idx = parseInt(idxStr);
  switch (kind) {
    case 'flower': return FLOWER_SPRITES[idx];
    case 'pebble': return STONE_SPRITES[idx];
    case 'mushroom': return MUSHROOM_SPRITES[idx];
    default: return null;
  }
}
