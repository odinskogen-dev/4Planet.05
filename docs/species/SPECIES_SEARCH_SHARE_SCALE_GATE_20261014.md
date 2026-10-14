# SPECIES 100 — Search, Share and Scaling Gate (14 October 2026)
**Authority:** Evidence-backed engineering QA note. Uses Claude's existing v53 page model, template, source registry and SpeciesCard. Does not create a new art or citation authority.

## Production proof and corrected critical defect
- 14 Oct LIVE browser audit: server prerender used `index,follow`, but React/Claude `<Seo>` restored `noindex,nofollow` on Home, Explore, groups, known profiles, About and Quiz.
- Bounded correction: host-aware robots in Claude's EXISTING components; `4species.com` known editorial pages indexable; `*.pages.dev`, labs and LIVE_ONLY unknown species remain noindex.
- Immutable Pages candidate: `https://72494005.4planet-05.pages.dev`; reconstruction/contract QA: [GitHub Actions #38556636385](https://github.com/odinskogen-dev/4Planet.05/actions/runs/38556636385); Chromium mapped-host QA (11 known pages indexable, preview noindex): [#38557396644](https://github.com/odinskogen-dev/4Planet.05/actions/runs/38557396644).
- Cloudflare public promotion with rollback + 21 article HTML/JSON route tests: [#38557799346](https://github.com/odinskogen-dev/4Planet.05/actions/runs/38557799346), PASS; IndexNow POST 22 URLs HTTP 200, which is NOT Google indexation.
- Additional independent live post-release browser regression: [GitHub Actions search audit](https://github.com/odinskogen-dev/4Planet.05/actions/workflows/species-search-embed-audit-20261014.yml) — use the actual run result; do not infer PASS from this document.

## Inventory and residual risks
- 39 species cards were observed on /explore in the October 12 browser test; all 39 now display a link sourced from Claude's existing `CatalogueItem.lineSource` (or a link to article Sources & limits). Photo credit is separate.
- The canonical v53 builder previously generated **28 prerendered species pages**; some catalogue-only curated entries therefore may not have equivalent complete, prerendered SEO pages. Do not assume all 39 cards have 39 independently indexable articles.
- Twenty new editorial pages are DRAFT, not REVIEWED. Original batch has 10–12 source references per page but exactly **one distinct external source document per page**. This is provenance syntax, not independent validation of every assertion.
- Current `og:image` is the generic `/og.png` on multiple popular animals (lion, tiger, giant panda, monarch butterfly); photo-backed articles have specific OG imagery.
- External Wikimedia photos occasionally fail during Chromium navigation, and image candidate matching sometimes chose captivity, wrong species, or weak crops. Hero corrections for wolf, polar bear, turtle, rhino and whale are not a substitute for 39-image editorial Gold QA.
- On 14 Oct live audit, public pages had `X-Frame-Options: SAMEORIGIN`. This is correct protection for the FULL article pages, but blocks other websites from iframe-embedding full pages. Do NOT remove it globally.
- Search Console connector now responds `payment_required`; current Google indexed counts and real search impressions remain **UNKNOWN**, not zero and not proven positive. Native free Google Search Console and Bing Webmaster Tools are the appropriate monitoring UI.
- `king/test` advanced independently after the source for this isolated Cloudflare release. Preserve current Worker, audit code divergence and reconcile into the existing production authority before mass publication. No parallel truth stores.

## Release gating: 100 high-interest species
**Decision:** GO to build/prepare a research-ranked backlog of 100; **NO-GO** to automatically publish 100 today as Google-ready Gold articles.

For every new page, require:
1. Exact validated `4PLANET_SPECIES_PAGE_01` data, common/scientific taxon and authority/date; use ONE shared Claude v53 template.
2. Unique English first-value job: identify, distinguish from lookalikes, where it actually lives, size/behaviour, threats/solution/action, source record limitations. No fabricated search rank or ephemeral SEO copy.
3. Claim-level references in the existing Claude `SourceRef` structure. At least two independent authoritative documents where appropriate, plus direct specialist source for disputed taxonomy and conservation numbers. Check each statement; DRAFT cannot become REVIEWED by passing schema tests.
4. Open-license image at file level, real wild animal (no zoo, cages, rehab/captive images), metadata with author/license/source URL, correct taxon and mobile/desktop focal crops. Use fallback glyph rather than misidentified photo. Rights approval for embeds and social redistributions separately.
5. Two render proofs: raw HTML and hydrated Chromium have indexable `robots` and identical self canonical on production, while test/dynamic-unknown/embeds remain noindex.
6. One item-specific good OG image or an explicitly approved text-only social preview, not generic `og.png`; title, description, image and alt correct. Validate social share parsers and image fetch.
7. XML sitemap includes only canonical publication-approved HTML routes, proper `lastmod` only on meaningful change, links reachable via `<a href>`, correct 200/404/redirect behaviour, structured data truthful (schema.org Taxon is **not** a guaranteed Google rich result).
8. No image failures, privacy/auth leaks, console errors, layout/crop regressions or unacceptable mobile performance. Run Playwright desktop/mobile, Core Web Vitals and image optimisation check; capture immutable version/rollback proof.
9. Observe actual discovery, impressions, indexing and activated visitors before the next bulk tranche. Submit sitemaps to Google natively and IndexNow to participating engines when content truly changes.

## Sharing and embeddable cards (reuse Claude, do not rebuild)
- The EXISTING premium SpeciesTemplate already uses `navigator.share` with clipboard fallback. Maintain it.
- Social card preview: individual `og:title`, `og:description`, item-specific `og:image` large enough for cards/Discover where rights allow; make one source-correct card per art.
- Website embedding: limited read-only route `/embed/<slug>` rendering the EXISTING `SpeciesCard`, its factual `lineSource`, separate image attribution and link to the full species profile. No duplicate page SEO: `noindex` and canonical full profile.
- Frame only this new bounded embed endpoint on HTTPS origins; keep article and auth/admin surfaces blocked by `X-Frame-Options`/CSP. No cookies, no cross-tenant data, no invented live range/population. Share copy code through the existing Share UI only after full browser and rights QA.
- SoMe generally uses OG link previews, **not** arbitrary iframes; a website embed and social sharing are separate delivery formats.
- First opt-in embed pilot: Orca and 4 Gold-reviewed species; not a blanket public embed of all 100 DRAFT pages.

## Recommended next sequenced closure
P0: finish and repeat hydrated indexability public QA plus Google native indexing report; reconcile release against king/test.
P1: 5 fully Gold exemplar pages (one predator, mammal, bird, marine animal, non-animal), rights-cleared responsive hero/crop and item OG image.
P1: measured first-user activation via search and return value; test internal linking, sitemap inventory parity and real query impressions.
P2: 100 researched DRAFT profiles in the same template; publish in validated cohorts as they pass independent Gold, not by arbitrary quota.
P2: opt-in sourced, photo-attributed /embed card route following rights/security audit.
