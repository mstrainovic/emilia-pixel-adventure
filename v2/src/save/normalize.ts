// Prüft und repariert einen gespeicherten Stand der Version 1: hartes Minimum, sonst Feld für Feld reparieren.
// Reine Funktion, wirft nie. Auf einem gültigen Stand ist sie die Identität; unbekannte Zusatzfelder bleiben.
import { createNewGameState, INVENTORY_SLOTS, GAME_STATE_VERSION, type GameState } from '../core/state';
import { MAX_LEVEL, HP_PER_HEART, heartsForLevel, xpToNext } from '../core/levels';
import { QUESTS } from '../data/quests';
import { isMapId, HUB_START } from '../data/maps';
import {
  readInventory, readFriendship, readGarden, readPet, readExplorerBook, readWorld, type MigrationReport,
} from './legacy';
import {
  isObj, keysOf, field, finite, counter, nonNegative, stringList, counterRecord, bossRecord,
  boolRecord, listRecord, type Obj,
} from './legacyRead';

const HOTBAR_MAX = 7;

/** Was beim Reparieren geändert wurde; `lossy` heißt: es ist etwas Echtes verloren gegangen. */
export interface RepairReport {
  droppedItems: Array<{ itemId: string; count: number }>;
  droppedQuests: string[];
  relocated: boolean;          // Karte oder Position ungültig → Startpunkt
  resizedInventory: boolean;   // Platzzahl war nicht 48
  lossy: boolean;              // droppedItems oder droppedQuests nicht leer
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function repairPlayer(raw: unknown, level: number): { player: GameState['player']; relocated: boolean } {
  const map = field(raw, 'map');
  const x = finite(field(raw, 'x')); const y = finite(field(raw, 'y'));
  const maxHp = heartsForLevel(level) * HP_PER_HEART;
  const hp = finite(field(raw, 'hp'));
  const valid = isMapId(map) && x !== undefined && y !== undefined;
  const base = valid ? { map, x, y } : HUB_START;
  const repaired = { ...base, hp: hp === undefined ? maxHp : clamp(Math.floor(hp), 0, maxHp) };
  return { player: repaired, relocated: !valid };
}

function repairQuests(prog: unknown): {
  quests: Pick<GameState['progression'], 'completedQuests' | 'activeQuests'>; dropped: string[];
} {
  const rawDone = stringList(field(prog, 'completedQuests'));
  const done = rawDone.filter((id) => Object.hasOwn(QUESTS, id));
  const dropped = rawDone.filter((id) => !Object.hasOwn(QUESTS, id));
  const activeQuests: GameState['progression']['activeQuests'] = {};
  const active = field(prog, 'activeQuests');
  for (const id of keysOf(active)) {
    if (!Object.hasOwn(QUESTS, id)) { dropped.push(id); continue; }
    const progress = finite(field(field(active, id), 'progress'));
    if (Object.hasOwn(QUESTS, id) && !done.includes(id) && progress !== undefined && progress >= 0) {
      activeQuests[id] = { progress: Math.floor(progress) };
    }
  }
  return { quests: { completedQuests: done, activeQuests }, dropped };
}

function newMigrationReport(): MigrationReport {
  return { droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [] };
}

/** Einträge mit unbekannter Kennung samt Anzahl, je Platz einer (nur Plätze mit gültiger Anzahl). */
function unknownItems(entries: unknown[], unknownIds: string[]): RepairReport['droppedItems'] {
  const out: RepairReport['droppedItems'] = [];
  for (const slot of entries) {
    const itemId = field(slot, 'itemId'); const count = finite(field(slot, 'count'));
    if (typeof itemId === 'string' && unknownIds.includes(itemId) && count !== undefined && count > 0) {
      out.push({ itemId, count: Math.max(1, Math.floor(count)) });
    }
  }
  return out;
}

/**
 * Liest 48 Plätze aus beliebig vielen: Plätze unter 48 bleiben, wo sie sind; überzählige Gegenstände
 * wandern in den ersten freien Platz, was nicht mehr passt, wird gemeldet.
 */
function repairInventory(rawSlots: unknown, target: GameState): Pick<RepairReport, 'droppedItems' | 'resizedInventory'> {
  const entries = Array.isArray(rawSlots) ? (rawSlots as unknown[]) : [];
  const head = entries.slice(0, INVENTORY_SLOTS); const extra = entries.slice(INVENTORY_SLOTS);
  const headReport = newMigrationReport();
  readInventory(head, target, headReport);
  const droppedItems = unknownItems(head, headReport.droppedItems);
  if (extra.length > 0) {
    const scratch = createNewGameState(0); const extraReport = newMigrationReport();
    readInventory(extra, scratch, extraReport);
    droppedItems.push(...unknownItems(extra, extraReport.droppedItems));
    for (const slot of scratch.inventory.slots) {
      if (slot.itemId === null) continue;
      const free = target.inventory.slots.findIndex((s) => s.itemId === null);
      if (free === -1) droppedItems.push({ itemId: slot.itemId, count: slot.count });
      else target.inventory.slots[free] = slot;
    }
  }
  return { droppedItems, resizedInventory: entries.length !== INVENTORY_SLOTS };
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
export function normalizeState(raw: unknown): { state: GameState; report: RepairReport } | null {
  if (!isObj(raw) || !Object.hasOwn(raw, 'formatVersion') || raw['formatVersion'] !== GAME_STATE_VERSION) return null;
  const player = field(raw, 'player'); const inventory = field(raw, 'inventory');
  const prog = field(raw, 'progression');
  const rawLevel = finite(field(prog, 'level'));
  if (!isObj(prog) || rawLevel === undefined) return null;

  const defaults = createNewGameState(0);   // dient auch als Ablage für die wiederverwendeten Lesehelfer
  const level = clamp(Math.floor(rawLevel), 1, MAX_LEVEL);
  const xp = finite(field(prog, 'xp'));
  const xpMax = level >= MAX_LEVEL ? 0 : xpToNext(level) - 1;
  const inv = repairInventory(field(inventory, 'slots'), defaults);
  readFriendship(raw['friendship'], defaults);
  readGarden(raw['garden'], defaults);
  readExplorerBook(raw['explorerBook'], defaults);
  readWorld(raw, defaults);
  const { player: repairedPlayer, relocated } = repairPlayer(player, level);
  const { quests, dropped: droppedQuests } = repairQuests(prog);
  const hotbar = finite(field(inventory, 'selectedHotbar'));
  const difficulty = field(raw['settings'], 'difficulty');

  const repaired: GameState = {
    formatVersion: GAME_STATE_VERSION,
    savedAt: finite(raw['savedAt']) ?? 0,
    importedLegacyAt: finite(raw['importedLegacyAt']) ?? null,
    legacyDeclinedAt: finite(raw['legacyDeclinedAt']) ?? null,
    player: repairedPlayer,
    inventory: {
      slots: defaults.inventory.slots,
      selectedHotbar: hotbar !== undefined && Number.isInteger(hotbar) && hotbar >= 0 && hotbar <= HOTBAR_MAX ? hotbar : 0,
      coins: counter(field(inventory, 'coins')),
    },
    progression: {
      level, xp: xp === undefined ? 0 : clamp(Math.floor(xp), 0, xpMax),
      ...quests, stats: repairStats(field(prog, 'stats')),
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
  const report: RepairReport = {
    droppedItems: inv.droppedItems, droppedQuests, relocated, resizedInventory: inv.resizedInventory,
    lossy: inv.droppedItems.length > 0 || droppedQuests.length > 0,
  };
  return { state: { ...(raw as Obj), ...repaired } as GameState, report };
}
