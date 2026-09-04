(() => {
  const BISCAY = {
    id: 'ecosystem:bay-of-biscay',
    title: 'Bay of Biscay',
    corridor: 'ENGLAND → BAY OF BISCAY → SPAIN',
    status: 'PARTNER-PROPOSED PILOT GEOGRAPHY · EXACT SURVEY ROUTE TO VERIFY',
    sourceNote: 'ORCA meeting context + OSPAR / ICES ecosystem context',
    truthBoundary: 'PILOT CORRIDOR ≠ ORCA MIGRATION TRACK · MAP IS A SCHEMATIC CONTEXT VIEW',
    species: [
      ['ORCA', 'Orcinus orca'],
      ['COMMON DOLPHIN', 'Delphinus delphis'],
      ['PILOT WHALE', 'Globicephala melas'],
      ['FIN WHALE', 'Balaenoptera physalus'],
      ["CUVIER'S BEAKED WHALE", 'Ziphius cavirostris']
    ],
    habitats: ['CONTINENTAL SHELF', 'SHELF EDGE / SLOPE', 'DEEP OCEAN'],
    sources: [
      ['OSPAR REGION IV', 'https://www.ospar.org/convention/the-north-east-atlantic/iv'],
      ['ICES JCDP', 'https://cetaceans.ices.dk/inventory']
    ]
  };

  const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  function mapMarkup() {
    return `
      <svg class="biscay-gold-map" viewBox="0 0 360 280" role="img" aria-label="Schematic England to Spain pilot corridor across the Bay of Biscay">
        <defs>
          <linearGradient id="biscaySea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="rgba(141,232,255,.10)"/>
            <stop offset="1" stop-color="rgba(141,232,255,.01)"/>
          </linearGradient>
          <filter id="biscayGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect x="0" y="0" width="360" height="280" fill="url(#biscaySea)"/>
        <path class="biscay-coast" d="M222 8 C205 33 202 57 217 78 C230 98 226 119 207 137 C188 155 183 176 192 194 C204 217 213 235 200 272"/>
        <path class="biscay-coast biscay-coast--west" d="M66 9 C82 33 82 51 69 69 C56 87 64 105 83 115 C104 126 112 147 100 164 C87 184 78 205 93 226 C104 242 107 259 98 278"/>
        <path class="biscay-shelf" d="M197 92 C169 107 151 127 148 154 C145 184 158 211 182 228"/>
        <path class="biscay-route" d="M102 48 C144 73 172 104 180 139 C188 171 181 201 164 231"/>
        <circle class="biscay-node" cx="102" cy="48" r="4"/>
        <circle class="biscay-node" cx="180" cy="139" r="5"/>
        <circle class="biscay-node" cx="164" cy="231" r="4"/>
        <text x="83" y="34">ENGLAND</text>
        <text x="193" y="135">FRANCE</text>
        <text x="131" y="252">SPAIN</text>
        <text class="biscay-map-title" x="112" y="149">BAY OF BISCAY</text>
        <text class="biscay-map-note" x="112" y="164">PILOT CORRIDOR · SCHEMATIC</text>
      </svg>`;
  }

  function installCard(root) {
    const stage = root?.querySelector('.nature-stage');
    if (!stage || stage.querySelector('.biscay-gold-card')) return;
    const card = document.createElement('section');
    card.className = 'biscay-gold-card';
    card.dataset.ecosystem = BISCAY.id;
    card.setAttribute('aria-label', 'Bay of Biscay ecosystem pilot context');
    card.innerHTML = `
      <div class="biscay-gold-card__header">
        <div>
          <span class="biscay-gold-card__kicker">ECOSYSTEM_ GOLD · PILOT CONTEXT</span>
          <h2>${BISCAY.title}</h2>
          <p>${BISCAY.corridor}</p>
        </div>
        <button class="biscay-gold-card__toggle" type="button" aria-expanded="false">EXPLORE ECOSYSTEM</button>
      </div>
      <div class="biscay-gold-card__status">${BISCAY.status}</div>
      <div class="biscay-gold-card__body">
        <div class="biscay-gold-card__map">${mapMarkup()}</div>
        <div class="biscay-gold-card__context">
          <div class="biscay-gold-card__habitats">${BISCAY.habitats.map(item => `<span>${item}</span>`).join('')}</div>
          <div class="biscay-gold-card__species" aria-label="Selected Bay of Biscay species">${BISCAY.species.map(([common, scientific]) => `<article><strong>${common}</strong><em>${scientific}</em></article>`).join('')}</div>
          <div class="biscay-gold-card__sources">${BISCAY.sources.map(([label,url]) => `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`).join('')}</div>
          <p class="biscay-gold-card__boundary">${BISCAY.truthBoundary}</p>
        </div>
      </div>`;
    stage.appendChild(card);

    const toggle = card.querySelector('.biscay-gold-card__toggle');
    toggle?.addEventListener('click', () => {
      const expanded = card.dataset.expanded === 'true';
      card.dataset.expanded = expanded ? 'false' : 'true';
      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      toggle.textContent = expanded ? 'EXPLORE ECOSYSTEM' : 'CLOSE ECOSYSTEM';
      window.dispatchEvent(new CustomEvent('4planet:orca-ecosystem-card', { detail: { ecosystem: BISCAY.id, expanded: !expanded } }));
    });
  }

  function syncCard(root, detail = {}) {
    const card = root?.querySelector('.biscay-gold-card');
    if (!card) return;
    const state = detail.state || root.dataset.orcaLumeScene || root.dataset.lightLensScene || root.dataset.sceneState || 'identity';
    const visible = state === 'habitat' || card.dataset.expanded === 'true';
    card.dataset.visible = visible ? 'true' : 'false';
    card.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (!reducedMotion() && state === 'habitat') card.dataset.arrival = String(Date.now());
  }

  function install(root) {
    if (!root || root.dataset.biscayGoldInstalled === 'true') return;
    root.dataset.biscayGoldInstalled = 'true';
    installCard(root);
    syncCard(root);
    window.addEventListener('4planet:nature-journey-scene', event => requestAnimationFrame(() => syncCard(root, event.detail || {})));
    root.addEventListener('4planet:light-lens-change', () => requestAnimationFrame(() => syncCard(root)));
  }

  window.addEventListener('DOMContentLoaded', () => install(document.getElementById('browser-experience')), { once: true });
  window.OrcaBiscayGold20 = { install, installCard, syncCard, ecosystem: BISCAY };
})();
