import { HUB_START, type MapId } from '../data/maps';

export const GAME_STATE_VERSION = 1;
export const INVENTORY_SLOTS = 48;
export const HOTBAR_SLOTS = 8;

export interface ProgressionStats {
  mobsKilled: Record<string, number>; itemsCollected: Record<string, number>;
  bossesKilled: Record<string, number>; puzzlesSolved: Record<string, boolean>;
  fishCaught: Record<string, number>; uniqueCollected: Record<string, string[]>;
  npcsSpoken: string[]; grottoZones: string[];
  plantsHealed: number; coralHealed: number; unicornsPetted: number; itemsCrafted: number;
  bookEntries: number; distanceWalked: number; petChosen: boolean; bossNoHitKill: boolean;
}

export interface GameState {
  formatVersion: 1;
  savedAt: number;
  importedLegacyAt: number | null;      // Zeitstempel des alten Stands bei der letzten Übernahme
  legacyDeclinedAt: number | null;      // Zeitstempel des alten Stands, dessen Übernahme abgelehnt wurde
  player: { map: MapId; x: number; y: number; hp: number };   // x/y: Fußpunkt in Kacheln (Gleitkomma); hp in Lebenspunkten, 4 je Herz
  inventory: { slots: Array<{ itemId: string | null; count: number }>; selectedHotbar: number; coins: number };
  progression: {
    level: number; xp: number;
    activeQuests: Record<string, { progress: number }>;
    completedQuests: string[];
    stats: ProgressionStats;
  };
  visitedMaps: MapId[];
  friendship: Record<string, { points: number; lastTalkDay: number; giftsGiven: number }>;
  garden: Array<{ x: number; y: number; seed: string | null; phase: number; timer: number; watered: boolean }>;
  explorerBook: { discovered: string[]; rewardsClaimed: string[] };
  achievements: string[];
  bossesDefeated: string[];
  openedChests: string[];
  collectedRareFinds: string[];
  pet: { type: string; friendship: number; evolved: boolean } | null;
  dayNight: { totalTime: number; phaseIndex: number; phaseTime: number };
  weather: { current: string; timer: number; duration: number };
  seenHints: string[];
  settings: { muted: boolean; difficulty: 'sanft' | 'normal' };
}

/** Frischer Spielstand; nur einfache JSON-Daten, keine geteilten Objekte. */
export function createNewGameState(now: number): GameState {
  return {
    formatVersion: 1,
    savedAt: now,
    importedLegacyAt: null,
    legacyDeclinedAt: null,
    player: { ...HUB_START, hp: 20 },
    inventory: {
      slots: Array.from({ length: INVENTORY_SLOTS }, () => ({ itemId: null, count: 0 })),
      selectedHotbar: 0,
      coins: 0,
    },
    progression: {
      level: 1, xp: 0, activeQuests: {}, completedQuests: [],
      stats: {
        mobsKilled: {}, itemsCollected: {}, bossesKilled: {}, puzzlesSolved: {},
        fishCaught: {}, uniqueCollected: {}, npcsSpoken: [], grottoZones: [],
        plantsHealed: 0, coralHealed: 0, unicornsPetted: 0, itemsCrafted: 0,
        bookEntries: 0, distanceWalked: 0, petChosen: false, bossNoHitKill: false,
      },
    },
    visitedMaps: ['hub'],
    friendship: {},
    garden: [],
    explorerBook: { discovered: [], rewardsClaimed: [] },
    achievements: [],
    bossesDefeated: [],
    openedChests: [],
    collectedRareFinds: [],
    pet: null,
    dayNight: { totalTime: 0, phaseIndex: 1, phaseTime: 0 },
    weather: { current: 'sunny', timer: 0, duration: 300 },
    seenHints: [],
    settings: { muted: false, difficulty: 'sanft' },
  };
}
