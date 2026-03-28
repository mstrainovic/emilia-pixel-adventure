import { distance } from '../utils/MathUtils.js';
import { DIR_DOWN, DIR_UP, DIR_LEFT, DIR_RIGHT } from '../utils/Constants.js';

/**
 * Handles player attacks and hit detection against mobs.
 */
export class CombatSystem {
  constructor() {
    this.attackCooldown = 0;
    this.attackDuration = 0.3;
    this.attackRange = 1.5;
    this.isAttacking = false;
    this.attackTimer = 0;
    this._hitMobs = new Set(); // track which mobs were hit this attack
  }

  /**
   * Try to start an attack. Returns true if attack started.
   */
  tryAttack(player, inputManager) {
    if (this.isAttacking || this.attackCooldown > 0) return false;

    // Space bar (justPressed for responsive single-press attacks) or left click
    if (inputManager.justPressed('Space') || inputManager.consumeClick()) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
      this.attackCooldown = 0.3;
      this._hitMobs.clear();

      // Player.js switches to slice_* animation during attack state.
      // VisualEffects.swordSlash() adds the sword blade + slash trail.
      player.state = 'attack';
      return true;
    }
    return false;
  }

  /**
   * Update combat state, check hits.
   * Returns array of { mob, damage } objects for mobs hit this frame.
   */
  update(dt, player, mobs) {
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const hits = [];

    if (this.isAttacking) {
      this.attackTimer -= dt;

      // Check for hits during the first half of the attack
      if (this.attackTimer > this.attackDuration * 0.4) {
        const attackArea = this._getAttackArea(player);

        for (const mob of mobs) {
          if (!mob.alive || this._hitMobs.has(mob)) continue;
          if (distance(attackArea.x, attackArea.y, mob.x, mob.y) < this.attackRange) {
            const weapon = player.inventory?.getSelectedItem();
            const baseDmg = weapon?.damage || 10;
            const dmgMult = window.__game?.progression?.getDamageMultiplier() || 1.0;
            const dmg = Math.round(baseDmg * dmgMult);
            mob.takeDamage(dmg);
            this._hitMobs.add(mob); // only hit each mob once per swing
            hits.push({ mob, damage: dmg });
          }
        }
      }

      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        player.state = 'idle';
        player._lungeTimer = 0;
        player._attackOffsetX = 0;
        player._attackOffsetY = 0;
        // Reset sprite scale from squash-and-stretch
        if (player.activeSprite?.mesh) {
          player.activeSprite.mesh.scale.set(1, 1, 1);
        }
      }
    }

    return hits;
  }

  _getAttackArea(player) {
    // Area in front of the player based on direction
    const offsets = {
      [DIR_DOWN]: { x: 0, y: 1.2 },
      [DIR_UP]: { x: 0, y: -1.2 },
      [DIR_LEFT]: { x: -1.2, y: 0 },
      [DIR_RIGHT]: { x: 1.2, y: 0 },
    };
    const off = offsets[player.direction] || offsets[DIR_DOWN];
    return { x: player.x + off.x, y: player.y + off.y };
  }
}
