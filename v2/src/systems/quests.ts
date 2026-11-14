// Aufgaben als reine Funktionen über dem Spielstand: keine Szene, kein Speicher, kein Zufall.
// Alt: src/systems/Progression.js — Reihenfolge Zeilen 6–16, Zählen und Abschließen (_checkQuestType) 290–314,
// nächste Aufgabe (_unlockNextQuest) 316–325, Vorbelegen (_prepopulateQuestProgress) 331–400, erste Aufgabe 506–509.
import type { GameState } from '../core/state';
import { QUESTS, QUEST_ORDER } from '../data/quests';
import type { QuestDef } from '../data/types';
import { addItem } from './inventory';
import { addXp } from './progress';

export type QuestSignal = { type: 'talk' | 'collect' | 'heal' | 'craft' | 'visit' | 'pet'; target: string; amount: number };

export interface QuestChange {
  questId: string;
  progress: number;
  count: number;
  completed: boolean;
  xp: number;
  levelsGained: number;
}

/** Höchstzahl der Abschlüsse hintereinander (es gibt 25 Aufgaben). */
const MAX_CHAIN = 25;

const SIGNAL_TYPES: readonly string[] = ['talk', 'collect', 'heal', 'craft', 'visit', 'pet'];

/** Zähler aus schon Erlebtem für eine frisch aktivierte Aufgabe (nur die Typen eines QuestSignal). */
function existingProgress(state: GameState, def: QuestDef): number {
  const { stats } = state.progression;
  const target = String(def.target);
  switch (def.type) {
    case 'talk': return stats.npcsSpoken.includes(target) ? 1 : 0;
    case 'collect': return stats.itemsCollected[target] ?? 0;
    case 'heal': return def.target === 'plant' ? stats.plantsHealed : 0;
    case 'craft': return stats.itemsCrafted;
    case 'pet': return def.target === 'unicorn' ? stats.unicornsPetted : 0;
    case 'visit': return (state.visitedMaps as string[]).includes(target) ? 1 : 0;
    default: return 0;
  }
}

function activate(state: GameState, questId: string): void {
  const def = QUESTS[questId]!;
  const progress = Math.min(def.count, Math.max(0, existingProgress(state, def)));
  state.progression.activeQuests[questId] = { progress };
}

function firstOpenQuestId(state: GameState): string | undefined {
  const { completedQuests, activeQuests } = state.progression;
  return QUEST_ORDER.find((id) => !completedQuests.includes(id) && !(id in activeQuests));
}

/** Schließt `questId` ab, zahlt aus und aktiviert die nächste. */
function complete(state: GameState, questId: string): QuestChange {
  const def = QUESTS[questId]!;
  const prog = state.progression;
  delete prog.activeQuests[questId];
  prog.completedQuests.push(questId);
  prog.completedQuests.sort((a, b) => QUEST_ORDER.indexOf(a) - QUEST_ORDER.indexOf(b));

  const { levelsGained } = addXp(state, def.xpReward);
  for (const reward of def.itemReward) {
    const rest = addItem(state, reward.itemId, reward.count);
    if (rest >= 1) {
      const waiting = state.pendingItems.find((p) => p.itemId === reward.itemId);
      if (waiting) waiting.count += rest;
      else state.pendingItems.push({ itemId: reward.itemId, count: rest });
    }
  }

  // Nächste Aufgabe der Kette (Alt: _unlockNextQuest), sonst die erste noch offene.
  const idx = QUEST_ORDER.indexOf(questId);
  const next = QUEST_ORDER[idx + 1];
  if (next && !prog.completedQuests.includes(next) && !(next in prog.activeQuests)) activate(state, next);
  else if (Object.keys(prog.activeQuests).length === 0) {
    const open = firstOpenQuestId(state);
    if (open) activate(state, open);
  }
  return { questId, progress: def.count, count: def.count, completed: true, xp: def.xpReward, levelsGained };
}

/** Schließt alles ab, was schon erfüllt ist (Kette, höchstens MAX_CHAIN Runden). */
function settle(state: GameState, changes: QuestChange[]): void {
  for (let round = 0; round < MAX_CHAIN; round++) {
    const done = Object.keys(state.progression.activeQuests).filter((id) => {
      const def = QUESTS[id];
      return !!def && SIGNAL_TYPES.includes(def.type) && state.progression.activeQuests[id]!.progress >= def.count;
    });
    if (done.length === 0) return;
    for (const id of done) changes.push(complete(state, id));
  }
}

/** Sorgt dafür, dass die erste offene Aufgabe aktiv ist; schon Erfülltes schließt sofort ab. */
export function ensureActiveQuest(state: GameState): QuestChange[] {
  const changes: QuestChange[] = [];
  if (Object.keys(state.progression.activeQuests).length > 0) return changes;
  const open = firstOpenQuestId(state);
  if (!open) return changes;
  activate(state, open);
  settle(state, changes);
  return changes;
}

/** Meldet ein Ereignis; liefert jede Aufgabe, deren Zähler sich bewegt hat. */
export function reportSignal(state: GameState, signal: QuestSignal): QuestChange[] {
  const changes: QuestChange[] = [];
  if (!Number.isFinite(signal.amount) || signal.amount <= 0) return changes;
  const { stats, activeQuests } = state.progression;

  if (signal.type === 'talk' && !stats.npcsSpoken.includes(signal.target)) stats.npcsSpoken.push(signal.target);

  const finished: string[] = [];
  for (const [questId, entry] of Object.entries(activeQuests)) {
    const def = QUESTS[questId];
    if (!def || def.type !== signal.type) continue;
    if (def.target !== signal.target && def.target !== 'any') continue;
    entry.progress = Math.min(def.count, entry.progress + signal.amount);
    if (entry.progress >= def.count) finished.push(questId);
    else changes.push({ questId, progress: entry.progress, count: def.count, completed: false, xp: 0, levelsGained: 0 });
  }
  for (const id of finished) changes.push(complete(state, id));
  settle(state, changes);
  return changes;
}

/** Erste aktive Aufgabe in der Reihenfolge von QUEST_ORDER. */
export function currentQuest(state: GameState): { def: QuestDef; progress: number } | null {
  for (const id of QUEST_ORDER) {
    const entry = state.progression.activeQuests[id];
    const def = QUESTS[id];
    if (entry && def) return { def, progress: entry.progress };
  }
  return null;
}
