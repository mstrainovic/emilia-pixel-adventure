// Exportiert die neun Karten des alten Spiels als Tiled-JSON nach src/assets/maps/.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { convertLegacyMap, seededRandom } from './legacy-maps/convert.mjs';

const dir = (rel) => new URL(rel, import.meta.url);
const SOURCES = {
  hub: ['hub.js', 'generateHubMap'],
  forest: ['forest.js', 'generateForestMap'],
  dungeon: ['dungeon.js', 'generateDungeonMap'],
  lake: ['lake.js', 'generateLakeMap'],
  unicorn_meadow: ['unicorn_meadow.js', 'generateUnicornMeadowMap'],
  beach: ['beach.js', 'generateBeachMap'],
  grotto: ['grotto.js', 'generateGrottoMap'],
  cloud_castle: ['cloud_castle.js', 'generateCloudCastleMap'],
  starsky: ['starsky.js', 'generateStarskyMap'],
};

const outDir = dir('../src/assets/maps/');
mkdirSync(fileURLToPath(outDir), { recursive: true });

for (const [id, [file, fn]] of Object.entries(SOURCES)) {
  const mod = await import(dir(`../../src/world/maps/${file}`).href);
  const original = Math.random;
  let legacy;
  try {
    Math.random = seededRandom(20261113);
    legacy = mod[fn]();
  } finally {
    Math.random = original;
  }
  const json = JSON.stringify(convertLegacyMap(id, legacy)) + '\n';
  writeFileSync(new URL(`${id}.json`, outDir), json, { encoding: 'utf8' });
  console.log(`${id}: ${legacy.width}x${legacy.height}`);
}
