import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';

const root = document.getElementById('jaguar-experience');
const stage = document.getElementById('three-stage');
const status = document.getElementById('runtime-status');
const creatureState = document.getElementById('creature-state');
const controls = document.getElementById('controls');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width:760px)').matches;

let renderer;
let scene;
let camera;
let rig;
let subject;
let wire;
let frame = 0;
let dragging = false;
let pointerX = 0;
let targetYaw = 0;
let yaw = 0;
let targetX = 0;
let x = 0;
let recoveryReady = false;
let lume = false;

function decodeProxy() {
  const proxy = window.JaguarEarProxyV25;
  if (!proxy?.payload) throw new Error('Ear.Rodriguez recovery proxy payload missing');
  const raw = atob(proxy.payload);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  let o = 0;
  const vertexCount = view.getUint16(o, true); o += 2;
  const faceCount = view.getUint16(o, true); o += 2;
  const min = [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)]; o += 12;
  const max = [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)]; o += 12;
  const span = max.map((v, i) => Math.max(1e-9, v - min[i]));
  const positions = new Float32Array(vertexCount * 3);
  for (let i = 0; i < positions.length; i += 1) {
    const axis = i % 3;
    positions[i] = min[axis] + (view.getUint16(o, true) / 65535) * span[axis];
    o += 2;
  }
  const colors = new Float32Array(vertexCount * 3);
  for (let i = 0; i < colors.length; i += 1) colors[i] = bytes[o++] / 255;
  const indices = new Uint16Array(faceCount * 3);
  for (let i = 0; i < indices.length; i += 1) { indices[i] = view.getUint16(o, true); o += 2; }
  return { positions, colors, indices, source: proxy.source, licence: proxy.licence, sourceSha256: proxy.sourceSha256 };
}

function fitObject(object) {
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  object.position.set(-center.x, -center.y - size.y * 0.04, -center.z);
  object.scale.setScalar((isMobile ? 3.5 : 4.05) / longest);
  object.rotation.y = isMobile ? 0.1 : 0.18;
}

function resize() {
  if (!renderer || !camera || !stage) return;
  const w = Math.max(1, stage.clientWidth);
  const h = Math.max(1, stage.clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function render(time = 0) {
  frame = 0;
  if (!recoveryReady || document.hidden) return;
  yaw += (targetYaw - yaw) * 0.08;
  x += (targetX - x) * 0.08;
  rig.rotation.y = yaw;
  rig.position.x = x;
  if (!reducedMotion) rig.position.y = Math.sin(time * 0.00135) * 0.006;
  wire.visible = lume;
  renderer.render(scene, camera);
  frame = requestAnimationFrame(render);
}

function startRender() {
  if (!frame && recoveryReady && !document.hidden) frame = requestAnimationFrame(render);
}

function initialiseRecovery() {
  if (recoveryReady || !root || !stage) return;
  try {
    const decoded = decodeProxy();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07110b, isMobile ? 0.07 : 0.055);
    camera = new THREE.PerspectiveCamera(isMobile ? 30 : 27, 1, 0.05, 100);
    camera.position.set(isMobile ? 0.2 : 0.42, 0.62, isMobile ? 6.3 : 5.9);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1 : 1.2));
    stage.replaceChildren(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xcfe8d2, 0x030604, 1.2));
    const key = new THREE.DirectionalLight(0xffe1b0, 2.8); key.position.set(-4, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x43e678, 0.9); rim.position.set(4, 2.8, -2.5); scene.add(rim);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(decoded.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(decoded.colors, 3));
    geometry.setIndex(new THREE.BufferAttribute(decoded.indices, 1));
    geometry.computeVertexNormals();

    subject = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0, side: THREE.DoubleSide }));
    fitObject(subject);
    wire = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial({ color: 0x39e66c, wireframe: true, transparent: true, opacity: 0.36, depthWrite: false, blending: THREE.AdditiveBlending }));
    wire.position.copy(subject.position);
    wire.scale.copy(subject.scale);
    wire.rotation.copy(subject.rotation);
    wire.visible = false;

    rig = new THREE.Group();
    rig.add(subject, wire);
    scene.add(rig);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(4.4, 48), new THREE.MeshStandardMaterial({ color: 0x10180f, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.04;
    scene.add(ground);

    recoveryReady = true;
    root.dataset.jaguar3d = 'ready';
    root.dataset.jaguar3dSource = 'ear-proxy-v25-recovery';
    root.dataset.jaguar3dSourceSha256 = decoded.sourceSha256 || 'unknown';
    if (status) status.textContent = 'LOCAL JAGUAR · RECOVERY PROXY';
    if (creatureState) creatureState.textContent = 'Source-derived Ear.Rodriguez local 3D recovery proxy is active. Presentation media, not ecological evidence.';
    resize();
    startRender();
  } catch (error) {
    console.error('[4PLANET JAGUAR RECOVERY]', error);
    root.dataset.jaguar3d = 'failed';
    root.dataset.jaguar3dRecovery = 'failed';
  }
}

const observer = new MutationObserver(() => {
  if (root?.dataset.jaguar3d === 'failed' && root?.dataset.entered === 'true') initialiseRecovery();
});
if (root) observer.observe(root, { attributes: true, attributeFilter: ['data-jaguar3d', 'data-entered'] });

controls?.addEventListener('click', (event) => {
  if (!recoveryReady) return;
  const action = event.target?.dataset?.action;
  if (action === 'look') {
    targetYaw = -0.09;
    if (creatureState) creatureState.textContent = 'The jaguar shifts its attention toward you.';
  }
  if (action === 'move') {
    targetX = targetX === 0 ? 0.42 : 0;
    if (creatureState) creatureState.textContent = 'The jaguar moves through the clearing.';
  }
  if (action === 'lume') {
    lume = !lume;
    root.dataset.lume = String(lume);
    if (creatureState) creatureState.textContent = lume ? 'LUME reveals source-derived presentation geometry.' : 'Living creature presentation view restored.';
  }
  startRender();
});

stage?.addEventListener('pointerdown', (event) => {
  if (!recoveryReady) return;
  dragging = true;
  pointerX = event.clientX;
  stage.setPointerCapture?.(event.pointerId);
});
stage?.addEventListener('pointermove', (event) => {
  if (!dragging || !recoveryReady) return;
  const dx = event.clientX - pointerX;
  pointerX = event.clientX;
  targetYaw = Math.max(-0.72, Math.min(0.72, targetYaw + dx * 0.0055));
});
stage?.addEventListener('pointerup', (event) => {
  dragging = false;
  try { stage.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
});
stage?.addEventListener('pointercancel', () => { dragging = false; });

addEventListener('resize', resize, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
  else startRender();
});
