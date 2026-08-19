const SOURCE_BASE = 'https://raw.githubusercontent.com/kristenmarcinek/game615-spring2023-06/728230086493b1f1cee6a410d0a8ea7c0991f6ff/exercise06/Assets/Models/Jaguar/';
const SOURCE_PAGE = 'https://poly.pizza/m/4fb-oMr2uUF';
const ATTRIBUTION = 'JAGUAR · POLY BY GOOGLE · CC BY 3.0 · VIA POLY PIZZA';

const root = document.getElementById('browser-experience');
let THREE;
let MTLLoader;
let OBJLoader;
let runtimePromise;
let host;
let renderer;
let scene;
let camera;
let model;
let frame = 0;
let ready = false;
let loading = false;
let active = false;
let dragging = false;
let pointerX = 0;
let yaw = Math.PI / 2;
let targetYaw = Math.PI / 2;
let baseScale = 1;
let basePosition = { x: 0, y: 0, z: 0 };
let resizeObserver;

const fullTier = () => root?.dataset.performanceTier !== 'lite';
const identityScene = () => root?.dataset.sceneState === 'identity' || root?.dataset.cinematicScene === 'identity';

const loadRuntime = () => {
  if (runtimePromise) return runtimePromise;
  runtimePromise = Promise.all([
    import('three'),
    import('three/addons/loaders/MTLLoader.js'),
    import('three/addons/loaders/OBJLoader.js')
  ]).then(([threeModule, mtlModule, objModule]) => {
    THREE = threeModule;
    MTLLoader = mtlModule.MTLLoader;
    OBJLoader = objModule.OBJLoader;
  });
  return runtimePromise;
};

const ensureHost = () => {
  if (!root || host) return host;
  host = document.createElement('div');
  host.className = 'nature-3d-subject';
  host.dataset.visible = 'false';
  host.dataset.ready = 'false';
  host.setAttribute('aria-label', 'Interactive 3D Jaguar study — stylised model, not a live animal');
  host.innerHTML = `
    <div class="nature-3d-subject__halo" aria-hidden="true"></div>
    <div class="nature-3d-subject__viewport"></div>
    <div class="nature-3d-subject__meta">
      <span>3D STUDY · DRAG TO TURN</span>
      <a href="${SOURCE_PAGE}" target="_blank" rel="noreferrer">${ATTRIBUTION}</a>
    </div>
    <div class="nature-3d-subject__loading">LOADING 3D JAGUAR…</div>`;
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
    targetYaw += delta * 0.007;
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

const fitModel = (object) => {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  baseScale = 3.75 / longest;
  object.scale.setScalar(baseScale);
  basePosition = {
    x: -center.x * baseScale,
    y: (-center.y + size.y * 0.03) * baseScale,
    z: -center.z * baseScale,
  };
  object.position.set(basePosition.x, basePosition.y, basePosition.z);
  object.rotation.y = yaw;
};

const makeScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(29, 1, 0.01, 100);
  camera.position.set(0, 0.05, 5.9);
  camera.lookAt(0, 0, 0);

  const viewport = host.querySelector('.nature-3d-subject__viewport');
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.appendChild(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xe7fff0, 0x152117, 2.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-3.5, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x73ff9a, 1.25);
  rim.position.set(4, 2.5, -3);
  scene.add(rim);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();
};

const loadModel = async () => {
  if (!root || !fullTier() || ready || loading || !identityScene()) return;
  loading = true;
  ensureHost();
  host.dataset.loading = 'true';
  root.dataset.jaguar3d = 'loading';

  try {
    await loadRuntime();
    makeScene();
    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      if (/Jaguar_BaseColor\.png(?:\?|$)/i.test(url)) return `${SOURCE_BASE}Jaguar_BaseColor.png`;
      return url;
    });

    const mtlLoader = new MTLLoader(manager);
    mtlLoader.setResourcePath(SOURCE_BASE);
    const materials = await mtlLoader.loadAsync(`${SOURCE_BASE}Jaguar.mtl`);
    materials.preload();

    const objLoader = new OBJLoader(manager);
    objLoader.setMaterials(materials);
    model = await objLoader.loadAsync(`${SOURCE_BASE}Jaguar.obj`);
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.frustumCulled = true;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((material) => {
        if (!material) return;
        material.transparent = false;
        material.depthWrite = true;
        if ('shininess' in material) material.shininess = 16;
      });
    });

    fitModel(model);
    scene.add(model);
    ready = true;
    loading = false;
    host.dataset.ready = 'true';
    host.dataset.loading = 'false';
    root.dataset.jaguar3d = 'ready';
    root.dataset.jaguar3dSource = 'poly-google-ccby3';
    if (active && identityScene()) show();
  } catch (error) {
    loading = false;
    root.dataset.jaguar3d = 'failed';
    host.dataset.loading = 'false';
    host.dataset.ready = 'false';
    console.warn('[4PLANET JOURNEY] 3D Jaguar failed closed; preserving controlled 2D species media.', error);
  }
};

const tick = (time) => {
  frame = 0;
  if (!active || !ready || !renderer || !scene || !camera || !model || !identityScene()) return;
  yaw += (targetYaw - yaw) * 0.07;
  model.rotation.y = yaw;
  const breath = 1 + Math.sin(time * 0.00155) * 0.006;
  model.scale.setScalar(baseScale * breath);
  model.position.set(basePosition.x, basePosition.y + Math.sin(time * 0.00125) * 0.012, basePosition.z);
  renderer.render(scene, camera);
  frame = requestAnimationFrame(tick);
};

const show = () => {
  if (!host || !ready || !identityScene()) return;
  active = true;
  host.dataset.visible = 'true';
  root.dataset.jaguar3dActive = 'true';
  root.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'true');
  if (!frame) frame = requestAnimationFrame(tick);
};

const hide = () => {
  active = false;
  if (host) host.dataset.visible = 'false';
  if (root) root.dataset.jaguar3dActive = 'false';
  root?.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'false');
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
};

const setFocus = async (isActive) => {
  if (!isActive) {
    hide();
    return;
  }
  if (!fullTier()) return;
  active = true;
  await loadModel();
  if (ready) show();
};

if (root) {
  ensureHost();
  window.addEventListener('4planet:nature-browser-enter', () => {
    if (!fullTier()) return;
    window.setTimeout(() => {
      if (identityScene()) loadModel();
    }, 950);
  });
  window.addEventListener('4planet:nature-journey-scene', (event) => {
    if (Number(event.detail?.index || 0) !== 0) hide();
  });
  window.addEventListener('4planet:nature-world-interaction', (event) => {
    if (event.detail?.action !== 'focus') return;
    setFocus(Boolean(event.detail?.active));
  });
  window.addEventListener('pagehide', () => {
    hide();
    resizeObserver?.disconnect();
    renderer?.dispose();
  }, { once: true });
}
