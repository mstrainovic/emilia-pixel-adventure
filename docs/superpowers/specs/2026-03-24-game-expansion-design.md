# Emilia's Pixel Adventure — Erweiterung M4-M6

Design-Spezifikation fuer drei neue Meilensteine mit Bug-Fixing/Testing zwischen jedem.

## Ziele

- **Spielzeit**: ~2-4h aktuell → ~6-8h nach Erweiterung
- **Primaerer Fokus**: Sammeln & Entdecken (Angeln, Muscheln, Entdecker-Buch, Geheimnisse)
- **Sekundaer**: Visuelle Aufwertung (Tag/Nacht, Wetter, animierte Welt)
- **Tertiaer**: Kampf-Erweiterung (Bosse, neue Gegner)
- **Zielgruppe**: 6-jaehriges Kind — nichts darf frustrierend schwer sein
- **Struktur**: 3 Meilensteine, jeweils mit dedizierter QA-Phase danach

## Aktueller Stand (M1-M3 abgeschlossen)

| Kategorie | Aktuell |
|-----------|---------|
| Maps | 5 (Hub, Wald, Dungeon, See, Einhorn-Wiese) |
| Quests | 9 (lineare Kette) |
| Items | 44 |
| Rezepte | 9 (5 Stationen) |
| Mob-Typen | 7 (4 Slimes, 3 Skelette) |
| NPCs | 8 (Familie) |
| Max Level | 15 |
| Scoring-Test | 92/92 Punkte |

## Ziel-Stand nach M6

| Kategorie | Aktuell → Neu |
|-----------|---------------|
| Maps | 5 → 8 + 1 Geheim-Map |
| Quests | 9 → 24 |
| Items | 44 → ~84 |
| Rezepte | 9 → ~14 |
| Mob-Typen | 7 → 12 + 3 Bosse |
| Max Level | 15 → 30 |
| Achievements | 0 → 30 |
| Scoring-Test | 92 → ~180 Punkte |

---

## Weltkarte — Verbindungen

```
                    [Wolkenschloss] ← NEU M6
                          |
                   [Einhorn-Wiese]
                          |
                       [Wald]
                          |
          [See] ←── [Emilias Dorf] ──→ [Dungeon]
           |                               |
        [Strand] ← NEU M4     [Unterwasser-Grotte] ← NEU M5
```

**Zugaenge:**
- Strand ← See (Sued-Exit, Boot am Ufer)
- Unterwasser-Grotte ← Dungeon (geheime Unterwasser-Passage)
- Wolkenschloss ← Einhorn-Wiese (Regenbogen-Aufstieg, ab Level 22)

---

## Meilenstein 4: "Strand & Sterne"

### Neue Area: Der Goldene Strand (55x35 Tiles)

**Tile-Typen:**
- Sand (3 Varianten: hell, mittel, nass)
- Wasser-Rand (Brandung)
- Felsen/Klippen
- Holzsteg (Pier)

**Layout:**
- Langer Sandstrand an der Suedseite
- Felsige Klippen links und rechts als natuerliche Begrenzung
- Pier/Holzsteg ins Wasser (Angel-Spot)
- Palmen und Strandgraeser als Dekoration
- Gezeitenpools zwischen Felsen (Muschel-Fundorte)
- Kleiner Leuchtturm als Landmark

**Props:**
- 8-10 Palmen
- 6-8 Gezeiten-Pools (Muschel-Spawns)
- 1 Pier/Steg
- 1 Leuchtturm (dekorativ, Collision)
- Strandgut: Treibholz, Seesterne, Algen
- Muscheln als sammelbare Objekte (8 Typen, Respawn-Timer)

**Exits:**
- Nord → See (Boot-Rueckfahrt)

### Angel-Minigame

**Ausloesung:** KeyF an Angel-Spots (Pier, Gezeiten-Pools, auch See-Spots nachtraeglich)

**KeyF Consumption Order:** PlantHealing → FishingSystem → WaterSpray. Da Angel-Spots und heilbare Pflanzen niemals am selben Ort sind, gibt es keinen Konflikt. FishingSystem prueft Angel-Spot-Proximity VOR `justPressed('KeyF')` — analog zum bestehenden DialogSystem-Pattern.

**Ablauf:**
1. Emilia wirft Angel aus (Wurf-Animation)
2. Warte-Phase: 2-5 Sekunden (Ausrufezeichen-Indikator wenn Fisch beisst)
3. Fang-Phase: Timing-Balken erscheint (Fortschritts-Bar mit gruener Zone)
4. Space druecken wenn Marker in gruener Zone → Fang erfolgreich
5. Gruene Zone ist grosszuegig (~40% der Bar) — kindgerecht
6. Fisch-Art basiert auf Standort + Tageszeit + Zufall

**Fisch-Arten (6):**
Hinweis: `starfish` (Fisch-ID) ist ein fangbarer Fisch. Dekorative Seesterne am Strand sind reine Props ohne Item-ID. `starfish_shell` ist ein separates Muschel-Item.

| Fisch | ID | Seltenheit | Standort | Tageszeit | Wert |
|-------|----|-----------|----------|-----------|------|
| Goldfisch | goldfish | Haeufig | Ueberall | Immer | 5 |
| Silberfisch | silverfish | Haeufig | See, Strand | Tag | 8 |
| Sternfisch | starfish | Selten | Strand | Nacht | 25 |
| Regenbogenforelle | rainbow_trout | Mittel | See | Morgen/Abend | 15 |
| Kugelfisch | pufferfish | Mittel | Strand | Tag | 12 |
| Geisterfisch | ghostfish | Sehr selten | Grotte (M5) | Immer | 40 |

