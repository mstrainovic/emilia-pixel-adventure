// Auswahlliste aus „Ninja Adventure" (CC0): nur was hier steht, kommt ins Repo.
// Quellpfade sind relativ zum Pack-Ordner (NINJA_PACK_DIR), Koordinaten in Pixeln des Quellbilds.

/** Bodenkacheln, je 16×16: { id, source, x, y, use } — Reihenfolge = Index in tiles/dorf.png. */
export const TILES = [
  // Die kachelbare Mitte des jeweiligen 48×48-Blocks (x 16, y Blockanfang + 16).
  { id: 'gras', source: 'Backgrounds/Tilesets/TilesetField.png', x: 16, y: 64, use: 'Boden im Dorf: helle Wiese' },
  { id: 'gras_dunkel', source: 'Backgrounds/Tilesets/TilesetField.png', x: 16, y: 112, use: 'Boden im Dorf: dunkle Wiese' },
  { id: 'sand', source: 'Backgrounds/Tilesets/TilesetField.png', x: 16, y: 16, use: 'Boden im Dorf: Sandweg' },
];

/** Gegenstände auf der Karte: { id, source, x, y, w, h, anchorX, anchorY, use }. */
export const PROPS = [];

/** Figuren: { id, source, ops, use } — ab Task 8. */
export const FIGURES = [];

/** Oberfläche: { id, source, x, y, w, h, use } — ab Plan 1b. */
export const UI = [];
