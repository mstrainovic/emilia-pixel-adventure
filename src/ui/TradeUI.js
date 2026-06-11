import { getItem } from '../data/items.js';
import { getItemIconDataURL } from '../utils/ItemIcons.js';

/**
 * Shop items Ferdinand sells to the player (buy tab).
 * Prices in coins. Only items that exist in items.js are shown.
 */
const SHOP_STOCK = [
  { itemId: 'heal_potion', price: 8 },
  { itemId: 'veggie_soup', price: 5 },
  { itemId: 'cooked_fish', price: 4 },
  { itemId: 'seed_carrot', price: 2 },
  { itemId: 'seed_tomato', price: 2 },
  { itemId: 'seed_pumpkin', price: 4 },
  { itemId: 'seed_crystal', price: 6 },
  { itemId: 'pet_treat', price: 2 },
];

/**
 * Trade UI — opens when talking to Ferdinand the trader NPC.
 * Two tabs: "Verkaufen" (sell player items) and "Kaufen" (buy from shop).
 * Sell: click item -> confirm -> item removed, coins added.
 * Buy: click item -> coins removed, item added (if enough coins + space).
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
          <button id="trade-close">✕</button>
        </div>
        <div id="trade-tabs">
          <button id="trade-tab-sell" class="trade-tab trade-tab-active">Verkaufen</button>
          <button id="trade-tab-buy" class="trade-tab">Kaufen</button>
        </div>
        <div id="trade-hint">Klicke auf ein Item um es zu verkaufen!</div>
        <div id="trade-items"></div>
        <div id="trade-buy-items" style="display:none"></div>
        <div id="trade-buy-message" style="display:none"></div>
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
    this.activeTab = 'sell'; // 'sell' | 'buy'
    this._pendingSell = null; // { slotIndex, itemId, sellValue, maxCount, qty }
    this._buyMsgTimer = null;
    this.onSell = null; // callback: (slotIndex, itemId, sellValue) => void
    this.onBuy = null; // callback: (itemId, price) => void

    document.getElementById('trade-close').addEventListener('click', () => this.hide());
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.hide();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) this.hide();
    });

    document.getElementById('trade-tab-sell').addEventListener('click', () => this._setTab('sell'));
    document.getElementById('trade-tab-buy').addEventListener('click', () => this._setTab('buy'));

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
    this._setTab(this.activeTab || 'sell');
    document.getElementById('trade-confirm').style.display = 'none';
  }

  /** Alias for show() — same signature, opens the trade window. */
  open(inventory) {
    this.show(inventory);
  }

  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
    this._pendingSell = null;
    this._hideBuyMessage();
  }

  _setTab(tab) {
    this.activeTab = tab;
    this._pendingSell = null;
    this._hideBuyMessage();
    const sellBtn = document.getElementById('trade-tab-sell');
    const buyBtn = document.getElementById('trade-tab-buy');
    const sellList = document.getElementById('trade-items');
    const buyList = document.getElementById('trade-buy-items');
    const confirmEl = document.getElementById('trade-confirm');
    const hintEl = document.getElementById('trade-hint');
    if (confirmEl) confirmEl.style.display = 'none';

    if (tab === 'buy') {
      if (sellBtn) sellBtn.classList.remove('trade-tab-active');
      if (buyBtn) buyBtn.classList.add('trade-tab-active');
      if (sellList) sellList.style.display = 'none';
      if (buyList) buyList.style.display = 'flex';
      if (hintEl) hintEl.textContent = 'Klicke auf eine Ware um sie zu kaufen!';
      this._renderBuyItems();
    } else {
      if (buyBtn) buyBtn.classList.remove('trade-tab-active');
      if (sellBtn) sellBtn.classList.add('trade-tab-active');
      if (buyList) buyList.style.display = 'none';
      if (sellList) sellList.style.display = 'flex';
      if (hintEl) hintEl.textContent = 'Klicke auf ein Item um es zu verkaufen!';
      this._renderItems();
    }
    this._updateCoinsDisplay();
  }

  _updateCoinsDisplay() {
    const el = document.getElementById('trade-coins');
    if (el && this.inventory) {
      el.textContent = `🪙 ${this.inventory.coins} Muenzen`;
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
        <div class="trade-item-price">🪙 ${itemDef.sellValue}</div>
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

  _renderBuyItems() {
    const list = document.getElementById('trade-buy-items');
    if (!list || !this.inventory) return;
    list.innerHTML = '';

    for (const entry of SHOP_STOCK) {
      const itemDef = getItem(entry.itemId);
      if (!itemDef) continue; // skip items that don't exist

      const affordable = this.inventory.coins >= entry.price;

      const el = document.createElement('div');
      el.className = 'trade-item trade-buy-item' + (affordable ? '' : ' trade-buy-poor');
      const iconURL = getItemIconDataURL(entry.itemId);

      el.innerHTML = `
        <img class="trade-item-icon" src="${iconURL}" draggable="false">
        <div class="trade-item-info">
          <div class="trade-item-name">${itemDef.name}</div>
        </div>
        <div class="trade-item-price">🪙 ${entry.price}</div>
      `;

      el.addEventListener('click', () => {
        this._executeBuy(entry, itemDef);
      });

      list.appendChild(el);
    }
  }

  _executeBuy(entry, itemDef) {
    if (!this.inventory) return;

    // Not enough coins -> friendly hint
    if (this.inventory.coins < entry.price) {
      const missing = entry.price - this.inventory.coins;
      this._showBuyMessage(`Du brauchst noch ${missing} Muenze${missing > 1 ? 'n' : ''}!`, 'warn');
      return;
    }

    // Try to add item first — addItem returns the amount that did NOT fit
    const notAdded = this.inventory.addItem(entry.itemId, 1);
    if (notAdded > 0) {
      // Inventory full: do NOT take coins
      this._showBuyMessage('Dein Rucksack ist voll! Mach erst Platz.', 'warn');
      return;
    }

    // Item added — now take coins
    this.inventory.coins -= entry.price;
    this._showBuyMessage(`Gekauft: ${itemDef.name}!`, 'good');

    // Feedback (same style as sell flow in Game.js)
    if (this.onBuy) {
      this.onBuy(entry.itemId, entry.price);
    } else if (window.__game?.audio) {
      window.__game.audio.playUIClick?.();
    }

    // Trigger inventory change (HUD hotbar etc.)
    if (this.inventory.onChange) this.inventory.onChange();

    this._updateCoinsDisplay();
    this._renderBuyItems();
  }

  _showBuyMessage(text, type) {
    const el = document.getElementById('trade-buy-message');
    if (!el) return;
    el.textContent = text;
    el.className = type === 'good' ? 'trade-msg-good' : 'trade-msg-warn';
    el.style.display = 'block';
    if (this._buyMsgTimer) clearTimeout(this._buyMsgTimer);
    this._buyMsgTimer = setTimeout(() => this._hideBuyMessage(), 2500);
  }

  _hideBuyMessage() {
    if (this._buyMsgTimer) {
      clearTimeout(this._buyMsgTimer);
      this._buyMsgTimer = null;
    }
    const el = document.getElementById('trade-buy-message');
    if (el) el.style.display = 'none';
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
      #trade-tabs {
        display: flex; gap: 8px; margin-bottom: 12px;
      }
      .trade-tab {
        flex: 1;
        background: rgba(255,255,255,0.06);
        color: #aaa;
        border: 2px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 10px 0;
        font-size: 17px; font-weight: bold;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
        font-family: inherit;
      }
      .trade-tab:hover {
        background: rgba(255,215,0,0.08);
        color: #fff;
      }
      .trade-tab-active {
        background: rgba(255,215,0,0.15);
        color: #FFD700;
        border-color: rgba(255,215,0,0.5);
      }
      #trade-hint {
        color: #aaa; font-size: 12px; text-align: center;
        margin-bottom: 12px;
      }
      #trade-items, #trade-buy-items {
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
      .trade-buy-poor {
        opacity: 0.55;
      }
      #trade-buy-message {
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 15px; font-weight: bold;
        text-align: center;
      }
      .trade-msg-good {
        color: #8aff8a;
        background: rgba(42,106,42,0.3);
        border: 1px solid rgba(58,138,58,0.6);
      }
      .trade-msg-warn {
        color: #ffd28a;
        background: rgba(120,80,20,0.3);
        border: 1px solid rgba(200,140,40,0.6);
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
