import { Boss } from './Boss.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss 2: Tiefsee-Leviathan — Grotto boss after all M5 quests.
 * 180 HP, tentacle slam + ink AoE, 2 phases.
 * Canvas-drawn 256x64 spritesheet (4 frames of 64x64 — larger boss).
 *
 * Phase 1 (>50% HP): 2 tentacle slams (sequential, predictable)
 * Phase 2 (<50% HP): tentacles + ink AoE cloud, faster
 */
export class Leviathan extends Boss {
  constructor(bossDef, x, y) {
    super('leviathan', bossDef, x, y);
    this._tentacleHitboxes = []; // active tentacle slam zones
    this._inkCloud = null;       // active ink AoE
  }

  _createBossCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // 4 frames x 64px
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 64;
      const tentWave = Math.sin(frame * Math.PI / 2) * 2;

      // ── Body (dark purple-blue oval) ──
      ctx.fillStyle = '#2A1A4A';
      ctx.fillRect(ox + 16, 10, 32, 30);
      ctx.fillRect(ox + 14, 14, 36, 22);
      ctx.fillRect(ox + 12, 18, 40, 14);

      // Lighter belly
      ctx.fillStyle = '#4A3A6A';
      ctx.fillRect(ox + 20, 18, 24, 14);

      // ── Eye (single, large, glowing) ──
      ctx.fillStyle = '#00FFAA';
      ctx.fillRect(ox + 26, 14, 12, 8);
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(ox + 28, 15, 8, 6);
      // Pupil
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 30, 16, 4, 4);
      // Glow
      ctx.fillStyle = 'rgba(0, 255, 170, 0.3)';
      ctx.fillRect(ox + 24, 12, 16, 12);

      // ── Tentacles (4 on each side, wavy) ──
      ctx.fillStyle = '#3A2A5A';
      // Left tentacles
      for (let t = 0; t < 4; t++) {
        const ty = 32 + t * 6 + Math.floor(tentWave * (t % 2 === 0 ? 1 : -1));
        ctx.fillRect(ox + 4 + t * 2, ty, 12 - t * 2, 4);
        ctx.fillRect(ox + 2 + t, ty + 3, 8, 3);
      }
      // Right tentacles
      for (let t = 0; t < 4; t++) {
        const ty = 32 + t * 6 + Math.floor(tentWave * (t % 2 === 0 ? -1 : 1));
        ctx.fillRect(ox + 48 - t * 2, ty, 12 - t * 2, 4);
        ctx.fillRect(ox + 54 - t, ty + 3, 8, 3);
      }

      // Tentacle suckers
      ctx.fillStyle = '#5A4A7A';
      for (let t = 0; t < 3; t++) {
        ctx.fillRect(ox + 8 + t * 3, 34 + t * 6, 2, 2);
        ctx.fillRect(ox + 52 - t * 3, 34 + t * 6, 2, 2);
      }

      // ── Crown of spines ──
      ctx.fillStyle = '#4A2A6A';
      ctx.fillRect(ox + 22, 6, 3, 6);
      ctx.fillRect(ox + 28, 4, 3, 8);
      ctx.fillRect(ox + 34, 6, 3, 6);
      ctx.fillRect(ox + 40, 8, 3, 4);
    }

    return canvas;
  }

  _executePhasePattern(dt, phase, player, tileMap) {
    if (phase.pattern === 'tentacle_slam_dual') {
      // 2 tentacle slams at player position and slightly offset
      if (this.telegraphTarget) {
        this._tentacleHitboxes.push({
          x: this.telegraphTarget.x, y: this.telegraphTarget.y,
          radius: 1.5, damage: phase.damage || 10, timer: 0.3,
        });
        this._tentacleHitboxes.push({
          x: this.telegraphTarget.x + 2, y: this.telegraphTarget.y + 1,
          radius: 1.5, damage: phase.damage || 10, timer: 0.6, // delayed
        });
      }
    } else if (phase.pattern === 'tentacle_ink_combo') {
      // Tentacles + ink cloud AoE
      if (this.telegraphTarget) {
        this._tentacleHitboxes.push({
          x: this.telegraphTarget.x, y: this.telegraphTarget.y,
          radius: 1.5, damage: phase.damage || 10, timer: 0.3,
        });
        // Ink cloud AoE at center of arena
        this._inkCloud = {
          x: (this.x + player.x) / 2,
          y: (this.y + player.y) / 2,
          radius: 3.0,
          damage: phase.aoeDamage || 7,
          duration: 2.0,
          tickTimer: 0,
          tickInterval: 0.5,
        };
      }
    }
  }

  update(dt, player, tileMap) {
    super.update(dt, player, tileMap);

    // Update tentacle hitboxes
    for (const tent of this._tentacleHitboxes) {
      tent.timer -= dt;
      if (tent.timer <= 0 && tent.timer > -0.1) {
        // Apply damage at the moment
        if (distance(tent.x, tent.y, player.x, player.y) < tent.radius) {
          player.takeDamage(tent.damage);
          this.playerDamageTaken += tent.damage;
        }
      }
    }
    this._tentacleHitboxes = this._tentacleHitboxes.filter(t => t.timer > -0.5);

    // Update ink cloud
    if (this._inkCloud) {
      this._inkCloud.duration -= dt;
      this._inkCloud.tickTimer += dt;
      if (this._inkCloud.tickTimer >= this._inkCloud.tickInterval) {
        this._inkCloud.tickTimer = 0;
        if (distance(this._inkCloud.x, this._inkCloud.y, player.x, player.y) < this._inkCloud.radius) {
          player.takeDamage(this._inkCloud.damage);
          this.playerDamageTaken += this._inkCloud.damage;
        }
      }
      if (this._inkCloud.duration <= 0) {
        this._inkCloud = null;
      }
    }
  }

  dispose(scene) {
    this._tentacleHitboxes = [];
    this._inkCloud = null;
    super.dispose(scene);
  }
}
