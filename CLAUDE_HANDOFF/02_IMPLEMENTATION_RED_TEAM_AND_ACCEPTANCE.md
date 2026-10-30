# CLAUDE EXECUTION ORDER — SAFE PREMIUM IMPROVEMENT, NOT REPLACEMENT
**Prepared:** 2026-10-30. Audit signals below are source-based; runtime status needs verification.

## A. RED-TEAM PRIORITIES (ORDERED BY EXPECTED PUBLIC VALUE)
**P0 / protect**
1. Establish EXACT deploy provenance. Verify current Cloudflare Pages production project + branch + build SHA for 4planet.org. Compare to frozen source SHA and any newer commits. Never overwrite newer deployed work.
2. Capture before states (desktop 1440, mobile 390/430, real browser interactions): home, menu, `/now`, `/impact`, 5 project routes, 5 actor routes, `/species`, several profiles, ATLAS/map and context open/close, Living Systems, a Mission, Magazine. Preserve evidence and URLs.
3. Verify historical publishing non-regression: do not remove public SPECIES pages, IMPACT projects, 4PLANET landing pages or ATLAS content. Record all canonical routes and compare before/after. Backup and rollback must be reproducible.
4. Fix actual runtime failures / source failure-as-empty / mobile map locks / broken navigation before cosmetic reworking.
5. Keep production secrets only in secure runtime environments; do not log, include, echo or hardcode credentials.

**P1 / IMPACT crawlability and architecture**
6. The frozen **git** `src/data/impactDiscovery.json` is dated 2026-10-14 and contains only **four** project route seeds. `functions/impact-public-routes.generated.js` therefore lists only four projects/four actors/three issues, while read-only verified NATUREBRAIN **public.impact_lan_v02()** at 2026-10-30T21:32Z contained **65 projects, 62 actors, 66 issues, 37 solutions, 55 places, 67 actions**. This is a concrete source-to-crawlable-build disparity. Determine the last deployed build's snapshot (it may differ), build environment settings and Cloudflare routing. Bring runtime, metadata, prerender, sitemap and canonical routes into agreement through the EXISTING `scripts/impact-graph-snapshot.mjs`, `scripts/generate-impact-public-routes.mjs`, `scripts/prerender-impact-seo.mjs` and middleware. Avoid adding a parallel project content store.
7. Confirm NATUREBRAIN snapshots are fresh on deployment, handle unavailable upstream without replacing good cached data with empty, and ensure no old static four-project allowlist returns 404 for valid current profiles.
8. Each profile should contain unique source-backed descriptive copy, exact source links and dates, correct actor/project connections and non-misleading proof language. Tests: direct URL, reload, share, crawler HTML, canonical and JSON-LD.
9. Make `/impact` a premium discovery experience: search, useful context filters, image/rights, project and actor profiles, connections, action routes and progressively available technical proof.
10. Protect project/media rights, source reviews, partner non-endorsement, and status semantics; source-reported numbers are not independent outcome verification.

**P1 / product quality**
11. Review home and shared header/menu against real iPhone user comprehension; fix stray glyphs such as 'n/n/n' above logo if reproduced. Preserve strongest homepage photographic/editorial baseline.
12. Make Earth Now (`/now`) understandable to a nontechnical human. Incident categories and concise filters, time/source/freshness, map, route reliability, open/back behaviours; no raw feed/dense record wall.
13. ATLAS must survive repeated select/open/close/pan/zoom on iPhone without camera drift or interaction lock. Product Context must restore canonical object, layer, centre, zoom after loaded camera settles.
14. Audit SPECIES published count against source/published URL list, zero-loss exports and index coverage. Avoid equating target 100 or previously reported 57 with currently verified count.
15. Verify mobile nav, focus, accessible dialogs, tap areas, typography, colour contrast, no clipping/overflow, image crops, WebGL fallback and reduced-motion behaviour.
16. Finish cross-product useful journeys and discoverability; no dead CTAs or false in-development maturity.
17. Improve SEO/AI Discovery: sitemap fidelity, duplicate/canonical collisions, redirect/404 hygiene, source-bearing HTML prerender and JSON-LD, internal links, OG previews, helpful original descriptions, crawl budget and stable slugs.
18. Profile performance: critical image loading, layout shift, LCP, JS size, map cold-start, cascading source calls; avoid adding dependencies without a measurable reason.

