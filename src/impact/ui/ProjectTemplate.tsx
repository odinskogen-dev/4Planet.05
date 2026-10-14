/* PROJECT PROFILE — the flagship object.
   P1 project name over its (labelled) visual · P2 issue · place · lead organisation · review state ·
   P3 official route / organisation / ATLAS · P4 evidence, limitations, sources. */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { AtlasEmbed } from "@/earth/AtlasEmbed";
import { actorRoleLabel, humanise, shortDate, type ImpactIndex, type ImpactProject } from "@/impact/livingActionNetworkGraph";
import { impactRoutes } from "@/impact/livingActionNetworkClient";
import { notEstablishedFor, reviewStateKey } from "@/impact/reviewModel";
import { impactAtlasView } from "./atlas";
import {
  CapsuleLink,
  ClaimList,
  Facts,
  Kicker,
  MediaFrame,
  Meta,
  NotEstablished,
  OnThisPage,
  ProjectGrid,
  ProofLadder,
  Provenance,
  ReviewMark,
  RuledRow,
  SaveButton,
  SectionHead,
  SourceTable,
  markOf,
} from "./primitives";

export function ProjectTemplate({ project, idx }: { project: ImpactProject; idx: ImpactIndex }) {
  const issues = idx.issuesOf(project);
  const actors = idx.actorsOf(project);
  const lead = idx.leadActorOf(project);
  const places = idx.placesOf(project);
  const solutions = idx.solutionsOf(project);
  const actions = idx.actionsOf(project);
  const related = idx.relatedProjects(project, 8);
  const sources = idx.sourcesFor(project.evidence);
  const placeLabel = project.coverageNote || places.map((place) => place.name).join(", ");
  const lastChecked = project.lastReviewed || project.evidence.map((item) => item.checkedAt).filter(Boolean).sort().pop() || null;
  const externallyReviewed = project.evidence.filter((item) => /external/.test(item.reviewStatus) || /external/.test(item.interpretation));
  const sourceReported = project.evidence.filter((item) => !externallyReviewed.includes(item));
  const atlasView = impactAtlasView({ title: places[0]?.name || project.name, entityId: project.id, atlasPlaceId: project.atlasPlaceId, places, description: "Geographic context for this public project record in the shared 4PLANET ATLAS." });
  const notEstablished = notEstablishedFor({
    reviewState: project.reviewState,
    hasOutcomeEvidence: project.outcomes.length > 0 && reviewStateKey(project.reviewState) === "OUTCOME EVIDENCED",
    hasPartnership: actors.some(({ actor }) => actor.relationshipState === "partner"),
    explicit: project.notEstablished,
  });
  const onPage: [string, string][] = [
    ["why", "Why"], ["what", "What it does"], ["evidence", "Evidence"],
    ...(atlasView || places.length ? [["place", "Place"] as [string, string]] : []),
    ["who", "Who"],
    ...(solutions.length ? [["method", "Method"] as [string, string]] : []),
    ...(project.outcomes.length ? [["outcomes", "Outcomes"] as [string, string]] : []),
    ["act", "Act"], ["sources", "Sources"],
    ...(related.length ? [["related", "Related"] as [string, string]] : []),
  ];
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  useEffect(() => {
    trackEvent("impact_project_view", { project_id: project.id, projection: idx.graph.source });
  }, [project.id, idx.graph.source]);

  const primaryAction = actions.find((action) => action.url);

  return (
    <article className="iu iu-profile">
      <header className="iu-hero iu-hero--profile">
        <MediaFrame media={project.media} className="iu-hero__media" eager sizes="100vw" />
        <span className="iu-hero__scrim" aria-hidden />
        <div className="iu-wrap iu-hero__content">
          <nav className="iu-crumbs" aria-label="Breadcrumb">
            <Link to={impactRoutes.home}>Impact</Link>
            {issues[0] && <><span aria-hidden>/</span><Link to={impactRoutes.issue(issues[0].slug)}>{issues[0].name}</Link></>}
          </nav>
          <h1>{project.name}</h1>
          {(project.summary || project.description) && <p className="iu-hero__lead">{project.summary || project.description}</p>}
          <div className="iu-hero__facts">
            {lead && <Link to={impactRoutes.actor(lead.slug)} onClick={() => trackEvent("impact_actor_open", { actor_id: lead.id, surface: "project_hero" })}>{lead.name}</Link>}
            {placeLabel && <span>{placeLabel}</span>}
            <ReviewMark state={project.reviewState} inverse />
          </div>
          <div className="iu-actions">
            {primaryAction?.url && (
              <CapsuleLink href={primaryAction.url} tone="white" onClick={() => trackEvent("impact_external_action", { project_id: project.id, action_type: primaryAction.actionType || "external", surface: "hero" })}>
                {primaryAction.name}
              </CapsuleLink>
            )}
            <SaveButton id={project.id} type="PROJECT" label={project.name} sub={lead?.name} inverse />
          </div>
        </div>
      </header>

      <OnThisPage items={onPage} />

      <div className="iu-wrap iu-profile__layout">
        <aside className="iu-profile__aside" aria-label="At a glance">
          <h2 className="iu-aside-title">At a glance</h2>
          <Facts
            rows={[
              ["Problem", issues.length ? issues.map((issue) => <Link key={issue.id} to={impactRoutes.issue(issue.slug)}>{issue.name}</Link>) : null],
              ["Place", placeLabel || null],
              ["Lead organisation", lead ? <Link to={impactRoutes.actor(lead.slug)}>{lead.name}</Link> : null],
              ["Type", project.projectType],
              ["Status", [project.statusLabel || project.yearLabel, project.operatingPeriod].filter(Boolean).join(" · ") || null],
              ["Method", solutions.length ? solutions.map((solution) => <Link key={solution.id} to={impactRoutes.solution(solution.slug)}>{solution.name}</Link>) : null],
              ["Review state", <ReviewMark key="r" state={project.reviewState} />],
              ["Last checked", shortDate(lastChecked)],
              ["Official record", project.officialUrl ? <a href={project.officialUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_source_open", { subject_id: project.id, source_host: "official" })}>Open ↗</a> : null],
            ]}
          />
        </aside>

        <div className="iu-profile__main">
          <section className="iu-block" id="why" aria-labelledby="why-h">
            <SectionHead index={next()} title="Why this exists" id="why-h" />
            {issues.length ? issues.map((issue) => (
              <div key={issue.id} className="iu-prose">
                <Kicker mark={markOf(issue.domain)}>{issue.name}</Kicker>
                <p>{issue.whyItMatters || issue.description || "Issue context is not yet published for this issue."}</p>
                <Link className="iu-textlink" to={impactRoutes.issue(issue.slug)} onClick={() => trackEvent("impact_issue_open", { issue_id: issue.id, surface: "project" })}>All work on this issue →</Link>
              </div>
            )) : <p className="iu-note">No issue is linked to this project in NATUREBRAIN yet.</p>}
          </section>

          <section className="iu-block" id="what" aria-labelledby="what-h">
            <SectionHead index={next()} title="What the project does" id="what-h" />
            <div className="iu-prose">
              <p>{project.methodSummary || project.description || "A description of the intervention is not yet published."}</p>
              {project.deliveryModel && <p><strong>Delivery model.</strong> {project.deliveryModel}</p>}
            </div>
            {(project.reportedScale.length > 0 || project.statedAmbition.length > 0) && (
              <div className="iu-scale">
                <div>
                  <h3>Reported by the source</h3>
                  {project.reportedScale.length ? (
                    <dl>{project.reportedScale.map((row) => <div key={row.label + row.value}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
                  ) : <p className="iu-note">No delivered scale is published.</p>}
                </div>
                <div>
                  <h3>Stated ambition — not delivery</h3>
                  {project.statedAmbition.length ? (
                    <dl>{project.statedAmbition.map((row) => <div key={row.label + row.value}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
                  ) : <p className="iu-note">No target is published.</p>}
                </div>
              </div>
            )}
          </section>

          <section className="iu-block" id="evidence" aria-labelledby="evidence-h">
            <SectionHead
              index={next()}
              title="What the sources establish"
              id="evidence-h"
              lead="Each claim keeps its own review status, strength and limitation. Organisation-reported figures stay organisation-reported."
            />
            <ProofLadder state={project.reviewState} />
            {project.externalReview && (
              <p className="iu-review-note">
                <strong>External review:</strong> {project.externalReview.institution}
                {project.externalReview.programme ? ` — ${project.externalReview.programme}` : ""}.
                {project.externalReview.whatReviewed ? ` Reviewed: ${project.externalReview.whatReviewed}.` : ""} This is not 4PLANET verification.
              </p>
            )}
            {externallyReviewed.length > 0 && (
              <>
                <h3 className="iu-subhead">Externally reviewed</h3>
                <ClaimList claims={externallyReviewed} subjectId={project.id} />
              </>
            )}
            <h3 className="iu-subhead">{externallyReviewed.length ? "Source-reported" : "Claims"}</h3>
            <ClaimList claims={sourceReported} subjectId={project.id} />
            <NotEstablished lines={notEstablished} />
          </section>

          {(atlasView || places.length > 0) && (
            <section className="iu-block" id="place" aria-labelledby="place-h">
              <SectionHead index={next()} title="Where it happens" id="place-h" lead={placeLabel || undefined} />
              {atlasView && (
                <div className="iu-atlas" onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) trackEvent("impact_atlas_open", { project_id: project.id }); }}>
                  <AtlasEmbed view={atlasView} />
                </div>
              )}
              {places.length > 0 && (
                <ul className="iu-plain">
                  {places.map((place) => (
                    <li key={place.id}><strong>{place.name}</strong>{place.description ? ` — ${place.description}` : ""}{place.geometryStatus ? <Meta>{humanise(place.geometryStatus)}</Meta> : null}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="iu-block" id="who" aria-labelledby="who-h">
            <SectionHead index={next()} title="Who is doing the work" id="who-h" />
            {actors.length ? (
              <ul className="iu-rows">
                {actors.map(({ actor, role }) => (
                  <RuledRow
                    key={actor.id}
                    to={impactRoutes.actor(actor.slug)}
                    title={actor.name}
                    line={<>{[actorRoleLabel(role.predicate), humanise(actor.actorType)].filter(Boolean).join(" · ")}{actor.description ? <><br />{actor.description}</> : null}</>}
                    meta={humanise(actor.relationshipState) || "Public record"}
                    onOpen={() => trackEvent("impact_actor_open", { actor_id: actor.id, surface: "project" })}
                  />
                ))}
              </ul>
            ) : <p className="iu-note">No organisation is linked to this project in NATUREBRAIN yet.</p>}
            <p className="iu-boundary">Being listed here does not mean 4PLANET partnership, endorsement or funding.</p>
          </section>

          {solutions.length > 0 && (
            <section className="iu-block" id="method" aria-labelledby="method-h">
              <SectionHead index={next()} title="Method" id="method-h" />
              <ul className="iu-rows">
                {solutions.map((solution) => (
                  <RuledRow
                    key={solution.id}
                    to={impactRoutes.solution(solution.slug)}
                    title={solution.name}
                    line={solution.description || undefined}
                    meta={solution.maturity ? humanise(solution.maturity) : humanise(solution.solutionType)}
                    onOpen={() => trackEvent("impact_solution_open", { solution_id: solution.id, surface: "project" })}
                  />
                ))}
              </ul>
            </section>
          )}

          {project.outcomes.length > 0 && (
            <section className="iu-block" id="outcomes" aria-labelledby="outcomes-h">
              <SectionHead index={next()} title="Outcomes" id="outcomes-h" lead="Reported outcomes are shown with their source. Delivery, outcome and verification stay separate." />
              <dl className="iu-scale-list">{project.outcomes.map((row) => <div key={row.label + row.value}><dt>{row.label}</dt><dd>{row.value}{row.note ? <small>{row.note}</small> : null}</dd></div>)}</dl>
            </section>
          )}

          {project.capitalNeeds.length > 0 && (
            <section className="iu-block" id="capital" aria-labelledby="capital-h">
              <SectionHead index={next()} title="Stated resource needs" id="capital-h" lead="Needs stated by the organisation. A need is not an appeal by 4PLANET, and fit is not a commitment." />
              <ul className="iu-plain">{project.capitalNeeds.map((need) => <li key={need.type + need.status}><strong>{humanise(need.type)}</strong> — {humanise(need.status)}{need.description ? `. ${need.description}` : ""}</li>)}</ul>
            </section>
          )}

          <section className="iu-block" id="act" aria-labelledby="act-h">
            <SectionHead index={next()} title="Take part" id="act-h" />
            {actions.length ? (
              <div className="iu-actions iu-actions--stack">
                {actions.map((action) => action.url ? (
                  <CapsuleLink key={action.id} href={action.url} onClick={() => trackEvent("impact_external_action", { project_id: project.id, action_type: action.actionType || "external", surface: "act" })}>
                    {action.name}
                  </CapsuleLink>
                ) : null)}
                <SaveButton id={project.id} type="PROJECT" label={project.name} sub={lead?.name} />
              </div>
            ) : <p className="iu-note">No public action route is published for this project yet.</p>}
            <p className="iu-boundary">Actions open on the organisation’s own site. 4PLANET does not process, receive or claim credit for them.</p>
          </section>

          <section className="iu-block" id="sources" aria-labelledby="sources-h">
            <SectionHead index={next()} title="Sources and updates" id="sources-h" lead={lastChecked ? `Last checked ${shortDate(lastChecked)}. Facts are referenced from the originals; their text and media are not republished.` : undefined} />
            <SourceTable claims={sources} subjectId={project.id} />
            <Meta>Record {project.id}</Meta>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="iu-section iu-section--rule" id="related" aria-labelledby="related-h">
          <div className="iu-wrap">
            <SectionHead title="Related work" id="related-h" lead="Connected by issue, organisation, method or place — never by popularity or payment." />
            <ProjectGrid projects={related} idx={idx} surface="related" label="Related projects" />
            {project.magazine.length > 0 && (
              <ul className="iu-rows iu-rows--spaced">
                {project.magazine.map((story) => <RuledRow key={story.href} to={story.href} title={story.title} meta="Magazine" onOpen={() => trackEvent("magazine_open", { project_id: project.id })} />)}
              </ul>
            )}
          </div>
        </section>
      )}
      <div className="iu-wrap"><Provenance idx={idx} /></div>
    </article>
  );
}
