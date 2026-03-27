# Visuelle Diagnose: Clipping & Z-Ordering-Probleme

**Datum:** 2026-03-27
**Analyse-Scope:** Gesamtes Rendering-System (TileMapRenderer, Entity, SpriteRenderer, GroundDecorationRenderer, Camera, Game.js, alle Map-Dateien)

---

## 1. Z-Ordering-Analyse

### 1.1 Vollstaendige Z-Positions-Formeln

Alle z-Werte im gesamten Rendering-System, sortiert von niedrig (hinten) nach hoch (vorne):

| Schicht | Formel | z-Range (y=0..40) | Quelle |
|---------|--------|-------------------|--------|
| **Ground Tiles** | `z = 0` (fest) | `0.0` | TileMapRenderer.js:72 — `dummy.position.set(pos.col+0.5, -(pos.row+0.5), 0)` |
| **Ground Deco** | `z = 0.04 + y * 0.0001` | `0.04 .. 0.044` | GroundDecorationRenderer.js:236 |
| **Prop Shadow** | `z = 0.05 + (y+hT) * 0.001` | `0.05 .. 0.098` | TileMapRenderer.js:101 — nur bei heightTiles >= 3 |
| **Tide Foam** | `z = 0.04 + (y+0.7) * 0.001` | `0.041 .. 0.0447` | addProp zOffset=0.04 |
| **Seashell/Starfish** | `z = 0.05 + (y+0.6) * 0.001` | `0.051 .. 0.0906` | addProp zOffset=0.05 |
| **Driftwood** | `z = 0.06 + (y+0.8) * 0.001` | `0.061 .. 0.0988` | addProp zOffset=0.06 |
| **Cloud Puff** | `z = 0.08 + (y+1) * 0.001` | `0.081 .. 0.121` | addProp zOffset=0.08 |
| **Beach Rock** | `z = 0.08 + (y+sz) * 0.001` | `0.081 .. 0.121` | addProp zOffset=0.08 |
| **Beach Grass** | `z = 0.09 + (y+1) * 0.001` | `0.091 .. 0.131` | addProp zOffset=0.09 |
| **Rainbow Arc** | `z = 0.09 + (y) * 0.001` | `0.09 .. 0.13` | addProp zOffset=0.09 |
| **Props (generic)** | `z = 0.1 + (y+hT) * 0.001` | `0.1 .. 0.148` | addProp zOffset=0.1 (Standard) |
| **Props (addPropFromSheet)** | `z = 0.1 + (y+hT) * 0.001` | `0.1 .. 0.148` | TileMapRenderer.js:160 — fest 0.1 als Base |
| **Tree (Oak 4x5)** | `z = 0.1 + (y-3.5+5) * 0.001` = `0.1 + (y+1.5)*0.001` | `0.1015 .. 0.1415` | Game.js:1095 — addProp(tex, x-1, y-3.5, 4, 5, 0.1) |
| **House (6x8)** | `z = 0.1 + (y-4+8) * 0.001` = `0.1 + (y+4)*0.001` | `0.104 .. 0.144` | Game.js:1203 — addProp(tex, x, y-4, 6, 8, 0.1) |
| **Wilted Plant** | `z = 0.11 + y * 0.001` | `0.11 .. 0.15` | PlantHealing.js:55 |
| **Resource Node** | `z = 0.11 + y * 0.001` | `0.11 .. 0.15` | ResourceNode.js:50 |
| **Rock (decor)** | `z = 0.11 + (y+0.8) * 0.001` | `0.111 .. 0.151` | addProp zOffset=0.11 |
| **Station** | `z = 0.12 + (y+sz.h) * 0.001` | variabel | Game.js:1801 |
| **Bonfire (anim)** | `z = 0.15 + y * 0.001` | `0.15 .. 0.19` | Game.js:1150 — SpriteRenderer.setPosition() |
| **Chicken (anim)** | `z = 0.12 + y * 0.001` | `0.12 .. 0.16` | Game.js:1263 |
| **Signpost** | `z = 0.15 + (y-1+1.5) * 0.001` = `0.15 + (y+0.5)*0.001` | `0.1505 .. 0.1905` | Game.js:1568 |
| **Entity (Player/NPC/Mob)** | `z = 0.2 + y * 0.001` | `0.2 .. 0.24` | Entity.js:73 |
| **Unicorn** | `z = 0.2 + y * 0.001` | `0.2 .. 0.24` | Unicorn.js:169 |
| **Pet** | `z = 0.2 + y * 0.001` | `0.2 .. 0.24` | Pet.js:385, Pet.js:398 |
| **Entity Shadow** | `z = (0.2 + y*0.001) - 0.05` = `0.15 + y*0.001` | `0.15 .. 0.19` | Entity.js:79 |
| **Item Drop** | `z = 0.25 + y * 0.001` | `0.25 .. 0.29` | ItemDrop.js:29 |
| **Insect** | `z = 0.25 + y * 0.001` | `0.25 .. 0.29` | Insect.js:259 |
| **Boss** | `z = 0.3 + y * 0.001` | `0.3 .. 0.34` | Boss.js:238 |
| **Bird** | `z = 0.4 + y * 0.001` | `0.4 .. 0.44` | Bird.js:177 |
| **Labels (NPC/Station)** | `z = 0.5` (fest) oder `0.5 + y*0.001` | `0.5 .. 0.54` | NPC.js:93, Game.js:1818, Mob.js:141 |
| **Fishing Prompt** | `z = 0.5` | `0.5` | FishingSystem.js:103 |
| **Damage Numbers** | `z = 5.0` | `5.0` | DamageNumbers.js:69 |

