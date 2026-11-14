import { describe, expect, it } from 'vitest';
// @ts-expect-error -- Karten-Werkzeuge sind untypisiertes JavaScript (laufen nur in Node, nicht im Spiel)
import { edgeTile } from '../../tools/maps/autotile.mjs';

/** Maske aus Textzeilen: „#" = Weg, „." = Gras. */
function mask(...rows: string[]): boolean[][] {
  return rows.map((r) => [...r].map((c) => c === '#'));
}

describe('edgeTile', () => {
  it('Weg auf allen acht Seiten → mitte', () => {
    expect(edgeTile(mask('###', '###', '###'), 1, 1)).toBe('mitte');
  });

  it('zwei Kacheln breites waagrechtes Wegstück: oben n, unten s', () => {
    const m = mask('.....', '#####', '#####', '.....');
    expect(edgeTile(m, 2, 1)).toBe('n');
    expect(edgeTile(m, 2, 2)).toBe('s');
  });

  it('senkrechtes Wegstück: links w, rechts o', () => {
    const m = mask('.##.', '.##.', '.##.');
    expect(edgeTile(m, 1, 1)).toBe('w');
    expect(edgeTile(m, 2, 1)).toBe('o');
  });

  it('Ecken eines Wegrechtecks sind Außenecken', () => {
    const m = mask('.....', '.###.', '.###.', '.###.', '.....');
    expect(edgeTile(m, 1, 1)).toBe('aussen_nw');
    expect(edgeTile(m, 3, 1)).toBe('aussen_no');
    expect(edgeTile(m, 1, 3)).toBe('aussen_sw');
    expect(edgeTile(m, 3, 3)).toBe('aussen_so');
  });

  it('nur eine Diagonale Gras → Innenecke dieser Seite', () => {
    expect(edgeTile(mask('.##', '###', '###'), 1, 1)).toBe('innen_nw');
    expect(edgeTile(mask('##.', '###', '###'), 1, 1)).toBe('innen_no');
    expect(edgeTile(mask('###', '###', '.##'), 1, 1)).toBe('innen_sw');
    expect(edgeTile(mask('###', '###', '##.'), 1, 1)).toBe('innen_so');
  });

  it('der Kartenrand zählt als Weg (Ausgänge laufen randlos aus dem Bild)', () => {
    expect(edgeTile(mask('##', '##'), 0, 0)).toBe('mitte');
    expect(edgeTile(mask('#.', '#.'), 0, 0)).toBe('o');
  });

  it('Gras im Norden und Süden: n gewinnt; im Westen und Osten: w gewinnt', () => {
    expect(edgeTile(mask('...', '###', '...'), 1, 1)).toBe('n');
    expect(edgeTile(mask('.#.', '.#.', '.#.'), 1, 1)).toBe('w');
  });

  it('Graskachel hat keine Wegkante', () => {
    expect(edgeTile(mask('###', '#.#', '###'), 1, 1)).toBeNull();
  });
});
