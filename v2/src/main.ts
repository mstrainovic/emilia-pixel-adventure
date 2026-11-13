import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#2d5a27',
  // Größe setzt BootScene: Zeichenfläche = Fenster in physischen Pixeln, Zoom ganzzahlig
  scale: {
    mode: Phaser.Scale.NONE,
    width: Math.max(1, Math.round(window.innerWidth * window.devicePixelRatio)),
    height: Math.max(1, Math.round(window.innerHeight * window.devicePixelRatio)),
  },
  // Pixelart: keine Kantenglättung, ganze Pixel (pixelArt setzt antialias=false, roundPixels=true)
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [BootScene],
});
