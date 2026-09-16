import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import "@/styles/fourbrands-twin.css";

type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";
type Confidence = "HIGH" | "MEDIUM" | "LOW";
type ViewId = "home" | "company" | "finance" | "revenue" | "products" | "market" | "marketing" | "operations" | "people" | "brand" | "risk" | "planet" | "opportunities" | "decisions" | "interventions" | "results" | "learning" | "evidence" | "inbox";
type Metric = { label: string; value: string; period: string; truthClass: TruthClass; sourceIds: string[] };
type Statement = { title: string; detail: string; truthClass: TruthClass; confidence: Confidence; sourceIds: string[] };
type Opportunity = { rank: number; title: string; economicLogic: string; estimatedValue: string; planetaryLogic: string; planetaryDelta: string; truthClass: TruthClass; confidence: Confidence; sourceIds: string[] };
type Evidence = { id: string; title: string; publisher: string; url: string; checkedAt: string; note: string };
type Analysis = {
  engine: string;
  company: { name: string; legalName: string; ticker: string; sector: string; geography: string; description: string };
  generatedAt: string;
  analysisStatus: "LIVE_RESEARCH" | "SEEDED_PROOF" | "PARTIAL";
  statusNote: string;
  economicBaseline: Metric[];
  businessModel: Statement[];
  valueDrivers: Statement[];
  valueLeakage: Statement[];
  opportunities: Opportunity[];
  alignedTop3: Opportunity[];
  solutions: Statement[];
  nextExperiment: { title: string; hypothesis: string; method: string; successMetric: string; economicMeasurement: string; planetaryMeasurement: string; truthClass: TruthClass };
  evidence: Evidence[];
  assumptions: string[];
  unknowns: string[];
};
type TwinInput = {
  objective: string; revenue: string; margin: string; cash: string; customers: string; operations: string; people: string;
  brand: string; primaryRisk: string; planet: string; selectedOpportunity: string; intervention: string; decisionState: string;
  measuredResult: string; notes: string; files: string[];
};

const EMPTY_TWIN: TwinInput = {
  objective:"",revenue:"",margin:"",cash:"",customers:"",operations:"",people:"",brand:"",primaryRisk:"",planet:"",
  selectedOpportunity:"",intervention:"",decisionState:"OPPORTUNITY",measuredResult:"",notes:"",files:[]
};
const DECISION_STATES = ["OPPORTUNITY","REVIEWED","CHOSEN","BASELINE LOCKED","INTERVENTION STARTED","MEASURED","VALUE ATTRIBUTION REVIEWED","REALISED","NOT REALISED","LEARNING"];
const LOAD_STEPS = ["Finding company","Resolving identity","Finding official records","Reading website","Finding financial evidence","Mapping products","Mapping people","Mapping market","Mapping planet intersections","Building Company Twin"];
const PRIMARY_NAV: {id:ViewId;label:string}[] = [
  {id:"home",label:"Home"},{id:"company",label:"Company"},{id:"finance",label:"Finance"},{id:"opportunities",label:"Opportunities"},
  {id:"decisions",label:"Decisions"},{id:"evidence",label:"Evidence"},{id:"inbox",label:"Inbox"}
];
const COMPANY_MODULES: {id:ViewId;label:string;hint:string}[] = [
  {id:"company",label:"Company",hint:"Identity + business model"},{id:"finance",label:"Finance",hint:"Economic spine"},{id:"revenue",label:"Revenue",hint:"How money enters"},
  {id:"products",label:"Products",hint:"What is sold"},{id:"market",label:"Customers / Market",hint:"Who chooses and why"},{id:"marketing",label:"Marketing",hint:"Attention → demand"},
  {id:"operations",label:"Operations",hint:"Delivery + constraints"},{id:"people",label:"People",hint:"Capacity + ownership"},{id:"brand",label:"Brand / Web",hint:"Promise + projection"},
  {id:"risk",label:"Risk",hint:"What can destroy value"},{id:"planet",label:"Planet",hint:"Dependencies + intersections"},{id:"opportunities",label:"Opportunities",hint:"Available value"},
  {id:"decisions",label:"Decisions",hint:"Human choice"},{id:"interventions",label:"Interventions",hint:"Bounded action"},{id:"results",label:"Results",hint:"Measured change"},
  {id:"learning",label:"Learning",hint:"Organisational memory"},{id:"evidence",label:"Sources / Evidence",hint:"Provenance + truth"},{id:"inbox",label:"Company Inbox",hint:"What to learn next"}
];

