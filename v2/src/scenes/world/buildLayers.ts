/*
 * Boden-Ebenen einer Karte aus Tiled-JSON.
 *
 * Phaser 4 (nachgelesen in node_modules/phaser 4.2.1: types/phaser.d.ts, src/tilemaps, src/loader, src/textures,
 * src/animations, skills/tilemaps, skills/animations):
 * - Laden: this.load.tilemapTiledJSON(key, url) legt { format: TILED_JSON, data } in this.cache.tilemap;
 *   this.load.image(key, url); this.load.spritesheet(key, url, { frameWidth, frameHeight }).
 *   Bilder als data:-Adresse lädt Phaser über ein Image-Element (File#base64), sonst XHR → blob:-Adresse.
 * - Tilemap: this.make.tilemap({ key }) / this.add.tilemap(key) → Tilemap (nur Daten, nicht sichtbar).
 * - Kachelsatz-Bild zuordnen: map.addTilesetImage(tilesetName, textureKey) → Tileset | null; der Name muss
 *   dem Kachelsatz in der Karte entsprechen, der Bildpfad im JSON wird nicht benutzt.
 * - Ebene: map.createLayer(layerName, tilesets, x, y, gpu?) → TilemapLayer (gpu=false) oder TilemapGPULayer;
 *   bei unbekanntem Namen null mit Warnung. TilemapLayer hat die Komponente Depth: layer.setDepth(n).
 * - Atlas ohne Phaser-Format: textures.get(key).add(frameName, sourceIndex, x, y, w, h) → Frame; has(name).
 * - Tiefe: gameObject.setDepth(n); die Anzeigeliste sortiert stabil (StableSort) nach depth, gleiche Tiefe
 *   behält die Reihenfolge des Hinzufügens.
 * - Bildanker: setOrigin(fx, fy) (Anteil) bzw. setDisplayOrigin(px, py); setFrame() rechnet den Anker aus
 *   originX × Breite neu, darum werden Objektbilder mit Ursprung 0/0 an ganzzahliger linker oberer Ecke gesetzt.
 * - Animation aus Einzelbildern: this.anims.create({ key, frames: [{ key: texture, frame: name }, …],
 *   frameRate, repeat: -1 }); this.anims.exists(key); sprite.play(key). Animationen gelten spielweit.
 * - Kamera: setViewport, setZoom, centerOn(x, y) (Zoom wirkt um die Mitte des Ausschnitts).
 */
import type Phaser from 'phaser';
import { tilesetKey } from '../../maps/registry';
import type { TiledMap } from '../../maps/tiled';
import { DEPTH } from '../../systems/depth';

/** Kachel-Ebenen, die gezeichnet werden, mit ihrer Tiefe. */
const GROUND_LAYERS = [
  { name: 'ground', depth: DEPTH.ground },
  { name: 'ground_detail', depth: DEPTH.groundDetail },
] as const;

/** Legt Boden und Bodendetail der Karte `key` an. Wirft mit deutscher Meldung, wenn etwas fehlt. */
export function buildLayers(scene: Phaser.Scene, key: string, tiled: TiledMap, label: string): Phaser.Tilemaps.Tilemap {
  const map = scene.make.tilemap({ key });
  const tilesets = tiled.tilesets.map((t) => {
    const textureKey = tilesetKey(t.name);
    if (!scene.textures.exists(textureKey)) throw new Error(`Karte ${label}: Bild für Kachelsatz „${t.name}" fehlt`);
    const tileset = map.addTilesetImage(t.name, textureKey);
    if (!tileset) throw new Error(`Karte ${label}: Kachelsatz „${t.name}" ließ sich nicht anlegen`);
    return tileset;
  });
  for (const { name, depth } of GROUND_LAYERS) {
    if (!tiled.layers.some((l) => l.name === name && l.type === 'tilelayer')) throw new Error(`Karte ${label}: Ebene „${name}" fehlt`);
    const layer = map.createLayer(name, tilesets, 0, 0);
    if (!layer) throw new Error(`Karte ${label}: Ebene „${name}" ließ sich nicht anlegen`);
    layer.setDepth(depth);
  }
  return map;
}
