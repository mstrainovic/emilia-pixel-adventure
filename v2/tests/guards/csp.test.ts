import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CSP } from './csp';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

describe('index.html', () => {
  it('enthält genau eine Content-Security-Policy mit dem vorgegebenen Wortlaut', () => {
    const metas = html.match(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>/gi) ?? [];
    expect(metas).toHaveLength(1);
    expect(metas[0]).toContain(`content="${CSP}"`);
  });

  it('lädt nur das Hauptmodul als Skript', () => {
    const scripts = html.match(/<script\b[^>]*>/gi) ?? [];
    expect(scripts).toEqual(['<script type="module" src="/src/main.ts">']);
  });

  it('enthält keine Adresse nach außen außer dem SVG-Namensraum', () => {
    const urls = html.match(/https?:\/\/[^\s"'<>)]+/gi) ?? [];
    expect(urls.filter((u) => u !== 'http://www.w3.org/2000/svg')).toEqual([]);
  });
});