## B. STRICT PRESERVATION / NON-REGRESSION
- DO NOT delete or replace `src/impact/livingActionNetworkGraph.ts`, live NATUREBRAIN publication gates, approved `src/impact/ui` templates, source IDs/actor edges or proof states with hardcoded demos.
- DO NOT replace MapLibre or introduce a second map camera owner.
- DO NOT replace approved original photos with generic unlicensed stock; retain public assets and exact rights.
- DO NOT overwrite recent SPECIES 61/100-profile work or live profiles through a stale `src/data/species.ts` array. Inventory production state before editing.
- DO NOT rewrite the entire existing front page or convert it into boxed cards or a fundraising landing page.
- DO NOT confuse `/impact` with the separate `/impact/lab` test environment.
- DO NOT collapse contribution, partner statements, completed delivery, independent verification and system impact into a single 'verified' badge.
- DO NOT invent active 4PLANET partner or project ownership from listing an external organisation.
- DO NOT change main, DNS, production deployment or live database in this implementation preview without explicit separate founder authorisation.
- DO NOT use current sources as licence to silently rename the Founder-approved programme; preserve accepted work, note disagreements and request founder decision for true policy change.

## C. END-TO-END ACCEPTANCE JOURNEYS (SHOW, NOT JUST DESCRIBE)
1. A stranger lands at home and understands the product family in five seconds; opens `/impact`, filters an ecological problem, finds a source-backed project and its actor, opens the official actor/project site, then returns to 4PLANET without losing context.
2. Direct link to a project included in the 30 October NATUREBRAIN public snapshot opens in browser, exists in static crawler HTML, sitemap and canonical metadata, and links to correct issues, method, actor and evidence. Run for every advertised public project.
3. From a species profile a user opens ATLAS, selects observation/context, closes, pans/zooms, follows a related issue or project, refreshes and returns. No wrong source identity, false LIVE semantics or focus/gesture lock.
4. From Earth Now, find one correctly dated event in a chosen category, see what source actually asserts, move to its location and share a stable URL.
5. From an indexed article or Mission page, traverse to a relevant place/species/issue/actor and back, with search-ready content and human-scale copy.
6. At 390 and 430px, the same product tasks work by touch, keyboard where applicable and screen reader semantics. Test repeated drawer/map gestures, not only screenshots.
7. Simulate source outage: preserve app usability and explicitly say unavailable/stale rather than reporting zero events or deleting objects.
8. Restore previous mainline and route list from known clean commit in preview; no destructive migration needed.

## D. DEFINITION OF PREMIUM DONE
- Homepage: comprehensible in 5 seconds, calm/beautiful, simple navigation.
- IMPACT: canonical public records truly accessible, dated sourced claims, useful browsing and profiles, zero phantom 404 routes for advertised objects.
- ATLAS: reliable real interaction on mobile and desktop; correct source and camera context.
- SPECIES: indexed premium profiles with verified identities, rights, provenance and zero regression.
- Cross-product design: one typography rhythm, spacing system and coherent components, not fragmented microsites.
- SEO: accurate sitemap, metadata, crawlable HTML, no duplicate canonical, valid OG and useful internal graph.
- QA: screenshots/video + test outcomes + branch SHA + changed files + known remaining issues.
- Ops: safe preview, no cost creep, no credentials, no main merge / live change.
Every completed claim must carry reproducible proof; mark other items PARTIAL/BLOCKED/UNVERIFIED.

## E. DELIVERABLE FORMAT TO FOUNDER
A 1-page founder summary first: what visitors can now do, what improved, exact preview link and SHA, which canonical route counts are verified, before/after images and any regressions. Keep deep logs in repository. Provide ranked next actions only for concrete outstanding defects. Founder reviews and authorises promotion separately.

## F. AUTHORITIES / REFERENCE
Existing August reference briefs are historical donor specifications, not automatically the latest October live truth: PRD-ONE-02, PRD-PROTOTYPE-01, Premium Platform v2.0, AUDIT-PROTOTYPE-01. Current source and public NATUREBRAIN projection override stale assertions about implemented features. Founder intent overrides undocumented design drift. All source/media/partner/impact claims require current evidence.
