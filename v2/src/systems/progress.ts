// Erfahrung und Herzen als reine Funktionen über dem Spielstand.
import type { GameState } from '../core/state';
import { MAX_LEVEL, HP_PER_HEART, heartsForLevel, xpToNext } from '../core/levels';

/** Höchste Lebenspunktzahl: Herzen des Levels × 4. */
export function maxHp(state: GameState): number {
  return heartsForLevel(state.progression.level) * HP_PER_HEART;
}

/** Je Herz 0…4 Viertel; Länge = Anzahl der Herzen. Lebenspunkte werden auf 0…maxHp begrenzt. */
export function heartQuarters(state: GameState): number[] {
  const hearts = heartsForLevel(state.progression.level);
  const hp = Math.min(maxHp(state), Math.max(0, Math.floor(state.player.hp)));
  return Array.from({ length: hearts }, (_, i) => Math.min(HP_PER_HEART, Math.max(0, hp - i * HP_PER_HEART)));
}

/**
 * Gibt Erfahrung. Bei jedem Stufenaufstieg wird der Bedarf abgezogen; am Ende sind die Herzen ganz gefüllt.
 * Auf der Höchststufe bleibt `xp` 0. Negative oder nicht endliche Mengen: nichts geschieht.
 */
export function addXp(state: GameState, amount: number): { levelsGained: number } {
  if (!Number.isFinite(amount) || amount <= 0) return { levelsGained: 0 };
  const prog = state.progression;
  let levelsGained = 0;
  let xp = prog.xp + Math.floor(amount);
  while (prog.level < MAX_LEVEL && xp >= xpToNext(prog.level)) {
    xp -= xpToNext(prog.level);
    prog.level += 1;
    levelsGained += 1;
  }
  prog.xp = prog.level >= MAX_LEVEL ? 0 : xp;
  if (levelsGained > 0) state.player.hp = maxHp(state);
  return { levelsGained };
}
