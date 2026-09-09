(() => {
  const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  function installRoom(root) {
    if (!root || root.dataset.orcaLumeRoom21 === 'true') return;
    const layer = root.querySelector('.light-lens-layer');
    if (!layer) return;

    root.dataset.orcaLumeRoom21 = 'true';

    const room = document.createElement('div');
    room.className = 'orca-lume-room21';
    room.setAttribute('aria-hidden', 'true');
    room.innerHTML = `
      <div class="orca-lume-room21__back"></div>
      <div class="orca-lume-room21__floor"></div>
      <div class="orca-lume-room21__side orca-lume-room21__side--left"></div>
      <div class="orca-lume-room21__side orca-lume-room21__side--right"></div>
      <div class="orca-lume-room21__volume"></div>
      <div class="orca-lume-room21__depth"><i></i><i></i><i></i><i></i><i></i></div>`;
    layer.prepend(room);

    const toggle = root.querySelector('.light-lens-toggle');
    const syncToggleLabel = () => {
      if (!(toggle instanceof HTMLButtonElement)) return;
      toggle.textContent = root.dataset.lightLens === 'true' ? 'REAL WORLD' : 'LUME ROOM';
      toggle.setAttribute('aria-label', root.dataset.lightLens === 'true' ? 'Return to real-world journey state' : 'Enter Orca LUME intelligence room');
    };

    syncToggleLabel();
    root.addEventListener('4planet:light-lens-change', syncToggleLabel);

    const stage = root.querySelector('.nature-stage');
    if (!stage || reducedMotion()) return;

    let raf = 0;
    stage.addEventListener('pointermove', (event) => {
      if (root.dataset.lightLens !== 'true') return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5);
        const py = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5);
        root.style.setProperty('--orca-room-yaw', `${(px * 1.8).toFixed(2)}deg`);
        root.style.setProperty('--orca-room-pitch', `${(-py * 1.2).toFixed(2)}deg`);
      });
    }, { passive: true });

    stage.addEventListener('pointerleave', () => {
      root.style.setProperty('--orca-room-yaw', '0deg');
      root.style.setProperty('--orca-room-pitch', '0deg');
    }, { passive: true });
  }

  function install(root) {
    if (!root) return;
    installRoom(root);
    root.addEventListener('4planet:light-lens-change', () => installRoom(root));
  }

  window.addEventListener('DOMContentLoaded', () => install(document.getElementById('browser-experience')), { once: true });
  window.OrcaLumeRoom21 = { install, installRoom };
})();