### 1.2 Z-Range-Konflikte

**KRITISCH: Props vs. Props (gleiche z-Basis 0.1)**

Alle Props ueber `addProp()` mit zOffset=0.1 und alle Props ueber `addPropFromSheet()` verwenden exakt die gleiche z-Formel:
```
z = 0.1 + (worldY + heightTiles) * 0.001
```

Das bedeutet: die z-Sortierung basiert ausschliesslich auf der Y-Position der **Unterkante** (Fuss) des Sprites. Das ist die korrekte Strategie fuer top-down Rendering. Aber:

**Problem 1: Haeuser haben eine falsche Unterkante**

- `house` wird platziert als: `addProp(tex, prop.x, prop.y - 4, 6, 8, 0.1)`
- Die Unterkante (foot) ist bei: `worldY + heightTiles = (prop.y - 4) + 8 = prop.y + 4`
- Das bedeutet: ein Haus bei y=6 hat z = `0.1 + (6+4)*0.001 = 0.110`

**Problem 2: Baeume Oak_Tree.png**

- `tree` wird platziert als: `addProp(tex, prop.x - 1, prop.y - 3.5, 4, 5, 0.1)`
- Unterkante: `(prop.y - 3.5) + 5 = prop.y + 1.5`
- Ein Baum bei y=6 hat z = `0.1 + (6+1.5)*0.001 = 0.1075`

**Vergleich Baum y=6 vs. Haus y=6:**
- Baum: z = 0.1075
- Haus: z = 0.110

Der Baum wird **hinter** dem Haus gerendert. Das ist KORREKT wenn der Baum weiter oben steht (seine Fuesse bei y=7.5 vs. Haus-Fuesse bei y=10). Aber visuell sieht es so aus, als ob der Baum nahe am Haus steht, und die Baumkrone wird vom Haus verdeckt.

### 1.3 Das fundamentale Design-Problem

Das z-Sorting basiert auf **ganzen Sprites** (einem einzelnen Quad). Ein 4x5-Tile-Baum ist EIN Mesh. Ein 6x8-Tile-Haus ist EIN Mesh. THREE.js sortiert diese Quads als Ganzes: entweder ist der gesamte Baum vor oder hinter dem gesamten Haus.

In einem echten 2D-Sprite-Renderer wuerde man:
1. Den Stamm hinter dem Haus rendern
2. Die Baumkrone vor dem Haus rendern

Das ist mit einfachen Quads ohne Splitting nicht moeglich.

---

## 2. Prop-Overlap-Analyse (Hub-Map)

### 2.1 Hub-Map Props mit Groesse

