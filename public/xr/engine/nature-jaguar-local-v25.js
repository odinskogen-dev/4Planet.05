import * as THREE from 'three';

const root = document.getElementById('browser-experience');
const proxy = window.JaguarEarProxyV25;
if (!root || !proxy?.payload) throw new Error('[4PLANET JAGUAR] local Ear proxy payload missing');

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (v, target, amount) => v + (target - v) * amount;
const identityScene = () => root.dataset.sceneState === 'identity' || root.dataset.cinematicScene === 'identity';
const runtimeBudget = () => root.dataset.runtimeBudget || (window.innerWidth <= 760 ? 'lite' : 'balanced');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let host, renderer, scene, camera, group, subject, wire;
let frame = 0;
let ready = false;
let active = false;
let phase = 'dormant';
let phaseStarted = performance.now();
let reveal = 0;
let dragging = false;
let pointerX = 0;
let userYaw = 0;
let targetUserYaw = 0;
let manualMode = 'rest';
let manualStarted = 0;
let hoverEngaged = false;
let lastRenderAt = 0;

const frameInterval = () => runtimeBudget() === 'full' ? 1000 / 40 : runtimeBudget() === 'balanced' ? 1000 / 30 : 1000 / 24;
const pixelRatio = () => {
  const dpr = window.devicePixelRatio || 1;
  if (runtimeBudget() === 'full') return Math.min(dpr, 1.15);
  if (runtimeBudget() === 'balanced') return Math.min(dpr, 1);
  return Math.min(dpr, .85);
};

function decodeProxy() {
  const raw = atob(proxy.payload);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  const view = new DataView(bytes.buffer);
  let o = 0;
  const vertexCount = view.getUint16(o, true); o += 2;
  const faceCount = view.getUint16(o, true); o += 2;
  const min = [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)]; o += 12;
  const max = [view.getFloat32(o, true), view.getFloat32(o + 4, true), view.getFloat32(o + 8, true)]; o += 12;
  const span = max.map((v, i) => Math.max(1e-9, v - min[i]));
  const positions = new Float32Array(vertexCount * 3);
  for (let i = 0; i < positions.length; i++) {
    const axis = i % 3;
    positions[i] = min[axis] + (view.getUint16(o, true) / 65535) * span[axis];
    o += 2;
  }
  const colors = new Float32Array(vertexCount * 3);
  for (let i = 0; i < colors.length; i++) colors[i] = bytes[o++] / 255;
  const indices = new Uint16Array(faceCount * 3);
  for (let i = 0; i < indices.length; i++) { indices[i] = view.getUint16(o, true); o += 2; }
  return { vertexCount, faceCount, positions, colors, indices };
}

function ensureHost() {
  if (host) return host;
  host = document.createElement('section');
  host.className = 'nature-3d-subject nature-3d-subject--v25';
  host.dataset.visible = 'false';
  host.dataset.ready = 'false';
  host.dataset.phase = 'dormant';
  host.setAttribute('aria-label', 'Interactive Jaguar 3D presentation model by Ear.Rodriguez — not a live animal');
  host.innerHTML = `
    <div class="nature-3d-subject__halo" aria-hidden="true"></div>
    <div class="nature-3d-subject__depth" aria-hidden="true"></div>
    <div class="nature-3d-subject__viewport"></div>
    <div class="nature-3d-subject__scan" aria-hidden="true"></div>
    <div class="nature-3d-subject__gesture"><b>DRAG TO TURN</b><span>LOCAL 3D · EAR.RODRIGUEZ · CC BY 4.0</span></div>
    <div class="nature-3d-subject__controls">
      <button type="button" data-jaguar-action="observe">LOOK AT ME</button>
      <button type="button" data-jaguar-action="move">MOVE</button>
    </div>`;
  root.appendChild(host);

  host.addEventListener('pointerdown', (event) => {
    if (!ready || !active || event.target.closest('button')) return;
    dragging = true;
    pointerX = event.clientX;
    host.dataset.dragging = 'true';
    host.setPointerCapture?.(event.pointerId);
  });
  host.addEventListener('pointermove', (event) => {
    if (!dragging || !active) return;
    const delta = event.clientX - pointerX;
    pointerX = event.clientX;
    targetUserYaw = clamp(targetUserYaw + delta * .006, -.58, .58);
  });
  const endDrag = (event) => {
    dragging = false;
    host.dataset.dragging = 'false';
    try { host.releasePointerCapture?.(event.pointerId); } catch { /* noop */ }
  };
  host.addEventListener('pointerup', endDrag);
  host.addEventListener('pointercancel', endDrag);
  host.addEventListener('pointerenter', () => { hoverEngaged = true; root.dataset.jaguarAttention = 'visitor'; });
  host.addEventListener('pointerleave', () => { hoverEngaged = false; if (manualMode === 'rest') root.dataset.jaguarAttention = 'rest'; });
  host.querySelector('[data-jaguar-action="observe"]')?.addEventListener('click', (event) => { event.stopPropagation(); trigger('observe'); });
  host.querySelector('[data-jaguar-action="move"]')?.addEventListener('click', (event) => { event.stopPropagation(); trigger('move'); });
  return host;
}

