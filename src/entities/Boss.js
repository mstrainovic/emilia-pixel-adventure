import * as THREE from 'three';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss base class — shared logic for all 3 boss encounters.
 * Subclasses must implement:
 *   _createBossCanvas() — returns 64x32 canvas with 4 frames (32x32 each)
 *   _executePhasePattern(dt, phase, player, tileMap) — phase-specific AI
 *   _drawTelegraph(dt) — visual telegraph before attack
 *
 * Boss design principles:
 *   - Clear telegraphing (2-3s warning before attacks)
 *   - No frustration: pet helps, boss keeps damage on player death
 *   - Kid-friendly: generous dodge windows, predictable patterns
 */
export class Boss {
  constructor(bossType, bossDef, x, y) {
    this.bossType = bossType;
    this.def = bossDef;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.hp = bossDef.hp;
    this.maxHp = bossDef.hp;
    this.speed = bossDef.speed;
    this.xp = bossDef.xp;
    this.drops = bossDef.drops || [];
    this.alive = true;
    this.defeated = false; // permanent — does not respawn

    // Phase management
    this.phases = bossDef.phases || [];
    this.currentPhaseIndex = 0;
    this._updateCurrentPhase();

    // AI states: idle, telegraphing, attacking, cooldown, defeated
    this.aiState = 'idle';
    this.attackCooldown = 0;
    this.telegraphTimer = 0;
    this.telegraphTarget = null; // { x, y } where attack will land

    // Visual
    this.mesh = null;
    this.texture = null;
    this._animFrame = 0;
    this._animTimer = 0;
    this._animSpeed = 200; // ms per frame
    this.hitFlashTimer = 0;
    this.deathTimer = 0;

    // Telegraph indicator mesh
    this._telegraphMesh = null;

    // Damage tracking for "untouchable" achievement
    this.playerDamageTaken = 0;

    // Direction facing (for sprite flip)
    this.facingLeft = false;
  }

  _updateCurrentPhase() {
    const hpPct = this.hp / this.maxHp;
    // Phases ordered: index 0 = Phase 1 (threshold 1.0), index 1 = Phase 2 (threshold 0.6), etc.
    // Highest qualifying index wins (last phase whose threshold >= hpPct).
    let bestPhase = 0;
    for (let i = 0; i < this.phases.length; i++) {
      if (hpPct <= this.phases[i].hpThreshold) {
        bestPhase = i;
      }
    }
    if (this.currentPhaseIndex !== bestPhase) {
      this.currentPhaseIndex = bestPhase;
      this._onPhaseChange(bestPhase);
    }
  }

  get currentPhase() {
    return this.phases[this.currentPhaseIndex] || this.phases[0];
  }

  /**
   * Called when boss transitions to a new phase.
   * Override in subclasses for phase-specific effects (screen shake, flash, etc.)
   */
  _onPhaseChange(phaseIndex) {
    // Play a brief telegraph to signal phase change
    this.aiState = 'cooldown';
    this.attackCooldown = 1.5; // brief pause before new pattern
  }

  /**
   * Create sprite. Subclasses override _createBossCanvas() to draw their own.
   */
  createSprite(scene) {
    const canvas = this._createBossCanvas();
    if (!canvas) return;

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

    const fw = canvas.height; // frame is square (32x32 or 64x64)
    const worldSize = fw / 16; // scale to tile units (32px = 2 tiles, 64px = 4 tiles)
    const geo = new THREE.PlaneGeometry(worldSize, worldSize);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.texture = clonedTex;
    this._baseTexture = texture;

    scene.add(this.mesh);

    // Create telegraph indicator (semi-transparent red circle)
    this._createTelegraphMesh(scene);
  }

