// Kleine, werfende-freie Lesehilfen für den alten Spielstand (unbekannte Form, `unknown`).

export type Obj = Record<string, unknown>;

/** Ein JSON-Objekt (kein Array, kein `null`, keine Zahl). */
export function isObj(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Eigene Schlüssel; `__proto__` fällt weg, damit nie ein Prototyp überschrieben wird. */
export function keysOf(o: unknown): string[] {
  return isObj(o) ? Object.keys(o).filter((k) => k !== '__proto__') : [];
}

/** Eigenes Feld oder `undefined`. */
export function field(o: unknown, key: string): unknown {
  return isObj(o) && Object.hasOwn(o, key) ? o[key] : undefined;
}

/** Endliche Zahl oder `undefined`. */
export function finite(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Zähler: endlich, abgerundet, nicht negativ; sonst `fallback`. */
export function counter(v: unknown, fallback = 0): number {
  const n = finite(v);
  return n === undefined ? fallback : Math.max(0, Math.floor(n));
}

/** Endliche Zahl ≥ 0 ohne Abrunden; sonst `fallback`. */
export function nonNegative(v: unknown, fallback = 0): number {
  const n = finite(v);
  return n === undefined || n < 0 ? fallback : n;
}

/** Liste aus Texten ohne Doppelte, in alter Reihenfolge; alles andere → leer. */
export function stringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v) if (typeof item === 'string' && !out.includes(item)) out.push(item);
  return out;
}

/** Schlüssel eines Objekts, dessen Wert `true` ist (alte „Menge als Objekt"). */
export function trueKeys(v: unknown): string[] {
  return keysOf(v).filter((k) => field(v, k) === true);
}

/** Liste **oder** Objekt-Menge als Textliste. */
export function listOrTrueKeys(v: unknown): string[] {
  return Array.isArray(v) ? stringList(v) : trueKeys(v);
}

/** Zuordnung Name → Zähler; behält endliche Werte ≥ 0 (abgerundet). */
export function counterRecord(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keysOf(v)) {
    const n = finite(field(v, k));
    if (n !== undefined && n >= 0) out[k] = Math.floor(n);
  }
  return out;
}

/** Zuordnung Name → Wahrheitswert. */
export function boolRecord(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const k of keysOf(v)) {
    const b = field(v, k);
    if (typeof b === 'boolean') out[k] = b;
  }
  return out;
}

/** Zuordnung Name → Textliste ohne Doppelte; Nicht-Listen entfallen. */
export function listRecord(v: unknown): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const k of keysOf(v)) {
    const list = field(v, k);
    if (Array.isArray(list)) out[k] = stringList(list);
  }
  return out;
}

/** Boss-Zähler: das alte Spiel schreibt `true`; das wird zu 1, Zahlen ≥ 1 bleiben (abgerundet). */
export function bossRecord(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of keysOf(v)) {
    const x = field(v, k);
    const n = x === true ? 1 : finite(x);
    if (n !== undefined && n >= 1) out[k] = Math.floor(n);
  }
  return out;
}
