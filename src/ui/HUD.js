import { getItem } from '../data/items.js';
import { getItemIconDataURL } from '../utils/ItemIcons.js';

export class HUD {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'hud';
    this.container.innerHTML = `
      <div id="hud-stats-panel">
        <div id="hud-level-badge">Lv.1</div>
        <div id="hud-bars">
          <div id="hud-hp-container">
            <div id="hud-hp-icon">❤️</div>
            <div id="hud-hp-bar-bg"><div id="hud-hp-bar-fill"></div></div>
            <div id="hud-hp-text">100/100</div>
          </div>
          <div id="hud-xp-container">
            <div id="hud-xp-icon">⭐</div>
            <div id="hud-xp-bar-bg"><div id="hud-xp-bar-fill"></div></div>
            <div id="hud-xp-text">0/30</div>
          </div>
        </div>
      </div>
      <div id="hud-quest-tracker"></div>
      <div id="hud-info"></div>
      <div id="hud-mute" title="Sound An/Aus">🔊</div>
      <div id="hud-levelup" style="display:none">
        <div id="hud-levelup-text"></div>
      </div>
      <div id="hud-hotbar"></div>
      <div id="hud-tooltip"></div>
    `;
    document.body.appendChild(this.container);
    this._addStyles();

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
  }

  update(player) {
    const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
    const fill = document.getElementById('hud-hp-bar-fill');
    const text = document.getElementById('hud-hp-text');
    if (fill) {
      fill.style.width = hpPct + '%';
      fill.style.background = hpPct > 50 ? '#5a9e3a' : hpPct > 25 ? '#cc8a20' : '#cc3333';
    }
    if (text) text.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
  }

  updateXp(progression) {
    const badge = document.getElementById('hud-level-badge');
    const fill = document.getElementById('hud-xp-bar-fill');
    const text = document.getElementById('hud-xp-text');
    if (badge) badge.textContent = `Lv.${progression.level}`;
    if (fill) fill.style.width = (progression.getXpProgress() * 100) + '%';
    if (text) {
      if (progression.level >= 15) text.textContent = 'MAX';
      else text.textContent = `${progression.xp}/${progression.xpToNext}`;
    }
  }

  updateQuest(quest) {
    const tracker = document.getElementById('hud-quest-tracker');
    if (!tracker) return;
    if (!quest) { tracker.style.display = 'none'; return; }
    tracker.style.display = 'block';
    tracker.innerHTML = `
      <div class="quest-title">${quest.name}</div>
      <div class="quest-desc">${quest.description} (${Math.min(quest.progress, quest.count)}/${quest.count})</div>
    `;
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

      html += `<div class="hud-slot${selected}" data-slot="${i}" data-item="${slot.itemId || ''}">`;
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
    });
  }

  _showTooltip(item, event) {
    const tooltip = document.getElementById('hud-tooltip');
    if (!tooltip) return;

    const iconURL = getItemIconDataURL(item.id);
    let desc = '';
    if (item.damage) desc = `Schaden: ${item.damage}`;
    else if (item.healAmount) desc = `Heilt: ${item.healAmount} HP`;
    else desc = item.category === 'resource' ? 'Rohstoff' :
                item.category === 'food' ? 'Nahrung' :
                item.category === 'seed' ? 'Samen' :
                item.category === 'magical' ? 'Magisch' : '';

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
      this._infoTimeout = setTimeout(() => { info.style.opacity = '0'; }, 3000);
    }
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
      }
      #hud-hp-bar-fill {
        height: 100%; width: 100%; background: #5a9e3a;
        transition: width 0.3s ease;
        box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      #hud-xp-bar-fill {
        height: 100%; width: 0%; background: #4a8acc;
        transition: width 0.4s ease;
        box-shadow: inset 0 -2px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
      }
      #hud-hp-text, #hud-xp-text {
        color: #e8d8b0; font-size: 7px;
        min-width: 45px; letter-spacing: 0.5px;
      }
      #hud-quest-tracker {
        position: absolute; top: 10px; right: 50px;
        background: rgba(20, 15, 10, 0.8);
        border: 2px solid #8B6914;
        padding: 8px 14px; border-radius: 2px;
        display: none; max-width: 280px;
        box-shadow: 0 2px 0 #4a3608;
      }
      .quest-title { color: #FFD700; font-size: 11px; margin-bottom: 4px; text-shadow: 1px 1px 0 #4a3608; }
      .quest-desc { color: #d8c8a0; font-size: 9px; line-height: 1.4; }
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
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('hud-styles');
    if (s) s.remove();
  }
}
