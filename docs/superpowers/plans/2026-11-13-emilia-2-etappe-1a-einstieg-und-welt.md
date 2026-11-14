# Emilia 2.0 — Etappe 1a: Einstieg und das begehbare Dorf — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den Pflicht-Einstieg aus Etappe 0 abarbeiten und das Dorf (Karte `hub`) im Look von „Ninja Adventure" begehbar machen: Emilia läuft pixelgenau, mit Anlaufen/Abbremsen und Gleiten an Wänden, die Kamera folgt weich, Figuren verschwinden hinter Bäumen, die Dorfbewohner stehen als eigene Figuren an ihren Plätzen.

**Architecture:** Reine Spiellogik (Bewegung, Kollision, Kamera, Tiefe) liegt ohne Phaser in `v2/src/systems/` und wird mit Vitest geprüft; Phaser zeichnet nur. Eine allgemeine `WorldScene` baut jede Karte aus Tiled-JSON und Datentabellen, kein Kartenname steht im Szenen-Code. Grafik wird per Werkzeug aus dem lokal entpackten Pack ausgeschnitten und abgeleitet; im Repo liegen nur die erzeugten Ausschnitte, die Lizenzdatei und ein erzeugtes Quellenverzeichnis.

**Tech Stack:** wie Etappe 0 (`v2/`: Phaser ^4.2.1, TypeScript ^7.0.2, Vite ^8, Vitest ^5.1, @playwright/test ^1.65, Node 24). Neu, nur für Entwicklung: `pngjs` und `@types/pngjs` (PNG lesen/schreiben in Werkzeugen und Tests), `@types/node` (Tests im Typecheck). Dazu der Playwright-Testbrowser WebKit (Task 4). Sonst keine neuen Pakete.

**Spec:** `docs/superpowers/specs/2026-11-13-emilia-2-ueberarbeitung-design.md` — dieser Plan setzt aus Abschnitt 12 die erste Hälfte von Etappe 1 um, mit den Regeln aus 5.2, 8.1–8.3, 9, 11, 11.2 und dem Abschnitt „Abschluss Etappe 0 — Übergabe an Etappe 1" in `docs/superpowers/plans/2026-11-13-emilia-2-etappe-0-fundament.md`.

**Teilung:** Etappe 1 ist für einen Plan zu groß und deshalb geteilt. **1a (dieser Plan):** Einstieg, Grafik, Karte, Bewegung, Kamera, Tiefe, stehende Dorfbewohner. **1b** (`2026-11-13-emilia-2-etappe-1b-gespraeche-und-oberflaeche.md`): Gespräche, Aufgaben, Freundschaft, Rucksack-Anzeige, Grundanzeige, Baukasten, Touch.

**Abgrenzung (bewusst nicht in Etappe 1):**
- Kartenwechsel, Gegner, Kamera-Wackeln bei Treffern, Lagerfeuer: Etappe 3. Die Ausgänge des Dorfs zeigen bis dahin nur einen Hinweis (Plan 1b).
- Rucksack-Fenster, Herstellen, Werkstätten öffnen sich direkt, Tätigkeit der Dorfbewohner an ihrer Werkstatt, Garten, Laden, übrige Gegenstands-Symbole: Etappe 2.
- Farbstimmung nach Tageszeit, sich wiegende Bäume, Ton und Einstellungen: Etappe 7 (die Uhr läuft ab Plan 1b schon mit, die Oberfläche meldet Ton-Ereignisse).
- Weitere Animationen von Emilia (Schwert, gießen, angeln …) entstehen mit der Etappe, die sie braucht. Lena und Julian bekommen hier nur ihr Figurenblatt; ins Spiel kommen sie in Etappe 5.

## Vorgaben des Auftraggebers vom 2026-11-13 (ergänzen die Spec)

