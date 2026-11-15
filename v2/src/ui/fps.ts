import { el } from './el';
// Baukasten vor menu.css (gleich spezifische Regeln, siehe toasts.ts)
import './kit.css';
import './menu.css';

/** So oft (in Sekunden) wird die Zahl neu geschrieben: selten genug, dass nicht jedes Bild Layout-Arbeit macht. */
export const FPS_UPDATE_S = 0.5;

/**
 * Bildraten-Anzeige (Spec 9): oben in der Mitte die Bilder je Sekunde in der Ziffernschrift, aus beim Start, mit F2
 * (Handlung `fps`) ein und aus. Die Welt-Szene meldet jedes Bild mit `frame(dt)`; gezählt wird nur, solange sie
 * sichtbar ist. Fängt keine Zeiger ab und wird nicht vorgelesen (für die Messung durch Erwachsene).
 */
export class FpsMeter {
  private readonly element: HTMLElement;
  private frames = 0;
  private elapsed = 0;

  constructor(root: HTMLElement) {
    this.element = el('div', 'fps');
    this.element.hidden = true;
    this.element.setAttribute('aria-hidden', 'true');
    root.appendChild(this.element);
  }

  get visible(): boolean {
    return !this.element.hidden;
  }

  toggle(): void {
    this.element.hidden = !this.element.hidden;
    this.frames = 0;
    this.elapsed = 0;
    if (!this.element.hidden) this.element.textContent = '';
  }

  /** Ein gezeichnetes Bild mit seiner Dauer in Sekunden. */
  frame(dt: number): void {
    if (this.element.hidden || !Number.isFinite(dt) || dt <= 0) return;
    this.frames += 1;
    this.elapsed += dt;
    if (this.elapsed < FPS_UPDATE_S) return;
    const text = String(Math.round(this.frames / this.elapsed));
    if (this.element.textContent !== text) this.element.textContent = text;
    this.frames = 0;
    this.elapsed = 0;
  }
}
