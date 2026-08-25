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
  let reconciling = false;

  root.dataset.jaguarV55LegacyBlock = 'true';

  function v52Ready() {
    return root.dataset.jaguarV52Booted === 'true' &&
      root.dataset.jaguarQuality === 'volumetric-v52' &&
      !!stage.querySelector('canvas.jaguar-local-v52');
  }

  function setDataset(key, value) {
    if (root.dataset[key] !== value) root.dataset[key] = value;
  }

  function assertV52Authority() {
    if (reconciling || !v52Ready()) return;
    reconciling = true;
    try {
      setDataset('jaguar3d', 'ready');
      setDataset('jaguar3dSource', SOURCE);
      setDataset('jaguarPose', POSE);
      setDataset('jaguarMaterial', MATERIAL);
      setDataset('jaguarMasterSha256', MASTER_SHA);
      setDataset('jaguarVisual', 'visible');
      setDataset('jaguarMotionTruth', 'procedural-presentation-motion-not-source-animation');
      setDataset('jaguar3dActive', String(Number(root.dataset.scene || '0') === 0 && !document.hidden));
      if (Number(root.dataset.scene || '0') === 0 && status && status.textContent !== 'EAR JAGUAR · VOLUMETRIC 3D ACTIVE') {
        status.textContent = 'EAR JAGUAR · VOLUMETRIC 3D ACTIVE';
      }
    } finally {
      reconciling = false;
    }
  }

  // V33 attaches a bubble-phase ENTER listener that calls stage.replaceChildren()
  // and replaces the accepted V52 canvas with the legacy 457-vertex surface.
  // Once V52 is ready, consume ENTER in capture phase, preserve the entered state,
  // and leave the V52 renderer mounted. This blocks only the superseded renderer boot.
  enter.addEventListener('click', (event) => {
    if (!v52Ready()) return;
    event.stopImmediatePropagation();
    setDataset('entered', 'true');
    assertV52Authority();
  }, { capture: true });

  // V33 owns the legacy LUME handler but refuses controls while its renderer is
  // intentionally blocked. Preserve LOOK/MOVE in V52 and own only LUME here.
  controls?.addEventListener('click', (event) => {
    if (!v52Ready() || event.target?.dataset?.action !== 'lume') return;
    setDataset('lume', String(root.dataset.lume !== 'true'));
    assertV52Authority();
  });

  // Watch only state that can displace V52 authority. Writes above are idempotent,
  // so this observer cannot self-sustain a mutation microtask loop.
  const observer = new MutationObserver(assertV52Authority);
  observer.observe(root, {
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
  document.addEventListener('visibilitychange', assertV52Authority, { passive: true });
  window.addEventListener('pageshow', assertV52Authority, { passive: true });
  assertV52Authority();
})();
