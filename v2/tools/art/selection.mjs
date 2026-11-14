// Auswahlliste aus „Ninja Adventure" (CC0): nur was hier steht, kommt ins Repo.
// Quellpfade sind relativ zum Pack-Ordner (NINJA_PACK_DIR), Koordinaten in Pixeln des Quellbilds.

const FLOOR = 'Backgrounds/Tilesets/TilesetFloor.png';
const FLOOR_DETAIL = 'Backgrounds/Tilesets/TilesetFloorDetail.png';
const NATURE = 'Backgrounds/Tilesets/TilesetNature.png';
const HOUSE = 'Backgrounds/Tilesets/TilesetHouse.png';
const ELEMENT = 'Backgrounds/Tilesets/TilesetElement.png';
const CAMP = 'Backgrounds/Tilesets/tileset_camp.png';

/** Wegkacheln: Erdweg auf heller Wiese aus TilesetFloor (Block Spalten 0–9, Zeilen 7–11). */
function path(id, x, y, what) {
  return { id: `weg_${id}`, source: FLOOR, x, y, use: `Boden im Dorf: Weg, ${what}` };
}

/**
 * Bodenkacheln, je 16×16: { id, source, x, y, use } — Reihenfolge = Index in tiles/dorf.png.
 * Der Pack hat keinen Sandweg auf Wiese; der Weg ist der Erdweg aus TilesetFloor, der dort als
 * vollständiger Satz (Kanten, Außen- und Innenecken) auf derselben Wiese liegt.
 */
export const TILES = [
  { id: 'wiese', source: FLOOR, x: 0, y: 192, use: 'Boden im Dorf: Wiese, schlicht' },
  { id: 'wiese_b', source: FLOOR, x: 16, y: 192, use: 'Boden im Dorf: Wiese mit Grasbüschel' },
  { id: 'wiese_c', source: FLOOR, x: 32, y: 192, use: 'Boden im Dorf: Wiese mit Grasranke' },
  { id: 'wiese_d', source: FLOOR, x: 64, y: 192, use: 'Boden im Dorf: Wiese mit Halmen' },
  { id: 'wiese_dunkel', source: FLOOR, x: 176, y: 192, use: 'Boden im Dorf: dunkle Wiese unter dem Waldrand' },
  path('mitte', 16, 128, 'Mitte'),
  path('n', 16, 112, 'Gras im Norden'),
  path('s', 16, 144, 'Gras im Süden'),
  path('w', 0, 128, 'Gras im Westen'),
  path('o', 32, 128, 'Gras im Osten'),
  path('aussen_nw', 0, 112, 'Außenecke Nordwest'),
  path('aussen_no', 32, 112, 'Außenecke Nordost'),
  path('aussen_sw', 0, 144, 'Außenecke Südwest'),
  path('aussen_so', 32, 144, 'Außenecke Südost'),
  path('innen_nw', 96, 144, 'Innenecke, Gras nur nordwestlich'),
  path('innen_no', 80, 144, 'Innenecke, Gras nur nordöstlich'),
  path('innen_sw', 96, 128, 'Innenecke, Gras nur südwestlich'),
  path('innen_so', 80, 128, 'Innenecke, Gras nur südöstlich'),
  { id: 'hof', source: 'Backgrounds/Tilesets/Interior/TilesetInteriorFloor.png', x: 16, y: 208, use: 'Boden im Dorf: Hofboden (Pflaster) vor den Werkstätten' },
  { id: 'stein', source: 'Backgrounds/Tilesets/Interior/TilesetInteriorFloor.png', x: 224, y: 144, use: 'Boden im Dorf: Steinboden (grüne Platten) vor Dedas Labor' },
  { id: 'beet', source: FLOOR, x: 192, y: 240, use: 'Boden im Dorf: Beet-Erde in Omas Garten' },
  { id: 'blumen_rot', source: FLOOR_DETAIL, x: 80, y: 32, use: 'Bodendetail: rote Blumen auf der Blumenwiese' },
  { id: 'blume_weiss', source: FLOOR_DETAIL, x: 32, y: 0, use: 'Bodendetail: weiße Blüte auf der Blumenwiese' },
  { id: 'grasbuschel', source: FLOOR_DETAIL, x: 0, y: 32, use: 'Bodendetail: Grasbüschel auf der Blumenwiese' },
];

