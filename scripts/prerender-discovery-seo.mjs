import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const inv = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryInventory.json"), "utf8"));
const atlas = JSON.parse(fs.readFileSync(path.join(root, "src/data/atlasDiscovery.json"), "utf8"));
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const base = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (v = "") => String(v)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const json = (v) => JSON.stringify(v).replaceAll("<", "\\u003c");

function meta(html, selector, value) {
  const [kind, key] = selector.split(":");
  const attribute = kind === "property" ? "property" : "name";
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${esc(value)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function page(spec) {
  const canonical = origin + spec.pathName;
  let html = base.replace(/<title>[^<]*<\/title>/i, `<title>${esc(spec.title)}</title>`);
  for (const [selector, value] of [
    ["name:description", spec.description],
    ["name:robots", "index,follow,max-image-preview:large"],
    ["property:og:title", spec.title],
    ["property:og:description", spec.description],
    ["property:og:url", canonical],
    ["name:twitter:title", spec.title],
    ["name:twitter:description", spec.description],
  ]) html = meta(html, selector, value);
  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${esc(canonical)}" />\n    <script type="application/ld+json">${json(spec.jsonLd)}</script>\n  </head>`,
  );
  return html.replace('<div id="root"></div>', `<div id="root">${spec.body}</div>`);
}

function write(route, html) {
  const dir = path.join(dist, ...route.split("/").filter(Boolean));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
}

const species = (inv.species || []).filter((item) => item.indexable);
const places = (inv.places || []).filter((item) => item.indexable);
const atlasObjects = (atlas.objects || []).filter((item) => item.indexable === true);

write("/species", page({
  pathName: "/species",
  title: "Species — Source-grounded life intelligence | 4PLANET",
  description: "Explore source-grounded species profiles connected to reported observations, places and 4PLANET ATLAS.",
  body: `<main><h1>4PLANET SPECIES</h1><ul>${species.map((s) => `<li><a href="/species/${esc(s.slug)}">${esc(s.commonName)} <em>${esc(s.scientificName)}</em></a></li>`).join("")}</ul><a href="/atlas">Explore ATLAS</a></main>`,
  jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "4PLANET Species", url: origin + "/species" },
}));

write("/places", page({
  pathName: "/places",
  title: "Places — Explore the living planet | 4PLANET",
  description: "Source-grounded place intelligence connected to species, ecosystems, observations and 4PLANET ATLAS.",
  body: `<main><h1>4PLANET Places</h1><ul>${places.map((p) => `<li><a href="/place/${esc(p.slug)}">${esc(p.name)}</a> — ${esc(p.summary)}</li>`).join("")}</ul><a href="/atlas">Explore ATLAS</a></main>`,
  jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "4PLANET Places", url: origin + "/places" },
}));

for (const s of species) {
  const route = `/species/${s.slug}`;
  write(route, page({
    pathName: route,
    title: `${s.commonName} (${s.scientificName}) — 4PLANET SPECIES`,
    description: s.description,
    body: `<main><p>4PLANET SPECIES</p><h1>${esc(s.commonName)}</h1><p><em>${esc(s.scientificName)}</em></p><p>${esc(s.description)}</p><a href="/atlas">Explore in ATLAS</a> · <a href="/species">All species</a></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: s.commonName,
      description: s.description,
      url: origin + route,
      about: { "@type": "Thing", name: s.commonName, alternateName: s.scientificName },
    },
  }));
}

for (const p of places) {
  const route = `/place/${p.slug}`;
  write(route, page({
    pathName: route,
    title: p.title,
    description: p.description,
    body: `<main><p>4PLANET PLACE</p><h1>${esc(p.name)}</h1><p>${esc(p.summary)}</p><h2>Living systems</h2><ul>${p.ecosystems.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><h2>Sources</h2><ul>${p.sources.map((s) => `<li><a href="${esc(s.url)}">${esc(s.label)}</a></li>`).join("")}</ul><a href="/atlas">Explore in ATLAS</a> · <a href="/places">All places</a></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: p.title,
      description: p.description,
      url: origin + route,
      about: { "@type": "Place", name: p.name, sameAs: p.sources.map((s) => s.url) },
    },
  }));
}

for (const object of atlasObjects) {
  const route = `/atlas/${object.slug}`;
  write(route, page({
    pathName: route,
    title: object.title,
    description: object.description,
    body: `<main><p>${esc(object.eyebrow)}</p><h1>${esc(object.name)}</h1><p>${esc(object.summary)}</p><h2>Why it matters</h2><p>${esc(object.whyItMatters)}</p><h2>Current / available data</h2><ul>${object.availableData.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><h2>Sources</h2><ul>${object.sources.map((s) => `<li><a href="${esc(s.url)}">${esc(s.label)}</a> — ${esc(s.use)}</li>`).join("")}</ul><h2>Limitations</h2><ul>${object.limitations.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><a href="${esc(object.atlasHref)}">Open live ATLAS</a></main>`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: object.title,
      description: object.description,
      url: origin + route,
      dateModified: atlas.updatedAt,
      author: { "@type": "Organization", name: "4PLANET" },
      publisher: { "@type": "Organization", name: "4PLANET" },
      about: { "@type": "Thing", name: object.name },
      citation: object.sources.map((s) => s.url),
      isPartOf: { "@type": "WebSite", name: "4PLANET", url: origin + "/" },
    },
  }));
}

console.log(`Prerendered discovery HTML: ${species.length} species + ${places.length} places + ${atlasObjects.length} ATLAS objects + 2 indexes`);
