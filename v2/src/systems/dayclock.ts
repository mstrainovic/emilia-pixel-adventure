// Spieltag-Uhr als reine Funktion über dem Spielstand: vier Phasen zu je 187,5 s, ein Spieltag = 750 s.
// Alt: src/systems/DayNight.js — PHASE_DURATION = 187.5, Phasen morning/day/evening/night, Start in Phase 1.
import type { GameState } from '../core/state';

export const PHASE_SECONDS = 187.5;
export const DAY_SECONDS = 750;
const PHASE_COUNT = 4;
/** Phase eines neuen Spiels (createNewGameState); gilt auch, wenn die gespeicherte keine Zahl ist. */
const START_PHASE = 1;
/** Längster Schritt je Aufruf: ein Ruckler oder ein versteckter Tab springt nicht durch den Tag. */
const MAX_STEP = 1;

type Clock = GameState['dayNight'];

/**
 * Uhr im gültigen Bereich (Fix-Welle F7): `totalTime` endlich und ≥ 0 (sonst 0), `phaseIndex` ganzzahlig 0…3 (Rest
 * der Division, keine Zahl → Startphase), `phaseTime` 0 bis unter 187,5 (Rest der Division, keine Zahl → 0).
 * Gültige Werte bleiben genau, wie sie sind. Ohne Schleife: auch 1e12 kostet nichts.
 */
export function normalizeClock(clock: Clock): Clock {
  const { totalTime, phaseIndex, phaseTime } = clock;
  const index = Number.isFinite(phaseIndex) ? Math.floor(phaseIndex) : START_PHASE;
  const time = Number.isFinite(phaseTime) ? phaseTime % PHASE_SECONDS : 0;
  return {
    totalTime: Number.isFinite(totalTime) && totalTime > 0 ? totalTime : 0,
    phaseIndex: ((index % PHASE_COUNT) + PHASE_COUNT) % PHASE_COUNT,
    phaseTime: time < 0 ? time + PHASE_SECONDS : time,
  };
}

/** Rückt die Uhr um `dt` Sekunden vor (auf 0…1 begrenzt; ungültige Werte zählen nicht). Die Gesamtzeit wächst nur. */
export function advanceClock(state: GameState, dt: number): void {
  if (!(dt > 0)) return;   // trifft auch NaN
  const step = Math.min(dt, MAX_STEP);
  // eine kaputte Uhr (etwa von außen gesetzt) erst in den gültigen Bereich holen: so hängt die Rechnung nie
  const clock = Object.assign(state.dayNight, normalizeClock(state.dayNight));
  clock.totalTime += step;
  clock.phaseTime += step;
  if (clock.phaseTime >= PHASE_SECONDS) {
    const passed = Math.floor(clock.phaseTime / PHASE_SECONDS);
    clock.phaseTime -= passed * PHASE_SECONDS;
    clock.phaseIndex = (clock.phaseIndex + passed) % PHASE_COUNT;
  }
}

/** Nummer des Spieltags, ab 0. */
export function dayNumber(state: GameState): number {
  return Math.floor(state.dayNight.totalTime / DAY_SECONDS);
}
