import Phaser from 'phaser';
import { isMapId, type MapId } from '../data/maps';
import { servicesOf, type Services } from '../core/services';
import { installTestHooks } from '../core/testHooks';
import { InputController } from '../entities/controller';
import { Player } from '../entities/Player';
import { Villager } from '../entities/Villager';
import { buildWorldMap, resolveStart, type WorldMap } from '../maps/model';
import { mapKey } from '../maps/registry';
import type { TiledMap } from '../maps/tiled';
import { cameraScroll, stepCamera, type CameraState } from '../systems/camera';
import { TALK_COOLDOWN } from '../systems/dialogue';
import { exitAt, facingToward, findContext, sameContext, type ContextTarget } from '../systems/interaction';
import { currentQuest } from '../systems/quests';
import type { WorldExit } from '../maps/model';
import { NPCS } from '../data/npcs';
import { TEXTS } from '../data/texts';
import { DIALOGUE_REASON } from '../ui/dialogueBox';
import { faceUrl } from '../ui/images';
import { handleMenuKeys } from '../ui/menu';
import { buildLayers } from './world/buildLayers';
import { buildProps } from './world/buildProps';

/** Figuren mit Eintrag in den Daten; nur sie sind ansprechbar (Review Focus 5). */
const KNOWN_NPC_IDS: ReadonlySet<string> = new Set(NPCS.map((n) => n.id));

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
 * Felds liegt dann genau auf der Ecke aus cameraScroll (ganze Bildschirmpixel), auch wenn scrollX selbst ein
 * halber Wert ist. PixelGrid.applyTo setzt Ausschnitt und Zoom, nicht scroll.
 */

/** Allgemeine Welt-Szene: zeichnet jede Karte aus ihren Daten, Emilia läuft darin, die Kamera folgt. */
export class WorldScene extends Phaser.Scene {
  private services!: Services;
  private world!: WorldMap;
  private player!: Player;
  private villagers: Villager[] = [];
  private tileSize = { width: 16, height: 16 };
  private cam: CameraState = { x: 0, y: 0 };
  /** Was gerade ansprechbar ist (zuletzt gemeldet über `context:changed`). */
  private context: ContextTarget | null = null;
  /** Mit wem gerade geredet wird; dreht sich nach dem Gespräch zurück. */
  private talkingTo: Villager | null = null;
  /** Sperre nach einem Gespräch in Sekunden Spielzeit (TALK_COOLDOWN). */
  private talkCooldown = 0;
  /** Gespräche seit dem Start der Szene (Test-Zugang). */
  private talks = 0;
  /** Ausgang, in dem Emilia im letzten Bild stand (Hinweis einmal je Betreten). */
  private inExit: WorldExit | null = null;

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
    this.tileSize = { width: tiled.tilewidth, height: tiled.tileheight };

    buildLayers(this, key, tiled, id);
    const objects = buildProps(this, world.objects, tiled.tileheight, id);

