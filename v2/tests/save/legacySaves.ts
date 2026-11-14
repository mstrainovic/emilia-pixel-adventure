// Testvorlagen: Formen alter Spielstände (nur lesen, nie verändern).
const empty = (n: number) => Array.from({ length: n }, () => ({ itemId: null, count: 0 }));

export const LEGACY_FIRST_COMMIT = {            // Form des ersten Commits (version 2)
  version: 2, timestamp: 1711300000000,
  player: { hp: 80, scene: 'forest', x: 25.5, y: 30.25 },
  inventory: [{ itemId: 'sword_wood', count: 1 }, { itemId: 'wood', count: 7 }, ...empty(38)],
  plantsHealed: 4, unicornUnlocked: false,
  progression: {
    level: 3, xp: 30, totalXp: 95, bonusMaxHp: 10, bonusDamagePct: 0, bonusSpeedPct: 5,
    activeQuests: { nature_healer: { progress: 1, completed: false } },
    completedQuests: { first_steps: true, wood_collector: true },
    stats: { mobsKilled: { slime_green: 4 }, itemsCollected: { wood: 12 }, plantsHealed: 4,
      unicornsPetted: 0, itemsCrafted: 0, scenesVisited: { hub: true, forest: true },
      npcsSpoken: { mama_tanja: true } },
  },
};

export const LEGACY_V3_FULL = {
  version: 3, timestamp: 1749660000000,
  player: { hp: 150, scene: 'beach', x: 26, y: 14 },
  inventory: [{ itemId: 'sword_coral', count: 1 }, { itemId: 'fish_generic', count: 3 },
    { itemId: 'magic_bean', count: 2 }, null, { itemId: 'wood', count: 500 }, ...empty(43)],
  coins: 37, plantsHealed: 6, unicornUnlocked: true,
  progression: {
    level: 99, xp: 500, activeQuests: { crab_problem: { progress: 2, completed: false } },
    completedQuests: { first_steps: true, made_up_quest: true },
    stats: { mobsKilled: { crab_beach: 2 }, itemsCollected: {}, plantsHealed: 6, unicornsPetted: 1,
      itemsCrafted: 4, scenesVisited: { hub: true, lake: true, beach: true, moon: true },
      npcsSpoken: { oma: true }, grottoZones: {}, coralHealed: 0, petChosen: true, bookEntries: 3,
      bossesKilled: { coconut_king: true }, puzzlesSolved: {} },
  },
  fishCaught: { goldfish: 3 }, uniqueCollected: { shell: ['pearl', 'shell_common'] },
  friendship: { oma: { points: 140, lastTalkDay: 2, giftsGiven: 3 } },
  garden: [{ x: 4, y: 22, seed: 'seed_carrot', phase: 1, timer: 40, watered: true }],
  explorerBook: ['goldfish'],
  achievements: ['a', 'a', 'b'],
  bossStates: { coconut_king: { hp: 0, defeated: true }, leviathan: { hp: 90, defeated: false } },
  openedChests: ['chest_grotto_10_12'], collectedRareFinds: ['old_coin'],
  pet: { type: 'fox', friendship: 12, evolved: false },
  seenTooltips: ['move', 'talk'], distanceWalked: 1234.5, bossNoHitKill: false,
  newGamePlus: { active: false, cycleCount: 0 },
};

export const LEGACY_NGPLUS = {
  version: 3, timestamp: 1750000000000, player: { hp: 200, scene: 'hub', x: 10, y: 10 },
  inventory: empty(48), coins: 5,
  progression: { level: 22, xp: 0, activeQuests: {}, completedQuests: {},
    stats: { scenesVisited: { hub: true, cloud_castle: true },
      bossesKilled: { coconut_king: true, leviathan: true, shadow_knight: true } } },
  bossStates: {},
  achievements: Array.from({ length: 16 }, (_, i) => 'ach_' + i),
  newGamePlus: { active: true, cycleCount: 1 },
};

/**
 * Die Form, die das alte Spiel nach „Neues Abenteuer+" (New Game Plus) wirklich schreibt, aus dem alten Code abgelesen:
 * - `src/core/Game.js` 2507–2514: erst `newGamePlus.activate()` (`NewGamePlus.js` 26–35: active true, cycleCount + 1),
 *   dann `progression.resetQuests()`; danach erst `_bossStates = {}` und der Wechsel ins Dorf.
 * - `src/systems/Progression.js` 242–247: `resetQuests` leert `completedQuests` und ruft dann `this._assignNextQuest()`,
 *   das es nirgends gibt → TypeError. Der Klick-Empfänger (`src/ui/DialogUI.js` 132–135) fängt ihn nicht ab; der Rest
 *   der Aktion läuft nie: `bossStates` bleibt gefüllt, Emilia bleibt im Wolkenschloss.
 * - `Progression.js` 279–288 und 306–308: eine erledigte Aufgabe bleibt in `activeQuests` mit `completed: true` stehen;
 *   nach NG+ ist das der einzige Beleg. Fortschritt = `count` der Aufgabe (`src/data/quests.js`).
 * - Gespeichert wird beim nächsten Autosave (`SaveManager.js` 12–43, Felder aus `Game.js` 2808–2836,
 *   `progression` aus `Progression.js` 429–455 samt `bossesKilled`, `puzzlesSolved`, `achievementCount` doppelt;
 *   Boss-Zustand aus `src/entities/Boss.js` 363–369; Inventar 8 + 5 × 8 = 48 Plätze, `Inventory.js` 7–14; Zonen aus `src/world/maps/grotto.js` 193–196).
 */
