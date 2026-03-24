import * as THREE from 'three';
import { Entity } from './Entity.js';
import { distance } from '../utils/MathUtils.js';
import { ANIM_SPEED_IDLE } from '../utils/Constants.js';

/**
 * Crab enemy with canvas-drawn sprites and sideways movement.
 * AI states: idle (sideways wander), chase (diagonal), flee (crab_beach only),
 * attack (1.5 tile range), dead, respawning.
 *
 * Compatible with CombatSystem: exposes .alive, .def, .hp, .damage etc.
 */
export class Crab extends Entity {
  constructor(mobType, mobDef, x, y) {
    super();
    this.mobType = mobType;
    this.def = mobDef;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.hp = mobDef.hp;
    this.maxHp = mobDef.hp;
    this.damage = mobDef.damage;
    this.speed = mobDef.speed;
    this.detectionRange = mobDef.detectionRange;
    this.drops = mobDef.drops;
    this.xp = mobDef.xp;

    this.aiState = 'idle'; // idle, chase, flee, attack, dead, respawning
    this.attackCooldown = 0;
    this.hitFlashTimer = 0;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.alive = true;

    // Idle sideways wander — crabs move side to side
    this.sidewaysTimer = 0;
    this.sidewaysDir = (Math.random() < 0.5) ? -1 : 1; // -1 = left, 1 = right
    this.sidewaysDirTimer = 3 + Math.random() * 2;

    // Flee state (crab_beach only: flee when damaged)
    this.fleeTimer = 0;

    // HP bar
    this.hpBarMesh = null;
    this.hpBarCanvas = null;
    this.hpBarCtx = null;
    this.showHpBar = false;
  }

  /**
   * Create and return a 64x16 canvas spritesheet with 4 frames of 16x16 crab.
   * Uses def.tint [r,g,b] for color variation (default is red/orange).
   */
  _createCrabCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // Base color from tint or default red-orange crab
    let baseR = 210, baseG = 80, baseB = 30;
    if (this.def.tint) {
      // tint is [r,g,b] multipliers (e.g. [0.6, 0.4, 0.2] for coconut crab)
      baseR = Math.round(220 * this.def.tint[0]);
      baseG = Math.round(130 * this.def.tint[1]);
      baseB = Math.round(60  * this.def.tint[2]);
    }

    const toHex = (r, g, b) => {
      const clamp = v => Math.max(0, Math.min(255, v));
      return '#' + [clamp(r), clamp(g), clamp(b)]
        .map(v => v.toString(16).padStart(2, '0'))
        .join('');
    };

    const bodyColor  = toHex(baseR,          baseG,          baseB);
    const shellColor = toHex(baseR - 20,      baseG - 10,     baseB - 5);
    const clawColor  = toHex(baseR + 20,      baseG + 10,     baseB + 5);
    const legColor   = toHex(baseR - 10,      baseG - 5,      baseB);
    const darkColor  = toHex(baseR - 50,      baseG - 30,     baseB - 20);

    // Draw 4 frames — each 16x16 pixels starting at x = frame*16
    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 16; // x-offset for this frame

      // Leg animation offset: frames 0,2 = legs up slightly; frames 1,3 = legs down
      const legOff = (frame % 2 === 0) ? 0 : 1;
      // Claw animation: alternate open/close feel via clawOffset
      const clawOff = (frame % 2 === 0) ? 0 : 1;

      // ── Oval body (center 7x5 at y=5..9) ──
      ctx.fillStyle = bodyColor;
      ctx.fillRect(ox + 4, 5, 8, 5);   // main oval
      ctx.fillRect(ox + 3, 6, 10, 3);  // wider middle row
      ctx.fillStyle = shellColor;
      ctx.fillRect(ox + 5, 5, 6, 1);   // top highlight line
      ctx.fillStyle = darkColor;
      ctx.fillRect(ox + 4, 9, 8, 1);   // bottom shadow
      // Shell ridge line
      ctx.fillStyle = shellColor;
      ctx.fillRect(ox + 7, 6, 2, 4);   // center ridge

