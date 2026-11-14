import Phaser from 'phaser';
import { HUB_START, MAP_IDS } from '../data/maps';
import {
  FIGURE_FILES, FIGURE_SHADOW_FILE, FIGURE_SHADOW_KEY, MAP_FILES, PROP_ATLAS, PROP_TEXTURE, TILESET_FILES,
  figureKey, mapKey, tilesetKey,
} from '../maps/registry';
import { FIGURE_FRAME } from '../data/sprites';
import { registerPropFrames } from './world/buildProps';

/** Lädt Kachelsätze, Objekt-Atlas, Figurenblätter und alle Karten aus MAP_FILES; startet dann die Welt. */
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
    for (const id of MAP_IDS) {
      const url = MAP_FILES[id];
      if (url) this.load.tilemapTiledJSON(mapKey(id), url);
    }
  }

  create(): void {
    registerPropFrames(this.textures);
    this.scene.start('WorldScene', { map: HUB_START.map });
  }
}
