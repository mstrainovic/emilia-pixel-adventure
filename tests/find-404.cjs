const { chromium } = require('D:/Claude_Projekte/Emilia_Spiel/.claude/skills/playwright-skill/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const notFound = [];
  page.on('response', res => {
    if (res.status() === 404) notFound.push(res.url());
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.click('#mm-start');

  for (let i = 0; i < 30; i++) {
    const ready = await page.evaluate(() => window.__game?.running === true);
    if (ready) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(5000);

  console.log('404 errors found: ' + notFound.length);
  notFound.forEach(u => console.log('  ' + u));

  await browser.close();
})();
