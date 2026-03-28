import { Entity } from './Entity.js';
import { loadCuteFantasyPlayer, NPC_PALETTE_CONFIGS } from '../utils/SpriteSheetLoader.js';
import {
  DIR_DOWN, DIR_UP, DIR_LEFT, DIR_RIGHT,
  PLAYER_SPEED, PLAYER_RUN_SPEED,
  ANIM_SPEED_IDLE, ANIM_SPEED_WALK, ANIM_SPEED_RUN
} from '../utils/Constants.js';

export class Player extends Entity {
  // Cute_Fantasy sprites already include a shadow in the texture
  _createShadow() {}

  updatePosition() {
    const ox = this._attackOffsetX || 0;
    const oy = this._attackOffsetY || 0;
    const z = 0.2 + this.y * 0.001;
    for (const sprite of Object.values(this.sprites)) {
      sprite.setPosition(this.x + ox, this.y + oy, z);
    }
    if (this.shadow) {
      this.shadow.position.set(this.x + ox, -(this.y + oy + 0.8), z - 0.05);
    }
  }

  constructor() {
    super();
    this.direction = DIR_DOWN;
    this.state = 'idle';
    this.hp = 100;
    this.maxHp = 100;
    this.invulnTimer = 0;
    this.hitFlashTimer = 0;
    this.inventory = null;

    // Hitbox at feet area
    this.hitbox = { offsetX: -0.3, offsetY: 0.3, width: 0.6, height: 0.5 };
  }

  async loadAnimations(assetLoader) {
    // Load Cute_Fantasy player sprites with Emilia's colors (black hair, pink dress)
    const emiliaCfg = NPC_PALETTE_CONFIGS.emilia;
    const anims = await loadCuteFantasyPlayer(emiliaCfg);

    // Animation speed mapping
    const speeds = {
      idle: ANIM_SPEED_IDLE, walk: ANIM_SPEED_WALK, run: ANIM_SPEED_RUN,
      slice: 100, collect: 80, crush: 80, hurt: 120, death: 200,
    };

    // Register all loaded animations
    for (const [animKey, sheetData] of Object.entries(anims)) {
      const baseName = animKey.split('_')[0]; // idle, walk, run, slice, etc.
      const speed = speeds[baseName] || 150;
      this.addAnimation(animKey, sheetData, speed);
    }

    this.setAnimation('idle_down');
  }

