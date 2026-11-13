# Emilia 2.0 — Etappe 0: Sofort-Korrekturen und Fundament — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drei Sofort-Korrekturen im laufenden Spiel ausliefern und daneben das geprüfte Fundament für Version 2.0 legen (Projekt `v2/`, Pixelraster, typisierte Inhaltsdaten, Spielzustand, Spielstand-Übernahme, exportierte Karten, Auslieferung beider Versionen).

**Architecture:** Teil A ändert das bestehende JavaScript-Spiel minimal und sichert jede Änderung mit einem Test ab. Teil B legt im selben Repo das eigenständige Projekt `v2/` an (Phaser 4, TypeScript, Vite); es liest den alten Spielstand nur und schreibt unter einem eigenen Schlüssel. Die Auslieferung baut beide Projekte in ein gemeinsames `dist/` — altes Spiel an der bekannten Adresse, neues unter `/v2/`.

**Tech Stack:** Altprojekt: JavaScript, Three.js 0.183, Vite 6, neu Vitest. `v2/`: Phaser ^4.2.1, TypeScript ^7.0.2, Vite ^8.3.8, Vitest ^5.1.0, @playwright/test ^1.65.0 (Stand npm 2026-11-13).

**Spec:** `docs/superpowers/specs/2026-11-13-emilia-2-ueberarbeitung-design.md` — dieser Plan setzt Abschnitt 12, Etappe 0a und 0b um, mit den Regeln aus 3, 7.2, 8.1, 11.1, 11.2 und 11.3.

**Abgrenzung (bewusst nicht in diesem Plan):**
- Etappe 1 (Dorf im neuen Look) bekommt einen eigenen Plan, sobald der Stiltest entschieden ist; vorher stehen Bildmaße und Atlas-Aufbau nicht fest.
- Spiellogik (Rucksack, Aufgaben, Freundschaft, Herstellen, Angeln, Garten) zieht jeweils mit der Etappe um, die sie braucht. Etappe 0 legt dafür Daten, Spielzustand und Spielstand fest.
- Die neuen Kampf- und Wirtschaftswerte aus Spec 7.1 und 7.3 kommen mit Etappe 2 und 3, zusammen mit den Tests für die Leitplanken aus 7.4. Hier gilt nur die Level-Kurve aus 7.2.
- Serbische Sonderzeichen bei Baba und Deda: Textdurchgang in Etappe 1 mit Gegenlesen durch den Auftraggeber.

## Global Constraints

- Nie direkt auf `main` arbeiten. Teil A auf Branch `hotfix/0a-sofort-korrekturen`, Teil B auf Branch `v2/etappe-0-fundament`.
- **Ein Push auf `main` veröffentlicht die Live-Seite.** Mergen und Pushen nur nach ausdrücklicher Freigabe des Auftraggebers im Chat.
- Commit-Nachrichten enden mit der Zeile `Co-Authored-By: claude-flow <ruv@ruv.net>`.
- Der alte Spielstand-Schlüssel `emilia_pixel_adventure_save` und `emilia_muted` werden von `v2/` nur gelesen, nie geschrieben oder gelöscht.
- Basis-Pfade: altes Spiel `/emilia-pixel-adventure/`, neues `/emilia-pixel-adventure/v2/`.
- Keine externen Anfragen zur Laufzeit. Content-Security-Policy von `v2/index.html` mindestens so streng wie die des alten Spiels: `default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; script-src 'self'`.
- Alle deutschen Texte in `v2/` mit echten Umlauten und ß.
- Quelldateien unter 500 Zeilen. Keine neuen Dateien im Repo-Stamm.
- Screenshots und andere Testartefakte nach `test-artifacts/` (git-ignoriert).
- Phaser 4: vor dem Verdrahten die aktuelle Dokumentation zu Pixelart, Skalierung und Kamera lesen; nicht aus Phaser-3-Wissen ableiten.
- Nie `git add -A` oder `git add .` verwenden, sondern nur die im Schritt genannten Pfade; nach jedem Schritt `git status` prüfen. Hintergrund: Bis zum 2026-11-13 legten fehlerhafte Projekt-Hooks leere Dateien im Repo-Stamm an (`{`, `[k`, `0)`). Das ist behoben; tauchen solche Dateien wieder auf, zuerst die Hook-Befehle in `.claude/settings.json` prüfen (sie dürfen nicht mit `cmd /c` beginnen).
- Vite des Altprojekts wird nicht angehoben.

## Review Focus

1. **Spielstand in unerwarteter Form** (Inventar mit 40 statt 48 Plätzen, `null`-Plätze, unbekannte Gegenstände): Übernahme liefert trotzdem einen vollständigen Zustand mit 48 Plätzen. → Test in Task 8.
2. **`localStorage` nicht verfügbar oder voll** (privater Modus, Kontingent): Speichern meldet `false`, Laden `null`, nichts wirft. → Test in Task 9.
3. **Neuerer Spielstand trifft auf älteren, zwischengespeicherten Build:** Der Build lädt ihn nicht und überschreibt ihn nicht. → Test in Task 9.
4. **Fenstergröße 0, negativ oder `NaN`** (verstecktes Tab, Drehen des Geräts): Zoom ist 1, nie 0, `NaN` oder unendlich. → Test in Task 5.
5. **Altes Spiel: Spielstand verschwindet zwischen Menü-Anzeige und Klick auf „Spielstand sichern":** kein Download, kein Fehler. → Test in Task 3.

---

## Dateiübersicht

**Teil A — Altprojekt (Repo-Stamm):**

| Datei | Aufgabe |
|---|---|
| `src/utils/Blink.js` (neu) | Sichtbarkeit beim Blinken, endet immer sichtbar |
| `src/utils/SaveExport.js` (neu) | Dateiname und Download der Sicherung |
| `src/utils/Constants.js` | neue Konstante `MOB_RESPAWN_SECONDS` |
| `src/entities/{Player,Mob,Crab,GhostCrab,Jellyfish,Octopus,Boss}.js` | nutzen `blinkVisible`; Respawn-Konstante |
| `src/systems/SaveManager.js`, `src/ui/MainMenu.js`, `src/core/Game.js` | Knopf „Spielstand sichern" |
| `tests/unit/*.test.js` (neu) | Vitest-Tests |
| `tests/regression/harness.mjs`, `tests/regression/hotfix-0a.mjs` (neu) | Prüfung im echten Spiel |
| `package.json`, `vite.config.js`, `.github/workflows/deploy.yml` | Testskripte, Testlauf vor dem Bauen |

**Teil B — `v2/`:**

| Datei | Aufgabe |
|---|---|
| `v2/package.json`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `index.html` | Projektgerüst |
| `v2/src/main.ts`, `src/scenes/BootScene.ts`, `src/core/testHooks.ts` | Start, leere Szene, Test-Zugang |
| `v2/src/core/pixel.ts` | Zoom- und Sichtfeld-Berechnung |
| `v2/src/data/*.ts` | typisierte Inhaltsdaten |
| `v2/src/core/levels.ts`, `state.ts`, `events.ts` | Level-Kurve, Spielzustand, Ereignisse |
| `v2/src/save/legacy.ts`, `store.ts`, `service.ts` | Übernahme, Speicher, Speicherzeitpunkte |
| `v2/tools/legacy-maps/convert.mjs`, `tools/export-legacy-maps.mjs` | Karten-Export |
| `v2/src/maps/tiled.ts`, `validate.ts`, `v2/src/assets/maps/*.json` | Kartenformat, Prüfung, exportierte Karten |
| `v2/tests/**` | Tests |

---

# Teil A — Sofort-Korrekturen im alten Spiel

### Task 1: Testlauf einrichten und das Unsichtbar-Bleiben nach Treffern beheben

**Ursache:** `Player.js:64-70` setzt `visible = Math.floor(hitFlashTimer * 10) % 2 === 0`. Im letzten Durchlauf ist der Timer leicht negativ, `Math.floor` ergibt `-1`, `-1 % 2` ist `-1`, also bleibt die Figur unsichtbar, bis die Animation wechselt. Dasselbe Muster steht in sieben weiteren Stellen.

**Files:**
- Create: `src/utils/Blink.js`, `tests/unit/blink.test.js`, `tests/regression/harness.mjs`, `tests/regression/hotfix-0a.mjs`
- Modify: `src/entities/Player.js:68,113`, `src/entities/Mob.js:145`, `src/entities/Crab.js:234`, `src/entities/GhostCrab.js:260`, `src/entities/Jellyfish.js:216`, `src/entities/Octopus.js:354`, `src/entities/Boss.js:193`
- Modify: `package.json` (Skripte, devDependency), `vite.config.js` (Testbereich), `.github/workflows/deploy.yml` (Testschritt)

**Interfaces:**
- Produces: `blinkVisible(timerSeconds: number, hz: number): boolean`
- Produces (`tests/regression/harness.mjs`): `startServer(): Promise<{ url: string, close(): Promise<void> }>`, `launchBrowser(): Promise<Browser>`, `startNewGame(page, url): Promise<void>`, `check(name: string, fn: () => Promise<void>): Promise<void>`, `finish(): never` (beendet mit Code 1, wenn eine Prüfung fehlschlug)

- [ ] **Step 1: Vitest einrichten**

