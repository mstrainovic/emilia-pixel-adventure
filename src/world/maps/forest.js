import { TREE_VARIANTS } from './hub.js';

const W = 50;
const H = 40;

function createGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function fillRect(grid, x, y, w, h, val) {
  for (let r = y; r < y + h && r < grid.length; r++)
    for (let c = x; c < x + w && c < grid[0].length; c++)
      if (r >= 0 && c >= 0) grid[r][c] = val;
}

function fillCircle(grid, cx, cy, radius, val) {
  for (let r = cy - radius; r <= cy + radius; r++)
    for (let c = cx - radius; c <= cx + radius; c++) {
      const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2);
      if (dist <= radius && r >= 0 && r < grid.length && c >= 0 && c < grid[0].length)
        grid[r][c] = val;
    }
}

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function generateForestMap() {
  const rng = seededRandom(7777);
  const ground = createGrid(W, H, 0);
  const collision = createGrid(W, H, 0);

  // ── Base ground: dark forest grass with variety ──
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const v = rng();
      // North half: darker (more ID 0), South half: lighter
      if (r < H / 2) {
        ground[r][c] = v < 0.5 ? 0 : v < 0.75 ? 1 : v < 0.9 ? 3 : 2;
      } else {
        ground[r][c] = v < 0.3 ? 0 : v < 0.55 ? 1 : v < 0.8 ? 2 : 3;
      }
    }

  // ── Forest border (2 tiles collision around edges) ──
  fillRect(collision, 0, 0, W, 2, 1);  fillRect(ground, 0, 0, W, 2, 0);
  fillRect(collision, 0, H - 2, W, 2, 1); fillRect(ground, 0, H - 2, W, 2, 0);
  fillRect(collision, 0, 0, 2, H, 1);  fillRect(ground, 0, 0, 2, H, 0);
  fillRect(collision, W - 2, 0, 2, H, 1); fillRect(ground, W - 2, 0, 2, H, 0);

  // ── South exit to hub (bottom, cols 23-26) ──
  fillRect(collision, 23, H - 2, 4, 2, 0);
  fillRect(ground, 23, H - 2, 4, 2, 4);

  // ── Secret north exit to unicorn meadow (hidden behind big tree, cols 24-25) ──
  fillRect(collision, 24, 0, 2, 2, 0);
  fillRect(ground, 24, 0, 2, 2, 8); // flower grass hints at something magical

  // ── Main paths ──
  // Vertical path from south exit going north
  fillRect(ground, 24, 10, 2, H - 12, 4);
  // East-west path through middle clearing
  fillRect(ground, 8, 20, 34, 2, 4);
  // North branch path leading to dense area
  fillRect(ground, 24, 4, 2, 8, 4);
  // Small path leading to west clearing
  fillRect(ground, 8, 14, 2, 7, 4);
  fillRect(ground, 8, 14, 17, 2, 4);
  // Path to east clearing
  fillRect(ground, 25, 20, 12, 2, 4);
  fillRect(ground, 36, 14, 2, 7, 4);

  // ── Path variety (dirt dark along edges) ──
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      if (ground[r][c] === 4) {
        // Add dirt dark (5) along path borders
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && ground[nr][nc] !== 4 && ground[nr][nc] !== 5 && ground[nr][nc] !== 9) {
              if (rng() < 0.3) ground[nr][nc] = 5;
            }
          }
      }
    }

  // ── Clearings ──
  // South clearing (safe area near spawn)
  fillCircle(ground, 14, 28, 4, 2);
  fillCircle(ground, 14, 28, 2, 8); // flowers in center

  // Central clearing (crossroads)
  fillCircle(ground, 25, 20, 3, 1);

  // East clearing
  fillCircle(ground, 37, 14, 3, 2);
  fillCircle(ground, 37, 14, 1, 8);

  // Northwest clearing (danger zone)
  fillCircle(ground, 12, 8, 3, 1);

  // Northeast clearing (orc camp)
  fillCircle(ground, 40, 7, 3, 0);
  fillCircle(ground, 40, 7, 2, 5);

  // ── Small ponds (use tile 9 for wet areas) ──
  // Pond in south clearing
  fillCircle(ground, 14, 30, 2, 9);
  fillCircle(collision, 14, 30, 1, 1); // center of pond is impassable

  // Pond in north area
  fillCircle(ground, 30, 8, 2, 9);
  fillCircle(collision, 30, 8, 1, 1);

  // Small puddle near east clearing
  fillRect(ground, 42, 16, 2, 2, 9);

  // ── Trees ──
  const forestTreeVariants = [
    'oak_green', 'oak_green', 'oak_green', 'pine_dark', 'pine_med',
    'pine_light', 'round_green', 'round_dark', 'oak_yellow', 'pine_dark2'
  ];
  const northTreeVariants = [
    'pine_dark', 'pine_dark', 'pine_dark2', 'pine_med', 'round_dark',
    'oak_bare', 'oak_green'
  ];

  const trees = [];

  // Border trees — top row
  for (let c = 2; c < W - 2; c += 3) {
    if (c >= 23 && c <= 26) continue; // skip secret exit area
    const v = northTreeVariants[Math.floor(rng() * northTreeVariants.length)];
    trees.push({ x: c, y: 2 + Math.floor(rng() * 2), v });
  }
  // Border trees — bottom row
  for (let c = 2; c < W - 2; c += 3) {
    if (c >= 22 && c <= 27) continue; // skip south exit
    const v = forestTreeVariants[Math.floor(rng() * forestTreeVariants.length)];
    trees.push({ x: c, y: H - 2 + Math.floor(rng() * 2), v });
  }
  // Border trees — left
  for (let r = 3; r < H - 2; r += 3) {
    const v = forestTreeVariants[Math.floor(rng() * forestTreeVariants.length)];
    trees.push({ x: 2 + Math.floor(rng() * 1), y: r, v });
  }
  // Border trees — right
  for (let r = 3; r < H - 2; r += 3) {
    const v = forestTreeVariants[Math.floor(rng() * forestTreeVariants.length)];
    trees.push({ x: W - 4 + Math.floor(rng() * 2), y: r, v });
  }

  // Dense north forest (rows 2-16) — more trees
  const northDensity = [
    { x: 4, y: 3 }, { x: 7, y: 4 }, { x: 10, y: 3 }, { x: 16, y: 5 },
    { x: 19, y: 3 }, { x: 22, y: 5 }, { x: 28, y: 4 }, { x: 33, y: 3 },
    { x: 36, y: 5 }, { x: 43, y: 3 }, { x: 46, y: 5 },
    { x: 5, y: 8 }, { x: 8, y: 10 }, { x: 15, y: 7 }, { x: 18, y: 9 },
    { x: 34, y: 8 }, { x: 38, y: 10 }, { x: 44, y: 8 },
    { x: 6, y: 13 }, { x: 13, y: 12 }, { x: 17, y: 14 }, { x: 21, y: 13 },
    { x: 28, y: 12 }, { x: 33, y: 14 }, { x: 39, y: 11 }, { x: 44, y: 13 },
    { x: 46, y: 10 }, { x: 3, y: 16 }, { x: 11, y: 16 }, { x: 18, y: 16 },
    { x: 30, y: 16 }, { x: 42, y: 16 },
  ];
  for (const t of northDensity) {
    const v = northTreeVariants[Math.floor(rng() * northTreeVariants.length)];
    trees.push({ x: t.x, y: t.y, v });
  }

  // South forest (rows 22-37) — lighter, fewer trees
  const southDensity = [
    { x: 4, y: 24 }, { x: 8, y: 26 }, { x: 20, y: 25 }, { x: 30, y: 24 },
    { x: 35, y: 26 }, { x: 42, y: 25 }, { x: 46, y: 23 },
    { x: 6, y: 30 }, { x: 11, y: 32 }, { x: 18, y: 30 }, { x: 22, y: 33 },
    { x: 28, y: 31 }, { x: 33, y: 30 }, { x: 38, y: 33 }, { x: 44, y: 30 },
    { x: 4, y: 35 }, { x: 10, y: 36 }, { x: 16, y: 34 }, { x: 30, y: 35 },
    { x: 36, y: 36 }, { x: 42, y: 34 }, { x: 46, y: 36 },
  ];
  for (const t of southDensity) {
    const v = forestTreeVariants[Math.floor(rng() * forestTreeVariants.length)];
    trees.push({ x: t.x, y: t.y, v });
  }

  // Secret exit guardian tree (large oak hiding the path)
  trees.push({ x: 24, y: 2, v: 'oak_green' });

  // Set tree trunk collision
  for (const t of trees) {
    const ty = Math.min(Math.max(t.y, 0), H - 1);
    const tx = Math.min(Math.max(t.x, 0), W - 1);
    collision[ty][tx] = 1;
  }

  // ── Props ──
  const props = [
    // Trees
    ...trees.map(t => ({ type: 'tree', variant: t.v, x: t.x, y: t.y })),

    // ── Mob spawns ──
    // South area — easier slimes
    { type: 'mob_spawn', mobType: 'slime_green', x: 10, y: 26, id: 'slime_s1' },
    { type: 'mob_spawn', mobType: 'slime_green', x: 38, y: 28, id: 'slime_s2' },
    { type: 'mob_spawn', mobType: 'slime_blue', x: 20, y: 32, id: 'slime_s3' },

    // North area — harder slimes
    { type: 'mob_spawn', mobType: 'slime_red', x: 12, y: 8, id: 'slime_n1' },
    { type: 'mob_spawn', mobType: 'slime_red', x: 40, y: 7, id: 'slime_n2' },
    { type: 'mob_spawn', mobType: 'slime_purple', x: 42, y: 9, id: 'slime_n3' },

    // ── Resource nodes ──
    // Choppable trees
    { type: 'resource', resourceType: 'tree', x: 6, y: 22, id: 'rtree1' },
    { type: 'resource', resourceType: 'tree', x: 32, y: 25, id: 'rtree2' },
    { type: 'resource', resourceType: 'tree', x: 44, y: 18, id: 'rtree3' },
    { type: 'resource', resourceType: 'tree', x: 14, y: 10, id: 'rtree4' },

    // Mineable rocks
    { type: 'resource', resourceType: 'rock', x: 37, y: 15, id: 'rock1' },
    { type: 'resource', resourceType: 'rock', x: 9, y: 14, id: 'rock2' },
    { type: 'resource', resourceType: 'rock', x: 45, y: 12, id: 'rock3' },

    // Mushroom spots
    { type: 'resource', resourceType: 'mushroom', x: 5, y: 18, id: 'mush1' },
    { type: 'resource', resourceType: 'mushroom', x: 20, y: 12, id: 'mush2' },
    { type: 'resource', resourceType: 'mushroom', x: 38, y: 30, id: 'mush3' },
    { type: 'resource', resourceType: 'mushroom', x: 28, y: 6, id: 'mush4' },

    // Earth collectibles
    { type: 'resource', resourceType: 'earth', x: 16, y: 28, id: 'earth1' },
    { type: 'resource', resourceType: 'earth', x: 36, y: 20, id: 'earth2' },
    { type: 'resource', resourceType: 'earth', x: 8, y: 8, id: 'earth3' },
    { type: 'resource', resourceType: 'earth', x: 44, y: 28, id: 'earth4' },
    { type: 'resource', resourceType: 'earth', x: 22, y: 16, id: 'earth5' },

    // ── Wilted plants (for Bloom healing mechanic) ──
    { type: 'wilted_plant', x: 12, y: 24, id: 'wilt1' },
    { type: 'wilted_plant', x: 36, y: 18, id: 'wilt2' },
    { type: 'wilted_plant', x: 8, y: 32, id: 'wilt3' },
    { type: 'wilted_plant', x: 40, y: 24, id: 'wilt4' },
    { type: 'wilted_plant', x: 18, y: 10, id: 'wilt5' },
    { type: 'wilted_plant', x: 30, y: 14, id: 'wilt6' },
    { type: 'wilted_plant', x: 24, y: 30, id: 'wilt7' },

    // ── Decorative props ──
    // Bushes along paths
    { type: 'bush', x: 22, y: 20 },
    { type: 'bush', x: 27, y: 20 },
    { type: 'bush', x: 24, y: 18 },
    { type: 'bush', x: 24, y: 22 },
    { type: 'bush', x: 10, y: 20 },
    { type: 'bush', x: 40, y: 20 },

    // Flowers in clearings
    { type: 'flower', x: 13, y: 27 },
    { type: 'flower', x: 15, y: 27 },
    { type: 'flower', x: 13, y: 29 },
    { type: 'flower', x: 15, y: 29 },
    { type: 'flower', x: 36, y: 13 },
    { type: 'flower', x: 38, y: 13 },
    { type: 'flower', x: 37, y: 15 },

    // Rocks (decorative)
    { type: 'rock', x: 29, y: 9 },
    { type: 'rock', x: 31, y: 9 },
    { type: 'rock', x: 43, y: 17 },
    { type: 'rock', x: 7, y: 15 },
  ];

  // ── Exits ──
  const exits = [
    // South exit back to hub
    { id: 'south', x: 23, y: H - 2, w: 4, h: 2, target: 'hub', spawnX: 20, spawnY: 4 },
    // Secret north exit to unicorn meadow (unlocked after healing 10 plants)
    { id: 'north_secret', x: 24, y: 0, w: 2, h: 2, target: 'unicorn_meadow', spawnX: 12, spawnY: 17, hidden: true, requirement: 'heal_10_plants' },
  ];

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 25, y: 37 },
    tileDefs: null,
  };
}
