(() => {
  const statusNode = () => document.querySelector('.nature-browser-status');

  const loadManifest = () => {
    if (!window.NatureSceneAdapter) throw new Error('NatureSceneAdapter unavailable');
    return window.NatureSceneAdapter.load({
      layoutUrl: '/xr/scenes/jaguar.json',
      canonicalUrl: '/xr/generated/jaguar-canonical.json'
    });
  };

  const boot = async () => {
    const root = document.getElementById('browser-experience');
    try {
      const manifest = await loadManifest();
      if (!root || !window.NatureBrowser) throw new Error('NatureBrowser unavailable');
      window.NatureBrowser.render({ root, manifest });
      document.body.dataset.browserReady = 'true';
      const status = statusNode();
      if (status) status.textContent = 'IMMERSIVE BROWSER JOURNEY · SOURCE-AWARE';
    } catch (error) {
      document.body.dataset.browserReady = 'failed';
      const status = statusNode();
      if (status) status.textContent = 'SOURCE-AWARE EXPERIENCE FAILED CLOSED';
      console.error('[4PLANET JOURNEY] Browser boot failed', error);
    }
  };

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
