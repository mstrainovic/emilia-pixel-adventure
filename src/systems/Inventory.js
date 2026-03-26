import { getItem } from '../data/items.js';

/**
 * Simple inventory with hotbar + main slots.
 */
export class Inventory {
  constructor(hotbarSize = 8, mainRows = 3, mainCols = 8) {
    this.hotbarSize = hotbarSize;
    this.mainRows = mainRows;
    this.mainCols = mainCols;
    this.totalSlots = hotbarSize + mainRows * mainCols;

    // Each slot: { itemId: string|null, count: number }
    this.slots = Array.from({ length: this.totalSlots }, () => ({ itemId: null, count: 0 }));
    this.selectedHotbar = 0; // currently selected hotbar slot
    this.coins = 0; // player currency for trading
    this.onChange = null; // callback when inventory changes
  }

  /**
   * Add item to inventory. Returns amount that couldn't be added.
   */
  addItem(itemId, count = 1) {
    const itemDef = getItem(itemId);
    if (!itemDef) return count;

    let remaining = count;

    // First try to stack with existing slots
    for (let i = 0; i < this.totalSlots && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot.itemId === itemId && slot.count < itemDef.stackSize) {
        const canAdd = Math.min(remaining, itemDef.stackSize - slot.count);
        slot.count += canAdd;
        remaining -= canAdd;
      }
    }

    // Then fill empty slots
    for (let i = 0; i < this.totalSlots && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot.itemId === null) {
        const canAdd = Math.min(remaining, itemDef.stackSize);
        slot.itemId = itemId;
        slot.count = canAdd;
        remaining -= canAdd;
      }
    }

    if (remaining < count && this.onChange) this.onChange();
    return remaining;
  }

  /**
   * Remove item from inventory. Returns true if successful.
   */
  removeItem(itemId, count = 1) {
    let remaining = count;

    // Remove from last slots first (preserve hotbar)
    for (let i = this.totalSlots - 1; i >= 0 && remaining > 0; i--) {
      const slot = this.slots[i];
      if (slot.itemId === itemId) {
        const canRemove = Math.min(remaining, slot.count);
        slot.count -= canRemove;
        remaining -= canRemove;
        if (slot.count <= 0) {
          slot.itemId = null;
          slot.count = 0;
        }
      }
    }

    if (remaining < count && this.onChange) this.onChange();
    return remaining === 0;
  }

  /**
   * Check if player has enough of an item.
   */
  hasItem(itemId, count = 1) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot.itemId === itemId) total += slot.count;
    }
    return total >= count;
  }

  /**
   * Check if item(s) can be added without overflow (read-only).
   */
  canFitItem(itemId, count = 1) {
    const itemDef = getItem(itemId);
    if (!itemDef) return false;
    let remaining = count;
    for (let i = 0; i < this.totalSlots && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot.itemId === itemId && slot.count < itemDef.stackSize) {
        remaining -= Math.min(remaining, itemDef.stackSize - slot.count);
      }
    }
    for (let i = 0; i < this.totalSlots && remaining > 0; i++) {
      if (this.slots[i].itemId === null) {
        remaining -= Math.min(remaining, itemDef.stackSize);
      }
    }
    return remaining <= 0;
  }

  /**
   * Count total of a specific item.
   */
  countItem(itemId) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot.itemId === itemId) total += slot.count;
    }
    return total;
  }

  /**
   * Find the first item in inventory matching a given category.
   * Returns the itemId if found, null otherwise.
   */
  findItemByCategory(category) {
    for (const slot of this.slots) {
      if (slot.itemId) {
        const def = getItem(slot.itemId);
        if (def && def.category === category && slot.count > 0) return slot.itemId;
      }
    }
    return null;
  }

  /**
   * Get the currently selected hotbar item.
   */
  getSelectedItem() {
    const slot = this.slots[this.selectedHotbar];
    return slot.itemId ? { ...getItem(slot.itemId), count: slot.count } : null;
  }

  selectHotbar(index) {
    if (index >= 0 && index < this.hotbarSize) {
      this.selectedHotbar = index;
      if (this.onChange) this.onChange();
    }
  }

  /**
   * Swap two hotbar slots. Used for hotbar reordering.
   */
  swapHotbarSlots(indexA, indexB) {
    if (indexA < 0 || indexA >= this.hotbarSize) return;
    if (indexB < 0 || indexB >= this.hotbarSize) return;
    if (indexA === indexB) return;
    const temp = this.slots[indexA];
    this.slots[indexA] = this.slots[indexB];
    this.slots[indexB] = temp;
    if (this.onChange) this.onChange();
  }

  getHotbarSlots() {
    return this.slots.slice(0, this.hotbarSize);
  }

  getMainSlots() {
    return this.slots.slice(this.hotbarSize);
  }
}
