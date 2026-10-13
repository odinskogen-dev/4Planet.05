import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { AtlasEmbed } from "@/earth/AtlasEmbed";
import { trackEvent } from "@/analytics/Analytics";
import {
  impactActorSlug,
  impactProjectSlug,
  readImpactLan,
  type ImpactLanPayload,
  type ImpactLanProject,
} from "@/impact/livingActionNetworkClient";
import "@/styles/impact-living-action-network.css";

const ISSUE_VISUAL: Record<string, string> = {
  "CORAL_": "/assets/impact/restore-coral/hero.jpg",
  "FOREST_": "/assets/missions/clim4te/hero.jpg",
  "PLASTIC_": "/assets/domains/oce4n/hero.jpg",
  "ALL_": "/assets/missions/rewild/hero.jpg",
};

const ISSUE_LABEL: Record<string, string> = {
  "CORAL_": "Restore reefs and connected coasts",
  "FOREST_": "Restore living land and food systems",
  "PLASTIC_": "Reduce and remove persistent pollution",
  "ALL_": "Browse the connected action network",
};

function useImpactLan() {
  const [payload, setPayload] = useState<ImpactLanPayload | null>(null);
  const [state, setState] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  useEffect(() => {
    let alive = true;
    readImpactLan()
      .then((next) => {
        if (!alive) return;
        setPayload(next);
        setState("READY");
      })
      .catch(() => {
        if (!alive) return;
        setPayload(null);
        setState("ERROR");
      });
    return () => { alive = false; };
  }, []);
  return { payload, state };
}

function LoadingState() {
  return <section className="ilan-state"><span>4PLANET IMPACT_</span><h1>Connecting to NATUREBRAIN…</h1></section>;
}

function ErrorState() {
  return (
    <section className="ilan-state ilan-state--error">
      <span>SOURCE STATE_</span>
      <h1>Impact intelligence is temporarily unavailable.</h1>
      <p>No project claims are shown from a stale parallel copy. Try again shortly or continue to ATLAS.</p>
      <Link to="/atlas">OPEN ATLAS →</Link>
    </section>
  );
}

function ProjectTile({ project }: { project: ImpactLanProject }) {
  const slug = impactProjectSlug(project.id);
  const actorSlug = project.actor ? impactActorSlug(project.actor.id) : "";
  return (
    <article className="ilan-project">
      <Link className="ilan-project__visual" to={"/impact/project/" + slug} onClick={() => trackEvent("impact_project_open", { project_id: project.id, surface: "collection" })}>
        <img src={project.image_path} alt={project.issue_label + " — issue-family visual, not project evidence"} loading="lazy" decoding="async" />
        <span>ISSUE VISUAL · NOT PROJECT EVIDENCE</span>
      </Link>
      <div className="ilan-project__meta"><span>{project.issue_short}</span><span>{project.year_label}</span></div>
      <Link className="ilan-project__title" to={"/impact/project/" + slug}>{project.name}</Link>
      {project.actor && <Link className="ilan-project__actor" to={"/impact/actors/" + actorSlug}>{project.actor.name} ↗</Link>}
      <p>{project.coverage_note || project.place?.name || "Place context available in profile"}</p>
      <div className="ilan-project__foot"><span>{project.review_state}</span><Link to={"/impact/project/" + slug} aria-label={"Open " + project.name}>→</Link></div>
    </article>
  );
}

function TruthRail({ payload }: { payload: ImpactLanPayload }) {
  return (
    <section className="ilan-truth" aria-label="Impact truth boundaries">
      <div><span>TRUTH MODEL_</span><strong>Different claims need different proof.</strong></div>
      <div className="ilan-truth__items">
        {payload.truth_boundaries.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}</p>)}
      </div>
    </section>
  );
}

