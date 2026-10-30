#!/usr/bin/env bash
# Local proof: run base (p1-nav) and candidate (p2-gsc) under Miniflare on the same paths and diff.
# Expected diffs only: 3 sitemap image:loc, trailing-slash 308s, /index.html 308, fallback-shell 404s (never a sitemap/sidecar page), ATLAS link on 3 Kenya species, >=3840px thumbs in /api/atlas-species.
set -euo pipefail
H=${HARNESS:?path to gsc-defects/_harness}; B=${CHAIN:?dir with ops/discovery/4species-router-p1-nav.js}
python3 ops/species57/p2-gsc-seo-20261030.py "$B/ops/discovery/4species-router-p1-nav.js" "$B/ops/discovery/4species-router-p2-gsc.js"
# Live sidecar (4species-premium-61-additive-20261028, 10 exact routes) is emulated in front of the router,
# so the 4 sidecar pages are served as on live. SIDECAR = template blob 9903fa5a, ORIGIN = its immutable preview.
S=${SIDECAR:?sidecar template}; O=${ORIGIN:-https://b0951128.4planet-05.pages.dev}; D=${OUT:-/tmp/p2}
node "$H/mfrun-sidecar.mjs" "$B/ops/discovery/4species-router-p1-nav.js" "$S" "$O" "$PATHS" "$D/local-base-sc"
node "$H/mfrun-sidecar.mjs" "$B/ops/discovery/4species-router-p2-gsc.js" "$S" "$O" "$PATHS" "$D/local-fix-sc"
python3 "$H/livefetch.py" 4species.com "$PATHS" "$D/live-now"
python3 "$H/control4species_sc.py" "$D" "$SITEMAP_PATHS"
cmp "$D/local-base-sc/bodies/GET__orca" "$D/local-fix-sc/bodies/GET__orca" && echo ORCA_BYTE_IDENTICAL
