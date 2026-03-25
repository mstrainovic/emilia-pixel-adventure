import * as THREE from 'three';
import { AssetLoader } from './AssetLoader.js';
import { InputManager } from './InputManager.js';
import { TouchControls } from '../ui/TouchControls.js';
import { SceneManager } from './SceneManager.js';
import { AudioManager } from './AudioManager.js';
import { Progression } from '../systems/Progression.js';
import { Camera } from '../rendering/Camera.js';
import { SpriteRenderer } from '../rendering/SpriteRenderer.js';
import { TileMapRenderer } from '../rendering/TileMapRenderer.js';
import { TileMap } from '../world/TileMap.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Mob } from '../entities/Mob.js';
import { Crab } from '../entities/Crab.js';
import { CombatSystem } from '../combat/CombatSystem.js';
import { Inventory } from '../systems/Inventory.js';
import { ItemDropManager } from '../systems/ItemDrop.js';
import { HUD } from '../ui/HUD.js';
import { MOB_TYPES } from '../data/mobs.js';
import { ResourceManager } from '../systems/ResourceNode.js';
import { PlantHealingSystem } from '../systems/PlantHealing.js';
import { Unicorn } from '../entities/Unicorn.js';
import { VisualEffects } from '../rendering/VisualEffects.js';
import { PostProcessingPipeline } from '../rendering/PostProcessing.js';
import { GameJuice, applyKnockback, updateKnockback } from '../systems/GameJuice.js';
import { DialogSystem } from '../systems/DialogSystem.js';
import { CraftingSystem } from '../systems/CraftingSystem.js';
import { SaveManager } from '../systems/SaveManager.js';
import { MainMenu } from '../ui/MainMenu.js';
import { getItem } from '../data/items.js';
import { generateHubMap, TREE_VARIANTS } from '../world/maps/hub.js';
import { generateForestMap } from '../world/maps/forest.js';
import { generateDungeonMap } from '../world/maps/dungeon.js';
import { generateLakeMap } from '../world/maps/lake.js';
import { generateUnicornMeadowMap } from '../world/maps/unicorn_meadow.js';
import { generateBeachMap } from '../world/maps/beach.js';
import { generateGrottoMap } from '../world/maps/grotto.js';
import { Jellyfish } from '../entities/Jellyfish.js';
import { Octopus } from '../entities/Octopus.js';
import { GhostCrab } from '../entities/GhostCrab.js';
import { generateTileset, generateTilesetAsync, GENERATED_TILE_DEFS } from '../rendering/TilesetGenerator.js';
import { GroundDecorationRenderer } from '../rendering/GroundDecorationRenderer.js';
import { DayNightSystem } from '../systems/DayNight.js';
import { DayNightRenderer } from '../rendering/DayNightRenderer.js';
import { FishingSystem } from '../systems/FishingSystem.js';
import { WeatherSystem } from '../systems/Weather.js';
import { WeatherRenderer } from '../rendering/WeatherRenderer.js';
import { ExplorerBook, BOOK_CATEGORIES } from '../systems/ExplorerBook.js';
import { ExplorerBookUI } from '../ui/ExplorerBookUI.js';
import { Pet } from '../entities/Pet.js';
import { createInsectsForScene } from '../entities/Insect.js';
import { generateCloudCastleMap } from '../world/maps/cloud_castle.js';
import { generateStarskyMap } from '../world/maps/starsky.js';
import { BOSS_TYPES, isBossUnlocked } from '../data/bosses.js';
import { CoconutKing } from '../entities/CoconutKing.js';
import { Leviathan } from '../entities/Leviathan.js';
import { ShadowKnight } from '../entities/ShadowKnight.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';
import { createBirdsForScene } from '../entities/Bird.js';
import { AmbientLife } from '../rendering/AmbientLife.js';
import { AchievementSystem } from '../systems/Achievements.js';
import { AchievementUI } from '../ui/AchievementUI.js';
import { NewGamePlus } from '../systems/NewGamePlus.js';
import { RARE_FIND_PLACEMENTS } from '../data/rare_finds.js';

function _createPalmSprite() {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 48;
  const ctx = c.getContext('2d');

  // Trunk — brown, slightly curved
  ctx.fillStyle = '#8B6914';
  // Main trunk segments from bottom to top
  ctx.fillRect(14, 44, 4, 4);   // base
  ctx.fillRect(13, 38, 4, 6);   // lower
  ctx.fillRect(12, 30, 4, 8);   // middle
  ctx.fillRect(13, 22, 3, 8);   // upper
  ctx.fillRect(14, 16, 3, 6);   // top

  // Trunk highlight
  ctx.fillStyle = '#A07D1A';
  ctx.fillRect(15, 38, 1, 6);
  ctx.fillRect(14, 28, 1, 8);

  // Fronds — dark green
  ctx.fillStyle = '#2D8B2D';
  // Left fronds
  ctx.fillRect(2, 10, 12, 3);
  ctx.fillRect(0, 8, 8, 2);
  ctx.fillRect(4, 12, 6, 2);
  // Right fronds
  ctx.fillRect(18, 10, 12, 3);
  ctx.fillRect(24, 8, 8, 2);
  ctx.fillRect(22, 12, 6, 2);
  // Top fronds
  ctx.fillRect(10, 4, 12, 3);
  ctx.fillRect(8, 6, 16, 3);

  // Lighter green highlights on fronds
  ctx.fillStyle = '#3DA83D';
  ctx.fillRect(4, 9, 6, 2);
  ctx.fillRect(22, 9, 6, 2);
  ctx.fillRect(12, 5, 8, 2);

  // Coconuts
  ctx.fillStyle = '#6B4E1A';
  ctx.fillRect(12, 14, 3, 3);
  ctx.fillRect(17, 15, 3, 3);
  ctx.fillRect(14, 16, 3, 2);

  return c;
}