**UI-Elemente:**
- Wurf-Animation (Angel fliegt ins Wasser)
- Warte-Indikator (Bobber im Wasser, "!" bei Biss)
- Timing-Bar (horizontal, gruene Zone markiert)
- Fang-Popup (Fisch-Sprite + Name + "Neu!" bei Erstfang)

### Muschel-Sammeln

- 8 Muschel-Typen verstreut am Strand und in Gezeiten-Pools
- Einige nur bei Ebbe sichtbar (Nacht-Phase = Ebbe im Spielzyklus)
- Aufheben mit E-Taste (wie ResourceNode)
- Respawn: 1 Spieltag pro Muschel-Spot
- Seltene Perle: 5% Chance beim Aufheben bestimmter Muscheln

### Tag/Nacht-Zyklus

**Phasen (je 2 Minuten real = 8 Min Gesamtzyklus):**

| Phase | Dauer | Lichtfarbe | Ambient |
|-------|-------|-----------|---------|
| Morgen | 2 min | Warm-Gold (#FFE4B0) | 0.85 |
| Tag | 2 min | Neutral-Weiss (#FFFFFF) | 1.0 |
| Abend | 2 min | Orange-Rot (#FFB060) | 0.75 |
| Nacht | 2 min | Blau-Dunkel (#4060A0) | 0.45 |

**Implementation:**
- `DayNightSystem` Klasse in `src/systems/DayNight.js`
- Steuert AmbientLight-Farbe und -Intensitaet per Lerp
- DirectionalLight simuliert Sonnenstand (Winkel aendert sich)
- Nacht: PointLights an Laternen/Fackeln/Bonfire aktivieren
- Sterne: Partikel-Overlay auf Nacht-Hintergrund (Twinkle-Animation)
- Sternschnuppen: Seltene Partikel-Animation (1-2 pro Nacht), Quest-relevant

**Auswirkungen auf bestehende Maps:**
- Hub: Laternen an Wegen leuchten nachts, NPCs aendern Dialog ("Gute Nacht!")
- Wald: Dunkler Wald bei Nacht, atmosphaerischer
- See: Mondspiegelung auf Wasser
- Dungeon: Unveraendert (unterirdisch, eigenes Licht)
- Einhorn-Wiese: Einhörner leuchten nachts staerker

### Neue Gegner: Krabben (2 Typen)

| Typ | HP | DMG | Speed | XP | Drops | Verhalten |
|-----|----|----|-------|-----|-------|-----------|
| Strand-Krabbe | 20 | 3 | 1.8 | 12 | shell (60%), sand_dollar (20%) | Seitwaerts-Bewegung, flieht bei Schaden |
| Kokosnuss-Krabbe | 35 | 5 | 1.2 | 20 | coconut (50%), shell (30%), pearl (10%) | Fernkampf: wirft Kokosnuesse (Projektil), langsam |

**Sprite-Konzept:** Canvas-gezeichnet im Cute_Fantasy-Stil (16x16 Basis), 4 Richtungen, seitwaerts-spezifische Walk-Animation.

### Neue Quests (4)

| Quest ID | Name | Typ | Ziel | XP |
|----------|------|-----|------|-----|
| shell_collector | Strandgut-Sammlerin | collect | 5 verschiedene Muscheln | 50 |
| master_angler | Meisteranglerin | fish | 3 verschiedene Fischarten | 60 |
| crab_problem | Krabben-Problem | kill | 8 Krabben | 45 |
| shooting_star | Sternschnuppen-Wunsch | observe | 1 Sternschnuppe nachts beobachten | 70 |

**Quest-Typ-Erklaerungen (Trigger-Punkte fuer Progression.js):**

| Quest-Typ | Trigger-Aufruf | Ort im Code |
|-----------|---------------|-------------|
| `fish` | `progression.checkQuest('fish', fishId)` | FishingSystem.js — nach erfolgreichem Fang |
| `observe` | `progression.checkQuest('observe', 'shooting_star')` | DayNight.js — wenn Sternschnuppe im Viewport spawnt |
| `puzzle` | `progression.checkQuest('puzzle', puzzleId)` | Game.js — wenn Kristall-Puzzle geloest (Custom-Event) |
| `boss` | `progression.checkQuest('boss', bossId)` | BossSystem.js — bei Boss-Tod |
| `achieve` | `progression.checkQuest('achieve', count)` | AchievementSystem.js — bei jedem Achievement-Unlock |
| `find` | `progression.checkQuest('find', areaId)` | SceneManager.js — bei Scene-Load (Sternenhimmel) |
| `level` | `progression.checkQuest('level', level)` | Progression.js — bei Level-Up (bereits integriert als `reach_level`) |

- `observe`: Sternschnuppe ist ein seltenes Partikel-Event (1-2 pro Nacht). Quest zaehlt automatisch wenn der Spieler draussen steht und eine Sternschnuppe im sichtbaren Bereich erscheint (Kamera-Viewport-Check). Kein Tastendruck noetig.
- `fish`: Zaehlt bei erfolgreichem Fang eines bisher nicht gefangenen Fisch-Typs.
- Coral-Healing in M5: Verwendet das bestehende `PlantHealingSystem` — kranke Korallen sind PlantHealing-Entities in der Grotte (gleiche F-Taste-Mechanik, andere Sprites).

### Neue Items (~12)

**Fische (6):** goldfish, silverfish, starfish, rainbow_trout, pufferfish, ghostfish
**Strand (7):** coconut, sand_dollar, pearl, starfish_shell, coral_piece, driftwood, rainbow_shell (nachts, selten)

**Migration bestehender Items:**
- `fish` (bestehende ID): Wird zu `fish_generic` umbenannt und aus Mob-Drops entfernt. Bestehende Rezepte (`r_cooked_fish`) akzeptieren ab M4 jede Fisch-ID (Tag `category: 'fish'` auf allen 6 Fisch-Items).
- `shell` (bestehende ID): Wird zu `shell_common` umbenannt. Krabbe-Drops referenzieren `shell_common`.

**Muscheln & Korallen — vollstaendige IDs (8 fuer Entdecker-Buch):**

| # | Name | ID | Fundort | Seltenheit |
|---|------|----|---------|-----------|
| 1 | Gemeine Muschel | shell_common | Strand (Boden) | Haeufig |
| 2 | Sanddollar | sand_dollar | Strand (Boden) | Haeufig |
| 3 | Perle | pearl | Krabbe-Drop, Strand (selten) | Selten |
| 4 | Seestern-Muschel | starfish_shell | Strand, Gezeiten-Pool | Mittel |
| 5 | Korallen-Stueck | coral_piece | Strand (Felsen), Grotte | Mittel |
| 6 | Regenbogen-Muschel | rainbow_shell | Strand (Nacht, selten) | Sehr selten |
| 7 | Spiral-Schnecke | spiral_snail | Grotte (Korallenriff) | Mittel |
| 8 | Tiefseekrone | deep_crown | Grotte (Schatzkammer) | Sehr selten |

### Neue Tile-IDs

Bestehend: 0-10 (siehe CLAUDE.md). Neue IDs:

| ID | Tile | Map | Beschreibung |
|----|------|-----|-------------|
| 11 | sand_light | Beach | Heller Sand |
| 12 | sand_dark | Beach | Nasser Sand (Brandung) |
| 13 | sand_shells | Beach | Sand mit Muschel-Fragmenten |
| 14 | pier_wood | Beach | Steg-Holz |
| 15 | underwater_stone | Grotto | Dunkler Unterwasser-Stein |
| 16 | underwater_blue | Grotto | Blau-grauer Stein |
| 17 | underwater_moss | Grotto | Moos-bedeckter Stein |
| 18 | underwater_sand | Grotto | Sand-Boden (unterwasser) |
| 19 | cloud_white | Cloud Castle | Weisser Wolken-Boden |
| 20 | cloud_pink | Cloud Castle | Rosa Wolken-Boden |
| 21 | cloud_gold | Cloud Castle | Goldener Wolken-Boden |
| 22 | crystal_floor | Cloud Castle | Kristall-Boden |

Sternenhimmel-Void und Regenbogen-Bruecke werden als Props (nicht Tiles) auf cloud_white gerendert.

### Neue Mob-IDs

Alle neuen Gegner nutzen das bestehende `Mob.js` + `mobs.js` Data-Pattern:

| Mob ID | Entity | Meilenstein |
|--------|--------|-------------|
| crab_beach | Crab.js | M4 |
| crab_coconut | Crab.js (variant) | M4 |
| jellyfish_glow | Jellyfish.js | M5 |
| octopus | Octopus.js | M5 |
| ghost_crab | GhostCrab.js | M5 |
| boss_coconut_king | Boss.js (variant) | M6 |
| boss_leviathan | Boss.js (variant) | M6 |
| boss_shadow_knight | Boss.js (variant) | M6 |

### Max Level: 15 → 20

XP-Kurve fortsetzen:
- Level 16: 2,200 XP
- Level 17: 2,700 XP
- Level 18: 3,300 XP
- Level 19: 4,000 XP
- Level 20: 4,800 XP

---

## Meilenstein 5: "Tiefsee & Freunde"

### Neue Area: Unterwasser-Grotte (45x40 Tiles)

**Tile-Typen:**
- Unterwasser-Stein (3 Varianten: dunkel, blau-grau, moos-bedeckt)
- Sand-Boden (unterwasser)
- Korallen (dekorativ, bunt)
- Leucht-Algen (emittieren Glow)

**Layout — 4 Bereiche:**
1. **Korallenriff** (Eingang, 15x12) — Bunte Korallen, friedlich, erste Sammel-Spots
2. **Versunkene Ruinen** (20x15) — Alte Steinmauern, Truhen, Raetsel-Elemente
3. **Quallen-Passage** (10x20) — Schmaler Gang, leuchtende Quallen, Timing-basiert (ausweichen)
4. **Schatz-Kammer** (15x10) — Geheim, nur ueber Ruinen erreichbar, Belohnungs-Raum

**Visuell:**
- Permanent leichter Blau-Overlay (Post-Processing oder Tint auf AmbientLight)
- Schwebende Blasen-Partikel (aufsteigend)
- Biolumineszente Pflanzen (PointLights in Cyan/Magenta)
- Leichter Wellenverzerrung-Effekt (optional, Shader)
- Lichtstrahl von oben in Eingangsbereich

**Exits:**
- West → Dungeon (Unterwasser-Passage zurueck)

### Entdecker-Buch

**UI:** Neues Overlay (Tab-Taste), aehnlich Crafting-UI-Stil

**5 Kategorien mit je 6-8 Eintraegen:**

| Kategorie | Eintraege | Fundorte |
|-----------|----------|---------|
| Muscheln & Korallen | 8 | Strand, Grotte |
| Fische | 6 | Angel-Spots (alle Maps) |
| Insekten & Schmetterlinge | 6 | Wald, Wiese, See, Hub |
| Kristalle & Edelsteine | 6 (crystal, sapphire, ruby, emerald, cloud_crystal, ghost_pearl) | Dungeon, Grotte, Wolkenschloss |
| Seltene Fundstuecke | 6 | Ueberall (versteckt) |

**Mechanik:**
- Erstmaliges Aufsammeln/Fangen eines neuen Typs → "Neu entdeckt!"-Popup
- Eintrag erscheint im Buch mit Bild + Beschreibung + Fundort
- Fortschrittsbalken pro Kategorie
- Kategorie-Belohnung bei 100%: Spezielles Item (z.B. goldene Angel, Schmetterlings-Netz)
- Gesamtfortschritt trackbar (z.B. "23/32 entdeckt")

**Insekten-Sammeln (neue Unter-Mechanik):**
- Kleine Sprite-Entities in der Welt (Schmetterling, Marienkaefer, Gluehwuermchen, Libelle, Biene, Grille)
- Bewegen sich zufaellig, fliegen weg wenn Spieler rennt
- Fangen mit E-Taste bei langsamem Annaehern
- Nur fuer Entdecker-Buch, kein Inventar-Verbrauch

### Haustier-Begleiter

**Auswahl-Quest:** Nach Abschluss von "Tiefsee-Entdeckerin" bietet ein NPC (Marie) die Wahl:

| Haustier | Sprite | Faehigkeit | Persoenlichkeit |
|----------|--------|-----------|-----------------|
| Kleiner Fuchs | 16x16 Canvas, orange/weiss | Findet versteckte Items (leuchtet auf bei Geheimnissen in 3-Tile-Radius) | Neugierig, schnueffelt an allem |
| Baby-Drache | 16x16 Canvas, gruen/gold | Schwacher Feuer-Angriff (5 DMG, 3s Cooldown) auf nahe Gegner | Mutig, stellt sich vor Emilia |
| Magischer Hase | 16x16 Canvas, weiss/blau-glow | Erhoehter Sammel-Radius (+2 Tiles), zeigt seltene Spawns | Sanft, hoppelt voraus |

**Follow-Mechanik:**
- Folgt Spieler mit 0.3s Delay (Lerp, aehnlich Unicorn-Follow)
- Eigene Idle-Animation (4 Frames)
- Walk-Animation (4 Frames, Richtungs-basiert)
- Kollidiert NICHT mit Welt (laeuft durch Objekte — verhindert Steckenbleiben)
- Bei Scene-Transition: Teleportiert neben Spieler
- Kein Schaden von Gegnern (unverwundbar)

**Freundschaft (passiv):**
- Steigt ueber Zeit (1 Punkt pro Minute Spielzeit mit Haustier)
- Max: 100 Punkte
- Bei 100: Evolution moeglich (M6-Feature)

### Wetter-Effekte

**Wetter-System:** `WeatherSystem` Klasse in `src/systems/Weather.js`

| Wetter | Chance | Dauer | Effekte |
|--------|--------|-------|---------|
| Sonnig | 50% | 2-4 Spieltage | Standard-Beleuchtung |
| Regen | 25% | 1-2 Spieltage | Regen-Partikel, dunklerer Himmel, Wasser-Ringe |
| Nebel | 15% | 1 Spieltag | Reduzierte Sichtweite, atmosphaerisch |
| Sonnenstrahlen | 10% | 0.5 Spieltage | Volumetrische Lichtstreifen durch Baumkronen |
| Schnee | Nur Wolkenschloss (M6) | Permanent | Weisse Partikel, langsam fallend — nur Cloud Castle Map |

**Regen-Implementation:**
- 80-120 Partikel gleichzeitig (dunne weisse/blaue Linien, fallen diagonal)
- Wasser-Ring-Effekte auf Wasser-Tiles (kleine Kreise)
- AmbientLight-Intensitaet reduziert auf 0.7
- Himmelfarbe verschiebt sich zu Grau

**Nebel-Implementation:**
- Semi-transparenter weisser Overlay (Gradient von Raendern)
- Reduzierte Draw-Distance (nicht implementiert, da 2D — stattdessen Opacity-Overlay)
- Am See und in der Grotte permanent leichter Nebel

**Sonnenstrahlen-Implementation:**
- 3-5 diagonale helle Streifen (semi-transparent, gelb)
- Nur in Maps mit Baeumen (Wald, Hub) — Licht faellt "durch Blaetter"
- Langsame Bewegung (Parallax-artig)

**Interaktion mit Tag/Nacht:**
- Regen bei Nacht: dunkler, keine Sterne sichtbar
- Nebel bei Morgen: besonders dicht
- Sonnenstrahlen nur bei Tag/Morgen moeglich

### Neue Gegner: Unterwasser (3 Typen)

| Typ | HP | DMG | Speed | XP | Drops | Verhalten |
|-----|----|----|-------|-----|-------|-----------|
| Leucht-Qualle | 25 | 3 | 0.8 | 15 | jelly_essence (70%), glow_orb (20%) | Driftet langsam, Kontaktschaden, leuchtet |
| Tintenfisch | 40 | 5 | 1.4 | 25 | ink_sac (60%), tentacle (30%) | Spritzt Tinte (AoE, 2s Sicht-Einschraenkung) |
| Geister-Krabbe | 50 | 6 | 1.6 | 35 | ghost_pearl (40%), bone (50%), crystal (25%) — unabhaengige Rolls pro Item | Wird periodisch unsichtbar (3s sichtbar, 2s unsichtbar) |

**Drop-Modell:** Alle Mob-Drops verwenden unabhaengige Rolls pro Item-Slot. Jedes Item hat seine eigene Chance, mehrere Drops pro Kill sind moeglich.

**Sprite-Konzepte:**
- Qualle: Canvas-gezeichnet, transparenter Koerper, leuchtende Tentakel
- Tintenfisch: Canvas-gezeichnet, 8 Tentakel, Tinten-Partikel-Effekt
- Geister-Krabbe: Aehnlich Strand-Krabbe aber mit Geister-Transparenz (Alpha-Fade)

### Neue Quests (5)

| Quest ID | Name | Typ | Ziel | XP |
|----------|------|-----|------|-----|
| coral_healer | Korallen-Retterin | heal | 5 kranke Korallen heilen (F-Taste, wie Pflanzen-Heilung) | 60 |
| deep_explorer | Tiefsee-Entdeckerin | visit | Alle 4 Grotten-Bereiche | 70 |
| best_friend | Beste Freundin | pet | Haustier waehlen und benennen | 50 |
| collector_page1 | Entdecker-Buch Seite 1 | collect | 10 verschiedene Eintraege | 80 |
| sunken_treasure | Versunkener Schatz | find | Geheime Schatz-Kammer finden | 90 |

### Neue Items (~15)

**Korallen (4):** fire_coral, brain_coral, fan_coral, glow_coral
**Edelsteine (3):** sapphire, ruby, emerald
**Unterwasser (6):** ink_sac, jelly_essence, glow_orb, tentacle, underwater_plant, ghost_pearl (Geister-Krabbe-Drop)
**Muscheln M5 (2):** spiral_snail (Grotte Korallenriff), deep_crown (Grotte Schatzkammer)
**Haustier (1):** pet_treat (universelles Haustier-Leckerli, funktioniert fuer alle 3 Haustier-Typen)

### Neue Rezepte (5)

| Rezept | Station | Zutaten | Ergebnis |
|--------|---------|---------|----------|
| Edelstein-Schwert | Anvil | 2 sapphire + 2 ruby + 1 emerald | sword_gem (DMG: 40) |
| Tauchhelm | Workbench | 3 crystal + 2 iron_ore | diving_helm (Deko) |
| Haustier-Leckerli | Cooking | 2 berry + 1 mushroom | pet_treat (+10 Freundschaft) |
| Leucht-Trank | Alchemy | 2 glow_orb + 1 jelly_essence | glow_potion (leuchtet 5 Min) |
| Meeres-Suppe | Cooking | 1 tentacle + 1 underwater_plant + 1 beliebiger Fisch (goldfish/silverfish/etc.) | sea_soup (Heal: 60) |

**Kategorie-basierte Zutaten:** Fuer `beliebiger Fisch` bekommt jedes Fish-Item in `items.js` ein Feld `category: 'fish'`. `CraftingSystem.checkIngredient()` wird erweitert: wenn eine Zutat `{ category: 'fish', count: 1 }` statt `{ itemId: '...', count: 1 }` hat, prueft es ob ein Item mit passender Kategorie im Inventar liegt.

### Max Level: 20 → 25

XP-Kurve fortsetzen:
- Level 21: 5,800 XP
- Level 22: 7,000 XP
- Level 23: 8,400 XP
- Level 24: 10,000 XP
- Level 25: 12,000 XP

---

## Meilenstein 6: "Wolken & Wunder"

### Neue Area: Das Wolkenschloss (50x45 Tiles)

**Tile-Typen:**
- Wolken-Boden (3 Varianten: weiss, rosa, gold — semi-transparent Look)
- Kristall-Boden (fuer Kristallhallen)
- Regenbogen-Bruecke (animiert, Farbverlauf)
- Sternenhimmel-Void (Hintergrund, kein begehbarer Tile)

**Layout — 4 Bereiche:**
1. **Wolkengarten** (20x15, Eingang) — Schwebende Blumeninseln, Schmetterlinge, sanfte Musik
2. **Kristallhallen** (15x20) — Glitzernde Waende, Spiegel-Elemente, Puzzle-Raum
3. **Thronsaal** (15x15, Boss-Arena) — Grosser Raum, Zuschauer-Balkone, dramatische Beleuchtung
4. **Sternenterrasse** (10x10) — Panorama, Belohnungs-NPCs, "Ende"-Cutscene

**Visuell:**
- Wolken driften im Hintergrund (Parallax-Layer)
- Kristalle reflektieren Licht (Sprite-Glow)
- Regenbogen-Bruecken schimmern (Farb-Cycling-Animation)
- Sternenhimmel als permanenter Hintergrund (scene.background = Sterne-Textur)

**Freischaltung:** Level 22 + alle 3 Einhoerner gestreichelt

**Exits:**
- Sued → Einhorn-Wiese (Regenbogen-Abstieg)

### Boss-Kaempfe (3)

Jeder Boss befindet sich in seiner eigenen Area und wird dort freigeschaltet:

**Boss-Unlock-Bedingungen:**
- Boss 1: Alle 4 M4-Quests abgeschlossen (shell_collector, master_angler, crab_problem, shooting_star)
- Boss 2: Alle 5 M5-Quests abgeschlossen (coral_healer, deep_explorer, best_friend, collector_page1, sunken_treasure)
- Boss 3: Level 22 + alle 3 Einhoerner gestreichelt (Wolkenschloss-Zugang = Boss-Zugang)

#### Boss 1: Kokosnuss-Koenig (Strand — nach M4-Quest-Chain)

| Stat | Wert |
|------|------|
| HP | 120 |
| DMG | 8 (Nahkampf), 5 (Kokosnuss-Wurf) |
| Speed | 1.0 |
| XP | 150 |

**Muster:**
- Phase 1 (>60% HP): Seitwaerts-Patrol, wirft einzelne Kokosnuesse
- Phase 2 (<60% HP): 3er-Salven, schneller
- Schwachpunkt: Bauch bei Seitwärts-Attacke (doppelter Schaden)
- Arena: Abgesperrter Strandbereich, Palmen als Deckung

**Belohnung:** beach_crown (Deko), Zugang zu geheimem Strandbereich mit seltenen Muscheln

#### Boss 2: Tiefsee-Leviathan (Unterwasser-Grotte — nach M5-Quest-Chain)

| Stat | Wert |
|------|------|
| HP | 180 |
| DMG | 10 (Tentakel), 7 (Tinten-AoE) |
| Speed | 0.8 |
| XP | 250 |

**Muster:**
- Phase 1 (>50% HP): Tentakel-Schlaege (2 gleichzeitig, vorhersagbar)
- Phase 2 (<50% HP): Tinten-AoE (grosser dunkler Bereich, ausweichen), Tentakel schneller
- Schwachpunkt: Kopf (nur erreichbar nach Tentakel-Schlag-Fenster)
- Arena: Grosser Unterwasser-Raum, Korallen als Deckung

**Belohnung:** leviathan_pearl, Edelstein-Schwert-Upgrade auf sword_gem_plus (DMG: 55)

#### Boss 3: Schatten-Ritter (Wolkenschloss Thronsaal)

| Stat | Wert |
|------|------|
| HP | 250 |
| DMG | 12 (Schwert), 8 (Schatten-Stoss) |
| Speed | 1.8 |
| XP | 400 |

**Muster:**
- Phase 1 (>66% HP): Klassischer Schwertkampf, Block-Konter-Muster
- Phase 2 (33-66% HP): Teleportiert sich (erscheint hinter Spieler), schnellere Combos
- Phase 3 (<33% HP): Erzeugt 2 Schatten-Klone (je 50 HP), Klone verschwinden bei Tod
- Grosszuegige Telegraphing-Animationen (Kind muss Muster erkennen koennen)

**Belohnung:** rainbow_sword (DMG: 70, staerkstes Item), Endgame-Cutscene

**Boss-Design-Prinzip:** Alle Bosse haben klar erkennbare Angriffs-Muster mit 2-3 Sekunden Vorwarnzeit. Kein Frustrations-Design. Haustier hilft im Kampf. Bei Tod: Respawn vor Boss-Raum, Boss behält erlittenen Schaden (kein Reset).

### Achievement-System (30 Achievements)

**Implementation:** `AchievementSystem` Klasse in `src/systems/Achievements.js`

**Erkundung (8):**
1. Erste Schritte — Betrete den Wald
2. Hoehlenforscher — Betrete den Dungeon
3. Strandlaeufer — Betrete den Strand
4. Tieftaucherin — Betrete die Unterwasser-Grotte
5. Himmelstuermerin — Betrete das Wolkenschloss
6. Kartographin — Besuche alle 8 Areas
7. Geheimnis-Luefterin — Finde 3 geheime Bereiche
8. Welt-Entdeckerin — Laufe 10.000 Tiles Distanz

**Sammlung (8):**
9. Angel-Anfaengerin — Fange deinen ersten Fisch
10. Muschel-Sammlerin — Finde 5 verschiedene Muscheln
11. Entomologin — Fange 3 verschiedene Insekten
12. Kristall-Jaegerin — Finde alle 6 Kristall/Edelstein-Typen
13. Komplett-Sammlerin — Fuege 25 Eintraege ins Entdecker-Buch
14. Meister-Sammlerin — Entdecker-Buch 100% komplett
15. Kraeuter-Hexe — Sammle 50 Pflanzen/Kraeter insgesamt
16. Schatzsucherin — Finde 5 versteckte Truhen

**Kampf (6):**
17. Erste Beute — Besiege deinen ersten Gegner
18. Slime-Jaegerin — Besiege 25 Slimes
19. Skelett-Bezwingerin — Besiege 25 Skelette
20. Krabbenfaengerin — Besiege 15 Krabben
21. Boss-Jaegerin — Besiege alle 3 Bosse
22. Unberuehrbar — Besiege einen Boss ohne Schaden zu nehmen

**Sozial (4):**
23. Dorfleben — Sprich mit allen 8 NPCs
24. Tierfreundin — Streichle alle 3 Einhoerner
25. Beste Freundin — Erreiche max. Haustier-Freundschaft
26. Familien-Band — Schliesse alle NPC-bezogenen Quests ab

**Meister (4):**
27. Level 15 — Erreiche Level 15
28. Level 30 — Erreiche Level 30
29. Quest-Koenigin — Schliesse alle 24 Quests ab
30. Legendaere Heldin — Erreiche 25 andere Achievements

**UI:**
- Achievement-Popup bei Unlock: goldener Stern + Name + kurze Animation
- Achievement-Uebersicht im Pause-Menu (Stern-Grid, grau = gesperrt, gold = erreicht)
- Fortschritts-Counter: "X/30 Sterne"

### Animierte lebendige Welt

**Schmetterlinge:**
- 2-3 pro Blumenwiesen-Tile-Bereich (Wiese, Strand, Wolkengarten, Hub-Garten)
- Canvas-gezeichnet (8x8 Pixel), 4-Frame Flatter-Animation
- 4 Farbvarianten (gelb, blau, rosa, orange)
- Zufaellige Flugbahn (Sinus-artig), fliegen weg bei Spieler-Sprint
- Sammelbar fuer Entdecker-Buch (E-Taste bei langsamem Annaehern)

**Voegel:**
- 1-2 pro Baum-Cluster (Wald, Hub, See)
- Sitzen auf Baumkronen, fliegen periodisch auf (alle 10-20s)
- Flug-Animation: einfache Sprites die von A nach B gleiten
- Chirp-Sound (optional)

**Gluehwuermchen:**
- Nur nachts sichtbar (10-15 pro Outdoor-Map)
- Kleine gelbe PointLights (Radius: 0.5 Tiles)
- Langsame zufaellige Drift-Bewegung
- Sammelbar fuer Entdecker-Buch

**Wehende Baeume:**
- Subtile Sway-Animation auf Baumkronen
- Implementation: Sinus-basierter X-Offset auf Baum-Prop Mesh (±0.05 Tiles, 3s Periode)
- Nur bei Wind/Regen staerker (±0.1 Tiles)

**Wellengang:**
- Animierte Wasser-Tiles (3-Frame Loop, UV-Offset-Animation)
- Strand: Brandungs-Effekt (Schaum-Partikel an Strand-Kante)
- See: Sanfte Wellen (leichter Y-Offset auf Wasser-InstancedMesh)

**Wolken-Drift:**
- 3-5 semi-transparente Wolken-Sprites die langsam ueber Outdoor-Maps ziehen
- Schatten auf dem Boden (dunklerer Kreis der mit Wolke wandert)
- Nur auf grossen Outdoor-Maps (Hub, Wald, See, Strand)

### Endgame-Content

**New Game+:**
- Nach Schatten-Ritter-Sieg freigeschaltet
- Behaelt: Inventar, Entdecker-Buch, Achievements, Haustier
- Reset: Quest-Fortschritt, Level (startet bei 15 statt 1), Mob-Spawns
- Gegner: +50% HP, +25% DMG, +20% XP
- "Legendaere Heldin" (Achievement #30) ist auch ohne NG+ erreichbar — erfordert 25 andere Achievements

**Geheime Area: Sternenhimmel (5x5 Mini-Map):**
- Zugang: Sternenterrasse im Wolkenschloss + 25 Achievements
- Zeigt alle 8 NPCs versammelt
- "Danke Emilia"-Text als Sternbild am Himmel
- Emilias Haustier (evolviert) sitzt neben ihr
- Kein Gameplay, reiner Belohnungs-Moment

**Haustier-Evolution (bei max. Freundschaft):**

| Basis | Evolution | Visuell |
|-------|----------|---------|
| Kleiner Fuchs | Feuerfuchs | Orange Flammen-Partikel, groesser |
| Baby-Drache | Grosser Drache | Fluegel ausgebreitet, Feuer-Atem staerker (10 DMG) |
| Magischer Hase | Goldener Hase | Gold-Glow, Sammel-Radius +4 Tiles |

### Neue Quests (6)

| Quest ID | Name | Typ | Ziel | XP |
|----------|------|-----|------|-----|
| cloud_jumper | Wolkenspringerin | visit | Wolkenschloss erreichen | 100 |
| crystal_puzzle | Kristall-Raetsel | puzzle | Spiegel-Puzzle loesen | 80 |
| shadow_slayer | Bezwingerin des Schatten-Ritters | boss | Finalen Boss besiegen | 200 |
| star_collector | Sternensammlerin | achieve | 15 Achievements erreichen | 120 |
| emilia_legend | Emilias Legende | level | Level 30 erreichen | 0 (Endgame) |
| secret_heroine | Geheime Heldin | find | Sternenhimmel-Raum finden | 150 |

### Neue Items M6 (~13)

**Boss-Belohnungen (4):** beach_crown (Deko), leviathan_pearl, sword_gem_plus (DMG: 55), rainbow_sword (DMG: 70)
**Wolkenschloss (5):** cloud_crystal, rainbow_shard, star_fragment, shadow_essence, golden_feather
**Crafting-Outputs (aus M4/M5 Rezepten, hier nur zur Vollstaendigkeit):** sword_gem, diving_helm, pet_treat, glow_potion, sea_soup

### Max Level: 25 → 30

XP-Kurve fortsetzen:
- Level 26: 14,500 XP
- Level 27: 17,500 XP
- Level 28: 21,000 XP
- Level 29: 25,000 XP
- Level 30: 30,000 XP

**sword_gem_plus Upgrade-Mechanik:** Leviathan-Drop `leviathan_pearl` + bestehendes `sword_gem` → automatisches Crafting-Popup nach Boss-Sieg (kein Station-Besuch noetig). Ersetzt `sword_gem` im Inventar durch `sword_gem_plus`.

**Seltene Fundstuecke (6 Eintraege fuer Entdecker-Buch):**

| # | Name | ID | Fundort | Bedingung |
|---|------|----|---------|-----------|
| 1 | Alte Muenze | old_coin | Hub (hinter Haus) | Versteckt, Props-Interaktion |
| 2 | Feenstaub | fairy_dust | Einhorn-Wiese (nachts) | Nur bei Nacht sichtbar |
| 3 | Fossilien-Abdruck | fossil | Dungeon (Sackgasse) | Versteckt hinter Erz |
| 4 | Flaschenpost | message_bottle | Strand (Gezeiten) | Spawnt nur morgens |
| 5 | Verlorenes Tagebuch | lost_diary | Grotte (Ruinen) | Hinter Truhe versteckt |
| 6 | Regenbogen-Feder | golden_feather | Wolkenschloss (Terrasse) | Nach Boss 3 |

---

## QA/Testing-Phasen

### Prinzipien

- **Regression zuerst**: Bestehende Tests muessen weiterhin bestehen
- **Scoring-Test erweitern**: Neue Kategorien pro Meilenstein
- **Kindgerechtes Balancing**: 6-Jaehrige als Testmassstab
- **Performance-Monitoring**: Partikel-Systeme duerfen FPS nicht unter 30 druecken
- **Playwright-basiert**: Automatisierte Tests via `window.__game` API

### Nach M4 — Strand & Sterne QA

**Neue Test-Kategorien:**
- Beach (8 Punkte): Strand laden, Muschel aufheben, Krabbe spawnt, Exits funktionieren
- Fishing (6 Punkte): Angel-Spot erkennen, Minigame starten, Fisch fangen
- DayNight (8 Punkte): Phasen-Wechsel, Lichtfarbe korrekt, Nacht-Laternen, Sterne

**Balancing-Checks:**
- Angel-Timing: Gruene Zone mindestens 40% der Bar
- Krabben: Sollten in 3-4 Hits mit Holzschwert sterben
- Tag/Nacht: 8 Minuten Zyklus fuehlt sich nicht zu schnell/langsam an
- Muschel-Respawn: 1 Spieltag (= 8 Min real) ist fair

**Scoring-Ziel:** ~120/120 Punkte

### Nach M5 — Tiefsee & Freunde QA

**Neue Test-Kategorien:**
- Grotto (8 Punkte): Area laden, alle 4 Bereiche erreichbar, Unterwasser-Visuell korrekt
- Pets (8 Punkte): Haustier waehlen, Follow-Mechanik, kein Steckenbleiben, Scene-Transition
- Weather (6 Punkte): Regen-Partikel, Nebel-Overlay, Sonnenstrahlen, Wetter-Wechsel
- Collection (6 Punkte): Entdecker-Buch oeffnen, Eintrag hinzufuegen, Fortschritt tracken

**Balancing-Checks:**
- Haustier folgt ohne Clipping durch Waende
- Wetter-Partikel: Max 150 gleichzeitig (Performance)
- Grotten-Gegner: Geister-Krabbe nicht zu frustrierend (Unsichtbarkeit max 2s)
- Insekten-Fangen: Grosszuegiger Radius (2 Tiles)

**Scoring-Ziel:** ~150/150 Punkte

### Nach M6 — Wolken & Wunder QA (Finale)

**Neue Test-Kategorien:**
- CloudCastle (8 Punkte): Area laden, alle 4 Bereiche, Regenbogen-Bruecke
- Bosses (10 Punkte): Alle 3 Bosse erreichbar, Phasen-Wechsel, Belohnungen
- Achievements (6 Punkte): System aktiv, Achievement unlocken, UI anzeigen
- Animations (6 Punkte): Schmetterlinge, Voegel, Gluehwuermchen, Wellen, Baeume

**End-to-End Test:**
- Kompletter Playthrough Level 1-30 (automatisiert, beschleunigt)
- Alle 24 Quests abschliessbar
- Alle 3 Bosse besiegbar
- Achievement-Counter korrekt
- Save/Load mit allen neuen Systemen

**Scoring-Ziel:** ~180/180 Punkte

---

## Technische Architektur

### Neue Dateien (geplant)

```
src/
  systems/
    DayNight.js          — Tag/Nacht-Zyklus (M4)
    FishingSystem.js     — Angel-Minigame (M4)
    WeatherSystem.js     — Wetter-Effekte (M5)
    CollectionBook.js    — Entdecker-Buch (M5)
    PetSystem.js         — Haustier-Begleiter (M5)
    AchievementSystem.js — Achievement-Tracking (M6)
    BossSystem.js        — Boss-Encounter-Logik (M6)
  entities/
    Crab.js              — Krabben-Gegner (M4)
    Jellyfish.js         — Quallen-Gegner (M5)
    Octopus.js           — Tintenfisch-Gegner (M5)
    GhostCrab.js         — Geister-Krabbe (M5)
    Pet.js               — Haustier-Entity (M5)
    Butterfly.js         — Schmetterling-Ambient (M6)
    Bird.js              — Vogel-Ambient (M6)
    Boss.js              — Boss-Basis-Klasse (M6)
  world/maps/
    beach.js             — Strand-Map (M4)
    grotto.js            — Unterwasser-Grotte (M5)
    cloud_castle.js      — Wolkenschloss (M6)
    starsky.js           — Sternenhimmel Geheim-Map (M6)
  ui/
    FishingUI.js         — Angel-Minigame-Overlay (M4)
    CollectionUI.js      — Entdecker-Buch-Overlay (M5)
    PetUI.js             — Haustier-Auswahl/Status (M5)
    AchievementUI.js     — Achievement-Popup + Uebersicht (M6)
    BossHealthBar.js     — Boss-HP-Anzeige (M6)
  rendering/
    DayNightRenderer.js  — Licht-Steuerung (M4)
    WeatherRenderer.js   — Partikel-Systeme (M5)
    AmbientLife.js       — Schmetterlinge, Voegel, etc. (M6)
  data/
    fish.js              — Fisch-Definitionen (M4)
    shells.js            — Muschel-Definitionen (M4)
    achievements.js      — Achievement-Definitionen (M6)
    bosses.js            — Boss-Definitionen (M6)
```

### Aenderungen an bestehenden Dateien

- **Game.js**: Integration aller neuen Systeme in Game-Loop, neue Map-Generators registrieren
- **SaveManager.js**: Neue Felder (Haustier, Entdecker-Buch, Achievements, Wetter-State, Tageszeit)
- **Progression.js**: Neue Quests in QUEST_ORDER, Level-Kurve bis 30, neue Quest-Typen (fish, observe, puzzle, boss, achieve, find)
- **HUD.js**: Achievement-Popup, Wetter-Indikator, Haustier-Status
- **InputManager.js**: Keine neuen Keys noetig. KeyF-Consumption-Order erweitern: PlantHealing → FishingSystem → WaterSpray
- **data/items.js**: ~40 neue Items
- **data/mobs.js**: 5 neue Mob-Typen + 3 Bosse
- **data/recipes.js**: 5 neue Rezepte

### Performance-Budget

| System | Max Entities | Max Partikel |
|--------|-------------|-------------|
| Wetter (Regen) | — | 120 |
| Wetter (Schnee) | — | 80 |
| Tag/Nacht | — | 30 (Sterne) |
| Schmetterlinge | 6 pro Map | — |
| Voegel | 4 pro Map | — |
| Gluehwuermchen | 15 pro Map | — |
| Boss-Effekte | 1 Boss | 20 |
| **Gesamt max gleichzeitig** | **~25** | **~250** |

Ziel: Stabil 30+ FPS auf mittlerer Hardware.
