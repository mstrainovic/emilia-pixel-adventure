import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../../src', import.meta.url));

function listTs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listTs(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [],
  );
}

const files = listTs(SRC).map((path) => ({
  rel: relative(SRC, path).split(sep).join('/'),
  text: readFileSync(path, 'utf8'),
}));

/** Dateien, die `pattern` enthalten, ohne die erlaubten Orte. */
function offenders(pattern: RegExp, allowed: (rel: string) => boolean): string[] {
  return files.filter((f) => !allowed(f.rel) && pattern.test(f.text)).map((f) => f.rel);
}

describe('Quelltext-Regeln für v2/src', () => {
  it('findet überhaupt Quelldateien', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('Browser-Speicher nur unter src/save/', () => {
    expect(offenders(/\b(localStorage|sessionStorage|indexedDB)\b/, (r) => r.startsWith('save/'))).toEqual([]);
  });

  it('window.__ nur in src/core/testHooks.ts', () => {
    expect(offenders(/window\.__/, (r) => r === 'core/testHooks.ts')).toEqual([]);
  });

  it('keine Netzwerkzugriffe', () => {
    expect(offenders(/\bfetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/, () => false)).toEqual([]);
  });

  it('keine Adress-Literale', () => {
    expect(offenders(/https?:\/\//, () => false)).toEqual([]);
  });

  it('keine Datei über 500 Zeilen', () => {
    const long = files.filter((f) => f.text.split('\n').length > 500).map((f) => f.rel);
    expect(long).toEqual([]);
  });
});
