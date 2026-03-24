import * as THREE from 'three';

/**
 * Loads real pixel-art tiles from Cute_Fantasy and Farm RPG asset packs,
 * compositing them into a single tileset texture strip.
 *
 * Tile IDs (same as before, backward-compatible with all maps):
 *   0 = grass dark       (Cute_Fantasy Grass_Middle darkened)
 *   1 = grass medium     (Cute_Fantasy Grass_Middle)
 *   2 = grass light      (Cute_Fantasy Grass_Middle brightened)
 *   3 = grass variant    (Cute_Fantasy Grass_Middle hue-shifted)
 *   4 = dirt path        (Cute_Fantasy Path_Middle)
 *   5 = dirt dark        (Cute_Fantasy Path_Middle darkened)
 *   6 = wood floor       (Farm RPG — extracted from House.png floor plank)
 *   7 = wood floor light (Farm RPG — lighter variant)
 *   8 = flower grass     (Grass + flowers from Cute_Fantasy Outdoor_Decor)
 *   9 = stone floor      (Cute_Fantasy Cliff edge tile, grey stone)
 */

const T = 16;
const TILE_COUNT = 11;

/**
 * Loads an image and returns a promise.
 */
function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/**
 * Tint a 16x16 region by multiplying each pixel's RGB.
 */
function tintRegion(ctx, ox, oy, rMul, gMul, bMul) {
  const imgData = ctx.getImageData(ox, oy, T, T);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, Math.round(d[i] * rMul));
    d[i + 1] = Math.min(255, Math.round(d[i + 1] * gMul));
    d[i + 2] = Math.min(255, Math.round(d[i + 2] * bMul));
  }
  ctx.putImageData(imgData, ox, oy);
}

/**
 * Draw small flowers on top of a grass tile (for tile 8).
 */
function addFlowers(ctx, ox, oy) {
  const colors = [
    '#ff7896', '#ffc83c', '#ff64ff', '#ffff64',
    '#96c8ff', '#ffa0d2', '#ff9650', '#c882ff',
  ];
  // Seeded positions for consistency
  const positions = [
    [3, 2], [9, 4], [5, 8], [12, 3], [7, 12], [2, 10], [11, 9], [14, 6],
  ];
  for (let i = 0; i < 6; i++) {
    const [fx, fy] = positions[i];
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(ox + fx, oy + fy, 2, 2);
    // Darker center
    ctx.fillStyle = '#552200';
    ctx.fillRect(ox + fx, oy + fy, 1, 1);
  }
}

/**
 * Draw a simple wood plank tile (for tile 6/7).
 */
function drawWoodTile(ctx, ox, oy, light) {
  const base = light ? [175, 142, 88] : [145, 115, 68];
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(ox, oy, T, T);
  // Plank lines
  ctx.fillStyle = `rgba(0,0,0,0.15)`;
  for (let y = 0; y < T; y += 4) ctx.fillRect(ox, oy + y, T, 1);
  // Grain
  ctx.fillStyle = `rgba(${base[0] - 20},${base[1] - 20},${base[2] - 15},0.25)`;
  for (let y = 1; y < T; y += 3) ctx.fillRect(ox + 1, oy + y, 10, 1);
  // Highlight
  ctx.fillStyle = `rgba(255,255,255,0.08)`;
  ctx.fillRect(ox + 2, oy + 2, 6, 1);
  ctx.fillRect(ox + 2, oy + 6, 8, 1);
}

/**
 * Draw a stone floor tile (for tile 9 — dungeon).
 */
