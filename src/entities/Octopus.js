import * as THREE from 'three';
import { Entity } from './Entity.js';
import { MOB_TYPES } from '../data/mobs.js';
import { distance } from '../utils/MathUtils.js';
import { ANIM_SPEED_IDLE } from '../utils/Constants.js';

/**
 * Octopus enemy with canvas-drawn sprites and ink spray attack.
 * AI states: idle (random drift), chase, attack (ink spray), dead, respawning.
 *
 * Compatible with CombatSystem: exposes .alive, .def, .hp, .damage etc.
 */
export class Octopus extends Entity {
  constructor(x, y, scene, mobTypeKey = 'octopus') {
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

    this.aiState = 'idle'; // idle, chase, attack, dead, respawning
    this.attackCooldown = 0;
    this.hitFlashTimer = 0;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.alive = true;

    // Idle random drift
    this._driftDirX = (Math.random() - 0.5) * 2;
    this._driftDirY = (Math.random() - 0.5) * 2;
    this._driftTimer = 0;
    this._driftChangetime = 4 + Math.random() * 2;

    // Ink spray cooldown
    this._inkCooldown = 0;

    // HP bar
    this.hpBarMesh = null;
    this.hpBarCanvas = null;
    this.hpBarCtx = null;
    this.showHpBar = false;

    // Load animations and add to scene
    this.loadAnimations();
    if (scene) {
      this.addToScene(scene);
    }
  }

  /**
   * Create a 64x32 canvas spritesheet with 2 frames of 32x32 octopus.
   * Frame 1: tentacles spread; Frame 2: tentacles slightly curled.
   */
  _createSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const bodyColor    = '#6b2d8b'; // deep purple
    const bodyDark     = '#3d1450'; // dark shadow
    const bodyLight    = '#9b4dbb'; // highlight
    const tentacleCol  = '#7c3a9e';
    const tentacleTip  = '#5a1d7a';
    const eyeWhite     = '#f0e8ff';
    const eyePupil     = '#1a0a2e';
    const inkDot       = '#2d0a3e';

