/**
 * HelpOverlay — H-Taste Hilfe-Bildschirm mit Steuerung + Quest-Ratgeber.
 * Zwei-Spalten-Layout: links Tastenbelegung, rechts aktiver Quest-Info.
 * Oeffnet/schliesst mit H, Escape, Click-Outside, oder X-Button.
 * z-index: 400 (ueber CraftingUI/TradeUI, unter Scene-Fade).
 */

const QUEST_HINTS = {
  first_steps:      'Ziel: Dorf — sprich mit Mama Tanja',
  wood_collector:   'Ziel: Wald (Norden) — sammle Holz',
  nature_healer:    'Ziel: Wald (Norden) — heile Pflanzen mit F',
  slime_hunter:     'Ziel: Wald (Norden) — besiege Schleime',
  lake_visitor:     'Ziel: See (Sueden) — besuche den See',
  dungeon_explorer: 'Ziel: Hoehle (Osten) — erkunde die Hoehle',
  master_cook:      'Ziel: Dorf — koche am Kochtopf',
  skeleton_slayer:  'Ziel: Hoehle (Osten) — besiege Skelette',
  unicorn_friend:   'Ziel: Einhornwiese (durch den Wald)',
  master_crafter:   'Ziel: Dorf — stelle etwas her',
  shell_collector:  'Ziel: Strand (durch den See)',
  master_angler:    'Ziel: See (Sueden) — fange Fische',
  crab_problem:     'Ziel: Strand (durch den See)',
  coral_healer:     'Ziel: Grotte (durch die Hoehle)',
  deep_explorer:    'Ziel: Grotte (durch die Hoehle)',
  sunken_treasure:  'Ziel: Grotte (durch die Hoehle)',
  cloud_jumper:     'Ziel: Wolkenschloss (durch die Wiese)',
  crystal_puzzle:   'Ziel: Wolkenschloss',
  shadow_slayer:    'Ziel: Wolkenschloss — besiege den Boss',
  secret_heroine:   'Ziel: Sternenhimmel',
};

const CONTROLS = [
  { key: 'WASD',       action: 'Laufen' },
  { key: 'Shift',      action: 'Rennen' },
  { key: 'Leertaste',  action: 'Angreifen' },
  { key: 'E',          action: 'Sprechen / Aufheben / Craften' },
  { key: 'F',          action: 'Heilen / Angeln / Wasser-Magie' },
  { key: 'I',          action: 'Inventar oeffnen' },
  { key: 'H',          action: 'Hilfe (dieses Menue)' },
  { key: '1-8',        action: 'Hotbar-Slot waehlen' },
  { key: 'Escape',     action: 'Menue schliessen' },
];

