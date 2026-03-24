/**
 * Boss definitions for M6.
 * Each boss has phases with different attack patterns and stats.
 * Bosses do NOT respawn on death — they stay defeated (persistent).
 * On player death: respawn before boss room, boss keeps damage taken.
 *
 * spriteType: 'coconut_king' | 'leviathan' | 'shadow_knight'
 * phases: array of phase configs, activated by HP threshold
 */
export const BOSS_TYPES = {
  coconut_king: {
    name: 'Kokosnuss-Koenig',
    spriteType: 'coconut_king',
    scene: 'beach',
    hp: 120,
    xp: 150,
    speed: 1.0,
    unlockCondition: 'all_m4_quests',
    phases: [
      {
        name: 'Phase 1',
        hpThreshold: 0.6,
        damage: 8,
        rangedDamage: 5,
        attackCooldown: 2.0,
        pattern: 'patrol_throw_single',
        telegraphDuration: 2.0,
      },
      {
        name: 'Phase 2',
        hpThreshold: 0.0,
        damage: 8,
        rangedDamage: 5,
        attackCooldown: 1.5,
        pattern: 'patrol_throw_triple',
        speedMultiplier: 1.3,
        telegraphDuration: 2.5,
      },
    ],
    weakSpot: 'belly_side',
    drops: [
      { itemId: 'beach_crown', count: 1 },
      { itemId: 'coconut', count: 5 },
    ],
  },

  leviathan: {
    name: 'Tiefsee-Leviathan',
    spriteType: 'leviathan',
    scene: 'grotto',
    hp: 180,
    xp: 250,
    speed: 0.8,
    unlockCondition: 'all_m5_quests',
    phases: [
      {
        name: 'Phase 1',
        hpThreshold: 0.5,
        damage: 10,
        aoeDamage: 7,
        attackCooldown: 2.5,
        pattern: 'tentacle_slam_dual',
        telegraphDuration: 2.5,
      },
      {
        name: 'Phase 2',
        hpThreshold: 0.0,
        damage: 10,
        aoeDamage: 7,
        attackCooldown: 2.0,
        pattern: 'tentacle_ink_combo',
        speedMultiplier: 1.2,
        telegraphDuration: 2.0,
      },
    ],
    weakSpot: 'head_after_slam',
    drops: [
      { itemId: 'leviathan_pearl', count: 1 },
    ],
  },

  shadow_knight: {
    name: 'Schatten-Ritter',
    spriteType: 'shadow_knight',
    scene: 'cloud_castle',
    hp: 250,
    xp: 400,
    speed: 1.8,
    unlockCondition: 'cloud_castle_access',
    phases: [
      {
        name: 'Phase 1',
        hpThreshold: 0.66,
        damage: 12,
        dashDamage: 8,
        attackCooldown: 1.8,
        pattern: 'sword_block_counter',
        telegraphDuration: 2.0,
      },
      {
        name: 'Phase 2',
        hpThreshold: 0.33,
        damage: 12,
        dashDamage: 8,
        attackCooldown: 1.5,
        pattern: 'teleport_combo',
        speedMultiplier: 1.4,
        telegraphDuration: 2.5,
      },
      {
        name: 'Phase 3',
        hpThreshold: 0.0,
        damage: 12,
        dashDamage: 8,
        attackCooldown: 1.5,
        pattern: 'clone_assault',
        cloneHp: 50,
        cloneCount: 2,
        speedMultiplier: 1.2,
        telegraphDuration: 3.0,
      },
    ],
    weakSpot: null,
    drops: [
      { itemId: 'rainbow_sword', count: 1 },
      { itemId: 'shadow_essence', count: 3 },
    ],
  },
};

/**
 * Check if a boss is unlocked based on game state.
 */
export function isBossUnlocked(bossId, progression, player, unicornsPetted) {
  const boss = BOSS_TYPES[bossId];
  if (!boss) return false;

  const completed = progression.completedQuests || {};

  switch (boss.unlockCondition) {
    case 'all_m4_quests':
      return !!(completed['shell_collector'] && completed['master_angler'] &&
                completed['crab_problem'] && completed['shooting_star']);

    case 'all_m5_quests':
      return !!(completed['coral_healer'] && completed['deep_explorer'] &&
                completed['best_friend'] && completed['collector_page1'] &&
                completed['sunken_treasure']);

    case 'cloud_castle_access':
      return (progression.level >= 22) && (unicornsPetted >= 3);

    default:
      return false;
  }
}
