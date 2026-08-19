(() => {
  let root = null;
  let manifest = null;
  let sceneToken = 0;

  const compact = () => window.matchMedia('(max-width: 760px)').matches;
  const byAction = (action) => root?.querySelector(`[data-world-action="${action}"]`);

  const ensureDOM = () => {
    if (!root || root.querySelector('.nature-world-interaction')) return;
    const layer = document.createElement('section');
    layer.className = 'nature-world-interaction';
    layer.setAttribute('aria-live', 'polite');
    layer.innerHTML = `
      <div class="nature-world-interaction__thread" aria-hidden="true"><i></i><b></b></div>
      <div class="nature-world-interaction__pressure" aria-hidden="true"><i></i><i></i><i></i></div>
      <article class="nature-world-card" data-visible="false" data-tone="life">
        <div class="nature-world-card__media" hidden>
          <img class="nature-world-card__image" alt="" />
          <a class="nature-world-card__credit" target="_blank" rel="noreferrer"></a>
        </div>
        <div class="nature-world-card__copy">
          <div class="nature-world-card__topline">
            <span class="nature-world-card__kicker">LIVING SYSTEM</span>
            <span class="nature-world-card__truth">SOURCE-AWARE</span>
          </div>
          <h3 class="nature-world-card__title">Follow the system.</h3>
          <em class="nature-world-card__scientific"></em>
          <p class="nature-world-card__relationship"></p>
          <p class="nature-world-card__body"></p>
          <div class="nature-world-card__actions">
            <button class="nature-world-card__primary" type="button" data-world-action="primary">EXPLORE</button>
            <button class="nature-world-card__evidence" type="button" data-world-action="evidence">HOW DO WE KNOW?</button>
          </div>
        </div>
      </article>`;
    root.appendChild(layer);

    byAction('evidence')?.addEventListener('click', () => root?.querySelector('.nature-journey-hud__evidence')?.click());
    byAction('primary')?.addEventListener('click', () => runPrimary());
  };

  const getNode = (index) => manifest?.nodes?.[index];

  const setMedia = (card, config) => {
    const wrap = card.querySelector('.nature-world-card__media');
    const image = card.querySelector('.nature-world-card__image');
    const credit = card.querySelector('.nature-world-card__credit');
    const media = config?.media;
    if (!wrap || !image || !credit || !media?.src) {
      if (wrap) wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    image.src = media.src;
    image.alt = media.alt || 'Related living-system media';
    credit.textContent = `${media.credit?.label || 'MEDIA'}${media.credit?.license ? ` · ${media.credit.license}` : ''}`;
    credit.href = media.credit?.url || '#';
  };

  const cardText = (node, config) => {
    const related = node.relatedEntity;
    if (config?.type === 'relationship' && related) {
      return {
        kicker: `${node.relationClass || 'RELATIONSHIP'} · ${related.relationshipType || 'CONNECTED LIFE'}`,
        title: related.commonName,
        scientific: related.scientificName,
        relationship: related.relationshipLabel,
        body: node.body,
      };
    }
    if (config?.type === 'identity') {
      return {
        kicker: 'SPECIES_ IDENTITY',
        title: manifest.entity.commonName,
        scientific: manifest.entity.scientificName,
        relationship: `GBIF TAXON ${manifest.entity.gbifKey}`,
        body: node.body,
      };
    }
    return {
      kicker: `${node.relationClass || node.kind || 'LIVING SYSTEM'} · ${node.truthState || 'SOURCE-AWARE'}`,
      title: config?.title || node.title,
      scientific: '',
      relationship: config?.relationship || '',
      body: config?.body || node.body,
    };
  };

  const renderCard = (index) => {
    if (!root || !manifest) return;
    const node = getNode(index);
    const config = node?.scene?.interaction;
    const card = root.querySelector('.nature-world-card');
    if (!node || !config || !card) {
      if (card) card.dataset.visible = 'false';
      return;
    }

    const text = cardText(node, config);
    card.dataset.visible = 'false';
    card.dataset.type = config.type || node.kind?.toLowerCase() || 'system';
    card.dataset.align = config.align || 'right';
    card.dataset.tone = config.tone || (node.relationClass === 'PRESSURE' ? 'pressure' : node.relationClass === 'RESPONSE' ? 'response' : 'life');
    card.dataset.nodeId = node.id;
    card.querySelector('.nature-world-card__kicker').textContent = text.kicker;
    card.querySelector('.nature-world-card__truth').textContent = node.truthState || 'SOURCE-AWARE';
    card.querySelector('.nature-world-card__title').textContent = text.title;
    const scientific = card.querySelector('.nature-world-card__scientific');
    scientific.textContent = text.scientific || '';
    scientific.hidden = !text.scientific;
    const relationship = card.querySelector('.nature-world-card__relationship');
    relationship.textContent = text.relationship || '';
    relationship.hidden = !text.relationship;
    card.querySelector('.nature-world-card__body').textContent = text.body || '';
    const primary = card.querySelector('.nature-world-card__primary');
    primary.textContent = config.primaryLabel || 'EXPLORE';
    primary.dataset.mode = config.primaryAction || 'reveal';
    setMedia(card, config);

    root.dataset.worldInteraction = 'idle';
    root.dataset.worldInteractionNode = node.id;
    requestAnimationFrame(() => requestAnimationFrame(() => { card.dataset.visible = 'true'; }));
  };

  const runPrimary = () => {
    if (!root || !manifest) return;
    const index = Number(root.dataset.cinematicIndex || root.dataset.journeyIndex || 0);
    const node = getNode(index);
    const config = node?.scene?.interaction;
    const action = config?.primaryAction || 'reveal';
    const card = root.querySelector('.nature-world-card');
    const button = card?.querySelector('.nature-world-card__primary');

    if (action === 'next') {
      root.querySelector('.nature-journey-hud__next')?.click();
      return;
    }

    const active = root.dataset.worldInteraction === action;
    root.dataset.worldInteraction = active ? 'idle' : action;
    card?.classList.toggle('is-expanded', !active);
    if (button) button.textContent = active ? (config.primaryLabel || 'EXPLORE') : (config.activeLabel || 'REVEALED · CONTINUE');

    window.dispatchEvent(new CustomEvent('4planet:nature-world-interaction', {
      detail: { nodeId: node?.id, index, action, active: !active }
    }));
  };

  const waitForSettled = (index, token, startedAt = performance.now()) => {
    if (!root || token !== sceneToken) return;
    const settled = root.dataset.cinematicSettled === 'true' && root.dataset.cinematicSettledIndex === String(index);
    if (settled || performance.now() - startedAt > 6500) {
      renderCard(index);
      return;
    }
    requestAnimationFrame(() => waitForSettled(index, token, startedAt));
  };

  const onScene = (event) => {
    if (!root || !manifest) return;
    const index = Number(event.detail?.index || 0);
    const card = root.querySelector('.nature-world-card');
    if (card) card.dataset.visible = 'false';
    root.dataset.worldInteraction = 'idle';
    root.dataset.worldInteractionNode = manifest.nodes?.[index]?.id || '';
    const token = ++sceneToken;
    window.setTimeout(() => waitForSettled(index, token), compact() ? 120 : 220);
  };

  const setup = (event) => {
    root = document.getElementById('browser-experience');
    manifest = event.detail?.manifest;
    if (!root || !manifest) return;
    ensureDOM();
    root.dataset.interactionEngine = 'v1.3';
  };

  window.addEventListener('4planet:nature-browser-ready', setup);
  window.addEventListener('4planet:nature-journey-scene', onScene);
})();
