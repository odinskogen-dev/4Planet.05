import fs from "node:fs";
import path from "node:path";
import { readLocalMissionRecords } from "./mission-content.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryInventory.json"), "utf8"));
const atlasDiscovery = JSON.parse(fs.readFileSync(path.join(root, "src/data/atlasDiscovery.json"), "utf8"));
const discovery = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryTopics.json"), "utf8"));
const impactDiscovery = JSON.parse(fs.readFileSync(path.join(root, "src/data/impactDiscovery.json"), "utf8"));
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const base = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const placeIsReleasedForOrigin = (item) => item.indexable === true
  && item.publicationState === "READY_FOR_FOUNDER_RELEASE"
  && item.canonicalOrigin === origin;

const esc = (value = "") =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

function setMeta(html, selector, value) {
  const separator = selector.indexOf(":");
  const kind = selector.slice(0, separator);
  const key = selector.slice(separator + 1);
  const attr = kind === "property" ? "property" : "name";
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function pageHtml({ pathName, title, description, body, jsonLd, image }) {
  const canonical = origin + pathName;
  let html = base.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
  for (const [selector, value] of [
    ["name:description", description],
    ["name:robots", "index,follow,max-image-preview:large"],
    ["property:og:title", title],
    ["property:og:description", description],
    ["property:og:url", canonical],
    ["name:twitter:title", title],
    ["name:twitter:description", description],
    ...(image ? [["property:og:image", origin + image], ["name:twitter:image", origin + image]] : []),
  ]) html = setMeta(html, selector, value);

  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${esc(canonical)}" />\n    <script type="application/ld+json" data-4planet-prerender="true">${json(jsonLd)}</script>\n  </head>`,
  );
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function writeRoute(pathName, html) {
  const target = path.join(dist, ...pathName.split("/").filter(Boolean));
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, "index.html"), html, "utf8");
}

const species = (inventory.species || []).filter((item) => item.indexable === true);
const places = (inventory.places || []).filter(placeIsReleasedForOrigin);
const atlasObjects = (atlasDiscovery.objects || []).filter((item) => item.indexable === true);
const discoveryTopics = (discovery.topics || []).filter((item) => item.indexable === true);

