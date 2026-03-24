const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');

async function waitMs(page, ms) { await page.waitForTimeout(ms); }

async function getState(page) {
  return page.evaluate(() => {
    const g = window.__game;
    if (!g?.player) return null;
    return {
      px: g.player.x, py: g.player.y, hp: g.player.hp, maxHp: g.player.maxHp,
      scene: g.sceneManager?.currentScene,
      level: g.progression?.level, xp: g.progression?.xp, totalXp: g.progression?.totalXp,
      xpToNext: g.progression?.xpToNext,
      bonusHp: g.progression?.bonusMaxHp, bonusDmg: g.progression?.bonusDamagePct, bonusSpd: g.progression?.bonusSpeedPct,
      activeQuest: g.progression?.getActiveQuest(),
      completedQuests: Object.keys(g.progression?.completedQuests || {}),
      mobCount: g.mobs?.length || 0,
      invItems: g.inventory?.slots?.filter(s => s.itemId).map(s => s.itemId + ':' + s.count) || [],
      dialogOpen: g.dialog?.isActive,
      craftingOpen: g.crafting?.isActive,
    };
  });
}

async function teleport(page, x, y) {
  await page.evaluate(([tx, ty]) => {
    const g = window.__game;
    if (g?.player) { g.player.x = tx; g.player.y = ty; }
  }, [x, y]);
  await waitMs(page, 100);
}

async function transition(page, target, sx, sy) {
  await page.evaluate(([t, x, y]) => window.__game.sceneManager.transition(t, x, y), [target, sx, sy]);
  for (let i = 0; i < 30; i++) {
    await waitMs(page, 200);
    const s = await getState(page);
    if (s && s.scene === target) return true;
  }
  return false;
}

async function pressKey(page, key, holdMs = 100) {
  await page.keyboard.down(key);
  await waitMs(page, holdMs);
  await page.keyboard.up(key);
  await waitMs(page, 50);
}

async function walkTo(page, targetX, targetY, maxTime = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxTime) {
    const s = await getState(page);
    if (!s) break;
    const dx = targetX - s.px;
    const dy = targetY - s.py;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) break;
    if (Math.abs(dx) > Math.abs(dy)) {
      await pressKey(page, dx > 0 ? 'KeyD' : 'KeyA', 150);
    } else {
      await pressKey(page, dy > 0 ? 'KeyS' : 'KeyW', 150);
    }
  }
}

async function clickDialog(page, times = 12) {
  for (let i = 0; i < times; i++) {
    await page.click('#dialog-container').catch(() => {});
    await waitMs(page, 300);
    const s = await getState(page);
    if (!s?.dialogOpen) break;
  }
  await waitMs(page, 200);
}

