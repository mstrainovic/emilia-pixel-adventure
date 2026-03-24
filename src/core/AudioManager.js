/**
 * AudioManager — Procedural chiptune audio system.
 * All sounds generated via Web Audio API oscillators (no external files needed).
 * Child-friendly: soft, melodic, never startling.
 */
export class AudioManager {
  constructor() {
    this.ctx = null; // AudioContext, created on first user gesture
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.muted = localStorage.getItem('emilia_muted') === 'true';
    this.masterVolume = 0.4; // default 40% — child-friendly
    this.musicVolume = 0.35;
    this.sfxVolume = 0.5;

    this._initialized = false;
    this._currentMusic = null; // { stop(), scene }
    this._ambientNodes = [];
  }

  /**
   * Initialize AudioContext (must be called after user gesture).
   */
  init() {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this._updateVolumes();
      this._initialized = true;
    } catch (e) {
      console.warn('AudioManager: Web Audio not available', e);
    }
  }

  _ensureCtx() {
    if (!this._initialized) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
    return this._initialized;
  }

  _updateVolumes() {
    if (!this.masterGain) return;
    const vol = this.muted ? 0 : this.masterVolume;
    this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('emilia_muted', this.muted);
    this._updateVolumes();
    return this.muted;
  }

  // ─── OSCILLATOR HELPERS ───

  /**
   * Play a single tone with envelope.
   * @returns {GainNode} the envelope gain for chaining
   */
  _tone(freq, type, duration, startTime, volume = 0.3, destination = null) {
    if (!this._ensureCtx()) return null;
    const t = startTime || this.ctx.currentTime;
    const dest = destination || this.sfxGain;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.connect(gain);
    gain.connect(dest);

    // Soft envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.linearRampToValueAtTime(volume * 0.7, t + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.05);
    return gain;
  }

  /**
   * Play noise burst (for percussion/hits).
   */
  _noise(duration, startTime, volume = 0.1, filterFreq = 2000) {
    if (!this._ensureCtx()) return;
    const t = startTime || this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
    src.stop(t + duration + 0.01);
  }

  // ─── SOUND EFFECTS ───

  /** Sword swing — soft whoosh */
  playSwordSwing() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._noise(0.12, t, 0.08, 3000);
    this._tone(300, 'triangle', 0.08, t, 0.1);
    // Descending pitch for "swish"
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    g.gain.setValueAtTime(0.08, t);
    g.gain.linearRampToValueAtTime(0, t + 0.12);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** Player takes damage — soft "ouch" */
  playPlayerHurt() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(350, 'square', 0.06, t, 0.08);
    this._tone(250, 'square', 0.08, t + 0.06, 0.06);
    this._tone(200, 'triangle', 0.1, t + 0.12, 0.05);
  }

  /** Player death — sad descending */
  playPlayerDeath() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    const notes = [392, 349, 311, 262, 220];
    notes.forEach((f, i) => this._tone(f, 'triangle', 0.25, t + i * 0.2, 0.1));
  }

  /** Heal — warm ascending chime */
  playHeal() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) =>
      this._tone(f, 'sine', 0.2, t + i * 0.08, 0.1)
    );
  }

  /** Item pickup — happy "pling!" */
  playItemPickup() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(880, 'square', 0.06, t, 0.08);
    this._tone(1175, 'square', 0.1, t + 0.06, 0.06);
  }

  /** Resource gather — wood chop */
  playChop() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._noise(0.06, t, 0.1, 1500);
    this._tone(180, 'square', 0.05, t, 0.08);
    this._tone(120, 'triangle', 0.08, t + 0.04, 0.05);
  }

  /** Resource gather — mine/stone */
  playMine() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(800, 'square', 0.03, t, 0.08);
    this._tone(600, 'square', 0.03, t + 0.05, 0.06);
    this._noise(0.04, t, 0.06, 4000);
  }

  /** Level up — triumphant fanfare */
  playLevelUp() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    // Ascending fanfare
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((f, i) => {
      this._tone(f, 'square', 0.15, t + i * 0.1, 0.08);
      this._tone(f * 0.5, 'triangle', 0.2, t + i * 0.1, 0.04);
    });
    // Final chord
    this._tone(1047, 'sine', 0.5, t + 0.6, 0.06);
    this._tone(1319, 'sine', 0.5, t + 0.6, 0.05);
    this._tone(1568, 'sine', 0.5, t + 0.6, 0.05);
  }

  /** Dialog open — soft pop */
  playDialogOpen() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(523, 'sine', 0.08, t, 0.1);
    this._tone(784, 'sine', 0.1, t + 0.05, 0.08);
  }

  /** Dialog typewriter tick */
  playTypeTick() {
    if (!this._ensureCtx()) return;
    this._tone(1200 + Math.random() * 200, 'square', 0.02, this.ctx.currentTime, 0.03);
  }

  /** Dialog close — soft swoosh */
  playDialogClose() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(600, 'sine', 0.08, t, 0.06);
    this._tone(400, 'sine', 0.1, t + 0.05, 0.04);
  }

  /** Crafting success — triumphant "ta-da!" */
  playCraftSuccess() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(523, 'square', 0.1, t, 0.08);
    this._tone(659, 'square', 0.1, t + 0.1, 0.08);
    this._tone(784, 'square', 0.2, t + 0.2, 0.1);
    this._tone(1047, 'triangle', 0.3, t + 0.2, 0.06);
  }

  /** UI click (hotbar switch, menu button) */
  playUIClick() {
    if (!this._ensureCtx()) return;
    this._tone(700, 'square', 0.03, this.ctx.currentTime, 0.05);
  }

  /** Slime hit — wobbly squish */
  playSlimeHit() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    g.gain.setValueAtTime(0.12, t);
    g.gain.linearRampToValueAtTime(0, t + 0.15);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Slime death — pop */
  playSlimeDeath() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(400, 'sine', 0.05, t, 0.12);
    this._tone(600, 'sine', 0.08, t + 0.05, 0.08);
    this._noise(0.08, t + 0.05, 0.06, 2000);
  }

  /** Skeleton rattle */
  playSkeletonHit() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._noise(0.04, t, 0.08, 5000);
    this._tone(200, 'square', 0.04, t, 0.06);
    this._noise(0.03, t + 0.06, 0.06, 4000);
  }

  /** Skeleton death — crumble */
  playSkeletonDeath() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    [300, 250, 180, 120].forEach((f, i) => {
      this._noise(0.06, t + i * 0.08, 0.05, 3000);
      this._tone(f, 'square', 0.06, t + i * 0.08, 0.04);
    });
  }

  /** Unicorn sparkle — magical ascending chime */
  playUnicornSparkle() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    [1047, 1319, 1568, 2093].forEach((f, i) =>
      this._tone(f, 'sine', 0.3 - i * 0.05, t + i * 0.1, 0.06)
    );
  }

  /** Unicorn pet — warm happy melody */
  playUnicornPet() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    const notes = [659, 784, 988, 1319, 1568];
    notes.forEach((f, i) => {
      this._tone(f, 'sine', 0.25, t + i * 0.12, 0.08);
      this._tone(f * 2, 'sine', 0.15, t + i * 0.12 + 0.05, 0.03);
    });
  }

  /** Plant heal — magical water */
  playPlantHeal() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    [392, 494, 587, 784].forEach((f, i) =>
      this._tone(f, 'triangle', 0.2, t + i * 0.1, 0.08)
    );
    this._noise(0.3, t, 0.03, 1000);
  }

  /** Eating/drinking food */
  playEat() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(250, 'square', 0.05, t, 0.06);
    this._tone(300, 'square', 0.05, t + 0.08, 0.06);
    this._tone(350, 'square', 0.05, t + 0.16, 0.06);
  }

  /** Chest/station open */
  playChestOpen() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._noise(0.1, t, 0.04, 800);
    this._tone(330, 'triangle', 0.1, t + 0.08, 0.08);
    this._tone(523, 'triangle', 0.15, t + 0.15, 0.1);
    this._tone(659, 'sine', 0.2, t + 0.25, 0.08);
  }

  /** Footstep — varies by surface */
  playFootstep(surface = 'grass') {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    if (surface === 'stone' || surface === 'wood') {
      this._noise(0.03, t, 0.03, 3000 + Math.random() * 1000);
    } else {
      this._noise(0.04, t, 0.02, 1200 + Math.random() * 600);
    }
  }

  /** Mob detects player — alert jingle */
  playMobAlert() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._tone(440, 'square', 0.08, t, 0.06);
    this._tone(554, 'square', 0.08, t + 0.08, 0.06);
    this._tone(659, 'square', 0.12, t + 0.16, 0.08);
  }

  /** Scene transition whoosh */
  playTransition() {
    if (!this._ensureCtx()) return;
    const t = this.ctx.currentTime;
    this._noise(0.4, t, 0.05, 600);
  }

  // ─── MUSIC ───

  /**
   * Start playing scene music (chiptune melody).
   * @param {string} sceneName — hub, forest, dungeon, lake, unicorn_meadow, menu
   */
  playMusic(sceneName) {
    if (!this._ensureCtx()) return;
    if (this._currentMusic?.scene === sceneName) return;
    this.stopMusic();

    const melody = SCENE_MELODIES[sceneName];
    if (!melody) return;

    let stopped = false;
    let timeoutIds = [];

    const playLoop = () => {
      if (stopped) return;
      const startTime = this.ctx.currentTime + 0.1;

      melody.notes.forEach((note, i) => {
        if (stopped) return;
        const t = startTime + i * melody.noteLen;
        if (note > 0) {
          this._tone(note, melody.wave || 'triangle', melody.noteLen * 0.85, t, melody.vol || 0.07, this.musicGain);
          // Harmony
          if (melody.harmony) {
            this._tone(note * melody.harmony, 'sine', melody.noteLen * 0.6, t, (melody.vol || 0.07) * 0.3, this.musicGain);
          }
        }
      });

      // Bass line
      if (melody.bass) {
        melody.bass.forEach((note, i) => {
          if (stopped || note <= 0) return;
          const t = startTime + i * (melody.noteLen * (melody.notes.length / melody.bass.length));
          this._tone(note, 'triangle', melody.noteLen * 2, t, (melody.vol || 0.07) * 0.5, this.musicGain);
        });
      }

      const loopDuration = melody.notes.length * melody.noteLen * 1000 + 500;
      const tid = setTimeout(playLoop, loopDuration);
      timeoutIds.push(tid);
    };

    playLoop();
    this._currentMusic = {
      scene: sceneName,
      stop: () => {
        stopped = true;
        timeoutIds.forEach(id => clearTimeout(id));
      }
    };
  }

  stopMusic() {
    if (this._currentMusic) {
      this._currentMusic.stop();
      this._currentMusic = null;
    }
  }
}

