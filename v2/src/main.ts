import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { PixelGrid } from './core/pixelGrid';
import { SERVICES_KEY, type Services } from './core/services';
import { installTestHooks } from './core/testHooks';
import { InputHub } from './input/hub';
import { KeyboardSource } from './input/keyboard';

const host = document.getElementById('game');
if (!host) throw new Error('Spielbereich #game fehlt.');

// Test-Zugang wie in testHooks.ts. Die Bedingung steht bewusst hier statt als importierte Konstante:
// nur so entfernt der Build die Test-Zweige samt Probe-Szene vollständig.
const testHooksEnabled = import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1';

// Schachbrett-Probe für die Pixeltests: nur mit Test-Zugang und ?probe=schach. Sie läuft allein, ohne
// Laden und Welt, damit das Prüfbild genau wie vorher entsteht. Sonst lädt BootScene und startet die Welt.
const probe = testHooksEnabled && new URLSearchParams(window.location.search).get('probe') === 'schach';
const scenes: Phaser.Types.Scenes.SceneType[] = probe
  ? [(await import('./scenes/PixelProbeScene')).PixelProbeScene]
  : [BootScene, WorldScene];

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
  // Zeitschritt = wirklich vergangene Zeit. Phasers Glättung (TimeStep.smoothDelta) kappt ihn nach dem Start,
  // nach jedem Fokuswechsel (120 Bilder lang) und ohne Fokus auf 1/60 s: unter 60 Bildern je Sekunde liefe
  // Emilia dann in Zeitlupe. Große Sprünge fangen stepMover (MAX_DT) und die Kamera selbst ab.
  fps: { smoothStep: false },
  scene: scenes,
});

const pixelGrid = new PixelGrid(game, host);
const input = new InputHub();
const keyboard = new KeyboardSource(window);
keyboard.attach();
input.add(keyboard);
const services: Services = { pixelGrid, input };
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
