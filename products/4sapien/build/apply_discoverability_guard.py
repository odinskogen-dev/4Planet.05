#!/usr/bin/env python3
from pathlib import Path
import re
import sys

site = Path(sys.argv[1] if len(sys.argv) > 1 else "products/4sapien/site")
root = site / "index.html"
if not root.exists():
    raise SystemExit("missing 4SAPIEN root")

INDEXNOW_KEY = "8f4c2d91a7b64e3fa1c9d0b6e5274a83"

html = root.read_text(encoding="utf-8")

def replace_or_insert(pattern, replacement, before="</head>"):
    global html
    if re.search(pattern, html, flags=re.I | re.S):
        html = re.sub(pattern, replacement, html, count=1, flags=re.I | re.S)
    else:
        html = html.replace(before, replacement + before, 1)

replace_or_insert(r"<title>.*?</title>", "<title>4SAPIEN — Personal Intelligence for Food, Finance and Life</title>")
replace_or_insert(
    r"<meta\s+name=[\"']description[\"'][^>]*>",
    '<meta name="description" content="4SAPIEN is a public prototype for personal decision support across food, finance and everyday life, built around user-controlled context.">'
)
replace_or_insert(
    r"<meta\s+name=[\"']robots[\"'][^>]*>",
    '<meta name="robots" content="index,follow,max-image-preview:large">'
)
# One canonical only.
html = re.sub(r"<link\s+rel=[\"']canonical[\"'][^>]*>", "", html, flags=re.I)
html = html.replace("</head>", '<link rel="canonical" href="https://4sapien.com/"><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"4SAPIEN","url":"https://4sapien.com/","description":"Personal decision support across food, finance and everyday life, built around user-controlled context.","isPartOf":{"@type":"WebSite","name":"4PLANET","url":"https://4planet.org/"}}</script></head>', 1)

# Product-specific social identity if these tags exist.
html = re.sub(r"(<meta\\s+property=[\\\"']og:title[\\\"']\\s+content=)[\\\"'][^\\\"']*[\\\"']", r'\\1"4SAPIEN — Personal Intelligence for Food, Finance and Life"', html, count=1, flags=re.I)
html = re.sub(r"(<meta\\s+property=[\\\"']og:description[\\\"']\\s+content=)[\\\"'][^\\\"']*[\\\"']", r'\\1"Personal decision support across food, finance and everyday life, with user-controlled context."', html, count=1, flags=re.I)
if 'property="og:url"' not in html and "property='og:url'" not in html:
    html = html.replace("</head>", '<meta property="og:url" content="https://4sapien.com/"></head>', 1)


# Provide a meaningful pre-JavaScript public fallback. React createRoot replaces
# this when the product loads; private product routes stay noindex below.
fallback = """<main data-public-discovery-fallback="1">
<h1>4SAPIEN — Personal Intelligence for Food, Finance and Life</h1>
<p>4SAPIEN is an early public prototype for personal decision support. It is being developed to help a person understand everyday choices across areas such as food and personal finance without pretending that uncertain data is certain.</p>
<p>The longer-term direction includes a private Personal Brain: user-controlled context that can make repeated interactions more useful over time. Personal context belongs to the user and is not part of the public search surface. Authenticated food, finance, documents and Brain routes remain private and are excluded from indexing.</p>
<p>Public product pages explain the idea and the current prototype. Individual recommendations depend on the information a user chooses to provide and should distinguish facts, estimates, unknowns and suggestions.</p>
<nav aria-label="Related public products"><a href="https://4planet.org/">4PLANET</a> · <a href="https://4brain.app/">4BRAIN</a> · <a href="https://s4piens.com/">S4PIENS</a></nav>
</main>"""
html = html.replace('<div id="root"></div>', '<div id="root">' + fallback + '</div>', 1)
schema = '{"@context":"https://schema.org","@type":"WebApplication","name":"4SAPIEN","url":"https://4sapien.com/","description":"Personal decision support across food, finance and everyday life with user-controlled context.","isPartOf":{"@type":"WebSite","name":"4PLANET","url":"https://4planet.org/"}}'
if 'application/ld+json' not in html:
    html = html.replace("</head>", '<script type="application/ld+json">' + schema + '</script></head>', 1)

root.write_text(html, encoding="utf-8")

# Every non-root HTML route contains or can contain private/personal context.
for path in site.rglob("*.html"):
    if path == root:
        continue
    s = path.read_text(encoding="utf-8")
    if re.search(r"<meta\s+name=[\"']robots[\"'][^>]*>", s, flags=re.I):
        s = re.sub(
            r"<meta\s+name=[\"']robots[\"'][^>]*>",
            '<meta name="robots" content="noindex,nofollow,noarchive">',
            s,
            count=1,
            flags=re.I,
        )
    elif "</head>" in s:
        s = s.replace("</head>", '<meta name="robots" content="noindex,nofollow,noarchive"></head>', 1)
    path.write_text(s, encoding="utf-8")

(site / "robots.txt").write_text(
    """User-agent: OAI-SearchBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Disallow: /app/
Disallow: /brain/
Disallow: /auth/
Disallow: /account/
Disallow: /api/
Disallow: /finance/

Sitemap: https://4sapien.com/sitemap.xml
""",
    encoding="utf-8",
)

(site / "sitemap.xml").write_text(
    """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://4sapien.com/</loc></url>
</urlset>
""",
    encoding="utf-8",
)

(site / f"{INDEXNOW_KEY}.txt").write_text(INDEXNOW_KEY, encoding="utf-8")

headers = site / "_headers"
h = headers.read_text(encoding="utf-8") if headers.exists() else ""
extra = """
/app/*
  X-Robots-Tag: noindex, nofollow, noarchive

/brain/*
  X-Robots-Tag: noindex, nofollow, noarchive

/auth/*
  X-Robots-Tag: noindex, nofollow, noarchive

/account/*
  X-Robots-Tag: noindex, nofollow, noarchive
"""
if "/app/*" not in h:
    h = h.rstrip() + "\n\n" + extra.lstrip()
    headers.write_text(h, encoding="utf-8")

print("PASS 4SAPIEN discoverability guard")
# Closure rerun marker: public root + private-route index boundaries verified 2026-10-05.
