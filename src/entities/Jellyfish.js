import * as THREE from 'three';
import { Entity } from './Entity.js';
import { MOB_TYPES } from '../data/mobs.js';
import { ANIM_SPEED_IDLE } from '../utils/Constants.js';

/**
 * Jellyfish enemy with canvas-drawn sprites and lazy drift movement.
 * AI states: idle (random drift), dead, respawning.
 * No chase or attack animation — contact damage only (handled by CombatSystem).
 *
 * Compatible with CombatSystem: exposes .alive, .def, .hp, .damage etc.
 */
export class Jellyfish extends Entity {
  constructor(x, y, scene, mobTypeKey = 'jellyfish_glow') {
    super();
    this.mobType = mobTypeKey;
    this.def = MOB_TYPES[mobTypeKey];
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.hp = this.def.hp;
    this.maxHp = this.def.hp;
    this.damage = this.def.damage;
    this.speed = this.def.speed;
    this.detectionRange = this.def.detectionRange;
    this.drops = this.def.drops;
    this.xp = this.def.xp;

    this.aiState = 'idle'; // idle, dead, respawning
    this.hitFlashTimer = 0;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.alive = true;

    // Drift movement — pick a random direction and change periodically
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftTimer = 3 + Math.random() * 2;

    // Glow oscillation
    this._glowTimer = Math.random() * Math.PI * 2; // randomize start phase

    // HP bar
    this.hpBarMesh = null;
    this.hpBarCanvas = null;
    this.hpBarCtx = null;
    this.showHpBar = false;
  }

