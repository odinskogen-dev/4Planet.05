import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildEconomicTwin,
  CSV_TEMPLATE,
  demoEconomicRows,
  parseEconomicCsv,
  type Confidence,
  type EconomicRow,
  type EconomicTwin,
  type Opportunity,
  type TruthClass,
} from "@/product/fourbrands/economicEngine";
import "@/styles/fourbrands-twin.css";

type PublicMetric = { label: string; value: string; period: string; truthClass: TruthClass; sourceIds: string[] };
type PublicEvidence = { id: string; title: string; publisher: string; url: string; checkedAt: string; note: string };
type PublicOpportunity = { rank: number; title: string; economicLogic: string; estimatedValue: string; truthClass: TruthClass; confidence: Confidence; sourceIds: string[] };
type PublicAnalysis = {
  company: { name: string; legalName?: string; ticker?: string; sector?: string; geography?: string; description?: string };
  generatedAt: string;
  analysisStatus: string;
  statusNote: string;
  economicBaseline: PublicMetric[];
  opportunities: PublicOpportunity[];
  evidence: PublicEvidence[];
  assumptions: string[];
  unknowns: string[];
};
type MainView = "overview" | "money" | "value" | "decisions";
type MoneyView = "twin" | "cash" | "profit" | "drivers";
type DecisionState = "OPPORTUNITY" | "REVIEWED" | "CHOSEN" | "BASELINE LOCKED" | "INTERVENTION STARTED" | "MEASURED" | "ATTRIBUTION REVIEWED" | "REALISED / NOT REALISED" | "LEARNING";
type Attribution = "IDENTIFIED" | "DIRECT / RECONCILED" | "OBSERVED" | "COMPARATIVE" | "QUASI-EXPERIMENTAL" | "CONTROLLED EXPERIMENT";

const DECISION_STATES: DecisionState[] = ["OPPORTUNITY","REVIEWED","CHOSEN","BASELINE LOCKED","INTERVENTION STARTED","MEASURED","ATTRIBUTION REVIEWED","REALISED / NOT REALISED","LEARNING"];
const ATTRIBUTION: Attribution[] = ["IDENTIFIED","DIRECT / RECONCILED","OBSERVED","COMPARATIVE","QUASI-EXPERIMENTAL","CONTROLLED EXPERIMENT"];
const NAV: { id: MainView; label: string }[] = [{id:"overview",label:"Overview"},{id:"money",label:"Money"},{id:"value",label:"Value"},{id:"decisions",label:"Decisions"}];
const LOAD_STEPS = ["Resolve company","Find official evidence","Read public economics","Map value drivers","Build public company model"];

const money = (value: number, currency = "EUR") => new Intl.NumberFormat("en-GB", { style:"currency", currency, maximumFractionDigits:0 }).format(value || 0);
const pct = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
const pp = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}pp`;
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function routeView(): MainView {
  if (typeof window === "undefined") return "overview";
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path.endsWith("/money")) return "money";
  if (path.endsWith("/value")) return "value";
  if (path.endsWith("/decisions")) return "decisions";
  return "overview";
}
function setCanonicalView(view: MainView) {
  if (typeof window === "undefined") return;
  const host = window.location.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "4brands.org") return;
  const path = view === "overview" ? "/" : `/${view}`;
  window.history.replaceState({}, "", path);
}
function ensureCanonical(view: MainView) {
  if (typeof document === "undefined") return;
  document.title = "4BRANDS — Company Control System";
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
  link.href = `https://4brands.org${view === "overview" ? "/" : `/${view}`}`;
}
function truthClass(value: TruthClass) { return `fb-truth fb-truth--${value.toLowerCase()}`; }
function Truth({ value }: { value: TruthClass }) { return <span className={truthClass(value)}>{value}</span>; }
function ConfidenceTag({ value }: { value: Confidence }) { return <span className={`fb-confidence fb-confidence--${value.toLowerCase()}`}><i/>{value}</span>; }
function Delta({ value, unit = "currency", currency = "EUR" }: { value: number; unit?: "currency" | "pp"; currency?: string }) {
  const positive = value >= 0;
  return <span className={`fb-delta ${positive ? "is-positive" : "is-negative"}`}>{unit === "pp" ? pp(value) : `${positive?"+":"−"}${money(Math.abs(value),currency)}`}</span>;
}

