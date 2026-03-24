import * as THREE from 'three';

/**
 * Generates detailed pixel-art character spritesheets via Canvas.
 * 48×48 pixel frames with distinct animations:
 *   idle (6f), walk (6f), run (6f), attack (6f), water (6f)
 *
 * Character is ~28px tall, centered in 48×48 frame.
 * Body proportions: large head (chibi-style), small body — cute for children's game.
 */

const SKIN_LIGHT = [240, 200, 170];
const SKIN_MEDIUM = [215, 175, 140];
const SKIN_DARK = [185, 145, 110];

function px(ctx, x, y, c, a = 1) {
  ctx.fillStyle = a < 1 ? `rgba(${c[0]},${c[1]},${c[2]},${a})` : `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx, x, y, w, h, c, a = 1) {
  ctx.fillStyle = a < 1 ? `rgba(${c[0]},${c[1]},${c[2]},${a})` : `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillRect(x, y, w, h);
}

function shade(c, f) {
  return [Math.min(255, Math.round(c[0]*f)), Math.min(255, Math.round(c[1]*f)), Math.min(255, Math.round(c[2]*f))];
}

// ─── BODY DRAWING ───

function drawBody(ctx, ox, oy, cfg, pose) {
  const { skin, hairColor, hairStyle, shirtColor, pantsColor, shoesColor, eyeColor } = cfg;
  const skinD = shade(skin, 0.82);
  const shirtD = shade(shirtColor, 0.78);
  const shirtL = shade(shirtColor, 1.15);
  const pantsD = shade(pantsColor, 0.8);
  const shoes = shoesColor || [75, 55, 35];
  const hairD = shade(hairColor, 0.7);

  const { legL, legR, armL, armR, bodyShift, headTilt, blink, swordX, swordY, waterArms } = pose;

  const bx = ox + 24; // body center x
  const by = oy + 18 + bodyShift; // body top y

  // ── Shadow on ground ──
  rect(ctx, ox + 16, oy + 42, 16, 3, [0, 0, 0], 0.15);

  // ── Legs ──
  // Left leg
  rect(ctx, bx - 5, by + 20 + legL, 4, 6, pantsColor);
  rect(ctx, bx - 5, by + 25 + legL, 4, 3, pantsD);
  rect(ctx, bx - 5, by + 27 + legL, 4, 2, shoes);

  // Right leg
  rect(ctx, bx + 1, by + 20 + legR, 4, 6, pantsColor);
  rect(ctx, bx + 1, by + 25 + legR, 4, 3, pantsD);
  rect(ctx, bx + 1, by + 27 + legR, 4, 2, shoes);

  // ── Body / Shirt ──
  rect(ctx, bx - 6, by + 12, 12, 9, shirtColor);
  rect(ctx, bx - 6, by + 18, 12, 3, shirtD); // lower shirt shadow
  // Collar highlight
  rect(ctx, bx - 4, by + 12, 8, 1, shirtL);

  // ── Arms ──
  if (waterArms) {
    // Arms extended forward for water magic
    rect(ctx, bx - 8, by + 13, 3, 5, shirtColor);
    rect(ctx, bx + 5, by + 13, 3, 5, shirtColor);
    // Hands forward
    rect(ctx, bx - 9, by + 14, 2, 3, skin);
    rect(ctx, bx + 7, by + 14, 2, 3, skin);
    // Water droplets
    px(ctx, bx - 11, by + 15, [80, 180, 255]);
    px(ctx, bx - 12, by + 14, [100, 200, 255]);
    px(ctx, bx + 9, by + 15, [80, 180, 255]);
    px(ctx, bx + 10, by + 14, [100, 200, 255]);
  } else {
    // Left arm
    rect(ctx, bx - 8, by + 13 + armL, 3, 7, shirtColor);
    rect(ctx, bx - 8, by + 19 + armL, 3, 2, skin); // hand

    // Right arm
    rect(ctx, bx + 5, by + 13 + armR, 3, 7, shirtColor);
    rect(ctx, bx + 5, by + 19 + armR, 3, 2, skin); // hand
  }

  // ── Sword (during attack) ──
  if (swordX !== undefined && swordY !== undefined) {
    // Sword blade
    rect(ctx, bx + swordX, by + swordY, 2, 10, [200, 200, 210]);
    rect(ctx, bx + swordX, by + swordY, 2, 1, [255, 255, 255]); // tip shine
    // Sword handle
    rect(ctx, bx + swordX - 1, by + swordY + 10, 4, 2, [120, 80, 40]);
  }

  // ── Neck ──
  rect(ctx, bx - 2, by + 10, 4, 3, skinD);

  // ── Head ──
  // Face base
  rect(ctx, bx - 6, by - 2 + headTilt, 12, 12, skin);

  // Ears
  rect(ctx, bx - 7, by + 3 + headTilt, 1, 4, skinD);
  rect(ctx, bx + 6, by + 3 + headTilt, 1, 4, skinD);

  // Eyes
  if (blink) {
    // Closed eyes (line)
    rect(ctx, bx - 4, by + 4 + headTilt, 3, 1, shade(eyeColor, 0.6));
    rect(ctx, bx + 1, by + 4 + headTilt, 3, 1, shade(eyeColor, 0.6));
  } else {
    // Left eye
    rect(ctx, bx - 5, by + 3 + headTilt, 4, 3, [255, 255, 255]);
    rect(ctx, bx - 4, by + 3 + headTilt, 2, 2, eyeColor);
    px(ctx, bx - 5, by + 3 + headTilt, [255, 255, 255]); // shine

    // Right eye
    rect(ctx, bx + 1, by + 3 + headTilt, 4, 3, [255, 255, 255]);
    rect(ctx, bx + 2, by + 3 + headTilt, 2, 2, eyeColor);
    px(ctx, bx + 1, by + 3 + headTilt, [255, 255, 255]); // shine
  }

  // Eyebrows
  rect(ctx, bx - 4, by + 1 + headTilt, 3, 1, shade(hairColor, 0.9));
  rect(ctx, bx + 1, by + 1 + headTilt, 3, 1, shade(hairColor, 0.9));

  // Nose
  px(ctx, bx, by + 6 + headTilt, skinD);

  // Mouth (cute smile)
  px(ctx, bx - 1, by + 8 + headTilt, shade(skin, 0.65));
  px(ctx, bx, by + 8 + headTilt, shade(skin, 0.65));
  px(ctx, bx + 1, by + 8 + headTilt, shade(skin, 0.65));

  // Cheek blush
  rect(ctx, bx - 5, by + 6 + headTilt, 2, 2, [255, 190, 180], 0.5);
  rect(ctx, bx + 3, by + 6 + headTilt, 2, 2, [255, 190, 180], 0.5);

  // ── Hair ──
  drawHair(ctx, bx, by + headTilt, hairStyle, hairColor, hairD);
}

