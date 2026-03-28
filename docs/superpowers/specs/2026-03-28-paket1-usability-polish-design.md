# Paket 1: Usability-Polish — Design Spec

**Datum:** 2026-03-28
**Status:** Approved (Review-Fixes applied)
**Scope:** Tutorial-Tooltips + Kontext-Hilfe-Overlay
**Zielgruppe:** 6-jaehriges Kind (Emilia), spielt am PC

---

## Uebersicht

Zwei neue UI-Module die das Onboarding und die Orientierung verbessern:
1. **Tutorial-Tooltips** — Kontextuelle Hinweise bei ersten Aktionen
2. **Kontext-Hilfe** — H-Taste Overlay mit Steuerung + Quest-Ratgeber

## Modul 1: Tutorial-Tooltips

### Datei: `src/ui/TutorialTooltips.js`

### Verhalten

- Ein einzelnes DOM-Element (goldene Sprechblase, mittig-unten)
- Zeigt kontextuelle Hinweise wenn bestimmte Situationen ERSTMALS eintreten
- Verschwindet nach einmaliger Ausfuehrung der Aktion
- Nicht blockierend — Spiel laeuft weiter
- CSS Fade-In (0.3s) und Fade-Out (0.5s)
- Maximal 1 Tooltip gleichzeitig sichtbar
- **Prioritaet:** Tabellen-Reihenfolge = Prioritaet (niedrigere ID-Nummer hat Vorrang)

### Trigger-Tabelle

| Prio | ID | Trigger-Bedingung | Text | Verschwindet wenn |
|------|----|-------------------|------|-------------------|
| 1 | `move` | Neues Spiel, 3s ohne Bewegung (nicht bei Load) | "WASD zum Laufen, Shift zum Rennen" | `input.moveX !== 0 \|\| input.moveY !== 0` |
| 2 | `talk` | NPC in < 2.5 Tiles Naehe | "Druecke E zum Sprechen" | `dialog.isActive` wird true |
| 3 | `heal` | Welke Pflanze in < 2.5 Tiles (aus `tileMap.props` type=`wilted_plant`) | "Druecke F zum Heilen" | Erste Pflanze geheilt |
| 4 | `fight` | Waffe im Inventar (category=`weapon`) + Mob in < 5 Tiles | "Leertaste zum Kaempfen" | `combat.isAttacking` wird true |
| 5 | `craft` | Crafting-Station in < 4 Tiles (aus `tileMap.props` type=`station`) | "Druecke E zum Herstellen" | `crafting.isActive` wird true |
| 6 | `fish` | Angel-Spot in < 2.5 Tiles (aus `fishingSystem.fishingSpots`) | "Druecke F zum Angeln" | `fishing.isActive` wird true |
| 7 | `pickup` | Item-Drop am Boden in < 2 Tiles (aus `itemDrops`) | "Druecke E zum Aufheben" | Erstes Item aufgehoben |
| 8 | `inventory` | 5+ belegte Slots im Inventar | "Druecke I fuers Inventar" | `hud.isInventoryOpen()` wird true |

### Schwert-Erkennung (Trigger `fight`)

Pruefung via `inventory.slots.some(s => getItem(s.itemId)?.category === 'weapon')` — erkennt alle Waffen (sword_wood, sword_stone, sword_bone, sword_gem, etc.) ohne Hardcoding von IDs.

### Datenpersistenz

- `seenTooltips: string[]` wird im SaveGame gespeichert (SaveManager)
- Bei Spielstart (neues Spiel): leeres Array → alle Tooltips aktiv
- Bei Load: Array aus SaveGame → bereits gesehene Tooltips bleiben weg
- Bei NG+: `tutorialTooltips.loadState([])` im NG+-Reset-Code (Game.js ~Zeile 2362)
- **Kein Save-Version-Bump noetig** — Fallback: `data.seenTooltips || []`

### Klassen-Design

```
class TutorialTooltips {
  constructor()
    → Erstellt DOM-Element (#tutorial-tooltip)
    → seenTooltips = new Set()

  update(dt, context)
    → context: { player, npcs, mobs, tileMap, inventory, input,
                 dialog, crafting, fishing, combat, itemDrops, hud, isNewGame }
    → Prueft Trigger in Prioritaets-Reihenfolge
    → Erster ungesehener + aktiver Trigger wird angezeigt
    → Prueft ob aktiver Tooltip "dismissed" werden soll → markSeen()

  markSeen(tooltipId)
    → Fuegt ID zu seenTooltips Set hinzu
    → Blendet aktuellen Tooltip aus (fade-out)

  loadState(seenArray)
    → Setzt seenTooltips aus SaveGame-Daten

  getState()
    → Gibt [...seenTooltips] Array zurueck (fuer SaveManager)

  dispose()
    → Entfernt DOM-Element
```

### Visuelles Design

- Position: `fixed; bottom: 120px; left: 50%; transform: translateX(-50%)`
- Background: `rgba(40, 30, 15, 0.9)` mit `border: 2px solid #8B7355`
- Schrift: `'Press Start 2P', monospace` 10px, Farbe `#FFD700`
- Pfeil nach unten (CSS-Dreieck) zeigt Richtung Spieler
- Max-Breite: 350px
- z-index: 250 (ueber HUD, unter Dialoge/Crafting)
- Animation: `opacity 0→1` in 0.3s, `opacity 1→0` in 0.5s

### Integration in Game.js

- Import + Instanziierung im Konstruktor (nach HUD)
- `update()` Aufruf im Game-Loop (nach HUD-Update, vor Render)
- Context-Objekt wird aus bestehenden Game-Properties zusammengestellt
- NG+-Reset: `this.tutorialTooltips.loadState([])` in NG+-Aktivierungscode
- SaveManager: `seenTooltips` in save/load Daten aufnehmen

