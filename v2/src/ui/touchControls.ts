import type { Services } from '../core/services';
import { TEXTS } from '../data/texts';
import { STICK_RADIUS, stickVector, type TouchSource } from '../input/touch';
import type { ContextTarget } from '../systems/interaction';
import { el } from './el';
import { snapPosition, snapSize } from './grid';
import { iconUrl } from './images';
// Baukasten zuerst (wie in den anderen Bausteinen): die Regeln der Touch-Bedienung stehen in kit.css
import './kit.css';

/**
 * Touch-Bedienung (Spec 10, Plan 1b Task 8): unten links ein schwebender Stick, unten rechts der Kontext-Knopf.
 * Der Menü-Knopf ist der der Anzeige (`.hud-menu`), es gibt keinen zweiten.
 *
 * - Die Stick-Zone (`div.touch-zone`, linke untere Fläche) nimmt immer Berührungen an, auch vor der ersten, damit
 *   schon der erste Daumen steuert. Der Stick erscheint dort, wo er aufsetzt, und gehört genau diesem Finger;
 *   `pointerup`, `pointercancel` und `lostpointercapture` lassen ihn los, ebenso das Anhalten des Spiels (Fenster,
 *   Gespräch, Dreh-Hinweis): sonst liefe Emilia danach weiter. Die Maus steuert den Stick nicht.
 * - Der Kontext-Knopf löst `interact` beim Aufsetzen aus (auch mit einem zweiten Finger, während der erste steuert;
 *   ein Klick käme dann nicht). Er zeigt die Sprechblase, wenn er ein Gespräch beginnt, und ist ohne Ziel blass.
 * - Ist ein Gespräch offen, schließt Tippen ins Spielbild oder in die Stick-Zone es (der Knopf schließt es über
 *   `interact`, das Feld selbst über seinen Klick, dialogueBox.ts).
 * - Gerät: Die erste Berührung (`pointerType 'touch'`) zeigt Stick und Knopf, der nächste Tastendruck blendet sie aus
 *   (`InputHub.noteDevice`). Ein Mausklick ändert das Gerät nicht.
 *
 * Die Zone liegt als erstes Kind in der Wurzel der Oberfläche (unter Anzeige und Schnellleiste, die ihre Tippflächen
 * behalten), der Knopf als eigenes Kind darüber; bei offenem Fenster sind beide `inert` wie der Rest der Anzeige.
 */
export class TouchControls {
  private readonly zone: HTMLElement;
  private readonly ring: HTMLElement;
  private readonly knob: HTMLElement;
  private readonly action: HTMLElement;
  private readonly button: HTMLButtonElement;
  private readonly icon: HTMLImageElement;
  /** Finger des Sticks, solange er steuert. */
  private stickPointer: number | null = null;
  private origin = { x: 0, y: 0 };
  /** Finger, der den Kontext-Knopf gerade drückt (für das gedrückte Bild). */
  private buttonPointer: number | null = null;
  private target: ContextTarget | null = null;
  private readonly cleanup: Array<() => void> = [];

  constructor(root: HTMLElement, private readonly services: Services, private readonly touch: TouchSource, gameArea: HTMLElement) {
    this.zone = el('div', 'touch-zone');
    this.zone.style.setProperty('--stick-r', `${STICK_RADIUS}px`);
    this.ring = el('div', 'touch-stick');
    this.knob = el('div', 'touch-stick__knob');
    this.ring.appendChild(this.knob);
    this.zone.appendChild(this.ring);

    this.action = el('div', 'touch-act');
    this.button = el('button', 'ui-button touch-act__button');
    this.button.type = 'button';
    this.icon = el('img', 'touch-act__icon');
    this.icon.alt = '';
    this.icon.draggable = false;
    this.icon.src = iconUrl('sprechblase');
    this.button.appendChild(this.icon);
    this.action.appendChild(this.button);

    // unter Anzeige, Schnellleiste und Gespräch; der Knopf darüber
    root.prepend(this.zone);
    root.appendChild(this.action);

    const { bus, pixelGrid } = services;
    this.listen(window, 'pointerdown', this.noteTouch, true);
    this.listen(window, 'keydown', this.noteKeys, true);
    this.listen(this.zone, 'pointerdown', this.onZoneDown);
    this.listen(gameArea, 'pointerdown', this.onGameAreaDown);
    this.listen(window, 'pointermove', this.onMove);
    this.listen(window, 'pointerup', this.onEnd);
    this.listen(window, 'pointercancel', this.onEnd);
    this.listen(this.zone, 'lostpointercapture', this.onEnd);
    this.listen(this.button, 'pointerdown', this.onButtonDown);
    // kein Kontextmenü (langes Drücken) und keine Lupe im Spielbereich
    const prevent = (e: Event): void => e.preventDefault();
    this.listen(root, 'contextmenu', prevent);
    this.listen(gameArea, 'contextmenu', prevent);
    // Safari: keine Seiten-Zoom-Geste mit zwei Fingern
    this.listen(document, 'gesturestart', prevent);
    this.cleanup.push(
      bus.on('ui:paused', ({ paused }) => { if (paused) this.releaseStick(); }),
      bus.on('context:changed', ({ target }) => { this.target = target; this.renderButton(); }),
      pixelGrid.onChange(() => this.snapButton()),
    );
    this.render();
  }

