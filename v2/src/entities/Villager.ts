import type Phaser from 'phaser';
import { FIGURES, IDLE_ROW } from '../data/sprites';
import type { Facing } from '../data/types';
import { markerKey } from '../maps/registry';
import { DEPTH } from '../systems/depth';
import { Actor, type ActorPose } from './Actor';
import { IdleController, type Controller } from './controller';

/** Ort eines Dorfbewohners: Fußpunkt in Bildpunkten (Kachelmitte aus der Ebene `npcs`) und Blickrichtung. */
export interface VillagerPlace {
  npcId: string;
  x: number;
  y: number;
  facing: Facing;
}

/** Ein Bild über dem Kopf: sichtbar oder nicht, linke obere Ecke in Bildpunkten. */
export interface MarkerView {
  visible: boolean;
  x: number;
  y: number;
}

/** Bildpunkte Luft zwischen Kopf und Bild bzw. zwischen zwei Bildern. */
const MARKER_GAP = 1;

/*
 * Bilder über dem Kopf (Phaser 4, nachgelesen in node_modules/phaser 4.2.1: src/gameobjects/image/Image.js mit den
 * Komponenten Origin, Size, Visible, Depth): scene.add.image(x, y, key), setOrigin(0, 0) – die Lage ist dann die
 * linke obere Ecke; width ist die Breite des Bildes. Ecke auf ganzen Bildpunkten wie die stehende Figur.
 */

/**
 * Ein Dorfbewohner an seinem Platz, gezeichnet mit seinem eigenen Figurenblatt (Figur = `npcId`). Er steht still
 * (IdleController), dreht sich im Gespräch zur Spielerin und danach zurück (Spec 8.3). Über seinem Kopf können das
 * Hinweis-Symbol seiner Aufgabe und darüber das Tasten-Bild „E" schweben, über allen Figuren (DEPTH.top).
 * Dass niemand durch ihn hindurchläuft, regelt die Karte: seine Kachel ist fest (buildWorldMap).
 */
export class Villager {
  readonly npcId: string;
  readonly controller: Controller = new IdleController();
  /** Fußpunkt in Bildpunkten (ganzzahlig: Kachelmitte). */
  readonly x: number;
  readonly y: number;
  private readonly home: Facing;
  private current: Facing;
  private readonly actor: Actor;
  private readonly questHint: Phaser.GameObjects.Image;
  private readonly keyHint: Phaser.GameObjects.Image;
  private markers = { quest: false, key: false };

  constructor(scene: Phaser.Scene, place: VillagerPlace) {
    this.npcId = place.npcId;
    this.x = place.x;
    this.y = place.y;
    this.home = place.facing;
    this.current = place.facing;
    this.actor = new Actor(scene, place.npcId, place.x, place.y, place.facing);
    const marker = (key: string): Phaser.GameObjects.Image =>
      scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(DEPTH.top).setVisible(false);
    this.questHint = marker(markerKey('quest'));
    this.keyHint = marker(markerKey('key'));
  }

  /** Blickt in die Richtung; `null` dreht ihn zurück in seine eigene (aus der Karte). */
  face(facing: Facing | null): void {
    this.current = facing ?? this.home;
    this.actor.setPose(this.x, this.y, this.current, IDLE_ROW);
  }

  get facing(): Facing {
    return this.current;
  }

  /** Hinweis-Symbol (Aufgabe führt zu ihm) und Tasten-Bild (ansprechbar, Tastatur) zeigen oder verbergen. */
  setMarkers(quest: boolean, key: boolean): void {
    if (quest === this.markers.quest && key === this.markers.key) return;
    this.markers = { quest, key };
    // Unterkante des nächsten Bildes: eine Bildpunktreihe über dem Kopf
    let bottom = this.y - (FIGURES[this.npcId]?.height ?? 16) - MARKER_GAP;
    const place = (image: Phaser.GameObjects.Image, visible: boolean): void => {
      image.setVisible(visible);
      if (!visible) return;
      image.setPosition(this.x - Math.floor(image.width / 2), bottom - image.height);
      bottom -= image.height + MARKER_GAP;
    };
    place(this.questHint, quest);
    place(this.keyHint, key);
  }

  /** Was über dem Kopf gezeichnet ist (für den Test-Zugang). */
  get markerViews(): { quest: MarkerView; key: MarkerView } {
    const view = (image: Phaser.GameObjects.Image): MarkerView => ({ visible: image.visible, x: image.x, y: image.y });
    return { quest: view(this.questHint), key: view(this.keyHint) };
  }

  /** Was gerade gezeichnet ist (für den Test-Zugang). */
  get pose(): ActorPose {
    return this.actor.pose;
  }

  destroy(): void {
    this.actor.destroy();
    this.questHint.destroy();
    this.keyHint.destroy();
  }
}