export class HelpOverlay {
  constructor() {
    this._open = false;

    // --- Container (fullscreen backdrop) ---
    this._container = document.createElement('div');
    this._container.id = 'help-overlay';
    this._container.style.display = 'none';
    document.body.appendChild(this._container);

    // --- Panel (centered content box) ---
    this._panel = document.createElement('div');
    this._panel.id = 'help-panel';
    this._container.appendChild(this._panel);

    // --- Header ---
    const header = document.createElement('div');
    header.id = 'help-header';
    header.innerHTML = `
      <span id="help-title">Hilfe</span>
      <button id="help-close">\u2715</button>
    `;
    this._panel.appendChild(header);

    // --- Body (two columns) ---
    this._body = document.createElement('div');
    this._body.id = 'help-body';
    this._panel.appendChild(this._body);

    // --- Add styles ---
    this._addStyles();

    // --- Close button ---
    this._panel.querySelector('#help-close').addEventListener('click', () => {
      this.close();
    });

    // --- Click outside closes ---
    this._clickOutsideHandler = (e) => {
      if (e.target === this._container) {
        this.close();
      }
    };
    this._container.addEventListener('click', this._clickOutsideHandler);

    // --- Escape keydown in capture phase (highest priority) ---
    this._escHandler = (e) => {
      if (e.code === 'Escape' && this._open) {
        this.close();
        e.stopPropagation();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', this._escHandler, true);
  }

  /**
   * Toggle the overlay open/closed.
   * @param {object|null} quest - Active quest object (from progression.getActiveQuest())
   * @param {string} currentScene - Current scene name
   */
  toggle(quest, currentScene) {
    if (this._open) {
      this.close();
    } else {
      this.open(quest, currentScene);
    }
  }

  /**
   * Open the overlay and render content.
   */
  open(quest, currentScene) {
    this._open = true;
    this._render(quest, currentScene);
    this._container.style.display = 'flex';
  }

  /**
   * Close the overlay.
   */
  close() {
    this._open = false;
    this._container.style.display = 'none';
  }

  /**
   * Whether the overlay is currently open.
   */
  get isOpen() {
    return this._open;
  }

  /**
   * Render the two-column layout: controls (left) + quest info (right).
   */
  _render(quest, currentScene) {
    this._body.innerHTML = '';

    // --- Left column: Tastenbelegung ---
    const leftCol = document.createElement('div');
    leftCol.className = 'help-col help-col-left';

    const leftTitle = document.createElement('div');
    leftTitle.className = 'help-col-title';
    leftTitle.textContent = 'Steuerung';
    leftCol.appendChild(leftTitle);

    const table = document.createElement('table');
    table.className = 'help-controls-table';
    for (const ctrl of CONTROLS) {
      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      keyCell.className = 'help-key-cell';
      const keyBadge = document.createElement('span');
      keyBadge.className = 'help-key-badge';
      keyBadge.textContent = ctrl.key;
      keyCell.appendChild(keyBadge);

      const actionCell = document.createElement('td');
      actionCell.className = 'help-action-cell';
      actionCell.textContent = ctrl.action;

      row.appendChild(keyCell);
      row.appendChild(actionCell);
      table.appendChild(row);
    }
    leftCol.appendChild(table);

    // --- Right column: Quest-Ratgeber ---
    const rightCol = document.createElement('div');
    rightCol.className = 'help-col help-col-right';

    const rightTitle = document.createElement('div');
    rightTitle.className = 'help-col-title';
    rightTitle.textContent = 'Aktuelle Quest';
    rightCol.appendChild(rightTitle);

    if (quest && quest.id) {
      // Quest name
      const questName = document.createElement('div');
      questName.className = 'help-quest-name';
      questName.textContent = quest.name || quest.id;
      rightCol.appendChild(questName);

      // Quest description
      if (quest.description) {
        const questDesc = document.createElement('div');
        questDesc.className = 'help-quest-desc';
        questDesc.textContent = quest.description;
        rightCol.appendChild(questDesc);
      }

      // Quest hint from QUEST_HINTS
      const hint = QUEST_HINTS[quest.id];
      if (hint) {
        const hintEl = document.createElement('div');
        hintEl.className = 'help-quest-hint';
        hintEl.textContent = hint;
        rightCol.appendChild(hintEl);
      }

      // Quest progress
      if (quest.count != null && quest.count > 0) {
        const progress = quest.progress != null ? quest.progress : 0;
        const progressEl = document.createElement('div');
        progressEl.className = 'help-quest-progress';
        progressEl.textContent = `Fortschritt: ${progress} von ${quest.count}`;

        // Progress bar
        const barWrap = document.createElement('div');
        barWrap.className = 'help-progress-bar-wrap';
        const barFill = document.createElement('div');
        barFill.className = 'help-progress-bar-fill';
        const pct = Math.min(100, Math.round((progress / quest.count) * 100));
        barFill.style.width = pct + '%';
        barWrap.appendChild(barFill);

        rightCol.appendChild(progressEl);
        rightCol.appendChild(barWrap);
      }
    } else {
      // No active quest
      const doneEl = document.createElement('div');
      doneEl.className = 'help-quest-done';
      doneEl.textContent = 'Alle Quests abgeschlossen!';
      rightCol.appendChild(doneEl);
    }

    // Scene info
    if (currentScene) {
      const sceneEl = document.createElement('div');
      sceneEl.className = 'help-scene-info';
      sceneEl.textContent = `Aktueller Ort: ${this._formatSceneName(currentScene)}`;
      rightCol.appendChild(sceneEl);
    }

    this._body.appendChild(leftCol);
    this._body.appendChild(rightCol);
  }

  /**
   * Format scene identifier to readable German name.
   */
  _formatSceneName(scene) {
    const names = {
      village: 'Dorf',
      forest: 'Wald',
      lake: 'See',
      dungeon: 'Hoehle',
      meadow: 'Einhornwiese',
      beach: 'Strand',
      grotto: 'Grotte',
      cloud_castle: 'Wolkenschloss',
      starry_sky: 'Sternenhimmel',
    };
    return names[scene] || scene;
  }

  /**
   * Add all CSS styles inline (same pattern as CraftingUI/TradeUI).
   */
  _addStyles() {
    if (document.getElementById('help-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'help-overlay-styles';
    style.textContent = `
      #help-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 400;
        pointer-events: auto;
      }

      #help-panel {
        background: rgba(15, 15, 35, 0.96);
        border: 3px solid rgba(255, 215, 0, 0.5);
        border-radius: 4px;
        padding: 20px 24px 24px;
        max-width: 600px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        font-family: 'Press Start 2P', monospace;
        box-shadow:
          0 0 0 2px rgba(0, 0, 0, 0.8),
          0 0 20px rgba(255, 215, 0, 0.15),
          inset 0 0 30px rgba(0, 0, 0, 0.3);
        image-rendering: pixelated;
      }

      #help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 10px;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
      }

      #help-title {
        color: #FFD700;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
      }

      #help-close {
        background: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: #888;
        font-size: 16px;
        cursor: pointer;
        padding: 4px 8px;
        font-family: 'Press Start 2P', monospace;
        transition: color 0.15s, border-color 0.15s;
      }
      #help-close:hover {
        color: #fff;
        border-color: rgba(255, 255, 255, 0.5);
      }

      #help-body {
        display: flex;
        gap: 16px;
      }

      .help-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .help-col-left {
        flex: 0 0 45%;
        min-width: 0;
      }

      .help-col-right {
        flex: 0 0 55%;
        min-width: 0;
        padding-left: 12px;
        border-left: 1px solid rgba(255, 255, 255, 0.08);
      }

      .help-col-title {
        color: #FFD700;
        font-size: 10px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 6px;
        text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
      }

      .help-controls-table {
        width: 100%;
        border-collapse: collapse;
      }

      .help-controls-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      }

      .help-controls-table td {
        padding: 5px 4px;
        vertical-align: middle;
      }

      .help-key-cell {
        width: 80px;
        text-align: right;
        padding-right: 8px;
      }

      .help-key-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 3px;
        padding: 2px 6px;
        color: #fff;
        font-size: 8px;
        font-family: 'Press Start 2P', monospace;
        text-align: center;
        min-width: 24px;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3);
      }

      .help-action-cell {
        color: #ccc;
        font-size: 8px;
        font-family: 'Press Start 2P', monospace;
        line-height: 1.4;
      }

      .help-quest-name {
        color: #FFD700;
        font-size: 11px;
        font-weight: bold;
        margin-bottom: 4px;
        text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
      }

      .help-quest-desc {
        color: #ccc;
        font-size: 8px;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .help-quest-hint {
        color: #7ec8e3;
        font-size: 8px;
        line-height: 1.5;
        padding: 6px 8px;
        background: rgba(126, 200, 227, 0.08);
        border: 1px solid rgba(126, 200, 227, 0.2);
        border-radius: 3px;
        margin-bottom: 8px;
      }

      .help-quest-progress {
        color: #aaa;
        font-size: 8px;
        margin-bottom: 4px;
      }

      .help-progress-bar-wrap {
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .help-progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #FFD700, #FFA500);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .help-quest-done {
        color: #44FF44;
        font-size: 10px;
        text-align: center;
        padding: 20px 8px;
        text-shadow: 0 0 8px rgba(68, 255, 68, 0.4);
      }

      .help-scene-info {
        color: #888;
        font-size: 7px;
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      /* Responsive: stack columns on narrow screens */
      @media (max-width: 520px) {
        #help-body {
          flex-direction: column;
        }
        .help-col-left,
        .help-col-right {
          flex: 1 1 auto;
        }
        .help-col-right {
          padding-left: 0;
          border-left: none;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove DOM elements and event listeners.
   */
  dispose() {
    window.removeEventListener('keydown', this._escHandler, true);
    if (this._container.parentNode) {
      this._container.remove();
    }
    const s = document.getElementById('help-overlay-styles');
    if (s) s.remove();
  }
}
