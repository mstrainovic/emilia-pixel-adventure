const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.click('#mm-start');
  for (let i = 0; i < 30; i++) { if (await page.evaluate(() => window.__game?.running)) break; await page.waitForTimeout(400); }
  await page.waitForTimeout(1500);

  // Go to forest
  await page.evaluate(() => window.__game.sceneManager.transition('forest', 10, 26));
  await page.waitForTimeout(3000);

  // Check mob state
  const mobInfo = await page.evaluate(() => {
    const g = window.__game;
    return g.mobs.map(m => ({type: m.mobType, x: m.x.toFixed(1), y: m.y.toFixed(1), hp: m.hp, alive: m.alive, dist: Math.sqrt((m.x-g.player.x)**2+(m.y-g.player.y)**2).toFixed(1)}));
  });
  console.log('Mobs:', JSON.stringify(mobInfo, null, 2));

  // Try pressing Space via keyboard.down/up (not press)
  console.log('\nAttempt 1: keyboard.down + delay + up');
  await page.keyboard.down('Space');
  await page.waitForTimeout(100);
  await page.keyboard.up('Space');
  await page.waitForTimeout(300);
  let combatState = await page.evaluate(() => ({
    isAttacking: window.__game.combat.isAttacking,
    cooldown: window.__game.combat.attackCooldown,
    playerState: window.__game.player.state,
  }));
  console.log('Combat state after Space:', combatState);

  // Try direct attack via JS
  console.log('\nAttempt 2: Direct JS combat trigger');
  const directResult = await page.evaluate(() => {
    const g = window.__game;
    const mob = g.mobs.find(m => m.alive);
    if (!mob) return 'No alive mobs';
    const dist = Math.sqrt((mob.x - g.player.x)**2 + (mob.y - g.player.y)**2);
    const hpBefore = mob.hp;
    mob.takeDamage(15);
    return {mob: mob.mobType, dist: dist.toFixed(1), hpBefore, hpAfter: mob.hp, alive: mob.alive};
  });
  console.log('Direct damage result:', directResult);

  // Check if XP was granted
  const prog = await page.evaluate(() => ({
    level: window.__game.progression.level,
    xp: window.__game.progression.xp,
    totalXp: window.__game.progression.totalXp,
  }));
  console.log('Progression:', prog);

  // Now try killing a mob directly and checking XP
  console.log('\nAttempt 3: Kill mob directly + check XP');
  const beforeXP = await page.evaluate(() => window.__game.progression.totalXp);
  const killResult = await page.evaluate(() => {
    const g = window.__game;
    const mob = g.mobs.find(m => m.alive);
    if (!mob) return 'No alive mobs';
    const hpBefore = mob.hp;
    mob.hp = 0;
    const drops = mob.die();
    return {mob: mob.mobType, hpBefore, xpValue: mob.def?.xp, alive: mob.alive, drops: JSON.stringify(drops)};
  });
  console.log('Kill result:', killResult);
  // Wait a frame for game loop to process
  await page.waitForTimeout(200);
  const afterXP = await page.evaluate(() => window.__game.progression.totalXp);
  console.log(`XP before kill: ${beforeXP}, after: ${afterXP}, gained: ${afterXP - beforeXP}`);
  console.log('NOTE: XP is granted in Game.js combat loop, not in mob.die(). Direct kill bypasses it.');

  await browser.close();
})();
