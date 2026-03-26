import * as THREE from 'three';

/**
 * Floating damage numbers that appear when entities take damage.
 * Numbers float upward and fade out over ~1 second.
 * Red = damage to player, yellow = damage dealt by player.
 */
export class DamageNumbers {
  constructor(scene) {
    this.scene = scene;
    this.active = [];
  }

  /**
   * Spawn a floating damage number at the given tile coordinates.
   * @param {number} x - Tile X position
   * @param {number} y - Tile Y position (game coords, Y-down)
   * @param {number} amount - Damage amount to display
   * @param {boolean} isPlayerDamage - true = damage TO player (red), false = damage BY player (yellow)
   */
  spawn(x, y, amount, isPlayerDamage = false) {
    const text = Math.round(amount).toString();

    // Canvas size scales with text length
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Pick color: red for damage to player, yellow for damage by player
    const color = isPlayerDamage ? '#ff4444' : '#ffff44';

    // Font size — bigger for larger hits
    let fontSize = 16;
    if (amount >= 20) fontSize = 20;
    if (amount >= 40) fontSize = 24;

    ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black outline for readability
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(text, 32, 16);

    // Fill
    ctx.fillStyle = color;
    ctx.fillText(text, 32, 16);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);

    // Base scale — bigger for harder hits
    let scaleX = 2, scaleY = 1;
    if (amount >= 20) { scaleX = 2.5; scaleY = 1.25; }
    if (amount >= 40) { scaleX = 3; scaleY = 1.5; }
    sprite.scale.set(scaleX, scaleY, 1);

    // Position: negate Y for Three.js coords, z=5 so always on top
    sprite.position.set(x, -y, 5);
    this.scene.add(sprite);

    this.active.push({
      sprite,
      material,
      texture,
      age: 0,
      lifetime: 1.0,
      startY: -y,
      baseScaleX: scaleX,
      baseScaleY: scaleY,
      velocityX: (Math.random() - 0.5) * 0.5,
    });
  }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const dn = this.active[i];
      dn.age += dt;

      const progress = dn.age / dn.lifetime;

      // Float upward with deceleration
      dn.sprite.position.y = dn.startY + progress * 2.0;
      dn.sprite.position.x += dn.velocityX * dt;

      // Pop scale on spawn (first 10%)
      if (progress < 0.1) {
        const pop = 1 + (1 - progress / 0.1) * 0.3;
        dn.sprite.scale.set(dn.baseScaleX * pop, dn.baseScaleY * pop, 1);
      } else {
        dn.sprite.scale.set(dn.baseScaleX, dn.baseScaleY, 1);
      }

      // Fade out in last 40%
      if (progress > 0.6) {
        dn.material.opacity = 1 - ((progress - 0.6) / 0.4);
      }

      // Remove when done
      if (progress >= 1) {
        this.scene.remove(dn.sprite);
        dn.material.dispose();
        dn.texture.dispose();
        this.active.splice(i, 1);
      }
    }
  }

  dispose() {
    for (const dn of this.active) {
      this.scene.remove(dn.sprite);
      dn.material.dispose();
      dn.texture.dispose();
    }
    this.active = [];
  }
}
