import { describe, expect, it } from 'vitest';
import { HUB_START } from '../../src/data/maps';
import { buildWorldMap, resolveStart } from '../../src/maps/model';
import { bodyFits, stepMover, type Mover } from '../../src/systems/movement';
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
    for (const [x, y] of [[-0.5, 14.5], [40.5, 14.5], [19.5, -3], [19.5, 32.01], [1e9, 1e9]] as const) {
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

  it('Körper ragt seitlich in die Wand (Fußkachel frei) → Startpunkt der Karte', () => {
    // Prüferfall: Fuß 33,6 px, linke Körperkante 28,6 liegt in der Wandkachel 1 (endet bei 32)
    expect(hub.solid.isSolid(2, 14)).toBe(false);
    expect(resolveStart(hub, { map: 'hub', x: 2.1, y: 14.5 })).toEqual(hub.spawn);
  });

  it('genau an der Wandkante (Kante auf der Kachelgrenze) bleibt der Ort gültig', () => {
    // linke Körperkante = 37 − 5 = 32 = Grenze der Wandkachel → keine Überlappung
    expect(resolveStart(hub, { map: 'hub', x: 37 / 16, y: 14.5 })).toEqual({ x: 37, y: 232 });
  });

  describe('kleine Karte 5×5, Mauer auf Kachel 2/1 und Spalte 0', () => {
    const solidTiles = new Set(['2,1', ...[0, 1, 2, 3, 4].map((y) => `0,${y}`)]);
    const small = {
      ...hub,
      id: 'hub' as const,
      widthPx: 80,
      heightPx: 80,
      spawn: { x: 40, y: 72 },
      solid: { width: 5, height: 5, isSolid: (x: number, y: number) => x < 0 || y < 0 || x >= 5 || y >= 5 || solidTiles.has(`${x},${y}`) },
    };

    it('seitlich in die Wand → Startpunkt', () => {
      // Fuß x = 18 (Kachel 1 frei), linke Kante 13 < 16
      expect(resolveStart(small, { map: 'hub', x: 18 / 16, y: 2.5 })).toEqual(small.spawn);
    });

    it('von oben in die Mauer → Startpunkt', () => {
      // Fuß y = 35 in Kachel 2 (frei), Oberkante des Körpers 35 − 6 = 29 < 32 = Unterkante der Mauer 2/1
      expect(small.solid.isSolid(2, 2)).toBe(false);
      expect(resolveStart(small, { map: 'hub', x: 2.5, y: 35 / 16 })).toEqual(small.spawn);
    });

    it('Oberkante genau auf der Kachelgrenze → gültig', () => {
      expect(resolveStart(small, { map: 'hub', x: 2.5, y: 38 / 16 })).toEqual({ x: 40, y: 38 });
    });
  });

  it('nach resolveStart kommt die Figur aus jedem früher verklemmten Fall in eine Richtung los (30 Bilder)', () => {
    const cases = [{ map: 'hub' as const, x: 2.1, y: 14.5 }, { map: 'hub' as const, x: 2.03, y: 14.5 }];
    const intents = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    for (const saved of cases) {
      const start = resolveStart(hub, saved);
      const moved = intents.some((dir) => {
        let m: Mover = { ...start, vx: 0, vy: 0, facing: 'down', moving: false, walkTime: 0 };
        for (let i = 0; i < 30; i++) m = stepMover(m, { ...dir, run: false }, 1 / 60, hub.solid);
        return Math.hypot(m.x - start.x, m.y - start.y) > 1;
      });
      expect(moved, `aus ${saved.x}/${saved.y}`).toBe(true);
    }
  });

  describe('Fuß auf der unteren oder rechten Kartenkante', () => {
    it('in der Lücke des Süd-Ausgangs (y = Kartenhöhe) bleibt der Ort', () => {
      // Süd-Ausgang: Kacheln 18–21 (x 288–352); moveAndSlide lässt die Figur genau auf der Kante stehen
      expect(bodyFits(hub.solid, 320, hub.heightPx)).toBe(true);
      expect(resolveStart(hub, { map: 'hub', x: 320 / 16, y: hub.heightPx / 16 })).toEqual({ x: 320, y: hub.heightPx });
    });

    it('knapp hinter der unteren Kante (+0,01) → Startpunkt', () => {
      expect(resolveStart(hub, { map: 'hub', x: 320 / 16, y: (hub.heightPx + 0.01) / 16 })).toEqual(hub.spawn);
    });

    it('auf der unteren Kante, aber vor der Wand neben der Lücke → Startpunkt', () => {
      expect(bodyFits(hub.solid, 100, hub.heightPx)).toBe(false);
      expect(resolveStart(hub, { map: 'hub', x: 100 / 16, y: hub.heightPx / 16 })).toEqual(hub.spawn);
    });

    it('rechte Kante (x = Kartenbreite) im Ost-Ausgang: der Körper ragt hinaus, passt nicht → Startpunkt', () => {
      // Ost-Ausgang: Kachelzeilen 13–16; die halbe Körperbreite (5) läge außerhalb der Karte
      expect(bodyFits(hub.solid, hub.widthPx, 232)).toBe(false);
      expect(resolveStart(hub, { map: 'hub', x: hub.widthPx / 16, y: 232 / 16 })).toEqual(hub.spawn);
    });
  });

  it('liefert eine Kopie, nie das Objekt der Karte', () => {
    const start = resolveStart(hub, { map: 'forest', x: 0, y: 0 });
    expect(start).not.toBe(hub.spawn);
  });
});
