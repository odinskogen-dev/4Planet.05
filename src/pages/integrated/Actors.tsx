import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { NotFound } from "@/pages/system";
import {
  ACTORS,
  ACTOR_ACTION_LABELS,
  ACTOR_COLLECTIONS,
  ACTOR_TYPE_LABELS,
  actorById,
  actorBySlug,
  actorSource,
  actorsInCollection,
  type ActorActionType,
  type ActorCollection,
  type ActorProfile,
  type ActorType,
} from "@/data/actors";
import {
  submitActorReviewRequest,
  type ActorReviewReceipt,
  type ActorReviewRequest,
  type ActorReviewRequestType,
} from "@/data/actorReview";
import { T } from "@/styles/tokens";
import { usePageMetadata } from "@/utils/metadata";
import "@/styles/actors.css";

const mono: CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10.5,
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

const MISSION_SLUGS: Record<string, string> = {
  CLIM4TE: "clim4te",
  AM4ZONIA: "am4zonia",
  SPECIES: "species",
  "RE:WILD LAND": "rewild",
  "RE:WILD MARINE": "4ntarctica",
  WH4LES: "wh4les",
  COR4L: "cor4l",
  EN4RGY: "en3rgy",
};

const independentProfileNote =
  "Independently researched by 4PLANET from public sources. This is not an official organisation page or a partnership.";

function Status({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "red" | "amber" | "neutral";
}) {
  const colour =
    tone === "green"
      ? "#147B42"
      : tone === "red"
        ? T.red
        : tone === "amber"
          ? "#795B00"
          : tone === "neutral"
            ? T.dim
            : T.blue;
  return (
    <span className="actor-status" style={{ borderColor: colour, color: colour }}>
      {children}
    </span>
  );
}

