// Prüft und repariert einen gespeicherten Stand der Version 1: hartes Minimum, sonst Feld für Feld reparieren.
// Reine Funktion, wirft nie. Auf einem gültigen Stand ist sie die Identität; unbekannte Zusatzfelder bleiben.
import { createEmptyGameState, INVENTORY_SLOTS, GAME_STATE_VERSION, type GameState } from '../core/state';
import { MAX_LEVEL, HP_PER_HEART, heartsForLevel, xpToNext } from '../core/levels';
import { getItem } from '../data/items';
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
  /** Verlorene Gegenstände: unbekannt, kein Platz mehr, Rest über `stackSize`, ungültige Stückzahl (`count: 0`). */
  droppedItems: Array<{ itemId: string; count: number }>;
  droppedQuests: string[];
  resetQuests: string[];       // aktive Aufgaben mit ungültigem Stand, auf 0 gesetzt (kein Verlust)
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
  quests: Pick<GameState['progression'], 'completedQuests' | 'activeQuests'>; dropped: string[]; reset: string[];
} {
  const rawDone = stringList(field(prog, 'completedQuests'));
  const done = rawDone.filter((id) => Object.hasOwn(QUESTS, id));
  const dropped = rawDone.filter((id) => !Object.hasOwn(QUESTS, id));
  const reset: string[] = [];
  const activeQuests: GameState['progression']['activeQuests'] = {};
  const active = field(prog, 'activeQuests');
  for (const id of keysOf(active)) {
    if (!Object.hasOwn(QUESTS, id)) { dropped.push(id); continue; }
    if (done.includes(id)) continue;   // schon erledigt: der aktive Eintrag ist überflüssig, nichts geht verloren
    const progress = finite(field(field(active, id), 'progress'));
    // ungültiger Stand: die Aufgabe bleibt aktiv und beginnt von vorn (wie bei der Übernahme)
    if (progress === undefined || progress < 0) reset.push(id);
    activeQuests[id] = { progress: progress === undefined || progress < 0 ? 0 : Math.floor(progress) };
  }
  return { quests: { completedQuests: done, activeQuests }, dropped, reset };
}

function newMigrationReport(): MigrationReport {
  return { droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [], cutItems: [] };
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

/** Liest bis zu 48 Plätze nach `target` und meldet, was dabei verloren ging (unbekannt, gekürzt, ungültig). */
function readSlots(entries: unknown[], target: GameState): RepairReport['droppedItems'] {
  const report = newMigrationReport();
  readInventory(entries, target, report);
  return [...unknownItems(entries, report.droppedItems), ...report.cutItems];
}

/**
 * Liest 48 Plätze aus beliebig vielen: Plätze unter 48 bleiben, wo sie sind; überzählige Gegenstände
 * (in Blöcken zu 48, so viele es gibt) wandern in den ersten freien Platz, was nicht mehr passt, wird gemeldet.
 */
function repairInventory(rawSlots: unknown, target: GameState): Pick<RepairReport, 'droppedItems' | 'resizedInventory'> {
  const entries = Array.isArray(rawSlots) ? (rawSlots as unknown[]) : [];
  const droppedItems = readSlots(entries.slice(0, INVENTORY_SLOTS), target);
  for (let from = INVENTORY_SLOTS; from < entries.length; from += INVENTORY_SLOTS) {
    const scratch = createEmptyGameState(0);
    droppedItems.push(...readSlots(entries.slice(from, from + INVENTORY_SLOTS), scratch));
    for (const slot of scratch.inventory.slots) {
      if (slot.itemId === null) continue;
      const free = target.inventory.slots.findIndex((s) => s.itemId === null);
      if (free === -1) droppedItems.push({ itemId: slot.itemId, count: slot.count });
      else target.inventory.slots[free] = slot;
    }
  }
  return { droppedItems, resizedInventory: entries.length !== INVENTORY_SLOTS };
}

/** Wartende Belohnungen: unbekannte Kennungen und ungültige Stückzahlen fallen heraus und werden gemeldet. */
function repairPending(raw: unknown): { items: GameState['pendingItems']; dropped: RepairReport['droppedItems'] } {
  const items: GameState['pendingItems'] = []; const dropped: RepairReport['droppedItems'] = [];
  for (const entry of Array.isArray(raw) ? (raw as unknown[]) : []) {
    const itemId = field(entry, 'itemId'); const count = finite(field(entry, 'count'));
    if (typeof itemId !== 'string') continue;
    if (getItem(itemId) === null) { dropped.push({ itemId, count: count !== undefined && count > 0 ? Math.max(1, Math.floor(count)) : 0 }); continue; }
    if (count === undefined || count < 1) { dropped.push({ itemId, count: 0 }); continue; }
    items.push({ itemId, count: Math.floor(count) });
  }
  return { items, dropped };
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

  const defaults = createEmptyGameState(0);   // leer (kein Startschwert!); dient auch als Ablage für die Lesehelfer
  const level = clamp(Math.floor(rawLevel), 1, MAX_LEVEL);
  const xp = finite(field(prog, 'xp'));
  const xpMax = level >= MAX_LEVEL ? 0 : xpToNext(level) - 1;
  const inv = repairInventory(field(inventory, 'slots'), defaults);
  readFriendship(raw['friendship'], defaults);
  readGarden(raw['garden'], defaults);
  readExplorerBook(raw['explorerBook'], defaults);
  readWorld(raw, defaults);
  const { player: repairedPlayer, relocated } = repairPlayer(player, level);
  const { quests, dropped: droppedQuests, reset: resetQuests } = repairQuests(prog);
  const pending = repairPending(raw['pendingItems']);
  const droppedItems = [...inv.droppedItems, ...pending.dropped];
  const hotbar = finite(field(inventory, 'selectedHotbar'));
  const difficulty = field(raw['settings'], 'difficulty');

  const repaired: GameState = {
    formatVersion: GAME_STATE_VERSION,
    savedAt: finite(raw['savedAt']) ?? 0,
    importedLegacyAt: finite(raw['importedLegacyAt']) ?? null,
    legacyDeclinedAt: finite(raw['legacyDeclinedAt']) ?? null,
    lastBackupAt: finite(raw['lastBackupAt']) ?? null,
    player: repairedPlayer,
    inventory: {
      slots: defaults.inventory.slots,
      selectedHotbar: hotbar !== undefined && Number.isInteger(hotbar) && hotbar >= 0 && hotbar <= HOTBAR_MAX ? hotbar : 0,
      coins: counter(field(inventory, 'coins')),
    },
    pendingItems: pending.items,
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
    droppedItems, droppedQuests, resetQuests, relocated, resizedInventory: inv.resizedInventory,
    lossy: droppedItems.length > 0 || droppedQuests.length > 0,
  };
  return { state: { ...(raw as Obj), ...repaired } as GameState, report };
}
