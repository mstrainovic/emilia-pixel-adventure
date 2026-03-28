/**
 * Minimap — small overview map in the top-right corner.
 * Shows: terrain colors, player position, NPC dots, exit markers.
 * Renders to a canvas element overlaid on the game.
 */

// Tile ID → minimap color
const TILE_COLORS = {
  0: '#2a5020', // grass dark
  1: '#3a6a30', // grass medium
  2: '#4a8040', // grass light
  3: '#3a7035', // grass variant
  4: '#8a7050', // dirt path
  5: '#7a6040', // dirt dark
  6: '#8a6a40', // wood floor
  7: '#9a7a50', // wood floor light
  8: '#4a8a40', // flower grass
  9: '#707070', // stone floor
  10: '#2060aa', // water
  11: '#d0c080', // sand
  12: '#c0b070', // sand dark
  13: '#d8c890', // sand light
  14: '#8a7040', // pier wood
  15: '#1a3060', // underwater dark
  16: '#2a4070', // underwater blue
  17: '#1a4040', // underwater moss
  18: '#2a5060', // underwater sand
  19: '#d0d8e8', // cloud white
  20: '#e0c8d0', // cloud pink
  21: '#d8d0a0', // cloud gold
  22: '#a0b0c8', // crystal floor
};

const MAP_SIZE = 140; // px
const PADDING = 10;

export class Minimap {
  constructor() {
    // Container
    this._container = document.createElement('div');
    this._container.id = 'minimap-container';
    this._container.style.cssText = `
      position: fixed; top: 10px; right: 10px;
      width: ${MAP_SIZE + 4}px; height: ${MAP_SIZE + 4}px;
      border: 2px solid rgba(255,215,0,0.5);
      border-radius: 4px;
      background: rgba(0,0,0,0.5);
      z-index: 200;
      pointer-events: none;
      image-rendering: pixelated;
    `;

    // Terrain canvas (redrawn on scene change)
    this._terrainCanvas = document.createElement('canvas');
    this._terrainCanvas.style.cssText = `position:absolute;top:2px;left:2px;width:${MAP_SIZE}px;height:${MAP_SIZE}px;image-rendering:pixelated;`;
    this._container.appendChild(this._terrainCanvas);

    // Overlay canvas (redrawn every frame — player, NPCs, exits)
    this._overlayCanvas = document.createElement('canvas');
    this._overlayCanvas.width = MAP_SIZE;
    this._overlayCanvas.height = MAP_SIZE;
    this._overlayCanvas.style.cssText = `position:absolute;top:2px;left:2px;width:${MAP_SIZE}px;height:${MAP_SIZE}px;`;
    this._container.appendChild(this._overlayCanvas);

    // Scene label
    this._label = document.createElement('div');
    this._label.style.cssText = `
      position: absolute; bottom: 4px; left: 0; right: 0;
      text-align: center; color: rgba(255,255,255,0.7);
      font-size: 8px; font-family: 'Press Start 2P', monospace;
      pointer-events: none; text-shadow: 1px 1px 0 #000;
    `;
    this._container.appendChild(this._label);

    document.body.appendChild(this._container);

    this._mapWidth = 0;
    this._mapHeight = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._exits = [];
    this._time = 0;
  }

  /**
   * Rebuild terrain when scene changes.
   */
  setScene(sceneName, ground, width, height, exits) {
    this._mapWidth = width;
    this._mapHeight = height;
    this._exits = exits || [];

    // Scale to fit MAP_SIZE
    this._scaleX = MAP_SIZE / width;
    this._scaleY = MAP_SIZE / height;

    // Draw terrain to canvas
    this._terrainCanvas.width = width;
    this._terrainCanvas.height = height;
    const ctx = this._terrainCanvas.getContext('2d');

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const tileId = ground[r][c];
        ctx.fillStyle = TILE_COLORS[tileId] || TILE_COLORS[Math.min(tileId, 22)] || '#333';
        ctx.fillRect(c, r, 1, 1);
      }
    }

    // Scene label
    const labels = {
      hub: 'Dorf', forest: 'Wald', dungeon: 'Hoehle', lake: 'See',
      unicorn_meadow: 'Wiese', beach: 'Strand', grotto: 'Grotte',
      cloud_castle: 'Schloss', starsky: 'Sterne',
    };
    this._label.textContent = labels[sceneName] || sceneName;
  }

  /**
   * Update overlay (player dot, NPCs, exits). Call every frame.
   */
  update(dt, playerX, playerY, npcs) {
    this._time += dt;
    if (this._mapWidth === 0) return;

    const canvas = this._overlayCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

    const sx = this._scaleX;
    const sy = this._scaleY;

    // Draw exits as yellow rectangles
    ctx.fillStyle = '#FFD700';
    for (const exit of this._exits) {
      const ex = exit.x * sx;
      const ey = exit.y * sy;
      const ew = Math.max(3, (exit.w || 2) * sx);
      const eh = Math.max(3, (exit.h || 2) * sy);
      ctx.fillRect(ex, ey, ew, eh);
    }

    // Draw NPCs as small colored dots
    if (npcs) {
      for (const npc of npcs) {
        ctx.fillStyle = '#88CCFF';
        const nx = npc.x * sx;
        const ny = npc.y * sy;
        ctx.fillRect(nx - 1, ny - 1, 3, 3);
      }
    }

    // Draw player as pulsing white/gold dot
    const pulse = 0.7 + Math.sin(this._time * 4) * 0.3;
    const px = playerX * sx;
    const py = playerY * sy;

    // Player glow
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.4})`;
    ctx.fillRect(px - 3, py - 3, 7, 7);

    // Player dot
    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.fillRect(px - 1.5, py - 1.5, 4, 4);

    // Camera viewport rectangle
    const camW = 20 * sx; // VISIBLE_TILES_X
    const camH = 14 * sy; // VISIBLE_TILES_Y
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px - camW / 2, py - camH / 2, camW, camH);
  }

  dispose() {
    if (this._container.parentNode) this._container.remove();
  }
}
