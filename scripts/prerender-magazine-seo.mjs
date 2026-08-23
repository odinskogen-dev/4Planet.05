import fs from "node:fs";
import path from "node:path";
import { readStories, readImages, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) throw new Error("dist/index.html is missing; run Vite build before Magazine SEO prerender");

const baseHtml = fs.readFileSync(indexPath, "utf8");
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const stories = readStories();
const images = readImages();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-4planet-prerender[^>]*>[\s\S]*?<\/script>/gi, "");
}

function headMarkup(meta) {
  const json = JSON.stringify(meta.jsonLd).replaceAll("<", "\\u003c");
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<meta name="robots" content="${escapeHtml(meta.robots || "index,follow,max-image-preview:large")}">`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}">`,
    `<meta property="og:type" content="${escapeHtml(meta.type || "website")}">`,
    `<meta property="og:site_name" content="4PLANET MAGAZINE">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}">`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}">`,
    `<meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    ...(meta.section ? [`<meta property="article:section" content="${escapeHtml(meta.section)}">`] : []),
    ...(meta.tags || []).map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`),
    `<script type="application/ld+json" data-4planet-prerender="true">${json}</script>`,
  ].join("\n    ");
}

function writeRoute(route, meta) {
  const clean = stripManagedHead(baseHtml);
  const html = clean.replace("</head>", `    ${headMarkup(meta)}\n  </head>`);
  const target = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

const magazineImage = images.m4gazineHero?.src || "/og.png";
const magazineAlt = images.m4gazineHero?.alt || "4PLANET MAGAZINE";
const magazineCanonical = absoluteUrl(origin, "/magazine");
writeRoute("/magazine", {
  title: "4PLANET MAGAZINE — What Holds",
  description: "Stories about the living planet — species, places, people, systems, solutions, innovation and culture.",
  canonical: magazineCanonical,
  image: absoluteUrl(origin, magazineImage),
  imageAlt: magazineAlt,
  type: "website",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4PLANET MAGAZINE",
    description: "Stories about the living planet — species, places, people, systems, solutions, innovation and culture.",
    url: magazineCanonical,
    isPartOf: { "@type": "WebSite", name: "4PLANET_", url: absoluteUrl(origin, "/") },
  },
});

for (const story of stories) {
  const imageMeta = images[story.image] || {};
  const canonical = absoluteUrl(origin, `/magazine/${story.slug}`);
  const image = absoluteUrl(origin, imageMeta.src || "/og.png");
  const imageAlt = imageMeta.alt || story.title;
  const type = story.mode === "FAST" && story.publishedAt ? "NewsArticle" : "Article";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    headline: story.title,
    description: story.dek,
    image: [image],
    mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: "4PLANET_" },
    publisher: { "@type": "Organization", name: "4PLANET_", url: absoluteUrl(origin, "/") },
    isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical },
    articleSection: story.lane || story.category,
    keywords: Array.isArray(story.tags) ? story.tags.join(", ") : undefined,
    ...(story.publishedAt ? { datePublished: story.publishedAt } : {}),
    ...(story.updatedAt ? { dateModified: story.updatedAt } : {}),
  };

  writeRoute(`/magazine/${story.slug}`, {
    title: `${story.title} | 4PLANET MAGAZINE`,
    description: story.dek,
    canonical,
    image,
    imageAlt,
    type: "article",
    section: story.lane || story.category,
    tags: Array.isArray(story.tags) ? story.tags : [],
    jsonLd,
  });
}

console.log(`Prerendered Magazine metadata for ${stories.length + 1} routes at ${origin}`);
