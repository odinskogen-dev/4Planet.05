#!/usr/bin/env bash
# Local proof: run base (p1-nav) and candidate (p2-gsc) under Miniflare on the same paths and diff.
# Expected diffs only: 3 sitemap image:loc, trailing-slash 308s, fallback-shell 404s, ATLAS link on 3 Kenya species, >=3840px thumbs in /api/atlas-species.
set -euo pipefail
H=${HARNESS:?path to gsc-defects/_harness}; B=${CHAIN:?dir with ops/discovery/4species-router-p1-nav.js}
python3 ops/species57/p2-gsc-seo-20261030.py "$B/ops/discovery/4species-router-p1-nav.js" "$B/ops/discovery/4species-router-p2-gsc.js"
node "$H/mfrun.mjs" "$B/ops/discovery/4species-router-p1-nav.js" 4species.com "$PATHS" /tmp/p2-base
node "$H/mfrun.mjs" "$B/ops/discovery/4species-router-p2-gsc.js" 4species.com "$PATHS" /tmp/p2-after
python3 "$H/cmp4species.py" /tmp/p2-base /tmp/p2-after all
cmp /tmp/p2-base/bodies/GET__orca /tmp/p2-after/bodies/GET__orca && echo ORCA_BYTE_IDENTICAL
