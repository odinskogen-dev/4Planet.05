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

  const applyPointerAuthority = () => {
    const stage = document.getElementById('three-stage');
    const encounter = document.getElementById('encounter');
    if (!stage || !encounter) return;

    const creatureOwnsPointer = Number(root.dataset.scene || '0') === 0;
    stage.querySelectorAll('canvas').forEach((canvas) => {
      if (creatureOwnsPointer) canvas.style.removeProperty('pointer-events');
      else canvas.style.setProperty('pointer-events', 'none', 'important');
    });

    if (creatureOwnsPointer) encounter.style.removeProperty('pointer-events');
    else encounter.style.setProperty('pointer-events', 'none', 'important');

    root.dataset.jaguarPointerAuthority = creatureOwnsPointer ? 'creature' : 'journey';
  };

  apply();
  applyPointerAuthority();

  const observer = new MutationObserver(apply);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-jaguar-quality', 'data-jaguar-ear-full'],
  });

  const sceneObserver = new MutationObserver(applyPointerAuthority);
  sceneObserver.observe(root, { attributes: true, attributeFilter: ['data-scene'] });

  const stage = document.getElementById('three-stage');
  if (stage) {
    const stageObserver = new MutationObserver(applyPointerAuthority);
    stageObserver.observe(stage, { childList: true });
  }

  window.addEventListener('pageshow', () => {
    apply();
    applyPointerAuthority();
  }, { passive: true });
})();
