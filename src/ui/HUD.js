import { getItem } from '../data/items.js';
import { getItemIconDataURL } from '../utils/ItemIcons.js';

export class HUD {
  constructor() {
    this._inventoryOpen = false;

    // Inventory select-and-swap state (RPG-style: click=select, click=swap/move)
    this._selectedSlot = null; // index of selected slot (null = none)
    this._reorderSource = null; // legacy hotbar reorder (kept for number keys)

    // Callback for double-click item use (set by Game.js)
    this.onItemUse = null;

    // Smooth animation state
    this.displayedHp = undefined;
    this.displayedHpTrail = undefined;
    this.displayedXpProgress = undefined;
    this._lastMaxHp = 100;
    this._lowHpPulsing = false;

    // Quest tracker state
    this._currentQuestId = null;
    this._questAnimating = false;
    this._questCompleteTimer = null;

    this.container = document.createElement('div');
    this.container.id = 'hud';
    this.container.innerHTML = `
      <div id="hud-stats-panel">
        <div id="hud-level-badge">Lv.1</div>
        <div id="hud-bars">
          <div id="hud-hp-container">
            <div id="hud-hp-icon">❤️</div>
            <div id="hud-hp-bar-bg"><div id="hud-hp-bar-trail"></div><div id="hud-hp-bar-fill"></div></div>
            <div id="hud-hp-text">100/100</div>
          </div>
          <div id="hud-xp-container">
            <div id="hud-xp-icon">⭐</div>
            <div id="hud-xp-bar-bg"><div id="hud-xp-bar-fill"></div></div>
            <div id="hud-xp-text">0/30</div>
          </div>
        </div>
      </div>
      <div id="hud-coins-display"></div>
      <div id="hud-quest-tracker"></div>
      <div id="hud-info"></div>
      <div id="hud-mute" title="Sound An/Aus">🔊</div>
      <div id="hud-levelup" style="display:none">
        <div id="hud-levelup-text"></div>
      </div>
      <div id="hud-inventory" style="display:none">
        <div id="hud-inventory-header">
          <span id="hud-inventory-title">Inventar</span>
          <div id="hud-inventory-close">X</div>
        </div>
        <div id="hud-inventory-hint">[I] schliessen · Klick = verschieben</div>
        <div id="hud-inventory-grid"></div>
      </div>
      <div id="hud-hotbar"></div>
      <div id="hud-tooltip"></div>
    `;
    document.body.appendChild(this.container);
    this._addStyles();

    // Time indicator
    this.timeIndicator = document.createElement('div');
    this.timeIndicator.style.cssText = `
      position:absolute; top:8px; right:8px;
      font-family:'Press Start 2P',monospace; font-size:10px;
      color:#fff; text-shadow:1px 1px #000;
    `;
    this.container.appendChild(this.timeIndicator);

    // Mute button
    const muteBtn = document.getElementById('hud-mute');
    if (muteBtn) {
      // Set initial state from localStorage
      if (localStorage.getItem('emilia_muted') === 'true') muteBtn.textContent = '🔇';
      muteBtn.addEventListener('click', () => {
        const audio = window.__game?.audio;
        if (audio) {
          const muted = audio.toggleMute();
          muteBtn.textContent = muted ? '🔇' : '🔊';
        }
      });
    }

    // Inventory close button
    const invClose = document.getElementById('hud-inventory-close');
    if (invClose) {
      invClose.addEventListener('click', () => {
        this._inventoryOpen = false;
        const panel = document.getElementById('hud-inventory');
        if (panel) panel.style.display = 'none';
      });
    }
  }

