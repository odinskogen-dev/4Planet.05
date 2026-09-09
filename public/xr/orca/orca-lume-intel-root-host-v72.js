(() => {
  'use strict';

  function install() {
    const root = document.getElementById('browser-experience');
    if (!root || root.dataset.orcaLumeIntelRootHost === 'v72') return;
    root.dataset.orcaLumeIntelRootHost = 'v72';

    const reconcile = () => {
      const panel = root.querySelector('.orca-lume-intel');
      if (!panel) {
        root.dataset.orcaLumeIntelHost = 'pending';
        return;
      }
      // Persistent intelligence UI must not inherit cinematic transforms from
      // .nature-stage / .light-lens-layer. Keep projection geometry in the
      // moving stage, but host the panel on the fixed Journey root.
      if (panel.parentElement !== root) root.appendChild(panel);
      root.dataset.orcaLumeIntelHost = 'journey-root-v72';
    };

    reconcile();
    root.addEventListener('4planet:light-lens-change', () => queueMicrotask(reconcile));
    window.addEventListener('4planet:nature-journey-scene', () => queueMicrotask(reconcile));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
