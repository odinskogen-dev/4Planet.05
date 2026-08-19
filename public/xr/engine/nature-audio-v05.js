(() => {
  let ctx;
  let master;
  let started = false;
  let paused = false;
  const timers = [];
  const beds = {};
  let sceneState = 'identity';

  const root = () => document.getElementById('browser-experience');
  const soundButton = () => document.querySelector('.nature-sound');
  const AudioCtx = () => window.AudioContext || window.webkitAudioContext;
  const random = (min, max) => min + Math.random() * (max - min);

  // Overall loudness per chapter. The separate layer mix below controls character.
  const sceneGain = { identity: 0.105, dependency: 0.12, habitat: 0.11, pressure: 0.074, response: 0.105 };
  const sceneMix = {
    identity:   { insects: .52, canopy: .42, water: .03, low: .22, calls: .32 },
    dependency: { insects: .58, canopy: .34, water: .78, low: .18, calls: .52 },
    habitat:    { insects: .66, canopy: .76, water: .08, low: .14, calls: .72 },
    pressure:   { insects: .12, canopy: .16, water: .01, low: .72, calls: .05 },
    response:   { insects: .52, canopy: .72, water: .10, low: .16, calls: .68 },
  };

  const noiseBuffer = (seconds = 2.2) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const out = buffer.getChannelData(c);
      let shaped = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        shaped = shaped * 0.972 + white * 0.028;
        out[i] = shaped * 1.8;
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

  const bed = ({ name, frequency, q, gain, pan = 0, type = 'bandpass' }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(random(1.8, 3.0));
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.value = gain * 0.001;
    source.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    source.start();
    beds[name] = { source, amp, filter, baseGain: gain };
  };

  const pulseTrain = ({ base = 2800, count = 2, pan = 0, gain = 0.012, step = 0.12 }) => {
    if (!ctx || ctx.state !== 'running' || paused) return;
    const mix = sceneMix[sceneState] || sceneMix.habitat;
    if (Math.random() > mix.calls) return;
    const now = ctx.currentTime + 0.03;
    for (let i = 0; i < count; i += 1) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const panner = panNode(pan);
      const t = now + i * step;
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base * random(0.96, 1.04), t);
      osc.frequency.exponentialRampToValueAtTime(base * random(1.14, 1.38), t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(base * random(0.9, 1.01), t + 0.12);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.014);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(amp).connect(panner).connect(master);
      osc.start(t);
      osc.stop(t + 0.17);
    }
  };

  const lowPulse = ({ frequency = 170, pan = 0, gain = 0.008 }) => {
    if (!ctx || ctx.state !== 'running' || paused) return;
    const now = ctx.currentTime + 0.02;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.52);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.04);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    osc.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    osc.start(now);
    osc.stop(now + 0.68);
  };

  const canopyRustle = () => {
    if (!ctx || ctx.state !== 'running' || paused || sceneState === 'pressure') return;
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(0.65);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = random(1800, 3100);
    filter.Q.value = 1.0;
    const amp = ctx.createGain();
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(random(0.0035, 0.007), now + 0.1);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
    source.connect(filter).connect(amp).connect(panNode(random(-0.92, 0.92))).connect(master);
    source.start(now);
    source.stop(now + 0.62);
  };

  const chapterAccent = (state) => {
    if (!ctx || ctx.state !== 'running') return;
    // Deliberately no synthetic Jaguar roar. MEET LIFE gets a brief attentional hush instead.
    if (state === 'identity') {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0.055, now + 0.24);
      master.gain.linearRampToValueAtTime(sceneGain.identity, now + 1.5);
    }
    if (state === 'dependency') pulseTrain({ base: 3000, count: 2, pan: 0.68, gain: 0.009, step: 0.14 });
    if (state === 'habitat') {
      pulseTrain({ base: 4450, count: 2, pan: -0.76, gain: 0.007, step: 0.2 });
      window.setTimeout(canopyRustle, 260);
    }
    if (state === 'pressure') lowPulse({ frequency: 105, pan: 0.18, gain: 0.014 });
    if (state === 'response') {
      pulseTrain({ base: 3500, count: 3, pan: -0.45, gain: 0.008, step: 0.15 });
      window.setTimeout(() => pulseTrain({ base: 5050, count: 2, pan: 0.64, gain: 0.006, step: 0.2 }), 360);
    }
  };

  const applySceneMix = (state) => {
    sceneState = sceneMix[state] ? state : 'identity';
    const r = root();
    if (r) {
      r.dataset.audioChapter = sceneState;
      r.dataset.audioProfile = `amazonia-procedural-v11`;
    }
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    const mix = sceneMix[sceneState];
    const target = sceneGain[sceneState] ?? 0.105;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + 0.72);

    for (const [name, item] of Object.entries(beds)) {
      const factor = mix[name] ?? 0;
      item.amp.gain.cancelScheduledValues(now);
      item.amp.gain.setValueAtTime(item.amp.gain.value, now);
      item.amp.gain.linearRampToValueAtTime(item.baseGain * factor, now + 0.8);
    }
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
    master.gain.value = 0.09;
    master.connect(ctx.destination);

    // Synthetic texture only. Water is an isolated layer and is not a constant full-journey bed.
    bed({ name: 'insects', frequency: 7600, q: 1.15, gain: 0.009, pan: -0.34 });
    bed({ name: 'canopy', frequency: 3900, q: 0.95, gain: 0.006, pan: 0.38 });
    bed({ name: 'water', frequency: 620, q: 0.75, gain: 0.008, pan: 0.12, type: 'lowpass' });
    bed({ name: 'low', frequency: 210, q: 1.2, gain: 0.006, pan: -0.08, type: 'bandpass' });

    await ctx.resume();
    started = true;
    paused = false;
    applySceneMix(sceneState);

    // Non-taxonomic procedural motifs for spatial richness. Never label as real species calls.
    schedule(() => pulseTrain({ base: random(2600, 3900), count: Math.random() > 0.7 ? 3 : 2, pan: random(-0.95, 0.95), gain: random(0.005, 0.010), step: random(0.11, 0.18) }), 4800, 11000);
    schedule(() => pulseTrain({ base: random(4600, 6300), count: 2, pan: random(-0.95, 0.95), gain: random(0.004, 0.008), step: 0.2 }), 9000, 18000);
    schedule(() => lowPulse({ frequency: random(125, 220), pan: random(-0.72, 0.72), gain: sceneState === 'pressure' ? 0.010 : 0.004 }), 12000, 24000);
    schedule(canopyRustle, 7000, 15000);
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
