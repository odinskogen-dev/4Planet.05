/* ACTOR PROFILE — organisations as first-class records, fair enough that the
   organisation itself would recognise and want to complete it.
   P1 name · P2 what / where / relationship state · P3 projects + official routes · P4 sources. */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { AtlasEmbed } from "@/earth/AtlasEmbed";
import { actorRoleLabel, humanise, shortDate, type ImpactActor, type ImpactIndex } from "@/impact/livingActionNetworkGraph";
import { impactRoutes } from "@/impact/livingActionNetworkClient";
import { REVIEW_STATES, reviewStateLabel } from "@/impact/reviewModel";
import { impactAtlasView } from "./atlas";
import { CapsuleLink, ClaimList, Facts, Kicker, Meta, OnThisPage, ProjectGrid, Provenance, RuledRow, SaveButton, SectionHead, SourceTable, markOf } from "./primitives";

const CORRECTIONS = "hello@4planet.org";

export function ActorTemplate({ actor, idx }: { actor: ImpactActor; idx: ImpactIndex }) {
  const projects = idx.projectsForActor(actor);
  const places = idx.placesForProjects(projects);
  const issues = idx.issuesForProjects(projects);
  const solutions = idx.solutionsForProjects(projects);
  const roles = Array.from(new Set(projects.flatMap((project) => project.actorRoles.filter((role) => role.id === actor.id).map((role) => actorRoleLabel(role.predicate)))));
  const actions = projects.flatMap((project) => idx.actionsOf(project)).filter((action, i, all) => action.url && all.findIndex((other) => other.url === action.url) === i);
  const claims = [...actor.evidence, ...projects.flatMap((project) => project.evidence)];
  const sources = idx.sourcesFor(claims);
  const lastChecked = claims.map((item) => item.checkedAt).filter(Boolean).sort().pop() || actor.updatedAt;
  const isPartner = actor.relationshipState === "partner";
  const atlasView = impactAtlasView({ title: places[0]?.name || actor.name, entityId: actor.id, places, description: "Where this organisation’s published projects work, in the shared 4PLANET ATLAS." });

  useEffect(() => {
    trackEvent("impact_actor_view", { actor_id: actor.id, project_count: projects.length });
  }, [actor.id, projects.length]);

  const correctionHref = `mailto:${CORRECTIONS}?subject=${encodeURIComponent("IMPACT record correction — " + actor.name)}&body=${encodeURIComponent("Record: " + actor.id + "\nWhat should change, and the source for it:\n")}`;

  const compactNames = (names: string[], max = 3) => names.length > max ? `${names.slice(0, max).join(", ")} +${names.length - max} more` : names.join(", ");
  const placeSummary = compactNames(places.map((place) => place.name)) || "Not yet published";
  const issueSummary = compactNames(issues.map((issue) => issue.name)) || "Not yet published";
  const onPage: [string, string][] = [["actor-projects", "Projects"]];
  if (atlasView || places.length) onPage.push(["actor-where", "Places"]);
  if (issues.length) onPage.push(["actor-issues", "Issues"]);
  onPage.push(["actor-evidence", "Evidence"]);
  if (actions.length) onPage.push(["actor-act", "Official routes"]);
  onPage.push(["actor-record", "About this record"]);
  let sectionNumber = 0;
  const next = () => String(++sectionNumber).padStart(2, "0");

  return (
    <article className="iu iu-profile iu-actor">
      <header className="iu-band">
        <div className="iu-wrap">
          <nav className="iu-crumbs iu-crumbs--inverse" aria-label="Breadcrumb">
            <Link to={impactRoutes.home}>Impact</Link><span aria-hidden>/</span><span>Organisations</span>
          </nav>
          <Kicker inverse>{["Organisation", humanise(actor.actorType)].filter(Boolean).join(" · ")}</Kicker>
          <h1>{actor.name}</h1>
          {actor.description && <p className="iu-band__lead">{actor.description}</p>}
          <dl className="iu-band__facts">
            <div><dt>Projects</dt><dd>{projects.length}</dd></div>
            <div><dt>Where</dt><dd>{placeSummary}</dd></div>
            <div><dt>Issues</dt><dd>{issueSummary}</dd></div>
            <div><dt>Relationship</dt><dd>{isPartner ? "4PLANET partner" : "Public record — not a 4PLANET partner"}</dd></div>
          </dl>
          <div className="iu-actions">
            {actor.website && <CapsuleLink href={actor.website} tone="white" onClick={() => trackEvent("impact_external_action", { actor_id: actor.id, action_type: "website" })}>Official website</CapsuleLink>}
            <SaveButton id={actor.id} type="ACTOR" label={actor.name} sub={humanise(actor.actorType)} inverse />
          </div>
        </div>
      </header>

      <OnThisPage items={onPage} />

      <div className="iu-wrap iu-profile__layout">
        <aside className="iu-profile__aside" aria-label="At a glance">
          <h2 className="iu-aside-title">At a glance</h2>
          <Facts
            rows={[
              ["Type", humanise(actor.actorType) || null],
              ["Role in projects", roles.join(", ") || null],
              ["Methods", solutions.length ? solutions.map((solution) => <Link key={solution.id} to={impactRoutes.solution(solution.slug)}>{solution.name}</Link>) : null],
              ["Sources", String(sources.length)],
              ["Last checked", shortDate(lastChecked)],
              ["Record", <span key="r" className="iu-mono">{actor.id}</span>],
            ]}
          />
        </aside>

        <div className="iu-profile__main">
          <section className="iu-block" aria-labelledby="actor-projects">
            <SectionHead index={next()} title="Projects" id="actor-projects" lead={projects.length ? undefined : "No project linked to this organisation has passed the publication gate yet."} />
            {projects.length > 0 && <ProjectGrid projects={projects} idx={idx} surface="actor" label={`Projects involving ${actor.name}`} />}
          </section>

          {(atlasView || places.length > 0) && (
            <section className="iu-block" aria-labelledby="actor-where">
              <SectionHead index={next()} title="Where they work" id="actor-where" lead={placeSummary} />
              {atlasView && <div className="iu-atlas" onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) trackEvent("impact_atlas_open", { actor_id: actor.id }); }}><AtlasEmbed view={atlasView} /></div>}
            </section>
          )}

          {issues.length > 0 && (
            <section className="iu-block" aria-labelledby="actor-issues">
              <SectionHead index={next()} title="Issues addressed" id="actor-issues" />
              <ul className="iu-rows">
                {issues.map((issue) => (
                  <RuledRow key={issue.id} to={impactRoutes.issue(issue.slug)} title={issue.name} mark={markOf(issue.domain)} line={issue.description || undefined} onOpen={() => trackEvent("impact_issue_open", { issue_id: issue.id, surface: "actor" })} />
                ))}
              </ul>
            </section>
          )}

          <section className="iu-block" aria-labelledby="actor-evidence">
            <SectionHead index={next()} title="What the sources establish" id="actor-evidence" lead="Claims about the organisation itself, then the claims on its published projects." />
            {actor.evidence.length > 0 ? <ClaimList claims={actor.evidence} subjectId={actor.id} /> : <p className="iu-note">No organisation-level claims are published yet; project claims are listed on each project.</p>}
            <SourceTable claims={sources} subjectId={actor.id} />
          </section>

          {actions.length > 0 && (
            <section className="iu-block" aria-labelledby="actor-act">
              <SectionHead index={next()} title="Official routes" id="actor-act" />
              <div className="iu-actions iu-actions--stack">
                {actions.map((action) => action.url ? (
                  <CapsuleLink key={action.id} href={action.url} onClick={() => trackEvent("impact_external_action", { actor_id: actor.id, action_type: action.actionType || "external" })}>{action.name}</CapsuleLink>
                ) : null)}
              </div>
              <p className="iu-boundary">These open on the organisation’s own site. 4PLANET does not process or claim credit for them.</p>
            </section>
          )}

          <section className="iu-block" aria-labelledby="actor-record">
            <SectionHead index={next()} title="About this record" id="actor-record" />
            <ul className="iu-relationship">
              {REVIEW_STATES.filter((state) => state.group === "RELATIONSHIP").map((state) => (
                <li key={state.key} className={isPartner ? "is-on" : ""}><strong>{reviewStateLabel(state.key)}</strong> — {isPartner ? "a current agreement is recorded." : state.reserved}</li>
              ))}
              <li><strong>Listing</strong> — inclusion reflects public sources, not endorsement, ranking or payment.</li>
            </ul>
            <p className="iu-prose-small">
              Is this your organisation? Corrections are checked against sources before anything changes, and sending one does not create a relationship.{" "}
              <a href={correctionHref} onClick={() => trackEvent("impact_actor_correction_open", { actor_id: actor.id })}>Send a correction</a>
            </p>
            <Meta>Record {actor.id}</Meta>
          </section>
        </div>
      </div>
      <div className="iu-wrap"><Provenance idx={idx} /></div>
    </article>
  );
}
