(() => {
  'use strict';

  const root = document.getElementById('jaguar-experience');
  if (!root || root.dataset.jaguarHumanFirstV62 === 'true') return;
  root.dataset.jaguarHumanFirstV62 = 'true';

  const apply = () => {
    if (root.dataset.jaguarQuality !== 'volumetric-v52' && root.dataset.jaguarEarFull !== 'ready') return;

    const status = document.getElementById('runtime-status');
    const state = document.getElementById('creature-state');

    if (status && status.textContent !== 'JAGUAR · READY') status.textContent = 'JAGUAR · READY';
    if (state) {
      const copy = 'Turn the jaguar, bring its gaze toward you, or enter LUME.';
      if (state.textContent !== copy) state.textContent = copy;
    }
  };

  apply();

  const observer = new MutationObserver(apply);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-jaguar-quality', 'data-jaguar-ear-full'],
  });

  window.addEventListener('pageshow', apply, { passive: true });
})();
