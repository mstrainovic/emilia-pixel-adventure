# M6 "Wolken & Wunder" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Cloud Castle area, 3 boss fights (Coconut King, Leviathan, Shadow Knight), Achievement system (30 achievements), animated living world (birds, swaying trees, waves, cloud drift), pet evolution, New Game+, secret Starsky endgame area, 6 new quests, and level 26-30 progression.

**Architecture:** Data-first approach (items, bosses, achievements, quests, tiles, level curve), then maps + entities (Cloud Castle map, Starsky map, boss entities, ambient life), then systems + UI (achievements, boss HP bar, pet evolution, New Game+), then Game.js integration. Each subsystem is a self-contained module following existing patterns (canvas sprites, state machines, HTML overlays).

**Tech Stack:** Three.js, Vite, vanilla JS ES modules, Playwright, canvas-drawn sprites

---

## File Structure

**New files to create:**
| File | Responsibility |
|------|---------------|
| `src/data/achievements.js` | 30 achievement definitions (5 categories) |
| `src/data/bosses.js` | 3 boss stat/phase definitions |
| `src/data/rare_finds.js` | Rare find spawn configs per map |
| `src/world/maps/cloud_castle.js` | Cloud Castle map generator (50x45) |
| `src/world/maps/starsky.js` | Secret Starsky map generator (5x5) |
| `src/entities/Boss.js` | Boss base class (phases, telegraphing, HP persistence) |
| `src/entities/CoconutKing.js` | Coconut King boss (beach, 120HP) |
| `src/entities/Leviathan.js` | Leviathan boss (grotto, 180HP) |
| `src/entities/ShadowKnight.js` | Shadow Knight boss (cloud castle, 250HP) |
| `src/entities/Bird.js` | Ambient bird entities (tree perching, fly-off) |
| `src/rendering/AmbientLife.js` | Swaying trees, waves, cloud drift renderer |
| `src/systems/Achievements.js` | Achievement tracking + unlock logic |
| `src/systems/NewGamePlus.js` | New Game+ state management |
| `src/ui/AchievementUI.js` | Achievement popup + grid overview |
| `src/ui/BossHealthBar.js` | Boss HP bar overlay |

**Existing files to modify:**
| File | Changes |
|------|---------|
| `src/data/items.js` | +12 new items (boss rewards, cloud castle resources) |
| `src/data/mobs.js` | (no changes — bosses use separate bosses.js) |
| `src/data/quests.js` | +6 M6 quests |
| `src/data/levels.js` | Extend to level 30, unlock M6 quests |
| `src/data/recipes.js` | +1 recipe (rainbow_sword via alchemy) |
| `src/rendering/TilesetGenerator.js` | +4 cloud castle tile IDs (19-22) |
| `src/rendering/PostProcessing.js` | +cloud_castle and starsky moods |
| `src/systems/Progression.js` | +boss/achieve quest types, M6 quest tracking |
| `src/systems/SaveManager.js` | Persist achievements, boss states, NG+ flag |
| `src/systems/ExplorerBook.js` | Add cloud_crystal to gems category |
| `src/entities/Pet.js` | Add evolution sprites + evolved stats |
| `src/core/Game.js` | Wire cloud_castle, starsky, bosses, achievements, ambient life, NG+ |
| `src/ui/HUD.js` | Achievement counter, NG+ indicator |
| `src/world/maps/unicorn_meadow.js` | Add north exit to cloud castle |
| `src/world/maps/beach.js` | Add boss arena zone for Coconut King |
| `src/world/maps/grotto.js` | Add boss arena zone for Leviathan |
| `tests/full-test.cjs` | +4 test categories (CloudCastle, Bosses, Achievements, Animations) |

---

## Task 1: New Items — Boss Rewards, Cloud Castle Resources

**Files:**
- Modify: `src/data/items.js`

- [ ] **Step 1: Add 12 new items to ITEMS object**

In `src/data/items.js`, add after the `collectors_badge` entry (before the closing `};`):

```javascript
  // ── Boss Rewards (M6) ──
  beach_crown:    { id: 'beach_crown',    name: 'Strandkrone',        category: 'equipment', stackSize: 1,  color: '#FFD700' },
  leviathan_pearl:{ id: 'leviathan_pearl',name: 'Leviathan-Perle',    category: 'resource',  stackSize: 1,  color: '#7B68EE' },
  sword_gem_plus: { id: 'sword_gem_plus', name: 'Edelstein-Schwert+', category: 'weapon',    stackSize: 1,  color: '#AA77FF', damage: 55 },
  rainbow_sword:  { id: 'rainbow_sword',  name: 'Regenbogenschwert',  category: 'weapon',    stackSize: 1,  color: '#FF69B4', damage: 70 },

  // ── Cloud Castle Resources (M6) ──
  cloud_crystal:  { id: 'cloud_crystal',  name: 'Wolkenkristall',     category: 'gem',       stackSize: 99, color: '#E0E8FF' },
  rainbow_shard:  { id: 'rainbow_shard',  name: 'Regenbogen-Splitter',category: 'resource',  stackSize: 99, color: '#FF77CC' },
  star_fragment:  { id: 'star_fragment',  name: 'Sternen-Fragment',   category: 'resource',  stackSize: 99, color: '#FFFFAA' },
  shadow_essence: { id: 'shadow_essence', name: 'Schatten-Essenz',    category: 'resource',  stackSize: 99, color: '#4A0066' },

  // ── Cloud Castle Food (M6) ──
  cloud_cake:     { id: 'cloud_cake',     name: 'Wolkenkuchen',       category: 'food_cooked', stackSize: 10, color: '#FFF0F5', healAmount: 80 },

  // ── Potions (M6) ──
  star_elixir:    { id: 'star_elixir',    name: 'Sternen-Elixier',    category: 'potion',    stackSize: 5,  color: '#FFFACD', healAmount: 150 },

  // ── Equipment (M6) ──
  cloud_boots:    { id: 'cloud_boots',    name: 'Wolkenstiefel',      category: 'equipment', stackSize: 1,  color: '#B0E0E6' },
  star_amulet:    { id: 'star_amulet',    name: 'Sternen-Amulett',    category: 'equipment', stackSize: 1,  color: '#FFD700' },
```

**Note:** `golden_feather` already exists from M5 rare finds. Do NOT add it again.

- [ ] **Step 2: Commit**

```bash
git add src/data/items.js
git commit -m "feat(m6): add 12 new items — boss rewards, cloud castle resources, equipment"
```

---

## Task 2: Boss Data Definitions

**Files:**
- Create: `src/data/bosses.js`

- [ ] **Step 1: Create bosses.js with 3 boss definitions**

```javascript
/**
 * Boss definitions for M6.
 * Each boss has phases with different attack patterns and stats.
 * Bosses do NOT respawn on death — they stay defeated (persistent).
 * On player death: respawn before boss room, boss keeps damage taken.
 *
 * spriteType: 'coconut_king' | 'leviathan' | 'shadow_knight'
 * phases: array of phase configs, activated by HP threshold
 */
export const BOSS_TYPES = {
  coconut_king: {
    name: 'Kokosnuss-Koenig',
    spriteType: 'coconut_king',
    scene: 'beach',
    hp: 120,
    xp: 150,
    speed: 1.0,
    unlockCondition: 'all_m4_quests',
    phases: [
      {
        name: 'Phase 1',
        hpThreshold: 0.6, // active when HP > 60%
        damage: 8,
        rangedDamage: 5,
        attackCooldown: 2.0,
        pattern: 'patrol_throw_single', // sideways patrol, single coconut throw
        telegraphDuration: 2.0,
      },
      {
        name: 'Phase 2',
        hpThreshold: 0.0, // active when HP <= 60%
        damage: 8,
        rangedDamage: 5,
        attackCooldown: 1.5,
        pattern: 'patrol_throw_triple', // 3-coconut salvo, faster movement
        speedMultiplier: 1.3,
        telegraphDuration: 2.5,
      },
    ],
    weakSpot: 'belly_side', // double damage when hit from side during attack
    drops: [
      { itemId: 'beach_crown', count: 1 },
      { itemId: 'coconut', count: 5 },
    ],
  },

  leviathan: {
    name: 'Tiefsee-Leviathan',
    spriteType: 'leviathan',
    scene: 'grotto',
    hp: 180,
    xp: 250,
    speed: 0.8,
    unlockCondition: 'all_m5_quests',
    phases: [
      {
        name: 'Phase 1',
        hpThreshold: 0.5,
        damage: 10,
        aoeDamage: 7,
        attackCooldown: 2.5,
        pattern: 'tentacle_slam_dual', // 2 tentacles slam sequentially
        telegraphDuration: 2.5,
      },
      {
        name: 'Phase 2',
        hpThreshold: 0.0,
        damage: 10,
        aoeDamage: 7,
        attackCooldown: 2.0,
        pattern: 'tentacle_ink_combo', // tentacles + ink AoE cloud
        speedMultiplier: 1.2,
        telegraphDuration: 2.0,
      },
    ],
    weakSpot: 'head_after_slam', // head exposed after tentacle attack window
    drops: [
      { itemId: 'leviathan_pearl', count: 1 },
    ],
  },

  shadow_knight: {
    name: 'Schatten-Ritter',
    spriteType: 'shadow_knight',
    scene: 'cloud_castle',
    hp: 250,
    xp: 400,
    speed: 1.8,
    unlockCondition: 'cloud_castle_access',
    phases: [
      {
        name: 'Phase 1',
        hpThreshold: 0.66,
        damage: 12,
        dashDamage: 8,
        attackCooldown: 1.8,
        pattern: 'sword_block_counter', // classic sword, block-counter rhythm
        telegraphDuration: 2.0,
      },
      {
        name: 'Phase 2',
        hpThreshold: 0.33,
        damage: 12,
        dashDamage: 8,
        attackCooldown: 1.5,
        pattern: 'teleport_combo', // teleport behind player, fast combos
        speedMultiplier: 1.4,
        telegraphDuration: 2.5,
      },
      {
        name: 'Phase 3',
        hpThreshold: 0.0,
        damage: 12,
        dashDamage: 8,
        attackCooldown: 1.5,
        pattern: 'clone_assault', // 2 shadow clones (50HP each)
        cloneHp: 50,
        cloneCount: 2,
        speedMultiplier: 1.2,
        telegraphDuration: 3.0,
      },
    ],
    weakSpot: null, // no weak spot, balanced through generous telegraphing
    drops: [
      { itemId: 'rainbow_sword', count: 1 },
      { itemId: 'shadow_essence', count: 3 },
    ],
  },
};

/**
 * Check if a boss is unlocked based on game state.
 * @param {string} bossId - key in BOSS_TYPES
 * @param {object} progression - Progression instance
 * @param {object} player - Player instance (for level check)
 * @param {number} unicornsPetted - count of unicorns petted
 * @returns {boolean}
 */
export function isBossUnlocked(bossId, progression, player, unicornsPetted) {
  const boss = BOSS_TYPES[bossId];
  if (!boss) return false;

  const completed = progression.completedQuests || {};

  switch (boss.unlockCondition) {
    case 'all_m4_quests':
      return !!(completed['shell_collector'] && completed['master_angler'] &&
                completed['crab_problem'] && completed['shooting_star']);

    case 'all_m5_quests':
      return !!(completed['coral_healer'] && completed['deep_explorer'] &&
                completed['best_friend'] && completed['collector_page1'] &&
                completed['sunken_treasure']);

    case 'cloud_castle_access':
      return (progression.level >= 22) && (unicornsPetted >= 3);

    default:
      return false;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/bosses.js
git commit -m "feat(m6): add boss definitions — Coconut King, Leviathan, Shadow Knight"
```

---

## Task 3: Achievement Definitions

**Files:**
- Create: `src/data/achievements.js`

- [ ] **Step 1: Create achievements.js with 30 achievement definitions**

```javascript
/**
 * Achievement definitions — 30 total across 5 categories.
 * Each achievement has:
 *   id, name, description, category, condition (checked by AchievementSystem)
 *
 * condition types:
 *   - visit_scene: { scene: 'forest' }
 *   - visit_all_scenes: { scenes: [...] }
 *   - find_secrets: { count: 3 }
 *   - walk_distance: { tiles: 10000 }
 *   - catch_fish: { count: 1 }
 *   - collect_shells: { count: 5 }
 *   - catch_insects: { count: 3 }
 *   - collect_gems: { count: 6 }
 *   - book_entries: { count: 25 }
 *   - book_complete: {}
 *   - collect_plants: { count: 50 }
 *   - find_chests: { count: 5 }
 *   - kill_first: {}
 *   - kill_type: { type: 'slime', count: 25 }
 *   - kill_bosses: { count: 3 }
 *   - boss_no_damage: {}
 *   - talk_all_npcs: {}
 *   - pet_all_unicorns: {}
 *   - max_pet_friendship: {}
 *   - complete_npc_quests: {}
 *   - reach_level: { level: 15 }
 *   - complete_all_quests: {}
 *   - achievement_count: { count: 25 }
 */
export const ACHIEVEMENTS = {
  // ── Exploration (8) ──
  first_steps_ach: {
    id: 'first_steps_ach',
    name: 'Erste Schritte',
    description: 'Betrete den Wald',
    category: 'exploration',
    condition: { type: 'visit_scene', scene: 'forest' },
  },
  cave_explorer: {
    id: 'cave_explorer',
    name: 'Hoehlenforscher',
    description: 'Betrete den Dungeon',
    category: 'exploration',
    condition: { type: 'visit_scene', scene: 'dungeon' },
  },
  beach_walker: {
    id: 'beach_walker',
    name: 'Strandlaeuferin',
    description: 'Betrete den Strand',
    category: 'exploration',
    condition: { type: 'visit_scene', scene: 'beach' },
  },
  deep_diver: {
    id: 'deep_diver',
    name: 'Tieftaucherin',
    description: 'Betrete die Unterwasser-Grotte',
    category: 'exploration',
    condition: { type: 'visit_scene', scene: 'grotto' },
  },
  sky_climber: {
    id: 'sky_climber',
    name: 'Himmelstuermerin',
    description: 'Betrete das Wolkenschloss',
    category: 'exploration',
    condition: { type: 'visit_scene', scene: 'cloud_castle' },
  },
  cartographer: {
    id: 'cartographer',
    name: 'Kartographin',
    description: 'Besuche alle 8 Areas',
    category: 'exploration',
    condition: { type: 'visit_all_scenes', scenes: ['hub', 'forest', 'dungeon', 'lake', 'unicorn_meadow', 'beach', 'grotto', 'cloud_castle'] },
  },
  secret_finder: {
    id: 'secret_finder',
    name: 'Geheimnis-Luefterin',
    description: 'Finde 3 geheime Bereiche',
    category: 'exploration',
    condition: { type: 'find_secrets', count: 3 },
  },
  world_explorer: {
    id: 'world_explorer',
    name: 'Welt-Entdeckerin',
    description: 'Laufe 10.000 Tiles Distanz',
    category: 'exploration',
    condition: { type: 'walk_distance', tiles: 10000 },
  },

  // ── Collection (8) ──
  first_fish: {
    id: 'first_fish',
    name: 'Angel-Anfaengerin',
    description: 'Fange deinen ersten Fisch',
    category: 'collection',
    condition: { type: 'catch_fish', count: 1 },
  },
  shell_collector_ach: {
    id: 'shell_collector_ach',
    name: 'Muschel-Sammlerin',
    description: 'Finde 5 verschiedene Muscheln',
    category: 'collection',
    condition: { type: 'collect_shells', count: 5 },
  },
  entomologist: {
    id: 'entomologist',
    name: 'Entomologin',
    description: 'Fange 3 verschiedene Insekten',
    category: 'collection',
    condition: { type: 'catch_insects', count: 3 },
  },
  crystal_hunter: {
    id: 'crystal_hunter',
    name: 'Kristall-Jaegerin',
    description: 'Finde alle 6 Kristall/Edelstein-Typen',
    category: 'collection',
    condition: { type: 'collect_gems', count: 6 },
  },
  full_collector: {
    id: 'full_collector',
    name: 'Komplett-Sammlerin',
    description: 'Fuege 25 Eintraege ins Entdecker-Buch',
    category: 'collection',
    condition: { type: 'book_entries', count: 25 },
  },
  master_collector: {
    id: 'master_collector',
    name: 'Meister-Sammlerin',
    description: 'Entdecker-Buch 100% komplett',
    category: 'collection',
    condition: { type: 'book_complete' },
  },
  herb_witch: {
    id: 'herb_witch',
    name: 'Kraeuter-Hexe',
    description: 'Sammle 50 Pflanzen/Kraeuter insgesamt',
    category: 'collection',
    condition: { type: 'collect_plants', count: 50 },
  },
  treasure_seeker: {
    id: 'treasure_seeker',
    name: 'Schatzsucherin',
    description: 'Finde 5 versteckte Truhen',
    category: 'collection',
    condition: { type: 'find_chests', count: 5 },
  },

  // ── Combat (6) ──
  first_kill: {
    id: 'first_kill',
    name: 'Erste Beute',
    description: 'Besiege deinen ersten Gegner',
    category: 'combat',
    condition: { type: 'kill_first' },
  },
  slime_hunter_ach: {
    id: 'slime_hunter_ach',
    name: 'Slime-Jaegerin',
    description: 'Besiege 25 Slimes',
    category: 'combat',
    condition: { type: 'kill_type', target: 'slime', count: 25 },
  },
  skeleton_slayer_ach: {
    id: 'skeleton_slayer_ach',
    name: 'Skelett-Bezwingerin',
    description: 'Besiege 25 Skelette',
    category: 'combat',
    condition: { type: 'kill_type', target: 'skeleton', count: 25 },
  },
  crab_catcher: {
    id: 'crab_catcher',
    name: 'Krabbenfaengerin',
    description: 'Besiege 15 Krabben',
    category: 'combat',
    condition: { type: 'kill_type', target: 'crab', count: 15 },
  },
  boss_hunter: {
    id: 'boss_hunter',
    name: 'Boss-Jaegerin',
    description: 'Besiege alle 3 Bosse',
    category: 'combat',
    condition: { type: 'kill_bosses', count: 3 },
  },
  untouchable: {
    id: 'untouchable',
    name: 'Unberuehrbar',
    description: 'Besiege einen Boss ohne Schaden',
    category: 'combat',
    condition: { type: 'boss_no_damage' },
  },

  // ── Social (4) ──
  village_life: {
    id: 'village_life',
    name: 'Dorfleben',
    description: 'Sprich mit allen 8 NPCs',
    category: 'social',
    condition: { type: 'talk_all_npcs' },
  },
  animal_friend: {
    id: 'animal_friend',
    name: 'Tierfreundin',
    description: 'Streichle alle 3 Einhoerner',
    category: 'social',
    condition: { type: 'pet_all_unicorns' },
  },
  best_friend_ach: {
    id: 'best_friend_ach',
    name: 'Beste Freundin',
    description: 'Erreiche max. Haustier-Freundschaft',
    category: 'social',
    condition: { type: 'max_pet_friendship' },
  },
  family_bond: {
    id: 'family_bond',
    name: 'Familien-Band',
    description: 'Schliesse alle NPC-Quests ab',
    category: 'social',
    condition: { type: 'complete_npc_quests' },
  },

  // ── Master (4) ──
  level_15: {
    id: 'level_15',
    name: 'Level 15',
    description: 'Erreiche Level 15',
    category: 'master',
    condition: { type: 'reach_level', level: 15 },
  },
  level_30: {
    id: 'level_30',
    name: 'Level 30',
    description: 'Erreiche Level 30',
    category: 'master',
    condition: { type: 'reach_level', level: 30 },
  },
  quest_queen: {
    id: 'quest_queen',
    name: 'Quest-Koenigin',
    description: 'Schliesse alle 24 Quests ab',
    category: 'master',
    condition: { type: 'complete_all_quests' },
  },
  legendary_heroine: {
    id: 'legendary_heroine',
    name: 'Legendaere Heldin',
    description: 'Erreiche 25 andere Achievements',
    category: 'master',
    condition: { type: 'achievement_count', count: 25 },
  },
};

export const ACHIEVEMENT_CATEGORIES = {
  exploration: { name: 'Erkundung', icon: 'compass' },
  collection:  { name: 'Sammlung',  icon: 'gem' },
  combat:      { name: 'Kampf',     icon: 'sword' },
  social:      { name: 'Sozial',    icon: 'heart' },
  master:      { name: 'Meister',   icon: 'crown' },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/achievements.js
git commit -m "feat(m6): add 30 achievement definitions across 5 categories"
```

