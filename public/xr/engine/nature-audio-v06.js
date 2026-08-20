(() => {
  let ctx;
  let master;
  let compressor;
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

  const PROFILES = {
    identity:   { master:.22, insects:.58, canopy:.52, water:.08, low:.13, air:.36, callChance:.34 },
    dependency: { master:.235,insects:.54, canopy:.42, water:.88, low:.12, air:.28, callChance:.48 },
    habitat:    { master:.23, insects:.62, canopy:.82, water:.38, low:.10, air:.34, callChance:.64 },
    pressure:   { master:.19, insects:.12, canopy:.14, water:.03, low:.84, air:.20, callChance:.05 },
    response:   { master:.235,insects:.48, canopy:.72, water:.22, low:.15, air:.38, callChance:.58 },
  };

  const stateProfile = () => PROFILES[sceneState] || PROFILES.identity;
  const setRootAudioState = (state) => {
    const r = root();
    if (!r) return;
    r.dataset.audioReady = String(Boolean(started && ctx));
    r.dataset.audioPlaying = String(state === 'playing');
    r.dataset.audioChapter = sceneState;
    r.dataset.audioProfile = 'amazonia-procedural-v06';
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
      node.pan.value = clamp(value,-1,1);
      return node;
    }
    return ctx.createGain();
  };

  const createBed = ({ name, type='bandpass', frequency=1000, q=.8, level=.04, pan=0, smooth=.965 }) => {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(rand(2.1,3.7), smooth);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = .0001;
    source.connect(filter).connect(gain).connect(panner(pan)).connect(master);
    source.start();
    beds.set(name,{source,filter,gain,level});
  };

  const chirp = ({base=3000, count=2, pan=0, level=.018, step=.12}={}) => {
    if (!ctx || ctx.state !== 'running' || paused) return;
    if (Math.random() > stateProfile().callChance) return;
    const now = ctx.currentTime + .025;
    for (let i=0;i<count;i+=1) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      const t = now + i*step;
      osc.type = i%2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base*rand(.94,1.05),t);
      osc.frequency.exponentialRampToValueAtTime(base*rand(1.12,1.34),t+.055);
      osc.frequency.exponentialRampToValueAtTime(base*rand(.86,.98),t+.15);
      amp.gain.setValueAtTime(.0001,t);
      amp.gain.exponentialRampToValueAtTime(level,t+.014);
      amp.gain.exponentialRampToValueAtTime(.0001,t+.17);
      osc.connect(amp).connect(panner(pan)).connect(master);
      osc.start(t); osc.stop(t+.2);
    }
  };

  const lowThump = (level=.026) => {
    if (!ctx || ctx.state !== 'running' || paused) return;
    const now=ctx.currentTime+.02;
    const osc=ctx.createOscillator();
    const amp=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    filter.type='lowpass'; filter.frequency.value=480;
    osc.type='sine'; osc.frequency.setValueAtTime(sceneState==='pressure'?92:145,now);
    osc.frequency.exponentialRampToValueAtTime(sceneState==='pressure'?54:90,now+.7);
    amp.gain.setValueAtTime(.0001,now); amp.gain.exponentialRampToValueAtTime(level,now+.035); amp.gain.exponentialRampToValueAtTime(.0001,now+.78);
    osc.connect(filter).connect(amp).connect(master); osc.start(now); osc.stop(now+.82);
  };

  const rustle = () => {
    if (!ctx || ctx.state !== 'running' || paused || sceneState==='pressure') return;
    const src=ctx.createBufferSource(); src.buffer=noiseBuffer(.85,.9);
    const filter=ctx.createBiquadFilter(); filter.type='bandpass'; filter.frequency.value=rand(1600,3200); filter.Q.value=.9;
    const gain=ctx.createGain(); const now=ctx.currentTime;
    gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(rand(.008,.017),now+.08); gain.gain.exponentialRampToValueAtTime(.0001,now+.72);
    src.connect(filter).connect(gain).connect(panner(rand(-.95,.95))).connect(master); src.start(now); src.stop(now+.78);
  };

  const accent = (state) => {
    if (!ctx || ctx.state !== 'running') return;
    if (state==='identity') {
      const now=ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value,now);
      master.gain.linearRampToValueAtTime(.085,now+.18);
      master.gain.linearRampToValueAtTime(PROFILES.identity.master,now+1.35);
      window.setTimeout(()=>lowThump(.018),140);
    }
    if (state==='dependency') chirp({base:3050,count:2,pan:.7,level:.015,step:.14});
    if (state==='habitat') { chirp({base:4300,count:3,pan:-.72,level:.012,step:.18}); window.setTimeout(rustle,230); }
    if (state==='pressure') { lowThump(.038); window.setTimeout(()=>lowThump(.022),520); }
    if (state==='response') { chirp({base:3400,count:3,pan:-.45,level:.014,step:.13}); window.setTimeout(()=>chirp({base:5100,count:2,pan:.65,level:.01,step:.19}),330); }
  };

  const applyProfile = (state) => {
    sceneState = PROFILES[state] ? state : 'identity';
    setRootAudioState(paused?'paused':'playing');
    if (!ctx || !master) return;
    const profile=stateProfile(); const now=ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value,now);
    master.gain.linearRampToValueAtTime(paused?0:profile.master,now+.6);
    for (const [name,item] of beds) {
      const factor=profile[name]??0;
      item.gain.gain.cancelScheduledValues(now);
      item.gain.gain.setValueAtTime(item.gain.gain.value,now);
      item.gain.gain.linearRampToValueAtTime(item.level*factor,now+.72);
    }
    accent(sceneState);
  };

  const schedule = (fn,min,max) => {
    const tick=()=>{
      if (!paused) fn();
      const id=window.setTimeout(tick,rand(min,max)); timers.add(id);
    };
    const id=window.setTimeout(tick,rand(min,max)); timers.add(id);
  };

  const ensureRunning = async () => {
    if (!ctx) return;
    try { if (ctx.state!=='running') await ctx.resume(); } catch { /* fail closed */ }
    paused=false; setRootAudioState('playing'); applyProfile(sceneState);
  };

  const start = async () => {
    if (started) { await ensureRunning(); return; }
    const Ctor=AudioCtx(); if (!Ctor) { root()?.setAttribute('data-audio-ready','unsupported'); return; }
    ctx=new Ctor({latencyHint:'interactive'});
    master=ctx.createGain(); master.gain.value=.0001;
    compressor=ctx.createDynamicsCompressor(); compressor.threshold.value=-24; compressor.knee.value=18; compressor.ratio.value=3; compressor.attack.value=.01; compressor.release.value=.28;
    master.connect(compressor).connect(ctx.destination);
    createBed({name:'insects',frequency:7200,q:1.05,level:.028,pan:-.34,smooth:.94});
    createBed({name:'canopy',frequency:3500,q:.8,level:.025,pan:.38,smooth:.91});
    createBed({name:'water',type:'lowpass',frequency:760,q:.7,level:.038,pan:.12,smooth:.985});
    createBed({name:'low',frequency:180,q:1.1,level:.032,pan:-.08,smooth:.99});
    createBed({name:'air',type:'highpass',frequency:5200,q:.45,level:.018,pan:.2,smooth:.97});
    started=true; paused=false;
    await ensureRunning();
    schedule(()=>chirp({base:rand(2500,3900),count:Math.random()>.7?3:2,pan:rand(-.92,.92),level:rand(.009,.017),step:rand(.1,.18)}),3600,8500);
    schedule(()=>chirp({base:rand(4400,6200),count:2,pan:rand(-.92,.92),level:rand(.007,.013),step:.2}),7200,14500);
    schedule(()=>lowThump(sceneState==='pressure'?.025:.009),11000,21000);
    schedule(rustle,5200,12000);
  };

  const syncButton = async () => {
    if (!started) { await start(); return; }
    const playing = button()?.dataset.playing === 'true';
    paused=!playing;
    if (playing) await ensureRunning();
    else {
      setRootAudioState('paused');
      const now=ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value,now); master.gain.linearRampToValueAtTime(0,now+.18);
      window.setTimeout(()=>ctx?.suspend?.(),220);
    }
  };

  window.addEventListener('4planet:nature-browser-enter',()=>{ start(); });
  window.addEventListener('4planet:nature-journey-scene',(event)=>applyProfile(event.detail?.state));
  window.addEventListener('4planet:nature-premium-hotspot',()=>{ if(!paused) chirp({base:3600,count:1,pan:0,level:.007,step:.1}); });
  window.addEventListener('DOMContentLoaded',()=>button()?.addEventListener('click',syncButton));
  window.addEventListener('pagehide',()=>{ for(const id of timers) clearTimeout(id); timers.clear(); try{ctx?.close?.();}catch{} },{once:true});
  window.NatureAudioV06={start,applyProfile,ensureRunning};
})();
