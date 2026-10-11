# ATLAS MAX EXPOSURE ZERO-LOSS RELEASE — 11 OCT 2026

STATUS: TEST CANDIDATE ONLY.

Production baseline:
- review/atlas-v43-preview-20261008
- baseline SHA 6c01c2029810f18838243c839d1f55477792ea3a
- dedicated Cloudflare Pages project 4planet-atlas

Bounded delta:
- /places
- /place/*
- /place/*/map.svg
- /sitemap.xml
- /robots.txt
- canonical normalisation for Place routes only

Must not change:
- /
- /atlas
- /atlas/*
- map UI, camera, layers, search, NOW/WATCH, mobile UX, basemap, data/source interaction, visual hierarchy or v43 application assets.

Acceptance:
- 250 qualified Place pages
- 250 Place sitemap entries
- self-canonical server HTML + schema + source identity + ATLAS handoff
- unknown Place 404/noindex
- all non-discovery ATLAS routes pass through unchanged

Rollback:
- redeploy baseline SHA 6c01c2029810f18838243c839d1f55477792ea3a
