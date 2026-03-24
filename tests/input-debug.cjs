const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.click('#mm-start');
  for (let i = 0; i < 30; i++) { if (await page.evaluate(() => window.__game?.running)) break; await page.waitForTimeout(400); }
  await page.waitForTimeout(1500);

  // Test if Space justPressed works
  console.log('Test 1: Check justPressed before pressing');
  let jp1 = await page.evaluate(() => window.__game.input._justPressed['Space']);
  console.log('  _justPressed[Space] =', jp1);

  console.log('Test 2: keyboard.down(Space)');
  await page.keyboard.down('Space');
  await page.waitForTimeout(50);
  let jp2 = await page.evaluate(() => ({
    justPressed: window.__game.input._justPressed['Space'],
    isKeyDown: window.__game.input.keys['Space'],
    consumed: window.__game.input._consumed['Space'],
  }));
  console.log('  State:', jp2);
  await page.keyboard.up('Space');
  await page.waitForTimeout(50);

  console.log('Test 3: After keyup');
  let jp3 = await page.evaluate(() => ({
    justPressed: window.__game.input._justPressed['Space'],
    isKeyDown: window.__game.input.keys['Space'],
  }));
  console.log('  State:', jp3);

  console.log('Test 4: Wait one frame then check consumed');
  await page.waitForTimeout(50);
  let jp4 = await page.evaluate(() => ({
    justPressed: window.__game.input._justPressed['Space'],
    consumed: window.__game.input._consumed['Space'],
  }));
  console.log('  State:', jp4);

  console.log('Test 5: Try combat trigger via evaluate');
  await page.evaluate(() => {
    const g = window.__game;
    g.input._justPressed['Space'] = true;
    g.input._consumed['Space'] = false;
  });
  await page.waitForTimeout(100);
  let combatState = await page.evaluate(() => ({
    isAttacking: window.__game.combat.isAttacking,
    playerState: window.__game.player.state,
    cooldown: window.__game.combat.attackCooldown,
  }));
  console.log('  Combat after injecting Space:', combatState);

  await browser.close();
})();
