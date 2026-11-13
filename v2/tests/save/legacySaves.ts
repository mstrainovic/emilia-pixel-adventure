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
      bossesKilled: { coconut_king: 1 }, puzzlesSolved: {} },
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
    stats: { scenesVisited: { hub: true, cloud_castle: true } } },
  achievements: Array.from({ length: 16 }, (_, i) => 'ach_' + i),
  newGamePlus: { active: true, cycleCount: 1 },
};

export const LEGACY_PARTIAL = { version: 3, player: {} };

/** Alter Stand mit zu langem Inventar (60 Plätze); der letzte Platz (Index 59) liegt außerhalb der 48. */
export const LEGACY_LONG_INVENTORY = {
  version: 3, player: { scene: 'hub', x: 1, y: 1 },
  inventory: [...empty(59), { itemId: 'wood', count: 5 }],
};
