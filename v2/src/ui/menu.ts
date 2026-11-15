import type { InputHub } from '../input/hub';
import { TEXTS } from '../data/texts';
import { el } from './el';
import { keepSnapped } from './grid';
import type { WindowManager } from './windows';
import { HELP_ID } from './help';
// Baukasten vor menu.css (gleich spezifische Regeln, siehe toasts.ts)
import './kit.css';
import './menu.css';

/** Kennung des Menü-Fensters. */
export const MENU_ID = 'menu';

/** Ein Knopf im Menü. */
export interface MenuEntry {
  /** Kennung (steht als `data-menu` am Knopf, nie im Bild). */
  id: string;
  /** Beschriftung aus TEXTS. */
  label: string;
  /** Läuft beim Drücken; öffnet meist ein eigenes Fenster (das ersetzt das Menü) oder schließt es mit `windows.close()`. */
  onSelect: () => void;
}

/**
 * Fenster „Menü" mit großen Knöpfen, einer je Eintrag in der Reihenfolge von `add` (diese Etappe: „Hilfe"; Task 10
 * fügt „Spielstand sichern" und „Spielstand laden" hinzu). Die Knöpfe entstehen bei jedem Öffnen neu.
 */
export class Menu {
  private readonly entries: MenuEntry[] = [];

  constructor(private readonly windows: WindowManager) {}

  /** Hängt einen Knopf an; eine schon vergebene Kennung ersetzt den alten Eintrag an seiner Stelle. */
  add(entry: MenuEntry): void {
    const i = this.entries.findIndex((e) => e.id === entry.id);
    if (i >= 0) this.entries[i] = entry;
    else this.entries.push(entry);
  }

  open(): void {
    const body = el('div', 'menu');
    for (const entry of this.entries) {
      const button = el('button', 'ui-button menu__button', entry.label);
      button.type = 'button';
      button.dataset.menu = entry.id;
      button.addEventListener('click', () => entry.onSelect());
      body.appendChild(button);
    }
    let release: (() => void) | null = null;
    this.windows.open({ id: MENU_ID, title: TEXTS['menu.title'], body, onClose: () => release?.() });
    release = keepSnapped(body, () => Array.from(body.querySelectorAll<HTMLElement>('.menu__button')));
  }

  get isOpen(): boolean {
    return this.windows.openId === MENU_ID;
  }
}

/** Was `handleMenuKeys` öffnen kann (Hilfe, help.ts). */
export interface Openable {
  open(): void;
}

/**
 * Teil von Schritt 3 der Reihenfolge je Bild (WorldScene.update), wenn kein Gespräch offen ist: nimmt `menu` (M) und
 * `help` (H) ab. Ohne Fenster öffnen sie Menü bzw. Hilfe, aber nicht, solange das Spiel aus anderem Grund angehalten
 * ist (Dreh-Hinweis). Ist Menü oder Hilfe offen, schließt dieselbe Taste das Fenster wieder, die andere wechselt.
 * Bei jedem anderen Fenster (Hinweis, Frage) werden die Drücke verworfen.
 */
export function handleMenuKeys(input: InputHub, windows: WindowManager, menu: Openable, help: Openable): void {
  const m = input.consume('menu');
  const h = input.consume('help');
  if (!m && !h) return;
  const open = windows.openId;
  if (open === null) {
    if (windows.paused) return;
    if (h) help.open();
    else menu.open();
    return;
  }
  if (open !== MENU_ID && open !== HELP_ID) return;
  if ((m && open === MENU_ID) || (h && open === HELP_ID)) windows.close();
  else if (h) help.open();
  else menu.open();
}
