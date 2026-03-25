import { CraftingUI } from '../ui/CraftingUI.js';
import { getRecipesForStation } from '../data/recipes.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Crafting system — player interacts with stations to craft items.
 * Each station is near a family NPC who "operates" it.
 */

const STATION_LABELS = {
  cooking: 'Mama Tanjas Kueche',
  workbench: 'Papa Milos\' Werkbank',
  anvil: 'Amboss',
  sawmill: 'Opas Saege',
  alchemy: 'Dedas Alchemie',
};

export class CraftingSystem {
  constructor(inventory, hud) {
    this.ui = new CraftingUI();
    this.inventory = inventory;
    this.hud = hud;
    this.interactRange = 4.0; // generous range for child-friendly interaction
    this.cooldown = 0;

    // Wire up crafting callback
    this.ui.onCraft = (recipe) => this._doCraft(recipe);
  }

  update(dt, player, tileMap, inputManager) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.ui.isOpen) return;
    if (this.cooldown > 0) return;

    // Find nearest station prop FIRST, only consume E key if station is in range
    if (!tileMap || !tileMap.props) return;

    const stations = tileMap.props.filter(p => p.type === 'station');
    let nearStation = null;
    for (const station of stations) {
      const sx = station.x + (station.w || 1) / 2;
      const sy = station.y + (station.h || 1) / 2;
      const dist = distance(player.x, player.y, sx, sy);
      if (dist < this.interactRange) {
        nearStation = station;
        break;
      }
    }

    if (nearStation && inputManager.justPressed('KeyE')) {
      this._openStation(nearStation.station);
      this.cooldown = 0.5;
    }
  }

  openStation(stationId) {
    const recipes = getRecipesForStation(stationId);
    const label = STATION_LABELS[stationId] || stationId;
    this.ui.show(stationId, label, recipes, this.inventory);
  }

  _openStation(stationId) {
    this.openStation(stationId);
  }

  _doCraft(recipe) {
    // PRE-CHECK: enough space for result?
    if (!this.inventory.canFitItem(recipe.result.itemId, recipe.result.count)) {
      this.hud.showInfo('Inventar voll! Mach zuerst Platz.');
      return;
    }

    // Remove ingredients (safe — space was checked)
    for (const ing of recipe.ingredients) {
      if (ing.itemId) {
        if (!this.inventory.removeItem(ing.itemId, ing.count)) return;
      } else if (ing.category) {
        const matchId = this.inventory.findItemByCategory(ing.category);
        if (!matchId || !this.inventory.removeItem(matchId, ing.count)) {
          this.hud.showInfo('Zutat fehlt!');
          return;
        }
      }
    }

    // Add result (guaranteed to fit)
    this.inventory.addItem(recipe.result.itemId, recipe.result.count);
    this.hud.showInfo(`${recipe.name} hergestellt! +5 XP`);
    if (window.__game?.audio) window.__game.audio.playCraftSuccess();
    if (window.__game?.progression) {
      window.__game.progression.addXp(5);
      window.__game.progression.reportCraft(this.ui.currentStation);
    }
  }

  get isActive() {
    return this.ui.isOpen;
  }

  dispose() {
    this.ui.dispose();
  }
}
