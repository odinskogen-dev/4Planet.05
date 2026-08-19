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

  const waitForSceneLoaded = (scene) => {
    if (!scene || scene.hasLoaded) return Promise.resolve();
    return new Promise((resolve) => scene.addEventListener('loaded', resolve, { once: true }));
  };

  const loadManifest = () => {
    if (!window.NatureSceneAdapter) throw new Error('NatureSceneAdapter unavailable');
    return window.NatureSceneAdapter.load({
      layoutUrl: '/xr/scenes/jaguar.json',
      canonicalUrl: '/xr/generated/jaguar-canonical.json'
    });
  };

  const boot = async () => {
    const xrSupportedPromise = updateXRStatus();
    const root = document.getElementById('browser-experience');

    try {
      const manifest = await loadManifest();

      if (!root || !window.NatureBrowser) throw new Error('NatureBrowser unavailable');
      window.NatureBrowser.render({ root, manifest });
      document.body.dataset.browserReady = 'true';

      const xrSupported = await xrSupportedPromise;
      const scene = document.getElementById('nature-scene');
      if (xrSupported && scene && window.NatureRenderer && window.AFRAME) {
        await waitForSceneLoaded(scene);
        await window.NatureRenderer.render({ scene, manifest });
        document.body.dataset.xrReady = 'true';
      } else {
        document.body.dataset.xrReady = 'optional';
      }
    } catch (error) {
      document.body.dataset.browserReady = 'failed';
      const node = statusNode();
      if (node) node.textContent = 'SOURCE-AWARE EXPERIENCE FAILED CLOSED';
      console.error('[4PLANET NATURE XR] Boot failed', error);
    }
  };

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
