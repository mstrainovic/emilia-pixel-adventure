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
  // Anzeige und Schnellleiste (Task 6). {…} füllt fillText. Vorgelesen, nicht geschrieben, außer Menü.
  'hud.hearts': '{n} von {max} Herzen',
  'hud.level': 'Level {n}',
  'hud.coins': '{n} Münzen',
  'hud.quest': 'Aufgabe',
  'hud.menu': 'Menü',
  'hud.hotbar': 'Schnellleiste',
  'hud.slot.empty': 'Leerer Platz',
  /** Gegenstand mit unbekannter Kennung (Review Focus 5): neutral benannt, mit Beutel-Symbol. */
  'hud.slot.unknown': 'Gegenstand',
  'hud.slot.count': '{name}, {n} Stück',
  // Hinweise beim Reden im Dorf (Task 7); Level als Muster mit der neuen Zahl
  'toast.questDone': 'Aufgabe geschafft!',
  'toast.levelUp': 'Level {n}!',
  'toast.exitSoon': 'Hier geht es bald weiter.',
  // Touch-Bedienung (Task 8): vorgelesene Beschriftung des Kontext-Knopfs (ohne Ziel bzw. beim Reden), Dreh-Hinweis
  'touch.action': 'Aktion',
  'touch.talk': 'Reden',
  'rotate.hint': 'Bitte dreh das Gerät quer.',
  /** Probefenster der Browser-Tests (nur über den Test-Zugang erreichbar). */
  'test.title': 'Probefenster',
  'test.body': 'Hier steht später etwas Schönes.',
} as const satisfies { readonly [key: string]: string };

export type TextKey = keyof typeof TEXTS;

/** Text mit Platzhaltern: `{name}` wird durch `values.name` ersetzt (fehlende Werte bleiben stehen). */
export function fillText(key: TextKey, values: Readonly<Record<string, string | number>>): string {
  return TEXTS[key].replace(/\{(\w+)\}/g, (all, name: string) => (Object.hasOwn(values, name) ? String(values[name]) : all));
}

/** Hinweis für eine Handlung, passend zum zuletzt benutzten Gerät: Taste am PC, Knopf mit Touch. */
export function hint(action: 'interact' | 'close' | 'move', device: InputDevice): string {
  return TEXTS[`hint.${action}.${device}`];
}
