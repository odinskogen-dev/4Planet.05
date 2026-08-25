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
  let authorityActive = hasExplicitCamera;
  let programmaticWrite = false;
  let writeCount = 0;
  let lastReason = 'not-restored';

  const cameraDrifted = (map) => {
    if (!map?.getCenter || !map?.getZoom) return false;
    const current = map.getCenter();
    const currentZoom = Number(map.getZoom());
    if (!current || !Number.isFinite(currentZoom)) return false;
    const zoomDrift = Math.abs(currentZoom - zoom);
    const lngDrift = Math.abs(Number(current.lng) - centre[0]);
    const latDrift = Math.abs(Number(current.lat) - centre[1]);
    return zoomDrift > 0.005 || lngDrift > 0.005 || latDrift > 0.005;
  };

  const restoreAuthority = (map, reason) => {
    if (!authorityActive || programmaticWrite || !map?.jumpTo) return;
    if (!cameraDrifted(map)) {
      document.documentElement.dataset.atlasReturnCamera = 'authoritative';
      return;
    }

    programmaticWrite = true;
    writeCount += 1;
    lastReason = reason;
    map.jumpTo({ center: centre, zoom });
    document.documentElement.dataset.atlasReturnCamera = 'restored';
    document.documentElement.dataset.atlasReturnCameraReason = reason;
    document.documentElement.dataset.atlasReturnCameraWrites = String(writeCount);
    queueMicrotask(() => { programmaticWrite = false; });
  };

  const releaseAuthority = (reason) => {
    if (!authorityActive || programmaticWrite) return;
    authorityActive = false;
    lastReason = reason;
    document.documentElement.dataset.atlasReturnCamera = 'released-to-user';
    document.documentElement.dataset.atlasReturnCameraReason = reason;
  };

  const bind = (map) => {
    if (!hasExplicitCamera || !map?.on) return;

    // Explicit z+c owns reconstruction through the full MapLibre startup seam.
    // Mobile globe/style initialisation and the context-panel resize can happen
    // after the first idle frame, so one first-idle write is insufficient. Keep
    // the authority event-driven until the visitor actually takes the camera.
    ['style.load', 'load', 'resize', 'idle'].forEach((eventName) => {
      map.on(eventName, () => restoreAuthority(map, eventName));
    });

    // Programmatic MapLibre camera writes have no originalEvent. A real pointer,
    // wheel or touch camera gesture does. From that first genuine camera move on,
    // the visitor owns the camera permanently and this seam never writes again.
    map.on('movestart', (event) => {
      if (event?.originalEvent) releaseAuthority('user-movestart');
    });
    ['dragstart', 'zoomstart', 'rotatestart', 'pitchstart'].forEach((eventName) => {
      map.on(eventName, (event) => {
        if (event?.originalEvent) releaseAuthority(`user-${eventName}`);
      });
    });

    // Constructor state already uses the URL camera. Verify immediately anyway
    // so a style that mutates the initial camera before event binding cannot win.
    restoreAuthority(map, 'map-bound');
  };

  Object.defineProperty(window, '__4planet_map', {
    configurable: true,
    enumerable: false,
    get() { return liveMap; },
    set(map) {
      liveMap = map;
      bind(map);
    },
  });

  window.__4planetAtlasReturnCameraLock = Object.freeze({
    version: 'v69',
    active: hasExplicitCamera,
    source: 'explicit-z-c-url',
    writes: 'event-driven-until-first-user-camera-gesture',
    release: () => releaseAuthority('explicit-release'),
    status: () => ({ authorityActive, writeCount, lastReason }),
  });
})();
