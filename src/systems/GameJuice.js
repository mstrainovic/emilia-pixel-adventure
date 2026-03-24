/**
 * GameJuice — Professional game-feel effects system.
 *
 * Implements the core "juice" effects that make games FEEL good:
 * - Camera shake (on hit, explosion, impact)
 * - Hitstop (brief frame freeze on heavy impacts)
 * - Damage flash (red screen overlay when player takes damage)
 * - Knockback (push mobs away on hit)
 * - Scale bounce (items, UI elements, pickups)
 * - Screenpunch (directional camera push)
 *
 * Architecture: Pooled effects with zero per-frame allocation.
 * All timers use delta-time for frame-independent behavior.
 */

export class GameJuice {
  constructor() {
    // ── Camera Shake ──
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeDecay = 0.9; // exponential decay per frame

    // ── Hitstop (frame freeze) ──
    this.hitstopTimer = 0;
    this.hitstopActive = false;

    // ── Damage Flash ──
    this.flashOverlay = null;
    this.flashTimer = 0;
    this.flashDuration = 0;
    this.flashColor = 'rgba(255, 0, 0, 0.3)';
    this._createFlashOverlay();

    // ── Screenpunch ──
    this.punchX = 0;
    this.punchY = 0;
    this.punchDecay = 0.85;

    // ── Scale bounce queue (for meshes) ──
    this.bounceTargets = []; // { mesh, timer, duration, scaleFrom, scaleTo }

    // ── Pooled: reusable sine table for shake ──
    this._sineTable = new Float32Array(64);
    for (let i = 0; i < 64; i++) {
      this._sineTable[i] = Math.sin(i * 0.49);
    }
    this._shakeIndex = 0;
  }

  // ──────────────────────────────────────
  // CAMERA SHAKE
  // ──────────────────────────────────────

  /**
   * Trigger camera shake.
   * @param {number} intensity — pixels of max offset (0.1 = subtle, 0.5 = heavy)
   * @param {number} duration — seconds
   */
  shake(intensity = 0.3, duration = 0.2) {
    // Stack shakes: use max intensity, extend duration
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
    this.shakeTimer = this.shakeDuration;
  }

  /**
   * Small shake for light hits.
   */
  shakeLight() { this.shake(0.15, 0.12); }

  /**
   * Medium shake for normal combat.
   */
  shakeMedium() { this.shake(0.3, 0.2); }

  /**
   * Heavy shake for big impacts (boss hit, explosion).
   */
  shakeHeavy() { this.shake(0.6, 0.35); }

  // ──────────────────────────────────────
  // HITSTOP (Frame Freeze)
  // ──────────────────────────────────────

  /**
   * Freeze the game for a brief moment on impact.
   * Professional games use 2-5 frames of hitstop.
   * @param {number} duration — seconds (0.05 = 3 frames at 60fps)
   */
  hitstop(duration = 0.06) {
    this.hitstopTimer = duration;
    this.hitstopActive = true;
  }

  /**
   * Returns true if game should skip logic this frame (frozen).
   */
  get isFrozen() {
    return this.hitstopActive;
  }

  // ──────────────────────────────────────
  // DAMAGE FLASH
  // ──────────────────────────────────────

  /**
   * Flash the screen with a color overlay (e.g., red on damage).
   * @param {string} color — CSS rgba color
   * @param {number} duration — seconds
   */
  flash(color = 'rgba(255, 50, 50, 0.35)', duration = 0.15) {
    this.flashColor = color;
    this.flashDuration = duration;
    this.flashTimer = duration;
    if (this.flashOverlay) {
      this.flashOverlay.style.background = color;
      this.flashOverlay.style.opacity = '1';
      this.flashOverlay.style.display = 'block';
    }
  }

  /**
   * Red flash when player takes damage.
   */
  damageFlash() {
    this.flash('rgba(255, 30, 30, 0.3)', 0.18);
    this.shakeLight();
  }

  /**
   * White flash for critical/special moments.
   */
  whiteFlash() {
    this.flash('rgba(255, 255, 255, 0.5)', 0.1);
  }

  /**
   * Green flash for healing.
   */
  healFlash() {
    this.flash('rgba(50, 255, 100, 0.2)', 0.3);
  }

  // ──────────────────────────────────────
  // SCREENPUNCH (directional camera push)
  // ──────────────────────────────────────

  /**
   * Push the camera in a direction (e.g., away from an explosion).
   */
  punch(dx, dy, strength = 0.5) {
    this.punchX += dx * strength;
    this.punchY += dy * strength;
  }

  // ──────────────────────────────────────
  // SCALE BOUNCE
  // ──────────────────────────────────────

