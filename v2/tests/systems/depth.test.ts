import { describe, expect, it } from 'vitest';
import { DEPTH, depthForFoot } from '../../src/systems/depth';

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
