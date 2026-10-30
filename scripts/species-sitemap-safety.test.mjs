import test from "node:test";
import assert from "node:assert/strict";
import worker, { CURRENT_PUBLIC_SPECIES_SLUGS, publicSpeciesCanonical } from "../ops/discovery/4species-router.js";
import { readFileSync } from "node:fs";

const workerSource = readFileSync(new URL("../ops/discovery/4species-router.js", import.meta.url), "utf8");

test("4SPECIES serves robots.txt with canonical sitemap", async () => {
  const response = await worker.fetch(new Request("https://4species.com/robots.txt"));
  assert.equal(response.status, 200);
  const robots = await response.text();
  assert.match(robots, /^User-agent: \*/);
  assert.match(robots, /\nSitemap: https:\/\/4species\.com\/sitemap\.xml\n/);
  assert.match(robots, /Disallow: \/api\//);
});

test("4SPECIES sitemap keeps the 57-profile baseline and rejects unapproved new profiles", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/species-sitemap.xml")) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><urlset>' +
        ['/', '/explore', '/orca', '/draft-species', '/unavailable']
          .map((path) => '<url><loc>https://species-v53.4planet-05.pages.dev' + path + '</loc></url>')
          .join("") + '</urlset>',
        { status: 200, headers: { "content-type": "application/xml" } },
      );
    }
    if (url.endsWith("/orca.json")) {
      return Response.json({schema:"4PLANET_SPECIES_PAGE_01",slug:"orca",identity:{commonName:"Orca",scientificName:"Orcinus orca"},hook:{source:{label:"NOAA",url:"https://www.fisheries.noaa.gov/species/killer-whale"}},provenance:{review:"REVIEWED"}});
    }
    if (url.endsWith("/draft-species.json")) {
      return Response.json({schema:"4PLANET_SPECIES_PAGE_01",slug:"draft-species",identity:{commonName:"Draft species",scientificName:"Example example"},hook:{source:{label:"Authoritative citation",url:"https://example.org/authority"}},provenance:{review:"DRAFT"}});
    }
    return new Response("Not found", { status: 404 });
  };
  const response = await worker.fetch(new Request("https://4species.com/sitemap.xml"));
  assert.equal(response.status, 200);
  const xml = await response.text();
  assert.match(xml, /https:\/\/4species\.com\/orca</);
  assert.match(xml, /https:\/\/4species\.com\/explore</);
  assert.doesNotMatch(xml, /draft-species/);
  assert.doesNotMatch(xml, /unavailable/);
  assert.doesNotMatch(xml, /pages\.dev/);
  assert.equal(response.headers.get("x-4species-index-gate"), "human-review-v1");
});

test("4SPECIES reviews all 57 sitemap profiles with bounded concurrency and stable order", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const slugs = [...CURRENT_PUBLIC_SPECIES_SLUGS];
  let activeProfileFetches = 0;
  let peakProfileFetches = 0;
  let profileFetches = 0;

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/species-sitemap.xml")) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><urlset>' +
        slugs.map((slug) => `<url><loc>https://species-v53.4planet-05.pages.dev/${slug}</loc></url>`).join("") +
        "</urlset>",
        { status: 200, headers: { "content-type": "application/xml" } },
      );
    }

    const profile = url.match(/\/species-data\/v1\/([^/]+)\.json$/);
    if (profile) {
      profileFetches += 1;
      activeProfileFetches += 1;
      peakProfileFetches = Math.max(peakProfileFetches, activeProfileFetches);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeProfileFetches -= 1;
      const slug = decodeURIComponent(profile[1]);
      return Response.json({
        schema: "4PLANET_SPECIES_PAGE_01",
        slug,
        identity: { commonName: slug, scientificName: "Reviewed species" },
        hook: { source: { label: "Authoritative citation", url: `https://example.org/${slug}` } },
        provenance: { review: "REVIEWED" },
      });
    }
    return new Response("Not found", { status: 404 });
  };

  const response = await worker.fetch(new Request("https://4species.com/sitemap.xml"));
  assert.equal(response.status, 200);
  const xml = await response.text();
  const emittedSlugs = [...xml.matchAll(/<loc>https:\/\/4species\.com\/([^<]+)<\/loc>/g)]
    .map((match) => match[1]);
  assert.equal(profileFetches, slugs.length);
  assert.ok(peakProfileFetches > 1, `expected concurrent review fetches, observed ${peakProfileFetches}`);
  assert.ok(peakProfileFetches <= 6, `expected at most 6 concurrent review fetches, observed ${peakProfileFetches}`);
  assert.deepEqual(emittedSlugs, slugs);
});

