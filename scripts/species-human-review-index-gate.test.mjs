import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NON_PROFILE_REVIEW_STATE,
  permitsSpeciesIndexing,
  profileReviewState,
} from "../ops/discovery/4species-router.js";

const router = readFileSync(new URL("../ops/discovery/4species-router.js", import.meta.url), "utf8");

const sourcedProfile = (slug, review = "DRAFT") => ({
  schema: "4PLANET_SPECIES_PAGE_01", slug,
  identity: { commonName: "Orca", scientificName: "Orcinus orca" },
  hook: { text: "The largest dolphin species.", source: { label: "NOAA Fisheries", url: "https://www.fisheries.noaa.gov/species/killer-whale" } },
  provenance: { review, writtenBy: "GPT draft for 4PLANET" }
});

test("founder 17 Oct: DRAFT is publicly discoverable ONLY when original Claude profile has taxon identity and a real source", async () => {
  assert.equal(await profileReviewState("/orca", async () => Response.json(sourcedProfile("orca","DRAFT"))), "DRAFT");
  assert.equal(await profileReviewState("/orca", async () => Response.json(sourcedProfile("orca","REVIEWED"))), "REVIEWED");
  assert.equal(permitsSpeciesIndexing("REVIEWED"), true);
  assert.equal(permitsSpeciesIndexing("DRAFT"), true);
  assert.equal(permitsSpeciesIndexing("UNREVIEWED"), false);
  assert.equal(permitsSpeciesIndexing("INVALID"), false);
  assert.match(router, /x-robots-tag", "noindex, nofollow, noarchive"/);
  assert.match(router, /meta name="googlebot" content="noindex,nofollow,noarchive"/);
  assert.match(router, /72494005\.4planet-05\.pages\.dev/);
});

test("profile review lookup fails closed for unavailable or invalid evidence", async () => {
  const cases = [
    ["404", async () => new Response("missing", { status: 404 })],
    ["500", async () => new Response("error", { status: 500 })],
    ["malformed JSON", async () => new Response("{", { headers: { "content-type": "application/json" } })],
    ["missing provenance", async () => Response.json({ commonName: "Orca" })],
    ["missing review", async () => Response.json({ provenance: {} })],
    ["timeout/rejection", async () => { throw new DOMException("timed out", "TimeoutError"); }],
  ];
  for (const [label, fetchImpl] of cases) {
    const state = await profileReviewState("/orca", fetchImpl);
    assert.equal(state, "UNREVIEWED", label);
    assert.equal(permitsSpeciesIndexing(state), false, label);
  }
});

test("enumerated public non-profile routes remain eligible without profile JSON", async () => {
  for (const path of ["/", "/explore", "/quiz", "/about"]) {
    const state = await profileReviewState(path, async () => { throw new Error("must not fetch"); });
    assert.equal(state, NON_PROFILE_REVIEW_STATE, path);
    assert.equal(permitsSpeciesIndexing(state), true, path);
  }
});

test("arbitrary nested and non-canonical profile paths fail closed", async () => {
  const cases = [
    "/orca/draft",
    "/lion/preview",
    "/unreviewed/path",
    "/orca//draft",
    "/orca/../draft",
    "/orca%2Fdraft",
    "/Orca",
  ];
  for (const path of cases) {
    const state = await profileReviewState(path, async () => {
      throw new Error(`must not fetch non-canonical path: ${path}`);
    });
    assert.equal(state, "UNREVIEWED", path);
    assert.equal(permitsSpeciesIndexing(state), false, path);
  }
});

test("the public species sitemap retains only non-profile routes and complete source-backed profiles", () => {
  assert.match(router, /incoming\.pathname === "\/species-sitemap\.xml"/);
  assert.match(router, /permitsSpeciesIndexing\(review\)/);
  assert.doesNotMatch(router, /review === null \|\| review === "REVIEWED"/);
  assert.match(router, /x-4species-index-gate": "source-backed-public-v2"/);
});
