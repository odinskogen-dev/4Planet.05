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
const sitemapPath = path.join(root, "public", "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.error("IndexNow submission refused: public/sitemap.xml is missing. Run npm run seo:sitemap first.");
  process.exit(2);
}

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const key = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";
const keyLocation = `${origin}/${key}.txt`;

// Submit only canonical URLs that the generated sitemap already declares for
// 4planet.org. This prevents redirecting legacy product routes from being sent
// to Bing/IndexNow after ATLAS, SPECIES and other products move to standalone
// canonical domains.
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].replaceAll("&amp;", "&"))
  .filter((url) => {
    try {
      return new URL(url).origin === origin;
    } catch {
      return false;
    }
  });

const uniqueUrls = [...new Set(urlList)];
if (uniqueUrls.length === 0) {
  console.error("IndexNow submission refused: sitemap contains no canonical 4planet.org URLs.");
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
console.log(`IndexNow accepted ${uniqueUrls.length} canonical sitemap URLs for 4planet.org.`);