      // ── Eyes (white + black pupil, on top of body) ──
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 4, 4, 2, 2);   // left eye white
      ctx.fillRect(ox + 10, 4, 2, 2);  // right eye white
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 5, 4, 1, 1);   // left pupil
      ctx.fillRect(ox + 11, 4, 1, 1);  // right pupil

      // ── Left claw (x=1..3, varies with animation) ──
      ctx.fillStyle = clawColor;
      ctx.fillRect(ox + 1,              6 - clawOff, 3, 2); // claw arm
      ctx.fillRect(ox + 0,              5 - clawOff, 2, 2); // upper pincer
      ctx.fillRect(ox + 0,              7 - clawOff + clawOff, 2, 2); // lower pincer
      ctx.fillStyle = darkColor;
      ctx.fillRect(ox + 0,              6 - clawOff + clawOff, 1, 1); // claw gap

      // ── Right claw (x=12..15, mirror of left) ──
      ctx.fillStyle = clawColor;
      ctx.fillRect(ox + 12,             6 - clawOff, 3, 2); // claw arm
      ctx.fillRect(ox + 14,             5 - clawOff, 2, 2); // upper pincer
      ctx.fillRect(ox + 14,             7 - clawOff + clawOff, 2, 2); // lower pincer
      ctx.fillStyle = darkColor;
      ctx.fillRect(ox + 15,             6 - clawOff + clawOff, 1, 1); // claw gap

      // ── 3 legs per side (below body, y=10..12) ──
      ctx.fillStyle = legColor;
      // Left legs at x=3,4,5
      ctx.fillRect(ox + 3, 10 + legOff, 1, 3);
      ctx.fillRect(ox + 5, 10,          1, 2 + legOff);
      ctx.fillRect(ox + 6, 11,          1, 2);
      // Right legs at x=10,11,12
      ctx.fillRect(ox + 12, 10 + legOff, 1, 3);
      ctx.fillRect(ox + 10, 10,           1, 2 + legOff);
      ctx.fillRect(ox + 9,  11,           1, 2);
    }

    return canvas;
  }

  loadAnimations() {
    const canvas = this._createCrabCanvas();

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
      case 'flee':
        this._doFlee(dt, player, distToPlayer, tileMap);
        break;
      case 'attack':
        this._doAttack(dt, player, distToPlayer);
        break;
    }

    this._updateHpBar();
    super.update(dt);
  }

  _doIdle(dt, distToPlayer, tileMap) {
    this.setAnimation('idle');

    if (distToPlayer < this.detectionRange) {
      this.aiState = 'chase';
      if (window.__game?.audio) window.__game.audio.playMobAlert?.();
      return;
    }

    // Sideways wander — crabs scuttle left/right
    this.sidewaysDirTimer -= dt;
    if (this.sidewaysDirTimer <= 0) {
      this.sidewaysDir *= -1; // reverse direction
      this.sidewaysDirTimer = 3 + Math.random() * 2;
    }

    const newX = this.x + this.sidewaysDir * this.speed * 0.4 * dt;
    const newY = this.y + (Math.random() - 0.5) * 0.1 * dt; // tiny vertical drift

    // Stay near spawn and check collision
    if (
      distance(newX, newY, this.spawnX, this.spawnY) < 4 &&
      tileMap && !tileMap.isBlocked(newX, newY)
    ) {
      this.x = newX;
      this.y = newY;
    } else {
      // Bounce back toward spawn
      this.sidewaysDir *= -1;
      this.sidewaysDirTimer = 1.5;
    }

    // Flip sprite based on sideways direction
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

    // Crabs move diagonally — combine sideways (dominant) with forward movement
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      // Bias toward sideways movement (crabs naturally scuttle sideways)
      const nx = dx / len;
      const ny = dy / len;
      // Apply 1.3x weight to horizontal component to reinforce sideways feel
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

      // Flip sprite based on horizontal movement direction
      if (this.activeSprite) {
        this.activeSprite.flipX(dx < 0);
      }
    }
  }

  _doFlee(dt, player, distToPlayer, tileMap) {
    this.fleeTimer -= dt;
    if (this.fleeTimer <= 0 || distToPlayer > this.detectionRange * 2) {
      this.aiState = 'idle';
      return;
    }

    this.setAnimation('walk');

    // Move directly away from player
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const nx = dx / len;
      const ny = dy / len;
      const fleeSpeed = this.speed * 1.5;

      const newX = this.x + nx * fleeSpeed * dt;
      const newY = this.y + ny * fleeSpeed * dt;

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
      this.attackCooldown = 1.0; // 1s cooldown (faster than Mob's 1.5s)
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    this.hitFlashTimer = 0.4;

    // crab_beach crabs flee when damaged
    if (this.mobType === 'crab_beach' && this.aiState !== 'dead') {
      this.aiState = 'flee';
      this.fleeTimer = 2.0;
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.aiState = 'dead';
    this.deathTimer = 0.8;

    // Play death as a frozen last frame
    if (this.activeSprite) {
      this.activeSprite.playing = false;
    }

    return this.drops;
  }

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
    this.fleeTimer = 0;
    this.sidewaysDir = (Math.random() < 0.5) ? -1 : 1;
    this.sidewaysDirTimer = 3 + Math.random() * 2;

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