  update(player, dt) {
    // Initialize displayed values on first call
    if (this.displayedHp === undefined) this.displayedHp = player.hp;
    if (this.displayedHpTrail === undefined) this.displayedHpTrail = player.hp;
    this._lastMaxHp = player.maxHp;

    // If dt not provided (legacy calls), just snap instantly
    if (dt === undefined || dt === null) {
      this.displayedHp = player.hp;
      this.displayedHpTrail = player.hp;
    } else {
      const lerpSpeed = 3.0;    // Higher = faster catch-up
      const trailSpeed = 1.5;   // Trail follows slower for dramatic effect

      // Smooth HP bar — lerp toward actual HP
      const hpDiff = player.hp - this.displayedHp;
      this.displayedHp += hpDiff * Math.min(1, lerpSpeed * dt);

      // Snap if very close to avoid perpetual micro-animation
      if (Math.abs(player.hp - this.displayedHp) < 0.1) {
        this.displayedHp = player.hp;
      }

      // Damage trail — follows displayedHp but slower (only on damage, not heal)
      if (this.displayedHpTrail > this.displayedHp) {
        // Trail drains down slowly
        this.displayedHpTrail += (this.displayedHp - this.displayedHpTrail) * Math.min(1, trailSpeed * dt);
        if (Math.abs(this.displayedHpTrail - this.displayedHp) < 0.1) {
          this.displayedHpTrail = this.displayedHp;
        }
      } else {
        // Healing: snap trail up immediately
        this.displayedHpTrail = this.displayedHp;
      }
    }

    // Render HP bar
    const displayPct = Math.max(0, (this.displayedHp / player.maxHp) * 100);
    const trailPct = Math.max(0, (this.displayedHpTrail / player.maxHp) * 100);
    const fill = document.getElementById('hud-hp-bar-fill');
    const trail = document.getElementById('hud-hp-bar-trail');
    const text = document.getElementById('hud-hp-text');

    if (fill) {
      fill.style.width = displayPct + '%';
      fill.style.background = displayPct > 50 ? '#5a9e3a' : displayPct > 25 ? '#cc8a20' : '#cc3333';
    }
    if (trail) {
      trail.style.width = trailPct + '%';
    }

    // Show actual HP as text (not the animated displayed value)
    if (text) text.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

    // Low HP pulse warning (< 25%)
    const hpRatio = player.hp / player.maxHp;
    const hpBarBg = document.getElementById('hud-hp-bar-bg');
    if (hpBarBg) {
      if (hpRatio > 0 && hpRatio < 0.25) {
        if (!this._lowHpPulsing) {
          hpBarBg.classList.add('hud-hp-low-pulse');
          this._lowHpPulsing = true;
        }
      } else {
        if (this._lowHpPulsing) {
          hpBarBg.classList.remove('hud-hp-low-pulse');
          this._lowHpPulsing = false;
        }
      }
    }
  }

  updateTime(phase) {
    const icons = { morning: '\u{1F305}', day: '\u{2600}\u{FE0F}', evening: '\u{1F307}', night: '\u{1F319}' };
    const names = { morning: 'Morgen', day: 'Tag', evening: 'Abend', night: 'Nacht' };
    this.timeIndicator.textContent = `${icons[phase] || ''} ${names[phase] || ''}`;
  }

  updateWeather(type) {
    if (!this._weatherEl) {
      this._weatherEl = document.createElement('div');
      this._weatherEl.style.cssText = 'position:absolute; top:8px; right:120px; font-family:"Press Start 2P",monospace; font-size:10px; color:#fff; text-shadow:1px 1px #000;';
      this.container.appendChild(this._weatherEl);
    }
    const icons = { sunny: '\u2600\uFE0F', rain: '\uD83C\uDF27\uFE0F', fog: '\uD83C\uDF2B\uFE0F', sunbeams: '\u2728' };
    this._weatherEl.textContent = icons[type] || '';
  }

  updateXp(progression) {
    const badge = document.getElementById('hud-level-badge');
    const text = document.getElementById('hud-xp-text');
    if (badge) badge.textContent = `Lv.${progression.level}`;
    if (text) {
      if (progression.level >= 15) text.textContent = 'MAX';
      else text.textContent = `${progression.xp}/${progression.xpToNext}`;
    }

    // Store target XP progress for smooth animation
    this._targetXpProgress = progression.getXpProgress();
    if (this.displayedXpProgress === undefined) {
      this.displayedXpProgress = this._targetXpProgress;
    }

    // On level up, reset displayed XP to 0 so it fills up from start
    if (this._lastXpLevel !== undefined && this._lastXpLevel !== progression.level) {
      this.displayedXpProgress = 0;
    }
    this._lastXpLevel = progression.level;
  }

  updateCoins(coins) {
    const el = document.getElementById('hud-coins-display');
    if (el) {
      el.textContent = `\uD83E\uDE99 ${coins}`;
      el.style.display = coins > 0 ? 'block' : 'none';
    }
  }

  /** Called each frame to animate XP bar smoothly */
  _updateXpBar(dt) {
    if (this._targetXpProgress === undefined || this.displayedXpProgress === undefined) return;

    const lerpSpeed = 3.0;
    const diff = this._targetXpProgress - this.displayedXpProgress;
    this.displayedXpProgress += diff * Math.min(1, lerpSpeed * dt);

    // Snap when close
    if (Math.abs(diff) < 0.001) {
      this.displayedXpProgress = this._targetXpProgress;
    }

    const fill = document.getElementById('hud-xp-bar-fill');
    if (fill) {
      fill.style.width = (this.displayedXpProgress * 100) + '%';
    }
  }