export function ImpactLivingActionNetwork() {
  const { payload, state } = useImpactLan();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const issue = (params.get("issue") || "ALL_").toUpperCase();

  const issueKeys = useMemo(() => {
    if (!payload) return ["ALL_"];
    return ["ALL_", ...Array.from(new Set(payload.projects.map((project) => project.issue_short))).filter(Boolean)];
  }, [payload]);

  const visible = useMemo(() => {
    if (!payload) return [];
    const needle = query.trim().toLowerCase();
    return payload.projects.filter((project) => {
      const issueMatch = issue === "ALL_" || project.issue_short === issue;
      const queryMatch = !needle || [
        project.name,
        project.actor?.name,
        project.place?.name,
        project.coverage_note,
        project.solution?.name,
        project.issue_label,
      ].filter(Boolean).join(" ").toLowerCase().includes(needle);
      return issueMatch && queryMatch;
    });
  }, [payload, issue, query]);

  const setIssue = (next: string) => {
    const copy = new URLSearchParams(params);
    if (next === "ALL_") copy.delete("issue");
    else copy.set("issue", next.replace(/_$/, "").toLowerCase());
    setParams(copy);
    trackEvent("impact_issue_filter", { issue: next });
  };

  useEffect(() => {
    if (state === "READY") trackEvent("impact_discovery_view", { project_count: payload?.projects.length || 0 });
  }, [payload, state]);

  return (
    <PublicShell>
      <Seo
        title="Impact — Find ecological action | 4PLANET"
        description="Discover source-aware ecological projects, actors, places and solutions — with evidence and ways to act kept close."
        path="/impact"
        image="/assets/missions/rewild/hero.jpg"
        imageAlt="Living landscape — 4PLANET Impact"
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "4PLANET Impact",
          description: "Source-aware ecological action discovery connected to NATUREBRAIN and 4PLANET ATLAS.",
          url: canonicalUrl,
          isPartOf: { "@type": "WebSite", name: "4PLANET", url: new URL("/", canonicalUrl).toString() },
        })}
      />
      <main className="ilan" id="main-content">
        <section className="ilan-hero">
          <img src="/assets/missions/rewild/hero.jpg" alt="" aria-hidden="true" />
          <span className="ilan-hero__scrim" aria-hidden="true" />
          <div className="ilan-hero__copy">
            <p>4PLANET IMPACT_</p>
            <h1>Find people<br />bringing life back.</h1>
            <span>Projects · actors · solutions · evidence · action</span>
          </div>
        </section>

        {state === "LOADING" && <LoadingState />}
        {state === "ERROR" && <ErrorState />}
        {state === "READY" && payload && (
          <>
            <section className="ilan-intro">
              <div><span>DISCOVER ECOLOGICAL ACTION_</span><h2>Start with the problem.<br />Find who is doing the work.</h2></div>
              <p>Explore real ecological work by problem, place, organisation and solution. Open a profile when you want the evidence, original sources and action route.</p>
            </section>

            <section className="ilan-families" aria-label="Browse Impact by issue">
              {issueKeys.map((key) => (
                <button type="button" key={key} className={issue === key ? "is-active" : ""} onClick={() => setIssue(key)}>
                  <img src={ISSUE_VISUAL[key] || ISSUE_VISUAL.ALL_} alt="" aria-hidden="true" />
                  <span className="ilan-family__scrim" />
                  <span className="ilan-family__copy"><strong>{key}</strong><small>{ISSUE_LABEL[key] || "Explore connected ecological action"}</small></span>
                </button>
              ))}
            </section>

            <section className="ilan-collection">
              <div className="ilan-collection__bar">
                <div><span>{issue === "ALL_" ? "ALL PROJECTS_" : issue}</span><strong>{visible.length} / {payload.projects.length}</strong></div>
                <label><span>SEARCH</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Project, actor, place, solution…" /></label>
              </div>
              <div className="ilan-project-grid">
                {visible.map((project) => <ProjectTile key={project.id} project={project} />)}
              </div>
              {visible.length === 0 && <p className="ilan-empty">No project in this first Gold slice matches that search. That is not evidence that no relevant project exists.</p>}
            </section>

            <section className="ilan-actors">
              <div className="ilan-section-head"><span>ACTORS_</span><h2>Who is doing the work?</h2><p>Public actor profiles connect organisations to projects, places and evidence without turning a listing into an endorsement.</p></div>
              <div className="ilan-actor-list">
                {payload.projects.filter((project) => project.actor).map((project) => (
                  <Link key={project.actor!.id} to={"/impact/actors/" + impactActorSlug(project.actor!.id)} onClick={() => trackEvent("impact_actor_open", { actor_id: project.actor!.id, surface: "collection" })}>
                    <span>{project.actor!.actor_type || "ACTOR"}</span><strong>{project.actor!.name}</strong><small>{project.place?.name || project.coverage_note || "Project context"}</small><b>→</b>
                  </Link>
                ))}
              </div>
            </section>

            <section className="ilan-atlas-callout">
              <div className="ilan-atlas-callout__orb" aria-hidden="true">4</div>
              <div><span>ATLAS_</span><h2>Every action<br />happens somewhere.</h2><p>Impact uses the same first-party ATLAS to keep project, actor and place context connected. No second map.</p><Link to="/atlas">OPEN ATLAS →</Link></div>
            </section>

            <TruthRail payload={payload} />
          </>
        )}
      </main>
    </PublicShell>
  );
}

