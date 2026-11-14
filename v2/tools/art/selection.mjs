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

// Helle Haut der Familie (wie in den Stiltest-Entwürfen): Grundton und Schattenton aus Palette.png.
const SKIN = '#f2ad7d';
const SKIN_SHADE = '#d3865f';

/** Stehen (Blattzeile 0), Gehen 1 und 3 (Blattzeilen 1, 3) haben die Ruhehaltung; Gehen 2 und 4 (2, 4) wippen. */
const REST = [0, 1, 3];
const STEP = [2, 4];

/** Entfernt in jeder Zelle die angegebenen Zeilen; je Haltung eigene Indizes, weil der Kopf beim Gehen wippt. */
function dropPerPose({ rest, stepDown, stepUp }) {
  return [
    { where: { rows: REST }, step: ['dropRows', rest] },
    { where: { facing: ['down', 'left', 'right'], rows: STEP }, step: ['dropRows', stepDown] },
    { where: { facing: ['up'], rows: STEP }, step: ['dropRows', stepUp] },
  ];
}

/**
 * Figuren: { id, source, ops, use, sheetRows?, face? } — source ist der Ordner der Vorlage; Schritte siehe build.mjs.
 * sheetRows nur für Vorlagen ohne SeparateAnim (Zeilen aus SpriteSheet.png: stehen, gehen 1–4).
 */
export const FIGURES = [
  {
    id: 'emilia',
    source: 'Actor/Character/Princess',
    ops: [
      ['recolor', {
        '#4e484a': '#695953', '#3b3643': '#4e484a', // Haare dunkelbraun
        '#f1c471': '#ef9597', '#d78b4a': '#cf736d', // Kleid rosa
        '#e0394c': '#ef9597', // Schleife rosa
        '#a3754e': SKIN, '#965340': SKIN_SHADE,
      }],
      ...dropPerPose({ rest: [4], stepDown: [5], stepUp: [3] }),
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Spielfigur Emilia: dunkelbraune Haare, rosa Kleid und rosa Schleife',
  },
  {
    id: 'lena',
    source: 'Actor/Character/Woman',
    ops: [
      ['recolor', { '#ef914f': SKIN, '#cf736d': SKIN_SHADE }],
      ...dropPerPose({ rest: [5], stepDown: [6], stepUp: [5] }),
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Cousine Lena: blonde Haare mit Haarband, blaues Kleid',
  },
  {
    id: 'julian',
    source: 'Actor/Character/Villager4',
    ops: [
      ['recolor', { '#ef914f': SKIN, '#d14b34': SKIN_SHADE }],
      ...dropPerPose({ rest: [4, 9, 13], stepDown: [5, 10, 13], stepUp: [3, 8, 13] }),
      ['dropCols', [6, 9]],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Cousin Julian: blonde Haare, rotes Hemd (Hemdfarbe = Wangen im Gesicht), kleiner als alle',
  },
  {
    id: 'mama_tanja',
    source: 'Actor/Character/Villager3',
    ops: [
      ['recolor', {
        '#4e484a': '#965340', '#3b3643': '#695953',
        '#a3754e': SKIN, '#965340': SKIN_SHADE,
        '#56864c': '#cf736d', '#a8a129': '#ef9597',
        '#8d977f': '#543c52', '#abc2bc': '#8f3e56',
      }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Mama Tanja: braune Haare als Bob, rosa Oberteil, pflaumenfarbener Rock',
  },
  {
    id: 'papa_milos',
    source: 'Actor/Character/Villager2',
    ops: [
      ['recolor', { '#d14b34': SKIN, '#8f3e56': SKIN_SHADE }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Papa Milos: schwarze, wilde Locken, blaue Hose (Vorlage hat kein eigenes Hemd: Hemd- und Hautschatten sind eine Farbe)',
  },
  {
    id: 'marie',
    source: 'Actor/Character/ManGreen',
    face: 'Faceset1.png',
    ops: [
      ['recolor', { '#ef914f': SKIN, '#d14b34': SKIN_SHADE }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Marie: blonde Haare unter grüner Zipfelmütze, grüne Kleidung (Mütze und Kleidung teilen die Farben; gelb würde mit den Haaren verschwimmen)',
  },
  {
    id: 'liam',
    source: 'Actor/Character/Boy',
    ops: [
      ['recolor', { '#d14b34': '#695953', '#965340': '#4e484a', '#ef914f': SKIN, '#e3f1f5': '#56864c', '#548789': '#816855' }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Angler Liam: dunkelbraune Strubbelhaare, grünes Hemd, braune Hose',
  },
  {
    id: 'oma',
    source: 'Actor/Character/OldWoman',
    sheetRows: [0, 0, 1, 0, 1],
    ops: [
      ['recolor', { '#d3a2c0': '#8e7c73', '#f2eaf1': '#b3957f', '#a5608b': '#4e484a', '#548789': '#a5608b', '#2d697b': '#8f3e56', '#ef914f': SKIN, '#d14b34': SKIN_SHADE }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Oma: graue lange Haare, malvenfarbenes Kleid',
  },
  {
    id: 'opa',
    source: 'Actor/Character/OldMan3',
    ops: [
      ['recolor', { '#3b3643': '#5f7160', '#4e484a': '#8d977f', '#ef914f': SKIN, '#d14b34': SKIN_SHADE }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Opa: Strohhut, weißer Bart, olivgrünes Gewand (Glatze unter dem Hut)',
  },
  {
    id: 'baba',
    source: 'Actor/Character/Cavegirl2',
    ops: [
      ['recolor', { '#8f3e56': '#965340', '#543c52': '#695953', '#fce2ca': '#965340', '#f1c471': '#9c6546', '#965340': '#d14b34', '#a3754e': '#8f3e56' }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Baba: rotbraune, wilde Haare mit Zöpfen, rotes Kleid',
  },
  {
    id: 'deda',
    source: 'Actor/Character/OldMan2',
    ops: [
      ['recolor', { '#e0394c': '#4a5270', '#8f3e56': '#3b3643', '#674352': '#8e7c73', '#d3a2c0': '#b3957f', '#a5608b': '#8e7c73', '#ef914f': SKIN, '#d14b34': SKIN_SHADE }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Deda: dunkelblaue Mütze, graue Haare, weißer Schnurrbart, gestreiftes Hemd',
  },
  {
    id: 'ferdinand',
    source: 'Actor/Character/Noble',
    ops: [
      ['recolor', { '#4e484a': '#548789', '#3b3643': '#2d697b', '#965340': '#816855' }],
      ['anchorBottomCenter', 16, 16],
    ],
    use: 'Händler Ferdinand: türkise Melone und türkiser Anzug, braune Hose',
  },
];

/** Gemeinsamer Schatten unter allen Figuren. */
export const FIGURE_SHADOW = { id: 'schatten', source: 'Actor/Character/Shadow.png', use: 'Schatten unter jeder Figur' };

/** Oberfläche: { id, source, x, y, w, h, use } — ab Plan 1b. */
export const UI = [];
