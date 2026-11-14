// Wegränder aus einer Wegmaske: welche Kante oder Ecke eine Wegkachel zeigt.
// Reihenfolge wie im alten Spiel (src/utils/AutoTiler.js): Außenecken, dann Kanten, dann Innenecken.
// Der Kachelsatz kennt keine Kachel mit zwei gegenüberliegenden Kanten; bei Gras im Norden und Süden
// gewinnt daher 'n', bei Gras im Westen und Osten 'w'.

/**
 * @param {boolean[][]} mask mask[y][x] === true: Weg. Außerhalb der Karte zählt als Weg.
 * @returns {'mitte'|'n'|'s'|'w'|'o'|'aussen_nw'|'aussen_no'|'aussen_sw'|'aussen_so'|'innen_nw'|'innen_no'|'innen_sw'|'innen_so'|null}
 *   null, wenn (x, y) selbst kein Weg ist.
 */
export function edgeTile(mask, x, y) {
  const is = (xx, yy) => yy < 0 || yy >= mask.length || xx < 0 || xx >= mask[yy].length || mask[yy][xx] === true;
  if (mask[y]?.[x] !== true) return null;
  const n = is(x, y - 1);
  const s = is(x, y + 1);
  const w = is(x - 1, y);
  const o = is(x + 1, y);
  if (!n && !w) return 'aussen_nw';
  if (!n && !o) return 'aussen_no';
  if (!s && !w) return 'aussen_sw';
  if (!s && !o) return 'aussen_so';
  if (!n) return 'n';
  if (!s) return 's';
  if (!w) return 'w';
  if (!o) return 'o';
  if (!is(x - 1, y - 1)) return 'innen_nw';
  if (!is(x + 1, y - 1)) return 'innen_no';
  if (!is(x - 1, y + 1)) return 'innen_sw';
  if (!is(x + 1, y + 1)) return 'innen_so';
  return 'mitte';
}
