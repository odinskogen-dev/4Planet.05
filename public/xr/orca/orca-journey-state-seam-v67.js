(() => {
  'use strict';

  const ROOT_ID = 'browser-experience';
  const VALID_STATES = new Set(['identity', 'dependency', 'habitat', 'pressure', 'response']);

  function install(root) {
    if (!root || root.dataset.orcaJourneyStateSeam === 'v67') return;
    root.dataset.orcaJourneyStateSeam = 'v67';

    let canonical = null;
    let canonicalIndex = null;
    let canonicalNode = null;

    const enforce = () => {
      if (!canonical || !VALID_STATES.has(canonical)) return;
      if (root.dataset.sceneState !== canonical) root.dataset.sceneState = canonical;
      if (canonicalIndex !== null && root.dataset.journeyIndex !== canonicalIndex) root.dataset.journeyIndex = canonicalIndex;
      if (canonicalNode && root.dataset.journeyNode !== canonicalNode) root.dataset.journeyNode = canonicalNode;
    };

    window.addEventListener('4planet:nature-journey-scene', (event) => {
      const detail = event.detail || {};
      const state = typeof detail.state === 'string' ? detail.state : '';
      if (!VALID_STATES.has(state)) return;

      canonical = state;
      canonicalIndex = Number.isFinite(Number(detail.index)) ? String(Number(detail.index)) : root.dataset.journeyIndex || null;
      canonicalNode = typeof detail.nodeId === 'string' && detail.nodeId ? detail.nodeId : root.dataset.journeyNode || null;

      // NatureJourneyEngine is the authority. This listener is deliberately
      // loaded after the presentation consumers and only restores that same
      // event payload if a synchronous consumer disturbed the public contract.
      enforce();
      queueMicrotask(enforce);
    });
  }

  const boot = () => install(document.getElementById(ROOT_ID));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.OrcaJourneyStateSeamV67 = { install };
})();
