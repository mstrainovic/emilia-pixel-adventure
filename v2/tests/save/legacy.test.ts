import { describe, it, expect, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrateLegacySave as migrateRaw, legacyTimestamp, LEGACY_SAVE_KEY, LEGACY_MUTED_KEY } from '../../src/save/legacy';
import { QUEST_ORDER } from '../../src/data/quests';
import { isMapId } from '../../src/data/maps';
import {
  LEGACY_FIRST_COMMIT, LEGACY_V3_FULL, LEGACY_NGPLUS, LEGACY_NGPLUS_REAL, LEGACY_PARTIAL, LEGACY_LONG_INVENTORY,
} from './legacySaves';

const REAL = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/legacy/emilia-real.json');
/** Wie migrateLegacySave, aber nur das Ergebnis einer gelungenen Übernahme; sonst null. */
function migrateLegacySave(raw: string | null, muted: string | null, now: number) {
  const r = migrateRaw(raw, muted, now);
  return r.kind === 'ok' ? r : null;
}
const run = (o: unknown, muted: string | null = null) => migrateLegacySave(JSON.stringify(o), muted, 5000);
const EMPTY_SLOT = { itemId: null, count: 0 };

it('kennt die alten Speicherschlüssel', () => {
  expect(LEGACY_SAVE_KEY).toBe('emilia_pixel_adventure_save');
  expect(LEGACY_MUTED_KEY).toBe('emilia_muted');
});

it('unterscheidet fehlenden, unlesbaren und gelungenen Stand', () => {
  expect(migrateRaw(null, null, 5000)).toEqual({ kind: 'none' });
  for (const raw of ['', '{"version":3,"player":', '[]', '"x"', 'null', '42'])
    expect(migrateRaw(raw, null, 5000)).toEqual({ kind: 'unreadable' });
  expect(migrateRaw('{}', null, 5000).kind).toBe('ok');
});

it('liefert failed mit der Fehlermeldung, wenn der Umbau wirft', () => {
  const spy = vi.spyOn(QUEST_ORDER, 'filter').mockImplementation(() => { throw new Error('kaputt'); });
  try {
    expect(migrateRaw(JSON.stringify(LEGACY_V3_FULL), null, 5000)).toEqual({ kind: 'failed', message: 'kaputt' });
  } finally { spy.mockRestore(); }
});

it('übernimmt die Form des ersten Commits', () => {
  const { state, report } = run(LEGACY_FIRST_COMMIT)!;
  expect(state.player).toEqual({ map: 'forest', x: 25.5, y: 30.25, hp: 20 });
  expect(state.inventory.slots).toHaveLength(48);
  expect(state.inventory.slots[0]).toEqual({ itemId: 'sword_wood', count: 1 });
  expect(state.inventory.slots[1]).toEqual({ itemId: 'wood', count: 7 });
  expect(state.inventory.coins).toBe(0);
  expect(state.progression.level).toBe(3); expect(state.progression.xp).toBe(50);
  expect(state.progression.completedQuests).toEqual(['first_steps', 'wood_collector']);
  expect(state.progression.activeQuests).toEqual({ nature_healer: { progress: 1 } });
  expect(state.visitedMaps.sort()).toEqual(['forest', 'hub']);
  expect(state.progression.stats.npcsSpoken).toEqual(['mama_tanja']);
  expect(state.pet).toBeNull(); expect(state.garden).toEqual([]);
  expect(state.importedLegacyAt).toBe(1711300000000); expect(state.savedAt).toBe(5000);
  expect(report).toEqual({ droppedItems: [], replacedItems: {}, reconstructedQuests: [], warnings: [], cutItems: [] });
});

