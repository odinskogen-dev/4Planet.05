(() => {
  let ctx, master, compressor;
  let started = false;
  let paused = false;
  let sceneState = 'identity';
  const beds = new Map();
  const timers = new Set();

  const root = () => document.getElementById('browser-experience');
  const button = () => document.querySelector('.nature-sound');
  const AudioCtx = () => window.AudioContext || window.webkitAudioContext;
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const world = () => root()?.dataset.audioWorld === 'ocean' ? 'ocean' : 'forest';

  const WORLD_PROFILES = {
    forest: {
      identity:   { master:.22, high:.58, mid:.52, water:.08, low:.13, air:.36, motif:.34 },
      dependency: { master:.235,high:.54, mid:.42, water:.88, low:.12, air:.28, motif:.48 },
      habitat:    { master:.23, high:.62, mid:.82, water:.38, low:.10, air:.34, motif:.64 },
      pressure:   { master:.19, high:.12, mid:.14, water:.03, low:.84, air:.20, motif:.05 },
      response:   { master:.235,high:.48, mid:.72, water:.22, low:.15, air:.38, motif:.58 },
      actors:     { master:.225,high:.32, mid:.68, water:.16, low:.20, air:.31, motif:.46 },
      action:     { master:.23, high:.38, mid:.74, water:.14, low:.27, air:.34, motif:.62 },
      proof:      { master:.215,high:.45, mid:.52, water:.29, low:.12, air:.42, motif:.31 }
    },
    ocean: {
      identity:   { master:.215,high:.08, mid:.22, water:.86, low:.46, air:.10, motif:.22 },
      dependency: { master:.225,high:.10, mid:.26, water:.92, low:.36, air:.08, motif:.32 },
      habitat:    { master:.22, high:.06, mid:.18, water:.96, low:.42, air:.07, motif:.18 },
      pressure:   { master:.19, high:.03, mid:.08, water:.48, low:.94, air:.04, motif:.04 },
      response:   { master:.225,high:.09, mid:.24, water:.82, low:.32, air:.09, motif:.28 },
      actors:     { master:.218,high:.08, mid:.29, water:.76, low:.34, air:.08, motif:.26 },
      action:     { master:.224,high:.09, mid:.32, water:.72, low:.42, air:.08, motif:.34 },
      proof:      { master:.21, high:.07, mid:.20, water:.88, low:.26, air:.11, motif:.18 }
    }
  };

  const profile = () => WORLD_PROFILES[world()][sceneState] || WORLD_PROFILES[world()].identity;
  const setRootAudioState = (state) => {
    const r = root();
    if (!r) return;
    r.dataset.audioReady = String(Boolean(started && ctx));
    r.dataset.audioPlaying = String(state === 'playing');
    r.dataset.audioChapter = sceneState;
    r.dataset.audioProfile = `${world()}-procedural-v06`;
  };

  const noiseBuffer = (seconds = 2.8, smooth = .965) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const out = buffer.getChannelData(channel);
      let shaped = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        shaped = shaped * smooth + white * (1 - smooth);
        out[i] = shaped * 2.2;
      }
    }
    return buffer;
  };

  const panner = (value = 0) => {
    if (ctx.createStereoPanner) {
      const node = ctx.createStereoPanner();
      node.pan.value = clamp(value, -1, 1);
      return node;
    }
    return ctx.createGain();
  };

  const createBed = ({ name, type='bandpass', frequency=1000, q=.8, level=.04, pan=0, smooth=.965 }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(rand(2.1, 3.7), smooth);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = .0001;
    source.connect(filter).connect(gain).connect(panner(pan)).connect(master);
    source.start();
    beds.set(name, { source, filter, gain, level });
  };

  const tonalMotif = ({ base, count=2, pan=0, level=.016, step=.12 }={}) => {
    if (!ctx || ctx.state !== 'running' || paused || Math.random() > profile().motif) return;
    const ocean = world() === 'ocean';
    const startBase = base || (ocean ? 620 : 3000);
    const now = ctx.currentTime + .025;
    for (let i = 0; i < count; i += 1) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const t = now + i * step;
      osc.type = ocean ? 'sine' : (i % 2 ? 'sine' : 'triangle');
      osc.frequency.setValueAtTime(startBase * rand(.94, 1.05), t);
      osc.frequency.exponentialRampToValueAtTime(startBase * (ocean ? rand(.82,.96) : rand(1.12,1.34)), t + (ocean ? .18 : .055));
      osc.frequency.exponentialRampToValueAtTime(startBase * (ocean ? rand(.58,.76) : rand(.86,.98)), t + (ocean ? .42 : .15));
      amp.gain.setValueAtTime(.0001, t);
      amp.gain.exponentialRampToValueAtTime(level, t + .018);
      amp.gain.exponentialRampToValueAtTime(.0001, t + (ocean ? .5 : .17));
      osc.connect(amp).connect(panner(pan)).connect(master);
      osc.start(t); osc.stop(t + (ocean ? .55 : .2));
    }
  };

  const lowPulse = (level=.026) => {
    if (!ctx || ctx.state !== 'running' || paused) return;
    const ocean = world() === 'ocean';
    const now = ctx.currentTime + .02;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = ocean ? 320 : 480;
    osc.type = 'sine';
    const base = sceneState === 'pressure' ? (ocean ? 58 : 92) : (ocean ? 86 : 145);
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * .58, now + (ocean ? 1.05 : .7));
    amp.gain.setValueAtTime(.0001, now);
    amp.gain.exponentialRampToValueAtTime(level, now + .04);
    amp.gain.exponentialRampToValueAtTime(.0001, now + (ocean ? 1.12 : .78));
    osc.connect(filter).connect(amp).connect(master); osc.start(now); osc.stop(now + (ocean ? 1.18 : .82));
  };

  const textureBurst = () => {
    if (!ctx || ctx.state !== 'running' || paused || sceneState === 'pressure') return;
    const ocean = world() === 'ocean';
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ocean ? 1.25 : .85, ocean ? .985 : .9);
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = ocean ? rand(340,780) : rand(1600,3200); filter.Q.value = ocean ? .55 : .9;
    const gain = ctx.createGain(); const now = ctx.currentTime;
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(rand(.007,.015), now + .1); gain.gain.exponentialRampToValueAtTime(.0001, now + (ocean ? 1.05 : .72));
    src.connect(filter).connect(gain).connect(panner(rand(-.95,.95))).connect(master); src.start(now); src.stop(now + (ocean ? 1.12 : .78));
  };

  const accent = (state) => {
    if (!ctx || ctx.state !== 'running') return;
    const ocean = world() === 'ocean';
    if (state === 'identity') {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(ocean ? .07 : .085, now + .18);
      master.gain.linearRampToValueAtTime(profile().master, now + 1.35);
      window.setTimeout(() => lowPulse(ocean ? .021 : .018), 140);
    }
    if (state === 'dependency') tonalMotif({ base:ocean?740:3050, count:2, pan:.7, level:ocean?.011:.015, step:ocean?.28:.14 });
    if (state === 'habitat') { tonalMotif({ base:ocean?480:4300, count:ocean?2:3, pan:-.72, level:.011, step:ocean?.36:.18 }); window.setTimeout(textureBurst,230); }
    if (state === 'pressure') { lowPulse(ocean?.044:.038); window.setTimeout(() => lowPulse(ocean?.025:.022), ocean?720:520); }
    if (state === 'response') { tonalMotif({ base:ocean?690:3400, count:3, pan:-.45, level:.013, step:ocean?.25:.13 }); window.setTimeout(() => tonalMotif({ base:ocean?980:5100, count:2, pan:.65, level:.009, step:ocean?.3:.19 }),360); }
    if (state === 'actors') { tonalMotif({ base:ocean?610:2700, count:2, pan:-.35, level:.011, step:ocean?.30:.16 }); window.setTimeout(() => lowPulse(ocean?.014:.012), 260); }
    if (state === 'action') { tonalMotif({ base:ocean?820:3900, count:3, pan:.25, level:.013, step:ocean?.23:.11 }); window.setTimeout(() => lowPulse(ocean?.026:.022), 170); }
    if (state === 'proof') { tonalMotif({ base:ocean?520:3200, count:2, pan:0, level:.009, step:ocean?.36:.2 }); window.setTimeout(textureBurst, 420); }
  };

  const applyProfile = (state) => {
    sceneState = WORLD_PROFILES[world()][state] ? state : 'identity';
    setRootAudioState(paused ? 'paused' : 'playing');
    if (!ctx || !master) return;
    const p = profile(); const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime(paused ? 0 : p.master, now + .6);
    for (const [name, item] of beds) {
      const factor = p[name] ?? 0;
      item.gain.gain.cancelScheduledValues(now); item.gain.gain.setValueAtTime(item.gain.gain.value, now); item.gain.gain.linearRampToValueAtTime(item.level * factor, now + .72);
    }
    accent(sceneState);
  };

  const schedule = (fn, min, max) => {
    const tick = () => { if (!paused) fn(); const id = window.setTimeout(tick, rand(min,max)); timers.add(id); };
    const id = window.setTimeout(tick, rand(min,max)); timers.add(id);
  };

  const ensureRunning = async () => {
    if (!ctx) return;
    try { if (ctx.state !== 'running') await ctx.resume(); } catch { /* browser policy: remain fail-closed */ }
    paused = false; setRootAudioState('playing'); applyProfile(sceneState);
  };

  const start = async () => {
    if (started) { await ensureRunning(); return; }
    const Ctor = AudioCtx(); if (!Ctor) { root()?.setAttribute('data-audio-ready','unsupported'); return; }
    ctx = new Ctor({ latencyHint:'interactive' });
    master = ctx.createGain(); master.gain.value = .0001;
    compressor = ctx.createDynamicsCompressor(); compressor.threshold.value=-24; compressor.knee.value=18; compressor.ratio.value=3; compressor.attack.value=.01; compressor.release.value=.28;
    master.connect(compressor).connect(ctx.destination);
    createBed({ name:'high', frequency:7200, q:1.05, level:.028, pan:-.34, smooth:.94 });
    createBed({ name:'mid', frequency:3500, q:.8, level:.025, pan:.38, smooth:.91 });
    createBed({ name:'water', type:'lowpass', frequency:world()==='ocean'?430:760, q:.7, level:world()==='ocean'?.052:.038, pan:.12, smooth:.988 });
    createBed({ name:'low', frequency:world()==='ocean'?115:180, q:1.1, level:world()==='ocean'?.041:.032, pan:-.08, smooth:.992 });
    createBed({ name:'air', type:'highpass', frequency:5200, q:.45, level:.018, pan:.2, smooth:.97 });
    started = true; paused = false;
    await ensureRunning();
    schedule(() => tonalMotif({ base:world()==='ocean'?rand(520,880):rand(2500,3900), count:Math.random()>.7?3:2, pan:rand(-.92,.92), level:rand(.008,.015), step:world()==='ocean'?rand(.2,.36):rand(.1,.18) }), world()==='ocean'?6500:3600, world()==='ocean'?14000:8500);
    schedule(() => lowPulse(sceneState==='pressure'?.025:.009), 11000, 21000);
    schedule(textureBurst, world()==='ocean'?7200:5200, world()==='ocean'?15000:12000);
  };

  const syncButton = async () => {
    if (!started) { await start(); return; }
    const playing = button()?.dataset.playing === 'true';
    paused = !playing;
    if (playing) await ensureRunning();
    else {
      setRootAudioState('paused');
      const now = ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value,now); master.gain.linearRampToValueAtTime(0,now+.18);
      window.setTimeout(() => ctx?.suspend?.(),220);
    }
  };

  window.addEventListener('4planet:nature-browser-enter', () => { start(); });
  window.addEventListener('4planet:nature-journey-scene', event => applyProfile(event.detail?.state));
  window.addEventListener('4planet:nature-premium-hotspot', () => { if(!paused) tonalMotif({base:world()==='ocean'?780:3600,count:1,pan:0,level:.007,step:.1}); });
  window.addEventListener('DOMContentLoaded', () => button()?.addEventListener('click', syncButton));
  window.addEventListener('pagehide', () => { for(const id of timers) clearTimeout(id); timers.clear(); try{ctx?.close?.();}catch{} }, {once:true});
  window.NatureAudioV06 = { start, applyProfile, ensureRunning };
})();
