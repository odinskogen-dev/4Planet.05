import { FormEvent, useEffect, useMemo, useState } from "react";
import "@/styles/fourbrand.css";
import PublicCompanyProfile, { type PublicCompanyProfileData } from "@/pages/partners/PublicCompanyProfile";
import { trackEvent } from "@/analytics/Analytics";
import { trackMeaningfulUse } from "@/analytics/ProductAnalytics";
import CompanyBrainControls from "@/pages/partners/CompanyBrainControls";
import type { CompanyBrainSnapshot } from "@/product/FourBrandBrainClient";
import { identityLoginUrl } from "@/identity/identityClient";

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
  company: { name: string; legalName: string; ticker: string; sector: string; geography: string; description: string; organizationNumber?: string; lei?: string | null; identityState?: string };
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

type CompanyIdentityCandidate = {
  organizationNumber: string;
  entityName: string;
  organizationForm: string | null;
  registeredDate: string | null;
  deleted: boolean;
  bankrupt: boolean;
  liquidation: boolean;
  sourceUrl: string;
};

type CompanyIdentityResolution = {
  entity: CompanyIdentityCandidate;
  gleif: {
    state: string;
    verified: { lei: string; legalName: string; registeredAs: string | null; sourceUrl: string } | null;
    candidates: Array<{ lei: string; legalName: string; registeredAs: string | null; sourceUrl: string }>;
  };
};

type ClimateOwnerCandidate = { id: string; name: string; country: string | null; type: string | null; sourceUrl: string };
type ClimateFacility = {
  id: string | number | null; sourceId: string | number | null; canonicalFacilityId: string | null;
  name: string | null; sector: string | null; subsector: string | null; country: string | null;
  lat: number; lon: number; co2e: number | null; year: string | number; gas: string;
};

type ProcurementSignal = {
  id: string; title: string; buyer: string | null; buyerCountry: string | null;
  publicationDate: string | null; noticeType: string | null; cpv: string[]; deadline: string | null; sourceUrl: string;
};

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

type ScenarioState = {
  revenueDelta: string;
  marginDelta: string;
  horizon: string;
};

const INITIAL_SCENARIO: ScenarioState = {
  revenueDelta: "10",
  marginDelta: "0",
  horizon: "12 months",
};

