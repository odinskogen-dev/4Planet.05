import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const inv = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryInventory.json"), "utf8"));
const atlas = JSON.parse(fs.readFileSync(path.join(root, "src/data/atlasDiscovery.json"), "utf8"));
const discovery = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryTopics.json"), "utf8"));
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const base = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

function meta(html, selector, value) {
  const [kind, key] = selector.split(":");
  const attr = kind === "property" ? "property" : "name";
  const matcher = new RegExp(`<meta\\s+${attr}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function page(input) {
  const canonical = origin + input.pathName;
  let html = base.replace(/<title>[^<]*<\/title>/i, `<title>${esc(input.title)}</title>`);
  for (const [selector, value] of [
    ["name:description", input.description],
    ["name:robots", "index,follow,max-image-preview:large"],
    ["property:og:title", input.title],
    ["property:og:description", input.description],
    ["property:og:url", canonical],
    ["name:twitter:title", input.title],
    ["name:twitter:description", input.description],
  ]) html = meta(html, selector, value);
  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${esc(canonical)}" />\n    <script type="application/ld+json">${json(input.jsonLd)}</script>\n  </head>`,
  );
  return html.replace('<div id="root"></div>', `<div id="root">${input.body}</div>`);
}

function write(route, html) {
  const dir = path.join(dist, ...route.split("/").filter(Boolean));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

const species = (inv.species || []).filter((item) => item.indexable);
const places = (inv.places || []).filter((item) => item.indexable);
const atlasObjects = (atlas.objects || []).filter((item) => item.indexable === true);
const topics = (discovery.topics || []).filter((item) => item.indexable === true);

write("/species", page({
  pathName: "/species",
  title: "Species — Source-grounded life intelligence | 4PLANET",
  description: "Explore source-grounded species profiles connected to reported observations, places and 4PLANET ATLAS.",
  body: `<main><h1>4PLANET SPECIES</h1><p>Explore the current public species profiles that have passed 4PLANET’s bounded discovery threshold. Each profile uses a canonical species identity and connects into the same ATLAS and Living Systems infrastructure.</p><p>Reported observations are source records with time, location, precision and sampling limitations. They are not population estimates, complete range maps, migration tracks or proof that an animal is currently at a recorded point.</p><ul>${species.map((item) => `<li><a href="/species/${esc(item.slug)}">${esc(item.commonName)} <em>${esc(item.scientificName)}</em></a></li>`).join("")}</ul><a href="/atlas">Explore ATLAS</a></main>`,
  jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "4PLANET Species", url: origin + "/species" },
}));

write("/places", page({
  pathName: "/places",
  title: "Places — Explore the living planet | 4PLANET",
  description: "Source-grounded place intelligence connected to species, ecosystems, observations and 4PLANET ATLAS.",
  body: `<main><h1>4PLANET Places</h1><ul>${places.map((item) => `<li><a href="/place/${esc(item.slug)}">${esc(item.name)}</a> — ${esc(item.summary)}</li>`).join("")}</ul><a href="/atlas">Explore ATLAS</a></main>`,
  jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "4PLANET Places", url: origin + "/places" },
}));

for (const item of species) {
  const route = `/species/${item.slug}`;
  write(route, page({
    pathName: route,
    title: `${item.commonName} (${item.scientificName}) — 4PLANET SPECIES`,
    description: item.description,
    body: `<main><p>4PLANET SPECIES</p><h1>${esc(item.commonName)}</h1><p><em>${esc(item.scientificName)}</em></p><p>${esc(item.description)}</p><h2>How to read this profile</h2><p>4PLANET keeps species identity, reported observations and interpretation separate. An occurrence record can show that a source reported an observation at a place and time; it does not by itself establish abundance, a complete range, a migration route or a current animal position.</p><p>The same canonical species identity connects this profile to ATLAS. Source, date, spatial precision, rights and known limitations remain part of the evidence, and missing information stays unknown rather than being filled with unsupported claims.</p><a href="/atlas">Explore in ATLAS</a> · <a href="/species">All species</a> · <a href="/living-systems">Living Systems</a></main>`,
    jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: item.commonName, description: item.description, url: origin + route, about: { "@type": "Thing", name: item.commonName, alternateName: item.scientificName } },
  }));
}

