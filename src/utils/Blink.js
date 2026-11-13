/**
 * Blink-Sichtbarkeit fuer Treffer-/Todes-Flackern.
 * Ist der Timer abgelaufen (<= 0), ist die Figur immer sichtbar
 * (ein leicht negativer Timer darf sie nicht unsichtbar lassen).
 */
export function blinkVisible(timerSeconds, hz) {
  if (timerSeconds <= 0) return true;
  return Math.floor(timerSeconds * hz) % 2 === 0;
}
