# M5 "Tiefsee & Freunde" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Underwater Grotto area, Explorer's Book, Pet Companions, Weather Effects, 3 new enemy types, 5 quests, and level 21-25 progression.

**Architecture:** Data-first approach (items, mobs, quests, tiles), then map + entities, then systems (weather, book, pets), then Game.js integration. Each subsystem is a self-contained module following existing patterns (canvas sprites, state machines, HTML overlays).

**Tech Stack:** Three.js (rendering), Vite (build), vanilla JS ES modules, Playwright (testing), canvas-drawn sprites

---

## File Structure

**New files to create:**
| File | Responsibility |
|------|---------------|
| `src/world/maps/grotto.js` | Underwater Grotto map generator (45×40) |
| `src/entities/Jellyfish.js` | Jellyfish enemy entity (canvas sprite, drift AI) |
| `src/entities/Octopus.js` | Octopus enemy entity (canvas sprite, ink attack) |
| `src/entities/GhostCrab.js` | Ghost Crab entity (extends Crab, visibility toggle) |
| `src/entities/Pet.js` | Pet companion (follow mechanic, 3 types, canvas sprites) |
| `src/entities/Insect.js` | Collectible insect entities (butterfly, ladybug, etc.) |
| `src/systems/Weather.js` | Weather state machine (sunny/rain/fog/sunbeams) |
| `src/rendering/WeatherRenderer.js` | Weather visual effects (particles, overlays) |
| `src/systems/ExplorerBook.js` | Explorer Book data + logic (5 categories, tracking) |
| `src/ui/ExplorerBookUI.js` | Explorer Book HTML overlay (Tab key) |

**Existing files to modify:**
| File | Changes |
|------|---------|
| `src/data/items.js` | +31 new items (corals, gems, underwater, rare finds, rewards, pet_treat) |
| `src/data/mobs.js` | +3 mob types (jellyfish_glow, octopus, ghost_crab) |
| `src/data/quests.js` | +5 M5 quests |
| `src/data/recipes.js` | +5 recipes, category-based ingredient support |
| `src/data/levels.js` | Extend to level 25, unlock M5 quests |
| `src/rendering/TilesetGenerator.js` | +4 underwater tile IDs (15-18) |
| `src/rendering/PostProcessing.js` | +grotto mood |
| `src/systems/CraftingSystem.js` | Category-based ingredient matching |
| `src/systems/Progression.js` | +reportVisitZone(), +reportHeal() for coral quest |
| `src/systems/SaveManager.js` | Persist weather, pet, explorerBook state |
| `src/world/maps/dungeon.js` | Add east exit to grotto |
| `src/core/Game.js` | Wire grotto, weather, pets, book, new enemies |
| `src/ui/HUD.js` | Weather indicator icon |
| `src/rendering/VisualEffects.js` | +bubbles particle config for grotto |
| `src/systems/DialogSystem.js` | +showChoiceDialog() for pet selection |
| `src/ui/DialogUI.js` | +choice buttons rendering |
| `tests/full-test.cjs` | +4 test categories (Grotto, Weather, Pet, ExplorerBook) |

---

## Task 1: New Items — Corals, Gems, Underwater Drops, Pet Treat

**Files:**
- Modify: `src/data/items.js`
- Modify: `src/utils/ItemIcons.js` (if icon entries needed)

- [ ] **Step 1: Add 16 new items to ITEMS object**

In `src/data/items.js`, add after the beach items section:

```javascript
// ── Corals (M5 Grotto) ──
fire_coral:    { id: 'fire_coral',    name: 'Feuerkoralle',     category: 'coral',    stackSize: 99, color: '#FF4500' },
brain_coral:   { id: 'brain_coral',   name: 'Hirnkoralle',      category: 'coral',    stackSize: 99, color: '#DDA0DD' },
fan_coral:     { id: 'fan_coral',     name: 'Faecherkoralle',   category: 'coral',    stackSize: 99, color: '#FF69B4' },
glow_coral:    { id: 'glow_coral',    name: 'Leuchtkoralle',    category: 'coral',    stackSize: 99, color: '#00FFFF' },

// ── Gems (M5 Grotto/Dungeon) ──
sapphire:      { id: 'sapphire',      name: 'Saphir',           category: 'gem',      stackSize: 99, color: '#0066CC' },
ruby:          { id: 'ruby',          name: 'Rubin',            category: 'gem',      stackSize: 99, color: '#CC0033' },
emerald:       { id: 'emerald',       name: 'Smaragd',          category: 'gem',      stackSize: 99, color: '#00CC66' },

// ── Underwater drops (M5 Grotto) ──
ink_sac:          { id: 'ink_sac',          name: 'Tintenbeutel',       category: 'resource', stackSize: 99, color: '#2A0A2A' },
jelly_essence:    { id: 'jelly_essence',    name: 'Quallen-Essenz',     category: 'resource', stackSize: 99, color: '#80FFFF' },
glow_orb:         { id: 'glow_orb',         name: 'Leuchtkugel',        category: 'resource', stackSize: 99, color: '#AAFFEE' },
tentacle:         { id: 'tentacle',         name: 'Tentakel',           category: 'resource', stackSize: 99, color: '#8B668B' },
underwater_plant: { id: 'underwater_plant', name: 'Unterwasserpflanze', category: 'resource', stackSize: 99, color: '#228B22' },
ghost_pearl:      { id: 'ghost_pearl',      name: 'Geisterperle',       category: 'resource', stackSize: 10, color: '#E0E0FF' },

// ── Shells M5 (Grotte-exklusiv) ──
spiral_snail:  { id: 'spiral_snail',  name: 'Spiralschnecke',     category: 'resource', stackSize: 99, color: '#DEB887' },
deep_crown:    { id: 'deep_crown',    name: 'Tiefseekrone',       category: 'resource', stackSize: 99, color: '#4169E1' },

// ── Pet ──
pet_treat:     { id: 'pet_treat',     name: 'Haustier-Leckerli', category: 'food',     stackSize: 20, color: '#FFB6C1' },

// ── Weapons M5 ──
sword_gem:     { id: 'sword_gem',     name: 'Edelstein-Schwert', category: 'weapon',   stackSize: 1,  color: '#9966FF', damage: 40 },

// ── Potions M5 ──
glow_potion:   { id: 'glow_potion',   name: 'Leuchttrank',       category: 'potion',   stackSize: 5,  color: '#80FFCC' },

// ── Food M5 ──
sea_soup:      { id: 'sea_soup',      name: 'Meeres-Suppe',      category: 'food_cooked', stackSize: 10, color: '#4682B4', healAmount: 60 },

// ── Deko M5 ──
diving_helm:   { id: 'diving_helm',   name: 'Tauchhelm',         category: 'equipment', stackSize: 1,  color: '#B0C4DE' },

// ── Rare Finds (Explorer Book) ──
old_coin:       { id: 'old_coin',       name: 'Alte Muenze',        category: 'rare',     stackSize: 99, color: '#DAA520' },
fairy_dust:     { id: 'fairy_dust',     name: 'Feenstaub',          category: 'rare',     stackSize: 99, color: '#FFD1DC' },
fossil:         { id: 'fossil',         name: 'Fossil',             category: 'rare',     stackSize: 99, color: '#8B7D6B' },
message_bottle: { id: 'message_bottle', name: 'Flaschenpost',       category: 'rare',     stackSize: 99, color: '#87CEEB' },
lost_diary:     { id: 'lost_diary',     name: 'Verlorenes Tagebuch',category: 'rare',     stackSize: 1,  color: '#8B4513' },
golden_feather: { id: 'golden_feather', name: 'Goldene Feder',      category: 'rare',     stackSize: 99, color: '#FFD700' },

// ── Category Completion Rewards ──
golden_rod:     { id: 'golden_rod',     name: 'Goldene Angel',      category: 'equipment', stackSize: 1, color: '#FFD700' },
butterfly_net:  { id: 'butterfly_net',  name: 'Schmetterlings-Netz',category: 'equipment', stackSize: 1, color: '#98FB98' },
gem_ring:       { id: 'gem_ring',       name: 'Edelstein-Ring',     category: 'equipment', stackSize: 1, color: '#9966FF' },
treasure_map:   { id: 'treasure_map',   name: 'Schatzkarte',        category: 'equipment', stackSize: 1, color: '#DEB887' },
collectors_badge:{ id: 'collectors_badge',name: 'Sammler-Abzeichen', category: 'equipment', stackSize: 1, color: '#C0C0C0' },
```

