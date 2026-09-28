import { FormEvent, useMemo, useState } from "react";
import "@/styles/fourbrand.css";

type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";
type Confidence = "HIGH" | "MEDIUM" | "LOW";

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

export default function FourBrand() {
  const [company, setCompany] = useState("TOMRA");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceCount = useMemo(() => analysis?.evidence.length ?? 0, [analysis]);
  const leadMetrics = useMemo(() => analysis?.economicBaseline.slice(0, 4) ?? [], [analysis]);

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

  return (
    <main className="fb-shell">
      <nav className="fb-nav" aria-label="4BRAND">
        <a href="/" className="fb-wordmark">4PLANET<span>_</span></a>
        <div className="fb-nav__context">PARTNERS / 4BRAND</div>
        <a href="/companies" className="fb-nav__link">COMPANIES</a>
      </nav>

      {!analysis && (
        <section className="fb-entry">
          <div className="fb-entry__copy">
            <p className="fb-eyebrow">COMPANY INTELLIGENCE</p>
            <h1>Where better business<br />meets a living planet.</h1>
            <p className="fb-intro">Enter a company. 4BRAND reads the public evidence, understands the economics and finds the few opportunities worth looking at.</p>
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
              <span>PUBLIC DATA</span><span>FINANCIAL FIRST</span><span>SOURCE-AWARE</span>
            </div>
          </form>

          {loading && <div className="fb-loading" role="status"><span /><p>Reading the company. Building the value map.</p></div>}
          {error && <div className="fb-error" role="status"><p>{error}</p><button type="button" onClick={() => { setCompany("TOMRA"); setError(null); }}>Use TOMRA proof</button></div>}

          <div className="fb-entry__note">
            <span>4BRAND / 01</span>
            <p>Facts stay facts. Estimates stay estimates. Nothing is called impact until it is measured.</p>
          </div>
        </section>
      )}

      {analysis && (
        <div className="fb-result">
          <header className="fb-company">
            <div className="fb-company__topline">
              <button type="button" className="fb-back" onClick={() => { setAnalysis(null); setError(null); }}>← New analysis</button>
              <span>{analysis.analysisStatus.replaceAll("_", " ")} · {sourceCount} SOURCES</span>
            </div>
            <div className="fb-company__title">
              <div>
                <p className="fb-eyebrow">4BRAND VALUE MAP</p>
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

          <section className="fb-priority">
            <div className="fb-section-head">
              <p className="fb-eyebrow">THE SIGNAL</p>
              <h2>Three things that matter.</h2>
              <p>Highest-priority hypotheses where economic value and planetary value appear to reinforce each other.</p>
            </div>
            <div className="fb-priority__list">
              {analysis.alignedTop3.map((item) => <OpportunityRow key={`${item.rank}-${item.title}`} item={item} primary />)}
            </div>
          </section>

          <section className="fb-next">
            <div>
              <p className="fb-eyebrow">FIRST TEST</p>
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

          <section className="fb-depth">
            <div className="fb-section-head fb-section-head--compact">
              <p className="fb-eyebrow">GO DEEPER</p>
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

            <Disclosure title="Where value leaks" meta={`${analysis.valueLeakage.length} constraints`}>
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
            <span>4BRAND / UNIVERSAL ACTOR VALUE ENGINE</span>
            <p>{new Date(analysis.generatedAt).toLocaleDateString()} · Decision intelligence, not assurance.</p>
          </footer>
        </div>
      )}
    </main>
  );
}
