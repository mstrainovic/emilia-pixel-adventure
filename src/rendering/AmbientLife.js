import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem.js';

/**
 * Ambient world animation renderer.
 * Handles: swaying trees, wave animation, drifting clouds, scene-specific particles.
 * Each effect is opt-in per scene and operates on existing meshes/tiles.
 */
export class AmbientLife {
  constructor(scene, camera) {
    this._scene = scene;
    this._camera = camera;
    this._swayingProps = [];    // refs to tree prop meshes
    this._cloudSprites = [];   // drifting cloud overlay sprites
    this._cloudShadows = [];   // ground shadow meshes that follow clouds
    this._waveOffsets = [];    // water tile UV animation state
    this._waveMeshes = [];     // wave overlay meshes on water tiles
    this._constellationMeshes = []; // star pattern meshes (starsky)
    this._particles = null;    // particle system for ambient effects
    this._time = 0;
    this._mapWidth = 0;
    this._mapHeight = 0;
  }

  /**
   * Initialize ambient effects for the current scene.
   * @param {string} sceneName
   * @param {Array} props - map props
   * @param {number} mapWidth
   * @param {number} mapHeight
   * @param {THREE.Mesh[]} propMeshes - array of tree prop meshes from TileMapRenderer
   */
  init(sceneName, props, mapWidth, mapHeight, propMeshes) {
    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;
    this.dispose();

    // Create particle system for this scene
    this._particles = new ParticleSystem(this._scene);

    // Swaying trees — find tree meshes among propMeshes
    const outdoorScenes = ['hub', 'forest', 'lake', 'unicorn_meadow', 'beach', 'cloud_castle'];
    if (outdoorScenes.includes(sceneName) && propMeshes) {
      for (const mesh of propMeshes) {
        if (mesh.userData?.isTree) {
          this._swayingProps.push({
            mesh,
            baseX: mesh.position.x,
            phase: Math.random() * Math.PI * 2,
            amplitude: 0.05,
            period: 3 + Math.random(),
          });
        }
      }
    }

    // Cloud drift — semi-transparent clouds on outdoor maps
    if (outdoorScenes.includes(sceneName)) {
      this._createDriftClouds(3 + Math.floor(Math.random() * 3));
    }

    // Wave animation — on scenes with water tiles
    const waterScenes = ['lake', 'beach', 'grotto'];
    if (waterScenes.includes(sceneName) && propMeshes) {
      this._createWaveOverlays(mapWidth, mapHeight, props);
    }

    // Constellation rendering — starsky only
    if (sceneName === 'starsky') {
      const constellationProp = props.find(p => p.type === 'constellation');
      if (constellationProp) {
        this._createConstellation(constellationProp.text, constellationProp.x, constellationProp.y);
      }
    }

    // Scene-specific ambient particles
    this._initSceneParticles(sceneName, props, propMeshes);
  }

