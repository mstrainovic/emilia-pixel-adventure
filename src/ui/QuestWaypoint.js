/**
 * QuestWaypoint — DOM-basierter goldener Wegweiser-Pfeil am Bildschirmrand.
 *
 * Zeigt einen pulsierenden Pixel-Art-Pfeil der auf das aktuelle Quest-Ziel
 * zeigt. Bei Cross-Scene-Navigation wird auf den naechsten Szenenausgang
 * gezeigt, mit einem Label das die Ziel-Szene benennt.
 */

// ── Quest → Ziel-Szene Zuordnung ──
const QUEST_SCENE_MAP = {
  first_steps:      { scene: 'hub',           target: { x: 8, y: 11 } },
  wood_collector:   { scene: 'forest',        target: null },
  nature_healer:    { scene: 'forest',        target: null },
  slime_hunter:     { scene: 'forest',        target: null },
  lake_visitor:     { scene: 'lake',          target: null },
  dungeon_explorer: { scene: 'dungeon',       target: null },
  master_cook:      { scene: 'hub',           target: { x: 7, y: 8 } },
  skeleton_slayer:  { scene: 'dungeon',       target: null },
  unicorn_friend:   { scene: 'unicorn_meadow', target: null },
  master_crafter:   { scene: 'hub',           target: { x: 29, y: 8 } },
  shell_collector:  { scene: 'beach',         target: null },
  master_angler:    { scene: 'lake',          target: null },
  crab_problem:     { scene: 'beach',         target: null },
  coral_healer:     { scene: 'grotto',        target: null },
  deep_explorer:    { scene: 'grotto',        target: null },
  sunken_treasure:  { scene: 'grotto',        target: null },
  cloud_jumper:     { scene: 'cloud_castle',  target: null },
  crystal_puzzle:   { scene: 'cloud_castle',  target: null },
  shadow_slayer:    { scene: 'cloud_castle',  target: null },
  secret_heroine:   { scene: 'starsky',       target: null },
};

// ── Szenen-Ausgaenge (Tile-Koordinaten) ──
const SCENE_EXITS = {
  hub:            { forest: { x: 20, y: 1 },  lake: { x: 20, y: 29 }, dungeon: { x: 39, y: 15 } },
  forest:         { hub: { x: 25, y: 39 },    unicorn_meadow: { x: 25, y: 1 } },
  lake:           { hub: { x: 22, y: 1 },     beach: { x: 22, y: 35 } },
  beach:          { lake: { x: 27, y: 6 } },
  dungeon:        { hub: { x: 1, y: 15 },     grotto: { x: 35, y: 15 } },
  grotto:         { dungeon: { x: 1, y: 5 } },
  unicorn_meadow: { forest: { x: 12, y: 19 }, cloud_castle: { x: 12, y: 1 } },
  cloud_castle:   { unicorn_meadow: { x: 14, y: 43 }, starsky: { x: 38, y: 1 } },
  starsky:        { cloud_castle: { x: 15, y: 24 } },
};

// ── Szenen-Graph fuer BFS-Routing ──
const SCENE_GRAPH = {
  hub:            ['forest', 'lake', 'dungeon'],
  forest:         ['hub', 'unicorn_meadow'],
  lake:           ['hub', 'beach'],
  beach:          ['lake'],
  dungeon:        ['hub', 'grotto'],
  grotto:         ['dungeon'],
  unicorn_meadow: ['forest', 'cloud_castle'],
  cloud_castle:   ['unicorn_meadow', 'starsky'],
  starsky:        ['cloud_castle'],
};

// ── Szenen-Namen fuer Labels ──
const SCENE_LABELS = {
  hub:            'Dorf',
  forest:         'Wald',
  lake:           'See',
  beach:          'Strand',
  dungeon:        'Kerker',
  grotto:         'Grotte',
  unicorn_meadow: 'Wiese',
  cloud_castle:   'Wolkenburg',
  starsky:        'Sternenhimmel',
};

