import test from "node:test";
import assert from "node:assert/strict";

import { onRequest } from "../functions/_middleware.js";

const PRIVATE_POLICY = "noindex, nofollow, noarchive";

class CallbackHTMLRewriter {
  constructor() {
    this.handlers = new Map();
  }

  on(selector, handler) {
    this.handlers.set(selector, handler);
    return this;
  }

  transform(response) {
    const robotsHandler = this.handlers.get('meta[name="robots"]');
    const body = new ReadableStream({
      async start(controller) {
        let html = await response.text();
        html = html.replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, (tag) => {
          let rewritten = tag;
          robotsHandler?.element?.({
            getAttribute(name) {
              const match = rewritten.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
              return match?.[1] ?? null;
            },
            setAttribute(name, value) {
              const attribute = new RegExp(`\\b${name}=["'][^"']*["']`, "i");
              rewritten = attribute.test(rewritten)
                ? rewritten.replace(attribute, `${name}="${value}"`)
                : rewritten.replace(/\s*\/>$|>$/, ` ${name}="${value}">`);
            },
          });
          return rewritten;
        });
        controller.enqueue(new TextEncoder().encode(html));
        controller.close();
      },
    });

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
}

globalThis.HTMLRewriter = CallbackHTMLRewriter;

class DiscoveryHTMLRewriter {
  constructor() {
    this.handlers = new Map();
  }

  on(selector, handler) {
    this.handlers.set(selector, handler);
    return this;
  }

