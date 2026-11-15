// Übernahme des alten Spielstands (Spiel 1.x) in den neuen Zustand.
// Reine Funktion: kein localStorage, keine Seiteneffekte, wirft nie, verändert die Eingabe nicht.
// Gearbeitet wird nach vorhandenen Feldern, nie nach `version` (die wurde im alten Spiel nicht gepflegt).
import { createEmptyGameState, INVENTORY_SLOTS, type GameState } from '../core/state';
import { MAX_LEVEL, HP_PER_HEART, heartsForLevel, convertLegacyXp } from '../core/levels';
import { ITEM_SUCCESSORS, getItem } from '../data/items';
import { BOSSES } from '../data/bosses';
import { QUESTS, QUEST_ORDER } from '../data/quests';
import { isMapId, HUB_START } from '../data/maps';
import { normalizeClock } from '../systems/dayclock';
import {
  isObj, keysOf, field, finite, counter, nonNegative, stringList, trueKeys, listOrTrueKeys,
  counterRecord, bossRecord, boolRecord, listRecord, type Obj,
} from './legacyRead';

/** Schlüssel des alten Spielstands und der Stummschaltung im localStorage (von v2 nur gelesen). */
export const LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save';
export const LEGACY_MUTED_KEY = 'emilia_muted';

export interface MigrationReport {
  droppedItems: string[];
  replacedItems: Record<string, string>;
  reconstructedQuests: string[];
  warnings: string[];
  /** Was beim Lesen der Plätze verloren ging: Rest über `stackSize` oder ungültige Stückzahl (dann `count: 0`). */
  cutItems: Array<{ itemId: string; count: number }>;
}

const NGPLUS_BOSS = 'shadow_knight';
const NGPLUS_LAST_QUEST = 'shadow_slayer';
const NGPLUS_ACHIEVEMENTS_FOR_STAR = 15;
const UNICORN_MIN_PLANTS = 10;

/** Ergebnis der Übernahme: jeder Ausgang ist benannt, damit das Spiel ihn erklären kann. */
export type LegacyImportResult =
  | { kind: 'ok'; state: GameState; report: MigrationReport }
  | { kind: 'none' }                          // Text fehlt
  | { kind: 'unreadable' }                    // kein JSON-Objekt
  | { kind: 'failed'; message: string };      // der Umbau hat geworfen

