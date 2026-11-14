import type Phaser from 'phaser';
import { FIGURES, IDLE_ROW, figureFrame } from '../data/sprites';
import type { Facing } from '../data/types';
import { FIGURE_SHADOW_KEY, figureKey } from '../maps/registry';
import { DEPTH, depthForFoot } from '../systems/depth';

/*
 * Bild einer Figur (Phaser 4, nachgelesen in node_modules/phaser 4.2.1: src/gameobjects/components/Texture.js,
 * Origin.js): scene.add.sprite(x, y, key, frame); setOrigin(0.5, 1) setzt den Anker unten mittig, setFrame()
 * rechnet ihn bei gleich großen Bildern (16×16) gleich neu. Bei 16 bzw. 12 Bildpunkten Breite liegt der Anker
 * auf einem ganzen Bildpunkt, damit sitzt das Bild bei ganzzahligem Fußpunkt pixelgenau.
 */

/**
 * Eine stehende Figur: Bild unten mittig am Fußpunkt, darunter der Schatten auf DEPTH.flat. Tiefe und Bildunterkante
 * sind beide der (gerundete) Fußpunkt, siehe depth.ts. Gerechnet wird außerhalb mit Gleitkomma; hier wird beim
 * Zeichnen auf ganze Bildpunkte gerundet.
 */
export class Actor {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly shadow: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, figureId: string, x: number, y: number, facing: Facing) {
    if (!FIGURES[figureId]) throw new Error(`Unbekannte Figur ${figureId}`);
    this.shadow = scene.add.image(0, 0, FIGURE_SHADOW_KEY).setOrigin(0.5, 1).setDepth(DEPTH.flat);
    this.sprite = scene.add.sprite(0, 0, figureKey(figureId), figureFrame(facing, IDLE_ROW)).setOrigin(0.5, 1);
    this.setPose(x, y, facing, IDLE_ROW);
  }

  /** Fußpunkt in Bildpunkten (Gleitkomma), Blickrichtung und Zeile im Figurenblatt. */
  setPose(x: number, y: number, facing: Facing, row: number): void {
    const footX = Math.round(x);
    const footY = Math.round(y);
    this.sprite.setFrame(figureFrame(facing, row));
    this.sprite.setPosition(footX, footY).setDepth(depthForFoot(footY));
    this.shadow.setPosition(footX, footY);
  }

  get depth(): number {
    return this.sprite.depth;
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
