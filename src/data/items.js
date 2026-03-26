/**
 * Item definitions for the game.
 * Each item has an id, name, icon description, max stack size, and category.
 */
export const ITEMS = {
  // ── Resources ──
  wood:       { id: 'wood',       name: 'Holz',         category: 'resource', stackSize: 99, color: '#8B5E3C', sellValue: 1 },
  stone:      { id: 'stone',      name: 'Stein',        category: 'resource', stackSize: 99, color: '#888888', sellValue: 1 },
  iron_ore:   { id: 'iron_ore',   name: 'Eisenerz',     category: 'resource', stackSize: 99, color: '#AA6633', sellValue: 2 },
  earth:      { id: 'earth',      name: 'Erde',         category: 'resource', stackSize: 99, color: '#6B4226', sellValue: 1 },
  mushroom:   { id: 'mushroom',   name: 'Pilz',         category: 'resource', stackSize: 99, color: '#CC8844', sellValue: 1 },
  crystal:    { id: 'crystal',    name: 'Kristall',     category: 'resource', stackSize: 99, color: '#88CCFF', sellValue: 2 },
  bone:       { id: 'bone',       name: 'Knochen',      category: 'resource', stackSize: 99, color: '#DDCCAA', sellValue: 1 },
  shell_common: { id: 'shell_common', name: 'Muschel',      category: 'resource', stackSize: 99, color: '#FFCCDD', sellValue: 1 },

  // ── Food (raw) ──
  fish_generic: { id: 'fish_generic', name: 'Fisch',        category: 'food',     stackSize: 20, color: '#4488CC', sellValue: 1 },
  meat:       { id: 'meat',       name: 'Fleisch',      category: 'food',     stackSize: 20, color: '#CC4444', sellValue: 1 },
  vegetable:  { id: 'vegetable',  name: 'Gemuese',      category: 'food',     stackSize: 20, color: '#44AA44', sellValue: 1 },
  berry:      { id: 'berry',      name: 'Beere',        category: 'food',     stackSize: 20, color: '#AA44AA', sellValue: 1 },

  // ── Seeds ──
  seed_carrot:   { id: 'seed_carrot',   name: 'Karottensamen',   category: 'seed', stackSize: 50, color: '#FF8800', sellValue: 1 },
  seed_tomato:   { id: 'seed_tomato',   name: 'Tomatensamen',    category: 'seed', stackSize: 50, color: '#FF3333', sellValue: 1 },
  seed_pumpkin:  { id: 'seed_pumpkin',  name: 'Kuerbissamen',    category: 'seed', stackSize: 50, color: '#FFAA00', sellValue: 1 },
  seed_crystal:  { id: 'seed_crystal',  name: 'Kristallsamen',   category: 'seed', stackSize: 10, color: '#AADDFF', sellValue: 2 },

  // ── Magical ──
  unicorn_tear:   { id: 'unicorn_tear',   name: 'Einhorntraene',    category: 'magical', stackSize: 5,  color: '#EEDDFF', sellValue: 5 },
  rainbow_flower: { id: 'rainbow_flower', name: 'Regenbogenblume',  category: 'magical', stackSize: 10, color: '#FF88FF', sellValue: 3 },
  magic_herb:     { id: 'magic_herb',     name: 'Magisches Kraut',  category: 'magical', stackSize: 20, color: '#44FFAA', sellValue: 2 },
  bloom_petal:    { id: 'bloom_petal',    name: 'Bluetenblatt',     category: 'magical', stackSize: 30, color: '#FFAACC', sellValue: 2 },

  // ── Weapons ──
  sword_wood:  { id: 'sword_wood',  name: 'Holzschwert',    category: 'weapon', stackSize: 1, color: '#AA8844', damage: 15 },
  sword_stone: { id: 'sword_stone', name: 'Steinschwert',   category: 'weapon', stackSize: 1, color: '#888888', damage: 25 },
  sword_bone:  { id: 'sword_bone',  name: 'Knochenkeule',   category: 'weapon', stackSize: 1, color: '#CCBBAA', damage: 20 },

  // ── Fish (catchable) ──
  goldfish:      { id: 'goldfish',      name: 'Goldfisch',          category: 'fish', stackSize: 20, color: '#FFD700', value: 5, sellValue: 2 },
  silverfish:    { id: 'silverfish',    name: 'Silberfisch',        category: 'fish', stackSize: 20, color: '#C0C0C0', value: 8, sellValue: 2 },
  starfish:      { id: 'starfish',      name: 'Sternfisch',         category: 'fish', stackSize: 20, color: '#FF6B6B', value: 25, sellValue: 4 },
  rainbow_trout: { id: 'rainbow_trout', name: 'Regenbogenforelle',  category: 'fish', stackSize: 20, color: '#FF69B4', value: 15, sellValue: 3 },
  pufferfish:    { id: 'pufferfish',    name: 'Kugelfisch',         category: 'fish', stackSize: 20, color: '#90EE90', value: 12, sellValue: 3 },
  ghostfish:     { id: 'ghostfish',     name: 'Geisterfisch',       category: 'fish', stackSize: 20, color: '#B0C4DE', value: 40, sellValue: 5 },

  // ── Strand / Beach items ──
  coconut:        { id: 'coconut',        name: 'Kokosnuss',          category: 'resource', stackSize: 99, color: '#8B4513', sellValue: 1 },
  sand_dollar:    { id: 'sand_dollar',    name: 'Sanddollar',         category: 'resource', stackSize: 99, color: '#F5DEB3', sellValue: 1 },
  pearl:          { id: 'pearl',          name: 'Perle',              category: 'resource', stackSize: 99, color: '#FDEEF4', sellValue: 3 },
  starfish_shell: { id: 'starfish_shell', name: 'Seestern-Muschel',   category: 'resource', stackSize: 99, color: '#FF7F50', sellValue: 1 },
  coral_piece:    { id: 'coral_piece',    name: 'Korallen-Stueck',    category: 'resource', stackSize: 99, color: '#FF6347', sellValue: 1 },
  driftwood:      { id: 'driftwood',      name: 'Treibholz',          category: 'resource', stackSize: 99, color: '#A0826D', sellValue: 1 },
  rainbow_shell:  { id: 'rainbow_shell',  name: 'Regenbogen-Muschel', category: 'resource', stackSize: 99, color: '#FF00FF', sellValue: 4 },

  // ── Cooked food (heals HP) ──
  cooked_fish:  { id: 'cooked_fish',  name: 'Gebratener Fisch', category: 'food_cooked', stackSize: 10, color: '#DDAA44', healAmount: 30, sellValue: 3 },
  cooked_meat:  { id: 'cooked_meat',  name: 'Bratfleisch',      category: 'food_cooked', stackSize: 10, color: '#DD6644', healAmount: 40, sellValue: 3 },
  veggie_soup:  { id: 'veggie_soup',  name: 'Gemuesesuppe',     category: 'food_cooked', stackSize: 10, color: '#77BB44', healAmount: 50, sellValue: 4 },
  heal_potion:  { id: 'heal_potion',  name: 'Heiltrank',        category: 'potion',      stackSize: 5,  color: '#FF4488', healAmount: 100, sellValue: 5 },

  // ── Corals (M5 Grotto) ──
  fire_coral:    { id: 'fire_coral',    name: 'Feuerkoralle',     category: 'coral',    stackSize: 99, color: '#FF4500', sellValue: 2 },
  brain_coral:   { id: 'brain_coral',   name: 'Hirnkoralle',      category: 'coral',    stackSize: 99, color: '#DDA0DD', sellValue: 2 },
  fan_coral:     { id: 'fan_coral',     name: 'Faecherkoralle',   category: 'coral',    stackSize: 99, color: '#FF69B4', sellValue: 2 },
  glow_coral:    { id: 'glow_coral',    name: 'Leuchtkoralle',    category: 'coral',    stackSize: 99, color: '#00FFFF', sellValue: 3 },

  // ── Gems (M5 Grotto/Dungeon) ──
  sapphire:      { id: 'sapphire',      name: 'Saphir',           category: 'gem',      stackSize: 99, color: '#0066CC', sellValue: 4 },
  ruby:          { id: 'ruby',          name: 'Rubin',            category: 'gem',      stackSize: 99, color: '#CC0033', sellValue: 4 },
  emerald:       { id: 'emerald',       name: 'Smaragd',          category: 'gem',      stackSize: 99, color: '#00CC66', sellValue: 4 },

  // ── Underwater drops (M5 Grotto) ──
  ink_sac:          { id: 'ink_sac',          name: 'Tintenbeutel',       category: 'resource', stackSize: 99, color: '#2A0A2A', sellValue: 2 },
  jelly_essence:    { id: 'jelly_essence',    name: 'Quallen-Essenz',     category: 'resource', stackSize: 99, color: '#80FFFF', sellValue: 2 },
  glow_orb:         { id: 'glow_orb',         name: 'Leuchtkugel',        category: 'resource', stackSize: 99, color: '#AAFFEE', sellValue: 2 },
  tentacle:         { id: 'tentacle',         name: 'Tentakel',           category: 'resource', stackSize: 99, color: '#8B668B', sellValue: 2 },
  underwater_plant: { id: 'underwater_plant', name: 'Unterwasserpflanze', category: 'resource', stackSize: 99, color: '#228B22', sellValue: 1 },
  ghost_pearl:      { id: 'ghost_pearl',      name: 'Geisterperle',       category: 'resource', stackSize: 10, color: '#E0E0FF', sellValue: 4 },

  // ── Shells M5 (Grotte-exklusiv) ──
  spiral_snail:  { id: 'spiral_snail',  name: 'Spiralschnecke',     category: 'resource', stackSize: 99, color: '#DEB887', sellValue: 2 },
  deep_crown:    { id: 'deep_crown',    name: 'Tiefseekrone',       category: 'resource', stackSize: 99, color: '#4169E1', sellValue: 3 },

  // ── Pet ──
  pet_treat:     { id: 'pet_treat',     name: 'Haustier-Leckerli', category: 'food',     stackSize: 20, color: '#FFB6C1', sellValue: 1 },

  // ── Weapons M5 ──
  sword_gem:     { id: 'sword_gem',     name: 'Edelstein-Schwert', category: 'weapon',   stackSize: 1,  color: '#9966FF', damage: 40 },

  // ── Potions M5 ──
  glow_potion:   { id: 'glow_potion',   name: 'Leuchttrank',       category: 'potion',   stackSize: 5,  color: '#80FFCC', sellValue: 4 },

  // ── Food M5 ──
  sea_soup:      { id: 'sea_soup',      name: 'Meeres-Suppe',      category: 'food_cooked', stackSize: 10, color: '#4682B4', healAmount: 60, sellValue: 4 },

  // ── Deko M5 ──
  diving_helm:   { id: 'diving_helm',   name: 'Tauchhelm',         category: 'equipment', stackSize: 1,  color: '#B0C4DE' },

  // ── Rare Finds (Explorer Book) ──
  old_coin:       { id: 'old_coin',       name: 'Alte Muenze',        category: 'rare',     stackSize: 99, color: '#DAA520', sellValue: 3 },
  fairy_dust:     { id: 'fairy_dust',     name: 'Feenstaub',          category: 'rare',     stackSize: 99, color: '#FFD1DC', sellValue: 4 },
  fossil:         { id: 'fossil',         name: 'Fossil',             category: 'rare',     stackSize: 99, color: '#8B7D6B', sellValue: 3 },
  message_bottle: { id: 'message_bottle', name: 'Flaschenpost',       category: 'rare',     stackSize: 99, color: '#87CEEB', sellValue: 3 },
  lost_diary:     { id: 'lost_diary',     name: 'Verlorenes Tagebuch',category: 'rare',     stackSize: 1,  color: '#8B4513', sellValue: 5 },
  golden_feather: { id: 'golden_feather', name: 'Goldene Feder',      category: 'rare',     stackSize: 99, color: '#FFD700', sellValue: 5 },

  // ── Category Completion Rewards ──
  golden_rod:     { id: 'golden_rod',     name: 'Goldene Angel',      category: 'equipment', stackSize: 1, color: '#FFD700' },
  butterfly_net:  { id: 'butterfly_net',  name: 'Schmetterlings-Netz',category: 'equipment', stackSize: 1, color: '#98FB98' },
  gem_ring:       { id: 'gem_ring',       name: 'Edelstein-Ring',     category: 'equipment', stackSize: 1, color: '#9966FF' },
  treasure_map:   { id: 'treasure_map',   name: 'Schatzkarte',        category: 'equipment', stackSize: 1, color: '#DEB887' },
  collectors_badge:{ id: 'collectors_badge',name: 'Sammler-Abzeichen', category: 'equipment', stackSize: 1, color: '#C0C0C0' },

  // ── Boss Rewards (M6) ──
  beach_crown:    { id: 'beach_crown',    name: 'Strandkrone',        category: 'equipment', stackSize: 1,  color: '#FFD700' },
  leviathan_pearl:{ id: 'leviathan_pearl',name: 'Leviathan-Perle',    category: 'resource',  stackSize: 1,  color: '#7B68EE' },
  sword_gem_plus: { id: 'sword_gem_plus', name: 'Edelstein-Schwert+', category: 'weapon',    stackSize: 1,  color: '#AA77FF', damage: 55 },
  rainbow_sword:  { id: 'rainbow_sword',  name: 'Regenbogenschwert',  category: 'weapon',    stackSize: 1,  color: '#FF69B4', damage: 70 },

  // ── Cloud Castle Resources (M6) ──
  cloud_crystal:  { id: 'cloud_crystal',  name: 'Wolkenkristall',     category: 'gem',       stackSize: 99, color: '#E0E8FF', sellValue: 4 },
  rainbow_shard:  { id: 'rainbow_shard',  name: 'Regenbogen-Splitter',category: 'resource',  stackSize: 99, color: '#FF77CC', sellValue: 3 },
  star_fragment:  { id: 'star_fragment',  name: 'Sternen-Fragment',   category: 'resource',  stackSize: 99, color: '#FFFFAA', sellValue: 3 },
  shadow_essence: { id: 'shadow_essence', name: 'Schatten-Essenz',    category: 'resource',  stackSize: 99, color: '#4A0066', sellValue: 3 },

  // ── Cloud Castle Food (M6) ──
  cloud_cake:     { id: 'cloud_cake',     name: 'Wolkenkuchen',       category: 'food_cooked', stackSize: 10, color: '#FFF0F5', healAmount: 80, sellValue: 5 },

  // ── Potions (M6) ──
  star_elixir:    { id: 'star_elixir',    name: 'Sternen-Elixier',    category: 'potion',    stackSize: 5,  color: '#FFFACD', healAmount: 150, sellValue: 5 },

  // ── Equipment (M6) ──
  cloud_boots:    { id: 'cloud_boots',    name: 'Wolkenstiefel',      category: 'equipment', stackSize: 1,  color: '#B0E0E6' },
  star_amulet:    { id: 'star_amulet',    name: 'Sternen-Amulett',    category: 'equipment', stackSize: 1,  color: '#FFD700' },
};

export function getItem(id) {
  return ITEMS[id] || null;
}
