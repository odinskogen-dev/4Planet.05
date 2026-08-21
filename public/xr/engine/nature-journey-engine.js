(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // Generic presentation-only scene choreography. Scientific truth remains in
  // canonical SPECIES / Living Systems / relationship feeds and is composed
  // upstream by NatureSceneAdapter.
  const DEFAULT_SCENE = {
    state: 'life',
    backgroundX: 50,
    backgroundY: 50,
    backgroundScale: 1.14,
    detailOpacity: 0.22,
    subjectX: 50,
    subjectY: 50,
    subjectScale: 1,
    subjectOpacity: 1,
    worldBrightness: 0.79,
    worldSaturation: 1.06,
    veilOpacity: 1,
  };

  const normalize = (scene = {}) => ({ ...DEFAULT_SCENE, ...scene });

  const applyScene = ({ root, node, index, total, userInitiated = false }) => {
    if (!root || !node) return;
    const scene = normalize(node.scene);
    root.dataset.sceneState = scene.state || node.relationClass?.toLowerCase() || node.kind?.toLowerCase() || 'life';
    root.dataset.journeyIndex = String(index);
    root.dataset.journeyNode = node.id;
    root.style.setProperty('--scene-bg-x', `${clamp(scene.backgroundX, 0, 100)}%`);
    root.style.setProperty('--scene-bg-y', `${clamp(scene.backgroundY, 0, 100)}%`);
    root.style.setProperty('--scene-bg-scale', String(clamp(scene.backgroundScale, 1, 1.5)));
    root.style.setProperty('--scene-detail-opacity', String(clamp(scene.detailOpacity, 0, 1)));
    root.style.setProperty('--scene-subject-x', `${clamp(scene.subjectX, 0, 100)}%`);
    root.style.setProperty('--scene-subject-y', `${clamp(scene.subjectY, 0, 100)}%`);
    root.style.setProperty('--scene-subject-scale', String(clamp(scene.subjectScale, 0.35, 1.8)));
    root.style.setProperty('--scene-subject-opacity', String(clamp(scene.subjectOpacity, 0, 1)));
    root.style.setProperty('--scene-world-brightness', String(clamp(scene.worldBrightness, 0.35, 1.2)));
    root.style.setProperty('--scene-world-saturation', String(clamp(scene.worldSaturation, 0, 1.5)));
    root.style.setProperty('--scene-veil-opacity', String(clamp(scene.veilOpacity, 0, 1)));

    const hud = root.querySelector('.nature-journey-hud');
    if (hud) {
      const stage = hud.querySelector('.nature-journey-hud__stage');
      const title = hud.querySelector('.nature-journey-hud__title');
      const cue = hud.querySelector('.nature-journey-hud__cue');
      const next = hud.querySelector('.nature-journey-hud__next');
      const back = hud.querySelector('.nature-journey-hud__back');
      if (stage) stage.textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ${scene.stageLabel || node.label}`;
      if (title) title.textContent = scene.sceneTitle || node.title;
      if (cue) cue.textContent = scene.sceneCue || (node.relationClass === 'PRESSURE' ? 'SEE WHAT CHANGES' : node.relationClass === 'RESPONSE' ? 'MOVE FROM UNDERSTANDING TO RESPONSE' : 'FOLLOW THE LIVING SYSTEM');
      if (next) next.textContent = index >= total - 1 ? (scene.finalCta || 'CONTINUE →') : `FOLLOW THE SYSTEM · ${String(index + 2).padStart(2, '0')} →`;
      if (back) back.disabled = index <= 0;
      hud.dataset.visible = 'true';
    }

    const route = root.querySelector('.nature-journey-route');
    if (route) {
      const current = node.browserPosition || { x: 50, y: 50 };
      route.style.setProperty('--route-x', `${current.x}%`);
      route.style.setProperty('--route-y', `${current.y}%`);
      route.dataset.state = root.dataset.sceneState;
    }

    root.querySelectorAll('.nature-node').forEach((el, i) => {
      el.dataset.journeyRole = i < index ? 'visited' : i === index ? 'active' : i === index + 1 ? 'next' : 'future';
    });

    if (userInitiated) {
      root.classList.remove('journey-transition');
      void root.offsetWidth;
      root.classList.add('journey-transition');
    }

    window.dispatchEvent(new CustomEvent('4planet:nature-journey-scene', {
      detail: { nodeId: node.id, index, state: root.dataset.sceneState }
    }));
  };

  window.NatureJourneyEngine = { applyScene };
})();