| Prop | Typ | Map-Position (x,y) | Sprite worldPos | Groesse (tiles) | Sprite-Bounds | z-Wert (foot) |
|------|-----|-------------------|--------------------|-----------------|----------------|---------------|
| Haus NW | house | (5, 6) | (5, 2) | 6x8 | x:5..11, y:-2..6 | 0.1 + 10*0.001 = 0.110 |
| Haus NE | house | (27, 6) | (27, 2) | 6x8 | x:27..33, y:-2..6 | 0.110 |
| Haus SE | house | (27, 19) | (27, 15) | 6x8 | x:27..33, y:11..19 | 0.1 + 23*0.001 = 0.123 |
| Haus E | house | (32, 10) | (32, 6) | 6x8 | x:32..38, y:2..10 | 0.1 + 14*0.001 = 0.114 |
| Baum (13, 6) | tree/oak | (12, 2.5) | 4x5 | x:12..16, y:-0.5..4.5 | 0.1 + 7.5*0.001 = 0.1075 |
| Baum (26, 6) | tree/round | (25, 2.5) | 4x5 | x:25..29, y:-0.5..4.5 | 0.1075 |
| Baum (20, 8) | tree/round | (19, 4.5) | 4x5 | x:19..23, y:1.5..6.5 | 0.1 + 9.5*0.001 = 0.1095 |
| Baum (3, 6) | tree/pine | (2, 2.5) | 4x5 | x:2..6, y:-0.5..4.5 | 0.1075 |
| Maple (17, 8) | maple | (16, 5.5) | 2.5x3 | x:16..18.5, y:5.5..8.5 | 0.1 + 8.5*0.001 = 0.1085 |
| Maple (22, 8) | maple | (21, 5.5) | 2.5x3 | x:21..23.5, y:5.5..8.5 | 0.1085 |

### 2.2 Ueberlappende Prop-Paare im Hub

**Paar 1: Baum (13, 6) vs. Haus NW (5, 6)**
- Baum-Bounds: x:12..16, y:-0.5..4.5
- Haus-Bounds: x:5..11, y:-2..6
- **Ueberlappung:** NEIN (x: Baum beginnt bei 12, Haus endet bei 11)
- Knapp daneben, keine Ueberlappung.

**Paar 2: Baum (26, 6) vs. Haus NE (27, 6)**
- Baum-Bounds: x:25..29, y:-0.5..4.5
- Haus-Bounds: x:27..33, y:-2..6
- **Ueberlappung:** JA (x:27..29, y:-0.5..4.5)
- Baum z=0.1075, Haus z=0.110
- **Baum wird hinter dem Haus gerendert** (Baumkrone von Haus-Dach verdeckt)
- **Korrekt?** Baum-Fuss bei y=7.5 (world), Haus-Fuss bei y=10 (world). Der Baum steht weiter oben, also HINTER dem Haus. Das ist KORREKT fuer die Fuesse, aber die Baumkrone steht visuell neben/vor dem Haus. Mit Einzelquad-Rendering ist das nicht loesbar.

**Paar 3: Baum (36, 5) vs. Haus E (32, 10)**
- Baum-Bounds: x:35..39, y:1.5..6.5
- Haus-Bounds: x:32..38, y:6..14
- **Ueberlappung:** JA (x:35..38, y:6..6.5)
- Baum z=0.1 + 6.5*0.001 = 0.1065, Haus z=0.114
- **Baum hinter Haus** — korrekt (Baum-Fuss bei 6.5 < Haus-Fuss bei 14)

**Paar 4: Baum (20, 8) vs. Maple (22, 8)**
- Baum-Bounds: x:19..23, y:1.5..6.5
- Maple-Bounds: x:21..23.5, y:5.5..8.5
- **Ueberlappung:** JA (x:21..23, y:5.5..6.5)
- Baum z=0.1095, Maple z=0.1085
- **Maple wird hinter Baum gerendert** — Maple-Fuss bei y=8.5, Baum-Fuss bei y=9.5. Maple steht eigentlich weiter oben (naeher an Kamera-Oberkante), also korrekt hinter dem Baum.

**Paar 5: Baum (20, 24) vs. Maple (22, 22)**
- Baum (20, 24) Bounds: x:19..23, y:20.5..25.5
- Maple (22, 22) Bounds: x:21..23.5, y:19.5..22.5
- **Ueberlappung:** JA (x:21..23, y:20.5..22.5)
- Baum z=0.1 + 25.5*0.001 = 0.1255, Maple z=0.1 + 22.5*0.001 = 0.1225
- **Maple hinter Baum** — korrekt (Maple-Fuss oben)

### 2.3 Zusammenfassung der Ueberlappungen

Die z-Sortierung ist im Prinzip **korrekt**: Props mit niedrigerer Fuss-Y-Position werden hinter Props mit hoeherer Fuss-Y-Position gerendert. Das Problem ist, dass **grosse Sprites als einzelne Quads** gerendert werden:

