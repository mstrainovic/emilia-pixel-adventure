import * as THREE from 'three';

/**
 * Collectible insect entities for the Explorer Book.
 * Very small canvas-drawn sprites (8x8 base, 2 animation frames).
 * Insects drift slowly, flee fast-approaching players,
 * and can be caught by a slow/still player pressing E nearby.
 */

export const INSECT_TYPES = {
  butterfly:  { name: 'Schmetterling',  color: '#FF69B4', maps: ['hub', 'forest', 'unicorn_meadow'] },
  ladybug:    { name: 'Marienkaefer',   color: '#FF0000', maps: ['hub', 'forest'] },
  firefly:    { name: 'Gluehwuermchen', color: '#FFFF00', maps: ['forest', 'lake'], nightOnly: true },
  dragonfly:  { name: 'Libelle',        color: '#00BFFF', maps: ['lake', 'beach'] },
  bee:        { name: 'Biene',          color: '#FFD700', maps: ['hub', 'unicorn_meadow'] },
  cricket:    { name: 'Grille',         color: '#8B4513', maps: ['forest', 'beach'], nightOnly: true },
};

// Player speed threshold above which the insect starts fleeing
const FLEE_TRIGGER_SPEED = 2.5; // tiles/sec

export class Insect {
  constructor(type, x, y, scene, mapWidth, mapHeight) {
    this.insectType = type;
    this.def = INSECT_TYPES[type];
    this.x = x;
    this.y = y;
    this._mapWidth  = mapWidth  || 40;
    this._mapHeight = mapHeight || 32;

    this.alive = true; // visible and catchable
    this.onCatch = null; // callback set by Game.js: (insectType) => void

    this._respawnTimer = 0;

    // Drift movement state
    this._driftVX = 0;
    this._driftVY = 0;
    this._dirTimer = 0; // time until next direction change
    this._pickNewDirection();

    // Flee state
    this._fleeing = false;
    this._fleeTimer = 0;

    // Animation: 2 frames alternating
    this._frame = 0;
    this._animTimer = 0;
    this._animInterval = 0.35; // seconds per frame

    // Previous player position for speed estimation
    this._prevPlayerX = null;
    this._prevPlayerY = null;

    this.mesh = null;
    this._texture = null;
    this._scene = scene;
    this._createSprite(scene);
  }

  // ─── Canvas sprite ────────────────────────────────────────────────────────

  /**
   * Build a 16x8 canvas strip with 2 frames of 8x8 each.
   * Frame 0: wings "up", Frame 1: wings "down".
   */
  _buildCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width  = 16; // 2 frames × 8px wide
    canvas.height = 8;
    const ctx = canvas.getContext('2d');

    const type = this.insectType;
    const col  = this.def.color;

    for (let frame = 0; frame < 2; frame++) {
      const ox = frame * 8; // x-offset for this frame
      const wingUp = frame === 0;

      ctx.clearRect(ox, 0, 8, 8);

      if (type === 'butterfly') {
        this._drawButterfly(ctx, ox, col, wingUp);
      } else if (type === 'dragonfly') {
        this._drawDragonfly(ctx, ox, col, wingUp);
      } else if (type === 'bee') {
        this._drawBee(ctx, ox, col, wingUp);
      } else if (type === 'ladybug') {
        this._drawLadybug(ctx, ox, col, wingUp);
      } else if (type === 'firefly') {
        this._drawFirefly(ctx, ox, col, wingUp);
      } else if (type === 'cricket') {
        this._drawCricket(ctx, ox, col, wingUp);
      }
    }

