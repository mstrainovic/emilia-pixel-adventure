import { describe, expect, it } from 'vitest';
import { INTERACT_RADIUS, exitAt, facingToward, findContext, sameContext } from '../../src/systems/interaction';
import type { WorldExit } from '../../src/maps/model';

const KNOWN = new Set(['mama_tanja', 'papa_milos']);
/** Nordausgang des Dorfs: Kacheln 18–21, Zeilen 0–1. */
const NORTH: WorldExit = { name: 'north', x: 288, y: 0, width: 64, height: 32, target: 'forest', spawnX: 408, spawnY: 600 };

describe('findContext', () => {
  it('eine Figur 20 Bildpunkte entfernt ist ansprechbar', () => {
    const player = { x: 100, y: 100, facing: 'down' as const };
    expect(findContext(player, [{ npcId: 'mama_tanja', x: 100, y: 120 }], [], KNOWN)).toEqual({ kind: 'talk', npcId: 'mama_tanja' });
  });

  it('eine Figur 30 Bildpunkte entfernt ist es nicht', () => {
    const player = { x: 100, y: 100, facing: 'down' as const };
    expect(findContext(player, [{ npcId: 'mama_tanja', x: 130, y: 100 }], [], KNOWN)).toBeNull();
  });

  it('die Grenze liegt bei 26 Bildpunkten (Fußpunkt zu Fußpunkt, einschließlich)', () => {
    expect(INTERACT_RADIUS).toBe(26);
    const player = { x: 0, y: 0, facing: 'down' as const };
    expect(findContext(player, [{ npcId: 'mama_tanja', x: 26, y: 0 }], [], KNOWN)).not.toBeNull();
    expect(findContext(player, [{ npcId: 'mama_tanja', x: 26.01, y: 0 }], [], KNOWN)).toBeNull();
  });

  it('die nähere von zwei Figuren gewinnt', () => {
    const player = { x: 100, y: 100, facing: 'left' as const };
    const npcs = [{ npcId: 'mama_tanja', x: 80, y: 100 }, { npcId: 'papa_milos', x: 112, y: 100 }];
    expect(findContext(player, npcs, [], KNOWN)).toEqual({ kind: 'talk', npcId: 'papa_milos' });
  });

  it('zwei Figuren gleich weit, eine rechts, Blick nach rechts: die rechte', () => {
    const npcs = [{ npcId: 'mama_tanja', x: 84, y: 100 }, { npcId: 'papa_milos', x: 116, y: 100 }];
    expect(findContext({ x: 100, y: 100, facing: 'right' }, npcs, [], KNOWN)).toEqual({ kind: 'talk', npcId: 'papa_milos' });
    // und umgekehrt: Blick nach links nimmt die linke, gleich in welcher Reihenfolge die Karte sie nennt
    expect(findContext({ x: 100, y: 100, facing: 'left' }, [...npcs].reverse(), [], KNOWN)).toEqual({ kind: 'talk', npcId: 'mama_tanja' });
  });

  it('eine Figur der Karte ohne Eintrag in den Daten ist nie Ziel (Review Focus 5)', () => {
    const player = { x: 100, y: 100, facing: 'right' as const };
    const npcs = [{ npcId: 'gibt_es_nicht', x: 104, y: 100 }, { npcId: 'mama_tanja', x: 120, y: 100 }];
    expect(findContext(player, npcs, [], KNOWN)).toEqual({ kind: 'talk', npcId: 'mama_tanja' });
    expect(findContext(player, [{ npcId: 'gibt_es_nicht', x: 104, y: 100 }], [], KNOWN)).toBeNull();
    // auch keine geerbten Namen wie „constructor"
    expect(findContext(player, [{ npcId: 'constructor', x: 104, y: 100 }], [], KNOWN)).toBeNull();
  });

  it('im Rechteck eines Ausgangs und keine Figur in Reichweite: der Ausgang', () => {
    const player = { x: 300, y: 10, facing: 'up' as const };
    expect(findContext(player, [{ npcId: 'mama_tanja', x: 136, y: 184 }], [NORTH], KNOWN)).toEqual({ kind: 'exit', target: 'forest' });
  });

  it('außerhalb jedes Ausgangs und ohne Figur: nichts', () => {
    expect(findContext({ x: 300, y: 40, facing: 'up' }, [], [NORTH], KNOWN)).toBeNull();
  });

  it('wer in einem Ausgang steht, hat den Ausgang als Ziel, auch mit einer Figur daneben', () => {
    const player = { x: 300, y: 10, facing: 'up' as const };
    expect(findContext(player, [{ npcId: 'mama_tanja', x: 310, y: 10 }], [NORTH], KNOWN)).toEqual({ kind: 'exit', target: 'forest' });
  });

  it('ungültige Orte machen nichts kaputt', () => {
    expect(findContext({ x: Number.NaN, y: 0, facing: 'down' }, [{ npcId: 'mama_tanja', x: 0, y: 0 }], [NORTH], KNOWN)).toBeNull();
  });
});

describe('exitAt', () => {
  it('liefert den Ausgang, in dessen Rechteck der Fußpunkt liegt (rechte und untere Kante gehören nicht dazu)', () => {
    expect(exitAt(288, 0, [NORTH])).toBe(NORTH);
    expect(exitAt(351.9, 31.9, [NORTH])).toBe(NORTH);
    expect(exitAt(352, 10, [NORTH])).toBeNull();
    expect(exitAt(300, 32, [NORTH])).toBeNull();
    expect(exitAt(287.9, 10, [NORTH])).toBeNull();
  });
});

describe('sameContext', () => {
  it('vergleicht Art und Ziel', () => {
    expect(sameContext(null, null)).toBe(true);
    expect(sameContext({ kind: 'talk', npcId: 'oma' }, { kind: 'talk', npcId: 'oma' })).toBe(true);
    expect(sameContext({ kind: 'talk', npcId: 'oma' }, { kind: 'talk', npcId: 'opa' })).toBe(false);
    expect(sameContext({ kind: 'exit', target: 'forest' }, { kind: 'exit', target: 'forest' })).toBe(true);
    expect(sameContext({ kind: 'exit', target: 'forest' }, { kind: 'exit', target: 'lake' })).toBe(false);
    expect(sameContext({ kind: 'talk', npcId: 'oma' }, null)).toBe(false);
  });
});

describe('facingToward', () => {
  it('Ziel weiter rechts als oben: rechts', () => {
    expect(facingToward({ x: 0, y: 0 }, { x: 10, y: -4 })).toBe('right');
  });
  it('Ziel weiter oben als links: oben', () => {
    expect(facingToward({ x: 0, y: 0 }, { x: -3, y: -10 })).toBe('up');
  });
  it('links und unten', () => {
    expect(facingToward({ x: 0, y: 0 }, { x: -10, y: 2 })).toBe('left');
    expect(facingToward({ x: 0, y: 0 }, { x: 1, y: 16 })).toBe('down');
  });
  it('genau schräg: die waagrechte Richtung', () => {
    expect(facingToward({ x: 0, y: 0 }, { x: 5, y: 5 })).toBe('right');
    expect(facingToward({ x: 0, y: 0 }, { x: -5, y: -5 })).toBe('left');
  });
  it('am selben Ort: nach unten (zur Kamera)', () => {
    expect(facingToward({ x: 3, y: 3 }, { x: 3, y: 3 })).toBe('down');
  });
});
