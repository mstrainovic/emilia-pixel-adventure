# Bug Tracker — Emilia's Pixel Adventure

> Code-Verifikation am 2026-06-10: Alle Eintraege gegen den aktuellen Code geprueft.

## Kritische Bugs (Game-Breaking)

| ID | Status | Bug | Verifikation |
|----|--------|-----|--------------|
| B01 | FIXED | E-Taste Mehrfach-Binding | `justPressed()` konsumiert den Tastendruck — nur das erste System pro Frame erhaelt `true` (InputManager.js:69-71) |
| B02 | FIXED | F-Taste Spam erzeugt hunderte Heal-Effects | F nutzt jetzt `justPressed` (einmal pro Druck) + `uiBlocking`-Guard (PlantHealing.js:106, Game.js:2613) |
| B03 | FIXED | Scene-Exit waehrend Dialog offen → UI-Crash | Exits werden nur geprueft wenn keine UI offen ist (Game.js:2703-2705) |
| B04 | FIXED | Mob respawn() | Vollstaendige State-Machine idle/chase/attack/dead/respawning (Mob.js:145-161, 296) |

## Hohe Prioritaet

| ID | Status | Bug | Verifikation |
|----|--------|-----|--------------|
| B05 | FIXED | Items werden waehrend Dialog/Crafting aufgehoben | ItemDrops-Update nur bei `!uiBlocking` (Game.js:2641) |
| B06 | FIXED | Keine Input-Konsumption fuer E-Taste | `_consumed`-Mechanik in InputManager (InputManager.js:9, 70-71) |
| B07 | FIXED | Attack kann waehrend Animation neu starten | `isAttacking`-Guard verhindert Neustart; effektives Intervall 0.6s (CombatSystem.js:21) |
| B08 | FIXED | Water spray (F) spammt Effekte ohne Cooldown | `justPressed` feuert nur einmal pro Tastendruck (Game.js:2613) |

## Mittlere Prioritaet

| ID | Status | Bug | Verifikation |
|----|--------|-----|--------------|
| B09 | FIXED | Tooltip kann off-screen gehen | Clamp jetzt auch in beiden mousemove-Handlern (HUD.js, 2026-06-10) |
| B10 | FIXED | Combat: kein player.alive check | `player.state !== 'dead'` Guard vor tryAttack (Game.js:2340); Player.takeDamage prueft dead-State (Player.js:174) |
| B11 | FIXED | Attack range zu grosszuegig (1.8 tiles) | Reduziert auf 1.5 (CombatSystem.js:11) |
| B12 | FIXED | Mob kann waehrend Death-State attacken | dead/respawning returnen frueh im Update, AI laeuft nicht (Mob.js:145-161) |

## Balance Issues

| ID | Status | Issue | Verifikation |
|----|--------|-------|--------------|
| BAL01 | FIXED | Mob damage zu hoch fuer Kinderspiel | Werte reduziert auf 2-6 dmg, Kommentare "gentle for a 6-year-old" (mobs.js) |
| BAL02 | FIXED | Kein Essen-Verbrauch implementiert | Heal-Items konsumierbar, `healAmount` wird angewendet (Game.js:2760ff, 2792ff) |
| BAL03 | FIXED | Mob respawn 30s | Respawn jetzt 180s Default, pro Spawn konfigurierbar (Mob.js:158) |

## Neue Funde + Fixes (Code-Review 2026-06-10)

