import { useEffect, useState } from 'react';
import { nationCaseAsOf, nationDecision, nationLearning, nationPlace, nationSources } from '@/planet/nationDecisionCase';
import './nation.css';
import { AtlasEmbed } from '@/earth/AtlasEmbed';
import NationPlaceExplorer from './NationPlaceExplorer';

type Audience = 'people' | 'institutions';
type NationTheme = 'light' | 'dark';
type Lens = 'decisions' | 'atlas' | 'brain' | 'solutions' | 'economy' | 'outcomes';

type StortingCase = {
  id:string; sourceCaseId:string; title:string; shortTitle:string|null; caseType:string|null; status:string;
  documentGroup:string|null; committee:string|null; subjects:string[]; lastUpdated:string|null; sourceUrl:string;
};

type SsbTable = {
  id:string; tableId:string; label:string; description:string|null; updated:string|null; firstPeriod:string|null; lastPeriod:string|null;
  variableNames:string[]; source:string; sourceUrl:string;
};
type SsbCell = { index:number; value:number|string|null; status:string|null; coordinates:Record<string,{code:string;label:string}> };
type SsbDataset = { label:string; updated:string|null; dimensions:string[]; cells:SsbCell[] };

const lenses: { key: Lens; label: string; description: string }[] = [
  { key: 'decisions', label: 'Decisions', description: 'What is being considered?' },
  { key: 'atlas', label: 'Map', description: 'Where does it matter?' },
  { key: 'brain', label: 'Evidence', description: 'What can we establish?' },
  { key: 'solutions', label: 'Solutions', description: 'Which approaches are discussed?' },
  { key: 'economy', label: 'Economy', description: 'What can be traced financially?' },
  { key: 'outcomes', label: 'Outcomes', description: 'What actually changed?' },
];

