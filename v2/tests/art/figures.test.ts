import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { NPCS } from '../../src/data/npcs';
import { FACING_COLUMN, FIGURE_FRAME, FIGURES, figureFrame, IDLE_ROW, WALK_ROWS } from '../../src/data/sprites';
// @ts-expect-error -- Grafik-Werkzeuge sind untypisiertes JavaScript (laufen nur in Node, nicht im Spiel)
import { FIGURES as SELECTION } from '../../tools/art/selection.mjs';

const GFX = fileURLToPath(new URL('../../src/assets/gfx', import.meta.url));
const CELL = 16;
const COLS = 4;
const ROWS = 5;
const CHILDREN = ['emilia', 'lena', 'julian'];
/** Dorfbewohner, die Kinder sind (Antwort des Auftraggebers in der Stil-Prüfung, 2026-11-14): so groß wie Emilia. */
const CHILD_NPCS = ['marie', 'liam'];
const ADULTS = NPCS.map((n) => n.id).filter((id) => !CHILD_NPCS.includes(id));
/** Erwachsene, deren Pflicht-Vorlage nicht 16 hoch ist (offener Punkt für den Auftraggeber). */
const TOO_SHORT_TEMPLATE = ['oma'];

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function readSheet(rel: string): PNG {
  return PNG.sync.read(readFileSync(join(GFX, rel)));
}

/** Belegter Bereich je Zelle (Zeile für Zeile, Spalte für Spalte); null für eine leere Zelle. */
function cellBoxes(png: PNG): (Box | null)[] {
  const boxes: (Box | null)[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let box: Box | null = null;
      for (let y = 0; y < CELL; y++) {
        for (let x = 0; x < CELL; x++) {
          if (png.data[((row * CELL + y) * png.width + col * CELL + x) * 4 + 3] === 0) continue;
          box = box
            ? { top: Math.min(box.top, y), bottom: Math.max(box.bottom, y), left: Math.min(box.left, x), right: Math.max(box.right, x) }
            : { top: y, bottom: y, left: x, right: x };
        }
      }
      boxes.push(box);
    }
  }
  return boxes;
}

/** Höhe der Figur: von der höchsten belegten Zeile über alle Zellen bis zum Zellenboden. */
function figureHeight(id: string): number {
  const boxes = cellBoxes(readSheet(FIGURES[id]!.sheet));
  return CELL - Math.min(...boxes.map((b) => b?.top ?? CELL));
}

describe('sprites.ts', () => {
  it('Bildnummer = Zeile × 4 + Spalte der Richtung', () => {
    expect(FIGURE_FRAME).toEqual({ width: 16, height: 16, columns: 4 });
    expect(FACING_COLUMN).toEqual({ down: 0, up: 1, left: 2, right: 3 });
    expect(IDLE_ROW).toBe(0);
    expect(WALK_ROWS).toEqual([1, 2, 3, 4]);
    expect(figureFrame('down', 0)).toBe(0);
    expect(figureFrame('right', 0)).toBe(3);
    expect(figureFrame('up', 1)).toBe(5);
    expect(figureFrame('left', 4)).toBe(18);
  });

  it('FIGURES hat genau Emilia, Lena, Julian und alle Dorfbewohner', () => {
    expect(CHILD_NPCS.filter((id) => !NPCS.some((n) => n.id === id))).toEqual([]);
    expect(Object.keys(FIGURES).sort()).toEqual([...CHILDREN, ...CHILD_NPCS, ...ADULTS].sort());
  });

  it('jede Blatt- und Gesichtsdatei existiert, dazu der Schatten', () => {
    const files = Object.values(FIGURES).flatMap((f) => [f.sheet, f.face]);
    expect(files.filter((f) => !existsSync(join(GFX, f)))).toEqual([]);
    expect(existsSync(join(GFX, 'figuren/schatten.png'))).toBe(true);
  });

  it('kein Blatt und kein Gesicht ist bytegleich mit einem anderen', () => {
    for (const key of ['sheet', 'face'] as const) {
      const bytes = Object.values(FIGURES).map((f) => readFileSync(join(GFX, f[key])).toString('base64'));
      expect(new Set(bytes).size, key).toBe(bytes.length);
    }
  });

  it('die Auswahlliste baut genau diese Figuren', () => {
    const ids = (SELECTION as { id: string }[]).map((f) => f.id).sort();
    expect(ids).toEqual(Object.keys(FIGURES).sort());
  });
});

