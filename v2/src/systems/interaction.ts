// Wer oder was gerade ansprechbar ist, als reine Funktionen (keine Szene, kein Zufall).
// Alt: src/systems/DialogSystem.js Zeile 18 — dort reichte ein Abstand von 2 Kacheln; der Bildausschnitt ist jetzt
// kleiner, darum 26 Bildpunkte (gut anderthalb Kacheln) vom Fußpunkt der Spielerin zum Fußpunkt der Figur.
import type { MapId } from '../data/maps';
import type { Facing } from '../data/types';
import type { WorldExit } from '../maps/model';

/** Bildpunkte, Fußpunkt zu Fußpunkt (einschließlich). */
export const INTERACT_RADIUS = 26;

/** Ziel des Kontexts: eine Figur zum Reden oder ein Ausgang (Task 8 zeigt danach das Symbol des Kontext-Knopfs). */
export type ContextTarget = { kind: 'talk'; npcId: string } | { kind: 'exit'; target: MapId };

/** Gleich weit: Unterschied unter einem Hundertstel Bildpunkt. */
const TIE = 0.01;

/**
 * Blickrichtung von `from` nach `to`: die Achse mit dem größeren Abstand; genau schräg zählt waagrecht.
 * Am selben Ort: nach unten (zur Kamera).
 */
export function facingToward(from: { x: number; y: number }, to: { x: number; y: number }): Facing {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return 'down';
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** Ausgang, in dessen Rechteck der Fußpunkt liegt (links und oben einschließlich, rechts und unten nicht). */
export function exitAt(x: number, y: number, exits: readonly WorldExit[]): WorldExit | null {
  return exits.find((e) => x >= e.x && x < e.x + e.width && y >= e.y && y < e.y + e.height) ?? null;
}

/**
 * Was die Spielerin gerade ansprechen kann. Steht sie in einem Ausgang, ist das Ziel der Ausgang. Sonst die nächste
 * Figur innerhalb von INTERACT_RADIUS, die in den Daten bekannt ist (`knownNpcIds`; eine Figur der Karte ohne
 * Eintrag ist nie Ziel, Review Focus 5). Bei Gleichstand die, zu der die Spielerin blickt; sonst die erste der Karte.
 */
export function findContext(
  player: { x: number; y: number; facing: Facing },
  npcs: readonly { npcId: string; x: number; y: number }[],
  exits: readonly WorldExit[],
  knownNpcIds: ReadonlySet<string>,
): ContextTarget | null {
  if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) return null;
  const exit = exitAt(player.x, player.y, exits);
  if (exit) return { kind: 'exit', target: exit.target };

  let best: { npcId: string; distance: number; facing: boolean } | null = null;
  for (const npc of npcs) {
    if (!knownNpcIds.has(npc.npcId)) continue;
    const distance = Math.hypot(npc.x - player.x, npc.y - player.y);
    if (!(distance <= INTERACT_RADIUS)) continue;
    const facing = facingToward(player, npc) === player.facing;
    const nearer = best === null || distance < best.distance - TIE;
    const tieWon = best !== null && Math.abs(distance - best.distance) <= TIE && facing && !best.facing;
    if (nearer || tieWon) best = { npcId: npc.npcId, distance, facing };
  }
  return best ? { kind: 'talk', npcId: best.npcId } : null;
}

/** Gleiches Ziel? (für „nur bei Wechsel melden") */
export function sameContext(a: ContextTarget | null, b: ContextTarget | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.kind === 'talk') return b.kind === 'talk' && a.npcId === b.npcId;
  return b.kind === 'exit' && a.target === b.target;
}
