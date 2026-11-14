import type { InputDevice } from '../input/actions';

/**
 * Alle Texte der Oberfläche an einer Stelle (Spec 10): echte Umlaute, feste Begriffe (Aufgabe, Erfolge, Herstellen,
 * Gegenstand, Rucksack), keine internen Kennungen. Schlüssel sind Kennungen und erscheinen nie im Bild.
 * Die genauen Schlüssel bleiben im Typ erhalten (`TEXTS['window.close']` ist ein `string`).
 */
export const TEXTS = {
  /** Vorgelesene Beschriftung des Schließen-Knopfs (das Zeichen selbst ist „×"). */
  'window.close': 'Schließen',
  'hint.interact.keys': 'Drücke E',
  'hint.interact.touch': 'Tippe auf den Knopf',
  'hint.close.keys': 'Drücke Esc',
  'hint.close.touch': 'Tippe auf das Kreuz',
  'hint.move.keys': 'Laufen mit W A S D oder den Pfeilen',
  'hint.move.touch': 'Laufen mit dem Daumen unten links',
  /** Probefenster der Browser-Tests (nur über den Test-Zugang erreichbar). */
  'test.title': 'Probefenster',
  'test.body': 'Hier steht später etwas Schönes.',
} as const satisfies { readonly [key: string]: string };

export type TextKey = keyof typeof TEXTS;

/** Hinweis für eine Handlung, passend zum zuletzt benutzten Gerät: Taste am PC, Knopf mit Touch. */
export function hint(action: 'interact' | 'close' | 'move', device: InputDevice): string {
  return TEXTS[`hint.${action}.${device}`];
}
