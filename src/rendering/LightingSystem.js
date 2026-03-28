import * as THREE from 'three';

/**
 * Dynamic point lighting system.
 * Renders soft radial light overlays at prop positions (torches, bonfires, crystals).
 * Uses additive blending for natural light accumulation.
 */

// Shared radial gradient texture (cached)
let _lightTexture = null;
function getLightTexture() {
  if (_lightTexture) return _lightTexture;
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.25)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  _lightTexture = new THREE.CanvasTexture(c);
  _lightTexture.magFilter = THREE.LinearFilter;
  _lightTexture.minFilter = THREE.LinearFilter;
  return _lightTexture;
}

/**
 * Light source definition.
 * @typedef {object} LightDef
 * @property {number} x
 * @property {number} y
 * @property {number[]} color — [r,g,b] 0-1
 * @property {number} radius — in tiles
 * @property {number} intensity — base opacity 0-1
 * @property {string} flicker — 'fire'|'crystal'|'steady'
 */

export class LightingSystem {
  constructor(scene) {
    this._scene = scene;
    this._lights = []; // { mesh, def, phase }
    this._time = 0;
  }

  /**
   * Initialize lights from map props.
   */
  init(sceneName, props) {
    this.dispose();

    const lightDefs = [];

    for (const p of props) {
      switch (p.type) {
        case 'bonfire':
          lightDefs.push({
            x: p.x + 0.5, y: p.y + 0.5,
            color: [1.0, 0.7, 0.3], radius: 4.5, intensity: 0.45,
            flicker: 'fire',
          });
          break;
        case 'torch':
          lightDefs.push({
            x: p.x + 0.5, y: p.y + 0.5,
            color: [1.0, 0.75, 0.35], radius: 3.0, intensity: 0.35,
            flicker: 'fire',
          });
          break;
        case 'crystal':
          lightDefs.push({
            x: p.x + 0.5, y: p.y + 0.5,
            color: [0.4, 0.6, 1.0], radius: 2.5, intensity: 0.3,
            flicker: 'crystal',
          });
          break;
        case 'crystal_flower':
          lightDefs.push({
            x: p.x + 0.5, y: p.y + 0.5,
            color: [0.8, 0.5, 1.0], radius: 2.0, intensity: 0.2,
            flicker: 'crystal',
          });
          break;
        case 'crystal_pillar':
          lightDefs.push({
            x: p.x + 0.5, y: p.y + 0.5,
            color: [0.5, 0.8, 1.0], radius: 3.5, intensity: 0.35,
            flicker: 'crystal',
          });
          break;
        case 'station':
          // Crafting stations have a subtle warm glow
          lightDefs.push({
            x: p.x + 0.5, y: p.y + 0.5,
            color: [1.0, 0.9, 0.7], radius: 2.0, intensity: 0.15,
            flicker: 'steady',
          });
          break;
      }
    }

    // Scene-specific ambient lights
    if (sceneName === 'grotto') {
      // Bioluminescent ambient glow across grotto
      lightDefs.push(
        { x: 10, y: 10, color: [0.2, 0.7, 0.9], radius: 6, intensity: 0.15, flicker: 'crystal' },
        { x: 30, y: 15, color: [0.1, 0.8, 0.7], radius: 5, intensity: 0.12, flicker: 'crystal' },
        { x: 20, y: 25, color: [0.3, 0.6, 1.0], radius: 5, intensity: 0.12, flicker: 'crystal' }
      );
    }

    // Create light meshes
    const tex = getLightTexture();
    for (const def of lightDefs) {
      const size = def.radius * 2;
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color: new THREE.Color(def.color[0], def.color[1], def.color[2]),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: def.intensity,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(def.x, -def.y, 0.08); // just above ground
      mesh.renderOrder = 1; // render after ground, before entities
      this._scene.add(mesh);

      this._lights.push({
        mesh, def,
        phase: Math.random() * Math.PI * 2,
        baseOpacity: def.intensity,
      });
    }
  }

  update(dt) {
    this._time += dt;

    for (const light of this._lights) {
      let opacity = light.baseOpacity;

      switch (light.def.flicker) {
        case 'fire': {
          // Realistic fire flicker: layered sine waves + random
          const f1 = Math.sin(this._time * 8 + light.phase) * 0.15;
          const f2 = Math.sin(this._time * 13 + light.phase * 2.3) * 0.08;
          const f3 = Math.sin(this._time * 21 + light.phase * 0.7) * 0.05;
          opacity = light.baseOpacity + f1 + f2 + f3;
          // Slight scale pulse
          const scale = 1 + f1 * 0.15;
          light.mesh.scale.setScalar(scale);
          break;
        }
        case 'crystal': {
          // Slow, gentle pulse
          const pulse = Math.sin(this._time * 1.5 + light.phase) * 0.3;
          opacity = light.baseOpacity * (0.7 + pulse * 0.3 + 0.3);
          break;
        }
        case 'steady':
        default:
          break;
      }

      light.mesh.material.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  dispose() {
    for (const light of this._lights) {
      this._scene.remove(light.mesh);
      light.mesh.geometry.dispose();
      light.mesh.material.dispose();
    }
    this._lights = [];
  }
}
