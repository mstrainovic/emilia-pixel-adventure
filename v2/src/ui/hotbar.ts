import type { Services } from '../core/services';
import { HOTBAR_SLOTS } from '../core/state';
import { iconFor } from '../data/icons';
import { getItem } from '../data/items';
import { TEXTS, fillText } from '../data/texts';
import type { Action } from '../input/actions';
import type { InputHub } from '../input/hub';
import { hotbarSlots } from '../systems/inventory';
import { el } from './el';
import { iconUrl } from './images';
// Baukasten vor hud.css: gleich spezifische Regeln aus hud.css (etwa der Innenabstand einer Tafel) gelten nur,
// wenn kit.css vorher geladen ist – auch wenn dieses Modul vor root.ts geladen wird (etwa über WorldScene).
import './kit.css';
import './hud.css';

/** Tasten 1–8 der Reihe nach. */
const HOTBAR_ACTIONS: readonly Action[] = ['hotbar1', 'hotbar2', 'hotbar3', 'hotbar4', 'hotbar5', 'hotbar6', 'hotbar7', 'hotbar8'];

interface SlotView {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  count: HTMLElement;
}

/**
 * Die Schnellleiste unten Mitte: acht Plätze mit Symbol und (ab 2) Anzahl; der gewählte trägt `.is-selected`.
 * Tasten 1–8 (über `handleInput`), Klick und Tastatur (Tab, Enter) wählen. Liegt als `div.hotbar` direkt in der
 * Wurzel der Oberfläche und zeichnet nur bei `inventory:changed` neu.
 */
export class Hotbar {
  private readonly element: HTMLElement;
  private readonly slots: SlotView[] = [];
  private readonly unsubscribe: () => void;

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
      button.addEventListener('click', () => services.session.selectHotbar(i));
      this.slots.push({ button, icon, count });
      this.element.appendChild(button);
    }
    root.appendChild(this.element);
    this.unsubscribe = services.bus.on('inventory:changed', () => this.refresh());
    this.refresh();
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
      const isSelected = i === selected;
      view.button.classList.toggle('is-selected', isSelected);
      view.button.setAttribute('aria-pressed', String(isSelected));
    });
  }

  destroy(): void {
    this.unsubscribe();
    this.element.remove();
  }
}
