export class Sound {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.last = 0;
  }
  unlock() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) this.ctx = new C();
      this.ctx.resume();
    } catch {}
  }
  play(kind) {
    if (!this.enabled || !this.ctx) return;
    const c = this.ctx,
      now = c.currentTime;
    if (now - this.last < 0.08) return;
    this.last = now;
    const gain = c.createGain();
    gain.connect(c.destination);
    gain.gain.setValueAtTime(kind === 'cannon' ? 0.09 : 0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    if (kind === 'shot' || kind === 'cannon' || kind === 'built') {
      const b = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate),
        d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.05));
      const source = c.createBufferSource();
      source.buffer = b;
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = kind === 'cannon' ? 300 : 1800;
      source.connect(filter);
      filter.connect(gain);
      source.start();
    } else {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(
        kind === 'select' ? 420 : kind === 'error' ? 130 : 640,
        now,
      );
      o.frequency.exponentialRampToValueAtTime(
        kind === 'error' ? 90 : 850,
        now + 0.12,
      );
      o.connect(gain);
      o.start();
      o.stop(now + 0.22);
    }
  }
}
