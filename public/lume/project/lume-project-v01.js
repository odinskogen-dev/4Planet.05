(() => {
  const root = document.getElementById('lume-project');
  const sceneRoot = document.getElementById('scene-root');
  const counter = document.getElementById('stage-counter');
  const controllerTitle = document.getElementById('controller-title');
  const truthState = document.getElementById('truth-state');
  const truthBoundary = document.getElementById('truth-boundary');
  if (!root || !sceneRoot) return;

  const scenes = [
    {
      id: 'identity', kicker: 'SPECIES / ORCA', title: 'Meet one life.',
      subtitle: 'Orcinus orca becomes the entry point — then LUME expands outward into relationships, place and evidence.',
      meta: ['CANONICAL TAXON · GBIF 2440483', 'LUME RENDER · NOT LIVE ANIMAL', 'OCE4N_'], truth: 'KNOWN IDENTITY · POPULATION REMAINS UNSPECIFIED', boundary: 'IMMERSIVE LEARNING REPRESENTATION · NOT LIVE TRACKING',
      visual: () => `<div class="orca-outline" aria-label="Luminous schematic orca form"><svg viewBox="0 0 720 440" role="img" aria-label="LUME outline of an orca"><path class="orca-pulse" d="M77 241 C141 157 236 129 352 153 C439 105 548 92 642 140 C598 164 569 194 548 226 C578 244 607 270 630 306 C544 308 468 285 416 255 C339 290 259 298 188 274 C146 301 109 329 63 344 C82 298 88 271 77 241Z"/><path class="orca-body" d="M77 241 C141 157 236 129 352 153 C439 105 548 92 642 140 C598 164 569 194 548 226 C578 244 607 270 630 306 C544 308 468 285 416 255 C339 290 259 298 188 274 C146 301 109 329 63 344 C82 298 88 271 77 241Z"/><path class="orca-detail" d="M178 204 C240 171 324 171 397 191 M189 274 C245 249 310 239 416 255 M352 153 C337 114 350 82 382 52 C393 99 400 128 397 191 M548 226 C591 214 630 215 671 230 M113 227 C94 214 78 196 66 174"/><path class="orca-detail" d="M250 185 C272 193 282 211 279 232 C257 225 245 207 250 185Z M490 172 C515 173 533 184 544 203"/></svg></div>`
    },
    {
      id: 'dependency', kicker: 'LIVING SYSTEMS / DEPENDENCY', title: 'Follow what it depends on.',
      subtitle: 'Prey, culture and foraging strategy are population-specific. The projection shows relationships without flattening them into one universal diet.',
      meta: ['PREY ≠ UNIVERSAL', 'RELATIONSHIPS ARE SOURCE-BOUNDED', 'JOURNEY ENGINE'], truth: 'KNOWN + INTERPRETED RELATIONSHIPS STAY DISTINCT', boundary: 'NO SINGLE POPULATION CLAIM TRANSFERRED TO THE SPECIES',
      visual: () => `<div class="node-field"><svg viewBox="0 0 500 500" role="img" aria-label="Relationship network around an orca"><path class="node-line" d="M250 250 L95 120 M250 250 L405 125 M250 250 L78 355 M250 250 L420 350"/><circle class="node-circle" cx="250" cy="250" r="72"/><circle class="node-circle" cx="95" cy="120" r="38"/><circle class="node-circle" cx="405" cy="125" r="38"/><circle class="node-circle" cx="78" cy="355" r="38"/><circle class="node-circle" cx="420" cy="350" r="38"/><text class="node-label" x="225" y="255">ORCA</text><text class="node-label" x="65" y="124">PREY</text><text class="node-label" x="373" y="129">CULTURE</text><text class="node-label" x="43" y="359">PLACE</text><text class="node-label" x="389" y="354">FORAGING</text></svg></div>`
    },
    {
      id: 'place', kicker: 'ATLAS / ECOSYSTEM', title: 'Project the place.',
      subtitle: 'England → Bay of Biscay → Spain becomes a wall-sized context surface for the ORCA survey pilot geography.',
      meta: ['BAY OF BISCAY', 'PARTNER-PROPOSED PILOT GEOGRAPHY', 'OSPAR REGION IV · ICES JCDP'], truth: 'INTERPRETED PILOT CONTEXT · EXACT ROUTE TO VERIFY', boundary: 'PILOT CORRIDOR ≠ ORCA MIGRATION TRACK · MAP IS SCHEMATIC',
      visual: () => `<div class="biscay-map"><svg viewBox="0 0 360 280" role="img" aria-label="Schematic England to Spain pilot corridor across the Bay of Biscay"><path class="coast" d="M222 8 C205 33 202 57 217 78 C230 98 226 119 207 137 C188 155 183 176 192 194 C204 217 213 235 200 272"/><path class="coast" d="M66 9 C82 33 82 51 69 69 C56 87 64 105 83 115 C104 126 112 147 100 164 C87 184 78 205 93 226 C104 242 107 259 98 278"/><path class="shelf" d="M197 92 C169 107 151 127 148 154 C145 184 158 211 182 228"/><path class="route" d="M102 48 C144 73 172 104 180 139 C188 171 181 201 164 231"/><circle class="map-node" cx="102" cy="48" r="4"/><circle class="map-node" cx="180" cy="139" r="5"/><circle class="map-node" cx="164" cy="231" r="4"/><text class="map-label" x="83" y="34">ENGLAND</text><text class="map-label" x="193" y="135">FRANCE</text><text class="map-label" x="131" y="252">SPAIN</text><text class="map-title" x="112" y="149">BAY OF BISCAY</text><text class="map-boundary" x="112" y="164">PILOT CORRIDOR · SCHEMATIC</text></svg></div>`
    },
    {
      id: 'atlas', kicker: 'ATLAS / PLANETARY CONTEXT', title: 'Pull back to the planet.',
      subtitle: 'The same journey can hand the room into ATLAS: species records, ocean conditions, sources and places — one shared spatial model.',
      meta: ['ONE PLANET MODEL', 'SOURCE-AWARE RECORDS', 'FREE EXPLORE HANDOFF'], truth: 'SOURCE RECORDS ≠ POPULATION · RECORDS ≠ LIVE POSITIONS', boundary: 'ATLAS OUTPUT PREVIEW · DATA LAYERS ARE NOT SIMULATED HERE',
      visual: () => `<div class="atlas-orb" aria-label="Stylised LUME globe"><div class="atlas-meridian"></div><span class="atlas-point"></span><span class="atlas-point"></span><span class="atlas-point"></span><span class="atlas-point"></span><span class="atlas-point"></span></div>`
    },
    {
      id: 'pressure', kicker: 'PRESSURE / SOUND', title: 'Make the invisible visible.',
      subtitle: 'Underwater noise and vessel interaction can become spatial signals around the animal — while evidence and population boundaries stay visible.',
      meta: ['UNDERWATER NOISE', 'VESSEL INTERACTION', 'POPULATION + PLACE BOUNDARIES'], truth: 'PRESSURE PATHWAY · SOURCE REVIEW REQUIRED PER PUBLIC CLAIM', boundary: 'VISUALISATION IS EXPLANATORY · NOT A MEASUREMENT FEED',
      visual: () => `<div class="waveform"><svg viewBox="0 0 720 320" role="img" aria-label="Luminous acoustic wave visualisation"><path class="wave" d="M0 165 C35 165 42 124 70 124 C102 124 106 209 138 209 C172 209 178 89 211 89 C247 89 251 240 287 240 C323 240 330 117 362 117 C399 117 405 192 441 192 C476 192 485 146 516 146 C549 146 558 173 588 173 C620 173 632 153 720 153"/><path class="wave wave-danger" d="M0 190 C52 190 68 182 104 182 C145 182 160 198 198 198 C236 198 248 167 286 167 C330 167 344 214 385 214 C428 214 442 131 482 131 C525 131 539 204 580 204 C624 204 643 174 720 174"/></svg></div>`
    },
    {
      id: 'response', kicker: 'RESPONSE / ACTION', title: 'From understanding to response.',
      subtitle: 'The projected story ends by separating what we know, who can act, and what can be followed or funded when a real pathway exists.',
      meta: ['SPECIFICITY BEFORE ACTION', 'ACTORS + SOLUTIONS', 'IMPACT ONLY WHEN REAL'], truth: 'RESPONSE IS CONTEXTUAL · NO UNIVERSAL FIX CLAIMED', boundary: 'PROTO 01 DOES NOT CLAIM PARTNER DELIVERY OR ECOLOGICAL OUTCOME',
      visual: () => `<div class="response-stack"><div class="response-row"><span class="response-index">01</span><strong>Understand the population.</strong><span>SPECIES + SOURCES</span></div><div class="response-row"><span class="response-index">02</span><strong>Understand the place.</strong><span>ATLAS + ECOSYSTEM</span></div><div class="response-row"><span class="response-index">03</span><strong>Find the responsible response.</strong><span>SOLUTIONS + ACTORS</span></div><div class="response-row"><span class="response-index">04</span><strong>Prove what happened.</strong><span>IMPACT / WHEN REAL</span></div></div>`
    }
  ];

  let sceneIndex = 0;
  let calibrating = false;

  const clampScene = value => Math.max(0, Math.min(scenes.length - 1, value));
  const parseScene = () => {
    const params = new URLSearchParams(location.search);
    const raw = Number(params.get('scene'));
    return Number.isFinite(raw) ? clampScene(raw) : 0;
  };
  const parseMode = () => {
    const value = new URLSearchParams(location.search).get('mode');
    return value === 'wall' ? 'wall' : 'presenter';
  };

  function sceneMarkup(scene) {
    return `<div class="scene-layout scene-enter"><section class="scene-copy"><div class="scene-kicker">${scene.kicker}</div><h1 class="scene-title">${scene.title}</h1><p class="scene-subtitle">${scene.subtitle}</p><div class="scene-meta">${scene.meta.map(item => `<span>${item}</span>`).join('')}</div></section><div class="scene-visual">${scene.visual()}</div></div>`;
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set('scene', String(sceneIndex));
    url.searchParams.set('mode', root.dataset.mode || 'presenter');
    history.replaceState({}, '', url);
  }

  function render(index, { updateUrl = true } = {}) {
    sceneIndex = clampScene(index);
    const scene = scenes[sceneIndex];
    root.dataset.scene = String(sceneIndex);
    root.dataset.sceneId = scene.id;
    sceneRoot.innerHTML = sceneMarkup(scene);
    counter.textContent = `${String(sceneIndex + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    controllerTitle.textContent = scene.kicker.split('/')[0].trim();
    truthState.textContent = scene.truth;
    truthBoundary.textContent = scene.boundary;
    if (updateUrl) syncUrl();
    window.dispatchEvent(new CustomEvent('4planet:lume-project-scene', { detail: { scene: scene.id, index: sceneIndex } }));
  }

  function setMode(mode) {
    root.dataset.mode = mode === 'wall' ? 'wall' : 'presenter';
    const modeButton = root.querySelector('[data-action="mode"]');
    if (modeButton) modeButton.textContent = root.dataset.mode === 'wall' ? 'PRES' : 'WALL';
    syncUrl();
  }

  function toggleCalibration() {
    calibrating = !calibrating;
    root.dataset.calibrating = calibrating ? 'true' : 'false';
    root.querySelector('.lume-calibration')?.setAttribute('aria-hidden', calibrating ? 'false' : 'true');
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await root.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch (_) {}
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'next') render(sceneIndex + 1);
    if (action === 'prev') render(sceneIndex - 1);
    if (action === 'mode') setMode(root.dataset.mode === 'wall' ? 'presenter' : 'wall');
    if (action === 'calibrate') toggleCalibration();
    if (action === 'fullscreen') toggleFullscreen();
  });

  document.addEventListener('keydown', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); render(sceneIndex + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); render(sceneIndex - 1); }
    if (event.key.toLowerCase() === 'p') setMode(root.dataset.mode === 'wall' ? 'presenter' : 'wall');
    if (event.key.toLowerCase() === 'c') toggleCalibration();
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key === 'Escape' && calibrating) toggleCalibration();
  });

  let touchStartX = null;
  root.querySelector('.lume-stage')?.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') touchStartX = event.clientX; });
  root.querySelector('.lume-stage')?.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch' || touchStartX == null) return;
    const delta = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 54) render(sceneIndex + (delta < 0 ? 1 : -1));
  });

  sceneIndex = parseScene();
  root.dataset.mode = parseMode();
  render(sceneIndex, { updateUrl: false });
  setMode(root.dataset.mode);
})();