- Eine **4x5-Tile-Baumkrone** ueberlappt mit einem **6x8-Tile-Hausdach**
- Da der gesamte Baum vor ODER hinter dem gesamten Haus ist, gibt es **visuelles Clipping**
- Die Baumkrone (oberer Teil) wird faelschlicherweise vom Hausdach verdeckt, obwohl sie visuell davor sein sollte

---

## 3. Rendering-Schichten (Layer)

### 3.1 Schicht-Hierarchie

| # | Schicht | Container | Hinzugefuegt zu | depthWrite | Mesh-Anzahl (Hub, geschaetzt) |
|---|---------|-----------|----------------|------------|-------------------------------|
| 1 | **Ground Tiles** | `tileMapRenderer.groundGroup` | `scene` | true (Standard) | ~1280 Instances (40x32 Grid) |
| 2 | **Ground Deco** | `groundDeco.group` | `scene` | false | ~500-800 InstancedMesh-Instanzen |
| 3 | **Props** | `tileMapRenderer.propGroup` | `scene` | false | ~120+ Meshes (Baeume, Haeuser, Blumen, etc.) |
| 4 | **Entities** | direkt auf `scene` | `scene` | false | Player (~8 SpriteRenderer-Meshes), NPCs (~7*8), Mobs |
| 5 | **Entity Shadows** | direkt auf `scene` | `scene` | false | 1 pro Entity (~16) |
| 6 | **Animated Sprites** | direkt auf `scene` | `scene` | false | Bonfire, Chicken (~4 im Hub) |
| 7 | **Resources** | direkt auf `scene` | `scene` | false | Wilted Plants (~6), Resource Nodes |
| 8 | **Plant Healing Meshes** | direkt auf `scene` | `scene` | false | 6 im Hub |
| 9 | **Item Drops** | direkt auf `scene` | `scene` | false | Dynamisch |
| 10 | **Labels** | direkt auf `scene` | `scene` | false | Station-Labels (~5), NPC-Names (~7) |
| 11 | **Insects** | direkt auf `scene` | `scene` | false | ~3-8 |
| 12 | **Birds** | direkt auf `scene` | `scene` | false | ~2-4 |
| 13 | **VFX** | direkt auf `scene` | `scene` | false | Dynamisch |
| 14 | **Damage Numbers** | direkt auf `scene` | `scene` | false | Dynamisch |
| 15 | **Day/Night Overlay** | DayNightRenderer | `scene` | false | 1 Fullscreen-Quad |
| 16 | **Weather** | WeatherRenderer | `scene` | false | Rain/Fog/Sunbeam Meshes (renderOrder 8-10) |
| 17 | **Ambient Life** | direkt auf `scene` | `scene` | false | Wolken, Sterne, etc. |
| 18 | **Lights** | direkt auf `scene` | `scene` | n/a | AmbientLight + DirectionalLight |

### 3.2 Wichtige Beobachtungen

1. **Alle transparenten Sprites haben `depthWrite: false`** — das ist korrekt fuer 2D-Sprites, verhindert dass transparente Pixel andere Sprites ausstanzen.

2. **Ground Tiles (InstancedMesh)** haben implizit `depthWrite: true` (Standard-MeshBasicMaterial). Da sie bei z=0 liegen und alle Props bei z>0, ist das unkritisch.

3. **Kein `renderer.sortObjects = false`** — THREE.js sortiert standardmaessig nach z-Distanz zur Kamera. Da die Kamera bei z=50 steht und nach z=0 blickt, werden Objekte mit hoeherem z zuerst gerendert (naeher an der Kamera). Das fuehrt zu:
   - Transparente Objekte mit hoeherem z werden VOR Objekten mit niedrigerem z gerendert
   - Da `depthWrite: false`, werden spaeter gerenderte Objekte UEBER frueher gerenderte gezeichnet
   - **Ergebnis: Objekte mit NIEDRIGEREM z erscheinen VOR Objekten mit HOEHEREM z** — das ist das GEGENTEIL der beabsichtigten Sortierung!

**ACHTUNG**: Dies ist ein potentieller Kern-Bug. THREE.js sortiert transparente Objekte standardmaessig von hinten nach vorne (weit weg von Kamera zuerst). Bei einer Orthographic-Kamera bei z=50, die nach -z blickt:
- Ein Sprite bei z=0.1 ist weiter von der Kamera entfernt als ein Sprite bei z=0.2
- THREE.js rendert z=0.1 zuerst, dann z=0.2 darueber
- **Ein Sprite bei z=0.2 erscheint VOR einem bei z=0.1** — das IST das gewuenschte Verhalten

