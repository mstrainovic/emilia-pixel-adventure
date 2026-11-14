// Zeilenwahl und Zeilenumbruch für Gespräche.
// Alt: src/systems/DialogSystem.js — dort liefen alle Sätze nacheinander (Zeilen 98–106) und mit 50 % Zufall die
// Freundschafts-Sätze (Zeilen 75–96). Neu: ein Gespräch zeigt genau einen Satz, die Wahl ist ohne Zufall und prüfbar.
import type { NpcDef } from '../data/types';
import type { FriendLevel } from './friendship';

export const DIALOG_LINE_CHARS = 36;
export const DIALOG_MAX_LINES = 2;
/** Sekunden, bevor dieselbe Person erneut angesprochen werden darf (verhindert Wiederholen durch gehaltene Taste). */
export const TALK_COOLDOWN = 0.3;

/** Bricht nur an Leerzeichen um; ein Wort über der Grenze bleibt ungeteilt in eigener Zeile. */
export function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    if (word === '') continue;
    if (current === '') current = word;
    else if (current.length + 1 + word.length <= maxChars) current += ` ${word}`;
    else { lines.push(current); current = word; }
  }
  if (current !== '') lines.push(current);
  return lines;
}

/**
 * Der Satz für das nächste Gespräch. Stufe 0: die allgemeinen Sätze reihum. Ab Stufe 1: bei geradem Zähler der
 * Freundschafts-Satz der Stufe, bei ungeradem der nächste allgemeine Satz. Ohne Sätze: `''`.
 */
export function pickLine(npc: NpcDef, talkCount: number, level: FriendLevel): string {
  const general = npc.dialogs;
  if (level === 0) return general.length > 0 ? general[talkCount % general.length]! : '';
  const friendly = npc.friendshipDialogs[level];
  if (talkCount % 2 === 0) {
    if (friendly.length > 0) return friendly[(talkCount / 2) % friendly.length]!;
    return general.length > 0 ? general[(talkCount / 2) % general.length]! : '';
  }
  return general.length > 0 ? general[((talkCount - 1) / 2) % general.length]! : '';
}
