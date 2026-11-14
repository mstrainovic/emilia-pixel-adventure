import type { Action, InputDevice, InputSource } from './actions';

const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];
const UP = ['KeyW', 'ArrowUp'];
const DOWN = ['KeyS', 'ArrowDown'];
const RUN = ['ShiftLeft', 'ShiftRight'];

const ACTION_KEYS: Readonly<Record<string, Action>> = {
  KeyE: 'interact',
  Space: 'confirm',
  Enter: 'confirm',
  Escape: 'cancel',
  KeyH: 'help',
  KeyM: 'menu',
  Digit1: 'hotbar1',
  Digit2: 'hotbar2',
  Digit3: 'hotbar3',
  Digit4: 'hotbar4',
  Digit5: 'hotbar5',
  Digit6: 'hotbar6',
  Digit7: 'hotbar7',
  Digit8: 'hotbar8',
};

const HANDLED = new Set<string>([...LEFT, ...RIGHT, ...UP, ...DOWN, ...RUN, ...Object.keys(ACTION_KEYS)]);

type KeyTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>;

/** Tastatur als Eingabequelle. Gedrückte Tasten werden über `code` gemerkt, nicht gezählt. */
export class KeyboardSource implements InputSource {
  readonly device: InputDevice = 'keys';
  private readonly held = new Set<string>();
  private pressed: Action[] = [];
  private attached = false;

  constructor(private readonly target: KeyTarget) {}

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (!HANDLED.has(e.code)) return;
    e.preventDefault();
    this.held.add(e.code);
    const action = ACTION_KEYS[e.code];
    if (action && !e.repeat) this.pressed.push(action);
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    if (!HANDLED.has(e.code)) return;
    e.preventDefault();
    this.held.delete(e.code);
  };

  /** Fenster verliert den Fokus: ein keyup käme nie an, also alles loslassen. */
  private readonly onBlur = (): void => {
    this.held.clear();
  };

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('blur', this.onBlur);
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onBlur);
    this.held.clear();
  }

  private any(codes: string[]): number {
    return codes.some((c) => this.held.has(c)) ? 1 : 0;
  }

  get move(): { x: number; y: number } {
    const x = this.any(RIGHT) - this.any(LEFT);
    const y = this.any(DOWN) - this.any(UP);
    if (x !== 0 && y !== 0) return { x: x * Math.SQRT1_2, y: y * Math.SQRT1_2 };
    return { x, y };
  }

  get run(): boolean {
    return this.any(RUN) === 1;
  }

  drainPressed(): Action[] {
    const out = this.pressed;
    this.pressed = [];
    return out;
  }

  reset(): void {
    this.held.clear();
    this.pressed = [];
  }
}
