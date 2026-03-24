import { LEVEL_TABLE, MAX_LEVEL, getXpToNextLevel } from '../data/levels.js';
import { QUESTS } from '../data/quests.js';

// Quest chain order — each quest unlocks the next
const QUEST_ORDER = [
  'first_steps', 'wood_collector', 'nature_healer', 'slime_hunter',
  'dungeon_explorer', 'skeleton_slayer', 'unicorn_friend', 'master_crafter', 'meadow_hero',
  // M4
  'shell_collector', 'master_angler', 'crab_problem', 'shooting_star',
];

/**
 * Progression system — XP, Levels, Stats, Quests.
 * Tracks all progression state and applies stat bonuses to the player.
 */
export class Progression {
  constructor() {
    this.level = 1;
    this.xp = 0;          // XP within current level
    this.totalXp = 0;     // lifetime XP
    this.xpToNext = getXpToNextLevel(1);

    // Accumulated stat bonuses from levels
    this.bonusMaxHp = 0;
    this.bonusDamagePct = 0;   // percentage (e.g. 15 = +15%)
    this.bonusSpeedPct = 0;

    // Quest state
    this.activeQuests = {};   // questId → { progress: number, completed: boolean }
    this.completedQuests = {};

    // Tracking counters for quest progress
    this.stats = {
      mobsKilled: {},    // mobType → count  (slime_green: 3, skeleton_base: 5, etc.)
      itemsCollected: {}, // itemId → count
      plantsHealed: 0,
      unicornsPetted: 0,
      itemsCrafted: 0,
      scenesVisited: {},  // sceneName → true
      npcsSpoken: {},     // npcId → true
    };

    // Callbacks (set by Game.js)
    this.onLevelUp = null;      // (level, levelData) => show celebration
    this.onQuestComplete = null; // (questDef) => show notification
    this.onXpGain = null;       // (amount) => update HUD
  }

  // ─── XP ───

  addXp(amount) {
    if (this.level >= MAX_LEVEL) return;
    this.xp += amount;
    this.totalXp += amount;
    if (this.onXpGain) this.onXpGain(amount);

    // Check level up (can gain multiple levels)
    while (this.xp >= this.xpToNext && this.level < MAX_LEVEL) {
      this.xp -= this.xpToNext;
      this.level++;
      this._applyLevelUp();
    }
  }

  _applyLevelUp() {
    const data = LEVEL_TABLE[this.level - 1];
    if (!data) return;

    // Apply stat bonuses
    if (data.statBonus.maxHp) this.bonusMaxHp += data.statBonus.maxHp;
    if (data.statBonus.damagePct) this.bonusDamagePct += data.statBonus.damagePct;
    if (data.statBonus.speedPct) this.bonusSpeedPct += data.statBonus.speedPct;

    this.xpToNext = getXpToNextLevel(this.level);

    // Unlock quests for this level
    if (data.unlockQuest && QUESTS[data.unlockQuest] && !this.completedQuests[data.unlockQuest]) {
      this.activeQuests[data.unlockQuest] = { progress: 0, completed: false };
    }

    // Check reach_level quests
    this._checkQuestType('reach_level', this.level, 1);

    if (this.onLevelUp) this.onLevelUp(this.level, data);
  }

  // ─── STAT GETTERS ───

  getMaxHp() { return 100 + this.bonusMaxHp; }
  getDamageMultiplier() { return 1.0 + this.bonusDamagePct / 100; }
  getSpeedMultiplier() { return 1.0 + this.bonusSpeedPct / 100; }
  getXpProgress() { return this.level >= MAX_LEVEL ? 1 : this.xp / this.xpToNext; }

  /**
   * Apply stat bonuses to the player entity.
   */
  applyToPlayer(player) {
    player.maxHp = this.getMaxHp();
    if (player.hp > player.maxHp) player.hp = player.maxHp;
  }

  // ─── QUEST TRACKING ───

  /**
   * Report an event that might advance a quest.
   */
  reportKill(mobType) {
    // Track per-type kills
    const baseType = mobType.startsWith('slime') ? 'slime'
      : mobType.startsWith('skeleton') ? 'skeleton'
      : mobType.startsWith('crab') ? 'crab'
      : mobType;
    this.stats.mobsKilled[mobType] = (this.stats.mobsKilled[mobType] || 0) + 1;
    this._checkQuestType('kill', baseType, 1);
  }

  reportCollect(itemId, count = 1) {
    this.stats.itemsCollected[itemId] = (this.stats.itemsCollected[itemId] || 0) + count;
    this._checkQuestType('collect', itemId, count);
  }

  reportHeal() {
    this.stats.plantsHealed++;
    this._checkQuestType('heal', 'plant', 1);
  }

