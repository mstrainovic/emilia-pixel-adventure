import Phaser from 'phaser';
import { HUB_START, MAP_IDS } from '../data/maps';
import {
  FIGURE_FILES, FIGURE_SHADOW_FILE, FIGURE_SHADOW_KEY, MAP_FILES, MARKER_FILES, PROP_ATLAS, PROP_TEXTURE, TILESET_FILES,
  figureKey, mapKey, markerKey, tilesetKey,
} from '../maps/registry';
import { FIGURE_FRAME } from '../data/sprites';
import { servicesOf } from '../core/services';
import type { WorldSceneData } from './WorldScene';
import { registerPropFrames } from './world/buildProps';

/**
 * Lädt Kachelsätze, Objekt-Atlas, Figurenblätter und alle Karten aus MAP_FILES; startet dann die Welt auf der Karte
 * aus dem Spielstand. Gibt es diese Karte noch nicht (übernommener Stand aus Wald, See …), beginnt die Spielerin im
 * Dorf an dessen Startpunkt (resolveStart verwirft den Ort einer anderen Karte).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    for (const [name, url] of Object.entries(TILESET_FILES)) this.load.image(tilesetKey(name), url);
    this.load.image(PROP_TEXTURE, PROP_ATLAS.url);
    for (const [id, url] of Object.entries(FIGURE_FILES)) {
      this.load.spritesheet(figureKey(id), url, { frameWidth: FIGURE_FRAME.width, frameHeight: FIGURE_FRAME.height });
    }
    this.load.image(FIGURE_SHADOW_KEY, FIGURE_SHADOW_FILE);
    this.load.image(markerKey('key'), MARKER_FILES.key);
    this.load.image(markerKey('quest'), MARKER_FILES.quest);
    for (const id of MAP_IDS) {
      const url = MAP_FILES[id];
      if (url) this.load.tilemapTiledJSON(mapKey(id), url);
    }
  }

  create(): void {
    registerPropFrames(this.textures);
    const { player } = servicesOf(this).state;
    const map = MAP_FILES[player.map] !== undefined ? player.map : HUB_START.map;
    const data: WorldSceneData = { map, player: { map: player.map, x: player.x, y: player.y } };
    this.scene.start('WorldScene', data);
  }
}
