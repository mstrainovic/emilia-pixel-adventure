import type { Services } from '../core/services';
import { HOTBAR_SLOTS } from '../core/state';
import { iconFor } from '../data/icons';
import { getItem } from '../data/items';
import { TEXTS, fillText } from '../data/texts';
import type { Action } from '../input/actions';
import type { InputHub } from '../input/hub';
import { hotbarSlots } from '../systems/inventory';
import { el } from './el';
import { snapPosition, snapSize } from './grid';
import { iconUrl } from './images';
// Baukasten vor hud.css: gleich spezifische Regeln aus hud.css (etwa der Innenabstand einer Tafel) gelten nur,
// wenn kit.css vorher geladen ist – auch wenn dieses Modul vor root.ts geladen wird (etwa über WorldScene).
import './kit.css';
import './hud.css';

/** Tasten 1–8 der Reihe nach. */
const HOTBAR_ACTIONS: readonly Action[] = ['hotbar1', 'hotbar2', 'hotbar3', 'hotbar4', 'hotbar5', 'hotbar6', 'hotbar7', 'hotbar8'];

/** So lange (ms) auf einen Platz drücken, bis der Name des Gegenstands erscheint (Touch). */
export const LONG_PRESS_MS = 500;
/** So lange (ms) bleibt der Name stehen. */
export const NAME_SHOW_MS = 2000;
/** Rutscht der Finger weiter (CSS-Pixel), ist es kein langes Drücken. */
const LONG_PRESS_SLOP = 10;

interface SlotView {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  count: HTMLElement;
  /** Name des Gegenstands für das lange Drücken; `null` bei leerem Platz. */
  name: string | null;
}

/** Ein laufendes Drücken auf einen Platz (Touch). */
interface Press {
  pointerId: number;
  x: number;
  y: number;
  timer: number;
}

/**
 * Die Schnellleiste unten Mitte: acht Plätze mit Symbol und (ab 2) Anzahl; der gewählte trägt `.is-selected`.
 * Tasten 1–8 (über `handleInput`), Klick, Tippen und Tastatur (Tab, Enter) wählen. Mit dem Finger zeigt langes
 * Drücken (500 ms) den Namen des Gegenstands 2 s lang über dem Platz und wählt nicht. Liegt als `div.hotbar` direkt
 * in der Wurzel der Oberfläche und zeichnet nur bei `inventory:changed` neu.
 */
export class Hotbar {
  private readonly element: HTMLElement;
  private readonly slots: SlotView[] = [];
  private readonly unsubscribe: () => void;
  /** Name über dem Platz (langes Drücken): Hülle und Tafel. */
  private readonly tip: HTMLElement;
  private readonly tipBox: HTMLElement;
  private tipTimer = 0;
  private press: Press | null = null;
  /** Nach einem langen Drücken: der Klick beim Abheben wählt nicht. */
  private swallowClick = false;

