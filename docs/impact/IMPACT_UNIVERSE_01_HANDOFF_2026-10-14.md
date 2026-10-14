# IMPACT UNIVERSE 01 — HANDOFF FOR GPT / AXE — 14 OCT 2026

**STATUS: OUTPUT RECEIVED / AWAITING GPT AUDIT.** Maker evidence only. Not Founder-accepted, not independently verified, not merged, not LIVE.

| Field | Value |
|---|---|
| Product / task | IMPACT — Living Action Network — Premium Universe Build 01 |
| Authority | Founder brief `docs/impact/IMPACT_LIVING_ACTION_NETWORK_MASTER_BUILD_BRIEF_2026-10-14.md` |
| Four-state | LIVE `4planet.org/impact` (unchanged) · HEIR `king/test@7a0989f` · SANDBOX `claude/impact-universe-01` (registered in `PRODUCT_SURFACE_REGISTRY.json`) · ARCHIVED none touched |
| Product version | IMPACT UNIVERSE 01 (`CODE_LINEAGE_REGISTER.md`) |
| Exact SHA | `63526e3557caeb1dffe7ebdba175f4863e8ae2e6` |
| Sandbox URL | https://claude-impact-universe-01.4planet-05.pages.dev/impact (noindex host) |
| PR | #469 → `king/test` (do not merge before Founder review + independent Gold) |
| Rollback | close/revert PR #469; v01 projection untouched; drop `impact_lan_v02()` via `supabase/rollback/20261014200000_…down.sql` if applied |

## 1. What was built

One template system over one graph read, so every new NATUREBRAIN object renders without redesign.

