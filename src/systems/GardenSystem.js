import * as THREE from 'three';

/**
 * Samen-Daten: Wachstumszeit, Ernte-Tabelle, Samen-Rueckgabe-Chance.
 */
const SEED_DATA = {
  seed_carrot:  { growTime: 180, harvest: 'vegetable', min: 2, max: 3, seedBack: 0.3 },
  seed_tomato:  { growTime: 180, harvest: 'vegetable', min: 2, max: 3, seedBack: 0.3 },
  seed_pumpkin: { growTime: 300, harvest: 'vegetable', min: 1, max: 2, bonusItem: 'berry', bonusCount: 1, seedBack: 0.2 },
  seed_crystal: { growTime: 600, harvest: 'crystal',   min: 1, max: 1, seedBack: 0.1 },
};

/** All known seed item IDs for quick lookup. */
const SEED_IDS = Object.keys(SEED_DATA);

/**
 * Interaktives Garten-System fuer Omas Garten im Hub.
 *
 * Spieler kann auf leere Beete Samen pflanzen (E), giessen (F) und
 * reife Pflanzen ernten (E). Drei Wachstumsphasen mit visueller
 * Rueckmeldung ueber Canvas-Texturen.
 */
export class GardenSystem {
  constructor(scene) {
    /** @type {THREE.Scene} */
    this._scene = scene;

    /** @type {Array<Object>} Garden plot data objects */
    this._plots = [];

    /** @type {Array<THREE.Mesh>} Prompt meshes for interaction hints */
    this._promptMeshes = [];

    /** Interaction range in tiles */
    this._range = 2.0;
  }

  // ─────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────

  /**
   * Erstelle interaktive Garten-Plots aus Map-Props.
   * @param {Array} props  Map prop array (from hub.js)
   * @param {THREE.Scene} scene  Three.js scene (unused, kept for API compat)
   */
  initPlots(props, scene) {
    const gardenProps = props.filter(
      p => p.type === 'crop' || p.type === 'garden_plot'
    );

    for (const prop of gardenProps) {
      const plot = {
        x: prop.x,
        y: prop.y,
        seed: null,
        phase: 0,    // 0=leer, 1=Saat, 2=Spross, 3=erntereif
        timer: 0,
        watered: false,
        mesh: null,
        promptMesh: null,
        _canvas: null,
        _ctx: null,
        _tex: null,
      };

      // Visual mesh (1x1 tile plane with canvas texture)
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      plot._canvas = canvas;
      plot._ctx = canvas.getContext('2d');

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      plot._tex = tex;

      const geo = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
      });
      plot.mesh = new THREE.Mesh(geo, mat);
      // Position: tile center, slightly above ground decorations
      plot.mesh.position.set(
        plot.x + 0.5,
        -(plot.y + 0.5),
        0.12 + plot.y * 0.001
      );
      this._scene.add(plot.mesh);

      // Prompt mesh for interaction hint
      plot.promptMesh = this._createPromptMesh(plot.x, plot.y, '[E] Pflanzen');
      plot.promptMesh.visible = false;
      this._scene.add(plot.promptMesh);
      this._promptMeshes.push(plot.promptMesh);

      this._plots.push(plot);

