/**
 * Generates 16×16 pixel-art icons for each item type via Canvas.
 * Returns a cached canvas or data URL for use in HTML and Three.js textures.
 */

const iconCache = {};

function px(ctx, x, y, r, g, b, a = 255) {
  ctx.fillStyle = a < 255 ? `rgba(${r},${g},${b},${a / 255})` : `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx, x, y, w, h, r, g, b) {
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, w, h);
}

function drawItemIcon(ctx, itemId) {
  const drawers = {
    wood: () => {
      rect(ctx, 3, 4, 4, 10, 139, 90, 50);
      rect(ctx, 5, 2, 6, 3, 100, 65, 35);
      rect(ctx, 9, 6, 4, 8, 160, 110, 60);
      rect(ctx, 3, 4, 4, 1, 170, 125, 70);
      px(ctx, 5, 8, 90, 55, 30);
      px(ctx, 11, 10, 130, 85, 45);
    },
    stone: () => {
      rect(ctx, 3, 6, 10, 7, 140, 140, 145);
      rect(ctx, 5, 4, 6, 3, 155, 155, 160);
      rect(ctx, 4, 5, 8, 1, 165, 165, 170);
      rect(ctx, 3, 12, 10, 1, 110, 110, 115);
      px(ctx, 6, 7, 170, 170, 175);
      px(ctx, 9, 9, 120, 120, 125);
    },
    iron_ore: () => {
      rect(ctx, 3, 5, 10, 8, 130, 130, 135);
      rect(ctx, 5, 7, 3, 3, 180, 120, 60);
      rect(ctx, 9, 6, 2, 2, 190, 130, 70);
      rect(ctx, 6, 11, 3, 2, 170, 110, 55);
      px(ctx, 5, 7, 210, 150, 80);
    },
    earth: () => {
      rect(ctx, 2, 6, 12, 7, 100, 65, 35);
      rect(ctx, 4, 5, 8, 2, 110, 75, 40);
      rect(ctx, 3, 12, 10, 1, 80, 50, 25);
      px(ctx, 6, 8, 120, 80, 45);
      px(ctx, 9, 10, 85, 55, 30);
      px(ctx, 5, 5, 60, 120, 40); // grass sprout
    },
    mushroom: () => {
      rect(ctx, 7, 8, 2, 6, 200, 180, 150);
      rect(ctx, 4, 4, 8, 5, 200, 130, 70);
      rect(ctx, 3, 5, 10, 3, 210, 140, 80);
      px(ctx, 5, 5, 255, 255, 230);
      px(ctx, 9, 6, 255, 255, 230);
    },
    crystal: () => {
      rect(ctx, 6, 3, 4, 10, 120, 190, 255);
      rect(ctx, 5, 5, 6, 6, 140, 200, 255);
      rect(ctx, 7, 2, 2, 2, 180, 220, 255);
      px(ctx, 6, 4, 200, 235, 255);
      px(ctx, 9, 7, 100, 170, 240);
      px(ctx, 5, 10, 90, 160, 230);
    },
    bone: () => {
      rect(ctx, 4, 7, 8, 2, 230, 215, 190);
      rect(ctx, 3, 6, 3, 4, 240, 225, 200);
      rect(ctx, 10, 6, 3, 4, 240, 225, 200);
      px(ctx, 3, 6, 250, 240, 220);
      px(ctx, 11, 6, 250, 240, 220);
    },
    fish_generic: () => {
      rect(ctx, 3, 6, 10, 4, 70, 140, 200);
      rect(ctx, 5, 5, 6, 1, 80, 150, 210);
      rect(ctx, 5, 10, 6, 1, 60, 120, 180);
      rect(ctx, 12, 5, 2, 6, 60, 130, 190);
      px(ctx, 4, 7, 30, 30, 50); // eye
      px(ctx, 4, 7, 255, 255, 255); // eye shine
      rect(ctx, 7, 6, 4, 1, 90, 170, 230);
    },
    meat: () => {
      rect(ctx, 4, 5, 8, 6, 200, 65, 55);
      rect(ctx, 5, 4, 6, 1, 210, 75, 65);
      rect(ctx, 5, 11, 6, 1, 170, 50, 40);
      rect(ctx, 3, 10, 3, 4, 230, 215, 190); // bone
      px(ctx, 6, 6, 230, 90, 80); // fat
      px(ctx, 9, 8, 220, 80, 70);
    },
    vegetable: () => {
      rect(ctx, 5, 5, 6, 7, 70, 170, 70);
      rect(ctx, 4, 6, 8, 5, 80, 180, 80);
      rect(ctx, 6, 3, 4, 3, 50, 140, 50);
      px(ctx, 7, 2, 40, 120, 40);
      px(ctx, 6, 7, 100, 200, 100);
    },
    berry: () => {
      rect(ctx, 5, 6, 6, 6, 170, 50, 170);
      rect(ctx, 4, 7, 8, 4, 180, 60, 180);
      rect(ctx, 7, 4, 2, 3, 60, 130, 50);
      px(ctx, 6, 7, 200, 80, 200);
      px(ctx, 9, 9, 140, 30, 140);
    },
    sword_wood: () => {
      rect(ctx, 7, 2, 2, 8, 180, 150, 100);
      rect(ctx, 6, 1, 4, 1, 200, 170, 120);
      rect(ctx, 5, 10, 6, 2, 110, 75, 40);
      rect(ctx, 7, 12, 2, 2, 90, 60, 35);
      px(ctx, 7, 2, 220, 190, 140);
    },
    sword_stone: () => {
      rect(ctx, 7, 2, 2, 8, 160, 160, 170);
      rect(ctx, 6, 1, 4, 1, 180, 180, 190);
      rect(ctx, 5, 10, 6, 2, 110, 75, 40);
      rect(ctx, 7, 12, 2, 2, 90, 60, 35);
      px(ctx, 7, 3, 200, 200, 210);
    },
    sword_bone: () => {
      rect(ctx, 7, 2, 2, 8, 230, 215, 190);
      rect(ctx, 6, 1, 4, 2, 240, 225, 200);
      rect(ctx, 5, 10, 6, 2, 180, 130, 90);
      rect(ctx, 7, 12, 2, 2, 160, 110, 70);
    },
    cooked_fish: () => {
      rect(ctx, 3, 6, 10, 4, 210, 170, 70);
      rect(ctx, 5, 5, 6, 1, 220, 180, 80);
      rect(ctx, 12, 5, 2, 6, 190, 150, 60);
      px(ctx, 4, 7, 40, 40, 40);
      rect(ctx, 7, 6, 3, 1, 230, 200, 100);
    },
    cooked_meat: () => {
      rect(ctx, 4, 5, 8, 6, 180, 100, 50);
      rect(ctx, 5, 4, 6, 1, 200, 120, 60);
      rect(ctx, 3, 10, 3, 4, 230, 215, 190);
      px(ctx, 7, 7, 210, 130, 70);
    },
    veggie_soup: () => {
      rect(ctx, 3, 6, 10, 6, 120, 90, 60);
      rect(ctx, 4, 7, 8, 4, 100, 170, 80);
      rect(ctx, 5, 5, 6, 2, 140, 100, 70);
      px(ctx, 6, 8, 130, 190, 100);
      px(ctx, 9, 9, 110, 160, 70);
    },
    heal_potion: () => {
      rect(ctx, 6, 3, 4, 2, 160, 160, 170);
      rect(ctx, 5, 5, 6, 7, 230, 80, 140);
      rect(ctx, 4, 6, 8, 5, 240, 90, 150);
      px(ctx, 6, 6, 255, 120, 170);
      px(ctx, 5, 11, 200, 60, 120);
      rect(ctx, 6, 2, 4, 1, 180, 180, 190);
    },
    unicorn_tear: () => {
      rect(ctx, 6, 3, 4, 8, 220, 210, 240);
      rect(ctx, 7, 2, 2, 1, 240, 230, 255);
      rect(ctx, 5, 5, 6, 4, 230, 220, 250);
      px(ctx, 7, 4, 255, 255, 255);
      px(ctx, 6, 7, 200, 190, 230);
      px(ctx, 9, 6, 255, 240, 255);
    },
    rainbow_flower: () => {
      px(ctx, 7, 3, 255, 100, 100);
      px(ctx, 9, 4, 255, 200, 50);
      px(ctx, 9, 6, 100, 200, 100);
      px(ctx, 7, 7, 100, 150, 255);
      px(ctx, 5, 6, 200, 100, 255);
      px(ctx, 5, 4, 255, 150, 200);
      rect(ctx, 7, 4, 2, 3, 255, 230, 100);
      rect(ctx, 7, 8, 2, 5, 60, 130, 50);
    },
    magic_herb: () => {
      rect(ctx, 7, 8, 2, 5, 50, 110, 40);
      rect(ctx, 4, 4, 8, 5, 60, 200, 130);
      rect(ctx, 5, 3, 6, 2, 70, 220, 150);
      px(ctx, 6, 4, 100, 240, 170);
      px(ctx, 9, 6, 40, 170, 110);
    },
    bloom_petal: () => {
      rect(ctx, 5, 4, 6, 6, 255, 170, 200);
      rect(ctx, 6, 3, 4, 1, 255, 190, 210);
      rect(ctx, 6, 10, 4, 1, 240, 150, 180);
      px(ctx, 7, 6, 255, 200, 220);
      px(ctx, 8, 7, 255, 210, 225);
    },
    shell_common: () => {
      rect(ctx, 4, 6, 8, 5, 255, 200, 215);
      rect(ctx, 5, 5, 6, 1, 255, 210, 225);
      rect(ctx, 3, 10, 10, 1, 240, 180, 195);
      px(ctx, 6, 7, 255, 220, 230);
      px(ctx, 9, 8, 240, 190, 205);
      rect(ctx, 6, 7, 1, 3, 230, 170, 185);
    },
    seed_carrot: () => {
      rect(ctx, 6, 6, 4, 4, 200, 140, 70);
      rect(ctx, 7, 5, 2, 1, 180, 120, 50);
      px(ctx, 7, 4, 60, 130, 40);
      px(ctx, 8, 3, 50, 120, 35);
    },
    seed_tomato: () => {
      rect(ctx, 6, 6, 4, 4, 180, 80, 60);
      rect(ctx, 7, 5, 2, 1, 160, 60, 40);
      px(ctx, 7, 4, 60, 130, 40);
    },
    seed_pumpkin: () => {
      rect(ctx, 6, 6, 4, 4, 200, 160, 60);
      rect(ctx, 7, 5, 2, 1, 180, 140, 40);
      px(ctx, 7, 4, 60, 130, 40);
    },
    seed_crystal: () => {
      rect(ctx, 6, 6, 4, 4, 150, 200, 230);
      rect(ctx, 7, 5, 2, 1, 130, 180, 210);
      px(ctx, 7, 4, 100, 200, 255);
    },
  };

  const drawer = drawers[itemId];
  if (drawer) {
    drawer();
  } else {
    // Fallback: colored square with letter
    const item = getItemDef(itemId);
    const c = hexToRgb(item?.color || '#888888');
    rect(ctx, 3, 3, 10, 10, c[0], c[1], c[2]);
    rect(ctx, 4, 4, 8, 8, Math.min(255, c[0] + 30), Math.min(255, c[1] + 30), Math.min(255, c[2] + 30));
  }
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function getItemDef(id) {
  // Lazy import to avoid circular deps
  return null;
}

/**
 * Get a 16×16 canvas icon for an item.
 */
export function getItemIconCanvas(itemId) {
  if (iconCache[itemId]) return iconCache[itemId];

  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  drawItemIcon(ctx, itemId);

  iconCache[itemId] = canvas;
  return canvas;
}

/**
 * Get a data URL for an item icon (for use in HTML img tags).
 */
export function getItemIconDataURL(itemId) {
  const canvas = getItemIconCanvas(itemId);
  return canvas.toDataURL();
}

/**
 * Get a THREE.CanvasTexture for an item icon.
 */
export function getItemIconTexture(itemId) {
  const canvas = getItemIconCanvas(itemId);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}

import * as THREE from 'three';
