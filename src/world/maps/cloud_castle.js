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

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/**
 * The Cloud Castle — ethereal sky fortress with 4 zones.
 * Tiles: 19=cloud_white, 20=cloud_pink, 21=cloud_gold, 22=crystal_floor
 * Background tile (void/starsky): -1 (collision=1, not walkable)
 *
 * Zone layout (50x45):
 *   Cloud Garden     x:5-24,  y:25-39  — entrance area, floating flower islands
 *   Crystal Halls    x:25-39, y:15-34  — crystal floor, puzzle room
 *   Throne Room      x:10-24, y:5-19   — Boss 3 arena (Shadow Knight)
 *   Star Terrace     x:30-44, y:0-9    — panorama, reward NPCs, endgame
 *
 * Exit: South center (y=44) → unicorn_meadow
 */
export function generateCloudCastleMap() {
  const rng = seededRandom(7799);

  // Start with starsky void (no tile, collision=1)
  const ground    = createGrid(W, H, -1);
  const collision = createGrid(W, H, 1);

  function carveFloor(x, y, w, h, tileId) {
    fillRect(ground,    x, y, w, h, tileId);
    fillRect(collision, x, y, w, h, 0);
  }

  function carveCorridor(x1, y1, x2, y2, width, tileId) {
    const bw = width || 2;
    const tile = tileId || 22; // rainbow bridge default
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

  // ── ZONE 1: Cloud Garden (x:5-24, y:25-39) ────────────────────────────
  // Main garden — white and pink clouds with flower islands
  carveFloor(5, 25, 20, 15, 19);   // white cloud base
  // Pink cloud patches
  carveFloor(8, 27, 6, 5, 20);
  carveFloor(15, 30, 5, 4, 20);
  carveFloor(10, 35, 8, 3, 20);

  // Entrance from south (rainbow bridge descent)
  carveCorridor(13, 39, 13, 44, 3, 22);

  // ── ZONE 2: Crystal Halls (x:25-39, y:15-34) ──────────────────────────
  carveFloor(25, 15, 15, 20, 21);   // crystal floor base
  // Pink cloud accent rooms
  carveFloor(28, 18, 5, 5, 20);
  carveFloor(32, 26, 6, 6, 20);

  // Rainbow bridge connecting Garden → Crystal Halls
  carveCorridor(24, 28, 25, 28, 2, 22);

  // ── ZONE 3: Throne Room (x:10-24, y:5-19) ─────────────────────────────
  // Boss arena — large open room
  carveFloor(10, 5, 15, 15, 21);     // crystal floor
  // Gold cloud throne area
  carveFloor(14, 6, 7, 4, 20);       // pink cloud throne platform

  // Rainbow bridge connecting Crystal Halls → Throne Room
  carveCorridor(25, 15, 25, 19, 2, 22);
  carveCorridor(24, 15, 10, 15, 2, 22);

  // Rainbow bridge connecting Garden → Throne Room
  carveCorridor(14, 20, 14, 25, 2, 22);

  // ── ZONE 4: Star Terrace (x:30-44, y:0-9) ─────────────────────────────
  carveFloor(30, 0, 15, 10, 19);     // white cloud
  carveFloor(34, 2, 7, 6, 20);       // pink cloud center

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

  // Resource nodes — cloud crystals scattered in Crystal Halls
  for (let i = 0; i < 5; i++) {
    const rx = 26 + Math.floor(rng() * 12);
    const ry = 16 + Math.floor(rng() * 17);
    if (ground[ry] && ground[ry][rx] === 21) {
      props.push({ type: 'resource', resource: 'cloud_crystal', x: rx, y: ry });
    }
  }

  // Rainbow shards on Star Terrace
  for (let i = 0; i < 3; i++) {
    props.push({ type: 'resource', resource: 'rainbow_shard', x: 32 + i * 3, y: 3 + Math.floor(rng() * 5) });
  }

  // Star fragments in Cloud Garden
  for (let i = 0; i < 4; i++) {
    props.push({ type: 'resource', resource: 'star_fragment', x: 7 + Math.floor(rng() * 16), y: 26 + Math.floor(rng() * 12) });
  }

  // Decorative crystal pillars in Crystal Halls (collision props)
  const pillars = [
    { x: 27, y: 17 }, { x: 37, y: 17 }, { x: 27, y: 32 }, { x: 37, y: 32 },
  ];
  for (const p of pillars) {
    props.push({ type: 'crystal_pillar', x: p.x, y: p.y, collision: true });
    collision[p.y][p.x] = 1;
  }

  // Fishing spot (cloud pond in garden)
  props.push({ type: 'fishing_spot', x: 18, y: 33 });

  // Crafting station — alchemy (Star Terrace)
  props.push({ type: 'station', station: 'alchemy', x: 40, y: 3 });

  // Rainbow bridge prop (rendered as overlay, not a tile — per spec)
  props.push({ type: 'rainbow_bridge', x: 34, y: 4, width: 5, height: 1 });

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
  fillRect(ground, 37, 0, 2, 1, 19);
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
