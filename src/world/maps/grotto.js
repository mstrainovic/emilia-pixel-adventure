const W = 45;
const H = 40;

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
 * The Underwater Grotto — a hidden sea cave with 4 distinct zones.
 * Exit west leads back to dungeon. Features gem mining, sick corals,
 * jellyfish, and a secret treasure chamber.
 *
 * Zone layout (45×40):
 *   Coral Reef     x:0-14,  y:0-11   — entrance area, sandy floor
 *   Sunken Ruins   x:15-34, y:0-14   — stone floor, treasure chests
 *   Jellyfish Pass x:35-44, y:5-24   — narrow corridor, glowing algae
 *   Treasure Chmb  x:15-29, y:25-34  — sandy secret area, reward chests
 */
export function generateGrottoMap() {
  const rng = seededRandom(5577);

  // Start with everything as dark underwater walls (tile 15, collision=1)
  const ground    = createGrid(W, H, 15);
  const collision = createGrid(W, H, 1);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function carveFloor(x, y, w, h, tileId) {
    fillRect(ground,    x, y, w, h, tileId);
    fillRect(collision, x, y, w, h, 0);
  }

  function carveCorridor(x1, y1, x2, y2, width) {
    const bw = width || 2;
    if (x1 === x2) {
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      fillRect(ground,    x1, minY, bw, maxY - minY + 1, 16);
      fillRect(collision, x1, minY, bw, maxY - minY + 1, 0);
    } else if (y1 === y2) {
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      fillRect(ground,    minX, y1, maxX - minX + bw, bw, 16);
      fillRect(collision, minX, y1, maxX - minX + bw, bw, 0);
    }
  }

  // ── ZONE 1: Coral Reef (x:0-14, y:0-11) ─────────────────────────────────
  // Main reef floor — tile 16 (underwater_blue) with sandy patches (tile 18)
  carveFloor(1, 1, 13, 10, 16);

  // Sandy patches scattered through reef
  const rng2 = seededRandom(1122);
  for (let r = 1; r <= 10; r++)
    for (let c = 1; c <= 13; c++)
      if (ground[r][c] === 16 && rng2() < 0.25)
        ground[r][c] = 18; // underwater_sand variation

  // Deep water pit in reef corner (impassable, tile 10)
  fillRect(ground,    4, 8, 3, 2, 10);
  fillRect(collision, 4, 8, 3, 2, 1);

  // ── ZONE 2: Sunken Ruins (x:15-34, y:0-14) ───────────────────────────────
  // Main ruins floor — tile 16/17 (underwater_blue / underwater_moss)
  carveFloor(15, 1, 19, 13, 16);

  // Moss variation (tile 17) scattered across ruins
  const rng3 = seededRandom(3344);
  for (let r = 1; r <= 13; r++)
    for (let c = 15; c <= 33; c++)
      if (ground[r][c] === 16 && rng3() < 0.20)
        ground[r][c] = 17; // underwater_moss patches

  // Interior collapsed wall dividing ruins (with gap doorway)
  // Vertical partial wall at x=23, y=2-6 — doorway at y=4-5
  for (let r = 2; r <= 6; r++) {
    if (r < 4 || r > 5) {
      ground[r][23]    = 15;
      collision[r][23] = 1;
    }
  }
  // Horizontal partial wall at y=8, x=16-22 — doorway at x=19-20
  for (let c = 16; c <= 22; c++) {
    if (c < 19 || c > 20) {
      ground[8][c]    = 15;
      collision[8][c] = 1;
    }
  }

  // Deep water pit inside ruins (impassable)
  fillRect(ground,    18, 3, 3, 3, 10);
  fillRect(collision, 18, 3, 3, 3, 1);

  // ── ZONE 3: Jellyfish Passage (x:35-44, y:5-24) ───────────────────────────
  // Narrow vertical corridor, tile 16 floor
  carveFloor(35, 5, 8, 20, 16);

  // Narrow choke-point walls inside passage (leave 3-wide walkable)
  // Add some alcove bumps for variety
  fillRect(ground,    42, 9,  2, 2, 15);
  fillRect(collision, 42, 9,  2, 2, 1);
  fillRect(ground,    35, 14, 2, 2, 15);
  fillRect(collision, 35, 14, 2, 2, 1);
  fillRect(ground,    42, 19, 2, 2, 15);
  fillRect(collision, 42, 19, 2, 2, 1);

  // Glowing algae cluster floor (tile 17) in mid-passage
  for (let r = 11; r <= 17; r++)
    for (let c = 37; c <= 41; c++)
      if (ground[r][c] === 16 && rng() < 0.35)
        ground[r][c] = 17;

  // ── ZONE 4: Treasure Chamber (x:15-29, y:25-34) ───────────────────────────
  // Sandy secret floor (tile 18)
  carveFloor(15, 25, 15, 9, 18);

  // A few blue floor tiles mixed in
  const rng4 = seededRandom(6688);
  for (let r = 25; r <= 33; r++)
    for (let c = 15; c <= 29; c++)
      if (ground[r][c] === 18 && rng4() < 0.15)
        ground[r][c] = 16;

  // Small deep pit in treasure chamber corner
  fillRect(ground,    27, 31, 2, 2, 10);
  fillRect(collision, 27, 31, 2, 2, 1);

  // ── CONNECTING CORRIDORS ─────────────────────────────────────────────────

  // Reef ↔ Ruins: horizontal corridor at y=5-6 (rows 5-6, cols 13-15)
  carveCorridor(13, 5, 15, 5, 2);

  // Ruins ↔ Jellyfish Passage: horizontal corridor at y=9-10 (cols 33-35)
  carveCorridor(33, 9, 36, 9, 2);

  // Ruins ↔ Treasure Chamber: vertical corridor at x=22-23, y=13-25
  carveCorridor(22, 13, 22, 25, 2);

  // ── WEST EXIT gap to dungeon (rows 4-6, cols 0-1) ────────────────────────
  fillRect(ground,    0, 4, 2, 3, 16);
  fillRect(collision, 0, 4, 2, 3, 0);

  // ── MAP BORDER: ensure outer edges are always wall ───────────────────────
  // Top and bottom rows
  for (let c = 0; c < W; c++) {
    ground[0][c]     = 15; collision[0][c]     = 1;
    ground[H-1][c]   = 15; collision[H-1][c]   = 1;
  }
  // Left and right columns (except west exit gap)
  for (let r = 0; r < H; r++) {
    ground[r][W-1]   = 15; collision[r][W-1]   = 1;
    if (r < 4 || r > 6) {
      ground[r][0]   = 15; collision[r][0]     = 1;
    }
  }

  // ── PROPS ─────────────────────────────────────────────────────────────────
  const props = [];

  // --- Zone markers (invisible, quest tracking) ---
  props.push({ type: 'zone_marker', zoneId: 'reef',     x: 7,  y: 6  });
  props.push({ type: 'zone_marker', zoneId: 'ruins',    x: 25, y: 7  });
  props.push({ type: 'zone_marker', zoneId: 'passage',  x: 39, y: 15 });
  props.push({ type: 'zone_marker', zoneId: 'treasure', x: 22, y: 30 });

  // --- Coral Reef decorations ---
  props.push({ type: 'coral_deco', x: 2,  y: 2  });
  props.push({ type: 'coral_deco', x: 5,  y: 3  });
  props.push({ type: 'coral_deco', x: 10, y: 2  });
  props.push({ type: 'coral_deco', x: 12, y: 5  });
  props.push({ type: 'coral_deco', x: 3,  y: 7  });
  props.push({ type: 'coral_deco', x: 8,  y: 9  });
  props.push({ type: 'coral_deco', x: 11, y: 8  });

  // --- Sick corals (wilted_plant variant, for PlantHealing system) ---
  props.push({ type: 'wilted_plant', variant: 'coral', x: 4,  y: 3,  id: 'coral_sick1' });
  props.push({ type: 'wilted_plant', variant: 'coral', x: 9,  y: 5,  id: 'coral_sick2' });
  props.push({ type: 'wilted_plant', variant: 'coral', x: 6,  y: 9,  id: 'coral_sick3' });
  props.push({ type: 'wilted_plant', variant: 'coral', x: 13, y: 3,  id: 'coral_sick4' });
  props.push({ type: 'wilted_plant', variant: 'coral', x: 2,  y: 9,  id: 'coral_sick5' });

  // --- Fishing spots (reef area, near water tiles) ---
  props.push({ type: 'fishing_spot', x: 4,  y: 7  });
  props.push({ type: 'fishing_spot', x: 7,  y: 8  });
  props.push({ type: 'fishing_spot', x: 3,  y: 5  });

  // --- Sunken Ruins props: stone walls, treasure chests ---
  props.push({ type: 'decoration', variant: 'stone_wall', x: 16, y: 2,  w: 2, h: 2, collision: true });
  props.push({ type: 'decoration', variant: 'stone_wall', x: 30, y: 2,  w: 2, h: 2, collision: true });
  props.push({ type: 'decoration', variant: 'stone_wall', x: 33, y: 9,  w: 2, h: 2, collision: true });
  props.push({ type: 'decoration', variant: 'stone_wall', x: 16, y: 11, w: 2, h: 2, collision: true });

  // Ruins collision for stone_wall decorations
  collision[2][16] = 1; collision[2][17] = 1;
  collision[3][16] = 1; collision[3][17] = 1;
  collision[2][30] = 1; collision[2][31] = 1;
  collision[3][30] = 1; collision[3][31] = 1;
  collision[9][33]  = 1; collision[9][34]  = 1;
  collision[10][33] = 1; collision[10][34] = 1;
  collision[11][16] = 1; collision[11][17] = 1;
  collision[12][16] = 1; collision[12][17] = 1;

  // Treasure chests in ruins
  props.push({ type: 'chest', x: 25, y: 4,  id: 'chest_ruins1', loot: 'coins' });
  props.push({ type: 'chest', x: 32, y: 11, id: 'chest_ruins2', loot: 'gems'  });

  // --- Jellyfish Passage: glowing algae ---
  props.push({ type: 'glow_plant', x: 36, y: 7  });
  props.push({ type: 'glow_plant', x: 40, y: 8  });
  props.push({ type: 'glow_plant', x: 37, y: 12 });
  props.push({ type: 'glow_plant', x: 41, y: 13 });
  props.push({ type: 'glow_plant', x: 36, y: 17 });
  props.push({ type: 'glow_plant', x: 39, y: 20 });
  props.push({ type: 'glow_plant', x: 37, y: 23 });

  // --- Treasure Chamber: reward chests and decor ---
  props.push({ type: 'chest', x: 17, y: 27, id: 'chest_treasure1', loot: 'rare_gems' });
  props.push({ type: 'chest', x: 26, y: 28, id: 'chest_treasure2', loot: 'equipment' });
  props.push({ type: 'coral_deco', x: 20, y: 26 });
  props.push({ type: 'coral_deco', x: 24, y: 32 });

  // --- Gem resource nodes (3 nodes: 1 sapphire, 1 ruby, 1 emerald) ---
  props.push({ type: 'resource', resourceType: 'gem', itemId: 'sapphire', x: 29, y: 5,  id: 'gem_sapphire', hitsNeeded: 3, respawnTime: 600 });
  props.push({ type: 'resource', resourceType: 'gem', itemId: 'ruby',     x: 20, y: 12, id: 'gem_ruby',     hitsNeeded: 3, respawnTime: 600 });
  props.push({ type: 'resource', resourceType: 'gem', itemId: 'emerald',  x: 28, y: 29, id: 'gem_emerald',  hitsNeeded: 3, respawnTime: 600 });

  // --- Mob spawns ---

  // Jellyfish in reef (3 spawns)
  props.push({ type: 'mob_spawn', mobType: 'jellyfish_glow', x: 6,  y: 4,  id: 'jelly1', respawnTime: 20 });
  props.push({ type: 'mob_spawn', mobType: 'jellyfish_glow', x: 11, y: 7,  id: 'jelly2', respawnTime: 20 });
  props.push({ type: 'mob_spawn', mobType: 'jellyfish_glow', x: 3,  y: 10, id: 'jelly3', respawnTime: 20 });

  // Jellyfish in passage (2 spawns)
  props.push({ type: 'mob_spawn', mobType: 'jellyfish_glow', x: 38, y: 10, id: 'jelly4', respawnTime: 20 });
  props.push({ type: 'mob_spawn', mobType: 'jellyfish_glow', x: 40, y: 21, id: 'jelly5', respawnTime: 20 });

  // Octopus in ruins (3 spawns)
  props.push({ type: 'mob_spawn', mobType: 'octopus', x: 19, y: 5,  id: 'octo1', respawnTime: 30 });
  props.push({ type: 'mob_spawn', mobType: 'octopus', x: 27, y: 10, id: 'octo2', respawnTime: 30 });
  props.push({ type: 'mob_spawn', mobType: 'octopus', x: 32, y: 4,  id: 'octo3', respawnTime: 30 });

  // Ghost Crab in treasure chamber (2 spawns)
  props.push({ type: 'mob_spawn', mobType: 'ghost_crab', x: 21, y: 27, id: 'gcrab1', respawnTime: 35 });
  props.push({ type: 'mob_spawn', mobType: 'ghost_crab', x: 24, y: 32, id: 'gcrab2', respawnTime: 35 });

  // Boss arena marker — Leviathan
  props.push({ type: 'boss_spawn', bossType: 'leviathan', x: 22, y: 28 });

  // ── Exits ──────────────────────────────────────────────────────────────────
  const exits = [
    { id: 'west', x: 0, y: 4, w: 2, h: 3, target: 'dungeon', spawnX: 33, spawnY: 14 },
  ];

  return {
    width:  W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 2, y: 5 },
    tileDefs: null,
  };
}
