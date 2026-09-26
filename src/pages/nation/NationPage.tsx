import { useEffect, useState } from 'react';
import { nationCaseAsOf, nationDecision, nationLearning, nationPlace, nationSources } from '@/planet/nationDecisionCase';
import './nation.css';
import { AtlasEmbed } from '@/earth/AtlasEmbed';

type Audience = 'people' | 'institutions';
type Lens = 'decisions' | 'atlas' | 'brain' | 'solutions' | 'economy' | 'outcomes';

const lenses: { key: Lens; label: string; description: string }[] = [
  { key: 'decisions', label: 'Decisions', description: 'What is being considered?' },
  { key: 'atlas', label: 'Nation Atlas', description: 'Where does it matter?' },
  { key: 'brain', label: 'Nation Brain', description: 'What can we establish?' },
  { key: 'solutions', label: 'Solutions', description: 'Which approaches are discussed?' },
  { key: 'economy', label: 'Economy', description: 'What can be traced financially?' },
  { key: 'outcomes', label: 'Outcomes', description: 'What actually changed?' },
];

function Source({ id, label }: { id: string; label?: string }) {
  const source = nationSources.find((item) => item.id === id);
  if (!source) return <span className='nt-unknown'>Source not established</span>;
  return <a className='nt-source' href={source.url} target='_blank' rel='noopener noreferrer' title={source.title}>{label || source.issuer + ' ↗'}</a>;
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return <span className='nt-label'>{children}</span>;
}

function EvidenceRow({ title, detail, sourceId }: { title: string; detail: string; sourceId: string }) {
  return <article className='nt-evidence-row'><div><h4>{title}</h4><p>{detail}</p></div><Source id={sourceId} label='ORIGINAL ↗' /></article>;
}

