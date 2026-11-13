import Phaser from 'phaser';
import { computeZoom } from '../core/pixel';
import { installTestHooks } from '../core/testHooks';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#2d5a27');
    this.applyPixelGrid();
    const onResize = (): void => this.applyPixelGrid();
    window.addEventListener('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('resize', onResize));
    installTestHooks({ ready: true });
  }

  /** Zeichenfläche = Fenster in physischen Pixeln, Anzeige = volles Fenster, Kamerazoom ganzzahlig. */
  private applyPixelGrid(): void {
    const dpr = window.devicePixelRatio || 1;
    const physicalWidth = Math.max(1, Math.round(window.innerWidth * dpr));
    const physicalHeight = Math.max(1, Math.round(window.innerHeight * dpr));
    const scale = this.scale;
    scale.resize(physicalWidth, physicalHeight);
    const canvas = this.game.canvas;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    scale.displaySize.setSize(window.innerWidth, window.innerHeight);
    const zoom = computeZoom(physicalWidth, physicalHeight);
    this.cameras.main.setZoom(zoom);
    installTestHooks({ zoom });
  }
}
