import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#2d5a27',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  // Pixelart: keine Kantenglättung, ganze Pixel (pixelArt setzt antialias=false, roundPixels=true)
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [BootScene],
});
