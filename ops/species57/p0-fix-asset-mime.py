#!/usr/bin/env python3
"""Bounded hotfix to existing P1 SEO Worker. No profile, JSON, image, or HTML changes."""
from pathlib import Path
import sys
if len(sys.argv)!=3:raise SystemExit("usage: patch input.js output.js")
inp=Path(sys.argv[1]);out=Path(sys.argv[2]);s=inp.read_text()
needle='''  // Do not regress old hash-named image/JS assets; fallback to new build only on genuine 404.
  if (upstream.status===404 && incoming.pathname.startsWith("/assets/") && target.origin===SPECIES_V53_ORIGIN)
    upstream=await fetch(new URL(incoming.pathname+incoming.search,SPECIES_V1_ORIGIN),{method:request.method,headers,redirect:"follow"});
'''
assert s.count(needle)==1,"Immutable routing anchor has moved; do not release"
replacement='''  // Hotfix: Pages SPA returns 200 text/html when an unknown hashed JS bundle
  // does not exist, so status-only fallback breaks all 18 new React profiles.
  // The old39 origin ALWAYS takes precedence when it returns the correct MIME.
  const pathname = incoming.pathname;
  const isHashedModule = /^\\/assets\\/[A-Za-z0-9_-]+\\.((?:m?js)|css)$/.test(pathname);
  const expectedAssetMime = pathname.endsWith(".css") ? "text/css" : "javascript";
  const upstreamMime=(upstream.headers.get("content-type") || "").toLowerCase();
  const correctAssetMime=pathname.endsWith(".css")
    ? upstreamMime.includes("text/css")
    : (upstreamMime.includes("javascript") || upstreamMime.includes("ecmascript"));
  const badAsset = isHashedModule && (!upstream.ok || !correctAssetMime);
  if ((upstream.status===404 && pathname.startsWith("/assets/")) || badAsset) {
    // Explicit fallback to the immutable new18 build, NEVER to unvetted new43.
    // Do not mistake an SPA HTML response for a real module, even with HTTP 200.
    const alternative=await fetch(
      new URL(pathname+incoming.search,SPECIES_V1_ORIGIN),
      {method:request.method,headers,redirect:"follow"}
    );
    const alternativeMime=(alternative.headers.get("content-type")||"").toLowerCase();
    const validAlternative=pathname.endsWith(".css")
      ? alternativeMime.includes("text/css")
      : (alternativeMime.includes("javascript")||alternativeMime.includes("ecmascript"));
    if(isHashedModule && (!alternative.ok || !validAlternative)) {
      return new Response("Asset not found",{status:404,headers:{
        "content-type":"text/plain; charset=utf-8",
        "x-robots-tag":"noindex, nofollow",
        "cache-control":"no-store",
        "x-4species-asset-gate":"neither-immutable-origin-has-correct-asset-mime"
      }});
    }
    if(alternative.ok || upstream.status===404) upstream=alternative;
  }
  // Reject broken asset MIME even if an upstream mistakenly responds HTTP 200.
  if(isHashedModule) {
    const resolvedMime=(upstream.headers.get("content-type")||"").toLowerCase();
    const good=pathname.endsWith(".css")
      ? resolvedMime.includes("text/css")
      : (resolvedMime.includes("javascript")||resolvedMime.includes("ecmascript"));
    if(!upstream.ok || !good) return new Response("Invalid asset MIME",
      {status:502,headers:{"content-type":"text/plain; charset=utf-8","x-robots-tag":"noindex, nofollow","cache-control":"no-store"}});
  }
'''
s=s.replace(needle,replacement,1)
assert s.count("const SPECIES_V53_ORIGIN")==1
assert s.count("const SPECIES_V1_ORIGIN")==1
assert s.count("async function proxySpeciesV53")==1
assert "publicSpeciesDirectoryCatalog" in s
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(s)
print("P0_BOUNDED_MIME_FALLBACK_GENERATED",str(out),"sources: old39 takes precedence / new18 fallback only on invalid hash asset MIME")
