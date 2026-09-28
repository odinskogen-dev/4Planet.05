import { useMemo, useState } from 'react';
import { AtlasEmbed } from '@/earth/AtlasEmbed';
import { nationPlaceModels, nationSourceFederation, publicDecisions, type NationPlaceModel, type PublicDecision } from '@/planet/nationPublicDecisions';

const stageOrder = ['PROPOSAL', 'CONSULTATION', 'DECIDED', 'IMPLEMENTING', 'MEASURED'] as const;

function norm(value:string){
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
}

function DecisionStatus({decision}:{decision:PublicDecision}){
  return <span className='nt-public-status' data-stage={decision.stage}>{decision.statusLabel}</span>;
}

export default function NationPlaceExplorer(){
  const [placeSlug,setPlaceSlug]=useState<NationPlaceModel['slug']>('norway');
  const [decisionId,setDecisionId]=useState(publicDecisions[0].id);
  const [municipalityQuery,setMunicipalityQuery]=useState('');
  const [lookupState,setLookupState]=useState<'idle'|'ready'|'unsupported'>('idle');

  const place=nationPlaceModels.find(item=>item.slug===placeSlug) || nationPlaceModels[0];
  const decisions=useMemo(()=>publicDecisions.filter(item=>item.placeSlug===place.slug),[place.slug]);
  const selected=decisions.find(item=>item.id===decisionId) || decisions[0];

  const choosePlace=(next:NationPlaceModel)=>{
    setPlaceSlug(next.slug);
    const first=publicDecisions.find(item=>item.placeSlug===next.slug);
    if(first)setDecisionId(first.id);
    setLookupState('idle');
  };

  const findMunicipality=()=>{
    const q=norm(municipalityQuery);
    const next=nationPlaceModels.find(item=>item.kind==='MUNICIPALITY'&&(norm(item.name)===q||norm(item.name).includes(q)));
    if(next){choosePlace(next);setLookupState('ready');}
    else setLookupState('unsupported');
  };

  if(!selected)return null;
  const activeStage=Math.max(0,stageOrder.indexOf(selected.stage));

  return <section className='nt-place-explorer' id='nt-places' aria-labelledby='nt-places-title'>
    <div className='nt-place-intro'>
      <div>
        <span className='nt-label'>NORWAY → PLACE → PUBLIC DECISION</span>
        <h2 id='nt-places-title'>Start with a place.</h2>
        <p>See what is being proposed, heard, decided and implemented — then move directly into geographic context and the original public record.</p>
      </div>
      <div className='nt-municipality-find'>
        <label htmlFor='nt-municipality-input'>Find municipality</label>
        <div>
          <input id='nt-municipality-input' list='nt-municipality-list' value={municipalityQuery} onChange={event=>{setMunicipalityQuery(event.target.value);setLookupState('idle');}} placeholder='Bergen or Oslo' onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();findMunicipality();}}}/>
          <datalist id='nt-municipality-list'><option value='Bergen'/><option value='Oslo'/></datalist>
          <button type='button' onClick={findMunicipality}>Open place</button>
        </div>
        {lookupState==='unsupported'&&<small role='status'>Bergen and Oslo are the connected municipal models in this build. Other municipalities are not presented as connected yet.</small>}
        {lookupState==='ready'&&<small role='status'>{place.name} opened with its source-bound decision model.</small>}
      </div>
    </div>

    <nav className='nt-place-tabs' aria-label='Choose geography'>
      {nationPlaceModels.map(item=><button type='button' key={item.slug} aria-pressed={item.slug===place.slug} onClick={()=>choosePlace(item)}>
        <span>{item.label}</span><strong>{item.name}</strong><small>{publicDecisions.filter(decision=>decision.placeSlug===item.slug).length} sourced {publicDecisions.filter(decision=>decision.placeSlug===item.slug).length===1?'case':'cases'}</small>
      </button>)}
    </nav>

    <div className='nt-place-summary'>
      <div><span className='nt-label'>{place.kind} / {place.label}</span><h3>{place.name}</h3><p>{place.intro}</p></div>
      <div className='nt-place-case-list' aria-label={place.name+' public decisions'}>
        {decisions.map(decision=><button type='button' key={decision.id} aria-pressed={decision.id===selected.id} onClick={()=>setDecisionId(decision.id)}>
          <DecisionStatus decision={decision}/><strong>{decision.shortTitle}</strong><span>{decision.authority}</span>
        </button>)}
      </div>
    </div>

    <div className='nt-place-map-grid'>
      <div className='nt-place-map'>
        <AtlasEmbed view={{
          kind:'NATION',
          title:place.name+' — public decision context',
          placeId:place.placeId,
          layers:['bluemarble'],
          description:'Navigate the same shared 4PLANET ATLAS from the public-decision place context.',
          limitation:'Navigation context only. Official administrative boundaries are registered from Kartverket/Geonorge but are not yet rendered here as decision-specific legal geometry.'
        }}/>
        <a className='nt-boundary-source' href='https://www.kartverket.no/api-og-data/grensedata' target='_blank' rel='noopener noreferrer'>OFFICIAL ADMINISTRATIVE GEOGRAPHY · KARTVERKET ↗</a>
      </div>

      <article className='nt-public-decision' aria-labelledby='nt-public-decision-title'>
        <div className='nt-public-decision-top'><span>{selected.jurisdiction} / {selected.placeName}</span><DecisionStatus decision={selected}/></div>
        <h3 id='nt-public-decision-title'>{selected.title}</h3>
        <p className='nt-public-decision-deck'>{selected.summary}</p>
        <div className='nt-public-meta'>
          <div><small>AUTHORITY</small><strong>{selected.authority}</strong></div>
          <div><small>NEXT / CURRENT</small><strong>{selected.nextStep}</strong></div>
          <div><small>SOURCE SNAPSHOT</small><strong>{selected.sourceAsOf}</strong></div>
        </div>
        <div className='nt-stage-path' aria-label='Decision journey'>
          {stageOrder.map((stage,index)=><span key={stage} data-state={index<activeStage?'passed':index===activeStage?'current':'future'}>{stage}</span>)}
        </div>
        <ol className='nt-public-thread'>
          {selected.journey.map(event=><li key={event.date+event.label}><time>{event.date}</time><div><small>{event.stage}</small><p>{event.label}</p><a href={event.sourceUrl} target='_blank' rel='noopener noreferrer'>VERIFY ORIGINAL ↗</a></div></li>)}
        </ol>
        <p className='nt-geo-boundary'>{selected.geographyNote}</p>
        <a className='nt-official-case' href={selected.sourceUrl} target='_blank' rel='noopener noreferrer'>OPEN OFFICIAL CASE / SOURCE ↗</a>
      </article>
    </div>

    <details className='nt-source-backbone'>
      <summary><span><span className='nt-label'>SOURCE FEDERATION</span><strong>What powers the Norway model?</strong></span><small>Open the data backbone</small></summary>
      <div className='nt-source-backbone-grid'>
        {nationSourceFederation.map(source=><article key={source.id}><span>{source.runtime}</span><h3>{source.label}</h3><p>{source.role}</p><small>{source.access}</small><a href={source.url} target='_blank' rel='noopener noreferrer'>SOURCE ↗</a></article>)}
      </div>
    </details>
  </section>;
}