const FOURPLANET_PROOF: Analysis = {
  engine:"4BRANDS COMPANY TWIN FOUNDATION 01",
  company:{
    name:"4PLANET",legalName:"",ticker:"",sector:"Living planet intelligence / ecological action technology",geography:"Norway / global ambition",
    description:"4PLANET is building living-planet intelligence and action products. Public evidence can describe the product world, but the company economics and operating state remain largely private."
  },
  generatedAt:new Date().toISOString(),analysisStatus:"PARTIAL",
  statusNote:"Sparse public-data case. This Twin deliberately leaves private company economics, customers, operations and results unresolved until the company supplies them.",
  economicBaseline:[
    {label:"Revenue",value:"UNKNOWN",period:"Current",truthClass:"UNKNOWN",sourceIds:["4P-WEB"]},
    {label:"Margin",value:"UNKNOWN",period:"Current",truthClass:"UNKNOWN",sourceIds:["4P-WEB"]},
    {label:"Operating cash",value:"UNKNOWN",period:"Current",truthClass:"UNKNOWN",sourceIds:["4P-WEB"]},
    {label:"Employees",value:"UNKNOWN",period:"Current",truthClass:"UNKNOWN",sourceIds:["4P-WEB"]}
  ],
  businessModel:[
    {title:"Living planet intelligence",detail:"Public product positioning indicates a system that connects ecological understanding, action and proof.",truthClass:"INTERPRETATION",confidence:"MEDIUM",sourceIds:["4P-WEB"]},
    {title:"Multiple product surfaces",detail:"Public product surfaces indicate different ways to explore people, species, places and action while sharing a wider 4PLANET identity.",truthClass:"INTERPRETATION",confidence:"MEDIUM",sourceIds:["4P-WEB"]}
  ],
  valueDrivers:[
    {title:"Shared intelligence infrastructure",detail:"If multiple products reuse the same underlying truth and actor infrastructure, marginal product-building cost may fall as reuse grows.",truthClass:"ASSUMPTION",confidence:"MEDIUM",sourceIds:["4P-WEB"]},
    {title:"Proof of useful outcomes",detail:"Commercial value should increase when product usage can be connected to measurable decisions and outcomes.",truthClass:"INTERPRETATION",confidence:"MEDIUM",sourceIds:["4P-WEB"]}
  ],
  valueLeakage:[
    {title:"Economic baseline missing",detail:"Public sources do not provide a decision-grade revenue, margin, cash or cost baseline.",truthClass:"UNKNOWN",confidence:"HIGH",sourceIds:["4P-WEB"]},
    {title:"Customer evidence incomplete",detail:"Public evidence alone cannot resolve paying customer cohorts, retention, pipeline or willingness to pay.",truthClass:"UNKNOWN",confidence:"HIGH",sourceIds:["4P-WEB"]}
  ],
  opportunities:[
    {rank:1,title:"Complete the economic baseline",economicLogic:"Without revenue, cost, margin and cash truth, value priorities cannot be ranked defensibly.",estimatedValue:"UNKNOWN until company finance data is supplied.",planetaryLogic:"Neutral enabling step.",planetaryDelta:"UNKNOWN",truthClass:"UNKNOWN",confidence:"HIGH",sourceIds:["4P-WEB"]},
    {rank:2,title:"Prove one repeatable paid value loop",economicLogic:"A bounded paid use case can convert product architecture into commercial evidence and reusable learning.",estimatedValue:"ASSUMPTION: value depends on buyer, price, cost and repeatability.",planetaryLogic:"Alignment exists only if the paid loop creates a measured ecological outcome or better decision.",planetaryDelta:"UNKNOWN until a bounded intervention is measured.",truthClass:"ASSUMPTION",confidence:"MEDIUM",sourceIds:["4P-WEB"]},
    {rank:3,title:"Measure reuse across product surfaces",economicLogic:"Shared infrastructure becomes economically meaningful when reuse measurably reduces marginal build or operating cost.",estimatedValue:"UNKNOWN until engineering and delivery baselines exist.",planetaryLogic:"Shared infrastructure can reduce duplicated resource use, but the material effect is not yet measured.",planetaryDelta:"UNKNOWN",truthClass:"INTERPRETATION",confidence:"MEDIUM",sourceIds:["4P-WEB"]},
    {rank:4,title:"Connect public attention to conversion",economicLogic:"Public product surfaces only become a business driver if attention connects to activation, retention, payment or funded action.",estimatedValue:"UNKNOWN until funnel data is connected.",planetaryLogic:"Action conversion may create planetary value if resulting actions are verified.",planetaryDelta:"UNKNOWN",truthClass:"INTERPRETATION",confidence:"MEDIUM",sourceIds:["4P-WEB"]}
  ],
  alignedTop3:[],solutions:[
    {title:"Company-provided finance state",detail:"Add revenue, costs, margin, cash and obligations as company truth before ranking financial opportunities.",truthClass:"INTERPRETATION",confidence:"HIGH",sourceIds:["4P-WEB"]},
    {title:"Connect product and conversion evidence",detail:"Add usage, funnel, commerce and outcome data to connect product activity to economic and planetary results.",truthClass:"INTERPRETATION",confidence:"MEDIUM",sourceIds:["4P-WEB"]}
  ],
  nextExperiment:{title:"Complete the Twin",hypothesis:"A small amount of company-provided truth will materially improve decision quality.",method:"Add finance, customer and operating baseline, then rerank opportunities.",successMetric:"Higher Twin completeness with fewer high-impact unknowns.",economicMeasurement:"Rankable economic opportunities with explicit baseline.",planetaryMeasurement:"Only attach planetary delta where mechanism and measurement exist.",truthClass:"ASSUMPTION"},
  evidence:[{id:"4P-WEB",title:"4PLANET public product world",publisher:"4PLANET",url:"https://4planet.org",checkedAt:"2026-09-16",note:"Public product source only. Internal BRAIN and private company economics are not exposed to this public-first Twin."}],
  assumptions:["Public product architecture may support multiple future revenue models; none is treated as proven here."],
  unknowns:["Verified legal entity behind the 4PLANET product brand","Revenue, costs, margin and cash","Paying customer cohorts and retention","Internal operating capacity and constraints","Measured economic and planetary results"]
};
FOURPLANET_PROOF.alignedTop3 = FOURPLANET_PROOF.opportunities.slice(0,3);

