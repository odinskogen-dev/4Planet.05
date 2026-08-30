(() => {
  let root;
  let manifest;
  let config;
  let layer;
  let activeState = 'identity';

  const sameOriginHref = (href) => typeof href === 'string' && href.startsWith('/');
  const sceneConfig = (state) => config?.scenes?.[state] || null;
  const currentNode = (event) => {
    const index = Number(event?.detail?.index ?? root?.dataset?.journeyIndex ?? root?.dataset?.cinematicIndex ?? 0);
    return manifest?.nodes?.[index] || null;
  };

  const loadConfig = async () => {
    const url = root?.dataset?.premiumConfig;
    if (!url) return null;
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Premium Journey config failed: ${response.status}`);
    return response.json();
  };

  const ensureLayer = () => {
    if (!root || layer) return layer;
    layer = document.createElement('section');
    layer.className = 'nature-premium';
    layer.dataset.mode = 'encounter';
    layer.dataset.hasPanel = 'false';
    layer.dataset.detailOpen = 'false';
    layer.setAttribute('aria-label', 'Interactive Journey intelligence layer');
    layer.innerHTML = `
      <div class="nature-premium__hotspots" aria-label="Interactive scene hotspots"></div>
      <article class="nature-premium__panel" aria-live="polite">
        <div class="nature-premium__panel-inner">
          <div class="nature-premium__kicker"><span>4PLANET JOURNEY</span><span class="nature-premium__state">SOURCE-AWARE</span></div>
          <h3 class="nature-premium__title"></h3>
          <p class="nature-premium__body"></p>
          <div class="nature-premium__items"></div>
          <div class="nature-premium__modules"></div>
          <div class="nature-premium__actors" hidden>
            <div class="nature-premium__actors-title">ACTOR ROLES · NOT PARTNERSHIPS</div>
            <div class="nature-premium__actor-grid"></div>
          </div>
        </div>
      </article>
      <article class="nature-premium__detail" aria-live="polite">
        <button type="button" aria-label="Close hotspot detail">×</button>
        <b class="nature-premium__detail-kicker">CONTEXT</b>
        <h4 class="nature-premium__detail-title"></h4>
        <p class="nature-premium__detail-body"></p>
      </article>
      <div class="nature-premium__audio" aria-hidden="true">
        <div class="nature-premium__audio-label"><b>AMBIENT AUDIO</b><span class="nature-premium__audio-scene">PROCEDURAL · NOT FIELD AUDIO</span></div>
        <div class="nature-premium__wave"></div>
      </div>`;
    root.appendChild(layer);
    const wave = layer.querySelector('.nature-premium__wave');
    if (wave) {
      for (let i = 0; i < 32; i += 1) {
        const bar = document.createElement('i');
        const h = 22 + ((i * 17) % 74);
        bar.style.setProperty('--h', `${h}%`);
        bar.style.setProperty('--delay', `${(-i * 0.047).toFixed(3)}s`);
        wave.appendChild(bar);
      }
    }
    layer.querySelector('.nature-premium__detail button')?.addEventListener('click', () => {
      layer.dataset.detailOpen = 'false';
      layer.querySelectorAll('.nature-premium-hotspot').forEach((node) => node.dataset.selected = 'false');
    });
    return layer;
  };

  const renderHotspots = (scene) => {
    const host = layer?.querySelector('.nature-premium__hotspots');
    if (!host) return;
    host.innerHTML = '';
    (scene?.hotspots || []).forEach((hotspot) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nature-premium-hotspot';
      button.dataset.tone = hotspot.tone || (scene.mode === 'pressure' ? 'pressure' : scene.mode === 'ocean' ? 'ocean' : 'life');
      button.dataset.selected = 'false';
      button.style.setProperty('--x', `${hotspot.x}%`);
      button.style.setProperty('--y', `${hotspot.y}%`);
      button.setAttribute('aria-label', `${hotspot.label}${hotspot.sublabel ? ` — ${hotspot.sublabel}` : ''}`);
      button.innerHTML = `<span class="nature-premium-hotspot__dot"></span><span class="nature-premium-hotspot__label"><b>${hotspot.label}</b><span>${hotspot.sublabel || 'LOOK CLOSER'}</span></span>`;
      button.addEventListener('click', () => {
        if (sameOriginHref(hotspot.href)) {
          window.location.assign(hotspot.href);
          return;
        }
        layer.querySelectorAll('.nature-premium-hotspot').forEach((node) => node.dataset.selected = 'false');
        button.dataset.selected = 'true';
        const detail = layer.querySelector('.nature-premium__detail');
        detail.querySelector('.nature-premium__detail-kicker').textContent = hotspot.kicker || 'SCENE CONTEXT';
        detail.querySelector('.nature-premium__detail-title').textContent = hotspot.label;
        detail.querySelector('.nature-premium__detail-body').textContent = hotspot.detail || hotspot.sublabel || 'Context is intentionally bounded to what this scene can support.';
        layer.dataset.detailOpen = 'true';
        window.dispatchEvent(new CustomEvent('4planet:nature-premium-hotspot', { detail: { state: activeState, hotspot } }));
      });
      host.appendChild(button);
    });
  };

  const renderItems = (scene) => {
    const host = layer?.querySelector('.nature-premium__items');
    if (!host) return;
    host.innerHTML = '';
    (scene?.items || []).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'nature-premium-item';
      row.innerHTML = `<div><b>${item.label}</b><small>${item.note || ''}</small></div><em>${item.state || 'CONTEXT'}</em>`;
      host.appendChild(row);
    });
  };

  const moduleNode = (item, index) => {
    const node = document.createElement(sameOriginHref(item.href) ? 'a' : 'div');
    node.className = 'nature-premium-module';
    if (sameOriginHref(item.href)) node.href = item.href;
    node.innerHTML = `<span class="nature-premium-module__icon">${String(index + 1).padStart(2, '0')}</span><div><b>${item.label}</b><span>${item.state || 'PATHWAY · REVIEW REQUIRED'}</span></div><i>→</i>`;
    return node;
  };

  const renderModules = (scene) => {
    const host = layer?.querySelector('.nature-premium__modules');
    if (!host) return;
    host.innerHTML = '';
    const modules = [...(scene?.modules || [])];
    if (activeState === 'response' && manifest?.entity?.slug) {
      modules.unshift({
        label: 'OPEN SOLUTIONS INTELLIGENCE',
        state: 'RESPONSE + ACTOR ROLE PROTOTYPE · NO DELIVERY CLAIM',
        href: `/journey/solutions/?journey=${encodeURIComponent(manifest.entity.slug)}`
      });
    }
    modules.forEach((item, index) => host.appendChild(moduleNode(item, index)));
  };

  const renderActors = (scene) => {
    const wrap = layer?.querySelector('.nature-premium__actors');
    const host = layer?.querySelector('.nature-premium__actor-grid');
    if (!wrap || !host) return;
    const roles = scene?.actorRoles || [];
    wrap.hidden = !roles.length;
    host.innerHTML = '';
    roles.forEach((role) => {
      const node = document.createElement('span');
      node.textContent = role;
      host.appendChild(node);
    });
  };

  const renderScene = (state, event) => {
    if (!layer || !config) return;
    const nextState = state || 'identity';
    const sameState = activeState === nextState;
    const preserveDetail = sameState && layer.dataset.detailOpen === 'true';
    activeState = nextState;
    const scene = sceneConfig(activeState);
    const node = currentNode(event);
    if (!scene) {
      layer.dataset.hasPanel = 'false';
      layer.dataset.detailOpen = 'false';
      layer.querySelector('.nature-premium__hotspots').innerHTML = '';
      return;
    }
    layer.dataset.mode = scene.mode || activeState;
    layer.dataset.hasPanel = String(Boolean(scene.panel || scene.items?.length || scene.modules?.length || activeState === 'response'));
    if (!preserveDetail) layer.dataset.detailOpen = 'false';
    const kicker = layer.querySelector('.nature-premium__kicker span:first-child');
    const stateNode = layer.querySelector('.nature-premium__state');
    const title = layer.querySelector('.nature-premium__title');
    const body = layer.querySelector('.nature-premium__body');
    if (kicker) kicker.textContent = scene.kicker || node?.scene?.stageLabel || '4PLANET JOURNEY';
    if (stateNode) stateNode.textContent = scene.truthLabel || node?.truthState || 'SOURCE-AWARE';
    if (title) title.textContent = scene.title || node?.scene?.sceneTitle || node?.title || '';
    if (body) body.textContent = scene.body || node?.body || '';
    const audioLabel = layer.querySelector('.nature-premium__audio-scene');
    if (audioLabel) audioLabel.textContent = scene.audioLabel || 'PROCEDURAL · NOT FIELD AUDIO';
    renderHotspots(scene);
    renderItems(scene);
    renderModules(scene);
    renderActors(scene);
    root.dataset.premiumMode = layer.dataset.mode;
    window.dispatchEvent(new CustomEvent('4planet:nature-premium-scene', { detail: { state: activeState, scene } }));
  };

  const setup = async (event) => {
    root = document.getElementById('browser-experience');
    manifest = event.detail?.manifest;
    if (!root || !manifest) return;
    ensureLayer();
    try {
      config = await loadConfig();
      if (!config) return;
      root.dataset.premiumLayer = config.version || 'v17';
      root.dataset.premiumVersion = String((config.version || '17').match(/(\d+)/)?.[1] || '17');
      root.dataset.speciesId = manifest.entity?.slug || '';
      root.dataset.journeyId = config.journeyId || manifest.id || '';
      const initial = manifest.nodes?.[0]?.scene?.state || 'identity';
      renderScene(initial, { detail: { index: 0 } });
    } catch (error) {
      root.dataset.premiumLayer = 'failed-optional';
      console.warn('[4PLANET JOURNEY] Premium sensory layer failed closed', error);
    }
  };

  window.addEventListener('4planet:nature-browser-ready', setup);
  window.addEventListener('4planet:nature-journey-scene', (event) => {
    const state = event.detail?.state || manifest?.nodes?.[Number(event.detail?.index || 0)]?.scene?.state;
    renderScene(state, event);
  });
})();