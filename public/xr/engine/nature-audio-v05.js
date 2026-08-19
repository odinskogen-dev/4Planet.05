(() => {
  let ctx;
  let master;
  let started = false;
  let paused = false;
  let currentProfile = 'canopy';
  let currentIntensity = 0.68;
  const timers = [];
  const layers = {};

  const root = () => document.getElementById('browser-experience');
  const soundButton = () => document.querySelector('.nature-sound');
  const AudioCtx = () => window.AudioContext || window.webkitAudioContext;
  const random = (min, max) => min + Math.random() * (max - min);

  const PROFILE = {
    canopy:       { insects: .014, air: .007, water: .002, low: .003, calls: 1.00 },
    understory:   { insects: .009, air: .006, water: .002, low: .006, calls: .55 },
    'water-edge': { insects: .008, air: .004, water: .009, low: .004, calls: .72 },
    corridor:     { insects: .006, air: .007, water: .002, low: .004, calls: .78 },
    pressure:     { insects: .002, air: .003, water: .001, low: .010, calls: .10 },
    response:     { insects: .008, air: .009, water: .003, low: .003, calls: .90 },
    legacy:       { insects: .008, air: .006, water: .003, low: .004, calls: .65 },
  };

  const noiseBuffer = (seconds = 2.4) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const out = buffer.getChannelData(c);
      let brown = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.021 * white) / 1.021;
        out[i] = brown * 2.1;
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

  const bed = ({ name, frequency, q, pan = 0, type = 'bandpass' }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer();
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const amp = ctx.createGain();
    amp.gain.value = 0.0001;
    source.connect(filter).connect(amp).connect(panNode(pan)).connect(master);
    source.start();
    layers[name] = { source, amp, filter };
  };

  const ramp = (param, value, seconds = .65) => {
    if (!ctx) return;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(Math.max(.0001, value), ctx.currentTime, seconds / 4);
  };

  const applyProfile = (profile = 'canopy', intensity = 0.7) => {
    currentProfile = PROFILE[profile] ? profile : 'canopy';
    currentIntensity = Math.max(.25, Math.min(1, Number(intensity) || .7));
    const mix = PROFILE[currentProfile];
    for (const name of ['insects', 'air', 'water', 'low']) {
      const layer = layers[name];
      if (layer) ramp(layer.amp.gain, mix[name] * currentIntensity, .8);
    }
    const r = root();
    if (r) r.dataset.audioProfile = `amazonia-procedural-v11:${currentProfile}`;

    // Meeting a predator should feel quieter and more attentive, not like a fake cinematic roar.
    if (currentProfile === 'understory' && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(.085, now + .35);
      master.gain.linearRampToValueAtTime(.14, now + 1.8);
    }
  };

  const pulseTrain = ({ base = 2600, count = 3, pan = 0, gain = .015, step = .12 }) => {
    if (!ctx || ctx.state !== 'running' || paused) return;
    const mix = PROFILE[currentProfile] || PROFILE.canopy;
    if (Math.random() > mix.calls) return;
    const now = ctx.currentTime + .03;
    for (let i = 0; i < count; i += 1) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const panner = panNode(pan);
      const t = now + i * step;
      osc.type = i % 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base * random(.94, 1.05), t);
      osc.frequency.exponentialRampToValueAtTime(base * random(1.15, 1.48), t + .06);
      osc.frequency.exponentialRampToValueAtTime(base * random(.88, 1.02), t + .14);
      amp.gain.setValueAtTime(.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain * currentIntensity, t + .016);
      amp.gain.exponentialRampToValueAtTime(.0001, t + .17);
      osc.connect(amp).connect(panner).connect(master);
      osc.start(t);
      osc.stop(t + .2);
    }
  };

  const lowPulse = () => {
    if (!ctx || ctx.state !== 'running' || paused || currentProfile === 'understory') return;
    const now = ctx.currentTime + .02;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(random(120, 240), now);
    osc.frequency.exponentialRampToValueAtTime(random(78, 130), now + .55);
    amp.gain.setValueAtTime(.0001, now);
    amp.gain.exponentialRampToValueAtTime(currentProfile === 'pressure' ? .014 : .006, now + .04);
    amp.gain.exponentialRampToValueAtTime(.0001, now + .7);
    osc.connect(amp).connect(panNode(random(-.7, .7))).connect(master);
    osc.start(now);
    osc.stop(now + .75);
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

  const start = async (event) => {
    if (started) {
      if (ctx?.state === 'suspended') await ctx.resume();
      paused = false;
      return;
    }
    const Ctor = AudioCtx();
    if (!Ctor) return;
    ctx = new Ctor({ latencyHint: 'playback' });
    master = ctx.createGain();
    master.gain.value = .14;
    master.connect(ctx.destination);

    // Synthetic habitat textures only. Never label these as real species recordings.
    bed({ name: 'insects', frequency: 6900, q: .6, pan: -.28 });
    bed({ name: 'air', frequency: 2500, q: .45, pan: .26 });
    bed({ name: 'water', frequency: 760, q: .28, pan: .1, type: 'lowpass' });
    bed({ name: 'low', frequency: 240, q: .8, pan: -.08, type: 'bandpass' });

    await ctx.resume();
    started = true;
    paused = false;
    const firstAudio = event?.detail?.journey?.chapters?.[0]?.audio;
    applyProfile(firstAudio?.profile || 'canopy', firstAudio?.intensity || .68);

    // Non-taxonomic spatial call motifs. These are deliberately sparse.
    schedule(() => pulseTrain({ base: random(2200, 3500), count: Math.random() > .62 ? 3 : 2, pan: random(-.9, .9), gain: random(.009, .017), step: random(.10, .16) }), 4200, 9800);
    schedule(() => pulseTrain({ base: random(3900, 5600), count: 2, pan: random(-.95, .95), gain: random(.006, .012), step: .17 }), 7800, 16000);
    schedule(lowPulse, 9000, 19000);
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

  const onChapter = (event) => {
    if (!started) return;
    const audio = event.detail?.audio || {};
    applyProfile(audio.profile || 'canopy', audio.intensity || .7);
  };

  window.addEventListener('4planet:nature-browser-enter', start);
  window.addEventListener('4planet:nature-journey-chapter', onChapter);
  window.addEventListener('DOMContentLoaded', () => soundButton()?.addEventListener('click', syncToggle));
  window.NatureAudioV05 = { start, applyProfile };
})();
