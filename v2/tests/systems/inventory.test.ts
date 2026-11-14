import { describe, it, expect } from 'vitest';
import { createNewGameState, INVENTORY_SLOTS, type GameState } from '../../src/core/state';
import { getItem } from '../../src/data/items';
import { addItem, countItem, hotbarSlots, selectHotbar, deliverPending } from '../../src/systems/inventory';

const BERRY_STACK = getItem('berry')!.stackSize;

/** Alle Plätze mit Steinen füllen (voller Stapel), damit nichts Neues mehr hineinpasst. */
function fillWithStone(state: GameState): void {
  const stack = getItem('stone')!.stackSize;
  state.inventory.slots = state.inventory.slots.map(() => ({ itemId: 'stone', count: stack }));
}

describe('addItem', () => {
  it('neues Spiel: Beeren landen auf Platz 1, Platz 0 hält das Schwert', () => {
    const s = createNewGameState(0);
    expect(addItem(s, 'berry', 5)).toBe(0);
    expect(s.inventory.slots[0]).toEqual({ itemId: 'sword_wood', count: 1 });
    expect(s.inventory.slots[1]).toEqual({ itemId: 'berry', count: 5 });
  });

  it('füllt erst den vorhandenen Stapel, den Rest legt es in den nächsten freien Platz', () => {
    const s = createNewGameState(0);
    s.inventory.slots[1] = { itemId: 'berry', count: BERRY_STACK - 2 };
    expect(addItem(s, 'berry', 5)).toBe(0);
    expect(s.inventory.slots[1]).toEqual({ itemId: 'berry', count: BERRY_STACK });
    expect(s.inventory.slots[2]).toEqual({ itemId: 'berry', count: 3 });
  });

  it('teilt eine große Menge auf mehrere Plätze auf', () => {
    const s = createNewGameState(0);
    expect(addItem(s, 'berry', BERRY_STACK * 2 + 1)).toBe(0);
    expect(s.inventory.slots.slice(1, 4).map((x) => x.count)).toEqual([BERRY_STACK, BERRY_STACK, 1]);
  });

  it('unbekannte Kennung: Rest = count, nichts geändert', () => {
    const s = createNewGameState(0); const before = JSON.stringify(s);
    expect(addItem(s, 'gibt_es_nicht', 4)).toBe(4);
    expect(JSON.stringify(s)).toBe(before);
  });

  it.each([[0], [-3], [1.5], [Number.NaN], [Number.POSITIVE_INFINITY]])('count %s: Rest 0, nichts geändert', (count) => {
    const s = createNewGameState(0); const before = JSON.stringify(s);
    expect(addItem(s, 'berry', count)).toBe(0);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('alle 48 Plätze belegt, kein passender Stapel: Rest = count', () => {
    const s = createNewGameState(0); fillWithStone(s);
    expect(addItem(s, 'berry', 5)).toBe(5);
    expect(countItem(s, 'berry')).toBe(0);
  });

  it('nur ein Teil passt: Rest ist der Überhang', () => {
    const s = createNewGameState(0); fillWithStone(s);
    s.inventory.slots[7] = { itemId: 'berry', count: BERRY_STACK - 2 };
    expect(addItem(s, 'berry', 5)).toBe(3);
    expect(s.inventory.slots[7]).toEqual({ itemId: 'berry', count: BERRY_STACK });
  });

  it('lässt nie einen Platz mit bekannter Kennung und Stückzahl ≤ 0 zurück', () => {
    const s = createNewGameState(0);
    addItem(s, 'berry', 7); addItem(s, 'wood', 150); addItem(s, 'nope', 3); addItem(s, 'berry', 0);
    for (const slot of s.inventory.slots) {
      if (slot.itemId === null) expect(slot.count).toBe(0); else expect(slot.count).toBeGreaterThan(0);
    }
    expect(s.inventory.slots).toHaveLength(INVENTORY_SLOTS);
  });
});

describe('countItem, hotbarSlots, selectHotbar', () => {
  it('countItem zählt über alle Plätze', () => {
    const s = createNewGameState(0);
    addItem(s, 'berry', BERRY_STACK + 4);
    expect(countItem(s, 'berry')).toBe(BERRY_STACK + 4);
    expect(countItem(s, 'sword_wood')).toBe(1);
    expect(countItem(s, 'wood')).toBe(0);
  });

  it('hotbarSlots liefert die Plätze 0–7', () => {
    const s = createNewGameState(0); addItem(s, 'berry', 5);
    const bar = hotbarSlots(s);
    expect(bar).toHaveLength(8);
    expect(bar[0]).toEqual({ itemId: 'sword_wood', count: 1 });
    expect(bar[1]).toEqual({ itemId: 'berry', count: 5 });
    expect(bar[7]).toEqual({ itemId: null, count: 0 });
  });

  it('selectHotbar: gültiger Platz', () => {
    const s = createNewGameState(0);
    expect(selectHotbar(s, 3)).toBe(true);
    expect(s.inventory.selectedHotbar).toBe(3);
  });

  it.each([[8], [-1], [1.5], [Number.NaN]])('selectHotbar(%s): false, unverändert', (index) => {
    const s = createNewGameState(0); selectHotbar(s, 2);
    expect(selectHotbar(s, index)).toBe(false);
    expect(s.inventory.selectedHotbar).toBe(2);
  });
});

describe('deliverPending', () => {
  it('Rucksack voll: false, unverändert', () => {
    const s = createNewGameState(0); fillWithStone(s);
    s.pendingItems = [{ itemId: 'berry', count: 5 }];
    const before = JSON.stringify(s);
    expect(deliverPending(s)).toBe(false);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('ein Platz frei: true, Beeren im Rucksack, pendingItems leer', () => {
    const s = createNewGameState(0); fillWithStone(s);
    s.inventory.slots[9] = { itemId: null, count: 0 };
    s.pendingItems = [{ itemId: 'berry', count: 5 }];
    expect(deliverPending(s)).toBe(true);
    expect(countItem(s, 'berry')).toBe(5);
    expect(s.pendingItems).toEqual([]);
  });

  it('nur ein Teil passt: der Rest bleibt in pendingItems', () => {
    const s = createNewGameState(0); fillWithStone(s);
    s.inventory.slots[9] = { itemId: 'berry', count: BERRY_STACK - 2 };
    s.pendingItems = [{ itemId: 'berry', count: 5 }];
    expect(deliverPending(s)).toBe(true);
    expect(s.inventory.slots[9]!.count).toBe(BERRY_STACK);
    expect(s.pendingItems).toEqual([{ itemId: 'berry', count: 3 }]);
  });

  it('nichts offen: false', () => {
    const s = createNewGameState(0);
    expect(deliverPending(s)).toBe(false);
  });
});
