import { describe, expect, it } from 'vitest';
import { HUB_START } from '../../src/data/maps';
import { buildWorldMap, resolveStart } from '../../src/maps/model';
import { loadGameMaps } from './loadMaps';

const hub = buildWorldMap('hub', loadGameMaps().hub);

describe('resolveStart (Review Focus 4)', () => {
  it('Startpunkt des neuen Spiels = Startpunkt der Karte (Kachel 19/14, Mitte)', () => {
    expect(resolveStart(hub, HUB_START)).toEqual({ x: 312, y: 232 });
    expect(hub.spawn).toEqual({ x: 312, y: 232 });
  });

  it('gespeicherter Ort auf freier Kachel derselben Karte → dieser Ort (× 16)', () => {
    expect(hub.solid.isSolid(25, 14)).toBe(false);
    expect(resolveStart(hub, { map: 'hub', x: 25.25, y: 14.75 })).toEqual({ x: 404, y: 236 });
  });

  it('in einer festen Kachel → Startpunkt der Karte', () => {
    expect(hub.solid.isSolid(0, 5)).toBe(true);
    expect(resolveStart(hub, { map: 'hub', x: 0.5, y: 5.5 })).toEqual(hub.spawn);
  });

  it('außerhalb der Karte → Startpunkt der Karte', () => {
    for (const [x, y] of [[-0.5, 14.5], [40.5, 14.5], [19.5, -3], [19.5, 32], [1e9, 1e9]] as const) {
      expect(resolveStart(hub, { map: 'hub', x, y })).toEqual(hub.spawn);
    }
  });

  it('andere Karte → Startpunkt der Karte', () => {
    expect(resolveStart(hub, { map: 'forest', x: 25.5, y: 14.5 })).toEqual(hub.spawn);
  });

  it('NaN oder unendlich → Startpunkt der Karte', () => {
    expect(resolveStart(hub, { map: 'hub', x: Number.NaN, y: 14.5 })).toEqual(hub.spawn);
    expect(resolveStart(hub, { map: 'hub', x: 19.5, y: Number.NaN })).toEqual(hub.spawn);
    expect(resolveStart(hub, { map: 'hub', x: Number.POSITIVE_INFINITY, y: 14.5 })).toEqual(hub.spawn);
  });

  it('liefert eine Kopie, nie das Objekt der Karte', () => {
    const start = resolveStart(hub, { map: 'forest', x: 0, y: 0 });
    expect(start).not.toBe(hub.spawn);
  });
});
