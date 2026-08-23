(() => {
  const safeText = (value, fallback = 'UNKNOWN') => String(value || fallback).trim();

  const create = (root) => {
    const aside = document.createElement('aside');
    aside.className = 'nature-context-ribbon';
    aside.setAttribute('aria-label', 'Journey context and evidence');
    aside.innerHTML = `
      <div class="nature-context-ribbon__facts">
        <span><b>PLACE</b><i data-context-place>CONTEXT</i></span>
        <span><b>RELATION</b><i data-context-relation>LIFE</i></span>
        <span><b>EVIDENCE</b><i data-context-truth>UNKNOWN</i></span>
      </div>
      <p data-context-boundary>Truth boundaries remain attached to the current scene.</p>
      <div class="nature-context-ribbon__links">
        <a data-context-atlas href="/atlas">OPEN IN ATLAS →</a>
        <a data-context-source href="/species" target="_blank" rel="noreferrer">VIEW SOURCE ↗</a>
      </div>`;
    root.appendChild(aside);
    return aside;
  };

  const render = ({ root, manifest }) => {
    if (!root || !manifest?.nodes?.length) return null;
    const ribbon = root.querySelector('.nature-context-ribbon') || create(root);
    const place = ribbon.querySelector('[data-context-place]');
    const relation = ribbon.querySelector('[data-context-relation]');
    const truth = ribbon.querySelector('[data-context-truth]');
    const boundary = ribbon.querySelector('[data-context-boundary]');
    const atlas = ribbon.querySelector('[data-context-atlas]');
    const source = ribbon.querySelector('[data-context-source]');
    const atlasHref = manifest.environment?.atlasHref || `/atlas?journey=${encodeURIComponent(manifest.entity?.slug || manifest.id || 'nature')}`;

    const update = (index) => {
      const node = manifest.nodes[index] || manifest.nodes[0];
      if (place) place.textContent = safeText(manifest.environment?.label || manifest.environment?.id, 'LIVING WORLD');
      if (relation) relation.textContent = safeText(node.relationClass || node.kind, 'LIFE').replaceAll('_', ' ');
      if (truth) truth.textContent = safeText(node.truthState, 'UNKNOWN');
      if (boundary) boundary.textContent = safeText(node.boundary, manifest.truthBoundary || 'Source-aware representation.');
      if (atlas) atlas.href = atlasHref;
      if (source) {
        source.href = node.source?.url || manifest.returnHref || '/species';
        source.hidden = !node.source?.url;
      }
      ribbon.dataset.state = String(node.scene?.state || node.relationClass || node.kind || 'life').toLowerCase();
      ribbon.dataset.truth = safeText(node.truthState, 'UNKNOWN').toLowerCase();
    };

    update(0);
    window.addEventListener('4planet:nature-journey-scene', (event) => update(Number(event.detail?.index || 0)));
    return ribbon;
  };

  window.NatureJourneyContext = { render };
})();