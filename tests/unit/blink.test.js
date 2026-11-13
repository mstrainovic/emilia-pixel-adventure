import { describe, it, expect } from 'vitest';
import { blinkVisible } from '../../src/utils/Blink.js';

describe('blinkVisible', () => {
  it('ist sichtbar, sobald der Timer abgelaufen ist', () => {
    expect(blinkVisible(0, 10)).toBe(true);
    expect(blinkVisible(-0.005, 10)).toBe(true);
    expect(blinkVisible(-0.1, 15)).toBe(true);
  });
  it('wechselt während des Blinkens im Takt', () => {
    expect(blinkVisible(0.05, 10)).toBe(true);
    expect(blinkVisible(0.15, 10)).toBe(false);
    expect(blinkVisible(0.25, 10)).toBe(true);
  });
});
