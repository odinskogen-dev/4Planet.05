import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  CURRENT_PUBLIC_SPECIES_SLUGS,
  hasApprovedNewSpeciesPhoto,
  NON_PROFILE_REVIEW_STATE,
  permitsSpeciesIndexing,
  profileReviewState,
  verifyApprovedNewSpeciesPhoto,
} from "../ops/discovery/4species-router.js";
import speciesWorker from "../ops/discovery/4species-router.js";

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
const trustedPhotoBytes = new TextEncoder().encode("independently-approved-photo-bytes");
const trustedPhotoSha256 = createHash("sha256").update(trustedPhotoBytes).digest("hex");
const trustedPhotoApproval = {
  slug: "test-animal",
  imageUrl: signedPhoto.url,
  sourcePage: signedPhoto.sourcePage,
  creator: signedPhoto.credit,
  licence: signedPhoto.licence,
  photoSha256: trustedPhotoSha256,
  photoReviewEvidence: "https://github.com/4planet/gold/photo-review",
  rightsReviewEvidence: "https://github.com/4planet/gold/rights-review",
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

test("new-profile photo approval rejects page-declared rights, hashes and Gold labels", async () => {
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
  assert.equal(hasApprovedNewSpeciesPhoto(page), false, "page-level Gold cannot approve its own photo");
  assert.equal(hasApprovedNewSpeciesPhoto({
    ...page,
    hero: { ...signedPhoto, licence: "All rights reserved" },
  }), false, "nonempty rights text is not a reuse grant");
  assert.equal(hasApprovedNewSpeciesPhoto({
    ...page,
    provenance: { ...page.provenance, photoSha256: "b".repeat(64) },
  }), false, "a second digest for the same URL cannot self-attest different bytes");
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, hero: { ...signedPhoto, url: "https://4species.com/assets/species/test-animal.svg" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, hero: { ...signedPhoto, credit: "" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, hero: { ...signedPhoto, licence: "" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, provenance: { ...page.provenance, photoSha256: "unpinned" } }), false);
  assert.equal(hasApprovedNewSpeciesPhoto({ ...page, provenance: { ...page.provenance, photoVisualReview: "PENDING" } }), false);

  assert.equal(hasApprovedNewSpeciesPhoto(page, trustedPhotoApproval, trustedPhotoSha256), true, "external approval and actual bytes agree");
  assert.equal(hasApprovedNewSpeciesPhoto(page, {
    ...trustedPhotoApproval,
    licence: "All rights reserved",
  }, trustedPhotoSha256), false, "external record still requires a reuse grant");
  assert.equal(hasApprovedNewSpeciesPhoto(page, trustedPhotoApproval, "b".repeat(64)), false, "same image URL cannot pass with incompatible bytes");

  const approvedPhotos = new Map([["test-animal", trustedPhotoApproval]]);
  const verified = await verifyApprovedNewSpeciesPhoto("test-animal", page, async () => new Response(trustedPhotoBytes, {
    headers: { "content-type": "image/jpeg" },
  }), approvedPhotos);
  assert.equal(verified, true, "admission hashes the fetched photo bytes against the external record");
  const incompatible = await verifyApprovedNewSpeciesPhoto("test-animal", page, async () => new Response(new TextEncoder().encode("different-photo-bytes"), {
    headers: { "content-type": "image/jpeg" },
  }), approvedPhotos);
  assert.equal(incompatible, false, "different bytes at the approved URL fail closed");
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

test("real worker GET and HEAD fail closed for preview and nested routes without losing the public 57", async () => {
  const originalFetch = globalThis.fetch;
  const originalHtmlRewriter = globalThis.HTMLRewriter;
  class PassThroughHTMLRewriter {
    on() { return this; }
    transform(response) { return response; }
  }
  globalThis.HTMLRewriter = PassThroughHTMLRewriter;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input);
    if (url.pathname === "/species-data/v1/orca.json") {
      return Response.json(sourcedProfile("orca", "DRAFT"));
    }
    if (url.pathname === "/species-data/v1/unknown.json") {
      return new Response("missing", { status: 404 });
    }
    if (url.pathname === "/species-sitemap.xml") {
      const xml = "<?xml version=\"1.0\"?><urlset>" +
        "<url><loc>https://72494005.4planet-05.pages.dev/orca</loc></url>" +
        "<url><loc>https://72494005.4planet-05.pages.dev/unknown</loc></url></urlset>";
      return new Response(init.method === "HEAD" ? null : xml, {
        status: 200,
        headers: { "content-type": "application/xml" },
      });
    }
    return new Response(init.method === "HEAD" ? null : "<!doctype html><html><head></head><body>species</body></html>", {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
    });
  };

  try {
    assert.equal(CURRENT_PUBLIC_SPECIES_SLUGS.size, 57);
    for (const method of ["GET", "HEAD"]) {
      const known = await speciesWorker.fetch(new Request("https://4species.com/orca", { method }));
      assert.equal(known.status, 200, `${method} known profile`);
      assert.equal(known.headers.get("link"), '<https://4species.com/orca>; rel="canonical"');
      assert.equal(known.headers.get("x-robots-tag"), null);

      const benignQuery = await speciesWorker.fetch(new Request("https://4species.com/orca?utm_source=4planet", { method }));
      assert.equal(benignQuery.status, 200, `${method} benign query`);
      assert.equal(benignQuery.headers.get("link"), '<https://4species.com/orca>; rel="canonical"');
      assert.equal(benignQuery.headers.get("x-robots-tag"), null);

      const trailingSlash = await speciesWorker.fetch(new Request("https://4species.com/orca/", { method, redirect: "manual" }));
      assert.equal(trailingSlash.status, 308, `${method} trailing slash`);
      assert.equal(trailingSlash.headers.get("location"), "https://4species.com/orca");
      assert.equal(trailingSlash.headers.get("link"), null);
      assert.equal(trailingSlash.headers.get("x-robots-tag"), null);
      assert.equal(await trailingSlash.text(), "", `${method} trailing slash body`);

      for (const path of ["/orca?preview=1", "/orca/unknown", "/unknown/path", "//orca"]) {
        const response = await speciesWorker.fetch(new Request(`https://4species.com${path}`, { method }));
        assert.equal(response.status, 404, `${method} ${path}`);
        assert.equal(response.headers.get("link"), null, `${method} ${path} canonical`);
        assert.match(response.headers.get("x-robots-tag") || "", /noindex/, `${method} ${path} robots`);
        const body = await response.text();
        if (method === "HEAD") assert.equal(body, "", `${path} HEAD body`);
        else assert.match(body, /<meta name="robots" content="noindex,nofollow,noarchive">/, `${path} HTML robots`);
      }

      const explore = await speciesWorker.fetch(new Request("https://4species.com/explore", { method }));
      assert.equal(explore.status, 200, `${method} /explore`);
      assert.equal(explore.headers.get("link"), '<https://4species.com/explore>; rel="canonical"');

      const sitemap = await speciesWorker.fetch(new Request("https://4species.com/species-sitemap.xml", { method }));
      assert.equal(sitemap.status, 200, `${method} sitemap`);
      if (method === "GET") {
        const xml = await sitemap.text();
        assert.match(xml, /https:\/\/4species\.com\/orca/);
        assert.doesNotMatch(xml, /https:\/\/4species\.com\/unknown/);
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.HTMLRewriter = originalHtmlRewriter;
  }
});
