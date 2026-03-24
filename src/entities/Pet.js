import * as THREE from 'three';
import { ANIM_SPEED_IDLE } from '../utils/Constants.js';

/**
 * Pet companion that follows the player.
 * Canvas-drawn 16x16 sprites (4 idle animation frames on a 64x16 strip).
 * No combat, no HP bar — friendly companion only.
 *
 * Types: fox (find_items), dragon (fire_attack), rabbit (collect_boost)
 */

const PET_TYPES = {
  fox:    { name: 'Kleiner Fuchs',    ability: 'find_items',    color: '#FF8C00' },
  dragon: { name: 'Baby-Drache',      ability: 'fire_attack',   color: '#228B22' },
  rabbit: { name: 'Magischer Hase',   ability: 'collect_boost', color: '#E0E0FF' },
};

const PET_EVOLUTIONS = {
  fox:    { name: 'Feuerfuchs',     ability: 'find_items_plus', color: '#FF4500' },
  dragon: { name: 'Grosser Drache', ability: 'fire_attack_plus', color: '#FF2200' },
  rabbit: { name: 'Goldener Hase',  ability: 'collect_boost_plus', color: '#FFD700' },
};

export class Pet {
  constructor(type, scene) {
    this.type = type;
    this.def = PET_TYPES[type] || PET_TYPES.fox;
    this.name = this.def.name;
    this.ability = this.def.ability;

    this.x = 0;
    this.y = 0;

    this.friendship = 0;
    this._friendshipTimer = 0;
    this.evolved = false;

    // Animation state
    this._animFrame = 0;
    this._animTimer = 0;
    this._animSpeed = ANIM_SPEED_IDLE; // ms per frame

    // THREE.js objects
    this._mesh = null;
    this._texture = null;
    this._scene = null;

    this._createSprite(scene);
  }

  // ──────────────────────────────────────────────────────
  //  Canvas drawing helpers
  // ──────────────────────────────────────────────────────

  _drawFox(ctx) {
    // Fox: orange body, white belly, bushy tail, pointy ears.
    // Frame animation: tail wags (alternates position per frame).
    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 16;
      const tailWag = (frame % 2 === 0) ? 0 : 1; // tail wag offset

      // ── Tail (bushy, left side) ──
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(ox + 1, 8 + tailWag, 4, 5);
      ctx.fillRect(ox + 0, 9 + tailWag, 5, 4);
      // White tail tip
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 0, 11 + tailWag, 3, 2);

      // ── Body (round) ──
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(ox + 4, 7, 8, 7);
      ctx.fillRect(ox + 3, 8, 10, 5);
      // White belly
      ctx.fillStyle = '#FFF0D0';
      ctx.fillRect(ox + 6, 9, 4, 4);

      // ── Legs ──
      ctx.fillStyle = '#E07000';
      ctx.fillRect(ox + 5, 13, 2, 3);
      ctx.fillRect(ox + 9, 13, 2, 3);

      // ── Head ──
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(ox + 6, 2, 8, 7);
      ctx.fillRect(ox + 5, 3, 10, 5);

      // ── Pointy ears ──
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(ox + 6, 0, 2, 3); // left ear
      ctx.fillRect(ox + 11, 0, 2, 3); // right ear
      // Inner ear pink
      ctx.fillStyle = '#FFB0A0';
      ctx.fillRect(ox + 7, 0, 1, 2);
      ctx.fillRect(ox + 12, 0, 1, 2);

