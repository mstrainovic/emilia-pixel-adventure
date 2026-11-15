import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';

const GFX = fileURLToPath(new URL('../../src/assets/gfx', import.meta.url));
const BUILD = fileURLToPath(new URL('../../tools/art/build.mjs', import.meta.url));
const DIRECTORY_FILES = ['LIZENZ-ninja-adventure.txt', 'LIZENZ-nunito.txt', 'QUELLEN.md', 'quellen.json'];
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

/** Text mit einheitlichen Zeilenenden (Git darf beim Auschecken CRLF setzen), Bilder und Schriften bytegenau. */
function content(path: string): Buffer {
  const bytes = readFileSync(path);
  return /\.(png|ttf)$/.test(path) ? bytes : Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
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

  it('die Lizenz der Schrift Nunito liegt bei (SIL Open Font License 1.1, aus dem installierten Paket)', () => {
    const text = readFileSync(join(GFX, 'LIZENZ-nunito.txt'), 'utf8');
    expect(text).toContain('This Font Software is licensed under the SIL Open Font License, Version 1.1.');
    expect(text).toContain('Nunito Project Authors');
    expect(readFileSync(join(GFX, 'QUELLEN.md'), 'utf8')).toContain('LIZENZ-nunito.txt');
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

  it('Oberfläche: Fensterrahmen, Knopf, gedrückter Knopf, Platz und Ziffernschrift aus dem Pack', () => {
    const expected: Record<string, string> = {
      'ui/fenster.png': 'Ui/Theme/Theme Wood/nine_path_panel.png',
      'ui/knopf.png': 'Ui/Theme/Theme Wood/button_normal.png',
      'ui/knopf_gedrueckt.png': 'Ui/Theme/Theme Wood/button_pressed.png',
      'ui/platz.png': 'Ui/Theme/Theme Wood/inventory_cell.png',
      'ui/zahlen.ttf': 'Ui/Font/NormalFont.ttf',
    };
    for (const [ziel, quelle] of Object.entries(expected)) {
      const entry = sources.eintraege.find((e) => e.ziel === ziel);
      expect(entry?.quelle, ziel).toBe(quelle);
      expect(existsSync(join(GFX, ziel)), ziel).toBe(true);
    }
  });

  it('Fensterrahmen ist 16×16, Knöpfe 16×8 (Ränder in ganzen Bildpunkten zerlegbar)', () => {
    const size = (f: string): [number, number] => {
      const png = PNG.sync.read(readFileSync(join(GFX, f)));
      return [png.width, png.height];
    };
    expect(size('ui/fenster.png')).toEqual([16, 16]);
    expect(size('ui/platz.png')).toEqual([16, 16]);
    expect(size('ui/knopf.png')).toEqual([16, 8]);
    expect(size('ui/knopf_gedrueckt.png')).toEqual([16, 8]);
  });

  it('über den Figuren: Tasten-Bild „E" aus Ui/Input, Hinweis-Symbol aus Ui/Emote (Task 7)', () => {
    const expected: Record<string, { quelle: string; size: [number, number] }> = {
      'ui/taste_e.png': { quelle: 'Ui/Input/Keyboard/KeyE.png', size: [13, 13] },
      'ui/hinweis.png': { quelle: 'Ui/Emote/emote22.png', size: [14, 13] },
      // Kontext-Knopf der Touch-Bedienung (Task 8)
      'ui/sprechblase.png': { quelle: 'Ui/Emote/emote20.png', size: [14, 13] },
      // Tasten-Bilder der Hilfe (Task 9)
      'ui/taste_w.png': { quelle: 'Ui/Input/Keyboard/KeyW.png', size: [13, 13] },
      'ui/taste_a.png': { quelle: 'Ui/Input/Keyboard/KeyA.png', size: [13, 13] },
      'ui/taste_s.png': { quelle: 'Ui/Input/Keyboard/KeyS.png', size: [13, 13] },
      'ui/taste_d.png': { quelle: 'Ui/Input/Keyboard/KeyD.png', size: [13, 13] },
      'ui/taste_shift.png': { quelle: 'Ui/Input/Keyboard/KeyShift.png', size: [30, 13] },
      'ui/taste_esc.png': { quelle: 'Ui/Input/Keyboard/KeyEscape.png', size: [18, 13] },
      // Pfeiltasten und M in der Hilfe (Fix-Welle F15)
      ...Object.fromEntries((['up', 'left', 'down', 'right', 'm'] as const).map((k) => [
        `ui/taste_${k}.png`,
        { quelle: `Ui/Input/Keyboard/Key${k === 'm' ? 'M' : k[0]!.toUpperCase() + k.slice(1)}.png`, size: [13, 13] as [number, number] },
      ])),
      ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [
        `ui/taste_${n}.png`, { quelle: `Ui/Input/Keyboard/Key${n}.png`, size: [13, 13] as [number, number] },
      ])),
    };
    for (const [ziel, { quelle, size }] of Object.entries(expected)) {
      expect(sources.eintraege.find((e) => e.ziel === ziel)?.quelle, ziel).toBe(quelle);
      const png = PNG.sync.read(readFileSync(join(GFX, ziel)));
      expect([png.width, png.height], ziel).toEqual(size);
    }
  });

  it('QUELLEN.md nennt beide Schriften mit Herkunft und Lizenz', () => {
    const md = readFileSync(join(GFX, 'QUELLEN.md'), 'utf8');
    expect(md).toContain('Nunito');
    expect(md).toContain('@fontsource/nunito');
    expect(md).toContain('SIL Open Font License 1.1');
    expect(md).toContain('EmiliaZahlen');
    expect(md).toContain('Ui/Font/NormalFont.ttf');
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
