/**
 * Main menu / start screen for the game.
 */
export class MainMenu {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'main-menu';
    this.container.innerHTML = `
      <div class="mm-content">
        <div class="mm-unicorn">🦄</div>
        <h1 class="mm-title">Emilia's Pixel Adventure</h1>
        <p class="mm-subtitle">Ein magisches Abenteuer</p>
        <div class="mm-buttons">
          <button id="mm-start" class="mm-btn mm-btn-primary">Neues Spiel</button>
          <button id="mm-continue" class="mm-btn mm-btn-secondary" style="display:none">Weiterspielen</button>
        </div>
        <div class="mm-controls">
          <p>WASD — Laufen &nbsp;|&nbsp; Shift — Rennen</p>
          <p>Leertaste — Angreifen &nbsp;|&nbsp; E — Interagieren</p>
          <p>F — Wasser-Magie &nbsp;|&nbsp; 1-8 — Hotbar</p>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);
    this._addStyles();
  }

  show(hasSave) {
    this.container.style.display = 'flex';
    const continueBtn = document.getElementById('mm-continue');
    if (continueBtn) {
      continueBtn.style.display = hasSave ? 'block' : 'none';
    }
  }

  hide() {
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 500);
  }

  onStart(callback) {
    document.getElementById('mm-start').addEventListener('click', callback);
  }

  onContinue(callback) {
    document.getElementById('mm-continue').addEventListener('click', callback);
  }

  _addStyles() {
    if (document.getElementById('mm-styles')) return;
    const style = document.createElement('style');
    style.id = 'mm-styles';
    style.textContent = `
      @font-face {
        font-family: 'Press Start 2P';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('./fonts/PressStart2P-Regular.ttf') format('truetype');
      }
      #main-menu {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(180deg, #1a3520 0%, #2d5a27 40%, #3a6b30 70%, #2a4820 100%);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
        transition: opacity 0.5s ease;
        font-family: 'Press Start 2P', 'Segoe UI', monospace;
        image-rendering: pixelated;
      }
      .mm-content {
        text-align: center;
        background: rgba(0, 0, 0, 0.4);
        border: 4px solid #8B6914;
        border-radius: 4px;
        padding: 40px 60px;
        box-shadow: 0 0 0 2px #4a3608, 0 8px 32px rgba(0,0,0,0.5), inset 0 0 40px rgba(139,105,20,0.1);
      }
      .mm-unicorn {
        font-size: 56px; margin-bottom: 8px;
        animation: mm-float 3s ease-in-out infinite;
        filter: drop-shadow(0 4px 8px rgba(255,215,0,0.3));
      }
      @keyframes mm-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .mm-title {
        color: #FFD700; font-size: 22px; margin: 0;
        text-shadow: 2px 2px 0px #8B6914, 0 0 20px rgba(255,215,0,0.3);
        letter-spacing: 1px;
        line-height: 1.4;
      }
      .mm-subtitle {
        color: #b8d4a0; font-size: 10px;
        margin: 12px 0 28px;
        letter-spacing: 1px;
      }
      .mm-buttons { display: flex; flex-direction: column; gap: 12px; align-items: center; }
      .mm-btn {
        padding: 12px 32px; font-size: 12px; font-weight: bold;
        border: 3px solid; border-radius: 2px; cursor: pointer;
        transition: transform 0.1s, background 0.15s;
        min-width: 220px;
        font-family: 'Press Start 2P', monospace;
        image-rendering: pixelated;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .mm-btn:hover { transform: scale(1.03); filter: brightness(1.15); }
      .mm-btn:active { transform: scale(0.97); }
      .mm-btn-primary {
        background: #4a8c3f; color: #fff;
        border-color: #6ab85a #2d5a22 #2d5a22 #6ab85a;
        box-shadow: 0 3px 0 #1a3a14, 0 4px 12px rgba(0,0,0,0.3);
      }
      .mm-btn-secondary {
        background: #5a6aaa; color: #fff;
        border-color: #7a8acc #3a4a7a #3a4a7a #7a8acc;
        box-shadow: 0 3px 0 #2a3a6a, 0 4px 12px rgba(0,0,0,0.3);
      }
      .mm-controls {
        margin-top: 28px; color: rgba(180,210,160,0.5); font-size: 7px;
        line-height: 2.2; letter-spacing: 0.5px;
      }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('mm-styles');
    if (s) s.remove();
  }
}
