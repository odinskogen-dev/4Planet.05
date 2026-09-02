import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [redirects, headers, sitemapSource, matrix, manifestRaw, publicShell] = await Promise.all([
  readFile(new URL("../public/_redirects", import.meta.url), "utf8"),
  readFile(new URL("../public/_headers", import.meta.url), "utf8"),
  readFile(new URL("./generate-sitemap.mjs", import.meta.url), "utf8"),
  readFile(new URL("../docs/control/PUBLIC_CORE_01_LIVE_MATRIX.md", import.meta.url), "utf8"),
  readFile(new URL("../docs/control/LIVE_PROMOTION_MANIFEST.json", import.meta.url), "utf8"),
  readFile(new URL("../src/components/layout/PublicShell.tsx", import.meta.url), "utf8"),
]);
const manifest = JSON.parse(manifestRaw);

const heldRedirects = [
  ["/journey/orca", "/species/orca"],
  ["/species/orca/lume", "/species/orca"],
  ["/species/lab", "/species"],
  ["/4sapien", "/domains/s4piens"],
  ["/actors", "/partners"],
  ["/get-involved", "/join"],
  ["/impact/lab", "/impact"],
  ["/checkout/*", "/impact"],
  ["/lens", "/atlas"],
];

const publicMissionRoutes = [
  "/missions/cle4n",
  "/missions/wh4les",
  "/missions/cor4l",
  "/missions/rewild-marine",
  "/missions/clim4te",
  "/missions/am4zonia",
  "/missions/species",
  "/missions/rewild-land",
  "/missions/food",
  "/missions/en4rgy",
  "/missions/circular-city",
  "/missions/f4shion",
  "/missions/4film",
  "/missions/4rt",
  "/missions/4play",
];

test("PUBLIC CORE holds premature surfaces at the release edge", () => {
  for (const [from, to] of heldRedirects) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(redirects, new RegExp(`^${escaped}\\s+${to.replaceAll("/", "\\/")}\\s+302$`, "m"), `${from} must fail closed to ${to}`);
  }
  assert.ok(redirects.indexOf("/journey/orca") < redirects.indexOf("/*  /index.html"), "held redirects must run before SPA fallback");
});

test("held route families are explicitly noindex/nofollow", () => {
  for (const route of ["/journey/orca/*", "/4sapien/*", "/actors/*", "/impact/lab/*", "/checkout/*"]) {
    assert.match(headers, new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n\\s+X-Robots-Tag: noindex, nofollow, noarchive`));
  }
});

test("public discovery includes the public Mission family but excludes held flagship ORCA and Actor Gold", () => {
  for (const route of publicMissionRoutes) assert.ok(sitemapSource.includes(`\"${route}\"`), `${route} must be discoverable`);
  assert.ok(!sitemapSource.includes('"/journey/orca/"'), "held ORCA journey must not be in sitemap");
  assert.ok(!sitemapSource.includes('"/actors"'), "held Actor Gold must not be in sitemap");
  assert.ok(sitemapSource.includes('"/journey/jaguar/"'), "current Jaguar proof remains a release candidate pending exact-head browser/Human QA");
});

test("premium shared header remains transparent when closed and retains hide/reveal behaviour", () => {
  assert.match(publicShell, /const bg = menuMode \? "#fff" : "transparent";/);
  assert.match(publicShell, /backdropFilter: "none"/);
  assert.match(publicShell, /WebkitBackdropFilter: "none"/);
  assert.doesNotMatch(publicShell, /rgba\(5,5,7,\.9\)|rgba\(255,255,255,\.9\)|blur\(14px\)/);
  assert.match(publicShell, /if \(down > 74\) setHidden\(true\)/);
  assert.match(publicShell, /if \(up > 14\) setHidden\(false\)/);
  assert.match(publicShell, />JOIN 4PLANET<\/Link>/);
});

test("release control is explicit and remains Founder fail-closed", () => {
  for (const section of ["### LIVE", "### LIVE WITH DEVELOPMENT BOUNDARY", "### PRIVATE / NOINDEX", "### HOLD", "### INTERNAL ONLY", "## Zero Loss disposition"]) {
    assert.ok(matrix.includes(section), `matrix missing ${section}`);
  }
  assert.match(matrix, /Founder explicitly releases production/i);
  assert.notEqual(manifest.status, "AUTHORISED");
  assert.equal(manifest.sourceBranch, "king/test");
});
