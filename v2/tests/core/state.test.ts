import { it, expect } from 'vitest';
import { createNewGameState, GAME_STATE_VERSION, INVENTORY_SLOTS, HOTBAR_SLOTS } from '../../src/core/state';

it('Konstanten', () => {
  expect(GAME_STATE_VERSION).toBe(1); expect(INVENTORY_SLOTS).toBe(48); expect(HOTBAR_SLOTS).toBe(8);
});

it('neues Spiel', () => {
  const s = createNewGameState(1000);
  expect(s.formatVersion).toBe(1); expect(s.savedAt).toBe(1000); expect(s.importedLegacyAt).toBeNull();
  expect(s.player).toEqual({ map: 'hub', x: 19.5, y: 14.5, hp: 20 });
  expect(s.inventory.slots).toHaveLength(48);
  expect(s.inventory.slots[0]).toEqual({ itemId: 'sword_wood', count: 1 });   // Alt: Game.js Zeile 368
  expect(s.inventory.slots.slice(1).every((x) => x.itemId === null && x.count === 0)).toBe(true);
  expect(s.pendingItems).toEqual([]);
  expect(s.progression.level).toBe(1); expect(s.visitedMaps).toEqual(['hub']);
  expect(s.settings).toEqual({ muted: false, difficulty: 'sanft' });
  expect(JSON.parse(JSON.stringify(s))).toEqual(s);   // rein JSON-fähig
});

it('Vorgabewerte der übrigen Felder', () => {
  const s = createNewGameState(5);
  expect(s.inventory.selectedHotbar).toBe(0); expect(s.inventory.coins).toBe(0);
  expect(s.progression.xp).toBe(0);
  expect(s.progression.activeQuests).toEqual({}); expect(s.progression.completedQuests).toEqual([]);
  expect(s.progression.stats.distanceWalked).toBe(0); expect(s.progression.stats.petChosen).toBe(false);
  expect(s.pet).toBeNull(); expect(s.friendship).toEqual({}); expect(s.garden).toEqual([]);
  expect(s.explorerBook).toEqual({ discovered: [], rewardsClaimed: [] });
  expect(s.dayNight).toEqual({ totalTime: 0, phaseIndex: 1, phaseTime: 0 });
  expect(s.weather).toEqual({ current: 'sunny', timer: 0, duration: 300 });
});

it('Aufrufe teilen keine Objekte', () => {
  const a = createNewGameState(1); const b = createNewGameState(1);
  a.visitedMaps.push('hub'); a.inventory.slots[0]!.count = 3; a.pendingItems.push({ itemId: 'berry', count: 1 });
  expect(b.visitedMaps).toEqual(['hub']); expect(b.inventory.slots[0]!.count).toBe(1); expect(b.pendingItems).toEqual([]);
});
