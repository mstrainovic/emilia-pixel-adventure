import { getAvailableFish, pickRandomFish, FISH_TYPES } from '../data/fish.js';
import { getItem } from '../data/items.js';
import { FishingUI } from '../ui/FishingUI.js';

/**
 * FishingSystem — state-machine minigame for fishing spots.
 *
 * KeyF consumption order:
 *   FishingSystem → PlantHealing → water spray
 * (Called BEFORE PlantHealing in the game loop.)
 *
 * States:
 *   idle      — watching for player near a fishing spot + KeyF press
 *   casting   — short 0.5s cast animation
 *   waiting   — random 2–5s wait for a bite
 *   bite      — 2s window for player to press Space
 *   catching  — timing bar oscillates; Space to land the fish
 *   result    — 1.5s display of catch / miss before returning to idle
 */

const INTERACT_RANGE = 2.5; // tile units
const CAST_DURATION  = 0.5; // s
const WAIT_MIN       = 2.0; // s
const WAIT_MAX       = 5.0; // s
const BITE_WINDOW    = 2.0; // s — how long the Space prompt shows
const CATCH_DURATION = 5.0; // s — timing bar stays active
const CATCH_SPEED    = 1.2; // full bar cycles per second
const GREEN_WIDTH    = 0.40; // 40 % of bar
const RESULT_WAIT    = 1.5; // s after catch/miss before idle

export class FishingSystem {
  constructor() {
    this.ui = new FishingUI();

    /** true while any fishing UI phase is active — blocks player movement */
    this.isActive = false;

    /** Array of {x, y, location} objects set per scene */
    this.fishingSpots = [];

    this.state = 'idle';

    // Internal timer / state for each phase
    this._timer     = 0;
    this._waitTime  = 0;

    // Catching phase
    this._markerPos   = 0;   // 0..1
    this._markerDir   = 1;   // +1 or -1
    this._greenStart  = 0;
    this._greenEnd    = 0;

    // Which fish is on the hook during catching phase
    this._pendingFish = null;

    // Catalogue of fish the player has already caught (id set)
    this._caughtFish = new Set();

    /** Optional callback: (fishId) => void — called when a fish is caught */
    this.onCatch = null;
  }

  /**
   * Set fishing spots for the current scene.
   * @param {Array<{x:number, y:number, location?:string}>} spots
   */
  setSpots(spots) {
    this.fishingSpots = spots || [];
  }

  /**
   * Main update — called every frame BEFORE PlantHealing.
   *
   * @param {number}     dt
   * @param {object}     player      — { x, y }
   * @param {object}     inputManager
   * @param {object}     dayNight    — { timeOfDay: string } or null
   * @param {object}     inventory
   * @param {object}     progression — optional, for XP/reporting
   * @param {object}     hud         — optional, for showInfo()
   */
  update(dt, player, inputManager, dayNight, inventory, progression, hud) {
    switch (this.state) {
      case 'idle':
        this._updateIdle(dt, player, inputManager, dayNight);
        break;
      case 'casting':
        this._updateCasting(dt);
        break;
      case 'waiting':
        this._updateWaiting(dt, player, inputManager);
        break;
      case 'bite':
        this._updateBite(dt, player, inputManager);
        break;
      case 'catching':
        this._updateCatching(dt, player, inputManager, inventory, progression, hud);
        break;
      case 'result':
        this._updateResult(dt);
        break;
    }
  }

  // ─── States ─────────────────────────────────────────────────────────────────

  _updateIdle(dt, player, inputManager, dayNight) {
    if (this.fishingSpots.length === 0) return;

    // Find nearest fishing spot — MUST check proximity BEFORE consuming KeyF
    let nearSpot = null;
    let nearestDist = Infinity;

    for (const spot of this.fishingSpots) {
      const dx = player.x - spot.x;
      const dy = player.y - spot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INTERACT_RANGE && dist < nearestDist) {
        nearSpot = spot;
        nearestDist = dist;
      }
    }