export default function FourBrandLive() {
  const [query,setQuery] = useState("TOMRA");
  const [analysis,setAnalysis] = useState<PublicAnalysis|null>(null);
  const [loading,setLoading] = useState(false);
  const [loadingStep,setLoadingStep] = useState(0);
  const [error,setError] = useState("");
  const [view,setView] = useState<MainView>(routeView);
  const [moneyView,setMoneyView] = useState<MoneyView>("twin");
  const [rows,setRows] = useState<EconomicRow[]>([]);
  const [confirmedCash,setConfirmedCash] = useState<number|undefined>();
  const [dataLabel,setDataLabel] = useState("");
  const [importOpen,setImportOpen] = useState(false);
  const [importError,setImportError] = useState("");
  const [cashInput,setCashInput] = useState("");
  const [activeOpportunity,setActiveOpportunity] = useState(0);
  const [selectedOpportunity,setSelectedOpportunity] = useState<Opportunity|null>(null);
  const [decisionState,setDecisionState] = useState<DecisionState>("OPPORTUNITY");
  const [attribution,setAttribution] = useState<Attribution>("IDENTIFIED");
  const [baseline,setBaseline] = useState("");
  const [intervention,setIntervention] = useState("");
  const [measuredResult,setMeasuredResult] = useState("");
  const [askOpen,setAskOpen] = useState(false);
  const [question,setQuestion] = useState("");
  const [answer,setAnswer] = useState("");

  const twin = useMemo<EconomicTwin|null>(() => rows.length ? buildEconomicTwin(rows, confirmedCash) : null,[rows,confirmedCash]);
  const topOpportunity = twin?.opportunities[activeOpportunity] || twin?.opportunities[0] || null;

  useEffect(()=>{ ensureCanonical(view); setCanonicalView(view); },[view]);
  useEffect(()=>{ setActiveOpportunity(0); },[twin?.opportunities.length]);

  async function runAnalysis(event?: FormEvent, forced?: string) {
    event?.preventDefault();
    const company=(forced||query).trim();
    if(company.length<2)return;
    setQuery(company); setLoading(true); setLoadingStep(0); setError(""); setAnalysis(null); setRows([]); setDataLabel("");
    const timer=window.setInterval(()=>setLoadingStep(step=>Math.min(step+1,LOAD_STEPS.length-1)),420);
    try{
      const response=await fetch(`${import.meta.env.BASE_URL}api/brand-analysis`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({company})});
      const payload=await response.json() as {analysis?:PublicAnalysis;error?:string;detail?:string};
      if(!response.ok||!payload.analysis)throw new Error(payload.detail||payload.error||"Public company research is unavailable.");
      setAnalysis(payload.analysis);
    } catch(cause) { setError(cause instanceof Error ? cause.message : "Public company research is unavailable."); }
    finally { window.clearInterval(timer); setLoading(false); setLoadingStep(LOAD_STEPS.length-1); }
  }

  function loadDemo() {
    const demo=demoEconomicRows();
    setRows(demo.rows); setConfirmedCash(demo.confirmedCash); setCashInput(String(demo.confirmedCash));
    setDataLabel("SYNTHETIC DEMO FINANCE · SESSION ONLY"); setImportOpen(false); setImportError(""); setView("overview");
  }

  async function importFile(file?: File|null) {
    if(!file)return;
    if(!/\.csv$/i.test(file.name)){setImportError("Use a CSV file for this first financial truth-path.");return;}
    try{
      const text=await file.text();
      const parsed=parseEconomicCsv(text,file.name);
      if(!parsed.length)throw new Error("No usable economic rows were found.");
      const cash=cashInput.trim()===""?undefined:Number(cashInput.replace(/[^0-9.\-]/g,""));
      setRows(parsed); setConfirmedCash(Number.isFinite(cash as number)?cash:undefined); setDataLabel(`${file.name.toUpperCase()} · LOCAL SESSION ONLY`); setImportOpen(false); setImportError(""); setView("overview");
    }catch(cause){setImportError(cause instanceof Error?cause.message:"The CSV could not be read.");}
  }

  function navigate(next:MainView){setView(next);setAskOpen(false);}
  function chooseOpportunity(item:Opportunity){setSelectedOpportunity(item);setDecisionState("REVIEWED");setBaseline("");setIntervention(item.intervention);setMeasuredResult("");navigate("decisions");}
  function lockBaseline(){
    if(!twin||!selectedOpportunity)return;
    setBaseline(`${new Date().toISOString().slice(0,10)} · Revenue ${money(twin.currentPeriod.revenue,twin.currency)} · Gross margin ${twin.currentPeriod.grossMargin.toFixed(1)}% · Cash ${money(twin.cash,twin.currency)} · Opportunity range ${money(selectedOpportunity.valueLow,twin.currency)}–${money(selectedOpportunity.valueHigh,twin.currency)}`);
    setDecisionState("BASELINE LOCKED");
  }
  function advanceDecision(){const index=DECISION_STATES.indexOf(decisionState);if(index<DECISION_STATES.length-1)setDecisionState(DECISION_STATES[index+1]);}

  function ask4Brands(event:FormEvent){
    event.preventDefault(); if(!twin||!question.trim())return;
    const q=normalise(question);
    let response="";
    if(q.includes("margin")||q.includes("profit")) response=`Gross margin is ${twin.currentPeriod.grossMargin.toFixed(1)}%, ${pp(twin.grossMarginDeltaPp)} versus the previous 30 days. The recorded driver tree attributes ${pp(twin.marginDrivers[0]?.value||0)} to direct-cost intensity; the remainder stays explicitly unexplained until deeper price/mix evidence is available.`;
    else if(q.includes("cash")||q.includes("runway")) { const low=[...twin.cash13Week].sort((a,b)=>a.endingCash-b.endingCash)[0]; response=`Current ${twin.cashIsConfirmed?"confirmed":"recorded"} cash is ${money(twin.cash,twin.currency)}. The 13-week schedule reaches a low of ${money(low?.endingCash||0,twin.currency)} in ${low?.label||"the forecast"}. This is an estimate based only on dated imported AR, AP and renewals.`; }
    else if(q.includes("customer")) { const best=twin.profitByCustomer[0]; response=best?`${best.key} has the strongest recorded direct contribution at ${money(best.contribution,twin.currency)} (${best.contributionMargin.toFixed(1)}%). Allocated overhead is not included, so this is contribution economics, not full customer profitability.`:"Customer economics cannot be resolved from the current import."; }
    else if(q.includes("evidence")||q.includes("strongest")) { const strong=twin.opportunities.find(item=>item.confidence==="HIGH")||twin.opportunities[0]; response=strong?`${strong.title} currently has the strongest evidence among detected opportunities. Confidence: ${strong.confidence}. It uses ${strong.rowIds.length} exact imported row(s). Open the opportunity to inspect calculation, assumptions and falsifier.`:"No opportunity currently has enough evidence."; }
    else { const top=twin.opportunities[0]; response=top?`The largest detected value range right now is ${money(top.valueLow,twin.currency)}–${money(top.valueHigh,twin.currency)}: ${top.title}. This is ${top.truthClass.toLowerCase()}, not realised value. Review the evidence before choosing an intervention.`:`The Twin has not found a decision-grade value opportunity in the current rows.`; }
    setAnswer(response);
  }

  if(!analysis){
    return <main className="fb-app fb-front">
      <nav className="fb-front-nav"><a className="fb-logo" href="/">4BRANDS<span>_</span></a><a href="https://4planet.org">BY 4PLANET</a></nav>
      <section className="fb-front-main">
        <div className="fb-front-copy"><p className="fb-kicker">COMPANY CONTROL SYSTEM</p><h1>MAKE YOUR<br/>COMPANY BETTER</h1><p>Know where your company makes, loses and can create value.</p></div>
        <form className="fb-company-search" onSubmit={runAnalysis}>
          <label htmlFor="company">Enter company name or website</label>
          <div><input id="company" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Company name or website" autoFocus/><button type="submit" aria-label="Build public company model" disabled={loading||query.trim().length<2}>→</button></div>
          <p>PUBLIC MODEL FIRST · PRIVATE DATA ONLY WHEN YOU ADD IT</p>
          <button className="fb-demo-link" type="button" onClick={()=>runAnalysis(undefined,"TOMRA")}>Try TOMRA public model</button>
        </form>
      </section>
      <footer className="fb-front-footer"><span>DATA → ECONOMIC TWIN → FIND VALUE → DECIDE → MEASURE</span><span>Truth classes and source evidence stay inspectable.</span></footer>
      {loading&&<div className="fb-loading"><div><span>BUILDING PUBLIC COMPANY MODEL</span><strong>{query}</strong><i><b style={{width:`${((loadingStep+1)/LOAD_STEPS.length)*100}%`}}/></i>{LOAD_STEPS.map((step,index)=><p className={index<=loadingStep?"is-active":""} key={step}>{index<loadingStep?"✓":"·"} {step}</p>)}</div></div>}
      {error&&<div className="fb-toast"><strong>Research paused</strong><span>{error}</span><button onClick={()=>setError("")}>Close</button></div>}
    </main>
  }

  if(!twin){
    return <main className="fb-app fb-public">
      <header className="fb-public-head"><button className="fb-logo fb-logo-button" onClick={()=>setAnalysis(null)}>4BRANDS<span>_</span></button><span>PUBLIC COMPANY MODEL</span><button onClick={()=>setAnalysis(null)}>Switch company</button></header>
      <section className="fb-public-hero"><div><p className="fb-kicker">{analysis.analysisStatus.replaceAll("_"," ")}</p><h1>{analysis.company.name}</h1><p>{analysis.company.description||analysis.statusNote}</p></div><div className="fb-public-status"><span>PUBLIC SOURCES</span><strong>{analysis.evidence.length}</strong><small>{analysis.unknowns.length} important unknowns remain</small></div></section>
      <section className="fb-public-grid">
        <article><span>WHAT 4BRANDS CAN ALREADY SEE</span><div className="fb-public-metrics">{analysis.economicBaseline.slice(0,4).map(metric=><div key={`${metric.label}-${metric.period}`}><small>{metric.label}</small><strong>{metric.value}</strong><Truth value={metric.truthClass}/></div>)}</div></article>
        <article className="fb-build-card"><p className="fb-kicker">NEXT STEP</p><h2>Build your Company Twin.</h2><p>Public data can frame the company. Your economic truth is what turns 4BRANDS into a control system.</p><button className="fb-primary" onClick={()=>setImportOpen(true)}>Add financial data</button><button className="fb-secondary" onClick={loadDemo}>Explore with synthetic demo finance</button><small>Demo finance is synthetic and never presented as {analysis.company.name} truth.</small></article>
      </section>
      <section className="fb-public-bottom"><div><span>PUBLIC VALUE HYPOTHESES</span>{analysis.opportunities.slice(0,3).map(item=><article key={item.rank}><b>{String(item.rank).padStart(2,"0")}</b><div><strong>{item.title}</strong><p>{item.economicLogic}</p></div><Truth value={item.truthClass}/></article>)}</div><aside><span>EVIDENCE</span>{analysis.evidence.slice(0,5).map(source=><a key={source.id} href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong><small>{source.publisher} · {source.checkedAt}</small></a>)}</aside></section>
      <ImportPanel open={importOpen} onClose={()=>setImportOpen(false)} cashInput={cashInput} setCashInput={setCashInput} importError={importError} onFile={importFile} onDemo={loadDemo}/>
    </main>
  }

  return <main className="fb-app fb-product">
    <header className="fb-topbar"><button className="fb-logo fb-logo-button" onClick={()=>{setRows([]);setDataLabel("")}}>4BRANDS<span>_</span></button><button className="fb-company-chip" onClick={()=>{setRows([]);setDataLabel("")}}><i/><strong>{analysis.company.name}</strong><small>Company Twin</small></button><div className="fb-top-actions"><span className="fb-session">{dataLabel}</span><button className="fb-ask" onClick={()=>setAskOpen(value=>!value)}>Ask 4BRANDS</button><button className="fb-add" onClick={()=>setImportOpen(true)}>+ Data</button></div></header>
    <div className="fb-shell">
      <aside className="fb-nav"><nav>{NAV.map(item=><button key={item.id} className={view===item.id?"is-active":""} onClick={()=>navigate(item.id)}>{item.label}</button>)}</nav><div><span>SESSION MODE</span><p>Imported company data stays in this browser session. No server write.</p></div></aside>
      <section className="fb-workspace">
        {view==="overview"&&<Overview twin={twin} opportunity={twin.opportunities[0]} onOpportunity={()=>navigate("value")} onMoney={()=>navigate("money")} onDecision={()=>twin.opportunities[0]&&chooseOpportunity(twin.opportunities[0])}/>} 
        {view==="money"&&<Money twin={twin} mode={moneyView} setMode={setMoneyView}/>} 
        {view==="value"&&<ValueFinder twin={twin} active={activeOpportunity} setActive={setActiveOpportunity} onChoose={chooseOpportunity}/>} 
        {view==="decisions"&&<Decisions twin={twin} selected={selectedOpportunity} state={decisionState} setState={setDecisionState} attribution={attribution} setAttribution={setAttribution} baseline={baseline} lockBaseline={lockBaseline} intervention={intervention} setIntervention={setIntervention} result={measuredResult} setResult={setMeasuredResult} advance={advanceDecision} onFind={()=>navigate("value")}/>} 
      </section>
    </div>
    <nav className="fb-mobile-nav">{NAV.map(item=><button key={item.id} className={view===item.id?"is-active":""} onClick={()=>navigate(item.id)}>{item.label}</button>)}</nav>
    {askOpen&&<aside className="fb-ask-panel"><div><span>ASK 4BRANDS</span><button onClick={()=>setAskOpen(false)}>×</button></div><h2>Ask the Twin.</h2><form onSubmit={ask4Brands}><input value={question} onChange={event=>setQuestion(event.target.value)} placeholder="Why did our margin decline?" autoFocus/><button type="submit">→</button></form>{answer&&<article><p>{answer}</p><small>Grounded only in this session’s Economic Twin. Inspect Money / Value for calculation and evidence.</small></article>}<div className="fb-question-chips">{["Why did our margin decline?","What threatens cash?","Where are we losing money?","Which opportunity has strongest evidence?"].map(item=><button key={item} onClick={()=>setQuestion(item)}>{item}</button>)}</div></aside>}
    <ImportPanel open={importOpen} onClose={()=>setImportOpen(false)} cashInput={cashInput} setCashInput={setCashInput} importError={importError} onFile={importFile} onDemo={loadDemo}/>
  </main>;
}

