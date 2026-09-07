import fs from "node:fs";
import path from "node:path";
import { readArticleTemplates, readStories, readSignals, readImages, readFoundingEdition, readTopics, readFeatures, readStandfirsts, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) throw new Error("dist/index.html is missing; run Vite build before Magazine SEO prerender");

const baseHtml = fs.readFileSync(indexPath, "utf8");
const publicOrigin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const magazineOrigin = (process.env.MAGAZINE_SITE_ORIGIN || process.env.VITE_MAGAZINE_SITE_ORIGIN || "https://4planetmagazine.com").replace(/\/$/, "");
const stories = readStories();
const signals = readSignals();
const images = readImages();
const features = readFeatures();
const standfirsts = readStandfirsts();
const foundingEdition = readFoundingEdition();
const topics = readTopics();
const templates = readArticleTemplates();
const PUBLIC_LAUNCH_DATE = "2026-08-24";

function readPublishedFilms() {
  const source = fs.readFileSync(path.join(root, "src/content/magazineFilms.ts"), "utf8");
  const section = source.split("const published: FilmRecord[] = [")[1]?.split("];\n\nconst research: FilmRecord[] = [")[0] ?? "";
  const blocks = [...section.matchAll(/publishedFilm\(\{([\s\S]*?)\}\),/g)].map((match) => match[1]);
  const pickString = (block, key) => new RegExp(`\\b${key}:\\s*\"([^\"]+)\"`).exec(block)?.[1];
  const films = blocks.map((block) => {
    const imageVideoId = pickString(block, "imageVideoId") || pickString(block, "trailerId");
    const imageUrlOverride = pickString(block, "imageUrlOverride");
    const fallbackOverride = pickString(block, "imageFallbackOverride");
    return {
      slug: pickString(block, "slug"),
      title: pickString(block, "title"),
      year: Number(/\byear:\s*(\d+)/.exec(block)?.[1] || 0),
      focus: pickString(block, "focus"),
      director: pickString(block, "director"),
      runtime: pickString(block, "runtime"),
      description: pickString(block, "description"),
      watchUrl: pickString(block, "watchUrl"),
      sourceUrl: pickString(block, "sourceUrl"),
      sourceLabel: pickString(block, "sourceLabel"),
      selectionNote: pickString(block, "selectionNote"),
      availabilityNote: pickString(block, "availabilityNote"),
      image: imageUrlOverride || (imageVideoId ? `https://i.ytimg.com/vi/${imageVideoId}/maxresdefault.jpg` : ""),
      imageFallback: fallbackOverride || (imageVideoId ? `https://i.ytimg.com/vi/${imageVideoId}/hqdefault.jpg` : ""),
    };
  }).filter((film) => film.slug && film.title && film.year && film.director && film.runtime && film.description && film.image);
  if (films.length !== 40) throw new Error(`Magazine Films SEO gate: expected 40 published films, recovered ${films.length}.`);
  return films;
}

const films = readPublishedFilms();

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

