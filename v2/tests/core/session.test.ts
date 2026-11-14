import { describe, it, expect } from 'vitest';
import { GameSession } from '../../src/core/session';
import { EventBus, type GameEvents } from '../../src/core/events';
import { createNewGameState } from '../../src/core/state';
import { NPCS } from '../../src/data/npcs';

function setup() {
  const state = createNewGameState(0);
  const bus = new EventBus<GameEvents>();
  const log: Array<{ type: string; payload: unknown }> = [];
  for (const type of ['npc:talked', 'quest:changed', 'friendship:changed', 'inventory:changed', 'stats:changed'] as const) {
    bus.on(type, (payload) => log.push({ type, payload }));
  }
  const session = new GameSession(state, bus);
  session.start();
  log.length = 0;
  return { state, bus, log, session };
}

describe('GameSession', () => {
  it('start legt die erste Aufgabe an', () => {
    const state = createNewGameState(0);
    const session = new GameSession(state, new EventBus<GameEvents>());
    session.start();
    expect(Object.keys(state.progression.activeQuests)).toEqual(['first_steps']);
  });

  it('start meldet abgelegte wartende Belohnungen', () => {
    const state = createNewGameState(0);
    state.pendingItems.push({ itemId: 'wood', count: 2 });
    const bus = new EventBus<GameEvents>();
    const seen: string[] = [];
    bus.on('inventory:changed', () => seen.push('inventory'));
    new GameSession(state, bus).start();
    expect(seen).toEqual(['inventory']);
    expect(state.pendingItems).toEqual([]);
  });

  it('das erste Gespräch mit Mama meldet die Ereignisse in fester Reihenfolge', () => {
    const { session, log } = setup();
    const view = session.talkTo('mama_tanja');
    expect(view?.name).toBe('Mama Tanja');
    expect(view?.npcId).toBe('mama_tanja');
    expect(view!.lines.length).toBeGreaterThanOrEqual(1);
    expect(view!.lines.length).toBeLessThanOrEqual(2);
    expect(log.map((e) => e.type)).toEqual([
      'npc:talked', 'quest:changed', 'friendship:changed', 'friendship:changed', 'inventory:changed', 'stats:changed',
    ]);
    expect(log[1]!.payload).toMatchObject({ questId: 'first_steps', completed: true });
    expect(log[2]!.payload).toMatchObject({ npcId: 'mama_tanja', gained: 2, points: 2 });
    expect(log[3]!.payload).toMatchObject({ npcId: 'mama_tanja', gained: 10, points: 12 });
  });

  it('unbekannte Kennung: null und keine Ereignisse', () => {
    const { session, log } = setup();
    expect(session.talkTo('niemand')).toBeNull();
    expect(log).toEqual([]);
  });

  it('zweites Gespräch am selben Tag: nächster Satz, keine Freundschaft', () => {
    const { session, log } = setup();
    session.talkTo('mama_tanja');
    log.length = 0;
    const mama = NPCS.find((n) => n.id === 'mama_tanja')!;
    const second = session.talkTo('mama_tanja');
    expect(second!.lines.join(' ')).toBe(mama.dialogs[1]);
    expect(log.map((e) => e.type)).not.toContain('friendship:changed');
    expect(log[0]!.type).toBe('npc:talked');
  });

  it('nach einem Tag zählt das Reden wieder', () => {
    const { session, log } = setup();
    session.talkTo('mama_tanja');
    for (let i = 0; i < 750; i++) session.tick(1);
    log.length = 0;
    session.talkTo('mama_tanja');
    const friend = log.filter((e) => e.type === 'friendship:changed');
    expect(friend).toHaveLength(1);
    expect(friend[0]!.payload).toMatchObject({ gained: 2, points: 14 });
  });

  it('selectHotbar meldet nur eine echte Änderung', () => {
    const { session, log, state } = setup();
    session.selectHotbar(3);
    expect(state.inventory.selectedHotbar).toBe(3);
    expect(log.map((e) => e.type)).toEqual(['inventory:changed']);
    log.length = 0;
    session.selectHotbar(3);
    session.selectHotbar(99);
    expect(log).toEqual([]);
  });

  it('tick legt wartende Belohnungen ab und meldet es einmal', () => {
    const { session, log, state } = setup();
    session.tick(0.1);
    expect(log).toEqual([]);
    state.pendingItems.push({ itemId: 'wood', count: 1 });
    session.tick(0.1);
    expect(log.map((e) => e.type)).toEqual(['inventory:changed']);
    session.tick(0.1);
    expect(log).toHaveLength(1);
  });
});
