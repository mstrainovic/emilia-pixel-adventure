/**
 * Mobile touch controls — virtual joystick + action buttons.
 * Only created and visible on touch-capable devices.
 */
export class TouchControls {
  constructor(inputManager) {
    this.input = inputManager;
    this.active = false;

    if (!TouchControls.isTouchDevice()) return;
    this.active = true;

    // Joystick state
    this._joyTouchId = null;
    this._joyCenter = { x: 0, y: 0 };
    this._runMode = false;

    this._createUI();
    this._bindEvents();
  }

  static isTouchDevice() {
    // matchMedia is the most reliable way — only true on devices
    // with NO hover and a coarse (finger) pointer (phones/tablets).
    // navigator.maxTouchPoints alone is unreliable (Windows 11 desktop
    // reports >0 even without a touchscreen).
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  // ─── UI Creation ──────────────────────────────────────────────────────

  _createUI() {
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';

    // Joystick touch zone (left half, bottom area)
    this.joyZone = document.createElement('div');
    this.joyZone.id = 'touch-joy-zone';

    this.joyBase = document.createElement('div');
    this.joyBase.id = 'touch-joy-base';
    this.joyKnob = document.createElement('div');
    this.joyKnob.id = 'touch-joy-knob';
    this.joyBase.appendChild(this.joyKnob);
    this.joyZone.appendChild(this.joyBase);

    // Action buttons (right side)
    this.btnGroup = document.createElement('div');
    this.btnGroup.id = 'touch-btn-group';

    this.btnHeal = this._makeBtn('🌸', 'touch-btn-md', 'KeyF');
    this.btnInteract = this._makeBtn('E', 'touch-btn-md', 'KeyE');
    this.btnAttack = this._makeBtn('⚔️', 'touch-btn-lg', 'Space');

    this.btnGroup.appendChild(this.btnHeal);
    this.btnGroup.appendChild(this.btnInteract);
    this.btnGroup.appendChild(this.btnAttack);

    // Run toggle (left side, above joystick)
    this.btnRun = document.createElement('div');
    this.btnRun.id = 'touch-btn-run';
    this.btnRun.textContent = '🏃';

    this.container.appendChild(this.joyZone);
    this.container.appendChild(this.btnGroup);
    this.container.appendChild(this.btnRun);
    document.body.appendChild(this.container);
    this._injectStyles();
  }

  _makeBtn(label, cls, keyCode) {
    const btn = document.createElement('div');
    btn.className = `touch-btn ${cls}`;
    btn.textContent = label;
    btn.dataset.key = keyCode;
    return btn;
  }

  // ─── Event Binding ────────────────────────────────────────────────────

  _bindEvents() {
    // --- Joystick ---
    const joyOpts = { passive: false };
    this.joyZone.addEventListener('touchstart', (e) => this._joyStart(e), joyOpts);
    this.joyZone.addEventListener('touchmove', (e) => this._joyMove(e), joyOpts);
    this.joyZone.addEventListener('touchend', (e) => this._joyEnd(e), joyOpts);
    this.joyZone.addEventListener('touchcancel', (e) => this._joyEnd(e), joyOpts);

    // --- Action buttons ---
    for (const btn of [this.btnAttack, this.btnInteract, this.btnHeal]) {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.input.simulateKeyDown(btn.dataset.key);
        btn.classList.add('pressed');
      }, joyOpts);

      const release = (e) => {
        e.preventDefault();
        this.input.simulateKeyUp(btn.dataset.key);
        btn.classList.remove('pressed');
      };
      btn.addEventListener('touchend', release, joyOpts);
      btn.addEventListener('touchcancel', release, joyOpts);
    }

