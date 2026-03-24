import * as THREE from 'three';
import { ASSET_PATH } from '../utils/Constants.js';

export class AssetLoader {
  constructor() {
    this.manager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.cache = new Map();
    this.totalItems = 0;
    this.loadedItems = 0;

    // Loading screen elements
    this.overlay = document.createElement('div');
    this.overlay.id = 'loading-screen';
    this.overlay.innerHTML = `
      <div class="loading-content">
        <h1>Emilia's Pixel Adventure</h1>
        <div class="loading-bar-bg">
          <div class="loading-bar-fill" id="loading-bar"></div>
        </div>
        <p id="loading-text">Lade Spielwelt...</p>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.manager.onProgress = (url, loaded, total) => {
      this.loadedItems = loaded;
      this.totalItems = total;
      const pct = Math.round((loaded / total) * 100);
      const bar = document.getElementById('loading-bar');
      const text = document.getElementById('loading-text');
      if (bar) bar.style.width = pct + '%';
      if (text) text.textContent = `Lade Spielwelt... ${pct}%`;
    };
  }

  loadTexture(path, pixelArt = true) {
    const fullPath = `${ASSET_PATH}/${path}`;
    if (this.cache.has(fullPath)) {
      return Promise.resolve(this.cache.get(fullPath));
    }

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        fullPath,
        (texture) => {
          if (pixelArt) {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.generateMipmaps = false;
          this.cache.set(fullPath, texture);
          resolve(texture);
        },
        undefined,
        (err) => {
          console.error(`Failed to load: ${fullPath}`, err);
          reject(err);
        }
      );
    });
  }

  loadSpriteSheet(path, frameWidth, frameHeight, frameCount) {
    return this.loadTexture(path).then((texture) => {
      const sheetWidth = texture.image.width;
      const sheetHeight = texture.image.height;
      const cols = Math.floor(sheetWidth / frameWidth);
      return {
        texture, // base texture — SpriteRenderer will clone for each instance
        frameWidth,
        frameHeight,
        frameCount,
        cols,
        sheetWidth,
        sheetHeight
      };
    });
  }

  hideLoadingScreen() {
    const overlay = document.getElementById('loading-screen');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }

  onLoad() {
    return new Promise((resolve) => {
      this.manager.onLoad = () => resolve();
    });
  }
}
