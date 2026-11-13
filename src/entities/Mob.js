import * as THREE from 'three';
import { Entity } from './Entity.js';
import { distance } from '../utils/MathUtils.js';
import { ANIM_SPEED_IDLE, MOB_RESPAWN_SECONDS } from '../utils/Constants.js';
import { loadCuteFantasyEnemy, loadSlimeAnims } from '../utils/SpriteSheetLoader.js';
import { blinkVisible } from '../utils/Blink.js';

/**
 * Enemy mob with simple AI: Idle → Chase → Attack → Death.
 * Mob idle sprites are 32×32 (4 frames), single direction.
 */
export class Mob extends Entity {
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

    this.aiState = 'idle'; // idle, chase, attack, dead, respawning
    this.attackCooldown = 0;
    this.hitFlashTimer = 0;
    this.deathTimer = 0;
    this.respawnTimer = 0;
    this.idleWanderTimer = 0;
    this.wanderDx = 0;
    this.wanderDy = 0;
    this.alive = true;

    // HP bar (canvas)
    this.hpBarMesh = null;
    this.hpBarCanvas = null;
    this.hpBarCtx = null;
    this.showHpBar = false;
  }

  async loadAnimations(assetLoader) {
    const spriteType = this.def.spriteType || 'slime';
    const tintColor = this.def.tint ? new THREE.Color(this.def.tint[0], this.def.tint[1], this.def.tint[2]) : null;

    if (spriteType === 'skeleton') {
      // Cute_Fantasy Skeleton — same layout as Player (192x320, 32x32, 6 cols x 10 rows)
      try {
        const base = import.meta.env.BASE_URL || '/';
        const anims = await loadCuteFantasyEnemy(`${base}Cute_Fantasy_Free/Enemies/Skeleton.png`);
        this.addAnimation('idle', anims.idle_down, ANIM_SPEED_IDLE + 20, tintColor);
        if (anims.walk_down) this.addAnimation('run', anims.walk_down, 100, tintColor);
        if (anims.death) this.addAnimation('death', anims.death, 150, tintColor);
        this.setAnimation('idle');
      } catch (e) {
        console.warn(`Skeleton mob failed to load:`, e);
      }
    } else {
      // Slime — 512x192, 64x64 frames
      // Row 0: Idle (4 frames), Row 1: Move (8 frames), Row 2: Attack+Hurt+Death
      try {
        const anims = await loadSlimeAnims(); // cached image + cached row extraction
        this.addAnimation('idle', anims.idle, ANIM_SPEED_IDLE + 40, tintColor);
        this.addAnimation('run', anims.run, 100, tintColor);
        // Row 2 has mixed: first 4 = attack, rest = hurt/death
        this.addAnimation('death', anims.death, 150, tintColor);
        this.setAnimation('idle');
      } catch (e) {
        console.warn(`Slime mob failed to load:`, e);
      }
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

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    // HP fill
    const pct = this.hp / this.maxHp;
    ctx.fillStyle = pct > 0.5 ? '#44cc44' : pct > 0.25 ? '#ccaa00' : '#cc3333';
    ctx.fillRect(1, 1, (w - 2) * pct, h - 2);

    this.hpBarMesh.material.map.needsUpdate = true;
    this.hpBarMesh.position.set(this.x, -this.y + 1.5, 0.5 + this.y * 0.001);
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
        this.respawnTimer = this.respawnTime || MOB_RESPAWN_SECONDS; // per-spawn or default 3 min
      }
      return;
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.activeSprite) {
        this.activeSprite.mesh.visible = blinkVisible(this.hitFlashTimer, 10);
      }
    }

    // Attack cooldown
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const distToPlayer = distance(this.x, this.y, player.x, player.y);

    switch (this.aiState) {
      case 'idle':
        this._doIdle(dt, distToPlayer);
        break;
      case 'chase':
        this._doChase(dt, player, distToPlayer, tileMap);
        break;
      case 'attack':
        this._doAttack(dt, player, distToPlayer);
        break;
    }

    this._updateHpBar();
    super.update(dt);
  }

  _doIdle(dt, distToPlayer) {
    this.setAnimation('idle');

    // Gentle idle hop: squash-and-stretch bounce (slimes feel alive)
    this._idleHopT = (this._idleHopT ?? Math.random() * Math.PI * 2) + dt * 2.6;
    if (this.activeSprite?.mesh) {
      const hop = Math.abs(Math.sin(this._idleHopT));
      const m = this.activeSprite.mesh;
      const signX = m.scale.x < 0 ? -1 : 1;
      m.scale.y = 1 + hop * 0.07;
      m.scale.x = signX * (1 - hop * 0.05);
    }
    if (distToPlayer < this.detectionRange) {
      this.aiState = 'chase';
      if (window.__game?.audio) window.__game.audio.playMobAlert();
      return;
    }

    // Random wander
    this.idleWanderTimer -= dt;
    if (this.idleWanderTimer <= 0) {
      this.wanderDx = (Math.random() - 0.5) * 0.5;
      this.wanderDy = (Math.random() - 0.5) * 0.5;
      this.idleWanderTimer = 2 + Math.random() * 3;
    }

    const wx = this.x + this.wanderDx * dt;
    const wy = this.y + this.wanderDy * dt;
    // Stay near spawn
    if (distance(wx, wy, this.spawnX, this.spawnY) < 3) {
      this.x = wx;
      this.y = wy;
    }
  }

  _resetIdleHop() {
    if (this.activeSprite?.mesh) {
      const m = this.activeSprite.mesh;
      const signX = m.scale.x < 0 ? -1 : 1;
      m.scale.y = 1;
      m.scale.x = signX;
    }
  }

  _doChase(dt, player, distToPlayer, tileMap) {
    this._resetIdleHop();
    if (distToPlayer > this.detectionRange * 1.5) {
      this.aiState = 'idle';
      return;
    }

    if (distToPlayer < 1.2) {
      this.aiState = 'attack';
      return;
    }

    this.setAnimation(this.sprites['run'] ? 'run' : 'idle');

    // Move toward player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      this.x += (dx / len) * this.speed * dt;
      this.y += (dy / len) * this.speed * dt;

      // Flip based on direction
      if (this.activeSprite) {
        this.activeSprite.flipX(dx < 0);
      }
    }
  }

  _doAttack(dt, player, distToPlayer) {
    this._resetIdleHop();
    if (distToPlayer > 2) {
      this.aiState = 'chase';
      return;
    }

    this.setAnimation('idle');

    if (this.attackCooldown <= 0) {
      player.takeDamage(this.damage);
      this.attackCooldown = 1.5;
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    this.hitFlashTimer = 0.4;

    // White flash: briefly set material color to white for impact feel
    this._applyHitFlash();

    if (this.hp <= 0) {
      this.die();
    }
  }

  // _applyHitFlash() inherited from Entity

  die() {
    this.alive = false;
    this.aiState = 'dead';
    this.deathTimer = 1; // quick death animation

    if (this.sprites['death']) {
      this.setAnimation('death');
      if (this.activeSprite) {
        this.activeSprite.loop = false;
      }
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