Die Sortierung ist also korrekt: hoehere z-Werte = weiter vorne = naeher am Betrachter.

4. **`propGroup` und `groundGroup` sind THREE.Group-Objekte.** THREE.js sortiert die Kinder innerhalb einer Group basierend auf ihrer Welt-z-Position. Da alle Props in derselben Group sind, werden sie korrekt nach z sortiert.

---

## 4. Texture/UV Audit

### 4.1 Outdoor_Decor_Free.png Sheet-Dimensionen

Das Sheet ist **112x192 Pixel** (7 Spalten x 12 Zeilen a 16x16 Pixel).

**Bekannte Einschraenkung (im Code dokumentiert):**
- Zeile 11 (y=176): Nur Spalten 0-3 sind gefuellt, Spalten 4-6 sind leer
- Viele Zeilen haben nur in Spalten 0-3 oder 0-2 tatsaechliche Sprites

### 4.2 addPropFromSheet-Aufrufe mit cfDecorTex (Outdoor_Decor_Free.png)

| Aufruf | srcX | srcY | srcW | srcH | Beschreibung | Korrekt? |
|--------|------|------|------|------|-------------|----------|
| **bush** (Zeile 1160) | 0 | 0 | 16 | 16 | Zeile 0, Spalte 0 | OK — Gras/Busch-Sprite |
| **flower** (Zeile 1166) | `col*16` | 176 | 16 | 16 | Zeile 11, Spalten 0-3 | OK — Blumen-Sprites |
| **cobble** (Zeile 1228) | 0 | 96 | 16 | 16 | Zeile 6, Spalte 0 | OK — Stein/Pfad |
| **crop** (Zeile 1237-1246) | 0/16/32/48 | 80 | 16 | 16 | Zeile 5, Spalten 0-3 | OK — Gemuese |
| **crop** (Zeile 1237-1246) | 0/16/32 | 64 | 16 | 16 | Zeile 4, Spalten 0-2 | OK — Kisten/Items |
| **Oma-Garden** (Zeile 2638) | same vegOffsets | 80/64 | 16 | 16 | Identisch zu crop | OK |

Alle `addPropFromSheet`-Aufrufe mit `cfDecorTex` verwenden 16x16-Regionen aus dem 112x192-Sheet. Die srcX/srcY-Koordinaten liegen alle innerhalb der bekannten gefuellten Bereiche.

### 4.3 Weitere addPropFromSheet-Aufrufe

| Aufruf | Textur | srcX | srcY | srcW | srcH | worldSize | Korrekt? |
|--------|--------|------|------|------|------|-----------|----------|
| **Oak Small** (1098) | cfOakSmallTex | 0 | 0 | 32 | 48 | 2x3 | Abhaengig von Sheet-Groesse (vermutl. 96x96 oder aehnlich) |
| **fence** (1174) | cfFenceTex | 0 | 0 | 16 | 16 | 1x1 | OK — Standard-Zaun |
| **real_fence** (1218) | cfFenceTex | 16 | 0 | 16 | 16 | 1x1 | OK — Zweite Zaun-Variante |
| **maple_tree** (1209) | mapleTex | 118 | 0 | 42 | 48 | 2.5x3 | Haengt von Sheet-Groesse ab (Farm RPG) |

### 4.4 GroundDecorationRenderer UV-Mapping

Die Ground-Deko verwendet:
```js
tex.repeat.set(16 / SHEET_W, 16 / SHEET_H); // = 16/112, 16/192
tex.offset.set(sprite.sx / SHEET_W, 1 - (sprite.sy + 16) / SHEET_H);
```

Sprite-Regionen:
- Flowers: (0,176), (16,176), (32,176), (48,176) — Zeile 11, Spalten 0-3 **OK**
- Stones: (0,64), (16,64) — Zeile 4, Spalten 0-1 **OK**
- Mushrooms: (32,128), (48,128) — Zeile 8, Spalten 2-3 **OK**

Alle UV-Mappings sind konsistent mit dem 112x192-Sheet.

---

## 5. Canvas-Mesh Audit

### 5.1 Alle document.createElement('canvas') in Game.js

