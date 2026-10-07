// SUPERSAPIEN — isolated host-only Cloudflare origin proxy.
// Deployment infrastructure only. Does not import or modify 4PLANET product state.
const IMMUTABLE_ORIGIN = 'https://supersapiens-capital-lab-n0etff.v2.appdeploy.ai';
const ALLOWED_HOSTS = new Set(['supersapien.org', 'www.supersapien.org']);

export default {
  async fetch(request) {
    const incoming = new URL(request.url);

    if (!ALLOWED_HOSTS.has(incoming.hostname)) {
      return new Response('Not found', { status: 404 });
    }

    if (incoming.pathname === '/__supersapien_release') {
      return new Response(JSON.stringify({ ok: true, release: 'mvp06', origin: 'capital-lab' }), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
    }

    if (incoming.hostname === 'www.supersapien.org') {
      incoming.hostname = 'supersapien.org';
      return Response.redirect(incoming.toString(), 308);
    }

    const upstreamUrl = new URL(IMMUTABLE_ORIGIN);
    upstreamUrl.pathname = incoming.pathname;
    upstreamUrl.search = incoming.search;

    const headers = new Headers(request.headers);
    for (const key of ['host', 'cf-connecting-ip', 'cf-ray', 'x-forwarded-for', 'x-forwarded-host']) {
      headers.delete(key);
    }
    headers.set('x-forwarded-host', 'supersapien.org');
    headers.set('x-forwarded-proto', 'https');

    const init = { method: request.method, headers, redirect: 'manual' };
    if (request.method !== 'GET' && request.method !== 'HEAD') init.body = request.body;

    const upstream = await fetch(new Request(upstreamUrl.toString(), init));
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-length');
    responseHeaders.delete('content-encoding');
    responseHeaders.set('x-supersapien-origin', 'capital-lab-mvp06');
    responseHeaders.set('x-content-type-options', 'nosniff');

    const location = responseHeaders.get('location');
    if (location) {
      const redirected = new URL(location, upstreamUrl);
      if (redirected.origin === new URL(IMMUTABLE_ORIGIN).origin) {
        redirected.protocol = 'https:';
        redirected.host = 'supersapien.org';
        responseHeaders.set('location', redirected.toString());
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  },
};
