(() => {
  const statusNode = () => document.querySelector('.nature-browser-status');

  const updateXRStatus = async () => {
    const node = statusNode();
    let supported = false;
    try {
      if (navigator.xr?.isSessionSupported) supported = await navigator.xr.isSessionSupported('immersive-vr');
    } catch {
      supported = false;
    }
    document.documentElement.dataset.webxr = supported ? 'supported' : 'optional';
    if (node) node.textContent = supported ? 'BROWSER IMMERSIVE · XR HEADSET READY' : 'BROWSER IMMERSIVE · HEADSET OPTIONAL';
    return supported;
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-lazy-src="${src}"]`);
    if (existing?.dataset.loaded === 'true') return resolve();
    const script = existing || document.createElement('script');
    script.src = src;
    script.dataset.lazySrc = src;
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, { once: true });
    script.addEventListener('error', () => reject(new Error(`Script failed: ${src}`)), { once: true });
    if (!existing) document.head.appendChild(script);
  });

  const waitForSceneLoaded = (scene) => {
    if (!scene || scene.hasLoaded) return Promise.resolve();
    return new Promise((resolve) => scene.addEventListener('loaded', resolve, { once: true }));
  };

  const loadTruthManifest = () => {
    if (!window.NatureSceneAdapter) throw new Error('NatureSceneAdapter unavailable');
    return window.NatureSceneAdapter.load({
      layoutUrl: '/xr/scenes/jaguar.json',
      canonicalUrl: '/xr/generated/jaguar-canonical.json'
    });
  };

  const loadJourney = async () => {
    const response = await fetch('/xr/scenes/jaguar-journey-v11.json', { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Jaguar journey failed: ${response.status}`);
    return response.json();
  };

  const bootOptionalXR = async (manifest) => {
    try {
      await loadScript('https://aframe.io/releases/1.8.0/aframe.min.js');
      await loadScript('/xr/engine/nature-renderer.js');
      const scene = document.getElementById('nature-scene');
      if (!scene || !window.NatureRenderer || !window.AFRAME) throw new Error('XR renderer unavailable after lazy load');
      await waitForSceneLoaded(scene);
      await window.NatureRenderer.render({ scene, manifest });
      document.body.dataset.xrReady = 'true';
    } catch (error) {
      document.body.dataset.xrReady = 'failed-optional';
      console.warn('[4PLANET NATURE XR] Optional headset renderer unavailable; browser journey remains active', error);
    }
  };

  const boot = async () => {
    const xrSupportedPromise = updateXRStatus();
    const root = document.getElementById('browser-experience');

    try {
      const [manifest, journey] = await Promise.all([loadTruthManifest(), loadJourney()]);
      if (!root || !window.NatureBrowser) throw new Error('NatureBrowser unavailable');
      window.NatureBrowser.render({ root, manifest, journey });
      document.body.dataset.browserReady = 'true';
      document.body.dataset.journeyVersion = journey.version;

      const xrSupported = await xrSupportedPromise;
      if (xrSupported) void bootOptionalXR(manifest);
      else document.body.dataset.xrReady = 'optional';
    } catch (error) {
      document.body.dataset.browserReady = 'failed';
      const node = statusNode();
      if (node) node.textContent = 'SOURCE-AWARE EXPERIENCE FAILED CLOSED';
      console.error('[4PLANET NATURE XR] Browser boot failed', error);
    }
  };

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