  update(dt, inputManager, tileMap) {
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.activeSprite) {
        this.activeSprite.mesh.visible = Math.floor(this.hitFlashTimer * 10) % 2 === 0;
      }
    }

    if (this.state === 'attack') {
      // Keep Emilia visible with her facing idle sprite (no slice swap)
      const dirKey = (this.direction === DIR_LEFT || this.direction === DIR_RIGHT) ? 'side' : this.direction;
      const idleAnim = `idle_${dirKey}`;
      if (this.activeAnim !== idleAnim && this.sprites[idleAnim]) {
        this.setAnimation(idleAnim);
      }
      if (this.activeSprite) {
        this.activeSprite.flipX(this.direction === DIR_LEFT);
      }

      // Subtle lunge — small step forward then back (no sprite deformation)
      if (!this._lungeTimer) this._lungeTimer = 0;
      this._lungeTimer += dt;
      const lungeT = Math.min(1, this._lungeTimer / 0.3);
      const lungeAmount = lungeT < 0.3
        ? (lungeT / 0.3) * 0.25
        : 0.25 * (1 - (lungeT - 0.3) / 0.7);
      const lungeDirs = {
        [DIR_DOWN]: { dx: 0, dy: lungeAmount },
        [DIR_UP]: { dx: 0, dy: -lungeAmount },
        [DIR_LEFT]: { dx: -lungeAmount, dy: 0 },
        [DIR_RIGHT]: { dx: lungeAmount, dy: 0 },
      };
      const lunge = lungeDirs[this.direction] || lungeDirs[DIR_DOWN];
      this._attackOffsetX = lunge.dx;
      this._attackOffsetY = lunge.dy;

      super.update(dt);
      return;
    }
    // Reset attack offsets
    this._attackOffsetX = 0;
    this._attackOffsetY = 0;
    this._lungeTimer = 0;

    if (this.state === 'dead') {
      // Rapid flash during death animation
      if (this._deathFlashTimer > 0) {
        this._deathFlashTimer -= dt;
        if (this.activeSprite) {
          this.activeSprite.mesh.visible = Math.floor(this._deathFlashTimer * 15) % 2 === 0;
        }
      }
      super.update(dt);
      return;
    }

    const mx = inputManager.moveX;
    const my = inputManager.moveY;
    const running = inputManager.isRunning;

    if (mx !== 0 || my !== 0) {
      if (Math.abs(mx) > Math.abs(my)) {
        this.direction = mx > 0 ? DIR_RIGHT : DIR_LEFT;
      } else {
        this.direction = my > 0 ? DIR_DOWN : DIR_UP;
      }
    }

    const baseSpeed = running ? PLAYER_RUN_SPEED : PLAYER_SPEED;
    const speedMult = window.__game?.progression?.getSpeedMultiplier() || 1.0;
    // Unicorn speed boost (decays over time)
    if (this._unicornSpeedBoost > 0) {
      this._unicornSpeedBoost -= dt;
    }
    const unicornBoost = this._unicornSpeedBoost > 0 ? 1.5 : 1.0;
    const speed = baseSpeed * speedMult * unicornBoost;
    let dx = mx * speed * dt;
    let dy = my * speed * dt;

    if (mx !== 0 && my !== 0) {
      const f = 1 / Math.sqrt(2);
      dx *= f;
      dy *= f;
    }

    if (tileMap) {
      const hb = this.hitbox;
      if (dx !== 0 && tileMap.isBlocked(this.x + dx + hb.offsetX, this.y + hb.offsetY, hb.width, hb.height)) dx = 0;
      if (dy !== 0 && tileMap.isBlocked(this.x + dx + hb.offsetX, this.y + dy + hb.offsetY, hb.width, hb.height)) dy = 0;
    }

    this.x += dx;
    this.y += dy;

    if (tileMap) {
      this.x = Math.max(0.5, Math.min(tileMap.width - 0.5, this.x));
      this.y = Math.max(0.5, Math.min(tileMap.height - 0.5, this.y));
    }

    const moving = mx !== 0 || my !== 0;
    this.state = moving ? (running ? 'run' : 'walk') : 'idle';

    const dirKey = (this.direction === DIR_LEFT || this.direction === DIR_RIGHT) ? 'side' : this.direction;
    this.setAnimation(`${this.state}_${dirKey}`);

    if (this.activeSprite) {
      this.activeSprite.flipX(this.direction === DIR_LEFT);
    }

    super.update(dt);
  }

  takeDamage(amount) {
    if (this.invulnTimer > 0 || this.state === 'dead') return;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnTimer = 1.0;
    this.hitFlashTimer = 0.5;

    // White flash on all sprites for impact feel
    this._applyHitFlash();

    // Game juice callback — set by Game.js
    if (this._onDamage) this._onDamage(amount);
    if (this.hp <= 0) this.die();
  }

  // _applyHitFlash() inherited from Entity

  die() {
    this.state = 'dead';
    this._deathFlashTimer = 0.5; // rapid flash on death
    // Notify Game.js immediately — it will handle the death screen & respawn
    if (this._onDeath) this._onDeath();
  }

  /**
   * Called by Game.js when the player should respawn after death screen.
   * Restores HP to 50% and grants brief invulnerability.
   */
  respawn() {
    this.hp = Math.ceil(this.maxHp * 0.5);
    this.state = 'idle';
    this.invulnTimer = 2.0;
    this.hitFlashTimer = 2.0; // flashing during invuln grace period
    this._deathFlashTimer = 0;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}