const slug = (value:string) => value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "company";
const normalise = (value:string) => value.toLowerCase().replace(/[^a-z0-9]/g,"");
const truthClassName = (value:TruthClass) => `fbt-truth fbt-truth--${value.toLowerCase()}`;
const confidenceClass = (value:Confidence) => `fbt-status__dot fbt-status__dot--${value.toLowerCase()}`;

function TruthPill({value}:{value:TruthClass}){return <span className={truthClassName(value)}>{value}</span>}
function EmptyState({title,text,action}:{title:string;text:string;action?:()=>void}){
  return <div className="fbt-empty"><span className="fbt-empty__dot"/><strong>{title}</strong><p>{text}</p>{action&&<button className="fbt-button fbt-button--soft" onClick={action}>Add company data</button>}</div>
}
function StatementStack({items,empty,onComplete}:{items:Statement[];empty:string;onComplete:()=>void}){
  if(!items.length)return <EmptyState title="Not known yet" text={empty} action={onComplete}/>;
  return <div className="fbt-statement-stack">{items.map((item)=><article key={`${item.title}-${item.detail}`}>
    <h3>{item.title}</h3><p>{item.detail}</p><div className="fbt-statement-meta"><TruthPill value={item.truthClass}/><span className="fbt-status"><i className={confidenceClass(item.confidence)}/>{item.confidence}</span></div>
  </article>)}</div>
}
function TwinField({label,value,placeholder,onChange}:{label:string;value:string;placeholder:string;onChange:(value:string)=>void}){
  return <label className="fbt-field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(e)=>onChange(e.target.value)}/></label>
}
function Surface({title,meta,children}:{title:string;meta?:string;children:ReactNode}){
  return <section className="fbt-surface"><div className="fbt-surface-head"><span>{title}</span>{meta&&<small>{meta}</small>}</div>{children}</section>
}

