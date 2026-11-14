import { describe, it, expect } from 'vitest';
import { wrapLines, pickLine, DIALOG_LINE_CHARS, DIALOG_MAX_LINES, TALK_COOLDOWN } from '../../src/systems/dialogue';
import { NPCS } from '../../src/data/npcs';
import type { NpcDef } from '../../src/data/types';

const mama = NPCS.find((n) => n.id === 'mama_tanja') as NpcDef;

describe('wrapLines', () => {
  it('bricht einen langen Satz in zwei Zeilen von höchstens 36 Zeichen', () => {
    const text = 'Hallo Schatz! Die Welt wartet — aber iss erstmal was!';
    const lines = wrapLines(text, 36);
    expect(lines).toHaveLength(2);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(36);
    expect(lines.join(' ')).toBe(text);
  });
  it('lässt einen kurzen Satz in einer Zeile', () => {
    expect(wrapLines('Hallo!', 36)).toEqual(['Hallo!']);
  });
  it('lässt ein zu langes Wort ungeteilt in eigener Zeile', () => {
    const long = 'x'.repeat(40);
    expect(wrapLines(`Ein ${long} Wort`, 36)).toEqual(['Ein', long, 'Wort']);
  });
  it('liefert bei leerem Text keine Zeilen', () => {
    expect(wrapLines('', 36)).toEqual([]);
    expect(wrapLines('   ', 36)).toEqual([]);
  });
  it('nennt die Grenzen des Gesprächs', () => {
    expect([DIALOG_LINE_CHARS, DIALOG_MAX_LINES, TALK_COOLDOWN]).toEqual([36, 2, 0.3]);
  });
});

describe('pickLine', () => {
  it('Stufe 0 geht reihum durch die allgemeinen Sätze', () => {
    expect(pickLine(mama, 0, 0)).toBe(mama.dialogs[0]);
    expect(pickLine(mama, 1, 0)).toBe(mama.dialogs[1]);
    expect(pickLine(mama, 8, 0)).toBe(mama.dialogs[0]);
  });
  it('ab Stufe 1 wechseln sich Freundschafts-Satz und allgemeiner Satz ab', () => {
    expect(pickLine(mama, 0, 2)).toBe(mama.friendshipDialogs[2][0]);
    expect(pickLine(mama, 1, 2)).toBe(mama.dialogs[0]);
    expect(pickLine(mama, 2, 2)).toBe(mama.friendshipDialogs[2][1]);
    expect(pickLine(mama, 3, 2)).toBe(mama.dialogs[1]);
  });
  it('ohne Sätze kommt ein leerer Text', () => {
    const stumm: NpcDef = { ...mama, dialogs: [], friendshipDialogs: { 1: [], 2: [], 3: [] } };
    expect(pickLine(stumm, 0, 0)).toBe('');
    expect(pickLine(stumm, 0, 2)).toBe('');
    expect(pickLine(stumm, 1, 2)).toBe('');
  });
});
