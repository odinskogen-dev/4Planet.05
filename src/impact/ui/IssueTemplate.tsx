/* ISSUE PAGE — useful without a 4PLANET pitch.
   What is the problem → who is working on it → with which methods → where → what is
   known vs not established → what a person can do next. */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { AtlasEmbed } from "@/earth/AtlasEmbed";
import { humanise, type ImpactIndex, type ImpactIssue } from "@/impact/livingActionNetworkGraph";
import { impactRoutes } from "@/impact/livingActionNetworkClient";
import { impactAtlasView } from "./atlas";
import { ActorRows, CapsuleLink, ClaimList, Kicker, MediaFrame, OnThisPage, ProjectGrid, Provenance, RuledRow, SectionHead, SourceTable, markOf } from "./primitives";

const DOMAIN_NAME: Record<string, string> = { "OCE4N_": "OCE4N_ · the living ocean", "E4RTH_": "E4RTH_ · the living land", "S4PIENS_": "S4PIENS_ · human systems", "4CULTURE_": "4CULTURE_" };

export function IssueTemplate({ issue, idx }: { issue: ImpactIssue; idx: ImpactIndex }) {
  const projects = idx.projectsForIssue(issue);
  const actors = idx.actorsForProjects(projects);
  const solutions = idx.solutionsForIssue(issue);
  const places = idx.placesForProjects(projects);
  const actions = projects.flatMap((project) => idx.actionsOf(project).map((action) => ({ action, project }))).filter((row) => row.action.url);
  const media = projects.find((project) => project.media)?.media ?? null;
  const limitations = Array.from(new Set(projects.flatMap((project) => project.evidence.flatMap((item) => item.limitations))));
  const unknowns = [...issue.unknowns, ...limitations];
  const projectClaims = projects.flatMap((project) => project.evidence);
  const sources = idx.sourcesFor([...issue.evidence, ...projectClaims]);
  const atlasView = impactAtlasView({ title: issue.name, entityId: issue.id, places, description: "Places where published projects on this issue work." });

  useEffect(() => {
    trackEvent("impact_issue_view", { issue_id: issue.id, project_count: projects.length });
  }, [issue.id, projects.length]);

  const items: [string, string][] = [["issue-why", "The problem"], ["issue-projects", "Projects"], ["issue-actors", "Organisations"]];
  if (solutions.length) items.push(["issue-methods", "Methods"]);
  if (atlasView) items.push(["issue-place", "Places"]);
  items.push(["issue-unknown", "Known & unknown"], ["issue-act", "Take part"], ["issue-sources", "Sources"]);

  return (
    <article className="iu iu-profile iu-issue">
      <header className="iu-hero iu-hero--profile iu-hero--issue">
        <MediaFrame media={media} className="iu-hero__media" eager sizes="100vw" />
        <span className="iu-hero__scrim" aria-hidden />
        <div className="iu-wrap iu-hero__content">
          <nav className="iu-crumbs" aria-label="Breadcrumb"><Link to={impactRoutes.home}>Impact</Link><span aria-hidden>/</span><span>Issues</span></nav>
          <Kicker inverse mark={issue.domain ? markOf(issue.domain) : "#FFFFFF"}>{issue.domain ? DOMAIN_NAME[issue.domain] : "Issue"}</Kicker>
          <h1>{issue.name}</h1>
          {issue.description && <p className="iu-hero__lead">{issue.description}</p>}
          <p className="iu-hero__count">{projects.length} published project{projects.length === 1 ? "" : "s"} · {actors.length} organisation{actors.length === 1 ? "" : "s"} · {solutions.length} method{solutions.length === 1 ? "" : "s"}</p>
        </div>
      </header>

      <OnThisPage items={items} />

      <div className="iu-wrap iu-stack">
        <section className="iu-block iu-block--wide" id="issue-why" aria-labelledby="issue-why-h">
          <SectionHead index="01" title="The problem" id="issue-why-h" />
          <div className="iu-prose iu-prose--wide">
            <p>{issue.whyItMatters || issue.description || "An issue summary has not been published yet."}</p>
          </div>
          {issue.evidence.length > 0 ? (
            <ClaimList claims={issue.evidence} subjectId={issue.id} />
          ) : (
            <p className="iu-note">Issue-level evidence (how large, where, how fast) has not been published in NATUREBRAIN for this issue yet. Project-level evidence is shown on each project.</p>
          )}
        </section>

        <section className="iu-block iu-block--wide" id="issue-projects" aria-labelledby="issue-projects-h">
          <SectionHead index="02" title="Projects working on it" id="issue-projects-h" lead={projects.length ? "Several credible projects per problem — not one winner." : "No project on this issue has passed the publication gate yet. That is not evidence that none exists."} />
          {projects.length > 0 && <ProjectGrid projects={projects} idx={idx} surface="issue" eagerFirst={2} label={`Projects addressing ${issue.name}`} />}
        </section>

        <section className="iu-block iu-block--wide" id="issue-actors" aria-labelledby="issue-actors-h">
          <SectionHead index="03" title="Organisations active" id="issue-actors-h" />
          {actors.length ? <ActorRows actors={actors.map((actor) => ({ actor }))} idx={idx} surface="issue" /> : <p className="iu-note">No organisation is linked yet.</p>}
        </section>

        {solutions.length > 0 && (
          <section className="iu-block iu-block--wide" id="issue-methods" aria-labelledby="issue-methods-h">
            <SectionHead index="04" title="Methods in use" id="issue-methods-h" lead="A method listed here is in use by a published project or linked to this issue in NATUREBRAIN. Listing is not an assessment of effectiveness." />
            <ul className="iu-rows iu-rows--two">
              {solutions.map((solution) => (
                <RuledRow key={solution.id} to={impactRoutes.solution(solution.slug)} title={solution.name} line={solution.description || undefined} meta={solution.maturity ? humanise(solution.maturity) : humanise(solution.solutionType)} onOpen={() => trackEvent("impact_solution_open", { solution_id: solution.id, surface: "issue" })} />
              ))}
            </ul>
          </section>
        )}

        {atlasView && (
          <section className="iu-block iu-block--wide" id="issue-place" aria-labelledby="issue-place-h">
            <SectionHead index="05" title="Where the work is" id="issue-place-h" lead={places.map((place) => place.name).join(" · ")} />
            <div className="iu-atlas" onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) trackEvent("impact_atlas_open", { issue_id: issue.id }); }}><AtlasEmbed view={atlasView} /></div>
          </section>
        )}

        <section className="iu-block iu-block--wide" id="issue-unknown" aria-labelledby="issue-unknown-h">
          <SectionHead index="06" title="Known and not established" id="issue-unknown-h" lead="What the published record cannot yet tell you. Unknown is not the same as false." />
          {unknowns.length ? <ul className="iu-plain iu-plain--limits">{unknowns.map((line) => <li key={line}>{line}</li>)}</ul> : <p className="iu-note">No limitations are recorded yet.</p>}
        </section>

        <section className="iu-block iu-block--wide" id="issue-act" aria-labelledby="issue-act-h">
          <SectionHead index="07" title="What you can do next" id="issue-act-h" />
          {actions.length ? (
            <ul className="iu-rows iu-rows--two">
              {actions.map(({ action, project }) => (
                <li className="iu-row" key={action.id}>
                  <a href={action.url!} target="_blank" rel="noreferrer" onClick={() => trackEvent("impact_external_action", { issue_id: issue.id, project_id: project.id, action_type: action.actionType || "external" })}>
                    <span className="iu-row__main"><strong>{action.name}</strong><small>{project.name}</small></span>
                    <span className="iu-row__arrow" aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : <p className="iu-note">No public action route is published for this issue yet.</p>}
          <div className="iu-actions">
            <CapsuleLink href={impactRoutes.home} tone="line">All issues</CapsuleLink>
          </div>
          <p className="iu-boundary">Actions open on each organisation’s own site. 4PLANET does not process, receive or claim credit for them.</p>
          {issue.magazine.length > 0 && (
            <ul className="iu-rows iu-rows--spaced">
              {issue.magazine.map((story) => <RuledRow key={story.href} to={story.href} title={story.title} meta="Magazine" onOpen={() => trackEvent("magazine_open", { issue_id: issue.id })} />)}
            </ul>
          )}
        </section>

        <section className="iu-block iu-block--wide" id="issue-sources" aria-labelledby="issue-sources-h">
          <SectionHead index="08" title="Sources" id="issue-sources-h" />
          <SourceTable claims={sources} subjectId={issue.id} />
        </section>
        <Provenance idx={idx} />
      </div>
    </article>
  );
}
