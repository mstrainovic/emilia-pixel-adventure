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

// Extracted-canvas cache: palette-swapped row extraction is expensive
// (per-pixel loops). Canvases are cached and reused across entities and
// scene switches; each caller still gets its OWN CanvasTexture, so
// entity dispose() stays safe.
const _canvasCache = new Map();
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
function extractRow(img, row, cols, frameW, frameH, paletteSwap = null, hairBow = false) {
  const cacheKey = `${img.src}|r${row}|c${cols}|${frameW}x${frameH}|${JSON.stringify(paletteSwap)}|bow${hairBow ? 1 : 0}`;
  const cached = _canvasCache.get(cacheKey);
  if (cached) return _makeSheetData(cached, frameW, frameH, cols);

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

  if (hairBow) _drawHairBow(ctx, cols, frameW, frameH);

  _canvasCache.set(cacheKey, canvas);
  return _makeSheetData(canvas, frameW, frameH, cols);
}

/**
 * Draw a tiny pink hair bow on every frame of a character strip.
 * The bow sits on the upper-right of the hair: per frame we find the
 * top-most opaque pixel and the head's x-range, then stamp a 5x2 bow.
 */
function _drawHairBow(ctx, cols, frameW, frameH) {
  const W = cols * frameW;
  const data = ctx.getImageData(0, 0, W, frameH);
  const d = data.data;
  const P = [242, 96, 152];  // pink wings
  const K = [198, 56, 116];  // darker knot
  const H = [255, 196, 220]; // highlight

  for (let f = 0; f < cols; f++) {
    const x0 = f * frameW;

    // Top-most opaque pixel of this frame
    let topY = -1;
    for (let y = 0; y < frameH && topY < 0; y++) {
      for (let x = 0; x < frameW; x++) {
        if (d[((y * W) + x0 + x) * 4 + 3] > 60) { topY = y; break; }
      }
    }
    if (topY < 0) continue; // empty frame (e.g. unused hurt slots)

    // Head x-range in the top rows
    let minX = frameW, maxX = -1;
    for (let y = topY; y < Math.min(frameH, topY + 3); y++) {
      for (let x = 0; x < frameW; x++) {
        if (d[((y * W) + x0 + x) * 4 + 3] > 60) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    if (maxX - minX < 5) continue; // too narrow (lying down frames etc.)

    const bx = x0 + maxX - 5;          // upper-right of the hair
    const by = Math.max(0, topY);
    const set = (x, y, c) => {
      if (x < x0 || x >= x0 + frameW || y < 0 || y >= frameH) return;
      const i = ((y * W) + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    };

    // 5x2 bow: two wings + knot
    set(bx,     by + 1, P); set(bx + 1, by,     P); set(bx + 1, by + 1, P);
    set(bx + 2, by + 1, K);
    set(bx + 3, by,     H); set(bx + 3, by + 1, P); set(bx + 4, by + 1, P);
  }
  ctx.putImageData(data, 0, 0);
}

/** Build sheetData with a fresh CanvasTexture from an (often cached) canvas. */
function _makeSheetData(canvas, frameW, frameH, frameCount) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;

  return {
    texture,
    frameWidth: frameW,
    frameHeight: frameH,
    frameCount,
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
  const cacheKey = `${img.src}|a${startRow}-${rowCount}-${colsPerRow}|${frameW}x${frameH}|${JSON.stringify(paletteSwap)}`;
  const cachedA = _canvasCache.get(cacheKey);
  if (cachedA) return _makeSheetData(cachedA, frameW, frameH, totalFrames);
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

  _canvasCache.set(cacheKey, canvas);
  return _makeSheetData(canvas, frameW, frameH, totalFrames);
}

/**
 * Palette swap definitions for the Cute_Fantasy player.
 * The original player has brown hair and blue shirt.
 * We define color ranges to swap.
 */
function darken(c, d) {
  return [Math.max(0, c[0] - d), Math.max(0, c[1] - d), Math.max(0, c[2] - d)];
}

function buildPaletteSwap(hairColor, clothColor, pantsColor) {
  const swaps = [];
  if (hairColor) {
    swaps.push({ from: [112, 70, 67, 14], to: hairColor });
    swaps.push({ from: [93, 44, 40, 12], to: darken(hairColor, 28) });
  }
  if (clothColor) {
    swaps.push({ from: [51, 152, 75, 26], to: clothColor });
    swaps.push({ from: [30, 111, 80, 22], to: darken(clothColor, 40) });
  }
  if (pantsColor) {
    swaps.push({ from: [0, 152, 220, 26], to: pantsColor });
    swaps.push({ from: [0, 105, 170, 22], to: darken(pantsColor, 40) });
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
  const { hairColor = null, clothColor = null, pantsColor = null, hairBow = false } = options;
  const paletteSwap = buildPaletteSwap(hairColor, clothColor, pantsColor);
  const base = import.meta.env.BASE_URL || '/';

  const [playerImg, actionsImg] = await Promise.all([
    loadImage(`${base}Cute_Fantasy_Free/Player/Player.png`),
    loadImage(`${base}Cute_Fantasy_Free/Player/Player_Actions.png`),
  ]);

  const anims = {};

  // Movement animations from Player.png (6 cols x 10 rows)
  anims.idle_down  = extractRow(playerImg, 0, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.idle_side  = extractRow(playerImg, 1, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.idle_up    = extractRow(playerImg, 2, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.walk_down  = extractRow(playerImg, 3, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.walk_side  = extractRow(playerImg, 4, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.walk_up    = extractRow(playerImg, 5, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.hurt_down  = extractRow(playerImg, 6, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.hurt_side  = extractRow(playerImg, 7, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.hurt_up    = extractRow(playerImg, 8, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.death      = extractRow(playerImg, 9, 6, FRAME_W, FRAME_H, paletteSwap, hairBow);

  // Run = walk (reuse, slightly faster animation speed applied elsewhere)
  anims.run_down = anims.walk_down;
  anims.run_side = anims.walk_side;
  anims.run_up   = anims.walk_up;

  // Attack animations from Player_Actions.png (3 cols x 18 rows)
  // Use only the swing row (middle row of each 3-row set) for a snappy 3-frame attack
  anims.slice_down = extractRow(actionsImg, 1, 3, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.slice_side = extractRow(actionsImg, 4, 3, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.slice_up   = extractRow(actionsImg, 7, 3, FRAME_W, FRAME_H, paletteSwap, hairBow);

  // Tool actions — use the swing row of tool animations
  anims.collect_down = extractRow(actionsImg, 10, 3, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.collect_side = extractRow(actionsImg, 13, 3, FRAME_W, FRAME_H, paletteSwap, hairBow);
  anims.collect_up   = extractRow(actionsImg, 16, 3, FRAME_W, FRAME_H, paletteSwap, hairBow);
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
 * Load the Cute_Fantasy slime spritesheet (512x192, 64x64 frames).
 * Image AND extracted rows are cached — previously every slime instance
 * re-loaded and re-decoded the sheet (~0.5-1s per mob per scene switch).
 */
export async function loadSlimeAnims() {
  const base = import.meta.env.BASE_URL || '/';
  const img = await loadImage(`${base}Cute_Fantasy_Free/Enemies/Slime_Green.png`);
  return {
    idle:  extractRow(img, 0, 4, 64, 64),
    run:   extractRow(img, 1, 8, 64, 64),
    death: extractRow(img, 2, 8, 64, 64),
  };
}

/**
 * Load the Cute_Fantasy NPC (same sprite as player but with different colors).
 */
export async function loadCuteFantasyNPC(hairColor, clothColor, pantsColor, hairBow = false) {
  return loadCuteFantasyPlayer({ hairColor, clothColor, pantsColor, hairBow });
}

// NPC color configs for Emilia's family.
// clothColor = top, pantsColor = bottom. Matching top+bottom reads as a dress.
export const NPC_PALETTE_CONFIGS = {
  emilia:      { hairColor: [61, 43, 31],    clothColor: [240, 130, 175], pantsColor: [225, 105, 160], hairBow: true },  // Dark brown hair, pink dress + bow
  mama_tanja:  { hairColor: [122, 72, 36],   clothColor: [215, 110, 145], pantsColor: [90, 70, 110] },    // Brown hair, pink top, plum skirt
  papa_milos:  { hairColor: [38, 32, 28],    clothColor: [70, 110, 180],  pantsColor: [70, 65, 75] },     // Black hair, blue shirt, grey pants
  marie:       { hairColor: [205, 165, 80],  clothColor: [250, 195, 70],  pantsColor: [240, 175, 60] },   // Blonde, yellow dress
  liam:        { hairColor: [70, 45, 22],    clothColor: [80, 165, 90],   pantsColor: [110, 85, 60] },    // Dark brown, green shirt, brown pants
  oma:         { hairColor: [88, 88, 96],    clothColor: [165, 105, 145], pantsColor: [120, 80, 110] },   // Grey hair, mauve dress
  opa:         { hairColor: [225, 195, 160], clothColor: [110, 135, 105], pantsColor: [85, 80, 70] },     // Bald (hair=skin tone), olive shirt
  baba:        { hairColor: [120, 60, 30],   clothColor: [195, 75, 65],   pantsColor: [150, 55, 50] },    // Auburn, red dress
  deda:        { hairColor: [150, 145, 138], clothColor: [70, 90, 140],   pantsColor: [60, 60, 65] },     // Grey, navy shirt
  ferdinand:   { hairColor: [215, 185, 90],  clothColor: [70, 165, 140],  pantsColor: [105, 80, 55] },    // Blonde hair, teal trader shirt
};
