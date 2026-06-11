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
 * Layout: A winding crystal "star path" links five glowing island
 * platforms to a big eight-pointed star observatory in the middle of
 * the infinite night sky. Tiny golden star islets twinkle in the void.
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

export function generateStarskyMap() {
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

  // Ringed island: bright rim, softer body, glowing core
  function carveIsland(cx, cy, rimTile, bodyTile, coreTile) {
    carveCircle(cx, cy, 3, rimTile);
    carveCircle(cx, cy, 2, bodyTile);
    carveCircle(cx, cy, 1, coreTile);
  }

  // Winding 2x2 stepped crystal path through given waypoints
  function carveStarPath(steps) {
    for (const s of steps) carveFloor(s.x, s.y, 2, 2, 22);
  }

  // Tiny decorative star islet in the void (visible, NOT walkable)
  function starIslet(cx, cy, tileId) {
    const cells = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dy] of cells) {
      const x = cx + dx, y = cy + dy;
      if (y >= 0 && y < H && x >= 0 && x < W && ground[y][x] === -1) {
        ground[y][x] = tileId;   // collision stays 1 — just a twinkle in the sky
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // CENTRAL OBSERVATORY — big eight-pointed star, center (15, 12)
  // ═══════════════════════════════════════════════════════════════════

  // Main circular platform: crystal rim → pink body → gold ring → crystal heart
  carveCircle(15, 12, 4, 22);
  carveCircle(15, 12, 3, 20);
  carveCircle(15, 12, 2, 21);
  carveFloor(15, 12, 1, 1, 22);

  // Cardinal star points (N, S, E, W) — pink with crystal tips
  carveFloor(14, 6, 3, 2, 20);
  carveFloor(14, 18, 3, 2, 20);
  carveFloor(20, 11, 2, 3, 20);
  carveFloor(9, 11, 2, 3, 20);
  carveFloor(15, 6, 1, 1, 22);   // N tip
  carveFloor(15, 19, 1, 1, 22);  // S tip
  carveFloor(21, 12, 1, 1, 22);  // E tip
  carveFloor(9, 12, 1, 1, 22);   // W tip

  // Connect cardinal points to the center circle
  carveFloor(15, 8, 1, 2, 20);
  carveFloor(15, 16, 1, 2, 20);
  carveFloor(18, 12, 2, 1, 20);
  carveFloor(11, 12, 2, 1, 20);

  // Diagonal star points (NE, NW, SE, SW) — gold pads, complete the 8-point star
  carveFloor(11, 8, 2, 2, 21);
  carveFloor(18, 8, 2, 2, 21);
  carveFloor(11, 15, 2, 2, 21);
  carveFloor(18, 15, 2, 2, 21);

  // ═══════════════════════════════════════════════════════════════════
  // SATELLITE PLATFORMS — 4 glowing islands, linked by winding star paths
  // ═══════════════════════════════════════════════════════════════════

  // ── NW Platform: "Mama's Terrace" (white, pink rim, gold core) ──
  carveIsland(5, 5, 20, 19, 21);
  // Winding star path NW → observatory (down the diagonal)
  carveStarPath([{ x: 8, y: 6 }, { x: 9, y: 7 }, { x: 10, y: 8 }]);

  // ── NE Platform: "Constellation Lookout" (white, crystal core) ──
  carveIsland(25, 5, 20, 19, 22);
  carveStarPath([{ x: 21, y: 6 }, { x: 20, y: 7 }, { x: 19, y: 8 }]);

  // ── SW Platform: "Moon Garden" (pink, white rim, gold core) ──
  carveIsland(5, 20, 19, 20, 21);
  carveStarPath([{ x: 8, y: 17 }, { x: 9, y: 16 }, { x: 10, y: 15 }]);

  // ── SE Platform: "Star Crystal Shrine" (crystal, gold rim+core) ──
  carveIsland(25, 20, 21, 22, 21);
  carveStarPath([{ x: 21, y: 17 }, { x: 20, y: 16 }, { x: 19, y: 15 }]);

  // ═══════════════════════════════════════════════════════════════════
  // ENTRANCE PLATFORM — south (arrival from cloud_castle)
  // ═══════════════════════════════════════════════════════════════════

  carveFloor(13, 22, 5, 3, 19);   // white cloud landing pad
  fillRect(ground, 13, 22, 5, 1, 20);  // pink front edge
  carveFloor(15, 22, 1, 1, 22);   // crystal marker at entry
  // Wide crystal bridge from entrance to the south star point
  carveFloor(14, 20, 3, 2, 22);

  // Hidden-exit landing (cloud_castle north exit spawns at 2,4)
  carveFloor(2, 3, 2, 3, 19);     // connects to NW platform rim at (3,4)

  // ═══════════════════════════════════════════════════════════════════
  // CONSTELLATION VIEWING PLATFORM — north (the "Danke Emilia" text)
  // ═══════════════════════════════════════════════════════════════════

  carveFloor(11, 1, 9, 3, 19);    // wide white cloud platform
  fillRect(ground, 11, 1, 9, 1, 20);   // pink back edge
  carveFloor(14, 2, 3, 1, 21);    // gold accent center strip
  // Wide crystal bridge from constellation platform to the north star point
  carveFloor(14, 4, 3, 2, 22);

  // ═══════════════════════════════════════════════════════════════════
  // TINY STAR ISLETS — golden twinkles floating in the night void
  // ═══════════════════════════════════════════════════════════════════

  starIslet(2, 12, 21);
  starIslet(28, 12, 21);
  starIslet(10, 22, 22);
  starIslet(20, 23, 21);
  starIslet(22, 2, 22);
  starIslet(8, 1, 21);
  starIslet(28, 17, 22);
  starIslet(1, 17, 22);

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

  // ── Sparkles along the star paths and on platforms ──
  const sparkleSpots = [
    { x: 9, y: 7 }, { x: 19, y: 7 }, { x: 9, y: 16 }, { x: 19, y: 16 },
    { x: 5, y: 3 }, { x: 25, y: 3 }, { x: 5, y: 18 }, { x: 25, y: 18 },
    { x: 12, y: 8 }, { x: 18, y: 9 }, { x: 12, y: 16 }, { x: 19, y: 15 },
    { x: 13, y: 2 }, { x: 18, y: 2 }, { x: 14, y: 23 }, { x: 16, y: 23 },
  ];
  for (const sp of sparkleSpots) props.push({ type: 'sparkle_deco', x: sp.x, y: sp.y });

  // ── Cloud puffs drifting at platform edges ──
  const puffSpots = [
    { x: 3, y: 7 }, { x: 7, y: 3 }, { x: 23, y: 3 }, { x: 27, y: 7 },
    { x: 3, y: 18 }, { x: 7, y: 22 }, { x: 23, y: 22 }, { x: 27, y: 18 },
    { x: 11, y: 4 }, { x: 19, y: 4 }, { x: 12, y: 24 }, { x: 18, y: 24 },
  ];
  for (const pf of puffSpots) props.push({ type: 'cloud_puff', x: pf.x, y: pf.y });

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