function Overview({twin,opportunity,onOpportunity,onMoney,onDecision}:{twin:EconomicTwin;opportunity?:Opportunity;onOpportunity:()=>void;onMoney:()=>void;onDecision:()=>void}){
  const low=[...twin.cash13Week].sort((a,b)=>a.endingCash-b.endingCash)[0];
  return <div className="fb-view">
    <div className="fb-view-title"><div><p className="fb-kicker">OVERVIEW</p><h1>What matters now.</h1></div><div className="fb-fresh"><span>{twin.rowCount} economic rows</span><small>{twin.sourceNames.join(" · ")}</small></div></div>
    <div className="fb-state-strip"><Metric label="Revenue · recorded" value={money(twin.revenue,twin.currency)} meta={`${twin.customers} customers`} /><Metric label={twin.cashIsConfirmed?"Cash · confirmed":"Cash · recorded movement"} value={money(twin.cash,twin.currency)} meta={twin.cashIsConfirmed?"User-confirmed input":"Opening balance not supplied"}/><Metric label="Gross margin" value={`${twin.grossMargin.toFixed(1)}%`} meta={`${pp(twin.grossMarginDeltaPp)} vs prior 30d`} tone={twin.grossMarginDeltaPp<0?"bad":"good"}/><Metric label="Overdue AR" value={money(twin.overdueAr,twin.currency)} meta={`${money(twin.ar,twin.currency)} total AR`} tone={twin.overdueAr>0?"warn":undefined}/></div>
    <div className="fb-overview-grid">
      <article className="fb-primary-insight"><div><span>PRIMARY INSIGHT</span>{opportunity&&<ConfidenceTag value={opportunity.confidence}/>}</div>{opportunity?<><h2>{money(opportunity.valueLow,twin.currency)}–{money(opportunity.valueHigh,twin.currency)}</h2><h3>{opportunity.title}</h3><p>{opportunity.why}</p><div className="fb-insight-actions"><button onClick={onOpportunity}>Review opportunity</button><button onClick={onDecision}>Take to decision →</button></div></>:<><h2>No ranked value yet.</h2><p>The current rows do not trigger a bounded detector. Add more economic truth.</p></>}</article>
      <article className="fb-change-card"><span>WHAT CHANGED?</span><div><small>Revenue · last 30 days</small><strong>{money(twin.currentPeriod.revenue,twin.currency)}</strong><Delta value={twin.revenueDelta} currency={twin.currency}/></div><div><small>Gross margin</small><strong>{twin.currentPeriod.grossMargin.toFixed(1)}%</strong><Delta value={twin.grossMarginDeltaPp} unit="pp"/></div><button onClick={onMoney}>Why did this change? →</button></article>
      <article className="fb-cash-card"><span>13-WEEK CASH</span><div><small>Lowest projected point</small><strong className={(low?.endingCash||0)<0?"is-risk":""}>{money(low?.endingCash||0,twin.currency)}</strong><p>{low?.label} · estimated from dated AR / AP / renewals</p></div><button onClick={onMoney}>Open cash view →</button></article>
    </div>
    <section className="fb-five"><article><span>HOW ARE WE DOING?</span><strong>{twin.grossMarginDeltaPp<0?"Margin pressure":"Stable / improving margin"}</strong><p>{pp(twin.grossMarginDeltaPp)} versus prior 30 days.</p></article><article><span>WHERE IS VALUE LEAKING?</span><strong>{opportunity?.detector||"No detector fired"}</strong><p>{opportunity?.eyebrow||"Add more data for stronger detection."}</p></article><article><span>WHAT NEEDS A DECISION?</span><strong>{opportunity?.title||"No open decision"}</strong><p>{opportunity?`${opportunity.confidence} confidence · ${opportunity.timeToValue}`:"Value Finder has no ranked opportunity."}</p></article></section>
  </div>;
}

