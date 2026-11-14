import { describe, it, expect } from 'vitest';
import { ITEMS } from '../../src/data/items';
import { RECIPES } from '../../src/data/recipes';
import { QUESTS } from '../../src/data/quests';
import { NPCS } from '../../src/data/npcs';
import { ENEMIES } from '../../src/data/enemies';
import { BOSSES } from '../../src/data/bosses';
import { FISH_TYPES } from '../../src/data/fish';
import { SHELL_TYPES } from '../../src/data/shells';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../../src/data/achievements';

/** Ganze Wörter (klein geschrieben), die die Muster treffen dürfen, jeweils mit Begründung. */
const EXCEPTIONS: Record<string, string> = {};

const UMLAUT_PATTERN = /(?<![aeq])ue|ae|oe/i;
const SHARP_S_PATTERN = /(schliess|heiss|weiss|gross|strasse|fuss|suess|spass|drauss|fleiss|gruss|giess|stoss|beiss|ausser)/i;

/** Alle für Spielerinnen sichtbaren Textwerte aller Datenmodule (ohne Kennungen). */
function collectTexts(): string[] {
  const out: string[] = [];
  for (const i of Object.values(ITEMS)) out.push(i.name);
  for (const list of Object.values(RECIPES)) for (const r of list) out.push(r.name);
  for (const q of Object.values(QUESTS)) out.push(q.name, q.description);
  for (const n of NPCS) {
    out.push(n.name, n.role, ...n.dialogs);
    for (const lines of Object.values(n.friendshipDialogs)) out.push(...lines);
  }
  for (const e of Object.values(ENEMIES)) out.push(e.name);
  for (const b of Object.values(BOSSES)) { out.push(b.name); for (const p of b.phases) out.push(p.name); }
  for (const f of Object.values(FISH_TYPES)) out.push(f.name);
  for (const s of Object.values(SHELL_TYPES)) out.push(s.name);
  for (const a of Object.values(ACHIEVEMENTS)) out.push(a.name, a.description);
  for (const c of Object.values(ACHIEVEMENT_CATEGORIES)) out.push(c.name);
  return out;
}

describe('Texte', () => {
  const texts = collectTexts();
  it('sammelt eine plausible Menge Texte', () => {
    expect(texts.length).toBeGreaterThan(300);
  });
  it('enthält keine ae/oe/ue/ss-Ersatzschreibungen', () => {
    const hits: string[] = [];
    for (const t of texts) {
      for (const word of t.split(/[^\p{L}]+/u)) {
        if (!word || word.toLowerCase() in EXCEPTIONS) continue;
        if (UMLAUT_PATTERN.test(word) || SHARP_S_PATTERN.test(word)) hits.push(`${word}  in  "${t}"`);
      }
    }
    expect(hits).toEqual([]);
  });
  it('enthält keine zu viel gesetzten Umlaute', () => {
    // fängt „neü", „Maür", „Feür", „Abenteür", „Qülle"
    const OVER_UMLAUT = /[aeoäö]ü|qü|aktüll|manüll|pösie|söben/i;
    const hits = texts.filter((t) => OVER_UMLAUT.test(t));
    expect(hits).toEqual([]);
  });
  it('enthält den Satz „mächtiger stolz" nicht', () => {
    expect(texts.filter((t) => t.includes('mächtiger stolz'))).toEqual([]);
  });
  it('verwendet echte Umlaute', () => {
    const joined = texts.join('\n');
    for (const c of ['ä', 'ö', 'ü', 'ß']) expect(joined).toContain(c);
  });
});
