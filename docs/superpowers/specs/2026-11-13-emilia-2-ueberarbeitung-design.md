# Emilia's Pixel Adventure 2.0 — Überarbeitung und Erweiterung (Design-Spec)

**Datum:** 2026-11-13
**Status:** Vom Auftraggeber freigegeben am 2026-11-13 (unabhängige Gegenprüfung eingearbeitet)
**Ausgangsstand:** Commit `ab9caf1` („Generation 7"); lokal = `origin/main` = Live-Seite (per Byte-Vergleich des Bundles geprüft)
**Kennzeichnung:** *(Vorgabe)* = vom Auftraggeber gesagt · *(Entscheidung)* = von mir festgelegt, korrigierbar · *(offen)* = braucht noch eine Antwort

---

## 1. Worum es geht und warum

Das Spiel ist ein persönliches Geschenk eines Vaters an seine Tochter Emilia (inzwischen 7). Es ist über Monate in vielen kleinen Schritten gewachsen und fühlt sich deshalb „abgehackt und nicht rund" an *(Vorgabe)*. Es soll jetzt mit einer ordentlichen Spec in einem Zug rund gemacht und erweitert werden: besseres Design, bessere Sprites, zwei neue Figuren (Cousine Lena, Cousin Julian), eine neue Karte, sauberes Balancing *(Vorgabe)*. Die Technik ist freigestellt *(Vorgabe)*.

Was wir über die Kinder wissen *(Vorgabe)*:

- **Emilia (7):** tut sich schwer mit zu starken Gegnern. Sie mag das Bauen und findet Angeln cool. Sie mag die Krebse nicht, „die kommen immer wieder sofort".
- **Lena (7):** blond, sehr mutig, freut sich immer sehr.
- **Julian (4):** blond, mag Dinos.
- Ob die drei später an einem Gerät zusammen spielen, wird irgendwann in der Zukunft entschieden.

## 2. Ziele, Nicht-Ziele, Anti-Ziele

### Ziele

1. **Ein Stil, pixelgenau.** Alles im Bild stammt aus einer Stilfamilie und wird ganzzahlig skaliert.
2. **Rundes Spielgefühl.** Bewegung, Kamera, Animationen und Übergänge fließen.
3. **Sanfter, fairer Kampf.** Kein Schaden ohne Vorwarnung, keine Stelle, an der Emilia feststeckt.
4. **Bauen und Angeln sind das Herz.** Beides bekommt Tiefe und treibt den Fortschritt.
5. **Lena und Julian** als Begleiter mit echter Wirkung; **Dino-Tal** als neue Karte und ihr Zuhause.
6. **Stimmiger Fortschritt.** Gebiete öffnen sich in sinnvoller Reihenfolge, keine Grind-Mauer, alle Sammelwege funktionieren.
7. **Eine Oberfläche aus einem Guss,** lesbar für eine Leseanfängerin, vollständig per Touch bedienbar, mit echten Umlauten.
8. **Emilias Spielstand bleibt erhalten** *(Entscheidung; bisher unwidersprochen)*.
9. **Sicherheitsnetz.** Automatische Tests und eine Auslieferung, die nur bei grünen Tests veröffentlicht.
10. **Lizenzsauberes Repo.**

### Nicht-Ziele (bewusst nicht in 2.0)

- Gemeinsames Spielen an einem Gerät. Es wird vorbereitet (siehe 6.3), aber nicht gebaut.
- Online-Funktionen, Konten, Bestenlisten, Käufe.
- Weitere Sprachen. Texte liegen aber zentral, sodass das später geht.
- Gamepad. Die Eingabeschicht lässt es zu, gebaut wird Tastatur/Maus und Touch.
- Vorlesefunktion. Gerätestimmen laufen in manchen Browsern über fremde Server; das wird später gesondert geprüft.
- „New Game Plus". Es ist heute defekt und entfällt; nach dem Finale spielt man frei weiter *(Entscheidung)*.
- Feste Tagesabläufe für Dorfbewohner.

### Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Das Spiel wird schwerer, hektischer oder gruseliger.
- Emilia verliert ihren Spielstand oder Fortschritt.
- Die Live-Seite ist zwischendurch kaputt.
- Es gibt wieder gemischte Zeichenstile oder per Code gezeichnete Platzhalter-Grafik.
- Fortschritt hängt an Text, den eine Siebenjährige nicht lesen kann.
- Daten verlassen das Gerät.

## 3. Rahmenbedingungen

- **Plattform:** Browser, statisch gehostet auf GitHub Pages unter `/emilia-pixel-adventure/`. PC mit Tastatur/Maus sowie Handy und Tablet mit Touch.
- **Datenschutz:** keine externen Anfragen zur Laufzeit. Schriften, Grafik und Ton liegen lokal; die bestehende Content-Security-Policy bleibt mindestens so streng.
- **Sprache:** Deutsch mit korrekten Umlauten. Die serbischen Sätze von Baba und Deda bleiben, mit korrekten Sonderzeichen.
- **Spielstand heute:** `localStorage`-Schlüssel `emilia_pixel_adventure_save`, Format-Version 3, ohne Migration. Zusätzlich `emilia_muted`.
- **Lizenzen heute:**
  - `Cute_Fantasy_Free/` (Emilia, Gras, Bäume, Haus): laut `read_me.txt` nur nicht-kommerziell und „can not redistribute". Das Repo ist öffentlich.
  - `Farm RPG FREE 16x16 - Tiny Asset Pack/`: keine Lizenzdatei im Ordner.
  - `Game Assets/` (Anokolisa): Änderung und kommerzielle Nutzung erlaubt, kein Weiterverkauf. Wird vom Spiel heute nicht verwendet.
- **Arbeitsregeln des Projekts:** Dateien unter 500 Zeilen, typisierte Schnittstellen, Tests nach jeder Änderung, Testartefakte nach `test-artifacts/`.

## 4. Befund in Kürze (Grundlage dieser Spec)

Vollständig aus dem Code gelesen und im laufenden Spiel geprüft (Screenshots in `test-artifacts/overhaul-audit/`).

| Bereich | Befund |
|---|---|
| Stil | Drei Zeichenstile: gekaufte Pixelart (Emilia, Schleime, Skelette), per Code gezeichnete Blöcke (alle Gegner ab Strand, Bosse, Begleiter, Einhorn, Stationen) und vier komplett prozedurale Karten. Strand, Wolkenschloss und Sternenhimmel wirken wie Platzhalter. |
| Bild | Kein Pixelraster: Maßstab `Fensterhöhe/224` (bei Full HD 4,82-fach), Kamera ohne Einrasten, darüber Weichzeichner (FXAA, Bloom). |
| Bewegung | Kein Anlaufen/Abbremsen, Hängenbleiben an Ecken, kein „hinter dem Baum", Angriff sperrt die Bewegung. Vorhandene Angriffs-, Treffer- und Werkzeug-Animationen werden nie abgespielt. |
| Figuren | Alle neun Dorfbewohner sind dieselbe umgefärbte, stehende Figur. |
| Fehler (live) | Nach jedem Treffer bleibt Emilia unsichtbar, bis die Animation wechselt (`Player.js`, 12 von 12 Versuchen). |
| Kampf | Schaden bei bloßer Berührung. Krabben, Quallen, Tintenfische und Geisterkrabben stehen fest nach 5 s wieder da; Wald und Höhle nach 180 s. Bosse sterben in 1–3 s, ihre Folgephasen starten nie. |
| Fortschritt | Alle Gebiete außer Schloss und Sternenhimmel sind ab Minute 1 offen. Zwei Aufgaben verlangen Level 12 bzw. 30; bis Level 30 fehlen rund 36.000 XP ohne passenden Inhalt. |
| Kaputte Wege | Angeln nach Tageszeit, Insekten fangen, Flaschenpost, Kristallknoten, Figuren im Sternenhimmel, „New Game Plus". |
| Wirtschaft | Münzen ohne lohnendes Ziel, neun Ausrüstungsteile ohne Funktion, mehrere Rohstoffe ohne Verwendung, „Fisch" als Zutat praktisch nicht beschaffbar. |
| Oberfläche | Drei Designsprachen, 121 Farben, 22 Schriftgrößen (viele 5–8 px), kein einziger echter Umlaut. Am Handy nicht erreichbar: Slot wählen, Essen, Schenken, Entdeckerbuch, Erfolge. Keine Einstellungen. |
| Technik | `Game.js` mit 3.080 Zeilen, Szenennamen in 16 Dateien fest verdrahtet, keine echten Tests, gespeichert wird nur alle 60 s. |

## 5. Lösungswege

### 5.1 Fundament *(Entscheidung)*

| Weg | Was dafür spricht | Was dagegen spricht |
|---|---|---|
| A — Renovieren, Three.js behalten | schnellster Start, kein Umzug | Three.js ist eine 3D-Bibliothek. Karten, Kollision, Kamera und Pixelraster sind selbst gebaut; genau dort sitzen die Probleme und müssten ein zweites Mal von Hand entstehen. |
| **B — Neuaufbau auf Phaser 4, Inhalte mitnehmen** | 2D-Engine für den Browser: pixelgenaues Bild, Kollision mit Gleiten, Karten aus Daten, Skalierung, Touch. Grafik, Karten und Oberfläche werden ohnehin ersetzt. | Mehr Arbeit am Anfang; zeitweise zwei Versionen nebeneinander. |
| C — Godot | bester Editor | kompletter Neubau, nichts zieht um, größerer Download am Handy. |

**Gewählt: B.** Stand der Recherche: Phaser 4 ist seit April 2026 stabil (4.2.1 vom 9. Juli 2026). Der Builder prüft beim Aufsetzen die dann aktuelle Version und liest die Dokumentation zu Pixelart-Einstellungen, statt sich auf Phaser-3-Wissen zu verlassen.

Was umzieht: Gegenstände, Rezepte, Aufgaben, Dialogtexte, Inventar-, Herstell-, Garten-, Angel- und Freundschaftslogik, der synthetische Ton. Was neu entsteht: Darstellung, Karten, Figuren, Oberfläche, Eingabe.

### 5.2 Sprites *(entschieden am 2026-11-13)*

**Entscheidung nach dem Stiltest:** Grafikbasis für 2.0 ist das freie Pack „Ninja Adventure" (laut Prüfung in der Stiltest-Sitzung frei weitergebbar; die Lizenzdatei wird beim Einbinden mit abgelegt und dabei noch einmal gelesen). SpriteCook ist verworfen: Der Auftraggeber möchte für Grafik nichts zahlen und kein zusätzliches Konto anlegen *(Vorgabe)*. Motive, die das Pack nicht enthält (Emilia, Lena, Julian, Dinos), werden im Stil des Packs aus dessen Figuren abgeleitet; erste Entwürfe liegen in `test-artifacts/overhaul-audit/stiltest/ninja-adventure/`. Die folgende Abwägung bleibt als Herleitung stehen.

| Weg | Einschätzung |
|---|---|
| 1 — Nur das vorhandene Anokolisa-Pack | Kostenlos und lizenzsauber, aber nach Sichtung ungeeignet als Basis: düsterer Verlies-Stil (Orks, Skelette, Ritter), und die Spielfigur ist nur ein kahler Grundkörper ohne Haare und Kleidung. Dinos, Strand, Wolken und Unterwasser fehlen. Bäume, Werkstätten und Feuer sind brauchbar. |
| 2 — Alles neu erzeugen (SpriteCook) | Ein Stil für alles, eigene Figuren für Emilia, Lena und Julian, Dinos. Kosten laut Preisseite: frei ca. 5–10 Bilder/Monat, ca. 10 $/Monat für ca. 100 Bilder. Qualität von Laufanimationen ist ungeprüft. |
| **3 — Erst testen, dann entscheiden** | Vom Auftraggeber gewählt *(Vorgabe)*. |

**Stiltest (Wegwerf-Arbeit, kein Produktcode):** fünf Motive erzeugen — Emilia, Lena, Julian, ein freundlicher Dino, ein Stück Wiese mit Weg — und neben das vorhandene Pack legen. Entscheidungskriterien:

1. Die fünf Motive sehen aus wie aus einer Hand.
2. Eine Laufanimation in vier Richtungen gelingt sauber.
3. Der Look ist freundlich und kindgerecht.
4. Die Nutzungsbedingungen erlauben Veröffentlichung im öffentlichen Repo.
5. Hochrechnung der Kosten für die Liste in Abschnitt 8.4 ist tragbar.

**Rückfallweg,** falls der Test nicht überzeugt: ein einziges, in sich stimmiges, frei weitergebbares Pack als Basis (Kandidat: „Ninja Adventure", nach meiner Erinnerung CC0 — Lizenz und Inhalt vor Nutzung prüfen). Fehlende Motive werden dann im Stil dieses Packs ergänzt, nicht per Code gezeichnet.

Unabhängig von der Quelle gelten die Stilvorgaben aus Abschnitt 8.

## 6. Spielgestaltung

### 6.1 Leitgedanke: „Bauen öffnet die Welt" *(Entscheidung)*

Heute öffnen Level die Welt, und Level kommen vom Kämpfen. Künftig öffnet Emilia die Welt, indem sie etwas baut oder herstellt. Das macht ihr Lieblingssystem zum Motor, gibt Rohstoffen einen Zweck und ersetzt Level-Mauern.

| # | Gebiet | Empfohlenes Level | Öffnet sich durch | Charakter |
|---|---|---|---|---|
| 1 | Dorf | 1 | Start | Zuhause, Werkstätten, Garten, Bauplätze |
| 2 | Wald | 1–4 | offen | erste Gegner (Schleime), Holz, Pilze |
| 3 | See | 3–6 | offen | friedlich, Angeln |
| 4 | Höhle | 5–9 | Pilz-Laterne herstellen (Werkbank) | Skelette, Erz, Kristalle |
| 5 | Einhornwiese | 6–10 | 10 Pflanzen geheilt (war schon so gedacht, wurde nie geprüft) | friedlich, Einhörner |
| 6 | **Dino-Tal (neu)** | 8–13 | Brücke am Dorf-Westrand bauen | Lena und Julian, Dinos |
| 7 | Strand | 11–15 | Steg am See-Südufer reparieren | Krabben, Muscheln, Kokosnuss-König |
| 8 | Grotte | 14–18 | Tauchhelm: bestehendes Rezept, ergänzt um Muscheln vom Strand, damit der Strand vorher kommt; er wird nicht mehr als Aufgaben-Belohnung vergeben | Quallen, Tintenfische, Leviathan |
| 9 | Wolkenschloss | 17–20 | Wolkenstiefel: neues Rezept nur aus Wiesen- und Grotten-Material (z. B. Blütenblatt, Einhornträne, Leuchtkugel) und ein befreundetes Einhorn | Finale, Schatten-Ritter |
| 10 | Sternenhimmel | nach dem Finale | Sternen-Amulett als Belohnung des Finales | Epilog, Belohnungsraum |

Regeln:

- An jeder verschlossenen Stelle zeigt ein Schild mit Bildsymbolen, was gebraucht wird. Kein Textblock.
- **Was Emilia im alten Spielstand schon betreten hat, bleibt offen** (aus `progression.stats.scenesVisited`). Das zugehörige Bauprojekt gilt dann als gebaut und steht fertig in der Welt.
- Keine Aufgabe verlangt ein Level. Die beiden bestehenden Level-Aufgaben (`meadow_hero`, `emilia_legend`) bekommen Ziele aus der Geschichte.
- Der Welt-Graph bleibt ein Baum mit dem Dorf als Mitte; neu ist der Westausgang ins Dino-Tal.

### 6.2 Bauprojekte

Ein Bauprojekt steht an einem festen Ort in der Welt. Emilia bringt Material in beliebig vielen Teillieferungen (Fortschritt wird gespeichert), dann folgt eine kurze Bau-Szene mit Papa oder Opa, und die Welt ändert sich dauerhaft.

| Projekt | Ort | Bewirkt |
|---|---|---|
| Brücke | Dorf West | Zugang Dino-Tal |
| Steg | See Süd | Zugang Strand |
| Baumhaus | Dorf | Emilias eigener Ort: Trophäenregal zieht dorthin, sechs Plätze für selbst gebaute Möbel und Deko |
| Angelhütte | See | Köder, bessere Angel, Becken für gefangene Fische |
| Gewächshaus | Garten | zwei weitere Beete, Pflanzen brauchen seltener Wasser |
| Dino-Stall | Dino-Tal | gefundene Dino-Eier schlüpfen, Baby-Dinos wohnen dort |
| Lagerfeuer (mehrere) | je Gebiet eines | Rastplatz: Herzen auffüllen, speichern, zwischen entzündeten Feuern reisen |
| Regenbogenbrücke | Wolkenschloss | Teil des Finales |

Materialkosten legt der Builder so fest, dass sie die Leitplanken aus 7.4 erfüllen und bisher zwecklose Rohstoffe aufnehmen (Eisenerz, Knochen, Erde, Korallen, Sanddollar, Perlen).

### 6.3 Lena und Julian

- **Rolle:** Begleiter mit echter Wirkung, nicht nur Dorfbewohner *(Entscheidung)*. Emilia lernt sie im Dino-Tal kennen; nach deren Aufgabenreihe kann je einer der beiden überallhin mitkommen, zusätzlich zum Haustier.
- **Lena (7, blond, mutig, fröhlich):** geht voran. Im Kampf lenkt sie einen Gegner ab („Hey!") und der erste Treffer pro Kampf prallt an ihrem Mut ab. Bei jedem Erfolg jubelt sie sichtbar mit.
- **Julian (4, blond, Dino-Fan):** deutlich kleiner als die Mädchen, immer mit seinem Baby-Dino. Der Dino erschnüffelt vergrabene Schätze (Glitzern am Boden, dann graben). Julian passt durch kleine Tunnel und holt Dinge oder öffnet Riegel von der anderen Seite. Gegner beachten ihn nicht; er kann keinen Schaden nehmen.
- **Freundschaft:** beide nutzen das bestehende Freundschaftssystem; höhere Stufen verkürzen die Wartezeit ihrer Fähigkeit.
- **Eigene Figuren:** eigene Sprites mit vollem Animationssatz, keine Umfärbung.
- **In 2.0 nicht spielbar:** Lena und Julian sind Begleiter. Es gibt weiterhin genau einen Spielstand und eine Spielfigur, Emilia; keine Profile.
- **Für später vorbereitet, nicht gebaut:** Jede Figur bekommt ihre Befehle von einer austauschbaren Steuerquelle (heute Emilias Eingabe bzw. die Begleiter-Logik). Ein zweites Kind könnte später eine Begleiter-Figur übernehmen, ohne dass Figuren oder Karten umgebaut werden. Zusätzliche Animationen dafür (Schwert, Angeln) entstehen erst, wenn das entschieden ist.
- **Familie:** Tante und Onkel kommen nicht vor; die beiden wohnen im „Dino-Camp" *(Entscheidung, weil ich die Familie nicht kenne)*.

### 6.4 Dino-Tal (neue Karte)

- **Lage und Größe:** westlich des Dorfes, etwa 50×40 Kacheln, gedacht für die Spielmitte (nach der Höhle, vor dem Strand).
- **Stimmung:** hell, grün, Riesenfarne, ein dampfender Geysir, ein Vulkan nur als ferne Kulisse. Nichts Bedrohliches.
- **Bewohner:** freundliche Pflanzenfresser, die man füttern und danach reiten kann (schneller unterwegs im Tal). Freche kleine „Raptörchen", die nichts wegnehmen und nur wenig Schaden machen, als einzige Gegner.
- **Sammeln:** sechs Dino-Eier (schlüpfen im Dino-Stall), Fossilien an Grabstellen (Julians Fähigkeit), ein Angelplatz mit dem Urzeitfisch.
- **Höhepunkt ohne Kampf:** Der brummige T-Rex hat Zahnweh. Emilia stellt mit Lena und Julian eine Riesen-Zahnbürste und einen Kräutertee her; danach ist er ein Freund. Das ist bewusst ein Bau-Rätsel statt eines Bosskampfs.
- **Aufgabenreihe (acht Schritte):** Brücke bauen → Lena kennenlernen (Wettlauf) → Julians Dino-Ei suchen → Fossilien graben → Dino füttern und reiten → Urzeitfisch angeln → T-Rex helfen → Dino-Fest (ab jetzt begleiten die Cousins überallhin).

### 6.5 Kampf: sanft und lesbar

- **Herzen statt Zahlen.** Emilia hat sichtbare Herzen; ein Herz = 4 Lebenspunkte, damit Viertelherzen möglich sind.
- **Kein Schaden ohne Ansage.** Jeder Angriff eines Gegners hat ein sichtbares und hörbares Ausholen von mindestens 0,6 s. Schaden durch bloßes Berühren entfällt.
- **Nach einem Fehlschlag ist der Gegner kurz offen** (ca. 1 s).
- **Höchstens zwei Gegner greifen gleichzeitig an;** weitere halten Abstand.
- **Gegner lassen ab,** wenn Emilia sich etwa sechs Kacheln von ihrem Platz entfernt.
- **Nach einem Treffer** ist Emilia 1,5 s geschützt und blinkt; das Blinken endet immer sichtbar.
- **Gegner kommen erst am nächsten Morgen wieder,** und nur, wenn Emilia die Karte neu betritt. Das gilt einheitlich für alle Gegner und behebt das Krabben-Problem.
- **„Emilia ist müde"** statt Niederlage: Sie wacht am zuletzt besuchten Lagerfeuer auf, nichts geht verloren.
- **Zwei Stufen in den Einstellungen:** „Sanft" (halber Schaden, volle Herzen nach dem Aufwachen, breitere Zeitfenster beim Angeln) und „Normal". Voreinstellung: Sanft.
- **Spätere Gebiete werden durch das Verhalten der Gegner anspruchsvoller,** nicht durch mehr Schaden.
- **Bosse** bekommen echte Phasen mit klaren Mustern und Pausen zum Zuschlagen; ein Kampf dauert mindestens 30 s. Besiegte Bosse lassen sich zu einem Freundschaftskampf herausfordern (ohne Beute, zählt für Erfolge). Der Schatten-Ritter wird nach dem Sieg zum Freund (unter der Rüstung steckt jemand Einsames) *(Entscheidung)*.
- **Echte Animationen:** Schwung beim Angriff, Zurückzucken beim Treffer; Gegner verpuffen in Sternchen.

### 6.6 Angeln

- Angelplätze an See, Strand, Grotte und im Dino-Tal, je mindestens drei Fischarten.
- Tageszeit wirkt wirklich; Regen erhöht die Chance auf seltene Fische (das Wetter bekommt damit erstmals eine Wirkung).
- Köder (aus Garten und Graben) heben die Chance auf Seltenes.
- „Gebratener Fisch" nimmt jeden Fisch; der Platzhalter-Gegenstand „Fisch" entfällt.
- Die Goldene Angel (gibt es schon als Belohnung) verbreitert das Zeitfenster.
- Ein Angel-Album im Entdeckerbuch zeigt je Fisch Ort und Tageszeit als Symbole.
- Das zweistufige Zeitspiel bleibt.

### 6.7 Weitere Systeme

- **Aufgaben:** eine Hauptgeschichte plus Nebenaufgaben, die Dorfbewohner sichtbar vergeben (Symbol über dem Kopf). Die Anzeige zeigt die Hauptaufgabe und bis zu zwei Nebenaufgaben. Erledigte Aufgaben aus dem alten Stand bleiben erledigt.
- **Geschichte (leichter roter Faden)** *(Entscheidung)*: Schatten lassen im Land die Pflanzen welken. Emilia heilt, baut und findet Freunde; im Wolkenschloss stellt sich heraus, woher die Schatten kommen. Ein kurzes Intro, ein Ende mit allen Freunden.
- **Garten:** wächst nach Spielzeit, auch wenn Emilia unterwegs ist. Ausbauten werden gespeichert.
- **Pflanzen heilen:** geheilte Pflanzen bleiben geheilt (heute welken sie bei jedem Kartenwechsel neu).
- **Freundschaft:** Reden zählt einmal pro Spieltag, Geschenke einmal pro Person und Tag. Jede Stufe gibt eine echte Belohnung (Rezept, Bauplan oder Rabatt); gebrochene Versprechen in Dialogen werden eingelöst oder gestrichen.
- **Haustier:** Leckerli funktionieren; das Haustier sammelt in der Nähe liegende Gegenstände ein.
- **Ausrüstung bekommt Funktionen:** Tauchhelm (Grotte), Wolkenstiefel (Schloss), Sternen-Amulett (Sternenhimmel), Goldene Angel (Angeln), Schmetterlings-Netz (Insekten fangen), Schatzkarte (Weltkarte mit Reisezielen), Edelstein-Ring (Fähigkeiten der Begleiter schneller bereit), Strandkrone und Sammler-Abzeichen (tragbarer Schmuck für Emilia).
- **Entdeckerbuch und Erfolge:** jeder Eintrag und jeder Erfolg ist erreichbar; Zähler kommen aus den Daten, nicht aus festen Zahlen.
- **Laden:** Münzen bekommen Ziele — Baupläne, Möbel, Köder, Samen, Schmuck wie Haarschleifen.
- **Tod der Dialogwand:** ein Gespräch zeigt höchstens zwei kurze Zeilen und lässt sich überspringen; Werkstätten öffnen sich direkt.

## 7. Balancing

Die Werte hier sind **Startwerte**. Verbindlich sind die Leitplanken in 7.4; sie werden als automatische Tests geprüft.

### 7.1 Leben und Schaden (Startwerte)

- Emilia: 5 Herzen zu Beginn, je ein weiteres auf Level 5, 10, 15, 20 und 25 (höchstens 10).
- Gegnerschaden auf „Normal": jeder normale Gegner ½ Herz. Bosse ½ Herz mit normalen Angriffen und 1 Herz nur mit ihrem großen Angriff, der mindestens 1,2 s lang angekündigt wird. Auf „Sanft" jeweils die Hälfte (¼ bzw. ½ Herz). Alle Werte sind damit in ganzen Lebenspunkten darstellbar.
- Level geben keinen Schadens- oder Tempo-Bonus mehr. Emilias Lauftempo ist konstant.

| Waffe | Woher | Schlagkraft |
|---|---|---|
| Holzschwert | Start | 2 |
| Steinschwert | Wald/Höhle | 3 |
| Knochenkeule | Höhle | 4 |
| Korallenschwert | Strand | 5 |
| Edelstein-Schwert | Grotte | 6 |
| Edelstein-Schwert+ | Leviathan | 8 |
| Regenbogenschwert | Finale | 10 |

| Gegner (Gebiet) | Leben | Treffer mit der dort üblichen Waffe |
|---|---|---|
| Schleime (Wald) | 4–6 | 2–3 |
| Skelette (Höhle) | 8–12 | 3–4 |
| Raptörchen (Dino-Tal) | 12–16 | 3–4 |
| Krabben (Strand) | 12–16 | 3–4 |
| Grotten-Wesen | 15–20 | 3–4 |
| Kokosnuss-König | 60 | 12 (Korallenschwert) |
| Leviathan | 100 | 17 (Edelstein-Schwert) |
| Schatten-Ritter | 160 | 20 (Edelstein-Schwert+) |

Angriffstakt von Emilia: etwa alle 0,45 s (heute 0,3 s ohne Animation). Das Edelstein-Schwert+ darf nicht mehr verpassbar sein.

### 7.2 Erfahrung und Level

- Höchstlevel bleibt 30. Emilias Level bleibt beim Umzug erhalten, der Balken wird anteilig umgerechnet.
- Neue Kurve: von Level n auf n+1 braucht es `50 + 25·(n−1)` XP. Bis Level 20 sind das 5.225 XP, bis Level 30 insgesamt 11.600 (heute 44.015).
- Einmalige Quellen (Startwerte): Hauptaufgaben ca. 4.500, Bosse 1.200, Nebenaufgaben 1.600, Bauprojekte 1.200, Entdeckungen 1.350, Erfolge 900, erstes Herstellen je Rezept 600, Pflanzen heilen (einmalig je Pflanze, rund 28 Stück) ca. 280.
- Wiederholbares gibt wenig: Gegner 3–10, Fang 5–15, Ernte 5.
- Wer nur die Hauptgeschichte spielt, endet etwa auf Level 20. Level 30 erreicht, wer sammelt, baut und angelt. Level 30 wird für nichts verlangt und ist über Wiederholbares immer erreichbar, auch mit einem übernommenen Spielstand.

### 7.3 Wirtschaft

- Jeder Gegenstand hat mindestens eine Verwendung (Rezept, Bauprojekt, Aufgabe, Geschenk oder Schmuck).
- Rohkost ist essbar und heilt ein wenig.
- Kein Rezept zerstört ein Einzelstück (heute: Leviathan-Perle, Schatten-Essenz).
- Wirkungslose Tränke (Leuchttrank) bekommen eine Wirkung oder entfallen.

### 7.4 Leitplanken (als Tests)

1. Ein normaler Gegner fällt in seinem Gebiet mit der dort üblichen Waffe in 2–4 Treffern.
2. Schon mit den fünf Start-Herzen übersteht Emilia auf „Normal" überall mindestens 8 Treffer normaler Gegner und mindestens 6 normale Boss-Treffer. Kein einzelner Treffer kostet mehr als 1 Herz.
3. Die XP aus Hauptaufgaben und Bossen bis zu einem Gebiet reichen für das dort empfohlene Level; nichts verlangt ein Level.
4. Mindestens 70 % der XP bis Level 20 stammen aus einmaligen Quellen.
5. Jeder Gegenstand hat eine Quelle und eine Verwendung; jedes Rezept ist mit erreichbaren Zutaten herstellbar.
6. Der Verkaufswert eines hergestellten Gegenstands liegt höchstens 20 % über dem seiner Zutaten.
7. Jeder Eintrag im Entdeckerbuch und jeder Erfolg hat einen erreichbaren Auslöser.
8. Jedes Tor aus 6.1 lässt sich mit Material aus bereits offenen Gebieten öffnen.

## 8. Bild und Stil

### 8.1 Pixelraster

- Kachelgröße 16 Pixel. Ein Bildpunkt der Grafik entspricht immer einer ganzzahligen Zahl von Bildschirmpixeln.
- Zoom: `Z = max(1, floor(min(Breite_physisch / 240, Höhe_physisch / 180)))`. Die Kamera zeigt, was bei diesem Zoom ins Fenster passt (bei Full HD 320×180 Bildpunkte, also 20×11¼ Kacheln).
- Kamera und Figuren rasten auf ganze Bildpunkte ein.
- Keine Weichzeichner über der Pixelgrafik. Stimmung entsteht durch Farbton je Gebiet und Tageszeit sowie durch Lichtflecken im Pixelraster. Tag und Nacht müssen sichtbar wirken (heute wirkungslos).
- Kein Drehen und kein krummes Skalieren von Sprites.

### 8.2 Stilvorgaben (gelten für jede Quelle)

- Eine gemeinsame Farbpalette, ein Umriss-Stil, Licht von oben links, ein Schattenstil (weiche Ellipse unter Figuren, keine schwarzen Balken).
- Größenverhältnis verbindlich: Julian < Emilia = Lena < Erwachsene. Genaue Pixelmaße nach dem Stiltest.
- Dinge, die höher sind als eine Kachel, lassen Figuren dahinter verschwinden (Sortierung nach Fußpunkt).
- Keine Emojis und keine Systemschriften im Spielbild.

### 8.3 Animationen

| Figur | Pflicht-Animationen |
|---|---|
| Emilia | stehen, gehen, rennen (unten, oben, Seite gespiegelt), Schwertschwung, Treffer, müde, gießen, angeln, aufheben, jubeln |
| Lena, Julian | stehen, gehen, rennen, jubeln, sitzen; Lena: rufen; Julian: graben, krabbeln |
| Dorfbewohner | stehen in zwei Richtungen, sich zur Spielerin drehen, eine Tätigkeit an ihrer Werkstatt |
| Gegner | stehen, bewegen, ausholen, angreifen, Treffer, verpuffen |
| Dinos | stehen, gehen, fressen, freuen; Reit-Dino auch mit Reiterin |

Beim Richtungswechsel läuft die Animation im Takt weiter, statt neu zu beginnen. Bäume und Gras bewegen sich leicht.

### 8.4 Was gebraucht wird (Mengengerüst für Kosten und Plan)

- 12 Menschen (Emilia, Lena, Julian, 9 Dorfbewohner), jeder unterscheidbar an Silhouette und Frisur
- rund 14 Gegnerarten, 3 Bosse, T-Rex, 4 Dino-Arten, Haustiere, Einhorn, Hoftiere
- Bodenkacheln für 10 Gebiete mit Übergängen
- rund 120 Gegenstände in der Welt (Bäume in Varianten, Häuser, Werkstätten, Deko, Bauprojekte in Baustufen)
- rund 110 Symbole für Gegenstände
- ein Satz für die Oberfläche (Rahmen, Knöpfe, Herzen, Symbole)

## 9. Spielgefühl

- **Bewegung:** in rund 0,1 s auf Tempo und wieder zum Stehen; acht Richtungen mit gleichem Tempo; der Touch-Stick wirkt stufenlos.
- **Kollision:** Emilia gleitet an Wänden und rutscht um Ecken, statt hängen zu bleiben. Gegner gehen nicht durch Wände.
- **Kamera:** folgt weich, schaut ein kleines Stück in Laufrichtung voraus, wackelt bei Treffern unabhängig von der Bildrate.
- **Kartenwechsel:** unter einer Sekunde; die Kreisblende bleibt.
- **Eingaben gehen nie verloren,** auch nicht während Treffer-Pausen oder Blenden.
- **Ziel:** 60 Bilder pro Sekunde auf einem Mittelklasse-Tablet. Das Spiel hat eine einblendbare Bildraten-Anzeige; gemessen wird vom Auftraggeber auf den Geräten der Kinder, nicht im automatischen Test.

## 10. Oberfläche und Bedienung

- **Ein Baukasten:** Farben, vier Schriftgrößen, Abstände und Rahmen sind einmal festgelegt und werden überall verwendet. Ein Fenster-Stil, ein Knopf-Stil, ein Schließen-Knopf an derselben Stelle.
- **Schrift:** Fließtext mindestens 16 px in einer gut lesbaren, runden Schrift (lokal eingebunden, freie Lizenz). Die Pixelschrift nur für Titel und Zahlen.
- **Ein Fenster-Verwalter:** jedes Fenster schließt mit ✕, Esc und Tippen daneben, hält das Spiel an, blendet weich ein und aus und gibt einen Ton.
- **Bildschirmzonen:** oben links Herzen, Level und Münzen; oben rechts Aufgabe und Menü-Knopf; unten Mitte Schnellleiste; unten links Karte (PC) bzw. Stick (Touch); unten rechts Aktionsknöpfe (Touch).
- **Touch vollständig:** Tippen auf einen Slot wählt ihn; langes Drücken zeigt die Beschreibung; ein Kontext-Knopf zeigt als Symbol, was er gerade tut (reden, aufheben, angeln, gießen, bauen); ein Menü-Knopf führt zu Rucksack, Buch, Erfolgen, Karte, Hilfe und Einstellungen. Tippflächen mindestens 48 px. Aussparungen am Bildschirmrand werden beachtet.
- **Handy:** Querformat; im Hochformat erscheint ein freundlicher Dreh-Hinweis *(Entscheidung)*. Tablets funktionieren in beiden Lagen.
- **Gewohnte Tasten bleiben:** WASD/Pfeile, Shift, Leertaste, E, F, Q, I, Tab, H, 1–8.
- **Einstellungen:** Lautstärke für Musik und Geräusche getrennt, Stufe Sanft/Normal, Textgröße, Spielstand als Datei sichern und laden. „Neues Spiel" und „Spielstand löschen" liegen hinter einer Elternsperre (drei Sekunden gedrückt halten) und fragen nach.
- **Fehlertoleranz:** Kaufen und Verschenken fragen bei wertvollen Dingen nach; die ausgerüstete Waffe lässt sich nicht verschenken oder wegwerfen.
- **Texte:** eine zentrale Textdatei, echte Umlaute, feste Begriffe (Aufgabe, Erfolge, Herstellen, Gegenstand, Rucksack), keine internen Kennungen im Bild. Hinweise nennen je nach Gerät Taste oder Knopf.
- **Ton:** der synthetische Ton zieht um. Neu: Musik für Strand, Grotte, Wolkenschloss, Sternenhimmel und Dino-Tal, Schritte, Klicks in der Oberfläche, eigene Töne für Aufgabe, Erfolg, Truhe und Boss-Treffer.

## 11. Technik

- **Werkzeuge:** Phaser 4, TypeScript (streng), Vite, Vitest für Logik, Playwright für Durchspiel-Tests *(Entscheidung)*.
- **Aufbau:**
  - `data/` — Inhalte als typisierte Daten: Gegenstände, Rezepte, Aufgaben, Gegner, Dorfbewohner, Bauprojekte, Karten-Metadaten, Texte.
  - `systems/` — reine Spiellogik ohne Engine-Abhängigkeit, vollständig testbar.
  - `scenes/` — eine allgemeine Welt-Szene, die jede Karte aus Daten aufbaut. Kein Kartenname steht im Code.
  - `entities/`, `ui/` (HTML/CSS über dem Spielbild), `assets/`.
- **Zustand:** ein einziges speicherbares Spielzustands-Objekt. Änderungen laufen über typisierte Ereignisse, auf die Oberfläche, Ton, Erfolge und Speichern hören; keine direkten Querverweise und kein globales `window.__game` außerhalb von Entwicklungs- und Test-Builds.
- **Karten:** als Daten im Tiled-JSON-Format mit Ebenen (Boden, Bodendetail, Kollision, Objekte, Ereignisse). Ein Umwandler exportiert die neun bestehenden Karten als Ausgangspunkt, damit Wege, Ausgänge und Orte bleiben, die Emilia kennt. Strand, Wolkenschloss und Sternenhimmel werden danach neu gestaltet.
- **Eingabe:** eine Schicht übersetzt Tastatur, Maus und Touch in Aktionen.
- **Dateien** unter 500 Zeilen.

### 11.1 Spielstand

- Neues, versioniertes Format mit eigener Migrationskette ab dem ersten Tag.
- Die Übernahme alter Stände arbeitet **nach vorhandenen Feldern, nicht nach Versionsnummer**: Version 3 gibt es in mehreren Formen (Freundschaft, Garten, Münzen, Truhen und Hinweise kamen ohne Versionssprung dazu), und fehlende Felder bekommen sichere Vorgaben.
- Sonderfall „New Game Plus": Wurde es im alten Spiel angeklickt, sind die erledigten Aufgaben dort geleert. Die Übernahme baut sie dann aus den Belegen wieder auf (besiegte Bosse, besuchte Gebiete, Zähler, Level). Im Zweifel gilt etwas als erledigt.
- Der neue Stand liegt unter einem eigenen Schlüssel. Der alte Schlüssel wird **gelesen und nie beschrieben**; die Übernahme ist eine Kopie. Das alte Spiel läuft damit unverändert weiter.
- Übernommen werden: Level, Inventar, Münzen, erledigte Aufgaben, besuchte Gebiete (öffnen die Tore), Freundschaft, Garten, Entdeckerbuch, Erfolge, besiegte Bosse, geöffnete Truhen, Haustier, gesehene Hinweise, Stumm-Einstellung.
- Umgerechnet werden: Lebenspunkte in Herzen (aus dem Level), XP anteilig.
- Entfallene Gegenstände werden durch ihren Nachfolger ersetzt („Fisch" → Goldfisch).
- Gespeichert wird bei Kartenwechsel, nach Aufgabe, Boss und Bauprojekt, am Lagerfeuer, beim Verlassen der Seite und zusätzlich alle 60 s.
- **Übergangszeit:** Solange das neue Spiel Vorschau ist, bietet es beim Start an, den Stand aus dem alten Spiel neu zu holen, sobald dieser neuer ist als die letzte Übernahme. Am Umschalttag wählt der Auftraggeber einmalig, ob der Vorschau-Stand oder der Stand aus dem alten Spiel weitergeführt wird.
- **Schutz vor Verlust:** Spielstände liegen je Gerät und Browser getrennt, und manche Browser (Safari) können sie nach längerer Pause löschen. Deshalb gibt es die Sicherung als Datei, und das Spiel erinnert gelegentlich daran.
- Die Übernahme wird mit Beispielständen jeder Form getestet, die es in der Git-Historie gab, sowie mit beschädigten und unvollständigen Ständen. Ein Test mit Emilias echtem Stand entfällt: Der Auftraggeber liefert keine Sicherungsdatei (entschieden am 2026-11-13); der Spielstand wird trotzdem übernommen. Umso wichtiger sind die Robustheit der Übernahme und die Regel, dass der alte Schlüssel nie beschrieben wird (das alte Spiel bleibt als Rückweg nutzbar).

### 11.2 Tests und Auslieferung

- Logik-Tests für Fortschritt, Inventar, Herstellen, Angeln, Freundschaft, Migration.
- Daten-Tests für die Leitplanken aus 7.4.
- Karten-Tests: jeder Ausgang hat ein Gegenstück, jede Figur und jedes Objekt ist erreichbar, kein Startpunkt liegt in einer Wand.
- Durchspiel-Test: starten, laufen, Karte wechseln, reden, herstellen, angeln, kämpfen, speichern, neu laden.
- Veröffentlicht wird nur bei grünen Tests.

### 11.3 Übergang ohne Ausfall

- Das neue Spiel entsteht als eigenes Projekt im Ordner `v2/` desselben Repos. Die Auslieferung baut beide: das alte Spiel bleibt an der bekannten Adresse, das neue liegt unter `/v2/`.
- Umgeschaltet wird erst, wenn das neue Spiel alle Gebiete enthält und Emilia es lieber spielt.

## 12. Etappen

Jede Etappe endet spielbar und getestet. Für jede Etappe entsteht ein eigener Umsetzungsplan. Der erste Plan deckt Etappe 0 ab (`docs/superpowers/plans/2026-11-13-emilia-2-etappe-0-fundament.md`); der Plan für Etappe 1 folgt, sobald der Stiltest entschieden ist *(Entscheidung, nach der Freigabe angepasst)*.

| # | Etappe | Ergebnis |
|---|---|---|
| 0a | Sofort-Korrekturen im alten Spiel | Emilia bleibt nach Treffern sichtbar; Krabben und Grotten-Wesen kommen nicht mehr nach 5 s wieder. Dazu ein Knopf „Spielstand sichern", der den Stand als Datei herunterlädt (Sicherung vor allem Weiteren; als Testvorlage wird die Datei nicht mehr gebraucht, siehe 11.1). Drei kleine, gezielte Änderungen, damit sie sofort etwas davon hat. |
| 0b | Fundament | neues Projekt, Tests und Auslieferung, Spielstand-Format mit Migration, Inhaltsdaten umgezogen, alte Karten exportiert. Die Spiellogik zieht jeweils mit der Etappe um, die sie braucht. |
| 1 | Das Dorf im neuen Look | pixelgenaues Bild, Bewegung, Kamera, Figuren, Gespräche, Grundanzeige, Touch — zum Anfassen unter `/v2/`. Hier fällt die endgültige Stil-Entscheidung. |
| 2 | Kernschleifen | Rucksack, Herstellen, erstes Bauprojekt, Garten, Angeln, Laden, Speichern |
| 3 | Kampf und Welt 1 | Wald, See, Höhle; neuer Kampf, Tore, Lagerfeuer |
| 4 | Welt 2 | Einhornwiese, Strand, Grotte; überarbeitete Bosse |
| 5 | Dino-Tal | Lena, Julian, Dinos, T-Rex |
| 6 | Finale und Sammeln | Wolkenschloss und Sternenhimmel neu, Entdeckerbuch, Erfolge, Baumhaus, Ende der Geschichte |
| 7 | Feinschliff und Umschalten | Einstellungen, Ton, Balancing-Durchgang, Messung auf echten Geräten, Umschalten |

## 13. Arbeitsweise und eingesetzte Skills

- **Superpowers:** Brainstorming (diese Spec) → Writing Plans → Subagent-Driven Development mit Test-Driven Development; Systematic Debugging bei Fehlern; Verification Before Completion und Code Review vor jedem Etappen-Abschluss.
- **Oberfläche:** `ui-ux-pro-max` und die Design-Skills (Design-System, Barrierefreiheit, Texte) in Etappe 1, 2 und 7.
- **Tests im Browser:** Playwright (ist installiert).
- **Grafik:** freies Pack „Ninja Adventure"; kein Erzeugungsdienst.
- Weitere Plugins sind nach heutigem Stand nicht nötig. Neue Installationen nur nach Rückfrage.

## 14. Dem Builder überlassen

- Genaue Materialkosten, Rezepte und Belohnungen innerhalb der Leitplanken.
- Die Zuordnung alter zu neuen Aufgaben-Kennungen (als Tabelle mit Test).
- Aufbau der einzelnen Karten-Ebenen und Wahl der Phaser-Bausteine.
- Die genaue Farbpalette und Pixelmaße nach dem Stiltest.
- Texte der neuen Aufgaben und Dialoge im Ton der bestehenden.

## 15. Offene Punkte für den Auftraggeber

1. Sprite-Quelle — erledigt: „Ninja Adventure" (5.2).
2. **Altes Spiel nach dem Umschalten:** Bleibt es als „Klassik" erreichbar, wird das Paket `Cute_Fantasy_Free` weiter öffentlich verteilt. Empfehlung: beim Umschalten abschalten und die beiden unklaren Pakete aus dem aktuellen Stand des Repos entfernen. Ein Bereinigen der Git-Historie wäre ein eigener, nicht umkehrbarer Schritt und geschieht nur auf ausdrücklichen Wunsch.
3. Geräte — erledigt (2026-11-13): PC und iPad („sie spielen am PC und am iPad"). Folgen: Browser-Tests in Chromium und WebKit; Touch und beide Lagen am iPad sind Pflicht; die Sicherung als Datei kommt schon mit Etappe 1 in die Oberfläche (Plan 1b).
4. Ausgaben für Grafik — erledigt: keine bezahlten Dienste, keine zusätzlichen Konten.