- [ ] **Step 2: Commit**

```bash
git add src/data/items.js
git commit -m "feat(m5): add 31 new items — corals, gems, underwater drops, rare finds, rewards, pet treats, weapons"
```

---

## Task 2: New Mob Types — Underwater Enemies

**Files:**
- Modify: `src/data/mobs.js`

- [ ] **Step 1: Add 3 underwater mob types**

In `src/data/mobs.js`, add after `crab_coconut`:

```javascript
jellyfish_glow: {
  name: 'Leucht-Qualle',
  spriteType: 'jellyfish',
  tint: null,
  hp: 25,
  damage: 3,
  speed: 0.8,
  detectionRange: 3.0,
  drops: [
    { itemId: 'jelly_essence', chance: 0.7, min: 1, max: 1 },
    { itemId: 'glow_orb', chance: 0.2, min: 1, max: 1 },
  ],
  xp: 15,
},
octopus: {
  name: 'Tintenfisch',
  spriteType: 'octopus',
  tint: null,
  hp: 40,
  damage: 5,
  speed: 1.4,
  detectionRange: 4.0,
  drops: [
    { itemId: 'ink_sac', chance: 0.6, min: 1, max: 1 },
    { itemId: 'tentacle', chance: 0.3, min: 1, max: 1 },
  ],
  xp: 25,
},
ghost_crab: {
  name: 'Geister-Krabbe',
  spriteType: 'ghost_crab',
  tint: null,
  hp: 50,
  damage: 6,
  speed: 1.6,
  detectionRange: 4.5,
  drops: [
    { itemId: 'ghost_pearl', chance: 0.4, min: 1, max: 1 },
    { itemId: 'bone', chance: 0.5, min: 1, max: 2 },
    { itemId: 'crystal', chance: 0.25, min: 1, max: 1 },
  ],
  xp: 35,
},
```

- [ ] **Step 2: Commit**

```bash
git add src/data/mobs.js
git commit -m "feat(m5): add jellyfish_glow, octopus, ghost_crab mob definitions"
```

---

## Task 3: New Recipes + Category-Based Ingredients

**Files:**
- Modify: `src/data/recipes.js`
- Modify: `src/systems/CraftingSystem.js`

- [ ] **Step 1: Add category-based ingredient support to recipes.js**

Add new recipes. The `sea_soup` recipe uses `{ category: 'fish', count: 1 }` instead of `{ itemId: '...', count: 1 }`:

```javascript
// In anvil array, add:
{ id: 'r_sword_gem', name: 'Edelstein-Schwert', ingredients: [{ itemId: 'sapphire', count: 2 }, { itemId: 'ruby', count: 2 }, { itemId: 'emerald', count: 1 }], result: { itemId: 'sword_gem', count: 1 } },

// In workbench array, add:
{ id: 'r_diving_helm', name: 'Tauchhelm', ingredients: [{ itemId: 'crystal', count: 3 }, { itemId: 'iron_ore', count: 2 }], result: { itemId: 'diving_helm', count: 1 } },

// In cooking array, add:
{ id: 'r_pet_treat', name: 'Haustier-Leckerli', ingredients: [{ itemId: 'berry', count: 2 }, { itemId: 'mushroom', count: 1 }], result: { itemId: 'pet_treat', count: 1 } },
{ id: 'r_sea_soup', name: 'Meeres-Suppe', ingredients: [{ itemId: 'tentacle', count: 1 }, { itemId: 'underwater_plant', count: 1 }, { category: 'fish', count: 1 }], result: { itemId: 'sea_soup', count: 1 } },

// In alchemy array, add:
{ id: 'r_glow_potion', name: 'Leuchttrank', ingredients: [{ itemId: 'glow_orb', count: 2 }, { itemId: 'jelly_essence', count: 1 }], result: { itemId: 'glow_potion', count: 1 } },
```

- [ ] **Step 2: Extend CraftingSystem._doCraft() for category matching**

In `src/systems/CraftingSystem.js`, modify `_doCraft()` to handle `ingredient.category`:

```javascript
_doCraft(recipe) {
  if (!this.inventory.canFitItem(recipe.result.itemId, recipe.result.count)) {
    this.hud.showInfo('Inventar voll! Mach zuerst Platz.');
    return;
  }

  // Remove ingredients — handle both itemId and category matches
  for (const ing of recipe.ingredients) {
    if (ing.itemId) {
      if (!this.inventory.removeItem(ing.itemId, ing.count)) return;
    } else if (ing.category) {
      // Find any inventory item matching this category
      const matchId = this.inventory.findItemByCategory(ing.category);
      if (!matchId || !this.inventory.removeItem(matchId, ing.count)) {
        this.hud.showInfo('Zutat fehlt!');
        return;
      }
    }
  }

  this.inventory.addItem(recipe.result.itemId, recipe.result.count);
  this.hud.showInfo(`${recipe.name} hergestellt! +5 XP`);
  if (window.__game?.audio) window.__game.audio.playCraftSuccess();
  if (window.__game?.progression) {
    window.__game.progression.addXp(5);
    window.__game.progression.reportCraft();
  }
}
```

