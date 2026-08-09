import { type FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { ACTORS, type ActorProfile } from "@/data/actors";
import {
  KNOWLEDGE_ACTOR_TYPES,
  KNOWLEDGE_API_STATES,
  KNOWLEDGE_DOMAINS,
  KNOWLEDGE_FRESHNESS_STATES,
  KNOWLEDGE_INSTITUTIONS,
  KNOWLEDGE_LICENCE_STATES,
  knowledgeInstitutionBySlug,
  type KnowledgeInstitutionProfile,
} from "@/data/knowledgeInstitutions";
import {
  submitActorReviewRequest,
  type ActorReviewReceipt,
  type ActorReviewRequest,
  type ActorReviewRequestType,
} from "@/data/actorReview";
import { ActorProfilePage } from "@/pages/integrated/Actors";
import { T } from "@/styles/tokens";
import { usePageMetadata } from "@/utils/metadata";
import "@/styles/actors.css";
import "@/styles/p17-knowledge.css";

const INDEPENDENT_NOTE =
  "Independently researched by 4PLANET from public sources. This is not an official organisation page, verification or partnership.";

const normalise = (value: string) => value.toLowerCase().replaceAll("_", " ");
const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const existingKnowledgeSlugs = new Set(KNOWLEDGE_INSTITUTIONS.map((profile) => profile.slug));

type DirectoryRecord = {
  slug: string;
  name: string;
  alternateName?: string;
  type: string;
  typeLabel: string;
  tagline: string;
  introduction: string;
  geography: string;
  missions: string[];
  methods: string[];
  ecosystems: string[];
  issues: string[];
  solutions: string[];
  knowledgeDomain?: string;
  apiState?: string;
  licenceState?: string;
  freshnessState?: string;
  sourceState: "SOURCE_MAPPED" | "OFFICIAL_SOURCE_RESEARCH";
  reviewed: string;
  theme: string[];
  knowledge: boolean;
};

const coreDirectory: DirectoryRecord[] = ACTORS.map((actor) => ({
  slug: actor.slug,
  name: actor.name,
  alternateName: actor.alternateName,
  type: actor.actorType,
  typeLabel: actor.actorTypeLabel,
  tagline: actor.tagline,
  introduction: actor.introduction,
  geography: actor.primaryGeography,
  missions: actor.missionIds,
  methods: actor.methods,
  ecosystems: actor.ecosystems,
  issues: actor.issues,
  solutions: actor.solutions,
  sourceState: "SOURCE_MAPPED",
  reviewed: actor.lastReviewed,
  theme: actor.collections,
  knowledge: existingKnowledgeSlugs.has(actor.slug),
}));

const knowledgeDirectory: DirectoryRecord[] = KNOWLEDGE_INSTITUTIONS.filter(
  (profile) => !ACTORS.some((actor) => actor.slug === profile.slug),
).map((profile) => ({
  slug: profile.slug,
  name: profile.name,
  alternateName: profile.alternateName,
  type: profile.actorType,
  typeLabel: profile.actorTypeLabel,
  tagline: profile.headline,
  introduction: profile.whatMakesPossible,
  geography: profile.coverage,
  missions: profile.missions,
  methods: profile.methods,
  ecosystems: [],
  issues: [],
  solutions: [],
  knowledgeDomain: profile.knowledgeDomain,
  apiState: profile.apiState,
  licenceState: profile.licenceState,
  freshnessState: profile.freshnessState,
  sourceState: "OFFICIAL_SOURCE_RESEARCH",
  reviewed: profile.lastReviewed,
  theme: ["PLANETARY_DATA_AND_RESEARCH"],
  knowledge: true,
}));

const DIRECTORY = [...coreDirectory, ...knowledgeDirectory];

const KNOWLEDGE_COLLECTIONS = [
  {
    id: "ALL_KNOWLEDGE",
    title: "Planetary data and research",
    description: "Institutions, networks and infrastructures that help make the living planet observable, comparable and understandable.",
    matches: (profile: KnowledgeInstitutionProfile) => Boolean(profile),
  },
  {
    id: "BIODIVERSITY",
    title: "Biodiversity knowledge",
    description: "Occurrence infrastructure, conservation assessments, biodiversity synthesis and public species knowledge.",
    matches: (profile: KnowledgeInstitutionProfile) => ["BIODIVERSITY_ECOLOGY"].includes(profile.knowledgeDomain),
  },
  {
    id: "OCEAN",
    title: "Ocean observing and marine data",
    description: "Marine biodiversity, ocean records and taxonomic infrastructure with explicit source and coverage boundaries.",
    matches: (profile: KnowledgeInstitutionProfile) => profile.knowledgeDomain.includes("OCEAN") || profile.missions.includes("RE:WILD MARINE"),
  },
  {
    id: "EARTH_OBSERVATION",
    title: "Earth observation and remote sensing",
    description: "Satellite and monitoring infrastructures where processed products remain distinct from direct field observations.",
    matches: (profile: KnowledgeInstitutionProfile) => profile.knowledgeDomain.includes("EARTH_OBSERVATION"),
  },
  {
    id: "TAXONOMY",
    title: "Species and taxonomy authorities",
    description: "Versioned taxonomic systems that help reconcile names and identifiers without being mistaken for occurrence or conservation-status data.",
    matches: (profile: KnowledgeInstitutionProfile) => profile.actorType === "TAXONOMIC_AUTHORITY",
  },
  {
    id: "PUBLIC_DATA",
    title: "Public data infrastructures",
    description: "Public and intergovernmental systems that steward environmental information and long-term records.",
    matches: (profile: KnowledgeInstitutionProfile) => ["PUBLIC_DATA_AGENCY", "DATA_INFRASTRUCTURE", "INTERGOVERNMENTAL_KNOWLEDGE_BODY"].includes(profile.actorType),
  },
] as const;

function queryString(values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => value && params.set(key, value));
  return params.toString() ? `?${params.toString()}` : "";
}