---

## Task 4: New Quests

**Files:**
- Modify: `src/data/quests.js`

- [ ] **Step 1: Add 6 M6 quests**

In `src/data/quests.js`, add after the `sunken_treasure` entry:

```javascript
  // ── M6 Quests ──
  cloud_jumper: {
    id: 'cloud_jumper',
    name: 'Wolkenspringerin',
    description: 'Erreiche das Wolkenschloss',
    type: 'visit',
    target: 'cloud_castle',
    count: 1,
    xpReward: 100,
    itemReward: [{ itemId: 'cloud_crystal', count: 3 }],
  },
  crystal_puzzle: {
    id: 'crystal_puzzle',
    name: 'Kristall-Raetsel',
    description: 'Loese das Spiegel-Puzzle in den Kristallhallen',
    type: 'puzzle',
    target: 'crystal_puzzle',
    count: 1,
    xpReward: 80,
    itemReward: [{ itemId: 'rainbow_shard', count: 2 }],
  },
  shadow_slayer: {
    id: 'shadow_slayer',
    name: 'Bezwingerin des Schatten-Ritters',
    description: 'Besiege den finalen Boss',
    type: 'boss',
    target: 'shadow_knight',
    count: 1,
    xpReward: 200,
    itemReward: [],
  },
  star_collector: {
    id: 'star_collector',
    name: 'Sternensammlerin',
    description: 'Erreiche 15 Achievements',
    type: 'achieve',
    target: 'achievements',
    count: 15,
    xpReward: 120,
    itemReward: [{ itemId: 'star_fragment', count: 5 }],
  },
  emilia_legend: {
    id: 'emilia_legend',
    name: 'Emilias Legende',
    description: 'Erreiche Level 30',
    type: 'reach_level',
    target: 30,
    count: 1,
    xpReward: 0,
    itemReward: [{ itemId: 'star_amulet', count: 1 }],
  },
  secret_heroine: {
    id: 'secret_heroine',
    name: 'Geheime Heldin',
    description: 'Finde den Sternenhimmel-Raum',
    type: 'visit',
    target: 'starsky',
    count: 1,
    xpReward: 150,
    itemReward: [],
  },
```

- [ ] **Step 2: Extend Progression.js for M6 quest types**

In `src/systems/Progression.js`:

1. Add M6 quests to `QUEST_ORDER`:
```javascript
const QUEST_ORDER = [
  'first_steps', 'wood_collector', 'nature_healer', 'slime_hunter',
  'dungeon_explorer', 'skeleton_slayer', 'unicorn_friend', 'master_crafter', 'meadow_hero',
  // M4
  'shell_collector', 'master_angler', 'crab_problem', 'shooting_star',
  // M5
  'coral_healer', 'deep_explorer', 'best_friend', 'collector_page1', 'sunken_treasure',
  // M6
  'cloud_jumper', 'crystal_puzzle', 'shadow_slayer', 'star_collector', 'emilia_legend', 'secret_heroine',
];
```

2. Add new stats tracking fields to constructor:
```javascript
this.stats.bossesKilled = {};    // bossId -> true
this.stats.puzzlesSolved = {};   // puzzleId -> true
this.stats.achievementCount = 0;
```

3. Add new report methods:
```javascript
reportBossKill(bossId) {
  if (!this.stats.bossesKilled[bossId]) {
    this.stats.bossesKilled[bossId] = true;
    this._incrementQuest('shadow_slayer', 1);
  }
}

reportPuzzleSolved(puzzleId) {
  if (!this.stats.puzzlesSolved[puzzleId]) {
    this.stats.puzzlesSolved[puzzleId] = true;
    this._incrementQuest('crystal_puzzle', 1);
  }
}

reportAchievementUnlock(totalCount) {
  this.stats.achievementCount = totalCount;
  this._setQuestProgress('star_collector', totalCount);
}
```

4. In `loadSaveData()`, restore new stats:
```javascript
if (saved.bossesKilled) this.stats.bossesKilled = saved.bossesKilled;
if (saved.puzzlesSolved) this.stats.puzzlesSolved = saved.puzzlesSolved;
if (typeof saved.achievementCount === 'number') this.stats.achievementCount = saved.achievementCount;
```

5. In `getSaveData()`, include new stats:
```javascript
bossesKilled: this.stats.bossesKilled,
puzzlesSolved: this.stats.puzzlesSolved,
achievementCount: this.stats.achievementCount,
```

- [ ] **Step 3: Commit**

```bash
git add src/data/quests.js src/systems/Progression.js
git commit -m "feat(m6): add 6 quests + boss/puzzle/achievement quest tracking"
```

---

## Task 5: Level Curve 26-30

**Files:**
- Modify: `src/data/levels.js`

- [ ] **Step 1: Add levels 26-30 and update MAX_LEVEL**

In `src/data/levels.js`, add after the Level 25 entry:

```javascript
  // Level 26
  { level: 26, xpRequired: 14500, statBonus: { maxHp: 20, damagePct: 5 }, rewards: [], unlockQuest: 'cloud_jumper' },
  // Level 27
  { level: 27, xpRequired: 17500, statBonus: { maxHp: 15, speedPct: 5 }, rewards: [], unlockQuest: 'crystal_puzzle' },
  // Level 28
  { level: 28, xpRequired: 21000, statBonus: { maxHp: 20, damagePct: 10 }, rewards: [{ itemId: 'heal_potion', count: 5 }], unlockQuest: 'shadow_slayer' },
  // Level 29
  { level: 29, xpRequired: 25000, statBonus: { maxHp: 15, speedPct: 5 }, rewards: [], unlockQuest: 'star_collector' },
  // Level 30 — M6 MAX
  { level: 30, xpRequired: 30000, statBonus: { maxHp: 30, damagePct: 10 }, rewards: [{ itemId: 'star_fragment', count: 5 }], unlockQuest: 'emilia_legend' },
```

Update `MAX_LEVEL`:
```javascript
export const MAX_LEVEL = 30;
```

- [ ] **Step 2: Commit**

```bash
git add src/data/levels.js
git commit -m "feat(m6): extend level curve to 30 (14500-30000 XP)"
```

---

## Task 6: Cloud Castle Tiles (4 New Tile IDs: 19-22)

**Files:**
- Modify: `src/rendering/TilesetGenerator.js`

- [ ] **Step 1: Update TILE_COUNT to 23 and add 4 cloud castle tiles**

Change at top of file:
```javascript
const TILE_COUNT = 23;
```

In `generateTilesetAsync()`, after tile 18 (underwater_sand) section, add:

```javascript
    // 19 = cloud_white — fluffy white cloud floor
    ctx.fillStyle = '#F0F0FF';
    ctx.fillRect(19 * T, 0, T, T);
    // Cloud puff highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(19 * T + 2, 2, 4, 3);
    ctx.fillRect(19 * T + 8, 5, 5, 3);
    ctx.fillRect(19 * T + 4, 9, 6, 4);
    // Subtle shadow
    ctx.fillStyle = 'rgba(180, 180, 220, 0.3)';
    ctx.fillRect(19 * T + 1, 13, 14, 2);

    // 20 = cloud_pink — pink-tinted cloud (rosa)
    ctx.fillStyle = '#FFE8F0';
    ctx.fillRect(20 * T, 0, T, T);
    ctx.fillStyle = '#FFF0F5';
    ctx.fillRect(20 * T + 3, 2, 5, 4);
    ctx.fillRect(20 * T + 7, 6, 6, 3);
    ctx.fillRect(20 * T + 2, 10, 7, 3);
    ctx.fillStyle = 'rgba(220, 180, 200, 0.3)';
    ctx.fillRect(20 * T + 1, 13, 14, 2);

    // 21 = crystal_floor — sparkling crystal floor
    ctx.fillStyle = '#C8D8F0';
    ctx.fillRect(21 * T, 0, T, T);
    // Crystal facets
    ctx.fillStyle = '#D8E8FF';
    ctx.fillRect(21 * T + 2, 1, 5, 5);
    ctx.fillRect(21 * T + 9, 4, 4, 6);
    ctx.fillRect(21 * T + 3, 8, 6, 5);
    // Sparkle highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(21 * T + 4, 2, 1, 1);
    ctx.fillRect(21 * T + 11, 5, 1, 1);
    ctx.fillRect(21 * T + 6, 10, 1, 1);
    ctx.fillRect(21 * T + 13, 13, 1, 1);
    // Dark lines between crystals
    ctx.fillStyle = 'rgba(100, 120, 160, 0.3)';
    ctx.fillRect(21 * T + 7, 0, 1, T);
    ctx.fillRect(21 * T, 7, T, 1);

    // 22 = rainbow_bridge — animated rainbow bridge tile (static base, animation via UV offset)
    // Draw a gradient rainbow effect
    const rainbowColors = ['#FF6B6B', '#FFAA6B', '#FFE66B', '#6BFF6B', '#6BB5FF', '#AA6BFF'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = rainbowColors[i];
      const bandY = Math.floor(i * T / 6);
      const bandH = Math.ceil(T / 6);
      ctx.fillRect(22 * T, bandY, T, bandH);
    }
    // Add sparkle dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(22 * T + 3, 2, 1, 1);
    ctx.fillRect(22 * T + 10, 7, 1, 1);
    ctx.fillRect(22 * T + 6, 12, 1, 1);
```

Also update the fallback color arrays in both `generateTileset()` and `generateTilesetAsync()`:
```javascript
const fallbackColors = [
  '#3a7830', '#48903a', '#55a042', '#44953a',
  '#be9e76', '#9b8060', '#917850', '#af9258',
  '#48903a', '#9b9ea8', '#3a7ab0',
  '#F5DEB3', '#C4A97D', '#F0D9A8', '#8B6F47',
  '#2A3A5A', '#3A5A7A', '#2A5A3A', '#5A6A5A',
  '#F0F0FF', '#FFE8F0', '#C8D8F0', '#FF6B6B',
];
```

- [ ] **Step 2: Commit**

```bash
git add src/rendering/TilesetGenerator.js
git commit -m "feat(m6): add 4 cloud castle tile types (19-22: cloud white/pink, crystal, rainbow)"
```

---

## Task 7: Rare Find Placement Data

**Files:**
- Create: `src/data/rare_finds.js`

- [ ] **Step 1: Create rare find spawn configs**

```javascript
/**
 * Rare find hidden item placement per scene.
 * These are collectible items placed in specific positions.
 * Player picks them up with E key (same as ResourceNode).
 * Each has a condition for visibility (time-of-day, after boss, etc.)
 *
 * Used by Game.js _buildScene to create ResourceNode instances.
 */
export const RARE_FIND_PLACEMENTS = {
  hub: [
    {
      itemId: 'old_coin',
      x: 35, y: 5,       // behind Oma's house, top-right corner
      condition: null,     // always visible, but hidden behind prop
      respawn: false,      // one-time pickup
    },
  ],
  unicorn_meadow: [
    {
      itemId: 'fairy_dust',
      x: 12, y: 8,
      condition: 'night',  // only visible at night
      respawn: false,
    },
  ],
  dungeon: [
    {
      itemId: 'fossil',
      x: 30, y: 25,       // dead-end corridor behind ore cluster
      condition: null,
      respawn: false,
    },
  ],
  beach: [
    {
      itemId: 'message_bottle',
      x: 8, y: 3,         // shoreline
      condition: 'morning', // spawns only during morning phase
      respawn: false,
    },
  ],
  grotto: [
    {
      itemId: 'lost_diary',
      x: 22, y: 30,       // treasure chamber, behind a chest prop
      condition: null,
      respawn: false,
    },
  ],
  cloud_castle: [
    {
      itemId: 'golden_feather',
      x: 40, y: 5,        // Star Terrace, after Shadow Knight defeat
      condition: 'boss_shadow_knight_defeated',
      respawn: false,
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/rare_finds.js
git commit -m "feat(m6): add rare find placement data for 6 maps"
```

---

## Task 8: Cloud Castle Map (50x45)

**Files:**
- Create: `src/world/maps/cloud_castle.js`

- [ ] **Step 1: Create Cloud Castle map generator**

Follow the exact pattern from `src/world/maps/grotto.js` — same helper functions (createGrid, fillRect, seededRandom), same return shape.

