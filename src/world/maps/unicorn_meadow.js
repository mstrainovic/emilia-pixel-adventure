import { TREE_VARIANTS } from './hub.js';

const W = 25;
const H = 20;

function createGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function fillRect(grid, x, y, w, h, val) {
  for (let r = y; r < y + h && r < grid.length; r++)
    for (let c = x; c < x + w && c < grid[0].length; c++)
      if (r >= 0 && c >= 0) grid[r][c] = val;
}

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/**
 * Die Magische Wiese — a magical unicorn meadow.
 * No enemies. Ethereal, soft, covered in flowers and golden light.
 */
export function generateUnicornMeadowMap() {
  const rng = seededRandom(7777);
  const ground = createGrid(W, H, 8); // default: flower grass everywhere
  const collision = createGrid(W, H, 0);

  // ── Flower grass variety — mostly tile 8, with patches of 2 and 3 ──
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const v = rng();
      if (v < 0.65) ground[r][c] = 8;       // flower grass (dominant)
      else if (v < 0.80) ground[r][c] = 2;   // light grass
      else if (v < 0.92) ground[r][c] = 3;   // grass variant
      else ground[r][c] = 1;                  // medium grass accent
    }

  // ── Thin tree border — only 1 tile of collision ──
  fillRect(collision, 0, 0, W, 1, 1);   fillRect(ground, 0, 0, W, 1, 2);
  fillRect(collision, 0, H - 1, W, 1, 1); fillRect(ground, 0, H - 1, W, 1, 2);
  fillRect(collision, 0, 0, 1, H, 1);   fillRect(ground, 0, 0, 1, H, 2);
  fillRect(collision, W - 1, 0, 1, H, 1); fillRect(ground, W - 1, 0, 1, H, 2);

  // ── South exit → forest (cols 10-13) ──
  fillRect(collision, 10, H - 1, 4, 1, 0);
  fillRect(ground, 10, H - 1, 4, 1, 8);

  // ── Gentle path from south exit into the meadow ──
  fillRect(ground, 11, H - 3, 2, 3, 2); // light grass path

  // ── Magical trees — golden/autumn colors, sparse ──
  const trees = [
    // Border trees — top (pushed 2 tiles inward to avoid canopy clipping)
    { x: 2,  y: 2, v: 'oak_yellow' },
    { x: 6,  y: 2, v: 'round_autumn' },
    { x: 12, y: 2, v: 'oak_yellow' },
    { x: 18, y: 2, v: 'round_autumn' },
    { x: 22, y: 2, v: 'oak_yellow' },

    // Border trees — bottom (skip exit 10-13)
    { x: 2,  y: 18, v: 'round_autumn' },
    { x: 5,  y: 18, v: 'oak_yellow' },
    { x: 8,  y: 18, v: 'round_autumn' },
    // (exit gap 10-13)
    { x: 15, y: 18, v: 'oak_yellow' },
    { x: 19, y: 18, v: 'round_autumn' },
    { x: 22, y: 18, v: 'oak_yellow' },

    // Border trees — left (pushed 2 tiles inward)
    { x: 2, y: 5, v: 'oak_yellow' },
    { x: 2, y: 10, v: 'round_autumn' },
    { x: 2, y: 15, v: 'oak_yellow' },

    // Border trees — right (pushed 2 tiles inward)
    { x: 22, y: 5, v: 'round_autumn' },
    { x: 22, y: 10, v: 'oak_yellow' },
    { x: 22, y: 15, v: 'round_autumn' },

    // Interior magical trees — just a few, for atmosphere
    { x: 5,  y: 4, v: 'oak_yellow' },
    { x: 19, y: 4, v: 'round_autumn' },
    { x: 4,  y: 14, v: 'round_autumn' },
    { x: 20, y: 14, v: 'oak_yellow' },
  ];

  // Tree trunk collision
  for (const t of trees) {
    const ty = Math.min(t.y, H - 1);
    const tx = Math.min(t.x, W - 1);
    if (ty >= 0 && tx >= 0) collision[ty][tx] = 1;
  }

  // ── Props ──
  const props = [
    // Trees
    ...trees.map(t => ({ type: 'tree', variant: t.v, x: t.x, y: t.y })),

    // ── Unicorn spawn positions ──
    { type: 'unicorn_spawn', x: 7,  y: 7 },
    { type: 'unicorn_spawn', x: 17, y: 6 },
    { type: 'unicorn_spawn', x: 12, y: 13 },

    // ── Crystal flower patches ──
    { type: 'crystal_flower', x: 6,  y: 5 },
    { type: 'crystal_flower', x: 18, y: 5 },
    { type: 'crystal_flower', x: 10, y: 9 },
    { type: 'crystal_flower', x: 14, y: 9 },
    { type: 'crystal_flower', x: 8,  y: 14 },
    { type: 'crystal_flower', x: 16, y: 14 },
    { type: 'crystal_flower', x: 12, y: 3 },
    { type: 'crystal_flower', x: 12, y: 16 },

    // ── Rainbow particle zone — center of the meadow ──
    { type: 'rainbow_zone', x: 8, y: 6, w: 9, h: 7 },

    // ── Scattered flowers — EVERYWHERE ──
    { type: 'flower', x: 3,  y: 3 },
    { type: 'flower', x: 7,  y: 2 },
    { type: 'flower', x: 11, y: 2 },
    { type: 'flower', x: 15, y: 2 },
    { type: 'flower', x: 21, y: 3 },
    { type: 'flower', x: 2,  y: 6 },
    { type: 'flower', x: 9,  y: 5 },
    { type: 'flower', x: 14, y: 4 },
    { type: 'flower', x: 22, y: 6 },
    { type: 'flower', x: 3,  y: 9 },
    { type: 'flower', x: 8,  y: 8 },
    { type: 'flower', x: 16, y: 8 },
    { type: 'flower', x: 21, y: 9 },
    { type: 'flower', x: 5,  y: 11 },
    { type: 'flower', x: 10, y: 11 },
    { type: 'flower', x: 14, y: 11 },
    { type: 'flower', x: 19, y: 11 },
    { type: 'flower', x: 2,  y: 13 },
    { type: 'flower', x: 11, y: 13 },
    { type: 'flower', x: 13, y: 12 },
    { type: 'flower', x: 22, y: 13 },
    { type: 'flower', x: 6,  y: 16 },
    { type: 'flower', x: 9,  y: 15 },
    { type: 'flower', x: 15, y: 16 },
    { type: 'flower', x: 18, y: 15 },
    { type: 'flower', x: 3,  y: 17 },
    { type: 'flower', x: 7,  y: 17 },
    { type: 'flower', x: 12, y: 17 },
    { type: 'flower', x: 17, y: 17 },
    { type: 'flower', x: 21, y: 17 },
    { type: 'flower', x: 5,  y: 7 },
    { type: 'flower', x: 19, y: 7 },
    { type: 'flower', x: 10, y: 6 },
    { type: 'flower', x: 14, y: 6 },
  ];

  // Exit north → Cloud Castle (rainbow ascent)
  props.push({ type: 'exit', x: 11, y: 0, width: 3, target: 'cloud_castle', spawnX: 14, spawnY: 42 });

  // Clear north border collision for exit (cols 11-13)
  fillRect(collision, 11, 0, 3, 1, 0);
  fillRect(ground, 11, 0, 3, 1, 8);

  const exits = [
    { id: 'south', x: 10, y: H - 1, w: 4, h: 1, target: 'forest', spawnX: 25, spawnY: 3 },
    { id: 'north', x: 11, y: 0, w: 3, h: 1, target: 'cloud_castle', spawnX: 14, spawnY: 42 },
  ];

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 12, y: 17 },
    tileDefs: null,
  };
}
