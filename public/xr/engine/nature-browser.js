(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const byId = (root, id) => root.querySelector(`#${id}`);

  const createParticles = (root, count = 12) => {
    const field = root.querySelector('.nature-particles');
    if (!field || field.childElementCount || count <= 0) return;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      particle.className = 'nature-particle';
      particle.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--y', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--s', `${(0.5 + Math.random() * 1.4).toFixed(2)}`);
      particle.style.setProperty('--d', `${(9 + Math.random() * 12).toFixed(1)}s`);
      particle.style.setProperty('--delay', `${(-Math.random() * 14).toFixed(1)}s`);
      field.appendChild(particle);
    }
  };

  const hydrateHabitat = ({ root, background, detail, manifest, browser }) => {
    const lowSrc = manifest.environment.mobileSrc || manifest.environment.src;
    if (background) background.style.backgroundImage = `url("${lowSrc}")`;
    if (detail) detail.style.backgroundImage = `url("${browser.detailSrc || lowSrc}")`;
    root.dataset.habitatReady = 'preview';

    const highSrc = manifest.environment.src;
    if (!background || !highSrc || highSrc === lowSrc || window.matchMedia('(max-width: 720px)').matches) return;
    const high = new Image();
    high.decoding = 'async';
    high.onload = () => {
      background.style.backgroundImage = `url("${highSrc}")`;
      root.dataset.habitatReady = 'high';
    };
    high.onerror = () => { root.dataset.habitatReady = 'preview'; };
    high.src = highSrc;
  };

  const render = ({ root, manifest }) => {
    if (!root) throw new Error('NatureBrowser root is required');
    const state = { entered: false, activeIndex: 0, lookX: 0, lookY: 0, soundOn: false, lookFrame: 0, pendingLook: null };
    const browser = manifest.browser || {};
    const nodes = manifest.nodes || [];
    const isCompact = () => window.matchMedia('(max-width: 760px)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    const performanceTier = isCompact() || lowMemory || reducedMotion ? 'lite' : 'full';

    root.dataset.sceneId = manifest.id;
    root.dataset.entityId = manifest.entity.id;
    root.dataset.manifestVersion = manifest.version;
    root.dataset.truthFeed = manifest.canonical ? 'canonical-adapter' : 'layout-manifest';
    root.dataset.panelOpen = 'false';
    root.dataset.sceneState = 'entry';
    root.dataset.performanceTier = performanceTier;

    const background = root.querySelector('.nature-world__background');
    const detail = root.querySelector('.nature-world__detail');
    const subject = root.querySelector('.nature-subject__image');
    const subjectName = root.querySelector('.nature-subject__name');
    const subjectBoundary = root.querySelector('.nature-subject__boundary');
    const entry = root.querySelector('.nature-entry');
    const entryKicker = root.querySelector('.nature-entry__kicker');
    const entryTitle = root.querySelector('.nature-entry__title');
    const entryIntro = root.querySelector('.nature-entry__intro');
    const entryButton = root.querySelector('.nature-entry__button');
    const status = root.querySelector('.nature-browser-status');
    const progress = root.querySelector('.nature-progress');
    const nodeLayer = root.querySelector('.nature-nodes');
    const chapter = root.querySelector('.nature-chapter');
    const soundButton = root.querySelector('.nature-sound');
    const instruction = root.querySelector('.nature-stage__instruction');
    const hud = root.querySelector('.nature-journey-hud');

    hydrateHabitat({ root, background, detail, manifest, browser });
    if (subject) {
      subject.src = browser.subjectMobileSrc && window.matchMedia('(max-width: 720px)').matches ? browser.subjectMobileSrc : manifest.subject.mediaSrc;
      subject.alt = `${manifest.entity.commonName} — species media, not a live animal`;
      subject.addEventListener('load', () => { root.dataset.subjectReady = 'true'; }, { once: true });
    }
    if (subjectName) subjectName.textContent = `${manifest.entity.commonName.toUpperCase()} · ${manifest.entity.scientificName}`;
    if (subjectBoundary) subjectBoundary.textContent = manifest.subject.boundaryLabel || 'SPECIES MEDIA · NOT AN OCCURRENCE RECORD';
    if (entryKicker) entryKicker.textContent = browser.entryKicker || `${manifest.environment.id.toUpperCase()} · ${manifest.entity.commonName.toUpperCase()}`;
    if (entryTitle) entryTitle.textContent = browser.entryTitle || manifest.title;
    if (entryIntro) entryIntro.textContent = browser.entryIntro || manifest.intro;
    if (entryButton) entryButton.textContent = browser.entryCta || 'ENTER THE LIVING SYSTEM';
    if (status) status.textContent = 'BROWSER IMMERSIVE · HEADSET OPTIONAL';
    if (instruction) instruction.textContent = isCompact() ? 'TAP THE NEXT SIGNAL · FOLLOW THE JOURNEY' : 'FOLLOW THE JOURNEY · SELECT THE NEXT SIGNAL';

    const particleBudget = performanceTier === 'lite' ? 0 : Math.min(browser.particleCount || 12, 18);
    createParticles(root, particleBudget);

    const setActiveMarkers = () => {
      root.querySelectorAll('.nature-node').forEach((node, index) => node.dataset.active = String(index === state.activeIndex));
      root.querySelectorAll('.nature-progress__step').forEach((node, index) => node.dataset.active = String(index === state.activeIndex));
    };

    const renderProgress = () => {
      if (!progress) return;
      progress.innerHTML = '';
      nodes.forEach((node, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nature-progress__step';
        button.dataset.active = String(index === state.activeIndex);
        button.setAttribute('aria-label', `${index + 1}. ${node.label}`);
        button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><b>${node.label}</b>`;
        button.addEventListener('click', () => goTo(index, true));
        progress.appendChild(button);
      });
    };

    const renderNodes = () => {
      if (!nodeLayer) return;
      nodeLayer.innerHTML = '';
      nodes.forEach((node, index) => {
        const pos = node.browserPosition || { x: 50, y: 50 };
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nature-node';
        button.dataset.nodeId = node.id;
        button.dataset.kind = node.kind || '';
        button.dataset.relationClass = node.relationClass || '';
        button.dataset.truthState = node.truthState || '';
        button.style.setProperty('--node-x', `${pos.x}%`);
        button.style.setProperty('--node-y', `${pos.y}%`);
        button.setAttribute('aria-label', `${node.title}: ${node.label}`);
        button.innerHTML = `<span class="nature-node__pulse"></span><span class="nature-node__index">${String(index + 1).padStart(2, '0')}</span><span class="nature-node__label">${node.label}</span>`;
        button.addEventListener('click', () => goTo(index, true));
        nodeLayer.appendChild(button);
      });
    };

    const openEvidence = () => {
      const node = nodes[state.activeIndex];
      if (!node || !chapter) return;
      root.dataset.chapter = node.kind || 'TRUTH';
      root.dataset.relationClass = node.relationClass || '';
      root.dataset.panelOpen = 'true';
      chapter.classList.add('is-open');
      byId(chapter, 'nature-chapter-index').textContent = `${String(state.activeIndex + 1).padStart(2, '0')} / ${String(nodes.length).padStart(2, '0')}`;
      byId(chapter, 'nature-chapter-kicker').textContent = node.relationClass ? `${node.relationClass} · ${node.truthState || 'SOURCE-AWARE'}` : `${node.kind || 'TRUTH'} · ${node.truthState || 'SOURCE-AWARE'}`;
      byId(chapter, 'nature-chapter-title').textContent = node.title;
      byId(chapter, 'nature-chapter-body').textContent = node.body;
      byId(chapter, 'nature-chapter-boundary').textContent = `BOUNDARY · ${node.boundary}`;
      const source = byId(chapter, 'nature-chapter-source');
      if (source) {
        source.textContent = `SOURCE · ${node.source?.label || '4PLANET SOURCE RECORD'}`;
        source.href = node.source?.url || '#';
      }
      const next = byId(chapter, 'nature-chapter-next');
      if (next) next.textContent = state.activeIndex === nodes.length - 1 ? 'CONTINUE TO SOLUTIONS →' : `FOLLOW THE SYSTEM · ${String(state.activeIndex + 2).padStart(2, '0')} →`;
      if (isCompact()) chapter.focus({ preventScroll: true });
    };

    const closeChapter = () => {
      chapter?.classList.remove('is-open');
      root.dataset.panelOpen = 'false';
    };

    const applyScene = (userInitiated = false) => {
      const node = nodes[state.activeIndex];
      if (!node) return;
      root.dataset.relationClass = node.relationClass || '';
      window.NatureJourneyEngine?.applyScene({ root, node, index: state.activeIndex, total: nodes.length, userInitiated });
      setActiveMarkers();
    };

    const goTo = (index, userInitiated = false) => {
      state.activeIndex = clamp(index, 0, Math.max(0, nodes.length - 1));
      closeChapter();
      applyScene(userInitiated);
    };

    const nextNode = () => {
      const node = nodes[state.activeIndex];
      if (state.activeIndex >= nodes.length - 1) {
        if (node?.href) window.location.assign(node.href);
        return;
      }
      goTo(state.activeIndex + 1, true);
    };

    const previousNode = () => goTo(Math.max(0, state.activeIndex - 1), true);

    const commitLook = () => {
      state.lookFrame = 0;
      if (!state.pendingLook) return;
      const { x, y } = state.pendingLook;
      state.pendingLook = null;
      state.lookX = clamp(x, -1, 1);
      state.lookY = clamp(y, -1, 1);
      root.style.setProperty('--look-x', state.lookX.toFixed(3));
      root.style.setProperty('--look-y', state.lookY.toFixed(3));
    };

    const setLook = (x, y) => {
      if (performanceTier === 'lite') return;
      state.pendingLook = { x, y };
      if (!state.lookFrame) state.lookFrame = requestAnimationFrame(commitLook);
    };

    const pointerLook = (event) => {
      if (!state.entered || performanceTier === 'lite') return;
      const rect = root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setLook(x, y);
    };

    const touchLook = (event) => {
      if (!state.entered || !event.touches?.[0] || performanceTier === 'lite') return;
      pointerLook(event.touches[0]);
    };

    const enter = async () => {
      if (state.entered) return;
      state.entered = true;
      state.soundOn = true;
      root.classList.add('is-entered');
      root.dataset.entered = 'true';
      // Entered and the first Journey scene are runtime state contracts, not
      // cosmetic timer states. Commit scene 01 synchronously; the cinematic
      // engine owns the visual travel/settle animation after that state exists.
      if (entry) {
        entry.setAttribute('aria-hidden', 'true');
        entry.style.setProperty('visibility', 'hidden', 'important');
        entry.style.setProperty('opacity', '0', 'important');
        entry.style.setProperty('pointer-events', 'none', 'important');
      }
      if (status) status.textContent = 'IMMERSIVE JOURNEY · SOURCE-AWARE';
      if (soundButton) {
        soundButton.hidden = false;
        soundButton.dataset.playing = 'true';
        soundButton.textContent = 'SOUND ON';
      }
      goTo(0, false);
      window.dispatchEvent(new CustomEvent('4planet:nature-browser-enter', { detail: { manifest } }));
    };

    entryButton?.addEventListener('click', enter);
    soundButton?.addEventListener('click', () => {
      state.soundOn = !state.soundOn;
      soundButton.dataset.playing = String(state.soundOn);
      soundButton.textContent = state.soundOn ? 'SOUND ON' : 'SOUND OFF';
    });
    byId(root, 'nature-chapter-close')?.addEventListener('click', closeChapter);
    byId(root, 'nature-chapter-next')?.addEventListener('click', nextNode);
    hud?.querySelector('.nature-journey-hud__next')?.addEventListener('click', nextNode);
    hud?.querySelector('.nature-journey-hud__back')?.addEventListener('click', previousNode);
    hud?.querySelector('.nature-journey-hud__evidence')?.addEventListener('click', openEvidence);
    if (performanceTier === 'full') {
      root.addEventListener('pointermove', pointerLook, { passive: true });
      root.addEventListener('touchmove', touchLook, { passive: true });
      root.addEventListener('pointerleave', () => setLook(0, 0));
    }
    window.addEventListener('keydown', (event) => {
      if (!state.entered || root.dataset.panelOpen === 'true') return;
      if (event.key === 'ArrowRight') nextNode();
      if (event.key === 'ArrowLeft') previousNode();
      if (event.key.toLowerCase() === 'e') openEvidence();
    });

    renderProgress();
    renderNodes();
    setActiveMarkers();

    window.dispatchEvent(new CustomEvent('4planet:nature-browser-ready', { detail: { manifest } }));
    return { enter, goTo, openEvidence, nextNode, previousNode };
  };

  window.NatureBrowser = { render };
})();