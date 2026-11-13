import { readFileSync } from 'node:fs';
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

  await check('Gegner kommen erst nach 3 Minuten wieder', async () => {
    const seen = {};
    for (const id of ['beach', 'grotto']) {
      await page.evaluate((sceneId) => {
        const g = window.__game;
        const spawn = g.mapGenerators[sceneId]().playerSpawn;
        g.sceneManager.transition(sceneId, spawn.x, spawn.y);
      }, id);
      await page.waitForFunction(
        (sceneId) => window.__game.sceneManager.currentScene === sceneId && window.__game.sceneManager.transitioning === false,
        id,
        { timeout: 60000 },
      );
      await page.waitForTimeout(3000);
      const names = await page.evaluate(() => {
        const wanted = ['Crab', 'Jellyfish', 'Octopus', 'GhostCrab'];
        const found = new Set(window.__game.mobs.map((m) => m.constructor.name));
        return wanted.filter((n) => found.has(n));
      });
      for (const name of names) {
        if (seen[name] !== undefined) continue;
        // GhostCrab ist in der Geisterphase unverwundbar: so lange erneut treffen, bis er faellt.
        await page.waitForFunction(
          (n) => {
            const same = window.__game.mobs.filter((m) => m.constructor.name === n);
            if (same.some((m) => m.aiState === 'respawning')) return true;
            for (const m of same) if (m.alive) m.takeDamage(99999);
            return false;
          },
          name,
          { timeout: 60000 },
        );
        seen[name] = await page.evaluate(
          (n) => window.__game.mobs.find((m) => m.constructor.name === n && m.aiState === 'respawning').respawnTimer,
          name,
        );
      }
    }
    console.log('  Beobachtete respawnTimer:', JSON.stringify(seen));
    const classes = Object.keys(seen).sort().join(',');
    if (classes !== 'Crab,GhostCrab,Jellyfish,Octopus') throw new Error(`Geprueft wurden nur: ${classes}`);
    for (const [name, t] of Object.entries(seen)) {
      if (!(t > 100)) throw new Error(`${name}: respawnTimer ist ${t}, erwartet > 100`);
    }
  });

  const SAVE_KEY = 'emilia_pixel_adventure_save';
  const SAVE_TEXT = '{"version":3,"timestamp":1,"player":{"hp":100,"scene":"hub","x":20,"y":15},"inventory":[]}';

  await check('Sicherung lädt den gespeicherten Stand herunter', async () => {
    const ctx = await browser.newContext({ acceptDownloads: true });
    try {
      const p = await ctx.newPage();
      await p.addInitScript(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, SAVE_TEXT]);
      await p.goto(server.url);
      const btn = p.locator('#mm-export');
      await btn.waitFor({ state: 'visible', timeout: 60000 });
      const [download] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), btn.click()]);
      const name = download.suggestedFilename();
      if (!/^emilia-spielstand-\d{4}-\d{2}-\d{2}\.json$/.test(name)) throw new Error(`Unerwarteter Dateiname: ${name}`);
      const content = readFileSync(await download.path(), 'utf8');
      if (content !== SAVE_TEXT) throw new Error(`Inhalt weicht ab: ${content}`);
    } finally {
      await ctx.close();
    }
  });

  await check('Ohne Spielstand kein Knopf', async () => {
    const ctx = await browser.newContext({ acceptDownloads: true });
    try {
      const p = await ctx.newPage();
      await p.goto(server.url);
      await p.locator('#mm-start').waitFor({ state: 'visible', timeout: 60000 });
      if (await p.locator('#mm-export').isVisible()) throw new Error('#mm-export ist ohne Spielstand sichtbar');
    } finally {
      await ctx.close();
    }
  });

  await check('Verschwundener Stand löst nichts aus', async () => {
    const ctx = await browser.newContext({ acceptDownloads: true });
    try {
      const p = await ctx.newPage();
      const errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      await p.addInitScript(([k, v]) => localStorage.setItem(k, v), [SAVE_KEY, SAVE_TEXT]);
      await p.goto(server.url);
      const btn = p.locator('#mm-export');
      await btn.waitFor({ state: 'visible', timeout: 60000 });
      await p.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);
      const downloadEvent = p.waitForEvent('download', { timeout: 1000 }).then(() => true, () => false);
      await btn.click();
      if (await downloadEvent) throw new Error('Es gab einen Download, obwohl kein Stand mehr da war');
      if (errors.length) throw new Error(`pageerror: ${errors.join(' | ')}`);
    } finally {
      await ctx.close();
    }
  });
} finally {
  await browser.close();
  await server.close();
}
finish();