  destroy(): void {
    this.releaseStick();
    for (const off of this.cleanup) off();
    this.zone.remove();
    this.action.remove();
  }

  private listen<E extends Event>(target: EventTarget, type: string, handler: (e: E) => void, capture = false): void {
    const fn = handler as EventListener;
    target.addEventListener(type, fn, capture);
    this.cleanup.push(() => target.removeEventListener(type, fn, capture));
  }

  /** Erste Berührung: Touch-Bedienung zeigen. */
  private readonly noteTouch = (e: PointerEvent): void => {
    if (e.pointerType !== 'touch' || this.services.input.device === 'touch') return;
    this.services.input.noteDevice('touch');
    this.render();
  };

  /** Nächste Tastatureingabe: Touch-Bedienung ausblenden. */
  private readonly noteKeys = (): void => {
    if (this.services.input.device === 'keys') return;
    this.services.input.noteDevice('keys');
    this.render();
  };

  /** Offenes Gespräch: Tippen schließt es (die Szene dreht den Dorfbewohner zurück und startet die Sperre). */
  private closeDialogue(): boolean {
    const { dialogue } = this.services;
    if (!dialogue.isOpen) return false;
    dialogue.hide();
    return true;
  }

  private readonly onGameAreaDown = (): void => {
    this.closeDialogue();
  };

  private readonly onZoneDown = (e: PointerEvent): void => {
    if (this.closeDialogue()) return;
    if (e.pointerType === 'mouse' || this.services.windows.paused || this.stickPointer !== null) return;
    this.touch.stickStart(e.pointerId, e.clientX, e.clientY);
    if (!this.touch.holds(e.pointerId)) return;
    this.stickPointer = e.pointerId;
    this.origin = { x: e.clientX, y: e.clientY };
    // Folgt dem Finger auch außerhalb der Zone; ein künstliches Ereignis (Test) hat keinen aktiven Zeiger
    try {
      this.zone.setPointerCapture(e.pointerId);
    } catch {
      // die Ereignisse am Fenster genügen
    }
    const box = this.zone.getBoundingClientRect();
    this.ring.classList.add('is-active');
    this.ring.style.left = `${e.clientX - box.left - STICK_RADIUS}px`;
    this.ring.style.top = `${e.clientY - box.top - STICK_RADIUS}px`;
    this.placeKnob(0, 0);
  };

  private readonly onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.stickPointer) return;
    // der Stick wurde inzwischen losgelassen (input.reset beim Öffnen eines Fensters oder Gesprächs)
    if (!this.touch.holds(e.pointerId)) {
      this.releaseStick();
      return;
    }
    this.touch.stickMove(e.pointerId, e.clientX, e.clientY);
    const v = stickVector(this.origin.x, this.origin.y, e.clientX, e.clientY);
    this.placeKnob(v.x * STICK_RADIUS, v.y * STICK_RADIUS);
  };

  private readonly onEnd = (e: PointerEvent): void => {
    if (e.pointerId === this.buttonPointer) {
      this.buttonPointer = null;
      this.button.classList.remove('is-pressed');
    }
    if (e.pointerId === this.stickPointer) this.releaseStick();
  };

  private readonly onButtonDown = (e: PointerEvent): void => {
    // kein Fokus auf dem Knopf (sonst löste die Leertaste ihn später aus) und keine nachgeahmten Mausereignisse
    e.preventDefault();
    if (e.button !== 0) return;
    this.buttonPointer = e.pointerId;
    this.button.classList.add('is-pressed');
    this.touch.press('interact');
  };

  private placeKnob(x: number, y: number): void {
    this.knob.style.transform = `translate(${x}px, ${y}px)`;
  }

  /** Stick loslassen: Quelle, Zeiger und Bild. */
  private releaseStick(): void {
    const id = this.stickPointer;
    if (id === null) return;
    this.stickPointer = null;
    this.touch.stickEnd(id);
    try {
      if (this.zone.hasPointerCapture(id)) this.zone.releasePointerCapture(id);
    } catch {
      // schon frei
    }
    this.ring.classList.remove('is-active');
    this.ring.style.left = '';
    this.ring.style.top = '';
    this.placeKnob(0, 0);
  }

  private render(): void {
    const touching = this.services.input.device === 'touch';
    this.ring.hidden = !touching;
    this.action.hidden = !touching;
    if (!touching) {
      this.releaseStick();
      return;
    }
    this.renderButton();
    this.snapButton();
  }

  /** Sprechblase beim Reden; ohne Ziel (oder an einem Ausgang, der noch nichts tut) blass und ohne Symbol. */
  private renderButton(): void {
    const talk = this.target?.kind === 'talk';
    this.icon.hidden = !talk;
    this.button.classList.toggle('is-idle', !talk);
    this.button.setAttribute('aria-label', talk ? TEXTS['touch.talk'] : TEXTS['touch.action']);
  }

  /** Randbild scharf: Größe in ganzen Bildpunkten, Lage auf ganzen Gerätepixeln (grid.ts). */
  private snapButton(): void {
    if (this.action.hidden) return;
    snapSize(this.button);
    snapPosition(this.button);
  }
}
