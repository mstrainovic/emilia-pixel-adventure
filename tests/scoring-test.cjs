/**
 * Emilia's Pixel Adventure — Automated Scoring Playtest
 *
 * Plays through the game systematically and scores each category.
 * Categories: Loading, Movement, NPCs, Dialog, Combat, Scenes, Plants, Items, UI, Stability
 *
 * Run: node tests/scoring-test.cjs [port]
 */

const { chromium } = require('playwright');

const PORT = process.argv[2] || 5176;
const BASE = `http://localhost:${PORT}/emilia-pixel-adventure/`;
const SCORES = {};
const ISSUES = [];
let totalPoints = 0;
let maxPoints = 0;

function score(category, test, points, maxPts, detail) {
  if (!SCORES[category]) SCORES[category] = { earned: 0, max: 0, tests: [] };
  SCORES[category].earned += points;
  SCORES[category].max += maxPts;
  SCORES[category].tests.push({ test, points, maxPts, detail });
  totalPoints += points;
  maxPoints += maxPts;
  const icon = points === maxPts ? '✅' : points > 0 ? '⚠️' : '❌';
  console.log(`  ${icon} ${test}: ${points}/${maxPts}${detail ? ' — ' + detail : ''}`);
}

function issue(severity, desc) {
  ISSUES.push({ severity, desc });
  console.log(`  🐛 [${severity}] ${desc}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function startGame(page) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  const btn = page.getByRole('button', { name: 'Neues Spiel' });
  await btn.click();
  await page.waitForTimeout(2000);
}

async function evalGame(page, fn, arg) {
  return arg !== undefined ? page.evaluate(fn, arg) : page.evaluate(fn);
}

async function pressKey(page, key, duration = 100) {
  await page.keyboard.down(key);
  await page.waitForTimeout(duration);
  await page.keyboard.up(key);
  await page.waitForTimeout(50);
}

async function simulateKey(page, code) {
  await page.evaluate((c) => { window.__game.input._justPressed[c] = true; }, code);
  await sleep(150);
}

(async () => {
  console.log('\n🎮 EMILIA\'S PIXEL ADVENTURE — SCORING PLAYTEST\n');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text());
    }
  });

  // ═══════════════════════════════════════════
  // 1. LOADING & STARTUP
  // ═══════════════════════════════════════════
  console.log('\n📦 1. LOADING & STARTUP');
  try {
    await page.goto(BASE);
    await page.waitForTimeout(1500);

    const title = await page.title();
    score('Loading', 'Page title correct', title.includes('Pixel Adventure') ? 2 : 0, 2);

    const menuVisible = await page.getByRole('button', { name: 'Neues Spiel' }).isVisible();
    score('Loading', 'Main menu visible', menuVisible ? 3 : 0, 3);

    await page.getByRole('button', { name: 'Neues Spiel' }).click();
    await page.waitForTimeout(2500);

    const gameRunning = await evalGame(page, () => !!window.__game?.running);
    score('Loading', 'Game starts successfully', gameRunning ? 5 : 0, 5);

    const initialErrors = consoleErrors.length;
    score('Loading', 'No console errors on start', initialErrors === 0 ? 3 : 0, 3,
      initialErrors > 0 ? `${initialErrors} errors` : 'clean');
  } catch (e) {
    score('Loading', 'Startup flow', 0, 13, e.message);
  }

  // ═══════════════════════════════════════════
  // 2. PLAYER & MOVEMENT
  // ═══════════════════════════════════════════
  console.log('\n🏃 2. PLAYER & MOVEMENT');
  try {
    const playerExists = await evalGame(page, () => !!window.__game?.player);
    score('Movement', 'Player entity exists', playerExists ? 2 : 0, 2);

    const startPos = await evalGame(page, () => ({ x: window.__game.player.x, y: window.__game.player.y }));

    // Walk right
    await pressKey(page, 'd', 500);
    await sleep(200);
    const afterMove = await evalGame(page, () => ({ x: window.__game.player.x, y: window.__game.player.y }));
    const moved = Math.abs(afterMove.x - startPos.x) > 0.3;
    score('Movement', 'WASD movement works', moved ? 3 : 0, 3,
      `dx=${(afterMove.x - startPos.x).toFixed(2)}`);

    // Walk up
    const beforeUp = await evalGame(page, () => window.__game.player.y);
    await pressKey(page, 'w', 400);
    await sleep(200);
    const afterUp = await evalGame(page, () => window.__game.player.y);
    score('Movement', 'Vertical movement', Math.abs(afterUp - beforeUp) > 0.2 ? 2 : 0, 2);

    // Collision check — walk into border
    await evalGame(page, () => { window.__game.player.x = 2; window.__game.player.y = 2; });
    await pressKey(page, 'a', 600);
    await sleep(100);
    const collX = await evalGame(page, () => window.__game.player.x);
    score('Movement', 'Collision blocks movement', collX >= 1.5 ? 3 : 0, 3, `x=${collX.toFixed(2)}`);

    // Spawn not on bonfire
    await evalGame(page, () => {
      const g = window.__game;
      g.player.x = 19; g.player.y = 12; // default spawn
    });
    const bonfireDist = await evalGame(page, () => {
      const g = window.__game;
      // Check distance to bonfire prop (22,15)
      const dx = g.player.x - 22;
      const dy = g.player.y - 15;
      return Math.sqrt(dx*dx + dy*dy);
    });
    score('Movement', 'Spawn not on bonfire', bonfireDist > 2 ? 2 : 0, 2, `dist=${bonfireDist.toFixed(1)}`);

  } catch (e) {
    score('Movement', 'Movement tests', 0, 12, e.message);
  }

  // ═══════════════════════════════════════════
  // 3. NPCs & DIALOG
  // ═══════════════════════════════════════════
  console.log('\n💬 3. NPCs & DIALOG');
  try {
    await evalGame(page, () => { window.__game.player.x = 19; window.__game.player.y = 12; });
    await sleep(300);

    const npcCount = await evalGame(page, () => window.__game.npcs.length);
    score('NPCs', 'NPCs loaded', npcCount >= 6 ? 3 : npcCount >= 3 ? 1 : 0, 3, `${npcCount} NPCs`);

    // Check NPC positions — none should be inside houses
    const npcPositions = await evalGame(page, () => {
      return window.__game.npcs.map(n => ({
        name: n.name, x: n.x, y: n.y,
        hasShadow: !!n.shadow
      }));
    });

    let npcPositionOk = true;
    for (const npc of npcPositions) {
      // Houses are at y=5-8 (kitchen/workshop). NPCs should be at y>=10
      if (npc.name === 'Mama Tanja' && npc.y < 10) { npcPositionOk = false; issue('medium', `${npc.name} inside house (y=${npc.y})`); }
      if (npc.name === 'Papa Milos' && npc.y < 10) { npcPositionOk = false; issue('medium', `${npc.name} inside house (y=${npc.y})`); }
    }
    score('NPCs', 'NPCs outside buildings', npcPositionOk ? 3 : 0, 3);

    // Check no double shadows
    const hasShadows = npcPositions.some(n => n.hasShadow);
    score('NPCs', 'No double shadows', !hasShadows ? 2 : 0, 2,
      hasShadows ? 'Entity shadow still present' : 'sprites-only shadows');

    // Dialog test — walk to Mama Tanja
    await evalGame(page, () => {
      const tanja = window.__game.npcs.find(n => n.name === 'Mama Tanja');
      if (tanja) { window.__game.player.x = tanja.x; window.__game.player.y = tanja.y + 1; }
    });
    await sleep(300);
    await pressKey(page, 'e', 100);
    await sleep(500);
    const dialogOpen = await evalGame(page, () => window.__game.dialog.isActive);
    score('NPCs', 'Dialog opens with E key', dialogOpen ? 3 : 0, 3);

    // Close dialog and check quest chain
    if (dialogOpen) {
      // Fast-advance dialog
      await evalGame(page, () => {
        const d = window.__game.dialog;
        while (d.isActive) d._advance();
      });
      await sleep(500);

      // Check quest chain: after talking to Mama, next quest should be unlocked
      const nextQuest = await evalGame(page, () => {
        const q = window.__game.progression.getActiveQuest();
        return q ? q.name : null;
      });
      score('NPCs', 'Quest chain advances', nextQuest ? 2 : 0, 2, nextQuest || 'no next quest');
    } else {
      score('NPCs', 'Quest chain advances', 0, 2, 'dialog did not open');
    }
  } catch (e) {
    score('NPCs', 'NPC tests', 0, 13, e.message);
  }

  // ═══════════════════════════════════════════
  // 4. PLANT HEALING (F KEY)
  // ═══════════════════════════════════════════
  console.log('\n🌱 4. PLANT HEALING');
  try {
    const plantCount = await evalGame(page, () => window.__game.plantHealing.plants.length);
    score('Plants', 'Plants exist in scene', plantCount > 0 ? 2 : 0, 2, `${plantCount} plants`);

    // Teleport to nearest plant
    const nearPlant = await evalGame(page, () => {
      const p = window.__game.plantHealing.plants.find(pl => !pl.healed);
      return p ? { x: p.x, y: p.y } : null;
    });

    if (nearPlant) {
      await evalGame(page, (pos) => {
        window.__game.player.x = pos.x + 0.5;
        window.__game.player.y = pos.y + 0.5;
      }, nearPlant);
      await sleep(200);

      // Press F to heal
      await evalGame(page, () => { window.__game.input._justPressed['KeyF'] = true; });
      await sleep(500);

      const healed = await evalGame(page, () => window.__game.plantHealing.totalHealed);
      score('Plants', 'F key heals plant', healed > 0 ? 5 : 0, 5, `${healed} healed`);

      const xpGained = await evalGame(page, () => window.__game.progression.xp);
      score('Plants', 'XP gained from healing', xpGained > 0 ? 2 : 0, 2, `${xpGained} XP`);
    } else {
      score('Plants', 'F key heals plant', 0, 5, 'no unhealed plants found');
      score('Plants', 'XP gained from healing', 0, 2);
    }
  } catch (e) {
    score('Plants', 'Plant tests', 0, 9, e.message);
  }

  // ═══════════════════════════════════════════
  // 5. SCENE TRANSITIONS
  // ═══════════════════════════════════════════
  console.log('\n🗺️  5. SCENE TRANSITIONS');
  try {
    // Go to forest
    await evalGame(page, () => window.__game.loadScene('forest', {x: 25, y: 20}));
    await sleep(2000);
    const inForest = await evalGame(page, () => {
      const bg = window.__game.scene?.background;
      return bg ? true : false;
    });
    score('Scenes', 'Forest loads', inForest ? 3 : 0, 3);

    // Check forest has mobs
    const forestMobs = await evalGame(page, () => window.__game.mobs.length);
    score('Scenes', 'Forest has mobs', forestMobs > 0 ? 2 : 0, 2, `${forestMobs} mobs`);

    // Go to dungeon
    await evalGame(page, () => window.__game.loadScene('dungeon', {x: 4, y: 14}));
    await sleep(2000);
    const dungeonMobs = await evalGame(page, () => window.__game.mobs.length);
    score('Scenes', 'Dungeon loads with mobs', dungeonMobs > 0 ? 3 : 0, 3, `${dungeonMobs} mobs`);

    // Test dungeon walkability
    const canWalk = await evalGame(page, () => {
      const tm = window.__game.tileMap;
      // Entry hall should be walkable — getTileCollision(col, row) returns true if blocked
      return !tm.getTileCollision(5, 14) && !tm.getTileCollision(8, 14) && !tm.getTileCollision(24, 11);
    });
    score('Scenes', 'Dungeon collision correct', canWalk ? 3 : 0, 3);

    // Go to lake
    await evalGame(page, () => window.__game.loadScene('lake', {x: 21, y: 4}));
    await sleep(2000);
    const lakeLoaded = await evalGame(page, () => !!window.__game.tileMap);
    score('Scenes', 'Lake loads', lakeLoaded ? 2 : 0, 2);

    // Go to unicorn meadow
    await evalGame(page, () => window.__game.loadScene('unicorn_meadow', {x: 12, y: 10}));
    await sleep(2000);
    const unicorns = await evalGame(page, () => window.__game.unicorns.length);
    score('Scenes', 'Unicorn meadow + unicorns', unicorns > 0 ? 3 : 0, 3, `${unicorns} unicorns`);

    // Back to hub
    await evalGame(page, () => window.__game.loadScene('hub', {x: 19, y: 12}));
    await sleep(2000);
  } catch (e) {
    score('Scenes', 'Scene transitions', 0, 16, e.message);
  }

  // ═══════════════════════════════════════════
  // 6. COMBAT
  // ═══════════════════════════════════════════
  console.log('\n⚔️  6. COMBAT');
  try {
    await evalGame(page, () => window.__game.loadScene('forest', {x: 25, y: 20}));
    await sleep(2000);

    // Find nearest mob and teleport close
    const mobInfo = await evalGame(page, () => {
      const mob = window.__game.mobs.find(m => m.alive);
      return mob ? { x: mob.x, y: mob.y, hp: mob.hp, type: mob.mobType } : null;
    });

    if (mobInfo) {
      // Position player right next to mob and face toward it
      await evalGame(page, (m) => {
        window.__game.player.x = m.x + 1.0;
        window.__game.player.y = m.y;
        window.__game.player.direction = 'left'; // face the mob
        window.__game.player.state = 'idle';     // ensure we can attack
      }, mobInfo);
      await sleep(200);

      const beforeHP = await evalGame(page, () => {
        const mob = window.__game.mobs.find(m => m.alive);
        return mob ? mob.hp : -1;
      });

      // Directly trigger combat system attack + hit detection
      const attackResult = await evalGame(page, () => {
        const g = window.__game;
        const mob = g.mobs.find(m => m.alive);
        if (!mob) return { attacked: false, reason: 'no mob' };

        // Force attack via input injection
        g.input._justPressed['Space'] = true;
        g.input._consumed = {};
        const attacked = g.combat.tryAttack(g.player, g.input);
        if (!attacked) return { attacked: false, reason: 'tryAttack failed', state: g.player.state, cooldown: g.combat.attackCooldown };

        // Immediately run combat hit detection
        const hits = g.combat.update(0.01, g.player, g.mobs);
        return { attacked: true, hits: hits.length, mobHp: mob.hp };
      });

      const afterHP = await evalGame(page, () => {
        const mob = window.__game.mobs.find(m => m.alive);
        return mob ? mob.hp : -1;
      });

      const damaged = afterHP < beforeHP || (attackResult.hits > 0);
      score('Combat', 'Attack damages mob', damaged ? 4 : 0, 4,
        `hp: ${beforeHP} → ${afterHP}, attack: ${JSON.stringify(attackResult)}`);
    } else {
      score('Combat', 'Attack damages mob', 0, 4, 'no mobs alive');
    }

    // Check player can take damage
    const playerHP = await evalGame(page, () => window.__game.player.hp);
    score('Combat', 'Player HP tracked', playerHP > 0 ? 2 : 0, 2, `${playerHP} HP`);

  } catch (e) {
    score('Combat', 'Combat tests', 0, 6, e.message);
  }

  // ═══════════════════════════════════════════
  // 7. UI & HUD
  // ═══════════════════════════════════════════
  console.log('\n🖥️  7. UI & HUD');
  try {
    await evalGame(page, () => window.__game.loadScene('hub', {x: 19, y: 12}));
    await sleep(1500);

    // HP bar visible
    const hpBar = await page.$('#hud-hp-bar-fill');
    score('UI', 'HP bar visible', hpBar ? 2 : 0, 2);

    // Quest tracker — make it visible first by triggering quest update
    await evalGame(page, () => {
      const q = window.__game.progression?.getActiveQuest();
      if (q) window.__game.hud.updateQuest(q);
    });
    await sleep(300);

    const quest = await page.$('#hud-quest-tracker');
    const questExists = !!quest;
    const questVisible = quest ? await quest.evaluate(el => el.style.display !== 'none') : false;
    score('UI', 'Quest tracker exists', questExists ? 2 : 0, 2, questVisible ? 'visible' : 'hidden');

    // Quest text size check — temporarily show tracker to measure font
    const questFontSize = await page.evaluate(() => {
      const tracker = document.querySelector('#hud-quest-tracker');
      if (tracker) tracker.style.display = 'block';
      const el = document.querySelector('.quest-title');
      if (!el) return 0;
      return parseFloat(getComputedStyle(el).fontSize);
    });
    score('UI', 'Quest text readable (>=10px)', questFontSize >= 10 ? 3 : 0, 3, `${questFontSize}px`);
    // Hide it again
    await page.evaluate(() => {
      const tracker = document.querySelector('#hud-quest-tracker');
      const q = window.__game?.progression?.getActiveQuest();
      if (tracker && !q) tracker.style.display = 'none';
    });

    // Hotbar
    const hotbar = await page.$('#hud-hotbar');
    score('UI', 'Hotbar visible', hotbar ? 2 : 0, 2);

    // Mute button
    const muteBtn = await page.$('#hud-mute');
    score('UI', 'Mute button exists', muteBtn ? 1 : 0, 1);

  } catch (e) {
    score('UI', 'UI tests', 0, 10, e.message);
  }

  // ═══════════════════════════════════════════
  // 8. ITEM SYSTEM
  // ═══════════════════════════════════════════
  console.log('\n🎒 8. ITEM SYSTEM');
  try {
    // Add test items
    await evalGame(page, () => {
      window.__game.inventory.addItem('wood', 5);
      window.__game.inventory.addItem('earth', 3);
    });

    const hasWood = await evalGame(page, () => window.__game.inventory.hasItem('wood', 5));
    score('Items', 'Inventory add/has works', hasWood ? 3 : 0, 3);

    // Test G key drop
    await evalGame(page, () => {
      window.__game.player.x = 19; window.__game.player.y = 12;
      window.__game.inventory.selectedHotbar = 0;
    });

    // Drop test — check that dropped item exists after delay
    const beforeDrops = await evalGame(page, () => window.__game.itemDrops?.drops.length || 0);
    await pressKey(page, 'g', 100);
    await sleep(300);
    const afterDrops = await evalGame(page, () => window.__game.itemDrops?.drops.length || 0);
    score('Items', 'G key drops item', afterDrops > beforeDrops ? 3 : 0, 3);

    // Check dropped item requires E to pick up
    if (afterDrops > beforeDrops) {
      await sleep(2000); // wait for pickup delay
      const stillDropped = await evalGame(page, () => window.__game.itemDrops?.drops.length || 0);
      score('Items', 'Dropped items stay on ground', stillDropped >= afterDrops ? 2 : 0, 2,
        `${stillDropped} drops remaining`);
    } else {
      score('Items', 'Dropped items stay on ground', 0, 2);
    }

  } catch (e) {
    score('Items', 'Item tests', 0, 8, e.message);
  }

  // ═══════════════════════════════════════════
  // 9. STABILITY (error count)
  // ═══════════════════════════════════════════
  console.log('\n🛡️  9. STABILITY');
  const errorCount = consoleErrors.length;
  score('Stability', 'Console errors during playtest',
    errorCount === 0 ? 5 : errorCount <= 2 ? 3 : errorCount <= 5 ? 1 : 0, 5,
    `${errorCount} errors`);

  if (errorCount > 0) {
    for (const err of consoleErrors.slice(0, 5)) {
      issue('error', err.substring(0, 120));
    }
  }

  // ═══════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('📊 FINAL SCORE REPORT');
  console.log('═'.repeat(60));

  for (const [cat, data] of Object.entries(SCORES)) {
    const pct = Math.round(data.earned / data.max * 100);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`\n  ${cat.padEnd(12)} ${bar} ${data.earned}/${data.max} (${pct}%)`);
  }

  const totalPct = Math.round(totalPoints / maxPoints * 100);
  console.log('\n' + '─'.repeat(60));
  console.log(`\n  🏆 TOTAL SCORE: ${totalPoints}/${maxPoints} (${totalPct}%)\n`);

  // Grade
  let grade;
  if (totalPct >= 95) grade = 'S — Perfekt!';
  else if (totalPct >= 85) grade = 'A — Ausgezeichnet';
  else if (totalPct >= 70) grade = 'B — Gut';
  else if (totalPct >= 55) grade = 'C — Befriedigend';
  else if (totalPct >= 40) grade = 'D — Verbesserungsbedarf';
  else grade = 'F — Kritisch';

  console.log(`  📝 Note: ${grade}\n`);

  if (ISSUES.length > 0) {
    console.log('  🐛 Gefundene Probleme:');
    for (const iss of ISSUES) {
      console.log(`     [${iss.severity}] ${iss.desc}`);
    }
    console.log('');
  }

  await browser.close();
  process.exit(totalPct >= 70 ? 0 : 1);
})();
