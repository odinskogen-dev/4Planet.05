/* IMPACT HOME — browse first, not dashboard first.
   P1 living-world hero + the question · P2 the dense project index · P3 open a project / search ·
   P4 issues, organisations, methods, place, review method. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { AtlasEmbed } from "@/earth/AtlasEmbed";
import { humanise, searchGraph, type ImpactIndex, type ImpactSearchHit } from "@/impact/livingActionNetworkGraph";
import { impactRoutes } from "@/impact/livingActionNetworkClient";
import { INDEPENDENCE_RULES, REVIEW_STATES, TRUST_SEPARATIONS, reviewStateKey, reviewStateLabel } from "@/impact/reviewModel";
import { ActorRows, Kicker, Meta, ProjectGrid, Provenance, RuledRow, SectionHead, markOf } from "./primitives";

const HERO = { src: "/assets/missions/rewild/hero.jpg", mobile: "/assets/missions/rewild/hero-mobile.jpg" };

function hitHref(hit: ImpactSearchHit) {
  if (hit.kind === "project") return impactRoutes.project(hit.slug);
  if (hit.kind === "actor") return impactRoutes.actor(hit.slug);
  if (hit.kind === "issue") return impactRoutes.issue(hit.slug);
  if (hit.kind === "solution") return impactRoutes.solution(hit.slug);
  return "/atlas";
}

export function HomeTemplate({ idx }: { idx: ImpactIndex }) {
  const { graph } = idx;
  const [params, setParams] = useSearchParams();
  const issueParam = params.get("issue") || "";
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const searchTimer = useRef<number | null>(null);

  // Legacy ?issue=coral (v01 issue shorts) and canonical ?issue=<issue-slug> both resolve.
  const activeIssue = useMemo(() => {
    if (!issueParam) return null;
    const lower = issueParam.toLowerCase();
    return graph.issues.find((issue) => issue.slug === lower)
      ?? graph.issues.find((issue) => graph.projects.some((project) => project.issueIds.includes(issue.id) && (project.issueShort || "").replace(/_$/, "").toLowerCase() === lower))
      ?? null;
  }, [graph, issueParam]);

  const issueRows = useMemo(
    () => graph.issues
      .map((issue) => ({ issue, projects: idx.projectsForIssue(issue) }))
      .sort((a, b) => b.projects.length - a.projects.length || a.issue.name.localeCompare(b.issue.name)),
    [graph, idx],
  );
  const issueFilters = issueRows.filter((row) => row.projects.length > 0).map(({ issue, projects }) => ({ issue, count: projects.length }));
  const issuesWithProjects = issueRows.filter((row) => row.projects.length > 0);
  const issuesWithoutProjects = issueRows.filter((row) => row.projects.length === 0);

  const actorRows = useMemo(
    () => graph.actors
      .map((actor) => ({ actor, count: idx.projectsForActor(actor).length }))
      .sort((a, b) => b.count - a.count || a.actor.name.localeCompare(b.actor.name)),
    [graph, idx],
  );
  const primaryActors = actorRows.slice(0, 16);
  const moreActors = actorRows.slice(16);

  const solutionRows = useMemo(
    () => graph.solutions
      .map((solution) => ({ solution, count: idx.projectsForSolution(solution).length }))
      .sort((a, b) => b.count - a.count || a.solution.name.localeCompare(b.solution.name)),
    [graph, idx],
  );
  const primarySolutions = solutionRows.slice(0, 12);
  const moreSolutions = solutionRows.slice(12);

  const visible = activeIssue ? idx.projectsForIssue(activeIssue) : graph.projects;
  const hits = useMemo(() => searchGraph(idx, query), [idx, query]);
  const projectHits = hits.filter((hit) => hit.kind === "project").map((hit) => idx.projectBySlug(hit.slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const otherHits = hits.filter((hit) => hit.kind !== "project");

  useEffect(() => {
    trackEvent("impact_discovery_view", { project_count: graph.projects.length, actor_count: graph.actors.length, issue_count: graph.issues.length, projection: graph.source });
  }, [graph]);

  useEffect(() => setDraft(query), [query]);

  const commitQuery = (value: string) => {
    const copy = new URLSearchParams(params);
    if (value.trim()) copy.set("q", value.trim());
    else copy.delete("q");
    setParams(copy, { replace: true });
  };

  const onDraft = (value: string) => {
    setDraft(value);
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      commitQuery(value);
      if (value.trim()) {
        const results = searchGraph(idx, value);
        trackEvent("impact_search", { term_count: value.trim().split(/\s+/).length, result_count: results.length });
      }
    }, 260);
  };

  const setIssue = (slug: string | null) => {
    const copy = new URLSearchParams(params);
    if (slug) copy.set("issue", slug);
    else copy.delete("issue");
    setParams(copy, { replace: true });
    trackEvent("impact_issue_filter", { issue: slug || "all" });
  };

  const stateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of graph.projects) {
      const key = reviewStateKey(project.reviewState) ?? "UNASSESSED";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [graph]);

  return (
    <div className="iu iu-home">
      <section className="iu-hero iu-hero--home">
        <picture>
          <source media="(max-width: 700px)" srcSet={HERO.mobile} />
          <img src={HERO.src} alt="" aria-hidden fetchPriority="high" />
        </picture>
        <span className="iu-hero__scrim" aria-hidden />
        <div className="iu-wrap iu-hero__content">
          <Kicker inverse>4PLANET IMPACT</Kicker>
          <h1>Find people bringing life back.</h1>
          <p className="iu-hero__lead">An index of real ecological projects and the organisations doing the work — with what the sources establish, and what they do not.</p>
          <form className="iu-search" role="search" onSubmit={(event) => { event.preventDefault(); commitQuery(draft); document.getElementById("index")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
            <label htmlFor="impact-search" className="iu-visually-hidden">Search projects, organisations, issues, places and methods</label>
            <input
              id="impact-search"
              type="search"
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder="Search coral, Kenya, plastic, an organisation…"
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit">Search</button>
          </form>
          <p className="iu-hero__count">
            {graph.projects.length} projects · {graph.actors.length} organisations · {graph.issues.length} issues — source-aware public records.{" "}
            <Link to={impactRoutes.method}>How records are reviewed</Link>
          </p>
          <nav className="iu-home-jumps" aria-label="Explore IMPACT">
            <a href="#index">Projects</a>
            <a href="#issues">Problems</a>
            <a href="#actors">Organisations</a>
            {graph.solutions.length > 0 && <a href="#methods">Methods</a>}
          </nav>
        </div>
        <span className="iu-hero__label" aria-hidden>Issue visual · not project photography</span>
      </section>

      {query ? (
        <section className="iu-section iu-section--index" id="index" aria-label="Search results">
          <div className="iu-wrap">
            <SectionHead
              title={hits.length ? `${hits.length} result${hits.length === 1 ? "" : "s"} for “${query}”` : `Nothing published matches “${query}”`}
              lead={hits.length ? "Projects first, then organisations, issues, methods and places." : "No match is not evidence that no such work exists — only that it has not passed the IMPACT publication gate yet."}
              action={<button type="button" className="iu-textbutton" onClick={() => { setDraft(""); commitQuery(""); }}>Clear search</button>}
            />
            {projectHits.length > 0 && <ProjectGrid projects={projectHits} idx={idx} surface="search" label="Matching projects" />}
            {otherHits.length > 0 && (
              <ul className="iu-rows iu-rows--two iu-rows--spaced">
                {otherHits.map((hit) => (
                  <RuledRow key={hit.kind + hit.id} to={hitHref(hit)} title={hit.name} line={hit.line} meta={humanise(hit.kind === "actor" ? "organisation" : hit.kind === "solution" ? "method" : hit.kind)} />
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : (
        <section className="iu-section iu-section--index" id="index" aria-labelledby="index-title">
          <div className="iu-wrap">
            <header className="iu-index-head">
              <div>
                <h2 id="index-title">{activeIssue ? activeIssue.name : "Projects"}</h2>
                <Meta>{visible.length} of {graph.projects.length} published</Meta>
              </div>
              {activeIssue && <Link className="iu-textlink" to={impactRoutes.issue(activeIssue.slug)} onClick={() => trackEvent("impact_issue_open", { issue_id: activeIssue.id, surface: "index" })}>About this issue →</Link>}
            </header>
            <div className="iu-filters" role="group" aria-label="Filter projects by issue">
              <button type="button" className={!activeIssue ? "is-active" : ""} aria-pressed={!activeIssue} onClick={() => setIssue(null)}>All issues</button>
              {issueFilters.map(({ issue, count }) => (
                <button key={issue.id} type="button" className={activeIssue?.id === issue.id ? "is-active" : ""} aria-pressed={activeIssue?.id === issue.id} onClick={() => setIssue(issue.slug)}>
                  <i aria-hidden style={{ background: markOf(issue.domain) }} />{issue.name}<span>{count}</span>
                </button>
              ))}
            </div>
            <ProjectGrid projects={visible} idx={idx} surface="collection" eagerFirst={4} label={activeIssue ? `Projects addressing ${activeIssue.name}` : "All published projects"} />
          </div>
        </section>
      )}

      <section className="iu-section" id="issues" aria-labelledby="issues-title">
        <div className="iu-wrap">
          <SectionHead
            id="issues-title"
            title="Start with the problem"
            lead="Start with issues that already have published projects. The wider issue map remains available without pretending 4PLANET has found action on every problem yet."
          />
          <ul className="iu-rows iu-rows--two">
            {issuesWithProjects.map(({ issue, projects }) => {
              const actors = idx.actorsForProjects(projects);
              return (
                <RuledRow
                  key={issue.id}
                  to={impactRoutes.issue(issue.slug)}
                  title={issue.name}
                  mark={markOf(issue.domain)}
                  thumb={projects[0]?.media ?? null}
                  line={`${projects.length} project${projects.length === 1 ? "" : "s"} · ${actors.length} organisation${actors.length === 1 ? "" : "s"}`}
                  onOpen={() => trackEvent("impact_issue_open", { issue_id: issue.id, surface: "home" })}
                />
              );
            })}
          </ul>
          {issuesWithoutProjects.length > 0 && (
            <details className="iu-more">
              <summary>Explore {issuesWithoutProjects.length} more source-backed issues without a published project yet</summary>
              <p className="iu-more__lead">These are public problem-intelligence records. A missing project link means IMPACT has not published one yet — not that no work exists.</p>
              <ul className="iu-rows iu-rows--two">
                {issuesWithoutProjects.map(({ issue }) => (
                  <RuledRow
                    key={issue.id}
                    to={impactRoutes.issue(issue.slug)}
                    title={issue.name}
                    mark={markOf(issue.domain)}
                    line={issue.description || "Source-backed issue record"}
                    meta={issue.evidence.length ? `${issue.evidence.length} source-backed claim${issue.evidence.length === 1 ? "" : "s"}` : "Issue record"}
                    onOpen={() => trackEvent("impact_issue_open", { issue_id: issue.id, surface: "home_more" })}
                  />
                ))}
              </ul>
            </details>
          )}
        </div>
      </section>

      <section className="iu-section iu-section--rule" id="actors" aria-labelledby="actors-title">
        <div className="iu-wrap">
          <SectionHead
            id="actors-title"
            title="Who is doing the work"
            lead={`${graph.actors.length} public organisation records. The most connected records are shown first; listing is never endorsement or partnership.`}
          />
          <ActorRows actors={primaryActors.map(({ actor }) => ({ actor }))} idx={idx} surface="home" />
          {moreActors.length > 0 && (
            <details className="iu-more">
              <summary>Show all {graph.actors.length} organisations</summary>
              <ActorRows actors={moreActors.map(({ actor }) => ({ actor }))} idx={idx} surface="home_more" />
            </details>
          )}
        </div>
      </section>

      {graph.solutions.length > 0 && (
        <section className="iu-section iu-section--rule" id="methods" aria-labelledby="methods-title">
          <div className="iu-wrap">
            <SectionHead
              id="methods-title"
              title="Methods in use"
              lead="How the work is done. Solution records are early: method and maturity first; solution-level evidence follows as it is published."
            />
            <ul className="iu-rows iu-rows--three">
              {primarySolutions.map(({ solution, count }) => (
                <RuledRow
                  key={solution.id}
                  to={impactRoutes.solution(solution.slug)}
                  title={solution.name}
                  line={[humanise(solution.solutionType), solution.maturity ? humanise(solution.maturity) : null].filter(Boolean).join(" · ")}
                  meta={`${count} project${count === 1 ? "" : "s"}`}
                  onOpen={() => trackEvent("impact_solution_open", { solution_id: solution.id, surface: "home" })}
                />
              ))}
            </ul>
            {moreSolutions.length > 0 && (
              <details className="iu-more">
                <summary>Show all {graph.solutions.length} methods</summary>
                <ul className="iu-rows iu-rows--three">
                  {moreSolutions.map(({ solution, count }) => (
                    <RuledRow
                      key={solution.id}
                      to={impactRoutes.solution(solution.slug)}
                      title={solution.name}
                      line={[humanise(solution.solutionType), solution.maturity ? humanise(solution.maturity) : null].filter(Boolean).join(" · ")}
                      meta={`${count} project${count === 1 ? "" : "s"}`}
                      onOpen={() => trackEvent("impact_solution_open", { solution_id: solution.id, surface: "home_more" })}
                    />
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>
      )}

      <section className="iu-section iu-section--place" aria-labelledby="place-title">
        <div className="iu-wrap">
          <SectionHead
            id="place-title"
            title="Every project happens somewhere"
            lead={<>IMPACT uses the shared 4PLANET ATLAS. Published work currently connects to {graph.places.length} place records; open the map for geographic context rather than a long place list.</>}
          />
          <div className="iu-atlas" onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) trackEvent("impact_atlas_open", { surface: "home" }); }}>
            <AtlasEmbed view={{ kind: "IMPACT", title: "Where published projects work", description: "Open the shared ATLAS to explore places, species and living systems around this work.", entityId: "impact:4planet:living-action-network", limitation: "World navigation view. Project places are context labels, not boundaries." }} />
          </div>
        </div>
      </section>

      <section className="iu-section iu-section--method" id="method" aria-labelledby="method-head">
        <div className="iu-wrap">
          <SectionHead
            id="method-head"
            title="How records are reviewed"
            lead="There is no single green “verified” badge. Each record shows how far it has been checked — and the states 4PLANET has not earned yet stay reserved."
          />
          <div className="iu-method">
            <ol className="iu-method__states">
              {REVIEW_STATES.map((state) => {
                const count = stateCounts.get(state.key) ?? 0;
                return (
                  <li key={state.key} className={state.reserved ? "is-reserved" : ""}>
                    <strong>{reviewStateLabel(state.key)}</strong>
                    <span>{state.reserved ?? state.meaning}</span>
                    <Meta>{state.reserved ? "Reserved" : state.group === "RECORD" ? `${count} project${count === 1 ? "" : "s"}` : "None recorded"}</Meta>
                  </li>
                );
              })}
            </ol>
            <div className="iu-method__rules">
              <h3>Kept separate, always</h3>
              <ul>{TRUST_SEPARATIONS.map((line) => <li key={line}>{line}</li>)}</ul>
              <h3>Independence</h3>
              <ul>{INDEPENDENCE_RULES.map((line) => <li key={line}>{line}</li>)}</ul>
            </div>
          </div>
          <Provenance idx={idx} />
        </div>
      </section>
    </div>
  );
}
