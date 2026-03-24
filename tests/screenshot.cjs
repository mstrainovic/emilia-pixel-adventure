const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const shotDir = 'C:/Users/Tanja/AppData/Local/Temp';

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.click('#mm-start');
  for (let i = 0; i < 40; i++) {
    if (await page.evaluate(() => window.__game?.running === true)) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: shotDir + '/rework_hub.png' });
  console.log('Hub screenshot saved');

  // Move around to show player
  await page.keyboard.down('KeyD'); await page.waitForTimeout(500); await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyS'); await page.waitForTimeout(500); await page.keyboard.up('KeyS');
  await page.waitForTimeout(500);
  await page.screenshot({ path: shotDir + '/rework_hub_moving.png' });
  console.log('Hub moving screenshot saved');

  // Transition to forest
  await page.evaluate(() => window.__game.sceneManager.transition('forest', 25, 20));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: shotDir + '/rework_forest.png' });
  console.log('Forest screenshot saved');

  // Lake
  await page.evaluate(() => window.__game.sceneManager.transition('lake', 21, 4));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: shotDir + '/rework_lake.png' });
  console.log('Lake screenshot saved');

  // Unicorn meadow
  await page.evaluate(() => window.__game.sceneManager.transition('unicorn_meadow', 12, 10));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: shotDir + '/rework_meadow.png' });
  console.log('Meadow screenshot saved');

  await browser.close();
})();
