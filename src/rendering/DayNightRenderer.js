import * as THREE from 'three';

export class DayNightRenderer {
  constructor(scene) {
    this.scene = scene;
    this.ambientLight = null;
    this.starMesh = null;
    this.shootingStars = [];
    this._shootingStarTimer = 0;
    this._shootingStarInterval = 15;
    this._initLights();
  }

  _initLights() {
    // Find existing ambient light in scene (Game.js creates one)
    this.ambientLight = this.scene.children.find(c => c.isAmbientLight);
    if (!this.ambientLight) {
      this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      this.scene.add(this.ambientLight);
    }
  }

  _createStars(mapWidth, mapHeight) {
    if (this.starMesh) return;
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * mapWidth;
      positions[i * 3 + 1] = -(Math.random() * mapHeight);
      positions[i * 3 + 2] = 0.95;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffcc, size: 0.15, transparent: true, opacity: 0 });
    this.starMesh = new THREE.Points(geo, mat);
    this.scene.add(this.starMesh);
  }

  update(dt, dayNight, mapWidth, mapHeight, sceneName) {
    if (!dayNight) return;
    if (sceneName === 'dungeon') return; // indoor, skip

    const color = dayNight.getLightColor();
    this.ambientLight.color.setRGB(color.r, color.g, color.b);
    this.ambientLight.intensity = dayNight.getAmbientIntensity();

    if (dayNight.isNight()) {
      this._createStars(mapWidth, mapHeight);
      if (this.starMesh) {
        this.starMesh.material.opacity = Math.min(1, this.starMesh.material.opacity + dt * 0.5);
        this.starMesh.material.size = 0.12 + Math.sin(dayNight.totalTime * 2) * 0.03;
      }
      this._shootingStarTimer += dt;
      if (this._shootingStarTimer >= this._shootingStarInterval) {
        this._shootingStarTimer = 0;
        this._shootingStarInterval = 20 + Math.random() * 30;
        this._spawnShootingStar(mapWidth, mapHeight);
      }
    } else if (this.starMesh) {
      this.starMesh.material.opacity = Math.max(0, this.starMesh.material.opacity - dt * 2);
    }

    this._updateShootingStars(dt);
  }

  _spawnShootingStar(mapWidth, mapHeight) {
    const startX = Math.random() * mapWidth;
    const startY = -(Math.random() * mapHeight * 0.5);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([startX, startY, 0.96]), 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffcc, size: 0.6, transparent: true, opacity: 1 });
    const mesh = new THREE.Points(geo, mat);
    this.scene.add(mesh);
    this.shootingStars.push({
      mesh, life: 0, maxLife: 2.5,
      vx: 4 + Math.random() * 3,
      vy: -(1.5 + Math.random()),
    });
  }

  _updateShootingStars(dt) {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.life += dt;
      const pos = s.mesh.geometry.attributes.position.array;
      pos[0] += s.vx * dt;
      pos[1] += s.vy * dt;
      s.mesh.geometry.attributes.position.needsUpdate = true;
      s.mesh.material.opacity = 1 - (s.life / s.maxLife);
      if (s.life >= s.maxLife) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        this.shootingStars.splice(i, 1);
      }
    }
  }

  hasShootingStarInView(camera) {
    if (!camera || this.shootingStars.length === 0) return false;
    const halfW = (camera.right - camera.left) / 2;
    const halfH = (camera.top - camera.bottom) / 2;
    // Use camera WORLD position, not view-space origin
    const cx = camera.position.x;
    const cy = camera.position.y;
    for (const s of this.shootingStars) {
      const pos = s.mesh.geometry.attributes.position.array;
      if (Math.abs(pos[0] - cx) < halfW && Math.abs(pos[1] - cy) < halfH) return true;
    }
    return false;
  }

  dispose() {
    if (this.starMesh) {
      this.scene.remove(this.starMesh);
      this.starMesh.geometry.dispose();
      this.starMesh.material.dispose();
      this.starMesh = null;
    }
    for (const s of this.shootingStars) {
      this.scene.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
    }
    this.shootingStars = [];
  }
}
