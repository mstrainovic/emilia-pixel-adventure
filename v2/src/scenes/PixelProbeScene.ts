import Phaser from 'phaser';
import type { PixelGridSnapshot } from '../core/pixelGrid';
import { servicesOf } from '../core/services';
import { installTestHooks } from '../core/testHooks';

/**
 * Prüfbild für die Pixeltests (nur mit Test-Zugang und `?probe=schach`): füllt den Kamera-Ausschnitt
 * mit einem Schachbrett aus einzelnen Bildpunkten (Feld 0/0 weiß); außerhalb des Ausschnitts rot.
 */
export class PixelProbeScene extends Phaser.Scene {
  private board: Phaser.GameObjects.Image | null = null;
  private textureKey: string | null = null;
  private drawCount = 0;

  constructor() {
    super('PixelProbeScene');
  }

  create(): void {
    const { pixelGrid } = servicesOf(this);
    // Hauptkamera: ganze Zeichenfläche in Rot; die Probe-Kamera zeigt das Schachbrett im Ausschnitt.
    const frame = this.cameras.main;
    frame.setBackgroundColor('#ff0000');
    const view = this.cameras.add(0, 0, 1, 1, false, 'probe');
    const draw = (snapshot: PixelGridSnapshot): void => {
      frame.setViewport(0, 0, snapshot.deviceWidth, snapshot.deviceHeight);
      pixelGrid.applyTo(view);
      this.drawBoard(snapshot, frame, view);
    };
    draw(pixelGrid.snapshot);
    const unsubscribe = pixelGrid.onChange(draw);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    installTestHooks({ ready: true });
  }

  private drawBoard(snapshot: PixelGridSnapshot, frame: Phaser.Cameras.Scene2D.Camera, view: Phaser.Cameras.Scene2D.Camera): void {
    const { viewWidth, viewHeight } = snapshot.layout;
    this.board?.destroy();
    if (this.textureKey) this.textures.remove(this.textureKey);
    this.drawCount += 1;
    const key = `pixel-probe-${this.drawCount}`;
    const texture = this.textures.createCanvas(key, viewWidth, viewHeight);
    if (!texture) throw new Error(`Probe-Textur ${key} ließ sich nicht anlegen.`);
    const image = texture.context.createImageData(viewWidth, viewHeight);
    for (let y = 0; y < viewHeight; y++) {
      for (let x = 0; x < viewWidth; x++) {
        const value = (x + y) % 2 === 0 ? 255 : 0;
        const i = (y * viewWidth + x) * 4;
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
    }
    texture.context.putImageData(image, 0, 0);
    texture.refresh();
    this.textureKey = key;
    this.board = this.add.image(0, 0, key).setOrigin(0, 0);
    frame.ignore(this.board);
    // Bildpunkt 0/0 an die linke obere Ecke des Ausschnitts
    view.centerOn(viewWidth / 2, viewHeight / 2);
    installTestHooks({ probe: { deviceWidth: snapshot.deviceWidth, deviceHeight: snapshot.deviceHeight, draws: this.drawCount } });
  }
}