    // --- Run toggle ---
    this.btnRun.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._runMode = !this._runMode;
      this.input.keys['ShiftLeft'] = this._runMode;
      this.btnRun.classList.toggle('active', this._runMode);
    }, joyOpts);
  }

  // ─── Joystick Logic ───────────────────────────────────────────────────

  _joyStart(e) {
    e.preventDefault();
    if (this._joyTouchId !== null) return; // already tracking
    const t = e.changedTouches[0];
    this._joyTouchId = t.identifier;
    this._joyCenter = { x: t.clientX, y: t.clientY };

    // Show base at touch point
    this.joyBase.style.display = 'block';
    this.joyBase.style.left = `${t.clientX - 60}px`;
    this.joyBase.style.top = `${t.clientY - 60}px`;
    this.joyKnob.style.transform = 'translate(-50%, -50%)';
  }

  _joyMove(e) {
    e.preventDefault();
    const t = this._findTouch(e.changedTouches);
    if (!t) return;

    const dx = t.clientX - this._joyCenter.x;
    const dy = t.clientY - this._joyCenter.y;
    const maxR = 50;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);

    // Move knob visual
    const kx = Math.cos(angle) * clamped;
    const ky = Math.sin(angle) * clamped;
    this.joyKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

    // Apply to input (20% dead zone)
    const thresh = maxR * 0.2;
    this.input.keys['KeyD'] = dx > thresh;
    this.input.keys['KeyA'] = dx < -thresh;
    this.input.keys['KeyS'] = dy > thresh;
    this.input.keys['KeyW'] = dy < -thresh;
  }

  _joyEnd(e) {
    if (!this._findTouch(e.changedTouches)) return;
    this._joyTouchId = null;
    this.joyBase.style.display = 'none';

    // Clear movement
    this.input.keys['KeyW'] = false;
    this.input.keys['KeyA'] = false;
    this.input.keys['KeyS'] = false;
    this.input.keys['KeyD'] = false;
  }

  _findTouch(touches) {
    for (const t of touches) {
      if (t.identifier === this._joyTouchId) return t;
    }
    return null;
  }

  // ─── Styles ───────────────────────────────────────────────────────────

  _injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Hidden by default — only shown on touch-only devices */
      #touch-controls {
        display: none !important;
        position: fixed;
        inset: 0;
        z-index: 90;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
      }
      @media (hover: none) and (pointer: coarse) {
        #touch-controls { display: block !important; }
      }

      /* ── Joystick zone ── */
      #touch-joy-zone {
        position: absolute;
        left: 0; bottom: 0;
        width: 45%; height: 55%;
        pointer-events: auto;
        touch-action: none;
      }

      #touch-joy-base {
        display: none;
        position: fixed;
        width: 120px; height: 120px;
        border-radius: 50%;
        background: rgba(255,255,255,0.12);
        border: 2px solid rgba(255,255,255,0.25);
        box-shadow: 0 0 20px rgba(0,0,0,0.15);
      }

      #touch-joy-knob {
        position: absolute;
        left: 50%; top: 50%;
        width: 44px; height: 44px;
        border-radius: 50%;
        background: rgba(255,255,255,0.45);
        border: 2px solid rgba(255,255,255,0.65);
        transform: translate(-50%, -50%);
        box-shadow: 0 0 8px rgba(255,255,255,0.2);
      }

      /* ── Action buttons ── */
      #touch-btn-group {
        position: fixed;
        right: 12px; bottom: 72px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        pointer-events: auto;
        touch-action: none;
      }

      .touch-btn {
        border-radius: 50%;
        background: rgba(0,0,0,0.35);
        border: 2px solid rgba(255,255,255,0.35);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Press Start 2P', monospace;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
        transition: background 0.08s, border-color 0.08s;
      }
      .touch-btn.pressed {
        background: rgba(255,255,255,0.25);
        border-color: rgba(255,255,255,0.7);
        transform: scale(0.92);
      }

      .touch-btn-lg {
        width: 72px; height: 72px;
        font-size: 28px;
        background: rgba(160,40,40,0.4);
        border-color: rgba(255,90,90,0.45);
      }
      .touch-btn-lg.pressed {
        background: rgba(255,80,80,0.45);
      }

      .touch-btn-md {
        width: 56px; height: 56px;
        font-size: 18px;
      }

      .touch-btn-sm {
        width: 48px; height: 48px;
        font-size: 20px;
      }

      /* ── Run toggle ── */
      #touch-btn-run {
        position: fixed;
        left: 16px; bottom: 72px;
        width: 48px; height: 48px;
        border-radius: 50%;
        background: rgba(0,0,0,0.35);
        border: 2px solid rgba(255,255,255,0.3);
        color: #fff;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        touch-action: none;
        transition: background 0.15s;
      }
      #touch-btn-run.active {
        background: rgba(40,130,255,0.4);
        border-color: rgba(80,180,255,0.65);
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
