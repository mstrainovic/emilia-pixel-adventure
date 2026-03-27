/**
 * Emilia's Pixel Adventure — Visual Clipping & Z-Ordering Diagnostic Test
 *
 * Diagnostiziert visuelle Probleme: falsche Tiefensortierung, Clipping,
 * teilweise sichtbare grosse Assets (Baeume, Haeuser).
 *
 * Sammelt Daten und Screenshots, kein pass/fail — rein diagnostisch.
 *
 * Run: node tests/visual-clipping-test.cjs [port]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 5176;
const BASE = `http://localhost:${PORT}/emilia-pixel-adventure/`;
const ARTIFACT_DIR = path.join(__dirname, 'test-artifacts');

// Ensure artifact directory exists
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const REPORT = {
  timestamp: new Date().toISOString(),
  scenes: {},
  zConflicts: [],
  totalProps: 0,
  totalZConflicts: 0,
  totalArtifacts: 0,
  screenshots: [],
  consoleErrors: [],
};

function log(msg) {
  console.log(msg);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Dump the entire scene graph: meshes, materials, z-positions, sizes
 */
async function dumpSceneGraph(page) {
  return page.evaluate(() => {
    const game = window.__game;
    if (!game) return null;

    const meshes = [];
    game.scene.traverse(obj => {
      if (obj.isMesh || obj.isInstancedMesh) {
        const pos = obj.position;
        const parentIsPropGroup = obj.parent === game.tileMapRenderer?.propGroup;
        const parentIsGroundGroup = obj.parent === game.tileMapRenderer?.groundGroup;
        const parentIsGroundDeco = obj.parent === game.groundDeco?.group;
        meshes.push({
          uuid: obj.uuid,
          type: obj.isInstancedMesh ? 'instanced' : 'mesh',
          position: { x: pos.x, y: pos.y, z: pos.z },
          width: obj.geometry?.parameters?.width || 0,
          height: obj.geometry?.parameters?.height || 0,
          material: {
            transparent: obj.material?.transparent || false,
            depthWrite: obj.material?.depthWrite || false,
            alphaTest: obj.material?.alphaTest || 0,
            hasMap: !!obj.material?.map,
          },
          parentName: obj.parent?.constructor?.name || 'unknown',
          isProp: parentIsPropGroup,
          isGround: parentIsGroundGroup,
          isGroundDeco: parentIsGroundDeco,
          visible: obj.visible,
          renderOrder: obj.renderOrder || 0,
        });
      }
    });

    return {
      totalMeshes: meshes.length,
      propGroupCount: game.tileMapRenderer?.propGroup?.children?.length || 0,
      groundGroupCount: game.tileMapRenderer?.groundGroup?.children?.length || 0,
      groundDecoCount: game.groundDeco?.group?.children?.length || 0,
      cameraPosition: game.camera?.cam
        ? { x: game.camera.cam.position.x, y: game.camera.cam.position.y, z: game.camera.cam.position.z }
        : null,
      cameraZoom: game.camera?.cam?.zoom || 1,
      meshes,
    };
  });
}

/**
 * Detect overlapping props with incorrect z-ordering
 */
