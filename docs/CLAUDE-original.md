# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Emilia's Pixel Adventure" — 2D pixel-art sandbox game (Action-Adventure + Farming/Crafting) built with Three.js and Vite for a 6-year-old child (Emilia). Stardew-Valley-gemütlich but with combat. Uses Cute_Fantasy_Free and Farm RPG asset packs (16px tile basis, 32x32 chibi characters). Personalized with Emilia's real family as NPCs and unicorns as magical creatures. All 3 milestones are implemented.

Communication with the user should be in German.

## Commands

- `npm run dev` — Start Vite dev server (hot reload)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally
- `node tests/full-test.cjs` — Playwright integration test (13 categories, requires dev server running)
- `node tests/quality-score.js` — Quality scoring (requires `playwright` in require path)

No test framework or linter. Use Playwright skill for visual testing.
Test files must use `.cjs` extension — `package.json` has `"type": "module"`, and test scripts use CommonJS `require()`.
Playwright is installed in `.claude/skills/playwright-skill/node_modules/`, not in the project root.

## Architecture

- **Entry:** `index.html` → `src/main.js` → `Game.js.init()` → MainMenu → Scene loading
- **Rendering:** Three.js OrthographicCamera (2D), MeshBasicMaterial, NearestFilter
- **Build:** Vite 6, vanilla JS ES modules
- **Coordinates:** Tile units (1 unit = 16px). Y down (map). Three.js Y negated.
- **Z-sorting:** Ground z=0, props z=0.1+Y*0.001, entities z=0.2+Y*0.001

### Module Structure (src/)

**Core:**
- `core/Game.js` — Main class: init, scene building, game loop, system orchestration
- `core/AssetLoader.js` — THREE.LoadingManager, texture cache, spritesheet loading
- `core/InputManager.js` — Keyboard + mouse state tracking. `justPressed()` is consumed (only first caller per frame gets true). `keyup` does NOT clear `_justPressed` — only `endFrame()` does.
- `core/SceneManager.js` — Async fade-to-black transitions. `_performSwitch()` awaits `loadScene()`, has `.catch()` error handler.

**Rendering:**
- `rendering/Camera.js` — Follow-lerp + map-boundary clamping
- `rendering/SpriteRenderer.js` — Horizontal-strip spritesheet animation, texture cloning, flipX. Expects `sheetData: { texture, frameWidth, frameHeight, frameCount, sheetWidth, sheetHeight }`
- `rendering/TileMapRenderer.js` — InstancedMesh ground + `addPropFromSheet()` for props
- `rendering/TilesetGenerator.js` — Loads real tiles from Cute_Fantasy/Farm RPG packs into a canvas strip. Tile IDs 0-10: grass(4), dirt(2), wood(2), flowers, stone, water.

**Entities:**
- `entities/Player.js` — Cute_Fantasy Player.png sprites, palette-swapped (black hair, pink dress). WASD movement, attack, damage, death/respawn.
- `entities/NPC.js` — Cute_Fantasy Player.png with per-NPC palette swap via `SpriteSheetLoader.js`. Name labels.
- `entities/Mob.js` — Cute_Fantasy Slimes (forest, 4 color variants via tint) + Skeletons (dungeon). AI: Idle→Chase→Attack→Death.
- `entities/Unicorn.js` — Canvas-drawn chibi unicorn with rainbow mane, sparkles. Shy behavior, petting mechanic.

**Systems:**
- `systems/DialogSystem.js` — Checks NPC range FIRST, then consumes KeyE. Prevents stealing input from other systems.
- `systems/CraftingSystem.js` — Same pattern: checks station range first, then consumes KeyE.
- `systems/ResourceNode.js` — Gatherable objects (E key), respawn timer
- `systems/Inventory.js` — 8 hotbar + 24 main slots, stacking
- `systems/ItemDrop.js` — Bouncing world items, magnet auto-pickup
- `systems/PlantHealing.js` — Wilted plants (F key), unlock counter for unicorn meadow
- `systems/SaveManager.js` — localStorage auto-save (60s)

**UI (HTML overlays):**
- `ui/HUD.js` — Pixel-art styled HP bar + hotbar (Press Start 2P font)
- `ui/DialogUI.js` — Speech bubbles with typewriter effect. First click = finish typewriter, second click = advance.
- `ui/CraftingUI.js` — Recipe list, ingredient check, craft button
- `ui/MainMenu.js` — Pixel-art start screen

**Data:**
- `data/npcs.js` — 8 family NPCs
- `data/items.js` — 30+ items
- `data/mobs.js` — 7 mob types: `slime_green/red/blue/purple`, `skeleton_base/warrior/mage`. `spriteType` field determines loading logic.
- `data/recipes.js` — Crafting recipes grouped by station

