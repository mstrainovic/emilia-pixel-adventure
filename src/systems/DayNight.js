const PHASES = ['morning', 'day', 'evening', 'night'];
const PHASE_DURATION = 120; // 2 minutes per phase = 8 min full cycle

const PHASE_COLORS = {
  morning: { r: 1.0, g: 0.89, b: 0.69 },
  day:     { r: 1.0, g: 1.0,  b: 1.0  },
  evening: { r: 1.0, g: 0.69, b: 0.38 },
  night:   { r: 0.25, g: 0.38, b: 0.63 },
};

const PHASE_AMBIENT = {
  morning: 0.85, day: 1.0, evening: 0.75, night: 0.45,
};

export class DayNightSystem {
  constructor() {
    this.totalTime = 0;
    this.phaseIndex = 1; // start at 'day'
    this.phaseTime = 0;
    this.onPhaseChange = null;
  }

  get phase() { return PHASES[this.phaseIndex]; }
  get phaseProgress() { return this.phaseTime / PHASE_DURATION; }

  getLightColor() {
    const current = PHASE_COLORS[this.phase];
    const nextIdx = (this.phaseIndex + 1) % PHASES.length;
    const next = PHASE_COLORS[PHASES[nextIdx]];
    const t = this.phaseProgress;
    if (t < 0.8) return { ...current };
    const lt = (t - 0.8) / 0.2;
    return {
      r: current.r + (next.r - current.r) * lt,
      g: current.g + (next.g - current.g) * lt,
      b: current.b + (next.b - current.b) * lt,
    };
  }

  getAmbientIntensity() {
    const current = PHASE_AMBIENT[this.phase];
    const nextIdx = (this.phaseIndex + 1) % PHASES.length;
    const next = PHASE_AMBIENT[PHASES[nextIdx]];
    const t = this.phaseProgress;
    if (t < 0.8) return current;
    const lt = (t - 0.8) / 0.2;
    return current + (next - current) * lt;
  }

  isNight() { return this.phase === 'night'; }

  update(dt) {
    this.totalTime += dt;
    this.phaseTime += dt;
    if (this.phaseTime >= PHASE_DURATION) {
      this.phaseTime -= PHASE_DURATION;
      const oldPhase = this.phase;
      this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;
      if (this.onPhaseChange) this.onPhaseChange(this.phase, oldPhase);
    }
  }

  getState() {
    return { totalTime: this.totalTime, phaseIndex: this.phaseIndex, phaseTime: this.phaseTime };
  }

  loadState(state) {
    if (!state) return;
    this.totalTime = state.totalTime || 0;
    this.phaseIndex = state.phaseIndex || 1;
    this.phaseTime = state.phaseTime || 0;
  }
}
