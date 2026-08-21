import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const FALLBACK_BASE = 'https://raw.githubusercontent.com/kristenmarcinek/game615-spring2023-06/728230086493b1f1cee6a410d0a8ea7c0991f6ff/exercise06/Assets/Models/Jaguar/';
const FALLBACK_PAGE = 'https://poly.pizza/m/4fb-oMr2uUF';
const root = document.getElementById('browser-experience');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fullTier = () => root?.dataset.performanceTier !== 'lite';
const identityScene = () => root?.dataset.sceneState === 'identity' || root?.dataset.cinematicScene === 'identity';
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
let baseScale = 1;
let sourceState = 'none';
let sourcePage = FALLBACK_PAGE;
let lastTime = performance.now();

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
    <div class="nature-3d-subject__meta"><span class="nature-3d-subject__source-state">CREATURE ASSET · LOADING</span><a class="nature-3d-subject__source" target="_blank" rel="noreferrer">SOURCE</a></div>
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
    targetUserYaw = clamp(targetUserYaw + delta * .0045, -.5, .5);
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

const resize = () => {
  if (!host || !renderer || !camera) return;
  const viewport = host.querySelector('.nature-3d-subject__viewport');
  const width = Math.max(1, viewport?.clientWidth || host.clientWidth);
  const height = Math.max(1, viewport?.clientHeight || host.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const makeScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(24, 1, .01, 100);
  camera.position.set(0, .08, 6.2);
  camera.lookAt(0, .02, 0);
  const viewport = host.querySelector('.nature-3d-subject__viewport');
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xdfffe7, 0x020804, 2.15));
  const sun = new THREE.DirectionalLight(0xfff0ce, 4.4);
  sun.position.set(-4.5, 5.8, 5.2);
  scene.add(sun);
  const canopy = new THREE.DirectionalLight(0x52ff8a, 1.45);
  canopy.position.set(4.6, 3.2, -3.4);
  scene.add(canopy);
  const fill = new THREE.DirectionalLight(0x4b739a, .72);
  fill.position.set(-2, -1.4, 4.2);
  scene.add(fill);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();
};

const makeWire = (object) => {
  const clone = object.clone(true);
  clone.traverse((child) => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshBasicMaterial({
      color: 0x3ae86f,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  });
  return clone;
};

const fit = (object) => {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  baseScale = 4.25 / longest;
  object.position.set(-center.x, -center.y + size.y * .015, -center.z);
  object.scale.setScalar(baseScale);
};

const buildActions = () => {
  actions = new Map();
  if (!mixer) return;
  animationClips.forEach((clip) => actions.set(clip.name.toLowerCase(), mixer.clipAction(clip)));
};

const findAction = (...tokens) => {
  for (const [name, action] of actions) {
    if (tokens.some((token) => name.includes(token))) return action;
  }
  return null;
};

let playingAction = null;
const playAnimationForPhase = (nextPhase) => {
  if (!mixer || !actions.size) return;
  const desired = nextPhase === 'walk' || nextPhase === 'emerge'
    ? findAction('walk', 'prowl', 'move')
    : nextPhase === 'observe'
      ? findAction('look', 'alert', 'idle')
      : findAction('idle', 'breath', 'stand');
  if (!desired || desired === playingAction) return;
  desired.reset().fadeIn(.32).play();
  playingAction?.fadeOut(.32);
  playingAction = desired;
};

const loadPreferred = async (config) => {
  const preferred = config?.actor?.preferred;
  if (!preferred?.runtimePath || preferred.binaryState !== 'CONTROLLED_LOCAL') return null;
  const gltf = await new GLTFLoader().loadAsync(preferred.runtimePath);
  animationClips = Array.isArray(gltf.animations) ? gltf.animations : [];
  sourceState = preferred.id || 'preferred-local-glb';
  sourcePage = preferred.sourcePage || '#';
  return gltf.scene;
};

const loadFallback = async (config) => {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => /Jaguar_BaseColor\.png(?:\?|$)/i.test(url) ? `${FALLBACK_BASE}Jaguar_BaseColor.png` : url);
  const mtl = new MTLLoader(manager);
  mtl.setResourcePath(FALLBACK_BASE);
  const materials = await mtl.loadAsync(`${FALLBACK_BASE}Jaguar.mtl`);
  materials.preload();
  const obj = new OBJLoader(manager);
  obj.setMaterials(materials);
  const object = await obj.loadAsync(`${FALLBACK_BASE}Jaguar.obj`);
  sourceState = config?.actor?.fallback?.id || 'poly-google-jaguar-study';
  sourcePage = config?.actor?.fallback?.sourcePage || FALLBACK_PAGE;
  return object;
};

const updateSourceMeta = () => {
  if (!host) return;
  const label = host.querySelector('.nature-3d-subject__source-state');
  const link = host.querySelector('.nature-3d-subject__source');
  const preferred = window.NatureCreatureV19?.getConfig?.()?.actor?.preferred;
  if (label) {
    label.textContent = sourceState === preferred?.id
      ? 'PREFERRED FREE CREATURE · CONTROLLED LOCAL GLB'
      : 'CONTROLLED 3D FALLBACK · PREFERRED CREATURE INGEST GATED';
  }
  if (link) {
    link.href = sourcePage;
    link.textContent = sourceState === preferred?.id ? 'ASSET SOURCE' : 'FALLBACK · CC BY 3.0';
  }
};

