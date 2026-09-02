import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  redirects,
  headers,
  sitemapSource,
  matrix,
  manifestRaw,
  publicShell,
  router,
  imageRegistry,
  speciesMedia,
  atlasSourceControl,
] = await Promise.all([
  readFile(new URL("../public/_redirects", import.meta.url), "utf8"),
  readFile(new URL("../public/_headers", import.meta.url), "utf8"),
  readFile(new URL("./generate-sitemap.mjs", import.meta.url), "utf8"),
  readFile(new URL("../docs/control/PUBLIC_CORE_01_LIVE_MATRIX.md", import.meta.url), "utf8"),
  readFile(new URL("../docs/control/LIVE_PROMOTION_MANIFEST.json", import.meta.url), "utf8"),
  readFile(new URL("../src/components/layout/PublicShell.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/routes/router.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/content/imageRegistry.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/data/speciesMedia.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/earth/atlasSourceControl.ts", import.meta.url), "utf8"),
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

test("PUBLIC CORE holds remain fail-closed inside the SPA, not only at the edge", () => {
  const expectedRouterControls = [
    ['<Route path="/species/lab" element={toSpecies} />', 'const toSpecies = <Navigate to="/species" replace />;'],
    ['<Route path="/species/orca/lume" element={toOrca} />', 'const toOrca = <Navigate to="/species/orca" replace />;'],
    ['<Route path="/lens" element={toAtlas} />', 'const toAtlas = <Navigate to="/atlas" replace />;'],
    ['<Route path="/4sapien/*" element={toSapien} />', 'const toSapien = <Navigate to="/domains/s4piens" replace />;'],
    ['<Route path="/food/pick" element={toFood} />', 'const toFood = <Navigate to="/missions/food" replace />;'],
    ['<Route path="/impact/lab/*" element={toImpact} />', 'const toImpact = <Navigate to="/impact" replace />;'],
    ['<Route path="/checkout/*" element={toImpact} />', 'const toImpact = <Navigate to="/impact" replace />;'],
    ['<Route path="/actors/*" element={toPartners} />', 'const toPartners = <Navigate to="/partners" replace />;'],
    ['<Route path="/get-involved" element={toJoin} />', 'const toJoin = <Navigate to="/join" replace />;'],
  ];
  for (const [route, target] of expectedRouterControls) {
    assert.ok(router.includes(route), `router missing held route control: ${route}`);
    assert.ok(router.includes(target), `router missing safe destination: ${target}`);
  }

  for (const prematureImport of [
    "SpeciesEngineLab",
    "LumeRoom",
    "FoodCapture",
    "PickPrototype",
    "FourSapienHome",
    "FourFinanceHome",
    "ActorsIndex",
    "ActorProfile",
    "FindYourWayToHelp",
    "CommerceStripeLab",
    "CheckoutReturn",
    "ImpactLabIndex",
    "ImpactTestJourney",
    "PersonalImpactRecordPage",
  ]) {
    assert.ok(!router.includes(`import ${prematureImport}`) && !router.includes(`import { ${prematureImport}`), `${prematureImport} must not be imported into PUBLIC CORE release routing`);
  }
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
  assert.ok(!sitemapSource.includes('"/4sapien"'), "held Embla/4SAPIEN must not be in sitemap");
  assert.ok(!sitemapSource.includes('"/impact/lab"'), "internal Impact lab must not be in sitemap");
  assert.ok(!sitemapSource.includes('"/checkout/lab"'), "internal checkout lab must not be in sitemap");
  assert.ok(sitemapSource.includes('"/journey/jaguar/"'), "current Jaguar proof remains a release candidate pending exact-head browser/Human QA");
});

test("public media fails closed with zero illustration substitution", () => {
  assert.match(imageRegistry, /being present in the 4PLANET library is provenance only, not rights clearance/i);
  assert.match(imageRegistry, /Founder rule 2026-09-02: zero illustration\/procedural-art fallbacks/i);
  assert.match(imageRegistry, /function noPhotoReleaseSurface/);
  assert.match(imageRegistry, /PUBLIC CORE intentional no-photo treatment/i);
  assert.match(imageRegistry, /TRANSPARENT_PIXEL/);
  assert.doesNotMatch(imageRegistry, /function generatedReleaseBackdrop/);
  assert.doesNotMatch(imageRegistry, /4PLANET-generated vector release artwork/i);
  assert.doesNotMatch(imageRegistry, /RELEASE_CLEARED_KEYS[\s\S]{0,260}"artHero"/);
  assert.doesNotMatch(imageRegistry, /RELEASE_CLEARED_KEYS[\s\S]{0,260}"cor4lHero"/);
  for (const exactPublicDomainPhoto of ["heroEarth", "brandAstronaut", "footerPlanet", "earthrise", "rewildMarineHero"]) {
    assert.match(imageRegistry, new RegExp(`RELEASE_CLEARED_KEYS[\\s\\S]{0,500}\\"${exactPublicDomainPhoto}\\"`));
  }
});

test("Founder-locked Orca uses the Unsplash photograph and Species has no active illustration fallback", () => {
  const orcaStart = speciesMedia.indexOf("orca: {");
  const humpbackStart = speciesMedia.indexOf('"humpback-whale"', orcaStart);
  assert.ok(orcaStart >= 0 && humpbackStart > orcaStart, "Orca media record must exist before humpback record");
  const orca = speciesMedia.slice(orcaStart, humpbackStart);
  assert.match(orca, /localPath:\s*"\/assets\/species\/orca\/hero\.jpg"/);
  assert.match(orca, /sourcePage:\s*"https:\/\/unsplash\.com\/"/);
  assert.match(orca, /licence:\s*"Unsplash License/);
  assert.match(orca, /publicWebAllowed:\s*true/);
  assert.match(orca, /commercialAllowed:\s*true/);
  assert.match(orca, /rightsStatus:\s*"LICENCE_VERIFIED"/);
  assert.match(orca, /do not replace with an illustration/i);
  assert.doesNotMatch(speciesMedia, /const ILLUSTRATIONS/);
  assert.doesNotMatch(speciesMedia, /\.illustration\s*=/);
  assert.match(speciesMedia, /PUBLIC CORE must never populate this/);
  assert.match(speciesMedia, /m\.publicWebAllowed && m\.commercialAllowed/);
});

test("ATLAS commercial-rights blockers remain machine-enforced", () => {
  const gfwStart = atlasSourceControl.indexOf('"global-fishing-watch"');
  const protectedStart = atlasSourceControl.indexOf('"protected-planet"');
  assert.ok(gfwStart >= 0 && protectedStart > gfwStart, "expected GFW and Protected Planet source records");
  const gfw = atlasSourceControl.slice(gfwStart, protectedStart);
  const protectedPlanet = atlasSourceControl.slice(protectedStart);
  assert.match(gfw, /stage:\s*"RIGHTS_GATED"/);
  assert.match(gfw, /rights:\s*"BLOCKED"/);
  assert.match(gfw, /map:\s*"BLOCKED"/);
  assert.match(protectedPlanet, /stage:\s*"RIGHTS_GATED"/);
  assert.match(protectedPlanet, /rights:\s*"BLOCKED"/);
  assert.match(atlasSourceControl, /if \(record\.rights !== "PASS"\) blockers\.push\("RIGHTS"\)/);
});

test("premium shared header remains transparent when closed and retains hide/reveal behaviour", () => {
  assert.match(publicShell, /const bg = menuMode \? "#fff" : "transparent";/);
  assert.match(publicShell, /backdropFilter: "none"/);
  assert.match(publicShell, /WebkitBackdropFilter: "none"/);
  assert.doesNotMatch(publicShell, /const bg = menuMode \? "#fff" : scrolled \?/);
  assert.doesNotMatch(publicShell, /backdropFilter: scrolled/);
  assert.doesNotMatch(publicShell, /WebkitBackdropFilter: scrolled/);
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
