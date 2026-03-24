/**
 * FishingUI — HTML overlay for the fishing minigame.
 * Fixed at bottom-center. Uses 'Press Start 2P' font (same as HUD).
 *
 * Phases exposed via show(phase):
 *   'casting'   — "Werfe Angel..."
 *   'waiting'   — "Warte auf Biss..."
 *   'bite'      — "! Biss !" (pulsing alert)
 *   'catching'  — timing bar visible, "Leertaste druecken!"
 */
export class FishingUI {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'fishing-ui';
    this.container.style.display = 'none';
    this.container.innerHTML = `
      <div id="fishing-status"></div>
      <div id="fishing-bar-wrap" style="display:none">
        <div id="fishing-bar-bg">
          <div id="fishing-bar-green"></div>
          <div id="fishing-bar-marker"></div>
        </div>
        <div id="fishing-bar-label">Leertaste druecken!</div>
      </div>
    `;

    // Catch popup (centered overlay)
    this.catchPopup = document.createElement('div');
    this.catchPopup.id = 'fishing-catch-popup';
    this.catchPopup.style.display = 'none';
    this.catchPopup.innerHTML = `
      <div id="fishing-catch-icon">🐟</div>
      <div id="fishing-catch-name"></div>
      <div id="fishing-catch-new" style="display:none">Neu entdeckt!</div>
    `;

    // Miss message (transient)
    this.missEl = document.createElement('div');
    this.missEl.id = 'fishing-miss';
    this.missEl.style.display = 'none';
    this.missEl.textContent = 'Entwischt!';

    document.body.appendChild(this.container);
    document.body.appendChild(this.catchPopup);
    document.body.appendChild(this.missEl);

    this._addStyles();

