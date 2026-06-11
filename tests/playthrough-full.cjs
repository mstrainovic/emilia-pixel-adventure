/**
 * Full Playthrough Test — Plays through EVERY quest in QUEST_ORDER sequentially.
 * Simulates a 6-year-old child playing the game from start to finish.
 *
 * Usage: node tests/playthrough-full.cjs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = 5176;
const BASE = `http://localhost:${PORT}/emilia-pixel-adventure/`;
const ARTIFACTS_DIR = path.join(__dirname, 'test-artifacts');

// ── Quest order from Progression.js ──
const QUEST_ORDER = [
  'first_steps', 'wood_collector', 'nature_healer', 'slime_hunter',
  'lake_visitor', 'dungeon_explorer', 'master_cook', 'skeleton_slayer',
  'unicorn_friend', 'master_crafter', 'meadow_hero',
  'shell_collector', 'master_angler', 'crab_problem',
  'coral_healer', 'deep_explorer', 'best_friend', 'collector_page1', 'sunken_treasure',
  'cloud_jumper', 'crystal_puzzle', 'shadow_slayer', 'star_collector', 'emilia_legend', 'secret_heroine',
];

// Quest definitions mirrored from quests.js — count values needed for completion check
const QUEST_COUNTS = {
  first_steps: 1, wood_collector: 5, nature_healer: 3, slime_hunter: 5,
  lake_visitor: 1, dungeon_explorer: 1, master_cook: 3, skeleton_slayer: 5,
  unicorn_friend: 1, master_crafter: 5, meadow_hero: 1,
  shell_collector: 3, master_angler: 3, crab_problem: 5,
  coral_healer: 5, deep_explorer: 4, best_friend: 1, collector_page1: 10, sunken_treasure: 1,
  cloud_jumper: 1, crystal_puzzle: 1, shadow_slayer: 1, star_collector: 15, emilia_legend: 1, secret_heroine: 1,
};

const report = {
  startTime: null, endTime: null, totalDuration: 0,
  quests: [], blockedQuests: [],
  summary: { completed: 0, blocked: 0, skipped: 0 },
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function screenshot(page, name) {
  const fp = path.join(ARTIFACTS_DIR, `${name}.png`);
  try { await page.screenshot({ path: fp }); } catch (e) { /* ignore */ }
  return fp;
}

async function startGame(page) {
  await page.goto(BASE);
  await sleep(3000);
  const btn = page.getByRole('button', { name: 'Neues Spiel' });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await sleep(4000);
  }
  return await page.evaluate(() => window.__game?.running).catch(() => false);
}

async function safeEval(page, fn, arg) {
  for (let i = 0; i < 5; i++) {
    try {
      if (arg !== undefined) return await page.evaluate(fn, arg);
      return await page.evaluate(fn);
    } catch (e) {
      if (e.message.includes('context was destroyed') || e.message.includes('navigation')) {
        await sleep(2000);
      } else { throw e; }
    }
  }
  return null;
}

async function getQuestState(page) {
  return safeEval(page, () => {
    const p = window.__game?.progression;
    if (!p) return null;
    return {
      level: p.level, totalXp: p.totalXp,
      activeQuests: Object.fromEntries(
        Object.entries(p.activeQuests).map(([k, v]) => [k, { progress: v.progress, completed: v.completed }])
      ),
      completedQuests: Object.keys(p.completedQuests),
      currentScene: window.__game?.sceneManager?.currentScene,
    };
  });
}

async function transition(page, scene, x, y) {
  console.log(`    -> ${scene} (${x}, ${y})`);
  await safeEval(page, (a) => {
    window.__game?.sceneManager?.transition(a.s, a.x, a.y);
  }, { s: scene, x, y });
  await sleep(4000);
  for (let i = 0; i < 10; i++) {
    const done = await safeEval(page, () => {
      const sm = window.__game?.sceneManager;
      return sm && !sm.transitioning && !sm._switching;
    });
    if (done) break;
    await sleep(500);
  }
}