      // Draw initial empty-bed visual
      this._updateVisual(plot);
    }
  }

  // ─────────────────────────────────────────────
  // Main update loop
  // ─────────────────────────────────────────────

  /**
   * @param {number} dt  Delta time in seconds
   * @param {Object} player  Player entity {x, y}
   * @param {Object} input   InputManager
   * @param {Object} inventory  Inventory instance
   * @param {Object} itemDrops  ItemDropManager (for harvest drops)
   */
  update(dt, player, input, inventory, itemDrops) {
    for (const plot of this._plots) {
      const dx = player.x - (plot.x + 0.5);
      const dy = player.y - (plot.y + 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inRange = dist < this._range;

      // ── Growth timer ──
      if (plot.seed && plot.phase > 0 && plot.phase < 3) {
        const speed = plot.watered ? 2 : 1;
        plot.timer -= dt * speed;

        const seedDef = SEED_DATA[plot.seed];
        if (seedDef) {
          const growTime = seedDef.growTime;
          const elapsed = growTime - plot.timer;
          const progress = elapsed / growTime;

          const oldPhase = plot.phase;
          if (progress >= 0.66 && plot.phase < 3) {
            plot.phase = 3;
          } else if (progress >= 0.33 && plot.phase < 2) {
            plot.phase = 2;
          }

          // Phase changed — reset watered flag and update visual
          if (plot.phase !== oldPhase) {
            plot.watered = false;
            this._updateVisual(plot);
            this._updatePromptText(plot);
          }
        }

        // Clamp timer
        if (plot.timer <= 0) {
          plot.timer = 0;
          plot.phase = 3;
          this._updateVisual(plot);
          this._updatePromptText(plot);
        }
      }

      // ── Prompt visibility and interaction ──
      if (!inRange) {
        plot.promptMesh.visible = false;
        continue;
      }

      // Show appropriate prompt
      plot.promptMesh.visible = true;
      this._updatePromptText(plot);

      // ── E key: Plant or Harvest ──
      if (plot.phase === 3 && input.justPressed('KeyE')) {
        // Harvest
        this._harvest(plot, inventory, itemDrops);
        continue;
      }

      if (plot.phase === 0 && input.justPressed('KeyE')) {
        // Plant — find first seed in inventory
        const seedId = this._findSeedInInventory(inventory);
        if (seedId) {
          this._plant(plot, seedId, inventory);
        }
        continue;
      }

      // ── F key: Water ──
      if (plot.seed && plot.phase > 0 && plot.phase < 3 && !plot.watered) {
        if (input.justPressed('KeyF')) {
          plot.watered = true;
          this._updateVisual(plot);
          this._updatePromptText(plot);

          // Audio feedback
          const audio = window.__game?.audio;
          if (audio && audio.playHeal) audio.playHeal();
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────

  /**
   * Pflanze einen Samen auf ein leeres Beet.
   */
  _plant(plot, seedId, inventory) {
    const seedDef = SEED_DATA[seedId];
    if (!seedDef) return;

    inventory.removeItem(seedId, 1);

    plot.seed = seedId;
    plot.phase = 1;
    plot.timer = seedDef.growTime;
    plot.watered = false;

    this._updateVisual(plot);
    this._updatePromptText(plot);

    // Audio
    const audio = window.__game?.audio;
    if (audio && audio.playChop) audio.playChop();

    // HUD feedback
    const hud = window.__game?.hud;
    if (hud) {
      const names = {
        seed_carrot: 'Karotte',
        seed_tomato: 'Tomate',
        seed_pumpkin: 'Kuerbis',
        seed_crystal: 'Kristall',
      };
      hud.showInfo(`${names[seedId] || seedId} gepflanzt!`);
      hud.updateHotbar(inventory);
    }

    // XP
    const prog = window.__game?.progression;
    if (prog) prog.addXp(5);
  }

  /**
   * Ernte eine reife Pflanze.
   */
  _harvest(plot, inventory, itemDrops) {
    const seedDef = SEED_DATA[plot.seed];
    if (!seedDef) return;

    const seedId = plot.seed;
    const count = seedDef.min + Math.floor(Math.random() * (seedDef.max - seedDef.min + 1));

    // Main harvest
    if (itemDrops) {
      itemDrops.spawnDrop(seedDef.harvest, count, plot.x + 0.5, plot.y + 0.5);
    } else {
      inventory.addItem(seedDef.harvest, count);
    }

    // Bonus item (pumpkin gives berry)
    if (seedDef.bonusItem && seedDef.bonusCount) {
      if (itemDrops) {
        itemDrops.spawnDrop(seedDef.bonusItem, seedDef.bonusCount, plot.x + 0.5, plot.y + 0.5);
      } else {
        inventory.addItem(seedDef.bonusItem, seedDef.bonusCount);
      }
    }

    // Seed back chance
    if (Math.random() < seedDef.seedBack) {
      if (itemDrops) {
        itemDrops.spawnDrop(seedId, 1, plot.x + 0.5, plot.y + 0.5);
      } else {
        inventory.addItem(seedId, 1);
      }
    }

    // Particle burst
    this._harvestBurst(plot.x + 0.5, plot.y + 0.5);

    // Reset plot
    plot.seed = null;
    plot.phase = 0;
    plot.timer = 0;
    plot.watered = false;
    this._updateVisual(plot);
    this._updatePromptText(plot);

    // Audio
    const audio = window.__game?.audio;
    if (audio) {
      if (audio.playPickup) audio.playPickup();
      if (audio.playCraftSuccess) audio.playCraftSuccess();
    }

    // HUD
    const hud = window.__game?.hud;
    if (hud) {
      hud.showInfo(`Ernte: ${count}x ${seedDef.harvest}!`);
      hud.updateHotbar(inventory);
    }

    // XP
    const prog = window.__game?.progression;
    if (prog) prog.addXp(10);
  }

  /**
   * Particle burst effect on harvest.
   */
  _harvestBurst(x, y) {
    const game = window.__game;
    if (game?.ambientLife?._particles) {
      game.ambientLife._particles.burst(x, y, 15, {
        type: 'sparkle',
        color: [0.4, 1, 0.3],
        life: 1.2,
        size: 0.9,
      });
    }
    if (game?.vfx) {
      game.vfx.pickupGlow(x, y);
    }
  }

  // ─────────────────────────────────────────────
  // Inventory helpers
  // ─────────────────────────────────────────────

  /**
   * Find the first seed item in the player's inventory.
   * @returns {string|null} Seed item ID or null
   */
  _findSeedInInventory(inventory) {
    for (const slot of inventory.slots) {
      if (slot.itemId && SEED_IDS.includes(slot.itemId)) {
        return slot.itemId;
      }
    }
    return null;
  }

  // ─────────────────────────────────────────────
  // Visuals
  // ─────────────────────────────────────────────

  /**
   * Update canvas texture for a plot based on its current phase.
   * Phase 0: braunes Beet (leer)
   * Phase 1: kleine gruene Punkte (Saat)
   * Phase 2: groessere Pflanze (Spross)
   * Phase 3: leuchtende reife Pflanze (Erntereif)
   */
  _updateVisual(plot) {
    const ctx = plot._ctx;
    const s = 16;
    ctx.clearRect(0, 0, s, s);

    // Base: brown bed
    ctx.fillStyle = '#6B4226';
    ctx.fillRect(1, 6, 14, 8);
    ctx.fillStyle = '#7B5236';
    ctx.fillRect(2, 7, 12, 6);

    // Dirt furrows
    ctx.fillStyle = '#5A3316';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(3, 8 + i * 2, 10, 1);
    }

    if (plot.phase === 0) {
      // Empty bed — just soil
      // Watered indicator not applicable for empty
    } else if (plot.phase === 1) {
      // Saat — small green dots
      const seedColor = this._getSeedColor(plot.seed);
      ctx.fillStyle = '#33AA44';
      ctx.fillRect(4, 8, 2, 2);
      ctx.fillRect(8, 9, 2, 2);
      ctx.fillRect(11, 8, 2, 2);
      // Tiny seed-specific dot
      ctx.fillStyle = seedColor;
      ctx.fillRect(6, 10, 1, 1);
      ctx.fillRect(10, 10, 1, 1);
    } else if (plot.phase === 2) {
      // Spross — larger plants
      const seedColor = this._getSeedColor(plot.seed);
      // Stems
      ctx.fillStyle = '#228833';
      ctx.fillRect(4, 5, 2, 6);
      ctx.fillRect(8, 4, 2, 7);
      ctx.fillRect(12, 5, 2, 6);
      // Leaves
      ctx.fillStyle = '#44BB55';
      ctx.fillRect(3, 4, 4, 2);
      ctx.fillRect(7, 3, 4, 2);
      ctx.fillRect(11, 4, 4, 2);
      // Seed-specific color accent
      ctx.fillStyle = seedColor;
      ctx.fillRect(5, 3, 1, 1);
      ctx.fillRect(9, 2, 1, 1);
      ctx.fillRect(13, 3, 1, 1);
    } else if (plot.phase === 3) {
      // Erntereif — leuchtende Pflanze mit Glow
      const seedColor = this._getSeedColor(plot.seed);
      // Full plants
      ctx.fillStyle = '#228833';
      ctx.fillRect(3, 3, 2, 8);
      ctx.fillRect(7, 2, 2, 9);
      ctx.fillRect(11, 3, 2, 8);
      // Big leaves
      ctx.fillStyle = '#33CC55';
      ctx.fillRect(2, 2, 4, 3);
      ctx.fillRect(6, 1, 4, 3);
      ctx.fillRect(10, 2, 4, 3);
      // Fruits/harvest indicators
      ctx.fillStyle = seedColor;
      ctx.fillRect(3, 1, 2, 2);
      ctx.fillRect(7, 0, 2, 2);
      ctx.fillRect(11, 1, 2, 2);
      // Glow highlights
      ctx.fillStyle = '#FFFFAA';
      ctx.fillRect(4, 1, 1, 1);
      ctx.fillRect(8, 0, 1, 1);
      ctx.fillRect(12, 1, 1, 1);
    }

    // Watered indicator — blue tint on soil
    if (plot.watered && plot.phase > 0 && plot.phase < 3) {
      ctx.fillStyle = 'rgba(80, 140, 220, 0.3)';
      ctx.fillRect(2, 7, 12, 6);
    }

    plot._tex.needsUpdate = true;
  }

  /**
   * Farbe je nach Samentyp fuer visuelle Unterscheidung.
   */
  _getSeedColor(seedId) {
    switch (seedId) {
      case 'seed_carrot':  return '#FF8800';
      case 'seed_tomato':  return '#FF3333';
      case 'seed_pumpkin': return '#FFAA00';
      case 'seed_crystal': return '#AADDFF';
      default:             return '#88CC44';
    }
  }

  // ─────────────────────────────────────────────
  // Prompt Meshes
  // ─────────────────────────────────────────────

  /**
   * Create a floating text prompt mesh.
   */
  _createPromptMesh(x, y, text) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    this._drawPromptText(ctx, text);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    const geo = new THREE.PlaneGeometry(2, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + 0.5, -(y - 0.5), 0.5);
    // Store canvas/ctx/tex for dynamic text updates
    mesh.userData = { canvas, ctx, tex };
    return mesh;
  }

  /**
   * Draw prompt text on a canvas context.
   */
  _drawPromptText(ctx, text) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    const radius = 6;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(w - radius, 0);
    ctx.quadraticCurveTo(w, 0, w, radius);
    ctx.lineTo(w, h - radius);
    ctx.quadraticCurveTo(w, h, w - radius, h);
    ctx.lineTo(radius, h);
    ctx.quadraticCurveTo(0, h, 0, h - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
  }

  /**
   * Update the prompt mesh text depending on plot state.
   */
  _updatePromptText(plot) {
    let text;
    if (plot.phase === 0) {
      text = '[E] Pflanzen';
    } else if (plot.phase === 3) {
      text = '[E] Ernten';
    } else if (!plot.watered) {
      text = '[F] Giessen';
    } else {
      text = 'Waechst...';
    }

    const { ctx, tex } = plot.promptMesh.userData;
    if (!ctx || !tex) return;

    // Only redraw if text changed (compare by storing last text)
    if (plot._lastPromptText === text) return;
    plot._lastPromptText = text;

    this._drawPromptText(ctx, text);
    tex.needsUpdate = true;
  }

  // ─────────────────────────────────────────────
  // Serialization
  // ─────────────────────────────────────────────

  /**
   * Serialize all plot states for saving.
   * @returns {Array<Object>}
   */
  getState() {
    return this._plots.map(p => ({
      x: p.x,
      y: p.y,
      seed: p.seed,
      phase: p.phase,
      timer: p.timer,
      watered: p.watered,
    }));
  }

  /**
   * Restore plot states from saved data.
   * @param {Array<Object>} data  Saved plot states
   */
  loadState(data) {
    if (!Array.isArray(data)) return;

    for (const saved of data) {
      const plot = this._plots.find(p => p.x === saved.x && p.y === saved.y);
      if (!plot) continue;

      plot.seed = saved.seed || null;
      plot.phase = saved.phase || 0;
      plot.timer = saved.timer || 0;
      plot.watered = saved.watered || false;

      this._updateVisual(plot);
    }
  }

  // ─────────────────────────────────────────────
  // Cleanup
  // ─────────────────────────────────────────────

  dispose() {
    for (const plot of this._plots) {
      if (plot.mesh && plot.mesh.parent) {
        this._scene.remove(plot.mesh);
      }
      if (plot.mesh) {
        plot.mesh.geometry.dispose();
        if (plot.mesh.material.map) plot.mesh.material.map.dispose();
        plot.mesh.material.dispose();
      }
      if (plot.promptMesh && plot.promptMesh.parent) {
        this._scene.remove(plot.promptMesh);
      }
      if (plot.promptMesh) {
        plot.promptMesh.geometry.dispose();
        if (plot.promptMesh.material.map) plot.promptMesh.material.map.dispose();
        plot.promptMesh.material.dispose();
      }
    }
    this._plots = [];
    this._promptMeshes = [];
  }
}
