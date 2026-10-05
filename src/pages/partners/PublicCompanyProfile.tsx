import { useMemo, useState } from "react";
import "@/styles/fourbrand-intelligence.css";

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
  locations: Array<{
    organizationNumber: string; name: string; employees: number | null; industryCode: string | null; industry: string | null;
    address: Address | null; startDate: string | null; endDate: string | null; sourceUrl: string | null;
  }>;
  changes: Array<{ type: string; date: string | null; title: string; detail: string; truthClass: "FACT"; sourceId: string }>;
  accounts: { availableYears: string[]; latestAvailableYear: string | null; copies: Array<{ year: string; url: string; format: string }> };
  coverage: {
    verifiedIdentity: boolean; sourceCount: number; totalSourceLanes: number; roleCount: number;
    groupRelationCount: number; locationCount: number; changeCount: number; accountYearCount: number;
  };
  sources: PublicCompanySource[];
  unknowns: string[];
  truthBoundary: string;
};

type Tab = "OVERVIEW" | "FINANCIALS" | "STRUCTURE" | "PEOPLE" | "CHANGES" | "SOURCES";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "OVERVIEW", label: "Overview" },
  { id: "FINANCIALS", label: "Financials" },
  { id: "STRUCTURE", label: "Structure" },
  { id: "PEOPLE", label: "People" },
  { id: "CHANGES", label: "Changes" },
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
  profile, onReset, onDeepAnalysis, onPrivate,
}: {
  profile: PublicCompanyProfileData;
  onReset: () => void;
  onDeepAnalysis: () => void;
  onPrivate: () => void;
}) {
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const readySources = useMemo(() => profile.sources.filter((source) => source.state === "READY"), [profile.sources]);
  const primaryIndustry = profile.company.industries[0];
  const topRoles = profile.roles.slice().sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
  const recentChanges = profile.changes.slice(0, 8);

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
          <Fact label="SOURCES LIVE" value={String(readySources.length) + "/" + String(profile.coverage.totalSourceLanes)} meta={"Fetched " + dateLabel(profile.generatedAt)} />
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
                <div className="fbi-lane"><span>PUBLIC PROCUREMENT</span><strong>TED adapter exists</strong><p>Demand signals can be queried from published notices. Doffin national-only coverage remains open.</p></div>
                <div className="fbi-lane"><span>MARKET + PEERS</span><strong>Not yet verified in this profile</strong><p>Peer sets must be source-grounded rather than invented from a company description.</p></div>
                <div className="fbi-lane"><span>INNOVATION + CAPITAL</span><strong>Source integration open</strong><p>Patent, EU-project and funding sources are not silently presented as connected until physically verified.</p></div>
                <div className="fbi-lane"><span>PLANET</span><strong>Identity join requires review</strong><p>Environmental source records must resolve to this legal company before any company-level claim is shown.</p></div>
              </div>
            </div>

            <Unknowns items={profile.unknowns} />
          </>
        )}

        {tab === "FINANCIALS" && (
          <>
            <div className="fbi-section-head">
              <div><span>02 / FINANCIAL DOCUMENTS</span><h2>Source first. Numbers only when extracted and verified.</h2></div>
              <p>Regnskapsregisteret exposes annual-account copies. 4BRANDS does not turn document availability into invented financial metrics.</p>
            </div>
            <div className="fbi-financial-summary">
              <Fact label="LATEST AVAILABLE" value={profile.accounts.latestAvailableYear || profile.company.lastSubmittedAccounts || "UNKNOWN"} />
              <Fact label="AVAILABLE YEARS" value={String(profile.accounts.availableYears.length)} />
              <Fact label="FINANCIAL VALUES" value="EXTRACTION OPEN" meta="No metric shown without source-level extraction" />
            </div>
            <div className="fbi-document-list">
              {profile.accounts.copies.length ? profile.accounts.copies.map((copy) => (
                <a key={copy.year} href={copy.url} target="_blank" rel="noreferrer">
                  <span>{copy.year}</span><strong>Annual accounts</strong><small>{copy.format} · REGNSKAPSREGISTERET ↗</small>
                </a>
              )) : <p className="fbi-empty">No annual-account copies were parsed from the availability endpoint.</p>}
            </div>
          </>
        )}

        {tab === "STRUCTURE" && (
          <>
            <div className="fbi-section-head">
              <div><span>03 / STRUCTURE</span><h2>Group and operating footprint.</h2></div>
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
              <div><span>04 / PEOPLE + ROLES</span><h2>Who is formally connected to this entity?</h2></div>
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
              <div><span>05 / WHAT CHANGED</span><h2>Changed reality is return value.</h2></div>
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

        {tab === "SOURCES" && (
          <>
            <div className="fbi-section-head">
              <div><span>06 / SOURCES</span><h2>The evidence is part of the product.</h2></div>
              <p>Source state is visible. A failed or empty source lane is not converted into a claim about the company.</p>
            </div>
            <div className="fbi-source-list">
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