async function detectZConflicts(page) {
  return page.evaluate(() => {
    const game = window.__game;
    if (!game?.tileMapRenderer?.propGroup) return { conflicts: [], propCount: 0 };

    const props = game.tileMapRenderer.propGroup.children;
    const conflicts = [];
    const propData = [];

    for (let i = 0; i < props.length; i++) {
      const a = props[i];
      if (!a.isMesh) continue;
      const aw = a.geometry?.parameters?.width || 1;
      const ah = a.geometry?.parameters?.height || 1;
      propData.push({
        index: i,
        mesh: a,
        x: a.position.x,
        y: a.position.y,
        z: a.position.z,
        w: aw,
        h: ah,
        // Bounding box in world coords
        x1: a.position.x - aw / 2,
        x2: a.position.x + aw / 2,
        y1: a.position.y - ah / 2,
        y2: a.position.y + ah / 2,
        // Base Y = bottom edge (most southern point in top-down view)
        // In THREE.js coords, more negative y = more south
        baseY: a.position.y - ah / 2,
        hasShadow: a.material?.opacity < 0.5 && a.material?.color?.r === 0,
      });
    }

    // Compare all prop pairs for overlap and z-order correctness
    for (let i = 0; i < propData.length; i++) {
      // Skip shadows
      if (propData[i].hasShadow) continue;

      for (let j = i + 1; j < propData.length; j++) {
        if (propData[j].hasShadow) continue;

        const a = propData[i];
        const b = propData[j];

        // Check 2D overlap (x, y plane)
        const overlapsX = a.x1 < b.x2 && a.x2 > b.x1;
        const overlapsY = a.y1 < b.y2 && a.y2 > b.y1;

        if (overlapsX && overlapsY) {
          // They overlap. Check z-ordering.
          // In top-down 2D: object with more southern (lower) base should render in front (higher z).
          // In THREE.js, y is flipped: more negative y = more south = should have higher z.
          const aMoreSouth = a.baseY < b.baseY;
          const aHasHigherZ = a.z > b.z;

          // If the southern object does NOT have higher z, it is a z-conflict
          if (aMoreSouth && !aHasHigherZ && Math.abs(a.z - b.z) > 0.0001) {
            conflicts.push({
              type: 'z-order',
              meshA: {
                index: a.index,
                pos: { x: a.x, y: a.y, z: a.z },
                size: [a.w, a.h],
                baseY: a.baseY,
              },
              meshB: {
                index: b.index,
                pos: { x: b.x, y: b.y, z: b.z },
                size: [b.w, b.h],
                baseY: b.baseY,
              },
              issue: `Mesh A (idx ${a.index}) is more south (baseY=${a.baseY.toFixed(3)}) but has lower z (${a.z.toFixed(4)}) than Mesh B (z=${b.z.toFixed(4)})`,
            });
          } else if (!aMoreSouth && aHasHigherZ && Math.abs(a.baseY - b.baseY) > 0.01) {
            conflicts.push({
              type: 'z-order',
              meshA: {
                index: a.index,
                pos: { x: a.x, y: a.y, z: a.z },
                size: [a.w, a.h],
                baseY: a.baseY,
              },
              meshB: {
                index: b.index,
                pos: { x: b.x, y: b.y, z: b.z },
                size: [b.w, b.h],
                baseY: b.baseY,
              },
              issue: `Mesh B (idx ${b.index}) is more south (baseY=${b.baseY.toFixed(3)}) but has lower z (${b.z.toFixed(4)}) than Mesh A (z=${a.z.toFixed(4)})`,
            });
          }
        }
      }
    }

    return {
      conflicts,
      propCount: propData.length,
      shadowCount: propData.filter(p => p.hasShadow).length,
      propSummary: propData
        .filter(p => !p.hasShadow)
        .map(p => ({
          index: p.index,
          pos: { x: p.x.toFixed(2), y: p.y.toFixed(2), z: p.z.toFixed(4) },
          size: [p.w, p.h],
          baseY: p.baseY.toFixed(3),
        })),
    };
  });
}

/**
 * Analyze a screenshot buffer for visual anomalies:
 * - Large solid-color rectangles (potential clipping/missing textures)
 * - Fully black or fully transparent regions
 */
