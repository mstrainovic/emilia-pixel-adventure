/**
 * GameOverScreen — friendly death screen for a 6-year-old.
 * Shows "Oh nein!" with a cute message, waits for keypress, then fades out.
 */
export class GameOverScreen {
  constructor() {
    this.active = false;
    this._waitingForInput = false;
    this._fadeInTimer = 0;
    this._showPromptTimer = 0;
    this._onContinue = null;

    // Build overlay DOM
    this.overlay = document.createElement('div');
    this.overlay.id = 'gameover-screen';
    this.overlay.innerHTML = `
      <div id="gameover-icon"></div>
      <div id="gameover-title">Oh nein!</div>
      <div id="gameover-subtitle">Emilia ist umgefallen...</div>
      <div id="gameover-prompt">Druecke eine Taste zum Weiterspielen</div>
    `;
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0);
      display: none;
      flex-direction: column; align-items: center; justify-content: center;
      font-family: 'Press Start 2P', monospace;
      color: white; z-index: 2000;
      pointer-events: auto;
    `;
    document.body.appendChild(this.overlay);
    this._addStyles();

    // Key handler (bound so we can remove it)
    this._keyHandler = (e) => this._handleKey(e);
    this._clickHandler = () => this._handleKey({ key: 'click' });
  }

  /**
   * Show the death screen. Calls onContinue() when player presses a key.
   */
  show(onContinue) {
    if (this.active) return;
    this.active = true;
    this._waitingForInput = false;
    this._onContinue = onContinue;
    this._fadeInTimer = 0;
    this._showPromptTimer = 0;

    // Reset visual state
    this.overlay.style.display = 'flex';
    this.overlay.style.background = 'rgba(0, 0, 0, 0)';

    const title = this.overlay.querySelector('#gameover-title');
    const subtitle = this.overlay.querySelector('#gameover-subtitle');
    const prompt = this.overlay.querySelector('#gameover-prompt');
    const icon = this.overlay.querySelector('#gameover-icon');
    if (title) title.style.opacity = '0';
    if (subtitle) subtitle.style.opacity = '0';
    if (prompt) { prompt.style.opacity = '0'; prompt.classList.remove('gameover-blink'); }
    if (icon) icon.style.opacity = '0';

    // Animate fade-in with requestAnimationFrame
    this._animateFadeIn();
  }

  _animateFadeIn() {
    const fadeInDuration = 500; // ms for background fade
    const textDelay = 600; // ms before text appears
    const promptDelay = 2500; // ms before continue prompt
    const startTime = performance.now();

    const animate = (now) => {
      if (!this.active) return;

      const elapsed = now - startTime;

      // Background fade (0 → 0.85 over fadeInDuration)
      const bgAlpha = Math.min(0.85, (elapsed / fadeInDuration) * 0.85);
      this.overlay.style.background = `rgba(0, 0, 0, ${bgAlpha})`;

      // Icon + Title appear after textDelay
      if (elapsed > textDelay) {
        const textAlpha = Math.min(1, (elapsed - textDelay) / 400);
        const icon = this.overlay.querySelector('#gameover-icon');
        const title = this.overlay.querySelector('#gameover-title');
        if (icon) icon.style.opacity = textAlpha;
        if (title) {
          title.style.opacity = textAlpha;
          // Scale bounce effect
          const scale = textAlpha < 1 ? 0.5 + textAlpha * 0.5 : 1;
          title.style.transform = `scale(${scale})`;
        }
      }

      // Subtitle appears a bit later
      if (elapsed > textDelay + 400) {
        const subAlpha = Math.min(1, (elapsed - textDelay - 400) / 400);
        const subtitle = this.overlay.querySelector('#gameover-subtitle');
        if (subtitle) subtitle.style.opacity = subAlpha;
      }

      // Continue prompt after promptDelay
      if (elapsed > promptDelay) {
        if (!this._waitingForInput) {
          this._waitingForInput = true;
          const prompt = this.overlay.querySelector('#gameover-prompt');
          if (prompt) {
            prompt.style.opacity = '1';
            prompt.classList.add('gameover-blink');
          }
          // Now listen for input
          document.addEventListener('keydown', this._keyHandler);
          document.addEventListener('click', this._clickHandler);
          document.addEventListener('touchstart', this._clickHandler);
        }
      }

      if (elapsed < promptDelay + 500) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  _handleKey(e) {
    if (!this._waitingForInput || !this.active) return;
    // Prevent multiple triggers
    this._waitingForInput = false;
    document.removeEventListener('keydown', this._keyHandler);
    document.removeEventListener('click', this._clickHandler);
    document.removeEventListener('touchstart', this._clickHandler);

    // Fade out
    this._animateFadeOut();
  }

  _animateFadeOut() {
    const fadeOutDuration = 500; // ms
    const startTime = performance.now();
    const startAlpha = 0.85;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / fadeOutDuration);

      // Fade everything out
      const alpha = startAlpha * (1 - progress);
      this.overlay.style.background = `rgba(0, 0, 0, ${alpha})`;
      this.overlay.style.opacity = 1 - progress;

      if (progress >= 1) {
        this.overlay.style.display = 'none';
        this.overlay.style.opacity = '1';
        this.active = false;

        // Trigger respawn callback
        if (this._onContinue) {
          this._onContinue();
          this._onContinue = null;
        }
        return;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  /** Hide immediately (e.g. on scene transitions) */
  hide() {
    this.active = false;
    this._waitingForInput = false;
    this.overlay.style.display = 'none';
    document.removeEventListener('keydown', this._keyHandler);
    document.removeEventListener('click', this._clickHandler);
    document.removeEventListener('touchstart', this._clickHandler);
    this._onContinue = null;
  }

  dispose() {
    this.hide();
    if (this.overlay.parentNode) this.overlay.remove();
    const s = document.getElementById('gameover-styles');
    if (s) s.remove();
  }

  _addStyles() {
    if (document.getElementById('gameover-styles')) return;
    const style = document.createElement('style');
    style.id = 'gameover-styles';
    style.textContent = `
      #gameover-screen {
        gap: 16px;
        text-align: center;
        user-select: none;
      }

      #gameover-icon {
        font-size: 48px;
        line-height: 1;
        margin-bottom: 4px;
        opacity: 0;
      }
      #gameover-icon::after {
        content: '\\2B50';
      }

      #gameover-title {
        font-size: 28px;
        color: #ffdd44;
        text-shadow:
          0 0 20px rgba(255, 221, 68, 0.6),
          2px 2px 0 #aa7700,
          -1px -1px 0 #aa7700;
        opacity: 0;
        transform: scale(0.5);
        letter-spacing: 3px;
      }

      #gameover-subtitle {
        font-size: 13px;
        color: #e8d8c0;
        text-shadow: 1px 1px 0 #000;
        opacity: 0;
        margin-top: 4px;
        line-height: 1.6;
      }

      #gameover-prompt {
        font-size: 10px;
        color: #aaccff;
        text-shadow: 1px 1px 0 #000;
        opacity: 0;
        margin-top: 20px;
      }

      @keyframes gameover-blink-anim {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.2; }
      }

      .gameover-blink {
        animation: gameover-blink-anim 1.2s ease-in-out infinite;
      }

      /* Floating stars decoration */
      #gameover-screen::before,
      #gameover-screen::after {
        content: '';
        position: absolute;
        width: 4px; height: 4px;
        background: #ffdd44;
        border-radius: 50%;
        box-shadow:
          40px -60px 0 #ffdd44,
          -80px -30px 0 #aaccff,
          60px 40px 0 #ffdd44,
          -50px 70px 0 #aaccff,
          100px -20px 0 #ffdd44,
          -120px -80px 0 #aaccff,
          90px 80px 0 #ffdd44,
          -30px -100px 0 #aaccff;
        animation: gameover-stars 3s ease-in-out infinite alternate;
      }
      #gameover-screen::after {
        animation-delay: 1.5s;
        box-shadow:
          -40px 60px 0 #ffdd44,
          80px 30px 0 #aaccff,
          -60px -40px 0 #ffdd44,
          50px -70px 0 #aaccff,
          -100px 20px 0 #ffdd44,
          120px 80px 0 #aaccff,
          -90px -80px 0 #ffdd44,
          30px 100px 0 #aaccff;
      }
      @keyframes gameover-stars {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
        100% { transform: translateY(-8px) rotate(5deg); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }
}
