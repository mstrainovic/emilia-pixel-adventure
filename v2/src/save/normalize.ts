// Prüft und repariert einen gespeicherten Stand der Version 1: hartes Minimum, sonst Feld für Feld reparieren.
// Reine Funktion, wirft nie. Auf einem gültigen Stand ist sie die Identität; unbekannte Zusatzfelder bleiben.
import { createNewGameState, INVENTORY_SLOTS, GAME_STATE_VERSION, type GameState } from '../core/state';
import { MAX_LEVEL, HP_PER_HEART, heartsForLevel, xpToNext } from '../core/levels';
import { QUESTS } from '../data/quests';
import { isMapId } from '../data/maps';
import {
  readInventory, readFriendship, readGarden, readPet, readExplorerBook, readWorld,
} from './legacy';
import {
  isObj, keysOf, field, finite, counter, nonNegative, stringList, counterRecord, bossRecord,
  boolRecord, listRecord, type Obj,
} from './legacyRead';

const HUB_START = { map: 'hub' as const, x: 20, y: 15 };
const HOTBAR_MAX = 7;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function repairPlayer(raw: unknown, level: number): GameState['player'] {
  const map = field(raw, 'map');
  const x = finite(field(raw, 'x')); const y = finite(field(raw, 'y'));
  const maxHp = heartsForLevel(level) * HP_PER_HEART;
  const hp = finite(field(raw, 'hp'));
  const base = isMapId(map) && x !== undefined && y !== undefined ? { map, x, y } : HUB_START;
  return { ...base, hp: hp === undefined ? maxHp : clamp(Math.floor(hp), 0, maxHp) };
}

function repairQuests(prog: unknown): Pick<GameState['progression'], 'completedQuests' | 'activeQuests'> {
  const done = stringList(field(prog, 'completedQuests')).filter((id) => Object.hasOwn(QUESTS, id));
  const activeQuests: GameState['progression']['activeQuests'] = {};
  const active = field(prog, 'activeQuests');
  for (const id of keysOf(active)) {
    const progress = finite(field(field(active, id), 'progress'));
    if (Object.hasOwn(QUESTS, id) && !done.includes(id) && progress !== undefined && progress >= 0) {
      activeQuests[id] = { progress: Math.floor(progress) };
    }
  }
  return { completedQuests: done, activeQuests };
}

function repairStats(raw: unknown): GameState['progression']['stats'] {
  const g = (key: string): unknown => field(raw, key);
  return {
    mobsKilled: counterRecord(g('mobsKilled')), itemsCollected: counterRecord(g('itemsCollected')),
    bossesKilled: bossRecord(g('bossesKilled')), puzzlesSolved: boolRecord(g('puzzlesSolved')),
    fishCaught: counterRecord(g('fishCaught')), uniqueCollected: listRecord(g('uniqueCollected')),
    npcsSpoken: stringList(g('npcsSpoken')), grottoZones: stringList(g('grottoZones')),
    plantsHealed: counter(g('plantsHealed')), coralHealed: counter(g('coralHealed')),
    unicornsPetted: counter(g('unicornsPetted')), itemsCrafted: counter(g('itemsCrafted')),
    bookEntries: counter(g('bookEntries')), distanceWalked: nonNegative(g('distanceWalked')),
    petChosen: g('petChosen') === true, bossNoHitKill: g('bossNoHitKill') === true,
  };
}

function repairVisited(raw: unknown, map: GameState['player']['map']): GameState['visitedMaps'] {
  const out: GameState['visitedMaps'] = [];
  for (const id of Array.isArray(raw) ? (raw as unknown[]) : []) {
    if (isMapId(id) && !out.includes(id)) out.push(id);
  }
  if (!out.includes(map)) out.push(map);
  return out;
}

/** Hartes Minimum prüfen, alles andere reparieren. `null`, wenn das Minimum verletzt ist. */
export function normalizeState(raw: unknown): GameState | null {
  if (!isObj(raw) || !Object.hasOwn(raw, 'formatVersion') || raw['formatVersion'] !== GAME_STATE_VERSION) return null;
  const player = field(raw, 'player'); const inventory = field(raw, 'inventory');
  const prog = field(raw, 'progression');
  if (!isObj(player) || !isMapId(player['map'])) return null;
  const slots = field(inventory, 'slots');
  if (!isObj(inventory) || !Array.isArray(slots) || slots.length !== INVENTORY_SLOTS) return null;
  const rawLevel = finite(field(prog, 'level'));
  if (!isObj(prog) || rawLevel === undefined) return null;

  const defaults = createNewGameState(0);   // dient auch als Ablage für die wiederverwendeten Lesehelfer
  const level = clamp(Math.floor(rawLevel), 1, MAX_LEVEL);
  const xp = finite(field(prog, 'xp'));
  const xpMax = level >= MAX_LEVEL ? 0 : xpToNext(level) - 1;
  readInventory(slots, defaults, { droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [] });
  readFriendship(raw['friendship'], defaults);
  readGarden(raw['garden'], defaults);
  readExplorerBook(raw['explorerBook'], defaults);
  readWorld(raw, defaults);
  const repairedPlayer = repairPlayer(player, level);
  const hotbar = finite(inventory['selectedHotbar']);
  const difficulty = field(raw['settings'], 'difficulty');

  const repaired: GameState = {
    formatVersion: GAME_STATE_VERSION,
    savedAt: finite(raw['savedAt']) ?? 0,
    importedLegacyAt: finite(raw['importedLegacyAt']) ?? null,
    player: repairedPlayer,
    inventory: {
      slots: defaults.inventory.slots,
      selectedHotbar: hotbar !== undefined && Number.isInteger(hotbar) && hotbar >= 0 && hotbar <= HOTBAR_MAX ? hotbar : 0,
      coins: counter(inventory['coins']),
    },
    progression: {
      level, xp: xp === undefined ? 0 : clamp(Math.floor(xp), 0, xpMax),
      ...repairQuests(prog), stats: repairStats(field(prog, 'stats')),
    },
    visitedMaps: repairVisited(raw['visitedMaps'], repairedPlayer.map),
    friendship: defaults.friendship,
    garden: defaults.garden,
    explorerBook: defaults.explorerBook,
    achievements: stringList(raw['achievements']),
    bossesDefeated: stringList(raw['bossesDefeated']),
    openedChests: stringList(raw['openedChests']),
    collectedRareFinds: stringList(raw['collectedRareFinds']),
    pet: readPet(raw['pet']),
    dayNight: defaults.dayNight,
    weather: defaults.weather,
    seenHints: stringList(raw['seenHints']),
    settings: {
      muted: field(raw['settings'], 'muted') === true,
      difficulty: difficulty === 'normal' ? 'normal' : 'sanft',
    },
  };
  return { ...(raw as Obj), ...repaired };
}
