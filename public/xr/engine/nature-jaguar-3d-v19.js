import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const root = document.getElementById('browser-experience');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const identityScene = () => root?.dataset.sceneState === 'identity' || root?.dataset.cinematicScene === 'identity';
const runtimeBudget = () => root?.dataset.runtimeBudget || (root?.dataset.performanceTier === 'lite' ? 'lite' : 'full');
const modelAllowed = () => runtimeBudget() !== 'lite';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (value, target, amount) => value + (target - value) * amount;

let host;
let renderer;
let scene;
let camera;
let group;
let subject;
let wire;
let mixer;
let animationClips = [];
let actions = new Map();
let playingAction = null;
let wireMaterials = [];
let resizeObserver;
let frame = 0;
let ready = false;
let loading = false;
let active = false;
let phase = 'dormant';
let phaseStarted = performance.now();
let reveal = 0;
let dragging = false;
let pointerX = 0;
let userYaw = 0;
let targetUserYaw = 0;
let sourceState = 'none';
let sourcePage = '#';
let lastRenderAt = 0;
let lastMixerAt = performance.now();
let hasLocomotion = false;
let headBone = null;
let headBaseY = 0;
let headBaseX = 0;

const renderInterval = () => runtimeBudget() === 'full' ? 1000 / 48 : 1000 / 30;
const rendererPixelRatio = () => {
  const dpr = window.devicePixelRatio || 1;
  return runtimeBudget() === 'full' ? Math.min(dpr, 1.25) : Math.min(dpr, 1);
};

const ensureHost = () => {
  if (!root || host) return host;
  host = document.createElement('section');
  host.className = 'nature-3d-subject nature-3d-subject--v19';
  host.dataset.visible = 'false';
  host.dataset.ready = 'false';
  host.dataset.phase = 'dormant';
  host.setAttribute('aria-label', 'Interactive Jaguar presentation model — not a live animal');
  host.innerHTML = `
    <div class="nature-3d-subject__halo" aria-hidden="true"></div>
    <div class="nature-3d-subject__depth" aria-hidden="true"></div>
    <div class="nature-3d-subject__viewport"></div>
    <div class="nature-3d-subject__scan" aria-hidden="true"></div>
    <div class="nature-3d-subject__gesture" aria-hidden="true"><b>DRAG TO TURN</b><span>LIVING CREATURE STUDY · BROWSER NATIVE</span></div>
    <div class="nature-3d-subject__meta"><span class="nature-3d-subject__source-state">EAR RODRIGUEZ JAGUAR · INGEST PENDING</span><a class="nature-3d-subject__source" target="_blank" rel="noreferrer">SOURCE</a></div>
    <div class="nature-3d-subject__loading">ASSEMBLING CREATURE LAYER…</div>`;
  root.appendChild(host);
  host.addEventListener('pointerdown', (event) => {
    if (!ready || !active) return;
    dragging = true;
    pointerX = event.clientX;
    host.setPointerCapture?.(event.pointerId);
    host.dataset.dragging = 'true';
  });
  host.addEventListener('pointermove', (event) => {
    if (!dragging || !active) return;
    const delta = event.clientX - pointerX;
    pointerX = event.clientX;
    targetUserYaw = clamp(targetUserYaw + delta * .004, -.42, .42);
  });
  const endDrag = (event) => {
    dragging = false;
    host.dataset.dragging = 'false';
    try { host.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
  };
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', endDrag);
  return host;
};

const updateSourceMeta = (config) => {
  if (!host) return;
  const preferred = config?.actor?.preferred;
  const label = host.querySelector('.nature-3d-subject__source-state');
  const link = host.querySelector('.nature-3d-subject__source');
  if (label) {
    label.textContent = ready
      ? 'EAR RODRIGUEZ JAGUAR · CONTROLLED LOCAL GLB'
      : 'EAR RODRIGUEZ JAGUAR · AUTHENTICATED INGEST PENDING';
  }
  if (link) {
    link.href = preferred?.sourcePage || '#';
    link.textContent = 'SKETCHFAB · CC ATTRIBUTION';
  }
};

const resize = () => {
  if (!host || !renderer || !camera) return;
  const viewport = host.querySelector('.nature-3d-subject__viewport');
  const width = Math.max(1, viewport?.clientWidth || host.clientWidth);
  const height = Math.max(1, viewport?.clientHeight || host.clientHeight);
  renderer.setPixelRatio(rendererPixelRatio());
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const makeScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(24, 1, .01, 100);
  camera.position.set(0, .08, 6.1);
  camera.lookAt(0, .02, 0);
  const viewport = host.querySelector('.nature-3d-subject__viewport');
  const antialias = runtimeBudget() === 'full' && (window.devicePixelRatio || 1) <= 1.35;
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias, powerPreference: 'high-performance' });
  renderer.setPixelRatio(rendererPixelRatio());
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xdfffe7, 0x020804, 1.8));
  const key = new THREE.DirectionalLight(0xffefcf, 3.4);
  key.position.set(-4.2, 5.2, 4.8);
  scene.add(key);
  const canopy = new THREE.DirectionalLight(0x52ff8a, 1.05);
  canopy.position.set(4.4, 3.1, -3.1);
  scene.add(canopy);
  const fill = new THREE.DirectionalLight(0x557c9f, .48);
  fill.position.set(-2, -1.2, 4);
  scene.add(fill);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();
};

