// CAP-PLATFORM-01 — isolated routing layer; no auth, data, grant intelligence or database here.
// Pinned immutable Cloudflare Pages Finance preview release, not a mutable preview alias.
const PINNED_ORIGIN = "https://255d593e.4planet-05.pages.dev";
const ALLOWED_HOST = "finance.4planet.org";
export default {
  async fetch(request) {
    const original = new URL(request.url);
    if (original.hostname !== ALLOWED_HOST) return new Response("Not found", { status:404 });
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", {status:405,headers:{"Allow":"GET, HEAD"}});
    const destination = new URL(original.pathname + original.search, PINNED_ORIGIN);
    const upstream = await fetch(new Request(destination.toString(), request), {redirect:"manual"});
    const headers = new Headers(upstream.headers);
    headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
    headers.set("Cache-Control","private, max-age=0, must-revalidate");
    headers.set("Vary","Host");
    headers.delete("Set-Cookie");
    const location = headers.get("Location");
    if(location && location.startsWith(PINNED_ORIGIN))headers.set("Location",location.replace(PINNED_ORIGIN,original.origin));
    return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
  }
};
