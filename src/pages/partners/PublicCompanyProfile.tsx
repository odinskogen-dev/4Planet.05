import { useMemo, useState } from "react";
import "@/styles/fourbrand-intelligence.css";
import { PublicBusinessSources, PublicPlanetIntelligence, PublicProcurementIntelligence } from "@/pages/partners/PublicCompanyExternalSignals";

export type PublicCompanySource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  retrievedAt: string;
  state: "READY" | "NO_MATCH" | "SOURCE_UNAVAILABLE" | "SOURCE_HTTP_ERROR" | "NOT_APPLICABLE";
  note: string;
};

type Address = {
  lines: string[];
  postnummer: string | null;
  poststed: string | null;
  kommune: string | null;
  land: string | null;
  landkode: string | null;
};

export type PublicCompanyProfileData = {
  generatedAt: string;
  company: {
    organizationNumber: string;
    name: string;
    organizationForm: { code: string | null; description: string | null };
    registeredDate: string | null;
    foundationDate: string | null;
    website: string | null;
    employees: number | null;
    industries: Array<{ code: string; description: string }>;
    institutionalSector: { code: string | null; description: string | null } | null;
    businessAddress: Address | null;
    postalAddress: Address | null;
    lastSubmittedAccounts: string | null;
    registeredForVat: boolean;
    registeredInBusinessRegister: boolean;
    registeredInFoundationRegister: boolean;
    language: string | null;
    historicalNames: Array<{ name: string; from: string | null; to: string | null }>;
    status: string;
  };
  roles: Array<{
    groupCode: string; groupLabel: string; roleCode: string; roleLabel: string; name: string;
    subjectType: "PERSON" | "ENTITY"; entityOrganizationNumber: string | null; sequence: number | null; lastChanged: string | null;
  }>;
  group: Array<{
    level: number; name: string; organizationNumber: string; parentName: string | null; parentOrganizationNumber: string | null;
    relationshipCode: string | null; relationship: string | null; basis: string | null; date: string | null; organizationForm: string | null;
  }>;
  industryCohort: Array<{
    organizationNumber: string; name: string; employees: number | null; organizationForm: string | null;
    latestAccounts: string | null; industryCode: string | null; industry: string | null;
  }>;
  locations: Array<{
    organizationNumber: string; name: string; employees: number | null; industryCode: string | null; industry: string | null;
    address: Address | null; startDate: string | null; endDate: string | null; sourceUrl: string | null;
  }>;
  changes: Array<{ type: string; date: string | null; title: string; detail: string; truthClass: "FACT"; sourceId: string }>;
  financials: {
    periodStart: string | null; periodEnd: string | null; currency: string;
    revenue: number | null; operatingResult: number | null; annualResult: number | null; resultBeforeTax: number | null;
    assets: number | null; equity: number | null; debt: number | null; operatingMargin: number | null; equityRatio: number | null;
    truthClass: "FACT";
  } | null;
  accounts: { availableYears: string[]; latestAvailableYear: string | null; copies: Array<{ year: string; url: string; format: string }> };
  coverage: {
    verifiedIdentity: boolean; sourceCount: number; totalSourceLanes: number; roleCount: number;
    groupRelationCount: number; locationCount: number; changeCount: number; accountYearCount: number; financialFactsAvailable: boolean; industryCohortCount: number;
  };
  sources: PublicCompanySource[];
  unknowns: string[];
  truthBoundary: string;
};

type Tab = "OVERVIEW" | "BUSINESS" | "FINANCIALS" | "MARKET" | "PROCUREMENT" | "PLANET" | "STRUCTURE" | "PEOPLE" | "CHANGES" | "FINDINGS" | "SOURCES";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "BUSINESS", label: "Business" },
  { id: "FINANCIALS", label: "Financials" },
  { id: "MARKET", label: "Market" },
  { id: "PROCUREMENT", label: "Procurement" },
  { id: "PLANET", label: "Planet" },
  { id: "STRUCTURE", label: "Structure" },
  { id: "PEOPLE", label: "People" },
  { id: "CHANGES", label: "Changes" },
  { id: "FINDINGS", label: "Findings" },
  { id: "SOURCES", label: "Sources" },
];

