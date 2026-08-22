(() => {
  const boot = () => {
    const root = document.getElementById('browser-experience');
    if (!root || root.dataset.jaguarLiveBridgeBooted === 'true') return;
    root.dataset.jaguarLiveBridgeBooted = 'true';

    const MODEL_UID = '91c61c329d2a4668816f81f08dfcd492';
    const MODEL_SOURCE = 'https://sketchfab.com/3d-models/jaguar-91c61c329d2a4668816f81f08dfcd492';
    const EMBED_URL = `https://sketchfab.com/models/${MODEL_UID}/embed?autostart=1&preload=1&animation_autoplay=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&dnt=1&transparent=1`;
    const READY_TIMEOUT_MS = 12000;

    let shell = null;
    let iframe = null;
    let api = null;
    let apiReady = false;
    let modelReady = false;
    let failed = false;
    let active = false;
    let currentAnimation = null;
    let animationUid = null;
    let animationDuration = 14.667;
    let cameraHome = null;
    let hoverTimer = 0;
    let readyTimer = 0;
    let interactionCooldown = false;
    let enhancementStarted = false;

    const identityScene = () => root.dataset.cinematicScene === 'identity' || root.dataset.sceneState === 'identity';
    const desktopViewport = () => window.innerWidth > 760;
    const viewerAllowed = () => desktopViewport();

    function publishState(state) {
      root.dataset.jaguar3d = state;
      root.dataset.jaguar3dSource = 'ear-rodriguez-jaguar';
      root.dataset.jaguar3dActive = String(Boolean(modelReady && !failed && active && identityScene() && viewerAllowed()));
    }

    function failClosed(reason) {
      failed = true;
      modelReady = false;
      if (readyTimer) {
        clearTimeout(readyTimer);
        readyTimer = 0;
      }
      if (shell) {
        shell.dataset.ready = 'false';
        shell.dataset.active = 'false';
        shell.dataset.failure = reason || 'viewer-unavailable';
      }
      publishState('photo-fallback');
      root.dataset.jaguar3dFailure = reason || 'viewer-unavailable';
      console.warn(`[4PLANET JAGUAR] Ear 3D bridge failed closed to controlled species media: ${reason || 'viewer-unavailable'}`);
    }

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

    function verifyModelReady() {
      if (failed) return;
      if (!api?.getSceneGraph) {
        failClosed('scene-graph-check-unavailable');
        return;
      }
      api.getSceneGraph((error, graph) => {
        if (failed) return;
        if (error || !graph) {
          failClosed('scene-graph-unavailable');
          return;
        }
        if (readyTimer) {
          clearTimeout(readyTimer);
          readyTimer = 0;
        }
        modelReady = true;
        shell.dataset.ready = 'true';
        delete shell.dataset.failure;
        delete root.dataset.jaguar3dFailure;
        publishState('ear-live-bridge');
        integrateViewerBackground();
        readAnimations();
        readCameraHome();
        bindViewerInteraction();
        if (active && identityScene() && viewerAllowed()) show();
      });
    }

    async function enhanceWithApi() {
      if (failed || enhancementStarted || !iframe) return;
      enhancementStarted = true;
      try {
        await loadViewerApi();
        if (failed) return;
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
            if (failed) return;
            api = nextApi;
            api.start?.();
            api.addEventListener?.('viewerready', () => {
              if (failed) return;
              apiReady = true;
              verifyModelReady();
            });
          },
          error() {
            failClosed('viewer-init-error');
          }
        });
      } catch (error) {
        failClosed('viewer-api-unavailable');
        console.warn('[4PLANET JAGUAR] Viewer API enhancement failed.', error);
      }
    }

    function init() {
      if (!viewerAllowed()) return;
      ensureShell();
      if (failed) {
        publishState('photo-fallback');
        return;
      }
      if (!readyTimer) {
        readyTimer = window.setTimeout(() => {
          if (!modelReady) failClosed('viewer-ready-timeout');
        }, READY_TIMEOUT_MS);
      }
      publishState(modelReady ? 'ear-live-bridge' : 'ear-loading');
      enhanceWithApi();
    }

    function show() {
      if (!viewerAllowed() || !identityScene()) return;
      ensureShell();
      active = true;
      shell.dataset.active = String(modelReady && !failed);
      shell.style.removeProperty('display');
      publishState(failed ? 'photo-fallback' : (modelReady ? 'ear-live-bridge' : 'ear-loading'));
      if (!failed && apiReady && modelReady) {
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
      if (!apiReady || !modelReady || !api) return;
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
      if (!apiReady || !modelReady || !api || !animationUid) return;
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

    root.dataset.jaguarLiveBridge = 'v23';
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();