- **Keine Sicherungsdatei von Emilias Gerät** („brauche die nicht"). Der alte Spielstand soll trotzdem übernommen werden (auf Rückfrage bestätigt). Folge: Nur der Test mit Emilias echter Datei entfällt; Spec-Ziel 8 und Abschnitt 11.1 gelten unverändert. Weil der echte Stand als Vorlage fehlt, zählen die Robustheit der Übernahme und die Regel „der alte Schlüssel wird nie geschrieben" doppelt (das alte Spiel bleibt als Rückweg nutzbar). Beim ersten Start holt v2 den alten Stand ohne Nachfrage (Task 13); die Frage bei einem später neueren alten Stand stellt Plan 1b.
- **Geräte: PC und iPad** (wörtlich: „sie spielen am PC und am iPad"). Folge: Browser-Tests laufen in Chromium und in WebKit (die Technik hinter Safari auf dem iPad). Windows-Skalierung 125 % und 150 % und die doppelte Pixeldichte des iPads werden beim Pixelraster mitgetestet. Touch (Plan 1b) ist damit die Bedienung auf dem iPad und kein Nebenweg; das iPad wird in beiden Lagen unterstützt. Weil Safari Spielstände nach längerer Pause löschen kann, kommt die Sicherung als Datei schon in Plan 1b in die Oberfläche.

## Global Constraints

- Nie direkt auf `main` arbeiten. Dieser Plan läuft auf dem Branch `v2/etappe-1a-welt`, abgezweigt vom Branch `plan/etappe-1` (das ist `main` plus die beiden Pläne).
- **Ein Push auf `main` veröffentlicht die Live-Seite.** Mergen und Pushen nur nach ausdrücklicher Freigabe des Auftraggebers im Chat.
- Commit-Nachrichten enden mit der Zeile `Co-Authored-By: claude-flow <ruv@ruv.net>`.
- Die alten Schlüssel `emilia_pixel_adventure_save` und `emilia_muted` werden von `v2/` nur gelesen, nie geschrieben oder gelöscht.
- Keine externen Anfragen zur Laufzeit. Content-Security-Policy von `v2/index.html` bleibt wörtlich: `default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; script-src 'self'`.
- Alle deutschen Texte mit echten Umlauten und ß.
- Quelldateien unter 500 Zeilen. Keine neuen Dateien im Repo-Stamm.
- Screenshots, Kontaktbögen und andere Testartefakte nach `test-artifacts/` (git-ignoriert).
- Phaser 4: vor jedem Verdrahten (Tilemap, Kamera, Texturen, Skalierung) die aktuelle Phaser-4-Dokumentation lesen; nicht aus Phaser-3-Wissen ableiten.
- Nie `git add -A` oder `git add .`; nur die im Schritt genannten Pfade, danach `git status` prüfen.
- Kein `localStorage` außerhalb von `v2/src/save/`. Kein globales `window.__…` außerhalb von `v2/src/core/testHooks.ts`.
- **Grafik:** nur aus „Ninja Adventure" (CC0) oder daraus per Werkzeug abgeleitet. Keine per Code gezeichneten Platzhalter, keine Emojis, keine Systemschriften im Spielbild, kein Drehen und kein krummes Skalieren von Sprites. Das Pack selbst kommt nicht ins Repo.
- **Herunterladen und Installieren:** Dateien werden nur nach Rückfrage beim Auftraggeber heruntergeladen (Dateiname, Quelle, Größe nennen). Erlaubte neue npm-Pakete sind allein die oben genannten.
- **Testvorlagen für Formate und Werte des alten Spiels** werden aus dem alten Code abgeleitet, nicht aus der Erinnerung. Wo dieser Plan solche Werte nennt, steht die Quelle dabei; der Umsetzer liest sie nach, der Prüfer gleicht sie ab.
- Vite des Altprojekts wird nicht angehoben; am alten Spiel ändert dieser Plan nichts.

## Review Focus

1. **Fenster wird im Lauf verkleinert oder auf einen Bildschirm mit anderer Skalierung gezogen (100 % ↔ 125 % ↔ 150 %):** Das Bild bleibt ganzzahlig scharf, Emilia bleibt im Bild, Mausklicks treffen weiter. → Test in Task 3.
2. **Tab war im Hintergrund oder der Rechner hat geschlafen (ein Bild mit mehreren Sekunden Abstand):** Emilia springt nicht und läuft nicht durch Wände. → Test in Task 11.
3. **Gegenläufige Tasten zugleich, WASD und Pfeile gemischt, Fensterwechsel bei gedrückter Taste (Alt-Tab):** keine klebende Taste, Emilia bleibt stehen. → Test in Task 11.
4. **Gespeicherte Position liegt nach einem Karten-Umbau in einer Wand oder außerhalb der Karte:** Emilia startet am Startpunkt der Karte. → Test in Task 12.
5. **Speicher nicht verfügbar oder voll (privates Fenster, Kontingent):** Das Spiel läuft trotzdem, nichts wirft, der Zustand lebt im Arbeitsspeicher. → Tests in Task 2 und Task 13.

---

## Dateiübersicht

| Datei (unter `v2/`) | Aufgabe |
|---|---|
| `src/save/normalize.ts`, `src/save/migrations.ts` | Reparatur eigener Stände mit Bericht; Migrationskette und Regel für `formatVersion` |
| `src/save/store.ts`, `src/save/service.ts`, `src/save/browser.ts` | Speicher mit Ergebnis-Typen; Rückmeldung; Zugriff auf `localStorage` |
| `src/core/pixel.ts`, `src/core/pixelGrid.ts`, `src/scenes/PixelProbeScene.ts` | Raster-Berechnung, spielweiter Raster-Dienst, Schachbrett-Probe (nur Test) |
| `src/core/services.ts` | ein Objekt mit allen Diensten; Startablauf |
| `tests/guards/*.test.ts`, `tests/e2e/*.preview.spec.ts` | Schutztests |
| `tools/legacy-maps/exported/*.json` | die neun alten Karten als eingefrorene Vorlage (verschoben) |
| `src/data/maps.ts`, `src/data/npcs.ts`, `src/data/types.ts` | `HUB_START`; Dorfbewohner ohne Ortsangaben |
| `tools/art/*.mjs` | Grafik-Werkzeuge: Ausschneiden, Ableiten, Kontaktbogen, Quellenverzeichnis |
| `src/assets/gfx/**` | erzeugte Grafik, `LIZENZ-ninja-adventure.txt`, `QUELLEN.md`, `quellen.json` |
| `tools/maps/restyle-hub.mjs`, `tools/maps/preview.mjs` | Dorfkarte aus der alten Vorlage neu einkleiden; Vorschaubild |
| `src/assets/maps/hub.json` | die Dorfkarte im neuen Look |
| `src/data/props.ts`, `src/data/sprites.ts` | Bildausschnitt je Objektart; Figurenblatt je Figur |
| `src/maps/model.ts`, `src/maps/registry.ts` | Kartenmodell für die Szene; welche Karten ladbar sind |
| `src/systems/collision.ts`, `movement.ts`, `camera.ts`, `depth.ts` | reine Logik |
| `src/input/actions.ts`, `hub.ts`, `keyboard.ts` | Eingabeschicht |
| `src/entities/Actor.ts`, `Player.ts`, `Villager.ts`, `controller.ts` | Figuren mit austauschbarer Steuerquelle |
| `src/scenes/BootScene.ts`, `WorldScene.ts`, `scenes/world/*.ts` | Laden; allgemeine Welt-Szene |

---

### Task 1: Eigene Spielstände reparieren, Regel für `formatVersion`

**Files:**
- Modify: `v2/src/save/normalize.ts`, `v2/src/save/store.ts` (nur der Aufruf), `v2/src/data/maps.ts`
- Create: `v2/src/save/migrations.ts`, `v2/tests/save/normalize.test.ts`, `v2/tests/save/migrations.test.ts`, `v2/tests/save/format-fingerprint.json`, `v2/tools/save-fingerprint.mjs`
- Modify: `v2/package.json` (Skript `save:fingerprint`)

**Interfaces:**
- Produces:
  ```ts
  // normalize.ts
  export interface RepairReport {
    droppedItems: Array<{ itemId: string; count: number }>;
    droppedQuests: string[];
    relocated: boolean;          // Karte oder Position ungültig → Startpunkt
    resizedInventory: boolean;   // Platzzahl war nicht 48
    lossy: boolean;              // droppedItems oder droppedQuests nicht leer
  }
  export function normalizeState(raw: unknown): { state: GameState; report: RepairReport } | null;
  // migrations.ts
  export type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;
  export const MIGRATIONS: Readonly<Record<number, Migration>>;   // Schlüssel n: von Version n auf n+1; heute leer
  export function runMigrations(raw: unknown, chain: Readonly<Record<number, Migration>>, target: number):
    | { kind: 'ok'; raw: unknown } | { kind: 'newer'; storedVersion: number } | { kind: 'invalid' };
  // data/maps.ts
  export const HUB_START: { readonly map: 'hub'; readonly x: 19.5; readonly y: 14.5 };
  ```
- `GameState['player'].x/y` bedeutet ab jetzt verbindlich: **Fußpunkt in Kacheln (Gleitkomma)**; die Mitte der Kachel 19/14 ist 19,5/14,5.

**Regel für `formatVersion` (als Kommentar an den Kopf von `migrations.ts`):**
1. Ein neues Feld mit sicherer Vorgabe, das ein älterer Build einfach durchreicht, erhöht die Version nicht.
2. Die Version steigt, sobald ein älterer Build den Stand nicht mehr verlustfrei lesen und zurückschreiben könnte: neue oder entfernte Kennungen (Karte wie das Dino-Tal, Gegenstand, Aufgabe), umbenannte oder entfernte Felder, geänderte Bedeutung eines Felds.
3. Jede Erhöhung bringt einen Eintrag in `MIGRATIONS` und einen Test mit.

- [ ] **Step 1: Tests schreiben** (`normalize.test.ts`), Ausgang jeweils `createNewGameState(1000)` mit einer Änderung:
  - gültiger Stand → `state` gleich Eingabe, `report` = alles leer/`false`.
  - `player.map = 'moon'` → `state.player` = `{ ...HUB_START, hp: <unverändert> }`, `relocated: true`, `lossy: false`.
  - `player.x = NaN` → wie oben.
  - 40 Plätze, davon Platz 3 `{ wood, 7 }` → 48 Plätze, Platz 3 unverändert, `resizedInventory: true`, `lossy: false`.
  - 60 Plätze, Platz 59 `{ wood, 5 }` → 48 Plätze, das Holz liegt im ersten freien Platz, `lossy: false`.
  - 60 volle Plätze → 48 Plätze, `droppedItems.length === 12`, `lossy: true`.
  - Platz 0 `{ itemId: 'made_up', count: 3 }` → Platz 0 leer, `droppedItems` = `[{ itemId: 'made_up', count: 3 }]`, `lossy: true`.
  - `completedQuests: ['first_steps', 'made_up_quest']`, `activeQuests: { nope: { progress: 1 } }` → `droppedQuests` = `['made_up_quest', 'nope']`, `lossy: true`.
  - Klemmen: `hp: 999` → Höchstwert für das Level; `hp: -5` → 0; `xp: 1e9` → `xpToNext(level) - 1`; `level: 99` → 30; `selectedHotbar: 8` → 0; `friendship.oma.points: 140` → 100; `coins: -3` → 0.
  - hartes Minimum: kein Objekt, `formatVersion` fehlt oder ≠ 1, `progression.level` keine Zahl → `null`.
- [ ] **Step 2: Tests schreiben** (`migrations.test.ts`):
  - `runMigrations({ formatVersion: 1 }, {}, 1)` → `{ kind: 'ok', raw: <gleich> }`.
  - mit künstlicher Kette `{ 1: (r) => ({ ...r, formatVersion: 2, neu: true }) }` und Ziel 2 → `raw.neu === true`, `raw.formatVersion === 2`.
  - `{ formatVersion: 3 }`, Ziel 1 → `{ kind: 'newer', storedVersion: 3 }`.
  - `formatVersion` fehlt, ist keine ganze Zahl oder < 1, oder ein Schritt fehlt in der Kette → `{ kind: 'invalid' }`; ein werfender Schritt → `{ kind: 'invalid' }`.
  - Fingerabdruck: Der Test berechnet für `GAME_STATE_VERSION` `{ maps: MAP_IDS, items: <sortierte Kennungen>, quests: <sortierte Kennungen>, stateKeys: <sortierte oberste Schlüssel von createNewGameState(0)> }` und vergleicht mit dem Eintrag der Version in `format-fingerprint.json`. Meldung bei Abweichung: „Kennungen oder Felder des Spielstands haben sich geändert. Regel in src/save/migrations.ts lesen: Version erhöhen und Migration ergänzen, oder (nur neues Feld mit Vorgabe) `npm run save:fingerprint` ausführen."
- [ ] **Step 3: Tests laufen lassen, sie schlagen fehl** — `cd v2 && npx vitest run tests/save/normalize.test.ts tests/save/migrations.test.ts`
- [ ] **Step 4: Umsetzen.** `normalizeState` liefert Zustand und Bericht; `readInventory` bekommt den echten Bericht statt des Wegwerf-Objekts; `HUB_START` wandert nach `data/maps.ts` und ersetzt die drei Kopien in `core/state.ts`, `save/legacy.ts`, `save/normalize.ts` (Quelle des Werts: altes Spiel, `src/world/maps/hub.js`, `playerSpawn: { x: 19, y: 14 }`). `tools/save-fingerprint.mjs` schreibt die JSON-Datei neu. `store.ts` ruft erst `runMigrations`, dann `normalizeState`.
- [ ] **Step 5: Bestehende Tests anpassen**, die 20/15 erwarten (`tests/core/state.test.ts`, `tests/save/legacy.test.ts`, `tests/save/store.test.ts`) → 19,5/14,5.
- [ ] **Step 6: Alle Tests grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 7: Commit** — `git add v2/src/save v2/src/core/state.ts v2/src/data/maps.ts v2/tests/save v2/tests/core/state.test.ts v2/tools/save-fingerprint.mjs v2/package.json` · `fix(v2): eigene Spielstände reparieren statt verwerfen, Regel für formatVersion`

---

### Task 2: Speicher-Schnittstelle mit Ergebnis-Typen

**Files:**
- Modify: `v2/src/save/store.ts`, `v2/src/save/service.ts`, `v2/src/save/legacy.ts`, `v2/src/save/normalize.ts`, `v2/src/core/state.ts`, `v2/tests/save/store.test.ts`, `v2/tests/save/service.test.ts`, `v2/tests/save/legacy.test.ts`, `v2/tests/save/format-fingerprint.json`
- Create: `v2/src/save/browser.ts`, `v2/tests/save/browser.test.ts`

**Interfaces:**
- Consumes: `normalizeState`, `RepairReport`, `runMigrations` (Task 1).
- Produces:
  ```ts
  export type LoadResult =
    | { kind: 'ok'; state: GameState; repair: RepairReport | null }   // null = nichts repariert
    | { kind: 'empty' }
    | { kind: 'corrupt' }                                   // Rohtext liegt unter REJECTED_SAVE_KEY
    | { kind: 'newer'; storedVersion: number }
    | { kind: 'unavailable' };
  export type SaveResult =
    | { kind: 'saved' } | { kind: 'blocked-newer'; storedVersion: number }
    | { kind: 'full' } | { kind: 'unavailable' };
  export type LegacyImportResult =
    | { kind: 'ok'; state: GameState; report: MigrationReport }
    | { kind: 'none' } | { kind: 'unreadable' } | { kind: 'failed'; message: string };
  export class SaveStore {
    load(): LoadResult;
    save(state: GameState, now: number): SaveResult;
    readRejected(): string | null;
    importLegacy(now: number): LegacyImportResult;
    replaceWith(state: GameState, now: number): SaveResult;   // sichert zuerst den bisherigen Rohtext unter BACKUP_SAVE_KEY
    legacyOffer(current: GameState | null): 'first' | 'newer' | 'none';
  }
  export const BACKUP_SAVE_KEY = 'emilia2_save_backup';      // der Stand, den eine Übernahme oder ein Laden aus Datei ersetzt hat
  // core/state.ts: neues Feld mit Vorgabe null
  legacyDeclinedAt: number | null;   // Zeitstempel des alten Stands, dessen Übernahme abgelehnt wurde
  // service.ts
  export class SaveService {
    constructor(store: SaveStore, getState: () => GameState, now: () => number,
      onResult?: (reason: SaveReason, result: SaveResult) => void);
    saveNow(reason: SaveReason): SaveResult;
    get consecutiveFailures(): number;
  }
  // browser.ts — die einzige Stelle, die window.localStorage anfasst
  export function openBrowserStorage(win: { readonly localStorage: Storage }): Pick<Storage, 'getItem' | 'setItem'>;
  ```
- `migrateLegacySave` liefert `LegacyImportResult` (`none`: Text fehlt; `unreadable`: kein JSON-Objekt; `failed`: der Umbau hat geworfen, `message` = Fehlermeldung). `parseImport` bleibt, liefert `GameState | null`.
- `legacyOffer`: `'first'`, wenn es keinen v2-Stand gibt und der alte Stand lesbar ist; `'newer'`, wenn der Zeitstempel des alten Stands größer ist als `importedLegacyAt` und als `legacyDeclinedAt`; sonst `'none'`.
- Entfällt: `hasSave()`, `shouldOfferReimport()` (ersetzt durch `legacyOffer`).

- [ ] **Step 1: Tests schreiben** (Speicher jeweils als kleines Fake-Objekt):
  - leer → `load()` = `{ kind: 'empty' }`.
  - `getItem` wirft → `load()` = `{ kind: 'unavailable' }`, `save()` = `{ kind: 'unavailable' }`, nichts geschrieben.
  - kein JSON / hartes Minimum verletzt → `{ kind: 'corrupt' }`, Rohtext unter `REJECTED_SAVE_KEY`, `readRejected()` liefert ihn.
  - `formatVersion: 2` → `load()` = `{ kind: 'newer', storedVersion: 2 }`; `save()` = `{ kind: 'blocked-newer', storedVersion: 2 }`, Eintrag unverändert.
  - Stand mit unbekanntem Gegenstand → `{ kind: 'ok', repair: { lossy: true, … } }` und Rohtext unter `REJECTED_SAVE_KEY`.
  - gültiger Stand → `{ kind: 'ok', repair: null }`.
  - `setItem` wirft einen Fehler mit `name: 'QuotaExceededError'` → `{ kind: 'full' }`; anderer Fehler → `{ kind: 'unavailable' }`.
  - `save()` schreibt nie unter `emilia_pixel_adventure_save` oder `emilia_muted` (Fake zählt Schreibzugriffe je Schlüssel).
  - Übernahme: Text fehlt → `none`; `'[1,2]'` → `unreadable`; gültige Vorlage `LEGACY_V3_FULL`, während `vi.spyOn(QUEST_ORDER, 'filter')` einen Fehler wirft → `failed` mit dessen Meldung (nicht `none`).
  - `replaceWith`: der bisherige Rohtext liegt danach bytegleich unter `BACKUP_SAVE_KEY`, der neue Stand unter `SAVE_KEY`; bei gespeichertem `formatVersion: 2` → `blocked-newer`, nichts ändert sich; ohne bisherigen Eintrag wird nur gespeichert.
  - `legacyOffer`: kein v2-Stand, alter Stand vorhanden → `'first'`; kein alter Stand → `'none'`; v2-Stand mit `importedLegacyAt: 100` und alter Stand mit `timestamp: 100` → `'none'`, mit `timestamp: 200` → `'newer'`; dazu `legacyDeclinedAt: 200` → `'none'`; alter Stand mit `timestamp: 300` → wieder `'newer'`; alter Stand ohne `timestamp` nach der ersten Übernahme → `'none'`.
  - `legacy.test.ts`: alter Stand mit `newGamePlus: { active: true }`, leerem `completedQuests` und `activeQuests: { crab_problem: { progress: 5, completed: true } }` → `crab_problem` gilt als erledigt und steht nicht mehr unter den aktiven. Alt-Quelle der Form: `src/systems/Progression.js` — `_completeQuest` (Zeilen 279–288) setzt `completed: true` und lässt den Eintrag in `activeQuests` stehen; `resetQuests` (Zeilen 242–247) leert bei New Game Plus nur `completedQuests`.
  - `normalizeState` ergänzt ein fehlendes `legacyDeclinedAt` zu `null`.
  - Dienst: `onResult` bekommt Grund und Ergebnis; nach zwei Fehlschlägen `consecutiveFailures === 2`, nach einem Erfolg 0; wirft `getState`, ist das Ergebnis `{ kind: 'unavailable' }` und nichts wirft.
  - `openBrowserStorage`: wirft schon der Zugriff auf `win.localStorage` (privater Modus), kommt ein Speicher zurück, dessen `getItem` und `setItem` werfen.
- [ ] **Step 2: Tests schlagen fehl** — `cd v2 && npx vitest run tests/save`
- [ ] **Step 3: Umsetzen.** `QuotaExceededError` am Namen erkennen, zusätzlich an `code === 22` und `code === 1014`. Danach `npm run save:fingerprint` (neues Feld mit Vorgabe: Regel 1, keine neue Version).
- [ ] **Step 4: Alle Tests grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 5: Commit** — `git add v2/src/save v2/src/core/state.ts v2/tests/save` · `refactor(v2): Speicher meldet Ergebnisse statt null/false`

---

### Task 3: Pixelraster als spielweiter Dienst

**Files:**
- Modify: `v2/src/core/pixel.ts`, `v2/src/main.ts`, `v2/src/scenes/BootScene.ts`, `v2/tests/core/pixel.test.ts`, `v2/tests/e2e/boot.spec.ts`, `v2/package.json` (`pngjs`, `@types/pngjs`)
- Create: `v2/src/core/pixelGrid.ts`, `v2/src/core/services.ts`, `v2/src/scenes/PixelProbeScene.ts`, `v2/tests/core/pixelGrid.test.ts`, `v2/tests/e2e/pixelgrid.spec.ts`, `v2/tests/e2e/helpers/png.ts`

**Interfaces:**
- Produces:
  ```ts
  // pixel.ts
  export interface PixelLayout {
    zoom: number;
    viewWidth: number; viewHeight: number;   // sichtbare Bildpunkte: floor(Gerätepixel / zoom)
    offsetX: number; offsetY: number;        // Rand in Gerätepixeln: floor(Rest / 2)
  }
  export function computeLayout(deviceWidth: number, deviceHeight: number): PixelLayout;
  // pixelGrid.ts
  export interface PixelGridSnapshot { deviceWidth: number; deviceHeight: number; dpr: number; layout: PixelLayout }
  export function measureDevicePixels(entry: Pick<ResizeObserverEntry, 'devicePixelContentBoxSize' | 'contentRect'>, dpr: number):
    { deviceWidth: number; deviceHeight: number };
  export class PixelGrid {
    constructor(game: Phaser.Game, host: HTMLElement);
    start(): void; stop(): void;
    get snapshot(): PixelGridSnapshot;
    onChange(listener: (s: PixelGridSnapshot) => void): () => void;
    applyTo(camera: Phaser.Cameras.Scene2D.Camera): void;   // Ausschnitt auf Vielfache des Zooms, Zoom ganzzahlig
    cssToView(cssX: number, cssY: number): { x: number; y: number };   // Ort im sichtbaren Feld, in Bildpunkten
  }
  // services.ts (wächst in Task 13)
  export interface Services { pixelGrid: PixelGrid }
  export function servicesOf(scene: Phaser.Scene): Services;   // liest game.registry 'services'
  ```
- Der Kamera-Ausschnitt ist `viewWidth·zoom × viewHeight·zoom` Gerätepixel groß und um `offsetX/offsetY` eingerückt; der Rest (höchstens `zoom − 1` Pixel je Seite) bleibt schwarz.

- [ ] **Step 1: Tests schreiben** (`pixel.test.ts`, `pixelGrid.test.ts`):
  - `computeLayout(1920, 1080)` → `{ zoom: 6, viewWidth: 320, viewHeight: 180, offsetX: 0, offsetY: 0 }`
  - `computeLayout(2436, 1125)` → `{ zoom: 6, viewWidth: 406, viewHeight: 187, offsetX: 0, offsetY: 1 }`
  - `computeLayout(1366, 768)` → `{ zoom: 4, viewWidth: 341, viewHeight: 192, offsetX: 1, offsetY: 0 }`
  - `computeLayout(2400, 1350)` → `{ zoom: 7, viewWidth: 342, viewHeight: 192, offsetX: 3, offsetY: 3 }`
  - `computeLayout(0, 0)`, `(-5, 100)`, `(NaN, 100)`, `(100, Infinity)` → `{ zoom: 1, viewWidth: 1, viewHeight: 1, offsetX: 0, offsetY: 0 }`
  - `measureDevicePixels`: mit `devicePixelContentBoxSize: [{ inlineSize: 1079, blockSize: 1919 }]` → genau diese Werte; ohne das Feld und `contentRect` 411×731 bei `dpr` 2,625 → `{ deviceWidth: 1079, deviceHeight: 1919 }` (gerundet); Breite 0 → 1.
- [ ] **Step 2: Tests schlagen fehl** — `cd v2 && npx vitest run tests/core`
- [ ] **Step 3: Dienst umsetzen.** `ResizeObserver` auf `#game` mit `{ box: 'device-pixel-content-box' }`; wirft das (nicht unterstützt), ohne Option beobachten und über `contentRect × devicePixelRatio` runden. Zeichenfläche = gemessene Gerätepixel, CSS-Größe = Gerätepixel / `devicePixelRatio` (als `px` mit Nachkommastellen). Zusätzlich auf `matchMedia('(resolution: …dppx)')` hören und neu messen. `main.ts` rechnet keine Größe mehr und legt `services` in `game.registry`; `BootScene` verliert `applyPixelGrid`. Test-Zugang: `pixelGrid` (der Schnappschuss), `cssToView`, `toCanvas` wie bisher.
- [ ] **Step 4: Schachbrett-Probe.** `PixelProbeScene` startet nur, wenn der Test-Zugang aktiv ist und die Adresse `?probe=schach` enthält: füllt den Kamera-Ausschnitt mit einem Schachbrett aus einzelnen Bildpunkten (Farben `#ffffff` und `#000000`, Feld 0/0 weiß), Hintergrund außerhalb `#ff0000`.
- [ ] **Step 5: Browser-Test schreiben** (`pixelgrid.spec.ts`), für jede Kombination aus Pixeldichte `1`, `1.25`, `1.5`, `2`, `2.625`, `3` und Fenster `1280×720`, `1367×769`, `811×375`, `411×731`, `1080×810`, `810×1080` (die letzten beiden: iPad quer und hochkant):
  - Screenshot in Gerätepixeln, mit `pngjs` gelesen (`helpers/png.ts`: `readPng(buffer): { width, height, at(x, y): [r, g, b] }`).
  - Bildgröße = `snapshot.deviceWidth × deviceHeight`.
  - Für alle Felder einer Stichprobe (jedes 7. Feld in x und y): alle `zoom × zoom` Gerätepixel des Felds haben exakt dieselbe Farbe, und zwar weiß bei gerader, schwarz bei ungerader Summe der Feldkoordinaten.
  - Jeder Gerätepixel außerhalb des Ausschnitts ist `#ff0000`.
  - Danach Fenster auf `1024×768` ändern, auf den neuen Schnappschuss warten, dieselben Prüfungen (Review Focus 1). Zeiger-Abbildung: `cssToView` liefert für die Fenstermitte `(floor(viewWidth / 2), floor(viewHeight / 2))` (± 1) und für die linke obere Ecke des Ausschnitts `(0, 0)`.
- [ ] **Step 6: `boot.spec.ts` anpassen:** die drei bestehenden Tests lesen `zoom` und Größen aus `pixelGrid`; erwartete Werte bleiben (1280×720 → Zoom 4, 1920×1080 → 6, 812×375 bei Dichte 2 → 4, 1024×768 bei Dichte 2 → 8).
- [ ] **Step 7: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e`
- [ ] **Step 8: Commit** — `git add v2/src/core v2/src/main.ts v2/src/scenes v2/tests/core v2/tests/e2e v2/package.json v2/package-lock.json` · `feat(v2): Pixelraster als Dienst, gemessen statt gerechnet`

---

### Task 4: Fehlende Schutztests

**Files:**
- Create: `v2/tests/guards/csp.test.ts`, `v2/tests/guards/source-rules.test.ts`, `v2/tests/guards/bundle.test.ts`, `v2/vitest.bundle.config.ts`, `v2/tests/e2e/bundle.preview.spec.ts`
- Modify: `v2/tsconfig.json`, `v2/package.json`, `v2/playwright.config.ts`, `.github/workflows/deploy.yml`, bestehende Tests (nur Typfehler)

- [ ] **Step 1: Tests schreiben.**
  - `csp.test.ts`: `v2/index.html` enthält genau ein `Content-Security-Policy`-Meta mit dem Wortlaut aus den Global Constraints; kein `<script>` ohne `type="module" src="/src/main.ts"`; kein `http://` oder `https://` außer `http://www.w3.org/2000/svg`.
  - `source-rules.test.ts` (liest alle `v2/src/**/*.ts`): `localStorage`, `sessionStorage`, `indexedDB` nur unter `src/save/`; `window.__` nur in `src/core/testHooks.ts`; kein `fetch(`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`, kein `https?://`-Literal; keine Datei über 500 Zeilen.
  - `bundle.test.ts` (eigene Konfiguration, läuft nach dem Bauen): `dist/v2/index.html` existiert und trägt die CSP; keine `.js`-Datei unter `dist/v2` enthält `__emilia2`; keine Datei unter `dist/v2` enthält `legacy-tiles` oder liegt unter einem Ordner `legacy-maps`; Gesamtgröße von `dist/v2` unter 4 MB.
  - `bundle.preview.spec.ts`: Start des gebauten Pakets ohne Konsolenfehler und ohne fremde Anfragen; `window.__emilia2 === undefined`; der mittlere Bildschirmpixel eines Screenshots ist `rgb(45, 90, 39)` (es wird wirklich gezeichnet; Task 12 verschärft das).
- [ ] **Step 2: WebKit für Playwright.** Den Auftraggeber fragen, ob der Testbrowser geladen werden darf: Befehl `npx playwright install webkit`, Quelle ist der Download-Server von Playwright (Microsoft), die Größe vorher mit `npx playwright install --dry-run webkit` ablesen und nennen. Nach der Freigabe installieren und mit einem leeren Test prüfen, ob WebGL in WebKit unter Windows läuft. Läuft es dort nicht, bleibt das Projekt `webkit` bestehen, wird lokal aber mit `--project=chromium --project=ausgeliefert` umgangen und läuft nur in der Auslieferung (Linux); das im Abschluss festhalten.
- [ ] **Step 3: Verdrahten.**
  - `tsconfig.json`: `"include": ["src", "tests", "*.ts"]`, `"types": ["vite/client", "node"]`; `@types/node` als Entwicklungs-Paket.
  - `package.json`: `"test:bundle": "vitest run --config vitest.bundle.config.ts"`, `"test:e2e": "npm run build && playwright test"`.
  - `playwright.config.ts`: zweiter Server `npx vite preview --port 5184 --strictPort` (Adresse `http://localhost:5184/emilia-pixel-adventure/v2/`); Projekt `chromium` ohne `*.preview.spec.ts`, Projekt `webkit` (Gerät `iPad (gen 7) landscape`) mit denselben Tests wie `chromium`, Projekt `ausgeliefert` nur mit `*.preview.spec.ts` und Basis-Adresse 5184.
  - `deploy.yml`, Job `v2`: Reihenfolge `typecheck` → `test` → `build` → `test:bundle` → `npx playwright install --with-deps chromium webkit` → `npx playwright test`.
- [ ] **Step 4: Typfehler in den Tests beheben**, bis `npm run typecheck` grün ist (keine Regeln lockern; `any` nur an der Grenze zum untypisierten Altbestand, wie in `tests/data/parity.test.ts` schon kommentiert).
- [ ] **Step 5: Gegenprobe.** In `src/core/pixelGrid.ts` vorübergehend `localStorage.getItem('x')` einfügen → `source-rules.test.ts` schlägt fehl; wieder entfernen.
- [ ] **Step 6: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run build && npm run test:bundle && npx playwright test` (ab hier laufen alle Browser-Tests, auch die Schachbrett-Probe aus Task 3, zusätzlich in WebKit; dort greift der Ersatzweg der Messung über `contentRect`)
- [ ] **Step 7: Commit** — `git add v2/tests v2/tsconfig.json v2/package.json v2/package-lock.json v2/playwright.config.ts v2/vitest.bundle.config.ts .github/workflows/deploy.yml` · `test(v2): Schutztests für CSP, Paket, Speicherzugriff und ausgeliefertes Spiel`

---

### Task 5: Karten-Doppelungen auflösen

**Files:**
- Move: `v2/src/assets/maps/*.json` → `v2/tools/legacy-maps/exported/` (mit `git mv`)
- Modify: `v2/tools/export-legacy-maps.mjs`, `v2/tools/legacy-maps/convert.mjs`, `v2/src/maps/validate.ts`, `v2/src/data/types.ts`, `v2/src/data/npcs.ts`, `v2/tests/maps/*.test.ts`, `v2/tests/data/parity.test.ts`
- Create: `v2/tests/maps/loadMaps.ts`, `v2/tests/maps/ids.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // types.ts
  export type Facing = 'down' | 'up' | 'left' | 'right';
  export interface NpcDef { id; name; role; type?; favoriteGifts; dialogs; friendshipDialogs }   // ohne x, y, direction
  // tests/maps/loadMaps.ts
  export function loadLegacyMaps(): Record<MapId, TiledMap>;     // aus tools/legacy-maps/exported
  export function loadGameMaps(): Record<MapId, TiledMap>;       // src/assets/maps/<id>.json, sonst die alte Vorlage
  ```
- Der Ort einer Figur steht **nur** in der Ebene `npcs` der Karte: Objektname = Kennung, Eigenschaft `facing`. Die alten Vorlagen sind eingefroren; das Spiel lädt nur Karten aus `src/assets/maps/`.
- Die Gegenstück-Regel in `validateMap` lautet neu: Der Zielpunkt eines Ausgangs liegt höchstens 3 Kacheln (Chebyshev) neben einem Ausgang der Zielkarte, der zurückführt.

- [ ] **Step 1: Tests schreiben.**
  - `convert.test.ts`: Hat eine alte Karte in `props` einen Eintrag `{ type: 'exit', target: 'cloud_castle' }` und in `exits` einen Ausgang mit demselben Ziel, enthält die Ebene `objects` kein Objekt vom Typ `exit` (Quelle der Doppelung: altes Spiel, `src/world/maps/unicorn_meadow.js` Zeile 180 und die entsprechende Stelle in `starsky.js`). Figuren bekommen `facing`: aus altem `direction: 'down'` wird `'down'`, aus `'side'` wird `'right'`.
  - `exported.test.ts`: liest über `loadLegacyMaps()`; zusätzlich: keine Karte hat ein Objekt vom Typ `exit` in `objects`.
  - `validate.test.ts`: Ausgang, dessen Zielpunkt 10 Kacheln vom Rück-Ausgang entfernt liegt → Meldung `… Zielpunkt liegt nicht beim Rück-Ausgang`.
  - `ids.test.ts` (über `loadGameMaps()`): jeder Name in `npcs` ist eine Kennung aus `NPCS` und kommt je Karte einmal vor; alle neun Dorfbewohner stehen in `hub`; `station` ∈ Schlüssel von `RECIPES`; `itemId` jedes `resource`-Objekts ∈ `ITEMS`; `floor(HUB_START)` = Kachel des Startpunkts von `hub`.
  - `parity.test.ts`, Dorfbewohner: Ort und Richtung werden gegen die Ebene `npcs` der alten Vorlage `hub` verglichen (alte Quelle bleibt `FAMILY_NPCS` in `src/data/npcs.js`); die Liste erlaubter Felder verliert `x`, `y`, `direction`.
- [ ] **Step 2: Tests schlagen fehl** — `cd v2 && npx vitest run tests/maps tests/data`
- [ ] **Step 3: Umsetzen.** Dateien verschieben; das Export-Werkzeug schreibt nur noch nach `tools/legacy-maps/exported/`; Umwandler anpassen; `npm run maps:export`; mit `git diff --stat` prüfen, dass sich nur `unicorn_meadow.json` und `starsky.json` inhaltlich geändert haben und alle Karten die Eigenschaft `facing` bekommen haben.
- [ ] **Step 4: Neue Meldungen der schärferen Gegenstück-Regel einordnen.** Jede neue Meldung an einer alten Karte kommt mit Begründung in `KNOWN_LEGACY_ISSUES` (sie wird erst mit der Neugestaltung der jeweiligen Karte behoben). Für `hub` darf es keine geben.
- [ ] **Step 5: Bekannte Reste festhalten:** `starsky` führt acht Objekte vom Typ `npc` in `objects` (Sternbild-Figuren ohne Dorfbewohner-Kennung). `ids.test.ts` nennt sie in einer Liste `KNOWN` mit dem Vermerk „Etappe 6".
- [ ] **Step 6: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run build && npm run test:bundle`
- [ ] **Step 7: Commit** — `git add v2/tools v2/src/maps v2/src/data v2/tests v2/src/assets` · `refactor(v2): alte Karten als eingefrorene Vorlage, Orte der Figuren nur noch in der Karte`

---

### Task 6: Texte

**Files:**
- Modify: `v2/src/data/npcs.ts`, `v2/tests/data/parity.test.ts`, `v2/tests/data/text.test.ts`

- [ ] **Step 1: Tests schreiben.**
  - `text.test.ts`, neu „enthält keine zu viel gesetzten Umlaute": kein gesammelter Text trifft `/[aeoäö]ü|qü|aktüll|manüll|pösie|söben/i` (fängt „neü", „Maür", „Feür", „Abenteür", „Qülle").
  - `text.test.ts`: kein Text enthält „mächtiger stolz".
  - `parity.test.ts`: `OLD_TYPO_FIXES` bekommt `'maechtiger stolz': 'maechtig stolz'` (Quelle: `src/data/npcs.js` Zeile 227, „Opa ist maechtiger stolz auf dich!").
- [ ] **Step 2: Tests schlagen fehl**, dann den Satz in `npcs.ts` zu „Opa ist mächtig stolz auf dich!" ändern → grün.
- [ ] **Step 3: Liste für den Auftraggeber.** Alle Sätze von `baba`, `deda` und `papa_milos`, die serbische Wörter enthalten, als Tabelle nach `test-artifacts/texte/serbisch.md` schreiben: Figur, heutiger Satz, Vorschlag mit Sonderzeichen (č, ć, š, ž, đ). **Die Daten werden hier nicht geändert**; der Auftraggeber liest die Liste am Ende von Plan 1b gegen.
- [ ] **Step 4: Commit** — `git add v2/src/data/npcs.ts v2/tests/data` · `fix(v2): Opas Satz korrigiert, Schutz gegen zu viel gesetzte Umlaute`

---

### Task 7: „Ninja Adventure" einbinden — Lizenz, Werkzeuge, Quellenverzeichnis

**Files:**
- Create: `v2/tools/art/png.mjs`, `v2/tools/art/selection.mjs`, `v2/tools/art/build.mjs`, `v2/tools/art/contact-sheet.mjs`, `v2/tests/art/png.test.ts`, `v2/tests/art/manifest.test.ts`
- Create (erzeugt): `v2/src/assets/gfx/LIZENZ-ninja-adventure.txt`, `v2/src/assets/gfx/QUELLEN.md`, `v2/src/assets/gfx/quellen.json`, `v2/src/assets/gfx/tiles/dorf.png`, `v2/src/assets/gfx/tiles/dorf.json`
- Modify: `v2/package.json` (Skripte `art:build`, `art:sheet`)

**Interfaces:**
- Produces:
  ```js
  // png.mjs — Bilder sind { width, height, data: Uint8Array (RGBA) }
  export function readPng(path); export function writePng(path, img);
  export function crop(img, x, y, w, h); export function blit(dst, src, dx, dy);
  export function recolor(img, map);            // map: { '#rrggbb': '#rrggbb' }, exakte Treffer, Alpha bleibt
  export function dropRows(img, rows); export function dropCols(img, cols);   // Indizes im Quellbild
  export function anchorBottomCenter(img, w, h);   // setzt das Bild unten mittig in ein leeres w×h-Bild
  // selection.mjs — die Auswahlliste; nur was hier steht, kommt ins Repo
  export const TILES   = [/* { id, source, x, y, use } — je 16×16 */];
  export const PROPS   = [/* { id, source, x, y, w, h, anchorX, anchorY, use } */];
  export const FIGURES = [/* { id, source, ops, use } — Task 8 */];
  export const UI      = [/* { id, source, x, y, w, h, use } — Plan 1b */];
  ```
- `build.mjs` liest das Pack aus dem Ordner in der Umgebungsvariable `NINJA_PACK_DIR` und schreibt: `gfx/tiles/dorf.png` (16 Kacheln je Zeile, Reihenfolge der Liste) mit `dorf.json` (`{ "<id>": <Index> }`), `gfx/props/dorf.png` mit `dorf.json` (Rahmen je `id`, dazu `anchorX/anchorY`), je Figur `gfx/figuren/<id>.png`, `gfx/ui/<id>.png`, sowie `quellen.json` und `QUELLEN.md` (je Eintrag: Kennung, Zieldatei, Quelldatei im Pack, Ausschnitt, Änderungen, Verwendung, Lizenz „CC0 1.0"). Die Ausgabe ist wiederholbar: gleiche Liste → bytegleiche Dateien, keine Zeitstempel.

- [ ] **Step 1: Zip prüfen (nichts herunterladen).** Erwartet: `C:\Users\strai\Downloads\Ninja Adventure - Asset Pack.zip`, 94.022.790 Bytes, SHA-256 `95a06f4fdcfd1882f061a45ff313b7c905dbe2de1e8512b281d7937df62a7b15` (am 2026-11-13 mit Freigabe des Auftraggebers geladen). Fehlt die Datei oder weicht die Prüfsumme ab: **anhalten und den Auftraggeber fragen**, ob neu geladen werden darf — Dateiname „Ninja Adventure - Asset Pack.zip", Quelle `https://pixel-boy.itch.io/ninja-adventure-asset-pack`, Größe rund 94 MB.
- [ ] **Step 2: Entpacken** in den neuen, leeren Ordner `C:\Users\strai\Downloads\ninja-adventure-pack\` (außerhalb des Repos und außerhalb von OneDrive). `NINJA_PACK_DIR` zeigt auf den Unterordner `Ninja Adventure - Asset Pack`. Aus dem Ordner wird nichts ausgeführt; Werkzeuge liegen nur unter `v2/tools/` und bekommen den Pfad als Argument.
- [ ] **Step 3: Lizenz im Original lesen.** `LICENSE.txt` vollständig (erwartet: „CC0 1.0 Universal") und `README.md` (erwartet: CC0, Namensnennung freiwillig). Die Lizenzangabe auf der Pack-Seite gegenlesen. Weicht irgendetwas von CC0 ab oder nimmt die Lizenz einzelne Ordner aus: **anhalten und den Auftraggeber fragen.** `LICENSE.txt` unverändert als `LIZENZ-ninja-adventure.txt` ablegen.
- [ ] **Step 4: Tests schreiben.**
  - `png.test.ts` mit kleinen selbst erzeugten Bildern: `recolor` ändert nur exakte Treffer und lässt Alpha stehen; `dropRows([2])` macht aus 4×4 ein 4×3 mit den Zeilen 0, 1, 3; `dropCols` entsprechend; `anchorBottomCenter` eines 14×13-Bilds in 16×16 lässt oben 3 Zeilen und links wie rechts 1 Spalte leer; `crop` über den Rand wirft mit deutscher Meldung.
  - `manifest.test.ts` (läuft immer, ohne Pack): jede Datei unter `src/assets/gfx/` außer den drei Verzeichnis-Dateien steht in `quellen.json`; jede Zieldatei aus `quellen.json` existiert; die Lizenzdatei beginnt mit `CC0 1.0 Universal`; `QUELLEN.md` nennt die Pack-Seite und die Urheber aus `README.md`; alle Maße von `tiles/dorf.png` sind Vielfache von 16; `src/assets/gfx` ist zusammen kleiner als 400 kB.
  - `manifest.test.ts`, nur wenn `NINJA_PACK_DIR` gesetzt ist (sonst übersprungen): `build.mjs` in einen Temp-Ordner laufen lassen → jede Datei bytegleich mit der eingecheckten.
- [ ] **Step 5: Werkzeuge umsetzen.** `contact-sheet.mjs <Datei im Pack>` schreibt das Bild 4-fach vergrößert mit 16-Pixel-Gitter und Spalten-/Zeilennummern (Ziffern als festes 3×5-Raster) nach `test-artifacts/art/`. Erste Einträge in `TILES`: `gras`, `gras_dunkel`, `sand` — die Mitte des jeweiligen 48×48-Blocks in `Backgrounds/Tilesets/TilesetField.png` (Sand bei y 0, helle Wiese y 48, dunkle Wiese y 96; die kachelbare Mitte liegt bei x 16, y + 16).
- [ ] **Step 6: Laufen lassen und ansehen** — `cd v2 && npm run art:build && npm run art:sheet -- Backgrounds/Tilesets/TilesetField.png`; den Kontaktbogen öffnen und prüfen, dass die drei Kacheln randlos kachelbar sind.
- [ ] **Step 7: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 8: Commit** — `git add v2/tools/art v2/tests/art v2/src/assets/gfx v2/package.json` · `feat(v2): Grafik-Werkzeuge, Lizenz und Quellenverzeichnis für Ninja Adventure`

---

### Task 8: Figuren ableiten — Emilia, Lena, Julian und die neun Dorfbewohner

**Files:**
- Modify: `v2/tools/art/selection.mjs`, erzeugte Dateien unter `v2/src/assets/gfx/`
- Create: `v2/src/data/sprites.ts`, `v2/tests/art/figures.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // sprites.ts
  export const FIGURE_FRAME = { width: 16, height: 16, columns: 4 } as const;
  export const FACING_COLUMN: Record<Facing, number>;        // down 0, up 1, left 2, right 3
  export const IDLE_ROW = 0; export const WALK_ROWS = [1, 2, 3, 4] as const;
  export interface FigureDef { sheet: string; face: string; height: 13 | 15 | 16 }
  export const FIGURES: Record<string, FigureDef>;           // emilia, lena, julian und die neun Kennungen aus NPCS
  export function figureFrame(facing: Facing, row: number): number;   // row * 4 + Spalte
  ```
- Blattformat je Figur (`gfx/figuren/<id>.png`, 64×80): Spalte = Richtung (unten, oben, links, rechts), Zeile 0 = stehen (aus `SeparateAnim/Idle.png`, 64×16), Zeilen 1–4 = gehen (aus `SeparateAnim/Walk.png`, 64×64: Spalten = Richtungen, Zeilen = Einzelbilder). Jede Figur steht unten mittig in ihrer 16×16-Zelle. Dazu `gfx/figuren/<id>-gesicht.png` (38×38, aus `Faceset.png`) und einmal `gfx/figuren/schatten.png` (aus `Actor/Character/Shadow.png`).

**Ableitung (verbindlich):**

| Figur | Vorlage im Pack (`Actor/Character/…`) | Änderung | Höhe |
|---|---|---|---|
| Emilia | `Princess` | umfärben: Haare dunkelbraun, Kleid und Schleife rosa; eine Körperzeile entfernen | 15 |
| Lena | `Woman` | umfärben nach der Sichtvorlage (blond); dieselbe Körperzeile entfernen | 15 |
| Julian | `Villager4` | Haare blond; drei Zeilen (eine Kopf-, zwei Körperzeilen) und zwei Spalten entfernen | 13 (14 breit) |
| Erwachsene | je eine eigene Vorlage | nur umfärben | 16 |

- Zielfarben für Emilia und alle Dorfbewohner stehen im alten Spiel in `src/utils/SpriteSheetLoader.js`, `NPC_PALETTE_CONFIGS` (Zeilen 362–373: Haar-, Kleid- und Hosenfarbe je Figur, z. B. Mama braunes Haar und rosa Oberteil, Papa schwarzes Haar und blaues Hemd, Marie blond und gelbes Kleid, Opa kahl und olivgrünes Hemd). Verwendet wird jeweils die nächstliegende Farbe aus `Palette.png` des Packs, damit alles in einer Palette bleibt.
- Die Entwürfe aus dem Stiltest liegen lokal unter `test-artifacts/overhaul-audit/stiltest/ninja-adventure/` (`emilia-aus-prinzessin.png`, `lena-aus-frau.png`, `julian-entwurf.png`) und sind die Sichtvorlage.
- Zuordnung der neun Dorfbewohner: Ausgang ist `mama_tanja`, `papa_milos`, `marie`, `liam`, `ferdinand` aus den Vorlagen `Villager`, `Villager2`, `Villager3`, `Villager5`, `Villager6`, `Boy`, `Noble`, `Hunter`, `ManGreen`, `Inspector`; `oma` und `baba` aus `OldWoman` und einer zweiten Frauen-Vorlage; `opa` und `deda` aus `OldMan`, `OldMan2`, `OldMan3`. Regeln: keine Vorlage zweimal; keine Ninja-, Rüstungs-, Masken- oder Monster-Vorlage; jede Figur ist an Umriss und Frisur von den anderen zu unterscheiden (Spec 8.4), nicht nur an der Farbe; `ferdinand` wirkt als Händler. Die endgültige Tabelle steht nach diesem Task in `QUELLEN.md` und im Abschluss dieses Plans.

- [ ] **Step 1: Kontaktbogen aller Vorlagen.** Für jede Vorlage aus der Tabelle und der Kandidatenliste `Idle.png` und `Faceset.png` nebeneinander, beschriftet mit dem Ordnernamen, nach `test-artifacts/art/figuren-kandidaten.png`. Ansehen und die Zuordnung festlegen.
- [ ] **Step 2: Tests schreiben** (`figures.test.ts`, lesen die erzeugten PNG mit `pngjs`):
  - `FIGURES` hat genau die Schlüssel `emilia`, `lena`, `julian` und alle Kennungen aus `NPCS`; jede `sheet`- und `face`-Datei existiert; kein Blatt ist bytegleich mit einem anderen.
  - Jedes Blatt ist 64×80; jede der 20 Zellen enthält Pixel; die unterste Zeile jeder Zelle enthält Pixel (Figur steht auf dem Zellenboden).
  - Höchste belegte Zeile je Zelle: Emilia und Lena lassen genau die oberste Zeile frei (15 hoch), Julian die obersten drei (13 hoch) sowie die linke und rechte Spalte, Erwachsene keine (16 hoch). Also Julian < Emilia = Lena < Erwachsene (Spec 8.2).
  - Jede Zielfarbe aller `recolor`-Tabellen in `selection.mjs` kommt in `Palette.png` des Packs vor (Test nur mit `NINJA_PACK_DIR`; die Palette selbst wird nicht eingecheckt).
- [ ] **Step 3: Tests schlagen fehl**, dann `FIGURES` in `selection.mjs` füllen (je Figur `source` und `ops`: `recolor`, `dropRows`, `dropCols`, `anchorBottomCenter`), `npm run art:build`.
- [ ] **Step 4: Ansehen.** Kontaktbogen aller zwölf fertigen Blätter, 6-fach vergrößert, nach `test-artifacts/art/figuren-fertig.png`. Prüfen: Laufbilder ohne Flackern einzelner Pixel zwischen den Einzelbildern; Julian sichtbar kleiner; Schleife bei Emilia erkennbar. Unsaubere Stellen über die `ops` beheben, nicht von Hand im Bild.
- [ ] **Step 5: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 6: Commit** — `git add v2/tools/art/selection.mjs v2/src/assets/gfx v2/src/data/sprites.ts v2/tests/art/figures.test.ts` · `feat(v2): Figurenblätter für Emilia, Lena, Julian und die Dorfbewohner`

---

### Task 9: Die Dorfkarte neu einkleiden

**Files:**
- Create: `v2/tools/maps/restyle-hub.mjs`, `v2/tools/maps/autotile.mjs`, `v2/tools/maps/preview.mjs`, `v2/src/assets/maps/hub.json` (erzeugt), `v2/src/data/props.ts`, `v2/tests/maps/hub.test.ts`, `v2/tests/maps/autotile.test.ts`
- Modify: `v2/tools/art/selection.mjs` (`TILES`, `PROPS`), `v2/package.json` (Skripte `maps:build`, `maps:preview`), `v2/src/maps/tiled.ts` (falls ein Feld fehlt)

**Interfaces:**
- Consumes: alte Vorlage `v2/tools/legacy-maps/exported/hub.json`; `gfx/tiles/dorf.json`, `gfx/props/dorf.json`.
- Produces:
  ```ts
  // props.ts
  export interface PropDef { frame: string; layer: 'standing' | 'flat'; frames?: readonly string[]; fps?: number }
  export const PROP_DEFS: Readonly<Record<string, PropDef>>;
  export function propKey(type: string, variant: string | null): string;   // 'tree:pine' bzw. 'bonfire'
  ```
  ```js
  // autotile.mjs
  // mask[y][x] === true: Weg. Ergebnis: 'mitte' | 'n' | 's' | 'w' | 'o' | 'aussen_nw' | 'aussen_no' | 'aussen_sw' | 'aussen_so'
  //                                  | 'innen_nw' | 'innen_no' | 'innen_sw' | 'innen_so'
  export function edgeTile(mask, x, y);
  ```
- `hub.json`: 40×32 Kacheln, ein Kachelsatz `dorf` (`image: "../gfx/tiles/dorf.png"`), Ebenen in dieser Reihenfolge: `ground`, `ground_detail`, `collision`, `objects`, `npcs`, `exits`, `spawn`. Objekte tragen `type` und, wo nötig, die Eigenschaft `variant`; ihr Ort ist die Kachel ihres Fußpunkts. **Die Ebene `collision` ist die einzige Wahrheit über gesperrte Kacheln** (auch für Objekte).

**Gestaltungsregeln (verbindlich):**
- Unverändert aus der Vorlage: Größe, alle drei Ausgänge (Ort, Ziel, Zielpunkt), Startpunkt 19/14, Ort jedes Dorfbewohners, Ort jeder Station, jedes Gartenbeets, jeder Truhe (samt Kennung), des Trophäenregals, des Lagerfeuers, jeder welken Pflanze, jedes Rohstoffs (samt Kennung), jedes Wegweisers.
- Boden aus den alten Kachelkennungen der Vorlage (Bedeutung laut altem Spiel, `src/world/maps/hub.js`, `TILE_DEFS`, und `src/utils/AutoTiler.js`, `PATH_EDGES`; die Vorlage speichert Kennung + 1): 1–4 Gras → Wiese mit denselben Abwechslungs-Stellen; 5, 6 und 36–47 Weg samt Rändern → Sandweg, Ränder aus der Wegmaske neu berechnet; 7, 8 Holzboden → Hofboden der Werkstätten; 9 Blumenwiese → Wiese, die Blumen wandern nach `ground_detail`; 10 Steinboden → Steinboden.
- Der zwei Kacheln breite Rand ist dichter Wald auf dunkler Wiese.
- Häuser: vier verschiedene Hausbilder aus `Backgrounds/Tilesets/TilesetHouse.png`. Ein Haus steht hinter seiner Werkstatt (nördlich), die Station bleibt davor frei zugänglich; kein Haus verdeckt eine Station, eine Figur oder einen Weg.
- Bäume: die 15 alten Varianten werden nach Familie auf Pack-Bäume aus `TilesetNature.png` abgebildet (`pine_*` → Tanne, `oak_*` → Laubbaum, `round_*` → Rundbaum, `maple_tree` → rosa Baum). Gesperrt ist nur die Stammkachel.
- Der alte „Brunnen" (Fels auf 19/14, genau auf dem Startpunkt) wird ein richtiger Brunnen auf 20/13 und ist gesperrt.
- Wegweiser tragen statt der alten Emoji-Texte die Eigenschaft `target` (`forest`, `lake`, `dungeon`).
- Fehlt im Pack ein Motiv (z. B. Sägewerk, Alchemie-Tisch), wird es mit `blit` aus Pack-Teilen zusammengesetzt und so in `QUELLEN.md` vermerkt. Es wird nichts per Code gemalt.
- Wegstücke, die in der Vorlage nur eine Kachel breit sind (die kurzen Stiche zu Küche, Werkstatt, Garten und Sägewerk), werden im Werkzeug über die Liste `PATH_WIDEN` um eine Kachel verbreitert, wo die Nachbarkachel frei ist.
- Jede Abweichung der Sperrflächen von der Vorlage steht mit Begründung in der Liste `COLLISION_CHANGES` im Werkzeug.

- [ ] **Step 1: Kontaktbögen** für `TilesetField.png`, `TilesetNature.png`, `TilesetHouse.png`, `TilesetFloor.png`, `TilesetElement.png`, `TilesetFloorDetail.png`, `tileset_camp.png` und `Backgrounds/Animated/Flower/SpriteSheet16x16.png` erzeugen und ansehen; daraus `TILES` und `PROPS` in `selection.mjs` füllen. Nötige Kacheln: Wiese (4 Varianten), Wiese dunkel, Sandweg mit 4 Kanten, 4 Außen- und 4 Innenecken (fehlen Innenecken im Pack, mit `blit` aus zwei Kanten zusammensetzen), Hofboden, Steinboden, Beet-Erde. Nötige Objekte: je Typ der Vorlage mindestens ein Bild (`tree` in 4 Familien, `house` ×4, `trophy_shelf`, `bonfire`, `station` ×5, `real_fence`, `resource` ×2, `chest`, `chicken`, `bush`, `flower`, `rock`, `well`, `wilted_plant`, `signpost`).
- [ ] **Step 2: Tests schreiben.**
  - `autotile.test.ts`: Wegkachel mit Weg auf allen acht Seiten → `'mitte'`; zwei Kacheln breites waagrechtes Wegstück: obere Reihe `'n'`, untere `'s'`; Ecke eines Wegrechtecks oben links → `'aussen_nw'`; Kachel, deren vier Seiten Weg sind und nur die Diagonale oben links Gras ist → `'innen_nw'`; Kartenrand zählt als Weg (Ausgänge laufen randlos aus dem Bild). Der Kachelsatz kennt keine Kachel mit zwei gegenüberliegenden Kanten: liegt Gras im Norden **und** Süden, gewinnt `'n'`, bei Westen **und** Osten `'w'`.
  - `hub.test.ts` gegen die Vorlage (`loadLegacyMaps().hub`): gleiche Größe; Ausgänge in Name, Rechteck und Eigenschaften gleich; Startpunkt gleich; Dorfbewohner in Name und Kachel gleich; für die Typen `station`, `garden_plot`, `chest`, `trophy_shelf`, `bonfire`, `wilted_plant`, `resource`, `signpost` dieselbe Menge aus (Typ, Kachel x, Kachel y), bei Truhen und Rohstoffen auch dieselbe Kennung.
  - Jede Kachel, die in der Vorlage Weg war (Kennung 5, 6 oder 36–47), ist begehbar. Jede Kachel, die in der Vorlage begehbar war und jetzt gesperrt ist, steht in `COLLISION_CHANGES`; die Liste hat höchstens 40 Einträge.
  - `validateMap('hub', loadGameMaps())` → `[]`.
  - Jede Kachelnummer in `ground` und `ground_detail` ist 0 oder ein Index aus `tiles/dorf.json` + 1; jedes Objekt hat einen Eintrag in `PROP_DEFS` (`propKey`), dessen `frame` in `props/dorf.json` vorkommt.
  - Kein Text in `hub.json` enthält ein Emoji (`/\p{Extended_Pictographic}/u`).
  - Das Werkzeug ist wiederholbar: `restyle-hub.mjs` in einen Temp-Ordner → bytegleich mit `src/assets/maps/hub.json`.
- [ ] **Step 3: Tests schlagen fehl**, dann `restyle-hub.mjs` und `props.ts` umsetzen; `npm run art:build && npm run maps:build`.
- [ ] **Step 4: Vorschaubild.** `preview.mjs` setzt aus Karte und Bildern ein PNG der ganzen Karte zusammen (Boden, Bodendetail, dann Objekte und stehende Figuren nach Fußpunkt sortiert) → `test-artifacts/maps/hub.png`, zusätzlich 4-fach vergrößert. Ansehen und so lange nachbessern, bis gilt: keine sichtbaren Kachelnähte; Wege lesbar und durchgehend; jede Station, jede Figur und jeder Ausgang ist zu sehen und nicht von Baumkronen oder Dächern verdeckt; das Dorf wirkt freundlich und nicht leer.
- [ ] **Step 5: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 6: Commit** — `git add v2/tools/maps v2/tools/art/selection.mjs v2/src/assets v2/src/data/props.ts v2/src/maps v2/tests/maps v2/package.json` · `feat(v2): Dorfkarte im neuen Look, Orte wie im alten Spiel`

---

### Task 10: Kartenmodell und Welt-Szene (zeichnen)

**Files:**
- Create: `v2/src/maps/model.ts`, `v2/src/maps/registry.ts`, `v2/src/systems/collision.ts` (nur der Typ `SolidGrid`), `v2/src/systems/depth.ts`, `v2/src/scenes/WorldScene.ts`, `v2/src/scenes/world/buildLayers.ts`, `v2/src/scenes/world/buildProps.ts`, `v2/tests/maps/model.test.ts`, `v2/tests/systems/depth.test.ts`, `v2/tests/e2e/world.spec.ts`
- Modify: `v2/src/scenes/BootScene.ts`, `v2/src/main.ts`

**Interfaces:**
- Produces:
  ```ts
  // collision.ts
  export interface SolidGrid { readonly width: number; readonly height: number; isSolid(tileX: number, tileY: number): boolean }  // außerhalb der Karte: fest
  // model.ts — alle Orte in Bildpunkten, Fußpunkt = Mitte der Kachel
  export interface WorldObject { id: number; type: string; variant: string | null; x: number; y: number; props: Readonly<Record<string, string | number | boolean>> }
  export interface WorldNpc { npcId: string; x: number; y: number; facing: Facing }
  export interface WorldExit { name: string; x: number; y: number; width: number; height: number; target: MapId; spawnX: number; spawnY: number }
  export interface WorldMap { id: MapId; widthPx: number; heightPx: number; solid: SolidGrid;
    objects: readonly WorldObject[]; npcs: readonly WorldNpc[]; exits: readonly WorldExit[]; spawn: { x: number; y: number } }
  export function buildWorldMap(id: MapId, tiled: TiledMap): WorldMap;   // wirft mit deutscher Meldung, wenn eine Ebene fehlt; Kacheln der Figuren sind fest
  // registry.ts
  export const MAP_FILES: Partial<Record<MapId, string>>;   // Adresse der Kartendatei (Vite-Import mit ?url); heute nur hub
  // depth.ts
  export const DEPTH = { ground: 0, groundDetail: 1, flat: 2, standing: 1000, top: 100000 } as const;
  export function depthForFoot(footY: number): number;   // 1000 + footY
  ```
- Alle Bilder und Karten werden über Vite-Importe (`?url`) geladen, damit Basis-Pfad und CSP stimmen. Der Bildpfad im Kachelsatz der Karte dient nur dem Öffnen in Tiled; das Spiel ordnet das Bild über den Namen des Kachelsatzes (`dorf`) zu.
- `WorldScene` wird mit `{ map: MapId }` gestartet und enthält keinen Kartennamen. `BootScene` lädt Kachelsatz, Objekt-Atlas, Figurenblätter und die Karte(n) aus `MAP_FILES` und startet danach die Welt-Szene (bei `?probe=schach` die Probe).

- [ ] **Step 1: Tests schreiben.**
  - `model.test.ts` mit einer 4×3-Karte: `widthPx` 64, `heightPx` 48; `solid.isSolid(-1, 0)` und `(4, 0)` sind `true`; eine Figur auf Kachel 2/1 hat `x: 40, y: 24` und macht `isSolid(2, 1)` wahr; Startpunkt-Objekt bei 16/16 → `spawn` = `{ x: 24, y: 24 }`; Eigenschaft `variant` wandert in `variant`, alle anderen in `props`; fehlende Ebene `collision` → Fehler „Karte hub: Ebene „collision" fehlt".
  - `depth.test.ts`: `depthForFoot(100) < depthForFoot(101)`; `depthForFoot(0) > DEPTH.flat`; `depthForFoot(32 * 16) < DEPTH.top`.
  - `world.spec.ts`: nach dem Start meldet der Test-Zugang `world = { map: 'hub', objects: <Anzahl aus der Karte>, npcs: 9 }`; keine Konsolenfehler, keine fremden Anfragen; ein Screenshot enthält mindestens 16 verschiedene Farben; die Blockprüfung aus Task 3 (jeder `zoom × zoom`-Block einfarbig) gilt für den ganzen Kamera-Ausschnitt.
- [ ] **Step 2: Tests schlagen fehl.**
- [ ] **Step 3: Phaser-4-Dokumentation lesen** zu: Tilemap aus Tiled-JSON, Kachelsatz-Bild zuordnen, Ebenen erzeugen, Atlas laden, Tiefe von Spielobjekten, Animation aus Einzelbildern. Die gefundenen Aufrufe stichwortartig im Kopfkommentar von `buildLayers.ts` festhalten.
- [ ] **Step 4: Umsetzen.** `ground` und `ground_detail` als Kachel-Ebenen (Tiefe `DEPTH.ground`, `DEPTH.groundDetail`); Objekte mit `layer: 'flat'` auf `DEPTH.flat`, mit `'standing'` auf `depthForFoot(y)`, Bildanker = `anchorX/anchorY` aus `props/dorf.json`; Objekte mit `frames` laufen als Animation. Die Kamera bekommt Ausschnitt und Zoom von `pixelGrid.applyTo` und zeigt vorerst den Startpunkt.
- [ ] **Step 5: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e`
- [ ] **Step 6: Commit** — `git add v2/src/maps v2/src/systems v2/src/scenes v2/src/main.ts v2/tests` · `feat(v2): allgemeine Welt-Szene zeichnet das Dorf aus Daten`

---

### Task 11: Bewegung, Kollision und Tastatur (reine Logik)

**Files:**
- Modify: `v2/src/systems/collision.ts`
- Create: `v2/src/systems/movement.ts`, `v2/src/input/actions.ts`, `v2/src/input/hub.ts`, `v2/src/input/keyboard.ts`, `v2/tests/systems/collision.test.ts`, `v2/tests/systems/movement.test.ts`, `v2/tests/input/hub.test.ts`, `v2/tests/input/keyboard.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // collision.ts
  export interface Box { x: number; y: number; halfW: number; halfH: number }   // Mittelpunkt, Bildpunkte
  export const MAX_STEP = 4;        // größter Teilschritt in Bildpunkten
  export const CORNER_NUDGE = 5;    // bis zu so viel Überstand rutscht die Figur um eine Ecke
  export function moveAndSlide(box: Box, dx: number, dy: number, grid: SolidGrid): { x: number; y: number; blockedX: boolean; blockedY: boolean };
  // movement.ts
  export const WALK_SPEED = 64; export const RUN_SPEED = 112;   // Bildpunkte je Sekunde
  export const ACCEL_TIME = 0.1; export const MAX_DT = 0.1;     // Sekunden
  export const PLAYER_BODY = { halfW: 5, halfH: 3, footOffset: 3 } as const;   // Kasten 10×6, Unterkante am Fußpunkt
  export interface MoveIntent { x: number; y: number; run: boolean }   // Betrag höchstens 1
  export interface Mover { x: number; y: number; vx: number; vy: number; facing: Facing; moving: boolean; walkTime: number }
  export function stepMover(m: Mover, intent: MoveIntent, dt: number, grid: SolidGrid): Mover;   // Fußpunkt in m.x/m.y
  export function walkFrameRow(walkTime: number, running: boolean): number;   // 1…4; 8 Bilder/s gehen, 12 rennen
  // actions.ts
  export type Action = 'interact' | 'confirm' | 'cancel' | 'menu' | 'help'
    | 'hotbar1' | 'hotbar2' | 'hotbar3' | 'hotbar4' | 'hotbar5' | 'hotbar6' | 'hotbar7' | 'hotbar8';
  export type InputDevice = 'keys' | 'touch';
  export interface InputSource { readonly device: InputDevice; readonly move: { x: number; y: number }; readonly run: boolean; drainPressed(): Action[]; reset(): void }
  // hub.ts
  export const PRESS_BUFFER = 0.3;   // Sekunden, die ein Tastendruck auf seinen Abnehmer wartet
  export class InputHub { add(source: InputSource): void; frame(dt: number): void; get intent(): MoveIntent; consume(action: Action): boolean; reset(): void;
    get device(): InputDevice }   // Gerät der Quelle, die zuletzt Bewegung oder einen Druck geliefert hat; Anfang 'keys'
  // keyboard.ts
  export class KeyboardSource implements InputSource { constructor(target: Pick<Window, 'addEventListener' | 'removeEventListener'>); attach(): void; detach(): void }
  ```
- Tempo-Quelle: altes Spiel, `src/utils/Constants.js` Zeilen 7–8 (`PLAYER_SPEED = 4`, `PLAYER_RUN_SPEED = 7` Kacheln je Sekunde → 64 und 112 Bildpunkte). Level geben kein Tempo mehr (Spec 7.1).
- Tasten: Bewegung `KeyW/A/S/D` und Pfeile; rennen `ShiftLeft/ShiftRight`; `KeyE` → `interact`; `Space` und `Enter` → `confirm`; `Escape` → `cancel`; `KeyH` → `help`; `KeyM` → `menu`; `Digit1`–`Digit8` → `hotbar1`–`hotbar8`. F, Q, I und Tab bleiben für Etappe 2 und 3 frei.

- [ ] **Step 1: Tests schreiben.**
  - Kollision: freie Fläche → Ziel = Start + Weg. Wand rechts: Bewegung um 40 nach rechts endet mit der rechten Kastenkante genau an der Wandkante, `blockedX: true` (kein Durchtunneln trotz Weg > `MAX_STEP`). Schräg gegen eine Wand rechts (dx 10, dy 10): x bleibt an der Wand, y wächst um 10. Ecke: eine einzelne feste Kachel, der Kasten überlappt sie quer um 4 Bildpunkte, darüber ist frei → nach Bewegungen von zusammen 24 nach rechts ist der Kasten an der Kachel vorbei; bei 6 Bildpunkten Überlappung bleibt er hängen (`blockedX: true`). Eine Lücke von genau einer Kachel ist mit einem 3 Bildpunkte versetzten Kasten passierbar.
  - Bewegung: aus dem Stand mit Absicht (1, 0) ist `vx` nach 0,05 s 32 (± 1) und nach 0,1 s 64; nach dem Loslassen nach 0,1 s wieder 0. Absicht (1, 1) → Betrag der Geschwindigkeit 64 (± 0,5). Absicht (0,5, 0) → Ziel 32. `run: true` → 112. Ein Schritt mit `dt = 5` bewegt höchstens 11,2 Bildpunkte und nie durch eine eine Kachel dicke Wand (Review Focus 2). `dt` ≤ 0 oder `NaN` → unverändert.
  - Blickrichtung: folgt der stärkeren Achse; im Stand bleibt die letzte; bei exakt schräger Absicht bleibt die bisherige, wenn sie eine der beiden Achsen ist.
  - `walkFrameRow`: läuft bei Richtungswechsel im Takt weiter (hängt nur von `walkTime` ab); `walkTime` wächst nur, solange `moving`; im Stand wird sie 0.
  - Eingabe-Verteiler: ein Druck ist genau einmal abnehmbar (`consume` → `true`, dann `false`); nach 0,3 s ohne Abnehmer verfällt er; zwei Quellen addieren ihre Bewegung, der Betrag wird auf 1 begrenzt; `reset()` leert alles; `device` folgt der Quelle, die zuletzt etwas geliefert hat.
  - Tastatur (Fake-Ziel, das Ereignisse verteilt): links + rechts zugleich → `move.x === 0`; `KeyD` + `ArrowRight` → `move.x === 1`, nicht 2; schräg → Betrag 1; Ereignis `blur` → alle Tasten losgelassen (Review Focus 3); `keydown` mit `repeat: true` erzeugt keinen zweiten Druck; behandelte Tasten rufen `preventDefault()`, andere nicht.
- [ ] **Step 2: Tests schlagen fehl** — `cd v2 && npx vitest run tests/systems tests/input`
- [ ] **Step 3: Umsetzen.** Geschwindigkeit nähert sich dem Ziel linear mit `Tempo / ACCEL_TIME` je Sekunde; Bewegung achsenweise in Teilschritten von höchstens `MAX_STEP`; blockiert eine Achse und beträgt der Überstand quer dazu höchstens `CORNER_NUDGE`, wird quer zur freien Seite geschoben.
- [ ] **Step 4: Alles grün** — `cd v2 && npm run typecheck && npm test`
- [ ] **Step 5: Commit** — `git add v2/src/systems v2/src/input v2/tests/systems v2/tests/input` · `feat(v2): Bewegung mit Anlaufen, Gleiten und Eckenrutschen; Eingabeschicht`

---

### Task 12: Emilia, Kamera und Tiefensortierung in der Szene

**Files:**
- Create: `v2/src/systems/camera.ts`, `v2/src/entities/Actor.ts`, `v2/src/entities/Player.ts`, `v2/src/entities/controller.ts`, `v2/tests/systems/camera.test.ts`, `v2/tests/maps/start.test.ts`, `v2/tests/e2e/walk.spec.ts`
- Modify: `v2/src/maps/model.ts`, `v2/src/scenes/WorldScene.ts`, `v2/src/core/services.ts`, `v2/src/main.ts`, `v2/tests/e2e/bundle.preview.spec.ts`

**Interfaces:**
- Consumes: `stepMover`, `InputHub`, `KeyboardSource`, `depthForFoot`, `FIGURES`, `figureFrame`, `PixelGrid`.
- Produces:
  ```ts
  // camera.ts
  export const CAMERA_HALF_LIFE = 0.12;   // Sekunden bis zur halben Strecke
  export const LOOKAHEAD = 12;            // Bildpunkte Vorausschau in Laufrichtung
  export interface CameraState { x: number; y: number }   // Mittelpunkt, Gleitkomma
  export function stepCamera(cam: CameraState, target: { x: number; y: number; vx: number; vy: number }, dt: number,
    view: { width: number; height: number }, world: { width: number; height: number }): CameraState;
  export function cameraScroll(cam: CameraState, view: { width: number; height: number }): { scrollX: number; scrollY: number };   // ganze Zahlen
  // controller.ts — austauschbare Steuerquelle (Spec 6.3)
  export interface Controller { intent(): MoveIntent }
  export class InputController implements Controller { constructor(hub: InputHub) }
  export class IdleController implements Controller {}
  // Actor.ts
  export class Actor { constructor(scene: Phaser.Scene, figureId: string, x: number, y: number, facing: Facing);
    setPose(x: number, y: number, facing: Facing, row: number): void; get depth(): number; destroy(): void }
  // model.ts
  export function resolveStart(map: WorldMap, saved: { map: MapId; x: number; y: number }): { x: number; y: number };   // Bildpunkte
  ```
- Reihenfolge in `WorldScene.update(dt)` (einzige Stelle, Kommentar im Code): 1. `input.frame(dt)` 2. Abnehmer der Oberfläche (kommt in Plan 1b) 3. Spielerin 4. Kamera 5. Tiefe und Zeichenposition. Figuren und Kamera werden beim Zeichnen auf ganze Bildpunkte gerundet, gerechnet wird mit Gleitkomma.
- Test-Zugang (nur Entwicklung/Test): `player()` → `{ x, y, facing, moving }`, `teleport(tileX, tileY)`, `camera()` → `{ scrollX, scrollY }`, `depths()` → `{ player: number, objects: Record<number, number> }`.

- [ ] **Step 1: Tests schreiben.**
  - Kamera: 60 Schritte zu 1/60 s und 30 Schritte zu 1/30 s enden höchstens 0,5 Bildpunkte auseinander; nach 0,12 s ist die halbe Strecke zurückgelegt (± 1); bei Bewegung nach rechts liegt das Ziel 12 Bildpunkte vor der Figur; am Kartenrand zeigt die Kamera nie über die Karte hinaus; ist die Karte kleiner als der Ausschnitt, steht sie mittig; `cameraScroll` liefert ganze Zahlen; `dt` = `NaN` → unverändert.
  - `resolveStart` (Review Focus 4): gespeicherter Ort auf freier Kachel derselben Karte → dieser Ort (× 16); in einer festen Kachel → `map.spawn`; außerhalb der Karte → `map.spawn`; andere Karte → `map.spawn`; `NaN` → `map.spawn`.
  - `walk.spec.ts`: `D` 600 ms halten → `player().x` ist um 25 bis 45 Bildpunkte gewachsen, `facing === 'right'`; nach dem Loslassen `moving === false` binnen 200 ms. Neben den Waldrand teleportieren, `A` 1 s halten → x unterschreitet die Wandkante nicht. Schräg gegen den Waldrand (`A` + `S`) → y wächst weiter. Hinter einen Baum (Kachel über dem Stamm) → `depths().player` < Tiefe des Baums; davor → größer. Während des Laufens: `camera()` liefert ganze Zahlen und die Blockprüfung aus Task 3 gilt für einen Screenshot. Fenster auf 1367×769 ändern, während `D` gehalten wird → kein Fehler, Emilia im Bild.
  - `bundle.preview.spec.ts`: statt der Pixelfarbe gilt jetzt „mindestens 16 Farben im Screenshot".
- [ ] **Step 2: Tests schlagen fehl.**
- [ ] **Step 3: Umsetzen.** Kamera: `1 − 0,5^(dt / CAMERA_HALF_LIFE)` als Anteil je Schritt. `Actor`: Bild unten mittig am Fußpunkt, darunter `schatten.png` auf `DEPTH.flat`. `Player`: `Mover` + `Controller`. `Services` bekommt `input: InputHub`.
- [ ] **Step 4: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e && npm run test:bundle`
- [ ] **Step 5: Ansehen.** Entwicklungsserver über die Browser-Vorschau starten, durchs Dorf laufen, Screenshot und kurze Notiz nach `test-artifacts/etappe-1a/`: ruckelt die Figur gegenüber dem Bild? Wenn ja, zuerst die Rundung prüfen (Figur und Kamera müssen aus denselben Gleitkomma-Werten gerundet werden), dann `CAMERA_HALF_LIFE`.
- [ ] **Step 6: Commit** — `git add v2/src v2/tests` · `feat(v2): Emilia läuft durchs Dorf, Kamera folgt weich, Tiefe nach Fußpunkt`

---

### Task 13: Dorfbewohner an ihren Plätzen, Startablauf und Speichern

**Files:**
- Create: `v2/src/entities/Villager.ts`, `v2/tests/core/services.test.ts`, `v2/tests/e2e/persist.spec.ts`
- Modify: `v2/src/core/services.ts`, `v2/src/core/events.ts`, `v2/src/main.ts`, `v2/src/scenes/WorldScene.ts`

**Interfaces:**
- Consumes: `SaveStore`, `SaveService`, `openBrowserStorage` (Task 2), `createNewGameState`, `Actor`, `IdleController`.
- Produces:
  ```ts
  // events.ts
  export interface GameEvents { 'save:result': { reason: SaveReason; result: SaveResult } }   // Plan 1b ergänzt
  // services.ts
  export type StartNotice = 'save-corrupt' | 'save-newer' | 'storage-unavailable' | 'legacy-imported' | 'legacy-failed';
  export function startGame(store: SaveStore, now: number):
    { state: GameState; notice: StartNotice | null; persist: boolean; legacyNewer: boolean };
  export interface Services { pixelGrid: PixelGrid; input: InputHub; bus: EventBus<GameEvents>; state: GameState;
    save: SaveService; store: SaveStore; persist: boolean; startNotice: StartNotice | null; legacyNewer: boolean }
  ```
- Regeln von `startGame`:
  - `ok` → der Stand; `legacyNewer` ist wahr, wenn `legacyOffer` `'newer'` meldet (die Frage dazu stellt Plan 1b).
  - `empty` → gibt es einen alten Spielstand (`legacyOffer` = `'first'`), wird er ohne Nachfrage übernommen (es ist eine Kopie, der alte Schlüssel bleibt unberührt): gelingt das, Hinweis `legacy-imported` und sofort speichern; meldet die Übernahme `failed` oder `unreadable`, neues Spiel mit Hinweis `legacy-failed`. Ohne alten Stand: neues Spiel.
  - `corrupt` → wie `empty`; der Hinweis `save-corrupt` hat Vorrang (der Rohtext ist gesichert).
  - `newer` → neues Spiel, Hinweis `save-newer`, **es wird nie gespeichert**.
  - `unavailable` → neues Spiel, Hinweis `storage-unavailable`, es wird nicht gespeichert.
- Steht die Spielerin laut Stand auf einer Karte, die es in `MAP_FILES` noch nicht gibt (übernommener Stand aus Wald, See …), beginnt sie am Startpunkt des Dorfs.
- Gespeichert wird alle 60 s, beim Verstecken und Verlassen der Seite (wie Etappe 0). Vor jedem Speichern schreibt die Szene den Fußpunkt der Spielerin in Kacheln nach `state.player` und addiert die gelaufene Strecke in Kacheln auf `state.progression.stats.distanceWalked`.
- Mit aktivem Test-Zugang und `?stilprobe=1` stehen Lena und Julian rechts und links neben dem Startpunkt (nur für den Größenvergleich am Ende dieses Plans).

- [ ] **Step 1: Tests schreiben.**
  - `services.test.ts`: die fünf Fälle von `startGame` wie oben, jeweils mit einem Fake-Speicher; im Fall `newer` bleibt der gespeicherte Eintrag nach `save.saveNow('timer')` unverändert. Mit dem alten Stand `LEGACY_FIRST_COMMIT` aus `tests/save/legacySaves.ts` (die Formen dort wurden in Etappe 0 aus dem alten `SaveManager.js` und der Git-Historie abgeleitet) und leerem v2-Speicher → Level 3, `importedLegacyAt === 1711300000000`, `player.map === 'forest'`, Hinweis `legacy-imported`, der Stand ist gespeichert. Alter Stand `'[1,2]'` → neues Spiel, Hinweis `legacy-failed`. v2-Stand vorhanden und alter Stand neuer → `legacyNewer: true`, der v2-Stand bleibt. Für jede Vorlage aus `legacySaves.ts` (`LEGACY_FIRST_COMMIT`, `LEGACY_V3_FULL`, `LEGACY_NGPLUS`, `LEGACY_PARTIAL`, `LEGACY_LONG_INVENTORY`) und für je zehn verstümmelte Fassungen davon (einzelne Felder entfernt oder durch `null`, eine Zahl oder einen Text ersetzt; fester Zufallskeim) liefert `startGame` ohne Fehler einen Stand, den `normalizeState` mit `lossy: false` annimmt, und der Fake-Speicher zählt keinen einzigen Schreibzugriff auf die beiden alten Schlüssel.
  - `world.spec.ts`: neun Figuren stehen auf den Kacheln der Ebene `npcs`, jede mit einem anderen Figurenblatt; gegen eine Figur laufen → Emilia bleibt davor stehen.
  - `persist.spec.ts`: laufen, Test-Zugang `saveNow()`, Seite neu laden → `player()` höchstens 1 Bildpunkt vom alten Ort. Vor dem Laden die beiden alten Schlüssel setzen → nach Spielen und Speichern sind beide unverändert. `localStorage` so präparieren, dass `setItem` wirft → Spiel startet, Laufen geht, kein Konsolenfehler, Test-Zugang meldet `startNotice === 'storage-unavailable'` oder das letzte `save:result` ist `unavailable` (Review Focus 5). Einen Stand mit `formatVersion: 2` ablegen → Hinweis `save-newer`, der Eintrag bleibt nach `saveNow()` bytegleich. Alten Schlüssel mit `LEGACY_FIRST_COMMIT` füllen, v2-Speicher leer → Emilia steht am Startpunkt des Dorfs (die Karte `forest` gibt es noch nicht), `state().progression.level === 3`, der alte Schlüssel ist danach bytegleich.
- [ ] **Step 2: Tests schlagen fehl**, dann umsetzen. Ausgänge tun in diesem Plan noch nichts (Emilia bleibt am Kartenrand stehen); der Hinweis dazu kommt in Plan 1b.
- [ ] **Step 3: Alles grün** — `cd v2 && npm run typecheck && npm test && npm run test:e2e && npm run test:bundle`
- [ ] **Step 4: Commit** — `git add v2/src v2/tests` · `feat(v2): Dorfbewohner stehen im Dorf; Start und Speichern verdrahtet`

---

### Abschluss 1a

- [x] In `v2/`: `npm run typecheck && npm test && npm run test:e2e && npm run test:bundle` — alles grün. Im Stamm: `npm test && npm run build`, danach `ls dist/index.html dist/v2/index.html`.
- [x] `git status` ist sauber; keine fremden Dateien im Stamm; unter `v2/src/assets/gfx/` liegt nichts, das nicht in `quellen.json` steht.
- [x] Skill `superpowers:requesting-code-review` für den gesamten Branch; Prüfer gleicht alle im Plan genannten Alt-Quellen gegen den alten Code ab.
- [x] **Stil-Prüfung mit dem Auftraggeber** — am 2026-11-14 anhand von Bildern geführt (Auftraggeber war unterwegs); Antworten und Änderungen stehen im Abschluss unter den Punkten 15–17 und „Für die Stil-Prüfung". Offen bleibt nur die Prüfung von Hand am echten Gerät (Windows 125 %/150 %, iPad). Ursprünglicher Auftrag: am lebenden Objekt (lokal über die Browser-Vorschau, mit `?stilprobe=1`; dazu Screenshots nach `test-artifacts/etappe-1a/`). Fragen, eine nach der anderen: Gefällt das Dorf so? Stimmt das Größenverhältnis (Julian kleiner als Emilia und Lena, die kleiner als die Erwachsenen — reicht ein Bildpunkt Unterschied)? Passen die Figuren zu den Personen (Zuordnungstabelle zeigen)? Sind Marie und Liam Kinder oder Erwachsene? Änderungen hier einarbeiten, bevor Plan 1b beginnt.
- [x] Abschluss-Abschnitt an diesen Plan anhängen: was gegenüber dem Plan geändert wurde, endgültige Figuren-Zuordnung, Liste `COLLISION_CHANGES`, gefundene Phaser-4-Aufrufe, offene Punkte für 1b.
- [x] Auftraggeber gefragt; Antwort am 2026-11-14: „Ja, veröffentlichen". Per Fast-Forward in `main` gemergt und gepusht (`ad553ab..fd2fc50`), danach die Test-Korrektur aus „Offene Punkte" (erster Lauf der Auslieferung). Ursprünglicher Auftrag: Auftraggeber fragen, ob der Branch in `main` gemergt und veröffentlicht werden soll (unter `/v2/` ist dann das begehbare Dorf ohne Gespräche zu sehen; das alte Spiel bleibt unverändert).

---

## Abschluss Etappe 1a — Stand 2026-11-14 (vor der Stil-Prüfung)

Umgesetzt per Subagent-Driven Development auf dem Branch `v2/etappe-1a-welt` (abgezweigt von `plan/etappe-1`), alle 13 Tasks mit eigener Prüfung, danach Schlussprüfung des ganzen Branchs und eine Fix-Welle. Nichts ist gemergt oder gepusht.

**Prüfstand am Ende:** `v2/`: Typprüfung ohne Fehler, Vitest 644 bestanden und Playwright 104 (nach den Änderungen aus der Stil-Prüfung und danach, Punkte 15–19; mit Pack 646; 3 übersprungen: Tests, die das Pack oder Emilias echte Datei brauchen), Playwright 100 bestanden / 19 übersprungen (Chromium, WebKit, gebautes Paket), Paket-Schutztests 9 von 9, Grafik- und Kartentests mit Pack grün. Stamm: `npm test` und `npm run build` in Ordnung; am alten Spiel ist nichts geändert. Hinweis zur Reihenfolge: Der Stamm-Build leert `dist/`; erst danach `cd v2 && npm run build`, dann liegen `dist/index.html` und `dist/v2/index.html` beide vor (die Auslieferung baut ohnehin getrennt).

### Was gegenüber dem Plan geändert wurde (Entscheidungen während der Umsetzung)

1. **Downloads gebündelt erfragt** (statt je Task): `pngjs`, `@types/pngjs`, `@types/node` und der Testbrowser WebKit; vom Auftraggeber am 2026-11-14 freigegeben.
2. **Farbprüfung des gebauten Pakets** („mindestens 16 Farben") schon in Task 10 statt 12, weil das Dorf ab Task 10 gezeichnet wird.
3. **Schachbrett-Probe:** Chromiums Emulation rundet Screenshot und Zeichenfläche bei genau halben Gerätepixeln verschieden; der Test verkleinert in diesen fünf Kombinationen ein Maß um einen CSS-Pixel (alle 36 Kombinationen bleiben).
4. **WebKit:** Die Schachbrett-Probe läuft dort nur bei ganzzahliger Pixeldichte (1, 2, 3). WebKit gibt es nur auf Apple-Geräten mit ganzzahliger Dichte; gebrochene Dichte ist Windows und Android (Chromium).
5. **Figuren:** Oma ist mit der Vorlage `OldWoman` nur 15 Bildpunkte hoch (wie Emilia). Höhe wird als höchste Pose über alle Zellen gemessen. Bei den Kindern wurden Haar- statt Körperzeilen entfernt. Mehrere Farben weichen vom alten Spiel ab (siehe Tabelle).
6. **Eine Zeichenregel:** Der Tiefenschlüssel alles Stehenden ist das y der Linie, auf der sein Bild steht — bei Kartenobjekten die Unterkante ihrer Kachel (`standLineOf`), bei Figuren der Fußpunkt. Orte im Kartenmodell bleiben Kachelmitten.
7. **Meldungen** mit typografischen Anführungszeichen („…“); das gerade Schlusszeichen im Plan war ein Tippfehler.
8. **Eckenrutschen:** gleitet im Lauftempo (kein Sprung). Regel bei schräger Eingabe: Zeigt die Absicht überwiegend auf die Wand (Queranteil höchstens die Hälfte), rutscht die Figur um die Ecke, sonst gleitet sie an der Wand (`NUDGE_MAX_CROSS_RATIO = 0.5`). Die Rutschzone endet genau bei `CORNER_NUDGE = 5`.
9. **Browser-Tests** laufen mit zwei Workern; der Lauftest misst die Haltezeit in der Seite und prüft das Tempo (41–75 Bildpunkte je Sekunde).
10. **Startablauf:** Bei leerem oder kaputtem v2-Speicher wird `importLegacy` direkt gerufen (nicht erst `legacyOffer(null)`), sonst wäre der verlangte Hinweis `legacy-failed` für einen unlesbaren alten Stand nicht erreichbar. Sitzungen, die nicht speichern dürfen, bekommen einen Speicher ohne Schreibzugriff.
11. **Weg:** rotbrauner Erdweg aus `TilesetFloor.png` statt „Sandweg" (das Pack hat keinen Sandweg auf Wiese; das alte Spiel hatte „dirt path").
12. **Wegverbreiterung:** Die Stiche zu den Werkstätten waren in der Vorlage schon zwei Kacheln breit; verbreitert wurde der Ring um den Dorfplatz, drei Lücken im Hauptweg sind geschlossen (`PATH_WIDEN`, 8 Einträge).
13. **Probe-Szene** wird weiter in `main.ts` gewählt (hält sie aus dem Produktions-Paket); `fps.smoothStep` ist aus (sonst Zeitlupe unter 60 Bildern je Sekunde); die Kamera zielt mit `centerOn` (Phaser kappt Kachel-Ebenen nach `worldView`, das den Ursprung ignoriert).
14. **Fix-Welle nach der Schlussprüfung:** keine klebende Taste bei Zusatztasten, Rechtsklick-Menü und verborgener Seite; Fuß auf der unteren Kartenkante bleibt beim Neuladen stehen; Paket-Schutztest sucht weitere Test-Zugänge und prüft den ganzen CSP-Wortlaut.
15. **Lagerfeuer versetzt (Stil-Prüfung, Wunsch des Auftraggebers am 2026-11-14):** Im alten Spiel stand es mitten auf dem Südweg (20/19). Es steht jetzt auf der Wiese östlich neben dem Weg auf 22/20, in Babas Blickrichtung; der Südweg ist durchgehend frei. Das weicht bewusst von Task 9 ab („Ort des Lagerfeuers unverändert"). Baba bleibt auf 18/20.
16. **Marie und Liam sind Kinder (Stil-Prüfung, Antwort des Auftraggebers am 2026-11-14):** Beide Blätter verlieren je Zelle eine Zeile (Marie aus der Mütze, Liam aus den Haaren; Zeilen je Richtung und Haltung so gewählt, dass der Umriss geschlossen bleibt). Höchste Pose jetzt 15 statt 16 wie bei Emilia und Lena; im Stehen ist Marie 15 hoch wie Emilia, Liam 14 wie Lena. Gemessen im Stehen: Papa, Opa, Baba 16; Mama, Deda, Ferdinand 15 (16 erreichen sie erst im Schritt nach oben); Oma immer 15. Marie reicht mit der Zipfelmütze also im Stehen so hoch wie Mama. Die Gesichter (Porträts) sind unverändert.
17. **Zäune, Truhen, Wegweiser und Büsche sind fest (Stil-Prüfung, Antwort des Auftraggebers am 2026-11-14):** Regel `SOLID_TYPES` in `restyle-hub.mjs`: Jedes Objekt dieser vier Arten sperrt seine Kachel (12 Zäune, 2 Truhen, 5 Wegweiser, 11 Büsche; 29 neu gesperrte Kacheln, der Busch 33/9 stand schon auf einer Hauskachel). Hühner, Blumen, Steine, Beete und Rohstoffe bleiben durchlaufbar. Drei Folgen, bewusst abweichend vom alten Spiel: (a) **Gartentor** `GARDEN_GATE`: Die beiden Zaunstücke 10/21 und 11/21 entfallen, weil dort der Weg zum Garten ankommt und sonst an einer Wand endete. (b) **Wegweiser zur Höhle** `SIGNPOST_MOVE`: von 37/14 (mitten auf dem Ostweg) nach 37/13 neben den Weg. (c) Die **Truhe 9/9** steht auf dem Vorplatz der Küche und sperrt dort eine Wegkachel (Vorplatz 5×2); die Kachel 9/8 dahinter ist dadurch eine unerreichbare, leere Nische. Tests: jede freie Kachel sonst erreichbar; Truhen, Beete, Rohstoffe, Regal und Stationen haben eine erreichbare Nachbarkachel.
18. **Ruckeln beim Rennen behoben (Rückmeldung des Auftraggebers nach dem Veröffentlichen, 2026-11-14: „wenn man schnell rennt, dann wackelt alles etwas"):** Gemessen bei 1920×1080 (Zoom 6): Die Kamera rastete auf ganze Bildpunkte ein; bei 112 Bildpunkten je Sekunde sind das je Bild mal 2, mal 1 Bildpunkt, also Sprünge von 12 und 6 Bildschirmpixeln, etwa achtmal je Sekunde (beim Gehen seltener, darum fiel es dort kaum auf). Jetzt rasten Kamera und laufende Figur auf ganze Bildschirmpixel ein (`snapToScreen` in `core/pixel.ts`, `cameraScroll(…, zoom)`, `Actor.setPose(…, zoom)`); nachgemessen 10–12 Bildschirmpixel je Bild beim Rennen, 5–7 beim Gehen. Das weicht von Spec 8.1 ab („rasten auf ganze Bildpunkte ein"); die Spec ist angepasst. Folgen: Die laufende Figur liegt um Bruchteile eines Bildpunkts neben dem Raster der Welt; `blockProblems` in den Browser-Tests liest die Lage des Rasters aus dem Bild und nimmt die Figur aus; neuer Test-Zugang `playerPose()`. Nachgelesen in Phaser 4.2.1 (`cameras/2d/Camera.js` preRender): `scrollX/scrollY` werden nicht gerundet, `roundPixels` wirkt im WebGL-Renderer nicht auf gewöhnliche Sprites.
19. **Abstand am PC größer (Rückmeldung des Auftraggebers, 2026-11-14: „das Spiel ist auch zu nahe … am Handy ist die Entfernung gut"; aus drei Vergleichsbildern wählte er „Mittel"):** Das Mindestfeld ist auf großen Bildschirmen (kürzere Seite ab 500 CSS-Pixel) 288×216 statt 240×180 Bildpunkte; Handys bleiben bei 240×180 (`MIN_VIEW`, `MIN_VIEW_SMALL`, `LARGE_SCREEN_CSS` in `core/pixel.ts`; `computeZoom`/`computeLayout` bekommen die Pixeldichte). Full HD: Zoom 5 statt 6, sichtbar 24×13½ statt 20×11¼ Kacheln; iPad quer: Zoom 7 statt 8, 18×13½ statt 16×12 Kacheln; Handy quer und hochkant unverändert. Spec 8.1 ist angepasst.
20. **Bestätigung des Auftraggebers am PC (2026-11-14, nach der Veröffentlichung von `e80ba94`): „passt"** – gefragt war, ob das Rennen jetzt ruhig aussieht und der Abstand stimmt. Auf dem iPad ist beides noch nicht angesehen.

**Fehler im Plantext, die bei der Umsetzung auffielen:** `starsky` führt acht `npc`-Objekte *mit* Dorfbewohner-Kennungen (nicht ohne). `resetQuests` im alten Spiel ruft ein nicht vorhandenes `_assignNextQuest()`; ein echter New-Game-Plus-Stand sieht deshalb anders aus als die Vorlage `LEGACY_NGPLUS` (v2 verarbeitet die echte Form richtig; eine Vorlage in echter Form fehlt noch in der Verstümmelungs-Schleife). Mein Testraster fürs Eckenrutschen war zweimal falsch gestellt (0,5-s-Grenze; 5 Bildpunkte Überstand mit Querabsicht).

### Figuren-Zuordnung (in der Stil-Prüfung am 2026-11-14 bestätigt)

| Figur | Vorlage im Pack | Höhe | Aussehen und Abweichung |
|---|---|---|---|
| emilia | `Princess` | 15 | dunkelbraunes Haar, rosa Kleid, rosa Schleife |
| lena | `Woman` | 15 | blond mit Haarband, blaues Kleid |
| julian | `Villager4` | 13 (14 breit) | blond, rotes Hemd |
| mama_tanja | `Villager3` | 16 | brauner Bob, rosa Oberteil |
| papa_milos | `Villager2` | 16 | schwarze Locken, blaue Hose; kein blaues Hemd |
| marie | `ManGreen` | 15 (Kind) | blond unter grüner Zipfelmütze; grün statt gelb |
| liam | `Boy` | 15 (Kind) | dunkelbraune Strubbelhaare, grünes Hemd |
| oma | `OldWoman` | 15 | graue lange Haare, malvenfarbenes Kleid |
| opa | `OldMan3` | 16 | Strohhut, weißer Bart, olivgrünes Gewand |
| baba | `Cavegirl2` | 16 | rotbraune Haare, rotes Kleid; wirkt jung |
| deda | `OldMan2` | 16 | dunkelblaue Mütze, weißer Schnurrbart |
| ferdinand | `Noble` | 16 | türkise Melone und Anzug (Händler) |

Ein Tausch der Vorlage ist eine Zeile in `v2/tools/art/selection.mjs`; die vollständige Liste mit Ausschnitten steht in `v2/src/assets/gfx/QUELLEN.md`.

### `COLLISION_CHANGES` (40 Abweichungen der Sperrflächen von der Vorlage; die Obergrenze im Test ist damit erreicht)

Die Liste mit Begründung je Kachel steht in `v2/tools/maps/restyle-hub.mjs`; das Werkzeug wirft, wenn ein Eintrag keine Abweichung ist, und der Test prüft sie in beide Richtungen.

- 28 Kacheln neu gesperrt für die vier Häuser hinter den Werkstätten: Küche 7–9/6–7, Werkstatt 29–31/6–7, Alchemie 33–34/8, 32–34/9, 32–33/10, Sägewerk 30–32/19–21.
- Neu gesperrt: Dorfbrunnen 20/13 (statt des begehbaren Felses auf dem Startpunkt 19/14), Trophäenregal 5/10, die Stammkacheln der beiden rosa Bäume 22/8 und 22/22.
- Drei Bäume um eine Kachel versetzt, damit ihre Krone nichts verdeckt (jeweils alte Kachel frei, neue gesperrt): 23/3 → 24/3, 23/28 → 24/28, 13/24 → 14/24.
- Lagerfeuer versetzt (Wunsch des Auftraggebers): 20/19 frei, 22/20 gesperrt. Damit ist keine Wegkachel mehr gesperrt; die frühere Ausnahme im Test „Wegkacheln bleiben begehbar" entfällt.
- Nicht in dieser Liste, sondern als Regel (`SOLID_TYPES`, siehe Punkt 17 oben): die 29 Kacheln der festen Zäune, Truhen, Wegweiser und Büsche. Einzige gesperrte Wegkachel ist seitdem die Truhe 9/9 auf dem Küchen-Vorplatz.

### Phaser 4 — nachgelesene Aufrufe

Stichwortliste im Kopfkommentar von `v2/src/scenes/world/buildLayers.ts` (Tilemap aus Tiled-JSON, `addTilesetImage` über den Namen, `createLayer`, Einzelbilder per `textures.get(key).add(…)`, stabile Sortierung nach `depth`, Animation aus Einzelbildern, Kamera `setViewport`/`setZoom`/`centerOn`). Drei Fallen, die Tests jetzt abdecken: `setOrigin(0,0)` an der Kamera lässt Kachel-Ebenen verschwinden; `fps.smoothStep` bremst unter 60 Bildern je Sekunde; `setFrame()` rechnet den Anker neu (Objektbilder stehen deshalb mit Ursprung 0/0 an ganzzahliger Ecke).

### Für die Stil-Prüfung mit dem Auftraggeber

- Gefällt das Dorf (Erdweg statt Sandweg; Tannen wirken wie Büsche; Gartenecke mit Blumen unter den Zäunen unruhig)? **Antwort 2026-11-14 (anhand von Bildern, unterwegs): „ja, gefällt mir", mit einer Änderung: Das Lagerfeuer stand auf dem Weg und ist versetzt (siehe Punkt 15 oben).**
- Größen: Kinder sind meist nur einen Bildpunkt kleiner als Erwachsene; Oma ist so hoch wie Emilia. **Antwort 2026-11-14: „passt" – die Größen bleiben, wie sie sind.**
- Zuordnung der Figuren (Tabelle oben): Papa ohne Hemd in Blau, Marie in Grün, Baba wirkt jung; Emilia und Mama ähneln sich am meisten. **Antwort 2026-11-14 (anhand des Figurenbilds, die vier Punkte waren genannt): „ja" – alle zwölf Zuordnungen bleiben.** Sind Marie und Liam Kinder oder Erwachsene? **Antwort 2026-11-14: „Kinder" – beide sind jetzt so groß wie Emilia und Lena (siehe Punkt 16 oben).**
- **Antwort 2026-11-14 zu den drei Punkten Schatten, Dedas Platz und Gartenecke: „Ja, so lassen".**
- Schatten der Figuren ist kaum zu sehen (liegt fast ganz unter der Figur). Bleibt so.
- Gartenecke mit Blumen zwischen den Zäunen wirkt etwas unruhig. Bleibt so.
- Zäune, Truhen, Wegweiser, Büsche und Hühner sind wie im alten Spiel durchlaufbar; mit der neuen Tiefensortierung wirkt das wie ein Fehler. Sperren? **Antwort 2026-11-14: „Ja, fest machen" – Zäune, Truhen, Wegweiser und Büsche sind fest, Hühner bleiben durchlaufbar (siehe Punkt 17 oben).**
- Lena (Stilprobe) und Deda stehen dicht unter Brunnen und Kessel. Bleibt so.
- **Noch offen** – von Hand am echten Gerät: Schärfe bei Windows-Skalierung 125 % und 150 % (Fenster auch zwischen Bildschirmen ziehen) und auf dem iPad; ruckelt etwas beim Laufen?

### Offene Punkte

- **Vorab-Arbeiten für Plan 1b** aus der Schlussprüfung stehen dort im Abschnitt „Vorab aus der Schlussprüfung von 1a".
- **Erster Lauf der Auslieferung (2026-11-14, Lauf 43599552538, Stand `fd2fc50`):** WebKit mit WebGL unter Linux lief durch (alle WebKit-Tests grün). Gescheitert ist ein Chromium-Test, dreimal in Folge: `persist.spec.ts` „die alten Schlüssel bleiben …", in der Hilfsfunktion `hold` (Emilia stand nach dem Loslassen nicht binnen 1000 ms). Wie vorgesehen blieb das alte Spiel unberührt, `/v2/` fehlte in dieser Auslieferung (404). **Ursache, auf GitHub gemessen** (Branch `diag/ci-persist` mit eigenem Workflow, danach gelöscht): Auf dem Linux-Rechner mit Software-Grafik stockt das Bild etwa 1 s nach jedem Seitenstart, allein 0,3–0,7 s, mit zwei Workern bis 1007 ms ohne ein einziges Bild. Tasten kommen an, es gibt weder `blur` noch Seitenfehler, und Emilia steht 110 ms nach dem nächsten Bild. Lokal (Windows) tritt das Stocken nicht auf, auch nicht mit gedrosselter CPU. **Korrektur:** Die Wartegrenze in `hold` ist 5000 statt 1000 ms; sie ist dort keine Zeitmessung (die steht in `walk.spec.ts`, 200 ms, und lief auf GitHub durch). **Bleibt offen:** Woher das Stocken kommt (vermutlich die Software-Grafik des Testrechners), ist nicht geklärt; am echten Gerät darauf achten. **Nachtrag 2026-11-14:** `walk.spec.ts` „D gedrückt …" scheiterte in den beiden folgenden Läufen je einmal im ersten Versuch (35 px/s auf der Wanduhr; Taste 1500 ms gedrückt). Der Test misst jetzt in Spielzeit (Summe der Bildabstände, jeder höchstens `MAX_DT`) statt auf der Wanduhr, und ein zweiter Test lässt die Seite mitten im Lauf 900 ms hängen (Tempo in Spielzeit bleibt, kein Sprung). Gegenprobe mit drei eingebauten Fehlern (Gehtempo 32, `ACCEL_TIME` 0,5 s, `MAX_DT` 5 s): alle gefunden. Nicht gegengeprüft ist Zeitlupe durch Phasers Glättung (`smoothStep`). Weiter mit Wanduhr-Grenzen kurz nach dem Seitenstart: `keys.spec.ts` (300/500 ms) und `persist.spec.ts` („mehr als 10 Bildpunkte in 500 ms"); beide liefen auf GitHub bisher durch.
- **Übernommener Ort:** Ein alter Stand aus Wald, See … startet im Dorf am Startpunkt; nach dem ersten Bild steht im v2-Stand `hub`. Level, Rucksack, Aufgaben und besuchte Karten bleiben; der alte Schlüssel bleibt bytegleich.
- **Kleinigkeiten, die bleiben dürfen** (laut Schlussprüfung): toter Ausdruck in `repairQuests`; Filter in `convert.mjs` nur nach Ziel; PNG-Bytes hängen von der zlib-Version ab (Vergleich läuft nur lokal mit Pack); Fußpunkt mehrzeiliger Objekt-Rechtecke (hub hat keine); unbegrenzte Teilschritte in `moveAndSlide`; Bildzeile springt beim Wechsel Gehen/Rennen; `pose`-Getter im Paket.
