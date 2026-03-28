import { getItem } from '../data/items.js';
import { getItemIconDataURL } from '../utils/ItemIcons.js';

/**
 * Trade/Sell UI — opens when talking to Ferdinand the trader NPC.
 * Shows player's sellable inventory items with sell prices.
 * Click item -> confirm -> item removed, coins added.
 */
export class TradeUI {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'trade-container';
    this.container.style.display = 'none';
    this.container.innerHTML = `
      <div id="trade-panel">
        <div id="trade-header">
          <span id="trade-title">Ferdinands Laden</span>
          <span id="trade-coins">0</span>
          <button id="trade-close">\u2715</button>
        </div>
        <div id="trade-hint">Klicke auf ein Item um es zu verkaufen!</div>
        <div id="trade-items"></div>
        <div id="trade-confirm" style="display:none">
          <div id="trade-confirm-text"></div>
          <div id="trade-confirm-qty">
            <button id="trade-qty-minus" class="trade-qty-btn">-</button>
            <span id="trade-qty-value">1</span>
            <button id="trade-qty-plus" class="trade-qty-btn">+</button>
            <button id="trade-qty-all" class="trade-qty-btn">Alles</button>
          </div>
          <div id="trade-confirm-total"></div>
          <div id="trade-confirm-buttons">
            <button id="trade-confirm-yes">Verkaufen!</button>
            <button id="trade-confirm-no">Doch nicht</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
    this._addStyles();

    this.isOpen = false;
    this.inventory = null;
    this._pendingSell = null; // { slotIndex, itemId, sellValue, maxCount, qty }
    this.onSell = null; // callback: (slotIndex, itemId, sellValue) => void

    document.getElementById('trade-close').addEventListener('click', () => this.hide());
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.hide();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) this.hide();
    });

    document.getElementById('trade-confirm-yes').addEventListener('click', () => {
      this._executeSell();
    });
    document.getElementById('trade-confirm-no').addEventListener('click', () => {
      this._cancelSell();
    });
    document.getElementById('trade-qty-minus').addEventListener('click', () => {
      if (!this._pendingSell) return;
      this._pendingSell.qty = Math.max(1, this._pendingSell.qty - 1);
      this._updateQtyDisplay();
    });
    document.getElementById('trade-qty-plus').addEventListener('click', () => {
      if (!this._pendingSell) return;
      this._pendingSell.qty = Math.min(this._pendingSell.maxCount, this._pendingSell.qty + 1);
      this._updateQtyDisplay();
    });
    document.getElementById('trade-qty-all').addEventListener('click', () => {
      if (!this._pendingSell) return;
      this._pendingSell.qty = this._pendingSell.maxCount;
      this._updateQtyDisplay();
    });
  }

  show(inventory) {
    this.isOpen = true;
    this.inventory = inventory;
    this._pendingSell = null;
    this.container.style.display = 'flex';
    this._updateCoinsDisplay();
    this._renderItems();
    document.getElementById('trade-confirm').style.display = 'none';
  }

  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this._pendingSell = null;
  }

  _updateCoinsDisplay() {
    const el = document.getElementById('trade-coins');
    if (el && this.inventory) {
      el.textContent = `\uD83E\uDE99 ${this.inventory.coins} Muenzen`;
    }
  }

  _renderItems() {
    const list = document.getElementById('trade-items');
    if (!list || !this.inventory) return;
    list.innerHTML = '';

    let hasSellable = false;

    for (let i = 0; i < this.inventory.totalSlots; i++) {
      const slot = this.inventory.slots[i];
      if (!slot.itemId || slot.count <= 0) continue;

      const itemDef = getItem(slot.itemId);
      if (!itemDef || !itemDef.sellValue || itemDef.sellValue <= 0) continue;

      hasSellable = true;

      const el = document.createElement('div');
      el.className = 'trade-item';
      const iconURL = getItemIconDataURL(slot.itemId);

      el.innerHTML = `
        <img class="trade-item-icon" src="${iconURL}" draggable="false">
        <div class="trade-item-info">
          <div class="trade-item-name">${itemDef.name}</div>
          <div class="trade-item-count">x${slot.count}</div>
        </div>
        <div class="trade-item-price">\uD83E\uDE99 ${itemDef.sellValue}</div>
      `;

      el.addEventListener('click', () => {
        this._showConfirm(i, slot.itemId, itemDef);
      });

      list.appendChild(el);
    }

    if (!hasSellable) {
      list.innerHTML = '<div class="trade-empty">Du hast nichts zum Verkaufen!</div>';
    }
  }

  _showConfirm(slotIndex, itemId, itemDef) {
    const slot = this.inventory.slots[slotIndex];
    const maxCount = slot.count;
    this._pendingSell = { slotIndex, itemId, sellValue: itemDef.sellValue, maxCount, qty: 1, name: itemDef.name };
    const confirmEl = document.getElementById('trade-confirm');
    const textEl = document.getElementById('trade-confirm-text');
    if (confirmEl && textEl) {
      textEl.textContent = `${itemDef.name} verkaufen?`;
      // Show qty controls only if more than 1
      const qtyRow = document.getElementById('trade-confirm-qty');
      if (qtyRow) qtyRow.style.display = maxCount > 1 ? 'flex' : 'none';
      confirmEl.style.display = 'flex';
      this._updateQtyDisplay();
    }
  }

  _updateQtyDisplay() {
    if (!this._pendingSell) return;
    const { qty, sellValue, maxCount, name } = this._pendingSell;
    const qtyEl = document.getElementById('trade-qty-value');
    if (qtyEl) qtyEl.textContent = qty;
    const totalEl = document.getElementById('trade-confirm-total');
    const total = qty * sellValue;
    if (totalEl) totalEl.textContent = `${qty}x ${name} = ${total} Muenze${total > 1 ? 'n' : ''}`;
  }

  _executeSell() {
    if (!this._pendingSell || !this.inventory) return;

    const { slotIndex, itemId, sellValue, qty } = this._pendingSell;
    const slot = this.inventory.slots[slotIndex];

    // Verify item still exists in that slot
    if (slot.itemId !== itemId || slot.count <= 0) {
      this._cancelSell();
      return;
    }

    // Remove qty items from slot
    const actualQty = Math.min(qty, slot.count);
    slot.count -= actualQty;
    if (slot.count <= 0) {
      slot.itemId = null;
      slot.count = 0;
    }

    // Add coins
    const totalValue = sellValue * actualQty;
    this.inventory.coins += totalValue;

    // Notify callback
    if (this.onSell) {
      this.onSell(slotIndex, itemId, totalValue);
    }

    // Trigger inventory change
    if (this.inventory.onChange) this.inventory.onChange();

    this._pendingSell = null;
    document.getElementById('trade-confirm').style.display = 'none';
    this._updateCoinsDisplay();
    this._renderItems();
  }

  _cancelSell() {
    this._pendingSell = null;
    document.getElementById('trade-confirm').style.display = 'none';
  }

  _addStyles() {
    if (document.getElementById('trade-styles')) return;
    const style = document.createElement('style');
    style.id = 'trade-styles';
    style.textContent = `
      #trade-container {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 300; pointer-events: auto;
      }
      #trade-panel {
        background: rgba(15, 15, 35, 0.95);
        border: 2px solid rgba(255,215,0,0.4);
        border-radius: 16px;
        padding: 20px;
        min-width: 360px; max-width: 450px;
        max-height: 80vh; overflow-y: auto;
        font-family: 'Segoe UI', sans-serif;
      }
      #trade-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 12px; padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        gap: 10px;
      }
      #trade-title {
        color: #FFD700; font-size: 20px; font-weight: bold;
        flex: 1;
      }
      #trade-coins {
        color: #FFD700; font-size: 14px; font-weight: bold;
        background: rgba(255,215,0,0.1);
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid rgba(255,215,0,0.3);
        white-space: nowrap;
      }
      #trade-close {
        background: none; border: none; color: #888; font-size: 20px;
        cursor: pointer; padding: 4px 8px;
      }
      #trade-close:hover { color: #fff; }
      #trade-hint {
        color: #aaa; font-size: 12px; text-align: center;
        margin-bottom: 12px;
      }
      #trade-items {
        display: flex; flex-direction: column; gap: 6px;
        max-height: 320px; overflow-y: auto;
      }
      .trade-item {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .trade-item:hover {
        background: rgba(255,215,0,0.08);
        border-color: rgba(255,215,0,0.3);
      }
      .trade-item-icon {
        width: 32px; height: 32px;
        image-rendering: pixelated;
        border-radius: 6px;
      }
      .trade-item-info {
        flex: 1;
      }
      .trade-item-name {
        color: #fff; font-weight: bold; font-size: 14px;
      }
      .trade-item-count {
        color: #aaa; font-size: 11px;
      }
      .trade-item-price {
        color: #FFD700; font-size: 14px; font-weight: bold;
        white-space: nowrap;
      }
      .trade-empty {
        color: #888; text-align: center; padding: 20px;
        font-size: 14px;
      }
      #trade-confirm {
        display: flex; flex-direction: column; align-items: center;
        gap: 10px; margin-top: 14px;
        padding: 14px;
        background: rgba(255,215,0,0.06);
        border: 1px solid rgba(255,215,0,0.3);
        border-radius: 10px;
      }
      #trade-confirm-text {
        color: #fff; font-size: 14px; text-align: center;
      }
      #trade-confirm-qty {
        display: flex; align-items: center; gap: 6px;
        justify-content: center; margin: 6px 0;
      }
      .trade-qty-btn {
        background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: bold;
        cursor: pointer; transition: background 0.15s;
      }
      .trade-qty-btn:hover { background: rgba(255,215,0,0.2); border-color: rgba(255,215,0,0.4); }
      #trade-qty-value {
        color: #FFD700; font-size: 16px; font-weight: bold;
        min-width: 28px; text-align: center;
      }
      #trade-confirm-total {
        color: #FFD700; font-size: 13px; text-align: center; font-weight: bold;
      }
      #trade-confirm-buttons {
        display: flex; gap: 12px;
      }
      #trade-confirm-yes {
        background: #2a6a2a; color: #fff; border: none; border-radius: 8px;
        padding: 8px 20px; font-size: 14px; font-weight: bold;
        cursor: pointer; transition: background 0.2s;
      }
      #trade-confirm-yes:hover { background: #3a8a3a; }
      #trade-confirm-no {
        background: #6a2a2a; color: #fff; border: none; border-radius: 8px;
        padding: 8px 20px; font-size: 14px; font-weight: bold;
        cursor: pointer; transition: background 0.2s;
      }
      #trade-confirm-no:hover { background: #8a3a3a; }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('trade-styles');
    if (s) s.remove();
  }
}
