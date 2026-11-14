// Rucksack als reine Funktionen über dem Spielstand: keine Szene, kein Speicher, kein Zufall.
// Alt: src/systems/Inventory.js (addItem Zeilen 23–52, selectHotbar Zeilen 143–148).
import { HOTBAR_SLOTS, type GameState } from '../core/state';
import { getItem } from '../data/items';

type Slot = GameState['inventory']['slots'][number];

/**
 * Legt `count` Stück ab und liefert den Rest, der nicht passte.
 * Erst vorhandene Stapel bis `stackSize` füllen, dann leere Plätze von vorn.
 * Unbekannte Kennung: nichts geändert, Rest = `count`. `count` ≤ 0 oder nicht ganzzahlig: nichts geändert, Rest 0.
 */
export function addItem(state: GameState, itemId: string, count: number): number {
  const def = getItem(itemId);
  if (!def) return count;
  if (!Number.isInteger(count) || count <= 0) return 0;

  const slots = state.inventory.slots;
  let remaining = count;
  for (const slot of slots) {
    if (remaining <= 0) break;
    if (slot.itemId !== itemId || slot.count >= def.stackSize) continue;
    const take = Math.min(remaining, def.stackSize - slot.count);
    slot.count += take;
    remaining -= take;
  }
  for (let i = 0; i < slots.length && remaining > 0; i++) {
    if (slots[i]!.itemId !== null) continue;
    const take = Math.min(remaining, def.stackSize);
    slots[i] = { itemId, count: take };
    remaining -= take;
  }
  return remaining;
}

/** Gesamtzahl eines Gegenstands über alle Plätze. */
export function countItem(state: GameState, itemId: string): number {
  let total = 0;
  for (const slot of state.inventory.slots) if (slot.itemId === itemId) total += slot.count;
  return total;
}

/** Die Plätze 0–7 (Schnellleiste). */
export function hotbarSlots(state: GameState): ReadonlyArray<Slot> {
  return state.inventory.slots.slice(0, HOTBAR_SLOTS);
}

/** Wählt einen Platz der Schnellleiste; `false` (und nichts geändert) außerhalb 0–7 oder bei Nicht-Ganzzahl. */
export function selectHotbar(state: GameState, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= HOTBAR_SLOTS) return false;
  state.inventory.selectedHotbar = index;
  return true;
}

/** Legt wartende Belohnungen ab, soweit Platz ist; der Rest bleibt in `pendingItems`. `true`, wenn etwas abgelegt wurde. */
export function deliverPending(state: GameState): boolean {
  let delivered = false;
  const stillWaiting: GameState['pendingItems'] = [];
  for (const entry of state.pendingItems) {
    const rest = addItem(state, entry.itemId, entry.count);
    if (rest < entry.count) delivered = true;
    if (rest > 0) stillWaiting.push({ itemId: entry.itemId, count: rest });
  }
  if (delivered) state.pendingItems = stillWaiting;
  return delivered;
}
