import Phaser from 'phaser';
import { isMapId, type MapId } from '../data/maps';
import { servicesOf, type Services } from '../core/services';
import { installTestHooks } from '../core/testHooks';
import { InputController } from '../entities/controller';
import { Player } from '../entities/Player';
import { buildWorldMap, resolveStart, type WorldMap } from '../maps/model';
import { mapKey } from '../maps/registry';
import type { TiledMap } from '../maps/tiled';
import { cameraScroll, stepCamera, type CameraState } from '../systems/camera';
import { buildLayers } from './world/buildLayers';
import { buildProps } from './world/buildProps';

export interface WorldSceneData {
  map: MapId;
  /** Fußpunkt aus dem Spielstand in Kacheln; fehlt er, beginnt die Spielerin am Startpunkt der Karte. */
  player?: { map: MapId; x: number; y: number };
}

/*
 * Kamera (Phaser 4, nachgelesen in node_modules/phaser 4.2.1: src/cameras/2d/Camera.js preRender,
 * BaseCamera.js): Der Zoom wirkt um die Mitte des Ausschnitts (origin 0,5). worldView, nach dem Phaser auch die
 * Kachel-Ebenen zuschneidet, rechnet immer mit der Mitte; ein anderer origin verschöbe nur das Bild, nicht
 * worldView (dann fehlt der Boden). Darum: centerOn(Ecke + halbes Feld) – die linke obere Ecke des sichtbaren
 * Felds liegt dann genau auf der ganzzahligen Ecke aus cameraScroll, auch wenn scrollX selbst ein halber Wert
 * ist. PixelGrid.applyTo setzt Ausschnitt und Zoom, nicht scroll.
 */

/** Allgemeine Welt-Szene: zeichnet jede Karte aus ihren Daten, Emilia läuft darin, die Kamera folgt. */
export class WorldScene extends Phaser.Scene {
  private services!: Services;
  private world!: WorldMap;
  private player!: Player;
  private cam: CameraState = { x: 0, y: 0 };

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
    this.world = world;
    this.services = servicesOf(this);

    buildLayers(this, key, tiled, id);
    const objects = buildProps(this, world.objects, tiled.tileheight, id);

    // Figuren nach den Objekten anlegen: bei gleicher Standlinie stehen sie davor (depth.ts)
    const start = data.player ? resolveStart(world, data.player) : { ...world.spawn };
    this.player = new Player(this, world.solid, start.x, start.y, new InputController(this.services.input));

    const { pixelGrid } = this.services;
    const camera = this.cameras.main;
    this.cam = { x: start.x, y: start.y };
    const aim = (): void => {
      pixelGrid.applyTo(camera);
      this.moveCamera(0);
      this.draw();
    };
    aim();
    const unsubscribe = pixelGrid.onChange(aim);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribe();
      this.player.destroy();
    });

    installTestHooks({ world: { map: id, objects: objects.size, npcs: world.npcs.length }, ready: true });
    // Bedingung steht hier, damit der Build die Test-Zweige samt Funktionen entfernt (wie in main.ts)
    if (import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1') {
      installTestHooks({
        player: () => {
          const m = this.player.state;
          return { x: m.x, y: m.y, facing: m.facing, moving: m.moving };
        },
        teleport: (tileX: number, tileY: number) => {
          this.player.placeAt((tileX + 0.5) * tiled.tilewidth, (tileY + 0.5) * tiled.tileheight);
          this.cam = { x: this.player.state.x, y: this.player.state.y };
          this.moveCamera(0);
          this.draw();
        },
        // Linke obere Ecke des zuletzt gezeichneten Felds, wie Phaser sie rechnet
        camera: () => ({ scrollX: camera.worldView.x, scrollY: camera.worldView.y }),
        depths: () => ({
          player: this.player.depth,
          objects: Object.fromEntries([...objects].map(([objectId, sprite]) => [objectId, sprite.depth])),
        }),
      });
    }
  }

  /**
   * Einzige Stelle mit der Reihenfolge je Bild:
   * 1. Eingabe sammeln (input.frame)
   * 2. Abnehmer der Oberfläche (Plan 1b) nehmen ihre Drücke ab
   * 3. Spielerin rechnen
   * 4. Kamera rechnen
   * 5. Tiefe und Zeichenposition setzen – erst hier wird auf ganze Bildpunkte gerundet, Figur und Kamera aus
   *    denselben Gleitkommawerten dieses Bildes.
   */
  override update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.services.input.frame(dt);
    this.player.update(dt);
    this.moveCamera(dt);
    this.draw();
  }

  private moveCamera(dt: number): void {
    const { viewWidth, viewHeight } = this.services.pixelGrid.snapshot.layout;
    const m = this.player.state;
    this.cam = stepCamera(this.cam, m, dt, { width: viewWidth, height: viewHeight }, { width: this.world.widthPx, height: this.world.heightPx });
  }

  private draw(): void {
    const { viewWidth, viewHeight } = this.services.pixelGrid.snapshot.layout;
    const m = this.player.state;
    this.player.draw();
    const { scrollX, scrollY } = cameraScroll(this.cam, { width: viewWidth, height: viewHeight }, m);
    this.cameras.main.centerOn(scrollX + viewWidth / 2, scrollY + viewHeight / 2);
  }
}
