import { it, expect, vi } from 'vitest';
import { EventBus } from '../../src/core/events';

it('ruft Empfänger in Anmeldereihenfolge und meldet sauber ab', () => {
  const bus = new EventBus<{ ping: number }>(); const seen: string[] = [];
  const off = bus.on('ping', (n) => seen.push('a' + n)); bus.on('ping', (n) => seen.push('b' + n));
  bus.emit('ping', 1); off(); bus.emit('ping', 2);
  expect(seen).toEqual(['a1', 'b1', 'b2']);
});

it('ein werfender Empfänger hält die anderen nicht auf', () => {
  const bus = new EventBus<{ ping: number }>(); const seen: number[] = [];
  const err = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    bus.on('ping', () => { throw new Error('x'); }); bus.on('ping', (n) => seen.push(n));
    bus.emit('ping', 7);
    expect(seen).toEqual([7]); expect(err).toHaveBeenCalledTimes(1);
  } finally {
    err.mockRestore();
  }
});

it('ein Empfänger darf sich während des Aufrufs selbst abmelden', () => {
  const bus = new EventBus<{ ping: number }>(); const seen: string[] = [];
  const off = bus.on('ping', (n) => { seen.push('a' + n); off(); });
  bus.on('ping', (n) => seen.push('b' + n));
  bus.emit('ping', 1); bus.emit('ping', 2);
  expect(seen).toEqual(['a1', 'b1', 'b2']);
});