it('bereinigt einen vollen Stand der Version 3', () => {
  const { state, report } = run(LEGACY_V3_FULL, 'true')!;
  expect(state.progression.level).toBe(30); expect(state.progression.xp).toBe(0);
  expect(state.player.hp).toBe(40);
  expect(state.inventory.slots).toHaveLength(48);
  expect(state.inventory.slots[1]).toEqual({ itemId: 'goldfish', count: 3 });
  expect(state.inventory.slots[2]).toEqual({ itemId: null, count: 0 });
  expect(state.inventory.slots[3]).toEqual({ itemId: null, count: 0 });
  expect(state.inventory.slots[4]).toEqual({ itemId: 'wood', count: 99 });
  expect(report.replacedItems).toEqual({ fish_generic: 'goldfish' });
  expect(report.droppedItems).toEqual(['magic_bean']);
  expect(report.cutItems).toEqual([{ itemId: 'wood', count: 401 }]);
  expect(state.inventory.coins).toBe(37);
  expect(state.progression.completedQuests).toEqual(['first_steps']);
  expect(state.visitedMaps.sort()).toEqual(['beach', 'hub', 'lake']);
  expect(state.progression.stats.grottoZones).toEqual([]);
  expect(state.progression.stats.plantsHealed).toBe(10);
  expect(state.progression.stats.fishCaught).toEqual({ goldfish: 3 });
  expect(state.progression.stats.uniqueCollected).toEqual({ shell: ['pearl', 'shell_common'] });
  expect(state.progression.stats.distanceWalked).toBe(1234.5);
  expect(state.friendship.oma!.points).toBe(100);
  expect(state.explorerBook).toEqual({ discovered: ['goldfish'], rewardsClaimed: [] });
  expect(state.achievements).toEqual(['a', 'b']);
  expect(state.bossesDefeated).toEqual(['coconut_king']);
  expect(state.progression.stats.bossesKilled).toEqual({ coconut_king: 1 });
  expect(state.pet).toEqual({ type: 'fox', friendship: 12, evolved: false });
  expect(state.seenHints).toEqual(['move', 'talk']);
  expect(state.settings).toEqual({ muted: true, difficulty: 'sanft' });
});

it('baut erledigte Aufgaben nach New Game Plus wieder auf', () => {
  const { state, report } = run(LEGACY_NGPLUS)!;
  const upToBoss = QUEST_ORDER.slice(0, QUEST_ORDER.indexOf('shadow_slayer') + 1);
  expect(state.progression.completedQuests).toEqual([...upToBoss, 'star_collector']);
  expect(report.reconstructedQuests).toHaveLength(23);
});

it('übernimmt die echte Form nach New Game Plus (completedQuests leer, Belege in activeQuests)', () => {
  const { state } = run(LEGACY_NGPLUS_REAL)!;
  const upToBoss = QUEST_ORDER.slice(0, QUEST_ORDER.indexOf('shadow_slayer') + 1);
  expect(state.progression.completedQuests).toEqual(upToBoss);
  // 14 Erfolge reichen für star_collector noch nicht: die Aufgabe bleibt aktiv mit ihrem Stand
  expect(state.progression.activeQuests).toEqual({ star_collector: { progress: 14 } });
  expect(state.bossesDefeated).toEqual(['coconut_king', 'leviathan', 'shadow_knight']);
  expect(state.player).toMatchObject({ map: 'cloud_castle', x: 25.5, y: 11.75 });
  expect(state.progression.level).toBe(24);
  expect(state.inventory.slots[1]).toEqual({ itemId: 'berry', count: 12 });
});

it('meldet ungültige Stückzahlen bekannter Gegenstände, ohne den übernommenen Stand zu ändern', () => {
  const { state, report } = run({ inventory: [{ itemId: 'wood', count: -3 }, { itemId: 'stone', count: 2 }] })!;
  expect(state.inventory.slots[0]).toEqual(EMPTY_SLOT);
  expect(state.inventory.slots[1]).toEqual({ itemId: 'stone', count: 2 });
  expect(report.cutItems).toEqual([{ itemId: 'wood', count: 0 }]);
});

it('füllt einen lückenhaften Stand mit sicheren Vorgaben', () => {
  const { state } = run(LEGACY_PARTIAL)!;
  expect(state.player).toEqual({ map: 'hub', x: 19.5, y: 14.5, hp: 20 });
  expect(state.progression.level).toBe(1);
  expect(state.inventory.slots).toHaveLength(48);
});