const localMissionRecords = origin === "https://4planet.org" ? readLocalMissionRecords(root) : [];
if (localMissionRecords.length) {
  const missionIndex = "<main data-4planet-prerender-content='missions-index'><h1>4PLANET Missions</h1>" +
    "<p>Explore missions for oceans, land, human systems and culture. Each page records a developing approach, not a verified ecological outcome.</p><ul>" +
    localMissionRecords.map((m) => "<li><a href='/missions/" + esc(m.slug) + "'>" + esc(m.name) + " — " + esc(m.hero) + "</a></li>").join("") +
    "</ul></main>";
  writeRoute("/missions", pageHtml({
    pathName: "/missions",
    title: "4PLANET Missions — Oceans, Land, Human Systems and Culture",
    description: "Explore 4PLANET missions addressing nature, ecosystems and human systems, with clearly stated development status.",
    body: missionIndex,
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage",
      name: "4PLANET Missions", url: origin + "/missions",
      mainEntity: { "@type": "ItemList", itemListElement: localMissionRecords.map((m, i) =>
        ({ "@type": "ListItem", position: i + 1, url: origin + "/missions/" + m.slug, name: m.name })) } },
  }));
}
for (const m of localMissionRecords) {
  const pathName = "/missions/" + m.slug;
  // Only verified/high-confidence canonical background references become server anchors.
  const backgroundSources = m.sources.filter((source) => source.confidence === "high");
  const referenceHtml = backgroundSources.length
    ? "<section aria-label='Mission background sources'><h2>Background sources</h2><ul>" +
        backgroundSources.map((source) =>
          "<li><a href='" + esc(source.url) + "' rel='noopener noreferrer'>" +
          esc(source.title) + "</a></li>").join("") +
        "</ul><p>These background sources describe the wider topic; they do not verify 4PLANET delivery or impact.</p></section>"
    : "<p>Background references for this mission are still being reviewed.</p>";
  // Reuse the approved mission domain and slug: no parallel topic register.
  const relatedMissions = localMissionRecords.filter((candidate) =>
    candidate.domain === m.domain && candidate.slug !== m.slug);
  const relatedMissionHtml = relatedMissions.length
    ? "<nav data-4planet-prerender-content='mission-related' aria-label='Related missions'>" +
        "<h2>Explore related " + esc(m.domain) + " missions</h2><ul>" +
        relatedMissions.map((candidate) =>
          "<li><a href='/missions/" + esc(candidate.slug) + "'>" +
          esc(candidate.name) + " — " + esc(candidate.hero) + "</a></li>").join("") +
        "</ul></nav>"
    : "";
  const title = m.name + " — " + m.hero + " | 4PLANET";
  const body = "<main data-4planet-prerender-content='mission'><p>4PLANET / " + esc(m.domain) + " / MISSION</p>" +
    "<h1>" + esc(m.name) + "</h1><p>" + esc(m.hero) + "</p>" +
    "<h2>What this mission addresses</h2><p>" + esc(m.issue) + "</p>" +
    "<h2>Why it matters</h2><p>" + esc(m.whyItMatters) + "</p>" +
    "<h2>The proposed approach</h2><p>" + esc(m.thesis) + "</p>" +
    "<h2>What could help</h2><p>" + esc(m.whatCanHelp) + "</p>" +
    "<h2>4PLANET's role</h2><p>" + esc(m.fourPlanetRole) + "</p>" +
    "<h2>Current development status</h2><p>" + esc(m.currentStatus) + "</p>" +
    referenceHtml +
    "<p>A development status is not proof that an ecological outcome has been delivered.</p>" +
    relatedMissionHtml +
    "<p>Explore the <a href='/domains/" + esc(m.domain.replace("_", "").toLowerCase()) +
      "'>" + esc(m.domain) + " domain</a> and related living systems.</p>" +
    "<p><a href='/missions'>All missions</a> · <a href='/livingsystems/'>Explore living systems</a></p></main>";
  writeRoute(pathName, pageHtml({
    pathName, title, description: m.hero, body,
    jsonLd: { "@context": "https://schema.org", "@type": "WebPage",
      name: m.name, description: m.hero, url: origin + pathName,
      inLanguage: "en-GB",
      citation: backgroundSources.map((source) => source.url),
      isPartOf: { "@type": "CollectionPage", name: "4PLANET Missions", url: origin + "/missions" } },
  }));
}

const relatedPlacesForSpecies = (slug) =>
  places.filter((place) => (place.relatedSpecies || []).some((item) => item.slug === slug && item.state === "CURATED"));

writeRoute("/species", pageHtml({
  pathName: "/species",
  title: "Species — Source-grounded life intelligence | 4PLANET",
  description: "Explore source-grounded species profiles connected to reported observations, places and 4PLANET ATLAS.",
  body: `<main><h1>4PLANET SPECIES</h1><p>Source-grounded species profiles connected to Places and ATLAS.</p><ul>${species.map((item) => `<li><a href="/species/${esc(item.slug)}">${esc(item.commonName)} <em>${esc(item.scientificName)}</em></a></li>`).join("")}</ul><p><a href="/places">Explore Places</a> · <a href="/atlas">Explore ATLAS</a></p></main>`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4PLANET Species",
    url: origin + "/species",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: species.map((item, index) => ({ "@type": "ListItem", position: index + 1, url: origin + `/species/${item.slug}`, name: item.commonName })),
    },
  },
}));