function Metric({label,value,meta,tone}:{label:string;value:string;meta:string;tone?:"good"|"bad"|"warn"}){return <article className={`fb-metric${tone?` is-${tone}`:""}`}><span>{label}</span><strong>{value}</strong><small>{meta}</small></article>}

function Money({twin,mode,setMode}:{twin:EconomicTwin;mode:MoneyView;setMode:(mode:MoneyView)=>void}){
  return <div className="fb-view"><div className="fb-view-title"><div><p className="fb-kicker">MONEY</p><h1>Know the economic state.</h1></div><Truth value="CALCULATION"/></div><div className="fb-subnav">{(["twin","cash","profit","drivers"] as MoneyView[]).map(item=><button key={item} className={mode===item?"is-active":""} onClick={()=>setMode(item)}>{item==="twin"?"Economic Twin":item==="cash"?"Cash":item==="profit"?"Profit":"Driver Tree"}</button>)}</div>
    {mode==="twin"&&<EconomicTwinView twin={twin}/>} {mode==="cash"&&<CashView twin={twin}/>} {mode==="profit"&&<ProfitView twin={twin}/>} {mode==="drivers"&&<DriverView twin={twin}/>} </div>;
}
function EconomicTwinView({twin}:{twin:EconomicTwin}){return <div className="fb-money-grid"><section className="fb-surface"><div className="fb-surface-head"><span>ECONOMIC TWIN</span><small>Accounting/payment/commercial rows stay distinct</small></div>{[{l:"Recorded revenue",v:money(twin.revenue,twin.currency),t:"Invoices"},{l:twin.cashIsConfirmed?"Current cash":"Recorded cash movement",v:money(twin.cash,twin.currency),t:twin.cashIsConfirmed?"User-confirmed":"Not a bank balance"},{l:"Recorded direct + operating cost",v:money(twin.costs,twin.currency),t:"Imported costs"},{l:"Gross profit",v:money(twin.grossProfit,twin.currency),t:"Revenue − direct cost"},{l:"Gross margin",v:`${twin.grossMargin.toFixed(1)}%`,t:"Calculated"},{l:"Accounts receivable",v:money(twin.ar,twin.currency),t:`${money(twin.overdueAr,twin.currency)} overdue`},{l:"Accounts payable",v:money(twin.ap,twin.currency),t:`${money(twin.overdueAp,twin.currency)} overdue`}].map(item=><div className="fb-economic-row" key={item.l}><span>{item.l}</span><strong>{item.v}</strong><small>{item.t}</small></div>)}</section><section className="fb-surface"><div className="fb-surface-head"><span>MODEL COVERAGE</span><small>What this session can resolve</small></div><div className="fb-coverage"><div><strong>{twin.customers}</strong><span>Customers</span></div><div><strong>{twin.products}</strong><span>Products / plans</span></div><div><strong>{twin.channels}</strong><span>Channels</span></div><div><strong>{twin.sourceNames.length}</strong><span>Sources</span></div></div><div className="fb-truth-note"><strong>Revenue ≠ invoice ≠ payment ≠ cash.</strong><p>4BRANDS reconciles what the file actually contains. Missing opening cash, credit notes, allocations or external settlements stay unknown.</p></div></section></div>}
function CashView({twin}:{twin:EconomicTwin}){const min=Math.min(...twin.cash13Week.map(item=>item.endingCash));const max=Math.max(...twin.cash13Week.map(item=>Math.abs(item.endingCash)),1);return <div className="fb-cash-layout"><section className="fb-surface"><div className="fb-surface-head"><span>13-WEEK CASH VIEW</span><small>ESTIMATE · due-date schedule</small></div><div className="fb-cash-chart">{twin.cash13Week.map(week=><div key={week.week}><span>{week.label}</span><i className={week.endingCash<0?"is-negative":""} style={{height:`${Math.max(8,Math.abs(week.endingCash)/max*150)}px`}}/><strong>{money(week.endingCash,twin.currency)}</strong></div>)}</div></section><aside className="fb-surface fb-cash-facts"><div className="fb-surface-head"><span>CASH CONTROL</span></div><Metric label="Current cash" value={money(twin.cash,twin.currency)} meta={twin.cashIsConfirmed?"Confirmed input":"Recorded movement only"}/><Metric label="Outstanding AR" value={money(twin.ar,twin.currency)} meta={`${money(twin.overdueAr,twin.currency)} overdue`}/><Metric label="Outstanding AP" value={money(twin.ap,twin.currency)} meta={`${money(twin.overdueAp,twin.currency)} overdue`}/><Metric label="Lowest projected cash" value={money(min,twin.currency)} meta="13-week schedule" tone={min<0?"bad":undefined}/></aside></div>}
function ProfitView({twin}:{twin:EconomicTwin}){return <div className="fb-profit-layout">{[["CUSTOMER",twin.profitByCustomer],["PRODUCT / PLAN",twin.profitByProduct],["CHANNEL",twin.profitByChannel]] .map(([title,lines])=><section className="fb-surface" key={title as string}><div className="fb-surface-head"><span>{title as string}</span><small>Direct contribution · no allocated overhead</small></div>{(lines as EconomicTwin["profitByCustomer"]).slice(0,8).map(line=><div className="fb-profit-row" key={line.key}><strong>{line.key}</strong><span>{money(line.revenue,twin.currency)} revenue</span><b className={line.contribution<0?"is-negative":""}>{money(line.contribution,twin.currency)} · {line.contributionMargin.toFixed(1)}%</b></div>)}</section>)}</div>}
function DriverView({twin}:{twin:EconomicTwin}){return <div className="fb-driver-layout"><section className="fb-surface"><div className="fb-surface-head"><span>REVENUE DRIVER TREE</span><small>Must reconcile to {money(twin.revenueDelta,twin.currency)}</small></div><div className="fb-driver-root"><span>REVENUE CHANGE</span><strong>{money(twin.revenueDelta,twin.currency)}</strong></div>{twin.revenueDrivers.map(node=><div className="fb-driver-row" key={node.label}><div><strong>{node.label}</strong><p>{node.detail}</p></div><Delta value={node.value} currency={twin.currency}/></div>)}</section><section className="fb-surface"><div className="fb-surface-head"><span>GROSS-MARGIN WHY</span><small>{pp(twin.grossMarginDeltaPp)} total change</small></div><div className="fb-driver-root"><span>GROSS MARGIN CHANGE</span><strong>{pp(twin.grossMarginDeltaPp)}</strong></div>{twin.marginDrivers.map(node=><div className="fb-driver-row" key={node.label}><div><strong>{node.label}</strong><p>{node.detail}</p></div><Delta value={node.value} unit="pp"/></div>)}</section></div>}