    for (let frame = 0; frame < 2; frame++) {
      const ox = frame * 32;
      // frame 0 = tentacles spread, frame 1 = tentacles curled

      // ── Rounded head/mantle body (center oval, 14w x 12h at y=2..13) ──
      ctx.fillStyle = bodyColor;
      ctx.fillRect(ox + 9,  2, 14, 12); // main rect
      ctx.fillRect(ox + 8,  3, 16, 10); // wider middle
      ctx.fillRect(ox + 7,  5, 18, 6);  // widest band
      ctx.fillRect(ox + 10, 1, 12, 2);  // top cap

      // Highlight (top-left sheen)
      ctx.fillStyle = bodyLight;
      ctx.fillRect(ox + 10, 2, 6, 2);
      ctx.fillRect(ox + 9,  3, 4, 3);

      // Shadow underside
      ctx.fillStyle = bodyDark;
      ctx.fillRect(ox + 9,  12, 14, 2);
      ctx.fillRect(ox + 10, 13, 12, 1);

      // ── Eyes (on upper body, y=4..7) ──
      ctx.fillStyle = eyeWhite;
      ctx.fillRect(ox + 10, 4, 4, 4); // left eye
      ctx.fillRect(ox + 18, 4, 4, 4); // right eye
      ctx.fillStyle = eyePupil;
      ctx.fillRect(ox + 11, 5, 2, 2); // left pupil
      ctx.fillRect(ox + 19, 5, 2, 2); // right pupil
      // Eye ring highlight
      ctx.fillStyle = eyeWhite;
      ctx.fillRect(ox + 11, 4, 1, 1); // left glint
      ctx.fillRect(ox + 19, 4, 1, 1); // right glint

      // ── Ink dot on belly (subtle detail) ──
      ctx.fillStyle = inkDot;
      ctx.fillRect(ox + 15, 10, 2, 2);

      // ── 8 Tentacles below body (4 left side, 4 right side) ──
      // For frame 0: tentacles straight/spread outward
      // For frame 1: tentacles curled inward slightly
      const curl = frame === 1 ? 2 : 0;

      ctx.fillStyle = tentacleCol;

      if (frame === 0) {
        // --- Frame 0: tentacles spread ---

        // Left side tentacles (at x=9,11,13,15 going down)
        // Tentacle L1 (outermost left)
        ctx.fillRect(ox + 7,  14, 2, 5);
        ctx.fillRect(ox + 6,  18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 5,  21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle L2
        ctx.fillRect(ox + 9,  14, 2, 5);
        ctx.fillRect(ox + 8,  18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 7,  21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle L3
        ctx.fillRect(ox + 11, 14, 2, 5);
        ctx.fillRect(ox + 10, 19, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 9,  22, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle L4 (inner left)
        ctx.fillRect(ox + 13, 14, 2, 4);
        ctx.fillRect(ox + 12, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 11, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Right side tentacles (mirrored at x=17,19,21,23)
        // Tentacle R1 (inner right)
        ctx.fillRect(ox + 17, 14, 2, 4);
        ctx.fillRect(ox + 18, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 19, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle R2
        ctx.fillRect(ox + 19, 14, 2, 5);
        ctx.fillRect(ox + 20, 19, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 21, 22, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle R3
        ctx.fillRect(ox + 21, 14, 2, 5);
        ctx.fillRect(ox + 22, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 23, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle R4 (outermost right)
        ctx.fillRect(ox + 23, 14, 2, 5);
        ctx.fillRect(ox + 24, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 25, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

      } else {
        // --- Frame 1: tentacles curled inward ---

        // Left side tentacles curled right (+curl)
        // Tentacle L1
        ctx.fillRect(ox + 7,  14, 2, 4);
        ctx.fillRect(ox + 8,  17, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 9,  20, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle L2
        ctx.fillRect(ox + 9,  14, 2, 4);
        ctx.fillRect(ox + 10, 17, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 11, 20, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle L3
        ctx.fillRect(ox + 11, 14, 2, 4);
        ctx.fillRect(ox + 12, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 12, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle L4 (inner left)
        ctx.fillRect(ox + 13, 14, 2, 4);
        ctx.fillRect(ox + 13, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 13, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Right side tentacles curled left (-curl)
        // Tentacle R1 (inner right)
        ctx.fillRect(ox + 17, 14, 2, 4);
        ctx.fillRect(ox + 18, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 18, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle R2
        ctx.fillRect(ox + 19, 14, 2, 4);
        ctx.fillRect(ox + 19, 18, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 19, 21, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle R3
        ctx.fillRect(ox + 21, 14, 2, 4);
        ctx.fillRect(ox + 20, 17, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 19, 20, 2, 2);
        ctx.fillStyle = tentacleCol;

        // Tentacle R4 (outermost right)
        ctx.fillRect(ox + 23, 14, 2, 4);
        ctx.fillRect(ox + 22, 17, 2, 3);
        ctx.fillStyle = tentacleTip;
        ctx.fillRect(ox + 21, 20, 2, 2);
        ctx.fillStyle = tentacleCol;
      }
    }

    return canvas;
  }

  loadAnimations() {
    const canvas = this._createSprite();

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

    this.addAnimation('idle', sheetData, ANIM_SPEED_IDLE + 60);
    this.addAnimation('walk', sheetData, 280);
    this.setAnimation('idle');
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
    this.hpBarMesh.position.set(this.x, -this.y + 1.4, 0.5 + this.y * 0.001);
  }

  update(dt, playerX, playerY) {
    // Support both (dt, playerX, playerY) and (dt, player, tileMap) call signatures
    let px, py, player, tileMap;
    if (typeof playerX === 'object' && playerX !== null) {
      // Called as update(dt, player, tileMap)
      player = playerX;
      tileMap = playerY;
      px = player.x;
      py = player.y;
    } else {
      px = playerX;
      py = playerY;
      player = { x: px, y: py, takeDamage: () => {} };
      tileMap = null;
    }

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

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this._inkCooldown > 0) this._inkCooldown -= dt;

    const distToPlayer = distance(this.x, this.y, px, py);

    switch (this.aiState) {
      case 'idle':
        this._doIdle(dt, distToPlayer);
        break;
      case 'chase':
        this._doChase(dt, px, py, distToPlayer, tileMap);
        break;
      case 'attack':
        this._doAttack(dt, player, px, py, distToPlayer);
        break;
    }

    this._updateHpBar();
    super.update(dt);
  }

  _doIdle(dt, distToPlayer) {
    this.setAnimation('idle');

    if (distToPlayer < this.detectionRange) {
      this.aiState = 'chase';
      if (window.__game?.audio) window.__game.audio.playMobAlert?.();
      return;
    }

    // Random drift — octopus floats slowly
    this._driftTimer += dt;
    if (this._driftTimer >= this._driftChangetime) {
      this._driftTimer = 0;
      this._driftChangetime = 4 + Math.random() * 2;
      // Pick a new random drift direction
      const angle = Math.random() * Math.PI * 2;
      this._driftDirX = Math.cos(angle);
      this._driftDirY = Math.sin(angle);
    }

    const driftSpeed = 0.6;
    const newX = this.x + this._driftDirX * driftSpeed * dt;
    const newY = this.y + this._driftDirY * driftSpeed * dt;

    // Stay near spawn point
    if (distance(newX, newY, this.spawnX, this.spawnY) < 4) {
      this.x = newX;
      this.y = newY;
    } else {
      // Drift back toward spawn
      const toSpawnX = this.spawnX - this.x;
      const toSpawnY = this.spawnY - this.y;
      const len = Math.sqrt(toSpawnX * toSpawnX + toSpawnY * toSpawnY);
      if (len > 0) {
        this._driftDirX = toSpawnX / len;
        this._driftDirY = toSpawnY / len;
      }
    }

    // Flip sprite based on drift direction
    if (this.activeSprite) {
      this.activeSprite.flipX(this._driftDirX < 0);
    }
  }

  _doChase(dt, px, py, distToPlayer, tileMap) {
    if (distToPlayer > this.detectionRange * 1.5) {
      this.aiState = 'idle';
      return;
    }

    if (distToPlayer < 2.0) {
      this.aiState = 'attack';
      return;
    }

    this.setAnimation('walk');

    const dx = px - this.x;
    const dy = py - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const nx = dx / len;
      const ny = dy / len;
      const moveX = nx * this.speed * dt;
      const moveY = ny * this.speed * dt;

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

  _doAttack(dt, player, px, py, distToPlayer) {
    if (distToPlayer > 3.0) {
      this.aiState = 'chase';
      return;
    }

    this.setAnimation('idle');

    // Contact damage
    if (this.attackCooldown <= 0) {
      if (typeof player.takeDamage === 'function') {
        player.takeDamage(this.def.damage);
      }
      this.attackCooldown = 1.2;
    }

    // Ink spray when close enough and cooldown expired
    if (distToPlayer < 2.0 && this._inkCooldown <= 0) {
      this._sprayInk();
      this._inkCooldown = 5.0;
    }
  }

  /**
   * Create a dark ink overlay on the document that simulates vision being obscured.
   * Fades out over 2 seconds.
   */
  _sprayInk() {
    const overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'background:rgba(20,0,30,0.6)',
      'pointer-events:none',
      'z-index:150',
      'transition:none',
    ].join(';');

    document.body.appendChild(overlay);

    // Gradually reduce opacity over 2 seconds
    const duration = 2000;
    const startTime = performance.now();
    const startOpacity = 0.6;

    const fade = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const opacity = startOpacity * (1 - progress);

      overlay.style.background = `rgba(20,0,30,${opacity.toFixed(3)})`;

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }
    };

    requestAnimationFrame(fade);
  }

  takeDamage(amount) {
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
    this._inkCooldown = 0;
    this.attackCooldown = 0;
    this._driftTimer = 0;
    this._driftChangetime = 4 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;
    this._driftDirX = Math.cos(angle);
    this._driftDirY = Math.sin(angle);

    for (const sprite of Object.values(this.sprites)) {
      sprite.mesh.visible = false;
    }
    if (this.sprites['idle']) {
      this.activeSprite = this.sprites['idle'];
      this.activeSprite.mesh.visible = true;
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
