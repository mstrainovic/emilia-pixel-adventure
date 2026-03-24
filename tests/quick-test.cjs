const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5175/emilia-pixel-adventure/';

async function waitMs(page, ms) { await page.waitForTimeout(ms); }

async function getState(page) {
  return page.evaluate(() => {
    const g = window.__game;
    if (!g?.player) return null;
    return {
      px: g.player.x, py: g.player.y, hp: g.player.hp, maxHp: g.player.maxHp,
      state: g.player.state, scene: g.sceneManager?.currentScene,
      transitioning: g.sceneManager?.transitioning,
      mobCount: g.mobs?.length || 0, npcCount: g.npcs?.length || 0,
      dialogOpen: g.dialog?.isActive, craftingOpen: g.crafting?.isActive,
      invUsed: g.inventory?.slots?.filter(s => s.itemId).length || 0,
      running: g.running, alive: g.player.state !== 'dead',
      unicornCount: g.unicorns?.length || 0,
    };
  });
}

async function teleport(page, x, y) {
  await page.evaluate(([tx, ty]) => {
    const g = window.__game;
    if (g?.player) { g.player.x = tx; g.player.y = ty; }
  }, [x, y]);
  await waitMs(page, 100);
}

async function triggerTransition(page, target, sx, sy) {
  await page.evaluate(([t, x, y]) => {
    window.__game.sceneManager.transition(t, x, y);
  }, [target, sx, sy]);
  for (let i = 0; i < 30; i++) {
    await waitMs(page, 200);
    const s = await getState(page);
    if (s && !s.transitioning && s.scene === target) return true;
  }
  return false;
}

