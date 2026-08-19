(() => {
  const imageCache = new Map();
  let manifest = null;
  let root = null;
  let layers = [];
  let activeLayer = 0;
  let sceneToken = 0;

  const compact = () => window.matchMedia('(max-width: 760px)').matches;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const preload = (src) => {
    if (!src) return Promise.resolve(null);
    if (imageCache.has(src)) return imageCache.get(src);
    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(src);
      image.onerror = reject;
      image.src = src;
    });
    imageCache.set(src, promise);
    return promise;
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

  const updateCredit = (scene) => {
    const credit = root?.querySelector('.nature-scene-credit');
    const rights = scene?.media?.credit;
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
    const node = manifest.nodes?.[index];
    const scene = node?.scene || {};
    const media = scene.media || {};
    const src = compact() && media.backgroundMobileSrc ? media.backgroundMobileSrc : (media.backgroundSrc || manifest.environment?.src);
    if (!src) return;

    const token = ++sceneToken;
    try { await preload(src); } catch { return; }
    if (token !== sceneToken) return;

    const incomingIndex = 1 - activeLayer;
    const incoming = layers[incomingIndex];
    const outgoing = layers[activeLayer];
    setLayer(incoming, scene, src);
    incoming.classList.remove('is-leaving');
    incoming.classList.add('is-prepared');

    root.dataset.cinematicScene = scene.state || node.kind?.toLowerCase() || 'life';
    root.dataset.cinematicIndex = String(index);
    applyMarkerLayout(index);
    updateCredit(scene);
    if (userInitiated) runShutter(scene.travel || 'dolly');

    const commit = () => {
      if (token !== sceneToken) return;
      incoming.classList.add('is-active');
      incoming.classList.remove('is-prepared');
      outgoing.classList.remove('is-active');
      outgoing.classList.add('is-leaving');
      window.setTimeout(() => outgoing.classList.remove('is-leaving'), reducedMotion() ? 0 : 1400);
      activeLayer = incomingIndex;
      root.dataset.chapterMediaReady = 'true';
    };

    if (reducedMotion()) commit();
    else requestAnimationFrame(() => requestAnimationFrame(commit));

    const nextScene = manifest.nodes?.[index + 1]?.scene;
    const nextMedia = nextScene?.media;
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
