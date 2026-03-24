import * as THREE from 'three';
import { Entity } from './Entity.js';
import { ANIM_SPEED_IDLE } from '../utils/Constants.js';
import { loadCuteFantasyNPC, NPC_PALETTE_CONFIGS } from '../utils/SpriteSheetLoader.js';

export class NPC extends Entity {
  constructor(config) {
    super();
    this.name = config.name;
    this.role = config.role;
    this.x = config.x;
    this.y = config.y;
    this.direction = config.direction || 'down';
    this.nameLabel = null;
    this._labelColor = config.clothingColor || 0xFFD700;
    this._dialogs = config.dialogs || [];
    this._characterId = config.id; // maps to CHARACTER_CONFIGS key
  }

  async loadAnimations(_assetLoader) {
    // Load Cute_Fantasy player sprite with per-NPC palette swap
    const palette = NPC_PALETTE_CONFIGS[this._characterId] || NPC_PALETTE_CONFIGS.papa_milos;
    const anims = await loadCuteFantasyNPC(palette.hairColor, palette.clothColor);

    const speed = ANIM_SPEED_IDLE + Math.floor(Math.random() * 80);

    // NPCs only need idle animations (they don't walk/fight)
    if (anims.idle_down) this.addAnimation('idle', anims.idle_down, speed);
    if (anims.idle_side) this.addAnimation('idle_side', anims.idle_side, speed);
    if (anims.idle_up) this.addAnimation('idle_up', anims.idle_up, speed);

    // Set facing direction
    const dirAnim = this.direction === 'side' ? 'idle_side' : this.direction === 'up' ? 'idle_up' : 'idle';
    this.setAnimation(dirAnim);
  }

  // Cute_Fantasy sprites already include a shadow in the texture
  _createShadow() {}

  addToScene(scene) {
    super.addToScene(scene);
    this._createNameLabel(scene);
  }

  _createNameLabel(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 48);
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const measured = ctx.measureText(this.name);
    const bgW = measured.width + 20;
    const bgH = 28;
    const bgX = (256 - bgW) / 2;
    const bgY = (48 - bgH) / 2;

    // Background pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.arc(bgX + bgH / 2, bgY + bgH / 2, bgH / 2, Math.PI / 2, Math.PI * 1.5);
    ctx.arc(bgX + bgW - bgH / 2, bgY + bgH / 2, bgH / 2, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    // Colored border
    const c = new THREE.Color(this._labelColor);
    ctx.strokeStyle = `#${c.getHexString()}`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.name, 128, 24);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(3.5, 0.65);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });

    this.nameLabel = new THREE.Mesh(geo, mat);
    scene.add(this.nameLabel);
  }

  updatePosition() {
    super.updatePosition();
    if (this.nameLabel) {
      this.nameLabel.position.set(this.x, -this.y + 2.1, 0.5 + this.y * 0.001);
    }
  }

  dispose() {
    if (this.nameLabel) {
      if (this.nameLabel.parent) this.nameLabel.parent.remove(this.nameLabel);
      this.nameLabel.geometry.dispose();
      this.nameLabel.material.map.dispose();
      this.nameLabel.material.dispose();
    }
    super.dispose();
  }
}
