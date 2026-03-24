import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../data/achievements.js';

/**
 * Achievement UI — two components:
 *   1. Popup notification when achievement is unlocked (golden star animation)
 *   2. Grid overview accessible from pause/Tab menu
 *
 * HTML overlay, same pattern as ExplorerBookUI.
 */
export class AchievementUI {
  constructor() {
    this.isOpen = false;
    this._popup = null;
    this._overlay = null;
    this._popupQueue = [];
    this._popupTimer = 0;
    this._createDOM();
  }

  _createDOM() {
    // ── Popup container (top-center) ──
    this._popup = document.createElement('div');
    this._popup.id = 'achievement-popup';
    this._popup.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #2a1a00, #4a3000);
      border: 3px solid #FFD700; border-radius: 12px;
      padding: 12px 24px; color: #FFD700;
      font-family: 'Press Start 2P', monospace; font-size: 10px;
      display: none; z-index: 1100;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      text-align: center; min-width: 200px;
      animation: achievementSlideIn 0.5s ease-out;
    `;
    document.body.appendChild(this._popup);

    // Add CSS animation
    if (!document.getElementById('achievement-styles')) {
      const style = document.createElement('style');
      style.id = 'achievement-styles';
      style.textContent = `
        @keyframes achievementSlideIn {
          from { transform: translateX(-50%) translateY(-50px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes achievementSlideOut {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(-50px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // ── Grid overlay (full screen) ──
    this._overlay = document.createElement('div');
    this._overlay.id = 'achievement-overlay';
    this._overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.85);
      display: none; z-index: 1200;
      font-family: 'Press Start 2P', monospace;
      overflow-y: auto; padding: 40px;
    `;
    document.body.appendChild(this._overlay);
  }

  /**
   * Show unlock popup for an achievement.
   */
  showPopup(achievementDef) {
    this._popupQueue.push(achievementDef);
    if (this._popupTimer <= 0) this._showNextPopup();
  }

  _showNextPopup() {
    if (this._popupQueue.length === 0) {
      this._popup.style.display = 'none';
      return;
    }

    const def = this._popupQueue.shift();
    this._popup.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 6px;">&#9733;</div>
      <div style="font-size: 8px; color: #FFAA00; margin-bottom: 4px;">ACHIEVEMENT!</div>
      <div style="font-size: 10px;">${def.name}</div>
      <div style="font-size: 7px; color: #CCAA44; margin-top: 4px;">${def.description}</div>
    `;
    this._popup.style.display = 'block';
    this._popup.style.animation = 'none';
    // Force reflow
    void this._popup.offsetWidth;
    this._popup.style.animation = 'achievementSlideIn 0.5s ease-out';

    this._popupTimer = 3.0; // show for 3 seconds
  }

  /**
   * Update popup timer.
   */
  updatePopup(dt) {
    if (this._popupTimer > 0) {
      this._popupTimer -= dt;
      if (this._popupTimer <= 0) {
        this._popup.style.animation = 'achievementSlideOut 0.3s ease-in forwards';
        setTimeout(() => this._showNextPopup(), 300);
      }
    }
  }

  /**
   * Open the achievement grid overview.
   */
  open(achievementSystem) {
    this.isOpen = true;
    const total = achievementSystem.getTotal();
    const count = achievementSystem.getCount();

    let html = `
      <div style="max-width: 700px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #FFD700; font-size: 14px;">Achievements</h2>
          <p style="color: #CCAA44; font-size: 10px;">${count} / ${total} Sterne</p>
        </div>
    `;

    for (const [catKey, catDef] of Object.entries(ACHIEVEMENT_CATEGORIES)) {
      const catAchievements = Object.values(ACHIEVEMENTS).filter(a => a.category === catKey);
      html += `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #FFAA00; font-size: 10px; margin-bottom: 8px;">${catDef.name}</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
      `;

      for (const ach of catAchievements) {
        const unlocked = achievementSystem.isUnlocked(ach.id);
        const starColor = unlocked ? '#FFD700' : '#444444';
        const textColor = unlocked ? '#FFFFFF' : '#666666';
        const bgColor = unlocked ? 'rgba(255, 215, 0, 0.1)' : 'rgba(50, 50, 50, 0.3)';
        html += `
          <div style="background: ${bgColor}; border: 1px solid ${starColor}; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="font-size: 20px; color: ${starColor};">&#9733;</div>
            <div style="font-size: 7px; color: ${textColor}; margin-top: 4px;">${unlocked ? ach.name : '???'}</div>
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #888; font-size: 8px;">Druecke TAB zum Schliessen</p>
        </div>
      </div>
    `;

    this._overlay.innerHTML = html;
    this._overlay.style.display = 'block';
  }

  close() {
    this.isOpen = false;
    this._overlay.style.display = 'none';
  }

  toggle(achievementSystem) {
    if (this.isOpen) this.close();
    else this.open(achievementSystem);
  }

  dispose() {
    if (this._popup?.parentNode) this._popup.parentNode.removeChild(this._popup);
    if (this._overlay?.parentNode) this._overlay.parentNode.removeChild(this._overlay);
  }
}
