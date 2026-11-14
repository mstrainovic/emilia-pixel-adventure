// Kette der Umstellungen zwischen Versionen des Spielstand-Formats (`formatVersion`).
//
// Regel für `formatVersion`:
// 1. Ein neues Feld mit sicherer Vorgabe, das ein älterer Build einfach durchreicht, erhöht die Version nicht.
// 2. Die Version steigt, sobald ein älterer Build den Stand nicht mehr verlustfrei lesen und zurückschreiben
//    könnte: neue oder entfernte Kennungen (Karte wie das Dino-Tal, Gegenstand, Aufgabe), umbenannte oder
//    entfernte Felder, geänderte Bedeutung eines Felds.
// 3. Jede Erhöhung bringt einen Eintrag in `MIGRATIONS` und einen Test mit.
//
// Der Test in tests/save/migrations.test.ts vergleicht Kennungen und oberste Felder mit
// tests/save/format-fingerprint.json und schlägt an, wenn man diese Regel vergessen hat.

export type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/** Schlüssel n: Umstellung von Version n auf n+1. Heute leer, es gibt nur Version 1. */
export const MIGRATIONS: Readonly<Record<number, Migration>> = {};

export type MigrationResult =
  | { kind: 'ok'; raw: unknown }
  | { kind: 'newer'; storedVersion: number }
  | { kind: 'invalid' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Hebt einen gelesenen Stand Schritt für Schritt auf `target`. Wirft nie. */
export function runMigrations(
  raw: unknown, chain: Readonly<Record<number, Migration>>, target: number,
): MigrationResult {
  if (!isRecord(raw)) return { kind: 'invalid' };
  const stored = raw['formatVersion'];
  if (typeof stored !== 'number' || !Number.isInteger(stored) || stored < 1) return { kind: 'invalid' };
  if (stored > target) return { kind: 'newer', storedVersion: stored };
  let current: Record<string, unknown> = raw;
  for (let version = stored; version < target; version++) {
    const step = Object.hasOwn(chain, version) ? chain[version] : undefined;
    if (step === undefined) return { kind: 'invalid' };
    try {
      current = step(current);
    } catch {
      return { kind: 'invalid' };
    }
    if (!isRecord(current) || current['formatVersion'] !== version + 1) return { kind: 'invalid' };
  }
  return { kind: 'ok', raw: current };
}
