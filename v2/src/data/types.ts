/** Gemeinsame Typen der Inhaltsdaten. Abgeleitet aus den Formen der alten Module unter src/data. */

export type ItemCategory =
  | 'resource' | 'food' | 'seed' | 'magical' | 'weapon' | 'fish' | 'food_cooked'
  | 'potion' | 'coral' | 'gem' | 'equipment' | 'rare';

export interface ItemDef {
  readonly id: string;
  readonly name: string;
  readonly category: ItemCategory;
  readonly stackSize: number;
  readonly color: string;
  readonly sellValue?: number;
  readonly damage?: number;
  readonly healAmount?: number;
  readonly value?: number;
}

export interface ItemStack {
  readonly itemId: string;
  readonly count: number;
}

/** Eine Zutat ist entweder ein bestimmter Gegenstand oder irgendein Gegenstand einer Kategorie. */
export type Ingredient = ItemStack | { readonly category: ItemCategory; readonly count: number };

export type StationId = 'workbench' | 'anvil' | 'cooking' | 'alchemy' | 'sawmill';

export interface RecipeDef {
  readonly id: string;
  readonly name: string;
  readonly ingredients: readonly Ingredient[];
  readonly result: ItemStack;
}

export type QuestType =
  | 'talk' | 'collect' | 'kill' | 'heal' | 'craft' | 'visit' | 'pet' | 'reach_level'
  | 'collect_unique' | 'fish' | 'visit_zones' | 'pet_choose' | 'discover' | 'boss' | 'achieve';

export interface QuestDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: QuestType;
  /** Gegenstand, Gegnerart, Dorfbewohner, Ort ... oder bei `reach_level` die Stufe. */
  readonly target: string | number;
  readonly count: number;
  readonly xpReward: number;
  readonly itemReward: readonly ItemStack[];
}

export type Direction = 'down' | 'side';
export type FriendshipLevel = 1 | 2 | 3;

export interface NpcDef {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  /** Nur beim Händler Ferdinand gesetzt. */
  readonly type?: 'trader';
  readonly x: number;
  readonly y: number;
  readonly direction: Direction;
  readonly favoriteGifts: readonly string[];
  readonly dialogs: readonly string[];
  readonly friendshipDialogs: Readonly<Record<FriendshipLevel, readonly string[]>>;
}

export type EnemySpriteType = 'slime' | 'skeleton' | 'crab' | 'jellyfish' | 'octopus' | 'ghost_crab';

export interface EnemyDrop {
  readonly itemId: string;
  readonly chance: number;
  readonly min: number;
  readonly max: number;
}

export interface EnemyDef {
  readonly name: string;
  readonly spriteType: EnemySpriteType;
  /** Farbmultiplikation [r, g, b]; `null` für die Grundfarbe. */
  readonly tint: readonly [number, number, number] | null;
  readonly hp: number;
  readonly damage: number;
  readonly speed: number;
  readonly detectionRange: number;
  readonly drops: readonly EnemyDrop[];
  readonly xp: number;
}

export type BossUnlockCondition = 'all_m4_quests' | 'all_m5_quests' | 'cloud_castle_access';

export interface BossPhase {
  readonly name: string;
  readonly hpThreshold: number;
  readonly damage: number;
  readonly rangedDamage?: number;
  readonly aoeDamage?: number;
  readonly dashDamage?: number;
  readonly attackCooldown: number;
  readonly pattern: string;
  readonly speedMultiplier?: number;
  readonly telegraphDuration: number;
  readonly cloneHp?: number;
  readonly cloneCount?: number;
}

export interface BossDef {
  readonly name: string;
  readonly spriteType: 'coconut_king' | 'leviathan' | 'shadow_knight';
  readonly scene: 'beach' | 'grotto' | 'cloud_castle';
  readonly hp: number;
  readonly xp: number;
  readonly speed: number;
  readonly unlockCondition: BossUnlockCondition;
  readonly phases: readonly BossPhase[];
  readonly weakSpot: string | null;
  readonly drops: readonly ItemStack[];
}

export type FishRarity = 'common' | 'medium' | 'rare' | 'very_rare';
export type FishTimeOfDay = 'any' | 'day' | 'night' | 'morning_evening';

export interface FishDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: FishRarity;
  readonly locations: readonly string[];
  readonly timeOfDay: FishTimeOfDay;
  readonly weight: number;
}

export interface FishChance {
  readonly fishId: string;
  readonly weight: number;
}

export interface ShellDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: FishRarity;
  readonly locations: readonly string[];
  readonly nightOnly?: boolean;
}

export interface RareFindPlacement {
  readonly itemId: string;
  readonly x: number;
  readonly y: number;
  /** Sichtbarkeitsbedingung (`night`, `morning`, `boss_shadow_knight_defeated`) oder `null`. */
  readonly condition: string | null;
  readonly respawn: boolean;
}

export type AchievementCategoryId = 'exploration' | 'collection' | 'combat' | 'social' | 'master';

export type AchievementCondition =
  | { readonly type: 'visit_scene'; readonly scene: string }
  | { readonly type: 'visit_all_scenes'; readonly scenes: readonly string[] }
  | { readonly type: 'find_secrets'; readonly count: number }
  | { readonly type: 'walk_distance'; readonly tiles: number }
  | { readonly type: 'catch_fish'; readonly count: number }
  | { readonly type: 'collect_shells'; readonly count: number }
  | { readonly type: 'catch_insects'; readonly count: number }
  | { readonly type: 'collect_gems'; readonly count: number }
  | { readonly type: 'book_entries'; readonly count: number }
  | { readonly type: 'book_complete' }
  | { readonly type: 'collect_plants'; readonly count: number }
  | { readonly type: 'find_chests'; readonly count: number }
  | { readonly type: 'kill_first' }
  | { readonly type: 'kill_type'; readonly target: string; readonly count: number }
  | { readonly type: 'kill_bosses'; readonly count: number }
  | { readonly type: 'boss_no_damage' }
  | { readonly type: 'talk_all_npcs' }
  | { readonly type: 'pet_all_unicorns' }
  | { readonly type: 'max_pet_friendship' }
  | { readonly type: 'complete_npc_quests' }
  | { readonly type: 'reach_level'; readonly level: number }
  | { readonly type: 'complete_all_quests' }
  | { readonly type: 'achievement_count'; readonly count: number };

export interface AchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: AchievementCategoryId;
  readonly condition: AchievementCondition;
}

export interface AchievementCategoryDef {
  readonly name: string;
  readonly icon: string;
}