test("4SPECIES sitemap fails closed for source outages without misclassifying editorial rejection", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const slugs = [...CURRENT_PUBLIC_SPECIES_SLUGS];
  const sitemapXml = (paths = slugs) =>
    '<?xml version="1.0" encoding="UTF-8"?><urlset>' +
    paths.map((slug) => `<url><loc>https://species-v53.4planet-05.pages.dev/${slug}</loc></url>`).join("") +
    "</urlset>";
  const reviewedPage = (slug) => ({
    schema: "4PLANET_SPECIES_PAGE_01",
    slug,
    identity: { commonName: slug, scientificName: "Reviewed species" },
    hook: { source: { label: "Authoritative citation", url: `https://example.org/${slug}` } },
    provenance: { review: "REVIEWED" },
  });

  for (const method of ["GET", "HEAD"]) {
    globalThis.fetch = async (input, init = {}) => {
      const url = String(input);
      if (url.endsWith("/species-sitemap.xml")) {
        assert.equal(init.method, "GET", `${method} health check must read the upstream sitemap`);
        return new Response(sitemapXml(), {
          status: 200,
          headers: { "content-type": "application/xml" },
        });
      }
      if (url.includes("/species-data/v1/")) return new Response("Unavailable", { status: 503 });
      return new Response("Not found", { status: 404 });
    };
    const response = await worker.fetch(new Request("https://4species.com/sitemap.xml", { method }));
    assert.equal(response.status, 503, `${method} all-profile outage`);
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    if (method === "HEAD") assert.equal(await response.text(), "");
  }

  const failedSlug = slugs[17];
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/species-sitemap.xml")) {
      return new Response(sitemapXml(), { status: 200, headers: { "content-type": "application/xml" } });
    }
    const profile = url.match(/\/species-data\/v1\/([^/]+)\.json$/);
    if (profile) {
      const slug = decodeURIComponent(profile[1]);
      if (slug === failedSlug) return new Response("Unavailable", { status: 503 });
      return Response.json(reviewedPage(slug));
    }
    return new Response("Not found", { status: 404 });
  };
  const partial = await worker.fetch(new Request("https://4species.com/sitemap.xml"));
  assert.equal(partial.status, 503, "one unavailable public profile must not become cached partial loss");
  assert.match(partial.headers.get("cache-control") || "", /no-store/);

  globalThis.fetch = async (_input, init = {}) => {
    assert.ok(init.signal, "upstream sitemap request must carry an application timeout");
    throw new DOMException("Upstream timeout", "TimeoutError");
  };
  const stalled = await worker.fetch(new Request("https://4species.com/sitemap.xml"));
  assert.equal(stalled.status, 503);
  assert.match(stalled.headers.get("cache-control") || "", /no-store/);

  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/species-sitemap.xml")) {
      return new Response(sitemapXml([...slugs, "editorial-reject"]), {
        status: 200,
        headers: { "content-type": "application/xml" },
      });
    }
    const profile = url.match(/\/species-data\/v1\/([^/]+)\.json$/);
    if (profile) {
      const slug = decodeURIComponent(profile[1]);
      if (slug === "editorial-reject") {
        return Response.json({ ...reviewedPage(slug), identity: { commonName: slug } });
      }
      return Response.json(reviewedPage(slug));
    }
    return new Response("Not found", { status: 404 });
  };
  const editorial = await worker.fetch(new Request("https://4species.com/sitemap.xml"));
  assert.equal(editorial.status, 200);
  const editorialXml = await editorial.text();
  assert.doesNotMatch(editorialXml, /editorial-reject/);
  assert.equal([...editorialXml.matchAll(/<loc>https:\/\/4species\.com\/([^<]+)<\/loc>/g)].length, slugs.length);
});


test("4SPECIES reinforces one clean canonical host on HTML and HEAD", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url.endsWith("/species-data/v1/green-sea-turtle.json")) {
      return Response.json({
        schema: "4PLANET_SPECIES_PAGE_01",
        slug: "green-sea-turtle",
        identity: { commonName: "Green sea turtle", scientificName: "Chelonia mydas" },
        hook: { source: { label: "IUCN", url: "https://www.iucnredlist.org/" } },
        provenance: { review: "REVIEWED" },
      });
    }
    if (url.endsWith("/green-sea-turtle")) {
      return new Response(init.method === "HEAD" ? null : "<!doctype html><html><head></head><body></body></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    return new Response("Not found", { status: 404 });
  };

  const head = await worker.fetch(new Request("https://4species.com/green-sea-turtle", { method: "HEAD" }));
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("link"), '<https://4species.com/green-sea-turtle>; rel="canonical"');

  const slash = await worker.fetch(new Request("https://4species.com/green-sea-turtle/?from=legacy", { redirect: "manual" }));
  assert.equal(slash.status, 308);
  assert.equal(slash.headers.get("location"), "https://4species.com/green-sea-turtle?from=legacy");

  const legacyRoot = await worker.fetch(new Request("https://4species.com/species/", { redirect: "manual" }));
  assert.equal(legacyRoot.status, 301);
  assert.equal(legacyRoot.headers.get("location"), "https://4species.com/explore");
});

test("canonical HTML rewrite is bound to the clean public SPECIES URL", () => {
  assert.equal(publicSpeciesCanonical("/green-sea-turtle"), "https://4species.com/green-sea-turtle");
  assert.equal(publicSpeciesCanonical("/explore"), "https://4species.com/explore");
  assert.equal(publicSpeciesCanonical("/species/green-sea-turtle"), null);
  assert.equal(publicSpeciesCanonical("/green-sea-turtle/"), null);
  assert.match(workerSource, /link\[rel="canonical"\]/);
  assert.match(workerSource, /meta\[property="og:url"\]/);
});

test("unknown profile-shaped slugs return a real 404 for GET and HEAD", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/species-data/v1/__unreviewed-species-audit-canary-no-such-animal.json")) {
      return new Response("Not found", { status: 404 });
    }
    if (url.endsWith("/__unreviewed-species-audit-canary-no-such-animal")) {
      return new Response("<!doctype html><html><head></head><body><div id=\"root\"></div></body></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    return new Response("Not found", { status: 404 });
  };

  for (const method of ["GET", "HEAD"]) {
    const response = await worker.fetch(new Request(
      "https://4species.com/__unreviewed-species-audit-canary-no-such-animal",
      { method },
    ));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    assert.equal(response.headers.get("link"), null);
    if (method === "GET") assert.match(await response.text(), /No species profile exists at this address/i);
  }
});
