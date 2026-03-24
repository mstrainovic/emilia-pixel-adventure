/**
 * Real Playtest — plays the game like a human child would.
 * No teleportation! Only WASD movement, E to interact, Space to attack, F for water magic.
 * Goal: Reach Level 4, complete quests, explore all areas.
 */
const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');

async function w(p, ms) { await p.waitForTimeout(ms); }

async function gs(p) {
  return p.evaluate(() => {
    const g = window.__game; if (!g?.player) return null;
    return {
      px: Math.round(g.player.x*10)/10, py: Math.round(g.player.y*10)/10,
      hp: g.player.hp, maxHp: g.player.maxHp, scene: g.sceneManager?.currentScene,
      level: g.progression?.level, xp: g.progression?.xp, totalXp: g.progression?.totalXp,
      xpToNext: g.progression?.xpToNext, bonusHp: g.progression?.bonusMaxHp,
      quest: g.progression?.getActiveQuest(),
      done: Object.keys(g.progression?.completedQuests || {}),
      plants: g.progression?.stats?.plantsHealed || 0,
      items: g.inventory?.slots?.filter(s => s.itemId).map(s => s.itemId + ':' + s.count) || [],
      dir: g.player.direction,
    };
  });
}

// Walk toward a target using WASD (like a real player).
// If stuck on collision, try sideways movement to get around obstacles.
async function walkToward(p, tx, ty, seconds = 3) {
  const end = Date.now() + seconds * 1000;
  let lastPx = -999, lastPy = -999, stuckCount = 0;
  while (Date.now() < end) {
    const s = await gs(p);
    if (!s) break;
    const dx = tx - s.px, dy = ty - s.py;
    if (Math.abs(dx) < 1.0 && Math.abs(dy) < 1.0) break;

    // Check if stuck (same position as last check)
    if (Math.abs(s.px - lastPx) < 0.1 && Math.abs(s.py - lastPy) < 0.1) {
      stuckCount++;
      if (stuckCount > 3) {
        // Try perpendicular movement to get around obstacle
        const sideKey = Math.random() > 0.5 ? (dx > 0 ? 'KeyS' : 'KeyW') : (dy > 0 ? 'KeyD' : 'KeyA');
        await p.keyboard.down(sideKey); await w(p, 300); await p.keyboard.up(sideKey);
        stuckCount = 0;
        continue;
      }
    } else {
      stuckCount = 0;
    }
    lastPx = s.px; lastPy = s.py;

    // Hold key for longer for smoother movement
    const holdMs = 200;
    if (Math.abs(dx) > Math.abs(dy)) {
      const key = dx > 0 ? 'KeyD' : 'KeyA';
      await p.keyboard.down(key); await w(p, holdMs); await p.keyboard.up(key);
    } else {
      const key = dy > 0 ? 'KeyS' : 'KeyW';
      await p.keyboard.down(key); await w(p, holdMs); await p.keyboard.up(key);
    }
    await w(p, 20);
  }
}

// Press E to interact (with proper down/up timing)
async function interact(p) {
  await p.keyboard.down('KeyE'); await w(p, 100); await p.keyboard.up('KeyE'); await w(p, 200);
}

// Attack (Space with proper timing for justPressed)
async function swing(p) {
  await p.keyboard.down('Space'); await w(p, 80); await p.keyboard.up('Space'); await w(p, 350);
}

// Close any open dialog
async function closeAllDialog(p) {
  for (let i = 0; i < 20; i++) {
    const open = await p.evaluate(() => window.__game?.dialog?.isActive);
    if (!open) break;
    await p.click('#dialog-container').catch(() => {});
    await w(p, 350);
  }
}

// Use F key for water magic / plant healing
async function healPlant(p) {
  await p.keyboard.down('KeyF'); await w(p, 100); await p.keyboard.up('KeyF'); await w(p, 200);
}

