(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // Presentation-only choreography. Scientific truth remains upstream in
  // canonical SPECIES / Living Systems / relationship feeds.
  const DEFAULT_SCENE = {
    state: 'life', backgroundX: 50, backgroundY: 50, backgroundScale: 1.14,
    detailOpacity: 0.22, subjectX: 50, subjectY: 50, subjectScale: 1,
    subjectOpacity: 1, worldBrightness: 0.79, worldSaturation: 1.06, veilOpacity: 1,
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
    if (userInitiated) pulse(root);
  };

  const pulse = (root) => {
    root.classList.remove('journey-transition');
    void root.offsetWidth;
    root.classList.add('journey-transition');
  };

  const applyChapter = ({ root, chapter, index, total, userInitiated = false }) => {
    if (!root || !chapter) return;
    const camera = chapter.camera || {};
    const subject = chapter.subject || {};
    const sceneState = String(chapter.sceneType || 'PLACE').toLowerCase();

    root.dataset.sceneState = sceneState;
    root.dataset.journeyIndex = String(index);
    root.dataset.journeyChapter = chapter.id;
    root.dataset.transitionType = chapter.transition?.type || 'crossfade';
    root.style.setProperty('--scene-bg-x', `${clamp(camera.x ?? 50, 0, 100)}%`);
    root.style.setProperty('--scene-bg-y', `${clamp(camera.y ?? 50, 0, 100)}%`);
    root.style.setProperty('--scene-bg-scale', String(clamp(camera.scale ?? 1.08, 1, 1.5)));
    root.style.setProperty('--scene-subject-x', `${clamp(subject.x ?? 50, 0, 100)}%`);
    root.style.setProperty('--scene-subject-y', `${clamp(subject.y ?? 50, 0, 100)}%`);
    root.style.setProperty('--scene-subject-scale', String(clamp(subject.scale ?? 1, 0.35, 1.8)));
    root.style.setProperty('--scene-subject-opacity', subject.visible === false ? '0' : '1');

    const hud = root.querySelector('.nature-journey-hud');
    if (hud) {
      const stage = hud.querySelector('.nature-journey-hud__stage');
      const title = hud.querySelector('.nature-journey-hud__title');
      const cue = hud.querySelector('.nature-journey-hud__cue');
      const next = hud.querySelector('.nature-journey-hud__next');
      const back = hud.querySelector('.nature-journey-hud__back');
      const evidence = hud.querySelector('.nature-journey-hud__evidence');
      if (stage) stage.textContent = `${String(index).padStart(2, '0')} / ${String(total - 1).padStart(2, '0')} · ${chapter.stageLabel}`;
      if (title) title.textContent = chapter.title;
      if (cue) cue.textContent = chapter.cue || 'FOLLOW THE LIVING SYSTEM';
      if (next) next.textContent = index >= total - 1 ? 'CONTINUE TO SOLUTIONS →' : `TRAVEL FORWARD · ${String(index + 1).padStart(2, '0')} →`;
      if (back) back.disabled = index <= 0;
      if (evidence) evidence.disabled = !chapter.nodes?.length;
      hud.dataset.visible = 'true';
    }

    const route = root.querySelector('.nature-journey-route');
    if (route) {
      const primary = chapter.nodeLayout?.[0] || { x: 50, y: 50 };
      route.style.setProperty('--route-x', `${primary.x}%`);
      route.style.setProperty('--route-y', `${primary.y}%`);
      route.dataset.state = sceneState;
    }

    if (userInitiated) pulse(root);
    window.dispatchEvent(new CustomEvent('4planet:nature-journey-chapter', {
      detail: { chapterId: chapter.id, index, state: sceneState, audio: chapter.audio || null }
    }));
  };

  window.NatureJourneyEngine = { applyScene, applyChapter };
})();
