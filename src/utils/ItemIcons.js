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

    // === FISH ===
    goldfish: () => {
      rect(ctx, 3, 6, 10, 4, 220, 150, 30);
      rect(ctx, 5, 5, 6, 1, 240, 170, 50);
      rect(ctx, 5, 10, 6, 1, 190, 120, 20);
      rect(ctx, 12, 5, 2, 6, 200, 130, 25);
      px(ctx, 4, 7, 30, 20, 10);
      px(ctx, 4, 7, 255, 255, 200);
      rect(ctx, 7, 6, 4, 1, 255, 200, 80);
    },
    silverfish: () => {
      rect(ctx, 3, 6, 10, 4, 190, 195, 200);
      rect(ctx, 5, 5, 6, 1, 210, 215, 220);
      rect(ctx, 5, 10, 6, 1, 160, 165, 170);
      rect(ctx, 12, 5, 2, 6, 170, 175, 180);
      px(ctx, 4, 7, 40, 40, 50);
      px(ctx, 4, 7, 255, 255, 255);
      rect(ctx, 7, 6, 4, 1, 230, 235, 240);
    },
    starfish: () => {
      // Center
      rect(ctx, 6, 6, 4, 4, 210, 100, 50);
      // Five arms
      rect(ctx, 7, 3, 2, 3, 220, 110, 55);
      rect(ctx, 7, 10, 2, 3, 220, 110, 55);
      rect(ctx, 3, 7, 3, 2, 220, 110, 55);
      rect(ctx, 10, 7, 3, 2, 220, 110, 55);
      px(ctx, 4, 4, 215, 105, 52);
      px(ctx, 11, 4, 215, 105, 52);
      px(ctx, 4, 11, 215, 105, 52);
      px(ctx, 11, 11, 215, 105, 52);
      px(ctx, 8, 7, 240, 140, 80);
    },
    rainbow_trout: () => {
      rect(ctx, 3, 6, 10, 4, 180, 130, 200);
      rect(ctx, 5, 5, 6, 1, 200, 150, 220);
      rect(ctx, 5, 10, 6, 1, 150, 100, 170);
      rect(ctx, 12, 5, 2, 6, 160, 110, 180);
      // Rainbow stripe
      px(ctx, 5, 7, 255, 80, 80);
      px(ctx, 6, 7, 255, 180, 60);
      px(ctx, 7, 7, 80, 200, 80);
      px(ctx, 8, 7, 60, 160, 255);
      px(ctx, 9, 7, 180, 80, 255);
      px(ctx, 4, 7, 40, 30, 50);
    },
    pufferfish: () => {
      rect(ctx, 4, 4, 8, 8, 100, 170, 80);
      rect(ctx, 5, 3, 6, 1, 110, 180, 90);
      rect(ctx, 3, 5, 1, 6, 110, 180, 90);
      rect(ctx, 12, 5, 1, 6, 110, 180, 90);
      rect(ctx, 5, 12, 6, 1, 110, 180, 90);
      // Spikes
      px(ctx, 6, 2, 80, 150, 60);
      px(ctx, 9, 2, 80, 150, 60);
      px(ctx, 2, 6, 80, 150, 60);
      px(ctx, 2, 9, 80, 150, 60);
      px(ctx, 13, 6, 80, 150, 60);
      px(ctx, 13, 9, 80, 150, 60);
      px(ctx, 6, 13, 80, 150, 60);
      px(ctx, 9, 13, 80, 150, 60);
      px(ctx, 5, 6, 30, 30, 20);
      px(ctx, 6, 6, 255, 255, 200);
    },
    ghostfish: () => {
      rect(ctx, 3, 6, 10, 4, 180, 210, 230, 180);
      rect(ctx, 5, 5, 6, 1, 200, 225, 240, 160);
      rect(ctx, 5, 10, 6, 1, 160, 195, 215, 160);
      rect(ctx, 12, 5, 2, 6, 170, 200, 220, 160);
      px(ctx, 4, 7, 100, 140, 180, 200);
      px(ctx, 4, 7, 240, 250, 255, 220);
      rect(ctx, 7, 6, 4, 1, 210, 235, 245, 180);
    },

    // === BEACH ===
    coconut: () => {
      rect(ctx, 4, 4, 8, 9, 100, 65, 35);
      rect(ctx, 5, 3, 6, 1, 120, 80, 45);
      rect(ctx, 4, 12, 8, 1, 75, 45, 20);
      // Fibrous texture
      px(ctx, 5, 5, 80, 50, 25);
      px(ctx, 9, 6, 80, 50, 25);
      px(ctx, 6, 9, 80, 50, 25);
      px(ctx, 10, 10, 80, 50, 25);
      px(ctx, 7, 7, 130, 90, 50);
      // Three eyes
      px(ctx, 6, 6, 40, 25, 10);
      px(ctx, 8, 6, 40, 25, 10);
      px(ctx, 7, 8, 40, 25, 10);
    },
    sand_dollar: () => {
      rect(ctx, 3, 5, 10, 6, 220, 205, 175);
      rect(ctx, 5, 3, 6, 1, 230, 215, 185);
      rect(ctx, 4, 4, 8, 1, 228, 212, 182);
      rect(ctx, 4, 11, 8, 1, 200, 185, 155);
      rect(ctx, 3, 10, 10, 1, 210, 195, 165);
      // Star pattern
      px(ctx, 8, 5, 190, 175, 145);
      px(ctx, 8, 10, 190, 175, 145);
      px(ctx, 5, 7, 190, 175, 145);
      px(ctx, 11, 7, 190, 175, 145);
      px(ctx, 6, 5, 190, 175, 145);
      px(ctx, 10, 5, 190, 175, 145);
      px(ctx, 8, 7, 240, 225, 200);
    },
    pearl: () => {
      rect(ctx, 5, 4, 6, 8, 240, 230, 235);
      rect(ctx, 4, 6, 8, 4, 245, 235, 240);
      rect(ctx, 6, 3, 4, 1, 250, 245, 248);
      rect(ctx, 6, 12, 4, 1, 220, 210, 215);
      px(ctx, 6, 5, 255, 255, 255);
      px(ctx, 7, 4, 255, 255, 255);
      px(ctx, 10, 8, 210, 200, 210);
    },
    starfish_shell: () => {
      rect(ctx, 6, 6, 4, 4, 230, 120, 60);
      rect(ctx, 7, 3, 2, 3, 235, 125, 65);
      rect(ctx, 7, 10, 2, 3, 235, 125, 65);
      rect(ctx, 3, 7, 3, 2, 235, 125, 65);
      rect(ctx, 10, 7, 3, 2, 235, 125, 65);
      px(ctx, 5, 4, 230, 120, 60);
      px(ctx, 10, 4, 230, 120, 60);
      px(ctx, 5, 11, 230, 120, 60);
      px(ctx, 10, 11, 230, 120, 60);
      px(ctx, 8, 7, 255, 160, 100);
    },
    coral_piece: () => {
      // Trunk
      rect(ctx, 7, 8, 2, 5, 200, 60, 60);
      // Branches
      rect(ctx, 4, 5, 3, 2, 210, 70, 70);
      rect(ctx, 9, 4, 3, 2, 210, 70, 70);
      rect(ctx, 5, 7, 2, 2, 205, 65, 65);
      rect(ctx, 9, 7, 2, 2, 205, 65, 65);
      // Tips
      px(ctx, 4, 4, 230, 90, 90);
      px(ctx, 10, 3, 230, 90, 90);
      px(ctx, 5, 6, 230, 90, 90);
      px(ctx, 10, 6, 230, 90, 90);
    },
    driftwood: () => {
      rect(ctx, 2, 7, 12, 3, 150, 130, 110);
      rect(ctx, 3, 6, 10, 1, 165, 145, 125);
      rect(ctx, 3, 10, 10, 1, 125, 105, 85);
      // Grain lines
      px(ctx, 4, 8, 130, 110, 90);
      px(ctx, 7, 7, 170, 150, 130);
      px(ctx, 10, 9, 130, 110, 90);
      px(ctx, 5, 9, 170, 150, 130);
      // Worn ends
      px(ctx, 2, 7, 180, 160, 140);
      px(ctx, 13, 9, 110, 90, 70);
    },
    rainbow_shell: () => {
      rect(ctx, 4, 4, 8, 8, 220, 180, 200);
      rect(ctx, 5, 3, 6, 1, 230, 190, 210);
      rect(ctx, 4, 12, 8, 1, 200, 160, 180);
      // Spiral ridges in rainbow colors
      px(ctx, 7, 5, 255, 120, 120);
      px(ctx, 9, 6, 255, 200, 80);
      px(ctx, 10, 8, 100, 210, 100);
      px(ctx, 9, 10, 80, 160, 255);
      px(ctx, 7, 11, 180, 100, 255);
      px(ctx, 5, 10, 255, 140, 200);
      px(ctx, 5, 7, 255, 255, 255);
      rect(ctx, 6, 6, 1, 3, 200, 160, 185);
    },

    // === CORALS ===
    fire_coral: () => {
      rect(ctx, 7, 8, 2, 5, 230, 80, 30);
      rect(ctx, 4, 5, 3, 3, 240, 90, 35);
      rect(ctx, 9, 4, 3, 4, 240, 90, 35);
      rect(ctx, 6, 6, 2, 3, 235, 85, 32);
      rect(ctx, 9, 6, 2, 3, 235, 85, 32);
      px(ctx, 4, 4, 255, 140, 60);
      px(ctx, 11, 3, 255, 140, 60);
      px(ctx, 6, 5, 255, 140, 60);
      px(ctx, 10, 5, 255, 140, 60);
      px(ctx, 7, 10, 200, 60, 20);
    },
    brain_coral: () => {
      rect(ctx, 3, 4, 10, 9, 180, 100, 160);
      rect(ctx, 4, 3, 8, 1, 190, 110, 170);
      rect(ctx, 4, 13, 8, 1, 160, 80, 140);
      // Bumpy texture
      px(ctx, 5, 5, 200, 120, 180);
      px(ctx, 8, 5, 200, 120, 180);
      px(ctx, 11, 5, 200, 120, 180);
      px(ctx, 6, 7, 200, 120, 180);
      px(ctx, 9, 7, 200, 120, 180);
      px(ctx, 5, 9, 200, 120, 180);
      px(ctx, 8, 9, 200, 120, 180);
      px(ctx, 11, 9, 200, 120, 180);
      px(ctx, 6, 11, 200, 120, 180);
      px(ctx, 9, 11, 200, 120, 180);
      px(ctx, 7, 6, 150, 70, 130);
      px(ctx, 10, 8, 150, 70, 130);
    },
    fan_coral: () => {
      // Fan shape
      rect(ctx, 3, 3, 10, 8, 220, 130, 175);
      rect(ctx, 4, 2, 8, 1, 230, 140, 185);
      rect(ctx, 3, 11, 10, 1, 200, 110, 155);
      // Stem
      rect(ctx, 7, 11, 2, 4, 190, 100, 145);
      // Fan ribs
      px(ctx, 5, 4, 240, 160, 200);
      px(ctx, 8, 3, 240, 160, 200);
      px(ctx, 11, 4, 240, 160, 200);
      px(ctx, 5, 7, 240, 160, 200);
      px(ctx, 8, 7, 240, 160, 200);
      px(ctx, 11, 7, 240, 160, 200);
      px(ctx, 5, 10, 190, 110, 155);
      px(ctx, 11, 10, 190, 110, 155);
    },
    glow_coral: () => {
      rect(ctx, 7, 8, 2, 5, 60, 220, 200);
      rect(ctx, 4, 5, 3, 3, 70, 230, 210);
      rect(ctx, 9, 4, 3, 4, 70, 230, 210);
      rect(ctx, 6, 6, 2, 3, 65, 225, 205);
      rect(ctx, 9, 6, 2, 3, 65, 225, 205);
      // Glow tips
      px(ctx, 4, 4, 150, 255, 240);
      px(ctx, 11, 3, 150, 255, 240);
      px(ctx, 6, 5, 150, 255, 240);
      px(ctx, 10, 5, 150, 255, 240);
      // Glow aura pixels
      px(ctx, 3, 6, 40, 180, 160, 120);
      px(ctx, 12, 5, 40, 180, 160, 120);
    },

    // === GEMS ===
    sapphire: () => {
      // Top facets
      rect(ctx, 6, 3, 4, 2, 100, 150, 255);
      rect(ctx, 5, 5, 6, 1, 80, 130, 240);
      // Middle
      rect(ctx, 4, 6, 8, 4, 60, 110, 220);
      // Bottom point
      rect(ctx, 5, 10, 6, 1, 50, 100, 200);
      rect(ctx, 6, 11, 4, 1, 40, 90, 185);
      rect(ctx, 7, 12, 2, 1, 30, 80, 170);
      // Shine
      px(ctx, 6, 4, 180, 210, 255);
      px(ctx, 7, 5, 200, 225, 255);
      px(ctx, 10, 7, 40, 90, 190);
    },
    ruby: () => {
      rect(ctx, 6, 3, 4, 2, 230, 60, 80);
      rect(ctx, 5, 5, 6, 1, 210, 50, 70);
      rect(ctx, 4, 6, 8, 4, 190, 30, 55);
      rect(ctx, 5, 10, 6, 1, 175, 25, 45);
      rect(ctx, 6, 11, 4, 1, 160, 20, 40);
      rect(ctx, 7, 12, 2, 1, 145, 15, 30);
      px(ctx, 6, 4, 255, 140, 150);
      px(ctx, 7, 5, 255, 160, 170);
      px(ctx, 10, 7, 160, 20, 40);
    },
    emerald: () => {
      rect(ctx, 6, 3, 4, 2, 50, 200, 100);
      rect(ctx, 5, 5, 6, 1, 40, 180, 85);
      rect(ctx, 4, 6, 8, 4, 30, 160, 70);
      rect(ctx, 5, 10, 6, 1, 25, 145, 60);
      rect(ctx, 6, 11, 4, 1, 20, 130, 50);
      rect(ctx, 7, 12, 2, 1, 15, 115, 40);
      px(ctx, 6, 4, 130, 240, 160);
      px(ctx, 7, 5, 150, 255, 180);
      px(ctx, 10, 7, 20, 130, 55);
    },

    // === UNDERWATER DROPS ===
    ink_sac: () => {
      rect(ctx, 4, 5, 8, 7, 60, 30, 80);
      rect(ctx, 5, 4, 6, 1, 70, 40, 90);
      rect(ctx, 5, 12, 6, 1, 45, 20, 65);
      // Tie/neck
      rect(ctx, 7, 3, 2, 1, 50, 25, 70);
      px(ctx, 6, 7, 90, 50, 110);
      px(ctx, 9, 9, 40, 15, 60);
      px(ctx, 7, 6, 100, 60, 120);
    },
    jelly_essence: () => {
      // Teardrop shape
      rect(ctx, 6, 3, 4, 2, 80, 230, 220);
      rect(ctx, 5, 5, 6, 4, 70, 220, 210);
      rect(ctx, 6, 9, 4, 2, 60, 210, 200);
      rect(ctx, 7, 11, 2, 2, 50, 200, 190);
      // Inner glow
      px(ctx, 7, 5, 160, 255, 250);
      px(ctx, 8, 6, 150, 250, 245);
      px(ctx, 9, 8, 50, 190, 180);
    },
    glow_orb: () => {
      rect(ctx, 4, 4, 8, 8, 50, 210, 200);
      rect(ctx, 5, 3, 6, 1, 60, 220, 210);
      rect(ctx, 3, 5, 1, 6, 60, 220, 210);
      rect(ctx, 12, 5, 1, 6, 60, 220, 210);
      rect(ctx, 5, 12, 6, 1, 40, 190, 180);
      // Bright core
      rect(ctx, 6, 6, 4, 4, 120, 240, 235);
      px(ctx, 7, 6, 200, 255, 255);
      px(ctx, 8, 7, 200, 255, 255);
      // Outer glow
      px(ctx, 3, 4, 30, 160, 150, 100);
      px(ctx, 12, 4, 30, 160, 150, 100);
    },
    tentacle: () => {
      // Curled tentacle
      rect(ctx, 7, 2, 2, 5, 140, 80, 180);
      rect(ctx, 5, 7, 4, 2, 140, 80, 180);
      rect(ctx, 4, 9, 2, 3, 140, 80, 180);
      rect(ctx, 6, 12, 3, 2, 140, 80, 180);
      // Suckers
      px(ctx, 8, 3, 100, 50, 140);
      px(ctx, 8, 5, 100, 50, 140);
      px(ctx, 7, 7, 100, 50, 140);
      px(ctx, 5, 9, 100, 50, 140);
      px(ctx, 5, 11, 100, 50, 140);
      px(ctx, 7, 13, 100, 50, 140);
    },
    underwater_plant: () => {
      // Kelp/seaweed stalks
      rect(ctx, 6, 3, 2, 11, 40, 160, 90);
      rect(ctx, 9, 5, 2, 8, 50, 170, 100);
      // Leaves
      rect(ctx, 3, 5, 3, 2, 60, 190, 110);
      rect(ctx, 8, 4, 3, 2, 60, 190, 110);
      rect(ctx, 4, 8, 3, 2, 50, 180, 100);
      rect(ctx, 9, 9, 3, 2, 50, 180, 100);
      rect(ctx, 3, 11, 3, 2, 60, 190, 110);
      px(ctx, 7, 4, 80, 210, 130);
      px(ctx, 10, 6, 80, 210, 130);
    },
    ghost_pearl: () => {
      rect(ctx, 5, 4, 6, 8, 220, 225, 235, 200);
      rect(ctx, 4, 6, 8, 4, 225, 230, 240, 200);
      rect(ctx, 6, 3, 4, 1, 235, 240, 250, 190);
      rect(ctx, 6, 12, 4, 1, 210, 215, 225, 200);
      px(ctx, 6, 5, 255, 255, 255, 230);
      px(ctx, 7, 4, 255, 255, 255, 220);
      px(ctx, 10, 8, 195, 205, 220, 180);
      // Ghostly glow
      px(ctx, 4, 5, 200, 210, 230, 100);
      px(ctx, 11, 9, 200, 210, 230, 100);
    },

    // === SHELLS ===
    spiral_snail: () => {
      // Outer shell
      rect(ctx, 4, 5, 8, 7, 160, 120, 80);
      rect(ctx, 5, 4, 6, 1, 170, 130, 90);
      rect(ctx, 5, 12, 6, 1, 140, 100, 60);
      // Spiral rings
      rect(ctx, 5, 6, 6, 1, 130, 90, 55);
      rect(ctx, 5, 8, 6, 1, 130, 90, 55);
      rect(ctx, 5, 10, 6, 1, 130, 90, 55);
      // Opening
      rect(ctx, 9, 7, 2, 4, 80, 50, 30);
      px(ctx, 5, 5, 190, 155, 110);
      px(ctx, 11, 9, 110, 75, 45);
    },
    deep_crown: () => {
      // Crown base band
      rect(ctx, 3, 9, 10, 4, 60, 100, 200);
      rect(ctx, 4, 8, 8, 1, 70, 110, 210);
      rect(ctx, 3, 13, 10, 1, 45, 80, 180);
      // Crown points
      rect(ctx, 4, 5, 2, 4, 70, 110, 210);
      rect(ctx, 7, 4, 2, 5, 70, 110, 210);
      rect(ctx, 10, 5, 2, 4, 70, 110, 210);
      // Gems on crown
      px(ctx, 5, 6, 120, 200, 255);
      px(ctx, 8, 4, 120, 200, 255);
      px(ctx, 11, 6, 120, 200, 255);
      px(ctx, 6, 10, 150, 220, 255);
      px(ctx, 9, 10, 150, 220, 255);
    },

    // === WEAPONS ===
    sword_gem: () => {
      rect(ctx, 7, 2, 2, 8, 180, 100, 220);
      rect(ctx, 6, 1, 4, 1, 200, 120, 240);
      rect(ctx, 5, 10, 6, 2, 110, 75, 40);
      rect(ctx, 7, 12, 2, 2, 90, 60, 35);
      // Gem on blade
      rect(ctx, 7, 4, 2, 2, 140, 60, 200);
      px(ctx, 7, 4, 220, 160, 255);
    },
    sword_gem_plus: () => {
      rect(ctx, 7, 2, 2, 8, 200, 120, 240);
      rect(ctx, 6, 1, 4, 1, 220, 140, 255);
      rect(ctx, 5, 10, 6, 2, 130, 90, 50);
      rect(ctx, 7, 12, 2, 2, 110, 75, 40);
      // Brighter gem + glow
      rect(ctx, 7, 4, 2, 2, 180, 80, 240);
      px(ctx, 7, 4, 255, 200, 255);
      px(ctx, 6, 3, 220, 160, 255, 180);
      px(ctx, 9, 5, 220, 160, 255, 180);
    },
    rainbow_sword: () => {
      // Blade with rainbow colors
      rect(ctx, 7, 2, 2, 8, 200, 200, 220);
      px(ctx, 7, 2, 255, 100, 100);
      px(ctx, 7, 3, 255, 180, 60);
      px(ctx, 7, 4, 80, 200, 80);
      px(ctx, 7, 5, 60, 160, 255);
      px(ctx, 7, 6, 180, 80, 255);
      px(ctx, 7, 7, 255, 80, 200);
      px(ctx, 7, 8, 255, 220, 60);
      px(ctx, 8, 2, 255, 130, 130);
      px(ctx, 8, 3, 255, 200, 80);
      px(ctx, 8, 4, 100, 220, 100);
      px(ctx, 8, 5, 80, 180, 255);
      px(ctx, 8, 6, 200, 100, 255);
      px(ctx, 8, 7, 255, 100, 210);
      px(ctx, 8, 8, 255, 235, 80);
      rect(ctx, 6, 1, 4, 1, 220, 220, 235);
      rect(ctx, 5, 10, 6, 2, 140, 100, 60);
      rect(ctx, 7, 12, 2, 2, 110, 75, 40);
    },

    // === POTIONS ===
    glow_potion: () => {
      rect(ctx, 6, 3, 4, 2, 160, 160, 170);
      rect(ctx, 5, 5, 6, 7, 60, 210, 190);
      rect(ctx, 4, 6, 8, 5, 70, 220, 200);
      px(ctx, 6, 6, 140, 255, 240);
      px(ctx, 5, 11, 40, 180, 165);
      rect(ctx, 6, 2, 4, 1, 180, 180, 190);
      // Glow aura
      px(ctx, 3, 7, 40, 180, 165, 120);
      px(ctx, 12, 8, 40, 180, 165, 120);
      px(ctx, 5, 12, 40, 180, 165, 100);
    },
    star_elixir: () => {
      rect(ctx, 6, 3, 4, 2, 160, 160, 170);
      rect(ctx, 5, 5, 6, 7, 220, 180, 40);
      rect(ctx, 4, 6, 8, 5, 230, 190, 50);
      px(ctx, 6, 6, 255, 230, 120);
      px(ctx, 5, 11, 190, 150, 20);
      rect(ctx, 6, 2, 4, 1, 180, 180, 190);
      // Star sparkles
      px(ctx, 3, 5, 255, 230, 80, 180);
      px(ctx, 12, 6, 255, 230, 80, 180);
      px(ctx, 4, 11, 255, 230, 80, 140);
    },

    // === FOOD ===
    sea_soup: () => {
      // Bowl
      rect(ctx, 3, 8, 10, 5, 120, 90, 60);
      rect(ctx, 4, 7, 8, 1, 140, 105, 70);
      rect(ctx, 3, 13, 10, 1, 95, 70, 45);
      // Soup surface (blue-teal)
      rect(ctx, 4, 8, 8, 4, 60, 160, 180);
      px(ctx, 5, 9, 80, 185, 200);
      px(ctx, 9, 10, 50, 145, 165);
      // Ingredients
      px(ctx, 6, 8, 200, 220, 100);
      px(ctx, 8, 9, 220, 180, 80);
      px(ctx, 10, 8, 200, 220, 100);
      // Handle
      rect(ctx, 2, 9, 1, 3, 100, 75, 50);
      rect(ctx, 13, 9, 1, 3, 100, 75, 50);
    },
    cloud_cake: () => {
      // Plate
      rect(ctx, 3, 12, 10, 2, 200, 195, 190);
      // Cake layers
      rect(ctx, 4, 9, 8, 3, 245, 240, 235);
      rect(ctx, 3, 8, 10, 1, 250, 245, 240);
      // Cloud frosting (fluffy top)
      rect(ctx, 4, 5, 8, 4, 255, 255, 255);
      rect(ctx, 3, 6, 10, 2, 250, 250, 255);
      px(ctx, 5, 4, 245, 245, 255);
      px(ctx, 8, 4, 245, 245, 255);
      px(ctx, 11, 5, 245, 245, 255);
      // Decoration
      px(ctx, 6, 6, 255, 200, 220);
      px(ctx, 9, 5, 200, 220, 255);
      px(ctx, 11, 7, 220, 255, 220);
    },

    // === EQUIPMENT ===
    diving_helm: () => {
      // Helmet body
      rect(ctx, 3, 4, 10, 9, 180, 150, 80);
      rect(ctx, 4, 3, 8, 1, 190, 160, 90);
      rect(ctx, 4, 13, 8, 1, 160, 130, 65);
      // Visor window (dark round)
      rect(ctx, 5, 6, 6, 5, 50, 80, 110);
      rect(ctx, 6, 5, 4, 1, 50, 80, 110);
      rect(ctx, 6, 11, 4, 1, 40, 65, 90);
      // Window shine
      px(ctx, 6, 7, 100, 160, 200);
      px(ctx, 7, 6, 120, 180, 220);
      // Bolts
      px(ctx, 4, 5, 140, 115, 60);
      px(ctx, 11, 5, 140, 115, 60);
    },
    golden_rod: () => {
      // Rod shaft (diagonal)
      px(ctx, 12, 2, 220, 185, 60);
      px(ctx, 11, 3, 220, 185, 60);
      px(ctx, 10, 4, 220, 185, 60);
      px(ctx, 9, 5, 220, 185, 60);
      px(ctx, 8, 6, 220, 185, 60);
      px(ctx, 7, 7, 210, 175, 50);
      px(ctx, 6, 8, 210, 175, 50);
      px(ctx, 5, 9, 210, 175, 50);
      px(ctx, 4, 10, 210, 175, 50);
      px(ctx, 3, 11, 200, 165, 45);
      px(ctx, 3, 12, 200, 165, 45);
      // Tip & line
      px(ctx, 12, 3, 240, 210, 100);
      px(ctx, 12, 4, 180, 180, 200);
      px(ctx, 12, 5, 180, 180, 200);
      px(ctx, 11, 6, 180, 180, 200);
      // Handle
      rect(ctx, 2, 11, 3, 3, 120, 80, 40);
    },
    butterfly_net: () => {
      // Handle
      rect(ctx, 11, 8, 2, 7, 150, 110, 60);
      // Net frame (circle)
      rect(ctx, 4, 3, 8, 1, 160, 160, 170);
      rect(ctx, 3, 4, 1, 6, 160, 160, 170);
      rect(ctx, 11, 4, 1, 6, 160, 160, 170);
      rect(ctx, 4, 10, 7, 1, 160, 160, 170);
      rect(ctx, 10, 9, 2, 2, 160, 160, 170);
      // Net mesh
      px(ctx, 5, 5, 200, 220, 240, 180);
      px(ctx, 7, 5, 200, 220, 240, 180);
      px(ctx, 9, 5, 200, 220, 240, 180);
      px(ctx, 5, 7, 200, 220, 240, 180);
      px(ctx, 7, 7, 200, 220, 240, 180);
      px(ctx, 9, 7, 200, 220, 240, 180);
      px(ctx, 5, 9, 200, 220, 240, 180);
      px(ctx, 7, 9, 200, 220, 240, 180);
    },
    gem_ring: () => {
      // Ring band
      rect(ctx, 5, 8, 6, 5, 210, 175, 60);
      rect(ctx, 4, 9, 1, 3, 210, 175, 60);
      rect(ctx, 11, 9, 1, 3, 210, 175, 60);
      rect(ctx, 5, 13, 6, 1, 185, 150, 45);
      // Setting
      rect(ctx, 6, 5, 4, 4, 200, 165, 50);
      // Gemstone (blue)
      rect(ctx, 7, 5, 2, 3, 80, 140, 220);
      px(ctx, 7, 5, 160, 200, 255);
      px(ctx, 8, 6, 50, 110, 200);
    },
    treasure_map: () => {
      // Parchment
      rect(ctx, 2, 3, 12, 10, 210, 185, 130);
      rect(ctx, 3, 2, 10, 1, 220, 195, 140);
      rect(ctx, 2, 13, 12, 1, 190, 165, 110);
      // Map lines/paths
      rect(ctx, 4, 6, 4, 1, 160, 130, 80);
      rect(ctx, 7, 5, 1, 4, 160, 130, 80);
      rect(ctx, 7, 8, 4, 1, 160, 130, 80);
      // X marks the spot
      px(ctx, 4, 8, 180, 50, 50);
      px(ctx, 5, 9, 180, 50, 50);
      px(ctx, 5, 8, 180, 50, 50);
      px(ctx, 4, 9, 180, 50, 50);
      // Borders
      rect(ctx, 2, 3, 1, 10, 170, 145, 90);
      rect(ctx, 13, 3, 1, 10, 170, 145, 90);
    },
    collectors_badge: () => {
      // Badge circle
      rect(ctx, 4, 4, 8, 8, 190, 185, 195);
      rect(ctx, 5, 3, 6, 1, 200, 195, 205);
      rect(ctx, 5, 12, 6, 1, 170, 165, 175);
      rect(ctx, 3, 5, 1, 6, 200, 195, 205);
      rect(ctx, 12, 5, 1, 6, 200, 195, 205);
      // Star on badge
      px(ctx, 8, 5, 240, 200, 60);
      px(ctx, 7, 7, 240, 200, 60);
      px(ctx, 8, 7, 255, 220, 80);
      px(ctx, 9, 7, 240, 200, 60);
      px(ctx, 8, 9, 240, 200, 60);
      px(ctx, 6, 6, 230, 190, 50);
      px(ctx, 10, 6, 230, 190, 50);
      px(ctx, 6, 8, 230, 190, 50);
      px(ctx, 10, 8, 230, 190, 50);
      // Ribbon
      rect(ctx, 7, 12, 2, 3, 200, 60, 60);
      px(ctx, 6, 14, 220, 80, 80);
      px(ctx, 9, 14, 220, 80, 80);
    },
    beach_crown: () => {
      // Crown base
      rect(ctx, 3, 9, 10, 4, 220, 185, 50);
      rect(ctx, 4, 8, 8, 1, 230, 195, 60);
      rect(ctx, 3, 13, 10, 1, 195, 160, 35);
      // Points
      rect(ctx, 4, 5, 2, 4, 225, 190, 55);
      rect(ctx, 7, 4, 2, 5, 225, 190, 55);
      rect(ctx, 10, 5, 2, 4, 225, 190, 55);
      // Shell/gem decorations
      px(ctx, 5, 6, 255, 200, 180);
      px(ctx, 8, 4, 200, 230, 255);
      px(ctx, 11, 6, 255, 200, 180);
      px(ctx, 6, 10, 255, 220, 100);
      px(ctx, 9, 10, 255, 220, 100);
    },
    cloud_boots: () => {
      // Left boot
      rect(ctx, 2, 8, 5, 5, 210, 215, 230);
      rect(ctx, 2, 13, 6, 1, 190, 195, 210);
      rect(ctx, 2, 7, 4, 1, 220, 225, 240);
      // Right boot
      rect(ctx, 9, 8, 5, 5, 210, 215, 230);
      rect(ctx, 8, 13, 6, 1, 190, 195, 210);
      rect(ctx, 10, 7, 4, 1, 220, 225, 240);
      // Cloud puff tops
      px(ctx, 2, 6, 240, 245, 255);
      px(ctx, 4, 5, 240, 245, 255);
      px(ctx, 9, 6, 240, 245, 255);
      px(ctx, 11, 5, 240, 245, 255);
      px(ctx, 3, 6, 245, 250, 255);
      px(ctx, 10, 6, 245, 250, 255);
    },
    star_amulet: () => {
      // Chain
      rect(ctx, 7, 2, 2, 3, 200, 170, 60);
      px(ctx, 5, 2, 200, 170, 60);
      px(ctx, 10, 2, 200, 170, 60);
      px(ctx, 6, 2, 200, 170, 60);
      px(ctx, 9, 2, 200, 170, 60);
      // Star shape
      rect(ctx, 7, 6, 2, 6, 230, 195, 50);
      rect(ctx, 5, 8, 6, 2, 230, 195, 50);
      px(ctx, 6, 7, 225, 190, 45);
      px(ctx, 9, 7, 225, 190, 45);
      px(ctx, 6, 10, 225, 190, 45);
      px(ctx, 9, 10, 225, 190, 45);
      // Shine
      px(ctx, 7, 7, 255, 240, 130);
      px(ctx, 8, 8, 255, 240, 130);
    },

    // === RARE FINDS ===
    old_coin: () => {
      // Coin circle
      rect(ctx, 4, 4, 8, 8, 195, 155, 50);
      rect(ctx, 5, 3, 6, 1, 210, 170, 65);
      rect(ctx, 3, 5, 1, 6, 210, 170, 65);
      rect(ctx, 12, 5, 1, 6, 210, 170, 65);
      rect(ctx, 5, 12, 6, 1, 175, 135, 35);
      // Embossed center
      rect(ctx, 6, 6, 4, 4, 215, 175, 70);
      px(ctx, 7, 6, 235, 200, 100);
      px(ctx, 8, 7, 240, 205, 105);
      px(ctx, 6, 9, 170, 135, 40);
      px(ctx, 9, 8, 170, 135, 40);
      // Edge detail
      px(ctx, 5, 4, 225, 185, 80);
      px(ctx, 10, 12, 160, 125, 30);
    },
    fairy_dust: () => {
      // Sparkle cloud
      px(ctx, 7, 4, 255, 180, 230);
      px(ctx, 9, 3, 255, 160, 220);
      px(ctx, 5, 5, 255, 180, 230);
      px(ctx, 11, 5, 240, 150, 215);
      px(ctx, 6, 7, 255, 190, 235);
      px(ctx, 10, 7, 255, 170, 225);
      px(ctx, 8, 6, 255, 200, 240);
      px(ctx, 4, 8, 240, 160, 220);
      px(ctx, 12, 8, 240, 160, 220);
      // Sparkle stars
      px(ctx, 7, 3, 255, 255, 255);
      px(ctx, 10, 2, 255, 255, 255);
      px(ctx, 5, 4, 255, 255, 255);
      px(ctx, 12, 6, 255, 255, 255);
      px(ctx, 3, 7, 255, 240, 255);
      // Pink center cloud
      rect(ctx, 6, 8, 4, 4, 255, 160, 215);
      rect(ctx, 5, 9, 6, 2, 255, 170, 220);
      px(ctx, 8, 9, 255, 210, 245);
    },
    fossil: () => {
      // Stone base
      rect(ctx, 3, 4, 10, 9, 175, 160, 140);
      rect(ctx, 4, 3, 8, 1, 185, 170, 150);
      rect(ctx, 4, 13, 8, 1, 155, 140, 120);
      // Fossil imprint (ammonite spiral)
      rect(ctx, 6, 6, 4, 4, 150, 135, 115);
      rect(ctx, 6, 6, 1, 3, 195, 180, 160);
      rect(ctx, 6, 6, 3, 1, 195, 180, 160);
      rect(ctx, 9, 7, 1, 2, 195, 180, 160);
      rect(ctx, 7, 9, 2, 1, 195, 180, 160);
      px(ctx, 5, 5, 195, 180, 160);
      px(ctx, 10, 10, 140, 125, 105);
      px(ctx, 7, 7, 210, 195, 175);
    },
    message_bottle: () => {
      // Bottle glass
      rect(ctx, 6, 3, 4, 2, 160, 160, 170);
      rect(ctx, 5, 5, 6, 7, 120, 185, 160);
      rect(ctx, 4, 6, 8, 5, 130, 195, 170);
      // Liquid tint
      rect(ctx, 5, 8, 6, 3, 100, 170, 150);
      // Message scroll inside
      rect(ctx, 6, 7, 4, 4, 220, 200, 155);
      rect(ctx, 7, 6, 2, 1, 210, 190, 145);
      // Shine
      px(ctx, 5, 6, 180, 230, 215);
      px(ctx, 6, 5, 190, 235, 220);
      // Cork
      rect(ctx, 6, 2, 4, 1, 180, 140, 80);
      rect(ctx, 7, 1, 2, 1, 190, 150, 90);
    },
    lost_diary: () => {
      // Book cover
      rect(ctx, 3, 3, 10, 11, 140, 85, 45);
      rect(ctx, 4, 2, 8, 1, 150, 95, 55);
      rect(ctx, 3, 14, 10, 1, 115, 65, 30);
      // Spine
      rect(ctx, 3, 3, 1, 11, 110, 60, 25);
      // Pages
      rect(ctx, 5, 4, 7, 9, 235, 225, 200);
      // Lines on pages
      rect(ctx, 6, 6, 5, 1, 180, 170, 150);
      rect(ctx, 6, 8, 5, 1, 180, 170, 150);
      rect(ctx, 6, 10, 5, 1, 180, 170, 150);
      rect(ctx, 6, 12, 4, 1, 180, 170, 150);
      // Lock/clasp
      px(ctx, 12, 8, 200, 170, 60);
      px(ctx, 12, 9, 200, 170, 60);
    },
    golden_feather: () => {
      // Central quill
      px(ctx, 8, 2, 230, 195, 60);
      px(ctx, 8, 3, 235, 200, 65);
      px(ctx, 8, 4, 238, 203, 68);
      px(ctx, 7, 5, 235, 200, 65);
      px(ctx, 7, 6, 232, 197, 62);
      px(ctx, 7, 7, 228, 193, 58);
      px(ctx, 6, 8, 225, 190, 55);
      px(ctx, 6, 9, 220, 185, 50);
      px(ctx, 5, 10, 215, 180, 45);
      // Barbs right
      px(ctx, 9, 4, 245, 215, 90);
      px(ctx, 10, 5, 248, 218, 95);
      px(ctx, 11, 6, 245, 215, 90);
      px(ctx, 10, 7, 240, 208, 82);
      px(ctx, 9, 8, 235, 203, 75);
      px(ctx, 8, 9, 230, 198, 68);
      // Barbs left
      px(ctx, 6, 4, 245, 215, 90);
      px(ctx, 5, 5, 248, 218, 95);
      px(ctx, 6, 6, 245, 215, 90);
      px(ctx, 5, 7, 240, 208, 82);
      px(ctx, 6, 8, 235, 203, 75);
      // Shine
      px(ctx, 8, 3, 255, 245, 160);
      px(ctx, 9, 5, 255, 240, 150);
    },

    // === OTHER ===
    pet_treat: () => {
      // Bone-shaped treat
      rect(ctx, 5, 7, 6, 2, 240, 160, 175);
      rect(ctx, 4, 6, 3, 4, 245, 165, 180);
      rect(ctx, 9, 6, 3, 4, 245, 165, 180);
      px(ctx, 4, 6, 255, 185, 195);
      px(ctx, 6, 6, 255, 185, 195);
      px(ctx, 9, 6, 255, 185, 195);
      px(ctx, 11, 6, 255, 185, 195);
      px(ctx, 4, 9, 220, 140, 155);
      px(ctx, 11, 9, 220, 140, 155);
    },
    leviathan_pearl: () => {
      rect(ctx, 4, 4, 8, 8, 130, 80, 160);
      rect(ctx, 5, 3, 6, 1, 145, 90, 175);
      rect(ctx, 3, 5, 1, 6, 145, 90, 175);
      rect(ctx, 12, 5, 1, 6, 145, 90, 175);
      rect(ctx, 5, 12, 6, 1, 110, 65, 140);
      // Iridescent highlights
      px(ctx, 6, 5, 200, 150, 240);
      px(ctx, 7, 4, 210, 160, 250);
      px(ctx, 9, 6, 180, 200, 240);
      px(ctx, 5, 8, 160, 200, 230);
      px(ctx, 10, 9, 200, 150, 240);
      px(ctx, 7, 10, 170, 190, 230);
      // Deep shadow
      px(ctx, 10, 10, 90, 50, 120);
      px(ctx, 11, 8, 95, 55, 125);
    },

    // === CLOUD CASTLE ===
    cloud_crystal: () => {
      // Crystal shape
      rect(ctx, 6, 3, 4, 10, 200, 220, 240);
      rect(ctx, 5, 5, 6, 6, 215, 232, 248);
      rect(ctx, 7, 2, 2, 2, 230, 245, 255);
      // Cloud-like edges
      px(ctx, 4, 6, 220, 236, 250);
      px(ctx, 11, 7, 220, 236, 250);
      px(ctx, 4, 8, 220, 236, 250);
      px(ctx, 11, 9, 220, 236, 250);
      // Inner glow
      px(ctx, 7, 5, 255, 255, 255);
      px(ctx, 8, 6, 250, 252, 255);
      px(ctx, 7, 8, 200, 218, 240);
      px(ctx, 9, 10, 185, 205, 230);
    },
    rainbow_shard: () => {
      // Prism shape
      rect(ctx, 7, 2, 2, 11, 220, 180, 220);
      rect(ctx, 6, 4, 4, 7, 210, 170, 215);
      rect(ctx, 5, 6, 6, 4, 200, 160, 210);
      // Rainbow face colors
      px(ctx, 6, 4, 255, 120, 120);
      px(ctx, 7, 3, 255, 180, 80);
      px(ctx, 8, 3, 100, 210, 100);
      px(ctx, 9, 4, 80, 170, 255);
      px(ctx, 6, 6, 200, 100, 255);
      px(ctx, 9, 6, 255, 120, 200);
      px(ctx, 6, 8, 255, 200, 80);
      px(ctx, 9, 8, 80, 220, 220);
      // Shine
      px(ctx, 7, 5, 255, 255, 255);
    },
    star_fragment: () => {
      // Star body
      rect(ctx, 7, 3, 2, 10, 250, 220, 60);
      rect(ctx, 4, 6, 8, 4, 250, 220, 60);
      px(ctx, 5, 5, 248, 215, 55);
      px(ctx, 10, 5, 248, 215, 55);
      px(ctx, 5, 10, 248, 215, 55);
      px(ctx, 10, 10, 248, 215, 55);
      // Bright center
      rect(ctx, 7, 6, 2, 4, 255, 245, 130);
      px(ctx, 8, 7, 255, 255, 200);
      // Glow aura
      px(ctx, 6, 3, 255, 240, 120, 150);
      px(ctx, 9, 3, 255, 240, 120, 150);
      px(ctx, 3, 7, 255, 240, 120, 150);
      px(ctx, 12, 7, 255, 240, 120, 150);
      px(ctx, 6, 12, 255, 240, 120, 150);
      px(ctx, 9, 12, 255, 240, 120, 150);
    },
    shadow_essence: () => {
      // Wispy dark orb
      rect(ctx, 5, 5, 6, 6, 70, 40, 100);
      rect(ctx, 4, 6, 8, 4, 75, 45, 105);
      rect(ctx, 6, 4, 4, 1, 80, 50, 110);
      rect(ctx, 6, 11, 4, 1, 65, 35, 95);
      // Wisps
      px(ctx, 6, 3, 90, 55, 120, 180);
      px(ctx, 9, 3, 85, 50, 115, 160);
      px(ctx, 3, 6, 90, 55, 120, 150);
      px(ctx, 12, 7, 90, 55, 120, 150);
      px(ctx, 5, 12, 85, 50, 115, 140);
      px(ctx, 10, 12, 85, 50, 115, 140);
      // Purple core glow
      rect(ctx, 6, 6, 4, 4, 110, 65, 150);
      px(ctx, 7, 7, 150, 100, 195);
      px(ctx, 8, 8, 140, 90, 185);
      // Dark edges
      px(ctx, 4, 5, 50, 25, 75);
      px(ctx, 11, 10, 50, 25, 75);
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