function DirectoryCard({ record }: { record: DirectoryRecord }) {
  return (
    <article className="actor-card knowledge-directory-card">
      <div className="actor-card-topline">
        <span className="knowledge-mono knowledge-blue">{record.typeLabel}</span>
        <span className="knowledge-mono">Reviewed {record.reviewed}</span>
      </div>
      <h3>{record.name}</h3>
      <p className="actor-card-tagline">{record.tagline}</p>
      <p className="actor-card-intro">{record.introduction}</p>
      <dl className="actor-card-facts">
        <div><dt>Scope</dt><dd>{record.geography}</dd></div>
        <div><dt>Connected missions</dt><dd>{record.missions.join(" · ") || "Context dependent"}</dd></div>
        <div><dt>Methods</dt><dd>{record.methods.slice(0, 3).join(" · ")}</dd></div>
        {record.knowledgeDomain && <div><dt>Knowledge domain</dt><dd>{normalise(record.knowledgeDomain)}</dd></div>}
      </dl>
      <div className="actor-card-footer">
        <div className="actor-card-links">
          <Link to={`/actors/${record.slug}`}>OPEN PROFILE →</Link>
          {record.slug === "global-biodiversity-information-facility" || record.slug === "iucn" ? (
            <Link to={`/atlas?mode=actors`}>VIEW IN ATLAS →</Link>
          ) : (
            <Link to="/atlas?mode=actors">EXPLORE RELATED ATLAS CONTEXT →</Link>
          )}
        </div>
        <span className="knowledge-mono">{record.sourceState.replaceAll("_", " ")}</span>
      </div>
    </article>
  );
}

