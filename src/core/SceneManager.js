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
    this.fadeDuration = 0.4; // seconds per fade direction
    this.fadeElapsed = 0;
    this._switching = false;

    // Fade overlay (HTML element over the canvas)
    this.overlay = document.createElement('div');
    this.overlay.id = 'scene-fade';
    this.overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; opacity: 0; pointer-events: none; z-index: 500;
      transition: none;
    `;
    document.body.appendChild(this.overlay);
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
    this.fadeDirection = 1; // start fading out
    this.fadeElapsed = 0;
    this.fadeAlpha = 0;
  }

  update(dt) {
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

      if (this.fadeAlpha <= 0) {
        this.transitioning = false;
        this.fadeDirection = 0;
        this.overlay.style.opacity = 0;
      }
    }
  }

  async _performSwitch() {
    this.currentScene = this.pendingTarget;
    await this.game.loadScene(this.pendingTarget, this.pendingSpawn);
  }

  dispose() {
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