function trigger(mode) {
  if (!ready || !active) return;
  manualMode = mode;
  manualStarted = performance.now();
  root.dataset.jaguarAttention = mode === 'move' ? 'motion' : 'visitor';
}

function fitObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  object.position.set(-center.x, -center.y - size.y * .03, -center.z);
  object.scale.setScalar(4.35 / longest);
}

function makeScene() {
  ensureHost();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(window.innerWidth <= 760 ? 27 : 24, 1, .01, 100);
  camera.position.set(0, .08, 6.0);
  camera.lookAt(0, .02, 0);

  const viewport = host.querySelector('.nature-3d-subject__viewport');
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: runtimeBudget() === 'full' && window.innerWidth > 760, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatio());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xd7ead8, 0x010402, 1.42));
  const key = new THREE.DirectionalLight(0xffd49a, 3.35); key.position.set(-4.8, 5.8, 5.4); scene.add(key);
  const canopy = new THREE.DirectionalLight(0x55dd78, 1.18); canopy.position.set(4.4, 4.2, -2.5); scene.add(canopy);
  const rim = new THREE.DirectionalLight(0x5a7794, .48); rim.position.set(-2.2, .4, -4.5); scene.add(rim);

  const decoded = decodeProxy();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(decoded.positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(decoded.colors, 3));
  geometry.setIndex(new THREE.BufferAttribute(decoded.indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .82, metalness: 0, side: THREE.DoubleSide });
  subject = new THREE.Mesh(geometry, material);
  subject.frustumCulled = true;
  fitObject(subject);

  const wireGeometry = geometry.clone();
  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x3ae86f, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  wire = new THREE.Mesh(wireGeometry, wireMaterial);
  wire.position.copy(subject.position);
  wire.scale.copy(subject.scale);
  wire.visible = false;

  group = new THREE.Group();
  group.add(subject);
  group.add(wire);
  scene.add(group);

  ready = true;
  host.dataset.ready = 'true';
  host.dataset.assetSource = 'ear-rodriguez-local-proxy-v25';
  root.dataset.jaguar3d = 'local-proxy-ready';
  root.dataset.jaguar3dSource = 'ear-rodriguez-jaguar';
  root.dataset.jaguar3dProxy = `${decoded.vertexCount}v-${decoded.faceCount}f`;
  root.dataset.jaguarMotionCapability = 'interactive-procedural-presence';
  resize();
}