it('verändert die Eingabe nicht und ist wiederholbar', () => {
  const raw = JSON.stringify(LEGACY_V3_FULL);
  const before = raw.slice();
  expect(migrateLegacySave(raw, null, 1)).toEqual(migrateLegacySave(raw, null, 1));
  expect(raw).toBe(before);
});

it('liest nur den Zeitstempel des alten Standes', () => {
  expect(legacyTimestamp(JSON.stringify(LEGACY_FIRST_COMMIT))).toBe(1711300000000);
  for (const raw of [null, '', 'x', '[]', '{}', '{"timestamp":"5"}']) expect(legacyTimestamp(raw)).toBeNull();
});

it('meldet gekürzte Inventare und prüft genau die ersten 48 Plätze', () => {
  const { state, report } = run(LEGACY_LONG_INVENTORY)!;
  expect(state.inventory.slots).toHaveLength(48);
  expect(report.warnings).toContain('Inventar gekürzt');
  expect(state.inventory.slots.every((s) => s.itemId === null)).toBe(true); // Platz 60 fällt weg
});

it('baut nur bei aktivem New Game Plus auf und meldet nur Neues', () => {
  const o = { ...LEGACY_NGPLUS, progression: { ...LEGACY_NGPLUS.progression,
    completedQuests: { first_steps: true }, activeQuests: { wood_collector: { progress: 2 } } } };
  const { state, report } = run(o)!;
  expect(report.reconstructedQuests).not.toContain('first_steps');
  expect(report.reconstructedQuests).toHaveLength(22);
  expect(state.progression.activeQuests).toEqual({});
  const off = run({ ...o, newGamePlus: { active: 'true' } })!;
  expect(off.state.progression.completedQuests).toEqual(['first_steps']);
});

it('wertet nach New Game Plus abgeschlossene Einträge in activeQuests als erledigt', () => {
  // Alt-Quelle: Progression.js, _completeQuest setzt completed: true und lässt den Eintrag stehen;
  // resetQuests leert bei New Game Plus nur completedQuests.
  const o = { ...LEGACY_NGPLUS, progression: { ...LEGACY_NGPLUS.progression,
    completedQuests: {}, activeQuests: { crab_problem: { progress: 5, completed: true } } } };
  const { state } = run(o)!;
  expect(state.progression.completedQuests).toContain('crab_problem');
  expect(state.progression.activeQuests).not.toHaveProperty('crab_problem');
  const off = run({ ...o, newGamePlus: { active: false } })!;
  expect(off.state.progression.completedQuests).toEqual(['crab_problem']);
  expect(off.state.progression.activeQuests).toEqual({});
});

