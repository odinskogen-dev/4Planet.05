// Isolated SPECIES v53 origin. No 4PLANET production routes are changed
// until the independent origin is verified.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/species/')) {
      const tail = url.pathname.slice('/species/'.length).replace(/\/$/, '');
      if (tail && !tail.includes('/')) {
        return Response.redirect(url.origin + '/' + encodeURIComponent(tail) + url.search, 301);
      }
      return Response.redirect(url.origin + '/explore', 301);
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    // Source documents are DRAFT. Never enable indexing by deploying UI.
    headers.set('x-robots-tag', 'noindex');
    headers.set('x-content-type-options', 'nosniff');
    headers.delete('set-cookie');
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status, statusText: response.statusText, headers
    });
  }
};