function parseScenarioNumber(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function storageKey(kind: "twin" | "ledger", companyName: string) {
  return `4brands:${kind}:${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function hydrateTwinFromCompanyBrain(snapshot: CompanyBrainSnapshot): TwinState {
  const memories = snapshot.memories || [];
  const metrics = snapshot.metrics || [];
  const memory = (title: string) => String(memories.find((item) => item.title === title)?.content || "");
  const metric = (key: string) => String(metrics.find((item) => item.metric_key === key)?.text_value || "");
  return {
    ...EMPTY_TWIN,
    objective: memory("Primary company objective"),
    primaryConstraint: memory("Primary operating constraint"),
    notes: memory("Company internal context"),
    annualRevenue: metric("annual_revenue"),
    grossMargin: metric("gross_or_contribution_margin"),
    operatingCash: metric("operating_cash_or_conversion"),
    customerGrowth: metric("customer_or_revenue_growth"),
  };
}

function hydrateLedgerFromCompanyBrain(snapshot: CompanyBrainSnapshot): LedgerState {
  const ranks = new Map<string, string>();
  for (const item of snapshot.opportunities || []) {
    const detector = String(item.detector_key || "");
    if (detector.startsWith("public_value_map:")) ranks.set(String(item.id), detector.split(":")[1]);
  }
  const next: LedgerState = {};
  for (const decision of snapshot.decisions || []) {
    const rank = ranks.get(String(decision.opportunity_id || ""));
    if (rank) next[rank] = String(decision.state || "OPPORTUNITY") as DecisionState;
  }
  return next;
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

function ProcurementDemandPanel({ analysis }: { analysis: Analysis }) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<"NOR" | "ALL">("NOR");
  const [signals, setSignals] = useState<ProcurementSignal[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [state, setState] = useState<"IDLE" | "LOADING" | "READY" | "NO_MATCH" | "ERROR">("IDLE");

  const search = async (event?: FormEvent) => {
    event?.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setState("LOADING"); setSignals([]); setTotal(null);
    try {
      const response = await fetch(`/api/procurement-demand?q=${encodeURIComponent(q)}&country=${country}`);
      const payload = await response.json() as { ok?: boolean; signals?: ProcurementSignal[]; total?: number };
      if (!response.ok || !payload.ok) throw new Error("PROCUREMENT_SOURCE_FAILED");
      const next = Array.isArray(payload.signals) ? payload.signals : [];
      setSignals(next);
      setTotal(typeof payload.total === "number" ? payload.total : next.length);
      setState(next.length ? "READY" : "NO_MATCH");
      trackEvent("company_procurement_demand_searched", { product_area: "4brands", result_count: next.length, country_scope: country });
    } catch {
      setState("ERROR");
    }
  };

  return (
    <section className="fb-demand" aria-label="Public procurement demand signals">
      <div className="fb-demand__head">
        <div>
          <p className="fb-eyebrow">PUBLIC DEMAND SIGNALS · TED</p>
          <h2>See what public buyers are actually publishing.</h2>
          <p>Search a product, solution or capability relevant to {analysis.company.name}. The search is user-controlled: company sector text is never converted into demand automatically.</p>
        </div>
      </div>
      <form className="fb-demand__search" onSubmit={search}>
        <label htmlFor="fb-demand-query">Procurement keywords</label>
        <div>
          <input id="fb-demand-query" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="e.g. reverse vending, recycling sorting, biodiversity monitoring" />
          <select aria-label="Procurement geography" value={country} onChange={(event)=>setCountry(event.target.value as "NOR"|"ALL")}>
            <option value="NOR">Norway on TED</option>
            <option value="ALL">All TED markets</option>
          </select>
          <button type="submit" disabled={state==="LOADING"||query.trim().length<2}>{state==="LOADING"?"Searching…":"Search published notices"}</button>
        </div>
        <small>TED is queried anonymously through its published-notice Search API. Doffin-only/national Norwegian notices are not represented as complete coverage until the official Doffin subscription is configured.</small>
      </form>
      {state==="ERROR"&&<p className="fb-demand__state" role="status">TED search is unavailable right now. No market conclusion is inferred.</p>}
      {state==="NO_MATCH"&&<p className="fb-demand__state" role="status">No active bounded result returned. This is not evidence that there is no market demand.</p>}
      {state==="READY"&&(
        <>
          <div className="fb-demand__summary"><strong>{total ?? signals.length}</strong><span>matching active TED notice records reported by the source query · showing up to {signals.length}</span></div>
          <div className="fb-demand__results">
            {signals.map((signal)=>(
              <article key={signal.id}>
                <span>{signal.id}</span>
                <h3>{signal.title}</h3>
                <p>{signal.buyer || "BUYER NAME UNAVAILABLE"}{signal.buyerCountry ? ` · ${signal.buyerCountry}` : ""}</p>
                <div>{signal.publicationDate || "PUBLICATION DATE UNKNOWN"}{signal.deadline ? ` · deadline ${signal.deadline}` : ""}</div>
                {signal.cpv.length>0&&<small>CPV {signal.cpv.slice(0,4).join(" · ")}</small>}
                <a href={signal.sourceUrl} target="_blank" rel="noreferrer">Open original TED notice ↗</a>
              </article>
            ))}
          </div>
        </>
      )}
      <p className="fb-demand__boundary">A notice is a source-grounded procurement signal. It is not a sale, contract award, supplier fit, willingness-to-pay proof, realised value or ecological outcome.</p>
    </section>
  );
}

function CompanyClimateTracePanel({ analysis }: { analysis: Analysis }) {
  const legalName = analysis.company.legalName || analysis.company.name;
  const [owners, setOwners] = useState<ClimateOwnerCandidate[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<ClimateOwnerCandidate | null>(null);
  const [facilities, setFacilities] = useState<ClimateFacility[]>([]);
  const [state, setState] = useState<"IDLE" | "SEARCHING" | "REVIEW" | "LOADING" | "READY" | "NO_MATCH" | "ERROR">("IDLE");

  const discover = async () => {
    setState("SEARCHING"); setOwners([]); setFacilities([]); setSelectedOwner(null);
    try {
      const response = await fetch(`/api/climate-trace-owners?name=${encodeURIComponent(legalName)}`);
      const payload = await response.json() as { ok?: boolean; candidates?: ClimateOwnerCandidate[] };
      if (!response.ok || !payload.ok) throw new Error("OWNER_SEARCH_FAILED");
      const next = Array.isArray(payload.candidates) ? payload.candidates : [];
      setOwners(next); setState(next.length ? "REVIEW" : "NO_MATCH");
    } catch { setState("ERROR"); }
  };

  const confirmOwner = async (owner: ClimateOwnerCandidate) => {
    setSelectedOwner(owner); setFacilities([]); setState("LOADING");
    try {
      const response = await fetch(`/api/climate-trace?ownerIds=${encodeURIComponent(owner.id)}&sectors=power,electricity-generation,oil-and-gas-production-and-transport,oil-and-gas-refining,coal-mining,manufacturing&limit=250&year=2025&gas=co2e_100yr`);
      const payload = await response.json() as { ok?: boolean; assets?: ClimateFacility[] };
      if (!response.ok || !payload.ok) throw new Error("SOURCE_SEARCH_FAILED");
      const next = Array.isArray(payload.assets) ? payload.assets : [];
      setFacilities(next); setState(next.length ? "READY" : "NO_MATCH");
      trackEvent("company_climate_trace_owner_reviewed", { product_area: "4brands", result_count: next.length });
    } catch { setState("ERROR"); }
  };

  return (
    <section className="fb-climate" aria-label="Climate TRACE emitting-source discovery">
      <div className="fb-climate__head">
        <div><p className="fb-eyebrow">FACILITIES / EMISSIONS · CLIMATE TRACE</p><h2>Connect the legal company to emitting sources only after review.</h2>
          <p>Climate TRACE owner search is a discovery layer. 4PLANET does not infer that a similarly named owner is the BRREG/GLEIF company. Choose an owner record before any facility list is shown.</p></div>
        {state === "IDLE" && <button type="button" onClick={() => void discover()}>Find owner candidates</button>}
      </div>
      {state === "SEARCHING" && <p role="status">Searching Climate TRACE owner records…</p>}
      {state === "NO_MATCH" && <p role="status">No bounded owner/facility result returned. No emissions are inferred.</p>}
      {state === "ERROR" && <p role="status">Climate TRACE is unavailable for this lookup. Existing company evidence is unchanged.</p>}
      {state === "REVIEW" && (
        <div className="fb-climate__owners">
          {owners.map((owner) => <button type="button" key={owner.id} onClick={() => void confirmOwner(owner)}>
            <span><strong>{owner.name}</strong><small>Climate TRACE owner ID {owner.id}{owner.country ? ` · ${owner.country}` : ""}</small></span><b>REVIEW THIS OWNER</b>
          </button>)}
        </div>
      )}
      {state === "LOADING" && <p role="status">Loading Climate TRACE sources for the reviewed owner…</p>}
      {selectedOwner && state === "READY" && (
        <>
          <div className="fb-climate__status"><strong>USER-REVIEWED SOURCE JOIN</strong><span>{legalName} → Climate TRACE owner {selectedOwner.name} ({selectedOwner.id})</span>
            <p>This review is session context, not automatically promoted to Company Brain or PLANETBRAIN truth.</p></div>
          <div className="fb-climate__facilities">
            {facilities.slice(0, 12).map((facility, index) => (
              <article key={String(facility.canonicalFacilityId || facility.sourceId || index)}>
                <span>{facility.canonicalFacilityId || `facility:climatetrace:${facility.sourceId}`}</span>
                <h3>{facility.name || "Unnamed Climate TRACE source"}</h3>
                <p>{facility.sector || "SECTOR UNKNOWN"}{facility.subsector ? ` / ${facility.subsector}` : ""}</p>
                <strong>{facility.co2e != null ? `${Math.round(facility.co2e).toLocaleString()} t CO₂e` : "EMISSIONS NOT REPORTED"}</strong>
                <small>{String(facility.year || "YEAR UNKNOWN")} · {facility.country || "COUNTRY UNKNOWN"} · source {String(facility.sourceId ?? "UNKNOWN")}</small>
                <a href={`/atlas?l=emissions&z=7&c=${facility.lon.toFixed(3)},${facility.lat.toFixed(3)}`} target="_blank" rel="noreferrer">Open this location in ATLAS ↗</a>
              </article>
            ))}
          </div>
          {facilities.length > 12 && <p className="fb-climate__more">{facilities.length - 12} additional source records returned; not hidden from the source, only collapsed in this first view.</p>}
        </>
      )}
    </section>
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
  const [scenario, setScenario] = useState<ScenarioState>(INITIAL_SCENARIO);
  const [identityCandidates, setIdentityCandidates] = useState<CompanyIdentityCandidate[]>([]);
  const [identityResolution, setIdentityResolution] = useState<CompanyIdentityResolution | null>(null);
  const [identityState, setIdentityState] = useState<"IDLE" | "SEARCHING" | "CANDIDATES" | "NO_MATCH" | "RESOLVING" | "READY" | "ERROR">("IDLE");
  const [publicProfile, setPublicProfile] = useState<PublicCompanyProfileData | null>(null);
  const [publicProfileState, setPublicProfileState] = useState<"IDLE" | "LOADING" | "READY" | "ERROR">("IDLE");

  const baselineRevenue = parseScenarioNumber(twin.annualRevenue);
  const baselineMargin = parseScenarioNumber(twin.grossMargin);
  const revenueDelta = parseScenarioNumber(scenario.revenueDelta) ?? 0;
  const marginDelta = parseScenarioNumber(scenario.marginDelta) ?? 0;
  const scenarioRevenue = baselineRevenue !== null && baselineRevenue > 0
    ? baselineRevenue * (1 + revenueDelta / 100)
    : null;
  const scenarioMargin = baselineMargin !== null ? baselineMargin + marginDelta : null;
  const baselineGrossProfit = baselineRevenue !== null && baselineMargin !== null
    ? baselineRevenue * (baselineMargin / 100)
    : null;
  const scenarioGrossProfit = scenarioRevenue !== null && scenarioMargin !== null
    ? scenarioRevenue * (scenarioMargin / 100)
    : null;

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

  async function analyseResolved(query: string, identity: CompanyIdentityResolution | null) {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    trackEvent("company_analysis_started", { product_area: "4brand", legal_identity: identity ? "brreg_exact" : "unresolved" });
    try {
      const verifiedLei = identity?.gleif?.verified || null;
      const response = await fetch("/api/brand-analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: identity?.entity?.entityName || query,
          identity: identity ? {
            organizationNumber: identity.entity.organizationNumber,
            legalName: identity.entity.entityName,
            lei: verifiedLei?.lei || null,
            identityState: verifiedLei ? "BRREG_EXACT_GLEIF_EXACT_REGISTRATION_ID" : "BRREG_EXACT_GLEIF_UNRESOLVED",
            brregSourceUrl: identity.entity.sourceUrl,
            gleifSourceUrl: verifiedLei?.sourceUrl || null,
          } : null,
        }),
      });
      const payload = await response.json() as { analysis?: Analysis; error?: string; detail?: string };
      if (!response.ok || !payload.analysis) throw new Error(payload.detail || payload.error || "Analysis engine unavailable");
      setAnalysis(payload.analysis);
      trackEvent("company_analysis_completed", { product_area: "4brand", analysis_status: payload.analysis.analysisStatus, source_count: payload.analysis.evidence.length });
      trackEvent("company_opened", { product_area: "4brand", analysis_status: payload.analysis.analysisStatus });
      if (payload.analysis.opportunities.length > 0) trackEvent("economic_value_found", { product_area: "4brand", opportunity_count: payload.analysis.opportunities.length });
      trackEvent("company_analysis", { product_area: "4brands", analysis_status: payload.analysis.analysisStatus, source_count: payload.analysis.evidence.length, opportunity_count: payload.analysis.opportunities.length });
      trackMeaningfulUse("4brands", "record_open", "company_value_map");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis engine unavailable");
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis(event?: FormEvent) {
    event?.preventDefault();
    const query = company.trim();
    if (query.length < 2) return;
    setError(null);
    setIdentityResolution(null);
    setIdentityCandidates([]);
    setIdentityState("SEARCHING");
    try {
      const response = await fetch(`/api/company-identity?q=${encodeURIComponent(query)}`, { headers: { accept: "application/json" } });
      const payload = await response.json() as { ok?: boolean; candidates?: CompanyIdentityCandidate[]; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Company identity source unavailable");
      const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
      setIdentityCandidates(candidates);
      setIdentityState(candidates.length ? "CANDIDATES" : "NO_MATCH");
    } catch (cause) {
      setIdentityState("ERROR");
      setError(cause instanceof Error ? cause.message : "Company identity source unavailable");
    }
  }

  async function loadPublicProfile(organizationNumber: string) {
    setPublicProfileState("LOADING");
    setPublicProfile(null);
    setAnalysis(null);
    setError(null);
    try {
      const response = await fetch("/api/company-public-profile?orgnr=" + encodeURIComponent(organizationNumber), { headers: { accept: "application/json" } });
      const payload = await response.json() as { ok?: boolean; profile?: PublicCompanyProfileData; error?: string; detail?: string };
      if (!response.ok || !payload.ok || !payload.profile) throw new Error(payload.detail || payload.error || "Public company profile unavailable");
      setPublicProfile(payload.profile);
      setPublicProfileState("READY");
      trackEvent("public_company_profile_opened", {
        product_area: "4brands",
        source_count: payload.profile.coverage.sourceCount,
        role_count: payload.profile.coverage.roleCount,
        change_count: payload.profile.coverage.changeCount,
      });
      trackMeaningfulUse("4brands", "record_open", "public_company_intelligence_profile");
    } catch (cause) {
      setPublicProfileState("ERROR");
      setError(cause instanceof Error ? cause.message : "Public company profile unavailable");
    }
  }

  async function confirmIdentity(candidate: CompanyIdentityCandidate) {
    setIdentityState("RESOLVING");
    setError(null);
    try {
      const response = await fetch(`/api/company-identity?orgnr=${encodeURIComponent(candidate.organizationNumber)}`, { headers: { accept: "application/json" } });
      const payload = await response.json() as { ok?: boolean; entity?: CompanyIdentityCandidate; gleif?: CompanyIdentityResolution["gleif"]; error?: string };
      if (!response.ok || !payload.ok || !payload.entity || !payload.gleif) throw new Error(payload.error || "Exact company identity could not be resolved");
      const resolved: CompanyIdentityResolution = { entity: payload.entity, gleif: payload.gleif };
      setIdentityResolution(resolved);
      setIdentityCandidates([]);
      setIdentityState("READY");
      setCompany(payload.entity.entityName);
      await loadPublicProfile(payload.entity.organizationNumber);
    } catch (cause) {
      setIdentityState("ERROR");
      setError(cause instanceof Error ? cause.message : "Exact company identity could not be resolved");
    }
  }

  function saveTwin() {
    if (!analysis || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey("twin", companyKey), JSON.stringify(twin));
    window.localStorage.setItem(storageKey("ledger", companyKey), JSON.stringify(ledger));
    setSaveState("SAVED");
    trackEvent("company_twin_saved", {
      product_area: "4brands",
      decision_states: Object.keys(ledger).length,
    });
    window.setTimeout(() => setSaveState("IDLE"), 1800);
  }

  function applyCompanyBrainSnapshot(snapshot: CompanyBrainSnapshot) {
    setTwin(hydrateTwinFromCompanyBrain(snapshot));
    setLedger(hydrateLedgerFromCompanyBrain(snapshot));
    setSaveState("SAVED");
    trackEvent("brain_context_retrieved", { product_area: "4brand" });
  }

  function setDecision(rank: number, state: DecisionState) {
    setLedger((current) => ({ ...current, [String(rank)]: state }));
    setSaveState("IDLE");
    if (state !== "OPPORTUNITY") trackEvent("decision_created", { product_area: "4brand", decision_state: state });
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
        .fb-architecture{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin:0 clamp(24px,6vw,96px);background:#fff}
        .fb-architecture a{display:block;min-height:152px;padding:18px;text-decoration:none;color:#111;border-right:1px solid #d9d9d4}.fb-architecture a:last-child{border-right:0}
        .fb-architecture span{font:9px "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#777}.fb-architecture strong{display:block;font:500 20px/1.08 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.025em;margin:18px 0 9px}.fb-architecture p{font-size:11px;line-height:1.45;color:#666;margin:0}
        .fb-brain-layer{margin:28px 0 0;padding:28px 0 0;border-top:1px solid #0a0a0a;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:42px}.fb-brain-layer h3{font:500 clamp(28px,4vw,50px)/1 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.045em;margin:5px 0 0}.fb-brain-layer p{font-size:13px;line-height:1.55;color:#555;margin:0}
        .fb-future{margin-top:72px;padding-top:32px;border-top:1px solid #0a0a0a}.fb-future__head{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:42px;margin-bottom:26px}.fb-future__head h3{font:500 clamp(34px,5vw,64px)/.98 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.05em;margin:6px 0 0}.fb-future__head p{font-size:13px;line-height:1.55;color:#555;margin:0}
        .fb-future-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid #0a0a0a;border-left:1px solid #d4d4ce;background:#fff}.fb-scenario-control,.fb-scenario-result{padding:18px;border-right:1px solid #d4d4ce;border-bottom:1px solid #d4d4ce;min-height:132px}.fb-scenario-control label,.fb-scenario-result span{display:block;font:9px/1.25 "Fragment Mono",ui-monospace,monospace;text-transform:uppercase;letter-spacing:.05em;color:#777;margin-bottom:14px}.fb-scenario-control input,.fb-scenario-control select{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid #aaa;background:transparent;padding:8px 0;font:500 21px/1.1 "Instrument Sans",system-ui,sans-serif;color:#111;outline:0}.fb-scenario-result strong{display:block;font:500 25px/1.05 "Instrument Sans",system-ui,sans-serif;letter-spacing:-.035em;margin-bottom:8px}.fb-scenario-result p{font-size:10px;line-height:1.45;color:#666;margin:0}.fb-future-law{margin-top:14px;font:9px/1.55 "Fragment Mono",ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase;color:#666}
        .fb-model-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin:0 clamp(24px,6vw,96px)}
        .fb-model-strip article{padding:18px 18px 22px;border-right:1px solid #d9d9d4}.fb-model-strip article:last-child{border-right:0}
        .fb-model-strip span{font:9px "Fragment Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:#777}
        .fb-model-strip strong{display:block;font:500 17px/1.28 "Instrument Sans",system-ui,sans-serif;margin-top:9px;color:#111}
        @media(max-width:1100px){.fb-twin-boards{grid-template-columns:repeat(2,minmax(0,1fr))}.fb-twin-form{grid-template-columns:repeat(2,minmax(0,1fr))}.fb-architecture,.fb-future-grid,.fb-model-strip{grid-template-columns:repeat(2,1fr)}.fb-architecture a:nth-child(2){border-right:0}.fb-model-strip article:nth-child(2){border-right:0}.fb-brain-layer,.fb-future__head{grid-template-columns:1fr}}
        @media(max-width:720px){.fb-twin__head,.fb-ledger__head,.fb-studio{grid-template-columns:1fr}.fb-twin-form,.fb-twin-boards,.fb-architecture,.fb-future-grid,.fb-model-strip{grid-template-columns:1fr}.fb-twin-field--wide{grid-column:auto}.fb-twin-board{min-height:auto}.fb-architecture a,.fb-model-strip article{border-right:0;border-bottom:1px solid #d9d9d4}.fb-ledger-row{grid-template-columns:34px 1fr}.fb-ledger-row select{grid-column:2}.fb-twin-actions{align-items:flex-start;flex-direction:column}.fb-studio-preview{min-height:360px}}
      `}</style>

      <nav className="fb-nav" aria-label="4BRANDS">
        <a href="/" className="fb-wordmark">4PLANET<span>_</span></a>
        <div className="fb-nav__context">COMPANY INTELLIGENCE / 4BRANDS</div>
        {analysis ? <a href="#company-twin" className="fb-nav__link">COMPANY WORKSPACE</a> : <a href="#company-analysis" className="fb-nav__link">PUBLIC INTELLIGENCE</a>}
      </nav>

      {analysis && <section className="fb-architecture" aria-label="4BRANDS company intelligence architecture">
        <a href="#company-analysis"><span>00 / COMPANY ANALYSIS</span><strong>Understand from the outside.</strong><p>Free public, source-aware company analysis and value discovery.</p></a>
        <a href="#company-brain"><span>01 / COMPANY BRAIN</span><strong>Remember what the company learns.</strong><p>Permission-aware knowledge, decisions, playbooks and durable learning.</p></a>
        <a href="#company-twin"><span>02 / COMPANY TWIN</span><strong>Model the company now.</strong><p>Current objectives, economics, customers, operations, constraints and decisions.</p></a>
        <a href="#future-engine"><span>03 / FUTURE ENGINE</span><strong>Explore what could happen.</strong><p>Explicit assumptions and scenarios before action. Scenario is never fact or forecast.</p></a>
      </section>}

      {!analysis && !publicProfile && (
        <section className="fb-entry" id="company-analysis">
          <div className="fb-entry__copy">
            <p className="fb-eyebrow">4BRANDS / PUBLIC COMPANY INTELLIGENCE</p>
            <h1>Know the company.</h1>
            <p className="fb-intro">Search any Norwegian company. Resolve the exact legal entity, inspect what public registers actually know, see what changed, and trace every material field back to its source.</p>
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
              <button type="submit" disabled={loading || company.trim().length < 2} aria-label="Search">
                {loading ? <span className="fb-spinner" aria-hidden="true" /> : <span aria-hidden="true">→</span>}
              </button>
            </div>
            <div className="fb-search__foot">
              <span>BRREG VERIFIED</span><span>SOURCE STATES</span><span>FACTS FIRST</span><span>FREE PUBLIC PROFILE</span>
            </div>
          </form>

          {identityState === "SEARCHING" && <div className="fb-identity-state" role="status">Resolving Norwegian legal entities from Brønnøysundregistrene…</div>}
          {identityCandidates.length > 0 && (
            <section className="fb-identity-results" aria-label="Legal entity candidates">
              <div><p className="fb-eyebrow">LEGAL IDENTITY · BRREG</p><h2>Which legal entity do you mean?</h2><p>Name search is discovery only. Select the organisation number before economic analysis begins.</p></div>
              <div className="fb-identity-list">
                {identityCandidates.map((candidate) => (
                  <button type="button" key={candidate.organizationNumber} onClick={() => void confirmIdentity(candidate)}>
                    <span><strong>{candidate.entityName}</strong><small>{candidate.organizationNumber} · {candidate.organizationForm || "FORM UNKNOWN"}</small></span>
                    <b>USE THIS ENTITY</b>
                  </button>
                ))}
              </div>
              <p className="fb-identity-fallback">International legal-entity coverage is not yet available in this public profile. No unsupported company match is inferred.</p>
            </section>
          )}
          {identityState === "NO_MATCH" && <div className="fb-identity-state"><p>No Norwegian legal-entity match was found. That does not mean the company does not exist.</p><span>International legal-entity coverage is not yet available in this public profile.</span></div>}
          {identityResolution && !analysis && !publicProfile && publicProfileState === "LOADING" && <div className="fb-identity-state" role="status">Exact BRREG identity resolved. Building the public intelligence profile…</div>}

          {loading && <div className="fb-loading" role="status"><span /><p>Reading the company. Building the value map.</p></div>}
          {error && <div className="fb-error" role="status"><p>{error}</p><button type="button" onClick={() => { setCompany("TOMRA"); setError(null); }}>Use TOMRA proof</button></div>}

          <div className="fb-entry__note">
            <span>IDENTITY → FACTS → CHANGES → SOURCES → DEEPER INTELLIGENCE</span>
            <p>The public profile comes first. Private Company Brain and decision intelligence only enter after the outside-world evidence is useful on its own.</p>
          </div>
        </section>
      )}

      {publicProfile && !analysis && (
        <PublicCompanyProfile
          profile={publicProfile}
          gleif={identityResolution?.gleif ?? null}
          onReset={() => {
            setPublicProfile(null);
            setPublicProfileState("IDLE");
            setIdentityResolution(null);
            setIdentityCandidates([]);
            setIdentityState("IDLE");
            setError(null);
          }}
          onPrivate={() => {
            if (typeof window === "undefined") return;
            const returnTo = window.location.origin + "/4brands#company-brain";
            window.location.href = identityLoginUrl(returnTo);
          }}
        />
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
              <span>{analysis.company.organizationNumber ? `ORG ${analysis.company.organizationNumber}` : "Organisation number unresolved"}</span>
              <span>{analysis.company.lei ? `LEI ${analysis.company.lei}` : "LEI unresolved / not applicable"}</span>
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

          <CompanyClimateTracePanel analysis={analysis} />

          <ProcurementDemandPanel analysis={analysis} />

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
                <div className="fb-twin__status"><span>COMPANY BRAIN</span><span>SERVER PERSISTENCE WHEN SIGNED IN</span><span>LOCAL RECOVERY BEFORE SIGN-IN</span></div>
              </div>
              <p>Public evidence is only the outside view. Add a minimum internal baseline to turn the public Value Map into a working Company Operating Twin. Authenticated company state is persisted in the existing 4Planet_ OS under workspace membership and RLS; local browser state remains recovery-only.</p>
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
            <div className="fb-brain-layer" id="company-brain">
              <div><p className="fb-eyebrow">01 / COMPANY BRAIN</p><h3>The company that remembers.</h3></div>
              <p>Authenticated company knowledge persists across sessions and devices with workspace membership, provenance and audit. Public analysis can enter the Brain as source-derived context; internal input remains company-owned truth. Durable learning should be reviewed and written back instead of disappearing in email, meetings or chat.</p>
            </div>
            <CompanyBrainControls
              companyName={analysis.company.name}
              legalName={analysis.company.legalName}
              twin={twin}
              ledger={ledger}
              analysis={analysis}
              onSnapshot={applyCompanyBrainSnapshot}
              onLocalRecovery={saveTwin}
            />

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

            <section className="fb-future" id="future-engine" aria-label="4BRANDS Future Engine">
              <div className="fb-future__head">
                <div><p className="fb-eyebrow">03 / FUTURE ENGINE / BETA</p><h3>Explore the decision before acting.</h3></div>
                <p>Change explicit assumptions and inspect a deterministic scenario against the company baseline. This first engine is arithmetic, not an AI forecast. Future models can add causal drivers, distributions and learned company-specific parameters only when evidence supports them.</p>
              </div>
              <div className="fb-future-grid">
                <div className="fb-scenario-control">
                  <label htmlFor="scenario-revenue">Revenue change assumption (%)</label>
                  <input id="scenario-revenue" inputMode="decimal" value={scenario.revenueDelta} onChange={(e) => setScenario({ ...scenario, revenueDelta: e.target.value })} />
                </div>
                <div className="fb-scenario-control">
                  <label htmlFor="scenario-margin">Margin change assumption (pp)</label>
                  <input id="scenario-margin" inputMode="decimal" value={scenario.marginDelta} onChange={(e) => setScenario({ ...scenario, marginDelta: e.target.value })} />
                </div>
                <div className="fb-scenario-control">
                  <label htmlFor="scenario-horizon">Scenario horizon</label>
                  <select id="scenario-horizon" value={scenario.horizon} onChange={(e) => setScenario({ ...scenario, horizon: e.target.value })}>
                    <option>3 months</option><option>12 months</option><option>24 months</option><option>36 months</option>
                  </select>
                </div>
                <div className="fb-scenario-result">
                  <span>Scenario revenue · {scenario.horizon}</span>
                  <strong>{scenarioRevenue === null ? "ADD NUMERIC BASELINE" : scenarioRevenue.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</strong>
                  <p>Baseline revenue × explicit revenue-change assumption. Currency follows the company baseline; no currency is inferred.</p>
                </div>
                <div className="fb-scenario-result">
                  <span>Scenario margin</span>
                  <strong>{scenarioMargin === null ? "ADD NUMERIC MARGIN" : `${scenarioMargin.toFixed(1)}%`}</strong>
                  <p>Current gross/contribution margin + explicit percentage-point assumption.</p>
                </div>
                <div className="fb-scenario-result">
                  <span>Illustrative gross-profit delta</span>
                  <strong>{baselineGrossProfit === null || scenarioGrossProfit === null ? "INSUFFICIENT BASELINE" : (scenarioGrossProfit - baselineGrossProfit).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</strong>
                  <p>Only computed when both revenue and margin baselines are numeric. This is a scenario calculation, not realised value.</p>
                </div>
              </div>
              <p className="fb-future-law">FACT ≠ ASSUMPTION ≠ SCENARIO ≠ FORECAST ≠ OBSERVED RESULT ≠ ATTRIBUTED VALUE. Every future model must preserve this boundary.</p>
            </section>

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
            <p>{new Date(analysis.generatedAt).toLocaleDateString()} · Decision intelligence, not assurance. Authenticated Company Brain state is private workspace data; local browser state is recovery-only.</p>
          </footer>
        </div>
      )}
    </main>
  );
}
