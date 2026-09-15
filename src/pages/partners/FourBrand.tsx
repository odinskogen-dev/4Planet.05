import { FormEvent, useEffect, useMemo, useState } from "react";
import "@/styles/fourbrand.css";

type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";
type Confidence = "HIGH" | "MEDIUM" | "LOW";
type DecisionState = "OPPORTUNITY" | "REVIEWED" | "CHOSEN" | "BASELINE LOCKED" | "INTERVENTION STARTED" | "MEASURED" | "VALUE ATTRIBUTION REVIEWED" | "REALISED" | "NOT REALISED" | "LEARNING";

type Metric = { label: string; value: string; period: string; truthClass: TruthClass; sourceIds: string[] };
type Statement = { title: string; detail: string; truthClass: TruthClass; confidence: Confidence; sourceIds: string[] };
type Opportunity = {
  rank: number;
  title: string;
  economicLogic: string;
  estimatedValue: string;
  planetaryLogic: string;
  planetaryDelta: string;
  truthClass: TruthClass;
  confidence: Confidence;
  sourceIds: string[];
};
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
  nextExperiment: {
    title: string;
    hypothesis: string;
    method: string;
    successMetric: string;
    economicMeasurement: string;
    planetaryMeasurement: string;
    truthClass: TruthClass;
  };
  evidence: Evidence[];
  assumptions: string[];
  unknowns: string[];
};

type TwinState = {
  objective: string;
  annualRevenue: string;
  grossMargin: string;
  operatingCash: string;
  customerGrowth: string;
  primaryConstraint: string;
  notes: string;
};

type LedgerState = Record<string, DecisionState>;

const EMPTY_TWIN: TwinState = {
  objective: "",
  annualRevenue: "",
  grossMargin: "",
  operatingCash: "",
  customerGrowth: "",
  primaryConstraint: "",
  notes: "",
};

const DECISION_STATES: DecisionState[] = [
  "OPPORTUNITY", "REVIEWED", "CHOSEN", "BASELINE LOCKED", "INTERVENTION STARTED",
  "MEASURED", "VALUE ATTRIBUTION REVIEWED", "REALISED", "NOT REALISED", "LEARNING",
];