---

## Modul 2: Kontext-Hilfe-Overlay

### Datei: `src/ui/HelpOverlay.js`

### Verhalten

- Oeffnet bei Taste **H** (oder via Touch-Button falls Touch aktiv)
- Pausiert das Spiel (`uiBlocking = true`)
- Schliesst bei **H**, **Escape**, oder Klick ausserhalb
- Zwei-Spalten-Layout

### H-Taste Platzierung im Game-Loop

**WICHTIG:** Der H-Taste-Check muss VOR der `uiBlocking`-Bestimmung stehen (wie KeyI fuer Inventar), damit die Hilfe auch aus Dialogen/Crafting heraus geoeffnet werden kann:

```javascript
// VOR uiBlocking-Berechnung:
if (this.input.justPressed('KeyH')) {
  this.helpOverlay.toggle(quest, scene);
}
```

### Escape-Prioritaet

Escape schliesst UIs in dieser Reihenfolge (nur das oberste):
1. HelpOverlay (z-index 400) — hoechste Prioritaet
2. CraftingUI / TradeUI / ExplorerBookUI (z-index 300)
3. DialogUI (z-index 200)
4. Inventory-Panel

Das HelpOverlay registriert einen eigenen `keydown`-Listener fuer Escape (wie CraftingUI und TradeUI es bereits tun).

### Linke Spalte: Tastenbelegung

| Taste | Aktion |
|-------|--------|
| WASD | Laufen |
| Shift | Rennen |
| Leertaste | Angreifen |
| E | Sprechen / Aufheben / Craften |
| F | Heilen / Angeln / Wasser-Magie |
| I | Inventar oeffnen |
| H | Hilfe (dieses Menue) |
| 1-8 | Hotbar-Slot waehlen |
| Escape | Menue schliessen |

### Rechte Spalte: Quest-Ratgeber

- **Aktiver Quest-Name** (gold, fett)
- **Quest-Beschreibung** (aus quests.js)
- **Hinweis:** Ziel-Szene und Richtung — Daten werden DUPLIZIERT aus QuestWaypoint
  (eigene QUEST_HINTS Map in HelpOverlay.js, nicht aus QuestWaypoint importiert)
  - Beispiel: "Ziel: Wald (Norden vom Dorf)"
  - Wenn kein aktiver Quest: "Alle Quests abgeschlossen!"
- **Fortschritt:** "3 von 5 gesammelt" (aus quest.progress / quest.count)

### Klassen-Design

```
class HelpOverlay {
  constructor()
    → Erstellt Container-DOM (#help-overlay) mit CSS
    → Registriert keydown-Listener fuer Escape (schliesst Overlay)
    → Initial: display: none

  toggle(quest, currentScene)
    → Oeffnet oder schliesst das Overlay
    → Wenn oeffnen: rendert Tastenbelegung + Quest-Info

  get isOpen → boolean

  dispose()
    → Entfernt DOM-Element + Event-Listener
```

### Visuelles Design

- Fullscreen halbtransparenter Hintergrund: `rgba(0,0,0,0.7)`
- Zentriertes Panel: max 600px breit, Pixel-Art-Rahmen
- Zwei Spalten (Flexbox, links 45%, rechts 55%)
- Ueberschrift: "Hilfe" in gold
- z-index: 400 (ueber HUD, unter Scene-Fade z:500)
- Schliesst-Button oben rechts (X)

### Integration in Game.js

- Import + Instanziierung im Konstruktor
- H-Taste Check VOR uiBlocking-Berechnung
- `uiBlocking` Pruefung erweitern um `helpOverlay.isOpen`

---

## Aenderungen an bestehenden Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/core/Game.js` | Import beider Module, Instanziierung, update-Aufrufe, H-Taste Handler (VOR uiBlocking), uiBlocking erweitern, NG+-Reset fuer seenTooltips |
| `src/systems/SaveManager.js` | `seenTooltips` Array in save() und load() aufnehmen (Fallback: `data.seenTooltips \|\| []`). Kein Version-Bump. |

**Keine Aenderungen an:** Camera, Progression, HUD, NPC, Crafting, Combat, Maps, QuestWaypoint

---

## Erweiterungs-Roadmap (Kontext)

Dieses Paket ist Teil 1 von 3:
- **Paket 1:** Usability-Polish (dieses Dokument)
- **Paket 2:** NPC-Persoenlichkeit (Freundschafts-System, Geschenke, Dialog-Reaktionen)
- **Paket 3:** Farming & Haus-Dekoration (Garten-System, eigenes Zimmer, Moebel)

Jedes Paket hat seinen eigenen Spec → Plan → Implementation Zyklus.

---

## Risiken und Mitigationen

| Risiko | Mitigation |
|--------|-----------|
| Tooltips nerven bei Wiederspielen | seenTooltips persistent im SaveGame, NG+ reset |
| Help-Overlay blockiert Gameplay | Escape/H schliesst sofort, eigener Escape-Listener |
| SaveManager-Format aendert sich | Fallback `data.seenTooltips \|\| []`, kein Version-Bump |
| Tooltip-Trigger false-positive | Spezifische Bedingungen + Mindest-Naehe + Prioritaetsordnung |
| H-Taste Conflict mit justPressed | H-Check VOR uiBlocking, eigener Code-Pfad |
| Escape-Conflict mit anderen UIs | HelpOverlay hat eigenen keydown-Listener, schliesst sich zuerst |
