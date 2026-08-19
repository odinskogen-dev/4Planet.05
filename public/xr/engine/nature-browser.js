(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const byId = (root, id) => root.querySelector(`#${id}`);

  const createNoiseBuffer = (ctx, seconds = 3) => {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let last = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.018 * white) / 1.018;
        data[i] = last * 3.2;
      }
    }
    return buffer;
  };

  const createAmbience = () => {
    let ctx;
    let master;
    let running = false;

    const ensure = async () => {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        ctx = new AudioCtx({ latencyHint: 'playback' });
        master = ctx.createGain();
        master.gain.value = 0.075;
        master.connect(ctx.destination);

        const rain = ctx.createBufferSource();
        rain.buffer = createNoiseBuffer(ctx, 4);
        rain.loop = true;
        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.value = 2600;
        rainFilter.Q.value = 0.35;
        const rainGain = ctx.createGain();
        rainGain.gain.value = 0.16;
        rain.connect(rainFilter).connect(rainGain).connect(master);
        rain.start();

        const canopy = ctx.createBufferSource();
        canopy.buffer = createNoiseBuffer(ctx, 5);
        canopy.loop = true;
        const canopyFilter = ctx.createBiquadFilter();
        canopyFilter.type = 'lowpass';
        canopyFilter.frequency.value = 520;
        const canopyGain = ctx.createGain();
        canopyGain.gain.value = 0.09;
        canopy.connect(canopyFilter).connect(canopyGain).connect(master);
        canopy.start();

        const drift = ctx.createOscillator();
        drift.frequency.value = 0.055;
        const driftDepth = ctx.createGain();
        driftDepth.gain.value = 0.022;
        drift.connect(driftDepth).connect(master.gain);
        drift.start();
      }
      if (ctx.state === 'suspended' || ctx.state === 'interrupted') await ctx.resume();
      running = ctx.state === 'running';
      return running;
    };

    const toggle = async () => {
      if (!ctx || !running) return ensure();
      if (ctx.state === 'running') {
        await ctx.suspend();
        running = false;
      } else {
        await ctx.resume();
        running = true;
      }
      return running;
    };

    return { ensure, toggle, isRunning: () => Boolean(ctx && ctx.state === 'running') };
  };

  const createParticles = (root, count = 28) => {
    const field = root.querySelector('.nature-particles');
    if (!field || field.childElementCount) return;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      particle.className = 'nature-particle';
      particle.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--y', `${Math.round(Math.random() * 100)}%`);
      particle.style.setProperty('--s', `${(0.5 + Math.random() * 1.6).toFixed(2)}`);
      particle.style.setProperty('--d', `${(7 + Math.random() * 13).toFixed(1)}s`);
      particle.style.setProperty('--delay', `${(-Math.random() * 14).toFixed(1)}s`);
      field.appendChild(particle);
    }
  };

  const render = ({ root, manifest }) => {
    if (!root) throw new Error('NatureBrowser root is required');
    const ambience = createAmbience();
    const state = { entered: false, activeIndex: 0, lookX: 0, lookY: 0 };
    const browser = manifest.browser || {};
    const nodes = manifest.nodes || [];

    root.dataset.sceneId = manifest.id;
    root.dataset.entityId = manifest.entity.id;
    root.dataset.manifestVersion = manifest.version;
    root.dataset.truthFeed = manifest.canonical ? 'canonical-adapter' : 'layout-manifest';

    const world = root.querySelector('.nature-world');
    const background = root.querySelector('.nature-world__background');
    const detail = root.querySelector('.nature-world__detail');
    const subject = root.querySelector('.nature-subject__image');
    const subjectName = root.querySelector('.nature-subject__name');
    const subjectBoundary = root.querySelector('.nature-subject__boundary');
    const entryKicker = root.querySelector('.nature-entry__kicker');
    const entryTitle = root.querySelector('.nature-entry__title');
    const entryIntro = root.querySelector('.nature-entry__intro');
    const entryButton = root.querySelector('.nature-entry__button');
    const status = root.querySelector('.nature-browser-status');
    const progress = root.querySelector('.nature-progress');
    const nodeLayer = root.querySelector('.nature-nodes');
    const chapter = root.querySelector('.nature-chapter');
    const soundButton = root.querySelector('.nature-sound');

    if (background) background.style.backgroundImage = `url("${manifest.environment.src}")`;
    if (detail) detail.style.backgroundImage = `url("${browser.detailSrc || manifest.environment.src}")`;
    if (subject) {
      subject.src = browser.subjectMobileSrc && window.matchMedia('(max-width: 720px)').matches ? browser.subjectMobileSrc : manifest.subject.mediaSrc;
      subject.alt = `${manifest.entity.commonName} — species media, not a live animal`;
    }
    if (subjectName) subjectName.textContent = `${manifest.entity.commonName.toUpperCase()} · ${manifest.entity.scientificName}`;
    if (subjectBoundary) subjectBoundary.textContent = manifest.subject.boundaryLabel || 'SPECIES MEDIA · NOT AN OCCURRENCE RECORD';
    if (entryKicker) entryKicker.textContent = browser.entryKicker || `${manifest.environment.id.toUpperCase()} · ${manifest.entity.commonName.toUpperCase()}`;
    if (entryTitle) entryTitle.textContent = browser.entryTitle || manifest.title;
    if (entryIntro) entryIntro.textContent = browser.entryIntro || manifest.intro;
    if (entryButton) entryButton.textContent = browser.entryCta || 'ENTER THE LIVING SYSTEM';
    if (status) status.textContent = 'BROWSER IMMERSIVE · HEADSET OPTIONAL';

    createParticles(root, browser.particleCount || 28);

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
        button.addEventListener('click', () => openNode(index, true));
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
        button.addEventListener('click', () => openNode(index, true));
        nodeLayer.appendChild(button);
      });
    };

    const setActiveMarkers = () => {
      root.querySelectorAll('.nature-node').forEach((node, index) => node.dataset.active = String(index === state.activeIndex));
      root.querySelectorAll('.nature-progress__step').forEach((node, index) => node.dataset.active = String(index === state.activeIndex));
    };

    const openNode = (index, userInitiated = false) => {
      state.activeIndex = clamp(index, 0, Math.max(0, nodes.length - 1));
      const node = nodes[state.activeIndex];
      if (!node || !chapter) return;
      root.dataset.chapter = node.kind || 'TRUTH';
      root.dataset.relationClass = node.relationClass || '';
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
      setActiveMarkers();
      root.style.setProperty('--chapter-shift', `${state.activeIndex * -1.4}vw`);
      if (userInitiated && window.matchMedia('(max-width: 760px)').matches) chapter.focus({ preventScroll: true });
    };

    const closeChapter = () => chapter?.classList.remove('is-open');
    const nextNode = () => {
      const node = nodes[state.activeIndex];
      if (state.activeIndex >= nodes.length - 1) {
        if (node?.href) window.location.assign(node.href);
        return;
      }
      openNode(state.activeIndex + 1, true);
    };

    const setLook = (x, y) => {
      state.lookX = clamp(x, -1, 1);
      state.lookY = clamp(y, -1, 1);
      root.style.setProperty('--look-x', state.lookX.toFixed(3));
      root.style.setProperty('--look-y', state.lookY.toFixed(3));
    };

    const pointerLook = (event) => {
      if (!state.entered) return;
      const rect = root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      setLook(x, y);
    };

    const touchLook = (event) => {
      if (!state.entered || !event.touches?.[0]) return;
      pointerLook(event.touches[0]);
    };

    const enter = async () => {
      if (state.entered) return;
      state.entered = true;
      root.classList.add('is-entered');
      root.dataset.entered = 'true';
      if (status) status.textContent = 'IMMERSIVE BROWSER MODE · SOURCE-AWARE';
      const audioRunning = await ambience.ensure();
      if (soundButton) {
        soundButton.hidden = false;
        soundButton.dataset.playing = String(audioRunning);
        soundButton.textContent = audioRunning ? 'SOUND ON' : 'SOUND OFF';
      }
      window.setTimeout(() => openNode(0, false), 2100);
      window.dispatchEvent(new CustomEvent('4planet:nature-browser-enter', { detail: { manifest } }));
    };

    entryButton?.addEventListener('click', enter);
    soundButton?.addEventListener('click', async () => {
      const playing = await ambience.toggle();
      soundButton.dataset.playing = String(playing);
      soundButton.textContent = playing ? 'SOUND ON' : 'SOUND OFF';
    });
    byId(root, 'nature-chapter-close')?.addEventListener('click', closeChapter);
    byId(root, 'nature-chapter-next')?.addEventListener('click', nextNode);
    root.addEventListener('pointermove', pointerLook, { passive: true });
    root.addEventListener('touchmove', touchLook, { passive: true });
    root.addEventListener('pointerleave', () => setLook(0, 0));

    renderProgress();
    renderNodes();
    setActiveMarkers();

    window.dispatchEvent(new CustomEvent('4planet:nature-browser-ready', { detail: { manifest } }));
    return { enter, openNode, nextNode };
  };

  window.NatureBrowser = { render };
})();