    this._catchTimeout = null;
    this._missTimeout = null;
  }

  /** Show the fishing UI in a given phase. */
  show(phase) {
    this.container.style.display = 'flex';
    const statusEl = document.getElementById('fishing-status');
    const barWrap = document.getElementById('fishing-bar-wrap');

    // Reset bite indicator styling
    if (statusEl) {
      statusEl.classList.remove('fishing-bite-active');
    }
    if (barWrap) barWrap.style.display = 'none';

    switch (phase) {
      case 'casting':
        if (statusEl) statusEl.textContent = 'Werfe Angel...';
        break;
      case 'waiting':
        if (statusEl) statusEl.textContent = 'Warte auf Biss...';
        break;
      case 'bite':
        if (statusEl) {
          statusEl.textContent = '! Biss !';
          statusEl.classList.add('fishing-bite-active');
        }
        break;
      case 'catching':
        if (statusEl) {
          statusEl.textContent = 'Leertaste druecken!';
          statusEl.classList.remove('fishing-bite-active');
        }
        if (barWrap) barWrap.style.display = 'block';
        break;
      default:
        if (statusEl) statusEl.textContent = '';
    }
  }

  /** Hide the main fishing UI panel. */
  hide() {
    this.container.style.display = 'none';
    const barWrap = document.getElementById('fishing-bar-wrap');
    if (barWrap) barWrap.style.display = 'none';
    const statusEl = document.getElementById('fishing-status');
    if (statusEl) statusEl.classList.remove('fishing-bite-active');
  }

  /**
   * Update the timing bar.
   * @param {number} markerPos   0..1 — current marker position
   * @param {number} greenStart  0..1 — left edge of green zone
   * @param {number} greenEnd    0..1 — right edge of green zone
   */
  updateBar(markerPos, greenStart, greenEnd) {
    const green = document.getElementById('fishing-bar-green');
    const marker = document.getElementById('fishing-bar-marker');
    if (!green || !marker) return;

    const BAR_W = 240; // px, must match CSS
    green.style.left = (greenStart * BAR_W) + 'px';
    green.style.width = ((greenEnd - greenStart) * BAR_W) + 'px';
    marker.style.left = (markerPos * BAR_W - 3) + 'px'; // -3 = half marker width
  }

  /** Show the pulsing bite indicator (called as soon as bite triggers). */
  showBiteIndicator() {
    this.show('bite');
  }

  /** Reset bite indicator back to waiting state. */
  resetBiteIndicator() {
    const statusEl = document.getElementById('fishing-status');
    if (statusEl) {
      statusEl.classList.remove('fishing-bite-active');
      statusEl.textContent = 'Warte auf Biss...';
    }
  }

  /**
   * Show the centered catch popup.
   * @param {string}  fishName  Display name of the fish
   * @param {boolean} isNew     True → show "Neu entdeckt!" badge
   */
  showCatch(fishName, isNew) {
    if (this._catchTimeout) clearTimeout(this._catchTimeout);

    const nameEl = document.getElementById('fishing-catch-name');
    const newEl = document.getElementById('fishing-catch-new');
    if (nameEl) nameEl.textContent = fishName;
    if (newEl) newEl.style.display = isNew ? 'block' : 'none';

    this.catchPopup.style.display = 'flex';
    this.catchPopup.style.opacity = '1';

    // Auto-hide after 2.5 s
    this._catchTimeout = setTimeout(() => {
      this.catchPopup.style.opacity = '0';
      setTimeout(() => { this.catchPopup.style.display = 'none'; }, 400);
    }, 2500);
  }

  /** Show the brief "Entwischt!" miss message. */
  showMiss() {
    if (this._missTimeout) clearTimeout(this._missTimeout);

    this.missEl.style.display = 'block';
    this.missEl.style.opacity = '1';

    this._missTimeout = setTimeout(() => {
      this.missEl.style.opacity = '0';
      setTimeout(() => { this.missEl.style.display = 'none'; }, 400);
    }, 1500);
  }

  _addStyles() {
    if (document.getElementById('fishing-styles')) return;
    const style = document.createElement('style');
    style.id = 'fishing-styles';
    style.textContent = `
      #fishing-ui {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 200;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      }

      #fishing-status {
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        color: #e8d8b0;
        text-align: center;
        text-shadow: 1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.8);
        background: rgba(20, 15, 10, 0.75);
        border: 2px solid #8B6914;
        padding: 6px 14px;
        border-radius: 2px;
        letter-spacing: 1px;
        min-width: 180px;
        box-shadow: 0 2px 0 #4a3608;
      }

      #fishing-status.fishing-bite-active {
        color: #FFD700;
        border-color: #FFD700;
        animation: fishing-bite-pulse 0.4s ease-in-out infinite alternate;
        box-shadow: 0 0 12px rgba(255,215,0,0.5), 0 2px 0 #4a3608;
      }

      @keyframes fishing-bite-pulse {
        from { transform: scale(1);   opacity: 1; }
        to   { transform: scale(1.08); opacity: 0.85; }
      }

      #fishing-bar-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      #fishing-bar-bg {
        position: relative;
        width: 240px;
        height: 24px;
        background: #1a1206;
        border: 2px solid #5a4020;
        border-radius: 2px;
        overflow: visible;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
      }

      #fishing-bar-green {
        position: absolute;
        top: 0;
        height: 100%;
        background: #3a9a3a;
        border-radius: 1px;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 0 6px rgba(58,154,58,0.4);
      }

      #fishing-bar-marker {
        position: absolute;
        top: -3px;
        width: 6px;
        height: calc(100% + 6px);
        background: #ffffff;
        border-radius: 1px;
        box-shadow: 0 0 4px rgba(255,255,255,0.8);
      }

      #fishing-bar-label {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        color: #b8a880;
        text-shadow: 1px 1px 0 #000;
        letter-spacing: 0.5px;
      }

      /* Catch popup — centered overlay */
      #fishing-catch-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 250;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        background: rgba(20, 15, 10, 0.92);
        border: 3px solid #FFD700;
        border-radius: 4px;
        padding: 20px 36px;
        pointer-events: none;
        transition: opacity 0.4s ease;
        box-shadow: 0 0 24px rgba(255,215,0,0.3), 0 4px 0 #4a3608;
      }

      #fishing-catch-icon {
        font-size: 40px;
        animation: fishing-catch-bounce 0.5s ease-out;
      }

      @keyframes fishing-catch-bounce {
        0%   { transform: scale(0.3); opacity: 0; }
        60%  { transform: scale(1.2); }
        100% { transform: scale(1);   opacity: 1; }
      }

      #fishing-catch-name {
        font-family: 'Press Start 2P', monospace;
        font-size: 12px;
        color: #FFD700;
        text-shadow: 1px 1px 0 #4a3608;
        text-align: center;
      }

      #fishing-catch-new {
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        color: #44ffaa;
        text-shadow: 0 0 6px rgba(68,255,170,0.6);
        letter-spacing: 1px;
        animation: fishing-new-glow 1s ease-in-out infinite alternate;
      }

      @keyframes fishing-new-glow {
        from { opacity: 0.8; }
        to   { opacity: 1;   text-shadow: 0 0 10px rgba(68,255,170,0.9); }
      }

      /* Miss message */
      #fishing-miss {
        position: fixed;
        bottom: 140px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 210;
        font-family: 'Press Start 2P', monospace;
        font-size: 11px;
        color: #ff6666;
        text-shadow: 1px 1px 0 #000, 0 0 8px rgba(255,100,100,0.5);
        pointer-events: none;
        transition: opacity 0.4s ease;
        letter-spacing: 1px;
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this._catchTimeout) clearTimeout(this._catchTimeout);
    if (this._missTimeout) clearTimeout(this._missTimeout);
    if (this.container.parentNode) this.container.remove();
    if (this.catchPopup.parentNode) this.catchPopup.remove();
    if (this.missEl.parentNode) this.missEl.remove();
    const s = document.getElementById('fishing-styles');
    if (s) s.remove();
  }
}
