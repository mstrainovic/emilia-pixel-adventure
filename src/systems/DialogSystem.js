import { DialogUI } from '../ui/DialogUI.js';
import { distance } from '../utils/MathUtils.js';

// Map NPC IDs to their crafting station
const NPC_STATIONS = {
  mama_tanja: 'cooking',
  papa_milos: 'workbench',
  opa: 'sawmill',
  deda: 'alchemy',
  baba: null, // bonfire — cooking handled by mama
};

export class DialogSystem {
  constructor() {
    this.ui = new DialogUI();
    this.activeNPC = null;
    this.dialogIndex = 0;
    this.interactRange = 2.0;
    this.cooldown = 0;
    this.onDialogEnd = null; // callback: (npcId, stationId) => open crafting

    /** Optional pre-dialog hook: (npc) => boolean.
     *  Return true to cancel normal dialog (e.g. for pet selection). */
    this.beforeDialog = null;

    this.ui.onAdvance = () => this._advance();
  }

  update(dt, player, npcs, inputManager) {
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.ui.isOpen) return;
    if (this.cooldown > 0) return;

    // First check if any NPC is in range BEFORE consuming the E key.
    // This way ResourceNode and other systems can use E when no NPC is near.
    let nearest = null;
    let nearestDist = Infinity;

    for (const npc of npcs) {
      const dist = distance(player.x, player.y, npc.x, npc.y);
      if (dist < this.interactRange && dist < nearestDist) {
        nearest = npc;
        nearestDist = dist;
      }
    }

    if (nearest && inputManager.justPressed('KeyE')) {
      // Allow external hook to intercept (e.g. pet selection via Marie)
      if (this.beforeDialog && this.beforeDialog(nearest)) return;
      this._startDialog(nearest);
    }
  }

  _startDialog(npc) {
    this.activeNPC = npc;
    this.dialogIndex = 0;

    // Report NPC talk for quest tracking
    if (window.__game?.progression && npc._characterId) {
      window.__game.progression.reportTalk(npc._characterId);
    }

    // Friendship-based dialog selection
    const dialogs = this._selectDialogs(npc);
    this._activeDialogs = dialogs;
    if (dialogs.length === 0) return;

    this._showLine(npc, dialogs[0]);
  }

  /**
   * Waehlt Dialoge basierend auf Freundschafts-Level.
   * 50% Chance fuer friendshipDialogs wenn Level > 0.
   */
  _selectDialogs(npc) {
    const base = npc._dialogs || ['...'];
    const npcId = npc._characterId;
    if (!npcId) return base;

    const friendship = window.__game?.friendship;
    if (!friendship) return base;

    const level = friendship.getLevel(npcId);
    if (level <= 0) return base;

    // Hole NPC-Definition fuer friendshipDialogs
    const npcDefs = window.__game?._npcDefs;
    const def = npcDefs?.find(d => d.id === npcId);
    const fDialogs = def?.friendshipDialogs?.[level];

    if (fDialogs && fDialogs.length > 0 && Math.random() < 0.5) {
      return fDialogs;
    }

    return base;
  }

  _advance() {
    if (!this.activeNPC) return;

    const dialogs = this._activeDialogs || this.activeNPC._dialogs || [];
    this.dialogIndex++;

    if (this.dialogIndex < dialogs.length) {
      this._showLine(this.activeNPC, dialogs[this.dialogIndex]);
    } else {
      // Dialog finished — check if this NPC has a crafting station
      const npcId = this.activeNPC._characterId;
      const stationId = NPC_STATIONS[npcId];

      this.ui.hide();
      const finishedNPC = this.activeNPC;
      this.activeNPC = null;
      this.cooldown = 0.3;

      // Trigger callback for all NPC dialog ends
      if (this.onDialogEnd) {
        setTimeout(() => {
          this.onDialogEnd(npcId, stationId);
        }, 200);
      }
    }
  }

  _showLine(npc, text) {
    const colorHex = npc._labelColor
      ? '#' + (npc._labelColor.toString(16)).padStart(6, '0')
      : '#FFD700';
    this.ui.show(npc.name, text, colorHex);
  }

  /**
   * Show a choice dialog with buttons (e.g. pet selection).
   * @param {string} name — NPC name
   * @param {string} text — Prompt text
   * @param {Array<{text:string, action:Function}>} choices
   */
  showChoiceDialog(name, text, choices) {
    this.ui.showChoices(name, text, '#FFD700', choices);
  }

  get isActive() {
    return this.ui.isOpen;
  }

  dispose() {
    this.ui.dispose();
  }
}
