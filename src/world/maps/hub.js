import { FAMILY_NPCS } from '../../data/npcs.js';
import { resolveAutoTiles, PATH_EDGES } from '../../utils/AutoTiler.js';

/**
 * Tile definitions: ID → position in Floors_Tiles.png (400×416, 16px tiles)
 */
export const TILE_DEFS = {
  0: { x: 0, y: 0 },   // grass dark
  1: { x: 1, y: 0 },   // grass medium
  2: { x: 2, y: 0 },   // grass light
  3: { x: 3, y: 0 },   // grass variant
  4: { x: 0, y: 3 },   // dirt path
  5: { x: 1, y: 3 },   // dirt path variant
  6: { x: 0, y: 6 },   // wood floor
  7: { x: 1, y: 6 },   // wood floor variant
  8: { x: 4, y: 0 },   // flowers on grass
  9: { x: 0, y: 9 },   // stone floor
};

/**
 * Tree variant definitions — regions within the tree sprite sheets.
 * Model_01 Size_02 (256×128): 4×2 grid, each ~64×64
 * Model_02 Size_02 (128×96):  3×2 grid, each ~43×48
 * Model_03 Size_02 (128×160): 2×3 grid, each ~64×53
 */
export const TREE_VARIANTS = {
  oak_green:    { model: 1, srcX: 0,   srcY: 0,  srcW: 64, srcH: 64 },
  oak_yellow:   { model: 1, srcX: 64,  srcY: 0,  srcW: 64, srcH: 64 },
  oak_bare:     { model: 1, srcX: 128, srcY: 0,  srcW: 64, srcH: 64 },
  oak_ice:      { model: 1, srcX: 192, srcY: 0,  srcW: 64, srcH: 64 },
  oak_red:      { model: 1, srcX: 0,   srcY: 64, srcW: 64, srcH: 64 },
  oak_orange:   { model: 1, srcX: 64,  srcY: 64, srcW: 64, srcH: 64 },
  pine_dark:    { model: 2, srcX: 0,   srcY: 0,  srcW: 43, srcH: 48 },
  pine_med:     { model: 2, srcX: 43,  srcY: 0,  srcW: 43, srcH: 48 },
  pine_light:   { model: 2, srcX: 86,  srcY: 0,  srcW: 42, srcH: 48 },
  pine_dark2:   { model: 2, srcX: 0,   srcY: 48, srcW: 43, srcH: 48 },
  pine_med2:    { model: 2, srcX: 43,  srcY: 48, srcW: 43, srcH: 48 },
  round_green:  { model: 3, srcX: 0,   srcY: 0,  srcW: 64, srcH: 53 },
  round_dark:   { model: 3, srcX: 64,  srcY: 0,  srcW: 64, srcH: 53 },
  round_autumn: { model: 3, srcX: 0,   srcY: 54, srcW: 64, srcH: 53 },
  round_red:    { model: 3, srcX: 64,  srcY: 54, srcW: 64, srcH: 53 },
};

const W = 40;
const H = 32;

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

