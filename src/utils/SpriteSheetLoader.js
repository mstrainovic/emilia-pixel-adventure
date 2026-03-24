import * as THREE from 'three';

/**
 * Loads multi-row spritesheets (like Cute_Fantasy Player.png) and extracts
 * individual animation rows as horizontal strip textures.
 *
 * Player.png layout (192x320, 32x32 frames, 6 cols x 10 rows):
 *   Row 0: Idle Down (6 frames)
 *   Row 1: Idle Side (6 frames)
 *   Row 2: Idle Up (6 frames)
 *   Row 3: Walk Down (6 frames)
 *   Row 4: Walk Side (6 frames)
 *   Row 5: Walk Up (6 frames)
 *   Row 6: Hurt Down (2 frames)
 *   Row 7: Hurt Side (2 frames)
 *   Row 8: Hurt Up (2 frames)
 *   Row 9: Death (6 frames)
 *
 * Player_Actions.png layout (96x576, 32x32 frames, 3 cols x 18 rows):
 *   Rows 0-2: Sword Attack Down (3 frames each sub-anim, 3 rows)
 *   Rows 3-5: Sword Attack Side
 *   Rows 6-8: Sword Attack Up
 *   Rows 9-11: Axe/Tool Down
 *   Rows 12-14: Axe/Tool Side
 *   Rows 15-17: Axe/Tool Up
 */

const FRAME_W = 32;
const FRAME_H = 32;

/**
 * Load an image as a promise (with caching).
 */