| ID | Status | Bug | Fix |
|----|--------|-----|-----|
| B13 | FIXED | PlantHealing: setTimeout/rAF-Loops laufen nach Scene-Wechsel weiter (Memory Leak, Geister-Effekte) | `disposed`-Flag, alle Timer/Loops geguardet (PlantHealing.js) |
| B14 | FIXED | Boss-Belohnung despawnt nach 120s — bei vollem Inventar unwiederbringlich verloren (Boss respawnt nie) | Boss-Drops mit `lifetime = Infinity` (Game.js, ItemDrop.js) |
| B15 | FIXED | Item-Duplikation: Bei Teil-Aufnahme (Inventar fast voll) behielt der Drop die volle Stueckzahl | `count = remaining` in beiden Pickup-Pfaden (ItemDrop.js) |
| B16 | FIXED | CraftingUI: keydown-Listener wurde bei dispose() nie entfernt | Handler als `_escHandler` gespeichert + removeEventListener (CraftingUI.js) |
| B17 | FIXED | Game.js: dispose() war am Dateiende abgeschnitten (Syntaxfehler durch OneDrive-Sync) | Methode rekonstruiert, alle UI-Systeme + Renderer werden disposed |

## Visual-Rework (2026-06-10)

- **Charaktere**: Palette-Swap zielte auf falsche Quellfarben — Outfit-Swap griff NIE, alle 10 Familienmitglieder sahen identisch aus. Fix: echte Sprite-Farben vermessen (Haar 112/70/67, Oberteil 51/152/75, Hose 0/152/220), `pantsColor` als dritte Farbe eingefuehrt. Emilia traegt jetzt ihr pinkes Kleid, jede Figur ist unterscheidbar (SpriteSheetLoader.js, NPC.js).
- **Blumen-Tile (ID 8)**: 7 grelle Regenbogen-Blumen pro Tile → 3 ruhige (rosa/gelb/weiss) (TilesetGenerator.js).
- **Pfad-Tiles**: Orange entschaerft (Tint 0.94/0.90/0.86 auf Center + alle 12 Auto-Tiles).
- **Boden-Deko**: Dichte reduziert (0.32-0.45 → 0.20-0.32), mehr Grasbueschel statt bunter Blumen, Zweit-Deko-Chance halbiert (GroundDecorationRenderer.js).

## Generation 2 (2026-06-11) — QA-Sweep + Performance + nahtlose Tiles

| Thema | Befund | Fix |
|-------|--------|-----|
| "See blinkt schwarz" | Zwei Ursachen: (1) Szenenwechsel dauerte 2-4s bei 0,5s Fade — langer Schwarzbildschirm; (2) Wasser-Shader konnte Alpha ausserhalb [0,1] erzeugen — Schwarzflackern auf echten GPUs (mit Bloom) | Shader-Alpha+Farbe geclampt, Wasser-Overlay z 0.03→0.06 (WaterRenderer.js); Szenenwechsel-Performance (s.u.) |
| Szenenwechsel-Performance | Jeder Slime lud+dekodierte das Spritesheet NEU (~0,5-1s pro Mob!); Palette-Swap-Pixelloops liefen pro Entity pro Wechsel; Deko-Texturen luden seriell | Canvas-Cache fuer alle Sprite-Extraktionen (SpriteSheetLoader.js), loadSlimeAnims() zentral (Mob.js), Promise.all in _loadProps (Game.js). Forest: 3,7s → 1,2s Erstbesuch, ~15ms danach |
| Harte Tile-Kanten zwischen Asset-Paketen | Path_Tile/Water_Tile-Autotiles haben flaches Fremdgruen (62,137,72) eingebacken; der Pfad-Tint von gestern tintete es mit → sichtbare Quadratkanten | compositeAutotileOnBase(): Autotile-Kanten werden auf echtes Grass_Middle gelegt, nur Erd-/Wasserpixel getintet (TilesetGenerator.js) |
| Strand: Wasserkanten mit Gras-Hintergrund auf Sand | Water-Autotiles 23-34 nur fuer Gras geeignet | 12 neue Tiles 47-58: Wasserkanten auf Sand komposit; WATER_EDGES_SAND in AutoTiler.js; beach.js umgestellt; WaterRenderer-IDs erweitert |
| Gras-Patchwork (helle/dunkle Quadrate) | Grasvarianten-Tints (0.95/1.03) zu stark | Tints fast neutral (0.985-1.012) — Variation kommt aus addGrassDetail |
| QA-Playthrough (alle 9 Szenen, Interaktion, Combat, Death/Respawn) | 0 JavaScript-Fehler; Death→GameOver→Enter→Respawn (50 HP, hub) funktioniert | — |

