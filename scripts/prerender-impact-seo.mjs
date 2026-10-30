/**
 * IMPACT crawlable representation — Home, Project, Actor, Issue (and Solution only when
 * NATUREBRAIN marks it public). Called by prerender-discovery-seo.mjs with its shared
 * HTML helpers. Content is copied from src/data/impactDiscovery.json, itself a build-time
 * projection of NATUREBRAIN. Semantic headings, citations and truth boundaries are in the
 * HTML so retrieval systems can answer: what entity, what claims, what sources, what
 * place, which actor, what is unknown.
 */
export function renderImpactRoutes({ impactDiscovery, pageHtml, writeRoute, esc, origin }) {
  const projects = impactDiscovery.projects ?? [];
  const actors = impactDiscovery.actors ?? [];
  const issues = impactDiscovery.issues ?? [];
  const solutions = (impactDiscovery.solutions ?? []).filter((item) => item.indexable === true);
  const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };
  const url = (path) => origin + path;
  const projectHref = (slug) => `/impact/project/${slug}/`;
  const actorHref = (slug) => `/impact/actors/${slug}/`;
  const issueHref = (slug) => `/impact/issue/${slug}/`;
  const bySlug = (rows) => new Map(rows.map((row) => [row.slug, row]));
  const projectMap = bySlug(projects);
  const boundary = "<p><strong>Truth boundary.</strong> Listing does not imply 4PLANET partnership or endorsement. Source-reported figures are not independently verified by 4PLANET. Delivery, outcome and verification remain separate states.</p>";
  const sourcesList = (urls) => urls.length ? `<h2>Sources</h2><ul>${urls.map((u) => `<li><a href="${esc(u)}" rel="nofollow">${esc(host(u))}</a></li>`).join("")}</ul>` : "";
  const projectLi = (p) => `<li><a href="${projectHref(esc(p.slug))}">${esc(p.name)}</a>${p.actor ? ` — ${esc(p.actor.name)}` : ""}${p.place ? `, ${esc(p.place)}` : ""}</li>`;

  writeRoute("/impact", pageHtml({
    pathName: "/impact/",
    title: "Impact — Find people bringing life back | 4PLANET",
    description: "A source-aware index of ecological projects and the organisations doing the work — by problem, place and method, with evidence and official routes kept close.",
    image: "/assets/missions/rewild/hero.jpg",
    body: `<main><p>4PLANET IMPACT</p><h1>Find people bringing life back.</h1><p>An index of real ecological projects and the organisations doing the work — with what the sources establish, and what they do not.</p><h2>Projects</h2><ul>${projects.map(projectLi).join("")}</ul><h2>Issues</h2><ul>${issues.map((i) => `<li><a href="${issueHref(esc(i.slug))}">${esc(i.name)}</a></li>`).join("")}</ul><h2>Organisations</h2><ul>${actors.map((a) => `<li><a href="${actorHref(esc(a.slug))}">${esc(a.name)}</a></li>`).join("")}</ul><h2>How records are reviewed</h2><p>Discovered → Source-checked → Externally vetted → 4PLANET reviewed (reserved). No one can pay to be listed, ranked or reviewed.</p>${boundary}</main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "4PLANET Impact",
      url: url("/impact/"),
      isPartOf: { "@type": "WebSite", name: "4PLANET", url: url("/") },
      mainEntity: { "@type": "ItemList", itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: url(projectHref(p.slug)) })) },
    },
  }));

  for (const p of projects) {
    const path = projectHref(p.slug);
    const desc = [p.description.replace(/\.\s*$/, "") + ".", p.actor ? `Lead organisation: ${p.actor.name}.` : "", p.place ? `Place: ${p.place}.` : "", "Evidence and sources on 4PLANET Impact."].filter(Boolean).join(" ").slice(0, 300);
    const claims = (p.claims ?? []).map((c) => `<li><p>${esc(c.statement)}</p><p><small>${esc([c.review, c.strength, c.interpretation].filter(Boolean).join(" · ").replaceAll("_", " "))}</small>${c.url ? ` — <a href="${esc(c.url)}" rel="nofollow">${esc(c.source || host(c.url))}</a>` : ""}</p>${(c.limitations ?? []).map((l) => `<p><small>Limitation: ${esc(l)}</small></p>`).join("")}</li>`).join("");
    writeRoute(path, pageHtml({
      pathName: path,
      title: `${p.name} — Impact | 4PLANET`,
      description: desc,
      image: p.image || undefined,
      body: `<main><p>4PLANET IMPACT / PROJECT</p><h1>${esc(p.name)}</h1><p>${esc(p.description)}</p><dl>${p.issues?.length ? `<dt>Problem</dt><dd>${p.issues.map((i) => `<a href="${issueHref(esc(i.slug))}">${esc(i.name)}</a>`).join(", ")}</dd>` : ""}${p.place ? `<dt>Place</dt><dd>${esc(p.place)}</dd>` : ""}${(p.actors ?? []).length ? `<dt>Organisations</dt><dd>${p.actors.map((a) => `<a href="${actorHref(esc(a.slug))}">${esc(a.name)}</a>`).join(", ")}</dd>` : ""}${p.solutions?.length ? `<dt>Method</dt><dd>${p.solutions.map((s) => esc(s.name)).join(", ")}</dd>` : ""}${p.reviewState ? `<dt>Review state</dt><dd>${esc(p.reviewState)}</dd>` : ""}</dl><h2>What the sources establish</h2><ol>${claims}</ol><h2>What this record does not establish</h2><p>4PLANET has not reviewed this project under its own method. No 4PLANET partnership, funding or verified ecological outcome is recorded.</p>${sourcesList(p.citations ?? [])}${p.image && p.imageRole && p.imageRole !== "project_media" ? "<p><small>The image is an issue visual, not project photography.</small></p>" : ""}<p><a href="/impact/">Explore Impact</a> · <a href="/atlas">Open ATLAS</a></p></main>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": ["Project", "WebPage"],
        "@id": url(path) + "#project",
        name: p.name,
        description: p.description,
        url: url(path),
        identifier: p.id,
        image: p.image ? url(p.image) : undefined,
        dateModified: p.lastReviewed || undefined,
        citation: p.citations,
        sameAs: p.officialUrl ? [p.officialUrl] : undefined,
        about: (p.issues ?? []).map((i) => ({ "@type": "Thing", name: i.name, url: url(issueHref(i.slug)) })),
        member: (p.actors ?? []).map((a) => ({ "@type": "Organization", name: a.name, identifier: a.id, url: url(actorHref(a.slug)) })),
        spatialCoverage: (p.places ?? []).map((name) => ({ "@type": "Place", name })),
        isPartOf: { "@type": "CollectionPage", name: "4PLANET Impact", url: url("/impact/") },
      },
    }));
  }

  for (const a of actors) {
    const path = actorHref(a.slug);
    const related = (a.projects ?? []).map((slug) => projectMap.get(slug)).filter(Boolean);
    writeRoute(path, pageHtml({
      pathName: path,
      title: `${a.name} — Organisation | 4PLANET Impact`,
      description: (a.description ? `${a.description} ` : `${a.name}: `) + "Projects, places and sources on 4PLANET Impact.",
      body: `<main><p>4PLANET IMPACT / ORGANISATION</p><h1>${esc(a.name)}</h1>${a.description ? `<p>${esc(a.description)}</p>` : ""}${a.type ? `<p>Type: ${esc(a.type.replaceAll("_", " "))}</p>` : ""}<p>Public record — not a 4PLANET partner. Listing does not imply endorsement.</p><h2>Projects</h2><ul>${related.map(projectLi).join("")}</ul>${sourcesList(a.citations ?? [])}</main>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": url(path) + "#organization",
        name: a.name,
        description: a.description || undefined,
        url: url(path),
        identifier: a.id,
        sameAs: a.website ? [a.website] : undefined,
        citation: a.citations,
        subjectOf: related.map((p) => ({ "@type": "WebPage", name: p.name, url: url(projectHref(p.slug)) })),
      },
    }));
  }

  for (const i of issues) {
    const path = issueHref(i.slug);
    const related = (i.projects ?? []).map((slug) => projectMap.get(slug)).filter(Boolean);
    const issueClaims = i.claims ?? [];
    const issueUnknowns = i.unknowns ?? [];
    const issueSources = i.citations ?? [];
    const issueEvidenceHtml = issueClaims.length
      ? `<h2>What the sources establish</h2><ul>${issueClaims.map((claim) => `<li><p>${esc(claim.statement)}</p>${claim.url ? `<p><small>Source: <a href="${esc(claim.url)}" rel="nofollow">${esc(claim.source || host(claim.url))}</a></small></p>` : ""}</li>`).join("")}</ul>`
      : "";
    const issueUnknownHtml = issueUnknowns.length
      ? `<h2>Known and not established</h2><ul>${issueUnknowns.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>`
      : "";
    writeRoute(path, pageHtml({
      pathName: path,
      title: `${i.name} — projects and organisations | 4PLANET Impact`,
      description: `${i.description ? i.description.replace(/\.\s*$/, "") + "." : i.name + "."} Who is working on it, with which methods and where — with sources.`,
      image: related.find((p) => p.image)?.image || undefined,
      body: `<main><p>4PLANET IMPACT / ISSUE</p><h1>${esc(i.name)}</h1>${i.description ? `<p>${esc(i.description)}</p>` : ""}${i.whyItMatters ? `<h2>Why it matters</h2><p>${esc(i.whyItMatters)}</p>` : ""}${issueEvidenceHtml}<h2>Projects working on it</h2><ul>${related.map(projectLi).join("")}</ul><h2>Organisations</h2><ul>${Array.from(new Map(related.flatMap((p) => p.actors ?? []).map((a) => [a.slug, a])).values()).map((a) => `<li><a href="${actorHref(esc(a.slug))}">${esc(a.name)}</a></li>`).join("")}</ul>${issueUnknownHtml}${sourcesList(issueSources)}${boundary}</main>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: i.name,
        description: i.description || undefined,
        url: url(path),
        dateModified: i.lastReviewed || undefined,
        citation: issueSources,
        about: { "@type": "Thing", name: i.name, identifier: i.id, description: i.description || undefined },
        mainEntity: { "@type": "ItemList", itemListElement: related.map((p, n) => ({ "@type": "ListItem", position: n + 1, name: p.name, url: url(projectHref(p.slug)) })) },
      },
    }));
  }

  for (const s of solutions) {
    const path = `/impact/solution/${s.slug}/`;
    const claims = s.claims ?? [];
    const citations = s.citations ?? [];
    const relatedProjects = s.projectRefs ?? projects.filter((p) => (p.solutions ?? []).some((x) => x.id === s.id));
    const relatedIssues = s.issues ?? [];
    const claimHtml = claims.length
      ? `<h2>What the sources establish</h2><ul>${claims.map((claim) => `<li><p>${esc(claim.statement)}</p>${claim.url ? `<p><small><a href="${esc(claim.url)}" rel="noreferrer nofollow">${esc(claim.source || host(claim.url))}</a> · ${esc(claim.strength || "source record")}</small></p>` : ""}</li>`).join("")}</ul>`
      : "";
    const mechanismHtml = s.mechanism ? `<h2>How the method works</h2><p>${esc(s.mechanism)}</p>` : "";
    const applicabilityHtml = (s.applicability ?? []).length ? `<h2>Where it may apply</h2><ul>${s.applicability.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
    const risksHtml = (s.risks ?? []).length ? `<h2>Limitations and risks</h2><ul>${s.risks.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
    const issuesHtml = relatedIssues.length ? `<h2>Issues connected to this method</h2><ul>${relatedIssues.map((i) => `<li><a href="/impact/issue/${esc(i.slug)}">${esc(i.name)}</a></li>`).join("")}</ul>` : "";
    const projectsHtml = relatedProjects.length ? `<h2>Projects using this method</h2><ul>${relatedProjects.map((project) => `<li><a href="${projectHref(esc(project.slug))}">${esc(project.name)}</a></li>`).join("")}</ul>` : "";
    writeRoute(path, pageHtml({
      pathName: path,
      title: `${s.name} — Method and evidence | 4PLANET Impact`,
      description: `${s.description || s.name} See source-grounded projects, evidence, applicability and limitations in 4PLANET Impact.`,
      body: `<main><p>4PLANET IMPACT / METHOD</p><h1>${esc(s.name)}</h1>${s.description ? `<p>${esc(s.description)}</p>` : ""}${mechanismHtml}${claimHtml}${issuesHtml}${projectsHtml}${applicabilityHtml}${risksHtml}${sourcesList(citations)}${boundary}</main>`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: s.name,
        description: s.description || undefined,
        url: url(path),
        dateModified: s.lastReviewed || undefined,
        citation: citations,
        about: { "@type": "Thing", name: s.name, identifier: s.id, description: s.description || undefined },
        mentions: [
          ...relatedIssues.map((i) => ({ "@type": "Thing", name: i.name, url: url(`/impact/issue/${i.slug}/`) })),
          ...relatedProjects.map((project) => ({ "@type": "Project", name: project.name, url: url(projectHref(project.slug)) })),
        ],
      },
    }));
  }

  return { projects: projects.length, actors: actors.length, issues: issues.length, solutions: solutions.length };
}

/** Sitemap entries for the same set — only entities with a public, indexable page. */
export function impactSitemapRoutes(impactDiscovery) {
  return [
    ...(impactDiscovery.projects ?? []).map((item) => `/impact/project/${item.slug}/`),
    ...(impactDiscovery.actors ?? []).map((item) => `/impact/actors/${item.slug}/`),
    ...(impactDiscovery.issues ?? []).map((item) => `/impact/issue/${item.slug}/`),
    ...(impactDiscovery.solutions ?? []).filter((item) => item.indexable === true).map((item) => `/impact/solution/${item.slug}/`),
  ];
}
