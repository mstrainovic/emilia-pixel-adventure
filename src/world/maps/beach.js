const W = 55;
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
 * Der Strand — a sunny beach area with a pier, tide pools, and crabs.
 * Exit north leads to lake. Features shell gathering and fishing.
 */
export function generateBeachMap() {
  const rng = seededRandom(4242);
  const ground = createGrid(W, H, 11);   // default: light sand (tile 11)
  const collision = createGrid(W, H, 0);

  // ── Rows 0-4: ocean water (tile 10, collision=1) ──
  for (let r = 0; r <= 4; r++)
    for (let c = 0; c < W; c++) {
      ground[r][c] = 10;
      collision[r][c] = 1;
    }

  // ── Rows 5-7: wet sand / surf zone (tile 12, collision=0) ──
  for (let r = 5; r <= 7; r++)
    for (let c = 0; c < W; c++) {
      ground[r][c] = 12;
      collision[r][c] = 0;
    }

  // ── Rows 8-30: light sand (tile 11) with ~15% shell scatter (tile 13) ──
  const rng2 = seededRandom(7878);
  for (let r = 8; r <= 30; r++)
    for (let c = 0; c < W; c++) {
      ground[r][c] = rng2() < 0.15 ? 13 : 11;
      collision[r][c] = 0;
    }

  // ── Rows 31-34: light sand continuation ──
  for (let r = 31; r < H; r++)
    for (let c = 0; c < W; c++) {
      ground[r][c] = 11;
      collision[r][c] = 0;
    }

  // ── Left/right stone cliffs (tile 9, collision=1) ──
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < 3; c++) {
      ground[r][c] = 9;
      collision[r][c] = 1;
    }
    for (let c = 52; c < W; c++) {
      ground[r][c] = 9;
      collision[r][c] = 1;
    }
  }

  // ── Pier at x=25-27, y=3-15 (tile 14, collision=0, overrides water) ──
  for (let r = 3; r <= 15; r++)
    for (let c = 25; c <= 27; c++) {
      ground[r][c] = 14;
      collision[r][c] = 0;
    }

  // ── North exit gap: keep pier tiles in exit zone, clear cliff collision ──
  // Exit at x=25, y=0, w=5, h=2 — ensure passable (pier already clears it)
  for (let r = 0; r <= 1; r++)
    for (let c = 25; c <= 29; c++) {
      ground[r][c] = 14;
      collision[r][c] = 0;
    }

  // ── Props ──
  const props = [];

  // 8 palm trees — spread across the sandy area, away from cliffs and pier
  const palmPositions = [
    { x: 5,  y: 10 },
    { x: 8,  y: 20 },
    { x: 12, y: 13 },
    { x: 18, y: 25 },
    { x: 22, y: 18 },
    { x: 33, y: 12 },
    { x: 40, y: 22 },
    { x: 46, y: 15 },
  ];
  for (const p of palmPositions) {
    props.push({ type: 'tree', variant: 'palm', x: p.x, y: p.y, w: 2, h: 3 });
    // Palm trunk collision
    if (p.y >= 0 && p.y < H && p.x >= 0 && p.x < W) collision[p.y][p.x] = 1;
  }

  // 6 tide pools — on wet sand (rows 5-7) and lower beach
  const tidePools = [
    { x: 5,  y: 6 },
    { x: 14, y: 5 },
    { x: 20, y: 7 },
    { x: 34, y: 6 },
    { x: 42, y: 5 },
    { x: 48, y: 7 },
  ];
  for (const tp of tidePools) {
    props.push({ type: 'shell_spawn', x: tp.x, y: tp.y, w: 2, h: 1 });
  }

  // 3 fishing spots — pier end + 2 tide pool areas
  props.push({ type: 'fishing_spot', x: 26, y: 15, w: 1, h: 1 }); // pier end
  props.push({ type: 'fishing_spot', x: 14, y: 5,  w: 1, h: 1 }); // tide pool
  props.push({ type: 'fishing_spot', x: 42, y: 5,  w: 1, h: 1 }); // tide pool

  // 1 lighthouse at x=50, y=8
  props.push({ type: 'decoration', variant: 'lighthouse', x: 50, y: 8, w: 3, h: 4, collision: true });
  // Lighthouse collision
  for (let r = 8; r < 12 && r < H; r++)
    for (let c = 50; c < 53 && c < W; c++)
      collision[r][c] = 1;

  // 5 crab spawns — 3x crab_beach, 2x crab_coconut
  props.push({ type: 'mob_spawn', mobType: 'crab_beach',   x: 10, y: 12, respawnTime: 15 });
  props.push({ type: 'mob_spawn', mobType: 'crab_beach',   x: 30, y: 20, respawnTime: 15 });
  props.push({ type: 'mob_spawn', mobType: 'crab_beach',   x: 44, y: 25, respawnTime: 15 });
  props.push({ type: 'mob_spawn', mobType: 'crab_coconut', x: 16, y: 28, respawnTime: 20 });
  props.push({ type: 'mob_spawn', mobType: 'crab_coconut', x: 38, y: 30, respawnTime: 20 });

  // 8 shell resource nodes — shell_common x2, sand_dollar x2, starfish_shell x2, coral_piece x2
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'shell_common',    x: 7,  y: 14, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'shell_common',    x: 35, y: 16, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'sand_dollar',     x: 15, y: 18, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'sand_dollar',     x: 43, y: 19, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'starfish_shell',  x: 20, y: 22, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'starfish_shell',  x: 32, y: 27, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'coral_piece',     x: 11, y: 26, hitsNeeded: 1, respawnTime: 480 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'coral_piece',     x: 48, y: 24, hitsNeeded: 1, respawnTime: 480 });

  // Boss arena marker — Coconut King
  props.push({ type: 'boss_spawn', bossType: 'coconut_king', x: 25, y: 10 });

  // ── Exits ──
  const exits = [
    { id: 'north', x: 24, y: 5, w: 6, h: 2, target: 'lake', spawnX: 21, spawnY: 33 },
  ];

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 26, y: 10 },
    tileDefs: null,
  };
}
