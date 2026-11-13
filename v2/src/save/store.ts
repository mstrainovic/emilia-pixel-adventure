// Speicher des neuen Spiels: laden, speichern, Übernahme des alten Stands, Sicherung als Datei.
// Regeln: nichts wirft; die alten Schlüssel werden nur gelesen; ein neuerer Stand wird nie überschrieben.
import { GAME_STATE_VERSION, INVENTORY_SLOTS, type GameState } from '../core/state';
import { MAX_LEVEL } from '../core/levels';
import { isMapId } from '../data/maps';
import {
  LEGACY_SAVE_KEY, LEGACY_MUTED_KEY, migrateLegacySave, legacyTimestamp,
} from './legacy';
import { isObj, field } from './legacyRead';

/** Eigener Schlüssel des neuen Spiels (nicht zu verwechseln mit den alten Schlüsseln). */
export const SAVE_KEY = 'emilia2_save';

export type SaveReason = 'timer' | 'map-change' | 'quest' | 'boss' | 'build' | 'campfire' | 'page-hide';

/** Prüft die Mindestform eines gespeicherten Standes; unbekannte Zusatzfelder bleiben erhalten. */
export function migrateState(raw: unknown): GameState | null {
  if (!isObj(raw)) return null;
  if (raw['formatVersion'] !== GAME_STATE_VERSION) return null;
  if (!isMapId(field(raw['player'], 'map'))) return null;
  const slots = field(raw['inventory'], 'slots');
  if (!Array.isArray(slots) || slots.length !== INVENTORY_SLOTS) return null;
  const level = field(raw['progression'], 'level');
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return null;
  return raw as unknown as GameState;
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

  /** Schreibt nie, wenn dort ein Stand einer neueren Version liegt. `true` nur, wenn geschrieben wurde. */
  save(state: GameState, now: number): boolean {
    const existing = parseJson(this.read(SAVE_KEY) ?? '');
    const stored = field(existing, 'formatVersion');
    if (typeof stored === 'number' && stored > GAME_STATE_VERSION) return false;
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
