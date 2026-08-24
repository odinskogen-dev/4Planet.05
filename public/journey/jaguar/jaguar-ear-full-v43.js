(() => {
  'use strict';

  const MODEL_UID = '91c61c329d2a4668816f81f08dfcd492';
  const MODEL_SOURCE = `https://sketchfab.com/3d-models/jaguar-${MODEL_UID}`;
  const EMBED_URL = `https://sketchfab.com/models/${MODEL_UID}/embed?autostart=1&preload=1&animation_autoplay=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_watermark_link=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&dnt=1&transparent=1`;
  const READY_TIMEOUT_MS = 15000;

  const boot = () => {
    const root = document.getElementById('jaguar-experience');
    const stage = document.getElementById('three-stage');
    const loading = document.getElementById('loading');
    const fallback = document.getElementById('photo-fallback');
    const controls = document.getElementById('controls');
    const enter = document.getElementById('enter');
    if (!root || !stage || root.dataset.jaguarEarFullBooted === 'true') return;

    root.dataset.jaguarEarFullBooted = 'true';
    root.dataset.jaguarEarFull = 'loading';
    root.dataset.jaguarEarDelivery = 'direct-official-embed-v47';

    let ready = false;
    let failed = false;
    let timeout = 0;
    let loadGeneration = 0;

    const shell = document.createElement('div');
    shell.className = 'jaguar-ear-full-v43';
    shell.dataset.ready = 'false';
    shell.setAttribute('aria-label', 'Interactive full 3D Jaguar by Ear.Rodriguez, CC BY 4.0');
    shell.innerHTML = `
      <iframe class="jaguar-ear-full-v43__viewer" title="Interactive full 3D Jaguar by Ear.Rodriguez" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>
      <a class="jaguar-ear-full-v43__credit" href="${MODEL_SOURCE}" target="_blank" rel="noreferrer">3D · EAR.RODRIGUEZ · CC BY 4.0</a>`;
    stage.appendChild(shell);
    const iframe = shell.querySelector('iframe');

    const style = document.createElement('style');
    style.textContent = `
      #three-stage{position:relative;overflow:hidden}
      .jaguar-ear-full-v43{position:absolute;inset:0;z-index:8;opacity:0;pointer-events:none;transition:opacity .38s ease;background:#020704}
      .jaguar-ear-full-v43[data-ready="true"]{opacity:1;pointer-events:auto}
      .jaguar-ear-full-v43__viewer{position:absolute;inset:-2%;width:104%;height:104%;border:0;background:#020704;display:block}
      .jaguar-ear-full-v43__credit{position:absolute;left:12px;bottom:12px;z-index:2;padding:6px 8px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(2,8,5,.62);backdrop-filter:blur(8px);color:rgba(255,255,255,.72);font:600 8px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;text-decoration:none}
      #jaguar-experience[data-jaguar-ear-full="ready"] #three-stage>canvas{opacity:0!important;pointer-events:none!important}
      #jaguar-experience[data-jaguar-ear-full="ready"] #loading,#jaguar-experience[data-jaguar-ear-full="ready"] #photo-fallback{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
      #jaguar-experience[data-jaguar-ear-full="ready"] .ground-contact{z-index:9;pointer-events:none}
      @media(max-width:760px){.jaguar-ear-full-v43__viewer{inset:-4% -9%;width:118%;height:108%}.jaguar-ear-full-v43__credit{left:8px;bottom:8px;font-size:7px}}
      @media(prefers-reduced-motion:reduce){.jaguar-ear-full-v43{transition:none}}
    `;
    document.head.appendChild(style);

    const encounterActive = () => Number(root.dataset.scene || '0') === 0;

    function ensureShellMounted() {
      if (!shell.isConnected || shell.parentElement !== stage) stage.appendChild(shell);
    }

    function assertFullSourceOwnership() {
      root.dataset.jaguarEarFull = 'ready';
      root.dataset.jaguar3d = 'ready';
      root.dataset.jaguar3dSource = 'ear-rodriguez-full-source-viewer';
      root.dataset.jaguar3dActive = String(encounterActive() && !document.hidden);
      root.dataset.jaguarSourceAnimation = 'source-viewer-autoplay';
      root.dataset.jaguarEarDelivery = 'direct-official-embed-v47';
    }

    function publishReady() {
      ensureShellMounted();
      ready = true;
      failed = false;
      if (timeout) clearTimeout(timeout);
      shell.dataset.ready = 'true';
      assertFullSourceOwnership();
      delete root.dataset.jaguarEarFullFailure;
      loading?.setAttribute('aria-hidden', 'true');
      fallback?.setAttribute('aria-hidden', 'true');
      const status = document.getElementById('runtime-status');
      if (status) status.textContent = 'EAR JAGUAR · FULL SOURCE READY';
      const state = document.getElementById('creature-state');
      if (state) state.textContent = 'Full Ear.Rodriguez Jaguar is active. Drag the animal to inspect it; source-viewer animation is preserved.';
      controls?.querySelectorAll('button[data-action="look"],button[data-action="move"]').forEach((button) => { button.hidden = true; });
      const hint = controls?.querySelector('span');
      if (hint) hint.textContent = 'DRAG TO TURN · SOURCE ANIMATION';
    }

    function failClosed(reason) {
      if (ready || failed) return;
      failed = true;
      if (timeout) clearTimeout(timeout);
      shell.dataset.ready = 'false';
      shell.style.display = 'none';
      root.dataset.jaguarEarFull = 'fallback';
      root.dataset.jaguarEarFullFailure = reason;
      console.warn(`[4PLANET JAGUAR] Full Ear.Rodriguez direct embed failed closed: ${reason}`);
    }

    function armLoad() {
      ensureShellMounted();
      const generation = ++loadGeneration;
      root.dataset.jaguarEarFull = 'loading';
      shell.dataset.ready = 'false';
      if (timeout) clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        if (generation === loadGeneration) failClosed('direct-embed-timeout');
      }, READY_TIMEOUT_MS);
      iframe.addEventListener('load', () => {
        if (generation !== loadGeneration || iframe.src === 'about:blank') return;
        publishReady();
      }, { once: true });
      iframe.src = EMBED_URL;
    }

    function show() {
      if (!encounterActive() || document.hidden) return;
      ensureShellMounted();
      shell.style.removeProperty('display');
      if (iframe.src === 'about:blank' || !iframe.getAttribute('src')) {
        ready = false;
        failed = false;
        armLoad();
        return;
      }
      if (ready) {
        shell.dataset.ready = 'true';
        assertFullSourceOwnership();
      }
    }

    function hide() {
      root.dataset.jaguar3dActive = 'false';
      shell.dataset.ready = 'false';
      shell.style.display = 'none';
      if (timeout) clearTimeout(timeout);
      loadGeneration += 1;
      iframe.src = 'about:blank';
      ready = false;
    }

    const observer = new MutationObserver(() => encounterActive() ? show() : hide());
    observer.observe(root, { attributes: true, attributeFilter: ['data-scene'] });
    enter?.addEventListener('click', () => requestAnimationFrame(() => requestAnimationFrame(show)));
    document.addEventListener('visibilitychange', () => document.hidden ? hide() : show());
    window.addEventListener('pagehide', hide, { once: true });

    armLoad();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
