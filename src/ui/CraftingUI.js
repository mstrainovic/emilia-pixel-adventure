import { getItem } from '../data/items.js';
import { getItemIconDataURL } from '../utils/ItemIcons.js';

/**
 * Crafting station UI — shows available recipes for a station.
 * HTML overlay with ingredient list, "Herstellen" button, and crafting animation.
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
    this._isCrafting = false; // animation lock

    document.getElementById('crafting-close').addEventListener('click', () => {
      if (!this._isCrafting) this.hide();
    });
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container && !this._isCrafting) this.hide();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen && !this._isCrafting) this.hide();
    });
  }

  show(stationId, stationLabel, recipes, inventory) {
    this.isOpen = true;
    this.currentStation = stationId;
    this.inventory = inventory;
    this._currentRecipes = recipes;
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
      const canCraft = recipe.ingredients.every(ing => {
        if (ing.itemId) return inventory.countItem(ing.itemId) >= ing.count;
        if (ing.category) return !!inventory.findItemByCategory(ing.category);
        return false;
      });
      const resultItem = getItem(recipe.result.itemId);

      // Calculate max craftable amount
      const maxCraft = this._calcMaxCraft(recipe, inventory);

      const el = document.createElement('div');
      el.className = 'craft-recipe' + (canCraft ? '' : ' craft-disabled');
      el.innerHTML = `
        <div class="craft-result">
          <img class="craft-icon" src="${getItemIconDataURL(recipe.result.itemId)}" draggable="false">
          <div class="craft-result-info">
            <div class="craft-result-name">${recipe.name}</div>
            <div class="craft-result-count">&times;${recipe.result.count}</div>
          </div>
        </div>
        <div class="craft-ingredients">
          ${recipe.ingredients.map(ing => {
            const name = ing.itemId ? (getItem(ing.itemId)?.name || ing.itemId) : 'Beliebiger ' + ing.category;
            const has = ing.itemId ? inventory.countItem(ing.itemId) : (inventory.findItemByCategory(ing.category) ? 1 : 0);
            const enough = has >= ing.count;
            return `<span class="craft-ing ${enough ? '' : 'craft-ing-missing'}">
              <img class="craft-ing-icon" src="${getItemIconDataURL(ing.itemId || '')}" draggable="false">
              ${name} ${has}/${ing.count}
            </span>`;
          }).join('')}
        </div>
        ${maxCraft > 1 ? `
        <div class="craft-qty-row">
          <button class="craft-qty-btn craft-qty-minus">-</button>
          <span class="craft-qty-value">1</span>
          <button class="craft-qty-btn craft-qty-plus">+</button>
          <button class="craft-qty-btn craft-qty-max">Max (${maxCraft})</button>
        </div>` : ''}
        <div class="craft-progress-wrap" style="display:none;">
          <div class="craft-progress-bar"></div>
        </div>
        <div class="craft-success-area"></div>
        <button class="craft-btn" ${canCraft ? '' : 'disabled'}>Herstellen${maxCraft > 1 ? ' (1x)' : ''}</button>
      `;

      if (canCraft) {
        let craftQty = 1;
        const btn = el.querySelector('.craft-btn');
        const qtyEl = el.querySelector('.craft-qty-value');
        const updateBtn = () => {
          btn.textContent = `Herstellen (${craftQty}x)`;
        };

        if (maxCraft > 1) {
          el.querySelector('.craft-qty-minus').addEventListener('click', () => {
            craftQty = Math.max(1, craftQty - 1);
            if (qtyEl) qtyEl.textContent = craftQty;
            updateBtn();
          });
          el.querySelector('.craft-qty-plus').addEventListener('click', () => {
            craftQty = Math.min(maxCraft, craftQty + 1);
            if (qtyEl) qtyEl.textContent = craftQty;
            updateBtn();
          });
          el.querySelector('.craft-qty-max').addEventListener('click', () => {
            craftQty = maxCraft;
            if (qtyEl) qtyEl.textContent = craftQty;
            updateBtn();
          });
        }

        btn.addEventListener('click', () => {
          if (this._isCrafting) return;
          this._animatedCraft(recipe, el, craftQty);
        });
      }

      list.appendChild(el);
    }
  }

  _calcMaxCraft(recipe, inventory) {
    let max = 999;
    for (const ing of recipe.ingredients) {
      if (ing.itemId) {
        const have = inventory.countItem(ing.itemId);
        max = Math.min(max, Math.floor(have / ing.count));
      } else if (ing.category) {
        // Category ingredients can only match 1 at a time
        const matchId = inventory.findItemByCategory(ing.category);
        if (matchId) {
          max = Math.min(max, Math.floor(inventory.countItem(matchId) / ing.count));
        } else {
          max = 0;
        }
      }
    }
    return Math.max(0, max);
  }

  /**
   * Animated crafting sequence with batch support.
   */
  async _animatedCraft(recipe, recipeEl, count = 1) {
    this._isCrafting = true;
    const btn = recipeEl.querySelector('.craft-btn');
    const ingredientEls = recipeEl.querySelectorAll('.craft-ing');
    const progressWrap = recipeEl.querySelector('.craft-progress-wrap');
    const progressBar = recipeEl.querySelector('.craft-progress-bar');
    const successArea = recipeEl.querySelector('.craft-success-area');
    const resultIcon = recipeEl.querySelector('.craft-icon');

    // --- Disable all craft buttons during animation ---
    const allBtns = this.container.querySelectorAll('.craft-btn');
    allBtns.forEach(b => b.disabled = true);

    // Step 1: Button text change
    btn.textContent = '...';
    btn.classList.add('craft-btn-active');

    // Step 2: Show progress bar, animate fill over 1.5s
    progressWrap.style.display = 'block';
    // Force reflow so transition starts from 0
    progressBar.style.width = '0%';
    progressBar.offsetWidth; // force reflow
    progressBar.style.width = '100%';

    // Step 3: Fade out ingredient elements
    ingredientEls.forEach((el, i) => {
      el.style.transition = `opacity 0.8s ease ${i * 0.15}s, transform 0.8s ease ${i * 0.15}s`;
      el.style.opacity = '0.2';
      el.style.transform = 'scale(0.7) translateY(-8px)';
    });

    // Step 4: Spawn sparkles around the recipe during wait
    this._spawnSparkles(recipeEl, 1500);

    // Wait for progress animation
    await this._wait(1500);

    // Step 5: Execute actual craft (batch)
    let success = false;
    let totalCrafted = 0;
    if (this.onCraft) {
      for (let i = 0; i < count; i++) {
        if (this.onCraft(recipe)) {
          totalCrafted++;
        } else {
          break; // ran out of materials
        }
      }
      success = totalCrafted > 0;
    }

    // Hide progress bar
    progressWrap.style.display = 'none';
    progressBar.style.width = '0%';

    if (success) {
      // Step 6: Golden sparkle burst
      this._spawnBurst(recipeEl);

      // Step 7: Pop effect on result icon
      if (resultIcon) {
        resultIcon.classList.add('craft-icon-pop');
      }

      // Step 8: Floating success text
      const resultItem = getItem(recipe.result.itemId);
      const itemName = resultItem?.name || recipe.name;
      const totalCount = totalCrafted * recipe.result.count;
      const successText = document.createElement('div');
      successText.className = 'craft-success-text';
      successText.textContent = `+${totalCount} ${itemName}!`;
      successArea.appendChild(successText);

      // Wait for pop + success text to show
      await this._wait(1200);

      // Clean up pop class
      if (resultIcon) resultIcon.classList.remove('craft-icon-pop');
      successArea.innerHTML = '';
    } else {
      // Craft failed — restore ingredient visuals
      ingredientEls.forEach(el => {
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      await this._wait(300);
    }

    // Step 9: Reset and re-render
    btn.textContent = 'Herstellen';
    btn.classList.remove('craft-btn-active');
    this._isCrafting = false;

    // Re-render recipes to update ingredient counts and button states
    if (this._currentRecipes && this.inventory) {
      this._renderRecipes(this._currentRecipes, this.inventory);
    }
  }

  /**
   * Spawn small sparkle particles around a recipe element during crafting.
   */
  _spawnSparkles(parentEl, duration) {
    const sparkleChars = ['\u2728', '\u2b50', '\u2734\ufe0f'];
    const count = 8;
    const interval = duration / count;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('span');
        sparkle.className = 'craft-sparkle';
        sparkle.textContent = sparkleChars[i % sparkleChars.length];
        // Random position within the recipe element
        sparkle.style.left = (Math.random() * 80 + 10) + '%';
        sparkle.style.top = (Math.random() * 60 + 10) + '%';
        parentEl.style.position = 'relative';
        parentEl.appendChild(sparkle);
        // Remove after animation
        setTimeout(() => sparkle.remove(), 800);
      }, i * interval);
    }
  }

  /**
   * Golden burst effect on successful craft.
   */
  _spawnBurst(parentEl) {
    const burstCount = 12;
    parentEl.style.position = 'relative';
    for (let i = 0; i < burstCount; i++) {
      const particle = document.createElement('span');
      particle.className = 'craft-burst-particle';
      const angle = (i / burstCount) * 360;
      particle.style.setProperty('--burst-angle', angle + 'deg');
      particle.style.left = '50%';
      particle.style.top = '30%';
      parentEl.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    }
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        overflow: hidden;
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
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      .craft-ing-missing { color: #ff6666; }
      .craft-ing-icon { width: 16px; height: 16px; image-rendering: pixelated; vertical-align: middle; }
      .craft-ing-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
      .craft-btn {
        background: #2a6a2a; color: #fff; border: none; border-radius: 8px;
        padding: 8px 16px; font-size: 14px; font-weight: bold;
        cursor: pointer; align-self: flex-end;
        transition: background 0.2s ease, transform 0.1s ease;
      }
      .craft-btn:hover:not(:disabled) { background: #3a8a3a; }
      .craft-btn:disabled { background: #333; color: #666; cursor: not-allowed; }
      .craft-btn-active {
        background: #445500 !important;
        color: #FFD700 !important;
      }
      .craft-empty { color: #888; text-align: center; padding: 20px; }
      .craft-qty-row {
        display: flex; align-items: center; gap: 6px;
        justify-content: center; margin: 4px 0;
      }
      .craft-qty-btn {
        background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: bold;
        cursor: pointer; transition: background 0.15s;
      }
      .craft-qty-btn:hover { background: rgba(255,215,0,0.2); border-color: rgba(255,215,0,0.4); }
      .craft-qty-value {
        color: #FFD700; font-size: 16px; font-weight: bold;
        min-width: 28px; text-align: center;
      }

      /* --- Progress bar --- */
      .craft-progress-wrap {
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        overflow: hidden;
      }
      .craft-progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
        border-radius: 3px;
        transition: width 1.5s ease-in-out;
      }

      /* --- Sparkle particles --- */
      .craft-sparkle {
        position: absolute;
        font-size: 14px;
        pointer-events: none;
        animation: craft-sparkle-anim 0.8s ease-out forwards;
        z-index: 10;
      }
      @keyframes craft-sparkle-anim {
        0% { opacity: 1; transform: scale(0.5) translateY(0); }
        50% { opacity: 1; transform: scale(1.2) translateY(-10px); }
        100% { opacity: 0; transform: scale(0.3) translateY(-20px); }
      }

      /* --- Golden burst particles --- */
      .craft-burst-particle {
        position: absolute;
        width: 6px; height: 6px;
        background: #FFD700;
        border-radius: 50%;
        pointer-events: none;
        animation: craft-burst-anim 0.6s ease-out forwards;
        z-index: 10;
        box-shadow: 0 0 6px #FFD700;
      }
      @keyframes craft-burst-anim {
        0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--burst-angle)) translateX(0); }
        100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--burst-angle)) translateX(50px); }
      }

      /* --- Result icon pop --- */
      .craft-icon-pop {
        animation: craft-pop-anim 0.5s ease-out;
      }
      @keyframes craft-pop-anim {
        0% { transform: scale(0.3); opacity: 0.5; }
        60% { transform: scale(1.3); opacity: 1; }
        100% { transform: scale(1.0); opacity: 1; }
      }

      /* --- Floating success text --- */
      .craft-success-text {
        color: #44FF44;
        font-size: 15px;
        font-weight: bold;
        text-align: center;
        text-shadow: 0 0 8px rgba(68, 255, 68, 0.5);
        animation: craft-success-anim 1.2s ease-out forwards;
      }
      @keyframes craft-success-anim {
        0% { opacity: 0; transform: translateY(8px) scale(0.8); }
        20% { opacity: 1; transform: translateY(0) scale(1.1); }
        50% { opacity: 1; transform: translateY(-4px) scale(1.0); }
        100% { opacity: 0; transform: translateY(-16px) scale(0.9); }
      }

      .craft-success-area {
        min-height: 0;
        text-align: center;
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('crafting-styles');
    if (s) s.remove();
  }
}
