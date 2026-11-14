// Die Spielsitzung: ruft die Logik aus systems/ auf und meldet jede Änderung über den Ereignisverteiler.
// Oberfläche, Speichern und Szene hören nur zu und rufen diese Klasse auf.
import type { GameState } from './state';
import type { EventBus, GameEvents } from './events';
import { NPCS } from '../data/npcs';
import { pickLine, wrapLines, DIALOG_LINE_CHARS } from '../systems/dialogue';
import { deliverPending, selectHotbar } from '../systems/inventory';
import { ensureActiveQuest, reportSignal, type QuestChange } from '../systems/quests';
import { friendshipLevel, questFriendship, talkFriendship, type FriendChange } from '../systems/friendship';
import { advanceClock, dayNumber } from '../systems/dayclock';

export interface TalkView { npcId: string; name: string; lines: string[] }

/** Was Rucksack und Werte zeigen, zum Vergleichen vor und nach einer Änderung. */
function snapshot(state: GameState): { inventory: string; stats: string } {
  const { slots, coins } = state.inventory;
  const { level, xp } = state.progression;
  return {
    inventory: JSON.stringify([slots, state.pendingItems]),
    stats: JSON.stringify([state.player.hp, level, xp, coins]),
  };
}

export class GameSession {
  /** Gespräche je Dorfbewohner in dieser Sitzung (wird nicht gespeichert). */
  private readonly talkCount = new Map<string, number>();

  constructor(private readonly state: GameState, private readonly bus: EventBus<GameEvents>) {}

  /** Erste Aufgabe anlegen, wartende Belohnungen ablegen. */
  start(): void {
    const before = snapshot(this.state);
    const changes = ensureActiveQuest(this.state);
    deliverPending(this.state);
    this.emitQuests(changes);
    this.emitChanged(before);
  }

  /** `null` bei unbekannter Kennung. */
  talkTo(npcId: string): TalkView | null {
    const npc = NPCS.find((n) => n.id === npcId);
    if (!npc) return null;
    const before = snapshot(this.state);
    const count = this.talkCount.get(npcId) ?? 0;
    // die Stufe VOR dem Gespräch bestimmt den Satz
    const level = friendshipLevel(this.state.friendship[npcId]?.points ?? 0);
    const line = pickLine(npc, count, level);
    this.talkCount.set(npcId, count + 1);

    const quests = reportSignal(this.state, { type: 'talk', target: npcId, amount: 1 });
    const friends: FriendChange[] = [talkFriendship(this.state, npcId, dayNumber(this.state))];
    for (const change of quests) {
      if (!change.completed) continue;
      const friend = questFriendship(this.state, change.questId);
      if (friend) friends.push(friend);
    }

    this.bus.emit('npc:talked', { npcId });
    this.emitQuests(quests);
    for (const friend of friends) if (friend.gained > 0) this.bus.emit('friendship:changed', friend);
    this.emitChanged(before);
    return { npcId, name: npc.name, lines: wrapLines(line, DIALOG_LINE_CHARS) };
  }

  selectHotbar(index: number): void {
    const before = this.state.inventory.selectedHotbar;
    if (selectHotbar(this.state, index) && this.state.inventory.selectedHotbar !== before) {
      this.bus.emit('inventory:changed', {});
    }
  }

  /** Uhr weiterstellen; wartende Belohnungen ablegen, sobald Platz ist. Läuft jedes Bild, meldet sonst nichts. */
  tick(dt: number): void {
    advanceClock(this.state, dt);
    if (this.state.pendingItems.length > 0 && deliverPending(this.state)) this.bus.emit('inventory:changed', {});
  }

  private emitQuests(changes: QuestChange[]): void {
    for (const change of changes) this.bus.emit('quest:changed', change);
  }

  private emitChanged(before: { inventory: string; stats: string }): void {
    const after = snapshot(this.state);
    if (after.inventory !== before.inventory) this.bus.emit('inventory:changed', {});
    if (after.stats !== before.stats) this.bus.emit('stats:changed', {});
  }
}