**World:**
- `world/TileMap.js` — Map data, collision queries
- `world/maps/hub.js` — Village (40×32), tree defs, NPC positions
- `world/maps/forest.js` — Forest (50×40), slime spawns, resources
- `world/maps/dungeon.js` — Cave (35×30), skeleton spawns, ore
- `world/maps/lake.js` — Lake (45×35), water tile ID 10, peaceful
- `world/maps/unicorn_meadow.js` — Meadow (25×20), unicorn spawns

**Utils:**
- `utils/SpriteSheetLoader.js` — Loads Cute_Fantasy multi-row spritesheets, extracts rows as horizontal strips, palette-swap for hair/clothing. Caches loaded images. `NPC_PALETTE_CONFIGS` defines per-character colors.
- `utils/CharacterGenerator.js` — Legacy canvas character drawing. Still importable but NOT used by Player/NPC (replaced by SpriteSheetLoader).
- `utils/Constants.js` — Tile size, speeds, z-layers
- `utils/MathUtils.js` — lerp, clamp, distance

### Testing via `window.__game`
- `window.__game` is exposed in `src/main.js` for Playwright access
- Game state: `__game.player.x/y/hp`, `__game.sceneManager.currentScene`, `__game.mobs`, `__game.npcs`
- Transitions: `__game.sceneManager.transition(sceneName, spawnX, spawnY)` — async, needs game loop running
- Dialog/Crafting state: `__game.dialog.isActive`, `__game.crafting.isActive`
- **InputManager.justPressed()** is single-frame and consumed — Playwright must use `keyboard.down()` + `waitForTimeout(100)` + `keyboard.up()` instead of `keyboard.press()` for action keys (E, F, Space)

### Key Design Patterns
- **Sprite loading:** Cute_Fantasy multi-row sheets → `SpriteSheetLoader.extractRow()` → horizontal strip → `SpriteRenderer`. Images are cached globally.
- **Palette swap:** Per-pixel color replacement on canvas. Define `from` color + tolerance + `to` color. Preserves relative brightness.
- **Tile IDs 0-10:** 0-3=grass variants, 4-5=dirt, 6-7=wood, 8=flower grass, 9=stone (dungeon), 10=water (lake). All maps use these IDs.
- **justPressed consumption order:** DialogSystem → CraftingSystem → ResourceNode. Each must check range/proximity BEFORE calling `justPressed()` to avoid stealing input.
- **UI blocking:** Dialog/Crafting UIs block player movement and combat when open
- **Scene persistence:** Inventory, HP, plant-healing count persist across map transitions. Auto-save to localStorage.
- **SceneManager transitions:** Async with error recovery. `endFrame()` must be called during transitions to clear input flags.
- **Mob tint variants:** Slimes reuse the same spritesheet with `THREE.Color` tint passed to material.

## Assets

### Cute_Fantasy_Free/ (primary art style)
- `Player/Player.png` — 192×320, 32×32 frames, 6 cols × 10 rows (idle/walk/hurt/death per direction)
- `Player/Player_Actions.png` — 96×576, 32×32 frames, 3 cols × 18 rows (sword/tool per direction)
- `Enemies/Skeleton.png` — Same layout as Player.png
- `Enemies/Slime_Green.png` — 512×192, 64×64 frames (idle 4f, move 8f, attack+death)
- `Outdoor decoration/` — Oak trees, house, bridge, fences, chest, decor sheet (flowers/stones/veggies/mushrooms)
- `Tiles/` — Grass_Middle, Path_Middle, Water_Middle (16×16 each), Water_Tile, Cliff_Tile, FarmLand_Tile (auto-tile sets)
- `Animals/` — Chicken, Cow, Pig, Sheep (64×64, 16×16 frames)
- License: Free for non-commercial use. See `read_me.txt`.

### Farm RPG FREE 16x16 - Tiny Asset Pack/ (supplementary)
- `Objects/Spring Crops.png` — Crop growth stages
- `Objects/Maple Tree.png` — Tree growth stages
- `Objects/House.png` — Modular house parts
- `Objects/` — Fences, roads, chest
- `Farm Animals/` — Cows, chickens (alternate style)

### Game Assets/ (Anokolisa — legacy, mostly replaced)
- `Entities/Mobs/` — Orc/Skeleton sprites (no longer used, replaced by Cute_Fantasy)
- `Environment/Props/Static/Trees/` — Multi-variant sheets (replaced by Cute_Fantasy Oak trees)
- `Environment/Structures/Stations/Bonfire/` — Still used for bonfire animation
- License: Anokolisa. See `Game Assets/Terms.txt`.