## Generation 3 (2026-06-11) — Game-Feel-Features

| Feature | Umsetzung |
|---------|-----------|
| Emilias Haarschleife | Per-Frame-Pixelstempel im SpriteSheetLoader: pro Frame wird der Haaransatz erkannt und eine 5x2-Schleife (rosa + Knoten + Glanz) oben rechts gesetzt — funktioniert in allen Animationen inkl. Angriff; nur Emilia (`hairBow: true` in NPC_PALETTE_CONFIGS) |
| Charakter-Schatten | Weiche Kontakt-Ellipse (r=0.42, 16% Deckung) unter Player und allen NPCs (Entity._createShadow parametrisiert) |
| Lauf-Staubwoelkchen | VisualEffects.dustPuff(): 2-3 kleine aufsteigende Staubpartikel an den Fuessen, alle 0.22s beim Gehen / 0.14s beim Rennen (Game-Loop-Trigger) |
| Iris-Wipe Szenenwechsel | Zelda-Style Kreisblende statt Vollbild-Fade: radial-gradient zentriert auf projizierte Spielerposition, quadratisches Easing, szenenspezifische Blendenfarbe (SceneManager) |

## Generation 4 (2026-06-11) — Liebe zum Detail

| Feature | Umsetzung |
|---------|-----------|
| Pet-Streicheln | E-Taste nahe dem Begleiter (<1.6 Tiles): 4 aufsteigende, wackelnde Pixel-Herzchen + Freundschaft +2 + sanfter Sound (Game.js, VisualEffects.hearts) |
| Fussspuren im Sand | Auf Sand-Tiles (11-13) hinterlaesst Emilia abwechselnd links/rechts versetzte Abdruecke, die ueber 3s verblassen — auf Gras weiterhin Staub (VisualEffects.footprint, Game.js) |
| Mob-Idle-Huepfen | Slimes & Co. atmen/huepfen im Idle per Squash-and-Stretch (scale-Oszillation, zufaellige Phase pro Mob); Reset bei Chase/Attack (Mob.js) |
| "Neuer Tag"-Banner | Bei Phasenwechsel zu morning: goldenes Banner "Ein neuer Tag bricht an!" mit drehenden Sonnen, 4s Slide-in/Fade-out (HUD.showDayBanner, DayNight-Hook in Game.js) |

## Generation 5 (2026-06-11) — Sammeln & Atmosphaere

| Feature | Umsetzung |
|---------|-----------|
| Muschel-Tagebuch | Muscheln spuelen bei JEDEM Strandbesuch an 6-8 zufaelligen Sandstellen an (gewichteter Pool: haeufige Muscheln bis seltene Perle); die Regenbogen-Muschel erscheint nur nachts. Fund-Meldung mit Tagebuch-Fortschritt "Perle ins Muschel-Tagebuch! (3/8)" — Tagebuch = Muschel-Kategorie im Entdeckerbuch (Tab) (beach.js, Game._discoverItem) |
| Gluehwuermchen | 14 weich leuchtende Gluehwuermchen (additives Glow-Sprite) wandern nachts in Achterbahnen ueber hub/forest/lake/unicorn_meadow, pulsieren individuell und faden bei Tagesanbruch sanft aus (AmbientLife) |

## Generation 6 (2026-06-11) — Kritik-Report abgearbeitet

