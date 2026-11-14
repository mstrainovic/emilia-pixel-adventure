# Emilia 2.0 — Etappe 1b: Gespräche, Anzeige und Touch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das begehbare Dorf aus Plan 1a wird zum Anfassen: mit den Dorfbewohnern reden (höchstens zwei kurze Zeilen, überspringbar), die erste Aufgabe erledigen, Freundschaft sammeln, Herzen, Level, Münzen, Aufgabe und Schnellleiste sehen — alles aus einem Oberflächen-Baukasten und vollständig per Touch bedienbar. Der Spielstand lässt sich als Datei sichern und wieder laden.

**Architecture:** Die umziehende Spiellogik (Rucksack, Aufgaben, Freundschaft, Spieltag, Gespräche) liegt als reine Funktionen in `v2/src/systems/`. Eine schmale `GameSession` ruft sie auf und meldet Änderungen über den typisierten Ereignisverteiler; Oberfläche, Speichern und Szene hören nur dort zu. Die Oberfläche ist HTML/CSS über dem Spielbild, gebaut aus festen Bausteinen (Farben, vier Schriftgrößen, Abstände, ein Fenster-, ein Knopf-Stil).

**Tech Stack:** wie Plan 1a. Neu: `@fontsource/nunito` (runde Leseschrift, SIL Open Font License, wird lokal mit ausgeliefert). Sonst keine neuen Pakete; Oberflächen-Verhalten wird im Browser-Test geprüft, nicht mit einer DOM-Nachbildung.

