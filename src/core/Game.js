import * as THREE from 'three';
import { AssetLoader } from './AssetLoader.js';
import { InputManager } from './InputManager.js';
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
import { generateTileset, generateTilesetAsync, GENERATED_TILE_DEFS } from '../rendering/TilesetGenerator.js';
import { GroundDecorationRenderer } from '../rendering/GroundDecorationRenderer.js';
import { DayNightSystem } from '../systems/DayNight.js';
import { DayNightRenderer } from '../rendering/DayNightRenderer.js';
import { FishingSystem } from '../systems/FishingSystem.js';

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
      }
      // Oma: garden expansion with earth
      if (npcId === 'oma' && this.inventory && this.inventory.hasItem('earth', 3)) {
        this._expandOmaGarden();
      }
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
    };

    // Scene backgrounds
    this.sceneBgs = {
      hub: 0x2d5a27,
      forest: 0x1a3a1a,
      dungeon: 0x1a1a2a,
      lake: 0x1a3a4a,
      unicorn_meadow: 0x3a4a2a,
      beach: 0x87CEEB,
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
    });
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
        const scene = save.player?.scene || 'hub';
        const x = save.player?.x || 20;
        const y = save.player?.y || 15;
        await this._buildScene(scene, { x, y });
        this.player.hp = save.player?.hp || 100;
        this.progression.applyToPlayer(this.player);
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
    };
    this.vfx.startAmbientParticles(
      finalSpawn.x, finalSpawn.y,
      particleTypes[sceneName] || 'pollen'
    );

    // Resource nodes
    this.resources = new ResourceManager(this.scene);
    this.resources.createFromProps(mapData.props);

    // Plant healing
    this.plantHealing.scene = this.scene;
    this.plantHealing.clearPlants();
    this.plantHealing.createFromProps(mapData.props);
    this.plantHealing.onUnlock = () => {
      this.hud.showInfo('Die Magische Wiese ist jetzt erreichbar!');
    };

    // Unicorns (only in unicorn_meadow)
    const unicornSpawns = mapData.props.filter(p => p.type === 'unicorn_spawn');
    for (const spawn of unicornSpawns) {
      const unicorn = new Unicorn(spawn.x, spawn.y);
      unicorn.addToScene(this.scene);
      this.unicorns.push(unicorn);
    }

    // Fishing spots
    const fishingSpots = mapData.props
      .filter(p => p.type === 'fishing_spot')
      .map(p => ({ x: p.x, y: p.y, location: sceneName }));
    this.fishing.setSpots(fishingSpots);

    // Day/Night renderer (per scene)
    if (this.dayNightRenderer) this.dayNightRenderer.dispose();
    this.dayNightRenderer = new DayNightRenderer(this.scene);

    // ── LIGHTING ──
    const lightConfigs = {
      hub:             { ambient: 0xfff8ee, ambientI: 2.0, sun: 0xffeecc, sunI: 1.5, fog: null },
      forest:          { ambient: 0xaaccaa, ambientI: 1.5, sun: 0xccddbb, sunI: 1.2, fog: [0x2a4a2a, 0.008] },
      dungeon:         { ambient: 0x9988bb, ambientI: 1.8, sun: 0xaabbcc, sunI: 1.0, fog: [0x222233, 0.006] },
      lake:            { ambient: 0xccddff, ambientI: 2.0, sun: 0xffffff, sunI: 1.5, fog: null },
      unicorn_meadow:  { ambient: 0xffeecc, ambientI: 2.2, sun: 0xffddaa, sunI: 1.8, fog: null },
      beach:           { ambient: 0xfff8ee, ambientI: 2.2, sun: 0xffeedd, sunI: 1.6, fog: null },
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
          // Prefer Cute_Fantasy oak trees
          if (cfOakTex) {
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
        case 'rock':
          // Cute_Fantasy stones from Outdoor_Decor (stone rows)
          if (cfDecorTex) this.tileMapRenderer.addPropFromSheet(cfDecorTex, 0, 48, 16, 16, prop.x, prop.y, 1, 1);
          else if (vegTex) this.tileMapRenderer.addPropFromSheet(vegTex, 0, 176, 16, 16, prop.x + 0.1, prop.y + 0.1, 0.8, 0.8);
          break;
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
        case 'crystal':
        case 'torch':
        case 'fishing_spot':
        case 'wilted_plant':
        case 'unicorn_spawn':
        case 'crystal_flower':
        case 'rainbow_zone':
        case 'resource':
        case 'npc_marker':
          // These are gameplay markers, handled by their respective systems (M2/M3)
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
      const mobDef = MOB_TYPES[spawn.mobType];
      if (!mobDef) continue;
      // Use Crab entity for crab spriteType, Mob for everything else
      const mob = mobDef.spriteType === 'crab'
        ? new Crab(spawn.mobType, mobDef, spawn.x, spawn.y)
        : new Mob(spawn.mobType, mobDef, spawn.x, spawn.y);
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

    // Skip gameplay updates if dialog, crafting, or fishing UI is open
    const uiBlocking = this.dialog.isActive || this.crafting.isActive || this.fishing.isActive;

    // Dialog system
    this.dialog.update(dt, this.player, this.npcs, this.input);

    // Crafting system
    if (!this.dialog.isActive) {
      this.crafting.update(dt, this.player, this.tileMap, this.input);
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

    // Day/Night cycle
    this.dayNight.update(dt);
    if (this.dayNightRenderer) {
      this.dayNightRenderer.update(dt, this.dayNight, this.tileMap.width, this.tileMap.height, this.sceneManager.currentScene);
    }

    // Fishing (F key) — MUST be BEFORE plantHealing to get first crack at KeyF
    if (!uiBlocking) {
      this.fishing.update(dt, this.player, this.input, this.dayNight, this.inventory, this.progression, this.hud);
    }

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

    // Item drops — only auto-pickup when no UI blocking
    if (this.itemDrops && !uiBlocking) {
      const picked = this.itemDrops.update(dt, this.player, this.inventory, this.input);
      if (picked.length > 0) {
        this.hud.updateHotbar(this.inventory);
        if (this.vfx) this.vfx.pickupGlow(this.player.x, this.player.y);
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

  dispose() {
    this.running = false;
    this._clearScene();
    this.hud.dispose();
    this.sceneManager.dispose();
    this.renderer.dispose();
  }
}
