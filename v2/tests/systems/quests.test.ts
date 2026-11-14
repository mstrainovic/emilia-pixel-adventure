import { describe, it, expect } from 'vitest';
import { createEmptyGameState, createNewGameState, INVENTORY_SLOTS, type GameState } from '../../src/core/state';
import { QUEST_ORDER } from '../../src/data/quests';
import { countItem } from '../../src/systems/inventory';
import { ensureActiveQuest, reportSignal, currentQuest } from '../../src/systems/quests';

const talk = (target: string) => ({ type: 'talk' as const, target, amount: 1 });

describe('Aufgaben-Grundlogik', () => {
  it('aktiviert im neuen Spiel die erste Aufgabe und ändert beim zweiten Aufruf nichts', () => {
    const s = createNewGameState(0);
    ensureActiveQuest(s);
    expect(s.progression.activeQuests).toEqual({ first_steps: { progress: 0 } });
    expect(ensureActiveQuest(s)).toEqual([]);
    expect(s.progression.activeQuests).toEqual({ first_steps: { progress: 0 } });
    expect(currentQuest(s)!.def.id).toBe('first_steps');
    expect(currentQuest(s)!.progress).toBe(0);
  });

  it('trägt Gespräche ein, ohne fremde Aufgaben zu ändern', () => {
    const s = createNewGameState(0);
    ensureActiveQuest(s);
    expect(reportSignal(s, talk('oma'))).toEqual([]);
    expect(s.progression.stats.npcsSpoken).toContain('oma');
    expect(s.progression.activeQuests).toEqual({ first_steps: { progress: 0 } });
  });

  it('schließt die erste Aufgabe ab: Erfahrung, Beeren, nächste Aufgabe', () => {
    const s = createNewGameState(0);
    ensureActiveQuest(s);
    const changes = reportSignal(s, talk('mama_tanja'));
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ questId: 'first_steps', completed: true, xp: 20, levelsGained: 0 });
    expect(s.progression.completedQuests).toEqual(['first_steps']);
    expect(s.progression.xp).toBe(20);
    expect(countItem(s, 'berry')).toBe(5);
    expect(s.progression.activeQuests).toEqual({ wood_collector: { progress: 0 } });
  });

  it('legt Belohnungen ohne Platz nach pendingItems', () => {
    const s = createNewGameState(0);
    for (let i = 0; i < INVENTORY_SLOTS; i++) s.inventory.slots[i] = { itemId: 'sword_wood', count: 1 };
    ensureActiveQuest(s);
    reportSignal(s, talk('mama_tanja'));
    expect(s.progression.completedQuests).toEqual(['first_steps']);
    expect(s.pendingItems).toEqual([{ itemId: 'berry', count: 5 }]);
  });

  it('belegt aus schon Erlebtem vor und schließt sofort ab', () => {
    const s: GameState = createEmptyGameState(0);
    s.progression.stats.npcsSpoken = ['mama_tanja'];
    const changes = ensureActiveQuest(s);
    expect(changes.map((c) => c.questId)).toEqual(['first_steps']);
    expect(s.progression.completedQuests).toEqual(['first_steps']);
    expect(s.progression.activeQuests).toEqual({ wood_collector: { progress: 0 } });
  });

  it('belegt als Kette vor', () => {
    const s = createEmptyGameState(0);
    s.progression.stats.npcsSpoken = ['mama_tanja'];
    s.progression.stats.itemsCollected = { wood: 9 };
    const changes = ensureActiveQuest(s);
    expect(changes.map((c) => c.questId)).toEqual(['first_steps', 'wood_collector']);
    expect(s.progression.completedQuests).toEqual(['first_steps', 'wood_collector']);
    expect(s.progression.activeQuests).toEqual({ nature_healer: { progress: 0 } });
  });

  it('belegt Teilstand vor (heilen) und zählt weiter', () => {
    const s = createEmptyGameState(0);
    s.progression.completedQuests = ['first_steps', 'wood_collector'];
    s.progression.stats.plantsHealed = 2;
    ensureActiveQuest(s);
    expect(s.progression.activeQuests).toEqual({ nature_healer: { progress: 2 } });
    const changes = reportSignal(s, { type: 'heal', target: 'plant', amount: 1 });
    expect(changes[0]).toMatchObject({ questId: 'nature_healer', completed: true, xp: 40 });
  });

  it('zählt Teilfortschritt und meldet ihn', () => {
    const s = createEmptyGameState(0);
    s.progression.completedQuests = ['first_steps'];
    ensureActiveQuest(s);
    const c = reportSignal(s, { type: 'collect', target: 'wood', amount: 2 });
    expect(c).toEqual([{ questId: 'wood_collector', progress: 2, count: 5, completed: false, xp: 0, levelsGained: 0 }]);
    expect(s.progression.activeQuests.wood_collector).toEqual({ progress: 2 });
    expect(reportSignal(s, { type: 'collect', target: 'stone', amount: 1 })).toEqual([]);
  });

  it('meldet Stufenaufstiege bei Belohnungen', () => {
    const s = createEmptyGameState(0);
    s.progression.completedQuests = ['first_steps', 'wood_collector', 'nature_healer', 'slime_hunter'];
    s.progression.xp = 1000;
    ensureActiveQuest(s);
    const levelBefore = s.progression.level;
    const c = reportSignal(s, { type: 'visit', target: 'lake', amount: 1 });
    expect(c[0]!.xp).toBe(40);
    expect(c[0]!.levelsGained).toBe(s.progression.level - levelBefore);
  });

  it('ignoriert ungültige Mengen', () => {
    const s = createNewGameState(0);
    ensureActiveQuest(s);
    for (const amount of [0, -1, NaN, Infinity]) {
      expect(reportSignal(s, { type: 'talk', target: 'mama_tanja', amount })).toEqual([]);
    }
    expect(s.progression.stats.npcsSpoken).toEqual([]);
    expect(s.progression.completedQuests).toEqual([]);
  });

  it('lässt Kampfaufgaben aktiv, ohne sie zu zählen', () => {
    const s = createEmptyGameState(0);
    s.progression.completedQuests = ['first_steps', 'wood_collector', 'nature_healer'];
    ensureActiveQuest(s);
    expect(s.progression.activeQuests).toEqual({ slime_hunter: { progress: 0 } });
    expect(reportSignal(s, { type: 'collect', target: 'slime', amount: 1 })).toEqual([]);
  });

  it('liefert nach allen 25 Aufgaben nichts mehr', () => {
    const s = createEmptyGameState(0);
    s.progression.completedQuests = [...QUEST_ORDER];
    expect(ensureActiveQuest(s)).toEqual([]);
    expect(s.progression.activeQuests).toEqual({});
    expect(currentQuest(s)).toBeNull();
  });
});