function staticMarkupForRoute(route, meta) {
  if (route === "/films") {
    const items = films.map((film) => `<li><a href="${escapeHtml(`/films/${film.slug}`)}">${escapeHtml(film.title)}</a> — ${film.year}, ${escapeHtml(film.runtime)}, directed by ${escapeHtml(film.director)}</li>`).join("");
    return `<main class="mag-static-prerender" data-4planet-static-prerender="films-index"><p>4PLANET FILMS</p><h1>Films worth your attention.</h1><p>${escapeHtml(meta.description)}</p><h2>Curated documentary selection</h2><ul>${items}</ul></main>`;
  }
  if (route.startsWith("/films/")) {
    const slug = route.split("/").filter(Boolean).pop();
    const film = films.find((candidate) => candidate.slug === slug);
    if (!film) return "";
    return `<article class="mag-static-prerender" data-4planet-static-prerender="film-detail"><p>4PLANET FILMS / ${escapeHtml(film.focus)}</p><h1>${escapeHtml(film.title)}</h1><p>${escapeHtml(film.description)}</p><p><strong>${film.year}</strong> · ${escapeHtml(film.runtime)} · Directed by ${escapeHtml(film.director)}</p><p><a href="${escapeHtml(film.watchUrl)}">Watch ${escapeHtml(film.title)}</a></p><h2>Why 4PLANET selected it</h2><p>${escapeHtml(film.selectionNote || film.description)}</p><h2>Availability</h2><p>${escapeHtml(film.availabilityNote || "See the official source for current availability.")}</p><p><a href="${escapeHtml(film.sourceUrl)}">${escapeHtml(film.sourceLabel || "Official film source")}</a></p><nav><a href="/films">Explore all 4PLANET Films</a> · <a href="/magazine">Open 4PLANET Magazine</a> · <a href="/magazine/atlas">Open 4PLANET Atlas</a></nav></article>`;
  }
  if (route === "/magazine") {
    const items = stories.slice(0, 13).map((story) => `<li><a href="${escapeHtml(`/magazine/${story.slug}`)}">${escapeHtml(story.title)}</a> — ${escapeHtml(standfirsts[story.slug] || story.dek)}</li>`).join("");
    return `<main class="mag-static-prerender" data-4planet-static-prerender="magazine-index"><p>4PLANET MAGAZINE</p><h1>Nature, people, engineering and what works.</h1><p>${escapeHtml(meta.description)}</p><p><a href="/films">Explore 4PLANET Films</a></p><ul>${items}</ul></main>`;
  }
  if (route.startsWith("/magazine/") && !route.startsWith("/magazine/signals/") && !route.startsWith("/magazine/topics/") && !route.startsWith("/magazine/series/")) {
    const slug = route.split("/").filter(Boolean).pop();
    const story = stories.find((candidate) => candidate.slug === slug);
    if (story) {
      const feature = features[story.slug];
      const blocks = feature?.blocks ?? story.blocks ?? [];
      const body = blocks.map((block) => block.k === "sub" ? `<h2>${escapeHtml(block.t)}</h2>` : `<p>${escapeHtml(block.t)}</p>`).join("");
      const sourceMap = new Map();
      for (const source of story.sourceLinks ?? []) sourceMap.set(source.url, source);
      for (const source of feature?.addedSources ?? []) sourceMap.set(source.url, source);
      const sourceLinks = [...sourceMap.values()].map((source) => `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.label || source.publisher || source.url)}</a></li>`).join("");
      return `<article class="mag-static-prerender" data-4planet-static-prerender="magazine-story"><p>4PLANET MAGAZINE</p><h1>${escapeHtml(story.title)}</h1><p>${escapeHtml(standfirsts[story.slug] || story.dek)}</p>${body}${sourceLinks ? `<h2>Sources</h2><ul>${sourceLinks}</ul>` : ""}</article>`;
    }
  }
  if (route.startsWith("/magazine/")) return `<main class="mag-static-prerender" data-4planet-static-prerender="magazine-page"><h1>${escapeHtml(meta.title)}</h1><p>${escapeHtml(meta.description)}</p></main>`;
  return "";
}

function writeRoute(route, meta) {
  const clean = stripManagedHead(baseHtml);
  const withHead = clean.replace("</head>", `    ${headMarkup(meta)}
  </head>`);
  const staticMarkup = staticMarkupForRoute(route, meta);
  const html = staticMarkup ? withHead.replace('<div id="root"></div>', `<div id="root"></div><noscript>${staticMarkup}</noscript>`) : withHead;
  const target = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

const magazineImage = images.m4gazineHero?.src || "/og.png";
const magazineAlt = images.m4gazineHero?.alt || "4PLANET MAGAZINE";
const absoluteMagazineImage = absoluteUrl(magazineOrigin, magazineImage);
const magazineCanonical = absoluteUrl(magazineOrigin, "/magazine");
writeRoute("/magazine", {
  title: "4PLANET MAGAZINE — Nature, people, engineering and what works",
  description: "Stories and signals about the living planet — species, places, people, science, engineering, solutions and culture.",
  canonical: magazineCanonical,
  image: absoluteMagazineImage,
  imageAlt: magazineAlt,
  type: "website",
  jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: "4PLANET MAGAZINE", description: "Stories and signals about the living planet.", url: magazineCanonical, isPartOf: { "@type": "WebSite", name: "4PLANET_", url: absoluteUrl(publicOrigin, "/") } },
});