- **Graph contract** — `src/impact/livingActionNetworkGraph.ts` normalises `impact_lan_v02()` or `impact_lan_gold_v01()` into one model (projects, issues, actors, places, solutions, actions; selectors; graph-wide search). `src/impact/livingActionNetworkClient.ts` reads PostgREST directly with the public key: **v02 → v01 fallback**. No frontend truth.
- **Templates** (`src/impact/ui/*`) inside the existing `PublicShell` (menu, 4PLANET ID sign-in, footer):
  - **Home** `/impact` — documentary hero + graph search; dense project index (2 cols ≤700px, 3 ≤1100, 4, 5 ≥1680) with issue filters; issues, organisations, methods as ruled lists; shared ATLAS; review method (#method).
  - **Issue** `/impact/issue/:slug` (new) — problem, projects, organisations, methods, places, known/not established, take part, sources.
  - **Project** `/impact/project/:slug` (canonical URL kept) — hero, on-page nav, at-a-glance, why, what (reported vs stated ambition), proof ladder + claims + "what this record does not establish", ATLAS, who, method, outcomes/capital only when published, act, source table, related.
  - **Actor** `/impact/actors/:slug` (kept) — what/where/relationship, projects, places, issues, evidence, official routes, correction route (mailto, no claim workflow).
  - **Solution** `/impact/solution/:slug` (new, **noindex**, limited) — skeleton grammar until solution-level data exists.
  - Honest states: loading · source unavailable (≠ zero) · not in published graph (no silent redirect).
- **SEO / AI** — per-entity JSON-LD (`src/impact/seo.ts`); build-time snapshot `scripts/impact-graph-snapshot.mjs` fetches **live NATUREBRAIN on Cloudflare builds** (fail-soft to committed snapshot); `scripts/prerender-impact-seo.mjs` prerenders home/project/actor/issue with claims, sources and truth boundaries; sitemap includes projects, actors, issues. `dist/impact-build.json` exposes exact build identity.
- **Analytics** — `impact_discovery_view, impact_issue_filter, impact_search (term/result counts only), impact_project_open/view, impact_actor_open/view, impact_issue_open/view, impact_solution_open/view, impact_source_open, impact_atlas_open, impact_external_action, related_project_open, magazine_open, impact_save, impact_actor_correction_open`.
- **Save** — existing local-first `follow` store (device only); `EntityType` gained `PROJECT | ACTOR | ISSUE`.

## 2. NATUREBRAIN — AXE action required

`supabase/migrations/20261014200000_impact_living_action_network_v02_projection.sql` — **additive, read-only, NOT applied**. Verified in an in-memory Postgres harness (`scripts/impact-projection-harness.mjs`) against the real v01 seed. Until applied, the live site uses v01 (proven: sandbox build reported `impact_lan_v02: HTTP 404 → impact_lan_gold_v01 · projects=4`).

### Publishing a new object (the primary success path)
1. Write the canonical entity rows as today (sources → datasets → source_records → entities/actors/solutions → claims → evidence → claim_evidence → relationships).
2. Set `provenance.impact_publication = 'public'` on the project (and on any issue/actor you want listed even without projects). Set it only after the Gold admission gate.
3. Edges read by the templates: `addresses_problem`, `occurs_in`, `has_lead_actor`, `has_delivery_actor` / `has_implementing_actor` / `has_supporting_actor` / `reviewed_by`, `uses_solution`, `offers_external_action`; solution → issue `addresses_problem`. Unknown actor predicates still render, humanised.
4. Optional public provenance keys (allow-list in the SQL): `slug, summary, domain (OCE4N_/E4RTH_/S4PIENS_/4CULTURE_), review_state, external_review{institution,programme,what_reviewed,url}, project_type, status_label, operating_period, method_summary, delivery_model, reported_scale[{label,value,claim_id}], stated_ambition[...], outcomes[...], capital_needs[{type,status,description}], not_established[], why_it_matters, unknowns[], image_path, image_role ('project_media' + image_licence only when rights are recorded), image_alt, image_credit, image_licence, official_url, website, atlas_place_id, coverage_note, reference_point{lng,lat,zoom,precision}, maturity, mechanism, applicability[], risks[], magazine[{title,slug}], problem_map_id, last_reviewed`.
5. Result: runtime pages appear immediately; prerender + sitemap on the next Pages build.

Dry-run any seed before Supabase: `npm i --no-save @electric-sql/pglite && node scripts/impact-projection-harness.mjs your-seed.sql`.

## 3. Evidence (maker)

- `typecheck` PASS · `lint` 0 errors (5 pre-existing warnings) · `test:smoke` 418/418 · `npm run build` PASS · product-authority / elite-doctrine / gold-policy PASS · `assets:verify` PASS.
- Local fixture browser proofs: 26/26 (desktop-1440 + mobile-390), incl. **AXE new-project success test**, v01 fallback, unavailable ≠ zero, not-found, graph search, keyboard/focus, overflow + one-h1 at 390/430/768/1024/1440/1920.
- Deployed exact-SHA proof (`impact-universe-sandbox-proof.yml`, run on `63526e3`): build SHA matched; Gold continuity spec against **live NATUREBRAIN** + Universe spec on the deployed build: **11/11, 0 unexpected**; all routes 0px overflow at 390 and 1440; evidence posted on PR #469.
- Pre-existing unrelated failures on king/test too: `cloudflare-workers-audit.yml`, `tree-of-life-convergence.yml`.

## 4. Truth boundaries kept
Listing ≠ endorsement · actor ≠ partner · UN flagship ≠ 4PLANET verification · source-reported ≠ verified · target ≠ delivery · delivery ≠ outcome · issue visuals labelled "not project photography" · 4PLANET REVIEWED and PARTNER reserved · no 4PLANET transaction (external routes only) · no match ≠ no project.

## 5. Open items / limits (not hidden)
1. **AXE**: apply v02 (or decide not to); then remove nothing — v01 stays as fallback.
2. **AXE**: canonical ~63-problem Issue map not reconstructed by Claude; import into NATUREBRAIN as `problem` entities with stable ids + `impact_publication='public'` and the Issue template renders them (zero-project issues say so honestly).
3. No rights-cleared project photography exists; every image is an existing site issue visual, labelled. Project media slots are ready (`image_role='project_media'` + licence).
4. `/actors` (ORCA partner-actor product) and `/impact/actors` (NATUREBRAIN public-record actors) are two surfaces; convergence decision belongs to GPT/AXE.
5. Brand OS leaves IMPACT accent unspecified → masterbrand blue on White; Domain colour only as a marker; blue never on Black (OCE4N exception only).
6. Hero image kept as the previously live IMPACT hero (`/assets/missions/rewild/hero.jpg`); Founder may prefer a more living subject.
7. Independent Gold (Maker ≠ Judge), Founder visual review, real-user evidence: pending.

## 6. Next safe action
Founder reviews the sandbox on mobile → GPT audit → independent Gold → AXE applies v02 + begins Gold 20 by data → merge PR #469 into `king/test` (exact-SHA TEST proof re-runs) → LIVE only by explicit Founder release.

**BRAIN writeback targets:** 01_ PROJECT LEAD CURRENT (IMPACT sandbox registered, SHA, PR), Atomic Register, CODE_LINEAGE (done in repo). Readback pending AXE.
