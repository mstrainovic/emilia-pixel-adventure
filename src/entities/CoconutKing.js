import { Boss } from './Boss.js';
import { distance } from '../utils/MathUtils.js';

/**
 * Boss 1: Coconut King — Beach boss after all M4 quests.
 * 120 HP, patrol + coconut throw, 2 phases.
 * Canvas-drawn 128x32 spritesheet (4 frames of 32x32).
 *
 * Phase 1 (>60% HP): sideways patrol, single coconut throw
 * Phase 2 (<60% HP): 3-coconut salvo, 1.3x speed
 */
export class CoconutKing extends Boss {
  constructor(bossDef, x, y) {
    super('coconut_king', bossDef, x, y);
    this._projectiles = []; // active coconut projectiles
  }

  _createBossCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // 4 frames x 32px
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 32;
      const bounce = (frame % 2 === 0) ? 0 : 1; // slight bounce

      // ── Crown ──
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(ox + 10, 1 - bounce, 12, 4);
      ctx.fillRect(ox + 12, 0 - bounce, 2, 2);
      ctx.fillRect(ox + 18, 0 - bounce, 2, 2);
      // Gems on crown
      ctx.fillStyle = '#FF4444';
      ctx.fillRect(ox + 15, 1 - bounce, 2, 2);

      // ── Head (round, brown) ──
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(ox + 9, 4 - bounce, 14, 10);
      ctx.fillRect(ox + 8, 6 - bounce, 16, 6);
      // Face
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(ox + 10, 6 - bounce, 12, 6);
      // Eyes (angry)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ox + 11, 7 - bounce, 3, 3);
      ctx.fillRect(ox + 18, 7 - bounce, 3, 3);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(ox + 12, 8 - bounce, 2, 2);
      ctx.fillRect(ox + 19, 8 - bounce, 2, 2);
      // Angry eyebrows
      ctx.fillStyle = '#5C2D0A';
      ctx.fillRect(ox + 11, 6 - bounce, 4, 1);
      ctx.fillRect(ox + 18, 6 - bounce, 4, 1);
      // Mouth
      ctx.fillStyle = '#3E1A00';
      ctx.fillRect(ox + 13, 11 - bounce, 6, 2);

      // ── Body (bulky coconut body) ──
      ctx.fillStyle = '#6B3510';
      ctx.fillRect(ox + 7, 14 - bounce, 18, 12);
      ctx.fillRect(ox + 6, 16 - bounce, 20, 8);
      // Belly stripe
      ctx.fillStyle = '#8B5A30';
      ctx.fillRect(ox + 10, 16 - bounce, 12, 6);

      // ── Arms (holding coconuts) ──
      ctx.fillStyle = '#7B4520';
      // Left arm
      ctx.fillRect(ox + 3, 15 - bounce, 4, 8);
      // Right arm
      ctx.fillRect(ox + 25, 15 - bounce, 4, 8);
      // Coconut in hand (alternating frames)
      if (frame < 2) {
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(ox + 2, 14 - bounce, 4, 4);
      }

      // ── Legs (stubby) ──
      ctx.fillStyle = '#5C2D0A';
      ctx.fillRect(ox + 10, 26 - bounce, 4, 6);
      ctx.fillRect(ox + 18, 26 - bounce, 4, 6);
    }

    return canvas;
  }

  _executePhasePattern(dt, phase, player, tileMap) {
    const dist = distance(this.x, this.y, player.x, player.y);

    if (phase.pattern === 'patrol_throw_single') {
      // Throw single coconut toward player position
      if (this.telegraphTarget) {
        this._spawnCoconut(this.telegraphTarget.x, this.telegraphTarget.y, phase.rangedDamage || 5);
      }
    } else if (phase.pattern === 'patrol_throw_triple') {
      // 3-coconut salvo: center + 2 offset
      if (this.telegraphTarget) {
        this._spawnCoconut(this.telegraphTarget.x, this.telegraphTarget.y, phase.rangedDamage || 5);
        this._spawnCoconut(this.telegraphTarget.x - 1.5, this.telegraphTarget.y, phase.rangedDamage || 5);
        this._spawnCoconut(this.telegraphTarget.x + 1.5, this.telegraphTarget.y, phase.rangedDamage || 5);
      }
    }

    // Melee if very close
    if (dist < 2.0) {
      const dmg = phase.damage || 8;
      player.takeDamage(dmg);
      this.playerDamageTaken += dmg;
    }
  }

  _spawnCoconut(targetX, targetY, damage) {
    this._projectiles.push({
      x: this.x,
      y: this.y,
      targetX,
      targetY,
      speed: 4.0,
      damage,
      alive: true,
      timer: 3.0, // despawn after 3s
    });
  }

  update(dt, player, tileMap) {
    super.update(dt, player, tileMap);

    // Update projectiles
    for (const proj of this._projectiles) {
      if (!proj.alive) continue;
      proj.timer -= dt;
      if (proj.timer <= 0) { proj.alive = false; continue; }

      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.5) {
        proj.x += (dx / len) * proj.speed * dt;
        proj.y += (dy / len) * proj.speed * dt;
      } else {
        proj.alive = false;
      }

      // Hit detection
      if (distance(proj.x, proj.y, player.x, player.y) < 1.0) {
        player.takeDamage(proj.damage);
        this.playerDamageTaken += proj.damage;
        proj.alive = false;
      }
    }

    // Cleanup dead projectiles
    this._projectiles = this._projectiles.filter(p => p.alive);
  }

  dispose(scene) {
    this._projectiles = [];
    super.dispose(scene);
  }
}
