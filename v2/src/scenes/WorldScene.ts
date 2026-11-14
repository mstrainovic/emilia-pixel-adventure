import Phaser from 'phaser';
import { isMapId, type MapId } from '../data/maps';
import { servicesOf } from '../core/services';
import { installTestHooks } from '../core/testHooks';
import type { PixelLayout } from '../core/pixel';
import { buildWorldMap } from '../maps/model';
import { mapKey } from '../maps/registry';
import type { TiledMap } from '../maps/tiled';
import { buildLayers } from './world/buildLayers';
import { buildProps } from './world/buildProps';

export interface WorldSceneData {
  map: MapId;
}

/**
 * Ganzzahlige linke obere Ecke des sichtbaren Felds, damit `point` möglichst mittig liegt, ohne über den
 * Kartenrand zu schauen. Ist die Karte kleiner als das Feld, liegt sie mittig.
 */
function viewOrigin(point: number, view: number, world: number): number {
  if (world <= view) return Math.floor((world - view) / 2);
  return Math.min(Math.max(Math.round(point - view / 2), 0), world - view);
}

/** Allgemeine Welt-Szene: zeichnet jede Karte aus ihren Daten. */
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  create(data: WorldSceneData): void {
    const id = data.map;
    if (!isMapId(id)) throw new Error(`Welt-Szene: unbekannte Karte ${String(id)}`);
    const key = mapKey(id);
    const cached = this.cache.tilemap.get(key) as { data: TiledMap } | undefined;
    if (!cached) throw new Error(`Karte ${id} ist nicht geladen`);
    const tiled = cached.data;
    const world = buildWorldMap(id, tiled);

    buildLayers(this, key, tiled, id);
    const objects = buildProps(this, world.objects, tiled.tileheight, id);

    const { pixelGrid } = servicesOf(this);
    const camera = this.cameras.main;
    const aim = (layout: PixelLayout): void => {
      pixelGrid.applyTo(camera);
      // Zoom wirkt um die Mitte des Ausschnitts: centerOn auf die Mitte des gewünschten Felds
      const left = viewOrigin(world.spawn.x, layout.viewWidth, world.widthPx);
      const top = viewOrigin(world.spawn.y, layout.viewHeight, world.heightPx);
      camera.centerOn(left + layout.viewWidth / 2, top + layout.viewHeight / 2);
    };
    aim(pixelGrid.snapshot.layout);
    const unsubscribe = pixelGrid.onChange((snapshot) => aim(snapshot.layout));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);

    installTestHooks({ world: { map: id, objects, npcs: world.npcs.length }, ready: true });
  }
}
