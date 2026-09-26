(() => {
  'use strict';

  const root = document.getElementById('jaguar-experience');
  const stage = document.getElementById('three-stage');
  const fallback = document.getElementById('photo-fallback');
  if (!root || !stage || root.dataset.jaguarV54Authority === 'true') return;

  const SOURCE = 'ear-rodriguez-local-v52-source-derived';
  const POSE = 'source-bind-pose-perspective';
  const MATERIAL = 'procedural-natural-rosette-v52-not-source-texture';
  const MASTER_SHA = '8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13';
  let reconciling = false;

  root.dataset.jaguarV54Authority = 'true';

  const style = document.createElement('style');
  style.dataset.jaguarV54Authority = 'true';
  style.textContent = `
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] #three-stage > canvas.jaguar-local-v52{
      display:block!important;
      opacity:1!important;
      visibility:visible!important;
      pointer-events:auto!important;
      z-index:9!important;
    }
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] #three-stage > canvas.jaguar-local-v48{
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
    }
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] #photo-fallback,
    #jaguar-experience[data-jaguar-quality="volumetric-v52"] #loading{
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
    }
  `;
  document.head.appendChild(style);

  function reconcile() {
    if (reconciling || root.dataset.jaguarQuality !== 'volumetric-v52') return;
    const v52 = stage.querySelector('canvas.jaguar-local-v52');
    if (!v52) return;
    reconciling = true;
    try {
      const desired = {
        jaguar3d: 'ready',
        jaguar3dSource: SOURCE,
        jaguarPose: POSE,
        jaguarMaterial: MATERIAL,
        jaguarMasterSha256: MASTER_SHA,
        jaguarVisual: 'visible',
        jaguar3dActive: String(Number(root.dataset.scene || '0') === 0 && !document.hidden)
      };
      for (const [key, value] of Object.entries(desired)) {
        if (root.dataset[key] !== value) root.dataset[key] = value;
      }
      v52.style.removeProperty('display');
      if (fallback && !fallback.hidden) fallback.hidden = true;
      const v48 = stage.querySelector('canvas.jaguar-local-v48');
      if (v48) v48.setAttribute('aria-hidden', 'true');

      // Keep source/method detail one interaction away in HOW DO WE KNOW?.
      // The first-read encounter should describe the animal, not the renderer.
      const status = document.getElementById('runtime-status');
      if (status && status.textContent !== 'JAGUAR · READY') status.textContent = 'JAGUAR · READY';
      const state = document.getElementById('creature-state');
      const encounterCopy = 'A source-derived 3D jaguar stands in the rainforest room. Turn it, observe it, then follow the living system around it.';
      if (state && state.textContent !== encounterCopy) state.textContent = encounterCopy;
    } finally {
      reconciling = false;
    }
  }

  const rootObserver = new MutationObserver(reconcile);
  rootObserver.observe(root, {
    attributes: true,
    attributeFilter: [
      'data-jaguar-quality',
      'data-jaguar3d',
      'data-jaguar3d-source',
      'data-jaguar-pose',
      'data-jaguar-material',
      'data-jaguar-master-sha256',
      'data-jaguar-visual',
      'data-jaguar3d-active',
      'data-scene'
    ]
  });
  const stageObserver = new MutationObserver(reconcile);
  stageObserver.observe(stage, { childList: true });

  document.addEventListener('visibilitychange', reconcile, { passive: true });
  window.addEventListener('pageshow', reconcile, { passive: true });
  document.getElementById('enter')?.addEventListener('click', () => {
    requestAnimationFrame(() => requestAnimationFrame(reconcile));
  });

  reconcile();
})();
