/**
 * Family NPC definitions for Emilia's village.
 * All NPCs use Body_A character sprites with custom hair and clothing.
 */
export const FAMILY_NPCS = [
  {
    id: 'mama_tanja',
    name: 'Mama Tanja',
    role: 'Koechin',
    hairStyle: 'medium',
    hairColor: 0x5a3520,   // Braunes Haar
    clothingColor: 0xff88aa, // Rosa Oberteil
    x: 8, y: 11,
    direction: 'down',
    dialogs: [
      'Hallo mein Schatz! Schoen, dass du da bist! Die Welt wartet auf dich — aber iss erstmal was!',
      'Emilia, wenn du Fisch mitbringst, koche ich dir mein Geheimrezept! Geh doch mal zum See!',
      'Du wirst jeden Tag mutiger, mein Schatz! Ich bin so stolz auf dich!',
      'Hast du schon Opa besucht? Er braucht Holz fuer seine Werkstatt!'
    ]
  },
  {
    id: 'papa_milos',
    name: 'Papa Milos',
    role: 'Baumeister',
    hairStyle: 'short',
    hairColor: 0x1a1a1a,   // Schwarzes Haar
    clothingColor: 0x4477cc, // Blaues Hemd
    x: 30, y: 11,
    direction: 'down',
    dialogs: [
      'Hey mala moja! Willst du was bauen? An der Werkbank kannst du tolle Sachen herstellen!',
      'Im Osten gibt es eine geheimnisvolle Hoehle... traust du dich rein?',
      'Du bist genau wie ich — eine echte Entdeckerin! Nimm dein Schwert mit!',
      'Wenn du Erz aus der Hoehle mitbringst, schmieden wir zusammen ein starkes Schwert!'
    ]
  },
  {
    id: 'marie',
    name: 'Marie',
    role: 'Abenteurerin',
    hairStyle: 'medium',
    hairColor: 0xd4a030,   // Blondes Haar
    clothingColor: 0xffdd55, // Gelbes Kleid
    x: 16, y: 13,
    direction: 'side',
    dialogs: [
      'Emilia! Im Wald Richtung Norden gibt es lustige Schleime! Komm, wir schauen!',
      'Psst! Ich hab hinter einem grossen Baum im Wald etwas Magisches gesehen...',
      'Hast du schon die leuchtenden Pilze in der Hoehle gesehen? Die sind so cool!',
      'Ich hab gehoert, wenn man genug Pflanzen heilt, oeffnet sich ein geheimer Weg!'
    ]
  },
  {
    id: 'liam',
    name: 'Liam',
    role: 'Angler',
    hairStyle: 'short',
    hairColor: 0x4a3020,   // Dunkelbraunes Haar
    clothingColor: 0x55aa66, // Gruenes Shirt
    x: 20, y: 26,
    direction: 'down',
    dialogs: [
      'Hey Emilia! Geh zum See im Sueden — da kann man toll fischen! Drueck F am Wasser!',
      'Am Strand noch weiter suedlich gibt es Muscheln und Krabben!',
      'Wenn du nachts rausschaust, siehst du manchmal Sternschnuppen — wuensch dir was!',
      'Papa Milos hat mir das Fischen beigebracht. Du schaffst das auch!'
    ]
  },
  {
    id: 'oma',
    name: 'Oma',
    role: 'Gaertnerin',
    hairStyle: 'bun',
    hairColor: 0xc0b8b0,   // Silbergraues Haar
    clothingColor: 0xaa77cc, // Lila Kleid
    x: 8, y: 23,
    direction: 'side',
    dialogs: [
      'Emilia, mein Sonnenschein! Siehst du die welken Pflanzen? Drueck F um sie zu heilen!',
      'Wenn du genug Pflanzen heilst, passiert etwas ganz Wunderbares... wart nur ab!',
      'Mein Garten ist so schoen geworden! Danke fuer deine Hilfe, Liebes!',
      'Die Natur hat viele Geheimnisse — schau dich ueberall gut um!'
    ]
  },
  {
    id: 'opa',
    name: 'Opa',
    role: 'Holzarbeiter',
    hairStyle: 'short',
    hairColor: 0x999090,   // Graues Haar
    clothingColor: 0x997744, // Braune Weste
    x: 30, y: 24,
    direction: 'down',
    dialogs: [
      'Na, meine Kleine! Holz ist das wichtigste Material! Sammle welches im Wald mit E!',
      'Frueher hab ich ganz alleine dieses Dorf gebaut, weisst du?',
      'An meiner Saege kannst du Holz zu tollen Sachen verarbeiten!',
      'Du bist fleissig wie eine Biene! Weiter so, Emilia!'
    ]
  },
  {
    id: 'baba',
    name: 'Baba',
    role: 'Lagerfeuer',
    hairStyle: 'bun',
    hairColor: 0x8a4a30,   // Kastanienbraunes Haar
    clothingColor: 0xcc5544, // Warmes Rot
    x: 21, y: 16,
    direction: 'side',
    dialogs: [
      'Dobar dan, Emilia! Dodji ovamo, sedi pored vatre! Setz dich ans Feuer, zlato moje!',
      'Baba kocht ueber dem Feuer — bring Pilze und Beeren mit, ja?',
      'Weisst du, frueher in Serbien gab es auch magische Waelder und Einhoerner...',
      'Svaka cast, Emilia! Du bist so tapfer! Baba ist sehr stolz auf dich!'
    ]
  },
  {
    id: 'deda',
    name: 'Deda',
    role: 'Geschichtenerzaehler',
    hairStyle: 'short',
    hairColor: 0x707068,   // Dunkelgraues Haar
    clothingColor: 0x445588, // Dunkelblaues Hemd
    x: 33, y: 13,
    direction: 'down',
    dialogs: [
      'Ah, Emilia! Mein Deda hat mir von magischen Einhoernern erzaehlt... sie verstecken sich!',
      'Donesi mi kristale iz pecine — pokazacu ti pravu magiju! Bring Kristalle aus der Hoehle!',
      'Mit Kristallen braue ich dir einen Zaubertrank am Alchemie-Tisch!',
      'Hoch ueber den Wolken gibt es ein Schloss... aber nur die Mutigsten finden es!'
    ]
  }
];

/**
 * Emilia's appearance config
 */
export const EMILIA_CONFIG = {
  hairStyle: 'long',
  hairColor: 0x1a0e05,    // Langes schwarzes Haar
  clothingColor: 0x66aadd, // Hellblaues Kleid
};
