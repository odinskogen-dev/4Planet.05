import fs from "node:fs";
import path from "node:path";
import { readArticleTemplates, readSignals, readStories, readTopics, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const publicDir = path.join(root, "public");
const publicOrigin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const magazineOrigin = (process.env.MAGAZINE_SITE_ORIGIN || process.env.VITE_MAGAZINE_SITE_ORIGIN || "https://4planetmagazine.com").replace(/\/$/, "");
const stories = readStories();
const signals = readSignals();
const topics = readTopics();
const templates = readArticleTemplates();

function readPublishedFilmSlugs() {
  const source = fs.readFileSync(path.join(root, "src/content/magazineFilms.ts"), "utf8");
  const publishedSection = source.split("const published: FilmRecord[] = [")[1]?.split("];\n\nconst research: FilmRecord[] = [")[0] ?? "";
  const slugs = [...publishedSection.matchAll(/\bslug:\s*"([^"]+)"/g)].map((match) => match[1]);
  if (slugs.length === 0) throw new Error("Magazine Films sitemap gate: no published films recovered from canonical registry.");
  return [...new Set(slugs)];
}

const publicRoutes = ["/", "/domains", "/missions", "/living-systems", "/atlas", "/species", "/impact", "/about", "/privacy", "/join"];
const publishedFilmSlugs = readPublishedFilmSlugs();
const magazineStaticRoutes = [
  "/magazine",
  "/films",
  "/magazine/about",
  "/magazine/sources",
  "/magazine/corrections",
  "/magazine/privacy",
  "/magazine/archive",
  "/magazine/atlas",
];
const toSeriesSlug = (value) => value.toLowerCase().replaceAll("_", "-");
const magazineRoutes = [...new Set([
  ...magazineStaticRoutes,
  ...publishedFilmSlugs.map((slug) => `/films/${slug}`),
  ...stories.map((story) => `/magazine/${story.slug}`),
  ...signals.map((signal) => `/magazine/signals/${signal.slug}`),
  ...topics.map((topic) => `/magazine/topics/${topic.id.toLowerCase()}`),
  ...templates.map((template) => `/magazine/series/${toSeriesSlug(template.id)}`),
])];

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

function writeSitemap(filename, origin, routes) {
  const urls = routes.map((route) => `  <url><loc>${escapeXml(`${origin}${route}`)}</loc></url>`).join("\n");
  fs.writeFileSync(path.join(publicDir, filename), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
}

writeSitemap("sitemap.xml", publicOrigin, publicRoutes);
writeSitemap("magazine-sitemap.xml", magazineOrigin, magazineRoutes);

const now = Date.now();
const newsStories = stories.filter((story) => {
  if (!story.publishedAt) return false;
  const publishedAt = Date.parse(story.publishedAt);
  return Number.isFinite(publishedAt) && publishedAt <= now && now - publishedAt <= 48 * 60 * 60 * 1000;
});
const newsUrls = newsStories.map((story) => `  <url>\n    <loc>${escapeXml(`${magazineOrigin}/magazine/${story.slug}`)}</loc>\n    <news:news>\n      <news:publication><news:name>4PLANET MAGAZINE</news:name><news:language>en</news:language></news:publication>\n      <news:publication_date>${escapeXml(story.publishedAt)}</news:publication_date>\n      <news:title>${escapeXml(story.title)}</news:title>\n    </news:news>\n  </url>`).join("\n");
fs.writeFileSync(path.join(publicDir, "news-sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${newsUrls}\n</urlset>\n`, "utf8");

const rssStoryItems = stories.map((story) => `    <item>\n      <title>${escapeXml(story.title)}</title>\n      <link>${escapeXml(`${magazineOrigin}/magazine/${story.slug}`)}</link>\n      <guid isPermaLink="true">${escapeXml(`${magazineOrigin}/magazine/${story.slug}`)}</guid>\n      <description>${escapeXml(story.dek)}</description>\n      <category>${escapeXml(story.lane || story.category || "Magazine")}</category>${story.publishedAt ? `\n      <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>` : ""}\n    </item>`);
const rssSignalItems = signals.map((signal) => `    <item>\n      <title>${escapeXml(`Planet Signal: ${signal.title}`)}</title>\n      <link>${escapeXml(`${magazineOrigin}/magazine/signals/${signal.slug}`)}</link>\n      <guid isPermaLink="true">${escapeXml(`${magazineOrigin}/magazine/signals/${signal.slug}`)}</guid>\n      <description>${escapeXml(signal.dek)}</description>\n      <category>Planet Signal</category>\n      <pubDate>${new Date(signal.publishedAt.length === 7 ? `${signal.publishedAt}-01` : signal.publishedAt.length === 4 ? `${signal.publishedAt}-01-01` : signal.publishedAt).toUTCString()}</pubDate>\n    </item>`);
const rssItems = [...rssStoryItems, ...rssSignalItems].join("\n");
fs.writeFileSync(path.join(publicDir, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>4PLANET MAGAZINE</title>\n    <link>${escapeXml(`${magazineOrigin}/magazine`)}</link>\n    <description>Stories and signals about the living planet — species, places, people, systems, solutions and culture.</description>\n    <language>en-gb</language>\n${rssItems}\n  </channel>\n</rss>\n`, "utf8");

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(publicOrigin, "/sitemap.xml")}\n`;
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
const magazineRobots = `User-agent: *\nAllow: /magazine\nAllow: /films\nDisallow: /magazine/saved\nDisallow: /magazine/search\n\nSitemap: ${absoluteUrl(magazineOrigin, "/magazine-sitemap.xml")}\nSitemap: ${absoluteUrl(magazineOrigin, "/news-sitemap.xml")}\n`;
fs.writeFileSync(path.join(publicDir, "magazine-robots.txt"), magazineRobots, "utf8");

console.log(`Generated public sitemap (${publicRoutes.length} URLs @ ${publicOrigin}); Magazine sitemap (${magazineRoutes.length} URLs @ ${magazineOrigin}, ${publishedFilmSlugs.length} Films); News sitemap (${newsStories.length} eligible stories); RSS (${stories.length} stories + ${signals.length} signals).`);
