export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function worldToTile(worldX, worldY, tileSize) {
  return {
    x: Math.floor(worldX / tileSize),
    y: Math.floor(worldY / tileSize)
  };
}

export function tileToWorld(tileX, tileY, tileSize) {
  return {
    x: tileX * tileSize + tileSize / 2,
    y: tileY * tileSize + tileSize / 2
  };
}

export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
