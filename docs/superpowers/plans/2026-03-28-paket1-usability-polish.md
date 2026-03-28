# Paket 1: Usability-Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tutorial-Tooltips (8 contextual hints for first-time actions) and Help-Overlay (H-key pause screen with controls + quest guide) to improve onboarding for a 6-year-old player.

**Architecture:** Two independent DOM-based UI modules (TutorialTooltips.js, HelpOverlay.js) integrated into Game.js. SaveManager extended for tooltip persistence. No changes to rendering, combat, or game logic.

**Tech Stack:** Vanilla JS, DOM/CSS, existing Game.js loop integration

**Spec:** `docs/superpowers/specs/2026-03-28-paket1-usability-polish-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/ui/TutorialTooltips.js` | CREATE | Tutorial tooltip system — triggers, display, persistence |
| `src/ui/HelpOverlay.js` | CREATE | H-key help screen — controls table + quest guide |
| `src/systems/SaveManager.js` | MODIFY | Add `seenTooltips` to save/load (line ~27, ~55) |
| `src/core/Game.js` | MODIFY | Import, instantiate, wire update calls, H-key handler, uiBlocking, NG+ reset |

---

### Task 1: TutorialTooltips — Core Module

**Files:**
- Create: `src/ui/TutorialTooltips.js`

- [ ] **Step 1: Create TutorialTooltips.js with DOM element and CSS**

Create the file with: constructor (DOM element, styles, empty seenTooltips Set), show/hide methods, dispose. The tooltip is a fixed-position golden speech bubble at bottom-center.

```javascript
// src/ui/TutorialTooltips.js
import { getItem } from '../data/items.js';

const TOOLTIPS = [
  { id: 'move',      text: 'WASD zum Laufen, Shift zum Rennen' },
  { id: 'talk',      text: 'Druecke E zum Sprechen' },
  { id: 'heal',      text: 'Druecke F zum Heilen' },
  { id: 'fight',     text: 'Leertaste zum Kaempfen' },
  { id: 'craft',     text: 'Druecke E zum Herstellen' },
  { id: 'fish',      text: 'Druecke F zum Angeln' },
  { id: 'pickup',    text: 'Druecke E zum Aufheben' },
  { id: 'inventory', text: 'Druecke I fuers Inventar' },
];

export class TutorialTooltips {
  constructor() {
    this._seen = new Set();
    this._activeId = null;
    this._idleTimer = 0;
    this._el = document.createElement('div');
    this._el.id = 'tutorial-tooltip';
    this._el.style.cssText = `
      position:fixed; bottom:120px; left:50%; transform:translateX(-50%);
      background:rgba(40,30,15,0.92); border:2px solid #8B7355;
      border-radius:6px; padding:10px 18px;
      color:#FFD700; font-family:'Press Start 2P',monospace; font-size:10px;
      max-width:350px; text-align:center; z-index:250;
      pointer-events:none; opacity:0; transition:opacity 0.3s ease;
      box-shadow:0 4px 12px rgba(0,0,0,0.5);
    `;
    // Arrow pointing down
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position:absolute; bottom:-8px; left:50%; transform:translateX(-50%);
      width:0; height:0;
      border-left:8px solid transparent; border-right:8px solid transparent;
      border-top:8px solid #8B7355;
    `;
    this._el.appendChild(arrow);
    this._textNode = document.createElement('span');
    this._el.prepend(this._textNode);
    document.body.appendChild(this._el);
  }

  // ... (update, markSeen, etc. in next steps)
}
```

- [ ] **Step 2: Add trigger checking logic (update method)**

Add the `update(dt, ctx)` method. It checks each tooltip trigger in priority order, shows the first matching unseen tooltip, and dismisses when condition is met.

```javascript
  update(dt, ctx) {
    // Check dismissal of active tooltip first
    if (this._activeId) {
      if (this._shouldDismiss(this._activeId, ctx)) {
        this.markSeen(this._activeId);
        return;
      }
    }

    // Find highest-priority unseen tooltip whose trigger fires
    for (const tip of TOOLTIPS) {
      if (this._seen.has(tip.id)) continue;
      if (this._activeId === tip.id) break; // already showing this one
      if (this._checkTrigger(tip.id, dt, ctx)) {
        this._show(tip);
        break;
      }
    }
  }

  _checkTrigger(id, dt, ctx) {
    const { player, npcs, mobs, tileMap, inventory, fishing, itemDrops } = ctx;
    const dist = (ax, ay, bx, by) => Math.sqrt((ax-bx)**2 + (ay-by)**2);

    switch (id) {
      case 'move':
        if (!ctx.isNewGame) return false;
        this._idleTimer += dt;
        if (ctx.input.moveX !== 0 || ctx.input.moveY !== 0) this._idleTimer = 0;
        return this._idleTimer > 3;
      case 'talk':
        return npcs?.some(n => dist(player.x, player.y, n.x, n.y) < 2.5);
      case 'heal':
        return tileMap?.props?.some(p => p.type === 'wilted_plant' && dist(player.x, player.y, p.x, p.y) < 2.5);
      case 'fight':
        return inventory?.slots.some(s => getItem(s.itemId)?.category === 'weapon')
          && mobs?.some(m => m.alive && dist(player.x, player.y, m.x, m.y) < 5);
      case 'craft':
        return tileMap?.props?.some(p => p.type === 'station' && dist(player.x, player.y, p.x + 0.5, p.y + 0.5) < 4);
      case 'fish':
        return fishing?.fishingSpots?.some(s => dist(player.x, player.y, s.x, s.y) < 2.5);
      case 'pickup':
        return itemDrops?.drops?.some(d => dist(player.x, player.y, d.x, d.y) < 2);
      case 'inventory': {
        let count = 0;
        if (inventory) for (const s of inventory.slots) if (s.itemId) count++;
        return count >= 5;
      }
      default: return false;
    }
  }

  _shouldDismiss(id, ctx) {
    switch (id) {
      case 'move': return ctx.input.moveX !== 0 || ctx.input.moveY !== 0;
      case 'talk': return ctx.dialog?.isActive;
      case 'heal': return false; // dismissed by plantHealing callback
      case 'fight': return ctx.combat?.isAttacking;
      case 'craft': return ctx.crafting?.isActive;
      case 'fish': return ctx.fishing?.isActive;
      case 'pickup': return false; // dismissed by itemDrop pickup callback
      case 'inventory': return ctx.hud?.isInventoryOpen();
      default: return false;
    }
  }
