(() => {
  const V18 = {
    subject: '/assets/journey/jaguar/jaguar-encounter-subject-v18.webp',
    css: '/xr/jaguar/jaguar-founder-v18.css'
  };

  const browserRoot = () => document.getElementById('browser-experience');
  const statusNode = () => document.querySelector('.nature-browser-status');
  const isDesktop = () => window.matchMedia('(min-width: 761px)').matches;

  const ensureFounderCss = () => {
    if (document.querySelector('link[data-jaguar-v18]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = V18.css;
    link.dataset.jaguarV18 = 'true';
    document.head.appendChild(link);
  };

  const ensureFounderUi = (root) => {
    const topbar = root?.querySelector('.nature-topbar');
    if (topbar && !topbar.querySelector('.jaguar-v18-journey-label')) {
      const label = document.createElement('div');
      label.className = 'jaguar-v18-journey-label';
      label.innerHTML = 'JAGUAR JOURNEY <span>01 / 05</span>';
      topbar.appendChild(label);
    }

    if (root && !root.querySelector('.jaguar-v18-editorial')) {
      const editorial = document.createElement('section');
      editorial.className = 'jaguar-v18-editorial';
      editorial.setAttribute('aria-label', 'Jaguar encounter introduction');
      editorial.innerHTML = `
        <div class="jaguar-v18-editorial__kicker">YOU ARE IN · AMAZON RAINFOREST</div>
        <h1>MEET ONE<br>LIFE</h1>
        <p>Every life is a connection. Follow the jaguar to discover how forests, rivers and species depend on one another to thrive.</p>
        <span class="jaguar-v18-editorial__boundary">GENERATED ENCOUNTER VISUAL · SOURCE-AWARE JOURNEY · NOT LIVE TRACKING</span>`;
      root.appendChild(editorial);
    }
  };

  const applyEntryCopy = (root) => {
    const brand = root?.querySelector('.brand');
    if (brand) {
      brand.textContent = '4PLANET_';
      brand.setAttribute('aria-label', '4PLANET Species — Jaguar');
    }

    const kicker = root?.querySelector('.nature-entry__kicker');
    const title = root?.querySelector('.nature-entry__title');
    const intro = root?.querySelector('.nature-entry__intro');
    const cta = root?.querySelector('.nature-entry__button');
    const boundary = root?.querySelector('.nature-entry__boundary');
    if (kicker) kicker.textContent = 'YOU ARE IN · AMAZON RAINFOREST';
    if (title) title.textContent = 'MEET ONE LIFE';
    if (intro) intro.textContent = 'Every life is a connection. Follow the jaguar to discover how forests, rivers and species depend on one another to thrive.';
    if (cta) cta.textContent = 'BEGIN THE JOURNEY →';
    if (boundary) boundary.textContent = 'GENERATED ENCOUNTER VISUAL · SOURCE-AWARE JOURNEY · NOT LIVE TRACKING';
  };

  const applySubject = (root, state = 'identity') => {
    const subject = root?.querySelector('.nature-subject');
    const image = subject?.querySelector('.nature-subject__image');
    const boundary = subject?.querySelector('.nature-subject__boundary');
    if (!subject || !image) return;

    if (!image.dataset.v18OriginalSrc && image.getAttribute('src')) {
      image.dataset.v18OriginalSrc = image.getAttribute('src');
    }

    const useFounderStudy = state === 'identity' && isDesktop();
    if (useFounderStudy) {
      image.src = V18.subject;
      image.alt = 'Generated visual study of a jaguar moving through rainforest water';
      image.decoding = 'async';
      image.dataset.v18Subject = 'generated-visual-study';
      subject.dataset.v18Subject = 'generated-visual-study';
      if (boundary) boundary.textContent = 'GENERATED VISUAL STUDY · NOT AN OCCURRENCE RECORD';
    } else if (image.dataset.v18OriginalSrc) {
      image.src = image.dataset.v18OriginalSrc;
      image.alt = '';
      delete image.dataset.v18Subject;
      delete subject.dataset.v18Subject;
      if (boundary) boundary.textContent = 'SPECIES MEDIA · NOT AN OCCURRENCE RECORD';
    }
  };

  const syncScene = (root, state, index = 0) => {
    if (!root) return;
    const nextState = state || root.dataset.cinematicScene || root.dataset.sceneState || 'identity';
    const nextIndex = Number.isFinite(Number(index)) ? Number(index) : 0;
    root.dataset.v18Scene = nextState;
    const world = root.querySelector('.nature-world');
    if (world) world.dataset.visualDirection = 'founder-v18';
    const count = root.querySelector('.jaguar-v18-journey-label span');
    if (count) count.textContent = `${String(nextIndex + 1).padStart(2, '0')} / 05`;
    applySubject(root, nextState);
  };

  const applyFounderVisual = (root, state = 'identity', index = 0) => {
    if (!root) return;
    root.dataset.visualDirection = 'founder-v18';
    root.dataset.generatedVisual = 'encounter-subject-v18';
    ensureFounderUi(root);
    applyEntryCopy(root);
    syncScene(root, state, index);
  };

  const loadManifest = () => {
    if (!window.NatureSceneAdapter) throw new Error('NatureSceneAdapter unavailable');
    return window.NatureSceneAdapter.load({
      layoutUrl: '/xr/scenes/jaguar.json',
      canonicalUrl: '/xr/generated/jaguar-canonical.json'
    });
  };

  const boot = async () => {
    const root = browserRoot();
    try {
      const manifest = await loadManifest();
      if (!root || !window.NatureBrowser) throw new Error('NatureBrowser unavailable');
      window.NatureBrowser.render({ root, manifest });
      window.NatureJourneyContext?.render({ root, manifest });
      applyFounderVisual(root, manifest.nodes?.[0]?.scene?.state || 'identity', 0);
      requestAnimationFrame(() => applyFounderVisual(root, root.dataset.cinematicScene || 'identity', Number(root.dataset.journeyIndex || 0)));
      document.body.dataset.browserReady = 'true';
      const status = statusNode();
      if (status) status.textContent = 'IMMERSIVE JOURNEY · SOURCE-AWARE';
    } catch (error) {
      document.body.dataset.browserReady = 'failed';
      const status = statusNode();
      if (status) status.textContent = 'SOURCE-AWARE EXPERIENCE FAILED CLOSED';
      console.error('[4PLANET JOURNEY] Browser boot failed', error);
    }
  };

  ensureFounderCss();

  window.addEventListener('4planet:nature-browser-ready', (event) => {
    const root = browserRoot();
    const manifest = event.detail?.manifest;
    applyFounderVisual(root, manifest?.nodes?.[0]?.scene?.state || 'identity', 0);
  });

  window.addEventListener('4planet:nature-journey-scene', (event) => {
    const root = browserRoot();
    const state = event.detail?.state || root?.dataset?.cinematicScene || root?.dataset?.sceneState || 'identity';
    const index = Number(event.detail?.index ?? root?.dataset?.journeyIndex ?? root?.dataset?.cinematicIndex ?? 0);
    syncScene(root, state, index);
  });

  window.addEventListener('resize', () => {
    const root = browserRoot();
    if (!root) return;
    applySubject(root, root.dataset.v18Scene || root.dataset.cinematicScene || 'identity');
  }, { passive: true });

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
