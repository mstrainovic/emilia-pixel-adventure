const W = 50;
const H = 45;

function createGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function fillRect(grid, x, y, w, h, val) {
  for (let r = y; r < y + h && r < grid.length; r++)
    for (let c = x; c < x + w && c < grid[0].length; c++)
      if (r >= 0 && c >= 0) grid[r][c] = val;
}

/**
 * The Cloud Castle — ethereal sky fortress with 4 zones.
 * Tiles: 9=stone, 19=cloud_white, 20=cloud_pink, 21=cloud_gold, 22=crystal_floor
 * Background tile (void/sky): -1 (collision=1, not walkable)
 *
 * Zone layout (50x45):
 *   Cloud Garden     x:5-24,  y:25-39  — entrance courtyard, gold paths, flower beds
 *   Crystal Halls    x:25-39, y:15-34  — crystal colonnade hall with pillar rows
 *   Throne Room      x:10-24, y:5-19   — walled boss arena (Shadow Knight), stone walls
 *   Star Terrace     x:30-44, y:0-9    — panorama plaza with golden star
 *
 * Exit: South center (y=44) → unicorn_meadow
 */
export function generateCloudCastleMap() {
  // Start with sky void (no tile, collision=1)
  const ground    = createGrid(W, H, -1);
  const collision = createGrid(W, H, 1);

  function carveFloor(x, y, w, h, tileId) {
    fillRect(ground,    x, y, w, h, tileId);
    fillRect(collision, x, y, w, h, 0);
  }

  // Walkable decorative rim (ground only — stays walkable)
  function rimRect(x, y, w, h, tileId) {
    fillRect(ground, x, y, w, 1, tileId);
    fillRect(ground, x, y + h - 1, w, 1, tileId);
    fillRect(ground, x, y, 1, h, tileId);
    fillRect(ground, x + w - 1, y, 1, h, tileId);
  }

  // Diamond plaza |dx|+|dy| <= r (ground only, area must already be walkable)
  function diamond(cx, cy, r, tileId) {
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > r) continue;
        const x = cx + dx, y = cy + dy;
        if (y >= 0 && y < H && x >= 0 && x < W) ground[y][x] = tileId;
      }
  }

  function carveCorridor(x1, y1, x2, y2, width, tileId) {
    const bw = width || 2;
    const tile = tileId || 22;
    if (x1 === x2) {
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      fillRect(ground,    x1, minY, bw, maxY - minY + 1, tile);
      fillRect(collision, x1, minY, bw, maxY - minY + 1, 0);
    } else if (y1 === y2) {
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      fillRect(ground,    minX, y1, maxX - minX + bw, bw, tile);
      fillRect(collision, minX, y1, maxX - minX + bw, bw, 0);
    }
  }

  // Solid stone wall cell
  function wall(x, y) {
    ground[y][x] = 9;
    collision[y][x] = 1;
  }

  // ── ZONE 1: Cloud Garden (x:5-24, y:25-39) — entrance courtyard ──────
  carveFloor(5, 25, 20, 15, 19);          // white cloud base
  rimRect(5, 25, 20, 15, 20);             // soft pink edge all around
  // Golden walkway cross
  fillRect(ground, 13, 26, 3, 13, 21);    // vertical path (from south gate)
  fillRect(ground, 6, 31, 18, 2, 21);     // horizontal path
  // Central plaza with pink diamond + crystal heart
  diamond(14, 32, 3, 21);
  diamond(14, 32, 2, 20);
  ground[32][14] = 22;
  // Flower-bed corners (pink patches)
  fillRect(ground, 7, 27, 3, 3, 20);
  fillRect(ground, 20, 27, 3, 3, 20);
  fillRect(ground, 7, 35, 3, 3, 20);
  fillRect(ground, 20, 35, 3, 3, 20);
  // Cloud pond for fishing (pink shimmer)
  fillRect(ground, 17, 33, 3, 2, 20);

  // Entrance from south (rainbow bridge descent)
  carveCorridor(13, 39, 13, 44, 3, 22);

  // ── ZONE 2: Crystal Halls (x:25-39, y:15-34) — colonnade hall ────────
  carveFloor(25, 15, 15, 20, 22);         // crystal floor base
  rimRect(25, 15, 15, 20, 21);            // golden edge
  // Golden center aisles
  fillRect(ground, 31, 16, 3, 18, 21);    // vertical aisle
  fillRect(ground, 26, 24, 13, 2, 21);    // horizontal aisle
  // Pink plaza at hall center
  diamond(32, 24, 2, 20);

  // Rainbow bridge connecting Garden → Crystal Halls
  carveCorridor(24, 28, 25, 28, 2, 22);

  // ── ZONE 3: Throne Room (x:10-24, y:5-19) — walled boss arena ────────
  carveFloor(10, 5, 15, 15, 21);          // gold floor base
  // Stone castle walls around the arena
  for (let x = 10; x <= 24; x++) { wall(x, 5); wall(x, 19); }
  for (let y = 5; y <= 19; y++) { wall(10, y); wall(24, y); }
  // South gate (to Cloud Garden bridge, x14-15)
  carveFloor(14, 19, 2, 1, 22);
  // East gate (to Crystal Halls, y15-16)
  carveFloor(24, 15, 1, 2, 22);
  // Crystal carpet: vertical aisle from south gate to throne dais
  fillRect(ground, 14, 10, 2, 9, 22);
  // Crystal aisle: horizontal from east gate to center
  fillRect(ground, 15, 15, 9, 2, 22);
  // Throne dais — pink platform with golden trim
  fillRect(ground, 14, 6, 7, 4, 20);
  fillRect(ground, 16, 6, 3, 2, 21);      // golden throne seat accent

  // Rainbow bridge connecting Crystal Halls → Throne Room (east gate)
  carveCorridor(25, 15, 25, 19, 2, 22);

  // Rainbow bridge connecting Garden → Throne Room (south gate)
  carveCorridor(14, 20, 14, 25, 2, 22);

  // ── ZONE 4: Star Terrace (x:30-44, y:0-9) — panorama plaza ───────────
  carveFloor(30, 0, 15, 10, 19);          // white cloud
  rimRect(30, 0, 15, 10, 20);             // pink edge
  // Golden star plaza in the center
  diamond(37, 5, 3, 21);
  diamond(37, 5, 1, 20);
  // Crystal path: from north exit down to the star
  fillRect(ground, 37, 1, 2, 2, 22);
  // Crystal path: from south bridge up to the star
  fillRect(ground, 35, 8, 2, 1, 22);

  // Rainbow bridge connecting Crystal Halls → Star Terrace
  carveCorridor(35, 10, 35, 15, 2, 22);

  // ── Props ──────────────────────────────────────────────────────────────
  const props = [];

  // Zone markers for quest tracking
  props.push({ type: 'zone_marker', zoneId: 'cloud_garden', x: 14, y: 32 });
  props.push({ type: 'zone_marker', zoneId: 'crystal_halls', x: 32, y: 24 });
  props.push({ type: 'zone_marker', zoneId: 'throne_room', x: 17, y: 12 });
  props.push({ type: 'zone_marker', zoneId: 'star_terrace', x: 37, y: 5 });

  // Boss spawn (Shadow Knight — Throne Room center)
  props.push({ type: 'boss_spawn', bossType: 'shadow_knight', x: 17, y: 10 });

  // Resource nodes — cloud crystals in the Crystal Halls
  const crystalSpots = [
    { x: 28, y: 20 }, { x: 36, y: 18 }, { x: 29, y: 29 }, { x: 36, y: 30 }, { x: 33, y: 21 },
  ];
  crystalSpots.forEach((s, i) => {
    props.push({ type: 'resource', resourceType: 'cloud_crystal', x: s.x, y: s.y, id: `ccrystal_${i}` });
  });

  // Rainbow shards on Star Terrace
  const shardSpots = [{ x: 32, y: 3 }, { x: 35, y: 6 }, { x: 41, y: 6 }];
  shardSpots.forEach((s, i) => {
    props.push({ type: 'resource', resourceType: 'rainbow_shard', x: s.x, y: s.y, id: `rshard_${i}` });
  });

  // Star fragments in Cloud Garden
  const fragSpots = [{ x: 9, y: 30 }, { x: 17, y: 28 }, { x: 11, y: 37 }, { x: 21, y: 33 }];
  fragSpots.forEach((s, i) => {
    props.push({ type: 'resource', resourceType: 'star_fragment', x: s.x, y: s.y, id: `sfrag_${i}` });
  });

  // Crystal pillar colonnade in Crystal Halls (collision props, 2 rows)
  const pillars = [
    { x: 27, y: 17 }, { x: 37, y: 17 },
    { x: 27, y: 22 }, { x: 37, y: 22 },
    { x: 27, y: 27 }, { x: 37, y: 27 },
    { x: 27, y: 32 }, { x: 37, y: 32 },
  ];
  for (const p of pillars) {
    props.push({ type: 'crystal_pillar', x: p.x, y: p.y, collision: true });
    collision[p.y][p.x] = 1;
  }

  // Torches in the Throne Room (symmetric along the walls + flanking throne)
  const torchSpots = [
    { x: 11, y: 7 }, { x: 23, y: 7 },
    { x: 11, y: 12 }, { x: 23, y: 12 },
    { x: 11, y: 17 }, { x: 23, y: 17 },
    { x: 13, y: 6 }, { x: 21, y: 6 },
  ];
  for (const t of torchSpots) props.push({ type: 'torch', x: t.x, y: t.y });

  // Treasure chests
  props.push({ type: 'chest', x: 12, y: 7, id: 'chest_cc_throne' });
  props.push({ type: 'chest', x: 28, y: 33, id: 'chest_cc_halls' });
  props.push({ type: 'chest', x: 33, y: 2, id: 'chest_cc_terrace' });

  // Fishing spot (cloud pond in garden)
  props.push({ type: 'fishing_spot', x: 18, y: 33 });

  // Crafting station — alchemy (Star Terrace)
  props.push({ type: 'station', station: 'alchemy', x: 40, y: 3 });

  // Rainbow bridge prop (rendered as overlay, not a tile — per spec)
  props.push({ type: 'rainbow_bridge', x: 34, y: 4, width: 5, height: 1 });

  // ── Decorative props (cloud puffs, sparkles, rainbow arcs) ───────────
  const cloudPuffPositions = [
    // Cloud Garden edges
    { x: 5, y: 26 }, { x: 5, y: 33 }, { x: 23, y: 27 }, { x: 23, y: 35 },
    { x: 8, y: 25 }, { x: 18, y: 25 }, { x: 12, y: 39 },
    // Entrance bridge
    { x: 12, y: 41 }, { x: 16, y: 43 },
    // Crystal Halls edges
    { x: 25, y: 16 }, { x: 38, y: 16 }, { x: 25, y: 33 }, { x: 38, y: 33 },
    // Throne Room walls
    { x: 10, y: 6 }, { x: 23, y: 6 }, { x: 10, y: 18 }, { x: 23, y: 18 },
    // Star Terrace edges
    { x: 30, y: 1 }, { x: 43, y: 1 }, { x: 30, y: 8 }, { x: 43, y: 8 },
  ];
  for (const cp of cloudPuffPositions) {
    props.push({ type: 'cloud_puff', x: cp.x, y: cp.y });
  }

  const sparklePositions = [
    // Cloud Garden sparkles
    { x: 10, y: 28 }, { x: 16, y: 31 }, { x: 20, y: 27 }, { x: 12, y: 36 },
    // Crystal Halls sparkles
    { x: 29, y: 20 }, { x: 34, y: 22 }, { x: 30, y: 30 }, { x: 36, y: 28 },
    // Throne Room sparkles
    { x: 15, y: 8 }, { x: 19, y: 8 }, { x: 17, y: 14 },
    // Star Terrace sparkles
    { x: 33, y: 3 }, { x: 38, y: 5 }, { x: 41, y: 2 },
    // Plaza accents
    { x: 14, y: 30 }, { x: 32, y: 26 }, { x: 37, y: 7 },
  ];
  for (const sp of sparklePositions) {
    props.push({ type: 'sparkle_deco', x: sp.x, y: sp.y });
  }

  // Garden flowers on the four flower beds
  const flowerSpots = [
    { x: 8, y: 28 }, { x: 21, y: 28 }, { x: 8, y: 36 }, { x: 21, y: 36 },
  ];
  for (const f of flowerSpots) props.push({ type: 'flower', x: f.x, y: f.y });

  // Rainbow arcs — decorative arches between zones
  props.push({ type: 'rainbow_arc', x: 14, y: 22, size: 'small' });   // Garden→Throne bridge
  props.push({ type: 'rainbow_arc', x: 24, y: 28, size: 'small' });   // Garden→Crystal bridge
  props.push({ type: 'rainbow_arc', x: 35, y: 12, size: 'small' });   // Crystal→Terrace bridge
  props.push({ type: 'rainbow_arc', x: 37, y: 4, size: 'large' });    // Star Terrace feature

  // ── Exits ──────────────────────────────────────────────────────────────
  const exits = [
    // South exit → unicorn_meadow (rainbow bridge descent)
    { id: 'south', x: 13, y: H - 1, w: 3, h: 1, target: 'unicorn_meadow', spawnX: 12, spawnY: 2 },
    // North-east exit → Starsky secret area (Star Terrace, requires 25 achievements)
    { id: 'north_starsky', x: 37, y: 0, w: 2, h: 1, target: 'starsky', spawnX: 2, spawnY: 4, hidden: true, requirement: 'achievements_25' },
  ];

  // Ensure south exit tiles are walkable
  fillRect(ground, 13, H - 1, 3, 1, 22);
  fillRect(collision, 13, H - 1, 3, 1, 0);

  // Ensure starsky exit tiles are walkable
  fillRect(ground, 37, 0, 2, 1, 22);
  fillRect(collision, 37, 0, 2, 1, 0);

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 14, y: 42 },
  };
}
