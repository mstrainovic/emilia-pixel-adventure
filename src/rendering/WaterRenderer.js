import * as THREE from 'three';

/**
 * Animated water overlay renderer.
 * Places a shader-based water surface over water tiles for each scene.
 * Features: wave distortion, caustic shimmer, color variation.
 */

const WaterShader = {
  uniforms: {
    time: { value: 0 },
    baseColor: { value: new THREE.Color(0x3388cc) },
    deepColor: { value: new THREE.Color(0x1a4466) },
    highlightColor: { value: new THREE.Color(0x88ccff) },
    opacity: { value: 0.35 },
    waveScale: { value: 3.0 },
    waveSpeed: { value: 0.8 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec2 vWorldPos;
    void main() {
      vUv = uv;
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 deepColor;
    uniform vec3 highlightColor;
    uniform float opacity;
    uniform float waveScale;
    uniform float waveSpeed;
    varying vec2 vUv;
    varying vec2 vWorldPos;

    // Simple noise function
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec2 wp = vWorldPos * waveScale;
      float t = time * waveSpeed;

      // Layered wave pattern
      float wave1 = sin(wp.x * 1.5 + t * 1.2) * cos(wp.y * 1.0 + t * 0.8) * 0.5;
      float wave2 = sin(wp.x * 2.5 + wp.y * 1.5 + t * 1.5) * 0.3;
      float wave3 = noise(wp * 2.0 + t * 0.3) * 0.4;
      float wave = wave1 + wave2 + wave3;

      // Caustic pattern (light filtering through water)
      float caustic1 = noise(wp * 3.0 + vec2(t * 0.5, t * 0.3));
      float caustic2 = noise(wp * 4.0 - vec2(t * 0.4, t * 0.6));
      float caustic = pow(caustic1 * caustic2, 1.5) * 2.0;

      // Mix colors based on waves
      vec3 color = mix(deepColor, baseColor, 0.5 + wave * 0.5);
      // Add highlights on wave peaks
      color = mix(color, highlightColor, smoothstep(0.6, 1.0, wave + 0.5) * 0.4);
      // Add caustic shimmer
      color += highlightColor * caustic * 0.15;

      // Edge fade (natural integration with surrounding tiles)
      float edgeFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x)
                     * smoothstep(0.0, 0.08, vUv.y) * smoothstep(0.0, 0.08, 1.0 - vUv.y);

      float alpha = opacity * edgeFade * (0.7 + wave * 0.3);

      gl_FragColor = vec4(color, alpha);
    }
  `,
};

// Scene-specific water color presets
const WATER_PRESETS = {
  lake: {
    baseColor: [0.2, 0.55, 0.85],
    deepColor: [0.08, 0.25, 0.45],
    highlightColor: [0.6, 0.85, 1.0],
    opacity: 0.3,
    waveSpeed: 0.6,
  },
  beach: {
    baseColor: [0.15, 0.6, 0.75],
    deepColor: [0.05, 0.3, 0.5],
    highlightColor: [0.7, 0.95, 1.0],
    opacity: 0.28,
    waveSpeed: 1.0,
  },
  grotto: {
    baseColor: [0.1, 0.35, 0.6],
    deepColor: [0.03, 0.1, 0.3],
    highlightColor: [0.3, 0.7, 1.0],
    opacity: 0.35,
    waveSpeed: 0.4,
  },
};

const WATER_TILE_IDS = new Set([10, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]);

export class WaterRenderer {
  constructor(scene) {
    this._scene = scene;
    this._meshes = [];
    this._time = 0;
  }

  /**
   * Create water overlay meshes for water tiles in the map.
   */
  init(sceneName, ground, width, height) {
    this.dispose();

    const preset = WATER_PRESETS[sceneName];
    if (!preset) return; // no water styling for this scene

    // Find water tile clusters (bounding boxes)
    const waterRegions = this._findWaterRegions(ground, width, height);

    for (const region of waterRegions) {
      const w = region.maxC - region.minC + 1;
      const h = region.maxR - region.minR + 1;
      if (w < 2 || h < 2) continue; // skip tiny patches

      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: new THREE.Color(preset.baseColor[0], preset.baseColor[1], preset.baseColor[2]) },
          deepColor: { value: new THREE.Color(preset.deepColor[0], preset.deepColor[1], preset.deepColor[2]) },
          highlightColor: { value: new THREE.Color(preset.highlightColor[0], preset.highlightColor[1], preset.highlightColor[2]) },
          opacity: { value: preset.opacity },
          waveScale: { value: 3.0 },
          waveSpeed: { value: preset.waveSpeed },
        },
        vertexShader: WaterShader.vertexShader,
        fragmentShader: WaterShader.fragmentShader,
        transparent: true,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const cx = region.minC + w / 2;
      const cy = region.minR + h / 2;
      mesh.position.set(cx, -cy, 0.03); // just above ground tiles
      mesh.renderOrder = 0;
      this._scene.add(mesh);
      this._meshes.push(mesh);
    }
  }

  /**
   * Find connected water regions as bounding boxes.
   */
  _findWaterRegions(ground, width, height) {
    const visited = new Set();
    const regions = [];

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (visited.has(r * width + c)) continue;
        if (!WATER_TILE_IDS.has(ground[r][c])) continue;

        // BFS to find connected water region
        const queue = [{ r, c }];
        visited.add(r * width + c);
        let minR = r, maxR = r, minC = c, maxC = c;

        while (queue.length > 0) {
          const cur = queue.shift();
          minR = Math.min(minR, cur.r);
          maxR = Math.max(maxR, cur.r);
          minC = Math.min(minC, cur.c);
          maxC = Math.max(maxC, cur.c);

          for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
            const nr = cur.r + dr;
            const nc = cur.c + dc;
            if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
            const key = nr * width + nc;
            if (visited.has(key)) continue;
            if (!WATER_TILE_IDS.has(ground[nr][nc])) continue;
            visited.add(key);
            queue.push({ r: nr, c: nc });
          }
        }

        regions.push({ minR, maxR, minC, maxC });
      }
    }

    return regions;
  }

  update(dt) {
    this._time += dt;
    for (const mesh of this._meshes) {
      mesh.material.uniforms.time.value = this._time;
    }
  }

  dispose() {
    for (const mesh of this._meshes) {
      this._scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this._meshes = [];
  }
}
