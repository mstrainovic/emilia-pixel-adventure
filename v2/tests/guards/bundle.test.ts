import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const DIST = fileURLToPath(new URL('../../../dist/v2', import.meta.url));
const MAX_BYTES = 4 * 1024 * 1024;

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)],
  );
}

describe('gebautes Paket dist/v2', () => {
  it('ist vorhanden (zuerst npm run build)', () => {
    expect(existsSync(join(DIST, 'index.html'))).toBe(true);
  });

  const files = existsSync(DIST) ? listFiles(DIST) : [];
  const rel = (p: string): string => relative(DIST, p).split(sep).join('/');

  it('index.html trägt die Content-Security-Policy', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain("script-src 'self'");
  });

  it('enthält den Test-Zugang nicht', () => {
    const leaks = files.filter((f) => f.endsWith('.js') && readFileSync(f, 'utf8').includes('__emilia2')).map(rel);
    expect(leaks).toEqual([]);
  });

  it('enthält keine Altdaten für Entwicklung und Tests', () => {
    const leaks = files
      .filter((f) => rel(f).split('/').includes('legacy-maps') || readFileSync(f).includes('legacy-tiles'))
      .map(rel);
    expect(leaks).toEqual([]);
  });

  it('bleibt unter 4 MB', () => {
    const total = files.reduce((sum, f) => sum + statSync(f).size, 0);
    expect(total).toBeLessThan(MAX_BYTES);
  });
});
