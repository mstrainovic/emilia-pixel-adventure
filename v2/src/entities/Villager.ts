import type Phaser from 'phaser';
import type { Facing } from '../data/types';
import { Actor, type ActorPose } from './Actor';
import { IdleController, type Controller } from './controller';

/** Ort eines Dorfbewohners: Fußpunkt in Bildpunkten (Kachelmitte aus der Ebene `npcs`) und Blickrichtung. */
export interface VillagerPlace {
  npcId: string;
  x: number;
  y: number;
  facing: Facing;
}

/**
 * Ein Dorfbewohner an seinem Platz, gezeichnet mit seinem eigenen Figurenblatt (Figur = `npcId`). Er steht still
 * (IdleController); Gespräche und das Umdrehen zur Spielerin kommen in Plan 1b. Dass niemand durch ihn hindurchläuft,
 * regelt die Karte: seine Kachel ist fest (buildWorldMap).
 */
export class Villager {
  readonly npcId: string;
  readonly controller: Controller = new IdleController();
  private readonly actor: Actor;

  constructor(scene: Phaser.Scene, place: VillagerPlace) {
    this.npcId = place.npcId;
    this.actor = new Actor(scene, place.npcId, place.x, place.y, place.facing);
  }

  /** Was gerade gezeichnet ist (für den Test-Zugang). */
  get pose(): ActorPose {
    return this.actor.pose;
  }

  destroy(): void {
    this.actor.destroy();
  }
}
