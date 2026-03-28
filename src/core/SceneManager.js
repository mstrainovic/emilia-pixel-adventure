import * as THREE from 'three';

/**
 * Manages map transitions with a fade overlay.
 * Each "scene" is a map name (hub, forest, dungeon, lake, unicorn_meadow).
 */
export class SceneManager {
  constructor(game) {
    this.game = game;
    this.currentScene = 'hub';
    this.transitioning = false;
    this.fadeAlpha = 0;
    this.fadeDirection = 0; // 0=none, 1=fading out, -1=fading in
    this.pendingTarget = null;
    this.pendingSpawn = null;
    this.fadeDuration = 0.5; // seconds per fade direction (slightly slower for polish)
    this.fadeElapsed = 0;
    this._switching = false;

    // Scene-specific fade colors for atmospheric transitions
    this._fadeColors = {
      hub: '#1a3520',
      forest: '#0a2a10',
      dungeon: '#0a0a18',
      lake: '#0a1a2a',
      unicorn_meadow: '#1a2030',
      beach: '#1a2a30',
      grotto: '#050a1a',
      cloud_castle: '#e8e8f0',
      starsky: '#000005',
    };

    // Fade overlay (HTML element over the canvas)
    this.overlay = document.createElement('div');
    this.overlay.id = 'scene-fade';
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; opacity: 0; pointer-events: none; z-index: 500;
      transition: none;
    `;
    document.body.appendChild(this.overlay);

    // Scene name overlay
    this._nameOverlay = document.createElement('div');
    this._nameOverlay.id = 'scene-name';
    this._nameOverlay.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: #fff; font-family: 'Press Start 2P', monospace; font-size: 14px;
      text-shadow: 0 0 20px rgba(255,215,0,0.5), 2px 2px 0 rgba(0,0,0,0.8);
      letter-spacing: 2px; opacity: 0; pointer-events: none; z-index: 501;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(this._nameOverlay);
    this._nameTimer = 0;
  }

  /**
   * Check if the player is standing on an exit zone.
   */
  checkExits(player, tileMap) {
    if (this.transitioning) return;
    if (!tileMap || !tileMap.exits) return;

    for (const exit of tileMap.exits) {
      if (
        player.x >= exit.x && player.x < exit.x + exit.w &&
        player.y >= exit.y && player.y < exit.y + exit.h
      ) {
        // Scene access gate hook
        if (this.beforeTransition) {
          const blocked = this.beforeTransition(exit.target, exit);
          if (blocked) return; // gate blocked the transition
        }
        this.transition(exit.target, exit.spawnX, exit.spawnY);
        return;
      }
    }
  }

  transition(target, spawnX, spawnY) {
    if (this.transitioning || this._switching) return;
    this.transitioning = true;
    this._switching = false;
    if (window.__game?.audio) window.__game.audio.playTransition();
    this.pendingTarget = target;
    // Use provided spawn point, or let Game._buildScene use the map's playerSpawn
    this.pendingSpawn = {
      x: spawnX !== undefined ? spawnX : null,
      y: spawnY !== undefined ? spawnY : null
    };

    // Set fade color: blend current scene color → target scene color
    const targetColor = this._fadeColors[target] || '#000';
    this.overlay.style.background = targetColor;

    this.fadeDirection = 1; // start fading out
    this.fadeElapsed = 0;
    this.fadeAlpha = 0;
  }

  update(dt) {
    // Scene name fade-out runs independently of transitions
    if (this._nameTimer > 0) {
      this._nameTimer -= dt;
      if (this._nameTimer <= 0.5) {
        this._nameOverlay.style.opacity = String(Math.max(0, this._nameTimer / 0.5));
      }
      if (this._nameTimer <= 0) {
        this._nameTimer = 0;
        this._nameOverlay.style.opacity = '0';
      }
    }

    if (!this.transitioning) return;

    this.fadeElapsed += dt;

    if (this.fadeDirection === 1) {
      // Fading out (going dark)
      this.fadeAlpha = Math.min(1, this.fadeElapsed / this.fadeDuration);
      this.overlay.style.opacity = this.fadeAlpha;

      if (this.fadeAlpha >= 1 && !this._switching) {
        // Screen is black — switch map (await async loadScene)
        this._switching = true;
        this._performSwitch().then(() => {
          this._switching = false;
          this.fadeDirection = -1;
          this.fadeElapsed = 0;
        }).catch((err) => {
          console.error('Scene switch failed:', err);
          this._switching = false;
          this.fadeDirection = -1;
          this.fadeElapsed = 0;
        });
      }
    } else if (this.fadeDirection === -1) {
      // Fading in (revealing new map)
      this.fadeAlpha = Math.max(0, 1 - this.fadeElapsed / this.fadeDuration);
      this.overlay.style.opacity = this.fadeAlpha;

      // Show scene name briefly at start of fade-in
      if (this.fadeElapsed < 0.05 && this._nameOverlay) {
        this._showSceneName(this.currentScene);
      }

      if (this.fadeAlpha <= 0) {
        this.transitioning = false;
        this.fadeDirection = 0;
        this.overlay.style.opacity = 0;
      }
    }

  }

  _showSceneName(sceneName) {
    const names = {
      hub: 'Emilias Dorf',
      forest: 'Der Zauberwald',
      dungeon: 'Die Kristallhoehle',
      lake: 'Der Mondsee',
      unicorn_meadow: 'Einhornwiese',
      beach: 'Goldstrand',
      grotto: 'Die Tiefengrotte',
      cloud_castle: 'Wolkenschloss',
      starsky: 'Sternenhimmel',
    };
    const displayName = names[sceneName];
    if (!displayName) return;
    this._nameOverlay.textContent = displayName;
    this._nameOverlay.style.opacity = '1';
    this._nameTimer = 2.5; // visible for 2.5s total
  }

  async _performSwitch() {
    this.currentScene = this.pendingTarget;
    await this.game.loadScene(this.pendingTarget, this.pendingSpawn);
  }

  dispose() {
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this._nameOverlay?.parentNode) {
      this._nameOverlay.parentNode.removeChild(this._nameOverlay);
    }
  }
}
