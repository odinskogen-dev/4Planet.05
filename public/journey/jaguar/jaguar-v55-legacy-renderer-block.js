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
  const ATTRIBUTION = 'EAR.RODRIGUEZ · CC BY 4.0';
  let reconciling = false;

  root.dataset.jaguarV55LegacyBlock = 'true';

  function v52Booted() {
    return root.dataset.jaguarV52Booted === 'true';
  }

  function v52Ready() {
    return v52Booted() &&
      root.dataset.jaguarQuality === 'volumetric-v52' &&
      !!stage.querySelector('canvas.jaguar-local-v52');
  }

  function setDataset(key, value) {
    if (root.dataset[key] !== value) root.dataset[key] = value;
  }

  function ensureAttribution() {
    let credit = stage.querySelector('.jaguar-local-v48-credit');
    if (!credit) {
      credit = document.createElement('div');
      // Keep the historic class as a compatibility hook for the established rights gate.
      // The element belongs to the accepted V52 source-derived renderer, not the retired V48 runtime.
      credit.className = 'jaguar-local-v48-credit';
      credit.setAttribute('data-renderer', 'v52');
      credit.setAttribute('aria-label', 'Jaguar 3D source attribution');
      credit.style.cssText = 'position:absolute;left:14px;bottom:12px;z-index:14;font:500 10px/1.2 Fragment Mono,monospace;letter-spacing:.08em;color:rgba(255,255,255,.72);pointer-events:none;text-transform:uppercase;';
      stage.appendChild(credit);
    }
    if (credit.textContent !== ATTRIBUTION) credit.textContent = ATTRIBUTION;
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
      ensureAttribution();
      if (Number(root.dataset.scene || '0') === 0 && status && status.textContent !== 'EAR JAGUAR · VOLUMETRIC 3D ACTIVE') {
        status.textContent = 'EAR JAGUAR · VOLUMETRIC 3D ACTIVE';
      }
    } finally {
      reconciling = false;
    }
  }

  // V33 attaches a bubble-phase ENTER listener that calls stage.replaceChildren()
  // and replaces the accepted V52 canvas with the superseded 457-vertex surface.
  // Guard as soon as the V52 boot path exists, not only after async V52 init finishes.
  // This removes the WebKit/mobile timing race where an early ENTER click could erase
  // the V52 canvas before it became ready. If V52 later fails, the controlled photo
  // fallback remains preferable to reviving the rejected legacy renderer.
  enter.addEventListener('click', (event) => {
    if (!v52Booted()) return;
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