| # | Zeile | Canvas-Groesse | Gezeichneter Inhalt | Mesh-Groesse (Tiles) | Typ |
|---|-------|---------------|---------------------|---------------------|-----|
| 1 | 73 | 32x48 | Palm-Tree-Sprite | 2x3 | addProp (klein) |
| 2 | 169 | 48x64 | Lighthouse-Sprite | 3x4 | addProp |
| 3 | 1103 | **128x32** | Bonfire (4-Frame Anim) | 2x2 | SpriteRenderer, scene.add direkt |
| 4 | 1179 | 16x16 | Rock/Stein | 0.8x0.8 | addProp (klein) |
| 5 | 1276 | 16x16 | Seashell | 0.6x0.6 | addProp (klein) |
| 6 | 1315 | 32x16 | Driftwood | 1.8x0.8 | addProp (klein) |
| 7 | 1350 | 16x16 | Beach Rock | 0.6-0.9 | addProp (klein) |
| 8 | 1386 | 16x16 | Starfish | 0.7x0.7 | addProp (klein) |
| 9 | 1415 | 16x16 | Beach Grass | 0.8x1.0 | addProp (klein) |
| 10 | 1444 | 32x16 | Tide Foam | 1.8x0.7 | addProp (klein) |
| 11 | 1467 | 32x32 | Sandcastle | 1.5x1.5 | addProp |
| 12 | 1502 | 32x32 | Beach Umbrella | 2x2 | addProp |
| 13 | 1535 | **32x24** | Signpost | **2x1.5** | addProp |
| 14 | 1573 | 32x32 | Coral Deco | 1.5x1.5 | addProp |
| 15 | 1613 | 16x32 | Glow Plant | 0.8x1.6 | addProp |
| 16 | 1647 | 16x16 | Crystal | 1x1.2 | addProp |
| 17 | 1662 | 16x16 | Torch | 0.8x1.0 | addProp |
| 18 | 1676 | 16x32 | Crystal Pillar | 1x2.5 | addProp |
| 19 | 1692 | 32x16 | Cloud Puff | 2x1 | addProp |
| 20 | 1715 | 16x16 | Sparkle Deco | 0.5x0.5 | addProp (klein) |
| 21 | 1741 | 48-64 x 32-40 | Rainbow Arc | 3-4 x 2-2.5 | addProp |
| 22 | 1806 | 96x24 | Station-Label | 1.5x0.4 | scene.add direkt (z=0.5) |
| 23 | 1830 | **48x48** | Station: Cooking | **3x3** | addProp |
| 24 | 1875 | **64x32** | Station: Workbench | **4x2** | addProp |
| 25 | 1917 | 32x32 | Station: Anvil | 2x2 | addProp |
| 26 | 1952 | **64x64** | Station: Sawmill | **4x4** | addProp |
| 27 | 2010 | 48x32 | Station: Alchemy | 3x2 | addProp |
| 28 | 2063 | 32x32 | Station: Default | 2x2 | addProp |

### 5.2 Die "grossen Canvas-Meshes"

Die groessten Meshes im Hub-Map:

1. **Haeuser (6x8 Tiles)** — verwendet `cfHouseTex` (House_1_Wood_Base_Blue.png, 96x128px), NICHT ein Canvas. **Dies ist das groesste einzelne Mesh.**

2. **Oak Trees (4x5 Tiles)** — verwendet `cfOakTex` (Oak_Tree.png, 64x80px), NICHT ein Canvas.

3. **Sawmill Station (4x4 Tiles)** — Canvas 64x64px.

4. **Workbench Station (4x2 Tiles)** — Canvas 64x32px.

Die "4 riesigen Canvas-Meshes" aus vorherigen Sessions sind wahrscheinlich die **4 Haeuser** (keine Canvas, sondern geladene Texturen) die je 6x8 Tiles gross sind = 6 Tiles breit, 8 Tiles hoch. Das sind die mit Abstand groessten Props in der Szene.

### 5.3 Station-Label-Meshes

Jede Station erzeugt zusaetzlich ein **Label-Mesh** (96x24 Canvas, 1.5x0.4 Tiles) bei z=0.5. Diese sind fest auf z=0.5 positioniert und werden immer ueber allem ausser Damage Numbers gerendert.

---

## 6. Konkrete Issue-Liste

