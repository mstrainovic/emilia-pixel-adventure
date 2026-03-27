import { resolveAutoTiles, WATER_EDGES } from '../../utils/AutoTiler.js';

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
 * Simple value noise for organic sand patterns.
 * Returns values 0-1 based on grid position.
 */
function valueNoise(x, y, scale, rngSeed) {
  // Hash grid coordinates to get deterministic noise
  const ix = Math.floor(x / scale);
  const iy = Math.floor(y / scale);
  const fx = (x / scale) - ix;
  const fy = (y / scale) - iy;

  // Four corner values (deterministic from coordinates)
  function hash(cx, cy) {
    let h = seededRandom(rngSeed + cx * 374761393 + cy * 668265263);
    return h();
  }

  const v00 = hash(ix, iy);
  const v10 = hash(ix + 1, iy);
  const v01 = hash(ix, iy + 1);
  const v11 = hash(ix + 1, iy + 1);

  // Smooth interpolation (smoothstep)
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const top = v00 + (v10 - v00) * sx;
  const bot = v01 + (v11 - v01) * sx;
  return top + (bot - top) * sy;
}

/**
 * Der Strand — a sunny beach area with a pier, tide pools, and crabs.
 * Exit north leads to lake. Features shell gathering and fishing.
 */
export function generateBeachMap() {
  const ground = createGrid(W, H, 11);   // default: light sand (tile 11)
  const collision = createGrid(W, H, 0);

  // ── Rows 0-4: ocean water (tile 10, collision=1) ──
  for (let r = 0; r <= 4; r++)
    for (let c = 0; c < W; c++) {
      ground[r][c] = 10;
      collision[r][c] = 1;
    }

  // ── Rows 5-7: wet sand / surf zone with irregular shoreline ──
  // Use noise to make the water-sand boundary wavy (not a straight line)
  for (let c = 0; c < W; c++) {
    const waveOffset = Math.floor(valueNoise(c, 0, 6, 5555) * 2); // 0-1 row variation
    for (let r = 5; r <= 7 + waveOffset; r++) {
      if (r < H && r >= 0) {
        ground[r][c] = 12; // wet/dark sand
        collision[r][c] = 0;
      }
    }
  }

  // ── Main beach: organic sand variation using noise ──
  // Mix sand_light (11), sand_dark (12), sand_shells (13) naturally
  for (let r = 8; r < H; r++) {
    for (let c = 0; c < W; c++) {
      // Layer 1: large-scale sand color variation (scale 8)
      const n1 = valueNoise(c, r, 8, 1234);
      // Layer 2: medium detail (scale 4)
      const n2 = valueNoise(c, r, 4, 5678);
      // Layer 3: fine detail (scale 2)
      const n3 = valueNoise(c, r, 2, 9012);

      // Combine noise layers (octave mixing)
      const combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

      // Distance from water (rows 5-7) affects sand wetness
      const distFromWater = (r - 7) / (H - 7);

      // Near water: more dark/wet sand, further: more light sand with occasional shells
      if (distFromWater < 0.15) {
        // Transition zone: mostly wet sand with some light sand
        ground[r][c] = combined < 0.55 ? 12 : 11;
      } else if (distFromWater < 0.35) {
        // Mid beach: mix of light and dark sand
        if (combined < 0.3) ground[r][c] = 12;
        else if (combined < 0.85) ground[r][c] = 11;
        else ground[r][c] = 13;
      } else if (distFromWater < 0.7) {
        // Upper beach: mostly light sand with shell clusters
        if (combined < 0.1) ground[r][c] = 12;
        else if (combined < 0.75) ground[r][c] = 11;
        else ground[r][c] = 13;
      } else {
        // Back of beach near vegetation: more shells and dark patches
        if (combined < 0.15) ground[r][c] = 12;
        else if (combined < 0.6) ground[r][c] = 11;
        else if (combined < 0.85) ground[r][c] = 13;
        else ground[r][c] = 4; // dirt patches where vegetation starts
      }

      collision[r][c] = 0;
    }
  }

  // ── Left border: sand → dirt → grass transition (not stone!) ──
  for (let r = 0; r < H; r++) {
    const borderNoise = valueNoise(0, r, 5, 3333);
    const edgeWidth = 2 + Math.floor(borderNoise * 1.5); // 2-3 tiles wide

    // Outermost column: dark grass (collision boundary)
    if (r >= 5) { // Don't override ocean water
      ground[r][0] = 0;
      collision[r][0] = 1;

      // Second column: grass/dirt mix
      if (1 < W) {
        ground[r][1] = borderNoise < 0.5 ? 0 : 1;
        collision[r][1] = 1;
      }

      // Transition: dirt → sand
      if (2 < W) {
        ground[r][2] = borderNoise < 0.4 ? 4 : 5; // dirt variants
        collision[r][2] = 0;
      }

      // Soft sand transition
      if (edgeWidth >= 3 && 3 < W) {
        ground[r][3] = 12; // dark sand as transition
      }
    }
  }

  // ── Right border: sand → dirt → grass transition ──
  for (let r = 0; r < H; r++) {
    const borderNoise = valueNoise(W, r, 5, 4444);
    const edgeWidth = 2 + Math.floor(borderNoise * 1.5);

    if (r >= 5) {
      // Outermost column: dark grass (collision boundary)
      ground[r][W - 1] = 0;
      collision[r][W - 1] = 1;

      // Second from edge
      if (W - 2 >= 0) {
        ground[r][W - 2] = borderNoise < 0.5 ? 0 : 1;
        collision[r][W - 2] = 1;
      }

      // Dirt transition
      if (W - 3 >= 0) {
        ground[r][W - 3] = borderNoise < 0.4 ? 4 : 5;
        collision[r][W - 3] = 0;
      }

      // Soft sand transition
      if (edgeWidth >= 3 && W - 4 >= 0) {
        ground[r][W - 4] = 12;
      }
    }
  }

  // ── Bottom border: sand → dirt → grass transition ──
  for (let c = 0; c < W; c++) {
    const borderNoise = valueNoise(c, H, 5, 6666);

    // Last row: dark grass (collision)
    ground[H - 1][c] = 0;
    collision[H - 1][c] = 1;

    // Second to last: grass/dirt mix
    if (H - 2 >= 0) {
      ground[H - 2][c] = borderNoise < 0.5 ? 1 : 4;
      collision[H - 2][c] = 1;
    }

    // Dirt → dark sand transition
    if (H - 3 >= 0) {
      ground[H - 3][c] = borderNoise < 0.3 ? 5 : 12;
      collision[H - 3][c] = 0;
    }
  }

  // ── Ocean water in border areas (rows 0-4 override borders) ──
  for (let r = 0; r <= 4; r++)
    for (let c = 0; c < W; c++) {
      ground[r][c] = 10;
      collision[r][c] = 1;
    }

  // ── Pier at x=25-27, y=3-15 (tile 14, collision=0, overrides water) ──
  for (let r = 3; r <= 15; r++)
    for (let c = 25; c <= 27; c++) {
      ground[r][c] = 14;
      collision[r][c] = 0;
    }

  // ── North exit gap: pier tiles in exit zone, passable ──
  for (let r = 0; r <= 1; r++)
    for (let c = 25; c <= 29; c++) {
      ground[r][c] = 14;
      collision[r][c] = 0;
    }

  // ── Props ──
  const props = [];

  // 8 palm trees — spread across the sandy area, away from borders and pier
  const palmPositions = [
    { x: 6,  y: 10 },
    { x: 9,  y: 20 },
    { x: 13, y: 13 },
    { x: 18, y: 25 },
    { x: 22, y: 18 },
    { x: 33, y: 12 },
    { x: 40, y: 22 },
    { x: 46, y: 15 },
  ];
  for (const p of palmPositions) {
    props.push({ type: 'tree', variant: 'palm', x: p.x, y: p.y, w: 2, h: 3 });
    if (p.y >= 0 && p.y < H && p.x >= 0 && p.x < W) collision[p.y][p.x] = 1;
  }

  // ── Beach decoration props ──

  // Seashell decorations — scattered along the beach
  const shellDecoPositions = [
    { x: 7,  y: 9  },
    { x: 15, y: 10 },
    { x: 24, y: 11 },
    { x: 31, y: 9  },
    { x: 38, y: 10 },
    { x: 45, y: 11 },
    { x: 10, y: 16 },
    { x: 19, y: 14 },
    { x: 29, y: 17 },
    { x: 37, y: 15 },
    { x: 44, y: 13 },
    { x: 8,  y: 23 },
    { x: 20, y: 21 },
    { x: 36, y: 23 },
    { x: 47, y: 20 },
  ];
  for (const sd of shellDecoPositions) {
    props.push({ type: 'decoration', variant: 'seashell', x: sd.x, y: sd.y });
  }

  // Driftwood pieces — larger decorative elements
  const driftwoodPositions = [
    { x: 6,  y: 8  },
    { x: 16, y: 9  },
    { x: 35, y: 8  },
    { x: 43, y: 9  },
    { x: 11, y: 19 },
    { x: 30, y: 24 },
    { x: 42, y: 27 },
  ];
  for (const dw of driftwoodPositions) {
    props.push({ type: 'decoration', variant: 'driftwood', x: dw.x, y: dw.y });
  }

  // Beach rocks / pebble clusters
  const rockPositions = [
    { x: 5,  y: 12, size: 'large' },
    { x: 14, y: 8,  size: 'small' },
    { x: 21, y: 10, size: 'small' },
    { x: 32, y: 11, size: 'large' },
    { x: 41, y: 8,  size: 'small' },
    { x: 47, y: 18, size: 'large' },
    { x: 9,  y: 28, size: 'small' },
    { x: 28, y: 26, size: 'small' },
    { x: 39, y: 29, size: 'large' },
  ];
  for (const rk of rockPositions) {
    props.push({ type: 'decoration', variant: 'beach_rock', x: rk.x, y: rk.y, size: rk.size });
    if (rk.size === 'large' && rk.y >= 0 && rk.y < H && rk.x >= 0 && rk.x < W) {
      collision[rk.y][rk.x] = 1;
    }
  }

  // Starfish decorations — on wet sand near water
  const starfishPositions = [
    { x: 8,  y: 7 },
    { x: 18, y: 6 },
    { x: 30, y: 7 },
    { x: 39, y: 6 },
    { x: 47, y: 7 },
  ];
  for (const sf of starfishPositions) {
    props.push({ type: 'decoration', variant: 'starfish', x: sf.x, y: sf.y });
  }

  // Beach grass / vegetation near borders and upper beach
  const grassPositions = [
    { x: 5,  y: 29 },
    { x: 8,  y: 30 },
    { x: 12, y: 29 },
    { x: 16, y: 31 },
    { x: 21, y: 30 },
    { x: 28, y: 29 },
    { x: 34, y: 31 },
    { x: 39, y: 30 },
    { x: 44, y: 29 },
    { x: 48, y: 30 },
    // Near left edge
    { x: 4,  y: 14 },
    { x: 4,  y: 22 },
    // Near right edge
    { x: 49, y: 13 },
    { x: 49, y: 21 },
  ];
  for (const gp of grassPositions) {
    props.push({ type: 'decoration', variant: 'beach_grass', x: gp.x, y: gp.y });
  }

  // Tide line details — small foam/debris marks at waterline
  const tideLinePositions = [
    { x: 4,  y: 5 },
    { x: 10, y: 5 },
    { x: 16, y: 6 },
    { x: 22, y: 5 },
    { x: 32, y: 6 },
    { x: 37, y: 5 },
    { x: 44, y: 6 },
    { x: 49, y: 5 },
  ];
  for (const tl of tideLinePositions) {
    props.push({ type: 'decoration', variant: 'tide_foam', x: tl.x, y: tl.y });
  }

  // Sand castle — fun decorative element
  props.push({ type: 'decoration', variant: 'sandcastle', x: 15, y: 16 });
  props.push({ type: 'decoration', variant: 'sandcastle', x: 38, y: 18 });

  // Beach umbrella/towel spots — give life to the beach
  props.push({ type: 'decoration', variant: 'beach_umbrella', x: 10, y: 15 });
  props.push({ type: 'decoration', variant: 'beach_umbrella', x: 35, y: 14 });
  props.push({ type: 'decoration', variant: 'beach_umbrella', x: 44, y: 17 });

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

  // 1 lighthouse at x=50, y=8 (moved slightly inward from new border)
  props.push({ type: 'decoration', variant: 'lighthouse', x: 49, y: 8, w: 3, h: 4, collision: true });
  // Lighthouse collision
  for (let r = 8; r < 12 && r < H; r++)
    for (let c = 49; c < 52 && c < W; c++)
      collision[r][c] = 1;

  // 5 crab spawns — 3x crab_beach, 2x crab_coconut
  props.push({ type: 'mob_spawn', mobType: 'crab_beach',   x: 10, y: 12, respawnTime: 15 });
  props.push({ type: 'mob_spawn', mobType: 'crab_beach',   x: 30, y: 20, respawnTime: 15 });
  props.push({ type: 'mob_spawn', mobType: 'crab_beach',   x: 44, y: 25, respawnTime: 15 });
  props.push({ type: 'mob_spawn', mobType: 'crab_coconut', x: 16, y: 28, respawnTime: 20 });
  props.push({ type: 'mob_spawn', mobType: 'crab_coconut', x: 38, y: 30, respawnTime: 20 });

  // Shell resource nodes — each unique type appears once, fast respawn for kid-friendly gameplay
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'shell_common',    x: 7,  y: 14, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'shell_common',    x: 35, y: 16, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'sand_dollar',     x: 15, y: 18, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'sand_dollar',     x: 43, y: 19, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'starfish_shell',  x: 20, y: 22, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'starfish_shell',  x: 32, y: 27, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'coral_piece',     x: 11, y: 26, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'coral_piece',     x: 48, y: 24, hitsNeeded: 1, respawnTime: 30 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'pearl',           x: 26, y: 20, hitsNeeded: 1, respawnTime: 45 });
  props.push({ type: 'resource', resourceType: 'shell', itemId: 'rainbow_shell',   x: 40, y: 28, hitsNeeded: 1, respawnTime: 60 });

  // Boss arena marker — Coconut King
  props.push({ type: 'boss_spawn', bossType: 'coconut_king', x: 25, y: 10 });

  // ── Exits ──
  const exits = [
    { id: 'north', x: 24, y: 5, w: 6, h: 2, target: 'lake', spawnX: 21, spawnY: 33 },
  ];

  // ── Auto-tile water edges (smooth ocean-sand transitions) ──
  resolveAutoTiles(ground, 10, WATER_EDGES);

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 26, y: 14 },
    tileDefs: null,
  };
}
