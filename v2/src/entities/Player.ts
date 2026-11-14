import type Phaser from 'phaser';
import { IDLE_ROW } from '../data/sprites';
import type { SolidGrid } from '../systems/collision';
import { stepMover, walkFrameRow, type Mover } from '../systems/movement';
import { Actor, type ActorPose } from './Actor';
import type { Controller } from './controller';

/** Die Spielerin: Bewegung (Mover) aus einer Steuerquelle, gezeichnet als Emilia. */
export class Player {
  private mover: Mover;
  private running = false;
  private readonly actor: Actor;

  constructor(
    scene: Phaser.Scene,
    private readonly grid: SolidGrid,
    x: number,
    y: number,
    private readonly controller: Controller,
  ) {
    this.mover = { x, y, vx: 0, vy: 0, facing: 'down', moving: false, walkTime: 0 };
    this.actor = new Actor(scene, 'emilia', x, y, 'down');
  }

  /** Rechnet einen Zeitschritt (Gleitkomma); gezeichnet wird erst mit `draw`. */
  update(dt: number): void {
    const intent = this.controller.intent();
    this.running = intent.run;
    this.mover = stepMover(this.mover, intent, dt, this.grid);
  }

  /** Setzt Bild, Zeichenposition und Tiefe aus dem aktuellen Stand; `zoom` ist der Zoom des Pixelrasters. */
  draw(zoom: number): void {
    const m = this.mover;
    const row = m.moving ? walkFrameRow(m.walkTime, this.running) : IDLE_ROW;
    this.actor.setPose(m.x, m.y, m.facing, row, zoom);
  }

  /** Stellt die Figur an einen Fußpunkt (Bildpunkte), stehend, Blickrichtung bleibt. */
  placeAt(x: number, y: number): void {
    this.mover = { ...this.mover, x, y, vx: 0, vy: 0, moving: false, walkTime: 0 };
  }

  get state(): Readonly<Mover> {
    return this.mover;
  }

  /** Gezeichneter Stand (eingerastet auf Bildschirmpixel). */
  get pose(): ActorPose {
    return this.actor.pose;
  }

  get depth(): number {
    return this.actor.depth;
  }

  destroy(): void {
    this.actor.destroy();
  }
}