describe('Figurenblätter', () => {
  for (const id of Object.keys(FIGURES)) {
    describe(id, () => {
      const def = FIGURES[id]!;

      it('Blatt 64×80, Gesicht 38×38', () => {
        const sheet = readSheet(def.sheet);
        expect([sheet.width, sheet.height]).toEqual([COLS * CELL, ROWS * CELL]);
        const face = readSheet(def.face);
        expect([face.width, face.height]).toEqual([38, 38]);
      });

      it('jede der 20 Zellen ist belegt und die Figur steht auf dem Zellenboden', () => {
        const boxes = cellBoxes(readSheet(def.sheet));
        expect(boxes.filter((b) => b === null)).toHaveLength(0);
        expect(boxes.map((b) => b?.bottom)).toEqual(Array(COLS * ROWS).fill(CELL - 1));
      });

      it(`ist ${def.height} Bildpunkte hoch`, () => {
        expect(figureHeight(id)).toBe(def.height);
      });
    });
  }

  it('Julian lässt in jeder Zelle die linke und rechte Spalte frei (14 breit)', () => {
    const boxes = cellBoxes(readSheet(FIGURES.julian!.sheet));
    expect(Math.min(...boxes.map((b) => b!.left))).toBe(1);
    expect(Math.max(...boxes.map((b) => b!.right))).toBe(CELL - 2);
  });

  it('Größen: Julian < Emilia = Lena = Marie = Liam < Erwachsene (Spec 8.2)', () => {
    expect(FIGURES.julian!.height).toBe(13);
    expect(FIGURES.emilia!.height).toBe(15);
    expect(FIGURES.lena!.height).toBe(15);
    for (const id of CHILD_NPCS) expect(FIGURES[id]!.height, id).toBe(15);
    for (const id of ADULTS.filter((a) => !TOO_SHORT_TEMPLATE.includes(a))) expect(FIGURES[id]!.height, id).toBe(16);
  });

  it('im Stehen ist Marie so hoch wie Emilia und Liam so hoch wie Lena', () => {
    const idleTop = (id: string) => Math.min(...cellBoxes(readSheet(FIGURES[id]!.sheet)).slice(0, COLS).map((b) => b!.top));
    expect(CELL - idleTop('marie')).toBe(CELL - idleTop('emilia'));
    expect(CELL - idleTop('liam')).toBe(CELL - idleTop('lena'));
  });

  it('Ausnahme: Oma (Vorlage OldWoman) ist nur so groß wie Emilia, nicht kleiner', () => {
    // OldWoman hat im Pack in keinem Bild mehr als 15 belegte Zeilen; Vergrößern ist kein erlaubter Schritt.
    expect(TOO_SHORT_TEMPLATE).toEqual(['oma']);
    expect(FIGURES.oma!.height).toBe(FIGURES.emilia!.height);
  });
});

const packDir = process.env.NINJA_PACK_DIR;

describe.skipIf(!packDir)('Zielfarben (nur mit NINJA_PACK_DIR)', () => {
  it('jede Zielfarbe aller recolor-Tabellen kommt in Palette.png des Packs vor', () => {
    const palette = PNG.sync.read(readFileSync(join(packDir!, 'Palette.png')));
    const colors = new Set<string>();
    for (let i = 0; i < palette.data.length; i += 4) {
      if (palette.data[i + 3] === 255) colors.add('#' + [0, 1, 2].map((c) => palette.data[i + c]!.toString(16).padStart(2, '0')).join(''));
    }
    type Step = unknown[] | { step: unknown[] };
    const targets = (SELECTION as { id: string; ops: Step[] }[]).flatMap((f) =>
      f.ops
        .map((s) => (Array.isArray(s) ? s : s.step))
        .filter((s) => s[0] === 'recolor')
        .flatMap((s) => Object.values(s[1] as Record<string, string>).map((to) => `${f.id} ${to.toLowerCase()}`)),
    );
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.filter((t) => !colors.has(t.split(' ')[1]!))).toEqual([]);
  });
});
