import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const storySource = fs.readFileSync(path.join(root, "src/content/stories.ts"), "utf8");
const storySlugs = [...storySource.matchAll(/slug:\s*["']([^"']+)["']/g)].map((match) => match[1]);

const origin = (process.env.PUBLIC_SITE_ORIGIN || process.env.VITE_PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
const staticRoutes = [
  "/",
  "/domains",
  "/missions",
  "/living-systems",
  "/atlas",
  "/species",
  "/impact",
  "/magazine",
  "/about",
  "/join",
];

const routes = [...new Set([...staticRoutes, ...storySlugs.map((slug) => `/magazine/${slug}`)])];

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const urls = routes
  .map((route) => `  <url><loc>${escapeXml(`${origin}${route}`)}</loc></url>`)
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap.xml with ${routes.length} URLs for ${origin}`);
