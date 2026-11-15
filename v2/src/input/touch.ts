import type { Action, InputDevice, InputSource } from './actions';

/** Volle Auslenkung des Sticks in CSS-Pixeln (Abstand vom Aufsetzpunkt). */
export const STICK_RADIUS = 40;
/** Darunter wirkt der Stick nicht (Zittern des Daumens), CSS-Pixel. */
export const STICK_DEAD_ZONE = 8;
/** Ab diesem Anteil der vollen Auslenkung rennt Emilia. */
export const STICK_RUN_AT = 0.95;
/**
 * Einrasten nahe der Achsen (Vorab 5 aus der Schlussprüfung von 1a): ist die kleinere Komponente kleiner als
 * 0,2 × die größere, wird sie 0; der Betrag bleibt. Sonst kröche Emilia mit laufender Animation an einer Wand entlang,
 * wenn der Daumen fast gerade auf die Wand zeigt.
 */
export const STICK_AXIS_SNAP = 0.2;

const STILL = { x: 0, y: 0, magnitude: 0 } as const;

/** Ohne negative Null (`-0` wäre in Vergleichen mit `Object.is` nicht 0). */
const plain = (v: number): number => (v === 0 ? 0 : v);

/**
 * Richtung und Betrag des Sticks aus Aufsetzpunkt und Fingerlage (CSS-Pixel). Betrag 0 unter `STICK_DEAD_ZONE`,
 * dazwischen stufenlos, 1 ab `STICK_RADIUS`; der Vektor hat den Betrag als Länge.
 */
export function stickVector(originX: number, originY: number, x: number, y: number): { x: number; y: number; magnitude: number } {
  let dx = x - originX;
  let dy = y - originY;
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return { ...STILL };
  const distance = Math.hypot(dx, dy);
  if (distance < STICK_DEAD_ZONE) return { ...STILL };
  const magnitude = Math.min(1, (distance - STICK_DEAD_ZONE) / (STICK_RADIUS - STICK_DEAD_ZONE));
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < STICK_AXIS_SNAP * ay) dx = 0;
  else if (ay < STICK_AXIS_SNAP * ax) dy = 0;
  const length = Math.hypot(dx, dy);
  return { x: plain((dx / length) * magnitude), y: plain((dy / length) * magnitude), magnitude };
}

interface Stick {
  pointerId: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  magnitude: number;
}

/**
 * Berührung als Eingabequelle: ein schwebender Stick (gehört genau einem Finger, `pointerId`) und Drücke der
 * Touch-Knöpfe. Die Zeiger-Ereignisse übersetzt `ui/touchControls.ts`; hier ist nur die Rechnung.
 */
export class TouchSource implements InputSource {
  readonly device: InputDevice = 'touch';
  private stick: Stick | null = null;
  private pressed: Action[] = [];

  /** Ein Finger setzt in der Stick-Zone auf; gehört der Stick schon einem anderen, bleibt es dabei. */
  stickStart(pointerId: number, x: number, y: number): void {
    if (this.stick) return;
    this.stick = { pointerId, originX: x, originY: y, x: 0, y: 0, magnitude: 0 };
  }

  /** Der Finger des Sticks bewegt sich; andere Finger ändern nichts. */
  stickMove(pointerId: number, x: number, y: number): void {
    const stick = this.stick;
    if (!stick || stick.pointerId !== pointerId) return;
    const v = stickVector(stick.originX, stick.originY, x, y);
    stick.x = v.x;
    stick.y = v.y;
    stick.magnitude = v.magnitude;
  }

  /** Der Finger des Sticks hebt ab oder die Berührung bricht ab: loslassen. Andere Finger ändern nichts. */
  stickEnd(pointerId: number): void {
    if (this.stick?.pointerId === pointerId) this.stick = null;
  }

  /** Gehört der Stick gerade diesem Finger? */
  holds(pointerId: number): boolean {
    return this.stick?.pointerId === pointerId;
  }

  /** Hält gerade ein Finger den Stick (auch in der toten Zone)? */
  get held(): boolean {
    return this.stick !== null;
  }

  /** Ein Touch-Knopf löst eine Handlung aus (Kontext-Knopf: `interact`). */
  press(action: Action): void {
    this.pressed.push(action);
  }

  get move(): { x: number; y: number } {
    return this.stick ? { x: this.stick.x, y: this.stick.y } : { x: 0, y: 0 };
  }

  get run(): boolean {
    return (this.stick?.magnitude ?? 0) >= STICK_RUN_AT;
  }

  drainPressed(): Action[] {
    const out = this.pressed;
    this.pressed = [];
    return out;
  }

  reset(): void {
    this.stick = null;
    this.pressed = [];
  }
}