    return canvas;
  }

  // Butterfly: large rounded wings + tiny body
  _drawButterfly(ctx, ox, col, wingUp) {
    const wingY = wingUp ? 1 : 2;
    // Left wing
    ctx.fillStyle = col;
    ctx.fillRect(ox + 0, wingY,     3, 3);
    ctx.fillRect(ox + 1, wingY + 1, 2, 1);
    // Right wing
    ctx.fillRect(ox + 5, wingY,     3, 3);
    ctx.fillRect(ox + 5, wingY + 1, 2, 1);
    // Body (center)
    ctx.fillStyle = '#333333';
    ctx.fillRect(ox + 3, 2, 2, 4);
    // Wing spots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 1, wingY + 1, 1, 1);
    ctx.fillRect(ox + 6, wingY + 1, 1, 1);
  }

  // Dragonfly: long body + thin horizontal wings
  _drawDragonfly(ctx, ox, col, wingUp) {
    const wingY = wingUp ? 2 : 3;
    // Thin long wings
    ctx.fillStyle = col + 'cc'; // slight transparency via hex alpha
    ctx.fillRect(ox + 0, wingY, 3, 1);
    ctx.fillRect(ox + 5, wingY, 3, 1);
    ctx.fillRect(ox + 0, wingY + 1, 2, 1);
    ctx.fillRect(ox + 6, wingY + 1, 2, 1);
    // Long slender body
    ctx.fillStyle = col;
    ctx.fillRect(ox + 3, 1, 2, 6);
    // Head
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(ox + 3, 0, 2, 2);
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 3, 0, 1, 1);
    ctx.fillRect(ox + 4, 0, 1, 1);
  }

  // Bee: striped round body + wings
  _drawBee(ctx, ox, col, wingUp) {
    const wingY = wingUp ? 1 : 2;
    // Wings (semi-transparent white)
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(ox + 0, wingY, 3, 2);
    ctx.fillRect(ox + 5, wingY, 3, 2);
    // Round body with stripes
    ctx.fillStyle = col; // yellow
    ctx.fillRect(ox + 2, 2, 4, 5);
    ctx.fillStyle = '#222222'; // black stripes
    ctx.fillRect(ox + 2, 3, 4, 1);
    ctx.fillRect(ox + 2, 5, 4, 1);
    // Head
    ctx.fillStyle = '#222222';
    ctx.fillRect(ox + 3, 1, 2, 2);
    // Stinger
    ctx.fillStyle = '#555500';
    ctx.fillRect(ox + 3, 7, 2, 1);
  }

  // Ladybug: round red body with spots + black head
  _drawLadybug(ctx, ox, col, wingUp) {
    // Body
    ctx.fillStyle = col;
    ctx.fillRect(ox + 2, 3, 4, 4);
    ctx.fillRect(ox + 1, 4, 6, 2);
    // Black spots
    ctx.fillStyle = '#111111';
    ctx.fillRect(ox + 2, 3, 1, 1);
    ctx.fillRect(ox + 5, 3, 1, 1);
    ctx.fillRect(ox + 2, 5, 1, 1);
    ctx.fillRect(ox + 5, 5, 1, 1);
    // Center dividing line
    ctx.fillRect(ox + 3, 3, 2, 4);
    // Head
    ctx.fillStyle = '#111111';
    ctx.fillRect(ox + 2, 1, 4, 2);
    // Antennae animation
    const antY = wingUp ? 0 : 0;
    ctx.fillRect(ox + 2, antY, 1, 1);
    ctx.fillRect(ox + 5, antY, 1, 1);
  }

  // Firefly: small glowing body with light pulse
  _drawFirefly(ctx, ox, col, wingUp) {
    const glowIntensity = wingUp ? col : '#aaaa00';
    // Glow halo (frame 0 = bright, frame 1 = dim)
    ctx.fillStyle = wingUp ? 'rgba(255,255,100,0.4)' : 'rgba(255,255,100,0.1)';
    ctx.fillRect(ox + 1, 2, 6, 5);
    // Body
    ctx.fillStyle = '#3a3a1a';
    ctx.fillRect(ox + 2, 3, 4, 3);
    // Light organ (abdomen tip)
    ctx.fillStyle = glowIntensity;
    ctx.fillRect(ox + 3, 4, 2, 2);
    // Head
    ctx.fillStyle = '#222200';
    ctx.fillRect(ox + 3, 2, 2, 2);
    // Wings (thin)
    ctx.fillStyle = 'rgba(200,255,200,0.5)';
    ctx.fillRect(ox + 1, 3, 2, 2);
    ctx.fillRect(ox + 5, 3, 2, 2);
  }

  // Cricket: brown oval body with long antennae
  _drawCricket(ctx, ox, col, wingUp) {
    // Body
    ctx.fillStyle = col;
    ctx.fillRect(ox + 1, 3, 6, 4);
    ctx.fillRect(ox + 2, 2, 4, 1); // head
    // Wing texture (slightly darker)
    ctx.fillStyle = '#6b3410';
    ctx.fillRect(ox + 2, 4, 4, 2);
    // Antennae (vary with frame)
    ctx.fillStyle = '#5a2e08';
    if (wingUp) {
      ctx.fillRect(ox + 2, 1, 1, 2);
      ctx.fillRect(ox + 5, 1, 1, 2);
    } else {
      ctx.fillRect(ox + 1, 0, 1, 3);
      ctx.fillRect(ox + 6, 0, 1, 3);
    }
    // Hind legs (long)
    ctx.fillStyle = '#4a2008';
    ctx.fillRect(ox + 1, 6, 1, 2);
    ctx.fillRect(ox + 6, 6, 1, 2);
  }

  // ─── THREE.Sprite creation ────────────────────────────────────────────────

  _createSprite(scene) {
    const canvas = this._buildCanvas();

    this._texture = new THREE.CanvasTexture(canvas);
    this._texture.magFilter = THREE.NearestFilter;
    this._texture.minFilter = THREE.NearestFilter;
    this._texture.generateMipmaps = false;
    this._texture.colorSpace = THREE.SRGBColorSpace;
    // Show only first frame (left half) by default
    this._texture.repeat.set(0.5, 1);
    this._texture.offset.set(0, 0);

    const mat = new THREE.SpriteMaterial({
      map: this._texture,
      transparent: true,
      depthWrite: false,
    });

    this.mesh = new THREE.Sprite(mat);
    // Scale: 8px at TILE_SIZE=16 → 0.5 tile units per side
    this.mesh.scale.set(0.5, 0.5, 1);
    this._updateMeshPosition();

    scene.add(this.mesh);
  }

  _updateMeshPosition() {
    if (!this.mesh) return;
    const z = 0.25 + this.y * 0.001; // slightly above props
    this.mesh.position.set(this.x, -this.y, z);
  }

  // ─── Animation frame update ───────────────────────────────────────────────

  _advanceAnimation(dt) {
    this._animTimer += dt;
    if (this._animTimer >= this._animInterval) {
      this._animTimer -= this._animInterval;
      this._frame = 1 - this._frame; // toggle 0 ↔ 1
      // Shift UV offset to show the correct frame
      this._texture.offset.set(this._frame * 0.5, 0);
      this._texture.needsUpdate = true;
    }
  }

  // ─── Movement helpers ─────────────────────────────────────────────────────

  _pickNewDirection() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3; // tiles/sec, slow drift
    this._driftVX = Math.cos(angle) * speed;
    this._driftVY = Math.sin(angle) * speed;
    this._dirTimer = 2 + Math.random() * 2; // 2–4 seconds
  }

  _clampToBounds() {
    const margin = 2;
    this.x = Math.max(margin, Math.min(this._mapWidth  - margin, this.x));
    this.y = Math.max(margin, Math.min(this._mapHeight - margin, this.y));
  }

  // ─── Night-only visibility ────────────────────────────────────────────────

  /**
   * Call each frame with whether the game is currently in night phase.
   * nightOnly insects hide during the day.
   */
  setNightPhase(isNight) {
    if (!this.def.nightOnly) return; // always visible
    if (!this.mesh) return;
    this.mesh.visible = isNight && this.alive;
  }

  // ─── Main update ──────────────────────────────────────────────────────────

  update(dt, player) {
    // Respawn countdown when caught
    if (!this.alive) {
      this._respawnTimer -= dt;
      if (this._respawnTimer <= 0) {
        this._respawn();
      }
      return;
    }

    // Animate wings
    this._advanceAnimation(dt);

    // ── Estimate player speed from position delta ──
    let playerSpeed = 0;
    if (this._prevPlayerX !== null) {
      const pdx = player.x - this._prevPlayerX;
      const pdy = player.y - this._prevPlayerY;
      playerSpeed = Math.sqrt(pdx * pdx + pdy * pdy) / dt;
    }
    this._prevPlayerX = player.x;
    this._prevPlayerY = player.y;

    const distToPlayer = this._dist(this.x, this.y, player.x, player.y);

    // ── Flee logic ──
    if (this._fleeing) {
      this._fleeTimer -= dt;
      if (this._fleeTimer <= 0) {
        this._fleeing = false;
        this._pickNewDirection();
      } else {
        // Move directly away from player at 1.5 tiles/sec
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        this.x += (dx / len) * 1.5 * dt;
        this.y += (dy / len) * 1.5 * dt;
        this._clampToBounds();
        this._updateMeshPosition();
        return; // skip normal drift while fleeing
      }
    }

    // Trigger flee if player rushes toward the insect
    if (
      !this._fleeing &&
      distToPlayer < 3 &&
      playerSpeed > FLEE_TRIGGER_SPEED
    ) {
      this._fleeing = true;
      this._fleeTimer = 3; // flee for 3 seconds
      return;
    }

    // ── Normal drift ──
    this._dirTimer -= dt;
    if (this._dirTimer <= 0) {
      this._pickNewDirection();
    }

    this.x += this._driftVX * dt;
    this.y += this._driftVY * dt;
    this._clampToBounds();

    // Bounce direction off edges
    const margin = 2;
    if (this.x <= margin || this.x >= this._mapWidth - margin)  this._driftVX *= -1;
    if (this.y <= margin || this.y >= this._mapHeight - margin) this._driftVY *= -1;

    this._updateMeshPosition();
  }

  // ─── Catch interface ──────────────────────────────────────────────────────

  /**
   * Called by Game.js when the player presses E near this insect while slow.
   * Returns true if successfully caught, false if already caught.
   */
  tryCatch() {
    if (!this.alive) return false;
    this.alive = false;
    this._respawnTimer = 120; // respawn after 2 minutes
    if (this.mesh) this.mesh.visible = false;
    if (this.onCatch) this.onCatch(this.insectType);
    return true;
  }

  // ─── Respawn ──────────────────────────────────────────────────────────────

  _respawn() {
    this.alive = true;
    // Random position within safe map bounds
    const margin = 3;
    this.x = margin + Math.random() * (this._mapWidth  - margin * 2);
    this.y = margin + Math.random() * (this._mapHeight - margin * 2);
    this._pickNewDirection();
    this._fleeing = false;
    this._fleeTimer = 0;
    if (this.mesh) this.mesh.visible = true;
    this._updateMeshPosition();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  _dist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ─── Dispose ─────────────────────────────────────────────────────────────

  dispose() {
    if (this.mesh) {
      if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
      if (this.mesh.material) {
        if (this.mesh.material.map) this.mesh.material.map.dispose();
        this.mesh.material.dispose();
      }
      this.mesh = null;
    }
    this._texture = null;
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Create all insects that belong to `sceneName` and add them to `scene`.
 * Returns the insect array so Game.js can store and update them.
 */
export function createInsectsForScene(sceneName, scene, mapWidth, mapHeight) {
  const insects = [];
  for (const [type, def] of Object.entries(INSECT_TYPES)) {
    if (def.maps.includes(sceneName)) {
      // 2 instances per type per map
      for (let i = 0; i < 2; i++) {
        const x = 3 + Math.random() * (mapWidth  - 6);
        const y = 3 + Math.random() * (mapHeight - 6);
        insects.push(new Insect(type, x, y, scene, mapWidth, mapHeight));
      }
    }
  }
  return insects;
}
