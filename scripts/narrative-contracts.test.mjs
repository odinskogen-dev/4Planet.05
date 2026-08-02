import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const contract = read("src/content/narrativeContract.ts");
const repository = read("src/content/contentRepository.ts");
const routes = read("src/routes/router.tsx");
const shell = read("src/components/layout/PublicShell.tsx");
const home = read("src/pages/v5/Home.tsx");
const missions = read("src/pages/v5/Missions.tsx");

const missionSlugs = [
  "wh4les", "cor4l", "pl4stic", "rewild-marine",
  "clim4te", "am4zonia", "species", "rewild-land",
  "food", "en3rgy", "circular-city", "f4shion",
  "m4gazine", "4film", "4rt", "4play",
];

test("one narrative contract governs four domains and sixteen missions", () => {
  for (const domain of ["OCE4N_", "E4RTH_", "S4PIENS_", "4CULTURE_"]) {
    assert.match(contract, new RegExp(`key: "${domain.replace("_", "\\_")}"`));
  }
  for (const slug of missionSlugs) {
    assert.match(contract, new RegExp(`slug: "${slug}"`));
  }
  const declaredSlugs = [...contract.matchAll(/\bslug: "([a-z0-9:-]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(declaredSlugs).size, 16, "exactly sixteen unique Mission records");
  assert.match(repository, /MISSIONS, getMission, getMissionsByDomain/);
  assert.doesNotMatch(repository, /from "@\/content\/missions"/);
});

test("obsolete public Mission identities are redirects, not active records", () => {
  assert.doesNotMatch(contract, /slug: "4ntarctica"/);
  assert.doesNotMatch(contract, /slug: "4telier"/);
  assert.match(contract, /"4ntarctica": "rewild-marine"/);
  assert.match(contract, /"4telier": "4rt"/);
  assert.match(routes, /\/missions\/4ntarctica[\s\S]+\/missions\/rewild-marine/);
  assert.match(routes, /\/missions\/4telier[\s\S]+\/missions\/4rt/);
  assert.match(routes, /\/missions\/rewild[\s\S]+\/missions\/rewild-land/);
});

test("calibration surfaces consume the shared contract", () => {
  assert.match(home, /MISS[IONS]+/i);
  assert.match(home, /Everything we depend on is alive/);
  assert.match(home, /wh4les/);
  assert.match(home, /am4zonia/);
  assert.match(home, /food/);
  assert.match(home, /4rt/);
  assert.match(missions, /MissionStrip/);
  assert.match(missions, /SOURCE GAPS/);
  assert.match(missions, /RIGHTS & CLAIM LIMITS/);
  assert.match(shell, /FOUR DOMAINS \/ SIXTEEN MISSIONS/);
});

test("status and capability vocabulary prevents premature delivery claims", () => {
  for (const status of [
    "CONCEPT", "IN DEVELOPMENT", "PARTNER VALIDATION", "PILOT PREPARATION",
    "TEST ONLY", "COMING", "AVAILABLE", "REPORTING", "VERIFIED RESULT",
  ]) {
    assert.match(contract, new RegExp(`"${status}"`));
  }
  assert.match(contract, /Contribution is not delivery/);
  assert.match(contract, /No production Plastic Unit is active/);
  assert.match(contract, /No marketplace, edition, artist agreement, price or ecological allocation is active/);
});

test("every Mission exposes source, media, rights, SEO and mobile fields", () => {
  const recordStarts = [...contract.matchAll(/\n  \{\n    slug: "/g)].length;
  assert.equal(recordStarts, 16);
  for (const field of ["mobileHero", "seoTitle", "seoDescription", "sourceNeeds", "mediaRequirements", "rightsRequirements", "nextMilestone", "action"]) {
    const matches = [...contract.matchAll(new RegExp(`\\b${field}:`, "g"))].length;
    assert.ok(matches >= 16, `${field} present for all Missions`);
  }
});