  /**
   * Configure ambient particles per scene.
   */
  _initSceneParticles(sceneName, props, propMeshes) {
    if (!this._particles) return;

    switch (sceneName) {
      case 'hub': {
        // Floating pollen/dust in sunlight (camera-relative)
        this._particles.addEmitter({
          type: 'dust', rate: 3, followCamera: true,
          color: [1, 0.95, 0.7], life: 6, size: 0.6,
          areaW: 22, areaH: 16,
        });
        // Bonfire sparks — find bonfire props
        if (props) {
          for (const p of props) {
            if (p.type === 'bonfire') {
              this._particles.addEmitter({
                type: 'spark', x: p.x + 0.5, y: p.y + 0.5,
                rate: 4, radius: 0.3,
                color: [1, 0.6, 0.15], life: 1.2, size: 0.7,
              });
            }
          }
        }
        // Occasional butterflies/petal drift
        this._particles.addEmitter({
          type: 'petal', rate: 0.8, followCamera: true,
          color: [1, 0.85, 0.9], life: 8, size: 0.9,
          areaW: 22, areaH: 16,
        });
        break;
      }

      case 'forest': {
        // Falling leaves (camera-relative)
        this._particles.addEmitter({
          type: 'leaf', rate: 2, followCamera: true,
          color: [0.4, 0.7, 0.2], life: 5, size: 1.0,
          areaW: 22, areaH: 4,
        });
        // Some orange/yellow leaves
        this._particles.addEmitter({
          type: 'leaf', rate: 0.8, followCamera: true,
          color: [0.9, 0.7, 0.2], life: 5, size: 0.9,
          areaW: 22, areaH: 4,
        });
        // Fireflies (more visible at night — always present but subtle)
        this._particles.addEmitter({
          type: 'firefly', rate: 2.5, followCamera: true,
          color: [0.6, 1, 0.3], life: 5, size: 0.8,
          areaW: 20, areaH: 14,
        });
        // Dust motes in sun beams
        this._particles.addEmitter({
          type: 'dust', rate: 2, followCamera: true,
          color: [1, 1, 0.8], life: 7, size: 0.5,
          areaW: 20, areaH: 14,
        });
        break;
      }

      case 'lake': {
        // Water sparkles across the lake
        this._particles.addEmitter({
          type: 'sparkle', rate: 4, followCamera: true,
          color: [0.7, 0.9, 1], life: 3, size: 0.7,
          areaW: 20, areaH: 14,
        });
        // Mist wisps near water
        this._particles.addEmitter({
          type: 'wisp', rate: 1.5, followCamera: true,
          color: [0.8, 0.9, 1], life: 8, size: 2.0,
          areaW: 22, areaH: 16,
        });
        // Fireflies near shore
        this._particles.addEmitter({
          type: 'firefly', rate: 1.5, followCamera: true,
          color: [0.4, 0.9, 0.6], life: 5, size: 0.7,
          areaW: 18, areaH: 12,
        });
        break;
      }

      case 'unicorn_meadow': {
        // Magic sparkles — rainbow-ish
        this._particles.addEmitter({
          type: 'sparkle', rate: 5, followCamera: true,
          color: [1, 0.8, 1], life: 3, size: 0.8,
          areaW: 20, areaH: 14,
        });
        // Floating petals (pink/white)
        this._particles.addEmitter({
          type: 'petal', rate: 2, followCamera: true,
          color: [1, 0.7, 0.85], life: 7, size: 1.0,
          areaW: 22, areaH: 16,
        });
        // Golden dust
        this._particles.addEmitter({
          type: 'dust', rate: 2, followCamera: true,
          color: [1, 0.9, 0.5], life: 6, size: 0.7,
          areaW: 20, areaH: 14,
        });
        break;
      }

      case 'beach': {
        // Sand/dust particles (wind-blown)
        this._particles.addEmitter({
          type: 'dust', rate: 3, followCamera: true,
          color: [1, 0.95, 0.75], life: 4, size: 0.5,
          areaW: 22, areaH: 16,
        });
        // Sea spray sparkles
        this._particles.addEmitter({
          type: 'sparkle', rate: 3, followCamera: true,
          color: [0.8, 0.95, 1], life: 2.5, size: 0.6,
          areaW: 20, areaH: 14,
        });
        break;
      }

      case 'dungeon': {
        // Dust motes (sparse, eerie)
        this._particles.addEmitter({
          type: 'dust', rate: 1.5, followCamera: true,
          color: [0.6, 0.6, 0.8], life: 8, size: 0.5,
          areaW: 18, areaH: 12,
        });
        // Crystal sparkles
        this._particles.addEmitter({
          type: 'sparkle', rate: 3, followCamera: true,
          color: [0.6, 0.5, 1], life: 2.5, size: 0.9,
          areaW: 16, areaH: 12,
        });
        break;
      }

      case 'grotto': {
        // Bioluminescent particles
        this._particles.addEmitter({
          type: 'firefly', rate: 4, followCamera: true,
          color: [0.2, 0.8, 1], life: 5, size: 0.9,
          areaW: 18, areaH: 14,
        });
        // Rising bubbles
        this._particles.addEmitter({
          type: 'bubble', rate: 3, followCamera: true,
          color: [0.5, 0.8, 1], life: 4, size: 0.6,
          areaW: 16, areaH: 12,
        });
        // Crystal glow sparkles
        this._particles.addEmitter({
          type: 'sparkle', rate: 2.5, followCamera: true,
          color: [0.3, 1, 0.9], life: 3, size: 0.8,
          areaW: 16, areaH: 12,
        });
        break;
      }

      case 'cloud_castle': {
        // Cloud wisps
        this._particles.addEmitter({
          type: 'wisp', rate: 2, followCamera: true,
          color: [1, 1, 1], life: 10, size: 2.5,
          areaW: 22, areaH: 16,
        });
        // Golden sparkles
        this._particles.addEmitter({
          type: 'sparkle', rate: 4, followCamera: true,
          color: [1, 0.95, 0.6], life: 3, size: 0.8,
          areaW: 20, areaH: 14,
        });
        // Star dust
        this._particles.addEmitter({
          type: 'dust', rate: 2, followCamera: true,
          color: [1, 1, 0.9], life: 6, size: 0.6,
          areaW: 20, areaH: 14,
        });
        break;
      }

      case 'starsky': {
        // Nebula particles (slow, large, faint)
        this._particles.addEmitter({
          type: 'wisp', rate: 1, followCamera: true,
          color: [0.5, 0.3, 0.8], life: 12, size: 3.0,
          areaW: 24, areaH: 18,
        });
        // Twinkling stars everywhere
        this._particles.addEmitter({
          type: 'sparkle', rate: 5, followCamera: true,
          color: [0.9, 0.9, 1], life: 4, size: 0.6,
          areaW: 22, areaH: 16,
        });
        break;
      }
    }
  }

