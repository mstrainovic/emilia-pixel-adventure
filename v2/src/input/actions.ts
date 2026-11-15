/** Einmalige Handlungen, unabhängig davon, ob Taste oder Berührung sie auslöst. */
export type Action =
  | 'interact'
  | 'confirm'
  | 'cancel'
  | 'menu'
  | 'help'
  /** Bildraten-Anzeige ein- und ausblenden (Spec 9). */
  | 'fps'
  | 'hotbar1'
  | 'hotbar2'
  | 'hotbar3'
  | 'hotbar4'
  | 'hotbar5'
  | 'hotbar6'
  | 'hotbar7'
  | 'hotbar8';

export type InputDevice = 'keys' | 'touch';

/** Eine Eingabequelle (Tastatur jetzt, Berührung in Plan 1b). */
export interface InputSource {
  readonly device: InputDevice;
  readonly move: { x: number; y: number };
  readonly run: boolean;
  /** Liefert die seit dem letzten Aufruf neu gedrückten Handlungen und leert die Liste. */
  drainPressed(): Action[];
  /** Lässt alles los und verwirft offene Drücke. */
  reset(): void;
}
