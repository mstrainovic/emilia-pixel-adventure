import { describe, it, expect } from 'vitest';
import { runMigrations, MIGRATIONS } from '../../src/save/migrations';
import { GAME_STATE_VERSION, createNewGameState } from '../../src/core/state';
import { MAP_IDS } from '../../src/data/maps';
import { ITEMS } from '../../src/data/items';
import { QUESTS } from '../../src/data/quests';
import fingerprints from './format-fingerprint.json';

describe('runMigrations', () => {
  it('gleiche Version: unverändert', () => {
    const raw = { formatVersion: 1 };
    const r = runMigrations(raw, {}, 1);
    expect(r).toEqual({ kind: 'ok', raw });
  });

  it('wendet die Kette an', () => {
    const chain = { 1: (r: Record<string, unknown>) => ({ ...r, formatVersion: 2, neu: true }) };
    const r = runMigrations({ formatVersion: 1 }, chain, 2);
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect((r.raw as Record<string, unknown>)['neu']).toBe(true);
      expect((r.raw as Record<string, unknown>)['formatVersion']).toBe(2);
    }
  });

  it('neuerer Stand', () => {
    expect(runMigrations({ formatVersion: 3 }, {}, 1)).toEqual({ kind: 'newer', storedVersion: 3 });
  });

  it('ungültige Version, fehlender oder werfender Schritt', () => {
    for (const bad of [null, 'x', [], {}, { formatVersion: '1' }, { formatVersion: 1.5 }, { formatVersion: 0 }, { formatVersion: -1 }]) {
      expect(runMigrations(bad, {}, 1)).toEqual({ kind: 'invalid' });
    }
    expect(runMigrations({ formatVersion: 1 }, {}, 2)).toEqual({ kind: 'invalid' });
    const throwing = { 1: () => { throw new Error('kaputt'); } };
    expect(runMigrations({ formatVersion: 1 }, throwing, 2)).toEqual({ kind: 'invalid' });
  });

  it('ein Schritt, der die Version nicht erhöht, ist ungültig', () => {
    const stuck = { 1: (r: Record<string, unknown>) => ({ ...r }) };
    expect(runMigrations({ formatVersion: 1 }, stuck, 2)).toEqual({ kind: 'invalid' });
  });

  it('die echte Kette ist für die aktuelle Version vollständig', () => {
    for (let v = 1; v < GAME_STATE_VERSION; v++) expect(MIGRATIONS[v]).toBeTypeOf('function');
  });
});

describe('Fingerabdruck des Spielstand-Formats', () => {
  it('passt zur aktuellen Version', () => {
    const current = {
      maps: [...MAP_IDS],
      items: Object.keys(ITEMS).sort(),
      quests: Object.keys(QUESTS).sort(),
      stateKeys: Object.keys(createNewGameState(0)).sort(),
    };
    const stored = (fingerprints as Record<string, unknown>)[String(GAME_STATE_VERSION)];
    expect(
      current,
      'Kennungen oder Felder des Spielstands haben sich geändert. Regel in src/save/migrations.ts lesen: '
      + 'Version erhöhen und Migration ergänzen, oder (nur neues Feld mit Vorgabe) `npm run save:fingerprint` ausführen.',
    ).toEqual(stored);
  });
});
