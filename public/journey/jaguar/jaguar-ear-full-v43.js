(() => {
  'use strict';

  const MODEL_UID = '91c61c329d2a4668816f81f08dfcd492';
  const MODEL_SOURCE = 'https://sketchfab.com/3d-models/jaguar-91c61c329d2a4668816f81f08dfcd492';
  const API_URL = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
  const READY_TIMEOUT_MS = 15000;

  const boot = () => {
    const root = document.getElementById('jaguar-experience');
    const stage = document.getElementById('three-stage');
    const loading = document.getElementById('loading');
    const fallback = document.getElementById('photo-fallback');
    const controls = document.getElementById('controls');
    if (!root || !stage || root.dataset.jaguarEarFullBooted === 'true') return;
    root.dataset.jaguarEarFullBooted = 'true';
    root.dataset.jaguarEarFull = 'loading';

    let api = null;
    let ready = false;
    let failed = false;
    let currentAnimationUid = null;
    let animationDuration = 0;
    let cameraHome = null;
    let timeout = 0;

    const shell = document.createElement('div');
    shell.className = 'jaguar-ear-full-v43';
    shell.dataset.ready = 'false';
    shell.setAttribute('aria-label', 'Interactive full 3D Jaguar by Ear.Rodriguez, CC BY 4.0');
    shell.innerHTML = `
      <iframe class="jaguar-ear-full-v43__viewer" title="Interactive full 3D Jaguar by Ear.Rodriguez" allow="autoplay; fullscreen; xr-spatial-tracking" loading="eager"></iframe>
      <a class="jaguar-ear-full-v43__credit" href="${MODEL_SOURCE}" target="_blank" rel="noreferrer">3D · EAR.RODRIGUEZ · CC BY 4.0</a>`;
    stage.appendChild(shell);
    const iframe = shell.querySelector('iframe');

    const style = document.createElement('style');
    style.textContent = `
      #three-stage{position:relative;overflow:hidden}
      .jaguar-ear-full-v43{position:absolute;inset:0;z-index:8;opacity:0;pointer-events:none;transition:opacity .45s ease;background:transparent}
      .jaguar-ear-full-v43[data-ready="true"]{opacity:1;pointer-events:auto}
      .jaguar-ear-full-v43__viewer{position:absolute;inset:-2%;width:104%;height:104%;border:0;background:transparent;display:block}
      .jaguar-ear-full-v43__credit{position:absolute;left:12px;bottom:12px;z-index:2;padding:6px 8px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(2,8,5,.62);backdrop-filter:blur(8px);color:rgba(255,255,255,.72);font:600 8px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;text-decoration:none}
      #jaguar-experience[data-jaguar-ear-full="ready"] #three-stage>canvas{opacity:0!important;pointer-events:none!important}
      #jaguar-experience[data-jaguar-ear-full="ready"] #loading,#jaguar-experience[data-jaguar-ear-full="ready"] #photo-fallback{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
      #jaguar-experience[data-jaguar-ear-full="ready"] .ground-contact{z-index:9;pointer-events:none}
      @media(max-width:760px){.jaguar-ear-full-v43__viewer{inset:-5% -12%;width:124%;height:110%}.jaguar-ear-full-v43__credit{left:8px;bottom:8px;font-size:7px}}
      @media(prefers-reduced-motion:reduce){.jaguar-ear-full-v43{transition:none}}
    `;
    document.head.appendChild(style);

    const encounterActive = () => Number(root.dataset.scene || '0') === 0;

    function publish(state) {
      root.dataset.jaguarEarFull = state;
      if (state === 'ready') {
        root.dataset.jaguar3d = 'ready';
        root.dataset.jaguar3dSource = 'ear-rodriguez-full-source-viewer';
        root.dataset.jaguar3dActive = String(encounterActive() && !document.hidden);
      }
    }

    function show() {
      if (!ready || failed || !encounterActive() || document.hidden) return;
      shell.style.removeProperty('display');
      shell.dataset.ready = 'true';
      root.dataset.jaguar3dActive = 'true';
      api?.start?.();
      api?.play?.();
    }

    function hide() {
      if (!ready) return;
      root.dataset.jaguar3dActive = 'false';
      api?.pause?.();
      if (!encounterActive()) shell.style.display = 'none';
    }

    function failClosed(reason) {
      if (ready || failed) return;
      failed = true;
      if (timeout) clearTimeout(timeout);
      shell.dataset.ready = 'false';
      shell.style.display = 'none';
      publish('fallback');
      root.dataset.jaguarEarFullFailure = reason;
      console.warn(`[4PLANET JAGUAR] Full Ear.Rodriguez viewer failed closed: ${reason}`);
    }

    function loadApi() {
      if (window.Sketchfab) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-jaguar-sketchfab-api]');
        if (existing) {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = API_URL;
        script.async = true;
        script.dataset.jaguarSketchfabApi = 'true';
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
      });
    }

    function captureSourceState() {
      api?.getCameraLookAt?.((error, camera) => {
        if (!error && camera) cameraHome = camera;
      });
      api?.getAnimations?.((error, animations) => {
        if (error || !Array.isArray(animations) || animations.length === 0) return;
        const first = animations[0];
        currentAnimationUid = first?.[0] || first?.uid || null;
        const duration = Number(first?.[2] || first?.duration || 0);
        if (Number.isFinite(duration)) animationDuration = duration;
        if (currentAnimationUid) api?.setCurrentAnimationByUID?.(currentAnimationUid);
        api?.setCycleMode?.('loopOne');
        api?.setSpeed?.(.55);
        api?.play?.();
        root.dataset.jaguarSourceAnimation = 'available';
      });
    }

    function lookAtMe() {
      if (!ready || !api) return;
      if (currentAnimationUid) {
        api.setCurrentAnimationByUID?.(currentAnimationUid);
        if (animationDuration > 0) api.seekTo?.(Math.min(animationDuration * .52, 8));
        api.setCycleMode?.('one');
        api.setSpeed?.(.35);
        api.play?.();
      }
      if (cameraHome?.position && cameraHome?.target && api.setCameraLookAt) {
        const p = [...cameraHome.position];
        const t = [...cameraHome.target];
        p[0] *= .9; p[2] *= .9;
        api.setCameraLookAt(p, t, .8);
      }
      window.setTimeout(() => {
        if (!ready || !api) return;
        api.setCycleMode?.('loopOne');
        api.setSpeed?.(.55);
        api.play?.();
      }, 1800);
    }

    function move() {
      if (!ready || !api || !currentAnimationUid) return;
      api.setCurrentAnimationByUID?.(currentAnimationUid);
      api.seekTo?.(0);
      api.setCycleMode?.('one');
      api.setSpeed?.(.8);
      api.play?.();
      window.setTimeout(() => {
        if (!ready || !api) return;
        api.setCycleMode?.('loopOne');
        api.setSpeed?.(.55);
        api.play?.();
      }, Math.min(5200, Math.max(2600, animationDuration * 340)));
    }

    controls?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button || !ready) return;
      if (button.dataset.action === 'look') lookAtMe();
      if (button.dataset.action === 'move') move();
    }, true);

    const observer = new MutationObserver(() => encounterActive() ? show() : hide());
    observer.observe(root, { attributes: true, attributeFilter: ['data-scene'] });
    document.addEventListener('visibilitychange', () => document.hidden ? hide() : show());
    window.addEventListener('pagehide', hide, { once: true });

    timeout = window.setTimeout(() => failClosed('viewer-ready-timeout'), READY_TIMEOUT_MS);

    loadApi().then(() => {
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
        dnt: 1,
        success(nextApi) {
          api = nextApi;
          api.start?.();
          api.addEventListener?.('viewerready', () => {
            if (failed) return;
            api.getSceneGraph?.((error, graph) => {
              if (error || !graph) return failClosed('scene-graph-unavailable');
              if (timeout) clearTimeout(timeout);
              ready = true;
              shell.dataset.ready = 'true';
              publish('ready');
              if (loading) loading.setAttribute('aria-hidden', 'true');
              if (fallback) fallback.setAttribute('aria-hidden', 'true');
              captureSourceState();
              show();
            });
          });
        },
        error() { failClosed('viewer-init-error'); }
      });
    }).catch((error) => {
      failClosed('viewer-api-unavailable');
      console.warn('[4PLANET JAGUAR] Full source viewer boot failed.', error);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
