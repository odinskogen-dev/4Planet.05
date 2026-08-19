(() => {
  const MARGIN_DESKTOP = 20;
  const MARGIN_COMPACT = 10;
  let lateTimer = 0;

  const resetOrigin = () => {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  };

  const clampHud = () => {
    const root = document.getElementById('browser-experience');
    const hud = root?.querySelector('.nature-journey-hud');
    if (!root || !hud) return;

    resetOrigin();
    const viewport = window.visualViewport?.width || window.innerWidth;
    const offsetLeft = window.visualViewport?.offsetLeft || 0;
    const compact = viewport <= 760;
    const margin = compact ? MARGIN_COMPACT : MARGIN_DESKTOP;
    const minLeft = offsetLeft + margin;
    const maxRight = offsetLeft + viewport - margin;

    // The HUD is a viewport-level navigation surface. Scene transitions may
    // animate children, but must never translate the HUD itself off-canvas.
    hud.style.setProperty('transform', 'none', 'important');
    hud.style.setProperty('max-width', `${Math.max(280, viewport - margin * 2)}px`, 'important');

    if (compact) {
      hud.style.setProperty('left', `${minLeft}px`, 'important');
      hud.style.setProperty('right', `${margin}px`, 'important');
      hud.style.setProperty('width', 'auto', 'important');
    } else {
      hud.style.setProperty('left', `${minLeft}px`, 'important');
      hud.style.setProperty('right', 'auto', 'important');
      const desired = Math.min(720, Math.max(360, maxRight - minLeft));
      hud.style.setProperty('width', `${desired}px`, 'important');
    }

    let rootRect = root.getBoundingClientRect();
    let hudRect = hud.getBoundingClientRect();

    // Fail-safe against unexpected inherited/transitional geometry.
    if (hudRect.left < minLeft - 1) {
      hud.style.setProperty('left', `${minLeft + (minLeft - hudRect.left)}px`, 'important');
      hudRect = hud.getBoundingClientRect();
    }
    if (hudRect.right > maxRight + 1) {
      const safeWidth = Math.max(280, maxRight - hudRect.left);
      hud.style.setProperty('width', `${safeWidth}px`, 'important');
      hud.style.setProperty('max-width', `${safeWidth}px`, 'important');
      hudRect = hud.getBoundingClientRect();
    }

    rootRect = root.getBoundingClientRect();
    const safe = rootRect.left >= -1 && rootRect.right <= offsetLeft + viewport + 1 && hudRect.left >= offsetLeft - 1 && hudRect.right <= offsetLeft + viewport + 1;
    root.dataset.viewportSafe = String(safe);
  };

  const settle = () => {
    resetOrigin();
    window.clearTimeout(lateTimer);
    requestAnimationFrame(() => requestAnimationFrame(clampHud));
    // Re-clamp after the authored 0.8–1.2 s transition/hold window so a
    // scene-specific CSS transition cannot reintroduce horizontal clipping.
    lateTimer = window.setTimeout(clampHud, 1250);
  };

  window.addEventListener('4planet:nature-browser-ready', settle);
  window.addEventListener('4planet:nature-journey-scene', settle);
  window.addEventListener('resize', settle, { passive: true });
  window.addEventListener('orientationchange', settle, { passive: true });
})();
