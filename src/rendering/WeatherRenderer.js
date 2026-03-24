import * as THREE from 'three';
import { VISIBLE_TILES_X, VISIBLE_TILES_Y } from '../utils/Constants.js';

// Number of raindrops
const RAIN_COUNT = 90;

// Viewport half-extents (in tile units) — used to spread particles
const HALF_W = VISIBLE_TILES_X / 2 + 2; // +2 tiles margin beyond viewport edge
const HALF_H = VISIBLE_TILES_Y / 2 + 2;

// Z-layer: in front of all entities, below UI
const Z_WEATHER = 5;

/**
 * WeatherRenderer — viewport-relative visual effects for rain, fog, and sunbeams.
 *
 * All groups follow camera position each frame so effects always fill the screen
 * regardless of where the camera is on the map.
 */
export class WeatherRenderer {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera; // THREE.OrthographicCamera

    this._rainGroup = null;   // THREE.Group containing LineSegments
    this._rainData = null;    // per-drop state array
    this._rainMat = null;

    this._fogPlane = null;    // THREE.Mesh (PlaneGeometry)
    this._fogMat = null;

    this._sunbeamGroup = null; // THREE.Group containing beam planes
    this._sunbeams = null;     // per-beam state array

    this._currentEffect = null;
    this._time = 0;
  }

  // ─────────────────────────────────────────────
  //  Public API
  // ─────────────────────────────────────────────

  /**
   * @param {number}  dt          - delta time in seconds
   * @param {object}  weather     - WeatherSystem instance
   * @param {number}  mapWidth    - (unused currently, kept for API)
   * @param {number}  mapHeight
   * @param {string}  sceneName
   * @param {string}  dayPhase    - 'morning'|'day'|'evening'|'night'
   */
  update(dt, weather, mapWidth, mapHeight, sceneName, dayPhase) {
    this._time += dt;

    // Underground maps: hide everything
    if (sceneName === 'dungeon' || sceneName === 'grotto') {
      this._hideAll();
      return;
    }

    const dnMod = weather.getDayNightModifier(dayPhase || 'day');

    if (weather.current === 'rain') {
      this._updateRain(dt, weather._transition, dnMod);
      this._hideFog();
      this._hideSunbeams();
    } else if (weather.current === 'fog') {
      this._updateFog(dt, weather._transition, dnMod);
      this._hideRain();
      this._hideSunbeams();
    } else if (weather.current === 'sunbeams') {
      if (dnMod.suppress) {
        this._hideSunbeams();
      } else {
        this._updateSunbeams(dt, weather._transition, sceneName);
      }
      this._hideRain();
      this._hideFog();
    } else {
      // sunny / any unknown type
      this._hideAll();
    }
  }

  dispose() {
    this._hideAll();
    this._destroyRain();
    this._destroyFog();
    this._destroySunbeams();
  }

  // ─────────────────────────────────────────────
  //  Rain
  // ─────────────────────────────────────────────

  _createRain() {
    if (this._rainGroup) return;

    this._rainGroup = new THREE.Group();
    this._rainGroup.renderOrder = 10;

    // Per-drop: random x, y, speed
    this._rainData = [];
    const positions = new Float32Array(RAIN_COUNT * 6); // 2 vertices × 3 floats each

    for (let i = 0; i < RAIN_COUNT; i++) {
      const x = (Math.random() - 0.5) * HALF_W * 2;
      const y = (Math.random() - 0.5) * HALF_H * 2;
      const speed = 15 + Math.random() * 5; // tiles/sec
      this._rainData.push({ x, y, speed });

      // Store as two points (top and bottom of the raindrop line segment)
      // The actual positions get overwritten each frame; just need valid floats here.
      const idx = i * 6;
      positions[idx]     = x;
      positions[idx + 1] = y;
      positions[idx + 2] = Z_WEATHER;
      positions[idx + 3] = x + 0.15;   // slight diagonal offset for bottom point
      positions[idx + 4] = y - 0.5;    // drop length ~0.5 tiles
      positions[idx + 5] = Z_WEATHER;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Build index pairs: each drop is one line segment (2 vertices)
    const indices = new Uint16Array(RAIN_COUNT * 2);
    for (let i = 0; i < RAIN_COUNT; i++) {
      indices[i * 2]     = i * 2;
      indices[i * 2 + 1] = i * 2 + 1;
    }
    geo.setIndex(new THREE.BufferAttribute(indices, 1));

    this._rainMat = new THREE.LineBasicMaterial({
      color: 0xAADDFF,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(geo, this._rainMat);
    this._rainGroup.add(lines);
    this.scene.add(this._rainGroup);
  }

  _updateRain(dt, transition, dnMod) {
    this._createRain();
    this._rainGroup.visible = true;

    // Day/Night: extraDark dims rain colour
    const darkFactor = dnMod.extraDark ? (1 - dnMod.extraDark * 0.5) : 1;
    const baseOpacity = 0.55 * darkFactor;
    this._rainMat.opacity = baseOpacity * transition;

    // Follow camera
    const cam = this.camera;
    this._rainGroup.position.set(cam.position.x, cam.position.y, 0);

    const lines = this._rainGroup.children[0];
    const pos = lines.geometry.attributes.position.array;

    for (let i = 0; i < RAIN_COUNT; i++) {
      const d = this._rainData[i];

      // Move downward + slight rightward diagonal
      d.y -= d.speed * dt;
      d.x += d.speed * 0.12 * dt; // subtle ~7° diagonal

      // Respawn at top when raindrop exits bottom of viewport
      if (d.y < -HALF_H) {
        d.y = HALF_H + Math.random() * 2;
        d.x = (Math.random() - 0.5) * HALF_W * 2;
      }
      // Wrap horizontally too
      if (d.x > HALF_W)  d.x -= HALF_W * 2;
      if (d.x < -HALF_W) d.x += HALF_W * 2;

      // Write top and bottom vertex of this drop
      const idx = i * 6;
      pos[idx]     = d.x;
      pos[idx + 1] = d.y;
      pos[idx + 2] = Z_WEATHER;
      pos[idx + 3] = d.x + 0.18;      // diagonal bottom
      pos[idx + 4] = d.y - 0.55;      // drop length
      pos[idx + 5] = Z_WEATHER;
    }

    lines.geometry.attributes.position.needsUpdate = true;
  }

  _hideRain() {
    if (this._rainGroup) this._rainGroup.visible = false;
  }

  _destroyRain() {
    if (!this._rainGroup) return;
    const lines = this._rainGroup.children[0];
    if (lines) {
      lines.geometry.dispose();
    }
    if (this._rainMat) { this._rainMat.dispose(); this._rainMat = null; }
    this.scene.remove(this._rainGroup);
    this._rainGroup = null;
    this._rainData = null;
  }

  // ─────────────────────────────────────────────
  //  Fog
  // ─────────────────────────────────────────────

  _createFog() {
    if (this._fogPlane) return;

    // Large plane that always covers the viewport
    const geo = new THREE.PlaneGeometry(HALF_W * 2 + 4, HALF_H * 2 + 4);

    this._fogMat = new THREE.MeshBasicMaterial({
      color: 0xdde8ee,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    this._fogPlane = new THREE.Mesh(geo, this._fogMat);
    this._fogPlane.position.z = Z_WEATHER - 0.5; // just behind rain
    this._fogPlane.renderOrder = 9;
    this.scene.add(this._fogPlane);
  }

  _updateFog(dt, transition, dnMod) {
    this._createFog();
    this._fogPlane.visible = true;

    // Morning fog can be denser
    const densityMult = dnMod.fogDensity || 1;
    const maxOpacity = 0.4 * densityMult;

    this._fogMat.opacity = maxOpacity * transition;

    // Follow camera (XY only; Z is fixed)
    const cam = this.camera;
    this._fogPlane.position.x = cam.position.x;
    this._fogPlane.position.y = cam.position.y;
  }

  _hideFog() {
    if (this._fogPlane) this._fogPlane.visible = false;
  }

  _destroyFog() {
    if (!this._fogPlane) return;
    this._fogPlane.geometry.dispose();
    if (this._fogMat) { this._fogMat.dispose(); this._fogMat = null; }
    this.scene.remove(this._fogPlane);
    this._fogPlane = null;
  }

  // ─────────────────────────────────────────────
  //  Sunbeams
  // ─────────────────────────────────────────────

  _createSunbeams() {
    if (this._sunbeamGroup) return;

    this._sunbeamGroup = new THREE.Group();
    this._sunbeamGroup.renderOrder = 8;
    this._sunbeams = [];

    const BEAM_COUNT = 4;
    for (let i = 0; i < BEAM_COUNT; i++) {
      // Tall, narrow plane rotated ~30 degrees
      const w = 1.8 + Math.random() * 1.2;
      const h = HALF_H * 2 + 6;
      const geo = new THREE.PlaneGeometry(w, h);

      const opacity = 0.15 + Math.random() * 0.10;
      const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFF88,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geo, mat);
      // Spread beams across viewport width
      const baseX = (i / (BEAM_COUNT - 1) - 0.5) * HALF_W * 1.6;
      mesh.rotation.z = -Math.PI / 6; // 30° tilt
      mesh.position.set(baseX, 0, Z_WEATHER - 1);
      this._sunbeamGroup.add(mesh);

      this._sunbeams.push({
        mesh,
        mat,
        baseX,
        baseOpacity: opacity,
        driftSpeed: 0.2 + Math.random() * 0.15, // tiles/sec drift
        phase: Math.random() * Math.PI * 2,      // stagger the pulse
      });
    }

    this.scene.add(this._sunbeamGroup);
  }

  _updateSunbeams(dt, transition, sceneName) {
    // Only show in outdoor maps with trees
    const TREE_MAPS = new Set(['hub', 'forest']);
    if (!TREE_MAPS.has(sceneName)) {
      this._hideSunbeams();
      return;
    }

    this._createSunbeams();
    this._sunbeamGroup.visible = true;

    // Follow camera
    const cam = this.camera;
    this._sunbeamGroup.position.set(cam.position.x, cam.position.y, 0);

    for (const b of this._sunbeams) {
      // Slow rightward drift — wraps around viewport width
      const drift = ((this._time * b.driftSpeed) % (HALF_W * 2));
      b.mesh.position.x = b.baseX + drift - HALF_W;

      // Gentle opacity pulse
      const pulse = 0.85 + 0.15 * Math.sin(this._time * 0.5 + b.phase);
      b.mat.opacity = b.baseOpacity * transition * pulse;
    }
  }

  _hideSunbeams() {
    if (this._sunbeamGroup) this._sunbeamGroup.visible = false;
  }

  _destroySunbeams() {
    if (!this._sunbeamGroup) return;
    for (const b of this._sunbeams) {
      b.mesh.geometry.dispose();
      b.mat.dispose();
    }
    this.scene.remove(this._sunbeamGroup);
    this._sunbeamGroup = null;
    this._sunbeams = null;
  }

  // ─────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────

  _hideAll() {
    this._hideRain();
    this._hideFog();
    this._hideSunbeams();
  }
}
