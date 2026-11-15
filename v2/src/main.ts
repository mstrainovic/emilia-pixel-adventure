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
import { TouchSource } from './input/touch';
import { openBrowserStorage } from './save/browser';
import { SaveService } from './save/service';
import { SaveStore } from './save/store';
import { UiRoot } from './ui/root';
import { WindowManager } from './ui/windows';
import { Hud } from './ui/hud';
import { Hotbar } from './ui/hotbar';
import { DialogueBox } from './ui/dialogueBox';
import { Toasts } from './ui/toasts';
import { TouchControls } from './ui/touchControls';
import { RotateHint } from './ui/rotateHint';
import { Menu } from './ui/menu';
import { Help } from './ui/help';
import { FpsMeter } from './ui/fps';
import { Notices, toastWhenRunning } from './ui/notices';
import { Backup } from './ui/backup';
import { el } from './ui/el';
import { TEXTS, fillText } from './data/texts';
import { QUESTS } from './data/quests';
import { iconFor } from './data/icons';
import { advanceClock } from './systems/dayclock';
import type { Action } from './input/actions';

/**
 * Hinweise zum Fortschritt: Aufgabe geschafft (mit den Symbolen der Belohnung), neues Level; nach einer erledigten
 * Aufgabe wird gespeichert. Solange das Spiel angehalten ist (Gespräch, Fenster), warten die Hinweise und erscheinen,
 * sobald es weiterläuft – so stehen sie nicht neben dem Gesprächsfeld und laufen nicht ungesehen ab.
 */
function announceProgress(services: Services): void {
  const { bus } = services;
  const announce = toastWhenRunning(services);
  bus.on('quest:changed', (change) => {
    if (!change.completed) return;
    const rewards = (QUESTS[change.questId]?.itemReward ?? []).map((r) => iconFor(r.itemId));
    announce(TEXTS['toast.questDone'], rewards);
    if (change.levelsGained > 0) announce(fillText('toast.levelUp', { n: services.state.progression.level }));
    bus.emit('ui:sound', { name: 'quest' });
    if (services.persist) services.save.saveNow('quest');
  });
}

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
// Berührung: Stick und Kontext-Knopf (ui/touchControls.ts übersetzt die Zeiger-Ereignisse)
const touch = new TouchSource();
input.add(touch);
const save = new SaveService(store, () => services.state, () => Date.now(), (reason, result) => {
  bus.emit('save:result', { reason, result });
});
const uiRoot = new UiRoot(uiHost, pixelGrid);
const windows = new WindowManager(uiRoot.element, bus, input);
// Anzeige und Schnellleiste bekommen die Dienste selbst und werden darum gleich danach eingetragen. Erst nach
// session.start: das Anlegen der ersten Aufgabe meldet kein Ereignis, die beiden lesen den Stand beim Anlegen.
const services = {
  pixelGrid, input, bus, state: start.state, save, store,
  persist: start.persist, startNotice: start.notice, legacyNewer: start.legacyNewer,
  startRepair: start.repair, importSave: start.importSave,
  session: new GameSession(start.state, bus),
  uiRoot, windows,
} as Services;
services.session.start();
services.hud = new Hud(uiRoot.element, services);
services.hotbar = new Hotbar(uiRoot.element, services);
services.dialogue = new DialogueBox(uiRoot.element, services, windows);
services.toasts = new Toasts(uiRoot.element);
// Touch-Bedienung: Stick-Zone als erstes Kind (unter Anzeige und Schnellleiste), Kontext-Knopf und Dreh-Hinweis zuletzt
new TouchControls(uiRoot.element, services, touch, host);
new RotateHint(uiRoot.element, windows);
// Menü (M, Menü-Knopf) mit den Knöpfen „Hilfe", „Spielstand sichern", „Spielstand laden"; Hilfe (H);
// Bildraten-Anzeige (F2). Weitere Menü-Knöpfe mit menu.add.
services.help = new Help(windows, input);
services.menu = new Menu(windows);
services.menu.add({ id: 'help', label: TEXTS['menu.help'], onSelect: () => services.help.open() });
services.backup = new Backup(services, document, () => window.location.reload());
services.backup.addTo(services.menu);
// nicht bei offenem Gespräch oder angehaltenem Spiel (der Knopf ist bei offenem Fenster ohnehin inert)
services.hud.onMenu = () => { if (!windows.paused) services.menu.open(); };
services.fps = new FpsMeter(uiRoot.element);
announceProgress(services);
const notices = new Notices(services, () => window.location.reload());
game.registry.set(SERVICES_KEY, services);
pixelGrid.start();
// alle 60 s, beim Verstecken und beim Verlassen der Seite (wie Etappe 0)
if (start.persist) save.start(document, window);
// Hinweis beim Start, danach die Frage nach dem alten Stand (erst jetzt: die Oberfläche hat ihren Maßstab)
notices.start();
// Erinnerung an eine Sicherung als Datei, falls fällig (wartet, bis ein Hinweis-Fenster zu ist)
services.backup.start();

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
    // Touch: zuletzt benutztes Gerät, Vektor und Rennen des Sticks, ob ein Finger ihn hält
    touchState: () => ({ device: input.device, move: touch.move, run: touch.run, held: touch.held }),
  });
  // Anzeige: Lebenspunkte setzen und melden (wie später ein Treffer); Schnellleiste: Platz belegen
  installTestHooks({
    setHp: (hp: number) => {
      services.state.player.hp = hp;
      bus.emit('stats:changed', {});
    },
    // Platz der Schnellleiste direkt belegen, auch mit einer Kennung, die es nicht gibt (Review Focus 5)
    setSlot: (index: number, itemId: string | null, count: number) => {
      services.state.inventory.slots[index] = { itemId, count };
      bus.emit('inventory:changed', {});
    },
    // Uhr des Spieltags vorstellen (in Schritten, wie sie session.tick macht): 750 s = ein Spieltag
    skipTime: (seconds: number) => {
      for (let left = seconds; left > 0; left -= 1) advanceClock(services.state, Math.min(1, left));
    },
  });
}
