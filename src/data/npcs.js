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
    favoriteGifts: ['fish_generic', 'cooked_meat'],
    dialogs: [
      'Hallo Schatz! Die Welt wartet — aber iss erstmal was!',
      'Bring Fisch mit, ich koch mein Geheimrezept! Geh zum See!',
      'Du wirst jeden Tag mutiger! Ich bin so stolz!',
      'Besuch mal Opa — er braucht Holz!',
      'Ich hab Kuchen gebacken! Magst du ein Stueck?',
      'Pass auf dich auf! Komm zum Essen zurueck!',
      'Die Blumen im Wald sind krank... hilf ihnen mit F!',
      'Am Kochtopf kannst du kochen! Bring Zutaten mit!'
    ],
    friendshipDialogs: {
      1: [
        'Schoen dass du wieder da bist! Ich hab dein Lieblingsessen gemacht!',
        'Du wirst eine tolle Koechin, genau wie Mama!',
        'Soll ich dir ein Geheimrezept verraten? Komm her!'
      ],
      2: [
        'Mein Liebling! Du kochst schon fast besser als ich!',
        'Ich hab ein ganz besonderes Rezept nur fuer dich!',
        'Mit dir macht das Kochen doppelt so viel Spass!'
      ],
      3: [
        'Du bist mein groesster Schatz! Mama ist so stolz auf dich!',
        'Alles was ich koche, koche ich mit Liebe fuer dich!',
        'Du bist die beste Tochter der Welt!'
      ]
    }
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
    favoriteGifts: ['iron_ore', 'stone'],
    dialogs: [
      'Hey mala moja! An der Werkbank baust du tolle Sachen!',
      'Im Osten ist eine Hoehle... traust du dich rein?',
      'Du bist eine echte Entdeckerin! Nimm dein Schwert mit!',
      'Bring Erz aus der Hoehle — wir schmieden ein Schwert!',
      'Leertaste zum Kaempfen! Vergiss das nicht!',
      'Verletzt? Geh zu Mama — sie kocht was Gutes!',
      'Die Hoehle hat Schaetze, aber auch Skelette!',
      'Papa glaubt an dich! Du schaffst alles!'
    ],
    friendshipDialogs: {
      1: [
        'Du wirst immer staerker! Papa ist beeindruckt!',
        'Zusammen bauen wir die tollsten Sachen!',
        'Komm, ich zeig dir einen Trick an der Werkbank!'
      ],
      2: [
        'Du bist schon eine richtige Baumeisterin!',
        'Ich hab ein besonderes Werkzeug fuer dich!',
        'Mit dir an meiner Seite schaffen wir alles!'
      ],
      3: [
        'Mala moja, du bist die tapferste Abenteurerin!',
        'Papa ist so unglaublich stolz auf dich!',
        'Du bist staerker als du denkst! Immer!'
      ]
    }
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
    favoriteGifts: ['rainbow_flower', 'bloom_petal'],
    dialogs: [
      'Im Wald gibt es lustige Schleime! Komm mit!',
      'Psst! Im Wald hab ich was Magisches gesehen...',
      'Die leuchtenden Pilze in der Hoehle sind so cool!',
      'Heile genug Pflanzen — dann oeffnet sich ein Geheimweg!',
      'Ob Einhoerner Blumen moegen? Ich hab welche!',
      'Im See gibt es einen geheimen Schatz!',
      'Du bist meine beste Freundin! Wir sind unschlagbar!',
      'Stell dir vor, wir haetten ein Einhorn! Sooo toll!'
    ],
    friendshipDialogs: {
      1: [
        'Emilia! Ich hab auf dich gewartet! Lass uns spielen!',
        'Guck mal was ich gefunden hab! Eine glueckliche Blume!',
        'Wir zwei sind das beste Team im ganzen Dorf!'
      ],
      2: [
        'Du bist meine allerallerbeste Freundin, Emilia!',
        'Ich hab ein Geheimnis nur fuer dich: Im Wald leuchten Blumen nachts!',
        'Lass uns zusammen die Welt retten! Nur wir zwei!'
      ],
      3: [
        'Emilia, du bist wie eine Schwester fuer mich!',
        'Fuer immer beste Freundinnen! Versprochen!',
        'Mit dir ist jeder Tag ein Abenteuer!'
      ]
    }
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
    favoriteGifts: ['starfish', 'goldfish'],
    dialogs: [
      'Hey! Geh zum See im Sueden — drueck F zum Fischen!',
      'Am Strand gibt es Muscheln und Krabben!',
      'Nachts siehst du Sternschnuppen — wuensch dir was!',
      'Ich hab ein Monster gesehen! ...oder doch nur ein Busch.',
      'Wenn ich gross bin, werd ich Ritter! Oder Astronaut!',
      'Die Hoehle ist gruselig — aber auch spannend!',
      'Am See hab ich einen riesigen Fisch gesehen!',
      'Wir sollten ein Baumhaus bauen! Das waer cool!'
    ],
    friendshipDialogs: {
      1: [
        'Emilia! Ich hab heute drei Fische gefangen! Und du?',
        'Weisst du was? Du bist echt mutig! Nicht so wie ich...',
        'Komm, wir gehen zusammen angeln! Zu zweit macht es mehr Spass!'
      ],
      2: [
        'Ich hab den besten Angel-Platz nur fuer uns zwei!',
        'Du bist die coolste Abenteurerin die ich kenne!',
        'Guck mal! Ich hab dir was vom Strand mitgebracht!'
      ],
      3: [
        'Du bist mein bester Kumpel, Emilia! Fuer immer!',
        'Wenn ich mal in Gefahr bin, rettest du mich bestimmt!',
        'Zusammen sind wir unbesiegbar! Na gut, meistens du.'
      ]
    }
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
    favoriteGifts: ['vegetable', 'seed_carrot'],
    dialogs: [
      'Sonnenschein! Siehst du die welken Pflanzen? Drueck F!',
      'Heile genug Pflanzen — dann passiert was Wunderbares!',
      'Mein Garten ist so schoen! Danke, Liebes!',
      'Pflanzen sind wie Freunde — sie brauchen Liebe!',
      'Oma hat Kekse gebacken! Magst du einen?',
      'Im Wald wachsen Krauter — bring sie zu Deda!',
      'Du hast gruene Daumen! Genau wie Oma!'
    ],
    friendshipDialogs: {
      1: [
        'Mein Sonnenschein! Dein Garten wird jeden Tag schoener!',
        'Komm, Oma zeigt dir ein Geheimnis ueber Pflanzen!',
        'Du hast so ein gutes Herz, Liebes!'
      ],
      2: [
        'Du bist die beste kleine Gaertnerin weit und breit!',
        'Oma hat ein besonderes Saatgut nur fuer dich!',
        'Deine Pflanzen wachsen so schoen — das liegt an deiner Liebe!'
      ],
      3: [
        'Mein allerliebstes Enkelkind! Oma ist so gluecklich!',
        'Du machst die ganze Welt schoener, Liebes!',
        'Omas Herz ist voller Stolz auf dich!'
      ]
    }
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
    favoriteGifts: ['wood', 'driftwood'],
    dialogs: [
      'Holz ist wichtig! Sammle welches im Wald mit E!',
      'An meiner Saege verarbeitest du Holz zu Sachen!',
      'Du bist fleissig wie eine Biene! Weiter so!',
      'Geduld und gutes Holz — das Geheimnis!',
      'Bring Holz zur Saege — Opa hilft dir!',
      'Frueher war hier nur Wald. Jetzt steht ein Dorf!',
      'Du bist neugierig wie Opa als Kind!'
    ],
    friendshipDialogs: {
      1: [
        'Du wirst eine richtige Handwerkerin! Opa ist stolz!',
        'Komm, ich zeig dir wie man richtig saegt!',
        'Gutes Holz und Geduld — du hast beides!'
      ],
      2: [
        'Du baust schon besser als Opa frueher! Na ja, fast!',
        'Ich hab ein spezielles Werkzeug-Rezept fuer dich!',
        'Opa verraet dir sein bestes Handwerker-Geheimnis!'
      ],
      3: [
        'Du bist die fleissigste Enkelin der ganzen Welt!',
        'Opa ist maechtiger stolz auf dich!',
        'Alles was Opa weiss, gehoert jetzt auch dir!'
      ]
    }
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
    favoriteGifts: ['mushroom', 'berry'],
    dialogs: [
      'Dodji ovamo! Setz dich ans Feuer, zlato moje!',
      'Bring Pilze und Beeren — Baba kocht was!',
      'In Serbien gab es auch magische Waelder!',
      'Svaka cast! Du bist so tapfer, Emilia!',
      'Baba hat Pita gemacht — frisch aus dem Ofen!',
      'Ko rano rani, dve srece grabi! Frueh aufstehen bringt Glueck!',
      'Jesi gladna? Baba kocht genug fuer alle!',
      'Volim te, moja mala! Du bist Babas Schatz!'
    ],
    friendshipDialogs: {
      1: [
        'Moja mala! Dodji, Baba hat was Leckeres am Feuer!',
        'Svaka cast, Emilia! Du wirst jeden Tag tapferer!',
        'Baba erzaehlt dir eine Geschichte aus Serbien!'
      ],
      2: [
        'Zlato moje! Baba hat Pita gebacken — nur fuer dich!',
        'Du bist wie die Heldinnen aus Babas Geschichten!',
        'Hajde, probier mal! Baba kocht mit ganz viel Liebe!'
      ],
      3: [
        'Volim te najvise na svetu! Baba liebt dich am meisten!',
        'Moja najdraza unuka! Du bist Babas ganzer Stolz!',
        'Baba ist so gluecklich mit dir! Ti si moje sunce!'
      ]
    }
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
    favoriteGifts: ['crystal', 'magic_herb'],
    dialogs: [
      'Einhoerner verstecken sich! Mein Deda hat davon erzaehlt!',
      'Donesi mi kristale! Bring Kristalle aus der Hoehle!',
      'Mit Kristallen braue ich Zaubertranke!',
      'Ueber den Wolken gibt es ein Schloss!',
      'Bravo! Du bist mutig! Deda ist stolz!',
      'Der Zmaj ist ein Drache der die Guten beschuetzt!',
      'Moja unuka! Du hast das Herz einer Heldin!',
      'Bring Zutaten — Deda braut Zaubertranke!'
    ],
    friendshipDialogs: {
      1: [
        'Bravo, moja unuka! Deda hat neue Geschichten fuer dich!',
        'Donesi kristale — Deda zeigt dir echte Magie!',
        'Du erinnerst mich an den tapferen Kraljevic Marko!'
      ],
      2: [
        'Moja mala carobnica! Du bist eine echte Zauberin!',
        'Deda verraet dir das Geheimnis der Kristallkugel!',
        'Svaka cast! Du bist mutig wie ein Zmaj!'
      ],
      3: [
        'Ponosan sam na tebe! Deda ist so stolz auf dich!',
        'Du bist die groesste Heldin die Deda je gesehen hat!',
        'Moja najdraza! Deda liebt dich ueber alles!'
      ]
    }
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
    favoriteGifts: ['pearl', 'sapphire'],
    dialogs: [
      'Hey! Willst du was verkaufen? Ich kauf alles!',
      'Wenzl musste Hausaufgaben machen. Ich nicht! Hehe!',
      'Zeig mal was du hast! Ich sammle alles!',
      'Ich bin der beste Haendler! Naja, der einzige.',
      'Fuer Kristalle zahle ich extra viel!',
      'Brauchst du Muenzen? Bring mir Sachen!',
      'Du bist meine beste Kundin! Und einzige... hehe!'
    ],
    friendshipDialogs: {
      1: [
        'Hey Emilia! Fuer dich mach ich Sonderpreise!',
        'Du bist meine Lieblingskundin! Ehrenwort!',
        'Ich hab was Cooles gefunden — willst du tauschen?'
      ],
      2: [
        'Psst! Ich hab besondere Ware nur fuer Freunde!',
        'Du und ich, wir machen die besten Geschaefte!',
        'Fuer meine beste Freundin gibt es Rabatt!'
      ],
      3: [
        'Emilia! Du bist nicht nur Kundin, du bist Familie!',
        'Alles was ich hab, teil ich mit dir!',
        'Du bist die coolste Person im ganzen Dorf!'
      ]
    }
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