export function generateHubMap() {
  const rng = seededRandom(42);
  const ground = createGrid(W, H, 1);
  const collision = createGrid(W, H, 0);

  // ── Grass variety ──
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const v = rng();
      ground[r][c] = v < 0.4 ? 1 : v < 0.7 ? 2 : v < 0.9 ? 3 : 0;
    }

  // ── Forest border (2 tiles, collision) ──
  fillRect(collision, 0, 0, W, 2, 1);  fillRect(ground, 0, 0, W, 2, 0);
  fillRect(collision, 0, H-2, W, 2, 1); fillRect(ground, 0, H-2, W, 2, 0);
  fillRect(collision, 0, 0, 2, H, 1);   fillRect(ground, 0, 0, 2, H, 0);
  fillRect(collision, W-2, 0, 2, H, 1); fillRect(ground, W-2, 0, 2, H, 0);

  // ── Exits ──
  fillRect(collision, 18, 0, 4, 2, 0);  fillRect(ground, 18, 0, 4, 2, 4);   // North
  fillRect(collision, 18, H-2, 4, 2, 0); fillRect(ground, 18, H-2, 4, 2, 4); // South
  fillRect(collision, W-2, 13, 2, 4, 0); fillRect(ground, W-2, 13, 2, 4, 4); // East

  // ── Main paths — organic Y-shape with gentle widening ──
  // Vertical main road (north exit → village square → south exit)
  fillRect(ground, 19, 2, 2, 5, 4);       // narrow path from north
  fillRect(ground, 18, 7, 4, 3, 4);       // widens near houses
  fillRect(ground, 19, 10, 2, 2, 4);      // narrows again
  fillRect(ground, 19, 18, 2, 2, 4);      // south of square
  fillRect(ground, 18, 20, 4, 2, 4);      // widens near south area
  fillRect(ground, 19, 22, 2, 6, 4);      // narrow to south exit

  // Horizontal paths (branching to buildings)
  fillRect(ground, 10, 14, 8, 2, 4);      // west path to kitchen area
  fillRect(ground, 22, 14, 8, 2, 4);      // east path to workshop area
  fillRect(ground, 30, 14, 8, 2, 4);      // east path to dungeon exit

  // Diagonal/branch paths to buildings
  fillRect(ground, 10, 10, 2, 4, 4);      // side path to kitchen
  fillRect(ground, 8, 10, 3, 1, 4);       // connects kitchen
  fillRect(ground, 28, 10, 2, 4, 4);      // side path to workshop
  fillRect(ground, 28, 10, 4, 1, 4);      // connects workshop

  // Path to garden (SW)
  fillRect(ground, 10, 16, 2, 5, 4);      // south-west branch
  fillRect(ground, 8, 20, 4, 1, 4);       // connects garden

  // Path to sawmill (SE)
  fillRect(ground, 28, 16, 2, 5, 4);      // south-east branch
  fillRect(ground, 28, 20, 3, 1, 4);      // connects sawmill

  // ── Village square — green park with flower border ──
  fillRect(ground, 17, 12, 6, 6, 2);      // main square: light grass
  fillRect(ground, 18, 13, 4, 4, 8);      // inner: flower grass
  fillRect(ground, 19, 14, 2, 2, 2);      // very center: light grass clearing
  fillRect(ground, 16, 13, 1, 4, 2);      // west edge: light grass
  fillRect(ground, 23, 13, 1, 4, 2);      // east edge: light grass
  fillRect(ground, 18, 11, 4, 1, 2);      // north edge: light grass
  fillRect(ground, 18, 18, 4, 1, 2);      // south edge: light grass
  // Dirt path ring around the park (so it connects naturally to roads)
  fillRect(ground, 17, 12, 6, 1, 4);      // north path edge
  fillRect(ground, 17, 17, 6, 1, 4);      // south path edge
  fillRect(ground, 17, 12, 1, 6, 4);      // west path edge
  fillRect(ground, 22, 12, 1, 6, 4);      // east path edge

  // ── Small dirt patches near buildings (lived-in look) ──
  fillRect(ground, 7, 9, 3, 2, 5);        // kitchen front yard
  fillRect(ground, 29, 9, 3, 2, 5);       // workshop front yard
  fillRect(ground, 32, 13, 2, 1, 5);      // deda's yard
  fillRect(ground, 29, 23, 2, 1, 5);      // sawmill yard

  // ── Building floors ──
  // Kitchen (NW) — collision walls around edges
  fillRect(ground, 6, 5, 5, 4, 6);
  fillRect(collision, 6, 5, 5, 1, 1);
  fillRect(collision, 6, 5, 1, 4, 1);
  fillRect(collision, 10, 5, 1, 4, 1);

  // Workshop (NE)
  fillRect(ground, 28, 5, 5, 4, 6);
  fillRect(collision, 28, 5, 5, 1, 1);
  fillRect(collision, 28, 5, 1, 4, 1);
  fillRect(collision, 32, 5, 1, 4, 1);

  // Garden (SW) — flower grass with irregular edges
  fillRect(ground, 5, 20, 8, 6, 8);
  fillRect(ground, 4, 21, 1, 4, 8);       // garden spill-over left
  fillRect(ground, 13, 21, 1, 3, 8);      // garden spill-over right

  // Sawmill (SE)
  fillRect(ground, 28, 20, 5, 4, 7);

  // Deda's Lab (E)
  fillRect(ground, 31, 10, 4, 3, 9);
  fillRect(collision, 34, 10, 1, 3, 1);

  // ── Trees — well-placed, minimum 2 tiles from edges to prevent clipping ──
  const trees = [
    // Border trees — top (min y=3 so canopy doesn't clip at camera edge)
    { x: 3,  y: 3, v: 'pine_dark' },
    { x: 7,  y: 3, v: 'oak_green' },
    { x: 11, y: 3, v: 'pine_med' },
    { x: 15, y: 3, v: 'round_green' },
    // (north exit gap 18-21)
    { x: 23, y: 3, v: 'round_dark' },
    { x: 27, y: 3, v: 'pine_light' },
    { x: 31, y: 3, v: 'oak_green' },
    { x: 35, y: 3, v: 'pine_dark' },

    // Border trees — bottom (y=28 max, leaves room for canopy)
    { x: 3,  y: 28, v: 'pine_dark2' },
    { x: 7,  y: 28, v: 'oak_orange' },
    { x: 11, y: 28, v: 'round_green' },
    { x: 15, y: 28, v: 'pine_med' },
    // (south exit gap)
    { x: 23, y: 28, v: 'oak_green' },
    { x: 27, y: 28, v: 'round_dark' },
    { x: 31, y: 28, v: 'pine_dark' },
    { x: 35, y: 28, v: 'oak_yellow' },

    // Border — left (min x=3)
    { x: 3, y: 6,  v: 'pine_dark' },
    { x: 3, y: 11, v: 'oak_green' },
    { x: 3, y: 17, v: 'round_green' },
    { x: 3, y: 23, v: 'pine_med' },

    // Border — right (max x=36, skip exit 13-16)
    { x: 36, y: 5,  v: 'round_dark' },
    { x: 36, y: 10, v: 'pine_dark' },
    { x: 36, y: 19, v: 'oak_green' },
    { x: 36, y: 24, v: 'pine_med2' },

    // Interior — 4 decorative trees (removed center clipped ones)
    { x: 13, y: 6,  v: 'oak_green' },   // near kitchen path
    { x: 26, y: 6,  v: 'round_green' }, // near workshop path
    { x: 13, y: 24, v: 'pine_med' },    // near garden
    { x: 26, y: 24, v: 'oak_yellow' },  // near sawmill
  ];

  // Tree trunk collision (1 tile at base)
  for (const t of trees) {
    const ty = Math.min(t.y, H - 1);
    const tx = Math.min(t.x, W - 1);
    if (ty >= 0 && tx >= 0) collision[ty][tx] = 1;
  }

  // ── Props — rich village design using Farm RPG assets ──
  const props = [
    ...trees.map(t => ({ type: 'tree', variant: t.v, x: t.x, y: t.y })),

    // ── Real pixel-art houses (from Farm RPG pack) ──
    { type: 'house', x: 5,  y: 6  }, // Mama Tanja — kitchen
    { type: 'house', x: 27, y: 6  }, // Papa Milos — workshop
    { type: 'house', x: 27, y: 19 }, // Opa — sawmill
    { type: 'house', x: 32, y: 10 }, // Deda — alchemy lab

    // ── Trophy shelf (neben Mama Tanjas Haus) ──
    { type: 'trophy_shelf', x: 5, y: 10 },

    // ── Maple trees from Farm RPG (complement existing trees) ──
    { type: 'maple_tree', x: 22, y: 8 },
    { type: 'maple_tree', x: 22, y: 22 },

    // ── Bonfire (south side of park, communal gathering spot) ──
    { type: 'bonfire', x: 20, y: 19 },

    // ── Crafting Stations ──
    { type: 'station', station: 'cooking',   x: 7,  y: 8,  w: 2, h: 1 },
    { type: 'station', station: 'workbench', x: 29, y: 8,  w: 2, h: 1 },
    { type: 'station', station: 'anvil',     x: 31, y: 8,  w: 1, h: 1 },
    { type: 'station', station: 'sawmill',   x: 29, y: 22, w: 2, h: 1 },
    { type: 'station', station: 'alchemy',   x: 33, y: 11, w: 1, h: 1 },

    // ── Interactive garden plots (Oma's garden — GardenSystem) ──
    { type: 'garden_plot', x: 6,  y: 22 },
    { type: 'garden_plot', x: 7,  y: 22 },
    { type: 'garden_plot', x: 8,  y: 22 },
    { type: 'garden_plot', x: 9,  y: 22 },
    { type: 'garden_plot', x: 10, y: 22 },
    { type: 'garden_plot', x: 6,  y: 24 },
    { type: 'garden_plot', x: 7,  y: 24 },
    { type: 'garden_plot', x: 8,  y: 24 },
    { type: 'garden_plot', x: 9,  y: 24 },
    { type: 'garden_plot', x: 10, y: 24 },

    // ── Real fences from Farm RPG (around garden) ──
    { type: 'real_fence', x: 5,  y: 21 },
    { type: 'real_fence', x: 6,  y: 21 },
    { type: 'real_fence', x: 7,  y: 21 },
    { type: 'real_fence', x: 8,  y: 21 },
    { type: 'real_fence', x: 9,  y: 21 },
    { type: 'real_fence', x: 10, y: 21 },
    { type: 'real_fence', x: 11, y: 21 },
    { type: 'real_fence', x: 5,  y: 25 },
    { type: 'real_fence', x: 6,  y: 25 },
    { type: 'real_fence', x: 7,  y: 25 },
    { type: 'real_fence', x: 8,  y: 25 },
    { type: 'real_fence', x: 9,  y: 25 },
    { type: 'real_fence', x: 10, y: 25 },
    { type: 'real_fence', x: 11, y: 25 },

    // ── Vegetable garden nodes (Oma's Ernte) ──
    { type: 'resource', resourceType: 'herb', itemId: 'vegetable', x: 11, y: 23, id: 'veggie1', hitsNeeded: 1, respawnTime: 45 },
    { type: 'resource', resourceType: 'herb', itemId: 'vegetable', x: 11, y: 24, id: 'veggie2', hitsNeeded: 1, respawnTime: 45 },
    { type: 'resource', resourceType: 'herb', itemId: 'vegetable', x: 5,  y: 23, id: 'veggie3', hitsNeeded: 1, respawnTime: 45 },
    // ── Seed pickup near Oma's garden ──
    { type: 'resource', resourceType: 'herb', itemId: 'seed_carrot', x: 12, y: 23, id: 'seed1', hitsNeeded: 1, respawnTime: 120 },
    { type: 'resource', resourceType: 'herb', itemId: 'seed_tomato', x: 12, y: 24, id: 'seed2', hitsNeeded: 1, respawnTime: 120 },

    // ── Treasure chests ──
    { type: 'chest', x: 9,  y: 9 },  // inside kitchen
    { type: 'chest', x: 33, y: 12 }, // Deda's lab

    // ── Farm animals (ambient life!) ──
    { type: 'chicken', x: 12, y: 20 },
    { type: 'chicken', x: 14, y: 22 },
    { type: 'chicken', x: 11, y: 24 },

    // ── Bushes — organic clusters along paths and near buildings ──
    { type: 'bush', x: 15, y: 11 },
    { type: 'bush', x: 24, y: 11 },
    { type: 'bush', x: 15, y: 19 },
    { type: 'bush', x: 24, y: 19 },
    { type: 'bush', x: 5,  y: 14 },
    { type: 'bush', x: 5,  y: 16 },
    { type: 'bush', x: 34, y: 17 },
    { type: 'bush', x: 6,  y: 11 },
    { type: 'bush', x: 33, y: 9 },
    { type: 'bush', x: 14, y: 4 },
    { type: 'bush', x: 25, y: 4 },

    // ── Village park flowers (spawn area) ──
    { type: 'flower', x: 18, y: 13 },
    { type: 'flower', x: 21, y: 13 },
    { type: 'flower', x: 18, y: 16 },
    { type: 'flower', x: 21, y: 16 },

    // ── Flowers — scattered naturally along paths and between buildings ──
    { type: 'flower', x: 17, y: 9 },
    { type: 'flower', x: 22, y: 9 },
    { type: 'flower', x: 18, y: 20 },
    { type: 'flower', x: 21, y: 20 },
    { type: 'flower', x: 7,  y: 13 },
    { type: 'flower', x: 12, y: 15 },
    { type: 'flower', x: 27, y: 13 },
    { type: 'flower', x: 32, y: 15 },
    { type: 'flower', x: 15, y: 7 },
    { type: 'flower', x: 24, y: 7 },
    { type: 'flower', x: 14, y: 26 },
    { type: 'flower', x: 25, y: 26 },
    // Extra flowers for village life
    { type: 'flower', x: 9,  y: 11 },
    { type: 'flower', x: 31, y: 11 },
    { type: 'flower', x: 16, y: 16 },
    { type: 'flower', x: 23, y: 16 },
    { type: 'flower', x: 11, y: 19 },
    { type: 'flower', x: 27, y: 19 },
    { type: 'flower', x: 6,  y: 18 },
    { type: 'flower', x: 35, y: 20 },

    // ── Rocks — natural placement ──
    { type: 'rock', x: 6,  y: 12 },
    { type: 'rock', x: 33, y: 17 },
    { type: 'rock', x: 14, y: 27 },
    { type: 'rock', x: 25, y: 9 },
    { type: 'rock', x: 4,  y: 27 },

    // ── Wilted plants (heal with F key — part of progression) ──
    { type: 'wilted_plant', x: 14, y: 12 },
    { type: 'wilted_plant', x: 24, y: 10 },
    { type: 'wilted_plant', x: 26, y: 18 },
    { type: 'wilted_plant', x: 10, y: 17 },
    { type: 'wilted_plant', x: 21, y: 24 },
    { type: 'wilted_plant', x: 34, y: 19 },

    // ── Village well (center of square — decorative focal point) ──
    { type: 'rock', x: 19, y: 14 },

    // ── Signposts near exits ──
    { type: 'signpost', x: 16, y: 3,  label: '🌲 Wald',   dir: 'north' },
    { type: 'signpost', x: 22, y: 3,  label: '🌲 Wald',   dir: 'north' },
    { type: 'signpost', x: 17, y: 27, label: '🏖 See',    dir: 'south' },
    { type: 'signpost', x: 22, y: 27, label: '🏖 See',    dir: 'south' },
    { type: 'signpost', x: 37, y: 14, label: '⚔ Dungeon', dir: 'east'  },
  ];

  // Station collision
  for (const p of props)
    if (p.type === 'station') fillRect(collision, p.x, p.y, p.w, p.h, 1);

  // Bonfire collision
  collision[19][20] = 1;

  const exits = [
    { id: 'north', x: 18, y: 0, w: 4, h: 2, target: 'forest', spawnX: 25, spawnY: 37 },
    { id: 'south', x: 18, y: H-2, w: 4, h: 2, target: 'lake', spawnX: 21, spawnY: 4 },
    { id: 'east',  x: W-2, y: 13, w: 2, h: 4, target: 'dungeon', spawnX: 4, spawnY: 14 },
  ];

  // ── Auto-tile path edges (smooth grass-to-path transitions) ──
  // Pass 1: paths (tile 4) — treat other surfaces as "same terrain"
  resolveAutoTiles(ground, 4, PATH_EDGES, [5, 6, 7, 8, 9]);
  // Pass 2: village square / dirt (tile 5) — include path edge tiles from pass 1
  const pathEdgeIds = Object.values(PATH_EDGES);
  resolveAutoTiles(ground, 5, PATH_EDGES, [4, 6, 7, 8, 9, ...pathEdgeIds]);

  return {
    width: W, height: H,
    ground, collision, props, exits,
    npcs: FAMILY_NPCS,
    tileDefs: null, // use GENERATED_TILE_DEFS (includes auto-tile IDs)
    playerSpawn: { x: 19, y: 14 }
  };
}
