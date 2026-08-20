(() => {
  const MARGIN_DESKTOP = 20;
  const MARGIN_COMPACT = 10;
  let lateTimer = 0;
  let cardObserver = null;

  const resetOrigin = () => {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  };

  const viewportBounds = () => {
    const viewport = window.visualViewport?.width || window.innerWidth;
    const offsetLeft = window.visualViewport?.offsetLeft || 0;
    const compact = viewport <= 760;
    const margin = compact ? MARGIN_COMPACT : MARGIN_DESKTOP;
    return {
      viewport,
      offsetLeft,
      compact,
      margin,
      minLeft: offsetLeft + margin,
      maxRight: offsetLeft + viewport - margin,
    };
  };

  const clampWorldCard = (root, bounds) => {
    const card = root.querySelector('.nature-world-card[data-visible="true"]');
    if (!card) return null;

    const { compact, minLeft, maxRight } = bounds;
    const parentRect = (card.offsetParent || root).getBoundingClientRect();
    const safeWidth = Math.max(240, maxRight - minLeft);

    // A visible interaction card is a control surface, not world geometry.
    // Once visible it must be deterministically anchored inside the visual
    // viewport instead of inheriting authored horizontal entrance transforms.
    card.style.setProperty('box-sizing', 'border-box', 'important');
    card.style.setProperty('max-width', `${safeWidth}px`, 'important');
    card.style.removeProperty('translate');

    if (!compact) {
      card.style.setProperty('transform', 'translate3d(0,-46%,0) scale(1)', 'important');
      if (card.dataset.align === 'left') {
        card.style.setProperty('left', `${Math.max(0, minLeft - parentRect.left)}px`, 'important');
        card.style.setProperty('right', 'auto', 'important');
      } else {
        card.style.setProperty('right', `${Math.max(0, parentRect.right - maxRight)}px`, 'important');
        card.style.setProperty('left', 'auto', 'important');
      }
    }

    let rect = card.getBoundingClientRect();
    if (rect.width > safeWidth + 1) {
      card.style.setProperty('width', `${safeWidth}px`, 'important');
      rect = card.getBoundingClientRect();
    }

    // Final defensive correction uses the positioned inset itself rather than
    // the CSS individual-transform property, which proved non-deterministic in
    // Chromium while the authored card transform was transitioning.
    if (!compact && rect.left < minLeft - 1) {
      const correction = minLeft - rect.left;
      if (card.dataset.align === 'left') {
        const current = Number.parseFloat(card.style.left) || 0;
        card.style.setProperty('left', `${current + correction}px`, 'important');
      } else {
        const current = Number.parseFloat(card.style.right) || 0;
        card.style.setProperty('right', `${Math.max(0, current - correction)}px`, 'important');
      }
      rect = card.getBoundingClientRect();
    }
    if (!compact && rect.right > maxRight + 1) {
      const correction = rect.right - maxRight;
      if (card.dataset.align === 'left') {
        const current = Number.parseFloat(card.style.left) || 0;
        card.style.setProperty('left', `${Math.max(0, current - correction)}px`, 'important');
      } else {
        const current = Number.parseFloat(card.style.right) || 0;
        card.style.setProperty('right', `${current + correction}px`, 'important');
      }
      rect = card.getBoundingClientRect();
    }

    return rect;
  };

  const clampFrame = () => {
    const root = document.getElementById('browser-experience');
    const hud = root?.querySelector('.nature-journey-hud');
    if (!root || !hud) return;

    resetOrigin();
    const bounds = viewportBounds();
    const { viewport, offsetLeft, compact, margin, minLeft, maxRight } = bounds;

    // The HUD is a viewport-level navigation surface. Scene and interaction
    // transitions may animate the world, but must never translate the HUD.
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

    let hudRect = hud.getBoundingClientRect();

    // Fail-safe against unexpected inherited/transitional geometry.
    if (hudRect.left < minLeft - 1) {
      hud.style.setProperty('transform', 'none', 'important');
      hud.style.setProperty('left', `${minLeft + (minLeft - hudRect.left)}px`, 'important');
      hudRect = hud.getBoundingClientRect();
    }
    if (hudRect.right > maxRight + 1) {
      const safeWidth = Math.max(280, maxRight - hudRect.left);
      hud.style.setProperty('width', `${safeWidth}px`, 'important');
      hud.style.setProperty('max-width', `${safeWidth}px`, 'important');
      hudRect = hud.getBoundingClientRect();
    }

    const cardRect = clampWorldCard(root, bounds);
    const rootRect = root.getBoundingClientRect();
    const hudSafe = hudRect.left >= offsetLeft - 1 && hudRect.right <= offsetLeft + viewport + 1;
    const cardSafe = !cardRect || (cardRect.left >= offsetLeft - 1 && cardRect.right <= offsetLeft + viewport + 1);
    const rootSafe = rootRect.left >= -1 && rootRect.right <= offsetLeft + viewport + 1;
    root.dataset.viewportSafe = String(rootSafe && hudSafe && cardSafe);
  };

  const settle = () => {
    resetOrigin();
    window.clearTimeout(lateTimer);
    // Apply once synchronously for event-driven interaction checks, then again
    // after layout/compositing and after the authored transition window.
    clampFrame();
    requestAnimationFrame(() => requestAnimationFrame(clampFrame));
    lateTimer = window.setTimeout(clampFrame, 1250);
  };

  const observeWorldCard = () => {
    const root = document.getElementById('browser-experience');
    const card = root?.querySelector('.nature-world-card');
    cardObserver?.disconnect();
    cardObserver = null;
    if (!card) return;

    cardObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === 'attributes')) settle();
    });
    cardObserver.observe(card, { attributes: true, attributeFilter: ['data-visible', 'data-align', 'data-type'] });
  };

  window.addEventListener('4planet:nature-browser-ready', () => {
    observeWorldCard();
    settle();
  });
  window.addEventListener('4planet:nature-browser-enter', settle);
  window.addEventListener('4planet:nature-journey-scene', settle);
  window.addEventListener('4planet:nature-world-interaction', settle);
  window.addEventListener('resize', settle, { passive: true });
  window.addEventListener('orientationchange', settle, { passive: true });
})();