/**
 * Crafting recipes grouped by station.
 * Each recipe: { id, name, ingredients: [{itemId, count}], result: {itemId, count}, station }
 */
export const RECIPES = {
  workbench: [
    { id: 'r_sword_wood', name: 'Holzschwert', ingredients: [{ itemId: 'wood', count: 3 }], result: { itemId: 'sword_wood', count: 1 } },
    { id: 'r_sword_stone', name: 'Steinschwert', ingredients: [{ itemId: 'stone', count: 3 }, { itemId: 'wood', count: 1 }], result: { itemId: 'sword_stone', count: 1 } },
  ],
  anvil: [
    { id: 'r_sword_bone', name: 'Knochenkeule', ingredients: [{ itemId: 'bone', count: 5 }], result: { itemId: 'sword_bone', count: 1 } },
  ],
  cooking: [
    { id: 'r_cooked_fish', name: 'Gebratener Fisch', ingredients: [{ itemId: 'fish', count: 1 }], result: { itemId: 'cooked_fish', count: 1 } },
    { id: 'r_cooked_meat', name: 'Bratfleisch', ingredients: [{ itemId: 'meat', count: 1 }], result: { itemId: 'cooked_meat', count: 1 } },
    { id: 'r_veggie_soup', name: 'Gemuesesuppe', ingredients: [{ itemId: 'vegetable', count: 2 }], result: { itemId: 'veggie_soup', count: 1 } },
  ],
  alchemy: [
    { id: 'r_heal_potion', name: 'Heiltrank', ingredients: [{ itemId: 'mushroom', count: 2 }, { itemId: 'magic_herb', count: 1 }], result: { itemId: 'heal_potion', count: 1 } },
    { id: 'r_unicorn_potion', name: 'Einhorntraene-Trank', ingredients: [{ itemId: 'unicorn_tear', count: 1 }, { itemId: 'crystal', count: 2 }], result: { itemId: 'heal_potion', count: 3 } },
  ],
  sawmill: [
    { id: 'r_planks', name: 'Bretter', ingredients: [{ itemId: 'wood', count: 2 }], result: { itemId: 'wood', count: 4 } },
  ],
};

export function getRecipesForStation(stationId) {
  return RECIPES[stationId] || [];
}
