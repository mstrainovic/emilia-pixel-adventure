import type Phaser from 'phaser';
import type { InputHub } from '../input/hub';
import type { SaveService } from '../save/service';
import type { SaveStore, SaveResult } from '../save/store';
import type { RepairReport } from '../save/normalize';
import { createNewGameState, type GameState } from './state';
import type { EventBus, GameEvents } from './events';
import type { PixelGrid } from './pixelGrid';
import type { GameSession } from './session';
import type { UiRoot } from '../ui/root';
import type { WindowManager } from '../ui/windows';
import type { Hud } from '../ui/hud';
import type { Hotbar } from '../ui/hotbar';
import type { DialogueBox } from '../ui/dialogueBox';
import type { Toasts } from '../ui/toasts';

/** Was beim Start zu erklären ist (die Anzeige dazu kommt in Plan 1b). */
export type StartNotice = 'save-corrupt' | 'save-corrupt-legacy' | 'save-repaired' | 'save-newer'
  | 'storage-unavailable' | 'legacy-imported' | 'legacy-failed';

export interface GameStart {
  state: GameState;
  notice: StartNotice | null;
  /** Falsch: in dieser Sitzung wird nie gespeichert (neuerer Stand oder Speicher nicht lesbar). */
  persist: boolean;
  /** Der alte Stand ist neuer als die letzte Übernahme oder Ablehnung (die Frage dazu stellt Plan 1b). */
  legacyNewer: boolean;
  /** Bericht des Ladens, wenn etwas repariert wurde; sonst `null`. */
  repair: RepairReport | null;
  /** Ergebnis des Sofort-Speicherns nach einer Übernahme; `null` ohne Übernahme. */
  importSave: SaveResult | null;
}

/** Neues Spiel; liegt ein alter Stand vor, wird er ohne Nachfrage übernommen (eine Kopie, der alte Schlüssel bleibt). */
function freshStart(store: SaveStore, now: number): {
  state: GameState; notice: StartNotice | null; importSave: SaveResult | null;
} {
  // importLegacy statt legacyOffer: so wird auch ein vorhandener, aber unlesbarer alter Stand erkannt und gemeldet
  const legacy = store.importLegacy(now);
  if (legacy.kind === 'none') return { state: createNewGameState(now), notice: null, importSave: null };
  if (legacy.kind !== 'ok') return { state: createNewGameState(now), notice: 'legacy-failed', importSave: null };
  return { state: legacy.state, notice: 'legacy-imported', importSave: store.save(legacy.state, now) };
}

/**
 * Startablauf: v2-Stand laden; beim ersten Start (leer oder kaputt) den alten Stand übernehmen und sofort speichern.
 * Bei einem neueren Stand oder unlesbarem Speicher beginnt ein neues Spiel, das nie gespeichert wird. Wirft nie
 * (SaveStore und die Übernahme werfen nicht).
 */
export function startGame(store: SaveStore, now: number): GameStart {
  const loaded = store.load();
  const blank = { persist: true, legacyNewer: false, repair: null, importSave: null };
  switch (loaded.kind) {
    case 'ok':
      return {
        ...blank, state: loaded.state, repair: loaded.repair,
        // mit Verlust repariert: der Rohtext liegt unter REJECTED_SAVE_KEY, das Spiel soll es sagen
        notice: loaded.repair?.lossy === true ? 'save-repaired' : null,
        legacyNewer: store.legacyOffer(loaded.state) === 'newer',
      };
    case 'newer':
      return { ...blank, state: createNewGameState(now), notice: 'save-newer', persist: false };
    case 'unavailable':
      return { ...blank, state: createNewGameState(now), notice: 'storage-unavailable', persist: false };
    case 'empty':
    case 'corrupt': {
      const fresh = freshStart(store, now);
      // der Rohtext des kaputten Stands ist gesichert (REJECTED_SAVE_KEY); dieser Hinweis hat Vorrang
      const corrupt = fresh.notice === 'legacy-imported' ? 'save-corrupt-legacy' : 'save-corrupt';
      const notice = loaded.kind === 'corrupt' ? corrupt : fresh.notice;
      return { ...blank, state: fresh.state, notice, importSave: fresh.importSave };
    }
  }
}

/** Spielweite Dienste, die `main.ts` vor dem ersten Szenenstart in `game.registry` legt. */
export interface Services {
  pixelGrid: PixelGrid;
  input: InputHub;
  bus: EventBus<GameEvents>;
  /** Der laufende Spielstand; die Welt-Szene schreibt den Ort der Spielerin hinein. */
  state: GameState;
  save: SaveService;
  store: SaveStore;
  persist: boolean;
  startNotice: StartNotice | null;
  legacyNewer: boolean;
  /** Reparatur-Bericht des Ladens beim Start (siehe GameStart.repair). */
  startRepair: RepairReport | null;
  /** Ergebnis des Sofort-Speicherns nach einer Übernahme beim Start (siehe GameStart.importSave). */
  importSave: SaveResult | null;
  /** Gespräche, Aufgaben, Rucksack: ruft die Logik auf und meldet Änderungen über `bus`. */
  session: GameSession;
  /** Wurzel der HTML-Oberfläche über dem Spielbild (Maßstab als CSS-Variablen). */
  uiRoot: UiRoot;
  /** Fenster und Anhalten des Spiels; die Welt-Szene ruft je Bild `windows.handleInput`. */
  windows: WindowManager;
  /** Grundanzeige: Herzen, Level, Münzen, Aufgabe, Menü-Knopf (`hud.onMenu`). */
  hud: Hud;
  /** Schnellleiste; die Welt-Szene ruft je Bild `hotbar.handleInput` (Tasten 1–8), wenn das Spiel läuft. */
  hotbar: Hotbar;
  /** Gesprächsfeld unten Mitte; die Welt-Szene öffnet und schließt es (Task 8 schließt es zusätzlich per Tippen). */
  dialogue: DialogueBox;
  /** Kurze Hinweise (3 s sichtbar, höchstens zwei zugleich). */
  toasts: Toasts;
}

/** Schlüssel der Dienste in `game.registry`. */
export const SERVICES_KEY = 'services';

/** Liest die spielweiten Dienste aus `game.registry`. */
export function servicesOf(scene: Phaser.Scene): Services {
  const services = scene.game.registry.get(SERVICES_KEY) as Services | undefined;
  if (!services) throw new Error('Spielweite Dienste fehlen in game.registry.');
  return services;
}