const makeWire = (object) => {
  wireMaterials = [];
  const clone = object.clone(true);
  clone.traverse((child) => {
    if (!child.isMesh) return;
    const material = new THREE.MeshBasicMaterial({
      color: 0x3ae86f,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    child.material = material;
    wireMaterials.push(material);
  });
  clone.visible = false;
  return clone;
};

const fit = (object) => {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  const scale = 4.2 / longest;
  object.position.set(-center.x, -center.y + size.y * .015, -center.z);
  object.scale.setScalar(scale);
};

const findAction = (...tokens) => {
  for (const [name, action] of actions) {
    if (tokens.some((token) => name.includes(token))) return action;
  }
  return null;
};

const buildActions = () => {
  actions = new Map();
  if (!mixer) return;
  animationClips.forEach((clip) => actions.set(clip.name.toLowerCase(), mixer.clipAction(clip)));
  hasLocomotion = Boolean(findAction('walk', 'prowl', 'move'));
  if (root) root.dataset.jaguarMotionCapability = hasLocomotion ? 'animated-locomotion' : animationClips.length ? 'animated-no-walk' : 'pose-only';
};

const playAnimationForPhase = (nextPhase) => {
  if (!mixer || !actions.size) return;
  const desired = nextPhase === 'walk' || nextPhase === 'emerge'
    ? findAction('walk', 'prowl', 'move', 'idle')
    : nextPhase === 'observe'
      ? findAction('look', 'alert', 'idle', 'breath')
      : findAction('idle', 'breath', 'stand');
  if (!desired || desired === playingAction) return;
  desired.reset().fadeIn(.28).play();
  playingAction?.fadeOut(.28);
  playingAction = desired;
};

const detectReactiveBones = (object) => {
  headBone = null;
  object.traverse((child) => {
    if (!child.isBone || headBone) return;
    if (/(^|[_ .-])(head|neck)([_ .-]|$)/i.test(child.name || '')) headBone = child;
  });
  if (headBone) {
    headBaseY = headBone.rotation.y;
    headBaseX = headBone.rotation.x;
    if (root) root.dataset.jaguarReactiveHead = 'true';
  } else if (root) root.dataset.jaguarReactiveHead = 'false';
};

const prepareSubject = (object) => {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.frustumCulled = true;
    child.castShadow = false;
    child.receiveShadow = false;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!material) return;
      material.transparent = false;
      material.depthWrite = true;
      if ('roughness' in material) material.roughness = Math.max(.46, material.roughness || .46);
      if ('metalness' in material) material.metalness = 0;
    });
  });
  detectReactiveBones(object);
};

const loadPreferred = async (config) => {
  const preferred = config?.actor?.preferred;
  if (!preferred?.runtimePath || preferred.binaryState !== 'CONTROLLED_LOCAL') return null;
  const gltf = await new GLTFLoader().loadAsync(preferred.runtimePath);
  animationClips = Array.isArray(gltf.animations) ? gltf.animations : [];
  sourceState = preferred.id || 'ear-rodriguez-jaguar';
  sourcePage = preferred.sourcePage || '#';
  return gltf.scene;
};