for (const item of places) {
  const route = `/place/${item.slug}`;
  write(route, page({
    pathName: route,
    title: item.title,
    description: item.description,
    body: `<main><p>4PLANET PLACE</p><h1>${esc(item.name)}</h1><p>${esc(item.summary)}</p><h2>Living systems</h2><ul>${item.ecosystems.map((value) => `<li>${esc(value)}</li>`).join("")}</ul><h2>Sources</h2><ul>${item.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.label)}</a></li>`).join("")}</ul><a href="/atlas">Explore in ATLAS</a> · <a href="/places">All places</a></main>`,
    jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: item.title, description: item.description, url: origin + route, about: { "@type": "Place", name: item.name, sameAs: item.sources.map((source) => source.url) } },
  }));
}

for (const item of atlasObjects) {
  const route = `/atlas/${item.slug}`;
  write(route, page({
    pathName: route,
    title: item.title,
    description: item.description,
    body: `<main><p>${esc(item.eyebrow)}</p><h1>${esc(item.name)}</h1><p>${esc(item.summary)}</p><h2>Why it matters</h2><p>${esc(item.whyItMatters)}</p><h2>Current / available data</h2><ul>${item.availableData.map((value) => `<li>${esc(value)}</li>`).join("")}</ul><h2>Sources</h2><ul>${item.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.label)}</a> — ${esc(source.use)}</li>`).join("")}</ul><h2>Limitations</h2><ul>${item.limitations.map((value) => `<li>${esc(value)}</li>`).join("")}</ul><a href="${esc(item.atlasHref)}">Open live ATLAS</a></main>`,
    jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: item.title, description: item.description, url: origin + route, dateModified: atlas.updatedAt, author: { "@type": "Organization", name: "4PLANET" }, publisher: { "@type": "Organization", name: "4PLANET" }, about: { "@type": "Thing", name: item.name }, citation: item.sources.map((source) => source.url), isPartOf: { "@type": "WebSite", name: "4PLANET", url: origin + "/" } },
  }));
}

const now = discovery.earthNow;
write("/now", page({
  pathName: "/now",
  title: now.title,
  description: now.description,
  body: `<main><p>4PLANET / EARTH NOW</p><h1>What is happening on Earth right now?</h1><p>${esc(now.answer)}</p><p><strong>LATEST AVAILABLE — NOT ONE LIVE CLOCK.</strong> ${esc(now.truthBoundary)}</p><h2>Signals</h2><ul>${now.signals.map((signal) => `<li><a href="${esc(signal.href)}">${esc(signal.label)}</a> — ${esc(signal.detail)} <small>${esc(signal.layers)}</small></li>`).join("")}</ul><h2>Permanent guides</h2><ul>${topics.map((topic) => `<li><a href="/${esc(topic.slug)}">${esc(topic.name)}</a></li>`).join("")}</ul><a href="${esc(now.atlasHref)}">Open Earth in 4PLANET ATLAS</a></main>`,
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", name: now.title, description: now.description, url: origin + "/now", dateModified: discovery.updatedAt, publisher: { "@type": "Organization", name: "4PLANET", url: origin + "/" } },
      { "@type": "ItemList", name: "4PLANET Earth Now signals", itemListElement: now.signals.map((signal, index) => ({ "@type": "ListItem", position: index + 1, name: signal.label, url: origin + signal.href })) },
    ],
  },
}));

for (const topic of topics) {
  const route = `/${topic.slug}`;
  write(route, page({
    pathName: route,
    title: topic.title,
    description: topic.description,
    body: `<main><p>4PLANET / ${esc(topic.domain)}</p><h1>${esc(topic.name)}</h1><p>${esc(topic.answer)}</p><h2>Key facts</h2><ul>${topic.keyFacts.map((fact) => `<li>${esc(fact)}</li>`).join("")}</ul><h2>What is happening</h2><p>${esc(topic.happening)}</p><h2>Why it matters</h2><p>${esc(topic.whyItMatters)}</p><h2>What the sources establish</h2><p>${esc(topic.sourceEstablishes)}</p><h2>What they do not establish</h2><p>${esc(topic.sourceDoesNotEstablish)}</p><h2>Sources</h2><ul>${topic.sources.map((source) => `<li><a href="${esc(source.url)}">${esc(source.authority)} — ${esc(source.label)}</a></li>`).join("")}</ul><h2>Continue through 4PLANET</h2><ul>${topic.related.map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`).join("")}</ul><a href="${esc(topic.atlasHref)}">Explore in 4PLANET ATLAS</a><p>Last checked: ${esc(discovery.updatedAt)}</p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", name: topic.title, description: topic.description, url: origin + route, dateModified: discovery.updatedAt, inLanguage: "en-GB", publisher: { "@type": "Organization", name: "4PLANET", url: origin + "/" }, about: { "@type": "Thing", name: topic.name }, citation: topic.sources.map((source) => source.url), isPartOf: { "@type": "WebSite", name: "4PLANET", url: origin + "/" } },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "4PLANET", item: origin + "/" }, { "@type": "ListItem", position: 2, name: topic.name, item: origin + route }] },
      ],
    },
  }));
}

console.log(`Prerendered discovery HTML: ${species.length} species + ${places.length} places + ${atlasObjects.length} ATLAS objects + ${topics.length} canonical topics + Earth Now + 2 indexes`);