  reportPet() {
    this.stats.unicornsPetted++;
    this._checkQuestType('pet', 'unicorn', 1);
  }

  reportCraft() {
    this.stats.itemsCrafted++;
    this._checkQuestType('craft', 'any', 1);
  }

  reportVisit(sceneName) {
    this.stats.scenesVisited[sceneName] = true;
    this._checkQuestType('visit', sceneName, 1);
  }

  reportTalk(npcId) {
    this.stats.npcsSpoken[npcId] = true;
    this._checkQuestType('talk', npcId, 1);
  }

  reportFish(fishId) {
    if (!this.stats.fishCaught) this.stats.fishCaught = {};
    const isNew = !this.stats.fishCaught[fishId];
    this.stats.fishCaught[fishId] = (this.stats.fishCaught[fishId] || 0) + 1;
    if (isNew) {
      this._checkQuestType('fish', 'fish_unique', 1);
    }
  }

  reportObserve(eventType) {
    if (!this.stats.observed) this.stats.observed = {};
    this.stats.observed[eventType] = (this.stats.observed[eventType] || 0) + 1;
    this._checkQuestType('observe', eventType, 1);
  }

  reportCollectUnique(category, itemId) {
    if (!this.stats.uniqueCollected) this.stats.uniqueCollected = {};
    if (!this.stats.uniqueCollected[category]) this.stats.uniqueCollected[category] = new Set();
    const isNew = !this.stats.uniqueCollected[category].has(itemId);
    this.stats.uniqueCollected[category].add(itemId);
    if (isNew) {
      this._checkQuestType('collect_unique', category, 1);
    }
  }

  _checkQuestType(type, target, increment) {
    for (const [questId, state] of Object.entries(this.activeQuests)) {
      if (state.completed) continue;
      const def = QUESTS[questId];
      if (!def || def.type !== type) continue;

      // Check target match
      if (type === 'reach_level') {
        if (this.level >= def.target) {
          state.progress = def.count;
        }
      } else if (def.target === target || def.target === 'any') {
        state.progress += increment;
      }

      // Check completion
      if (state.progress >= def.count && !state.completed) {
        state.completed = true;
        this.completedQuests[questId] = true;
        this._unlockNextQuest(questId); // unlock next BEFORE callback so HUD sees it
        this.addXp(def.xpReward);
        if (this.onQuestComplete) this.onQuestComplete(def);
      }
    }
  }

  _unlockNextQuest(completedId) {
    const idx = QUEST_ORDER.indexOf(completedId);
    if (idx >= 0 && idx < QUEST_ORDER.length - 1) {
      const nextId = QUEST_ORDER[idx + 1];
      if (!this.activeQuests[nextId] && !this.completedQuests[nextId]) {
        this.activeQuests[nextId] = { progress: 0, completed: false };
      }
    }
  }

  /**
   * Get the first active (non-completed) quest for HUD display.
   */
  getActiveQuest() {
    for (const [questId, state] of Object.entries(this.activeQuests)) {
      if (!state.completed) {
        const def = QUESTS[questId];
        return { ...def, progress: state.progress };
      }
    }
    return null;
  }

  // ─── SAVE / LOAD ───

  getSaveData() {
    return {
      level: this.level,
      xp: this.xp,
      totalXp: this.totalXp,
      bonusMaxHp: this.bonusMaxHp,
      bonusDamagePct: this.bonusDamagePct,
      bonusSpeedPct: this.bonusSpeedPct,
      activeQuests: this.activeQuests,
      completedQuests: this.completedQuests,
      stats: this.stats,
    };
  }

  loadSaveData(data) {
    if (!data) return;
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.totalXp = data.totalXp || 0;
    this.bonusMaxHp = data.bonusMaxHp || 0;
    this.bonusDamagePct = data.bonusDamagePct || 0;
    this.bonusSpeedPct = data.bonusSpeedPct || 0;
    this.activeQuests = data.activeQuests || {};
    this.completedQuests = data.completedQuests || {};
    this.stats = data.stats || this.stats;
    this.xpToNext = getXpToNextLevel(this.level);
    this._ensureActiveQuest();
  }

  /** Repair old saves: ensure there is always an active quest if possible. */
  _ensureActiveQuest() {
    if (this.getActiveQuest()) return; // already have one
    for (const qId of QUEST_ORDER) {
      if (!this.completedQuests[qId]) {
        this.activeQuests[qId] = this.activeQuests[qId] || { progress: 0, completed: false };
        return;
      }
    }
  }

  /**
   * Initialize first quest on new game.
   */
  initNewGame() {
    this.activeQuests['first_steps'] = { progress: 0, completed: false };
  }
}