function storageKey(kind: "twin" | "ledger", companyName: string) {
  return `4brands:${kind}:${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function TruthMark({ value }: { value: TruthClass }) {
  return <span className="fb-truth">{value}</span>;
}

function Disclosure({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <details className="fb-disclosure">
      <summary>
        <span>{title}</span>
        {meta && <small>{meta}</small>}
        <i aria-hidden="true">+</i>
      </summary>
      <div className="fb-disclosure__body">{children}</div>
    </details>
  );
}

function StatementRows({ items }: { items: Statement[] }) {
  return (
    <div className="fb-statement-rows">
      {items.map((item) => (
        <article key={`${item.title}-${item.detail}`}>
          <div>
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </div>
          <span>{item.confidence}</span>
        </article>
      ))}
    </div>
  );
}

function OpportunityRow({ item, primary = false }: { item: Opportunity; primary?: boolean }) {
  return (
    <article className={`fb-opportunity${primary ? " fb-opportunity--primary" : ""}`}>
      <div className="fb-opportunity__rank">{String(item.rank).padStart(2, "0")}</div>
      <div className="fb-opportunity__main">
        <div className="fb-opportunity__heading">
          <h3>{item.title}</h3>
          <div className="fb-opportunity__meta"><TruthMark value={item.truthClass} /><span>{item.confidence}</span></div>
        </div>
        <div className="fb-opportunity__signal">
          <p><span>VALUE</span>{item.estimatedValue}</p>
          <p><span>PLANET</span>{item.planetaryLogic}</p>
        </div>
        <details className="fb-opportunity__detail">
          <summary>Why this matters</summary>
          <div>
            <p><span>ECONOMIC LOGIC</span>{item.economicLogic}</p>
            <p><span>MEASUREMENT</span>{item.planetaryDelta}</p>
          </div>
        </details>
      </div>
    </article>
  );
}

function Board({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <article className="fb-twin-board">
      <span>{label}</span>
      <h3>{title}</h3>
      <div>{children}</div>
    </article>
  );
}

export default function FourBrand() {
  const [company, setCompany] = useState("TOMRA");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twin, setTwin] = useState<TwinState>(EMPTY_TWIN);
  const [ledger, setLedger] = useState<LedgerState>({});
  const [saveState, setSaveState] = useState<"IDLE" | "SAVED">("IDLE");

  const sourceCount = useMemo(() => analysis?.evidence.length ?? 0, [analysis]);
  const leadMetrics = useMemo(() => analysis?.economicBaseline.slice(0, 4) ?? [], [analysis]);
  const companyKey = analysis?.company.legalName || analysis?.company.name || "company";

  useEffect(() => {
    if (!analysis || typeof window === "undefined") return;
    try {
      const savedTwin = window.localStorage.getItem(storageKey("twin", companyKey));
      const savedLedger = window.localStorage.getItem(storageKey("ledger", companyKey));
      setTwin(savedTwin ? { ...EMPTY_TWIN, ...JSON.parse(savedTwin) } : EMPTY_TWIN);
      setLedger(savedLedger ? JSON.parse(savedLedger) : {});
      setSaveState("IDLE");
    } catch {
      setTwin(EMPTY_TWIN);
      setLedger({});
    }
  }, [analysis, companyKey]);

  async function runAnalysis(event?: FormEvent) {
    event?.preventDefault();
    const query = company.trim();
    if (query.length < 2) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const response = await fetch("/api/brand-analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ company: query }),
      });
      const payload = await response.json() as { analysis?: Analysis; error?: string; detail?: string };
      if (!response.ok || !payload.analysis) throw new Error(payload.detail || payload.error || "Analysis engine unavailable");
      setAnalysis(payload.analysis);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis engine unavailable");
    } finally {
      setLoading(false);
    }
  }

  function saveTwin() {
    if (!analysis || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey("twin", companyKey), JSON.stringify(twin));
    window.localStorage.setItem(storageKey("ledger", companyKey), JSON.stringify(ledger));
    setSaveState("SAVED");
    window.setTimeout(() => setSaveState("IDLE"), 1800);
  }

  function setDecision(rank: number, state: DecisionState) {
    setLedger((current) => ({ ...current, [String(rank)]: state }));
    setSaveState("IDLE");
  }

  return (
    <main className="fb-shell">
      <style>{`
        .fb-twin{padding:clamp(72px,9vw,136px) clamp(24px,6vw,96px);background:#f5f5f1;border-top:1px solid #0a0a0a}
        .fb-twin__head{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,520px);gap:32px clamp(48px,8vw,130px);align-items:end;margin-bottom:48px}
        .fb-twin__head h2{font:500 clamp(44px,6vw,86px)/.96 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.055em;margin:0}
        .fb-twin__head p{font-size:16px;line-height:1.55;color:#454545;margin:0}
        .fb-twin__status{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;font:9px/1.2 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#656565}
        .fb-twin__status span{border:1px solid #c8c8c2;padding:6px 8px;background:#fff}
        .fb-twin-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #0a0a0a;border-left:1px solid #d4d4ce;background:#fff}
        .fb-twin-field{padding:18px;border-right:1px solid #d4d4ce;border-bottom:1px solid #d4d4ce;min-height:118px}
        .fb-twin-field--wide{grid-column:span 2}
        .fb-twin-field label{display:block;font:9px/1.2 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#666;margin-bottom:12px}
        .fb-twin-field input,.fb-twin-field textarea{width:100%;border:0;border-bottom:1px solid #bdbdb7;background:transparent;padding:7px 0 9px;outline:0;font:500 19px/1.25 "Instrument Sans",system-ui,sans-serif;color:#0a0a0a;resize:vertical}
        .fb-twin-field input:focus,.fb-twin-field textarea:focus{border-color:#2e2eff}
        .fb-twin-actions{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:18px 0 64px}
        .fb-twin-actions p{margin:0;font:9px/1.4 "Fragment Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.05em;color:#666}
        .fb-twin-actions button{border:1px solid #0a0a0a;background:#0a0a0a;color:#fff;padding:13px 18px;cursor:pointer;font:10px "Fragment Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.06em}
        .fb-twin-actions button:hover{background:#2e2eff;border-color:#2e2eff}
        .fb-twin-boards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px solid #0a0a0a;border-left:1px solid #d4d4ce;background:#fff}
        .fb-twin-board{padding:20px;min-height:310px;border-right:1px solid #d4d4ce;border-bottom:1px solid #d4d4ce}
        .fb-twin-board>span{font:9px/1.2 "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#777}
        .fb-twin-board h3{font:500 24px/1.05 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.035em;margin:16px 0 22px}
        .fb-twin-board ul{list-style:none;padding:0;margin:0}
        .fb-twin-board li{border-top:1px solid #deded8;padding:10px 0;font-size:12px;line-height:1.45;color:#404040}
        .fb-twin-board li strong{display:block;font:500 14px/1.25 "Instrument Sans",system-ui,sans-serif;color:#111;margin-bottom:3px}
        .fb-ledger{margin-top:70px;background:#fff;border-top:1px solid #0a0a0a}
        .fb-ledger__head{display:grid;grid-template-columns:1fr minmax(280px,520px);gap:30px;padding:28px 0 24px}
        .fb-ledger__head h3{font:500 clamp(30px,4vw,52px)/1 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.045em;margin:0}
        .fb-ledger__head p{font-size:13px;line-height:1.5;color:#555;margin:0}
        .fb-ledger-row{display:grid;grid-template-columns:54px minmax(0,1fr) minmax(180px,270px);gap:18px;align-items:center;padding:18px 0;border-top:1px solid #d9d9d4}
        .fb-ledger-row>span{font:10px "Fragment Mono",ui-monospace,monospace;color:#777}
        .fb-ledger-row h4{font:500 17px/1.25 "Instrument Sans",system-ui,sans-serif;margin:0 0 5px}
        .fb-ledger-row p{font-size:11px;line-height:1.4;color:#666;margin:0}
        .fb-ledger-row select{width:100%;border:1px solid #c8c8c2;background:#fff;padding:10px;font:9px "Fragment Mono",ui-monospace,monospace;text-transform:uppercase;color:#111}
        .fb-studio{margin-top:70px;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:50px;border-top:1px solid #0a0a0a;padding-top:34px}
        .fb-studio__copy h3{font:500 clamp(34px,4.5vw,64px)/.98 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.05em;margin:10px 0 24px}
        .fb-studio__copy p{font-size:14px;line-height:1.55;color:#555;max-width:520px}
        .fb-studio-preview{background:#0a0a0a;color:#fff;min-height:410px;padding:clamp(28px,5vw,64px);display:flex;flex-direction:column;justify-content:space-between}
        .fb-studio-preview>span{font:9px "Fragment Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:#aaa}
        .fb-studio-preview h4{font:500 clamp(40px,5vw,74px)/.93 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.055em;margin:0 0 18px}
        .fb-studio-preview p{font-size:15px;line-height:1.5;color:#d3d3d3;margin:0;max-width:680px}
        .fb-studio-preview footer{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #393939;padding-top:16px;font:9px "Fragment Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.05em;color:#aaa}
        .fb-model-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin:0 clamp(24px,6vw,96px)}
        .fb-model-strip article{padding:18px 18px 22px;border-right:1px solid #d9d9d4}.fb-model-strip article:last-child{border-right:0}
        .fb-model-strip span{font:9px "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#777}
        .fb-model-strip strong{display:block;font:500 17px/1.28 "Instrument Sans",system-ui,sans-serif;margin-top:9px;color:#111}
        @media(max-width:1100px){.fb-twin-boards{grid-template-columns:repeat(2,minmax(0,1fr))}.fb-twin-form{grid-template-columns:repeat(2,minmax(0,1fr))}.fb-model-strip{grid-template-columns:repeat(2,1fr)}.fb-model-strip article:nth-child(2){border-right:0}}
        @media(max-width:720px){.fb-twin__head,.fb-ledger__head,.fb-studio{grid-template-columns:1fr}.fb-twin-form,.fb-twin-boards,.fb-model-strip{grid-template-columns:1fr}.fb-twin-field--wide{grid-column:auto}.fb-twin-board{min-height:auto}.fb-model-strip article{border-right:0;border-bottom:1px solid #d9d9d4}.fb-ledger-row{grid-template-columns:34px 1fr}.fb-ledger-row select{grid-column:2}.fb-twin-actions{align-items:flex-start;flex-direction:column}.fb-studio-preview{min-height:360px}}
      `}</style>

      <nav className="fb-nav" aria-label="4BRANDS">
        <a href="/" className="fb-wordmark">4PLANET<span>_</span></a>
        <div className="fb-nav__context">COMPANY INTELLIGENCE / 4BRANDS</div>
        <a href="#company-twin" className="fb-nav__link">BUILD YOUR TWIN</a>
      </nav>

      {!analysis && (
        <section className="fb-entry">
          <div className="fb-entry__copy">
            <p className="fb-eyebrow">4BRANDS / COMPANY VALUE INTELLIGENCE</p>
            <h1>Make the company<br />better.</h1>
            <p className="fb-intro">Enter a company. 4BRANDS reads public evidence, starts with the economics and finds where value is created, where it leaks, and where better business and a living planet may be the same decision.</p>
          </div>

          <form className="fb-search" onSubmit={runAnalysis}>
            <label htmlFor="fb-company">Company</label>
            <div className="fb-search__control">
              <input
                id="fb-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Company name"
                autoComplete="organization"
                maxLength={120}
                autoFocus
              />
              <button type="submit" disabled={loading || company.trim().length < 2} aria-label="Run company analysis">
                {loading ? <span className="fb-spinner" aria-hidden="true" /> : <span aria-hidden="true">→</span>}
              </button>
            </div>
            <div className="fb-search__foot">
              <span>PUBLIC DATA</span><span>FINANCE FIRST</span><span>SOURCE-AWARE</span><span>NO OPAQUE SCORE</span>
            </div>
          </form>

          {loading && <div className="fb-loading" role="status"><span /><p>Reading the company. Building the value map.</p></div>}
          {error && <div className="fb-error" role="status"><p>{error}</p><button type="button" onClick={() => { setCompany("TOMRA"); setError(null); }}>Use TOMRA proof</button></div>}

          <div className="fb-entry__note">
            <span>COMPANY → VALUE → DECISION → RESULT → LEARNING</span>
            <p>Facts stay facts. Estimates stay estimates. Planetary benefit is never called realised impact before it is measured.</p>
          </div>
        </section>
      )}

      {analysis && (
        <div className="fb-result">
          <header className="fb-company">
            <div className="fb-company__topline">
              <button type="button" className="fb-back" onClick={() => { setAnalysis(null); setError(null); }}>← New analysis</button>
              <span>{analysis.analysisStatus.replaceAll("_", " ")} · {sourceCount} SOURCES · {analysis.engine}</span>
            </div>
            <div className="fb-company__title">
              <div>
                <p className="fb-eyebrow">4BRANDS / COMPANY VALUE MAP</p>
                <h1>{analysis.company.name}</h1>
              </div>
              <p>{analysis.company.description}</p>
            </div>
            <div className="fb-company__identity">
              <span>{analysis.company.legalName || "Legal entity unresolved"}</span>
              <span>{analysis.company.ticker || "Private / ticker unresolved"}</span>
              <span>{analysis.company.sector || "Sector unresolved"}</span>
              <span>{analysis.company.geography || "Geography unresolved"}</span>
            </div>
          </header>

          <section className="fb-metrics" aria-label="Economic baseline">
            {leadMetrics.map((metric) => (
              <article key={`${metric.label}-${metric.period}`}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.period}</small>
              </article>
            ))}
          </section>

          <section className="fb-model-strip" aria-label="Public company model">
            <article><span>ECONOMIC STATE</span><strong>{analysis.economicBaseline.length} sourced baseline signals</strong></article>
            <article><span>MARKET / SECTOR</span><strong>{analysis.company.sector || "Unresolved from current evidence"}</strong></article>
            <article><span>RISK / LEAKAGE</span><strong>{analysis.valueLeakage[0]?.title || "No supported constraint resolved"}</strong></article>
            <article><span>PUBLIC EVIDENCE</span><strong>{sourceCount} source records · {analysis.unknowns.length} explicit unknowns</strong></article>
          </section>

          <section className="fb-priority">
            <div className="fb-section-head">
              <p className="fb-eyebrow">VALUE FINDER</p>
              <h2>Three things that matter.</h2>
              <p>Highest-priority hypotheses where economic value and planetary value appear to reinforce each other. Ranking is transparent evidence and judgement, never an opaque sustainability score.</p>
            </div>
            <div className="fb-priority__list">
              {analysis.alignedTop3.map((item) => <OpportunityRow key={`${item.rank}-${item.title}`} item={item} primary />)}
            </div>
          </section>

          <section className="fb-next">
            <div>
              <p className="fb-eyebrow">FIRST INTERVENTION TEST</p>
              <h2>{analysis.nextExperiment.title}</h2>
            </div>
            <div className="fb-next__body">
              <p>{analysis.nextExperiment.hypothesis}</p>
              <dl>
                <div><dt>Method</dt><dd>{analysis.nextExperiment.method}</dd></div>
                <div><dt>Success</dt><dd>{analysis.nextExperiment.successMetric}</dd></div>
                <div><dt>Business measure</dt><dd>{analysis.nextExperiment.economicMeasurement}</dd></div>
                <div><dt>Planet measure</dt><dd>{analysis.nextExperiment.planetaryMeasurement}</dd></div>
              </dl>
            </div>
          </section>

          <section className="fb-twin" id="company-twin">
            <div className="fb-twin__head">
              <div>
                <p className="fb-eyebrow">BUILD YOUR TWIN / BETA</p>
                <h2>One living model of the company.</h2>
                <div className="fb-twin__status"><span>LOCAL PROTOTYPE</span><span>THIS DEVICE ONLY</span><span>NO SERVER WRITE</span></div>
              </div>
              <p>Public evidence is only the outside view. Add a minimum internal baseline to turn the public Value Map into a working Company Operating Twin. This prototype stores the inputs locally in this browser; it does not publish them or treat them as verified public facts.</p>
            </div>

            <div className="fb-twin-form">
              <div className="fb-twin-field fb-twin-field--wide"><label htmlFor="twin-objective">Primary company objective</label><input id="twin-objective" value={twin.objective} onChange={(e) => { setTwin({ ...twin, objective: e.target.value }); setSaveState("IDLE"); }} placeholder="e.g. improve recurring margin without slowing growth" /></div>
              <div className="fb-twin-field"><label htmlFor="twin-revenue">Current annual revenue</label><input id="twin-revenue" value={twin.annualRevenue} onChange={(e) => { setTwin({ ...twin, annualRevenue: e.target.value }); setSaveState("IDLE"); }} placeholder="Internal baseline" /></div>
              <div className="fb-twin-field"><label htmlFor="twin-margin">Gross / contribution margin</label><input id="twin-margin" value={twin.grossMargin} onChange={(e) => { setTwin({ ...twin, grossMargin: e.target.value }); setSaveState("IDLE"); }} placeholder="Internal baseline" /></div>
              <div className="fb-twin-field"><label htmlFor="twin-cash">Operating cash / cash conversion</label><input id="twin-cash" value={twin.operatingCash} onChange={(e) => { setTwin({ ...twin, operatingCash: e.target.value }); setSaveState("IDLE"); }} placeholder="Internal baseline" /></div>
              <div className="fb-twin-field"><label htmlFor="twin-growth">Customer / revenue growth</label><input id="twin-growth" value={twin.customerGrowth} onChange={(e) => { setTwin({ ...twin, customerGrowth: e.target.value }); setSaveState("IDLE"); }} placeholder="Internal baseline" /></div>
              <div className="fb-twin-field"><label htmlFor="twin-constraint">Primary operating constraint</label><input id="twin-constraint" value={twin.primaryConstraint} onChange={(e) => { setTwin({ ...twin, primaryConstraint: e.target.value }); setSaveState("IDLE"); }} placeholder="What is currently limiting value?" /></div>
              <div className="fb-twin-field fb-twin-field--wide"><label htmlFor="twin-notes">Internal context / unknowns</label><textarea id="twin-notes" rows={2} value={twin.notes} onChange={(e) => { setTwin({ ...twin, notes: e.target.value }); setSaveState("IDLE"); }} placeholder="What public data cannot know about this company?" /></div>
            </div>
            <div className="fb-twin-actions"><p>Private local working state. Not assurance. Not synced across devices.</p><button type="button" onClick={saveTwin}>{saveState === "SAVED" ? "SAVED LOCALLY" : "SAVE TWIN STATE"}</button></div>

            <div className="fb-twin-boards" aria-label="Company operating twin boards">
              <Board label="01 / FINANCE" title="Economic spine">
                <ul>
                  {analysis.economicBaseline.slice(0, 3).map((m) => <li key={m.label}><strong>{m.label}: {m.value}</strong>{m.period} · {m.truthClass}</li>)}
                  {twin.grossMargin && <li><strong>Internal margin: {twin.grossMargin}</strong>LOCAL INPUT · not public truth</li>}
                  {twin.operatingCash && <li><strong>Internal cash: {twin.operatingCash}</strong>LOCAL INPUT · not public truth</li>}
                </ul>
              </Board>
              <Board label="02 / GROWTH" title="Value drivers">
                <ul>{analysis.valueDrivers.slice(0, 4).map((s) => <li key={s.title}><strong>{s.title}</strong>{s.detail}</li>)}</ul>
              </Board>
              <Board label="03 / COMMERCE" title="Business model">
                <ul>{analysis.businessModel.slice(0, 4).map((s) => <li key={s.title}><strong>{s.title}</strong>{s.detail}</li>)}</ul>
              </Board>
              <Board label="04 / PLANET" title="Intersections">
                <ul>{analysis.alignedTop3.map((o) => <li key={o.rank}><strong>{o.title}</strong>{o.planetaryLogic}</li>)}</ul>
              </Board>
              <Board label="05 / OPPORTUNITIES" title="Next value">
                <ul>{analysis.opportunities.slice(0, 4).map((o) => <li key={o.rank}><strong>{String(o.rank).padStart(2, "0")} · {o.title}</strong>{o.estimatedValue}</li>)}</ul>
              </Board>
            </div>

            <div className="fb-ledger">
              <div className="fb-ledger__head">
                <h3>Decision + Value Ledger</h3>
                <p>Estimated value, approved action, measured result and realised value stay separate. A hypothesis only moves forward when someone deliberately changes its state.</p>
              </div>
              {analysis.alignedTop3.map((item) => (
                <div className="fb-ledger-row" key={item.rank}>
                  <span>{String(item.rank).padStart(2, "0")}</span>
                  <div><h4>{item.title}</h4><p>{item.estimatedValue}</p></div>
                  <select aria-label={`Decision state for ${item.title}`} value={ledger[String(item.rank)] || "OPPORTUNITY"} onChange={(e) => setDecision(item.rank, e.target.value as DecisionState)}>
                    {DECISION_STATES.map((state) => <option value={state} key={state}>{state}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="fb-studio">
              <div className="fb-studio__copy">
                <p className="fb-eyebrow">WEBSITE STUDIO / PREVIEW</p>
                <h3>Twin → public projection.</h3>
                <p>A company website can become a controlled projection of approved Twin truth instead of a competing truth store. This first surface is preview-only: nothing here publishes automatically.</p>
              </div>
              <div className="fb-studio-preview" aria-label="Website Studio preview">
                <span>PREVIEW ONLY · NOT PUBLISHED</span>
                <div>
                  <h4>{analysis.company.name}</h4>
                  <p>{twin.objective || analysis.company.description}</p>
                </div>
                <footer><span>{analysis.company.sector || "Company"}</span><span>{analysis.alignedTop3[0]?.title || "Opportunity unresolved"}</span></footer>
              </div>
            </div>
          </section>

          <section className="fb-depth">
            <div className="fb-section-head fb-section-head--compact">
              <p className="fb-eyebrow">SOURCE-GROUNDED COMPANY MODEL</p>
              <h2>Open only what you need.</h2>
            </div>

            <Disclosure title="Economic baseline" meta={`${analysis.economicBaseline.length} metrics`}>
              <div className="fb-metric-table">
                {analysis.economicBaseline.map((metric) => (
                  <div key={`${metric.label}-${metric.period}`}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.period}</small><TruthMark value={metric.truthClass} /></div>
                ))}
              </div>
            </Disclosure>

            <Disclosure title="How the company creates value" meta={`${analysis.businessModel.length + analysis.valueDrivers.length} signals`}>
              <div className="fb-two-up"><div><h3>Business model</h3><StatementRows items={analysis.businessModel} /></div><div><h3>Value drivers</h3><StatementRows items={analysis.valueDrivers} /></div></div>
            </Disclosure>

            <Disclosure title="Where value leaks / risks" meta={`${analysis.valueLeakage.length} constraints`}>
              <StatementRows items={analysis.valueLeakage} />
            </Disclosure>

            <Disclosure title="All opportunities" meta={`${analysis.opportunities.length} hypotheses`}>
              <div className="fb-all-opportunities">{analysis.opportunities.map((item) => <OpportunityRow key={`${item.rank}-${item.title}`} item={item} />)}</div>
            </Disclosure>

            <Disclosure title="Solutions and actors" meta={`${analysis.solutions.length} paths`}>
              <StatementRows items={analysis.solutions} />
            </Disclosure>

            <Disclosure title="Evidence, assumptions and unknowns" meta={`${sourceCount} sources`}>
              <div className="fb-evidence">
                <div className="fb-evidence__sources">
                  {analysis.evidence.map((source) => (
                    <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                      <span>{source.publisher} · {source.checkedAt}</span>
                      <strong>{source.title}</strong>
                      <p>{source.note}</p>
                    </a>
                  ))}
                </div>
                <div className="fb-evidence__limits">
                  <div><h3>Assumptions</h3><ul>{analysis.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  <div><h3>Unknowns</h3><ul>{analysis.unknowns.map((item) => <li key={item}>{item}</li>)}</ul></div>
                </div>
              </div>
            </Disclosure>
          </section>

          <footer className="fb-footer">
            <span>4BRANDS / UNIVERSAL ACTOR VALUE ENGINE</span>
            <p>{new Date(analysis.generatedAt).toLocaleDateString()} · Decision intelligence, not assurance. Internal Twin data remains local to this browser.</p>
          </footer>
        </div>
      )}
    </main>
  );
}
