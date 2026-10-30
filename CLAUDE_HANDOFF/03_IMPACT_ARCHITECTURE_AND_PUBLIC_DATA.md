# IMPACT — VERIFIED CODE AND PUBLIC PROJECTION HANDOFF (30 OCT 2026)

## PRIMARY DESIGN INTENT
IMPACT is the **Living Action Network**: the open, searchable, source-grounded bridge
PROBLEM / ISSUE → PLACE → ACTOR → PROJECT → SOLUTION → EVIDENCE → ACTION.
It is an intelligence and discovery network of existing real-world work, not a claim that every listed project belongs to 4PLANET, is fundable through 4PLANET or has independently verified positive ecological outcomes.

## SOURCE CODE START POINTS
- `src/routes/router.tsx` — route registration.
- `src/pages/integrated/ImpactLivingActionNetwork.tsx` — binds routes to templates.
- `src/impact/ui/HomeTemplate.tsx` — IMPACT discovery entry.
- `src/impact/ui/ProjectTemplate.tsx` — project detail.
- `src/impact/ui/ActorTemplate.tsx` — actor detail.
- `src/impact/ui/IssueTemplate.tsx` — issue.
- `src/impact/ui/SolutionTemplate.tsx` — solution/method.
- `src/impact/ui/primitives.tsx` and `src/styles/impact-living-action-network.css` — visual components/design.
- `src/impact/livingActionNetworkClient.ts` — live public projection REST reader with v02 to gold-v01 fallback.
- `src/impact/livingActionNetworkGraph.ts` — normalised shared read-only graph/index and canonical slug mapping.
- `src/impact/reviewModel.ts`, `src/impact/proofPassport.ts`, `src/impact/actionLifecycle.ts` — evidence distinctions and action/proof semantics.
- `supabase/migrations/20261013205121_impact_living_action_network_gold_v01.sql` and `20261014200000_impact_living_action_network_v02_projection.sql` — relevant stored contracts.
- `src/data/impactDiscovery.json` — OLD COMMITTED CRAWLER SNAPSHOT, not canonical data.
- `scripts/impact-graph-snapshot.mjs` — regenerates build snapshot from canonical public projection; production condition may be `CF_PAGES=1` or `IMPACT_SNAPSHOT_LIVE=1`.
- `scripts/generate-impact-public-routes.mjs` — static route allowlist generated from snapshot.
- `functions/impact-public-routes.generated.js`, `functions/_middleware.js` — Cloudflare routing and crawlability.
- `scripts/prerender-impact-seo.mjs`, `scripts/prerender-discovery-seo.mjs`, `scripts/generate-sitemap.mjs` — metadata, HTML, indexability.
- `tests/fixtures/impact/`, `scripts/impact-*-contract.test.mjs` — regression scaffolding.

## EXACT ROUTE GRAMMAR
`/impact/`
`/impact/project/<slug>/`
`/impact/actors/<slug>/`
`/impact/issue/<slug>/`
`/impact/solution/<slug>/`
`/impact/lab/` — TEST ONLY, not public delivery/partner truth.
Other existing bounded action or legacy routes must be inventoried, not blindly removed.

## VERIFIED PUBLIC DB READ (not browser proof)
Connected project: Supabase `4Planet_ OS` / project `ghvdzetmplqkdtfqiror`.
Read-only SQL: `select public.impact_lan_v02();`
DB function response generated timestamp: `2026-10-30T21:32:44.405105+00:00`.
Snapshot row counts from the public projection:
- 65 projects
- 62 actors
- 66 issues
- 37 solutions
- 55 places
- 67 actions
These are PUBLIC PROJECTION records; they do **NOT** establish an equal count of working public HTTP routes, independently verified programmes, secured partnerships, donations, or actual delivered improvements.

Recent dated Git doc: `docs/IMPACT_NATUREBRAIN_PUBLICATION_BATCH10_2026-10-30.md` states 10 new source-checked project and actor additions to earlier 55/52 baseline and explicitly requires independent route readiness checks. Preserve that qualification.

## IMPORTANT DISCOVERABILITY GAP TO REPRODUCE
At frozen main SHA:
- `src/data/impactDiscovery.json` was generated 2026-10-14, and lists four projects.
- `functions/impact-public-routes.generated.js` listed 4 projects + 4 actors + 3 issues + 0 solution slugs.
- The 30 October read-only public NATUREBRAIN projection contains 65 public project records.
The code's expected regeneration path exists, but a source export alone does not prove that the current deployment updated crawler HTML, middleware allowlists, sitemaps and canonical routes. This is a priority for exact production build/diff tests and repair. Do not solve by hardcoding 65 strings or fabricating static project data.

## DATA SNAPSHOT INCLUDED
`CLAUDE_HANDOFF/data/` contains a date-stamped, **public-API projection** broken into datasets for safe handoff. It is a development/reference snapshot, NOT a replacement for live NATUREBRAIN.
- preserve IDs, relationships, claims, provenance, review and interpretation states;
- do not promote source-reported outcomes to independently verified results;
- do not infer partnerships, consent, funded status or permission to use external images;
- compare fresh runtime response against this snapshot by public ID.
The production source remains the canonical public function and any protected underlying tables stay in the project. Nothing confidential was exported.

## PUBLIC PROOF / CLAIMS CONTRACT
Actor existence ≠ partnership.
A project listed ≠ 4PLANET delivery.
Source-checked ≠ independently verified.
Funding/participation ≠ physical delivery.
Delivery ≠ ecological outcome.
Outcome ≠ aggregate system impact.
A third-party photo ≠ permission to display or claim project evidence.
If incomplete: display the correct honest source/rights/unavailable state.

## WHAT PREMIUM SHOULD MEAN HERE
First viewport: a genuinely attractive documentary hero, a powerful clear question, immediately useful search and category filters. Small number of meaningful featured paths; not generic NGO fundraising widgets.
Index: real visible breadth, filters by issue / geography / actor / approach / source, compact and informative profile previews, graceful empty/loading states.
Project: one beautiful human introduction; place, responsible actor and its actual role, described method, sources and dates, relevant other projects and independent limits, direct official route.
Actor: what it does, where, verified public project relationships, source transparency; do not portray external actor as a contracted 4PLANET partner.
Issue: explanation and scale only with verified evidence; connected work and methods; follow/shareable canonical.
Solution: why it might work, limitations, relevant project records and necessary evidence.
Relationship to ATLAS: a place-aware, context-retaining map link, not a second spatial truth model.
Cross-site distribution: precise H1, canonical URL, structured data, OG image, internal links and consistent indexing.
Privacy, rights, independent verification and anti-greenwashing boundaries must remain readable without dominating the human experience.
