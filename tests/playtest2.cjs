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
      bonusHp: g.progression?.bonusMaxHp, bonusDmg: g.progression?.bonusDamagePct,
      activeQuest: g.progression?.getActiveQuest(),
      completedQuests: Object.keys(g.progression?.completedQuests || {}),
      plantsHealed: g.progression?.stats?.plantsHealed || 0,
      invItems: g.inventory?.slots?.filter(s => s.itemId).map(s => s.itemId + ':' + s.count) || [],
    };
  });
}
async function teleport(page, x, y) {
  await page.evaluate(([tx, ty]) => { const g = window.__game; if (g?.player) { g.player.x = tx; g.player.y = ty; } }, [x, y]);
  await waitMs(page, 80);
}
async function trans(page, target, sx, sy) {
  await page.evaluate(([t, x, y]) => window.__game.sceneManager.transition(t, x, y), [target, sx, sy]);
  for (let i = 0; i < 20; i++) { await waitMs(page, 250); const s = await getState(page); if (s?.scene === target) return true; }
  return false;
}
async function pressE(page) { await page.keyboard.down('KeyE'); await waitMs(page, 120); await page.keyboard.up('KeyE'); await waitMs(page, 50); }
async function attack(page, times = 10) {
  for (let i = 0; i < times; i++) {
    // Inject justPressed directly — Playwright synthetic events don't survive rAF timing
    await page.evaluate(() => {
      window.__game.input._justPressed['Space'] = true;
      window.__game.input._consumed['Space'] = false;
    });
    await waitMs(page, 200);
    const d = ['KeyD','KeyA','KeyS','KeyW'][i%4];
    await page.keyboard.down(d); await waitMs(page, 80); await page.keyboard.up(d);
  }
}
async function closeDialog(page) {
  for (let i = 0; i < 20; i++) { await page.click('#dialog-container').catch(()=>{}); await waitMs(page, 250); const s = await getState(page); if (!s?.dialogOpen) return; }
}

