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
      'Hast du schon Opa besucht? Er braucht Holz fuer seine Werkstatt!',
      'Hast du heute schon was gegessen? Ich hab Kuchen gebacken!',
      'Pass auf dich auf da draussen, mein Schatz! Und komm zum Essen zurueck!',
      'Emilia, du bist so mutig! Mama ist stolz auf dich!',
      'Wenn du muede bist, komm nach Hause — ich mach dir heissen Kakao.',
      'Die Blumen im Wald sehen krank aus... vielleicht kannst du ihnen helfen?',
      'An meinem Kochtopf kannst du leckere Sachen zubereiten! Bring einfach Zutaten mit!'
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
      'Wenn du Erz aus der Hoehle mitbringst, schmieden wir zusammen ein starkes Schwert!',
      'Leertaste zum Kaempfen — vergiss das nicht, Emilia!',
      'Weisst du, als ich klein war, hab ich auch Monster gejagt. Naja... kleine Monster.',
      'Ich hab das ganze Dorf mit meinen Haenden gebaut! Na gut, Opa hat geholfen.',
      'Wenn du dich verletzt hast, geh zu Mama — sie kocht dir was Gutes!',
      'Die Hoehle im Osten hat Schaetze, aber auch Skelette. Sei vorsichtig!',
      'Papa glaubt an dich, Emilia! Du schaffst alles, was du dir vornimmst!'
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
      'Ich hab gehoert, wenn man genug Pflanzen heilt, oeffnet sich ein geheimer Weg!',
      'Glaubst du, die Einhoerner moegen Blumen? Ich hab welche gepflueckt!',
      'Lass uns zusammen den Wald erkunden! ...aber nicht zu weit, okay?',
      'Ich hab gehoert, im See gibt es einen geheimen Schatz!',
      'Emilia, du bist meine beste Freundin! Zusammen sind wir unschlagbar!',
      'Stell dir vor, wir haetten ein eigenes Einhorn! Das waere sooo toll!',
      'Ich hab gestern von einem fliegenden Einhorn getraeumt... vielleicht gibt es die wirklich?'
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
      'Papa Milos hat mir das Fischen beigebracht. Du schaffst das auch!',
      'Ich hab ein Monster gesehen! ...naja, vielleicht war es doch nur ein Busch.',
      'Wenn ich gross bin, werde ich ein Ritter! Oder ein Astronaut. Oder beides!',
      'Hast du schon die Hoehle erkundet? Da drin ist es gruselig! Aber auch spannend!',
      'Komm, wir machen ein Wettrennen zum See! Eins, zwei, drei... los!',
      'Ich hab am See einen riesigen Fisch gesehen! Der war bestimmt so gross wie ich!',
      'Emilia, weisst du was cool waere? Wenn wir ein Baumhaus bauen!'
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
      'Die Natur hat viele Geheimnisse — schau dich ueberall gut um!',
      'Frueher hat mir meine Oma das Gaertnern beigebracht. Jetzt zeig ich es dir!',
      'Jede Blume hat eine Geschichte, Emilia. Man muss nur genau hinhoeren.',
      'Weisst du, Pflanzen sind wie kleine Freunde — sie brauchen Liebe und Pflege.',
      'Oma hat frische Kekse gebacken! Magst du einen? Natuerlich magst du!',
      'Im Wald wachsen besondere Krauter. Sammel sie und bring sie zu Deda!',
      'Du hast gruene Daumen, mein Liebling! Genau wie deine Oma!'
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
      'Du bist fleissig wie eine Biene! Weiter so, Emilia!',
      'An meiner Werkbank kannst du tolle Sachen bauen! Versuch es mal!',
      'Ich hab als Kind auch immer mit Holz gespielt. Daraus wurde dann ein ganzes Haus!',
      'Weisst du, was das Geheimnis eines guten Handwerkers ist? Geduld! Und gutes Holz.',
      'Wenn du Bretter brauchst, bring Holz zur Saege — Opa macht das fuer dich!',
      'Frueher gab es hier nur Wald und Wiese. Jetzt steht ein ganzes Dorf!',
      'Emilia, du erinnerst mich an mich als Kind — immer neugierig und voller Energie!'
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
      'Svaka cast, Emilia! Du bist so tapfer! Baba ist sehr stolz auf dich!',
      'Moja mala Emilia! Komm, Baba hat Pita gemacht — frisch aus dem Ofen!',
      'In Serbien sagen wir: Ko rano rani, dve srece grabi! Wer frueh aufsteht, fängt doppeltes Glueck!',
      'Baba vermisst die Berge manchmal... aber mit dir ist es ueberall schoen, zlato!',
      'Jesi gladna? Baba kocht immer genug fuer alle! Komm, iss etwas!',
      'Ach, Emilia! Du bist Babas groesster Schatz. Volim te, moja mala!',
      'Frueher hat Baba am Lagerfeuer Geschichten erzaehlt. Soll ich dir eine erzaehlen?'
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
      'Hoch ueber den Wolken gibt es ein Schloss... aber nur die Mutigsten finden es!',
      'Bravo, Emilia! Du bist ein mutiges Maedchen! Deda ist stolz auf dich!',
      'In Serbien erzaehlt man sich von Zmaj — dem Drachen, der die Guten beschuetzt.',
      'Deda kennt viele alte Geschichten. Soll ich dir von der goldenen Aepfeln erzaehlen?',
      'Moja unuka! Meine Enkelin! Du hast das Herz einer echten Heldin!',
      'Am Alchemie-Tisch kann Deda Zaubertranke brauen. Bring mir Zutaten aus dem Wald!',
      'Fruher hat Deda Sterne gezaehlt und sich Geschichten dazu ausgedacht. Magst du Sterne?'
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
    x: 17, y: 15,
    direction: 'down',
    dialogs: [
      'Hey Emilia! Willst du was verkaufen? Ich kauf alles!',
      'Mein Bruder Wenzl wollte auch mitkommen, aber er musste Hausaufgaben machen.',
      'Ich sammle alles Moegliche! Zeig mal was du hast!',
      'Weisst du noch, im Kindergarten? Da hab ich immer Sticker getauscht!',
      'Ich bin der beste Haendler im ganzen Dorf! Naja... der einzige.',
      'Fuer seltene Sachen zahle ich extra viel! Kristalle sind mega cool!',
      'Wenzl sagt, ich soll sparen. Aber Sammeln macht viel mehr Spass!',
      'Wenn du Muenzen brauchst, bring mir einfach Sachen aus dem Wald!',
      'Ich hab sogar einen eigenen Laden! Na gut, es ist nur ein Tisch...',
      'Emilia, du bist meine beste Kundin! Und meine einzige... hehe!'
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
