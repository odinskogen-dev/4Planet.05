import fs from "node:fs";
import path from "node:path";
import { readSignals, readStories, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const publicDir = path.join(root, "public");
const publicOrigin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const magazineOrigin = (process.env.MAGAZINE_SITE_ORIGIN || process.env.VITE_MAGAZINE_SITE_ORIGIN || "https://4planetmagazine.com").replace(/\/$/, "");
const stories = readStories();
const signals = readSignals();

const publicRoutes = ["/", "/domains", "/missions", "/living-systems", "/atlas", "/species", "/impact", "/about", "/privacy", "/join"];
const magazineStaticRoutes = ["/magazine", "/magazine/about", "/magazine/sources", "/magazine/corrections", "/magazine/archive"];
const magazineRoutes = [...new Set([
  ...magazineStaticRoutes,
  ...stories.map((story) => `/magazine/${story.slug}`),
  ...signals.map((signal) => `/magazine/signals/${signal.slug}`),
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

// Sitemaps do not mix canonical hosts. 4planet.org keeps the shared-universe
// routes; 4planetmagazine.com owns the editorial URLs.
writeSitemap("sitemap.xml", publicOrigin, publicRoutes);
writeSitemap("magazine-sitemap.xml", magazineOrigin, magazineRoutes);

const now = Date.now();
const newsStories = stories.filter((story) => {
  if (!story.publishedAt) return false;
  const published = Date.parse(story.publishedAt);
  return Number.isFinite(published) && published <= now && now - published <= 48 * 60 * 60 * 1000;
});
const newsUrls = newsStories.map((story) => `  <url>\n    <loc>${escapeXml(`${magazineOrigin}/magazine/${story.slug}`)}</loc>\n    <news:news>\n      <news:publication><news:name>4PLANET MAGAZINE</news:name><news:language>en</news:language></news:publication>\n      <news:publication_date>${escapeXml(story.publishedAt)}</news:publication_date>\n      <news:title>${escapeXml(story.title)}</news:title>\n    </news:news>\n  </url>`).join("\n");
const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${newsUrls}\n</urlset>\n`;
fs.writeFileSync(path.join(publicDir, "news-sitemap.xml"), newsSitemap, "utf8");

const rssStoryItems = stories.map((story) => `    <item>\n      <title>${escapeXml(story.title)}</title>\n      <link>${escapeXml(`${magazineOrigin}/magazine/${story.slug}`)}</link>\n      <guid isPermaLink="true">${escapeXml(`${magazineOrigin}/magazine/${story.slug}`)}</guid>\n      <description>${escapeXml(story.dek)}</description>\n      <category>${escapeXml(story.lane || story.category || "Magazine")}</category>${story.publishedAt ? `\n      <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>` : ""}\n    </item>`);
const rssSignalItems = signals.map((signal) => `    <item>\n      <title>${escapeXml(`Planet Signal: ${signal.title}`)}</title>\n      <link>${escapeXml(`${magazineOrigin}/magazine/signals/${signal.slug}`)}</link>\n      <guid isPermaLink="true">${escapeXml(`${magazineOrigin}/magazine/signals/${signal.slug}`)}</guid>\n      <description>${escapeXml(signal.dek)}</description>\n      <category>Planet Signal</category>\n    </item>`);
const rssItems = [...rssStoryItems, ...rssSignalItems].join("\n");
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>4PLANET MAGAZINE</title>\n    <link>${escapeXml(`${magazineOrigin}/magazine`)}</link>\n    <description>Stories and signals about the living planet — species, places, people, systems, solutions and culture.</description>\n    <language>en-gb</language>\n${rssItems}\n  </channel>\n</rss>\n`;
fs.writeFileSync(path.join(publicDir, "rss.xml"), rss, "utf8");

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(publicOrigin, "/sitemap.xml")}\nSitemap: ${absoluteUrl(magazineOrigin, "/magazine-sitemap.xml")}\nSitemap: ${absoluteUrl(magazineOrigin, "/news-sitemap.xml")}\n`;
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
const magazineRobots = `User-agent: *\nAllow: /magazine\nDisallow: /magazine/saved\n\nSitemap: ${absoluteUrl(magazineOrigin, "/magazine-sitemap.xml")}\nSitemap: ${absoluteUrl(magazineOrigin, "/news-sitemap.xml")}\n`;
fs.writeFileSync(path.join(publicDir, "magazine-robots.txt"), magazineRobots, "utf8");

console.log(`Generated public sitemap (${publicRoutes.length} URLs @ ${publicOrigin}); Magazine sitemap (${magazineRoutes.length} URLs @ ${magazineOrigin}); News sitemap (${newsStories.length} fresh stories); RSS (${stories.length} stories + ${signals.length} signals).`);