writeRoute("/places", pageHtml({
  pathName: "/places",
  title: "Places — Explore the living planet | 4PLANET",
  description: "Source-grounded place intelligence connected to species, ecosystems, observations and 4PLANET ATLAS.",
  body: `<main><h1>4PLANET Places</h1><p>Enter the living planet through a source-grounded place.</p><ul>${places.map((place) => `<li><a href="/place/${esc(place.slug)}">${esc(place.name)}</a> — ${esc(place.summary)}</li>`).join("")}</ul><p><a href="/species">Explore Species</a> · <a href="/atlas">Explore ATLAS</a></p></main>`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4PLANET Places",
    url: origin + "/places",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: places.map((place, index) => ({ "@type": "ListItem", position: index + 1, url: origin + `/place/${place.slug}`, name: place.name })),
    },
  },
}));


const aboutStoryPath = "/about/story";
const aboutStoryTitle = "The living planet is not an abstract issue.";
const aboutStoryDescription = "It is the system beneath food, water, health, prosperity, freedom and almost everything people care about.";
writeRoute(aboutStoryPath, pageHtml({
  pathName: aboutStoryPath,
  title: aboutStoryTitle + " | 4PLANET",
  description: aboutStoryDescription,
  body: `<main><p>ABOUT 4PLANET / THE STORY</p><h1>${esc(aboutStoryTitle)}</h1><p>${esc(aboutStoryDescription)}</p><h2>Human life sits inside living systems.</h2><p>Forests move water. Oceans move heat and nutrients. Soil, insects, fungi, plants and animals make food systems possible. The separation between ‘people’ and ‘nature’ is useful on an organisation chart, but false in the world itself.</p><h2>Care is everywhere. Connection is not.</h2><p>Science, field organisations, communities, companies, funders and millions of people already care about the living world. Yet understanding, participation, delivery and proof are often fragmented across different systems. 4PLANET is being built to connect those parts without weakening scientific truth.</p><h2>Make the living planet easier to see, understand and help.</h2><p>4PLANET combines Living Planet Intelligence, public products, Missions, cultural storytelling and evidence-aware action pathways. The aim is not to make ecological complexity disappear. It is to make complexity navigable enough that more people can act intelligently inside it.</p><p><a href="/about/system">Explore the 4PLANET system</a> · <a href="/about/what-we-believe">What we believe</a> · <a href="/join">Find your part</a></p></main>`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: aboutStoryTitle,
    description: aboutStoryDescription,
    url: origin + aboutStoryPath,
    inLanguage: "en-GB",
    isPartOf: { "@type": "WebSite", name: "4PLANET", url: origin + "/" },
    publisher: { "@type": "Organization", name: "4PLANET", url: origin + "/" },
  },
}));

