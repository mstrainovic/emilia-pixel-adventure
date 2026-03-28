/**
 * TrophyShelf — DOM-basiertes Overlay das Emilias Sammlung zeigt.
 * Vier Kategorien: Bosse, Raritaeten, Achievements, Freundschaften.
 * Oeffnet/schliesst mit Escape, Click-Outside, oder X-Button.
 * z-index: 350 (unter HelpOverlay 400).
 */

const TROPHIES = {
  bosses: [
    { id: 'beach_crown',     name: 'Strandkrone',       icon: '\u{1F451}', from: 'Coconut King' },
    { id: 'leviathan_pearl', name: 'Leviathan-Perle',   icon: '\u{1F52E}', from: 'Leviathan' },
    { id: 'shadow_essence',  name: 'Schatten-Essenz',   icon: '\u{1F311}', from: 'Schatten-Ritter' },
    { id: 'rainbow_sword',   name: 'Regenbogenschwert', icon: '\u2694\uFE0F', from: 'Endgame' },
  ],
  rares: [
    { id: 'old_coin',        name: 'Alte Muenze',    icon: '\u{1FA99}' },
    { id: 'fairy_dust',      name: 'Feenstaub',      icon: '\u2728' },
    { id: 'fossil',          name: 'Fossil',          icon: '\u{1F9B4}' },
    { id: 'message_bottle',  name: 'Flaschenpost',   icon: '\u{1F4DC}' },
    { id: 'lost_diary',      name: 'Tagebuch',        icon: '\u{1F4D6}' },
    { id: 'golden_feather',  name: 'Goldene Feder',  icon: '\u{1FAB6}' },
  ],
};

/** NPC IDs with display names for the friendship section */
const NPC_DISPLAY = [
  { id: 'mama_tanja', name: 'Mama Tanja' },
  { id: 'papa_milos', name: 'Papa Milos' },
  { id: 'marie',      name: 'Marie' },
  { id: 'liam',       name: 'Liam' },
  { id: 'oma',        name: 'Oma' },
  { id: 'opa',        name: 'Opa' },
  { id: 'baba',       name: 'Baba' },
  { id: 'deda',       name: 'Deda' },
  { id: 'ferdinand',  name: 'Ferdinand' },
];

