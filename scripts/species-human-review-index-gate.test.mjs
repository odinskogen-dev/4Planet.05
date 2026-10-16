import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  NON_PROFILE_REVIEW_STATE,
  permitsSpeciesIndexing,
  profileReviewState,
} from "../ops/discovery/4species-router.js";

const router = readFileSync(new URL("../ops/discovery/4species-router.js", import.meta.url), "utf8");

test("profile indexability is gated on explicit human review", async () => {
  assert.match(router, /page\?\.provenance\?\.review/);
  assert.equal(await profileReviewState("/orca", async () => Response.json({ provenance: { review: "REVIEWED" } })), "REVIEWED");
  assert.equal(permitsSpeciesIndexing("REVIEWED"), true);
  assert.equal(permitsSpeciesIndexing("DRAFT"), false);
  assert.match(router, /x-robots-tag", "noindex, nofollow, noarchive"/);
  assert.match(router, /meta name="googlebot" content="noindex,nofollow,noarchive"/);
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

test("the public species sitemap retains only universe routes and reviewed profiles", () => {
  assert.match(router, /incoming\.pathname === "\/species-sitemap\.xml"/);
  assert.match(router, /permitsSpeciesIndexing\(review\)/);
  assert.doesNotMatch(router, /review === null \|\| review === "REVIEWED"/);
  assert.match(router, /x-4species-index-gate": "human-review-v1"/);
});
