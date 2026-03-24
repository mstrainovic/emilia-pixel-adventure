const W = 5;
const H = 5;

function createGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

/**
 * The Starsky — secret endgame reward room (5x5).
 * Unlocked by: 25+ achievements + Star Terrace access.
 * Features: all 8 NPCs assembled, "Danke Emilia" constellation text,
 * player's evolved pet beside them. No combat, pure reward moment.
 *
 * Uses tile 19 (cloud_white) as floor with void background.
 */
export function generateStarskyMap() {
  // Entire 5x5 is walkable cloud
  const ground    = createGrid(W, H, 19);
  const collision = createGrid(W, H, 0);

  // Border collision (can't walk off the edge)
  for (let x = 0; x < W; x++) { collision[0][x] = 1; collision[H - 1][x] = 1; }
  for (let y = 0; y < H; y++) { collision[y][0] = 1; collision[y][W - 1] = 1; }

  // Pink cloud center tile
  ground[2][2] = 20;

  const props = [];

  // All 8 NPCs arranged in a semicircle around center
  const npcPositions = [
    { id: 'mama_tanja',   x: 1, y: 1 },
    { id: 'papa_boris',   x: 3, y: 1 },
    { id: 'oma',          x: 1, y: 2 },
    { id: 'opa',          x: 3, y: 2 },
    { id: 'tante_mila',   x: 1, y: 3 },
    { id: 'onkel_sasa',   x: 3, y: 3 },
    { id: 'marie',        x: 2, y: 1 },
    { id: 'leon',         x: 2, y: 3 },
  ];
  for (const npc of npcPositions) {
    props.push({ type: 'npc', id: npc.id, x: npc.x, y: npc.y });
  }

  // Constellation text marker (rendered by AmbientLife as star pattern)
  props.push({ type: 'constellation', text: 'Danke Emilia', x: 2, y: 0 });

  // Exit south → cloud_castle Star Terrace
  props.push({ type: 'exit', x: 2, y: 4, width: 1, target: 'cloud_castle', spawnX: 37, spawnY: 5 });

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    playerSpawn: { x: 2, y: 2 },
  };
}