  constructor(root: HTMLElement, private readonly services: Services) {
    this.element = el('div', 'hotbar');
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', TEXTS['hud.hotbar']);
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const button = el('button', 'ui-slot');
      button.type = 'button';
      button.dataset.slot = String(i);
      const icon = el('img', 'hotbar__icon');
      icon.alt = '';
      icon.draggable = false;
      const count = el('span', 'hotbar__count');
      count.setAttribute('aria-hidden', 'true');
      button.append(icon, count);
      // Zeiger-Klick gibt den Fokus danach ab (UiRoot), Enter auf dem fokussierten Platz wählt ebenso
      button.addEventListener('click', () => {
        if (this.swallowClick) {
          this.swallowClick = false;
          return;
        }
        services.session.selectHotbar(i);
      });
      button.addEventListener('pointerdown', (e) => this.startPress(e, i));
      this.slots.push({ button, icon, count, name: null });
      this.element.appendChild(button);
    }
    this.tip = el('div', 'hotbar__tip');
    this.tip.hidden = true;
    this.tip.setAttribute('role', 'status');
    this.tipBox = el('p', 'hotbar__tip-box ui-panel');
    this.tip.appendChild(this.tipBox);
    this.element.appendChild(this.tip);
    window.addEventListener('pointermove', this.movePress);
    window.addEventListener('pointerup', this.endPress);
    window.addEventListener('pointercancel', this.endPress);
    root.appendChild(this.element);
    this.unsubscribe = services.bus.on('inventory:changed', () => this.refresh());
    this.refresh();
  }

  /** Langes Drücken beginnt (nur Finger und Stift; die Maus zeigt den Namen über `title`). */
  private startPress(e: PointerEvent, index: number): void {
    this.swallowClick = false;
    this.cancelPress();
    if (e.pointerType === 'mouse') return;
    const timer = window.setTimeout(() => {
      this.press = null;
      const name = this.slots[index]?.name ?? null;
      if (name === null) return;
      this.swallowClick = true;
      this.showName(index, name);
    }, LONG_PRESS_MS);
    this.press = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, timer };
  }

  private readonly movePress = (e: PointerEvent): void => {
    const p = this.press;
    if (p && p.pointerId === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > LONG_PRESS_SLOP) this.cancelPress();
  };

  private readonly endPress = (e: PointerEvent): void => {
    if (this.press?.pointerId === e.pointerId) this.cancelPress();
  };

  private cancelPress(): void {
    if (this.press) window.clearTimeout(this.press.timer);
    this.press = null;
  }

  /** Name über dem Platz, 2 s lang; die Tafel auf ganzen Bildpunkten (grid.ts). */
  private showName(index: number, name: string): void {
    const slot = this.slots[index]!.button;
    this.tipBox.textContent = name;
    this.tip.style.left = `${slot.offsetLeft + slot.offsetWidth / 2}px`;
    this.tip.hidden = false;
    snapSize(this.tipBox);
    snapPosition(this.tipBox);
    window.clearTimeout(this.tipTimer);
    this.tipTimer = window.setTimeout(() => { this.tip.hidden = true; }, NAME_SHOW_MS);
  }

  /** Tasten 1–8: in WorldScene.update gleich nach `windows.handleInput`, nur wenn das Spiel nicht angehalten ist. */
  handleInput(input: InputHub): void {
    HOTBAR_ACTIONS.forEach((action, i) => {
      if (input.consume(action)) this.services.session.selectHotbar(i);
    });
  }

  refresh(): void {
    const { state } = this.services;
    const selected = state.inventory.selectedHotbar;
    const contents = hotbarSlots(state);
    this.slots.forEach((view, i) => {
      const slot = contents[i];
      const itemId = slot?.itemId ?? null;
      // eine Kennung, die es in den Daten nicht gibt: Beutel und „Gegenstand" statt eines leeren Platzes
      const name = itemId === null ? null : getItem(itemId)?.name ?? TEXTS['hud.slot.unknown'];
      const amount = name !== null ? slot!.count : 0;
      if (itemId !== null) {
        const src = iconUrl(iconFor(itemId));
        if (view.icon.getAttribute('src') !== src) view.icon.src = src;
        view.icon.hidden = false;
      } else {
        view.icon.removeAttribute('src');
        view.icon.hidden = true;
      }
      view.count.textContent = amount >= 2 ? String(amount) : '';
      const label = name === null ? TEXTS['hud.slot.empty'] : amount >= 2 ? fillText('hud.slot.count', { name, n: amount }) : name;
      view.button.setAttribute('aria-label', label);
      view.button.title = name ?? TEXTS['hud.slot.empty'];
      view.name = name;
      const isSelected = i === selected;
      view.button.classList.toggle('is-selected', isSelected);
      view.button.setAttribute('aria-pressed', String(isSelected));
    });
  }

  destroy(): void {
    this.unsubscribe();
    this.cancelPress();
    window.clearTimeout(this.tipTimer);
    window.removeEventListener('pointermove', this.movePress);
    window.removeEventListener('pointerup', this.endPress);
    window.removeEventListener('pointercancel', this.endPress);
    this.element.remove();
  }
}