export default function FourBrandLive(){
  const [query,setQuery]=useState("TOMRA");
  const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [twin,setTwin]=useState<TwinInput>(EMPTY_TWIN);
  const [view,setView]=useState<ViewId>("home");
  const [loading,setLoading]=useState(false);
  const [loadingStep,setLoadingStep]=useState(0);
  const [error,setError]=useState("");
  const [activeOpportunity,setActiveOpportunity]=useState(0);
  const [modulesOpen,setModulesOpen]=useState(false);
  const [completeOpen,setCompleteOpen]=useState(false);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    if(!analysis)return;
    try{
      const raw=localStorage.getItem(`4brands:twin:${slug(analysis.company.name)}`);
      setTwin(raw?{...EMPTY_TWIN,...JSON.parse(raw)}:EMPTY_TWIN);
    }catch{setTwin(EMPTY_TWIN)}
  },[analysis?.company.name]);

  const opportunity=analysis?.opportunities[activeOpportunity]||analysis?.opportunities[0];
  const leadMetrics=analysis?.economicBaseline.slice(0,4)||[];
  const completeness=useMemo(()=>{
    if(!analysis)return 0;
    const publicKnown=analysis.economicBaseline.filter(m=>m.truthClass!=="UNKNOWN"&&m.value!=="UNKNOWN").length+analysis.evidence.length+(analysis.company.legalName?1:0);
    const privateKnown=Object.entries(twin).filter(([key,value])=>key!=="files"&&typeof value==="string"&&value.trim()).length;
    return Math.min(96,10+publicKnown*6+privateKnown*3+(twin.files.length?3:0));
  },[analysis,twin]);
  const inboxCount=(analysis?.unknowns.length||0)+(analysis?.assumptions.length||0)+twin.files.length;

  async function runAnalysis(event?:FormEvent,forced?:string){
    event?.preventDefault();
    const company=(forced||query).trim();
    if(company.length<2)return;
    setQuery(company);setLoading(true);setLoadingStep(0);setError("");setAnalysis(null);setView("home");setActiveOpportunity(0);
    const timer=window.setInterval(()=>setLoadingStep(current=>Math.min(current+1,LOAD_STEPS.length-1)),440);
    try{
      if(["4planet","fourplanet"].includes(normalise(company))){
        await new Promise(resolve=>window.setTimeout(resolve,1900));
        setAnalysis({...FOURPLANET_PROOF,generatedAt:new Date().toISOString()});
      }else{
        const response=await fetch("/api/brand-analysis",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({company})});
        const payload=await response.json() as {analysis?:Analysis;error?:string;detail?:string};
        if(!response.ok||!payload.analysis)throw new Error(payload.detail||payload.error||"Company research is unavailable.");
        setAnalysis(payload.analysis);
      }
    }catch(cause){setError(cause instanceof Error?cause.message:"Company research is unavailable.")}
    finally{window.clearInterval(timer);setLoading(false);setLoadingStep(LOAD_STEPS.length-1)}
  }
  function reset(){setAnalysis(null);setView("home");setError("");setMobileNavOpen(false)}
  function changeView(next:ViewId){setView(next);setModulesOpen(false);setMobileNavOpen(false)}
  function patchTwin<K extends keyof TwinInput>(key:K,value:TwinInput[K]){setTwin(current=>({...current,[key]:value}));setSaved(false)}
  function saveTwin(){if(!analysis)return;localStorage.setItem(`4brands:twin:${slug(analysis.company.name)}`,JSON.stringify(twin));setSaved(true);window.setTimeout(()=>setSaved(false),1400)}

  if(!analysis){
    return <main className="fbt-app fbt-entry">
      <section className="fbt-entry-shell">
        <nav className="fbt-entry-nav"><a className="fbt-brand" href="https://4planet.org">4BRANDS<span>_</span></a><a href="https://4planet.org">by 4PLANET</a></nav>
        <div className="fbt-entry__copy">
          <div><p className="fbt-kicker">COMPANY CONTROL SYSTEM / PUBLIC BETA</p><h1>See your whole company.</h1><p>Type a company name. 4BRANDS builds the best public Company Twin it can, shows what is known, what is missing, and where value may be hiding.</p></div>
          <form className="fbt-search-card" onSubmit={runAnalysis}>
            <label htmlFor="fbt-company">Enter your company</label>
            <div className="fbt-search-row"><input id="fbt-company" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Company name" autoComplete="organization" autoFocus maxLength={120}/><button className="fbt-button fbt-button--primary fbt-button--round" type="submit" disabled={loading||query.trim().length<2} aria-label="Build Company Twin">→</button></div>
            <div className="fbt-search-meta"><span>PUBLIC EVIDENCE</span><span>TRUTH-AWARE</span><span>FINANCE FIRST</span></div>
            <div className="fbt-quick"><button type="button" onClick={()=>runAnalysis(undefined,"TOMRA")}>Try TOMRA <small>rich public data</small></button><button type="button" onClick={()=>runAnalysis(undefined,"4PLANET")}>Try 4PLANET <small>sparse public data</small></button></div>
          </form>
        </div>
        <footer className="fbt-entry-footer"><span>ONE COMPANY → ONE STATE → ONE INTERFACE</span><p>Facts remain facts. Estimates remain estimates. Private company truth is added only when the company provides it.</p></footer>
      </section>
      {loading&&<div className="fbt-build" role="status"><div className="fbt-build__card"><div className="fbt-build__top"><span>BUILDING COMPANY TWIN</span><strong>{Math.round(((loadingStep+1)/LOAD_STEPS.length)*100)}%</strong></div><h2>{query}</h2><div className="fbt-build__progress"><i style={{width:`${((loadingStep+1)/LOAD_STEPS.length)*100}%`}}/></div><div className="fbt-build__steps">{LOAD_STEPS.map((step,index)=><span key={step} className={index<=loadingStep?"is-done":""}>{index<loadingStep?"✓":index===loadingStep?"•":"○"} {step}</span>)}</div></div></div>}
      {error&&<div className="fbt-toast fbt-toast--error"><div><strong>Research paused</strong><span>{error}</span></div><button onClick={()=>{setError("");setQuery("TOMRA")}}>Use TOMRA proof</button></div>}
    </main>
  }

  return <main className="fbt-app">
    <header className="fbt-topbar">
      <div className="fbt-topbar__left"><button className="fbt-mobile-menu" onClick={()=>setMobileNavOpen(v=>!v)} aria-label="Open navigation">☰</button><button className="fbt-brand fbt-brand--button" onClick={reset}>4BRANDS<span>_</span></button><span className="fbt-byline">BY 4PLANET</span></div>
      <button className="fbt-company-switch" onClick={reset}><span className="fbt-company-dot"/><strong>{analysis.company.name}</strong><small>Switch company</small></button>
      <div className="fbt-topbar__actions"><button className="fbt-icon-button" onClick={()=>changeView("inbox")}>Inbox <span>{inboxCount}</span></button><button className="fbt-button fbt-button--primary" onClick={()=>setCompleteOpen(true)}>Complete Twin</button></div>
    </header>
    <div className="fbt-frame">
      <aside className={`fbt-sidebar${mobileNavOpen?" is-open":""}`}>
        <nav>{PRIMARY_NAV.map(item=><button key={item.id} className={view===item.id?"is-active":""} onClick={()=>changeView(item.id)}><span>{item.label}</span>{item.id==="inbox"&&<small>{inboxCount}</small>}</button>)}</nav>
        <div className="fbt-sidebar__bottom"><div className="fbt-completeness"><span>Twin completeness</span><strong>{completeness}%</strong></div><i><b style={{width:`${completeness}%`}}/></i><button className="fbt-button fbt-button--soft" onClick={()=>setModulesOpen(true)}>Explore company</button></div>
      </aside>
      <section className="fbt-workspace">
        <div className="fbt-contextbar"><span>{analysis.analysisStatus.replaceAll("_"," ")} · {analysis.evidence.length} SOURCES</span><button onClick={()=>setModulesOpen(true)}>Whole company ↗</button></div>

        {view==="home"&&<div className="fbt-view fbt-home">
          <div className="fbt-view-head fbt-view-head--home"><div><p className="fbt-kicker">COMPANY HOME</p><h1>{analysis.company.name}</h1><p>{analysis.company.description}</p></div></div>
          <div className="fbt-metric-rail">{leadMetrics.map(metric=><article className="fbt-metric" key={`${metric.label}-${metric.period}`}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.period}</small></article>)}</div>
          <div className="fbt-home-grid">
            <article className="fbt-hero-card"><div className="fbt-card-label"><span>WHAT MATTERS NOW</span>{opportunity&&<TruthPill value={opportunity.truthClass}/>}</div><h2>{opportunity?.title||"Complete the Twin to find the next move."}</h2><p>{opportunity?.economicLogic||analysis.statusNote}</p><div className="fbt-card-actions"><button className="fbt-button fbt-button--light" onClick={()=>changeView("opportunities")}>Open opportunity</button><button className="fbt-text-button" onClick={()=>changeView("evidence")}>See evidence →</button></div></article>
            <article className="fbt-state-card"><div className="fbt-card-label"><span>COMPANY STATE</span><small>{new Date(analysis.generatedAt).toLocaleDateString()}</small></div><div className="fbt-state-score"><strong>{completeness}%</strong><span>of the current Twin has usable signal</span></div><div className="fbt-state-row"><span>Known sources</span><strong>{analysis.evidence.length}</strong></div><div className="fbt-state-row"><span>Open unknowns</span><strong>{analysis.unknowns.length}</strong></div><div className="fbt-state-row"><span>Company files</span><strong>{twin.files.length}</strong></div><button className="fbt-button fbt-button--soft fbt-button--full" onClick={()=>setCompleteOpen(true)}>Improve the Twin</button></article>
          </div>
        </div>}

        {view==="company"&&<div className="fbt-view"><div className="fbt-view-head"><div><p className="fbt-kicker">COMPANY</p><h1>The company, in one place.</h1><p>{analysis.statusNote}</p></div><button className="fbt-button fbt-button--soft" onClick={()=>setCompleteOpen(true)}>Add company truth</button></div><div className="fbt-company-card"><div className="fbt-identity"><span>IDENTITY</span><h2>{analysis.company.legalName||analysis.company.name}</h2><p>{analysis.company.sector||"Sector unresolved"}</p><div><small>{analysis.company.geography||"Geography unresolved"}</small>{analysis.company.ticker&&<small>{analysis.company.ticker}</small>}</div></div><div className="fbt-company-columns"><section><span>HOW IT CREATES VALUE</span><StatementStack items={analysis.businessModel} empty="Add product and revenue model data." onComplete={()=>setCompleteOpen(true)}/></section><section><span>WHAT DRIVES VALUE</span><StatementStack items={analysis.valueDrivers} empty="Drivers need more evidence." onComplete={()=>setCompleteOpen(true)}/></section></div></div></div>}

        {view==="finance"&&<div className="fbt-view"><div className="fbt-view-head"><div><p className="fbt-kicker">FINANCE / ECONOMIC SPINE</p><h1>Know the economic state.</h1><p>Public financial evidence first. Company-provided truth completes the operating baseline.</p></div><button className="fbt-button fbt-button--primary" onClick={()=>setCompleteOpen(true)}>Add finance data</button></div><div className="fbt-finance-layout"><section className="fbt-surface fbt-finance-table"><div className="fbt-surface-head"><span>ECONOMIC BASELINE</span><small>{analysis.economicBaseline.length} metrics</small></div>{analysis.economicBaseline.map(metric=><div className="fbt-finance-row" key={`${metric.label}-${metric.period}`}><div><strong>{metric.label}</strong><small>{metric.period}</small></div><b>{metric.value}</b><TruthPill value={metric.truthClass}/></div>)}</section><aside className="fbt-surface fbt-finance-side"><div className="fbt-surface-head"><span>VALUE LEAKAGE</span><small>{analysis.valueLeakage.length} signals</small></div><StatementStack items={analysis.valueLeakage} empty="No defensible leakage signal yet." onComplete={()=>setCompleteOpen(true)}/></aside></div></div>}

        {view==="opportunities"&&<div className="fbt-view fbt-view--flush"><div className="fbt-view-head fbt-view-head--compact"><div><p className="fbt-kicker">OPPORTUNITIES</p><h1>Where is the largest available value?</h1></div><span className="fbt-head-note">Hypotheses are not realised value.</span></div><div className="fbt-opportunity-layout"><div className="fbt-opportunity-list">{analysis.opportunities.map((item,index)=><button key={`${item.rank}-${item.title}`} className={index===activeOpportunity?"is-active":""} onClick={()=>setActiveOpportunity(index)}><span>{String(item.rank).padStart(2,"0")}</span><strong>{item.title}</strong><TruthPill value={item.truthClass}/></button>)}</div>{opportunity?<article className="fbt-opportunity-detail"><div className="fbt-card-label"><span>OPPORTUNITY {String(opportunity.rank).padStart(2,"0")}</span><div><TruthPill value={opportunity.truthClass}/></div></div><h2>{opportunity.title}</h2><section><span>AVAILABLE VALUE</span><p>{opportunity.estimatedValue}</p></section><section><span>WHY IT MAY MATTER</span><p>{opportunity.economicLogic}</p></section><section><span>PLANET INTERSECTION</span><p>{opportunity.planetaryLogic}</p><small>{opportunity.planetaryDelta}</small></section><div className="fbt-card-actions"><button className="fbt-button fbt-button--primary" onClick={()=>{patchTwin("selectedOpportunity",opportunity.title);changeView("decisions")}}>Take to decision</button><button className="fbt-text-button" onClick={()=>changeView("evidence")}>Inspect evidence →</button></div></article>:<EmptyState title="No ranked opportunity yet" text="Complete the Twin to create a defensible opportunity set." action={()=>setCompleteOpen(true)}/>}</div></div>}

        {view==="decisions"&&<div className="fbt-view"><div className="fbt-view-head"><div><p className="fbt-kicker">DECISIONS / VALUE LEDGER</p><h1>Make the choice explicit.</h1><p>An opportunity only becomes value after a human decision, bounded intervention and measured result.</p></div><button className="fbt-button fbt-button--soft" onClick={saveTwin}>{saved?"Saved":"Save decision"}</button></div><div className="fbt-decision-grid"><label className="fbt-input-card"><span>SELECTED OPPORTUNITY</span><textarea rows={3} value={twin.selectedOpportunity} onChange={e=>patchTwin("selectedOpportunity",e.target.value)} placeholder="Choose an opportunity"/></label><label className="fbt-input-card"><span>DECISION STATE</span><select value={twin.decisionState} onChange={e=>patchTwin("decisionState",e.target.value)}>{DECISION_STATES.map(state=><option key={state}>{state}</option>)}</select></label><label className="fbt-input-card fbt-input-card--wide"><span>INTERVENTION</span><textarea rows={3} value={twin.intervention} onChange={e=>patchTwin("intervention",e.target.value)} placeholder="What will actually change?"/></label><label className="fbt-input-card fbt-input-card--wide"><span>MEASURED RESULT</span><textarea rows={3} value={twin.measuredResult} onChange={e=>patchTwin("measuredResult",e.target.value)} placeholder="No result yet — measurement remains open"/></label></div></div>}

        {view==="evidence"&&<div className="fbt-view"><div className="fbt-view-head"><div><p className="fbt-kicker">SOURCES / FACTS / PROVENANCE</p><h1>Know why the Twin believes something.</h1><p>Public evidence, calculations and interpretations remain visibly different.</p></div></div><div className="fbt-evidence-layout"><section className="fbt-surface"><div className="fbt-surface-head"><span>SOURCES</span><small>{analysis.evidence.length}</small></div><div className="fbt-source-list">{analysis.evidence.map(source=><a href={source.url} target="_blank" rel="noreferrer" key={source.id}><div><span>{source.publisher}</span><small>{source.checkedAt}</small></div><strong>{source.title}</strong><p>{source.note}</p><i>↗</i></a>)}</div></section><aside className="fbt-surface fbt-truth-guide"><div className="fbt-surface-head"><span>TRUTH CLASSES</span><small>Never collapse these</small></div>{(["FACT","CALCULATION","ESTIMATE","ASSUMPTION","INTERPRETATION","UNKNOWN"] as TruthClass[]).map(truth=><div key={truth}><TruthPill value={truth}/><p>{truth==="FACT"?"Directly supported by a source.":truth==="CALCULATION"?"Derived from stated inputs.":truth==="UNKNOWN"?"The Twin does not know yet.":"A bounded model output, not a fact."}</p></div>)}</aside></div></div>}

        {view==="inbox"&&<div className="fbt-view"><div className="fbt-view-head"><div><p className="fbt-kicker">COMPANY INBOX</p><h1>What should the Twin learn next?</h1><p>New information stays reviewable. Nothing silently overwrites company truth.</p></div><button className="fbt-button fbt-button--primary" onClick={()=>setCompleteOpen(true)}>Add information</button></div><div className="fbt-inbox-grid"><Surface title="MISSING INFORMATION" meta={String(analysis.unknowns.length)}>{analysis.unknowns.map(item=><div className="fbt-inbox-row" key={item}><span className="fbt-inbox-icon">?</span><p>{item}</p><small>REVIEW</small></div>)}</Surface><Surface title="ASSUMPTIONS TO CONFIRM" meta={String(analysis.assumptions.length)}>{analysis.assumptions.map(item=><div className="fbt-inbox-row" key={item}><span className="fbt-inbox-icon">≈</span><p>{item}</p><small>CONFIRM</small></div>)}</Surface></div>{twin.files.length>0&&<div className="fbt-files"><span>LOCAL FILE INTAKE</span>{twin.files.map(file=><b key={file}>{file}</b>)}</div>}</div>}

        {["revenue","products","market","marketing","operations","people","brand","risk","planet","interventions","results","learning"].includes(view)&&<ModuleView view={view} analysis={analysis} twin={twin} onComplete={()=>setCompleteOpen(true)} onNavigate={changeView}/>}      
      </section>
    </div>

    {modulesOpen&&<div className="fbt-overlay" onMouseDown={()=>setModulesOpen(false)}><section className="fbt-module-sheet" onMouseDown={e=>e.stopPropagation()}><div className="fbt-sheet-head"><div><span>THE WHOLE COMPANY</span><h2>One Twin. Controlled depth.</h2></div><button onClick={()=>setModulesOpen(false)} aria-label="Close">×</button></div><div className="fbt-module-grid">{COMPANY_MODULES.map(module=><button key={module.id} onClick={()=>changeView(module.id)} className={view===module.id?"is-active":""}><span>{module.label}</span><small>{module.hint}</small><i>→</i></button>)}</div></section></div>}

    {completeOpen&&<div className="fbt-overlay fbt-overlay--drawer" onMouseDown={()=>setCompleteOpen(false)}><aside className="fbt-drawer" onMouseDown={e=>e.stopPropagation()}><div className="fbt-sheet-head"><div><span>COMPLETE YOUR TWIN</span><h2>Add company truth.</h2></div><button onClick={()=>setCompleteOpen(false)} aria-label="Close">×</button></div><p className="fbt-drawer__intro">Prototype intake: these fields are stored only in this browser. They are company-provided working state, not verified public facts.</p><div className="fbt-form-grid">
      <TwinField label="Primary objective" value={twin.objective} onChange={v=>patchTwin("objective",v)} placeholder="What must improve?"/><TwinField label="Annual revenue" value={twin.revenue} onChange={v=>patchTwin("revenue",v)} placeholder="Company-provided baseline"/><TwinField label="Margin" value={twin.margin} onChange={v=>patchTwin("margin",v)} placeholder="Gross / contribution / EBITA"/><TwinField label="Cash / conversion" value={twin.cash} onChange={v=>patchTwin("cash",v)} placeholder="Working capital / runway / OCF"/><TwinField label="Customers / market" value={twin.customers} onChange={v=>patchTwin("customers",v)} placeholder="Who pays and why?"/><TwinField label="Operations" value={twin.operations} onChange={v=>patchTwin("operations",v)} placeholder="Capacity, delivery, constraints"/><TwinField label="People" value={twin.people} onChange={v=>patchTwin("people",v)} placeholder="Team / roles / capacity"/><TwinField label="Brand / web" value={twin.brand} onChange={v=>patchTwin("brand",v)} placeholder="Promise / channels / conversion"/><TwinField label="Primary risk" value={twin.primaryRisk} onChange={v=>patchTwin("primaryRisk",v)} placeholder="What could materially break value?"/><TwinField label="Planet intersection" value={twin.planet} onChange={v=>patchTwin("planet",v)} placeholder="Only where a real mechanism exists"/>
    </div><label className="fbt-file-input"><span>DOCUMENT / CSV / EXCEL INTAKE</span><strong>{twin.files.length?`${twin.files.length} file${twin.files.length===1?"":"s"} staged locally`:"Choose files"}</strong><small>File ingestion is not connected to a server yet; only filenames are kept in this prototype.</small><input type="file" multiple accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt" onChange={e=>patchTwin("files",Array.from(e.target.files||[]).map(file=>file.name))}/></label><label className="fbt-notes"><span>INTERNAL CONTEXT / UNKNOWN</span><textarea rows={4} value={twin.notes} onChange={e=>patchTwin("notes",e.target.value)} placeholder="What can public data not know?"/></label><div className="fbt-drawer__actions"><span>LOCAL PROTOTYPE · NO SERVER WRITE · NOT ASSURANCE</span><button className="fbt-button fbt-button--primary" onClick={()=>{saveTwin();setCompleteOpen(false)}}>{saved?"Saved":"Save Company State"}</button></div></aside></div>}
  </main>
}

