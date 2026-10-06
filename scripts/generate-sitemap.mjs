import fs from "node:fs";
import path from "node:path";
import { readStories, absoluteUrl } from "./magazine-content.mjs";

const root = process.cwd();
const publicDir = path.join(root, "public");
const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const stories = readStories();
const discoveryInventory = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryInventory.json"), "utf8"));
const atlasDiscovery = JSON.parse(fs.readFileSync(path.join(root, "src/data/atlasDiscovery.json"), "utf8"));
const discoveryTopics = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryTopics.json"), "utf8"));

const missionRoutes = ["/missions/cle4n", "/missions/wh4les", "/missions/cor4l", "/missions/rewild-marine", "/missions/clim4te", "/missions/am4zonia", "/missions/species", "/missions/rewild-land", "/missions/food", "/missions/en4rgy", "/missions/circular-city", "/missions/f4shion", "/missions/m4gazine", "/missions/4film", "/missions/4rt", "/missions/4play"];

const staticRoutes = [
  "/",
  "/domains",
  "/domains/oce4n",
  "/domains/e4rth",
  "/domains/s4piens",
  "/domains/4culture",
  "/missions",
  ...missionRoutes,
  "/livingsystems/",
  "/now",
  "/places",
  "/impact/actions/bay-of-biscay-survey",
  "/cre4tor/odin",
  "/impact",
  "/actors",
  "/brands",
  "/partners",
  "/funders",
  "/reports",
  "/journey/jaguar/",
  "/journey/orca/",
  "/about",
  "/privacy",
  "/join",
];

// ATLAS and SPECIES have standalone canonical homes. Their 4planet.org routes
// redirect to those product domains, so they are excluded from this sitemap.
// Canonical PLACE ownership lives on 4planetatlas.com. 4planet.org keeps the /places gateway but does not compete with ATLAS place URLs.
const discoveryRoutes = (discoveryTopics.topics ?? []).filter((item) => item.indexable === true).map((item) => `/${item.slug}`);
const routes = [...new Set([...staticRoutes, ...discoveryRoutes])];

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
const newsSitemapPath = path.join(publicDir, "news-sitemap.xml");
if (newsStories.length > 0) fs.writeFileSync(newsSitemapPath, newsSitemap, "utf8");
else if (fs.existsSync(newsSitemapPath)) fs.unlinkSync(newsSitemapPath);

const rssItems = stories.map((story) => `    <item>\n      <title>${escapeXml(story.title)}</title>\n      <link>${escapeXml(`${origin}/magazine/${story.slug}`)}</link>\n      <guid isPermaLink="true">${escapeXml(`${origin}/magazine/${story.slug}`)}</guid>\n      <description>${escapeXml(story.dek)}</description>\n      <category>${escapeXml(story.lane || story.category || "Magazine")}</category>${story.publishedAt ? `\n      <pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>` : ""}\n    </item>`).join("\n");
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>4PLANET MAGAZINE</title>\n    <link>${escapeXml(`${origin}/magazine`)}</link>\n    <description>Stories about the living planet — species, places, people, systems, solutions and culture.</description>\n    <language>en-gb</language>\n    ${rssItems}\n  </channel>\n</rss>\n`;
fs.writeFileSync(path.join(publicDir, "rss.xml"), rss, "utf8");

const robotDisallows = [
  "/labs", "/os", "/sandbox", "/checkout", "/api", "/admin", "/auth",
  "/account", "/saved", "/id", "/oauth", "/4nation"
];
const robotGroup = (agent) => [
  `User-agent: ${agent}`,
  "Allow: /",
  ...robotDisallows.map((route) => `Disallow: ${route}`),
  "",
].join("\n");
const robots = `${robotGroup("OAI-SearchBot")}\n${robotGroup("Googlebot")}\n${robotGroup("Bingbot")}\n${robotGroup("*")}\nSitemap: ${absoluteUrl(origin, "/sitemap.xml")}\n${newsStories.length > 0 ? `Sitemap: ${absoluteUrl(origin, "/news-sitemap.xml")}\n` : ""}`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

console.log(`Generated sitemap.xml with ${routes.length} URLs, news-sitemap.xml with ${newsStories.length} fresh stories, rss.xml with ${stories.length} story items for ${origin}`);