- [ ] **Step 3: Add `findItemByCategory()` to Inventory**

In `src/systems/Inventory.js`, add method:

```javascript
findItemByCategory(category) {
  for (const slot of this.slots) {
    if (slot.itemId) {
      const def = getItem(slot.itemId);
      if (def && def.category === category && slot.count > 0) return slot.itemId;
    }
  }
  return null;
}
```

Also update `CraftingUI` — in the `_checkIngredients()` method that shows green/red for ingredient availability, handle `ing.category`:

```javascript
// When displaying ingredient name for category-based:
const name = ing.itemId ? (getItem(ing.itemId)?.name || ing.itemId) : `Beliebiger ${ing.category}`;
const has = ing.itemId ? inventory.countItem(ing.itemId) >= ing.count
           : !!inventory.findItemByCategory(ing.category);
```

- [ ] **Step 4: Commit**

```bash
git add src/data/recipes.js src/systems/CraftingSystem.js src/systems/Inventory.js src/ui/CraftingUI.js
git commit -m "feat(m5): add 5 recipes with category-based ingredient matching"
```

---

## Task 4: Quests & Progression Extensions

**Files:**
- Modify: `src/data/quests.js`
- Modify: `src/systems/Progression.js`

- [ ] **Step 1: Add 5 M5 quests**

In `src/data/quests.js`, add after `shooting_star`:

```javascript
coral_healer: {
  id: 'coral_healer',
  name: 'Korallen-Retterin',
  description: 'Heile 5 kranke Korallen',
  type: 'heal',
  target: 'coral',
  count: 5,
  xpReward: 60,
  itemReward: [{ itemId: 'glow_coral', count: 2 }],
},
deep_explorer: {
  id: 'deep_explorer',
  name: 'Tiefsee-Entdeckerin',
  description: 'Besuche alle 4 Grotten-Bereiche',
  type: 'visit_zones',
  target: 'grotto_zones',
  count: 4,
  xpReward: 70,
  itemReward: [{ itemId: 'diving_helm', count: 1 }],
},
best_friend: {
  id: 'best_friend',
  name: 'Beste Freundin',
  description: 'Waehle ein Haustier',
  type: 'pet_choose',
  target: 'pet',
  count: 1,
  xpReward: 50,
  itemReward: [{ itemId: 'pet_treat', count: 5 }],
},
collector_page1: {
  id: 'collector_page1',
  name: 'Entdecker-Buch Seite 1',
  description: 'Entdecke 10 verschiedene Eintraege',
  type: 'discover',
  target: 'book_entries',
  count: 10,
  xpReward: 80,
  itemReward: [],
},
sunken_treasure: {
  id: 'sunken_treasure',
  name: 'Versunkener Schatz',
  description: 'Finde die geheime Schatz-Kammer',
  type: 'visit',
  target: 'grotto_treasure',
  count: 1,
  xpReward: 90,
  itemReward: [{ itemId: 'ghost_pearl', count: 3 }],
},
```

- [ ] **Step 2: Extend Progression system**

In `src/systems/Progression.js`:

1. Add M5 quests to `QUEST_ORDER`
2. Add `reportHealCoral()` — tracks coral heals, increments `coral_healer`
3. Add `reportVisitZone(zoneId)` — tracks visited zones as Set, increments `deep_explorer` on new zone
4. Add `reportPetChosen()` — completes `best_friend` quest
5. Add `reportDiscover(totalEntries)` — updates `collector_page1` quest progress

**Key pattern:** Same as existing `reportFish()` / `reportCollectUnique()` — use Sets for tracking unique visits, increment count only on new additions.

```javascript
// In QUEST_ORDER, append:
'coral_healer', 'deep_explorer', 'best_friend', 'collector_page1', 'sunken_treasure',

// Add to constructor stats:
this.stats.coralHealed = 0;
this.stats.grottoZones = new Set();
this.stats.petChosen = false;
this.stats.bookEntries = 0;

reportHealCoral() {
  this.stats.coralHealed++;
  this._incrementQuest('coral_healer', 1);
}

reportVisitZone(zoneId) {
  if (this.stats.grottoZones.has(zoneId)) return;
  this.stats.grottoZones.add(zoneId);
  this._incrementQuest('deep_explorer', 1);
}

reportPetChosen() {
  if (!this.stats.petChosen) {
    this.stats.petChosen = true;
    this._incrementQuest('best_friend', 1);
  }
}

reportDiscover(totalEntries) {
  this.stats.bookEntries = totalEntries;
  // Set quest progress directly (not increment)
  this._setQuestProgress('collector_page1', totalEntries);
}
```

Also add `_setQuestProgress(questId, value)` method alongside existing `_incrementQuest`:

```javascript
_setQuestProgress(questId, value) {
  const q = this.quests[questId];
  if (!q || q.completed) return;
  q.progress = Math.min(value, q.target);
  if (q.progress >= q.target) this._completeQuest(questId);
}
```

- [ ] **Step 3: Extend `reportKill()` for underwater mobs**

In the base type mapping, add:
```javascript
if (mobType.startsWith('jellyfish')) baseType = 'jellyfish_glow';
if (mobType.startsWith('octopus')) baseType = 'octopus';
if (mobType === 'ghost_crab') baseType = 'ghost_crab';
```

- [ ] **Step 4: Commit**

```bash
git add src/data/quests.js src/systems/Progression.js
git commit -m "feat(m5): add 5 quests and progression tracking (zones, corals, pets, book)"
```

---

## Task 5: Level Curve 21-25

**Files:**
- Modify: `src/data/levels.js`

- [ ] **Step 1: Extend LEVEL_TABLE to 25**

```javascript
// Level 21
{ level: 21, xpRequired: 5800, statBonus: { maxHp: 15 }, rewards: [], unlockQuest: 'coral_healer' },
// Level 22
{ level: 22, xpRequired: 7000, statBonus: { damagePct: 10 }, rewards: [], unlockQuest: 'deep_explorer' },
// Level 23
{ level: 23, xpRequired: 8400, statBonus: { maxHp: 15, speedPct: 5 }, rewards: [], unlockQuest: 'best_friend' },
// Level 24
{ level: 24, xpRequired: 10000, statBonus: { damagePct: 10 }, rewards: [], unlockQuest: 'collector_page1' },
// Level 25 — M5 MAX
{ level: 25, xpRequired: 12000, statBonus: { maxHp: 20 }, rewards: [{ itemId: 'ghost_pearl', count: 5 }], unlockQuest: 'sunken_treasure' },
```