function StatbankContextFinder() {
  const [query,setQuery]=useState('');
  const [tables,setTables]=useState<SsbTable[]>([]);
  const [selected,setSelected]=useState<SsbTable|null>(null);
  const [dataset,setDataset]=useState<SsbDataset|null>(null);
  const [state,setState]=useState<'IDLE'|'SEARCHING'|'CANDIDATES'|'LOADING'|'READY'|'NO_MATCH'|'ERROR'>('IDLE');

  const search=async(event?:React.FormEvent)=>{
    event?.preventDefault();const q=query.trim();if(q.length<2)return;
    setState('SEARCHING');setTables([]);setSelected(null);setDataset(null);
    try{
      const response=await fetch('/api/statbank-context?q='+encodeURIComponent(q));
      const payload=await response.json() as {ok?:boolean;tables?:SsbTable[]};
      if(!response.ok||!payload.ok)throw new Error('SSB_SEARCH_FAILED');
      const next=Array.isArray(payload.tables)?payload.tables:[];
      setTables(next);setState(next.length?'CANDIDATES':'NO_MATCH');
    }catch{setState('ERROR');}
  };
  const openTable=async(table:SsbTable)=>{
    setSelected(table);setDataset(null);setState('LOADING');
    try{
      const response=await fetch('/api/statbank-context?table='+encodeURIComponent(table.tableId));
      const payload=await response.json() as {ok?:boolean;dataset?:SsbDataset};
      if(!response.ok||!payload.ok||!payload.dataset)throw new Error('SSB_TABLE_FAILED');
      setDataset(payload.dataset);setState('READY');
    }catch{setState('ERROR');}
  };
  return <section className='nt-statbank' aria-labelledby='nt-statbank-title'>
    <div className='nt-statbank-head'><div><SmallLabel>OFFICIAL STATISTICAL CONTEXT / SSB</SmallLabel><h3 id='nt-statbank-title'>Put the decision in measurable context.</h3><p>Find an SSB table, then inspect its default latest extract. 4NATION does not pick the statistic for you or treat correlation as policy causation.</p></div><span>PXWEBAPI V2 · CC BY 4.0</span></div>
    <form className='nt-statbank-search' onSubmit={search}><label htmlFor='nt-ssb-search'>Search Statbank Norway</label><div><input id='nt-ssb-search' value={query} onChange={event=>setQuery(event.target.value)} placeholder='e.g. befolkning Oslo, avløp, jordbruk, utslipp'/><button type='submit' disabled={state==='SEARCHING'||query.trim().length<2}>{state==='SEARCHING'?'Searching…':'Find official tables'}</button></div></form>
    {state==='NO_MATCH'&&<p className='nt-statbank-state' role='status'>No table matched this bounded search. No statistical conclusion is inferred.</p>}
    {state==='ERROR'&&<p className='nt-statbank-state' role='status'>SSB is unavailable for this lookup. Existing decision evidence is unchanged.</p>}
    {state==='CANDIDATES'&&<div className='nt-statbank-tables'>{tables.map(table=><button type='button' key={table.id} onClick={()=>void openTable(table)}><span><strong>{table.tableId}</strong><b>{table.label}</b><small>{table.lastPeriod?'latest period '+table.lastPeriod:'latest period not reported'} · {table.variableNames.slice(0,4).join(' · ')}</small></span><em>OPEN DEFAULT EXTRACT</em></button>)}</div>}
    {state==='LOADING'&&<p className='nt-statbank-state' role='status'>Loading SSB's default latest extract…</p>}
    {selected&&dataset&&state==='READY'&&<div className='nt-statbank-data'><div className='nt-statbank-tabletitle'><span>statistical-table:ssb:{selected.tableId}</span><h4>{dataset.label||selected.label}</h4><p>{dataset.updated?'Source updated '+new Date(dataset.updated).toLocaleDateString('nb-NO'):'Source update time unavailable'}</p><a href={selected.sourceUrl} target='_blank' rel='noopener noreferrer'>OPEN SSB TABLE METADATA ↗</a></div><div className='nt-statbank-cells'>{dataset.cells.map(cell=><article key={cell.index}><div>{Object.values(cell.coordinates).map(c=>c.label).join(' / ')}</div><strong>{cell.value===null?'NOT PUBLISHED / SEE STATUS':String(cell.value)}</strong>{cell.status&&<small>SSB STATUS {cell.status}</small>}</article>)}</div></div>}
    <p className='nt-statbank-limit'>This is the source's default extract, not a 4NATION-selected causal model. Units, dimensions, footnotes and confidentiality/status markers remain part of the interpretation boundary.</p>
  </section>;
}

function LiveStortingCaseFinder() {
  const [query,setQuery]=useState('');
  const [cases,setCases]=useState<StortingCase[]>([]);
  const [state,setState]=useState<'IDLE'|'LOADING'|'READY'|'NO_MATCH'|'ERROR'>('IDLE');

  const search=async(event?:React.FormEvent)=>{
    event?.preventDefault();
    const q=query.trim();if(q.length<2)return;
    setState('LOADING');setCases([]);
    try{
      const response=await fetch('/api/nation-cases?q='+encodeURIComponent(q));
      const payload=await response.json() as {ok?:boolean;cases?:StortingCase[]};
      if(!response.ok||!payload.ok)throw new Error('SOURCE_FAILED');
      const next=Array.isArray(payload.cases)?payload.cases:[];
      setCases(next);setState(next.length?'READY':'NO_MATCH');
    }catch{setState('ERROR');}
  };

  return <section className='nt-live-cases' aria-labelledby='nt-live-cases-title'>
    <div className='nt-live-cases-head'><div><SmallLabel>LIVE SOURCE DISCOVERY / STORTINGET</SmallLabel><h3 id='nt-live-cases-title'>Find a parliamentary case.</h3><p>Search the current Storting session by subject. Results keep the source's case ID and procedural status; 4NATION does not rank policy choices or infer what should be decided.</p></div><span>SOURCE / NLOD / 10-MIN SNAPSHOT</span></div>
    <form onSubmit={search} className='nt-live-search'><label htmlFor='nt-case-search'>Search current Storting cases</label><div><input id='nt-case-search' value={query} onChange={event=>setQuery(event.target.value)} placeholder='e.g. natur, havbruk, klima, transport'/><button type='submit' disabled={state==='LOADING'||query.trim().length<2}>{state==='LOADING'?'Checking…':'Search official cases'}</button></div></form>
    {state==='ERROR'&&<p role='status' className='nt-live-state'>Stortinget's data service is unavailable right now. No case status is inferred.</p>}
    {state==='NO_MATCH'&&<p role='status' className='nt-live-state'>No current-session case matched this bounded search. That is not evidence that no relevant public decision exists.</p>}
    {state==='READY'&&<div className='nt-live-results'>{cases.map(item=><article key={item.id}><div><span>{item.id}</span><strong>{item.status.replaceAll('_',' ')}</strong></div><h4>{item.title}</h4><p>{item.committee||'Committee not established in this source row'}{item.caseType?' · '+item.caseType:''}</p><small>{item.lastUpdated?'SOURCE UPDATED '+new Date(item.lastUpdated).toLocaleDateString('nb-NO'):'SOURCE UPDATE DATE UNAVAILABLE'}</small><a href={item.sourceUrl} target='_blank' rel='noopener noreferrer'>OPEN STORTINGET SOURCE ↗</a></article>)}</div>}
    <p className='nt-live-limit'>Coverage: current parliamentary session only. This finder is not a complete feed of Norwegian national, regional or local decisions, and a parliamentary case is not automatically enacted or implemented policy.</p>
  </section>;
}

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
  const [theme, setTheme] = useState<NationTheme>(() => { if (typeof window === 'undefined') return 'light'; const saved=window.localStorage.getItem('4nation_theme'); if(saved==='light'||saved==='dark') return saved; return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; });
  const [geographyOpen, setGeographyOpen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    window.localStorage.setItem('4nation_theme', theme);
    const meta=document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if(meta)meta.content=theme==='dark'?'#000000':'#FFFFFF';
  }, [theme]);

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
    if (existing) existing.content = 'Follow a real public decision from proposal to implementation and measured outcome, with the original evidence kept close.';
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
    document.getElementById('nt-places')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  return <main className='nt-shell' id='top' data-nt-theme={theme}>
    <a className='nt-skip' href='#nt-places'>Skip to public decisions</a>
    <header className='nt-header'>
      <a href='#top' className='nt-wordmark' aria-label='4NATION home'><span>4</span>NATION<span className='nt-dot'>.</span></a>
      <nav aria-label='Main navigation' className='nt-topnav'>
        <a href='#nt-places'>Places</a>
        <a href='#nt-workbench'>Oslofjord</a>
        <button type='button' onClick={() => setSourceOpen(true)}>Sources</button>
      </nav>
      <div className='nt-header-actions'><button className='nt-theme-toggle' type='button' aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} onClick={()=>setTheme(theme==='light'?'dark':'light')}>{theme==='light'?'DARK':'LIGHT'}</button><a className='nt-family' href='https://4planet.org' target='_blank' rel='noopener noreferrer'>4PLANET <span aria-hidden='true'>↗</span></a></div>
    </header>

    <section className='nt-hero' aria-labelledby='nt-heading'>
      <div className='nt-hero-copy'>
        <SmallLabel>4NATION / BETTER NATION</SmallLabel>
        <span className='nt-hero-kicker'>UNDERSTAND YOUR NATION.</span>
        <h1 id='nt-heading'>What is happening to the <em>Oslofjord?</em></h1>
        <p>Norway has proposed a new plan for the fjord. Follow what is proposed, what is actually decided, what happens next and where the evidence comes from.</p>
        <button className='nt-primary nt-hero-action' type='button' onClick={() => selectAudience('people')}>Explore public decisions <span aria-hidden='true'>↗</span></button>
        <p className='nt-hero-trust'>An independent 4PLANET prototype · <button type='button' onClick={() => setSourceOpen(true)}>See the sources ↗</button></p>
      </div>
      <article className='nt-featured' aria-labelledby='nt-feature-title'>
        <div className='nt-feature-top'><SmallLabel>OSLOFJORD / NORWAY</SmallLabel><span className='nt-feature-status'>PROPOSAL · UNDER CONSIDERATION</span></div>
        <div className='nt-feature-middle'>
          <span className='nt-feature-eyebrow'>ONE PUBLIC DECISION · 2026–2030</span>
          <h2 id='nt-feature-title'>One proposal.<br/><em>What happens next?</em></h2>
          <p>Follow the same case through proposal, consultation, decision, implementation and measured outcome. The source still lists it as under consideration.</p>
        </div>
        <div className='nt-feature-facts' aria-label='The case at a glance'>
          <div><span>THE ISSUE</span><strong>A fjord under pressure</strong></div>
          <div><span>THE DECISION</span><strong>A proposed new plan</strong></div>
          <div><span>WHAT IS NEXT</span><strong>15 October · local and regional deadline</strong></div>
        </div>
        <div className='nt-feature-source'>Official record · checked {nationCaseAsOf} · <Source id='KLD-2026-HEARING' label='VIEW SOURCE ↗'/></div>
      </article>
    </section>

    <NationPlaceExplorer />

    <section className='nt-workbench' id='nt-workbench' aria-labelledby='nt-work-heading'>
      <div className='nt-work-head'>
        <div><SmallLabel>THE OSLOFJORD / OFFICIAL CASE</SmallLabel><h2 id='nt-work-heading'>The decision, in one place.</h2><p>Start with what is being considered. Open the map, evidence, solutions, economy and outcomes only when you need more depth.</p></div>
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
            <details className='nt-timeline-disclosure'>
              <summary><span>Decision timeline</span><small>{nationDecision.timeline.length} dated events · open full record</small></summary>
              <ol className='nt-timeline'>{nationDecision.timeline.map(item=><li key={item.date+item.label}><span>{item.date}</span><div><small>{item.state}</small><p>{item.label}</p><Source id={item.sourceId} label='VERIFY ↗'/></div></li>)}</ol>
            </details>
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

      <details className='nt-discovery'>
        <summary><span><SmallLabel>GO BEYOND THIS CASE</SmallLabel><strong>Explore official Norway data</strong></span><small>Stortinget + SSB · source-first tools</small></summary>
        <div className='nt-discovery-body'>
          <p className='nt-discovery-intro'>Search current parliamentary cases or official statistics when you want broader context. These tools stay separate from the Oslofjord decision so source discovery does not become a policy recommendation or replace the case record.</p>
          <LiveStortingCaseFinder />
          <StatbankContextFinder />
        </div>
      </details>
    </section>

    <section className='nt-why' id='nt-why'><SmallLabel>WHY 4NATION</SmallLabel><div className='nt-why-compact'><h2>Public decisions should be easier to understand.</h2><p>One sourced record for people and institutions — with place, evidence, economics and outcomes kept distinct.</p></div><div className='nt-family-row'><span>4SAPIEN / PERSON</span><span>4BRANDS / COMPANY</span><strong>4NATION / NATION</strong><span>4PLANET / LIVING PLANET</span></div></section>

    <footer className='nt-footer'><strong>4NATION.</strong><p>BETTER NATION. A 4PLANET product.</p><span>Prototype · dated evidence · not an official government service</span><a href='#top'>BACK TO TOP ↑</a></footer>

    {sourceOpen && <div className='nt-source-overlay' role='presentation' onMouseDown={(event)=>{if(event.target===event.currentTarget)setSourceOpen(false);}}><section className='nt-source-dialog' role='dialog' aria-modal='true' aria-labelledby='nt-source-title'><div className='nt-source-dialog-head'><SmallLabel>SOURCE REGISTER / THIS CASE</SmallLabel><button id='nt-source-close' type='button' onClick={()=>setSourceOpen(false)} aria-label='Close sources'>CLOSE ×</button></div><h2 id='nt-source-title'>Follow the original record.</h2><p>Curated and reviewed as of {nationCaseAsOf}. These are links to the issuing bodies; we have not integrated a live API for this case.</p>{nationSources.map(source=><article key={source.id}><small>{source.date} / {source.id}</small><h3>{source.title}</h3><p>{source.issuer}</p><a href={source.url} target='_blank' rel='noopener noreferrer'>VIEW ORIGINAL ↗</a></article>)}<h3>What remains uncertain</h3>{nationLearning.map(item=><EvidenceRow key={item.title} {...item}/>)}<button className='nt-close-bottom' type='button' onClick={()=>setSourceOpen(false)}>Close source register</button></section></div>}
  </main>;
}
