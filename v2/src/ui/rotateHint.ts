import { TEXTS } from '../data/texts';
import { el } from './el';
import { snapPosition, snapSize } from './grid';
import { faceUrl } from './images';
import type { WindowManager } from './windows';
// Baukasten zuerst (wie in den anderen Bausteinen): die Regeln des Dreh-Hinweises stehen in kit.css
import './kit.css';

/** Handy im Hochformat (Spec 10): Tablets sind breiter als 600 CSS-Pixel und laufen in beiden Lagen. */
export const ROTATE_QUERY = '(orientation: portrait) and (max-width: 600px) and (pointer: coarse)';
/** Grund, unter dem der Dreh-Hinweis das Spiel anhält (WindowManager.setPaused). */
export const ROTATE_REASON = 'rotate';

/**
 * Freundlicher Dreh-Hinweis über dem ganzen Bild, solange ein Handy hochkant gehalten wird; das Spiel hält so lange
 * an. Reagiert auf jede Änderung von Lage und Größe ohne Neuladen (`matchMedia`). Liegt als letztes Kind in der
 * Wurzel der Oberfläche über allem anderen und fängt alle Berührungen ab.
 */
export class RotateHint {
  private readonly element: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly query: MediaQueryList | null;
  private snapper: ResizeObserver | null = null;
  /** Ausstehendes Einrasten aus dem Beobachter (requestAnimationFrame); 0 = keins. */
  private frame = 0;

  constructor(root: HTMLElement, private readonly windows: WindowManager) {
    this.element = el('div', 'rotate-hint');
    this.element.hidden = true;
    this.element.setAttribute('role', 'alert');
    this.panel = el('div', 'rotate-hint__panel ui-panel');
    const face = faceUrl('emilia');
    if (face !== null) {
      const img = el('img', 'rotate-hint__face');
      img.src = face;
      img.alt = '';
      img.draggable = false;
      this.panel.appendChild(img);
    }
    this.panel.appendChild(el('p', 'rotate-hint__text', TEXTS['rotate.hint']));
    this.element.appendChild(this.panel);
    root.appendChild(this.element);

    this.query = typeof window.matchMedia === 'function' ? window.matchMedia(ROTATE_QUERY) : null;
    this.query?.addEventListener('change', this.update);
    this.update();
  }

  get visible(): boolean {
    return !this.element.hidden;
  }

  destroy(): void {
    this.query?.removeEventListener('change', this.update);
    this.stopSnapping();
    this.windows.setPaused(ROTATE_REASON, false);
    this.element.remove();
  }

  private readonly update = (): void => {
    const show = this.query?.matches === true;
    this.element.hidden = !show;
    this.windows.setPaused(ROTATE_REASON, show);
    this.stopSnapping();
    if (!show) return;
    // Tafel auf ganze Bildpunkte und Gerätepixel (grid.ts), auch nach Größenwechsel und Nachladen der Schrift – aus
    // dem Beobachter erst im nächsten Bild (wie windows.ts), sonst meldete der Browser „ResizeObserver loop …"
    this.snap();
    if (typeof ResizeObserver === 'function') {
      this.snapper = new ResizeObserver(() => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.snap());
      });
      this.snapper.observe(this.element);
      this.snapper.observe(this.panel);
    }
  };

  private snap(): void {
    snapSize(this.panel);
    snapPosition(this.panel);
  }

  private stopSnapping(): void {
    this.snapper?.disconnect();
    this.snapper = null;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
}
