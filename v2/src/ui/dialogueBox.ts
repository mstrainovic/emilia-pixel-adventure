import type { Services } from '../core/services';
import type { TalkView } from '../core/session';
import { el } from './el';
import { snapPosition, snapSize } from './grid';
import type { WindowManager } from './windows';
// Baukasten vor hud.css: gleich spezifische Regeln aus hud.css (etwa der Innenabstand einer Tafel) gelten nur,
// wenn kit.css vorher geladen ist – auch wenn dieses Modul vor root.ts geladen wird (etwa über WorldScene).
import './kit.css';
import './hud.css';

/** Grund, unter dem ein offenes Gespräch das Spiel anhält (WindowManager.setPaused). */
export const DIALOGUE_REASON = 'dialogue';

/** Tafel auf ganze Bildpunkte und ganze Gerätepixel (grid.ts), sonst wird ihr Randbild unscharf. */
function snap(box: HTMLElement): void {
  snapSize(box);
  snapPosition(box);
}

/**
 * Das Gesprächsfeld (Spec 6.7, „Tod der Dialogwand"): unten Mitte über der Schnellleiste, links das Gesicht, daneben
 * der Name und darunter der eine Satz in höchstens zwei Zeilen. Es wächst nach oben und schneidet nie Text ab.
 * Kein Fenster (keine Abdunklung, nichts wird `inert`), hält das Spiel aber an, solange es offen ist. Geschlossen wird
 * es von der Welt-Szene (E, Leertaste, Enter, Esc) oder per Tippen/Klick auf das Feld (`hide`).
 */
export class DialogueBox {
  private readonly element: HTMLElement;
  private readonly box: HTMLElement;
  private readonly face: HTMLImageElement;
  private readonly name: HTMLElement;
  private readonly lines: HTMLElement;
  private open = false;
  private snapper: ResizeObserver | null = null;
  /** Ausstehendes Einrasten aus dem Beobachter (requestAnimationFrame); 0 = keins. */
  private frame = 0;

  constructor(root: HTMLElement, private readonly services: Services, private readonly windows: WindowManager) {
    this.element = el('div', 'dialogue');
    this.element.hidden = true;
    this.box = el('section', 'dialogue__box ui-panel');
    this.box.setAttribute('aria-live', 'polite');
    this.face = el('img', 'dialogue__face');
    this.face.alt = '';
    this.face.draggable = false;
    const text = el('div', 'dialogue__text');
    this.name = el('p', 'dialogue__name');
    this.lines = el('p', 'dialogue__lines');
    text.append(this.name, this.lines);
    this.box.append(this.face, text);
    this.element.appendChild(this.box);
    // Tippen oder Klicken auf das Feld schließt es (Task 8 schließt zusätzlich per Tippen ins Spielbild)
    this.box.addEventListener('click', () => this.hide());
    root.appendChild(this.element);
  }

  /** Zeigt das Gespräch, hält das Spiel an und lässt alle Tasten los (nichts klebt). */
  show(view: TalkView, faceImage: string): void {
    this.name.textContent = view.name;
    this.lines.replaceChildren(...view.lines.map((line) => el('span', 'dialogue__line', line)));
    this.face.hidden = faceImage === '';
    if (faceImage !== '' && this.face.getAttribute('src') !== faceImage) this.face.src = faceImage;
    this.element.hidden = false;
    this.box.setAttribute('aria-label', view.name);
    this.open = true;
    this.windows.setPaused(DIALOGUE_REASON, true);
    this.services.input.reset();
    this.stopSnapping();
    snap(this.box);
    if (typeof ResizeObserver === 'function') {
      // neue Fenstergröße, neuer Maßstab, nachgeladene Schrift: wieder einrasten – erst im nächsten Bild (wie
      // windows.ts): im Rückruf selbst änderte das Einrasten die Größe des beobachteten Felds („ResizeObserver loop …")
      this.snapper = new ResizeObserver(() => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => snap(this.box));
      });
      this.snapper.observe(this.box);
      this.snapper.observe(this.element);
    }
  }

  /** Schließt das Gespräch und lässt das Spiel weiterlaufen (sofern nichts anderes anhält). */
  hide(): void {
    if (!this.open) return;
    this.open = false;
    this.stopSnapping();
    this.element.hidden = true;
    this.windows.setPaused(DIALOGUE_REASON, false);
  }

  private stopSnapping(): void {
    this.snapper?.disconnect();
    this.snapper = null;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  get isOpen(): boolean {
    return this.open;
  }
}