function drawHair(ctx, cx, by, style, hair, hairD) {
  // Top of head
  rect(ctx, cx - 7, by - 5, 14, 4, hair);
  rect(ctx, cx - 8, by - 3, 16, 3, hair);

  // Bangs / fringe
  rect(ctx, cx - 6, by - 2, 5, 2, hairD);
  rect(ctx, cx + 1, by - 2, 5, 2, hairD);

  switch (style) {
    case 'long':
      // Long flowing strands on sides
      rect(ctx, cx - 8, by - 3, 2, 18, hair);
      rect(ctx, cx + 6, by - 3, 2, 18, hair);
      rect(ctx, cx - 9, by, 2, 14, hairD);
      rect(ctx, cx + 8, by, 1, 14, hairD);
      // Tips
      px(ctx, cx - 9, by + 14, hairD);
      px(ctx, cx + 8, by + 14, hairD);
      break;

    case 'medium':
      rect(ctx, cx - 8, by - 3, 2, 12, hair);
      rect(ctx, cx + 6, by - 3, 2, 12, hair);
      rect(ctx, cx - 9, by, 2, 8, hairD);
      rect(ctx, cx + 8, by, 1, 8, hairD);
      break;

    case 'short':
      rect(ctx, cx - 8, by - 3, 2, 6, hair);
      rect(ctx, cx + 6, by - 3, 2, 6, hair);
      rect(ctx, cx - 7, by - 4, 14, 2, shade(hair, 1.1));
      break;

    case 'bun':
      rect(ctx, cx - 3, by - 8, 6, 4, hair);
      rect(ctx, cx - 2, by - 9, 4, 2, shade(hair, 1.1));
      rect(ctx, cx - 8, by - 3, 2, 10, hair);
      rect(ctx, cx + 6, by - 3, 2, 10, hair);
      break;

    case 'ponytail':
      rect(ctx, cx - 8, by - 3, 2, 8, hair);
      rect(ctx, cx + 6, by - 3, 2, 8, hair);
      // Ponytail flowing right
      rect(ctx, cx + 7, by, 3, 14, hair);
      rect(ctx, cx + 9, by + 3, 2, 10, hairD);
      px(ctx, cx + 10, by + 13, hairD);
      break;
  }
}

