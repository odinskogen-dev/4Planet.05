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
const inventory = JSON.parse(fs.readFileSync(path.join(root, "src/data/discoveryInventory.json"), "utf8"));
const key = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";
const keyLocation = `${origin}/${key}.txt`;

const urlList = [
  `${origin}/places`,
  `${origin}/species`,
  ...(inventory.places ?? []).filter((item) => item.indexable === true).map((item) => `${origin}/place/${item.slug}`),
  ...(inventory.species ?? []).filter((item) => item.indexable === true).map((item) => `${origin}/species/${item.slug}`),
];

const uniqueUrls = [...new Set(urlList)];
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
