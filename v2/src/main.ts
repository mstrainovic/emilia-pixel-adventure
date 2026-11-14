import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { PixelGrid } from './core/pixelGrid';
import { EventBus, type GameEvents } from './core/events';
import { SERVICES_KEY, startGame, type Services } from './core/services';
import { GameSession } from './core/session';
import { installTestHooks } from './core/testHooks';
import { InputHub } from './input/hub';
import { KeyboardSource } from './input/keyboard';
import { openBrowserStorage } from './save/browser';
import { SaveService } from './save/service';
import { SaveStore } from './save/store';
import { UiRoot } from './ui/root';
import { WindowManager } from './ui/windows';
import { el } from './ui/el';
import { TEXTS } from './data/texts';
import type { Action } from './input/actions';

const host = document.getElementById('game');
if (!host) throw new Error('Spielbereich #game fehlt.');
const uiHost = document.getElementById('ui');
if (!uiHost) throw new Error('Oberfläche #ui fehlt.');

// Test-Zugang wie in testHooks.ts. Die Bedingung steht bewusst hier statt als importierte Konstante:
// nur so entfernt der Build die Test-Zweige samt Probe-Szene vollständig.
const testHooksEnabled = import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1';

// Schachbrett-Probe für die Pixeltests: nur mit Test-Zugang und ?probe=schach. Sie läuft allein, ohne
// Laden und Welt, damit das Prüfbild genau wie vorher entsteht. Sonst lädt BootScene und startet die Welt.
const probe = testHooksEnabled && new URLSearchParams(window.location.search).get('probe') === 'schach';
const scenes: Phaser.Types.Scenes.SceneType[] = probe
  ? [(await import('./scenes/PixelProbeScene')).PixelProbeScene]
  : [BootScene, WorldScene];

// Spielstand vor dem ersten Szenenstart: laden, beim ersten Start den alten Stand übernehmen (siehe startGame)
const storage = openBrowserStorage(window);
// Genau ein SaveStore für Start und Sitzung: er merkt sich den Stempel des zuletzt gelesenen oder geschriebenen
// Eintrags und erkennt so einen zweiten Tab. Darf diese Sitzung nicht speichern (neuerer Stand, Speicher nicht
// lesbar), wirft das Schreiben: so schreibt auch kein späterer Speicherweg (Plan 1b) über einen Stand, den das
// Spiel nicht kennt.
let writable = true;
const store = new SaveStore({
  getItem: (key: string): string | null => storage.getItem(key),
  setItem: (key: string, value: string): void => {
    if (!writable) throw new Error('In dieser Sitzung wird nicht gespeichert.');
    storage.setItem(key, value);
  },
});
const start = startGame(store, Date.now());
writable = start.persist;
const bus = new EventBus<GameEvents>();

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
const keyboard = new KeyboardSource(window, document);
keyboard.attach();
input.add(keyboard);
const save = new SaveService(store, () => services.state, () => Date.now(), (reason, result) => {
  bus.emit('save:result', { reason, result });
});
const uiRoot = new UiRoot(uiHost, pixelGrid);
const windows = new WindowManager(uiRoot.element, bus);
const services: Services = {
  pixelGrid, input, bus, state: start.state, save, store,
  persist: start.persist, startNotice: start.notice, legacyNewer: start.legacyNewer,
  startRepair: start.repair, importSave: start.importSave,
  session: new GameSession(start.state, bus),
  uiRoot, windows,
};
game.registry.set(SERVICES_KEY, services);
services.session.start();
pixelGrid.start();
// alle 60 s, beim Verstecken und beim Verlassen der Seite (wie Etappe 0)
if (start.persist) save.start(document, window);

if (testHooksEnabled) {
  const publish = (): void => installTestHooks({ pixelGrid: pixelGrid.snapshot });
  publish();
  pixelGrid.onChange(publish);
  installTestHooks({
    cssToView: (cssX: number, cssY: number) => pixelGrid.cssToView(cssX, cssY),
    toCanvas: (cssX: number, cssY: number) => ({ x: game.scale.transformX(cssX), y: game.scale.transformY(cssY) }),
  });
  let lastSaveResult: GameEvents['save:result'] | null = null;
  bus.on('save:result', (payload) => { lastSaveResult = payload; });
  installTestHooks({
    startNotice: start.notice,
    startRepair: start.repair,
    importSave: start.importSave,
    saveNow: () => save.saveNow('timer'),
    state: () => structuredClone(services.state),
    lastSaveResult: () => lastSaveResult,
  });
  // Oberfläche: Probefenster, Anhalten, gemeldete Ereignisse, Blick in den Eingabe-Puffer
  const uiLog: string[] = [];
  bus.on('ui:paused', ({ paused }) => { uiLog.push(`paused:${paused}`); });
  bus.on('ui:sound', ({ name }) => { uiLog.push(`sound:${name}`); });
  installTestHooks({
    openTestWindow: () => windows.open({ id: 'test', title: TEXTS['test.title'], body: el('p', '', TEXTS['test.body']) }),
    paused: () => windows.paused,
    uiLog: () => [...uiLog],
    consumeInput: (action: Action) => input.consume(action),
  });
}