// ─── ANIMATION POSE DEFINITIONS ───

const IDLE_POSES = [
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 1, headTilt: 0, blink: false },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 1, headTilt: 0, blink: true },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false },
];

const WALK_POSES = [
  { legL: -2, legR: 2,  armL: 1,  armR: -1, bodyShift: 0, headTilt: 0, blink: false },
  { legL: -1, legR: 1,  armL: 0,  armR: 0,  bodyShift: -1, headTilt: 0, blink: false },
  { legL: 2,  legR: -2, armL: -1, armR: 1,  bodyShift: 0, headTilt: 0, blink: false },
  { legL: 1,  legR: -1, armL: 0,  armR: 0,  bodyShift: -1, headTilt: 0, blink: false },
  { legL: -2, legR: 2,  armL: 1,  armR: -1, bodyShift: 0, headTilt: 0, blink: false },
  { legL: 0,  legR: 0,  armL: 0,  armR: 0,  bodyShift: 0, headTilt: 0, blink: false },
];

const RUN_POSES = [
  { legL: -3, legR: 3,  armL: 2,  armR: -2, bodyShift: -1, headTilt: -1, blink: false },
  { legL: -1, legR: 1,  armL: 0,  armR: 0,  bodyShift: -2, headTilt: 0,  blink: false },
  { legL: 3,  legR: -3, armL: -2, armR: 2,  bodyShift: -1, headTilt: -1, blink: false },
  { legL: 1,  legR: -1, armL: 0,  armR: 0,  bodyShift: -2, headTilt: 0,  blink: false },
  { legL: -3, legR: 3,  armL: 2,  armR: -2, bodyShift: -1, headTilt: -1, blink: false },
  { legL: 0,  legR: 0,  armL: 0,  armR: 0,  bodyShift: -1, headTilt: 0,  blink: false },
];

const ATTACK_POSES = [
  { legL: 0, legR: 0, armL: 0, armR: -2, bodyShift: 0, headTilt: 0, blink: false },
  { legL: 0, legR: 1, armL: 0, armR: -3, bodyShift: -1, headTilt: 0, blink: false, swordX: 8, swordY: 2 },
  { legL: 1, legR: 2, armL: -1, armR: -4, bodyShift: -1, headTilt: -1, blink: false, swordX: 10, swordY: -2 },
  { legL: 0, legR: 1, armL: 0, armR: -2, bodyShift: 0, headTilt: 0, blink: false, swordX: 12, swordY: 4 },
  { legL: 0, legR: 0, armL: 0, armR: -1, bodyShift: 0, headTilt: 0, blink: false, swordX: 10, swordY: 8 },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false },
];

const WATER_POSES = [
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false, waterArms: false },
  { legL: 0, legR: 0, armL: -2, armR: -2, bodyShift: 0, headTilt: 0, blink: false, waterArms: true },
  { legL: 0, legR: 0, armL: -3, armR: -3, bodyShift: -1, headTilt: -1, blink: false, waterArms: true },
  { legL: 0, legR: 0, armL: -3, armR: -3, bodyShift: -1, headTilt: 0, blink: false, waterArms: true },
  { legL: 0, legR: 0, armL: -2, armR: -2, bodyShift: 0, headTilt: 0, blink: false, waterArms: true },
  { legL: 0, legR: 0, armL: 0, armR: 0, bodyShift: 0, headTilt: 0, blink: false, waterArms: false },
];