const results = [];
function log(test, pass, detail = '') {
  const icon = pass ? 'PASS' : 'FAIL';
  results.push({ test, pass, detail });
  console.log(`  [${icon}] ${test}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  console.log('\n=== Emilia Pixel Adventure — Schnelltest ===\n');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('[console.error] ' + msg.text());
  });

  try {
    // 1. Laden
    console.log('1. Spiel laden...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await waitMs(page, 2000);
    log('Seite geladen', true);

    // 2. Main Menu — "Neues Spiel" klicken
    console.log('2. Main Menu...');
    const newGameBtn = await page.$('text=Neues Spiel');
    log('Main Menu sichtbar', !!newGameBtn);
    if (newGameBtn) await newGameBtn.click();
    await waitMs(page, 3000);

    // 3. Spielzustand prüfen
    console.log('3. Spielzustand...');
    let state = await getState(page);
    log('Game Loop aktiv', state?.running === true);
    log('Spieler existiert', state?.px !== undefined);
    log('Hub-Szene geladen', state?.scene === 'hub', `scene=${state?.scene}`);
    log('NPCs vorhanden', state?.npcCount > 0, `count=${state?.npcCount}`);
    log('Spieler hat HP', state?.hp > 0, `hp=${state?.hp}/${state?.maxHp}`);
    log('Inventar hat Schwert', state?.invUsed > 0, `slots=${state?.invUsed}`);

    // 4. Bewegung testen (WASD)
    console.log('4. Bewegung...');
    const startX = state?.px;
    const startY = state?.py;
    await page.keyboard.down('KeyD');
    await waitMs(page, 500);
    await page.keyboard.up('KeyD');
    await waitMs(page, 100);
    state = await getState(page);
    log('Bewegung rechts', state?.px > startX, `dx=${(state?.px - startX).toFixed(2)}`);

    await page.keyboard.down('KeyS');
    await waitMs(page, 500);
    await page.keyboard.up('KeyS');
    await waitMs(page, 100);
    state = await getState(page);
    log('Bewegung unten', state?.py > startY, `dy=${(state?.py - startY).toFixed(2)}`);

    // 5. NPC-Dialog testen
    console.log('5. NPC-Dialog...');
    // Teleport zu Mama Tanja (8, 8)
    await teleport(page, 8, 8);
    await waitMs(page, 300);
    await page.keyboard.down('KeyE');
    await waitMs(page, 150);
    await page.keyboard.up('KeyE');
    await waitMs(page, 500);
    state = await getState(page);
    log('Dialog geöffnet', state?.dialogOpen === true);

    // Dialog schließen (mehrfach klicken)
    for (let i = 0; i < 5; i++) {
      await page.click('body');
      await waitMs(page, 400);
    }
    state = await getState(page);
    log('Dialog geschlossen', state?.dialogOpen !== true);

    // 6. Szenen-Wechsel: Forest
    console.log('6. Szenen-Wechsel...');
    const forestOk = await triggerTransition(page, 'forest', 5, 5);
    state = await getState(page);
    log('Forest geladen', state?.scene === 'forest', `scene=${state?.scene}`);
    log('Mobs im Forest', state?.mobCount > 0, `count=${state?.mobCount}`);

    // 7. Kampf testen
    console.log('7. Kampf...');
    // Finde erstes Mob und teleportiere hin
    const mobPos = await page.evaluate(() => {
      const g = window.__game;
      const m = g.mobs.find(m => m.alive);
      return m ? { x: m.x, y: m.y, hp: m.hp } : null;
    });
    if (mobPos) {
      await teleport(page, mobPos.x, mobPos.y - 1);
      await waitMs(page, 200);
      // Angriff mit Space
      await page.keyboard.down('Space');
      await waitMs(page, 100);
      await page.keyboard.up('Space');
      await waitMs(page, 500);
      const mobHpAfter = await page.evaluate(() => {
        const g = window.__game;
        const m = g.mobs[0];
        return m ? m.hp : -1;
      });
      log('Angriff trifft Mob', mobPos.hp !== undefined && mobHpAfter < mobPos.hp, `hp: ${mobPos.hp} → ${mobHpAfter}`);
    } else {
      log('Angriff trifft Mob', false, 'Kein Mob gefunden');
    }

    // 8. Dungeon testen
    console.log('8. Dungeon...');
    const dungeonOk = await triggerTransition(page, 'dungeon', 17, 25);
    state = await getState(page);
    log('Dungeon geladen', state?.scene === 'dungeon', `scene=${state?.scene}`);

    // 9. See testen
    console.log('9. See...');
    const lakeOk = await triggerTransition(page, 'lake', 10, 10);
    state = await getState(page);
    log('See geladen', state?.scene === 'lake', `scene=${state?.scene}`);

    // 10. Unicorn Meadow testen
    console.log('10. Unicorn Meadow...');
    const meadowOk = await triggerTransition(page, 'unicorn_meadow', 12, 10);
    state = await getState(page);
    log('Wiese geladen', state?.scene === 'unicorn_meadow', `scene=${state?.scene}`);
    log('Einhörner spawnen', state?.unicornCount > 0, `count=${state?.unicornCount}`);

    // 11. Zurück zum Hub
    console.log('11. Hub-Rückkehr...');
    const hubOk = await triggerTransition(page, 'hub', 20, 15);
    state = await getState(page);
    log('Hub zurück geladen', state?.scene === 'hub');
    log('Spieler lebt noch', state?.alive === true, `hp=${state?.hp}`);

    // 12. Konsolen-Fehler
    console.log('12. Fehler-Check...');
    const criticalErrors = errors.filter(e => !e.includes('404') && !e.includes('favicon'));
    log('Keine kritischen JS-Fehler', criticalErrors.length === 0,
      criticalErrors.length > 0 ? criticalErrors.slice(0, 3).join(' | ') : '');

    // Screenshot
    await page.screenshot({ path: 'tests/quick-test-result.png', fullPage: false });
    log('Screenshot gespeichert', true, 'tests/quick-test-result.png');

  } catch (err) {
    console.error('TEST-FEHLER:', err.message);
    log('Test-Durchlauf', false, err.message);
  }

  // Zusammenfassung
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`ERGEBNIS: ${passed} bestanden, ${failed} fehlgeschlagen von ${results.length}`);
  console.log(`${'='.repeat(50)}\n`);

  if (failed > 0) {
    console.log('Fehlgeschlagene Tests:');
    results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.test}: ${r.detail}`));
  }

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
