import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CSP } from './csp';

const DIST = fileURLToPath(new URL('../../../dist/v2', import.meta.url));
const MAX_BYTES = 4 * 1024 * 1024;
/** Test-Zugänge und Prüfhilfen, die im ausgelieferten Paket nichts verloren haben. */
const FORBIDDEN = ['__emilia2', 'stilprobe', 'lastSaveResult', 'PixelProbe', 'probe=schach', 'openTestWindow', 'consumeInput', 'uiLog', 'setHp', 'setSlot', 'skipTime', 'talkState', 'touchState'];
const NOT_BUILT = 'dist/v2 fehlt oder ist leer. Erst bauen: npm run build';

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const files = existsSync(DIST) ? listFiles(DIST) : [];
const rel = (p: string): string => relative(DIST, p).split(sep).join('/');

/** Jeder Test beginnt hier: ohne gebautes Paket schlägt er mit einer klaren Meldung fehl, statt leer durchzulaufen. */
function requireBuild(): void {
  if (!existsSync(join(DIST, 'index.html')) || files.length === 0) throw new Error(NOT_BUILT);
}

describe('gebautes Paket dist/v2', () => {
  it('ist vorhanden', () => {
    requireBuild();
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
  });

  it('index.html trägt genau die Content-Security-Policy mit dem vorgegebenen Wortlaut', () => {
    requireBuild();
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    const metas = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>/gi) ?? [];
    expect(metas).toHaveLength(1);
    expect(metas[0]).toContain(`content="${CSP}"`);
  });

  it.each(FORBIDDEN)('enthält die Zeichenfolge „%s“ nicht in einer JavaScript-Datei', (needle) => {
    requireBuild();
    const leaks = files.filter((f) => f.endsWith('.js') && readFileSync(f, 'utf8').includes(needle)).map(rel);
    expect(leaks).toEqual([]);
  });

  it('enthält keine Altdaten für Entwicklung und Tests', () => {
    requireBuild();
    const leaks = files
      .filter((f) => rel(f).split('/').includes('legacy-maps') || readFileSync(f).includes('legacy-tiles'))
      .map(rel);
    expect(leaks).toEqual([]);
  });

  it('liefert die Schriften selbst mit (Nunito latin und latin-ext in 400 und 700, Ziffernschrift)', () => {
    requireBuild();
    const names = files.map(rel);
    for (const subset of ['latin', 'latin-ext']) {
      for (const weight of ['400', '700']) {
        const re = new RegExp(`nunito-${subset}-${weight}-normal[^/]*\\.woff2$`);
        expect(names.some((n) => re.test(n)), `${subset} ${weight}`).toBe(true);
      }
    }
    expect(names.some((n) => /zahlen[^/]*\.ttf$/.test(n))).toBe(true);
  });

  it('bleibt unter 4 MB', () => {
    requireBuild();
    const total = files.reduce((sum, f) => sum + statSync(f).size, 0);
    expect(total).toBeLessThan(MAX_BYTES);
  });
});
