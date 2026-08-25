(() => {
  'use strict';

  const PORTAL_CLASS = 'orca-lume-control-portal-v25';

  function install(root) {
    if (!root || root.dataset.orcaLumeControlPortal === 'true') return;
    const toggle = root.querySelector('.light-lens-toggle');
    if (!(toggle instanceof HTMLButtonElement)) return;

    const originalParent = toggle.parentElement;
    const originalNext = toggle.nextSibling;
    if (!originalParent) return;

    root.dataset.orcaLumeControlPortal = 'true';

    const style = document.createElement('style');
    style.dataset.orcaLumeControlPortalV25 = 'true';
    style.textContent = `
      .${PORTAL_CLASS}{
        position:fixed!important;
        z-index:2147480000!important;
        top:max(64px,calc(env(safe-area-inset-top) + 54px))!important;
        right:max(22px,env(safe-area-inset-right))!important;
        width:94px!important;
        height:32px!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        transform:none!important;
        translate:none!important;
        scale:none!important;
        rotate:none!important;
        transition:none!important;
        animation:none!important;
        filter:none!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        contain:strict!important;
        isolation:isolate!important;
        pointer-events:auto!important;
        overflow:visible!important;
        --light-lens-accent:#40ff74;
        --light-lens-soft:#b4ffc6;
        --light-lens-rgb:64,255,116;
      }
      .${PORTAL_CLASS}>.light-lens-toggle{
        position:absolute!important;
        inset:0!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        box-sizing:border-box!important;
        width:94px!important;
        min-width:94px!important;
        max-width:94px!important;
        height:32px!important;
        min-height:32px!important;
        max-height:32px!important;
        margin:0!important;
        padding:0!important;
        transform:none!important;
        translate:none!important;
        scale:none!important;
        rotate:none!important;
        transition:none!important;
        animation:none!important;
        filter:none!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        will-change:auto!important;
        touch-action:manipulation!important;
        pointer-events:auto!important;
      }
      @media(max-width:760px){
        .${PORTAL_CLASS}{
          top:max(58px,calc(env(safe-area-inset-top) + 48px))!important;
          right:max(12px,env(safe-area-inset-right))!important;
          width:78px!important;
          height:28px!important;
        }
        .${PORTAL_CLASS}>.light-lens-toggle{
          width:78px!important;
          min-width:78px!important;
          max-width:78px!important;
          height:28px!important;
          min-height:28px!important;
          max-height:28px!important;
        }
      }
    `;
    document.head.appendChild(style);

    const portal = document.createElement('div');
    portal.className = PORTAL_CLASS;
    portal.setAttribute('data-orca-lume-control-plane', 'static-viewport-v25');
    document.body.appendChild(portal);
    portal.appendChild(toggle);

    const restore = () => {
      if (toggle.isConnected && originalParent.isConnected) {
        if (originalNext && originalNext.parentNode === originalParent) originalParent.insertBefore(toggle, originalNext);
        else originalParent.appendChild(toggle);
      }
      portal.remove();
      style.remove();
    };
    window.addEventListener('pagehide', restore, { once: true });

    root.dataset.orcaLumeControlPortalState = 'static-viewport-v25';
    root.__orcaLumeControlPortalV25 = { portal, toggle, restore };
  }

  window.addEventListener('DOMContentLoaded', () => {
    install(document.getElementById('browser-experience'));
  }, { once: true });

  window.OrcaLumeControlPortalV25 = { install };
})();
