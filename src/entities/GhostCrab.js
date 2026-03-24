import * as THREE from 'three';
import { Entity } from './Entity.js';
import { MOB_TYPES } from '../data/mobs.js';
import { distance } from '../utils/MathUtils.js';
import { ANIM_SPEED_IDLE } from '../utils/Constants.js';

/**
 * Ghost Crab enemy — same sideways-scuttle AI as Crab but with an
 * invisibility phase cycle: 3s visible → 2s invisible → repeat.
 *
 * During invisible phase (this._ghostPhase === true):
 *   - Opacity fades to 0.15 over 0.3 s
 *   - takeDamage() returns early (invulnerable)
 *   - Still moves and deals contact damage
 *
 * Compatible with CombatSystem: exposes .alive, .def, .hp, .damage etc.
 */
export class GhostCrab extends Entity {
  constructor(x, y, scene) {
    super();
    this.mobType = 'ghost_crab';
    this.def = MOB_TYPES['ghost_crab'];
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

    this.aiState = 'idle'; // idle, chase, attack, dead, respawning
    this.attackCooldown = 0;
    this.hitFlashTimer = 0;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.alive = true;

    // Idle sideways wander
    this.sidewaysTimer = 0;
    this.sidewaysDir = (Math.random() < 0.5) ? -1 : 1;
    this.sidewaysDirTimer = 3 + Math.random() * 2;

    // HP bar
    this.hpBarMesh = null;
    this.hpBarCanvas = null;
    this.hpBarCtx = null;
    this.showHpBar = false;

    // Ghost phase: 3s visible → 2s invisible → repeat
    this._ghostPhase = false;       // true = invisible / invulnerable
    this._ghostTimer = 3.0;         // counts down to next phase switch
    this._VISIBLE_DURATION = 3.0;
    this._INVISIBLE_DURATION = 2.0;
    this._FADE_SPEED = 0.3;         // seconds for full opacity transition
    this._currentOpacity = 1.0;     // current rendered opacity (lerped)
    this._targetOpacity = 1.0;      // 1.0 when visible, 0.15 when ghosted
  }

  // ─── Sprite ──────────────────────────────────────────────────────────────

  /**
   * Build a 64×16 canvas strip with 4 frames of 16×16 blue-white ghostly crab.
   * Body: #8888CC (pale blue), claws: #AAAADD.
   */
  _createGhostCrabCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // Ghostly pale-blue palette
    const bodyColor  = '#8888CC';
    const shellColor = '#9999DD';
    const clawColor  = '#AAAADD';
    const legColor   = '#7777BB';
    const darkColor  = '#555599';

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 16;

      const legOff  = (frame % 2 === 0) ? 0 : 1;
      const clawOff = (frame % 2 === 0) ? 0 : 1;

      // ── Oval body ──
      ctx.fillStyle = bodyColor;
      ctx.fillRect(ox + 4, 5, 8, 5);
      ctx.fillRect(ox + 3, 6, 10, 3);
      ctx.fillStyle = shellColor;
      ctx.fillRect(ox + 5, 5, 6, 1);    // top highlight
      ctx.fillStyle = darkColor;
      ctx.fillRect(ox + 4, 9, 8, 1);    // bottom shadow
      ctx.fillStyle = shellColor;
      ctx.fillRect(ox + 7, 6, 2, 4);    // center ridge

      // ── Eyes (faint glow — bluish white) ──
      ctx.fillStyle = '#ccccff';
      ctx.fillRect(ox + 4, 4, 2, 2);
      ctx.fillRect(ox + 10, 4, 2, 2);
      ctx.fillStyle = '#3333aa';
      ctx.fillRect(ox + 5, 4, 1, 1);
      ctx.fillRect(ox + 11, 4, 1, 1);

      // ── Left claw ──
      ctx.fillStyle = clawColor;
      ctx.fillRect(ox + 1,  6 - clawOff, 3, 2);
      ctx.fillRect(ox + 0,  5 - clawOff, 2, 2);
      ctx.fillRect(ox + 0,  7 - clawOff + clawOff, 2, 2);
      ctx.fillStyle = darkColor;
      ctx.fillRect(ox + 0,  6 - clawOff + clawOff, 1, 1);

      // ── Right claw ──
      ctx.fillStyle = clawColor;
      ctx.fillRect(ox + 12, 6 - clawOff, 3, 2);
      ctx.fillRect(ox + 14, 5 - clawOff, 2, 2);
      ctx.fillRect(ox + 14, 7 - clawOff + clawOff, 2, 2);
      ctx.fillStyle = darkColor;
      ctx.fillRect(ox + 15, 6 - clawOff + clawOff, 1, 1);