export class TrophyShelf {
  constructor() {
    this._open = false;

    // --- Container (fullscreen backdrop) ---
    this._container = document.createElement('div');
    this._container.id = 'trophy-shelf';
    this._container.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 350;
      pointer-events: auto;
    `;
    document.body.appendChild(this._container);

    // --- Panel (centered content box) ---
    this._panel = document.createElement('div');
    this._panel.id = 'trophy-panel';
    this._panel.style.cssText = `
      background: rgba(15, 15, 35, 0.96);
      border: 3px solid rgba(255, 215, 0, 0.5);
      border-radius: 4px;
      padding: 20px 24px 24px;
      max-width: 550px;
      width: 92%;
      max-height: 85vh;
      overflow-y: auto;
      font-family: 'Press Start 2P', monospace;
      box-shadow:
        0 0 0 2px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(255, 215, 0, 0.15),
        inset 0 0 30px rgba(0, 0, 0, 0.3);
      image-rendering: pixelated;
    `;
    this._container.appendChild(this._panel);

    // --- Header ---
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255, 215, 0, 0.3);
    `;
    this._titleEl = document.createElement('span');
    this._titleEl.textContent = 'Emilias Sammlung';
    this._titleEl.style.cssText = `
      color: #FFD700;
      font-size: 14px;
      font-weight: bold;
      text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
    `;
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u2715';
    closeBtn.style.cssText = `
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #888;
      font-size: 16px;
      cursor: pointer;
      padding: 4px 8px;
      font-family: 'Press Start 2P', monospace;
      transition: color 0.15s, border-color 0.15s;
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = '#fff';
      closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = '#888';
      closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    closeBtn.addEventListener('click', () => this.hide());

    header.appendChild(this._titleEl);
    header.appendChild(closeBtn);
    this._panel.appendChild(header);

    // --- Body ---
    this._body = document.createElement('div');
    this._body.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 18px;
    `;
    this._panel.appendChild(this._body);

    // --- Click outside closes ---
    this._clickOutsideHandler = (e) => {
      if (e.target === this._container) {
        this.hide();
      }
    };
    this._container.addEventListener('click', this._clickOutsideHandler);

    // --- Escape keydown in capture phase ---
    this._escHandler = (e) => {
      if (e.code === 'Escape' && this._open) {
        this.hide();
        e.stopPropagation();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', this._escHandler, true);
  }

  /**
   * Show the trophy shelf overlay with current game state.
   * @param {object} gameState - { inventory, collectedRareFinds, achievements, friendship }
   *   inventory: Inventory instance (has .hasItem(id))
   *   collectedRareFinds: Set<string>
   *   achievements: AchievementSystem instance
   *   friendship: FriendshipSystem instance
   */
  show(gameState) {
    this._open = true;
    this._render(gameState);
    this._container.style.display = 'flex';
  }

  hide() {
    this._open = false;
    this._container.style.display = 'none';
  }

  get isOpen() {
    return this._open;
  }

  /**
   * Render all four category sections.
   */
  _render(gameState) {
    this._body.innerHTML = '';

    const { inventory, collectedRareFinds, achievements, friendship } = gameState || {};
    const rareSet = collectedRareFinds instanceof Set
      ? collectedRareFinds
      : new Set(Array.isArray(collectedRareFinds) ? collectedRareFinds : []);

    // --- Section 1: Bosse ---
    this._body.appendChild(this._renderSection(
      'Bosse',
      this._renderBosses(inventory, rareSet)
    ));

    // --- Section 2: Raritaeten ---
    this._body.appendChild(this._renderSection(
      'Raritaeten',
      this._renderRares(rareSet)
    ));

    // --- Section 3: Achievements ---
    this._body.appendChild(this._renderSection(
      'Achievements',
      this._renderAchievements(achievements)
    ));

    // --- Section 4: Freundschaften ---
    this._body.appendChild(this._renderSection(
      'Freundschaften',
      this._renderFriendships(friendship)
    ));
  }

  /**
   * Create a section wrapper with title.
   */
  _renderSection(title, contentEl) {
    const section = document.createElement('div');

    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      color: #FFD700;
      font-size: 9px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);
    `;
    section.appendChild(titleEl);
    section.appendChild(contentEl);

    return section;
  }

  /**
   * Render boss trophy grid.
   * An item is "collected" if it exists in inventory OR in collectedRareFinds.
   */
  _renderBosses(inventory, rareSet) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    `;

    for (const boss of TROPHIES.bosses) {
      const hasItem = (inventory && inventory.hasItem(boss.id))
        || rareSet.has(boss.id);
      grid.appendChild(this._renderTrophyCell(boss.icon, boss.name, boss.from, hasItem));
    }

    return grid;
  }

  /**
   * Render rare finds grid.
   */
  _renderRares(rareSet) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    `;

    for (const rare of TROPHIES.rares) {
      const has = rareSet.has(rare.id);
      grid.appendChild(this._renderTrophyCell(rare.icon, rare.name, null, has));
    }

    return grid;
  }

  /**
   * Render a single trophy cell (boss or rare).
   */
  _renderTrophyCell(icon, name, subtitle, collected) {
    const cell = document.createElement('div');

    if (collected) {
      cell.style.cssText = `
        background: rgba(255, 215, 0, 0.1);
        border: 2px solid rgba(255, 215, 0, 0.6);
        border-radius: 6px;
        padding: 8px 4px;
        text-align: center;
        box-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
      `;
    } else {
      cell.style.cssText = `
        background: rgba(40, 40, 50, 0.4);
        border: 2px solid rgba(80, 80, 90, 0.4);
        border-radius: 6px;
        padding: 8px 4px;
        text-align: center;
      `;
    }

    // Icon or "?"
    const iconEl = document.createElement('div');
    iconEl.style.cssText = `font-size: 20px; margin-bottom: 4px;`;
    if (collected) {
      iconEl.textContent = icon;
    } else {
      iconEl.textContent = '?';
      iconEl.style.color = '#555';
      iconEl.style.fontSize = '18px';
      iconEl.style.fontFamily = "'Press Start 2P', monospace";
    }
    cell.appendChild(iconEl);

    // Name
    const nameEl = document.createElement('div');
    nameEl.style.cssText = `
      font-size: 6px;
      font-family: 'Press Start 2P', monospace;
      line-height: 1.4;
      margin-top: 2px;
      color: ${collected ? '#ddd' : '#555'};
    `;
    nameEl.textContent = collected ? name : '???';
    cell.appendChild(nameEl);

    // Subtitle (boss origin)
    if (subtitle) {
      const subEl = document.createElement('div');
      subEl.style.cssText = `
        font-size: 5px;
        font-family: 'Press Start 2P', monospace;
        color: ${collected ? '#999' : '#444'};
        margin-top: 2px;
      `;
      subEl.textContent = collected ? subtitle : '';
      cell.appendChild(subEl);
    }

    return cell;
  }

  /**
   * Render achievements counter with progress bar.
   */
  _renderAchievements(achievementSystem) {
    const wrap = document.createElement('div');

    const count = achievementSystem ? achievementSystem.getCount() : 0;
    const total = achievementSystem ? achievementSystem.getTotal() : 30;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    // Counter text
    const counterEl = document.createElement('div');
    counterEl.style.cssText = `
      color: #ccc;
      font-size: 8px;
      font-family: 'Press Start 2P', monospace;
      margin-bottom: 6px;
    `;
    counterEl.textContent = `${count} von ${total} freigeschaltet`;
    wrap.appendChild(counterEl);

    // Progress bar wrapper
    const barWrap = document.createElement('div');
    barWrap.style.cssText = `
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
    `;

    // Progress bar fill
    const barFill = document.createElement('div');
    barFill.style.cssText = `
      height: 100%;
      width: ${pct}%;
      background: linear-gradient(90deg, #FFD700, #FFA500);
      border-radius: 4px;
      transition: width 0.3s ease;
    `;
    barWrap.appendChild(barFill);
    wrap.appendChild(barWrap);

    // Percentage label
    const pctEl = document.createElement('div');
    pctEl.style.cssText = `
      color: #888;
      font-size: 7px;
      font-family: 'Press Start 2P', monospace;
      margin-top: 4px;
      text-align: right;
    `;
    pctEl.textContent = `${pct}%`;
    wrap.appendChild(pctEl);

    return wrap;
  }

  /**
   * Render friendship hearts for all 9 NPCs.
   */
  _renderFriendships(friendship) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    `;

    for (const npc of NPC_DISPLAY) {
      const hearts = friendship ? friendship.getHearts(npc.id) : 0;
      grid.appendChild(this._renderNpcCard(npc.name, hearts));
    }

    return grid;
  }

  /**
   * Render a single NPC friendship card with hearts.
   */
  _renderNpcCard(name, hearts) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(40, 40, 55, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      padding: 6px;
      text-align: center;
    `;

    // NPC name
    const nameEl = document.createElement('div');
    nameEl.style.cssText = `
      font-size: 6px;
      font-family: 'Press Start 2P', monospace;
      color: #ccc;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    nameEl.textContent = name;
    card.appendChild(nameEl);

    // Hearts row (3 max)
    const heartsEl = document.createElement('div');
    heartsEl.style.cssText = `
      font-size: 10px;
      letter-spacing: 2px;
    `;
    let heartsStr = '';
    for (let i = 0; i < 3; i++) {
      if (i < hearts) {
        // Filled red heart
        heartsStr += '<span style="color: #FF4444;">\u2665</span>';
      } else {
        // Empty grey heart
        heartsStr += '<span style="color: #555;">\u2661</span>';
      }
    }
    heartsEl.innerHTML = heartsStr;
    card.appendChild(heartsEl);

    return card;
  }

  /**
   * Remove DOM elements and event listeners.
   */
  dispose() {
    window.removeEventListener('keydown', this._escHandler, true);
    if (this._container.parentNode) {
      this._container.remove();
    }
  }
}
