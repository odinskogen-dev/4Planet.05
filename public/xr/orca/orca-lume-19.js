(() => {
  const NOAA_ORCA = {
    src: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Orcinus_orca_NOAA.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Orcinus_orca_NOAA.jpg',
    credit: 'NOAA',
    rights: 'PUBLIC DOMAIN',
    note: 'REAL ORCA PHOTO BASE · PROJECTION TREATMENT IS INTERPRETIVE'
  };

  const INTEL = {
    identity:{kicker:'SPECIES INTELLIGENCE',primary:'Orcinus orca',secondary:'GBIF 2440483 · SPECIES IDENTITY',modules:[['IDENTITY','KNOWN','SPECIES'],['POPULATION / POD','UNKNOWN','NOT INFERRED'],['MEDIA','PHOTO BASE','NOAA · PUBLIC DOMAIN']]},
    dependency:{kicker:'PREY / DEPENDENCY',primary:'Diet depends on population.',secondary:'AN UNIDENTIFIED INDIVIDUAL ≠ A DIET CLAIM',modules:[['PREY','POPULATION-SPECIFIC','KNOWN BOUNDARY'],['FORAGING CULTURE','GROUPS DIFFER','CONTEXT'],['INDIVIDUAL DIET','UNKNOWN','NOT INFERRED']]},
    habitat:{kicker:'MOVEMENT / PLACE',primary:'Records are not a migration track.',secondary:'OCCURRENCE ≠ RANGE · ABUNDANCE · LIVE POSITION',modules:[['REPORTED RECORD','SOURCE-BOUND','OBSERVATION'],['MIGRATION / ROUTE','NOT INFERRED','NO FAKE TRACK'],['LIVE LOCATION','UNKNOWN','NEVER IMPLIED']]},
    pressure:{kicker:'ACOUSTIC / PRESSURE',primary:'The ocean can get louder.',secondary:'PRESSURE CATEGORY ≠ EXPOSURE LEVEL OR EFFECT',modules:[['UNDERWATER NOISE','PRESSURE CLASS','POPULATION-SPECIFIC'],['VESSEL TRAFFIC','INTERACTION','SOURCE-BOUND'],['EXPOSURE / EFFECT','UNKNOWN','REQUIRES EVIDENCE']]},
    response:{kicker:'RESPONSE INTELLIGENCE',primary:'Specificity before intervention.',secondary:'NO UNIVERSAL FIX · NO OUTCOME CLAIM',modules:[['POPULATION','IDENTIFY','GATE'],['ACTOR','VERIFY CAPACITY','GATE'],['OUTCOME','NOT CLAIMED','EVIDENCE REQUIRED']]}
  };

  const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  function installPhotoBase(root) {
    const projection = root?.querySelector('.light-lens-projection');
    if (!projection || projection.querySelector('.orca-lume-photo')) return;
    const frame = document.createElement('figure');
    frame.className = 'orca-lume-photo';
    frame.innerHTML = `<img src="${NOAA_ORCA.src}" alt="" loading="eager" decoding="async" referrerpolicy="no-referrer" /><span class="orca-lume-photo__wash" aria-hidden="true"></span><span class="orca-lume-photo__contour" aria-hidden="true"></span><figcaption><a href="${NOAA_ORCA.source}" target="_blank" rel="noreferrer">${NOAA_ORCA.credit} · ${NOAA_ORCA.rights}</a><span>${NOAA_ORCA.note}</span></figcaption>`;
    projection.prepend(frame);
    const image = frame.querySelector('img');
    image?.addEventListener('load', () => {
      frame.classList.add('is-ready');
      root.dataset.orcaLumePhoto = 'noaa-public-domain';
    }, { once:true });
    image?.addEventListener('error', () => {
      frame.classList.add('is-unavailable');
      root.dataset.orcaLumePhoto = 'unavailable-wireframe-fallback';
      const note = frame.querySelector('figcaption span');
      if (note) note.textContent = 'PHOTO BASE UNAVAILABLE · WIREFRAME FALLBACK';
    }, { once:true });
    const vector = projection.querySelector('.light-lens-orca');
    if (vector) { vector.classList.add('orca-lume-wireframe'); vector.setAttribute('aria-hidden','true'); }
    root.dataset.orcaLumePhoto = 'loading';
  }

  const waveformMarkup = () => Array.from({length:28},(_,i)=>`<i style="--i:${i}" aria-hidden="true"></i>`).join('');

  function installIntel(root) {
    const layer = root?.querySelector('.light-lens-layer');
    if (!layer || layer.querySelector('.orca-lume-intel')) return;
    const intel = document.createElement('aside');
    intel.className = 'orca-lume-intel';
    intel.setAttribute('aria-label','Orca Light Lens intelligence overlay');
    intel.innerHTML = `<div class="orca-lume-intel__header"><span class="orca-lume-intel__kicker">SPECIES INTELLIGENCE</span><b class="orca-lume-intel__index">01 / 05</b></div><strong class="orca-lume-intel__primary">Orcinus orca</strong><span class="orca-lume-intel__secondary">GBIF 2440483 · SPECIES IDENTITY</span><div class="orca-lume-intel__modules"></div><div class="orca-lume-acoustic"><div class="orca-lume-acoustic__meta"><span>ACOUSTIC SIGNAL</span><b>PROCEDURAL · NOT FIELD AUDIO</b></div><div class="orca-lume-acoustic__wave">${waveformMarkup()}</div><button class="orca-lume-echo-trigger" type="button">SEND ECHO PULSE</button></div>`;
    layer.appendChild(intel);
    const rail = document.createElement('div');
    rail.className = 'orca-lume-rail';
    rail.setAttribute('aria-hidden','true');
    rail.innerHTML = `<span data-lume-rail="identity">LIFE</span><span data-lume-rail="dependency">PREY</span><span data-lume-rail="habitat">MOVEMENT</span><span data-lume-rail="pressure">PRESSURE</span><span data-lume-rail="response">RESPONSE</span>`;
    layer.appendChild(rail);
  }

  function syncIntel(root,detail={}) {
    const state = detail.state || root.dataset.lightLensScene || root.dataset.sceneState || 'identity';
    const index = Number(detail.index ?? root.dataset.lightLensIndex ?? root.dataset.journeyIndex ?? 0);
    const config = INTEL[state] || INTEL.identity;
    const panel = root.querySelector('.orca-lume-intel');
    if (!panel) return;
    panel.querySelector('.orca-lume-intel__kicker').textContent=config.kicker;
    panel.querySelector('.orca-lume-intel__index').textContent=`${String(index+1).padStart(2,'0')} / 05`;
    panel.querySelector('.orca-lume-intel__primary').textContent=config.primary;
    panel.querySelector('.orca-lume-intel__secondary').textContent=config.secondary;
    panel.querySelector('.orca-lume-intel__modules').innerHTML=config.modules.map(([label,value,stateLabel])=>`<div class="orca-lume-module"><span>${label}</span><strong>${value}</strong><small>${stateLabel}</small></div>`).join('');
    root.querySelectorAll('[data-lume-rail]').forEach(node=>node.dataset.active=node.dataset.lumeRail===state?'true':'false');
    if (root.dataset.orcaLumeScene !== state) root.dataset.orcaLumeScene=state;
  }

  function reconcileCanonicalScene(root) {
    if (!root) return;
    const canonicalState = root.dataset.sceneState;
    const state = canonicalState && INTEL[canonicalState]
      ? canonicalState
      : (root.dataset.lightLensScene && INTEL[root.dataset.lightLensScene] ? root.dataset.lightLensScene : null);
    if (!state) return;
    const canonicalIndex = Number(root.dataset.journeyIndex ?? root.dataset.lightLensIndex ?? 0);
    if (root.dataset.orcaLumeScene === state) {
      const shown = root.querySelector('.orca-lume-intel__index')?.textContent || '';
      const wanted = `${String(canonicalIndex+1).padStart(2,'0')} / 05`;
      if (shown === wanted) return;
    }
    syncIntel(root,{state,index:canonicalIndex});
  }

  function emitEcho(root) {
    if (!root || root.dataset.lightLens !== 'true') return;
    window.NatureAudioV06?.start?.();
    window.NatureAudioV06?.applyProfile?.(root.dataset.orcaLumeScene || 'identity');
    const layer=root.querySelector('.light-lens-layer');
    if (!layer) return;
    const pulse=document.createElement('div');
    pulse.className='orca-lume-echo';
    pulse.setAttribute('aria-hidden','true');
    pulse.innerHTML='<i style="--d:0"></i><i style="--d:1"></i><i style="--d:2"></i><i style="--d:3"></i>';
    layer.appendChild(pulse);
    root.dataset.echoActive='true';
    root.querySelector('.orca-lume-acoustic__wave')?.setAttribute('data-pulse','true');
    window.dispatchEvent(new CustomEvent('4planet:orca-lume-echo',{detail:{state:root.dataset.orcaLumeScene||'identity',interpretive:true}}));
    window.setTimeout(()=>{pulse.remove();root.dataset.echoActive='false';root.querySelector('.orca-lume-acoustic__wave')?.removeAttribute('data-pulse');},reducedMotion()?80:1900);
  }

  function installInteraction(root) {
    if (root.dataset.orcaLumeInteraction==='true') return;
    root.dataset.orcaLumeInteraction='true';
    root.querySelector('.orca-lume-echo-trigger')?.addEventListener('click',()=>emitEcho(root));
    const stage=root.querySelector('.nature-stage');
    if (!stage || reducedMotion()) return;
    let raf=0;
    stage.addEventListener('pointermove',(event)=>{
      if(root.dataset.lightLens!=='true') return;
      if(raf) cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const rect=stage.getBoundingClientRect();
        const x=((event.clientX-rect.left)/Math.max(rect.width,1)-.5);
        const y=((event.clientY-rect.top)/Math.max(rect.height,1)-.5);
        root.style.setProperty('--lume-shift-x',`${(x*8).toFixed(2)}px`);
        root.style.setProperty('--lume-shift-y',`${(y*5).toFixed(2)}px`);
      });
    },{passive:true});
    stage.addEventListener('pointerleave',()=>{
      root.style.setProperty('--lume-shift-x','0px');
      root.style.setProperty('--lume-shift-y','0px');
    },{passive:true});
  }

  function activateDefaultLume(root) {
    if (root.dataset.lumeDefault !== 'true' || root.dataset.lightLens === 'true') return;
    const toggle = root.querySelector('.light-lens-toggle');
    if (toggle instanceof HTMLButtonElement) toggle.click();
  }

  function install(root) {
    if(!root || root.dataset.orcaLumeInstalled==='true') return;
    root.dataset.orcaLumeInstalled='true';
    installPhotoBase(root);installIntel(root);syncIntel(root);installInteraction(root);
    root.addEventListener('4planet:light-lens-change',()=>{installPhotoBase(root);installIntel(root);reconcileCanonicalScene(root);installInteraction(root)});
    window.addEventListener('4planet:nature-journey-scene',event=>{
      installPhotoBase(root);installIntel(root);syncIntel(root,event.detail||{});reconcileCanonicalScene(root);installInteraction(root);
    });
    const sceneObserver = new MutationObserver(()=>reconcileCanonicalScene(root));
    sceneObserver.observe(root,{attributes:true,attributeFilter:['data-scene-state','data-journey-index','data-light-lens-scene','data-light-lens-index']});
    root.__orcaLumeSceneObserver = sceneObserver;
    reconcileCanonicalScene(root);
    requestAnimationFrame(()=>activateDefaultLume(root));
  }

  window.addEventListener('DOMContentLoaded',()=>install(document.getElementById('browser-experience')),{once:true});
  window.OrcaLume19={install,installPhotoBase,installIntel,syncIntel,reconcileCanonicalScene,emitEcho,activateDefaultLume,media:NOAA_ORCA,intel:INTEL};
})();
