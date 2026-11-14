import type { Facing } from '../data/types';
import { boxFits, moveAndSlide, type Box, type SolidGrid } from './collision';

/** Tempo in Bildpunkten je Sekunde (altes Spiel: 4 und 7 Kacheln je Sekunde). */
export const WALK_SPEED = 64;
export const RUN_SPEED = 112;
/** Sekunden bis zum vollen Tempo bzw. bis zum Stillstand. */
export const ACCEL_TIME = 0.1;
/** Längster Zeitschritt: nach dem Aufwachen springt die Figur nicht durch Wände. */
export const MAX_DT = 0.1;
/** Kollisionskasten 10×6, Unterkante am Fußpunkt. */
export const PLAYER_BODY = { halfW: 5, halfH: 3, footOffset: 3 } as const;

/** Kollisionskasten der Spielerin für einen Fußpunkt (Bildpunkte). */
function playerBox(footX: number, footY: number): Box {
  return { x: footX, y: footY - PLAYER_BODY.footOffset, halfW: PLAYER_BODY.halfW, halfH: PLAYER_BODY.halfH };
}

/** Passt der Körper der Spielerin an diesen Fußpunkt, ohne eine feste Kachel zu berühren? */
export function bodyFits(grid: SolidGrid, footX: number, footY: number): boolean {
  return boxFits(grid, playerBox(footX, footY));
}

/** Absicht der Eingabe; der Betrag ist höchstens 1. */
export interface MoveIntent {
  x: number;
  y: number;
  run: boolean;
}

/** Zustand der Figur; x/y ist der Fußpunkt. */
export interface Mover {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: Facing;
  moving: boolean;
  walkTime: number;
}

const WALK_FPS = 8;
const RUN_FPS = 12;
const WALK_ROWS = 4;

function clampIntent(intent: MoveIntent): { x: number; y: number } {
  const x = Number.isFinite(intent.x) ? intent.x : 0;
  const y = Number.isFinite(intent.y) ? intent.y : 0;
  const len = Math.hypot(x, y);
  return len > 1 ? { x: x / len, y: y / len } : { x, y };
}

function facingFor(intent: { x: number; y: number }, current: Facing): Facing {
  const ax = Math.abs(intent.x);
  const ay = Math.abs(intent.y);
  if (ax === 0 && ay === 0) return current;
  const horizontal: Facing = intent.x > 0 ? 'right' : 'left';
  const vertical: Facing = intent.y > 0 ? 'down' : 'up';
  if (ax > ay) return horizontal;
  if (ay > ax) return vertical;
  return current === horizontal || current === vertical ? current : horizontal;
}

/** Ein Zeitschritt: Anlaufen/Abbremsen, Bewegung mit Kollision, Blickrichtung, Laufzeit. */
export function stepMover(m: Mover, intent: MoveIntent, dt: number, grid: SolidGrid): Mover {
  if (!Number.isFinite(dt) || dt <= 0) return m;
  const step = Math.min(dt, MAX_DT);
  const dir = clampIntent(intent);
  const speed = intent.run ? RUN_SPEED : WALK_SPEED;
  const tx = dir.x * speed;
  const ty = dir.y * speed;

  // Geschwindigkeit nähert sich dem Ziel linear mit Tempo/ACCEL_TIME je Sekunde.
  const maxChange = (speed / ACCEL_TIME) * step;
  const ex = tx - m.vx;
  const ey = ty - m.vy;
  const dist = Math.hypot(ex, ey);
  let vx = tx;
  let vy = ty;
  if (dist > maxChange) {
    vx = m.vx + (ex / dist) * maxChange;
    vy = m.vy + (ey / dist) * maxChange;
  }

  const r = moveAndSlide(
    playerBox(m.x, m.y),
    vx * step,
    vy * step,
    grid,
  );
  if (r.blockedX) vx = 0;
  if (r.blockedY) vy = 0;

  const moving = vx !== 0 || vy !== 0;
  return {
    x: r.x,
    y: r.y + PLAYER_BODY.footOffset,
    vx,
    vy,
    facing: facingFor(dir, m.facing),
    moving,
    walkTime: moving ? m.walkTime + step : 0,
  };
}

/** Zeile 1…4 des Laufzyklus; hängt nur von `walkTime` ab (8 Bilder/s gehen, 12 rennen). */
export function walkFrameRow(walkTime: number, running: boolean): number {
  if (!Number.isFinite(walkTime) || walkTime < 0) return 1;
  const fps = running ? RUN_FPS : WALK_FPS;
  return 1 + (Math.floor(walkTime * fps) % WALK_ROWS);
}
