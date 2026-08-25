(() => {
  'use strict';

  if (window.__4planetAtlasReturnCameraLockInstalled) return;
  window.__4planetAtlasReturnCameraLockInstalled = true;

  const params = new URLSearchParams(window.location.search);
  const centre = (params.get('c') || '').split(',').map(Number);
  const zoom = Number(params.get('z'));
  const hasExplicitCamera =
    window.location.pathname === '/atlas' &&
    Number.isFinite(zoom) && zoom > 0 &&
    centre.length === 2 && centre.every(Number.isFinite);

  let liveMap;
  let restored = false;

  const restoreOnce = (map) => {
    if (!hasExplicitCamera || restored || !map?.jumpTo) return;
    restored = true;
    map.jumpTo({ center: centre, zoom });
    document.documentElement.dataset.atlasReturnCamera = 'restored';
  };

  Object.defineProperty(window, '__4planet_map', {
    configurable: true,
    enumerable: false,
    get() { return liveMap; },
    set(map) {
      liveMap = map;
      if (!hasExplicitCamera || !map?.once) return;

      // MapLibre can adjust a globe camera while style/projection and the narrow
      // viewport settle. The URL camera is the return authority, so reassert it
      // exactly once at the first fully-idle frame. After that, user movement owns
      // the camera and this seam never writes again.
      map.once('idle', () => restoreOnce(map));
    },
  });

  window.__4planetAtlasReturnCameraLock = Object.freeze({
    version: 'v68',
    active: hasExplicitCamera,
    source: 'explicit-z-c-url',
    writes: 'one-idle-reconstruction-only',
  });
})();
