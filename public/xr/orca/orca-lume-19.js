(() => {
  const NOAA_ORCA = {
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Orcinus_orca_NOAA.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Orcinus_orca_NOAA.jpg',
    credit: 'NOAA',
    rights: 'PUBLIC DOMAIN',
    note: 'REAL ORCA PHOTO BASE · PROJECTION TREATMENT IS INTERPRETIVE'
  };

  /* Display-only intelligence labels are bounded summaries of the existing Orca GOLD
     Journey configuration. They do not create a second ecological truth source. */
  const INTEL = {
    identity: {
      kicker:'SPECIES INTELLIGENCE',
      primary:'Orcinus orca',
      secondary:'GBIF 2440483 · SPECIES IDENTITY',
      modules:[
        ['IDENTITY','KNOWN','SPECIES'],
        ['POPULATION / POD','UNKNOWN','NOT INFERRED'],
        ['MEDIA','PHOTO BASE','NOAA · PUBLIC DOMAIN']
      ]
    },
    dependency: {
      kicker:'PREY / DEPENDENCY',
      primary:'Diet depends on population.',
      secondary:'AN UNIDENTIFIED INDIVIDUAL ≠ A DIET CLAIM',
      modules:[
        ['PREY','POPULATION-SPECIFIC','KNOWN BOUNDARY'],
        ['FORAGING CULTURE','GROUPS DIFFER','CONTEXT'],
        ['INDIVIDUAL DIET','UNKNOWN','NOT INFERRED']
      ]
    },
    habitat: {
      kicker:'MOVEMENT / PLACE',
      primary:'Records are not a migration track.',
      secondary:'OCCURRENCE ≠ RANGE · ABUNDANCE · LIVE POSITION',
      modules:[
        ['REPORTED RECORD','SOURCE-BOUND','OBSERVATION'],
        ['MIGRATION / ROUTE','NOT INFERRED','NO FAKE TRACK'],
        ['LIVE LOCATION','UNKNOWN','NEVER IMPLIED']
      ]
    },
    pressure: {
      kicker:'ACOUSTIC / PRESSURE',
      primary:'The ocean can get louder.',
      secondary:'PRESSURE CATEGORY ≠ EXPOSURE LEVEL OR EFFECT',
      modules:[
        ['UNDERWATER NOISE','PRESSURE CLASS','POPULATION-SPECIFIC'],
        ['VESSEL TRAFFIC','INTERACTION','SOURCE-BOUND'],
        ['EXPOSURE / EFFECT','UNKNOWN','REQUIRES EVIDENCE']
      ]
    },
    response: {
      kicker:'RESPONSE INTELLIGENCE',
      primary:'Specificity before intervention.',
      secondary:'NO UNIVERSAL FIX · NO OUTCOME CLAIM',
      modules:[
        ['POPULATION','IDENTIFY','GATE'],
        ['ACTOR','VERIFY CAPACITY','GATE'],
        ['OUTCOME','NOT CLAIMED','EVIDENCE REQUIRED']
      ]
    }
  };

  function installPhotoBase(root) {
    const projection = root?.querySelector('.light-lens-projection');
    if (!projection || projection.querySelector('.orca-lume-photo')) return;

    const frame = document.createElement('figure');
    frame.className = 'orca-lume-photo';
    frame.innerHTML = `
      <img src="${NOAA_ORCA.src}" alt="" referrerpolicy="no-referrer" />
      <span class="orca-lume-photo__wash" aria-hidden="true"></span>
      <span class="orca-lume-photo__contour" aria-hidden="true"></span>
      <figcaption>
        <a href="${NOAA_ORCA.source}" target="_blank" rel="noreferrer">${NOAA_ORCA.credit} · ${NOAA_ORCA.rights}</a>
        <span>${NOAA_ORCA.note}</span>
      </figcaption>`;
    projection.prepend(frame);

    const vector = projection.querySelector('.light-lens-orca');
    if (vector) {
      vector.classList.add('orca-lume-wireframe');
      vector.setAttribute('aria-hidden', 'true');
    }

    root.dataset.orcaLumePhoto = 'noaa-public-domain';
  }

  function waveformMarkup() {
    return Array.from({length:28}, (_,i) => `<i style="--i:${i}" aria-hidden="true"></i>`).join('');
  }

  function installIntel(root) {
    const layer = root?.querySelector('.light-lens-layer');
    if (!layer || layer.querySelector('.orca-lume-intel')) return;

    const intel = document.createElement('aside');
    intel.className = 'orca-lume-intel';
    intel.setAttribute('aria-hidden','true');
    intel.innerHTML = `
      <div class="orca-lume-intel__header">
        <span class="orca-lume-intel__kicker">SPECIES INTELLIGENCE</span>
        <b class="orca-lume-intel__index">01 / 05</b>
      </div>
      <strong class="orca-lume-intel__primary">Orcinus orca</strong>
      <span class="orca-lume-intel__secondary">GBIF 2440483 · SPECIES IDENTITY</span>
      <div class="orca-lume-intel__modules"></div>
      <div class="orca-lume-acoustic">
        <div class="orca-lume-acoustic__meta"><span>ACOUSTIC SIGNAL</span><b>PROCEDURAL · NOT FIELD AUDIO</b></div>
        <div class="orca-lume-acoustic__wave">${waveformMarkup()}</div>
      </div>
    `;
    layer.appendChild(intel);

    const rail = document.createElement('div');
    rail.className = 'orca-lume-rail';
    rail.setAttribute('aria-hidden','true');
    rail.innerHTML = `
      <span data-lume-rail="identity">LIFE</span>
      <span data-lume-rail="dependency">PREY</span>
      <span data-lume-rail="habitat">MOVEMENT</span>
      <span data-lume-rail="pressure">PRESSURE</span>
      <span data-lume-rail="response">RESPONSE</span>
    `;
    layer.appendChild(rail);
  }

  function syncIntel(root, detail={}) {
    const state = detail.state || root.dataset.lightLensScene || root.dataset.sceneState || 'identity';
    const index = Number(detail.index ?? root.dataset.lightLensIndex ?? root.dataset.journeyIndex ?? 0);
    const config = INTEL[state] || INTEL.identity;
    const panel = root.querySelector('.orca-lume-intel');
    if (!panel) return;

    panel.querySelector('.orca-lume-intel__kicker').textContent = config.kicker;
    panel.querySelector('.orca-lume-intel__index').textContent = `${String(index + 1).padStart(2,'0')} / 05`;
    panel.querySelector('.orca-lume-intel__primary').textContent = config.primary;
    panel.querySelector('.orca-lume-intel__secondary').textContent = config.secondary;
    panel.querySelector('.orca-lume-intel__modules').innerHTML = config.modules.map(([label,value,stateLabel]) => `
      <div class="orca-lume-module">
        <span>${label}</span><strong>${value}</strong><small>${stateLabel}</small>
      </div>`).join('');

    root.querySelectorAll('[data-lume-rail]').forEach((node) => node.dataset.active = node.dataset.lumeRail === state ? 'true' : 'false');
    root.dataset.orcaLumeScene = state;
  }

  function install(root) {
    if (!root || root.dataset.orcaLumeInstalled === 'true') return;
    root.dataset.orcaLumeInstalled = 'true';
    installPhotoBase(root);
    installIntel(root);
    syncIntel(root);

    root.addEventListener('4planet:light-lens-change', () => {
      installPhotoBase(root);
      installIntel(root);
      syncIntel(root);
    });
    window.addEventListener('4planet:nature-journey-scene', (event) => requestAnimationFrame(() => {
      installPhotoBase(root);
      installIntel(root);
      syncIntel(root,event.detail || {});
    }));
  }

  window.addEventListener('DOMContentLoaded', () => install(document.getElementById('browser-experience')), { once:true });
  window.OrcaLume19 = { install, installPhotoBase, installIntel, syncIntel, media: NOAA_ORCA, intel:INTEL };
})();
