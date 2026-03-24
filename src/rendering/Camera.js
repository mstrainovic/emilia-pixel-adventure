import * as THREE from 'three';
import { CAMERA_LERP, VISIBLE_TILES_X, VISIBLE_TILES_Y } from '../utils/Constants.js';
import { lerp, clamp } from '../utils/MathUtils.js';

export class Camera {
  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    const halfH = VISIBLE_TILES_Y / 2;
    const halfW = halfH * aspect;

    this.cam = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 100);
    this.cam.position.set(0, 0, 50);
    this.cam.lookAt(0, 0, 0);

    this.targetX = 0;
    this.targetY = 0;
    this.mapWidth = 50;
    this.mapHeight = 40;

    window.addEventListener('resize', () => this._onResize());
  }

  setMapBounds(width, height) {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  follow(targetX, targetY, dt) {
    this.targetX = targetX;
    this.targetY = targetY;

    const t = 1 - Math.pow(1 - CAMERA_LERP, dt * 60);

    let camX = lerp(this.cam.position.x, targetX, t);
    let camY = lerp(this.cam.position.y, -targetY, t);

    // Clamp to map bounds
    const halfW = (this.cam.right - this.cam.left) / 2;
    const halfH = (this.cam.top - this.cam.bottom) / 2;

    camX = clamp(camX, halfW, this.mapWidth - halfW);
    camY = clamp(camY, -(this.mapHeight - halfH), -halfH);

    this.cam.position.x = camX;
    this.cam.position.y = camY;
  }

  get three() {
    return this.cam;
  }

  _onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const halfH = VISIBLE_TILES_Y / 2;
    const halfW = halfH * aspect;
    this.cam.left = -halfW;
    this.cam.right = halfW;
    this.cam.top = halfH;
    this.cam.bottom = -halfH;
    this.cam.updateProjectionMatrix();
  }
}