  _createTelegraphMesh(scene) {
    const geo = new THREE.PlaneGeometry(3, 3);
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Red warning circle
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Exclamation mark
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.fillRect(14, 6, 4, 14);
    ctx.fillRect(14, 22, 4, 4);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });

    this._telegraphMesh = new THREE.Mesh(geo, mat);
    this._telegraphMesh.visible = false;
    scene.add(this._telegraphMesh);
  }

  /**
   * Must be overridden by subclass.
   * @returns {HTMLCanvasElement} 128x32 canvas (4 frames of 32x32)
   */
  _createBossCanvas() {
    throw new Error('Boss subclass must implement _createBossCanvas()');
  }

  update(dt, player, tileMap) {
    if (this.defeated) return;

    if (this.aiState === 'death_anim') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.defeated = true;
        if (this.mesh) this.mesh.visible = false;
        if (this._telegraphMesh) this._telegraphMesh.visible = false;
      }
      return;
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.mesh) {
        this.mesh.visible = Math.floor(this.hitFlashTimer * 10) % 2 === 0;
      }
    }

    // Cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= 0 && this.aiState === 'cooldown') {
        this.aiState = 'idle';
      }
    }

    // Animation
    this._animTimer += dt * 1000;
    if (this._animTimer >= this._animSpeed) {
      this._animTimer -= this._animSpeed;
      this._animFrame = (this._animFrame + 1) % 4;
      if (this.texture) {
        this.texture.offset.x = this._animFrame * 0.25;
      }
    }

    // Phase check
    this._updateCurrentPhase();

    const distToPlayer = distance(this.x, this.y, player.x, player.y);

    // AI state machine
    switch (this.aiState) {
      case 'idle':
        this._doIdle(dt, player, distToPlayer, tileMap);
        break;
      case 'telegraphing':
        this._doTelegraph(dt, player);
        break;
      case 'attacking':
        this._doAttack(dt, player, tileMap);
        break;
      case 'cooldown':
        // Just wait for cooldown timer
        break;
    }

    // Update mesh position
    if (this.mesh) {
      this.mesh.position.set(this.x, -this.y, 0.3 + this.y * 0.001);
      // Flip sprite based on facing
      this.mesh.scale.x = this.facingLeft ? -Math.abs(this.mesh.scale.x || 1) : Math.abs(this.mesh.scale.x || 1);
    }
  }

  _doIdle(dt, player, distToPlayer, tileMap) {
    // Face player
    this.facingLeft = player.x < this.x;

    // Detection range — bosses always aware in their arena
    if (distToPlayer < 15) {
      // Move toward player slowly
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 2) {
        const spd = this.speed * (this.currentPhase.speedMultiplier || 1.0);
        this.x += (dx / len) * spd * 0.5 * dt;
        this.y += (dy / len) * spd * 0.5 * dt;
      }

      // Start telegraph when in range and cooldown done
      if (this.attackCooldown <= 0 && distToPlayer < 8) {
        this.aiState = 'telegraphing';
        this.telegraphTimer = this.currentPhase.telegraphDuration || 2.0;
        this.telegraphTarget = { x: player.x, y: player.y };
        if (this._telegraphMesh) {
          this._telegraphMesh.visible = true;
          this._telegraphMesh.position.set(player.x, -player.y, 0.05);
        }
      }
    }
  }

  _doTelegraph(dt, player) {
    this.telegraphTimer -= dt;

    // Pulse the telegraph indicator
    if (this._telegraphMesh && this._telegraphMesh.visible) {
      const pulse = 0.8 + Math.sin(this.telegraphTimer * 8) * 0.2;
      this._telegraphMesh.scale.set(pulse, pulse, 1);
      this._telegraphMesh.position.set(
        this.telegraphTarget.x, -this.telegraphTarget.y, 0.05
      );
    }

    if (this.telegraphTimer <= 0) {
      this.aiState = 'attacking';
      if (this._telegraphMesh) this._telegraphMesh.visible = false;
      // Subclass handles actual attack in _executePhasePattern
    }
  }

  _doAttack(dt, player, tileMap) {
    // Delegate to subclass
    this._executePhasePattern(dt, this.currentPhase, player, tileMap);

    // After attack, enter cooldown
    this.aiState = 'cooldown';
    this.attackCooldown = this.currentPhase.attackCooldown || 2.0;
  }

  /**
   * Override in subclass for phase-specific attack behavior.
   */
  _executePhasePattern(dt, phase, player, tileMap) {
    // Default: melee hit if close
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 2.5) {
      player.takeDamage(phase.damage || 8);
      this.playerDamageTaken += phase.damage || 8;
    }
  }

  takeDamage(amount) {
    if (!this.alive || this.defeated) return;

    this.hp -= amount;
    this.hitFlashTimer = 0.4;

    // White flash for impact feel
    this._applyHitFlash();

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  /**
   * Flash the boss mesh white for 100ms, then restore original color.
   */
  _applyHitFlash() {
    if (!this.mesh || !this.mesh.material) return;
    const mat = this.mesh.material;
    const origColor = mat.color ? mat.color.clone() : null;
    if (!mat.color) return;
    mat.color.setHex(0xffffff);
    if (this._hitFlashTimeout) clearTimeout(this._hitFlashTimeout);
    this._hitFlashTimeout = setTimeout(() => {
      if (origColor) mat.color.copy(origColor);
      this._hitFlashTimeout = null;
    }, 100);
  }

  die() {
    this.alive = false;
    this.aiState = 'death_anim';
    this.deathTimer = 1.5; // longer death animation for bosses

    if (this._telegraphMesh) this._telegraphMesh.visible = false;
  }

  /**
   * Load persisted HP (boss keeps damage across player deaths).
   */
  loadPersistedHp(hp) {
    if (typeof hp === 'number' && hp > 0) {
      this.hp = hp;
      this._updateCurrentPhase();
    }
  }

  getState() {
    return {
      hp: this.hp,
      defeated: this.defeated,
      playerDamageTaken: this.playerDamageTaken,
    };
  }

  dispose(scene) {
    if (this.mesh && scene) {
      scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      if (this.texture) this.texture.dispose();
      if (this._baseTexture) this._baseTexture.dispose();
    }
    if (this._telegraphMesh && scene) {
      scene.remove(this._telegraphMesh);
      this._telegraphMesh.geometry.dispose();
      this._telegraphMesh.material.map.dispose();
      this._telegraphMesh.material.dispose();
    }
  }
}
