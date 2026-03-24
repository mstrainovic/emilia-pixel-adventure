/**
 * Boss health bar — large HP display at top of screen during boss fights.
 * HTML overlay, pixel-art styled. Shows boss name + HP percentage.
 */
export class BossHealthBar {
  constructor() {
    this._el = null;
    this._nameEl = null;
    this._barFill = null;
    this._barText = null;
    this._visible = false;
    this._createDOM();
  }

  _createDOM() {
    this._el = document.createElement('div');
    this._el.id = 'boss-hp-bar';
    this._el.style.cssText = `
      position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
      width: 400px; max-width: 80vw; z-index: 1050;
      font-family: 'Press Start 2P', monospace;
      display: none;
    `;

    this._el.innerHTML = `
      <div id="boss-name" style="text-align: center; color: #FF4466; font-size: 10px; margin-bottom: 4px; text-shadow: 1px 1px 0 #000;"></div>
      <div style="background: #1a1a2e; border: 2px solid #FF4466; border-radius: 4px; padding: 2px; height: 16px; position: relative;">
        <div id="boss-hp-fill" style="background: linear-gradient(90deg, #FF4466, #FF6688); height: 100%; border-radius: 2px; transition: width 0.3s ease;"></div>
        <div id="boss-hp-text" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 7px; text-shadow: 1px 1px 0 #000;"></div>
      </div>
    `;

    document.body.appendChild(this._el);
    this._nameEl = this._el.querySelector('#boss-name');
    this._barFill = this._el.querySelector('#boss-hp-fill');
    this._barText = this._el.querySelector('#boss-hp-text');
  }

  show(bossName) {
    this._visible = true;
    this._nameEl.textContent = bossName;
    this._el.style.display = 'block';
  }

  update(hp, maxHp) {
    if (!this._visible) return;
    const pct = Math.max(0, hp / maxHp) * 100;
    this._barFill.style.width = pct + '%';
    this._barText.textContent = `${Math.ceil(hp)} / ${maxHp}`;

    // Color change based on HP percentage
    if (pct > 60) {
      this._barFill.style.background = 'linear-gradient(90deg, #FF4466, #FF6688)';
    } else if (pct > 30) {
      this._barFill.style.background = 'linear-gradient(90deg, #FFAA00, #FFCC44)';
    } else {
      this._barFill.style.background = 'linear-gradient(90deg, #FF2200, #FF4400)';
    }
  }

  hide() {
    this._visible = false;
    this._el.style.display = 'none';
  }

  dispose() {
    if (this._el?.parentNode) this._el.parentNode.removeChild(this._el);
  }
}
