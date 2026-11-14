// Schreibt tests/save/format-fingerprint.json für die aktuelle GAME_STATE_VERSION neu.
// Nur ausführen, wenn sich ausschließlich ein neues Feld mit sicherer Vorgabe geändert hat
// (Regel: siehe src/save/migrations.ts). Sonst Version erhöhen und Migration ergänzen.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const file = fileURLToPath(new URL('../tests/save/format-fingerprint.json', import.meta.url));

/**
 * Alle Schlüsselpfade eines Objekts, verschachtelt mit Punkt (z. B. `progression.stats.npcsSpoken`); Listen werden
 * nicht betreten (`inventory.slots` ist ein Pfad). Dieselbe Regel prüft tests/save/migrations.test.ts.
 */
function keyPaths(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([k, v]) => [prefix + k, ...keyPaths(v, `${prefix}${k}.`)]);
}

const root = fileURLToPath(new URL('..', import.meta.url));

// Vite lädt die TypeScript-Quellen samt Importen ohne Dateiendung.
const server = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const load = (path) => server.ssrLoadModule(path);
  const { GAME_STATE_VERSION, createNewGameState } = await load('/src/core/state.ts');
  const { MAP_IDS } = await load('/src/data/maps.ts');
  const { ITEMS } = await load('/src/data/items.ts');
  const { QUESTS } = await load('/src/data/quests.ts');

  let all = {};
  try {
    all = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    // Datei fehlt oder ist leer: neu beginnen.
  }
  all[String(GAME_STATE_VERSION)] = {
    maps: [...MAP_IDS],
    items: Object.keys(ITEMS).sort(),
    quests: Object.keys(QUESTS).sort(),
    stateKeys: keyPaths(createNewGameState(0)).sort(),
  };
  writeFileSync(file, `${JSON.stringify(all, null, 2)}\n`, 'utf8');
  console.log(`Fingerabdruck für Version ${GAME_STATE_VERSION} geschrieben: ${file}`);
} finally {
  await server.close();
}
