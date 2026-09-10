import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/content/shareMeta.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const appSource = fs.readFileSync(path.join(root, "src/App.tsx"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");

const requiredRoutes = [
  "/", "/atlas", "/species", "/living-systems", "/impact", "/missions", "/domains",
  "/domains/oce4n", "/domains/e4rth", "/domains/s4piens", "/domains/4culture",
  "/missions/wh4les", "/missions/cor4l", "/missions/cle4n", "/missions/am4zonia",
  "/missions/food", "/species/orca", "/living-systems/oslofjord", "/4sapien",
  "/4sapien/food/choose", "/join", "/about"
];

const banned = ["real-time", "realtime", "verified impact", "production-ready", "save the planet"];

test("core public products have their own share front", () => {
  for (const route of requiredRoutes) assert.ok(manifest.routes[route], `missing ${route}`);
  assert.ok(Object.keys(manifest.routes).length >= 50, "share registry must cover the public product family");
});

test("share copy stays restrained and images stay controlled", () => {
  for (const [route, meta] of Object.entries(manifest.routes)) {
    assert.ok(meta.title.length >= 4 && meta.title.length <= 44, `${route}: title is not quiet enough`);
    assert.ok(meta.description.length >= 12 && meta.description.length <= 80, `${route}: description is not restrained`);
    assert.ok(meta.imageAlt.length >= 8, `${route}: image alt is too weak`);

    if (route === "/atlas") {
      assert.match(meta.image, /^https:\/\/gibs\.earthdata\.nasa\.gov\//, "ATLAS share visual must use the same NASA GIBS source as the Night Lights layer");
      assert.match(meta.image, /VIIRS_Black_Marble/, "ATLAS share visual must be Black Marble Night Lights");
    } else {
      assert.match(meta.image, /^\/assets\/.+\.(jpg|jpeg|png|webp)$/i, `${route}: image must be a controlled local asset`);
      const assetPath = path.join(root, "public", meta.image.replace(/^\//, ""));
      assert.ok(fs.existsSync(assetPath), `${route}: missing ${meta.image}`);
    }

    const copy = `${meta.title} ${meta.description}`.toLowerCase();
    for (const phrase of banned) assert.equal(copy.includes(phrase), false, `${route}: banned phrase '${phrase}'`);
  }
});

test("crawler metadata is prerendered before magazine SEO", () => {
  const build = packageJson.scripts.build || "";
  const publicIndex = build.indexOf("prerender-public-share-seo.mjs");
  const magazineIndex = build.indexOf("prerender-magazine-seo.mjs");
  assert.ok(publicIndex >= 0, "public share prerender missing from build");
  assert.ok(magazineIndex > publicIndex, "Magazine SEO must retain final authority over Magazine routes");
});

test("SPA navigation refreshes metadata", () => {
  assert.match(appSource, /ShareMetadata/);
  assert.match(appSource, /<ShareMetadata\s*\/>/);
});

test("generic white social card is gone", () => {
  assert.equal(indexSource.includes('content="/og.png"'), false);
  assert.match(indexSource, /og:image[^>]+front-hero\.jpg/);
  assert.match(indexSource, /twitter:image[^>]+front-hero\.jpg/);
  assert.match(indexSource, /og:site_name[^>]+4PLANET_/);
});
