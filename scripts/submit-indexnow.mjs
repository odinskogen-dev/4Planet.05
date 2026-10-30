import fs from "node:fs";
import path from "node:path";

const RELEASE_TOKEN = "ENIG_INDEXNOW";
const release = process.env.FOUNDER_INDEXNOW_RELEASE || "";
if (release !== RELEASE_TOKEN) {
  console.error("IndexNow submission refused: explicit FOUNDER_INDEXNOW_RELEASE=ENIG_INDEXNOW is required.");
  process.exit(2);
}

const origin = (process.env.PUBLIC_SITE_ORIGIN || "https://4planet.org").replace(/\/$/, "");
if (origin !== "https://4planet.org") {
  console.error(`IndexNow submission refused: expected https://4planet.org, got ${origin}`);
  process.exit(2);
}

const root = process.cwd();
const topics = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryTopics.json"), "utf8"));
const key = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";
const keyLocation = `${origin}/${key}.txt`;

// IndexNow is for the canonical 4planet.org pages, not legacy product routes.
// The sitemap is generated from the same canonical route ownership rules as the build.
const sitemap = fs.readFileSync(path.join(root, "public/sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\\/loc>/g)]
  .map((match) => match[1].replaceAll("&amp;", "&"));
const eligible = new Set([
  `${origin}/now`,
  ...(topics.topics ?? []).filter((item) => item.indexable === true)
    .map((item) => `${origin}/${item.slug}`),
]);
const uniqueUrls = [...new Set(sitemapUrls.filter((url) => eligible.has(url) && url.startsWith(`${origin}/`)))];
if (uniqueUrls.length === 0) {
  console.error("IndexNow submission refused: no eligible canonical discovery URLs in generated sitemap.");
  process.exit(2);
}
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: "4planet.org", key, keyLocation, urlList: uniqueUrls }),
});

if (!response.ok) {
  console.error(`IndexNow submission failed: HTTP ${response.status}`);
  process.exit(1);
}
console.log(`IndexNow accepted ${uniqueUrls.length} changed discovery URLs for 4planet.org.`);
