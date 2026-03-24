const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');
async function w(p, ms) { await p.waitForTimeout(ms); }
async function gs(p) { return p.evaluate(() => { const g=window.__game; if(!g?.player)return null; return{px:g.player.x,py:g.player.y,hp:g.player.hp,maxHp:g.player.maxHp,scene:g.sceneManager?.currentScene,level:g.progression?.level,xp:g.progression?.xp,totalXp:g.progression?.totalXp,xpToNext:g.progression?.xpToNext,bonusHp:g.progression?.bonusMaxHp,activeQuest:g.progression?.getActiveQuest(),completedQuests:Object.keys(g.progression?.completedQuests||{}),plantsHealed:g.progression?.stats?.plantsHealed||0,invItems:g.inventory?.slots?.filter(s=>s.itemId).map(s=>s.itemId+':'+s.count)||[]}; }); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await w(page, 2000);
  await page.click('#mm-start');
  for (let i = 0; i < 30; i++) { if (await page.evaluate(() => window.__game?.running)) break; await w(page, 400); }
  await w(page, 1500);

  let s = await gs(page);
  console.log(`START: Lv${s.level}, HP ${s.hp}/${s.maxHp}, Quest: ${s.activeQuest?.name}`);

  // === QUEST 1: Talk to Mama ===
  console.log('\n=== QUEST: Erste Schritte ===');
  await page.evaluate(() => { const g=window.__game; g.progression.reportTalk('mama_tanja'); });
  await w(page, 200);
  s = await gs(page);
  console.log(`Quest done: ${s.completedQuests.join(',')}, Lv${s.level}, XP ${s.xp}/${s.xpToNext}`);

  // === COMBAT: Kill mobs in forest for XP ===
  console.log('\n=== FOREST COMBAT ===');
  await page.evaluate(() => window.__game.sceneManager.transition('forest', 25, 37));
  await w(page, 3000);

  // Kill mobs via game's own combat logic
  for (let round = 0; round < 8; round++) {
    const killed = await page.evaluate(() => {
      const g = window.__game;
      const kills = [];
      for (const mob of g.mobs) {
        if (!mob.alive) continue;
        // Teleport player next to mob and trigger attack
        g.player.x = mob.x;
        g.player.y = mob.y - 1.2;
        g.player.direction = 'down';
        // Simulate one attack hit
        const weapon = g.player.inventory?.getSelectedItem();
        const baseDmg = weapon?.damage || 10;
        const dmgMult = g.progression?.getDamageMultiplier() || 1.0;
        const dmg = Math.round(baseDmg * dmgMult);
        mob.takeDamage(dmg);
        if (!mob.alive) {
          // Grant XP exactly like Game.js combat loop
          const xp = mob.def?.xp || 10;
          g.progression.addXp(xp);
          g.progression.reportKill(mob.mobType);
          if (g.itemDrops) g.itemDrops.spawnMobDrops(mob.drops, mob.x, mob.y);
          kills.push({type: mob.mobType, xp});
        }
      }
      return kills;
    });
    if (killed.length > 0) console.log(`  Round ${round+1}: Killed ${killed.map(k=>k.type+'(+'+k.xp+'xp)').join(', ')}`);
    
    s = await gs(page);
    console.log(`  Lv${s.level}, XP ${s.xp}/${s.xpToNext}, TotalXP ${s.totalXp}, HP ${s.hp}/${s.maxHp}`);
    if (s.level >= 4) { console.log('  >>> LEVEL 4 REACHED! <<<'); break; }
    
    // Wait for mob respawn (10s in game, but we can speed up)
    await page.evaluate(() => { for (const m of window.__game.mobs) { if (!m.alive && m.aiState==='respawning') m.respawnTimer=0; } });
    await w(page, 500);
  }

  // === RESOURCES ===
  console.log('\n=== RESOURCE GATHERING ===');
  const resXpBefore = (await gs(page)).totalXp;
  await page.evaluate(() => {
    const g = window.__game;
    if (g.resources) {
      for (const node of g.resources.nodes) {
        if (!node.depleted) {
          node.currentHits = node.hitsNeeded; // instant gather
          const prog = g.progression;
          if (prog) { prog.addXp(3); prog.reportCollect(node.lootId, 1); }
          node.depleted = true; node.respawnTimer = 10;
        }
      }
    }
  });
  await w(page, 200);
  s = await gs(page);
  console.log(`  Resources gathered: +${s.totalXp - resXpBefore} XP, Lv${s.level}`);

  // === PLANT HEALING ===
  console.log('\n=== PLANT HEALING (Hub) ===');
  await page.evaluate(() => window.__game.sceneManager.transition('hub', 10, 15));
  await w(page, 3000);
  const plantXpBefore = (await gs(page)).totalXp;
  const plantsResult = await page.evaluate(() => {
    const g = window.__game;
    let healed = 0;
    if (g.plantHealing?.plants) {
      for (const plant of g.plantHealing.plants) {
        if (!plant.isHealed) { plant.isHealed = true; g.progression.addXp(10); g.progression.reportHeal(); healed++; }
      }
    }
    return healed;
  });
  await w(page, 200);
  s = await gs(page);
  console.log(`  Plants healed: ${plantsResult}, +${s.totalXp - plantXpBefore} XP, Lv${s.level}`);

  // === CRAFTING ===
  console.log('\n=== CRAFTING ===');
  const craftBefore = (await gs(page)).totalXp;
  await page.evaluate(() => { window.__game.progression.addXp(5); window.__game.progression.reportCraft(); });
  await w(page, 200);
  s = await gs(page);
  console.log(`  Craft XP: +${s.totalXp - craftBefore}, Lv${s.level}`);

  // === STAT CHECK ===
  console.log('\n=== STAT SCALING ===');
  s = await gs(page);
  console.log(`  Level ${s.level}: MaxHP ${s.maxHp} (+${s.bonusHp})`);
  console.log(`  Quests: ${s.completedQuests.join(', ')}`);
  console.log(`  Active: ${s.activeQuest?.name || 'none'} (${s.activeQuest?.progress || 0}/${s.activeQuest?.count || '?'})`);
  console.log(`  Inventory: ${s.invItems.join(', ')}`);

  // === FINAL ===
  console.log('\n========================================');
  console.log(`  FINAL: Lv${s.level}, TotalXP ${s.totalXp}, HP ${s.hp}/${s.maxHp}`);
  console.log(`  Quests done: ${s.completedQuests.length}`);
  console.log('========================================');

  await browser.close();
})();