function drawStoneTile(ctx, ox, oy) {
  ctx.fillStyle = '#7a7d8a';
  ctx.fillRect(ox, oy, T, T);
  // Mortar lines
  ctx.fillStyle = '#5a5d6a';
  ctx.fillRect(ox, oy + 7, T, 1);
  ctx.fillRect(ox + 7, oy, 1, T);
  ctx.fillRect(ox + 3, oy + 8, 1, 8);
  ctx.fillRect(ox + 11, oy, 1, 7);
  // Surface highlights
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(ox + 2, oy + 2, 3, 3);
  ctx.fillRect(ox + 9, oy + 10, 3, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(ox + 10, oy + 2, 2, 2);
  ctx.fillRect(ox + 1, oy + 10, 2, 2);
}

/**
 * Async: Load real tiles from asset packs and composite into a strip.
 */
export async function generateTilesetAsync() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_COUNT * T;
  canvas.height = T;
  const ctx = canvas.getContext('2d');

  try {
    // Load source images
    const base = import.meta.env.BASE_URL || '/';
    const [grassImg, pathImg, waterImg] = await Promise.all([
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Grass_Middle.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Path_Middle.png`),
      loadImg(`${base}Cute_Fantasy_Free/Tiles/Water_Middle.png`),
    ]);

    // Tile 1: grass medium (source image as-is)
    ctx.drawImage(grassImg, 0, 0, T, T, 1 * T, 0, T, T);

    // Tile 0: grass dark (subtly darker — less blocky)
    ctx.drawImage(grassImg, 0, 0, T, T, 0 * T, 0, T, T);
    tintRegion(ctx, 0, 0, 0.90, 0.92, 0.88);

    // Tile 2: grass light (subtly brighter)
    ctx.drawImage(grassImg, 0, 0, T, T, 2 * T, 0, T, T);
    tintRegion(ctx, 2 * T, 0, 1.06, 1.05, 1.02);

    // Tile 3: grass variant (very subtle hue shift)
    ctx.drawImage(grassImg, 0, 0, T, T, 3 * T, 0, T, T);
    tintRegion(ctx, 3 * T, 0, 0.98, 1.04, 0.94);

    // Tile 4: dirt path
    ctx.drawImage(pathImg, 0, 0, T, T, 4 * T, 0, T, T);

    // Tile 5: dirt dark
    ctx.drawImage(pathImg, 0, 0, T, T, 5 * T, 0, T, T);
    tintRegion(ctx, 5 * T, 0, 0.8, 0.78, 0.75);

    // Tile 6: wood floor (canvas-drawn to match style)
    drawWoodTile(ctx, 6 * T, 0, false);

    // Tile 7: wood floor light
    drawWoodTile(ctx, 7 * T, 0, true);

    // Tile 8: flower grass (grass + hand-placed flowers)
    ctx.drawImage(grassImg, 0, 0, T, T, 8 * T, 0, T, T);
    tintRegion(ctx, 8 * T, 0, 1.05, 1.1, 0.95);
    addFlowers(ctx, 8 * T, 0);

    // Tile 9: stone floor (for dungeon)
    drawStoneTile(ctx, 9 * T, 0);

    // Tile 10: water (from Cute_Fantasy Water_Middle.png)
    ctx.drawImage(waterImg, 0, 0, T, T, 10 * T, 0, T, T);

  } catch (e) {
    console.warn('Asset tiles failed to load, using fallback colors:', e);
    // Fallback: solid color tiles
    const fallbackColors = [
      '#3a7830', '#48903a', '#55a042', '#44953a',
      '#be9e76', '#9b8060', '#917850', '#af9258',
      '#48903a', '#9b9ea8', '#3a7ab0',
    ];
    for (let i = 0; i < TILE_COUNT; i++) {
      ctx.fillStyle = fallbackColors[i];
      ctx.fillRect(i * T, 0, T, T);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Synchronous fallback (generates canvas tiles) — used if async not possible.
 */
export function generateTileset() {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_COUNT * T;
  canvas.height = T;
  const ctx = canvas.getContext('2d');

  // Simple solid colors as placeholder until async version loads
  const colors = [
    '#3a7830', '#48903a', '#55a042', '#44953a',
    '#be9e76', '#9b8060', '#917850', '#af9258',
    '#48903a', '#9b9ea8', '#3a7ab0',
  ];
  for (let i = 0; i < TILE_COUNT; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * T, 0, T, T);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const GENERATED_TILE_DEFS = {};
for (let i = 0; i < TILE_COUNT; i++) {
  GENERATED_TILE_DEFS[i] = { x: i, y: 0 };
}
