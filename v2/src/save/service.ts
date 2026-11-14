// Entscheidet, WANN gespeichert wird: alle 60 s, beim Verlassen und beim Verstecken der Seite.
import type { GameState } from '../core/state';
import type { SaveStore, SaveReason, SaveResult } from './store';

export type { SaveReason, SaveResult };

export const SAVE_INTERVAL_MS = 60_000;

type SaveDoc = Pick<Document, 'addEventListener' | 'removeEventListener' | 'visibilityState'>;
type SaveWin = Pick<Window, 'addEventListener' | 'removeEventListener'>;

export class SaveService {
  private reason: SaveReason | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private teardown: (() => void) | null = null;
  private failures = 0;

  constructor(
    private readonly store: SaveStore,
    private readonly getState: () => GameState,
    private readonly now: () => number,
    private readonly onResult?: (reason: SaveReason, result: SaveResult) => void,
  ) {}

  start(doc: SaveDoc, win: SaveWin): void {
    if (this.teardown !== null) return;
    const onHide = (): void => { this.saveNow('page-hide'); };
    const onVisibility = (): void => { if (doc.visibilityState === 'hidden') this.saveNow('page-hide'); };
    win.addEventListener('pagehide', onHide);
    doc.addEventListener('visibilitychange', onVisibility);
    this.timer = setInterval(() => { this.saveNow('timer'); }, SAVE_INTERVAL_MS);
    this.teardown = () => {
      win.removeEventListener('pagehide', onHide);
      doc.removeEventListener('visibilitychange', onVisibility);
    };
  }

  /** Grund des letzten Speicherversuchs; nur zur Ansicht, ändert kein Verhalten. */
  get lastReason(): SaveReason | null {
    return this.reason;
  }

  /** Fehlgeschlagene Speicherversuche in Folge; ein Erfolg setzt auf 0 zurück. */
  get consecutiveFailures(): number {
    return this.failures;
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.teardown?.();
    this.teardown = null;
  }

  /** Speichert jetzt, meldet das Ergebnis an `onResult` und gibt es zurück; wirft nie. */
  saveNow(reason: SaveReason): SaveResult {
    this.reason = reason;
    let result: SaveResult;
    try {
      result = this.store.save(this.getState(), this.now());
    } catch {
      result = { kind: 'unavailable' };
    }
    this.failures = result.kind === 'saved' ? 0 : this.failures + 1;
    try {
      this.onResult?.(reason, result);
    } catch {
      // Ein Beobachter, der wirft, darf das Speichern nicht stören.
    }
    return result;
  }
}
