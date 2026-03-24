# Bug Tracker — Emilia's Pixel Adventure

## Kritische Bugs (Game-Breaking)

| ID | Status | Bug | Datei |
|----|--------|-----|-------|
| B01 | FIXING | E-Taste Mehrfach-Binding — Dialog/Crafting/Resource/Unicorn konkurrieren | InputManager, Game.js |
| B02 | FIXING | F-Taste Spam erzeugt hunderte Heal-Effects (Performance-Crash) | PlantHealing.js |
| B03 | FIXING | Scene-Exit waehrend Dialog offen → UI-Crash | Game.js, SceneManager |
| B04 | FIXING | Mob respawn() funktioniert (wurde geprueft — existiert) | Mob.js |

## Hohe Prioritaet

| ID | Status | Bug | Datei |
|----|--------|-----|-------|
| B05 | FIXING | Items werden waehrend Dialog/Crafting aufgehoben | Game.js |
| B06 | FIXING | Keine Input-Konsumption fuer E-Taste | InputManager.js |
| B07 | FIXING | Attack cooldown zu kurz (0.3s), kann waehrend Animation neu starten | CombatSystem.js |
| B08 | FIXING | Water spray (F) spammt Effekte ohne Cooldown | Game.js |

## Mittlere Prioritaet

| ID | Status | Bug | Datei |
|----|--------|-----|-------|
| B09 | FIXING | Tooltip kann off-screen gehen | HUD.js |
| B10 | FIXING | Combat: kein player.alive check | CombatSystem.js |
| B11 | FIXING | Attack range zu grosszuegig (1.8 tiles) | CombatSystem.js |
| B12 | FIXING | Mob kann waehrend Death-State attacken | Mob.js |

## Balance Issues

| ID | Status | Issue |
|----|--------|-------|
| BAL01 | FIXING | Mob damage zu hoch fuer Kinderspiel |
| BAL02 | FIXING | Kein Essen-Verbrauch implementiert (Heal-Items nutzlos) |
| BAL03 | FIXING | Mob respawn 30s — zu kurz oder zu lang? |