for (const item of species) {
  const pathName = `/species/${item.slug}`;
  const relatedPlaces = relatedPlacesForSpecies(item.slug);
  const relatedHtml = relatedPlaces.length
    ? `<h2>Related places</h2><ul>${relatedPlaces.map((place) => `<li><a href="/place/${esc(place.slug)}">${esc(place.name)}</a></li>`).join("")}</ul>`
    : "";
  const sourceUrls = item.sourceUrls ?? [];
  const sourcesHtml = sourceUrls.length ? `<h2>Sources</h2><ul>${sourceUrls.map((url) => `<li><a href="${esc(url)}">${esc(new URL(url).hostname.replace(/^www\\./, ""))}</a></li>`).join("")}</ul>` : "";
  const limitations = item.limitations ?? [];
  const limitationsHtml = limitations.length ? `<h2>What this does not establish</h2><ul>${limitations.map((limit) => `<li>${esc(limit)}</li>`).join("")}</ul>` : "";
  const atlasHref = item.atlasHref || "/atlas";
  writeRoute(pathName, pageHtml({
    pathName,
    title: item.title || `${item.commonName} (${item.scientificName}) — 4PLANET SPECIES`,
    description: item.description,
    image: item.image,
    body: `<main><p>4PLANET SPECIES</p><h1>${esc(item.commonName)}</h1><p><em>${esc(item.scientificName)}</em></p><p>${esc(item.description)}</p>${relatedHtml}${sourcesHtml}${limitationsHtml}<p><a href="${esc(atlasHref)}">Explore in ATLAS</a> · <a href="/species">All species</a></p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: item.title || item.commonName,
      description: item.description,
      url: origin + pathName,
      dateModified: item.reviewedAt || inventory.updatedAt,
      image: item.image ? origin + item.image : undefined,
      citation: sourceUrls,
      mainEntity: {
        "@type": "Taxon",
        name: item.commonName,
        alternateName: item.scientificName,
        scientificName: item.scientificName,
        taxonRank: "species",
      },
      subjectOf: item.atlasHref ? { "@type": "WebPage", url: origin + item.atlasHref, name: `${item.commonName} in 4PLANET ATLAS` } : undefined,
      disambiguatingDescription: limitations.length ? limitations.join(" ") : undefined,
      isPartOf: relatedPlaces.map((place) => ({ "@type": "WebPage", url: origin + `/place/${place.slug}`, name: place.name })),
    },
  }));
}

for (const place of places) {
  const pathName = `/place/${place.slug}`;
  const relatedSpecies = (place.relatedSpecies || []).filter((item) => item.state === "CURATED" && item.slug);
  writeRoute(pathName, pageHtml({
    pathName,
    title: place.title,
    description: place.description,
    body: `<main><p>4PLANET PLACE</p><h1>${esc(place.name)}</h1><p>${esc(place.summary)}</p><p><strong>Boundary:</strong> ${esc(place.truthBoundary)}</p><h2>Living systems</h2><ul>${place.ecosystems.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><h2>Related species</h2><ul>${relatedSpecies.map((item) => `<li><a href="/species/${esc(item.slug)}">${esc(item.label)} <em>${esc(item.scientificName)}</em></a></li>`).join("")}</ul><h2>Sources</h2><ul>${place.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.label)}</a> — ${esc(source.use)}</li>`).join("")}</ul><p><a href="/atlas">Explore in ATLAS</a> · <a href="/places">All places</a></p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: place.title,
      description: place.description,
      url: origin + pathName,
      about: { "@type": "Place", name: place.name },
      mainEntity: { "@type": "Place", name: place.name },
      citation: place.sources.map((source) => source.url),
      mentions: relatedSpecies.map((item) => ({ "@type": "Thing", name: item.label, alternateName: item.scientificName, url: origin + `/species/${item.slug}` })),
    },
  }));
}

for (const object of atlasObjects) {
  const pathName = `/atlas/${object.slug}`;
  writeRoute(pathName, pageHtml({
    pathName,
    title: object.title,
    description: object.description,
    body: `<main><p>${esc(object.eyebrow)}</p><h1>${esc(object.name)}</h1><p>${esc(object.summary)}</p><h2>Why it matters</h2><p>${esc(object.whyItMatters)}</p><h2>Current / available data</h2><ul>${object.availableData.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><h2>Sources</h2><ul>${object.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.label)}</a> — ${esc(source.use)}</li>`).join("")}</ul><h2>Limitations</h2><ul>${object.limitations.map((item) => `<li>${esc(item)}</li>`).join("")}</ul><p><a href="${esc(object.atlasHref)}">Open live ATLAS</a></p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: object.title,
      description: object.description,
      url: origin + pathName,
      dateModified: atlasDiscovery.updatedAt,
      author: { "@type": "Organization", name: "4PLANET" },
      publisher: { "@type": "Organization", name: "4PLANET" },
      about: { "@type": "Thing", name: object.name },
      citation: object.sources.map((source) => source.url),
      isPartOf: { "@type": "WebSite", name: "4PLANET", url: origin + "/" },
    },
  }));
}



const impactObjectIsReleasedForOrigin = (item) =>
  item?.publicationState === "READY_FOR_FOUNDER_RELEASE" && item?.canonicalOrigin === origin;
const impactProjects = (impactDiscovery.projects ?? []).filter(impactObjectIsReleasedForOrigin);
writeRoute("/impact", pageHtml({
  pathName: "/impact",
  title: "Impact — Find ecological action | 4PLANET",
  description: "Discover source-aware ecological projects, actors, places and solutions — with evidence and ways to act kept close.",
  image: "/assets/missions/rewild/hero.jpg",
  body: `<main><p>4PLANET IMPACT</p><h1>Find people bringing life back.</h1><p>Discover ecological projects, actors, places and solutions with original sources kept close.</p><ul>${impactProjects.map((project) => `<li><a href="/impact/project/${esc(project.slug)}">${esc(project.name)}</a> — ${esc(project.place)}</li>`).join("")}</ul></main>`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4PLANET Impact",
    url: origin + "/impact",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: impactProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.name,
        url: origin + `/impact/project/${project.slug}`,
      })),
    },
  },
}));

for (const project of impactProjects) {
  const pathName = `/impact/project/${project.slug}`;
  writeRoute(pathName, pageHtml({
    pathName,
    title: `${project.name} — Impact | 4PLANET`,
    description: project.description,
    image: project.image,
    body: `<main><p>4PLANET IMPACT / PROJECT</p><h1>${esc(project.name)}</h1><p>${esc(project.description)}</p><p><strong>Actor:</strong> <a href="/impact/actors/${esc(project.actor.slug)}">${esc(project.actor.name)}</a></p><p><strong>Place:</strong> ${esc(project.place)}</p><h2>Sources</h2><ul>${project.citations.map((url) => `<li><a href="${esc(url)}">${esc(new URL(url).hostname.replace(/^www\\./, ""))}</a></li>`).join("")}</ul><p><a href="/impact">Explore Impact</a> · <a href="/atlas">Open ATLAS</a></p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: project.name,
      description: project.description,
      url: origin + pathName,
      image: origin + project.image,
      citation: project.citations,
      about: { "@type": "Project", name: project.name },
      mentions: { "@type": "Organization", name: project.actor.name, url: origin + `/impact/actors/${project.actor.slug}` },
      spatialCoverage: { "@type": "Place", name: project.place },
      isPartOf: { "@type": "CollectionPage", name: "4PLANET Impact", url: origin + "/impact" },
    },
  }));
}

