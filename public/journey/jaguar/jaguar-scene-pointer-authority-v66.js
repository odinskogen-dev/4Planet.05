(() => {
  'use strict';

  const root = document.getElementById('jaguar-experience');
  const stage = document.getElementById('three-stage');
  const encounter = document.getElementById('encounter');
  if (!root || !stage || !encounter) return;

  const apply = () => {
    const encounterScene = Number(root.dataset.scene || '0') === 0;

    // Scene 01 owns creature interaction. Scenes 02–08 own the canonical
    // chapter navigation. Use inline !important here because the V52 renderer
    // injects its own runtime stylesheet after the static Journey CSS.
    stage.querySelectorAll('canvas').forEach((canvas) => {
      if (encounterScene) canvas.style.removeProperty('pointer-events');
      else canvas.style.setProperty('pointer-events', 'none', 'important');
    });

    if (encounterScene) encounter.style.removeProperty('pointer-events');
    else encounter.style.setProperty('pointer-events', 'none', 'important');

    root.dataset.jaguarPointerAuthority = encounterScene ? 'creature' : 'journey';
  };

  apply();

  const sceneObserver = new MutationObserver(apply);
  sceneObserver.observe(root, { attributes: true, attributeFilter: ['data-scene'] });

  // V52 mounts its canvas asynchronously. Re-apply authority when a renderer
  // canvas enters the stage without observing style mutations or polling.
  const stageObserver = new MutationObserver(apply);
  stageObserver.observe(stage, { childList: true });
})();