function encodeFilters(values: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

function primaryAction(actor: ActorProfile) {
  return actor.actions.find((item) => item.type === "DONATE" || item.type === "EXPLORE_DATA") ?? actor.actions[0];
}

function atlasHref(actor: ActorProfile, geoId = actor.geographies[0]?.id) {
  const geo = actor.geographies.find((item) => item.id === geoId) ?? actor.geographies[0];
  const params = new URLSearchParams({
    mode: "actors",
    entity: actor.id,
  });
  if (geo) {
    params.set("actorGeo", geo.id);
    params.set("c", `${geo.longitude},${geo.latitude}`);
    params.set("z", String(geo.zoom));
  }
  return `/atlas?${params.toString()}`;
}

function ActorCard({ actor, compact = false }: { actor: ActorProfile; compact?: boolean }) {
  const action = primaryAction(actor);
  return (
    <article className={`actor-card ${compact ? "actor-card-compact" : ""}`}>
      <div className="actor-card-topline">
        <span style={{ ...mono, color: T.blue }}>{actor.actorTypeLabel}</span>
        <span style={{ ...mono, color: T.faint }}>Reviewed {actor.lastReviewed}</span>
      </div>
      <h3>{actor.name}</h3>
      <p className="actor-card-tagline">{actor.tagline}</p>
      {!compact && <p className="actor-card-intro">{actor.introduction}</p>}
      <dl className="actor-card-facts">
        <div>
          <dt>Where</dt>
          <dd>{actor.primaryGeography}</dd>
        </div>
        <div>
          <dt>Connected missions</dt>
          <dd>{actor.missionIds.join(" · ")}</dd>
        </div>
        {!compact && (
          <div>
            <dt>How it works</dt>
            <dd>{actor.methods.slice(0, 3).join(" · ")}</dd>
          </div>
        )}
      </dl>
      <div className="actor-card-footer">
        <div className="actor-card-links">
          <Link to={`/actors/${actor.slug}`}>OPEN PROFILE →</Link>
          <Link to={atlasHref(actor)}>VIEW IN ATLAS →</Link>
        </div>
        {action && (
          <span style={{ ...mono, color: T.dim }}>
            {ACTOR_ACTION_LABELS[action.type]} available
          </span>
        )}
      </div>
    </article>
  );
}

function CuratedCollection({
  collection,
  index,
}: {
  collection: (typeof ACTOR_COLLECTIONS)[number];
  index: number;
}) {
  const actors = actorsInCollection(collection.id).slice(0, collection.id === "FEATURED" ? 4 : 3);
  if (!actors.length) return null;
  return (
    <section className="actor-collection" aria-labelledby={`collection-${collection.id}`}>
      <div className="actor-collection-heading">
        <div>
          <span style={{ ...mono, color: T.blue }}>{String(index + 1).padStart(2, "0")}_ DISCOVER</span>
          <h2 id={`collection-${collection.id}`}>{collection.title}</h2>
        </div>
        <p>{collection.description}</p>
      </div>
      <div className="actor-collection-grid">
        {actors.map((actor) => (
          <ActorCard actor={actor} compact key={`${collection.id}-${actor.id}`} />
        ))}
      </div>
      <Link className="actor-text-link" to={`/actors?theme=${collection.id}`}>
        EXPLORE THIS COLLECTION →
      </Link>
    </section>
  );
}

function selectValues(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
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
  const method = params.get("method") ?? "";
  const ecosystem = params.get("ecosystem") ?? "";
  const issue = params.get("issue") ?? "";
  const solution = params.get("solution") ?? "";
  const action = params.get("action") ?? "";
  const status = params.get("status") ?? "";
  const theme = params.get("theme") ?? "";

  usePageMetadata({
    title: "Organisations working for a living planet | 4PLANET",
    description:
      "Discover organisations, research infrastructures and field teams protecting life, strengthening rights and building credible solutions.",
    canonicalPath: "/actors",
    ogImage: "/p17/share/organisations.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ORGANISATIONS_ — Working for a living planet",
      url: "https://4planet.org/actors",
      description:
        "Independent 4PLANET profiles connecting ecological organisations to missions, places, species, issues and solutions.",
      isPartOf: { "@type": "WebSite", name: "4PLANET", url: "https://4planet.org/" },
    },
  });

  useEffect(() => {
    let alive = true;
    Promise.resolve()
      .then(() => {
        if (alive) setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setSourceError("The organisation profile source could not be loaded.");
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const values = {
    q: query,
    type: actorType,
    mission,
    geography,
    method,
    ecosystem,
    issue,
    solution,
    action,
    status,
    theme,
  };

  const setFilter = (key: keyof typeof values, value: string) => {
    navigate(`/actors${encodeFilters({ ...values, [key]: value })}`, { replace: true });
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ACTORS.filter((actor) => {
      const haystack = [
        actor.name,
        actor.alternateName ?? "",
        actor.tagline,
        actor.introduction,
        actor.primaryGeography,
        ...actor.missionIds,
        ...actor.methods,
        ...actor.issues,
        ...actor.solutions,
        ...actor.species,
        ...actor.ecosystems,
      ]
        .join(" ")
        .toLowerCase();
      if (needle && !haystack.includes(needle)) return false;
      if (actorType && actor.actorType !== actorType) return false;
      if (mission && !actor.missionIds.includes(mission)) return false;
      if (geography && !actor.primaryGeography.toLowerCase().includes(geography.toLowerCase())) return false;
      if (method && !actor.methods.includes(method)) return false;
      if (ecosystem && !actor.ecosystems.includes(ecosystem)) return false;
      if (issue && !actor.issues.includes(issue)) return false;
      if (solution && !actor.solutions.includes(solution)) return false;
      if (action && !actor.actions.some((item) => item.type === action)) return false;
      if (status && actor.status !== status) return false;
      if (theme && !actor.collections.includes(theme as ActorCollection)) return false;
      return true;
    });
  }, [query, actorType, mission, geography, method, ecosystem, issue, solution, action, status, theme]);

  const activeFilters = Object.entries(values).filter(([, value]) => value);
  const curatedVisible = activeFilters.length === 0;

  return (
    <PublicShell>
      <div className="actors-page">
        <section className="actors-hero">
          <div style={{ ...mono, color: T.blue }}>ORGANISATIONS_ · PRIVATE BETA</div>
          <h1>
            Working for
            <br />a living planet.
          </h1>
          <p className="actors-lede">
            Discover organisations, research infrastructures and field teams protecting life, strengthening
            rights and building credible solutions.
          </p>
          <div className="actor-hero-actions">
            <a href="#all-organisations" className="actor-button actor-button-primary">
              EXPLORE ORGANISATIONS
            </a>
            <Link to="/atlas?mode=actors" className="actor-button">
              EXPLORE ON THE MAP →
            </Link>
            <Link to="/actors?theme=OFFICIAL_SUPPORT_AVAILABLE" className="actor-button">
              ORGANISATIONS YOU CAN SUPPORT →
            </Link>
            <a href="#actor-search" className="actor-button">
              SEARCH
            </a>
          </div>
          <p className="actor-independent-note">{independentProfileNote}</p>
        </section>

        <section className="actor-intro-band" aria-label="Why organisations are included">
          <p>
            The work already happening across the planet should be easier to find, understand and support.
            4PLANET connects each profile to the wider living system while keeping sources, limitations and
            relationship status visible.
          </p>
          <div>
            <strong>{ACTORS.length}</strong>
            <span>private-beta profiles</span>
          </div>
          <div>
            <strong>{ACTORS.reduce((total, actor) => total + actor.claims.length, 0)}</strong>
            <span>source-mapped claims</span>
          </div>
        </section>

        {curatedVisible && (
          <div className="actor-curated">
            {ACTOR_COLLECTIONS.map((collection, index) => (
              <CuratedCollection collection={collection} index={index} key={collection.id} />
            ))}
          </div>
        )}

        <section className="actors-controls" id="actor-search" aria-labelledby="actor-filter-heading">
          <div className="actors-controls-intro">
            <div id="actor-filter-heading" style={{ ...mono, color: T.blue }}>
              SEARCH + EXPLORE
            </div>
            <h2>Find relevant work without ranking it.</h2>
            <p>
              Filters describe role, method and connection. They do not produce a universal score or claim
              that one organisation is best.
            </p>
          </div>
          <div className="actor-filter-grid">
            <label className="actor-field actor-field-wide">
              <span>Search</span>
              <input
                value={query}
                onChange={(event) => setFilter("q", event.target.value)}
                placeholder="Organisation, issue, method, species…"
              />
            </label>
            <label className="actor-field">
              <span>Actor type</span>
              <select value={actorType} onChange={(event) => setFilter("type", event.target.value)}>
                <option value="">All types</option>
                {(Object.entries(ACTOR_TYPE_LABELS) as [ActorType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Mission</span>
              <select value={mission} onChange={(event) => setFilter("mission", event.target.value)}>
                <option value="">All missions</option>
                {selectValues(ACTORS.flatMap((actor) => actor.missionIds)).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Discovery theme</span>
              <select value={theme} onChange={(event) => setFilter("theme", event.target.value)}>
                <option value="">All themes</option>
                {ACTOR_COLLECTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Geography</span>
              <select value={geography} onChange={(event) => setFilter("geography", event.target.value)}>
                <option value="">All geographies</option>
                {["Global", "Tropical", "Norway", "United Kingdom", "United States", "Florida"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Method</span>
              <select value={method} onChange={(event) => setFilter("method", event.target.value)}>
                <option value="">All methods</option>
                {selectValues(ACTORS.flatMap((actor) => actor.methods)).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Ecosystem</span>
              <select value={ecosystem} onChange={(event) => setFilter("ecosystem", event.target.value)}>
                <option value="">All ecosystems</option>
                {selectValues(ACTORS.flatMap((actor) => actor.ecosystems)).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Issue</span>
              <select value={issue} onChange={(event) => setFilter("issue", event.target.value)}>
                <option value="">All issues</option>
                {selectValues(ACTORS.flatMap((actor) => actor.issues)).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Solution</span>
              <select value={solution} onChange={(event) => setFilter("solution", event.target.value)}>
                <option value="">All solutions</option>
                {selectValues(ACTORS.flatMap((actor) => actor.solutions)).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="actor-field">
              <span>Official action</span>
              <select value={action} onChange={(event) => setFilter("action", event.target.value)}>
                <option value="">All actions</option>
                {(Object.entries(ACTOR_ACTION_LABELS) as [ActorActionType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
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
                <button key={key} onClick={() => setFilter(key as keyof typeof values, "")}>
                  {key}: {value} ×
                </button>
              ))}
              <button onClick={() => navigate("/actors", { replace: true })}>Clear all</button>
            </div>
          )}
        </section>

        <section className="actors-results" id="all-organisations" aria-live="polite">
          <div className="actors-results-header">
            <div>
              <span style={{ ...mono, color: T.blue }}>ALL ORGANISATIONS</span>
              <h2>{loading ? "Loading profiles" : `${filtered.length} organisations`}</h2>
            </div>
            <Link to="/atlas?mode=actors" className="actor-text-link">
              EXPLORE SPATIALLY IN ATLAS →
            </Link>
          </div>
          {loading && (
            <div className="actor-state">
              <Status tone="amber">LOADING</Status>
              <p>Loading the controlled private-beta profile set.</p>
            </div>
          )}
          {sourceError && (
            <div className="actor-state">
              <Status tone="red">SOURCE UNAVAILABLE</Status>
              <p>{sourceError}</p>
            </div>
          )}
          {!loading && !sourceError && filtered.length === 0 && (
            <div className="actor-state">
              <Status tone="amber">NO RESULTS</Status>
              <p>No profiles match the current filters. Remove one or more filters to continue.</p>
            </div>
          )}
          {!loading && !sourceError && filtered.length > 0 && (
            <div className="actor-card-grid">
              {filtered.map((actor) => (
                <ActorCard key={actor.id} actor={actor} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}

function SignatureVisualisation({ actor }: { actor: ActorProfile }) {
  return (
    <section className={`actor-signature actor-signature-${actor.visualisation.kind.toLowerCase()}`}>
      <div className="actor-signature-copy">
        <span style={{ ...mono, color: T.blue }}>4PLANET_ SIGNATURE VIEW</span>
        <h2>{actor.visualisation.title}</h2>
        <p>{actor.visualisation.caption}</p>
      </div>
      <div className="actor-signature-system" aria-label={`${actor.name} operating model`}>
        {actor.visualisation.nodes.map((node, index) => (
          <div className="actor-signature-node" key={node}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{node}</strong>
            {index < actor.visualisation.nodes.length - 1 && <i aria-hidden>→</i>}
          </div>
        ))}
      </div>
      <div className="actor-signature-geographies">
        {actor.geographies.map((item) => (
          <div key={item.id}>
            <span style={mono}>{item.role.replaceAll("_", " ")}</span>
            <strong>{item.label}</strong>
            <small>{item.precision.replaceAll("_", " ")} · {item.sensitivity}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShareCard({ actor }: { actor: ActorProfile }) {
  return (
    <div className="actor-share-card" aria-label={`Share card for ${actor.name}`}>
      <div className="actor-share-grid" aria-hidden />
      <div className="actor-share-top">
        <span>4PLANET_ / ORGANISATIONS_</span>
        <span>INDEPENDENT PROFILE</span>
      </div>
      <div className="actor-share-copy">
        <span>{actor.actorTypeLabel}</span>
        <h3>{actor.name}</h3>
        <p>{actor.tagline}</p>
      </div>
      <div className="actor-share-bottom">
        <span>{actor.missionIds.slice(0, 3).join(" · ")}</span>
        <span>4PLANET.ORG{actor.seo.canonicalPath.toUpperCase()}</span>
      </div>
    </div>
  );
}

function ClaimCorrectionForm({ actor }: { actor: ActorProfile }) {
  const [receipt, setReceipt] = useState<ActorReviewReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReceipt(null);
    setError(null);
    setSubmitting(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const request: ActorReviewRequest = {
      actorId: actor.id,
      actorSlug: actor.slug,
      requestType: String(form.get("requestType") ?? "CORRECTION") as ActorReviewRequestType,
      requestorName: String(form.get("requestorName") ?? ""),
      requestorRole: String(form.get("requestorRole") ?? ""),
      officialEmail: String(form.get("officialEmail") ?? ""),
      organisationDomain: String(form.get("organisationDomain") ?? ""),
      authorisationContext: String(form.get("authorisationContext") ?? ""),
      affectedSection: String(form.get("affectedSection") ?? ""),
      proposedChange: String(form.get("proposedChange") ?? ""),
      evidenceReferences: String(form.get("evidenceReferences") ?? ""),
      attachmentReference: String(form.get("attachmentReference") ?? ""),
      consent: true,
      privacyAcknowledged: true,
    };

    try {
      const result = await submitActorReviewRequest(request);
      setReceipt(result);
      if (result.persisted) formElement.reset();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The request could not be prepared.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="actor-form-section" aria-labelledby="actor-review-title">
      <div>
        <span style={{ ...mono, color: T.blue }}>PROFILE CLAIMS + CORRECTIONS</span>
        <h2 id="actor-review-title">Help keep this profile accurate.</h2>
        <p>
          Requests enter an internal editorial process. They never change profile content automatically,
          create verification or activate partner status.
        </p>
        <div className="actor-review-path">
          {["Received", "Identity check", "Evidence review", "Editorial decision", "Audit record"].map(
            (item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="actor-form-panel">
        <div className="actor-form-gate">
          <Status tone="amber">STAGING GATE</Status>
          <p>
            The secure endpoint is disabled unless explicitly configured. Contact details are never stored
            in localStorage or sessionStorage.
          </p>
        </div>
        {receipt && (
          <div className="actor-form-confirmation" role="status">
            <Status tone={receipt.persisted ? "green" : "amber"}>{receipt.status}</Status>
            <h3>{receipt.persisted ? "Received for review." : "Secure submission remains closed."}</h3>
            <p>{receipt.message}</p>
            <small>Reference: {receipt.requestId}</small>
          </div>
        )}
        {error && (
          <div className="actor-form-error" role="alert">
            <strong>Review the request.</strong>
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={submit} className="actor-form">
          <label>
            <span>Request type</span>
            <select name="requestType" required>
              <option value="CLAIM">Claim profile</option>
              <option value="CORRECTION">Correction</option>
              <option value="URGENT_CORRECTION">Urgent correction</option>
              <option value="REMOVAL">Removal request</option>
              <option value="DISPUTE">Dispute</option>
              <option value="APPEAL">Appeal</option>
            </select>
          </label>
          <label>
            <span>Affected section</span>
            <input name="affectedSection" placeholder="Identity, geography, claim ID…" />
          </label>
          <label>
            <span>Name</span>
            <input required name="requestorName" autoComplete="name" />
          </label>
          <label>
            <span>Role</span>
            <input required name="requestorRole" />
          </label>
          <label>
            <span>Official email</span>
            <input required type="email" name="officialEmail" autoComplete="email" />
          </label>
          <label>
            <span>Organisation domain</span>
            <input required name="organisationDomain" placeholder="example.org" />
          </label>
          <label className="actor-form-wide">
            <span>Authorisation context</span>
            <textarea required name="authorisationContext" rows={3} />
          </label>
          <label className="actor-form-wide">
            <span>Requested change</span>
            <textarea required name="proposedChange" rows={5} />
          </label>
          <label className="actor-form-wide">
            <span>Evidence or source references</span>
            <textarea name="evidenceReferences" rows={3} placeholder="Official URL, registry record or document reference" />
          </label>
          <label className="actor-form-wide">
            <span>Attachment reference</span>
            <input name="attachmentReference" placeholder="Internal reference only — no public upload" />
          </label>
          <label className="actor-form-consent actor-form-wide">
            <input required type="checkbox" name="consent" />
            <span>
              I confirm that the information is submitted for internal factual review and does not grant
              editing access, verification or partnership status.
            </span>
          </label>
          <label className="actor-form-consent actor-form-wide">
            <input required type="checkbox" name="privacyAcknowledged" />
            <span>I understand that external submission remains closed until the secure endpoint is approved.</span>
          </label>
          <button className="actor-button actor-button-primary actor-form-wide" type="submit" disabled={submitting}>
            {submitting ? "CHECKING REQUEST…" : "CHECK SECURE REVIEW PATH"}
          </button>
        </form>
      </div>
    </section>
  );
}

function ProfileSection({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`actor-profile-section ${className}`}>
      <span style={{ ...mono, color: T.blue }}>{eyebrow}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ActorProfilePage() {
  const { slug } = useParams();
  const actor = actorBySlug(slug);
  const [shareState, setShareState] = useState<"IDLE" | "SHARED" | "COPIED" | "FAILED">("IDLE");

  const structuredData = useMemo(
    () =>
      actor
        ? {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": actor.actorType === "COALITION" ? "Organization" : "NonprofitOrganization",
                name: actor.name,
                alternateName: actor.alternateName,
                legalName: actor.legalName,
                foundingDate: actor.founded,
                url: actor.officialUrl,
                sameAs: actor.seo.sameAs,
                areaServed: actor.seo.areaServed,
                knowsAbout: actor.seo.knowsAbout,
                description: actor.introduction,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "4PLANET", item: "https://4planet.org/" },
                  { "@type": "ListItem", position: 2, name: "Organisations", item: "https://4planet.org/actors" },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: actor.name,
                    item: `https://4planet.org${actor.seo.canonicalPath}`,
                  },
                ],
              },
            ],
          }
        : undefined,
    [actor],
  );

  usePageMetadata({
    title: actor?.seo.title ?? "Organisation profile | 4PLANET",
    description: actor?.seo.description ?? "Independent organisation profile.",
    canonicalPath: actor?.seo.canonicalPath ?? "/actors",
    ogImage: actor?.seo.ogImage,
    structuredData,
  });

  if (!actor) return <NotFound />;

  const share = async () => {
    const url = `https://4planet.org${actor.seo.canonicalPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: actor.seo.title, text: actor.tagline, url });
        setShareState("SHARED");
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("COPIED");
      }
      window.setTimeout(() => setShareState("IDLE"), 1800);
    } catch {
      setShareState("FAILED");
      window.setTimeout(() => setShareState("IDLE"), 1800);
    }
  };

  const relatedActors = actor.relatedActorIds
    .map((id) => actorById(id))
    .filter((item): item is ActorProfile => Boolean(item));

  return (
    <PublicShell>
      <div className="actor-profile">
        <section className="actor-profile-hero">
          <Link to="/actors" className="actor-back">
            ← ORGANISATIONS_
          </Link>
          <div className="actor-profile-kicker">
            <span>{actor.actorTypeLabel}</span>
            <span>{actor.primaryGeography}</span>
            <span>Reviewed {actor.lastReviewed}</span>
          </div>
          <h1>{actor.name}</h1>
          <p className="actor-profile-tagline">{actor.tagline}</p>
          <p className="actor-profile-intro">{actor.introduction}</p>
          <p className="actor-independent-note">{independentProfileNote}</p>
          <div className="actor-profile-actions">
            <a
              href={actor.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="actor-button actor-button-primary"
              data-outbound-actor={actor.id}
            >
              OFFICIAL WEBSITE ↗
            </a>
            <Link to={atlasHref(actor)} className="actor-button">
              EXPLORE IN ATLAS →
            </Link>
            {primaryAction(actor) && (
              <a
                href={primaryAction(actor).url}
                target="_blank"
                rel="noopener noreferrer"
                className="actor-button"
                data-outbound-actor={actor.id}
                data-action-type={primaryAction(actor).type}
              >
                {primaryAction(actor).label.toUpperCase()} ↗
              </a>
            )}
            <button onClick={share} className="actor-button" type="button">
              {shareState === "SHARED"
                ? "SHARED"
                : shareState === "COPIED"
                  ? "LINK COPIED"
                  : shareState === "FAILED"
                    ? "SHARE UNAVAILABLE"
                    : "SHARE PROFILE"}
            </button>
          </div>
        </section>

        <section className="actor-profile-facts" aria-label="Profile facts">
          <div>
            <span>Actor type</span>
            <strong>{actor.actorTypeLabel}</strong>
          </div>
          <div>
            <span>Primary geography</span>
            <strong>{actor.primaryGeography}</strong>
          </div>
          <div>
            <span>Connected missions</span>
            <strong>{actor.missionIds.join(" · ")}</strong>
          </div>
          <div>
            <span>4PLANET status</span>
            <strong>Independently indexed · Private beta</strong>
          </div>
        </section>

        <SignatureVisualisation actor={actor} />

        <ProfileSection eyebrow="01_ WHY THIS WORK MATTERS" title="A meaningful role in the wider living system.">
          <p className="actor-profile-body-large">{actor.whyItMatters}</p>
        </ProfileSection>

        <ProfileSection eyebrow="02_ WHAT THIS MAKES POSSIBLE" title={actor.whatItMakesPossible}>
          <p className="actor-section-intro">
            This is a 4PLANET editorial interpretation grounded in the profile sources. It is not a
            guaranteed outcome or an organisation-approved claim.
          </p>
        </ProfileSection>

        <ProfileSection eyebrow="03_ WORK + METHOD" title="What it works on — and how.">
          <div className="actor-two-column">
            <div>
              <h3>What it works on</h3>
              <ul>
                {actor.whatItWorksOn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>How it works</h3>
              <ul>
                {actor.howItWorks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="actor-tag-groups">
            <div>
              <span>Issues</span>
              <p>{actor.issues.join(" · ")}</p>
            </div>
            <div>
              <span>Solutions</span>
              <p>{actor.solutions.join(" · ")}</p>
            </div>
            <div>
              <span>Ecosystems</span>
              <p>{actor.ecosystems.join(" · ")}</p>
            </div>
            <div>
              <span>Species</span>
              <p>{actor.species.join(" · ")}</p>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="04_ WHERE IT WORKS" title="Different places mean different things.">
          <p className="actor-section-intro">
            Headquarters, programme regions, partner geographies, project sites and data coverage are
            represented as separate roles. Generalised references are not exact field locations.
          </p>
          <div className="actor-geography-grid">
            {actor.geographies.map((geoItem) => (
              <article key={geoItem.id}>
                <Status tone={geoItem.role === "HEADQUARTERS_REFERENCE" ? "amber" : "blue"}>
                  {geoItem.role.replaceAll("_", " ")}
                </Status>
                <h3>{geoItem.label}</h3>
                <p>{geoItem.description}</p>
                <dl>
                  <div>
                    <dt>Precision</dt>
                    <dd>{geoItem.precision.replaceAll("_", " ")}</dd>
                  </div>
                  <div>
                    <dt>Sensitivity</dt>
                    <dd>{geoItem.sensitivity}</dd>
                  </div>
                </dl>
                <Link className="actor-text-link" to={atlasHref(actor, geoItem.id)}>
                  VIEW THIS REFERENCE IN ATLAS →
                </Link>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="05_ PROGRAMMES + PROJECTS" title="Documented directions of work.">
          <div className="actor-programme-grid">
            {actor.programmes.map((item) => (
              <article key={item.id}>
                <span style={{ ...mono, color: T.blue }}>{item.id}</span>
                <h3>{item.name}</h3>
                <p>{item.summary}</p>
                <div className="actor-source-mini">
                  Sources: {item.sourceIds.map((id) => actorSource(actor, id)?.label ?? id).join(" · ")}
                </div>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="06_ CONNECTED SYSTEM" title="Missions, issues and solutions connected to the work.">
          <div className="actor-relationship-grid">
            {actor.relationships.map((item) => {
              const content = (
                <>
                  <span style={{ ...mono, color: T.blue }}>{item.kind}</span>
                  <h3>{item.label}</h3>
                  <p>
                    {item.evidenceState} evidence · {item.sourceIds.map((id) => actorSource(actor, id)?.label ?? id).join(" · ")}
                  </p>
                </>
              );
              return item.href ? (
                <Link key={item.id} to={item.href}>
                  {content}
                </Link>
              ) : (
                <article key={item.id}>{content}</article>
              );
            })}
          </div>
          <div className="actor-two-column actor-connections">
            <div>
              <h3>Related missions</h3>
              <div className="actor-link-stack">
                {actor.missionIds.map((missionId) => (
                  <Link
                    key={missionId}
                    to={`/missions/${
                      MISSION_SLUGS[missionId] ??
                      missionId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                    }`}
                  >
                    {missionId} →
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3>Related organisations</h3>
              <div className="actor-link-stack">
                {relatedActors.length ? (
                  relatedActors.map((related) => (
                    <Link key={related.id} to={`/actors/${related.slug}`}>
                      {related.name} →
                    </Link>
                  ))
                ) : (
                  <p>Relationships remain under review.</p>
                )}
              </div>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="07_ EVIDENCE + TRANSPARENCY" title="Claims, sources and boundaries.">
          <div className="actor-claim-list">
            {actor.claims.map((claim) => (
              <article key={claim.id}>
                <div className="actor-claim-head">
                  <span style={{ ...mono, color: T.blue }}>
                    {claim.id} · {claim.section}
                  </span>
                  <Status tone={claim.evidenceState === "STRONG" ? "green" : "amber"}>
                    {claim.evidenceState}
                  </Status>
                </div>
                <h3>{claim.text}</h3>
                <p>
                  <strong>State:</strong> {claim.claimState.replaceAll("_", " ")}
                </p>
                {claim.limitation && (
                  <p className="actor-claim-limit">
                    <strong>Boundary:</strong> {claim.limitation}
                  </p>
                )}
                <div className="actor-claim-sources">
                  {claim.sourceIds.map((sourceId) => {
                    const item = actorSource(actor, sourceId);
                    return item ? (
                      <a key={sourceId} href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.label} ↗
                      </a>
                    ) : (
                      <span key={sourceId}>{sourceId}</span>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="08_ LIMITATIONS + OPEN QUESTIONS" title="What this profile does not establish.">
          <ul className="actor-limitations">
            {actor.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ProfileSection>

        <ProfileSection eyebrow="09_ OFFICIAL ACTIONS" title="Continue through the organisation's own channels.">
          <p className="actor-section-intro">
            4PLANET does not collect payment, convert these actions into Impact Units or imply that funds
            pass through 4PLANET.
          </p>
          <div className="actor-action-grid">
            {actor.actions.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                data-outbound-actor={actor.id}
                data-action-type={item.type}
              >
                <span style={{ ...mono, color: T.blue }}>{ACTOR_ACTION_LABELS[item.type]}</span>
                <h3>{item.label} ↗</h3>
                <p>{item.description}</p>
              </a>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="10_ SHARE" title="Make important work easier to discover.">
          <p className="actor-section-intro">
            The card is generated by 4PLANET without using an organisation logo, campaign graphic or
            unlicensed photograph.
          </p>
          <ShareCard actor={actor} />
          <button className="actor-button" onClick={share} type="button">
            SHARE INDEPENDENT PROFILE
          </button>
        </ProfileSection>

        <ProfileSection eyebrow="11_ ABOUT THIS PROFILE" title="Independent, source-aware and correctable.">
          <div className="actor-method-grid">
            <div>
              <span>Profile status</span>
              <strong>INDEXED · PRIVATE BETA · NOINDEX</strong>
            </div>
            <div>
              <span>Last reviewed</span>
              <strong>{actor.lastReviewed}</strong>
            </div>
            <div>
              <span>Material claims</span>
              <strong>{actor.claims.length}</strong>
            </div>
            <div>
              <span>Official sources</span>
              <strong>{actor.sources.length}</strong>
            </div>
          </div>
          <p className="actor-section-intro">{independentProfileNote}</p>
          <div className="actor-source-register">
            {actor.sources.map((item) => (
              <article key={item.id}>
                <div>
                  <span style={{ ...mono, color: T.blue }}>{item.id}</span>
                  <Status tone={item.rightsStatus === "ACCEPTABLE" ? "green" : "amber"}>
                    {item.rightsStatus}
                  </Status>
                </div>
                <h3>{item.label}</h3>
                <p>
                  {item.sourceClass} · Retrieved {item.retrievedAt} · {item.visibility}
                </p>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  OPEN SOURCE ↗
                </a>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ClaimCorrectionForm actor={actor} />
      </div>
    </PublicShell>
  );
}