Update `MAX_LEVEL = 25`.

- [ ] **Step 2: Commit**

```bash
git add src/data/levels.js
git commit -m "feat(m5): extend level curve to 25, unlock M5 quests"
```

---

## Task 6: Underwater Tile IDs 15-18

**Files:**
- Modify: `src/rendering/TilesetGenerator.js`

- [ ] **Step 1: Add 4 underwater tiles**

Update `TILE_COUNT` from 15 to 19. Add after tile 14 (pier_wood):

```javascript
// 15 = underwater_dark — dark blue stone
ctx.fillStyle = '#2A3A5A';
ctx.fillRect(15 * T, 0, T, T);
_addStoneTexture(ctx, 15 * T, '#1E2E4A', 6);

// 16 = underwater_blue — blue-grey stone
ctx.fillStyle = '#3A5A7A';
ctx.fillRect(16 * T, 0, T, T);
_addStoneTexture(ctx, 16 * T, '#2E4E6A', 5);

// 17 = underwater_moss — moss-covered stone
ctx.fillStyle = '#2A5A3A';
ctx.fillRect(17 * T, 0, T, T);
_addStoneTexture(ctx, 17 * T, '#1E4A2E', 4);
// Add moss dots
ctx.fillStyle = '#3A7A4A';
for (let i = 0; i < 6; i++) {
  ctx.fillRect(17 * T + (i * 3 % 14), (i * 5 % 14), 2, 2);
}

// 18 = underwater_sand — wet underwater sand
ctx.fillStyle = '#5A6A5A';
ctx.fillRect(18 * T, 0, T, T);
_addSandGrain(ctx, 18 * T, '#4A5A4A', 8);
```

Add helper `_addStoneTexture(ctx, offsetX, lineColor, count)`:
```javascript
function _addStoneTexture(ctx, offsetX, lineColor, count) {
  ctx.fillStyle = lineColor;
  for (let i = 0; i < count; i++) {
    const x = offsetX + (i * 5 % 14);
    const y = (i * 7 % 14);
    ctx.fillRect(x, y, 3, 1);
  }
}
```

Update fallback colors and sync fallback arrays in both async and sync paths.

- [ ] **Step 2: Commit**

```bash
git add src/rendering/TilesetGenerator.js
git commit -m "feat(m5): add underwater tile IDs 15-18 for grotto map"
```

---

## Task 7: Underwater Grotto Map Generator

**Files:**
- Create: `src/world/maps/grotto.js`

- [ ] **Step 1: Create grotto map (45×40)**

The grotto has 4 sub-areas connected as a cohesive map. Uses seeded random (same pattern as beach.js):

```javascript
export function generateGrottoMap() {
  const W = 45, H = 40;
  // Tile assignments:
  // 15 = underwater_dark (walls/borders)
  // 16 = underwater_blue (main floor)
  // 17 = underwater_moss (decorative variation)
  // 18 = underwater_sand (sandy areas)
  // 10 = water (deep water pits)

  // Layout zones:
  // Coral Reef: x=0-14, y=0-11 (entrance from dungeon on west wall)
  // Sunken Ruins: x=15-34, y=0-14
  // Jellyfish Passage: x=35-44, y=5-24 (narrow, vertical)
  // Treasure Chamber: x=15-29, y=25-34 (secret, only reachable through ruins)
  // Walls: tile 15 with collision=1 between zones, doorways open

  // Props include:
  // - coral decorations (type: 'coral_deco')
  // - sick corals (type: 'wilted_plant', variant: 'coral' — reuses PlantHealing!)
  // - glowing algae (type: 'glow_plant')
  // - treasure chests (type: 'chest')
  // - resource nodes: gems (sapphire, ruby, emerald)
  // - mob spawns: jellyfish in reef/passage, octopus in ruins, ghost_crab in treasure

  // Zone markers for quest tracking:
  // { type: 'zone_marker', zoneId: 'reef', x, y }
  // { type: 'zone_marker', zoneId: 'ruins', x, y }
  // { type: 'zone_marker', zoneId: 'passage', x, y }
  // { type: 'zone_marker', zoneId: 'treasure', x, y }

  // Exit: west wall → dungeon
  const exits = [
    { id: 'west', x: 0, y: 4, w: 2, h: 3, target: 'dungeon', spawnX: 33, spawnY: 14 },
  ];
}
```

**Important implementation details:**
- 5 sick corals (type: `'wilted_plant'`, uses existing PlantHealing system with `reportHealCoral()` callback)
- Zone markers are invisible props — Game.js checks player proximity to trigger `progression.reportVisitZone()`
- Treasure Chamber entrance blocked by collision wall until player visits ruins first (simple puzzle: interact with a lever/switch to open path)
- 3 fishing spots in reef area (reuses FishingSystem)
- Gem resource nodes: use ResourceNode pattern (type: 'resource', resourceType: 'gem', itemId: 'sapphire'/'ruby'/'emerald')

Full implementation: ~160 lines following beach.js pattern (seeded RNG, ground fill, collision walls, prop placement, exits).

- [ ] **Step 2: Commit**

```bash
git add src/world/maps/grotto.js
git commit -m "feat(m5): add underwater grotto map generator (45x40, 4 zones)"
```

---

## Task 8: Jellyfish Entity

**Files:**
- Create: `src/entities/Jellyfish.js`

- [ ] **Step 1: Implement Jellyfish entity**

Follows Crab.js pattern: extends Entity base class, CombatSystem-compatible (`this.alive`, `this.def`).

**Canvas sprite:** 32×16 (2 frames idle), transparent dome body with trailing tentacles, cyan/magenta glow.

**AI behavior:**
- Drift: slow random movement (speed 0.8), changes direction every 3-5s
- Contact damage only (no chase, no attack animation)
- Glow effect: oscillating opacity on sprite (0.6-1.0)
- HP bar above

**Critical compatibility:**
- `this.alive = true` (boolean, for CombatSystem)
- `this.def = MOB_TYPES['jellyfish_glow']` (reference to mob data)
- `this.mobType = 'jellyfish_glow'`
- `takeDamage(amount)`, `die()`, `_respawn()` methods

- [ ] **Step 2: Commit**

```bash
git add src/entities/Jellyfish.js
git commit -m "feat(m5): add Jellyfish entity with drift AI and glow effect"
```

---

## Task 9: Octopus Entity

**Files:**
- Create: `src/entities/Octopus.js`

- [ ] **Step 1: Implement Octopus entity**

Same CombatSystem pattern as Jellyfish/Crab.

**Canvas sprite:** 32×16 (2 frames), purple body with 8 tentacles.