export function ActorsIndexV21() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const filters = {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "",
    mission: params.get("mission") ?? "",
    geography: params.get("geography") ?? "",
    method: params.get("method") ?? "",
    ecosystem: params.get("ecosystem") ?? "",
    issue: params.get("issue") ?? "",
    solution: params.get("solution") ?? "",
    theme: params.get("theme") ?? "",
    knowledge: params.get("knowledge") ?? "",
    api: params.get("api") ?? "",
    licence: params.get("licence") ?? "",
    freshness: params.get("freshness") ?? "",
  };

  usePageMetadata({
    title: "Organisations working for a living planet | 4PLANET",
    description: "Discover field organisations, knowledge institutions, research infrastructures and public data systems connected to a living planet.",
    canonicalPath: "/actors",
    ogImage: "/p17/share/organisations.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ORGANISATIONS_ — Working for a living planet",
      url: "https://4planet.org/actors",
      description: "Independent 4PLANET profiles connecting ecological organisations and knowledge infrastructures to missions, sources and public data.",
      isPartOf: { "@type": "WebSite", name: "4PLANET", url: "https://4planet.org/" },
    },
  });

  const setFilter = (key: keyof typeof filters, value: string) => {
    navigate(`/actors${queryString({ ...filters, [key]: value })}`, { replace: true });
  };

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return DIRECTORY.filter((record) => {
      const haystack = [record.name, record.alternateName ?? "", record.tagline, record.introduction, record.geography, ...record.missions, ...record.methods, ...record.ecosystems, ...record.issues, ...record.solutions, record.knowledgeDomain ?? ""].join(" ").toLowerCase();
      if (needle && !haystack.includes(needle)) return false;
      if (filters.type && record.type !== filters.type) return false;
      if (filters.mission && !record.missions.includes(filters.mission)) return false;
      if (filters.geography && !record.geography.toLowerCase().includes(filters.geography.toLowerCase())) return false;
      if (filters.method && !record.methods.includes(filters.method)) return false;
      if (filters.ecosystem && !record.ecosystems.includes(filters.ecosystem)) return false;
      if (filters.issue && !record.issues.includes(filters.issue)) return false;
      if (filters.solution && !record.solutions.includes(filters.solution)) return false;
      if (filters.theme && !record.theme.includes(filters.theme)) return false;
      if (filters.knowledge && record.knowledgeDomain !== filters.knowledge) return false;
      if (filters.api && record.apiState !== filters.api) return false;
      if (filters.licence && record.licenceState !== filters.licence) return false;
      if (filters.freshness && record.freshnessState !== filters.freshness) return false;
      return true;
    });
  }, [filters.api, filters.ecosystem, filters.freshness, filters.geography, filters.issue, filters.knowledge, filters.licence, filters.method, filters.mission, filters.q, filters.solution, filters.theme, filters.type]);

  const active = Object.entries(filters).filter(([, value]) => value);
  const actorTypes = unique([...ACTORS.map((actor) => actor.actorType), ...KNOWLEDGE_ACTOR_TYPES]);

  return (
    <PublicShell>
      <main className="actors-page knowledge-index">
        <section className="actors-hero">
          <div className="knowledge-mono knowledge-blue">ORGANISATIONS_ · PRIVATE BETA</div>
          <h1>Working for<br />a living planet.</h1>
          <p className="actors-lede">Discover organisations, research infrastructures, scientific networks and field teams protecting life and building credible solutions.</p>
          <div className="actor-hero-actions">
            <a href="#all-organisations" className="actor-button actor-button-primary">EXPLORE ORGANISATIONS</a>
            <Link to="/atlas?mode=actors" className="actor-button">EXPLORE ON THE MAP →</Link>
            <a href="#knowledge-institutions" className="actor-button">PLANETARY DATA + RESEARCH →</a>
            <a href="#actor-search" className="actor-button">SEARCH</a>
          </div>
          <p className="actor-independent-note">{INDEPENDENT_NOTE}</p>
        </section>

        <section className="actor-intro-band" aria-label="Organisation intelligence scope">
          <p>Field action and planetary knowledge are different capabilities. 4PLANET keeps organisations, programmes, datasets, APIs and evidence separate while making their relationships easier to understand.</p>
          <div><strong>{DIRECTORY.length}</strong><span>unique private-beta profiles</span></div>
          <div><strong>{KNOWLEDGE_INSTITUTIONS.length}</strong><span>knowledge profiles v2.1</span></div>
        </section>

        {active.length === 0 && (
          <section id="knowledge-institutions" className="knowledge-collections" aria-labelledby="knowledge-title">
            <div className="knowledge-section-heading">
              <span className="knowledge-mono knowledge-blue">PLANETARY KNOWLEDGE</span>
              <h2 id="knowledge-title">Who helps make the planet knowable?</h2>
              <p>Research institutions, taxonomic authorities, observing networks and public data infrastructures are shown as distinct actors — never as substitutes for the datasets and source records they maintain.</p>
            </div>
            {KNOWLEDGE_COLLECTIONS.map((collection) => {
              const matches = KNOWLEDGE_INSTITUTIONS.filter(collection.matches).slice(0, 4);
              if (!matches.length) return null;
              return (
                <div className="knowledge-collection" key={collection.id}>
                  <div><h3>{collection.title}</h3><p>{collection.description}</p></div>
                  <div className="knowledge-collection-grid">
                    {matches.map((profile) => <DirectoryCard key={`${collection.id}-${profile.researchId}`} record={DIRECTORY.find((item) => item.slug === profile.slug)!} />)}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className="actors-controls" id="actor-search" aria-labelledby="actor-filter-heading">
          <div className="actors-controls-intro">
            <div id="actor-filter-heading" className="knowledge-mono knowledge-blue">SEARCH + EXPLORE</div>
            <h2>Find relevant capability without ranking it.</h2>
            <p>Filters describe role, method, knowledge domain and source state. They do not create a universal score or claim that one organisation is best.</p>
          </div>
          <div className="actor-filter-grid">
            <label className="actor-field actor-field-wide"><span>Search</span><input value={filters.q} onChange={(event) => setFilter("q", event.target.value)} placeholder="Organisation, dataset, method, issue…" /></label>
            <label className="actor-field"><span>Actor type</span><select value={filters.type} onChange={(event) => setFilter("type", event.target.value)}><option value="">All types</option>{actorTypes.map((value) => <option key={value} value={value}>{normalise(value)}</option>)}</select></label>
            <label className="actor-field"><span>Mission</span><select value={filters.mission} onChange={(event) => setFilter("mission", event.target.value)}><option value="">All missions</option>{unique(DIRECTORY.flatMap((record) => record.missions)).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Knowledge domain</span><select value={filters.knowledge} onChange={(event) => setFilter("knowledge", event.target.value)}><option value="">All domains</option>{KNOWLEDGE_DOMAINS.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Geography</span><input value={filters.geography} onChange={(event) => setFilter("geography", event.target.value)} placeholder="Global, Norway, tropical…" /></label>
            <label className="actor-field"><span>Method</span><select value={filters.method} onChange={(event) => setFilter("method", event.target.value)}><option value="">All methods</option>{unique(DIRECTORY.flatMap((record) => record.methods)).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Ecosystem</span><select value={filters.ecosystem} onChange={(event) => setFilter("ecosystem", event.target.value)}><option value="">All ecosystems</option>{unique(DIRECTORY.flatMap((record) => record.ecosystems)).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Issue</span><select value={filters.issue} onChange={(event) => setFilter("issue", event.target.value)}><option value="">All issues</option>{unique(DIRECTORY.flatMap((record) => record.issues)).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Solution</span><select value={filters.solution} onChange={(event) => setFilter("solution", event.target.value)}><option value="">All solutions</option>{unique(DIRECTORY.flatMap((record) => record.solutions)).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>API state</span><select value={filters.api} onChange={(event) => setFilter("api", event.target.value)}><option value="">All API states</option>{KNOWLEDGE_API_STATES.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Licence readiness</span><select value={filters.licence} onChange={(event) => setFilter("licence", event.target.value)}><option value="">All licence states</option>{KNOWLEDGE_LICENCE_STATES.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="actor-field"><span>Freshness</span><select value={filters.freshness} onChange={(event) => setFilter("freshness", event.target.value)}><option value="">All freshness states</option>{KNOWLEDGE_FRESHNESS_STATES.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          {active.length > 0 && <div className="actor-filter-chips" aria-label="Active filters">{active.map(([key, value]) => <button key={key} onClick={() => setFilter(key as keyof typeof filters, "")}>{key}: {value} ×</button>)}<button onClick={() => navigate("/actors", { replace: true })}>Clear all</button></div>}
        </section>

        <section id="all-organisations" className="actors-results" aria-live="polite">
          <div className="actors-results-header"><div><span className="knowledge-mono knowledge-blue">ALL ORGANISATIONS</span><h2>{filtered.length} organisations</h2></div><Link to="/atlas?mode=actors" className="actor-text-link">EXPLORE SPATIALLY IN ATLAS →</Link></div>
          {filtered.length ? <div className="actor-card-grid">{filtered.map((record) => <DirectoryCard key={record.slug} record={record} />)}</div> : <div className="actor-state"><strong>No results.</strong><p>Remove one or more filters to continue.</p></div>}
        </section>
      </main>
    </PublicShell>
  );
}

function ProfileList({ items }: { items: string[] }) {
  return <ul className="knowledge-profile-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function SourceGraphVisual({ profile }: { profile: KnowledgeInstitutionProfile }) {
  const nodes = [
    { label: profile.name, type: "INSTITUTION" },
    { label: profile.programmes[0] ?? "Programme", type: "PROGRAMME" },
    { label: profile.datasets[0] ?? "Dataset", type: "DATASET" },
    { label: profile.apiState, type: "ACCESS" },
    { label: profile.useAcross4Planet[0] ?? "4PLANET", type: "PRODUCT" },
  ];
  return <div className="knowledge-flow" role="img" aria-label={`${profile.name} source relationship visualisation`}>{nodes.map((node, index) => <div className="knowledge-flow-node" key={`${node.type}-${node.label}`}><span>{node.type}</span><strong>{node.label}</strong>{index < nodes.length - 1 && <i aria-hidden>→</i>}</div>)}</div>;
}

function KnowledgeReviewForm({ profile }: { profile: KnowledgeInstitutionProfile }) {
  const [receipt, setReceipt] = useState<ActorReviewReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReceipt(null); setError(null);
    const form = new FormData(event.currentTarget);
    const request: ActorReviewRequest = {
      actorId: profile.canonicalActorId,
      actorSlug: profile.slug,
      requestType: String(form.get("requestType") ?? "CORRECTION") as ActorReviewRequestType,
      requestorName: String(form.get("requestorName") ?? ""),
      requestorRole: String(form.get("requestorRole") ?? ""),
      officialEmail: String(form.get("officialEmail") ?? ""),
      organisationDomain: String(form.get("organisationDomain") ?? ""),
      authorisationContext: String(form.get("authorisationContext") ?? ""),
      affectedSection: String(form.get("affectedSection") ?? ""),
      proposedChange: String(form.get("proposedChange") ?? ""),
      evidenceReferences: String(form.get("evidenceReferences") ?? ""),
      attachmentReference: "",
      consent: Boolean(form.get("consent")),
      privacyAcknowledged: Boolean(form.get("privacyAcknowledged")),
    };
    try { setReceipt(await submitActorReviewRequest(request)); } catch (next) { setError(next instanceof Error ? next.message : "The request could not be prepared."); }
  };
  return <form className="knowledge-review-form" onSubmit={submit}>
    <label><span>Request type</span><select name="requestType"><option value="CLAIM">Claim profile</option><option value="CORRECTION">Correction</option><option value="URGENT_CORRECTION">Urgent correction</option><option value="REMOVAL">Removal request</option><option value="DISPUTE">Dispute</option><option value="APPEAL">Appeal</option></select></label>
    <label><span>Affected section</span><input name="affectedSection" /></label>
    <label><span>Name</span><input required name="requestorName" /></label>
    <label><span>Role</span><input required name="requestorRole" /></label>
    <label><span>Official email</span><input required type="email" name="officialEmail" /></label>
    <label><span>Organisation domain</span><input required name="organisationDomain" /></label>
    <label className="knowledge-wide"><span>Authorisation context</span><textarea required rows={3} name="authorisationContext" /></label>
    <label className="knowledge-wide"><span>Requested change</span><textarea required rows={4} name="proposedChange" /></label>
    <label className="knowledge-wide"><span>Evidence references</span><textarea rows={3} name="evidenceReferences" /></label>
    <label className="knowledge-check knowledge-wide"><input required type="checkbox" name="consent" /><span>I confirm this request is for factual review and grants no editing, verification or partnership status.</span></label>
    <label className="knowledge-check knowledge-wide"><input required type="checkbox" name="privacyAcknowledged" /><span>I understand external submission remains closed unless the secure review endpoint is explicitly enabled.</span></label>
    <button className="actor-button actor-button-primary knowledge-wide" type="submit">CHECK SECURE REVIEW PATH</button>
    {receipt && <div className="knowledge-wide knowledge-receipt" role="status"><strong>{receipt.persisted ? "Received for review." : "Secure submission remains closed."}</strong><p>{receipt.message}</p><small>{receipt.requestId}</small></div>}
    {error && <div className="knowledge-wide knowledge-error" role="alert">{error}</div>}
  </form>;
}

function KnowledgeProfilePage({ profile }: { profile: KnowledgeInstitutionProfile }) {
  const ogImage = "/p17/share/organisations.svg";
  usePageMetadata({
    title: `${profile.name} — Knowledge Infrastructure | 4PLANET`,
    description: profile.headline,
    canonicalPath: `/actors/${profile.slug}`,
    ogImage,
    ogType: "profile",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", name: profile.name, alternateName: profile.alternateName, url: profile.officialUrl, sameAs: profile.sourceUrls, knowsAbout: [profile.knowledgeDomain, ...profile.methods], description: profile.headline },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "4PLANET", item: "https://4planet.org/" },
          { "@type": "ListItem", position: 2, name: "Organisations", item: "https://4planet.org/actors" },
          { "@type": "ListItem", position: 3, name: profile.name, item: `https://4planet.org/actors/${profile.slug}` },
        ] },
      ],
    },
  });
  const atlasHref = profile.slug === "global-biodiversity-information-facility" ? "/atlas?mode=actors&entity=actor%3Ap17%3AP17-A003" : profile.slug === "iucn" ? "/atlas?mode=actors&entity=actor%3Ap17%3AP17-A001" : "/atlas?mode=actors";

  return <PublicShell><main className="knowledge-profile">
    <section className="knowledge-profile-hero">
      <Link to="/actors" className="actor-back">← ORGANISATIONS_</Link>
      <span className="knowledge-mono knowledge-blue">{profile.actorTypeLabel}</span>
      <h1>{profile.name}</h1>
      <p className="knowledge-profile-headline">{profile.headline}</p>
      <p className="knowledge-profile-intro">{profile.whatMakesPossible}</p>
      <div className="knowledge-hero-meta"><span>{normalise(profile.knowledgeDomain)}</span><span>{profile.coverage}</span><span>Reviewed {profile.lastReviewed}</span></div>
      <div className="actor-hero-actions"><a className="actor-button actor-button-primary" href={profile.officialUrl} target="_blank" rel="noreferrer">OFFICIAL WEBSITE ↗</a><Link className="actor-button" to={atlasHref}>OPEN RELEVANT ATLAS CONTEXT →</Link><button className="actor-button" onClick={() => navigator.clipboard?.writeText(`https://4planet.org/actors/${profile.slug}`)}>SHARE PROFILE</button></div>
      <p className="actor-independent-note">{INDEPENDENT_NOTE}</p>
    </section>

    <section className="knowledge-profile-section"><span className="knowledge-mono knowledge-blue">WHY THIS MATTERS</span><h2>What this knowledge infrastructure makes possible</h2><p className="knowledge-lead">{profile.whatMakesPossible}</p></section>
    <section className="knowledge-profile-section knowledge-grid-two"><div><span className="knowledge-mono knowledge-blue">PROGRAMMES + SYSTEMS</span><h2>What it operates or contributes to</h2><ProfileList items={profile.programmes} /></div><div><span className="knowledge-mono knowledge-blue">DATASETS + PRODUCTS</span><h2>What users can encounter</h2><ProfileList items={profile.datasets} /></div></section>
    <section className="knowledge-profile-section"><span className="knowledge-mono knowledge-blue">SOURCE GRAPH</span><h2>Institution → programme → dataset → access → product</h2><p>This 4PLANET-generated view is explanatory. It does not imply that the institution endorses 4PLANET or that every dataset shares one licence, method or geography.</p><SourceGraphVisual profile={profile} /></section>
    <section className="knowledge-profile-section knowledge-grid-two"><div><span className="knowledge-mono knowledge-blue">METHODS</span><h2>How the knowledge is produced or stewarded</h2><ProfileList items={profile.methods} /></div><div><span className="knowledge-mono knowledge-blue">COVERAGE</span><h2>Where and when it applies</h2><p>{profile.coverage}</p><p><strong>Freshness:</strong> {profile.freshness}</p></div></section>
    <section className="knowledge-profile-section knowledge-grid-two"><div><span className="knowledge-mono knowledge-blue">ACCESS + MACHINE USE</span><h2>How the information can be accessed</h2><p>{profile.access}</p><dl className="knowledge-state-list"><div><dt>API state</dt><dd>{normalise(profile.apiState)}</dd></div><div><dt>Freshness state</dt><dd>{normalise(profile.freshnessState)}</dd></div></dl></div><div><span className="knowledge-mono knowledge-blue">LICENCE + PERMITTED USE</span><h2>Rights travel with the data</h2><p>{profile.licence}</p><dl className="knowledge-state-list"><div><dt>Licence state</dt><dd>{normalise(profile.licenceState)}</dd></div></dl></div></section>
    <section className="knowledge-profile-section knowledge-boundary"><span className="knowledge-mono knowledge-blue">LIMITATIONS + SENSITIVE DATA</span><h2>What this information must not be made to say</h2><ProfileList items={profile.limitations} /><p><strong>Sensitive-data handling:</strong> {profile.sensitiveData}</p></section>
    <section className="knowledge-profile-section"><span className="knowledge-mono knowledge-blue">USE ACROSS 4PLANET</span><h2>Shared infrastructure, controlled interpretation</h2><div className="knowledge-pills">{profile.useAcross4Planet.map((item) => <span key={item}>{item}</span>)}</div><p>Use means a documented source or context relationship. It does not mean partnership, endorsement, causal proof or that a public dataset verifies a 4PLANET impact claim.</p></section>
    <section className="knowledge-profile-section knowledge-grid-two"><div><span className="knowledge-mono knowledge-blue">RELATED MISSIONS</span><h2>Where the knowledge can add context</h2><div className="knowledge-pills">{profile.missions.map((item) => <span key={item}>{item}</span>)}</div></div><div><span className="knowledge-mono knowledge-blue">IDENTITY CONTROL</span><h2>Institution is not dataset</h2><dl className="knowledge-state-list"><div><dt>Research ID</dt><dd>{profile.researchId}</dd></div><div><dt>Canonical actor ID</dt><dd>{profile.canonicalActorId}</dd></div><div><dt>Identity</dt><dd>{normalise(profile.identityState)}</dd></div></dl></div></section>
    <section className="knowledge-profile-section"><span className="knowledge-mono knowledge-blue">EVIDENCE + TRANSPARENCY</span><h2>Official sources used for this private-beta profile</h2><div className="knowledge-source-list">{profile.sourceUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗</a>)}</div><p>Last reviewed: {profile.lastReviewed}. Material dataset, API, licence and sensitivity conditions must be checked again before production integration.</p></section>
    <section className="knowledge-profile-section knowledge-boundary"><span className="knowledge-mono knowledge-blue">ABOUT THIS PROFILE</span><h2>Independent research, not an official organisation page</h2><p>{INDEPENDENT_NOTE}</p><p>Relationship status: {normalise(profile.relationshipStatus)}.</p></section>
    <section id="profile-review" className="knowledge-profile-section"><span className="knowledge-mono knowledge-blue">CLAIM + CORRECTION</span><h2>Help keep this profile accurate.</h2><p>Requests enter the existing internal review contract. They never mutate profile content automatically, create verification or activate partner status.</p><KnowledgeReviewForm profile={profile} /></section>
    <section className="knowledge-profile-section knowledge-profile-end"><span className="knowledge-mono knowledge-blue">CONTINUE</span><h2>Keep the source and the interpretation connected.</h2><div className="actor-hero-actions"><Link className="actor-button actor-button-primary" to={atlasHref}>OPEN ATLAS →</Link><Link className="actor-button" to="/actors">ALL ORGANISATIONS →</Link><a className="actor-button" href={profile.officialUrl} target="_blank" rel="noreferrer">OFFICIAL SOURCE ↗</a></div></section>
  </main></PublicShell>;
}

export function ActorProfileV21() {
  const { slug } = useParams();
  const knowledge = knowledgeInstitutionBySlug(slug);
  if (knowledge) return <KnowledgeProfilePage profile={knowledge} />;
  return <ActorProfilePage />;
}

export const P17_DIRECTORY_COUNT = DIRECTORY.length;
export const P17_KNOWLEDGE_PROFILE_COUNT = KNOWLEDGE_INSTITUTIONS.length;