Höchste Vitest-Version installieren, deren `peerDependencies` Vite 6 zulassen (`npm view vitest peerDependencies` prüfen). In `package.json` die Skripte `"test": "vitest run"` und `"test:regression": "node tests/regression/hotfix-0a.mjs"` ergänzen. In `vite.config.js` den Block `test: { include: ['tests/unit/**/*.test.js'] }` ergänzen, damit weder die alten `.cjs`-Skripte noch später `v2/` erfasst werden.

- [ ] **Step 2: Fehlschlagenden Test schreiben**

```js
// tests/unit/blink.test.js
import { describe, it, expect } from 'vitest';
import { blinkVisible } from '../../src/utils/Blink.js';

describe('blinkVisible', () => {
  it('ist sichtbar, sobald der Timer abgelaufen ist', () => {
    expect(blinkVisible(0, 10)).toBe(true);
    expect(blinkVisible(-0.005, 10)).toBe(true);
    expect(blinkVisible(-0.1, 15)).toBe(true);
  });
  it('wechselt während des Blinkens im Takt', () => {
    expect(blinkVisible(0.05, 10)).toBe(true);
    expect(blinkVisible(0.15, 10)).toBe(false);
    expect(blinkVisible(0.25, 10)).toBe(true);
  });
});
```

- [ ] **Step 3: Test laufen lassen**

Run: `npm test`
Expected: FAIL, Modul `src/utils/Blink.js` nicht gefunden.

- [ ] **Step 4: `blinkVisible(timerSeconds, hz)` in `src/utils/Blink.js` umsetzen**

Liefert `true`, wenn `timerSeconds <= 0`, sonst `Math.floor(timerSeconds * hz) % 2 === 0`.

- [ ] **Step 5: Alle acht Stellen umstellen**

Jede Zuweisung `…mesh.visible = Math.floor(this.<timer> * <hz>) % 2 === 0` wird zu `…mesh.visible = blinkVisible(this.<timer>, <hz>)` (10 Hz, in `Player.js:113` 15 Hz). Sonst nichts an diesen Dateien ändern.

Run: `npm test` → PASS. Danach `grep -rn "FlashTimer \* 1[05]) % 2" src` → keine Treffer.

- [ ] **Step 6: Prüfung im echten Spiel schreiben**

`harness.mjs` startet Vite über `createServer` auf freiem Port und Chromium mit `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. `startNewGame` klickt „Neues Spiel" und wartet auf `window.__game.running`.

Prüfung „Emilia bleibt nach Treffern sichtbar" in `hotfix-0a.mjs`: zwölfmal `player.invulnTimer = 0; player.takeDamage(1)`, je 1500 ms warten, dann muss `player.activeSprite.mesh.visible === true` sein.

- [ ] **Step 7: Prüfung laufen lassen**

Run: `npm run test:regression`
Expected: `PASS Emilia bleibt nach Treffern sichtbar`, Exit-Code 0. Gegenprobe: mit `git stash` der Änderungen aus Step 5 muss sie mit Exit-Code 1 fehlschlagen.

- [ ] **Step 8: Testlauf in die Auslieferung aufnehmen**

In `.github/workflows/deploy.yml` nach `npm ci` den Schritt `- run: npm test` einfügen.

- [ ] **Step 9: Commit**

```bash
git add src/utils/Blink.js src/entities tests/unit/blink.test.js tests/regression package.json package-lock.json vite.config.js .github/workflows/deploy.yml
git commit -m "fix: Figuren bleiben nach Treffern sichtbar"
```

### Task 2: Gegner kommen nicht mehr nach fünf Sekunden wieder

**Files:**
- Modify: `src/utils/Constants.js`, `src/entities/Mob.js:136`, `src/entities/Crab.js:225`, `src/entities/GhostCrab.js:251`, `src/entities/Jellyfish.js:207`, `src/entities/Octopus.js:345`
- Test: `tests/unit/respawn.test.js`, `tests/regression/hotfix-0a.mjs`

**Interfaces:**
- Consumes: `harness.mjs` aus Task 1
- Produces: `MOB_RESPAWN_SECONDS = 180` in `src/utils/Constants.js`

- [ ] **Step 1: Fehlschlagende Prüfung im echten Spiel ergänzen**

Prüfung „Gegner kommen erst nach 3 Minuten wieder": für `beach` und `grotto` per `sceneManager.transition(id, spawn.x, spawn.y)` wechseln (`spawn` aus `mapGenerators[id]().playerSpawn`), warten bis `sceneManager.transitioning === false`. Für je einen Gegner pro Klasse (`constructor.name`) `takeDamage(99999)` aufrufen, warten bis `aiState === 'respawning'`, dann muss `respawnTimer > 100` sein (auf `respawning` höchstens 20 s warten; im Test-Browser läuft die Spielzeit langsamer). Am Ende müssen genau die Klassen `Crab`, `Jellyfish`, `Octopus` und `GhostCrab` geprüft worden sein.

Run: `npm run test:regression` → FAIL (`respawnTimer` ist 5).

- [ ] **Step 2: Konstante und Unit-Test**

```js
// tests/unit/respawn.test.js
import { it, expect } from 'vitest';
import { MOB_RESPAWN_SECONDS } from '../../src/utils/Constants.js';
it('Gegner brauchen drei Minuten', () => { expect(MOB_RESPAWN_SECONDS).toBe(180); });
```

`export const MOB_RESPAWN_SECONDS = 180;` in `Constants.js` ergänzen.

- [ ] **Step 3: Fünf Stellen umstellen**

In `Crab.js`, `GhostCrab.js`, `Jellyfish.js`, `Octopus.js`: `this.respawnTimer = 5;` → `this.respawnTimer = MOB_RESPAWN_SECONDS;`. In `Mob.js:136`: `this.respawnTime || 180` → `this.respawnTime || MOB_RESPAWN_SECONDS`. Die `respawnTime: 15` in `beach.js` bleiben unberührt; die Krabben-Klassen werten sie nicht aus.

- [ ] **Step 4: Beide Testläufe**

Run: `npm test && npm run test:regression`
Expected: alles PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/Constants.js src/entities tests
git commit -m "fix: Krabben und Grotten-Wesen kommen erst nach 3 Minuten wieder"
```

### Task 3: Knopf „Spielstand sichern" im Hauptmenü

**Files:**
- Create: `src/utils/SaveExport.js`, `tests/unit/save-export.test.js`
- Modify: `src/systems/SaveManager.js`, `src/ui/MainMenu.js`, `src/core/Game.js` (nach `menu.show(hasSave)`, derzeit Zeile 605)
- Test: `tests/regression/hotfix-0a.mjs`

**Interfaces:**
- Produces: `buildSaveExportFilename(date: Date): string`, `downloadTextFile(filename: string, text: string): void`, `SaveManager.exportRaw(): string | null`, `MainMenu.onExport(callback: () => void): void`, Knopf `#mm-export`

- [ ] **Step 1: Fehlschlagenden Unit-Test schreiben**

```js
// tests/unit/save-export.test.js
import { it, expect } from 'vitest';
import { buildSaveExportFilename } from '../../src/utils/SaveExport.js';
it('baut den Dateinamen aus dem lokalen Datum', () => {
  expect(buildSaveExportFilename(new Date(2026, 10, 13))).toBe('emilia-spielstand-2026-11-13.json');
  expect(buildSaveExportFilename(new Date(2027, 0, 5))).toBe('emilia-spielstand-2027-01-05.json');
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: `SaveExport.js` und `exportRaw()` umsetzen**

`downloadTextFile` erzeugt einen `Blob` (`application/json`), eine Objekt-URL und klickt einen unsichtbaren `<a download>`; die URL wird danach freigegeben. `SaveManager.exportRaw()` liefert den unveränderten Text aus `localStorage` oder `null`; Lesefehler ergeben `null`.

- [ ] **Step 3: Knopf einbauen**

In `MainMenu`: dritter Knopf `<button id="mm-export" class="mm-btn mm-btn-secondary" style="display:none">Spielstand sichern</button>`, sichtbar genau dann, wenn `hasSave` wahr ist (wie `#mm-continue`). In `Game.js`: `menu.onExport(...)` holt `exportRaw()`; ist das Ergebnis `null`, passiert nichts, sonst `downloadTextFile(buildSaveExportFilename(new Date()), raw)`.

- [ ] **Step 4: Prüfungen im echten Spiel ergänzen**

- „Sicherung lädt den gespeicherten Stand herunter": per `addInitScript` einen Stand setzen (`{"version":3,"timestamp":1,"player":{"hp":100,"scene":"hub","x":20,"y":15},"inventory":[]}`), Seite laden, `#mm-export` klicken, auf `download` warten. `suggestedFilename()` passt auf `/^emilia-spielstand-\d{4}-\d{2}-\d{2}\.json$/`, der Dateiinhalt ist zeichengleich mit dem gesetzten Text.
- „Ohne Spielstand kein Knopf": frischer Kontext, `#mm-export` ist nicht sichtbar.
- „Verschwundener Stand löst nichts aus": Stand setzen, Seite laden, `localStorage.removeItem(...)`, klicken; innerhalb von 1 s kein `download`-Ereignis und kein `pageerror`.

- [ ] **Step 5: Alle Testläufe und Build**