    // Figuren nach den Objekten anlegen: bei gleicher Standlinie stehen sie davor (depth.ts)
    const start = data.player ? resolveStart(world, data.player) : { ...world.spawn };
    this.player = new Player(this, world.solid, start.x, start.y, new InputController(this.services.input));
    this.villagers = world.npcs.map((npc) => new Villager(this, npc));
    this.context = null;
    this.talkingTo = null;
    this.talkCooldown = 0;
    this.inExit = null;
    const { state } = this.services;
    if (!state.visitedMaps.includes(id)) state.visitedMaps.push(id);
    this.recordPlayer();

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
      this.services.dialogue.hide();
      this.player.destroy();
      for (const v of this.villagers) v.destroy();
      this.villagers = [];
    });

    installTestHooks({ world: { map: id, objects: objects.size, npcs: world.npcs.length }, ready: true });
    // Bedingung steht hier, damit der Build die Test-Zweige samt Funktionen entfernt (wie in main.ts)
    if (import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1') {
      // Größenvergleich für die Stil-Prüfung: Lena rechts, Julian links neben dem Startpunkt der Karte
      if (new URLSearchParams(window.location.search).get('stilprobe') === '1') {
        const { x, y } = world.spawn;
        this.villagers.push(
          new Villager(this, { npcId: 'lena', x: x + tiled.tilewidth, y, facing: 'down' }),
          new Villager(this, { npcId: 'julian', x: x - tiled.tilewidth, y, facing: 'down' }),
        );
      }
      installTestHooks({
        player: () => {
          const m = this.player.state;
          return { x: m.x, y: m.y, facing: m.facing, moving: m.moving };
        },
        teleport: (tileX: number, tileY: number) => {
          this.player.placeAt((tileX + 0.5) * tiled.tilewidth, (tileY + 0.5) * tiled.tileheight);
          this.cam = { x: this.player.state.x, y: this.player.state.y };
          this.recordPlayer();
          this.moveCamera(0);
          this.draw();
        },
        // Linke obere Ecke des zuletzt gezeichneten Felds, wie Phaser sie rechnet
        camera: () => ({ scrollX: camera.worldView.x, scrollY: camera.worldView.y }),
        // Wo die Spielfigur gezeichnet ist (eingerastet), im Unterschied zum gerechneten Fußpunkt aus player()
        playerPose: () => this.player.pose,
        villagers: () => this.villagers.map((v) => ({ npcId: v.npcId, facing: v.facing, ...v.pose })),
        // Reden: Gespräch offen, Zahl der Gespräche, Sperre, Ziel, Bilder über den Köpfen (erster sichtbarer)
        talkState: () => {
          const marker = (which: 'quest' | 'key'): { visible: boolean; npcId: string | null; x: number; y: number } => {
            const v = this.villagers.find((n) => n.markerViews[which].visible);
            return v ? { npcId: v.npcId, ...v.markerViews[which] } : { visible: false, npcId: null, x: 0, y: 0 };
          };
          return {
            open: this.services.dialogue.isOpen, talks: this.talks, cooldown: this.talkCooldown,
            context: this.context, keyHint: marker('key'), questHint: marker('quest'),
          };
        },
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
   * 2. Abnehmer der Oberfläche nehmen ihre Drücke ab (windows.handleInput: Esc schließt ein offenes Fenster); F2
   *    (`fps`) blendet die Bildraten-Anzeige ein und aus, immer
   * 3. Gespräch offen: `interact`, `confirm` oder `cancel` schließt es; alle anderen Drücke werden verworfen (auch M
   *    und H), damit nach dem Schließen nichts nachfeuert. Sonst: M und H öffnen Menü bzw. Hilfe oder schließen sie
   *    wieder (handleMenuKeys, auch bei offenem Fenster); dann, wenn das Spiel nicht angehalten ist (Fenster,
   *    Gespräch, Dreh-Hinweis): Tasten 1–8 der Schnellleiste (hotbar.handleInput), dann `interact` → Gespräch mit dem
   *    ansprechbaren Dorfbewohner oder nichts (während der Sperre nach einem Gespräch nur abgenommen).
   * 4. Nur wenn das Spiel nicht angehalten ist: Spielerin rechnen, die gelaufene Strecke in den Spielstand schreiben,
   *    die Uhr des Spieltags weiterstellen (session.tick), Sperre ablaufen lassen, Ausgänge prüfen
   * 5. Ziel des Kontexts neu bestimmen (`context:changed` bei Wechsel), Bilder über den Köpfen setzen; Ort in den
   *    Spielstand, Kamera rechnen, Tiefe und Zeichenposition setzen – erst hier wird gerundet (auf ganze
   *    Bildschirmpixel), Figur und Kamera aus denselben Gleitkommawerten dieses Bildes.
   * Kamera und Zeichnen laufen auch angehalten weiter (eine neue Fenstergröße richtet das Bild sofort aus).
   */
  override update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const { input, windows, session, hotbar, dialogue, menu, help, fps } = this.services;
    input.frame(dt);
    windows.handleInput(input);
    if (input.consume('fps')) fps.toggle();
    fps.frame(dt);
    // per Tippen auf das Feld geschlossen (zwischen zwei Bildern)
    if (this.talkingTo && !dialogue.isOpen) this.endTalk();
    if (dialogue.isOpen) {
      if (input.consume('interact') || input.consume('confirm') || input.consume('cancel')) {
        dialogue.hide();
        this.endTalk();
      }
      input.clearPresses();
    } else {
      handleMenuKeys(input, windows, menu, help);
      if (!windows.paused) {
        hotbar.handleInput(input);
        if (input.consume('interact')) this.interact();
      }
    }
    if (!windows.paused) {
      const before = this.player.state;
      this.player.update(dt);
      const after = this.player.state;
      const walked = Math.hypot((after.x - before.x) / this.tileSize.width, (after.y - before.y) / this.tileSize.height);
      this.services.state.progression.stats.distanceWalked += walked;
      session.tick(dt);
      this.talkCooldown = Math.max(0, this.talkCooldown - dt);
      this.checkExit();
    }
    this.updateContext();
    this.recordPlayer();
    this.moveCamera(dt);
    this.draw();
  }

  /** `interact` mit einem ansprechbaren Dorfbewohner: Gespräch öffnen, er dreht sich zur Spielerin. */
  private interact(): void {
    const target = this.context;
    if (this.talkCooldown > 0 || target?.kind !== 'talk') return;
    const villager = this.villagers.find((v) => v.npcId === target.npcId);
    if (!villager) return;
    const { windows, session, dialogue } = this.services;
    // schon vor dem Gespräch anhalten: Hinweise, die es auslöst („Aufgabe geschafft!"), warten, bis es zu ist
    windows.setPaused(DIALOGUE_REASON, true);
    const view = session.talkTo(target.npcId);
    if (!view) {
      windows.setPaused(DIALOGUE_REASON, false);
      return;
    }
    villager.face(facingToward(villager, this.player.state));
    dialogue.show(view, faceUrl(view.npcId) ?? '');
    this.talkingTo = villager;
    this.talks += 1;
  }

  /** Gespräch ist zu: Dorfbewohner dreht sich zurück, die Sperre beginnt (Alt: DialogSystem.js Zeile 114). */
  private endTalk(): void {
    this.talkingTo?.face(null);
    this.talkingTo = null;
    this.talkCooldown = TALK_COOLDOWN;
  }

  /** Hinweis beim Betreten eines Ausgangs, einmal je Betreten (die Karten dahinter kommen später). */
  private checkExit(): void {
    const m = this.player.state;
    const exit = exitAt(m.x, m.y, this.world.exits);
    if (exit && exit !== this.inExit) this.services.toasts.show(TEXTS['toast.exitSoon']);
    this.inExit = exit;
  }

  /**
   * Ziel des Kontexts (bei offenem Gespräch oder angehaltenem Spiel keins), gemeldet nur bei Wechsel. Über dem
   * Dorfbewohner, zu dem die aktuelle Aufgabe führt, das Hinweis-Symbol; über dem ansprechbaren das Tasten-Bild,
   * nur mit Tastatur (mit Touch zeigt der Kontext-Knopf, was geht).
   */
  private updateContext(): void {
    const { dialogue, windows, input, bus, state } = this.services;
    const target = dialogue.isOpen || windows.paused
      ? null
      : findContext(this.player.state, this.world.npcs, this.world.exits, KNOWN_NPC_IDS);
    if (!sameContext(target, this.context)) {
      this.context = target;
      bus.emit('context:changed', { target });
    }
    const quest = currentQuest(state);
    const questNpc = quest?.def.type === 'talk' ? String(quest.def.target) : null;
    const keyNpc = target?.kind === 'talk' && input.device === 'keys' ? target.npcId : null;
    for (const v of this.villagers) v.setMarkers(v.npcId === questNpc, v.npcId === keyNpc);
  }

  /**
   * Schreibt den Fußpunkt der Spielerin in Kacheln nach state.player, ungerundet: ein gerundeter Wert dicht an
   * einer Wand läge beim Laden womöglich in ihr (resolveStart fiele dann auf den Startpunkt zurück). Läuft in jedem
   * Bild, damit jedes Speichern – auch das beim Verstecken der Seite – den aktuellen Ort hat. Die Karte ist die,
   * auf der sie wirklich steht: ein übernommener Stand aus einer noch fehlenden Karte wird damit zum Dorf.
   */
  private recordPlayer(): void {
    const p = this.services.state.player;
    const m = this.player.state;
    p.map = this.world.id;
    p.x = m.x / this.tileSize.width;
    p.y = m.y / this.tileSize.height;
  }

  private moveCamera(dt: number): void {
    const { viewWidth, viewHeight } = this.services.pixelGrid.snapshot.layout;
    const m = this.player.state;
    this.cam = stepCamera(this.cam, m, dt, { width: viewWidth, height: viewHeight }, { width: this.world.widthPx, height: this.world.heightPx });
  }

  private draw(): void {
    const { viewWidth, viewHeight, zoom } = this.services.pixelGrid.snapshot.layout;
    const m = this.player.state;
    // Figur und Kamera rasten auf dasselbe Raster ein: ganze Bildschirmpixel (1/Zoom Bildpunkt)
    this.player.draw(zoom);
    const { scrollX, scrollY } = cameraScroll(this.cam, { width: viewWidth, height: viewHeight }, m, zoom);
    this.cameras.main.centerOn(scrollX + viewWidth / 2, scrollY + viewHeight / 2);
  }
}
