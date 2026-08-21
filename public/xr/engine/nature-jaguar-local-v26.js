import * as THREE from 'three';

const root = document.getElementById('browser-experience');
const proxy = window.JaguarEarProxyV25;
if (!root || !proxy?.payload) throw new Error('[4PLANET JAGUAR] local Ear proxy payload missing');

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (v, target, amount) => v + (target - v) * amount;
const identityScene = () => root.dataset.sceneState === 'identity' || root.dataset.cinematicScene === 'identity';
const runtimeBudget = () => root.dataset.runtimeBudget || (window.innerWidth <= 760 ? 'lite' : 'balanced');
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => window.innerWidth <= 760;

let host, renderer, scene, camera, creature, subject, wire, room, leafMass, motes;
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
  if (runtimeBudget() === 'full') return Math.min(dpr, 1.2);
  if (runtimeBudget() === 'balanced') return Math.min(dpr, 1);
  return Math.min(dpr, .82);
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
  host.className = 'nature-3d-subject nature-3d-subject--v25 nature-3d-subject--room-v26';
  host.dataset.visible = 'false';
  host.dataset.ready = 'false';
  host.dataset.phase = 'dormant';
  host.setAttribute('aria-label', 'Interactive Jaguar 3D presentation model by Ear.Rodriguez in an authored jungle room — not a live animal or live habitat');
  host.innerHTML = `
    <div class="nature-3d-subject__halo" aria-hidden="true"></div>
    <div class="nature-3d-subject__depth" aria-hidden="true"></div>
    <div class="nature-3d-subject__viewport"></div>
    <div class="nature-3d-subject__scan" aria-hidden="true"></div>
    <div class="nature-3d-subject__gesture"><b>DRAG TO TURN</b><span>EAR.RODRIGUEZ · CC BY 4.0 · AUTHORED JUNGLE ROOM</span></div>
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
    targetUserYaw = clamp(targetUserYaw + delta * .006, -.56, .56);
  });
  const endDrag = (event) => {
    dragging = false;
    host.dataset.dragging = 'false';
    try { host.releasePointerCapture?.(event.pointerId); } catch { /* no-op */ }
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
  object.scale.setScalar((mobile() ? 4.0 : 4.45) / longest);
}

function makeJungleRoom() {
  room = new THREE.Group();
  room.name = 'jaguar-authored-jungle-room-v26';

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x07130b, roughness: .96, metalness: 0 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7.2, 48), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(.1, -1.38, -.65);
  room.add(ground);

  const wetMat = new THREE.MeshPhysicalMaterial({ color: 0x102d25, roughness: .28, metalness: .02, transparent: true, opacity: .58, clearcoat: .45, clearcoatRoughness: .34 });
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.3), wetMat);
  wet.rotation.x = -Math.PI / 2;
  wet.rotation.z = -.12;
  wet.position.set(1.1, -1.365, -.05);
  room.add(wet);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .45, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1.55, .54, 1);
  shadow.position.set(.15, -1.345, .12);
  room.add(shadow);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x0e1a10, roughness: 1, metalness: 0 });
  const trunkGeo = new THREE.CylinderGeometry(.13, .24, 7.2, 7, 1, false);
  const trunkCount = runtimeBudget() === 'lite' ? 5 : 10;
  const trunkLayout = [
    [-4.2,1.9,-2.7,.92],[-3.15,1.9,-4.8,1.18],[-4.6,1.9,-6.2,.8],
    [4.05,1.9,-3.1,1.12],[3.15,1.9,-5.4,.86],[4.8,1.9,-6.4,1.28],
    [-2.0,1.9,-7.4,.74],[2.0,1.9,-7.7,.72],[-5.1,1.9,-8,.76],[5.2,1.9,-8.2,.84]
  ];
  for (let i = 0; i < trunkCount; i++) {
    const [x,y,z,s] = trunkLayout[i];
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x,y,z);
    trunk.scale.setScalar(s);
    trunk.rotation.z = (i % 2 ? -.045 : .035);
    room.add(trunk);
  }

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x172219, roughness: .94, metalness: 0 });
  const rockGeo = new THREE.DodecahedronGeometry(.34, 0);
  const rockLayout = [[-2.2,-1.15,.4,.8],[2.45,-1.16,-.1,.95],[3.1,-1.2,-1.1,.62],[-3.0,-1.18,-1.0,.66]];
  rockLayout.slice(0, runtimeBudget() === 'lite' ? 2 : 4).forEach(([x,y,z,s], i) => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(x,y,z);
    rock.scale.set(s, s * .62, s * 1.2);
    rock.rotation.set(.2 * i,.3 * i,.1);
    room.add(rock);
  });

  const leafGeo = new THREE.IcosahedronGeometry(.21, 0);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x123c20, roughness: .9, metalness: 0 });
  const leafCount = runtimeBudget() === 'lite' ? 28 : runtimeBudget() === 'balanced' ? 58 : 86;
  leafMass = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < leafCount; i++) {
    const side = i % 2 ? 1 : -1;
    const depth = 1.8 + (i % 13) * .46;
    dummy.position.set(side * (2.7 + (i % 7) * .34), -.72 + (i % 5) * .28, -depth);
    dummy.rotation.set((i % 3) * .6, (i * .71) % Math.PI, (i % 5) * .38);
    const s = .52 + (i % 6) * .09;
    dummy.scale.set(s * 1.6, s * .42, s);
    dummy.updateMatrix();
    leafMass.setMatrixAt(i, dummy.matrix);
  }
  room.add(leafMass);

  const moteCount = runtimeBudget() === 'lite' ? 18 : 54;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3] = (Math.random() - .5) * 8;
    motePositions[i * 3 + 1] = -.8 + Math.random() * 5.5;
    motePositions[i * 3 + 2] = -1 - Math.random() * 8;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0xb8d7b9, size: .025, transparent: true, opacity: .34, depthWrite: false }));
  room.add(motes);

  scene.add(room);
  root.dataset.jaguarRoom = 'three-v26';
}

function makeScene() {
  ensureHost();
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07110b, mobile() ? .075 : .055);
  camera = new THREE.PerspectiveCamera(mobile() ? 28 : 24, 1, .01, 100);
  camera.position.set(0, .06, mobile() ? 6.2 : 6.0);
  camera.lookAt(0, -.02, 0);

  const viewport = host.querySelector('.nature-3d-subject__viewport');
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: runtimeBudget() === 'full' && !mobile(), powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatio());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xbfd3c1, 0x020503, 1.05));
  const canopyKey = new THREE.DirectionalLight(0xffdda2, 3.15); canopyKey.position.set(-4.8, 6.3, 4.8); scene.add(canopyKey);
  const greenFill = new THREE.DirectionalLight(0x49d66f, .9); greenFill.position.set(4.2, 3.8, -2.8); scene.add(greenFill);
  const coolRim = new THREE.DirectionalLight(0x6f91a2, .42); coolRim.position.set(-2.4, .7, -4.8); scene.add(coolRim);
  const pool = new THREE.PointLight(0xa8e6b5, .65, 9, 2); pool.position.set(1.8, .25, 1.8); scene.add(pool);

  makeJungleRoom();

  const decoded = decodeProxy();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(decoded.positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(decoded.colors, 3));
  geometry.setIndex(new THREE.BufferAttribute(decoded.indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .76, metalness: 0, side: THREE.DoubleSide });
  subject = new THREE.Mesh(geometry, material);
  subject.frustumCulled = true;
  fitObject(subject);

  const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x3ae86f, wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  wire = new THREE.Mesh(geometry.clone(), wireMaterial);
  wire.position.copy(subject.position);
  wire.scale.copy(subject.scale);
  wire.visible = false;

  creature = new THREE.Group();
  creature.add(subject);
  creature.add(wire);
  creature.position.y = -.16;
  scene.add(creature);

  ready = true;
  host.dataset.ready = 'true';
  host.dataset.assetSource = 'ear-rodriguez-local-proxy-v25';
  root.dataset.jaguar3d = 'local-room-ready';
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
  if (phase === 'emerge') { p.x = THREE.MathUtils.lerp(.72, .24, smooth); p.z = THREE.MathUtils.lerp(-.52, -.06, smooth); p.scale = THREE.MathUtils.lerp(.93, .995, smooth); }
  else if (phase === 'walk') { p.x = THREE.MathUtils.lerp(.24, 0, smooth); p.z = THREE.MathUtils.lerp(-.06, .02, smooth); p.y = Math.sin(t * Math.PI * 5) * .006; }
  else if (phase === 'observe') { p.yaw -= .22 * smooth; }
  else if (['breathe','reveal','hold'].includes(phase)) { p.scale = 1 + Math.sin(time * .00145) * .005; p.y = Math.sin(time * .001) * .006; }

  const manualAge = time - manualStarted;
  if (manualMode === 'observe') {
    const mt = clamp(manualAge / 1350, 0, 1);
    p.yaw -= Math.sin(mt * Math.PI) * .32;
    p.z += Math.sin(mt * Math.PI) * .07;
    if (manualAge > 1600) { manualMode = 'rest'; root.dataset.jaguarAttention = hoverEngaged ? 'visitor' : 'rest'; }
  } else if (manualMode === 'move') {
    const mt = clamp(manualAge / 2300, 0, 1);
    p.x += Math.sin(mt * Math.PI * 2) * .12;
    p.z += Math.sin(mt * Math.PI) * .26;
    p.y += Math.abs(Math.sin(mt * Math.PI * 4)) * .008;
    if (manualAge > 2500) { manualMode = 'rest'; root.dataset.jaguarAttention = hoverEngaged ? 'visitor' : 'rest'; }
  } else if (hoverEngaged && !dragging) {
    p.yaw -= .04;
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
  creature.position.set(p.x, -.16 + p.y, p.z);
  creature.rotation.y = p.yaw + userYaw;
  creature.scale.setScalar(p.scale);

  if (!reduced() && room) {
    room.rotation.y = Math.sin(time * .00011) * .004;
    if (leafMass) leafMass.rotation.y = Math.sin(time * .00016) * .006;
    if (motes) {
      motes.rotation.y += .00016;
      motes.position.y = Math.sin(time * .00024) * .035;
    }
  }

  const targetZ = (phase === 'observe' || manualMode === 'observe') ? (mobile() ? 5.86 : 5.62) : (mobile() ? 6.2 : 6.0);
  camera.position.z = damp(camera.position.z, targetZ, .05);
  camera.position.x = reduced() ? 0 : Math.sin(time * .00014) * .018;
  camera.lookAt(0, -.03, 0);
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
  const enableWire = !mobile() && runtimeBudget() !== 'lite' && reveal > .005;
  wire.visible = enableWire;
  wire.material.opacity = enableWire ? Math.min(.34, reveal * .34) : 0;
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
  root.dataset.jaguarLocalRuntime = 'v26';
  root.dataset.jaguarMaster = 'pr79-agent-jaguar-journey-v11';
}

boot();
