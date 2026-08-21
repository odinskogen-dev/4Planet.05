(() => {
  const boot = () => {
    const root = document.getElementById('browser-experience');
    if (!root || root.dataset.jaguarLiveBridgeBooted === 'true') return;
    root.dataset.jaguarLiveBridgeBooted = 'true';

    const MODEL_UID = '91c61c329d2a4668816f81f08dfcd492';
    const MODEL_SOURCE = 'https://sketchfab.com/3d-models/jaguar-91c61c329d2a4668816f81f08dfcd492';
    const EMBED_URL = `https://sketchfab.com/models/${MODEL_UID}/embed?autostart=1&preload=1&animation_autoplay=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&dnt=1&transparent=1`;

    let shell = null;
    let iframe = null;
    let api = null;
    let apiReady = false;
    let active = false;
    let currentAnimation = null;
    let animationUid = null;
    let animationDuration = 14.667;
    let cameraHome = null;
    let hoverTimer = 0;
    let interactionCooldown = false;
    let enhancementStarted = false;

    const identityScene = () => root.dataset.cinematicScene === 'identity' || root.dataset.sceneState === 'identity';
    const desktopViewport = () => window.innerWidth > 760;
    const viewerAllowed = () => desktopViewport();

    function markViewerVisible(state = 'ear-direct-embed') {
      root.dataset.jaguar3d = state;
      root.dataset.jaguar3dSource = 'ear-rodriguez-jaguar';
      root.dataset.jaguar3dActive = String(active && identityScene() && viewerAllowed());
    }

    function ensureShell() {
      if (shell) return shell;
      shell = document.createElement('section');
      shell.className = 'nature-ear-live-v23';
      shell.dataset.ready = 'direct-embed';
      shell.dataset.active = 'false';
      shell.setAttribute('aria-label', 'Interactive Jaguar 3D study by Ear.Rodriguez');
      shell.innerHTML = `
        <div class="nature-ear-live-v23__ground" aria-hidden="true"></div>
        <div class="nature-ear-live-v23__frame">
          <iframe class="nature-ear-live-v23__viewer" title="Interactive 3D Jaguar by Ear.Rodriguez" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="eager"></iframe>
        </div>
        <div class="nature-ear-live-v23__veil" aria-hidden="true"></div>
        <div class="nature-ear-live-v23__status" aria-hidden="true">EAR.RODRIGUEZ · LIVE 3D</div>
        <div class="nature-ear-live-v23__controls">
          <button type="button" data-ear-action="observe">LOOK AT ME</button>
          <button type="button" data-ear-action="move">MOVE</button>
          <span>DRAG JAGUAR TO TURN</span>
        </div>
        <a class="nature-ear-live-v23__credit" href="${MODEL_SOURCE}" target="_blank" rel="noreferrer">3D JAGUAR · EAR.RODRIGUEZ · CC BY 4.0</a>`;
      root.appendChild(shell);
      iframe = shell.querySelector('iframe');
      iframe.src = EMBED_URL;

      shell.querySelector('[data-ear-action="observe"]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        observe();
      });
      shell.querySelector('[data-ear-action="move"]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        move();
      });
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
          if (window.Sketchfab) resolve();
          else {
            existing.addEventListener('load', resolve, { once: true });
            existing.addEventListener('error', reject, { once: true });
          }
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
        if (error || !Array.isArray(animations) || !animations.length) {
          root.dataset.jaguarAnimation = 'unavailable';
          return;
        }
        currentAnimation = animations[0];
        animationUid = currentAnimation?.[0] || currentAnimation?.uid || null;
        const duration = Number(currentAnimation?.[2] || currentAnimation?.duration);
        if (Number.isFinite(duration) && duration > 0) animationDuration = duration;
        root.dataset.jaguarAnimation = 'available';
        root.dataset.jaguarAnimationDuration = animationDuration.toFixed(3);
        if (animationUid && api.setCurrentAnimationByUID) api.setCurrentAnimationByUID(animationUid);
        api.setCycleMode?.('loopOne');
        api.setSpeed?.(0.58);
        api.play?.();
      });
    }

    function readCameraHome() {
      if (!api?.getCameraLookAt) return;
      api.getCameraLookAt((error, camera) => {
        if (!error && camera) cameraHome = camera;
      });
    }

    function integrateViewerBackground() {
      api?.setBackground?.({ color: [0.004, 0.016, 0.008] });
    }

    function bindViewerInteraction() {
      api?.addEventListener?.('click', () => {
        if (interactionCooldown) return;
        interactionCooldown = true;
        observe();
        window.setTimeout(() => { interactionCooldown = false; }, 1200);
      });
    }

    async function enhanceWithApi() {
      if (enhancementStarted || !iframe) return;
      enhancementStarted = true;
      try {
        await loadViewerApi();
        if (!window.Sketchfab) throw new Error('Sketchfab Viewer API unavailable');
        const client = new window.Sketchfab('1.12.1', iframe);
        client.init(MODEL_UID, {
          autostart: 1,
          preload: 1,
          transparent: 1,
          animation_autoplay: 1,
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
              apiReady = true;
              shell.dataset.ready = 'api';
              markViewerVisible('ear-live-bridge');
              integrateViewerBackground();
              readAnimations();
              readCameraHome();
              bindViewerInteraction();
              if (active && identityScene() && viewerAllowed()) show();
            });
          },
          error() {
            shell.dataset.ready = 'direct-embed';
            markViewerVisible('ear-direct-embed');
          }
        });
      } catch (error) {
        shell.dataset.ready = 'direct-embed';
        markViewerVisible('ear-direct-embed');
        console.warn('[4PLANET JAGUAR] Viewer API enhancement failed; direct Ear 3D embed remains active.', error);
      }
    }

    function init() {
      if (!viewerAllowed()) return;
      ensureShell();
      markViewerVisible(apiReady ? 'ear-live-bridge' : 'ear-direct-embed');
      enhanceWithApi();
    }

    function show() {
      if (!viewerAllowed() || !identityScene()) return;
      ensureShell();
      active = true;
      shell.dataset.active = 'true';
      shell.style.removeProperty('display');
      markViewerVisible(apiReady ? 'ear-live-bridge' : 'ear-direct-embed');
      if (apiReady) {
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
      root.dataset.jaguarAttention = 'visitor';
      if (!apiReady || !api) return;
      if (animationUid) {
        api.setCurrentAnimationByUID?.(animationUid);
        api.seekTo?.(Math.min(animationDuration * .54, 8.2));
        api.setCycleMode?.('one');
        api.setSpeed?.(.34);
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
        api?.setCycleMode?.('loopOne');
        api?.setSpeed?.(.5);
        api?.play?.();
        root.dataset.jaguarAttention = 'rest';
      }, 1900);
    }

    function move() {
      root.dataset.jaguarAttention = 'motion';
      if (!apiReady || !api || !animationUid) return;
      api.setCurrentAnimationByUID?.(animationUid);
      api.seekTo?.(0);
      api.setCycleMode?.('one');
      api.setSpeed?.(.82);
      api.play?.();
      window.setTimeout(() => {
        api?.setCycleMode?.('loopOne');
        api?.setSpeed?.(.52);
        api?.play?.();
        root.dataset.jaguarAttention = 'rest';
      }, Math.min(5200, animationDuration * 350));
    }

    function onEnter() {
      if (!viewerAllowed()) return;
      active = true;
      init();
      show();
    }

    function onScene(event) {
      const index = Number(event.detail?.index || 0);
      if (index === 0 && identityScene()) {
        if (root.dataset.entered === 'true') onEnter();
      } else hide();
    }

    function reconcileViewport() {
      if (!viewerAllowed()) hide();
      else if (root.dataset.entered === 'true' && identityScene()) onEnter();
    }

    window.addEventListener('4planet:nature-browser-enter', onEnter);
    window.addEventListener('4planet:nature-journey-scene', onScene);
    window.addEventListener('4planet:nature-runtime-budget', reconcileViewport);
    window.addEventListener('resize', reconcileViewport, { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? hide() : reconcileViewport());
    window.addEventListener('pagehide', hide, { once: true });

    // Keep the established public data-contract so existing Journey QA remains
    // stable while the implementation is hardened underneath it.
    root.dataset.jaguarLiveBridge = 'v23';
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();