(() => {
  let ctx;
  let master;
  let started = false;
  let paused = false;
  const timers = [];
  const beds = [];
  let sceneState = 'identity';

  const root = () => document.getElementById('browser-experience');
  const soundButton = () => document.querySelector('.nature-sound');
  const AudioCtx = () => window.AudioContext || window.webkitAudioContext;
  const random = (min, max) => min + Math.random() * (max - min);
  const sceneGain = { identity: 0.14, dependency: 0.125, habitat: 0.115, pressure: 0.085, response: 0.12 };

  const noiseBuffer = (seconds = 2.4) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const out = buffer.getChannelData(c);
      let pink = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        pink = pink * 0.985 + white * 0.015;
        out[i] = pink * 2.2;
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
    source.buffer = noiseBuffer(random(2.2, 3.8));
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.value = gain;
    source.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    source.start();
    const item = { source, amp, filter, baseGain: gain };
    beds.push(item);
    return item;
  };

  const pulseTrain = ({ base = 2600, count = 3, pan = 0, gain = 0.02, step = 0.12 }) => {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.03;
    for (let i = 0; i < count; i += 1) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const panner = panNode(pan);
      const t = now + i * step;
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base * random(0.94, 1.06), t);
      osc.frequency.exponentialRampToValueAtTime(base * random(1.18, 1.48), t + 0.055);
      osc.frequency.exponentialRampToValueAtTime(base * random(0.88, 1.03), t + 0.13);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.016);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(amp).connect(panner).connect(master);
      osc.start(t);
      osc.stop(t + 0.18);
    }
  };

  const lowPulse = ({ frequency = 190, pan = 0, gain = 0.012 }) => {
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.02;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 720;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.76, now + 0.48);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.045);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    osc.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    osc.start(now);
    osc.stop(now + 0.68);
  };

  const canopyRustle = () => {
    if (!ctx || ctx.state !== 'running' || sceneState === 'pressure') return;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(0.8);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = random(1300, 2400);
    filter.Q.value = 0.75;
    const amp = ctx.createGain();
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(random(0.005, 0.011), now + 0.13);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    source.connect(filter).connect(amp).connect(panNode(random(-0.9, 0.9))).connect(master);
    source.start(now);
    source.stop(now + 0.75);
  };

  const chapterAccent = (state) => {
    if (!ctx || ctx.state !== 'running') return;
    if (state === 'identity') lowPulse({ frequency: 170, pan: -0.2, gain: 0.011 });
    if (state === 'dependency') pulseTrain({ base: 2850, count: 3, pan: 0.62, gain: 0.012, step: 0.11 });
    if (state === 'habitat') {
      pulseTrain({ base: 4200, count: 2, pan: -0.72, gain: 0.009, step: 0.19 });
      window.setTimeout(canopyRustle, 220);
    }
    if (state === 'pressure') lowPulse({ frequency: 118, pan: 0.15, gain: 0.018 });
    if (state === 'response') {
      pulseTrain({ base: 3400, count: 4, pan: -0.42, gain: 0.011, step: 0.14 });
      window.setTimeout(() => pulseTrain({ base: 4700, count: 2, pan: 0.6, gain: 0.008, step: 0.18 }), 320);
    }
  };

  const applySceneMix = (state) => {
    sceneState = state || 'identity';
    const r = root();
    if (r) r.dataset.audioChapter = sceneState;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const target = sceneGain[sceneState] ?? 0.115;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + 0.8);

    const highFactor = sceneState === 'pressure' ? 0.42 : sceneState === 'response' ? 0.9 : 1;
    beds.forEach((item, index) => {
      const factor = index < 2 ? highFactor : (sceneState === 'dependency' ? 0.55 : 0.38);
      item.amp.gain.cancelScheduledValues(now);
      item.amp.gain.linearRampToValueAtTime(item.baseGain * factor, now + 0.9);
    });
    chapterAccent(sceneState);
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
    master.gain.value = 0.12;
    master.connect(ctx.destination);

    // Synthetic habitat texture only. Kept intentionally sparse so it does not read as a continuous waterfall.
    bed({ frequency: 7200, q: 0.7, gain: 0.008, pan: -0.38 });
    bed({ frequency: 4700, q: 0.85, gain: 0.006, pan: 0.42 });
    bed({ frequency: 1250, q: 0.6, gain: 0.004, pan: 0.04 });

    await ctx.resume();
    started = true;
    paused = false;
    const r = root();
    if (r) r.dataset.audioProfile = 'amazonia-procedural-v11';
    applySceneMix(sceneState);

    // Non-taxonomic procedural motifs for spatial richness. They are not labelled as real species calls.
    schedule(() => {
      if (sceneState !== 'pressure') pulseTrain({ base: random(2400, 3900), count: Math.random() > 0.62 ? 3 : 2, pan: random(-0.95, 0.95), gain: random(0.007, 0.014), step: random(0.10, 0.17) });
    }, 3200, 8500);
    schedule(() => {
      if (sceneState === 'identity' || sceneState === 'habitat' || sceneState === 'response') pulseTrain({ base: random(4300, 6200), count: 2, pan: random(-0.95, 0.95), gain: random(0.005, 0.010), step: 0.19 });
    }, 6500, 13000);
    schedule(() => lowPulse({ frequency: random(135, 245), pan: random(-0.75, 0.75), gain: sceneState === 'pressure' ? 0.012 : 0.006 }), 9000, 18000);
    schedule(canopyRustle, 5200, 12000);
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
  window.addEventListener('4planet:nature-journey-scene', (event) => applySceneMix(event.detail?.state));
  window.addEventListener('DOMContentLoaded', () => soundButton()?.addEventListener('click', syncToggle));
  window.NatureAudioV05 = { start, applySceneMix };
})();
