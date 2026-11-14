import Phaser from 'phaser';
import { servicesOf } from '../core/services';
import { installTestHooks } from '../core/testHooks';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const camera = this.cameras.main;
    camera.setBackgroundColor('#2d5a27');
    const { pixelGrid } = servicesOf(this);
    pixelGrid.applyTo(camera);
    const unsubscribe = pixelGrid.onChange(() => pixelGrid.applyTo(camera));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    installTestHooks({ ready: true });
  }
}
