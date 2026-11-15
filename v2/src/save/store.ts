// Speicher des neuen Spiels: laden, speichern, Übernahme des alten Stands, Sicherung als Datei.
// Regeln: nichts wirft; jeder Ausgang wird benannt; die alten Schlüssel werden nur gelesen;
// ein neuerer Stand wird nie überschrieben.
import { GAME_STATE_VERSION, type GameState } from '../core/state';
import { normalizeState, type RepairReport } from './normalize';
import { runMigrations, MIGRATIONS } from './migrations';
import {
  LEGACY_SAVE_KEY, LEGACY_MUTED_KEY, migrateLegacySave, legacyTimestamp, isLegacyReadable,
  type LegacyImportResult,
} from './legacy';
import { isObj, finite } from './legacyRead';

/** Eigener Schlüssel des neuen Spiels (nicht zu verwechseln mit den alten Schlüsseln). */
export const SAVE_KEY = 'emilia2_save';
/** Rohtext eines abgelehnten oder nur verlustbehaftet reparierten Eintrags, einmal gesichert, bevor er überschrieben wird. */
export const REJECTED_SAVE_KEY = 'emilia2_save_rejected';
/** Der Stand, den eine Übernahme oder ein Laden aus Datei ersetzt hat. */
export const BACKUP_SAVE_KEY = 'emilia2_save_backup';

export type SaveReason = 'timer' | 'map-change' | 'quest' | 'boss' | 'build' | 'campfire' | 'page-hide'
  | 'legacy-declined';   // „Nein" auf die Frage nach einem neueren alten Stand (Task 9)

export type LoadResult =
  | { kind: 'ok'; state: GameState; repair: RepairReport | null }   // null = nichts repariert
  | { kind: 'empty' }
  | { kind: 'corrupt' }                                             // Rohtext liegt unter REJECTED_SAVE_KEY
  | { kind: 'newer'; storedVersion: number }
  | { kind: 'unavailable' };

export type SaveResult =
  | { kind: 'saved' } | { kind: 'blocked-newer'; storedVersion: number }
  | { kind: 'blocked-other-tab' }   // der Eintrag wurde seit unserem letzten Lesen/Schreiben von jemand anderem geschrieben
  | { kind: 'full' } | { kind: 'unavailable' };

export type { LegacyImportResult };

type Inspection =
  | { kind: 'ok'; state: GameState; repair: RepairReport | null }
  | { kind: 'corrupt' }
  | { kind: 'newer'; storedVersion: number };

/** Prüft einen gelesenen Stand und repariert ihn; wirft nie. */
function inspect(parsed: unknown): Inspection {
  try {
    const migrated = runMigrations(parsed, MIGRATIONS, GAME_STATE_VERSION);
    if (migrated.kind === 'newer') return migrated;
    if (migrated.kind === 'invalid') return { kind: 'corrupt' };
    const normalized = normalizeState(migrated.raw);
    if (normalized === null) return { kind: 'corrupt' };
    const r = normalized.report;
    const untouched = !r.lossy && !r.relocated && !r.resizedInventory && r.resetQuests.length === 0;
    return { kind: 'ok', state: normalized.state, repair: untouched ? null : r };
  } catch {
    return { kind: 'corrupt' };
  }
}

/** Prüft das harte Minimum und repariert den Rest (siehe normalize.ts); wirft nie. */
export function migrateState(raw: unknown): GameState | null {
  const result = inspect(raw);
  return result.kind === 'ok' ? result.state : null;
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
  if (typeof parsed['version'] === 'number') {
    const imported = migrateLegacySave(text, null, now);
    return imported.kind === 'ok' ? imported.state : null;
  }
  return null;
}

/** Voller Speicher: am Namen erkannt, zusätzlich an den Codes 22 (Standard) und 1014 (altes Firefox). */
function isQuotaError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { name, code } = error as { name?: unknown; code?: unknown };
  return name === 'QuotaExceededError' || code === 22 || code === 1014;
}

function failure(error: unknown): SaveResult {
  return isQuotaError(error) ? { kind: 'full' } : { kind: 'unavailable' };
}

type RawRead = { ok: true; text: string | null } | { ok: false };

/** Der `savedAt` eines gespeicherten Rohtexts, wenn er lesbar und endlich ist; sonst `null`. */
function savedAtOf(text: string | null): number | null {
  if (text === null) return null;
  const parsed = parseJson(text);
  return isObj(parsed) ? finite(parsed['savedAt']) ?? null : null;
}

