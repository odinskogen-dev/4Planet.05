import assert from "node:assert/strict";
import test from "node:test";

import { onRequest } from "../functions/_middleware.js";

async function request(path) {
  return onRequest({
    request: new Request(`https://4planetatlas.com${path}`),
    next: async () => new Response("unexpected fallthrough", { status: 599 }),
  });
}

test("ATLAS Place runtime serves one canonical page and one real map image", async () => {
  const place = await request("/place/berlin");
  assert.equal(place.status, 200);
  assert.match(place.headers.get("content-type") ?? "", /^text\/html\b/);
  const html = await place.text();
  assert.match(html, /rel="canonical" href="https:\/\/4planetatlas\.com\/place\/berlin"/);
  assert.match(html, /property="og:image" content="https:\/\/4planetatlas\.com\/place\/berlin\/map\.svg"/);
  assert.match(html, /Explore Berlin in the interactive ATLAS/);

  const image = await request("/place/berlin/map.svg");
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type") ?? "", /^image\/svg\+xml\b/);
  assert.match(await image.text(), /<svg\b/);
});

test("ATLAS Place runtime collapses duplicate URL variants without losing queries", async () => {
  const cases = [
    ["/place?source=contract", "https://4planetatlas.com/places?source=contract"],
    ["/place/?source=contract", "https://4planetatlas.com/places?source=contract"],
    ["/places/?source=contract", "https://4planetatlas.com/places?source=contract"],
    ["/place/berlin/?source=contract", "https://4planetatlas.com/place/berlin?source=contract"],
  ];

  for (const [path, expected] of cases) {
    const response = await request(path);
    assert.equal(response.status, 308, path);
    assert.equal(response.headers.get("location"), expected, path);
  }
});

test("ATLAS Living Systems aliases preserve deep-link identity and query context", async () => {
  const cases = [
    ["/living-systems?source=atlas", "https://4planet.org/livingsystems/?source=atlas"],
    ["/livingsystems?source=atlas", "https://4planet.org/livingsystems/?source=atlas"],
    ["/living-systems/species/orca/?returnTo=%2Fatlas", "https://4planet.org/livingsystems/species/orca?returnTo=%2Fatlas"],
    ["/livingsystems/ecosystems/EC_AMAZON_RAINFOREST/?source=atlas", "https://4planet.org/livingsystems/ecosystems/EC_AMAZON_RAINFOREST?source=atlas"],
  ];

  for (const [path, expected] of cases) {
    const response = await request(path);
    assert.equal(response.status, 308, path);
    assert.equal(response.headers.get("location"), expected, path);
  }
});

test("ATLAS Place runtime fails closed for unknown place and image slugs", async () => {
  for (const [path, contentType] of [
    ["/place/__not-a-real-place__", /^text\/html\b/],
    ["/place/__not-a-real-place__/map.svg", /^text\/plain\b/],
  ]) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    assert.match(response.headers.get("content-type") ?? "", contentType, path);
  }
});
