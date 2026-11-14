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

/** Zusatztasten: ein keyup dieser Tasten oder der Tasten davor bleibt auf Mac und iPad oft aus. */
const MODIFIERS = new Set<string>(['ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'AltLeft', 'AltRight']);

type KeyTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>;
type PageTarget = Pick<Document, 'addEventListener' | 'removeEventListener' | 'hidden'>;

const hasModifier = (e: KeyboardEvent): boolean => e.ctrlKey || e.metaKey || e.altKey;

/** Tastatur als Eingabequelle. Gedrückte Tasten werden über `code` gemerkt, nicht gezählt. */
export class KeyboardSource implements InputSource {
  readonly device: InputDevice = 'keys';
  private readonly held = new Set<string>();
  private pressed: Action[] = [];
  private attached = false;

  /** `page` (das Dokument) ist nur für `visibilitychange` nötig und darf fehlen. */
  constructor(private readonly target: KeyTarget, private readonly page?: PageTarget) {}

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    // Strg, Cmd, Alt: danach kommt für gehaltene Tasten oft kein keyup mehr, also alles loslassen
    if (MODIFIERS.has(e.code)) {
      this.held.clear();
      return;
    }
    // Tastenkürzel des Browsers (Strg+D, Cmd+E, Alt+D …) gehören nicht dem Spiel
    if (hasModifier(e)) return;
    if (!HANDLED.has(e.code)) return;
    e.preventDefault();
    this.held.add(e.code);
    const action = ACTION_KEYS[e.code];
    if (action && !e.repeat) this.pressed.push(action);
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    if (!HANDLED.has(e.code)) return;
    this.held.delete(e.code);
    if (!hasModifier(e)) e.preventDefault();
  };

  /** Fokus weg, Rechtsklick-Menü, Seite verlassen: ein keyup käme nie an, also alles loslassen. */
  private readonly onBlur = (): void => {
    this.held.clear();
  };

  private readonly onVisibility = (): void => {
    if (this.page?.hidden) this.held.clear();
  };

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('blur', this.onBlur);
    this.target.addEventListener('contextmenu', this.onBlur);
    this.target.addEventListener('pagehide', this.onBlur);
    this.page?.addEventListener('visibilitychange', this.onVisibility);
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onBlur);
    this.target.removeEventListener('contextmenu', this.onBlur);
    this.target.removeEventListener('pagehide', this.onBlur);
    this.page?.removeEventListener('visibilitychange', this.onVisibility);
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