export class SaveStore {
  /**
   * Der `savedAt` des Eintrags, wie dieser Speicher ihn zuletzt selbst gelesen oder geschrieben hat
   * (`at: null`: kein Eintrag oder keiner mit lesbarem Stempel). `null`: noch nie gelesen oder geschrieben.
   * So erkennt `save`, dass ein anderer Tab inzwischen gespeichert hat.
   */
  private seen: { at: number | null } | null = null;

  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}

  private readRaw(key: string): RawRead {
    try {
      return { ok: true, text: this.storage.getItem(key) };
    } catch {
      return { ok: false };
    }
  }

  /** Lesen, bei dem „nicht lesbar" und „nicht vorhanden" dasselbe heißen (für die alten Schlüssel). */
  private read(key: string): string | null {
    const result = this.readRaw(key);
    return result.ok ? result.text : null;
  }

  /** Sichert den Rohtext eines abgelehnten Eintrags einmal; Fehler dabei sind unkritisch. */
  private backupRejected(text: string): void {
    try {
      if (text !== '' && this.storage.getItem(REJECTED_SAVE_KEY) !== text) this.storage.setItem(REJECTED_SAVE_KEY, text);
    } catch {
      // Sicherung nicht möglich: das normale Laden und Speichern läuft trotzdem.
    }
  }

  /** Sichert, was nicht ohne Verlust gelesen werden kann (kaputt oder mit Verlust repariert). */
  private backupIfLost(text: string, found: Inspection): void {
    if (found.kind === 'corrupt' || (found.kind === 'ok' && found.repair?.lossy === true)) this.backupRejected(text);
  }

  load(): LoadResult {
    const read = this.readRaw(SAVE_KEY);
    if (!read.ok) return { kind: 'unavailable' };
    this.seen = { at: savedAtOf(read.text) };
    if (read.text === null) return { kind: 'empty' };
    const found = inspect(parseJson(read.text));
    this.backupIfLost(read.text, found);
    return found;
  }

  /** Der Rohtext, der zuletzt unter REJECTED_SAVE_KEY gesichert wurde. */
  readRejected(): string | null {
    return this.read(REJECTED_SAVE_KEY);
  }

  private write(state: GameState, now: number): SaveResult {
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: now }));
      this.seen = { at: now };
      return { kind: 'saved' };
    } catch (error) {
      return failure(error);
    }
  }

  /**
   * Schreibt nie, wenn das Lesen scheitert, dort ein Stand einer neueren Version liegt (geht vor) oder ein anderer
   * Tab seit unserem letzten Lesen oder Schreiben gespeichert hat (anderer endlicher `savedAt`). Ein gelöschter Eintrag
   * oder einer ohne lesbaren Stempel wird überschrieben; ein Speicher, der noch nie gelesen oder geschrieben hat, schreibt.
   * Ein nicht ladbarer (oder nur mit Verlust reparierbarer) Eintrag wird vor dem Überschreiben
   * einmal unter REJECTED_SAVE_KEY gesichert.
   */
  save(state: GameState, now: number): SaveResult {
    const existing = this.readRaw(SAVE_KEY);
    if (!existing.ok) return { kind: 'unavailable' };
    if (existing.text !== null) {
      const found = inspect(parseJson(existing.text));
      if (found.kind === 'newer') return { kind: 'blocked-newer', storedVersion: found.storedVersion };
      const storedAt = savedAtOf(existing.text);
      if (storedAt !== null && this.seen !== null && storedAt !== this.seen.at) return { kind: 'blocked-other-tab' };
      this.backupIfLost(existing.text, found);
    }
    return this.write(state, now);
  }

  /**
   * Ersetzt den gespeicherten Stand und sichert vorher den bisherigen Rohtext unter BACKUP_SAVE_KEY.
   * Scheitert die Sicherung, bleibt alles, wie es war. Ein fremder Stempel sperrt hier nicht (ausdrücklicher Wunsch,
   * der ersetzte Rohtext ist gesichert); der eigene wird gemerkt.
   */
  replaceWith(state: GameState, now: number): SaveResult {
    const existing = this.readRaw(SAVE_KEY);
    if (!existing.ok) return { kind: 'unavailable' };
    if (existing.text !== null) {
      const found = inspect(parseJson(existing.text));
      if (found.kind === 'newer') return { kind: 'blocked-newer', storedVersion: found.storedVersion };
      try {
        this.storage.setItem(BACKUP_SAVE_KEY, existing.text);
      } catch (error) {
        return failure(error);
      }
    }
    return this.write(state, now);
  }

  /** Liest den alten Stand (nur lesend) und übersetzt ihn; speichert nichts. */
  importLegacy(now: number): LegacyImportResult {
    return migrateLegacySave(this.read(LEGACY_SAVE_KEY), this.read(LEGACY_MUTED_KEY), now);
  }

  /** Zeitstempel des alten Stands (nur lesend), etwa um eine Ablehnung zu merken; `null` ohne lesbaren Stempel. */
  legacyStamp(): number | null {
    return legacyTimestamp(this.read(LEGACY_SAVE_KEY));
  }

  /**
   * `first`: es gibt keinen v2-Stand, der alte ist lesbar. `newer`: der alte Stand ist neuer als die
   * letzte Übernahme und die letzte Ablehnung. Sonst `none`.
   */
  legacyOffer(current: GameState | null): 'first' | 'newer' | 'none' {
    const raw = this.read(LEGACY_SAVE_KEY);
    if (!isLegacyReadable(raw)) return 'none';
    if (current === null) return 'first';
    const legacyAt = legacyTimestamp(raw);
    if (legacyAt === null) return 'none';
    const seen = Math.max(current.importedLegacyAt ?? -Infinity, current.legacyDeclinedAt ?? -Infinity);
    return legacyAt > seen ? 'newer' : 'none';
  }
}
