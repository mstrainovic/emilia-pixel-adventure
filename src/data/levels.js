/**
 * Level progression table.
 * xpRequired: XP needed FROM previous level (not cumulative).
 * rewards: items given on level-up.
 * statBonus: permanent stat improvements.
 * unlockQuest: quest ID unlocked at this level.
 */
export const LEVEL_TABLE = [
  // Level 1 — start
  { level: 1,  xpRequired: 0,    statBonus: {}, rewards: [], unlockQuest: 'first_steps' },
  // Level 2 — after first quest + a few slimes
  { level: 2,  xpRequired: 25,   statBonus: { maxHp: 10 }, rewards: [], unlockQuest: 'wood_collector' },
  // Level 3 — after gathering + a few more slimes
  { level: 3,  xpRequired: 40,   statBonus: { speedPct: 5 }, rewards: [], unlockQuest: 'nature_healer' },
  // Level 4 — reward: bone sword!
  { level: 4,  xpRequired: 60,   statBonus: { maxHp: 10 }, rewards: [{ itemId: 'sword_bone', count: 1 }], unlockQuest: null },
  // Level 5
  { level: 5,  xpRequired: 100,  statBonus: { damagePct: 5 }, rewards: [{ itemId: 'heal_potion', count: 2 }], unlockQuest: 'slime_hunter' },
  // Level 6
  { level: 6,  xpRequired: 130,  statBonus: { maxHp: 10 }, rewards: [{ itemId: 'cooked_meat', count: 3 }], unlockQuest: 'lake_visitor' },
  // Level 7
  { level: 7,  xpRequired: 160,  statBonus: {}, rewards: [{ itemId: 'sword_stone', count: 1 }], unlockQuest: 'dungeon_explorer' },
  // Level 8
  { level: 8,  xpRequired: 200,  statBonus: { maxHp: 10, speedPct: 5 }, rewards: [], unlockQuest: 'master_cook' },
  // Level 9
  { level: 9,  xpRequired: 250,  statBonus: { damagePct: 10 }, rewards: [{ itemId: 'heal_potion', count: 3 }], unlockQuest: 'skeleton_slayer' },
  // Level 10
  { level: 10, xpRequired: 300,  statBonus: { maxHp: 20 }, rewards: [{ itemId: 'veggie_soup', count: 3 }], unlockQuest: 'unicorn_friend' },
  // Level 11
  { level: 11, xpRequired: 400,  statBonus: { speedPct: 5 }, rewards: [], unlockQuest: 'master_crafter' },
  // Level 12
  { level: 12, xpRequired: 500,  statBonus: { maxHp: 10 }, rewards: [{ itemId: 'crystal', count: 5 }], unlockQuest: 'meadow_hero' },
  // Level 13
  { level: 13, xpRequired: 650,  statBonus: { damagePct: 10 }, rewards: [], unlockQuest: null },
  // Level 14
  { level: 14, xpRequired: 800,  statBonus: { maxHp: 20 }, rewards: [{ itemId: 'heal_potion', count: 5 }], unlockQuest: null },
  // Level 15
  { level: 15, xpRequired: 1000, statBonus: { maxHp: 10 }, rewards: [{ itemId: 'unicorn_tear', count: 3 }], unlockQuest: 'shell_collector' },
  // Level 16
  { level: 16, xpRequired: 1300, statBonus: { maxHp: 10 }, rewards: [], unlockQuest: 'master_angler' },
  // Level 17
  { level: 17, xpRequired: 1600, statBonus: { damagePct: 5 }, rewards: [], unlockQuest: 'crab_problem' },
  // Level 18
  { level: 18, xpRequired: 2000, statBonus: { maxHp: 10, speedPct: 5 }, rewards: [] },
  // Level 19
  { level: 19, xpRequired: 2500, statBonus: { damagePct: 5 }, rewards: [], unlockQuest: null },
  // Level 20
  { level: 20, xpRequired: 3000, statBonus: { maxHp: 15 }, rewards: [], unlockQuest: null },
  // Level 21
  { level: 21, xpRequired: 5800, statBonus: { maxHp: 15 }, rewards: [], unlockQuest: 'coral_healer' },
  // Level 22
  { level: 22, xpRequired: 7000, statBonus: { damagePct: 10 }, rewards: [], unlockQuest: 'deep_explorer' },
  // Level 23
  { level: 23, xpRequired: 8400, statBonus: { maxHp: 15, speedPct: 5 }, rewards: [], unlockQuest: 'best_friend' },
  // Level 24
  { level: 24, xpRequired: 10000, statBonus: { damagePct: 10 }, rewards: [], unlockQuest: 'collector_page1' },
  // Level 25 — M5 MAX
  { level: 25, xpRequired: 12000, statBonus: { maxHp: 20 }, rewards: [{ itemId: 'ghost_pearl', count: 5 }], unlockQuest: 'sunken_treasure' },
  // Level 26
  { level: 26, xpRequired: 14500, statBonus: { maxHp: 20, damagePct: 5 }, rewards: [], unlockQuest: 'cloud_jumper' },
  // Level 27
  { level: 27, xpRequired: 17500, statBonus: { maxHp: 15, speedPct: 5 }, rewards: [], unlockQuest: 'crystal_puzzle' },
  // Level 28
  { level: 28, xpRequired: 21000, statBonus: { maxHp: 20, damagePct: 10 }, rewards: [{ itemId: 'heal_potion', count: 5 }], unlockQuest: 'shadow_slayer' },
  // Level 29
  { level: 29, xpRequired: 25000, statBonus: { maxHp: 15, speedPct: 5 }, rewards: [], unlockQuest: 'star_collector' },
  // Level 30 — M6 MAX
  { level: 30, xpRequired: 30000, statBonus: { maxHp: 30, damagePct: 10 }, rewards: [{ itemId: 'star_fragment', count: 5 }], unlockQuest: 'emilia_legend' },
];

export const MAX_LEVEL = 30;

/**
 * Get cumulative XP needed for a given level.
 */
export function getXpForLevel(level) {
  let total = 0;
  for (let i = 1; i < level && i < LEVEL_TABLE.length; i++) {
    total += LEVEL_TABLE[i].xpRequired;
  }
  return total;
}

/**
 * Get XP needed from current level to next.
 */
export function getXpToNextLevel(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return LEVEL_TABLE[level]?.xpRequired || 999999;
}
