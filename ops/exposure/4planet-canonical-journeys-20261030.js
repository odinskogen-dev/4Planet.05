// SEO-only exact-route canonical repair for two public 4PLANET pages.
// Does not deploy application builds, change content, or release IMPACT candidates.
// Routes may only be attached after Cloudflare preflight proves the live 308 ->
// slash destination and its original self-declared slashless canonical.
const TARGETS = new Map([
  ["/impact", "/impact/"],
  ["/wildfires", "/wildfires/"],
]);
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const slashTarget = TARGETS.get(url.pathname);
    if (url.hostname !== "4planet.org" || !slashTarget)
      return new Response("Not Found", { status: 404 });
    if (request.method !== "GET" && request.method !== "HEAD")
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    const safeHeaders = new Headers();
    for (const key of ["accept", "accept-language", "user-agent"]) {
      const value = request.headers.get(key);
      if (value) safeHeaders.set(key, value);
    }
    const target = new URL("https://4planet.org" + slashTarget);
    target.search = url.search;
    const upstream = await fetch(target, { method: request.method, headers: safeHeaders, redirect: "follow" });
    if (upstream.status !== 200 || !/text\/html/i.test(upstream.headers.get("content-type") || "")) {
      return new Response("Canonical origin temporarily unavailable", {
        status: 502, headers: { "cache-control": "no-store" }
      });
    }
    const headers = new Headers(upstream.headers);
    for (const key of ["content-encoding", "content-length", "set-cookie", "etag", "location"])
      headers.delete(key);
    headers.set("x-4planet-seo-p0", "canonical-journeys-20261030");
    headers.set("cache-control", "no-store");
    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: 200, headers
    });
  }
};
