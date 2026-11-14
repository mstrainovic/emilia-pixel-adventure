/** Gesperrte Kacheln einer Karte. Alles außerhalb der Karte gilt als fest. */
export interface SolidGrid {
  readonly width: number;
  readonly height: number;
  isSolid(tileX: number, tileY: number): boolean;
}

/** Kachelgröße in Bildpunkten. */
const TILE = 16;

/** Kasten um einen Mittelpunkt; alle Maße in Bildpunkten. */
export interface Box {
  x: number;
  y: number;
  halfW: number;
  halfH: number;
}

/** Größter Teilschritt in Bildpunkten: dünner als jede Kachel, so tunnelt nichts durch Wände. */
export const MAX_STEP = 4;
/** Bis zu so viel Überstand rutscht die Figur um eine Ecke. */
export const CORNER_NUDGE = 5;
/**
 * Rutschen um die Ecke gilt auch, wenn die Querabsicht von der freien Seite wegzeigt, solange sie höchstens
 * halb so groß ist wie der Schritt in die Wand (die Figur will vor allem vorbei). Zeigt sie deutlich
 * entlang der Wand (mehr als die Hälfte), wird nicht gerutscht, und die Figur gleitet mit ihrer Querbewegung an der Wand entlang.
 */
export const NUDGE_MAX_CROSS_RATIO = 0.5;

export interface SlideResult {
  x: number;
  y: number;
  blockedX: boolean;
  blockedY: boolean;
}

type Axis = 'x' | 'y';

/** Berührt der Kasten (offenes Intervall) eine feste Kachel? */
function hits(grid: SolidGrid, x: number, y: number, halfW: number, halfH: number): boolean {
  const tx0 = Math.floor((x - halfW) / TILE);
  const tx1 = Math.ceil((x + halfW) / TILE) - 1;
  const ty0 = Math.floor((y - halfH) / TILE);
  const ty1 = Math.ceil((y + halfH) / TILE) - 1;
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (grid.isSolid(tx, ty)) return true;
    }
  }
  return false;
}

/** Steht der Kasten frei, ohne eine feste Kachel zu berühren (Kante genau auf der Kachelgrenze zählt nicht)? */
export function boxFits(grid: SolidGrid, box: Box): boolean {
  if (![box.x, box.y].every(Number.isFinite)) return false;
  return !hits(grid, box.x, box.y, box.halfW, box.halfH);
}

function hitsAt(grid: SolidGrid, b: Box, dx: number, dy: number): boolean {
  return hits(grid, b.x + dx, b.y + dy, b.halfW, b.halfH);
}

/** Verschiebung als (Achse, Betrag) in ein (dx, dy)-Paar. */
function along(axis: Axis, v: number): [number, number] {
  return axis === 'x' ? [v, 0] : [0, v];
}

/**
 * Ein Teilschritt entlang einer Achse. Ist das Ziel fest, wird die Kante
 * der Wand genau angefahren (nie zurück, falls die Figur schon drinsteckt).
 */
function stepAxis(grid: SolidGrid, b: Box, axis: Axis, step: number): { value: number; blocked: boolean } {
  const half = axis === 'x' ? b.halfW : b.halfH;
  const old = b[axis];
  const next = old + step;
  const [dx, dy] = along(axis, step);
  if (!hitsAt(grid, b, dx, dy)) return { value: next, blocked: false };
  if (step > 0) {
    const edge = (Math.ceil((next + half) / TILE) - 1) * TILE - half;
    return { value: Math.max(old, edge), blocked: true };
  }
  const edge = (Math.floor((next - half) / TILE) + 1) * TILE + half;
  return { value: Math.min(old, edge), blocked: true };
}

/**
 * Quer zur Bewegung: um wie viel (höchstens |step|, also im Tempo der Figur) lässt sich die Figur zur Seite
 * schieben, damit sie an der Ecke vorbeikommt? Gesucht wird die Seite mit dem kleinsten
 * Überstand bis `CORNER_NUDGE`, aber nicht deutlich entgegen `crossStep` (siehe `NUDGE_MAX_CROSS_RATIO`). 0 heißt: kein Rutschen möglich.
 */
function cornerNudge(grid: SolidGrid, b: Box, axis: Axis, step: number, crossStep: number): number {
  const cross: Axis = axis === 'x' ? 'y' : 'x';
  for (let s = 1; s <= CORNER_NUDGE; s++) {
    for (const dir of [-1, 1]) {
      // Nicht deutlich gegen die Querabsicht schieben: sonst hebt sich Rutschen und Weitergehen auf.
      if (Math.sign(crossStep) === -dir && Math.abs(crossStep) > NUDGE_MAX_CROSS_RATIO * Math.abs(step)) continue;
      const [cx, cy] = along(cross, dir * s);
      const [ax, ay] = along(axis, step);
      if (hitsAt(grid, b, cx + ax, cy + ay)) continue;
      const m = dir * Math.min(s, Math.abs(step));
      const [mx, my] = along(cross, m);
      return hitsAt(grid, b, mx, my) ? 0 : m;
    }
  }
  return 0;
}

/** Entfernt Rundungsrauschen aus den Teilschritten (90 statt 89,99999999999999). */
function tidy(v: number): number {
  return Math.round(v * 1e6) / 1e6;
}

/**
 * Bewegt den Kasten um (dx, dy), Achse für Achse in Teilschritten von höchstens
 * `MAX_STEP`. Blockierte Achsen gleiten an der Wand entlang; kleine Überstände
 * an Ecken werden umrutscht.
 */
export function moveAndSlide(box: Box, dx: number, dy: number, grid: SolidGrid): SlideResult {
  const b: Box = { ...box };
  if (![dx, dy, b.x, b.y].every(Number.isFinite)) {
    return { x: box.x, y: box.y, blockedX: false, blockedY: false };
  }
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / MAX_STEP));
  const blocked = { x: false, y: false };
  const steps = { x: dx / n, y: dy / n };

  for (let i = 0; i < n; i++) {
    for (const axis of ['x', 'y'] as const) {
      const step = steps[axis];
      if (step === 0) continue;
      const r = stepAxis(grid, b, axis, step);
      if (!r.blocked) {
        b[axis] = r.value;
        continue;
      }
      const cross: Axis = axis === 'x' ? 'y' : 'x';
      const nudge = cornerNudge(grid, b, axis, step, steps[cross]);
      if (nudge === 0) {
        // Wirklich blockiert; nur ein Rutschen um die Ecke zählt nicht als Stehenbleiben,
        // sonst fiele das Tempo bei jeder Ecke auf 0.
        blocked[axis] = true;
        b[axis] = r.value;
      } else {
        b[cross] += nudge;
        b[axis] = stepAxis(grid, b, axis, step).value;
      }
    }
  }
  return { x: tidy(b.x), y: tidy(b.y), blockedX: blocked.x, blockedY: blocked.y };
}
