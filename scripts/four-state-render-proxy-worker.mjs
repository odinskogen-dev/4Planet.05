export default {
  async fetch(request, env) {
    const upstream = String(env.UPSTREAM_ORIGIN || "").replace(/\/$/, "");
    if (!upstream.startsWith("https://")) return new Response("Render upstream unresolved", { status: 503 });

    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, upstream);
    const headers = new Headers(request.headers);
    headers.set("host", target.host);
    headers.delete("cookie");
    headers.delete("authorization");

    const init = {
      method: request.method,
      headers,
      redirect: "manual"
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Read-only Founder review proxy", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    const upstreamResponse = await fetch(target.toString(), init);
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("x-frame-options");
    const csp = responseHeaders.get("content-security-policy");
    if (csp) {
      responseHeaders.set("content-security-policy", csp.replace(/(?:^|;)\s*frame-ancestors[^;]*/gi, ""));
    }
    responseHeaders.set("x-robots-tag", "noindex, nofollow");
    responseHeaders.set("x-4planet-render-proxy", "read-only-v1");
    responseHeaders.set("cache-control", "no-store");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  }
};
