// Exact-host locked Cloudflare origin, prepared for the existing private 4PLANET OS.
// No BRAIN, Drive, tenant, account, session, or public LABS data is served here.
// Do not route this hostname to an OS preview until Founder Access is independently verified.
const HOST = "os.4planet.org";
const common = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-4Planet-OS": "LOCKED_NOT_RELEASED"
};
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>4PLANET_ OS — Private control plane</title><style>html{font-family:system-ui,sans-serif;color:#e9f5ea;background:#08100b}body{display:grid;min-height:100vh;place-items:center;margin:0;padding:28px;box-sizing:border-box}.frame{width:min(100%,720px);border-top:1px solid #3ae86f;padding-top:22px}.eyebrow{font-size:12px;letter-spacing:.18em;color:#3ae86f}h1{font-size:clamp(42px,8vw,84px);line-height:.94;letter-spacing:-.06em;font-weight:600;margin:28px 0}p{color:#a9baad;max-width:560px;line-height:1.65}.foot{border-top:1px solid #294030;margin-top:44px;padding-top:16px;font-size:11px;letter-spacing:.12em;color:#8fa08e}</style></head><body><main class="frame"><div class="eyebrow">4PLANET_ / FOUNDER CONTROL</div><h1>PRIVATE<br>CONTROL PLANE.</h1><p>The private operating system is locked until identity-aware access and the authoritative BRAIN feed pass their release gates. No project, financial or personal records are served here.</p><div class="foot">ACCESS CLOSED · PRIVATE DATA NOT EXPOSED</div></main></body></html>`;
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== HOST) return new Response("Unrecognised host.", { status: 421, headers: common });
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed.", { status: 405, headers: { ...common, Allow: "GET, HEAD" } });
    }
    if (url.pathname === "/_status") {
      return new Response(request.method === "HEAD" ? null : JSON.stringify({ system: "4PLANET_OS", release: "LOCKED", founderAccessVerified: false, brainSyncVerified: false }), {
        status: 200,
        headers: { ...common, "Content-Type": "application/json; charset=utf-8" }
      });
    }
    return new Response(request.method === "HEAD" ? null : page, {
      status: 423,
      headers: { ...common, "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