**Spec:** `docs/superpowers/specs/2026-11-13-emilia-2-ueberarbeitung-design.md` — zweite Hälfte von Etappe 1 (Abschnitt 12), mit den Regeln aus 6.7 (Aufgaben, Freundschaft, „Tod der Dialogwand"), 8.3 (Dorfbewohner drehen sich), 9 und 10.

**Voraussetzung:** Plan 1a (`2026-11-13-emilia-2-etappe-1a-einstieg-und-welt.md`) ist umgesetzt. **Vor Task 1** den Abschluss-Abschnitt von Plan 1a lesen; weichen dort Namen oder Signaturen von den hier unter „Consumes" genannten ab, gelten die aus dem Abschluss, und dieser Plan wird an der Stelle angepasst, bevor der Task beginnt.

Es gelten die „Vorgaben des Auftraggebers vom 2026-11-13" aus Plan 1a: der alte Spielstand wird übernommen, eine Sicherungsdatei von Emilias Gerät gibt es nicht; gespielt wird am PC und am iPad (alle Browser-Tests laufen in Chromium und WebKit; das iPad in beiden Lagen).

## Global Constraints

- Alle Global Constraints aus Plan 1a gelten unverändert (nie auf `main`, Push nur mit Freigabe, Commit-Abschlusszeile, alte Schlüssel nur lesen, keine externen Anfragen, CSP wörtlich, Umlaute, unter 500 Zeilen, Artefakte nach `test-artifacts/`, Phaser-4-Dokumentation lesen, nie `git add -A`, Grafik nur aus dem Pack, Alt-Werte aus dem alten Code mit Quelle). Branch für diesen Plan: `v2/etappe-1b-oberflaeche`.
- **Oberfläche:** Farben nur über die Farb-Variablen aus `tokens.css`; Schriftgröße nur über `--fs-1` bis `--fs-4` (16, 20, 24, 32 px); Fließtext mindestens 16 px in der Leseschrift; die Pixelschrift des Packs nur für Ziffern. Tippflächen mindestens 48 × 48 CSS-Pixel. Pixelbilder in der Oberfläche werden nur ganzzahlig vergrößert.
- **Begriffe im Bild:** Aufgabe, Erfolge, Herstellen, Gegenstand, Rucksack. Keine internen Kennungen im Bild. Alle Texte der Oberfläche stehen in `v2/src/data/texts.ts`.
- **Gespräche:** höchstens zwei Zeilen zu je höchstens 36 Zeichen, mit einem Tastendruck oder Tippen beendet.
- Kein neuer Gegenstand, keine neue Aufgabe, keine neue Karte in diesem Plan (`formatVersion` bleibt 1; neue Felder nur mit sicherer Vorgabe, danach `npm run save:fingerprint`).

## Review Focus

1. **Rucksack ist voll, wenn eine Belohnung kommt:** Die Aufgabe gilt als erledigt, nichts geht verloren, die Belohnung kommt nach, sobald Platz ist. → Tests in Task 1 und Task 2.
2. **Taste wird gehalten oder doppelt gedrückt beim Reden:** Das Gespräch öffnet einmal, schließt beim nächsten Druck und öffnet nicht sofort wieder. → Test in Task 7.
3. **Zwei Finger zugleich, Finger rutscht aus dem Stick, Anruf oder Systemgeste bricht die Berührung ab:** Emilia bleibt stehen, sobald der Stick-Finger weg ist; der Knopf rechts geht, während links gesteuert wird. → Tests in Task 8.
4. **Fenstergröße oder Skalierung ändert sich, während ein Fenster oder Gespräch offen ist:** Die Oberfläche passt sich an, das Spiel bleibt angehalten, nichts hängt. → Test in Task 5.
5. **Eine Figur der Karte hat keinen Eintrag in den Daten, oder ein Gegenstand hat kein Symbol:** kein Absturz; die Figur wird nicht ansprechbar, der Gegenstand zeigt das neutrale Beutel-Symbol aus dem Pack. → Tests in Task 6 und Task 7.

---

## Dateiübersicht

| Datei (unter `v2/`) | Aufgabe |
|---|---|
| `src/systems/inventory.ts`, `progress.ts` | Rucksack (ablegen, zählen, Schnellleiste), Erfahrung und Herzen |
| `src/systems/quests.ts`, `src/data/quests.ts` | Aufgaben-Grundlogik; wer welche Aufgabe vergibt |
| `src/systems/dayclock.ts`, `friendship.ts` | Spieltag; Freundschaft beim Reden und bei Aufgaben |
| `src/systems/dialogue.ts`, `interaction.ts` | Zeilenwahl und Umbruch; wer oder was gerade ansprechbar ist |
| `src/core/session.ts`, `src/core/events.ts` | Spielsitzung: ruft die Logik, meldet Ereignisse |
| `src/data/texts.ts`, `src/data/icons.ts` | alle Oberflächen-Texte; Symbol je Gegenstand |
| `src/ui/tokens.css`, `kit.css`, `fonts.css` | Baukasten: Farben, Größen, Abstände, Fenster, Knopf, Schriften |
| `src/ui/root.ts`, `windows.ts`, `el.ts` | Oberflächen-Wurzel mit Maßstab; Fenster-Verwalter |
| `src/ui/hud.ts`, `hotbar.ts`, `dialogueBox.ts`, `toasts.ts`, `menu.ts`, `help.ts` | Anzeige, Schnellleiste, Gespräch, Hinweise, Menü, Hilfe |
| `src/input/touch.ts`, `src/ui/touchControls.ts`, `src/ui/rotateHint.ts` | Touch-Quelle, Stick und Knöpfe, Dreh-Hinweis |
| `src/save/file.ts`, `src/ui/backup.ts` | Spielstand als Datei sichern und laden, Erinnerung daran |
| `src/entities/Villager.ts`, `src/scenes/WorldScene.ts` | Dorfbewohner drehen sich, Aufgaben-Symbol; Verdrahtung |

---

## Vorab aus der Schlussprüfung von 1a (vor Task 1 einplanen)

Die Schlussprüfung von Plan 1a (2026-11-14) hat Punkte benannt, die in 1a noch nichts kosten, aber mit Aufgaben, Freundschaft, Touch und dem Laden aus Datei gefährlich werden. Sie gehören an den Anfang dieses Plans und brauchen je eigene Tests. **Dieser Abschnitt ist eine Auftragsliste, noch keine ausgearbeitete Task-Folge** — vor der Ausführung von 1b als „Task 0" ausarbeiten (Dateien, Schnittstellen, Tests) und die Schnittstellen unten in den betroffenen Tasks nachziehen.

1. **Zwei offene Tabs überschreiben sich still** (`v2/src/save/store.ts`, `service.ts`). `save()` sperrt nur bei neuerer Version. Ein alter Tab im Hintergrund speichert alle 60 s und beim Schließen seinen veralteten Stand über den Fortschritt des neuen. Abhilfe: `save()` liest den Eintrag ohnehin — gespeichertes `savedAt` mit dem zuletzt selbst gelesenen oder geschriebenen vergleichen, bei Abweichung nicht schreiben und ein eigenes Ergebnis melden (neuer Fall in `SaveResult`; Hinweis in Task 9).
2. **Reparatur verliert still** (`v2/src/save/normalize.ts`, `legacy.ts`). Eine aktive Aufgabe mit ungültigem `progress` verschwindet ohne Bericht; ebenso Überlauf ab Platz 96, Kürzen auf `stackSize`, ungültige Stückzahlen. Abhilfe vor Task 2: Aufgabe mit `progress: 0` behalten (wie die Übernahme es tut); jeder stille Verlust setzt `lossy`, damit der Rohtext gesichert wird.
3. **Der Start meldet eine Reparatur mit Verlust niemandem** (`v2/src/core/services.ts`). Bei `ok` mit `repair.lossy` ist der Hinweis `null`; bei „kaputt + Übernahme gelungen" bleibt nur `save-corrupt`, und Task 9 würde „Wir fangen neu an." zeigen, obwohl der alte Stand geholt wurde. Abhilfe: Rückgabe von `startGame` um den Reparatur-Bericht, das Ergebnis der Übernahme und das Ergebnis des Sofort-Speicherns erweitern; Task 9 bekommt die passenden Hinweise.
4. **Ersetzen und Neuladen wird vom eigenen Speichern überschrieben.** Task 9 und Task 10 sehen „`replaceWith`, dann Seite neu laden" vor; der Empfänger für `pagehide` speichert beim Neuladen den alten Stand aus dem Arbeitsspeicher über den gerade ersetzten. Abhilfe im Plantext beider Tasks: vor dem Neuladen `save.stop()` rufen (oder `services.state` ersetzen), mit Test.
5. **Kriechen an der Wand mit laufender Animation** (Task 8, Touch). Außerhalb der Rutschzone lässt eine winzige Querkomponente die Figur an der Wand kriechen, `moving` bleibt wahr. Die Tastatur kann das nicht auslösen, der Stick schon. Abhilfe: `moving` an der wirklichen Bewegung festmachen oder den Stick-Winkel rasten.
6. **Tastatur und HTML-Oberfläche** (Task 5). `KeyboardSource` unterdrückt Enter und Leertaste am Fenster; HTML-Knöpfe wären damit nicht per Tastatur auslösbar. Entweder bewusst über `InputHub.consume('confirm')` lösen oder Ereignisse aus Bedienelementen ausnehmen.
7. **Zeiger-Abbildung** (Task 5, Task 8). `PixelGrid.cssToView` liefert ungerundete Werte, die knapp unter 0 oder über der Breite liegen können; der Vertrag steht nicht im Kommentar, die Klasse hat keine Unit-Tests.
8. **Begehbare Objekte** (vor Task 7 mit dem Auftraggeber entscheiden). Zäune, Truhen, Wegweiser, Büsche und Hühner sind wie im alten Spiel durchlaufbar. Sollen sie sperren, steigt die Obergrenze 40 in `COLLISION_CHANGES`. Das Trophäenregal ist schon gesperrt und wird von der Nachbarkachel bedient.
9. **Tests nachziehen:** Einheit von `distanceWalked` nach oben begrenzen; Browser-Test für einen Speicher, dessen `getItem` wirft; gespeicherter v2-Ort in einer Wand im Browser; eine Vorlage in echter New-Game-Plus-Form in die Verstümmelungs-Schleife; Fingerabdruck des Spielstands erfasst nur oberste Schlüssel (verschachtelte neue Felder lösen keinen Alarm aus).
10. **Liste der serbischen Sätze** (`test-artifacts/texte/serbisch.md`, 25 Sätze): Der Satz „Bravo! Du bist mutig! Deda ist stolz!" fehlt dort ohne Vermerk; beim Gegenlesen am Ende dieses Plans mit vorlegen. Offen für den Auftraggeber: ekavisch oder ijekavisch („dve", „na svetu"), Schreibung von „Pita".

---

### Task 1: Rucksack, Erfahrung und Herzen (reine Logik)

**Files:**
- Create: `v2/src/systems/inventory.ts`, `v2/src/systems/progress.ts`, `v2/tests/systems/inventory.test.ts`, `v2/tests/systems/progress.test.ts`
- Modify: `v2/src/core/state.ts`, `v2/src/save/normalize.ts`, `v2/tests/core/state.test.ts`, `v2/tests/save/format-fingerprint.json`

**Interfaces:**
- Produces:
  ```ts
  // state.ts: neues Feld mit Vorgabe []
  pendingItems: Array<{ itemId: string; count: number }>;   // Belohnungen, die noch keinen Platz hatten
  // inventory.ts
  export function addItem(state: GameState, itemId: string, count: number): number;   // liefert den Rest, der nicht passte
  export function countItem(state: GameState, itemId: string): number;
  export function hotbarSlots(state: GameState): ReadonlyArray<{ itemId: string | null; count: number }>;   // Plätze 0–7
  export function selectHotbar(state: GameState, index: number): boolean;   // false außerhalb 0–7
  export function deliverPending(state: GameState): boolean;                // true, wenn etwas abgelegt wurde
  // progress.ts
  export function maxHp(state: GameState): number;                          // heartsForLevel(level) × 4
  export function heartQuarters(state: GameState): number[];                // je Herz 0…4, Länge = Anzahl Herzen
  export function addXp(state: GameState, amount: number): { levelsGained: number };
  ```
- Alt-Quelle Rucksack: `src/systems/Inventory.js`, `addItem` Zeilen 23–52 (erst vorhandene Stapel bis `stackSize` füllen, dann leere Plätze von vorn), `selectHotbar` Zeilen 143–148. Alt-Quelle Startausrüstung: `src/core/Game.js` Zeile 368 (`addItem('sword_wood', 1)`).
- Ein neues Spiel beginnt mit dem Holzschwert auf Platz 0. Bei einem Stufenaufstieg werden die Herzen ganz aufgefüllt.

- [ ] **Step 1: Tests schreiben.**
  - `addItem(state, 'berry', 5)` in ein neues Spiel → Rest 0, Platz 1 = `{ berry, 5 }` (Platz 0 hält das Schwert).
  - Stapeln: Platz 1 hält `berry` mit `stackSize − 2`; `addItem(…, 'berry', 5)` → Platz 1 voll, 3 im nächsten freien Platz.
  - Unbekannte Kennung → Rest = `count`, nichts geändert. `count` ≤ 0 oder keine ganze Zahl → Rest 0, nichts geändert.
  - Alle 48 Plätze belegt (kein passender Stapel) → Rest = `count`.
  - `deliverPending`: `pendingItems = [{ berry, 5 }]`, Rucksack voll → `false`, unverändert; ein Platz frei → `true`, Beeren im Rucksack, `pendingItems` leer (Review Focus 1).
  - `selectHotbar(state, 3)` → `true`, `selectedHotbar === 3`; `8`, `-1`, `1.5` → `false`, unverändert.
  - `heartQuarters`: Level 1, `hp` 20 → `[4, 4, 4, 4, 4]`; `hp` 9 → `[4, 4, 1, 0, 0]`; Level 5, `hp` 24 → sechs Einträge.
  - `addXp`: Level 1, `xp` 0, `+20` → Level 1, `xp` 20; `+60` → Level 2, `xp` 10 (Bedarf 50), `levelsGained: 1`, `hp === maxHp`; `+10000` von Level 29 → Level 30, `xp` 0; negative oder nicht endliche Menge → nichts.
  - `createNewGameState`: Platz 0 = `{ sword_wood, 1 }`, `pendingItems` = `[]`. `normalizeState` ergänzt ein fehlendes `pendingItems` zu `[]` und entfernt Einträge mit unbekannter Kennung (als `droppedItems`).
- [ ] **Step 2: Tests schlagen fehl** — `cd v2 && npx vitest run tests/systems tests/core tests/save`
- [ ] **Step 3: Umsetzen**, danach `npm run save:fingerprint` (neues Feld mit Vorgabe: Regel 1, keine neue Version).
- [ ] **Step 4: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 5: Commit** — `git add v2/src/systems v2/src/core/state.ts v2/src/save/normalize.ts v2/tests` · `feat(v2): Rucksack-Logik, Erfahrung und Herzen`

---

### Task 2: Aufgaben-Grundlogik

**Files:**
- Create: `v2/src/systems/quests.ts`, `v2/tests/systems/quests.test.ts`
- Modify: `v2/src/data/quests.ts`, `v2/tests/data/parity.test.ts`

**Interfaces:**
- Consumes: `addItem`, `addXp` (Task 1), `QUESTS`, `QUEST_ORDER`.
- Produces:
  ```ts
  // data/quests.ts
  export const QUEST_GIVERS: Readonly<Record<string, string>>;   // Aufgabe → Dorfbewohner
  // quests.ts
  export type QuestSignal = { type: 'talk' | 'collect' | 'heal' | 'craft' | 'visit' | 'pet'; target: string; amount: number };
  export interface QuestChange { questId: string; progress: number; count: number; completed: boolean; xp: number; levelsGained: number }
  export function ensureActiveQuest(state: GameState): QuestChange[];   // sorgt dafür, dass die erste offene Aufgabe aktiv ist
  export function reportSignal(state: GameState, signal: QuestSignal): QuestChange[];
  export function currentQuest(state: GameState): { def: QuestDef; progress: number } | null;   // erste aktive in QUEST_ORDER
  ```
- Alt-Quelle: `src/systems/Progression.js` — Reihenfolge Zeilen 6–16; Zählen und Abschließen `_checkQuestType` Zeilen 290–314 (Ziel passt, wenn `def.target === target` oder `def.target === 'any'`); nächste Aufgabe `_unlockNextQuest` Zeilen 316–325; Vorbelegen aus schon Erlebtem `_prepopulateQuestProgress` Zeilen 331–400; erste Aufgabe `initNewGame` Zeilen 506–509 (`first_steps`). Aufgabengeber: `src/systems/FriendshipSystem.js`, `QUEST_NPC_MAP` Zeilen 38–64.
- Regeln: Beim Abschluss wandert die Aufgabe nach `completedQuests` (in der Reihenfolge von `QUEST_ORDER`) und verschwindet aus `activeQuests`; `xpReward` über `addXp`; `itemReward` über `addItem`, der Rest nach `pendingItems`; die nächste Aufgabe wird aktiv und aus den Zählern vorbelegt (`talk` aus `stats.npcsSpoken`, `collect` aus `stats.itemsCollected`, `heal` aus `stats.plantsHealed`, `craft` aus `stats.itemsCrafted`, `pet` aus `stats.unicornsPetted`, `visit` aus `visitedMaps`); ist sie dadurch schon erfüllt, schließt sie sofort ab (Kette, höchstens 25 Runden). Ein `talk`-Signal trägt den Dorfbewohner in `stats.npcsSpoken` ein. Aufgabentypen außerhalb von `QuestSignal` (`kill`, `fish`, `boss` …) werden aktiv, zählen aber erst in ihren Etappen.

- [ ] **Step 1: Tests schreiben.**
  - Neues Spiel: `ensureActiveQuest` → `activeQuests` = `{ first_steps: { progress: 0 } }`; zweiter Aufruf ändert nichts.
  - `reportSignal({ type: 'talk', target: 'oma', amount: 1 })` → keine Änderung an Aufgaben, `npcsSpoken` enthält `oma`.
  - `reportSignal({ type: 'talk', target: 'mama_tanja', amount: 1 })` → ein `QuestChange` `{ questId: 'first_steps', completed: true, xp: 20, levelsGained: 0 }`; danach `completedQuests` = `['first_steps']`, `xp` 20, fünf Beeren im Rucksack, `activeQuests` = `{ wood_collector: { progress: 0 } }` (Werte aus `v2/src/data/quests.ts`: `xpReward: 20`, `itemReward: [{ berry, 5 }]`).
  - Voller Rucksack beim selben Signal → Aufgabe erledigt, `pendingItems` = `[{ berry, 5 }]` (Review Focus 1).
  - Vorbelegen: Stand ohne aktive Aufgabe, `npcsSpoken: ['mama_tanja']` → `ensureActiveQuest` schließt `first_steps` ab und aktiviert `wood_collector`.
  - Vorbelegen mit Kette: zusätzlich `itemsCollected: { wood: 9 }` → auch `wood_collector` erledigt (Bedarf 5), `nature_healer` aktiv.
  - Signal mit `amount` 0, negativ oder `NaN` → nichts. Alle 25 Aufgaben erledigt → `ensureActiveQuest` liefert `[]`, `currentQuest` `null`.
  - `parity.test.ts`: `QUEST_GIVERS` ist gleich dem aus `FriendshipSystem.js` gelesenen `QUEST_NPC_MAP` (Block per regulärem Ausdruck ausschneiden wie beim bestehenden Test für `QUEST_ORDER`); jeder Geber ist eine Kennung aus `NPCS`, jede Aufgabe eine aus `QUESTS`.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen.
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 4: Commit** — `git add v2/src/systems/quests.ts v2/src/data/quests.ts v2/tests` · `feat(v2): Aufgaben-Grundlogik mit Vorbelegen und Belohnungen`

---

### Task 3: Spieltag und Freundschaft

**Files:**
- Create: `v2/src/systems/dayclock.ts`, `v2/src/systems/friendship.ts`, `v2/tests/systems/dayclock.test.ts`, `v2/tests/systems/friendship.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // dayclock.ts
  export const PHASE_SECONDS = 187.5; export const DAY_SECONDS = 750;
  export function advanceClock(state: GameState, dt: number): void;   // dt auf 0…1 s begrenzt
  export function dayNumber(state: GameState): number;                // floor(totalTime / 750)
  // friendship.ts
  export const FRIEND_THRESHOLDS = [0, 20, 50, 80] as const;
  export const TALK_POINTS = 2; export const QUEST_POINTS = 10; export const MAX_POINTS = 100;
  export type FriendLevel = 0 | 1 | 2 | 3;
  export function friendshipLevel(points: number): FriendLevel;
  export interface FriendChange { npcId: string; gained: number; points: number; level: FriendLevel; levelUp: boolean }
  export function talkFriendship(state: GameState, npcId: string, day: number): FriendChange;   // gained 0, wenn heute schon geredet
  export function questFriendship(state: GameState, questId: string): FriendChange | null;      // null ohne Geber
  ```
- Alt-Quellen: `src/systems/DayNight.js` (`PHASE_DURATION = 187.5`, vier Phasen, Start in Phase 1); `src/systems/FriendshipSystem.js` (Schwellen Zeile 35; Reden +2 einmal je Tag, Zeilen 85–91; Aufgabe +10, Zeilen 126–131; Höchstwert 100).
- Bewusste Abweichung vom alten Spiel: Dort wurde als Tag immer 0 übergeben (`src/core/Game.js` Zeile 278, `this.dayNight?.day || 0` — das Feld `day` gibt es nicht), Reden zählte also nur ein einziges Mal. Ab jetzt zählt es wie in Spec 6.7 einmal je Spieltag.

- [ ] **Step 1: Tests schreiben.**
  - Uhr: 187,5 s in Schritten von 0,5 s → `phaseIndex` von 1 auf 2, `phaseTime` 0 (± 0,01); nach 750 s wieder Phase 1 und `dayNumber` 1; `dt` 5 zählt als 1; `dt` negativ oder `NaN` → nichts.
  - Stufen: 0 → 0, 19 → 0, 20 → 1, 49 → 1, 50 → 2, 80 → 3, 100 → 3.
  - Reden: neuer Dorfbewohner, Tag 0 → `{ gained: 2, points: 2, level: 0, levelUp: false }`, `lastTalkDay` 0; noch einmal Tag 0 → `gained: 0`; Tag 1 → `points: 4`. Von 18 auf 20 → `levelUp: true`. Bei 99 → 100, bei 100 → `gained: 0`.
  - Aufgabe: `questFriendship(state, 'first_steps')` → Mama `+10`; Kennung ohne Geber → `null`.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen.
- [ ] **Step 3: Alles grün**, **Commit** — `git add v2/src/systems v2/tests/systems` · `feat(v2): Spieltag und Freundschaft beim Reden`

---

### Task 4: Gespräche und Spielsitzung

**Files:**
- Create: `v2/src/systems/dialogue.ts`, `v2/src/core/session.ts`, `v2/tests/systems/dialogue.test.ts`, `v2/tests/core/session.test.ts`
- Modify: `v2/src/core/events.ts`, `v2/src/core/services.ts`, `v2/src/main.ts`, `v2/tests/data/text.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces:
  ```ts
  // dialogue.ts
  export const DIALOG_LINE_CHARS = 36; export const DIALOG_MAX_LINES = 2; export const TALK_COOLDOWN = 0.3;
  export function wrapLines(text: string, maxChars: number): string[];   // bricht nur an Leerzeichen
  export function pickLine(npc: NpcDef, talkCount: number, level: FriendLevel): string;
  // events.ts
  export interface GameEvents {
    'save:result': { reason: SaveReason; result: SaveResult };
    'npc:talked': { npcId: string };
    'quest:changed': QuestChange;
    'friendship:changed': FriendChange;
    'inventory:changed': Record<string, never>;
    'stats:changed': Record<string, never>;            // Herzen, Level, Erfahrung, Münzen
    'ui:paused': { paused: boolean };
    'ui:sound': { name: 'open' | 'close' | 'click' | 'quest' };   // der Ton selbst zieht in Etappe 7 um
  }
  // session.ts
  export interface TalkView { npcId: string; name: string; lines: string[] }
  export class GameSession {
    constructor(state: GameState, bus: EventBus<GameEvents>);
    start(): void;                              // ensureActiveQuest, deliverPending
    talkTo(npcId: string): TalkView | null;     // null bei unbekannter Kennung
    selectHotbar(index: number): void;
    tick(dt: number): void;                     // Uhr; versucht wartende Belohnungen abzulegen
  }
  // services.ts
  export interface Services { /* wie 1a */ session: GameSession }
  ```
- Zeilenwahl (ersetzt die alte Dialogwand; Alt-Quelle `src/systems/DialogSystem.js`: dort liefen alle Sätze nacheinander, Zeilen 98–106, und mit 50 % Zufall die Freundschafts-Sätze, Zeilen 75–96): ein Gespräch zeigt **einen** Satz. Stufe 0 → `dialogs[talkCount % n]`. Stufe 1–3 → bei geradem `talkCount` der Freundschafts-Satz `friendshipDialogs[level][(talkCount / 2) % m]`, bei ungeradem `dialogs[((talkCount − 1) / 2) % n]`. `talkCount` zählt die Sitzung je Dorfbewohner und wird nicht gespeichert.
- Ablauf von `talkTo`: Satz wählen (mit der Stufe **vor** dem Gespräch) → `reportSignal(talk)` → `talkFriendship` → für jede abgeschlossene Aufgabe `questFriendship` → Ereignisse in dieser Reihenfolge: `npc:talked`, je `quest:changed`, je `friendship:changed`, `inventory:changed` und `stats:changed` (nur wenn sich etwas geändert hat).

- [ ] **Step 1: Tests schreiben.**
  - `wrapLines('Hallo Schatz! Die Welt wartet — aber iss erstmal was!', 36)` → zwei Zeilen, jede ≤ 36 Zeichen, zusammengesetzt wieder der Satz; ein Wort länger als 36 Zeichen bleibt ungeteilt in eigener Zeile; leerer Text → `[]`.
  - `text.test.ts`, neu: jeder Satz in `dialogs` und `friendshipDialogs` aller Dorfbewohner ergibt mit `wrapLines(…, 36)` höchstens 2 Zeilen (Stand heute: 150 Sätze, längster 67 Zeichen, alle bestehen).
  - `pickLine` für Mama: Stufe 0, Zähler 0, 1, 8 → `dialogs[0]`, `dialogs[1]`, `dialogs[0]`; Stufe 2, Zähler 0 → `friendshipDialogs[2][0]`, Zähler 1 → `dialogs[0]`, Zähler 2 → `friendshipDialogs[2][1]`. Dorfbewohner ohne Sätze → `''`.
  - Sitzung, neues Spiel nach `start()`: `talkTo('mama_tanja')` → `TalkView` mit `name: 'Mama Tanja'` und 1–2 Zeilen; Ereignisfolge genau: `npc:talked`, ein `quest:changed` (`first_steps`, `completed: true`), zweimal `friendship:changed` (Reden: Punkte 2; Aufgabe: Punkte 12), `inventory:changed`, `stats:changed`. Für die neu aktive Aufgabe gibt es kein eigenes Ereignis; die Anzeige liest nach jedem `quest:changed` `currentQuest` neu.
  - `talkTo('niemand')` → `null`, kein Ereignis. Zweites Gespräch mit Mama am selben Tag → Satz `dialogs[1]`, kein `friendship:changed`.
  - `tick`: nach `tick` über zusammen 750 s und erneutem Gespräch → Punkte 14.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen; `main.ts` legt die Sitzung in `services` und ruft `start()`.
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 4: Commit** — `git add v2/src/systems/dialogue.ts v2/src/core v2/src/main.ts v2/tests` · `feat(v2): Gespräche mit einem Satz, Spielsitzung meldet Ereignisse`

---

### Task 5: Der Oberflächen-Baukasten

**Files:**
- Create: `v2/src/ui/tokens.css`, `v2/src/ui/kit.css`, `v2/src/ui/fonts.css`, `v2/src/ui/root.ts`, `v2/src/ui/el.ts`, `v2/src/ui/windows.ts`, `v2/src/data/texts.ts`, `v2/tests/guards/ui-rules.test.ts`, `v2/tests/e2e/ui.spec.ts`
- Modify: `v2/index.html` (ein `<div id="ui">` über `#game`), `v2/src/main.ts`, `v2/tools/art/selection.mjs` (`UI`), `v2/package.json`, `v2/tests/data/text.test.ts`, `v2/tests/art/manifest.test.ts`

**Interfaces:**
- Consumes: `PixelGrid.onChange`, `InputHub`, `EventBus<GameEvents>`.
- Produces:
  ```ts
  // root.ts
  export class UiRoot { constructor(host: HTMLElement, pixelGrid: PixelGrid); readonly element: HTMLElement; destroy(): void }
  // setzt auf host: --px (CSS-Länge eines Gerätepixels = 1/dpr px), --hud-px (= max(1, floor(zoom / 2)) Gerätepixel),
  // --view-x/-y/-w/-h (Kamera-Ausschnitt in CSS-Pixeln); hält sie bei jeder Änderung des Rasters aktuell
  // el.ts
  export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K];
  // windows.ts
  export interface WindowSpec { id: string; title: string; body: HTMLElement; onClose?: () => void }
  export class WindowManager {
    constructor(root: HTMLElement, bus: EventBus<GameEvents>);
    open(spec: WindowSpec): void;      // ein Fenster zur Zeit; ein zweites ersetzt das erste
    close(): void;
    get openId(): string | null;
    setPaused(reason: string, paused: boolean): void;   // auch Gespräch und Dreh-Hinweis halten das Spiel an
    get paused(): boolean;
    handleInput(input: InputHub): boolean;   // nimmt 'cancel' ab, wenn ein Fenster offen ist
  }
  // texts.ts
  export const TEXTS: { readonly [key: string]: string };
  export function hint(action: 'interact' | 'close' | 'move', device: InputDevice): string;   // InputDevice aus src/input/actions.ts
  ```
- Baukasten-Werte (verbindlich):
  - Farben, genau diese acht Variablen, Werte aus `Palette.png` des Packs: `--c-ink` (Text), `--c-paper` (Fensterfläche), `--c-wood` (Rahmen), `--c-accent` (Auswahl), `--c-heart`, `--c-coin`, `--c-ok`, `--c-shade` (Abdunklung hinter Fenstern, halb durchsichtig).
  - Schriftgrößen `--fs-1: 16px`, `--fs-2: 20px`, `--fs-3: 24px`, `--fs-4: 32px`. Abstände `--sp-1: 4px`, `--sp-2: 8px`, `--sp-3: 16px`, `--sp-4: 24px`. Tippfläche `--tap: 48px`.
  - Schriften: `--font-text: 'Nunito'` (400 und 700, Teilsätze `latin` und `latin-ext` für die serbischen Zeichen); `--font-num: 'EmiliaZahlen'` = `Ui/Font/NormalFont.ttf` aus dem Pack, per `unicode-range` auf Ziffern, `/` und `×` begrenzt.
  - Ein Fenster-Stil (Rahmen aus `Ui/Theme/Theme Wood/nine_path_panel.png` als neunteiliger Rand, Titel links oben, Schließen-Knopf ✕ immer rechts oben), ein Knopf-Stil (`button_normal.png`, gedrückt `button_pressed.png`), ein Platz-Stil (`inventory_cell.png`). Pixelbilder mit `image-rendering: pixelated`, Größen nur als ganzzahlige Vielfache von `--hud-px`.
- Fenster-Verhalten (Spec 10): schließt mit ✕, Esc und Tippen daneben; hält das Spiel an (`ui:paused`); blendet 120 ms ein und aus (bei `prefers-reduced-motion` ohne Blende); meldet `ui:sound`; der Tastaturfokus liegt im Fenster und kehrt danach zurück; beim Öffnen wird `input.reset()` gerufen, damit keine Taste klebt.

- [ ] **Step 1: Farben wählen.** Skill `ui-ux-pro-max` heranziehen: aus `Palette.png` des Packs die acht Farben so wählen, dass `--c-ink` auf `--c-paper` ein Kontrastverhältnis von mindestens 7:1 hat und `--c-accent` auf `--c-paper` mindestens 3:1; die Verhältnisse als Kommentar in `tokens.css` festhalten.
- [ ] **Step 2: Schrift einbinden.** Paket `@fontsource/nunito` installieren; in `node_modules/@fontsource/nunito/` die Lizenzdatei lesen (erwartet: SIL Open Font License 1.1) und die Dateinamen der Teilsätze nachsehen; `fonts.css` bindet nur `latin` und `latin-ext` in 400 und 700 ein. `art:build` kopiert `NormalFont.ttf` nach `gfx/ui/zahlen.ttf` und schreibt beide Schriften mit Herkunft und Lizenz nach `QUELLEN.md`. Weicht die Lizenz ab: anhalten und den Auftraggeber fragen.
- [ ] **Step 3: Tests schreiben.**
  - `ui-rules.test.ts` (liest `v2/src/ui/**`): Farbwerte (`#…`, `rgb(`, `hsl(`) stehen nur in `tokens.css`; `tokens.css` definiert genau die acht Farb-Variablen; `font-size` kommt nur als `var(--fs-1…4)` vor; `font-family` nur als `var(--font-text)` oder `var(--font-num)`; kein Emoji in `src/ui` und `src/data/texts.ts`; `kit.css` verwendet `env(safe-area-inset-top)`, `-right`, `-bottom` und `-left`.
  - `text.test.ts`: `TEXTS` wird mitgesammelt (Umlaut-Regeln gelten); die Wörter „Quest", „Item", „Inventar", „Crafting", „Achievement" kommen als ganze Wörter in keinem Text aus `TEXTS` vor.
  - `ui.spec.ts`: nach dem Start ist `document.fonts.check('16px Nunito')` wahr und alle Anfragen gingen an die eigene Adresse. Testfenster über den Test-Zugang öffnen (`openTestWindow()`): sichtbar, Titel in `--fs-3`, ✕ rechts oben mit mindestens 48 × 48 CSS-Pixeln; `D` bewegt Emilia nicht; Esc schließt, danach bewegt `D` wieder; erneut öffnen, daneben klicken → zu; erneut öffnen, ✕ → zu. Während das Fenster offen ist, Fenstergröße auf 1024×768 und danach auf 811×375 ändern → das Fenster bleibt jedes Mal ganz im Bild, das Spiel bleibt angehalten, Esc schließt weiter (Review Focus 4).
  - `ui.spec.ts`, Maßstab: bei Dichte 1, 1,25 und 1,5 ist `--hud-px × devicePixelRatio` eine ganze Zahl ≥ 1 (± 0,01).
- [ ] **Step 4: Tests schlagen fehl**, dann umsetzen. `WorldScene.update`: Schritt 2 der Reihenfolge aus Plan 1a ist jetzt `windows.handleInput(input)`; bei `windows.paused` entfallen Spielerin und Uhr, Kamera und Zeichnen laufen weiter.
- [ ] **Step 5: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e && npm run test:bundle`
- [ ] **Step 6: Commit** — `git add v2/src/ui v2/src/data/texts.ts v2/index.html v2/src/main.ts v2/src/scenes v2/tools/art/selection.mjs v2/src/assets/gfx v2/tests v2/package.json v2/package-lock.json` · `feat(v2): Oberflächen-Baukasten mit Fenster-Verwalter und lokalen Schriften`

---

### Task 6: Grundanzeige und Schnellleiste

**Files:**
- Create: `v2/src/ui/hud.ts`, `v2/src/ui/hotbar.ts`, `v2/src/data/icons.ts`, `v2/tests/data/icons.test.ts`, `v2/tests/e2e/hud.spec.ts`
- Modify: `v2/tools/art/selection.mjs` (`UI`), `v2/src/main.ts`

**Interfaces:**
- Consumes: `heartQuarters`, `hotbarSlots`, `currentQuest`, `QUEST_GIVERS`, `FIGURES`, `GameSession.selectHotbar`, Ereignisse aus Task 4.
- Produces:
  ```ts
  // icons.ts
  export const ITEM_ICONS: Readonly<Record<string, string>>;   // Gegenstand → Bildname in gfx/ui
  export const FALLBACK_ICON = 'beutel';
  export function iconFor(itemId: string): string;
  // hud.ts / hotbar.ts
  export class Hud { constructor(root: HTMLElement, services: Services); refresh(): void; destroy(): void }
  export class Hotbar { constructor(root: HTMLElement, services: Services); refresh(): void; destroy(): void }
  ```
- Bildschirmzonen (Spec 10): oben links Herzen, darunter Level und Münzen; oben rechts die Aufgabe und der Menü-Knopf; unten Mitte die Schnellleiste. Ränder `max(var(--sp-3), env(safe-area-inset-…))`.
- Herzen aus `Ui/Receptacle/Heart.png` (80×16, fünf Zustände zu 16×16; Reihenfolge auf dem Kontaktbogen prüfen): je Herz der Zustand aus `heartQuarters`. Level: Zahl in der Ziffernschrift mit schmalem Fortschrittsbalken. Münzen: Münzbild aus `Items/Treasure/` und Zahl. Aufgabe: Gesicht des Aufgabengebers, Name der Aufgabe (`--fs-2`), Beschreibung (`--fs-1`, höchstens zwei Zeilen), bei Bedarf > 1 der Stand „0/5". Ohne aktive Aufgabe ist das Feld weg.
- Schnellleiste: acht Plätze, Symbol und (ab 2) Anzahl, der gewählte Platz mit Rahmen in `--c-accent`; Tasten 1–8 und Klick wählen; `title` und `aria-label` nennen den Namen des Gegenstands.
- Symbole in dieser Etappe für: `sword_wood`, `berry`, `wood`, `magic_herb`, `seed_carrot`, `seed_tomato` (Start und Belohnungen der ersten drei Aufgaben), aus `Items/` des Packs gewählt. Alles andere zeigt `beutel` (ein Beutel-Bild aus dem Pack). Die übrigen Symbole kommen mit dem Rucksack in Etappe 2.

- [ ] **Step 1: Tests schreiben.**
  - `icons.test.ts`: die sechs Gegenstände haben ein eigenes Symbol, das in `quellen.json` steht; `iconFor('made_up')` und `iconFor('pearl')` → `'beutel'`; `beutel` steht in `quellen.json` (Review Focus 5).
  - `hud.spec.ts`, neues Spiel: fünf volle Herzen (`aria-label` „5 von 5 Herzen"); Level „1"; Münzen „0"; Aufgabe „Guten Morgen!" mit Mamas Gesicht; Schnellleiste: Platz 1 Holzschwert, gewählt. Taste `3` → Platz 3 gewählt; Klick auf Platz 1 → Platz 1 gewählt und in `state.inventory.selectedHotbar` 0.
  - Über den Test-Zugang `hp` auf 9 setzen und `stats:changed` melden → Herzen voll, voll, viertel, leer, leer.
  - Pixelgenau bei Dichte 1, 1,25, 1,5: Breite eines Herzens × `devicePixelRatio` ist ein ganzzahliges Vielfaches von 16, linke und obere Kante × `devicePixelRatio` sind ganze Zahlen (± 0,01).
  - Kein Element der Anzeige überdeckt bei 1280×720 die Bildmitte (Rechteck 160×90 CSS-Pixel um die Mitte bleibt frei).
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen. Die Anzeige hört auf `stats:changed`, `inventory:changed`, `quest:changed` und zeichnet nur dann neu.
- [ ] **Step 3: Alles grün**, **Commit** — `git add v2/src/ui v2/src/data/icons.ts v2/tools/art/selection.mjs v2/src/assets/gfx v2/src/main.ts v2/tests` · `feat(v2): Grundanzeige mit Herzen, Level, Münzen, Aufgabe und Schnellleiste`

---

### Task 7: Reden im Dorf

**Files:**
- Create: `v2/src/systems/interaction.ts`, `v2/src/ui/dialogueBox.ts`, `v2/src/ui/toasts.ts`, `v2/tests/systems/interaction.test.ts`, `v2/tests/e2e/talk.spec.ts`
- Modify: `v2/src/entities/Villager.ts`, `v2/src/scenes/WorldScene.ts`, `v2/src/data/texts.ts`, `v2/tools/art/selection.mjs`

**Interfaces:**
- Consumes: `GameSession.talkTo`, `WindowManager.setPaused`, `InputHub.consume`, `WorldMap.npcs`, `WorldMap.exits`, `currentQuest`.
- Produces:
  ```ts
  // interaction.ts
  export const INTERACT_RADIUS = 26;   // Bildpunkte, Fußpunkt zu Fußpunkt
  export type ContextTarget = { kind: 'talk'; npcId: string } | { kind: 'exit'; target: MapId };
  export function findContext(player: { x: number; y: number; facing: Facing },
    npcs: readonly { npcId: string; x: number; y: number }[], exits: readonly WorldExit[], knownNpcIds: ReadonlySet<string>): ContextTarget | null;
  export function facingToward(from: { x: number; y: number }, to: { x: number; y: number }): Facing;
  // dialogueBox.ts
  export class DialogueBox { constructor(root: HTMLElement, services: Services, windows: WindowManager);
    show(view: TalkView, faceImage: string): void; hide(): void; get isOpen(): boolean }
  // toasts.ts
  export class Toasts { constructor(root: HTMLElement); show(text: string, icon?: string): void }   // 3 s sichtbar, höchstens zwei zugleich
  ```
- Regeln: Ansprechbar ist der nächste bekannte Dorfbewohner innerhalb von 26 Bildpunkten (das alte Spiel nahm 2 Kacheln, `src/systems/DialogSystem.js` Zeile 18; der Bildausschnitt ist jetzt kleiner); bei Gleichstand der in Blickrichtung. Steht Emilia in einem Ausgang, ist das Ziel der Ausgang. `interact` startet das Gespräch; während es offen ist, hält das Spiel an; `interact`, `confirm`, `cancel` oder Tippen beendet es; danach ist 0,3 s lang kein neues Gespräch möglich (Alt-Quelle derselben Sperre: `DialogSystem.js` Zeile 114).
- Gesprächsfeld: unten Mitte über der Schnellleiste, links das Gesicht der Figur, Name (`--fs-2`, fett), darunter die Zeilen (`--fs-2`); wächst bei Bedarf nach oben, schneidet nie Text ab. Am PC zeigt ein kleines Tasten-Bild „E" über der ansprechbaren Figur (Bild aus `Ui/Input/` des Packs), dass man reden kann.
- Dorfbewohner: dreht sich beim Gespräch zur Spielerin (`facingToward`) und danach zurück. Über dem Kopf des Dorfbewohners, zu dem die aktuelle `talk`-Aufgabe führt, schwebt ein Hinweis-Symbol aus `Ui/Emote/` (Spec 6.7).
- Hinweise: Aufgabe erledigt → „Aufgabe geschafft!" mit den Symbolen der Belohnung; Stufenaufstieg → „Level 2!"; im Ausgang → „Hier geht es bald weiter." (einmal je Betreten). Nach einer erledigten Aufgabe wird gespeichert (`save.saveNow('quest')`).

- [ ] **Step 1: Tests schreiben.**
  - `interaction.test.ts`: Figur 20 Bildpunkte entfernt → `talk`; 30 entfernt → `null`; zwei Figuren gleich weit, eine rechts, Blick nach rechts → die rechte; Figur der Karte ohne Eintrag in `knownNpcIds` → nie Ziel (Review Focus 5); Spielerin im Rechteck eines Ausgangs und keine Figur in Reichweite → `exit`. `facingToward`: Ziel weiter rechts als oben → `'right'`; genau schräg → waagrechte Richtung.
  - `talk.spec.ts`: neben Mama teleportieren → Tasten-Bild sichtbar, Symbol über Mamas Kopf sichtbar. `E` → Feld sichtbar mit „Mama Tanja" und höchstens zwei Zeilen; Mama blickt zu Emilia; `D` bewegt Emilia nicht. `E` → Feld zu; Hinweis „Aufgabe geschafft!"; Aufgabe in der Anzeige jetzt „Opas Auftrag" mit „0/5"; Schnellleiste zeigt Beeren „5"; `state.friendship.mama_tanja.points === 12`; das Symbol über Mamas Kopf ist weg.
  - `E` gedrückt halten (Wiederholung der Tastatur, 1,5 s) → das Feld öffnet genau einmal; nach dem Loslassen und einem weiteren Druck schließt es; zwei Drücke im Abstand von 100 ms nach dem Schließen öffnen es nicht erneut (Review Focus 2).
  - Zweites Gespräch am selben Tag → anderer Satz, Punkte bleiben 12. Uhr über den Test-Zugang um 750 s vorstellen → Gespräch → 14.
  - Seite neu laden → Aufgabe bleibt „Opas Auftrag", Beeren bleiben.
  - In den Nordausgang laufen → Hinweis „Hier geht es bald weiter.", die Karte wechselt nicht, kein Fehler.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen.
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e`
- [ ] **Step 4: Commit** — `git add v2/src v2/tools/art/selection.mjs v2/tests` · `feat(v2): mit den Dorfbewohnern reden, erste Aufgabe, Freundschaft`

---

### Task 8: Touch-Bedienung

**Files:**
- Create: `v2/src/input/touch.ts`, `v2/src/ui/touchControls.ts`, `v2/src/ui/rotateHint.ts`, `v2/tests/input/touch.test.ts`, `v2/tests/e2e/touch.spec.ts`
- Modify: `v2/src/ui/hotbar.ts`, `v2/src/ui/kit.css`, `v2/src/main.ts`

**Interfaces:**
- Produces:
  ```ts
  // touch.ts
  export const STICK_RADIUS = 40; export const STICK_DEAD_ZONE = 8; export const STICK_RUN_AT = 0.95;   // CSS-Pixel bzw. Anteil
  export function stickVector(originX: number, originY: number, x: number, y: number): { x: number; y: number; magnitude: number };
  export class TouchSource implements InputSource {   // device: 'touch'
    stickStart(pointerId: number, x: number, y: number): void; stickMove(pointerId: number, x: number, y: number): void;
    stickEnd(pointerId: number): void; press(action: Action): void }
  ```
- Regeln: Der Stick erscheint dort, wo der Daumen in der linken unteren Zone aufsetzt, und wirkt stufenlos (Betrag 0 unter 8 Pixel Auslenkung, 1 ab 40; ab 0,95 rennt Emilia). Er gehört genau einem Finger (`pointerId`); `pointerup`, `pointercancel` und `lostpointercapture` lassen ihn los. Rechts unten der Kontext-Knopf (64 CSS-Pixel): zeigt als Symbol, was er gerade tut (Sprechblase bei `talk`), und ist ohne Ziel blass; er löst `interact` aus. Oben rechts der Menü-Knopf (`menu`). Tippen auf einen Platz der Schnellleiste wählt ihn, 500 ms Drücken zeigt 2 s lang den Namen des Gegenstands. Die Touch-Bedienung erscheint nach der ersten Berührung (`pointerType === 'touch'`, `InputHub.device` wird `'touch'`) und verschwindet bei der nächsten Tastatureingabe; Hinweise nennen passend Taste oder Knopf (`hint`).
- Seite: `touch-action: none`, keine Textauswahl, kein Kontextmenü, kein Seiten-Zoom durch Doppeltippen im Spielbereich.
- Handy im Hochformat (`(orientation: portrait) and (max-width: 600px) and (pointer: coarse)`): ein freundlicher Dreh-Hinweis über dem ganzen Bild, das Spiel hält an (`windows.setPaused('rotate', true)`). Tablets laufen in beiden Lagen.

- [ ] **Step 1: Tests schreiben.**
  - `touch.test.ts`: `stickVector(100, 100, 104, 100)` → Betrag 0; `(100, 100, 124, 100)` → `x` 0,5 (± 0,02), `y` 0; `(100, 100, 300, 100)` → `x` 1, Betrag 1; schräg → Betrag höchstens 1. Quelle: nach `stickStart(1, …)` und `stickMove(1, …)` liefert `move` den Vektor; `stickMove(2, …)` eines fremden Fingers ändert nichts; `stickEnd(1)` → `move` 0/0; `press('interact')` ist genau einmal in `drainPressed()`; Auslenkung 0,96 → `run === true`.
  - `touch.spec.ts` (läuft in `chromium` und `webkit`, je in einem eigenen Kontext 1080×810, Dichte 2, `hasTouch`; Berührungen als `PointerEvent` mit `pointerType: 'touch'` und eigener `pointerId` je Finger, im Seitenkontext ausgelöst — das geht in beiden Browsern): Finger 1 setzt links unten auf und zieht 40 Pixel nach rechts → Emilia läuft nach rechts; halbe Auslenkung → halbes Tempo (± 20 %). Neben Mama: Finger 1 hält den Stick, Finger 2 tippt den Kontext-Knopf → Gespräch öffnet (Review Focus 3). Berührung abbrechen (`pointercancel`) → `moving === false` binnen 200 ms. Finger rutscht 300 Pixel aus der Zone → Stick bleibt bei Betrag 1 und lässt beim Abheben los.
  - Alle Knöpfe und alle acht Plätze der Schnellleiste messen mindestens 48 × 48 CSS-Pixel und überlappen einander nicht.
  - 500 ms auf Platz 1 drücken → der Name „Holzschwert" erscheint; kurzes Tippen wählt nur.
  - Nach der ersten Berührung sind Stick-Zone und Knöpfe sichtbar, das Tasten-Bild „E" nicht; nach einem Tastendruck umgekehrt.
  - Fenster 390×844 (Hochformat, Touch) → Dreh-Hinweis sichtbar, Emilia bewegt sich nicht; 844×390 → Hinweis weg; 820×1180 (Tablet hochkant) → kein Hinweis, Stick funktioniert.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen.
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e`
- [ ] **Step 4: Commit** — `git add v2/src/input v2/src/ui v2/src/main.ts v2/tests` · `feat(v2): vollständige Touch-Bedienung mit Stick, Kontext-Knopf und Dreh-Hinweis`

---

### Task 9: Menü, Hilfe, Start- und Speicher-Hinweise

**Files:**
- Create: `v2/src/ui/menu.ts`, `v2/src/ui/help.ts`, `v2/tests/e2e/menu.spec.ts`
- Modify: `v2/src/main.ts`, `v2/src/data/texts.ts`, `v2/src/scenes/WorldScene.ts`, `v2/tools/art/selection.mjs`

**Interfaces:**
- Consumes: `WindowManager`, `Toasts`, `Services.startNotice`, `Services.legacyNewer`, `SaveStore.importLegacy`, `SaveStore.replaceWith`, Ereignis `save:result`, `SaveService.consecutiveFailures`, `hint`.
- Verhalten: `menu` (Taste M, Menü-Knopf) öffnet das Fenster „Menü" mit großen Knöpfen; in dieser Etappe gibt es genau einen: „Hilfe". `help` (Taste H) öffnet die Hilfe direkt. Die Hilfe zeigt je Gerät die Bedienung als Bild mit einem Wort: am PC Tasten-Bilder aus `Ui/Input/` des Packs (laufen, rennen, reden, Schnellleiste, schließen), mit Touch Stick und Knöpfe.
- Hinweise beim Start (aus `startNotice`): `save-corrupt` → „Dein Spielstand war kaputt. Wir fangen neu an."; `save-newer` → „Bitte lade die Seite neu, damit dein Spielstand passt."; `storage-unavailable` → „Hier kann das Spiel nicht speichern."; `legacy-imported` → „Dein Spielstand aus dem alten Spiel ist da!"; `legacy-failed` → „Der alte Spielstand konnte nicht geholt werden.".
- Ist `services.legacyNewer` wahr (im alten Spiel wurde seit der letzten Übernahme weitergespielt; Spec 11.1, „Übergangszeit"), fragt beim Start ein Fenster „Im alten Spiel bist du weitergekommen. Den Stand von dort holen?" mit „Ja" und „Nein". „Ja": `importLegacy`, dann `store.replaceWith` (der bisherige v2-Stand liegt danach unter `BACKUP_SAVE_KEY`), Seite neu laden. „Nein" oder Schließen: `legacyDeclinedAt` wird der Zeitstempel des alten Stands, es wird gespeichert; gefragt wird erst wieder, wenn sich der alte Stand erneut ändert. Nach zwei fehlgeschlagenen Speicherversuchen in Folge einmal je Sitzung: „Speichern hat nicht geklappt.".
- Bildraten-Anzeige (Spec 9): Taste F2 blendet oben in der Mitte die Bilder je Sekunde ein und aus (Ziffernschrift); aus beim Start.

- [ ] **Step 1: Tests schreiben** (`menu.spec.ts`): `M` → Fenster „Menü" mit Knopf „Hilfe"; Klick → Fenster „Hilfe" mit dem Bild der Taste E und dem Wort „reden"; Esc → zu, Emilia läuft wieder. `H` öffnet die Hilfe direkt. Nach einer Berührung: Menü-Knopf → Menü → Hilfe zeigt den Stick statt der Tasten. Stand mit `formatVersion: 2` → Hinweis `save-newer` als Text sichtbar. `setItem` wirft → nach dem zweiten `saveNow()` genau ein Hinweis „Speichern hat nicht geklappt.", auch nach dem vierten Versuch nur einer. `F2` → eine Zahl zwischen 1 und 240 erscheint, `F2` → weg. Alter Stand (`LEGACY_FIRST_COMMIT` mit späterem `timestamp`) neuer als die letzte Übernahme → das Fenster mit der Frage erscheint; „Nein" → `legacyDeclinedAt` gesetzt, nach dem Neuladen keine Frage; `timestamp` des alten Stands noch einmal erhöht → die Frage kommt wieder; „Ja" → nach dem Neuladen Level 3, der vorige v2-Stand liegt unter `BACKUP_SAVE_KEY`, der alte Schlüssel ist bytegleich.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen.
- [ ] **Step 3: Alles grün**, **Commit** — `git add v2/src v2/tools/art/selection.mjs v2/src/assets/gfx v2/tests` · `feat(v2): Menü, Hilfe, Hinweise zu Start und Speichern`

---

### Task 10: Spielstand als Datei sichern und laden

**Files:**
- Create: `v2/src/save/file.ts`, `v2/src/ui/backup.ts`, `v2/tests/save/file.test.ts`, `v2/tests/e2e/backup.spec.ts`
- Modify: `v2/src/core/state.ts`, `v2/src/save/normalize.ts`, `v2/src/ui/menu.ts`, `v2/src/data/texts.ts`, `v2/tests/save/normalize.test.ts`, `v2/tests/save/format-fingerprint.json`

**Interfaces:**
- Consumes: `serializeForExport`, `parseImport`, `SaveStore.replaceWith`, `BACKUP_SAVE_KEY` (Plan 1a, Task 2), `WindowManager`, `Toasts`.
- Produces:
  ```ts
  // state.ts: neues Feld mit Vorgabe null
  lastBackupAt: number | null;                              // wann zuletzt als Datei gesichert
  // file.ts
  export const BACKUP_REMIND_DAYS = 7; export const BACKUP_FIRST_REMIND_SECONDS = 1800; export const REVOKE_DELAY_MS = 60_000;
  export function backupFilename(date: Date): string;       // emilia2-spielstand-JJJJ-MM-TT.json, lokales Datum
  export function shouldRemind(state: GameState, now: number): boolean;
  export function downloadText(doc: Document, filename: string, text: string): void;
  ```
- Alt-Quelle für Dateiname und Download: `src/utils/SaveExport.js` (Dateiname aus dem lokalen Datum, Zeilen 9–14; Download über Blob und unsichtbaren Link, Zeilen 17–28; die Adresse bleibt 60 s gültig, weil iOS vor dem Download nachfragt, Zeilen 5–6).
- Grund für diesen Task schon in Etappe 1: Safari auf dem iPad kann `localStorage` nach längerer Nichtnutzung löschen (Spec 11.1, „Schutz vor Verlust").
- Verhalten: Das Menü bekommt zwei weitere Knöpfe. „Spielstand sichern": speichert, lädt die Datei herunter, setzt `lastBackupAt`, Hinweis „Gesichert!". „Spielstand laden": Dateiauswahl (`.json`) → `parseImport`; passt die Datei nicht, Hinweis „Diese Datei passt nicht." und nichts ändert sich; passt sie, fragt ein Fenster „Diesen Spielstand laden? Der jetzige wird ersetzt." mit „Ja" und „Nein"; bei „Ja" `replaceWith` und Seite neu laden. Erinnerung einmal je Sitzung als Hinweis „Zeit für eine Sicherung: Menü, dann Spielstand sichern", wenn `shouldRemind` wahr ist: noch nie gesichert und mindestens 30 Minuten gespielt (`dayNight.totalTime ≥ 1800`), oder die letzte Sicherung ist älter als 7 Tage.

- [ ] **Step 1: Tests schreiben.**
  - `backupFilename(new Date(2026, 10, 13))` → `'emilia2-spielstand-2026-11-13.json'`.
  - `shouldRemind`: neues Spiel → `false`; `totalTime` 1800, nie gesichert → `true`; gestern gesichert → `false`; vor 8 Tagen gesichert → `true`; `lastBackupAt` in der Zukunft (Uhr verstellt) → `false`.
  - `normalizeState` ergänzt ein fehlendes `lastBackupAt` zu `null`.
  - `backup.spec.ts` (Chromium und WebKit): Menü → „Spielstand sichern" → ein Download mit Namen nach dem Muster `emilia2-spielstand-JJJJ-MM-TT.json`, Inhalt ist JSON mit `formatVersion: 1`; Hinweis „Gesichert!". Danach mit Mama reden (Aufgabe wechselt), Menü → „Spielstand laden" mit der eben gesicherten Datei → Rückfrage → „Ja" → nach dem Neuladen heißt die Aufgabe wieder „Guten Morgen!" und unter `BACKUP_SAVE_KEY` liegt der ersetzte Stand. Dasselbe mit „Nein" → nichts ändert sich. Eine Datei mit dem Inhalt `kaputt` → Hinweis „Diese Datei passt nicht.", nichts ändert sich. Stand mit `totalTime` 1800 und `lastBackupAt: null` → die Erinnerung erscheint genau einmal.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen; danach `npm run save:fingerprint` (neues Feld mit Vorgabe, keine neue Version).
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e`
- [ ] **Step 4: Commit** — `git add v2/src/save v2/src/core/state.ts v2/src/ui v2/src/data/texts.ts v2/tests` · `feat(v2): Spielstand als Datei sichern und laden, Erinnerung daran`

---

### Task 11: Durchspiel-Test

**Files:**
- Create: `v2/tests/e2e/playthrough.spec.ts`, `v2/tests/e2e/helpers/walk.ts`

**Interfaces:**
- Produces: `walkToTile(page, tileX, tileY, timeoutMs)` — hält echte Richtungstasten, bis `player()` höchstens 6 Bildpunkte neben der Kachelmitte steht (liest nur den Ort über den Test-Zugang, bewegt nicht selbst).

- [ ] **Step 1: Test schreiben.** Frischer Browser-Kontext: starten → mit `walkToTile` vom Startpunkt (19/14) über den Weg zu Mama (Kachel 8/12, eine Kachel unter ihr) → `E` → Gespräch → `E` → Aufgabe „Opas Auftrag" → `3` wählt Platz 3 → `H` → Hilfe → Esc → Seite neu laden → Ort höchstens eine Kachel daneben, Aufgabe und Beeren unverändert, Platz 3 gewählt. Über den ganzen Lauf: keine Konsolenfehler, keine fremden Anfragen, beide alten Schlüssel unverändert.
- [ ] **Step 2: Derselbe Ablauf gegen das gebaute Paket** (`playthrough.preview.spec.ts`, ohne Test-Zugang): nur Tasten und sichtbare Texte; Emilia wird mit festen Tastendauern zu Mama geführt, geprüft wird am Text der Anzeige.
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e && npm run test:bundle`
- [ ] **Step 4: Commit** — `git add v2/tests/e2e` · `test(v2): Durchspiel-Test für das Dorf`

---

### Abschluss 1b und Abschluss Etappe 1

- [ ] In `v2/`: `npm run typecheck && npm test && npm run test:e2e && npm run test:bundle` — alles grün. Im Stamm: `npm test && npm run build`, danach `ls dist/index.html dist/v2/index.html`.
- [ ] `git status` ist sauber; `QUELLEN.md` nennt jede Grafik und beide Schriften.
- [ ] Skills `design:accessibility-review` und `design:ux-copy` über die Oberfläche (Kontraste der acht Farben, Lesbarkeit für eine Leseanfängerin, Begriffe); Befunde einarbeiten.
- [ ] Skill `superpowers:requesting-code-review` für den gesamten Branch; Prüfer gleicht die genannten Alt-Quellen gegen den alten Code ab.
- [ ] **Mit dem Auftraggeber am lebenden Objekt**, eine Frage nach der anderen: endgültige Stil-Entscheidung (Spec 12, Etappe 1) — bleibt es bei „Ninja Adventure" in dieser Form? Ist die Schrift für Emilia gut lesbar? Dann die Liste `test-artifacts/texte/serbisch.md` (aus Plan 1a, Task 6) im Chat zeigen und die serbischen Sätze gegenlesen lassen; freigegebene Schreibweisen in `v2/src/data/npcs.ts` übernehmen und in `tests/data/parity.test.ts` als benannte Abweichung vom alten Text führen (`SERBIAN_FIXES`, alter Satz → neuer Satz).
- [ ] Abschluss-Abschnitt an diesen Plan anhängen (Änderungen gegenüber dem Plan, offene Punkte, Übergabe an Etappe 2: Rucksack-Fenster, übrige Symbole, Werkstätten öffnen sich direkt, Kartenwechsel, zwei offene Tabs).
- [ ] Auftraggeber fragen, ob der Branch in `main` gemergt und veröffentlicht werden soll.
