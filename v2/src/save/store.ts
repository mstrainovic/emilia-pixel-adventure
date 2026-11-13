// Speicher des neuen Spiels: laden, speichern, Übernahme des alten Stands, Sicherung als Datei.
// Regeln: nichts wirft; die alten Schlüssel werden nur gelesen; ein neuerer Stand wird nie überschrieben.
import { GAME_STATE_VERSION, type GameState } from '../core/state';
import { normalizeState } from './normalize';
import {
  LEGACY_SAVE_KEY, LEGACY_MUTED_KEY, migrateLegacySave, legacyTimestamp,
} from './legacy';
import { isObj, field } from './legacyRead';

/** Eigener Schlüssel des neuen Spiels (nicht zu verwechseln mit den alten Schlüsseln). */
export const SAVE_KEY = 'emilia2_save';
/** Rohtext eines abgelehnten Eintrags, einmal gesichert, bevor er überschrieben wird. */
export const REJECTED_SAVE_KEY = 'emilia2_save_rejected';

export type SaveReason = 'timer' | 'map-change' | 'quest' | 'boss' | 'build' | 'campfire' | 'page-hide';

/** Prüft das harte Minimum und repariert den Rest (siehe normalize.ts); wirft nie. */
export function migrateState(raw: unknown): GameState | null {
  try {
    return normalizeState(raw);
  } catch {
    return null;
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/** Sicherung als Datei: JSON, eingerückt, der Zustand unverändert. */
export function serializeForExport(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

/** Liest eine v2-Sicherung oder eine Sicherung des alten Spiels; sonst `null`. Wirft nie. */
export function parseImport(text: string, now: number): GameState | null {
  const parsed = parseJson(text);
  if (!isObj(parsed)) return null;
  if (Object.hasOwn(parsed, 'formatVersion')) return migrateState(parsed);
  if (typeof parsed['version'] === 'number') return migrateLegacySave(text, null, now)?.state ?? null;
  return null;
}

export class SaveStore {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}

  private read(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  hasSave(): boolean {
    return this.load() !== null;
  }

  load(): GameState | null {
    const text = this.read(SAVE_KEY);
    if (text === null) return null;
    return migrateState(parseJson(text));
  }

  /** Sichert den Rohtext eines abgelehnten Eintrags einmal; Fehler dabei sind unkritisch. */
  private backupRejected(text: string): void {
    try {
      if (text !== '' && this.storage.getItem(REJECTED_SAVE_KEY) !== text) this.storage.setItem(REJECTED_SAVE_KEY, text);
    } catch {
      // Sicherung nicht möglich: das normale Speichern läuft trotzdem.
    }
  }

  /**
   * Schreibt nie, wenn das Lesen scheitert oder dort ein Stand einer neueren Version liegt.
   * Ein nicht ladbarer Eintrag wird vor dem Überschreiben einmal unter REJECTED_SAVE_KEY gesichert.
   * `true` nur, wenn geschrieben wurde.
   */
  save(state: GameState, now: number): boolean {
    let existing: string | null;
    try {
      existing = this.storage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
    if (existing !== null) {
      const parsed = parseJson(existing);
      const stored = field(parsed, 'formatVersion');
      if (typeof stored === 'number' && stored > GAME_STATE_VERSION) return false;
      if (migrateState(parsed) === null) this.backupRejected(existing);
    }
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: now }));
      return true;
    } catch {
      return false;
    }
  }

  /** Liest den alten Stand (nur lesend) und übersetzt ihn; speichert nichts. */
  importLegacy(now: number): ReturnType<typeof migrateLegacySave> {
    return migrateLegacySave(this.read(LEGACY_SAVE_KEY), this.read(LEGACY_MUTED_KEY), now);
  }

  /** Wahr, wenn ein alter Stand mit Zeitstempel existiert, der neuer ist als die letzte Übernahme. */
  shouldOfferReimport(state: GameState): boolean {
    const legacyAt = legacyTimestamp(this.read(LEGACY_SAVE_KEY));
    if (legacyAt === null) return false;
    return state.importedLegacyAt === null || legacyAt > state.importedLegacyAt;
  }
}