const _imageCache = {};
function loadImage(src) {
  if (_imageCache[src]) return Promise.resolve(_imageCache[src]);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { _imageCache[src] = img; resolve(img); };
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

/**
 * Extract a single row from a spritesheet image and return as sheetData.
 * @param {HTMLImageElement} img - source spritesheet
 * @param {number} row - row index (0-based)
 * @param {number} cols - number of columns (frames) in this row
 * @param {number} frameW - frame width in pixels
 * @param {number} frameH - frame height in pixels
 * @param {object|null} paletteSwap - { swaps: [{from:[r,g,b,tolerance], to:[r,g,b]}] }
 * @returns {object} sheetData compatible with SpriteRenderer
 */
function extractRow(img, row, cols, frameW, frameH, paletteSwap = null) {
  const canvas = document.createElement('canvas');
  canvas.width = cols * frameW;
  canvas.height = frameH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(
    img,
    0, row * frameH,           // source x, y
    cols * frameW, frameH,     // source w, h
    0, 0,                      // dest x, y
    cols * frameW, frameH      // dest w, h
  );

  // Apply palette swap if requested
  if (paletteSwap && paletteSwap.swaps && paletteSwap.swaps.length > 0) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue; // skip transparent
      for (const swap of paletteSwap.swaps) {
        const [fr, fg, fb, tol] = swap.from;
        const [tr, tg, tb] = swap.to;
        const dr = Math.abs(d[i] - fr);
        const dg = Math.abs(d[i + 1] - fg);
        const db = Math.abs(d[i + 2] - fb);
        if (dr <= tol && dg <= tol && db <= tol) {
          // Preserve relative brightness
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / (fr + fg + fb + 1);
          d[i]     = Math.min(255, Math.round(tr * brightness));
          d[i + 1] = Math.min(255, Math.round(tg * brightness));
          d[i + 2] = Math.min(255, Math.round(tb * brightness));
          break;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  return {
    texture,
    frameWidth: frameW,
    frameHeight: frameH,
    frameCount: cols,
    sheetWidth: canvas.width,
    sheetHeight: canvas.height,
  };
}

/**
 * Extract frames from Player_Actions.png (3 cols x 18 rows).
 * Combines multiple rows into one strip for a single attack animation.
 */
function extractActionRows(img, startRow, rowCount, colsPerRow, frameW, frameH, paletteSwap = null) {
  const totalFrames = rowCount * colsPerRow;
  const canvas = document.createElement('canvas');
  canvas.width = totalFrames * frameW;
  canvas.height = frameH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colsPerRow; c++) {
      const srcX = c * frameW;
      const srcY = (startRow + r) * frameH;
      const destX = (r * colsPerRow + c) * frameW;
      ctx.drawImage(img, srcX, srcY, frameW, frameH, destX, 0, frameW, frameH);
    }
  }

  // Apply palette swap
  if (paletteSwap && paletteSwap.swaps && paletteSwap.swaps.length > 0) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue;
      for (const swap of paletteSwap.swaps) {
        const [fr, fg, fb, tol] = swap.from;
        const [tr, tg, tb] = swap.to;
        if (Math.abs(d[i] - fr) <= tol && Math.abs(d[i + 1] - fg) <= tol && Math.abs(d[i + 2] - fb) <= tol) {
          const brightness = (d[i] + d[i + 1] + d[i + 2]) / (fr + fg + fb + 1);
          d[i]     = Math.min(255, Math.round(tr * brightness));
          d[i + 1] = Math.min(255, Math.round(tg * brightness));
          d[i + 2] = Math.min(255, Math.round(tb * brightness));
          break;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  return {
    texture,
    frameWidth: frameW,
    frameHeight: frameH,
    frameCount: totalFrames,
    sheetWidth: canvas.width,
    sheetHeight: canvas.height,
  };
}

/**
 * Palette swap definitions for the Cute_Fantasy player.
 * The original player has brown hair and blue shirt.
 * We define color ranges to swap.
 */
function buildPaletteSwap(hairColor, clothColor) {
  const swaps = [];
  // Original hair: browns around [100,65,35] to [70,40,20]
  if (hairColor) {
    swaps.push({ from: [100, 65, 35, 40], to: hairColor });
    swaps.push({ from: [70, 40, 20, 30], to: [Math.max(0, hairColor[0] - 25), Math.max(0, hairColor[1] - 20), Math.max(0, hairColor[2] - 15)] });
  }
  // Original shirt/clothes: blues around [80,130,190] to [50,90,145]
  if (clothColor) {
    swaps.push({ from: [80, 130, 190, 50], to: clothColor });
    swaps.push({ from: [50, 90, 145, 40], to: [Math.max(0, clothColor[0] - 30), Math.max(0, clothColor[1] - 30), Math.max(0, clothColor[2] - 30)] });
  }
  return swaps.length > 0 ? { swaps } : null;
}

/**
 * Load Cute_Fantasy player spritesheet and extract all animations.
 * Returns a map of animation name -> sheetData.
 *
 * @param {object} options
 * @param {number[]} options.hairColor - [r,g,b] for hair (null = keep original)
 * @param {number[]} options.clothColor - [r,g,b] for clothes (null = keep original)
 * @returns {Promise<object>} map of animName -> sheetData
 */
export async function loadCuteFantasyPlayer(options = {}) {
  const { hairColor = null, clothColor = null } = options;
  const paletteSwap = buildPaletteSwap(hairColor, clothColor);
  const base = import.meta.env.BASE_URL || '/';

  const [playerImg, actionsImg] = await Promise.all([
    loadImage(`${base}Cute_Fantasy_Free/Player/Player.png`),
    loadImage(`${base}Cute_Fantasy_Free/Player/Player_Actions.png`),
  ]);

  const anims = {};

  // Movement animations from Player.png (6 cols x 10 rows)
  anims.idle_down  = extractRow(playerImg, 0, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.idle_side  = extractRow(playerImg, 1, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.idle_up    = extractRow(playerImg, 2, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.walk_down  = extractRow(playerImg, 3, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.walk_side  = extractRow(playerImg, 4, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.walk_up    = extractRow(playerImg, 5, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.hurt_down  = extractRow(playerImg, 6, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.hurt_side  = extractRow(playerImg, 7, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.hurt_up    = extractRow(playerImg, 8, 6, FRAME_W, FRAME_H, paletteSwap);
  anims.death      = extractRow(playerImg, 9, 6, FRAME_W, FRAME_H, paletteSwap);

  // Run = walk (reuse, slightly faster animation speed applied elsewhere)
  anims.run_down = anims.walk_down;
  anims.run_side = anims.walk_side;
  anims.run_up   = anims.walk_up;

  // Attack animations from Player_Actions.png (3 cols x 18 rows)
  // Use only the swing row (middle row of each 3-row set) for a snappy 3-frame attack
  anims.slice_down = extractRow(actionsImg, 1, 3, FRAME_W, FRAME_H, paletteSwap);
  anims.slice_side = extractRow(actionsImg, 4, 3, FRAME_W, FRAME_H, paletteSwap);
  anims.slice_up   = extractRow(actionsImg, 7, 3, FRAME_W, FRAME_H, paletteSwap);

  // Tool actions — use the swing row of tool animations
  anims.collect_down = extractRow(actionsImg, 10, 3, FRAME_W, FRAME_H, paletteSwap);
  anims.collect_side = extractRow(actionsImg, 13, 3, FRAME_W, FRAME_H, paletteSwap);
  anims.collect_up   = extractRow(actionsImg, 16, 3, FRAME_W, FRAME_H, paletteSwap);
  anims.crush_down = anims.collect_down;
  anims.crush_side = anims.collect_side;
  anims.crush_up   = anims.collect_up;

  return anims;
}

/**
 * Load Cute_Fantasy skeleton enemy spritesheet.
 * Same layout as Player.png (192x320, 6 cols x 10 rows).
 */
export async function loadCuteFantasyEnemy(spritePath) {
  const img = await loadImage(spritePath);
  const anims = {};

  anims.idle_down  = extractRow(img, 0, 6, FRAME_W, FRAME_H);
  anims.idle_side  = extractRow(img, 1, 6, FRAME_W, FRAME_H);
  anims.idle_up    = extractRow(img, 2, 6, FRAME_W, FRAME_H);
  anims.walk_down  = extractRow(img, 3, 6, FRAME_W, FRAME_H);
  anims.walk_side  = extractRow(img, 4, 6, FRAME_W, FRAME_H);
  anims.walk_up    = extractRow(img, 5, 6, FRAME_W, FRAME_H);
  anims.hurt_down  = extractRow(img, 6, 6, FRAME_W, FRAME_H);
  anims.hurt_side  = extractRow(img, 7, 6, FRAME_W, FRAME_H);
  anims.hurt_up    = extractRow(img, 8, 6, FRAME_W, FRAME_H);
  anims.death      = extractRow(img, 9, 6, FRAME_W, FRAME_H);

  // Run = walk for enemies
  anims.run_down = anims.walk_down;
  anims.run_side = anims.walk_side;
  anims.run_up   = anims.walk_up;

  return anims;
}

/**
 * Load the Cute_Fantasy NPC (same sprite as player but with different colors).
 */
export async function loadCuteFantasyNPC(hairColor, clothColor) {
  return loadCuteFantasyPlayer({ hairColor, clothColor });
}

// NPC color configs for Emilia's family
export const NPC_PALETTE_CONFIGS = {
  emilia:      { hairColor: [15, 10, 5],     clothColor: [220, 130, 170] },  // Black hair, pink dress
  mama_tanja:  { hairColor: [90, 55, 30],    clothColor: [230, 130, 160] },  // Brown hair, pink top
  papa_milos:  { hairColor: [15, 12, 8],     clothColor: [70, 110, 180] },   // Black hair, blue shirt
  marie:       { hairColor: [180, 140, 60],  clothColor: [255, 180, 50] },   // Blonde, yellow dress
  liam:        { hairColor: [50, 30, 15],    clothColor: [60, 160, 80] },    // Dark brown, green shirt
  oma:         { hairColor: [180, 175, 170], clothColor: [160, 100, 140] },  // Grey hair, mauve
  opa:         { hairColor: [160, 155, 145], clothColor: [100, 130, 100] },  // Grey, olive shirt
  baba:        { hairColor: [100, 50, 25],   clothColor: [190, 70, 60] },    // Auburn, red blouse
  deda:        { hairColor: [130, 125, 115], clothColor: [60, 80, 130] },    // Grey, navy
};
