/**
 * Auto-tile resolver — replaces terrain boundary tiles with proper
 * edge/corner variants from Cute Fantasy auto-tile sets (48×96, 3×6 grid).
 *
 * Scans each cell matching the terrain ID, checks 8 neighbors, and replaces
 * boundary tiles with the correct edge/corner variant.
 */

/**
 * @param {number[][]} ground - 2D tile grid (modified in-place)
 * @param {number} terrainId - Base tile ID to auto-tile (e.g., 10 for water)
 * @param {object} edges - Edge/corner tile ID map:
 *   { N, S, W, E, outerTL, outerTR, outerBL, outerBR, innerTL, innerTR, innerBL, innerBR }
 * @param {number[]} [alsoTerrain=[]] - Additional tile IDs treated as same terrain
 */
export function resolveAutoTiles(ground, terrainId, edges, alsoTerrain = []) {
  const H = ground.length;
  const W = ground[0].length;
  const terrainSet = new Set([terrainId, ...alsoTerrain]);

  const is = (r, c) => {
    if (r < 0 || r >= H || c < 0 || c >= W) return true; // out-of-bounds = terrain
    return terrainSet.has(ground[r][c]);
  };

  // Collect replacements first (scan sees original tile IDs)
  const rep = [];

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      // Only replace tiles matching the PRIMARY terrain ID —
      // alsoTerrain tiles count as "same" for neighbor checks but keep their own tile
      if (ground[r][c] !== terrainId) continue;

      const n = is(r - 1, c), s = is(r + 1, c);
      const w = is(r, c - 1), e = is(r, c + 1);
      const nw = is(r - 1, c - 1), ne = is(r - 1, c + 1);
      const sw = is(r + 1, c - 1), se = is(r + 1, c + 1);

      let id = null;

      // Outer corners: two adjacent cardinal directions are non-terrain
      if (!n && !w) id = edges.outerTL;
      else if (!n && !e) id = edges.outerTR;
      else if (!s && !w) id = edges.outerBL;
      else if (!s && !e) id = edges.outerBR;
      // Single edges: one cardinal direction is non-terrain
      else if (!n) id = edges.N;
      else if (!s) id = edges.S;
      else if (!w) id = edges.W;
      else if (!e) id = edges.E;
      // Inner corners: all cardinal are terrain, one diagonal is not
      else if (!nw) id = edges.innerTL;
      else if (!ne) id = edges.innerTR;
      else if (!sw) id = edges.innerBL;
      else if (!se) id = edges.innerBR;

      if (id != null) rep.push({ r, c, id });
    }
  }

  for (const { r, c, id } of rep) ground[r][c] = id;
}

/** Water auto-tile edge IDs (tiles 23-34 in tileset strip). */
export const WATER_EDGES = {
  N: 23, S: 24, W: 25, E: 26,
  outerTL: 27, outerTR: 28, outerBL: 29, outerBR: 30,
  innerTL: 31, innerTR: 32, innerBL: 33, innerBR: 34,
};

/** Path auto-tile edge IDs (tiles 35-46 in tileset strip). */
export const PATH_EDGES = {
  N: 35, S: 36, W: 37, E: 38,
  outerTL: 39, outerTR: 40, outerBL: 41, outerBR: 42,
  innerTL: 43, innerTR: 44, innerBL: 45, innerBR: 46,
};
