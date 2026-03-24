/**
 * Item definitions for the game.
 * Each item has an id, name, icon description, max stack size, and category.
 */
export const ITEMS = {
  // ── Resources ──
  wood:       { id: 'wood',       name: 'Holz',         category: 'resource', stackSize: 99, color: '#8B5E3C' },
  stone:      { id: 'stone',      name: 'Stein',        category: 'resource', stackSize: 99, color: '#888888' },
  iron_ore:   { id: 'iron_ore',   name: 'Eisenerz',     category: 'resource', stackSize: 99, color: '#AA6633' },
  earth:      { id: 'earth',      name: 'Erde',         category: 'resource', stackSize: 99, color: '#6B4226' },
  mushroom:   { id: 'mushroom',   name: 'Pilz',         category: 'resource', stackSize: 99, color: '#CC8844' },
  crystal:    { id: 'crystal',    name: 'Kristall',     category: 'resource', stackSize: 99, color: '#88CCFF' },
  bone:       { id: 'bone',       name: 'Knochen',      category: 'resource', stackSize: 99, color: '#DDCCAA' },
  shell:      { id: 'shell',      name: 'Muschel',      category: 'resource', stackSize: 99, color: '#FFCCDD' },

  // ── Food (raw) ──
  fish:       { id: 'fish',       name: 'Fisch',        category: 'food',     stackSize: 20, color: '#4488CC' },
  meat:       { id: 'meat',       name: 'Fleisch',      category: 'food',     stackSize: 20, color: '#CC4444' },
  vegetable:  { id: 'vegetable',  name: 'Gemuese',      category: 'food',     stackSize: 20, color: '#44AA44' },
  berry:      { id: 'berry',      name: 'Beere',        category: 'food',     stackSize: 20, color: '#AA44AA' },

  // ── Seeds ──
  seed_carrot:   { id: 'seed_carrot',   name: 'Karottensamen',   category: 'seed', stackSize: 50, color: '#FF8800' },
  seed_tomato:   { id: 'seed_tomato',   name: 'Tomatensamen',    category: 'seed', stackSize: 50, color: '#FF3333' },
  seed_pumpkin:  { id: 'seed_pumpkin',  name: 'Kuerbissamen',    category: 'seed', stackSize: 50, color: '#FFAA00' },
  seed_crystal:  { id: 'seed_crystal',  name: 'Kristallsamen',   category: 'seed', stackSize: 10, color: '#AADDFF' },

  // ── Magical ──
  unicorn_tear:   { id: 'unicorn_tear',   name: 'Einhorntraene',    category: 'magical', stackSize: 5,  color: '#EEDDFF' },
  rainbow_flower: { id: 'rainbow_flower', name: 'Regenbogenblume',  category: 'magical', stackSize: 10, color: '#FF88FF' },
  magic_herb:     { id: 'magic_herb',     name: 'Magisches Kraut',  category: 'magical', stackSize: 20, color: '#44FFAA' },
  bloom_petal:    { id: 'bloom_petal',    name: 'Bluetenblatt',     category: 'magical', stackSize: 30, color: '#FFAACC' },

  // ── Weapons ──
  sword_wood:  { id: 'sword_wood',  name: 'Holzschwert',    category: 'weapon', stackSize: 1, color: '#AA8844', damage: 15 },
  sword_stone: { id: 'sword_stone', name: 'Steinschwert',   category: 'weapon', stackSize: 1, color: '#888888', damage: 25 },
  sword_bone:  { id: 'sword_bone',  name: 'Knochenkeule',   category: 'weapon', stackSize: 1, color: '#CCBBAA', damage: 20 },

  // ── Cooked food (heals HP) ──
  cooked_fish:  { id: 'cooked_fish',  name: 'Gebratener Fisch', category: 'food_cooked', stackSize: 10, color: '#DDAA44', healAmount: 30 },
  cooked_meat:  { id: 'cooked_meat',  name: 'Bratfleisch',      category: 'food_cooked', stackSize: 10, color: '#DD6644', healAmount: 40 },
  veggie_soup:  { id: 'veggie_soup',  name: 'Gemuesesuppe',     category: 'food_cooked', stackSize: 10, color: '#77BB44', healAmount: 50 },
  heal_potion:  { id: 'heal_potion',  name: 'Heiltrank',        category: 'potion',      stackSize: 5,  color: '#FF4488', healAmount: 100 },
};

export function getItem(id) {
  return ITEMS[id] || null;
}