function parseObject(raw: string | null): Obj | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isObj(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Wahr, wenn der Text ein JSON-Objekt ist (also als alter Stand gelesen werden kann). */
export function isLegacyReadable(raw: string | null): boolean {
  return parseObject(raw) !== null;
}

/** Zeitstempel des alten Standes (für „schon übernommen?"), sonst `null`. */
export function legacyTimestamp(raw: string | null): number | null {
  return finite(field(parseObject(raw), 'timestamp')) ?? null;
}

export function readInventory(
  old: unknown, state: GameState, report: MigrationReport,
): void {
  const entries = Array.isArray(old) ? old : [];
  if (entries.length > INVENTORY_SLOTS) report.warnings.push('Inventar gekürzt');
  for (let i = 0; i < INVENTORY_SLOTS; i++) {
    const slot: unknown = entries[i];
    const rawId = field(slot, 'itemId');
    if (typeof rawId !== 'string') continue;
    const successor = Object.hasOwn(ITEM_SUCCESSORS, rawId) ? ITEM_SUCCESSORS[rawId] : undefined;
    const itemId = successor ?? rawId;
    const def = getItem(itemId);
    if (!def) {
      if (!report.droppedItems.includes(rawId)) report.droppedItems.push(rawId);
      continue;
    }
    const count = finite(field(slot, 'count'));
    if (count === undefined || count <= 0) {
      report.cutItems.push({ itemId, count: 0 });
      continue;
    }
    if (successor !== undefined) report.replacedItems[rawId] = successor;
    const whole = Math.max(1, Math.floor(count));
    if (whole > def.stackSize) report.cutItems.push({ itemId, count: whole - def.stackSize });
    state.inventory.slots[i] = { itemId, count: Math.min(def.stackSize, whole) };
  }
}

function readStats(save: Obj, prog: unknown, state: GameState): void {
  const stats = field(prog, 'stats');
  const s = state.progression.stats;
  s.mobsKilled = counterRecord(field(stats, 'mobsKilled'));
  s.itemsCollected = counterRecord(field(stats, 'itemsCollected'));
  // Das alte Spiel schreibt `true` und führt die Liste zweimal (in stats und eine Ebene darüber).
  const bk = bossRecord(field(stats, 'bossesKilled'));
  const bkTop = bossRecord(field(prog, 'bossesKilled'));
  for (const id of Object.keys(bkTop)) bk[id] = Math.max(bk[id] ?? 0, bkTop[id] ?? 0);
  s.bossesKilled = bk;
  s.puzzlesSolved = boolRecord(field(stats, 'puzzlesSolved'));
  s.fishCaught = counterRecord(isObj(save['fishCaught']) ? save['fishCaught'] : field(stats, 'fishCaught'));
  s.uniqueCollected = listRecord(isObj(save['uniqueCollected']) ? save['uniqueCollected'] : field(stats, 'uniqueCollected'));
  s.npcsSpoken = listOrTrueKeys(field(stats, 'npcsSpoken'));
  s.grottoZones = listOrTrueKeys(field(stats, 'grottoZones'));
  const unicorn = save['unicornUnlocked'] === true ? UNICORN_MIN_PLANTS : 0;
  s.plantsHealed = Math.max(counter(save['plantsHealed']), counter(field(stats, 'plantsHealed')), unicorn);
  s.coralHealed = counter(field(stats, 'coralHealed'));
  s.unicornsPetted = counter(field(stats, 'unicornsPetted'));
  s.itemsCrafted = counter(field(stats, 'itemsCrafted'));
  s.bookEntries = counter(field(stats, 'bookEntries'));
  s.distanceWalked = nonNegative(save['distanceWalked']);
  s.petChosen = field(stats, 'petChosen') === true;
  s.bossNoHitKill = save['bossNoHitKill'] === true;
}

/** Liefert die Aufgaben, die der alte Stand im Objekt `completedQuests` als erledigt führt. */
function readQuests(prog: unknown, state: GameState): Set<string> {
  const oldDone = new Set(trueKeys(field(prog, 'completedQuests')));   // Liste statt Objekt zählt nicht
  const done = new Set(oldDone);
  const active = field(prog, 'activeQuests');
  // Ein abgeschlossener Eintrag in activeQuests bleibt im alten Spiel stehen und ist nach NG+ der einzige Beleg.
  for (const id of keysOf(active)) {
    if (Object.hasOwn(QUESTS, id) && field(field(active, id), 'completed') === true) done.add(id);
  }
  state.progression.completedQuests = QUEST_ORDER.filter((id) => done.has(id));
  for (const id of keysOf(active)) {
    const entry = field(active, id);
    if (!Object.hasOwn(QUESTS, id) || done.has(id) || !isObj(entry)) continue;
    state.progression.activeQuests[id] = { progress: counter(entry['progress']) };
  }
  return oldDone;
}

/** Nach „New Game Plus" sind die erledigten Aufgaben im alten Stand gelöscht: im Zweifel gelten sie als erledigt. */
function reconstructQuests(state: GameState, report: MigrationReport, oldDone: Set<string>): void {
  const known = new Set(state.progression.completedQuests);
  const want = new Set(QUEST_ORDER.slice(0, QUEST_ORDER.indexOf(NGPLUS_LAST_QUEST) + 1));
  if (state.achievements.length >= NGPLUS_ACHIEVEMENTS_FOR_STAR) want.add('star_collector');
  if (state.progression.level >= MAX_LEVEL) want.add('emilia_legend');
  if (state.visitedMaps.includes('starsky')) want.add('secret_heroine');
  const all = QUEST_ORDER.filter((id) => known.has(id) || want.has(id));
  report.reconstructedQuests = all.filter((id) => want.has(id) && !oldDone.has(id));
  state.progression.completedQuests = all;
  for (const id of all) delete state.progression.activeQuests[id];
}

export function readFriendship(old: unknown, state: GameState): void {
  for (const id of keysOf(old)) {
    const entry = field(old, id);
    const points = finite(field(entry, 'points'));
    if (points === undefined) continue;
    state.friendship[id] = {
      points: Math.min(100, Math.max(0, points)),
      lastTalkDay: finite(field(entry, 'lastTalkDay')) ?? -1,
      giftsGiven: counter(field(entry, 'giftsGiven')),
    };
  }
}

export function readGarden(old: unknown, state: GameState): void {
  if (!Array.isArray(old)) return;
  for (const plot of old as unknown[]) {
    const x = finite(field(plot, 'x')); const y = finite(field(plot, 'y'));
    if (x === undefined || y === undefined) continue;
    const seed = field(plot, 'seed');
    state.garden.push({
      x, y, seed: typeof seed === 'string' && getItem(seed) ? seed : null,
      phase: nonNegative(field(plot, 'phase')), timer: nonNegative(field(plot, 'timer')),
      watered: field(plot, 'watered') === true,
    });
  }
}

export function readPet(old: unknown): GameState['pet'] {
  const type = field(old, 'type');
  if (typeof type !== 'string' || type === '') return null;
  return { type, friendship: nonNegative(field(old, 'friendship')), evolved: field(old, 'evolved') === true };
}

export function readExplorerBook(old: unknown, state: GameState): void {
  if (Array.isArray(old)) state.explorerBook.discovered = stringList(old);
  else if (isObj(old)) {
    state.explorerBook.discovered = stringList(old['discovered']);
    state.explorerBook.rewardsClaimed = stringList(old['rewardsClaimed']);
  }
}

export function readWorld(save: Obj, state: GameState): void {
  const dn = field(save, 'dayNight');
  // in den gültigen Bereich (Fix-Welle F7): mit phaseTime 1e12 oder phaseIndex 99 stünde die Uhr sonst still
  state.dayNight = normalizeClock({
    totalTime: finite(field(dn, 'totalTime')) ?? state.dayNight.totalTime,
    phaseIndex: finite(field(dn, 'phaseIndex')) ?? state.dayNight.phaseIndex,
    phaseTime: finite(field(dn, 'phaseTime')) ?? state.dayNight.phaseTime,
  });
  const w = field(save, 'weather');
  const current = field(w, 'current');
  state.weather = {
    current: typeof current === 'string' ? current : state.weather.current,
    timer: finite(field(w, 'timer')) ?? state.weather.timer,
    duration: finite(field(w, 'duration')) ?? state.weather.duration,
  };
}

function build(save: Obj, mutedRaw: string | null, now: number): { state: GameState; report: MigrationReport } {
  const state = createEmptyGameState(now);
  const report: MigrationReport = {
    droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [], cutItems: [],
  };
  const prog = field(save, 'progression');

  // Level, XP, Lebenspunkte (Herzen aus dem Level; alte Lebenspunkte entfallen)
  const level = Math.min(MAX_LEVEL, Math.max(1, Math.floor(finite(field(prog, 'level')) ?? 1)));
  state.progression.level = level;
  state.progression.xp = convertLegacyXp(level, finite(field(prog, 'xp')) ?? 0);

  // Ort
  const player = field(save, 'player');
  const scene = field(player, 'scene'); const x = finite(field(player, 'x')); const y = finite(field(player, 'y'));
  state.player = isMapId(scene) && x !== undefined && y !== undefined
    ? { map: scene, x, y, hp: 0 } : { ...HUB_START, hp: 0 };
  state.player.hp = heartsForLevel(level) * HP_PER_HEART;
  state.visitedMaps = trueKeys(field(field(prog, 'stats'), 'scenesVisited')).filter(isMapId);
  if (!state.visitedMaps.includes(state.player.map)) state.visitedMaps.push(state.player.map);

  readInventory(field(save, 'inventory'), state, report);
  state.inventory.coins = counter(save['coins']);
  readStats(save, prog, state);
  state.achievements = stringList(save['achievements']);
  const oldDone = readQuests(prog, state);
  const newGamePlus = field(field(save, 'newGamePlus'), 'active') === true;
  if (newGamePlus) reconstructQuests(state, report, oldDone);

  readFriendship(save['friendship'], state);
  readGarden(save['garden'], state);
  state.pet = readPet(save['pet']);
  readExplorerBook(save['explorerBook'], state);
  const bosses = field(save, 'bossStates');
  const defeated = keysOf(bosses).filter((k) => field(field(bosses, k), 'defeated') === true);
  for (const id of Object.keys(state.progression.stats.bossesKilled)) defeated.push(id);
  if (newGamePlus) defeated.push(NGPLUS_BOSS);   // Neues Abenteuer+ gab es erst nach diesem Sieg
  state.bossesDefeated = defeated.filter((id, i) => Object.hasOwn(BOSSES, id) && defeated.indexOf(id) === i);
  state.openedChests = stringList(save['openedChests']);
  state.collectedRareFinds = stringList(save['collectedRareFinds']);
  state.seenHints = stringList(save['seenTooltips']);
  readWorld(save, state);

  state.importedLegacyAt = finite(save['timestamp']) ?? 0;
  state.settings = { muted: mutedRaw === 'true', difficulty: 'sanft' };
  return { state, report };
}

/**
 * Rechnet einen alten Spielstand (JSON-Text) in den neuen Zustand um.
 * `none`: Text fehlt; `unreadable`: kein JSON-Objekt; `failed`: der Umbau hat geworfen. Wirft nie.
 */
export function migrateLegacySave(raw: string | null, mutedRaw: string | null, now: number): LegacyImportResult {
  if (raw === null) return { kind: 'none' };
  const save = parseObject(raw);
  if (!save) return { kind: 'unreadable' };
  try {
    return { kind: 'ok', ...build(save, mutedRaw, now) };
  } catch (error) {
    // Sicherheitsnetz: eine unvorhergesehene Form darf nie das Spiel beim Start zum Absturz bringen.
    return { kind: 'failed', message: error instanceof Error ? error.message : String(error) };
  }
}
