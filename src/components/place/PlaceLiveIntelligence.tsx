import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";

type State={loading:boolean;data:any|null;error:string|null};
const mono={fontFamily:T.mono,fontSize:10,letterSpacing:".12em",textTransform:"uppercase" as const};
const card={border:`1px solid ${T.line}`,padding:"clamp(18px,3vw,28px)",background:"#fff",minWidth:0};

export function PlaceLiveIntelligence({slug}:{slug:string}){
  const[state,setState]=useState<State>({loading:true,data:null,error:null});
  useEffect(()=>{
    const controller=new AbortController();
    setState({loading:true,data:null,error:null});
    fetch(`/api/place-intelligence?slug=${encodeURIComponent(slug)}`,{signal:controller.signal})
      .then(async r=>{const p=await r.json();if(!r.ok||!p?.ok)throw new Error(p?.error||"PLACE_INTELLIGENCE_UNAVAILABLE");return p})
      .then(data=>setState({loading:false,data,error:null}))
      .catch(error=>{if(error?.name!=="AbortError")setState({loading:false,data:null,error:String(error?.message||error)})});
    return()=>controller.abort();
  },[slug]);

  const live=state.data?.live;
  const sources=state.data?.sourceState;
  const gem=useMemo(()=>Array.isArray(live?.energyInfrastructure?.records)?live.energyInfrastructure.records:[],[live]);
  const trace=useMemo(()=>Array.isArray(live?.powerEmissionSources?.records)?live.powerEmissionSources.records:[],[live]);

  return <section style={{marginTop:48,border:`1px solid ${T.line}`,background:"#F7F8F6"}}>
    <div style={{padding:"clamp(22px,4vw,44px)",borderBottom:`1px solid ${T.line}`}}>
      <div style={{...mono,color:T.blue}}>PLACE INTELLIGENCE / LIVE CONTEXT</div>
      <h2 style={{margin:"14px 0 0",fontFamily:T.display,fontSize:"clamp(40px,7vw,84px)",lineHeight:.94,letterSpacing:"-.055em",fontWeight:500}}>Understand this place.</h2>
      <p style={{marginTop:18,maxWidth:860,lineHeight:1.6,color:T.dim}}>A first live PLACE CELL: physical energy infrastructure and source-level emissions context are composed into the same Oslofjord object you are already exploring. New population, building and Earth-change layers will attach here only after their source adapters are proven.</p>
    </div>

    {state.loading?<div style={{...card,color:T.dim}}>Loading current source context…</div>:null}
    {state.error?<div style={{...card,color:T.dim}}>Live place context is temporarily unavailable. The ecological PLACE page and ATLAS remain available.</div>:null}

    {state.data?<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:1,background:T.line}}>
        <div style={card}><div style={{...mono,color:T.blue}}>ENERGY / INDUSTRY</div><strong style={{display:"block",marginTop:10,fontFamily:T.display,fontSize:44,fontWeight:500}}>{live.energyInfrastructure.count}</strong><p style={{marginTop:8,color:T.dim,lineHeight:1.45}}>GEM infrastructure records inside the Oslofjord navigation extent.</p></div>
        <div style={card}><div style={{...mono,color:T.blue}}>POWER EMISSIONS SOURCES</div><strong style={{display:"block",marginTop:10,fontFamily:T.display,fontSize:44,fontWeight:500}}>{live.powerEmissionSources.count}</strong><p style={{marginTop:8,color:T.dim,lineHeight:1.45}}>Climate TRACE power-sector source records for the same extent.</p></div>
        <div style={card}><div style={{...mono,color:T.blue}}>NEXT VERIFIED LAYERS</div><strong style={{display:"block",marginTop:10,fontFamily:T.display,fontSize:28,fontWeight:500}}>Population · Buildings · Earth change</strong><p style={{marginTop:8,color:T.dim,lineHeight:1.45}}>WorldPop, building footprints and AlphaEarth are registered but deliberately not shown as live yet.</p></div>
      </div>

      {(gem.length||trace.length)?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:1,background:T.line,borderTop:`1px solid ${T.line}`}}>
        <div style={card}><div style={{...mono,color:T.blue}}>TRACKED INFRASTRUCTURE</div>{gem.slice(0,6).map((x:any)=><div key={x.id} style={{padding:"14px 0",borderBottom:`1px solid ${T.line}`}}><strong>{x.name}</strong><div style={{marginTop:5,color:T.dim,fontSize:12}}>{[x.assetType,x.operatingStatus,x.directOwnerName?("Owner: "+x.directOwnerName):null].filter(Boolean).join(" · ")}</div></div>)}</div>
        <div style={card}><div style={{...mono,color:T.blue}}>EMISSIONS SOURCE RECORDS</div>{trace.slice(0,6).map((x:any)=><div key={x.id} style={{padding:"14px 0",borderBottom:`1px solid ${T.line}`}}><strong>{x.name||x.id}</strong><div style={{marginTop:5,color:T.dim,fontSize:12}}>{[x.sector,x.subsector,x.year].filter(Boolean).join(" · ")}</div></div>)}</div>
      </div>:null}

      <div style={{...card,borderLeft:0,borderRight:0,borderBottom:0}}>
        <div style={{...mono,color:T.blue}}>SOURCE STATE</div>
        <p style={{marginTop:12,color:T.dim,lineHeight:1.55}}>GEM: {sources.globalEnergyMonitor} · Climate TRACE: {sources.climateTrace} · WorldPop: {sources.worldPop} · Buildings: {sources.buildings} · AlphaEarth: {sources.alphaEarth}</p>
        <p style={{marginTop:12,color:T.dim,fontSize:12,lineHeight:1.55}}><strong>BOUNDARY:</strong> {state.data.truthBoundary}</p>
        <Link to={state.data.atlasUrl} style={{...mono,display:"inline-block",marginTop:18,color:T.blue}}>OPEN INFRASTRUCTURE IN ATLAS →</Link>
      </div>
    </div>:null}
  </section>;
}
