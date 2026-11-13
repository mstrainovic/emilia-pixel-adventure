import { it, expect } from 'vitest';
import { buildSaveExportFilename } from '../../src/utils/SaveExport.js';
it('baut den Dateinamen aus dem lokalen Datum', () => {
  expect(buildSaveExportFilename(new Date(2026, 10, 13))).toBe('emilia-spielstand-2026-11-13.json');
  expect(buildSaveExportFilename(new Date(2027, 0, 5))).toBe('emilia-spielstand-2027-01-05.json');
});
