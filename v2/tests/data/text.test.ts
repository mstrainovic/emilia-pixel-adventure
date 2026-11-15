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
import { wrapLines, DIALOG_LINE_CHARS, DIALOG_MAX_LINES } from '../../src/systems/dialogue';
import { TEXTS, fillText, hint } from '../../src/data/texts';

/** Begriffe, die im Bild anders heißen (Aufgabe, Gegenstand, Rucksack, Herstellen, Erfolge). */
const FORBIDDEN_TERMS = ['Quest', 'Item', 'Inventar', 'Crafting', 'Achievement'];

/** Alle Texte der Oberfläche: TEXTS und jeder Hinweis je Handlung und Gerät. */
function uiTexts(): string[] {
  const hints = (['interact', 'close', 'move'] as const).flatMap((a) => (['keys', 'touch'] as const).map((d) => hint(a, d)));
  return [...Object.values(TEXTS), ...hints];
}

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
  out.push(...uiTexts());
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
  it('jeder Satz der Dorfbewohner passt in höchstens 2 Zeilen zu 36 Zeichen', () => {
    const tooLong: string[] = [];
    for (const n of NPCS) {
      const all = [...n.dialogs, ...Object.values(n.friendshipDialogs).flat()];
      for (const t of all) if (wrapLines(t, DIALOG_LINE_CHARS).length > DIALOG_MAX_LINES) tooLong.push(`${n.id}: ${t}`);
    }
    expect(tooLong).toEqual([]);
  });
});

describe('Texte der Oberfläche (TEXTS)', () => {
  const texts = uiTexts();
  it('werden mitgesammelt', () => {
    expect(Object.keys(TEXTS).length).toBeGreaterThan(0);
    for (const t of texts) expect(collectTexts()).toContain(t);
  });
  it('sind nicht leer', () => {
    expect(texts.filter((t) => t.trim() === '')).toEqual([]);
  });
  it.each(FORBIDDEN_TERMS)('enthalten das Wort „%s" nicht', (term) => {
    const word = new RegExp(`(?<![\\p{L}])${term}(?![\\p{L}])`, 'iu');
    expect(texts.filter((t) => word.test(t))).toEqual([]);
  });
  it('die Prüfung trifft nur ganze Wörter', () => {
    const word = /(?<![\p{L}])Item(?![\p{L}])/iu;
    expect(word.test('ein Item')).toBe(true);
    expect(word.test('Items')).toBe(false);
  });
  it('Hinweise nennen je Gerät Taste oder Knopf', () => {
    for (const a of ['interact', 'close', 'move'] as const) expect(hint(a, 'keys')).not.toBe(hint(a, 'touch'));
  });
});

describe('fillText', () => {
  it('setzt Werte für die Platzhalter ein, fehlende bleiben stehen', () => {
    expect(fillText('hud.hearts', { n: '2,25', max: 5 })).toBe('2,25 von 5 Herzen');
    expect(fillText('hud.slot.count', { name: 'Beere', n: 5 })).toBe('Beere, 5 Stück');
    expect(fillText('hud.level', {})).toBe('Level {n}');
  });
  it('Hinweise beim Reden im Dorf', () => {
    expect(TEXTS['toast.questDone']).toBe('Aufgabe geschafft!');
    expect(fillText('toast.levelUp', { n: 2 })).toBe('Level 2!');
    expect(TEXTS['toast.exitSoon']).toBe('Hier geht es bald weiter.');
  });
  it('Touch-Bedienung: Beschriftung des Kontext-Knopfs je Ziel, Dreh-Hinweis', () => {
    expect(TEXTS['touch.action']).toBe('Aktion');
    expect(TEXTS['touch.talk']).toBe('Reden');
    expect(TEXTS['rotate.hint']).toBe('Bitte dreh das Gerät quer.');
  });
  it('Menü und Hilfe (Task 9): Titel, Knopf, je Bedienung genau ein Wort', () => {
    expect(TEXTS['menu.title']).toBe('Menü');
    expect(TEXTS['menu.help']).toBe('Hilfe');
    expect(TEXTS['help.title']).toBe('Hilfe');
    const words = [TEXTS['help.move'], TEXTS['help.run'], TEXTS['help.talk'], TEXTS['help.hotbar'], TEXTS['help.close']];
    expect(words).toEqual(['laufen', 'rennen', 'reden', 'Schnellleiste', 'schließen']);
    for (const w of words) expect(w).toMatch(/^\p{L}+$/u);
  });
  it('Hinweise zu Start und Speichern (Task 9), wörtlich wie im Auftrag', () => {
    expect(TEXTS['notice.title']).toBe('Hinweis');
    expect(TEXTS['notice.ok']).toBe('Gut');
    expect(TEXTS['notice.save-corrupt']).toBe('Dein Spielstand war kaputt. Wir fangen neu an.');
    expect(TEXTS['notice.save-corrupt-legacy']).toBe('Dein Spielstand war kaputt. Wir haben den aus dem alten Spiel geholt.');
    expect(TEXTS['notice.save-repaired']).toBe('Dein Spielstand wurde repariert. Vielleicht fehlt etwas.');
    expect(TEXTS['notice.save-newer']).toBe('Bitte lade die Seite neu, damit dein Spielstand passt.');
    expect(TEXTS['notice.storage-unavailable']).toBe('Hier kann das Spiel nicht speichern.');
    expect(TEXTS['notice.legacy-imported']).toBe('Dein Spielstand aus dem alten Spiel ist da!');
    expect(TEXTS['notice.legacy-failed']).toBe('Der alte Spielstand konnte nicht geholt werden.');
    expect(TEXTS['save.failed']).toBe('Speichern hat nicht geklappt.');
    expect(TEXTS['save.otherTab']).toBe('Das Spiel ist noch in einem anderen Fenster offen. Bitte lade die Seite neu.');
    expect(TEXTS['legacy.question']).toBe('Im alten Spiel bist du weitergekommen. Den Stand von dort holen?');
    expect(TEXTS['legacy.yes']).toBe('Ja');
    expect(TEXTS['legacy.no']).toBe('Nein');
  });
});
