/**
 * The Starsky — secret endgame reward room (30x25).
 * Unlocked by: 25+ achievements + Star Terrace access.
 * Features: all 8 NPCs assembled on a celestial observatory,
 * "Danke Emilia" constellation text, magical atmosphere.
 * No combat, pure reward moment.
 *
 * Tiles: 19=cloud_white, 20=cloud_pink, 21=cloud_gold, 22=crystal_floor
 * Background tile (void/night sky): -1 (collision=1, not walkable)
 *
 * Layout: Central star-shaped observatory with satellite platforms
 * connected by crystal bridges, surrounded by infinite night sky.
 */

const W = 30;
const H = 25;

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

export function generateStarskyMap() {
  const rng = seededRandom(9999);

  // Start with night sky void (no tile, collision=1 — can't walk on void)
  const ground    = createGrid(W, H, -1);
  const collision = createGrid(W, H, 1);

  // Helper: carve walkable floor into the void
  function carveFloor(x, y, w, h, tileId) {
    fillRect(ground,    x, y, w, h, tileId);
    fillRect(collision, x, y, w, h, 0);
  }

  function carveCircle(cx, cy, radius, tileId) {
    fillCircle(ground,    cx, cy, radius, tileId);
    fillCircle(collision, cx, cy, radius, 0);
  }

  function carveBridge(x1, y1, x2, y2, width, tileId) {
    const bw = width || 1;
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

  // ═══════════════════════════════════════════════════════════════════
  // CENTRAL OBSERVATORY — large star-shaped platform (pink cloud)
  // Center at (15, 12)
  // ═══════════════════════════════════════════════════════════════════

  // Main circular platform (radius 4)
  carveCircle(15, 12, 4, 20);  // pink cloud base

  // Star points extending from center (N, S, E, W)
  // North point
  carveFloor(14, 6, 3, 2, 20);
  // South point
  carveFloor(14, 18, 3, 2, 20);
  // East point
  carveFloor(20, 11, 2, 3, 20);
  // West point
  carveFloor(9, 11, 2, 3, 20);

  // Connect star points to center circle
  carveBridge(15, 8, 15, 9, 1, 20);
  carveBridge(15, 16, 15, 17, 1, 20);
  carveBridge(18, 12, 19, 12, 1, 20);
  carveBridge(11, 12, 12, 12, 1, 20);

  // Gold cloud inner ring (accent on the center platform)
  carveCircle(15, 12, 2, 21);

  // Crystal floor at the very center (special)
  carveFloor(15, 12, 1, 1, 22);

  // ═══════════════════════════════════════════════════════════════════
  // SATELLITE PLATFORMS — 4 floating islands connected by bridges
  // ═══════════════════════════════════════════════════════════════════

  // ── NW Platform: "Mama's Terrace" (cloud_white) ──
  carveCircle(5, 5, 3, 19);
  carveCircle(5, 5, 1, 21);   // gold accent center
  // Bridge NW → center (diagonal via two segments)
  carveBridge(8, 5, 9, 5, 1, 22);
  carveBridge(9, 5, 9, 11, 1, 22);

  // ── NE Platform: "Constellation Lookout" (cloud_white + crystal) ──
  carveCircle(25, 5, 3, 19);
  carveCircle(25, 5, 1, 22);  // crystal center (telescope spot)
  // Bridge NE → center
  carveBridge(21, 5, 22, 5, 1, 22);
  carveBridge(21, 5, 21, 11, 1, 22);

  // ── SW Platform: "Moon Garden" (cloud_pink) ──
  carveCircle(5, 20, 3, 20);
  carveCircle(5, 20, 1, 21);  // gold accent center
  // Bridge SW → center
  carveBridge(8, 20, 9, 20, 1, 22);
  carveBridge(9, 14, 9, 20, 1, 22);

  // ── SE Platform: "Star Crystal Shrine" (crystal + gold) ──
  carveCircle(25, 20, 3, 22);
  carveCircle(25, 20, 1, 21); // gold accent center
  // Bridge SE → center
  carveBridge(21, 20, 22, 20, 1, 22);
  carveBridge(21, 14, 21, 20, 1, 22);

  // ═══════════════════════════════════════════════════════════════════
  // ENTRANCE PLATFORM — south (arrival from cloud_castle)
  // ═══════════════════════════════════════════════════════════════════

  carveFloor(13, 22, 5, 3, 19);   // white cloud landing pad
  carveFloor(15, 22, 1, 1, 22);   // crystal marker at entry
  // Bridge from entrance to central observatory
  carveBridge(15, 20, 15, 22, 1, 22);

  // ═══════════════════════════════════════════════════════════════════
  // CONSTELLATION VIEWING PLATFORM — north (the "Danke Emilia" text)
  // ═══════════════════════════════════════════════════════════════════

  carveFloor(11, 1, 9, 3, 19);    // wide white cloud platform
  carveFloor(14, 2, 3, 1, 21);    // gold accent center strip
  // Bridge from constellation platform to center
  carveBridge(15, 4, 15, 6, 1, 22);

  // ═══════════════════════════════════════════════════════════════════
  // PROPS / DECORATIONS
  // ═══════════════════════════════════════════════════════════════════

  const props = [];

  // ── All 8 NPCs arranged in a circle on the central observatory ──
  const npcPositions = [
    { id: 'mama_tanja',  x: 13, y: 10 },   // west of center
    { id: 'papa_milos',  x: 17, y: 10 },   // east of center
    { id: 'oma',         x: 13, y: 14 },   // SW of center
    { id: 'opa',         x: 17, y: 14 },   // SE of center
    { id: 'baba',        x: 12, y: 12 },   // west
    { id: 'deda',        x: 18, y: 12 },   // east
    { id: 'marie',       x: 15, y: 9  },   // north of center
    { id: 'liam',        x: 15, y: 15 },   // south of center
  ];
  for (const npc of npcPositions) {
    props.push({ type: 'npc', id: npc.id, x: npc.x, y: npc.y });
  }

  // ── Constellation text marker (rendered by AmbientLife as star pattern) ──
  // Placed on the north constellation platform, above the map center
  props.push({ type: 'constellation', text: 'Danke Emilia', x: 15, y: 2 });

  // ── Crystal flowers on satellite platforms (decorative glow) ──
  props.push({ type: 'crystal_flower', x: 4,  y: 4  });
  props.push({ type: 'crystal_flower', x: 6,  y: 6  });
  props.push({ type: 'crystal_flower', x: 24, y: 4  });
  props.push({ type: 'crystal_flower', x: 26, y: 6  });
  props.push({ type: 'crystal_flower', x: 4,  y: 19 });
  props.push({ type: 'crystal_flower', x: 6,  y: 21 });
  props.push({ type: 'crystal_flower', x: 24, y: 19 });
  props.push({ type: 'crystal_flower', x: 26, y: 21 });

  // ── Flowers on central observatory (festive) ──
  props.push({ type: 'flower', x: 14, y: 11 });
  props.push({ type: 'flower', x: 16, y: 11 });
  props.push({ type: 'flower', x: 14, y: 13 });
  props.push({ type: 'flower', x: 16, y: 13 });

  // ── Crystal pillars on the 4 star points (decorative markers) ──
  props.push({ type: 'crystal_pillar', x: 15, y: 7, collision: false });
  props.push({ type: 'crystal_pillar', x: 15, y: 18, collision: false });
  props.push({ type: 'crystal_pillar', x: 10, y: 12, collision: false });
  props.push({ type: 'crystal_pillar', x: 20, y: 12, collision: false });

  // ── Signpost at entrance (back to cloud castle) ──
  props.push({ type: 'signpost', x: 14, y: 23, label: 'Wolkenschloss', dir: 'south' });

  // ── Rainbow zone in the center (particle effects) ──
  props.push({ type: 'rainbow_zone', x: 13, y: 10, w: 5, h: 5 });

  // ── Exit south → cloud_castle Star Terrace ──
  props.push({ type: 'exit', x: 15, y: 24, width: 1, target: 'cloud_castle', spawnX: 37, spawnY: 5 });

  const exits = [
    { id: 'south', x: 13, y: 24, w: 5, h: 1, target: 'cloud_castle', spawnX: 37, spawnY: 5 },
  ];

  // Ensure exit tiles are walkable
  fillRect(ground,    13, 24, 5, 1, 19);
  fillRect(collision, 13, 24, 5, 1, 0);

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    exits,
    playerSpawn: { x: 15, y: 22 },
  };
}
