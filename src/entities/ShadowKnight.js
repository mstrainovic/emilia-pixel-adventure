import * as THREE from 'three';
import { Boss } from './Boss.js';
import { distance } from '../utils/MathUtils.js';
import { DIR_LEFT } from '../utils/Constants.js';

/**
 * Boss 3: Shadow Knight — Cloud Castle Throne Room final boss.
 * 250 HP, 3 phases: sword, teleport, clones.
 * Canvas-drawn 128x32 spritesheet (4 frames of 32x32).
 */
export class ShadowKnight extends Boss {
  constructor(bossDef, x, y) {
    super('shadow_knight', bossDef, x, y);
    this._clones = [];          // shadow clone entities (Phase 3)
    this._teleportCooldown = 0;
    this._dashTarget = null;
  }

  _createBossCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 32;
      const sway = (frame % 2 === 0) ? 0 : 1;

      // ── Dark cape (billowing) ──
      ctx.fillStyle = '#1A0A2E';
      ctx.fillRect(ox + 6, 12 + sway, 20, 18);
      ctx.fillRect(ox + 4, 16 + sway, 24, 14);
      // Cape edge glow
      ctx.fillStyle = '#4A0066';
      ctx.fillRect(ox + 4, 28, 24, 2);

      // ── Armor body ──
      ctx.fillStyle = '#2A1A3E';
      ctx.fillRect(ox + 10, 10, 12, 14);
      ctx.fillStyle = '#3A2A4E';
      ctx.fillRect(ox + 12, 12, 8, 10);

      // ── Shoulder pads ──
      ctx.fillStyle = '#4A3A5E';
      ctx.fillRect(ox + 6, 10, 6, 4);
      ctx.fillRect(ox + 20, 10, 6, 4);
      // Purple gem on shoulders
      ctx.fillStyle = '#8800CC';
      ctx.fillRect(ox + 8, 11, 2, 2);
      ctx.fillRect(ox + 22, 11, 2, 2);

      // ── Helmet ──
      ctx.fillStyle = '#2A1A3E';
      ctx.fillRect(ox + 10, 2, 12, 10);
      ctx.fillRect(ox + 9, 4, 14, 6);
      // Visor slit (glowing red eyes)
      ctx.fillStyle = '#FF0044';
      ctx.fillRect(ox + 12, 5, 3, 2);
      ctx.fillRect(ox + 18, 5, 3, 2);
      // Glow around eyes
      ctx.fillStyle = 'rgba(255, 0, 68, 0.4)';
      ctx.fillRect(ox + 11, 4, 10, 4);
      // Horn/crest on top
      ctx.fillStyle = '#4A0066';
      ctx.fillRect(ox + 14, 0, 4, 4);

      // ── Sword (right hand) ──
      ctx.fillStyle = '#8888AA';
      ctx.fillRect(ox + 26, 6 + sway, 2, 18);
      // Blade glow
      ctx.fillStyle = '#AAAACC';
      ctx.fillRect(ox + 27, 8 + sway, 1, 14);
      // Hilt
      ctx.fillStyle = '#4A0066';
      ctx.fillRect(ox + 24, 14 + sway, 6, 2);
      // Pommel gem
      ctx.fillStyle = '#FF0044';
      ctx.fillRect(ox + 25, 15 + sway, 1, 1);

      // ── Legs (armored) ──
      ctx.fillStyle = '#2A1A3E';
      ctx.fillRect(ox + 12, 24, 3, 6);
      ctx.fillRect(ox + 18, 24, 3, 6);
      // Boots
      ctx.fillStyle = '#1A0A2E';
      ctx.fillRect(ox + 11, 28, 5, 4);
      ctx.fillRect(ox + 17, 28, 5, 4);

      // ── Shadow aura (subtle) ──
      ctx.fillStyle = 'rgba(100, 0, 150, 0.15)';
      ctx.fillRect(ox + 2, 4, 28, 26);
    }

    return canvas;
  }

  _executePhasePattern(dt, phase, player, tileMap) {
    const dist = distance(this.x, this.y, player.x, player.y);

    switch (phase.pattern) {
      case 'sword_block_counter':
        // Dash toward player and strike
        if (dist < 2.5) {
          const dmg = phase.damage || 12;
          player.takeDamage(dmg);
          this.playerDamageTaken += dmg;
        } else if (dist < 6) {
          // Quick dash toward player
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            this.x += (dx / len) * 3;
            this.y += (dy / len) * 3;
          }
          // Check hit after dash
          if (distance(this.x, this.y, player.x, player.y) < 2.0) {
            const dashDmg = phase.dashDamage || 8;
            player.takeDamage(dashDmg);
            this.playerDamageTaken += dashDmg;
          }
        }
        break;

      case 'teleport_combo':
        // Teleport behind player, then combo
        this.x = player.x + (player.direction === DIR_LEFT ? 2 : -2);
        this.y = player.y;
        this.facingLeft = player.x < this.x;
        // Delayed strike (player has ~0.5s to react)
        if (distance(this.x, this.y, player.x, player.y) < 2.5) {
          const teleDmg = phase.damage || 12;
          player.takeDamage(teleDmg);
          this.playerDamageTaken += teleDmg;
        }
        break;

      case 'clone_assault':
        // Spawn clones if none exist
        if (this._clones.length === 0) {
          this._spawnClones(phase.cloneCount || 2, phase.cloneHp || 50);
        }
        // Also do a normal attack
        if (dist < 2.5) {
          const cloneDmg = phase.damage || 12;
          player.takeDamage(cloneDmg);
          this.playerDamageTaken += cloneDmg;
        }
        break;
    }
  }

  _spawnClones(count, hp) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this._clones.push({
        x: this.x + Math.cos(angle) * 3,
        y: this.y + Math.sin(angle) * 3,
        hp: hp,
        maxHp: hp,
        alive: true,
        speed: this.speed * 0.8,
        damage: 6,
        attackCooldown: 0,
      });
    }
  }

  update(dt, player, tileMap) {
    super.update(dt, player, tileMap);

    // Update clones
    for (const clone of this._clones) {
      if (!clone.alive) continue;

      // Chase player
      const dx = player.x - clone.x;
      const dy = player.y - clone.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1.5) {
        clone.x += (dx / len) * clone.speed * dt;
        clone.y += (dy / len) * clone.speed * dt;
      }

      // Attack
      clone.attackCooldown -= dt;
      if (clone.attackCooldown <= 0 && len < 2.0) {
        player.takeDamage(clone.damage);
        this.playerDamageTaken += clone.damage;
        clone.attackCooldown = 1.5;
      }
    }

    // Remove dead clones
    this._clones = this._clones.filter(c => c.alive);
  }

  /**
   * Returns clone array for CombatSystem to check hits against.
   */
  getClones() {
    return this._clones;
  }

  dispose(scene) {
    this._clones = [];
    super.dispose(scene);
  }
}
