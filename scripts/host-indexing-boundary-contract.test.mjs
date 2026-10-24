import test from "node:test";
import assert from "node:assert/strict";

import { onRequest } from "../functions/_middleware.js";

const PRIVATE_POLICY = "noindex, nofollow, noarchive";

function request(url, response = new Response("edge body", {
  status: 200,
  headers: {
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "public, max-age=300",
  },
})) {
  let nextCalls = 0;
  return {
    context: {
      request: new Request(url),
      next: async () => {
        nextCalls += 1;
        return response;
      },
    },
    nextCalls: () => nextCalls,
  };
}

test("private hosts emit fail-closed HTTP crawler and cache headers", async () => {
  for (const host of [
    "test.4planet.org",
    "labs.4planet.org",
    "os.4planet.org",
    "id.4planet.org",
    "candidate-42.pages.dev",
    "localhost",
    "preview.localhost",
  ]) {
    const harness = request(`https://${host}/`);
    const response = await onRequest(harness.context);

    assert.equal(response.headers.get("x-robots-tag"), PRIVATE_POLICY, host);
    assert.equal(response.headers.get("cache-control"), "no-store", host);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff", host);
    assert.equal(await response.text(), "edge body", host);
    assert.equal(harness.nextCalls(), 1, host);
  }
});

test("private paths on public hosts receive the same raw-response policy", async () => {
  for (const path of [
    "/account",
    "/account/profile",
    "/admin/users",
    "/auth/callback",
    "/saved/items",
    "/id/profile",
    "/oauth/callback",
    "/labs/demo",
    "/os/projects",
    "/sandbox/demo",
    "/company-brain/docs",
  ]) {
    const harness = request(`https://4planet.org${path}`);
    const response = await onRequest(harness.context);

    assert.equal(response.headers.get("x-robots-tag"), PRIVATE_POLICY, path);
    assert.equal(response.headers.get("cache-control"), "no-store", path);
  }
});

test("public roots remain indexable and preserve their upstream cache policy", async () => {
  for (const url of ["https://4planet.org/", "https://4planetatlas.com/atlas/"]) {
    const harness = request(url);
    const response = await onRequest(harness.context);

    assert.equal(response.headers.get("x-robots-tag"), null, url);
    assert.equal(response.headers.get("cache-control"), "public, max-age=300", url);
    assert.equal(harness.nextCalls(), 1, url);
  }
});

test("About Story raw response is indexable only on the production host", async () => {
  const storyHtml = '<!doctype html><html><head><meta name="robots" content="index,follow,max-image-preview:large"></head><body>Story</body></html>';
  const upstream = () => new Response(storyHtml, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });

  for (const host of ["test.4planet.org", "candidate-42.pages.dev", "localhost"]) {
    const harness = request(`https://${host}/about/story/`, upstream());
    const response = await onRequest(harness.context);

    assert.equal(response.headers.get("x-robots-tag"), PRIVATE_POLICY, host);
    assert.equal(response.headers.get("cache-control"), "no-store", host);
    assert.equal(await response.text(), storyHtml, host);
    assert.equal(harness.nextCalls(), 1, host);
  }

  const production = request("https://4planet.org/about/story/", upstream());
  const response = await onRequest(production.context);

  assert.equal(response.headers.get("x-robots-tag"), null);
  assert.equal(response.headers.get("cache-control"), "public, max-age=300");
  assert.equal(await response.text(), storyHtml);
  assert.equal(production.nextCalls(), 1);
});

test("private robots policy fails closed before the application response", async () => {
  for (const host of ["test.4planet.org", "candidate-42.pages.dev", "localhost"]) {
    const harness = request(`https://${host}/robots.txt`);
    const response = await onRequest(harness.context);

    assert.equal(response.status, 200, host);
    assert.equal(response.headers.get("x-robots-tag"), PRIVATE_POLICY, host);
    assert.equal(await response.text(), "User-agent: *\nDisallow: /\n", host);
    assert.equal(harness.nextCalls(), 0, host);
  }
});

