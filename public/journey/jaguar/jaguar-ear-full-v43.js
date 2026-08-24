(() => {
  'use strict';

  const root = document.getElementById('jaguar-experience');
  const stage = document.getElementById('three-stage');
  const fallback = document.getElementById('photo-fallback');
  const loading = document.getElementById('loading');
  const enter = document.getElementById('enter');
  const controls = document.getElementById('controls');
  if (!root || !stage || root.dataset.jaguarEarFullBooted === 'true') return;

  root.dataset.jaguarEarFullBooted = 'true';
  root.dataset.jaguarEarFull = 'fallback';
  root.dataset.jaguarEarDelivery = 'local-source-derivative-v48-pending';
  root.dataset.jaguar3dSource = 'controlled-species-media-until-local-v48';
  root.dataset.jaguarEarFullFailure = 'external-viewer-rejected-white-panel';

  const style = document.createElement('style');
  style.textContent = `
    #jaguar-experience[data-jaguar-ear-delivery="local-source-derivative-v48-pending"] #three-stage > canvas{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
    #jaguar-experience[data-jaguar-ear-delivery="local-source-derivative-v48-pending"] #photo-fallback{display:block!important;opacity:1!important;visibility:visible!important;pointer-events:none!important}
    #jaguar-experience[data-jaguar-ear-delivery="local-source-derivative-v48-pending"] #loading{display:none!important}
  `;
  document.head.appendChild(style);

  function preserveLeadingVisual() {
    if (Number(root.dataset.scene || '0') !== 0) return;
    stage.querySelectorAll(':scope > canvas').forEach((canvas) => {
      canvas.style.opacity = '0';
      canvas.style.visibility = 'hidden';
      canvas.style.pointerEvents = 'none';
    });
    if (fallback) {
      fallback.hidden = false;
      fallback.removeAttribute('aria-hidden');
      fallback.style.opacity = '1';
      fallback.style.visibility = 'visible';
    }
    if (loading) loading.hidden = true;
    root.dataset.jaguarEarFull = 'fallback';
    root.dataset.jaguarEarDelivery = 'local-source-derivative-v48-pending';
    root.dataset.jaguar3dSource = 'controlled-species-media-until-local-v48';
    root.dataset.jaguar3dActive = 'false';
    const status = document.getElementById('runtime-status');
    if (status) status.textContent = 'JAGUAR · CONTROLLED SPECIES MEDIA';
    const state = document.getElementById('creature-state');
    if (state) state.textContent = 'The broken external 3D viewer has been removed. Controlled Jaguar media remains visible while the local Ear.Rodriguez high-fidelity derivative is integrated.';
    controls?.querySelectorAll('button[data-action="look"],button[data-action="move"]').forEach((button) => { button.hidden = true; });
    const hint = controls?.querySelector('span');
    if (hint) hint.textContent = 'LOCAL HIGH-FIDELITY 3D · IN QA';
  }

  const observer = new MutationObserver(() => requestAnimationFrame(preserveLeadingVisual));
  observer.observe(root, { attributes: true, attributeFilter: ['data-jaguar3d', 'data-scene'] });
  enter?.addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(preserveLeadingVisual)));
  preserveLeadingVisual();
})();
