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
      slice: 80, collect: 80, crush: 80, hurt: 120, death: 200,
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

    if (this.state === 'attack' || this.state === 'dead') {
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
    // Game juice callback — set by Game.js
    if (this._onDamage) this._onDamage(amount);
    if (this.hp <= 0) this.die();
  }

  die() {
    this.state = 'dead';
    setTimeout(() => {
      this.hp = this.maxHp;
      this.state = 'idle';
      this.invulnTimer = 2;
      if (this._onDeath) this._onDeath();
    }, 2000);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}
