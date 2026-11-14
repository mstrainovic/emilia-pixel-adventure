import type { InputHub } from '../input/hub';
import type { MoveIntent } from '../systems/movement';

/** Austauschbare Steuerquelle einer Figur (Spec 6.3): Eingabe, Stillstand, später Gesprächs- oder Wegsteuerung. */
export interface Controller {
  intent(): MoveIntent;
}

/** Steuert über den Eingabe-Verteiler (Tastatur, später Berührung). */
export class InputController implements Controller {
  constructor(private readonly hub: InputHub) {}

  intent(): MoveIntent {
    return this.hub.intent;
  }
}

/** Steht still. */
export class IdleController implements Controller {
  intent(): MoveIntent {
    return { x: 0, y: 0, run: false };
  }
}