Run: `npm test && npm run test:regression && npm run build`
Expected: alles PASS, Build ohne Fehler.

- [ ] **Step 6: Commit**

```bash
git add src/utils/SaveExport.js src/systems/SaveManager.js src/ui/MainMenu.js src/core/Game.js tests
git commit -m "feat: Spielstand als Datei sichern"
```

### Abschluss Teil A (nur mit Freigabe des Auftraggebers)

- [ ] Auftraggeber fragen, ob Teil A veröffentlicht werden soll.
- [ ] Nach Freigabe: Branch in `main` mergen und pushen; den Lauf „Deploy to GitHub Pages" abwarten.
- [ ] Prüfen: Der Name des Bundles in der ausgelieferten `index.html` ist gleich dem eines lokalen `npm run build` auf demselben Commit.
- [ ] Auftraggeber bitten, auf Emilias Gerät einmal „Spielstand sichern" zu drücken und die Datei bereitzustellen (Testvorlage für Task 8).

---

# Teil B — Fundament für Version 2.0

### Task 4: Projektgerüst `v2/` und gemeinsame Auslieferung

**Files:**
- Create: `v2/package.json`, `v2/tsconfig.json`, `v2/vite.config.ts`, `v2/playwright.config.ts`, `v2/index.html`, `v2/src/main.ts`, `v2/src/scenes/BootScene.ts`, `v2/src/core/testHooks.ts`, `v2/tests/e2e/boot.spec.ts`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: Skripte in `v2/package.json`: `dev`, `build` (`tsc --noEmit && vite build`), `typecheck`, `test` (`vitest run`), `test:e2e` (`playwright test`), `maps:export` (ab Task 10)
- Produces: `installTestHooks(api: Record<string, unknown>): void` — legt `window.__emilia2` nur an, wenn `import.meta.env.DEV` oder `import.meta.env.VITE_TEST_HOOKS === '1'`

- [ ] **Step 1: Gerüst anlegen**

- `package.json`: `name` `emilia-pixel-adventure-v2`, `private`, `type: module`, Abhängigkeiten laut Tech Stack.
- `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `include: ["src"]`.
- `vite.config.ts`: `base: '/emilia-pixel-adventure/v2/'`, `build.outDir: '../dist/v2'`, `build.emptyOutDir: true`, Vitest-Bereich `tests/**/*.test.ts` (ohne `tests/e2e`).
- `playwright.config.ts`: `webServer` startet `npm run dev -- --port 5183 --strictPort`, `baseURL` `http://localhost:5183/emilia-pixel-adventure/v2/`, Projekt `chromium` mit den WebGL-Argumenten aus Task 1. WebKit kommt dazu, sobald die Geräte der Kinder feststehen (Spec 15, Punkt 3).
- `index.html`: `lang="de"`, CSP und Meta-Angaben wie im alten Spiel, zusätzlich `viewport-fit=cover`.

- [ ] **Step 2: Fehlschlagenden Starttest schreiben**

```ts
// v2/tests/e2e/boot.spec.ts
import { test, expect } from '@playwright/test';

test('startet ohne Fehler und ohne fremde Anfragen', async ({ page }) => {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', (r) => { if (!/^(http:\/\/localhost:5183\/|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForFunction(() => (window as any).__emilia2?.ready === true);
  expect(errors).toEqual([]);
  expect(foreign).toEqual([]);
});
```

Run: `npm run test:e2e` (in `v2/`) → FAIL.

- [ ] **Step 3: Start und leere Szene umsetzen**

`main.ts` erzeugt das Phaser-Spiel mit einer `BootScene`, die nur eine einfarbige Fläche zeigt (Farbe `#2d5a27`) und danach `installTestHooks({ ready: true })` aufruft. Einstellungen für Pixelart laut aktueller Phaser-4-Dokumentation setzen (keine Kantenglättung, ganze Pixel).

Run: `npm run typecheck && npm run test:e2e` → PASS.

- [ ] **Step 4: Auslieferung beider Projekte**

`.github/workflows/deploy.yml`, Job `build`, in dieser Reihenfolge:

```yaml
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm ci
        working-directory: v2
      - run: npm run typecheck
        working-directory: v2
      - run: npm test -- --passWithNoTests
        working-directory: v2
      - run: npx playwright install --with-deps chromium
        working-directory: v2
      - run: npm run test:e2e
        working-directory: v2
      - run: npm run build
        working-directory: v2
      - run: test -f dist/index.html && test -f dist/v2/index.html
```

`cache-dependency-path` von `setup-node` um `v2/package-lock.json` ergänzen.

- [ ] **Step 5: Lokal gegenprüfen**

Run (Stamm): `npm run build && npm --prefix v2 run build && ls dist/index.html dist/v2/index.html`
Expected: beide Dateien vorhanden; `dist/assets/` des alten Spiels ist noch da.

- [ ] **Step 6: Commit**

```bash
git add v2 .github/workflows/deploy.yml
git commit -m "feat(v2): Projektgerüst und gemeinsame Auslieferung"
```

### Task 5: Pixelraster

**Files:**
- Create: `v2/src/core/pixel.ts`, `v2/tests/core/pixel.test.ts`
- Modify: `v2/src/main.ts`, `v2/src/scenes/BootScene.ts`, `v2/tests/e2e/boot.spec.ts`

**Interfaces:**
- Produces: `TILE_SIZE = 16`, `MIN_VIEW_WIDTH = 240`, `MIN_VIEW_HEIGHT = 180`
- Produces: `computeZoom(physicalWidth: number, physicalHeight: number): number`
- Produces: `computeView(physicalWidth: number, physicalHeight: number): { zoom: number; width: number; height: number }` (`width = physicalWidth / zoom`)
- Produces: Test-Zugang `window.__emilia2.zoom: number`

- [ ] **Step 1: Fehlschlagenden Test schreiben**