const findings = [];
function log(msg) { console.log('  ' + msg); findings.push(msg); }

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await waitMs(page, 2000);
  await page.click('#mm-start');
  for (let i = 0; i < 40; i++) {
    if (await page.evaluate(() => window.__game?.running === true)) break;
    await waitMs(page, 500);
  }
  await waitMs(page, 2000);

  let s = await getState(page);
  log('=== SPIEL GESTARTET ===');
  log(`Start: Level ${s.level}, HP ${s.hp}/${s.maxHp}, XP ${s.xp}/${s.xpToNext}`);
  log(`Inventar: ${s.invItems.join(', ')}`);
  log(`Aktive Quest: ${s.activeQuest?.name || 'keine'} — ${s.activeQuest?.description || ''}`);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_01_start.png' });

  // ═══════════════════════════════════════════
  // SESSION 1: HUB — NPCs, Quests, Ressourcen
  // ═══════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  SESSION 1: HUB — NPCs & Quests      ║');
  console.log('╚══════════════════════════════════════╝');

  // Quest 1: Sprich mit Mama Tanja (x:8, y:8)
  log('\n--- Quest: Erste Schritte (Sprich mit Mama Tanja) ---');
  await teleport(page, 8, 7.5);
  await waitMs(page, 500);
  await pressKey(page, 'KeyE');
  await waitMs(page, 1500);
  s = await getState(page);
  log(`Dialog offen: ${s.dialogOpen}`);
  if (s.dialogOpen) {
    const txt = await page.$eval('#dialog-text', el => el.textContent).catch(() => '');
    log(`Mama sagt: "${txt.substring(0, 50)}..."`);
    await clickDialog(page);
  } else {
    log('BUG: Dialog nicht geoeffnet bei Mama Tanja!');
  }

  s = await getState(page);
  log(`Nach Dialog — Level: ${s.level}, XP: ${s.xp}/${s.xpToNext}`);
  log(`Quest completed: ${s.completedQuests.join(', ')}`);
  log(`Naechste Quest: ${s.activeQuest?.name || 'keine'}`);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_02_after_mama.png' });

  // Sammle Ressourcen im Hub (Baeume, etc.)
  log('\n--- Ressourcen sammeln ---');
  // Walk to resource areas and press E
  const resourcePositions = [
    { x: 6, y: 22, name: 'Omas Garten Bereich' },
    { x: 15, y: 10, name: 'Hub Mitte' },
    { x: 30, y: 15, name: 'Hub Ost' },
  ];

  for (const rp of resourcePositions) {
    await teleport(page, rp.x, rp.y);
    await waitMs(page, 300);
    // Try to interact with resources nearby
    for (let i = 0; i < 5; i++) {
      await pressKey(page, 'KeyE');
      await waitMs(page, 300);
    }
    s = await getState(page);
    log(`Bei ${rp.name} (${rp.x},${rp.y}): Level ${s.level}, XP ${s.xp}, Items: ${s.invItems.length}`);
  }

  // Teste Wassermagie (F-Taste)
  log('\n--- Wassermagie (F-Taste) ---');
  await teleport(page, 10, 20);
  await waitMs(page, 300);
  for (let i = 0; i < 3; i++) {
    await pressKey(page, 'KeyF');
    await waitMs(page, 500);
  }
  s = await getState(page);
  log(`Nach Wassermagie: HP ${s.hp}, Level ${s.level}`);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_03_hub_resources.png' });

  // Talk to more NPCs
  log('\n--- Weitere NPCs ansprechen ---');
  const npcs = [
    { id: 'papa_milos', x: 30, y: 8 },
    { id: 'oma', x: 8, y: 22 },
    { id: 'baba', x: 18, y: 16 },
  ];
  for (const npc of npcs) {
    await teleport(page, npc.x, npc.y - 0.5);
    await waitMs(page, 500);
    await pressKey(page, 'KeyE');
    await waitMs(page, 1000);
    s = await getState(page);
    if (s.dialogOpen) {
      log(`${npc.id}: Dialog geoeffnet OK`);
      await clickDialog(page);
    } else {
      log(`${npc.id}: KEIN Dialog!`);
    }
  }

  s = await getState(page);
  log(`\nHub-Session Ende: Level ${s.level}, XP ${s.xp}/${s.xpToNext}, TotalXP: ${s.totalXp}`);
  log(`Inventar: ${s.invItems.join(', ')}`);

  // ═══════════════════════════════════════════
  // SESSION 2: FOREST — Kampf, Slimes, XP farmen
  // ═══════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  SESSION 2: FOREST — Kampf & Slimes   ║');
  console.log('╚══════════════════════════════════════╝');

  await transition(page, 'forest', 25, 37);
  await waitMs(page, 1000);
  s = await getState(page);
  log(`\nForest betreten: Mobs=${s.mobCount}, HP=${s.hp}`);
  log(`Aktive Quest: ${s.activeQuest?.name || 'keine'} (${s.activeQuest?.progress || 0}/${s.activeQuest?.count || '?'})`);

  // Kampf gegen Slimes
  log('\n--- Kampf gegen Slimes ---');
  const slimeSpots = [[10, 26], [38, 28], [20, 32]];
  let killCount = 0;

  for (const [sx, sy] of slimeSpots) {
    await teleport(page, sx, sy);
    await waitMs(page, 500);
    const hpBefore = (await getState(page))?.hp || 100;

    // Fight: swing sword + move around
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Space');
      await waitMs(page, 150);
      // Move in small circle to hit mob
      const dir = ['KeyD', 'KeyS', 'KeyA', 'KeyW'][i % 4];
      await pressKey(page, dir, 100);
    }
    await waitMs(page, 2000); // wait for mobs to attack back

    s = await getState(page);
    const hpAfter = s.hp;
    log(`Kampf bei (${sx},${sy}): HP ${hpBefore} -> ${hpAfter}, Level ${s.level}, XP ${s.xp}/${s.xpToNext}`);
  }

  s = await getState(page);
  log(`\nNach Kaempfen: Level ${s.level}, XP ${s.xp}, TotalXP ${s.totalXp}`);
  log(`Completed Quests: ${s.completedQuests.join(', ')}`);
  log(`Aktive Quest: ${s.activeQuest?.name || 'keine'} (${s.activeQuest?.progress || 0}/${s.activeQuest?.count || '?'})`);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_04_forest_combat.png' });

  // Ressourcen im Forest sammeln
  log('\n--- Forest Ressourcen ---');
  const forestResources = [[6, 22], [32, 25], [44, 18]];
  for (const [rx, ry] of forestResources) {
    await teleport(page, rx, ry);
    await waitMs(page, 300);
    for (let i = 0; i < 8; i++) {
      await pressKey(page, 'KeyE');
      await waitMs(page, 400);
    }
  }
  s = await getState(page);
  log(`Nach Forest-Ressourcen: Level ${s.level}, XP ${s.xp}, Items: ${s.invItems.length}`);

  // Mehr Kaempfe um Level zu pushen
  log('\n--- Mehr Kaempfe fuer Level Up ---');
  for (let round = 0; round < 3; round++) {
    for (const [sx, sy] of [[12, 8], [40, 7], [42, 9]]) {
      await teleport(page, sx, sy);
      await waitMs(page, 300);
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Space');
        await waitMs(page, 150);
        await pressKey(page, ['KeyD', 'KeyS', 'KeyA', 'KeyW'][i % 4], 80);
      }
      await waitMs(page, 1500);
    }
    s = await getState(page);
    log(`Runde ${round + 1}: Level ${s.level}, XP ${s.xp}/${s.xpToNext}, TotalXP ${s.totalXp}, HP ${s.hp}/${s.maxHp}`);
  }

  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_05_after_grinding.png' });

  // ═══════════════════════════════════════════
  // SESSION 3: LAKE + MEADOW — Pflanzen, Einhoerner
  // ═══════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  SESSION 3: LAKE & MEADOW — Heilung   ║');
  console.log('╚══════════════════════════════════════╝');

  // Heile zurueck im Hub
  await transition(page, 'hub', 20, 15);
  await waitMs(page, 1000);

  // Benutze Heilitems (Q-Taste)
  log('\n--- Heilung testen ---');
  s = await getState(page);
  log(`Vor Heilung: HP ${s.hp}/${s.maxHp}`);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('KeyQ');
    await waitMs(page, 500);
  }
  s = await getState(page);
  log(`Nach Q-Taste: HP ${s.hp}/${s.maxHp}`);

  // Lake besuchen
  await transition(page, 'lake', 21, 4);
  await waitMs(page, 1000);
  s = await getState(page);
  log(`\nLake betreten: HP ${s.hp}/${s.maxHp}`);

  // Pflanzen heilen (F-Taste) im Lake
  log('\n--- Pflanzen heilen im Lake ---');
  // Walk around and press F
  for (let y = 5; y < 30; y += 4) {
    for (let x = 5; x < 40; x += 5) {
      await teleport(page, x, y);
      await waitMs(page, 200);
      await pressKey(page, 'KeyF');
      await waitMs(page, 300);
    }
  }
  s = await getState(page);
  log(`Nach Pflanzen-Scan im Lake: Level ${s.level}, XP ${s.xp}, TotalXP ${s.totalXp}`);
  log(`Aktive Quest: ${s.activeQuest?.name || 'keine'} (${s.activeQuest?.progress || 0}/${s.activeQuest?.count || '?'})`);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_06_lake.png' });

  // Zurueck zum Hub und Pflanzen dort heilen
  await transition(page, 'hub', 10, 15);
  await waitMs(page, 1000);
  log('\n--- Pflanzen im Hub heilen ---');
  for (let y = 0; y < 32; y += 3) {
    for (let x = 0; x < 40; x += 4) {
      await teleport(page, x, y);
      await waitMs(page, 150);
      await pressKey(page, 'KeyF');
      await waitMs(page, 200);
    }
  }
  s = await getState(page);
  log(`Nach Hub-Pflanzen: Level ${s.level}, XP ${s.xp}, TotalXP ${s.totalXp}`);
  log(`Completed: ${s.completedQuests.join(', ')}`);

  // Unicorn Meadow testen
  log('\n--- Einhorn-Wiese ---');
  await transition(page, 'unicorn_meadow', 12, 10);
  await waitMs(page, 1000);
  s = await getState(page);
  log(`Meadow: Unicorns vorhanden (pruefen via Game)`);
  const unicornCount = await page.evaluate(() => window.__game?.unicorns?.length || 0);
  log(`Einhoerner: ${unicornCount}`);

  // Try to pet unicorn
  if (unicornCount > 0) {
    const ucPos = await page.evaluate(() => {
      const u = window.__game?.unicorns?.[0];
      return u ? { x: u.x, y: u.y, state: u.state } : null;
    });
    if (ucPos) {
      log(`Einhorn bei (${ucPos.x?.toFixed(1)}, ${ucPos.y?.toFixed(1)}), State: ${ucPos.state}`);
      // Walk slowly toward unicorn (no running!)
      await teleport(page, ucPos.x - 2, ucPos.y);
      await waitMs(page, 1000);
      // Walk slowly
      for (let i = 0; i < 10; i++) {
        await pressKey(page, 'KeyD', 200);
        await waitMs(page, 500);
      }
      const ucState = await page.evaluate(() => window.__game?.unicorns?.[0]?.state);
      log(`Einhorn State nach Annaeherung: ${ucState}`);
      if (ucState === 'friendly') {
        await pressKey(page, 'KeyE');
        await waitMs(page, 1000);
        s = await getState(page);
        log(`Nach Einhorn-Streicheln: HP ${s.hp}/${s.maxHp}, Level ${s.level}, XP ${s.xp}`);
      }
    }
  }
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/pt_07_meadow.png' });

  // ═══════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════
  s = await getState(page);
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         PLAYTEST FINAL REPORT             ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║ Level: ${s.level}  XP: ${s.totalXp}  HP: ${s.hp}/${s.maxHp}`.padEnd(44) + '║');
  console.log(`║ Bonus HP: +${s.bonusHp}  Dmg: +${s.bonusDmg}%  Spd: +${s.bonusSpd}%`.padEnd(44) + '║');
  console.log(`║ Quests: ${s.completedQuests.length} erledigt`.padEnd(44) + '║');
  console.log(`║ Items: ${s.invItems.length} Slots belegt`.padEnd(44) + '║');
  console.log(`║ Console Errors: ${errors.length}`.padEnd(44) + '║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║ Completed Quests:'.padEnd(44) + '║');
  for (const q of s.completedQuests) console.log(`║   - ${q}`.padEnd(44) + '║');
  if (s.activeQuest) console.log(`║ Active: ${s.activeQuest.name} (${s.activeQuest.progress}/${s.activeQuest.count})`.padEnd(44) + '║');
  console.log('╠══════════════════════════════════════════╣');
  if (errors.length > 0) {
    console.log('║ ERRORS:'.padEnd(44) + '║');
    errors.slice(0, 5).forEach(e => console.log(`║  ${e.substring(0, 40)}`.padEnd(44) + '║'));
  }
  console.log('╚══════════════════════════════════════════╝');

  console.log('\n=== FINDINGS ===');
  findings.forEach(f => console.log(f));

  await browser.close();
})();
