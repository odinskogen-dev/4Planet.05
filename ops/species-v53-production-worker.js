// SPECIES v53 canonical production Worker — full static build, not the Orca preview.
// Cloudflare Worker name: 4species-router, preserving the existing 4species.com route.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (url.hostname === 'www.4species.com') {
      return Response.redirect('https://4species.com' + pathname + url.search, 301);
    }
    if (pathname === '/atlas' || pathname.startsWith('/atlas/')) {
      return Response.redirect('https://4planetatlas.com/' + url.search, 302);
    }
    if (pathname === '/species' || pathname === '/species/') {
      return Response.redirect('https://4species.com/explore' + url.search, 301);
    }
    if (pathname.startsWith('/species/')) {
      const slug = pathname.slice('/species/'.length).replace(/\/$/, '');
      if (slug && !slug.includes('/') && /^[a-z0-9-]+$/.test(slug)) {
        return Response.redirect('https://4species.com/' + slug + url.search, 301);
      }
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.delete('set-cookie');
    headers.set('x-content-type-options', 'nosniff');
    // Species editorial source profiles are DRAFT. No SEO indexing
    // until a separately audited human-approved source/photo release.
    headers.set('x-robots-tag', 'noindex');
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status, statusText: response.statusText, headers
    });
  }
};