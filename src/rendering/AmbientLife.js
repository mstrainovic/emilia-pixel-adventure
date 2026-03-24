import * as THREE from 'three';

/**
 * Ambient world animation renderer.
 * Handles: swaying trees, wave animation, drifting clouds.
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

    // Swaying trees — find tree meshes among propMeshes
    const outdoorScenes = ['hub', 'forest', 'lake', 'unicorn_meadow', 'beach', 'cloud_castle'];
    if (outdoorScenes.includes(sceneName) && propMeshes) {
      for (const mesh of propMeshes) {
        if (mesh.userData?.isTree) {
          this._swayingProps.push({
            mesh,
            baseX: mesh.position.x,
            phase: Math.random() * Math.PI * 2, // random phase offset
            amplitude: 0.05, // +-0.05 tiles sway
            period: 3 + Math.random(), // 3-4 seconds
          });
        }
      }
    }

    // Cloud drift — semi-transparent clouds on outdoor maps
    if (outdoorScenes.includes(sceneName)) {
      this._createDriftClouds(3 + Math.floor(Math.random() * 3)); // 3-5 clouds
    }

    // Wave animation — on scenes with water tiles (lake, beach, grotto)
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
  }

  _createDriftClouds(count) {
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');

      // Draw fluffy cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(4, 4, 24, 10);
      ctx.fillRect(8, 2, 16, 12);
      ctx.fillRect(2, 6, 28, 6);
      // Lighter center
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(10, 4, 12, 8);

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;

      const size = 4 + Math.random() * 4; // 4-8 tiles wide
      const geo = new THREE.PlaneGeometry(size, size * 0.5);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        opacity: 0.4,
      });

      const mesh = new THREE.Mesh(geo, mat);
      // Random starting position
      mesh.position.set(
        Math.random() * this._mapWidth,
        -(Math.random() * this._mapHeight),
        0.6 // above entities
      );

      this._scene.add(mesh);

      // Cloud ground shadow — darker oval below each cloud
      const shadowGeo = new THREE.PlaneGeometry(size * 0.8, size * 0.3);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        depthWrite: false,
        opacity: 0.1,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(mesh.position.x, mesh.position.y - 2, 0.01); // on ground
      this._scene.add(shadowMesh);
      this._cloudShadows.push(shadowMesh);

      this._cloudSprites.push({
        mesh,
        shadow: shadowMesh,
        texture: tex,
        speed: 0.3 + Math.random() * 0.4, // tiles per second
        startX: -size,
        endX: this._mapWidth + size,
      });
    }
  }

  _createWaveOverlays(mapWidth, mapHeight, props) {
    // Find water tile positions from props (type: 'water_zone') or generate for water scenes
    // Creates subtle wave overlay meshes that animate UV offset
    const canvas = document.createElement('canvas');
    canvas.width = 48; // 3 frames x 16px
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // 3-frame wave animation: gentle ripple lines
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
    tex.repeat.set(1/3, 1); // show 1 of 3 frames

    // Create wave overlay covering water area (approximate)
    const geo = new THREE.PlaneGeometry(mapWidth * 0.6, mapHeight * 0.4);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(mapWidth / 2, -mapHeight / 2, 0.02);
    this._scene.add(mesh);
    this._waveMeshes.push({ mesh, texture: tex, frameTimer: 0 });
  }

  _createConstellation(text, cx, cy) {
    // Render "Danke Emilia" as a star constellation pattern
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Write text in pixel font, then convert lit pixels to star positions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 64, 16);

    // Read pixel data and create star dots
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

    // Create star point meshes
    for (const star of starPositions) {
      const geo = new THREE.PlaneGeometry(0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFFAA,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(star.x, -star.y, 0.5);
      this._scene.add(mesh);
      this._constellationMeshes.push({
        mesh,
        baseOpacity: mat.opacity,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt) {
    this._time += dt;

    // ── Swaying trees ──
    for (const tree of this._swayingProps) {
      const offset = Math.sin(this._time * (Math.PI * 2) / tree.period + tree.phase) * tree.amplitude;
      tree.mesh.position.x = tree.baseX + offset;
    }

    // ── Cloud drift + ground shadows ──
    for (const cloud of this._cloudSprites) {
      cloud.mesh.position.x += cloud.speed * dt;
      // Move shadow to follow cloud (offset below)
      if (cloud.shadow) {
        cloud.shadow.position.x = cloud.mesh.position.x;
        cloud.shadow.position.y = cloud.mesh.position.y - 2;
      }
      // Wrap around
      if (cloud.mesh.position.x > cloud.endX) {
        cloud.mesh.position.x = cloud.startX;
        cloud.mesh.position.y = -(Math.random() * this._mapHeight);
      }
    }

    // ── Wave animation (3-frame UV shift) ──
    for (const wave of this._waveMeshes) {
      wave.frameTimer += dt;
      if (wave.frameTimer >= 0.6) { // switch frame every 0.6s
        wave.frameTimer = 0;
        const currentFrame = Math.floor(wave.texture.offset.x * 3) || 0;
        const nextFrame = (currentFrame + 1) % 3;
        wave.texture.offset.x = nextFrame / 3;
      }
    }

    // ── Constellation twinkle ──
    for (const star of this._constellationMeshes) {
      const twinkle = 0.5 + Math.sin(this._time * 2 + star.phase) * 0.5;
      star.mesh.material.opacity = star.baseOpacity * twinkle;
    }
  }

  dispose() {
    // Reset swaying trees (don't dispose — they belong to TileMapRenderer)
    for (const tree of this._swayingProps) {
      tree.mesh.position.x = tree.baseX;
    }
    this._swayingProps = [];

    // Remove cloud sprites + shadows
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

    // Remove wave overlays
    for (const wave of this._waveMeshes) {
      if (this._scene) this._scene.remove(wave.mesh);
      wave.mesh.geometry.dispose();
      wave.mesh.material.dispose();
      wave.texture.dispose();
    }
    this._waveMeshes = [];

    // Remove constellation stars
    for (const star of this._constellationMeshes) {
      if (this._scene) this._scene.remove(star.mesh);
      star.mesh.geometry.dispose();
      star.mesh.material.dispose();
    }
    this._constellationMeshes = [];
  }
}