const impactActors = Array.from(new Map(impactProjects.map((project) => [project.actor.slug, project.actor])).values()).filter(impactObjectIsReleasedForOrigin);
for (const actor of impactActors) {
  const related = impactProjects.filter((project) => project.actor.slug === actor.slug);
  const citations = Array.from(new Set(related.flatMap((project) => project.citations)));
  const pathName = `/impact/actors/${actor.slug}`;
  writeRoute(pathName, pageHtml({
    pathName,
    title: `${actor.name} — Actor | 4PLANET Impact`,
    description: `Public actor record in 4PLANET Impact, connected to ${related.map((project) => project.name).join(", ")}.`,
    body: `<main><p>4PLANET IMPACT / ACTOR</p><h1>${esc(actor.name)}</h1><p>Public record. Listing does not imply 4PLANET partnership or endorsement.</p><h2>Projects in this Gold slice</h2><ul>${related.map((project) => `<li><a href="/impact/project/${esc(project.slug)}">${esc(project.name)}</a></li>`).join("")}</ul><h2>Sources</h2><ul>${citations.map((url) => `<li><a href="${esc(url)}">${esc(new URL(url).hostname.replace(/^www\\./, ""))}</a></li>`).join("")}</ul></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${actor.name} — Actor | 4PLANET Impact`,
      url: origin + pathName,
      mainEntity: { "@type": "Thing", "@id": actor.id, name: actor.name },
      about: { "@type": "Thing", "@id": actor.id, name: actor.name },
      subjectOf: related.map((project) => ({ "@type": "WebPage", name: project.name, url: origin + `/impact/project/${project.slug}` })),
    },
  }));
}

