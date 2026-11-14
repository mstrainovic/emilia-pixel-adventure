import type { Facing } from './types';

/**
 * Figurenblätter unter src/assets/gfx/figuren/ (erzeugt von tools/art/build.mjs aus „Ninja Adventure").
 * Jedes Blatt ist 64×80: Spalte = Richtung, Zeile 0 = stehen, Zeilen 1–4 = gehen. Jede Figur steht unten
 * mittig in ihrer 16×16-Zelle; darunter gehört einmal gfx/figuren/schatten.png.
 */
export const FIGURE_FRAME = { width: 16, height: 16, columns: 4 } as const;

export const FACING_COLUMN: Record<Facing, number> = { down: 0, up: 1, left: 2, right: 3 };

export const IDLE_ROW = 0;
export const WALK_ROWS = [1, 2, 3, 4] as const;

/** Pfade relativ zu src/assets/gfx; height = Höhe der Figur in Bildpunkten (höchste Pose). */
export interface FigureDef {
  sheet: string;
  face: string;
  height: 13 | 15 | 16;
}

function figure(id: string, height: FigureDef['height']): FigureDef {
  return { sheet: `figuren/${id}.png`, face: `figuren/${id}-gesicht.png`, height };
}

/** Kinder sind kleiner als Erwachsene: Julian < Emilia = Lena = Marie = Liam < erwachsene Dorfbewohner (Spec 8.2). */
export const FIGURES: Record<string, FigureDef> = {
  emilia: figure('emilia', 15),
  lena: figure('lena', 15),
  julian: figure('julian', 13),
  mama_tanja: figure('mama_tanja', 16),
  papa_milos: figure('papa_milos', 16),
  // Marie und Liam sind Kinder (Antwort des Auftraggebers, Stil-Prüfung 2026-11-14): so groß wie Emilia und Lena.
  marie: figure('marie', 15),
  liam: figure('liam', 15),
  // OldWoman ist im Pack in keinem Bild höher als 15 und hat nur zwei Laufbilder (offener Punkt, siehe Bericht Task 8).
  oma: figure('oma', 15),
  opa: figure('opa', 16),
  baba: figure('baba', 16),
  deda: figure('deda', 16),
  ferdinand: figure('ferdinand', 16),
};

export const FIGURE_SHADOW = 'figuren/schatten.png';

/** Bildnummer im Blatt (Zeile × 4 + Spalte der Richtung). */
export function figureFrame(facing: Facing, row: number): number {
  return row * FIGURE_FRAME.columns + FACING_COLUMN[facing];
}