// ── Pixel-Art Pfeil als Canvas generieren ──
function _createArrowImage() {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');

  // Goldener Pfeil nach rechts (wird spaeter via CSS rotiert)
  // Pfeilspitze rechts, Stiel links
  const gold = '#FFD700';
  const darkGold = '#DAA520';
  const lightGold = '#FFEC8B';

  // Stiel (horizontal, Mitte)
  ctx.fillStyle = gold;
  ctx.fillRect(2, 13, 18, 6);

  // Stiel-Schatten (unten)
  ctx.fillStyle = darkGold;
  ctx.fillRect(2, 17, 18, 2);

  // Stiel-Highlight (oben)
  ctx.fillStyle = lightGold;
  ctx.fillRect(2, 13, 18, 2);

  // Pfeilspitze (Dreieck nach rechts)
  ctx.fillStyle = gold;
  // Reihe fuer Reihe (Pixel-Art Dreieck)
  const tipRows = [
    { y: 6,  x: 20, w: 2 },
    { y: 7,  x: 20, w: 4 },
    { y: 8,  x: 20, w: 6 },
    { y: 9,  x: 20, w: 8 },
    { y: 10, x: 20, w: 10 },
    { y: 11, x: 20, w: 12 },
    { y: 12, x: 20, w: 12 },
    { y: 13, x: 20, w: 12 },
    { y: 14, x: 20, w: 12 },
    { y: 15, x: 20, w: 12 },
    { y: 16, x: 20, w: 12 },
    { y: 17, x: 20, w: 12 },
    { y: 18, x: 20, w: 12 },
    { y: 19, x: 20, w: 10 },
    { y: 20, x: 20, w: 8 },
    { y: 21, x: 20, w: 6 },
    { y: 22, x: 20, w: 4 },
    { y: 23, x: 20, w: 2 },
  ];
  for (const row of tipRows) {
    ctx.fillStyle = gold;
    ctx.fillRect(row.x, row.y, row.w, 1);
  }

  // Highlight auf oberer Haelfte der Spitze
  ctx.fillStyle = lightGold;
  for (const row of tipRows.slice(0, 6)) {
    ctx.fillRect(row.x, row.y, Math.max(1, row.w - 2), 1);
  }

  // Schatten auf unterer Haelfte der Spitze
  ctx.fillStyle = darkGold;
  for (const row of tipRows.slice(12)) {
    ctx.fillRect(row.x + 1, row.y, row.w - 1, 1);
  }

  // Schwarzer Umriss (1px, nur aussen)
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 0.4;
  // Oberkante Stiel
  ctx.fillRect(2, 12, 18, 1);
  // Unterkante Stiel
  ctx.fillRect(2, 19, 18, 1);
  // Linke Kante Stiel
  ctx.fillRect(1, 13, 1, 6);
  // Spitzen-Umriss (vereinfacht: obere und untere Kante)
  for (let i = 0; i < tipRows.length; i++) {
    const row = tipRows[i];
    ctx.fillRect(row.x + row.w, row.y, 1, 1);
  }
  ctx.globalAlpha = 1;

  return c.toDataURL();
}

// ── Viewport-Margin fuer "im Sichtbereich" ──
const VIEWPORT_MARGIN = 80;
// Abstand des Pfeils vom Bildschirmrand
const EDGE_PADDING = 36;

