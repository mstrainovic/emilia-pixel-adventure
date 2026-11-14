// Spieltag-Uhr als reine Funktion über dem Spielstand: vier Phasen zu je 187,5 s, ein Spieltag = 750 s.
// Alt: src/systems/DayNight.js — PHASE_DURATION = 187.5, Phasen morning/day/evening/night, Start in Phase 1.
import type { GameState } from '../core/state';

export const PHASE_SECONDS = 187.5;
export const DAY_SECONDS = 750;
const PHASE_COUNT = 4;
/** Längster Schritt je Aufruf: ein Ruckler oder ein versteckter Tab springt nicht durch den Tag. */
const MAX_STEP = 1;

/** Rückt die Uhr um `dt` Sekunden vor (auf 0…1 begrenzt; ungültige Werte zählen nicht). Die Gesamtzeit wächst nur. */
export function advanceClock(state: GameState, dt: number): void {
  if (!(dt > 0)) return;   // trifft auch NaN
  const step = Math.min(dt, MAX_STEP);
  const clock = state.dayNight;
  clock.totalTime += step;
  clock.phaseTime += step;
  while (clock.phaseTime >= PHASE_SECONDS) {
    clock.phaseTime -= PHASE_SECONDS;
    clock.phaseIndex = (clock.phaseIndex + 1) % PHASE_COUNT;
  }
}

/** Nummer des Spieltags, ab 0. */
export function dayNumber(state: GameState): number {
  return Math.floor(state.dayNight.totalTime / DAY_SECONDS);
}