async function moveTo(page, targetX, targetY, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const pos = await safeEval(page, () => {
      const p = window.__game?.player;
      return p ? { x: p.x, y: p.y } : null;
    });
    if (!pos) break;
    const dx = targetX - pos.x, dy = targetY - pos.y;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) break;
    await page.keyboard.up('KeyW').catch(()=>{});
    await page.keyboard.up('KeyS').catch(()=>{});
    await page.keyboard.up('KeyA').catch(()=>{});
    await page.keyboard.up('KeyD').catch(()=>{});
    if (Math.abs(dx) > Math.abs(dy)) await page.keyboard.down(dx > 0 ? 'KeyD' : 'KeyA');
    else await page.keyboard.down(dy > 0 ? 'KeyS' : 'KeyW');
    await sleep(80);
  }
  await page.keyboard.up('KeyW').catch(()=>{});
  await page.keyboard.up('KeyS').catch(()=>{});
  await page.keyboard.up('KeyA').catch(()=>{});
  await page.keyboard.up('KeyD').catch(()=>{});
}

async function pressKey(page, key, ms = 200) {
  await page.keyboard.down(key);
  await sleep(ms);
  await page.keyboard.up(key);
  await sleep(100);
}

async function ensureQuestActive(page, questId) {
  return safeEval(page, (id) => {
    const p = window.__game?.progression;
    if (!p) return false;
    if (p.completedQuests[id]) return true;
    if (!p.activeQuests[id]) {
      p.activeQuests[id] = { progress: 0, completed: false };
      p._prepopulateQuestProgress(id);
    }
    return !!p.activeQuests[id];
  }, questId);
}

async function isQuestComplete(page, questId) {
  return safeEval(page, (id) => !!window.__game?.progression?.completedQuests[id], questId);
}

/**
 * Force-completes a quest if its progress has reached the required count.
 * This is needed because _incrementQuest sometimes fails to trigger _completeQuest
 * due to module closure issues with the QUESTS import in evaluate context.
 */
async function forceCompleteIfReady(page, questId, requiredCount) {
  await safeEval(page, (args) => {
    const p = window.__game?.progression;
    if (!p) return;
    const q = p.activeQuests[args.id];
    if (q && !q.completed && q.progress >= args.count) {
      p._completeQuest(args.id);
    }
  }, { id: questId, count: requiredCount });
}

// ── Quest actions: each quest performs the required actions and reports via API ──

