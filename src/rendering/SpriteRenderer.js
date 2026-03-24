import * as THREE from 'three';

/**
 * Renders an animated sprite from a horizontal spritesheet.
 * Each frame is arranged left-to-right in a single row.
 */
export class SpriteRenderer {
  /**
   * @param {object} sheetData - { texture, frameWidth, frameHeight, frameCount, sheetWidth, sheetHeight }
   * @param {number} animSpeed - ms per frame
   * @param {THREE.Color|null} tint - optional color tint
   */
  constructor(sheetData, animSpeed = 150, tint = null) {
    this.frameCount = sheetData.frameCount;
    this.sheetWidth = sheetData.sheetWidth;
    this.sheetHeight = sheetData.sheetHeight;
    this.frameWidth = sheetData.frameWidth;
    this.frameHeight = sheetData.frameHeight;

    // Clone texture so each sprite instance can animate independently
    this.texture = sheetData.texture.clone();
    this.texture.needsUpdate = true;
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;

    // For a horizontal strip: show 1/frameCount of the width, full height
    this.texture.repeat.set(1 / this.frameCount, 1);
    this.texture.offset.set(0, 0);

    // Sprite size in world units (16px = 1 tile unit)
    const worldW = this.frameWidth / 16;
    const worldH = this.frameHeight / 16;

    const geometry = new THREE.PlaneGeometry(worldW, worldH);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false
    });

    if (tint) {
      material.color = tint;
    }

    this.mesh = new THREE.Mesh(geometry, material);

    this.currentFrame = 0;
    this.animSpeed = animSpeed;
    this.elapsed = 0;
    this.playing = true;
    this.loop = true;
    this.flippedX = false;
  }

  update(dt) {
    if (!this.playing) return;

    this.elapsed += dt * 1000;
    if (this.elapsed >= this.animSpeed) {
      this.elapsed -= this.animSpeed;
      this.currentFrame++;
      if (this.currentFrame >= this.frameCount) {
        this.currentFrame = this.loop ? 0 : this.frameCount - 1;
        if (!this.loop) this.playing = false;
      }
      this.texture.offset.x = this.currentFrame / this.frameCount;
    }
  }

  flipX(flip) {
    if (this.flippedX !== flip) {
      this.flippedX = flip;
      this.mesh.scale.x = flip ? -Math.abs(this.mesh.scale.x) : Math.abs(this.mesh.scale.x);
    }
  }

  setPosition(x, y, z = 0) {
    this.mesh.position.set(x, -y, z);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.texture.dispose();
  }
}