function _createLighthouseSprite() {
  const c = document.createElement('canvas');
  c.width = 48; c.height = 64;
  const ctx = c.getContext('2d');

  // Stone base
  ctx.fillStyle = '#8B8B8B';
  ctx.fillRect(12, 54, 24, 10);
  ctx.fillStyle = '#707070';
  ctx.fillRect(12, 58, 24, 2);
  ctx.fillRect(12, 62, 24, 2);

  // White tower (slightly tapered)
  ctx.fillStyle = '#F0F0F0';
  ctx.fillRect(16, 14, 16, 40);
  // Taper sides
  ctx.fillRect(15, 34, 1, 20);
  ctx.fillRect(32, 34, 1, 20);

  // Red stripes
  ctx.fillStyle = '#CC3333';
  ctx.fillRect(16, 18, 16, 4);
  ctx.fillRect(15, 30, 18, 4);
  ctx.fillRect(15, 42, 18, 4);

  // Red roof/dome
  ctx.fillStyle = '#CC3333';
  ctx.fillRect(14, 8, 20, 6);
  ctx.fillRect(16, 4, 16, 4);
  ctx.fillRect(18, 2, 12, 2);
  ctx.fillRect(20, 0, 8, 2);

  // Light window (yellow glow)
  ctx.fillStyle = '#FFE44D';
  ctx.fillRect(20, 10, 8, 4);
  ctx.fillStyle = '#FFF8B0';
  ctx.fillRect(22, 11, 4, 2);

  // Door at base
  ctx.fillStyle = '#6B4E1A';
  ctx.fillRect(21, 50, 6, 8);

  return c;
}

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2d5a27);

    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(this.renderer.domElement);

    this.camera = new Camera();
    this.input = new InputManager();
    this.touchControls = new TouchControls(this.input);
    this.assetLoader = new AssetLoader();
    this.sceneManager = new SceneManager(this);
    this.audio = new AudioManager();
    this.progression = new Progression();
    this.tileMapRenderer = null; // created per scene
    this.groundDeco = null; // ground decoration overlay
    this.combat = new CombatSystem();
    this.hud = new HUD();
    this.dialog = new DialogSystem();
    // After NPC dialog ends → open their crafting station automatically
    this.dialog.onDialogEnd = (npcId, stationId) => {
      if (this.crafting && stationId) {
        this.crafting.openStation(stationId);
        this.crafting.cooldown = 0.5; // prevent double-open from manual E press
      }
      // Oma: garden expansion with earth
      if (npcId === 'oma' && this.inventory && this.inventory.hasItem('earth', 3)) {
        this._expandOmaGarden();
      }
    };
    // Marie pet selection — intercept dialog before normal flow
    this.dialog.beforeDialog = (npc) => {
      const npcId = npc._characterId;
      if (npcId === 'marie' && this.progression.completedQuests && this.progression.completedQuests['deep_explorer'] && !this.pet) {
        this.dialog.showChoiceDialog('Marie', 'Du hast alle Grotten-Bereiche entdeckt! Waehle deinen Begleiter:', [
          { text: 'Kleiner Fuchs', action: () => this._createPet('fox') },
          { text: 'Baby-Drache', action: () => this._createPet('dragon') },
          { text: 'Magischer Hase', action: () => this._createPet('rabbit') },
        ]);
        return true; // cancel normal dialog
      }
      return false;
    };
    this._gardenExpansions = 0; // track how many beds Oma has added
    this.saveManager = new SaveManager();
    this.itemDrops = null; // created per scene
    this.vfx = null; // visual effects, created per scene
    this.crafting = null; // created after inventory

    this.player = null;
    this.npcs = [];
    this.mobs = [];
    this.unicorns = [];
    this.tileMap = null;
    this.resources = null;
    this.plantHealing = new PlantHealingSystem(null); // scene set per map
    this.dayNight = new DayNightSystem();
    this.dayNightRenderer = null; // created per scene
    this._shootingStarReported = false;
    this.fishing = new FishingSystem();
    this.weather = new WeatherSystem();
    this.weatherRenderer = null; // created per scene in _buildScene
    this.explorerBook = new ExplorerBook();
    this.explorerBookUI = new ExplorerBookUI();
    this.pet = null; // created when player chooses pet via Marie dialog
    this.insects = [];
    this._bossStates = {};   // bossType -> { hp, defeated, playerDamageTaken }
    this._activeBoss = null;
    this.bossHealthBar = new BossHealthBar();
    this.birds = [];
    this.ambientLife = null;
    this.achievements = new AchievementSystem();
    this.achievementUI = new AchievementUI();
    this.newGamePlus = new NewGamePlus();
    this._bossNoHitKill = false;
    this._distanceWalked = 0;
    this._lastPlayerPos = null;
    this._collectedRareFinds = new Set(); // tracks one-time rare find pickups

    // Achievement unlock callback
    this.achievements.onUnlock = (def) => {
      this.achievementUI.showPopup(def);
      this.audio.playChestOpen();
      this.progression.reportAchievementUnlock(this.achievements.getCount());
      this.hud.updateAchievements(this.achievements.getCount(), this.achievements.getTotal());
    };

    // Hook fishing catches into explorer book discovery
    this.fishing.onCatch = (fishId) => this._discoverItem(fishId);
    this._animatedSprites = [];

    // Inventory (persists across scenes)
    this.inventory = new Inventory();
    this.inventory.addItem('sword_wood', 1); // start with a wooden sword
    this.inventory.onChange = () => {
      this.hud.updateHotbar(this.inventory);
      this.audio.playItemPickup();
    };

    // Tileset (generated once, reused)
    this.tilesetTexture = null;

    this.postProcessing = null;
    this.juice = new GameJuice();
    this.ambientLight = null;
    this.dirLight = null;

    this.clock = new THREE.Clock();
    this.running = false;

    // Map generators
    this.mapGenerators = {
      hub: generateHubMap,
      forest: generateForestMap,
      dungeon: generateDungeonMap,
      lake: generateLakeMap,
      unicorn_meadow: generateUnicornMeadowMap,
      beach: generateBeachMap,
      grotto: generateGrottoMap,
      cloud_castle: generateCloudCastleMap,
      starsky: generateStarskyMap,
    };

    // Scene backgrounds
    this.sceneBgs = {
      hub: 0x2d5a27,
      forest: 0x1a3a1a,
      dungeon: 0x1a1a2a,
      lake: 0x1a3a4a,
      unicorn_meadow: 0x3a4a2a,
      beach: 0x4a8aaa,
      grotto: 0x0a1a2a,
      cloud_castle: 0x2a3a6a,
      starsky: 0x0a0a1a,
    };

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hotbar number keys + item usage
    window.addEventListener('keydown', (e) => {
      if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        this.inventory.selectHotbar(parseInt(e.code.slice(5)) - 1);
        this.audio.playUIClick();
      }
      // Q key = use selected item (eat food, drink potion)
      if (e.code === 'KeyQ') {
        this._useSelectedItem();
      }
      // G key = drop selected item
      if (e.code === 'KeyG') {
        this._dropSelectedItem(e.shiftKey);
      }
      // P key for achievement overlay (only when explorer book is not open)
      if (e.code === 'KeyP' && !this.explorerBookUI.isOpen) {
        this.achievementUI.toggle(this.achievements);
      }
    });

    // Scene access gates
    this.sceneManager.beforeTransition = (target, exit) => {
      if (target === 'cloud_castle') {
        const unicornsPetted = this.progression.stats.unicornsPetted || 0;
        if (this.progression.level < 22 || unicornsPetted < 1) {
          this.hud.showInfo('Du brauchst Level 22 und musst ein Einhorn gestreichelt haben!');
          return true; // blocked
        }
      }
      if (target === 'starsky') {
        const achieveCount = this.achievements ? this.achievements.getCount() : 0;
        if (achieveCount < 25) {
          this.hud.showInfo(`Du brauchst 25 Achievements! (${achieveCount}/25)`);
          return true; // blocked
        }
      }
      return false; // allowed
    };
  }

  async init() {
    // Load real pixel-art tiles from asset packs (async)
    this.tilesetTexture = generateTileset(); // placeholder
    try {
      this.tilesetTexture = await generateTilesetAsync();
    } catch (e) {
      console.warn('Async tileset failed, using sync fallback:', e);
    }

    // Load decor texture for ground decorations
    this._decorTexture = null;
    try {
      const base = import.meta.env.BASE_URL || '/';
      this._decorTexture = await new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(
          `${base}Cute_Fantasy_Free/Outdoor decoration/Outdoor_Decor_Free.png`,
          (tex) => {
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.generateMipmaps = false;
            tex.colorSpace = THREE.SRGBColorSpace;
            resolve(tex);
          }, undefined, reject);
      });
    } catch (e) { console.warn('Decor texture not loaded:', e); }

    // Crafting system
    this.crafting = new CraftingSystem(this.inventory, this.hud);

    // Create player (persists across scenes)
    this.player = new Player();
    this.player.inventory = this.inventory;
    await this.player.loadAnimations(this.assetLoader);

    // Progression callbacks
    this.progression.onLevelUp = (level, data) => {
      this.audio.playLevelUp();
      this.hud.showLevelUp(level, data.rewards);
      this.progression.applyToPlayer(this.player);
      // Regenerate 25% HP on level up
      const healAmount = Math.ceil(this.player.maxHp * 0.25);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      this.hud.showInfo(`Level ${level}! +${healAmount} HP regeneriert!`);
      // Grant reward items
      for (const r of data.rewards) this.inventory.addItem(r.itemId, r.count);
      this.hud.updateHotbar(this.inventory);
      this.hud.updateXp(this.progression);
    };
    this.progression.onQuestComplete = (def) => {
      this.audio.playChestOpen();
      this.hud.showQuestComplete(def.name);
      // Grant quest item rewards
      if (def.itemReward) {
        for (const r of def.itemReward) this.inventory.addItem(r.itemId, r.count);
      }
      this.hud.updateQuest(this.progression.getActiveQuest());
      this.hud.updateHotbar(this.inventory);
    };
    this.progression.onXpGain = () => {
      this.hud.updateXp(this.progression);
      this.hud.updateQuest(this.progression.getActiveQuest());
    };

    // Player damage → screen flash + shake
    this.player._onDamage = (amount) => {
      this.juice.damageFlash();
      this.juice.shakeLight();
      this.audio.playPlayerHurt();
    };

    // Player death → respawn at hub
    this.player._onDeath = () => {
      this.audio.playPlayerDeath();
      this.sceneManager.transition('hub', 20, 15);
      this.hud.showInfo('Emilia wacht im Dorf auf...');
    };

    // Hide loading screen
    this.assetLoader.hideLoadingScreen();

    // Show main menu
    const menu = new MainMenu();
    const hasSave = this.saveManager.hasSave();
    menu.show(hasSave);

    menu.onStart(async () => {
      this.audio.init();
      this.audio.playUIClick();
      this.progression.initNewGame();
      menu.hide();
      await this._buildScene('hub', { x: 20, y: 15 });
      this.hud.updateHotbar(this.inventory);
      this.hud.updateXp(this.progression);
      this.hud.updateQuest(this.progression.getActiveQuest());
      this.running = true;
      this._loop();
    });

    menu.onContinue(async () => {
      this.audio.init();
      this.audio.playUIClick();
      menu.hide();
      const save = this.saveManager.load();
      if (save) {
        // Restore inventory
        if (save.inventory) {
          for (let i = 0; i < save.inventory.length && i < this.inventory.slots.length; i++) {
            this.inventory.slots[i] = save.inventory[i];
          }
        }
        this.plantHealing.totalHealed = save.plantsHealed || 0;
        this.plantHealing.unicornUnlocked = save.unicornUnlocked || false;
        if (save.progression) this.progression.loadSaveData(save.progression);
        if (save.dayNight && this.dayNight) {
          this.dayNight.loadState(save.dayNight);
        }
        if (save.fishCaught && this.progression) {
          this.progression.stats.fishCaught = save.fishCaught;
        }
        if (save.uniqueCollected && this.progression) {
          this.progression.stats.uniqueCollected = {};
          for (const [k, v] of Object.entries(save.uniqueCollected)) {
            this.progression.stats.uniqueCollected[k] = new Set(v);
          }
        }
        // Restore weather state
        if (save.weather && this.weather) {
          this.weather.loadState(save.weather);
        }
        // Restore explorer book
        if (save.explorerBook && this.explorerBook) {
          this.explorerBook.loadState(save.explorerBook);
        }
        // Restore achievements, boss states, NG+
        if (save.achievements) this.achievements.loadState(save.achievements);
        if (save.bossStates) this._bossStates = save.bossStates;
        if (save.newGamePlus) this.newGamePlus.loadState(save.newGamePlus);
        if (typeof save.distanceWalked === 'number') this._distanceWalked = save.distanceWalked;
        if (save.bossNoHitKill) this._bossNoHitKill = save.bossNoHitKill;
        if (save.collectedRareFinds) this._collectedRareFinds = new Set(save.collectedRareFinds);
        const scene = save.player?.scene || 'hub';
        const x = save.player?.x || 20;
        const y = save.player?.y || 15;
        await this._buildScene(scene, { x, y });
        this.player.hp = save.player?.hp || 100;
        this.progression.applyToPlayer(this.player);
        // Restore pet (after _buildScene so scene is available)
        if (save.pet && save.pet.type) {
          this._createPet(save.pet.type);
          this.pet.loadState(save.pet);
        }
      } else {
        this.progression.initNewGame();
        await this._buildScene('hub', { x: 20, y: 15 });
      }
      this.hud.updateHotbar(this.inventory);
      this.hud.updateXp(this.progression);
      this.hud.updateQuest(this.progression.getActiveQuest());
      this.running = true;
      this._loop();
    });
  }

  /**
   * Called by SceneManager when transitioning to a new map.
   */
  async loadScene(sceneName, spawn) {
    await this._buildScene(sceneName, spawn);
  }

  async _buildScene(sceneName, spawn) {
    // Cleanup old scene objects
    this._clearScene();

    // Set background
    this.scene.background = new THREE.Color(this.sceneBgs[sceneName] || 0x2d5a27);

    // Generate map
    const generator = this.mapGenerators[sceneName];
    if (!generator) {
      console.error(`Unknown scene: ${sceneName}`);
      return;
    }
    const mapData = generator();

    // Build tile map
    this.tileMap = new TileMap(mapData);
    this.camera.setMapBounds(mapData.width, mapData.height);

    // Render ground
    this.tileMapRenderer = new TileMapRenderer(this.scene);
    this.tileMapRenderer.buildGround({
      width: mapData.width,
      height: mapData.height,
      ground: mapData.ground,
      tilesetTexture: this.tilesetTexture,
      tileDefs: mapData.tileDefs || GENERATED_TILE_DEFS,
    });

    // Ground decoration overlay (flowers, grass tufts, pebbles)
    this.groundDeco = new GroundDecorationRenderer(this.scene);
    this.groundDeco.build(mapData.ground, mapData.collision, sceneName, this._decorTexture);

    // Extract zone markers for quest tracking
    this._zoneMarkers = mapData.props.filter(p => p.type === 'zone_marker');

    // Load props
    await this._loadProps(mapData.props);

    // Place player — use provided spawn, fallback to map's playerSpawn
    const s = spawn || {};
    const finalSpawn = {
      x: (s.x !== null && s.x !== undefined) ? s.x : (mapData.playerSpawn?.x || 10),
      y: (s.y !== null && s.y !== undefined) ? s.y : (mapData.playerSpawn?.y || 10),
    };
    this.player.x = finalSpawn.x;
    this.player.y = finalSpawn.y;
    this.player.addToScene(this.scene);

    // Create NPCs
    if (mapData.npcs) {
      await this._createNPCs(mapData.npcs);
    }

    // Create mobs
    await this._createMobs(mapData.props);

    // Item drop manager
    this.itemDrops = new ItemDropManager(this.scene);

    // Visual effects
    this.vfx = new VisualEffects(this.scene);

    // Start ambient particles based on scene type
    const particleTypes = {
      hub: 'pollen',
      forest: 'firefly',
      dungeon: 'dust',
      lake: 'pollen',
      unicorn_meadow: 'magic',
      beach: 'pollen',
      grotto: 'bubbles',
      cloud_castle: 'snow',
      starsky: 'magic',
    };
    this.vfx.startAmbientParticles(
      finalSpawn.x, finalSpawn.y,
      particleTypes[sceneName] || 'pollen'
    );

    // Resource nodes
    this.resources = new ResourceManager(this.scene);
    this.resources.createFromProps(mapData.props);

    // Rare find placement — inject hidden collectibles per scene
    const rareFinds = RARE_FIND_PLACEMENTS[sceneName] || [];
    for (const rf of rareFinds) {
      // Skip already collected (one-time pickups)
      if (this._collectedRareFinds.has(rf.itemId)) continue;

      // Check time/condition gate
      if (rf.condition === 'night' && this.dayNight && !this.dayNight.isNight()) continue;
      if (rf.condition === 'morning' && this.dayNight && this.dayNight.phase !== 'dawn') continue;
      if (rf.condition === 'boss_shadow_knight_defeated' && !this._bossStates?.shadow_knight?.defeated) continue;

      // Create as a gatherable resource node (never respawns)
      const rfProp = {
        type: 'resource',
        resourceType: 'rare_find',
        x: rf.x,
        y: rf.y,
        itemId: rf.itemId,
        hitsNeeded: 1,
        respawnTime: -1, // never respawn
      };
      this.resources.createFromProps([rfProp]);
    }

    // Wire rare find collection tracking into the ResourceManager
    this.resources.onGather = (loot) => {
      if (loot.resourceType === 'rare_find') {
        this._collectedRareFinds.add(loot.itemId);
        if (this.explorerBook) {
          if (this.explorerBook.discover(loot.itemId)) {
            const itemDef = getItem(loot.itemId);
            this.hud.showInfo('Seltener Fund: ' + (itemDef?.name || loot.itemId) + '!');
            if (this.progression.reportDiscover) {
              this.progression.reportDiscover(this.explorerBook.getTotalProgress().found);
            }
          }
        }
      }
    };

    // Plant healing
    this.plantHealing.scene = this.scene;
    this.plantHealing.clearPlants();
    this.plantHealing.createFromProps(mapData.props);
    this.plantHealing.onUnlock = () => {
      this.hud.showInfo('Die Magische Wiese ist jetzt erreichbar!');
    };
    // When a plant is healed, check if we're on grotto scene for coral quest
    this.plantHealing.onHeal = () => {
      if (this.sceneManager.currentScene === 'grotto') {
        this.progression.reportHealCoral();
      }
    };

    // Unicorns (only in unicorn_meadow)
    const unicornSpawns = mapData.props.filter(p => p.type === 'unicorn_spawn');
    for (const spawn of unicornSpawns) {
      const unicorn = new Unicorn(spawn.x, spawn.y);
      unicorn.addToScene(this.scene);
      this.unicorns.push(unicorn);
    }

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

    // Fishing spots
    const fishingSpots = mapData.props
      .filter(p => p.type === 'fishing_spot')
      .map(p => ({ x: p.x, y: p.y, location: sceneName }));
    this.fishing.setSpots(fishingSpots);
    // Create [F] Angeln prompt meshes in the current scene
    if (fishingSpots.length > 0) this.fishing._createPrompts(this.scene);

    // Day/Night renderer (per scene)
    if (this.dayNightRenderer) this.dayNightRenderer.dispose();
    this.dayNightRenderer = new DayNightRenderer(this.scene);

    // Weather renderer (per scene)
    if (this.weatherRenderer) this.weatherRenderer.dispose();
    this.weatherRenderer = new WeatherRenderer(this.scene, this.camera.three);

    // Insects (per scene)
    for (const ins of this.insects) ins.dispose();
    this.insects = createInsectsForScene(sceneName, this.scene, mapData.width, mapData.height);
    // Hook insect catch to explorer book
    for (const ins of this.insects) {
      ins.onCatch = (type) => {
        if (this.explorerBook.discover(type)) {
          this.hud.showInfo('Neu entdeckt: ' + (ins.def?.name || type) + '!');
          if (this.progression.reportDiscover) this.progression.reportDiscover(this.explorerBook.getTotalProgress().found);
          // Check category rewards
          for (const catKey of Object.keys(BOOK_CATEGORIES)) {
            const rewardId = this.explorerBook.checkCategoryReward(catKey);
            if (rewardId) {
              this.inventory.addItem(rewardId, 1);
              this.hud.showInfo('Kategorie komplett! Belohnung erhalten!');
            }
          }
        }
      };
    }

    // Birds (per scene)
    for (const bird of this.birds) bird.dispose();
    this.birds = createBirdsForScene(sceneName, this.scene, mapData.props);

    // Ambient life (swaying trees, clouds, waves, constellations)
    if (this.ambientLife) this.ambientLife.dispose();
    this.ambientLife = new AmbientLife(this.scene, this.camera);
    this.ambientLife.init(sceneName, mapData.props, mapData.width, mapData.height, this.tileMapRenderer?.propMeshes || []);

    // Teleport pet to new scene
    if (this.pet) {
      this.pet.teleportTo(this.player.x, this.player.y);
    }

    // ── LIGHTING ──
    const lightConfigs = {
      hub:             { ambient: 0xfff8ee, ambientI: 2.0, sun: 0xffeecc, sunI: 1.5, fog: null },
      forest:          { ambient: 0xaaccaa, ambientI: 1.5, sun: 0xccddbb, sunI: 1.2, fog: [0x2a4a2a, 0.008] },
      dungeon:         { ambient: 0x9988bb, ambientI: 1.8, sun: 0xaabbcc, sunI: 1.0, fog: [0x222233, 0.006] },
      lake:            { ambient: 0xccddff, ambientI: 2.0, sun: 0xffffff, sunI: 1.5, fog: null },
      unicorn_meadow:  { ambient: 0xffeecc, ambientI: 2.2, sun: 0xffddaa, sunI: 1.8, fog: null },
      beach:           { ambient: 0xeee8cc, ambientI: 1.5, sun: 0xffeedd, sunI: 1.2, fog: null },
      grotto:          { ambient: 0x55aacc, ambientI: 1.8, sun: 0x44aacc, sunI: 1.0, fog: [0x0a1a2a, 0.01] },
      cloud_castle:    { ambient: 0xccccee, ambientI: 1.4, sun: 0xffeedd, sunI: 1.0, fog: null },
      starsky:         { ambient: 0x6666aa, ambientI: 1.5, sun: 0x8888cc, sunI: 0.8, fog: [0x0a0a1a, 0.02] },
    };
    const lc = lightConfigs[sceneName] || lightConfigs.hub;

    this.ambientLight = new THREE.AmbientLight(lc.ambient, lc.ambientI);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(lc.sun, lc.sunI);
    this.dirLight.position.set(10, 15, 20);
    this.scene.add(this.dirLight);

    // Fog for depth
    if (lc.fog) {
      this.scene.fog = new THREE.FogExp2(lc.fog[0], lc.fog[1]);
    } else {
      this.scene.fog = null;
    }

    // PostProcessing — create once, reuse
    if (!this.postProcessing) {
      this.postProcessing = new PostProcessingPipeline(
        this.renderer, this.scene, this.camera.three
      );
    }
    this.postProcessing.setSceneMood(sceneName);

    // Show scene name
    const sceneNames = {
      hub: 'Emilias Dorf',
      forest: 'Der Gruene Wald',
      dungeon: 'Die Kristallhoehle',
      lake: 'Der Blaue See',
      unicorn_meadow: 'Die Magische Wiese',
      beach: 'Der Sonnenstrand',
      grotto: 'Die Unterwasser-Grotte',
      cloud_castle: 'Das Wolkenschloss',
      starsky: 'Der Sternenhimmel',
    };
    if (sceneNames[sceneName]) {
      this.hud.showInfo(sceneNames[sceneName]);
    }

    // Start scene music
    this.audio.playMusic(sceneName);

    // Report scene visit for quest tracking
    this.progression.reportVisit(sceneName);
  }

  _clearScene() {
    // Remove player from old scene
    if (this.player) this.player.removeFromScene();

    // Dispose NPCs
    for (const npc of this.npcs) npc.dispose();
    this.npcs = [];

    // Dispose mobs
    for (const mob of this.mobs) mob.dispose();
    this.mobs = [];

    // Dispose unicorns
    for (const u of this.unicorns) u.dispose();
    this.unicorns = [];

    // Dispose resources
    if (this.resources) { this.resources.dispose(); this.resources = null; }

    // Clear plants (but keep total count)
    this.plantHealing.clearPlants();

    // Dispose day/night renderer
    if (this.dayNightRenderer) {
      this.dayNightRenderer.dispose();
      this.dayNightRenderer = null;
    }

    // Dispose weather renderer
    if (this.weatherRenderer) {
      this.weatherRenderer.dispose();
      this.weatherRenderer = null;
    }

    // Dispose insects
    for (const ins of this.insects) ins.dispose();
    this.insects = [];

    // Dispose boss
    if (this._activeBoss) {
      this._activeBoss.dispose(this.scene);
      this._activeBoss = null;
    }
    this.bossHealthBar.hide();
    for (const bird of this.birds) bird.dispose();
    this.birds = [];
    if (this.ambientLife) { this.ambientLife.dispose(); this.ambientLife = null; }

    // Clear fishing spots
    this.fishing.setSpots([]);

    // Remove lights
    if (this.ambientLight) { this.scene.remove(this.ambientLight); this.ambientLight = null; }
    if (this.dirLight) { this.scene.remove(this.dirLight); this.dirLight = null; }

    // Dispose animated sprites
    for (const s of this._animatedSprites) {
      if (s.mesh.parent) this.scene.remove(s.mesh);
      s.dispose();
    }
    this._animatedSprites = [];

    // Dispose ground decorations
    if (this.groundDeco) {
      this.groundDeco.dispose();
      this.groundDeco = null;
    }

    // Dispose tile renderer
    if (this.tileMapRenderer) {
      this.tileMapRenderer.dispose();
      this.tileMapRenderer = null;
    }

    // Dispose item drops
    if (this.itemDrops) { this.itemDrops.dispose(); this.itemDrops = null; }

    // Dispose visual effects
    if (this.vfx) { this.vfx.dispose(); this.vfx = null; }

    // Clear remaining scene children (labels, etc.) except camera
    const toRemove = [];
    this.scene.traverse((child) => {
      if (child !== this.scene && child.type !== 'Camera') {
        toRemove.push(child);
      }
    });
    for (const obj of toRemove) {
      if (obj.parent === this.scene) {
        this.scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      }
    }
  }

  async _loadProps(props) {
    const treeSheets = {};
    for (const m of [1, 2, 3]) {
      try {
        treeSheets[m] = await this.assetLoader.loadTexture(
          `Environment/Props/Static/Trees/Model_0${m}/Size_02.png`
        );
      } catch (e) {}
    }

    // ── Cute_Fantasy asset textures ──
    let cfOakTex = null, cfOakSmallTex = null, cfDecorTex = null;
    let cfHouseTex = null, cfFenceTex = null, cfBridgeTex = null, cfChestTex = null;
    const cfLoad = (path) => {
      const base = import.meta.env.BASE_URL || '/';
      const url = `${base}Cute_Fantasy_Free/${path}`;
      if (this.assetLoader.cache.has(url)) return Promise.resolve(this.assetLoader.cache.get(url));
      return new Promise((resolve, reject) => {
        this.assetLoader.textureLoader.load(url, (tex) => {
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.generateMipmaps = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          this.assetLoader.cache.set(url, tex);
          resolve(tex);
        }, undefined, reject);
      });
    };
    try { cfOakTex = await cfLoad('Outdoor decoration/Oak_Tree.png'); } catch (e) {}
    try { cfOakSmallTex = await cfLoad('Outdoor decoration/Oak_Tree_Small.png'); } catch (e) {}
    try { cfDecorTex = await cfLoad('Outdoor decoration/Outdoor_Decor_Free.png'); } catch (e) {}
    try { cfHouseTex = await cfLoad('Outdoor decoration/House_1_Wood_Base_Blue.png'); } catch (e) {}
    try { cfFenceTex = await cfLoad('Outdoor decoration/Fences.png'); } catch (e) {}
    try { cfBridgeTex = await cfLoad('Outdoor decoration/Bridge_Wood.png'); } catch (e) {}
    try { cfChestTex = await cfLoad('Outdoor decoration/Chest.png'); } catch (e) {}

    let bonfireSheet = null;
    try {
      bonfireSheet = await this.assetLoader.loadSpriteSheet(
        'Environment/Structures/Stations/Bonfire/Bonfire_01-Sheet.png', 32, 32, 4
      );
    } catch (e) {}

    // ── Station sprite textures ──
    let cookingStationTex = null, workbenchTex = null, anvilTex = null;
    let sawmillTex = null, alchemyTex = null;
    try { cookingStationTex = await this.assetLoader.loadTexture('Environment/Structures/Stations/Cooking Station/Cooking Station.png'); } catch (e) {}
    try { workbenchTex = await this.assetLoader.loadTexture('Environment/Structures/Stations/Workbench/Workbench.png'); } catch (e) {}
    try { anvilTex = await this.assetLoader.loadTexture('Environment/Structures/Stations/Anvil/Anvil.png'); } catch (e) {}
    try { sawmillTex = await this.assetLoader.loadTexture('Environment/Structures/Stations/Sawmill/Base.png'); } catch (e) {}
    try { alchemyTex = await this.assetLoader.loadTexture('Environment/Structures/Stations/Alchemy/Alchemy_Table_01-Sheet.png'); } catch (e) {}

    let vegTex = null;
    try { vegTex = await this.assetLoader.loadTexture('Environment/Props/Static/Vegetation.png'); } catch (e) {}

    let farmTex = null;
    try { farmTex = await this.assetLoader.loadTexture('Environment/Props/Static/Farm.png'); } catch (e) {}

    // ── NEW Farm RPG Asset Pack — load via direct path (not ASSET_PATH) ──
    let houseTex = null, fenceTex = null, mapleTex = null, cropsTex = null;
    let roadTex = null, chestTex = null, chickenTex = null;
    const farmLoad = (path) => {
      const farmBase = import.meta.env.BASE_URL || '/';
      const url = `${farmBase}Farm RPG FREE 16x16 - Tiny Asset Pack/${path}`;
      if (this.assetLoader.cache.has(url)) return Promise.resolve(this.assetLoader.cache.get(url));
      return new Promise((resolve, reject) => {
        this.assetLoader.textureLoader.load(url, (tex) => {
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestFilter;
          tex.generateMipmaps = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          this.assetLoader.cache.set(url, tex);
          resolve(tex);
        }, undefined, reject);
      });
    };
    try { houseTex = await farmLoad('Objects/House.png'); } catch (e) { console.warn('House not loaded'); }
    try { fenceTex = await farmLoad("Objects/Fence's copiar.png"); } catch (e) { console.warn('Fence not loaded'); }
    try { mapleTex = await farmLoad('Objects/Maple Tree.png'); } catch (e) { console.warn('Maple not loaded'); }
    try { cropsTex = await farmLoad('Objects/Spring Crops.png'); } catch (e) { console.warn('Crops not loaded'); }
    try { roadTex = await farmLoad('Objects/Road copiar.png'); } catch (e) {}
    try { chestTex = await farmLoad('Objects/chest.png'); } catch (e) {}
    try {
      const chickenBase = import.meta.env.BASE_URL || '/';
      const chickenUrl = `${chickenBase}Farm RPG FREE 16x16 - Tiny Asset Pack/Farm Animals/Baby Chicken Yellow.png`;
      const chickenBaseTex = await farmLoad('Farm Animals/Baby Chicken Yellow.png');
      chickenTex = {
        texture: chickenBaseTex, frameWidth: 16, frameHeight: 16,
        frameCount: 4, sheetWidth: 64, sheetHeight: 48,
      };
    } catch (e) { console.warn('Chicken not loaded'); }

    for (const prop of props) {
      switch (prop.type) {
        case 'tree':
          if (prop.variant === 'palm') {
            // Canvas-drawn palm tree for beach
            const palmCanvas = _createPalmSprite();
            const palmTex = new THREE.CanvasTexture(palmCanvas);
            palmTex.magFilter = THREE.NearestFilter;
            palmTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(palmTex, prop.x - 0.5, prop.y - 2, 2, 3, 0.1);
          } else if (cfOakTex) {
            // Prefer Cute_Fantasy oak trees
            // Oak_Tree.png is 64x80 = 4x5 tiles
            this.tileMapRenderer.addProp(cfOakTex, prop.x - 1, prop.y - 3.5, 4, 5, 0.1);
          } else if (cfOakSmallTex) {
            // Small trees: 32x48 each, 3 trees in the sheet
            this.tileMapRenderer.addPropFromSheet(cfOakSmallTex, 0, 0, 32, 48, prop.x, prop.y - 1.5, 2, 3);
          } else {
            this._placeTree(prop, treeSheets);
          }
          break;
        case 'bonfire':
          if (bonfireSheet) {
            const bonfire = new SpriteRenderer(bonfireSheet, 200);
            bonfire.setPosition((prop.x || 0) + 1, (prop.y || 0) + 1, 0.15 + (prop.y || 0) * 0.001);
            this.scene.add(bonfire.mesh);
            this._animatedSprites.push(bonfire);
          }
          break;
        case 'station':
          this._placeStation(prop, { cookingStationTex, workbenchTex, anvilTex, sawmillTex, alchemyTex });
          break;
        case 'bush':
          // Cute_Fantasy bush from Outdoor_Decor (row 0: grass/bushes)
          if (cfDecorTex) this.tileMapRenderer.addPropFromSheet(cfDecorTex, 0, 0, 16, 16, prop.x, prop.y, 1, 1);
          else if (vegTex) this.tileMapRenderer.addPropFromSheet(vegTex, 0, 96, 32, 32, prop.x, prop.y - 0.5, 1.5, 1.5);
          break;
        case 'flower':
          // Cute_Fantasy flowers from Outdoor_Decor (bottom rows: flower beds)
          if (cfDecorTex) {
            const flowerCol = Math.floor((prop.x * 7 + prop.y * 3) % 7);
            this.tileMapRenderer.addPropFromSheet(cfDecorTex, flowerCol * 16, 176, 16, 16, prop.x, prop.y, 1, 1);
          }
          else if (vegTex) this.tileMapRenderer.addPropFromSheet(vegTex, 16, 224, 16, 16, prop.x + 0.1, prop.y + 0.1, 0.8, 0.8);
          break;
        case 'garden':
          if (cropsTex) this.tileMapRenderer.addPropFromSheet(cropsTex, ((prop.x * 7) % 4) * 16, 0, 16, 16, prop.x, prop.y, 1, 1);
          else if (farmTex) this.tileMapRenderer.addPropFromSheet(farmTex, ((prop.x * 7) % 4) * 16, 0, 16, 16, prop.x, prop.y, 1, 1);
          break;
        case 'fence':
          // Cute_Fantasy fences
          if (cfFenceTex) this.tileMapRenderer.addPropFromSheet(cfFenceTex, 0, 0, 16, 16, prop.x, prop.y, 1, 1);
          else if (farmTex) this.tileMapRenderer.addPropFromSheet(farmTex, 224, 16, 16, 32, prop.x, prop.y - 0.5, 0.8, 1.5);
          break;
        case 'rock': {
          // Canvas-drawn stone — works in all scene contexts
          const isDungeon = ['dungeon', 'grotto'].includes(this.sceneManager.currentScene);
          const rkCanvas = document.createElement('canvas');
          rkCanvas.width = 16; rkCanvas.height = 16;
          const rkCtx = rkCanvas.getContext('2d');
          if (isDungeon) {
            // Dark stone for caves
            rkCtx.fillStyle = '#555566'; rkCtx.fillRect(4, 6, 8, 6);
            rkCtx.fillStyle = '#666677'; rkCtx.fillRect(5, 5, 6, 2);
            rkCtx.fillStyle = '#777788'; rkCtx.fillRect(6, 4, 4, 2);
            rkCtx.fillStyle = '#444455'; rkCtx.fillRect(5, 7, 1, 1); rkCtx.fillRect(9, 8, 1, 1);
          } else {
            // Light stone for outdoors
            rkCtx.fillStyle = '#888888'; rkCtx.fillRect(4, 6, 8, 6);
            rkCtx.fillStyle = '#999999'; rkCtx.fillRect(5, 5, 6, 2);
            rkCtx.fillStyle = '#aaaaaa'; rkCtx.fillRect(6, 4, 4, 2);
            rkCtx.fillStyle = '#777777'; rkCtx.fillRect(5, 7, 1, 1); rkCtx.fillRect(9, 8, 1, 1);
          }
          const rkTex = new THREE.CanvasTexture(rkCanvas);
          rkTex.magFilter = THREE.NearestFilter; rkTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(rkTex, prop.x, prop.y, 0.8, 0.8, 0.11);
          break;
        }
        case 'house':
          // Cute_Fantasy House (96x128)
          if (cfHouseTex) {
            this.tileMapRenderer.addProp(cfHouseTex, prop.x, prop.y - 4, 6, 8, 0.1);
          } else if (houseTex) {
            this.tileMapRenderer.addPropFromSheet(houseTex, 128, 16, 96, 96, prop.x, prop.y - 2, 6, 6);
          } else {
            this._placeHouse(prop);
          }
          break;
        case 'maple_tree':
          // Full grown maple tree — rightmost in sheet: srcX≈120, 40×48
          if (mapleTex) {
            this.tileMapRenderer.addPropFromSheet(
              mapleTex, 118, 0, 42, 48,
              prop.x - 1, prop.y - 2.5, 2.5, 3
            );
          }
          break;
        case 'real_fence':
          // Cute_Fantasy fence (64x64 sheet, lighter wood)
          if (cfFenceTex) {
            this.tileMapRenderer.addPropFromSheet(
              cfFenceTex, 16, 0, 16, 16,
              prop.x, prop.y, 1, 1
            );
          } else if (fenceTex) {
            this.tileMapRenderer.addPropFromSheet(fenceTex, 16, 0, 16, 32, prop.x, prop.y - 0.5, 1, 2);
          }
          break;
        case 'cobble':
          // Cobblestone path from Road.png
          if (roadTex) {
            const rx = ((prop.x * 3 + prop.y * 7) % 4) * 16;
            this.tileMapRenderer.addPropFromSheet(
              roadTex, rx % 64, 0, 16, 16,
              prop.x, prop.y, 1, 1
            );
          }
          break;
        case 'crop':
          // Use Cute_Fantasy Outdoor_Decor vegetables (row ~64-80: carrots, cabbages, plants)
          if (cfDecorTex) {
            // Outdoor_Decor has veggies at various positions:
            // Row y=64: crates/boxes, y=80: veggies (carrots, cabbages), y=96: more items
            const vegOffsets = [
              [64, 64], [80, 64], [96, 64],   // crates/veggies row 1
              [64, 80], [80, 80], [96, 80],   // veggies row 2
              [0, 80], [16, 80], [32, 80],    // more plants
              [48, 80],
            ];
            const idx = (prop.cropType || 0) % vegOffsets.length;
            const [cx, cy] = vegOffsets[idx];
            this.tileMapRenderer.addPropFromSheet(
              cfDecorTex, cx, cy, 16, 16,
              prop.x, prop.y, 1, 1
            );
          } else if (cropsTex) {
            const cx = ((prop.cropType || 0) % 7) * 32;
            const cy = prop.stage ? prop.stage * 16 : 48;
            this.tileMapRenderer.addPropFromSheet(cropsTex, cx, cy, 16, 16, prop.x, prop.y, 1, 1);
          }
          break;
        case 'chest':
          if (chestTex) {
            this.tileMapRenderer.addPropFromSheet(
              chestTex, 0, 0, 16, 16,
              prop.x, prop.y, 1, 1
            );
          }
          break;
        case 'chicken':
          // Animated baby chicken!
          if (chickenTex) {
            const chick = new SpriteRenderer(chickenTex, 250);
            chick.setPosition(prop.x + 0.5, prop.y + 0.5, 0.12 + prop.y * 0.001);
            this.scene.add(chick.mesh);
            this._animatedSprites.push(chick);
          }
          break;
        case 'decoration':
          if (prop.variant === 'lighthouse') {
            const lhCanvas = _createLighthouseSprite();
            const lhTex = new THREE.CanvasTexture(lhCanvas);
            lhTex.magFilter = THREE.NearestFilter;
            lhTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(lhTex, prop.x, prop.y - 3, 3, 4, 0.1);
          }
          break;
        case 'signpost': {
          // Canvas-drawn signpost with directional arrow + label
          const spCanvas = document.createElement('canvas');
          spCanvas.width = 64;
          spCanvas.height = 48;
          const spCtx = spCanvas.getContext('2d');

          // Post
          spCtx.fillStyle = '#8B5E3C';
          spCtx.fillRect(29, 28, 6, 20);

          // Sign board background
          spCtx.fillStyle = '#C8924A';
          spCtx.fillRect(4, 4, 56, 28);
          // Board outline
          spCtx.strokeStyle = '#5a3010';
          spCtx.lineWidth = 2;
          spCtx.strokeRect(4, 4, 56, 28);

          // Arrow indicator based on direction
          spCtx.fillStyle = '#3a1a00';
          spCtx.font = 'bold 11px sans-serif';
          spCtx.textAlign = 'center';
          spCtx.textBaseline = 'top';
          const arrowMap = { north: '↑', south: '↓', east: '→', west: '←' };
          const arrow = arrowMap[prop.dir] || '→';
          spCtx.fillText(arrow, 32, 6);

          // Label text (trim emoji for canvas if needed)
          spCtx.font = 'bold 9px sans-serif';
          spCtx.fillText(prop.label || '', 32, 19);

          const spTex = new THREE.CanvasTexture(spCanvas);
          spTex.magFilter = THREE.NearestFilter;
          spTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(spTex, prop.x - 0.5, prop.y - 1, 2, 1.5, 0.15);
          break;
        }
        case 'crystal': {
          // Canvas-drawn crystal formation prop
          const crCanvas = document.createElement('canvas');
          crCanvas.width = 16; crCanvas.height = 16;
          const crCtx = crCanvas.getContext('2d');
          crCtx.fillStyle = '#6688cc'; crCtx.fillRect(7, 2, 2, 12);
          crCtx.fillStyle = '#7799dd'; crCtx.fillRect(5, 4, 6, 8);
          crCtx.fillStyle = '#5577bb'; crCtx.fillRect(4, 6, 2, 4);
          crCtx.fillStyle = '#99bbee'; crCtx.fillRect(7, 3, 1, 2); // highlight
          crCtx.fillStyle = '#aaccff'; crCtx.fillRect(9, 5, 1, 1);
          const crTex = new THREE.CanvasTexture(crCanvas);
          crTex.magFilter = THREE.NearestFilter; crTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(crTex, prop.x, prop.y - 0.5, 1, 1.2, 0.13);
          break;
        }
        case 'torch': {
          // Canvas-drawn torch with warm glow
          const toCanvas = document.createElement('canvas');
          toCanvas.width = 16; toCanvas.height = 16;
          const toCtx = toCanvas.getContext('2d');
          toCtx.fillStyle = '#5a3a1a'; toCtx.fillRect(7, 6, 2, 8); // stick
          toCtx.fillStyle = '#ff8800'; toCtx.fillRect(6, 2, 4, 5); // flame
          toCtx.fillStyle = '#ffcc00'; toCtx.fillRect(7, 1, 2, 3); // bright core
          toCtx.fillStyle = '#ff4400'; toCtx.fillRect(6, 5, 1, 2); toCtx.fillRect(9, 5, 1, 2);
          const toTex = new THREE.CanvasTexture(toCanvas);
          toTex.magFilter = THREE.NearestFilter; toTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(toTex, prop.x, prop.y - 0.3, 0.8, 1.0, 0.13);
          break;
        }
        case 'crystal_pillar': {
          // Tall crystal column for Cloud Castle
          const cpCanvas = document.createElement('canvas');
          cpCanvas.width = 16; cpCanvas.height = 32;
          const cpCtx = cpCanvas.getContext('2d');
          cpCtx.fillStyle = '#aabbee'; cpCtx.fillRect(5, 2, 6, 28);
          cpCtx.fillStyle = '#bbccff'; cpCtx.fillRect(6, 0, 4, 4);
          cpCtx.fillStyle = '#99aadd'; cpCtx.fillRect(5, 12, 6, 2);
          cpCtx.fillStyle = '#99aadd'; cpCtx.fillRect(5, 22, 6, 2);
          cpCtx.fillStyle = '#ddeeff'; cpCtx.fillRect(7, 3, 1, 6); // highlight
          cpCtx.fillStyle = '#ddeeff'; cpCtx.fillRect(7, 16, 1, 4);
          const cpTex = new THREE.CanvasTexture(cpCanvas);
          cpTex.magFilter = THREE.NearestFilter; cpTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(cpTex, prop.x, prop.y - 1.5, 1, 2.5, 0.14);
          break;
        }
        case 'fishing_spot':
        case 'wilted_plant':
        case 'unicorn_spawn':
        case 'crystal_flower':
        case 'rainbow_zone':
        case 'resource':
        case 'npc_marker':
          // These are gameplay markers, handled by their respective systems
          break;
        case 'mob_spawn':
          // Handled by _createMobs
          break;
      }
    }
  }

  _placeTree(prop, treeSheets) {
    const variant = TREE_VARIANTS[prop.variant];
    if (!variant) return;
    const sheet = treeSheets[variant.model];
    if (!sheet) return;
    const { srcX, srcY, srcW, srcH } = variant;

    // Scale trees to fit nicely (max 2.5×3 tiles)
    const maxW = 2.5;
    const maxH = 3;
    const rawW = srcW / 16;
    const rawH = srcH / 16;
    const scale = Math.min(maxW / rawW, maxH / rawH, 1);
    const wTiles = rawW * scale;
    const hTiles = rawH * scale;

    // Position: trunk at prop position, canopy above
    let px = prop.x - wTiles / 2 + 0.5;
    let py = prop.y - hTiles + 1.2;

    // Clamp to map bounds to prevent clipping
    if (this.tileMap) {
      px = Math.max(0, Math.min(this.tileMap.width - wTiles, px));
      py = Math.max(0, py);
    }

    this.tileMapRenderer.addPropFromSheet(
      sheet, srcX, srcY, srcW, srcH,
      px, py, wTiles, hTiles
    );
  }

  _placeHouse(prop) {
    const w = prop.w || 4;
    const h = prop.h || 3;
    const roofColor = prop.roofColor || [140, 60, 50];
    const wallColor = prop.wallColor || [200, 180, 140];

    // Draw house as canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Walls
    ctx.fillStyle = `rgb(${wallColor[0]},${wallColor[1]},${wallColor[2]})`;
    ctx.fillRect(4, 24, 56, 36);
    // Wall shadow
    ctx.fillStyle = `rgba(0,0,0,0.15)`;
    ctx.fillRect(4, 48, 56, 12);

    // Wall detail — horizontal wood lines
    ctx.fillStyle = `rgba(0,0,0,0.08)`;
    for (let y = 30; y < 60; y += 8) {
      ctx.fillRect(4, y, 56, 1);
    }

    // Door
    ctx.fillStyle = `rgb(${roofColor[0]-20},${roofColor[1]-10},${roofColor[2]-10})`;
    ctx.fillRect(26, 38, 12, 22);
    // Door handle
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(34, 48, 2, 2);

    // Window left
    ctx.fillStyle = '#AADDFF';
    ctx.fillRect(10, 32, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(10, 32, 5, 5);
    ctx.fillStyle = `rgb(${wallColor[0]-30},${wallColor[1]-30},${wallColor[2]-30})`;
    ctx.fillRect(14, 32, 2, 10);
    ctx.fillRect(10, 36, 10, 2);

    // Window right
    ctx.fillStyle = '#AADDFF';
    ctx.fillRect(44, 32, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(44, 32, 5, 5);
    ctx.fillStyle = `rgb(${wallColor[0]-30},${wallColor[1]-30},${wallColor[2]-30})`;
    ctx.fillRect(48, 32, 2, 10);
    ctx.fillRect(44, 36, 10, 2);

    // Roof
    ctx.fillStyle = `rgb(${roofColor[0]},${roofColor[1]},${roofColor[2]})`;
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.lineTo(32, 4);
    ctx.lineTo(64, 26);
    ctx.closePath();
    ctx.fill();
    // Roof highlight
    ctx.fillStyle = `rgba(255,255,255,0.12)`;
    ctx.beginPath();
    ctx.moveTo(8, 24);
    ctx.lineTo(32, 8);
    ctx.lineTo(40, 14);
    ctx.lineTo(16, 24);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, depthWrite: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      prop.x + w / 2,
      -(prop.y + h / 2) + 0.5,
      0.08 + prop.y * 0.001
    );
    this.scene.add(mesh);
  }

  _placeStation(prop, textures = {}) {
    const info = {
      cooking: { color: 0xcc4444, label: 'Kueche' },
      workbench: { color: 0x886633, label: 'Werkbank' },
      anvil: { color: 0x888888, label: 'Amboss' },
      sawmill: { color: 0xaa8844, label: 'Saege' },
      alchemy: { color: 0x8844aa, label: 'Alchemie' },
    }[prop.station] || { color: 0x666666, label: prop.station };

    // Sprite configs: srcX/Y/W/H from spritesheets, display w/h in tiles
    const spriteConfig = {
      cooking:   { tex: textures.cookingStationTex, srcX: 0,  srcY: 0,  srcW: 48, srcH: 48, w: 3, h: 3 },
      workbench: { tex: textures.workbenchTex,      srcX: 0,  srcY: 96, srcW: 64, srcH: 32, w: 4, h: 2 },
      anvil:     { tex: textures.anvilTex,          srcX: 0,  srcY: 112, srcW: 32, srcH: 32, w: 2, h: 2 },
      sawmill:   { tex: textures.sawmillTex,        srcX: 0,  srcY: 0,  srcW: 64, srcH: 64, w: 4, h: 4 },
      alchemy:   { tex: textures.alchemyTex,        srcX: 0,  srcY: 0,  srcW: 48, srcH: 32, w: 3, h: 2 },
    };

    const cfg = spriteConfig[prop.station];
    if (cfg && cfg.tex) {
      this.tileMapRenderer.addPropFromSheet(
        cfg.tex, cfg.srcX, cfg.srcY, cfg.srcW, cfg.srcH,
        prop.x, prop.y - (cfg.h - (prop.h || 1)) * 0.5, cfg.w, cfg.h
      );
    } else {
      // Fallback: colored rectangle
      const geo = new THREE.PlaneGeometry(prop.w || 1, prop.h || 1);
      const mat = new THREE.MeshBasicMaterial({ color: info.color, transparent: true, opacity: 0.7 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(prop.x + (prop.w || 1) / 2, -(prop.y + (prop.h || 1) / 2), 0.12 + prop.y * 0.001);
      this.scene.add(mesh);
    }

    // Label
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 24;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, 96, 24);
    ctx.fillStyle = '#fff'; ctx.fillText(info.label, 48, 13);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    const lGeo = new THREE.PlaneGeometry(1.5, 0.4);
    const lMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const label = new THREE.Mesh(lGeo, lMat);
    label.position.set(prop.x + (prop.w || 1) / 2, -(prop.y - 0.5), 0.5);
    this.scene.add(label);
  }

  async _createNPCs(npcDataArray) {
    for (const data of npcDataArray) {
      const npc = new NPC(data);
      try {
        await npc.loadAnimations(this.assetLoader);
        npc.addToScene(this.scene);
        this.npcs.push(npc);
      } catch (e) {
        console.warn(`NPC ${data.name} failed:`, e);
      }
    }
  }

  async _createMobs(props) {
    const mobSpawns = props.filter(p => p.type === 'mob_spawn');
    for (const spawn of mobSpawns) {
      // Apply NG+ scaling if active
      let mobDef = MOB_TYPES[spawn.mobType];
      if (!mobDef) continue;
      if (this.newGamePlus.active) {
        mobDef = this.newGamePlus.applyToMob(mobDef);
      }
      let mob;
      switch (mobDef.spriteType) {
        case 'crab':
          mob = new Crab(spawn.mobType, mobDef, spawn.x, spawn.y);
          break;
        case 'jellyfish':
          mob = new Jellyfish(spawn.x, spawn.y, this.scene);
          break;
        case 'octopus':
          mob = new Octopus(spawn.x, spawn.y, this.scene);
          break;
        case 'ghost_crab':
          mob = new GhostCrab(spawn.x, spawn.y, this.scene);
          break;
        default:
          mob = new Mob(spawn.mobType, mobDef, spawn.x, spawn.y);
          break;
      }
      try {
        await mob.loadAnimations(this.assetLoader);
        mob.addToScene(this.scene);
        this.mobs.push(mob);
      } catch (e) {
        console.warn(`Mob ${spawn.mobType} failed:`, e);
      }
    }
  }

  _loop() {
    if (!this.running) return;
    requestAnimationFrame(() => this._loop());

    const dt = Math.min(this.clock.getDelta(), 0.1);

    // Scene transitions
    this.sceneManager.update(dt);
    if (this.sceneManager.transitioning) {
      if (this.postProcessing) this.postProcessing.render();
      else this.renderer.render(this.scene, this.camera.three);
      this.input.endFrame();
      return;
    }

    // Hitstop freeze — skip game logic but still render
    this.juice.update(dt, this.camera.three);
    if (this.juice.isFrozen) {
      if (this.postProcessing) this.postProcessing.render();
      else this.renderer.render(this.scene, this.camera.three);
      this.input.endFrame();
      return;
    }

    // Skip gameplay updates if dialog, crafting, fishing, or explorer book UI is open
    const uiBlocking = this.dialog.isActive || this.crafting.isActive || this.fishing.isActive || this.explorerBookUI.isOpen;

    // Dialog system
    this.dialog.update(dt, this.player, this.npcs, this.input);

    // Crafting system — skip if dialog is active or just finished (cooldown prevents overlap)
    if (!this.dialog.isActive && this.dialog.cooldown <= 0) {
      this.crafting.update(dt, this.player, this.tileMap, this.input);
    } else if (this.dialog.isActive) {
      // Consume any E press so it doesn't leak to crafting after dialog closes
      this.input.justPressed('KeyE');
    }

    // Player
    if (!uiBlocking) {
      this.player.update(dt, this.input, this.tileMap);
    }

    // Combat
    if (this.player.state !== 'dead' && !uiBlocking) {
      const attacked = this.combat.tryAttack(this.player, this.input);
      if (attacked) {
        this.audio.playSwordSwing();
        if (this.vfx) this.vfx.swordSlash(this.player.x, this.player.y, this.player.direction);
      }
    }
    const hits = this.combat.update(dt, this.player, this.mobs);

    // Hit effects + knockback + juice + drops
    for (const mob of hits) {
      if (this.vfx) this.vfx.hitSparks(mob.x, mob.y);
      this.juice.shakeMedium();
      this.juice.hitstop(0.05);
      applyKnockback(mob, this.player, 2.0, 0.15);

      // Hit sound based on mob type
      const isSlime = mob.def?.spriteType === 'slime';
      if (isSlime) this.audio.playSlimeHit(); else this.audio.playSkeletonHit();

      if (!mob.alive && this.itemDrops) {
        this.itemDrops.spawnMobDrops(mob.drops, mob.x, mob.y);
        this.juice.shakeHeavy();
        if (isSlime) this.audio.playSlimeDeath(); else this.audio.playSkeletonDeath();
        // Grant XP + report kill for quests
        const xp = mob.def?.xp || 10;
        this.progression.addXp(xp);
        this.progression.reportKill(mob.mobType);
        this.hud.showInfo(`+${xp} XP`);
      }
    }

    // Boss combat
    if (this._activeBoss && this._activeBoss.alive && !uiBlocking) {
      this._activeBoss.update(dt, this.player, this.tileMap);
      this.bossHealthBar.update(this._activeBoss.hp, this._activeBoss.maxHp);

      // Check player attacks against boss (reuse combat system's attack check)
      const bossAsMob = this._activeBoss;
      const bossHits = this.combat.update(dt, this.player, [bossAsMob]);
      if (bossHits.length > 0) {
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

        // ── Endgame: Shadow Knight defeated → cutscene + NG+ offer ──
        if (boss.bossType === 'shadow_knight') {
          setTimeout(() => {
            this.dialog.showChoiceDialog('Emilia', 'Der Schatten-Ritter ist besiegt! Das Wolkenschloss ist befreit! Alle Freunde und Familie warten auf dich... Du bist eine wahre Heldin, Emilia!', [
              {
                text: 'Weiter...',
                action: () => {
                  if (this.newGamePlus.canActivate(this._bossStates)) {
                    this.dialog.showChoiceDialog('Sternenwaechterin', 'Moechtest du ein neues Abenteuer beginnen? (Deine Items und Achievements bleiben erhalten!)', [
                      {
                        text: 'Ja, neues Abenteuer! (NG+)',
                        action: () => {
                          const ngData = this.newGamePlus.activate();
                          this.progression.resetQuests();
                          this._bossStates = {};
                          this._ngMobMultipliers = ngData;
                          this.hud.showNgPlus(this.newGamePlus.cycleCount);
                          this.hud.showInfo('Neues Abenteuer+ gestartet!');
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
                },
              },
            ]);
          }, 1500);
        }
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

    // Day/Night cycle
    this.dayNight.update(dt);
    if (this.dayNightRenderer) {
      this.dayNightRenderer.update(dt, this.dayNight, this.tileMap.width, this.tileMap.height, this.sceneManager.currentScene);
    }
    if (this.hud && this.dayNight) {
      this.hud.updateTime(this.dayNight.phase);
    }

    // Shooting star quest detection
    if (this.dayNight && this.dayNight.isNight() && this.dayNightRenderer?.hasShootingStarInView(this.camera.three)) {
      if (!this._shootingStarReported) {
        this._shootingStarReported = true;
        if (this.progression) this.progression.reportObserve('shooting_star');
        if (this.hud) this.hud.showInfo('Eine Sternschnuppe!');
      }
    }
    // Reset flag when not night
    if (this.dayNight && !this.dayNight.isNight()) {
      this._shootingStarReported = false;
    }

    // Weather update (always runs, like dayNight)
    this.weather.update(dt);
    if (this.weatherRenderer) {
      const dayPhase = this.dayNight ? this.dayNight.phase : 'day';
      this.weatherRenderer.update(dt, this.weather, this.tileMap.width, this.tileMap.height, this.sceneManager.currentScene, dayPhase);
    }
    if (this.hud && this.weather) {
      this.hud.updateWeather(this.weather.current);
    }

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
        chestsFound: 0,
        secretsFound: 0,
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

    // Pet update
    if (this.pet) {
      this.pet.update(dt, this.player.x, this.player.y);
    }

    // Insect updates
    for (const insect of this.insects) {
      insect.update(dt, this.player);
    }

    // Explorer Book toggle (Tab key) — check AFTER uiBlocking check
    if (!uiBlocking && this.input.justPressed('Tab')) {
      this.explorerBookUI.toggle(this.explorerBook);
    }

    // Fishing (F key) — MUST be BEFORE plantHealing to get first crack at KeyF
    // Always call update: the state machine must keep ticking while active.
    // Idle→casting is gated internally by proximity + KeyF.
    this.fishing.update(dt, this.player, this.input, this.dayNight, this.inventory, this.progression, this.hud);

    // Plant healing (F key) — after fishing so fishing gets priority
    // (justPressed is single-consumer, so order matters)
    this.plantHealing.update(dt, this.player, this.input, this.hud);

    // Water magic (F key) — spray only if plant healing didn't consume it
    if (!uiBlocking && this.input.justPressed('KeyF') && this.vfx) {
      this.vfx.waterSpray(this.player.x, this.player.y, this.player.direction);
    }

    // Camera
    this.camera.follow(this.player.x, this.player.y, dt);

    // NPCs
    for (const npc of this.npcs) npc.update(dt);

    // Mobs (with knockback)
    for (const mob of this.mobs) {
      updateKnockback(mob, dt);
      mob.update(dt, this.player, this.tileMap);
    }

    // Zone marker proximity checking (grotto exploration quests)
    if (this.sceneManager.currentScene === 'grotto' && this._zoneMarkers) {
      for (const marker of this._zoneMarkers) {
        const dx = this.player.x - marker.x;
        const dy = this.player.y - marker.y;
        if (Math.sqrt(dx * dx + dy * dy) < 3) {
          this.progression.reportVisitZone(marker.zoneId);
        }
      }
    }

    // Item drops — only auto-pickup when no UI blocking
    if (this.itemDrops && !uiBlocking) {
      const picked = this.itemDrops.update(dt, this.player, this.inventory, this.input);
      if (picked.length > 0) {
        this.hud.updateHotbar(this.inventory);
        if (this.vfx) this.vfx.pickupGlow(this.player.x, this.player.y);
        // Explorer book discovery for picked-up items
        for (const drop of picked) {
          this._discoverItem(drop.itemId);
        }
      }
    }

    // Resources
    if (this.resources) {
      this.resources.update(dt, this.player, this.input, this.itemDrops);
    }

    // (Plant healing already called above, before water spray)

    // Unicorns
    for (const unicorn of this.unicorns) {
      unicorn.update(dt, this.player);
      // Pet with E key
      if (unicorn.canPet(this.player) && this.input.isKeyDown('KeyE')) {
        const loot = unicorn.pet(this.player);
        if (loot && this.itemDrops) {
          this.itemDrops.spawnDrop(loot.itemId, loot.count, loot.x, loot.y);
          this.hud.showInfo('Das Einhorn hat dich geheilt!');
          this.hud.updateHotbar(this.inventory);
          this.juice.healFlash();
        }
      }
    }

    // Foot dust when running
    if (this.vfx && this.player.state === 'run' && Math.random() < 0.3) {
      this.vfx.footDust(this.player.x, this.player.y);
    }

    // Visual effects
    if (this.vfx) this.vfx.update(dt);

    // Animated sprites
    for (const s of this._animatedSprites) s.update(dt);

    // Check exits — only when no UI is blocking
    if (!uiBlocking) {
      this.sceneManager.checkExits(this.player, this.tileMap);
    }

    // HUD
    this.hud.update(this.player);

    // Auto-save
    this.saveManager.update(dt, () => ({
      playerHp: this.player.hp,
      currentScene: this.sceneManager.currentScene,
      playerX: this.player.x,
      playerY: this.player.y,
      inventorySlots: this.inventory.slots,
      plantsHealed: this.plantHealing.totalHealed,
      unicornUnlocked: this.plantHealing.unicornUnlocked,
      progression: this.progression.getSaveData(),
      dayNight: this.dayNight ? this.dayNight.getState() : null,
      fishCaught: this.progression?.stats?.fishCaught || {},
      uniqueCollected: this.progression?.stats?.uniqueCollected
        ? Object.fromEntries(Object.entries(this.progression.stats.uniqueCollected).map(([k, v]) => [k, [...v]]))
        : {},
      weather: this.weather ? this.weather.getState() : null,
      pet: this.pet ? this.pet.getState() : null,
      explorerBook: this.explorerBook ? this.explorerBook.getState() : null,
      achievements: this.achievements.getState(),
      bossStates: this._bossStates,
      newGamePlus: this.newGamePlus.getState(),
      distanceWalked: this._distanceWalked,
      bossNoHitKill: this._bossNoHitKill,
      collectedRareFinds: [...this._collectedRareFinds],
    }));

    // Input cleanup
    this.input.endFrame();

    // Render with post-processing
    if (this.postProcessing) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera.three);
    }
  }

  _useSelectedItem() {
    if (!this.player || this.player.state === 'dead') return;
    const item = this.inventory.getSelectedItem();
    if (!item) return;

    if (item.healAmount && this.player.hp < this.player.maxHp) {
      this.player.heal(item.healAmount);
      this.inventory.removeItem(item.id, 1);
      this.hud.updateHotbar(this.inventory);
      this.hud.showInfo(`${item.name} benutzt! +${item.healAmount} HP`);
      if (this.juice) this.juice.healFlash();
      this.audio.playEat();
      this.audio.playHeal();
    }
  }

  _dropSelectedItem(dropAll = false) {
    if (!this.player || this.player.state === 'dead') return;
    if (!this.itemDrops) return;

    const slot = this.inventory.slots[this.inventory.selectedHotbar];
    if (!slot.itemId) return;

    const itemId = slot.itemId;
    const dropCount = dropAll ? slot.count : 1;
    const itemDef = getItem(itemId);

    this.inventory.removeItem(itemId, dropCount);

    // Drop in front of player
    const dirOffsets = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = dirOffsets[this.player.direction] || [0, 1];
    this.itemDrops.spawnDrop(itemId, dropCount, this.player.x + dx * 1.5, this.player.y + dy * 1.5, true);
    this.hud.updateHotbar(this.inventory);
    this.hud.showInfo(`${itemDef?.name || itemId} fallengelassen`);
    this.audio.playUIClick();
  }

  /**
   * Oma's garden expansion — costs 3 earth, creates a new garden bed
   */
  _expandOmaGarden() {
    if (this._gardenExpansions >= 4) {
      this.hud.showInfo('Der Garten ist voll ausgebaut!');
      return;
    }

    this.inventory.removeItem('earth', 3);
    this._gardenExpansions++;
    this.hud.updateHotbar(this.inventory);

    if (this.audio) this.audio.playCraftSuccess();
    if (this.progression) {
      this.progression.addXp(15);
    }

    // New bed positions (extending Oma's garden east/south)
    const bedPositions = [
      [{ x: 12, y: 22, t: 3 }, { x: 12, y: 24, t: 4 }],
      [{ x: 13, y: 22, t: 5 }, { x: 13, y: 24, t: 6 }],
      [{ x: 6, y: 26, t: 0 }, { x: 7, y: 26, t: 1 }],
      [{ x: 8, y: 26, t: 2 }, { x: 9, y: 26, t: 3 }],
    ];

    const beds = bedPositions[this._gardenExpansions - 1];
    if (beds && this.tileMapRenderer) {
      for (const bed of beds) {
        this.tileMapRenderer.addPropFromSheet(
          this.scene, bed.x, bed.y, 1.0, 1.0,
          null, 0x44aa22, 0.15 + bed.y * 0.001
        );
      }
    }

    this.hud.showInfo(`Oma hat ein neues Beet angelegt! (-3 Erde, +15 XP) [${this._gardenExpansions}/4]`);
  }

  /**
   * Explorer book discovery for any item (called from item pickup, fishing, etc.)
   */
  _discoverItem(itemId) {
    if (!this.explorerBook || !itemId) return;
    if (this.explorerBook.discover(itemId)) {
      const itemDef = getItem(itemId);
      this.hud.showInfo('Neu entdeckt: ' + (itemDef?.name || itemId) + '!');
      if (this.progression.reportDiscover) this.progression.reportDiscover(this.explorerBook.getTotalProgress().found);
      for (const catKey of Object.keys(BOOK_CATEGORIES)) {
        const rewardId = this.explorerBook.checkCategoryReward(catKey);
        if (rewardId) {
          this.inventory.addItem(rewardId, 1);
          this.hud.showInfo('Kategorie komplett! Belohnung erhalten!');
        }
      }
    }
  }

  /**
   * Create a pet companion for the player.
   */
  _createPet(type) {
    this.pet = new Pet(type, this.scene);
    this.pet.teleportTo(this.player.x, this.player.y);
    if (this.progression.reportPetChosen) this.progression.reportPetChosen();
    this.hud.showInfo(this.pet.def.name + ' ist jetzt dein Begleiter!');
  }

  dispose() {
    this.running = false;
    this._clearScene();
    this.hud.dispose();
    if (this.explorerBookUI) this.explorerBookUI.dispose();
    if (this.pet) this.pet.dispose();
    this.sceneManager.dispose();
    this.renderer.dispose();
  }
}
