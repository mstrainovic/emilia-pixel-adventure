import { describe, expect, it } from 'vitest';
import type { Action, InputDevice, InputSource } from '../../src/input/actions';
import { InputHub, PRESS_BUFFER } from '../../src/input/hub';

class FakeSource implements InputSource {
  move = { x: 0, y: 0 };
  run = false;
  queue: Action[] = [];
  resets = 0;
  constructor(readonly device: InputDevice = 'keys') {}
  drainPressed(): Action[] {
    const out = this.queue;
    this.queue = [];
    return out;
  }
  reset(): void {
    this.move = { x: 0, y: 0 };
    this.run = false;
    this.queue = [];
    this.resets++;
  }
}

function hubWith(...sources: FakeSource[]): InputHub {
  const hub = new InputHub();
  for (const s of sources) hub.add(s);
  return hub;
}

describe('InputHub', () => {
  it('ein Druck ist genau einmal abnehmbar', () => {
    const s = new FakeSource();
    const hub = hubWith(s);
    s.queue.push('interact');
    hub.frame(0.016);
    expect(hub.consume('interact')).toBe(true);
    expect(hub.consume('interact')).toBe(false);
  });

  it('ein Druck wartet höchstens PRESS_BUFFER auf seinen Abnehmer', () => {
    expect(PRESS_BUFFER).toBe(0.3);
    const s = new FakeSource();
    const hub = hubWith(s);
    s.queue.push('confirm');
    hub.frame(0.016);
    hub.frame(0.2);
    expect(hub.consume('confirm')).toBe(true);
    s.queue.push('confirm');
    hub.frame(0.016);
    hub.frame(0.2);
    hub.frame(0.1);
    expect(hub.consume('confirm')).toBe(false);
  });

  it('Drücke verschiedener Handlungen stören sich nicht', () => {
    const s = new FakeSource();
    const hub = hubWith(s);
    s.queue.push('help', 'menu');
    hub.frame(0.016);
    expect(hub.consume('menu')).toBe(true);
    expect(hub.consume('help')).toBe(true);
  });

  it('zwei Quellen addieren ihre Bewegung, der Betrag wird auf 1 begrenzt', () => {
    const a = new FakeSource();
    const b = new FakeSource('touch');
    const hub = hubWith(a, b);
    a.move = { x: 1, y: 0 };
    b.move = { x: 0, y: 1 };
    hub.frame(0.016);
    expect(Math.hypot(hub.intent.x, hub.intent.y)).toBeCloseTo(1, 9);
    a.move = { x: 0.3, y: 0 };
    b.move = { x: 0.2, y: 0 };
    hub.frame(0.016);
    expect(hub.intent.x).toBeCloseTo(0.5, 9);
  });

  it('run kommt von jeder Quelle', () => {
    const a = new FakeSource();
    const b = new FakeSource('touch');
    const hub = hubWith(a, b);
    b.run = true;
    hub.frame(0.016);
    expect(hub.intent.run).toBe(true);
  });

  it('reset leert alles und setzt die Quellen zurück', () => {
    const s = new FakeSource();
    const hub = hubWith(s);
    s.move = { x: 1, y: 0 };
    s.queue.push('interact');
    hub.frame(0.016);
    hub.reset();
    expect(hub.intent).toEqual({ x: 0, y: 0, run: false });
    expect(hub.consume('interact')).toBe(false);
    expect(s.resets).toBe(1);
  });

  it('device folgt der Quelle, die zuletzt etwas geliefert hat; Anfang keys', () => {
    const keys = new FakeSource('keys');
    const touch = new FakeSource('touch');
    const hub = hubWith(keys, touch);
    expect(hub.device).toBe('keys');
    hub.frame(0.016);
    expect(hub.device).toBe('keys');
    touch.queue.push('interact');
    hub.frame(0.016);
    expect(hub.device).toBe('touch');
    hub.frame(0.016); // nichts Neues: bleibt
    expect(hub.device).toBe('touch');
    keys.move = { x: 1, y: 0 };
    hub.frame(0.016);
    expect(hub.device).toBe('keys');
  });

  it('ungültige Zeit und ungültige Bewegung richten nichts an', () => {
    const s = new FakeSource();
    const hub = hubWith(s);
    s.move = { x: NaN, y: 1 };
    s.queue.push('help');
    hub.frame(NaN);
    expect(hub.intent).toEqual({ x: 0, y: 1, run: false });
    expect(hub.consume('help')).toBe(true);
  });
});
