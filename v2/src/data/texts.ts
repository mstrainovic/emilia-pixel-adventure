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
  'hint.interact.touch': 'Tippe auf den Knopf unten rechts',
  'hint.close.keys': 'Drücke Esc',
  'hint.close.touch': 'Tippe auf das Kreuz',
  'hint.move.keys': 'Laufen mit W A S D oder den Pfeiltasten',
  'hint.move.touch': 'Laufen mit dem Daumen unten links',
  // Anzeige und Schnellleiste (Task 6). {…} füllt fillText. Vorgelesen, nicht geschrieben, außer Menü.
  'hud.hearts': '{n} von {max} Herzen',
  'hud.level': 'Level {n}',
  /** Sichtbares Wort vor der Zahl des Levels (Fix-Welle F12). */
  'hud.levelWord': 'Level',
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
  'rotate.hint': 'Bitte dreh das Handy quer.',
  // Menü und Hilfe (Task 9): je Bedienung ein Bild und genau ein Wort
  'menu.title': 'Menü',
  'menu.help': 'Hilfe',
  'help.title': 'Hilfe',
  'help.move': 'laufen',
  'help.run': 'rennen',
  'help.talk': 'reden',
  'help.hotbar': 'wählen',
  'help.menu': 'Menü',
  'help.close': 'schließen',
  // Hinweise beim Start (Fenster „Hinweis" mit „Okay"), je Wert von StartNotice
  'notice.title': 'Hinweis',
  'notice.ok': 'Okay',
  'notice.save-corrupt': 'Dein Spielstand war kaputt. Wir fangen neu an.',
  'notice.save-corrupt-legacy': 'Dein Spielstand war kaputt. Wir nehmen den Spielstand aus dem alten Spiel.',
  'notice.save-repaired': 'Dein Spielstand war kaputt. Wir haben ihn repariert. Vielleicht fehlt etwas.',
  'notice.save-newer': 'Dein Spielstand ist neuer als diese Seite. Bitte lade die Seite neu.',
  'notice.storage-unavailable': 'Das Spiel kann hier nicht speichern. Beim nächsten Mal fängst du neu an.',
  'notice.legacy-imported': 'Dein Spielstand aus dem alten Spiel ist da!',
  'notice.legacy-failed': 'Den alten Spielstand konnten wir nicht holen. Du spielst mit deinem weiter.',
  /** Knopf, der die Seite neu lädt (anderer Tab, neuerer Spielstand). */
  'notice.reload': 'Neu laden',
  // Fenster beim Speichern (Fix-Welle F1, F2) und die Marke in der Anzeige, solange nicht gespeichert wird
  'save.failed': 'Speichern klappt gerade nicht. Sichere den Spielstand im Menü.',
  'save.otherTab': 'Das Spiel ist zweimal offen. Hier wird nicht gespeichert. Schließ das andere und lade neu.',
  'hud.unsaved': 'Nicht gespeichert',
  // Frage beim Start, wenn im alten Spiel weitergespielt wurde (Spec 11.1, „Übergangszeit")
  'legacy.question': 'Im alten Spiel bist du weiter. Diesen Spielstand holen? Der jetzige wird ersetzt.',
  'legacy.title': 'Alter Spielstand',
  'legacy.yes': 'Ja',
  'legacy.no': 'Nein',
  // Sicherung als Datei (Task 10): zwei Knöpfe im Menü, Hinweise, Rückfrage vor dem Laden, Erinnerung
  'menu.saveExport': 'Spielstand sichern',
  'menu.saveImport': 'Spielstand laden',
  'backup.saved': 'Datei ist fertig. Sie liegt bei den Downloads.',
  'backup.unfit': 'Das ist keine Spielstand-Datei.',
  'backup.title': 'Spielstand laden?',
  'backup.question': 'Diesen Spielstand laden? Der jetzige wird ersetzt.',
  'backup.yes': 'Ja',
  'backup.no': 'Nein',
  'backup.remind': 'Zeit zum Sichern! Öffne das Menü und wähle „Spielstand sichern“.',
  // Erinnerung beim Start als Fenster (Fix-Welle F4): ohne den zweiten Satz, dafür der Knopf „Jetzt sichern"
  'backup.remindWindow': 'Zeit zum Sichern!',
  'backup.now': 'Jetzt sichern',
  'backup.later': 'Später',
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