function ModuleView({view,analysis,twin,onComplete,onNavigate}:{view:ViewId;analysis:Analysis;twin:TwinInput;onComplete:()=>void;onNavigate:(view:ViewId)=>void}){
  const employeeItems:Statement[]=analysis.economicBaseline.filter(m=>m.label.toLowerCase().includes("employee")).map(m=>({title:m.label,detail:`${m.value} · ${m.period}`,truthClass:m.truthClass,confidence:"HIGH",sourceIds:m.sourceIds}));
  const configs:Partial<Record<ViewId,{kicker:string;title:string;intro:string;items:Statement[];privateValue?:string;privateLabel?:string}>>={
    revenue:{kicker:"REVENUE",title:"How does money enter the company?",intro:"Connect product, customer, price, channel and margin.",items:analysis.valueDrivers,privateValue:twin.revenue,privateLabel:"Company revenue baseline"},
    products:{kicker:"PRODUCTS",title:"What does the company actually sell?",intro:"Products connect to customers, economics, delivery constraints and outcomes.",items:analysis.businessModel},
    market:{kicker:"CUSTOMERS / MARKET",title:"Who chooses the company — and why?",intro:"Public signals describe a market. Company truth resolves segments, retention and willingness to pay.",items:analysis.valueDrivers,privateValue:twin.customers,privateLabel:"Company-provided customer truth"},
    marketing:{kicker:"MARKETING",title:"Turn attention into measurable demand.",intro:"No marketing claim becomes truth until channel, spend, traffic, conversion and revenue connect.",items:[],privateValue:twin.brand,privateLabel:"Company-provided marketing signal"},
    operations:{kicker:"OPERATIONS",title:"Where does delivery create or lose value?",intro:"Constraints, capacity, quality, inventory and service become one operating view.",items:analysis.valueLeakage,privateValue:twin.operations,privateLabel:"Company-provided operating state"},
    people:{kicker:"PEOPLE",title:"Know the capacity behind the company.",intro:"Roles, ownership, capacity and bottlenecks deepen public headcount.",items:employeeItems,privateValue:twin.people,privateLabel:"Company-provided people state"},
    brand:{kicker:"BRAND / WEB",title:"One promise. One projection of company truth.",intro:"Brand and website project the same Company State rather than creating another truth system.",items:analysis.businessModel,privateValue:twin.brand,privateLabel:"Company-provided brand state"},
    risk:{kicker:"RISK",title:"See what could destroy value.",intro:"Tie risk to evidence, exposure and decisions.",items:analysis.valueLeakage,privateValue:twin.primaryRisk,privateLabel:"Primary company risk"},
    planet:{kicker:"PLANET",title:"Find where better business and a better planet are the same decision.",intro:"Planetary value needs a real mechanism, baseline and measured delta.",items:analysis.opportunities.slice(0,4).map(o=>({title:o.title,detail:o.planetaryLogic,truthClass:o.truthClass,confidence:o.confidence,sourceIds:o.sourceIds})),privateValue:twin.planet,privateLabel:"Company-provided planet intersection"},
    interventions:{kicker:"INTERVENTIONS",title:"Turn a decision into bounded work.",intro:"Define what changes, ownership, baseline, cost, time and measurement.",items:analysis.solutions,privateValue:twin.intervention,privateLabel:"Chosen intervention"},
    results:{kicker:"RESULTS",title:"Only measured change counts.",intro:"Estimated value and realised value remain separate.",items:[],privateValue:twin.measuredResult,privateLabel:"Measured result"},
    learning:{kicker:"LEARNING",title:"Make the company smarter after every decision.",intro:"Evidence, decision, intervention and result become organisational memory.",items:analysis.solutions,privateValue:twin.notes,privateLabel:"Working learning / context"}
  };
  const config=configs[view]||configs.operations!;
  return <div className="fbt-view"><div className="fbt-view-head"><div><p className="fbt-kicker">{config.kicker}</p><h1>{config.title}</h1><p>{config.intro}</p></div><button className="fbt-button fbt-button--soft" onClick={onComplete}>Add company data</button></div><div className="fbt-module-layout"><Surface title="WHAT WE KNOW" meta={`${config.items.length} public signals`}><StatementStack items={config.items} empty="Public evidence is not strong enough to fill this view yet." onComplete={onComplete}/></Surface><aside className="fbt-surface fbt-private-state"><div className="fbt-surface-head"><span>COMPANY STATE</span><small>PRIVATE / LOCAL PROTOTYPE</small></div>{config.privateValue?.trim()?<div className="fbt-private-value"><span>{config.privateLabel}</span><strong>{config.privateValue}</strong><button className="fbt-text-button" onClick={onComplete}>Edit →</button></div>:<EmptyState title="Company truth missing" text="Public evidence cannot answer this reliably. Add internal information to deepen the same Twin." action={onComplete}/>}<button className="fbt-link-card" onClick={()=>onNavigate("evidence")}><span>Inspect provenance</span><strong>Sources + truth classes →</strong></button></aside></div></div>
}
