import type { SaveReason, SaveResult } from '../save/store';

/** Ereignisse des Spiels (Plan 1b ergänzt weitere). */
export interface GameEvents {
  'save:result': { reason: SaveReason; result: SaveResult };
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