  transform(response) {
    const handlers = this.handlers;
    const body = new ReadableStream({
      async start(controller) {
        let html = await response.text();
        const mutateElement = (tag, handler, inner = "") => {
          let rewritten = tag;
          let removed = false;
          handler?.element?.({
            getAttribute(name) {
              const match = rewritten.match(new RegExp("\\b" + name + "=[\"']([^\"']*)[\"']", "i"));
              return match?.[1] ?? null;
            },
            setAttribute(name, value) {
              const attribute = new RegExp("\\b" + name + "=[\"'][^\"']*[\"']", "i");
              rewritten = attribute.test(rewritten)
                ? rewritten.replace(attribute, name + "=\"" + value + "\"")
                : rewritten.replace(/\s*\/>$|>$/, " " + name + "=\"" + value + "\">");
            },
            setInnerContent(value) {
              inner = value;
            },
            append(value) {
              inner += value;
            },
            remove() {
              removed = true;
            },
          });
          return { rewritten, inner, removed };
        };
        const replaceContainer = (selector, expression) => {
          const handler = handlers.get(selector);
          if (!handler) return;
          html = html.replace(expression, (tag, opening, inner, closing) => {
            const result = mutateElement(opening, handler, inner);
            return result.removed ? "" : result.rewritten + result.inner + closing;
          });
        };
        const replaceVoid = (selector, expression) => {
          const handler = handlers.get(selector);
          if (!handler) return;
          html = html.replace(expression, (tag) => {
            const result = mutateElement(tag, handler);
            return result.removed ? "" : result.rewritten;
          });
        };

        replaceContainer("title", /(<title\b[^>]*>)([\s\S]*?)(<\/title>)/gi);
        replaceVoid('meta[name="description"]', /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi);
        replaceVoid('meta[name="robots"]', /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi);
        replaceVoid('meta[property="og:title"]', /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/gi);
        replaceVoid('meta[property="og:description"]', /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/gi);
        replaceVoid('meta[property="og:url"]', /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/gi);
        replaceVoid('meta[name="twitter:title"]', /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/gi);
        replaceVoid('meta[name="twitter:description"]', /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/gi);
        replaceVoid('link[rel="canonical"]', /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi);
        replaceContainer('script[type="application/ld+json"][data-4planet-prerender="true"]', /(<script\b(?=[^>]*\btype=["']application\/ld\+json["'])(?=[^>]*\bdata-4planet-prerender=["']true["'])[^>]*>)([\s\S]*?)(<\/script>)/gi);
        replaceContainer("head", /(<head\b[^>]*>)([\s\S]*?)(<\/head>)/gi);
        replaceContainer("#root", /(<[^>]+\bid=["']root["'][^>]*>)([\s\S]*?)(<\/[^>]+>)/gi);
        controller.enqueue(new TextEncoder().encode(html));
        controller.close();
      },
    });
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
}

function htmlResponse({ robots = "index,follow", xRobotsTag, status = 200 } = {}) {
  const headers = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "public, max-age=300",
  };
  if (xRobotsTag) headers["x-robots-tag"] = xRobotsTag;
  return new Response(`<!doctype html><html><head><meta name="robots" content="${robots}"></head><body>Upstream</body></html>`, {
    status,
    headers,
  });
}

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

test("explicit upstream noindex survives public-host middleware", async () => {
  for (const [url, policy] of [
    ["https://4planet.org/unreleased-test", "noindex, nofollow"],
    ["https://4planet.org/unreleased-test", "noindex, nofollow, noarchive"],
    ["https://s4piens.com/unreleased-test", "noindex, nofollow"],
  ]) {
    const upstream = htmlResponse({ robots: "noindex,nofollow", xRobotsTag: policy });
    const upstreamBody = await upstream.clone().text();
    const harness = request(url, upstream);
    const response = await onRequest(harness.context);

    assert.equal(response.headers.get("x-robots-tag"), policy, url);
    assert.equal(await response.text(), upstreamBody, url);
    assert.equal(harness.nextCalls(), 1, url);
  }
});

test("unknown public-host routes preserve upstream meta-only noindex without normalisation", async () => {
  const originalRewriter = globalThis.HTMLRewriter;
  globalThis.HTMLRewriter = class {
    constructor() { throw new Error("unknown S4PIENS route reached SEO normalisation"); }
  };
  try {
    for (const url of [
      "https://4planet.org/unreleased-test",
      "https://s4piens.com/unreleased-test",
      "https://4brands.org/unreleased-test",
    ]) {
      const upstream = htmlResponse({ robots: "noindex,nofollow" });
      const upstreamBody = await upstream.clone().text();
      const harness = request(url, upstream);
      const response = await onRequest(harness.context);

      assert.equal(response.status, 200, url);
      assert.equal(response.headers.get("x-robots-tag"), null, url);
      assert.equal(await response.text(), upstreamBody, url);
    }
  } finally {
    globalThis.HTMLRewriter = originalRewriter;
  }
});

test("unknown 404 routes are not promoted into indexable success responses", async () => {
  const originalRewriter = globalThis.HTMLRewriter;
  globalThis.HTMLRewriter = class {
    constructor() { throw new Error("unknown 404 route reached SEO normalisation"); }
  };
  try {
    const upstream = htmlResponse({ robots: "noindex,nofollow", xRobotsTag: "noindex, nofollow", status: 404 });
    const harness = request("https://s4piens.com/missing-object", upstream);
    const response = await onRequest(harness.context);

    assert.equal(response.status, 404);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  } finally {
    globalThis.HTMLRewriter = originalRewriter;
  }
});

test("approved public routes remain indexable", async () => {
  for (const url of ["https://4planet.org/", "https://s4piens.com/system/food", "https://4brands.org/"]) {
    const harness = request(url, htmlResponse());
    const response = await onRequest(harness.context);

    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get("x-robots-tag"), null, url);
  }
});

for (const [url, robots] of [
  ["https://4planet.org/", "NoIndex, nofollow"],
  ["https://s4piens.com/system/food", "nofollow NOINDEX"],
  ["https://4brands.org/", "max-image-preview:large,NOINDEX"],
]) {
  test(`approved public route preserves upstream meta-only noindex: ${url}`, async () => {
    const harness = request(url, htmlResponse({ robots }));
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200, url);
    assert.match(html, new RegExp(`<meta\\s+name="robots"\\s+content="${robots}">`, "i"), url);
    assert.doesNotMatch(html, /content="index,follow,max-image-preview:large"/i, url);
  });
}

test("approved public routes normalise index-eligible upstream robots metadata", async () => {
  for (const url of ["https://4planet.org/", "https://s4piens.com/system/food", "https://4brands.org/"]) {
    const harness = request(url, htmlResponse({ robots: "index,follow" }));
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200, url);
    assert.match(html, /<meta\s+name="robots"\s+content="index,follow,max-image-preview:large">/i, url);
  }
});

for (const [url, robots] of [
  ["https://4planet.org/", "none"],
  ["https://s4piens.com/system/food", "NONE"],
  ["https://4brands.org/", "nofollow,none"],
]) {
  test(`approved public route preserves upstream meta robots none: ${url}`, async () => {
    const harness = request(url, htmlResponse({ robots }));
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200, url);
    assert.match(html, new RegExp(`<meta\\s+name="robots"\\s+content="${robots}">`, "i"), url);
    assert.doesNotMatch(html, /content="index,follow,max-image-preview:large"/i, url);
  });
}

for (const [url, robots] of [
  ["https://4planet.org/", "nosnippet"],
  ["https://s4piens.com/system/food", "noimageindex"],
  ["https://4brands.org/", "max-snippet:0"],
  ["https://4planet.org/", "max-image-preview:none"],
  ["https://s4piens.com/system/food", "unavailable_after: 25 Oct 2026 12:00:00 GMT"],
]) {
  test(`approved public route preserves restrictive upstream meta robots: ${robots}`, async () => {
    const harness = request(url, htmlResponse({ robots }));
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200, url);
    assert.ok(html.includes(`<meta name="robots" content="${robots}">`), url);
    assert.doesNotMatch(html, /content="index,follow,max-image-preview:large"/i, url);
  });
}

for (const [url, policy] of [
  ["https://4planet.org/", "none"],
  ["https://s4piens.com/system/food", "NONE"],
  ["https://4brands.org/", "nosnippet"],
  ["https://s4piens.com/system/food", "noimageindex"],
  ["https://4planet.org/", "max-snippet:0"],
]) {
  test(`approved public route preserves restrictive X-Robots-Tag: ${policy}`, async () => {
    const upstream = htmlResponse({ xRobotsTag: policy });
    const upstreamBody = await upstream.clone().text();
    const harness = request(url, upstream);
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get("x-robots-tag"), policy, url);
    if (/^none$/i.test(policy)) {
      assert.equal(html, upstreamBody, url);
    } else {
      assert.match(html, /<meta\s+name="robots"\s+content="index,follow,max-image-preview:large">/i, url);
    }
  });
}

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

test("About Story production response contains the existing Story before JavaScript", async () => {
  const originalRewriter = globalThis.HTMLRewriter;
  globalThis.HTMLRewriter = DiscoveryHTMLRewriter;
  try {
    const upstream = new Response('<!doctype html><html><head><title>4PLANET</title><meta name="description" content="Shell"><meta name="robots" content="index,follow"><link rel="canonical" href="https://4planet.org/"></head><body><div id="root"></div></body></html>', {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
    const harness = request("https://4planet.org/about/story", upstream);
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.equal(harness.nextCalls(), 1);
    assert.match(html, /<title>The living planet is not an abstract issue\. \| 4PLANET<\/title>/);
    assert.match(html, /<meta name="description" content="It is the system beneath food, water, health, prosperity, freedom and almost everything people care about\.">/);
    assert.match(html, /<link rel="canonical" href="https:\/\/4planet\.org\/about\/story">/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const phrase of [
      "The living planet is not an abstract issue.",
      "Human life sits inside living systems.",
      "Care is everywhere. Connection is not.",
      "Make the living planet easier to see, understand and help.",
    ]) assert.ok(html.includes(phrase), phrase);
    for (const href of ["/about/system", "/about/what-we-believe", "/join"]) {
      assert.ok(html.includes('href="https://4planet.org' + href + '"'), href);
    }
    assert.match(html, /"@type":"AboutPage"/);
  } finally {
    globalThis.HTMLRewriter = originalRewriter;
  }
});

test("About Story production response has one owned AboutPage graph", async () => {
  const originalRewriter = globalThis.HTMLRewriter;
  globalThis.HTMLRewriter = DiscoveryHTMLRewriter;
  try {
    const prerendered = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "The living planet is not an abstract issue.",
      url: "https://4planet.org/about/story",
    });
    const upstream = new Response('<!doctype html><html><head><title>4PLANET</title><meta name="description" content="Shell"><meta name="robots" content="index,follow"><link rel="canonical" href="https://4planet.org/"><script type="application/ld+json" data-4planet-prerender="true">' + prerendered + '</script></head><body><div id="root"><main><h1>The living planet is not an abstract issue.</h1></main></div></body></html>', {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
    const harness = request("https://4planet.org/about/story", upstream);
    const response = await onRequest(harness.context);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.equal(harness.nextCalls(), 1);
    assert.equal((html.match(/"@type":"AboutPage"/g) || []).length, 1);
    assert.equal((html.match(/data-4planet-prerender=["']true["']/g) || []).length, 0);
  } finally {
    globalThis.HTMLRewriter = originalRewriter;
  }
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