function addressLine(address: Address | null) {
  if (!address) return "UNKNOWN";
  return [
    ...address.lines,
    [address.postnummer, address.poststed].filter(Boolean).join(" "),
    address.kommune,
    address.land || address.landkode,
  ].filter(Boolean).join(", ");
}

function dateLabel(value: string | null) {
  if (!value) return "UNKNOWN";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function moneyLabel(value: number | null, currency = "NOK") {
  if (value === null) return "UNKNOWN";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function percentLabel(value: number | null) {
  return value === null ? "UNKNOWN" : new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function SourceState({ source }: { source: PublicCompanySource }) {
  return <span className={"fbi-source-state fbi-source-state--" + source.state.toLowerCase()}>{source.state.replaceAll("_", " ")}</span>;
}

function Fact({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="fbi-fact">
      <span>{label}</span>
      <strong>{value || "UNKNOWN"}</strong>
      {meta && <small>{meta}</small>}
    </div>
  );
}

function Unknowns({ items }: { items: string[] }) {
  return (
    <div className="fbi-unknowns">
      <div className="fbi-section-kicker">WHAT WE DON'T KNOW</div>
      <div>{items.map((item) => <p key={item}>{item}</p>)}</div>
    </div>
  );
}

export default function PublicCompanyProfile({
  profile, gleif, onReset, onDeepAnalysis, onPrivate,
}: {
  profile: PublicCompanyProfileData;
  gleif?: { state: string; verified: { lei: string; legalName: string; registeredAs: string | null; sourceUrl: string } | null } | null;
  onReset: () => void;
  onDeepAnalysis: () => void;
  onPrivate: () => void;
}) {
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const readySources = useMemo(() => profile.sources.filter((source) => source.state === "READY"), [profile.sources]);
  const verifiedLei = gleif?.verified ?? null;
  const readySourceCount = readySources.length + (verifiedLei ? 1 : 0);
  const totalSourceLaneCount = profile.coverage.totalSourceLanes + 1;
  const primaryIndustry = profile.company.industries[0];
  const topRoles = profile.roles.slice().sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  const recentChanges = profile.changes.slice(0, 8);
  const investigationSignals = useMemo(() => {
    const finance = profile.financials;
    if (!finance) return [];
    const signals: Array<{ title: string; detail: string; basis: string }> = [];
    if (finance.operatingResult !== null && finance.operatingResult < 0) signals.push({
      title: "Negative operating result",
      detail: "The latest open BRREG key figures show an operating loss.",
      basis: "FACT + sign test",
    });
    if (finance.annualResult !== null && finance.annualResult < 0) signals.push({
      title: "Negative annual result",
      detail: "The latest open BRREG key figures show a negative annual result.",
      basis: "FACT + sign test",
    });
    if (finance.equity !== null && finance.equity < 0) signals.push({
      title: "Negative equity",
      detail: "The latest open BRREG key figures show negative equity.",
      basis: "FACT + sign test",
    });
    if (finance.assets !== null && finance.debt !== null && finance.debt > finance.assets) signals.push({
      title: "Debt exceeds reported assets",
      detail: "Reported total debt is larger than reported total assets in the latest open key figures.",
      basis: "CALCULATION",
    });
    return signals;
  }, [profile.financials]);

  return (
    <section className="fbi" aria-label="4BRANDS public company intelligence">
      <header className="fbi-masthead">
        <div className="fbi-masthead__bar">
          <button type="button" className="fbi-text-button" onClick={onReset}>← New company</button>
          <div>4BRANDS / PUBLIC COMPANY INTELLIGENCE</div>
          <div className="fbi-proof-state"><i /> VERIFIED LEGAL IDENTITY</div>
        </div>

        <div className="fbi-title-grid">
          <div>
            <p className="fbi-kicker">WHAT DOES THE PUBLIC WORLD KNOW?</p>
            <h1>{profile.company.name}</h1>
            <p className="fbi-company-line">
              ORG {profile.company.organizationNumber}
              {profile.company.organizationForm.code ? " · " + profile.company.organizationForm.code : ""}
              {primaryIndustry?.description ? " · " + primaryIndustry.description : ""}
            </p>
          </div>
          <div className="fbi-title-aside">
            <p>Public register intelligence first. Every material field below is either source-grounded or explicitly unknown.</p>
            <div className="fbi-actions">
              <button type="button" onClick={onPrivate}>This is my company</button>
              <button type="button" className="fbi-actions__secondary" onClick={onDeepAnalysis}>Research deeper</button>
            </div>
          </div>
        </div>

        <div className="fbi-signal-strip" aria-label="Public intelligence coverage">
          <Fact label="IDENTITY" value={profile.company.status} meta={profile.company.organizationForm.description || "Legal form"} />
          <Fact label="EMPLOYEES" value={profile.company.employees === null ? "UNKNOWN" : profile.company.employees.toLocaleString("en-GB")} meta="BRREG registered count" />
          <Fact label="LAST ACCOUNTS" value={profile.accounts.latestAvailableYear || profile.company.lastSubmittedAccounts || "UNKNOWN"} meta={String(profile.coverage.accountYearCount) + " public copies indexed"} />
          <Fact label="PUBLIC ROLES" value={String(profile.coverage.roleCount)} meta="This entity only" />
          <Fact label="GROUP LINKS" value={String(profile.coverage.groupRelationCount)} meta="BRREG child relations" />
          <Fact label="SOURCES LIVE" value={String(readySourceCount) + "/" + String(totalSourceLaneCount)} meta={"Fetched " + dateLabel(profile.generatedAt)} />
        </div>
      </header>

      <nav className="fbi-tabs" aria-label="Company intelligence sections">
        {TABS.map((item) => (
          <button type="button" key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)}>
            {item.label}
            {item.id === "CHANGES" && profile.coverage.changeCount > 0 ? <span>{profile.coverage.changeCount}</span> : null}
          </button>
        ))}
      </nav>

      <div className="fbi-panel">
        {tab === "OVERVIEW" && (
          <>
            <div className="fbi-section-head">
              <div><span>01 / WHAT WE KNOW</span><h2>Registered reality, without the sales layer.</h2></div>
              <p>Company identity, formal structure and source coverage are resolved before interpretation. Missing evidence stays missing.</p>
            </div>

            <div className="fbi-overview-grid">
              <Fact label="LEGAL NAME" value={profile.company.name} meta={"Organisation number " + profile.company.organizationNumber} />
              <Fact label="INDUSTRY" value={primaryIndustry ? primaryIndustry.code + " " + primaryIndustry.description : "UNKNOWN"} meta={profile.company.industries.length > 1 ? String(profile.company.industries.length) + " industry codes" : "Primary registered industry"} />
              <Fact label="FOUNDED" value={profile.company.foundationDate || "UNKNOWN"} meta={"Registered " + (profile.company.registeredDate || "UNKNOWN")} />
              <Fact label="REGISTERED ADDRESS" value={addressLine(profile.company.businessAddress)} />
              <Fact label="WEBSITE" value={profile.company.website || "UNKNOWN"} meta={profile.company.website ? "Registered by BRREG" : "No registered website"} />
              <Fact label="LEI / GLOBAL ID" value={verifiedLei?.lei || "UNKNOWN"} meta={verifiedLei ? "GLEIF exact registration-number match" : "No exact verified LEI in current identity resolution"} />
              <Fact label="VAT / BUSINESS REGISTER" value={(profile.company.registeredForVat ? "VAT" : "NO VAT FLAG") + " · " + (profile.company.registeredInBusinessRegister ? "FORETAKSREGISTERET" : "NO BUSINESS-REGISTER FLAG")} />
            </div>

            <div className="fbi-two-column">
              <div className="fbi-changes-preview">
                <div className="fbi-section-kicker">WHAT CHANGED</div>
                {recentChanges.length ? recentChanges.map((change) => (
                  <article key={change.type + "-" + String(change.date) + "-" + change.title}>
                    <time>{dateLabel(change.date)}</time>
                    <div><strong>{change.title}</strong><p>{change.detail}</p></div>
                    <span>FACT</span>
                  </article>
                )) : <p className="fbi-empty">No bounded register changes were resolved. This is not evidence that nothing changed.</p>}
                <button type="button" className="fbi-inline-link" onClick={() => setTab("CHANGES")}>Open change record →</button>
              </div>

              <div className="fbi-intelligence-next">
                <div className="fbi-section-kicker">NEXT INTELLIGENCE LAYERS</div>
                <button type="button" className="fbi-lane fbi-lane--button" onClick={() => setTab("PROCUREMENT")}><span>PUBLIC PROCUREMENT</span><strong>TED source connected</strong><p>Inspect published demand signals without using the AI research engine.</p></button>
                <button type="button" className="fbi-lane fbi-lane--button" onClick={() => setTab("MARKET")}><span>MARKET + PEERS</span><strong>BRREG cohort connected</strong><p>Use source-grounded industry orientation before asserting direct competition.</p></button>
                <div className="fbi-lane"><span>INNOVATION + CAPITAL</span><strong>Credentialled sources remain open</strong><p>CORDIS DET requires an API key and EPO OPS requires developer credentials; neither is presented as connected before that exists.</p></div>
                <button type="button" className="fbi-lane fbi-lane--button" onClick={() => setTab("PLANET")}><span>PLANET</span><strong>Climate TRACE discovery connected</strong><p>Review the external owner identity before any facility record is shown.</p></button>
              </div>
            </div>

            <div className="fbi-rule-signals">
              <div className="fbi-section-kicker">WHAT LOOKS UNUSUAL</div>
              {investigationSignals.length ? investigationSignals.map((signal) => (
                <article key={signal.title}>
                  <div><strong>{signal.title}</strong><p>{signal.detail}</p></div>
                  <span>{signal.basis}</span>
                </article>
              )) : <p className="fbi-empty">No bounded negative balance/result rule fired in the connected latest key figures. This is not an all-clear; source coverage remains incomplete.</p>}
            </div>

            <Unknowns items={profile.unknowns} />
          </>
        )}

        {tab === "BUSINESS" && (
          <PublicBusinessSources organizationNumber={profile.company.organizationNumber} companyName={profile.company.name} />
        )}

        {tab === "FINANCIALS" && (
          <>
            <div className="fbi-section-head">
              <div><span>03 / FINANCIALS</span><h2>Latest verified accounts, with the boundary visible.</h2></div>
              <p>The open BRREG key-figure source covers the latest submitted annual accounts for ordinary accounting plans. It excludes some entity types and does not provide open structured history.</p>
            </div>
            {profile.financials ? (
              <>
                <div className="fbi-financial-summary">
                  <Fact label="REVENUE" value={moneyLabel(profile.financials.revenue, profile.financials.currency)} meta={"Period end " + (profile.financials.periodEnd || "UNKNOWN")} />
                  <Fact label="OPERATING RESULT" value={moneyLabel(profile.financials.operatingResult, profile.financials.currency)} meta={"Operating margin " + percentLabel(profile.financials.operatingMargin)} />
                  <Fact label="ANNUAL RESULT" value={moneyLabel(profile.financials.annualResult, profile.financials.currency)} meta="BRREG latest submitted accounts" />
                  <Fact label="ASSETS" value={moneyLabel(profile.financials.assets, profile.financials.currency)} />
                  <Fact label="EQUITY" value={moneyLabel(profile.financials.equity, profile.financials.currency)} meta={"Equity ratio " + percentLabel(profile.financials.equityRatio)} />
                  <Fact label="DEBT" value={moneyLabel(profile.financials.debt, profile.financials.currency)} />
                </div>
                <div className="fbi-truth-boundary"><span>FINANCIAL TRUTH</span><p>These are source facts from the latest open BRREG key-figure record. Operating margin and equity ratio are transparent calculations from those facts, not forecasts or recommendations.</p></div>
              </>
            ) : (
              <p className="fbi-empty">Structured key figures are unavailable for this entity. 4BRANDS will not substitute guessed numbers. Banks and insurers are among the entity types explicitly excluded by the open source.</p>
            )}
            <div className="fbi-document-list">
              {profile.accounts.copies.length ? profile.accounts.copies.map((copy) => (
                <a key={copy.year} href={copy.url} target="_blank" rel="noreferrer">
                  <span>{copy.year}</span><strong>Annual accounts</strong><small>{copy.format} · REGNSKAPSREGISTERET ↗</small>
                </a>
              )) : <p className="fbi-empty">No annual-account copies were parsed from the availability endpoint.</p>}
            </div>
          </>
        )}

        {tab === "MARKET" && (
          <>
            <div className="fbi-section-head">
              <div><span>04 / MARKET ORIENTATION</span><h2>Who sits in the same registered industry?</h2></div>
              <p>This is a source-grounded BRREG industry cohort, not an AI competitor list. Shared industry code is evidence of classification similarity, not proof of direct competition.</p>
            </div>
            <div className="fbi-table-block">
              <div className="fbi-section-kicker">INDUSTRY COHORT · {profile.industryCohort.length}</div>
              {profile.industryCohort.length ? profile.industryCohort.map((item, index) => (
                <div className="fbi-row" key={item.organizationNumber}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{item.name}</strong><small>{item.organizationNumber} · {item.organizationForm || "FORM UNKNOWN"}</small></div>
                  <div><strong>{item.employees === null ? "EMPLOYEES UNKNOWN" : item.employees.toLocaleString("en-GB") + " registered employees"}</strong><small>{item.industryCode || "NO CODE"} · latest accounts {item.latestAccounts || "UNKNOWN"}</small></div>
                </div>
              )) : <p className="fbi-empty">No source-grounded cohort was returned for this primary industry code.</p>}
            </div>
            <div className="fbi-truth-boundary"><span>PEER BOUNDARY</span><p>These entities are candidates for orientation only. A true comparable or competitor set requires product, geography, customer and economic-model evidence before comparison.</p></div>
          </>
        )}

        {tab === "PROCUREMENT" && (
          <PublicProcurementIntelligence companyName={profile.company.name} />
        )}

        {tab === "PLANET" && (
          <PublicPlanetIntelligence companyName={profile.company.name} />
        )}

        {tab === "STRUCTURE" && (
          <>
            <div className="fbi-section-head">
              <div><span>07 / STRUCTURE</span><h2>Group and operating footprint.</h2></div>
              <p>BRREG corporate-group links and registered sub-entities are shown as register relationships, not beneficial-ownership conclusions.</p>
            </div>
            <div className="fbi-table-block">
              <div className="fbi-section-kicker">CORPORATE GROUP · {profile.group.length}</div>
              {profile.group.length ? profile.group.map((item) => (
                <div className="fbi-row" key={item.organizationNumber + "-" + String(item.level)}>
                  <span>{String(item.level).padStart(2, "0")}</span>
                  <div><strong>{item.name}</strong><small>{item.organizationNumber} · {item.organizationForm || "FORM UNKNOWN"}</small></div>
                  <div><strong>{item.relationship || item.relationshipCode || "GROUP RELATION"}</strong><small>{item.basis || "Basis not supplied"}{item.date ? " · " + item.date : ""}</small></div>
                </div>
              )) : <p className="fbi-empty">No child corporate-group relations returned.</p>}
            </div>
            <div className="fbi-table-block">
              <div className="fbi-section-kicker">REGISTERED SUB-ENTITIES / LOCATIONS · {profile.locations.length}</div>
              {profile.locations.length ? profile.locations.map((item) => (
                <div className="fbi-row" key={item.organizationNumber}>
                  <span>LOC</span>
                  <div><strong>{item.name}</strong><small>{item.organizationNumber}</small></div>
                  <div><strong>{item.address ? addressLine(item.address) : "ADDRESS UNKNOWN"}</strong><small>{item.industry ? (item.industryCode || "") + " " + item.industry : "Industry unknown"}{item.employees !== null ? " · " + String(item.employees) + " employees" : ""}</small></div>
                </div>
              )) : <p className="fbi-empty">No registered sub-entities returned in this bounded lookup.</p>}
            </div>
          </>
        )}

        {tab === "PEOPLE" && (
          <>
            <div className="fbi-section-head">
              <div><span>08 / PEOPLE + ROLES</span><h2>Who is formally connected to this entity?</h2></div>
              <p>Only public roles attached to this legal entity are displayed. 4BRANDS does not build a cross-organisation dossier on individuals.</p>
            </div>
            <div className="fbi-role-list">
              {topRoles.length ? topRoles.map((role, index) => (
                <div className="fbi-row" key={role.roleCode + "-" + role.name + "-" + String(index)}>
                  <span>{role.roleCode}</span>
                  <div><strong>{role.name}</strong><small>{role.subjectType}{role.entityOrganizationNumber ? " · " + role.entityOrganizationNumber : ""}</small></div>
                  <div><strong>{role.roleLabel}</strong><small>{role.groupLabel}{role.lastChanged ? " · changed " + role.lastChanged : ""}</small></div>
                </div>
              )) : <p className="fbi-empty">No public roles returned in this bounded lookup.</p>}
            </div>
          </>
        )}

        {tab === "CHANGES" && (
          <>
            <div className="fbi-section-head">
              <div><span>09 / WHAT CHANGED</span><h2>Changed reality is return value.</h2></div>
              <p>This first change layer uses BRREG historical names and published entity-update events. More sources can join the same chronology later.</p>
            </div>
            <div className="fbi-change-ledger">
              {profile.changes.length ? profile.changes.map((change, index) => (
                <div className="fbi-row" key={change.type + "-" + String(change.date) + "-" + String(index)}>
                  <span>{dateLabel(change.date)}</span>
                  <div><strong>{change.title}</strong><small>{change.type.replaceAll("_", " ")}</small></div>
                  <div><strong>{change.detail}</strong><small>FACT · {change.sourceId}</small></div>
                </div>
              )) : <p className="fbi-empty">No bounded change records resolved from currently connected public sources.</p>}
            </div>
          </>
        )}

        {tab === "FINDINGS" && (
          <>
            <div className="fbi-section-head">
              <div><span>10 / FINDINGS</span><h2>Signals worth investigating, not manufactured certainty.</h2></div>
              <p>4BRANDS separates deterministic calculations and source-backed change signals from hypotheses. Public evidence can point to a question without proving its cause.</p>
            </div>
            <div className="fbi-findings-list">
              {recentChanges.slice(0, 4).map((change) => (
                <article key={"finding-change-" + change.type + "-" + String(change.date)}>
                  <span>CHANGE · FACT</span><strong>{change.title}</strong><p>{change.detail}</p>
                </article>
              ))}
              {investigationSignals.map((signal) => (
                <article key={"finding-signal-" + signal.title}>
                  <span>{signal.basis}</span><strong>{signal.title}</strong><p>{signal.detail}</p>
                </article>
              ))}
              {!recentChanges.length && !investigationSignals.length ? <p className="fbi-empty">No bounded public-data signal currently clears the evidence threshold. That is an honest result, not an invitation to invent one.</p> : null}
            </div>
            <Unknowns items={profile.unknowns} />
          </>
        )}

        {tab === "SOURCES" && (
          <>
            <div className="fbi-section-head">
              <div><span>11 / SOURCES</span><h2>The evidence is part of the product.</h2></div>
              <p>Source state is visible. A failed or empty source lane is not converted into a claim about the company.</p>
            </div>
            <div className="fbi-source-list">
              {verifiedLei && (
                <a href={verifiedLei.sourceUrl} target="_blank" rel="noreferrer">
                  <div><span>GLEIF-LEI</span><span className="fbi-source-state fbi-source-state--ready">READY</span></div>
                  <strong>Verified Legal Entity Identifier</strong><p>Global Legal Entity Identifier Foundation</p>
                  <small>Accepted only when GLEIF registeredAs exactly matches the canonical BRREG organisation number.</small>
                </a>
              )}
              {profile.sources.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                  <div><span>{source.id}</span><SourceState source={source} /></div>
                  <strong>{source.title}</strong><p>{source.publisher}</p><small>{source.note}</small>
                </a>
              ))}
            </div>
            <div className="fbi-truth-boundary"><span>TRUTH BOUNDARY</span><p>{profile.truthBoundary}</p></div>
          </>
        )}
      </div>
    </section>
  );
}
