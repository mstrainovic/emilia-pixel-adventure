import * as THREE from 'three';

/**
 * High-performance particle system using InstancedMesh.
 * Supports multiple emitters per scene with different behaviors.
 *
 * Particle types:
 * - firefly: soft glow, random wander, pulse opacity
 * - leaf: falls with sine sway, rotates, fades
 * - spark: shoots up from source, gravity, fast fade
 * - sparkle: stationary twinkle, random opacity pulse
 * - bubble: rises slowly, slight horizontal drift, pops
 * - petal: floats on wind, gentle rotation, long life
 * - dust: slow drift, very subtle, long life
 * - wisp: slow horizontal movement, sine wave vertical, transparent
 */

const MAX_PARTICLES = 512;
const PARTICLE_SIZE = 0.12;

// Shared canvas texture (2x2 soft circle)
let _sharedTexture = null;
function getSharedTexture() {
  if (_sharedTexture) return _sharedTexture;
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  _sharedTexture = new THREE.CanvasTexture(c);
  _sharedTexture.magFilter = THREE.LinearFilter;
  _sharedTexture.minFilter = THREE.LinearFilter;
  return _sharedTexture;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export class ParticleSystem {
  constructor(scene) {
    this._scene = scene;
    this._emitters = [];
    this._particles = [];
    this._time = 0;

    // InstancedMesh for all particles
    const geo = new THREE.PlaneGeometry(PARTICLE_SIZE, PARTICLE_SIZE);
    const mat = new THREE.MeshBasicMaterial({
      map: getSharedTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this._mesh = new THREE.InstancedMesh(geo, mat, MAX_PARTICLES);
    this._mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this._mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_PARTICLES * 3), 3
    );
    this._mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    this._mesh.count = 0;
    this._mesh.frustumCulled = false;
    this._mesh.renderOrder = 4; // above entities, below UI
    scene.add(this._mesh);
  }

  /**
   * Add an emitter that continuously spawns particles.
   * @param {object} config
   * @param {string} config.type — particle behavior type
   * @param {number} config.x — emitter world X
   * @param {number} config.y — emitter world Y
   * @param {number} config.rate — particles per second
   * @param {number} config.radius — spawn radius
   * @param {number[]} config.color — [r,g,b] 0-1
   * @param {number} config.life — particle lifetime in seconds
   * @param {number} [config.size] — particle size multiplier
   * @param {boolean} [config.followCamera] — spawn relative to camera
   * @param {number} [config.areaW] — area width for camera-relative emitters
   * @param {number} [config.areaH] — area height for camera-relative emitters
   * @returns {object} emitter reference (for removal)
   */
  addEmitter(config) {
    const emitter = {
      type: config.type || 'sparkle',
      x: config.x || 0,
      y: config.y || 0,
      rate: config.rate || 5,
      radius: config.radius || 1,
      color: config.color || [1, 1, 0.7],
      life: config.life || 3,
      size: config.size || 1,
      followCamera: config.followCamera || false,
      areaW: config.areaW || 20,
      areaH: config.areaH || 14,
      _accumulator: 0,
      active: true,
    };
    this._emitters.push(emitter);
    return emitter;
  }

  /**
   * Remove a specific emitter (particles finish naturally).
   */
  removeEmitter(emitter) {
    emitter.active = false;
    const idx = this._emitters.indexOf(emitter);
    if (idx >= 0) this._emitters.splice(idx, 1);
  }

  /**
   * Spawn a one-shot burst of particles.
   */
  burst(x, y, count, config) {
    for (let i = 0; i < count && this._particles.length < MAX_PARTICLES; i++) {
      this._spawnParticle(x, y, config);
    }
  }

  update(dt, camera) {
    this._time += dt;

    // Spawn from emitters
    for (const em of this._emitters) {
      if (!em.active) continue;
      em._accumulator += dt * em.rate;
      while (em._accumulator >= 1 && this._particles.length < MAX_PARTICLES) {
        em._accumulator -= 1;
        let sx = em.x, sy = em.y;
        if (em.followCamera && camera) {
          sx = camera.position.x + (Math.random() - 0.5) * em.areaW;
          sy = -camera.position.y + (Math.random() - 0.5) * em.areaH;
        } else {
          sx += (Math.random() - 0.5) * em.radius * 2;
          sy += (Math.random() - 0.5) * em.radius * 2;
        }
        this._spawnParticle(sx, sy, em);
      }
    }

    // Update particles
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        this._particles.splice(i, 1);
        continue;
      }

      const t = p.age / p.life; // 0→1 normalized lifetime

      // Type-specific behavior
      switch (p.type) {
        case 'firefly':
          p.x += Math.sin(this._time * 2 + p.phase) * 0.3 * dt;
          p.y += Math.cos(this._time * 1.5 + p.phase * 1.3) * 0.2 * dt;
          p.opacity = (0.3 + Math.sin(this._time * 4 + p.phase) * 0.7) * (1 - t * t);
          p.scale = p.baseSize * (0.8 + Math.sin(this._time * 3 + p.phase) * 0.4);
          break;

        case 'leaf':
          p.x += Math.sin(this._time * 1.5 + p.phase) * 0.5 * dt + p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.rotSpeed * dt;
          p.opacity = t < 0.1 ? t * 10 : (1 - (t - 0.1) / 0.9);
          p.scale = p.baseSize;
          break;

        case 'spark':
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 2.0 * dt; // gravity
          p.opacity = 1 - t;
          p.scale = p.baseSize * (1 - t * 0.5);
          break;

        case 'sparkle':
          p.opacity = (0.2 + Math.sin(this._time * 5 + p.phase) * 0.8) * (1 - t);
          p.scale = p.baseSize * (0.6 + Math.sin(this._time * 3 + p.phase * 2) * 0.4);
          break;

        case 'bubble':
          p.x += Math.sin(this._time + p.phase) * 0.15 * dt;
          p.y -= 0.4 * dt; // rise
          p.opacity = t < 0.1 ? t * 10 : Math.max(0, 1 - (t - 0.7) / 0.3);
          p.scale = p.baseSize * (0.8 + t * 0.4);
          break;

        case 'petal':
          p.x += (Math.sin(this._time * 0.8 + p.phase) * 0.4 + p.vx) * dt;
          p.y += p.vy * dt;
          p.rotation += p.rotSpeed * dt;
          p.opacity = t < 0.15 ? t / 0.15 : (1 - (t - 0.15) / 0.85) * 0.8;
          p.scale = p.baseSize;
          break;

        case 'dust':
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.opacity = (t < 0.2 ? t * 5 : (1 - (t - 0.2) / 0.8)) * 0.4;
          p.scale = p.baseSize * (1 + t * 0.3);
          break;

        case 'wisp':
          p.x += p.vx * dt;
          p.y += Math.sin(this._time + p.phase) * 0.1 * dt;
          p.opacity = (0.15 + Math.sin(this._time * 0.5 + p.phase) * 0.15) * (1 - t);
          p.scale = p.baseSize * (1 + t * 0.5);
          break;

        default:
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.opacity = 1 - t;
          break;
      }
    }

    // Upload to InstancedMesh
    this._mesh.count = this._particles.length;
    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];
      _dummy.position.set(p.x, -p.y, p.z);
      _dummy.scale.setScalar(p.scale);
      _dummy.rotation.z = p.rotation || 0;
      _dummy.updateMatrix();
      this._mesh.setMatrixAt(i, _dummy.matrix);

      _color.setRGB(p.color[0] * p.opacity, p.color[1] * p.opacity, p.color[2] * p.opacity);
      this._mesh.setColorAt(i, _color);
    }

    if (this._particles.length > 0) {
      this._mesh.instanceMatrix.needsUpdate = true;
      this._mesh.instanceColor.needsUpdate = true;
    }
  }

  _spawnParticle(x, y, config) {
    const type = config.type || 'sparkle';
    const p = {
      x, y,
      z: 0.35 + Math.random() * 0.1,
      vx: 0, vy: 0,
      age: 0,
      life: config.life || 3,
      color: config.color || [1, 1, 0.7],
      opacity: 0,
      scale: 1,
      baseSize: (config.size || 1) * (0.7 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2,
      rotation: 0,
      rotSpeed: 0,
      type,
    };

    // Type-specific initial velocity
    switch (type) {
      case 'firefly':
        p.z = 0.3 + Math.random() * 0.2;
        break;
      case 'leaf':
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = 0.3 + Math.random() * 0.4;
        p.rotSpeed = (Math.random() - 0.5) * 3;
        p.z = 0.25 + Math.random() * 0.15;
        break;
      case 'spark':
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = -(1 + Math.random() * 2); // upward
        p.z = 0.35;
        break;
      case 'bubble':
        p.z = 0.15 + Math.random() * 0.1;
        break;
      case 'petal':
        p.vx = 0.2 + Math.random() * 0.3;
        p.vy = 0.1 + Math.random() * 0.2;
        p.rotSpeed = (Math.random() - 0.5) * 2;
        p.z = 0.3;
        break;
      case 'dust':
        p.vx = (Math.random() - 0.5) * 0.2;
        p.vy = (Math.random() - 0.5) * 0.1;
        p.z = 0.2;
        break;
      case 'wisp':
        p.vx = 0.1 + Math.random() * 0.2;
        p.z = 0.18;
        break;
    }

    this._particles.push(p);
  }

  dispose() {
    this._emitters = [];
    this._particles = [];
    if (this._mesh) {
      this._scene.remove(this._mesh);
      this._mesh.geometry.dispose();
      this._mesh.material.dispose();
      this._mesh = null;
    }
  }
}