function resize() {
  if (!renderer || !camera || !host) return;
  const viewport = host.querySelector('.nature-3d-subject__viewport');
  const width = Math.max(1, viewport.clientWidth || host.clientWidth);
  const height = Math.max(1, viewport.clientHeight || host.clientHeight);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function phasePose(time) {
  const elapsed = Math.max(0, time - phaseStarted);
  const duration = { emerge: 1500, walk: 2200, stop: 650, breathe: 1700, observe: 1800, reveal: 2200 }[phase] || 1000;
  const t = reduced() ? 1 : clamp(elapsed / duration, 0, 1);
  const smooth = t * t * (3 - 2 * t);
  const p = { x: 0, y: 0, z: 0, yaw: Math.PI / 2, scale: 1 };
  if (phase === 'emerge') { p.x = THREE.MathUtils.lerp(.8, .26, smooth); p.z = THREE.MathUtils.lerp(-.55, -.08, smooth); p.scale = THREE.MathUtils.lerp(.92, .99, smooth); }
  else if (phase === 'walk') { p.x = THREE.MathUtils.lerp(.26, 0, smooth); p.z = THREE.MathUtils.lerp(-.08, .02, smooth); p.y = Math.sin(t * Math.PI * 5) * .008; }
  else if (phase === 'observe') { p.yaw -= .22 * smooth; }
  else if (['breathe','reveal','hold'].includes(phase)) { p.scale = 1 + Math.sin(time * .0015) * .006; p.y = Math.sin(time * .00105) * .007; }

  const manualAge = time - manualStarted;
  if (manualMode === 'observe') {
    const mt = clamp(manualAge / 1350, 0, 1);
    p.yaw -= Math.sin(mt * Math.PI) * .34;
    p.z += Math.sin(mt * Math.PI) * .08;
    if (manualAge > 1600) { manualMode = 'rest'; root.dataset.jaguarAttention = hoverEngaged ? 'visitor' : 'rest'; }
  } else if (manualMode === 'move') {
    const mt = clamp(manualAge / 2400, 0, 1);
    p.x += Math.sin(mt * Math.PI * 2) * .14;
    p.z += Math.sin(mt * Math.PI) * .38;
    p.y += Math.abs(Math.sin(mt * Math.PI * 6)) * .012;
    p.scale *= 1 + Math.sin(mt * Math.PI) * .045;
    if (manualAge > 2650) { manualMode = 'rest'; root.dataset.jaguarAttention = hoverEngaged ? 'visitor' : 'rest'; }
  } else if (hoverEngaged && !dragging) {
    p.yaw -= .045;
  }
  return p;
}

function tick(time) {
  frame = 0;
  if (!active || !ready || !renderer || !identityScene() || document.hidden) return;
  if (lastRenderAt && time - lastRenderAt < frameInterval()) { frame = requestAnimationFrame(tick); return; }
  lastRenderAt = time;
  const p = phasePose(time);
  userYaw = damp(userYaw, targetUserYaw, dragging ? .18 : .07);
  group.position.set(p.x, p.y, p.z);
  group.rotation.y = p.yaw + userYaw;
  group.scale.setScalar(p.scale);
  camera.position.z = damp(camera.position.z, (phase === 'observe' || manualMode === 'observe') ? 5.68 : 6.0, .05);
  camera.lookAt(0, .02, 0);
  renderer.render(scene, camera);
  frame = requestAnimationFrame(tick);
}

function show() {
  if (!ready || !identityScene()) return;
  active = true;
  host.dataset.visible = 'true';
  root.dataset.jaguar3dActive = 'true';
  root.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'true');
  resize();
  if (!frame) frame = requestAnimationFrame(tick);
}

function hide() {
  active = false;
  if (host) host.dataset.visible = 'false';
  root.dataset.jaguar3dActive = 'false';
  root.querySelector('.nature-subject')?.setAttribute('data-three-replaced', 'false');
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

function setPhase(nextPhase) {
  phase = nextPhase || 'dormant';
  phaseStarted = performance.now();
  if (host) host.dataset.phase = phase;
  root.dataset.jaguarActorPhase = phase;
  if (phase === 'dormant') hide(); else if (identityScene()) show();
}

function setReveal(progress) {
  reveal = clamp(Number(progress || 0), 0, 1);
  if (!host || !wire) return;
  host.style.setProperty('--jaguar-reveal', reveal.toFixed(4));
  const enableWire = window.innerWidth > 760 && runtimeBudget() !== 'lite' && reveal > .005;
  wire.visible = enableWire;
  wire.material.opacity = enableWire ? Math.min(.46, reveal * .46) : 0;
}

function boot() {
  ensureHost();
  makeScene();
  const register = () => window.NatureCreatureV19?.registerActor?.({ setPhase, setReveal });
  if (window.NatureCreatureV19) register(); else window.addEventListener('4planet:nature-creature-ready', register, { once: true });
  window.addEventListener('4planet:nature-browser-enter', () => { if (identityScene()) show(); });
  window.addEventListener('4planet:nature-journey-scene', (event) => Number(event.detail?.index || 0) === 0 ? show() : hide());
  window.addEventListener('4planet:nature-runtime-budget', () => { resize(); if (active && !frame) frame = requestAnimationFrame(tick); });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? hide() : (root.dataset.entered === 'true' && identityScene() ? show() : undefined));
  window.addEventListener('pagehide', hide, { once: true });
  root.dataset.jaguarLocalRuntime = 'v25';
}

boot();