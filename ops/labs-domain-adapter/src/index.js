// LABS host-only deployment adapter. BRAIN and private tenant data are NOT served here.
// Source is pinned to the exact QA-approved, public-safe LABS preview.
const SOURCE_SHA = "13fd59158c876b69d6601d27121334301fc25fa0";
const IMMUTABLE_ORIGIN = "https://fcbcda02.4planet-05.pages.dev";
const CANONICAL_HOST = "labs.4planet.org";

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (incoming.hostname !== CANONICAL_HOST) {
      return new Response("Host not served by LABS adapter.", { status: 421 });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed.", { status: 405, headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" } });
    }
    if (incoming.pathname.startsWith("/api/") || incoming.pathname.startsWith("/__")) {
      return new Response("Private API not exposed.", { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const upstream = new URL(IMMUTABLE_ORIGIN);
    upstream.pathname = incoming.pathname;
    upstream.search = incoming.search;

    // Only public static-asset negotiation travels upstream. Never forward
    // cookies, auth, Access JWTs, client IPs or private request headers.
    const headers = new Headers();
    for (const key of ["accept", "accept-language", "if-none-match", "if-modified-since", "range"]) {
      const value = request.headers.get(key);
      if (value) headers.set(key, value);
    }
    let response;
    try {
      response = await fetch(upstream.toString(), {
        method: request.method,
        headers,
        redirect: "manual",
      });
    } catch {
      return new Response("LABS verified source unavailable.", {
        status: 503,
        headers: { "Cache-Control": "no-store", "X-Labs-Source-Commit": SOURCE_SHA },
      });
    }

    const outbound = new Headers(response.headers);
    outbound.delete("set-cookie");
    outbound.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    outbound.set("X-Labs-Source-Commit", SOURCE_SHA);
    outbound.set("Referrer-Policy", "same-origin");
    if ((outbound.get("content-type") || "").includes("text/html")) {
      outbound.set("Cache-Control", "no-store");
    }
    // Pinning to an immutable deployment also prevents an unreviewed LABS push
    // from silently being promoted to the canonical Founder-facing domain.
    return new Response(request.method === "HEAD" ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outbound,
    });
  },
};