const loadModel = async () => {
  if (!root || loading || ready || !fullTier()) return;
  loading = true;
  ensureHost();
  host.dataset.loading = 'true';
  root.dataset.jaguar3d = 'loading';
  try {
    makeScene();
    const config = window.NatureCreatureV19?.getConfig?.();
    let object = null;
    try { object = await loadPreferred(config); } catch (error) { console.warn('[4PLANET JAGUAR] preferred GLB failed closed; using controlled fallback', error); }
    if (!object) object = await loadFallback(config);
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
        if ('roughness' in material) material.roughness = Math.max(.48, material.roughness || .48);
        if ('metalness' in material) material.metalness = 0;
        if ('shininess' in material) material.shininess = 9;
      });
    });
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
    }
    ready = true;
    loading = false;
    host.dataset.ready = 'true';
    host.dataset.loading = 'false';
    host.dataset.assetSource = sourceState;
    root.dataset.jaguar3d = 'ready';
    root.dataset.jaguar3dSource = sourceState;
    updateSourceMeta();
    show();
  } catch (error) {
    loading = false;
    root.dataset.jaguar3d = 'failed';
    host.dataset.loading = 'false';
    host.dataset.ready = 'false';
    console.warn('[4PLANET JAGUAR] 3D creature layer failed closed; controlled photographic subject remains.', error);
  }
};

const show = () => {
  if (!ready || !host || !identityScene()) return;
  active = true;
  host.dataset.visible = 'true';
  host.style.setProperty('display', 'block', 'important');
  host.style.setProperty('visibility', 'visible', 'important');
  host.style.setProperty('opacity', '1', 'important');
  root.dataset.jaguar3dActive = 'true';
  root.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'true');
  resize();
  if (!frame) {
    lastTime = performance.now();
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
  if (phase === 'dormant') {
    hide();
    return;
  }
  if (identityScene()) {
    loadModel().then(() => show());
  }
};

const setReveal = (progress) => {
  reveal = clamp(Number(progress || 0), 0, 1);
  if (host) host.style.setProperty('--jaguar-reveal', reveal.toFixed(4));
};

const phasePose = (time) => {
  const elapsed = Math.max(0, time - phaseStarted);
  const duration = {
    emerge: 1900,
    walk: 3300,
    stop: 850,
    breathe: 1850,
    observe: 2200,
    reveal: 2800
  }[phase] || 1000;
  const t = reduced() ? 1 : clamp(elapsed / duration, 0, 1);
  const smooth = t * t * (3 - 2 * t);
  const pose = { x: 0, y: 0, z: 0, yaw: Math.PI / 2, scale: 1, bob: 0 };

  if (phase === 'emerge') {
    pose.x = lerp(1.35, .72, smooth);
    pose.z = lerp(-.7, -.42, smooth);
    pose.scale = lerp(.82, .9, smooth);
    pose.bob = Math.sin(time * .008) * .018;
  } else if (phase === 'walk') {
    pose.x = lerp(.72, 0, smooth);
    pose.z = lerp(-.42, 0, smooth);
    pose.scale = lerp(.9, 1, smooth);
    pose.bob = Math.sin(time * .0095) * .028;
  } else if (phase === 'stop') {
    pose.x = lerp(.03, 0, smooth);
    pose.bob = Math.sin(time * .006) * .01 * (1 - smooth);
  } else if (phase === 'breathe' || phase === 'reveal' || phase === 'hold') {
    pose.scale = 1 + Math.sin(time * .00155) * .008;
    pose.y = Math.sin(time * .00115) * .009;
  } else if (phase === 'observe') {
    pose.yaw = lerp(Math.PI / 2, Math.PI / 2 - .28, smooth);
    pose.scale = 1 + Math.sin(time * .0016) * .006;
  }
  return pose;
};

const tick = (time) => {
  frame = 0;
  if (!active || !ready || !renderer || !scene || !camera || !group || !identityScene()) return;
  const dt = Math.min(.05, Math.max(.001, (time - lastTime) / 1000));
  lastTime = time;
  mixer?.update(dt);

  const pose = phasePose(time);
  userYaw = damp(userYaw, targetUserYaw, dragging ? .16 : .07);
  group.position.set(pose.x, pose.y + pose.bob, pose.z);
  group.rotation.y = pose.yaw + userYaw;
  group.scale.setScalar(pose.scale);

  if (wire) {
    wire.visible = reveal > .005;
    wire.traverse((child) => {
      if (child.isMesh && child.material) child.material.opacity = Math.min(.62, reveal * .62);
    });
  }
  if (subject) {
    subject.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material || !('opacity' in material)) return;
        material.opacity = 1;
      });
    });
  }

  const cinematic = phase === 'observe' || phase === 'reveal' || phase === 'hold';
  camera.position.z = damp(camera.position.z, cinematic ? 5.85 : 6.15, .025);
  camera.position.x = Math.sin(time * .00019) * .025;
  camera.lookAt(0, .025, 0);
  renderer.render(scene, camera);
  frame = requestAnimationFrame(tick);
};

if (root) {
  ensureHost();
  root.dataset.jaguar3dMode = 'creature-choreography-v19';
  root.dataset.jaguar3dActive = 'false';
  const register = () => window.NatureCreatureV19?.registerActor?.({ setPhase, setReveal });
  if (window.NatureCreatureV19) register();
  else window.addEventListener('4planet:nature-creature-ready', register, { once: true });
  window.addEventListener('4planet:nature-browser-enter', () => {
    if (fullTier() && identityScene()) loadModel().then(() => show());
  });
  window.addEventListener('4planet:nature-journey-scene', (event) => {
    if (Number(event.detail?.index || 0) !== 0 || !identityScene()) hide();
  });
  window.addEventListener('pagehide', () => {
    hide();
    resizeObserver?.disconnect();
    mixer?.stopAllAction();
    renderer?.dispose();
  }, { once: true });
}