function ValueFinder({twin,active,setActive,onChoose}:{twin:EconomicTwin;active:number;setActive:(index:number)=>void;onChoose:(item:Opportunity)=>void}){const item=twin.opportunities[active]||twin.opportunities[0];return <div className="fb-view"><div className="fb-view-title"><div><p className="fb-kicker">VALUE FINDER</p><h1>Where is value leaking?</h1><p>Detectors only surface bounded findings supported by the imported data. Identified value is not realised value.</p></div><div className="fb-found"><strong>{twin.opportunities.length}</strong><span>detectors fired</span></div></div>{item?<div className="fb-value-layout"><div className="fb-opportunity-list">{twin.opportunities.map((op,index)=><button key={op.id} className={index===active?"is-active":""} onClick={()=>setActive(index)}><div><span>{op.detector}</span><strong>{op.title}</strong></div><b>{money(op.valueLow,twin.currency)}–{money(op.valueHigh,twin.currency)}</b><ConfidenceTag value={op.confidence}/></button>)}</div><OpportunityDetail item={item} twin={twin} onChoose={()=>onChoose(item)}/></div>:<div className="fb-empty"><h2>No bounded opportunity detected.</h2><p>Add richer financial rows or inspect Money to see what the Twin can currently resolve.</p></div>}</div>}
function OpportunityDetail({item,twin,onChoose}:{item:Opportunity;twin:EconomicTwin;onChoose:()=>void}){return <article className="fb-opportunity-detail"><div className="fb-opportunity-top"><span>{item.eyebrow}</span><div><Truth value={item.truthClass}/><ConfidenceTag value={item.confidence}/></div></div><h2>{money(item.valueLow,twin.currency)}–{money(item.valueHigh,twin.currency)}</h2><h3>{item.title}</h3><p>{item.why}</p><button className="fb-primary" onClick={onChoose}>Take to decision</button><div className="fb-progressive"><details open><summary>Why?</summary><p>{item.why}</p><p><b>Time to value:</b> {item.timeToValue}</p></details><details><summary>Calculation</summary><p>{item.calculation}</p><ul>{item.exactData.map(value=><li key={value}>{value}</li>)}</ul></details><details><summary>Evidence / exact rows</summary><ul>{item.evidence.map(value=><li key={value}>{value}</li>)}</ul><small>{item.rowIds.length} underlying row IDs retained in session.</small></details><details><summary>Assumptions + falsifier</summary><ul>{item.assumptions.map(value=><li key={value}>{value}</li>)}</ul><p><b>Falsifier:</b> {item.falsifier}</p></details><details><summary>Possible intervention</summary><p>{item.intervention}</p></details></div></article>}

