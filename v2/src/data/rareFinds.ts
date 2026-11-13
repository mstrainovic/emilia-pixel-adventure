import type { MapId } from './maps';
import type { RareFindPlacement } from './types';

/**
 * Versteckte seltene Funde je Karte. Aufgesammelt wie normale Rohstoffe.
 * `condition` regelt die Sichtbarkeit (Tageszeit, nach einem Boss ...).
 */
export const RARE_FIND_PLACEMENTS: Partial<Record<MapId, RareFindPlacement[]>> = {
  hub: [
    {
      itemId: 'old_coin',
      x: 35, y: 5,       // hinter Omas Haus, obere rechte Ecke
      condition: null,
      respawn: false,
    },
  ],
  unicorn_meadow: [
    {
      itemId: 'fairy_dust',
      x: 12, y: 8,
      condition: 'night',  // nur nachts sichtbar
      respawn: false,
    },
  ],
  dungeon: [
    {
      itemId: 'fossil',
      x: 30, y: 25,       // Sackgasse hinter dem Erzvorkommen
      condition: null,
      respawn: false,
    },
  ],
  beach: [
    {
      itemId: 'message_bottle',
      x: 8, y: 3,         // Uferlinie
      condition: 'morning', // erscheint nur morgens
      respawn: false,
    },
  ],
  grotto: [
    {
      itemId: 'lost_diary',
      x: 22, y: 30,       // Schatzkammer, hinter einer Truhe
      condition: null,
      respawn: false,
    },
  ],
  cloud_castle: [
    {
      itemId: 'golden_feather',
      x: 40, y: 5,        // Sternenterrasse, nach dem Sieg über den Schatten-Ritter
      condition: 'boss_shadow_knight_defeated',
      respawn: false,
    },
  ],
};