const informationPages = [
  { route: "/magazine/about", title: "About 4PLANET MAGAZINE", description: "What 4PLANET MAGAZINE publishes, how editorial independence works and what readers should expect from every story." },
  { route: "/magazine/sources", title: "Sources & Method — 4PLANET MAGAZINE", description: "How 4PLANET MAGAZINE handles reporting, sources, claims, uncertainty, image rights, fact checking and publication." },
  { route: "/magazine/corrections", title: "Corrections — 4PLANET MAGAZINE", description: "The 4PLANET MAGAZINE corrections and transparency desk." },
  { route: "/magazine/privacy", title: "Privacy — 4PLANET MAGAZINE", description: "How optional analytics, saved reading and local reader state work on 4PLANET MAGAZINE." },
  { route: "/magazine/archive", title: "Archive — 4PLANET MAGAZINE", description: "Browse full stories and source-backed Planet Signals from 4PLANET MAGAZINE." },
  { route: "/magazine/atlas", title: "4PLANET ATLAS — Explore the planet behind the stories", description: "An interactive 4PLANET view connecting place, active-fire detections and biodiversity context on one explorable Earth." },
];
for (const page of informationPages) {
  const canonical = absoluteUrl(magazineOrigin, page.route);
  writeRoute(page.route, { ...page, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, jsonLd: { "@context": "https://schema.org", "@type": page.route.endsWith("archive") ? "CollectionPage" : "WebPage", name: page.title, description: page.description, url: canonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical } } });
}

