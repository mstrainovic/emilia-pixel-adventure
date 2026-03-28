const SAVE_KEY = 'emilia_pixel_adventure_save';

/**
 * Save/Load game state to localStorage.
 */
export class SaveManager {
  constructor() {
    this.autoSaveInterval = 60; // seconds
    this.autoSaveTimer = this.autoSaveInterval;
  }

  save(gameState) {
    const data = {
      version: 3,
      timestamp: Date.now(),
      player: {
        hp: gameState.playerHp,
        scene: gameState.currentScene,
        x: gameState.playerX,
        y: gameState.playerY,
      },
      inventory: gameState.inventorySlots,
      coins: gameState.coins || 0,
      plantsHealed: gameState.plantsHealed,
      unicornUnlocked: gameState.unicornUnlocked,
      progression: gameState.progression,
    };
    data.dayNight = gameState.dayNight || null;
    data.fishCaught = gameState.fishCaught || {};
    data.uniqueCollected = gameState.uniqueCollected || {};
    data.weather = gameState.weather || null;
    data.pet = gameState.pet || null;
    data.explorerBook = gameState.explorerBook || { discovered: [], rewardsClaimed: [] };
    data.achievements = gameState.achievements || [];
    data.bossStates = gameState.bossStates || {};
    data.newGamePlus = gameState.newGamePlus || null;
    data.distanceWalked = gameState.distanceWalked || 0;
    data.bossNoHitKill = gameState.bossNoHitKill || false;
    data.collectedRareFinds = gameState.collectedRareFinds || [];
    data.seenTooltips = gameState.seenTooltips || [];

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed:', e);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data.version !== 1 && data.version !== 2 && data.version !== 3) return null;
      return data;
    } catch (e) {
      console.warn('Load failed:', e);
      return null;
    }
  }

  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  update(dt, getState) {
    this.autoSaveTimer -= dt;
    if (this.autoSaveTimer <= 0) {
      this.autoSaveTimer = this.autoSaveInterval;
      this.save(getState());
    }
  }
}