### Issue 1: Baumkronen-Clipping bei Haeusern [MITTEL]
**Datei:** `src/core/Game.js:1095, 1203` + `src/rendering/TileMapRenderer.js:120-128`
**Problem:** Oak-Trees (4x5) und Haeuser (6x8) werden als Einzelquads gerendert. Wenn ein Baum neben einem Haus steht und seine Krone das Hausdach ueberlappt, wird die gesamte Baumkrone hinter dem Haus gerendert (weil der Baum-Fuss oberhalb des Haus-Fusses liegt).
**Betroffene Props im Hub:** Baum (26,6) neben Haus NE (27,6), Baum (36,5) neben Haus E (32,10)
**Fix-Vorschlag:** Grosse Props (Baeume, Haeuser) in 2 Teile splitten: Unterkörper (Stamm/Wand) und Oberkörper (Krone/Dach). Die Baumkrone erhaelt einen separaten z-Wert basierend auf ihrer eigenen y-Position statt des Baum-Fusses.

### Issue 2: Haus-Offset erzeugt riesige Sprite-Bounds [NIEDRIG]
**Datei:** `src/core/Game.js:1203`
**Problem:** `addProp(cfHouseTex, prop.x, prop.y - 4, 6, 8, 0.1)` verschiebt das Haus 4 Tiles nach oben. Das Sprite-Zentrum liegt bei `y = (prop.y - 4) + 4 = prop.y`, das Dach ragt bis `prop.y - 4` hinaus. Bei Haeusern am oberen Kartenrand (y=6) bedeutet das: Dach bei y=2 (Karte beginnt bei y=0). Das Haus-Dach ueberlappt mit dem Kamerarand und den Border-Baeumen.
**Fix-Vorschlag:** Sicherstellen, dass Haeuser mindestens 5 Tiles vom Kartenrand platziert werden, oder die Kamera-Margin erhoehen.

### Issue 3: Prop-Shadow z-Wert kann mit Ground-Deco kollidieren [NIEDRIG]
**Datei:** `src/rendering/TileMapRenderer.js:101`
**Problem:** Prop-Shadows bei `z = 0.05 + (y+heightTiles) * 0.001`. Fuer kleine y-Werte kann das mit Ground-Deco (`z = 0.04 + y * 0.0001`) kollidieren, aber da Shadows `depthWrite: false` haben und dunkel/transparent sind, ist das visuell kaum sichtbar.
**Fix-Vorschlag:** Keiner noetig — rein kosmetisches Micro-Issue.

### Issue 4: Entity-Schatten z relativ zu Entity-z [NIEDRIG]
**Datei:** `src/entities/Entity.js:79`
**Problem:** Schatten bei `z = (0.2 + y*0.001) - 0.05 = 0.15 + y*0.001`. Das ist UNTER dem Entity (korrekt), aber ueberschneidet sich mit Signpost-z (`0.15 + (y+0.5)*0.001`). Bei gleicher y-Position kann ein Entity-Schatten denselben z-Wert wie ein Signpost haben.
**Fix-Vorschlag:** Schatten-z auf `z - 0.1` anpassen statt `z - 0.05`.

### Issue 5: Bonfire und Chicken als scene.add() statt propGroup [INFO]
**Datei:** `src/core/Game.js:1151, 1264`
**Problem:** Animierte Sprites (Bonfire, Chicken) werden direkt zur `scene` hinzugefuegt, nicht zur `propGroup`. Das bedeutet sie werden separat sortiert. Da sie aber die gleiche z-Formel verwenden (y-basiert) und `depthWrite: false` haben, funktioniert die Sortierung trotzdem korrekt.
**Fix-Vorschlag:** Keiner noetig — funktional korrekt.

### Issue 6: Station-Labels bei festem z=0.5 [INFO]
**Datei:** `src/core/Game.js:1818`
**Problem:** Station-Labels haben `z = 0.5`, werden also immer ueber Props gerendert. Da Labels text-basiert und informativ sind, ist das gewollt. Aber wenn der Spieler hinter einer Station steht, ist das Label trotzdem sichtbar (kein Occlusion).
**Fix-Vorschlag:** Keiner noetig — Design-Entscheidung.

### Issue 7: addPropFromSheet() hartcodierter zOffset = 0.1 [INFO]
**Datei:** `src/rendering/TileMapRenderer.js:160`
**Problem:** `addPropFromSheet()` hat keinen `zOffset`-Parameter, der Wert ist fest auf 0.1. Das ist konsistent mit den meisten `addProp()`-Aufrufen. Bushes, Flowers, Fences, etc. sind alle bei z=0.1+(foot*0.001). Fuer 1x1-Tile-Props ist das unproblematisch, da keine Ueberlappung mit grossen Props stattfindet.
**Fix-Vorschlag:** Optional: zOffset-Parameter zu `addPropFromSheet()` hinzufuegen fuer Spezialfaelle.

