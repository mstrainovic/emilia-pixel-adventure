/**
 * Mob type definitions.
 * Cute_Fantasy asset pack enemies:
 *   - Slime: /Cute_Fantasy_Free/Enemies/Slime_Green.png (512x192, 64x64 frames)
 *   - Skeleton: /Cute_Fantasy_Free/Enemies/Skeleton.png (192x320, 32x32 frames)
 *
 * spriteType: 'slime' or 'skeleton' — determines loading logic in Mob.js
 * tint: [r,g,b] color multiply for slime variants (green is base)
 */
export const MOB_TYPES = {
  slime_green: {
    name: 'Schleim',
    spriteType: 'slime',
    tint: null,
    hp: 15,       // 1 hit with wood sword (15 dmg)
    damage: 2,    // gentle for a 6-year-old
    speed: 1.3,
    detectionRange: 3.5,
    drops: [
      { itemId: 'mushroom', chance: 0.6, min: 1, max: 2 },
      { itemId: 'berry', chance: 0.4, min: 1, max: 2 },
    ],
    xp: 10,       // generous XP for fast leveling
  },
  slime_red: {
    name: 'Feuer-Schleim',
    spriteType: 'slime',
    tint: [1.4, 0.5, 0.5],
    hp: 25,       // 2 hits with wood sword
    damage: 3,
    speed: 1.6,
    detectionRange: 4,
    drops: [
      { itemId: 'meat', chance: 0.5, min: 1, max: 1 },
      { itemId: 'crystal', chance: 0.2, min: 1, max: 1 },
    ],
    xp: 18,
  },
  slime_blue: {
    name: 'Eis-Schleim',
    spriteType: 'slime',
    tint: [0.5, 0.7, 1.5],
    hp: 20,        // 2 hits
    damage: 3,
    speed: 1.5,
    detectionRange: 4,
    drops: [
      { itemId: 'berry', chance: 0.6, min: 1, max: 3 },
      { itemId: 'magic_herb', chance: 0.2, min: 1, max: 1 },
    ],
    xp: 14,
  },
  slime_purple: {
    name: 'Gift-Schleim',
    spriteType: 'slime',
    tint: [1.0, 0.4, 1.3],
    hp: 30,        // 2 hits
    damage: 4,
    speed: 1.4,
    detectionRange: 4,
    drops: [
      { itemId: 'mushroom', chance: 0.7, min: 1, max: 3 },
      { itemId: 'magic_herb', chance: 0.3, min: 1, max: 1 },
    ],
    xp: 22,
  },
  skeleton_base: {
    name: 'Skelett',
    spriteType: 'skeleton',
    tint: null,
    hp: 25,        // 2 hits (was 40)
    damage: 4,     // gentler
    speed: 1.6,
    detectionRange: 4,
    drops: [
      { itemId: 'bone', chance: 0.8, min: 1, max: 3 },
      { itemId: 'stone', chance: 0.3, min: 1, max: 1 },
    ],
    xp: 15,
  },
  skeleton_warrior: {
    name: 'Skelett-Krieger',
    spriteType: 'skeleton',
    tint: [0.9, 0.8, 0.7],
    hp: 35,        // 3 hits (was 55)
    damage: 5,     // gentler (was 8)
    speed: 1.5,
    detectionRange: 4,
    drops: [
      { itemId: 'bone', chance: 0.9, min: 2, max: 4 },
      { itemId: 'iron_ore', chance: 0.3, min: 1, max: 2 },
      { itemId: 'sword_bone', chance: 0.1, min: 1, max: 1 },
    ],
    xp: 30,
  },
  skeleton_mage: {
    name: 'Skelett-Magier',
    spriteType: 'skeleton',
    tint: [0.7, 0.8, 1.2],
    hp: 30,        // 2 hits (was 40)
    damage: 4,     // gentler (was 6)
    speed: 1.5,
    detectionRange: 4,
    drops: [
      { itemId: 'bone', chance: 0.6, min: 1, max: 2 },
      { itemId: 'crystal', chance: 0.4, min: 1, max: 2 },
      { itemId: 'magic_herb', chance: 0.15, min: 1, max: 1 },
    ],
    xp: 25,
  },
  crab_beach: {
    name: 'Strand-Krabbe',
    spriteType: 'crab',
    tint: null,
    hp: 20,
    damage: 3,
    speed: 1.8,
    detectionRange: 3.0,
    drops: [
      { itemId: 'shell_common', chance: 0.6, min: 1, max: 1 },
      { itemId: 'sand_dollar', chance: 0.2, min: 1, max: 1 },
    ],
    xp: 12,
  },
  crab_coconut: {
    name: 'Kokosnuss-Krabbe',
    spriteType: 'crab',
    tint: [0.6, 0.4, 0.2],
    hp: 35,
    damage: 5,
    speed: 1.2,
    detectionRange: 5.0,
    drops: [
      { itemId: 'coconut', chance: 0.5, min: 1, max: 1 },
      { itemId: 'shell_common', chance: 0.3, min: 1, max: 1 },
      { itemId: 'pearl', chance: 0.1, min: 1, max: 1 },
    ],
    xp: 20,
  },
};
