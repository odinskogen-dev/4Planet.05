// Scoped 4PLANET /now canonical correction; zero broad site deploy.
// Existing https://4planet.org/now/ HTML declares canonical https://4planet.org/now
// but the slashless URL currently responds 308. This route serves those exact
// same bytes with HTTP 200 at the declared canonical location. Query preserved.
// No SPECIES, authentication, Atlas route, profile or external actor mutation.
export default {
  async fetch(request) {
    const original = new URL(request.url);
    if (original.hostname !== "4planet.org" || original.pathname !== "/now") {
      return new Response("Not Found", { status: 404 });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    const target = new URL("https://4planet.org/now/");
    target.search = original.search;
    const safeHeaders = new Headers();
    for (const name of ["accept", "accept-language", "user-agent"]) {
      const value = request.headers.get(name);
      if (value) safeHeaders.set(name, value);
    }
    const upstream = await fetch(target.toString(), {
      method: request.method,
      headers: safeHeaders,
      redirect: "follow",
    });
    if (upstream.status !== 200 || !(upstream.headers.get("content-type") || "").includes("text/html")) {
      return new Response("Temporarily unavailable", {
        status: 502,
        headers: { "cache-control": "no-store" },
      });
    }
    const headers = new Headers(upstream.headers);
    for (const name of ["content-encoding", "content-length", "set-cookie", "etag"]) headers.delete(name);
    headers.set("x-4planet-seo-p0", "canonical-now-2026-10-27");
    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: 200, headers,
    });
  },
};