/**
 * Gegenstände auf der Karte: { id, source, x, y, w, h, anchorX, anchorY, use, frames?, stepX? } oder
 * zusammengesetzt { id, w, h, anchorX, anchorY, use, parts: [{ source, x, y, w, h, dx, dy, stepX? }], frames? }
 * (siehe build.mjs). anchorX/anchorY = Fußpunkt im Bild (unten mittig).
 */
export const PROPS = [
  // Bäume (TilesetNature): Tanne, Laubbaum, Rundbaum, rosa Baum
  { id: 'tanne', source: NATURE, x: 32, y: 1, w: 32, h: 30, anchorX: 16, anchorY: 30, use: 'Baum: Tanne (alte Varianten pine_*), auch Waldrand' },
  // Waldrand bündig: die Krone deckt genau die Fußkachel und ihren linken bzw. rechten Nachbarn.
  { id: 'tanne_links', of: 'tanne', anchorX: 24, anchorY: 30, use: 'Waldrand: Tanne, Krone über Fußkachel und linker Nachbarkachel' },
  { id: 'tanne_rechts', of: 'tanne', anchorX: 8, anchorY: 30, use: 'Waldrand: Tanne, Krone über Fußkachel und rechter Nachbarkachel' },
  { id: 'laubbaum', source: NATURE, x: 48, y: 288, w: 48, h: 48, anchorX: 24, anchorY: 48, use: 'Baum: grüner Laubbaum (oak_green, oak_bare, oak_ice)' },
  { id: 'laubbaum_herbst', source: NATURE, x: 144, y: 288, w: 48, h: 48, anchorX: 24, anchorY: 48, use: 'Baum: Laubbaum im Herbst (oak_orange, oak_yellow, oak_red)' },
  { id: 'rundbaum', source: NATURE, x: 0, y: 2, w: 32, h: 29, anchorX: 16, anchorY: 29, use: 'Baum: Rundbaum (round_green, round_autumn, round_red)' },
  { id: 'rundbaum_dunkel', source: NATURE, x: 96, y: 1, w: 32, h: 31, anchorX: 16, anchorY: 31, use: 'Baum: dunkler Rundbaum (round_dark), auch Waldrand' },
  { id: 'rosabaum', source: NATURE, x: 224, y: 2, w: 32, h: 29, anchorX: 16, anchorY: 29, use: 'Baum: rosa Baum (alter maple_tree)' },
  // Häuser (TilesetHouse)
  { id: 'haus_orange', source: HOUSE, x: 0, y: 0, w: 64, h: 48, anchorX: 32, anchorY: 48, use: 'Haus von Mama Tanja hinter der Küche' },
  { id: 'haus_laden', source: HOUSE, x: 304, y: 0, w: 64, h: 48, anchorX: 32, anchorY: 48, use: 'Haus von Papa Milos hinter der Werkstatt' },
  { id: 'haus_stein', source: HOUSE, x: 368, y: 0, w: 48, h: 48, anchorX: 24, anchorY: 48, use: 'Haus von Deda hinter dem Alchemie-Kessel' },
  { id: 'haus_holz', source: HOUSE, x: 416, y: 0, w: 48, h: 48, anchorX: 24, anchorY: 48, use: 'Haus von Opa hinter dem Sägewerk' },
  // Stationen
  { id: 'herd', source: HOUSE, x: 464, y: 160, w: 32, h: 16, anchorX: 16, anchorY: 16, use: 'Station Kochen: Küchentisch mit Tomate und Topf' },
  { id: 'werkbank', source: HOUSE, x: 464, y: 128, w: 32, h: 16, anchorX: 16, anchorY: 16, use: 'Station Werkbank: Tisch mit Hammer und Axt' },
  { id: 'amboss', source: HOUSE, x: 464, y: 240, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Station Amboss' },
  { id: 'saegebank', source: HOUSE, x: 496, y: 240, w: 32, h: 16, anchorX: 16, anchorY: 16, use: 'Station Sägewerk: Sägebank mit Sägeblatt' },
  { id: 'kessel', source: HOUSE, x: 496, y: 160, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Station Alchemie: Kessel mit Trank' },
  // Dorfleben
  { id: 'regal_pokale', source: ELEMENT, x: 64, y: 113, w: 16, h: 29, anchorX: 8, anchorY: 29, use: 'Trophäenregal neben Mama Tanjas Haus' },
  {
    id: 'lagerfeuer', w: 32, h: 31, anchorX: 16, anchorY: 31, frames: 3,
    parts: [
      { source: CAMP, x: 192, y: 81, w: 32, h: 31, dx: 0, dy: 0 },
      { source: 'FX/Particle/Fire.png', x: 12, y: 0, w: 12, h: 12, dx: 10, dy: 4, stepX: 12 },
    ],
    use: 'Lagerfeuer: Feuerstelle aus Steinen und Holz, darüber Flammen (drei Bilder)',
  },
  { id: 'brunnen', source: ELEMENT, x: 112, y: 27, w: 16, h: 21, anchorX: 8, anchorY: 21, use: 'Dorfbrunnen auf dem Dorfplatz' },
  { id: 'wegweiser', source: HOUSE, x: 464, y: 256, w: 16, h: 15, anchorX: 8, anchorY: 15, use: 'Wegweiser an den Ausgängen' },
  { id: 'truhe', source: 'Items/Treasure/LittleTreasureChest.png', x: 0, y: 4, w: 16, h: 11, anchorX: 8, anchorY: 11, use: 'Schatztruhe (geschlossen)' },
  { id: 'huhn', source: 'Actor/Animal/Chicken/SpriteSheetWhite.png', x: 0, y: 0, w: 16, h: 16, anchorX: 8, anchorY: 16, frames: 2, stepX: 16, use: 'Huhn in Omas Garten (zwei Bilder)' },
  { id: 'busch', source: NATURE, x: 48, y: 162, w: 16, h: 13, anchorX: 8, anchorY: 13, use: 'Grasbusch am Wegrand' },
  { id: 'blume', source: 'Backgrounds/Animated/Plant/SpriteSheet16x16.png', x: 0, y: 3, w: 16, h: 13, anchorX: 8, anchorY: 13, frames: 4, stepX: 16, use: 'Blume, wiegt sich (vier Bilder)' },
  { id: 'kiesel', source: NATURE, x: 288, y: 289, w: 16, h: 14, anchorX: 8, anchorY: 14, use: 'Kiesel im Gras' },
  { id: 'welke_pflanze', source: NATURE, x: 64, y: 145, w: 16, h: 15, anchorX: 8, anchorY: 15, use: 'Welke Pflanze, die Emilia heilen kann' },
  { id: 'setzling', source: FLOOR_DETAIL, x: 96, y: 32, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Gartenbeet: Setzling auf der Beet-Erde' },
  { id: 'kohl', source: NATURE, x: 160, y: 144, w: 16, h: 15, anchorX: 8, anchorY: 15, use: 'Rohstoff Gemüse in Omas Garten' },
  { id: 'samen', source: 'Items/Food/SeedLarge.png', x: 0, y: 0, w: 14, h: 13, anchorX: 7, anchorY: 13, use: 'Rohstoff Samen neben Omas Garten' },
  { id: 'zaun', source: HOUSE, x: 208, y: 112, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Niedriger Gartenzaun' },
  // Beiwerk auf den Mauerkacheln der alten Häuser (dort bleibt gesperrt, was die Vorlage sperrt)
  { id: 'fass', source: HOUSE, x: 256, y: 240, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Fass neben den Werkstätten' },
  { id: 'korb_gemuese', source: HOUSE, x: 272, y: 208, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Korb mit Gemüse neben der Küche' },
  { id: 'korb_aepfel', source: HOUSE, x: 288, y: 208, w: 16, h: 16, anchorX: 8, anchorY: 16, use: 'Korb mit Äpfeln neben der Küche' },
  { id: 'kiste', source: HOUSE, x: 320, y: 224, w: 16, h: 32, anchorX: 8, anchorY: 32, use: 'Kiste mit Beeren neben den Häusern' },
  { id: 'buecherregal', source: ELEMENT, x: 48, y: 113, w: 16, h: 29, anchorX: 8, anchorY: 29, use: 'Bücherregal neben Dedas Labor' },
];

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