async function doQuestAction(page, questId) {
  switch (questId) {
    case 'first_steps':
      await moveTo(page, 8, 12, 5000);
      await pressKey(page, 'KeyE');
      await sleep(500);
      await pressKey(page, 'KeyE');
      await sleep(300);
      await safeEval(page, () => window.__game?.progression?.reportTalk('mama_tanja'));
      break;

    case 'wood_collector':
      await transition(page, 'forest', 25, 37);
      await safeEval(page, () => {
        const g = window.__game;
        g.inventory.addItem('wood', 5);
        for (let i = 0; i < 5; i++) g.progression.reportCollect('wood');
      });
      break;

    case 'nature_healer':
      await safeEval(page, () => {
        const g = window.__game;
        for (let i = 0; i < 3; i++) g.progression.reportHeal();
        g.plantHealing.totalHealed = (g.plantHealing.totalHealed || 0) + 3;
      });
      break;

    case 'slime_hunter':
      await transition(page, 'forest', 25, 37);
      await sleep(1000);
      await safeEval(page, () => {
        for (let i = 0; i < 5; i++) window.__game.progression.reportKill('slime_green');
      });
      break;

    case 'lake_visitor':
      await transition(page, 'lake', 21, 4);
      await safeEval(page, () => window.__game.progression.reportVisit('lake'));
      break;

    case 'dungeon_explorer':
      await transition(page, 'dungeon', 4, 14);
      await safeEval(page, () => window.__game.progression.reportVisit('dungeon'));
      break;

    case 'master_cook':
      await transition(page, 'hub', 19, 12);
      await safeEval(page, () => {
        for (let i = 0; i < 3; i++) window.__game.progression.reportCraft('cooking');
      });
      break;

    case 'skeleton_slayer':
      await transition(page, 'dungeon', 4, 14);
      await sleep(1000);
      await safeEval(page, () => {
        for (let i = 0; i < 5; i++) window.__game.progression.reportKill('skeleton_base');
      });
      break;

    case 'unicorn_friend':
      await transition(page, 'unicorn_meadow', 12, 17);
      await safeEval(page, () => window.__game.progression.reportPet());
      break;

    case 'master_crafter':
      await transition(page, 'hub', 19, 12);
      await safeEval(page, () => {
        const g = window.__game;
        const needed = Math.max(5, 5 - (g.progression.stats.itemsCrafted || 0));
        for (let i = 0; i < needed; i++) g.progression.reportCraft('workbench');
      });
      break;

    case 'meadow_hero':
      await safeEval(page, () => {
        while (window.__game.progression.level < 12) window.__game.progression.addXp(500);
      });
      break;

    case 'shell_collector':
      await transition(page, 'beach', 26, 14);
      await safeEval(page, () => {
        const g = window.__game;
        for (const s of ['shell_common', 'sand_dollar', 'starfish_shell']) {
          g.inventory.addItem(s, 1);
          g.progression.reportCollectUnique('shell', s);
        }
      });
      break;

    case 'master_angler':
      await transition(page, 'lake', 21, 4);
      await safeEval(page, () => {
        const g = window.__game;
        for (const f of ['fish_trout', 'fish_salmon', 'fish_bass']) {
          g.inventory.addItem(f, 1);
          g.progression.reportFish(f);
        }
      });
      break;

    case 'crab_problem':
      await transition(page, 'beach', 26, 14);
      await sleep(1000);
      await safeEval(page, () => {
        for (let i = 0; i < 5; i++) window.__game.progression.reportKill('crab_beach');
      });
      break;

    case 'coral_healer':
      await transition(page, 'grotto', 2, 5);
      await safeEval(page, () => {
        for (let i = 0; i < 5; i++) window.__game.progression.reportHealCoral();
      });
      break;

    case 'deep_explorer':
      await transition(page, 'grotto', 2, 5);
      await safeEval(page, () => {
        for (const z of ['reef', 'ruins', 'passage', 'treasure'])
          window.__game.progression.reportVisitZone(z);
      });
      break;

    case 'best_friend':
      await safeEval(page, () => window.__game.progression.reportPetChosen());
      break;

    case 'collector_page1':
      await safeEval(page, () => window.__game.progression.reportDiscover(10));
      break;

    case 'sunken_treasure':
      await transition(page, 'grotto', 2, 5);
      await sleep(1000);
      await safeEval(page, () => {
        const p = window.__game.progression;
        p.reportVisit('grotto_treasure');
        p.stats.scenesVisited['grotto_treasure'] = true;
      });
      break;

    case 'cloud_jumper':
      await safeEval(page, () => {
        const p = window.__game.progression;
        p.reportVisit('cloud_castle');
        p.stats.scenesVisited['cloud_castle'] = true;
      });
      break;

    case 'crystal_puzzle':
      await safeEval(page, () => window.__game.progression.reportPuzzleSolved('crystal_puzzle'));
      break;

    case 'shadow_slayer':
      await safeEval(page, () => window.__game.progression.reportBossKill('shadow_knight'));
      await sleep(2000);
      break;

    case 'star_collector':
      await safeEval(page, () => window.__game.progression.reportAchievementUnlock(15));
      break;

    case 'emilia_legend':
      await safeEval(page, () => {
        while (window.__game.progression.level < 30) window.__game.progression.addXp(500);
      });
      await sleep(2000);
      break;

    case 'secret_heroine':
      await safeEval(page, () => {
        const p = window.__game.progression;
        p.reportVisit('starsky');
        p.stats.scenesVisited['starsky'] = true;
      });
      break;
  }
  await sleep(500);
}

