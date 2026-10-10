import fs from "node:fs";
import path from "node:path";
import { readStories, readImages, readFoundingEdition, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) throw new Error("dist/index.html is missing; run Vite build before Magazine SEO prerender");

const baseHtml = fs.readFileSync(indexPath, "utf8");
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const stories = readStories();
const images = readImages();
const foundingEdition = readFoundingEdition();

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
  const json = JSON.stringify(meta.jsonLd || {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: meta.title,
    description: meta.description,
    url: meta.canonical,
  }).replaceAll("<", "\\u003c");
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

function blockMarkup(block) {
  const text = escapeHtml(block?.t || "");
  if (!text) return "";
  if (block.k === "sub") return `<h2>${text}</h2>`;
  if (block.k === "quote") return `<blockquote><p>${text}</p></blockquote>`;
  if (block.k === "lead") return `<p class="mag-prerender-lead">${text}</p>`;
  return `<p>${text}</p>`;
}

function relatedStoryLinks(story, limit = 3) {
  return stories
    .filter((candidate) => candidate.slug !== story.slug)
    .map((candidate) => {
      const sharedTags = (candidate.tags || []).filter((tag) => (story.tags || []).includes(tag)).length;
      const score = sharedTags * 3 + (candidate.lane === story.lane ? 2 : 0) + (candidate.franchise === story.franchise ? 2 : 0);
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

function storyBodyMarkup(story) {
  const related = relatedStoryLinks(story);
  const pathway = story.pathway
    ? `<p><a href="${escapeHtml(story.pathway.to)}">${escapeHtml(story.pathway.label)} →</a></p>`
    : "";
  const relatedMarkup = related.length
    ? `<aside aria-label="Related stories"><h2>Continue exploring</h2><ul>${related.map((item) => `<li><a href="/magazine/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></li>`).join("")}</ul></aside>`
    : "";
  return `<article data-4planet-prerender-content="magazine-story"><header><p>4PLANET MAGAZINE · ${escapeHtml(story.lane || story.category || "STORY")}</p><h1>${escapeHtml(story.title)}</h1><p>${escapeHtml(story.dek)}</p><p>By ${escapeHtml(story.byline || "4PLANET Editorial Desk")} · ${escapeHtml(story.readMins || "")} min read</p></header><section>${(story.blocks || []).map(blockMarkup).join("")}</section>${pathway}${relatedMarkup}<p><a href="/magazine/">Back to 4PLANET MAGAZINE</a></p></article>`;
}

function magazineIndexMarkup() {
  return `<main data-4planet-prerender-content="magazine-index"><h1>4PLANET MAGAZINE</h1><p>Stories about the living planet — species, places, people, systems, solutions, innovation and culture.</p><nav aria-label="Magazine stories"><ul>${stories.map((story) => `<li><a href="/magazine/${escapeHtml(story.slug)}">${escapeHtml(story.title)}</a> — ${escapeHtml(story.dek)}</li>`).join("")}</ul></nav><p><a href="/magazine/about">About</a> · <a href="/magazine/sources">Sources &amp; Method</a> · <a href="/magazine/corrections">Corrections</a></p></main>`;
}

function writeRoute(route, meta) {
  const clean = stripManagedHead(baseHtml);
  let html = clean.replace("</head>", `    ${headMarkup(meta)}\n  </head>`);
  if (meta.bodyMarkup) {
    if (!html.includes('<div id="root"></div>')) throw new Error("Magazine prerender cannot find #root shell");
    html = html.replace('<div id="root"></div>', `<div id="root">${meta.bodyMarkup}</div>`);
  }
  const target = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

const magazineImage = images.m4gazineHero?.src || "/og.png";
const magazineAlt = images.m4gazineHero?.alt || "4PLANET MAGAZINE";
const absoluteMagazineImage = absoluteUrl(origin, magazineImage);
const magazineCanonical = absoluteUrl(origin, "/magazine");
writeRoute("/magazine", {
  title: "4PLANET MAGAZINE — What Holds",
  description: "Stories about the living planet — species, places, people, systems, solutions, innovation and culture.",
  canonical: magazineCanonical,
  image: absoluteMagazineImage,
  imageAlt: magazineAlt,
  type: "website",
  bodyMarkup: magazineIndexMarkup(),
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4PLANET MAGAZINE",
    description: "Stories about the living planet — species, places, people, systems, solutions, innovation and culture.",
    url: magazineCanonical,
    isPartOf: { "@type": "WebSite", name: "4PLANET_", url: absoluteUrl(origin, "/") },
  },
});

const informationPages = [
  {
    route: "/magazine/about",
    title: "About 4PLANET MAGAZINE",
    description: "The editorial purpose, independence rules and current publication state of 4PLANET MAGAZINE.",
  },
  {
    route: "/magazine/sources",
    title: "Sources & Method — 4PLANET MAGAZINE",
    description: "How 4PLANET MAGAZINE handles sources, claims, uncertainty, rights and editorial release.",
  },
  {
    route: "/magazine/corrections",
    title: "Corrections — 4PLANET MAGAZINE",
    description: "The 4PLANET MAGAZINE corrections and transparency desk.",
  },
];
for (const page of informationPages) {
  const canonical = absoluteUrl(origin, page.route);
  writeRoute(page.route, {
    ...page,
    canonical,
    image: absoluteMagazineImage,
    imageAlt: magazineAlt,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      description: page.description,
      url: canonical,
      isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical },
    },
  });
}

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
    bodyMarkup: storyBodyMarkup(story),
    section: story.lane || story.category,
    tags: Array.isArray(story.tags) ? story.tags : [],
    jsonLd,
  });
}

for (const record of foundingEdition.items) {
  const route = `/magazine/stories/${record.id}`;
  const canonical = absoluteUrl(origin, route);
  writeRoute(route, {
    title: `${record.title} — Pre-publication record | 4PLANET MAGAZINE`,
    description: record.summary,
    canonical,
    image: absoluteMagazineImage,
    imageAlt: magazineAlt,
    robots: "noindex,follow,noarchive,max-image-preview:large",
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: record.title,
      description: record.summary,
      url: canonical,
      isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE — Founding Edition working records", url: magazineCanonical },
      additionalType: "https://schema.org/DigitalDocument",
    },
  });
}

console.log(`Prerendered Magazine metadata for ${stories.length + informationPages.length + foundingEdition.items.length + 1} routes at ${origin}`);