const markPreferredPending = (config) => {
  ensureHost();
  const preferred = config?.actor?.preferred;
  sourceState = preferred?.id || 'ear-rodriguez-jaguar';
  sourcePage = preferred?.sourcePage || '#';
  if (root) {
    root.dataset.jaguar3d = 'preferred-pending';
    root.dataset.jaguar3dSource = sourceState;
    root.dataset.jaguar3dActive = 'false';
    root.dataset.jaguarMotionCapability = 'photo-fallback';
  }
  host.dataset.ready = 'false';
  host.dataset.visible = 'false';
  host.dataset.loading = 'false';
  updateSourceMeta(config);
};

const loadModel = async () => {
  if (!root || loading || ready || !modelAllowed()) return;
  const config = window.NatureCreatureV19?.getConfig?.();
  const preferred = config?.actor?.preferred;
  if (!preferred || preferred.binaryState !== 'CONTROLLED_LOCAL') {
    markPreferredPending(config);
    return;
  }

  loading = true;
  ensureHost();
  host.dataset.loading = 'true';
  root.dataset.jaguar3d = 'loading';
  try {
    makeScene();
    const object = await loadPreferred(config);
    if (!object) throw new Error('Preferred controlled Jaguar GLB unavailable');
    prepareSubject(object);
    fit(object);
    subject = object;
    wire = makeWire(object);
    group = new THREE.Group();
    group.add(subject);
    group.add(wire);
    scene.add(group);
    if (animationClips.length) {
      mixer = new THREE.AnimationMixer(subject);
      buildActions();
    } else if (root) {
      root.dataset.jaguarMotionCapability = 'pose-only';
    }
    ready = true;
    loading = false;
    host.dataset.ready = 'true';
    host.dataset.loading = 'false';
    host.dataset.assetSource = sourceState;
    root.dataset.jaguar3d = 'ready';
    root.dataset.jaguar3dSource = sourceState;
    updateSourceMeta(config);
    setReveal(reveal);
    show();
  } catch (error) {
    loading = false;
    root.dataset.jaguar3d = 'failed';
    host.dataset.loading = 'false';
    host.dataset.ready = 'false';
    console.warn('[4PLANET JAGUAR] preferred controlled GLB failed closed; photographic creature remains.', error);
  }
};

const show = () => {
  if (!ready || !host || !identityScene() || !modelAllowed()) return;
  active = true;
  host.dataset.visible = 'true';
  host.style.setProperty('display', 'block', 'important');
  host.style.setProperty('visibility', 'visible', 'important');
  host.style.setProperty('opacity', '1', 'important');
  host.style.setProperty('pointer-events', 'auto', 'important');
  root.dataset.jaguar3dActive = 'true';
  root.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'true');
  resize();
  if (!frame) {
    lastRenderAt = 0;
    lastMixerAt = performance.now();
    frame = requestAnimationFrame(tick);
  }
};

const hide = () => {
  active = false;
  if (host) {
    host.dataset.visible = 'false';
    host.style.setProperty('opacity', '0', 'important');
    host.style.setProperty('pointer-events', 'none', 'important');
  }
  if (root) root.dataset.jaguar3dActive = 'false';
  root?.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'false');
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
};

const setPhase = (nextPhase) => {
  phase = nextPhase || 'dormant';
  phaseStarted = performance.now();
  if (host) host.dataset.phase = phase;
  if (root) root.dataset.jaguarActorPhase = phase;
  playAnimationForPhase(phase);
  if (phase === 'dormant' || !modelAllowed()) {
    hide();
    return;
  }
  if (identityScene()) loadModel().then(() => show());
};

const setReveal = (progress) => {
  reveal = clamp(Number(progress || 0), 0, 1);
  if (host) host.style.setProperty('--jaguar-reveal', reveal.toFixed(4));
  if (wire) wire.visible = reveal > .005;
  const opacity = Math.min(.58, reveal * .58);
  for (const material of wireMaterials) material.opacity = opacity;
};

