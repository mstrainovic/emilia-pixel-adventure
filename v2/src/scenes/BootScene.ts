import Phaser from 'phaser';
import { installTestHooks } from '../core/testHooks';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#2d5a27');
    installTestHooks({ ready: true });
  }
}
