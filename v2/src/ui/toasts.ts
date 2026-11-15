import { el } from './el';
import { snapPosition, snapSize } from './grid';
import { iconUrl } from './images';
// Baukasten vor hud.css: gleich spezifische Regeln aus hud.css (etwa der Innenabstand einer Tafel) gelten nur,
// wenn kit.css vorher geladen ist – auch wenn dieses Modul vor root.ts geladen wird (etwa über WorldScene).
import './kit.css';
import './hud.css';

/** Kürzeste Dauer eines Hinweises (ms). */
export const TOAST_MIN_MS = 5000;
/** Dauer eines Hinweises: Grundzeit plus Zeit je Wort (ms); Leseanfänger lesen etwa ein Wort je Sekunde. */
const TOAST_BASE_MS = 4000;
const TOAST_PER_WORD_MS = 600;
/** Höchstens so viele Hinweise zugleich; ein weiterer verdrängt den ältesten, aber erst, wenn der MIN_SHOWN_MS stand. */
export const MAX_TOASTS = 2;
/** So lange steht ein Hinweis mindestens, bevor ein neuer ihn verdrängen darf (ms). */
export const MIN_SHOWN_MS = 3000;

/** Wie lange ein Hinweis stehen bleibt (ms): max(5 s, 4 s + 0,6 s je Wort). */
export function toastDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter((w) => w !== '').length;
  return Math.max(TOAST_MIN_MS, TOAST_BASE_MS + TOAST_PER_WORD_MS * words);
}

/**
 * Wie lange (ms) ein neuer Hinweis warten muss: 0, wenn ein Platz frei ist oder der älteste schon MIN_SHOWN_MS steht
 * (dann verdrängt er ihn); sonst bis dahin. `shownSince`: Zeitpunkte, seit denen die gezeigten stehen, ältester zuerst.
 */
export function displaceDelay(shownSince: readonly number[], now: number): number {
  if (shownSince.length < MAX_TOASTS) return 0;
  return Math.max(0, (shownSince[0] ?? now) + MIN_SHOWN_MS - now);
}

interface Shown {
  node: HTMLElement;
  /** Seit wann er steht (performance.now). */
  since: number;
  timer: number;
  snapper: ResizeObserver | null;
  /** Ausstehendes Einrasten aus dem Beobachter (requestAnimationFrame); 0 = keins. */
  frame: number;
}

/** Tafel auf ganze Bildpunkte und ganze Gerätepixel (grid.ts), sonst wird ihr Randbild unscharf. */
function snap(node: HTMLElement): void {
  snapSize(node);
  snapPosition(node);
}

/**
 * Kurze Hinweise oben in der Mitte („Aufgabe geschafft!", „Level 2!", „Hier geht es bald weiter."): eine Tafel mit
 * optionalen Symbolen (Bildnamen aus gfx/ui, etwa aus `iconFor`) und einem Satz. Sichtbar je nach Länge
 * (toastDuration), höchstens zwei zugleich; ein dritter wartet, bis der älteste 3 s stand, und verdrängt ihn dann
 * (displaceDelay) – so verschwindet keiner, bevor man ihn lesen konnte. Liegt als `div.toasts` direkt in der Wurzel
 * der Oberfläche und fängt keine Zeiger ab.
 */
export class Toasts {
  private readonly element: HTMLElement;
  private readonly shown: Shown[] = [];
  /** Hinweise, die auf einen Platz warten, in der Reihenfolge ihres Eintreffens. */
  private readonly waiting: Array<{ text: string; icons: readonly string[] }> = [];
  private waitTimer = 0;

  constructor(root: HTMLElement) {
    this.element = el('div', 'toasts');
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    root.appendChild(this.element);
  }

  /** `icon`: ein Bildname oder mehrere (etwa alle Belohnungen einer Aufgabe). */
  show(text: string, icon?: string | readonly string[]): void {
    const icons = icon === undefined ? [] : typeof icon === 'string' ? [icon] : icon;
    this.waiting.push({ text, icons });
    this.next();
  }

  /** Zeigt wartende Hinweise, solange es geht; sonst wieder versuchen, sobald der älteste lange genug stand. */
  private next(): void {
    window.clearTimeout(this.waitTimer);
    this.waitTimer = 0;
    while (this.waiting.length > 0) {
      const delay = displaceDelay(this.shown.map((s) => s.since), performance.now());
      if (delay > 0) {
        this.waitTimer = window.setTimeout(() => this.next(), delay);
        return;
      }
      if (this.shown.length >= MAX_TOASTS) this.remove(this.shown[0]!, false);
      const { text, icons } = this.waiting.shift()!;
      this.display(text, icons);
    }
  }

  private display(text: string, icons: readonly string[]): void {
    const node = el('div', 'toast ui-panel');
    for (const name of icons) {
      const img = el('img', 'toast__icon');
      img.src = iconUrl(name);
      img.alt = '';
      img.draggable = false;
      node.appendChild(img);
    }
    node.appendChild(el('span', 'toast__text', text));
    this.element.appendChild(node);

    snap(node);
    const entry: Shown = {
      node, since: performance.now(), snapper: null, frame: 0,
      timer: window.setTimeout(() => this.remove(entry, true), toastDuration(text)),
    };
    if (typeof ResizeObserver === 'function') {
      // neue Fenstergröße, neuer Maßstab, nachgeladene Schrift, ein Nachbar verschwindet: wieder einrasten – erst im
      // nächsten Bild, wie in windows.ts. Im Rückruf selbst änderte das Einrasten die Größe des beobachteten Elements,
      // und der Browser meldete „ResizeObserver loop …" (gemessen bei einem Hinweis gleich beim Start, Task 10).
      entry.snapper = new ResizeObserver(() => {
        cancelAnimationFrame(entry.frame);
        entry.frame = requestAnimationFrame(() => snap(node));
      });
      entry.snapper.observe(node);
      entry.snapper.observe(this.element);
    }
    this.shown.push(entry);
  }

  /** `expired`: seine Zeit ist um (dann darf ein wartender nachrücken). */
  private remove(entry: Shown, expired: boolean): void {
    const i = this.shown.indexOf(entry);
    if (i < 0) return;
    this.shown.splice(i, 1);
    window.clearTimeout(entry.timer);
    entry.snapper?.disconnect();
    cancelAnimationFrame(entry.frame);
    entry.node.remove();
    if (expired) this.next();
  }
}