// ─── SCENE MELODIES ───
// Notes in Hz. 0 = rest. Simple 8-bit chiptune patterns.

const C4=262,D4=294,E4=330,F4=349,G4=392,A4=440,B4=494;
const C5=523,D5=587,E5=659,F5=698,G5=784,A5=880,B5=988;
const C3=131,D3=147,E3=165,F3=175,G3=196,A3=220,B3=247;
const R=0; // rest

const SCENE_MELODIES = {
  menu: {
    notes: [E4,G4,C5,R, E5,R,D5,C5, B4,R,G4,R, A4,B4,C5,R],
    bass:  [C3,R,G3,R, C3,R,E3,R],
    noteLen: 0.35,
    wave: 'triangle',
    vol: 0.06,
    harmony: 1.5,
  },
  hub: {
    notes: [C5,E5,G5,E5, D5,F5,A5,F5, E5,G5,C5,R, D5,B4,C5,R,
            G4,C5,E5,C5, A4,C5,F5,R, G4,B4,D5,R, C5,E5,G5,R],
    bass:  [C3,R,G3,R, F3,R,C3,R, E3,R,G3,R, C3,R,G3,R],
    noteLen: 0.22,
    wave: 'square',
    vol: 0.05,
    harmony: 1.5,
  },
  forest: {
    notes: [E4,R,G4,A4, B4,R,A4,G4, E4,R,D4,E4, G4,R,R,R,
            A4,R,B4,C5, D5,R,C5,B4, A4,R,G4,R, E4,R,R,R],
    bass:  [E3,R,R,R, A3,R,R,R, G3,R,R,R, E3,R,R,R],
    noteLen: 0.28,
    wave: 'triangle',
    vol: 0.05,
    harmony: 1.25,
  },
  dungeon: {
    notes: [E4,R,R,F4, R,E4,R,D4, R,R,E4,R, R,C4,R,R,
            D4,R,R,E4, R,F4,R,E4, R,R,D4,R, R,C4,R,R],
    bass:  [C3,R,R,R, A3,R,R,R, D3,R,R,R, C3,R,R,R],
    noteLen: 0.32,
    wave: 'square',
    vol: 0.04,
    harmony: 1.2,
  },
  lake: {
    notes: [C5,E5,G5,R, A5,G5,E5,R, F5,E5,D5,R, C5,R,R,R,
            E5,G5,C5,R, D5,E5,F5,R, E5,D5,C5,R, R,R,R,R],
    bass:  [C3,R,F3,R, G3,R,C3,R],
    noteLen: 0.3,
    wave: 'sine',
    vol: 0.05,
    harmony: 2.0,
  },
  unicorn_meadow: {
    notes: [G5,R,E5,G5, A5,R,G5,E5, F5,G5,A5,B5, C5*2,R,R,R,
            B5,A5,G5,R, E5,F5,G5,R, A5,G5,E5,R, C5,R,R,R],
    bass:  [C3,R,G3,R, F3,R,E3,R, A3,R,G3,R, C3,R,R,R],
    noteLen: 0.25,
    wave: 'sine',
    vol: 0.06,
    harmony: 2.0,
  },
};