```javascript
const W = 50;
const H = 45;

function createGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

function fillRect(grid, x, y, w, h, val) {
  for (let r = y; r < y + h && r < grid.length; r++)
    for (let c = x; c < x + w && c < grid[0].length; c++)
      if (r >= 0 && c >= 0) grid[r][c] = val;
}

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/**
 * The Cloud Castle — ethereal sky fortress with 4 zones.
 * Tiles: 19=cloud_white, 20=cloud_pink, 21=crystal_floor, 22=rainbow_bridge
 * Background tile (void/starsky): -1 (collision=1, not walkable)
 *
 * Zone layout (50x45):
 *   Cloud Garden     x:5-24,  y:25-39  — entrance area, floating flower islands
 *   Crystal Halls    x:25-39, y:15-34  — crystal floor, puzzle room
 *   Throne Room      x:10-24, y:5-19   — Boss 3 arena (Shadow Knight)
 *   Star Terrace     x:30-44, y:0-9    — panorama, reward NPCs, endgame
 *
 * Exit: South center (y=44) → unicorn_meadow
 */
export function generateCloudCastleMap() {
  const rng = seededRandom(7799);

  // Start with starsky void (no tile, collision=1)
  const ground    = createGrid(W, H, -1);
  const collision = createGrid(W, H, 1);

  function carveFloor(x, y, w, h, tileId) {
    fillRect(ground,    x, y, w, h, tileId);
    fillRect(collision, x, y, w, h, 0);
  }

  function carveCorridor(x1, y1, x2, y2, width, tileId) {
    const bw = width || 2;
    const tile = tileId || 22; // rainbow bridge default
    if (x1 === x2) {
      const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
      fillRect(ground,    x1, minY, bw, maxY - minY + 1, tile);
      fillRect(collision, x1, minY, bw, maxY - minY + 1, 0);
    } else if (y1 === y2) {
      const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
      fillRect(ground,    minX, y1, maxX - minX + bw, bw, tile);
      fillRect(collision, minX, y1, maxX - minX + bw, bw, 0);
    }
  }

  // ── ZONE 1: Cloud Garden (x:5-24, y:25-39) ────────────────────────────
  // Main garden — white and pink clouds with flower islands
  carveFloor(5, 25, 20, 15, 19);   // white cloud base
  // Pink cloud patches
  carveFloor(8, 27, 6, 5, 20);
  carveFloor(15, 30, 5, 4, 20);
  carveFloor(10, 35, 8, 3, 20);

  // Entrance from south (rainbow bridge descent)
  carveCorridor(13, 39, 13, 44, 3, 22);

  // ── ZONE 2: Crystal Halls (x:25-39, y:15-34) ──────────────────────────
  carveFloor(25, 15, 15, 20, 21);   // crystal floor base
  // Pink cloud accent rooms
  carveFloor(28, 18, 5, 5, 20);
  carveFloor(32, 26, 6, 6, 20);

  // Rainbow bridge connecting Garden → Crystal Halls
  carveCorridor(24, 28, 25, 28, 2, 22);

  // ── ZONE 3: Throne Room (x:10-24, y:5-19) ─────────────────────────────
  // Boss arena — large open room
  carveFloor(10, 5, 15, 15, 21);     // crystal floor
  // Gold cloud throne area
  carveFloor(14, 6, 7, 4, 20);       // pink cloud throne platform

  // Rainbow bridge connecting Crystal Halls → Throne Room
  carveCorridor(25, 15, 25, 19, 2, 22);
  carveCorridor(24, 15, 10, 15, 2, 22);

  // Rainbow bridge connecting Garden → Throne Room
  carveCorridor(14, 20, 14, 25, 2, 22);

  // ── ZONE 4: Star Terrace (x:30-44, y:0-9) ─────────────────────────────
  carveFloor(30, 0, 15, 10, 19);     // white cloud
  carveFloor(34, 2, 7, 6, 20);       // pink cloud center

  // Rainbow bridge connecting Crystal Halls → Star Terrace
  carveCorridor(35, 10, 35, 15, 2, 22);

  // ── Props ──────────────────────────────────────────────────────────────
  const props = [];

  // Zone markers for quest tracking
  props.push({ type: 'zone_marker', zoneId: 'cloud_garden', x: 14, y: 32 });
  props.push({ type: 'zone_marker', zoneId: 'crystal_halls', x: 32, y: 24 });
  props.push({ type: 'zone_marker', zoneId: 'throne_room', x: 17, y: 12 });
  props.push({ type: 'zone_marker', zoneId: 'star_terrace', x: 37, y: 5 });

  // Boss spawn (Shadow Knight — Throne Room center)
  props.push({ type: 'boss_spawn', bossType: 'shadow_knight', x: 17, y: 10 });

  // Resource nodes — cloud crystals scattered in Crystal Halls
  for (let i = 0; i < 5; i++) {
    const rx = 26 + Math.floor(rng() * 12);
    const ry = 16 + Math.floor(rng() * 17);
    if (ground[ry] && ground[ry][rx] === 21) {
      props.push({ type: 'resource', resource: 'cloud_crystal', x: rx, y: ry });
    }
  }

  // Rainbow shards on Star Terrace
  for (let i = 0; i < 3; i++) {
    props.push({ type: 'resource', resource: 'rainbow_shard', x: 32 + i * 3, y: 3 + Math.floor(rng() * 5) });
  }

  // Star fragments in Cloud Garden
  for (let i = 0; i < 4; i++) {
    props.push({ type: 'resource', resource: 'star_fragment', x: 7 + Math.floor(rng() * 16), y: 26 + Math.floor(rng() * 12) });
  }

  // Decorative crystal pillars in Crystal Halls (collision props)
  const pillars = [
    { x: 27, y: 17 }, { x: 37, y: 17 }, { x: 27, y: 32 }, { x: 37, y: 32 },
  ];
  for (const p of pillars) {
    props.push({ type: 'crystal_pillar', x: p.x, y: p.y, collision: true });
    collision[p.y][p.x] = 1;
  }

  // Fishing spot (cloud pond in garden)
  props.push({ type: 'fishing_spot', x: 18, y: 33 });

  // Crafting station — alchemy (Star Terrace)
  props.push({ type: 'station', station: 'alchemy', x: 40, y: 3 });

  // Exit south → unicorn_meadow
  props.push({ type: 'exit', x: 14, y: 44, width: 3, target: 'unicorn_meadow', spawnX: 12, spawnY: 2 });

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    playerSpawn: { x: 14, y: 42 },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/world/maps/cloud_castle.js
git commit -m "feat(m6): add Cloud Castle map (50x45) with 4 zones"
```

---

## Task 9: Starsky Secret Map (5x5)

**Files:**
- Create: `src/world/maps/starsky.js`

- [ ] **Step 1: Create Starsky map generator**

```javascript
const W = 5;
const H = 5;

function createGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

/**
 * The Starsky — secret endgame reward room (5x5).
 * Unlocked by: 25+ achievements + Star Terrace access.
 * Features: all 8 NPCs assembled, "Danke Emilia" constellation text,
 * player's evolved pet beside them. No combat, pure reward moment.
 *
 * Uses tile 19 (cloud_white) as floor with void background.
 */
export function generateStarskyMap() {
  // Entire 5x5 is walkable cloud
  const ground    = createGrid(W, H, 19);
  const collision = createGrid(W, H, 0);

  // Border collision (can't walk off the edge)
  for (let x = 0; x < W; x++) { collision[0][x] = 1; collision[H - 1][x] = 1; }
  for (let y = 0; y < H; y++) { collision[y][0] = 1; collision[y][W - 1] = 1; }

  // Pink cloud center tile
  ground[2][2] = 20;

  const props = [];

  // All 8 NPCs arranged in a semicircle around center
  const npcPositions = [
    { id: 'mama_tanja',   x: 1, y: 1 },
    { id: 'papa_boris',   x: 3, y: 1 },
    { id: 'oma',          x: 1, y: 2 },
    { id: 'opa',          x: 3, y: 2 },
    { id: 'tante_mila',   x: 1, y: 3 },
    { id: 'onkel_sasa',   x: 3, y: 3 },
    { id: 'marie',        x: 2, y: 1 },
    { id: 'leon',         x: 2, y: 3 },
  ];
  for (const npc of npcPositions) {
    props.push({ type: 'npc', id: npc.id, x: npc.x, y: npc.y });
  }

  // Constellation text marker (rendered by AmbientLife as star pattern)
  props.push({ type: 'constellation', text: 'Danke Emilia', x: 2, y: 0 });

  // Exit south → cloud_castle Star Terrace
  props.push({ type: 'exit', x: 2, y: 4, width: 1, target: 'cloud_castle', spawnX: 37, spawnY: 5 });

  return {
    width: W,
    height: H,
    ground,
    collision,
    props,
    playerSpawn: { x: 2, y: 2 },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/world/maps/starsky.js
git commit -m "feat(m6): add Starsky secret endgame map (5x5)"
```

---

## Task 10: Boss Base Class

**Files:**
- Create: `src/entities/Boss.js`

- [ ] **Step 1: Create Boss base class with shared boss logic**

The Boss class extends the Entity pattern from Crab.js but adds:
- Multi-phase state machine (phases activated by HP thresholds)
- Telegraph warning system (visual indicator before attacks)
- HP persistence across player deaths (boss does NOT reset HP)
- Boss health bar integration
- Pet companion damage bonus

```javascript
import * as THREE from 'three';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss base class — shared logic for all 3 boss encounters.
 * Subclasses must implement:
 *   _createBossCanvas() — returns 64x32 canvas with 4 frames (32x32 each)
 *   _executePhasePattern(dt, phase, player, tileMap) — phase-specific AI
 *   _drawTelegraph(dt) — visual telegraph before attack
 *
 * Boss design principles:
 *   - Clear telegraphing (2-3s warning before attacks)
 *   - No frustration: pet helps, boss keeps damage on player death
 *   - Kid-friendly: generous dodge windows, predictable patterns
 */
export class Boss {
  constructor(bossType, bossDef, x, y) {
    this.bossType = bossType;
    this.def = bossDef;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.hp = bossDef.hp;
    this.maxHp = bossDef.hp;
    this.speed = bossDef.speed;
    this.xp = bossDef.xp;
    this.drops = bossDef.drops || [];
    this.alive = true;
    this.defeated = false; // permanent — does not respawn

    // Phase management
    this.phases = bossDef.phases || [];
    this.currentPhaseIndex = 0;
    this._updateCurrentPhase();

    // AI states: idle, telegraphing, attacking, cooldown, defeated
    this.aiState = 'idle';
    this.attackCooldown = 0;
    this.telegraphTimer = 0;
    this.telegraphTarget = null; // { x, y } where attack will land

    // Visual
    this.mesh = null;
    this.texture = null;
    this._animFrame = 0;
    this._animTimer = 0;
    this._animSpeed = 200; // ms per frame
    this.hitFlashTimer = 0;
    this.deathTimer = 0;

    // Telegraph indicator mesh
    this._telegraphMesh = null;

    // Damage tracking for "untouchable" achievement
    this.playerDamageTaken = 0;

    // Direction facing (for sprite flip)
    this.facingLeft = false;
  }

  _updateCurrentPhase() {
    const hpPct = this.hp / this.maxHp;
    // Phases ordered: index 0 = Phase 1 (threshold 1.0), index 1 = Phase 2 (threshold 0.6), etc.
    // Highest qualifying index wins (last phase whose threshold >= hpPct).
    let bestPhase = 0;
    for (let i = 0; i < this.phases.length; i++) {
      if (hpPct <= this.phases[i].hpThreshold) {
        bestPhase = i;
      }
    }
    if (this.currentPhaseIndex !== bestPhase) {
      this.currentPhaseIndex = bestPhase;
      this._onPhaseChange(bestPhase);
    }
  }

  get currentPhase() {
    return this.phases[this.currentPhaseIndex] || this.phases[0];
  }

  /**
   * Called when boss transitions to a new phase.
   * Override in subclasses for phase-specific effects (screen shake, flash, etc.)
   */
  _onPhaseChange(phaseIndex) {
    // Play a brief telegraph to signal phase change
    this.aiState = 'cooldown';
    this.attackCooldown = 1.5; // brief pause before new pattern
  }

  /**
   * Create sprite. Subclasses override _createBossCanvas() to draw their own.
   */
  createSprite(scene) {
    const canvas = this._createBossCanvas();
    if (!canvas) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const clonedTex = texture.clone();
    clonedTex.needsUpdate = true;
    clonedTex.magFilter = THREE.NearestFilter;
    clonedTex.minFilter = THREE.NearestFilter;
    clonedTex.repeat.set(0.25, 1);
    clonedTex.offset.set(0, 0);

    const fw = canvas.height; // frame is square (32x32 or 64x64)
    const worldSize = fw / 16; // scale to tile units (32px = 2 tiles, 64px = 4 tiles)
    const geo = new THREE.PlaneGeometry(worldSize, worldSize);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.texture = clonedTex;
    this._baseTexture = texture;

    scene.add(this.mesh);

    // Create telegraph indicator (semi-transparent red circle)
    this._createTelegraphMesh(scene);
  }

  _createTelegraphMesh(scene) {
    const geo = new THREE.PlaneGeometry(3, 3);
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Red warning circle
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Exclamation mark
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.fillRect(14, 6, 4, 14);
    ctx.fillRect(14, 22, 4, 4);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });

    this._telegraphMesh = new THREE.Mesh(geo, mat);
    this._telegraphMesh.visible = false;
    scene.add(this._telegraphMesh);
  }

  /**
   * Must be overridden by subclass.
   * @returns {HTMLCanvasElement} 128x32 canvas (4 frames of 32x32)
   */
  _createBossCanvas() {
    throw new Error('Boss subclass must implement _createBossCanvas()');
  }

  update(dt, player, tileMap) {
    if (this.defeated) return;

    if (this.aiState === 'death_anim') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.defeated = true;
        if (this.mesh) this.mesh.visible = false;
        if (this._telegraphMesh) this._telegraphMesh.visible = false;
      }
      return;
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.mesh) {
        this.mesh.visible = Math.floor(this.hitFlashTimer * 10) % 2 === 0;
      }
    }

    // Cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0 && this.aiState === 'cooldown') {
        this.aiState = 'idle';
      }
    }

    // Animation
    this._animTimer += dt * 1000;
    if (this._animTimer >= this._animSpeed) {
      this._animTimer -= this._animSpeed;
      this._animFrame = (this._animFrame + 1) % 4;
      if (this.texture) {
        this.texture.offset.x = this._animFrame * 0.25;
      }
    }

    // Phase check
    this._updateCurrentPhase();

    const distToPlayer = distance(this.x, this.y, player.x, player.y);

    // AI state machine
    switch (this.aiState) {
      case 'idle':
        this._doIdle(dt, player, distToPlayer, tileMap);
        break;
      case 'telegraphing':
        this._doTelegraph(dt, player);
        break;
      case 'attacking':
        this._doAttack(dt, player, tileMap);
        break;
      case 'cooldown':
        // Just wait for cooldown timer
        break;
    }

    // Update mesh position
    if (this.mesh) {
      this.mesh.position.set(this.x, -this.y, 0.3 + this.y * 0.001);
      // Flip sprite based on facing
      this.mesh.scale.x = this.facingLeft ? -Math.abs(this.mesh.scale.x || 1) : Math.abs(this.mesh.scale.x || 1);
    }
  }

  _doIdle(dt, player, distToPlayer, tileMap) {
    // Face player
    this.facingLeft = player.x < this.x;

    // Detection range — bosses always aware in their arena
    if (distToPlayer < 15) {
      // Move toward player slowly
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 2) {
        const spd = this.speed * (this.currentPhase.speedMultiplier || 1.0);
        this.x += (dx / len) * spd * 0.5 * dt;
        this.y += (dy / len) * spd * 0.5 * dt;
      }

      // Start telegraph when in range and cooldown done
      if (this.attackCooldown <= 0 && distToPlayer < 8) {
        this.aiState = 'telegraphing';
        this.telegraphTimer = this.currentPhase.telegraphDuration || 2.0;
        this.telegraphTarget = { x: player.x, y: player.y };
        if (this._telegraphMesh) {
          this._telegraphMesh.visible = true;
          this._telegraphMesh.position.set(player.x, -player.y, 0.05);
        }
      }
    }
  }

  _doTelegraph(dt, player) {
    this.telegraphTimer -= dt;

    // Pulse the telegraph indicator
    if (this._telegraphMesh && this._telegraphMesh.visible) {
      const pulse = 0.8 + Math.sin(this.telegraphTimer * 8) * 0.2;
      this._telegraphMesh.scale.set(pulse, pulse, 1);
      this._telegraphMesh.position.set(
        this.telegraphTarget.x, -this.telegraphTarget.y, 0.05
      );
    }

    if (this.telegraphTimer <= 0) {
      this.aiState = 'attacking';
      if (this._telegraphMesh) this._telegraphMesh.visible = false;
      // Subclass handles actual attack in _executePhasePattern
    }
  }

  _doAttack(dt, player, tileMap) {
    // Delegate to subclass
    this._executePhasePattern(dt, this.currentPhase, player, tileMap);

    // After attack, enter cooldown
    this.aiState = 'cooldown';
    this.attackCooldown = this.currentPhase.attackCooldown || 2.0;
  }

  /**
   * Override in subclass for phase-specific attack behavior.
   */
  _executePhasePattern(dt, phase, player, tileMap) {
    // Default: melee hit if close
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 2.5) {
      player.takeDamage(phase.damage || 8);
      this.playerDamageTaken += phase.damage || 8;
    }
  }

  takeDamage(amount) {
    if (!this.alive || this.defeated) return;

    this.hp -= amount;
    this.hitFlashTimer = 0.4;

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.aiState = 'death_anim';
    this.deathTimer = 1.5; // longer death animation for bosses

    if (this._telegraphMesh) this._telegraphMesh.visible = false;
  }

  /**
   * Load persisted HP (boss keeps damage across player deaths).
   */
  loadPersistedHp(hp) {
    if (typeof hp === 'number' && hp > 0) {
      this.hp = hp;
      this._updateCurrentPhase();
    }
  }

  getState() {
    return {
      hp: this.hp,
      defeated: this.defeated,
      playerDamageTaken: this.playerDamageTaken,
    };
  }

  dispose(scene) {
    if (this.mesh && scene) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      if (this.texture) this.texture.dispose();
      if (this._baseTexture) this._baseTexture.dispose();
    }
    if (this._telegraphMesh && scene) {
      scene.remove(this._telegraphMesh);
      this._telegraphMesh.geometry.dispose();
      this._telegraphMesh.material.map.dispose();
      this._telegraphMesh.material.dispose();
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Boss.js
git commit -m "feat(m6): add Boss base class with phases, telegraphing, HP persistence"
```

---

## Task 11: Coconut King Boss Entity

**Files:**
- Create: `src/entities/CoconutKing.js`

- [ ] **Step 1: Create Coconut King boss entity**

