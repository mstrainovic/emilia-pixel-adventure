import { getItem } from '../data/items.js';

/**
 * Floating pickup text popups — shows "+1 Holz" etc. when items are collected.
 * Uses HTML overlays positioned via world-to-screen coordinate conversion.
 */
export class PickupPopup {
  constructor() {
    // Container for all popups — pointer-events: none so it doesn't block game input
    this.container = document.createElement('div');
    this.container.id = 'pickup-popup-container';
    this.container.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 200; overflow: hidden;
    `;
    document.body.appendChild(this.container);

    this._addStyles();
  }

  /**
   * Show a floating pickup text at the given world position.
   * @param {string} itemId - The item ID to look up the German name
   * @param {number} amount - How many were picked up
   * @param {THREE.Camera} camera - The orthographic camera for projection
   * @param {number} worldX - World X coordinate (tile units)
   * @param {number} worldY - World Y coordinate (tile units, Y-down)
   */
  show(itemId, amount, camera, worldX, worldY) {
    const itemDef = getItem(itemId);
    if (!itemDef) return;

    const name = itemDef.name;
    const color = itemDef.color || '#ffff44';

    // Convert world coords to screen coords
    // Three.js uses -Y for display, so negate worldY
    const screenPos = this._worldToScreen(worldX, -worldY, camera);
    if (!screenPos) return;

    const popup = document.createElement('div');
    popup.className = 'pickup-popup';
    popup.textContent = `+${amount} ${name}`;
    popup.style.left = screenPos.x + 'px';
    popup.style.top = screenPos.y + 'px';
    popup.style.color = color;

    this.container.appendChild(popup);

    // Trigger the float-up animation after a microtask so the browser registers the initial position
    requestAnimationFrame(() => {
      popup.style.transition = 'top 1s ease-out, opacity 0.8s ease-in 0.2s';
      popup.style.top = (screenPos.y - 60) + 'px';
      popup.style.opacity = '0';
    });

    // Clean up after animation completes
    setTimeout(() => {
      if (popup.parentNode) popup.remove();
    }, 1200);
  }

  /**
   * Convert world coordinates to screen pixel coordinates.
   */
  _worldToScreen(x, y, camera) {
    // Create a vector in world space
    const vec = { x, y, z: 0.5 };

    // Manual projection for OrthographicCamera
    // NDC = (world - cameraPos) / halfSize, mapped to [-1, 1]
    const cx = camera.position.x;
    const cy = camera.position.y;
    const halfW = (camera.right - camera.left) / 2;
    const halfH = (camera.top - camera.bottom) / 2;

    const ndcX = (vec.x - cx) / halfW;
    const ndcY = (vec.y - cy) / halfH;

    // NDC [-1,1] -> screen pixels
    const screenX = (ndcX + 1) / 2 * window.innerWidth;
    const screenY = (1 - ndcY) / 2 * window.innerHeight;

    // Skip if off-screen
    if (screenX < -50 || screenX > window.innerWidth + 50 ||
        screenY < -50 || screenY > window.innerHeight + 50) {
      return null;
    }

    return { x: screenX, y: screenY };
  }

  _addStyles() {
    if (document.getElementById('pickup-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'pickup-popup-styles';
    style.textContent = `
      .pickup-popup {
        position: absolute;
        transform: translate(-50%, -50%);
        font-family: 'Press Start 2P', monospace;
        font-size: 11px;
        color: #ffff44;
        text-shadow:
          1px 1px 0 #000,
          -1px -1px 0 #000,
          1px -1px 0 #000,
          -1px 1px 0 #000,
          0 2px 4px rgba(0,0,0,0.5);
        pointer-events: none;
        opacity: 1;
        white-space: nowrap;
        letter-spacing: 0.5px;
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('pickup-popup-styles');
    if (s) s.remove();
  }
}
