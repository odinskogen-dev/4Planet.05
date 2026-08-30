(() => {
  const root = () => document.getElementById('browser-experience');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  let budget = 'full';
  let monitoring = false;
  let frame = 0;
  let startedAt = 0;
  let lastFrameAt = 0;
  let samples = [];

  const initialBudget = () => {
    const pixels = Math.max(1, window.innerWidth * window.innerHeight);
    const dpr = window.devicePixelRatio || 1;
    const memory = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
    const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || (memory && memory <= 4) || (cores && cores <= 4)) return 'lite';
    if ((dpr > 1.5 && pixels > 1_250_000) || pixels > 2_600_000) return 'balanced';
    return 'full';
  };

  const setBudget = (next, reason = 'runtime') => {
    const host = root();
    if (!host) return;
    const rank = { full: 2, balanced: 1, lite: 0 };
    const candidate = rank[next] == null ? 'balanced' : next;
    // Runtime adaptation is downgrade-only. A reload may start higher after the
    // environment changes, but one smooth session never oscillates tiers.
    if (host.dataset.runtimeBudget && rank[candidate] > rank[budget]) return;
    budget = candidate;
    host.dataset.runtimeBudget = budget;
    host.dataset.runtimeBudgetReason = reason;
    host.style.setProperty('--runtime-motion-scale', budget === 'full' ? '1' : budget === 'balanced' ? '.78' : '.55');
    window.dispatchEvent(new CustomEvent('4planet:nature-runtime-budget', {
      detail: { budget, reason }
    }));
  };

  const stopMonitor = () => {
    monitoring = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const finishMonitor = () => {
    if (!samples.length) return stopMonitor();
    const useful = samples.filter((value) => value > 0 && value < 120);
    if (!useful.length) return stopMonitor();
    const avg = useful.reduce((a, b) => a + b, 0) / useful.length;
    const sorted = [...useful].sort((a, b) => a - b);
    const p90 = sorted[Math.floor((sorted.length - 1) * .9)] || avg;
    const jank = useful.filter((value) => value > 28).length / useful.length;
    const host = root();
    if (host) {
      host.dataset.runtimeFrameAvg = avg.toFixed(1);
      host.dataset.runtimeFrameP90 = p90.toFixed(1);
      host.dataset.runtimeJank = jank.toFixed(3);
    }
    if (avg > 34 || p90 > 52 || jank > .34) setBudget('lite', 'measured-jank');
    else if (avg > 21.5 || p90 > 32 || jank > .14) setBudget('balanced', 'measured-jank');
    stopMonitor();
  };

  const monitorTick = (time) => {
    if (!monitoring) return;
    if (!startedAt) {
      startedAt = time;
      lastFrameAt = time;
    } else {
      const delta = time - lastFrameAt;
      lastFrameAt = time;
      if (delta < 120) samples.push(delta);
    }
    if (time - startedAt >= 3200 || samples.length >= 180) return finishMonitor();
    frame = requestAnimationFrame(monitorTick);
  };

  const startMonitor = () => {
    if (monitoring || document.hidden) return;
    monitoring = true;
    samples = [];
    startedAt = 0;
    lastFrameAt = 0;
    frame = requestAnimationFrame(monitorTick);
  };

  const setVisibility = () => {
    const host = root();
    if (!host) return;
    host.dataset.runtimePaused = String(document.hidden);
    if (document.hidden) stopMonitor();
  };

  const setup = () => {
    const host = root();
    if (!host) return;
    budget = initialBudget();
    host.dataset.runtimeController = 'v21';
    setBudget(budget, 'device-budget');
    setVisibility();
  };

  window.addEventListener('4planet:nature-browser-ready', setup);
  window.addEventListener('4planet:nature-browser-enter', () => window.setTimeout(startMonitor, 900));
  window.addEventListener('4planet:nature-journey-scene', (event) => {
    const index = Number(event.detail?.index || 0);
    if (index > 0) stopMonitor();
  });
  document.addEventListener('visibilitychange', setVisibility);
  window.addEventListener('pagehide', stopMonitor, { once: true });

  window.NatureRuntimeBudgetV21 = {
    getBudget: () => budget,
    setBudget: (next, reason = 'manual') => setBudget(next, reason),
    startMonitor,
    clamp
  };
})();