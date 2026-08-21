(() => {
  const root = document.getElementById('browser-experience');
  if (!root) return;

  const MODEL_UID = '91c61c329d2a4668816f81f08dfcd492';
  const MODEL_SOURCE = 'https://sketchfab.com/3d-models/jaguar-91c61c329d2a4668816f81f08dfcd492';
  let shell = null;
  let iframe = null;
  let api = null;
  let ready = false;
  let active = false;
  let currentAnimation = null;
  let animationUid = null;
  let animationDuration = 14.667;
  let cameraHome = null;
  let hoverTimer = 0;

  const identityScene = () => root.dataset.cinematicScene === 'identity' || root.dataset.sceneState === 'identity';
  const budgetAllows = () => root.dataset.runtimeBudget !== 'lite';

  function ensureShell() {
    if (shell) return shell;
    shell = document.createElement('section');
    shell.className = 'nature-ear-live-v23';
    shell.dataset.ready = 'false';
    shell.dataset.active = 'false';
    shell.setAttribute('aria-label', 'Interactive Jaguar 3D study by Ear.Rodriguez');
    shell.innerHTML = `
      <div class="nature-ear-live-v23__ground" aria-hidden="true"></div>
      <div class="nature-ear-live-v23__frame">
        <iframe class="nature-ear-live-v23__viewer" title="Interactive 3D Jaguar by Ear.Rodriguez" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe>
      </div>
      <div class="nature-ear-live-v23__veil" aria-hidden="true"></div>
      <div class="nature-ear-live-v23__controls">
        <button type="button" data-ear-action="observe">LOOK AT ME</button>
        <button type="button" data-ear-action="move">MOVE</button>
        <span>DRAG JAGUAR TO TURN</span>
      </div>
      <a class="nature-ear-live-v23__credit" href="${MODEL_SOURCE}" target="_blank" rel="noreferrer">3D JAGUAR · EAR.RODRIGUEZ · CC BY 4.0</a>`;
    root.appendChild(shell);
    iframe = shell.querySelector('iframe');
    shell.querySelector('[data-ear-action="observe"]')?.addEventListener('click', observe);
    shell.querySelector('[data-ear-action="move"]')?.addEventListener('click', move);
    shell.addEventListener('pointerenter', () => {
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => root.dataset.jaguarAttention = 'visitor', 220);
    });
    shell.addEventListener('pointerleave', () => {
      clearTimeout(hoverTimer);
      root.dataset.jaguarAttention = 'rest';
    });
    return shell;
  }

  function loadViewerApi() {
    if (window.Sketchfab) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-sketchfab-viewer-api]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      script.async = true;
      script.dataset.sketchfabViewerApi = 'true';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function readAnimations() {
    if (!api?.getAnimations) return;
    api.getAnimations((error, animations) => {
      if (error || !Array.isArray(animations) || !animations.length) return;
      currentAnimation = animations[0];
      animationUid = currentAnimation?.[0] || currentAnimation?.uid || null;
      const duration = Number(currentAnimation?.[2] || currentAnimation?.duration);
      if (Number.isFinite(duration) && duration > 0) animationDuration = duration;
      root.dataset.jaguarAnimation = 'available';
      root.dataset.jaguarAnimationDuration = animationDuration.toFixed(3);
      if (animationUid && api.setCurrentAnimationByUID) api.setCurrentAnimationByUID(animationUid);
      api.setCycleMode?.('loop');
      api.setSpeed?.(0.62);
      api.play?.();
    });
  }

  function readCameraHome() {
    if (!api?.getCameraLookAt) return;
    api.getCameraLookAt((error, camera) => {
      if (!error && camera) cameraHome = camera;
    });
  }

  async function init() {
    ensureShell();
    if (ready || iframe.dataset.loading === 'true') return;
    iframe.dataset.loading = 'true';
    try {
      await loadViewerApi();
      const client = new window.Sketchfab('1.12.1', iframe);
      client.init(MODEL_UID, {
        autostart: 1,
        preload: 1,
        transparent: 1,
        ui_controls: 0,
        ui_infos: 0,
        ui_stop: 0,
        ui_watermark: 0,
        ui_watermark_link: 0,
        ui_help: 0,
        ui_settings: 0,
        ui_vr: 0,
        ui_fullscreen: 0,
        ui_annotations: 0,
        success(nextApi) {
          api = nextApi;
          api.start?.();
          api.addEventListener?.('viewerready', () => {
            ready = true;
            shell.dataset.ready = 'true';
            iframe.dataset.loading = 'false';
            root.dataset.jaguar3d = 'ear-live-bridge';
            root.dataset.jaguar3dSource = 'ear-rodriguez-jaguar';
            root.dataset.jaguar3dActive = String(active && identityScene());
            readAnimations();
            readCameraHome();
            if (active && identityScene()) show();
          });
        },
        error() {
          iframe.dataset.loading = 'false';
          shell.dataset.ready = 'failed';
          root.dataset.jaguar3d = 'preferred-pending';
        }
      });
    } catch (error) {
      iframe.dataset.loading = 'false';
      shell.dataset.ready = 'failed';
      root.dataset.jaguar3d = 'preferred-pending';
      console.warn('[4PLANET JAGUAR] Sketchfab bridge failed closed.', error);
    }
  }

  function show() {
    if (!shell || !identityScene() || !budgetAllows()) return;
    active = true;
    shell.dataset.active = 'true';
    root.dataset.jaguar3dActive = String(ready);
    if (ready) {
      api?.start?.();
      api?.play?.();
    }
  }

  function hide() {
    active = false;
    if (shell) shell.dataset.active = 'false';
    root.dataset.jaguar3dActive = 'false';
    api?.pause?.();
  }

  function observe() {
    if (!ready || !api) return;
    root.dataset.jaguarAttention = 'visitor';
    if (animationUid) {
      api.setCurrentAnimationByUID?.(animationUid);
      api.seekTo?.(Math.min(animationDuration * .54, 8.2));
      api.setSpeed?.(.35);
      api.play?.();
    }
    if (cameraHome && api.setCameraLookAt) {
      const position = Array.isArray(cameraHome.position) ? [...cameraHome.position] : null;
      const target = Array.isArray(cameraHome.target) ? [...cameraHome.target] : null;
      if (position && target) {
        position[0] *= .9;
        position[1] += .03;
        position[2] *= .9;
        api.setCameraLookAt(position, target, 1.0);
      }
    }
    window.setTimeout(() => {
      api?.setSpeed?.(.58);
      root.dataset.jaguarAttention = 'rest';
    }, 1900);
  }

  function move() {
    if (!ready || !api || !animationUid) return;
    root.dataset.jaguarAttention = 'motion';
    api.setCurrentAnimationByUID?.(animationUid);
    api.seekTo?.(0);
    api.setCycleMode?.('one');
    api.setSpeed?.(.82);
    api.play?.();
    window.setTimeout(() => {
      api?.setCycleMode?.('loop');
      api?.setSpeed?.(.55);
      root.dataset.jaguarAttention = 'rest';
    }, Math.min(5200, animationDuration * 350));
  }

  function onEnter() {
    if (!budgetAllows()) return;
    active = true;
    init().then(show);
  }

  function onScene(event) {
    const index = Number(event.detail?.index || 0);
    if (index === 0 && identityScene()) {
      if (root.dataset.entered === 'true') onEnter();
    } else {
      hide();
    }
  }

  window.addEventListener('4planet:nature-browser-enter', onEnter);
  window.addEventListener('4planet:nature-journey-scene', onScene);
  window.addEventListener('4planet:nature-runtime-budget', () => {
    if (!budgetAllows()) hide();
    else if (root.dataset.entered === 'true' && identityScene()) onEnter();
  });
  document.addEventListener('visibilitychange', () => document.hidden ? hide() : (identityScene() && active && show()));
  window.addEventListener('pagehide', hide, { once: true });

  root.dataset.jaguarLiveBridge = 'v23';
})();