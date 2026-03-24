/**
 * Rare find hidden item placement per scene.
 * These are collectible items placed in specific positions.
 * Player picks them up with E key (same as ResourceNode).
 * Each has a condition for visibility (time-of-day, after boss, etc.)
 *
 * Used by Game.js _buildScene to create ResourceNode instances.
 */
export const RARE_FIND_PLACEMENTS = {
  hub: [
    {
      itemId: 'old_coin',
      x: 35, y: 5,       // behind Oma's house, top-right corner
      condition: null,     // always visible, but hidden behind prop
      respawn: false,      // one-time pickup
    },
  ],
  unicorn_meadow: [
    {
      itemId: 'fairy_dust',
      x: 12, y: 8,
      condition: 'night',  // only visible at night
      respawn: false,
    },
  ],
  dungeon: [
    {
      itemId: 'fossil',
      x: 30, y: 25,       // dead-end corridor behind ore cluster
      condition: null,
      respawn: false,
    },
  ],
  beach: [
    {
      itemId: 'message_bottle',
      x: 8, y: 3,         // shoreline
      condition: 'morning', // spawns only during morning phase
      respawn: false,
    },
  ],
  grotto: [
    {
      itemId: 'lost_diary',
      x: 22, y: 30,       // treasure chamber, behind a chest prop
      condition: null,
      respawn: false,
    },
  ],
  cloud_castle: [
    {
      itemId: 'golden_feather',
      x: 40, y: 5,        // Star Terrace, after Shadow Knight defeat
      condition: 'boss_shadow_knight_defeated',
      respawn: false,
    },
  ],
};