| # | Befund | Fix |
|---|--------|-----|
| 1 | Quest-Deadlock shadow_slayer (Boss vor Quest besiegt = nie abschliessbar) | `boss`-Typ in _prepopulateQuestProgress: fruehere Kills aus stats.bossesKilled zaehlen (Progression.js) |
| 2 | Achievements treasure_seeker/secret_finder unmoeglich (hartkodiert 0) | Truhen sind jetzt INTERAKTIV (E oeffnet, Loot: Muenzen/Kristalle/Heiltraenke, persistent in Save); secretsFound = gesammelte Rare Finds (Game.js, SaveManager.js). Edge-Case: Kuechen-Truhe im Hub konkurriert mit der Kochstation um E |
| 3 | Muschel-Achievement zaehlte Kategorien statt Muscheln | shellsFound = uniqueCollected.shell.size (Game.js) |
| 4 | Geschenk-System komplett tot | G-Taste nahe NPC verschenkt das gewaehlte Hotbar-Item: FriendshipSystem.onGift + Herzchen + Lieblingsgeschenk-Bonus (+15) (Game.js) |
| 5 | Dialogbox klebte ueber Szenenwechsel | DialogSystem.forceClose() in _clearScene |
| 17 | Q/Tab/P/G nirgends erklaert | Hilfe-Steuerung komplett: Q (Essen/Trank!), G (Geschenk/Wegwerfen), Tab, P; F-Beschreibung entwirrt + 5 neue Quest-Hinweise (HelpOverlay.js) |
| 12+16 | Muenzen nutzlos, tote Items | FERDINAND-SHOP: Kauf-Tab in TradeUI (Heiltrank 8, Suppe 5, Fisch 4, alle Samen 2-6 — fixt auch unbeschaffbare Kuerbis/Kristall-Samen —, Leckerli 2); Inventar-voll- und Zu-arm-Faelle abgefangen; onBuy-Wiring mit HUD-Update |
| 6 | Wolkenschloss/Sternenhimmel = Platzhalterflaechen | Castle: Schlosshof mit Mauern-Thronsaal, Saeulen-Kolonnade, Fackeln, 3 neuen Truhen, Wege-Kreuz; Starsky: 8-Zack-Stern, Satelliten-Inseln mit geschwungenen Kristallpfaden, Landeplattform fuer den versteckten Exit (war vorher Void!). BFS-verifiziert: alle Exits/NPCs/Props erreichbar |
| 18-22 | Texte/Daten | Tote NPC-Versprechen ersetzt (See-Schatz→Gluehwuermchen, Riesenfisch→Regenbogenforelle, Wenzl→Liam, Mamas Fischrezept→Meeres-Suppe), Buch um 4 fehlende Muscheln ergaenzt (12 Eintraege, alle erreichbar), quest_queen 24→25, star_collector-Text + Prepopulate-Fix (achievementCount), Pflanzen-Zaehler-Ueberlauf gefixt, crystal_puzzle-Doppelzaehlung entfernt, Dungeon-Spawns auf >=7 Tiles Abstand |

## Generation 7 (2026-06-11) — letzte Kritikpunkte

| Befund | Fix |
|--------|-----|
| XP-Mauer ab Level 20 (insgesamt ~166.000 XP bis Lvl 30) | Kurve geglaettet: Lvl 21-30 jetzt 2000-3800 XP/Stufe (gesamt ~44.000); spaete Mobs geben mehr XP (Skelett-Krieger 50, Geister-Krabbe 60, Tintenfisch 45 u.a.); Boss-XP feierlich erhoeht (300/600/1000) (levels.js, mobs.js, bosses.js) |
| Waffen-Loch Lvl 7-21 (Steinschwert 25 → Edelstein 40) | Neues KORALLENSCHWERT (32 dmg): Rezept am Amboss aus 3 Korallen + 2 Seestern-Muscheln + 2 Holz — Strand-Material, mittleres Level; eigenes Pixel-Icon; Holzschwert 15→18 dmg (deutlich besser als Faust 10) (items.js, recipes.js, ItemIcons.js) |
| Staubwoelkchen unter Wasser (Grotto) | Aufsteigende, wabernde Luftblasen statt Staub beim Laufen in der Grotte (VisualEffects.bubbles, Game.js) |

## Offene Punkte

- Boss-Drops sind scene-gebunden: Verlaesst man die Arena ohne Aufheben, sind sie weg (Drop-Persistenz waere groesserer Umbau).
- Z-Sorting: Baumkronen koennen hinter Haeusern verschwinden (bekannt, siehe tests/visual-diagnosis.md).