  /**
   * Make a mesh "pop" with a scale bounce (grow then shrink back).
   * Great for item pickups, UI buttons, level-up effects.
   * @param {THREE.Mesh} mesh
   * @param {number} scaleTo — peak scale multiplier (1.4 = 40% bigger)
   * @param {number} duration — total bounce time in seconds
   */
  scaleBounce(mesh, scaleTo = 1.4, duration = 0.25) {
    if (!mesh) return;
    this.bounceTargets.push({
      mesh,
      timer: 0,
      duration,
      baseScaleX: mesh.scale.x,
      baseScaleY: mesh.scale.y,
      scaleTo,
    });
  }

  // ──────────────────────────────────────
  // UPDATE (call every frame)
  // ──────────────────────────────────────

  update(dt, camera) {
    // ── Hitstop ──
    if (this.hitstopActive) {
      this.hitstopTimer -= dt;
      if (this.hitstopTimer <= 0) {
        this.hitstopActive = false;
        this.hitstopTimer = 0;
      }
    }

    // ── Camera Shake ──
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = this.shakeTimer / this.shakeDuration;
      const decay = t * t; // quadratic falloff

      // Use pre-computed sine table for zero-alloc noise
      this._shakeIndex = (this._shakeIndex + 3) % 64;
      const noise1 = this._sineTable[this._shakeIndex];
      this._shakeIndex = (this._shakeIndex + 7) % 64;
      const noise2 = this._sineTable[this._shakeIndex];

      this.shakeOffsetX = noise1 * this.shakeIntensity * decay;
      this.shakeOffsetY = noise2 * this.shakeIntensity * decay;

      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    }

    // ── Screenpunch decay ──
    this.punchX *= this.punchDecay;
    this.punchY *= this.punchDecay;
    if (Math.abs(this.punchX) < 0.001) this.punchX = 0;
    if (Math.abs(this.punchY) < 0.001) this.punchY = 0;

    // ── Apply camera offsets ──
    if (camera) {
      camera.position.x += this.shakeOffsetX + this.punchX;
      camera.position.y += this.shakeOffsetY + this.punchY;
    }

    // ── Damage Flash ──
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      const opacity = Math.max(0, this.flashTimer / this.flashDuration);
      if (this.flashOverlay) {
        this.flashOverlay.style.opacity = opacity.toString();
      }
      if (this.flashTimer <= 0 && this.flashOverlay) {
        this.flashOverlay.style.display = 'none';
      }
    }

    // ── Scale Bounces ──
    for (let i = this.bounceTargets.length - 1; i >= 0; i--) {
      const b = this.bounceTargets[i];
      b.timer += dt;
      const t = b.timer / b.duration;

      if (t >= 1) {
        // Restore original scale
        b.mesh.scale.x = b.baseScaleX;
        b.mesh.scale.y = b.baseScaleY;
        this.bounceTargets.splice(i, 1);
      } else {
        // Elastic bounce: overshoot then settle
        // Using sin curve: peaks at t=0.3, settles at t=1
        const bounce = Math.sin(t * Math.PI) * (1 - t);
        const scale = 1 + (b.scaleTo - 1) * bounce;
        b.mesh.scale.x = b.baseScaleX * scale;
        b.mesh.scale.y = b.baseScaleY * scale;
      }
    }
  }

  // ──────────────────────────────────────
  // INTERNAL
  // ──────────────────────────────────────

  _createFlashOverlay() {
    this.flashOverlay = document.createElement('div');
    this.flashOverlay.id = 'juice-flash';
    this.flashOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 150;
      display: none; opacity: 0;
      transition: none;
    `;
    document.body.appendChild(this.flashOverlay);
  }

  dispose() {
    if (this.flashOverlay && this.flashOverlay.parentNode) {
      this.flashOverlay.remove();
    }
    this.bounceTargets = [];
  }
}

// ──────────────────────────────────────
// KNOCKBACK UTILITY
// ──────────────────────────────────────

/**
 * Apply knockback to a mob away from the attacker.
 * @param {object} mob — entity with x, y properties
 * @param {object} attacker — entity with x, y properties
 * @param {number} force — knockback distance in tiles
 * @param {number} duration — how long the knockback lasts (seconds)
 */
export function applyKnockback(mob, attacker, force = 1.5, duration = 0.15) {
  const dx = mob.x - attacker.x;
  const dy = mob.y - attacker.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return;

  const nx = dx / len;
  const ny = dy / len;

  // Store knockback velocity on mob
  mob._knockbackVX = nx * force / duration;
  mob._knockbackVY = ny * force / duration;
  mob._knockbackTimer = duration;
}

/**
 * Update knockback movement. Call in mob's update loop.
 */
export function updateKnockback(mob, dt) {
  if (!mob._knockbackTimer || mob._knockbackTimer <= 0) return;

  mob._knockbackTimer -= dt;
  const t = Math.max(0, mob._knockbackTimer);

  // Apply knockback with deceleration
  mob.x += mob._knockbackVX * dt * (t / 0.15);
  mob.y += mob._knockbackVY * dt * (t / 0.15);

  if (mob._knockbackTimer <= 0) {
    mob._knockbackVX = 0;
    mob._knockbackVY = 0;
  }
}
