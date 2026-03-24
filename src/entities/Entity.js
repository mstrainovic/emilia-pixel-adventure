import * as THREE from 'three';
import { SpriteRenderer } from '../rendering/SpriteRenderer.js';

export class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.sprites = {};
    this.activeSprite = null;
    this.activeAnim = '';
    this.scene = null;
    this.shadow = null; // drop shadow mesh
  }

  addAnimation(name, sheetData, speed, tint = null) {
    const sprite = new SpriteRenderer(sheetData, speed, tint);
    this.sprites[name] = sprite;
    sprite.mesh.visible = false;
    return sprite;
  }

  setAnimation(name) {
    if (this.activeAnim === name) return;
    if (!this.sprites[name]) return;

    if (this.activeSprite) {
      this.activeSprite.mesh.visible = false;
    }

    this.activeAnim = name;
    this.activeSprite = this.sprites[name];
    this.activeSprite.mesh.visible = true;
    this.activeSprite.currentFrame = 0;
    this.activeSprite.elapsed = 0;
    this.activeSprite.playing = true;
  }

  addToScene(scene) {
    this.scene = scene;
    for (const sprite of Object.values(this.sprites)) {
      scene.add(sprite.mesh);
    }
    // Create drop shadow
    this._createShadow(scene);
  }

  removeFromScene() {
    if (!this.scene) return;
    for (const sprite of Object.values(this.sprites)) {
      this.scene.remove(sprite.mesh);
    }
    if (this.shadow) {
      this.scene.remove(this.shadow);
    }
    this.scene = null;
  }

  _createShadow(scene) {
    // Flat elliptical shadow using a scaled circle
    const geo = new THREE.CircleGeometry(0.6, 12);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    this.shadow = new THREE.Mesh(geo, mat);
    this.shadow.scale.set(1, 0.35, 1); // squash to ellipse shape
    scene.add(this.shadow);
  }

  updatePosition() {
    const z = 0.2 + this.y * 0.001;
    for (const sprite of Object.values(this.sprites)) {
      sprite.setPosition(this.x, this.y, z);
    }
    // Shadow position at feet
    if (this.shadow) {
      this.shadow.position.set(this.x, -(this.y + 0.8), z - 0.05);
    }
  }

  update(dt) {
    if (this.activeSprite) {
      this.activeSprite.update(dt);
    }
    this.updatePosition();
  }

  dispose() {
    this.removeFromScene();
    for (const sprite of Object.values(this.sprites)) {
      sprite.dispose();
    }
    if (this.shadow) {
      this.shadow.geometry.dispose();
      this.shadow.material.dispose();
    }
    this.sprites = {};
  }
}
