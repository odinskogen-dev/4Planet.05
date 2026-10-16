import test from "node:test";
import assert from "node:assert/strict";
import worker from "../ops/discovery/4species-router.js";

test("4SPECIES serves robots.txt with canonical sitemap", async () => {
  const response = await worker.fetch(new Request("https://4species.com/robots.txt"));
  assert.equal(response.status, 200);
  const robots = await response.text();
  assert.match(robots, /^User-agent: \*/);
  assert.match(robots, /\nSitemap: https:\/\/4species\.com\/sitemap\.xml\n/);
  assert.match(robots, /Disallow: \/api\//);
});

test("4SPECIES sitemap keeps only reviewed species and canonical public URLs", async (t) => {
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
      return Response.json({ provenance: { review: "REVIEWED" } });
    }
    if (url.endsWith("/draft-species.json")) {
      return Response.json({ provenance: { review: "DRAFT" } });
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
