import { el } from './el';
import { snapPosition, snapSize } from './grid';
import { iconUrl } from './hotbar';
// Baukasten vor hud.css: gleich spezifische Regeln aus hud.css (etwa der Innenabstand einer Tafel) gelten nur,
// wenn kit.css vorher geladen ist – auch wenn dieses Modul vor root.ts geladen wird (etwa über WorldScene).
import './kit.css';
import './hud.css';

/** So lange bleibt ein Hinweis stehen (ms). */
export const TOAST_MS = 3000;
/** Höchstens so viele Hinweise zugleich; ein weiterer verdrängt den ältesten. */
export const MAX_TOASTS = 2;

interface Shown {
  node: HTMLElement;
  timer: number;
  snapper: ResizeObserver | null;
}

/** Tafel auf ganze Bildpunkte und ganze Gerätepixel (grid.ts), sonst wird ihr Randbild unscharf. */
function snap(node: HTMLElement): void {
  snapSize(node);
  snapPosition(node);
}

/**
 * Kurze Hinweise oben in der Mitte („Aufgabe geschafft!", „Level 2!", „Hier geht es bald weiter."): eine Tafel mit
 * optionalen Symbolen (Bildnamen aus gfx/ui, etwa aus `iconFor`) und einem Satz. 3 s sichtbar, höchstens zwei
 * zugleich. Liegt als `div.toasts` direkt in der Wurzel der Oberfläche und fängt keine Zeiger ab.
 */
export class Toasts {
  private readonly element: HTMLElement;
  private readonly shown: Shown[] = [];

  constructor(root: HTMLElement) {
    this.element = el('div', 'toasts');
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    root.appendChild(this.element);
  }

  /** `icon`: ein Bildname oder mehrere (etwa alle Belohnungen einer Aufgabe). */
  show(text: string, icon?: string | readonly string[]): void {
    while (this.shown.length >= MAX_TOASTS) this.remove(this.shown[0]!);
    const node = el('div', 'toast ui-panel');
    const icons = icon === undefined ? [] : typeof icon === 'string' ? [icon] : icon;
    for (const name of icons) {
      const img = el('img', 'toast__icon');
      img.src = iconUrl(name);
      img.alt = '';
      img.draggable = false;
      node.appendChild(img);
    }
    node.appendChild(el('span', 'toast__text', text));
    this.element.appendChild(node);

    let snapper: ResizeObserver | null = null;
    snap(node);
    if (typeof ResizeObserver === 'function') {
      // neue Fenstergröße, neuer Maßstab, nachgeladene Schrift, ein Nachbar verschwindet: wieder einrasten
      snapper = new ResizeObserver(() => snap(node));
      snapper.observe(node);
      snapper.observe(this.element);
    }
    const entry: Shown = { node, snapper, timer: window.setTimeout(() => this.remove(entry), TOAST_MS) };
    this.shown.push(entry);
  }

  private remove(entry: Shown): void {
    const i = this.shown.indexOf(entry);
    if (i < 0) return;
    this.shown.splice(i, 1);
    window.clearTimeout(entry.timer);
    entry.snapper?.disconnect();
    entry.node.remove();
  }
}
