import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) throw new Error("dist/index.html missing; run Vite build first");

const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const route = "/atlas";
const canonical = origin + route;
const title = "4PLANET ATLAS — Planetary Intelligence Map";
const description = "Explore the living planet through source-grounded Earth signals, biodiversity observations, species, places and 4PLANET ATLAS.";
const image = origin + "/og.png";
const base = fs.readFileSync(indexPath, "utf8");

const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const json = (v) => JSON.stringify(v).replaceAll("<", "\\u003c");

let html = base
  .replace(/<title>[\s\S]*?<\/title>/i, "")
  .replace(/<meta\s+name=["']description["'][^>]*>/gi, "")
  .replace(/<meta\s+name=["']robots["'][^>]*>/gi, "")
  .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
  .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "")
  .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");

const structured = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "4PLANET ATLAS",
  alternateName: "4Planet Atlas",
  description,
  url: canonical,
  applicationCategory: "ScienceApplication",
  operatingSystem: "Any modern web browser",
  isAccessibleForFree: true,
  creator: { "@type": "Organization", name: "4PLANET_", url: origin + "/" },
  about: [
    { "@type": "Thing", name: "Earth observation" },
    { "@type": "Thing", name: "Biodiversity observations" },
    { "@type": "Thing", name: "Living systems" }
  ]
};

const head = [
  `<title>${esc(title)}</title>`,
  `<meta name="description" content="${esc(description)}">`,
  '<meta name="robots" content="index,follow,max-image-preview:large">',
  `<link rel="canonical" href="${esc(canonical)}">`,
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="4PLANET ATLAS">',
  '<meta property="og:locale" content="en_GB">',
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(description)}">`,
  `<meta property="og:url" content="${esc(canonical)}">`,
  `<meta property="og:image" content="${esc(image)}">`,
  '<meta name="twitter:card" content="summary_large_image">',
  `<meta name="twitter:title" content="${esc(title)}">`,
  `<meta name="twitter:description" content="${esc(description)}">`,
  `<meta name="twitter:image" content="${esc(image)}">`,
  `<script type="application/ld+json" data-4planet-atlas-prerender="true">${json(structured)}</script>`
].join("\n    ");

html = html.replace("</head>", `    ${head}\n  </head>`);

const crawlableBody = `
<main id="atlas-search-entry">
  <p>4PLANET ATLAS</p>
  <h1>One planet. Many ways to see it.</h1>
  <p>Explore source-grounded planetary intelligence through Earth observation, biodiversity records, species, places and living systems.</p>
  <h2>Explore the living planet</h2>
  <ul>
    <li><a href="/places">Places — source-grounded ecological context</a></li>
    <li><a href="https://4species.com/species/">Species — identity, evidence and reported observations</a></li>
    <li><a href="https://4planet.org/livingsystems/">Living Systems — relationships, pressures and responses</a></li>
  </ul>
  <h2>Data sources visible in ATLAS</h2>
  <p>ATLAS surfaces public source data from providers including NASA Earthdata/GIBS, GBIF, OBIS, USGS and NOAA. Each layer retains its own scope and limitations.</p>
  <p>Occurrence records are reported observations, not complete range, abundance, population trend or live animal tracking.</p>
</main>`.trim();

html = html.replace('<div id="root"></div>', `<div id="root">${crawlableBody}</div>`);

const target = path.join(dist, "atlas");
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(path.join(target, "index.html"), html, "utf8");
console.log(`Prerendered ATLAS search entry: ${canonical}`);