async function analyzeScreenshotPixels(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: 'No canvas found' };

    const w = canvas.width;
    const h = canvas.height;

    // Use WebGL readPixels for THREE.js canvas
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { error: 'No WebGL context' };

    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Sample grid analysis: divide into 16x12 blocks
    const blockW = Math.floor(w / 16);
    const blockH = Math.floor(h / 12);
    const blocks = [];
    let suspiciousBlocks = 0;

    for (let by = 0; by < 12; by++) {
      for (let bx = 0; bx < 16; bx++) {
        let r = 0, g = 0, b = 0, a = 0;
        let blackCount = 0;
        let transparentCount = 0;
        let sampleCount = 0;

        // Sample some pixels in this block
        for (let sy = 0; sy < blockH; sy += 4) {
          for (let sx = 0; sx < blockW; sx += 4) {
            const px = bx * blockW + sx;
            const py = by * blockH + sy;
            const idx = (py * w + px) * 4;
            r += pixels[idx];
            g += pixels[idx + 1];
            b += pixels[idx + 2];
            a += pixels[idx + 3];
            if (pixels[idx] === 0 && pixels[idx + 1] === 0 && pixels[idx + 2] === 0) blackCount++;
            if (pixels[idx + 3] === 0) transparentCount++;
            sampleCount++;
          }
        }

        if (sampleCount === 0) continue;

        const avgR = Math.round(r / sampleCount);
        const avgG = Math.round(g / sampleCount);
        const avgB = Math.round(b / sampleCount);
        const avgA = Math.round(a / sampleCount);
        const blackRatio = blackCount / sampleCount;
        const transparentRatio = transparentCount / sampleCount;

        const suspicious = blackRatio > 0.8 || transparentRatio > 0.8;
        if (suspicious) suspiciousBlocks++;

        blocks.push({
          bx,
          by,
          avgColor: [avgR, avgG, avgB, avgA],
          blackRatio: +blackRatio.toFixed(2),
          transparentRatio: +transparentRatio.toFixed(2),
          suspicious,
        });
      }
    }

    return {
      canvasWidth: w,
      canvasHeight: h,
      totalBlocks: blocks.length,
      suspiciousBlocks,
      suspiciousDetails: blocks.filter(b => b.suspicious),
    };
  });
}

/**
 * Check material settings for common clipping issues
 */
async function checkMaterialSettings(page) {
  return page.evaluate(() => {
    const game = window.__game;
    if (!game?.tileMapRenderer?.propGroup) return null;

    const props = game.tileMapRenderer.propGroup.children;
    const issues = [];

    for (let i = 0; i < props.length; i++) {
      const mesh = props[i];
      if (!mesh.isMesh) continue;

      const mat = mesh.material;
      const w = mesh.geometry?.parameters?.width || 0;
      const h = mesh.geometry?.parameters?.height || 0;
      const isLargeProp = w >= 2 || h >= 3;

      // Issue: depthWrite=true on transparent sprites causes z-fighting
      if (mat.transparent && mat.depthWrite) {
        issues.push({
          index: i,
          size: [w, h],
          issue: 'depthWrite=true on transparent material (causes z-fighting)',
        });
      }

      // Issue: alphaTest too low can cause fringe artifacts
      if (mat.transparent && mat.alphaTest < 0.05 && mat.alphaTest !== 0) {
        issues.push({
          index: i,
          size: [w, h],
          issue: `alphaTest=${mat.alphaTest} too low (causes fringe artifacts)`,
        });
      }

      // Issue: no texture on a prop (would render as solid white/color)
      if (!mat.map) {
        issues.push({
          index: i,
          size: [w, h],
          issue: 'No texture map on prop material',
        });
      }

      // Issue: large prop with renderOrder=0 may be occluded
      if (isLargeProp && mesh.renderOrder === 0 && mat.transparent) {
        // This is normal if using z-sorting, but worth noting
      }
    }

    return {
      totalProps: props.length,
      materialIssues: issues,
    };
  });
}

/**
 * Check if camera frustum clips any large props
 */
async function checkCameraClipping(page) {
  return page.evaluate(() => {
    const game = window.__game;
    if (!game?.camera?.cam || !game?.tileMapRenderer?.propGroup) return null;

    const cam = game.camera.cam;
    const frustum = new window.THREE.Frustum();
    const projScreenMatrix = new window.THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    const props = game.tileMapRenderer.propGroup.children;
    const clippedProps = [];
    const visibleProps = [];

    for (let i = 0; i < props.length; i++) {
      const mesh = props[i];
      if (!mesh.isMesh) continue;

      const w = mesh.geometry?.parameters?.width || 1;
      const h = mesh.geometry?.parameters?.height || 1;

      // Create a bounding sphere for the mesh
      const sphere = new window.THREE.Sphere(mesh.position.clone(), Math.max(w, h) / 2);
      const inFrustum = frustum.intersectsSphere(sphere);

      // Check if partially visible (center in view but edges might be clipped)
      const centerInView = frustum.containsPoint(mesh.position);

      if (!inFrustum) {
        // Completely outside — not relevant
        continue;
      }

      if (inFrustum && !centerInView) {
        clippedProps.push({
          index: i,
          pos: { x: mesh.position.x.toFixed(2), y: mesh.position.y.toFixed(2) },
          size: [w, h],
          issue: 'Partially in frustum (edges may be clipped)',
        });
      } else {
        visibleProps.push({
          index: i,
          pos: { x: mesh.position.x.toFixed(2), y: mesh.position.y.toFixed(2) },
          size: [w, h],
        });
      }
    }

    return {
      cameraPos: { x: cam.position.x.toFixed(2), y: cam.position.y.toFixed(2) },
      cameraZoom: cam.zoom,
      totalPropsInView: visibleProps.length + clippedProps.length,
      fullyVisible: visibleProps.length,
      partiallyClipped: clippedProps.length,
      clippedDetails: clippedProps,
    };
  });
}