      // ── Snout ──
      ctx.fillStyle = '#FFF0D0';
      ctx.fillRect(ox + 9, 6, 4, 3);
      // Nose
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 10, 6, 2, 1);

      // ── Eyes ──
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 7, 3, 2, 2);
      ctx.fillRect(ox + 11, 3, 2, 2);
      // Eye shine
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 8, 3, 1, 1);
      ctx.fillRect(ox + 12, 3, 1, 1);
    }
  }

  _drawDragon(ctx) {
    // Dragon: green body, gold belly, small wings, pointed tail.
    // Frame animation: wings flap (wing height changes per frame).
    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 16;
      const wingUp = (frame % 2 === 0) ? 0 : 2; // wing flap offset

      // ── Pointed tail ──
      ctx.fillStyle = '#1A7A1A';
      ctx.fillRect(ox + 0, 10, 4, 3);
      ctx.fillRect(ox + 0, 12, 2, 2); // taper to point
      // Tail spines
      ctx.fillStyle = '#FF6600';
      ctx.fillRect(ox + 1, 9, 1, 2);

      // ── Body (compact, round) ──
      ctx.fillStyle = '#228B22';
      ctx.fillRect(ox + 3, 7, 9, 7);
      ctx.fillRect(ox + 2, 8, 11, 5);
      // Gold belly
      ctx.fillStyle = '#DAA520';
      ctx.fillRect(ox + 5, 9, 5, 4);

      // ── Wings (left and right of body) ──
      ctx.fillStyle = '#1A6B1A';
      // Left wing
      ctx.fillRect(ox + 2, 5 - wingUp, 2, 4 + wingUp);
      ctx.fillRect(ox + 1, 4 - wingUp, 3, 2);
      // Right wing
      ctx.fillRect(ox + 12, 5 - wingUp, 2, 4 + wingUp);
      ctx.fillRect(ox + 12, 4 - wingUp, 3, 2);
      // Wing membrane detail
      ctx.fillStyle = '#2EA82E';
      ctx.fillRect(ox + 2, 6 - wingUp, 1, 2);
      ctx.fillRect(ox + 13, 6 - wingUp, 1, 2);

      // ── Legs ──
      ctx.fillStyle = '#1A7A1A';
      ctx.fillRect(ox + 5, 13, 2, 3);
      ctx.fillRect(ox + 9, 13, 2, 3);
      // Claws
      ctx.fillStyle = '#DAA520';
      ctx.fillRect(ox + 4, 15, 1, 1);
      ctx.fillRect(ox + 7, 15, 1, 1);
      ctx.fillRect(ox + 9, 15, 1, 1);
      ctx.fillRect(ox + 11, 15, 1, 1);

      // ── Head ──
      ctx.fillStyle = '#228B22';
      ctx.fillRect(ox + 5, 2, 8, 6);
      ctx.fillRect(ox + 4, 3, 10, 4);
      // Snout
      ctx.fillStyle = '#DAA520';
      ctx.fillRect(ox + 9, 5, 4, 3);
      // Nostril
      ctx.fillStyle = '#FF4400';
      ctx.fillRect(ox + 10, 5, 1, 1);
      ctx.fillRect(ox + 12, 5, 1, 1);

      // ── Horns / spines ──
      ctx.fillStyle = '#FF6600';
      ctx.fillRect(ox + 6, 0, 1, 3);
      ctx.fillRect(ox + 9, 1, 1, 2);
      ctx.fillRect(ox + 12, 0, 1, 3);

      // ── Eyes ──
      ctx.fillStyle = '#FF2200';
      ctx.fillRect(ox + 6, 3, 2, 2);
      ctx.fillRect(ox + 10, 3, 2, 2);
      // Eye slit
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 7, 3, 1, 2);
      ctx.fillRect(ox + 11, 3, 1, 2);
      // Eye shine
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 6, 3, 1, 1);
      ctx.fillRect(ox + 10, 3, 1, 1);
    }
  }

  _drawRabbit(ctx) {
    // Rabbit: white body, long ears, blue glow aura, cotton tail.
    // Frame animation: ears twitch (slight tilt each frame).
    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 16;
      const earTwitch = (frame % 2 === 0) ? 0 : 1; // ear twitch offset

      // ── Blue glow aura (subtle background glow) ──
      ctx.fillStyle = 'rgba(150, 150, 255, 0.3)';
      ctx.fillRect(ox + 2, 2, 12, 14);

      // ── Cotton tail ──
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 0, 10, 3, 3);
      ctx.fillRect(ox + 1, 9, 2, 5);
      // Tail blue tint
      ctx.fillStyle = '#D0D0FF';
      ctx.fillRect(ox + 0, 11, 2, 2);

      // ── Body (round, fluffy) ──
      ctx.fillStyle = '#F0F0FF';
      ctx.fillRect(ox + 3, 7, 9, 7);
      ctx.fillRect(ox + 2, 8, 11, 5);
      // Belly (slightly warmer white)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 5, 9, 5, 4);

      // ── Legs ──
      ctx.fillStyle = '#E0E0F0';
      ctx.fillRect(ox + 4, 13, 3, 3);
      ctx.fillRect(ox + 9, 13, 3, 3);
      // Back paws (larger)
      ctx.fillRect(ox + 3, 14, 4, 2);
      ctx.fillRect(ox + 9, 14, 4, 2);

      // ── Head ──
      ctx.fillStyle = '#F0F0FF';
      ctx.fillRect(ox + 5, 2, 8, 7);
      ctx.fillRect(ox + 4, 3, 10, 5);

      // ── Long ears (tall, with twitching animation) ──
      ctx.fillStyle = '#F0F0FF';
      // Left ear
      ctx.fillRect(ox + 5 - earTwitch, 0, 3, 4);
      ctx.fillRect(ox + 5 - earTwitch, 0, 2, 6 - earTwitch);
      // Right ear
      ctx.fillRect(ox + 10 + earTwitch, 0, 3, 4);
      ctx.fillRect(ox + 11 + earTwitch, 0, 2, 6 - earTwitch);
      // Inner ear pink
      ctx.fillStyle = '#FFB0C0';
      ctx.fillRect(ox + 6 - earTwitch, 1, 1, 4 - earTwitch);
      ctx.fillRect(ox + 11 + earTwitch, 1, 1, 4 - earTwitch);

      // ── Nose ──
      ctx.fillStyle = '#FFB0C0';
      ctx.fillRect(ox + 8, 6, 2, 1);

      // ── Eyes (large, cute, with blue magic shine) ──
      ctx.fillStyle = '#6060C0';
      ctx.fillRect(ox + 6, 3, 2, 2);
      ctx.fillRect(ox + 10, 3, 2, 2);
      // Eye pupil
      ctx.fillStyle = '#2020A0';
      ctx.fillRect(ox + 7, 3, 1, 2);
      ctx.fillRect(ox + 11, 3, 1, 2);
      // Magic blue shine
      ctx.fillStyle = '#A0C0FF';
      ctx.fillRect(ox + 6, 3, 1, 1);
      ctx.fillRect(ox + 10, 3, 1, 1);

      // ── Magic sparkles (blue glow particles) ──
      if (frame % 2 === 0) {
        ctx.fillStyle = 'rgba(150, 180, 255, 0.8)';
        ctx.fillRect(ox + 1, 5, 1, 1);
        ctx.fillRect(ox + 15, 7, 1, 1);
        ctx.fillRect(ox + 3, 13, 1, 1);
      } else {
        ctx.fillStyle = 'rgba(180, 200, 255, 0.8)';
        ctx.fillRect(ox + 2, 4, 1, 1);
        ctx.fillRect(ox + 14, 9, 1, 1);
        ctx.fillRect(ox + 1, 12, 1, 1);
      }
    }
  }

  // ──────────────────────────────────────────────────────
  //  Sprite creation
  // ──────────────────────────────────────────────────────

  _createSprite(scene) {
    // Draw 4 frames side-by-side on a 64x16 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    switch (this.type) {
      case 'fox':    this._drawFox(ctx);    break;
      case 'dragon': this._drawDragon(ctx); break;
      case 'rabbit': this._drawRabbit(ctx); break;
      default:       this._drawFox(ctx);    break;
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    // Clone texture for UV manipulation (one frame = 1/4 of sheet width)
    const clonedTex = texture.clone();
    clonedTex.needsUpdate = true;
    clonedTex.magFilter = THREE.NearestFilter;
    clonedTex.minFilter = THREE.NearestFilter;
    clonedTex.repeat.set(0.25, 1); // show 1 frame at a time
    clonedTex.offset.set(0, 0);    // start at frame 0

    // Plane geometry: 1 tile wide and tall (scaled to look right in world)
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this._mesh = new THREE.Mesh(geo, mat);
    this._texture = clonedTex;

    // Store original canvas texture for disposal
    this._baseTexture = texture;

    if (scene) {
      this._scene = scene;
      scene.add(this._mesh);
    }
  }

  // ──────────────────────────────────────────────────────
  //  Public API
  // ──────────────────────────────────────────────────────

  /**
   * Add pet mesh to scene (if not done in constructor).
   */
  addToScene(scene) {
    if (this._scene) return; // already added
    this._scene = scene;
    scene.add(this._mesh);
  }

  /**
   * Main update: follow player + increment friendship + advance animation.
   * @param {number} dt - delta time in seconds
   * @param {number} playerX - player tile X
   * @param {number} playerY - player tile Y
   */
  update(dt, playerX, playerY) {
    // ── Follow player with smooth lerp ──
    const targetX = playerX - 1; // slightly behind/left of player
    const targetY = playerY;

    this.x += (targetX - this.x) * 2.0 * dt;
    this.y += (targetY - this.y) * 2.0 * dt;

    // ── Friendship timer ──
    this._friendshipTimer += dt;
    if (this._friendshipTimer >= 60) {
      this.friendship = Math.min(100, this.friendship + 1);
      this._friendshipTimer -= 60;
    }

    // ── Evolution check ──
    if (this.friendship >= 100 && !this.evolved) {
      this.evolve();
    }

    // ── Frame animation ──
    this._animTimer += dt * 1000; // convert to ms
    if (this._animTimer >= this._animSpeed) {
      this._animTimer -= this._animSpeed;
      this._animFrame = (this._animFrame + 1) % 4;
      if (this._texture) {
        this._texture.offset.x = this._animFrame * 0.25;
      }
    }

    // ── Update mesh position ──
    if (this._mesh) {
      const z = 0.2 + this.y * 0.001;
      this._mesh.position.set(this.x, -this.y, z);
    }
  }

  /**
   * Teleport the pet to a position (used on scene transitions).
   * Places it slightly left of the given coordinates.
   */
  teleportTo(x, y) {
    this.x = x - 1;
    this.y = y;
    if (this._mesh) {
      const z = 0.2 + this.y * 0.001;
      this._mesh.position.set(this.x, -this.y, z);
    }
  }

  /**
   * Feed the pet a treat — increases friendship by 10.
   */
  feedTreat() {
    this.friendship = Math.min(100, this.friendship + 10);
  }

  /**
   * Returns serializable state for saving.
   */
  getState() {
    return {
      type: this.type,
      friendship: this.friendship,
      evolved: this.evolved,
    };
  }

  /**
   * Restores state from a saved snapshot.
   * @param {object|null} state
   */
  loadState(state) {
    this.friendship = state?.friendship || 0;
    if (state?.evolved && !this.evolved) {
      this.evolve();
    }
  }

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
    // Apply stat upgrades based on type
    switch (this.type) {
      case 'dragon':
        this.damage = 10;       // up from 5
        break;
      case 'rabbit':
        this.collectRadius = 4; // up from 2
        break;
      case 'fox':
        this.detectRadius = 6;  // up from 3 — finds hidden items from further away
        break;
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

  /**
   * Remove the pet mesh from the scene and release GPU resources.
   */
  dispose() {
    if (this._scene && this._mesh) {
      this._scene.remove(this._mesh);
    }
    if (this._mesh) {
      this._mesh.geometry.dispose();
      if (this._texture) {
        this._texture.dispose();
      }
      if (this._baseTexture) {
        this._baseTexture.dispose();
      }
      this._mesh.material.dispose();
      this._mesh = null;
    }
    this._scene = null;
  }
}
