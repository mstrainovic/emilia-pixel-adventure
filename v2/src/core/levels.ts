export const MAX_LEVEL = 30;
export const HP_PER_HEART = 4;

/** Alter Bedarf von Level n auf n+1 steht an Index n−1. */
export const LEGACY_XP_TO_NEXT: readonly number[] = [
  25, 40, 60, 100, 130, 160, 200, 250, 300, 400, 500, 650, 800, 1000, 1300, 1600,
  2000, 2500, 3000, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800,
];

// Level unter 1 oder nicht ganzzahlig: abrunden und auf 1…30 begrenzen.
function clampLevel(level: number): number {
  const n = Math.floor(level);
  if (!Number.isFinite(n)) return n > 0 ? MAX_LEVEL : 1;
  return Math.min(MAX_LEVEL, Math.max(1, n));
}

/** XP von Level n auf n+1: 50 + 25·(n−1); auf Höchststufe unendlich. */
export function xpToNext(level: number): number {
  const n = clampLevel(level);
  return n >= MAX_LEVEL ? Number.POSITIVE_INFINITY : 50 + 25 * (n - 1);
}

/** Summe aller XP-Bedarfe unterhalb von `level`. */
export function cumulativeXp(level: number): number {
  const n = clampLevel(level);
  let sum = 0;
  for (let l = 1; l < n; l++) sum += xpToNext(l);
  return sum;
}

/** 5 Herzen zu Beginn, je eines auf Level 5, 10, 15, 20, 25 (höchstens 10). */
export function heartsForLevel(level: number): number {
  return 5 + Math.min(5, Math.floor(clampLevel(level) / 5));
}

/** Rechnet den Fortschrittsbalken der alten Kurve anteilig auf die neue um. */
export function convertLegacyXp(level: number, legacyXp: number): number {
  const n = clampLevel(level);
  if (n >= MAX_LEVEL) return 0;
  const legacyNeed = LEGACY_XP_TO_NEXT[n - 1] ?? 1;
  const raw = Number.isFinite(legacyXp) ? legacyXp : 0;
  const share = Math.min(1, Math.max(0, raw / legacyNeed));
  const need = xpToNext(n);
  return Math.min(need - 1, Math.floor(share * need));
}
