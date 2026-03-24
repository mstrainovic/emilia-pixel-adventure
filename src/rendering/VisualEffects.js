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
   * Silksong-style sword slash — a clean crescent arc that sweeps across.
   * Canvas-drawn arc texture, animated scale + fade.
   */
  swordSlash(x, y, direction) {
    const z = 0.4 + y * 0.001;

    // ── Create slash arc texture via Canvas ──
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Draw crescent arc
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ffffaa';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(32, 32, 22, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    // Inner brighter arc
    ctx.strokeStyle = 'rgba(255, 255, 220, 0.8)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(32, 32, 20, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();

    // Outer glow
    ctx.strokeStyle = 'rgba(255, 255, 180, 0.3)';
    ctx.lineWidth = 8;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(32, 32, 24, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    // ── Direction-based rotation and offset ──
    const dirConfig = {
      down:  { ox: 0,    oy: 1.0,  rot: 0,              startRot: -0.5 },
      up:    { ox: 0,    oy: -1.0, rot: Math.PI,         startRot: 0.5 },
      left:  { ox: -1.0, oy: 0,    rot: Math.PI * 0.5,   startRot: -0.5 },
      right: { ox: 1.0,  oy: 0,    rot: -Math.PI * 0.5,  startRot: 0.5 },
    };
    const cfg = dirConfig[direction] || dirConfig.down;

    // ── Main slash arc mesh ──
    const size = 2.8;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x + cfg.ox, -(y + cfg.oy), z);
    mesh.rotation.z = cfg.rot + cfg.startRot;
    this.scene.add(mesh);

    this.effects.push({
      mesh, age: 0, maxAge: 0.18,
      _targetRot: cfg.rot - cfg.startRot,
      _startRot: cfg.rot + cfg.startRot,
      update: (dt, e) => {
        e.age += dt;
        const t = e.age / e.maxAge;
        // Sweep rotation
        mesh.rotation.z = e._startRot + (e._targetRot - e._startRot) * t;
        // Scale up slightly
        const s = 0.6 + t * 0.5;
        mesh.scale.set(s, s, 1);
        // Fade out in the last 40%
        mat.opacity = t > 0.6 ? 0.95 * (1 - (t - 0.6) / 0.4) : 0.95;
        // Hide mesh entirely when fully faded to prevent stray translucent rectangles
        if (mat.opacity <= 0.01) mesh.visible = false;
      }
    });

    // ── Trail particles (small sparkles along the arc) ──
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.02;
      const angle = cfg.rot + (i / 5 - 0.5) * Math.PI * 0.8;
      const dist = 1.2 + Math.random() * 0.3;
      const px = x + cfg.ox + Math.cos(angle) * dist * 0.5;
      const py = y + cfg.oy + Math.sin(angle) * dist * 0.5;

      const pGeo = new THREE.PlaneGeometry(0.15, 0.15);
      const pMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(px, -py, z + 0.01);
      this.scene.add(pMesh);

      this.effects.push({
        mesh: pMesh, age: -delay, maxAge: 0.2,
        update: (dt, e) => {
          e.age += dt;
          if (e.age < 0) { pMesh.visible = false; return; }
          pMesh.visible = true;
          const t = e.age / e.maxAge;
          pMat.opacity = Math.max(0, 0.8 * (1 - t));
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
   * Hit sparks when attacking a mob.
   */
  hitSparks(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
      const speed = 3 + Math.random() * 4;

      const geo = new THREE.PlaneGeometry(0.2, 0.2);
      const isWhite = Math.random() > 0.4;
      const mat = new THREE.MeshBasicMaterial({
        color: isWhite ? 0xffffff : 0xffdd44,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, -y, 0.4);
      this.scene.add(mesh);

      this.effects.push({
        mesh, age: 0, maxAge: 0.3,
        update: (dt, e) => {
          e.age += dt;
          mesh.position.x += Math.cos(angle) * speed * dt;
          mesh.position.y += Math.sin(angle) * speed * dt;
          mat.opacity = Math.max(0, 1 - e.age / e.maxAge);
        }
      });
    }
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
   * Brief golden glow when picking up an item.
   */
  pickupGlow(x, y) {
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, -y, 0.35);
    this.scene.add(mesh);

    this.effects.push({
      mesh, age: 0, maxAge: 0.4,
      update: (dt, e) => {
        e.age += dt;
        const t = e.age / e.maxAge;
        mesh.scale.set(1 + t * 2, 1 + t * 2, 1);
        mat.opacity = Math.max(0, 0.6 * (1 - t));
      }
    });
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
