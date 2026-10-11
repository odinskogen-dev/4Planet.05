import {Link} from "react-router-dom";
import {CALLS,THEMES,type Workspace,type Call} from "./financeData";
import "./finance-insights.css";
const stages=["Saved","Qualified","Preparing","Quality review","Ready for release"] as const;
function key(d:Date){return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")}
function monthTitle(k:string){return new Date(k+"-01T12:00:00Z").toLocaleDateString("en-GB",{month:"short",timeZone:"UTC"})}
function sixMonths(now:Date){const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));return Array.from({length:6},(_,i)=>key(new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+i,1))))}
export default function FinanceDecisionInsights({workspace,now=new Date()}:{workspace:Workspace;now?:Date}){
 const calls=workspace.pipeline.map(p=>CALLS.find(c=>c.id===p.callId)).filter((x):x is Call=>Boolean(x));
 const monthly=sixMonths(now).map(k=>({key:k,count:calls.filter(c=>c.deadline.startsWith(k)).length}));
 const maxMonth=Math.max(1,...monthly.map(x=>x.count));
 const stagesCount=stages.map(name=>({name,count:workspace.pipeline.filter(x=>x.status===name).length}));
 const maxStage=Math.max(1,...stagesCount.map(x=>x.count));
 const themes=THEMES.map(theme=>({theme,count:calls.filter(c=>c.themes.includes(theme)).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
 const maxTheme=Math.max(1,...themes.map(x=>x.count));
 const projects=workspace.projects.map(p=>({id:p.id,name:p.name,theme:p.theme,count:workspace.pipeline.filter(i=>i.projectId===p.id).length})).sort((a,b)=>a.count-b.count);
 const unlinked=workspace.pipeline.filter(x=>!x.projectId).length;
 return <section className="fc-decision-insights" aria-label="Funding decision intelligence">
 <div className="fc-sectionheading"><div><p className="fc-eyebrow">OPERATING INTELLIGENCE</p><h2>Finance at a glance</h2></div><span className="fc-tag">Demo records only</span></div>
 <div className="fc-decision-grid">
  <article className="fc-decision-panel"><header><div><h3>Deadline runway</h3><p>Saved illustrative deadlines</p></div><Link to="/finance/my/calendar">Year wheel</Link></header>
   <div className="fc-runway-bars">{monthly.map(x=><Link to={"/finance/my/calendar?month="+x.key} key={x.key} className="fc-runway-month" aria-label={monthTitle(x.key)+": "+x.count+" saved demonstration deadlines"}><span>{x.count||"—"}</span><div className="fc-runway-track"><i style={{height:x.count?Math.max(12,x.count/maxMonth*100)+"%":"4px"}}/></div><small>{monthTitle(x.key)}</small></Link>)}</div>
  </article>
  <article className="fc-decision-panel"><header><div><h3>Preparation funnel</h3><p>Internal stages, not submitted grants</p></div><Link to="/finance/my/pipeline">CRM</Link></header><div className="fc-funnel-list">{stagesCount.map(x=><Link key={x.name} to={"/finance/my/pipeline?stage="+encodeURIComponent(x.name)} className="fc-funnel-row"><span>{x.name}</span><span className="fc-funnel-track"><i style={{width:x.count?Math.max(6,x.count/maxStage*100)+"%":"0%"}}/></span><strong>{x.count}</strong></Link>)}</div></article>
  <article className="fc-decision-panel"><header><div><h3>Funding by theme</h3><p>Topics among saved demo calls</p></div><Link to="/finance/discover">Explore</Link></header><div className="fc-topic-list">{themes.length?themes.slice(0,6).map(x=><Link to={"/finance/discover?theme="+encodeURIComponent(x.theme)} className={"fc-topic-row fc-theme-"+x.theme.toLowerCase()} key={x.theme}><i className="fc-topic-swatch"/><span>{x.theme}</span><span className="fc-funnel-track"><i style={{width:x.count/maxTheme*100+"%"}}/></span><strong>{x.count}</strong></Link>):<p className="fc-empty-inline">Save an opportunity to see topic coverage.</p>}</div></article>
  <article className="fc-decision-panel"><header><div><h3>Project readiness</h3><p>Connections between projects and calls</p></div><Link to="/finance/my/projects">Projects</Link></header><div className="fc-readiness-list">{unlinked>0&&<Link className="fc-readiness-row" to="/finance/my/pipeline?unlinked=1"><span>Unassigned opportunities</span><strong>{unlinked}</strong></Link>}{projects.length?projects.slice(0,5).map(p=><Link key={p.id} className="fc-readiness-row" to={"/finance/my/projects/"+p.id}><span className={"fc-theme-"+p.theme.toLowerCase()}><i className="fc-topic-swatch"/> {p.name}</span><strong>{p.count} linked</strong></Link>):unlinked===0?<p className="fc-empty-inline">Create a project and link a call to see coverage.</p>:null}</div></article>
 </div>
 <p className="fc-decision-footnote">These charts count private demo CRM records only. They do not represent verified awards, expected cash, or real programme availability.</p>
 </section>;
}