    if (nearSpot && inputManager.justPressed('KeyF')) {
      this._activeSpot = nearSpot;
      this._activeTimeOfDay = dayNight?.timeOfDay || 'day';
      this._toState('casting');
    }
  }

  _updateCasting(dt) {
    this._timer -= dt;
    if (this._timer <= 0) {
      this._toState('waiting');
    }
  }

  _updateWaiting(dt, player, inputManager) {
    this._timer -= dt;
    if (this._timer <= 0) {
      this._toState('bite');
    }
  }

  _updateBite(dt, player, inputManager) {
    this._timer -= dt;

    if (inputManager.justPressed('Space')) {
      // Player reacted in time → move to catching phase
      this._spawnFishForCatch();
      this._toState('catching');
      return;
    }

    if (this._timer <= 0) {
      // Missed the bite window
      this._toMiss('timeout');
    }
  }

  _updateCatching(dt, player, inputManager, inventory, progression, hud) {
    this._timer -= dt;

    // Oscillate marker back and forth
    this._markerPos += this._markerDir * CATCH_SPEED * dt;
    if (this._markerPos >= 1) {
      this._markerPos = 1;
      this._markerDir = -1;
    } else if (this._markerPos <= 0) {
      this._markerPos = 0;
      this._markerDir = 1;
    }

    this.ui.updateBar(this._markerPos, this._greenStart, this._greenEnd);

    if (inputManager.justPressed('Space')) {
      // Check if marker is inside the green zone
      if (this._markerPos >= this._greenStart && this._markerPos <= this._greenEnd) {
        this._doCatch(inventory, progression, hud);
      } else {
        this._toMiss('missed_timing');
      }
      return;
    }

    if (this._timer <= 0) {
      // Ran out of time
      this._toMiss('timeout');
    }
  }

  _updateResult(dt) {
    this._timer -= dt;
    if (this._timer <= 0) {
      this._toState('idle');
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  _toState(next) {
    this.state = next;

    switch (next) {
      case 'idle':
        this.isActive = false;
        this.ui.hide();
        this._activeSpot = null;
        this._pendingFish = null;
        break;

      case 'casting':
        this.isActive = true;
        this._timer = CAST_DURATION;
        this.ui.show('casting');
        break;

      case 'waiting':
        this._timer = WAIT_MIN + Math.random() * (WAIT_MAX - WAIT_MIN);
        this.ui.show('waiting');
        break;

      case 'bite':
        this._timer = BITE_WINDOW;
        this.ui.showBiteIndicator();
        if (window.__game?.audio) window.__game.audio.playItemPickup?.();
        break;

      case 'catching':
        this._timer = CATCH_DURATION;
        // Randomise green zone start position, keeping it fully inside bar
        this._greenStart = Math.random() * (1 - GREEN_WIDTH);
        this._greenEnd   = this._greenStart + GREEN_WIDTH;
        // Place marker at a random edge so the first move goes inward
        this._markerPos  = Math.random() < 0.5 ? 0 : 1;
        this._markerDir  = this._markerPos === 0 ? 1 : -1;
        this.ui.show('catching');
        this.ui.updateBar(this._markerPos, this._greenStart, this._greenEnd);
        break;

      case 'result':
        this._timer = RESULT_WAIT;
        break;
    }
  }

  /** Pick which fish will be on the hook (done at bite phase entry). */
  _spawnFishForCatch() {
    const location = this._activeSpot?.location || 'lake';
    const timeOfDay = this._activeTimeOfDay || 'day';
    const available = getAvailableFish(location, timeOfDay);

    if (available.length === 0) {
      // Fallback — any lake fish
      this._pendingFish = 'goldfish';
      return;
    }
    this._pendingFish = pickRandomFish(available);
  }

  _doCatch(inventory, progression, hud) {
    const fishId   = this._pendingFish || 'goldfish';
    const fishDef  = FISH_TYPES[fishId];
    const itemDef  = getItem(fishId);
    const fishName = fishDef?.name || itemDef?.name || fishId;

    const isNew = !this._caughtFish.has(fishId);
    if (isNew) this._caughtFish.add(fishId);

    // Add to inventory
    if (inventory) {
      inventory.addItem(fishId, 1);
    }

    // XP + reporting
    const xp = fishDef?.rarity === 'very_rare' ? 30
             : fishDef?.rarity === 'rare'      ? 20
             : fishDef?.rarity === 'medium'    ? 12
             :                                    6;

    if (progression) {
      progression.addXp(xp);
      if (progression.reportFish) progression.reportFish(fishId);
      if (progression.reportCatch) progression.reportCatch(fishId);
    }

    if (hud) hud.showInfo(`${fishName} gefangen! +${xp} XP`);

    // Notify external systems (e.g. ExplorerBook)
    if (this.onCatch) this.onCatch(fishId);

    this.ui.showCatch(fishName, isNew);
    this._toState('result');
  }

  _toMiss(reason) {
    this.ui.showMiss();
    this._toState('result');
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  dispose() {
    this.ui.dispose();
    this.fishingSpots = [];
    this.state = 'idle';
    this.isActive = false;
  }
}
