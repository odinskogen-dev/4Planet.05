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
  // Search/AI discovery is based on crawlable, source-backed HTML, not artificial
  // FAQ markup, keyword stuffing or a duplicate data store. Every link is
  // resolved from the same published NATUREBRAIN projection as the templates.
  const solutionMap = bySlug(solutions);
  const projectForSlug = bySlug(projects);
  const actorForSlug = bySlug(actors);
  const issueForSlug = bySlug(issues);
  const unique = (items) => [...new Set(items)];
  const link = (href, name) => '<a href="' + esc(href) + '">' + esc(name) + '</a>';
  const projectMethods = (project) =>
    (project.solutions ?? []).filter((method) => solutionMap.has(method.slug));
  const projectIssues = (project) =>
    (project.issues ?? []).filter((issue) => issueForSlug.has(issue.slug));
  const trail = (nodes) => {
    const crumbs = [{ name: "4PLANET", href: "/" }, { name: "Impact", href: "/impact/" }, ...nodes];
    const nav = '<nav aria-label="Breadcrumb"><ol>' + crumbs.map((c, i) =>
      '<li>' + (i === crumbs.length - 1 ? '<span aria-current="page">' + esc(c.name) + '</span>' : link(c.href, c.name)) + '</li>'
    ).join('') + '</ol></nav>';
    const schema = {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem", position: i + 1, name: c.name, item: origin + c.href
      }))
    };
    return { nav, schema };
  };
  function enhanced(props) {
    const route = props.pathName;
    const segments = route.split("/").filter(Boolean);
    const kind = segments[1] || "home";
    const slug = segments[2];
    const name = kind === "home" ? "Impact" : (
      kind === "project" ? projectForSlug.get(slug)?.name :
      kind === "actors" ? actorForSlug.get(slug)?.name :
      kind === "issue" ? issueForSlug.get(slug)?.name :
      solutionMap.get(slug)?.name
    ) || props.title;
    const breadcrumb = trail(kind === "home" ? [] : [{ name, href: route }]);
    let more = "";
    if (kind === "home") {
      more = '<section aria-labelledby="impact-methods"><h2 id="impact-methods">Conservation and restoration methods</h2>'
        + '<p>Explore the approaches recorded in published project evidence, including where they are being used and what is not yet established.</p><ul>'
        + solutions.map((s) => '<li>' + link('/impact/solution/' + s.slug + '/', s.name)
          + (s.description ? ' — ' + esc(s.description) : '') + '</li>').join('')
        + '</ul></section>';
    } else if (kind === "project") {
      const p = projectForSlug.get(slug);
      if (p) {
        const methods = projectMethods(p);
        const similar = projects.filter((other) => other.slug !== p.slug &&
          projectIssues(other).some((issue) => projectIssues(p).some((pi) => pi.slug === issue.slug))).slice(0, 5);
        more = '<section aria-labelledby="impact-project-navigation"><h2 id="impact-project-navigation">Explore this project in context</h2>'
          + (methods.length ? '<h3>Methods connected to this project</h3><ul>' + methods.map((m) =>
            '<li>' + link('/impact/solution/' + m.slug + '/', m.name) + '</li>').join('') + '</ul>' : '')
          + (p.officialUrl ? '<p>Official programme information: <a href="' + esc(p.officialUrl) +
            '">' + esc(host(p.officialUrl)) + '</a>. This is an information link, not a 4PLANET contribution or partnership.</p>' : '')
          + (similar.length ? '<h3>Other projects addressing related problems</h3><ul>' +
            similar.map((other) => '<li>' + link(projectHref(other.slug), other.name) + '</li>').join('') + '</ul>' : '')
          + '</section>';
      }
    } else if (kind === "actors") {
      const a = actorForSlug.get(slug);
      if (a) {
        const related = (a.projects ?? []).map((p) => projectForSlug.get(p)).filter(Boolean);
        const problems = unique(related.flatMap(projectIssues).map((i) => i.slug));
        more = '<section aria-labelledby="actor-context"><h2 id="actor-context">Problems connected to published projects</h2>'
          + (problems.length ? '<ul>' + problems.map((slug) =>
            '<li>' + link(issueHref(slug), issueForSlug.get(slug)?.name || slug) + '</li>').join('') + '</ul>' :
            '<p>Project-to-problem relationships are not published in this record.</p>')
          + (a.website ? '<p>Organisation website: <a href="' + esc(a.website) + '">' + esc(host(a.website)) + '</a></p>' : '')
          + '</section>';
      }
    } else if (kind === "issue") {
      const i = issueForSlug.get(slug);
      if (i) {
        const related = (i.projects ?? []).map((slug) => projectForSlug.get(slug)).filter(Boolean);
        const methods = unique(related.flatMap(projectMethods).map((m) => m.slug));
        more = '<section aria-labelledby="issue-methods"><h2 id="issue-methods">Approaches associated with this problem</h2>'
          + (methods.length ? '<ul>' + methods.map((slug) => {
            const method = solutionMap.get(slug);
            return '<li>' + link('/impact/solution/' + slug + '/', method?.name || slug)
              + (method?.description ? ' — ' + esc(method.description) : '') + '</li>';
          }).join('') + '</ul>' : '<p>No independently reviewed solution comparison is published for this problem.</p>')
          + '</section>';
      }
    } else if (kind === "solution") {
      const method = solutionMap.get(slug);
      if (method) {
        const related = projects.filter((p) => projectMethods(p).some((m) => m.slug === slug));
        const problemSlugs = unique(related.flatMap(projectIssues).map((i) => i.slug));
        more = '<section aria-labelledby="method-context"><h2 id="method-context">Problems connected to this approach</h2>'
          + (problemSlugs.length ? '<ul>' + problemSlugs.map((slug) =>
            '<li>' + link(issueHref(slug), issueForSlug.get(slug)?.name || slug) + '</li>').join('') + '</ul>' :
            '<p>No problem relationship is established in the published project records.</p>')
          + '</section>';
      }
    }
    const body = props.body.replace('<main>', '<main>' + breadcrumb.nav).replace('</main>', more + '</main>');
    const html = pageHtml({ ...props, body });
    // JSON-LD is a factual mirror of visible breadcrumb links; no fictional Q&A.
    const breadcrumbScript = '<script type="application/ld+json">' +
      JSON.stringify(breadcrumb.schema).replaceAll('<', '\\u003c') + '</script>';
    return html.replace('</head>', breadcrumbScript + '</head>');
  }

  const boundary = "<p><strong>Truth boundary.</strong> Listing does not imply 4PLANET partnership or endorsement. Source-reported figures are not independently verified by 4PLANET. Delivery, outcome and verification remain separate states.</p>";
  const sourcesList = (urls) => urls.length ? `<h2>Sources</h2><ul>${urls.map((u) => `<li><a href="${esc(u)}" rel="nofollow">${esc(host(u))}</a></li>`).join("")}</ul>` : "";
  const projectLi = (p) => `<li><a href="${projectHref(esc(p.slug))}">${esc(p.name)}</a>${p.actor ? ` — ${esc(p.actor.name)}` : ""}${p.place ? `, ${esc(p.place)}` : ""}</li>`;

  writeRoute("/impact", enhanced({
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
    writeRoute(path, enhanced({
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
    writeRoute(path, enhanced({
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
    writeRoute(path, enhanced({
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
    const issuesHtml = relatedIssues.length ? `<h2>Issues connected to this method</h2><ul>${relatedIssues.map((i) => `<li><a href="${issueHref(esc(i.slug))}">${esc(i.name)}</a></li>`).join("")}</ul>` : "";
    const projectsHtml = relatedProjects.length ? `<h2>Projects using this method</h2><ul>${relatedProjects.map((project) => `<li><a href="${projectHref(esc(project.slug))}">${esc(project.name)}</a></li>`).join("")}</ul>` : "";
    writeRoute(path, enhanced({
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
