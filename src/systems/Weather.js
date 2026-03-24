export class WeatherSystem {
  constructor() {
    this.current = 'sunny';
    this._timer = 0;
    this._duration = 0;
    this._transition = 0; // 0-1 blend factor for smooth in/out
    this._nextWeather = null;
    this._setWeather('sunny');
  }

  _setWeather(type) {
    this.current = type;
    const durations = { sunny: [240, 480], rain: [120, 240], fog: [120, 120], sunbeams: [60, 60] };
    const [min, max] = durations[type];
    this._duration = min + Math.random() * (max - min);
    this._timer = this._duration;
    this._transition = 0;
  }

  update(dt) {
    this._timer -= dt;
    // Smooth transition: fade in over first 10s, fade out over last 10s
    if (this._timer > this._duration - 10) {
      this._transition = Math.min(1, (this._duration - this._timer) / 10);
    } else if (this._timer < 10) {
      this._transition = Math.max(0, this._timer / 10);
    } else {
      this._transition = 1;
    }
    if (this._timer <= 0) this._pickNext();
  }

  _pickNext() {
    const weights = { sunny: 50, rain: 25, fog: 15, sunbeams: 10 };
    const total = 100;
    let r = Math.random() * total;
    for (const [type, w] of Object.entries(weights)) {
      r -= w;
      if (r <= 0) { this._setWeather(type); return; }
    }
    this._setWeather('sunny');
  }

  // Day/Night interaction per spec:
  getDayNightModifier(dayPhase) {
    if (this.current === 'rain' && dayPhase === 'night') {
      return { extraDark: 0.3, hideStars: true };
    }
    if (this.current === 'fog' && dayPhase === 'morning') {
      return { fogDensity: 1.5 };
    }
    if (this.current === 'sunbeams' && (dayPhase === 'night' || dayPhase === 'evening')) {
      return { suppress: true };
    }
    return {};
  }

  isRaining() { return this.current === 'rain' && this._transition > 0.3; }
  isFoggy() { return this.current === 'fog' && this._transition > 0.3; }

  getState() { return { current: this.current, timer: this._timer, duration: this._duration }; }
  loadState(state) {
    if (state) {
      this.current = state.current || 'sunny';
      this._timer = state.timer || 0;
      this._duration = state.duration || 300;
    }
  }
}