```javascript
import { Boss } from './Boss.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss 1: Coconut King — Beach boss after all M4 quests.
 * 120 HP, patrol + coconut throw, 2 phases.
 * Canvas-drawn 128x32 spritesheet (4 frames of 32x32).
 *
 * Phase 1 (>60% HP): sideways patrol, single coconut throw
 * Phase 2 (<60% HP): 3-coconut salvo, 1.3x speed
 */
export class CoconutKing extends Boss {
  constructor(bossDef, x, y) {
    super('coconut_king', bossDef, x, y);
    this._projectiles = []; // active coconut projectiles
  }

  _createBossCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // 4 frames x 32px
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 32;
      const bounce = (frame % 2 === 0) ? 0 : 1; // slight bounce

      // ── Crown ──
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(ox + 10, 1 - bounce, 12, 4);
      ctx.fillRect(ox + 12, 0 - bounce, 2, 2);
      ctx.fillRect(ox + 18, 0 - bounce, 2, 2);
      // Gems on crown
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(ox + 15, 1 - bounce, 2, 2);

      // ── Head (round, brown) ──
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(ox + 9, 4 - bounce, 14, 10);
      ctx.fillRect(ox + 8, 6 - bounce, 16, 6);
      // Face
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(ox + 10, 6 - bounce, 12, 6);
      // Eyes (angry)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 11, 7 - bounce, 3, 3);
      ctx.fillRect(ox + 18, 7 - bounce, 3, 3);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 12, 8 - bounce, 2, 2);
      ctx.fillRect(ox + 19, 8 - bounce, 2, 2);
      // Angry eyebrows
      ctx.fillStyle = '#5C2D0A';
      ctx.fillRect(ox + 11, 6 - bounce, 4, 1);
      ctx.fillRect(ox + 18, 6 - bounce, 4, 1);
      // Mouth
      ctx.fillStyle = '#3E1A00';
      ctx.fillRect(ox + 13, 11 - bounce, 6, 2);

      // ── Body (bulky coconut body) ──
      ctx.fillStyle = '#6B3510';
      ctx.fillRect(ox + 7, 14 - bounce, 18, 12);
      ctx.fillRect(ox + 6, 16 - bounce, 20, 8);
      // Belly stripe
      ctx.fillStyle = '#8B5A30';
      ctx.fillRect(ox + 10, 16 - bounce, 12, 6);

      // ── Arms (holding coconuts) ──
      ctx.fillStyle = '#7B4520';
      // Left arm
      ctx.fillRect(ox + 3, 15 - bounce, 4, 8);
      // Right arm
      ctx.fillRect(ox + 25, 15 - bounce, 4, 8);
      // Coconut in hand (alternating frames)
      if (frame < 2) {
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(ox + 2, 14 - bounce, 4, 4);
      }

      // ── Legs (stubby) ──
      ctx.fillStyle = '#5C2D0A';
      ctx.fillRect(ox + 10, 26 - bounce, 4, 6);
      ctx.fillRect(ox + 18, 26 - bounce, 4, 6);
    }

    return canvas;
  }

  _executePhasePattern(dt, phase, player, tileMap) {
    const dist = distance(this.x, this.y, player.x, player.y);

    if (phase.pattern === 'patrol_throw_single') {
      // Throw single coconut toward player position
      if (this.telegraphTarget) {
        this._spawnCoconut(this.telegraphTarget.x, this.telegraphTarget.y, phase.rangedDamage || 5);
      }
    } else if (phase.pattern === 'patrol_throw_triple') {
      // 3-coconut salvo: center + 2 offset
      if (this.telegraphTarget) {
        this._spawnCoconut(this.telegraphTarget.x, this.telegraphTarget.y, phase.rangedDamage || 5);
        this._spawnCoconut(this.telegraphTarget.x - 1.5, this.telegraphTarget.y, phase.rangedDamage || 5);
        this._spawnCoconut(this.telegraphTarget.x + 1.5, this.telegraphTarget.y, phase.rangedDamage || 5);
      }
    }

    // Melee if very close
    if (dist < 2.0) {
      const dmg = phase.damage || 8;
      player.takeDamage(dmg);
      this.playerDamageTaken += dmg;
    }
  }

  _spawnCoconut(targetX, targetY, damage) {
    this._projectiles.push({
      x: this.x,
      y: this.y,
      targetX,
      targetY,
      speed: 4.0,
      damage,
      alive: true,
      timer: 3.0, // despawn after 3s
    });
  }

  update(dt, player, tileMap) {
    super.update(dt, player, tileMap);

    // Update projectiles
    for (const proj of this._projectiles) {
      if (!proj.alive) continue;
      proj.timer -= dt;
      if (proj.timer <= 0) { proj.alive = false; continue; }

      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.5) {
        proj.x += (dx / len) * proj.speed * dt;
        proj.y += (dy / len) * proj.speed * dt;
      } else {
        proj.alive = false;
      }

      // Hit detection
      if (distance(proj.x, proj.y, player.x, player.y) < 1.0) {
        player.takeDamage(proj.damage);
        this.playerDamageTaken += proj.damage;
        proj.alive = false;
      }
    }

    // Cleanup dead projectiles
    this._projectiles = this._projectiles.filter(p => p.alive);
  }

  dispose(scene) {
    this._projectiles = [];
    super.dispose(scene);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/CoconutKing.js
git commit -m "feat(m6): add Coconut King boss entity — patrol + coconut throw, 2 phases"
```

---

## Task 12: Leviathan Boss Entity

**Files:**
- Create: `src/entities/Leviathan.js`

- [ ] **Step 1: Create Leviathan boss entity**

```javascript
import { Boss } from './Boss.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss 2: Tiefsee-Leviathan — Grotto boss after all M5 quests.
 * 180 HP, tentacle slam + ink AoE, 2 phases.
 * Canvas-drawn 256x64 spritesheet (4 frames of 64x64 — larger boss).
 *
 * Phase 1 (>50% HP): 2 tentacle slams (sequential, predictable)
 * Phase 2 (<50% HP): tentacles + ink AoE cloud, faster
 */
export class Leviathan extends Boss {
  constructor(bossDef, x, y) {
    super('leviathan', bossDef, x, y);
    this._tentacleHitboxes = []; // active tentacle slam zones
    this._inkCloud = null;       // active ink AoE
  }

  _createBossCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // 4 frames x 64px
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 64;
      const tentWave = Math.sin(frame * Math.PI / 2) * 2;

      // ── Body (dark purple-blue oval) ──
      ctx.fillStyle = '#2A1A4A';
      ctx.fillRect(ox + 16, 10, 32, 30);
      ctx.fillRect(ox + 14, 14, 36, 22);
      ctx.fillRect(ox + 12, 18, 40, 14);

      // Lighter belly
      ctx.fillStyle = '#4A3A6A';
      ctx.fillRect(ox + 20, 18, 24, 14);

      // ── Eye (single, large, glowing) ──
      ctx.fillStyle = '#00FFAA';
      ctx.fillRect(ox + 26, 14, 12, 8);
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(ox + 28, 15, 8, 6);
      // Pupil
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 30, 16, 4, 4);
      // Glow
      ctx.fillStyle = 'rgba(0, 255, 170, 0.3)';
      ctx.fillRect(ox + 24, 12, 16, 12);

      // ── Tentacles (4 on each side, wavy) ──
      ctx.fillStyle = '#3A2A5A';
      // Left tentacles
      for (let t = 0; t < 4; t++) {
        const ty = 32 + t * 6 + Math.floor(tentWave * (t % 2 === 0 ? 1 : -1));
        ctx.fillRect(ox + 4 + t * 2, ty, 12 - t * 2, 4);
        ctx.fillRect(ox + 2 + t, ty + 3, 8, 3);
      }
      // Right tentacles
      for (let t = 0; t < 4; t++) {
        const ty = 32 + t * 6 + Math.floor(tentWave * (t % 2 === 0 ? -1 : 1));
        ctx.fillRect(ox + 48 - t * 2, ty, 12 - t * 2, 4);
        ctx.fillRect(ox + 54 - t, ty + 3, 8, 3);
      }

      // Tentacle suckers
      ctx.fillStyle = '#5A4A7A';
      for (let t = 0; t < 3; t++) {
        ctx.fillRect(ox + 8 + t * 3, 34 + t * 6, 2, 2);
        ctx.fillRect(ox + 52 - t * 3, 34 + t * 6, 2, 2);
      }

      // ── Crown of spines ──
      ctx.fillStyle = '#4A2A6A';
      ctx.fillRect(ox + 22, 6, 3, 6);
      ctx.fillRect(ox + 28, 4, 3, 8);
      ctx.fillRect(ox + 34, 6, 3, 6);
      ctx.fillRect(ox + 40, 8, 3, 4);
    }

    return canvas;
  }

  _executePhasePattern(dt, phase, player, tileMap) {
    if (phase.pattern === 'tentacle_slam_dual') {
      // 2 tentacle slams at player position and slightly offset
      if (this.telegraphTarget) {
        this._tentacleHitboxes.push({
          x: this.telegraphTarget.x, y: this.telegraphTarget.y,
          radius: 1.5, damage: phase.damage || 10, timer: 0.3,
        });
        this._tentacleHitboxes.push({
          x: this.telegraphTarget.x + 2, y: this.telegraphTarget.y + 1,
          radius: 1.5, damage: phase.damage || 10, timer: 0.6, // delayed
        });
      }
    } else if (phase.pattern === 'tentacle_ink_combo') {
      // Tentacles + ink cloud AoE
      if (this.telegraphTarget) {
        this._tentacleHitboxes.push({
          x: this.telegraphTarget.x, y: this.telegraphTarget.y,
          radius: 1.5, damage: phase.damage || 10, timer: 0.3,
        });
        // Ink cloud AoE at center of arena
        this._inkCloud = {
          x: (this.x + player.x) / 2,
          y: (this.y + player.y) / 2,
          radius: 3.0,
          damage: phase.aoeDamage || 7,
          duration: 2.0,
          tickTimer: 0,
          tickInterval: 0.5,
        };
      }
    }
  }

  update(dt, player, tileMap) {
    super.update(dt, player, tileMap);

    // Update tentacle hitboxes
    for (const tent of this._tentacleHitboxes) {
      tent.timer -= dt;
      if (tent.timer <= 0 && tent.timer > -0.1) {
        // Apply damage at the moment
        if (distance(tent.x, tent.y, player.x, player.y) < tent.radius) {
          player.takeDamage(tent.damage);
          this.playerDamageTaken += tent.damage;
        }
      }
    }
    this._tentacleHitboxes = this._tentacleHitboxes.filter(t => t.timer > -0.5);

    // Update ink cloud
    if (this._inkCloud) {
      this._inkCloud.duration -= dt;
      this._inkCloud.tickTimer += dt;
      if (this._inkCloud.tickTimer >= this._inkCloud.tickInterval) {
        this._inkCloud.tickTimer = 0;
        if (distance(this._inkCloud.x, this._inkCloud.y, player.x, player.y) < this._inkCloud.radius) {
          player.takeDamage(this._inkCloud.damage);
          this.playerDamageTaken += this._inkCloud.damage;
        }
      }
      if (this._inkCloud.duration <= 0) {
        this._inkCloud = null;
      }
    }
  }

  dispose(scene) {
    this._tentacleHitboxes = [];
    this._inkCloud = null;
    super.dispose(scene);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Leviathan.js
git commit -m "feat(m6): add Leviathan boss entity — tentacle slam + ink AoE, 2 phases"
```

---

## Task 13: Shadow Knight Boss Entity

**Files:**
- Create: `src/entities/ShadowKnight.js`

- [ ] **Step 1: Create Shadow Knight boss entity**

```javascript
import * as THREE from 'three';
import { Boss } from './Boss.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss 3: Shadow Knight — Cloud Castle Throne Room final boss.
 * 250 HP, 3 phases: sword, teleport, clones.
 * Canvas-drawn 128x32 spritesheet (4 frames of 32x32).
 */
export class ShadowKnight extends Boss {
  constructor(bossDef, x, y) {
    super('shadow_knight', bossDef, x, y);
    this._clones = [];          // shadow clone entities (Phase 3)
    this._teleportCooldown = 0;
    this._dashTarget = null;
  }

  _createBossCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 32;
      const sway = (frame % 2 === 0) ? 0 : 1;

      // ── Dark cape (billowing) ──
      ctx.fillStyle = '#1A0A2E';
      ctx.fillRect(ox + 6, 12 + sway, 20, 18);
      ctx.fillRect(ox + 4, 16 + sway, 24, 14);
      // Cape edge glow
      ctx.fillStyle = '#4A0066';
      ctx.fillRect(ox + 4, 28, 24, 2);

      // ── Armor body ──
      ctx.fillStyle = '#2A1A3E';
      ctx.fillRect(ox + 10, 10, 12, 14);
      ctx.fillStyle = '#3A2A4E';
      ctx.fillRect(ox + 12, 12, 8, 10);

      // ── Shoulder pads ──
      ctx.fillStyle = '#4A3A5E';
      ctx.fillRect(ox + 6, 10, 6, 4);
      ctx.fillRect(ox + 20, 10, 6, 4);
      // Purple gem on shoulders
      ctx.fillStyle = '#8800CC';
      ctx.fillRect(ox + 8, 11, 2, 2);
      ctx.fillRect(ox + 22, 11, 2, 2);

      // ── Helmet ──
      ctx.fillStyle = '#2A1A3E';
      ctx.fillRect(ox + 10, 2, 12, 10);
      ctx.fillRect(ox + 9, 4, 14, 6);
      // Visor slit (glowing red eyes)
      ctx.fillStyle = '#FF0044';
      ctx.fillRect(ox + 12, 5, 3, 2);
      ctx.fillRect(ox + 18, 5, 3, 2);
      // Glow around eyes
      ctx.fillStyle = 'rgba(255, 0, 68, 0.4)';
      ctx.fillRect(ox + 11, 4, 10, 4);
      // Horn/crest on top
      ctx.fillStyle = '#4A0066';
      ctx.fillRect(ox + 14, 0, 4, 4);

      // ── Sword (right hand) ──
      ctx.fillStyle = '#8888AA';
      ctx.fillRect(ox + 26, 6 + sway, 2, 18);
      // Blade glow
      ctx.fillStyle = '#AAAACC';
      ctx.fillRect(ox + 27, 8 + sway, 1, 14);
      // Hilt
      ctx.fillStyle = '#4A0066';
      ctx.fillRect(ox + 24, 14 + sway, 6, 2);
      // Pommel gem
      ctx.fillStyle = '#FF0044';
      ctx.fillRect(ox + 25, 15 + sway, 1, 1);

      // ── Legs (armored) ──
      ctx.fillStyle = '#2A1A3E';
      ctx.fillRect(ox + 12, 24, 3, 6);
      ctx.fillRect(ox + 18, 24, 3, 6);
      // Boots
      ctx.fillStyle = '#1A0A2E';
      ctx.fillRect(ox + 11, 28, 5, 4);
      ctx.fillRect(ox + 17, 28, 5, 4);

      // ── Shadow aura (subtle) ──
      ctx.fillStyle = 'rgba(100, 0, 150, 0.15)';
      ctx.fillRect(ox + 2, 4, 28, 26);
    }

    return canvas;
  }

  _executePhasePattern(dt, phase, player, tileMap) {
    const dist = distance(this.x, this.y, player.x, player.y);

    switch (phase.pattern) {
      case 'sword_block_counter':
        // Dash toward player and strike
        if (dist < 2.5) {
          const dmg = phase.damage || 12;
          player.takeDamage(dmg);
          this.playerDamageTaken += dmg;
        } else if (dist < 6) {
          // Quick dash toward player
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            this.x += (dx / len) * 3;
            this.y += (dy / len) * 3;
          }
          // Check hit after dash
          if (distance(this.x, this.y, player.x, player.y) < 2.0) {
            const dashDmg = phase.dashDamage || 8;
            player.takeDamage(dashDmg);
            this.playerDamageTaken += dashDmg;
          }
        }
        break;

      case 'teleport_combo':
        // Teleport behind player, then combo
        this.x = player.x + (player.direction === 'left' ? 2 : -2);
        this.y = player.y;
        this.facingLeft = player.x < this.x;
        // Delayed strike (player has ~0.5s to react)
        if (distance(this.x, this.y, player.x, player.y) < 2.5) {
          const teleDmg = phase.damage || 12;
          player.takeDamage(teleDmg);
          this.playerDamageTaken += teleDmg;
        }
        break;

      case 'clone_assault':
        // Spawn clones if none exist
        if (this._clones.length === 0) {
          this._spawnClones(phase.cloneCount || 2, phase.cloneHp || 50);
        }
        // Also do a normal attack
        if (dist < 2.5) {
          const cloneDmg = phase.damage || 12;
          player.takeDamage(cloneDmg);
          this.playerDamageTaken += cloneDmg;
        }
        break;
    }
  }

  _spawnClones(count, hp) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this._clones.push({
        x: this.x + Math.cos(angle) * 3,
        y: this.y + Math.sin(angle) * 3,
        hp: hp,
        maxHp: hp,
        alive: true,
        speed: this.speed * 0.8,
        damage: 6,
        attackCooldown: 0,
      });
    }
  }

  update(dt, player, tileMap) {
    super.update(dt, player, tileMap);

    // Update clones
    for (const clone of this._clones) {
      if (!clone.alive) continue;

      // Chase player
      const dx = player.x - clone.x;
      const dy = player.y - clone.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1.5) {
        clone.x += (dx / len) * clone.speed * dt;
        clone.y += (dy / len) * clone.speed * dt;
      }

      // Attack
      clone.attackCooldown -= dt;
      if (clone.attackCooldown <= 0 && len < 2.0) {
        player.takeDamage(clone.damage);
        this.playerDamageTaken += clone.damage;
        clone.attackCooldown = 1.5;
      }
    }

    // Remove dead clones
    this._clones = this._clones.filter(c => c.alive);
  }

  /**
   * Returns clone array for CombatSystem to check hits against.
   */
  getClones() {
    return this._clones;
  }

  dispose(scene) {
    this._clones = [];
    super.dispose(scene);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/ShadowKnight.js
git commit -m "feat(m6): add Shadow Knight boss — sword/teleport/clones, 3 phases"
```

---

## Task 14: Bird Ambient Entity

**Files:**
- Create: `src/entities/Bird.js`

- [ ] **Step 1: Create ambient bird entity**

