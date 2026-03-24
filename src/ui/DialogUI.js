/**
 * Speech bubble UI for NPC dialogs.
 * Shows a styled bubble with NPC name and text above the game.
 */
export class DialogUI {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'dialog-container';
    this.container.innerHTML = `
      <div id="dialog-bubble">
        <div id="dialog-name"></div>
        <div id="dialog-text"></div>
        <div id="dialog-hint">Klick zum Weiter / Schliessen</div>
      </div>
    `;
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
    this._addStyles();

    this.isOpen = false;
    this.onClose = null;
    this._typewriteId = 0; // unique ID to cancel stale typewriter timers
    this._typewriting = false; // true while typewriter is running

    const advanceOrFinish = () => {
      if (!this.isOpen || !this.onAdvance) return;

      // If typewriter is still running, finish it instantly instead of advancing
      if (this._typewriting && this._pendingText) {
        this._typewriteId++; // cancel running typewriter
        this._typewriting = false;
        const textEl = document.getElementById('dialog-text');
        if (textEl) textEl.textContent = this._pendingText;
        return;
      }

      this.onAdvance();
    };

    this.container.addEventListener('click', advanceOrFinish);
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) advanceOrFinish();
    });
  }

  show(npcName, text, color) {
    this.isOpen = true;
    this.container.style.display = 'flex';
    if (window.__game?.audio) window.__game.audio.playDialogOpen();

    const nameEl = document.getElementById('dialog-name');
    const textEl = document.getElementById('dialog-text');

    if (nameEl) {
      nameEl.textContent = npcName;
      nameEl.style.color = color || '#FFD700';
    }
    if (textEl) {
      textEl.textContent = '';
      this._typewriteId++; // cancel any running typewriter
      this._pendingText = text;
      this._typewriting = true;
      this._typewrite(textEl, text, 0, this._typewriteId);
    }
  }

  _typewrite(el, text, i, id) {
    // Stop if this typewriter was cancelled (new text started or dialog closed)
    if (id !== this._typewriteId || !this.isOpen) return;
    if (i < text.length) {
      el.textContent += text[i];
      // Play tick sound every 3rd character (not too noisy)
      if (i % 3 === 0 && text[i] !== ' ' && window.__game?.audio) {
        window.__game.audio.playTypeTick();
      }
      setTimeout(() => this._typewrite(el, text, i + 1, id), 25);
    } else {
      this._typewriting = false;
    }
  }

  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
    if (window.__game?.audio) window.__game.audio.playDialogClose();
    if (this.onClose) this.onClose();
  }

  _addStyles() {
    if (document.getElementById('dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'dialog-styles';
    style.textContent = `
      #dialog-container {
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        z-index: 200; pointer-events: auto; cursor: pointer;
        display: flex; justify-content: center;
      }
      #dialog-bubble {
        background: rgba(10, 10, 30, 0.9);
        border: 2px solid rgba(255, 215, 0, 0.5);
        border-radius: 16px;
        padding: 16px 24px;
        max-width: 500px; min-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Segoe UI', sans-serif;
      }
      #dialog-name {
        font-size: 16px; font-weight: bold;
        margin-bottom: 8px;
        color: #FFD700;
      }
      #dialog-text {
        font-size: 15px; color: #fff;
        line-height: 1.5;
        min-height: 40px;
      }
      #dialog-hint {
        font-size: 11px; color: rgba(255,255,255,0.35);
        text-align: right; margin-top: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('dialog-styles');
    if (s) s.remove();
  }
}
