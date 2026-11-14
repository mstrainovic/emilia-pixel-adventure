import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';

const UI = fileURLToPath(new URL('../../src/ui', import.meta.url));
const GFX = fileURLToPath(new URL('../../src/assets/gfx', import.meta.url));
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

/** Ein neunteiliger Rand aus kit.css: Bild, Schnitte (oben, rechts, unten, links, Quellpixel), Breiten in --hud-px. */
interface NineSlice { image: string; slice: number[]; fill: boolean; widths: (number | null)[]; source: string }

/** Wie CSS: ein bis vier Werte auf oben, rechts, unten, links verteilen. */
function sides<T>(v: T[]): T[] {
  const [a, b = a, c = a, d = b] = v as [T, T?, T?, T?];
  return [a, b as T, c as T, d as T];
}

/**
 * Breite in Bildpunkten: Die Randbilder liegen auf der Randbild-Ebene ::before (kit.css), die in Bildpunkten gebaut
 * ist (`Npx` = N Bildpunkte) und mit transform: scale(var(--hud-scale)) vergrößert wird. Sonst null.
 */
function hudMultiple(token: string): number | null {
  const m = /^(\d+)px$/.exec(token);
  return m ? Number(m[1]) : null;
}

/** Alle `border-image`-Kurzschreibungen mit einem Bild aus gfx/ui. */
function nineSlices(text: string): NineSlice[] {
  return values(text, 'border-image').map((value) => {
    const m = /^url\('\.\.\/assets\/gfx\/ui\/(\w+)\.png'\)\s+([\d\s]+?)\s*(fill)?\s*\/\s*(.+?)\s+stretch$/.exec(value);
    if (!m) throw new Error(`border-image nicht lesbar: ${value}`);
    const widths = (m[4] ?? '').match(/calc\([^)]*\)\)|var\([^)]*\)|\S+/g) ?? [];
    return {
      image: m[1] ?? '',
      slice: sides((m[2] ?? '').trim().split(/\s+/).map(Number)),
      fill: m[3] === 'fill',
      widths: sides(widths.map(hudMultiple)),
      source: value,
    };
  });
}

function checkWidths(s: NineSlice): string[] {
  return s.widths.some((w, i) => w !== s.slice[i]) ? [`${s.image}: Breiten ${s.widths} passen nicht zu den Schnitten ${s.slice}`] : [];
}

/** Gestreckte Bänder eines Bildes: Kanten (quer zur Streckrichtung einfarbig) und, mit `fill`, die Mitte. */
function stripeProblems(s: NineSlice): string[] {
  const png = PNG.sync.read(readFileSync(join(GFX, 'ui', `${s.image}.png`)));
  const at = (x: number, y: number): string => png.data.subarray((y * png.width + x) * 4, (y * png.width + x) * 4 + 4).join(',');
  const [top, right, bottom, left] = s.slice as [number, number, number, number];
  const x0 = left, x1 = png.width - right, y0 = top, y1 = png.height - bottom;
  const problems: string[] = [];
  if (x0 >= x1 || y0 >= y1) return [`${s.image}: Schnitte ${s.slice} lassen keine Mitte`];
  const uniform = (what: string, points: [number, number][]): void => {
    const colors = new Set(points.map(([x, y]) => at(x, y)));
    if (colors.size > 1) problems.push(`${s.image}: ${what} nicht einfarbig`);
  };
  const range = (a: number, b: number): number[] => Array.from({ length: b - a }, (_, i) => a + i);
  // obere und untere Kante werden waagrecht gestreckt: jede Zeile einfarbig
  for (const y of [...range(0, y0), ...range(y1, png.height)]) uniform(`Zeile ${y}`, range(x0, x1).map((x) => [x, y]));
  // linke und rechte Kante werden senkrecht gestreckt: jede Spalte einfarbig
  for (const x of [...range(0, x0), ...range(x1, png.width)]) uniform(`Spalte ${x}`, range(y0, y1).map((y) => [x, y]));
  if (s.fill) uniform('Mitte', range(x0, x1).flatMap((x) => range(y0, y1).map((y): [number, number] => [x, y])));
  return problems;
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

  // Ausnahme für die Ziffernschrift (Task 6): die Stufe auf 9 Gerätepixel gerundet, nur so ist sie scharf (1 Schriftpixel = 1/9 em)
  it('font-size nur als var(--fs-1) bis var(--fs-4), für Ziffern auf 9 Gerätepixel gerundet', () => {
    const allowed = /^(var\(--fs-[1-4]\)|round\(nearest, var\(--fs-[1-4]\), calc\(9 \* var\(--px\)\)\))$/;
    const bad = css.flatMap((f) => values(f.text, 'font-size').filter((v) => !allowed.test(v)).map((v) => `${f.rel}: ${v}`));
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

  it('neunteilige Ränder: jedes gestreckte Band ist einfarbig, die Randbreite ist genau der Schnitt (in Bildpunkten)', () => {
    const slices = nineSlices(byName('kit.css'));
    // Fenster, Knopf, gedrückter Knopf, Platz
    expect(slices.map((s) => s.image).sort()).toEqual(['fenster', 'knopf', 'knopf_gedrueckt', 'platz']);
    const problems = slices.flatMap((s) => [...checkWidths(s), ...stripeProblems(s)]);
    expect(problems).toEqual([]);
  });

  it('die Prüfung erkennt falsche Schnitte (gedrückter Knopf mit den Schnitten des normalen)', () => {
    const wrong: NineSlice = { image: 'knopf_gedrueckt', slice: [2, 2, 2, 2], fill: true, widths: [2, 2, 2, 2], source: 'Probe' };
    expect(stripeProblems(wrong).length).toBeGreaterThan(0);
  });

  it('Randbild-Ebene: in Bildpunkten gebaut, mit --hud-scale vergrößert; das Element hält den Rand als Innenabstand', () => {
    const kit = rules(byName('kit.css'));
    // jedes border-image steht in einer Regel für ::before
    const owners = [...kit.matchAll(/([^{}]+)\{[^}]*border-image:/g)].map((m) => (m[1] ?? '').trim());
    expect(owners.length).toBe(4);
    for (const selector of owners) expect(selector.split(',').every((s) => s.trim().endsWith('::before')), selector).toBe(true);
    expect(kit).toContain('transform: scale(var(--hud-scale))');
    expect(kit).toContain('width: calc(100% / var(--hud-scale))');
    expect(kit).toContain('height: calc(100% / var(--hud-scale))');
    // Innenabstand = Schnitt × --hud-px (Knopf: dazu --sp-3 links und rechts)
    for (const padding of [
      'calc(5 * var(--hud-px))',
      'calc(2 * var(--hud-px)) calc(2 * var(--hud-px) + var(--sp-3))',
      'calc(3 * var(--hud-px)) var(--hud-px) var(--hud-px) calc(3 * var(--hud-px))',
    ]) expect(values(kit, 'padding'), padding).toContain(padding);
  });

  it('ein Randbild wird nie allein über border-image-source getauscht (die Schnitte gehören zum Bild)', () => {
    expect(values(byName('kit.css'), 'border-image-source')).toEqual([]);
  });

  it('kit.css beachtet die Aussparungen an allen vier Rändern', () => {
    const kit = byName('kit.css');
    for (const side of ['top', 'right', 'bottom', 'left']) expect(kit).toContain(`env(safe-area-inset-${side})`);
  });
});
