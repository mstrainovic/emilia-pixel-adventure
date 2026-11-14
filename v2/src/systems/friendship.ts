// Freundschaft als reine Funktionen über dem Spielstand.
// Alt: src/systems/FriendshipSystem.js — Schwellen Zeile 35, Reden +2 (Zeilen 85–91), Aufgabe +10 (Zeilen 126–131), Höchstwert 100.
// Bewusste Abweichung: Das alte Spiel übergab als Tag immer 0 (src/core/Game.js Zeile 278, `this.dayNight?.day || 0` —
// das Feld `day` gibt es nicht), Reden zählte also nur ein einziges Mal. Hier zählt es einmal je Spieltag.
import type { GameState } from '../core/state';
import { QUEST_GIVERS } from '../data/quests';
import { NPCS } from '../data/npcs';

export const FRIEND_THRESHOLDS = [0, 20, 50, 80] as const;
export const TALK_POINTS = 2;
export const QUEST_POINTS = 10;
export const MAX_POINTS = 100;

export type FriendLevel = 0 | 1 | 2 | 3;

export interface FriendChange {
  npcId: string;
  gained: number;
  points: number;
  level: FriendLevel;
  levelUp: boolean;
}

/** „Noch nie geredet“; wie beim Einlesen alter Spielstände (save/legacy.ts), und kleiner als jeder Spieltag. */
const NEVER_TALKED = -1;

export function friendshipLevel(points: number): FriendLevel {
  let level: FriendLevel = 0;
  FRIEND_THRESHOLDS.forEach((threshold, i) => { if (points >= threshold) level = i as FriendLevel; });
  return level;
}

function addPoints(state: GameState, npcId: string, amount: number, day: number | null): FriendChange {
  const entry = state.friendship[npcId] ?? { points: 0, lastTalkDay: NEVER_TALKED, giftsGiven: 0 };
  state.friendship[npcId] = entry;
  const before = entry.points;
  const levelBefore = friendshipLevel(before);
  entry.points = Math.min(MAX_POINTS, before + amount);
  if (day !== null) entry.lastTalkDay = day;
  const level = friendshipLevel(entry.points);
  return { npcId, gained: entry.points - before, points: entry.points, level, levelUp: level > levelBefore };
}

/** Reden: +2, einmal je Spieltag. Unbekannte Kennungen legen nichts an. */
export function talkFriendship(state: GameState, npcId: string, day: number): FriendChange {
  if (!NPCS.some((npc) => npc.id === npcId)) return { npcId, gained: 0, points: 0, level: 0, levelUp: false };
  const entry = state.friendship[npcId];
  if (entry && entry.lastTalkDay === day) {
    return { npcId, gained: 0, points: entry.points, level: friendshipLevel(entry.points), levelUp: false };
  }
  return addPoints(state, npcId, TALK_POINTS, day);
}

/** Aufgabe erledigt: +10 für den Geber der Aufgabe, `null` ohne Geber. */
export function questFriendship(state: GameState, questId: string): FriendChange | null {
  const giver = Object.hasOwn(QUEST_GIVERS, questId) ? QUEST_GIVERS[questId] : undefined;
  return giver === undefined ? null : addPoints(state, giver, QUEST_POINTS, null);
}