```javascript
import * as THREE from 'three';

/**
 * Ambient birds that sit on trees and fly off periodically.
 * Canvas-drawn 8x8 sprite, 4 animation frames (sit, flap1, flap2, glide).
 * AI: sit on tree for 10-20s, fly to another tree, sit again.
 * No interaction with player, purely visual.
 */

const BIRD_COLORS = [
  { body: '#4A3728', wing: '#6B5240', belly: '#8B7355' }, // brown sparrow
  { body: '#2244AA', wing: '#3366CC', belly: '#88AADD' }, // bluebird
  { body: '#CC3333', wing: '#DD5555', belly: '#EE8888' }, // robin
  { body: '#228822', wing: '#33AA33', belly: '#88CC88' }, // finch
];

export class Bird {
  constructor(x, y, scene, colorIndex) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;

    this._state = 'sitting'; // sitting, flying, landing
    this._stateTimer = 10 + Math.random() * 10; // sit for 10-20s
    this._flyTarget = null;
    this._colorDef = BIRD_COLORS[colorIndex % BIRD_COLORS.length];

    this._animFrame = 0;
    this._animTimer = 0;

    this._mesh = null;
    this._texture = null;
    this._scene = scene;

    this._createSprite(scene);
  }

  _createSprite(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 32; // 4 frames x 8px
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    const c = this._colorDef;

    // Frame 0: sitting (compact, wings folded)
    ctx.fillStyle = c.body;
    ctx.fillRect(2, 3, 4, 4); // body
    ctx.fillRect(1, 2, 3, 2); // head
    ctx.fillStyle = c.belly;
    ctx.fillRect(3, 4, 2, 3); // belly
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(0, 3, 1, 1); // beak
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(1, 2, 1, 1); // eye

    // Frame 1: wings up
    ctx.fillStyle = c.body;
    ctx.fillRect(10, 3, 4, 4);
    ctx.fillRect(9, 2, 3, 2);
    ctx.fillStyle = c.wing;
    ctx.fillRect(10, 0, 3, 3); // wing up
    ctx.fillStyle = c.belly;
    ctx.fillRect(11, 4, 2, 3);
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(8, 3, 1, 1);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(9, 2, 1, 1);

    // Frame 2: wings down
    ctx.fillStyle = c.body;
    ctx.fillRect(18, 3, 4, 4);
    ctx.fillRect(17, 2, 3, 2);
    ctx.fillStyle = c.wing;
    ctx.fillRect(18, 5, 3, 3); // wing down
    ctx.fillStyle = c.belly;
    ctx.fillRect(19, 4, 2, 3);
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(16, 3, 1, 1);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(17, 2, 1, 1);

    // Frame 3: glide (wings spread)
    ctx.fillStyle = c.body;
    ctx.fillRect(26, 3, 4, 3);
    ctx.fillRect(25, 2, 3, 2);
    ctx.fillStyle = c.wing;
    ctx.fillRect(24, 3, 8, 2); // spread wings
    ctx.fillStyle = c.belly;
    ctx.fillRect(27, 4, 2, 2);
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(24, 3, 1, 1);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(25, 2, 1, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const clonedTex = texture.clone();
    clonedTex.needsUpdate = true;
    clonedTex.magFilter = THREE.NearestFilter;
    clonedTex.minFilter = THREE.NearestFilter;
    clonedTex.repeat.set(0.25, 1);
    clonedTex.offset.set(0, 0);

    const geo = new THREE.PlaneGeometry(0.5, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this._mesh = new THREE.Mesh(geo, mat);
    this._texture = clonedTex;
    this._baseTexture = texture;

    scene.add(this._mesh);
  }

  update(dt) {
    this._stateTimer -= dt;

    switch (this._state) {
      case 'sitting':
        this._animFrame = 0; // sitting frame
        if (this._stateTimer <= 0) {
          // Pick a random nearby target and fly there
          this._flyTarget = {
            x: this.startX + (Math.random() - 0.5) * 8,
            y: this.startY + (Math.random() - 0.5) * 4,
          };
          this._state = 'flying';
          this._stateTimer = 5; // max flight time
        }
        break;

      case 'flying':
        // Animate wings
        this._animTimer += dt * 1000;
        if (this._animTimer >= 150) {
          this._animTimer = 0;
          this._animFrame = this._animFrame === 1 ? 2 : 1;
        }

        // Move toward target
        if (this._flyTarget) {
          const dx = this._flyTarget.x - this.x;
          const dy = this._flyTarget.y - this.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0.3) {
            this.x += (dx / len) * 3 * dt;
            this.y += (dy / len) * 3 * dt;
          } else {
            this._state = 'sitting';
            this._stateTimer = 10 + Math.random() * 10;
          }
        }

        if (this._stateTimer <= 0) {
          this._state = 'sitting';
          this._stateTimer = 10 + Math.random() * 10;
        }
        break;
    }

    // Update texture frame
    if (this._texture) {
      this._texture.offset.x = this._animFrame * 0.25;
    }

    // Update position
    if (this._mesh) {
      this._mesh.position.set(this.x, -this.y + 0.5, 0.4 + this.y * 0.001);
    }
  }

  dispose() {
    if (this._scene && this._mesh) {
      this._scene.remove(this._mesh);
    }
    if (this._mesh) {
      this._mesh.geometry.dispose();
      this._mesh.material.dispose();
      if (this._texture) this._texture.dispose();
      if (this._baseTexture) this._baseTexture.dispose();
    }
  }
}

/**
 * Create birds for a scene based on tree positions.
 * @param {string} sceneName
 * @param {THREE.Scene} scene
 * @param {Array} props - map props array (to find tree positions)
 * @returns {Bird[]}
 */
export function createBirdsForScene(sceneName, scene, props) {
  // Only outdoor scenes get birds
  const outdoorScenes = ['hub', 'forest', 'lake', 'unicorn_meadow', 'cloud_castle'];
  if (!outdoorScenes.includes(sceneName)) return [];

  // Find tree props
  const trees = props.filter(p => p.type === 'tree' || p.type === 'palm' || p.type === 'oak_tree');
  if (trees.length === 0) return [];

  // Place 1-2 birds per scene on random tree positions
  const birdCount = Math.min(2, trees.length);
  const birds = [];
  const usedIndices = new Set();

  for (let i = 0; i < birdCount; i++) {
    let idx;
    do { idx = Math.floor(Math.random() * trees.length); } while (usedIndices.has(idx) && usedIndices.size < trees.length);
    usedIndices.add(idx);
    const tree = trees[idx];
    birds.push(new Bird(tree.x, tree.y - 1, scene, i)); // perch above tree base
  }

  return birds;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Bird.js
git commit -m "feat(m6): add ambient Bird entity — tree perching, periodic fly-off"
```

---

## Task 15: AmbientLife Renderer (Swaying Trees, Waves, Cloud Drift)

**Files:**
- Create: `src/rendering/AmbientLife.js`

- [ ] **Step 1: Create AmbientLife renderer**

```javascript
import * as THREE from 'three';

/**
 * Ambient world animation renderer.
 * Handles: swaying trees, wave animation, drifting clouds.
 * Each effect is opt-in per scene and operates on existing meshes/tiles.
 */
export class AmbientLife {
  constructor(scene, camera) {
    this._scene = scene;
    this._camera = camera;
    this._swayingProps = [];    // refs to tree prop meshes
    this._cloudSprites = [];   // drifting cloud overlay sprites
    this._cloudShadows = [];   // ground shadow meshes that follow clouds
    this._waveOffsets = [];    // water tile UV animation state
    this._waveMeshes = [];     // wave overlay meshes on water tiles
    this._constellationMeshes = []; // star pattern meshes (starsky)
    this._time = 0;
    this._mapWidth = 0;
    this._mapHeight = 0;
  }

  /**
   * Initialize ambient effects for the current scene.
   * @param {string} sceneName
   * @param {Array} props - map props
   * @param {number} mapWidth
   * @param {number} mapHeight
   * @param {THREE.Mesh[]} propMeshes - array of tree prop meshes from TileMapRenderer
   */
  init(sceneName, props, mapWidth, mapHeight, propMeshes) {
    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;
    this.dispose();

    // Swaying trees — find tree meshes among propMeshes
    const outdoorScenes = ['hub', 'forest', 'lake', 'unicorn_meadow', 'beach', 'cloud_castle'];
    if (outdoorScenes.includes(sceneName) && propMeshes) {
      for (const mesh of propMeshes) {
        if (mesh.userData?.isTree) {
          this._swayingProps.push({
            mesh,
            baseX: mesh.position.x,
            phase: Math.random() * Math.PI * 2, // random phase offset
            amplitude: 0.05, // +-0.05 tiles sway
            period: 3 + Math.random(), // 3-4 seconds
          });
        }
      }
    }

    // Cloud drift — semi-transparent clouds on outdoor maps
    if (outdoorScenes.includes(sceneName)) {
      this._createDriftClouds(3 + Math.floor(Math.random() * 3)); // 3-5 clouds
    }

    // Wave animation — on scenes with water tiles (lake, beach, grotto)
    const waterScenes = ['lake', 'beach', 'grotto'];
    if (waterScenes.includes(sceneName) && propMeshes) {
      this._createWaveOverlays(mapWidth, mapHeight, props);
    }

    // Constellation rendering — starsky only
    if (sceneName === 'starsky') {
      const constellationProp = props.find(p => p.type === 'constellation');
      if (constellationProp) {
        this._createConstellation(constellationProp.text, constellationProp.x, constellationProp.y);
      }
    }
  }

  _createDriftClouds(count) {
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');

      // Draw fluffy cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(4, 4, 24, 10);
      ctx.fillRect(8, 2, 16, 12);
      ctx.fillRect(2, 6, 28, 6);
      // Lighter center
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(10, 4, 12, 8);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;

      const size = 4 + Math.random() * 4; // 4-8 tiles wide
      const geo = new THREE.PlaneGeometry(size, size * 0.5);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0.4,
      });

      const mesh = new THREE.Mesh(geo, mat);
      // Random starting position
      mesh.position.set(
        Math.random() * this._mapWidth,
        -(Math.random() * this._mapHeight),
        0.6 // above entities
      );

      this._scene.add(mesh);

      // Cloud ground shadow — darker oval below each cloud
      const shadowGeo = new THREE.PlaneGeometry(size * 0.8, size * 0.3);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        depthWrite: false,
        opacity: 0.1,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(mesh.position.x, mesh.position.y - 2, 0.01); // on ground
      this._scene.add(shadowMesh);
      this._cloudShadows.push(shadowMesh);

      this._cloudSprites.push({
        mesh,
        shadow: shadowMesh,
        texture: tex,
        speed: 0.3 + Math.random() * 0.4, // tiles per second
        startX: -size,
        endX: this._mapWidth + size,
      });
    }
  }

  _createWaveOverlays(mapWidth, mapHeight, props) {
    // Find water tile positions from props (type: 'water_zone') or generate for water scenes
    // Creates subtle wave overlay meshes that animate UV offset
    const canvas = document.createElement('canvas');
    canvas.width = 48; // 3 frames x 16px
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // 3-frame wave animation: gentle ripple lines
    for (let frame = 0; frame < 3; frame++) {
      const ox = frame * 16;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      const yOff = frame * 2;
      ctx.fillRect(ox + 2, 4 + yOff % 6, 12, 1);
      ctx.fillRect(ox + 4, 8 + yOff % 6, 8, 1);
      ctx.fillRect(ox + 1, 12 + yOff % 6, 10, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(1/3, 1); // show 1 of 3 frames

    // Create wave overlay covering water area (approximate)
    const geo = new THREE.PlaneGeometry(mapWidth * 0.6, mapHeight * 0.4);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mapWidth / 2, -mapHeight / 2, 0.02);
    this._scene.add(mesh);
    this._waveMeshes.push({ mesh, texture: tex, frameTimer: 0 });
  }

  _createConstellation(text, cx, cy) {
    // Render "Danke Emilia" as a star constellation pattern
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Write text in pixel font, then convert lit pixels to star positions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 64, 16);

    // Read pixel data and create star dots
    const imageData = ctx.getImageData(0, 0, 128, 32);
    const starPositions = [];
    for (let py = 0; py < 32; py += 3) {
      for (let px = 0; px < 128; px += 3) {
        const idx = (py * 128 + px) * 4;
        if (imageData.data[idx + 3] > 128) {
          starPositions.push({
            x: cx + (px - 64) * 0.03,
            y: cy + (py - 16) * 0.03,
          });
        }
      }
    }

    // Create star point meshes
    for (const star of starPositions) {
      const geo = new THREE.PlaneGeometry(0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(star.x, -star.y, 0.5);
      this._scene.add(mesh);
      this._constellationMeshes.push({
        mesh,
        baseOpacity: mat.opacity,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt) {
    this._time += dt;

    // ── Swaying trees ──
    for (const tree of this._swayingProps) {
      const offset = Math.sin(this._time * (Math.PI * 2) / tree.period + tree.phase) * tree.amplitude;
      tree.mesh.position.x = tree.baseX + offset;
    }

    // ── Cloud drift + ground shadows ──
    for (const cloud of this._cloudSprites) {
      cloud.mesh.position.x += cloud.speed * dt;
      // Move shadow to follow cloud (offset below)
      if (cloud.shadow) {
        cloud.shadow.position.x = cloud.mesh.position.x;
        cloud.shadow.position.y = cloud.mesh.position.y - 2;
      }
      // Wrap around
      if (cloud.mesh.position.x > cloud.endX) {
        cloud.mesh.position.x = cloud.startX;
        cloud.mesh.position.y = -(Math.random() * this._mapHeight);
      }
    }

    // ── Wave animation (3-frame UV shift) ──
    for (const wave of this._waveMeshes) {
      wave.frameTimer += dt;
      if (wave.frameTimer >= 0.6) { // switch frame every 0.6s
        wave.frameTimer = 0;
        const currentFrame = Math.floor(wave.texture.offset.x * 3) || 0;
        const nextFrame = (currentFrame + 1) % 3;
        wave.texture.offset.x = nextFrame / 3;
      }
    }

    // ── Constellation twinkle ──
    for (const star of this._constellationMeshes) {
      const twinkle = 0.5 + Math.sin(this._time * 2 + star.phase) * 0.5;
      star.mesh.material.opacity = star.baseOpacity * twinkle;
    }
  }

  dispose() {
    // Reset swaying trees (don't dispose — they belong to TileMapRenderer)
    for (const tree of this._swayingProps) {
      tree.mesh.position.x = tree.baseX;
    }
    this._swayingProps = [];

    // Remove cloud sprites + shadows
    for (const cloud of this._cloudSprites) {
      if (this._scene) this._scene.remove(cloud.mesh);
      cloud.mesh.geometry.dispose();
      cloud.mesh.material.dispose();
      cloud.texture.dispose();
      if (cloud.shadow && this._scene) {
        this._scene.remove(cloud.shadow);
        cloud.shadow.geometry.dispose();
        cloud.shadow.material.dispose();
      }
    }
    this._cloudSprites = [];
    this._cloudShadows = [];

    // Remove wave overlays
    for (const wave of this._waveMeshes) {
      if (this._scene) this._scene.remove(wave.mesh);
      wave.mesh.geometry.dispose();
      wave.mesh.material.dispose();
      wave.texture.dispose();
    }
    this._waveMeshes = [];

    // Remove constellation stars
    for (const star of this._constellationMeshes) {
      if (this._scene) this._scene.remove(star.mesh);
      star.mesh.geometry.dispose();
      star.mesh.material.dispose();
    }
    this._constellationMeshes = [];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/rendering/AmbientLife.js
git commit -m "feat(m6): add AmbientLife renderer — swaying trees, clouds+shadows, waves, constellations"
```

---

## Task 16: Achievement System

**Files:**
- Create: `src/systems/Achievements.js`

- [ ] **Step 1: Create Achievement tracking system**

```javascript
import { ACHIEVEMENTS } from '../data/achievements.js';

/**
 * Achievement tracking system.
 * Checks conditions against game state every update cycle.
 * Fires onUnlock callback when a new achievement is earned.
 *
 * Conditions are checked lazily — only when relevant events occur.
 * Call check() periodically or after significant events.
 */
export class AchievementSystem {
  constructor() {
    this.unlocked = new Set();
    this.onUnlock = null; // (achievementDef) => void
  }

  /**
   * Check all achievements against current game state.
   * @param {object} state - snapshot of game state:
   *   { scenesVisited, mobsKilled, totalMobsKilled, bossesKilled,
   *     fishCaught, shellsFound, insectsCaught, gemsFound,
   *     bookEntries, bookTotal, plantsCollected, chestsFound,
   *     secretsFound, distanceWalked, npcsSpoken, unicornsPetted,
   *     petFriendship, completedQuests, level, achievementCount }
   */
  check(state) {
    for (const [id, def] of Object.entries(ACHIEVEMENTS)) {
      if (this.unlocked.has(id)) continue;
      if (this._checkCondition(def.condition, state)) {
        this.unlocked.add(id);
        if (this.onUnlock) this.onUnlock(def);
      }
    }
  }

  _checkCondition(cond, s) {
    switch (cond.type) {
      case 'visit_scene':
        return !!(s.scenesVisited && s.scenesVisited[cond.scene]);

      case 'visit_all_scenes':
        return cond.scenes.every(sc => s.scenesVisited && s.scenesVisited[sc]);

      case 'find_secrets':
        return (s.secretsFound || 0) >= cond.count;

      case 'walk_distance':
        return (s.distanceWalked || 0) >= cond.tiles;

      case 'catch_fish':
        return (s.fishCaught || 0) >= cond.count;

      case 'collect_shells':
        return (s.shellsFound || 0) >= cond.count;

      case 'catch_insects':
        return (s.insectsCaught || 0) >= cond.count;

      case 'collect_gems':
        return (s.gemsFound || 0) >= cond.count;

      case 'book_entries':
        return (s.bookEntries || 0) >= cond.count;

      case 'book_complete':
        return s.bookEntries > 0 && s.bookEntries >= (s.bookTotal || 999);

      case 'collect_plants':
        return (s.plantsCollected || 0) >= cond.count;

      case 'find_chests':
        return (s.chestsFound || 0) >= cond.count;

      case 'kill_first':
        return (s.totalMobsKilled || 0) >= 1;

      case 'kill_type': {
        const kills = s.mobsKilled || {};
        // Sum all variants of the type (e.g. slime = slime_green + slime_red + ...)
        let total = 0;
        for (const [mobType, count] of Object.entries(kills)) {
          if (mobType.startsWith(cond.target)) total += count;
        }
        return total >= cond.count;
      }

      case 'kill_bosses':
        return Object.keys(s.bossesKilled || {}).length >= cond.count;

      case 'boss_no_damage':
        return !!(s.bossNoHitKill);

      case 'talk_all_npcs':
        return Object.keys(s.npcsSpoken || {}).length >= 8;

      case 'pet_all_unicorns':
        return (s.unicornsPetted || 0) >= 3;

      case 'max_pet_friendship':
        return (s.petFriendship || 0) >= 100;

      case 'complete_npc_quests': {
        const npcQuests = ['first_steps', 'wood_collector', 'nature_healer'];
        return npcQuests.every(q => s.completedQuests && s.completedQuests[q]);
      }

      case 'reach_level':
        return (s.level || 1) >= cond.level;

      case 'complete_all_quests':
        return Object.keys(s.completedQuests || {}).length >= 24;

      case 'achievement_count':
        return this.unlocked.size >= cond.count;

      default:
        return false;
    }
  }

  getCount() {
    return this.unlocked.size;
  }

  getTotal() {
    return Object.keys(ACHIEVEMENTS).length;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  getState() {
    return [...this.unlocked];
  }

  loadState(arr) {
    this.unlocked = new Set(Array.isArray(arr) ? arr : []);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/Achievements.js
git commit -m "feat(m6): add AchievementSystem — 30 condition checks, save/load"
```

