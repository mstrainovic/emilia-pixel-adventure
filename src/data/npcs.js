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
      'Hallo Schatz! Die Welt wartet — aber iss erstmal was!',
      'Bring Fisch mit, ich koch mein Geheimrezept! Geh zum See!',
      'Du wirst jeden Tag mutiger! Ich bin so stolz!',
      'Besuch mal Opa — er braucht Holz!',
      'Ich hab Kuchen gebacken! Magst du ein Stueck?',
      'Pass auf dich auf! Komm zum Essen zurueck!',
      'Die Blumen im Wald sind krank... hilf ihnen mit F!',
      'Am Kochtopf kannst du kochen! Bring Zutaten mit!'
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
      'Hey mala moja! An der Werkbank baust du tolle Sachen!',
      'Im Osten ist eine Hoehle... traust du dich rein?',
      'Du bist eine echte Entdeckerin! Nimm dein Schwert mit!',
      'Bring Erz aus der Hoehle — wir schmieden ein Schwert!',
      'Leertaste zum Kaempfen! Vergiss das nicht!',
      'Verletzt? Geh zu Mama — sie kocht was Gutes!',
      'Die Hoehle hat Schaetze, aber auch Skelette!',
      'Papa glaubt an dich! Du schaffst alles!'
    ]
  },
  {
    id: 'marie',
    name: 'Marie',
    role: 'Abenteurerin',
    hairStyle: 'medium',
    hairColor: 0xd4a030,   // Blondes Haar
    clothingColor: 0xffdd55, // Gelbes Kleid
    x: 15, y: 7,
    direction: 'down',
    dialogs: [
      'Im Wald gibt es lustige Schleime! Komm mit!',
      'Psst! Im Wald hab ich was Magisches gesehen...',
      'Die leuchtenden Pilze in der Hoehle sind so cool!',
      'Heile genug Pflanzen — dann oeffnet sich ein Geheimweg!',
      'Ob Einhoerner Blumen moegen? Ich hab welche!',
      'Im See gibt es einen geheimen Schatz!',
      'Du bist meine beste Freundin! Wir sind unschlagbar!',
      'Stell dir vor, wir haetten ein Einhorn! Sooo toll!'
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
      'Hey! Geh zum See im Sueden — drueck F zum Fischen!',
      'Am Strand gibt es Muscheln und Krabben!',
      'Nachts siehst du Sternschnuppen — wuensch dir was!',
      'Ich hab ein Monster gesehen! ...oder doch nur ein Busch.',
      'Wenn ich gross bin, werd ich Ritter! Oder Astronaut!',
      'Die Hoehle ist gruselig — aber auch spannend!',
      'Am See hab ich einen riesigen Fisch gesehen!',
      'Wir sollten ein Baumhaus bauen! Das waer cool!'
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
      'Sonnenschein! Siehst du die welken Pflanzen? Drueck F!',
      'Heile genug Pflanzen — dann passiert was Wunderbares!',
      'Mein Garten ist so schoen! Danke, Liebes!',
      'Pflanzen sind wie Freunde — sie brauchen Liebe!',
      'Oma hat Kekse gebacken! Magst du einen?',
      'Im Wald wachsen Krauter — bring sie zu Deda!',
      'Du hast gruene Daumen! Genau wie Oma!'
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
      'Holz ist wichtig! Sammle welches im Wald mit E!',
      'An meiner Saege verarbeitest du Holz zu Sachen!',
      'Du bist fleissig wie eine Biene! Weiter so!',
      'Geduld und gutes Holz — das Geheimnis!',
      'Bring Holz zur Saege — Opa hilft dir!',
      'Frueher war hier nur Wald. Jetzt steht ein Dorf!',
      'Du bist neugierig wie Opa als Kind!'
    ]
  },
  {
    id: 'baba',
    name: 'Baba',
    role: 'Lagerfeuer',
    hairStyle: 'bun',
    hairColor: 0x8a4a30,   // Kastanienbraunes Haar
    clothingColor: 0xcc5544, // Warmes Rot
    x: 18, y: 20,
    direction: 'side',
    dialogs: [
      'Dodji ovamo! Setz dich ans Feuer, zlato moje!',
      'Bring Pilze und Beeren — Baba kocht was!',
      'In Serbien gab es auch magische Waelder!',
      'Svaka cast! Du bist so tapfer, Emilia!',
      'Baba hat Pita gemacht — frisch aus dem Ofen!',
      'Ko rano rani, dve srece grabi! Frueh aufstehen bringt Glueck!',
      'Jesi gladna? Baba kocht genug fuer alle!',
      'Volim te, moja mala! Du bist Babas Schatz!'
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
      'Einhoerner verstecken sich! Mein Deda hat davon erzaehlt!',
      'Donesi mi kristale! Bring Kristalle aus der Hoehle!',
      'Mit Kristallen braue ich Zaubertranke!',
      'Ueber den Wolken gibt es ein Schloss!',
      'Bravo! Du bist mutig! Deda ist stolz!',
      'Der Zmaj ist ein Drache der die Guten beschuetzt!',
      'Moja unuka! Du hast das Herz einer Heldin!',
      'Bring Zutaten — Deda braut Zaubertranke!'
    ]
  },
  {
    id: 'ferdinand',
    name: 'Ferdinand',
    role: 'Haendler',
    type: 'trader',
    hairStyle: 'short',
    hairColor: 0xd4a030,   // Blondes Haar
    clothingColor: 0x44aa88, // Gruenes Haendler-Shirt
    x: 25, y: 15,
    direction: 'side',
    dialogs: [
      'Hey! Willst du was verkaufen? Ich kauf alles!',
      'Wenzl musste Hausaufgaben machen. Ich nicht! Hehe!',
      'Zeig mal was du hast! Ich sammle alles!',
      'Ich bin der beste Haendler! Naja, der einzige.',
      'Fuer Kristalle zahle ich extra viel!',
      'Brauchst du Muenzen? Bring mir Sachen!',
      'Du bist meine beste Kundin! Und einzige... hehe!'
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
