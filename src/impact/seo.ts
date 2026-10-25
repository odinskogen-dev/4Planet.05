/* Structured data for IMPACT entities. Only schema.org types that genuinely fit;
   every claim cites its source URL; nothing is asserted that NATUREBRAIN did not return. */
import type { ImpactActor, ImpactIndex, ImpactIssue, ImpactProject, ImpactSolution } from "./livingActionNetworkGraph";
import { impactRoutes } from "./livingActionNetworkClient";

const abs = (path: string, canonicalUrl: string) => new URL(path, canonicalUrl).toString();
const citations = (urls: (string | null)[]) => Array.from(new Set(urls.filter((url): url is string => Boolean(url))));
const site = (canonicalUrl: string) => ({ "@type": "WebSite", name: "4PLANET", url: abs("/", canonicalUrl) });
const collection = (canonicalUrl: string) => ({ "@type": "CollectionPage", name: "4PLANET Impact", url: abs(impactRoutes.home, canonicalUrl) });

export function projectDescription(project: ImpactProject, idx: ImpactIndex) {
  const lead = idx.leadActorOf(project);
  const place = project.coverageNote || idx.placesOf(project).map((item) => item.name).join(", ");
  const base = (project.summary || project.description || project.name).replace(/\.\s*$/, "") + ".";
  const parts = [base];
  if (lead && !base.includes(lead.name)) parts.push(`Lead organisation: ${lead.name}.`);
  if (place) parts.push(`Place: ${place}.`);
  parts.push("Evidence and sources on 4PLANET Impact.");
  const text = parts.join(" ");
  return text.length > 300 ? text.slice(0, 297).replace(/\s+\S*$/, "") + "…" : text;
}

export function projectJsonLd(project: ImpactProject, idx: ImpactIndex, canonicalUrl: string) {
  const actors = idx.actorsOf(project);
  const places = idx.placesOf(project);
  return {
    "@context": "https://schema.org",
    "@type": ["Project", "WebPage"],
    "@id": canonicalUrl + "#project",
    name: project.name,
    description: project.summary || project.description || undefined,
    url: canonicalUrl,
    identifier: project.id,
    dateModified: project.lastReviewed || project.updatedAt || undefined,
    citation: citations(project.evidence.map((item) => item.sourceUrl)),
    sameAs: project.officialUrl ? [project.officialUrl] : undefined,
    spatialCoverage: places.length ? places.map((place) => ({ "@type": "Place", name: place.name, identifier: place.id })) : undefined,
    about: idx.issuesOf(project).map((issue) => ({ "@type": "Thing", name: issue.name, url: abs(impactRoutes.issue(issue.slug), canonicalUrl) })),
    member: actors.map(({ actor }) => ({ "@type": "Organization", name: actor.name, identifier: actor.id, url: abs(impactRoutes.actor(actor.slug), canonicalUrl) })),
    isPartOf: collection(canonicalUrl),
  };
}

export function actorJsonLd(actor: ImpactActor, idx: ImpactIndex, canonicalUrl: string) {
  const projects = idx.projectsForActor(actor);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": canonicalUrl + "#organization",
    name: actor.name,
    description: actor.description || undefined,
    url: canonicalUrl,
    identifier: actor.id,
    sameAs: actor.website ? [actor.website] : undefined,
    areaServed: idx.placesForProjects(projects).map((place) => ({ "@type": "Place", name: place.name })),
    subjectOf: projects.map((project) => ({ "@type": "WebPage", name: project.name, url: abs(impactRoutes.project(project.slug), canonicalUrl) })),
    citation: citations([...actor.evidence, ...projects.flatMap((project) => project.evidence)].map((item) => item.sourceUrl)),
  };
}

export function issueJsonLd(issue: ImpactIssue, idx: ImpactIndex, canonicalUrl: string) {
  const projects = idx.projectsForIssue(issue);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonicalUrl,
    name: issue.name,
    description: issue.description || undefined,
    url: canonicalUrl,
    about: { "@type": "Thing", name: issue.name, identifier: issue.id, description: issue.description || undefined },
    isPartOf: site(canonicalUrl),
    citation: citations(issue.evidence.map((item) => item.sourceUrl)),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, i) => ({ "@type": "ListItem", position: i + 1, name: project.name, url: abs(impactRoutes.project(project.slug), canonicalUrl) })),
    },
  };
}

export function solutionJsonLd(solution: ImpactSolution, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: solution.name,
    description: solution.description || undefined,
    url: canonicalUrl,
    about: { "@type": "Thing", name: solution.name, identifier: solution.id },
  };
}

export function homeJsonLd(idx: ImpactIndex, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4PLANET Impact",
    description: "Source-aware index of ecological projects, the organisations doing the work, the problems they address and the evidence behind them.",
    url: canonicalUrl,
    isPartOf: site(canonicalUrl),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: idx.graph.projects.map((project, i) => ({ "@type": "ListItem", position: i + 1, name: project.name, url: abs(impactRoutes.project(project.slug), canonicalUrl) })),
    },
  };
}
