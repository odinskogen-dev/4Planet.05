(() => {
  const status = () => document.getElementById('xr-status');

  const updateXRStatus = async () => {
    const node = status();
    if (!node) return;
    try {
      if (!navigator.xr || !navigator.xr.isSessionSupported) {
        node.textContent = '3D BROWSER MODE · WEBXR NOT AVAILABLE';
        return;
      }
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      node.textContent = supported ? 'WEBXR HEADSET READY' : '3D BROWSER MODE · NO IMMERSIVE-VR DEVICE';
    } catch {
      node.textContent = '3D BROWSER MODE · XR STATUS UNAVAILABLE';
    }
  };

  const waitForSceneLoaded = (scene) => {
    if (scene.hasLoaded) return Promise.resolve();
    return new Promise((resolve) => scene.addEventListener('loaded', resolve, { once: true }));
  };

  const boot = async () => {
    await updateXRStatus();
    const scene = document.getElementById('nature-scene');
    if (!scene || !window.NatureRenderer || !window.NatureSceneAdapter) return;
    try {
      // A-Frame systems must finish scene initialisation before we append lights/materials.
      // Chromium tolerates earlier mutation; WebKit does not reliably do so.
      await waitForSceneLoaded(scene);
      const manifest = await window.NatureSceneAdapter.load({
        layoutUrl: '/xr/scenes/jaguar.json',
        canonicalUrl: '/xr/generated/jaguar-canonical.json'
      });
      await window.NatureRenderer.render({ scene, manifest });
    } catch (error) {
      const node = status();
      if (node) node.textContent = 'XR SCENE FAILED CLOSED';
      console.error('[4PLANET XR] Scene boot failed', error);
    }
  };

  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();