**AI behavior:**
- Idle: slow drift, random direction changes
- Chase: moves toward player when in detection range (1.4 speed)
- Attack: at 2.0 range, "sprays ink" — creates a dark overlay on screen for 2 seconds (visual debuff, not real damage beyond base contact damage)
- Attack cooldown: 5s

**Ink attack implementation:**
- On attack, dispatch event/callback that WeatherRenderer or a simple overlay handles
- Simple: create a temporary dark div overlay (opacity 0.6, fades over 2s)
- `this._inkCooldown`, `this._inkActive` state tracking

- [ ] **Step 2: Commit**

```bash
git add src/entities/Octopus.js
git commit -m "feat(m5): add Octopus entity with ink spray attack"
```

---

## Task 10: Ghost Crab Entity

**Files:**
- Create: `src/entities/GhostCrab.js`

- [ ] **Step 1: Implement Ghost Crab entity**

Extends the Crab.js pattern but with visibility toggling.

**Canvas sprite:** Same as Crab but with blue-white tint.

**AI behavior:** Same as Crab (sideways scuttle, chase, attack) PLUS:
- Visibility toggle: 3s visible → 2s invisible (alpha fades to 0.15)
- During invisible phase: cannot be hit (`this._ghostPhase = true`)
- `takeDamage()` returns early if ghost phase active
- Visibility timer in update loop

**Critical:** `this.mesh.material.opacity` for fade effect, `material.transparent = true`.

- [ ] **Step 2: Commit**

```bash
git add src/entities/GhostCrab.js
git commit -m "feat(m5): add Ghost Crab entity with invisibility phase"
```

---

## Task 11: Weather System

**Files:**
- Create: `src/systems/Weather.js`

- [ ] **Step 1: Implement WeatherSystem**

State machine: sunny → rain → fog → sunbeams (weighted random transitions).

```javascript
export class WeatherSystem {
  constructor() {
    this.current = 'sunny';       // 'sunny' | 'rain' | 'fog' | 'sunbeams'
    this._timer = 0;              // time remaining in current weather
    this._duration = 0;           // total duration of current weather
    this._transition = 0;         // 0-1 blend factor for smooth transitions
    this._nextWeather = null;
    this._setWeather('sunny');
  }

  update(dt) {
    this._timer -= dt;
    // Smooth transition in/out (first/last 10 seconds)
    if (this._timer > this._duration - 10) {
      this._transition = Math.min(1, (this._duration - this._timer) / 10);
    } else if (this._timer < 10) {
      this._transition = Math.max(0, this._timer / 10);
    } else {
      this._transition = 1;
    }

    if (this._timer <= 0) this._pickNext();
  }

  _pickNext() {
    const weights = { sunny: 50, rain: 25, fog: 15, sunbeams: 10 };
    // ... weighted random selection
    // Duration: sunny 2-4 game-days (4-8min), rain 1-2 (2-4min), fog 1 (2min), sunbeams 0.5 (1min)
  }

  getState() { return { current: this.current, timer: this._timer, duration: this._duration }; }
  loadState(state) { ... }

  isRaining() { return this.current === 'rain' && this._transition > 0.3; }
  isFoggy() { return this.current === 'fog' && this._transition > 0.3; }

  // Day/Night interaction (spec requirement):
  // - Rain at night: darker, no stars visible
  // - Fog at morning: extra dense
  // - Sunbeams only during day/morning
  getDayNightModifier(dayPhase) {
    // dayPhase: 'day' | 'evening' | 'night' | 'morning' (from DayNightRenderer)
    if (this.current === 'rain' && dayPhase === 'night') {
      return { extraDark: 0.3, hideStars: true };
    }
    if (this.current === 'fog' && dayPhase === 'morning') {
      return { fogDensity: 1.5 };
    }
    if (this.current === 'sunbeams' && (dayPhase === 'night' || dayPhase === 'evening')) {
      return { suppress: true }; // don't show sunbeams at night/evening
    }
    return {};
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/Weather.js
git commit -m "feat(m5): add WeatherSystem with 4 weather types and smooth transitions"
```

---

## Task 12: Weather Renderer

**Files:**
- Create: `src/rendering/WeatherRenderer.js`

- [ ] **Step 1: Implement WeatherRenderer**

Three weather visual effects using THREE.js:

**Rain:** 80-100 line particles (thin white/blue), falling diagonally. Uses THREE.BufferGeometry with LineSegments.

**Fog:** Semi-transparent white plane overlay (THREE.Mesh with PlaneGeometry), opacity controlled by weather transition. Gradient from edges.

**Sunbeams:** 3-5 diagonal bright rectangles (semi-transparent yellow planes), slow drift animation. Only in maps with trees (hub, forest).

```javascript
export class WeatherRenderer {
  constructor(scene) {
    this.scene = scene;
    this._rainGroup = null;
    this._fogPlane = null;
    this._sunbeamGroup = null;
  }

  update(dt, weather, mapWidth, mapHeight, sceneName, dayPhase) {
    // Create/destroy effect groups based on weather.current
    // Update particle positions, fog opacity, sunbeam drift
    // Skip dungeon and grotto (underground maps)
    if (sceneName === 'dungeon' || sceneName === 'grotto') {
      this._hideAll();
      return;
    }

    // Day/Night interaction per spec:
    const dnMod = weather.getDayNightModifier(dayPhase);
    // - Rain at night: apply extraDark (reduce rain particle brightness)
    // - Rain at night: hide star overlay (dnMod.hideStars → DayNightRenderer checks this)
    // - Fog at morning: multiply fog opacity by dnMod.fogDensity (1.5)
    // - Sunbeams suppressed at night/evening (dnMod.suppress → skip sunbeam rendering)
    if (dnMod.suppress && weather.current === 'sunbeams') {
      this._hideSunbeams();
      return;
    }
  }

  dispose() { /* remove all groups from scene */ }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/rendering/WeatherRenderer.js
git commit -m "feat(m5): add WeatherRenderer with rain, fog, sunbeam effects"
```

---

## Task 13: Explorer Book System

**Files:**
- Create: `src/systems/ExplorerBook.js`

- [ ] **Step 1: Implement ExplorerBook data + logic**

5 categories with discovery tracking:

```javascript
// Category completion rewards — item given when all entries discovered
const CATEGORY_REWARDS = {
  shells: 'collectors_badge',
  fish: 'golden_rod',
  insects: 'butterfly_net',
  gems: 'gem_ring',
  rare: 'treasure_map',
};

export const BOOK_CATEGORIES = {
  shells: {
    name: 'Muscheln & Korallen',
    icon: '🐚',
    // 8 entries per spec (Strand + Grotte)
    entries: ['shell_common','sand_dollar','pearl','rainbow_shell','fire_coral','brain_coral','fan_coral','glow_coral'],
  },
  fish: {
    name: 'Fische',
    icon: '🐟',
    entries: ['goldfish','silverfish','starfish','rainbow_trout','pufferfish','ghostfish'],
  },
  insects: {
    name: 'Insekten & Schmetterlinge',
    icon: '🦋',
    entries: ['butterfly','ladybug','firefly','dragonfly','bee','cricket'],
  },
  gems: {
    name: 'Kristalle & Edelsteine',
    icon: '💎',
    // 6 entries per spec — cloud_crystal is M6 item but book entry exists now
    entries: ['crystal','sapphire','ruby','emerald','cloud_crystal','ghost_pearl'],
  },
  rare: {
    name: 'Seltene Fundstuecke',
    icon: '⭐',
    // 6 entries per spec — hidden across all maps
    entries: ['old_coin','fairy_dust','fossil','message_bottle','lost_diary','golden_feather'],
  },
};

export class ExplorerBook {
  constructor() {
    this.discovered = new Set(); // item/creature IDs
    this.rewardsClaimed = new Set(); // category keys where reward was given
  }

  discover(entryId) {
    if (this.discovered.has(entryId)) return false;
    this.discovered.add(entryId);
    return true; // new discovery!
  }

  // Check if a category is now 100% and reward not yet claimed
  checkCategoryReward(categoryKey) {
    if (this.rewardsClaimed.has(categoryKey)) return null;
    const prog = this.getCategoryProgress(categoryKey);
    if (prog.found >= prog.total) {
      this.rewardsClaimed.add(categoryKey);
      return CATEGORY_REWARDS[categoryKey] || null;
    }
    return null;
  }

  getCategoryProgress(categoryKey) {
    const cat = BOOK_CATEGORIES[categoryKey];
    if (!cat) return { found: 0, total: 0 };
    const found = cat.entries.filter(e => this.discovered.has(e)).length;
    return { found, total: cat.entries.length };
  }

  getTotalProgress() {
    const all = new Set();
    for (const cat of Object.values(BOOK_CATEGORIES)) {
      cat.entries.forEach(e => all.add(e));
    }
    return { found: [...all].filter(e => this.discovered.has(e)).length, total: all.size };
  }

  getState() { return { discovered: [...this.discovered], rewardsClaimed: [...this.rewardsClaimed] }; }
  loadState(state) {
    if (Array.isArray(state)) {
      // backwards compat: old format was just array
      this.discovered = new Set(state);
      this.rewardsClaimed = new Set();
    } else {
      this.discovered = new Set(state?.discovered || []);
      this.rewardsClaimed = new Set(state?.rewardsClaimed || []);
    }
  }
}
```

**Category reward flow:** When `discover()` returns true, caller should also check all categories:
```javascript
for (const catKey of Object.keys(BOOK_CATEGORIES)) {
  const rewardId = this.explorerBook.checkCategoryReward(catKey);
  if (rewardId) {
    this.inventory.addItem(rewardId, 1);
    this.hud.showInfo(`Kategorie komplett! ${getItem(rewardId).name} erhalten!`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/ExplorerBook.js
git commit -m "feat(m5): add ExplorerBook system with 5 categories and discovery tracking"
```

---

## Task 14: Explorer Book UI

**Files:**
- Create: `src/ui/ExplorerBookUI.js`

- [ ] **Step 1: Implement ExplorerBookUI**

HTML overlay triggered by Tab key. Follows CraftingUI pattern (fixed overlay, z-index 200).

```javascript
export class ExplorerBookUI {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'explorer-book';
    this.container.style.display = 'none';
    // Tab-based layout: 5 category tabs on left, entries grid on right
    // Progress bar per category
    // Total progress at bottom
    // Close button (X) or Tab again to close
    this.isOpen = false;
    document.body.appendChild(this.container);
    this._addStyles();
  }

  toggle(book) {
    this.isOpen ? this.hide() : this.show(book);
  }

  show(book) {
    this.isOpen = true;
    this._render(book);
    this.container.style.display = 'flex';
  }

  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  _render(book) {
    // Render category tabs, entry grid with discovered/undiscovered
    // Discovered entries: colored icon + name
    // Undiscovered: grey silhouette + "???"
  }

  dispose() { ... }
}
```

**Style:** Dark background, pixel-art font, book-like layout. Gold border. Tab buttons on left side with category icons.

- [ ] **Step 2: Commit**

```bash
git add src/ui/ExplorerBookUI.js
git commit -m "feat(m5): add ExplorerBookUI overlay with tab-based category view"
```

---

## Task 15: Pet Companion Entity

**Files:**
- Create: `src/entities/Pet.js`

- [ ] **Step 1: Implement Pet companion**

3 pet types with canvas sprites (16×16, 4-frame idle animation):

```javascript
const PET_TYPES = {
  fox:    { name: 'Kleiner Fuchs',    ability: 'find_items',   color: '#FF8C00' },
  dragon: { name: 'Baby-Drache',      ability: 'fire_attack',  color: '#228B22' },
  rabbit: { name: 'Magischer Hase',   ability: 'collect_boost', color: '#E0E0FF' },
};

export class Pet {
  constructor(type, scene) {
    this.type = type;
    this.def = PET_TYPES[type];
    this.x = 0; this.y = 0;
    this.friendship = 0; // 0-100
    this._friendshipTimer = 0;
    // Create canvas sprite (16x16, 4 frames)
    // Follow player with 0.3s delay (lerp)
    // No collision with world
    // Invulnerable
  }

  update(dt, playerX, playerY) {
    // Lerp toward player position with delay
    const targetX = playerX - 1; // slightly behind
    const targetY = playerY;
    this.x += (targetX - this.x) * 2.0 * dt;
    this.y += (targetY - this.y) * 2.0 * dt;

    // Friendship: +1 per minute
    this._friendshipTimer += dt;
    if (this._friendshipTimer >= 60) {
      this._friendshipTimer -= 60;
      this.friendship = Math.min(100, this.friendship + 1);
    }

    // Update sprite position
    this.sprite.setPosition(this.x, this.y, 0.2 + this.y * 0.001);
  }

  // Ability methods (called from Game.js):
  // Fox: checkNearbySecrets(playerX, playerY, props) → returns hint
  // Dragon: fireAttack(nearestMob) → 5 DMG, 3s cooldown
  // Rabbit: getCollectRadius() → returns +2

  teleportTo(x, y) {
    this.x = x - 1;
    this.y = y;
  }

  getState() { return { type: this.type, friendship: this.friendship }; }
  loadState(state) { this.friendship = state.friendship || 0; }

  dispose() { ... }
}
```

