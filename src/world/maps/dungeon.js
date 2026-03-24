import { TREE_VARIANTS } from './hub.js';

const W = 35;
const H = 30;

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

export function generateDungeonMap() {
  const rng = seededRandom(9999);

  // Start with everything as dark walls (tile 0) with full collision
  const ground = createGrid(W, H, 0);
  const collision = createGrid(W, H, 1);

  // ── Helper to carve a room (stone floor, no collision) ──
  function carveRoom(x, y, w, h) {
    fillRect(ground, x, y, w, h, 9);
    fillRect(collision, x, y, w, h, 0);
  }

  // ── Helper to carve a corridor ──
  function carveCorridor(x1, y1, x2, y2, width) {
    const w = width || 2;
    if (x1 === x2) {
      // Vertical corridor
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      fillRect(ground, x1, minY, w, maxY - minY + 1, 9);
      fillRect(collision, x1, minY, w, maxY - minY + 1, 0);
    } else if (y1 === y2) {
      // Horizontal corridor
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      fillRect(ground, minX, y1, maxX - minX + w, w, 9);
      fillRect(collision, minX, y1, maxX - minX + w, w, 0);
    }
  }

  // ══════════════════════════════════════════
  //  ROOM LAYOUT
  // ══════════════════════════════════════════
  //
  //  ┌─────────────────────────────────────┐
  //  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░ Treasure ░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░ Room     ░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│ N. Corridor ░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░ Pool ░░░░░░░░░░░ │
  //  │  ░────┘░░░░░░░░░░ Room ░░░░░░░░░░░ │
  //  │  Entry Hall ──────────────────░░░░░ │
  //  │  ░────┐░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│ S. Corridor ░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░│░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░ Large  ░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░ Cavern ░░░░░░░░░░░░░░░░░░░░░░ │
  //  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
  //  └─────────────────────────────────────┘

  // 1. Entry Hall (west side, where player enters from hub)
  carveRoom(2, 11, 10, 6);

  // 2. North corridor (from entry hall going up)
  carveCorridor(8, 5, 8, 12, 2);

  // 3. Treasure Room (top-center)
  carveRoom(5, 2, 8, 4);

  // 4. South corridor (from entry hall going down)
  carveCorridor(8, 16, 8, 22, 2);

  // 5. Large Cavern (bottom area)
  carveRoom(4, 21, 14, 7);

  // 6. Pool Room (right side, connected to entry hall)
  carveRoom(20, 9, 10, 6);

  // 7. Corridor from entry hall to pool room
  carveCorridor(11, 13, 20, 13, 2);

  // 8. Small alcove off the large cavern (east side)
  carveRoom(17, 23, 6, 4);
  carveCorridor(16, 23, 18, 23, 3); // wide connection to cavern

  // 9. Crystal chamber (northeast, connected to pool room)
  carveRoom(24, 3, 7, 5);
  carveCorridor(27, 7, 27, 9, 2);

  // ── West exit to hub (left side, rows 13-16) ──
  fillRect(ground, 0, 13, 3, 4, 9);
  fillRect(collision, 0, 13, 3, 4, 0);

  // ── Add some ground variation inside rooms ──
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      if (ground[r][c] === 9 && collision[r][c] === 0) {
        // Very subtle stone floor variation — keep nearly all as 9
        const v = rng();
        if (v < 0.02) ground[r][c] = 5; // rare dark dirt patches
      }
    }

  // ── Underground pool in pool room (tile 9 stays, but mark with props) ──
  // The pool itself — make the center tiles collision
  fillRect(ground, 22, 11, 5, 3, 9);
  fillRect(collision, 23, 12, 3, 1, 1); // deep center of pool is impassable

  // ── Props ──
  const props = [
    // ══════════════════════════════════
    //  TORCHES along corridors and rooms
    // ══════════════════════════════════
    // Entry hall
    { type: 'torch', x: 3, y: 11 },
    { type: 'torch', x: 10, y: 11 },
    { type: 'torch', x: 3, y: 16 },
    { type: 'torch', x: 10, y: 16 },

    // North corridor
    { type: 'torch', x: 7, y: 6 },
    { type: 'torch', x: 10, y: 8 },

    // Treasure room
    { type: 'torch', x: 5, y: 2 },
    { type: 'torch', x: 12, y: 2 },

    // South corridor
    { type: 'torch', x: 7, y: 18 },
    { type: 'torch', x: 10, y: 20 },

    // Large cavern
    { type: 'torch', x: 4, y: 21 },
    { type: 'torch', x: 17, y: 21 },
    { type: 'torch', x: 4, y: 27 },
    { type: 'torch', x: 17, y: 27 },
    { type: 'torch', x: 10, y: 24 },

    // Pool room
    { type: 'torch', x: 20, y: 9 },
    { type: 'torch', x: 29, y: 9 },
    { type: 'torch', x: 20, y: 14 },
    { type: 'torch', x: 29, y: 14 },

    // Corridor to pool room
    { type: 'torch', x: 15, y: 12 },

    // Crystal chamber
    { type: 'torch', x: 24, y: 3 },
    { type: 'torch', x: 30, y: 3 },

    // Alcove
    { type: 'torch', x: 17, y: 23 },

    // ══════════════════════════════════
    //  CRYSTAL formations
    // ══════════════════════════════════
    // Crystal chamber — main cluster
    { type: 'crystal', x: 26, y: 4, id: 'crystal1' },
    { type: 'crystal', x: 28, y: 4, id: 'crystal2' },
    { type: 'crystal', x: 27, y: 5, id: 'crystal3' },
    { type: 'crystal', x: 25, y: 6, id: 'crystal4' },
    { type: 'crystal', x: 29, y: 6, id: 'crystal5' },

    // Scattered crystals in other rooms
    { type: 'crystal', x: 16, y: 24, id: 'crystal6' },
    { type: 'crystal', x: 6, y: 3, id: 'crystal7' },
    { type: 'crystal', x: 28, y: 12, id: 'crystal8' },

    // ══════════════════════════════════
    //  UNDERGROUND POOL props
    // ══════════════════════════════════
    { type: 'rock', x: 22, y: 10 },
    { type: 'rock', x: 26, y: 13 },
    { type: 'rock', x: 21, y: 13 },

    // ══════════════════════════════════
    //  MOB SPAWNS
    // ══════════════════════════════════
    // Entry hall area — weaker skeletons
    { type: 'mob_spawn', mobType: 'skeleton_base', x: 5, y: 13, id: 'skel1' },
    { type: 'mob_spawn', mobType: 'skeleton_base', x: 9, y: 15, id: 'skel2' },

    // North corridor / treasure room — medium
    { type: 'mob_spawn', mobType: 'skeleton_base', x: 8, y: 7, id: 'skel3' },
    { type: 'mob_spawn', mobType: 'skeleton_warrior', x: 9, y: 3, id: 'skel4' },

    // Large cavern — tougher
    { type: 'mob_spawn', mobType: 'skeleton_warrior', x: 10, y: 23, id: 'skel5' },
    { type: 'mob_spawn', mobType: 'skeleton_mage', x: 14, y: 25, id: 'skel6' },

    // Pool room
    { type: 'mob_spawn', mobType: 'skeleton_base', x: 24, y: 11, id: 'skel7' },

    // ══════════════════════════════════
    //  RESOURCE NODES
    // ══════════════════════════════════
    // Ore veins (along walls)
    { type: 'resource', resourceType: 'ore', x: 4, y: 22, id: 'ore1' },
    { type: 'resource', resourceType: 'ore', x: 16, y: 22, id: 'ore2' },
    { type: 'resource', resourceType: 'ore', x: 7, y: 5, id: 'ore3' },
    { type: 'resource', resourceType: 'ore', x: 20, y: 25, id: 'ore4' },
    { type: 'resource', resourceType: 'ore', x: 30, y: 7, id: 'ore5' },

    // Rare mushrooms (in dark corners)
    { type: 'resource', resourceType: 'mushroom', x: 5, y: 26, id: 'dmush1' },
    { type: 'resource', resourceType: 'mushroom', x: 12, y: 4, id: 'dmush2' },
    { type: 'resource', resourceType: 'mushroom', x: 21, y: 24, id: 'dmush3' },

    // Crystals as resources (harvestable)
    { type: 'resource', resourceType: 'crystal', x: 19, y: 23, id: 'rcrystal1' },
    { type: 'resource', resourceType: 'crystal', x: 29, y: 10, id: 'rcrystal2' },

    // ══════════════════════════════════
    //  WILTED CAVE MUSHROOMS
    // ══════════════════════════════════
    { type: 'wilted_plant', x: 6, y: 14, id: 'cwilt1' },
    { type: 'wilted_plant', x: 15, y: 23, id: 'cwilt2' },
    { type: 'wilted_plant', x: 8, y: 24, id: 'cwilt3' },
    { type: 'wilted_plant', x: 25, y: 13, id: 'cwilt4' },

    // ══════════════════════════════════
    //  DECORATIVE ROCKS (wall debris)
    // ══════════════════════════════════
    { type: 'rock', x: 6, y: 5 },
    { type: 'rock', x: 11, y: 3 },
    { type: 'rock', x: 5, y: 27 },
    { type: 'rock', x: 16, y: 27 },
    { type: 'rock', x: 9, y: 21 },
    { type: 'rock', x: 19, y: 26 },

    // Treasure room loot indicator
    { type: 'rock', x: 7, y: 2 },
    { type: 'rock', x: 10, y: 2 },
  ];

  // Add collision only for crystal formations (large obstacles), not rocks (small debris)
  for (const p of props) {
    if (p.type === 'crystal') {
      if (p.y >= 0 && p.y < H && p.x >= 0 && p.x < W) {
        collision[p.y][p.x] = 1;
      }
    }
  }

  // ── East exit to grotto (right side, rows 13-16) ──
  fillRect(ground, W - 2, 13, 2, 4, 9);
  fillRect(collision, W - 2, 13, 2, 4, 0);

  // ── Exits ──
  const exits = [
    // West exit back to hub
    { id: 'west', x: 0, y: 13, w: 2, h: 4, target: 'hub', spawnX: 37, spawnY: 15 },
    // East exit to grotto
    { id: 'east', x: W - 2, y: 13, w: 2, h: 4, target: 'grotto', spawnX: 2, spawnY: 5 },
  ];

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 4, y: 14 },
    tileDefs: null,
  };
}
