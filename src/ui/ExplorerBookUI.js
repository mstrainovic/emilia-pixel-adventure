import { BOOK_CATEGORIES } from '../systems/ExplorerBook.js';

/**
 * Explorer Book UI — tabbed overlay showing discovered entries per category.
 * Opened/closed via Tab key (controlled by Game.js).
 */
export class ExplorerBookUI {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'explorer-container';
    this.container.style.display = 'none';
    document.body.appendChild(this.container);
    this._addStyles();

    this.isOpen = false;
    this._activeTab = Object.keys(BOOK_CATEGORIES)[0];

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.hide();
    });
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) this.hide();
    });
  }

  /** Toggle visibility. Requires the ExplorerBook instance. */
  toggle(book) {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show(book);
    }
  }

  /** Show the overlay and render content from the given ExplorerBook. */
  show(book) {
    this.isOpen = true;
    this.container.style.display = 'flex';
    this._render(book);
  }

  /** Hide the overlay. */
  hide() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  /** Build the full HTML panel. */
  _render(book) {
    const total = book.getTotalProgress();

    const tabsHtml = Object.entries(BOOK_CATEGORIES).map(([key, cat]) => {
      const prog = book.getCategoryProgress(key);
      const isActive = key === this._activeTab;
      const complete = prog.found >= prog.total;
      return `
        <button
          class="explorer-tab${isActive ? ' explorer-tab-active' : ''}${complete ? ' explorer-tab-complete' : ''}"
          data-tab="${key}"
        >
          <span class="explorer-tab-icon">${cat.icon}</span>
          <span class="explorer-tab-name">${cat.name}</span>
          <span class="explorer-tab-prog">${prog.found}/${prog.total}</span>
        </button>
      `;
    }).join('');

    const activeCat = BOOK_CATEGORIES[this._activeTab];
    const catProg = book.getCategoryProgress(this._activeTab);
    const fillPct = catProg.total > 0 ? Math.round((catProg.found / catProg.total) * 100) : 0;

    const entriesHtml = activeCat.entries.map(entryId => {
      const isDiscovered = book.discovered.has(entryId);
      const label = isDiscovered ? entryId.replace(/_/g, ' ') : '???';
      return `
        <div class="explorer-entry${isDiscovered ? ' explorer-entry-found' : ''}">
          <span class="explorer-entry-icon">${isDiscovered ? activeCat.icon : '?'}</span>
          <span class="explorer-entry-name">${label}</span>
        </div>
      `;
    }).join('');

    const totalFillPct = total.total > 0 ? Math.round((total.found / total.total) * 100) : 0;

    this.container.innerHTML = `
      <div id="explorer-panel">
        <div id="explorer-header">
          <span id="explorer-title">📖 Entdecker-Buch</span>
          <button id="explorer-close">✕</button>
        </div>

        <div id="explorer-body">
          <div id="explorer-tabs">${tabsHtml}</div>

          <div id="explorer-content">
            <div id="explorer-cat-header">
              <span id="explorer-cat-title">${activeCat.icon} ${activeCat.name}</span>
              <span id="explorer-cat-count">${catProg.found} / ${catProg.total}</span>
            </div>

            <div id="explorer-progress-bar-wrap">
              <div id="explorer-progress-bar" style="width:${fillPct}%"></div>
            </div>

            <div id="explorer-entries">${entriesHtml}</div>
          </div>
        </div>

        <div id="explorer-footer">
          <span id="explorer-footer-label">Gesamt-Fortschritt:</span>
          <div id="explorer-total-bar-wrap">
            <div id="explorer-total-bar" style="width:${totalFillPct}%"></div>
          </div>
          <span id="explorer-footer-count">${total.found} / ${total.total}</span>
        </div>
      </div>
    `;

    document.getElementById('explorer-close').addEventListener('click', () => this.hide());

    document.querySelectorAll('.explorer-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeTab = btn.dataset.tab;
        this._render(book);
      });
    });
  }

  _addStyles() {
    if (document.getElementById('explorer-styles')) return;
    const style = document.createElement('style');
    style.id = 'explorer-styles';
    style.textContent = `
      #explorer-container {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center;
        z-index: 200; pointer-events: auto;
      }
      #explorer-panel {
        position: relative;
        background: rgba(20,15,30,0.95);
        border: 3px solid #DAA520;
        border-radius: 12px;
        width: 620px; max-width: 96vw;
        height: 420px; max-height: 90vh;
        display: flex; flex-direction: column;
        font-family: 'Press Start 2P', monospace;
        color: #fff;
        box-shadow: 0 0 32px rgba(218,165,32,0.25);
      }
      #explorer-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 16px;
        border-bottom: 2px solid #DAA520;
        flex-shrink: 0;
      }
      #explorer-title {
        color: #FFD700; font-size: 11px; letter-spacing: 1px;
      }
      #explorer-close {
        background: none; border: none; color: #888; font-size: 16px;
        cursor: pointer; padding: 2px 6px; font-family: inherit;
      }
      #explorer-close:hover { color: #fff; }
      #explorer-body {
        display: flex; flex: 1; overflow: hidden;
      }
      #explorer-tabs {
        display: flex; flex-direction: column;
        width: 170px; min-width: 170px;
        border-right: 2px solid rgba(218,165,32,0.4);
        overflow-y: auto;
        padding: 8px 0;
        gap: 2px;
      }
      .explorer-tab {
        background: none; border: none;
        border-left: 3px solid transparent;
        color: #aaa;
        font-family: 'Press Start 2P', monospace;
        font-size: 7px;
        text-align: left;
        padding: 10px 10px 10px 8px;
        cursor: pointer;
        display: flex; flex-direction: column; gap: 4px;
        transition: background 0.1s;
      }
      .explorer-tab:hover {
        background: rgba(218,165,32,0.08);
        color: #ddd;
      }
      .explorer-tab-active {
        background: rgba(218,165,32,0.15);
        border-left-color: #DAA520;
        color: #FFD700;
      }
      .explorer-tab-complete { color: #7fff7f; }
      .explorer-tab-complete.explorer-tab-active { color: #7fff7f; border-left-color: #7fff7f; }
      .explorer-tab-icon { font-size: 14px; }
      .explorer-tab-name { line-height: 1.4; }
      .explorer-tab-prog {
        color: rgba(255,255,255,0.4); font-size: 6px;
      }
      .explorer-tab-active .explorer-tab-prog { color: rgba(255,215,0,0.6); }
      #explorer-content {
        flex: 1; display: flex; flex-direction: column;
        padding: 12px; overflow: hidden;
        gap: 8px;
      }
      #explorer-cat-header {
        display: flex; justify-content: space-between; align-items: center;
        flex-shrink: 0;
      }
      #explorer-cat-title { color: #FFD700; font-size: 8px; }
      #explorer-cat-count { color: #aaa; font-size: 7px; }
      #explorer-progress-bar-wrap {
        height: 8px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(218,165,32,0.3);
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
      }
      #explorer-progress-bar {
        height: 100%; background: #DAA520;
        border-radius: 4px;
        transition: width 0.3s ease;
        min-width: 0;
      }
      #explorer-entries {
        flex: 1; overflow-y: auto;
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 6px; align-content: start;
      }
      .explorer-entry {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        padding: 7px 8px;
        display: flex; align-items: center; gap: 6px;
        font-size: 6px;
        color: #666;
      }
      .explorer-entry-found {
        background: rgba(218,165,32,0.08);
        border-color: rgba(218,165,32,0.25);
        color: #FFD700;
      }
      .explorer-entry-icon { font-size: 12px; flex-shrink: 0; }
      .explorer-entry-name {
        text-transform: capitalize; line-height: 1.4;
        word-break: break-word;
      }
      #explorer-footer {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 16px;
        border-top: 2px solid rgba(218,165,32,0.4);
        flex-shrink: 0;
      }
      #explorer-footer-label { color: #888; font-size: 6px; white-space: nowrap; }
      #explorer-total-bar-wrap {
        flex: 1; height: 7px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(218,165,32,0.3);
        border-radius: 4px;
        overflow: hidden;
      }
      #explorer-total-bar {
        height: 100%; background: linear-gradient(90deg, #DAA520, #FFD700);
        border-radius: 4px;
        transition: width 0.3s ease;
        min-width: 0;
      }
      #explorer-footer-count { color: #FFD700; font-size: 7px; white-space: nowrap; }
    `;
    document.head.appendChild(style);
  }

  dispose() {
    if (this.container.parentNode) this.container.remove();
    const s = document.getElementById('explorer-styles');
    if (s) s.remove();
  }
}
