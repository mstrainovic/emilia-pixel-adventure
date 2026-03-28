# Paket 3: Farming & Haus-Dekoration — Design Spec

**Datum:** 2026-03-28
**Status:** Approved
**Scope:** Garten-System + Haus-Dekoration

---

## Uebersicht

Zwei neue Gameplay-Systeme fuer Endgame-Content:
1. **Garten-System** — Samen pflanzen, giessen, ernten in Omas Garten
2. **Emilias Zimmer** — Eigener Raum mit Moebeln und Trophaeen (vereinfacht)

## Modul 1: Garten-System

### Datei: `src/systems/GardenSystem.js`

### Mechanik

- Spieler kann Seeds auf leere Garten-Beete pflanzen (E-Taste)
- Pflanzen wachsen ueber 3 Phasen: Saat → Spross → Ernte (je ~60 Spielsekunden)
- Giessen mit F beschleunigt Wachstum (halbiert Zeit der aktuellen Phase)
- Ernte mit E gibt das Produkt + Chance auf neuen Samen

### Beete

- Nutzt bestehende Crop-Props in Omas Garten (Hub Zeile 230-239)
- 10 bestehende Beet-Positionen werden zu interaktiven Garten-Plots
- Neue Prop-Typen: `garden_plot` (leer), `garden_growing` (Phase 1-2), `garden_ready` (Phase 3)

### Samen → Ernte Tabelle

| Samen | Wachstumszeit | Ernte | Extra-Chance |
|-------|--------------|-------|-------------|
| seed_carrot | 180s (3min) | 2-3 vegetable | 30% seed_carrot zurueck |
| seed_tomato | 180s | 2-3 vegetable | 30% seed_tomato zurueck |
| seed_pumpkin | 300s (5min) | 1-2 vegetable + 1 berry | 20% seed_pumpkin zurueck |
| seed_crystal | 600s (10min) | 1 crystal | 10% seed_crystal zurueck |

### Samen-Quellen

- seed_carrot/tomato: Oma gibt bei Freundschaft Level 1+ als Geschenk
- seed_pumpkin: Quest-Reward oder Oma bei Level 2+
- seed_crystal: Seltener Drop aus Dungeon-Kristallen (5% Chance)

### Klassen-Design

```
class GardenSystem {
  constructor()
    → _plots: Array<{ x, y, seed, phase, timer, watered }>
    → SEED_DATA: Wachstum, Ernte-Tabelle

  initPlots(mapProps)
    → Findet crop-Props im Hub, erstellt interaktive Plots

  update(dt, player, input, inventory, itemDrops)
    → Wachstum fuer alle bepflanzten Plots
    → Interaktion: E = pflanzen/ernten, F = giessen
    → Visuelles Feedback (Prompt-Mesh wie ResourceNodes)

  getState() / loadState()
  dispose()
```

### Visuelles

- Phase 0 (leer): Braunes Beet (bestehende Erde-Tiles)
- Phase 1 (Saat): Kleine gruene Punkte auf Beet
- Phase 2 (Spross): Groessere Pflanze
- Phase 3 (Ernte): Leuchtend, mit Glitzer-Partikel (ParticleSystem burst)

### Integration

- Nur im Hub aktiv (wo Omas Garten ist)
- Game.js: Init bei Scene-Load wenn sceneName === 'hub'
- SaveManager: `garden` Feld fuer Plot-Zustaende

---

## Modul 2: Emilias Zimmer (Vereinfacht)

### Konzept

Statt eines vollen Bau-Systems: Ein einfaches **Trophaeen-Regal** im Hub-Haus, das automatisch Boss-Trophaeen und besondere Items anzeigt.

### Datei: Erweiterung von `src/world/maps/hub.js` + neues `src/ui/TrophyShelf.js`

### Mechanik

- Im Hub gibt es ein interaktives Regal-Prop (neben Mama Tanjas Haus)
- E-Taste oeffnet ein Overlay das zeigt:
  - Boss-Trophaeen (beach_crown, leviathan_pearl, shadow_essence)
  - Seltene Funde (aus collectedRareFinds)
  - Achievements-Zaehler
  - Freundschafts-Herzen aller NPCs

### Klassen-Design

```
class TrophyShelf {
  constructor()
    → DOM-Overlay aehnlich wie HelpOverlay
    → z-index 350

  show(gameState)
    → Rendert Grid mit Icons fuer gesammelte Trophaeen
    → Leere Slots als Silhouetten (Anreiz zum Sammeln)

  hide()
  get isOpen
  dispose()
```

### Visuelles

- Grid-Layout mit 4 Kategorien: Bosse, Raritaeten, Achievements, Freunde
- Gesammelte Items leuchten golden, fehlende sind ausgegraut
- Pixel-Art-Rahmen passend zum Spielstil

### Integration

- Neues Prop `trophy_shelf` im Hub bei (5, 10) — neben Mama Tanjas Haus
- E-Taste oeffnet wenn in Naehe
- uiBlocking erweitern
- Kein SaveManager-Aenderung noetig (liest bestehende Daten)

---

## Aenderungen an bestehenden Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/core/Game.js` | Import + Init GardenSystem (nur Hub), TrophyShelf, uiBlocking |
| `src/systems/SaveManager.js` | `garden` Feld fuer Plot-Zustaende |
| `src/world/maps/hub.js` | trophy_shelf Prop, garden_plot Props (ersetzen crop Props) |
| `src/systems/ResourceNode.js` | seed_crystal Drop-Chance bei crystal Nodes (5%) |