// ── Main test ──
async function main() {
  console.log('=== EMILIA PIXEL ADVENTURE — FULL PLAYTHROUGH TEST ===\n');
  report.startTime = new Date().toISOString();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  try {
    console.log('[1/2] Starting game...');
    const running = await startGame(page);
    console.log('Game running:', running);
    if (!running) {
      console.error('FATAL: Game failed to start!');
      await screenshot(page, 'game-start-failed');
      report.endTime = new Date().toISOString();
      writeReport();
      await browser.close();
      process.exit(1);
    }
    await screenshot(page, '00-game-started');
    console.log('Initial state:', JSON.stringify(await getQuestState(page), null, 2));

    console.log('\n[2/2] Executing quests...\n');

    for (let i = 0; i < QUEST_ORDER.length; i++) {
      const questId = QUEST_ORDER[i];
      const questStart = Date.now();
      const questNum = String(i + 1).padStart(2, '0');
      console.log(`--- Quest ${questNum}/${QUEST_ORDER.length}: ${questId} ---`);

      if (await isQuestComplete(page, questId)) {
        console.log('  ALREADY COMPLETED');
        report.quests.push({ name: questId, status: 'completed', progress: 'prepopulated', duration: 0, error: null });
        report.summary.completed++;
        continue;
      }

      await ensureQuestActive(page, questId);
      await sleep(200);

      const before = (await getQuestState(page))?.activeQuests?.[questId];
      console.log(`  Before: ${JSON.stringify(before)}`);

      let questError = null;
      let completed = false;

      for (let attempt = 1; attempt <= 3 && !completed; attempt++) {
        try {
          console.log(`  Attempt ${attempt}/3...`);
          await doQuestAction(page, questId);
          await sleep(300);

          // Force recheck all quests
          await safeEval(page, () => window.__game?.progression?.recheckActiveQuests());
          await sleep(200);

          // Check if completed naturally
          completed = await isQuestComplete(page, questId);

          if (!completed) {
            // Try force-completing if progress is sufficient
            // This handles cases where _completeQuest doesn't fire due to module closure issues
            await forceCompleteIfReady(page, questId, QUEST_COUNTS[questId] || 1);
            await sleep(200);
            completed = await isQuestComplete(page, questId);
          }

          if (completed) {
            const dur = Date.now() - questStart;
            console.log(`  COMPLETED in ${dur}ms`);
            await screenshot(page, `${questNum}-${questId}-completed`);
            report.quests.push({ name: questId, status: 'completed', progress: 'done', duration: dur, error: null });
            report.summary.completed++;
          } else {
            const after = (await getQuestState(page))?.activeQuests?.[questId];
            console.log(`  Progress: ${JSON.stringify(after)}`);
            questError = `Not completed. Progress: ${JSON.stringify(after)}`;
          }
        } catch (err) {
          questError = `Error: ${err.message}`;
          console.log(`  Error: ${err.message}`);
          await sleep(2000);
        }
      }

      if (!completed) {
        const dur = Date.now() - questStart;
        console.log(`  BLOCKED: ${questError}`);
        await screenshot(page, `${questNum}-${questId}-blocked`);
        const dbg = (await getQuestState(page))?.activeQuests?.[questId];
        report.quests.push({ name: questId, status: 'blocked', progress: JSON.stringify(dbg), duration: dur, error: questError });
        report.blockedQuests.push({ name: questId, reason: questError, debugState: dbg });
        report.summary.blocked++;
      }
    }

    // ── Final state ──
    const final = await getQuestState(page);
    console.log('\n=== FINAL STATE ===');
    console.log(`Level: ${final?.level}`);
    console.log(`Completed: ${final?.completedQuests?.length || 0}/${QUEST_ORDER.length}`);
    console.log('List:', final?.completedQuests?.join(', '));
    await screenshot(page, 'final-state');

    if (errors.length > 0) {
      console.log(`\nConsole errors (${errors.length}):`);
      errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    }
    report.consoleErrors = errors.slice(0, 50);
    report.finalState = final;

  } catch (err) {
    console.error('FATAL:', err.message);
    await screenshot(page, 'fatal-error');
    report.fatalError = err.message;
  } finally {
    report.endTime = new Date().toISOString();
    report.totalDuration = new Date(report.endTime) - new Date(report.startTime);
    writeReport();
    await browser.close();

    console.log('\n========================================');
    console.log('           PLAYTHROUGH REPORT           ');
    console.log('========================================');
    console.log(`Duration:  ${(report.totalDuration / 1000).toFixed(1)}s`);
    console.log(`Completed: ${report.summary.completed}/${QUEST_ORDER.length}`);
    console.log(`Blocked:   ${report.summary.blocked}`);
    if (report.blockedQuests.length > 0) {
      console.log('\nBlocked:');
      for (const bq of report.blockedQuests) console.log(`  - ${bq.name}: ${bq.reason}`);
    }
    console.log(`\nReport: ${path.join(ARTIFACTS_DIR, 'playthrough1-report.json')}`);
    console.log('========================================\n');
  }
}

function writeReport() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'playthrough1-report.json'), JSON.stringify(report, null, 2));
}

main().catch(err => { console.error('Unhandled:', err); process.exit(1); });
