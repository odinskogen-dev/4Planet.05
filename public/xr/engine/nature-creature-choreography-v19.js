(() => {
  const root = () => document.getElementById('browser-experience');
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const actors = new Set();
  let config = null;
  let timeline = [];
  let generation = 0;
  let revealFrame = 0;
  let revealStartedAt = 0;

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const ease = (value) => {
    const t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  };

  const loadConfig = async () => {
    const url = root()?.dataset.creatureConfig;
    if (!url) return null;
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Creature config failed: ${response.status}`);
    return response.json();
  };

  const dispatch = (phase, detail = {}) => {
    const host = root();
    if (!host) return;
    host.dataset.creatureEngine = 'v19';
    host.dataset.creaturePhase = phase;
    actors.forEach((actor) => {
      try { actor?.setPhase?.(phase, detail); } catch (error) { console.warn('[4PLANET CREATURE] actor phase failed closed', error); }
    });
    window.dispatchEvent(new CustomEvent('4planet:nature-creature-phase', {
      detail: { phase, config, ...detail }
    }));
  };

  const setReveal = (value) => {
    const host = root();
    if (!host) return;
    const progress = clamp(value, 0, 1);
    host.style.setProperty('--creature-reveal', progress.toFixed(4));
    host.dataset.creatureReveal = progress >= .985 ? 'complete' : progress > .01 ? 'active' : 'idle';
    actors.forEach((actor) => {
      try { actor?.setReveal?.(progress); } catch (error) { console.warn('[4PLANET CREATURE] actor reveal failed closed', error); }
    });
  };

  const animateReveal = (duration = 2800) => new Promise((resolve) => {
    if (reducedMotion()) {
      setReveal(1);
      resolve();
      return;
    }
    cancelAnimationFrame(revealFrame);
    revealStartedAt = performance.now();
    const tick = (time) => {
      const progress = ease((time - revealStartedAt) / Math.max(1, duration));
      setReveal(progress);
      if (progress >= .999) {
        revealFrame = 0;
        resolve();
        return;
      }
      revealFrame = requestAnimationFrame(tick);
    };
    revealFrame = requestAnimationFrame(tick);
  });

  const reset = () => {
    generation += 1;
    if (revealFrame) cancelAnimationFrame(revealFrame);
    revealFrame = 0;
    setReveal(0);
    dispatch('dormant');
  };

  const run = async () => {
    if (!root() || !timeline.length) return;
    const runId = ++generation;
    setReveal(0);
    for (const step of timeline) {
      if (runId !== generation) return;
      const phase = String(step.phase || '').trim();
      if (!phase) continue;
      dispatch(phase, { cue: step.cue || '', durationMs: Number(step.durationMs || 0) });
      if (phase === 'reveal') await animateReveal(Number(step.durationMs || 2800));
      else if (!reducedMotion() && Number(step.durationMs || 0) > 0) await wait(Number(step.durationMs));
      else if (reducedMotion() && ['emerge', 'walk', 'stop'].includes(phase)) await wait(80);
      if (runId !== generation) return;
    }
  };

  const registerActor = (actor) => {
    if (!actor) return () => {};
    actors.add(actor);
    const host = root();
    if (host?.dataset.creaturePhase) actor.setPhase?.(host.dataset.creaturePhase, { config });
    actor.setReveal?.(Number.parseFloat(getComputedStyle(host || document.documentElement).getPropertyValue('--creature-reveal')) || 0);
    return () => actors.delete(actor);
  };

  const setup = async () => {
    const host = root();
    if (!host) return;
    try {
      config = await loadConfig();
      timeline = Array.isArray(config?.choreography) ? config.choreography : [];
      host.dataset.creatureEngine = 'v19';
      host.dataset.creatureSpecies = config?.species?.commonName || '';
      host.dataset.creaturePreferredAsset = config?.actor?.preferred?.id || '';
      host.dataset.creaturePreferredBinary = config?.actor?.preferred?.binaryState || 'UNKNOWN';
      setReveal(0);
      dispatch('dormant');
      window.dispatchEvent(new CustomEvent('4planet:nature-creature-ready', { detail: { config } }));
    } catch (error) {
      host.dataset.creatureEngine = 'failed-optional';
      console.warn('[4PLANET CREATURE] choreography config failed closed', error);
    }
  };

  window.addEventListener('4planet:nature-browser-ready', setup);
  window.addEventListener('4planet:nature-browser-enter', () => { run(); });
  window.addEventListener('4planet:nature-journey-scene', (event) => {
    const index = Number(event.detail?.index || 0);
    if (index !== 0) reset();
  });
  window.addEventListener('pagehide', () => { reset(); actors.clear(); }, { once: true });

  window.NatureCreatureV19 = {
    registerActor,
    reset,
    run,
    getConfig: () => config,
    getTimeline: () => [...timeline]
  };
})();