  updateQuest(quest) {
    const tracker = document.getElementById('hud-quest-tracker');
    if (!tracker) return;
    if (!quest) {
      tracker.classList.remove('quest-slide-in');
      tracker.classList.add('quest-slide-out');
      setTimeout(() => { tracker.style.display = 'none'; }, 400);
      this._currentQuestId = null;
      return;
    }

    const isNewQuest = quest.id !== this._currentQuestId;
    const progress = Math.min(quest.progress, quest.count);
    const progressPct = Math.round((progress / quest.count) * 100);
    const isNearComplete = progressPct >= 75 && progressPct < 100;

    // Build quest tracker HTML
    tracker.innerHTML = `
      <div class="quest-header">
        <span class="quest-star">\u2605</span>
        <span class="quest-label">${isNewQuest && this._currentQuestId !== null ? 'Neue Aufgabe!' : 'Aufgabe'}</span>
      </div>
      <div class="quest-title">${quest.name}</div>
      <div class="quest-description">${quest.description}</div>
      <div class="quest-progress-row">
        <div class="quest-progress-bar-bg">
          <div class="quest-progress-bar-fill${isNearComplete ? ' quest-progress-near-complete' : ''}" style="width:${progressPct}%"></div>
        </div>
        <span class="quest-progress-text">${progress}/${quest.count}</span>
      </div>
    `;

    tracker.style.display = 'block';
    tracker.classList.remove('quest-slide-out', 'quest-complete-flash', 'quest-pulse');

    if (isNewQuest) {
      // New quest slide-in animation
      this._currentQuestId = quest.id;
      tracker.classList.remove('quest-slide-in');
      // Force reflow for restart
      void tracker.offsetWidth;
      tracker.classList.add('quest-slide-in');
      // Brief golden border flash for new quest
      tracker.classList.add('quest-new-flash');
      setTimeout(() => tracker.classList.remove('quest-new-flash'), 1200);
    } else if (isNearComplete) {
      // Subtle pulse when nearly complete
      tracker.classList.add('quest-pulse');
    }
  }

  showLevelUp(level, rewards) {
    const el = document.getElementById('hud-levelup');
    if (!el) return;
    let html = `<div class="levelup-title">LEVEL UP!</div><div class="levelup-level">Level ${level}</div>`;
    if (rewards && rewards.length > 0) {
      html += `<div class="levelup-rewards">`;
      for (const r of rewards) html += `<div class="levelup-reward">+ ${r.count}x ${r.itemId}</div>`;
      html += `</div>`;
    }
    el.querySelector('#hud-levelup-text').innerHTML = html;
    el.style.display = 'flex';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 3000);
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  showQuestComplete(questName) {
    this.showInfo(`Quest abgeschlossen: ${questName}!`);

    const tracker = document.getElementById('hud-quest-tracker');
    if (!tracker) return;

    // Clear any pending timers
    if (this._questCompleteTimer) clearTimeout(this._questCompleteTimer);

    // Show completion celebration in the tracker
    tracker.innerHTML = `
      <div class="quest-header quest-complete-header">
        <span class="quest-star quest-star-spin">\u2605</span>
        <span class="quest-label quest-complete-label">Abgeschlossen!</span>
        <span class="quest-checkmark">\u2714</span>
      </div>
      <div class="quest-title quest-complete-title">${questName}</div>
      <div class="quest-sparkles">
        <span class="sparkle sparkle-1">\u2726</span>
        <span class="sparkle sparkle-2">\u2728</span>
        <span class="sparkle sparkle-3">\u2726</span>
        <span class="sparkle sparkle-4">\u2728</span>
        <span class="sparkle sparkle-5">\u2726</span>
        <span class="sparkle sparkle-6">\u2728</span>
        <span class="sparkle sparkle-7">\u2726</span>
        <span class="sparkle sparkle-8">\u2728</span>
      </div>
    `;

    tracker.style.display = 'block';
    tracker.classList.remove('quest-slide-in', 'quest-slide-out', 'quest-pulse', 'quest-new-flash');
    // Flash gold
    void tracker.offsetWidth;
    tracker.classList.add('quest-complete-flash');

    // After 2.5 seconds, slide out and reset for next quest
    this._questCompleteTimer = setTimeout(() => {
      this._questCompleteTimer = null;
      tracker.classList.remove('quest-complete-flash');
      tracker.classList.add('quest-slide-out');
      this._currentQuestId = null;
      setTimeout(() => {
        tracker.style.display = 'none';
        tracker.classList.remove('quest-slide-out');
      }, 400);
    }, 2500);
  }

  updateHotbar(inventory) {
    const bar = document.getElementById('hud-hotbar');
    if (!bar) return;

    const slots = inventory.getHotbarSlots();
    let html = '';
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const selected = i === inventory.selectedHotbar ? ' hud-slot-selected' : '';
      const itemDef = slot.itemId ? getItem(slot.itemId) : null;
      const reorderSrc = i === this._reorderSource ? ' hud-slot-reorder' : '';
      const picked = this._selectedSlot === i ? ' hud-slot-picked' : '';

      html += `<div class="hud-slot${selected}${reorderSrc}${picked}" data-slot="${i}" data-item="${slot.itemId || ''}">`;
      if (itemDef) {
        const iconURL = getItemIconDataURL(slot.itemId);
        html += `<img class="hud-slot-icon" src="${iconURL}" alt="${itemDef.name}" draggable="false">`;
        if (slot.count > 1) {
          html += `<div class="hud-slot-count">${slot.count}</div>`;
        }
      }
      html += `<div class="hud-slot-key">${i + 1}</div>`;
      html += `</div>`;
    }
    bar.innerHTML = html;

