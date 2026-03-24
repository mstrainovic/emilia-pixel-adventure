import * as THREE from 'three';
import { getItem } from '../data/items.js';
import { getItemIconTexture } from '../utils/ItemIcons.js';
import { distance } from '../utils/MathUtils.js';

class DroppedItem {
  constructor(itemId, count, x, y, scene, playerDropped = false) {
    this.itemId = itemId;
    this.count = count;
    this.x = x;
    this.y = y;
    this.alive = true;
    this.lifetime = 120;
    this.bounceTimer = Math.random() * Math.PI * 2;
    this.pickupDelay = playerDropped ? 1.5 : 0.5; // longer delay for player drops
    this.magnetRange = playerDropped ? 0 : 2.0; // no magnet for player drops
    this.requireKeyPickup = playerDropped; // E key required for player drops

    // Use pixel-art icon texture
    const tex = getItemIconTexture(itemId);
    const geo = new THREE.PlaneGeometry(0.7, 0.7);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(x, -y, 0.25 + y * 0.001);
    scene.add(this.mesh);
    this.scene = scene;
  }

  update(dt, player, inventory, inputManager) {
    if (!this.alive) return;

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.destroy();
      return;
    }

    this.pickupDelay -= dt;
    this.bounceTimer += dt * 4;

    // Gentle bounce
    const bounce = Math.abs(Math.sin(this.bounceTimer)) * 0.25;
    this.mesh.position.y = -this.y + bounce;
    this.mesh.position.x = this.x;

    // Slight rotation for charm
    this.mesh.rotation.z = Math.sin(this.bounceTimer * 0.5) * 0.15;

    // Fade when about to despawn
    if (this.lifetime < 5) {
      this.mesh.material.opacity = this.lifetime / 5;
    }

    // Pickup logic
    if (this.pickupDelay <= 0) {
      const dist = distance(this.x, this.y, player.x, player.y);

      if (this.requireKeyPickup) {
        // Player-dropped items: only pick up with E key when close
        if (dist < 1.5 && inputManager && inputManager.justPressed('KeyE')) {
          const remaining = inventory.addItem(this.itemId, this.count);
          if (remaining === 0) {
            this.destroy();
            return true;
          }
        }
      } else {
        // Mob drops / natural drops: auto-magnet pickup
        if (dist < this.magnetRange) {
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0.1) {
            this.x += (dx / len) * 8 * dt;
            this.y += (dy / len) * 8 * dt;
          }

          if (dist < 0.5) {
            const remaining = inventory.addItem(this.itemId, this.count);
            if (remaining === 0) {
              this.destroy();
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  destroy() {
    this.alive = false;
    if (this.mesh.parent) this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.map.dispose();
    this.mesh.material.dispose();
  }
}

export class ItemDropManager {
  constructor(scene) {
    this.scene = scene;
    this.drops = [];
  }

  spawnDrop(itemId, count, x, y, playerDropped = false) {
    const spread = 0.8;
    const dx = (Math.random() - 0.5) * spread;
    const dy = (Math.random() - 0.5) * spread;
    this.drops.push(new DroppedItem(itemId, count, x + dx, y + dy, this.scene, playerDropped));
  }

  spawnMobDrops(dropTable, x, y) {
    for (const drop of dropTable) {
      if (Math.random() < drop.chance) {
        const count = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
        if (count > 0) this.spawnDrop(drop.itemId, count, x, y);
      }
    }
  }

  update(dt, player, inventory, inputManager) {
    const pickedUp = [];
    for (const drop of this.drops) {
      if (drop.alive && drop.update(dt, player, inventory, inputManager)) {
        pickedUp.push(drop);
      }
    }
    this.drops = this.drops.filter(d => d.alive);
    return pickedUp;
  }

  clear() {
    for (const drop of this.drops) drop.destroy();
    this.drops = [];
  }

  dispose() { this.clear(); }
}
