import fs from "node:fs";
import path from "node:path";
import { readStories, readSignals, readImages, readFoundingEdition, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) throw new Error("dist/index.html is missing; run Vite build before Magazine SEO prerender");

const baseHtml = fs.readFileSync(indexPath, "utf8");
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const stories = readStories();
const signals = readSignals();
const images = readImages();
const foundingEdition = readFoundingEdition();

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
  const json = JSON.stringify(meta.jsonLd || { "@context": "https://schema.org", "@type": "WebPage", name: meta.title, description: meta.description, url: meta.canonical }).replaceAll("<", "\\u003c");
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
const absoluteMagazineImage = absoluteUrl(origin, magazineImage);
const magazineCanonical = absoluteUrl(origin, "/magazine");
writeRoute("/magazine", {
  title: "4PLANET MAGAZINE — Nature, people, engineering and what works",
  description: "Stories and signals about the living planet — species, places, people, science, engineering, solutions and culture.",
  canonical: magazineCanonical,
  image: absoluteMagazineImage,
  imageAlt: magazineAlt,
  type: "website",
  jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "4PLANET MAGAZINE", description: "Stories and signals about the living planet.", url: magazineCanonical, isPartOf: { "@type": "WebSite", name: "4PLANET_", url: absoluteUrl(origin, "/") } },
});

const informationPages = [
  { route: "/magazine/about", title: "About 4PLANET MAGAZINE", description: "The editorial purpose, independence rules and current publication state of 4PLANET MAGAZINE." },
  { route: "/magazine/sources", title: "Sources & Method — 4PLANET MAGAZINE", description: "How 4PLANET MAGAZINE handles sources, claims, uncertainty, rights and editorial release." },
  { route: "/magazine/corrections", title: "Corrections — 4PLANET MAGAZINE", description: "The 4PLANET MAGAZINE corrections and transparency desk." },
  { route: "/magazine/archive", title: "Archive — 4PLANET MAGAZINE", description: "Browse full stories and source-backed Planet Signals from 4PLANET MAGAZINE." },
];
for (const page of informationPages) {
  const canonical = absoluteUrl(origin, page.route);
  writeRoute(page.route, { ...page, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, jsonLd: { "@context": "https://schema.org", "@type": page.route.endsWith("archive") ? "CollectionPage" : "WebPage", name: page.title, description: page.description, url: canonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical } } });
}

for (const story of stories) {
  const imageMeta = images[story.image] || {};
  const canonical = absoluteUrl(origin, `/magazine/${story.slug}`);
  const image = absoluteUrl(origin, imageMeta.src || "/og.png");
  const imageAlt = imageMeta.alt || story.title;
  const type = story.mode === "FAST" && story.publishedAt ? "NewsArticle" : "Article";
  const jsonLd = {
    "@context": "https://schema.org", "@type": type, headline: story.title, description: story.dek, image: [image], mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: story.byline || "4PLANET MAGAZINE" },
    publisher: { "@type": "Organization", name: "4PLANET MAGAZINE", url: magazineCanonical },
    isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical },
    articleSection: story.lane || story.category, keywords: Array.isArray(story.tags) ? story.tags.join(", ") : undefined,
    ...(story.publishedAt ? { datePublished: story.publishedAt } : {}), ...(story.updatedAt ? { dateModified: story.updatedAt } : {}),
  };
  writeRoute(`/magazine/${story.slug}`, { title: `${story.title} | 4PLANET MAGAZINE`, description: story.dek, canonical, image, imageAlt, type: "article", section: story.lane || story.category, tags: Array.isArray(story.tags) ? story.tags : [], jsonLd });
}

for (const signal of signals) {
  const route = `/magazine/signals/${signal.slug}`;
  const canonical = absoluteUrl(origin, route);
  writeRoute(route, {
    title: `${signal.title} | PLANET SIGNAL — 4PLANET MAGAZINE`, description: signal.dek, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, type: "article", section: "Planet Signal", tags: signal.topics || [],
    jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: signal.title, description: signal.dek, mainEntityOfPage: canonical, author: { "@type": "Organization", name: "4PLANET MAGAZINE" }, publisher: { "@type": "Organization", name: "4PLANET MAGAZINE", url: magazineCanonical }, isPartOf: { "@type": "CreativeWorkSeries", name: "PLANET SIGNAL", url: magazineCanonical }, citation: signal.sourceUrl, articleSection: "Planet Signal", keywords: Array.isArray(signal.topics) ? signal.topics.join(", ") : undefined },
  });
}

for (const record of foundingEdition.items) {
  const route = `/magazine/stories/${record.id}`;
  const canonical = absoluteUrl(origin, route);
  writeRoute(route, { title: `${record.title} — Pre-publication record | 4PLANET MAGAZINE`, description: record.summary, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, robots: "noindex,follow,noarchive,max-image-preview:large", type: "website", jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: record.title, description: record.summary, url: canonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE — Founding Edition working records", url: magazineCanonical }, additionalType: "https://schema.org/DigitalDocument" } });
}

console.log(`Prerendered Magazine metadata for ${stories.length} stories + ${signals.length} signals + ${informationPages.length} info pages + ${foundingEdition.items.length} working records at ${origin}`);
