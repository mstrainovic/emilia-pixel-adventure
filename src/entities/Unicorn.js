import * as THREE from 'three';
import { Entity } from './Entity.js';
import { distance } from '../utils/MathUtils.js';

/**
 * A magical unicorn that Emilia can befriend.
 * Approach slowly (walk, not run) → heart particles → pet (E) → heal + rare item.
 */
export class Unicorn extends Entity {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.state = 'grazing'; // grazing, alert, friendly, petting
    this.alertTimer = 0;
    this.petCooldown = 0;
    this.hasPetted = false;

    // Create unicorn sprite (Canvas-generated: white body + horn + rainbow mane)
    this._createSprite();
  }

  _createSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // 4 frames of 64x64
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Helper for pixel-art drawing
    const px = (x, y, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); };
    const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

    for (let frame = 0; frame < 4; frame++) {
      const ox = frame * 64;
      const bob = frame % 2; // gentle bobbing animation

      // ── Body (round chibi-style, like Cute_Fantasy animals) ──
      // Main body - white with slight lavender tint
      rect(ox + 22, 28 + bob, 20, 14, '#f8f0ff');
      rect(ox + 20, 30 + bob, 24, 10, '#fff5ff');
      rect(ox + 21, 29 + bob, 22, 12, '#fdf8ff');
      // Body shading
      rect(ox + 20, 38 + bob, 24, 2, '#e8daf0');
      rect(ox + 22, 40 + bob, 20, 1, '#ddd0e8');

      // ── Legs (short stubby, like CF sheep) ──
      const legY = 40 + bob;
      rect(ox + 24, legY, 3, 5, '#f0e5f5');
      rect(ox + 28, legY, 3, 5 + (frame === 1 ? 1 : 0), '#f0e5f5');
      rect(ox + 33, legY, 3, 5 + (frame === 2 ? 1 : 0), '#f0e5f5');
      rect(ox + 37, legY, 3, 5, '#f0e5f5');
      // Hooves - small pink
      rect(ox + 24, legY + 4, 3, 2, '#e0b0c0');
      rect(ox + 28, legY + 4 + (frame === 1 ? 1 : 0), 3, 2, '#e0b0c0');
      rect(ox + 33, legY + 4 + (frame === 2 ? 1 : 0), 3, 2, '#e0b0c0');
      rect(ox + 37, legY + 4, 3, 2, '#e0b0c0');

      // ── Head (large round, chibi proportions) ──
      rect(ox + 36, 20 + bob, 16, 14, '#fff5ff');
      rect(ox + 35, 22 + bob, 18, 10, '#fdf8ff');
      rect(ox + 37, 19 + bob, 14, 16, '#fff5ff');
      // Cheek blush
      rect(ox + 47, 28 + bob, 3, 2, '#ffb8cc');

      // ── Eye (large, cute) ──
      rect(ox + 44, 24 + bob, 4, 4, '#4a3060');
      rect(ox + 45, 24 + bob, 2, 2, '#6a4590');
      // Eye shine
      px(ox + 46, 24 + bob, '#ffffff');
      px(ox + 44, 26 + bob, '#8060a0');

      // ── Golden Horn (spiral-styled) ──
      rect(ox + 43, 14 + bob, 3, 6, '#FFD700');
      rect(ox + 44, 12 + bob - (frame % 2), 2, 3, '#FFEA00');
      px(ox + 44, 11 + bob - (frame % 2), '#FFF3A0');
      // Horn detail lines
      px(ox + 43, 16 + bob, '#E5B800');
      px(ox + 43, 18 + bob, '#E5B800');

      // ── Rainbow Mane (flowing down neck) ──
      const maneColors = ['#FF6B8A', '#FFB347', '#FFE066', '#7BC67E', '#5B9BD5', '#9B7ED8'];
      for (let i = 0; i < 6; i++) {
        const mx = ox + 36 - i * 1;
        const my = 21 + bob + i * 2;
        rect(mx, my, 3, 3, maneColors[i]);
        if (frame >= 2) px(mx - 1, my + 1, maneColors[i]); // wind effect
      }

      // ── Rainbow Tail (flowing) ──
      for (let i = 0; i < 5; i++) {
        const tx = ox + 20 - i * 2 - (frame % 2);
        const ty = 30 + bob + i * 2;
        rect(tx, ty, 3, 3, maneColors[i]);
        if (frame === 1 || frame === 3) px(tx - 1, ty + 1, maneColors[i]);
      }

      // ── Sparkles (magical particles around unicorn) ──
      const sparklePositions = [
        [ox + 52, 16], [ox + 16, 22], [ox + 50, 36], [ox + 14, 38],
      ];
      for (let i = 0; i < sparklePositions.length; i++) {
        if ((frame + i) % 3 === 0) {
          const [sx, sy] = sparklePositions[i];
          ctx.fillStyle = 'rgba(255, 255, 180, 0.7)';
          px(sx, sy + bob, 'rgba(255, 255, 180, 0.8)');
          px(sx + 1, sy + bob, 'rgba(255, 220, 100, 0.6)');
        }
      }

      // ── Ear ──
      rect(ox + 40, 18 + bob, 3, 4, '#fff0ff');
      px(ox + 41, 19 + bob, '#ffc0dd');
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    // Create a SpriteRenderer-like setup manually
    const clonedTex = texture.clone();
    clonedTex.needsUpdate = true;
    clonedTex.magFilter = THREE.NearestFilter;
    clonedTex.minFilter = THREE.NearestFilter;
    clonedTex.repeat.set(0.25, 1);
    clonedTex.offset.set(0, 0);

    const geo = new THREE.PlaneGeometry(4, 4);
    const mat = new THREE.MeshBasicMaterial({
      map: clonedTex,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });

    this._unicornMesh = new THREE.Mesh(geo, mat);
    this._unicornTex = clonedTex;
    this._animFrame = 0;
    this._animTimer = 0;
  }

  addToScene(scene) {
    this.scene = scene;
    scene.add(this._unicornMesh);
  }

  removeFromScene() {
    if (this.scene) {
      this.scene.remove(this._unicornMesh);
    }
  }

  update(dt, player) {
    if (!player) return;

    // Animate
    this._animTimer += dt * 1000;
    if (this._animTimer > 250) {
      this._animTimer = 0;
      this._animFrame = (this._animFrame + 1) % 4;
      this._unicornTex.offset.x = this._animFrame * 0.25;
    }

    // Position
    const z = 0.2 + this.y * 0.001;
    this._unicornMesh.position.set(this.x, -this.y, z);

    const dist = distance(this.x, this.y, player.x, player.y);

    switch (this.state) {
      case 'grazing':
        // Gentle wandering
        this.x += Math.sin(Date.now() * 0.0005 + this.y) * 0.3 * dt;
        this.y += Math.cos(Date.now() * 0.0007 + this.x) * 0.2 * dt;

        if (dist < 5) {
          // Player approaching — check if running
          if (player.state === 'run') {
            // Scared! Move away
            const dx = this.x - player.x;
            const dy = this.y - player.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              this.x += (dx / len) * 3 * dt;
              this.y += (dy / len) * 3 * dt;
            }
            this.state = 'alert';
            this.alertTimer = 3;
          } else if (dist < 2.5) {
            this.state = 'friendly';
            if (window.__game?.audio) window.__game.audio.playUnicornSparkle();
          }
        }
        break;

      case 'alert':
        this.alertTimer -= dt;
        if (this.alertTimer <= 0) this.state = 'grazing';
        break;

      case 'friendly':
        if (dist > 8) {
          this.state = 'grazing';
          return;
        }
        // Follow player gently after first petting
        if (this.hasPetted) {
          this._followPlayer(dt, player);
        }
        // Can be petted
        this.petCooldown -= dt;
        break;
    }
  }

  /**
   * Returns true if the unicorn can be petted right now.
   */
  canPet(player) {
    return this.state === 'friendly' &&
           this.petCooldown <= 0 &&
           distance(this.x, this.y, player.x, player.y) < 2.5;
  }

  /**
   * Pet the unicorn! Returns loot item or null.
   */
  pet(player) {
    if (!this.canPet(player)) return null;

    this.petCooldown = 20; // can pet again after 20s
    this.hasPetted = true;

    if (window.__game?.audio) window.__game.audio.playUnicornPet();
    if (window.__game?.progression) {
      window.__game.progression.addXp(25);
      window.__game.progression.reportPet();
    }

    // Cycle through different unicorn gifts each time
    this._petCount = (this._petCount || 0) + 1;
    const giftType = this._petCount % 4;

    switch (giftType) {
      case 1: // Full heal
        player.heal(player.maxHp);
        if (window.__game?.hud) window.__game.hud.showInfo('Das Einhorn heilt dich vollstaendig!');
        break;
      case 2: // Speed boost (temporary)
        player._unicornSpeedBoost = 3.0; // 3 seconds
        if (window.__game?.hud) window.__game.hud.showInfo('Einhorn-Segen: Du bist schneller!');
        break;
      case 3: // Shield (temporary invulnerability)
        player.invulnTimer = 5.0; // 5 seconds
        if (window.__game?.hud) window.__game.hud.showInfo('Einhorn-Schutzschild aktiviert!');
        break;
      case 0: // Rare item gift
        player.heal(Math.ceil(player.maxHp * 0.5)); // half heal too
        if (window.__game?.hud) window.__game.hud.showInfo('Das Einhorn gibt dir ein Geschenk!');
        break;
    }

    // Always give a rare item
    const items = ['unicorn_tear', 'rainbow_flower', 'magic_herb'];
    const itemId = items[Math.floor(Math.random() * items.length)];

    return { itemId, count: 1, x: this.x, y: this.y };
  }

  /**
   * Follow the player as a companion after first petting.
   */
  _followPlayer(dt, player) {
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist > 3 && dist < 10) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this.x += (dx / len) * 1.5 * dt;
        this.y += (dy / len) * 1.5 * dt;
      }
    }
  }

  dispose() {
    this.removeFromScene();
    this._unicornMesh.geometry.dispose();
    this._unicornMesh.material.map.dispose();
    this._unicornMesh.material.dispose();
  }
}
