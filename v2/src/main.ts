import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PixelGrid } from './core/pixelGrid';
import { SERVICES_KEY, type Services } from './core/services';
import { installTestHooks } from './core/testHooks';

const host = document.getElementById('game');
if (!host) throw new Error('Spielbereich #game fehlt.');

// Test-Zugang wie in testHooks.ts. Die Bedingung steht bewusst hier statt als importierte Konstante:
// nur so entfernt der Build die Test-Zweige samt Probe-Szene vollständig.
const testHooksEnabled = import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1';

// Schachbrett-Probe für die Pixeltests: nur mit Test-Zugang und ?probe=schach
const probe = testHooksEnabled && new URLSearchParams(window.location.search).get('probe') === 'schach';
const scenes: Phaser.Types.Scenes.SceneType[] = probe
  ? [(await import('./scenes/PixelProbeScene')).PixelProbeScene]
  : [BootScene];

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: host,
  // Rand außerhalb des Kamera-Ausschnitts bleibt schwarz
  backgroundColor: '#000000',
  // Größe misst und setzt PixelGrid: Zeichenfläche = Spielbereich in Gerätepixeln
  scale: { mode: Phaser.Scale.NONE, width: 1, height: 1 },
  // Pixelart: keine Kantenglättung, ganze Pixel (pixelArt setzt antialias=false, roundPixels=true)
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: scenes,
});

const pixelGrid = new PixelGrid(game, host);
const services: Services = { pixelGrid };
game.registry.set(SERVICES_KEY, services);
pixelGrid.start();

if (testHooksEnabled) {
  const publish = (): void => installTestHooks({ pixelGrid: pixelGrid.snapshot });
  publish();
  pixelGrid.onChange(publish);
  installTestHooks({
    cssToView: (cssX: number, cssY: number) => pixelGrid.cssToView(cssX, cssY),
    toCanvas: (cssX: number, cssY: number) => ({ x: game.scale.transformX(cssX), y: game.scale.transformY(cssY) }),
  });
}
