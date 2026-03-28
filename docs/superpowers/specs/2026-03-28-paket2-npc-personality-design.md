# Paket 2: NPC-Persoenlichkeit — Design Spec

**Datum:** 2026-03-28
**Status:** Approved
**Scope:** Freundschafts-System + Geschenke + Fortschritts-Reaktionen + Freundschafts-Belohnungen

---

## Uebersicht

NPCs werden lebendiger durch ein Freundschafts-System. Spieler kann Beziehungen aufbauen durch Gespraeche und Geschenke. NPCs reagieren auf Spielfortschritt mit neuen Dialogen und belohnen hohe Freundschaft mit speziellen Items/Rezepten.

## Modul 1: Freundschafts-System

### Datei: `src/systems/FriendshipSystem.js`

### Mechanik

- Jeder NPC hat einen Freundschafts-Wert: 0-100 (Start: 0)
- **Gespraeche**: +2 pro Dialog (max 1x pro Spieltag, verhindert Spam)
- **Geschenke**: +5 bis +15 je nach Item-Wert (Lieblingsgeschenk: +15, normal: +5)
- **Quest-Completion**: +10 fuer den Quest-zugehoerigen NPC

### Freundschafts-Stufen

| Stufe | Punkte | Herzen | Effekt |
|-------|--------|--------|--------|
| Bekannt | 0-19 | 0 | Standard-Dialoge |
| Freund | 20-49 | 1 | Freundschafts-Dialoge freigeschaltet |
| Guter Freund | 50-79 | 2 | Spezial-Rezept freigeschaltet |
| Beste Freunde | 80-100 | 3 | Einzigartiges Geschenk-Item |

### Lieblingsgeschenke

| NPC | Lieblingsgeschenk | Warum |
|-----|-------------------|-------|
| mama_tanja | fish_generic, cooked_meat | Koechin |
| papa_milos | iron_ore, stone | Baumeister |
| marie | rainbow_flower, bloom_petal | Blumenmaedchen |
| liam | starfish, goldfish | Angler |
| oma | vegetable, seed_carrot | Gaertnerin |
| opa | wood, driftwood | Holzarbeiter |
| baba | mushroom, berry | Kochen am Feuer |
| deda | crystal, magic_herb | Alchemist |
| ferdinand | pearl, sapphire | Sammler |

### Datenpersistenz

- `friendship: { npcId: { points, lastTalkDay, giftsGiven } }` im SaveGame
- Kein Version-Bump, Fallback: `data.friendship || {}`

### Klassen-Design

```
class FriendshipSystem {
  constructor()
    → _data: Map<npcId, { points, lastTalkDay, giftsGiven }>
    → FAVORITE_GIFTS Map
    → LEVEL_THRESHOLDS [0, 20, 50, 80]

  onTalk(npcId, dayNumber)
    → +2 wenn nicht schon heute gesprochen

  onGift(npcId, itemId)
    → +15 Lieblingsgeschenk, +8 passendes Item, +5 beliebig
    → Gibt { accepted, points, isFavorite } zurueck

  onQuestComplete(questId)
    → Mapped Quest zu NPC, +10

  getLevel(npcId) → 0-3
  getPoints(npcId) → 0-100
  getState() → serializable object
  loadState(data)
```

## Modul 2: Geschenke-UI

### Integration in DialogSystem

- Neuer Button "Geschenk geben" im Dialog-UI wenn Spieler Items hat
- Oeffnet Item-Auswahl (gefiltert auf gebbare Items)
- NPC-Reaktion: Emoji-Bubble (Herz bei Liebling, Smiley bei normal)
- Nutzt bestehende EmotionBubbles fuer die Reaktion

### Integration in Game.js

- `dialog.onDialogEnd` erweitern: `friendship.onTalk(npcId, dayNight.day)`
- Neuer Callback: `dialog.onGift` → oeffnet Gift-Auswahl

## Modul 3: Fortschritts-Reaktionen

### Datei: Erweiterung von `src/data/npcs.js`

- Neue Eigenschaft `friendshipDialogs` pro NPC:
  - Level 1 (20+): 3 waermere Dialoge
  - Level 2 (50+): 3 persoenliche Dialoge + Rezept-Hinweis
  - Level 3 (80+): 3 sehr persoenliche Dialoge
- DialogSystem waehlt Dialoge basierend auf Freundschafts-Level

## Modul 4: Freundschafts-Belohnungen

### Rezept-Freischaltung bei Level 2 (50+)

| NPC | Freigeschaltetes Rezept |
|-----|------------------------|
| mama_tanja | Festmahl (3x cooked_meat + 2x vegetable → 2x heal_potion) |
| opa | Verstaerktes Holzschwert (sword_wood + 3x wood + 1x iron_ore → sword_stone) |
| deda | Kristallkugel (3x crystal + 1x ghost_pearl → glow_potion x3) |

### Geschenk-Item bei Level 3 (80+)

| NPC | Geschenk |
|-----|----------|
| mama_tanja | Rezeptbuch (heal_potion x5) |
| papa_milos | Werkzeugkiste (iron_ore x5) |
| baba | Babas Pita (cloud_cake x2) |
| deda | Dedas Zauberstab (star_elixir x2) |

## Aenderungen an bestehenden Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/core/Game.js` | Import FriendshipSystem, Instanziierung, onTalk/onGift Callbacks |
| `src/systems/SaveManager.js` | `friendship` Feld in save/load |
| `src/data/npcs.js` | `favoriteGifts` + `friendshipDialogs` pro NPC |
| `src/systems/DialogSystem.js` | Dialog-Auswahl nach Freundschafts-Level |
| `src/ui/DialogUI.js` | "Geschenk geben" Button |
| `src/ui/HUD.js` | Freundschafts-Herzen neben NPC-Name (optional) |
