(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const byId = (root, id) => root.querySelector(`#${id}`);
  const compact = () => window.matchMedia('(max-width: 760px)').matches;

  const detectTier = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const memory = Number(navigator.deviceMemory || 4);
    const cores = Number(navigator.hardwareConcurrency || 4);
    const saveData = Boolean(navigator.connection?.saveData);
    if (reduced || saveData || memory < 3 || cores < 4) return 'low';
    if (!compact() && memory >= 4 && cores >= 4) return 'high';
    return 'medium';
  };

  const preloadImage = (src) => {
    if (!src) return Promise.resolve(false);
    return new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  };

  const createParticles = (root, count) => {
    const field = root.querySelector('.nature-particles');
    if (!field) return;
    field.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      particle.className = 'nature-particle';
      particle.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--y', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--s', `${(0.5 + Math.random() * 1.25).toFixed(2)}`);
      particle.style.setProperty('--d', `${(9 + Math.random() * 12).toFixed(1)}s`);
      particle.style.setProperty('--delay', `${(-Math.random() * 12).toFixed(1)}s`);
      field.appendChild(particle);
    }
  };

  const legacyJourney = (manifest) => ({
    version: manifest.version,
    id: `${manifest.id}-legacy-journey`,
    chapters: (manifest.nodes || []).map((node, index) => ({
      id: node.id,
      order: index,
      stageLabel: node.label,
      title: node.title,
      cue: 'FOLLOW THE LIVING SYSTEM',
      sceneType: node.relationClass || node.kind || 'PLACE',
      media: { background: manifest.environment.src, backgroundMobile: manifest.environment.mobileSrc, midground: manifest.browser?.detailSrc },
      camera: { x: 50, y: 50, scale: 1.12 },
      subject: { visible: true, x: 50, y: 50, scale: 1 },
      nodes: [node.id],
      nodeLayout: [{ id: node.id, x: node.browserPosition?.x || 50, y: node.browserPosition?.y || 50, role: 'primary' }],
      audio: { profile: 'legacy', intensity: 0.7 },
      transition: { type: 'crossfade', durationMs: 900, holdMs: 500 },
      handoff: node.href || null,
    }))
  });

  const render = ({ root, manifest, journey: suppliedJourney }) => {
    if (!root) throw new Error('NatureBrowser root is required');
    const journey = suppliedJourney?.chapters?.length ? suppliedJourney : legacyJourney(manifest);
    const chapters = journey.chapters;
    const truthNodes = manifest.nodes || [];
    const truthById = new Map(truthNodes.map((node) => [node.id, node]));
    const tier = detectTier();
    const state = {
      entered: false,
      chapterIndex: 0,
      activeTruthNodeId: null,
      soundOn: false,
      lookX: 0,
      lookY: 0,
      lookFrame: 0,
      activePlane: 'a',
      modelLoaded: false,
    };

    root.dataset.sceneId = manifest.id;
    root.dataset.entityId = manifest.entity.id;
    root.dataset.manifestVersion = manifest.version;
    root.dataset.journeyVersion = journey.version || 'unknown';
    root.dataset.truthFeed = manifest.canonical ? 'canonical-adapter' : 'layout-manifest';
    root.dataset.performanceTier = tier;
    root.dataset.panelOpen = 'false';
    root.dataset.sceneState = 'entry';
    root.dataset.hold = 'false';

    const sceneA = root.querySelector('.nature-world__scene--a');
    const sceneB = root.querySelector('.nature-world__scene--b');
    const detail = root.querySelector('.nature-world__detail');
    const occluder = root.querySelector('.nature-world__occluder');
    const subjectWrap = root.querySelector('.nature-subject');
    const subject = root.querySelector('.nature-subject__image');
    const subjectName = root.querySelector('.nature-subject__name');
    const subjectBoundary = root.querySelector('.nature-subject__boundary');
    const modelLayer = root.querySelector('.nature-model');
    const modelAttribution = root.querySelector('.nature-model__attribution');
    const entryKicker = root.querySelector('.nature-entry__kicker');
    const entryTitle = root.querySelector('.nature-entry__title');
    const entryIntro = root.querySelector('.nature-entry__intro');
    const entryButton = root.querySelector('.nature-entry__button');
    const status = root.querySelector('.nature-browser-status');
    const progress = root.querySelector('.nature-progress');
    const nodeLayer = root.querySelector('.nature-nodes');
    const chapterPanel = root.querySelector('.nature-chapter');
    const soundButton = root.querySelector('.nature-sound');
    const instruction = root.querySelector('.nature-stage__instruction');
    const hud = root.querySelector('.nature-journey-hud');
    const mediaBoundary = root.querySelector('.nature-journey-media-boundary');

    const browser = manifest.browser || {};
    if (subject) {
      subject.src = browser.subjectMobileSrc && compact() ? browser.subjectMobileSrc : manifest.subject.mediaSrc;
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
    if (instruction) instruction.textContent = compact() ? 'TAP THE PATH · TRAVEL THROUGH THE SYSTEM' : 'MOVE / LOOK · FOLLOW THE PATH · E FOR EVIDENCE';

    const particleCount = tier === 'high' ? (journey.performance?.desktopParticles ?? 8) : tier === 'medium' ? 4 : (journey.performance?.mobileParticles ?? 0);
    createParticles(root, particleCount);

    const sceneSrc = (chapter) => compact() && chapter.media?.backgroundMobile ? chapter.media.backgroundMobile : chapter.media?.background;
    const preloadChapter = (index) => {
      const chapter = chapters[index];
      if (!chapter) return;
      void preloadImage(sceneSrc(chapter));
      if (tier === 'high') void preloadImage(chapter.media?.midground);
    };

    const setPlane = (plane, chapter) => {
      if (!plane || !chapter) return;
      const src = sceneSrc(chapter);
      plane.style.backgroundImage = src ? `url("${src}")` : 'none';
      plane.dataset.chapter = chapter.id;
      plane.style.setProperty('--plane-x', `${chapter.camera?.x ?? 50}%`);
      plane.style.setProperty('--plane-y', `${chapter.camera?.y ?? 50}%`);
      plane.style.setProperty('--plane-scale', String(chapter.camera?.scale ?? 1.08));
    };

    const initializeSceneDeck = () => {
      const first = chapters[0];
      setPlane(sceneA, first);
      sceneA?.classList.add('is-active');
      if (detail && first?.media?.midground && tier !== 'low') detail.style.backgroundImage = `url("${first.media.midground}")`;
      preloadChapter(1);
    };

    const updateModel = (chapter) => {
      if (!modelLayer) return;
      const wantsModel = Boolean(chapter.subject?.model && journey.model?.embedUrl);
      const allowModel = wantsModel && tier === 'high' && !navigator.connection?.saveData;
      modelLayer.dataset.visible = String(allowModel);
      if (!allowModel) {
        root.dataset.modelMode = wantsModel ? 'photo-fallback' : 'off';
        return;
      }
      root.dataset.modelMode = state.modelLoaded ? '3d-ready' : '3d-loading';
      if (modelLayer.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.className = 'nature-model__frame';
      iframe.title = 'Interactive 3D Jaguar model by Ear.Rodriguez on Sketchfab';
      iframe.loading = 'lazy';
      iframe.allow = 'autoplay; fullscreen; xr-spatial-tracking';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
      iframe.src = journey.model.embedUrl;
      iframe.addEventListener('load', () => {
        state.modelLoaded = true;
        root.dataset.modelMode = '3d-ready';
      }, { once: true });
      modelLayer.prepend(iframe);
      if (modelAttribution) {
        modelAttribution.textContent = `${journey.model.creator} · ${journey.model.provider} · ${journey.model.licence}`;
        modelAttribution.href = journey.model.sourceUrl;
      }
    };

    const renderProgress = () => {
      if (!progress) return;
      progress.innerHTML = '';
      chapters.forEach((chapter, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nature-progress__step';
        button.dataset.active = String(index === state.chapterIndex);
        button.setAttribute('aria-label', `${index}. ${chapter.stageLabel}`);
        button.innerHTML = `<span>${String(index).padStart(2, '0')}</span><b>${chapter.stageLabel}</b>`;
        button.addEventListener('click', () => goToChapter(index, true));
        progress.appendChild(button);
      });
    };

    const renderNodes = (chapter) => {
      if (!nodeLayer) return;
      nodeLayer.innerHTML = '';
      const layout = chapter.nodeLayout || [];
      layout.slice(0, 2).forEach((placement, localIndex) => {
        const node = truthById.get(placement.id);
        if (!node) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nature-node';
        button.dataset.nodeId = node.id;
        button.dataset.kind = node.kind || '';
        button.dataset.relationClass = node.relationClass || '';
        button.dataset.truthState = node.truthState || '';
        button.dataset.journeyRole = placement.role || (localIndex === 0 ? 'primary' : 'next');
        button.style.setProperty('--node-x', `${placement.x}%`);
        button.style.setProperty('--node-y', `${placement.y}%`);
        button.setAttribute('aria-label', `${node.title}: travel forward`);
        button.innerHTML = `<span class="nature-node__pulse"></span><span class="nature-node__index">${String(state.chapterIndex).padStart(2, '0')}</span><span class="nature-node__label">${node.label}</span>`;
        button.addEventListener('click', () => {
          state.activeTruthNodeId = node.id;
          if (state.chapterIndex < chapters.length - 1) goToChapter(state.chapterIndex + 1, true);
          else if (chapter.handoff || node.href) window.location.assign(chapter.handoff || node.href);
        });
        nodeLayer.appendChild(button);
      });
    };

    const updateProgress = () => root.querySelectorAll('.nature-progress__step').forEach((node, index) => { node.dataset.active = String(index === state.chapterIndex); });

    const closeEvidence = () => {
      chapterPanel?.classList.remove('is-open');
      root.dataset.panelOpen = 'false';
    };

    const activeTruth = () => truthById.get(state.activeTruthNodeId || chapters[state.chapterIndex]?.nodes?.[0]);

    const openEvidence = () => {
      const node = activeTruth();
      if (!node || !chapterPanel) return;
      state.activeTruthNodeId = node.id;
      root.dataset.chapter = node.kind || 'TRUTH';
      root.dataset.relationClass = node.relationClass || '';
      root.dataset.panelOpen = 'true';
      chapterPanel.classList.add('is-open');
      byId(chapterPanel, 'nature-chapter-index').textContent = `${String(state.chapterIndex).padStart(2, '0')} · EVIDENCE`;
      byId(chapterPanel, 'nature-chapter-kicker').textContent = node.relationClass ? `${node.relationClass} · ${node.truthState || 'SOURCE-AWARE'}` : `${node.kind || 'TRUTH'} · ${node.truthState || 'SOURCE-AWARE'}`;
      byId(chapterPanel, 'nature-chapter-title').textContent = node.title;
      byId(chapterPanel, 'nature-chapter-body').textContent = node.body;
      byId(chapterPanel, 'nature-chapter-boundary').textContent = `BOUNDARY · ${node.boundary}`;
      const source = byId(chapterPanel, 'nature-chapter-source');
      if (source) {
        source.textContent = `SOURCE · ${node.source?.label || '4PLANET SOURCE RECORD'}`;
        source.href = node.source?.url || '#';
      }
      const next = byId(chapterPanel, 'nature-chapter-next');
      if (next) next.textContent = state.chapterIndex >= chapters.length - 1 ? 'CONTINUE TO SOLUTIONS →' : `CLOSE + TRAVEL FORWARD · ${String(state.chapterIndex + 1).padStart(2, '0')} →`;
      if (compact()) chapterPanel.focus({ preventScroll: true });
    };

    const transitionScene = (chapter, index, userInitiated) => {
      const outgoing = state.activePlane === 'a' ? sceneA : sceneB;
      const incoming = state.activePlane === 'a' ? sceneB : sceneA;
      const duration = chapter.transition?.durationMs || 1200;
      const hold = chapter.transition?.holdMs || 800;

      root.dataset.hold = 'true';
      root.dataset.transitionType = chapter.transition?.type || 'crossfade';
      root.classList.add('is-travelling');
      if (occluder) occluder.dataset.transition = chapter.transition?.type || 'crossfade';
      setPlane(incoming, chapter);
      incoming?.classList.add('is-preparing');

      requestAnimationFrame(() => requestAnimationFrame(() => {
        incoming?.classList.add('is-active');
        incoming?.classList.remove('is-preparing');
        outgoing?.classList.remove('is-active');
      }));
      state.activePlane = state.activePlane === 'a' ? 'b' : 'a';

      if (detail) {
        detail.style.backgroundImage = chapter.media?.midground && tier !== 'low' ? `url("${chapter.media.midground}")` : 'none';
        detail.style.opacity = tier === 'low' ? '0' : chapter.sceneType === 'PRESSURE' ? '.12' : '.22';
      }
      if (mediaBoundary) mediaBoundary.textContent = chapter.media?.mediaBoundary || journey.truthBoundary || '';
      if (subjectWrap) subjectWrap.dataset.visible = String(chapter.subject?.visible !== false);
      updateModel(chapter);
      renderNodes(chapter);
      state.activeTruthNodeId = chapter.nodes?.[0] || null;
      window.NatureJourneyEngine?.applyChapter({ root, chapter, index, total: chapters.length, userInitiated });
      updateProgress();
      preloadChapter(index + 1);

      window.setTimeout(() => {
        root.classList.remove('is-travelling');
        root.dataset.hold = 'false';
      }, Math.max(duration, hold));
    };

    const goToChapter = (index, userInitiated = false) => {
      const nextIndex = clamp(index, 0, Math.max(0, chapters.length - 1));
      const chapter = chapters[nextIndex];
      if (!chapter) return;
      state.chapterIndex = nextIndex;
      closeEvidence();
      transitionScene(chapter, nextIndex, userInitiated);
    };

    const nextChapter = () => {
      const current = chapters[state.chapterIndex];
      if (state.chapterIndex >= chapters.length - 1) {
        const node = activeTruth();
        const href = current?.handoff || node?.href;
        if (href) window.location.assign(href);
        return;
      }
      goToChapter(state.chapterIndex + 1, true);
    };

    const previousChapter = () => goToChapter(Math.max(0, state.chapterIndex - 1), true);

    const applyLook = (x, y) => {
      state.lookX = clamp(x, -1, 1);
      state.lookY = clamp(y, -1, 1);
      root.style.setProperty('--look-x', state.lookX.toFixed(3));
      root.style.setProperty('--look-y', state.lookY.toFixed(3));
      state.lookFrame = 0;
    };

    const pointerLook = (event) => {
      if (!state.entered || tier === 'low') return;
      const rect = root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      if (state.lookFrame) return;
      state.lookFrame = requestAnimationFrame(() => applyLook(x, y));
    };

    const enter = () => {
      if (state.entered) return;
      state.entered = true;
      state.soundOn = true;
      root.classList.add('is-entered');
      root.dataset.entered = 'true';
      if (status) status.textContent = 'IMMERSIVE JOURNEY · SOURCE-AWARE';
      if (soundButton) {
        soundButton.hidden = false;
        soundButton.dataset.playing = 'true';
        soundButton.textContent = 'SOUND ON';
      }
      window.setTimeout(() => goToChapter(0, false), 300);
      window.dispatchEvent(new CustomEvent('4planet:nature-browser-enter', { detail: { manifest, journey, tier } }));
    };

    entryButton?.addEventListener('click', enter);
    soundButton?.addEventListener('click', () => {
      state.soundOn = !state.soundOn;
      soundButton.dataset.playing = String(state.soundOn);
      soundButton.textContent = state.soundOn ? 'SOUND ON' : 'SOUND OFF';
    });
    byId(root, 'nature-chapter-close')?.addEventListener('click', closeEvidence);
    byId(root, 'nature-chapter-next')?.addEventListener('click', () => { closeEvidence(); nextChapter(); });
    hud?.querySelector('.nature-journey-hud__next')?.addEventListener('click', nextChapter);
    hud?.querySelector('.nature-journey-hud__back')?.addEventListener('click', previousChapter);
    hud?.querySelector('.nature-journey-hud__evidence')?.addEventListener('click', openEvidence);
    root.addEventListener('pointermove', pointerLook, { passive: true });
    root.addEventListener('pointerleave', () => { if (tier !== 'low') applyLook(0, 0); });
    window.addEventListener('keydown', (event) => {
      if (!state.entered || root.dataset.panelOpen === 'true') return;
      if (event.key === 'ArrowRight') nextChapter();
      if (event.key === 'ArrowLeft') previousChapter();
      if (event.key.toLowerCase() === 'e') openEvidence();
    });

    initializeSceneDeck();
    renderProgress();
    renderNodes(chapters[0]);
    window.dispatchEvent(new CustomEvent('4planet:nature-browser-ready', { detail: { manifest, journey, tier } }));
    return { enter, goTo: goToChapter, openEvidence, nextNode: nextChapter, previousNode: previousChapter };
  };

  window.NatureBrowser = { render };
})();
