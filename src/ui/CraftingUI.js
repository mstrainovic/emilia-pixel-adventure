import { getItem } from '../data/items.js';
import { getItemIconDataURL } from '../utils/ItemIcons.js';

/**
 * Crafting station UI — shows available recipes for a station.
 * HTML overlay with ingredient list and "Herstellen" button.
 */
export class CraftingUI {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'crafting-container';
    this.container.style.display = 'none';
    this.container.innerHTML = `
      <div id="crafting-panel">
        <div id="crafting-header">
          <span id="crafting-title">Werkbank</span>
          <button id="crafting-close">✕</button>
        </div>
        <div id="crafting-recipes"></div>
      </div>
    `;
    document.body.appendChild(this.container);
    this._addStyles();

    this.isOpen = false;
    this.currentStation = null;
    this.inventory = null;
    this.onCraft = null;

    document.getElementById('crafting-close').addEventListener('click', () => this.hide());
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.hide();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) this.hide();
    });
  }

  show(stationId, stationLabel, recipes, inventory) {
    this.isOpen = true;
    this.currentStation = stationId;
    this.inventory = inventory;
    this.container.style.display = 'flex';

    document.getElementById('crafting-title').textContent = stationLabel;
    this._renderRecipes(recipes, inventory);
  }

  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this.currentStation = null;
  }

  _renderRecipes(recipes, inventory) {
    const list = document.getElementById('crafting-recipes');
    list.innerHTML = '';

    if (recipes.length === 0) {
      list.innerHTML = '<div class="craft-empty">Keine Rezepte verfuegbar</div>';
      return;
    }

    for (const recipe of recipes) {
      const canCraft = recipe.ingredients.every(
        ing => inventory.hasItem(ing.itemId, ing.count)
      );
      const resultItem = getItem(recipe.result.itemId);

      const el = document.createElement('div');
      el.className = 'craft-recipe' + (canCraft ? '' : ' craft-disabled');
      el.innerHTML = `
        <div class="craft-result">
          <img class="craft-icon" src="${getItemIconDataURL(recipe.result.itemId)}" draggable="false">
          <div class="craft-result-info">
            <div class="craft-result-name">${recipe.name}</div>
            <div class="craft-result-count">×${recipe.result.count}</div>
          </div>
        </div>
        <div class="craft-ingredients">
          ${recipe.ingredients.map(ing => {
            const item = getItem(ing.itemId);
            const has = inventory.countItem(ing.itemId);
            const enough = has >= ing.count;
            return `<span class="craft-ing ${enough ? '' : 'craft-ing-missing'}">
              <img class="craft-ing-icon" src="${getItemIconDataURL(ing.itemId)}" draggable="false">
              ${item?.name || ing.itemId} ${has}/${ing.count}
            </span>`;
          }).join('')}
        </div>
        <button class="craft-btn" ${canCraft ? '' : 'disabled'}>Herstellen</button>
      `;

      if (canCraft) {
        el.querySelector('.craft-btn').addEventListener('click', () => {
          if (this.onCraft) this.onCraft(recipe);
          // Re-render after crafting
          this._renderRecipes(recipes, inventory);
        });
      }

      list.appendChild(el);
    }
  }

  _addStyles() {
    if (document.getElementById('crafting-styles')) return;
    const style = document.createElement('style');
    style.id = 'crafting-styles';
    style.textContent = `
      #crafting-container {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 300; pointer-events: auto;
      }
      #crafting-panel {
        background: rgba(15, 15, 35, 0.95);
        border: 2px solid rgba(255,215,0,0.4);
        border-radius: 16px;
        padding: 20px;
        min-width: 360px; max-width: 450px;
        max-height: 80vh; overflow-y: auto;
        font-family: 'Segoe UI', sans-serif;
      }
      #crafting-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 16px; padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      #crafting-title { color: #FFD700; font-size: 20px; font-weight: bold; }
      #crafting-close {
        background: none; border: none; color: #888; font-size: 20px;
        cursor: pointer; padding: 4px 8px;
      }
      #crafting-close:hover { color: #fff; }
      .craft-recipe {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 12px; margin-bottom: 8px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .craft-disabled { opacity: 0.5; }
      .craft-result { display: flex; align-items: center; gap: 10px; }
      .craft-icon { width: 32px; height: 32px; border-radius: 6px; image-rendering: pixelated; }
      .craft-result-name { color: #fff; font-weight: bold; font-size: 15px; }
      .craft-result-count { color: #aaa; font-size: 12px; }
      .craft-ingredients { display: flex; flex-wrap: wrap; gap: 6px; }
      .craft-ing {
        color: #aaa; font-size: 12px;
        display: flex; align-items: center; gap: 4px;
        background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;
      }
      .craft-ing-missing { color: #ff6666; }
      .craft-ing-icon { width: 16px; height: 16px; image-rendering: pixelated; vertical-align: middle; }
      .craft-ing-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      .craft-btn {
        background: #2a6a2a; color: #fff; border: none; border-radius: 8px;
        padding: 8px 16px; font-size: 14px; font-weight: bold;
        cursor: pointer; align-self: flex-end;
      }
      .craft-btn:hover:not(:disabled) { background: #3a8a3a; }
      .craft-btn:disabled { background: #333; color: #666; cursor: not-allowed; }
      .craft-empty { color: #888; text-align: center; padding: 20px; }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('crafting-styles');
    if (s) s.remove();
  }
}