const filmsCanonical = absoluteUrl(magazineOrigin, "/films");
const filmsImage = films[0].image;
writeRoute("/films", {
  title: "4PLANET FILMS — Films worth your attention",
  description: "A curated documentary selection about the living planet, people, systems, pressure and solutions — linked back to the original filmmakers and distributors.",
  canonical: filmsCanonical,
  image: filmsImage,
  imageAlt: `${films[0].title} — official film material featured by 4PLANET FILMS`,
  type: "website",
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${filmsCanonical}#page`, name: "4PLANET FILMS", description: "Documentary films curated for a living planet.", url: filmsCanonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical }, mainEntity: { "@id": `${filmsCanonical}#list` } },
      { "@type": "ItemList", "@id": `${filmsCanonical}#list`, name: "4PLANET FILMS curated documentary selection", numberOfItems: films.length, itemListElement: films.map((film, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Movie", name: film.title, url: absoluteUrl(magazineOrigin, `/films/${film.slug}`), image: film.image, dateCreated: String(film.year), director: { "@type": "Person", name: film.director } } })) }
    ]
  },
});

for (const film of films) {
  const route = `/films/${film.slug}`;
  const canonical = absoluteUrl(magazineOrigin, route);
  const minutes = Number.parseInt(film.runtime, 10);
  writeRoute(route, {
    title: `${film.title} — 4PLANET FILMS`,
    description: film.description,
    canonical,
    image: film.image,
    imageAlt: `${film.title} — official film material`,
    type: "video.movie",
    section: film.focus,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Movie", "@id": `${canonical}#movie`, name: film.title, description: film.description, url: canonical, image: [film.image], dateCreated: String(film.year), duration: Number.isFinite(minutes) ? `PT${minutes}M` : undefined, director: { "@type": "Person", name: film.director }, genre: "Documentary", sameAs: film.sourceUrl, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET FILMS", url: filmsCanonical } },
        { "@type": "BreadcrumbList", "@id": `${canonical}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: "4PLANET MAGAZINE", item: magazineCanonical },
          { "@type": "ListItem", position: 2, name: "4PLANET FILMS", item: filmsCanonical },
          { "@type": "ListItem", position: 3, name: film.title, item: canonical }
        ] }
      ]
    },
  });
}

for (const story of stories) {
  const feature = features[story.slug];
  const imageKey = feature?.hero || story.image;
  const imageMeta = images[imageKey] || {};
  const description = standfirsts[story.slug] || story.dek;
  const canonical = absoluteUrl(magazineOrigin, `/magazine/${story.slug}`);
  const image = absoluteUrl(magazineOrigin, imageMeta.src || "/og.png");
  const imageAlt = imageMeta.alt || story.title;
  const type = story.mode === "FAST" && story.publishedAt ? "NewsArticle" : "Article";
  const citations = [...(story.sourceLinks ?? []), ...(feature?.addedSources ?? [])].map((source) => source.url);
  const jsonLd = {
    "@context": "https://schema.org", "@type": type, headline: story.title, description, image: [image], mainEntityOfPage: canonical,
    author: { "@type": "Organization", name: story.byline || "4PLANET MAGAZINE" },
    publisher: { "@type": "Organization", name: "4PLANET MAGAZINE", url: magazineCanonical },
    isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical },
    articleSection: story.lane || story.category, keywords: Array.isArray(story.tags) ? story.tags.join(", ") : undefined,
    datePublished: story.publishedAt || story.asOf || PUBLIC_LAUNCH_DATE,
    dateModified: story.updatedAt || story.publishedAt || story.asOf || PUBLIC_LAUNCH_DATE,
    citation: citations.length ? citations : undefined,
  };
  writeRoute(`/magazine/${story.slug}`, { title: `${story.title} | 4PLANET MAGAZINE`, description, canonical, image, imageAlt, type: "article", section: story.lane || story.category, tags: Array.isArray(story.tags) ? story.tags : [], jsonLd });
}

for (const signal of signals) {
  const route = `/magazine/signals/${signal.slug}`;
  const canonical = absoluteUrl(magazineOrigin, route);
  writeRoute(route, {
    title: `${signal.title} | PLANET SIGNAL — 4PLANET MAGAZINE`, description: signal.dek, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, type: "article", section: "Planet Signal", tags: signal.topics || [],
    jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: signal.title, description: signal.dek, mainEntityOfPage: canonical, datePublished: signal.publishedAt, dateModified: signal.asOf || signal.publishedAt, author: { "@type": "Organization", name: "4PLANET MAGAZINE" }, publisher: { "@type": "Organization", name: "4PLANET MAGAZINE", url: magazineCanonical }, isPartOf: { "@type": "CreativeWorkSeries", name: "PLANET SIGNAL", url: magazineCanonical }, citation: signal.sourceUrl, articleSection: "Planet Signal", keywords: Array.isArray(signal.topics) ? signal.topics.join(", ") : undefined },
  });
}

for (const topic of topics) {
  const route = `/magazine/topics/${topic.id.toLowerCase()}`;
  const canonical = absoluteUrl(magazineOrigin, route);
  writeRoute(route, { title: `${topic.label} — 4PLANET MAGAZINE`, description: topic.promise, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, type: "website", jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: `${topic.label} — 4PLANET MAGAZINE`, description: topic.promise, url: canonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical } } });
}

for (const template of templates) {
  const slug = template.id.toLowerCase().replaceAll("_", "-");
  const route = `/magazine/series/${slug}`;
  const canonical = absoluteUrl(magazineOrigin, route);
  writeRoute(route, { title: `${template.label} — 4PLANET MAGAZINE`, description: template.readerJob, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, type: "website", jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: `${template.label} — 4PLANET MAGAZINE`, description: template.readerJob, url: canonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: magazineCanonical } } });
}

for (const record of foundingEdition.items) {
  const route = `/magazine/stories/${record.id}`;
  const canonical = absoluteUrl(magazineOrigin, route);
  writeRoute(route, { title: `${record.title} — Working record | 4PLANET MAGAZINE`, description: record.summary, canonical, image: absoluteMagazineImage, imageAlt: magazineAlt, robots: "noindex,follow,noarchive,max-image-preview:large", type: "website", jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: record.title, description: record.summary, url: canonical, isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE — controlled working records", url: magazineCanonical }, additionalType: "https://schema.org/DigitalDocument" } });
}

console.log(`Prerendered Magazine metadata for ${films.length} Films + ${stories.length} stories + ${signals.length} signals + ${topics.length} topics + ${templates.length} series + ${informationPages.length} public utility pages + ${foundingEdition.items.length} noindex working records at canonical ${magazineOrigin}`);
