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
  shell_common: { id: 'shell_common', name: 'Muschel',      category: 'resource', stackSize: 99, color: '#FFCCDD' },

  // ── Food (raw) ──
  fish_generic: { id: 'fish_generic', name: 'Fisch',        category: 'food',     stackSize: 20, color: '#4488CC' },
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

  // ── Fish (catchable) ──
  goldfish:      { id: 'goldfish',      name: 'Goldfisch',          category: 'fish', stackSize: 20, color: '#FFD700', value: 5 },
  silverfish:    { id: 'silverfish',    name: 'Silberfisch',        category: 'fish', stackSize: 20, color: '#C0C0C0', value: 8 },
  starfish:      { id: 'starfish',      name: 'Sternfisch',         category: 'fish', stackSize: 20, color: '#FF6B6B', value: 25 },
  rainbow_trout: { id: 'rainbow_trout', name: 'Regenbogenforelle',  category: 'fish', stackSize: 20, color: '#FF69B4', value: 15 },
  pufferfish:    { id: 'pufferfish',    name: 'Kugelfisch',         category: 'fish', stackSize: 20, color: '#90EE90', value: 12 },
  ghostfish:     { id: 'ghostfish',     name: 'Geisterfisch',       category: 'fish', stackSize: 20, color: '#B0C4DE', value: 40 },

  // ── Strand / Beach items ──
  coconut:        { id: 'coconut',        name: 'Kokosnuss',          category: 'resource', stackSize: 99, color: '#8B4513' },
  sand_dollar:    { id: 'sand_dollar',    name: 'Sanddollar',         category: 'resource', stackSize: 99, color: '#F5DEB3' },
  pearl:          { id: 'pearl',          name: 'Perle',              category: 'resource', stackSize: 99, color: '#FDEEF4' },
  starfish_shell: { id: 'starfish_shell', name: 'Seestern-Muschel',   category: 'resource', stackSize: 99, color: '#FF7F50' },
  coral_piece:    { id: 'coral_piece',    name: 'Korallen-Stueck',    category: 'resource', stackSize: 99, color: '#FF6347' },
  driftwood:      { id: 'driftwood',      name: 'Treibholz',          category: 'resource', stackSize: 99, color: '#A0826D' },
  rainbow_shell:  { id: 'rainbow_shell',  name: 'Regenbogen-Muschel', category: 'resource', stackSize: 99, color: '#FF00FF' },

  // ── Cooked food (heals HP) ──
  cooked_fish:  { id: 'cooked_fish',  name: 'Gebratener Fisch', category: 'food_cooked', stackSize: 10, color: '#DDAA44', healAmount: 30 },
  cooked_meat:  { id: 'cooked_meat',  name: 'Bratfleisch',      category: 'food_cooked', stackSize: 10, color: '#DD6644', healAmount: 40 },
  veggie_soup:  { id: 'veggie_soup',  name: 'Gemuesesuppe',     category: 'food_cooked', stackSize: 10, color: '#77BB44', healAmount: 50 },
  heal_potion:  { id: 'heal_potion',  name: 'Heiltrank',        category: 'potion',      stackSize: 5,  color: '#FF4488', healAmount: 100 },

  // ── Corals (M5 Grotto) ──
  fire_coral:    { id: 'fire_coral',    name: 'Feuerkoralle',     category: 'coral',    stackSize: 99, color: '#FF4500' },
  brain_coral:   { id: 'brain_coral',   name: 'Hirnkoralle',      category: 'coral',    stackSize: 99, color: '#DDA0DD' },
  fan_coral:     { id: 'fan_coral',     name: 'Faecherkoralle',   category: 'coral',    stackSize: 99, color: '#FF69B4' },
  glow_coral:    { id: 'glow_coral',    name: 'Leuchtkoralle',    category: 'coral',    stackSize: 99, color: '#00FFFF' },

  // ── Gems (M5 Grotto/Dungeon) ──
  sapphire:      { id: 'sapphire',      name: 'Saphir',           category: 'gem',      stackSize: 99, color: '#0066CC' },
  ruby:          { id: 'ruby',          name: 'Rubin',            category: 'gem',      stackSize: 99, color: '#CC0033' },
  emerald:       { id: 'emerald',       name: 'Smaragd',          category: 'gem',      stackSize: 99, color: '#00CC66' },

  // ── Underwater drops (M5 Grotto) ──
  ink_sac:          { id: 'ink_sac',          name: 'Tintenbeutel',       category: 'resource', stackSize: 99, color: '#2A0A2A' },
  jelly_essence:    { id: 'jelly_essence',    name: 'Quallen-Essenz',     category: 'resource', stackSize: 99, color: '#80FFFF' },
  glow_orb:         { id: 'glow_orb',         name: 'Leuchtkugel',        category: 'resource', stackSize: 99, color: '#AAFFEE' },
  tentacle:         { id: 'tentacle',         name: 'Tentakel',           category: 'resource', stackSize: 99, color: '#8B668B' },
  underwater_plant: { id: 'underwater_plant', name: 'Unterwasserpflanze', category: 'resource', stackSize: 99, color: '#228B22' },
  ghost_pearl:      { id: 'ghost_pearl',      name: 'Geisterperle',       category: 'resource', stackSize: 10, color: '#E0E0FF' },

  // ── Shells M5 (Grotte-exklusiv) ──
  spiral_snail:  { id: 'spiral_snail',  name: 'Spiralschnecke',     category: 'resource', stackSize: 99, color: '#DEB887' },
  deep_crown:    { id: 'deep_crown',    name: 'Tiefseekrone',       category: 'resource', stackSize: 99, color: '#4169E1' },

  // ── Pet ──
  pet_treat:     { id: 'pet_treat',     name: 'Haustier-Leckerli', category: 'food',     stackSize: 20, color: '#FFB6C1' },

  // ── Weapons M5 ──
  sword_gem:     { id: 'sword_gem',     name: 'Edelstein-Schwert', category: 'weapon',   stackSize: 1,  color: '#9966FF', damage: 40 },

  // ── Potions M5 ──
  glow_potion:   { id: 'glow_potion',   name: 'Leuchttrank',       category: 'potion',   stackSize: 5,  color: '#80FFCC' },

  // ── Food M5 ──
  sea_soup:      { id: 'sea_soup',      name: 'Meeres-Suppe',      category: 'food_cooked', stackSize: 10, color: '#4682B4', healAmount: 60 },

  // ── Deko M5 ──
  diving_helm:   { id: 'diving_helm',   name: 'Tauchhelm',         category: 'equipment', stackSize: 1,  color: '#B0C4DE' },

  // ── Rare Finds (Explorer Book) ──
  old_coin:       { id: 'old_coin',       name: 'Alte Muenze',        category: 'rare',     stackSize: 99, color: '#DAA520' },
  fairy_dust:     { id: 'fairy_dust',     name: 'Feenstaub',          category: 'rare',     stackSize: 99, color: '#FFD1DC' },
  fossil:         { id: 'fossil',         name: 'Fossil',             category: 'rare',     stackSize: 99, color: '#8B7D6B' },
  message_bottle: { id: 'message_bottle', name: 'Flaschenpost',       category: 'rare',     stackSize: 99, color: '#87CEEB' },
  lost_diary:     { id: 'lost_diary',     name: 'Verlorenes Tagebuch',category: 'rare',     stackSize: 1,  color: '#8B4513' },
  golden_feather: { id: 'golden_feather', name: 'Goldene Feder',      category: 'rare',     stackSize: 99, color: '#FFD700' },

  // ── Category Completion Rewards ──
  golden_rod:     { id: 'golden_rod',     name: 'Goldene Angel',      category: 'equipment', stackSize: 1, color: '#FFD700' },
  butterfly_net:  { id: 'butterfly_net',  name: 'Schmetterlings-Netz',category: 'equipment', stackSize: 1, color: '#98FB98' },
  gem_ring:       { id: 'gem_ring',       name: 'Edelstein-Ring',     category: 'equipment', stackSize: 1, color: '#9966FF' },
  treasure_map:   { id: 'treasure_map',   name: 'Schatzkarte',        category: 'equipment', stackSize: 1, color: '#DEB887' },
  collectors_badge:{ id: 'collectors_badge',name: 'Sammler-Abzeichen', category: 'equipment', stackSize: 1, color: '#C0C0C0' },
};

export function getItem(id) {
  return ITEMS[id] || null;
}