function Decisions({twin,selected,state,setState,attribution,setAttribution,baseline,lockBaseline,intervention,setIntervention,result,setResult,advance,onFind}:{twin:EconomicTwin;selected:Opportunity|null;state:DecisionState;setState:(v:DecisionState)=>void;attribution:Attribution;setAttribution:(v:Attribution)=>void;baseline:string;lockBaseline:()=>void;intervention:string;setIntervention:(v:string)=>void;result:string;setResult:(v:string)=>void;advance:()=>void;onFind:()=>void}){if(!selected)return <div className="fb-view"><div className="fb-view-title"><div><p className="fb-kicker">DECISIONS</p><h1>Nothing becomes value by itself.</h1><p>Choose a bounded opportunity, lock a baseline, run an intervention and measure what actually happened.</p></div></div><div className="fb-empty fb-empty-large"><span>OPPORTUNITY → DECISION → INTERVENTION → RESULT → LEARNING</span><h2>No opportunity selected.</h2><button className="fb-primary" onClick={onFind}>Open Value Finder</button></div></div>;
 const index=DECISION_STATES.indexOf(state);return <div className="fb-view"><div className="fb-view-title"><div><p className="fb-kicker">DECISION + VALUE LEDGER</p><h1>Make the choice explicit.</h1></div><Truth value={selected.truthClass}/></div><div className="fb-ledger"><section className="fb-decision-main"><div className="fb-ledger-op"><span>SELECTED OPPORTUNITY</span><h2>{selected.title}</h2><strong>{money(selected.valueLow,twin.currency)}–{money(selected.valueHigh,twin.currency)}</strong><p>Identified range · not approved, attributable or realised value.</p></div><label><span>INTERVENTION</span><textarea value={intervention} onChange={e=>setIntervention(e.target.value)} rows={4}/></label><label><span>MEASURED RESULT</span><textarea value={result} onChange={e=>setResult(e.target.value)} rows={4} placeholder="Enter measured result only after the intervention has run."/></label>{baseline?<div className="fb-baseline"><span>LOCKED BASELINE</span><p>{baseline}</p></div>:<button className="fb-primary" onClick={lockBaseline}>Lock baseline</button>}</section><aside className="fb-decision-side"><span>WORKFLOW STATE</span><div className="fb-state-machine">{DECISION_STATES.map((item,i)=><button key={item} className={i===index?"is-current":i<index?"is-done":""} onClick={()=>setState(item)}><i/>{item}</button>)}</div><span>ATTRIBUTION STRENGTH</span><select value={attribution} onChange={e=>setAttribution(e.target.value as Attribution)}>{ATTRIBUTION.map(item=><option key={item}>{item}</option>)}</select><p>Workflow progress and attribution strength are separate. A later result does not prove the intervention caused it.</p><button className="fb-secondary" onClick={advance} disabled={index>=DECISION_STATES.length-1}>Advance state →</button></aside></div></div>}