// ============================================================
// SCENES TO TEST
// ============================================================
const SCENES = [
  { name: 'hub', spawn: { x: 19, y: 12 }, label: 'Hub (Spawn)' },
  { name: 'hub', spawn: { x: 5, y: 5 }, label: 'Hub (Nordwest / Haeuser)' },
  { name: 'hub', spawn: { x: 35, y: 25 }, label: 'Hub (Suedost)' },
  { name: 'forest', spawn: { x: 25, y: 20 }, label: 'Forest' },
  { name: 'lake', spawn: { x: 21, y: 4 }, label: 'Lake' },
  { name: 'beach', spawn: { x: 15, y: 10 }, label: 'Beach' },
  { name: 'unicorn_meadow', spawn: { x: 12, y: 10 }, label: 'Unicorn Meadow' },
  { name: 'dungeon', spawn: { x: 4, y: 14 }, label: 'Dungeon' },
];

// ============================================================
// MAIN
// ============================================================
(async () => {
  logSection('VISUAL CLIPPING & Z-ORDERING DIAGNOSTIC');
  log(`Target: ${BASE}`);
  log(`Artifact dir: ${ARTIFACT_DIR}`);
  log(`Timestamp: ${REPORT.timestamp}`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      REPORT.consoleErrors.push(msg.text());
    }
  });

  // ----------------------------------------------------------
  // 1. LOAD GAME
  // ----------------------------------------------------------
  logSection('1. GAME STARTUP');
  try {
    await page.goto(BASE);
    await page.waitForTimeout(2000);

    const menuVisible = await page.getByRole('button', { name: 'Neues Spiel' }).isVisible();
    log(`  Menu sichtbar: ${menuVisible}`);

    await page.getByRole('button', { name: 'Neues Spiel' }).click();
    await page.waitForTimeout(2500);

    const gameRunning = await page.evaluate(() => !!window.__game?.running);
    log(`  Game running: ${gameRunning}`);

    if (!gameRunning) {
      log('  FEHLER: Spiel startet nicht. Abbruch.');
      await browser.close();
      process.exit(1);
    }
  } catch (e) {
    log(`  FEHLER beim Starten: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  // ----------------------------------------------------------
  // 2. ITERATE SCENES
  // ----------------------------------------------------------
  for (const sceneDef of SCENES) {
    const sceneKey = `${sceneDef.name}_${sceneDef.spawn.x}_${sceneDef.spawn.y}`;
    logSection(`2. SCENE: ${sceneDef.label} (${sceneDef.name} @ ${sceneDef.spawn.x},${sceneDef.spawn.y})`);

    try {
      // Load scene
      await page.evaluate(
        ({ name, spawn }) => window.__game.loadScene(name, spawn),
        { name: sceneDef.name, spawn: sceneDef.spawn }
      );
      await page.waitForTimeout(2500);

      // Teleport player to spawn to ensure camera follows
      await page.evaluate(
        ({ x, y }) => {
          window.__game.player.x = x;
          window.__game.player.y = y;
        },
        sceneDef.spawn
      );
      await page.waitForTimeout(500);

      // -- Scene Graph Dump --
      log('\n  --- Scene Graph ---');
      const sceneData = await dumpSceneGraph(page);
      if (sceneData) {
        log(`  Total meshes: ${sceneData.totalMeshes}`);
        log(`  Prop group: ${sceneData.propGroupCount} children`);
        log(`  Ground group: ${sceneData.groundGroupCount} children`);
        log(`  Ground deco: ${sceneData.groundDecoCount} children`);
        log(`  Camera: pos=(${sceneData.cameraPosition?.x.toFixed(1)}, ${sceneData.cameraPosition?.y.toFixed(1)}), zoom=${sceneData.cameraZoom}`);

        REPORT.scenes[sceneKey] = {
          label: sceneDef.label,
          totalMeshes: sceneData.totalMeshes,
          propGroupCount: sceneData.propGroupCount,
          groundGroupCount: sceneData.groundGroupCount,
          groundDecoCount: sceneData.groundDecoCount,
        };
        REPORT.totalProps += sceneData.propGroupCount;
      }

      // -- Z-Conflict Detection --
      log('\n  --- Z-Ordering Analyse ---');
      const zResult = await detectZConflicts(page);
      if (zResult) {
        log(`  Props analysiert: ${zResult.propCount} (davon ${zResult.shadowCount} Schatten)`);
        log(`  Z-Konflikte gefunden: ${zResult.conflicts.length}`);

        if (zResult.conflicts.length > 0) {
          REPORT.totalZConflicts += zResult.conflicts.length;
          for (const c of zResult.conflicts.slice(0, 10)) {
            log(`    KONFLIKT: ${c.issue}`);
            REPORT.zConflicts.push({ scene: sceneDef.label, ...c });
          }
          if (zResult.conflicts.length > 10) {
            log(`    ... und ${zResult.conflicts.length - 10} weitere`);
          }
        }

        if (REPORT.scenes[sceneKey]) {
          REPORT.scenes[sceneKey].zConflicts = zResult.conflicts.length;
          REPORT.scenes[sceneKey].propSummary = zResult.propSummary?.slice(0, 20);
        }
      }

      // -- Material Check --
      log('\n  --- Material Check ---');
      const matResult = await checkMaterialSettings(page);
      if (matResult) {
        log(`  Props gesamt: ${matResult.totalProps}`);
        log(`  Material-Probleme: ${matResult.materialIssues.length}`);
        for (const issue of matResult.materialIssues.slice(0, 5)) {
          log(`    MATERIAL: idx=${issue.index}, size=${issue.size}, ${issue.issue}`);
        }
        if (matResult.materialIssues.length > 5) {
          log(`    ... und ${matResult.materialIssues.length - 5} weitere`);
        }
        if (REPORT.scenes[sceneKey]) {
          REPORT.scenes[sceneKey].materialIssues = matResult.materialIssues.length;
        }
      }

      // -- Camera Clipping Check --
      log('\n  --- Camera Clipping ---');
      const clipResult = await checkCameraClipping(page);
      if (clipResult) {
        log(`  Camera: pos=${clipResult.cameraPos.x},${clipResult.cameraPos.y}, zoom=${clipResult.cameraZoom}`);
        log(`  Props im Sichtfeld: ${clipResult.totalPropsInView}`);
        log(`  Voll sichtbar: ${clipResult.fullyVisible}`);
        log(`  Teilweise abgeschnitten: ${clipResult.partiallyClipped}`);
        for (const c of clipResult.clippedDetails.slice(0, 5)) {
          log(`    CLIPPED: idx=${c.index}, pos=${c.pos.x},${c.pos.y}, size=${c.size}, ${c.issue}`);
        }
        if (REPORT.scenes[sceneKey]) {
          REPORT.scenes[sceneKey].partiallyClipped = clipResult.partiallyClipped;
        }
      }

      // -- Screenshot --
      const screenshotName = `visual_${sceneDef.name}_${sceneDef.spawn.x}_${sceneDef.spawn.y}.png`;
      const screenshotPath = path.join(ARTIFACT_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath });
      log(`\n  Screenshot: ${screenshotPath}`);
      REPORT.screenshots.push(screenshotPath);

      // -- Pixel Analysis --
      log('\n  --- Pixel-Analyse ---');
      const pixelResult = await analyzeScreenshotPixels(page);
      if (pixelResult && !pixelResult.error) {
        log(`  Canvas: ${pixelResult.canvasWidth}x${pixelResult.canvasHeight}`);
        log(`  Bloecke analysiert: ${pixelResult.totalBlocks}`);
        log(`  Verdaechtige Bloecke (>80% schwarz/transparent): ${pixelResult.suspiciousBlocks}`);
        if (pixelResult.suspiciousBlocks > 0) {
          REPORT.totalArtifacts += pixelResult.suspiciousBlocks;
          for (const s of pixelResult.suspiciousDetails.slice(0, 5)) {
            log(`    VERDAECHTIG: Block (${s.bx},${s.by}), black=${s.blackRatio}, transparent=${s.transparentRatio}, avg=[${s.avgColor}]`);
          }
        }
        if (REPORT.scenes[sceneKey]) {
          REPORT.scenes[sceneKey].suspiciousBlocks = pixelResult.suspiciousBlocks;
        }
      } else if (pixelResult?.error) {
        log(`  Pixel-Analyse Fehler: ${pixelResult.error}`);
      }

    } catch (e) {
      log(`  FEHLER in Scene ${sceneDef.label}: ${e.message}`);
      if (REPORT.scenes[sceneKey]) {
        REPORT.scenes[sceneKey].error = e.message;
      }
    }
  }

  // ----------------------------------------------------------
  // 3. ADDITIONAL: Move around Hub to expose edge clipping
  // ----------------------------------------------------------
  logSection('3. HUB MOVEMENT TEST (Kanten-Clipping)');
  try {
    await page.evaluate(() => window.__game.loadScene('hub', { x: 19, y: 12 }));
    await page.waitForTimeout(2000);

    const directions = [
      { keys: ['d'], label: 'Rechts', duration: 1500 },
      { keys: ['s'], label: 'Unten', duration: 1500 },
      { keys: ['a'], label: 'Links', duration: 2000 },
      { keys: ['w'], label: 'Oben', duration: 2000 },
    ];

    for (const dir of directions) {
      for (const key of dir.keys) {
        await page.keyboard.down(key);
      }
      await page.waitForTimeout(dir.duration);
      for (const key of dir.keys) {
        await page.keyboard.up(key);
      }
      await page.waitForTimeout(300);

      const pos = await page.evaluate(() => ({
        x: window.__game.player.x.toFixed(1),
        y: window.__game.player.y.toFixed(1),
      }));
      log(`  Bewegt: ${dir.label} -> Player bei (${pos.x}, ${pos.y})`);

      const screenshotName = `visual_hub_move_${dir.label.toLowerCase()}.png`;
      const screenshotPath = path.join(ARTIFACT_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath });
      REPORT.screenshots.push(screenshotPath);

      // Quick z-conflict check at new position
      const zResult = await detectZConflicts(page);
      if (zResult && zResult.conflicts.length > 0) {
        log(`    Z-Konflikte nach Bewegung ${dir.label}: ${zResult.conflicts.length}`);
      }
    }
  } catch (e) {
    log(`  FEHLER bei Hub Movement Test: ${e.message}`);
  }

  // ----------------------------------------------------------
  // 4. LARGE PROP INVENTORY (grosse Assets identifizieren)
  // ----------------------------------------------------------
  logSection('4. GROSSE PROPS ANALYSE');
  try {
    // Load hub for final analysis
    await page.evaluate(() => window.__game.loadScene('hub', { x: 19, y: 12 }));
    await page.waitForTimeout(2000);

    const largeProps = await page.evaluate(() => {
      const game = window.__game;
      if (!game?.tileMapRenderer?.propGroup) return [];

      const props = game.tileMapRenderer.propGroup.children;
      const large = [];

      for (let i = 0; i < props.length; i++) {
        const mesh = props[i];
        if (!mesh.isMesh) continue;

        const w = mesh.geometry?.parameters?.width || 0;
        const h = mesh.geometry?.parameters?.height || 0;

        if (w >= 2 || h >= 3) {
          large.push({
            index: i,
            position: {
              x: mesh.position.x.toFixed(2),
              y: mesh.position.y.toFixed(2),
              z: mesh.position.z.toFixed(4),
            },
            size: { w, h },
            material: {
              transparent: mesh.material?.transparent,
              depthWrite: mesh.material?.depthWrite,
              alphaTest: mesh.material?.alphaTest,
              hasTexture: !!mesh.material?.map,
            },
            visible: mesh.visible,
          });
        }
      }

      return large;
    });

    log(`  Grosse Props (w>=2 oder h>=3): ${largeProps.length}`);
    for (const p of largeProps) {
      log(`    idx=${p.index}: pos=(${p.position.x}, ${p.position.y}, z=${p.position.z}), size=${p.size.w}x${p.size.h}, tex=${p.material.hasTexture}, depthWrite=${p.material.depthWrite}`);
    }

    REPORT.largeProps = largeProps;
  } catch (e) {
    log(`  FEHLER bei grosse Props Analyse: ${e.message}`);
  }

  // ----------------------------------------------------------
  // 5. RENDERER SETTINGS CHECK
  // ----------------------------------------------------------
  logSection('5. RENDERER SETTINGS');
  try {
    const rendererInfo = await page.evaluate(() => {
      const game = window.__game;
      if (!game) return null;

      const r = game.renderer;
      return {
        sortObjects: r.sortObjects,
        outputColorSpace: r.outputColorSpace,
        pixelRatio: r.getPixelRatio(),
        size: { w: r.domElement.width, h: r.domElement.height },
        // Check if scene uses custom render order
        sceneAutoUpdate: game.scene.matrixAutoUpdate,
        sceneChildCount: game.scene.children.length,
      };
    });

    if (rendererInfo) {
      log(`  sortObjects: ${rendererInfo.sortObjects}`);
      log(`  outputColorSpace: ${rendererInfo.outputColorSpace}`);
      log(`  pixelRatio: ${rendererInfo.pixelRatio}`);
      log(`  Canvas: ${rendererInfo.size.w}x${rendererInfo.size.h}`);
      log(`  Scene children: ${rendererInfo.sceneChildCount}`);
      REPORT.rendererSettings = rendererInfo;
    }
  } catch (e) {
    log(`  FEHLER bei Renderer Settings: ${e.message}`);
  }

  // ----------------------------------------------------------
  // FINAL REPORT
  // ----------------------------------------------------------
  logSection('ZUSAMMENFASSUNG');

  log('\n  Scenes analysiert:');
  for (const [key, data] of Object.entries(REPORT.scenes)) {
    const zc = data.zConflicts || 0;
    const mi = data.materialIssues || 0;
    const pc = data.partiallyClipped || 0;
    const sb = data.suspiciousBlocks || 0;
    const icon = (zc > 0 || mi > 0) ? '[!]' : '[OK]';
    log(`    ${icon} ${data.label}: ${data.propGroupCount || 0} Props, ${zc} Z-Konflikte, ${mi} Mat-Issues, ${pc} Clipped, ${sb} verdaechtige Pixel-Bloecke`);
  }

  log(`\n  Gesamt:`);
  log(`    Props gesamt: ${REPORT.totalProps}`);
  log(`    Z-Konflikte gesamt: ${REPORT.totalZConflicts}`);
  log(`    Verdaechtige Pixel-Bloecke: ${REPORT.totalArtifacts}`);
  log(`    Konsolen-Fehler: ${REPORT.consoleErrors.length}`);
  log(`    Screenshots: ${REPORT.screenshots.length}`);

  if (REPORT.consoleErrors.length > 0) {
    log('\n  Konsolen-Fehler:');
    for (const err of REPORT.consoleErrors.slice(0, 10)) {
      log(`    ${err.substring(0, 120)}`);
    }
  }

  log('\n  Screenshot-Pfade:');
  for (const s of REPORT.screenshots) {
    log(`    ${s}`);
  }

  // Save JSON report
  const reportPath = path.join(ARTIFACT_DIR, 'visual-clipping-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(REPORT, null, 2), 'utf-8');
  log(`\n  Report gespeichert: ${reportPath}`);

  log('\n' + '='.repeat(60));
  log('  DIAGNOSTIC COMPLETE');
  log('='.repeat(60) + '\n');

  await browser.close();
  process.exit(0);
})();
