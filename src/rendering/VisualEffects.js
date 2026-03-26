import * as THREE from 'three';

/**
 * Visual effects system — sword slashes, water spray, hit sparks, heal particles.
 * All effects are temporary meshes added to the scene.
 */
export class VisualEffects {
  constructor(scene) {
    this.scene = scene;
    this.effects = [];
  }

  /**
   * Sword slash — visible pixel-art sword that sweeps across
   * plus a filled crescent blade trail and sparkle particles.
   */
  swordSlash(x, y, direction) {
    const z = 0.4 + y * 0.001;

    // ── Direction config ──
    const dirConfig = {
      down:  { ox: 0,    oy: 1.0,  rot: 0,              startRot: -0.5 },
      up:    { ox: 0,    oy: -1.0, rot: Math.PI,         startRot: 0.5 },
      left:  { ox: -1.0, oy: 0,    rot: Math.PI * 0.5,   startRot: -0.5 },
      right: { ox: 1.0,  oy: 0,    rot: -Math.PI * 0.5,  startRot: 0.5 },
    };
    const cfg = dirConfig[direction] || dirConfig.down;

    // ── 1. Pixel-art sword blade ──
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 16; sCanvas.height = 32;
    const sc = sCanvas.getContext('2d');
    // Handle (dark wood)
    sc.fillStyle = '#5C2E0E'; sc.fillRect(6, 25, 4, 7);
    sc.fillStyle = '#7B4A2B'; sc.fillRect(7, 26, 2, 5);
    // Pommel
    sc.fillStyle = '#DAA520'; sc.fillRect(7, 30, 2, 2);
    // Guard (gold crosspiece)
    sc.fillStyle = '#FFD700'; sc.fillRect(3, 22, 10, 3);
    sc.fillStyle = '#B8860B'; sc.fillRect(3, 24, 10, 1);
    // Blade (silver/steel)
    sc.fillStyle = '#A8A8B8'; sc.fillRect(6, 4, 4, 18);
    // Lighter center fuller
    sc.fillStyle = '#D0D0E0'; sc.fillRect(7, 3, 2, 17);
    // Bright edge highlight
    sc.fillStyle = '#FFFFFF'; sc.fillRect(9, 5, 1, 14);
    // Dark edge
    sc.fillStyle = '#808090'; sc.fillRect(6, 5, 1, 14);
    // Blade tip (pointed)
    sc.fillStyle = '#D0D0E0'; sc.fillRect(7, 1, 2, 3);
    sc.fillStyle = '#FFFFFF'; sc.fillRect(7, 0, 2, 2);
    sc.fillStyle = '#E8E8F0'; sc.fillRect(8, 0, 1, 1);

    const swordTex = new THREE.CanvasTexture(sCanvas);
    swordTex.magFilter = THREE.NearestFilter;
    swordTex.minFilter = THREE.NearestFilter;

    const sGeo = new THREE.PlaneGeometry(1, 2);
    const sMat = new THREE.MeshBasicMaterial({
      map: swordTex, transparent: true, depthWrite: false,
    });
    const sword = new THREE.Mesh(sGeo, sMat);
    // Position sword between player and slash center
    sword.position.set(x + cfg.ox * 0.6, -(y + cfg.oy * 0.6), z + 0.03);
    sword.rotation.z = cfg.rot - 0.8;
    this.scene.add(sword);

    this.effects.push({
      mesh: sword, age: 0, maxAge: 0.25,
      update: (dt, e) => {
        e.age += dt;
        const t = Math.min(1, e.age / e.maxAge);
        // Ease-out cubic for snappy sword swing
        const eased = 1 - Math.pow(1 - t, 3);
        sword.rotation.z = cfg.rot - 0.8 + 1.6 * eased;
        // Fade out last 30%
        sMat.opacity = t > 0.7 ? 1.0 - (t - 0.7) / 0.3 : 1.0;
        if (sMat.opacity <= 0.01) sword.visible = false;
      }
    });

    // ── 2. Slash trail (filled crescent blade shape) ──
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Outer crescent — the main visible blade trail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(32, 32, 26, -Math.PI * 0.65, Math.PI * 0.65);
    ctx.arc(32, 32, 16, Math.PI * 0.65, -Math.PI * 0.65, true);
    ctx.closePath();
    ctx.fill();

    // Inner warm glow
    ctx.fillStyle = 'rgba(255, 255, 210, 0.6)';
    ctx.beginPath();
    ctx.arc(32, 32, 24, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.arc(32, 32, 18, Math.PI * 0.55, -Math.PI * 0.55, true);
    ctx.closePath();
    ctx.fill();

    // Sharp outer edge highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(32, 32, 26, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const size = 3.0;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: texture, transparent: true, opacity: 0.9,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + cfg.ox, -(y + cfg.oy), z);
    mesh.rotation.z = cfg.rot + cfg.startRot;
    this.scene.add(mesh);

    this.effects.push({
      mesh, age: 0, maxAge: 0.2,
      _targetRot: cfg.rot - cfg.startRot,
      _startRot: cfg.rot + cfg.startRot,
      update: (dt, e) => {
        e.age += dt;
        const t = e.age / e.maxAge;
        mesh.rotation.z = e._startRot + (e._targetRot - e._startRot) * t;
        const s = 0.6 + t * 0.5;
        mesh.scale.set(s, s, 1);
        mat.opacity = t > 0.5 ? 0.9 * (1 - (t - 0.5) / 0.5) : 0.9;
        if (mat.opacity <= 0.01) mesh.visible = false;
      }
    });

    // ── 3. Sparkle trail along the slash arc ──
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.015;
      const angle = cfg.rot + (i / 7 - 0.5) * Math.PI * 0.9;
      const dist = 1.3 + Math.random() * 0.4;
      const px = x + cfg.ox + Math.cos(angle) * dist * 0.5;
      const py = y + cfg.oy + Math.sin(angle) * dist * 0.5;

      const pGeo = new THREE.PlaneGeometry(0.2, 0.2);
      const isGold = Math.random() > 0.5;
      const pMat = new THREE.MeshBasicMaterial({
        color: isGold ? 0xFFDD44 : 0xFFFFFF,
        transparent: true, opacity: 0.9, depthWrite: false,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(px, -py, z + 0.01);
      pMesh.visible = false;
      this.scene.add(pMesh);

      this.effects.push({
        mesh: pMesh, age: -delay, maxAge: 0.25,
        update: (dt, e) => {
          e.age += dt;
          if (e.age < 0) return;
          pMesh.visible = true;
          const t = e.age / e.maxAge;
          pMat.opacity = Math.max(0, 0.9 * (1 - t));
          const sc = 0.5 + t * 1.5;
          pMesh.scale.set(sc, sc, 1);
        }
      });
    }
  }

  /**
   * Water spray particles from player's hands.
   */
  waterSpray(x, y, direction) {
    const offsets = { down: [0, 1.2], up: [0, -1.2], left: [-1.2, 0], right: [1.2, 0] };
    const [dx, dy] = offsets[direction] || offsets.down;

    for (let i = 0; i < 12; i++) {
      const spread = (Math.random() - 0.5) * 1.5;
      const speed = 2 + Math.random() * 3;
      const sx = x + dx * 0.3;
      const sy = y + dy * 0.3;

      const size = 0.15 + Math.random() * 0.15;
      const geo = new THREE.PlaneGeometry(size, size);
      const blue = 0.6 + Math.random() * 0.4;
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.3, 0.6 + Math.random() * 0.3, blue),
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(sx, -sy, 0.35);
      this.scene.add(mesh);

      const vx = dx * speed + spread * (dy === 0 ? 0 : 1);
      const vy = dy * speed + spread * (dx === 0 ? 0 : 1);

      this.effects.push({
        mesh, age: 0, maxAge: 0.5 + Math.random() * 0.3,
        update: (dt, e) => {
          e.age += dt;
          mesh.position.x += vx * dt;
          mesh.position.y -= vy * dt;
          mesh.position.y -= 0.5 * dt; // gravity
          mat.opacity = Math.max(0, 0.8 * (1 - e.age / e.maxAge));
          mesh.scale.set(1 - e.age * 0.5, 1 - e.age * 0.5, 1);
        }
      });
    }
  }

  /**
   * Hit sparks when attacking a mob — Pokemon-style star burst.
   * Central flash + radiating sparks + lingering star shapes.
   */
  hitSparks(x, y) {
    const z = 0.4 + y * 0.001;

    // ── 1. Central impact flash (white circle that expands and fades) ──
    const flashGeo = new THREE.PlaneGeometry(0.8, 0.8);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.position.set(x, -y, z + 0.02);
    this.scene.add(flashMesh);

    this.effects.push({
      mesh: flashMesh, age: 0, maxAge: 0.15,
      update: (dt, e) => {
        e.age += dt;
        const t = e.age / e.maxAge;
        const s = 1 + t * 2.5;
        flashMesh.scale.set(s, s, 1);
        flashMat.opacity = Math.max(0, 0.9 * (1 - t));
      }
    });

    // ── 2. Radiating spark particles ──
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 3;

      const size = 0.15 + Math.random() * 0.1;
      const geo = new THREE.PlaneGeometry(size, size);
      const isWhite = Math.random() > 0.35;
      const mat = new THREE.MeshBasicMaterial({
        color: isWhite ? 0xffffff : 0xffdd44,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, -y, z + 0.01);
      this.scene.add(mesh);

      this.effects.push({
        mesh, age: 0, maxAge: 0.25,
        update: (dt, e) => {
          e.age += dt;
          const t = e.age / e.maxAge;
          // Fast start, decelerating outward
          const eased = 1 - Math.pow(1 - t, 2);
          mesh.position.x = x + Math.cos(angle) * speed * eased * 0.3;
          mesh.position.y = -y + Math.sin(angle) * speed * eased * 0.3;
          // Shrink and fade
          const s = 1 - t * 0.6;
          mesh.scale.set(s, s, 1);
          mat.opacity = Math.max(0, 1 - t * t);
        }
      });
    }

    // ── 3. Star shapes (4-pointed) that linger briefly ──
    for (let i = 0; i < 3; i++) {
      const ox = (Math.random() - 0.5) * 1.2;
      const oy = (Math.random() - 0.5) * 1.2;
      const starSize = 0.3 + Math.random() * 0.2;
      const starCanvas = VisualEffects._getStarTexture();

      const geo = new THREE.PlaneGeometry(starSize, starSize);
      const mat = new THREE.MeshBasicMaterial({
        map: starCanvas,
        color: i === 0 ? 0xffffff : 0xffee66,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + ox, -(y + oy * 0.5), z + 0.03);
      mesh.rotation.z = Math.random() * Math.PI;
      this.scene.add(mesh);

      const delay = i * 0.03;
      this.effects.push({
        mesh, age: -delay, maxAge: 0.3,
        update: (dt, e) => {
          e.age += dt;
          if (e.age < 0) { mesh.visible = false; return; }
          mesh.visible = true;
          const t = e.age / e.maxAge;
          mesh.rotation.z += dt * 5;
          const s = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
          mesh.scale.set(s * 1.5, s * 1.5, 1);
          mat.opacity = Math.max(0, 0.9 * (1 - t * t));
        }
      });
    }
  }

  /**
   * Impact particles when the player takes damage — red/orange burst.
   */
  playerHitEffect(x, y) {
    const z = 0.4 + y * 0.001;

    // Red-tinted central flash
    const flashGeo = new THREE.PlaneGeometry(0.6, 0.6);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.position.set(x, -y, z + 0.02);
    this.scene.add(flashMesh);

    this.effects.push({
      mesh: flashMesh, age: 0, maxAge: 0.2,
      update: (dt, e) => {
        e.age += dt;
        const t = e.age / e.maxAge;
        const s = 1 + t * 2;
        flashMesh.scale.set(s, s, 1);
        flashMat.opacity = Math.max(0, 0.7 * (1 - t));
      }
    });

    // Red/orange sparks flying outward
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.5;
      const speed = 3 + Math.random() * 2;
      const size = 0.12 + Math.random() * 0.08;
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff5533 : 0xffaa22,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, -y, z + 0.01);
      this.scene.add(mesh);

      this.effects.push({
        mesh, age: 0, maxAge: 0.3,
        update: (dt, e) => {
          e.age += dt;
          const t = e.age / e.maxAge;
          mesh.position.x = x + Math.cos(angle) * speed * t * 0.25;
          mesh.position.y = -y + Math.sin(angle) * speed * t * 0.25;
          mat.opacity = Math.max(0, 0.9 * (1 - t));
          const s = 1 - t * 0.5;
          mesh.scale.set(s, s, 1);
        }
      });
    }
  }

