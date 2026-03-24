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
  { level: 6,  xpRequired: 200,  statBonus: { maxHp: 10 }, rewards: [{ itemId: 'cooked_meat', count: 3 }], unlockQuest: null },
  // Level 7
  { level: 7,  xpRequired: 280,  statBonus: {}, rewards: [{ itemId: 'sword_stone', count: 1 }], unlockQuest: 'dungeon_explorer' },
  // Level 8
  { level: 8,  xpRequired: 370,  statBonus: { maxHp: 10, speedPct: 5 }, rewards: [], unlockQuest: null },
  // Level 9
  { level: 9,  xpRequired: 480,  statBonus: { damagePct: 10 }, rewards: [{ itemId: 'heal_potion', count: 3 }], unlockQuest: 'skeleton_slayer' },
  // Level 10
  { level: 10, xpRequired: 600,  statBonus: { maxHp: 20 }, rewards: [{ itemId: 'veggie_soup', count: 3 }], unlockQuest: null },
  // Level 11
  { level: 11, xpRequired: 750,  statBonus: { speedPct: 5 }, rewards: [], unlockQuest: 'unicorn_friend' },
  // Level 12
  { level: 12, xpRequired: 900,  statBonus: { maxHp: 10 }, rewards: [{ itemId: 'crystal', count: 5 }], unlockQuest: null },
  // Level 13
  { level: 13, xpRequired: 1100, statBonus: { damagePct: 10 }, rewards: [], unlockQuest: 'master_crafter' },
  // Level 14
  { level: 14, xpRequired: 1400, statBonus: { maxHp: 20 }, rewards: [{ itemId: 'heal_potion', count: 5 }], unlockQuest: null },
  // Level 15
  { level: 15, xpRequired: 1800, statBonus: { maxHp: 10 }, rewards: [{ itemId: 'unicorn_tear', count: 3 }], unlockQuest: 'meadow_hero' },
  // Level 16
  { level: 16, xpRequired: 2200, statBonus: { maxHp: 10 }, rewards: [], unlockQuest: 'shell_collector' },
  // Level 17
  { level: 17, xpRequired: 2700, statBonus: { damagePct: 5 }, rewards: [], unlockQuest: 'master_angler' },
  // Level 18
  { level: 18, xpRequired: 3300, statBonus: { maxHp: 10, speedPct: 5 }, rewards: [], unlockQuest: 'crab_problem' },
  // Level 19
  { level: 19, xpRequired: 4000, statBonus: { damagePct: 5 }, rewards: [], unlockQuest: 'shooting_star' },
  // Level 20
  { level: 20, xpRequired: 4800, statBonus: { maxHp: 15 }, rewards: [], unlockQuest: null },
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
];

export const MAX_LEVEL = 25;

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
