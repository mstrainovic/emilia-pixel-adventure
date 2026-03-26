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
   * Ambient floating particles (pollen, dust motes, fireflies).
   * Call once per scene — creates permanent particles that loop.
   */
  startAmbientParticles(cameraX, cameraY, type = 'pollen') {
    const configs = {
      pollen: { count: 25, color: [255, 255, 200], size: 0.12, speed: 0.3, alpha: 0.4 },
      firefly: { count: 15, color: [200, 255, 100], size: 0.15, speed: 0.5, alpha: 0.6 },
      dust: { count: 20, color: [200, 180, 150], size: 0.1, speed: 0.15, alpha: 0.25 },
      magic: { count: 30, color: [255, 220, 255], size: 0.14, speed: 0.4, alpha: 0.5 },
      bubbles: { count: 30, color: [128, 255, 255], size: 0.15, speed: 0.4, alpha: 0.5 },
    };
    const cfg = configs[type] || configs.pollen;
    const isBubbles = (type === 'bubbles');

    // Create a shared circular particle texture (avoids flat colored rectangles)
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

    for (let i = 0; i < cfg.count; i++) {
      const geo = new THREE.PlaneGeometry(cfg.size, cfg.size);
      const mat = new THREE.MeshBasicMaterial({
        map: VisualEffects._particleTex,
        color: new THREE.Color(cfg.color[0] / 255, cfg.color[1] / 255, cfg.color[2] / 255),
        transparent: true,
        opacity: cfg.alpha * (0.5 + Math.random() * 0.5),
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const ox = (Math.random() - 0.5) * 20;
      const oy = (Math.random() - 0.5) * 14;
      mesh.position.set(cameraX + ox, -(cameraY + oy), 0.35 + Math.random() * 0.1);
      this.scene.add(mesh);

      const phase = Math.random() * Math.PI * 2;
      const baseOp = mat.opacity;

      this.effects.push({
        mesh, age: 0, maxAge: Infinity, // permanent — loops forever
        _phase: phase,
        _baseX: mesh.position.x,
        _baseY: mesh.position.y,
        _speed: cfg.speed,
        _baseOp: baseOp,
        _isBubbles: isBubbles,
        update: (dt, e) => {
          e.age += dt;
          if (e._isBubbles) {
            // Bubbles rise upward (+Y in Three.js) with gentle horizontal wobble
            mesh.position.y += e._speed * dt;
            mesh.position.x = e._baseX + Math.sin(e.age * 1.5 + e._phase) * 0.8;
            // Reset when risen too far (loop back down)
            if (mesh.position.y > e._baseY + 10) {
              mesh.position.y = e._baseY - 5;
            }
          } else {
            // Gentle floating motion
            mesh.position.x = e._baseX + Math.sin(e.age * e._speed + e._phase) * 1.5;
            mesh.position.y = e._baseY + Math.cos(e.age * e._speed * 0.7 + e._phase) * 1.0;
          }
          // Opacity pulse (firefly twinkle)
          mat.opacity = e._baseOp * (0.5 + 0.5 * Math.sin(e.age * 2 + e._phase));
        }
      });
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
