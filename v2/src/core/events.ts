import type { SaveReason, SaveResult } from '../save/store';
import type { QuestChange } from '../systems/quests';
import type { FriendChange } from '../systems/friendship';

/** Ereignisse des Spiels. */
export interface GameEvents {
  'save:result': { reason: SaveReason; result: SaveResult };
  'npc:talked': { npcId: string };
  'quest:changed': QuestChange;
  'friendship:changed': FriendChange;
  'inventory:changed': Record<string, never>;
  /** Herzen, Level, Erfahrung, Münzen. */
  'stats:changed': Record<string, never>;
  'ui:paused': { paused: boolean };
  /** Der Ton selbst zieht in Etappe 7 um. */
  'ui:sound': { name: 'open' | 'close' | 'click' | 'quest' };
}

type Handler<P> = (payload: P) => void;

/**
 * Typisierter Ereignisverteiler; Empfänger laufen in Anmeldereihenfolge. `object` statt `Record<string, unknown>`,
 * damit auch Schnittstellen wie GameEvents passen (sie haben keine Index-Signatur).
 */
export class EventBus<E extends object> {
  private readonly handlers = new Map<keyof E, Array<Handler<never>>>();

  on<K extends keyof E>(type: K, handler: (payload: E[K]) => void): () => void {
    const list = this.handlers.get(type) ?? [];
    list.push(handler as Handler<never>);
    this.handlers.set(type, list);
    return () => {
      const current = this.handlers.get(type);
      if (!current) return;
      const i = current.indexOf(handler as Handler<never>);
      if (i >= 0) current.splice(i, 1);
    };
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    const list = this.handlers.get(type);
    if (!list) return;
    // Schnappschuss: Abmeldungen während des Aufrufs stören die Schleife nicht.
    for (const handler of [...list]) {
      try {
        (handler as Handler<E[K]>)(payload);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