  /**
   * Get or create a shared 4-pointed star texture for impact effects.
   */
  static _getStarTexture() {
    if (VisualEffects._starTex) return VisualEffects._starTex;
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    // Draw 4-pointed star
    ctx.beginPath();
    ctx.moveTo(8, 0);   // top
    ctx.lineTo(10, 6);
    ctx.lineTo(16, 8);  // right
    ctx.lineTo(10, 10);
    ctx.lineTo(8, 16);  // bottom
    ctx.lineTo(6, 10);
    ctx.lineTo(0, 8);   // left
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    VisualEffects._starTex = tex;
    return tex;
  }

  /**
   * Green sparkles when a plant is healed.
   */
  healSparkles(x, y) {
    for (let i = 0; i < 10; i++) {
      const ox = (Math.random() - 0.5) * 1.5;
      const geo = new THREE.PlaneGeometry(0.15, 0.15);
      const green = 0.4 + Math.random() * 0.5;
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.2, green, 0.2 + Math.random() * 0.3),
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + ox, -y, 0.35);
      this.scene.add(mesh);

      const riseSpeed = 1.5 + Math.random() * 2;
      this.effects.push({
        mesh, age: 0, maxAge: 1.0 + Math.random() * 0.5,
        update: (dt, e) => {
          e.age += dt;
          mesh.position.y += riseSpeed * dt;
          mesh.position.x += Math.sin(e.age * 5) * 0.3 * dt;
          mat.opacity = Math.max(0, 1 - e.age / e.maxAge);
        }
      });
    }
  }

  /**
   * Sparkle burst + golden glow when picking up an item.
   * Replaces the old simple glow with a more rewarding effect.
   */
  pickupGlow(x, y) {
    const z = 0.35 + y * 0.001;

    // ── 1. Central expanding glow ring ──
    const glowGeo = new THREE.PlaneGeometry(1, 1);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(x, -y, z);
    this.scene.add(glowMesh);

    this.effects.push({
      mesh: glowMesh, age: 0, maxAge: 0.5,
      update: (dt, e) => {
        e.age += dt;
        const t = e.age / e.maxAge;
        glowMesh.scale.set(1 + t * 2.5, 1 + t * 2.5, 1);
        glowMat.opacity = Math.max(0, 0.5 * (1 - t));
      }
    });

    // ── 2. Sparkle particles bursting outward ──
    const sparkleCount = 7;
    const colors = [0xFFDD44, 0xFFFFAA, 0xFFFF66, 0xFFEE88, 0xFFFFFF];
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkleCount + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 2.5;
      const size = 0.12 + Math.random() * 0.1;

      const geo = new THREE.PlaneGeometry(size, size);
      const col = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, -y, z + 0.01);
      this.scene.add(mesh);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.effects.push({
        mesh, age: 0, maxAge: 0.5 + Math.random() * 0.2,
        update: (dt, e) => {
          e.age += dt;
          const t = e.age / e.maxAge;
          mesh.position.x += vx * dt * (1 - t * 0.5); // slow down over time
          mesh.position.y += vy * dt * (1 - t * 0.5);
          mat.opacity = Math.max(0, 1.0 * (1 - t));
          const sc = 1.0 + t * 0.5;
          mesh.scale.set(sc, sc, 1);
          // Slight twinkle rotation
          mesh.rotation.z += dt * 8;
        }
      });
    }

    // ── 3. Rising star particles (float upward) ──
    for (let i = 0; i < 3; i++) {
      const ox = (Math.random() - 0.5) * 0.8;
      const delay = i * 0.06;
      const geo = new THREE.PlaneGeometry(0.18, 0.18);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFFDD,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + ox, -y, z + 0.02);
      mesh.visible = false;
      this.scene.add(mesh);

      this.effects.push({
        mesh, age: -delay, maxAge: 0.8,
        update: (dt, e) => {
          e.age += dt;
          if (e.age < 0) return;
          mesh.visible = true;
          const t = e.age / e.maxAge;
          mesh.position.y += 2.5 * dt; // float upward
          mesh.position.x += Math.sin(e.age * 6) * 0.3 * dt; // gentle sway
          mat.opacity = Math.max(0, 0.9 * (1 - t * t)); // quadratic fade
          const sc = 0.8 - t * 0.4;
          mesh.scale.set(Math.max(0.1, sc), Math.max(0.1, sc), 1);
        }
      });
    }
  }

  /**
   * Per-scene ambient floating particles — pollen, fireflies, sparkles, embers, etc.
   * Call once per scene — creates permanent particles that loop within map bounds.
   * @param {string} sceneName — hub, forest, dungeon, lake, beach, grotto, etc.
   * @param {{width: number, height: number}} bounds — map dimensions in tile units
   */
  startAmbientParticles(sceneName, bounds) {
    // Ensure shared circular particle texture exists
    if (!VisualEffects._particleTex) {
      const c = document.createElement('canvas');
      c.width = 8; c.height = 8;
      const cx = c.getContext('2d');
      cx.fillStyle = '#ffffff';
      cx.beginPath(); cx.arc(4, 4, 3.5, 0, Math.PI * 2); cx.fill();
      VisualEffects._particleTex = new THREE.CanvasTexture(c);
      VisualEffects._particleTex.magFilter = THREE.LinearFilter;
      VisualEffects._particleTex.minFilter = THREE.LinearFilter;
    }

    const w = bounds.width;
    const h = bounds.height;

    // Skip unicorn_meadow — already has its own magic particles
    if (sceneName === 'unicorn_meadow') return;

    // ── Scene-specific particle definitions ──
    // Each entry: { color, size, alpha, behavior }
    // behavior: 'drift' (gentle float), 'fall' (leaves falling), 'rise' (embers),
    //           'sine' (butterflies), 'pulse' (fireflies), 'sparkle' (water glints),
    //           'horizontal' (wind-blown), 'bubbles' (rising bubbles)
    const particleDefs = this._getSceneParticleDefs(sceneName);

    for (const def of particleDefs) {
      for (let i = 0; i < def.count; i++) {
        const geo = new THREE.PlaneGeometry(def.size, def.size);
        const mat = new THREE.MeshBasicMaterial({
          map: VisualEffects._particleTex,
          color: new THREE.Color(def.color[0] / 255, def.color[1] / 255, def.color[2] / 255),
          transparent: true,
          opacity: def.alpha * (0.5 + Math.random() * 0.5),
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Spread across the whole map
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        const zLayer = 0.35 + Math.random() * 0.1;
        mesh.position.set(startX, -startY, zLayer);
        this.scene.add(mesh);

        const phase = Math.random() * Math.PI * 2;
        const baseOp = mat.opacity;
        const speedVar = 0.7 + Math.random() * 0.6; // per-particle speed variation

        this.effects.push({
          mesh, age: Math.random() * 20, maxAge: Infinity,
          _phase: phase,
          _baseOp: baseOp,
          _speed: (def.speed || 0.3) * speedVar,
          _w: w,
          _h: h,
          _behavior: def.behavior,
          _driftX: (Math.random() - 0.5) * (def.driftX || 0.3),
          _driftY: def.driftY || 0,
          _sineAmp: def.sineAmp || 1.5,
          _sineFreq: def.sineFreq || 1.0,
          _pulseSpeed: def.pulseSpeed || 2.0,
          update: (dt, e) => {
            e.age += dt;
            const t = e.age;

            switch (e._behavior) {
              case 'drift':
                // Gentle floating — pollen/seeds drifting in breeze
                mesh.position.x += e._driftX * dt;
                mesh.position.y += Math.cos(t * e._speed * 0.7 + e._phase) * 0.15 * dt;
                // Gentle sine sway
                mesh.position.x += Math.sin(t * 0.5 + e._phase) * 0.05 * dt;
                mat.opacity = e._baseOp * (0.6 + 0.4 * Math.sin(t * e._pulseSpeed + e._phase));
                break;

              case 'sine':
                // Butterfly-like sine-wave path
                mesh.position.x += e._driftX * dt * 1.5;
                mesh.position.y += Math.sin(t * e._sineFreq + e._phase) * e._sineAmp * dt;
                mat.opacity = e._baseOp * (0.7 + 0.3 * Math.sin(t * 3 + e._phase));
                break;

              case 'fall':
                // Leaves falling slowly with horizontal sway
                mesh.position.y -= e._speed * 0.4 * dt; // fall downward (Three.js: -Y = down)
                mesh.position.x += Math.sin(t * 1.2 + e._phase) * 0.4 * dt;
                mesh.rotation.z += dt * (0.5 + Math.sin(e._phase)); // tumble
                mat.opacity = e._baseOp * (0.5 + 0.5 * Math.sin(t * 1.5 + e._phase));
                break;

              case 'pulse':
                // Firefly — slow drift + strong opacity pulse (twinkle on/off)
                mesh.position.x += Math.sin(t * 0.3 + e._phase) * 0.3 * dt;
                mesh.position.y += Math.cos(t * 0.2 + e._phase * 1.3) * 0.2 * dt;
                // Sharp firefly pulse: bright peaks with long dim phases
                const pulse = Math.pow(Math.max(0, Math.sin(t * e._pulseSpeed + e._phase)), 3);
                mat.opacity = e._baseOp * (0.1 + 0.9 * pulse);
                break;

              case 'sparkle':
                // Water sparkle — mostly stationary, rapid opacity flicker
                mesh.position.x += Math.sin(t * 0.2 + e._phase) * 0.05 * dt;
                mesh.position.y += Math.cos(t * 0.15 + e._phase) * 0.03 * dt;
                // Random-feeling sparkle: combine two frequencies
                const spark = Math.max(0, Math.sin(t * 4 + e._phase) * Math.sin(t * 7.3 + e._phase * 2));
                mat.opacity = e._baseOp * spark;
                break;

              case 'rise':
                // Embers/sparks rising from torches
                mesh.position.y += e._speed * 0.6 * dt; // rise upward
                mesh.position.x += Math.sin(t * 2 + e._phase) * 0.2 * dt;
                mat.opacity = e._baseOp * Math.max(0, 1 - (t % 5) / 5);
                // Shrink as they rise
                const riseLife = (t % 5) / 5;
                const sc = 1 - riseLife * 0.6;
                mesh.scale.set(Math.max(0.2, sc), Math.max(0.2, sc), 1);
                break;

              case 'horizontal':
                // Wind-blown sand/particles moving sideways
                mesh.position.x += e._speed * 1.2 * dt;
                mesh.position.y += Math.sin(t * 2 + e._phase) * 0.1 * dt;
                mat.opacity = e._baseOp * (0.4 + 0.6 * Math.sin(t * 1.5 + e._phase));
                break;

              case 'bubbles':
                // Bubbles rise upward with horizontal wobble
                mesh.position.y += e._speed * dt;
                mesh.position.x += Math.sin(t * 1.5 + e._phase) * 0.3 * dt;
                mat.opacity = e._baseOp * (0.5 + 0.5 * Math.sin(t * 2 + e._phase));
                break;

              default:
                // Fallback: gentle drift
                mesh.position.x += Math.sin(t * e._speed + e._phase) * 0.5 * dt;
                mesh.position.y += Math.cos(t * e._speed * 0.7 + e._phase) * 0.3 * dt;
                mat.opacity = e._baseOp * (0.5 + 0.5 * Math.sin(t * 2 + e._phase));
            }

            // ── Wrap within map bounds ──
            if (mesh.position.x < -1) mesh.position.x = e._w + 1;
            if (mesh.position.x > e._w + 1) mesh.position.x = -1;
            if (mesh.position.y > 1) mesh.position.y = -(e._h + 1); // top overflow: wrap to bottom
            if (mesh.position.y < -(e._h + 1)) mesh.position.y = 1;   // bottom overflow: wrap to top
          }
        });
      }
    }
  }

  /**
   * Returns particle definitions for each scene type.
   * Each scene gets 2-3 particle subtypes for visual variety.
   */
  _getSceneParticleDefs(sceneName) {
    switch (sceneName) {
      case 'hub':
        return [
          // Gentle pollen/seed particles floating in breeze
          { count: 12, color: [255, 255, 220], size: 0.1, alpha: 0.3,
            speed: 0.3, behavior: 'drift', driftX: 0.15, pulseSpeed: 1.5 },
          // Occasional butterfly-like sine-wave movers
          { count: 6, color: [255, 200, 120], size: 0.13, alpha: 0.35,
            speed: 0.5, behavior: 'sine', driftX: 0.3, sineAmp: 1.2, sineFreq: 1.5 },
        ];

      case 'forest':
        return [
          // Leaves falling slowly
          { count: 10, color: [120, 180, 80], size: 0.12, alpha: 0.3,
            speed: 0.4, behavior: 'fall', driftX: 0.1 },
          // Brown leaves too
          { count: 5, color: [160, 120, 60], size: 0.11, alpha: 0.25,
            speed: 0.35, behavior: 'fall', driftX: -0.08 },
          // Firefly-like glowing dots with pulsing
          { count: 8, color: [200, 255, 80], size: 0.12, alpha: 0.5,
            speed: 0.2, behavior: 'pulse', pulseSpeed: 1.2 },
        ];

      case 'lake':
        return [
          // Water sparkles on lake surface
          { count: 10, color: [255, 255, 255], size: 0.1, alpha: 0.5,
            speed: 0.1, behavior: 'sparkle' },
          // Dragonfly-like movers near water edge
          { count: 5, color: [100, 200, 220], size: 0.12, alpha: 0.35,
            speed: 0.6, behavior: 'sine', driftX: 0.4, sineAmp: 1.0, sineFreq: 2.0 },
        ];

      case 'dungeon':
        return [
          // Dust motes drifting slowly in dim light
          { count: 6, color: [180, 170, 150], size: 0.08, alpha: 0.2,
            speed: 0.12, behavior: 'drift', driftX: 0.05, pulseSpeed: 0.8 },
          // Ember/spark particles rising from torches
          { count: 5, color: [255, 140, 40], size: 0.1, alpha: 0.4,
            speed: 0.5, behavior: 'rise' },
        ];

      case 'beach':
        return [
          // Sand grains blown by wind (horizontal drift)
          { count: 8, color: [220, 200, 160], size: 0.08, alpha: 0.2,
            speed: 0.6, behavior: 'horizontal' },
          // Distant seagull-like dots in sky (very slow drift high up)
          { count: 4, color: [240, 240, 240], size: 0.14, alpha: 0.25,
            speed: 0.15, behavior: 'drift', driftX: 0.2, pulseSpeed: 0.5 },
        ];

      case 'grotto':
        return [
          // Bubbles rising
          { count: 10, color: [128, 255, 255], size: 0.12, alpha: 0.4,
            speed: 0.4, behavior: 'bubbles' },
          // Faint bioluminescent sparkles
          { count: 5, color: [100, 220, 200], size: 0.08, alpha: 0.3,
            speed: 0.15, behavior: 'pulse', pulseSpeed: 1.0 },
        ];

      case 'cloud_castle':
        return [
          // Snowflake-like gentle drift
          { count: 14, color: [240, 240, 255], size: 0.1, alpha: 0.3,
            speed: 0.25, behavior: 'fall', driftX: 0.1 },
          // Faint sparkles in the clouds
          { count: 4, color: [255, 255, 220], size: 0.08, alpha: 0.2,
            speed: 0.1, behavior: 'sparkle' },
        ];

      case 'starsky':
        return [
          // Slow-drifting cosmic dust
          { count: 10, color: [200, 180, 255], size: 0.08, alpha: 0.25,
            speed: 0.15, behavior: 'drift', driftX: 0.05, pulseSpeed: 1.2 },
          // Twinkling star-like sparkles
          { count: 6, color: [255, 255, 200], size: 0.1, alpha: 0.35,
            speed: 0.1, behavior: 'pulse', pulseSpeed: 1.8 },
        ];

      default:
        // Fallback: gentle pollen
        return [
          { count: 12, color: [255, 255, 200], size: 0.1, alpha: 0.3,
            speed: 0.25, behavior: 'drift', driftX: 0.1, pulseSpeed: 1.5 },
        ];
    }
  }

  /**
   * Dust puff at player's feet when moving.
   */
  footDust(x, y) {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(0.15, 0.15);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xbbaa88,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x + (Math.random() - 0.5) * 0.5, -(y + 0.8), 0.15);
      this.scene.add(mesh);

      this.effects.push({
        mesh, age: 0, maxAge: 0.4,
        update: (dt, e) => {
          e.age += dt;
          mesh.position.y += 0.5 * dt;
          mesh.scale.set(1 + e.age * 2, 1 + e.age * 2, 1);
          mat.opacity = Math.max(0, 0.3 * (1 - e.age / e.maxAge));
        }
      });
    }
  }

  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.update(dt, e);
      if (e.age >= e.maxAge) {
        // Ensure the mesh is hidden immediately before disposal
        e.mesh.visible = false;
        this.scene.remove(e.mesh);
        e.mesh.geometry.dispose();
        // Dispose texture map if present (e.g. CanvasTexture from swordSlash)
        if (e.mesh.material.map) e.mesh.material.map.dispose();
        e.mesh.material.dispose();
        this.effects.splice(i, 1);
      }
    }
  }

  clear() {
    for (const e of this.effects) {
      e.mesh.visible = false;
      this.scene.remove(e.mesh);
      e.mesh.geometry.dispose();
      if (e.mesh.material.map) e.mesh.material.map.dispose();
      e.mesh.material.dispose();
    }
    this.effects = [];
  }

  dispose() {
    this.clear();
  }
}
