import * as THREE from 'three';

/**
 * Adds hair and clothing to base Body_A spritesheets via canvas manipulation.
 * The base sprite is a ~20px tall humanoid centered in a 64x64 frame.
 *
 * Head center: approximately (32, 25) in each 64x64 frame.
 */

// ─── Hair style bitmaps ───
// Each row is a string: '#' = hair pixel, '.' = empty
// Positioned relative to head top-center

const HAIR_LONG = {
  down: [ // front view — long hair framing face
    '...####...',
    '..######..',
    '.########.',
    '.##....##.',
    '.##....##.',
    '.##....##.',
    '.##....##.',
    '.##....##.',
    '.##....##.',
    '..#....#..',
    '..#....#..',
    '.#......#.',
  ],
  side: [ // side view — hair flows behind
    '..####....',
    '.######...',
    '.#######..',
    '.....####.',
    '......###.',
    '......###.',
    '......###.',
    '.......##.',
    '.......##.',
    '......##..',
    '......#...',
  ],
  up: [ // back view — full hair coverage
    '...####...',
    '..######..',
    '.########.',
    '.########.',
    '.########.',
    '.##.##.##.',
    '.##.##.##.',
    '..##..##..',
    '..##..##..',
    '...#..#...',
    '..#....#..',
  ],
};

const HAIR_MEDIUM = {
  down: [
    '...####...',
    '..######..',
    '.########.',
    '.##....##.',
    '.##....##.',
    '.##....##.',
    '..#....#..',
  ],
  side: [
    '..####....',
    '.######...',
    '.#######..',
    '......##..',
    '......##..',
    '.......#..',
  ],
  up: [
    '...####...',
    '..######..',
    '.########.',
    '.########.',
    '.##.##.##.',
    '..##..##..',
  ],
};

const HAIR_SHORT = {
  down: [
    '...####...',
    '..######..',
    '.########.',
    '.#......#.',
  ],
  side: [
    '..####....',
    '.######...',
    '.######...',
  ],
  up: [
    '...####...',
    '..######..',
    '.########.',
    '.########.',
  ],
};

const HAIR_BUN = {
  down: [
    '....##....',
    '...####...',
    '...####...',
    '..######..',
    '.########.',
    '.##....##.',
    '.##....##.',
    '..#....#..',
  ],
  side: [
    '...###....',
    '..#####...',
    '..#####...',
    '.######...',
    '.#####....',
    '......#...',
  ],
  up: [
    '....##....',
    '...####...',
    '...####...',
    '..######..',
    '.########.',
    '.########.',
    '.##.##.##.',
  ],
};

const HAIR_STYLES = {
  long: HAIR_LONG,
  medium: HAIR_MEDIUM,
  short: HAIR_SHORT,
  bun: HAIR_BUN,
};

// ─── Head position in the 64x64 frame ───
// These are approximate pixel coordinates for where the head starts
const HEAD_TOP = 20;     // y of head top (approx)
const HEAD_CENTER_X = 32; // x center of head

// The body region (for clothing) starts below the head
const BODY_TOP = 28;
const BODY_BOTTOM = 46;

/**
 * Creates a customized character spritesheet canvas.
 * @param {HTMLImageElement} baseImage - the original spritesheet image
 * @param {number} frameW - frame width (64)
 * @param {number} frameH - frame height (64)
 * @param {number} numFrames - number of frames in the strip
 * @param {object} config - { hairStyle, hairColor, clothingColor, direction }
 * @returns {HTMLCanvasElement}
 */
export function customizeSprite(baseImage, frameW, frameH, numFrames, config) {
  const canvas = document.createElement('canvas');
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Draw base sprite
  ctx.drawImage(baseImage, 0, 0);

  // Apply clothing color to body area
  if (config.clothingColor) {
    applyClothing(ctx, frameW, frameH, numFrames, config.clothingColor);
  }

  // Draw hair on each frame
  if (config.hairStyle && config.hairColor) {
    const dir = config.direction || 'down';
    const hairDef = HAIR_STYLES[config.hairStyle];
    if (hairDef && hairDef[dir]) {
      drawHairOnFrames(ctx, frameW, frameH, numFrames, hairDef[dir], config.hairColor);
    }
  }

  return canvas;
}

/**
 * Recolors the body area of each frame to simulate clothing.
 * Uses pixel scanning to only recolor non-transparent body pixels.
 */
function applyClothing(ctx, frameW, frameH, numFrames, colorHex) {
  const r = (colorHex >> 16) & 0xff;
  const g = (colorHex >> 8) & 0xff;
  const b = colorHex & 0xff;

  for (let f = 0; f < numFrames; f++) {
    const fx = f * frameW;
    const imageData = ctx.getImageData(fx, 0, frameW, frameH);
    const data = imageData.data;

    for (let y = BODY_TOP; y < BODY_BOTTOM; y++) {
      for (let x = 0; x < frameW; x++) {
        const i = (y * frameW + x) * 4;
        const alpha = data[i + 3];
        if (alpha > 30) {
          // Blend clothing color with original (tint effect)
          data[i] = Math.round(data[i] * 0.3 + r * 0.7);
          data[i + 1] = Math.round(data[i + 1] * 0.3 + g * 0.7);
          data[i + 2] = Math.round(data[i + 2] * 0.3 + b * 0.7);
        }
      }
    }

    ctx.putImageData(imageData, fx, 0);
  }
}

/**
 * Draws hair pixels on each frame of the spritesheet.
 */
function drawHairOnFrames(ctx, frameW, frameH, numFrames, hairBitmap, colorHex) {
  const r = (colorHex >> 16) & 0xff;
  const g = (colorHex >> 8) & 0xff;
  const b = colorHex & 0xff;

  // Parse hair bitmap to get pixel positions
  const pixels = [];
  const bitmapW = hairBitmap[0].length;

  for (let row = 0; row < hairBitmap.length; row++) {
    const line = hairBitmap[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] === '#') {
        // Position relative to head center
        const dx = col - Math.floor(bitmapW / 2);
        const dy = row;
        pixels.push({ dx, dy });
      }
    }
  }

  // Apply to each frame
  for (let f = 0; f < numFrames; f++) {
    const fx = f * frameW;

    // Slight variation per frame for animation (0-1px shift)
    const frameShift = (f === 1 || f === 3) ? 1 : 0;

    for (const { dx, dy } of pixels) {
      const px = fx + HEAD_CENTER_X + dx;
      const py = HEAD_TOP + dy + frameShift;

      if (px >= fx && px < fx + frameW && py >= 0 && py < frameH) {
        // Draw hair pixel with depth based on position
        const shade = 0.85 + (dy % 3) * 0.05 + (dx % 2) * 0.05;
        ctx.fillStyle = `rgb(${Math.round(r * shade)}, ${Math.round(g * shade)}, ${Math.round(b * shade)})`;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    // Add subtle highlight to top of hair
    if (pixels.length > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
      for (const { dx, dy } of pixels) {
        if (dy <= 1) {
          const px = fx + HEAD_CENTER_X + dx;
          const py = HEAD_TOP + dy + frameShift;
          if (px >= fx && px < fx + frameW && py >= 0 && py < frameH) {
            ctx.fillRect(px, py, 1, 1);
          }
        }
      }
    }
  }
}

/**
 * Creates a THREE.Texture from a customized spritesheet.
 */
export function createCustomTexture(baseImage, frameW, frameH, numFrames, config) {
  const canvas = customizeSprite(baseImage, frameW, frameH, numFrames, config);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
