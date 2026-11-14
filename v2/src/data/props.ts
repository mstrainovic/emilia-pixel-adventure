/**
 * Bilder der Objekte auf den Karten. Die Bildnamen stehen in src/assets/gfx/props/dorf.json (erzeugt von
 * tools/art/build.mjs aus „Ninja Adventure"), samt Fußpunkt (anchorX/anchorY) jedes Bildes.
 * Schlüssel: Objekttyp, bei Objekten mit Eigenschaft variant „typ:variante" (siehe propKey).
 */
export interface PropDef {
  /** Standbild (bei Animationen das erste Bild). */
  frame: string;
  /** standing: nach Fußpunkt mit den Figuren sortiert; flat: liegt flach am Boden unter allen Figuren. */
  layer: 'standing' | 'flat';
  /** Bilder einer Animation, in Abspielreihenfolge. */
  frames?: readonly string[];
  fps?: number;
}

const standing = (frame: string): PropDef => ({ frame, layer: 'standing' });
const flat = (frame: string): PropDef => ({ frame, layer: 'flat' });
const animated = (layer: PropDef['layer'], frames: readonly string[], fps: number): PropDef => ({ frame: frames[0]!, layer, frames, fps });

export function propKey(type: string, variant: string | null): string {
  return variant === null ? type : `${type}:${variant}`;
}

/** Die 15 Baumvarianten des alten Spiels (TREE_VARIANTS in src/world/maps/hub.js), nach Familie. */
const TREES: Record<string, string> = {
  pine_dark: 'tanne', pine_med: 'tanne', pine_light: 'tanne', pine_dark2: 'tanne', pine_med2: 'tanne',
  oak_green: 'laubbaum', oak_bare: 'laubbaum', oak_ice: 'laubbaum',
  oak_yellow: 'laubbaum_herbst', oak_orange: 'laubbaum_herbst', oak_red: 'laubbaum_herbst',
  round_green: 'rundbaum', round_autumn: 'rundbaum', round_red: 'rundbaum',
  round_dark: 'rundbaum_dunkel',
  maple: 'rosabaum',
  // Waldrand: Tannen, deren Krone bündig über der Fußkachel und dem linken bzw. rechten Nachbarn liegt.
  forest_left: 'tanne_links',
  forest_right: 'tanne_rechts',
};

export const PROP_DEFS: Readonly<Record<string, PropDef>> = {
  ...Object.fromEntries(Object.entries(TREES).map(([variant, frame]) => [propKey('tree', variant), standing(frame)])),
  'house:orange': standing('haus_orange'),
  'house:shop': standing('haus_laden'),
  'house:stone': standing('haus_stein'),
  'house:wood': standing('haus_holz'),
  'station:cooking': standing('herd'),
  'station:workbench': standing('werkbank'),
  'station:anvil': standing('amboss'),
  'station:sawmill': standing('saegebank'),
  'station:alchemy': standing('kessel'),
  trophy_shelf: standing('regal_pokale'),
  bonfire: animated('standing', ['lagerfeuer_0', 'lagerfeuer_1', 'lagerfeuer_2', 'lagerfeuer_1'], 6),
  well: standing('brunnen'),
  signpost: standing('wegweiser'),
  chest: standing('truhe'),
  chicken: animated('standing', ['huhn_0', 'huhn_1'], 2),
  bush: standing('busch'),
  flower: animated('flat', ['blume_0', 'blume_1', 'blume_2', 'blume_3', 'blume_2', 'blume_1'], 4),
  rock: flat('kiesel'),
  wilted_plant: standing('welke_pflanze'),
  garden_plot: flat('setzling'),
  'resource:vegetable': standing('kohl'),
  'resource:seed': flat('samen'),
  real_fence: standing('zaun'),
  'decor:barrel': standing('fass'),
  'decor:basket_vegetables': standing('korb_gemuese'),
  'decor:basket_apples': standing('korb_aepfel'),
  'decor:crate': standing('kiste'),
  'decor:bookshelf': standing('buecherregal'),
};