function ImportPanel({open,onClose,cashInput,setCashInput,importError,onFile,onDemo}:{open:boolean;onClose:()=>void;cashInput:string;setCashInput:(v:string)=>void;importError:string;onFile:(file?:File|null)=>void;onDemo:()=>void}){if(!open)return null;return <div className="fb-modal"><section><div className="fb-modal-head"><div><p className="fb-kicker">BUILD YOUR COMPANY TWIN</p><h2>Add economic truth.</h2></div><button onClick={onClose}>×</button></div><div className="fb-security"><strong>LOCAL SESSION MODE</strong><p>Your CSV is parsed in the browser for this session. 4BRANDS does not persist the imported company rows in this prototype. Do not treat this as a production tenant vault.</p></div><label className="fb-cash-input"><span>Current cash / bank balance <small>optional but improves the 13-week view</small></span><input value={cashInput} onChange={e=>setCashInput(e.target.value)} inputMode="decimal" placeholder="e.g. 125000"/></label><label className="fb-file-drop"><input type="file" accept=".csv,text/csv" onChange={event=>onFile(event.target.files?.[0])}/><strong>Choose financial CSV</strong><span>Invoices, payments, costs, usage, software seats or renewals.</span></label>{importError&&<p className="fb-import-error">{importError}</p>}<div className="fb-import-actions"><button className="fb-secondary" onClick={onDemo}>Use synthetic demo finance</button><a href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`} download="4brands-economic-template.csv">Download CSV template</a></div><details className="fb-schema"><summary>Accepted first-build fields</summary><p>date, kind/type, amount, currency, status, customer, product/SKU/plan, channel, vendor, category, invoice_id, payment_id, due_date, quantity, unit_price, direct_cost/COGS, discount_pct, billed, seats_purchased, seats_used, renewal_date, description.</p></details></section></div>}