```ts
// v2/tests/core/pixel.test.ts
import { describe, it, expect } from 'vitest';
import { computeZoom, computeView } from '../../src/core/pixel';

describe('computeZoom', () => {
  it.each([
    [1920, 1080, 6], [1280, 720, 4], [3840, 2160, 12], [2436, 1125, 6],
    [2048, 1536, 8], [1125, 2436, 4], [800, 450, 2], [239, 179, 1],
  ])('%i×%i → %i', (w, h, z) => expect(computeZoom(w, h)).toBe(z));

  it('liefert bei unbrauchbaren Größen 1', () => {
    for (const [w, h] of [[0, 0], [-5, 100], [Number.NaN, 100], [100, Number.POSITIVE_INFINITY]]) {
      expect(computeZoom(w as number, h as number)).toBe(1);
    }
  });
});

it('computeView liefert das Sichtfeld in Bildpunkten', () => {
  expect(computeView(1920, 1080)).toEqual({ zoom: 6, width: 320, height: 180 });
  expect(computeView(2436, 1125)).toEqual({ zoom: 6, width: 406, height: 187.5 });
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: `pixel.ts` umsetzen**

`computeZoom = max(1, floor(min(w / 240, h / 180)))`; nicht-endliche oder nicht-positive Eingaben ergeben 1.

Run: `npm test` → PASS.

- [ ] **Step 3: Mit dem Spiel verdrahten**

Die Zeichenfläche hat die Größe des Fensters in physischen Pixeln (`innerWidth * devicePixelRatio`), die Kamera den Zoom aus `computeZoom`; bei Größenänderung wird neu berechnet. `installTestHooks` meldet `zoom`.

- [ ] **Step 4: Starttest erweitern**

```ts
test('zoomt ganzzahlig', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('./');
  await page.waitForFunction(() => (window as any).__emilia2?.zoom === 4);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForFunction(() => (window as any).__emilia2?.zoom === 6);
});
```

Run: `npm run test:e2e` → PASS.

- [ ] **Step 5: Commit**

```bash
git add v2/src/core/pixel.ts v2/src/main.ts v2/src/scenes v2/tests
git commit -m "feat(v2): ganzzahliges Pixelraster"
```

### Task 6: Inhaltsdaten typisiert umziehen

**Files:**
- Create: `v2/src/data/types.ts`, `items.ts`, `recipes.ts`, `quests.ts`, `npcs.ts`, `enemies.ts`, `bosses.ts`, `fish.ts`, `shells.ts`, `rareFinds.ts`, `achievements.ts`, `maps.ts`
- Test: `v2/tests/data/parity.test.ts`, `v2/tests/data/integrity.test.ts`, `v2/tests/data/text.test.ts`

**Interfaces:**
- Produces: `ITEMS: Record<string, ItemDef>`, `getItem(id: string): ItemDef | null`, `RECIPES: Record<StationId, RecipeDef[]>`, `QUESTS: Record<string, QuestDef>`, `QUEST_ORDER: readonly string[]` (die 25 Kennungen aus `src/systems/Progression.js:6-16`, gleiche Reihenfolge), `NPCS: readonly NpcDef[]`, `ENEMIES`, `BOSSES`, `FISH_TYPES`, `SHELL_TYPES`, `RARE_FIND_PLACEMENTS`, `ACHIEVEMENTS`
- Produces: `MAP_IDS = ['hub','forest','dungeon','lake','unicorn_meadow','beach','grotto','cloud_castle','starsky'] as const`, `type MapId`, `isMapId(value: unknown): value is MapId`
- Produces: `REMOVED_ITEMS = ['fish_generic'] as const`, `ITEM_SUCCESSORS: Record<string, string> = { fish_generic: 'goldfish' }`
- Produces: `type ItemStack = { itemId: string; count: number }`, `type Ingredient = ItemStack | { category: ItemCategory; count: number }`

**Regel:** Kennungen und Zahlen 1:1 aus `src/data/*.js`. Geändert werden nur (a) Texte: Umlaute und ß statt `ae/oe/ue/ss`, (b) jede Verwendung von `fish_generic`: Rezept `r_cooked_fish` nimmt `{ category: 'fish', count: 1 }`; in Lieblingsgeschenken und Belohnungen (mindestens Mama Tanja und `lake_visitor`) wird daraus `goldfish`. Die Felder `hairStyle`, `hairColor`, `clothingColor` der Dorfbewohner entfallen.

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`parity.test.ts` importiert die alten Module direkt (`../../../src/data/items.js` usw.) und prüft:

```ts
const deUmlaut = (s: string) => s.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
  .replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue').replace(/ß/g,'ss');

it('enthält jeden alten Gegenstand außer den entfernten, mit gleichen Werten', () => {
  for (const [id, old] of Object.entries(LEGACY_ITEMS)) {
    if (REMOVED_ITEMS.includes(id as never)) { expect(ITEMS[id]).toBeUndefined(); continue; }
    const cur = ITEMS[id]!;
    expect(deUmlaut(cur.name)).toBe(old.name);
    for (const k of ['category','stackSize','sellValue','damage','healAmount','value'] as const)
      expect(cur[k]).toBe(old[k]);
  }
  expect(Object.keys(ITEMS).length).toBe(Object.keys(LEGACY_ITEMS).length - REMOVED_ITEMS.length);
});
```

Gleiches Muster für Rezepte (Zutaten, Ergebnis, Station; Ausnahme `r_cooked_fish`), Aufgaben (Typ, Ziel, Anzahl, XP, Belohnung; Name und Beschreibung über `deUmlaut`; Ausnahme Belohnung von `lake_visitor`), Dorfbewohner (Position, Rolle, jede Dialogzeile über `deUmlaut`; Ausnahme Lieblingsgeschenk), Gegner, Bosse, Fische, Muscheln, Fundstücke, Erfolge.

`integrity.test.ts`: Schlüssel gleich `id`; jede Zutat, jedes Ergebnis, jede Belohnung und jedes Lieblingsgeschenk existiert in `ITEMS`; `QUEST_ORDER` und `Object.keys(QUESTS)` enthalten dieselben 25 Kennungen; `isMapId('hub')` wahr, `isMapId('moon')` falsch.

`text.test.ts`: sammelt alle Textwerte aus allen Datenmodulen und verlangt, dass kein Wort auf diese Muster passt: `/(?<![aeq])ue|ae|oe/i` und `/(schliess|heiss|weiss|gross|strasse|fuss|suess|spass|drauss|fleiss|gruss|giess|stoss|beiss|ausser)/i`. Eine Ausnahmeliste ganzer Wörter im Test gilt für beide Muster; sie ist anfangs leer und wird nur mit Begründung gefüllt.

Run: `npm test` → FAIL.

- [ ] **Step 2: Datenmodule schreiben**

Typen in `types.ts` aus den tatsächlichen Formen der alten Objekte ableiten; keine `any`.

- [ ] **Step 3: Tests und Typprüfung**

Run: `npm test && npm run typecheck`
Expected: PASS. Meldet `text.test.ts` einen echten deutschen Treffer (z. B. „Poesie"), kommt das Wort mit Begründung in die Ausnahmeliste.

- [ ] **Step 4: Commit**

```bash
git add v2/src/data v2/tests/data
git commit -m "feat(v2): typisierte Inhaltsdaten mit Umlauten"
```

### Task 7: Level-Kurve, Spielzustand, Ereignisse

**Files:**
- Create: `v2/src/core/levels.ts`, `v2/src/core/state.ts`, `v2/src/core/events.ts`
- Test: `v2/tests/core/levels.test.ts`, `state.test.ts`, `events.test.ts`

**Interfaces:**
- Consumes: `MapId`, `MAP_IDS` (Task 6)
- Produces (`levels.ts`): `MAX_LEVEL = 30`, `HP_PER_HEART = 4`, `xpToNext(level: number): number`, `cumulativeXp(level: number): number`, `heartsForLevel(level: number): number`, `LEGACY_XP_TO_NEXT: readonly number[]`, `convertLegacyXp(level: number, legacyXp: number): number`
- Produces (`events.ts`): `class EventBus<E extends Record<string, unknown>>` mit `on<K extends keyof E>(type: K, handler: (payload: E[K]) => void): () => void` und `emit<K extends keyof E>(type: K, payload: E[K]): void`
- Produces (`state.ts`): `GAME_STATE_VERSION = 1`, `INVENTORY_SLOTS = 48`, `HOTBAR_SLOTS = 8`, `interface GameState`, `createNewGameState(now: number): GameState`

```ts
export interface GameState {
  formatVersion: 1;
  savedAt: number;
  importedLegacyAt: number | null;      // Zeitstempel des alten Stands bei der letzten Übernahme
  player: { map: MapId; x: number; y: number; hp: number };   // hp in Lebenspunkten, 4 je Herz
  inventory: { slots: Array<{ itemId: string | null; count: number }>; selectedHotbar: number; coins: number };
  progression: {
    level: number; xp: number;
    activeQuests: Record<string, { progress: number }>;
    completedQuests: string[];
    stats: ProgressionStats;
  };
  visitedMaps: MapId[];
  friendship: Record<string, { points: number; lastTalkDay: number; giftsGiven: number }>;
  garden: Array<{ x: number; y: number; seed: string | null; phase: number; timer: number; watered: boolean }>;
  explorerBook: { discovered: string[]; rewardsClaimed: string[] };
  achievements: string[];
  bossesDefeated: string[];
  openedChests: string[];
  collectedRareFinds: string[];
  pet: { type: string; friendship: number; evolved: boolean } | null;
  dayNight: { totalTime: number; phaseIndex: number; phaseTime: number };
  weather: { current: string; timer: number; duration: number };
  seenHints: string[];
  settings: { muted: boolean; difficulty: 'sanft' | 'normal' };
}

export interface ProgressionStats {
  mobsKilled: Record<string, number>; itemsCollected: Record<string, number>;
  bossesKilled: Record<string, number>; puzzlesSolved: Record<string, boolean>;
  fishCaught: Record<string, number>; uniqueCollected: Record<string, string[]>;
  npcsSpoken: string[]; grottoZones: string[];
  plantsHealed: number; coralHealed: number; unicornsPetted: number; itemsCrafted: number;
  bookEntries: number; distanceWalked: number; petChosen: boolean; bossNoHitKill: boolean;
}
```

- [ ] **Step 1: Fehlschlagende Tests schreiben**

```ts
// levels.test.ts
it('Kurve aus Spec 7.2', () => {
  expect(xpToNext(1)).toBe(50); expect(xpToNext(19)).toBe(500); expect(xpToNext(29)).toBe(750);
  expect(xpToNext(30)).toBe(Number.POSITIVE_INFINITY);
  expect(cumulativeXp(1)).toBe(0); expect(cumulativeXp(20)).toBe(5225); expect(cumulativeXp(30)).toBe(11600);
});
it('Herzen: 5 zu Beginn, je eines auf Level 5, 10, 15, 20, 25', () => {
  expect([1,4,5,9,10,15,20,24,25,30].map(heartsForLevel)).toEqual([5,5,6,6,7,8,9,9,10,10]);
});
it('alte Kurve ist vollständig hinterlegt', () => {
  expect(LEGACY_XP_TO_NEXT).toEqual([25,40,60,100,130,160,200,250,300,400,500,650,800,1000,1300,1600,
    2000,2500,3000,2000,2200,2400,2600,2800,3000,3200,3400,3600,3800]);
});
it('rechnet den Balken anteilig um', () => {
  expect(convertLegacyXp(3, 30)).toBe(50);   // 30 von 60 → 50 von 100
  expect(convertLegacyXp(1, 25)).toBe(49);   // voller alter Balken bleibt knapp unter dem Aufstieg
  expect(convertLegacyXp(1, -5)).toBe(0);
  expect(convertLegacyXp(30, 500)).toBe(0);
});
```

`LEGACY_XP_TO_NEXT[level - 1]` ist der alte Bedarf von `level` auf `level + 1`.

```ts
// state.test.ts
it('neues Spiel', () => {
  const s = createNewGameState(1000);
  expect(s.formatVersion).toBe(1); expect(s.savedAt).toBe(1000); expect(s.importedLegacyAt).toBeNull();
  expect(s.player).toEqual({ map: 'hub', x: 20, y: 15, hp: 20 });
  expect(s.inventory.slots).toHaveLength(48);
  expect(s.inventory.slots.every((x) => x.itemId === null && x.count === 0)).toBe(true);
  expect(s.progression.level).toBe(1); expect(s.visitedMaps).toEqual(['hub']);
  expect(s.settings).toEqual({ muted: false, difficulty: 'sanft' });
  expect(JSON.parse(JSON.stringify(s))).toEqual(s);   // rein JSON-fähig
});
```

```ts
// events.test.ts
it('ruft Empfänger in Anmeldereihenfolge und meldet sauber ab', () => {
  const bus = new EventBus<{ ping: number }>(); const seen: string[] = [];
  const off = bus.on('ping', (n) => seen.push('a' + n)); bus.on('ping', (n) => seen.push('b' + n));
  bus.emit('ping', 1); off(); bus.emit('ping', 2);
  expect(seen).toEqual(['a1', 'b1', 'b2']);
});
it('ein werfender Empfänger hält die anderen nicht auf', () => {
  const bus = new EventBus<{ ping: number }>(); const seen: number[] = [];
  const err = vi.spyOn(console, 'error').mockImplementation(() => {});
  bus.on('ping', () => { throw new Error('x'); }); bus.on('ping', (n) => seen.push(n));
  bus.emit('ping', 7);
  expect(seen).toEqual([7]); expect(err).toHaveBeenCalledTimes(1);
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: Die drei Module umsetzen**

`xpToNext(n) = 50 + 25·(n−1)` für `1 ≤ n < 30`. `heartsForLevel = 5 + min(5, floor(level / 5))`. `convertLegacyXp`: Anteil `legacyXp / LEGACY_XP_TO_NEXT[level − 1]` auf 0…1 begrenzt, mal `xpToNext(level)`, abgerundet, höchstens `xpToNext(level) − 1`; ab Level 30 immer 0.

- [ ] **Step 3: Tests und Typprüfung**

Run: `npm test && npm run typecheck` → PASS.

- [ ] **Step 4: Commit**

```bash
git add v2/src/core v2/tests/core
git commit -m "feat(v2): Level-Kurve, Spielzustand und Ereignisse"
```

### Task 8: Übernahme des alten Spielstands

**Files:**
- Create: `v2/src/save/legacy.ts`, `v2/tests/save/legacySaves.ts` (Testvorlagen), `v2/tests/save/legacy.test.ts`
- Optional: `v2/tests/fixtures/legacy/emilia-real.json` (Emilias Sicherung aus Teil A, sobald vorhanden)

**Interfaces:**
- Consumes: `GameState`, `createNewGameState`, `INVENTORY_SLOTS` (Task 7); `convertLegacyXp`, `heartsForLevel`, `HP_PER_HEART`, `MAX_LEVEL` (Task 7); `ITEMS`, `ITEM_SUCCESSORS`, `QUESTS`, `QUEST_ORDER`, `isMapId` (Task 6)
- Produces: `LEGACY_SAVE_KEY = 'emilia_pixel_adventure_save'`, `LEGACY_MUTED_KEY = 'emilia_muted'`
- Produces: `interface MigrationReport { droppedItems: string[]; replacedItems: Record<string, string>; reconstructedQuests: string[]; warnings: string[] }`
- Produces: `migrateLegacySave(raw: string | null, mutedRaw: string | null, now: number): { state: GameState; report: MigrationReport } | null`
- Produces: `legacyTimestamp(raw: string | null): number | null`

**Abbildung (nach vorhandenen Feldern, nie nach `version`):**

| Alt | Neu |
|---|---|
| `player.scene`, `x`, `y` | `player.map` (ungültig → `hub` mit 20/15), `x`, `y` |
| `player.hp` | verworfen; `hp = heartsForLevel(level) * HP_PER_HEART` |
| `inventory[]` | auf 48 Plätze gebracht; `null`-Plätze leer; Nachfolger aus `ITEM_SUCCESSORS`; unbekannte Kennungen entfernt und gemeldet; `count` auf 1…`stackSize` begrenzt |
| `coins` | Zahl ≥ 0, sonst 0 |
| `progression.level`, `xp` | Level auf 1…30 begrenzt, `xp` über `convertLegacyXp` |
| `progression.completedQuests` (Objekt) | Liste der bekannten Kennungen mit wahrem Wert, in der Reihenfolge von `QUEST_ORDER` |
| `progression.activeQuests` | nur bekannte, nicht erledigte; `{ progress }` |
| `progression.stats.scenesVisited` (Objekt) | `visitedMaps` (gültige Kennungen, dazu die aktuelle Karte) |
| `stats.npcsSpoken` (Objekt), `stats.grottoZones` (Liste oder `{}`) | Listen |
| `plantsHealed` (oben) und `stats.plantsHealed` | das Größere; ist `unicornUnlocked` wahr, mindestens 10 |
| `fishCaught`, `uniqueCollected`, `distanceWalked`, `bossNoHitKill` (oben) | `progression.stats.*` |
| `friendship` | Punkte auf 0…100 begrenzt |
| `garden`, `openedChests`, `collectedRareFinds`, `achievements` | übernommen, Listen ohne Doppelte |
| `explorerBook` (Liste **oder** Objekt) | `{ discovered, rewardsClaimed }` |
| `bossStates[typ].defeated === true` | `bossesDefeated` |
| `pet`, `dayNight`, `weather` | übernommen, fehlend → Vorgaben aus `createNewGameState` |
| `seenTooltips` | `seenHints` |
| `newGamePlus` | nicht übernommen; löst den Wiederaufbau unten aus |
| `timestamp` | `importedLegacyAt` (fehlend oder keine Zahl → 0) |
| `mutedRaw === 'true'` | `settings.muted` |

**Wiederaufbau nach „New Game Plus":** Ist `newGamePlus.active === true`, gelten alle Aufgaben in `QUEST_ORDER` bis einschließlich `shadow_slayer` als erledigt; dazu `star_collector` bei mindestens 15 Erfolgen, `emilia_legend` bei Level 30, `secret_heroine`, wenn `starsky` besucht wurde. Jede so ergänzte Kennung steht in `report.reconstructedQuests`.

- [ ] **Step 1: Testvorlagen anlegen**

```ts
// v2/tests/save/legacySaves.ts
const empty = (n: number) => Array.from({ length: n }, () => ({ itemId: null, count: 0 }));

export const LEGACY_FIRST_COMMIT = {            // Form des ersten Commits (version 2)
  version: 2, timestamp: 1711300000000,
  player: { hp: 80, scene: 'forest', x: 25.5, y: 30.25 },
  inventory: [{ itemId: 'sword_wood', count: 1 }, { itemId: 'wood', count: 7 }, ...empty(38)],
  plantsHealed: 4, unicornUnlocked: false,
  progression: {
    level: 3, xp: 30, totalXp: 95, bonusMaxHp: 10, bonusDamagePct: 0, bonusSpeedPct: 5,
    activeQuests: { nature_healer: { progress: 1, completed: false } },
    completedQuests: { first_steps: true, wood_collector: true },
    stats: { mobsKilled: { slime_green: 4 }, itemsCollected: { wood: 12 }, plantsHealed: 4,
      unicornsPetted: 0, itemsCrafted: 0, scenesVisited: { hub: true, forest: true },
      npcsSpoken: { mama_tanja: true } },
  },
};

export const LEGACY_V3_FULL = {
  version: 3, timestamp: 1749660000000,
  player: { hp: 150, scene: 'beach', x: 26, y: 14 },
  inventory: [{ itemId: 'sword_coral', count: 1 }, { itemId: 'fish_generic', count: 3 },
    { itemId: 'magic_bean', count: 2 }, null, { itemId: 'wood', count: 500 }, ...empty(43)],
  coins: 37, plantsHealed: 6, unicornUnlocked: true,
  progression: {
    level: 99, xp: 500, activeQuests: { crab_problem: { progress: 2, completed: false } },
    completedQuests: { first_steps: true, made_up_quest: true },
    stats: { mobsKilled: { crab_beach: 2 }, itemsCollected: {}, plantsHealed: 6, unicornsPetted: 1,
      itemsCrafted: 4, scenesVisited: { hub: true, lake: true, beach: true, moon: true },
      npcsSpoken: { oma: true }, grottoZones: {}, coralHealed: 0, petChosen: true, bookEntries: 3,
      bossesKilled: { coconut_king: 1 }, puzzlesSolved: {} },
  },
  fishCaught: { goldfish: 3 }, uniqueCollected: { shell: ['pearl', 'shell_common'] },
  friendship: { oma: { points: 140, lastTalkDay: 2, giftsGiven: 3 } },
  garden: [{ x: 4, y: 22, seed: 'seed_carrot', phase: 1, timer: 40, watered: true }],
  explorerBook: ['goldfish'],
  achievements: ['a', 'a', 'b'],
  bossStates: { coconut_king: { hp: 0, defeated: true }, leviathan: { hp: 90, defeated: false } },
  openedChests: ['chest_grotto_10_12'], collectedRareFinds: ['old_coin'],
  pet: { type: 'fox', friendship: 12, evolved: false },
  seenTooltips: ['move', 'talk'], distanceWalked: 1234.5, bossNoHitKill: false,
  newGamePlus: { active: false, cycleCount: 0 },
};

export const LEGACY_NGPLUS = {
  version: 3, timestamp: 1750000000000, player: { hp: 200, scene: 'hub', x: 10, y: 10 },
  inventory: empty(48), coins: 5,
  progression: { level: 22, xp: 0, activeQuests: {}, completedQuests: {},
    stats: { scenesVisited: { hub: true, cloud_castle: true } } },
  achievements: Array.from({ length: 16 }, (_, i) => 'ach_' + i),
  newGamePlus: { active: true, cycleCount: 1 },
};

export const LEGACY_PARTIAL = { version: 3, player: {} };
```

- [ ] **Step 2: Fehlschlagende Tests schreiben**

```ts
// v2/tests/save/legacy.test.ts — wesentliche Zusicherungen
const run = (o: unknown, muted: string | null = null) => migrateLegacySave(JSON.stringify(o), muted, 5000);

it('liefert null bei fehlendem oder kaputtem Stand', () => {
  for (const raw of [null, '', '{"version":3,"player":', '[]', '"x"', 'null', '42'])
    expect(migrateLegacySave(raw, null, 5000)).toBeNull();
});

it('übernimmt die Form des ersten Commits', () => {
  const { state, report } = run(LEGACY_FIRST_COMMIT)!;
  expect(state.player).toEqual({ map: 'forest', x: 25.5, y: 30.25, hp: 20 });
  expect(state.inventory.slots).toHaveLength(48);
  expect(state.inventory.slots[0]).toEqual({ itemId: 'sword_wood', count: 1 });
  expect(state.inventory.slots[1]).toEqual({ itemId: 'wood', count: 7 });
  expect(state.inventory.coins).toBe(0);
  expect(state.progression.level).toBe(3); expect(state.progression.xp).toBe(50);
  expect(state.progression.completedQuests).toEqual(['first_steps', 'wood_collector']);
  expect(state.progression.activeQuests).toEqual({ nature_healer: { progress: 1 } });
  expect(state.visitedMaps.sort()).toEqual(['forest', 'hub']);
  expect(state.progression.stats.npcsSpoken).toEqual(['mama_tanja']);
  expect(state.pet).toBeNull(); expect(state.garden).toEqual([]);
  expect(state.importedLegacyAt).toBe(1711300000000); expect(state.savedAt).toBe(5000);
  expect(report).toEqual({ droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [] });
});

it('bereinigt einen vollen Stand der Version 3', () => {
  const { state, report } = run(LEGACY_V3_FULL, 'true')!;
  expect(state.progression.level).toBe(30); expect(state.progression.xp).toBe(0);
  expect(state.player.hp).toBe(40);
  expect(state.inventory.slots).toHaveLength(48);
  expect(state.inventory.slots[1]).toEqual({ itemId: 'goldfish', count: 3 });
  expect(state.inventory.slots[2]).toEqual({ itemId: null, count: 0 });
  expect(state.inventory.slots[3]).toEqual({ itemId: null, count: 0 });
  expect(state.inventory.slots[4]).toEqual({ itemId: 'wood', count: 99 });
  expect(report.replacedItems).toEqual({ fish_generic: 'goldfish' });
  expect(report.droppedItems).toEqual(['magic_bean']);
  expect(state.inventory.coins).toBe(37);
  expect(state.progression.completedQuests).toEqual(['first_steps']);
  expect(state.visitedMaps.sort()).toEqual(['beach', 'hub', 'lake']);
  expect(state.progression.stats.grottoZones).toEqual([]);
  expect(state.progression.stats.plantsHealed).toBe(10);
  expect(state.progression.stats.fishCaught).toEqual({ goldfish: 3 });
  expect(state.progression.stats.uniqueCollected).toEqual({ shell: ['pearl', 'shell_common'] });
  expect(state.progression.stats.distanceWalked).toBe(1234.5);
  expect(state.friendship.oma!.points).toBe(100);
  expect(state.explorerBook).toEqual({ discovered: ['goldfish'], rewardsClaimed: [] });
  expect(state.achievements).toEqual(['a', 'b']);
  expect(state.bossesDefeated).toEqual(['coconut_king']);
  expect(state.pet).toEqual({ type: 'fox', friendship: 12, evolved: false });
  expect(state.seenHints).toEqual(['move', 'talk']);
  expect(state.settings).toEqual({ muted: true, difficulty: 'sanft' });
});

it('baut erledigte Aufgaben nach New Game Plus wieder auf', () => {
  const { state, report } = run(LEGACY_NGPLUS)!;
  const upToBoss = QUEST_ORDER.slice(0, QUEST_ORDER.indexOf('shadow_slayer') + 1);
  expect(state.progression.completedQuests).toEqual([...upToBoss, 'star_collector']);
  expect(report.reconstructedQuests).toHaveLength(23);
});

it('füllt einen lückenhaften Stand mit sicheren Vorgaben', () => {
  const { state } = run(LEGACY_PARTIAL)!;
  expect(state.player).toEqual({ map: 'hub', x: 20, y: 15, hp: 20 });
  expect(state.progression.level).toBe(1);
  expect(state.inventory.slots).toHaveLength(48);
});

it('verändert die Eingabe nicht und ist wiederholbar', () => {
  const raw = JSON.stringify(LEGACY_V3_FULL);
  expect(migrateLegacySave(raw, null, 1)).toEqual(migrateLegacySave(raw, null, 1));
});

it.runIf(existsSync(REAL))('übernimmt Emilias echten Stand', () => {
  const result = migrateLegacySave(readFileSync(REAL, 'utf8'), null, 5000);
  expect(result).not.toBeNull();
  expect(result!.state.inventory.slots).toHaveLength(48);
});
```

`REAL` ist der Pfad `v2/tests/fixtures/legacy/emilia-real.json`.

Run: `npm test` → FAIL.

- [ ] **Step 3: `legacy.ts` umsetzen**

Jeder Zugriff auf den alten Stand prüft den Typ; nichts wirft. Ausgangspunkt ist `createNewGameState(now)`, darüber werden die übernommenen Werte gelegt.

- [ ] **Step 4: Tests und Typprüfung**

Run: `npm test && npm run typecheck` → PASS.

- [ ] **Step 5: Commit**

```bash
git add v2/src/save/legacy.ts v2/tests/save
git commit -m "feat(v2): alten Spielstand feldweise übernehmen"
```

### Task 9: Speicher, Sicherung als Datei, Speicherzeitpunkte

**Files:**
- Create: `v2/src/save/store.ts`, `v2/src/save/service.ts`
- Test: `v2/tests/save/store.test.ts`, `v2/tests/save/service.test.ts`

**Interfaces:**
- Consumes: `GameState`, `GAME_STATE_VERSION` (Task 7); `migrateLegacySave`, `legacyTimestamp`, `LEGACY_SAVE_KEY`, `LEGACY_MUTED_KEY` (Task 8)
- Produces: `SAVE_KEY = 'emilia2_save'`
- Produces: `migrateState(raw: unknown): GameState | null` (eigene Kette; heute nur Version 1 mit Formprüfung)
- Produces: `class SaveStore { constructor(storage: Pick<Storage, 'getItem' | 'setItem'>); hasSave(): boolean; load(): GameState | null; save(state: GameState, now: number): boolean; importLegacy(now: number): ReturnType<typeof migrateLegacySave>; shouldOfferReimport(state: GameState): boolean }`
- Produces: `serializeForExport(state: GameState): string`, `parseImport(text: string, now: number): GameState | null` (nimmt eine v2-Sicherung **oder** eine Sicherung des alten Spiels)
- Produces: `type SaveReason = 'timer' | 'map-change' | 'quest' | 'boss' | 'build' | 'campfire' | 'page-hide'`
- Produces: `class SaveService { constructor(store: SaveStore, getState: () => GameState, now: () => number); start(doc: Document, win: Window): void; stop(): void; saveNow(reason: SaveReason): boolean }` — speichert alle 60 s, bei `pagehide` und wenn `visibilityState` zu `hidden` wechselt

- [ ] **Step 1: Fehlschlagende Tests schreiben**

`store.test.ts` nutzt einen Speicher-Nachbau, der alle `setItem`-Schlüssel mitschreibt, und einen, der bei jedem Zugriff wirft. Zusicherungen:

```ts
it('leerer Speicher', () => { expect(new SaveStore(mem()).load()).toBeNull(); });

it('speichert und lädt verlustfrei', () => {
  const m = mem(); const store = new SaveStore(m); const s = createNewGameState(1);
  expect(store.save(s, 99)).toBe(true);
  expect(store.load()).toEqual({ ...s, savedAt: 99 });
});

it('schreibt nie in die alten Schlüssel', () => {
  const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify(LEGACY_V3_FULL), [LEGACY_MUTED_KEY]: 'true' });
  const store = new SaveStore(m);
  const imported = store.importLegacy(10)!; store.save(imported.state, 11);
  expect(m.writtenKeys).toEqual([SAVE_KEY]);
  expect(m.getItem(LEGACY_SAVE_KEY)).toBe(JSON.stringify(LEGACY_V3_FULL));
});

it('bietet die erneute Übernahme nur bei neuerem altem Stand an', () => {
  const m = mem({ [LEGACY_SAVE_KEY]: JSON.stringify({ ...LEGACY_PARTIAL, timestamp: 2000 }) });
  const store = new SaveStore(m); const s = createNewGameState(1);
  expect(store.shouldOfferReimport({ ...s, importedLegacyAt: 1000 })).toBe(true);
  expect(store.shouldOfferReimport({ ...s, importedLegacyAt: 2000 })).toBe(false);
  expect(new SaveStore(mem()).shouldOfferReimport(s)).toBe(false);
  expect(new SaveStore(mem({ [LEGACY_SAVE_KEY]: '{kaputt' })).shouldOfferReimport(s)).toBe(false);
});

it('übersteht einen Speicher, der wirft', () => {
  const store = new SaveStore(throwing());
  expect(store.load()).toBeNull(); expect(store.hasSave()).toBe(false);
  expect(store.save(createNewGameState(1), 2)).toBe(false);
});

it('lädt und überschreibt keinen neueren Stand', () => {
  const newer = JSON.stringify({ ...createNewGameState(1), formatVersion: 2 });
  const m = mem({ [SAVE_KEY]: newer }); const store = new SaveStore(m);
  expect(store.load()).toBeNull();
  expect(store.save(createNewGameState(1), 2)).toBe(false);
  expect(m.getItem(SAVE_KEY)).toBe(newer);
});

it('Sicherung als Datei: hin und zurück, auch aus dem alten Spiel', () => {
  const s = createNewGameState(1);
  expect(parseImport(serializeForExport(s), 7)).toEqual(s);
  expect(parseImport(JSON.stringify(LEGACY_FIRST_COMMIT), 7)!.progression.level).toBe(3);
  for (const bad of ['', 'kein json', '[]', '{"formatVersion":1}']) expect(parseImport(bad, 7)).toBeNull();
});
```

`service.test.ts` mit `vi.useFakeTimers()`, einem `EventTarget` als Dokument und Fenster und einem `SaveStore` mit Speicher-Nachbau:

```ts
it('speichert alle 60 Sekunden, beim Verlassen und beim Verstecken', () => {
  const service = new SaveService(store, () => state, () => 123); const spy = vi.spyOn(store, 'save');
  service.start(doc, win);
  vi.advanceTimersByTime(60_000); expect(spy).toHaveBeenCalledTimes(1);
  win.dispatchEvent(new Event('pagehide')); expect(spy).toHaveBeenCalledTimes(2);
  Object.defineProperty(doc, 'visibilityState', { value: 'hidden', configurable: true });
  doc.dispatchEvent(new Event('visibilitychange')); expect(spy).toHaveBeenCalledTimes(3);
  service.stop(); vi.advanceTimersByTime(120_000); win.dispatchEvent(new Event('pagehide'));
  expect(spy).toHaveBeenCalledTimes(3);
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: `store.ts` und `service.ts` umsetzen**

`save()` liest zuerst den vorhandenen Eintrag: Hat er eine `formatVersion` größer als `GAME_STATE_VERSION`, wird nicht geschrieben. `hasSave()` ist genau dann wahr, wenn `load()` einen Zustand liefert. `parseImport` entscheidet nach dem Inhalt: Ein Objekt mit dem Feld `formatVersion` geht ausschließlich durch `migrateState`; ein Objekt mit einer Zahl im Feld `version` gilt als Sicherung des alten Spiels und geht durch `migrateLegacySave`; alles andere ergibt `null`. `migrateState` verlangt mindestens: Objekt, `formatVersion === 1`, `player.map` gültig, `inventory.slots` mit 48 Einträgen, `progression.level` in 1…30; sonst `null`.

- [ ] **Step 3: Tests und Typprüfung**

Run: `npm test && npm run typecheck` → PASS.

- [ ] **Step 4: Commit**

```bash
git add v2/src/save v2/tests/save
git commit -m "feat(v2): Spielstand-Speicher, Sicherung als Datei, Speicherzeitpunkte"
```

### Task 10: Die neun bestehenden Karten exportieren und prüfen

**Files:**
- Create: `v2/tools/legacy-maps/convert.mjs`, `v2/tools/export-legacy-maps.mjs`, `v2/src/maps/tiled.ts`, `v2/src/maps/validate.ts`
- Create (erzeugt): `v2/src/assets/maps/{hub,forest,dungeon,lake,unicorn_meadow,beach,grotto,cloud_castle,starsky}.json`
- Test: `v2/tests/maps/convert.test.ts`, `v2/tests/maps/validate.test.ts`, `v2/tests/maps/exported.test.ts`
- Modify: `v2/package.json` (Skript `"maps:export": "node tools/export-legacy-maps.mjs"`)

**Interfaces:**
- Consumes: `MAP_IDS`, `MapId` (Task 6); die Generatoren aus `src/world/maps/*.js` (`generateHubMap` … `generateStarskyMap`, Zuordnung wie in `src/core/Game.js:385-395`); sie liefern `{ width, height, ground[][], collision[][], props[], exits[], npcs?, playerSpawn }`
- Produces (`convert.mjs`): `convertLegacyMap(id: string, legacy: object): TiledMap`, `seededRandom(seed: number): () => number`
- Produces (`tiled.ts`): `interface TiledMap`, `TiledTileLayer`, `TiledObjectLayer`, `TiledObject`
- Produces (`validate.ts`): `validateMap(id: MapId, maps: Record<MapId, TiledMap>): string[]` (leere Liste = in Ordnung), `INTERACTIVE_TYPES`

**Format (Tiled-JSON, orthogonal, Kachel 16×16):**

| Ebene | Typ | Inhalt |
|---|---|---|
| `ground` | Kachel-Ebene | zeilenweise; Wert = alte Kachel-Kennung + 1, alte −1 → 0 |
| `collision` | Kachel-Ebene | 1 = gesperrt, 0 = frei |
| `objects` | Objekt-Ebene | je Eintrag aus `props`: `type` = alter Typ, `x`/`y` in Pixeln (alte Kachelposition × 16), `width`/`height` aus `w`/`h` × 16 (fehlend → 16), alle übrigen Felder als `properties` in der Tiled-Form `{ name, type, value }` (`string`, `int`, `float`, `bool`; Listen und Objekte als JSON-Text vom Typ `string`) |
| `npcs` | Objekt-Ebene | je Dorfbewohner: `name` = Kennung, Position × 16 |
| `exits` | Objekt-Ebene | Rechteck × 16; `properties`: `target`, `spawnX`, `spawnY` (in Kacheln) |
| `spawn` | Objekt-Ebene | ein Punkt-Objekt aus `playerSpawn` |

Kartenkopf: `width`, `height` in Kacheln; ein Kachelsatz-Eintrag `{ firstgid: 1, name: 'legacy' }`. Die Grafik dazu entsteht mit der Neugestaltung in Etappe 1; bis dahin werden die Karten nur geprüft, nicht gezeichnet.

Die Generatoren benutzen `Math.random` (z. B. Muscheln am Strand). Der Export ersetzt `Math.random` vor jedem Generator durch `seededRandom(20261113)` und stellt es danach wieder her, damit die Dateien wiederholbar entstehen.

**Prüfregeln (`validateMap`):**
1. Genau ein Startpunkt, innerhalb der Karte, auf freier Kachel.
2. Jeder Ausgang: `target` ist eine bekannte Karte; die Zielkarte hat einen Ausgang zurück; `spawnX`/`spawnY` liegen in der Zielkarte auf freier Kachel.
3. Mindestens eine Kachel jedes Ausgangs-Rechtecks ist vom Startpunkt erreichbar (4er-Nachbarschaft über freie Kacheln).
4. Jedes Objekt mit Typ aus `INTERACTIVE_TYPES = ['resource','wilted_plant','chest','station','fishing_spot','garden_plot','trophy_shelf','mob_spawn','boss_spawn','unicorn_spawn','shell_spawn','npc']` und jeder Dorfbewohner hat innerhalb von 2 Kacheln Abstand (Chebyshev) um sein Rechteck eine erreichbare Kachel.
5. Alle Objekte liegen innerhalb der Karte.

- [ ] **Step 1: Fehlschlagende Tests für die Umwandlung**

```ts
// v2/tests/maps/convert.test.ts
import { convertLegacyMap, seededRandom } from '../../tools/legacy-maps/convert.mjs';
const legacy = {
  width: 3, height: 2, ground: [[0, 4, -1], [8, 0, 0]], collision: [[0, 0, 1], [0, 0, 0]],
  props: [{ type: 'chest', x: 1, y: 1, loot: 'coins' }, { type: 'station', x: 0, y: 0, w: 2, h: 1, stationId: 'cooking' }],
  exits: [{ id: 'east', x: 2, y: 1, w: 1, h: 1, target: 'forest', spawnX: 5, spawnY: 6 }],
  npcs: [{ id: 'oma', name: 'Oma', x: 0, y: 1 }], playerSpawn: { x: 1, y: 0 },
};
it('wandelt eine kleine Karte um', () => {
  const m = convertLegacyMap('hub', legacy);
  const layer = (n: string) => m.layers.find((l) => l.name === n)!;
  expect([m.width, m.height, m.tilewidth, m.tileheight]).toEqual([3, 2, 16, 16]);
  expect((layer('ground') as any).data).toEqual([1, 5, 0, 9, 1, 1]);
  expect((layer('collision') as any).data).toEqual([0, 0, 1, 0, 0, 0]);
  const objs = (layer('objects') as any).objects;
  expect(objs[0]).toMatchObject({ type: 'chest', x: 16, y: 16, width: 16, height: 16 });
  expect(objs[0].properties).toContainEqual({ name: 'loot', type: 'string', value: 'coins' });
  expect(objs[1]).toMatchObject({ type: 'station', x: 0, y: 0, width: 32, height: 16 });
  expect((layer('npcs') as any).objects[0]).toMatchObject({ name: 'oma', x: 0, y: 16 });
  const exit = (layer('exits') as any).objects[0];
  expect(exit).toMatchObject({ x: 32, y: 16, width: 16, height: 16 });
  expect(exit.properties).toContainEqual({ name: 'target', type: 'string', value: 'forest' });
  expect((layer('spawn') as any).objects[0]).toMatchObject({ x: 16, y: 0, point: true });
});
it('seededRandom ist wiederholbar', () => {
  const a = seededRandom(1), b = seededRandom(1);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: `convert.mjs` und `tiled.ts` umsetzen**

Run: `npm test` → PASS.

- [ ] **Step 3: Fehlschlagende Tests für die Prüfung**

`validate.test.ts` baut mit `convertLegacyMap` zwei kleine, miteinander verbundene Karten und prüft: die gültige Kombination ergibt `[]`; je eine gezielt kaputte Variante ergibt genau eine Meldung — Startpunkt in der Wand, Ausgang ohne Gegenstück, Zielpunkt in der Wand, eingemauerte Truhe, Objekt außerhalb der Karte, unbekanntes Ziel.

Run: `npm test` → FAIL. Danach `validate.ts` umsetzen → PASS.

- [ ] **Step 4: Export schreiben und ausführen**

Run: `npm run maps:export` (in `v2/`)
Expected: neun Dateien unter `v2/src/assets/maps/`; ein zweiter Lauf ändert nichts (`git status` zeigt keine weitere Änderung).

- [ ] **Step 5: Test über die exportierten Karten**

```ts
// v2/tests/maps/exported.test.ts
const KNOWN_LEGACY_ISSUES: Record<string, string[]> = {};   // nur mit Begründung im Kommentar füllen

it.each(MAP_IDS)('%s ist stimmig', (id) => {
  expect(validateMap(id, maps)).toEqual(KNOWN_LEGACY_ISSUES[id] ?? []);
});
it('Größen wie im alten Spiel', () => {
  expect(Object.fromEntries(MAP_IDS.map((id) => [id, [maps[id].width, maps[id].height]]))).toEqual({
    hub: [40, 32], forest: [50, 40], dungeon: [35, 30], lake: [45, 35], unicorn_meadow: [25, 20],
    beach: [55, 35], grotto: [45, 40], cloud_castle: [50, 45], starsky: [30, 25],
  });
});
```

Meldet die Prüfung echte Mängel der alten Karten, werden sie **nicht** stillschweigend umgangen: Jede Meldung kommt wörtlich mit einer Zeile Begründung in `KNOWN_LEGACY_ISSUES` und wird dem Auftraggeber im Abschlussbericht genannt. Behoben werden sie mit der Neugestaltung der Karte.

Run: `npm test && npm run typecheck` → PASS.

- [ ] **Step 6: Commit**

```bash
git add v2/tools v2/src/maps v2/src/assets/maps v2/tests/maps v2/package.json
git commit -m "feat(v2): bestehende Karten als Daten exportiert und geprüft"
```

### Abschluss Teil B

- [ ] In `v2/`: `npm run typecheck && npm test && npm run test:e2e && npm run build` — alles grün.
- [ ] Im Stamm: `npm test && npm run test:regression && npm run build`, danach `ls dist/index.html dist/v2/index.html`.
- [ ] `git status` ist sauber; keine fremden Dateien im Stamm.
- [ ] Skill `superpowers:requesting-code-review` für den gesamten Branch.
- [ ] Auftraggeber fragen, ob der Branch in `main` gemergt und veröffentlicht werden soll (das neue Spiel zeigt dann unter `/v2/` nur eine grüne Fläche; das alte bleibt unverändert).

---

# Abschluss Etappe 0 (Stand 2026-11-13) — Übergabe an Etappe 1

**Teil A** ist seit 2026-11-13 live (`main` = `c30a6d0`). **Teil B** liegt fertig und geprüft auf dem Branch `v2/etappe-0-fundament`.

## Was gegenüber dem Plan geändert wurde

- Auslieferung mit Node 24 statt 20 (Vitest 5 verlangt Node 22+).
- Download-Adresse der Sicherung bleibt 60 s gültig (iOS fragt vor dem Download nach).
- Pixelraster zusätzlich bei doppelter Pixeldichte getestet, inklusive Zeiger-Abbildung.
- Drei alte Tippfehler in Texten korrigiert („Kräuter", 2× „Zaubertränke"); `EMILIA_CONFIG` nicht portiert.
- Spielstand-Übernahme: Boss-Siege stehen im alten Stand als `true`, nicht als Zahl (die Testvorlage im Plan oben ist an dieser Stelle falsch); Aufgaben mit `completed: true` in `activeQuests` gelten als erledigt; Rückgriff auf `stats.fishCaught`/`uniqueCollected`.
- Speicher: bei Lesefehler wird nicht geschrieben; ein nicht ladbarer Eintrag wird nach `emilia2_save_rejected` gesichert; `migrateState` repariert statt zu verwerfen (hartes Minimum: Objekt, `formatVersion === 1`, gültige Karte, 48 Plätze, Level ist Zahl).
- Auslieferung in vier Jobs (`alt`, `v2`, `seite`, `deploy`): Das alte Spiel wird veröffentlicht, wenn seine Tests grün sind; `/v2/` kommt nur bei grünen v2-Tests dazu.
- Truhen ohne eigene Kennung bekommen beim Export die Kennung des alten Spiels (`chest_<karte>_<x>_<y>`).
- XP-Umrechnung rechnet ganzzahlig.

## Pflicht-Einstieg für den Plan von Etappe 1 (aus der Gesamtprüfung von Teil B)

1. **Speicher-Schnittstelle für die Oberfläche:** Ergebnis-Typen statt `null`/`false` (unterscheiden: kein Stand, Stand kaputt, neuerer Stand blockiert, Speicher voll); Lesezugriff auf den gesicherten abgelehnten Stand; Sicherung des v2-Stands, bevor erneute Übernahme oder Datei-Import ihn ersetzen; Merker „Übernahme abgelehnt"; Rückmeldung bei fehlgeschlagenem Takt-Speichern; ein Programmfehler in der Übernahme darf nicht wie „kein alter Stand" aussehen.
2. **Reparatur eigener Stände:** unbekannte Gegenstände und Aufgaben in v2-Ständen nicht stumm entfernen; Karte und Platzzahl reparieren statt ablehnen; Regel festlegen und testen, wann `formatVersion` steigt (neue Kennungen, neue Karte wie das Dino-Tal); bei verlustbehafteter Reparatur den Rohtext sichern.
3. **Pixelraster als spielweiter Dienst** statt in der Start-Szene; Fläche messen statt rechnen (`ResizeObserver` mit `device-pixel-content-box`); Kamera-Sichtfeld auf Vielfache des Zooms; Test mit Schachbrett bei Pixeldichte 1 / 1,25 / 2 / 2,625 / 3 und ungeraden Größen.
4. **Fehlende Schutztests:** CSP-Zeile, kein Test-Zugang im Produktions-Bundle, kein `localStorage` außerhalb von `save/`, echtes Zeichnen, Browser-Test „speichern, neu laden" (auch WebKit), Start des ausgelieferten Bundles, Kennungen der Karten gegen `data/`.
5. **Karten:** Doppelungen auflösen (Figurenpositionen in `NpcDef` und in der Ebene `npcs`; Ausgänge doppelt in `unicorn_meadow`/`starsky`; Startpunkt 20/15 dreifach im Code, Karte sagt 19/14); Exportziel vor Überschreiben schützen, sobald Karten von Hand bearbeitet werden; Gegenstück-Prüfung schärfen.
6. **Texte:** „mächtiger stolz" (Opa) korrigieren; serbische Sätze vom Auftraggeber gegenlesen lassen; Negativliste gegen zu viel gesetzte Umlaute.
7. **Kleinere Punkte:** Tests in den Typecheck aufnehmen; doppelte Größenberechnung in `main.ts`/`BootScene.ts`; Test für `completed: true` zusammen mit New Game Plus; Klemmtests in `normalize`; zwei offene Tabs überschreiben sich gegenseitig (Etappe 2).

## Bekannte Mängel der alten Karten (in `v2/tests/maps/exported.test.ts` festgehalten)

- `lake`: Südausgang ragt eine Kachel über den Kartenrand.
- `grotto`: zwei Muscheln (10/15, 32/25) liegen im Fels und sind nicht erreichbar.
- `cloud_castle` → `unicorn_meadow`: Ankunft auf der gesperrten Kachel 12/2. Im laufenden alten Spiel nachgestellt: Emilia kann nach links, rechts und oben weglaufen, sie steckt nicht fest.

## Noch offen beim Auftraggeber

- Sicherungsdatei von Emilias Gerät (für `v2/tests/fixtures/legacy/emilia-real.json`; nicht ohne Zustimmung ins öffentliche Repo).
- Geräte und Browser der Kinder (WebKit-Tests).
- Umgang mit dem alten Spiel und den Paketen `Cute_Fantasy_Free` / `Farm RPG` nach dem Umschalten.