const ANIMATION_POSES = {
  idle: IDLE_POSES,
  walk: WALK_POSES,
  run: RUN_POSES,
  slice: ATTACK_POSES,
  collect: WALK_POSES, // reuse walk poses for collecting
  crush: ATTACK_POSES, // reuse attack for crushing
  water: WATER_POSES,
};

// ─── PUBLIC API ───

/**
 * Generate a spritesheet for a specific animation.
 * Returns { texture, frameWidth, frameHeight, frameCount, sheetWidth, sheetHeight }
 */
export function generateCharacterSheet(config, animName = 'idle') {
  const poses = ANIMATION_POSES[animName] || IDLE_POSES;
  const frameW = 48;
  const frameH = 48;
  const numFrames = poses.length;

  const canvas = document.createElement('canvas');
  canvas.width = frameW * numFrames;
  canvas.height = frameH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  for (let f = 0; f < numFrames; f++) {
    drawBody(ctx, f * frameW, 0, config, poses[f]);
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
    frameCount: numFrames,
    sheetWidth: canvas.width,
    sheetHeight: canvas.height,
  };
}

// ─── CHARACTER CONFIGS ───

export const CHARACTER_CONFIGS = {
  emilia: {
    skin: SKIN_LIGHT,
    hairColor: [25, 15, 8],
    hairStyle: 'long',
    shirtColor: [100, 170, 220],
    pantsColor: [80, 140, 190],
    shoesColor: [140, 80, 60],
    eyeColor: [45, 90, 45],
  },
  mama_tanja: {
    skin: SKIN_LIGHT,
    hairColor: [90, 55, 30],
    hairStyle: 'medium',
    shirtColor: [230, 130, 160],
    pantsColor: [90, 70, 110],
    shoesColor: [100, 60, 50],
    eyeColor: [60, 80, 50],
  },
  papa_milos: {
    skin: SKIN_MEDIUM,
    hairColor: [20, 18, 15],
    hairStyle: 'short',
    shirtColor: [70, 110, 180],
    pantsColor: [50, 50, 60],
    shoesColor: [60, 45, 30],
    eyeColor: [50, 40, 30],
  },
  marie: {
    skin: SKIN_LIGHT,
    hairColor: [210, 180, 80],
    hairStyle: 'ponytail',
    shirtColor: [240, 210, 80],
    pantsColor: [100, 80, 60],
    shoesColor: [130, 70, 50],
    eyeColor: [60, 100, 140],
  },
  liam: {
    skin: SKIN_LIGHT,
    hairColor: [80, 55, 35],
    hairStyle: 'short',
    shirtColor: [80, 160, 100],
    pantsColor: [60, 60, 70],
    shoesColor: [70, 50, 35],
    eyeColor: [60, 80, 50],
  },
  oma: {
    skin: SKIN_LIGHT,
    hairColor: [190, 185, 175],
    hairStyle: 'bun',
    shirtColor: [150, 100, 180],
    pantsColor: [120, 80, 140],
    shoesColor: [90, 70, 60],
    eyeColor: [70, 70, 90],
  },
  opa: {
    skin: SKIN_LIGHT,
    hairColor: [140, 135, 125],
    hairStyle: 'short',
    shirtColor: [160, 120, 70],
    pantsColor: [70, 60, 50],
    shoesColor: [70, 50, 35],
    eyeColor: [60, 60, 50],
  },
  baba: {
    skin: SKIN_MEDIUM,
    hairColor: [140, 70, 40],
    hairStyle: 'bun',
    shirtColor: [190, 70, 60],
    pantsColor: [140, 50, 40],
    shoesColor: [80, 50, 35],
    eyeColor: [60, 45, 30],
  },
  deda: {
    skin: SKIN_MEDIUM,
    hairColor: [110, 105, 95],
    hairStyle: 'short',
    shirtColor: [60, 80, 130],
    pantsColor: [50, 50, 60],
    shoesColor: [55, 40, 30],
    eyeColor: [50, 45, 35],
  },
};