  /**
   * Create and return a 64x32 canvas spritesheet with 2 frames of 32x32 jellyfish.
   * Frame 1: tentacles sway slightly left. Frame 2: tentacles sway slightly right.
   */
  _createJellyfishCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 2; frame++) {
      const ox = frame * 32; // x-offset for this frame
      // Tentacle sway: frame 0 leans left, frame 1 leans right
      const sway = (frame === 0) ? -2 : 2;

      // ── Dome body (semi-transparent cyan/teal) ──
      // Outer dome glow (lighter, broader)
      ctx.fillStyle = 'rgba(100, 230, 220, 0.35)';
      ctx.beginPath();
      ctx.ellipse(ox + 16, 12, 12, 9, 0, Math.PI, 0); // top half ellipse
      ctx.fill();

      // Main dome body
      ctx.fillStyle = 'rgba(60, 200, 200, 0.75)';
      ctx.beginPath();
      ctx.ellipse(ox + 16, 12, 10, 8, 0, Math.PI, 0);
      ctx.fill();

      // Inner highlight (lighter center)
      ctx.fillStyle = 'rgba(180, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(ox + 14, 8, 4, 3, -0.3, Math.PI, 0);
      ctx.fill();

      // Dome bottom edge (slightly darker band)
      ctx.fillStyle = 'rgba(30, 160, 170, 0.6)';
      ctx.fillRect(ox + 7, 13, 18, 2);

      // ── Tentacles (below dome, magenta/cyan thin lines) ──
      const tentacleColors = [
        'rgba(220, 80, 200, 0.85)',   // magenta
        'rgba(80, 220, 220, 0.85)',   // cyan
        'rgba(200, 100, 220, 0.85)',  // purple-magenta
        'rgba(60, 200, 220, 0.85)',   // teal
      ];

      // 4 tentacles spread across bottom of dome
      const tentacleXPositions = [10, 13, 19, 22];
      tentacleXPositions.forEach((tx, i) => {
        ctx.fillStyle = tentacleColors[i];
        // Main tentacle shaft — sway offset applied at bottom
        const topX = ox + tx;
        const botX = ox + tx + sway + (i % 2 === 0 ? -1 : 1);
        // Draw as a 1px wide line using fillRect with slight curve approximation
        ctx.fillRect(topX, 15, 1, 5);
        ctx.fillRect(botX, 20, 1, 4);
        ctx.fillRect(botX + (sway > 0 ? 1 : -1), 24, 1, 3);
        // Small tip dot
        ctx.fillRect(botX + (sway > 0 ? 1 : -1), 27, 2, 1);
      });

      // ── Center glow core inside dome ──
      ctx.fillStyle = 'rgba(200, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(ox + 16, 11, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  loadAnimations() {
    const canvas = this._createJellyfishCanvas();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const sheetData = {
      texture,
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 2,
      sheetWidth: 64,
      sheetHeight: 32,
    };

    this.addAnimation('idle', sheetData, ANIM_SPEED_IDLE + 100);
    this.setAnimation('idle');

    // Enable transparency for glow effect
    if (this.activeSprite) {
      this.activeSprite.mesh.material.transparent = true;
      this.activeSprite.mesh.material.opacity = 0.8;
    }
  }

  addToScene(scene) {
    super.addToScene(scene);
    this._createHpBar(scene);
  }

  _createHpBar(scene) {
    this.hpBarCanvas = document.createElement('canvas');
    this.hpBarCanvas.width = 64;
    this.hpBarCanvas.height = 8;
    this.hpBarCtx = this.hpBarCanvas.getContext('2d');

    const tex = new THREE.CanvasTexture(this.hpBarCanvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    const geo = new THREE.PlaneGeometry(2, 0.3);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    this.hpBarMesh = new THREE.Mesh(geo, mat);
    this.hpBarMesh.visible = false;
    scene.add(this.hpBarMesh);
  }

  _updateHpBar() {
    if (!this.hpBarCtx || !this.hpBarMesh) return;

    this.showHpBar = this.hp < this.maxHp && this.alive;
    this.hpBarMesh.visible = this.showHpBar;
    if (!this.showHpBar) return;

    const ctx = this.hpBarCtx;
    const w = 64, h = 8;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    const pct = this.hp / this.maxHp;
    ctx.fillStyle = pct > 0.5 ? '#44cc44' : pct > 0.25 ? '#ccaa00' : '#cc3333';
    ctx.fillRect(1, 1, (w - 2) * pct, h - 2);

    this.hpBarMesh.material.map.needsUpdate = true;
    this.hpBarMesh.position.set(this.x, -this.y + 1.2, 0.5 + this.y * 0.001);
  }

  update(dt, player, tileMap) {
    if (this.aiState === 'respawning') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this._respawn();
      }
      return;
    }

    if (this.aiState === 'dead') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this._hide();
        this.aiState = 'respawning';
        this.respawnTimer = 5;
      }
      return;
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.activeSprite) {
        this.activeSprite.mesh.visible = Math.floor(this.hitFlashTimer * 10) % 2 === 0;
      }
    }

    // Idle drift — jellyfish just wanders lazily
    if (this.aiState === 'idle') {
      this._doDrift(dt, tileMap);
    }

    // Glow effect — oscillate opacity with sin wave
    this._glowTimer += dt;
    if (this.activeSprite) {
      this.activeSprite.mesh.material.opacity = 0.8 + 0.2 * Math.sin(this._glowTimer * 2);
    }

    this._updateHpBar();
    super.update(dt);
  }

  _doDrift(dt, tileMap) {
    // Change drift direction periodically
    this.driftTimer -= dt;
    if (this.driftTimer <= 0) {
      this.driftAngle = Math.random() * Math.PI * 2;
      this.driftTimer = 3 + Math.random() * 2;
    }

    const moveX = Math.cos(this.driftAngle) * this.speed * dt;
    const moveY = Math.sin(this.driftAngle) * this.speed * dt;

    const newX = this.x + moveX;
    const newY = this.y + moveY;

    // Stay near spawn point and respect tile collisions
    const dx = newX - this.spawnX;
    const dy = newY - this.spawnY;
    const distFromSpawn = Math.sqrt(dx * dx + dy * dy);

    if (
      distFromSpawn < 5 &&
      (!tileMap || !tileMap.isBlocked(newX, newY))
    ) {
      this.x = newX;
      this.y = newY;
    } else {
      // Bounce: pick a new angle pointing roughly back toward spawn
      const backAngle = Math.atan2(this.spawnY - this.y, this.spawnX - this.x);
      this.driftAngle = backAngle + (Math.random() - 0.5) * Math.PI * 0.5;
      this.driftTimer = 1.5;
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    this.hitFlashTimer = 0.4;
    this._applyHitFlash();

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.aiState = 'dead';
    this.deathTimer = 0.8;

    // Freeze animation on last frame
    if (this.activeSprite) {
      this.activeSprite.playing = false;
    }

    return this.drops;
  }

  _hide() {
    for (const sprite of Object.values(this.sprites)) {
      sprite.mesh.visible = false;
    }
    if (this.hpBarMesh) this.hpBarMesh.visible = false;
  }

  _respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.hp = this.maxHp;
    this.alive = true;
    this.aiState = 'idle';
    this.hitFlashTimer = 0;
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftTimer = 3 + Math.random() * 2;

    for (const sprite of Object.values(this.sprites)) {
      sprite.mesh.visible = false;
    }
    if (this.sprites['idle']) {
      this.activeSprite = this.sprites['idle'];
      this.activeSprite.mesh.visible = true;
      this.activeSprite.playing = true;
      this.activeSprite.loop = true;
      this.activeSprite.currentFrame = 0;
      this.activeSprite.mesh.material.transparent = true;
    }
    this.activeAnim = 'idle';
  }

  dispose() {
    if (this.hpBarMesh) {
      if (this.hpBarMesh.parent) this.hpBarMesh.parent.remove(this.hpBarMesh);
      this.hpBarMesh.geometry.dispose();
      this.hpBarMesh.material.map.dispose();
      this.hpBarMesh.material.dispose();
    }
    super.dispose();
  }
}
