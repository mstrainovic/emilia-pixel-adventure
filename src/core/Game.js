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
import { generateHubMap } from '../world/maps/hub.js';
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
import { DamageNumbers } from '../rendering/DamageNumbers.js';
import { PickupPopup } from '../ui/PickupPopup.js';
import { MapVignette } from '../rendering/MapVignette.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { TradeUI } from '../ui/TradeUI.js';
import { LightingSystem } from '../rendering/LightingSystem.js';
import { EmotionBubbles } from '../rendering/EmotionBubbles.js';
import { WaterRenderer } from '../rendering/WaterRenderer.js';
import { QuestWaypoint } from '../ui/QuestWaypoint.js';
import { Minimap } from '../ui/Minimap.js';
import { TutorialTooltips } from '../ui/TutorialTooltips.js';
import { HelpOverlay } from '../ui/HelpOverlay.js';
import { FriendshipSystem } from '../systems/FriendshipSystem.js';
import { FAMILY_NPCS } from '../data/npcs.js';

function _createPalmSprite() {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 48;
  const ctx = c.getContext('2d');

  // ── Trunk — curved with bark rings ──
  // Base roots (wider, darker)
  ctx.fillStyle = '#5A4010';
  ctx.fillRect(12, 45, 8, 3);
  ctx.fillRect(11, 46, 2, 2);
  ctx.fillRect(20, 46, 2, 2);

  // Main trunk with slight curve (bottom to top)
  ctx.fillStyle = '#7A5A18';
  ctx.fillRect(14, 42, 5, 4);   // base
  ctx.fillRect(13, 36, 5, 6);   // lower
  ctx.fillRect(12, 28, 5, 8);   // middle (slight left lean)
  ctx.fillRect(13, 20, 4, 8);   // upper
  ctx.fillRect(14, 14, 3, 6);   // crown

  // Bark ring texture (horizontal dark lines)
  ctx.fillStyle = '#5A4010';
  for (let y = 44; y >= 16; y -= 3) {
    const xOff = y > 36 ? 14 : y > 28 ? 13 : y > 20 ? 12 : 14;
    const w = y > 36 ? 5 : y > 28 ? 5 : y > 20 ? 4 : 3;
    ctx.fillRect(xOff, y, w, 1);
  }

  // Trunk highlight (right side — sunlit)
  ctx.fillStyle = '#9A7A28';
  ctx.fillRect(17, 42, 1, 4);
  ctx.fillRect(16, 36, 1, 6);
  ctx.fillRect(15, 28, 1, 8);
  ctx.fillRect(15, 20, 1, 8);

  // ── Fronds — layered with depth ──
  // Back fronds (darker, behind trunk)
  ctx.fillStyle = '#1A6A20';
  // Back-left drooping frond
  ctx.fillRect(4, 12, 10, 2);
  ctx.fillRect(1, 13, 6, 2);
  ctx.fillRect(0, 14, 3, 1);
  // Back-right drooping frond
  ctx.fillRect(18, 12, 10, 2);
  ctx.fillRect(25, 13, 6, 2);
  ctx.fillRect(29, 14, 3, 1);

  // Mid fronds (medium green)
  ctx.fillStyle = '#2D8B2D';
  // Left frond — graceful arc
  ctx.fillRect(3, 9, 12, 2);
  ctx.fillRect(1, 10, 8, 2);
  ctx.fillRect(0, 11, 4, 2);
  ctx.fillRect(5, 11, 4, 1);
  // Right frond — graceful arc
  ctx.fillRect(17, 9, 12, 2);
  ctx.fillRect(23, 10, 8, 2);
  ctx.fillRect(28, 11, 4, 2);
  ctx.fillRect(23, 11, 4, 1);
  // Top upward fronds
  ctx.fillRect(11, 5, 10, 2);
  ctx.fillRect(9, 7, 14, 2);
  ctx.fillRect(10, 3, 6, 2);

  // Front fronds (brightest, in front)
  ctx.fillStyle = '#3AAE3A';
  // Left front
  ctx.fillRect(4, 8, 8, 1);
  ctx.fillRect(2, 9, 5, 1);
  // Right front
  ctx.fillRect(20, 8, 8, 1);
  ctx.fillRect(25, 9, 5, 1);
  // Top highlight
  ctx.fillRect(12, 4, 7, 1);
  ctx.fillRect(11, 6, 9, 1);

  // Leaf vein details (thin dark lines)
  ctx.fillStyle = '#1A6A20';
  ctx.fillRect(6, 10, 6, 1);
  ctx.fillRect(20, 10, 6, 1);
  ctx.fillRect(13, 5, 5, 1);

  // ── Coconuts — round with highlights ──
  ctx.fillStyle = '#6B4E1A';
  ctx.fillRect(12, 13, 3, 3);
  ctx.fillRect(17, 14, 3, 3);
  ctx.fillRect(14, 15, 3, 2);
  // Coconut highlight
  ctx.fillStyle = '#8B6E2A';
  ctx.fillRect(12, 13, 1, 1);
  ctx.fillRect(17, 14, 1, 1);
  ctx.fillRect(14, 15, 1, 1);

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
    this.hud.onItemUse = (slotIdx) => this._useItemFromSlot(slotIdx);
    this.questWaypoint = new QuestWaypoint();
    this.minimap = new Minimap();
    this.tutorialTooltips = new TutorialTooltips();
    this.helpOverlay = new HelpOverlay();
    this._isNewGame = false;
    this.pickupPopup = new PickupPopup();
    this.gameOverScreen = new GameOverScreen();
    this.damageNumbers = null; // floating damage numbers, created per scene
    this.dialog = new DialogSystem();
    this.friendship = new FriendshipSystem();
    this._npcDefs = FAMILY_NPCS; // expose for DialogSystem friendshipDialogs lookup
    // After NPC dialog ends → open their crafting station automatically
    this.tradeUI = new TradeUI();
    this.tradeUI.onSell = (slotIndex, itemId, sellValue) => {
      this.hud.showInfo(`Verkauft! +${sellValue} Muenze${sellValue > 1 ? 'n' : ''}`);
      this.hud.updateHotbar(this.inventory);
      this.hud.updateCoins(this.inventory.coins);
      if (this.audio) this.audio.playUIClick();
    };
    this.dialog.onDialogEnd = (npcId, stationId) => {
      // Track friendship on talk
      if (this.friendship && npcId) {
        this.friendship.onTalk(npcId, this.dayNight?.day || 0);
      }
      if (this.crafting && stationId) {
        this.crafting.openStation(stationId);
        this.crafting.cooldown = 0.5; // prevent double-open from manual E press
      }
      // Ferdinand: open trade UI after dialog
      if (npcId === 'ferdinand' && this.tradeUI && this.inventory) {
        setTimeout(() => {
          this.tradeUI.show(this.inventory);
        }, 200);
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

    // Map edge vignette (persists across scenes)
    this.mapVignette = new MapVignette();

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
      grotto: 0x1A3050,
      cloud_castle: 0x87CEEB,
      starsky: 0x0A0A2E,
    };

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hotbar number keys + item usage + reorder
    window.addEventListener('keydown', (e) => {
      if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        const keyIndex = parseInt(e.code.slice(5)) - 1;
        // If reorder is active, swap instead of select
        if (this.hud.handleHotbarReorderKey(this.inventory, keyIndex)) {
          this.audio.playUIClick();
          return;
        }
        this.inventory.selectHotbar(keyIndex);
        this.audio.playUIClick();
        // Show weapon equip feedback when selecting a weapon slot
        const selected = this.inventory.getSelectedItem();
        if (selected && selected.category === 'weapon') {
          this.hud.showInfo(`${selected.name} ausgeruestet! (${selected.damage} Schaden)`);
        }
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
        if (this.progression.level < 15 || unicornsPetted < 1) {
          this.hud.showInfo('Du brauchst Level 15 und musst ein Einhorn gestreichelt haben!');
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
      // Level-up particle celebration
      if (this.ambientLife?._particles && this.player) {
        this.ambientLife._particles.burst(this.player.x, this.player.y, 30, {
          type: 'spark', color: [1, 0.9, 0.3], life: 1.8, size: 1.2,
        });
      }
      if (this.juice) this.juice.whiteFlash();
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
      // Track friendship for quest-associated NPC
      if (this.friendship && def.id) {
        this.friendship.onQuestComplete(def.id);
      }
      this.audio.playChestOpen();
      this.hud.showQuestComplete(def.name);
      // Celebration particle burst around player
      if (this.ambientLife?._particles && this.player) {
        this.ambientLife._particles.burst(this.player.x, this.player.y, 25, {
          type: 'sparkle', color: [1, 0.85, 0.2], life: 2, size: 1.3,
        });
        this.ambientLife._particles.burst(this.player.x, this.player.y, 15, {
          type: 'spark', color: [1, 1, 0.6], life: 1.5, size: 0.9,
        });
      }
      if (this.juice) this.juice.whiteFlash();
      // Grant quest item rewards
      if (def.itemReward) {
        for (const r of def.itemReward) this.inventory.addItem(r.itemId, r.count);
      }
      this.hud.updateHotbar(this.inventory);
      // Delay showing next quest until completion celebration finishes (3s)
      setTimeout(() => {
        this.hud.updateQuest(this.progression.getActiveQuest());
      }, 3000);
    };
    this.progression.onXpGain = () => {
      this.hud.updateXp(this.progression);
      // Don't update quest tracker during completion celebration
      if (!this.hud._questCompleteTimer) {
        this.hud.updateQuest(this.progression.getActiveQuest());
      }
    };

    // Player damage → screen flash + shake + damage number + impact particles
    this.player._onDamage = (amount) => {
      this.juice.damageFlash();
      this.juice.shakeMedium();
      this.juice.hitstop(0.04);
      this.audio.playPlayerHurt();
      if (this.vfx) this.vfx.playerHitEffect(this.player.x, this.player.y);
      if (this.damageNumbers) {
        this.damageNumbers.spawn(this.player.x, this.player.y, amount, true);
      }
    };

    // Player death → show death screen, then respawn at hub
    this.player._onDeath = () => {
      this.audio.playPlayerDeath();
      this.juice.shakeHeavy();

      // Show death screen overlay — game pauses while active
      this.gameOverScreen.show(() => {
        // On continue: transition to hub, then respawn player
        this.sceneManager.transition('hub', 20, 15);
        this.player.respawn();
        this.hud.showInfo('Emilia wacht im Dorf auf...');
      });
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
      this._isNewGame = true;
      menu.hide();
      await this._buildScene('hub', { x: 20, y: 15 });
      this.hud.updateHotbar(this.inventory);
      this.hud.updateCoins(this.inventory.coins);
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
        if (typeof save.coins === 'number') this.inventory.coins = save.coins;
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
        if (this.tutorialTooltips) this.tutorialTooltips.loadState(save.seenTooltips || []);
        if (this.friendship) this.friendship.loadState(save.friendship || {});
        this._isNewGame = false;
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
      // Recheck quests that may now be complete (e.g. after quest count changes)
      this.progression.recheckActiveQuests();
      this.hud.updateHotbar(this.inventory);
      this.hud.updateCoins(this.inventory.coins);
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
    this.camera.resetZoom(); // fresh zoom for new scene

    // Update minimap terrain
    if (this.minimap) {
      this.minimap.setScene(sceneName, mapData.ground, mapData.width, mapData.height, mapData.exits);
    }

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

    // Add a dark drop shadow under the player in cloud_castle for visibility
    if (sceneName === 'cloud_castle') {
      const shadowGeo = new THREE.CircleGeometry(0.7, 16);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x334466,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      this._cloudPlayerShadow = new THREE.Mesh(shadowGeo, shadowMat);
      this._cloudPlayerShadow.scale.set(1, 0.35, 1);
      this.scene.add(this._cloudPlayerShadow);
    } else {
      this._cloudPlayerShadow = null;
    }

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

    // Floating damage numbers
    this.damageNumbers = new DamageNumbers(this.scene);

    // Start per-scene ambient particles (pollen, fireflies, sparkles, etc.)
    this.vfx.startAmbientParticles(sceneName, {
      width: mapData.width,
      height: mapData.height,
    });

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
      // Cinematic zoom for boss encounter
      this.camera.zoomTo(1.15, 1.5);
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

    // Map edge vignette — set scene tint
    this.mapVignette.setScene(sceneName);

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

    // Ambient life (swaying trees, clouds, waves, constellations, particles)
    if (this.ambientLife) this.ambientLife.dispose();
    this.ambientLife = new AmbientLife(this.scene, this.camera);
    this.ambientLife.init(sceneName, mapData.props, mapData.width, mapData.height, this.tileMapRenderer?.propMeshes || []);

    // Dynamic lighting (torches, bonfires, crystals)
    if (this.lighting) this.lighting.dispose();
    this.lighting = new LightingSystem(this.scene);
    this.lighting.init(sceneName, mapData.props);

    // NPC emotion bubbles
    if (this.emotionBubbles) this.emotionBubbles.dispose();
    this.emotionBubbles = new EmotionBubbles(this.scene);

    // Animated water shader overlay
    if (this.waterRenderer) this.waterRenderer.dispose();
    this.waterRenderer = new WaterRenderer(this.scene);
    this.waterRenderer.init(sceneName, mapData.ground, mapData.width, mapData.height);

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
      unicorn_meadow:  { ambient: 0xeee8cc, ambientI: 1.8, sun: 0xffddaa, sunI: 1.3, fog: null },
      beach:           { ambient: 0xeee8cc, ambientI: 1.5, sun: 0xffeedd, sunI: 1.2, fog: null },
      grotto:          { ambient: 0x66bbdd, ambientI: 2.4, sun: 0x55bbdd, sunI: 1.4, fog: [0x1A3050, 0.005] },
      cloud_castle:    { ambient: 0xeeeeff, ambientI: 2.0, sun: 0xfff8ee, sunI: 1.5, fog: null },
      starsky:         { ambient: 0x7777bb, ambientI: 1.6, sun: 0x9999dd, sunI: 0.9, fog: [0x0A0A2E, 0.015] },
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
    // Hide death screen on scene clear (prevents stale overlay)
    if (this.gameOverScreen) this.gameOverScreen.hide();

    // Remove player from old scene
    if (this.player) this.player.removeFromScene();

    // Remove cloud castle player shadow
    if (this._cloudPlayerShadow) {
      this.scene.remove(this._cloudPlayerShadow);
      this._cloudPlayerShadow.geometry.dispose();
      this._cloudPlayerShadow.material.dispose();
      this._cloudPlayerShadow = null;
    }

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
    if (this.lighting) { this.lighting.dispose(); this.lighting = null; }
    if (this.emotionBubbles) { this.emotionBubbles.dispose(); this.emotionBubbles = null; }
    if (this.waterRenderer) { this.waterRenderer.dispose(); this.waterRenderer = null; }

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

    // Dispose damage numbers
    if (this.damageNumbers) { this.damageNumbers.dispose(); this.damageNumbers = null; }

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

    // ── Farm RPG Asset Pack — load via direct path (keep only cropsTex, mapleTex, chickenTex) ──
    let mapleTex = null, cropsTex = null;
    let chickenTex = null;
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
    try { mapleTex = await farmLoad('Objects/Maple Tree.png'); } catch (e) { console.warn('Maple not loaded'); }
    try { cropsTex = await farmLoad('Objects/Spring Crops.png'); } catch (e) { console.warn('Crops not loaded'); }
    try {
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
          }
          break;
        case 'bonfire': {
          // Canvas-drawn animated bonfire (4-frame strip, 128x32)
          const bfCanvas = document.createElement('canvas');
          bfCanvas.width = 128; bfCanvas.height = 32;
          const bfCtx = bfCanvas.getContext('2d');
          for (let f = 0; f < 4; f++) {
            const ox = f * 32;
            // Stone ring base
            bfCtx.fillStyle = '#777777';
            bfCtx.fillRect(ox + 6, 24, 4, 4); bfCtx.fillRect(ox + 22, 24, 4, 4);
            bfCtx.fillRect(ox + 10, 26, 12, 4);
            bfCtx.fillStyle = '#666666';
            bfCtx.fillRect(ox + 8, 28, 16, 2);
            // Log base
            bfCtx.fillStyle = '#5A4010';
            bfCtx.fillRect(ox + 10, 22, 12, 4);
            bfCtx.fillRect(ox + 8, 24, 4, 2);
            bfCtx.fillRect(ox + 20, 24, 4, 2);
            // Flame core (varies per frame)
            const flameH = [12, 14, 11, 13][f];
            const flameW = [8, 10, 9, 7][f];
            const flameOx = [12, 11, 11, 12][f];
            // Red outer flame
            bfCtx.fillStyle = '#CC3300';
            bfCtx.fillRect(ox + flameOx - 1, 22 - flameH, flameW + 2, flameH);
            // Orange middle flame
            bfCtx.fillStyle = '#FF6600';
            bfCtx.fillRect(ox + flameOx + 1, 22 - flameH + 2, flameW - 2, flameH - 3);
            // Yellow inner flame
            bfCtx.fillStyle = '#FFCC00';
            bfCtx.fillRect(ox + flameOx + 2, 22 - flameH + 5, flameW - 4, flameH - 7);
            // Bright tip
            bfCtx.fillStyle = '#FFEE88';
            bfCtx.fillRect(ox + 14 + (f % 2), 22 - flameH + 3, 2, 3);
            // Sparks
            bfCtx.fillStyle = '#FFAA00';
            bfCtx.fillRect(ox + 10 + f * 2, 22 - flameH - 1, 1, 1);
            bfCtx.fillRect(ox + 18 - f, 22 - flameH + 1, 1, 1);
          }
          const bfTex = new THREE.CanvasTexture(bfCanvas);
          bfTex.magFilter = THREE.NearestFilter;
          bfTex.minFilter = THREE.NearestFilter;
          bfTex.generateMipmaps = false;
          bfTex.colorSpace = THREE.SRGBColorSpace;
          const bfSheet = {
            texture: bfTex, frameWidth: 32, frameHeight: 32,
            frameCount: 4, sheetWidth: 128, sheetHeight: 32,
          };
          const bonfire = new SpriteRenderer(bfSheet, 200);
          bonfire.setPosition((prop.x || 0) + 1, (prop.y || 0) + 1, 0.15 + (prop.y || 0) * 0.001);
          this.scene.add(bonfire.mesh);
          this._animatedSprites.push(bonfire);
          break;
        }
        case 'station':
          this._placeStation(prop);
          break;
        case 'bush':
          // Cute_Fantasy bush from Outdoor_Decor (row 0: grass/bushes)
          if (cfDecorTex) this.tileMapRenderer.addPropFromSheet(cfDecorTex, 0, 0, 16, 16, prop.x, prop.y, 1, 1);
          break;
        case 'flower':
          // Cute_Fantasy flowers from Outdoor_Decor (bottom rows: flower beds)
          if (cfDecorTex) {
            const flowerCol = Math.floor((prop.x * 7 + prop.y * 3) % 4); // Only cols 0-3 filled in row 11
            this.tileMapRenderer.addPropFromSheet(cfDecorTex, flowerCol * 16, 176, 16, 16, prop.x, prop.y, 1, 1);
          }
          break;
        case 'garden':
          if (cropsTex) this.tileMapRenderer.addPropFromSheet(cropsTex, ((prop.x * 7) % 4) * 16, 0, 16, 16, prop.x, prop.y, 1, 1);
          break;
        case 'fence':
          // Cute_Fantasy fences
          if (cfFenceTex) this.tileMapRenderer.addPropFromSheet(cfFenceTex, 0, 0, 16, 16, prop.x, prop.y, 1, 1);
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
          this.tileMapRenderer.addProp(rkTex, prop.x, prop.y, 0.8, 0.8, 0.1);
          break;
        }
        case 'house':
          // Cute_Fantasy House (96x128)
          if (cfHouseTex) {
            this.tileMapRenderer.addProp(cfHouseTex, prop.x, prop.y - 4, 6, 8, 0.1);
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
          }
          break;
        case 'cobble':
          // Canvas-drawn cobblestone path tile
          if (cfDecorTex) {
            // Use stone/path tiles from Cute_Fantasy decor
            this.tileMapRenderer.addPropFromSheet(cfDecorTex, 0, 96, 16, 16, prop.x, prop.y, 1, 1);
          }
          break;
        case 'crop':
          // Use Cute_Fantasy Outdoor_Decor vegetables (row ~64-80: carrots, cabbages, plants)
          if (cfDecorTex) {
            // Outdoor_Decor has veggies at various positions:
            // Row y=64: crates/boxes, y=80: veggies (carrots, cabbages), y=96: more items
            // Only use FILLED cells from Outdoor_Decor (cols 4-6 past row 4 are empty!)
            const vegOffsets = [
              [0, 80], [16, 80], [32, 80], [48, 80],  // row 5 cols 0-3 (filled)
              [0, 64], [16, 64], [32, 64],             // row 4 cols 0-2 (filled)
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
          if (cfChestTex) {
            // Cute_Fantasy chest (32x32)
            this.tileMapRenderer.addProp(cfChestTex, prop.x, prop.y, 1, 1, 0.1);
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
          } else if (prop.variant === 'seashell') {
            const shCanvas = document.createElement('canvas');
            shCanvas.width = 16; shCanvas.height = 16;
            const shCtx = shCanvas.getContext('2d');
            // Varied shell colors based on position
            const shellColors = ['#FFD4CC', '#FFE0D0', '#FFEEDD', '#E8C8B8', '#F5D5C5'];
            const shellIdx = (prop.x * 7 + prop.y * 13) % shellColors.length;
            const shellType = (prop.x * 3 + prop.y * 5) % 3;
            if (shellType === 0) {
              // Spiral shell
              shCtx.fillStyle = shellColors[shellIdx];
              shCtx.fillRect(6, 6, 5, 4);
              shCtx.fillRect(7, 5, 4, 6);
              shCtx.fillRect(5, 7, 2, 2);
              shCtx.fillStyle = '#D4A090';
              shCtx.fillRect(8, 7, 2, 2); // inner spiral
              shCtx.fillStyle = '#FFF0E8';
              shCtx.fillRect(7, 6, 1, 1); // highlight
            } else if (shellType === 1) {
              // Fan shell
              shCtx.fillStyle = shellColors[shellIdx];
              shCtx.fillRect(5, 7, 6, 4);
              shCtx.fillRect(6, 6, 4, 1);
              shCtx.fillRect(7, 5, 2, 1);
              shCtx.fillStyle = '#D4A090';
              shCtx.fillRect(6, 8, 1, 1); shCtx.fillRect(8, 8, 1, 1); shCtx.fillRect(10, 8, 1, 1);
              shCtx.fillStyle = '#FFF0E8';
              shCtx.fillRect(7, 6, 1, 1);
            } else {
              // Small round shell
              shCtx.fillStyle = shellColors[shellIdx];
              shCtx.fillRect(7, 7, 3, 3);
              shCtx.fillRect(6, 8, 5, 1);
              shCtx.fillStyle = '#FFF0E8';
              shCtx.fillRect(7, 7, 1, 1);
            }
            const shTex = new THREE.CanvasTexture(shCanvas);
            shTex.magFilter = THREE.NearestFilter; shTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(shTex, prop.x, prop.y, 0.6, 0.6, 0.05);
          } else if (prop.variant === 'driftwood') {
            const dwCanvas = document.createElement('canvas');
            dwCanvas.width = 32; dwCanvas.height = 16;
            const dwCtx = dwCanvas.getContext('2d');
            const dwAngle = (prop.x * 5 + prop.y * 3) % 2;
            // Weathered wood colors
            dwCtx.fillStyle = '#A89078';
            if (dwAngle === 0) {
              // Horizontal log
              dwCtx.fillRect(2, 7, 28, 4);
              dwCtx.fillRect(0, 8, 4, 2);
              dwCtx.fillRect(28, 8, 4, 2);
              // Branch stub
              dwCtx.fillRect(18, 5, 3, 3);
              // Wood grain
              dwCtx.fillStyle = '#988068';
              dwCtx.fillRect(6, 8, 8, 1);
              dwCtx.fillRect(18, 9, 6, 1);
              // Highlight
              dwCtx.fillStyle = '#B8A088';
              dwCtx.fillRect(4, 7, 10, 1);
              dwCtx.fillRect(20, 7, 6, 1);
            } else {
              // Angled piece
              dwCtx.fillRect(4, 4, 24, 3);
              dwCtx.fillRect(2, 6, 8, 3);
              dwCtx.fillRect(22, 5, 6, 4);
              dwCtx.fillStyle = '#988068';
              dwCtx.fillRect(8, 5, 10, 1);
              dwCtx.fillStyle = '#B8A088';
              dwCtx.fillRect(6, 4, 8, 1);
            }
            const dwTex = new THREE.CanvasTexture(dwCanvas);
            dwTex.magFilter = THREE.NearestFilter; dwTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(dwTex, prop.x - 0.3, prop.y, 1.8, 0.8, 0.06);
          } else if (prop.variant === 'beach_rock') {
            const brCanvas = document.createElement('canvas');
            brCanvas.width = 16; brCanvas.height = 16;
            const brCtx = brCanvas.getContext('2d');
            if (prop.size === 'large') {
              // Large rounded beach rock
              brCtx.fillStyle = '#8A8A8A';
              brCtx.fillRect(3, 5, 10, 8);
              brCtx.fillRect(4, 4, 8, 10);
              brCtx.fillRect(5, 3, 6, 1);
              // Rock highlight (top)
              brCtx.fillStyle = '#A0A0A0';
              brCtx.fillRect(5, 4, 5, 3);
              // Rock shadow (bottom)
              brCtx.fillStyle = '#6A6A6A';
              brCtx.fillRect(4, 11, 8, 2);
              // Surface detail
              brCtx.fillStyle = '#7A7A7A';
              brCtx.fillRect(6, 7, 2, 1);
              brCtx.fillRect(9, 8, 1, 1);
            } else {
              // Small pebble cluster
              brCtx.fillStyle = '#9A9A8A';
              brCtx.fillRect(5, 8, 3, 3);
              brCtx.fillRect(9, 9, 3, 2);
              brCtx.fillStyle = '#8A8A7A';
              brCtx.fillRect(3, 10, 2, 2);
              // Highlights
              brCtx.fillStyle = '#AAAAAA';
              brCtx.fillRect(5, 8, 1, 1);
              brCtx.fillRect(9, 9, 1, 1);
            }
            const brTex = new THREE.CanvasTexture(brCanvas);
            brTex.magFilter = THREE.NearestFilter; brTex.minFilter = THREE.NearestFilter;
            const brSize = prop.size === 'large' ? 0.9 : 0.6;
            this.tileMapRenderer.addProp(brTex, prop.x, prop.y, brSize, brSize, 0.08);
          } else if (prop.variant === 'starfish') {
            const sfCanvas = document.createElement('canvas');
            sfCanvas.width = 16; sfCanvas.height = 16;
            const sfCtx = sfCanvas.getContext('2d');
            const sfColor = (prop.x + prop.y) % 2 === 0 ? '#FF6B4A' : '#FF8C60';
            // Five-pointed starfish
            sfCtx.fillStyle = sfColor;
            sfCtx.fillRect(7, 3, 2, 4);  // top arm
            sfCtx.fillRect(7, 9, 2, 4);  // bottom arm
            sfCtx.fillRect(3, 7, 4, 2);  // left arm
            sfCtx.fillRect(9, 7, 4, 2);  // right arm
            sfCtx.fillRect(6, 6, 4, 4);  // center
            // Arm tips
            sfCtx.fillRect(4, 4, 2, 2);  // top-left
            sfCtx.fillRect(10, 4, 2, 2); // top-right
            sfCtx.fillRect(4, 10, 2, 2); // bottom-left
            sfCtx.fillRect(10, 10, 2, 2);// bottom-right
            // Center dot
            sfCtx.fillStyle = '#FFB090';
            sfCtx.fillRect(7, 7, 2, 2);
            // Texture dots
            sfCtx.fillStyle = '#E85A3A';
            sfCtx.fillRect(7, 4, 1, 1);
            sfCtx.fillRect(5, 7, 1, 1);
            sfCtx.fillRect(10, 8, 1, 1);
            sfCtx.fillRect(8, 11, 1, 1);
            const sfTex = new THREE.CanvasTexture(sfCanvas);
            sfTex.magFilter = THREE.NearestFilter; sfTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(sfTex, prop.x, prop.y, 0.7, 0.7, 0.05);
          } else if (prop.variant === 'beach_grass') {
            const bgCanvas = document.createElement('canvas');
            bgCanvas.width = 16; bgCanvas.height = 16;
            const bgCtx = bgCanvas.getContext('2d');
            // Tall dune grass blades
            const grassVariant = (prop.x * 3 + prop.y * 7) % 3;
            bgCtx.fillStyle = '#5A9A40';
            // Three blades, slightly spread
            bgCtx.fillRect(4, 3, 1, 10);
            bgCtx.fillRect(7, 1, 1, 12);
            bgCtx.fillRect(10, 4, 1, 9);
            // Tips lean
            bgCtx.fillRect(3, 2, 1, 2);
            bgCtx.fillRect(6, 0, 1, 2);
            bgCtx.fillRect(11, 3, 1, 2);
            // Light highlights
            bgCtx.fillStyle = '#7ABB60';
            bgCtx.fillRect(4, 5, 1, 3);
            bgCtx.fillRect(7, 3, 1, 3);
            bgCtx.fillRect(10, 6, 1, 3);
            if (grassVariant > 0) {
              // Extra blade
              bgCtx.fillStyle = '#4A8A30';
              bgCtx.fillRect(12, 5, 1, 8);
              bgCtx.fillRect(13, 4, 1, 2);
            }
            const bgTex = new THREE.CanvasTexture(bgCanvas);
            bgTex.magFilter = THREE.NearestFilter; bgTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(bgTex, prop.x, prop.y - 0.3, 0.8, 1.0, 0.09);
          } else if (prop.variant === 'tide_foam') {
            const tfCanvas = document.createElement('canvas');
            tfCanvas.width = 32; tfCanvas.height = 16;
            const tfCtx = tfCanvas.getContext('2d');
            // Foam bubbles and water line
            tfCtx.fillStyle = 'rgba(255,255,255,0.6)';
            const foamVar = (prop.x * 5) % 3;
            tfCtx.fillRect(2, 6, 4, 2);
            tfCtx.fillRect(8, 7, 6, 2);
            tfCtx.fillRect(16, 6, 5, 2);
            tfCtx.fillRect(24, 7, 4, 2);
            // Smaller bubbles
            tfCtx.fillStyle = 'rgba(255,255,255,0.4)';
            tfCtx.fillRect(5, 8, 2, 1);
            tfCtx.fillRect(13, 5, 3, 1);
            tfCtx.fillRect(20, 8, 2, 1);
            tfCtx.fillRect(27, 5, 2, 1);
            // Wet sand beneath
            tfCtx.fillStyle = 'rgba(150,120,80,0.2)';
            tfCtx.fillRect(0, 9, 32, 3);
            const tfTex = new THREE.CanvasTexture(tfCanvas);
            tfTex.magFilter = THREE.NearestFilter; tfTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(tfTex, prop.x - 0.3, prop.y, 1.8, 0.7, 0.04);
          } else if (prop.variant === 'sandcastle') {
            const scCanvas = document.createElement('canvas');
            scCanvas.width = 32; scCanvas.height = 32;
            const scCtx = scCanvas.getContext('2d');
            // Base mound
            scCtx.fillStyle = '#E8D098';
            scCtx.fillRect(4, 20, 24, 8);
            scCtx.fillRect(6, 18, 20, 4);
            // Towers
            scCtx.fillStyle = '#DCC088';
            scCtx.fillRect(6, 10, 6, 10);   // left tower
            scCtx.fillRect(20, 10, 6, 10);  // right tower
            scCtx.fillRect(11, 12, 10, 8);  // center tower
            // Tower tops (crenellations)
            scCtx.fillStyle = '#E8D098';
            scCtx.fillRect(6, 8, 2, 2); scCtx.fillRect(10, 8, 2, 2);
            scCtx.fillRect(20, 8, 2, 2); scCtx.fillRect(24, 8, 2, 2);
            scCtx.fillRect(12, 10, 2, 2); scCtx.fillRect(16, 10, 2, 2); scCtx.fillRect(19, 10, 2, 2);
            // Door
            scCtx.fillStyle = '#B0986A';
            scCtx.fillRect(14, 16, 4, 4);
            // Windows
            scCtx.fillRect(7, 12, 2, 2);
            scCtx.fillRect(23, 12, 2, 2);
            // Sand texture
            scCtx.fillStyle = '#C8B078';
            scCtx.fillRect(8, 22, 4, 1);
            scCtx.fillRect(18, 24, 6, 1);
            // Little flag on center
            scCtx.fillStyle = '#FF6060';
            scCtx.fillRect(16, 6, 1, 5);
            scCtx.fillRect(17, 6, 3, 2);
            const scTex = new THREE.CanvasTexture(scCanvas);
            scTex.magFilter = THREE.NearestFilter; scTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(scTex, prop.x - 0.3, prop.y - 0.8, 1.5, 1.5, 0.1);
          } else if (prop.variant === 'beach_umbrella') {
            const buCanvas = document.createElement('canvas');
            buCanvas.width = 32; buCanvas.height = 32;
            const buCtx = buCanvas.getContext('2d');
            // Umbrella colors vary by position
            const uColors = [['#FF4444', '#FFFFFF'], ['#4488FF', '#FFFFFF'], ['#44BB44', '#FFD700']];
            const uIdx = (prop.x * 3 + prop.y * 7) % uColors.length;
            // Pole
            buCtx.fillStyle = '#8B6914';
            buCtx.fillRect(15, 10, 2, 20);
            // Umbrella canopy (curved top)
            buCtx.fillStyle = uColors[uIdx][0];
            buCtx.fillRect(2, 4, 28, 4);
            buCtx.fillRect(4, 2, 24, 3);
            buCtx.fillRect(6, 1, 20, 2);
            // Stripes
            buCtx.fillStyle = uColors[uIdx][1];
            buCtx.fillRect(8, 2, 4, 5);
            buCtx.fillRect(18, 2, 4, 5);
            // Shadow rim
            buCtx.fillStyle = 'rgba(0,0,0,0.15)';
            buCtx.fillRect(2, 7, 28, 1);
            // Beach towel underneath
            buCtx.fillStyle = '#FFE0A0';
            buCtx.fillRect(6, 26, 20, 4);
            buCtx.fillStyle = '#FF9060';
            buCtx.fillRect(6, 28, 20, 2);
            const buTex = new THREE.CanvasTexture(buCanvas);
            buTex.magFilter = THREE.NearestFilter; buTex.minFilter = THREE.NearestFilter;
            this.tileMapRenderer.addProp(buTex, prop.x - 0.5, prop.y - 1, 2, 2, 0.1);
          }
          break;
        case 'signpost': {
          // Canvas-drawn signpost with directional arrow + label (high-res for readability)
          const spCanvas = document.createElement('canvas');
          spCanvas.width = 128;
          spCanvas.height = 96;
          const spCtx = spCanvas.getContext('2d');

          // Post
          spCtx.fillStyle = '#8B5E3C';
          spCtx.fillRect(56, 56, 16, 40);
          // Post highlight
          spCtx.fillStyle = '#A07040';
          spCtx.fillRect(60, 56, 4, 38);

          // Sign board background with wood grain
          spCtx.fillStyle = '#C8924A';
          spCtx.fillRect(8, 8, 112, 50);
          // Wood grain lines
          spCtx.fillStyle = '#B8823A';
          for (let gy = 14; gy < 52; gy += 8) {
            spCtx.fillRect(10, gy, 108, 1);
          }
          // Board outline
          spCtx.strokeStyle = '#5a3010';
          spCtx.lineWidth = 3;
          spCtx.strokeRect(8, 8, 112, 50);
          // Board nails
          spCtx.fillStyle = '#888';
          spCtx.fillRect(14, 14, 4, 4);
          spCtx.fillRect(110, 14, 4, 4);

          // Arrow indicator based on direction
          spCtx.fillStyle = '#3a1a00';
          spCtx.font = 'bold 24px sans-serif';
          spCtx.textAlign = 'center';
          spCtx.textBaseline = 'top';
          const arrowMap = { north: '\u2191', south: '\u2193', east: '\u2192', west: '\u2190' };
          const arrow = arrowMap[prop.dir] || '\u2192';
          spCtx.fillText(arrow, 64, 10);

          // Label text (crisp, large)
          spCtx.fillStyle = '#2a0e00';
          spCtx.font = 'bold 18px sans-serif';
          spCtx.fillText(prop.label || '', 64, 36);

          const spTex = new THREE.CanvasTexture(spCanvas);
          spTex.magFilter = THREE.LinearFilter;
          spTex.minFilter = THREE.LinearFilter;
          this.tileMapRenderer.addProp(spTex, prop.x - 0.5, prop.y - 1, 2, 1.5, 0.1);
          break;
        }
        case 'coral_deco': {
          // Canvas-drawn coral formation — colorful branching coral
          const cdCanvas = document.createElement('canvas');
          cdCanvas.width = 32; cdCanvas.height = 32;
          const cdCtx = cdCanvas.getContext('2d');
          // Pick coral color based on position for variety
          const coralVariant = (prop.x * 7 + prop.y * 13) % 4;
          const coralColors = [
            { base: '#E05080', mid: '#FF6090', tip: '#FFA0C0' }, // pink coral
            { base: '#D06030', mid: '#F08050', tip: '#FFB090' }, // orange coral
            { base: '#8050C0', mid: '#A070E0', tip: '#C0A0FF' }, // purple coral
            { base: '#3090A0', mid: '#40B0C0', tip: '#80D0E0' }, // teal coral
          ];
          const cc = coralColors[coralVariant];
          // Main trunk
          cdCtx.fillStyle = cc.base;
          cdCtx.fillRect(14, 12, 4, 18);
          // Left branch
          cdCtx.fillStyle = cc.mid;
          cdCtx.fillRect(8, 8, 3, 14);
          cdCtx.fillRect(6, 6, 3, 4);
          // Right branch
          cdCtx.fillRect(20, 6, 3, 16);
          cdCtx.fillRect(22, 4, 3, 4);
          // Tips (lighter)
          cdCtx.fillStyle = cc.tip;
          cdCtx.fillRect(14, 10, 4, 3);
          cdCtx.fillRect(8, 6, 3, 3);
          cdCtx.fillRect(20, 4, 3, 3);
          cdCtx.fillRect(6, 5, 2, 2);
          cdCtx.fillRect(23, 3, 2, 2);
          // Small bubble decoration
          cdCtx.fillStyle = 'rgba(150,220,255,0.4)';
          cdCtx.fillRect(4, 3, 2, 2);
          cdCtx.fillRect(26, 8, 2, 2);
          const cdTex = new THREE.CanvasTexture(cdCanvas);
          cdTex.magFilter = THREE.NearestFilter; cdTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(cdTex, prop.x - 0.5, prop.y - 1, 1.5, 1.5, 0.1);
          break;
        }
        case 'glow_plant': {
          // Canvas-drawn glowing kelp/algae — bioluminescent underwater plant
          const gpCanvas = document.createElement('canvas');
          gpCanvas.width = 16; gpCanvas.height = 32;
          const gpCtx = gpCanvas.getContext('2d');
          // Kelp stalk
          gpCtx.fillStyle = '#207050';
          gpCtx.fillRect(7, 6, 2, 24);
          // Leaves/fronds alternating sides
          gpCtx.fillStyle = '#309060';
          gpCtx.fillRect(4, 10, 4, 2);
          gpCtx.fillRect(9, 15, 4, 2);
          gpCtx.fillRect(3, 20, 5, 2);
          gpCtx.fillRect(10, 25, 4, 2);
          // Bioluminescent glow tips
          gpCtx.fillStyle = '#60FFB0';
          gpCtx.fillRect(4, 9, 2, 1);
          gpCtx.fillRect(11, 14, 2, 1);
          gpCtx.fillRect(3, 19, 2, 1);
          gpCtx.fillRect(12, 24, 2, 1);
          // Glow at top
          gpCtx.fillStyle = '#80FFCC';
          gpCtx.fillRect(6, 4, 4, 3);
          gpCtx.fillStyle = '#A0FFE0';
          gpCtx.fillRect(7, 3, 2, 2);
          // Aura glow effect
          gpCtx.fillStyle = 'rgba(80,255,180,0.15)';
          gpCtx.fillRect(2, 2, 12, 6);
          gpCtx.fillRect(1, 8, 14, 4);
          const gpTex = new THREE.CanvasTexture(gpCanvas);
          gpTex.magFilter = THREE.NearestFilter; gpTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(gpTex, prop.x, prop.y - 1.2, 0.8, 1.6, 0.1);
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
          this.tileMapRenderer.addProp(crTex, prop.x, prop.y - 0.5, 1, 1.2, 0.1);
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
          this.tileMapRenderer.addProp(toTex, prop.x, prop.y - 0.3, 0.8, 1.0, 0.1);
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
          this.tileMapRenderer.addProp(cpTex, prop.x, prop.y - 1.5, 1, 2.5, 0.1);
          break;
        }
        case 'cloud_puff': {
          // Canvas-drawn fluffy cloud puff at platform edges
          const cpfCanvas = document.createElement('canvas');
          cpfCanvas.width = 32; cpfCanvas.height = 16;
          const cpfCtx = cpfCanvas.getContext('2d');
          // Main cloud body
          cpfCtx.fillStyle = 'rgba(210, 220, 245, 0.7)';
          cpfCtx.beginPath();
          cpfCtx.arc(10, 10, 6, 0, Math.PI * 2);
          cpfCtx.arc(20, 8, 7, 0, Math.PI * 2);
          cpfCtx.arc(15, 6, 5, 0, Math.PI * 2);
          cpfCtx.fill();
          // Lighter highlight puffs
          cpfCtx.fillStyle = 'rgba(230, 240, 255, 0.6)';
          cpfCtx.beginPath();
          cpfCtx.arc(14, 5, 4, 0, Math.PI * 2);
          cpfCtx.arc(22, 6, 3, 0, Math.PI * 2);
          cpfCtx.fill();
          const cpfTex = new THREE.CanvasTexture(cpfCanvas);
          cpfTex.magFilter = THREE.NearestFilter; cpfTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(cpfTex, prop.x - 0.5, prop.y - 0.25, 2, 1, 0.08);
          break;
        }
        case 'sparkle_deco': {
          // Canvas-drawn sparkle/star decoration
          const skCanvas = document.createElement('canvas');
          skCanvas.width = 16; skCanvas.height = 16;
          const skCtx = skCanvas.getContext('2d');
          // 4-pointed star sparkle
          skCtx.fillStyle = '#FFFFFF';
          skCtx.fillRect(7, 2, 2, 12);  // vertical line
          skCtx.fillRect(2, 7, 12, 2);  // horizontal line
          // Diagonal accent
          skCtx.fillStyle = 'rgba(255, 255, 200, 0.8)';
          skCtx.fillRect(4, 4, 2, 2);
          skCtx.fillRect(10, 4, 2, 2);
          skCtx.fillRect(4, 10, 2, 2);
          skCtx.fillRect(10, 10, 2, 2);
          // Bright center
          skCtx.fillStyle = '#FFFFEE';
          skCtx.fillRect(7, 7, 2, 2);
          const skTex = new THREE.CanvasTexture(skCanvas);
          skTex.magFilter = THREE.NearestFilter; skTex.minFilter = THREE.NearestFilter;
          this.tileMapRenderer.addProp(skTex, prop.x + 0.25, prop.y + 0.25, 0.5, 0.5, 0.1);
          break;
        }
        case 'rainbow_arc': {
          // Canvas-drawn rainbow arc decoration
          const isLarge = prop.size === 'large';
          const raW = isLarge ? 64 : 48;
          const raH = isLarge ? 40 : 32;
          const raCanvas = document.createElement('canvas');
          raCanvas.width = raW; raCanvas.height = raH;
          const raCtx = raCanvas.getContext('2d');
          const colors = ['#FF4040', '#FF8800', '#FFD700', '#40CC40', '#4488FF', '#8844DD'];
          const cx = raW / 2;
          const baseR = isLarge ? 28 : 20;
          for (let i = 0; i < colors.length; i++) {
            raCtx.strokeStyle = colors[i];
            raCtx.lineWidth = 2;
            raCtx.beginPath();
            raCtx.arc(cx, raH, baseR - i * 3, Math.PI, 0);
            raCtx.stroke();
          }
          const raTex = new THREE.CanvasTexture(raCanvas);
          raTex.magFilter = THREE.NearestFilter; raTex.minFilter = THREE.NearestFilter;
          const raPropW = isLarge ? 4 : 3;
          const raPropH = isLarge ? 2.5 : 2;
          this.tileMapRenderer.addProp(raTex, prop.x - raPropW / 2, prop.y - raPropH, raPropW, raPropH, 0.09);
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

  _placeStation(prop) {
    const info = {
      cooking: { label: 'Kueche' },
      workbench: { label: 'Werkbank' },
      anvil: { label: 'Amboss' },
      sawmill: { label: 'Saege' },
      alchemy: { label: 'Alchemie' },
    }[prop.station] || { label: prop.station };

    // Canvas-drawn station sprites in Cute_Fantasy pixel art style
    const stationCanvas = this._createStationCanvas(prop.station);
    const stationTex = new THREE.CanvasTexture(stationCanvas);
    stationTex.magFilter = THREE.NearestFilter;
    stationTex.minFilter = THREE.NearestFilter;

    // Display sizes per station type (in tile units)
    const sizes = {
      cooking:   { w: 3, h: 3 },
      workbench: { w: 4, h: 2 },
      anvil:     { w: 2, h: 2 },
      sawmill:   { w: 4, h: 4 },
      alchemy:   { w: 3, h: 2 },
    };
    const sz = sizes[prop.station] || { w: 2, h: 2 };
    this.tileMapRenderer.addProp(
      stationTex, prop.x, prop.y - (sz.h - (prop.h || 1)) * 0.5, sz.w, sz.h, 0.12
    );

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

  /**
   * Create canvas-drawn station sprites in Cute_Fantasy pixel art style.
   * Uses 16px grid, matching color palette, 1px black outlines.
   */
  _createStationCanvas(stationType) {
    switch (stationType) {
      case 'cooking': {
        // Cooking Station (48x48): Stone base with fire pit and pot
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        const ctx = c.getContext('2d');
        // Stone base
        ctx.fillStyle = '#888888';
        ctx.fillRect(8, 32, 32, 12);
        ctx.fillStyle = '#777777';
        ctx.fillRect(10, 34, 28, 8);
        // Black outline
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.strokeRect(8, 32, 32, 12);
        // Fire pit opening
        ctx.fillStyle = '#444444';
        ctx.fillRect(14, 34, 20, 6);
        // Flames
        ctx.fillStyle = '#CC3300';
        ctx.fillRect(16, 28, 16, 6);
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(18, 26, 12, 6);
        ctx.fillStyle = '#FFCC00';
        ctx.fillRect(20, 24, 8, 6);
        ctx.fillStyle = '#FFEE88';
        ctx.fillRect(22, 22, 4, 4);
        // Pot stand (metal rods)
        ctx.fillStyle = '#555555';
        ctx.fillRect(12, 16, 2, 18);
        ctx.fillRect(34, 16, 2, 18);
        ctx.fillRect(12, 16, 24, 2);
        // Pot
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(16, 18, 16, 10);
        ctx.fillStyle = '#3A3A3A';
        ctx.fillRect(14, 18, 20, 2);
        // Pot highlight
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(18, 20, 4, 4);
        // Steam wisps
        ctx.fillStyle = 'rgba(200,200,200,0.4)';
        ctx.fillRect(20, 12, 2, 4);
        ctx.fillRect(24, 10, 2, 5);
        ctx.fillRect(28, 13, 2, 3);
        return c;
      }
      case 'workbench': {
        // Workbench (64x32): Wooden table with tools
        const c = document.createElement('canvas');
        c.width = 64; c.height = 32;
        const ctx = c.getContext('2d');
        // Table top
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(4, 8, 56, 8);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.strokeRect(4, 8, 56, 8);
        // Wood grain
        ctx.fillStyle = '#7A5A10';
        ctx.fillRect(8, 10, 20, 1);
        ctx.fillRect(36, 12, 16, 1);
        // Table highlight
        ctx.fillStyle = '#9A7A20';
        ctx.fillRect(6, 8, 52, 2);
        // Legs
        ctx.fillStyle = '#6B4E10';
        ctx.fillRect(6, 16, 4, 14);
        ctx.fillRect(54, 16, 4, 14);
        ctx.fillRect(28, 16, 4, 12);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(6, 16, 4, 14);
        ctx.strokeRect(54, 16, 4, 14);
        // Tools on table
        // Hammer
        ctx.fillStyle = '#666666';
        ctx.fillRect(12, 4, 8, 4);
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(15, 6, 2, 8);
        // Saw blade
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(40, 2, 12, 6);
        ctx.fillStyle = '#888888';
        ctx.fillRect(40, 3, 1, 1); ctx.fillRect(44, 3, 1, 1);
        ctx.fillRect(48, 3, 1, 1); ctx.fillRect(51, 3, 1, 1);
        // Saw handle
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(38, 4, 4, 4);
        return c;
      }
      case 'anvil': {
        // Anvil (32x32): Dark gray anvil on wooden stump
        const c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        const ctx = c.getContext('2d');
        // Wooden stump base
        ctx.fillStyle = '#6B4E1A';
        ctx.fillRect(6, 20, 20, 10);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.strokeRect(6, 20, 20, 10);
        // Stump rings
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(8, 22, 16, 1);
        ctx.fillRect(8, 26, 16, 1);
        // Anvil body
        ctx.fillStyle = '#555566';
        ctx.fillRect(8, 12, 16, 10);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(8, 12, 16, 10);
        // Anvil top (wider horn)
        ctx.fillStyle = '#666677';
        ctx.fillRect(4, 10, 24, 4);
        ctx.strokeRect(4, 10, 24, 4);
        // Anvil horn (left point)
        ctx.fillStyle = '#555566';
        ctx.fillRect(0, 10, 6, 3);
        ctx.strokeRect(0, 10, 6, 3);
        // Anvil highlight
        ctx.fillStyle = '#777788';
        ctx.fillRect(6, 10, 18, 1);
        // Anvil shadow
        ctx.fillStyle = '#444455';
        ctx.fillRect(10, 18, 12, 2);
        return c;
      }
      case 'sawmill': {
        // Sawmill (64x64): Wooden frame with log and saw blade
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d');
        // Wooden base/frame
        ctx.fillStyle = '#7A5A18';
        ctx.fillRect(4, 40, 56, 20);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.strokeRect(4, 40, 56, 20);
        // Frame legs
        ctx.fillStyle = '#6B4E10';
        ctx.fillRect(6, 56, 6, 8);
        ctx.fillRect(52, 56, 6, 8);
        // Support beams (A-frame)
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(8, 8, 6, 34);
        ctx.fillRect(50, 8, 6, 34);
        ctx.strokeRect(8, 8, 6, 34);
        ctx.strokeRect(50, 8, 6, 34);
        // Top beam
        ctx.fillStyle = '#7A5A18';
        ctx.fillRect(8, 8, 48, 6);
        ctx.strokeRect(8, 8, 48, 6);
        // Log on table
        ctx.fillStyle = '#6B4E1A';
        ctx.fillRect(16, 36, 32, 8);
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(16, 38, 32, 1);
        ctx.fillRect(16, 42, 32, 1);
        // Log end circles
        ctx.fillStyle = '#8B7030';
        ctx.fillRect(14, 36, 4, 8);
        ctx.fillStyle = '#9A8040';
        ctx.fillRect(15, 38, 2, 4);
        // Saw blade (circular)
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(26, 18, 12, 16);
        ctx.fillRect(24, 20, 16, 12);
        ctx.fillRect(22, 22, 20, 8);
        // Blade center
        ctx.fillStyle = '#888888';
        ctx.fillRect(28, 22, 8, 8);
        ctx.fillStyle = '#999999';
        ctx.fillRect(30, 24, 4, 4);
        // Blade teeth suggestion
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(22, 25, 2, 2);
        ctx.fillRect(40, 25, 2, 2);
        ctx.fillRect(30, 18, 2, 2);
        ctx.fillRect(30, 32, 2, 2);
        // Sawdust on ground
        ctx.fillStyle = '#C8A860';
        ctx.fillRect(20, 48, 2, 2);
        ctx.fillRect(28, 50, 3, 2);
        ctx.fillRect(38, 48, 2, 2);
        return c;
      }
      case 'alchemy': {
        // Alchemy Table (48x32): Wooden table with potion bottles
        const c = document.createElement('canvas');
        c.width = 48; c.height = 32;
        const ctx = c.getContext('2d');
        // Table top
        ctx.fillStyle = '#6B4E1A';
        ctx.fillRect(4, 12, 40, 6);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.strokeRect(4, 12, 40, 6);
        // Table highlight
        ctx.fillStyle = '#7A5A20';
        ctx.fillRect(6, 12, 36, 2);
        // Table legs
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(6, 18, 4, 12);
        ctx.fillRect(38, 18, 4, 12);
        ctx.strokeRect(6, 18, 4, 12);
        ctx.strokeRect(38, 18, 4, 12);
        // Blue potion bottle
        ctx.fillStyle = '#4488CC';
        ctx.fillRect(10, 4, 6, 8);
        ctx.fillStyle = '#66AAEE';
        ctx.fillRect(11, 5, 4, 5);
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(11, 2, 4, 3); // cork
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(10, 2, 6, 10);
        // Green potion bottle
        ctx.fillStyle = '#44AA44';
        ctx.fillRect(20, 4, 6, 8);
        ctx.fillStyle = '#66CC66';
        ctx.fillRect(21, 5, 4, 5);
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(21, 2, 4, 3);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(20, 2, 6, 10);
        // Purple potion bottle (round)
        ctx.fillStyle = '#8844AA';
        ctx.fillRect(30, 4, 8, 8);
        ctx.fillStyle = '#AA66CC';
        ctx.fillRect(32, 5, 4, 5);
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(32, 2, 4, 3);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(30, 2, 8, 10);
        // Small bubbles near bottles
        ctx.fillStyle = 'rgba(100,200,100,0.4)';
        ctx.fillRect(22, 0, 2, 2);
        ctx.fillStyle = 'rgba(100,100,200,0.4)';
        ctx.fillRect(12, 0, 2, 2);
        return c;
      }
      default: {
        // Generic station fallback
        const c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(4, 8, 24, 20);
        ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
        ctx.strokeRect(4, 8, 24, 20);
        return c;
      }
    }
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
      if (spawn.respawnTime != null) mob.respawnTime = spawn.respawnTime;
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

    // Death screen freeze — skip all gameplay, still render
    if (this.gameOverScreen && this.gameOverScreen.active) {
      this.hud.update(this.player, dt);
      if (this.postProcessing) this.postProcessing.render();
      else this.renderer.render(this.scene, this.camera.three);
      this.input.endFrame();
      return;
    }

    // I key — toggle inventory panel
    if (this.input.justPressed('KeyI')) {
      this.hud.toggleInventory(this.inventory);
    }

    // H key — toggle help overlay (BEFORE uiBlocking so it works from any state)
    if (this.input.justPressed('KeyH') && this.helpOverlay) {
      const activeQuest = this.progression.getActiveQuest();
      this.helpOverlay.toggle(activeQuest, this.sceneManager.currentScene);
    }

    // Skip gameplay updates if dialog, crafting, trading, fishing, explorer book UI, inventory, or help is open
    const uiBlocking = this.dialog.isActive || this.crafting.isActive || (this.tradeUI && this.tradeUI.isOpen) || this.fishing.isActive || this.explorerBookUI.isOpen || this.hud.isInventoryOpen() || (this.helpOverlay && this.helpOverlay.isOpen);

    // Dialog system — subtle zoom during conversations
    const wasDialogActive = this.dialog.isActive;
    this.dialog.update(dt, this.player, this.npcs, this.input);
    if (this.dialog.isActive && !wasDialogActive) {
      this.camera.zoomTo(1.1, 2.0); // gentle zoom in on dialog start
    } else if (!this.dialog.isActive && wasDialogActive && !this._activeBoss) {
      this.camera.zoomTo(1.0, 2.0); // zoom back out when dialog ends
    }

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

    // Update cloud castle player shadow position
    if (this._cloudPlayerShadow) {
      this._cloudPlayerShadow.position.set(
        this.player.x + 0.5,
        -(this.player.y + 0.85),
        0.05
      );
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
    for (const hit of hits) {
      const mob = hit.mob;
      const dmg = hit.damage;
      if (this.vfx) this.vfx.hitSparks(mob.x, mob.y);
      if (this.damageNumbers) this.damageNumbers.spawn(mob.x, mob.y, dmg, false);
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

    // Boss combat (use !defeated instead of alive so death animation can finish)
    if (this._activeBoss && !this._activeBoss.defeated && !uiBlocking) {
      updateKnockback(this._activeBoss, dt);
      this._activeBoss.update(dt, this.player, this.tileMap);
      this.bossHealthBar.update(this._activeBoss.hp, this._activeBoss.maxHp);

      // Only check combat while boss is alive (not during death anim)
      if (this._activeBoss.alive) {
        const bossAsMob = this._activeBoss;
        const bossHits = this.combat.update(dt, this.player, [bossAsMob]);
        if (bossHits.length > 0) {
          if (this.vfx) this.vfx.hitSparks(this._activeBoss.x, this._activeBoss.y);
          if (this.damageNumbers) this.damageNumbers.spawn(this._activeBoss.x, this._activeBoss.y, bossHits[0].damage, false);
          this.juice.shakeMedium();
          this.juice.hitstop(0.05);
          applyKnockback(this._activeBoss, this.player, 1.0, 0.1);
        }
      }

      // Boss defeated (after death animation completes)
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
        // Reset camera zoom after boss defeat
        this.camera.zoomTo(1.0, 1.0);

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
                          if (this.tutorialTooltips) this.tutorialTooltips.loadState([]);
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
    if (this.ambientLife) this.ambientLife.update(dt, this.camera.three);

    // Quest waypoint arrow update
    if (this.questWaypoint) {
      const activeQuest = this.progression.getActiveQuest();
      this.questWaypoint.update(
        activeQuest,
        this.player.x, this.player.y,
        this.sceneManager.currentScene,
        this.camera
      );
    }

    // Tutorial tooltips
    if (this.tutorialTooltips) {
      this.tutorialTooltips.update(dt, {
        player: this.player, npcs: this.npcs, mobs: this.mobs,
        tileMap: this.tileMap, inventory: this.inventory, input: this.input,
        dialog: this.dialog, crafting: this.crafting, fishing: this.fishing,
        combat: this.combat, itemDrops: this.itemDrops, hud: this.hud,
        isNewGame: this._isNewGame,
      });
    }

    // Minimap update
    if (this.minimap) {
      this.minimap.update(dt, this.player.x, this.player.y, this.npcs);
    }

    // Dynamic lighting update
    if (this.lighting) this.lighting.update(dt);

    // Water shader update
    if (this.waterRenderer) this.waterRenderer.update(dt);

    // Emotion bubbles
    if (this.emotionBubbles) {
      this.emotionBubbles.updateNPCs(dt, this.npcs, this.player, this.progression);
      this.emotionBubbles.update(dt);
    }

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

    // Plant healing (F key) — gets priority over fishing
    this.plantHealing.update(dt, this.player, this.input, this.hud);

    // Fishing (F key) — only consumes F if no plant was healed
    this.fishing.update(dt, this.player, this.input, this.dayNight, this.inventory, this.progression, this.hud);

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
        // Visual feedback for each picked-up item
        for (const drop of picked) {
          // Sparkle burst at pickup location
          if (this.vfx) this.vfx.pickupGlow(drop.x, drop.y);
          if (this.ambientLife?._particles) {
            this.ambientLife._particles.burst(drop.x, drop.y, 8, {
              type: 'sparkle', color: [1, 1, 0.7], life: 1.0, size: 0.8,
            });
          }
          // Floating "+N Name" text popup
          if (this.pickupPopup) {
            this.pickupPopup.show(drop.itemId, drop.count, this.camera.three, drop.x, drop.y);
          }
          // Explorer book discovery
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

    // Floating damage numbers
    if (this.damageNumbers) this.damageNumbers.update(dt);

    // Map edge vignette
    this.mapVignette.update(this.camera.three, this.tileMap.width, this.tileMap.height);

    // Animated sprites
    for (const s of this._animatedSprites) s.update(dt);

    // Check exits — only when no UI is blocking
    if (!uiBlocking) {
      this.sceneManager.checkExits(this.player, this.tileMap);
    }

    // HUD (pass dt for smooth bar animation)
    this.hud.update(this.player, dt);
    this.hud._updateXpBar(dt);

    // Auto-save
    this.saveManager.update(dt, () => ({
      playerHp: this.player.hp,
      currentScene: this.sceneManager.currentScene,
      playerX: this.player.x,
      playerY: this.player.y,
      inventorySlots: this.inventory.slots,
      coins: this.inventory.coins,
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
      seenTooltips: this.tutorialTooltips?.getState() || [],
      friendship: this.friendship?.getState() || {},
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

  _useItemFromSlot(slotIdx) {
    if (!this.player || this.player.state === 'dead') return;
    const slot = this.inventory.slots[slotIdx];
    if (!slot || !slot.itemId) return;
    const item = getItem(slot.itemId);
    if (!item) return;

    if (item.healAmount) {
      if (this.player.hp >= this.player.maxHp) {
        this.hud.showInfo('HP bereits voll!');
        return;
      }
      const healed = Math.min(item.healAmount, this.player.maxHp - this.player.hp);
      this.player.heal(item.healAmount);
      this.inventory.removeItem(item.id, 1);
      this.hud.updateHotbar(this.inventory);
      this.hud.updateInventory(this.inventory);
      this.hud.showInfo(`${item.name} benutzt! +${healed} HP`);
      if (this.juice) this.juice.healFlash();
      this.audio.playEat();
      this.audio.playHeal();
      return;
    }

    if (item.category === 'weapon') {
      this.hud.showInfo(`${item.name} — Waffe! Ziehe sie in die Hotbar (Klick).`);
      this.audio.playUIClick();
      return;
    }

    this.hud.showInfo(`${item.name} kann nicht direkt benutzt werden.`);
  }

  _useSelectedItem() {
    if (!this.player || this.player.state === 'dead') return;
    const item = this.inventory.getSelectedItem();
    if (!item) return;

    // Consumable items (food, potions) — heal the player
    if (item.healAmount) {
      if (this.player.hp >= this.player.maxHp) {
        this.hud.showInfo('HP bereits voll!');
        return;
      }
      const healed = Math.min(item.healAmount, this.player.maxHp - this.player.hp);
      this.player.heal(item.healAmount);
      this.inventory.removeItem(item.id, 1);
      this.hud.updateHotbar(this.inventory);
      this.hud.showInfo(`${item.name} benutzt! +${healed} HP`);
      if (this.juice) this.juice.healFlash();
      this.audio.playEat();
      this.audio.playHeal();
      return;
    }

    // Weapon items — show equip feedback (weapon is active by being in selected slot)
    if (item.category === 'weapon') {
      this.hud.showInfo(`${item.name} ausgeruestet! (${item.damage} Schaden)`);
      this.audio.playUIClick();
      return;
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
    if (beds && this.tileMapRenderer && this._decorTexture) {
      const vegOffsets = [
        [0, 80], [16, 80], [32, 80], [48, 80],
        [0, 64], [16, 64], [32, 64],
      ];
      for (const bed of beds) {
        const [cx, cy] = vegOffsets[(bed.t || 0) % vegOffsets.length];
        this.tileMapRenderer.addPropFromSheet(
          this._decorTexture, cx, cy, 16, 16,
          bed.x, bed.y, 1, 1
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
    if (this.pickupPopup) this.pickupPopup.dispose();
    if (this.explorerBookUI) this.explorerBookUI.dispose();
    if (this.gameOverScreen) this.gameOverScreen.dispose();
    if (this.pet) this.pet.dispose();
    this.sceneManager.dispose();
    this.renderer.dispose();
  }
}
