import { ITEMS } from '../data/items.js';

/**
 * Freundschafts-System fuer NPCs.
 * Punkte: 0-100. Stufen: Bekannt(0), Freund(20), Guter Freund(50), Beste Freunde(80).
 */

/** Lieblingsgeschenke pro NPC (Spec-konform) */
const FAVORITE_GIFTS = new Map([
  ['mama_tanja', ['fish_generic', 'cooked_meat']],
  ['papa_milos',  ['iron_ore', 'stone']],
  ['marie',       ['rainbow_flower', 'bloom_petal']],
  ['liam',        ['starfish', 'goldfish']],
  ['oma',         ['vegetable', 'seed_carrot']],
  ['opa',         ['wood', 'driftwood']],
  ['baba',        ['mushroom', 'berry']],
  ['deda',        ['crystal', 'magic_herb']],
  ['ferdinand',   ['pearl', 'sapphire']],
]);

/** Kategorie-Zuordnung: welcher NPC mag welche Item-Kategorien */
const NPC_PREFERRED_CATEGORIES = new Map([
  ['mama_tanja', ['food', 'food_cooked']],
  ['papa_milos',  ['resource']],
  ['marie',       ['magical']],
  ['liam',        ['fish']],
  ['oma',         ['seed', 'food']],
  ['opa',         ['resource']],
  ['baba',        ['food', 'resource']],
  ['deda',        ['magical', 'resource']],
  ['ferdinand',   ['gem', 'resource']],
]);

/** Schwellenwerte fuer die 4 Stufen */
const LEVEL_THRESHOLDS = [0, 20, 50, 80];

/** Quest-ID zu NPC-ID Zuordnung */
const QUEST_NPC_MAP = {
  first_steps:      'mama_tanja',
  wood_collector:   'opa',
  nature_healer:    'oma',
  slime_hunter:     'marie',
  lake_visitor:     'liam',
  dungeon_explorer: 'papa_milos',
  master_cook:      'mama_tanja',
  skeleton_slayer:  'papa_milos',
  unicorn_friend:   'marie',
  master_crafter:   'opa',
  meadow_hero:      'papa_milos',
  shell_collector:  'liam',
  master_angler:    'liam',
  crab_problem:     'liam',
  coral_healer:     'oma',
  deep_explorer:    'marie',
  best_friend:      'marie',
  collector_page1:  'deda',
  sunken_treasure:  'ferdinand',
  cloud_jumper:     'deda',
  crystal_puzzle:   'deda',
  shadow_slayer:    'papa_milos',
  star_collector:   'baba',
  emilia_legend:    'baba',
  secret_heroine:   'deda',
};

export class FriendshipSystem {
  constructor() {
    /** @type {Map<string, {points: number, lastTalkDay: number, giftsGiven: number}>} */
    this._data = new Map();
  }

  /**
   * Sicherstellen, dass ein NPC-Eintrag existiert.
   */
  _ensure(npcId) {
    if (!this._data.has(npcId)) {
      this._data.set(npcId, { points: 0, lastTalkDay: -1, giftsGiven: 0 });
    }
    return this._data.get(npcId);
  }

  /**
   * +2 Punkte fuer Gespraech (max 1x pro Spieltag).
   */
  onTalk(npcId, dayNumber) {
    if (!npcId) return;
    const d = this._ensure(npcId);
    if (d.lastTalkDay === dayNumber) return; // schon heute gesprochen
    d.lastTalkDay = dayNumber;
    d.points = Math.min(100, d.points + 2);
  }

  /**
   * Geschenk-Logik.
   * @returns {{ accepted: boolean, points: number, isFavorite: boolean }}
   */
  onGift(npcId, itemId) {
    if (!npcId || !itemId) return { accepted: false, points: 0, isFavorite: false };

    const d = this._ensure(npcId);
    const favorites = FAVORITE_GIFTS.get(npcId) || [];
    const isFavorite = favorites.includes(itemId);

    let gained = 5; // Standard

    if (isFavorite) {
      gained = 15;
    } else {
      // Pruefen ob Item in bevorzugter Kategorie
      const prefCats = NPC_PREFERRED_CATEGORIES.get(npcId) || [];
      const item = ITEMS[itemId];
      if (item && prefCats.includes(item.category)) {
        gained = 8;
      }
    }

    d.points = Math.min(100, d.points + gained);
    d.giftsGiven++;

    return { accepted: true, points: gained, isFavorite };
  }

  /**
   * +10 Punkte wenn Quest abgeschlossen wird.
   */
  onQuestComplete(questId) {
    const npcId = QUEST_NPC_MAP[questId];
    if (!npcId) return;
    const d = this._ensure(npcId);
    d.points = Math.min(100, d.points + 10);
  }

  /**
   * Freundschafts-Level (0-3).
   */
  getLevel(npcId) {
    const pts = this.getPoints(npcId);
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (pts >= LEVEL_THRESHOLDS[i]) return i;
    }
    return 0;
  }

  /**
   * Aktuelle Punkte (0-100).
   */
  getPoints(npcId) {
    const d = this._data.get(npcId);
    return d ? d.points : 0;
  }

  /**
   * Herzen fuer UI (0-3), identisch mit Level.
   */
  getHearts(npcId) {
    return this.getLevel(npcId);
  }

  /**
   * Serialisierung fuer SaveManager.
   */
  getState() {
    const obj = {};
    for (const [npcId, d] of this._data) {
      obj[npcId] = { points: d.points, lastTalkDay: d.lastTalkDay, giftsGiven: d.giftsGiven };
    }
    return obj;
  }

  /**
   * State aus SaveGame laden.
   */
  loadState(data) {
    this._data.clear();
    if (!data || typeof data !== 'object') return;
    for (const [npcId, d] of Object.entries(data)) {
      if (d && typeof d.points === 'number') {
        this._data.set(npcId, {
          points: Math.min(100, Math.max(0, d.points)),
          lastTalkDay: d.lastTalkDay ?? -1,
          giftsGiven: d.giftsGiven ?? 0,
        });
      }
    }
  }
}
