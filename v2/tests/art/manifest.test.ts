import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';

const GFX = fileURLToPath(new URL('../../src/assets/gfx', import.meta.url));
const BUILD = fileURLToPath(new URL('../../tools/art/build.mjs', import.meta.url));
const DIRECTORY_FILES = ['LIZENZ-ninja-adventure.txt', 'QUELLEN.md', 'quellen.json'];
const PACK_PAGE = 'https://pixel-boy.itch.io/ninja-adventure-asset-pack';
const AUTHORS = ['Pixel-boy', 'AAA'];
const MAX_BYTES = 400 * 1024;

interface Entry {
  kennung: string;
  ziel: string;
  quelle: string;
  lizenz: string;
}
interface Sources {
  dateien: string[];
  eintraege: Entry[];
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

/** Alle Dateien unter dir, relativ und mit „/" getrennt, sortiert. */
function listFiles(dir: string): string[] {
  return walk(dir).map((p) => relative(dir, p).split(sep).join('/')).sort();
}

/** Text mit einheitlichen Zeilenenden (Git darf beim Auschecken CRLF setzen), PNG bytegenau. */
function content(path: string): Buffer {
  const bytes = readFileSync(path);
  return path.endsWith('.png') ? bytes : Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
}

const sources = JSON.parse(readFileSync(join(GFX, 'quellen.json'), 'utf8')) as Sources;

describe('Quellenverzeichnis src/assets/gfx', () => {
  const files = listFiles(GFX);

  it('führt jede Grafikdatei in quellen.json', () => {
    const listed = new Set(sources.dateien);
    const missing = files.filter((f) => !DIRECTORY_FILES.includes(f) && !listed.has(f));
    expect(missing).toEqual([]);
  });

  it('jede Zieldatei aus quellen.json existiert', () => {
    const targets = [...sources.dateien, ...sources.eintraege.map((e) => e.ziel)];
    expect(targets.filter((t) => !existsSync(join(GFX, t)))).toEqual([]);
  });

  it('jeder Eintrag hat Quelle und Lizenz CC0 1.0', () => {
    expect(sources.eintraege.length).toBeGreaterThan(0);
    for (const e of sources.eintraege) {
      expect(e.quelle, e.kennung).not.toBe('');
      expect(e.lizenz, e.kennung).toBe('CC0 1.0');
    }
  });

  it('die Lizenzdatei beginnt mit „CC0 1.0 Universal"', () => {
    expect(readFileSync(join(GFX, 'LIZENZ-ninja-adventure.txt'), 'utf8').startsWith('CC0 1.0 Universal')).toBe(true);
  });

  it('QUELLEN.md nennt die Pack-Seite und die Urheber', () => {
    const md = readFileSync(join(GFX, 'QUELLEN.md'), 'utf8');
    expect(md).toContain(PACK_PAGE);
    for (const name of AUTHORS) expect(md).toContain(name);
  });

  it('tiles/dorf.png hat Maße in Vielfachen von 16', () => {
    const png = PNG.sync.read(readFileSync(join(GFX, 'tiles/dorf.png')));
    expect(png.width % 16).toBe(0);
    expect(png.height % 16).toBe(0);
  });

  it('src/assets/gfx ist zusammen kleiner als 400 kB', () => {
    const total = files.reduce((sum, f) => sum + statSync(join(GFX, f)).size, 0);
    expect(total).toBeLessThan(MAX_BYTES);
  });
});

const packDir = process.env.NINJA_PACK_DIR;

describe.skipIf(!packDir)('Neubau aus dem Pack (nur mit NINJA_PACK_DIR)', () => {
  it('erzeugt bytegleich die eingecheckten Dateien', () => {
    const out = mkdtempSync(join(tmpdir(), 'emilia-art-'));
    try {
      execFileSync(process.execPath, [BUILD, out], { env: { ...process.env, NINJA_PACK_DIR: packDir }, stdio: 'pipe' });
      const built = listFiles(out);
      expect(built).toEqual(listFiles(GFX));
      const differing = built.filter((f) => !content(join(out, f)).equals(content(join(GFX, f))));
      expect(differing).toEqual([]);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 60_000);
});
