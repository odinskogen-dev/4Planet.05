import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryInventory.json"), "utf8"));
const atlasDiscovery = JSON.parse(fs.readFileSync(path.join(root, "src/data/atlasDiscovery.json"), "utf8"));
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const base = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (value = "") =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

function setMeta(html, selector, value) {
  const [kind, key] = selector.split(":");
  const attr = kind === "property" ? "property" : "name";
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function pageHtml({ pathName, title, description, body, jsonLd }) {
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
  ]) html = setMeta(html, selector, value);

  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${esc(canonical)}" />\n    <script type="application/ld+json">${json(jsonLd)}</script>\n  </head>`,
  );
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

function writeRoute(pathName, html) {
  const target = path.join(dist, ...pathName.split("/").filter(Boolean));
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, "index.html"), html, "utf8");
}

const species = (inventory.species || []).filter((item) => item.indexable === true);
const places = (inventory.places || []).filter((item) => item.indexable === true);
const atlasObjects = (atlasDiscovery.objects || []).filter((item) => item.indexable === true);

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

for (const item of species) {
  const pathName = `/species/${item.slug}`;
  const relatedPlaces = relatedPlacesForSpecies(item.slug);
  const relatedHtml = relatedPlaces.length
    ? `<h2>Related places</h2><ul>${relatedPlaces.map((place) => `<li><a href="/place/${esc(place.slug)}">${esc(place.name)}</a></li>`).join("")}</ul>`
    : "";
  writeRoute(pathName, pageHtml({
    pathName,
    title: `${item.commonName} (${item.scientificName}) — 4PLANET SPECIES`,
    description: item.description,
    body: `<main><p>4PLANET SPECIES</p><h1>${esc(item.commonName)}</h1><p><em>${esc(item.scientificName)}</em></p><p>${esc(item.description)}</p>${relatedHtml}<p><a href="/atlas">Explore in ATLAS</a> · <a href="/species">All species</a></p></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: item.commonName,
      description: item.description,
      url: origin + pathName,
      about: { "@type": "Thing", name: item.commonName, alternateName: item.scientificName },
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

console.log(`Prerendered discovery HTML: ${species.length} species + ${places.length} places + ${atlasObjects.length} ATLAS objects + 2 indexes`);