    // Mouseover tooltips
    bar.querySelectorAll('.hud-slot').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const itemId = el.getAttribute('data-item');
        if (itemId) {
          const item = getItem(itemId);
          if (item) this._showTooltip(item, e);
        }
      });
      el.addEventListener('mouseleave', () => this._hideTooltip());
      el.addEventListener('mousemove', (e) => {
        const tooltip = document.getElementById('hud-tooltip');
        if (tooltip && tooltip.style.display !== 'none') {
          tooltip.style.left = (e.clientX + 12) + 'px';
          tooltip.style.top = (e.clientY - 40) + 'px';
        }
      });
      // Click: if inventory is open, use unified select-and-swap; otherwise hotbar reorder
      el.addEventListener('click', () => {
        const slotIdx = parseInt(el.getAttribute('data-slot'), 10);
        if (this._inventoryOpen) {
          this._handleInventorySlotClick(inventory, slotIdx);
        } else {
          this._handleHotbarReorderClick(inventory, slotIdx);
        }
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const slotIdx = parseInt(el.getAttribute('data-slot'), 10);
        if (this.onItemUse) this.onItemUse(slotIdx);
      });
    });

    // Keep inventory panel in sync if open
    if (this._inventoryOpen) {
      this.updateInventory(inventory);
    }
  }

  isInventoryOpen() {
    return this._inventoryOpen;
  }

  toggleInventory(inventory) {
    this._inventoryOpen = !this._inventoryOpen;
    const panel = document.getElementById('hud-inventory');
    if (!panel) return;
    if (this._inventoryOpen) {
      panel.style.display = 'flex';
      this.updateInventory(inventory);
    } else {
      panel.style.display = 'none';
    }
  }

  updateInventory(inventory) {
    if (!this._inventoryOpen) return;
    const grid = document.getElementById('hud-inventory-grid');
    if (!grid) return;

    const allSlots = inventory.slots; // 32 slots total
    let html = '';

    for (let i = 0; i < allSlots.length; i++) {
      const slot = allSlots[i];
      const isHotbar = i < 8;
      const isSelected = isHotbar && i === inventory.selectedHotbar;
      const itemDef = slot.itemId ? getItem(slot.itemId) : null;

      let cls = 'hud-inv-slot';
      if (isHotbar) cls += ' hud-inv-slot-hotbar';
      if (isSelected) cls += ' hud-slot-selected';
      if (this._selectedSlot === i) cls += ' hud-slot-picked';

      html += `<div class="${cls}" data-inv-slot="${i}" data-item="${slot.itemId || ''}">`;
      if (isHotbar) {
        html += `<div class="hud-inv-slot-num">${i + 1}</div>`;
      }
      if (itemDef) {
        const iconURL = getItemIconDataURL(slot.itemId);
        html += `<img class="hud-slot-icon" src="${iconURL}" alt="${itemDef.name}" draggable="false">`;
        if (slot.count > 1) {
          html += `<div class="hud-slot-count">${slot.count}</div>`;
        }
      }
      html += `</div>`;
    }

    grid.innerHTML = html;

    // Tooltips and click-to-move for inventory slots
    grid.querySelectorAll('.hud-inv-slot').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const itemId = el.getAttribute('data-item');
        if (itemId) {
          const item = getItem(itemId);
          if (item) this._showTooltip(item, e);
        }
      });
      el.addEventListener('mouseleave', () => this._hideTooltip());
      el.addEventListener('mousemove', (e) => {
        const tooltip = document.getElementById('hud-tooltip');
        if (tooltip && tooltip.style.display !== 'none') {
          tooltip.style.left = (e.clientX + 12) + 'px';
          tooltip.style.top = (e.clientY - 40) + 'px';
        }
      });
      el.addEventListener('click', () => {
        const slotIdx = parseInt(el.getAttribute('data-inv-slot'), 10);
        this._handleInventorySlotClick(inventory, slotIdx);
      });
      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const slotIdx = parseInt(el.getAttribute('data-inv-slot'), 10);
        if (this.onItemUse) this.onItemUse(slotIdx);
      });
    });
  }

  _handleInventorySlotClick(inventory, slotIdx) {
    if (this._selectedSlot === null) {
      // No slot selected yet — select this one (only if it has an item)
      if (!inventory.slots[slotIdx].itemId) return;
      this._selectedSlot = slotIdx;
      this.updateInventory(inventory);
      this.updateHotbar(inventory);
      return;
    }

    // A slot is already selected — perform swap/move
    const srcIdx = this._selectedSlot;
    this._selectedSlot = null;

    if (srcIdx === slotIdx) {
      // Clicked same slot → deselect
      this.updateInventory(inventory);
      this.updateHotbar(inventory);
      return;
    }

    // Swap the two slots (works even when both are full)
    const temp = { ...inventory.slots[slotIdx] };
    inventory.slots[slotIdx] = { ...inventory.slots[srcIdx] };
    inventory.slots[srcIdx] = temp;

    this.updateInventory(inventory);
    this.updateHotbar(inventory);
  }

  /**
   * Click-to-swap hotbar reorder: first click selects, second click swaps.
   */
  _handleHotbarReorderClick(inventory, slotIdx) {
    if (this._reorderSource === null) {
      // First click — select this slot
      this._reorderSource = slotIdx;
      this.updateHotbar(inventory);
    } else if (this._reorderSource === slotIdx) {
      // Clicked same slot — deselect
      this._reorderSource = null;
      this.updateHotbar(inventory);
    } else {
      // Second click — swap with source
      inventory.swapHotbarSlots(this._reorderSource, slotIdx);
      this._reorderSource = null;
      this.updateHotbar(inventory);
    }
  }

  /**
   * Number key hotbar reorder: if a slot is selected for reorder,
   * pressing another number key swaps them. Returns true if handled.
   */
  handleHotbarReorderKey(inventory, keyIndex) {
    if (this._reorderSource === null) {
      return false; // no reorder in progress, let normal selection happen
    }
    if (this._reorderSource === keyIndex) {
      // Same slot — cancel reorder
      this._reorderSource = null;
      this.updateHotbar(inventory);
      return true;
    }
    // Swap slots
    inventory.swapHotbarSlots(this._reorderSource, keyIndex);
    this._reorderSource = null;
    this.updateHotbar(inventory);
    return true;
  }

  _showTooltip(item, event) {
    const tooltip = document.getElementById('hud-tooltip');
    if (!tooltip) return;

    const iconURL = getItemIconDataURL(item.id);
    let desc = '';
    if (item.damage) desc = `\u2694 Schaden: ${item.damage}`;
    else if (item.healAmount) desc = `\u2764 Heilt: ${item.healAmount} HP`;
    else if (item.value) desc = `\u2B50 Wert: ${item.value}`;
    else if (item.category === 'equipment') desc = '\uD83D\uDEE1 Ausruestung';
    else if (item.category === 'resource') desc = 'Rohstoff';
    else if (item.category === 'food') desc = 'Nahrung';
    else if (item.category === 'seed') desc = 'Samen';
    else if (item.category === 'magical') desc = '\u2728 Magisch';
    else if (item.category === 'gem') desc = '\uD83D\uDC8E Edelstein';
    else if (item.category === 'coral') desc = '\uD83E\uDEB8 Koralle';
    else if (item.category === 'rare') desc = '\u2B50 Selten';
    else if (item.category === 'fish') desc = '\uD83D\uDC1F Fisch';
    if (item.sellValue) desc += (desc ? ' | ' : '') + `\uD83E\uDE99 Verkauf: ${item.sellValue}`;

    tooltip.innerHTML = `
      <div class="tooltip-header">
        <img src="${iconURL}" class="tooltip-icon" draggable="false">
        <span class="tooltip-name">${item.name}</span>
      </div>
      ${desc ? `<div class="tooltip-desc">${desc}</div>` : ''}
    `;
    tooltip.style.display = 'block';
    let tx = event.clientX + 12;
    let ty = event.clientY - 40;
    // Keep tooltip on screen
    if (tx + 160 > window.innerWidth) tx = event.clientX - 170;
    if (ty < 0) ty = event.clientY + 12;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';
  }

  _hideTooltip() {
    const tooltip = document.getElementById('hud-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }

  showInfo(text) {
    const info = document.getElementById('hud-info');
    if (info) {
      info.textContent = text;
      info.style.opacity = '1';
      clearTimeout(this._infoTimeout);
      this._infoTimeout = setTimeout(() => { info.style.opacity = '0'; }, 5000);
    }
  }

  updateAchievements(count, total) {
    let el = document.getElementById('hud-achievements');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hud-achievements';
      el.style.cssText = `
        position: fixed; top: 8px; right: 8px;
        color: #FFD700; font-family: 'Press Start 2P', monospace;
        font-size: 8px; z-index: 1000;
        text-shadow: 1px 1px 0 #000;
      `;
      document.body.appendChild(el);
    }
    el.textContent = `\u2605 ${count}/${total}`;
  }

  showNgPlus(cycleCount) {
    let el = document.getElementById('hud-ngplus');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hud-ngplus';
      el.style.cssText = `
        position: fixed; top: 20px; right: 8px;
        color: #FF69B4; font-family: 'Press Start 2P', monospace;
        font-size: 7px; z-index: 1000;
        text-shadow: 1px 1px 0 #000;
      `;
      document.body.appendChild(el);
    }
    el.textContent = `NG+${cycleCount}`;
    el.style.display = 'block';
  }

  _addStyles() {
    if (document.getElementById('hud-styles')) return;
    const style = document.createElement('style');
    style.id = 'hud-styles';
    style.textContent = `
      #hud {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none; z-index: 100;
        font-family: 'Press Start 2P', 'Segoe UI', monospace;
        image-rendering: pixelated;
      }
      #hud-stats-panel {
        position: absolute; top: 10px; left: 10px;
        display: flex; align-items: flex-start; gap: 6px;
        background: rgba(20, 15, 10, 0.75);
        border: 2px solid #8B6914;
        padding: 6px 10px;
        border-radius: 2px;
        box-shadow: 0 2px 0 #4a3608;
      }
      #hud-coins-display {
        position: absolute; top: 52px; left: 10px;
        color: #FFD700; font-size: 9px; font-weight: bold;
        background: rgba(20, 15, 10, 0.75);
        border: 2px solid #8B6914;
        padding: 3px 8px;
        border-radius: 2px;
        box-shadow: 0 2px 0 #4a3608;
        text-shadow: 1px 1px 0 #4a3608;
        display: none;
      }
      #hud-level-badge {
        color: #FFD700; font-size: 10px; font-weight: bold;
        min-width: 38px; text-align: center;
        padding-top: 4px;
        text-shadow: 1px 1px 0 #4a3608;
      }
      #hud-bars { display: flex; flex-direction: column; gap: 3px; }
      #hud-hp-container, #hud-xp-container {
        display: flex; align-items: center; gap: 5px;
      }
      #hud-hp-icon, #hud-xp-icon { font-size: 12px; }
      #hud-mute {
        position: absolute; top: 10px; right: 10px;
        font-size: 20px; cursor: pointer; pointer-events: auto;
        background: rgba(20, 15, 10, 0.7);
        border: 2px solid #8B6914;
        padding: 4px 8px; border-radius: 2px;
        box-shadow: 0 2px 0 #4a3608;
        user-select: none;
        transition: transform 0.1s;
      }
      #hud-mute:hover { transform: scale(1.1); }
      #hud-mute:active { transform: scale(0.95); }
      #hud-hp-bar-bg, #hud-xp-bar-bg {
        width: 120px; height: 10px;
        background: #2a1a0a; border-radius: 1px;
        overflow: hidden;
        border: 1px solid #5a4020;
        position: relative;
      }
      #hud-hp-bar-trail {
        position: absolute; top: 0; left: 0;
        height: 100%; width: 100%;
        background: #cc6644;
        opacity: 0.7;
      }
      #hud-hp-bar-fill {
        position: absolute; top: 0; left: 0;
        height: 100%; width: 100%; background: #5a9e3a;
        box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      #hud-xp-bar-fill {
        height: 100%; width: 0%; background: #4a8acc;
        box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      @keyframes hud-hp-pulse {
        0%, 100% { border-color: #5a4020; box-shadow: none; }
        50% { border-color: #ff3333; box-shadow: 0 0 6px rgba(255, 50, 50, 0.5); }
      }
      .hud-hp-low-pulse {
        animation: hud-hp-pulse 0.8s ease-in-out infinite;
      }
      #hud-hp-text, #hud-xp-text {
        color: #e8d8b0; font-size: 7px;
        min-width: 45px; letter-spacing: 0.5px;
      }
      /* ── Quest Tracker ── */
      #hud-quest-tracker {
        position: absolute; top: 10px; right: 50px;
        background: linear-gradient(135deg, rgba(40,30,20,0.88), rgba(60,45,30,0.88));
        border: 2px solid #8B7355;
        padding: 8px 12px 6px 12px; border-radius: 4px;
        display: none; max-width: 260px; min-width: 180px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        overflow: hidden;
        transform: translateX(0);
        transition: border-color 0.3s, box-shadow 0.3s;
      }
      .quest-header {
        display: flex; align-items: center; gap: 4px;
        margin-bottom: 3px;
      }
      .quest-star {
        color: #FFD700; font-size: 10px;
        text-shadow: 0 0 4px rgba(255,215,0,0.5);
      }
      .quest-label {
        color: #b8a070; font-size: 7px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .quest-title {
        color: #FFD700; font-size: 9px; margin-bottom: 2px;
        text-shadow: 1px 1px 0 #4a3608;
        line-height: 1.3;
      }
      .quest-description {
        color: #DDDDDD; font-size: 7px; line-height: 1.4;
        margin-bottom: 4px;
      }
      .quest-progress-row {
        display: flex; align-items: center; gap: 6px;
      }
      .quest-progress-bar-bg {
        flex: 1; height: 6px;
        background: #2a1a0a;
        border-radius: 1px;
        border: 1px solid #5a4020;
        overflow: hidden;
      }
      .quest-progress-bar-fill {
        height: 100%;
        background: #6a9e4a;
        transition: width 0.4s ease;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      .quest-progress-near-complete {
        background: #c8a030;
        box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 4px rgba(200,160,48,0.4);
      }
      .quest-progress-text {
        color: #b8a070; font-size: 7px;
        min-width: 28px; text-align: right;
      }
      /* Slide-in from right */
      @keyframes quest-slide-in {
        0% { transform: translateX(120%); opacity: 0; }
        70% { transform: translateX(-4px); opacity: 1; }
        100% { transform: translateX(0); opacity: 1; }
      }
      .quest-slide-in {
        animation: quest-slide-in 0.5s ease-out forwards;
      }
      /* Slide-out to right */
      @keyframes quest-slide-out {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(120%); opacity: 0; }
      }
      .quest-slide-out {
        animation: quest-slide-out 0.4s ease-in forwards;
      }
      /* New quest golden border flash */
      @keyframes quest-new-flash {
        0% { border-color: #FFD700; box-shadow: 0 0 12px rgba(255,215,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1); }
        50% { border-color: #FFD700; box-shadow: 0 0 18px rgba(255,215,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1); }
        100% { border-color: #8B7355; box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); }
      }
      .quest-new-flash {
        animation: quest-new-flash 1.2s ease-out forwards;
      }
      /* Nearly complete pulse */
      @keyframes quest-pulse {
        0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); }
        50% { box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 8px rgba(200,160,48,0.3); }
      }
      .quest-pulse {
        animation: quest-pulse 2s ease-in-out infinite;
      }
      /* Quest complete flash */
      @keyframes quest-complete-flash {
        0% { border-color: #FFD700; box-shadow: 0 0 20px rgba(255,215,0,0.7), inset 0 0 10px rgba(255,215,0,0.15); background: linear-gradient(135deg, rgba(80,65,20,0.92), rgba(100,80,30,0.92)); }
        40% { border-color: #FFD700; box-shadow: 0 0 14px rgba(255,215,0,0.5), inset 0 0 6px rgba(255,215,0,0.1); }
        100% { border-color: #8B7355; box-shadow: 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(40,30,20,0.88), rgba(60,45,30,0.88)); }
      }
      .quest-complete-flash {
        animation: quest-complete-flash 2.5s ease-out forwards;
      }
      .quest-complete-header { gap: 5px; }
      .quest-complete-label {
        color: #FFD700 !important; font-size: 8px !important;
        text-shadow: 0 0 6px rgba(255,215,0,0.5);
      }
      .quest-complete-title {
        color: #ffe880 !important;
      }
      .quest-checkmark {
        color: #6ae05a; font-size: 10px;
        text-shadow: 0 0 4px rgba(106,224,90,0.5);
        margin-left: auto;
      }
      /* Star spin on completion */
      @keyframes quest-star-spin {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.4); color: #fff; }
        100% { transform: rotate(360deg) scale(1); }
      }
      .quest-star-spin {
        display: inline-block;
        animation: quest-star-spin 0.8s ease-in-out;
      }
      /* Sparkle confetti */
      .quest-sparkles {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none; overflow: hidden;
      }
      .sparkle {
        position: absolute;
        font-size: 10px;
        opacity: 0;
        animation: sparkle-float 1.8s ease-out forwards;
      }
      .sparkle-1 { left: 10%; top: 50%; animation-delay: 0s; color: #FFD700; }
      .sparkle-2 { left: 25%; top: 30%; animation-delay: 0.1s; color: #ffe880; }
      .sparkle-3 { left: 45%; top: 60%; animation-delay: 0.2s; color: #FFD700; }
      .sparkle-4 { left: 60%; top: 20%; animation-delay: 0.15s; color: #ffd0e0; }
      .sparkle-5 { left: 75%; top: 50%; animation-delay: 0.25s; color: #FFD700; }
      .sparkle-6 { left: 90%; top: 35%; animation-delay: 0.05s; color: #80e0ff; }
      .sparkle-7 { left: 35%; top: 70%; animation-delay: 0.3s; color: #ffe880; }
      .sparkle-8 { left: 80%; top: 65%; animation-delay: 0.18s; color: #FFD700; }
      @keyframes sparkle-float {
        0% { opacity: 0; transform: translateY(0) scale(0.5); }
        20% { opacity: 1; transform: translateY(-6px) scale(1.2); }
        60% { opacity: 0.8; transform: translateY(-16px) scale(1); }
        100% { opacity: 0; transform: translateY(-28px) scale(0.4); }
      }
      #hud-levelup {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none; z-index: 300;
        transition: opacity 0.5s ease;
      }
      #hud-levelup-text {
        text-align: center;
        background: rgba(20, 15, 10, 0.85);
        border: 3px solid #FFD700;
        padding: 20px 40px; border-radius: 4px;
        box-shadow: 0 0 30px rgba(255,215,0,0.3);
      }
      .levelup-title {
        color: #FFD700; font-size: 18px;
        text-shadow: 0 0 10px rgba(255,215,0,0.5);
        margin-bottom: 8px;
      }
      .levelup-level { color: #fff; font-size: 12px; margin-bottom: 8px; }
      .levelup-rewards { margin-top: 8px; }
      .levelup-reward { color: #8fd4a0; font-size: 8px; margin: 3px 0; }
      #hud-info {
        position: absolute; top: 70px; left: 50%; transform: translateX(-50%);
        color: #FFD700; font-size: 10px;
        text-shadow: 1px 1px 0 #4a3608, 2px 2px 4px rgba(0,0,0,0.8);
        opacity: 0; transition: opacity 0.5s ease;
        letter-spacing: 1px;
      }
      #hud-hotbar {
        position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
        display: flex; gap: 3px;
        background: rgba(20, 15, 10, 0.6);
        border: 2px solid #6a5020;
        padding: 4px;
        border-radius: 2px;
      }
      .hud-slot {
        width: 44px; height: 44px;
        background: rgba(40, 30, 15, 0.7);
        border: 2px solid #5a4520;
        border-radius: 1px;
        position: relative;
        pointer-events: auto; cursor: pointer;
      }
      .hud-slot-selected {
        border-color: #FFD700;
        background: rgba(255,215,0,0.12);
        box-shadow: 0 0 6px rgba(255,215,0,0.3);
      }
      .hud-slot-picked {
        border-color: #44FF88 !important;
        background: rgba(68,255,136,0.2) !important;
        box-shadow: 0 0 8px rgba(68,255,136,0.5) !important;
        animation: slotPulse 0.6s ease-in-out infinite alternate;
      }
      @keyframes slotPulse {
        from { box-shadow: 0 0 8px rgba(68,255,136,0.3); }
        to   { box-shadow: 0 0 14px rgba(68,255,136,0.6); }
      }
      .hud-slot-reorder {
        border-color: #44DDFF !important;
        background: rgba(68,221,255,0.15) !important;
        box-shadow: 0 0 10px rgba(68,221,255,0.5) !important;
        animation: hud-reorder-pulse 0.8s ease-in-out infinite;
      }
      @keyframes hud-reorder-pulse {
        0%, 100% { box-shadow: 0 0 6px rgba(68,221,255,0.3); }
        50% { box-shadow: 0 0 14px rgba(68,221,255,0.6); }
      }
      .hud-slot-icon {
        position: absolute; top: 5px; left: 5px;
        width: 26px; height: 26px;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
      .hud-slot-count {
        position: absolute; bottom: 1px; right: 3px;
        color: #fff; font-size: 7px;
        text-shadow: 1px 1px 0 #000;
      }
      .hud-slot-key {
        position: absolute; top: 1px; right: 3px;
        color: rgba(200,180,140,0.4); font-size: 7px;
      }
      #hud-tooltip {
        display: none;
        position: fixed;
        background: rgba(20, 15, 10, 0.95);
        border: 2px solid #8B6914;
        border-radius: 2px;
        padding: 8px 10px;
        z-index: 200;
        pointer-events: none;
        min-width: 100px;
        box-shadow: 0 2px 0 #4a3608;
      }
      .tooltip-header {
        display: flex; align-items: center; gap: 6px;
      }
      .tooltip-icon {
        width: 20px; height: 20px;
        image-rendering: pixelated;
      }
      .tooltip-name {
        color: #FFD700; font-size: 9px;
      }
      .tooltip-desc {
        color: #b8a880; font-size: 7px; margin-top: 4px;
      }

      /* ── Inventory panel ── */
      #hud-inventory {
        position: absolute;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        background: rgba(20, 15, 10, 0.92);
        border: 2px solid #8B6914;
        border-radius: 3px;
        padding: 8px 10px 10px 10px;
        z-index: 150;
        pointer-events: auto;
        box-shadow: 0 4px 0 #4a3608, 0 0 20px rgba(0,0,0,0.6);
        min-width: 400px;
      }
      #hud-inventory-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 2px;
      }
      #hud-inventory-title {
        color: #FFD700;
        font-size: 11px;
        text-shadow: 1px 1px 0 #4a3608;
        letter-spacing: 1px;
      }
      #hud-inventory-close {
        color: #cc6644;
        font-size: 10px;
        cursor: pointer;
        padding: 2px 6px;
        border: 1px solid #cc6644;
        border-radius: 2px;
        background: rgba(60,20,10,0.6);
        transition: background 0.1s;
        user-select: none;
      }
      #hud-inventory-close:hover {
        background: rgba(180,50,20,0.5);
        color: #ff8866;
      }
      #hud-inventory-hint {
        color: rgba(180,160,120,0.6);
        font-size: 7px;
        text-align: center;
        width: 100%;
        margin-bottom: 2px;
      }
      #hud-inventory-grid {
        display: grid;
        grid-template-columns: repeat(8, 44px);
        grid-template-rows: repeat(4, 44px);
        gap: 3px;
      }
      .hud-inv-slot {
        width: 44px; height: 44px;
        background: rgba(40, 30, 15, 0.7);
        border: 2px solid #5a4520;
        border-radius: 1px;
        position: relative;
        cursor: pointer;
        transition: border-color 0.1s, background 0.1s;
      }
      .hud-inv-slot:hover {
        border-color: #a0801a;
        background: rgba(80, 60, 20, 0.7);
      }
      .hud-inv-slot-hotbar {
        border-color: #8B6914;
        background: rgba(50, 38, 12, 0.8);
      }
      .hud-inv-slot-hotbar:hover {
        border-color: #FFD700;
        background: rgba(80, 60, 15, 0.8);
      }
      .hud-inv-slot-num {
        position: absolute; top: 1px; right: 3px;
        color: rgba(255,215,0,0.5); font-size: 7px;
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('hud-styles');
    if (s) s.remove();
  }
}
