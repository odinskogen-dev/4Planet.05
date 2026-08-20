(() => {
  const imageCache = new Map();
  let manifest = null;
  let root = null;
  let layers = [];
  let activeLayer = 0;
  let sceneToken = 0;
  let pendingIndex = null;

  const compact = () => window.matchMedia('(max-width: 760px)').matches;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LOAD_TIMEOUT_MS = 4200;
  const TRANSITION_SETTLE_MS = 1450;
  const COMMIT_FALLBACK_MS = 160;

  const preload = (src) => {
    if (!src) return Promise.resolve(null);
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        image.onload = null;
        image.onerror = null;
        fn(value);
      };
      const timeout = window.setTimeout(() => finish(reject, new Error(`Journey media timeout: ${src}`)), LOAD_TIMEOUT_MS);
      image.onload = () => finish(resolve, src);
      image.onerror = () => finish(reject, new Error(`Journey media failed: ${src}`));
      image.src = src;
    });
    imageCache.set(src, promise);
    return promise;
  };

  const resolveSceneSrc = async (media) => {
    const requested = compact() && media.backgroundMobileSrc ? media.backgroundMobileSrc : media.backgroundSrc;
    const fallback = media.fallbackSrc || manifest?.environment?.src;
    if (requested) {
      try {
        await preload(requested);
        return { src: requested, fallback: false };
      } catch { /* controlled fallback below */ }
    }
    if (!fallback) return { src: null, fallback: true };
    await preload(fallback);
    return { src: fallback, fallback: true };
  };

  const ensureDOM = () => {
    if (!root) return;
    const world = root.querySelector('.nature-world');
    if (!world) return;

    let cinematic = world.querySelector('.nature-cinematic');
    if (!cinematic) {
      cinematic = document.createElement('div');
      cinematic.className = 'nature-cinematic';
      cinematic.setAttribute('aria-hidden', 'true');
      cinematic.innerHTML = '<div class="nature-cinematic__scene nature-cinematic__scene--a"></div><div class="nature-cinematic__scene nature-cinematic__scene--b"></div>';
      const state = world.querySelector('.nature-world__state');
      world.insertBefore(cinematic, state || null);
    }
    layers = Array.from(cinematic.querySelectorAll('.nature-cinematic__scene'));

    if (!root.querySelector('.nature-travel-shutter')) {
      const shutter = document.createElement('div');
      shutter.className = 'nature-travel-shutter';
      shutter.setAttribute('aria-hidden', 'true');
      shutter.innerHTML = '<i></i><i></i><i></i>';
      root.appendChild(shutter);
    }

    if (!root.querySelector('.nature-scene-credit')) {
      const credit = document.createElement('a');
      credit.className = 'nature-scene-credit';
      credit.target = '_blank';
      credit.rel = 'noreferrer';
      credit.hidden = true;
      root.appendChild(credit);
    }
  };

  const applyMarkerLayout = (index) => {
    if (!root || !manifest) return;
    const current = manifest.nodes?.[index];
    const next = manifest.nodes?.[index + 1];
    const currentMarker = current?.scene?.markerPosition || current?.browserPosition;
    const nextMarker = current?.scene?.nextMarkerPosition || next?.scene?.markerPosition || next?.browserPosition;

    root.querySelectorAll('.nature-node').forEach((button, buttonIndex) => {
      let position = null;
      if (buttonIndex === index) position = currentMarker;
      if (buttonIndex === index + 1) position = nextMarker;
      if (position) {
        button.style.setProperty('--node-x', `${position.x}%`);
        button.style.setProperty('--node-y', `${position.y}%`);
      }
      button.dataset.cinematicVisible = String(buttonIndex === index || buttonIndex === index + 1);
    });
  };

  const updateCredit = (scene, fallbackUsed) => {
    const credit = root?.querySelector('.nature-scene-credit');
    const rights = fallbackUsed ? scene?.media?.fallbackCredit : scene?.media?.credit;
    if (!credit) return;
    if (!rights?.label) {
      credit.hidden = true;
      return;
    }
    credit.hidden = false;
    credit.textContent = `${rights.label}${rights.license ? ` · ${rights.license}` : ''}`;
    credit.href = rights.url || '#';
  };

  const setLayer = (layer, scene, src) => {
    const media = scene?.media || {};
    layer.style.backgroundImage = `url("${src}")`;
    layer.style.backgroundPosition = media.backgroundPosition || 'center';
    layer.style.setProperty('--cinematic-enter-scale', String(media.enterScale || 1.09));
    layer.style.setProperty('--cinematic-active-scale', String(media.activeScale || 1.03));
    layer.style.setProperty('--cinematic-origin-x', `${media.originX ?? 50}%`);
    layer.style.setProperty('--cinematic-origin-y', `${media.originY ?? 50}%`);
  };

  const runShutter = (travel = 'dolly') => {
    if (!root || reducedMotion()) return;
    root.dataset.travel = travel;
    root.classList.remove('is-cinematic-travelling');
    void root.offsetWidth;
    root.classList.add('is-cinematic-travelling');
    window.setTimeout(() => root?.classList.remove('is-cinematic-travelling'), 1050);
  };

  const show = async (index, userInitiated = false) => {
    if (!root || !manifest || !layers.length) return;

    // The scene event can be emitted more than once while a browser is still
    // composing the same chapter (for example around viewport/3D readiness).
    // Re-entering the same pending scene must not invalidate its own settle
    // timer. Different-scene requests still supersede immediately via token.
    if (pendingIndex === index) return;
    if (root.dataset.cinematicSettled === 'true' && root.dataset.cinematicSettledIndex === String(index)) return;

    const node = manifest.nodes?.[index];
    const scene = node?.scene || {};
    const media = scene.media || {};
    const token = ++sceneToken;
    pendingIndex = index;
    root.dataset.cinematicSettled = 'false';

    let resolved;
    try {
      resolved = await resolveSceneSrc(media);
    } catch {
      if (token === sceneToken) pendingIndex = null;
      return;
    }
    if (token !== sceneToken || !resolved?.src) return;

    const incomingIndex = 1 - activeLayer;
    const incoming = layers[incomingIndex];
    const outgoing = layers[activeLayer];
    setLayer(incoming, scene, resolved.src);
    incoming.classList.remove('is-leaving');
    incoming.classList.add('is-prepared');

    root.dataset.cinematicScene = scene.state || node.kind?.toLowerCase() || 'life';
    root.dataset.cinematicIndex = String(index);
    root.dataset.sceneMediaFallback = String(resolved.fallback);
    applyMarkerLayout(index);
    updateCredit(scene, resolved.fallback);
    if (userInitiated) runShutter(scene.travel || 'dolly');

    let committed = false;
    const commit = () => {
      if (committed || token !== sceneToken) return;
      committed = true;
      incoming.classList.add('is-active');
      incoming.classList.remove('is-prepared');
      outgoing.classList.remove('is-active');
      outgoing.classList.add('is-leaving');
      const settleDelay = reducedMotion() ? 0 : TRANSITION_SETTLE_MS;
      window.setTimeout(() => {
        if (token !== sceneToken) return;
        outgoing.classList.remove('is-leaving');
        root.dataset.cinematicSettled = 'true';
        root.dataset.cinematicSettledIndex = String(index);
        pendingIndex = null;
      }, settleDelay);
      activeLayer = incomingIndex;
      root.dataset.chapterMediaReady = 'true';
    };

    if (reducedMotion()) {
      commit();
    } else {
      // Double-rAF preserves the authored prepared→active visual transition,
      // but rAF is not allowed to be a liveness dependency. Headless/full-tier
      // Chromium can delay frame callbacks under compositing/network pressure.
      // The bounded timer commits the exact same state once if frames stall.
      const commitFallback = window.setTimeout(commit, COMMIT_FALLBACK_MS);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.clearTimeout(commitFallback);
        commit();
      }));
    }

    const nextMedia = manifest.nodes?.[index + 1]?.scene?.media;
    const nextSrc = compact() && nextMedia?.backgroundMobileSrc ? nextMedia.backgroundMobileSrc : nextMedia?.backgroundSrc;
    if (nextSrc) window.setTimeout(() => preload(nextSrc).catch(() => {}), 450);
  };

  const setup = (event) => {
    manifest = event.detail?.manifest;
    root = document.getElementById('browser-experience');
    if (!manifest || !root) return;
    ensureDOM();
    root.dataset.cinematicEngine = 'v1.1';
    const first = manifest.nodes?.[0]?.scene?.media?.backgroundSrc;
    if (first) preload(first).catch(() => {});
  };

  window.addEventListener('4planet:nature-browser-ready', setup);
  window.addEventListener('4planet:nature-journey-scene', (event) => show(event.detail?.index || 0, true));
  window.NatureCinematicJourneyV11 = { preload, show };
})();