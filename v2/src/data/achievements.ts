import type { AchievementCategoryDef, AchievementCategoryId, AchievementDef } from './types';

/** Erfolge: 30 in 5 Kategorien. Die Bedingungen prüft später das Erfolgssystem. */
export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // ── Erkundung (8) ──
  first_steps_ach: { id: 'first_steps_ach', name: 'Erste Schritte', description: 'Betrete den Wald', category: 'exploration', condition: { type: 'visit_scene', scene: 'forest' } },
  cave_explorer: { id: 'cave_explorer', name: 'Höhlenforscher', description: 'Betrete den Dungeon', category: 'exploration', condition: { type: 'visit_scene', scene: 'dungeon' } },
  beach_walker: { id: 'beach_walker', name: 'Strandläuferin', description: 'Betrete den Strand', category: 'exploration', condition: { type: 'visit_scene', scene: 'beach' } },
  deep_diver: { id: 'deep_diver', name: 'Tieftaucherin', description: 'Betrete die Unterwasser-Grotte', category: 'exploration', condition: { type: 'visit_scene', scene: 'grotto' } },
  sky_climber: { id: 'sky_climber', name: 'Himmelstürmerin', description: 'Betrete das Wolkenschloss', category: 'exploration', condition: { type: 'visit_scene', scene: 'cloud_castle' } },
  cartographer: { id: 'cartographer', name: 'Kartographin', description: 'Besuche alle 8 Areas', category: 'exploration', condition: { type: 'visit_all_scenes', scenes: ['hub', 'forest', 'dungeon', 'lake', 'unicorn_meadow', 'beach', 'grotto', 'cloud_castle'] } },
  secret_finder: { id: 'secret_finder', name: 'Geheimnis-Lüfterin', description: 'Finde 3 geheime Bereiche', category: 'exploration', condition: { type: 'find_secrets', count: 3 } },
  world_explorer: { id: 'world_explorer', name: 'Welt-Entdeckerin', description: 'Laufe 10.000 Tiles Distanz', category: 'exploration', condition: { type: 'walk_distance', tiles: 10000 } },

  // ── Sammlung (8) ──
  first_fish: { id: 'first_fish', name: 'Angel-Anfängerin', description: 'Fange deinen ersten Fisch', category: 'collection', condition: { type: 'catch_fish', count: 1 } },
  shell_collector_ach: { id: 'shell_collector_ach', name: 'Muschel-Sammlerin', description: 'Finde 5 verschiedene Muscheln', category: 'collection', condition: { type: 'collect_shells', count: 5 } },
  entomologist: { id: 'entomologist', name: 'Entomologin', description: 'Fange 3 verschiedene Insekten', category: 'collection', condition: { type: 'catch_insects', count: 3 } },
  crystal_hunter: { id: 'crystal_hunter', name: 'Kristall-Jägerin', description: 'Finde alle 6 Kristall/Edelstein-Typen', category: 'collection', condition: { type: 'collect_gems', count: 6 } },
  full_collector: { id: 'full_collector', name: 'Komplett-Sammlerin', description: 'Füge 25 Einträge ins Entdecker-Buch', category: 'collection', condition: { type: 'book_entries', count: 25 } },
  master_collector: { id: 'master_collector', name: 'Meister-Sammlerin', description: 'Entdecker-Buch 100% komplett', category: 'collection', condition: { type: 'book_complete' } },
  herb_witch: { id: 'herb_witch', name: 'Kräuter-Hexe', description: 'Sammle 50 Pflanzen/Kräuter insgesamt', category: 'collection', condition: { type: 'collect_plants', count: 50 } },
  treasure_seeker: { id: 'treasure_seeker', name: 'Schatzsucherin', description: 'Finde 5 versteckte Truhen', category: 'collection', condition: { type: 'find_chests', count: 5 } },

  // ── Kampf (6) ──
  first_kill: { id: 'first_kill', name: 'Erste Beute', description: 'Besiege deinen ersten Gegner', category: 'combat', condition: { type: 'kill_first' } },
  slime_hunter_ach: { id: 'slime_hunter_ach', name: 'Slime-Jägerin', description: 'Besiege 25 Slimes', category: 'combat', condition: { type: 'kill_type', target: 'slime', count: 25 } },
  skeleton_slayer_ach: { id: 'skeleton_slayer_ach', name: 'Skelett-Bezwingerin', description: 'Besiege 25 Skelette', category: 'combat', condition: { type: 'kill_type', target: 'skeleton', count: 25 } },
  crab_catcher: { id: 'crab_catcher', name: 'Krabbenfängerin', description: 'Besiege 15 Krabben', category: 'combat', condition: { type: 'kill_type', target: 'crab', count: 15 } },
  boss_hunter: { id: 'boss_hunter', name: 'Boss-Jägerin', description: 'Besiege alle 3 Bosse', category: 'combat', condition: { type: 'kill_bosses', count: 3 } },
  untouchable: { id: 'untouchable', name: 'Unberührbar', description: 'Besiege einen Boss ohne Schaden', category: 'combat', condition: { type: 'boss_no_damage' } },

  // ── Sozial (4) ──
  village_life: { id: 'village_life', name: 'Dorfleben', description: 'Sprich mit allen 8 NPCs', category: 'social', condition: { type: 'talk_all_npcs' } },
  animal_friend: { id: 'animal_friend', name: 'Tierfreundin', description: 'Streichle alle 3 Einhörner', category: 'social', condition: { type: 'pet_all_unicorns' } },
  best_friend_ach: { id: 'best_friend_ach', name: 'Beste Freundin', description: 'Erreiche max. Haustier-Freundschaft', category: 'social', condition: { type: 'max_pet_friendship' } },
  family_bond: { id: 'family_bond', name: 'Familien-Band', description: 'Schließe alle NPC-Quests ab', category: 'social', condition: { type: 'complete_npc_quests' } },

  // ── Meister (4) ──
  level_15: { id: 'level_15', name: 'Level 15', description: 'Erreiche Level 15', category: 'master', condition: { type: 'reach_level', level: 15 } },
  level_30: { id: 'level_30', name: 'Level 30', description: 'Erreiche Level 30', category: 'master', condition: { type: 'reach_level', level: 30 } },
  quest_queen: { id: 'quest_queen', name: 'Quest-Königin', description: 'Schließe alle 25 Quests ab', category: 'master', condition: { type: 'complete_all_quests' } },
  legendary_heroine: { id: 'legendary_heroine', name: 'Legendäre Heldin', description: 'Erreiche 25 andere Achievements', category: 'master', condition: { type: 'achievement_count', count: 25 } },
};

export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategoryId, AchievementCategoryDef> = {
  exploration: { name: 'Erkundung', icon: 'compass' },
  collection:  { name: 'Sammlung',  icon: 'gem' },
  combat:      { name: 'Kampf',     icon: 'sword' },
  social:      { name: 'Sozial',    icon: 'heart' },
  master:      { name: 'Meister',   icon: 'crown' },
};
