// src/ui/TutorialTooltips.js
import { getItem } from '../data/items.js';

const TOOLTIPS = [
  { id: 'move',      text: 'WASD zum Laufen, Shift zum Rennen' },
  { id: 'talk',      text: 'Druecke E zum Sprechen' },
  { id: 'heal',      text: 'Druecke F zum Heilen' },
  { id: 'fight',     text: 'Leertaste zum Kaempfen' },
  { id: 'craft',     text: 'Druecke E zum Herstellen' },
  { id: 'fish',      text: 'Druecke F zum Angeln' },
  { id: 'pickup',    text: 'Druecke E zum Aufheben' },
  { id: 'inventory', text: 'Druecke I fuers Inventar' },
];

export class TutorialTooltips {
  constructor() {
    this._seen = new Set();
    this._activeId = null;
    this._idleTimer = 0;

    // Create DOM element — golden speech bubble at bottom-center
    this._el = document.createElement('div');
    this._el.id = 'tutorial-tooltip';
    this._el.style.cssText = `
      position:fixed; bottom:120px; left:50%; transform:translateX(-50%);
      background:rgba(40,30,15,0.92); border:2px solid #8B7355;
      border-radius:6px; padding:10px 18px;
      color:#FFD700; font-family:'Press Start 2P',monospace; font-size:10px;
      max-width:350px; text-align:center; z-index:250;
      pointer-events:none; opacity:0; transition:opacity 0.3s ease;
      box-shadow:0 4px 12px rgba(0,0,0,0.5);
    `;

    // Arrow pointing down
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position:absolute; bottom:-8px; left:50%; transform:translateX(-50%);
      width:0; height:0;
      border-left:8px solid transparent; border-right:8px solid transparent;
      border-top:8px solid #8B7355;
    `;
    this._el.appendChild(arrow);

    // Text node for tooltip content
    this._textNode = document.createElement('span');
    this._el.prepend(this._textNode);

    document.body.appendChild(this._el);
  }

  /**
   * Called every frame from Game._loop().
   * @param {number} dt - Delta time in seconds
   * @param {object} ctx - Game context with player, npcs, mobs, tileMap, inventory, etc.
   */
  update(dt, ctx) {
    // Check dismissal of active tooltip first
    if (this._activeId) {
      if (this._shouldDismiss(this._activeId, ctx)) {
        this.markSeen(this._activeId);
        return;
      }
    }

    // Find highest-priority unseen tooltip whose trigger fires
    for (const tip of TOOLTIPS) {
      if (this._seen.has(tip.id)) continue;
      if (this._activeId === tip.id) break; // already showing this one
      if (this._checkTrigger(tip.id, dt, ctx)) {
        this._show(tip);
        break;
      }
    }
  }

  /**
   * Check whether a tooltip's trigger condition is met.
   * @param {string} id - Tooltip ID
   * @param {number} dt - Delta time in seconds
   * @param {object} ctx - Game context
   * @returns {boolean}
   */
  _checkTrigger(id, dt, ctx) {
    const { player, npcs, mobs, tileMap, inventory, fishing, itemDrops } = ctx;
    const dist = (ax, ay, bx, by) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

    switch (id) {
      case 'move':
        if (!ctx.isNewGame) return false;
        this._idleTimer += dt;
        if (ctx.input.moveX !== 0 || ctx.input.moveY !== 0) this._idleTimer = 0;
        return this._idleTimer > 3;

      case 'talk':
        return npcs?.some(n => dist(player.x, player.y, n.x, n.y) < 2.5);

      case 'heal':
        return tileMap?.props?.some(p =>
          p.type === 'wilted_plant' && dist(player.x, player.y, p.x, p.y) < 2.5
        );

      case 'fight':
        return inventory?.slots.some(s => {
          const item = getItem(s.itemId);
          return item && item.category === 'weapon';
        }) && mobs?.some(m => m.alive && dist(player.x, player.y, m.x, m.y) < 5);

      case 'craft':
        return tileMap?.props?.some(p =>
          p.type === 'station' && dist(player.x, player.y, p.x + 0.5, p.y + 0.5) < 4
        );

      case 'fish':
        return fishing?.fishingSpots?.some(s =>
          dist(player.x, player.y, s.x, s.y) < 2.5
        );

      case 'pickup':
        return itemDrops?.drops?.some(d =>
          dist(player.x, player.y, d.x, d.y) < 2
        );

      case 'inventory': {
        let count = 0;
        if (inventory) {
          for (const s of inventory.slots) {
            if (s.itemId) count++;
          }
        }
        return count >= 5;
      }

      default:
        return false;
    }
  }

  /**
   * Check whether an active tooltip should be dismissed.
   * @param {string} id - Active tooltip ID
   * @param {object} ctx - Game context
   * @returns {boolean}
   */
  _shouldDismiss(id, ctx) {
    switch (id) {
      case 'move':
        return ctx.input.moveX !== 0 || ctx.input.moveY !== 0;
      case 'talk':
        return ctx.dialog?.isActive;
      case 'heal':
        return false; // dismissed by plantHealing callback via markSeen()
      case 'fight':
        return ctx.combat?.isAttacking;
      case 'craft':
        return ctx.crafting?.isActive;
      case 'fish':
        return ctx.fishing?.isActive;
      case 'pickup':
        return false; // dismissed by itemDrop pickup callback via markSeen()
      case 'inventory':
        return ctx.hud?.isInventoryOpen();
      default:
        return false;
    }
  }

  /**
   * Show a tooltip with the given text.
   * @param {{ id: string, text: string }} tip
   */
  _show(tip) {
    this._activeId = tip.id;
    this._textNode.textContent = tip.text;
    this._el.style.opacity = '1';
  }

  /**
   * Hide the currently active tooltip.
   */
  _hide() {
    this._activeId = null;
    this._el.style.opacity = '0';
  }

  /**
   * Mark a tooltip as seen and hide it if it's active.
   * Can be called externally (e.g., from pickup or healing callbacks).
   * @param {string} id - Tooltip ID to mark as seen
   */
  markSeen(id) {
    this._seen.add(id);
    if (this._activeId === id) this._hide();
  }

  /**
   * Load previously seen tooltips from saved state.
   * @param {string[]} seenArray - Array of tooltip IDs that were already seen
   */
  loadState(seenArray) {
    this._seen = new Set(seenArray || []);
  }

  /**
   * Get current state for saving.
   * @returns {string[]} Array of seen tooltip IDs
   */
  getState() {
    return [...this._seen];
  }

  /**
   * Remove DOM element and clean up.
   */
  dispose() {
    if (this._el.parentNode) this._el.remove();
  }
}
