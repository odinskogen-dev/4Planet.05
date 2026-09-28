// 4PLANET FRONTIER — canonical test path gateway source
// Cloudflare Worker: 4planet-test-path-gateway
// Route: test.4planet.org/*
// Unknown paths pass through to the existing 4PLANET test/control surface.

const FRONTIER_ORIGIN = 'https://life-os-canvas-6g481v.v2.appdeploy.ai/';

function projectShell(origin) {
  const safeOrigin = JSON.stringify(origin);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="robots" content="noindex,nofollow">
  <title>4PLANET FRONTIER</title>
  <style>
    html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff}
    body{position:fixed;inset:0}
    iframe{position:absolute;inset:0;display:block;width:100%;height:100%;border:0;background:#fff;overflow:hidden}
  </style>
</head>
<body>
  <iframe title="4PLANET FRONTIER" src=${safeOrigin} loading="eager" scrolling="no" allow="clipboard-read; clipboard-write; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === '/universalboard' || path.startsWith('/universalboard/')) {
      const suffix = path.slice('/universalboard'.length);
      const target = new URL('/frontier' + suffix, url.origin);
      target.search = url.search;
      return new Response(null, {
        status: 308,
        headers: {
          location: target.toString(),
          'cache-control': 'no-store',
          'x-4planet-frontier-gateway': 'legacy-redirect'
        }
      });
    }

    if (path === '/frontier' || path.startsWith('/frontier/')) {
      return new Response(projectShell(FRONTIER_ORIGIN), {
        headers: {
          'content-type': 'text/html; charset=UTF-8',
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex, nofollow',
          'x-4planet-frontier-gateway': 'frontier-v1'
        }
      });
    }

    return fetch(request);
  }
};
