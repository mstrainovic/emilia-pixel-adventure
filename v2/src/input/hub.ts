import type { MoveIntent } from '../systems/movement';
import type { Action, InputDevice, InputSource } from './actions';

/** Sekunden, die ein Tastendruck auf seinen Abnehmer wartet. */
export const PRESS_BUFFER = 0.3;

interface Pending {
  action: Action;
  age: number;
}

/** Sammelt alle Quellen: addiert Bewegung, puffert Drücke, merkt sich das zuletzt benutzte Gerät. */
export class InputHub {
  private readonly sources: InputSource[] = [];
  private pending: Pending[] = [];
  private current: MoveIntent = { x: 0, y: 0, run: false };
  private lastDevice: InputDevice = 'keys';

  add(source: InputSource): void {
    this.sources.push(source);
  }

  /** Einmal je Bild aufrufen, vor dem Auswerten der Absicht. */
  frame(dt: number): void {
    const age = Number.isFinite(dt) && dt > 0 ? dt : 0;
    for (const p of this.pending) p.age += age;

    let x = 0;
    let y = 0;
    let run = false;
    for (const s of this.sources) {
      const mx = Number.isFinite(s.move.x) ? s.move.x : 0;
      const my = Number.isFinite(s.move.y) ? s.move.y : 0;
      x += mx;
      y += my;
      run = run || s.run;
      const pressed = s.drainPressed();
      for (const action of pressed) this.pending.push({ action, age: 0 });
      if (mx !== 0 || my !== 0 || pressed.length > 0) this.lastDevice = s.device;
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    this.current = { x, y, run };
    this.pending = this.pending.filter((p) => p.age < PRESS_BUFFER);
  }

  get intent(): MoveIntent {
    return { ...this.current };
  }

  /** Nimmt einen gepufferten Druck ab: genau einmal `true`. */
  consume(action: Action): boolean {
    const i = this.pending.findIndex((p) => p.action === action);
    if (i < 0) return false;
    this.pending.splice(i, 1);
    return true;
  }

  reset(): void {
    this.pending = [];
    this.current = { x: 0, y: 0, run: false };
    for (const s of this.sources) s.reset();
  }

  get device(): InputDevice {
    return this.lastDevice;
  }
}
