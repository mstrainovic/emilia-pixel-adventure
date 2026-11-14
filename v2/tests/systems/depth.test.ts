import { describe, expect, it } from 'vitest';
import { DEPTH, depthForFoot, standLineOf } from '../../src/systems/depth';

describe('Tiefe nach Fußpunkt', () => {
  it('weiter unten liegt weiter vorn', () => {
    expect(depthForFoot(100)).toBeLessThan(depthForFoot(101));
  });

  it('liegt über allem Flachen und unter der obersten Ebene', () => {
    expect(depthForFoot(0)).toBeGreaterThan(DEPTH.flat);
    expect(depthForFoot(32 * 16)).toBeLessThan(DEPTH.top);
  });

  it('ist 1000 + Fußpunkt', () => {
    expect(depthForFoot(232)).toBe(1232);
  });
});

describe('Standlinie von Objekten der Karte', () => {
  const TILE = 16;
  // Objekt auf Kachelzeile 5: Kachel reicht von y 80 bis 96, Mitte 88, Unterkante 96
  const row = 5;
  const objectY = row * TILE + TILE / 2;
  const objectDepth = depthForFoot(standLineOf(objectY, TILE));

  it('ist die Unterkante der Kachel', () => {
    expect(standLineOf(objectY, TILE)).toBe((row + 1) * TILE);
  });

  it('eine Figur mit dem Fuß in der Kachel des Objekts oberhalb der Unterkante steht dahinter', () => {
    for (const footY of [row * TILE, objectY - 0.5, objectY, objectY + 0.5, (row + 1) * TILE - 0.01]) {
      expect(depthForFoot(footY)).toBeLessThan(objectDepth);
    }
  });

  it('Gleichstand: Fuß genau auf der Standlinie hat dieselbe Tiefe; die später angelegte Figur steht davor', () => {
    // Die Anzeigeliste sortiert stabil, Figuren werden nach den Objekten angelegt (siehe depth.ts).
    expect(depthForFoot((row + 1) * TILE)).toBe(objectDepth);
  });

  it('eine Figur mit dem Fuß in der Kachel darunter steht davor', () => {
    for (const footY of [(row + 1) * TILE + 0.01, (row + 1) * TILE + TILE / 2, (row + 2) * TILE - 0.01]) {
      expect(depthForFoot(footY)).toBeGreaterThan(objectDepth);
    }
  });
});