```

- [ ] **Step 3: Add show/hide/markSeen/state methods**

```javascript
  _show(tip) {
    this._activeId = tip.id;
    this._textNode.textContent = tip.text;
    this._el.style.opacity = '1';
  }

  _hide() {
    this._activeId = null;
    this._el.style.opacity = '0';
  }

  markSeen(id) {
    this._seen.add(id);
    if (this._activeId === id) this._hide();
  }

  loadState(seenArray) {
    this._seen = new Set(seenArray || []);
  }

  getState() {
    return [...this._seen];
  }

  dispose() {
    if (this._el.parentNode) this._el.remove();
  }
```

- [ ] **Step 4: Build and verify no errors**

Run: `npm run build`
Expected: 108+ modules transformed, no errors

- [ ] **Step 5: Commit**

```bash
git add src/ui/TutorialTooltips.js
git commit -m "feat: TutorialTooltips — 8 kontextuelle Hinweise fuer Erstaktionen"
```

---

### Task 2: HelpOverlay — Core Module

**Files:**
- Create: `src/ui/HelpOverlay.js`

- [ ] **Step 1: Create HelpOverlay.js with full implementation**

Two-column layout: controls (left) + quest guide (right). Opens/closes with H, Escape, or click-outside. Own keydown listener for Escape.

```javascript
// src/ui/HelpOverlay.js

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

export class HelpOverlay {
  constructor() {
    this._open = false;
    this._container = document.createElement('div');
    this._container.id = 'help-overlay';
    // ... full DOM + CSS + keydown listener
    // (complete code in implementation)
    document.body.appendChild(this._container);
    this._container.style.display = 'none';
    this._addStyles();
    this._escHandler = (e) => {
      if (e.code === 'Escape' && this._open) { this.close(); e.stopPropagation(); }
    };
    window.addEventListener('keydown', this._escHandler, true); // capture phase = first
  }

  toggle(quest, currentScene) {
    if (this._open) this.close();
    else this.open(quest, currentScene);
  }

  open(quest, currentScene) {
    this._open = true;
    this._render(quest, currentScene);
    this._container.style.display = 'flex';
  }

  close() {
    this._open = false;
    this._container.style.display = 'none';
  }

  get isOpen() { return this._open; }

  _render(quest, currentScene) {
    // Build left column (controls) + right column (quest info)
    // Quest hint from QUEST_HINTS[quest.id] or "Alle Quests abgeschlossen!"
    // Progress: quest.progress + "/" + quest.count
  }

