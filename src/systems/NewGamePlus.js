/**
 * New Game+ system.
 * Activated after Shadow Knight defeat.
 * Keeps: inventory, explorer book, achievements, pet
 * Resets: quest progress, mob spawns
 * Modifies: start at level 15, mobs +50%HP +25%DMG +20%XP
 */
export class NewGamePlus {
  constructor() {
    this.active = false;
    this.cycleCount = 0; // how many NG+ cycles completed
  }

  /**
   * Check if NG+ should be offered.
   * @param {object} bossStates - { shadow_knight: { defeated: true } }
   */
  canActivate(bossStates) {
    return bossStates?.shadow_knight?.defeated === true;
  }

  /**
   * Activate New Game+.
   * Returns data to apply to game state.
   */
  activate() {
    this.active = true;
    this.cycleCount++;
    return {
      startLevel: 15,
      mobHpMultiplier: 1.5,
      mobDmgMultiplier: 1.25,
      mobXpMultiplier: 1.2,
    };
  }

  /**
   * Apply NG+ modifiers to a mob definition (non-destructive copy).
   */
  applyToMob(mobDef) {
    if (!this.active) return mobDef;
    return {
      ...mobDef,
      hp: Math.ceil(mobDef.hp * 1.5),
      damage: Math.ceil(mobDef.damage * 1.25),
      xp: Math.ceil(mobDef.xp * 1.2),
    };
  }

  getState() {
    return {
      active: this.active,
      cycleCount: this.cycleCount,
    };
  }

  loadState(state) {
    if (state) {
      this.active = state.active || false;
      this.cycleCount = state.cycleCount || 0;
    }
  }
}
