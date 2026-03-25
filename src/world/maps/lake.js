import { TREE_VARIANTS } from './hub.js';
import { resolveAutoTiles, WATER_EDGES } from '../../utils/AutoTiler.js';

const W = 45;
const H = 35;

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
 * Der Blaue See — a peaceful lake area.
 * No enemies. Fishing, gardening, and gathering by the shore.
 */
export function generateLakeMap() {
  const rng = seededRandom(1337);
  const ground = createGrid(W, H, 1);
  const collision = createGrid(W, H, 0);

  // ── Grass variety ──
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const v = rng();
      ground[r][c] = v < 0.35 ? 1 : v < 0.6 ? 2 : v < 0.85 ? 3 : 0;
    }

  // ── Forest border (1-2 tiles of collision trees) ──
  fillRect(collision, 0, 0, W, 2, 1);   fillRect(ground, 0, 0, W, 2, 0);
  fillRect(collision, 0, H - 2, W, 2, 1); fillRect(ground, 0, H - 2, W, 2, 0);
  fillRect(collision, 0, 0, 2, H, 1);   fillRect(ground, 0, 0, 2, H, 0);
  fillRect(collision, W - 2, 0, 2, H, 1); fillRect(ground, W - 2, 0, 2, H, 0);

  // ── North exit → hub (cols 20-23) ──
  fillRect(collision, 20, 0, 4, 2, 0);
  fillRect(ground, 20, 0, 4, 2, 4);

  // ── Path from north exit down to shore ──
  fillRect(ground, 21, 2, 2, 6, 4);

  // ── Lake — irregular oval in the center ──
  // Center of lake: roughly col 22, row 19. Semi-axes: ~10 cols, ~7 rows.
  const lakeCX = 22;
  const lakeCY = 19;
  const lakeRX = 11;
  const lakeRY = 7;

  // Fill the lake with water (tile 9, collision 1)
  // Use ellipse formula with noise for irregular shoreline
  const rng2 = seededRandom(999);
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const dx = (c - lakeCX) / lakeRX;
      const dy = (r - lakeCY) / lakeRY;
      const dist = dx * dx + dy * dy;
      const noise = (rng2() - 0.5) * 0.15;
      if (dist + noise < 0.85) {
        ground[r][c] = 10;   // water tile
        collision[r][c] = 1; // can't walk on water
      }
    }
  }

  // ── Small island in the lake ──
  // Island center at roughly (24, 20), radius ~2
  const islandCX = 24;
  const islandCY = 20;
  for (let r = islandCY - 2; r <= islandCY + 2; r++) {
    for (let c = islandCX - 2; c <= islandCX + 2; c++) {
      const dx = c - islandCX;
      const dy = r - islandCY;
      if (dx * dx + dy * dy <= 3) {
        ground[r][c] = 2;   // light grass
        collision[r][c] = 0; // walkable
      }
    }
  }

  // ── Sandy beach ring around the lake ──
  // Scan for water-edge tiles and replace adjacent land tiles with sand (tile 5)
  const rng3 = seededRandom(555);
  for (let r = 2; r < H - 2; r++) {
    for (let c = 2; c < W - 2; c++) {
      if (ground[r][c] === 10) continue; // skip water
      // Check if any neighbour is water
      let nearWater = false;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (r + dr >= 0 && r + dr < H && c + dc >= 0 && c + dc < W)
            if (ground[r + dr][c + dc] === 10) nearWater = true;
      if (nearWater) {
        ground[r][c] = 11; // sand (Beach_Tile.png texture)
      } else {
        // Second ring: sometimes sand, sometimes flower grass
        let nearSand = false;
        for (let dr = -2; dr <= 2; dr++)
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < H && nc >= 0 && nc < W && ground[nr][nc] === 10)
              nearSand = true;
          }
        if (nearSand && rng3() < 0.3) {
          ground[r][c] = 8; // flower grass near shore
        }
      }
    }
  }

  // ── Trees around perimeter ──
  const trees = [
    // Top border (skip exit 20-23) — min y=2 to prevent canopy clipping
    { x: 2, y: 2, v: 'pine_dark' },
    { x: 5, y: 2, v: 'oak_green' },
    { x: 9, y: 2, v: 'round_green' },
    { x: 13, y: 2, v: 'pine_med' },
    { x: 17, y: 2, v: 'oak_green' },
    // (exit gap 20-23)
    { x: 25, y: 2, v: 'round_dark' },
    { x: 29, y: 2, v: 'pine_dark' },
    { x: 33, y: 2, v: 'oak_green' },
    { x: 37, y: 2, v: 'pine_med' },
    { x: 41, y: 2, v: 'round_green' },

    // Bottom border
    { x: 1, y: 33, v: 'pine_dark2' },
    { x: 5, y: 34, v: 'oak_orange' },
    { x: 10, y: 33, v: 'round_green' },
    { x: 15, y: 34, v: 'pine_med' },
    { x: 20, y: 33, v: 'oak_green' },
    { x: 25, y: 34, v: 'round_dark' },
    { x: 30, y: 33, v: 'pine_dark' },
    { x: 35, y: 34, v: 'oak_yellow' },
    { x: 40, y: 33, v: 'pine_med2' },

    // Left border — dense trees (min x=2 to prevent clipping)
    { x: 2, y: 4, v: 'pine_dark' },
    { x: 2, y: 7, v: 'oak_green' },
    { x: 2, y: 10, v: 'round_green' },
    { x: 2, y: 13, v: 'pine_med' },
    { x: 2, y: 16, v: 'oak_green' },
    { x: 2, y: 19, v: 'round_dark' },
    { x: 2, y: 22, v: 'pine_dark' },
    { x: 2, y: 25, v: 'oak_red' },
    { x: 2, y: 28, v: 'round_green' },
    { x: 2, y: 31, v: 'pine_med' },
    // Extra left-side depth
    { x: 3, y: 5, v: 'round_green' },
    { x: 3, y: 11, v: 'pine_dark' },
    { x: 4, y: 17, v: 'oak_green' },
    { x: 3, y: 23, v: 'round_autumn' },
    { x: 4, y: 29, v: 'pine_med' },

    // Right border — dense trees (max x=41 to prevent clipping)
    { x: 41, y: 4, v: 'pine_dark' },
    { x: 41, y: 7, v: 'round_dark' },
    { x: 41, y: 10, v: 'oak_green' },
    { x: 41, y: 13, v: 'pine_med' },
    { x: 41, y: 16, v: 'round_green' },
    { x: 41, y: 19, v: 'oak_yellow' },
    { x: 41, y: 22, v: 'pine_dark' },
    { x: 41, y: 25, v: 'oak_green' },
    { x: 41, y: 28, v: 'round_dark' },
    { x: 41, y: 31, v: 'pine_med2' },
    // Extra right-side depth
    { x: 41, y: 6, v: 'oak_green' },
    { x: 40, y: 12, v: 'pine_dark' },
    { x: 41, y: 18, v: 'round_green' },
    { x: 40, y: 24, v: 'oak_orange' },
    { x: 41, y: 30, v: 'pine_med' },

    // A tree on the island
    { x: 24, y: 19, v: 'oak_yellow' },
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

    // ── Fishing spots along the shore ──
    { type: 'fishing_spot', x: 13, y: 15 },  // west shore
    { type: 'fishing_spot', x: 30, y: 15 },  // east shore
    { type: 'fishing_spot', x: 22, y: 27 },  // south shore

    // ── NPC marker for Liam ──
    { type: 'npc_marker', npcId: 'liam', x: 14, y: 14 },

    // ── Bonfire by the shore — for grilling fish ──
    { type: 'bonfire', x: 15, y: 14 },

    // ── Garden beds (wild gardens near west shore) ──
    { type: 'garden', x: 6, y: 10 },
    { type: 'garden', x: 8, y: 10 },
    { type: 'garden', x: 6, y: 12 },
    { type: 'garden', x: 8, y: 12 },

    // ── Wilted shore plants ──
    { type: 'wilted_plant', x: 12, y: 22 },
    { type: 'wilted_plant', x: 28, y: 13 },
    { type: 'wilted_plant', x: 18, y: 26 },
    { type: 'wilted_plant', x: 33, y: 21 },
    { type: 'wilted_plant', x: 10, y: 18 },

    // ── Earth resource collectibles ──
    { type: 'resource', resourceType: 'earth', x: 5, y: 8 },
    { type: 'resource', resourceType: 'earth', x: 37, y: 8 },
    { type: 'resource', resourceType: 'earth', x: 7, y: 28 },
    { type: 'resource', resourceType: 'earth', x: 35, y: 26 },
    { type: 'resource', resourceType: 'earth', x: 20, y: 30 },

    // ── Bushes along the shore ──
    { type: 'bush', x: 10, y: 11 },
    { type: 'bush', x: 33, y: 11 },
    { type: 'bush', x: 9, y: 24 },
    { type: 'bush', x: 34, y: 24 },
    { type: 'bush', x: 16, y: 28 },
    { type: 'bush', x: 28, y: 28 },

    // ── Flowers & reeds along the shore ──
    { type: 'flower', x: 11, y: 13 },
    { type: 'flower', x: 12, y: 16 },
    { type: 'flower', x: 10, y: 20 },
    { type: 'flower', x: 13, y: 23 },
    { type: 'flower', x: 15, y: 25 },
    { type: 'flower', x: 19, y: 27 },
    { type: 'flower', x: 25, y: 27 },
    { type: 'flower', x: 29, y: 25 },
    { type: 'flower', x: 31, y: 22 },
    { type: 'flower', x: 33, y: 18 },
    { type: 'flower', x: 32, y: 14 },
    { type: 'flower', x: 30, y: 12 },
    { type: 'flower', x: 17, y: 12 },
    { type: 'flower', x: 26, y: 12 },

    // Reeds (rendered as flowers, shore decorations)
    { type: 'flower', x: 11, y: 15 },
    { type: 'flower', x: 14, y: 24 },
    { type: 'flower', x: 20, y: 26 },
    { type: 'flower', x: 24, y: 26 },
    { type: 'flower', x: 30, y: 20 },
    { type: 'flower', x: 31, y: 16 },

    // ── Rocks near the water ──
    { type: 'rock', x: 12, y: 19 },
    { type: 'rock', x: 32, y: 17 },
    { type: 'rock', x: 21, y: 28 },
  ];

  // Station/bonfire collision
  collision[14][15] = 1; // bonfire

  // Open south border for exit to beach
  fillRect(collision, 20, H - 2, 4, 2, 0);
  fillRect(ground, 20, H - 2, 4, 2, 11); // sand path to beach

  const exits = [
    { id: 'north', x: 20, y: 0, w: 4, h: 2, target: 'hub', spawnX: 20, spawnY: 28 },
    { id: 'south', x: 20, y: H - 1, w: 4, h: 2, target: 'beach', spawnX: 26, spawnY: 14 },
  ];

  // ── Auto-tile water edges (smooth shoreline transitions) ──
  resolveAutoTiles(ground, 10, WATER_EDGES);

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 21, y: 4 },
    tileDefs: null,
  };
}
