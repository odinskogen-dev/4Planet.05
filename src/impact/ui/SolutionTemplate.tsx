/* SOLUTION RECORD — skeleton grammar, deliberately limited and noindex until
   solution-level data is published. Listing, provider claim, maturity, 4PLANET assessment
   and verified outcome stay separate. Rows without data are not shown. */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { humanise, type ImpactIndex, type ImpactIssue, type ImpactSolution } from "@/impact/livingActionNetworkGraph";
import { impactRoutes } from "@/impact/livingActionNetworkClient";
import { ActorRows, ClaimList, Facts, Kicker, OnThisPage, ProjectGrid, Provenance, RuledRow, SectionHead, markOf } from "./primitives";

export function SolutionTemplate({ solution, idx }: { solution: ImpactSolution; idx: ImpactIndex }) {
  const projects = idx.projectsForSolution(solution);
  const actors = idx.actorsForProjects(projects);
  const places = idx.placesForProjects(projects);
  const issueMap = new Map<string, ImpactIssue>();
  for (const id of solution.issueIds) {
    const item = idx.byId.get(id);
    if (item?.kind === "issue") issueMap.set(id, item);
  }
  for (const item of idx.issuesForProjects(projects)) issueMap.set(item.id, item);
  const issues = Array.from(issueMap.values());
  const placeSummary = places.length > 4 ? `${places.slice(0, 4).map((place) => place.name).join(", ")} +${places.length - 4} more` : places.map((place) => place.name).join(", ");
  const onPage: [string, string][] = [["sol-how", "How it works"], ["sol-where", "Projects"]];
  if (actors.length) onPage.push(["sol-who", "Organisations"]);
  onPage.push(["sol-evidence", "Evidence"]);
  let sectionNumber = 0;
  const next = () => String(++sectionNumber).padStart(2, "0");

  useEffect(() => {
    trackEvent("impact_solution_view", { solution_id: solution.id });
  }, [solution.id]);

  return (
    <article className="iu iu-profile iu-solution">
      <header className="iu-band">
        <div className="iu-wrap">
          <nav className="iu-crumbs iu-crumbs--inverse" aria-label="Breadcrumb"><Link to={impactRoutes.home}>Impact</Link><span aria-hidden>/</span><span>Methods</span></nav>
          <Kicker inverse>Method · public record</Kicker>
          <h1>{solution.name}</h1>
          {solution.description && <p className="iu-band__lead">{solution.description}</p>}
        </div>
      </header>
      <OnThisPage items={onPage} />
      <div className="iu-wrap iu-profile__layout">
        <aside className="iu-profile__aside" aria-label="At a glance">
          <h2 className="iu-aside-title">At a glance</h2>
          <Facts rows={[
            ["Type", humanise(solution.solutionType) || null],
            ["Maturity (as recorded)", solution.maturity ? humanise(solution.maturity) : null],
            ["Problems addressed", issues.length ? issues.map((issue) => <Link key={issue.id} to={impactRoutes.issue(issue.slug)}>{issue.name}</Link>) : null],
            ["Places in use", placeSummary || null],
            ["4PLANET assessment", "Not assessed — reserved"],
          ]} />
        </aside>
        <div className="iu-profile__main">
          <section className="iu-block" aria-labelledby="sol-how">
            <SectionHead index={next()} title="How it works" id="sol-how" />
            <div className="iu-prose"><p>{solution.mechanism || solution.description || "A mechanism description has not been published yet."}</p></div>
            {solution.applicability.length > 0 && <><h3 className="iu-subhead">Where it applies</h3><ul className="iu-plain">{solution.applicability.map((line) => <li key={line}>{line}</li>)}</ul></>}
            {solution.risks.length > 0 && <><h3 className="iu-subhead">Risks and limitations</h3><ul className="iu-plain iu-plain--limits">{solution.risks.map((line) => <li key={line}>{line}</li>)}</ul></>}
          </section>
          <section className="iu-block" aria-labelledby="sol-where">
            <SectionHead index={next()} title="Where it is used" id="sol-where" lead={projects.length ? "Published projects using this method." : "No published project uses this method yet."} />
            {projects.length > 0 && <ProjectGrid projects={projects} idx={idx} surface="solution" label={`Projects using ${solution.name}`} />}
          </section>
          {actors.length > 0 && (
            <section className="iu-block" aria-labelledby="sol-who">
              <SectionHead index={next()} title="Who uses it" id="sol-who" />
              <ActorRows actors={actors.map((actor) => ({ actor }))} idx={idx} surface="solution" />
            </section>
          )}
          <section className="iu-block" aria-labelledby="sol-evidence">
            <SectionHead index={next()} title="Evidence" id="sol-evidence" lead="Solution-level evidence is published separately from project evidence. A method in use is not proof that it works everywhere." />
            {solution.evidence.length > 0 ? <ClaimList claims={solution.evidence} subjectId={solution.id} /> : <p className="iu-note">No solution-level evidence is published yet. See each project for its own claims.</p>}
            {issues.length > 0 && (
              <ul className="iu-rows iu-rows--spaced">
                {issues.map((issue) => <RuledRow key={issue.id} to={impactRoutes.issue(issue.slug)} title={issue.name} mark={markOf(issue.domain)} meta="Issue" />)}
              </ul>
            )}
          </section>
        </div>
      </div>
      <div className="iu-wrap"><Provenance idx={idx} /></div>
    </article>
  );
}
