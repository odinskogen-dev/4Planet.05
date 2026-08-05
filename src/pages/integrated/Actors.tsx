import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { NotFound } from "@/pages/system";
import {
  ACTORS,
  ACTOR_ACTION_LABELS,
  ACTOR_TYPE_LABELS,
  actorById,
  actorBySlug,
  actorSource,
  type ActorActionType,
  type ActorProfile,
  type ActorType,
} from "@/data/actors";
import { T } from "@/styles/tokens";
import { usePageMetadata } from "@/utils/metadata";
import "@/styles/actors.css";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

const MISSION_SLUGS: Record<string, string> = {
  "CLIM4TE": "clim4te",
  "AM4ZONIA": "am4zonia",
  "SPECIES": "species",
  "RE:WILD LAND": "rewild",
  "RE:WILD MARINE": "4ntarctica",
};

const disclaimer =
  "This profile is independently indexed by 4PLANET from public information. Inclusion does not imply endorsement, verification or a formal partnership. The organisation's official website remains the primary source and action destination.";

function Status({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "red" | "amber" }) {
  const colour = tone === "green" ? T.acid : tone === "red" ? T.red : tone === "amber" ? "#8A6500" : T.blue;
  return <span className="actor-status" style={{ borderColor: colour, color: colour }}>{children}</span>;
}