**Canvas sprites per type:**
- Fox: orange body, white belly, bushy tail, pointy ears
- Dragon: green body, gold belly, small wings, tail
- Rabbit: white body, blue glow aura, long ears, cotton tail

- [ ] **Step 2: Commit**

```bash
git add src/entities/Pet.js
git commit -m "feat(m5): add Pet companion entity with 3 types and follow mechanic"
```

---

## Task 16: Insect Entities

**Files:**
- Create: `src/entities/Insect.js`

- [ ] **Step 1: Implement collectible insects**

Small entities scattered across outdoor maps. Canvas sprites (8×8). 6 types:

```javascript
const INSECT_TYPES = {
  butterfly:  { name: 'Schmetterling',  color: '#FF69B4', maps: ['hub','forest','unicorn_meadow'] },
  ladybug:    { name: 'Marienkaefer',   color: '#FF0000', maps: ['hub','forest'] },
  firefly:    { name: 'Gluehwuermchen', color: '#FFFF00', maps: ['forest','lake'], nightOnly: true },
  dragonfly:  { name: 'Libelle',        color: '#00BFFF', maps: ['lake','beach'] },
  bee:        { name: 'Biene',          color: '#FFD700', maps: ['hub','unicorn_meadow'] },
  cricket:    { name: 'Grille',         color: '#8B4513', maps: ['forest','beach'], nightOnly: true },
};
```

**Behavior:**
- Random drift movement (very slow, 0.3 speed)
- Flee when player runs toward them (speed > threshold)
- Catchable with E key when player is slow and close (1.5 tile range)
- Catching → `explorerBook.discover(insectId)` + "Neu entdeckt!" popup
- Not added to inventory (discovery only)
- 2-3 insects per map, random positions, respawn after 120s

- [ ] **Step 2: Commit**

```bash
git add src/entities/Insect.js
git commit -m "feat(m5): add collectible insect entities for explorer book"
```

---

## Task 17: Dungeon East Exit + Game.js Grotto Integration

**Files:**
- Modify: `src/world/maps/dungeon.js`
- Modify: `src/core/Game.js`

- [ ] **Step 1: Add east exit in dungeon**

In `src/world/maps/dungeon.js`, add to exits array:
```javascript
{ id: 'east', x: W - 2, y: 13, w: 2, h: 4, target: 'grotto', spawnX: 2, spawnY: 5 },
```
Clear collision for exit tiles.

- [ ] **Step 2: Wire grotto scene in Game.js**

Add to ALL 5 scene config dictionaries:
- `mapGenerators.grotto = generateGrottoMap`
- `sceneBgs.grotto = 0x0a1a2a` (deep dark blue)
- `particleTypes.grotto = 'bubbles'` (new particle type — requires VisualEffects.js update, see below)
- `lightConfigs.grotto = { ambient: 0x4488aa, ambientI: 1.2, sun: 0x3366aa, sunI: 0.6, fog: [0x0a1a2a, 0.01] }`
- `sceneNames.grotto = 'Die Unterwasser-Grotte'`

**Add `bubbles` particle config to `src/rendering/VisualEffects.js`:**
In `startAmbientParticles()`, add to the config lookup (alongside `pollen`, `firefly`, `dust`, `magic`):
```javascript
bubbles: { count: 30, speed: 0.4, size: 0.15, color: 0x80ffff, opacity: 0.5, direction: 'up', drift: 0.2 },
```
Bubble particles rise upward (positive Y direction), slow speed, semi-transparent cyan.

Add grotto PostProcessing mood in `src/rendering/PostProcessing.js`:
```javascript
grotto: {
  tint: [0.7, 0.85, 1.1],
  tintStrength: 0.2,
  brightness: 0.9,
  contrast: 1.05,
  saturation: 0.9,
  bloomStrength: 0.5,
},
```

- [ ] **Step 3: Add import and new enemy routing in `_createMobs()`**

Import grotto map, new entities. In `_createMobs()`, add routing:
```javascript
case 'jellyfish_glow': mob = new Jellyfish(...); break;
case 'octopus': mob = new Octopus(...); break;
case 'ghost_crab': mob = new GhostCrab(...); break;
```

- [ ] **Step 4: Add zone markers for quest tracking**

In the game loop, when on grotto scene, check player proximity to zone markers:
```javascript
if (sceneName === 'grotto') {
  for (const marker of this._zoneMarkers) {
    if (distance(this.player.x, this.player.y, marker.x, marker.y) < 3) {
      this.progression.reportVisitZone(marker.zoneId);
    }
  }
}
```

- [ ] **Step 5: Add coral healing hook**

Extend `plantHealing.onHeal` callback to call `progression.reportHealCoral()` when on grotto scene.

- [ ] **Step 6: Commit**

```bash
git add src/world/maps/dungeon.js src/core/Game.js src/rendering/PostProcessing.js src/rendering/VisualEffects.js
git commit -m "feat(m5): integrate grotto scene, new enemies, zone tracking, bubbles particle into Game.js"
```

---

## Task 18: Weather + Pet + ExplorerBook Integration into Game.js

**Files:**
- Modify: `src/core/Game.js`
- Modify: `src/systems/SaveManager.js`
- Modify: `src/ui/HUD.js`

- [ ] **Step 1: Instantiate systems in init()**

```javascript
this.weather = new WeatherSystem();
this.weatherRenderer = null; // created per scene
this.explorerBook = new ExplorerBook();
this.explorerBookUI = new ExplorerBookUI();
this.pet = null; // created when player chooses pet via Marie dialog
this.insects = []; // per-scene insect entities
this._petSelectionPending = false; // set true when deep_explorer quest completes
```

- [ ] **Step 2: Implement pet selection dialog via NPC Marie**

After `deep_explorer` quest completion, Marie (NPC) gets a special dialog branch offering pet choice:

```javascript
// In DialogSystem or Game.js NPC interaction handler:
// Check if deep_explorer is complete AND pet not yet chosen
if (npcId === 'marie' && this.progression.isQuestComplete('deep_explorer') && !this.pet) {
  // Show special dialog with 3 choices
  this.dialog.showChoiceDialog(
    'Marie',
    'Du hast alle Grotten-Bereiche entdeckt! Als Belohnung darfst du dir einen Begleiter aussuchen:',
    [
      { label: 'Kleiner Fuchs (findet Geheimnisse)', value: 'fox' },
      { label: 'Baby-Drache (Feuer-Angriff)', value: 'dragon' },
      { label: 'Magischer Hase (Sammel-Bonus)', value: 'rabbit' },
    ],
    (choice) => {
      this.pet = new Pet(choice, this.scene);
      this.pet.teleportTo(this.player.x, this.player.y);
      this.progression.reportPetChosen();
      this.hud.showInfo(`${this.pet.def.name} ist jetzt dein Begleiter!`);
    }
  );
  return; // skip normal Marie dialog
}
```