  dispose() {
    window.removeEventListener('keydown', this._escHandler, true);
    if (this._container.parentNode) this._container.remove();
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: 109+ modules, no errors

- [ ] **Step 3: Commit**

```bash
git add src/ui/HelpOverlay.js
git commit -m "feat: HelpOverlay — H-Taste Hilfe mit Steuerung + Quest-Ratgeber"
```

---

### Task 3: SaveManager — seenTooltips Persistence

**Files:**
- Modify: `src/systems/SaveManager.js` (lines 27, 55)

- [ ] **Step 1: Add seenTooltips to save()**

In `save()`, after line 39 (`data.collectedRareFinds = ...`), add:
```javascript
    data.seenTooltips = gameState.seenTooltips || [];
```

- [ ] **Step 2: Ensure load() returns seenTooltips with fallback**

No change needed in `load()` — it returns the raw `data` object. The consumer (Game.js) will use `data.seenTooltips || []`.

- [ ] **Step 3: Build and verify**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/systems/SaveManager.js
git commit -m "feat: SaveManager — seenTooltips Feld fuer Tutorial-Persistenz"
```

---

### Task 4: Game.js Integration — Wire Everything Together

**Files:**
- Modify: `src/core/Game.js`

- [ ] **Step 1: Add imports (after line ~74)**

```javascript
import { TutorialTooltips } from '../ui/TutorialTooltips.js';
import { HelpOverlay } from '../ui/HelpOverlay.js';
```

- [ ] **Step 2: Instantiate in constructor (after questWaypoint/minimap, ~line 243)**

```javascript
    this.tutorialTooltips = new TutorialTooltips();
    this.helpOverlay = new HelpOverlay();
    this._isNewGame = false; // set to true on new game, false on load
```

- [ ] **Step 3: Wire new-game flag in start/load flow**

Find where new game starts (main menu "Neues Spiel" handler) — set `this._isNewGame = true`.
Find where game loads (main menu "Weiterspielen" handler) — set `this._isNewGame = false` and `this.tutorialTooltips.loadState(saveData.seenTooltips || [])`.

- [ ] **Step 4: Add H-key handler BEFORE uiBlocking (in _loop(), before the uiBlocking line)**

```javascript
    // Help overlay toggle — BEFORE uiBlocking check
    if (this.input.justPressed('KeyH') && this.helpOverlay) {
      const activeQuest = this.progression.getActiveQuest();
      this.helpOverlay.toggle(activeQuest, this.sceneManager.currentScene);
    }
```

- [ ] **Step 5: Add helpOverlay.isOpen to uiBlocking**

Find the `const uiBlocking = ...` line and append:
```javascript
    const uiBlocking = this.dialog.isActive || this.crafting.isActive || (this.tradeUI && this.tradeUI.isOpen) || this.fishing.isActive || this.explorerBookUI.isOpen || this.hud.isInventoryOpen() || (this.helpOverlay && this.helpOverlay.isOpen);
```

- [ ] **Step 6: Add tutorialTooltips.update() call (after HUD update, before render)**

```javascript
    // Tutorial tooltips
    if (this.tutorialTooltips) {
      this.tutorialTooltips.update(dt, {
        player: this.player, npcs: this.npcs, mobs: this.mobs,
        tileMap: this.tileMap, inventory: this.inventory, input: this.input,
        dialog: this.dialog, crafting: this.crafting, fishing: this.fishing,
        combat: this.combat, itemDrops: this.itemDrops, hud: this.hud,
        isNewGame: this._isNewGame,
      });
    }
```

- [ ] **Step 7: Add seenTooltips to save call**

Find where `this.saveManager.save(...)` is called and add `seenTooltips: this.tutorialTooltips?.getState() || []` to the gameState object.

- [ ] **Step 8: Add NG+ reset**

Find the NG+ activation code (~line 2362) and add:
```javascript
    if (this.tutorialTooltips) this.tutorialTooltips.loadState([]);
```

- [ ] **Step 9: Build and verify**

Run: `npm run build`
Expected: 109 modules, no errors

- [ ] **Step 10: Full manual test**

1. Start new game → movement tooltip appears after 3s idle
2. Walk to Mama Tanja → "Druecke E" tooltip appears
3. Open help with H → two-column overlay, quest info shown
4. Close with Escape → game resumes
5. Save and reload → tooltips already seen don't reappear

- [ ] **Step 11: Commit**

```bash
git add src/core/Game.js
git commit -m "feat: Game.js — TutorialTooltips + HelpOverlay Integration"
```

- [ ] **Step 12: Push all commits**

```bash
git push
```