describe('Spielstand in unerwarteter Form', () => {
  const inputs = [
    '{}',
    '{"player":null,"inventory":null,"progression":null}',
    '{"inventory":"x","progression":[],"friendship":[],"garden":{},"pet":"cat","achievements":{},"bossStates":[],"explorerBook":7}',
    '{"inventory":[null,5,"a",{"itemId":5,"count":1},{"itemId":"wood"},{"itemId":"wood","count":-3},{"itemId":"wood","count":"7"},{"itemId":"wood","count":2.9}]}',
    '{"progression":{"level":"7","xp":null,"completedQuests":["first_steps"],"activeQuests":null,"stats":"x"}}',
    '{"player":{"scene":"hub","x":"12","y":null,"hp":-5}}',
    JSON.stringify(LEGACY_LONG_INVENTORY),
  ];

  it.each(inputs.map((raw, i) => [i, raw] as const))('wirft nicht und bleibt gültig (Fall %i)', (_i, raw) => {
    const result = migrateLegacySave(raw, null, 5000);
    expect(result).not.toBeNull();
    const { state } = result!;
    expect(state.inventory.slots).toHaveLength(48);
    expect(state.progression.level).toBeGreaterThanOrEqual(1);
    expect(state.progression.level).toBeLessThanOrEqual(30);
    expect(isMapId(state.player.map)).toBe(true);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it('liest Plätze genau: Zahl als Text zählt nicht, 2,9 wird zu 2', () => {
    const { state } = migrateLegacySave(inputs[3]!, null, 5000)!;
    state.inventory.slots.forEach((slot, i) => {
      expect(slot).toEqual(i === 7 ? { itemId: 'wood', count: 2 } : EMPTY_SLOT);
    });
  });

  it('kürzt 60 Plätze auf 48 und warnt', () => {
    const { state, report } = migrateLegacySave(inputs[6]!, null, 5000)!;
    expect(state.inventory.slots).toHaveLength(48);
    expect(report.warnings).toContain('Inventar gekürzt');
  });

  it('nimmt erledigte Aufgaben als Liste nicht an', () => {
    // Das alte Format ist eine Zuordnung (Objekt); eine Liste ist kein alter Stand,
    // sondern Unfug – im Zweifel lieber nichts als Falsches erledigen.
    const { state } = migrateLegacySave(inputs[4]!, null, 5000)!;
    expect(state.progression.completedQuests).toEqual([]);
    expect(state.progression.level).toBe(1);
  });

  it('übersteht Schlüssel wie __proto__', () => {
    const raw = '{"progression":{"stats":{"mobsKilled":{"__proto__":{"x":1},"a":2}}},"friendship":{"__proto__":{"points":5}}}';
    const { state } = migrateLegacySave(raw, null, 5000)!;
    expect(Object.keys(state.progression.stats.mobsKilled)).toEqual(['a']);
    expect(Object.keys(state.friendship)).toEqual([]);
    expect(({} as Record<string, unknown>)['x']).toBeUndefined();
  });
});

it.runIf(existsSync(REAL))('übernimmt Emilias echten Stand', () => {
  const result = migrateLegacySave(readFileSync(REAL, 'utf8'), null, 5000);
  expect(result).not.toBeNull();
  expect(result!.state.inventory.slots).toHaveLength(48);
});

describe('Boss-Siege und erledigte Aufgaben', () => {
  it('behält nach New Game Plus alle Boss-Siege', () => {
    const { state } = run(LEGACY_NGPLUS)!;
    expect(state.bossesDefeated).toEqual(['coconut_king', 'leviathan', 'shadow_knight']);
  });

  it('nimmt nach New Game Plus ohne Belege den Schattenritter an', () => {
    const o = { ...LEGACY_NGPLUS, progression: { ...LEGACY_NGPLUS.progression, stats: { scenesVisited: { hub: true } } } };
    expect(run(o)!.state.bossesDefeated).toEqual(['shadow_knight']);
  });

  it('filtert nur die Siegesliste auf bekannte Bosse, nicht die Zähler', () => {
    const { state } = run({ bossStates: { made_up_boss: { defeated: true } },
      progression: { stats: { bossesKilled: { made_up_boss: true, leviathan: 2 } } } })!;
    expect(state.bossesDefeated).toEqual(['leviathan']);
    expect(state.progression.stats.bossesKilled).toEqual({ made_up_boss: 1, leviathan: 2 });
  });

  it('liest bossesKilled auch von der obersten Ebene der Fortschritte (Maximum)', () => {
    const { state } = run({ progression: { bossesKilled: { leviathan: true, coconut_king: 3 },
      stats: { bossesKilled: { coconut_king: true } } } })!;
    expect(state.progression.stats.bossesKilled).toEqual({ coconut_king: 3, leviathan: 1 });
  });

  it('zählt abgeschlossene Einträge unter activeQuests als erledigt', () => {
    const { state, report } = run({ progression: { completedQuests: {}, activeQuests: {
      first_steps: { progress: 1, completed: true }, wood_collector: { progress: 2, completed: false } } } })!;
    expect(state.progression.completedQuests).toEqual(['first_steps']);
    expect(state.progression.activeQuests).toEqual({ wood_collector: { progress: 2 } });
    expect(report.reconstructedQuests).toEqual([]);
  });

  it('nimmt Fänge und Einzelstücke notfalls aus stats', () => {
    const { state } = run({ progression: { stats: { fishCaught: { goldfish: 2 }, uniqueCollected: { shell: ['pearl'] } } } })!;
    expect(state.progression.stats.fishCaught).toEqual({ goldfish: 2 });
    expect(state.progression.stats.uniqueCollected).toEqual({ shell: ['pearl'] });
  });
});
