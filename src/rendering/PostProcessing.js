import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

/**
 * Post-processing pipeline: Bloom + Vignette + FXAA
 */

// Custom vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.2 },
    darkness: { value: 0.3 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 2.0;
      float vig = clamp(1.0 - dot(uv, uv) * darkness, 0.0, 1.0);
      vig = mix(1.0 - darkness * 0.5, 1.0, vig);
      texel.rgb *= vig;
      gl_FragColor = texel;
    }
  `,
};

// Color grading shader for per-scene mood
const ColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tintColor: { value: new THREE.Vector3(1, 1, 1) },
    tintStrength: { value: 0.15 },
    brightness: { value: 1.0 },
    contrast: { value: 1.05 },
    saturation: { value: 1.1 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 tintColor;
    uniform float tintStrength;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Brightness
      color *= brightness;

      // Contrast
      color = (color - 0.5) * contrast + 0.5;

      // Saturation
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luma), color, saturation);

      // Tint
      color = mix(color, color * tintColor, tintStrength);

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);
    }
  `,
};

export class PostProcessingPipeline {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);

    // Base render
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Bloom — subtle, only bright things glow
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,  // strength
      0.5,  // radius
      0.75  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Color grading
    this.colorGradePass = new ShaderPass(ColorGradeShader);
    this.composer.addPass(this.colorGradePass);

    // Vignette
    this.vignettePass = new ShaderPass(VignetteShader);
    this.composer.addPass(this.vignettePass);

    // FXAA
    this.fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.set(
      1 / (window.innerWidth * pixelRatio),
      1 / (window.innerHeight * pixelRatio)
    );
    this.composer.addPass(this.fxaaPass);

    this._onResize(renderer);
    window.addEventListener('resize', () => this._onResize(renderer));
  }

  /**
   * Set the mood for a specific scene.
   */
  setSceneMood(sceneName) {
    const moods = {
      hub: {
        tint: [1.05, 1.0, 0.92],
        tintStrength: 0.08,
        brightness: 1.1,
        contrast: 1.05,
        saturation: 1.15,
        bloomStrength: 0.3,
      },
      forest: {
        tint: [0.9, 1.0, 0.9],
        tintStrength: 0.12,
        brightness: 1.05,
        contrast: 1.08,
        saturation: 1.2,
        bloomStrength: 0.25,
      },
      dungeon: {
        tint: [0.85, 0.8, 1.0],
        tintStrength: 0.2,
        brightness: 1.0,
        contrast: 1.1,
        saturation: 0.95,
        bloomStrength: 0.7,
      },
      lake: {
        tint: [0.92, 0.97, 1.08],
        tintStrength: 0.1,
        brightness: 1.1,
        contrast: 1.0,
        saturation: 1.12,
        bloomStrength: 0.35,
      },
      unicorn_meadow: {
        tint: [1.04, 1.01, 0.95],
        tintStrength: 0.08,
        brightness: 1.05,
        contrast: 1.02,
        saturation: 1.12,
        bloomStrength: 0.3,
      },
      beach: {
        tint: [1.05, 1.02, 0.88],
        tintStrength: 0.1,
        brightness: 0.95,
        contrast: 1.05,
        saturation: 1.1,
        bloomStrength: 0.3,
      },
      grotto: {
        tint: [0.75, 0.9, 1.1],
        tintStrength: 0.12,
        brightness: 1.1,
        contrast: 1.0,
        saturation: 1.0,
        bloomStrength: 0.4,
      },
      cloud_castle: {
        tint: [0.95, 0.95, 1.05],
        tintStrength: 0.1,
        brightness: 1.15,
        contrast: 1.0,
        saturation: 1.1,
        bloomStrength: 0.5,
      },
      starsky: {
        tint: [0.8, 0.8, 1.2],
        tintStrength: 0.2,
        brightness: 0.85,
        contrast: 1.1,
        saturation: 0.95,
        bloomStrength: 0.7,
      },
    };

    const mood = moods[sceneName] || moods.hub;
    const u = this.colorGradePass.uniforms;
    u.tintColor.value.set(mood.tint[0], mood.tint[1], mood.tint[2]);
    u.tintStrength.value = mood.tintStrength;
    u.brightness.value = mood.brightness;
    u.contrast.value = mood.contrast;
    u.saturation.value = mood.saturation;
    this.bloomPass.strength = mood.bloomStrength;
  }

  render() {
    this.composer.render();
  }

  _onResize(renderer) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pr = renderer.getPixelRatio();
    this.composer.setSize(w, h);
    this.fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pr), 1 / (h * pr));
    this.bloomPass.resolution.set(w, h);
  }

  dispose() {
    // Composer doesn't have a built-in dispose
  }
}
