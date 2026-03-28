/**
 * Crafting recipes grouped by station.
 * Each recipe: { id, name, ingredients: [{itemId, count}], result: {itemId, count}, station }
 */
export const RECIPES = {
  workbench: [
    { id: 'r_sword_wood', name: 'Holzschwert', ingredients: [{ itemId: 'wood', count: 3 }], result: { itemId: 'sword_wood', count: 1 } },
    { id: 'r_sword_stone', name: 'Steinschwert', ingredients: [{ itemId: 'stone', count: 3 }, { itemId: 'wood', count: 1 }], result: { itemId: 'sword_stone', count: 1 } },
    { id: 'r_diving_helm', name: 'Tauchhelm', ingredients: [{ itemId: 'crystal', count: 3 }, { itemId: 'iron_ore', count: 2 }], result: { itemId: 'diving_helm', count: 1 } },
  ],
  anvil: [
    { id: 'r_sword_bone', name: 'Knochenkeule', ingredients: [{ itemId: 'bone', count: 5 }], result: { itemId: 'sword_bone', count: 1 } },
    { id: 'r_sword_gem', name: 'Edelstein-Schwert', ingredients: [{ itemId: 'sapphire', count: 2 }, { itemId: 'ruby', count: 2 }, { itemId: 'emerald', count: 1 }], result: { itemId: 'sword_gem', count: 1 } },
  ],
  cooking: [
    { id: 'r_cooked_fish', name: 'Gebratener Fisch', ingredients: [{ itemId: 'fish_generic', count: 1 }], result: { itemId: 'cooked_fish', count: 1 } },
    { id: 'r_cooked_meat', name: 'Bratfleisch', ingredients: [{ itemId: 'meat', count: 1 }], result: { itemId: 'cooked_meat', count: 1 } },
    { id: 'r_veggie_soup', name: 'Gemuesesuppe', ingredients: [{ itemId: 'vegetable', count: 2 }], result: { itemId: 'veggie_soup', count: 1 } },
    { id: 'r_pet_treat', name: 'Haustier-Leckerli', ingredients: [{ itemId: 'berry', count: 2 }, { itemId: 'mushroom', count: 1 }], result: { itemId: 'pet_treat', count: 1 } },
    { id: 'r_sea_soup', name: 'Meeres-Suppe', ingredients: [{ itemId: 'tentacle', count: 1 }, { itemId: 'underwater_plant', count: 1 }, { category: 'fish', count: 1 }], result: { itemId: 'sea_soup', count: 1 } },
    { id: 'r_cloud_cake', name: 'Wolkenkuchen', ingredients: [{ itemId: 'cloud_crystal', count: 2 }, { itemId: 'star_fragment', count: 1 }, { itemId: 'berry', count: 2 }], result: { itemId: 'cloud_cake', count: 1 } },
  ],
  alchemy: [
    { id: 'r_heal_potion', name: 'Heiltrank', ingredients: [{ itemId: 'mushroom', count: 2 }, { itemId: 'magic_herb', count: 1 }], result: { itemId: 'heal_potion', count: 1 } },
    { id: 'r_unicorn_potion', name: 'Einhorntraene-Trank', ingredients: [{ itemId: 'unicorn_tear', count: 1 }, { itemId: 'crystal', count: 2 }], result: { itemId: 'heal_potion', count: 3 } },
    { id: 'r_glow_potion', name: 'Leuchttrank', ingredients: [{ itemId: 'glow_orb', count: 2 }, { itemId: 'jelly_essence', count: 1 }], result: { itemId: 'glow_potion', count: 1 } },
    { id: 'r_star_elixir', name: 'Sternen-Elixier', ingredients: [{ itemId: 'star_fragment', count: 3 }, { itemId: 'rainbow_shard', count: 1 }], result: { itemId: 'star_elixir', count: 1 } },
    { id: 'r_rainbow_sword', name: 'Regenbogenschwert', ingredients: [{ itemId: 'sword_gem_plus', count: 1 }, { itemId: 'rainbow_shard', count: 3 }, { itemId: 'cloud_crystal', count: 5 }], result: { itemId: 'rainbow_sword', count: 1 } },
    { id: 'r_ink_potion', name: 'Tintentrank', ingredients: [{ itemId: 'ink_sac', count: 2 }, { itemId: 'mushroom', count: 1 }], result: { itemId: 'glow_potion', count: 2 } },
    { id: 'r_cloud_boots', name: 'Wolkenstiefel', ingredients: [{ itemId: 'shadow_essence', count: 3 }, { itemId: 'cloud_crystal', count: 3 }, { itemId: 'rainbow_shard', count: 1 }], result: { itemId: 'cloud_boots', count: 1 } },
    { id: 'r_leviathan_elixir', name: 'Leviathan-Elixier', ingredients: [{ itemId: 'leviathan_pearl', count: 1 }, { itemId: 'ghost_pearl', count: 2 }, { itemId: 'jelly_essence', count: 1 }], result: { itemId: 'heal_potion', count: 5 } },
    { id: 'r_bloom_perfume', name: 'Bluetenparfuem', ingredients: [{ itemId: 'bloom_petal', count: 3 }, { itemId: 'rainbow_flower', count: 1 }], result: { itemId: 'heal_potion', count: 2 } },
  ],
  sawmill: [
    { id: 'r_saw_sword_wood', name: 'Holzschwert (schnell)', ingredients: [{ itemId: 'wood', count: 2 }], result: { itemId: 'sword_wood', count: 1 } },
    { id: 'r_saw_pet_treats', name: 'Leckerli-Vorrat', ingredients: [{ itemId: 'wood', count: 3 }, { itemId: 'berry', count: 3 }], result: { itemId: 'pet_treat', count: 3 } },
    { id: 'r_saw_driftwood_charm', name: 'Treibholz-Gluecksbringer', ingredients: [{ itemId: 'driftwood', count: 3 }, { itemId: 'shell_common', count: 2 }], result: { itemId: 'cooked_fish', count: 3 } },
  ],
};

export function getRecipesForStation(stationId) {
  return RECIPES[stationId] || [];
}
