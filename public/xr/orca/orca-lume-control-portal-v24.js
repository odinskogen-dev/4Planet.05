(() => {
  'use strict';

  const PORTAL_CLASS = 'orca-lume-control-portal-v24';
  const PLACEHOLDER_CLASS = 'orca-lume-control-placeholder-v24';

  function install(root) {
    if (!root || root.dataset.orcaLumeControlPortal === 'true') return;
    const toggle = root.querySelector('.light-lens-toggle');
    if (!(toggle instanceof HTMLButtonElement)) return;

    root.dataset.orcaLumeControlPortal = 'true';

    const originalParent = toggle.parentElement;
    const originalNext = toggle.nextSibling;
    if (!originalParent) return;

    const firstRect = toggle.getBoundingClientRect();
    const placeholder = document.createElement('span');
    placeholder.className = PLACEHOLDER_CLASS;
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.cssText = [
      'display:block',
      'flex:0 0 auto',
      `width:${Math.max(1, firstRect.width)}px`,
      `height:${Math.max(1, firstRect.height)}px`,
      'pointer-events:none',
      'visibility:hidden'
    ].join(';');
    originalParent.insertBefore(placeholder, toggle);

    const portal = document.createElement('div');
    portal.className = PORTAL_CLASS;
    portal.setAttribute('data-orca-lume-control-plane', 'viewport-fixed-v24');
    portal.style.cssText = [
      'position:fixed',
      'z-index:2147480000',
      'margin:0',
      'padding:0',
      'border:0',
      'transform:none',
      'transition:none',
      'animation:none',
      'filter:none',
      'backdrop-filter:none',
      '-webkit-backdrop-filter:none',
      'contain:layout style paint',
      'isolation:isolate',
      'pointer-events:auto',
      '--light-lens-accent:#40ff74',
      '--light-lens-soft:#b4ffc6',
      '--light-lens-rgb:64,255,116'
    ].join(';');
    document.body.appendChild(portal);
    portal.appendChild(toggle);

    toggle.style.setProperty('position', 'relative', 'important');
    toggle.style.setProperty('inset', 'auto', 'important');
    toggle.style.setProperty('display', 'inline-flex', 'important');
    toggle.style.setProperty('width', '100%', 'important');
    toggle.style.setProperty('min-width', '100%', 'important');
    toggle.style.setProperty('max-width', '100%', 'important');
    toggle.style.setProperty('height', '100%', 'important');
    toggle.style.setProperty('min-height', '100%', 'important');
    toggle.style.setProperty('max-height', '100%', 'important');
    toggle.style.setProperty('margin', '0', 'important');
    toggle.style.setProperty('transform', 'none', 'important');
    toggle.style.setProperty('transition', 'none', 'important');
    toggle.style.setProperty('animation', 'none', 'important');
    toggle.style.setProperty('backdrop-filter', 'none', 'important');
    toggle.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    toggle.style.setProperty('touch-action', 'manipulation', 'important');

    const place = () => {
      if (!placeholder.isConnected || !portal.isConnected) return;
      const rect = placeholder.getBoundingClientRect();
      const width = Math.max(1, rect.width || firstRect.width);
      const height = Math.max(1, rect.height || firstRect.height);
      portal.style.left = `${Math.round(rect.left * 100) / 100}px`;
      portal.style.top = `${Math.round(rect.top * 100) / 100}px`;
      portal.style.width = `${Math.round(width * 100) / 100}px`;
      portal.style.height = `${Math.round(height * 100) / 100}px`;
    };

    place();
    window.addEventListener('resize', place, { passive: true });
    window.addEventListener('orientationchange', place, { passive: true });

    const restore = () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('orientationchange', place);
      if (toggle.isConnected && originalParent.isConnected) {
        if (originalNext && originalNext.parentNode === originalParent) originalParent.insertBefore(toggle, originalNext);
        else originalParent.appendChild(toggle);
      }
      placeholder.remove();
      portal.remove();
    };
    window.addEventListener('pagehide', restore, { once: true });

    root.dataset.orcaLumeControlPortalState = 'fixed';
    root.__orcaLumeControlPortalV24 = { portal, toggle, placeholder, place, restore };
  }

  window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('browser-experience');
    requestAnimationFrame(() => requestAnimationFrame(() => install(root)));
  }, { once: true });

  window.OrcaLumeControlPortalV24 = { install };
})();
