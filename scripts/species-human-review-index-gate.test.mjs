import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CURRENT_PUBLIC_SPECIES_SLUGS,
  hasApprovedNewSpeciesPhoto,
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

const signedPhoto = {
  url: "https://4species.com/assets/species/approved/test-animal.jpg",
  sourcePage: "https://example.org/photos/test-animal",
  credit: "Field photographer",
  licence: "CC BY 4.0",
};

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

test("founder 24 Oct: a new DRAFT or REVIEWED profile cannot publish without a signed photograph and authorised batch", async () => {
  assert.equal(CURRENT_PUBLIC_SPECIES_SLUGS.size, 57);
  for (const review of ["DRAFT", "REVIEWED"]) {
    const missingPhoto = sourcedProfile("test-animal", review);
    assert.equal(await profileReviewState("/test-animal", async () => Response.json(missingPhoto)), "UNREVIEWED", `${review} missing photo`);

    const unlicensedPhoto = { ...missingPhoto, hero: { url: signedPhoto.url } };
    assert.equal(await profileReviewState("/test-animal", async () => Response.json(unlicensedPhoto)), "UNREVIEWED", `${review} missing rights`);
  }
});

test("new-profile photo approval requires photograph, creator, licence, source, immutable SHA and independent Gold", () => {
  const page = {
    ...sourcedProfile("test-animal", "REVIEWED"),
    hero: signedPhoto,
    provenance: {
      review: "REVIEWED",
      photoSha256: "a".repeat(64),
      photoVisualReview: "GOLD",
      sourceReview: "GOLD",
    },
  };
  assert.equal(hasApprovedNewSpeciesPhoto(page), true);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, hero: { ...signedPhoto, url: "https://4species.com/assets/species/test-animal.svg" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, hero: { ...signedPhoto, credit: "" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, hero: { ...signedPhoto, licence: "" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, provenance: { ...page.provenance, photoSha256: "unpinned" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, provenance: { ...page.provenance, photoVisualReview: "PENDING" } }), false);
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
    "/orca/",
    "//orca",
    "/./orca",
    "/%6frca",
    "/orca?preview=1",
    "/orca#draft",
  ];
  for (const path of cases) {
    const state = await profileReviewState(path, async () => {
      throw new Error(`must not fetch non-canonical path: ${path}`);
    });
    assert.equal(state, "UNREVIEWED", path);
    assert.equal(permitsSpeciesIndexing(state), false, path);
  }
});

test("non-canonical variants cannot inherit the public non-profile allowlist", async () => {
  const cases = [
    "/explore/",
    "//explore",
    "/explore//",
    "/./explore",
    "/%65xplore",
    "/about?preview=1",
    "/quiz#draft",
  ];
  for (const path of cases) {
    const state = await profileReviewState(path, async () => {
      throw new Error(`must not fetch non-canonical public route: ${path}`);
    });
    assert.equal(state, "UNREVIEWED", path);
    assert.equal(permitsSpeciesIndexing(state), false, path);
  }
});

test("the public species sitemap retains only non-profile routes and complete source-backed profiles", () => {
  assert.match(router, /incoming\.pathname === "\/species-sitemap\.xml"/);
  assert.match(router, /permitsSpeciesIndexing\(review\)/);
  assert.doesNotMatch(router, /review === null \|\| review === "REVIEWED"/);
  assert.match(router, /x-4species-index-gate": "human-review-v1"/);
});