const phasePose = (time) => {
  const elapsed = Math.max(0, time - phaseStarted);
  const duration = {
    emerge: 1500,
    walk: 2200,
    stop: 650,
    breathe: 1700,
    observe: 1800,
    reveal: 2200
  }[phase] || 1000;
  const t = reduced() ? 1 : clamp(elapsed / duration, 0, 1);
  const smooth = t * t * (3 - 2 * t);
  const pose = { x: 0, y: 0, z: 0, yaw: Math.PI / 2, scale: 1, bob: 0 };

  if (phase === 'emerge') {
    pose.x = hasLocomotion ? lerp(.72, .35, smooth) : .08;
    pose.z = hasLocomotion ? lerp(-.42, -.2, smooth) : lerp(-.16, 0, smooth);
    pose.scale = lerp(.92, .98, smooth);
    pose.bob = hasLocomotion ? Math.sin(time * .008) * .012 : 0;
  } else if (phase === 'walk') {
    if (hasLocomotion) {
      pose.x = lerp(.35, 0, smooth);
      pose.z = lerp(-.2, 0, smooth);
      pose.bob = Math.sin(time * .009) * .018;
    } else {
      pose.scale = lerp(.98, 1, smooth);
      pose.z = lerp(-.05, 0, smooth);
    }
  } else if (phase === 'stop') {
    pose.x = lerp(.02, 0, smooth);
  } else if (phase === 'breathe' || phase === 'reveal' || phase === 'hold') {
    pose.scale = 1 + Math.sin(time * .00145) * .0045;
    pose.y = Math.sin(time * .00105) * .006;
  } else if (phase === 'observe') {
    pose.yaw = lerp(Math.PI / 2, Math.PI / 2 - .22, smooth);
    pose.scale = 1 + Math.sin(time * .0014) * .0035;
  }
  return pose;
};

const updateReactiveHead = (time) => {
  if (!headBone) return;
  const engaged = phase === 'observe' || phase === 'reveal' || phase === 'hold';
  const targetY = engaged ? headBaseY - .055 + Math.sin(time * .00055) * .018 : headBaseY;
  const targetX = engaged ? headBaseX + Math.sin(time * .00072) * .01 : headBaseX;
  headBone.rotation.y = damp(headBone.rotation.y, targetY, .08);
  headBone.rotation.x = damp(headBone.rotation.x, targetX, .08);
};

const tick = (time) => {
  frame = 0;
  if (!active || !ready || !renderer || !scene || !camera || !group || !identityScene() || document.hidden || !modelAllowed()) return;
  const interval = renderInterval();
  if (lastRenderAt && time - lastRenderAt < interval) {
    frame = requestAnimationFrame(tick);
    return;
  }
  lastRenderAt = time;
  const dt = Math.min(.05, Math.max(.001, (time - lastMixerAt) / 1000));
  lastMixerAt = time;
  mixer?.update(dt);

  const pose = phasePose(time);
  userYaw = damp(userYaw, targetUserYaw, dragging ? .15 : .065);
  group.position.set(pose.x, pose.y + pose.bob, pose.z);
  group.rotation.y = pose.yaw + userYaw;
  group.scale.setScalar(pose.scale);
  updateReactiveHead(time);

  const cinematic = phase === 'observe' || phase === 'reveal' || phase === 'hold';
  camera.position.z = damp(camera.position.z, cinematic ? 5.82 : 6.08, .035);
  camera.position.x = Math.sin(time * .00015) * .018;
  camera.lookAt(0, .025, 0);
  renderer.render(scene, camera);
  frame = requestAnimationFrame(tick);
};

const applyRuntimeBudget = () => {
  if (!root) return;
  if (runtimeBudget() === 'lite') {
    hide();
    return;
  }
  if (renderer) resize();
  if (ready && identityScene() && phase !== 'dormant') show();
};

if (root) {
  ensureHost();
  root.dataset.jaguar3dMode = 'creature-choreography-v19';
  root.dataset.jaguar3dActive = 'false';
  const register = () => window.NatureCreatureV19?.registerActor?.({ setPhase, setReveal });
  if (window.NatureCreatureV19) register();
  else window.addEventListener('4planet:nature-creature-ready', register, { once: true });
  window.addEventListener('4planet:nature-browser-enter', () => {
    if (modelAllowed() && identityScene()) loadModel().then(() => show());
  });
  window.addEventListener('4planet:nature-journey-scene', (event) => {
    if (Number(event.detail?.index || 0) !== 0 || !identityScene()) hide();
  });
  window.addEventListener('4planet:nature-runtime-budget', applyRuntimeBudget);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hide();
    else if (ready && identityScene() && phase !== 'dormant' && modelAllowed()) show();
  });
  window.addEventListener('pagehide', () => {
    hide();
    resizeObserver?.disconnect();
    mixer?.stopAllAction();
    for (const material of wireMaterials) material.dispose?.();
    renderer?.dispose();
  }, { once: true });
}