**DialogSystem extension needed:** Add `showChoiceDialog(speaker, text, choices, callback)` method that renders buttons for each choice. Follows existing DialogUI pattern but with clickable option buttons below text. This is a small addition (~30 lines) to `DialogSystem.js` + `DialogUI.js`.

- [ ] **Step 3: Wire into game loop**

```javascript
// Weather update (always, like dayNight)
this.weather.update(dt);
if (this.weatherRenderer) {
  const dayPhase = this.dayNight ? this.dayNight.getPhase() : 'day';
  this.weatherRenderer.update(dt, this.weather, this.tileMap.width, this.tileMap.height, this.sceneManager.currentScene, dayPhase);
}

// Pet update (if pet exists)
if (this.pet) {
  this.pet.update(dt, this.player.x, this.player.y);
}

// Insect updates
for (const insect of this.insects) {
  insect.update(dt, this.player);
}

// Explorer Book toggle (Tab key) — must NOT consume justPressed if dialog/crafting open
if (!uiBlocking && this.input.justPressed('Tab')) {
  this.explorerBookUI.toggle(this.explorerBook);
}
// Also block movement when book is open
```

- [ ] **Step 4: Hook discovery events**

When player collects items (ResourceNode, ItemDrop, fishing catch):
```javascript
if (this.explorerBook.discover(itemId)) {
  this.hud.showInfo('Neu entdeckt: ' + itemName + '!');
  this.progression.reportDiscover(this.explorerBook.getTotalProgress().found);
}
```

- [ ] **Step 5: SaveManager extensions**

Add to save callback:
```javascript
weather: this.weather ? this.weather.getState() : null,
pet: this.pet ? this.pet.getState() : null,
explorerBook: this.explorerBook ? this.explorerBook.getState() : null,
```

Add to load path:
```javascript
if (save.weather && this.weather) this.weather.loadState(save.weather);
if (save.explorerBook && this.explorerBook) this.explorerBook.loadState(save.explorerBook);
if (save.pet) { /* recreate Pet from saved type + friendship */ }
```

Add to SaveManager.save():
```javascript
data.weather = gameState.weather || null;
data.pet = gameState.pet || null;
data.explorerBook = gameState.explorerBook || { discovered: [], rewardsClaimed: [] };
```

- [ ] **Step 6: HUD weather indicator**

In `src/ui/HUD.js`, add `updateWeather(weatherType)` method — small weather icon next to time indicator.

- [ ] **Step 7: Commit**

```bash
git add src/core/Game.js src/systems/SaveManager.js src/ui/HUD.js src/systems/DialogSystem.js src/ui/DialogUI.js
git commit -m "feat(m5): integrate weather, pets, explorer book, pet selection dialog into game loop + save/load"
```

---

## Task 19: Playwright Tests — Grotto, Weather, Pet, ExplorerBook

**Files:**
- Modify: `tests/full-test.cjs`

- [ ] **Step 1: Add 4 new test categories (10 pts each)**

Insert after T14 DAYNIGHT, before T15 VISUALS:

**T15: GROTTO (10 pts)** — scene loads, underwater tiles, jellyfish spawn, exit to dungeon works
**T16: WEATHER (10 pts)** — system exists, has current weather type, can force rain, transition works
**T17: PET (10 pts)** — system exists, pet creation works, pet follows player, friendship tracking
**T18: EXPLORER BOOK (10 pts)** — system exists, Tab toggles UI, discover adds entry, progress tracking

Renumber old T15 VISUALS → T19, T16 STABILITY → T20.

- [ ] **Step 2: Commit**

```bash
git add tests/full-test.cjs
git commit -m "test(m5): add Grotto, Weather, Pet, ExplorerBook test categories"
```

---

## Task 20: Final Integration Check

- [ ] **Step 1: Run full test suite**

```bash
npm run dev  # start dev server
node tests/full-test.cjs
```

Target: All existing 156 points still pass + new 40 points = ~196/200.

- [ ] **Step 2: Fix any failures**

Debug and fix. Common issues:
- Tab key conflict (ensure ExplorerBook checks `!uiBlocking` properly)
- Grotto lighting too dark/bright (adjust lightConfig)
- Pet not persisting across scene transitions
- Weather renderer not disposing on scene change

- [ ] **Step 3: Commit**

```bash
git add src/ tests/
git commit -m "feat(m5): Tiefsee & Freunde milestone complete — final integration fixes"
```

---

## Summary

| Task | Description | Files | Complexity |
|------|------------|-------|------------|
| 1 | New items (31) | items.js | Simple |
| 2 | Mob data (3 underwater) | mobs.js | Simple |
| 3 | Recipes + category ingredients | recipes.js, CraftingSystem, Inventory, CraftingUI | Medium |
| 4 | Quests + progression | quests.js, Progression.js | Medium |
| 5 | Level curve 21-25 | levels.js | Simple |
| 6 | Underwater tiles 15-18 | TilesetGenerator.js | Simple |
| 7 | Grotto map (45×40) | grotto.js | Medium |
| 8 | Jellyfish entity | Jellyfish.js | Medium |
| 9 | Octopus entity | Octopus.js | Medium |
| 10 | Ghost Crab entity | GhostCrab.js | Medium |
| 11 | Weather system | Weather.js | Medium |
| 12 | Weather renderer | WeatherRenderer.js | Complex |
| 13 | Explorer Book system | ExplorerBook.js | Simple |
| 14 | Explorer Book UI | ExplorerBookUI.js | Medium |
| 15 | Pet companion | Pet.js | Medium |
| 16 | Insect entities | Insect.js | Medium |
| 17 | Dungeon exit + Game.js grotto + bubbles | dungeon.js, Game.js, PostProcessing.js, VisualEffects.js | Complex |
| 18 | Weather/Pet/Book Game.js + pet dialog | Game.js, SaveManager.js, HUD.js, DialogSystem.js, DialogUI.js | Complex |
| 19 | Playwright tests (4 categories) | full-test.cjs | Medium |
| 20 | Final integration check | — | Medium |

**Parallel execution groups:**
- Tasks 1-6: All independent data tasks → parallel
- Tasks 7-10: Map + entities → parallel (no shared files)
- Tasks 11-16: Systems + UI → parallel (no shared files)
- Task 17: Game.js grotto integration (depends on 7-10) → solo, Opus model
- Task 18: Game.js weather/pet/book integration (depends on 11-16) → solo, Opus model
- Tasks 19-20: Tests + final check → sequential
