/**
 * MapVignette — CSS-based screen-space vignette overlay that intensifies
 * near map edges, hiding the abrupt black void beyond map boundaries.
 *
 * Always shows a subtle cinematic vignette; intensifies when the camera
 * approaches map edges. Each scene type has a thematic tint color.
 */
export class MapVignette {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'map-vignette';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 10;
    `;
    document.body.appendChild(this.overlay);

    this.intensity = 0;
    this._currentScene = 'hub';
    this._lastBg = '';
  }

  /**
   * Scene-specific vignette tint colors.
   * Each entry: { r, g, b } — the color channel values for the dark edge.
   */
  static SCENE_TINTS = {
    hub:             { r: 5,   g: 25,  b: 5   },  // dark green
    forest:          { r: 0,   g: 20,  b: 0   },  // deep forest green
    dungeon:         { r: 12,  g: 5,   b: 25  },  // dark purple
    lake:            { r: 0,   g: 12,  b: 30  },  // dark blue
    unicorn_meadow:  { r: 15,  g: 10,  b: 25  },  // soft purple/magic
    beach:           { r: 10,  g: 20,  b: 30  },  // ocean blue
    grotto:          { r: 5,   g: 10,  b: 25  },  // deep sea blue
    cloud_castle:    { r: 30,  g: 30,  b: 40  },  // misty white-blue
    starsky:         { r: 5,   g: 5,   b: 15  },  // deep night
  };

  /**
   * Set the current scene for tint coloring.
   */
  setScene(sceneName) {
    this._currentScene = sceneName;
  }

  /**
   * Update vignette intensity based on camera proximity to map edges.
   * Call once per frame after camera.follow().
   *
   * @param {THREE.OrthographicCamera} cam — the Three.js camera
   * @param {number} mapWidth  — map width in tile units
   * @param {number} mapHeight — map height in tile units
   */
  update(cam, mapWidth, mapHeight) {
    // Camera position in map coordinates (Y is negated in Three.js)
    const camX = cam.position.x;
    const camY = -cam.position.y;

    // Visible half-extents
    const halfW = (cam.right - cam.left) / 2;
    const halfH = (cam.top - cam.bottom) / 2;

    // Distance from camera viewport edges to map edges (in tile units)
    const distLeft   = camX - halfW;           // how far left viewport edge is from map left
    const distRight  = mapWidth - (camX + halfW);  // how far right viewport edge is from map right
    const distTop    = camY - halfH;           // how far top viewport edge is from map top
    const distBottom = mapHeight - (camY + halfH); // how far bottom viewport edge is from map bottom

    // Margin in tiles where vignette starts intensifying
    const margin = 6;

    // Calculate intensity for each edge (0 = far from edge, 1 = at/past edge)
    const edgeLeft   = 1 - Math.max(0, Math.min(1, distLeft / margin));
    const edgeRight  = 1 - Math.max(0, Math.min(1, distRight / margin));
    const edgeTop    = 1 - Math.max(0, Math.min(1, distTop / margin));
    const edgeBottom = 1 - Math.max(0, Math.min(1, distBottom / margin));

    // Overall intensity: strongest edge wins
    this.intensity = Math.max(edgeLeft, edgeRight, edgeTop, edgeBottom);

    // Build the gradient
    const tint = MapVignette.SCENE_TINTS[this._currentScene] || { r: 0, g: 0, b: 0 };

    // Base vignette: always-on subtle darkening at corners (cinematic feel)
    const baseAlpha = 0.20;
    // Edge proximity adds more darkening
    const edgeAlpha = this.intensity * 0.55;
    const totalAlpha = Math.min(0.75, baseAlpha + edgeAlpha);

    // Spread: how much of the center is clear (smaller = more vignette)
    // Base: 65% clear. Near edges: shrinks to 45% clear for stronger effect.
    const spread = 65 - this.intensity * 20;

    // Directional bias: shift gradient center away from nearby edges
    // This makes the vignette heavier on the side closest to the map edge
    const biasX = (edgeRight - edgeLeft) * 8;  // shift center toward the far side
    const biasY = (edgeBottom - edgeTop) * 8;
    const centerX = 50 + biasX;
    const centerY = 50 + biasY;

    const bg = `radial-gradient(ellipse at ${centerX}% ${centerY}%, ` +
      `transparent ${spread}%, ` +
      `rgba(${tint.r},${tint.g},${tint.b},${totalAlpha * 0.4}) ${spread + 15}%, ` +
      `rgba(${tint.r},${tint.g},${tint.b},${totalAlpha}) 100%)`;

    // Only update DOM when the gradient actually changed (avoid layout thrashing)
    if (bg !== this._lastBg) {
      this.overlay.style.background = bg;
      this._lastBg = bg;
    }
  }

  /**
   * Remove the overlay from the DOM.
   */
  dispose() {
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
