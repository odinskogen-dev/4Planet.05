(() => {
  'use strict';

  const root = document.getElementById('jaguar-experience');
  const stage = document.getElementById('three-stage');
  const enter = document.getElementById('enter');
  const controls = document.getElementById('controls');
  const status = document.getElementById('runtime-status');
  if (!root || !stage || !enter || root.dataset.jaguarV55LegacyBlock === 'true') return;

  const SOURCE = 'ear-rodriguez-local-v52-source-derived';
  const POSE = 'source-bind-pose-perspective';
  const MATERIAL = 'procedural-natural-rosette-v52-not-source-texture';
  const MASTER_SHA = '8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13';

  root.dataset.jaguarV55LegacyBlock = 'true';

  function v52Ready() {
    return root.dataset.jaguarV52Booted === 'true' && root.dataset.jaguarQuality === 'volumetric-v52' && !!stage.querySelector('canvas.jaguar-local-v52');
  }

  function assertV52Authority() {
    if (!v52Ready()) return;
    root.dataset.jaguar3d = 'ready';
    root.dataset.jaguar3dSource = SOURCE;
    root.dataset.jaguarPose = POSE;
    root.dataset.jaguarMaterial = MATERIAL;
    root.dataset.jaguarMasterSha256 = MASTER_SHA;
    root.dataset.jaguarVisual = 'visible';
    root.dataset.jaguarMotionTruth = 'procedural-presentation-motion-not-source-animation';
    root.dataset.jaguar3dActive = String(Number(root.dataset.scene || '0') === 0 && !document.hidden);
    if (Number(root.dataset.scene || '0') === 0 && status) status.textContent = 'EAR JAGUAR · VOLUMETRIC 3D ACTIVE';
  }

  // V33 attaches a bubble-phase ENTER listener that calls stage.replaceChildren()
  // and replaces the accepted V52 canvas with the legacy 457-vertex surface.
  // Once V52 is ready, consume ENTER in capture phase, preserve the normal entered
  // state, and leave the V52 renderer mounted. This blocks only the superseded
  // renderer boot; journey navigation remains owned by V33 and is preserved.
  enter.addEventListener('click', (event) => {
    if (!v52Ready()) return;
    event.stopImmediatePropagation();
    root.dataset.entered = 'true';
    assertV52Authority();
  }, { capture: true });

  // V33 owns the legacy LUME button handler but refuses all controls while its
  // renderer is not booted. Preserve LOOK/MOVE in V52 and own only the LUME state
  // here when the legacy renderer is intentionally blocked.
  controls?.addEventListener('click', (event) => {
    if (!v52Ready() || event.target?.dataset?.action !== 'lume') return;
    root.dataset.lume = String(root.dataset.lume !== 'true');
    assertV52Authority();
  });

  const observer = new MutationObserver(assertV52Authority);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ['data-jaguar-quality','data-jaguar3d','data-jaguar3d-source','data-jaguar-pose','data-jaguar-material','data-jaguar-master-sha256','data-jaguar-visual','data-jaguar3d-active','data-scene','data-lume']
  });
  document.addEventListener('visibilitychange', assertV52Authority, { passive: true });
  window.addEventListener('pageshow', assertV52Authority, { passive: true });
  assertV52Authority();
})();
