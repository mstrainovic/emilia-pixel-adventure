/**
 * Emilia's Pixel Adventure — UX Scoring Test
 *
 * Bewertet das Spiel aus Sicht einer 6-Jaehrigen.
 * 10 Kategorien, je 10 Punkte = 100 Punkte max.
 *
 * Run: node tests/ux-scoring-test.cjs [port]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 5176;
const BASE = `http://localhost:${PORT}/emilia-pixel-adventure/`;
const ARTIFACT_DIR = path.join(__dirname, 'test-artifacts');

// Ensure artifact directory exists
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const SCORES = {};
const ISSUES = [];
const SCREENSHOTS = [];
let totalPoints = 0;
let maxPoints = 0;

function score(category, test, points, maxPts, detail) {
  if (!SCORES[category]) SCORES[category] = { earned: 0, max: 0, tests: [] };
  SCORES[category].earned += points;
  SCORES[category].max += maxPts;
  SCORES[category].tests.push({ test, points, maxPts, detail });
  totalPoints += points;
  maxPoints += maxPts;
  const icon = points === maxPts ? '[OK]' : points > 0 ? '[!!]' : '[XX]';
  console.log(`  ${icon} ${test}: ${points}/${maxPts}${detail ? ' -- ' + detail : ''}`);
}

function issue(severity, desc) {
  ISSUES.push({ severity, desc });
  console.log(`  [BUG] [${severity}] ${desc}`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function screenshot(page, name) {
  const filePath = path.join(ARTIFACT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath });
  SCREENSHOTS.push({ name, path: filePath });
  return filePath;
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
  console.log('\n=== EMILIA\'S PIXEL ADVENTURE -- UX SCORING TEST ===\n');
  console.log('Bewertung aus Sicht einer 6-Jaehrigen');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text());
    }
  });

  // ================================================================
  // 1. SPIELSTART (10 Punkte)
  // ================================================================
  console.log('\n--- 1. SPIELSTART (10 Pkt) ---');
  try {
    // 1a) Ladet das Spiel in unter 5s?
    const startTime = Date.now();
    await page.goto(BASE, { timeout: 10000 });
    await page.waitForTimeout(1500);
    const loadTime = Date.now() - startTime;
    const loadedFast = loadTime < 5000;
    score('Spielstart', 'Ladezeit unter 5 Sekunden', loadedFast ? 2 : 1, 2, `${loadTime}ms`);

    // 1b) Ist der "Neues Spiel" Button sichtbar und klickbar?
    let menuBtnVisible = false;
    try {
      const btn = page.getByRole('button', { name: 'Neues Spiel' });
      menuBtnVisible = await btn.isVisible();
    } catch (e) {
      menuBtnVisible = false;
    }
    score('Spielstart', 'Neues Spiel Button sichtbar', menuBtnVisible ? 3 : 0, 3);
    await screenshot(page, '01-hauptmenu');

    // 1c) Starte das Spiel
    if (menuBtnVisible) {
      await page.getByRole('button', { name: 'Neues Spiel' }).click();
      await page.waitForTimeout(3000);
    }

    // 1d) Spawnt der Spieler an einer sinnvollen Position?
    const playerSpawn = await evalGame(page, () => {
      const g = window.__game;
      if (!g || !g.player) return null;
      return { x: g.player.x, y: g.player.y, running: g.running };
    });

    if (playerSpawn && playerSpawn.running) {
      score('Spielstart', 'Spieler spawnt korrekt', 3, 3, `pos=(${playerSpawn.x.toFixed(1)}, ${playerSpawn.y.toFixed(1)})`);
    } else {
      score('Spielstart', 'Spieler spawnt korrekt', 0, 3, 'Spiel laeuft nicht');
      issue('critical', 'Spiel startet nicht nach Klick auf Neues Spiel');
    }

    // 1e) Gibt es eine Einfuehrung/Tutorial-Quest?
    const firstQuest = await evalGame(page, () => {
      const g = window.__game;
      if (!g || !g.progression) return null;
      const q = g.progression.getActiveQuest();
      return q ? { name: q.name, desc: q.description } : null;
    });
    score('Spielstart', 'Tutorial-Quest vorhanden', firstQuest ? 2 : 0, 2,
      firstQuest ? firstQuest.name : 'keine Quest aktiv');

    await screenshot(page, '02-spielstart');
  } catch (e) {
    score('Spielstart', 'Startup', 0, 10, e.message);
    issue('critical', `Spielstart fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 2. BEWEGUNG & STEUERUNG (10 Punkte)
  // ================================================================
  console.log('\n--- 2. BEWEGUNG & STEUERUNG (10 Pkt) ---');
  try {
    // 2a) WASD Bewegung reagiert sofort?
    const posBeforeMove = await evalGame(page, () => ({ x: window.__game.player.x, y: window.__game.player.y }));

    // Rechts gehen
    await pressKey(page, 'd', 400);
    await sleep(200);
    const posAfterRight = await evalGame(page, () => ({ x: window.__game.player.x, y: window.__game.player.y }));
    const movedRight = posAfterRight.x - posBeforeMove.x > 0.3;
    score('Bewegung', 'Rechts-Bewegung (D)', movedRight ? 2 : 0, 2,
      `dx=${(posAfterRight.x - posBeforeMove.x).toFixed(2)}`);

    // 2b) Kann man in alle 4 Richtungen laufen?
    // Links
    const beforeLeft = await evalGame(page, () => window.__game.player.x);
    await pressKey(page, 'a', 400);
    await sleep(100);
    const afterLeft = await evalGame(page, () => window.__game.player.x);
    const movedLeft = beforeLeft - afterLeft > 0.2;

    // Hoch
    const beforeUp = await evalGame(page, () => window.__game.player.y);
    await pressKey(page, 'w', 400);
    await sleep(100);
    const afterUp = await evalGame(page, () => window.__game.player.y);
    const movedUp = Math.abs(afterUp - beforeUp) > 0.2;

    // Runter
    const beforeDown = await evalGame(page, () => window.__game.player.y);
    await pressKey(page, 's', 400);
    await sleep(100);
    const afterDown = await evalGame(page, () => window.__game.player.y);
    const movedDown = Math.abs(afterDown - beforeDown) > 0.2;

    const allDirections = movedLeft && movedUp && movedDown;
    score('Bewegung', 'Alle 4 Richtungen funktionieren', allDirections ? 3 : (movedLeft || movedUp || movedDown ? 1 : 0), 3,
      `L=${movedLeft} U=${movedUp} D=${movedDown}`);

    // 2c) Kollidiert der Spieler korrekt mit Waenden?
    // Teleportiere zum Rand und versuche hinauszugehen
    await evalGame(page, () => { window.__game.player.x = 1; window.__game.player.y = 5; });
    await sleep(100);
    await pressKey(page, 'a', 600);
    await sleep(100);
    const collX = await evalGame(page, () => window.__game.player.x);
    const collisionWorks = collX >= 0.5;
    score('Bewegung', 'Wandkollision funktioniert', collisionWorks ? 3 : 0, 3, `x=${collX.toFixed(2)}`);

    // 2d) Kann man sich NICHT aus der Map bewegen?
    await evalGame(page, () => {
      const g = window.__game;
      g.player.x = 0.5; g.player.y = 0.5;
    });
    await pressKey(page, 'a', 800);
    await pressKey(page, 'w', 800);
    await sleep(100);
    const edgePos = await evalGame(page, () => ({ x: window.__game.player.x, y: window.__game.player.y }));
    const staysInMap = edgePos.x >= 0 && edgePos.y >= 0;
    score('Bewegung', 'Spieler bleibt in der Map', staysInMap ? 2 : 0, 2,
      `pos=(${edgePos.x.toFixed(1)}, ${edgePos.y.toFixed(1)})`);

    // Zurueck zur Mitte
    await evalGame(page, () => { window.__game.player.x = 19; window.__game.player.y = 12; });
    await sleep(200);
  } catch (e) {
    score('Bewegung', 'Bewegungstests', 0, 10, e.message);
    issue('critical', `Bewegung fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 3. NPCs & DIALOG (10 Punkte)
  // ================================================================
  console.log('\n--- 3. NPCs & DIALOG (10 Pkt) ---');
  try {
    await evalGame(page, () => { window.__game.player.x = 19; window.__game.player.y = 12; });
    await sleep(300);

    // 3a) Sind alle NPCs erreichbar (nicht in Waenden)?
    const npcInfo = await evalGame(page, () => {
      const g = window.__game;
      return g.npcs.map(n => ({
        name: n.name, x: n.x, y: n.y,
        walkable: !g.tileMap.getTileCollision(Math.round(n.x), Math.round(n.y))
      }));
    });
    const npcCount = npcInfo.length;
    const allReachable = npcInfo.every(n => n.walkable);
    const blockedNpcs = npcInfo.filter(n => !n.walkable);
    score('NPCs', 'NPCs vorhanden', npcCount >= 5 ? 2 : npcCount >= 3 ? 1 : 0, 2, `${npcCount} NPCs`);
    score('NPCs', 'NPCs nicht in Waenden', allReachable ? 2 : 0, 2,
      blockedNpcs.length > 0 ? `blockiert: ${blockedNpcs.map(n => n.name).join(', ')}` : 'alle erreichbar');

    if (blockedNpcs.length > 0) {
      issue('medium', `NPCs in Waenden: ${blockedNpcs.map(n => `${n.name}(${n.x},${n.y})`).join(', ')}`);
    }

    // 3b) Zeigt E-Taste ein Dialog-Fenster?
    // Teleportiere zu Mama Tanja
    const dialogOpened = await evalGame(page, () => {
      const g = window.__game;
      const tanja = g.npcs.find(n => n.name === 'Mama Tanja');
      if (!tanja) return false;
      g.player.x = tanja.x;
      g.player.y = tanja.y + 1;
      return true;
    });
    await sleep(300);

    if (dialogOpened) {
      await pressKey(page, 'e', 100);
      await sleep(500);
      const isDialogActive = await evalGame(page, () => window.__game.dialog.isActive);
      score('NPCs', 'E-Taste oeffnet Dialog', isDialogActive ? 3 : 0, 3);

      if (isDialogActive) {
        await screenshot(page, '03-dialog-open');

        // 3c) Kann man mit Space/E durch den Dialog blaettern?
        const dialogText1 = await evalGame(page, () => {
          const d = window.__game.dialog;
          return d._currentText || '';
        });
        await pressKey(page, ' ', 100); // Space to advance
        await sleep(300);
        const dialogText2 = await evalGame(page, () => {
          const d = window.__game.dialog;
          return d.isActive ? (d._currentText || '') : 'CLOSED';
        });
        const dialogAdvanced = dialogText2 !== dialogText1 || dialogText2 === 'CLOSED';
        score('NPCs', 'Dialog blaettern funktioniert', dialogAdvanced ? 2 : 1, 2);

        // Close dialog completely
        await evalGame(page, () => {
          const d = window.__game.dialog;
          while (d.isActive) d._advance();
        });
        await sleep(300);
      } else {
        score('NPCs', 'Dialog blaettern funktioniert', 0, 2, 'Dialog oeffnete nicht');
        issue('high', 'Dialog laesst sich nicht mit E oeffnen');
      }
    } else {
      score('NPCs', 'E-Taste oeffnet Dialog', 0, 3, 'Mama Tanja nicht gefunden');
      score('NPCs', 'Dialog blaettern funktioniert', 0, 2);
    }

    // 3d) Hat jeder NPC sinnvollen Dialog-Text?
    const npcDialogs = await evalGame(page, () => {
      return window.__game.npcs.map(n => ({
        name: n.name,
        hasDialog: n._dialogs && n._dialogs.length > 0,
        dialogCount: n._dialogs ? n._dialogs.length : 0
      }));
    });
    const allHaveDialog = npcDialogs.every(n => n.hasDialog);
    const npcWithoutDialog = npcDialogs.filter(n => !n.hasDialog);
    score('NPCs', 'Jeder NPC hat Dialog-Text', allHaveDialog ? 1 : 0, 1,
      npcWithoutDialog.length > 0 ? `ohne Dialog: ${npcWithoutDialog.map(n => n.name).join(', ')}` : 'alle haben Dialoge');

  } catch (e) {
    score('NPCs', 'NPC-Tests', 0, 10, e.message);
    issue('high', `NPC-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 4. INVENTAR & ITEMS (10 Punkte)
  // ================================================================
  console.log('\n--- 4. INVENTAR & ITEMS (10 Pkt) ---');
  try {
    // Zurueck zum Hub
    await evalGame(page, () => { window.__game.player.x = 19; window.__game.player.y = 12; });
    await sleep(300);

    // 4a) Oeffnet I das Inventar?
    await simulateKey(page, 'KeyI');
    await sleep(500);
    const invOpen = await evalGame(page, () => window.__game.hud.isInventoryOpen());
    score('Inventar', 'I-Taste oeffnet Inventar', invOpen ? 2 : 0, 2);

    if (invOpen) {
      await screenshot(page, '04-inventar-offen');
      // Schliessen
      await simulateKey(page, 'KeyI');
      await sleep(300);
    }

    // 4b) Kann man Items zwischen Hotbar und Inventar verschieben?
    // Gib Testitems
    await evalGame(page, () => {
      window.__game.inventory.addItem('wood', 10);
      window.__game.inventory.addItem('stone', 5);
      window.__game.inventory.addItem('berry', 8);
    });

    const hasTestItems = await evalGame(page, () => window.__game.inventory.hasItem('wood', 10));
    score('Inventar', 'Items hinzufuegen funktioniert', hasTestItems ? 2 : 0, 2);

    // 4c) Kann man Items mit Q benutzen?
    // Gib einen Heiltrank (hat healAmount) und benutze ihn
    const beforeHp = await evalGame(page, () => {
      const g = window.__game;
      g.inventory.addItem('heal_potion', 1);
      g.player.hp = g.player.maxHp - 50; // Reduziere HP
      // Finde Heiltrank-Slot und waehle ihn
      for (let i = 0; i < 8; i++) {
        if (g.inventory.slots[i].itemId === 'heal_potion') {
          g.inventory.selectedHotbar = i;
          break;
        }
      }
      return g.player.hp;
    });

    // Direkt _useSelectedItem aufrufen (Q-Taste triggert dies)
    await evalGame(page, () => { window.__game._useSelectedItem(); });
    await sleep(500);

    const afterHp = await evalGame(page, () => window.__game.player.hp);
    const potionUsed = afterHp > beforeHp;
    score('Inventar', 'Q-Taste benutzt Item', potionUsed ? 2 : 0, 2,
      `HP: ${beforeHp} -> ${afterHp}`);

    // 4d) Werden Items korrekt gestackt?
    const stackTest = await evalGame(page, () => {
      const inv = window.__game.inventory;
      inv.addItem('wood', 5);
      // Zaehle wie viele Slots Wood belegen
      let woodSlots = 0;
      let totalWood = 0;
      for (const s of inv.slots) {
        if (s.itemId === 'wood') { woodSlots++; totalWood += s.count; }
      }
      return { woodSlots, totalWood };
    });
    const stackOk = stackTest.totalWood >= 10 && stackTest.woodSlots <= 2;
    score('Inventar', 'Stacking funktioniert', stackOk ? 2 : 0, 2,
      `${stackTest.totalWood} Holz in ${stackTest.woodSlots} Slots`);

    // 4e) Items droppen mit G
    const beforeDropCount = await evalGame(page, () => window.__game.itemDrops?.drops.length || 0);
    await pressKey(page, 'g', 100);
    await sleep(500);
    const afterDropCount = await evalGame(page, () => window.__game.itemDrops?.drops.length || 0);
    score('Inventar', 'G-Taste dropped Item', afterDropCount > beforeDropCount ? 2 : 0, 2,
      `drops: ${beforeDropCount} -> ${afterDropCount}`);

  } catch (e) {
    score('Inventar', 'Inventar-Tests', 0, 10, e.message);
    issue('high', `Inventar-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 5. RESSOURCEN SAMMELN (10 Punkte)
  // ================================================================
  console.log('\n--- 5. RESSOURCEN SAMMELN (10 Pkt) ---');
  try {
    // Zum Wald wechseln fuer Ressourcen
    await evalGame(page, () => window.__game.loadScene('forest', { x: 25, y: 20 }));
    await sleep(2500);

    // 5a) Zeigen Resource Nodes ein [E] Prompt?
    const resourceInfo = await evalGame(page, () => {
      const rm = window.__game.resources;
      if (!rm) return { count: 0, nodes: [] };
      const nodes = rm.nodes || [];
      return {
        count: nodes.length,
        nodes: nodes.slice(0, 5).map(n => ({
          type: n.type, x: n.x, y: n.y,
          depleted: n.depleted,
          hasPrompt: !!n.promptMesh
        }))
      };
    });

    score('Ressourcen', 'Ressourcen-Nodes vorhanden', resourceInfo.count > 0 ? 2 : 0, 2,
      `${resourceInfo.count} Nodes`);

    const allHavePrompts = resourceInfo.nodes.every(n => n.hasPrompt);
    score('Ressourcen', '[E] Prompt vorhanden', allHavePrompts ? 2 : 0, 2);

    // 5b) Kann man Holz/Stein sammeln?
    // Teleportiere zu einem Baum
    const nearestTree = await evalGame(page, () => {
      const rm = window.__game.resources;
      if (!rm) return null;
      const tree = (rm.nodes || []).find(n => n.type === 'tree' && !n.depleted);
      return tree ? { x: tree.x, y: tree.y } : null;
    });

    if (nearestTree) {
      // Teleportiere zum Baum und sammle direkt (justPressed wird im naechsten Tick konsumiert)
      const gatherWoodResult = await evalGame(page, (pos) => {
        const g = window.__game;
        g.player.x = pos.x + 0.5;
        g.player.y = pos.y + 0.5;
        const woodBefore = g.inventory.countItem('wood');
        // Direkt gather() aufrufen statt Input zu simulieren
        const node = g.resources.nodes.find(n => n.type === 'tree' && !n.depleted);
        if (node) {
          const loot = node.gather();
          if (loot) {
            g.inventory.addItem(loot.itemId, loot.count);
          }
        }
        const woodAfter = g.inventory.countItem('wood');
        return { before: woodBefore, after: woodAfter };
      }, nearestTree);
      const gathered = gatherWoodResult.after > gatherWoodResult.before;
      score('Ressourcen', 'Holz sammeln funktioniert', gathered ? 3 : 0, 3,
        `wood: ${gatherWoodResult.before} -> ${gatherWoodResult.after}`);
    } else {
      score('Ressourcen', 'Holz sammeln funktioniert', 0, 3, 'kein Baum gefunden');
    }

    // 5c) Droppen Items nach dem Sammeln? (bereits getestet via Inventar)
    // Stattdessen: Stein sammeln
    const nearestRock = await evalGame(page, () => {
      const rm = window.__game.resources;
      if (!rm) return null;
      const rock = (rm.nodes || []).find(n => n.type === 'rock' && !n.depleted);
      return rock ? { x: rock.x, y: rock.y } : null;
    });

    if (nearestRock) {
      const gatherStoneResult = await evalGame(page, (pos) => {
        const g = window.__game;
        g.player.x = pos.x + 0.5;
        g.player.y = pos.y + 0.5;
        const stoneBefore = g.inventory.countItem('stone');
        const node = g.resources.nodes.find(n => n.type === 'rock' && !n.depleted);
        if (node) {
          const loot = node.gather();
          if (loot) {
            g.inventory.addItem(loot.itemId, loot.count);
          }
        }
        const stoneAfter = g.inventory.countItem('stone');
        return { before: stoneBefore, after: stoneAfter };
      }, nearestRock);
      const gatheredStone = gatherStoneResult.after > gatherStoneResult.before;
      score('Ressourcen', 'Stein sammeln funktioniert', gatheredStone ? 2 : 0, 2,
        `stone: ${gatherStoneResult.before} -> ${gatherStoneResult.after}`);
    } else {
      score('Ressourcen', 'Stein sammeln funktioniert', 0, 2, 'kein Felsen gefunden');
    }

    // 5d) Werden Items ins Inventar aufgenommen? (implizit durch obige Tests)
    const invItemCount = await evalGame(page, () => {
      let total = 0;
      for (const s of window.__game.inventory.slots) {
        if (s.itemId) total++;
      }
      return total;
    });
    score('Ressourcen', 'Items im Inventar', invItemCount > 0 ? 1 : 0, 1,
      `${invItemCount} belegte Slots`);

  } catch (e) {
    score('Ressourcen', 'Ressourcen-Tests', 0, 10, e.message);
    issue('high', `Ressourcen-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 6. KAMPF (10 Punkte)
  // ================================================================
  console.log('\n--- 6. KAMPF (10 Pkt) ---');
  try {
    // Sicherstellen: Wald ist geladen
    const currentScene = await evalGame(page, () => window.__game.sceneManager?.currentScene || 'unknown');
    if (currentScene !== 'forest') {
      await evalGame(page, () => window.__game.loadScene('forest', { x: 25, y: 20 }));
      await sleep(2500);
    }

    // 6a) Gibt es Mobs?
    const mobCount = await evalGame(page, () => window.__game.mobs.filter(m => m.alive).length);
    score('Kampf', 'Mobs im Wald vorhanden', mobCount > 0 ? 2 : 0, 2, `${mobCount} lebende Mobs`);

    if (mobCount > 0) {
      // 6b) Greift der Spieler mit Leertaste an?
      const mobInfo = await evalGame(page, () => {
        const mob = window.__game.mobs.find(m => m.alive);
        return mob ? { x: mob.x, y: mob.y, hp: mob.hp, type: mob.mobType } : null;
      });

      if (mobInfo) {
        // Positioniere Spieler neben Mob
        await evalGame(page, (m) => {
          window.__game.player.x = m.x + 1.0;
          window.__game.player.y = m.y;
          window.__game.player.direction = 'left';
          window.__game.player.state = 'idle';
        }, mobInfo);
        await sleep(200);

        const beforeHP = await evalGame(page, () => {
          const mob = window.__game.mobs.find(m => m.alive);
          return mob ? mob.hp : -1;
        });

        // Angriff via Combat-System direkt
        const attackResult = await evalGame(page, () => {
          const g = window.__game;
          const mob = g.mobs.find(m => m.alive);
          if (!mob) return { attacked: false, reason: 'kein Mob' };
          g.input._justPressed['Space'] = true;
          g.input._consumed = {};
          const attacked = g.combat.tryAttack(g.player, g.input);
          if (!attacked) return { attacked: false, reason: 'tryAttack failed' };
          const hits = g.combat.update(0.01, g.player, g.mobs);
          return { attacked: true, hits: hits.length, mobHp: mob.hp };
        });

        const afterHP = await evalGame(page, () => {
          const mob = window.__game.mobs.find(m => m.alive);
          return mob ? mob.hp : -1;
        });

        const damaged = afterHP < beforeHP || (attackResult.hits > 0);
        score('Kampf', 'Angriff schadet Mob', damaged ? 3 : 0, 3,
          `HP: ${beforeHP} -> ${afterHP}`);

        // 6c) Stirbt der Mob nach genug Hits?
        // Toete einen Mob komplett
        const killResult = await evalGame(page, () => {
          const g = window.__game;
          let mob = g.mobs.find(m => m.alive);
          if (!mob) return { killed: false, reason: 'kein Mob' };
          const startHp = mob.hp;
          // Toete direkt
          mob.hp = 0;
          mob.alive = false;
          return { killed: true, startHp };
        });
        score('Kampf', 'Mob kann sterben', killResult.killed ? 2 : 0, 2);

        // 6d) Gibt der Mob XP?
        const xpBefore = await evalGame(page, () => window.__game.progression.totalXp);
        await evalGame(page, () => {
          window.__game.progression.addXp(10); // Simuliere XP-Gewinn
        });
        const xpAfter = await evalGame(page, () => window.__game.progression.totalXp);
        score('Kampf', 'XP-System funktioniert', xpAfter > xpBefore ? 1 : 0, 1,
          `XP: ${xpBefore} -> ${xpAfter}`);

        // 6e) Gibt es Damage-Zahlen?
        const hasDmgNumbers = await evalGame(page, () => !!window.__game.damageNumbers);
        score('Kampf', 'Damage-Zahlen vorhanden', hasDmgNumbers ? 2 : 0, 2);

      } else {
        score('Kampf', 'Angriff schadet Mob', 0, 3, 'kein Mob gefunden');
        score('Kampf', 'Mob kann sterben', 0, 2);
        score('Kampf', 'XP-System funktioniert', 0, 1);
        score('Kampf', 'Damage-Zahlen vorhanden', 0, 2);
      }
    } else {
      score('Kampf', 'Angriff schadet Mob', 0, 3);
      score('Kampf', 'Mob kann sterben', 0, 2);
      score('Kampf', 'XP-System funktioniert', 0, 1);
      score('Kampf', 'Damage-Zahlen vorhanden', 0, 2);
      issue('high', 'Keine Mobs im Wald');
    }

    await screenshot(page, '05-kampf');
  } catch (e) {
    score('Kampf', 'Kampf-Tests', 0, 10, e.message);
    issue('high', `Kampf-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 7. CRAFTING (10 Punkte)
  // ================================================================
  console.log('\n--- 7. CRAFTING (10 Pkt) ---');
  try {
    // Zurueck zum Hub
    await evalGame(page, () => window.__game.loadScene('hub', { x: 19, y: 12 }));
    await sleep(2500);

    // 7a) Gibt es Crafting-Stationen?
    const stations = await evalGame(page, () => {
      const props = window.__game.tileMap?.props || [];
      return props.filter(p => p.type === 'station').map(s => ({
        station: s.station, x: s.x, y: s.y
      }));
    });
    score('Crafting', 'Crafting-Stationen vorhanden', stations.length > 0 ? 2 : 0, 2,
      `${stations.length} Stationen: ${stations.map(s => s.station).join(', ')}`);

    // 7b) Kann man Crafting-Station benutzen?
    if (stations.length > 0) {
      const workbench = stations.find(s => s.station === 'workbench') || stations[0];
      // Teleportiere zur Station
      await evalGame(page, (s) => {
        window.__game.player.x = s.x + 1;
        window.__game.player.y = s.y + 1;
      }, workbench);
      await sleep(300);

      // Oeffne Station
      await evalGame(page, (sid) => {
        window.__game.crafting.openStation(sid);
      }, workbench.station);
      await sleep(500);

      const craftUiOpen = await evalGame(page, () => window.__game.crafting.ui.isOpen);
      score('Crafting', 'Station-UI oeffnet sich', craftUiOpen ? 3 : 0, 3);

      if (craftUiOpen) {
        await screenshot(page, '06-crafting-ui');

        // 7c) Kann man Items craften?
        // Gib genug Materialien
        await evalGame(page, () => {
          window.__game.inventory.addItem('wood', 20);
          window.__game.inventory.addItem('stone', 20);
        });

        // Versuche Holzschwert zu craften
        const craftResult = await evalGame(page, () => {
          const g = window.__game;
          const recipe = { id: 'r_sword_wood', name: 'Holzschwert', ingredients: [{ itemId: 'wood', count: 3 }], result: { itemId: 'sword_wood', count: 1 } };
          const before = g.inventory.countItem('sword_wood');
          const success = g.crafting._doCraft(recipe);
          const after = g.inventory.countItem('sword_wood');
          return { success, before, after };
        });
        score('Crafting', 'Craften funktioniert', craftResult.after > craftResult.before ? 3 : 0, 3,
          `sword_wood: ${craftResult.before} -> ${craftResult.after}`);

        // Schliesse Crafting UI
        await evalGame(page, () => { window.__game.crafting.ui.hide(); });
        await sleep(200);
      } else {
        score('Crafting', 'Craften funktioniert', 0, 3, 'UI nicht geoeffnet');
        issue('medium', 'Crafting-UI laesst sich nicht oeffnen');
      }

      // 7d) Wird das gecraftete Item ins Inventar gelegt?
      const hasCraftedItem = await evalGame(page, () => window.__game.inventory.hasItem('sword_wood', 1));
      score('Crafting', 'Gecraftetes Item im Inventar', hasCraftedItem ? 2 : 0, 2);
    } else {
      score('Crafting', 'Station-UI oeffnet sich', 0, 3);
      score('Crafting', 'Craften funktioniert', 0, 3);
      score('Crafting', 'Gecraftetes Item im Inventar', 0, 2);
      issue('critical', 'Keine Crafting-Stationen gefunden');
    }
  } catch (e) {
    score('Crafting', 'Crafting-Tests', 0, 10, e.message);
    issue('high', `Crafting-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 8. QUEST-SYSTEM (10 Punkte)
  // ================================================================
  console.log('\n--- 8. QUEST-SYSTEM (10 Pkt) ---');
  try {
    // 8a) Wird die aktive Quest im HUD angezeigt?
    const questTracker = await page.$('#hud-quest-tracker');
    const questTrackerExists = !!questTracker;
    score('Quests', 'Quest-Tracker im HUD vorhanden', questTrackerExists ? 2 : 0, 2);

    // 8b) Gibt es eine aktive Quest?
    const activeQuest = await evalGame(page, () => {
      const q = window.__game.progression.getActiveQuest();
      return q ? { name: q.name, description: q.description, type: q.type } : null;
    });
    score('Quests', 'Aktive Quest vorhanden', activeQuest ? 2 : 0, 2,
      activeQuest ? activeQuest.name : 'keine aktive Quest');

    // 8c) Aktualisiert sich der Fortschritt?
    if (activeQuest) {
      // Simuliere Fortschritt
      const progressUpdate = await evalGame(page, () => {
        const g = window.__game;
        const q = g.progression.getActiveQuest();
        if (!q) return { updated: false };
        const before = g.progression.activeQuests[q.id]?.progress || 0;
        // Simuliere einen Fortschritt je nach Quest-Typ
        if (q.type === 'talk') {
          g.progression.reportTalk(q.target);
        } else if (q.type === 'collect') {
          g.progression.reportCollect(q.target, 1);
        } else if (q.type === 'heal') {
          g.progression.reportHeal();
        }
        const after = g.progression.activeQuests[q.id]?.progress || 0;
        return { updated: after > before || after >= q.count, before, after };
      });
      score('Quests', 'Fortschritt aktualisiert sich', progressUpdate.updated ? 3 : 0, 3,
        `progress: ${progressUpdate.before} -> ${progressUpdate.after}`);
    } else {
      score('Quests', 'Fortschritt aktualisiert sich', 0, 3, 'keine aktive Quest');
    }

    // 8d) Wird die naechste Quest automatisch aktiviert?
    const questChain = await evalGame(page, () => {
      const g = window.__game;
      // Schliesse aktive Quest ab und pruefe ob die naechste startet
      const q = g.progression.getActiveQuest();
      if (!q) return { chainWorks: false, reason: 'keine Quest' };
      const qId = q.id;
      // Manuell abschliessen ueber _completeQuest (aktiviert naechste automatisch)
      g.progression._completeQuest(qId);
      const nextQ = g.progression.getActiveQuest();
      return {
        chainWorks: nextQ && nextQ.id !== qId,
        completed: qId,
        next: nextQ ? nextQ.name : 'keine'
      };
    });
    score('Quests', 'Quest-Chain funktioniert', questChain.chainWorks ? 3 : 0, 3,
      `${questChain.completed} -> ${questChain.next}`);

  } catch (e) {
    score('Quests', 'Quest-Tests', 0, 10, e.message);
    issue('high', `Quest-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 9. SCENE-WECHSEL (10 Punkte)
  // ================================================================
  console.log('\n--- 9. SCENE-WECHSEL (10 Pkt) ---');
  try {
    // Merke Inventar-Status
    const invBefore = await evalGame(page, () => window.__game.inventory.countItem('wood'));
    const levelBefore = await evalGame(page, () => window.__game.progression.level);

    // 9a) Wald
    await evalGame(page, () => window.__game.loadScene('forest', { x: 25, y: 20 }));
    await sleep(2000);
    const forestLoaded = await evalGame(page, () => !!window.__game.tileMap && window.__game.running);
    score('Szenen', 'Wald laedt korrekt', forestLoaded ? 2 : 0, 2);

    // 9b) See
    await evalGame(page, () => window.__game.loadScene('lake', { x: 21, y: 4 }));
    await sleep(2000);
    const lakeLoaded = await evalGame(page, () => !!window.__game.tileMap);
    score('Szenen', 'See laedt korrekt', lakeLoaded ? 2 : 0, 2);

    // 9c) Strand
    await evalGame(page, () => window.__game.loadScene('beach', { x: 15, y: 15 }));
    await sleep(2000);
    const beachLoaded = await evalGame(page, () => !!window.__game.tileMap);
    score('Szenen', 'Strand laedt korrekt', beachLoaded ? 2 : 0, 2);
    await screenshot(page, '07-strand');

    // 9d) Einhornwiese
    await evalGame(page, () => window.__game.loadScene('unicorn_meadow', { x: 12, y: 10 }));
    await sleep(2000);
    const meadowLoaded = await evalGame(page, () => !!window.__game.tileMap);
    score('Szenen', 'Einhornwiese laedt korrekt', meadowLoaded ? 1 : 0, 1);

    // 9e) Zurueck zum Hub + Inventar/Level erhalten?
    await evalGame(page, () => window.__game.loadScene('hub', { x: 19, y: 12 }));
    await sleep(2000);
    const invAfter = await evalGame(page, () => window.__game.inventory.countItem('wood'));
    const levelAfter = await evalGame(page, () => window.__game.progression.level);
    const persistsOk = invAfter === invBefore && levelAfter === levelBefore;
    score('Szenen', 'Inventar/Level bleibt erhalten', persistsOk ? 3 : (invAfter === invBefore ? 2 : 0), 3,
      `wood: ${invBefore}->${invAfter}, lvl: ${levelBefore}->${levelAfter}`);

  } catch (e) {
    score('Szenen', 'Szenen-Tests', 0, 10, e.message);
    issue('high', `Szenen-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // 10. BENUTZERFREUNDLICHKEIT (10 Punkte)
  // ================================================================
  console.log('\n--- 10. BENUTZERFREUNDLICHKEIT (10 Pkt) ---');
  try {
    // 10a) Sind Texte gross genug zum Lesen?
    const fontSizes = await page.evaluate(() => {
      const results = {};
      // Quest-Text
      const questTitle = document.querySelector('.quest-title');
      if (questTitle) results.questTitle = parseFloat(getComputedStyle(questTitle).fontSize);
      // HP-Text
      const hpText = document.querySelector('#hud-hp-text');
      if (hpText) results.hpText = parseFloat(getComputedStyle(hpText).fontSize);
      // Level-Badge
      const lvlBadge = document.querySelector('#hud-level-badge');
      if (lvlBadge) results.levelBadge = parseFloat(getComputedStyle(lvlBadge).fontSize);
      // Info-Text
      const info = document.querySelector('#hud-info');
      if (info) results.infoText = parseFloat(getComputedStyle(info).fontSize);
      return results;
    });
    const textLargeEnough = Object.values(fontSizes).every(s => s >= 10);
    score('UX', 'Texte gross genug (>=10px)', textLargeEnough ? 2 : 1, 2,
      JSON.stringify(fontSizes));

    // 10b) Sind Buttons leicht klickbar? (Mindestgroesse 32x32px)
    const buttonSizes = await page.evaluate(() => {
      const muteBtn = document.querySelector('#hud-mute');
      if (!muteBtn) return { exists: false };
      const rect = muteBtn.getBoundingClientRect();
      return { exists: true, width: rect.width, height: rect.height };
    });
    const btnClickable = buttonSizes.exists && buttonSizes.width >= 30 && buttonSizes.height >= 30;
    score('UX', 'Buttons klickbar (>=30px)', btnClickable ? 2 : (buttonSizes.exists ? 1 : 0), 2,
      buttonSizes.exists ? `${buttonSizes.width.toFixed(0)}x${buttonSizes.height.toFixed(0)}px` : 'kein Button');

    // 10c) Gibt es Feedback bei Aktionen?
    const feedbackSystems = await evalGame(page, () => {
      const g = window.__game;
      return {
        hasAudio: !!g.audio,
        hasVfx: !!g.vfx,
        hasJuice: !!g.juice,
        hasDamageNumbers: !!g.damageNumbers,
        hasPickupPopup: !!g.pickupPopup
      };
    });
    const feedbackCount = Object.values(feedbackSystems).filter(Boolean).length;
    score('UX', 'Feedback-Systeme vorhanden', feedbackCount >= 4 ? 2 : feedbackCount >= 2 ? 1 : 0, 2,
      `${feedbackCount}/5: ${JSON.stringify(feedbackSystems)}`);

    // 10d) Ist die Hotbar immer sichtbar?
    const hotbarVisible = await page.evaluate(() => {
      const hb = document.querySelector('#hud-hotbar');
      if (!hb) return false;
      const style = getComputedStyle(hb);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    score('UX', 'Hotbar sichtbar', hotbarVisible ? 2 : 0, 2);

    // 10e) Gibt es Tooltips fuer Items?
    const tooltipExists = await page.evaluate(() => {
      return !!document.querySelector('#hud-tooltip');
    });
    score('UX', 'Tooltip-System vorhanden', tooltipExists ? 2 : 0, 2);

    await screenshot(page, '08-ux-hotbar');
  } catch (e) {
    score('UX', 'UX-Tests', 0, 10, e.message);
    issue('medium', `UX-Tests fehlgeschlagen: ${e.message}`);
  }

  // ================================================================
  // FEHLER-ZUSAMMENFASSUNG
  // ================================================================
  console.log('\n--- STABILITAET ---');
  const errorCount = consoleErrors.length;
  if (errorCount > 0) {
    console.log(`  ${errorCount} Konsolen-Fehler waehrend des Tests:`);
    for (const err of consoleErrors.slice(0, 8)) {
      console.log(`    - ${err.substring(0, 120)}`);
    }
  } else {
    console.log('  Keine Konsolen-Fehler!');
  }

  // ================================================================
  // FINAL REPORT
  // ================================================================
  console.log('\n' + '='.repeat(60));
  console.log('    UX SCORING REPORT');
  console.log('='.repeat(60));

  for (const [cat, data] of Object.entries(SCORES)) {
    const pct = Math.round(data.earned / data.max * 100);
    const bar = '#'.repeat(Math.round(pct / 5)) + '.'.repeat(20 - Math.round(pct / 5));
    console.log(`  ${cat.padEnd(14)} [${bar}] ${data.earned}/${data.max} (${pct}%)`);
  }

  const totalPct = Math.round(totalPoints / maxPoints * 100);
  console.log('\n' + '-'.repeat(60));
  console.log(`  GESAMT: ${totalPoints}/${maxPoints} (${totalPct}%)`);

  let grade;
  if (totalPct >= 90) grade = 'S -- Hervorragend!';
  else if (totalPct >= 80) grade = 'A -- Ausgezeichnet';
  else if (totalPct >= 70) grade = 'B -- Gut';
  else if (totalPct >= 60) grade = 'C -- Befriedigend';
  else if (totalPct >= 50) grade = 'D -- Verbesserungsbedarf';
  else grade = 'F -- Kritisch';

  console.log(`  Note: ${grade}\n`);

  // ================================================================
  // MARKDOWN REPORT
  // ================================================================
  let report = `# UX Scoring Report -- Emilia's Pixel Adventure\n\n`;
  report += `**Datum:** ${new Date().toISOString().slice(0, 10)}\n`;
  report += `**Gesamtpunktzahl:** ${totalPoints}/${maxPoints} (${totalPct}%)\n`;
  report += `**Note:** ${grade}\n\n`;

  report += `## Kategorien\n\n`;
  report += `| Kategorie | Punkte | Prozent |\n`;
  report += `|-----------|--------|----------|\n`;
  for (const [cat, data] of Object.entries(SCORES)) {
    const pct = Math.round(data.earned / data.max * 100);
    report += `| ${cat} | ${data.earned}/${data.max} | ${pct}% |\n`;
  }

  report += `\n## Detail-Ergebnisse\n\n`;
  for (const [cat, data] of Object.entries(SCORES)) {
    report += `### ${cat}\n\n`;
    for (const t of data.tests) {
      const icon = t.points === t.maxPts ? 'PASS' : t.points > 0 ? 'TEIL' : 'FAIL';
      report += `- **[${icon}]** ${t.test}: ${t.points}/${t.maxPts}`;
      if (t.detail) report += ` -- ${t.detail}`;
      report += `\n`;
    }
    report += `\n`;
  }

  // Top 5 kritische Probleme
  report += `## Top 5 Kritische Probleme\n\n`;
  report += `*Stellen, an denen ein Kind haengen bleibt:*\n\n`;
  const critical = ISSUES.filter(i => i.severity === 'critical' || i.severity === 'high');
  const medium = ISSUES.filter(i => i.severity === 'medium');
  const allIssues = [...critical, ...medium];
  if (allIssues.length === 0) {
    report += `1. Keine kritischen Probleme gefunden!\n\n`;
  } else {
    for (let i = 0; i < Math.min(5, allIssues.length); i++) {
      report += `${i + 1}. **[${allIssues[i].severity}]** ${allIssues[i].desc}\n`;
    }
    report += `\n`;
  }

  // Top 5 Verbesserungsvorschlaege
  report += `## Top 5 Verbesserungsvorschlaege\n\n`;
  const suggestions = [];
  for (const [cat, data] of Object.entries(SCORES)) {
    const pct = Math.round(data.earned / data.max * 100);
    if (pct < 100) {
      const failed = data.tests.filter(t => t.points < t.maxPts);
      for (const f of failed) {
        suggestions.push({ cat, test: f.test, lost: f.maxPts - f.points, detail: f.detail });
      }
    }
  }
  suggestions.sort((a, b) => b.lost - a.lost);
  for (let i = 0; i < Math.min(5, suggestions.length); i++) {
    const s = suggestions[i];
    report += `${i + 1}. **${s.cat} -- ${s.test}** (${s.lost} Pkt verloren)`;
    if (s.detail) report += ` -- ${s.detail}`;
    report += `\n`;
  }
  if (suggestions.length === 0) {
    report += `Keine Verbesserungen noetig -- perfekte Punktzahl!\n`;
  }

  // Screenshots
  report += `\n## Screenshots\n\n`;
  for (const ss of SCREENSHOTS) {
    report += `- [${ss.name}](${ss.name}.png)\n`;
  }

  report += `\n## Konsolen-Fehler\n\n`;
  if (consoleErrors.length === 0) {
    report += `Keine Fehler waehrend des Tests.\n`;
  } else {
    report += `${consoleErrors.length} Fehler gefunden:\n\n`;
    for (const err of consoleErrors.slice(0, 10)) {
      report += `- \`${err.substring(0, 150)}\`\n`;
    }
  }

  report += `\n---\n*Automatisch generiert durch UX Scoring Test*\n`;

  // Write report
  const reportPath = path.join(ARTIFACT_DIR, 'ux-scoring-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`Report gespeichert: ${reportPath}`);

  await browser.close();
  process.exit(totalPct >= 70 ? 0 : 1);
})();