export default function NationPage() {
  const [audience, setAudience] = useState<Audience>(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'institutions' ? 'institutions' : 'people');
  const [lens, setLens] = useState<Lens>(() => { const value = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('lens'); return lenses.some(item => item.key === value) ? value as Lens : 'decisions'; });
  const [sourceOpen, setSourceOpen] = useState(false);
  const [geographyOpen, setGeographyOpen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('view', audience);
    params.set('lens', lens);
    const qs = params.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
  }, [audience, lens]);

  useEffect(() => {
    if (!sourceOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    document.getElementById('nt-source-close')?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSourceOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [sourceOpen]);

  const shareCase = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareState('copied'); }
    catch { setShareState('error'); }
  };

  useEffect(() => {
    document.title = '4NATION — Better Nation | Understand your nation';
    const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (existing) existing.content = 'A source-grounded public decision intelligence prototype. Understand your nation, its places, and the decisions shaping them.';
  }, []);

  const activeLens = lenses.find((item) => item.key === lens) || lenses[0];
  const nextLens = lenses[lenses.findIndex((item) => item.key === lens) + 1];

  const showLens = (next: Lens) => {
    setLens(next);
    document.getElementById('nt-decision-layers')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const selectAudience = (next: Audience) => {
    setAudience(next);
    setLens('decisions');
    document.getElementById('nt-workbench')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  return <main className='nt-shell' id='top'>
    <a className='nt-skip' href='#nt-workbench'>Skip to the decision</a>
    <header className='nt-header'>
      <a href='#top' className='nt-wordmark' aria-label='4NATION home'><span>4</span>NATION<span className='nt-dot'>.</span></a>
      <nav aria-label='Main navigation' className='nt-topnav'>
        <a href='#nt-workbench'>Decisions</a>
        <a href='#nt-why'>Our purpose</a>
        <button type='button' onClick={() => setSourceOpen(true)}>Sources</button>
      </nav>
      <a className='nt-family' href='https://4planet.org' target='_blank' rel='noopener noreferrer'>4PLANET <span aria-hidden='true'>↗</span></a>
    </header>

    <section className='nt-hero' aria-labelledby='nt-heading'>
      <div className='nt-hero-copy'>
        <SmallLabel>4NATION / BETTER NATION</SmallLabel>
        <h1 id='nt-heading'>Understand <em>your nation.</em></h1>
        <p>Public decisions, explained through the original evidence. Start with one real place and one case.</p>
        <button className='nt-primary nt-hero-action' type='button' onClick={() => selectAudience('people')}>Explore public decisions <span aria-hidden='true'>↗</span></button>
        <p className='nt-hero-trust'>An independent 4PLANET prototype · <button type='button' onClick={() => setSourceOpen(true)}>See the sources ↗</button></p>
      </div>
      <article className='nt-featured' aria-labelledby='nt-feature-title'>
        <div className='nt-feature-top'><SmallLabel>OSLOFJORD / NORWAY</SmallLabel><span className='nt-feature-status'>PROPOSAL · UNDER CONSIDERATION</span></div>
        <div className='nt-feature-middle'>
          <span className='nt-feature-eyebrow'>ONE PUBLIC DECISION · 2026–2030</span>
          <h2 id='nt-feature-title'>What is happening<br/>to the <em>Oslofjord?</em></h2>
          <p>Norway has proposed a new plan for the fjord. It is still being considered — not an adopted plan.</p>
        </div>
        <div className='nt-feature-facts' aria-label='The case at a glance'>
          <div><span>THE ISSUE</span><strong>A fjord under pressure</strong></div>
          <div><span>THE DECISION</span><strong>A proposed new plan</strong></div>
          <div><span>WHAT IS NEXT</span><strong>15 October · local and regional deadline</strong></div>
        </div>
        <div className='nt-feature-source'>Official record · checked {nationCaseAsOf} · <Source id='KLD-2026-HEARING' label='VIEW SOURCE ↗'/></div>
      </article>
    </section>

    <section className='nt-workbench' id='nt-workbench' aria-labelledby='nt-work-heading'>
      <div className='nt-work-head'>
        <div><SmallLabel>THE OSLOFJORD / OFFICIAL CASE</SmallLabel><h2 id='nt-work-heading'>Understand the decision.</h2><p>Begin with the proposal. Explore the evidence, place, costs and outcomes when you need them.</p></div>
        <div className='nt-audiences' role='group' aria-label='Choose audience'><button type='button' aria-pressed={audience==='people'} onClick={()=>setAudience('people')}>For people</button><button type='button' aria-pressed={audience==='institutions'} onClick={()=>setAudience('institutions')}>For institutions</button></div>
      </div>

      <div className='nt-geography'>
        <span>PLACE / CONTEXT</span><button type='button' aria-expanded={geographyOpen} onClick={()=>setGeographyOpen(!geographyOpen)}>Oslofjord / Norway <span aria-hidden='true'>{geographyOpen?'−':'⌄'}</span></button><span className='nt-geography-status'>ONE SOURCED CASE / NOT A NATIONAL FEED</span>
      </div>
      {geographyOpen && <div className='nt-geo-panel'><p><strong>Oslofjord, Norway.</strong> The first source-reviewed issue has national authority with regional and local relevance. Other places and global coverage are planned; we do not pretend that they are connected live.</p><p>Country / {nationPlace?.name || 'Oslofjord'} · verified source geography is in the official proposal.</p></div>}

      <article className='nt-case'>
        <div className='nt-case-top'><SmallLabel>FEATURED PUBLIC DECISION / NORWAY</SmallLabel><span className='nt-badge'>UNDER CONSIDERATION · {nationCaseAsOf.toUpperCase()}</span></div>
        <h3>{nationDecision.title}<span> {nationDecision.period}</span></h3>
        <p className='nt-case-deck'>The official proposal is open for examination. The ministry still lists the new plan as under consideration. <Source id='KLD-2026-HEARING' label='OFFICIAL CASE ↗'/></p>
        <div className='nt-case-meta'><span>DECIDING BODY <strong>{nationDecision.issuer}</strong></span><span>GEOGRAPHY <strong>Oslofjord catchment</strong></span><span>NEXT DATED STEP <strong>15 October 2026 · local/regional submissions</strong></span></div>
        <div className='nt-case-note'><strong>Proposal, not an adopted plan.</strong> The ordinary consultation is closed; the ministry still lists the case under consideration. <Source id='KLD-2026-HEARING' label='CHECK OFFICIAL STATUS ↗'/></div><div className='nt-case-actions'><Source id='KLD-2026-PROPOSAL' label='READ THE ACTUAL PROPOSAL ↗'/><button type='button' onClick={shareCase}>{shareState==='copied'?'CASE LINK COPIED ✓':shareState==='error'?'COPY UNAVAILABLE — USE ADDRESS BAR':'COPY CASE LINK ↗'}</button></div>
      </article>

      <div className='nt-decision-layout' id='nt-decision-layers'>
        <nav className='nt-lenses' aria-label='Explore decision layers'><div className='nt-lens-overline'>EXPLORE MORE</div>{lenses.map((item,i)=><button type='button' key={item.key} className={[lens===item.key?'is-current':'',i===0?'nt-lens-primary':''].join(' ')} aria-current={lens===item.key?'true':undefined} onClick={()=>showLens(item.key)}><span>{String(i+1).padStart(2,'0')}</span><strong>{item.label}</strong><small>{item.description}</small></button>)}</nav>
        <div className='nt-lens-panel' role='region' aria-live='polite' aria-label={activeLens.label}>
          <div className='nt-lens-head'><SmallLabel>{audience==='people'?'FOR PEOPLE':'FOR INSTITUTIONS'} / {activeLens.label.toUpperCase()}</SmallLabel><span>OFFICIAL SOURCE SNAPSHOT</span></div>
          {lens==='decisions' && <section className='nt-panel-body'>
            <h3>{audience==='people'?'Follow the decision.':'Examine the decision context.'}</h3>
            <p>{audience==='people'?'See what has happened, what remains open and where to verify it. No recommendations about what you should support.':'Review the objective, authority, existing plan and documented scientific scenarios. The institution, not this prototype, determines the policy.'}</p>
            <div className='nt-facts'><div><small>CURRENT PUBLIC STATUS</small><strong>Under consideration</strong><Source id='KLD-2026-HEARING' label='OFFICIAL RECORD ↗'/></div><div><small>CONSULTATION</small><strong>Ordinary deadline passed</strong><span>15 September 2026</span></div><div><small>LOCAL / REGIONAL</small><strong>Separate deadline</strong><span>15 October 2026</span></div></div>
            {audience==='institutions' && <div className='nt-institution'><SmallLabel>NON-BINDING DECISION INTELLIGENCE</SmallLabel><h4>What needs to be understood?</h4><ul><li>Legal authority and procedural status, distinct from implementation.</li><li>Impacts on residents, public services, costs, nature and long-term resilience.</li><li>Scenario A and B are scientific model assumptions, not a recorded political ballot.</li><li>Local implementation responsibilities and verified project costs: not established for this case.</li></ul><Source id='MDE-2026-MODEL' label='READ THE SCIENTIFIC SOURCE ↗'/></div>}
            <h4 className='nt-timeline-title'>Decision timeline</h4>
            <ol className='nt-timeline'>{nationDecision.timeline.map(item=><li key={item.date+item.label}><span>{item.date}</span><div><small>{item.state}</small><p>{item.label}</p><Source id={item.sourceId} label='VERIFY ↗'/></div></li>)}</ol>
          </section>}
          {lens==='atlas' && <section className='nt-panel-body'><h3>Place gives a decision its context.</h3><p>The Oslofjord connects marine ecosystems, communities and a catchment crossing multiple administrative boundaries. The geographical extent below is inherited from the existing 4PLANET PLACE registry, not a new authoritative jurisdiction or drainage-basin map.</p>{nationPlace ? <AtlasEmbed view={{ kind: 'NATION', title: 'Oslofjord — geographic context', placeId: nationPlace.id, layers: ['bluemarble'], description: 'An interactive navigation view over the existing 4PLANET ATLAS. The decision remains sourced to the official documents below.', limitation: 'Navigation extent only. This map does not depict an official catchment, decision boundary, implementation site or measured ecological outcome.' }} /> : <p role='status'>Geographic context is not available.</p>}<Source id='KLD-2026-HEARING' label='OFFICIAL POLICY GEOGRAPHY ↗'/></section>}
          {lens==='brain' && <section className='nt-panel-body'><h3>Ask better questions of the evidence.</h3><p>These answers are curated from the cited primary-source snapshot. This first prototype does not claim live conversational PLANETBRAIN access or current-feed coverage.</p><div className='nt-qa'><h4>Is the new plan already adopted?</h4><p>No final adoption is established by the cited hearing record. Its current public status is “under consideration” as of {nationCaseAsOf}.</p><Source id='KLD-2026-HEARING' label='OFFICIAL STATUS ↗'/></div><div className='nt-qa'><h4>What does the scientific model establish?</h4><p>It compares modelled measures, not delivered ecological results. A 30–40% nitrate reduction is a modelled requirement against a 2017–2019 baseline, not proof that the reduction has occurred.</p><Source id='MDE-2026-MODEL' label='RESEARCH SUMMARY ↗'/></div></section>}
          {lens==='solutions' && <section className='nt-panel-body'><h3>Understand approaches. Verify what is proposed.</h3><p>The official proposal discusses measures involving wastewater, agriculture, fisheries and coastal nature. Measures have different procedures and decision owners; suggestions in a consultation are not automatically adopted actions.</p><div className='nt-plain-rows'><article><strong>Wastewater treatment</strong><p>Planning, investigation and nitrogen-removal technology.</p></article><article><strong>Agricultural runoff</strong><p>Potential measures discussed in the proposed plan and scientific scenario work.</p></article><article><strong>Nature and coastline</strong><p>Restoration and protection questions are part of the plan proposal.</p></article></div><Source id='KLD-2026-PROPOSAL' label='READ THE PLAN PROPOSAL ↗'/></section>}
          {lens==='economy' && <section className='nt-panel-body'><h3>Public money. Clear boundaries.</h3><div className='nt-economy'><small>SEPARATE FUNDING ANNOUNCEMENT / 2 SEPT 2026</small><strong>NOK 10 million</strong><p>Further nitrogen-removal planning support announced for 14 municipalities/intermunicipal recipients. This is neither the total cost of the proposed plan nor an award to 4NATION.</p><Source id='MDE-2026-GRANTS' label='OFFICIAL FUNDING ANNOUNCEMENT ↗'/></div><div className='nt-unknown-box'><SmallLabel>NOT ESTABLISHED</SmallLabel><p>Complete plan cost, local project investment, net savings and attributed financial returns are not established by this first source bundle.</p></div></section>}
          {lens==='outcomes' && <section className='nt-panel-body'><h3>Decided is not delivered.</h3><p>The 2021 plan is an existing public plan. The cited 2026 proposal and consultation do not demonstrate that its new measures were adopted, implemented or that the fjord recovered.</p><div className='nt-outcome-list'><span>2021 PLAN <strong>Previously published</strong></span><span>2026–2030 PROPOSAL <strong>Under consideration</strong></span><span>NEW MEASURES IMPLEMENTED <strong>Not established</strong></span><span>VERIFIED ECOLOGICAL OUTCOME <strong>Not established</strong></span></div><Source id='KLD-2021-PLAN' label='2021 PRIMARY SOURCE ↗'/><Source id='KLD-2026-HEARING' label='2026 CASE STATUS ↗'/></section>}
        </div>
          <nav className='nt-journey-nav' aria-label='Continue exploring the Oslofjord decision'>
            <span>{nextLens ? 'ONE CASE / EXPLORE THE NEXT QUESTION' : 'ONE CASE / RETURN TO THE ORIGINAL RECORD'}</span>
            {nextLens
              ? <button type='button' onClick={() => showLens(nextLens.key)}>NEXT — {nextLens.label.toUpperCase()} <span aria-hidden='true'>↗</span></button>
              : <button type='button' onClick={() => setSourceOpen(true)}>EXPLORE THE ORIGINAL SOURCES <span aria-hidden='true'>↗</span></button>}
          </nav>
      </div>
      <div className='nt-proof-note'><SmallLabel>TRUTH BEFORE CERTAINTY</SmallLabel><p>One verified public case, not an all-Norway feed. Primary sources, dated status and unknowns stay visible. This prototype does not make public decisions, represent any government or rank political options.</p><button type='button' onClick={()=>setSourceOpen(true)}>Inspect all sources ↗</button></div>
    </section>

    <section className='nt-why' id='nt-why'><SmallLabel>02 / WHY WE EXIST</SmallLabel><h2>Better intelligence.<br/>Informed choices.<br/><em>A better nation.</em></h2><div className='nt-why-grid'><p>For people: understand which decisions may shape your place, and what is established by the original record.</p><p>For institutions: see the legal, human, economic and ecological dimensions of a choice — then measure separately what happens after it.</p></div><div className='nt-family-row'><span>4SAPIEN / PERSON</span><span>4BRANDS / COMPANY</span><strong>4NATION / NATION</strong><span>4PLANET / LIVING PLANET</span></div></section>

    <footer className='nt-footer'><strong>4NATION.</strong><p>BETTER NATION. A 4PLANET product concept.</p><span>Prototype · dated evidence · not an official government service</span><a href='#top'>BACK TO TOP ↑</a></footer>

    {sourceOpen && <div className='nt-source-overlay' role='presentation' onMouseDown={(event)=>{if(event.target===event.currentTarget)setSourceOpen(false);}}><section className='nt-source-dialog' role='dialog' aria-modal='true' aria-labelledby='nt-source-title'><div className='nt-source-dialog-head'><SmallLabel>SOURCE REGISTER / THIS CASE</SmallLabel><button id='nt-source-close' type='button' onClick={()=>setSourceOpen(false)} aria-label='Close sources'>CLOSE ×</button></div><h2 id='nt-source-title'>Follow the original record.</h2><p>Curated and reviewed as of {nationCaseAsOf}. These are links to the issuing bodies; we have not integrated a live API for this case.</p>{nationSources.map(source=><article key={source.id}><small>{source.date} / {source.id}</small><h3>{source.title}</h3><p>{source.issuer}</p><a href={source.url} target='_blank' rel='noopener noreferrer'>VIEW ORIGINAL ↗</a></article>)}<h3>What remains uncertain</h3>{nationLearning.map(item=><EvidenceRow key={item.title} {...item}/>)}<button className='nt-close-bottom' type='button' onClick={()=>setSourceOpen(false)}>Close source register</button></section></div>}
  </main>;
}
