(() => {
  let ctx;
  let master;
  let started = false;
  let paused = false;
  let timers = [];

  const root = () => document.getElementById('browser-experience');
  const soundButton = () => document.querySelector('.nature-sound');
  const AudioCtx = () => window.AudioContext || window.webkitAudioContext;
  const random = (min, max) => min + Math.random() * (max - min);

  const noiseBuffer = (seconds = 3) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const out = buffer.getChannelData(c);
      let brown = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.025 * white) / 1.025;
        out[i] = brown * 2.4;
      }
    }
    return buffer;
  };

  const panNode = (value = 0) => {
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = value;
      return p;
    }
    return ctx.createGain();
  };

  const bed = ({ frequency, q, gain, pan = 0, type = 'bandpass' }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(random(3, 5));
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.value = gain;
    source.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    source.start();
    return { source, amp, filter };
  };

  const pulseTrain = ({ base = 2600, count = 3, pan = 0, gain = 0.025, step = 0.12 }) => {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.03;
    for (let i = 0; i < count; i += 1) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const panner = panNode(pan);
      const t = now + i * step;
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base * random(0.92, 1.08), t);
      osc.frequency.exponentialRampToValueAtTime(base * random(1.25, 1.8), t + 0.065);
      osc.frequency.exponentialRampToValueAtTime(base * random(0.82, 1.02), t + 0.15);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.018);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(amp).connect(panner).connect(master);
      osc.start(t);
      osc.stop(t + 0.22);
    }
  };

  const lowPulse = ({ frequency = 210, pan = 0, gain = 0.02 }) => {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.02;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.55);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.05);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    osc.start(now);
    osc.stop(now + 0.75);
  };

  const canopyRustle = () => {
    if (!ctx || ctx.state !== 'running') return;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(1.2);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = random(900, 1700);
    filter.Q.value = 0.5;
    const amp = ctx.createGain();
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(random(0.012, 0.025), now + 0.2);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    source.connect(filter).connect(amp).connect(panNode(random(-0.85, 0.85))).connect(master);
    source.start(now);
    source.stop(now + 1.15);
  };

  const schedule = (fn, minMs, maxMs) => {
    const tick = () => {
      if (!paused) fn();
      const id = window.setTimeout(tick, random(minMs, maxMs));
      timers.push(id);
    };
    const id = window.setTimeout(tick, random(minMs, maxMs));
    timers.push(id);
  };

  const start = async () => {
    if (started) {
      if (ctx?.state === 'suspended') await ctx.resume();
      paused = false;
      return;
    }
    const Ctor = AudioCtx();
    if (!Ctor) return;
    ctx = new Ctor({ latencyHint: 'playback' });
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);

    // Wide habitat beds. These are synthetic textures, deliberately not labelled as species recordings.
    bed({ frequency: 6400, q: 0.42, gain: 0.014, pan: -0.28 });
    bed({ frequency: 4200, q: 0.7, gain: 0.010, pan: 0.34 });
    bed({ frequency: 1050, q: 0.32, gain: 0.012, pan: 0.05 });

    // Slow movement in the canopy bed keeps it from reading as one continuous waterfall/noise source.
    const motion = ctx.createOscillator();
    const motionGain = ctx.createGain();
    motion.frequency.value = 0.083;
    motionGain.gain.value = 0.018;
    motion.connect(motionGain).connect(master.gain);
    motion.start();

    await ctx.resume();
    started = true;
    paused = false;
    const r = root();
    if (r) r.dataset.audioProfile = 'amazonia-procedural-v05';

    // Procedural call motifs: non-taxonomic placeholders for spatial richness only.
    schedule(() => pulseTrain({ base: random(1900, 3300), count: Math.random() > 0.55 ? 4 : 2, pan: random(-0.92, 0.92), gain: random(0.018, 0.034), step: random(0.09, 0.16) }), 2600, 7200);
    schedule(() => pulseTrain({ base: random(3400, 5200), count: 2, pan: random(-0.95, 0.95), gain: random(0.010, 0.022), step: 0.17 }), 5000, 11000);
    schedule(() => lowPulse({ frequency: random(150, 310), pan: random(-0.8, 0.8), gain: random(0.008, 0.018) }), 6500, 15000);
    schedule(canopyRustle, 4200, 9800);
  };

  const syncToggle = async () => {
    if (!ctx || !started) return;
    window.setTimeout(async () => {
      const playing = soundButton()?.dataset.playing === 'true';
      paused = !playing;
      if (playing && ctx.state !== 'running') await ctx.resume();
      if (!playing && ctx.state === 'running') await ctx.suspend();
    }, 0);
  };

  window.addEventListener('4planet:nature-browser-enter', start);
  window.addEventListener('DOMContentLoaded', () => soundButton()?.addEventListener('click', syncToggle));
  window.NatureAudioV05 = { start };
})();
