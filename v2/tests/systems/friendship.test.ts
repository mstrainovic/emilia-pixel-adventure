import { describe, it, expect } from 'vitest';
import { createNewGameState } from '../../src/core/state';
import {
  FRIEND_THRESHOLDS, MAX_POINTS, QUEST_POINTS, TALK_POINTS, friendshipLevel, questFriendship, talkFriendship,
} from '../../src/systems/friendship';

describe('Freundschaftsstufen', () => {
  it('hat die Werte des alten Spiels', () => {
    expect([...FRIEND_THRESHOLDS]).toEqual([0, 20, 50, 80]);
    expect([TALK_POINTS, QUEST_POINTS, MAX_POINTS]).toEqual([2, 10, 100]);
  });

  it.each([[0, 0], [19, 0], [20, 1], [49, 1], [50, 2], [79, 2], [80, 3], [100, 3]])('%i Punkte → Stufe %i', (p, l) => {
    expect(friendshipLevel(p)).toBe(l);
  });
});

describe('Reden', () => {
  it('neuer Dorfbewohner am Tag 0: +2, merkt sich den Tag', () => {
    const s = createNewGameState(0);
    expect(talkFriendship(s, 'opa', 0)).toEqual({ npcId: 'opa', gained: 2, points: 2, level: 0, levelUp: false });
    expect(s.friendship['opa']).toEqual({ points: 2, lastTalkDay: 0, giftsGiven: 0 });
  });

  it('am selben Tag nur einmal', () => {
    const s = createNewGameState(0);
    talkFriendship(s, 'opa', 0);
    const again = talkFriendship(s, 'opa', 0);
    expect(again.gained).toBe(0);
    expect(again.points).toBe(2);
    expect(s.friendship['opa']?.points).toBe(2);
  });

  it('am nächsten Tag wieder', () => {
    const s = createNewGameState(0);
    talkFriendship(s, 'opa', 0);
    expect(talkFriendship(s, 'opa', 1).points).toBe(4);
  });

  it('jeder Dorfbewohner zählt für sich', () => {
    const s = createNewGameState(0);
    talkFriendship(s, 'opa', 0);
    expect(talkFriendship(s, 'mama_tanja', 0).gained).toBe(2);
  });

  it('von 18 auf 20 steigt die Stufe', () => {
    const s = createNewGameState(0);
    s.friendship['opa'] = { points: 18, lastTalkDay: -1, giftsGiven: 3 };
    const r = talkFriendship(s, 'opa', 5);
    expect(r).toMatchObject({ gained: 2, points: 20, level: 1, levelUp: true });
    expect(s.friendship['opa']?.giftsGiven).toBe(3);
  });

  it('bei 99 gewinnt sie nur 1, bei 100 nichts', () => {
    const s = createNewGameState(0);
    s.friendship['opa'] = { points: 99, lastTalkDay: -1, giftsGiven: 0 };
    expect(talkFriendship(s, 'opa', 1)).toMatchObject({ gained: 1, points: 100 });
    expect(talkFriendship(s, 'opa', 2)).toMatchObject({ gained: 0, points: 100, levelUp: false });
  });

  it('eine unbekannte Kennung legt nichts an', () => {
    const s = createNewGameState(0);
    expect(talkFriendship(s, 'gibts_nicht', 0)).toEqual({ npcId: 'gibts_nicht', gained: 0, points: 0, level: 0, levelUp: false });
    expect(s.friendship['gibts_nicht']).toBeUndefined();
  });
});

describe('Aufgaben', () => {
  it('first_steps gibt Mama Tanja +10', () => {
    const s = createNewGameState(0);
    expect(questFriendship(s, 'first_steps')).toEqual({ npcId: 'mama_tanja', gained: 10, points: 10, level: 0, levelUp: false });
    expect(s.friendship['mama_tanja']?.lastTalkDay).toBe(-1);
  });

  it('meldet den Stufenaufstieg und kappt bei 100', () => {
    const s = createNewGameState(0);
    s.friendship['mama_tanja'] = { points: 15, lastTalkDay: 0, giftsGiven: 0 };
    expect(questFriendship(s, 'first_steps')).toMatchObject({ points: 25, level: 1, levelUp: true });
    s.friendship['mama_tanja']!.points = 95;
    expect(questFriendship(s, 'first_steps')).toMatchObject({ gained: 5, points: 100 });
  });

  it('ohne Geber null und nichts angelegt', () => {
    const s = createNewGameState(0);
    expect(questFriendship(s, 'gibt_es_nicht')).toBeNull();
    expect(s.friendship).toEqual({});
  });
});