const NGPLUS_DONE: Record<string, number> = {
  first_steps: 1, wood_collector: 5, nature_healer: 3, slime_hunter: 5, lake_visitor: 1, dungeon_explorer: 1,
  master_cook: 3, skeleton_slayer: 5, unicorn_friend: 1, master_crafter: 5, meadow_hero: 1, shell_collector: 3,
  master_angler: 3, crab_problem: 5, coral_healer: 5, deep_explorer: 4, best_friend: 1, collector_page1: 10,
  sunken_treasure: 1, cloud_jumper: 1, crystal_puzzle: 3, shadow_slayer: 1,
};
const NGPLUS_BOSSES_KILLED = { coconut_king: true, leviathan: true, shadow_knight: true };

export const LEGACY_NGPLUS_REAL = {
  version: 3, timestamp: 1752000000000,
  player: { hp: 260, scene: 'cloud_castle', x: 25.5, y: 11.75 },
  inventory: [{ itemId: 'sword_gem', count: 1 }, { itemId: 'berry', count: 12 }, { itemId: 'wood', count: 40 },
    { itemId: 'rainbow_shard', count: 3 }, ...empty(44)],
  coins: 214, plantsHealed: 18, unicornUnlocked: true,
  progression: {
    level: 24, xp: 310, totalXp: 14800, bonusMaxHp: 160, bonusDamagePct: 45, bonusSpeedPct: 20,
    activeQuests: {
      ...Object.fromEntries(Object.entries(NGPLUS_DONE).map(([id, count]) => [id, { progress: count, completed: true }])),
      star_collector: { progress: 14, completed: false },
    },
    completedQuests: {},
    stats: {
      mobsKilled: { slime_green: 31, skeleton_base: 9, crab_beach: 7 }, itemsCollected: { wood: 120, rainbow_shard: 3 },
      plantsHealed: 18, unicornsPetted: 2, itemsCrafted: 11,
      scenesVisited: { hub: true, forest: true, lake: true, dungeon: true, beach: true, grotto: true, cloud_castle: true },
      npcsSpoken: { mama_tanja: true, oma: true }, coralHealed: 5,
      grottoZones: ['reef', 'ruins', 'passage', 'treasure', 'cloud_garden'], petChosen: true, bookEntries: 12,
      bossesKilled: NGPLUS_BOSSES_KILLED, puzzlesSolved: { crystal_1: true }, achievementCount: 14,
      fishCaught: { goldfish: 2, carp: 1, pike: 1 }, uniqueCollected: { shell: ['shell_common', 'pearl', 'starfish'] },
    },
    bossesKilled: NGPLUS_BOSSES_KILLED, puzzlesSolved: { crystal_1: true }, achievementCount: 14,
  },
  dayNight: { totalTime: 5400.5, phaseIndex: 2, phaseTime: 41.25 },
  fishCaught: { goldfish: 2, carp: 1, pike: 1 }, uniqueCollected: { shell: ['shell_common', 'pearl', 'starfish'] },
  weather: { current: 'sunny', timer: 120, duration: 300 },
  pet: { type: 'cat', friendship: 40, evolved: true },
  explorerBook: { discovered: ['goldfish', 'carp', 'pike'], rewardsClaimed: [] },
  achievements: Array.from({ length: 14 }, (_, i) => 'ach_' + i),
  bossStates: {
    coconut_king: { hp: 0, defeated: true, playerDamageTaken: 3 },
    leviathan: { hp: 0, defeated: true, playerDamageTaken: 1 },
    shadow_knight: { hp: 0, defeated: true, playerDamageTaken: 0 },
  },
  newGamePlus: { active: true, cycleCount: 1 },
  distanceWalked: 23456.75, bossNoHitKill: true,
  collectedRareFinds: ['old_coin'], openedChests: ['chest_grotto_10_12'], seenTooltips: ['move', 'talk'],
  friendship: { oma: { points: 80, lastTalkDay: 12, giftsGiven: 4 } },
  garden: [{ x: 4, y: 22, seed: null, phase: 0, timer: 0, watered: false }],
};

export const LEGACY_PARTIAL = { version: 3, player: {} };

/** Alter Stand mit zu langem Inventar (60 Plätze); der letzte Platz (Index 59) liegt außerhalb der 48. */
export const LEGACY_LONG_INVENTORY = {
  version: 3, player: { scene: 'hub', x: 1, y: 1 },
  inventory: [...empty(59), { itemId: 'wood', count: 5 }],
};
