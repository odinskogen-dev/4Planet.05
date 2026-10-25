/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET IMPACT — LIVING ACTION NETWORK — route entry
   Every route renders a reusable template from ONE NATUREBRAIN graph read.
   Templates live in src/impact/ui; this file only binds routes → template + SEO.
   ═══════════════════════════════════════════════════════════════════════════ */
import { useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { useImpactIndex, impactRoutes } from "@/impact/livingActionNetworkClient";
import { humanise } from "@/impact/livingActionNetworkGraph";
import { actorJsonLd, homeJsonLd, issueJsonLd, projectDescription, projectJsonLd, solutionJsonLd } from "@/impact/seo";
import { StateScreen } from "@/impact/ui/primitives";
import { HomeTemplate } from "@/impact/ui/HomeTemplate";
import { ProjectTemplate } from "@/impact/ui/ProjectTemplate";
import { ActorTemplate } from "@/impact/ui/ActorTemplate";
import { IssueTemplate } from "@/impact/ui/IssueTemplate";
import { SolutionTemplate } from "@/impact/ui/SolutionTemplate";
import "@/styles/impact-living-action-network.css";

const HOME_TITLE = "Impact — Find people bringing life back | 4PLANET";
const HOME_DESCRIPTION = "A source-aware index of ecological projects and the organisations doing the work — by problem, place and method, with evidence and official routes kept close.";

function Frame({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}

export function ImpactLivingActionNetwork() {
  const load = useImpactIndex();
  return (
    <Frame>
      <Seo
        title={HOME_TITLE}
        description={HOME_DESCRIPTION}
        path={impactRoutes.home}
        image="/assets/missions/rewild/hero.jpg"
        imageAlt="Living landscape — 4PLANET Impact"
        jsonLd={load.state === "READY" ? ({ canonicalUrl }) => homeJsonLd(load.idx, canonicalUrl) : undefined}
      />
      {load.state === "READY" ? <HomeTemplate idx={load.idx} /> : <StateScreen kind={load.state} retry={load.retry} />}
    </Frame>
  );
}

export function ImpactProjectProfilePage() {
  const { slug = "" } = useParams();
  const load = useImpactIndex();
  const project = load.state === "READY" ? load.idx.projectBySlug(slug) : null;
  return (
    <Frame>
      {load.state === "READY" && project ? (
        <>
          <Seo
            title={`${project.name} — Impact | 4PLANET`}
            description={projectDescription(project, load.idx)}
            path={impactRoutes.project(project.slug)}
            image={project.media?.path}
            imageAlt={project.media?.alt || undefined}
            modifiedTime={project.lastReviewed || project.updatedAt || undefined}
            jsonLd={({ canonicalUrl }) => projectJsonLd(project, load.idx, canonicalUrl)}
          />
          <ProjectTemplate project={project} idx={load.idx} />
        </>
      ) : (
        <StateScreen kind={load.state === "READY" ? "NOT_FOUND" : load.state} retry={load.retry} />
      )}
    </Frame>
  );
}

export function ImpactActorProfilePage() {
  const { slug = "" } = useParams();
  const load = useImpactIndex();
  const actor = load.state === "READY" ? load.idx.actorBySlug(slug) : null;
  return (
    <Frame>
      {load.state === "READY" && actor ? (
        <>
          <Seo
            title={`${actor.name} — Organisation | 4PLANET Impact`}
            description={actor.description ? `${actor.description} Projects, places and sources on 4PLANET Impact.` : `${actor.name}: projects, places and sources on 4PLANET Impact.`}
            path={impactRoutes.actor(actor.slug)}
            jsonLd={({ canonicalUrl }) => actorJsonLd(actor, load.idx, canonicalUrl)}
          />
          <ActorTemplate actor={actor} idx={load.idx} />
        </>
      ) : (
        <StateScreen kind={load.state === "READY" ? "NOT_FOUND" : load.state} retry={load.retry} />
      )}
    </Frame>
  );
}

export function ImpactIssuePage() {
  const { slug = "" } = useParams();
  const load = useImpactIndex();
  const issue = load.state === "READY" ? load.idx.issueBySlug(slug) : null;
  return (
    <Frame>
      {load.state === "READY" && issue ? (
        <>
          <Seo
            title={`${issue.name} — projects and organisations | 4PLANET Impact`}
            description={`${issue.description ? issue.description.replace(/\.\s*$/, "") + "." : issue.name + "."} Who is working on it, with which methods and where — with sources.`}
            path={impactRoutes.issue(issue.slug)}
            image={load.idx.projectsForIssue(issue).find((project) => project.media)?.media?.path}
            jsonLd={({ canonicalUrl }) => issueJsonLd(issue, load.idx, canonicalUrl)}
          />
          <IssueTemplate issue={issue} idx={load.idx} />
        </>
      ) : (
        <StateScreen kind={load.state === "READY" ? "NOT_FOUND" : load.state} retry={load.retry} />
      )}
    </Frame>
  );
}

export function ImpactSolutionPage() {
  const { slug = "" } = useParams();
  const load = useImpactIndex();
  const solution = load.state === "READY" ? load.idx.solutionBySlug(slug) : null;
  return (
    <Frame>
      {load.state === "READY" && solution ? (
        <>
          <Seo
            title={`${solution.name} — Method | 4PLANET Impact`}
            description={solution.description || `${solution.name} (${humanise(solution.solutionType)}) — where it is used, by whom.`}
            path={impactRoutes.solution(solution.slug)}
            // Skeleton grammar: kept out of the index until solution-level data is published.
            robots={solution.publication === "public" ? undefined : "noindex,follow"}
            jsonLd={({ canonicalUrl }) => solutionJsonLd(solution, canonicalUrl)}
          />
          <SolutionTemplate solution={solution} idx={load.idx} />
        </>
      ) : (
        <StateScreen kind={load.state === "READY" ? "NOT_FOUND" : load.state} retry={load.retry} />
      )}
    </Frame>
  );
}

export default ImpactLivingActionNetwork;