### Issue 8: Kamera-Clip mit Baumkronen am Kartenrand [NIEDRIG]
**Datei:** `src/rendering/Camera.js:37-43`
**Problem:** Die Kamera hat eine Margin von 2 Tiles fuer Baumkronen. Baeume (4x5 Tiles) haben ihren Kopf 3.5 Tiles ueber dem Stamm. Am oberen Kartenrand (y=2) ragt die Krone bis y=-1.5, also 1.5 Tiles ausserhalb der Karte. Die 2-Tile-Margin reicht nicht immer.
**Fix-Vorschlag:** Camera margin auf 3 erhoehen, oder Baeume mindestens bei y=4 platzieren.

### Issue 9: Hub-Map Haeuser ragen ueber den Kartenrand [NIEDRIG]
**Datei:** `src/world/maps/hub.js:208-211`
**Problem:** Haus bei (5, 6) wird gerendert als Sprite von y=2 bis y=10 (da addProp y-4, h=8). Das Dach bei y=2 liegt auf der Grenze der Border-Collision-Zone. Visuell ist das Dach am aeussersten Kartenrand.
**Fix-Vorschlag:** Haeuser 1-2 Tiles weiter nach innen setzen oder die Border-Zone entsprechend anpassen.

### Issue 10: THREE.js Default-Sortierung und depthTest [KERN-ANALYSE]
**Problem:** THREE.js sortiert transparente Objekte standardmaessig nach `Object3D.renderOrder` (gleich fuer alle) und dann nach Kamera-Distanz (Back-to-Front). Da alle Props depthWrite=false haben, wird die Reihenfolge ausschliesslich durch die z-Position bestimmt. THREE.js rendert zuerst die am weitesten von der Kamera entfernten Objekte (niedrigstes z), dann die naeheren (hoeheres z).

**Bestaetigung:** Die z-Sortierung funktioniert korrekt. Props mit hoeherer y-Position (weiter unten im Bild = naeher am Betrachter) haben hoehere z-Werte und werden zuletzt gerendert, also VOR allem anderen angezeigt. Das ist das gewuenschte Verhalten fuer ein top-down Spiel.

**Das eigentliche Clipping-Problem** ist nicht die z-Sortierung, sondern die **Granularitaet**: Jedes grosse Sprite (Baum 4x5, Haus 6x8) ist ein einzelnes unteilbares Quad. Es gibt keine Moeglichkeit, den oberen Teil eines Baumes vor einem Haus zu rendern und den unteren Teil dahinter.

---

## Zusammenfassung

### Was funktioniert korrekt:
- z-Sortierung basierend auf Fuss-Y-Position (foot-based sorting)
- depthWrite=false fuer alle transparenten Sprites
- Ground < GroundDeco < Props < Entities < Labels < UI — klare Schicht-Trennung
- UV-Mapping der Outdoor_Decor_Free.png ist korrekt
- Kamera-Setup und Clip-Planes sind angemessen

### Kern-Problem:
**Grosse Sprites (Baeume 4x5, Haeuser 6x8) werden als einzelne unteilbare Quads gerendert.** Wenn sich zwei grosse Sprites ueberlappen, wird das gesamte hintere Sprite vom gesamten vorderen Sprite verdeckt — auch wenn nur der untere Teil verdeckt sein sollte und der obere Teil (Krone) eigentlich sichtbar sein muesste.

### Empfohlene Loesung:
1. **Sprite-Splitting fuer grosse Props:** Baeume und Haeuser in 2-3 vertikale Streifen aufteilen (Basis, Mitte, Krone/Dach). Jeder Streifen erhaelt seinen eigenen z-Wert basierend auf seiner eigenen y-Position.
2. **Alternative: Alpha-Test statt Transparenz-Sortierung:** Wenn `depthWrite: true` und `depthTest: true` mit `alphaTest: 0.5` verwendet wird, loest WebGL die Ueberlappung per-Pixel korrekt. Allerdings funktioniert das schlecht mit Semi-Transparenz.
3. **Alternative: renderOrder manuell setzen:** Pro-Prop `renderOrder` basierend auf der y-Position der Fuss-Linie setzen, und innerhalb des gleichen renderOrder die Krone auf einen hoeheren renderOrder setzen.
