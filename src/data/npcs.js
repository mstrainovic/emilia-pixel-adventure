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
      'Hallo mein Schatz! Hast du Hunger? Bring mir Fisch und ich koche dir etwas Leckeres!',
      'Pass auf dich auf da draussen, Emilia! Und vergiss nicht zu essen!',
      'Du bist die beste kleine Abenteurerin der Welt!'
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
      'Hey mala moja! Schau mal was ich gebaut habe! Soll ich dir auch was bauen?',
      'Im Wald gibt es tolle Sachen zu entdecken — aber nimm dein Schwert mit!',
      'Bring mir Holz und Steine, dann bauen wir zusammen etwas Tolles!'
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
      'Emilia! Komm, lass uns den Wald erkunden! Ich hab was Tolles gefunden!',
      'Psst! Ich glaub ich hab hinter dem grossen Baum etwas Magisches gesehen...',
      'Hast du schon die leuchtenden Pilze in der Hoehle gesehen? Die sind so cool!'
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
      'Hey Emilia! Die Fische beissen heute besonders gut!',
      'Papa Milos hat mir das Fischen beigebracht — der ist der Beste!',
      'Ich hab gehoert, dass im Wasser manchmal ein Einhorn trinken kommt...'
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
      'Emilia, mein Sonnenschein! Schau mal, die Tomaten sind fast reif!',
      'Vergiss nicht die Blumen zu giessen — sie brauchen dein magisches Wasser!',
      'Bring mir 3 Erde aus dem Wald und wir legen ein neues Beet an!'
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
      'Na, meine Kleine! Holz ist das wichtigste Material — damit fing alles an!',
      'Frueher hab ich ganz alleine dieses Dorf aus Holz gebaut, weisst du?',
      'Bring mir Holz und ich saege dir die schoensten Bretter!'
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
      'Dobar dan, Emilia! Dodji ovamo, sedi pored vatre!',
      'Baba hat Fleisch ueber dem Feuer — soll ich dir was braten, zlato moje?',
      'Weisst du, frueher in Serbien hatten wir auch einen magischen Wald...'
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
      'Ah, Emilia! Mein Deda hat mir Geschichten von magischen Einhoernern erzaehlt...',
      'Diese Pilze hier — die leuchten im Dunkeln! Damit machen wir einen Zaubertrank!',
      'Donesi mi kristale iz pecine — pokazacu ti pravu magiju!'
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
