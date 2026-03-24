/**
 * Holds map data and provides collision queries.
 * Coordinates are in tile units (float).
 */
export class TileMap {
  constructor(mapData) {
    this.width = mapData.width;
    this.height = mapData.height;
    this.ground = mapData.ground;       // 2D array of tile IDs
    this.collision = mapData.collision;  // 2D array: 1 = blocked, 0 = passable
    this.props = mapData.props || [];    // Array of { type, x, y, w, h, ... }
    this.npcs = mapData.npcs || [];      // Array of NPC spawn positions
    this.exits = mapData.exits || [];    // Array of { x, y, w, h, target, spawnX, spawnY }
    this.tileDefs = mapData.tileDefs;    // Tile ID → { x, y } in tileset (in tile coords)
  }

  /**
   * Check if an axis-aligned rectangle overlaps any blocked tile.
   * @param {number} x - left edge of hitbox
   * @param {number} y - top edge of hitbox
   * @param {number} w - width
   * @param {number} h - height
   * @returns {boolean} true if any corner/edge touches a blocked tile
   */
  isBlocked(x, y, w, h) {
    // Check all tiles the hitbox overlaps
    const left = Math.floor(x);
    const right = Math.floor(x + w);
    const top = Math.floor(y);
    const bottom = Math.floor(y + h);

    for (let row = top; row <= bottom; row++) {
      for (let col = left; col <= right; col++) {
        if (this.getTileCollision(col, row)) {
          return true;
        }
      }
    }
    return false;
  }

  getTileCollision(col, row) {
    if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
      return true; // Out of bounds = blocked
    }
    return this.collision[row][col] === 1;
  }

  getGroundTile(col, row) {
    if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
      return -1;
    }
    return this.ground[row][col];
  }
}
