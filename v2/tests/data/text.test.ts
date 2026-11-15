import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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

describe('Schrift und Texte', () => {
  /** Bereiche (unicode-range) aller Nunito-Teilsätze aus fonts.css, je Datei. */
  function nunitoRanges(): { file: string; ranges: [number, number][] }[] {
    const css = readFileSync(new URL('../../src/ui/fonts.css', import.meta.url), 'utf8');
    return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)]
      .map((m) => m[1]!)
      .filter((block) => /font-family:\s*'Nunito'/.test(block))
      .map((block) => ({
        file: /nunito-([a-z-]+)-\d+-normal/.exec(block)![1]!,
        ranges: /unicode-range:\s*([^;]+);/.exec(block)![1]!.split(',').map((part) => {
          const [from, to] = part.trim().replace('U+', '').split('-');
          return [parseInt(from!, 16), parseInt(to ?? from!, 16)] as [number, number];
        }),
      }));
  }
  const covers = (ranges: [number, number][], code: number): boolean => ranges.some(([a, b]) => code >= a && code <= b);

  it('jedes Zeichen aller Texte liegt in einem Teilsatz von Nunito (sonst zeichnet der Browser eine Ersatzschrift)', () => {
    const faces = nunitoRanges();
    expect(faces.map((f) => f.file).sort()).toEqual(['latin', 'latin', 'latin-ext', 'latin-ext']);
    const missing = new Set<string>();
    for (const ch of collectTexts().join('')) {
      if (!faces.some((f) => covers(f.ranges, ch.codePointAt(0)!))) missing.add(ch);
    }
    expect([...missing]).toEqual([]);
    // Gegenprobe: Kyrillisch gehört zu keinem der beiden Teilsätze
    expect(faces.some((f) => covers(f.ranges, 'ж'.codePointAt(0)!))).toBe(false);
  });
  it('die serbischen Zeichen č, ć, š, ž, đ stehen im Teilsatz latin-ext und kommen in den Texten vor', () => {
    const ext = nunitoRanges().filter((f) => f.file === 'latin-ext');
    expect(ext.length).toBe(2);
    const joined = collectTexts().join('');
    for (const ch of 'čćšžđ') {
      for (const f of ext) expect(covers(f.ranges, ch.codePointAt(0)!), ch).toBe(true);
      expect(joined, ch).toContain(ch);
    }
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
  it('Bedien-Hinweise und Level-Anzeige (Fix-Welle F12)', () => {
    expect(hint('move', 'keys')).toBe('Laufen mit W A S D oder den Pfeiltasten');
    expect(hint('interact', 'touch')).toBe('Tippe auf den Knopf unten rechts');
    expect(TEXTS['hud.levelWord']).toBe('Level');
  });
  it('Hinweise beim Reden im Dorf', () => {
    expect(TEXTS['toast.questDone']).toBe('Aufgabe geschafft!');
    expect(fillText('toast.levelUp', { n: 2 })).toBe('Level 2!');
    expect(TEXTS['toast.exitSoon']).toBe('Hier geht es bald weiter.');
  });
  it('Touch-Bedienung: Beschriftung des Kontext-Knopfs je Ziel, Dreh-Hinweis', () => {
    expect(TEXTS['touch.action']).toBe('Aktion');
    expect(TEXTS['touch.talk']).toBe('Reden');
    expect(TEXTS['rotate.hint']).toBe('Bitte dreh das Handy quer.');
  });
  it('Menü und Hilfe (Task 9): Titel, Knopf, je Bedienung genau ein Wort', () => {
    expect(TEXTS['menu.title']).toBe('Menü');
    expect(TEXTS['menu.help']).toBe('Hilfe');
    expect(TEXTS['help.title']).toBe('Hilfe');
    const words = [TEXTS['help.move'], TEXTS['help.run'], TEXTS['help.talk'], TEXTS['help.hotbar'], TEXTS['help.menu'], TEXTS['help.close']];
    expect(words).toEqual(['laufen', 'rennen', 'reden', 'wählen', 'Menü', 'schließen']);
    for (const w of words) expect(w).toMatch(/^\p{L}+$/u);
  });
  it('Hinweise zu Start und Speichern (Task 9), wörtlich wie im Auftrag', () => {
    expect(TEXTS['notice.title']).toBe('Hinweis');
    expect(TEXTS['notice.ok']).toBe('Okay');
    expect(TEXTS['legacy.title']).toBe('Alter Spielstand');
    expect(TEXTS['backup.title']).toBe('Spielstand laden?');
    expect(TEXTS['notice.save-corrupt']).toBe('Dein Spielstand war kaputt. Wir fangen neu an.');
    expect(TEXTS['notice.save-corrupt-legacy']).toBe('Dein Spielstand war kaputt. Wir nehmen den Spielstand aus dem alten Spiel.');
    expect(TEXTS['notice.save-repaired']).toBe('Dein Spielstand war kaputt. Wir haben ihn repariert. Vielleicht fehlt etwas.');
    expect(TEXTS['notice.save-newer']).toBe('Dein Spielstand ist neuer als diese Seite. Bitte lade die Seite neu.');
    expect(TEXTS['notice.storage-unavailable']).toBe('Das Spiel kann hier nicht speichern. Beim nächsten Mal fängst du neu an.');
    expect(TEXTS['notice.legacy-imported']).toBe('Dein Spielstand aus dem alten Spiel ist da!');
    expect(TEXTS['notice.legacy-failed']).toBe('Den alten Spielstand konnten wir nicht holen. Du spielst mit deinem weiter.');
    expect(TEXTS['save.failed']).toBe('Speichern klappt gerade nicht. Sichere den Spielstand im Menü.');
    expect(TEXTS['save.otherTab']).toBe('Das Spiel ist zweimal offen. Hier wird nicht gespeichert. Schließ das andere und lade neu.');
    expect(TEXTS['notice.reload']).toBe('Neu laden');
    expect(TEXTS['hud.unsaved']).toBe('Nicht gespeichert');
    expect(TEXTS['legacy.question']).toBe('Im alten Spiel bist du weiter. Diesen Spielstand holen? Der jetzige wird ersetzt.');
    expect(TEXTS['legacy.yes']).toBe('Ja');
    expect(TEXTS['legacy.no']).toBe('Nein');
  });

  it('Sicherung als Datei (Task 10), wörtlich wie im Auftrag', () => {
    expect(TEXTS['menu.saveExport']).toBe('Spielstand sichern');
    expect(TEXTS['menu.saveImport']).toBe('Spielstand laden');
    expect(TEXTS['backup.saved']).toBe('Datei ist fertig. Sie liegt bei den Downloads.');
    expect(TEXTS['backup.unfit']).toBe('Das ist keine Spielstand-Datei.');
    expect(TEXTS['backup.question']).toBe('Diesen Spielstand laden? Der jetzige wird ersetzt.');
    expect(TEXTS['backup.yes']).toBe('Ja');
    expect(TEXTS['backup.no']).toBe('Nein');
    expect(TEXTS['backup.remind']).toBe('Zeit zum Sichern! Öffne das Menü und wähle „Spielstand sichern“.');
    expect(TEXTS['backup.remindWindow']).toBe('Zeit zum Sichern!');
    expect(TEXTS['backup.now']).toBe('Jetzt sichern');
    expect(TEXTS['backup.later']).toBe('Später');
  });
});