function encodeFilters(values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function ActorCard({ actor }: { actor: ActorProfile }) {
  return (
    <article className="actor-card">
      <div className="actor-card-topline">
        <span style={{ ...mono, color: T.blue }}>{actor.id}</span>
        <Status>{actor.status}</Status>
      </div>
      <h2>{actor.name}</h2>
      <p className="actor-card-type">{actor.actorTypeLabel}</p>
      <p className="actor-card-intro">{actor.introduction}</p>
      <dl className="actor-card-facts">
        <div><dt>Geography</dt><dd>{actor.primaryGeography}</dd></div>
        <div><dt>Missions</dt><dd>{actor.missionIds.join(" · ")}</dd></div>
        <div><dt>Methods</dt><dd>{actor.methods.slice(0, 3).join(" · ")}</dd></div>
        <div><dt>Support</dt><dd>{actor.actions.map((action) => ACTOR_ACTION_LABELS[action.type]).join(" · ")}</dd></div>
      </dl>
      <div className="actor-card-footer">
        <span style={{ ...mono, color: T.faint }}>Reviewed {actor.lastReviewed}</span>
        <Link to={`/actors/${actor.slug}`} className="actor-button actor-button-primary">Open profile →</Link>
      </div>
    </article>
  );
}

export function ActorsIndex() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [loading, setLoading] = useState(true);
  const [sourceError, setSourceError] = useState<string | null>(null);

  const query = params.get("q") ?? "";
  const actorType = params.get("type") ?? "";
  const mission = params.get("mission") ?? "";
  const geography = params.get("geography") ?? "";
  const action = params.get("action") ?? "";
  const status = params.get("status") ?? "";

  usePageMetadata({
    title: "Organisations working for a living planet | 4PLANET",
    description: "Discover independently indexed conservation, research, data and rights-based organisations connected to 4PLANET missions, places, species, issues and solutions.",
    canonicalPath: "/actors",
  });

  useEffect(() => {
    let alive = true;
    Promise.resolve()
      .then(() => {
        if (alive) setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setSourceError("The actor fixture could not be loaded.");
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, []);

  const setFilter = (key: string, value: string) => {
    const next = {
      q: key === "q" ? value : query,
      type: key === "type" ? value : actorType,
      mission: key === "mission" ? value : mission,
      geography: key === "geography" ? value : geography,
      action: key === "action" ? value : action,
      status: key === "status" ? value : status,
    };
    navigate(`/actors${encodeFilters(next)}`, { replace: true });
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ACTORS.filter((actor) => {
      const haystack = [
        actor.name,
        actor.introduction,
        actor.primaryGeography,
        ...actor.missionIds,
        ...actor.methods,
        ...actor.issues,
        ...actor.solutions,
        ...actor.species,
        ...actor.ecosystems,
      ].join(" ").toLowerCase();
      if (needle && !haystack.includes(needle)) return false;
      if (actorType && actor.actorType !== actorType) return false;
      if (mission && !actor.missionIds.includes(mission)) return false;
      if (geography && !actor.primaryGeography.toLowerCase().includes(geography.toLowerCase())) return false;
      if (action && !actor.actions.some((item) => item.type === action)) return false;
      if (status && actor.status !== status) return false;
      return true;
    });
  }, [query, actorType, mission, geography, action, status]);

  const activeFilters = [
    ["q", query], ["type", actorType], ["mission", mission], ["geography", geography], ["action", action], ["status", status],
  ].filter(([, value]) => value);

  return (
    <PublicShell>
      <main className="actors-page" id="main-content">
        <section className="actors-hero">
          <div style={{ ...mono, color: T.blue }}>ORGANISATIONS_ · PRIVATE BETA</div>
          <h1>Find who is working on the living planet.</h1>
          <p className="actors-lede">
            A source-aware index of organisations, research infrastructure and field actors connected to ecological problems and solutions. The first three profiles test one shared model before expansion.
          </p>
          <div className="actors-disclaimer" role="note">
            <strong>INDEXING IS NOT ENDORSEMENT.</strong> {disclaimer}
          </div>
          <div className="actor-view-switch" aria-label="Actor views">
            <span className="actor-button actor-button-primary" aria-current="page">LIST</span>
            <Link to="/atlas?mode=actors" className="actor-button">OPEN ACTOR MODE IN ATLAS →</Link>
          </div>
        </section>

        <section className="actors-controls" aria-labelledby="actor-filter-heading">
          <div>
            <div id="actor-filter-heading" style={{ ...mono, color: T.blue }}>SEARCH + FILTER</div>
            <p>Filters describe role and relevance. They do not rank organisations or produce a universal quality score.</p>
          </div>
          <div className="actor-filter-grid">
            <label className="actor-field actor-field-wide">
              <span>Search</span>
              <input value={query} onChange={(event) => setFilter("q", event.target.value)} placeholder="Organisation, issue, method, species…" />
            </label>
            <label className="actor-field">
              <span>Actor type</span>
              <select value={actorType} onChange={(event) => setFilter("type", event.target.value)}>
                <option value="">All types</option>
                {(Object.entries(ACTOR_TYPE_LABELS) as [ActorType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="actor-field">
              <span>Mission</span>
              <select value={mission} onChange={(event) => setFilter("mission", event.target.value)}>
                <option value="">All missions</option>
                {[...new Set(ACTORS.flatMap((actor) => actor.missionIds))].sort().map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="actor-field">
              <span>Geography</span>
              <select value={geography} onChange={(event) => setFilter("geography", event.target.value)}>
                <option value="">All geographies</option>
                <option value="global">Global</option>
                <option value="tropical">Tropical forest regions</option>
                <option value="Norway">Norway</option>
                <option value="UK">United Kingdom</option>
                <option value="Denmark">Denmark</option>
              </select>
            </label>
            <label className="actor-field">
              <span>Support action</span>
              <select value={action} onChange={(event) => setFilter("action", event.target.value)}>
                <option value="">All actions</option>
                {(Object.entries(ACTOR_ACTION_LABELS) as [ActorActionType, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="actor-field">
              <span>Profile status</span>
              <select value={status} onChange={(event) => setFilter("status", event.target.value)}>
                <option value="">All statuses</option>
                <option value="INDEXED">Indexed</option>
                <option value="PROFILE_CLAIMED">Profile claimed</option>
                <option value="INFORMATION_VERIFIED">Information verified</option>
              </select>
            </label>
          </div>
          {activeFilters.length > 0 && (
            <div className="actor-filter-chips" aria-label="Active filters">
              {activeFilters.map(([key, value]) => (
                <button key={key} onClick={() => setFilter(key, "")}>{key}: {value} ×</button>
              ))}
              <button onClick={() => navigate("/actors", { replace: true })}>Clear all</button>
            </div>
          )}
        </section>

        <section className="actors-results" aria-live="polite">
          <div className="actors-results-header">
            <span style={mono}>{loading ? "LOADING" : `${filtered.length} OF ${ACTORS.length} PROFILES`}</span>
            <span style={{ ...mono, color: T.faint }}>No universal ranking</span>
          </div>
          {loading && <div className="actor-state"><Status tone="amber">LOADING</Status><p>Loading the controlled private-beta actor fixture.</p></div>}
          {sourceError && <div className="actor-state"><Status tone="red">SOURCE UNAVAILABLE</Status><p>{sourceError}</p></div>}
          {!loading && !sourceError && ACTORS.length === 0 && <div className="actor-state"><Status tone="amber">SOURCE UNAVAILABLE</Status><p>No actor records are available.</p></div>}
          {!loading && !sourceError && ACTORS.length > 0 && filtered.length === 0 && (
            <div className="actor-state"><Status tone="amber">NO RESULTS</Status><p>No profiles match the current filters. Remove one or more filters to continue.</p></div>
          )}
          {!loading && !sourceError && filtered.length > 0 && <div className="actor-card-grid">{filtered.map((actor) => <ActorCard key={actor.id} actor={actor} />)}</div>}
        </section>
      </main>
    </PublicShell>
  );
}

function ClaimCorrectionForm({ actor }: { actor: ActorProfile }) {
  const [mode, setMode] = useState<"CLAIM" | "CORRECTION">("CLAIM");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const requestId = `P17-${mode}-${Date.now()}`;
    const record = {
      requestId,
      actorId: actor.id,
      actorSlug: actor.slug,
      requestType: mode,
      name: String(form.get("name") ?? ""),
      role: String(form.get("role") ?? ""),
      email: String(form.get("email") ?? ""),
      organisationDomain: String(form.get("organisationDomain") ?? ""),
      proposedCorrection: String(form.get("proposedCorrection") ?? ""),
      evidenceReferences: String(form.get("evidenceReferences") ?? ""),
      consent: form.get("consent") === "on",
      status: "RECEIVED_FOR_INTERNAL_REVIEW",
      createdAt: new Date().toISOString(),
      environment: "PRIVATE_BETA_LOCAL_FIXTURE",
    };
    const key = "4planet:p17:actor-review-queue";
    let previous: unknown[] = [];
    try {
      previous = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      if (!Array.isArray(previous)) previous = [];
    } catch {
      previous = [];
    }
    localStorage.setItem(key, JSON.stringify([...previous, record]));
    setSubmitted(requestId);
    event.currentTarget.reset();
  };

  return (
    <section className="actor-form-section" aria-labelledby="actor-review-title">
      <div>
        <div style={{ ...mono, color: T.blue }}>PROFILE OWNERSHIP + CORRECTION</div>
        <h2 id="actor-review-title">Help keep this profile accurate.</h2>
        <p>Private-beta submissions enter an internal review queue. They do not change the profile, grant editing access, verify every claim or create partner status.</p>
      </div>
      <div className="actor-form-panel">
        <div className="actor-form-tabs">
          <button type="button" aria-pressed={mode === "CLAIM"} onClick={() => { setMode("CLAIM"); setSubmitted(null); }}>Is this your organisation?</button>
          <button type="button" aria-pressed={mode === "CORRECTION"} onClick={() => { setMode("CORRECTION"); setSubmitted(null); }}>Submit a correction</button>
        </div>
        {submitted ? (
          <div className="actor-form-confirmation" role="status">
            <Status tone="green">RECEIVED</Status>
            <h3>Queued for internal review.</h3>
            <p>Reference: {submitted}. No public profile state has changed.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="actor-form">
            <input type="hidden" name="actorId" value={actor.id} />
            <label><span>Name</span><input required name="name" autoComplete="name" /></label>
            <label><span>Role</span><input required name="role" /></label>
            <label><span>Official email</span><input required type="email" name="email" autoComplete="email" /></label>
            <label><span>Organisation domain</span><input required name="organisationDomain" placeholder="example.org" /></label>
            <label className="actor-form-wide"><span>{mode === "CLAIM" ? "Authorisation context" : "Proposed correction"}</span><textarea required name="proposedCorrection" rows={5} /></label>
            <label className="actor-form-wide"><span>Evidence or source references</span><textarea name="evidenceReferences" rows={3} placeholder="Official URL, registry record or document reference" /></label>
            <label className="actor-form-consent actor-form-wide"><input required type="checkbox" name="consent" /><span>I confirm that this information may be reviewed and retained for profile governance. This is a private-beta local fixture and is not an external message.</span></label>
            <p className="actor-form-privacy actor-form-wide">Privacy boundary: no submission is sent to an organisation, published, used to create a partnership or treated as independent verification.</p>
            <button className="actor-button actor-button-primary actor-form-wide" type="submit">SUBMIT TO INTERNAL REVIEW →</button>
          </form>
        )}
      </div>
    </section>
  );
}

function ProfileSection({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="actor-profile-section">
      <div style={{ ...mono, color: T.blue }}>{eyebrow}</div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ActorProfilePage() {
  const { slug } = useParams();
  const actor = actorBySlug(slug);
  const [copied, setCopied] = useState(false);

  const structuredData = useMemo(() => actor ? ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: actor.name,
    legalName: actor.legalName,
    url: actor.officialUrl,
    sameAs: actor.seo.sameAs,
    areaServed: actor.seo.areaServed,
    knowsAbout: actor.seo.knowsAbout,
    description: actor.introduction,
  }) : undefined, [actor]);

  usePageMetadata({
    title: actor?.seo.title ?? "Organisation profile | 4PLANET",
    description: actor?.seo.description ?? "Independent organisation profile.",
    canonicalPath: actor?.seo.canonicalPath ?? "/actors",
    structuredData,
  });

  if (!actor) return <NotFound />;

  const share = async () => {
    const url = `https://4planet.org${actor.seo.canonicalPath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const relatedActors = actor.relatedActorIds.map((id) => actorById(id)).filter((item): item is ActorProfile => Boolean(item));
  const atlasHref = `/atlas?mode=actors&entity=${encodeURIComponent(actor.id)}&c=${actor.geographies[0].longitude},${actor.geographies[0].latitude}&z=${actor.geographies[0].zoom}`;

  return (
    <PublicShell>
      <main className="actor-profile" id="main-content">
        <section className="actor-profile-hero">
          <Link to="/actors" className="actor-back">← ORGANISATIONS_</Link>
          <div className="actor-profile-statuses">
            <Status>{actor.status}</Status>
            <Status tone="amber">PRIVATE BETA · NOINDEX</Status>
            <Status tone="green">SOURCE-MAPPED</Status>
          </div>
          <div style={{ ...mono, color: T.blue }}>{actor.id} · {actor.actorTypeLabel}</div>
          <h1>{actor.name}</h1>
          {actor.legalName && <p className="actor-legal-name">Legal identity used in this profile: {actor.legalName}</p>}
          <p className="actor-profile-intro">{actor.introduction}</p>
          <div className="actors-disclaimer" role="note"><strong>INDEPENDENT PROFILE.</strong> {disclaimer}</div>
          <div className="actor-profile-actions">
            <a href={actor.officialUrl} target="_blank" rel="noopener noreferrer" className="actor-button actor-button-primary" data-outbound-actor={actor.id}>OFFICIAL WEBSITE ↗</a>
            <Link to={atlasHref} className="actor-button">OPEN IN ATLAS →</Link>
            <button onClick={share} className="actor-button" type="button">{copied ? "LINK COPIED" : "SHARE PROFILE"}</button>
          </div>
        </section>

        <section className="actor-profile-facts" aria-label="Profile facts">
          <div><span>Actor type</span><strong>{actor.actorTypeLabel}</strong></div>
          <div><span>Primary geography</span><strong>{actor.primaryGeography}</strong></div>
          <div><span>Missions</span><strong>{actor.missionIds.join(" · ")}</strong></div>
          <div><span>Last reviewed</span><strong>{actor.lastReviewed}</strong></div>
        </section>

        <ProfileSection eyebrow="01_ WHY THIS ACTOR MATTERS" title="A role in the wider system.">
          <p className="actor-profile-body-large">{actor.whyItMatters}</p>
        </ProfileSection>

        <ProfileSection eyebrow="02_ WORK" title="What it works on — and how.">
          <div className="actor-two-column">
            <div><h3>What it works on</h3><ul>{actor.whatItWorksOn.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><h3>How it works</h3><ul>{actor.howItWorks.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="actor-tag-groups">
            <div><span>Issues</span><p>{actor.issues.join(" · ")}</p></div>
            <div><span>Solutions</span><p>{actor.solutions.join(" · ")}</p></div>
            <div><span>Ecosystems</span><p>{actor.ecosystems.join(" · ")}</p></div>
            <div><span>Species</span><p>{actor.species.join(" · ")}</p></div>
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="03_ PROGRAMMES" title="Documented programme directions.">
          <div className="actor-programme-grid">
            {actor.programmes.map((programme) => (
              <article key={programme.id}>
                <div style={{ ...mono, color: T.blue }}>{programme.id}</div>
                <h3>{programme.name}</h3>
                <p>{programme.summary}</p>
                <div className="actor-source-mini">Sources: {programme.sourceIds.map((id) => actorSource(actor, id)?.label ?? id).join(" · ")}</div>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="04_ GEOGRAPHY" title="Different places mean different things.">
          <p className="actor-section-intro">Headquarters, operating geography and programme geography remain separate. Broad regions are editorial context, not exact project sites.</p>
          <div className="actor-geography-grid">
            {actor.geographies.map((geo) => (
              <article key={geo.id}>
                <Status tone={geo.role === "HEADQUARTERS_REFERENCE" ? "amber" : "blue"}>{geo.role.replaceAll("_", " ")}</Status>
                <h3>{geo.label}</h3>
                <p>{geo.description}</p>
                <dl><div><dt>Precision</dt><dd>{geo.precision.replaceAll("_", " ")}</dd></div><div><dt>Sensitivity</dt><dd>{geo.sensitivity}</dd></div></dl>
                <a href={`/atlas?mode=actors&entity=${encodeURIComponent(actor.id)}&actorGeo=${encodeURIComponent(geo.id)}&c=${geo.longitude},${geo.latitude}&z=${geo.zoom}`} className="actor-text-link">VIEW THIS REFERENCE IN ATLAS →</a>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="05_ EVIDENCE" title="Claims, sources and boundaries.">
          <div className="actor-claim-list">
            {actor.claims.map((claim) => (
              <article key={claim.id}>
                <div className="actor-claim-head"><span style={{ ...mono, color: T.blue }}>{claim.id} · {claim.section}</span><Status tone={claim.evidenceState === "STRONG" ? "green" : "amber"}>{claim.evidenceState}</Status></div>
                <h3>{claim.text}</h3>
                <p><strong>State:</strong> {claim.claimState.replaceAll("_", " ")}</p>
                {claim.limitation && <p className="actor-claim-limit"><strong>Boundary:</strong> {claim.limitation}</p>}
                <div className="actor-claim-sources">
                  {claim.sourceIds.map((sourceId) => {
                    const source = actorSource(actor, sourceId);
                    return source ? <a key={sourceId} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a> : <span key={sourceId}>{sourceId}</span>;
                  })}
                </div>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="06_ LIMITATIONS" title="What this profile does not establish.">
          <ul className="actor-limitations">{actor.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
        </ProfileSection>

        <ProfileSection eyebrow="07_ OFFICIAL ACTIONS" title="Continue through the organisation's own channels.">
          <p className="actor-section-intro">4PLANET does not collect payment, convert these actions into Impact Units or imply that funds pass through 4PLANET.</p>
          <div className="actor-action-grid">
            {actor.actions.map((action) => (
              <a key={action.id} href={action.url} target="_blank" rel="noopener noreferrer" data-outbound-actor={actor.id} data-action-type={action.type}>
                <span style={{ ...mono, color: T.blue }}>{ACTOR_ACTION_LABELS[action.type]}</span>
                <h3>{action.label} ↗</h3>
                <p>{action.description}</p>
              </a>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="08_ CONNECTIONS" title="Related actors and missions.">
          <div className="actor-two-column">
            <div><h3>Related missions</h3><div className="actor-link-stack">{actor.missionIds.map((mission) => <Link key={mission} to={`/missions/${MISSION_SLUGS[mission] ?? mission.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>{mission} →</Link>)}</div></div>
            <div><h3>Related actors</h3><div className="actor-link-stack">{relatedActors.length ? relatedActors.map((related) => <Link key={related.id} to={`/actors/${related.slug}`}>{related.name} →</Link>) : <p>Relationships remain under review for this private-beta profile.</p>}</div></div>
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="09_ SOURCE REGISTER" title="Official sources used in this profile.">
          <div className="actor-source-register">
            {actor.sources.map((source) => (
              <article key={source.id}>
                <div><span style={{ ...mono, color: T.blue }}>{source.id}</span><Status tone={source.rightsStatus === "ACCEPTABLE" ? "green" : "amber"}>{source.rightsStatus}</Status></div>
                <h3>{source.label}</h3>
                <p>{source.sourceClass} · Retrieved {source.retrievedAt} · Visibility {source.visibility}</p>
                <a href={source.url} target="_blank" rel="noopener noreferrer">OPEN SOURCE ↗</a>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ClaimCorrectionForm actor={actor} />
      </main>
    </PublicShell>
  );
}
