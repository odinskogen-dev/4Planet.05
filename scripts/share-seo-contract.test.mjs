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
  "/",
  "/atlas",
  "/species",
  "/living-systems",
  "/impact",
  "/missions",
  "/domains",
  "/join",
  "/about",
  "/species/orca",
  "/living-systems/amazonia",
  "/living-systems/oslofjord",
  "/missions/wh4les",
  "/missions/am4zonia",
  "/missions/food",
];

const bannedMaturityPhrases = [
  "real-time",
  "realtime",
  "verified impact",
  "production-ready",
  "save the planet",
];

test("premium share registry covers core public surfaces", () => {
  for (const route of requiredRoutes) {
    assert.ok(manifest.routes[route], `missing share metadata for ${route}`);
  }
  assert.ok(Object.keys(manifest.routes).length >= 40, "share registry must cover the wider public product family");
});

test("every registered share surface has useful, rights-controlled local imagery and bounded copy", () => {
  for (const [route, meta] of Object.entries(manifest.routes)) {
    assert.ok(meta.title.length >= 12 && meta.title.length <= 80, `${route}: title length is outside contract`);
    assert.ok(meta.description.length >= 45 && meta.description.length <= 180, `${route}: description length is outside contract`);
    assert.match(meta.image, /^\/assets\/.+\.(jpg|jpeg|png|webp)$/i, `${route}: share image must use a controlled local asset`);
    assert.ok(meta.imageAlt.length >= 10, `${route}: image alt is too weak`);

    const assetPath = path.join(root, "public", meta.image.replace(/^\//, ""));
    assert.ok(fs.existsSync(assetPath), `${route}: missing share image ${meta.image}`);

    const publicCopy = `${meta.title} ${meta.description}`.toLowerCase();
    for (const banned of bannedMaturityPhrases) {
      assert.equal(publicCopy.includes(banned), false, `${route}: banned maturity phrase '${banned}'`);
    }
  }
});

test("build prerenders public share metadata before magazine-specific SEO", () => {
  const build = packageJson.scripts.build || "";
  const publicIndex = build.indexOf("prerender-public-share-seo.mjs");
  const magazineIndex = build.indexOf("prerender-magazine-seo.mjs");
  assert.ok(publicIndex >= 0, "public share prerender missing from build");
  assert.ok(magazineIndex > publicIndex, "magazine SEO must run after the public share prerender");
});

test("SPA navigation refreshes metadata without relying on crawlers executing JavaScript", () => {
  assert.match(appSource, /ShareMetadata/);
  assert.match(appSource, /<ShareMetadata\s*\/>/);
  assert.match(packageJson.scripts.build, /prerender-public-share-seo\.mjs/);
});

test("root fallback no longer points social previews at the generic white og card", () => {
  assert.equal(indexSource.includes('content="/og.png"'), false);
  assert.match(indexSource, /og:image[^>]+front-hero\.jpg/);
  assert.match(indexSource, /twitter:image[^>]+front-hero\.jpg/);
  assert.match(indexSource, /og:site_name[^>]+4PLANET_/);
});
