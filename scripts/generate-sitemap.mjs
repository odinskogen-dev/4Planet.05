import fs from "node:fs";
import path from "node:path";
import { readStories, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const publicDir = path.join(root, "public");
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const stories = readStories();

const staticRoutes = [
  "/",
  "/domains",
  "/missions",
  "/living-systems",
  "/atlas",
  "/species",
  "/impact",
  "/magazine",
  "/magazine/about",
  "/magazine/sources",
  "/magazine/corrections",
  "/about",
  "/privacy",
  "/join",
];

const routes = [...new Set([...staticRoutes, ...stories.map((story) => `/magazine/${story.slug}`)])];

const escapeXml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const sitemapUrls = routes
  .map((route) => `  <url><loc>${escapeXml(`${origin}${route}`)}</loc></url>`)
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");

// News sitemap foundation. Stories are added only when a real publication date is
// present and less than 48 hours old; current organisational explainers deliberately
// carry no invented publication timestamp.
const now = Date.now();
const newsStories = stories.filter((story) => {
  if (!story.publishedAt) return false;
  const published = Date.parse(story.publishedAt);
  return Number.isFinite(published) && published <= now && now - published <= 48 * 60 * 60 * 1000;
});
const newsUrls = newsStories.map((story) => `  <url>\n    <loc>${escapeXml(`${origin}/magazine/${story.slug}`)}</loc>\n    <news:news>\n      <news:publication><news:name>4PLANET MAGAZINE</news:name><news:language>en</news:language></news:publication>\n      <news:publication_date>${escapeXml(story.publishedAt)}</news:publication_date>\n      <news:title>${escapeXml(story.title)}</news:title>\n    </news:news>\n  </url>`).join("\n");
const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${newsUrls}\n</urlset>\n`;
fs.writeFileSync(path.join(publicDir, "news-sitemap.xml"), newsSitemap, "utf8");

const rssItems = stories.map((story) => `    <item>\n      <title>${escapeXml(story.title)}</title>\n      <link>${escapeXml(`${origin}/magazine/${story.slug}`)}</link>\n      <guid isPermaLink="true">${escapeXml(`${origin}/magazine/${story.slug}`)}</guid>\n      <description>${escapeXml(story.dek)}</description>\n      <category>${escapeXml(story.lane || story.category || "Magazine")}</category>${story.publishedAt ? `\n      <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>` : ""}\n    </item>`).join("\n");
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>4PLANET MAGAZINE</title>\n    <link>${escapeXml(`${origin}/magazine`)}</link>\n    <description>Stories about the living planet — species, places, people, systems, solutions and culture.</description>\n    <language>en-gb</language>\n    ${rssItems}\n  </channel>\n</rss>\n`;
fs.writeFileSync(path.join(publicDir, "rss.xml"), rss, "utf8");

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(origin, "/sitemap.xml")}\nSitemap: ${absoluteUrl(origin, "/news-sitemap.xml")}\n`;
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(`Generated sitemap.xml with ${routes.length} URLs, news-sitemap.xml with ${newsStories.length} fresh stories, rss.xml with ${stories.length} story items for ${origin}`);
