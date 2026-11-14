import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const UI = fileURLToPath(new URL('../../src/ui', import.meta.url));
const TEXTS_FILE = fileURLToPath(new URL('../../src/data/texts.ts', import.meta.url));

/** Die acht Farb-Variablen des Baukastens (Plan 1b, Task 5). */
const COLOR_TOKENS = ['--c-accent', '--c-coin', '--c-heart', '--c-ink', '--c-ok', '--c-paper', '--c-shade', '--c-wood'];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = walk(UI)
  .filter((p) => p.endsWith('.css') || p.endsWith('.ts'))
  .map((path) => ({ rel: relative(UI, path).split(sep).join('/'), text: readFileSync(path, 'utf8') }));
const css = files.filter((f) => f.rel.endsWith('.css'));
const byName = (rel: string): string => files.find((f) => f.rel === rel)?.text ?? '';

/** CSS ohne Kommentare und ohne @font-face-Blöcke (dort ist `font-family` der Name der Schrift, kein Verweis). */
function rules(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '');
}

/** Werte einer Eigenschaft in CSS-Text. */
function values(text: string, property: string): string[] {
  const re = new RegExp(`(?<![-\\w])${property}\\s*:\\s*([^;}]+)`, 'g');
  return [...rules(text).matchAll(re)].map((m) => (m[1] ?? '').trim());
}

// Bildzeichen: Emoji, Piktogramme, Dingbats (auch ✕ U+2715) und die Emoji-Darstellungsauswahl
const PICTOGRAPH = /[\p{Extended_Pictographic}\u{2600}-\u{27BF}\u{1F000}-\u{1FAFF}\u{FE0F}]/u;

describe('Regeln des Oberflächen-Baukastens (src/ui)', () => {
  it('findet die Baukasten-Dateien', () => {
    for (const name of ['tokens.css', 'kit.css', 'fonts.css', 'root.ts', 'el.ts', 'windows.ts']) {
      expect(files.map((f) => f.rel), name).toContain(name);
    }
  });

  it('Farbwerte (#…, rgb(, hsl() stehen nur in tokens.css', () => {
    const color = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
    const offenders = files
      .filter((f) => f.rel !== 'tokens.css')
      .filter((f) => color.test(f.rel.endsWith('.css') ? rules(f.text) : f.text))
      .map((f) => f.rel);
    expect(offenders).toEqual([]);
  });

  it('tokens.css legt genau die acht Farb-Variablen fest', () => {
    const defined = [...rules(byName('tokens.css')).matchAll(/(--c-[\w-]+)\s*:/g)].map((m) => m[1]);
    expect([...defined].sort()).toEqual(COLOR_TOKENS);
  });

  it('font-size nur als var(--fs-1) bis var(--fs-4)', () => {
    const bad = css.flatMap((f) => values(f.text, 'font-size').filter((v) => !/^var\(--fs-[1-4]\)$/.test(v)).map((v) => `${f.rel}: ${v}`));
    expect(bad).toEqual([]);
    // auch nicht über den Umweg im Code
    expect(files.filter((f) => f.rel.endsWith('.ts') && /fontSize|font-size/.test(f.text)).map((f) => f.rel)).toEqual([]);
  });

  it('font-family nur als var(--font-text) oder var(--font-num)', () => {
    const bad = css.flatMap((f) => values(f.text, 'font-family')
      .filter((v) => v !== 'var(--font-text)' && v !== 'var(--font-num)').map((v) => `${f.rel}: ${v}`));
    expect(bad).toEqual([]);
    expect(files.filter((f) => f.rel.endsWith('.ts') && /fontFamily|font-family/.test(f.text)).map((f) => f.rel)).toEqual([]);
  });

  it('kein Emoji und kein Bildzeichen in src/ui und src/data/texts.ts', () => {
    const all = [...files, { rel: 'data/texts.ts', text: readFileSync(TEXTS_FILE, 'utf8') }];
    expect(all.filter((f) => PICTOGRAPH.test(f.text)).map((f) => f.rel)).toEqual([]);
  });

  it('die Prüfung erkennt Emoji und Dingbats, das Malzeichen × ist erlaubt', () => {
    for (const c of ['\u{1F600}', '✕', '✖', '❤', '⭐', '\u{1F5D9}']) expect(PICTOGRAPH.test(c), c).toBe(true);
    expect(PICTOGRAPH.test('×')).toBe(false);
  });

  it('kit.css beachtet die Aussparungen an allen vier Rändern', () => {
    const kit = byName('kit.css');
    for (const side of ['top', 'right', 'bottom', 'left']) expect(kit).toContain(`env(safe-area-inset-${side})`);
  });
});
