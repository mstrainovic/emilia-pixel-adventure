import { ACHIEVEMENTS } from '../data/achievements.js';

/**
 * Achievement tracking system.
 * Checks conditions against game state every update cycle.
 * Fires onUnlock callback when a new achievement is earned.
 *
 * Conditions are checked lazily — only when relevant events occur.
 * Call check() periodically or after significant events.
 */
export class AchievementSystem {
  constructor() {
    this.unlocked = new Set();
    this.onUnlock = null; // (achievementDef) => void
  }

  /**
   * Check all achievements against current game state.
   * @param {object} state - snapshot of game state:
   *   { scenesVisited, mobsKilled, totalMobsKilled, bossesKilled,
   *     fishCaught, shellsFound, insectsCaught, gemsFound,
   *     bookEntries, bookTotal, plantsCollected, chestsFound,
   *     secretsFound, distanceWalked, npcsSpoken, unicornsPetted,
   *     petFriendship, completedQuests, level, achievementCount }
   */
  check(state) {
    for (const [id, def] of Object.entries(ACHIEVEMENTS)) {
      if (this.unlocked.has(id)) continue;
      if (this._checkCondition(def.condition, state)) {
        this.unlocked.add(id);
        if (this.onUnlock) this.onUnlock(def);
      }
    }
  }

  _checkCondition(cond, s) {
    switch (cond.type) {
      case 'visit_scene':
        return !!(s.scenesVisited && s.scenesVisited[cond.scene]);

      case 'visit_all_scenes':
        return cond.scenes.every(sc => s.scenesVisited && s.scenesVisited[sc]);

      case 'find_secrets':
        return (s.secretsFound || 0) >= cond.count;

      case 'walk_distance':
        return (s.distanceWalked || 0) >= cond.tiles;

      case 'catch_fish':
        return (s.fishCaught || 0) >= cond.count;

      case 'collect_shells':
        return (s.shellsFound || 0) >= cond.count;

      case 'catch_insects':
        return (s.insectsCaught || 0) >= cond.count;

      case 'collect_gems':
        return (s.gemsFound || 0) >= cond.count;

      case 'book_entries':
        return (s.bookEntries || 0) >= cond.count;

      case 'book_complete':
        return s.bookEntries > 0 && s.bookEntries >= (s.bookTotal || 999);

      case 'collect_plants':
        return (s.plantsCollected || 0) >= cond.count;

      case 'find_chests':
        return (s.chestsFound || 0) >= cond.count;

      case 'kill_first':
        return (s.totalMobsKilled || 0) >= 1;

      case 'kill_type': {
        const kills = s.mobsKilled || {};
        // Sum all variants of the type (e.g. slime = slime_green + slime_red + ...)
        let total = 0;
        for (const [mobType, count] of Object.entries(kills)) {
          if (mobType.startsWith(cond.target)) total += count;
        }
        return total >= cond.count;
      }

      case 'kill_bosses':
        return Object.keys(s.bossesKilled || {}).length >= cond.count;

      case 'boss_no_damage':
        return !!(s.bossNoHitKill);

      case 'talk_all_npcs':
        return Object.keys(s.npcsSpoken || {}).length >= 8;

      case 'pet_all_unicorns':
        return (s.unicornsPetted || 0) >= 3;

      case 'max_pet_friendship':
        return (s.petFriendship || 0) >= 100;

      case 'complete_npc_quests': {
        const npcQuests = ['first_steps', 'wood_collector', 'nature_healer'];
        return npcQuests.every(q => s.completedQuests && s.completedQuests[q]);
      }

      case 'reach_level':
        return (s.level || 1) >= cond.level;

      case 'complete_all_quests':
        return Object.keys(s.completedQuests || {}).length >= 24;

      case 'achievement_count':
        return this.unlocked.size >= cond.count;

      default:
        return false;
    }
  }

  getCount() {
    return this.unlocked.size;
  }

  getTotal() {
    return Object.keys(ACHIEVEMENTS).length;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  getState() {
    return [...this.unlocked];
  }

  loadState(arr) {
    this.unlocked = new Set(Array.isArray(arr) ? arr : []);
  }
}
