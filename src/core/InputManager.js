/**
 * Input Manager — tracks keyboard + mouse state.
 * Supports key consumption to prevent multiple systems from reacting to the same key press.
 */
export class InputManager {
  constructor() {
    this.keys = {};
    this._justPressed = {};  // keys pressed THIS frame (for single-action triggers)
    this._consumed = {};     // keys consumed this frame (prevents double-handling)
    this.mousePos = { x: 0, y: 0 };
    this.mouseClicked = false;
    this.mouseDown = false;
    this._clickConsumed = false;

    window.addEventListener('keydown', (e) => {
      // Prevent Tab from shifting browser focus
      if (e.code === 'Tab') e.preventDefault();
      if (!this.keys[e.code]) {
        this._justPressed[e.code] = true;  // first frame of press
      }
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      // Don't clear _justPressed here — let endFrame() handle it.
      // Clearing on keyup caused Playwright (and fast synthetic events)
      // to lose the justPressed signal before the game loop could read it.
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mousedown', () => {
      this.mouseDown = true;
      this.mouseClicked = true;
      this._clickConsumed = false;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });
  }

  /** Simulate a key press from touch controls. */
  simulateKeyDown(code) {
    if (!this.keys[code]) {
      this._justPressed[code] = true;
    }
    this.keys[code] = true;
  }

  /** Simulate a key release from touch controls. */
  simulateKeyUp(code) {
    this.keys[code] = false;
  }

  /** Is the key currently held down? */
  isKeyDown(code) {
    return !!this.keys[code];
  }

  /**
   * Was the key JUST pressed this frame? (Not held from previous frame.)
   * Also consumes the press — only the FIRST system to call this gets true.
   */
  justPressed(code) {
    if (this._justPressed[code] && !this._consumed[code]) {
      this._consumed[code] = true;
      return true;
    }
    return false;
  }

  get moveX() {
    let x = 0;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;
    return x;
  }

  get moveY() {
    let y = 0;
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
    return y;
  }

  get isRunning() {
    return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
  }

  consumeClick() {
    if (this.mouseClicked && !this._clickConsumed) {
      this._clickConsumed = true;
      return true;
    }
    return false;
  }

  endFrame() {
    this.mouseClicked = false;
    this._clickConsumed = false;
    // Clear justPressed flags
    for (const key in this._justPressed) {
      this._justPressed[key] = false;
    }
    this._consumed = {};
  }
}