      // ── 3 legs per side ──
      ctx.fillStyle = legColor;
      ctx.fillRect(ox + 3, 10 + legOff, 1, 3);
      ctx.fillRect(ox + 5, 10,          1, 2 + legOff);
      ctx.fillRect(ox + 6, 11,          1, 2);
      ctx.fillRect(ox + 12, 10 + legOff, 1, 3);
      ctx.fillRect(ox + 10, 10,          1, 2 + legOff);
      ctx.fillRect(ox + 9,  11,          1, 2);
    }

    return canvas;
  }

  loadAnimations() {
    const canvas = this._createGhostCrabCanvas();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    const sheetData = {
      texture,
      frameWidth: 16,
      frameHeight: 16,
      frameCount: 4,
      sheetWidth: 64,
      sheetHeight: 16,
    };

    this.addAnimation('walk', sheetData, 200);
    this.addAnimation('idle', sheetData, ANIM_SPEED_IDLE + 40);
    this.setAnimation('idle');

    // Enable opacity control on all sprite materials
    for (const sprite of Object.values(this.sprites)) {
      sprite.mesh.material.transparent = true;
      sprite.mesh.material.opacity = 1.0;
    }
  }

  addToScene(scene) {
    super.addToScene(scene);
    this._createHpBar(scene);
  }

  // ─── HP bar ──────────────────────────────────────────────────────────────

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

  // ─── Ghost phase ─────────────────────────────────────────────────────────

  _updateGhostPhase(dt) {
    this._ghostTimer -= dt;

    if (this._ghostTimer <= 0) {
      // Toggle between visible and invisible phases
      this._ghostPhase = !this._ghostPhase;
      this._ghostTimer = this._ghostPhase
        ? this._INVISIBLE_DURATION
        : this._VISIBLE_DURATION;
      this._targetOpacity = this._ghostPhase ? 0.15 : 1.0;
    }

    // Smooth lerp toward target opacity
    const lerpRate = dt / this._FADE_SPEED;
    this._currentOpacity += (this._targetOpacity - this._currentOpacity) * Math.min(lerpRate, 1.0);

    // Apply opacity to the active sprite material
    if (this.activeSprite) {
      this.activeSprite.mesh.material.opacity = this._currentOpacity;
    }
  }

  // ─── Main update ─────────────────────────────────────────────────────────

  update(dt, player, tileMap) {
    if (this.aiState === 'respawning') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    if (this.aiState === 'dead') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.hide();
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

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const distToPlayer = distance(this.x, this.y, player.x, player.y);

    switch (this.aiState) {
      case 'idle':
        this._doIdle(dt, distToPlayer, tileMap);
        break;
      case 'chase':
        this._doChase(dt, player, distToPlayer, tileMap);
        break;
      case 'attack':
        this._doAttack(dt, player, distToPlayer);
        break;
    }

    // Ghost phase runs independently of AI state
    this._updateGhostPhase(dt);

    this._updateHpBar();
    super.update(dt);
  }

  // ─── AI states (identical to Crab, minus flee) ───────────────────────────

  _doIdle(dt, distToPlayer, tileMap) {
    this.setAnimation('idle');

    if (distToPlayer < this.detectionRange) {
      this.aiState = 'chase';
      if (window.__game?.audio) window.__game.audio.playMobAlert?.();
      return;
    }

    this.sidewaysDirTimer -= dt;
    if (this.sidewaysDirTimer <= 0) {
      this.sidewaysDir *= -1;
      this.sidewaysDirTimer = 3 + Math.random() * 2;
    }

    const newX = this.x + this.sidewaysDir * this.speed * 0.4 * dt;
    const newY = this.y + (Math.random() - 0.5) * 0.1 * dt;

    if (
      distance(newX, newY, this.spawnX, this.spawnY) < 4 &&
      tileMap && !tileMap.isBlocked(newX, newY)
    ) {
      this.x = newX;
      this.y = newY;
    } else {
      this.sidewaysDir *= -1;
      this.sidewaysDirTimer = 1.5;
    }

    if (this.activeSprite) {
      this.activeSprite.flipX(this.sidewaysDir < 0);
    }
  }

  _doChase(dt, player, distToPlayer, tileMap) {
    if (distToPlayer > this.detectionRange * 1.5) {
      this.aiState = 'idle';
      return;
    }

    if (distToPlayer < 1.5) {
      this.aiState = 'attack';
      return;
    }

    this.setAnimation('walk');

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const nx = dx / len;
      const ny = dy / len;
      const moveX = nx * 1.3 * this.speed * dt;
      const moveY = ny * 0.8 * this.speed * dt;

      const newX = this.x + moveX;
      const newY = this.y + moveY;

      if (!tileMap || !tileMap.isBlocked(newX, this.y)) {
        this.x = newX;
      }
      if (!tileMap || !tileMap.isBlocked(this.x, newY)) {
        this.y = newY;
      }

      if (this.activeSprite) {
        this.activeSprite.flipX(dx < 0);
      }
    }
  }

  _doAttack(dt, player, distToPlayer) {
    if (distToPlayer > 2) {
      this.aiState = 'chase';
      return;
    }

    this.setAnimation('idle');

    if (this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 1.0;
    }
  }

  // ─── Combat ──────────────────────────────────────────────────────────────

  takeDamage(amount) {
    // Invulnerable while in ghost phase
    if (this._ghostPhase) return;
    if (!this.alive) return;

    this.hp -= amount;
    this.hitFlashTimer = 0.4;

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.aiState = 'dead';
    this.deathTimer = 0.8;

    if (this.activeSprite) {
      this.activeSprite.playing = false;
    }

    return this.drops;
  }

  // ─── Visibility helpers ──────────────────────────────────────────────────

  hide() {
    for (const sprite of Object.values(this.sprites)) {
      sprite.mesh.visible = false;
    }
    if (this.hpBarMesh) this.hpBarMesh.visible = false;
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.hp = this.maxHp;
    this.alive = true;
    this.aiState = 'idle';
    this.hitFlashTimer = 0;
    this.sidewaysDir = (Math.random() < 0.5) ? -1 : 1;
    this.sidewaysDirTimer = 3 + Math.random() * 2;

    // Reset ghost phase to visible
    this._ghostPhase = false;
    this._ghostTimer = this._VISIBLE_DURATION;
    this._currentOpacity = 1.0;
    this._targetOpacity = 1.0;

    for (const sprite of Object.values(this.sprites)) {
      sprite.mesh.visible = false;
    }
    if (this.sprites['idle']) {
      this.activeSprite = this.sprites['idle'];
      this.activeSprite.mesh.visible = true;
      this.activeSprite.mesh.material.opacity = 1.0;
      this.activeSprite.playing = true;
      this.activeSprite.loop = true;
      this.activeSprite.currentFrame = 0;
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