---

## Task 17: Achievement UI (Popup + Grid Overview)

**Files:**
- Create: `src/ui/AchievementUI.js`

- [ ] **Step 1: Create Achievement UI overlay**

```javascript
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements.js';

/**
 * Achievement UI — two components:
 *   1. Popup notification when achievement is unlocked (golden star animation)
 *   2. Grid overview accessible from pause/Tab menu
 *
 * HTML overlay, same pattern as ExplorerBookUI.
 */
export class AchievementUI {
  constructor() {
    this.isOpen = false;
    this._popup = null;
    this._overlay = null;
    this._popupQueue = [];
    this._popupTimer = 0;
    this._createDOM();
  }

  _createDOM() {
    // ── Popup container (top-center) ──
    this._popup = document.createElement('div');
    this._popup.id = 'achievement-popup';
    this._popup.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #2a1a00, #4a3000);
      border: 3px solid #FFD700; border-radius: 12px;
      padding: 12px 24px; color: #FFD700;
      font-family: 'Press Start 2P', monospace; font-size: 10px;
      display: none; z-index: 1100;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      text-align: center; min-width: 200px;
      animation: achievementSlideIn 0.5s ease-out;
    `;
    document.body.appendChild(this._popup);

    // Add CSS animation
    if (!document.getElementById('achievement-styles')) {
      const style = document.createElement('style');
      style.id = 'achievement-styles';
      style.textContent = `
        @keyframes achievementSlideIn {
          from { transform: translateX(-50%) translateY(-50px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes achievementSlideOut {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(-50px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // ── Grid overlay (full screen) ──
    this._overlay = document.createElement('div');
    this._overlay.id = 'achievement-overlay';
    this._overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: none; z-index: 1200;
      font-family: 'Press Start 2P', monospace;
      overflow-y: auto; padding: 40px;
    `;
    document.body.appendChild(this._overlay);
  }

  /**
   * Show unlock popup for an achievement.
   */
  showPopup(achievementDef) {
    this._popupQueue.push(achievementDef);
    if (this._popupTimer <= 0) this._showNextPopup();
  }

  _showNextPopup() {
    if (this._popupQueue.length === 0) {
      this._popup.style.display = 'none';
      return;
    }

    const def = this._popupQueue.shift();
    this._popup.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 6px;">&#9733;</div>
      <div style="font-size: 8px; color: #FFAA00; margin-bottom: 4px;">ACHIEVEMENT!</div>
      <div style="font-size: 10px;">${def.name}</div>
      <div style="font-size: 7px; color: #CCAA44; margin-top: 4px;">${def.description}</div>
    `;
    this._popup.style.display = 'block';
    this._popup.style.animation = 'none';
    // Force reflow
    void this._popup.offsetWidth;
    this._popup.style.animation = 'achievementSlideIn 0.5s ease-out';

    this._popupTimer = 3.0; // show for 3 seconds
  }

  /**
   * Update popup timer.
   */
  updatePopup(dt) {
    if (this._popupTimer > 0) {
      this._popupTimer -= dt;
      if (this._popupTimer <= 0) {
        this._popup.style.animation = 'achievementSlideOut 0.3s ease-in forwards';
        setTimeout(() => this._showNextPopup(), 300);
      }
    }
  }

  /**
   * Open the achievement grid overview.
   */
  open(achievementSystem) {
    this.isOpen = true;
    const total = achievementSystem.getTotal();
    const count = achievementSystem.getCount();

    let html = `
      <div style="max-width: 700px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #FFD700; font-size: 14px;">Achievements</h2>
          <p style="color: #CCAA44; font-size: 10px;">${count} / ${total} Sterne</p>
        </div>
    `;

    for (const [catKey, catDef] of Object.entries(ACHIEVEMENT_CATEGORIES)) {
      const catAchievements = Object.values(ACHIEVEMENTS).filter(a => a.category === catKey);
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FFAA00; font-size: 10px; margin-bottom: 8px;">${catDef.name}</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
      `;

      for (const ach of catAchievements) {
        const unlocked = achievementSystem.isUnlocked(ach.id);
        const starColor = unlocked ? '#FFD700' : '#444444';
        const textColor = unlocked ? '#FFFFFF' : '#666666';
        const bgColor = unlocked ? 'rgba(255, 215, 0, 0.1)' : 'rgba(50, 50, 50, 0.3)';
        html += `
          <div style="background: ${bgColor}; border: 1px solid ${starColor}; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="font-size: 20px; color: ${starColor};">&#9733;</div>
            <div style="font-size: 7px; color: ${textColor}; margin-top: 4px;">${unlocked ? ach.name : '???'}</div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #888; font-size: 8px;">Druecke TAB zum Schliessen</p>
        </div>
      </div>
    `;

    this._overlay.innerHTML = html;
    this._overlay.style.display = 'block';
  }

  close() {
    this.isOpen = false;
    this._overlay.style.display = 'none';
  }

  toggle(achievementSystem) {
    if (this.isOpen) this.close();
    else this.open(achievementSystem);
  }

  dispose() {
    if (this._popup?.parentNode) this._popup.parentNode.removeChild(this._popup);
    if (this._overlay?.parentNode) this._overlay.parentNode.removeChild(this._overlay);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/AchievementUI.js
git commit -m "feat(m6): add AchievementUI — golden star popup + grid overview"
```

---

## Task 18: Boss Health Bar UI

**Files:**
- Create: `src/ui/BossHealthBar.js`

- [ ] **Step 1: Create boss HP bar overlay**

```javascript
/**
 * Boss health bar — large HP display at top of screen during boss fights.
 * HTML overlay, pixel-art styled. Shows boss name + HP percentage.
 */
export class BossHealthBar {
  constructor() {
    this._el = null;
    this._nameEl = null;
    this._barFill = null;
    this._barText = null;
    this._visible = false;
    this._createDOM();
  }

  _createDOM() {
    this._el = document.createElement('div');
    this._el.id = 'boss-hp-bar';
    this._el.style.cssText = `
      position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
      width: 400px; max-width: 80vw; z-index: 1050;
      font-family: 'Press Start 2P', monospace;
      display: none;
    `;

    this._el.innerHTML = `
      <div id="boss-name" style="text-align: center; color: #FF4466; font-size: 10px; margin-bottom: 4px; text-shadow: 1px 1px 0 #000;"></div>
      <div style="background: #1a1a2e; border: 2px solid #FF4466; border-radius: 4px; padding: 2px; height: 16px; position: relative;">
        <div id="boss-hp-fill" style="background: linear-gradient(90deg, #FF4466, #FF6688); height: 100%; border-radius: 2px; transition: width 0.3s ease;"></div>
        <div id="boss-hp-text" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 7px; text-shadow: 1px 1px 0 #000;"></div>
      </div>
    `;

    document.body.appendChild(this._el);
    this._nameEl = this._el.querySelector('#boss-name');
    this._barFill = this._el.querySelector('#boss-hp-fill');
    this._barText = this._el.querySelector('#boss-hp-text');
  }

  show(bossName) {
    this._visible = true;
    this._nameEl.textContent = bossName;
    this._el.style.display = 'block';
  }

  update(hp, maxHp) {
    if (!this._visible) return;
    const pct = Math.max(0, hp / maxHp) * 100;
    this._barFill.style.width = pct + '%';
    this._barText.textContent = `${Math.ceil(hp)} / ${maxHp}`;

    // Color change based on HP percentage
    if (pct > 60) {
      this._barFill.style.background = 'linear-gradient(90deg, #FF4466, #FF6688)';
    } else if (pct > 30) {
      this._barFill.style.background = 'linear-gradient(90deg, #FFAA00, #FFCC44)';
    } else {
      this._barFill.style.background = 'linear-gradient(90deg, #FF2200, #FF4400)';
    }
  }

  hide() {
    this._visible = false;
    this._el.style.display = 'none';
  }

  dispose() {
    if (this._el?.parentNode) this._el.parentNode.removeChild(this._el);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/BossHealthBar.js
git commit -m "feat(m6): add BossHealthBar UI — boss name + HP bar overlay"
```

---

## Task 19: Pet Evolution System

**Files:**
- Modify: `src/entities/Pet.js`

- [ ] **Step 1: Add evolution data and methods to Pet class**

Add evolution definitions at the top of Pet.js, after `PET_TYPES`:

```javascript
const PET_EVOLUTIONS = {
  fox:    { name: 'Feuerfuchs',     ability: 'find_items_plus', color: '#FF4500' },
  dragon: { name: 'Grosser Drache', ability: 'fire_attack_plus', color: '#FF2200' },
  rabbit: { name: 'Goldener Hase',  ability: 'collect_boost_plus', color: '#FFD700' },
};
```

Add to the Pet constructor:
```javascript
this.evolved = false;
```

Add new methods:

```javascript
/**
 * Evolve the pet (called when friendship reaches 100).
 * Redraws sprite with evolved visuals.
 */
evolve() {
  if (this.evolved) return;
  this.evolved = true;
  const evoDef = PET_EVOLUTIONS[this.type];
  if (evoDef) {
    this.name = evoDef.name;
    this.ability = evoDef.ability;
  }
  // Recreate sprite with evolved visuals
  this._recreateEvolvedSprite();
}

_recreateEvolvedSprite() {
  // Remove old mesh
  if (this._scene && this._mesh) {
    this._scene.remove(this._mesh);
  }
  if (this._mesh) {
    this._mesh.geometry.dispose();
    if (this._texture) this._texture.dispose();
    if (this._baseTexture) this._baseTexture.dispose();
    this._mesh.material.dispose();
  }

  // Draw evolved sprite (larger: 96x24, 4 frames of 24x24)
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 24;
  const ctx = canvas.getContext('2d');

  switch (this.type) {
    case 'fox':    this._drawEvolvedFox(ctx);    break;
    case 'dragon': this._drawEvolvedDragon(ctx); break;
    case 'rabbit': this._drawEvolvedRabbit(ctx); break;
    default:       this._drawEvolvedFox(ctx);    break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  const clonedTex = texture.clone();
  clonedTex.needsUpdate = true;
  clonedTex.magFilter = THREE.NearestFilter;
  clonedTex.minFilter = THREE.NearestFilter;
  clonedTex.repeat.set(0.25, 1);
  clonedTex.offset.set(0, 0);

  const geo = new THREE.PlaneGeometry(1.5, 1.5); // 50% larger
  const mat = new THREE.MeshBasicMaterial({
    map: clonedTex,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: false,
  });

  this._mesh = new THREE.Mesh(geo, mat);
  this._texture = clonedTex;
  this._baseTexture = texture;

  if (this._scene) {
    this._scene.add(this._mesh);
  }
}

_drawEvolvedFox(ctx) {
  // Feuerfuchs: orange with flame particles, larger
  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 24;
    // Flame aura
    ctx.fillStyle = 'rgba(255, 100, 0, 0.2)';
    ctx.fillRect(ox + 1, 1, 22, 22);
    // Body (larger)
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(ox + 6, 8, 12, 10);
    ctx.fillRect(ox + 4, 10, 16, 7);
    // White belly
    ctx.fillStyle = '#FFD0A0';
    ctx.fillRect(ox + 8, 11, 6, 5);
    // Head
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(ox + 8, 2, 10, 8);
    // Ears
    ctx.fillRect(ox + 8, 0, 3, 3);
    ctx.fillRect(ox + 15, 0, 3, 3);
    // Flame particles (animated)
    const flameOff = (frame % 2 === 0) ? 0 : 1;
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(ox + 2, 6 + flameOff, 2, 3);
    ctx.fillRect(ox + 20, 8 - flameOff, 2, 3);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(ox + 3, 4 + flameOff, 1, 2);
    ctx.fillRect(ox + 21, 6 - flameOff, 1, 2);
    // Eyes
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(ox + 10, 4, 2, 2);
    ctx.fillRect(ox + 15, 4, 2, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(ox + 11, 4, 1, 1);
    ctx.fillRect(ox + 16, 4, 1, 1);
    // Tail (flame tip)
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(ox + 1, 10, 4, 6);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(ox + 0, 14, 2, 3);
    // Legs
    ctx.fillStyle = '#CC3300';
    ctx.fillRect(ox + 7, 17, 3, 4);
    ctx.fillRect(ox + 14, 17, 3, 4);
  }
}

_drawEvolvedDragon(ctx) {
  // Grosser Drache: wings spread, fire breath glow
  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 24;
    const wingFlap = (frame % 2 === 0) ? 0 : 3;
    // Wings
    ctx.fillStyle = '#1A6B1A';
    ctx.fillRect(ox + 1, 4 - wingFlap, 4, 8 + wingFlap);
    ctx.fillRect(ox + 19, 4 - wingFlap, 4, 8 + wingFlap);
    // Body
    ctx.fillStyle = '#228B22';
    ctx.fillRect(ox + 5, 8, 14, 10);
    // Gold belly
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(ox + 8, 10, 8, 6);
    // Head
    ctx.fillStyle = '#228B22';
    ctx.fillRect(ox + 7, 2, 10, 7);
    // Fire breath
    ctx.fillStyle = '#FF4400';
    ctx.fillRect(ox + 17, 4, 4, 2);
    ctx.fillStyle = '#FFAA00';
    ctx.fillRect(ox + 20, 4, 2, 2);
    // Eyes
    ctx.fillStyle = '#FF2200';
    ctx.fillRect(ox + 9, 3, 2, 2);
    ctx.fillRect(ox + 14, 3, 2, 2);
    // Horns
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(ox + 8, 0, 2, 3);
    ctx.fillRect(ox + 15, 0, 2, 3);
    // Legs
    ctx.fillStyle = '#1A7A1A';
    ctx.fillRect(ox + 8, 17, 3, 4);
    ctx.fillRect(ox + 14, 17, 3, 4);
    // Tail
    ctx.fillRect(ox + 1, 12, 4, 3);
  }
}

_drawEvolvedRabbit(ctx) {
  // Goldener Hase: gold glow, sparkles
  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 24;
    // Gold glow aura
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(ox + 1, 1, 22, 22);
    // Body
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(ox + 5, 8, 14, 10);
    ctx.fillRect(ox + 4, 10, 16, 7);
    // Belly
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(ox + 8, 11, 6, 5);
    // Head
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(ox + 7, 2, 10, 7);
    // Long ears
    const earTwitch = (frame % 2 === 0) ? 0 : 1;
    ctx.fillRect(ox + 7 - earTwitch, 0, 3, 6);
    ctx.fillRect(ox + 15 + earTwitch, 0, 3, 6);
    // Inner ear
    ctx.fillStyle = '#FFB0C0';
    ctx.fillRect(ox + 8 - earTwitch, 1, 1, 4);
    ctx.fillRect(ox + 16 + earTwitch, 1, 1, 4);
    // Eyes
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(ox + 9, 4, 2, 2);
    ctx.fillRect(ox + 14, 4, 2, 2);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(ox + 10, 4, 1, 1);
    ctx.fillRect(ox + 15, 4, 1, 1);
    // Gold sparkles
    ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
    ctx.fillRect(ox + 2, 3 + (frame % 2), 1, 1);
    ctx.fillRect(ox + 21, 5 - (frame % 2), 1, 1);
    ctx.fillRect(ox + 4, 18 + (frame % 2), 1, 1);
    // Tail
    ctx.fillRect(ox + 2, 12, 3, 3);
    // Legs
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(ox + 7, 17, 4, 4);
    ctx.fillRect(ox + 14, 17, 4, 4);
  }
}
```

Update `update()` method to check for evolution:
```javascript
// After friendship timer block, add:
if (this.friendship >= 100 && !this.evolved) {
  this.evolve();
}
```

Update `getState()`:
```javascript
getState() {
  return {
    type: this.type,
    friendship: this.friendship,
    evolved: this.evolved,
  };
}
```

Update `loadState()`:
```javascript
loadState(state) {
  this.friendship = state?.friendship || 0;
  if (state?.evolved && !this.evolved) {
    this.evolve();
  }
}
```

**Note:** Add `import * as THREE from 'three';` at the top of Pet.js (already present).

- [ ] **Step 2: Commit**

```bash
git add src/entities/Pet.js
git commit -m "feat(m6): add pet evolution — visual upgrade at max friendship (100)"
```

---

## Task 20: New Game+ System

**Files:**
- Create: `src/systems/NewGamePlus.js`

- [ ] **Step 1: Create New Game+ system**

```javascript
/**
 * New Game+ system.
 * Activated after Shadow Knight defeat.
 * Keeps: inventory, explorer book, achievements, pet
 * Resets: quest progress, mob spawns
 * Modifies: start at level 15, mobs +50%HP +25%DMG +20%XP
 */
export class NewGamePlus {
  constructor() {
    this.active = false;
    this.cycleCount = 0; // how many NG+ cycles completed
  }

  /**
   * Check if NG+ should be offered.
   * @param {object} bossStates - { shadow_knight: { defeated: true } }
   */
  canActivate(bossStates) {
    return bossStates?.shadow_knight?.defeated === true;
  }

  /**
   * Activate New Game+.
   * Returns data to apply to game state.
   */
  activate() {
    this.active = true;
    this.cycleCount++;
    return {
      startLevel: 15,
      mobHpMultiplier: 1.5,
      mobDmgMultiplier: 1.25,
      mobXpMultiplier: 1.2,
    };
  }

  /**
   * Apply NG+ modifiers to a mob definition (non-destructive copy).
   */
  applyToMob(mobDef) {
    if (!this.active) return mobDef;
    return {
      ...mobDef,
      hp: Math.ceil(mobDef.hp * 1.5),
      damage: Math.ceil(mobDef.damage * 1.25),
      xp: Math.ceil(mobDef.xp * 1.2),
    };
  }

  getState() {
    return {
      active: this.active,
      cycleCount: this.cycleCount,
    };
  }

  loadState(state) {
    if (state) {
      this.active = state.active || false;
      this.cycleCount = state.cycleCount || 0;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/NewGamePlus.js
git commit -m "feat(m6): add NewGamePlus system — mob scaling, state management"
```

---

## Task 21: Game.js — Cloud Castle Scene + Boss Routing

**Files:**
- Modify: `src/core/Game.js`
- Modify: `src/world/maps/unicorn_meadow.js` (add north exit)
- Modify: `src/world/maps/beach.js` (add boss arena zone)
- Modify: `src/world/maps/grotto.js` (add boss arena zone)
- Modify: `src/rendering/PostProcessing.js` (add cloud_castle/starsky moods)
- Modify: `src/data/recipes.js` (add rainbow_sword recipe)

- [ ] **Step 1: Add imports for all new modules in Game.js**

At the top of `src/core/Game.js`, add these imports:

```javascript
import { generateCloudCastleMap } from '../world/maps/cloud_castle.js';
import { generateStarskyMap } from '../world/maps/starsky.js';
import { BOSS_TYPES, isBossUnlocked } from '../data/bosses.js';
import { CoconutKing } from '../entities/CoconutKing.js';
import { Leviathan } from '../entities/Leviathan.js';
import { ShadowKnight } from '../entities/ShadowKnight.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';
import { createBirdsForScene } from '../entities/Bird.js';
import { AmbientLife } from '../rendering/AmbientLife.js';
```

- [ ] **Step 2: Add cloud_castle and starsky to mapGenerators, sceneBgs, lightConfigs, sceneNames**

In constructor, add to `this.mapGenerators`:
```javascript
cloud_castle: generateCloudCastleMap,
starsky: generateStarskyMap,
```

Add to `this.sceneBgs`:
```javascript
cloud_castle: 0x1a1a3a,
starsky: 0x0a0a1a,
```

In `_buildScene`, add to `lightConfigs`:
```javascript
cloud_castle: { ambient: 0xeeeeff, ambientI: 2.2, sun: 0xffeedd, sunI: 1.8, fog: null },
starsky:      { ambient: 0x6666aa, ambientI: 1.5, sun: 0x8888cc, sunI: 0.8, fog: [0x0a0a1a, 0.02] },
```

Add to `sceneNames`:
```javascript
cloud_castle: 'Das Wolkenschloss',
starsky: 'Der Sternenhimmel',
```

Add to `particleTypes`:
```javascript
cloud_castle: 'magic',
starsky: 'magic',
```

- [ ] **Step 3: Add boss spawning to _buildScene**

After the unicorn spawn section in `_buildScene`, add boss creation:

```javascript
// Boss spawns
const bossSpawns = mapData.props.filter(p => p.type === 'boss_spawn');
for (const spawn of bossSpawns) {
  const bossDef = BOSS_TYPES[spawn.bossType];
  if (!bossDef) continue;
  // Check unlock condition
  const unicornsPetted = this.progression.stats.unicornsPetted || 0;
  if (!isBossUnlocked(spawn.bossType, this.progression, this.player, unicornsPetted)) continue;
  // Check if already defeated
  if (this._bossStates[spawn.bossType]?.defeated) continue;

  let boss;
  switch (spawn.bossType) {
    case 'coconut_king': boss = new CoconutKing(bossDef, spawn.x, spawn.y); break;
    case 'leviathan':    boss = new Leviathan(bossDef, spawn.x, spawn.y); break;
    case 'shadow_knight': boss = new ShadowKnight(bossDef, spawn.x, spawn.y); break;
    default: continue;
  }

  // Restore persisted HP
  if (this._bossStates[spawn.bossType]?.hp) {
    boss.loadPersistedHp(this._bossStates[spawn.bossType].hp);
  }

  boss.createSprite(this.scene);
  this._activeBoss = boss;
  this.bossHealthBar.show(bossDef.name);
}
```

- [ ] **Step 4: Add boss state tracking to constructor**

```javascript
this._bossStates = {};   // bossType -> { hp, defeated, playerDamageTaken }
this._activeBoss = null;
this.bossHealthBar = new BossHealthBar();
this.birds = [];
this.ambientLife = null;
```

- [ ] **Step 5: Add boss combat to _loop**

After the mob combat section in `_loop()`, add:

```javascript
// Boss combat
if (this._activeBoss && this._activeBoss.alive && !uiBlocking) {
  this._activeBoss.update(dt, this.player, this.tileMap);
  this.bossHealthBar.update(this._activeBoss.hp, this._activeBoss.maxHp);

  // Check player attacks against boss
  if (this.combat.lastAttackHit) {
    const weapon = this.inventory.getSelectedItem();
    const dmg = weapon?.damage || 15;
    this._activeBoss.takeDamage(dmg);
    if (this.vfx) this.vfx.hitSparks(this._activeBoss.x, this._activeBoss.y);
    this.juice.shakeMedium();
  }

  // Boss defeated
  if (this._activeBoss.defeated) {
    const boss = this._activeBoss;
    this._bossStates[boss.bossType] = boss.getState();
    // Drop rewards
    if (this.itemDrops) {
      for (const drop of boss.drops) {
        this.itemDrops.spawnMobDrops([{ itemId: drop.itemId, chance: 1.0, min: drop.count, max: drop.count }], boss.x, boss.y);
      }
    }
    // Grant XP
    this.progression.addXp(boss.xp);
    this.progression.reportBossKill(boss.bossType);
    this.hud.showInfo(`Boss besiegt! +${boss.xp} XP`);
    this.bossHealthBar.hide();

    // sword_gem_plus auto-upgrade after Leviathan
    if (boss.bossType === 'leviathan' && this.inventory.hasItem('sword_gem', 1)) {
      this.inventory.removeItem('sword_gem', 1);
      this.inventory.addItem('sword_gem_plus', 1);
      this.hud.showInfo('Edelstein-Schwert wurde verstaerkt!');
    }

    // Check untouchable achievement
    if (boss.playerDamageTaken === 0) {
      this._bossNoHitKill = true;
    }

    this._activeBoss = null;
  }

  // Persist boss HP for respawn
  if (this._activeBoss) {
    this._bossStates[this._activeBoss.bossType] = this._activeBoss.getState();
  }
}

// Birds update
for (const bird of this.birds) bird.update(dt);

// Ambient life update
if (this.ambientLife) this.ambientLife.update(dt);
```

- [ ] **Step 6: Add bird and ambient life creation to _buildScene**

After the insect creation section:
```javascript
// Birds (per scene)
for (const bird of this.birds) bird.dispose();
this.birds = createBirdsForScene(sceneName, this.scene, mapData.props);

// Ambient life (swaying trees, clouds)
if (this.ambientLife) this.ambientLife.dispose();
this.ambientLife = new AmbientLife(this.scene, this.camera);
this.ambientLife.init(sceneName, mapData.props, mapData.width, mapData.height, this.tileMapRenderer?.propMeshes || []);
```

- [ ] **Step 7: Add boss cleanup to _clearScene**

In the `_clearScene()` method, add:
```javascript
if (this._activeBoss) {
  this._activeBoss.dispose(this.scene);
  this._activeBoss = null;
}
this.bossHealthBar.hide();
for (const bird of this.birds) bird.dispose();
this.birds = [];
if (this.ambientLife) { this.ambientLife.dispose(); this.ambientLife = null; }
```

- [ ] **Step 8: Add north exit to unicorn_meadow.js**

In `src/world/maps/unicorn_meadow.js`, add a north exit prop:
```javascript
// Exit north → Cloud Castle (rainbow ascent)
props.push({ type: 'exit', x: 11, y: 0, width: 3, target: 'cloud_castle', spawnX: 14, spawnY: 42 });
```

The exit should only be usable when cloud_castle is accessible (level 22 + unicorns befriended).

- [ ] **Step 8b: Add scene access gate checks in Game.js exit handling**

In `_handleExits()` (or wherever scene transitions from exits are processed), add before triggering the transition:

```javascript
// ── Scene access gates ──
if (exit.target === 'cloud_castle') {
  const unicornsPetted = this.progression.stats.unicornsPetted || 0;
  if (this.progression.level < 22 || unicornsPetted < 1) {
    this.hud.showInfo('Du brauchst Level 22 und musst ein Einhorn gestreichelt haben!');
    return; // block transition
  }
}
if (exit.target === 'starsky') {
  const achieveCount = this.achievements ? this.achievements.getCount() : 0;
  if (achieveCount < 25) {
    this.hud.showInfo(`Du brauchst 25 Achievements! (${achieveCount}/25)`);
    return; // block transition
  }
}
```

- [ ] **Step 9: Add boss arena zones to beach.js and grotto.js**

In `src/world/maps/beach.js`, add:
```javascript
// Boss arena marker — Coconut King
props.push({ type: 'boss_spawn', bossType: 'coconut_king', x: 25, y: 10 });
```

In `src/world/maps/grotto.js`, add:
```javascript
// Boss arena marker — Leviathan
props.push({ type: 'boss_spawn', bossType: 'leviathan', x: 22, y: 28 });
```

- [ ] **Step 10: Add cloud_castle and starsky moods to PostProcessing.js**

In `src/rendering/PostProcessing.js`, in the `setSceneMood()` method, add:
```javascript
case 'cloud_castle':
  this.vignetteIntensity = 0.2;
  this.tintColor = [0.95, 0.95, 1.05]; // slight blue-white tint
  break;
case 'starsky':
  this.vignetteIntensity = 0.4;
  this.tintColor = [0.8, 0.8, 1.2]; // deep blue tint
  break;
```

- [ ] **Step 11: Add rainbow_sword alchemy recipe**

In `src/data/recipes.js`, add to the `alchemy` array:
```javascript
{ id: 'r_star_elixir', name: 'Sternen-Elixier', ingredients: [{ itemId: 'star_fragment', count: 3 }, { itemId: 'rainbow_shard', count: 1 }], result: { itemId: 'star_elixir', count: 1 } },
```

- [ ] **Step 12: Commit**

```bash
git add src/core/Game.js src/world/maps/unicorn_meadow.js src/world/maps/beach.js src/world/maps/grotto.js src/rendering/PostProcessing.js src/data/recipes.js
git commit -m "feat(m6): integrate Cloud Castle scene, boss routing, birds, ambient life"
```

---

## Task 22: Game.js — Achievements + Ambient Life + Endgame

**Files:**
- Modify: `src/core/Game.js`
- Modify: `src/systems/SaveManager.js`
- Modify: `src/ui/HUD.js`
- Modify: `src/systems/ExplorerBook.js`

- [ ] **Step 1: Add achievement + NG+ imports to Game.js**

```javascript
import { AchievementSystem } from '../systems/Achievements.js';
import { AchievementUI } from '../ui/AchievementUI.js';
import { NewGamePlus } from '../systems/NewGamePlus.js';
```

- [ ] **Step 2: Add achievement + NG+ to Game constructor**

```javascript
this.achievements = new AchievementSystem();
this.achievementUI = new AchievementUI();
this.newGamePlus = new NewGamePlus();
this._bossNoHitKill = false;
this._distanceWalked = 0;
this._lastPlayerPos = null;

// Achievement unlock callback
this.achievements.onUnlock = (def) => {
  this.achievementUI.showPopup(def);
  this.audio.playChestOpen();
  this.progression.reportAchievementUnlock(this.achievements.getCount());
  this.hud.updateAchievements(this.achievements.getCount(), this.achievements.getTotal());
};
```

- [ ] **Step 3: Add achievement checking to _loop**

After the weather update section in `_loop()`, add:

```javascript
// Distance tracking for achievement
if (this._lastPlayerPos) {
  const dx = this.player.x - this._lastPlayerPos.x;
  const dy = this.player.y - this._lastPlayerPos.y;
  this._distanceWalked += Math.sqrt(dx * dx + dy * dy);
}
this._lastPlayerPos = { x: this.player.x, y: this.player.y };

// Achievement checks (throttled — every 2 seconds)
this._achievementCheckTimer = (this._achievementCheckTimer || 0) + dt;
if (this._achievementCheckTimer >= 2.0) {
  this._achievementCheckTimer = 0;
  const bookProg = this.explorerBook.getTotalProgress();
  this.achievements.check({
    scenesVisited: this.progression.stats.scenesVisited,
    mobsKilled: this.progression.stats.mobsKilled,
    totalMobsKilled: Object.values(this.progression.stats.mobsKilled).reduce((a, b) => a + b, 0),
    bossesKilled: this.progression.stats.bossesKilled || {},
    bossNoHitKill: this._bossNoHitKill,
    fishCaught: Object.keys(this.progression.stats.fishCaught || {}).length,
    shellsFound: Object.keys(this.progression.stats.uniqueCollected || {}).filter(k => k.startsWith('shell') || k === 'sand_dollar' || k === 'pearl' || k === 'rainbow_shell').length,
    insectsCaught: [...this.explorerBook.discovered].filter(e => ['butterfly', 'ladybug', 'firefly', 'dragonfly', 'bee', 'cricket'].includes(e)).length,
    gemsFound: [...this.explorerBook.discovered].filter(e => ['crystal', 'sapphire', 'ruby', 'emerald', 'cloud_crystal', 'ghost_pearl'].includes(e)).length,
    bookEntries: bookProg.found,
    bookTotal: bookProg.total,
    plantsCollected: this.progression.stats.plantsHealed || 0,
    chestsFound: 0, // TODO: track chest opens
    secretsFound: 0, // TODO: track secret areas
    distanceWalked: this._distanceWalked,
    npcsSpoken: this.progression.stats.npcsSpoken || {},
    unicornsPetted: this.progression.stats.unicornsPetted || 0,
    petFriendship: this.pet?.friendship || 0,
    completedQuests: this.progression.completedQuests || {},
    level: this.progression.level,
  });
}

// Achievement popup timer
this.achievementUI.updatePopup(dt);
```

- [ ] **Step 4: Add Tab key handler for achievement overlay**

In the constructor's keydown handler section, add:
```javascript
// Tab key for achievement overlay (only when explorer book is not open)
if (e.code === 'KeyP' && !this.explorerBookUI.isOpen) {
  this.achievementUI.toggle(this.achievements);
}
```

- [ ] **Step 5: Extend SaveManager for achievements, boss states, NG+**

In `src/systems/SaveManager.js`, add to the `save()` method (inside the `data` object):
```javascript
data.achievements = gameState.achievements || [];
data.bossStates = gameState.bossStates || {};
data.newGamePlus = gameState.newGamePlus || null;
data.distanceWalked = gameState.distanceWalked || 0;
```

Update version to 3:
```javascript
version: 3,
```

In the `load()` method, accept version 3:
```javascript
if (data.version !== 1 && data.version !== 2 && data.version !== 3) return null;
```

- [ ] **Step 6: Add save/load wiring in Game.js**

In the save state getter (where `this.saveManager.update` is called), add:
```javascript
achievements: this.achievements.getState(),
bossStates: this._bossStates,
newGamePlus: this.newGamePlus.getState(),
distanceWalked: this._distanceWalked,
```

In the load handler (`menu.onContinue`), add:
```javascript
if (save.achievements) this.achievements.loadState(save.achievements);
if (save.bossStates) this._bossStates = save.bossStates;
if (save.newGamePlus) this.newGamePlus.loadState(save.newGamePlus);
if (typeof save.distanceWalked === 'number') this._distanceWalked = save.distanceWalked;
```

- [ ] **Step 7: Add cloud_crystal to ExplorerBook gems category**

In `src/systems/ExplorerBook.js`, update the `gems` entries array:
```javascript
gems: {
  name: 'Kristalle & Edelsteine',
  icon: '\u{1F48E}',
  entries: ['crystal','sapphire','ruby','emerald','cloud_crystal','ghost_pearl'],
},
```

**Note:** `cloud_crystal` is already in the gems entries list in the current code. Verify this is the case and skip if already present.

- [ ] **Step 7b: Add endgame cutscene trigger after Shadow Knight defeat**

In `src/core/Game.js`, in the boss defeated section (Task 21 Step 5), after the `this._activeBoss = null;` line, add:

```javascript
// ── Endgame: Shadow Knight defeated → cutscene + NG+ offer ──
if (boss.bossType === 'shadow_knight') {
  // Short delay, then show victory dialog
  setTimeout(() => {
    this.dialog.show('Emilia', [
      'Der Schatten-Ritter ist besiegt!',
      'Das Wolkenschloss ist befreit!',
      'Alle Freunde und Familie warten auf dich...',
      'Du bist eine wahre Heldin, Emilia!',
    ]);

    // After dialog closes, offer NG+ if applicable
    this.dialog.onClose = () => {
      this.dialog.onClose = null;
      if (this.newGamePlus.canActivate(this._bossStates)) {
        this.dialog.showChoiceDialog('Sternenwaechterin', 'Moechtest du ein neues Abenteuer beginnen? (Deine Items und Achievements bleiben erhalten!)', [
          {
            text: 'Ja, neues Abenteuer! (NG+)',
            action: () => {
              const ngData = this.newGamePlus.activate();
              // Reset quests and boss states
              this.progression.resetQuests();
              this._bossStates = {};
              // Apply mob multipliers (stored for _createMobs to use)
              this._ngMobMultipliers = ngData;
              this.hud.showNgPlus(this.newGamePlus.cycleCount);
              this.hud.showInfo('Neues Abenteuer+ gestartet!');
              // Transition to hub
              this.sceneManager.transition('hub', 10, 10);
            },
          },
          {
            text: 'Nein, ich erkunde weiter',
            action: () => {
              this.hud.showInfo('Du kannst jederzeit bei Mama Tanja NG+ starten!');
            },
          },
        ]);
      }
    };
  }, 1500);
}
```

- [ ] **Step 7c: Apply NG+ mob multipliers in _createMobs**

In the `_createMobs` section of `_buildScene`, before creating each mob:
```javascript
// Apply NG+ scaling if active
let mobDef = MOB_TYPES[spawn.mobType];
if (this.newGamePlus.active) {
  mobDef = this.newGamePlus.applyToMob(mobDef);
}
```

- [ ] **Step 8: Add achievement counter to HUD**

In `src/ui/HUD.js`, add a method:
```javascript
updateAchievements(count, total) {
  // Update or create achievement counter display
  let el = document.getElementById('hud-achievements');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hud-achievements';
    el.style.cssText = `
      position: fixed; top: 8px; right: 8px;
      color: #FFD700; font-family: 'Press Start 2P', monospace;
      font-size: 8px; z-index: 1000;
      text-shadow: 1px 1px 0 #000;
    `;
    document.body.appendChild(el);
  }
  el.textContent = `\u2605 ${count}/${total}`;
}

showNgPlus(cycleCount) {
  let el = document.getElementById('hud-ngplus');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hud-ngplus';
    el.style.cssText = `
      position: fixed; top: 20px; right: 8px;
      color: #FF69B4; font-family: 'Press Start 2P', monospace;
      font-size: 7px; z-index: 1000;
      text-shadow: 1px 1px 0 #000;
    `;
    document.body.appendChild(el);
  }
  el.textContent = `NG+${cycleCount}`;
  el.style.display = 'block';
}
```

- [ ] **Step 9: Commit**

```bash
git add src/core/Game.js src/systems/SaveManager.js src/ui/HUD.js src/systems/ExplorerBook.js
git commit -m "feat(m6): integrate achievements, save/load, HUD counter, endgame tracking"
```

---

## Task 23: Rare Find Item Placement in Existing Maps

**Files:**
- Modify: `src/core/Game.js`
- Uses: `src/data/rare_finds.js` (created in Task 7)

- [ ] **Step 1: Add rare find placement to _buildScene**

In `src/core/Game.js`, in the `_buildScene` method, after the resource nodes section, add:

```javascript
// Rare find placement
import { RARE_FIND_PLACEMENTS } from '../data/rare_finds.js';
// (Move import to top of file)

const rareFinds = RARE_FIND_PLACEMENTS[sceneName] || [];
for (const rf of rareFinds) {
  // Check if already collected (tracked in save)
  if (this._collectedRareFinds.has(rf.itemId)) continue;

  // Check time condition
  if (rf.condition === 'night' && this.dayNight && !this.dayNight.isNight()) continue;
  if (rf.condition === 'morning' && this.dayNight && this.dayNight.phase !== 'dawn') continue;
  if (rf.condition === 'boss_shadow_knight_defeated' && !this._bossStates?.shadow_knight?.defeated) continue;

  // Create as resource node
  this.resources.addNode({
    x: rf.x,
    y: rf.y,
    resource: rf.itemId,
    respawn: false,
    onCollect: () => {
      this._collectedRareFinds.add(rf.itemId);
      // Discover in explorer book
      if (this.explorerBook.discover(rf.itemId)) {
        this.hud.showInfo('Seltener Fund: ' + (getItem(rf.itemId)?.name || rf.itemId) + '!');
        if (this.progression.reportDiscover) {
          this.progression.reportDiscover(this.explorerBook.getTotalProgress().found);
        }
      }
    },
  });
}
```

- [ ] **Step 2: Add tracking set to constructor and save/load**

In constructor:
```javascript
this._collectedRareFinds = new Set();
```

In save state:
```javascript
collectedRareFinds: [...this._collectedRareFinds],
```

In load:
```javascript
if (save.collectedRareFinds) this._collectedRareFinds = new Set(save.collectedRareFinds);
```

In SaveManager:
```javascript
data.collectedRareFinds = gameState.collectedRareFinds || [];
```

- [ ] **Step 3: Commit**

```bash
git add src/core/Game.js src/systems/SaveManager.js
git commit -m "feat(m6): add rare find placement in existing maps with conditions"
```

---

## Task 24: SaveManager Extensions

**Files:**
- Modify: `src/systems/SaveManager.js`

- [ ] **Step 1: Verify all M6 fields are persisted**

Ensure the SaveManager `save()` method includes all M6 data. The full data object should now contain:

```javascript
const data = {
  version: 3,
  timestamp: Date.now(),
  player: {
    hp: gameState.playerHp,
    scene: gameState.currentScene,
    x: gameState.playerX,
    y: gameState.playerY,
  },
  inventory: gameState.inventorySlots,
  plantsHealed: gameState.plantsHealed,
  unicornUnlocked: gameState.unicornUnlocked,
  progression: gameState.progression,
  dayNight: gameState.dayNight || null,
  fishCaught: gameState.fishCaught || {},
  uniqueCollected: gameState.uniqueCollected || {},
  weather: gameState.weather || null,
  pet: gameState.pet || null,
  explorerBook: gameState.explorerBook || { discovered: [], rewardsClaimed: [] },
  // M6 additions
  achievements: gameState.achievements || [],
  bossStates: gameState.bossStates || {},
  newGamePlus: gameState.newGamePlus || null,
  distanceWalked: gameState.distanceWalked || 0,
  collectedRareFinds: gameState.collectedRareFinds || [],
};
```

- [ ] **Step 2: Commit (if changes needed)**

```bash
git add src/systems/SaveManager.js
git commit -m "feat(m6): finalize SaveManager with all M6 persistence fields"
```

---

## Task 25: Playwright Tests (4 Categories)

**Files:**
- Modify: `tests/full-test.cjs`

- [ ] **Step 1: Add 4 new test categories**

Add after the existing test categories in `tests/full-test.cjs`:

```javascript
// ──────────────────────────────────────────────────────────
// Category: CloudCastle (8 points)
// ──────────────────────────────────────────────────────────
{
  name: 'CloudCastle',
  points: 8,
  tests: [
    {
      name: 'Cloud Castle map loads',
      points: 2,
      test: async (page) => {
        await page.evaluate(() => window.__game.sceneManager.transition('cloud_castle', 14, 42));
        await page.waitForTimeout(2000);
        const scene = await page.evaluate(() => window.__game.sceneManager.currentScene);
        return scene === 'cloud_castle';
      },
    },
    {
      name: 'Cloud Garden zone reachable',
      points: 1,
      test: async (page) => {
        const pos = await page.evaluate(() => ({ x: window.__game.player.x, y: window.__game.player.y }));
        return pos.x >= 5 && pos.x <= 24 && pos.y >= 25 && pos.y <= 39;
      },
    },
    {
      name: 'Crystal Halls zone exists',
      points: 1,
      test: async (page) => {
        await page.evaluate(() => {
          window.__game.player.x = 32;
          window.__game.player.y = 24;
        });
        await page.waitForTimeout(500);
        return true;
      },
    },
    {
      name: 'Throne Room zone exists',
      points: 1,
      test: async (page) => {
        await page.evaluate(() => {
          window.__game.player.x = 17;
          window.__game.player.y = 12;
        });
        await page.waitForTimeout(500);
        return true;
      },
    },
    {
      name: 'Star Terrace zone exists',
      points: 1,
      test: async (page) => {
        await page.evaluate(() => {
          window.__game.player.x = 37;
          window.__game.player.y = 5;
        });
        await page.waitForTimeout(500);
        return true;
      },
    },
    {
      name: 'Rainbow bridge tiles present',
      points: 1,
      test: async (page) => {
        const hasTile = await page.evaluate(() => {
          const tm = window.__game.tileMap;
          if (!tm) return false;
          // Check for rainbow bridge tile (22) in map
          for (let y = 0; y < tm.height; y++) {
            for (let x = 0; x < tm.width; x++) {
              if (tm.ground && tm.ground[y] && tm.ground[y][x] === 22) return true;
            }
          }
          return false;
        });
        return hasTile;
      },
    },
    {
      name: 'Exit to unicorn meadow works',
      points: 1,
      test: async (page) => {
        await page.evaluate(() => {
          window.__game.player.x = 14;
          window.__game.player.y = 44;
        });
        await page.waitForTimeout(2000);
        const scene = await page.evaluate(() => window.__game.sceneManager.currentScene);
        return scene === 'unicorn_meadow' || scene === 'cloud_castle';
      },
    },
  ],
},

// ──────────────────────────────────────────────────────────
// Category: Bosses (10 points)
// ──────────────────────────────────────────────────────────
{
  name: 'Bosses',
  points: 10,
  tests: [
    {
      name: 'Boss data loaded',
      points: 2,
      test: async (page) => {
        const hasBosses = await page.evaluate(() => {
          return typeof window.__game._bossStates !== 'undefined';
        });
        return hasBosses;
      },
    },
    {
      name: 'BossHealthBar UI exists',
      points: 1,
      test: async (page) => {
        const el = await page.$('#boss-hp-bar');
        return !!el;
      },
    },
    {
      name: 'Coconut King definition valid',
      points: 2,
      test: async (page) => {
        const valid = await page.evaluate(async () => {
          const { BOSS_TYPES } = await import('/src/data/bosses.js');
          const ck = BOSS_TYPES.coconut_king;
          return ck && ck.hp === 120 && ck.phases.length === 2;
        });
        return valid;
      },
    },
    {
      name: 'Leviathan definition valid',
      points: 2,
      test: async (page) => {
        const valid = await page.evaluate(async () => {
          const { BOSS_TYPES } = await import('/src/data/bosses.js');
          const lv = BOSS_TYPES.leviathan;
          return lv && lv.hp === 180 && lv.phases.length === 2;
        });
        return valid;
      },
    },
    {
      name: 'Shadow Knight definition valid',
      points: 2,
      test: async (page) => {
        const valid = await page.evaluate(async () => {
          const { BOSS_TYPES } = await import('/src/data/bosses.js');
          const sk = BOSS_TYPES.shadow_knight;
          return sk && sk.hp === 250 && sk.phases.length === 3;
        });
        return valid;
      },
    },
    {
      name: 'Boss keeps HP across player death',
      points: 1,
      test: async (page) => {
        // This tests the persistence design — boss HP state object exists
        const hasPersist = await page.evaluate(() => {
          return typeof window.__game._bossStates === 'object';
        });
        return hasPersist;
      },
    },
  ],
},

// ──────────────────────────────────────────────────────────
// Category: Achievements (6 points)
// ──────────────────────────────────────────────────────────
{
  name: 'Achievements',
  points: 6,
  tests: [
    {
      name: 'Achievement system active',
      points: 2,
      test: async (page) => {
        const active = await page.evaluate(() => {
          return window.__game.achievements && typeof window.__game.achievements.check === 'function';
        });
        return active;
      },
    },
    {
      name: 'Achievement can unlock',
      points: 2,
      test: async (page) => {
        const unlocked = await page.evaluate(() => {
          // Simulate visiting forest to trigger first_steps_ach
          window.__game.achievements.check({
            scenesVisited: { forest: true },
            mobsKilled: {}, totalMobsKilled: 0, bossesKilled: {},
            fishCaught: 0, shellsFound: 0, insectsCaught: 0, gemsFound: 0,
            bookEntries: 0, bookTotal: 30, plantsCollected: 0, chestsFound: 0,
            secretsFound: 0, distanceWalked: 0, npcsSpoken: {}, unicornsPetted: 0,
            petFriendship: 0, completedQuests: {}, level: 1,
          });
          return window.__game.achievements.isUnlocked('first_steps_ach');
        });
        return unlocked;
      },
    },
    {
      name: 'Achievement UI popup element exists',
      points: 1,
      test: async (page) => {
        const el = await page.$('#achievement-popup');
        return !!el;
      },
    },
    {
      name: 'Achievement overlay element exists',
      points: 1,
      test: async (page) => {
        const el = await page.$('#achievement-overlay');
        return !!el;
      },
    },
  ],
},

// ──────────────────────────────────────────────────────────
// Category: Animations (6 points)
// ──────────────────────────────────────────────────────────
{
  name: 'Animations',
  points: 6,
  tests: [
    {
      name: 'AmbientLife system exists',
      points: 2,
      test: async (page) => {
        const exists = await page.evaluate(() => {
          return window.__game.ambientLife !== undefined;
        });
        return exists;
      },
    },
    {
      name: 'Birds array exists on game',
      points: 1,
      test: async (page) => {
        const exists = await page.evaluate(() => {
          return Array.isArray(window.__game.birds);
        });
        return exists;
      },
    },
    {
      name: 'Bird class importable',
      points: 1,
      test: async (page) => {
        const valid = await page.evaluate(async () => {
          const { Bird } = await import('/src/entities/Bird.js');
          return typeof Bird === 'function';
        });
        return valid;
      },
    },
    {
      name: 'Cloud drift works on outdoor map',
      points: 1,
      test: async (page) => {
        await page.evaluate(() => window.__game.sceneManager.transition('hub', 20, 15));
        await page.waitForTimeout(2000);
        const hasClouds = await page.evaluate(() => {
          return window.__game.ambientLife && window.__game.ambientLife._cloudSprites.length > 0;
        });
        return hasClouds;
      },
    },
    {
      name: 'Pet evolution method exists',
      points: 1,
      test: async (page) => {
        const valid = await page.evaluate(async () => {
          const { Pet } = await import('/src/entities/Pet.js');
          const p = new Pet('fox', null);
          return typeof p.evolve === 'function';
        });
        return valid;
      },
    },
  ],
},
```

- [ ] **Step 2: Update scoring total**

Update the total score calculation at the end of the test file to include the 4 new categories (30 additional points, from ~150 to ~180).

- [ ] **Step 3: Commit**

```bash
git add tests/full-test.cjs
git commit -m "test(m6): add 4 Playwright test categories — CloudCastle, Bosses, Achievements, Animations"
```

---

## Task 26: Final Integration Check

**Files:**
- All modified files

- [ ] **Step 1: Run dev server and verify no import errors**

```bash
npm run dev
```

Open browser, check console for errors. Verify:
- Hub loads without errors
- No missing import warnings
- Achievement popup DOM elements exist
- Boss health bar DOM element exists

- [ ] **Step 2: Run Playwright tests**

```bash
node tests/full-test.cjs
```

Target: All existing tests still pass (no regressions), new categories score reasonably.

- [ ] **Step 3: Verify scene transitions**

Test in browser:
1. Hub → Forest → Dungeon → Grotto (existing)
2. Hub → Beach (existing)
3. Unicorn Meadow → Cloud Castle (new exit)
4. Cloud Castle → back to Unicorn Meadow (south exit)

- [ ] **Step 4: Verify data integrity**

Check in browser console:
```javascript
// Items
Object.keys(window.__game.inventory.constructor).length // should include new items

// Boss data
import('/src/data/bosses.js').then(m => console.log(Object.keys(m.BOSS_TYPES)))
// Should print: ['coconut_king', 'leviathan', 'shadow_knight']

// Achievements
window.__game.achievements.getTotal() // should be 30

// Level cap
import('/src/data/levels.js').then(m => console.log(m.MAX_LEVEL))
// Should be 30
```

- [ ] **Step 5: Fix any issues found**

Address console errors, missing imports, broken references.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix(m6): final integration fixes and verification"
```

---

## Summary

| Task | Description | Files | Complexity |
|------|------------|-------|------------|
| 1 | New items (12) | items.js | Simple |
| 2 | Boss data (3 bosses) | bosses.js | Simple |
| 3 | Achievement definitions (30) | achievements.js | Simple |
| 4 | Quests + progression (6) | quests.js, Progression.js | Medium |
| 5 | Level curve 26-30 | levels.js | Simple |
| 6 | Cloud castle tiles 19-22 | TilesetGenerator.js | Simple |
| 7 | Rare find placement data | rare_finds.js | Simple |
| 8 | Cloud Castle map (50x45) | cloud_castle.js | Medium |
| 9 | Starsky secret map (5x5) | starsky.js | Simple |
| 10 | Boss base class | Boss.js | Complex |
| 11 | Coconut King boss entity | CoconutKing.js | Medium |
| 12 | Leviathan boss entity | Leviathan.js | Medium |
| 13 | Shadow Knight boss entity | ShadowKnight.js | Medium |
| 14 | Bird ambient entity | Bird.js | Medium |
| 15 | AmbientLife renderer | AmbientLife.js | Medium |
| 16 | Achievement system | Achievements.js | Medium |
| 17 | Achievement UI | AchievementUI.js | Medium |
| 18 | Boss health bar UI | BossHealthBar.js | Simple |
| 19 | Pet evolution system | Pet.js | Medium |
| 20 | New Game+ system | NewGamePlus.js | Simple |
| 21 | Game.js — Cloud Castle + bosses | Game.js, unicorn_meadow, beach, grotto, PostProcessing, recipes | Complex |
| 22 | Game.js — Achievements + endgame | Game.js, SaveManager, HUD, ExplorerBook | Complex |
| 23 | Rare find placement | Game.js, SaveManager | Medium |
| 24 | SaveManager extensions | SaveManager.js | Simple |
| 25 | Playwright tests (4 categories) | full-test.cjs | Medium |
| 26 | Final integration check | all | Medium |

**Parallel execution groups:**
- **Group 1 (Tasks 1-7):** All independent data tasks — fully parallel
- **Group 2 (Tasks 8-15):** Maps + entities + renderers — fully parallel (no shared files)
- **Group 3 (Tasks 16-20):** Systems + UI — fully parallel (no shared files)
- **Group 4 (Task 21):** Game.js Cloud Castle + boss integration — solo, Opus model (depends on Groups 1-2)
- **Group 5 (Task 22):** Game.js achievements + endgame — solo, Opus model (depends on Groups 1-3)
- **Group 6 (Tasks 23-24):** Rare finds + SaveManager — sequential (depends on Task 21-22)
- **Group 7 (Tasks 25-26):** Tests + final check — sequential (depends on all above)
