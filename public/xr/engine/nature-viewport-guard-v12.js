(() => {
  const resetOrigin = () => {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  };

  const audit = () => {
    const root = document.getElementById('browser-experience');
    const hud = root?.querySelector('.nature-journey-hud');
    if (!root || !hud) return;
    const viewport = window.innerWidth;
    const rootRect = root.getBoundingClientRect();
    const hudRect = hud.getBoundingClientRect();
    const safe = rootRect.left >= -1 && rootRect.right <= viewport + 1 && hudRect.left >= -1 && hudRect.right <= viewport + 1;
    root.dataset.viewportSafe = String(safe);
    if (!safe) resetOrigin();
  };

  const settle = () => {
    resetOrigin();
    requestAnimationFrame(() => requestAnimationFrame(audit));
  };

  window.addEventListener('4planet:nature-browser-ready', settle);
  window.addEventListener('4planet:nature-journey-scene', settle);
  window.addEventListener('resize', settle, { passive: true });
  window.addEventListener('orientationchange', settle, { passive: true });
})();