function log(msg) { console.log('  ' + msg); }
const issues = [];
function issue(msg) { console.log('  !! ' + msg); issues.push(msg); }

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 20 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await w(page, 2000);

  // Start game
  await page.click('#mm-start');
  for (let i = 0; i < 30; i++) { if (await page.evaluate(() => window.__game?.running)) break; await w(page, 500); }
  await w(page, 2000);

  let s = await gs(page);
  console.log('\n========================================');
  console.log('  REAL PLAYTEST — Emilia spielt das Spiel');
  console.log('========================================');
  log(`Start: Pos(${s.px}, ${s.py}), Lv${s.level}, HP ${s.hp}/${s.maxHp}`);
  log(`Quest: ${s.quest?.name || 'keine'}`);
  log(`Inventar: [${s.items.join(', ')}]`);

  // ═══ PHASE 1: IM HUB ERKUNDEN ═══
  console.log('\n--- Phase 1: Hub erkunden ---');

  // Walk to Mama Tanja (8, 8) from start (20, 15)
  log('Laufe zu Mama Tanja...');
  await walkToward(page, 8, 8, 10);
  s = await gs(page);
  log(`Angekommen bei (${s.px}, ${s.py})`);

  // Talk to Mama
  await interact(page);
  await w(page, 1000);
  s = await gs(page);
  if (await page.evaluate(() => window.__game.dialog.isActive)) {
    log('Dialog mit Mama laeuft...');
    await closeAllDialog(page);
  }
  // Mama opens Crafting UI automatically — close it
  await w(page, 500);
  const craftOpen = await page.evaluate(() => window.__game.crafting?.isActive);
  if (craftOpen) {
    log('Crafting-UI automatisch geoeffnet (Mamas Kueche) — schliesse...');
    await page.click('#crafting-close').catch(() => {});
    await w(page, 300);
  }
  s = await gs(page);
  if (s.done.includes('first_steps')) {
    log(`Quest "Erste Schritte" erledigt! Lv${s.level}, XP ${s.xp}/${s.xpToNext}`);
  } else {
    issue('Quest nicht abgeschlossen nach Mama-Dialog');
  }

  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/rp_01_mama.png' });

  // Walk to Oma's garden and heal plants
  log('\nLaufe zu Omas Garten (Pflanzen heilen)...');
  await walkToward(page, 14, 12, 8);
  await healPlant(page);
  await walkToward(page, 22, 10, 8);
  await healPlant(page);
  await walkToward(page, 10, 16, 4);
  await healPlant(page);
  await walkToward(page, 19, 24, 5);
  await healPlant(page);
  s = await gs(page);
  log(`Pflanzen geheilt: ${s.plants}, Lv${s.level}, XP ${s.xp}/${s.xpToNext}`);

  // Gather resources (walk to resource spots)
  log('\nRessourcen sammeln...');
  // Forest has resources — let's go there via north exit (18, 0)
  log('Laufe zum Nord-Ausgang (Wald)...');
  await walkToward(page, 20, 5, 10);
  await walkToward(page, 20, 1, 8);
  await w(page, 3000); // wait for transition
  s = await gs(page);
  if (s.scene === 'forest') {
    log(`Im Wald angekommen! Pos(${s.px}, ${s.py})`);
  } else {
    issue(`Wald-Uebergang fehlgeschlagen! Scene: ${s.scene}, Pos(${s.px}, ${s.py})`);
    // Try walking further north
    await walkToward(page, 20, 0, 3);
    await w(page, 3000);
    s = await gs(page);
    log(`Retry: Scene ${s.scene}, Pos(${s.px}, ${s.py})`);
  }
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/rp_02_forest_enter.png' });

  // ═══ PHASE 2: WALD — KÄMPFEN ═══
  console.log('\n--- Phase 2: Wald — Kampf & Ressourcen ---');

  if (s.scene === 'forest') {
    // Walk south toward slime spawns (south area has easier slimes)
    log('Laufe nach Sueden zu den Slimes...');
    await walkToward(page, 25, 20, 5);
    await walkToward(page, 15, 25, 5);

    // Fight! Walk around and swing sword
    log('Kaempfe gegen Slimes...');
    const beforeFight = await gs(page);
    for (let i = 0; i < 30; i++) {
      await swing(page);
      // Move in a pattern to find mobs
      const dirs = ['KeyD', 'KeyD', 'KeyS', 'KeyS', 'KeyA', 'KeyA', 'KeyW', 'KeyW'];
      const key = dirs[i % dirs.length];
      await page.keyboard.down(key); await w(page, 200); await page.keyboard.up(key);
    }
    await w(page, 2000);
    const afterFight = await gs(page);
    log(`Kampf: HP ${beforeFight.hp} -> ${afterFight.hp}, Lv${afterFight.level}, XP ${afterFight.xp}/${afterFight.xpToNext}`);

    // Walk to another area with more slimes
    log('Laufe zu weiteren Slimes (Nordbereich)...');
    await walkToward(page, 12, 10, 6);
    for (let i = 0; i < 25; i++) {
      await swing(page);
      const key = ['KeyD', 'KeyS', 'KeyA', 'KeyW'][i % 4];
      await page.keyboard.down(key); await w(page, 180); await page.keyboard.up(key);
    }
    await w(page, 2000);
    s = await gs(page);
    log(`Zweiter Kampf: HP ${s.hp}/${s.maxHp}, Lv${s.level}, XP ${s.xp}/${s.xpToNext}`);

    // Gather forest resources
    log('Sammle Wald-Ressourcen...');
    await walkToward(page, 6, 22, 5);
    await interact(page); await interact(page); await interact(page);
    await walkToward(page, 32, 25, 6);
    await interact(page); await interact(page); await interact(page);
    s = await gs(page);
    log(`Ressourcen: Lv${s.level}, XP ${s.xp}, Items: [${s.items.join(', ')}]`);

    // Fight more if not level 4 yet
    if (s.level < 4) {
      log('Noch mehr kaempfen...');
      await walkToward(page, 38, 27, 6);
      for (let i = 0; i < 20; i++) { await swing(page); await page.keyboard.down('KeyA'); await w(page, 150); await page.keyboard.up('KeyA'); }
      await w(page, 2000);
      await walkToward(page, 20, 31, 5);
      for (let i = 0; i < 20; i++) { await swing(page); await page.keyboard.down('KeyD'); await w(page, 150); await page.keyboard.up('KeyD'); }
      await w(page, 2000);
    }
  }

  s = await gs(page);
  log(`\nWald-Ende: Lv${s.level}, XP ${s.xp}/${s.xpToNext}, TotalXP ${s.totalXp}`);
  log(`Quests erledigt: [${s.done.join(', ')}]`);
  log(`Aktive Quest: ${s.quest?.name || 'keine'} (${s.quest?.progress || 0}/${s.quest?.count || '?'})`);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/rp_03_forest_after.png' });

  // ═══ PHASE 3: ZURÜCK ZUM HUB, DANN SEE ═══
  console.log('\n--- Phase 3: See erkunden ---');

  // Walk south to exit forest -> hub
  log('Laufe zurueck zum Hub (Sued-Ausgang)...');
  await walkToward(page, 25, 38, 6);
  await w(page, 3000);
  s = await gs(page);
  log(`Scene: ${s.scene}, Pos(${s.px}, ${s.py})`);

  if (s.scene === 'hub') {
    // Now walk south to Lake exit (18, 30)
    log('Laufe zum Sued-Ausgang (See)...');
    await walkToward(page, 20, 28, 5);
    await walkToward(page, 20, 31, 3);
    await w(page, 3000);
    s = await gs(page);
    if (s.scene === 'lake') {
      log(`Am See! Pos(${s.px}, ${s.py})`);

      // Explore the lake — walk around
      log('Erkunde den See...');
      await walkToward(page, 15, 15, 5);
      await walkToward(page, 30, 15, 5);
      await walkToward(page, 22, 25, 5);

      // Try to heal plants here
      for (let i = 0; i < 5; i++) { await healPlant(page); await walkToward(page, 10 + i*6, 10 + i*3, 2); }
      s = await gs(page);
      log(`See erkundet: Lv${s.level}, Plants ${s.plants}`);
    } else {
      issue(`See-Uebergang fehlgeschlagen, Scene: ${s.scene}`);
    }
  }

  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/rp_04_lake.png' });

  // ═══ PHASE 4: MEHR KAMPF FÜR LEVEL 4 ═══
  s = await gs(page);
  if (s.level < 4) {
    console.log('\n--- Phase 4: Grind fuer Level 4 ---');
    // Go back to forest for more fighting
    if (s.scene !== 'forest') {
      if (s.scene === 'lake') {
        log('Zurueck zum Hub vom See...');
        await walkToward(page, 21, 2, 5);
        await w(page, 3000);
      }
      s = await gs(page);
      if (s.scene === 'hub') {
        log('Zum Wald...');
        await walkToward(page, 20, 1, 5);
        await w(page, 3000);
      }
    }
    s = await gs(page);
    if (s.scene === 'forest') {
      for (let grind = 0; grind < 5 && (await gs(page)).level < 4; grind++) {
        log(`Grind-Runde ${grind + 1}...`);
        // Wander and fight
        const spots = [[10, 25], [35, 27], [20, 30], [12, 9], [40, 8]];
        for (const [tx, ty] of spots) {
          await walkToward(page, tx, ty, 4);
          for (let i = 0; i < 12; i++) {
            await swing(page);
            const key = ['KeyD', 'KeyS', 'KeyA', 'KeyW'][i % 4];
            await page.keyboard.down(key); await w(page, 120); await page.keyboard.up(key);
          }
          await w(page, 1000);
        }
        s = await gs(page);
        log(`  Lv${s.level}, XP ${s.xp}/${s.xpToNext}, HP ${s.hp}/${s.maxHp}`);
      }
    }
  }

  // ═══ FINAL REPORT ═══
  s = await gs(page);
  await page.screenshot({ path: 'C:/Users/Tanja/AppData/Local/Temp/rp_05_final.png' });

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║      REAL PLAYTEST — FINAL REPORT         ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`  Level: ${s.level}  TotalXP: ${s.totalXp}  HP: ${s.hp}/${s.maxHp}`);
  console.log(`  Scene: ${s.scene}  Pos: (${s.px}, ${s.py})`);
  console.log(`  Plants healed: ${s.plants}`);
  console.log(`  Quests done: [${s.done.join(', ')}]`);
  console.log(`  Active Quest: ${s.quest?.name || 'none'} (${s.quest?.progress || 0}/${s.quest?.count || '?'})`);
  console.log(`  Inventory: [${s.items.join(', ')}]`);
  console.log(`  Stats: MaxHP ${s.maxHp} (+${s.bonusHp || 0})`);
  console.log(`  JS Errors: ${jsErrors.length}`);
  if (jsErrors.length) jsErrors.slice(0, 3).forEach(e => console.log(`    ${e.substring(0, 80)}`));
  console.log('╠══════════════════════════════════════════╣');
  console.log(`  ISSUES FOUND: ${issues.length}`);
  issues.forEach(i => console.log(`    - ${i}`));
  console.log('╚══════════════════════════════════════════╝');

  await browser.close();
})();
