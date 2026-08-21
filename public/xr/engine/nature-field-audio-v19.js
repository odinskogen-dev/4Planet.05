(() => {
  const root = () => document.getElementById('browser-experience');
  const button = () => document.querySelector('.nature-sound');
  let config = null;
  let ambient = null;
  let ctx = null;
  let started = false;
  let enabled = true;
  let cuePlayed = false;

  const AudioCtx = () => window.AudioContext || window.webkitAudioContext;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const ensureProvenance = () => {
    const host = root();
    if (!host || host.querySelector('.nature-audio-provenance-v19')) return;
    const node = document.createElement('div');
    node.className = 'nature-audio-provenance-v19';
    node.setAttribute('aria-label', 'Audio provenance');
    node.innerHTML = `
      <span class="nature-audio-provenance-v19__field">FIELD AMBIENCE · LOADING SOURCE</span>
      <span class="nature-audio-provenance-v19__cue">JAGUAR PRESENCE CUE · DESIGNED · NOT FIELD AUDIO</span>`;
    host.appendChild(node);
  };

  const setFieldLabel = (text) => {
    const label = root()?.querySelector('.nature-audio-provenance-v19__field');
    if (label) label.textContent = text;
  };

  const syncRoot = (state) => {
    const host = root();
    if (!host) return;
    host.dataset.fieldAudio = state;
    host.dataset.creatureAudio = 'designed-not-field';
  };

  const loadConfig = async () => {
    const existing = window.NatureCreatureV19?.getConfig?.();
    if (existing) return existing;
    const url = root()?.dataset.creatureConfig;
    if (!url) return null;
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Audio config failed: ${response.status}`);
    return response.json();
  };

  const setupAmbient = () => {
    const source = config?.audio?.fieldAmbience;
    if (!source?.mediaUrl) {
      syncRoot('unavailable');
      setFieldLabel('FIELD AMBIENCE · UNAVAILABLE');
      return;
    }
    ambient = new Audio(source.mediaUrl);
    ambient.loop = true;
    ambient.preload = 'none';
    ambient.volume = .11;
    ambient.crossOrigin = 'anonymous';
    ambient.addEventListener('canplay', () => {
      syncRoot('ready');
      setFieldLabel(source.label || 'AMAZON FIELD AMBIENCE');
    }, { once: true });
    ambient.addEventListener('error', () => {
      syncRoot('failed-optional');
      setFieldLabel('FIELD AMBIENCE · SOURCE UNAVAILABLE · PROCEDURAL FALLBACK ACTIVE');
    });
  };

  const ensureContext = async () => {
    const Ctor = AudioCtx();
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor({ latencyHint: 'interactive' });
    try { if (ctx.state !== 'running') await ctx.resume(); } catch { /* fail closed */ }
    return ctx;
  };

  const playDesignedPresenceCue = async () => {
    if (!enabled || cuePlayed) return;
    const audio = await ensureContext();
    if (!audio || audio.state !== 'running') return;
    cuePlayed = true;
    const now = audio.currentTime + .02;

    const duration = 1.65;
    const frameCount = Math.floor(audio.sampleRate * duration);
    const buffer = audio.createBuffer(1, frameCount, audio.sampleRate);
    const data = buffer.getChannelData(0);
    let shaped = 0;
    for (let i = 0; i < frameCount; i += 1) {
      const white = Math.random() * 2 - 1;
      shaped = shaped * .93 + white * .07;
      const envelope = Math.sin(Math.PI * (i / frameCount));
      data[i] = shaped * envelope * .72;
    }

    const noise = audio.createBufferSource();
    noise.buffer = buffer;
    const band = audio.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(185, now);
    band.frequency.exponentialRampToValueAtTime(118, now + 1.2);
    band.Q.value = .72;
    const noiseGain = audio.createGain();
    noiseGain.gain.setValueAtTime(.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(.055, now + .12);
    noiseGain.gain.exponentialRampToValueAtTime(.0001, now + duration);

    const body = audio.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(74, now);
    body.frequency.exponentialRampToValueAtTime(49, now + 1.35);
    const bodyGain = audio.createGain();
    bodyGain.gain.setValueAtTime(.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(.027, now + .16);
    bodyGain.gain.exponentialRampToValueAtTime(.0001, now + 1.5);

    const output = audio.createGain();
    output.gain.value = .72;
    noise.connect(band).connect(noiseGain).connect(output);
    body.connect(bodyGain).connect(output);
    output.connect(audio.destination);
    noise.start(now);
    noise.stop(now + duration);
    body.start(now);
    body.stop(now + 1.55);
    root()?.setAttribute('data-creature-cue-played', 'true');
  };

  const setAmbientLevel = (state) => {
    if (!ambient) return;
    const target = {
      identity: .11,
      dependency: .095,
      habitat: .12,
      pressure: .045,
      response: .105
    }[state] ?? .09;
    ambient.volume = enabled ? clamp(target, 0, .16) : 0;
  };

  const start = async () => {
    if (started) {
      if (ambient && enabled) ambient.play().catch(() => syncRoot('blocked-or-unavailable'));
      return;
    }
    started = true;
    config = await loadConfig();
    ensureProvenance();
    setupAmbient();
    await ensureContext();
    if (ambient && enabled) {
      ambient.play().then(() => syncRoot('playing')).catch(() => {
        syncRoot('blocked-or-unavailable');
        setFieldLabel('FIELD AMBIENCE · OPTIONAL SOURCE BLOCKED · PROCEDURAL FALLBACK ACTIVE');
      });
    }
  };

  const syncToggle = () => {
    window.requestAnimationFrame(() => {
      const isPlaying = button()?.dataset.playing !== 'false';
      enabled = Boolean(isPlaying);
      if (ambient) {
        if (enabled) ambient.play().catch(() => syncRoot('blocked-or-unavailable'));
        else ambient.pause();
      }
      if (ctx) {
        if (enabled) ctx.resume?.();
        else ctx.suspend?.();
      }
      syncRoot(enabled ? (ambient && !ambient.paused ? 'playing' : 'ready') : 'paused');
    });
  };

  window.addEventListener('4planet:nature-browser-ready', async () => {
    try {
      config = await loadConfig();
      ensureProvenance();
      const source = config?.audio?.fieldAmbience;
      if (source?.label) setFieldLabel(`${source.label} · LOADS AFTER ENTRY`);
      syncRoot('armed');
    } catch (error) {
      ensureProvenance();
      syncRoot('failed-optional');
      setFieldLabel('FIELD AMBIENCE · CONFIG UNAVAILABLE · PROCEDURAL FALLBACK ACTIVE');
      console.warn('[4PLANET AUDIO] optional field-audio config failed closed', error);
    }
  });
  window.addEventListener('4planet:nature-browser-enter', () => { start().catch((error) => console.warn('[4PLANET AUDIO] optional field layer failed closed', error)); });
  window.addEventListener('4planet:nature-journey-scene', (event) => setAmbientLevel(event.detail?.state || 'identity'));
  window.addEventListener('4planet:nature-creature-phase', (event) => {
    if (event.detail?.phase === 'observe') playDesignedPresenceCue();
    if (event.detail?.phase === 'dormant') cuePlayed = false;
  });
  window.addEventListener('DOMContentLoaded', () => button()?.addEventListener('click', syncToggle));
  window.addEventListener('pagehide', () => {
    ambient?.pause();
    ambient = null;
    try { ctx?.close?.(); } catch { /* no-op */ }
  }, { once: true });

  window.NatureFieldAudioV19 = { start, playDesignedPresenceCue };
})();
