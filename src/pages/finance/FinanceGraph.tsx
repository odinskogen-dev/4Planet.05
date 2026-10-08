/* Read-only network mode over the canonical saved CRM/projects, not a second graph datastore. */
import {useMemo,useState} from "react";
import {CALLS,programmeFor,funderFor,type Project,type PipelineItem} from "./financeData";
import "./finance-shell.css";

type Node={id:string;name:string;kind:"Project"|"Opportunity"|"Programme"|"Funder";href:string;detail:string;column:number;};
type Edge={from:string;to:string};
export default function FinanceGraph({projects,pipeline,onNavigate}:{projects:Project[];pipeline:PipelineItem[];onNavigate:(path:string)=>void}){
 const [focus,setFocus]=useState("all"),[selected,setSelected]=useState(""),[scale,setScale]=useState(1);
 const {nodes,edges}=useMemo(()=>{
  const nodeMap=new Map<string,Node>(),edgeMap=new Map<string,Edge>();
  const put=(n:Node)=>nodeMap.set(n.id,n);
  const connect=(a:string,b:string)=>edgeMap.set(a+"|"+b,{from:a,to:b});
  const filtered=focus==="all"?pipeline:pipeline.filter(p=>p.projectId===focus);
  const linkedProjectIds=new Set(filtered.map(p=>p.projectId).filter(Boolean));
  for(const project of projects){if(focus==="all"||focus===project.id||linkedProjectIds.has(project.id))put({id:project.id,name:project.name,kind:"Project",href:"/my/projects/"+project.id,detail:project.description||project.theme,column:0})}
  if(filtered.some(p=>!p.projectId))put({id:"unassigned",name:"Unassigned pipeline",kind:"Project",href:"/my/pipeline",detail:"Opportunities that are not linked to a project",column:0});
  for(const item of filtered){
   const c=CALLS.find(x=>x.id===item.callId);if(!c)continue;
   const pr=programmeFor(c),f=funderFor(c);
   const callId="call:"+c.id,programmeId="programme:"+pr.id,funderId="funder:"+f.id;
   put({id:callId,name:c.title,kind:"Opportunity",href:"/opportunities/"+c.id,detail:"Illustrative deadline: "+c.deadline+" · "+item.status,column:1});
   put({id:programmeId,name:pr.name,kind:"Programme",href:"/programmes/"+pr.id,detail:pr.overview,column:2});
   put({id:funderId,name:f.name,kind:"Funder",href:"/funders/"+f.slug,detail:f.summary,column:3});
   connect(item.projectId||"unassigned",callId);connect(callId,programmeId);connect(programmeId,funderId);
  }
  return {nodes:[...nodeMap.values()],edges:[...edgeMap.values()]};
 },[projects,pipeline,focus]);
 const layout=useMemo(()=>{
  const out=new Map<string,{x:number;y:number}>();for(let col=0;col<4;col++){const items=nodes.filter(x=>x.column===col);items.forEach((n,i)=>out.set(n.id,{x:115+col*285,y:90+i*85}))}
  return out;
 },[nodes]);
 const height=Math.max(520,...[0,1,2,3].map(c=>nodes.filter(n=>n.column===c).length*85+125));
 const chosen=nodes.find(n=>n.id===selected);
 return <div className="fc-network">
  <div className="fc-sectionheading"><div><p className="fc-eyebrow">FINANCE NETWORK</p><h2>Funding map</h2></div><span className="fc-tag">Read-only view</span></div>
  <p className="fc-muted fc-network-intro">Follow the relationship from each project to saved funding opportunities, annual programmes and funding actors. Tap a node for its details.</p>
  <div className="fc-network-controls">
   <label>Show project<select aria-label="Graph project filter" value={focus} onChange={e=>{setFocus(e.target.value);setSelected("")}}><option value="all">All projects</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <div className="fc-network-zoom"><button aria-label="Zoom out" onClick={()=>setScale(s=>Math.max(.65,Math.round((s-.15)*100)/100))}>−</button><span>{Math.round(scale*100)}%</span><button aria-label="Zoom in" onClick={()=>setScale(s=>Math.min(1.5,Math.round((s+.15)*100)/100))}>+</button><button onClick={()=>setScale(1)}>Reset</button></div>
  </div>
  {!nodes.length?<div className="fc-empty"><strong>Your funding map has no relationships yet</strong><p>Create a project and save a funding opportunity to see it here.</p></div>:
  <>
   <div className="fc-network-key"><span>Projects</span><span>Opportunities</span><span>Programmes</span><span>Funders</span></div>
   <div className="fc-network-canvas" aria-label="Funding relationships">
    <svg role="img" aria-label={"Funding network with "+nodes.length+" nodes"} width={1200*scale} height={height*scale} viewBox={"0 0 1200 "+height}>
     <g fill="none" stroke="var(--fc-map-edge)" strokeWidth="1.8">{edges.map(e=>{const a=layout.get(e.from),b=layout.get(e.to);return a&&b?<path key={e.from+"-"+e.to} d={"M"+a.x+" "+a.y+" C"+(a.x+115)+" "+a.y+" "+(b.x-115)+" "+b.y+" "+b.x+" "+b.y}/>:null})}</g>
     {nodes.map(n=>{const p=layout.get(n.id)!;return <g key={n.id} role="button" tabIndex={0} aria-label={n.kind+": "+n.name} onClick={()=>setSelected(n.id)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(n.id)}}} className={"fc-network-node "+(selected===n.id?"chosen":"")}>
       <rect x={p.x-94} y={p.y-28} width="188" height="57" rx="12" fill={selected===n.id?"var(--fc-node-selected)":"var(--fc-node)"} stroke={selected===n.id?"var(--fc-aqua)":"var(--fc-border)"} strokeWidth={selected===n.id?2:1}/>
       <circle cx={p.x-75} cy={p.y} r="5" fill={["var(--fc-aqua)","var(--fc-blue)","var(--fc-map-programme)","var(--fc-map-funder)"][n.column]}/>
       <text x={p.x-63} y={p.y+4} fill="var(--fc-ink)" fontSize="12" fontWeight="600" fontFamily="DM Sans, sans-serif">{n.name.length>22?n.name.slice(0,21)+"…":n.name}</text>
      </g>})}
    </svg>
   </div>
   {chosen&&<div className="fc-network-detail" role="region" aria-label="Selected funding node details">
    <div><span className="fc-eyebrow">{chosen.kind}</span><h3>{chosen.name}</h3><p>{chosen.detail}</p></div>
    <div><button className="fc-btn fc-btn-primary" onClick={()=>onNavigate(chosen.href)}>Open {chosen.kind.toLowerCase()}</button><button className="fc-btn" onClick={()=>setSelected("")}>Close</button></div>
   </div>}
   <div className="fc-network-list"><strong>Accessible network list</strong>{nodes.map(n=><button key={n.id} onClick={()=>onNavigate(n.href)}><span>{n.kind}</span>{n.name}</button>)}</div>
  </>}
 </div>
}
