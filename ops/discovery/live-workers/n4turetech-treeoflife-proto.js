// n4turetech-worker.mjs
var UPSTREAM = "https://build-tree-of-life-action-in.4planet-05.pages.dev";
var n4turetech_worker_default = {
  async fetch(request) {
    const incoming = new URL(request.url);
    let path = incoming.pathname || "/";
    if (path === "/" || path === "") path = "/tree-of-life";
    else if (path === "/choice") path = "/tree-of-life/choice";
    const upstream = new URL(path, UPSTREAM);
    upstream.search = incoming.search;
    const response = await fetch(new Request(upstream.toString(), request));
    const headers = new Headers(response.headers);
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
export {
  n4turetech_worker_default as default
};
//# sourceMappingURL=n4turetech-worker.js.map