const bugs = [];
function bug(msg) { console.log('  BUG: ' + msg); bugs.push(msg); }
function ok(msg) { console.log('  OK: ' + msg); }
function info(msg) { console.log('  ' + msg); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
  await waitMs(page, 2000);
  await page.click('#mm-start');
  for (let i = 0; i < 30; i++) { if (await page.evaluate(() => window.__game?.running)) break; await waitMs(page, 400); }
  await waitMs(page, 1500);

  let s = await getState(page);
  info(`START: Level ${s.level}, HP ${s.hp}/${s.maxHp}, Quest: ${s.activeQuest?.name}`);

  // ═══ TEST 1: QUEST SYSTEM ═══
  console.log('\n=== TEST 1: QUEST SYSTEM ===');

  // Quest 1: Talk to Mama
  await teleport(page, 8, 7.5);
  await waitMs(page, 400);
  await pressE(page);
  await waitMs(page, 800);
  s = await getState(page);
  if (s.dialogOpen) { ok('Mama Dialog oeffnet'); await closeDialog(page); } else bug('Mama Dialog oeffnet NICHT');

  s = await getState(page);
  if (s.completedQuests.includes('first_steps')) ok('Quest "first_steps" abgeschlossen, +20 XP');
  else bug('Quest "first_steps" nicht als completed markiert');
  info(`Level ${s.level}, XP ${s.xp}/${s.xpToNext}`);

  // Check if Level 2 quest unlocked after getting enough XP
  if (s.activeQuest) ok(`Naechste Quest: ${s.activeQuest.name}`);
  else info('Keine naechste Quest (braucht Level 2 fuer wood_collector)');

  // ═══ TEST 2: XP GAINING + LEVEL UP ═══
  console.log('\n=== TEST 2: XP + LEVEL UP ===');

  // Go to forest and kill slimes for XP
  await trans(page, 'forest', 25, 37);
  await waitMs(page, 800);
  s = await getState(page);
  info(`Forest: ${s.mobCount || '?'} Mobs, HP ${s.hp}`);

  // Fight at each slime spawn
  // Position 1.5 tiles ABOVE mob spawns (attack hits downward, range 1.5)
  for (const [sx, sy, name] of [[10,24.5,'Slime Sued 1'],[38,26.5,'Slime Sued 2'],[20,30.5,'Slime Sued 3']]) {
    await teleport(page, sx, sy);
    await waitMs(page, 300);
    const before = await getState(page);
    await attack(page, 15);
    await waitMs(page, 2000);
    const after = await getState(page);
    const xpGained = after.totalXp - before.totalXp;
    const hpLost = before.hp - after.hp;
    info(`${name}: XP +${xpGained}, HP -${hpLost}, jetzt Level ${after.level} (${after.xp}/${after.xpToNext})`);
    if (xpGained > 0) ok(`XP bei Mob-Kill funktioniert`);
    else bug(`Kein XP bei ${name} erhalten (Level ${after.level})`);
  }

  // Check level progression
  s = await getState(page);
  if (s.level >= 2) ok(`Level Up auf ${s.level} funktioniert!`);
  else info(`Noch Level ${s.level} (${s.xp}/${s.xpToNext} XP)`);

  // More fighting at harder mobs
  for (const [sx, sy] of [[12,6.5],[40,5.5],[42,7.5]]) {
    await teleport(page, sx, sy); await waitMs(page, 300);
    await attack(page, 15); await waitMs(page, 1500);
  }
  s = await getState(page);
  info(`Nach allen Kaempfen: Level ${s.level}, TotalXP ${s.totalXp}, HP ${s.hp}/${s.maxHp}`);
  info(`Completed: ${s.completedQuests.join(', ')}`);

  // ═══ TEST 3: RESOURCE XP ═══
  console.log('\n=== TEST 3: RESOURCE GATHERING XP ===');
  const beforeRes = await getState(page);
  // Try to gather at forest resource spots
  for (const [rx, ry] of [[6,22],[32,25],[44,18],[14,10]]) {
    await teleport(page, rx, ry); await waitMs(page, 200);
    for (let i = 0; i < 6; i++) { await pressE(page); await waitMs(page, 250); }
  }
  const afterRes = await getState(page);
  const resXp = afterRes.totalXp - beforeRes.totalXp;
  if (resXp > 0) ok(`Ressourcen-XP: +${resXp}`);
  else info(`Keine Ressourcen-XP (evtl. keine Nodes in Reichweite)`);
  info(`Items: ${afterRes.invItems.join(', ')}`);

  // ═══ TEST 4: PLANT HEALING ═══
  console.log('\n=== TEST 4: PFLANZEN HEILEN ===');
  await trans(page, 'hub', 10, 15);
  await waitMs(page, 800);
  const beforePlant = await getState(page);
  // Walk around hub pressing F to heal plants
  for (let y = 5; y < 30; y += 3) {
    for (let x = 3; x < 38; x += 5) {
      await teleport(page, x, y); await waitMs(page, 80);
      await page.keyboard.down('KeyF'); await waitMs(page, 100); await page.keyboard.up('KeyF');
      await waitMs(page, 80);
    }
  }
  const afterPlant = await getState(page);
  const plantXp = afterPlant.totalXp - beforePlant.totalXp;
  const plantsHealed = afterPlant.plantsHealed - beforePlant.plantsHealed;
  if (plantsHealed > 0) ok(`${plantsHealed} Pflanzen geheilt, +${plantXp} XP`);
  else info(`Keine Pflanzen zum Heilen gefunden`);

  // ═══ TEST 5: STAT SCALING ═══
  console.log('\n=== TEST 5: STAT SCALING ===');
  s = await getState(page);
  info(`Level ${s.level}: MaxHP ${s.maxHp} (Bonus +${s.bonusHp}), Dmg +${s.bonusDmg}%`);
  if (s.level >= 2 && s.maxHp > 100) ok('HP-Bonus wird angewendet');
  else if (s.level >= 2) bug('Level 2+ aber MaxHP immer noch 100');

  // ═══ TEST 6: QUEST TRACKING ═══
  console.log('\n=== TEST 6: QUEST PROGRESS ===');
  s = await getState(page);
  info(`Quests completed: ${s.completedQuests.join(', ') || 'keine'}`);
  if (s.activeQuest) info(`Active Quest: ${s.activeQuest.name} (${s.activeQuest.progress}/${s.activeQuest.count})`);
  else info('Keine aktive Quest');

  // Try more fighting to reach level 4
  console.log('\n=== GRIND TO LEVEL 4 ===');
  for (let grind = 0; grind < 5 && (await getState(page)).level < 4; grind++) {
    await trans(page, 'forest', 25, 20);
    await waitMs(page, 600);
    for (const [sx, sy] of [[10,24.5],[38,26.5],[20,30.5],[12,6.5],[40,5.5]]) {
      await teleport(page, sx, sy); await waitMs(page, 200);
      await attack(page, 12); await waitMs(page, 1200);
    }
    s = await getState(page);
    info(`Grind ${grind+1}: Level ${s.level}, XP ${s.xp}/${s.xpToNext}, TotalXP ${s.totalXp}`);
  }

  // ═══ FINAL REPORT ═══
  s = await getState(page);
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         PLAYTEST FINAL REPORT             ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`  Level: ${s.level}  TotalXP: ${s.totalXp}  HP: ${s.hp}/${s.maxHp}`);
  console.log(`  Bonuses: HP+${s.bonusHp} Dmg+${s.bonusDmg}%`);
  console.log(`  Quests done: ${s.completedQuests.join(', ')}`);
  console.log(`  Active Quest: ${s.activeQuest?.name || 'keine'} (${s.activeQuest?.progress || 0}/${s.activeQuest?.count || '?'})`);
  console.log(`  Inventory: ${s.invItems.join(', ')}`);
  console.log(`  Console Errors: ${errors.length}`);
  if (errors.length) errors.slice(0,5).forEach(e => console.log(`  ERR: ${e.substring(0,80)}`));
  console.log('╠══════════════════════════════════════════╣');
  console.log(`  BUGS FOUND: ${bugs.length}`);
  bugs.forEach(b => console.log(`  - ${b}`));
  console.log('╚══════════════════════════════════════════╝');

  await browser.close();
})();
