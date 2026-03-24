/**
 * Explorer Book — tracks discoveries across 5 categories.
 * Category completion awards special items.
 */

const CATEGORY_REWARDS = {
  shells: 'collectors_badge',
  fish: 'golden_rod',
  insects: 'butterfly_net',
  gems: 'gem_ring',
  rare: 'treasure_map',
};

export const BOOK_CATEGORIES = {
  shells: {
    name: 'Muscheln & Korallen',
    icon: '🐚',
    entries: ['shell_common','sand_dollar','pearl','rainbow_shell','fire_coral','brain_coral','fan_coral','glow_coral'],
  },
  fish: {
    name: 'Fische',
    icon: '🐟',
    entries: ['goldfish','silverfish','starfish','rainbow_trout','pufferfish','ghostfish'],
  },
  insects: {
    name: 'Insekten & Schmetterlinge',
    icon: '🦋',
    entries: ['butterfly','ladybug','firefly','dragonfly','bee','cricket'],
  },
  gems: {
    name: 'Kristalle & Edelsteine',
    icon: '💎',
    entries: ['crystal','sapphire','ruby','emerald','cloud_crystal','ghost_pearl'],
  },
  rare: {
    name: 'Seltene Fundstuecke',
    icon: '⭐',
    entries: ['old_coin','fairy_dust','fossil','message_bottle','lost_diary','golden_feather'],
  },
};

export class ExplorerBook {
  constructor() {
    this.discovered = new Set();
    this.rewardsClaimed = new Set();
  }

  discover(entryId) {
    if (this.discovered.has(entryId)) return false;
    this.discovered.add(entryId);
    return true;
  }

  checkCategoryReward(categoryKey) {
    if (this.rewardsClaimed.has(categoryKey)) return null;
    const prog = this.getCategoryProgress(categoryKey);
    if (prog.found >= prog.total) {
      this.rewardsClaimed.add(categoryKey);
      return CATEGORY_REWARDS[categoryKey] || null;
    }
    return null;
  }

  getCategoryProgress(categoryKey) {
    const cat = BOOK_CATEGORIES[categoryKey];
    if (!cat) return { found: 0, total: 0 };
    const found = cat.entries.filter(e => this.discovered.has(e)).length;
    return { found, total: cat.entries.length };
  }

  getTotalProgress() {
    const all = new Set();
    for (const cat of Object.values(BOOK_CATEGORIES)) {
      cat.entries.forEach(e => all.add(e));
    }
    return { found: [...all].filter(e => this.discovered.has(e)).length, total: all.size };
  }

  getState() {
    return { discovered: [...this.discovered], rewardsClaimed: [...this.rewardsClaimed] };
  }

  loadState(state) {
    if (Array.isArray(state)) {
      this.discovered = new Set(state);
      this.rewardsClaimed = new Set();
    } else {
      this.discovered = new Set(state?.discovered || []);
      this.rewardsClaimed = new Set(state?.rewardsClaimed || []);
    }
  }
}