export class QuestWaypoint {
  constructor() {
    this._visible = false;
    this._crossScene = false;
    this._targetSceneLabel = '';

    // Container-Element
    this.el = document.createElement('div');
    this.el.className = 'quest-waypoint';
    this.el.style.cssText = `
      position: fixed;
      z-index: 450;
      pointer-events: none;
      width: 32px;
      height: 32px;
      background-image: url(${_createArrowImage()});
      background-size: contain;
      background-repeat: no-repeat;
      image-rendering: pixelated;
      transform-origin: center center;
      display: none;
      filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
    `;

    // Szene-Label unter dem Pfeil
    this._label = document.createElement('div');
    this._label.className = 'quest-waypoint-label';
    this._label.style.cssText = `
      position: absolute;
      top: 34px;
      left: 50%;
      transform: translateX(-50%);
      font-family: monospace, sans-serif;
      font-size: 10px;
      font-weight: bold;
      color: #FFD700;
      text-shadow: 0 0 3px rgba(0,0,0,0.8), 1px 1px 0 #000;
      white-space: nowrap;
      display: none;
    `;
    this.el.appendChild(this._label);

    // Pulsier-Animation injizieren (einmalig)
    if (!document.getElementById('quest-waypoint-style')) {
      const style = document.createElement('style');
      style.id = 'quest-waypoint-style';
      style.textContent = `
        .quest-waypoint {
          animation: quest-arrow-pulse 1.5s ease-in-out infinite;
        }
        @keyframes quest-arrow-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) scale(1.2);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this.el);
  }

  /**
   * Jeden Frame aufrufen.
   * @param {object|null} quest - Rueckgabe von progression.getActiveQuest()
   * @param {number} playerX - Spieler Welt-X (Tiles)
   * @param {number} playerY - Spieler Welt-Y (Tiles)
   * @param {string} currentScene - Aktueller Szenen-Name
   * @param {object} camera - Camera-Instanz (hat .cam / .three als OrthographicCamera)
   */
  update(quest, playerX, playerY, currentScene, camera) {
    // Kein aktives Quest oder Quest nicht in der Map → verstecken
    if (!quest || !quest.id || !QUEST_SCENE_MAP[quest.id]) {
      this.hide();
      return;
    }

    // Ziel-Koordinaten berechnen
    const resolved = this._resolveTarget(quest, currentScene);
    if (!resolved) {
      this.hide();
      return;
    }

    const { wx, wy, crossScene, targetScene } = resolved;
    this._crossScene = crossScene;
    this._targetSceneLabel = crossScene ? (SCENE_LABELS[targetScene] || targetScene) : '';

    // OrthographicCamera holen
    const cam = camera.cam || camera.three || camera;

    // Welt-zu-Bildschirm
    const screen = this._worldToScreen(wx, wy, cam);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Pruefen ob das Ziel im sichtbaren Bereich liegt
    if (
      screen.x >= VIEWPORT_MARGIN &&
      screen.x <= vw - VIEWPORT_MARGIN &&
      screen.y >= VIEWPORT_MARGIN &&
      screen.y <= vh - VIEWPORT_MARGIN
    ) {
      this.hide();
      return;
    }

    // Pfeil auf den Bildschirmrand projizieren
    const cx = vw / 2;
    const cy = vh / 2;
    const clamped = this._clampToEdge(screen.x, screen.y, cx, cy);

    // Winkel berechnen (0 = rechts, CSS rotation)
    const angle = Math.atan2(screen.y - cy, screen.x - cx);
    const angleDeg = angle * (180 / Math.PI);

    // Position und Rotation setzen
    this.el.style.left = clamped.x + 'px';
    this.el.style.top = clamped.y + 'px';
    this.el.style.setProperty('--angle', angleDeg + 'deg');

    // Label aktualisieren
    if (this._crossScene && this._targetSceneLabel) {
      this._label.textContent = '\u2192 ' + this._targetSceneLabel;
      this._label.style.display = 'block';
    } else {
      this._label.style.display = 'none';
    }

    this.show();
  }

  /**
   * Ziel-Koordinaten fuer den Pfeil berechnen.
   * Gleiche Szene → direktes Ziel (falls vorhanden).
   * Andere Szene → BFS zum naechsten Ausgang.
   */
  _resolveTarget(quest, currentScene) {
    const mapping = QUEST_SCENE_MAP[quest.id];
    if (!mapping) return null;

    const targetScene = mapping.scene;

    // Spieler ist bereits in der Ziel-Szene
    if (currentScene === targetScene) {
      if (mapping.target) {
        return {
          wx: mapping.target.x,
          wy: mapping.target.y,
          crossScene: false,
          targetScene,
        };
      }
      // Kein spezifisches Ziel in der richtigen Szene → kein Pfeil
      return null;
    }

    // Andere Szene → naechsten Szenenausgang via BFS finden
    const nextScene = this._findNextScene(currentScene, targetScene);
    if (!nextScene) return null;

    // Exit-Koordinaten fuer den naechsten Schritt
    const exits = SCENE_EXITS[currentScene];
    if (!exits || !exits[nextScene]) return null;

    const exitPos = exits[nextScene];
    return {
      wx: exitPos.x,
      wy: exitPos.y,
      crossScene: true,
      targetScene: nextScene,
    };
  }

  /**
   * BFS ueber SCENE_GRAPH: Finde die naechste Szene auf dem Weg von `from` nach `to`.
   * Gibt den ersten Schritt (Nachbar-Szene) zurueck.
   */
  _findNextScene(from, to) {
    if (from === to) return null;

    const queue = [from];
    const visited = new Set([from]);
    const parent = { [from]: null };

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = SCENE_GRAPH[current] || [];

      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        parent[neighbor] = current;

        if (neighbor === to) {
          // Pfad zurueckverfolgen bis zum ersten Schritt nach `from`
          let step = to;
          while (parent[step] !== from) {
            step = parent[step];
          }
          return step;
        }

        queue.push(neighbor);
      }
    }

    // Kein Pfad gefunden
    return null;
  }

  /**
   * Welt-Koordinaten (Tiles) → Bildschirm-Pixel via OrthographicCamera.
   * Nutzt die gleiche Projektion wie THREE.js:
   *   screenX = (ndcX + 1) / 2 * viewportWidth
   *   screenY = (1 - ndcY) / 2 * viewportHeight
   */
  _worldToScreen(wx, wy, cam) {
    // In der Spielwelt: X = rechts, Y = unten (Tile-Koordinaten)
    // THREE.js: X = rechts, Y = oben → daher -wy
    const worldX = wx;
    const worldY = -wy;

    // NDC berechnen (Normalized Device Coordinates)
    const ndcX = (worldX - cam.position.x) / ((cam.right - cam.left) / 2);
    const ndcY = (worldY - cam.position.y) / ((cam.top - cam.bottom) / 2);

    // Zu Bildschirm-Pixeln
    const screenX = (ndcX + 1) / 2 * window.innerWidth;
    const screenY = (1 - ndcY) / 2 * window.innerHeight;

    return { x: screenX, y: screenY };
  }

  /**
   * Punkt (sx, sy) auf den Bildschirmrand projizieren.
   * Berechnet den Schnittpunkt der Linie vom Zentrum (cx, cy) zum Punkt
   * mit dem Viewport-Rechteck (unter Beruecksichtigung von EDGE_PADDING).
   */
  _clampToEdge(sx, sy, cx, cy) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = EDGE_PADDING;

    // Richtungsvektor
    const dx = sx - cx;
    const dy = sy - cy;

    // Skalierungsfaktoren fuer die vier Raender
    const scales = [];

    if (dx !== 0) {
      // Rechter Rand
      const tRight = (vw - pad - cx) / dx;
      if (tRight > 0) scales.push(tRight);
      // Linker Rand
      const tLeft = (pad - cx) / dx;
      if (tLeft > 0) scales.push(tLeft);
    }
    if (dy !== 0) {
      // Unterer Rand
      const tBottom = (vh - pad - cy) / dy;
      if (tBottom > 0) scales.push(tBottom);
      // Oberer Rand
      const tTop = (pad - cy) / dy;
      if (tTop > 0) scales.push(tTop);
    }

    if (scales.length === 0) {
      return { x: cx, y: cy };
    }

    // Kleinster positiver Skalierungsfaktor = erster Rand-Treffer
    const t = Math.min(...scales);

    return {
      x: Math.round(cx + dx * t),
      y: Math.round(cy + dy * t),
    };
  }

  show() {
    if (!this._visible) {
      this.el.style.display = 'block';
      this._visible = true;
    }
  }

  hide() {
    if (this._visible) {
      this.el.style.display = 'none';
      this._visible = false;
    }
  }

  dispose() {
    this.hide();
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
