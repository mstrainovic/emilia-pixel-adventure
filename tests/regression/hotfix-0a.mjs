import { startServer, launchBrowser, startNewGame, check, finish } from './harness.mjs';

const server = await startServer();
const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  await startNewGame(page, server.url);

  await check('Emilia bleibt nach Treffern sichtbar', async () => {
    for (let i = 0; i < 12; i++) {
      await page.evaluate(() => {
        const p = window.__game.player;
        p.hp = p.maxHp ?? 100;
        p.invulnTimer = 0;
        p.takeDamage(1);
      });
      await page.waitForTimeout(1500);
    }
    const visible = await page.evaluate(() => window.__game.player.activeSprite.mesh.visible);
    if (visible !== true) throw new Error('Emilia ist nach den Treffern unsichtbar geblieben');
  });
} finally {
  await browser.close();
  await server.close();
}
finish();
