import type { InputDevice } from '../input/actions';
import type { InputHub } from '../input/hub';
import { TEXTS, type TextKey } from '../data/texts';
import { el } from './el';
import { keepSnapped } from './grid';
import { iconUrl } from './images';
import type { WindowManager } from './windows';
// Baukasten vor menu.css (gleich spezifische Regeln, siehe toasts.ts)
import './kit.css';
import './menu.css';

/** Kennung des Hilfe-Fensters. */
export const HELP_ID = 'help';

/** Bild einer Bedienung: Tasten-Bilder (gfx/ui/taste_*.png) oder ein Teil der Touch-Bedienung. */
export type HelpPicture =
  | { kind: 'keys'; keys: readonly string[]; cross?: boolean }
  | { kind: 'stick'; run: boolean }
  | { kind: 'act' }
  | { kind: 'slot' }
  | { kind: 'close' };

export interface HelpRow {
  /** Genau ein Wort (TEXTS['help.*']). */
  word: TextKey;
  picture: HelpPicture;
}

/** Breite der Tasten-Bilder in Bildpunkten (alle 13 hoch, aus Ui/Input/Keyboard). */
export const KEY_WIDTH: Readonly<Record<string, number>> = { shift: 30, esc: 18 };
const KEY_HEIGHT = 13;
const DEFAULT_KEY_WIDTH = 13;

/** Was die Hilfe je Gerät zeigt, in dieser Reihenfolge. */
export const HELP_ROWS: Readonly<Record<InputDevice, readonly HelpRow[]>> = {
  keys: [
    { word: 'help.move', picture: { kind: 'keys', keys: ['w', 'a', 's', 'd'], cross: true } },
    { word: 'help.run', picture: { kind: 'keys', keys: ['shift'] } },
    { word: 'help.talk', picture: { kind: 'keys', keys: ['e'] } },
    { word: 'help.hotbar', picture: { kind: 'keys', keys: ['1', '2', '3', '4', '5', '6', '7', '8'] } },
    { word: 'help.close', picture: { kind: 'keys', keys: ['esc'] } },
  ],
  touch: [
    { word: 'help.move', picture: { kind: 'stick', run: false } },
    { word: 'help.run', picture: { kind: 'stick', run: true } },
    { word: 'help.talk', picture: { kind: 'act' } },
    { word: 'help.hotbar', picture: { kind: 'slot' } },
    { word: 'help.close', picture: { kind: 'close' } },
  ],
};

/** Pixelbild in ganzen Bildpunkten (Breite und Höhe als Vielfache von --hud-px, siehe menu.css). */
function pixelImage(className: string, name: string, w: number, h: number): HTMLImageElement {
  const img = el('img', className);
  img.src = iconUrl(name);
  img.alt = '';
  img.draggable = false;
  img.style.setProperty('--w', String(w));
  img.style.setProperty('--h', String(h));
  return img;
}

/** Das Bild einer Zeile; nur Schmuck (das Wort daneben trägt die Bedeutung). */
function picture(p: HelpPicture): HTMLElement {
  const box = el('div', 'help__pic');
  box.setAttribute('aria-hidden', 'true');
  switch (p.kind) {
    case 'keys':
      if (p.cross) box.classList.add('help__pic--cross');
      for (const key of p.keys) {
        const img = pixelImage('help__key', `taste_${key}`, KEY_WIDTH[key] ?? DEFAULT_KEY_WIDTH, KEY_HEIGHT);
        img.dataset.key = key;
        box.appendChild(img);
      }
      break;
    case 'stick': {
      // wie der Stick der Touch-Bedienung (kit.css): Ring und Knauf; rennen = Knauf ganz am Rand
      const stick = el('div', p.run ? 'help__stick is-run' : 'help__stick');
      stick.appendChild(el('div', 'help__knob'));
      box.appendChild(stick);
      break;
    }
    case 'act': {
      // der Kontext-Knopf mit der Sprechblase
      const act = el('span', 'ui-button help__act');
      act.appendChild(pixelImage('help__icon', 'sprechblase', 14, 13));
      box.appendChild(act);
      break;
    }
    case 'slot': {
      const slot = el('span', 'ui-slot help__slot');
      slot.appendChild(pixelImage('help__icon', 'schwert', 16, 16));
      box.appendChild(slot);
      break;
    }
    case 'close':
      box.appendChild(el('span', 'ui-button help__close', '×'));
      break;
  }
  return box;
}

/** Inhalt der Hilfe für ein Gerät: je Zeile Bild und Wort. */
export function helpBody(device: InputDevice): HTMLElement {
  const body = el('div', 'help');
  body.dataset.device = device;
  for (const row of HELP_ROWS[device]) {
    const line = el('div', 'help__row');
    line.append(picture(row.picture), el('span', 'help__word', TEXTS[row.word]));
    body.appendChild(line);
  }
  return body;
}

/**
 * Fenster „Hilfe": zeigt die Bedienung des zuletzt benutzten Geräts (`input.device` beim Öffnen) als Bild mit einem
 * Wort. Ist der Inhalt höher als der Bildschirm (Handy quer), scrollt er; der Kopf mit × bleibt stehen.
 */
export class Help {
  constructor(private readonly windows: WindowManager, private readonly input: InputHub) {}

  open(): void {
    const body = helpBody(this.input.device);
    let release: (() => void) | null = null;
    this.windows.open({ id: HELP_ID, title: TEXTS['help.title'], body, onClose: () => release?.() });
    release = keepSnapped(body, () => Array.from(body.querySelectorAll<HTMLElement>('.help__pic')));
  }

  get isOpen(): boolean {
    return this.windows.openId === HELP_ID;
  }
}