  _createDriftClouds(count) {
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(32, 18, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(22, 14, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(42, 15, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(30, 12, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.ellipse(32, 16, 14, 7, 0, 0, Math.PI * 2); ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;

      const size = 5 + Math.random() * 4;
      const geo = new THREE.PlaneGeometry(size, size * 0.5);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, depthWrite: false, opacity: 0.3,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        Math.random() * this._mapWidth,
        -(Math.random() * this._mapHeight),
        0.6
      );

      this._scene.add(mesh);
      this._cloudSprites.push({
        mesh, shadow: null, texture: tex,
        speed: 0.2 + Math.random() * 0.3,
        startX: -size,
        endX: this._mapWidth + size,
      });
    }
  }

  _createWaveOverlays(mapWidth, mapHeight, props) {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    for (let frame = 0; frame < 3; frame++) {
      const ox = frame * 16;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      const yOff = frame * 2;
      ctx.fillRect(ox + 2, 4 + yOff % 6, 12, 1);
      ctx.fillRect(ox + 4, 8 + yOff % 6, 8, 1);
      ctx.fillRect(ox + 1, 12 + yOff % 6, 10, 1);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.set(1/3, 1);

    const geo = new THREE.PlaneGeometry(mapWidth * 0.6, mapHeight * 0.4);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, opacity: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mapWidth / 2, -mapHeight / 2, 0.02);
    this._scene.add(mesh);
    this._waveMeshes.push({ mesh, texture: tex, frameTimer: 0 });
  }

  _createConstellation(text, cx, cy) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 64, 16);

    const imageData = ctx.getImageData(0, 0, 128, 32);
    const starPositions = [];
    for (let py = 0; py < 32; py += 3) {
      for (let px = 0; px < 128; px += 3) {
        const idx = (py * 128 + px) * 4;
        if (imageData.data[idx + 3] > 128) {
          starPositions.push({
            x: cx + (px - 64) * 0.03,
            y: cy + (py - 16) * 0.03,
          });
        }
      }
    }

    for (const star of starPositions) {
      const geo = new THREE.PlaneGeometry(0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA, transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(star.x, -star.y, 0.5);
      this._scene.add(mesh);
      this._constellationMeshes.push({
        mesh, baseOpacity: mat.opacity,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt, camera) {
    this._time += dt;

    // Swaying trees
    for (const tree of this._swayingProps) {
      const offset = Math.sin(this._time * (Math.PI * 2) / tree.period + tree.phase) * tree.amplitude;
      tree.mesh.position.x = tree.baseX + offset;
    }

    // Cloud drift
    for (const cloud of this._cloudSprites) {
      cloud.mesh.position.x += cloud.speed * dt;
      if (cloud.mesh.position.x > cloud.endX) {
        cloud.mesh.position.x = cloud.startX;
        cloud.mesh.position.y = -(Math.random() * this._mapHeight);
      }
    }

    // Wave animation
    for (const wave of this._waveMeshes) {
      wave.frameTimer += dt;
      if (wave.frameTimer >= 0.6) {
        wave.frameTimer = 0;
        const currentFrame = Math.floor(wave.texture.offset.x * 3) || 0;
        const nextFrame = (currentFrame + 1) % 3;
        wave.texture.offset.x = nextFrame / 3;
      }
    }

    // Constellation twinkle
    for (const star of this._constellationMeshes) {
      const twinkle = 0.5 + Math.sin(this._time * 2 + star.phase) * 0.5;
      star.mesh.material.opacity = star.baseOpacity * twinkle;
    }

    // Particle system
    if (this._particles) {
      this._particles.update(dt, camera);
    }
  }

  dispose() {
    for (const tree of this._swayingProps) {
      tree.mesh.position.x = tree.baseX;
    }
    this._swayingProps = [];

    for (const cloud of this._cloudSprites) {
      if (this._scene) this._scene.remove(cloud.mesh);
      cloud.mesh.geometry.dispose();
      cloud.mesh.material.dispose();
      cloud.texture.dispose();
      if (cloud.shadow && this._scene) {
        this._scene.remove(cloud.shadow);
        cloud.shadow.geometry.dispose();
        cloud.shadow.material.dispose();
      }
    }
    this._cloudSprites = [];
    this._cloudShadows = [];

    for (const wave of this._waveMeshes) {
      if (this._scene) this._scene.remove(wave.mesh);
      wave.mesh.geometry.dispose();
      wave.mesh.material.dispose();
      wave.texture.dispose();
    }
    this._waveMeshes = [];

    for (const star of this._constellationMeshes) {
      if (this._scene) this._scene.remove(star.mesh);
      star.mesh.geometry.dispose();
      star.mesh.material.dispose();
    }
    this._constellationMeshes = [];

    if (this._particles) {
      this._particles.dispose();
      this._particles = null;
    }
  }
}
