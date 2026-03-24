export const FISH_TYPES = {
  goldfish:      { id: 'goldfish',      name: 'Goldfisch',         rarity: 'common',    locations: ['lake', 'beach'],  timeOfDay: 'any',     weight: 40 },
  silverfish:    { id: 'silverfish',    name: 'Silberfisch',       rarity: 'common',    locations: ['lake', 'beach'],  timeOfDay: 'day',     weight: 30 },
  starfish:      { id: 'starfish',      name: 'Sternfisch',        rarity: 'rare',      locations: ['beach'],          timeOfDay: 'night',   weight: 8 },
  rainbow_trout: { id: 'rainbow_trout', name: 'Regenbogenforelle', rarity: 'medium',    locations: ['lake'],           timeOfDay: 'morning_evening', weight: 15 },
  pufferfish:    { id: 'pufferfish',    name: 'Kugelfisch',        rarity: 'medium',    locations: ['beach'],          timeOfDay: 'day',     weight: 15 },
  ghostfish:     { id: 'ghostfish',     name: 'Geisterfisch',      rarity: 'very_rare', locations: ['grotto'],         timeOfDay: 'any',     weight: 3 },
};

export function getAvailableFish(location, timeOfDay) {
  const available = [];
  for (const [id, fish] of Object.entries(FISH_TYPES)) {
    if (!fish.locations.includes(location)) continue;
    if (fish.timeOfDay !== 'any') {
      if (fish.timeOfDay === 'morning_evening' && timeOfDay !== 'morning' && timeOfDay !== 'evening') continue;
      if (fish.timeOfDay !== 'morning_evening' && fish.timeOfDay !== timeOfDay) continue;
    }
    available.push({ fishId: id, weight: fish.weight });
  }
  return available;
}

export function pickRandomFish(availableFish) {
  const totalWeight = availableFish.reduce((sum, f) => sum + f.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const f of availableFish) {
    roll -= f.weight;
    if (roll <= 0) return f.fishId;
  }
  return availableFish[availableFish.length - 1]?.fishId || null;
}
