import { FormEvent, useMemo, useState } from "react";
import "@/styles/fourbrand.css";

type TruthClass = "FACT" | "CALCULATION" | "ESTIMATE" | "ASSUMPTION" | "INTERPRETATION" | "UNKNOWN";

type Metric = {
  label: string;
  value: string;
  period: string;
  truthClass: TruthClass;
  sourceIds: string[];
};

type Statement = {
  title: string;
  detail: string;
  truthClass: TruthClass;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  sourceIds: string[];
};

type Opportunity = {
  rank: number;
  title: string;
  economicLogic: string;
  estimatedValue: string;
  planetaryLogic: string;
  planetaryDelta: string;
  truthClass: TruthClass;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  sourceIds: string[];
};

type Evidence = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  checkedAt: string;
  note: string;
};

type Analysis = {
  engine: string;
  company: {
    name: string;
    legalName: string;
    ticker: string;
    sector: string;
    geography: string;
    description: string;
  };
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

const truthClasses: TruthClass[] = ["FACT", "CALCULATION", "ESTIMATE", "ASSUMPTION", "INTERPRETATION", "UNKNOWN"];

function TruthBadge({ value }: { value: TruthClass }) {
  return <span className={`fourbrand-truth fourbrand-truth--${value.toLowerCase()}`}>{value}</span>;
}

function StatementList({ items }: { items: Statement[] }) {
  return (
    <div className="fourbrand-statement-list">
      {items.map((item) => (
        <article className="fourbrand-statement" key={`${item.title}-${item.detail}`}>
          <div className="fourbrand-statement__meta">
            <TruthBadge value={item.truthClass} />
            <span>{item.confidence} CONFIDENCE</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function OpportunityTable({ items, compact = false }: { items: Opportunity[]; compact?: boolean }) {
  return (
    <div className={`fourbrand-opportunities${compact ? " fourbrand-opportunities--compact" : ""}`}>
      {items.map((item) => (
        <article className="fourbrand-opportunity" key={`${item.rank}-${item.title}`}>
          <div className="fourbrand-opportunity__rank">{String(item.rank).padStart(2, "0")}</div>
          <div className="fourbrand-opportunity__body">
            <div className="fourbrand-opportunity__topline">
              <h3>{item.title}</h3>
              <div className="fourbrand-statement__meta">
                <TruthBadge value={item.truthClass} />
                <span>{item.confidence}</span>
              </div>
            </div>
            <div className="fourbrand-opportunity__grid">
              <div><span>ECONOMIC LOGIC</span><p>{item.economicLogic}</p></div>
              <div><span>VALUE</span><p>{item.estimatedValue}</p></div>
              <div><span>PLANET INTERSECTION</span><p>{item.planetaryLogic}</p></div>
              <div><span>PLANETARY DELTA</span><p>{item.planetaryDelta}</p></div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function FourBrand() {
  const [company, setCompany] = useState("TOMRA");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceById = useMemo(() => {
    const map = new Map<string, Evidence>();
    analysis?.evidence.forEach((source) => map.set(source.id, source));
    return map;
  }, [analysis]);

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
      const payload = await response.json() as { ok?: boolean; analysis?: Analysis; error?: string; detail?: string };
      if (!response.ok || !payload.analysis) {
        throw new Error(payload.detail || payload.error || "Analysis engine unavailable");
      }
      setAnalysis(payload.analysis);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis engine unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fourbrand-shell">
      <header className="fourbrand-hero">
        <a className="fourbrand-kicker" href="/brands">4PLANET / 4BRAND</a>
        <h1>Find where company value and planetary value meet.</h1>
        <p className="fourbrand-hero__lede">
          4BRAND analyses a company from public financial, commercial and planetary evidence, then ranks the highest-value opportunities where better business and a living planet can reinforce each other.
        </p>
        <form className="fourbrand-search" onSubmit={runAnalysis}>
          <label htmlFor="fourbrand-company">COMPANY</label>
          <div className="fourbrand-search__row">
            <input
              id="fourbrand-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="TOMRA, IKEA, Mowi, Maersk…"
              autoComplete="organization"
              maxLength={120}
            />
            <button type="submit" disabled={loading || company.trim().length < 2}>
              {loading ? "ANALYSING…" : "RUN VALUE MAP"}
            </button>
          </div>
        </form>
        <div className="fourbrand-chain" aria-label="Analysis chain">
          {[
            "COMPANY", "ECONOMIC BASELINE", "VALUE DRIVERS", "VALUE LEAKAGE", "OPPORTUNITIES",
            "PLANET INTERSECTION", "SOLUTIONS", "PRIORITISATION", "INTERVENTION", "RESULT", "LEARNING",
          ].map((step, index) => <span key={step}>{index ? "→ " : ""}{step}</span>)}
        </div>
      </header>

      <section className="fourbrand-truthbar" aria-label="Truth classification">
        <strong>TRUTH LAYER</strong>
        <div>{truthClasses.map((item) => <TruthBadge key={item} value={item} />)}</div>
        <p>Nothing is presented as realised financial or planetary impact until it has been measured.</p>
      </section>

      {error && (
        <section className="fourbrand-error" role="status">
          <strong>ANALYSIS ENGINE NOT COMPLETE</strong>
          <p>{error}</p>
          <p>TOMRA is available as the first verified proof case. Other companies require the live research runtime to be available.</p>
        </section>
      )}

      {!analysis && !loading && !error && (
        <section className="fourbrand-empty">
          <span>4BRAND VALUE MAP / 01</span>
          <h2>One company in. A structured value thesis out.</h2>
          <p>The first proof case is TOMRA. Enter a company name to run the engine.</p>
        </section>
      )}

      {loading && (
        <section className="fourbrand-loading" aria-live="polite">
          <span>RESEARCHING COMPANY</span>
          <h2>Building economic baseline, value map and planet intersection.</h2>
          <div className="fourbrand-progress"><i /></div>
        </section>
      )}

      {analysis && (
        <div className="fourbrand-report">
          <section className="fourbrand-company-head">
            <div>
              <span>4BRAND VALUE MAP / {analysis.analysisStatus.replaceAll("_", " ")}</span>
              <h2>{analysis.company.name}</h2>
              <p>{analysis.company.description}</p>
            </div>
            <dl>
              <div><dt>LEGAL</dt><dd>{analysis.company.legalName || "Not resolved"}</dd></div>
              <div><dt>TICKER</dt><dd>{analysis.company.ticker || "—"}</dd></div>
              <div><dt>SECTOR</dt><dd>{analysis.company.sector || "—"}</dd></div>
              <div><dt>GEOGRAPHY</dt><dd>{analysis.company.geography || "—"}</dd></div>
            </dl>
          </section>

          <section className="fourbrand-status-note">
            <TruthBadge value="INTERPRETATION" />
            <p>{analysis.statusNote}</p>
          </section>

          <section className="fourbrand-section">
            <div className="fourbrand-section__head"><span>01</span><h2>Economic baseline</h2></div>
            <div className="fourbrand-metrics">
              {analysis.economicBaseline.map((metric) => (
                <article key={`${metric.label}-${metric.period}`}>
                  <div><span>{metric.label}</span><TruthBadge value={metric.truthClass} /></div>
                  <strong>{metric.value}</strong>
                  <p>{metric.period}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="fourbrand-two-col">
            <div className="fourbrand-section">
              <div className="fourbrand-section__head"><span>02</span><h2>How value is created</h2></div>
              <StatementList items={analysis.businessModel} />
            </div>
            <div className="fourbrand-section">
              <div className="fourbrand-section__head"><span>03</span><h2>Value drivers</h2></div>
              <StatementList items={analysis.valueDrivers} />
            </div>
          </section>

          <section className="fourbrand-section">
            <div className="fourbrand-section__head"><span>04</span><h2>Value leakage / constraints</h2></div>
            <StatementList items={analysis.valueLeakage} />
          </section>

          <section className="fourbrand-section fourbrand-section--black">
            <div className="fourbrand-section__head"><span>05</span><h2>Top 3 aligned opportunities</h2></div>
            <p className="fourbrand-section__intro">Highest-priority hypotheses where economic upside and planetary improvement appear directionally aligned.</p>
            <OpportunityTable items={analysis.alignedTop3} compact />
          </section>

          <section className="fourbrand-section">
            <div className="fourbrand-section__head"><span>06</span><h2>Full opportunity map</h2></div>
            <OpportunityTable items={analysis.opportunities} />
          </section>

          <section className="fourbrand-two-col">
            <div className="fourbrand-section">
              <div className="fourbrand-section__head"><span>07</span><h2>Solutions / actors</h2></div>
              <StatementList items={analysis.solutions} />
            </div>
            <div className="fourbrand-section fourbrand-experiment">
              <div className="fourbrand-section__head"><span>08</span><h2>First experiment</h2></div>
              <TruthBadge value={analysis.nextExperiment.truthClass} />
              <h3>{analysis.nextExperiment.title}</h3>
              <dl>
                <div><dt>HYPOTHESIS</dt><dd>{analysis.nextExperiment.hypothesis}</dd></div>
                <div><dt>METHOD</dt><dd>{analysis.nextExperiment.method}</dd></div>
                <div><dt>SUCCESS</dt><dd>{analysis.nextExperiment.successMetric}</dd></div>
                <div><dt>ECONOMIC MEASURE</dt><dd>{analysis.nextExperiment.economicMeasurement}</dd></div>
                <div><dt>PLANETARY MEASURE</dt><dd>{analysis.nextExperiment.planetaryMeasurement}</dd></div>
              </dl>
            </div>
          </section>

          <section className="fourbrand-section fourbrand-evidence">
            <div className="fourbrand-section__head"><span>09</span><h2>Evidence</h2></div>
            <div className="fourbrand-evidence__grid">
              {analysis.evidence.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                  <span>{source.id} / {source.publisher}</span>
                  <strong>{source.title}</strong>
                  <p>{source.note}</p>
                  <small>CHECKED {source.checkedAt}</small>
                </a>
              ))}
            </div>
          </section>

          <section className="fourbrand-two-col fourbrand-last-grid">
            <div><span>ASSUMPTIONS</span><ul>{analysis.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><span>UNKNOWNS</span><ul>{analysis.unknowns.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </section>

          <footer className="fourbrand-footer">
            <span>4BRAND / UNIVERSAL ACTOR VALUE ENGINE</span>
            <p>Generated {new Date(analysis.generatedAt).toLocaleString()} · {sourceById.size} evidence records · decision intelligence, not assurance.</p>
          </footer>
        </div>
      )}
    </main>
  );
}