function ProjectPageBody({ project, payload }: { project: ImpactLanProject; payload: ImpactLanPayload }) {
  const actorSlug = project.actor ? impactActorSlug(project.actor.id) : "";
  const citations = project.evidence.map((item) => item.source_url).filter((url): url is string => Boolean(url));
  const atlasView = project.atlas_place_id ? {
    kind: "IMPACT" as const,
    title: project.place?.name || project.name,
    description: "Geographic context for this public project record.",
    placeId: project.atlas_place_id,
    entityId: project.id,
    limitation: project.place?.geometry_status
      ? "Map context: " + project.place.geometry_status.replaceAll("_", " ") + ". This is not automatically a project, legal or ecological boundary."
      : "Map context is for navigation and does not establish a project, legal or ecological boundary.",
  } : null;

  return (
    <PublicShell>
      <Seo
        title={project.name + " — Impact | 4PLANET"}
        description={project.description}
        path={"/impact/project/" + impactProjectSlug(project.id)}
        image={project.image_path}
        imageAlt={project.issue_label + " — issue-family visual, not project evidence"}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "Project",
          name: project.name,
          description: project.description,
          url: canonicalUrl,
          citation: citations,
          spatialCoverage: project.place ? { "@type": "Place", name: project.place.name } : undefined,
          member: project.actor ? { "@type": "Organization", name: project.actor.name, url: new URL("/impact/actors/" + actorSlug, canonicalUrl).toString() } : undefined,
        })}
      />
      <main className="ilan-profile" id="main-content">
        <header className="ilan-profile__hero">
          <img src={project.image_path} alt={project.issue_label + " — issue-family visual, not project evidence"} />
          <span aria-hidden className="ilan-profile__scrim" />
          <div><p>{project.issue_short} · {project.year_label}</p><h1>{project.name}</h1><span>{project.description}</span></div>
          <small>ISSUE-FAMILY VISUAL · NOT PROJECT EVIDENCE</small>
        </header>

        <div className="ilan-profile__body">
          <section className="ilan-profile__identity">
            <div><span>REVIEW STATE_</span><strong>{project.review_state}</strong></div>
            <div><span>PLACE_</span><strong>{project.coverage_note || project.place?.name || "Context in source record"}</strong></div>
            <div><span>SOLUTION_</span><strong>{project.solution?.name || "See source evidence"}</strong></div>
          </section>

          {project.actor && <section className="ilan-profile__section ilan-profile__actor"><span>WHO IS DOING THE WORK_</span><Link to={"/impact/actors/" + actorSlug}>{project.actor.name} →</Link><p>{project.actor.description}</p></section>}

          <section className="ilan-profile__section"><span>WHAT THE SOURCES ESTABLISH_</span><div className="ilan-evidence">{project.evidence.map((item) => <article key={item.claim_id}><div><b>{item.review_status.replaceAll("_", " ").toUpperCase()}</b><em>{item.evidence_strength.replaceAll("_", " ").toUpperCase()}</em></div><p>{item.statement}</p>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_source_open", { project_id: project.id, source_url: item.source_url || "" })}>{item.source_name || item.citation || "Original source"} ↗</a>}{item.limitations.map((limit) => <small key={limit}>{limit}</small>)}</article>)}</div></section>

          {atlasView && <section className="ilan-profile__section"><span>PLACE / ATLAS_</span><AtlasEmbed view={atlasView} /></section>}

          <section className="ilan-profile__section"><span>ACTION_</span>{project.action?.url ? <a className="ilan-primary-action" href={project.action.url} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_external_action", { project_id: project.id, action_type: project.action?.action_type || "external" })}>{project.action.name} ↗</a> : <p>No public action route is published in this Gold record.</p>}<p className="ilan-boundary">External actions happen on the organisation’s own site. 4PLANET does not process, receive or claim credit for them in this Gold slice.</p></section>

          <TruthRail payload={payload} />
        </div>
      </main>
    </PublicShell>
  );
}

export function ImpactProjectProfilePage() {
  const { slug = "" } = useParams();
  const { payload, state } = useImpactLan();
  if (state === "LOADING") return <PublicShell><LoadingState /></PublicShell>;
  if (state === "ERROR" || !payload) return <PublicShell><ErrorState /></PublicShell>;
  const project = payload.projects.find((item) => impactProjectSlug(item.id) === slug);
  if (!project) return <Navigate to="/impact" replace />;
  useEffect(() => { trackEvent("impact_project_view", { project_id: project.id }); }, [project.id]);
  return <ProjectPageBody project={project} payload={payload} />;
}

export function ImpactActorProfilePage() {
  const { slug = "" } = useParams();
  const { payload, state } = useImpactLan();
  if (state === "LOADING") return <PublicShell><LoadingState /></PublicShell>;
  if (state === "ERROR" || !payload) return <PublicShell><ErrorState /></PublicShell>;
  const related = payload.projects.filter((project) => project.actor && impactActorSlug(project.actor.id) === slug);
  const actor = related[0]?.actor;
  if (!actor) return <Navigate to="/impact" replace />;
  const citations = Array.from(new Set(related.flatMap((project) => project.evidence.map((item) => item.source_url).filter((url): url is string => Boolean(url)))));
  useEffect(() => { trackEvent("impact_actor_view", { actor_id: actor.id }); }, [actor.id]);

  return (
    <PublicShell>
      <Seo
        title={actor.name + " — Actor | 4PLANET Impact"}
        description={actor.description || "Public actor record in the 4PLANET Impact graph."}
        path={"/impact/actors/" + slug}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: actor.name,
          description: actor.description,
          url: canonicalUrl,
          citation: citations,
        })}
      />
      <main className="ilan-actor-profile" id="main-content">
        <header><span>ACTOR_ / PUBLIC RECORD</span><h1>{actor.name}</h1><p>{actor.actor_type?.replaceAll("_", " ").toUpperCase()}</p><strong>{actor.description}</strong></header>
        <div className="ilan-actor-profile__body">
          <section><span>KNOWN PROJECTS IN THIS GOLD SLICE_</span><div className="ilan-actor-projects">{related.map((project) => <Link key={project.id} to={"/impact/project/" + impactProjectSlug(project.id)}><strong>{project.name}</strong><small>{project.place?.name || project.coverage_note}</small><b>→</b></Link>)}</div></section>
          <section><span>TRUST BOUNDARY_</span><p>This is a public-record actor profile. It does not mean 4PLANET partnership, endorsement, funding, contribution, delivery or ecological outcome verification.</p></section>
          <section><span>SOURCES_</span><div className="ilan-source-list">{citations.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_source_open", { actor_id: actor.id, source_url: url })}>{new URL(url).hostname.replace(/^www\./, "")} ↗</a>)}</div></section>
          <TruthRail payload={payload} />
        </div>
      </main>
    </PublicShell>
  );
}

export default ImpactLivingActionNetwork;