const earthNow = discovery.earthNow;
writeRoute("/now", pageHtml({
  pathName: "/now",
  title: earthNow.title,
  description: earthNow.description,
  body: `<main><p>4PLANET / EARTH NOW</p><h1>What is happening on Earth right now?</h1><p>${esc(earthNow.answer)}</p><p><strong>LATEST AVAILABLE — NOT ONE LIVE CLOCK.</strong> ${esc(earthNow.truthBoundary)}</p><h2>Signals</h2><ul>${earthNow.signals.map((signal) => `<li><a href="${esc(signal.href)}">${esc(signal.label)}</a> — ${esc(signal.detail)} <small>${esc(signal.layers)}</small></li>`).join("")}</ul><h2>Permanent guides</h2><ul>${discoveryTopics.map((topic) => `<li><a href="/${esc(topic.slug)}">${esc(topic.name)}</a></li>`).join("")}</ul><p><a href="${esc(earthNow.atlasHref)}">Open Earth in 4PLANET ATLAS</a></p></main>`,
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: earthNow.title,
        description: earthNow.description,
        url: origin + "/now",
        dateModified: discovery.updatedAt,
        inLanguage: "en-GB",
        publisher: { "@type": "Organization", name: "4PLANET", url: origin + "/" },
      },
      {
        "@type": "ItemList",
        name: "4PLANET Earth Now signals",
        itemListElement: earthNow.signals.map((signal, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: signal.label,
          url: origin + signal.href,
        })),
      },
    ],
  },
}));

for (const topic of discoveryTopics) {
  const pathName = `/${topic.slug}`;
  writeRoute(pathName, pageHtml({
    pathName,
    title: topic.title,
    description: topic.description,
    body: `<main><p>4PLANET / ${esc(topic.domain)}</p><h1>${esc(topic.name)}</h1><p>${esc(topic.answer)}</p><h2>Key facts</h2><ul>${topic.keyFacts.map((fact) => `<li>${esc(fact)}</li>`).join("")}</ul><h2>What is happening</h2><p>${esc(topic.happening)}</p><h2>Why it matters</h2><p>${esc(topic.whyItMatters)}</p><h2>What the sources establish</h2><p>${esc(topic.sourceEstablishes)}</p><h2>What they do not establish</h2><p>${esc(topic.sourceDoesNotEstablish)}</p><h2>Sources</h2><ul>${topic.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.authority)} — ${esc(source.label)}</a></li>`).join("")}</ul><h2>Continue through 4PLANET</h2><ul>${topic.related.map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`).join("")}</ul><p><a href="${esc(topic.atlasHref)}">Explore in 4PLANET ATLAS</a></p><p>Last checked: ${esc(discovery.updatedAt)}</p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: topic.title,
          description: topic.description,
          url: origin + pathName,
          dateModified: discovery.updatedAt,
          inLanguage: "en-GB",
          publisher: { "@type": "Organization", name: "4PLANET", url: origin + "/" },
          about: { "@type": "Thing", name: topic.name },
          citation: topic.sources.map((source) => source.url),
          isPartOf: { "@type": "WebSite", name: "4PLANET", url: origin + "/" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "4PLANET", item: origin + "/" },
            { "@type": "ListItem", position: 2, name: topic.name, item: origin + pathName },
          ],
        },
      ],
    },
  }));
}

console.log(`Prerendered discovery HTML: ${species.length} species + ${places.length} places + ${atlasObjects.length} ATLAS objects + ${discoveryTopics.length} canonical topics + ${impactProjects.length} Impact projects + ${impactActors.length} Impact actors + Earth Now + indexes`);
