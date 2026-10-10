# ATLAS — WH4LES ITEM TRUTH + OPEN-RIGHTS GATE — 10 OCT 2026

**STATUS:** BOUNDED HEIR INTEGRATION CORRECTION / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person opens one WH4LES point and needs to know when and how precisely the occurrence was recorded, which dataset supplied it, and under what licence it may be reused.

**ONE THING TO UNDERSTAND:** An OBIS occurrence point is admissible only through the governed adapter and only when its per-record rights are explicitly open.

**PRIMARY ACTION:** Replace the direct browser-to-OBIS query with the existing `/api/obis` bridge and render event date, coordinate uncertainty, dataset, licence, occurrence identifier and OBIS source per point.

**SECONDARY DEPTH:** Preserve valid equator/prime-meridian coordinates by testing finiteness instead of truthiness; fail closed on unknown, non-commercial or no-derivatives rights.

**P1 DOMINANT:** WH4LES accepts only `OPEN_CC0` or `OPEN_ATTRIBUTION` records from the governed bridge.

**P2 ORIENTATION:** Latitude or longitude `0` remains a valid occurrence coordinate.

**P3 ACTION:** Every admitted point exposes date, uncertainty, dataset, licence, record identifier when supplied, and provider source.

**P4 DEPTH:** This bounded correction does not prove upstream availability, completeness, taxonomic correctness, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Direct public OBIS fetches, truthy coordinate filters and rights-blind point popups.

**WHAT MUST BE REUSED:** Existing `/api/obis` adapter, issue #244 receiver, ATLAS point renderer, source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** Records remain occurrence evidence, not abundance, range, population trend or live position. Missing point fields are displayed as missing and are never invented.

**MOBILE-FIRST RISK:** Popup detail grows; exact-head mobile/WebKit Gold must confirm it remains readable and dismissible.

**HUMAN SUCCESS:** A WH4LES point can no longer hide its temporal, spatial, dataset or rights context, and valid zero coordinates are not discarded.

**BASE / ROLLBACK:** `king/test@7ac8d12cf6073ff2f62578fff6c94e9f972f5d55`; revert this bounded correction if independent Gold finds a valid occurrence or mobile interaction regression.

**MAKER ≠ JUDGE:** Factory implements F14; independent Gold judges the exact HEIR SHA. No product Gold, deployment or production release is authorised.

# CROSS-PRODUCT STRUCTURED-DATA OWNERSHIP — 10 OCT 2026

**STATUS:** BOUNDED HEIR SEO LIFECYCLE CORRECTION / NO GOLD / NO DEPLOYMENT / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person or search system opens a 4PLANET route and needs the page identity, canonical URL and principal subject to describe that route only.

**ONE THING TO UNDERSTAND:** Crawlable prerender schema and the active client-route schema are two lifecycle stages of one 4PLANET-owned graph, not independent graphs that may accumulate.

**PRIMARY ACTION:** Mark every 4PLANET prerender JSON-LD script as owned and remove all owned prerender/current-route variants before installing the active route graph.

**SECONDARY DEPTH:** Preserve one crawlable raw-HTML graph before JavaScript and preserve unrelated third-party JSON-LD during mount, navigation, cleanup and StrictMode replay.

**P1 DOMINANT:** Raw prerender HTML contains exactly one owned, crawlable graph for its route.

**P2 ORIENTATION:** Client mount and A→B→A navigation leave exactly one current 4PLANET route graph.

**P3 ACTION:** Cleanup removes only 4PLANET-owned schema nodes; third-party JSON-LD remains untouched.

**P4 DEPTH:** Deterministic lifecycle tests and a production build do not prove search indexing, ranking, traffic, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Unmarked discovery schema and separate Atlas-only ownership semantics.

**WHAT MUST BE REUSED:** Existing `Seo` manager, discovery/Atlas/Magazine prerenderers, issue #132 receiver, canonical routes and sole `king/test` HEIR.

**TRUTH BOUNDARY:** This prevents duplicate or stale 4PLANET-owned structured data. It does not upgrade any source, claim, publication state or search-engine interpretation.

**MOBILE-FIRST RISK:** None; no layout, route or interaction geometry changes.

**HUMAN SUCCESS:** A route transition cannot leave a ghost schema graph that names the previous page or conflicts with the visible destination.

**BASE / ROLLBACK:** `king/test@ce72270bb88bc9b3140acbd40e799c45cdd3befc`; revert this bounded correction if independent Gold finds a legitimate structured-data interoperability regression.

**MAKER != JUDGE:** Factory implements; independent Gold judges the exact HEIR SHA. No publication, deployment or production release is authorised.

# NATUREBRAIN / ATLAS — OBIS DATE-BOUNDARY INTEGRITY — 10 OCT 2026

**STATUS:** BOUNDED HEIR SOURCE-ADAPTER CORRECTION / NO GOLD / NO INGEST / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person narrows marine observations to an explicit period and needs the returned evidence to remain inside that period.

**ONE THING TO UNDERSTAND:** A supplied invalid date is not an absent filter. The adapter must reject it instead of silently widening the OBIS request.

**PRIMARY ACTION:** Validate real `YYYY-MM-DD` calendar dates and reject inverted date ranges before any upstream fetch.

**SECONDARY DEPTH:** Preserve the existing bounded query, occurrence semantics, per-record provenance/rights, upstream failure state and no-absence/no-live-position truth limits.

**P1 DOMINANT:** Invalid or impossible supplied dates fail with `INVALID_DATE` and never call OBIS.

**P2 ORIENTATION:** A start date after the end date fails with `INVALID_DATE_RANGE`.

**P3 ACTION:** Valid dates, including a real leap day, continue to the existing bounded OBIS occurrence request.

**P4 DEPTH:** This source-adapter correction does not prove ATLAS point-detail date/uncertainty presentation, provider availability, dataset rights, independent Gold, deployment or LIVE behaviour.

**WHAT CAN BE REMOVED:** Shape-only date validation and fail-open omission of an invalid supplied filter.

**WHAT MUST BE REUSED:** Existing `/api/obis` bridge, issue #244 receiver, PKD-158 source contract, ATLAS source-bridge regression suite and sole `king/test` HEIR.

**TRUTH BOUNDARY:** OBIS records remain occurrence evidence, not abundance, range, trend or live position. `eventDate` remains distinct from retrieval time. F14 ATLAS point-detail provenance is deferred to the existing #244 product scope.

**MOBILE-FIRST RISK:** None; no UI, route, layout or interaction change.

**HUMAN SUCCESS:** An explicit invalid or inverted date boundary can no longer produce a successful unbounded observation response.

**BASE / ROLLBACK:** `king/test@7705f680c253dc1c9bb1261111c3302cf65e6247`; revert this bounded correction if independent Gold finds a valid OBIS calendar regression.

**MAKER ≠ JUDGE:** Factory implements F11–F13; independent Gold judges the exact HEIR SHA. No ingest, product Gold, deployment or production release is authorised.

# UNIVERSAL IMPACT — PROVIDER-BOUND ACTION QUANTITY — 10 OCT 2026

**USER ARRIVES BECAUSE:** A person following a real IMPACT action needs the released provider, delivery unit and funded quantity to describe the same transaction.

**ONE THING TO UNDERSTAND:** Positive amount and quantity fields are insufficient unless the selected provider is an admitted candidate and the quantity satisfies that provider's exact unit and minimum.

**PRIMARY ACTION:** Keep resource flow closed until the caller supplies the selected provider's current diligence binding and it matches the Action Contract provider, quantity unit and minimum.

**SECONDARY DEPTH:** Preserve diligence, Founder release, blocker, payment/delivery/evidence/outcome/impact and remedy boundaries.

**P1 DOMINANT:** No provider binding, no resource flow.

**P2 ORIENTATION:** The selected provider must be one of the contract's existing candidates.

**P3 ACTION:** The known quantity must use that same provider's unit and meet its current minimum.

**P4 DEPTH:** A passing deterministic gate does not prove checkout terms, payment, delivery, evidence, outcome, impact, partnership or LIVE runtime.

**WHAT CAN BE REMOVED:** No new UI, provider store, payment path, database or public claim.

**WHAT MUST BE REUSED:** Existing Universal Action Contract, existing provider diligence pattern, issue #320/#151 receiver, sole HEIR and IMPACT contract suite.

**TRUTH BOUNDARY:** The caller must supply the current provider pattern; a provider ID or positive number alone cannot self-authorise resource flow. Exact checkout and Founder release remain external gates.

**MOBILE-FIRST RISK:** None; deterministic contract correction only.

**HUMAN SUCCESS:** A quantity for a different provider, unit or minimum cannot silently open a real IMPACT resource flow.

**DONOR DECISION:** No donor; correct the existing HEIR primitive in place.

# IMPACT — EVIDENCE TIMESTAMP INTEGRITY WITHOUT AGE POLICY — 09 OCT 2026

**STATUS:** BOUNDED HEIR TRUTH-CORRECTION / NO GOLD / NO PROVIDER OR PAYMENT ACTION / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person following an IMPACT action needs evidence chronology to remain truthful even when no staleness window has been configured.

**ONE THING TO UNDERSTAND:** Maximum age is optional policy metadata; timestamp validity and non-futurity are unconditional integrity requirements.

**PRIMARY ACTION:** Parse every present `evidenceObservedAt`, reject invalid and future instants, and apply `stale_evidence` only when a numeric maximum age exists.

**SECONDARY DEPTH:** Preserve lifecycle, claim-distance, independent-verification, quantity, delivery, contradiction, refund and idempotency boundaries.

**P1 DOMINANT:** Invalid or future evidence cannot bypass chronology checks by omitting `evidenceMaxAgeHours`.
**P2 ORIENTATION:** A valid historical timestamp without an age policy remains valid chronology and is not automatically stale.
**P3 ACTION / NEXT:** Independent Gold judges the exact HEIR correction and the with/without-age boundary before any release controller advances it.
**P4 DEPTH:** Deterministic validation does not prove a provider, verifier, delivery, outcome, impact, payment or production runtime.
**WHAT CAN BE REMOVED:** The conditional that parsed evidence time only when a maximum-age policy was present.
**WHAT MUST BE REUSED:** Existing `ActionEvidenceIntegrity`, lifecycle validator, issue #151 receiver, HEIR and IMPACT contract suite.
**TRUTH BOUNDARY:** This closes a metadata-validation bypass only; it does not promote any real record or claim.
**MOBILE-FIRST RISK:** None; no UI, route, layout or interaction change.
**HUMAN SUCCESS:** Evidence with an invalid or future instant fails closed regardless of whether the record defines a staleness window.
**BASE / ROLLBACK:** `king/test@78c3edf48e442e386a950494bfe19e417981d2ea`; revert this bounded correction if independent Gold finds a legitimate no-age chronology regression.
**MAKER ≠ JUDGE:** Factory implements; independent Gold decides. No main merge, provider mutation, payment or production release is authorised by this brief.

# NATUREBRAIN — SOURCE CHRONOLOGY INTEGRITY — 09 OCT 2026

**STATUS:** BOUNDED HEIR TRUTH-CORRECTION / NO GOLD / NO DATABASE APPLY / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** Living Systems and SPECIES depend on refreshed GBIF, OBIS and NOAA evidence without allowing stale or ambiguous provider snapshots to rewrite the current source state.

**ONE THING TO UNDERSTAND:** ISO timestamp text order is not time order. Source chronology must compare instants and fail closed when either timestamp is invalid or contradictory fingerprints claim the same instant.

**PRIMARY ACTION:** Parse the current and incoming `checkedAt` values, reject invalid chronology, reject strictly older snapshots and route same-instant fingerprint contradictions to `CONFLICT / REVIEW_REQUIRED`.

**SECONDARY DEPTH:** Preserve append-only audit history, current source state, provider identity checks, rights/terms gates and the existing semantic-fingerprint contract.

**P1 DOMINANT:** A stale snapshot whose ISO text sorts later cannot overwrite the current fingerprint.
**P2 ORIENTATION:** Equivalent instants with the same fingerprint remain unchanged; equivalent instants with different fingerprints require review.
**P3 ACTION / NEXT:** Independent Gold judges the exact HEIR SHA and distinct older/equal/invalid regressions before any database or release action.
**P4 DEPTH:** Deterministic source-refresh tests do not prove provider availability, production ingest behaviour, canonical database state or ecological truth.
**WHAT CAN BE REMOVED:** Raw string comparison of source timestamps.
**WHAT MUST BE REUSED:** Existing `evaluateSourceRefresh`, PR #369 regression artifact, TRUTH-2 WBS, append-only audit model and sole `king/test` HEIR.
**TRUTH BOUNDARY:** A detected provider change is not verified truth. This correction only prevents chronology ambiguity from passing the existing propagation gate.
**MOBILE-FIRST RISK:** None; no UI, route, layout or interaction change.
**HUMAN SUCCESS:** Downstream evidence consumers retain the newest unambiguous source state and receive review-required status instead of silent stale/invalid propagation.
**BASE / ROLLBACK:** `king/test@8d5c43936e48a709e4911635f4a3d9f862d1a925`; revert this bounded correction if independent Gold finds a valid provider chronology regression.
**MAKER ≠ JUDGE:** Factory implements; independent Gold decides. No main merge, production data mutation or public release is authorised by this brief.

# 4BRANDS COMPANY BRAIN — ACCOUNT-SCOPED BROWSER RECOVERY — 09 OCT 2026

**STATUS:** BOUNDED HEIR PRIVACY CORRECTION / NO GOLD / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** An authorised company member may use 4BRANDS in a browser that another person used before them and must never inherit that person's private draft.

**ONE THING TO UNDERSTAND:** A company name is not an account boundary. Browser recovery must be scoped to the current person and exact organisation identity, while canonical Company Brain state remains protected by workspace membership and RLS.

**PRIMARY ACTION:** Scope local twin/ledger recovery by authenticated person plus organisation identity, refresh on every auth-state change, clear the prior private view immediately and ignore stale workspace responses.

**SECONDARY DEPTH:** Preserve anonymous recovery, existing Company Brain APIs, workspace membership, RLS, public company analysis and canonical server readback.

**P1 DOMINANT:** User A and user B receive distinct browser-recovery keys for the same company.
**P2 ORIENTATION:** Sign-in, sign-out and account switch reset the in-memory company draft before workspace lookup completes.
**P3 ACTION / NEXT:** Independent Gold runs user-A/user-B and organisation/person browser journeys against the exact HEIR SHA.
**P4 DEPTH:** Deterministic tests do not prove production Supabase RLS, real tenant membership, browser deployment or live user value.
**WHAT CAN BE REMOVED:** Company-name-only localStorage keys and auth state sampled only when the company name changes.
**WHAT MUST BE REUSED:** Existing 4PLANET ID client, Company Brain workspace/RLS API, issue #318, BRN-08 and sole `king/test` HEIR.
**TRUTH BOUNDARY:** Browser recovery is convenience state, never canonical authenticated company truth. Public analysis remains separate from private workspace data.
**MOBILE-FIRST RISK:** OAuth return and account switching may reorder session events; stale responses must not repopulate a cleared view.
**HUMAN SUCCESS:** Changing account in the same browser cannot show or save the previous person's private company draft.
**BASE / ROLLBACK:** `king/test@d574d099dc0874ba499c01678304dc99003c944c`; revert this bounded correction if independent Gold finds an authorised recovery regression.
**MAKER ≠ JUDGE:** Factory implements; independent Gold decides. No main merge or production release is authorised by this brief.

# 4PLANET ID — EXACT HTTPS RETURN-ORIGIN INTEGRITY — 09 OCT 2026

**STATUS:** BOUNDED HEIR SECURITY CORRECTION / NO GOLD / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person signs into 4PLANET ID and must return only to the exact secure 4PLANET product origin they intended.

**ONE THING TO UNDERSTAND:** A familiar hostname is not sufficient authority when the URL changes protocol, port or embeds credentials.

**PRIMARY ACTION:** Replace hostname-only return acceptance with an explicit HTTPS origin allowlist shared by return validation and the cross-domain session bridge.

**SECONDARY DEPTH:** Preserve same-origin relative paths, all existing approved product origins, the ODDEKALV exclusion and the current one-time bridge.

**P1 DOMINANT:** Approved HTTPS product origins and same-origin relative routes continue to resolve.
**P2 ORIENTATION:** HTTP, non-default ports, embedded credentials, deceptive subdomains and ODDEKALV destinations fail closed to the existing safe fallback.
**P3 ACTION / NEXT:** Independent Gold reviews the exact HEIR SHA and runs the authenticated first/second-visit browser journey before any release.
**P4 DEPTH:** Exact return-origin validation does not prove the Supabase session bridge, RLS, Stripe ownership, entitlement, production configuration or real-user value.
**WHAT CAN BE REMOVED:** Hostname-only trust for cross-domain return destinations.
**WHAT MUST BE REUSED:** Existing 4PLANET ID client, approved product-domain inventory, one-time bridge, issue #169 receiver and HEIR.
**TRUTH BOUNDARY:** Deterministic URL tests prove only return-target validation. They do not establish authentication success, account persistence, payment state, deployment or production safety.
**MOBILE-FIRST RISK:** OAuth and in-app browser callbacks must preserve the exact HTTPS return path; no layout or interaction geometry changes.
**HUMAN SUCCESS:** A valid secure product return continues, while a lookalike or downgraded destination cannot receive the user.
**BASE / ROLLBACK:** `king/test@f3c3ebf11a529f408ef31949aaa2cc8ed670ba8b`; revert this bounded correction if independent Gold finds a legitimate approved-origin regression.
**MAKER ≠ JUDGE:** Factory implements; independent Gold decides. No main merge or production release is authorised by this brief.

# 4SAPIEN MONEY MOBILE SUBNAV INTEGRATION — 08 OCT 2026

**STATUS:** BOUNDED HEIR TEST-INTEGRATION CORRECTION / NO PRODUCT BYTE / NO GOLD / NO LIVE RELEASE.
**OBSERVED ROOT CAUSE:** the Money regression sampled the React product navigation as soon as it became visible. On WebKit that can occur before the shared shell MutationObserver marks the bottom-authored product navigation as `data-fs-subnav` and applies the required fixed-top integration contract; the reported `top=784` was the pre-integration position.
**ONE THING TO PRESERVE:** the Money product navigation remains a fixed top field on mobile after the shared shell has integrated it; the independent world bar remains fixed at the bottom.
**CHANGE:** wait for the existing `data-fs-subnav` integration state before measuring the unchanged fixed-position and top-offset requirements.
**UNCHANGED:** product HTML, CSS, JavaScript, navigation geometry, Finance behaviour, shell timing, user data, tests' final geometry requirements and release authority.
**TRUTH BOUNDARY:** this removes a browser-test race only. It does not assert a real user, product value, Gold acceptance, deployment or LIVE state.
**HUMAN SUCCESS:** Chromium and WebKit verify the final integrated Money navigation state rather than racing the shared shell observer.
**ROLLBACK:** exact pre-change `king/test` parent `9da2d4d7b76b69045ae09955b35ad64315959f4e`.
**GOLD:** Maker correction only. Independent Judge remains required before merge, promotion or LIVE claim.

# IMPACT EVIDENCE-TIME INTEGRITY — 08 OCT 2026

**STATUS:** BOUNDED HEIR TRUTH-CORRECTION / NO GOLD / NO LIVE RELEASE.
**USER/SYSTEM GAP:** Evidence dated after the validation time passed freshness checks because its negative age was treated as fresh.
**ONE THING TO PRESERVE:** Evidence must exist at or before assessment time; future evidence cannot promote delivery, outcome or impact truth.
**CHANGE:** reject a valid future timestamp as `future_evidence_timestamp`; preserve invalid, stale and current evidence handling.
**UNCHANGED:** lifecycle states, contribution/payment/delivery/proof/outcome separation, provider data, network/payment/runtime behaviour and release authority.
**TRUTH BOUNDARY:** deterministic validation only; no evidence, delivery, outcome, impact, user value or LIVE state is asserted.
**HUMAN SUCCESS:** impossible future evidence fails closed instead of appearing fresh.
**ROLLBACK:** exact pre-change `king/test` parent `e468496ec882f06bed9134ce4dbd6fca8065fa31`.
**GOLD:** Maker correction only. Independent Judge remains required before merge, promotion or LIVE claim.

# CROSS-PRODUCT URL OWNERSHIP — SPECIES RETURN RELOAD CORRECTION — 08 OCT 2026

**STATUS:** SAME BOUNDED HEIR INTEGRATION CORRECTION / NO GOLD / NO LIVE RELEASE.
**OBSERVED ROOT CAUSE:** after ATLAS navigated to SPECIES, MapLibre could emit a final `moveend` or `idle` during unmount. The stale ATLAS URL writer then used the new SPECIES pathname and replaced its encoded `returnTo` token with raw camera parameters. The visible return control existed before that late write but disappeared after reload.
**CHANGE:** the existing ATLAS URL writer now fails closed unless the current pathname is an ATLAS route.
**UNCHANGED:** camera serialization while on ATLAS, product routes, return token schema, map interaction, data, test requirements and release authority.
**TRUTH BOUNDARY:** this protects URL ownership at the product boundary. It does not accept the separate Living Systems canonical-route drift observed later in the same vertical journey.
**HUMAN SUCCESS:** leaving ATLAS cannot allow a detached map lifecycle event to overwrite the receiving product URL; reloading SPECIES retains the governed return path.
**ROLLBACK:** exact pre-change parent `efc462313a65926d2d96aa3238c458e67813d6e0`.
**GOLD:** Maker correction only; independent Judge and exact browser evidence remain required.

# SPECIES → ATLAS RETURN-CONTROL CONTINUITY — 08 OCT 2026

**STATUS:** BOUNDED HEIR INTEGRATION CORRECTION / NO GOLD / NO LIVE RELEASE.
**USER GAP:** the editorial SPECIES redesign preserved the stateful `returnTo` URL and visible “BACK TO ATLAS” link, but dropped the governed `return-to-atlas` control identity used to prove the shared ATLAS→SPECIES→Living Systems→Mission→Join→ATLAS journey.
**ONE THING TO PRESERVE:** SPECIES remains a NATUREBRAIN lens and returns to the existing ATLAS context; no second map, species store, router or truth model is created.
**CHANGE:** add `data-testid="return-to-atlas"` to the existing visible editorial `returnHref` link in `src/pages/integrated/Species.tsx`.
**UNCHANGED:** URL parsing, destination, copy, layout, taxonomy, provenance, source data, tests, routes and release authority.
**TRUTH BOUNDARY:** this restores a stable interaction contract only. It does not prove real-user value, ecological truth, Gold acceptance, deployment or LIVE state.
**HUMAN SUCCESS:** a person returning from a SPECIES profile can use the same visible control to recover the preserved ATLAS context, and the existing cross-product browser journey can verify that continuity on desktop and mobile.
**OBSERVED BASELINE:** Browser Product Proof run 37744116387 / job 113201693553 produced eight shared-journey failures across desktop 1440/1280 and mobile 390/430 because the receiving page could not locate the governed visible return control.
**ROLLBACK:** exact pre-change `king/test` parent `9c8a6b99b0fd1f4c7fc8c4abe0b67f5f3adc21aa`.
**GOLD:** Maker correction only. Existing browser acceptance remains unchanged; independent Judge is still required before any merge, promotion or LIVE claim.

# NATUREBRAIN SOURCE-TO-UNDERSTANDING PROVENANCE — 08 OCT 2026

**STATUS:** BOUNDED HEIR SHARED-CORE CANDIDATE / NO LIVE RELEASE.
**SYSTEM GAP:** the canonical NATUREBRAIN evidence adapter retained source and record identifiers but dropped dataset identity, evidence identity/type/relation and review time before generic Node Intelligence could consume the claim.
**ONE THING TO PRESERVE:** NATUREBRAIN remains the single shared living-planet world model; products receive a read-only projection and create no second claim or graph store.
**CHANGE:** carry existing evidence provenance fields through `natureBrainEvidenceFrame` and expose that same frame on `NodeIntel`; extend the existing NATUREBRAIN contract.
**UNCHANGED:** canonical entities, claims, relationships, review status, database schema, service-only RPC, public routes and LIVE runtime.
**TRUTH BOUNDARY:** the adapter passes through recorded provenance only. It does not verify a source, upgrade review status, synthesize causality, prove freshness, infer ecological state or claim LIVE/user value.
**HUMAN SUCCESS:** a downstream SPECIES, ATLAS or LSI explanation can retain the exact evidence, dataset, source record and review time attached to a canonical stored claim instead of reducing it to an uncoupled URL.
**ROLLBACK:** exact pre-change `king/test` parent `664383b4264c43de4deaeb7e1d0cbb18f42cfcd2`.
**TEST:** targeted NATUREBRAIN contract 9/9 pass; exact-SHA CI typecheck and production build pass. Full smoke remains blocked by inherited ATLAS `failIfMajorPerformanceCaveat` contract drift outside this package.
**GOLD:** Maker change only. Independent Judge remains required; no merge, promotion or LIVE authority follows.

# 4SAPIEN LIFE-8 STABLE TODAY NAVIGATION — 08 OCT 2026

**STATUS:** BOUNDED HEIR SHELL + BROWSER REGRESSION FIX / NO LIVE RELEASE.
**USER GAP:** “I dag” points to root, while root inferred sign-in from any non-empty `sb-*-auth-token` localStorage string and could redirect a stale-token visitor to Money.
**ONE THING TO PRESERVE:** the existing five-world shell and explicit destinations remain unchanged.
**CHANGE:** remove token-string sign-in inference and keep root as the stable “I dag” destination; add a mobile browser regression with stale token text.
**UNCHANGED:** Supabase authentication, FOOD, Finance, Brain, Meg, persistence and all product data paths.
**TRUTH BOUNDARY:** this removes an unsafe navigation heuristic only. It does not prove a valid session, a returning user, user value, Gold acceptance or LIVE deployment.
**HUMAN SUCCESS:** opening “I dag” or loading root remains on root for anonymous, signed-in and stale-token browser state until an authenticated product flow explicitly navigates elsewhere.
**ROLLBACK:** exact pre-change `king/test` parent `19fa1edb76ac7c82825227968c7b1317d393da32`.
**GOLD:** Maker change only. Independent Judge remains required; no merge, promotion or LIVE authority follows.

# IMPACT TERMINAL REMEDY LIFECYCLE — 08 OCT 2026

**STATUS:** BOUNDED HEIR PRODUCT LOGIC + REGRESSION FIX / NO LIVE RELEASE.
**USER/SYSTEM GAP:** A record already closed as `INVALIDATED_REMEDIED` could pass transition validation back into the same terminal state because the destination rule ran before the source-terminal guard.
**ONE THING TO PRESERVE:** contribution/payment, delivery, evidence, outcome and impact remain distinct; invalidation/remedy is a terminal audit state, not a reopenable success state.
**CHANGE:** evaluate the terminal source guard first and extend the existing lifecycle contract with self-transition and forward-transition regressions.
**UNCHANGED:** normal forward transitions and transition from an eligible non-discovered state into `INVALIDATED_REMEDIED`.
**TRUTH BOUNDARY:** This fixes deterministic lifecycle validation only. It does not assert a payment, delivery, evidence item, outcome, impact, provider relationship or LIVE deployment.
**HUMAN SUCCESS:** a remedied action cannot be reopened or repeatedly remedied by the transition helper; its history remains closed for audit.
**ROLLBACK:** exact pre-change `king/test` parent `82330b15fde72f04f2a7dfa6d0ab51e92097239a`.
**GOLD:** Maker change only. Independent Judge remains required; no merge, promotion or LIVE authority follows.

# SPECIES FACTORY IDENTITY CONTRACT — 08 OCT 2026

**STATUS:** BOUNDED HEIR DATA + REGRESSION FIX / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** they search or open one of the first ten Factory species and expect the discovery label to describe the same canonical taxon as the profile.
**ONE THING TO UNDERSTAND:** a profile, its GBIF identity and its discovery object are one species object, not loosely related copies.
**PRIMARY ACTION:** open the species profile from discovery.
**SECONDARY DEPTH:** inspect source, limitations, ATLAS context and provenance on the existing Human-First plank.
**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** living species identity / common + scientific name / open profile / sources, limits and ATLAS.
**WHAT CAN BE REMOVED:** the duplicate “Green Sea Turtle” discovery label that drifted from the canonical profile name “Green Turtle”.
**WHAT MUST BE REUSED:** existing SPECIES profiles, GBIF IDs, source URLs, discovery inventory, source envelopes and Factory batch gate.
**TRUTH BOUNDARY:** this fixes internal identity consistency only. It does not assert taxonomy freshness, local presence, range, abundance, trend, rights clearance, user value or LIVE deployment.
**MOBILE-FIRST RISK:** none introduced; no layout or interaction changes.
**HUMAN SUCCESS:** discovery and profile both name Chelonia mydas “Green Turtle”; every first-batch profile has a unique canonical ID and GBIF key, an exact matching GBIF URL and exactly one matching discovery object.
**DONOR DECISION:** PR #390 remains a read-only diverged donor. The accepted shared plank is already present on the sole HEIR; this correction changes only current HEIR data/control.
**ROLLBACK:** exact pre-change king/test parent `8e425994c00bc9282faaa1681df586126c6ac9da`.
**GOLD:** Maker change only. Independent Judge remains required; no merge, custom-domain promotion or LIVE authority follows.

# ATLAS GOOGLE EXPOSURE CLOSURE — 08 OCT 2026

## PLACE RUNTIME ROUTE IMMUNITY — 08 OCT 2026

**STATUS:** BOUNDED HEIR REGRESSION CONTRACT / NO PRODUCT BYTE OR LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person or search crawler opens one verified Place URL and needs the canonical page, its real map image and the same-object ATLAS handoff to resolve consistently.

**ONE THING TO UNDERSTAND / PRIMARY ACTION:** `/place/<slug>` is the sole canonical Place page; duplicate trailing-slash variants permanently collapse to it while preserving the query, and `/place/<slug>/map.svg` serves the corresponding image rather than a page or fallthrough.

**SECONDARY DEPTH / P1–P4:** P1 canonical Place identity; P2 verified geography and provenance; P3 same-object interactive ATLAS continuation; P4 related-place and source depth. The test changes none of those layers.

**REMOVE / REUSE:** Create no new router, fixture, Place store or release workflow. Exercise the exported existing Cloudflare middleware directly through the standard Node test runner.

**TRUTH BOUNDARY:** The contract proves deterministic HTTP routing, metadata and fail-closed unknown slugs on the HEIR source. It does not prove search indexing, traffic, ecological relationships, user value, deployment or LIVE release.

**MOBILE-FIRST RISK:** None introduced; no rendered byte changes. **HUMAN SUCCESS:** canonical Place page and image stay reachable while duplicates and unknowns cannot create competing indexable surfaces.

**STATUS:** BOUNDED ATLAS EXPOSURE / INDEXABILITY CORRECTION. No ATLAS interface redesign in this change.

**FOUNDER OBJECTIVE:** Make 4PLANET ATLAS and its verified World Place Index discoverable through Google while Claude independently improves the ATLAS user experience.

**SEARCH TRUTH AT START:** Search Console sitemap submitted 52 URLs and reported 0 indexed; inspected sample Place URLs were "URL is unknown to Google" with no last crawl time.

**CANONICAL OWNERSHIP:** `4planetatlas.com` owns ATLAS and canonical Place pages. Current interactive application canonical = `https://4planetatlas.com/atlas`. Root `/` permanently redirects to `/atlas` until the standalone router itself is intentionally migrated to root.

**PLACE COHORT:** Preserve the already calibrated World Place Index: 50 base verified places + 200 promoted Natural Earth candidates = 250 indexable place URLs. Unknown place slugs fail closed with 404.

**SEO CONTRACT:** `robots.txt` advertises only `https://4planetatlas.com/sitemap.xml`; sitemap exposes `/atlas`, `/places` and exactly 250 canonical `/place/*` URLs; each place exposes canonical metadata, structured data, provenance and crawlable related-place links without requiring JavaScript.

**SEPARATION:** Claude owns ATLAS UI/UX work. This closure only modifies exposure/runtime SEO infrastructure and must not overwrite Claude's interface work.

**TRUTH BOUNDARY:** Sitemap submission and crawlability do not equal Google indexing or ranking. Search Console state remains the authority for crawl/index status.

---

# DISCOVERY ENGINE 01 — HEIR BROWSER PROOF RESTORATION — 08 OCT 2026

**STATUS:** BOUNDED HEIR TEST-CONTROL FIX / NO PRODUCT BYTE CHANGE / NO LIVE AUTHORITY.

## USER ARRIVES BECAUSE
A person entering through `/now`, `/wildfires` or `/earthquakes` needs the Discovery page to render its source boundary, canonical ATLAS continuation and indexable canonical identity on desktop and mobile.

## ONE THING TO UNDERSTAND
The current HEIR contains the Discovery product and deterministic contract, but no longer contains or runs the earlier accepted route-level Playwright journey from donor PR #403.

## PRIMARY ACTION
Restore that exact bounded journey to the sole HEIR and execute it in the existing Browser Product Proof workflow.

## SECONDARY DEPTH
The test checks HTTP success, the expected heading/source, canonical ATLAS iframe, canonical URL, indexable robots state, no horizontal overflow and no page exceptions.

## P1 DOMINANT
Regression-proof restoration only; no route, content, design, source or runtime implementation changes.

## P2 ORIENTATION
The same three representative routes cover Earth Now, one satellite/fire topic and one seismic topic.

## P3 ACTION / NEXT
Run the exact test on Chromium desktop, 390, 430 and WebKit 390; route the resulting candidate to independent Gold.

## P4 DEPTH
PR #403 remains read-only donor evidence. The test is copied into `king/test`; the donor is not repaired, promoted or made authoritative.

## WHAT CAN BE REMOVED
No new workflow, fixture, product branch or release carrier. Reuse the existing Browser Product Proof job.

## WHAT MUST BE REUSED
Existing Discovery routes and content registry, canonical `4planetatlas.com` embed, Playwright projects, sole HEIR and PR #403's bounded accepted journey.

## TRUTH BOUNDARY
Passing this synthetic browser proof demonstrates route/rendering invariants only. It does not prove search indexing, traffic, real-user value, LIVE deployment or release authority.

## MOBILE-FIRST RISK
Horizontal overflow or hidden source/map continuation at 390/430 must fail the journey.

## HUMAN SUCCESS
The representative Discovery entry renders correctly and exposes its evidence boundary and ATLAS continuation without page errors or overflow.

---

# WHAT WE BELIEVE — HOMEPAGE DISCOVERY SYNC — 07 OCT 2026

**STATUS:** BOUNDED HEIR FOLLOW-UP / SAME VALUES CANDIDATE / NO NEW CANON.

**DELTA:** The existing homepage belief section now routes directly to `/about/what-we-believe` instead of generic `/about`, and its invitation matches canonical intent: “There is a place for everyone who wants to help — including you.”

**WHY:** Values must be discoverable in normal product journeys, not hidden only inside About navigation. Reuse the existing homepage belief block; create no new campaign or duplicate values source.

**TRUTH / SCOPE:** Homepage language remains a short public derivative. Canon remains the single Drive Founder Thesis authority. No product claim, impact claim or new value is introduced.

**MOBILE RISK:** Longer invitation heading must wrap without overflow.

**RELEASE:** Same exact-artifact QA and bounded LIVE release as the owning WHAT WE BELIEVE candidate.

---

# WHAT WE BELIEVE — CANON WORDING SYNC + HUMAN INVITATION — 07 OCT 2026

**STATUS:** BOUNDED HEIR CANDIDATE / FOUNDER-APPROVED VALUES CANON SYNC / LIVE RELEASE REQUIRES EXACT TESTED ARTIFACT.

## USER ARRIVES BECAUSE
A person wants to understand why 4PLANET exists, what it believes, how it behaves and whether there is a meaningful place for them to contribute.

## ONE THING TO UNDERSTAND
The website is a public projection of the single canonical WHAT WE BELIEVE Founder Thesis. It does not own or fork the values.

## PRIMARY ACTION
Read `/about/what-we-believe`, understand the seven values and continue through `FIND YOUR PART` if the person wants to contribute.

## SECONDARY DEPTH
The page exposes purpose, ambition, beliefs, values, behaviours, brand law and invitation without replacing The Story, The System or The Founder.

## P1 DOMINANT
FOR A LIVING PLANET: “people and the rest of nature can thrive together.” People are explicitly part of nature, not outside it.

## P2 ORIENTATION
BETTER. FOR EVERYONE. now uses solutions language: create broad, durable value without quietly moving costs to other people, species, places or generations.

## P3 ACTION / NEXT
EVERYONE HAS A PART TO PLAY: “No one solves problems this big alone. Together, we can.” The invitation is explicitly for everyone who wants to help, including the reader.

## P4 DEPTH
HOW WE BEHAVE starts with “Love life. Care deeply for the living world.” Curiosity, truth, courage, welcome, listening, sharing, mutual help, ownership, finishing, correction and learning remain behaviours under the values rather than competing top-level values.

## WHAT CAN BE REMOVED
No new values document, no second manifesto, no alternative values list, no generic empowerment slogan.

## WHAT MUST BE REUSED
Canonical Drive authority `1dzdFFP_9IxJSORKxRgcxeZ5TKgJaQwDMD3XFcu8YoVE`; existing About architecture; existing public route; existing 7-value structure; existing Join route.

## TRUTH BOUNDARY
“Including you” applies to people who want to help in good faith. Inclusion does not waive truth, safety, dignity, law or responsible-conduct standards. “Together, we can” is an agency statement, not a claim that every problem is solvable or that 4PLANET has already solved it.

## MOBILE-FIRST RISK
Long invitation heading and behaviour copy must wrap cleanly at 390/430 without horizontal overflow or hierarchy collapse.

## HUMAN SUCCESS
A first-time visitor can explain purpose, values and expected behaviour, and feels invited into a meaningful contribution path without being told they must become an activist or expert.

**RELEASE:** Founder has explicitly asked to get this values work LIVE, but production promotion remains bound to exact candidate QA and bounded release so unrelated TEST KING work is not promoted.

---

# LIVE PROMOTION AUTHORITY TOKEN CONVERGENCE — 07 OCT 2026

**STATUS:** RELEASE-CONTROL REPAIR / NO PRODUCT BYTE CHANGE / NO LIVE BYPASS.

## USER ARRIVES BECAUSE
A Founder-authorised, fully tested public product change must be able to move from the sole TEST KING to LIVE through one internally consistent release contract.

## ONE THING TO UNDERSTAND
Two existing release guards used different success tokens for the same Founder decision: `FOUNDER_ACCEPTED` and `FOUNDER_AUTHORISED`. One manifest cannot satisfy both. The canonical token is now `FOUNDER_AUTHORISED` in both guards.

## PRIMARY ACTION
Require one exact Founder-authorised manifest status across GOLD PR-to-main validation and the LIVE exact-artifact guard.

## SECONDARY DEPTH
Preserve every other exact-artifact condition: source branch `king/test`, tested SHA, prior LIVE SHA, Founder decision reference, evidence reference and rollback reference.

## P1 DOMINANT
Release-control consistency. No application route, content, design, data or product runtime changes.

## P2 ORIENTATION
The current Discovery Engine candidate remains the tested product objective; this change only makes the existing release gates mutually satisfiable.

## P3 ACTION / NEXT
Run the full exact-SHA gate set again, then create the manifest-only release-control child commit after all required product gates pass.

## P4 DEPTH
A regression test reads both release guards and fails if the authorised status token diverges again.

## WHAT CAN BE REMOVED
The obsolete `FOUNDER_ACCEPTED` token from the GOLD promotion path.

## WHAT MUST BE REUSED
Existing LIVE_PROMOTION_MANIFEST, sole TEST KING authority, exact-artifact law, rollback identity, GOLD policy and live-promotion guard.

## TRUTH BOUNDARY
This control repair does not authorise a release by itself. LIVE still requires explicit Founder authority already given for DISCOVERY ENGINE 01, successful exact-SHA evidence, and the manifest-only release-control commit.

## MOBILE-FIRST RISK
None. No user-facing runtime byte changes.

## HUMAN SUCCESS
A valid Founder-authorised artifact can pass both release guards without weakening either guard or bypassing any evidence requirement.

---

# DISCOVERY ENGINE 01 — ROUTE-LEVEL BUNDLE SPLIT — 07 OCT 2026

**STATUS:** BOUNDED PERFORMANCE / RELEASE-GATE FIX FOR THE FOUNDER-AUTHORISED DISCOVERY LIVE OBJECTIVE.

## USER ARRIVES BECAUSE
Public discovery and the rest of 4PLANET must load without forcing every secondary product surface into the first JavaScript payload.

## ONE THING TO UNDERSTAND
The existing router eagerly imported many independent product pages. This change converts secondary routes to React lazy boundaries so the initial bundle carries only what the current route needs.

## PRIMARY ACTION
Preserve every existing public URL and route behaviour while reducing the main production bundle below the existing convergence threshold.

## SECONDARY DEPTH
Discovery Engine pages, Species, Places, Impact, Labs, 4SAPIEN, About, Market and other secondary surfaces are fetched as route chunks only when entered.

## P1 DOMINANT
No product redesign. No URL change. No content change. Main-bundle reduction only.

## P2 ORIENTATION
Home stays eager; existing already-lazy ATLAS, Magazine and specialist flows remain lazy; newly deferred routes use one shared top-level Suspense boundary.

## P3 ACTION / NEXT
Exact typecheck, build, smoke, security, browser and bundle evidence decide acceptance.

## P4 DEPTH
The 20 discovery slugs stay explicit in the router layer while the full discovery data/content module moves out of the initial bundle.

## WHAT CAN BE REMOVED
Eager imports of route modules that are not required to render the current entry route.

## WHAT MUST BE REUSED
Existing React Router, existing route paths, current page components, existing fallbacks, Master Brand OS and all current product data.

## TRUTH BOUNDARY
A smaller bundle is a delivery improvement, not evidence of better content or product outcomes. No route is removed or renamed.

## MOBILE-FIRST RISK
Lazy loading must not create blank navigation states; the existing white/public, dark/world and lab fallbacks remain available.

## HUMAN SUCCESS
Users reach the same destinations with the same content while initial JavaScript is materially smaller and the existing convergence budget is met.

---

# DISCOVERY ENGINE 01 — ROUTER SECURITY REMEDIATION — 07 OCT 2026

**STATUS:** BOUNDED RELEASE BLOCKER FIX FOR THE FOUNDER-AUTHORISED DISCOVERY LIVE OBJECTIVE.

**USER ARRIVES BECAUSE:** the public discovery surfaces must reach production without bypassing the repository's dependency-security gate.

**ONE THING TO UNDERSTAND:** React Router 6.30.4 is blocked by current security advisories with no patched 6.x release. This bounded change migrates the existing declarative router dependency to 7.18.4; it does not redesign routing.

**PRIMARY ACTION:** preserve all existing routes and Discovery Engine behaviour while clearing the security audit.

**SECONDARY DEPTH:** exact typecheck, build, smoke, GOLD and browser gates must prove compatibility before LIVE promotion.

**P1 DOMINANT:** dependency security remediation only.

**P2 ORIENTATION:** existing BrowserRouter / Routes / Route / Link / Navigate / hooks remain the application routing model.

**P3 ACTION / NEXT:** if any compatibility regression appears, repair the specific route behaviour; do not suppress npm audit.

**P4 DEPTH:** package-lock is updated to the exact 7.18.4 router artifacts and required cookie/set-cookie-parser transitive dependencies.

**WHAT CAN BE REMOVED:** obsolete @remix-run/router 1.23.3 transitive package from the v6 line.

**WHAT MUST BE REUSED:** existing route definitions, PublicShell, Discovery Engine, identity/auth and all product URLs.

**TRUTH BOUNDARY:** passing dependency audit does not itself prove UI correctness; typecheck/build/smoke/browser proof remain required.

**MOBILE-FIRST RISK:** no intended visual/mobile change; regression gates remain authority.

**HUMAN SUCCESS:** users see no routing regression, while the release no longer ships the blocked router dependency.

---

# LIVING SYSTEMS v1.4.2 — QA CORRECTION 02 — 06 OCT 2026

**CONCURRENT HEIR CHANGE:** The Founder-authorised homepage premium refinement landed after the canonical route fix and rewrote the product-card tuple, restoring its prior `/living-systems` target as part of that refactor.

**RECONCILIATION:** Preserve the entire new homepage refinement. Change only the Living Systems target to `/livingsystems/` and full-document navigation so the standalone recovered Next product is loaded. Harden the contract to ignore cosmetic label case.

**ZERO LOSS:** 88/88 historical v1.4.2 source files remain untouched. No current homepage visual work is reverted.

---

# 4PLANET HOMEPAGE — BRAND + COPY REFINEMENT LIVE CANDIDATE — 06 OCT 2026

**STATUS:** FOUNDER-AUTHORISED BOUNDED LIVE CANDIDATE / EXACT-HEAD HUMAN CRAFT + ATLAS ZERO LOSS REQUIRED BEFORE LIVE CLAIM.

**FOUNDER DIRECTION:** 06 OCT 2026 — complete and publish the agreed 4planet.org homepage refinement now, then report exactly what changed.

**BOUNDED LIVE SCOPE:** Homepage presentation/copy and the existing first-party ATLAS homepage embed only. Preserve current routing, shared ATLAS renderer, camera authority, source model, auth, data and product architecture.

**USER / BRAND JOB:** A first-time visitor should quickly understand what 4Planet is, why it exists, how the four lenses help, why the four Domains exist, and where credible action can begin — while the page feels calm, premium, human and unmistakably 4Planet.

**VISUAL / COPY CHANGES:** pure white light surfaces; restrained card shadows; materially less mono; no unnecessary all-caps or underscores in body copy; 4Planet casing in prose; black-on-white Lens cards; controlled headline line-breaks; clearer Impact development language; blue Domains introduction with white text; one non-duplicated Domain title per image; explicit Marine / Terrestrial / Human / Cultural system descriptors; closer Orca encounter; blue DJ 4Culture visual; researcher visual retained before Join.

**ATLAS:** Homepage embed reuses the existing MapLibre World and canonical Layers console, with one separate blue trigger that only opens/closes that existing console. No second map, camera, data or layer authority. Full ATLAS and homepage embed use lower-cost WebGL rendering, a bounded tile cache and short tile fade to reduce visible loading/popping during movement.

**TRUTH / IMPACT:** Impact pathways remain explicitly in development. No public participation, delivery, partner, outcome or ecological-impact claim is promoted by this release.

**ACCEPTANCE:** exact-head typecheck/build; Human Craft desktop-1440 + mobile-390 + mobile-430; real white-mode MapLibre canvas + functional Layers trigger; ATLAS Zero Loss; no horizontal overflow.

---
# DISCOVERY RELEASE SECURITY CORRECTION — SOURCE-MAP-JS 1.2.2 — 06 OCT 2026

**STATUS:** CONTROLLED DEPENDENCY PATCH / NO DISCOVERY PRODUCT SEMANTIC CHANGE.

**WHY:** exact TEST KING Public Preview passed typecheck, production build and the full smoke suite, including DISCOVERY ENGINE 01, then failed only because the current dependency audit flags a high-severity `source-map-js <1.2.2` advisory.

**CHANGE:** update the existing transitive `source-map-js` lock entry from 1.2.1 to patched 1.2.2. PostCSS already accepts the compatible `^1.2.1` range. No application source, route, content, source claim, ATLAS behavior or design is altered.

**PROOF REQUIRED:** `npm ci` → typecheck → production build → smoke → `npm audit --audit-level=high` on the new exact TEST KING SHA.

**SOURCE:** GitHub Advisory GHSA-68fv-2mgg-jv7q / CVE-2026-93749.

---

# LIVING SYSTEMS v1.4.2 — QA CORRECTION 01 — 06 OCT 2026

**CAUSE:** TEST KING Home uses a six-field product tuple. The initial bounded route transform targeted the older five-field shape, so the tuple stayed at `/living-systems` while `reloadDocument` expected `/livingsystems/`. TypeScript correctly failed closed.

**CORRECTION:** Change only the LIVING SYSTEMS tuple target to `/livingsystems/` and harden the recovery contract to assert the actual tuple.

**ZERO LOSS:** All 88 recovered v1.4.2 source files remain untouched. No historical visual, graph, intelligence or data semantics changed.

---

# LIVING SYSTEMS v1.4.2 ZERO LOSS — FOUNDER-AUTHORISED LIVE CANDIDATE — 06 OCT 2026

**STATUS:** TEST KING CANDIDATE / FOUNDER AUTHORISED FOR BOUNDED LIVE RELEASE AFTER EXACT-SHA QA + RUNTIME READBACK.

**FOUNDER DECISION:** 06 OCT 2026 — recover the complete historical Living Systems v1.4.2 line-for-line with ZERO LOSS, preserve its full intelligence engine and exact visual baseline, make it the leading Living Systems public product, and release it at 4planet.org/livingsystems. Newer work becomes donor material only after intact recovery.

**SOURCE AUTHORITY:** `odinskogen-dev/4Planet_LivingSystems1.4.2@0a849ff3fd28e6cc6abcd04c95c5292410443502`. 88/88 historical source files. No historical source file is edited for recovery.

**LIVE BOUNDARY:** Living Systems v1.4.2 product tree + build wrapper + 4PLANET home lens/link + canonical sitemap/legacy landing redirect. No wholesale TEST KING promotion. Existing newer Living Systems implementation remains donor/history.

**ROLLBACK:** preserve the exact prior LIVE main SHA at promotion time and immutable prior Pages deployment. No LIVE claim before exact custom-domain readback.

## USER ARRIVES BECAUSE
They want to understand how species, ecosystems, ecological functions, ecosystem services, human systems, threats and solutions depend on one another.

## ONE THING TO UNDERSTAND
Living systems are networks of relationships and dependencies; species and places are entry points, while the relationships are the core intelligence asset.

## PRIMARY ACTION
Start a guided Living Systems journey and move through the connected dependency graph.

## SECONDARY DEPTH
Explore ecosystems, species, dependencies, solutions, decisions, learning, trust and original sources without leaving the same recovered intelligence model.

## P1 DOMINANT
The intact v1.4.2 Living Systems product and its Human Use entry into the graph.

## P2 ORIENTATION
Clear relationship pathways showing what depends on what, why it matters and what can fail or help.

## P3 ACTION / NEXT
Continue into a related species, ecosystem, solution, decision pathway, learning record or source; later donor integration may connect the same object to ATLAS and current NATUREBRAIN.

## P4 DEPTH
Reverse dependencies, recursive failure cascades, claims/sources/trust, data quality, Solution Intelligence, Decision Intelligence and Learning Intelligence.

## WHAT CAN BE REMOVED
Nothing from the historical v1.4.2 source during recovery. Cleanup/redesign is explicitly deferred until full intact live proof exists.

## WHAT MUST BE REUSED
All 88 historical v1.4.2 source files, historical visual language, graph engine, registry/data model, trust/source logic, dependency and cascade logic, Solution/Decision/Learning intelligence, Human Use Translation, Amazon and Pollination/Food proof cases.

## TRUTH BOUNDARY
Historical examples remain structured intelligence/prototype evidence, not proof of live ecological outcomes. Decision Intelligence is structured reasoning, not automated advice. NATUREBRAIN integration later must preserve or expand recovered semantics and source/uncertainty boundaries.

## MOBILE-FIRST RISK
The historical product must render and navigate correctly under the /livingsystems base path on mobile without changing its visual language or breaking internal links.

## HUMAN SUCCESS
A first-time visitor can enter Living Systems, understand a real dependency pathway, move to deeper intelligence and inspect trust/source context while seeing the same v1.4.2 product recovered intact.

---

# 4PLANET DISCOVERY ENGINE 01 — EARTH NOW + 20 CANONICAL LIVE DISCOVERY SURFACES — 06 OCT 2026

**STATUS:** BOUNDED PUBLIC PRODUCT CANDIDATE / FOUNDER LIVE INTENT EXPLICIT / EXACT-ARTIFACT QA REQUIRED BEFORE PRODUCTION PROMOTION.

## USER ARRIVES BECAUSE
A person searches Google, Bing or an AI assistant for a real environmental subject — for example wildfires, earthquakes, climate change, biodiversity, orca, Oslofjord or renewable energy — and needs a useful, source-grounded 4PLANET answer that can continue into the living product.

## ONE THING TO UNDERSTAND
Discovery is a product entry layer over existing 4PLANET intelligence, not a content farm. One permanent canonical URL should become more useful as sources, relationships and visualisation improve.

## PRIMARY ACTION
Read the answer and key source boundary, then inspect the same subject through the embedded canonical 4PLANET ATLAS.

## SECONDARY DEPTH
Continue into related SPECIES, PLACE, Living Systems, Mission, Impact, S4PIENS or 4BRANDS journeys where the existing product graph supports them.

## P1 DOMINANT
EARTH NOW at `/now`: “What is happening on Earth right now?” with latest-available planetary signals and a visible warning that the sources do not share one synchronized real-time clock.

## P2 ORIENTATION
Twenty permanent source-grounded topic pages: Wildfires, Earthquakes, Climate Change, Biodiversity, Deforestation, Plastic Pollution, Coral Bleaching, Air Quality, Orca, Whales, Bees, Amazon Rainforest, Oslofjord, Renewable Energy, Solar Energy, Food Waste, Fast Fashion, Rewilding, Climate Solutions and Environmental Jobs.

## P3 ACTION / NEXT
Each page exposes its canonical source list, latest checked date, an embedded canonical ATLAS view and relevant internal product connections. Earth Now links back into permanent topic pages instead of becoming a disposable feed.

## P4 DEPTH
Crawler-readable prerendered HTML, canonical metadata, OG/Twitter metadata, JSON-LD, Breadcrumb/ItemList structures, sitemap inclusion and explicit establishes / does-not-establish boundaries. Machine readability remains subordinate to human usefulness.

## WHAT CAN BE REMOVED
No new CMS, SEO database, second ATLAS, trend database, duplicate Brain, keyword-stuffed FAQ system or separate design system. Existing discovery, source, ATLAS, PublicShell, analytics, sitemap and prerender infrastructure are reused.

## WHAT MUST BE REUSED
Current Master Brand OS and PublicShell; current `src/data/discoveryInventory.json` and `atlasDiscovery.json`; existing source/provenance discipline; canonical `4planetatlas.com` renderer and its existing layers; current sitemap/prerender pipeline; existing analytics event seam.

## TRUTH BOUNDARY
“Earth Now” means latest available per source, never one universal real-time Earth. Thermal anomaly ≠ confirmed wildfire. Occurrence record ≠ current animal position, abundance or migration route. Tree-cover loss ≠ automatically deforestation. Coral thermal stress ≠ observed bleaching. Aerosol optical depth ≠ ground-level air quality. Context layers are labelled as context where no direct topic layer exists. No indexation, ranking or AI citation is claimed without measurement.

## MOBILE-FIRST RISK
The embedded ATLAS must remain usable at 390/430 widths without horizontal page overflow; topic fact strips and signal rows must collapse cleanly; search-readable fallback must not create duplicate visible content after hydration.

## HUMAN SUCCESS
A first-time visitor can understand the topic within seconds, see what is known versus not established, inspect the original sources, use the map and continue into a deeper 4PLANET object without encountering generic generated SEO prose.

**FOUNDER LIVE INTENT:** On 06 Oct 2026 the Founder explicitly corrected the execution target: “Det er selvsagt Live sidene som må oppdages” and instructed execution to continue. This authorises the LIVE objective for this bounded discovery change, but the production manifest is populated only after the exact integrated artifact has passed the required QA gates.

**RELEASE PATH:** bounded change → sole TEST KING integration → exact-sha QA/evidence → manifest-only Founder release control → production promotion → physical readback on `https://4planet.org/now` and all 20 canonical URLs. Do not stop at TEST/HEIR.

---

# 4BRANDS PUBLIC COMPANY INTELLIGENCE + PREMIUM PRODUCT REBUILD 01 — 06 OCT 2026

**STATUS:** HEIR PRODUCT CANDIDATE / PUBLIC-FIRST COMPANY INTELLIGENCE / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a leader, employee, investor, supplier or curious person wants one source-grounded view of what the public world can establish about a company before connecting private data.

**ONE THING TO UNDERSTAND:** exact legal identity comes first. 4BRANDS then separates public FACTS, transparent CALCULATIONS, source SIGNALS, bounded HYPOTHESES and explicit UNKNOWNs instead of generating an AI company essay.

**PRIMARY ACTION:** search a company → resolve the exact BRREG legal entity → inspect its public intelligence profile.

**P1 DOMINANT:** legal company identity, source coverage, key register/financial facts and material change state.

**P2 ORIENTATION:** BUSINESS / FINANCIALS / MARKET / PROCUREMENT / INNOVATION / CAPITAL / PLANET / STRUCTURE / PEOPLE / CHANGES / FINDINGS / SOURCES use progressive disclosure rather than one long report.

**P3 ACTION:** inspect original evidence; use TED demand search; review a Climate TRACE owner identity before showing facility records; inspect exact-legal-name CORDIS relationships; authenticate through existing 4PLANET ID before private Company Brain depth.

**P4 DEPTH:** BRREG roles, group structure, subunits, updates, annual-account availability, latest open key figures and industry cohort; GLEIF exact registration-number identity where available; BRREG-anchored first-party website discovery; CORDIS EURIO; TED; reviewed Climate TRACE.

**DESIGN CONTRACT:** current BRAND OS is authority; historical BRAND OS is donor. PAPER/INK dominate, thin rules/grids, Instrument Sans + DM Sans + bounded Fragment Mono, restrained type scale, no pill-heavy SaaS chrome, no gradient/glow/shadow aesthetic, no giant generic hero typography. REVEAL COMPLEXITY, NOT DISPLAY COMPLEXITY.

**TRUTH BOUNDARIES:** industry cohort ≠ proven competitor set. Published procurement notice ≠ eligibility/contract/payment. Company website content = first-party claim context until corroborated. CORDIS participation/funding-role value ≠ company revenue/cash/profit/current funding availability. Climate TRACE name similarity never becomes a company emissions claim without explicit owner review. Local “last seen” state is non-authoritative UI state; source events remain authoritative.

**SOURCE ACCESS:** a BRREG-registered company website may block automated retrieval. HTTP access control is recorded as SOURCE_UNAVAILABLE / access-controlled, not bypassed and not converted to a fact about the company. Gold requires the first-party mechanism to physically fetch at least one registered website in the real-company matrix where the publisher permits it.

**KNOWN EXTERNAL BLOCKERS:** EPO OPS patent intelligence requires external developer/OAuth credentials and is not presented as connected. Doffin-only national notice coverage remains open until its structured public API path is verified; TED is the currently connected public procurement source. Arbitrary old AI “Research deeper” remains separate and fail-closed where its server model credential is absent.

**RETURN VALUE:** WHAT CHANGED is first-class. A bounded local visit marker can label new register events since the previous visit without becoming a truth store or notification system.

**GOLD MATRIX:** real BRREG source audit on TOMRA, EQUINOR, TELENOR, DNB, KONGSBERG, HYDRO, ORKLA, MOWI, STOREBRAND and AKER BP; dedicated desktop 1440 + mobile 390 public-first browser proof; real open-source liveness for BRREG/first-party, CORDIS, TED and Climate TRACE.

**HUMAN SUCCESS:** the free profile is useful without private data: exact identity, inspectable evidence, material public facts, change context, bounded signals, source tools and explicit unknowns can be navigated without reading a giant AI report.

**FOUR-STATE AUTHORITY:** affected product = 4BRANDS. LIVE = https://4brands.org/ and remains existing production/readback state. HEIR = sole king/test exact candidate. Historical BRAND OS and other donors remain read-only. No new BRAIN, company DB, design-system master or control plane is created.

**RELEASE:** HEIR only. Production/custom-domain promotion remains exact-artifact Founder-gated after independent Gold. Passing CI, preview or merge is not LIVE authority.

---

# HOMEPAGE BRAND RESET — HUMAN CRAFT CONTRACT CORRECTION — 06 OCT 2026

**STATUS:** HEIR QA CONTRACT CORRECTION · PRODUCT SOURCE UNCHANGED · NO LIVE RELEASE.

The first exact-sha Human Craft run failed because its homepage test still required the previous hero links `WHY 4PLANET` and `OPEN ATLAS` and the previous WHY/lens headings. Founder direction in the immediately preceding product commit changed that hierarchy to `EXPLORE THE PLANET` + `JOIN US`, a white human-life premise, an embedded shared ATLAS, the revised four-lens headline, one Orca visual encounter, the preserved four Domain worlds and a four-image asymmetric IMPACT action gallery.

This correction updates the existing Human Craft regression contract to protect the current Founder-approved hierarchy. It additionally asserts the embedded shared ATLAS, four lens entries, Orca encounter, four Domain worlds, four IMPACT entries and the visible “NOT YET OPEN FOR PUBLIC SUPPORT” boundary. Existing navigation, overflow and mobile Domain-width checks remain.

**PRODUCT CODE:** unchanged from `67f93a9c7a3548a30af869cca6586b2b5fb0ccdb`.

**OBSERVED SEPARATE CONVERGENCE DEBT:** the ONE INTERFACE bundle gate was already failing before this homepage change because the largest JS chunk exceeded the historical 1,800,000-byte threshold. Previous HEIR b833973: 1,922,585 bytes. Homepage-reset candidate 67f93a9: 1,913,134 bytes. The homepage reset therefore reduced the largest JS chunk by 9,451 bytes and did not create that blocker. No unrelated bundle threshold or architecture is changed here.

**ROLLBACK:** exact parent `67f93a9c7a3548a30af869cca6586b2b5fb0ccdb`.

---

# 4PLANET HOMEPAGE BRAND RESET — 06 OCT 2026

**STATUS:** HEIR-ONLY FOUNDER-DIRECTED BRAND / EDITORIAL REFACTOR · NO LIVE RELEASE.

**FOUNDER INTENT / HUMAN VALUE:** make the 4PLANET front door feel unmistakably 4PLANET: calm, elegant, intelligent, cinematic where earned, documentary-life-first and immediately useful — while preserving the working product architecture and showing visitors that they can move from understanding into real action pathways.

**USER ARRIVES BECAUSE:** a first-time visitor wants to understand what 4PLANET is, feel why it matters, explore the living planet and discover a credible way to go deeper or take part.

**ONE THING TO UNDERSTAND:** 4PLANET connects one living planet through shared intelligence, distinct lenses, living worlds and evidence-aware pathways from understanding toward action.

**PRIMARY ACTION:** EXPLORE THE PLANET → existing shared ATLAS.

**SECONDARY ACTION:** JOIN US → existing /join route.

**P1 DOMINANT:** cinematic Earth encounter with “4PLANET_ For a Living Planet” and “Everything you love is connected.” The underscore is the separator; no dot/dash is inserted after it.

**P2 ORIENTATION:** calm white premise → live shared ATLAS → “ONE PLANET_ FOUR LENSES” index using 01_ ATLAS / 02_ SPECIES / 03_ LIVING SYSTEMS / 04_ IMPACT.

**P3 LIFE / WORLD:** one bounded visual Orca encounter only, then the four existing large immersive Domain worlds. No second Orca story is added.

**P4 ACTION / PROOF:** retain all four existing IMPACT images and pathways, but change the homepage presentation from a competing dark 2×2 world grid to a white asymmetric editorial action gallery: one leading action plus three smaller visual entries. Truth-status wording remains visible; public support is not implied open.

**CLOSE / BELONGING:** one quiet WHAT WE BELIEVE + JOIN section. 4PEOPLE / 4BRANDS / 4PARTNERS / 4FUNDERS remain in the existing footer rather than becoming another four-item homepage module.

**DELETE / SIMPLIFY:** remove the giant blue WHY colour wall, the early separate black beliefs wall, the five-step process block and the standalone four-actor TAKE PART grid from the homepage. Do not delete their routes or product capabilities.

**REUSE:** existing PublicShell/header/footer, routes, identity/auth, shared ATLAS renderer/runtime, existing image registry, current Domain media, existing IMPACT_UNITS/data/statuses, About/Beliefs/Join routes. No new map engine, auth system, data store, content truth store or product architecture.

**TYPOGRAPHY / BRAND:** Instrument Sans remains display type but uses restrained scale and medium/regular visual weight; authority comes from spacing, composition, imagery and hierarchy. Homepage secondary copy uses a bounded local dim hierarchy rather than changing global product tokens. Brand-blue + white capsule CTAs are used for homepage primary actions. Large Domain imagery stays immersive. Paper/white becomes the dominant connective surface.

**TRUTH BOUNDARY:** IMPACT delivery states remain prototype/pathway states; contribution/payment ≠ delivery ≠ outcome ≠ verified impact. The homepage does not invent partner, outcome or availability claims. ATLAS iframe is the existing first-party /atlas renderer with embed mode, not a second map.

**MOBILE-FIRST RISK:** hero CTAs stack; live ATLAS receives a bounded 520px mobile frame; lens index becomes one column; Domain worlds become one column; IMPACT preserves one featured card followed by the remaining three rather than a cramped four-up grid.

**HUMAN SUCCESS:** within the first journey a visitor can (1) recognise 4PLANET, (2) understand the premise, (3) interact with ATLAS, (4) understand the four lenses, (5) encounter real life, (6) enter a Domain world, (7) see concrete action pathways and their honest state, and (8) join — without experiencing repeated giant four-card systems or generic SaaS hierarchy.

**FOUR-STATE AUTHORITY:** affected product = 4PLANET homepage. LIVE = https://4planet.org/ exact registry source c78f3b9814e823fdaa9167ccc784d2a88283215d. HEIR = sole king/test at the exact parent of this commit, review path https://test.4planet.org/. SANDBOX = NONE. ARCHIVED/donor material remains read-only. Legal write target = HEIR. Rollback identity = exact parent SHA of this commit. No production promotion is authorised.

**DOOR CLASS:** reversible HEIR visual/editorial refactor. LIVE remains a separate one-way exact-artifact Founder release.

**ACCEPTANCE REQUIRED:** exact-head product-authority + Gold policy + typecheck + production build + relevant browser/mobile visual proof. Technical pass is not Founder Human Gold.

---

# HUMAN-FIRST DISCOVERY — MASTER GOLD BROWSER MATRIX — 05 OCT 2026

**STATUS:** EXISTING QA MATRIX EXTENSION / HEIR ONLY.

**DELTA:** add one bounded Playwright proof for the three Discovery Master Gold routes to the existing VALUE CONVERGENCE browser gate. No new workflow, branch, control plane or deployment surface is created.

**MATRIX:** Chromium desktop 1440 + mobile 390 and WebKit desktop + mobile 390, inherited from the existing convergence workflow.

**ASSERTIONS:** HTTP 200; expected human-first H1/boundary copy; noindex; no horizontal overflow; no undefined/NaN; no fatal page errors; screenshots retained by the existing evidence path.

**KNOWN UNRELATED DEBT:** the separate legacy Species/Lens workflow currently expects the superseded literal `4PLANET SPECIES_` on the existing Orca renderer. This sprint did not change that public renderer and does not treat that locator mismatch as Master Gold failure.

---

# HUMAN-FIRST DISCOVERY OBJECTS — WORLD CLASS 01 — 05 OCT 2026

**STATUS:** HEIR / CONTROLLED MASTER GOLD / NOINDEX / NO LIVE RELEASE.

**FOUNDER LAW:** HUMAN FIRST. PREMIUM. CALM. VISUAL. USEFUL. TRUSTWORTHY. MEMORABLE. Search/AI structure stays behind the visible experience.

**DEMAND MAP:** 120 credible opportunity objects are prioritised in one durable discovery asset. Exact keyword volume is not fabricated: no Search Console property is connected, HYPD keyword research is plan-locked and Bing demand data is not configured. Relative demand bands remain hypotheses until hard query data is available.

**TOP 10 PILOTS:** Global Fires; Orca; Great Barrier Reef; Polar Bear; Amazon Basin; Whales; Sea Ice; Coral Bleaching; Tiger; Serengeti.

**MASTER GOLD 01–03:** Orca / Great Barrier Reef / Global Fires. These intentionally stress three different object classes while reading existing canonical Species, PlanetProof, Place and ATLAS data rather than creating parallel truth stores.

**DESIGN STANDARD:** Orca uses existing cleared documentary media; Great Barrier Reef uses the canonical COR4L_ media bank explicitly recorded as founder-supplied, rights-cleared and content-verified; Global Fires uses a designed signal field explicitly disclosed as not-live/non-evidentiary. Shared source, boundary and next-object modules do not force visual sameness.

**TRUTH / RELEASE:** these routes are controlled `/labs/gold/discovery/*` proofs with `noindex,nofollow,noarchive,nosnippet`. No production publication, social send, email send, IndexNow or Search Console submission is authorised.

**ACCEPTANCE:** typecheck + production build + full smoke including `discovery-world-class-contract` + product authority + Gold policy + immutable preview/browser QA. Human Gold remains a judgement gate; passing code is necessary but not sufficient.

---

# WHAT WE BELIEVE — CANON 2.0 PUBLIC SYNC — 05 OCT 2026

**STATUS:** HEIR PRODUCT CANDIDATE / EXACT CANON PROJECTION / FOUNDER REQUESTED LIVE RELEASE / RELEASE GATES REQUIRED.

## USER ARRIVES BECAUSE
A person wants to understand what 4PLANET stands for, why it exists and whether the organisation's claims about purpose can be inspected rather than inferred.

## ONE THING TO UNDERSTAND
4PLANET has one moral core and one value system. The public page is a projection of the canonical WHAT WE BELIEVE Founder Thesis, not a separate marketing value set.

## PRIMARY ACTION
Read /about/what-we-believe; from the homepage, follow the WHAT WE BELIEVE entry.

## SECONDARY DEPTH
Continue into Impact for proof, the System for architecture, Join for participation, or the Founder for origin.

## P1 DOMINANT
“We believe the future can be better.” Purpose = FOR A LIVING PLANET. Ambition = BETTER. FOR EVERYONE.

## P2 ORIENTATION
Four foundational beliefs plus seven values: CARE DEEPLY; TRUTH FIRST; EVERYONE HAS A PART TO PLAY; BE USEFUL; MAKE IT REAL; USE POWER FOR GOOD; LEAVE IT BETTER.

## P3 ACTION / NEXT
SEE IMPACT, SEE THE SYSTEM, or FIND YOUR PART. No duplicate values product or campaign funnel.

## P4 DEPTH
Brand law = DO GOOD → PROVE IT → LET PEOPLE TELL THE STORY. Public copy stays shorter than internal Canon while preserving meaning.

## WHAT CAN BE REMOVED
The superseded six-belief public draft and any suggestion that public beliefs are a second moral system.

## WHAT MUST BE REUSED
Existing About architecture, PublicShell, 4PLANET tokens, Impact/System/Join routes and the BRAIN authority ODDEKALV_ FOUNDER THESIS — WHAT WE BELIEVE — LOCKED CANON 2.0.

## TRUTH BOUNDARY
Publishing values does not prove that 4PLANET lives them. Product behaviour, evidence, Impact/Reports, correction and outcomes must provide proof. Do not describe 4PLANET as “a force for good” as a self-certified fact.

## MOBILE-FIRST RISK
Seven value rows and the homepage belief signature must stack cleanly at 390/430 without overflow; long headings must wrap without obscuring explanatory copy.

## HUMAN SUCCESS
A first-time visitor can explain 4PLANET's purpose, ambition and values, and can find both a proof path and a participation path.

**FOUNDER RELEASE CONTEXT:** Founder explicitly stated on 05 Oct 2026 that “nå må vi få dette ut live”. Production promotion remains exact-artifact and gate-controlled; this brief does not bypass QA.

---

# WHAT WE BELIEVE — VALUES + PUBLIC BELIEFS v1.0 — 04 OCT 2026

**STATUS:** HEIR CANDIDATE / PUBLIC ABOUT STORY / NOT LIVE / VALUES WORKING v1.0 / FOUNDER RED-TEAM PENDING.

## USER ARRIVES BECAUSE
A person wants to understand why 4PLANET exists, what it stands for and what kind of organisation it is trying to become.

## ONE THING TO UNDERSTAND
4PLANET has one moral core with two expressions: internal operating values and public beliefs. They may use different language but may never contradict one another.

## PRIMARY ACTION
Open `/about/what-we-believe` and understand the purpose and beliefs before moving deeper into the system.

## SECONDARY DEPTH
Continue into The Story, The System, The Founder or Impact to inspect how the stated beliefs connect to products, evidence and action.

## P1 DOMINANT
“We believe the future can be better.” The page must communicate constructive purpose before organisational detail.

## P2 ORIENTATION
People, animals, nature and future generations belong to the same living-planet frame. Economic strength is presented as a means to independence, durability and scale rather than the primary purpose.

## P3 ACTION / NEXT
See the System or inspect Impact. Do not add a competing campaign CTA or separate values product.

## P4 DEPTH
Six public beliefs: LIFE MATTERS; TRUTH MATTERS; BETTER SHOULD BE FOR EVERYONE; POWER SHOULD BE USED FOR GOOD; ACTION MATTERS; THE FUTURE CAN BE BETTER.

## WHAT CAN BE REMOVED
Generic corporate-values language, self-congratulation, unsupported “good company” claims and any duplicate Story/System/Founder content.

## WHAT MUST BE REUSED
Existing About architecture, PublicShell, 4PLANET visual tokens, The Story, The System, The Founder, existing Impact route and the BRAIN Founder Thesis “ODDEKALV_ FOUNDER THESIS — WHAT WE BELIEVE — v1.0”.

## TRUTH BOUNDARY
4PLANET does not claim that stating benevolent beliefs proves benevolent impact. Trust is to be earned through truthful products, visible action, evidence, correction and demonstrated usefulness. Values 1.0 remain open to Founder red-team before LOCKED CANON.

## MOBILE-FIRST RISK
Four-item About subnavigation and six belief rows must wrap without horizontal overflow. Belief rows collapse to a two-column mobile hierarchy with explanatory text beneath the title.

## HUMAN SUCCESS
A first-time visitor can explain, in plain language, why 4PLANET exists, what it believes, why economic strength matters and how those claims are meant to be proved — without confusing this page with The Story, The System or The Founder.

**CANON / BRAIN:** one source, two expressions. Website copy is a public projection of the working Founder Thesis, not a parallel values authority.

**RELEASE:** HEIR only. No production publication or Founder Release is inferred by this commit.

---

# COMPANY GOLD 01A — TONY'S REVIEW ROUTE ON CURRENT HEIR — 03 OCT 2026

**STATUS:** HEIR / INTERNAL NOINDEX / NOT HUMAN GOLD / NO LIVE.

**USER ARRIVES BECAUSE:** a reviewer needs the existing Tony's company → product → material drawer, which was on HEIR as a file and not routed.

**ONE THING TO UNDERSTAND:** company-level cocoa traceability is not this retail bar's cooperative, farm or batch. That stays UNKNOWN.

**PRIMARY ACTION:** open `/labs/company-gold/tonys`.

**SECONDARY DEPTH:** named first-party sources and the next evidence decision.

**P1 DOMINANT:** Milk Chocolate 32% 180g, EAN 8717677339914, with UNKNOWN beside it.

**P2 ORIENTATION:** source-backed versus unknown.

**P3 ACTION:** open the named sources.

**P4 DEPTH:** materials, rights, next evidence decision.

**WHAT CAN BE REMOVED:** no second company model.

**WHAT MUST BE REUSED:** existing `TONYS_COMPANY_GOLD` and `CompanyGoldTony`.

**TRUTH BOUNDARY:** Tony's pages are SOURCE TERMS / REFERENCE ONLY. Not an ecological outcome and not business advice.

**MOBILE-FIRST RISK:** cards stack at 390 and 430. No horizontal overflow.

**HUMAN SUCCESS:** desktop and mobile render the same object, robots `noindex,nofollow,noarchive`.

**DELTA:** forward-port of the accepted route and route→same-object noindex regression onto `king/test` `4fcbd7a1`. The prior brief block from `0810f28` was not copied. Prior QA_ACCEPT is lineage only.

---

# ATLAS GOOGLE SEARCH DISCOVERY CLOSURE 01 — 02 OCT 2026

**STATUS:** HEIR CANDIDATE / SEARCH-INDEXABLE SOURCE ARTIFACT / NO GOOGLE INDEX CLAIM.

**FOUNDER DIRECTION:** "Kan du gjøre atlas søkbar i Google nå?" The bounded objective is to make the existing public ATLAS technically discoverable and legible to Google without creating a second ATLAS or SEO content farm.

**OBSERVED EXTERNAL STATE:** fresh web search for `"4PLANET Atlas" 4planetatlas.com`, `site:4planetatlas.com` and `site:4planet.org/atlas 4PLANET` returned no 4PLANET ATLAS result. This is evidence of absent/very weak current search visibility, not a complete Google index export.

**ROOT CAUSE FOUND:** the actual public `/atlas` route renders `PublicWorld` without route-specific `Seo` metadata. The source build has `/atlas` in the 4planet.org sitemap and allows Googlebot, but the raw `/atlas` HTML is otherwise the generic SPA shell and no ATLAS-specific prerender exists. This weakens title/description/entity/canonical/content signals.

**BOUNDED FIX:**
- add explicit runtime ATLAS title, description, canonical path, OG/Twitter metadata and WebApplication JSON-LD to `PublicWorld`;
- add a raw HTML prerender for `/atlas` with a visible H1, product description, source names, truth boundary and crawlable links to Places, Species and Living Systems;
- add the ATLAS prerender to the normal production build;
- add a deterministic search-discovery contract to smoke tests;
- keep existing `/atlas` sitemap entry and Googlebot allow policy.

**PRIMARY INDEX URL:** `https://4planet.org/atlas` remains the source-controlled canonical target in this slice. The separate `4planetatlas.com` host exists in analytics but its edge/DNS routing is outside this repository and cannot be independently HTTP-read from the current runtime; do not invent a canonical-host migration without verified routing.

**TRUTH BOUNDARY:** this makes ATLAS crawlable/indexable and materially more legible to Google. It does NOT guarantee Google will index or rank it. Google controls crawling/index selection. Search Console URL Inspection / Request Indexing can accelerate a single-page recrawl after LIVE; the currently available Search Console connector is read-only.

**ACCEPTANCE:** exact HEIR SHA must pass ATLAS search contract, typecheck, production build, smoke/contracts, Gold/product authority and immutable Cloudflare preview. LIVE custom-domain promotion remains an exact-artifact Founder gate.

---

# DISCOVERY + TRAFFIC GROWTH — PHASE 03 EXISTING-ATLAS PLACE EXPANSION — 02 OCT 2026

**STATUS:** HEIR CANDIDATE / NO PHASE-03 LIVE AUTHORITY.

**OBJECTIVE:** compound public discovery by promoting source-qualified discovery objects for five Places that already exist in the shared ATLAS registry: Amazon Basin, Congo Basin, Borneo, Svalbard and Oslofjord. No new Place engine, map renderer, truth store or geocoder is created.

**GRAPH:** Amazon Basin → Jaguar; Congo Basin → Chimpanzee + Eastern Gorilla; Borneo → Bornean Orangutan; Svalbard → Polar Bear + Humpback Whale + Blue Whale; Oslofjord → Atlantic Cod + Blue Mussel.

**SOURCE BOUNDARY:** Amazon/Congo/Borneo use public WWF ecological/species material for bounded discovery context; Svalbard uses Norwegian Polar Institute + Governor of Svalbard; Oslofjord uses current Norwegian Government and Environment Agency evidence. Monitoring samples, protected-area rules, source-published population estimates and occurrence records retain their distinct semantics.

**PUBLICATION LAW:** no basin/island/fjord object claims one universal protected-area percentage where jurisdictions/designations differ. Navigation bboxes remain navigation only. Species relationships mean documented ecological/geographic relevance, never current individual presence or complete distribution.

**ACCEPTANCE:** exact HEIR SHA must pass build, full smoke/discovery contracts, authority/Gold and immutable preview/browser gates. No production promotion, IndexNow submission, social schedule or email send is authorised by this phase.

---

# DISCOVERY + TRAFFIC GROWTH — PHASE 02 GLOBAL GRAPH EXPANSION — 02 OCT 2026

**STATUS:** HEIR CANDIDATE / NO PHASE-02 LIVE AUTHORITY.

**FOUNDER DIRECTION:** continue production immediately after Sprint 01 LIVE release. This phase remains HEIR-only until a new exact-artifact Founder release.

**P1 USER VALUE:** a person can enter 4PLANET through five source-qualified Places — Kenya, Serengeti, Costa Rica, Great Barrier Reef and Norway — and traverse real crawlable Place ↔ Species relationships into ATLAS and source evidence.

**SPECIES INVENTORY:** close the controlled first inventory from 20/25 to 25/25 curated objects by adding Leopard, Eastern Gorilla, Chimpanzee, Bornean Orangutan and Emperor Penguin. Every added profile reuses the existing SPECIES engine and GBIF occurrence seam with a Source Envelope. Occurrence remains reported observation, never complete range, abundance, trend, residency or live location.

**EASTERN GORILLA PROVIDER MIGRATION:** retain legacy numeric GBIF Backbone key `7262070` only for the current occurrence-adapter contract while documenting that current GBIF web taxonomy presents accepted `Gorilla beringei` under Catalogue-of-Life identifier `3H3C3`. Provider ID migration must be deliberate and tested; the system must not silently rebind identity.

**PLACE INVENTORY:** add source-qualified public candidates for Serengeti and Costa Rica to the existing ATLAS Place registry and promote existing Norway / Great Barrier Reef registry objects into discovery inventory. Navigation bounding boxes are explicitly not official legal/ecological boundaries.

**SOURCE SET:** IUCN SSC Cat Specialist Group (Leopard); current GBIF + WWF subspecies context (Eastern Gorilla); WWF (Chimpanzee, Bornean Orangutan); British Antarctic Survey + U.S. Fish & Wildlife Service (Emperor Penguin); UNESCO + Protected Planet + GBIF Tanzania (Serengeti); SINAC + CBD (Costa Rica); Great Barrier Reef Marine Park Authority + AIMS + UNESCO (Great Barrier Reef); CBD Norway + Artsdatabanken + Miljødirektoratet (Norway).

**GRAPH / MACHINE READABILITY:** Place WebPage schema uses `citation` for provenance instead of incorrectly declaring source URLs as Place `sameAs`. Raw prerendered HTML carries related-species links; Species routes expose qualifying related Places; index pages use ItemList JSON-LD.

**TRUTH BOUNDARIES:** draft CBD country profiles remain labelled draft; AIMS survey results are survey-bounded; Artskart/GBIF points are observations; World Heritage/national/protected-area designations and areas are not collapsed; species/global status never becomes a local-population diagnosis.

**ACCEPTANCE:** exact HEIR SHA must pass typecheck, production build, full smoke/discovery contracts, product authority, Gold policy and immutable Pages/browser proof. No Phase-02 production release, search submission, social send or email send is authorised by this section.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — GLOBAL SPECIES BATCH 20 — 01 OCT 2026

**STATUS:** HEIR CANDIDATE / NO LIVE PROMOTION / EXACT-SHA QA REQUIRED.

**DELTA:** promote seven source-qualified, high-interest species into the existing curated SPECIES engine: Blue Whale, Asian Elephant, Tiger, Polar Bear, Giant Panda, Whale Shark and Green Turtle. Together with the prior 13, the controlled discovery inventory now contains 20 indexable curated species out of 25 candidates.

**SOURCE BOUNDARY:** NOAA Fisheries supplies Blue Whale and Green Turtle context; U.S. Fish & Wildlife Service supplies Asian Elephant, Polar Bear and Giant Panda context; IUCN SSC Cat Specialist Group supplies Tiger context; Convention on Migratory Species supplies Whale Shark context. GBIF numeric keys remain the existing engine's taxon/occurrence identifiers. Provider taxonomy changes are a refresh concern, not permission to silently rebind identity.

**OCCURRENCE LAW:** every added species reuses the shared GBIF occurrence seam. A reported occurrence is not complete range, abundance, trend, residency, population condition or live position. Green Turtle regulatory status stays population-segment-aware rather than being collapsed into one global label.

**QUALITY GATE:** Leopard, Eastern Gorilla, Chimpanzee, Bornean Orangutan and Emperor Penguin remain BUILD_NEXT/noindex instead of being promoted without the same source and product closure.

**ACCEPTANCE:** exact-head typecheck + production build + full smoke/discovery contracts + authority/Gold policy + browser/preview proof. No custom-domain promotion without exact-artifact Founder release.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — OWNED RETURN QA CORRECTION — 01 OCT 2026

**STATUS:** HEIR CONTROL CORRECTION / NO EXTERNAL SEND.

**DELTA:** correct the owned-return privacy contract so it forbids an `email` analytics parameter rather than falsely matching the event name `email_signup`. Remove `/signal` from the discovery sitemap because its page-level contract is deliberately `noindex,follow`.

**TRUTH:** PLANET SIGNAL remains a consented return/acquisition surface, not an SEO inventory object. No subscriber email, raw query string or raw referrer URL is added to analytics.

**ACCEPTANCE:** exact-head typecheck + build + smoke + discovery contracts + authority/Gold policy.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — PLANET SIGNAL TYPECHECK FIX — 01 OCT 2026

**STATUS:** HEIR CONTROL CORRECTION / NO EXTERNAL SEND.

**DELTA:** replace one invalid presentation-only `T.body` reference in the PLANET SIGNAL email input with the existing public body-font stack. Consent, Resend writes, analytics and routing are unchanged.

**ACCEPTANCE:** exact-head typecheck + build + smoke + owned-return contract.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — OWNED RETURN + DISTRIBUTION CLOSURE — 01 OCT 2026

**STATUS:** HEIR CANDIDATE / UNSENT / LIVE CONFIG UNTOUCHED.

**PLANET SIGNAL:** add `/signal` plus `/api/planet-signal`. Explicit consent creates/updates the one Resend Contact, adds the dedicated PLANET SIGNAL Segment and sets the opt-out-by-default PLANET SIGNAL Topic to `opt_in`. No local subscriber database and no automatic welcome email. Missing `RESEND_API_KEY` fails closed; the UI does not claim collection.

**MEASUREMENT:** successful signup emits only bounded `email_signup` metadata; the submitted email is not sent to analytics.

**DISTRIBUTION:** production-ready MAGAZINE queue, Kenya social copy/storyboard, PLANET SIGNAL issue queue and P2 4SAPIEN/4BRANDS readiness are internal assets only. P4nther remains the only Metricool brand discovered; no content is scheduled there.

**CLOUDFLARE ANALYTICS BLOCKER:** current repository workflow is production-connected and still omits `4brands.org`. Its mutation was deliberately not included in this HEIR product commit because changing/dispatching a production-linked workflow is a separate Founder-gated infrastructure action.

**ACCEPTANCE:** typecheck + build + smoke + owned-return contract + product authority/Gold policy. External social/email publication, IndexNow submission, Cloudflare analytics mutation and custom-domain promotion remain Founder-gated.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — INDEXNOW KEY CONTROL FIX — 01 OCT 2026

**STATUS:** HEIR / CONTROL CORRECTION / NO EXTERNAL SUBMISSION.

**DELTA:** normalise the public IndexNow ownership-key file to the exact key text with no literal escape characters. This change exists solely to satisfy the ownership-file contract and is paired with this Gold receipt in the same bounded change.

**TRUTH / RELEASE:** the key file alone does not notify a search engine or claim indexing. The submission script remains founder-gated behind `FOUNDER_INDEXNOW_RELEASE=ENIG_INDEXNOW`.

**ACCEPTANCE:** discovery contract + smoke + product authority + Gold policy on exact SHA.

---

# 4SAPIEN FOOD FIRST PROVEN VALUE LOOP 02 — 01 OCT 2026

**STATUS:** TECHNICAL LIVE CLOSURE VERIFIED / 4SAPIEN.COM LIVE / EMBLA V11 ACTIVE / HUMAN GOLD OPEN.

**BOUNDED PRODUCT DELTA:** existing 4PLANET ID + existing owner-RLS `four_sapien_embla_memories` carry the FOOD pantry loop through explicit save/readback/supersession/delete and return reuse. Existing `four_sapien_decisions` stores an explicit private meal-choice state without claiming the meal was cooked or useful. Existing `four_sapien_embla_events` receives only bounded stage/timing/count metadata. Ingredient names, pantry contents, prompts and free text are excluded from value-loop analytics.

**EMBLA LIVE SEAM:** production `embla-core-preview` is ACTIVE v11, hash `e94fe409d9b79f6cbef70954434e747d2ed705477d44b4c86cba7dac5ca5da1b`. The released delta changed only the existing `read_pantry` tool from `PANTRY_SCHEMA_NOT_IMPLEMENTED` to reading the same active user-confirmed `food_pantry_v1` Person memory under the caller's authenticated RLS context. Existing Brain reuse and Human Utility measurement events are preserved. The prior v10 runtime is the bounded rollback reference.

**LIVE PRODUCT PROOF:** canonical 4SAPIEN was released through the existing Founder-authorised bounded LIVE workflow to the existing `four-sapien-embla` Worker. Exact live source is `edcf5b6bf75a6b6f9436ab68105700dfe0c90c1a`. GitHub Actions run `36888848059` passed HEIR intent, materialisation, zero-loss/pantry gates, desktop + mobile pre-deploy first-return proof, existing Worker authority, production deploy, and physical desktop + mobile readback at `https://4sapien.com`. The live browser gate was hardened to cache-bust the just-deployed HTML after the first post-deploy run exposed a transient stale-cache desktop mismatch; the hardened exact run passed 2/2 live browser projects.

**MEASUREMENT:** bounded recruitment attribution accepts only `src=human_utility` → `human_utility_recruitment`, otherwise `direct_or_unknown`. The measured path separates identity, activation, first value, saved context, return, second value, saved decision and explicit useful outcome. The explicit useful/not-yet signal uses the existing `measurement_useful_outcome` Human Utility path; no second measurement truth system exists. Synthetic and Founder sessions never count as real-user or return proof.

**TRUTH BOUNDARY:** current deterministic meal examples remain `DEMO_FIXTURE_NOT_VERIFIED`. Missing price/amount/context stays UNKNOWN. Purchased is not consumed. A saved choice is not a cooked meal, useful outcome, payment or ecological result.

**CURRENT REAL-USER STATE:** production readback after release still shows 0 active `food_pantry_v1` rows/users, 0 FOOD decisions/users, 0 `measurement_useful_outcome` events/users and 0 `food_second_value_reached` events/users. Technical LIVE closure is therefore complete; Human Gold, independently attributable real return/value, NOK 100/month WTP/payment proof and source-grounded production recipe donors remain open.

**NEXT GATE:** recruit the existing 6–8 consenting Human Utility testers through the already-defined bounded protocol, then separate first-use utility, actual return, WTP and payment evidence. External outreach remains a distinct Founder-release action; this technical LIVE release does not fabricate or substitute Human Gold.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — DISTRIBUTION + MEASUREMENT SEAM — 01 OCT 2026

**STATUS:** HEIR CANDIDATE / UNSENT / NO LIVE PROMOTION.

**MEASUREMENT:** add one consent-bound, once-per-session `discovery_entry` classification for ChatGPT, Perplexity, Google, Bing, Instagram, Facebook, LinkedIn, email, direct and bounded other-referral. Raw query strings and raw referrer URLs are never emitted.

**INDEXNOW:** host-verification key + submission script are prepared. The script refuses execution unless `FOUNDER_INDEXNOW_RELEASE=ENIG_INDEXNOW` and the target origin is exactly `https://4planet.org`. Only indexable discovery inventory routes are submitted. This is release preparation, not a claim of indexing, crawl, ranking or traffic.

**EMAIL:** PLANET SIGNAL is created as a draft in the existing Resend account. Draft creation is internal preparation only; it is not published and no subscriber email has been sent.

**ACCEPTANCE:** exact-head typecheck/build/smoke/discovery contracts. IndexNow invocation and any external email remain Founder-gated actions.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — KENYA SPECIES GRAPH CLOSURE — 01 OCT 2026

**STATUS:** HEIR CANDIDATE / NO LIVE PROMOTION / EXACT-SHA QA REQUIRED.

**DELTA:** African Savanna Elephant (`Loxodonta africana`, GBIF 2435350), Lion (`Panthera leo`, GBIF 5219404) and Cheetah (`Acinonyx jubatus`, GBIF 2435270) are promoted from BUILD_NEXT into curated SPECIES objects. Each receives bounded source claims and a Source Envelope. The existing SPECIES page machinery supplies ATLAS embedding and GBIF occurrence retrieval; occurrence records remain reports of observations, never range, abundance, residency or live tracking.

**KENYA GRAPH:** `/place/kenya` now links to these three SPECIES objects. Discovery inventory increases from 10 to 13 indexable species while total candidate inventory remains 25. Sitemap and raw discovery prerender automatically follow the controlled inventory.

**SOURCE SET:** GBIF; Kenya Wildlife Service (Amboseli, lion recovery/action plan, 2026 lion census statement, historical cheetah strategy); U.S. Fish & Wildlife Service African Elephant; IUCN SSC Cat Specialist Group; Convention on Migratory Species. Historical Kenya cheetah sighting material is explicitly bounded as historical and non-residency evidence.

**ACCEPTANCE:** typecheck + production build + discovery/smoke contracts + product authority + TEST KING/browser proof on exact candidate. No custom-domain promotion without Founder exact-artifact release.

---

# DISCOVERY + TRAFFIC GROWTH SPRINT 01 — P0 DISCOVERY HEIR SLICE — 01 OCT 2026

**STATUS:** HEIR CANDIDATE / NO LIVE PROMOTION / EXACT-SHA QA REQUIRED.

**AUTHORITY:** one atomic product write to current `king/test` sole HEIR. No new branch, candidate class, truth store, Species engine or Atlas renderer is created.

**FOUNDER NORTH STAR:** UNKNOWN PERSON → SEARCH / AI / SOCIAL / EDITORIAL DISCOVERY → USEFUL PUBLIC OBJECT → PRODUCT EXPLORATION → RETURN → LEARNING.

**BOUNDED DELTA:** reusable Place routes + Kenya Gold candidate; 25-Species production inventory with only 10 existing curated profiles indexable; discovery-derived sitemap; raw HTML discovery prerender; runtime Species SEO/noindex threshold; explicit Search/AI crawler policy; non-production host noindex; and production GA4 isolation from TEST KING.

**KENYA TRUTH BOUNDARY:** KWS, CBD, GBIF and Protected Planet remain named sources. CBD marks its Kenya profile text as draft. The ATLAS bbox is navigation geometry only. KWS land-coverage and Protected Planet area-count measures remain separate.

**SPECIES TRUTH BOUNDARY:** occurrence records remain reported observations, not range, abundance, trend, population status or live location. BUILD_NEXT inventory is not publication approval.

**ACCEPTANCE:** typecheck + production build + discovery contract + existing smoke/contracts + rendered HEIR browser verification. Public custom-domain promotion requires a separate exact-artifact Founder release after Gold.

---

# MULTI-PRODUCT VALUE CONVERGENCE FINAL INTEGRATION + LIVE CLOSURE 02 — 28 SEP 2026

**STATUS:** HEIR CANDIDATE / EXACT-SHA VERIFICATION REQUIRED / NO LIVE CLAIM FROM SOURCE ALONE.

**AUTHORITY:** one atomic product write to the existing `king/test` sole HEIR. PR #347 / PR #345 are read-only donor provenance after this convergence; no new candidate class, second HEIR, parallel BRAIN, auth system, memory store or company database is created.

**FOUNDER DIRECTION:** converge the already-tested universal identity, Person memory, Company Brain, ATLAS/SPECIES and measurement improvements onto fresh HEIR, preserve all newer `king/test` work, verify the exact merged SHA, then promote only the verified artifact to existing authorised 4PLANET-owned live surfaces.

**BOUNDED USER VALUE:**
- 4PLANET ID client trusted-host parity now covers the same priority cross-product destinations accepted by the active server bridge, including 4PLANET, 4SAPIEN/S4PIENS, 4BRANDS, ATLAS, SPECIES, Labs and 4BRAIN.
- 4SAPIEN FOOD pantry reuses the existing private Person memory table under canonical 4PLANET ID. Persistence is explicit-consent only, requires server write/readback, supports supersession and deletion, and restores user-confirmed pantry context on return. Anonymous edits remain session-only.
- 4BRANDS keeps the existing Company Brain architecture. Versioned migrations make workspace owner-membership creation idempotent and permit only member-scoped authenticated audit writes for canonical Company Brain save/analysis actions.
- ATLAS and SPECIES keep the existing canonical context/return mechanisms; this change adds privacy-safe value-path instrumentation rather than a new router or camera authority.
- Existing consented analytics gains signup/login, Person-memory return value, Company Brain creation/value actions, ATLAS context opens, SPECIES/source opens and cross-product navigation. Free text and precise location are not added to analytics.

**DATABASE READBACK:** active `4Planet_ OS` has two auth users matched to two canonical profiles and two 4SAPIEN profiles. RLS readback shows the second sampled user can see its own canonical profile but zero of the first user's Person memories, Company workspaces or memberships. The two Company Brain audit policies are active. Prior transactional tests proved Person-memory write/readback/supersede/delete and Company Brain workspace → twin → metric → opportunity → decision → intervention → measured result → learning → audit, with rollback and zero synthetic value records retained.

**EXTERNAL BLOCKER / TRUTH BOUNDARY:** model-backed Embla / Brain turns are NOT VERIFIED while the configured upstream model account returns HTTP 429 `credit_balance_exhausted`. No conversational PLANETBRAIN Gold claim is permitted from this change.

**ACCEPTANCE:** exact HEIR SHA must pass typecheck, production build, full smoke/contracts, Chromium desktop + 390px mobile, WebKit desktop + 390px mobile, plus existing ATLAS/Species/pantry critical journeys. LIVE custom-domain status requires post-promotion runtime readback; a successful source commit or Pages build is not enough.

**LIVE RELEASE:** this section does not itself claim LIVE. Founder has authorised promotion only after the exact merged SHA passes the acceptance gate. Rollback is the prior immutable LIVE artifact / prior HEIR SHA.

---

# DATA VALUE CONVERGENCE 01 — SOURCE GATE RIGHTS / OPERATIONS HARDENING — 28 SEP 2026

**STATUS:** HEIR CANDIDATE / OFFICIAL TERMS VERIFIED.

Production-capable source responses now expose use boundaries directly: publisher/API, licence or rights state, commercial reuse, attribution, caching, access cost/rate where established, canonical mapping and limitations.

Verified rights/read constraints:
- Brønnøysundregistrene Enhetsregisteret: NLOD 2.0.
- GLEIF LEI Access Service: CC0 1.0.
- Climate TRACE core emissions data/metadata: CC BY 4.0; listed external and ownership sources can carry different terms and therefore remain review-gated.
- TED published procurement notices: freely reusable commercially/non-commercially unless otherwise noted; SIMAP metadata CC0.
- Stortinget Open Data: NLOD, Stortinget attribution, non-misleading presentation, 100 calls/min.
- SSB PxWebApi v2: CC BY 4.0, 30 queries/min, 800,000-cell extract limit.
- Matvaretabellen: official local caching permitted; clear source citation required. 4PLANET uses the publisher's requested 2026 citation and does not silently treat generic foods as branded-product facts.

No new Source Registry or truth store was created.

---

# DATA VALUE CONVERGENCE 01 — IMPACT / INDEPENDENT OBSERVATION + MRV RELATIONSHIP — 28 SEP 2026

**STATUS:** HEIR CANDIDATE / SOURCE CONNECTED / NO CLAIM PROMOTION.

**ACTION CONTRACT:** existing Bay of Biscay survey Action Contract now carries explicit independent evidence-source relationships. The existing OBIS adapter is attached as CONTEXT_ONLY over the existing Bay of Biscay navigation bounding box. A separate DELIVERY_LINKED independent survey-effort MRV requirement is present and truthfully remains NOT_CONNECTED.

**PRODUCT VALUE:** the IMPACT proof surface exposes the bounded OBIS source path and its limitations alongside the current survey-effort semantics. A reviewer can inspect independent ecological occurrence context without confusing it with ORCA delivery.

**PROOF PASSPORT HARDENING:** Passport VERIFIED / impact eligibility now requires a THIRD_PARTY VERIFICATION item explicitly marked IMPACT_LINKED. A third-party item marked CONTEXT_ONLY cannot increase verification depth or impact eligibility.

**TRUTH LAW:** co-location, subject similarity and independent publisher status are not a join. OBIS occurrences do not verify ORCA survey effort, population trend, ecological change or impact. ORCA evidence remains provider/partner evidence. Independent delivery MRV is still an explicit gap.

**NO DUPLICATE SYSTEM:** existing Action Contract + existing Proof Passport + existing OBIS adapter. No new MRV database or proof authority.

**ACCEPTANCE:** typecheck/build/smoke; Proof Passport negative context-only test; IMPACT independent-evidence contract; browser/public-preview gates. No physical-delivery, outcome or impact state is promoted.

---

# ATLAS MOBILE CONTEXT / NATIVE CONTROL COLLISION CLOSURE — 28 SEP 2026

**SOURCE FAILURE:** exact deployed HEIR browser proof on mobile-430 timed out because `.ctx-head` intercepted pointer events intended for MapLibre's visible native zoom-in control. 69 deployed ATLAS tests had passed before this single geometry failure.

**FIX:** no camera authority, test, MapLibre behavior or context model changed. On <=760px only while `.ctx` exists, move the existing bottom-right native navigation-control container above the maximum 72vh bottom sheet. No force-click, no hidden control, no parallel navigation UI.

**ACCEPTANCE:** contract test + full ATLAS Zero Loss deployed browser proof on exact candidate. Do not call the ATLAS gate green before that exact run passes.

---

# DATA VALUE CONVERGENCE 01 — 4NATION / SSB STATISTICAL CONTEXT — 27 SEP 2026

**STATUS:** HEIR CANDIDATE / OFFICIAL STATISTICAL DISCOVERY + DEFAULT EXTRACT / PUBLIC LIVE UNTOUCHED.

**SOURCE:** Statistics Norway PxWebApi v2. Search uses `/tables?query=...`; selected tables use `/tables/{id}` and the source-defined default/latest `/data` extract. SSB documents open access without registration, CC BY 4.0, 30 queries/minute and 800,000-cell extract limits. 4PLANET caches metadata/default extracts for fifteen minutes.

**CANONICAL OBJECT:** `statistical-table:ssb:<5-digit-table-id>`. Returned data retain table label/update/periods/dimensions plus JSON-stat2 coordinates, cell values and source status markers.

**USER LAW:** the user chooses the table. 4NATION does not silently decide which statistic proves or disproves a public policy. Default extracts are context, not causal models.

**TRUTH BOUNDARY:** null/status/confidential values stay explicit. Units, dimensions, table metadata and footnotes remain necessary context. Statistical association does not establish policy causation or measured implementation outcome.

**BEFORE → AFTER:** a 4NATION user can move from a public case to official measurable context, inspect the latest default source extract and open the original SSB table without model-generated statistics.

**NO DUPLICATE SYSTEM:** read-through shared source adapter; no statistical warehouse or parallel public-decision store.

**ACCEPTANCE:** exact-head typecheck/build/smoke incl. `nation-ssb-contract.test.mjs`, 4NATION QA/browser proof, no production release.

---

# DATA VALUE CONVERGENCE 01 — 4NATION / STORTINGET LIVE CASE DISCOVERY — 27 SEP 2026

**STATUS:** HEIR CANDIDATE / NEUTRAL SOURCE DISCOVERY / PUBLIC 4NATION RELEASE UNTOUCHED.

**AUTHORITY:** current 4NATION curated Oslofjord case remains unchanged. The live production Worker remains pinned to the previously founder-reviewed immutable artifact; this change affects the current HEIR candidate only.

**SOURCE:** Stortinget Open Data `/eksport/saker?format=JSON`, current session. Stortinget supports JSON/XML reuse without registration, requires Stortinget attribution under NLOD, and documents a 100-call/minute limit. 4PLANET caches the source session snapshot for ten minutes.

**CANONICAL OBJECT:** `public-decision:stortinget:<sakid>` retains Stortinget case ID, exact source status, case type, document group, committee, subjects, source update time and exact source-record URL.

**NEUTRALITY / TRUTH:** the finder performs bounded text filtering only. It does not rank options, infer ideology, recommend policy, assess political actors, or convert a case into adopted/implemented policy. Source status remains the authority.

**COVERAGE:** current parliamentary session only. It is not all Norwegian public decisions, government implementation, municipal/regional decisions or measured outcomes.

**BEFORE → AFTER VALUE:** users can now move from one curated 4NATION case to a live, original-source search of current parliamentary cases while retaining procedural status and provenance.

**NO DUPLICATE SYSTEM:** no new public-decision database, BRAIN or political knowledge store. One read-through cached adapter plus the existing 4NATION surface.

**ACCEPTANCE:** exact-head typecheck/build/smoke incl. `nation-stortinget-contract.test.mjs`, 4NATION QA/browser proof, neutrality/truth boundaries. No production release.

---

# DATA VALUE CONVERGENCE 01 — PUBLIC PROCUREMENT DEMAND SIGNALS — 27 SEP 2026

**STATUS:** HEIR CANDIDATE / TED ACTIVE-NOTICE DISCOVERY / DOFFIN ACCESS GATE OPEN.

**SOURCE CHOICE:** use the official TED Search API v3 immediately because published-notice search is anonymous and explicitly supports commercial/reuser applications. Doffin Public API is the authoritative Norwegian search/download source for Doffin notices, but its official integration documentation requires registration/subscription. No undocumented or scraped Doffin runtime is substituted.

**USER FLOW:** 4BRANDS company analysis → user enters product/solution/capability keywords → choose Norway-on-TED or all TED markets → official active published notices → inspect buyer/date/CPV/deadline → open original TED notice.

**NO AUTOMATIC MARKET CLAIM:** company sector text does not trigger procurement queries. Search terms are user-controlled. A published notice is evidence of a published procurement process/market signal only. It is not a sale, award, company fit, willingness to pay, realised value or ecological outcome.

**CANONICAL OBJECT:** each returned notice is `procurement:ted:<publication-number>` with original source URL. No notice is automatically joined to a company, facility, solution or intervention.

**COVERAGE LIMIT:** Norway-on-TED is not complete Doffin coverage. National/Doffin-only notices remain an explicit coverage gap until the official Doffin subscription key and exact Public API contract are configured.

**BEFORE → AFTER VALUE:** a company user can now test whether public buyers are publishing notices around a capability using an authoritative, inspectable, current source instead of relying on model inference.

**ACCEPTANCE:** typecheck/build/smoke including procurement-demand contract, lint, 4BRAND runtime audit and browser proof. No public production claim until gates pass.

---

# DATA VALUE CONVERGENCE 01 — COMPANY → FACILITY / CLIMATE TRACE — 27 SEP 2026

**STATUS:** HEIR CANDIDATE / REVIEW-GATED JOIN / NO LIVE RELEASE CLAIM.

**SHARED SOURCE OBJECT:** the existing `/api/climate-trace` adapter remains the one source/facility path already consumed by ATLAS. It is extended with the official v7 `ownerIds` filter and returns `facility:climatetrace:<sourceId>` identifiers. 4BRANDS uses the same endpoint; no second emissions store or ATLAS copy is created.

**JOIN LAW:** BRREG/GLEIF legal identity → Climate TRACE owner search is discovery only. The user must explicitly review/select a Climate TRACE owner candidate before 4BRANDS requests that owner's source records. Name similarity never auto-joins the company. The reviewed join remains session context and is not silently promoted into Company Brain or PLANETBRAIN.

**SOURCE CONTRACT:** Climate TRACE public API v7 beta exposes owner search and source filtering by owner IDs. Production dependence stays bounded because the API is beta; errors/empty contracts fail closed. Facility records retain Climate TRACE source ID, coordinates, sector/subsector, year/gas and emissions value. Climate TRACE and upstream ownership/source terms remain attached as limitations.

**ATLAS REUSE:** ATLAS already uses `/api/climate-trace` for its emissions layer. Facility identity is now shown in the ATLAS point detail, and 4BRANDS can deep-link to the same emissions layer/location. This is one data path viewed through two product lenses.

**TRUTH BOUNDARY:** source-level emissions do not by themselves assign legal responsibility to the BRREG entity. Ownership and emissions are source records. A possible reduction strategy is not a realised reduction, and no strategy dataset is promoted in this slice.

**BEFORE → AFTER VALUE:** a correctly identified company can now be used to discover/review Climate TRACE owner candidates, inspect source-level emitting facilities, see source/year/emissions context and continue spatially in ATLAS without 4PLANET inventing the company→facility relationship.

**ACCEPTANCE:** exact-head typecheck/build/smoke including company-climate contract, lint, 4BRAND runtime audit, ATLAS source bridge and browser proof. No public LIVE claim until gates pass.

---

# DATA VALUE CONVERGENCE 01 — 4BRANDS COMPANY IDENTITY SPINE — 27 SEP 2026

**STATUS:** HEIR CANDIDATE / NO LIVE RELEASE CLAIM.

**SAME PROVIDER, NOT SECOND BRREG:** the existing authenticated 4SAPIEN exact-org-number adapter is refactored to call one shared BRREG provider module. 4BRANDS uses that same provider for name discovery and exact organisation-number resolution.

**USER FLOW:** company name → BRREG candidates → explicit user selection → exact BRREG organisation-number readback → optional GLEIF lookup → LEI auto-crosswalk only when GLEIF `registeredAs` exactly equals the BRREG organisation number → company analysis.

**TRUTH BOUNDARY:** name search is discovery, not identity. Fuzzy/name similarity never becomes canonical company identity. BRREG exact organisation number is the Norwegian legal-identity anchor. GLEIF name results remain candidates unless the registration ID exactly crosswalks. Legal identity does not prove ownership, financials, emissions or value.

**RIGHTS:** Brønnøysundregistrene Open Data / NLOD 2.0. GLEIF public LEI reference data / CC0. Source URLs and observed identity records travel into the 4BRANDS evidence list.

**BEFORE → AFTER VALUE:** before, arbitrary company analysis could begin from a free-text name with no canonical legal-entity anchor. After, Norwegian users can disambiguate the actual company first and carry organisation number + optional exact LEI into the value map and later Company Brain.

**NO DUPLICATE SYSTEM:** existing identity/auth, Company Brain and BRREG capability remain. No new company database or parallel company truth store.

**ACCEPTANCE:** exact-head typecheck/build/smoke including company identity contract; existing `embla-brreg` auth and fail-closed behaviour preserved; browser proof; no production release claim until gates pass.

---

# DATA VALUE CONVERGENCE 01 — 4SAPIEN FOOD / MATVARETABELLEN — 27 SEP 2026

**STATUS:** HEIR CANDIDATE / USER-FACING / NO LIVE RELEASE CLAIM.

**HUMAN TRUTH:** a branded grocery product and a generic food-composition reference are different objects. Name similarity is not provenance.

**SAME-COMMIT CHANGE:** add a server-side Matvaretabellen reference gateway over the official Norwegian foods dataset, with a bounded 30-day Cloudflare edge snapshot, source/version metadata and explicit attribution. Add a FOOD UI seam where the user searches Matvaretabellen and explicitly confirms a generic reference for the current GTIN. No candidate is auto-selected. The confirmed relation is recoverable on the same device only and is visibly NOT Personal Brain or shared PLANETBRAIN truth.

**SOURCE:** Mattilsynet / Matvaretabellen official API `/api/nb/foods.json`. Source docs state annual autumn updates, few/no changes during the rest of the year, local caching is safe, and Matvaretabellen should be cited.

**TRUTH BOUNDARY:** branded product facts continue to come from product-specific evidence. Generic composition values never overwrite GTIN identity, ingredients, allergens, price or product-specific nutrition. A user-confirmed generic reference is a relationship assertion with provenance, not proof that both compositions are identical.

**BEFORE → AFTER USER VALUE:** before, the FOOD surface could inspect a branded product but had no official Norwegian generic composition context. After, a user can inspect a product, deliberately connect it to an official generic food reference, see source-linked nutrient values, remove the join, and receive local return value on revisit.

**NO DUPLICATE SYSTEM:** no new database, BRAIN, Source Registry or product engine. Existing FOOD route + existing Cloudflare function plane + local non-canonical recovery only.

**ACCEPTANCE:** exact-head typecheck, build, smoke including `food-matvaretabellen-contract.test.mjs`, lint and browser product proof. No LIVE/Gold claim until gates prove it.

---

# 4PLANET MARKET — ATTRIBUTED PURCHASE PATH 01 / 27 SEP 2026

**STATUS:** HEIR / TEST CANDIDATE / NO FALSE PURCHASE CLAIM

**FOUNDER TASK:** Improve the real 4PLANET MARKET transaction/value-delivery loop without creating a second commerce stack.

**VERIFIED EXTERNAL STATE:** Connected Fourthwall shop readback on 27 Sep 2026 returned six offers: five are PUBLIC + AVAILABLE + Fourthwall-fulfilled at USD 50.50; one duplicate Summit offer is HIDDEN. No Fourthwall offer, price, payout or fulfilment state was mutated.

**HIGHEST-VALUE CORRECTABLE FRICTION:** 4PLANET MARKET already sends a buyer to the real Fourthwall product, but the outbound product URL had no Market-specific purchase attribution. A later real sale therefore could not be cleanly reconciled back to the originating 4PLANET MARKET product click from Fourthwall's UTM sales reporting.

**SAME-COMMIT CHANGE:** All five live product links now carry deterministic `utm_source=4planetmarket`, `utm_medium=market`, `utm_campaign=first_creator_proof` and product-specific `utm_content=<slug>`. External commerce opens in a separate tab with noopener/noreferrer so the Market context is retained. The visible catalogue verification date is refreshed to the actual connected-shop readback on 27 Sep 2026.

**TRUTH BOUNDARY:** Attribution creates a measurable path from Market traffic to a completed Fourthwall sale. It does NOT turn a click into a purchase, payment, delivery or ecological-impact record. Purchase/fulfilment proof remains Fourthwall-owned unless separately read back.

**QA:** Existing user-proof analytics contract is strengthened to require all four UTM dimensions, safe external-link semantics, current verification date and the explicit click ≠ purchase boundary. Exact-head build/browser gates still determine acceptance.

**LIVE:** 4planetmarket.com remains separately release/readback controlled. Do not call this LIVE until the existing production path serves this exact change and external readback verifies it.

---

# DATA VALUE CONVERGENCE 01 — SPECIES LIVE EVIDENCE DISCOVERY — 27 SEP 2026

STATUS: HEIR CANDIDATE BRIEF / NONPRODUCTION / NO CANON PROMOTION / NO LIVE RELEASE AUTHORITY.

HUMAN TRUTH: a species page becomes more useful when the person can move from a canonical species identity to current research metadata and source-linked interaction records without confusing discovery with established biological truth.

BOUNDED CHANGE: reuse the existing SPECIES evidence seam and newly added shared provider adapters. For curated species with an existing source envelope, fetch a small live discovery set from OpenAlex metadata and GloBI. OpenAlex results are research discovery only; titles/metadata are not biological findings. GloBI interactions remain REVIEW_REQUIRED and must retain study/dataset provenance; an indexed interaction is not universal behaviour, abundance, causality, local presence or current state.

TTFV: existing species page still renders from current sources first. Live discovery is progressive enhancement, never a blocker.

SOURCE / RIGHTS: OpenAlex metadata only; do not rehost abstract/full text. GloBI general data licence does not erase original dataset provenance/terms. React output escaping remains mandatory. Provider unavailable/rate-limited => explicit unavailable state; never fabricate fallback records.

MEASUREMENT: source-discovery load state, research records returned, interaction records returned, source-open actions later. These are product-use signals, not ecological outcome.

AUTHORITY: SPECIES = king/test HEIR_ONLY. No ATLAS sandbox mutation. No Supabase schema, BRAIN database, public domain, DNS, payment, outreach or production release.

ACCEPTANCE: typecheck/build/test:smoke plus TEST KING Species+Lens proof; exact candidate SHA; no claim of Gold or live deployment without independent proof.

IMPLEMENTATION COHERENCE RECEIPT: this brief and the SPECIES live-discovery surface marker are updated together in the same bounded change; source discovery stays noncanonical and fail-closed.

---

4NATION UX06 PASS B/C — FINAL RELEASE PREPARATION / PARENT ab08fed29b299779217e04cedf48c7281c1c436d / 27 SEP 2026
ACTUAL VISUAL JUDGMENT performed from Cloudflare screenshots at mobile390/mobile430/tablet/desktop, not source-only. First hosted pass showed overly long mobile page, always-open six-event timeline, oversized marketing WHY block and internal Nation Atlas/Nation Brain labels. PASS B/C commit d742f9ee6cc93c3754eb0c077e73109314e0233f collapses full timeline behind accessible native disclosure, keeps 6 verified events one tap away, changes visible layers to Map/Evidence, removes low-value Our purpose top nav link and replaces huge black marketing section with compact light 4PLANET close. Final immutable preview https://82a64686.4planet-05.pages.dev/4nation. Exact external preview/browser run 36340292741 SUCCESS: 18/18 desktop1440/mobile390/mobile430 including existing people/institution/source/deep-link/map/full ATLAS and new timeline disclosure; real final screenshots captured in workflow 36340696982 and visually reviewed. Product remains evidence-first and politically neutral; same official Oslofjord status/source bundle, no recommendation/ranking/official affiliation.
This SAME COMMIT updates repository release Worker source and existing dispatch-only live workflow to final immutable origin + source SHA d742f9ee6cc93c3754eb0c077e73109314e0233f. NO Cloudflare deploy occurs from this commit. The protected production workflow still requires exact founder_release input "enig send"; auto-push release remains disabled. Existing public 4nation.org therefore continues prior pinned version until that explicit production gate executes. Do not call UX06 LIVE yet. No other domain or Pages production branch may be mutated.
---
4NATION UX06 PASS B/C / VISUAL-JUDGE ITERATION / PARENT a1552c56385675178466a2623ade5f0a888ee3e5
Actual rendered screenshot evidence from immutable Cloudflare preview 852b848d: desktop, tablet, 390 and 430 captured by workflow 36340005095 artifact 4nation-ux06-visual-proof. Visual findings: first fold materially improved, but full mobile remained unnecessarily long because six-event timeline was always expanded; large black WHY block read like marketing instead of utility; Nation Atlas/Nation Brain labels exposed internal architecture; top nav carried low-value purpose jump. This SAME COMMIT responds to the rendered product: rename visible layers Map/Evidence (keys/data unchanged), remove purpose from primary nav, collapse full dated timeline behind native accessible details/summary (all six events and sources retained one tap away), replace oversized black marketing block with compact light 4PLANET-neutral explanation, shorten overall mobile page. No political meaning/status/source data/map behavior/audience modes removed. Tests updated to require disclosure mechanics, all six events after opening, plain labels. Existing new UX preview remains previous candidate until this commit gets exact host preview/browser QA. Public 4nation.org still old build; production release remains dispatch-only exact founder 'enig send'. Maker still not sole Judge.
---
# CURRENT GOLD BRIEF — 4BRANDS COMPANY INTELLIGENCE 0–3

**CHANGE ID:** 4BRANDS-COMPANY-INTELLIGENCE-0-3-2026-09-27

**STATUS:** HEIR / TEST CANDIDATE / NOT GOLD / NO PUBLIC CUSTOM-DOMAIN RELEASE

**BASE AUTHORITY:** `king/test` sole HEIR. This bounded change converges the already-existing 4BRANDS public analysis, authenticated Company Brain, Company Twin and Decision + Value Ledger into one explicit product architecture. It does not create a parallel 4BRANDS app, Brain, database or identity system.

**FOUNDER DIRECTION:** 0. Company Analysis → 1. Company Brain → 2. Company Twin → 3. Future Engine. Company Analysis is the free public entry and acquisition surface. Company Brain is durable company memory/knowledge. Company Twin models the current company. Future Engine explores explicit scenarios before action.

## USER ARRIVES BECAUSE
A person wants to understand a company from public evidence, find potential value, then connect authenticated internal context and test better decisions without losing the distinction between evidence and hypothesis.

## PRIMARY FLOW
Company Analysis → create/sign in with canonical 4PLANET ID → create/select Company Brain workspace → persist analysis + Twin state → inspect Decision + Value Ledger → explore bounded scenarios.

## COMPANY BRAIN
Reuse existing 4Planet_ OS 4BRANDS tenant state, memberships, RLS, durable memories, metrics, decisions, interventions, results, learning and audit. The browser no longer owns a separate Company-Brain-specific auth session; authentication converges on the existing universal 4PLANET ID. Local recovery is non-canonical only.

## FUTURE ENGINE BETA
The first Future Engine is deterministic scenario arithmetic over explicit user assumptions and numeric Twin baselines. It is NOT an AI forecast and does not claim causal prediction. Future probabilistic or learned models require evidence, calibration and separate validation.

## TRUTH BOUNDARY
FACT ≠ ASSUMPTION ≠ SCENARIO ≠ FORECAST ≠ OBSERVED RESULT ≠ ATTRIBUTED VALUE.
Public analysis remains source-aware. Unknown is not zero. Scenario outputs do not become realised value. Company-private state never becomes shared 4PLANET/PLANETBRAIN truth by convenience.

## SECURITY
Company RPCs are authenticated tenant operations. 2026-09-27 backend hardening removed anonymous EXECUTE from Company Brain workspace/snapshot/twin/analysis/intervention/result/value-report/compounding RPCs and narrowed material UPDATE policies to authenticated. Existing membership/RLS checks remain authoritative.

## HUMAN REVIEW INTENT
Verify desktop and mobile hierarchy; the 0–3 architecture is understandable without internal jargon; public Company Analysis still works without login; 4PLANET ID sign-in/create-account returns to Company Brain; authenticated workspace creation/save/readback works for an actual permitted user; scenario controls clearly show assumptions; Company Twin and Value Ledger remain usable; no false forecast/value/impact claim.

## QA / RELEASE GATE
Exact SHA typecheck/build and relevant 4BRANDS/identity/runtime journeys must pass on HEIR or controlled preview. Positive real-user authenticated readback cannot be inferred from source tests. Maker ≠ Judge. Custom-domain LIVE promotion remains a separate Founder-release action; this brief does not authorize it.

--- PRIOR GOLD HISTORY PRESERVED BELOW ---

ATLAS GOLD 04 / MAPLIBRE API TEST COMPATIBILITY / 22 SEP 2026
Parent 93212f4582d141287b7e833cdc1022827bf1a1eb. Exact SHA 1c98ec1 source had previously failing ATLAS Zero Loss mobile 390 click target blocked by Orca context; mobile native controls now usable and click reached MapLibre. Test then crashed on TypeError map.isEasing is not a function, MapLibre v6 runtime does not expose this optional legacy method. SAME COMMIT fixes test compatibility while RETAINING both !map.isMoving() and !map.isZooming() and checking isEasing only when supported. Camera ownership, settled zoom, lat/lng acceptance assertions and timeouts are unchanged. No production, DNS, branch, new architecture or external release. Exact HEAD rebuild/CI required, no Gold before portfolio gates and live camera approved separately.
--- PRIOR HISTORY BELOW ---

4NATION UX06 EXACT-PREVIEW LIVE RELEASE PREPARATION / PARENT 1c98ec1e8bb8a4895279c5365a90e01b5e7a0ecd / 22 SEP 2026
SOURCE: immutable https://852b848d.4planet-05.pages.dev/4nation built from latest authorised source 1c98ec1e8bb8a4895279c5365a90e01b5e7a0ecd incl 63e71442 human-first UX and newer shared ATLAS fix. Actual hosted QA 15/15 desktop/mobile PASS run 35762138657; Nation Gold Candidate QA 35762138682 PASS; Founder Review 35762138742 SUCCESS. This SAME COMMIT updates repo Worker source SHA+Pages origin only, not deployed Cloudflare Worker. Keeps existing workflow workflow_dispatch-only with input exact "enig send"; NO auto release or implicit approval. Repairs release flow stale-old-source checks to new exact preview, and corrects current-domain collision logic: requires root 4nation.org owned by existing Worker 4planet-nation-live; refuses any other Worker, Pages, www DNS or routes; does not edit other domains, Pages production branch or business logic. It also retriggers read-only Cloudflare audit to establish current host owner. PUBLIC ROOT STILL PREVIOUS IMMUTABLE PRODUCT until separately authorised deploy of this prepared Worker source and external 15/15 on 4nation.org. Do not mark UX06 LIVE from this code commit.
---
ATLAS FINAL GOLD CLOSURE 04 / SAME-COMMIT FIX / 22 SEP 2026
Parent 63e71442ef8b2d6f821bf0fa30f84b1652f71d63. Root-cause from exact prior real-domain Chromium: typed 4NATION Embed returns z/c + entity=place:4p:oslofjord WITHOUT record, while the one existing AtlasReturnCameraAuthority guarded ONLY record. World.openPlace then performs fitBounds and overwrites initial camera on full ATLAS; exact live zoom errors 1.486 desktop / 0.774 and 1.006 mobile. Extend the SAME authority to protect explicit entity+z/c, captured by semantic record/entity key; no second map or camera owner. Release on true user pointer/click of native MapLibre controls outside canvas; shift these controls above 58vh mobile context bottom sheet to prevent Orca title intercepting clicks (previous ATLAS Zero Loss failure). Existing PlanetProof Oslofjord constructs MapLibre without ATLAS' Vite self-contained worker; reuse it before Map creation to address HTML-worker fallback and missing MAP READY on 4 desktop/mobile Browser Product Proof cases. NO production/DNS/release/partner action. These are source fixes, not claimed passing until exact new SHA CI, remote preview, real-domain (which CANNOT receive these source changes without Founder release), and independent Gold. Local/end-to-end source-NEWS-Magazine remains outstanding. Preserve prior history below.
---

4NATION HUMAN-FIRST PREMIUM UX + LIVE 06 / CANDIDATE a416d54995a411fb9798beae8d36bd2a03a6f535 / 22 SEP 2026
Founder rejects current LIVE user experience. Rehydrated actual latest HEIR before this change. Code audit: repeated large Oslofjord introductions, two competing hero actions, two perspective entry points, six dashboard-like navigation modules, dense metadata and oversize first-mobile fold. Bounded human-first redesign: public question "What is happening to the Oslofjord?", one primary CTA, original source visible above fold, truthful proposal status + next deadline, compact case record, six preserved layers now progressive calm navigation and institution depth on demand. Original ATLAS Embed/full Atlas, sources, deep links, both audience modes, existing 4PLANET brand tokens and other products preserved. Norwegian ministry public record checked 22 Sept: under consideration, ordinary hearing deadline 15 September passed, separate municipal/county deadline 15 October; original source projection snapshot updated only to 22 Sept. Existing public root still pinned to previous immutable product SHA 4a13f9d...; do not claim UX 06 is LIVE until exact candidate preview QA and separately authorised Cloudflare host-only origin update. Real browser visual review still required; Gold is not self-certified.
---
ATLAS EMBED GOLD 03 / STRICT CONTEXT TEST / 22 SEP 2026
Parent f56f6e6192b0b818adfa488ad1a530dcb0329027. Real-domain read-only browser test at 9690d2b FAILED 3/9 because its regex was accidentally double-escaped. Concurrent f56f6e6 fixed that regex but only asserts *some* numeric zoom/coords, which masks the historically observed camera drift 6.3→7.79 at 4planetatlas.com. This same-commit TEST-ONLY change asserts loaded actual MapLibre style, loaded canvas, exact intended entity/layer and camera center/zoom after place animation, not a transient redirected URL. It additionally covers SPECIES Orca's genuine iframe, historical-observation caveat, same canonical taxon and full Atlas route in first-party previews. 4NATION isolated live host explicitly skips SPECIES route because it does not own that route; live 4NATION assertions remain strict. Expected historical camera drift may make this stricter gate red; do not weaken or claim Gold. No product source architecture, public DNS, hosted production, or release workflow changed. Safety push release guard remains in ceed492. Source/news chain remains blocked on real linked data.
--- EARLIER GOLD HISTORY PRESERVED BELOW ---

4NATION REAL ROOT BROWSER QA REGEX CORRECTION / PARENT 9690d2b01d4f1543c33196581d0e95423786e7f1
First real-domain live workflow 35667108534 proved HTTPS/root/full routes/exact SHA; 6/9 page journeys PASSED; remaining 3 reached https://4planetatlas.com with exact Oslofjord entity and center/zoom, but stale path assertion wrongly expected /atlas. Read-only QA 35667503015 corrected canonical path and still failed due incorrect backslash escaping in new test regex: source /\\d/ matched literal backslash rather than numeric zoom. This SAME COMMIT corrects test regex to numeric coordinates/zoom; no changes to product, Cloudflare, live Worker, immutable artifact, DNS, founder safety gate or other domains. Do not report full 9/9 until fresh read-only live browser workflow PASS.
---
4NATION REAL LIVE HOST VALIDATION / 22 SEP 2026 / PARENT ceed492e93150ac35023fbaf57e2fb388b1a8743
Actual release run 35667108534 attached 4nation.org custom domain and PASSED HTTPS, root, /atlas routes, exact SHA header, indexable HTML. Its external Chromium run has 6/9 PASS but 3 full ATLAS-link tests failed on *obsolete path assertion*: actual click correctly arrived at canonical https://4planetatlas.com/?... with Oslofjord entity=place:4p:oslofjord, valid center and zoom. The prior test incorrectly expected /atlas? on the public Nation hostname; do not redirect canonical product back to Nation or weaken case/map verification. This same-commit test now separately verifies canonical origin, exact entity, coordinates/zoom, and real full Atlas canvas on live host, while preserving original same-origin /atlas assertion for TEST Pages preview. New workflow read-only tests real https://4nation.org desktop/mobile without DNS/Cloudflare writes; protected independent Gold separate. Concurrent safety commit ceed492e... changed live release workflow to workflow_dispatch-only with founder phrase; DO NOT undo or re-enable on push. Real domain remains public and no other 4PLANET domain modified. No claim of 9/9 before new read-only result.
---
4NATION HOST RELEASE DEPLOY RETRY / PARENT 735b10665562c8ae7210f0a4a69b1d28a603170f
Exact root release run 35666998760 verified immutable 4NATION candidate, current HEIR and 4nation.org DNS/Worker/Pages collision none. Wrangler module upload blocked with actual CF error 10021: "Can't set compatibility date in the future: 2026-09-22" while runner UTC was 21 Sep 2026. Same-commit workflow change sets compatibility date 2026-09-21. NO worker/domain/DNS published from prior failed run. No bypass of exact SHA, collision or live browser QA; no effect on 4planet-05 production branch/other domains. Founder explicitly asked public 4nation.org. Report LIVE only after observed external HTTPS and 9/9 hosted Chromium.
---
4NATION EXPLICIT DOMAIN RELEASE / 22 SEP 2026 / PARENT b6ef125515fa37ab8338e1575081a084a7c73ca7
Founder explicit latest direction "fullfør og publiser på url!" specific 4nation.org. Exact immutable preview https://32f3e9de.4planet-05.pages.dev/4nation of source 4a13f9d118066cd6765c3399ebff46a7d3298609; external 9/9 browser PASS run 35664913835 and 4NATION scoped QA PASS 35664913904. Fresh audit 35666452026: active zone, no apex/www DNS, no Pages or Workers domains/routes. Existing 4planet-05 production serves other live sites and must NEVER be changed; new Pages denied quota 8000027. Same-commit host-only Worker custom domain 4nation.org proxies EXACT immutable Pages artifact, rewrites only ROOT to /4nation, preserves full /atlas and assets, strips preview noindex, exposes exact SHA, with fail-closed collision and actual external desktop/mobile proof. No other domains, partner outreach, money, alternate product systems. Historical broad Browser Product Proof RED on Oslofjord MAP READY noted independently; scoped 4NATION pass must not masquerade as all-portfolio Gold. No LIVE claim until actions show actual TLS/routes/QA on 4nation.org. Rollback must not affect existing sites.
---
4NATION DOMAIN 05 READ-ONLY ROUTING RECHECK / 22 SEP 2026
Parent 4a13f9d118066cd6765c3399ebff46a7d3298609. Founder asked to get verified 4nation.org LIVE, not another design round. Retain exact hosted 4NATION QA candidate 4a13f9d118066cd6765c3399ebff46a7d3298609 with immutable preview https://32f3e9de.4planet-05.pages.dev/4nation. This same-commit PRE-FLIGHT audit only extends existing read-only workflow: live apex/www DNS, Pages custom domain owner, existing project 4planet-05, Workers custom domain and Worker routes. It cannot deploy, map, revoke, delete, auto-release, touch other product or mint a parallel app. New Pages project creation blocked by Cloudflare project limit 8000027; do not retry. Protected Browser Product Proof still red on prior Oslofjord MAP READY; do not convert scoped preview QA into portfolio-wide Gold, and preserve Founder acceptance and exact production-release authority. Map approved immutable candidate via existing Cloudflare only after domain owner/collision/TLS and scoped source/visual/security review. No LIVE claim from this audit.
---
4NATION PREVIEW AS LIVING BUILD, SAME-ORIGIN ATLAS / 22 SEP 2026
Parent 63f12276998ba55abab0f66777125e585290af4b. Added canonical-host /atlas guard in parent to prevent "OPEN FULL ATLAS" from recursively landing on Nation homepage at 4nation.org; exact updated candidate must re-run QA and preview. This same commit makes noindex preview trigger from actual Nation/Atlas source and same-commit brief; final hosted page must pass real remote Playwright for people/institutions, full Atlas, sourced case, refresh, desktop 1440 and mobile 390/430. Reuses Cloudflare 4planet-05 nonproduction branch 4nation-preview because account Pages project quota 8000027. No 4nation.org DNS writes, production branch changes or external official claims. Human founder review and independently accepted root release still separate.
---
4NATION 05 / FULL ATLAS EXIT ON CANONICAL HOST / 22 SEP 2026
Parent e194a688879fdf9ae0d57ac09eeb882984302988. Cloudflare noindex preview exact e194a688879fdf9ae0d57ac09eeb882984302988 succeeded external HTTP/noindex on https://b4553b84.4planet-05.pages.dev/4nation in run 35664513886; site visibility is verified on a Pages preview, NOT on 4nation.org.
Before an apex domain LIVE release, inspected src/App.tsx and caught that isNationHost() intercepted plain /atlas (only /atlas?embed=nation escaped to StandardApp). Add canonical-host full /atlas path guard before Nation homepage so OPEN FULL ATLAS preserves the shared Atlas on real 4nation.org, without changing other host behavior or camera/datamodel. Static source contract same commit. No separate map, no root domain DNS action, no inference of independent Human GOLD. New exact QA + review of updated preview required.
---
4NATION preview URL proof / exact candidate bb6de9bcf4a9dced346b41f0aa1bd41e7ac06237. Use bracket-literal dots in Wrangler immutable Pages URL regex; prevents a literal double-backslash parsing error in shell grep. All previous controls remain: same original build, exact QA, noindex, nonproduction branch, no apex/www DNS or production writes; external HTTP/noindex remains mandatory before any Founder preview success. No live or Founder acceptance asserted.
---
4NATION VISUAL PREVIEW 05 — EXACT DEPLOY READBACK REPAIR / 22 SEP 2026
Parent 580021b9c3f90405d4ffee5e537b63de24a5bc19. Previous run 35664082661: 4NATION scoped QA 35664082608 PASS; Founder Review 35664082596 PASS. Cloudflare existing 4planet-05 branch 4nation-preview DEPLOY COMPLETE and immutable URL was printed by Wrangler, but post-deploy GET Pages deployment list with pagination returned HTTP400; job incorrectly lacked external verification despite successful upload. Same-commit bounded workflow fix reads immutable Pages URL printed by successful Wrangler CLI, then externally checks /4nation HTTP200 and noindex. Non-production branch; no 4nation.org DNS, production branch, shared domain or other product mutation; no infer LIVE. If external URL cannot be reached, fail closed. Independent visual Founder review and approved exact LIVE release remain pending.
---
4NATION 05 PREVIEW UNBLOCK / 22 SEP 2026 / PARENT c00f2a01ca1a60f3c421c05fc1566fc06f1d2c5f
Cloudflare token and zone/account GET work. First exact-head noindex preview job 35663783069 reached real Cloudflare Pages project create and returned Cloudflare API error 8000027: account project quota; NO project or DNS created. This SAME-COMMIT bounded adaptation reuses existing 4planet-05 Pages deployment origin via distinct non-production direct-upload branch 4nation-preview, fails if project missing or production branch matches preview branch. Existing 4PLANET build, existing root /4nation route on Preview host and same-origin /atlas preserved. The 4nation.org apex/www are NEVER touched by this workflow. Exact 4NATION QA run 35663783052 SUCCESS on parent version; check fresh new-head QA before any preview publish. Parent branch may move; fail closed on stale HEAD. A non-indexed preview URL is not live domain, independent Human Gold or accepted release. Root 4nation.org release separately Founder-approved after real review and domain/TLS/rollback checks.
---
4NATION EXACT PREVIEW CONTROL / 22 SEP 2026 / PARENT 0a692d4181a02d96c8c713b96c5f594ba4535c45
After candidate c7fcac2d569115988608745c8cf02eadfd0888ea PASS 4NATION QA 35663458214, first noindex preview workflow commit 0a692d4181a02d96c8c713b96c5f594ba4535c45 fail-closed before deploy: exact HEAD had no scoped QA run because workflow-only change did not trigger 4NATION QA. This SAME COMMIT fixes release control: nation QA triggers on visible-preview workflow changes and preview waits for its exact-sha conclusion before any Cloudflare write; Cloudflare account environment exported in same step for Wrangler. Dedicated Pages preview alone, no 4nation.org root DNS, no public live, no Founder acceptance fabricated. Existing latest Atlas, Nation user journeys, build reused without parallel code/data systems. If QA fails, project does not deploy. Independent Human Gold, exact-artifact Founder visual review and separately authorised root-domain release remain open.
---
4NATION LIVE CLOSURE 05 — REAL IFRAME CSS PARSE REPAIR / 22 SEP 2026
Parent 052bfc6b06723ba2b1a96659eb650d0ac639baaf. Source of observed failure: exact 4NATION QA run 35662994086 logged contextual .atlas-embed computed 'contain: strict', height=0, even though the contextual override existed as literal text in src/earth/atlas-embed.css. GitHub file inspection proved its first line contained FOUR literal backslash+n sequences (\\n), including after closing CSS comment; escaped selector did not match. This same-commit repair turns those FOUR malformed sequences into genuine newlines; preserves global legacy .atlas-embed strict containment for existing World/legacy home, while contextual only has contain:none!important and real min-height. Contract regression now checks CSS syntax and contextual override. No fake render, no additional map, no worker/Atlas camera rewrite. Target person/institution paths unchanged, official status remains a proposal, original sources near claims. Existing Cloudflare token availability was previously verified in read-only audit; 4nation.org DNS/Pages absent at prior proof. No LIVE or Human Gold claimed; execute bounded cross-product Chromium on this exact head, create and verify an authorised noindex visual preview before Founder-release, then release exact approved artifact only. Maker is not Judge.
---
ATLAS EMBED RUNTIME + GOLD CLOSURE 02 / AFTER REAL 7a6a76a BROWSER FAILURE / 21 SEP 2026
Parent 7a6a76a325b672841587772b0ff66ed475601713. Exact 4NATION browser run 35662405684: six failures; 3 new Embed tests had DOM section present with contextual subclass but Playwright still computed HIDDEN (toBeVisible timeout 12s) before scrolling, and 3 preexisting 'Outcomes' test selectors became ambiguous after concurrently introduced 4NATION journey navigation. Patch contextual ONLY to explicitly remove legacy strict size containment with !important and give it a real minimum height; legacy Home component untouched. Add diagnostic rect/display/contain log in iframe test without changing its visibility acceptance. Scope existing Outcomes test to the declared 'Explore decision layers' navigation (not waive assertion). Preserve full Atlas, access and source boundaries; Gold brief same atomic code change. Exact browser proof still required; NO GOLD/LIVE asserted.
--- PRIOR BRIEFS PRESERVED BELOW ---

ATLAS EMBED RUNTIME + GOLD CLOSURE 02 — REAL IFRAME ZERO-SIZE ROOT CAUSE / 22 SEP 2026
PARENT=780f625414ef056b64aac8643dffd8a8bfccf482. Playwright archived 4NATION visual + trace for 5f4edbc proved scroll-to-lazy iframe did not trigger /atlas network. The shared first-party worker asset WAS correctly emitted as dist/assets/maplibre-gl-worker-*.js in build, but contextual Embed itself vanished visually. Exact CSS culprit: existing src/styles/global.css line 404 '.atlas-embed { contain: strict; }' from LEGACY Home Globe. Strict contains SIZE, collapses the new contextual React section despite child 500px iframe frame. Fix is a scoped specificity-2 contextual override '.atlas-embed.atlas-embed--contextual{contain:layout paint}' and markup subclass, preserving old Home globe rules unchanged. No timeout manipulation, extra map engine, parallel camera, changes to public site, new branch or content claim. New source+script contract + current Gold brief in same atomic HEIR commit. Target browser proof: iframe URL actually fetched, canvas+isStyleLoaded, source/read state preserved on desktop/mobile; independent review before DONE. No LIVE release authorised.
--- EARLIER GOLD BRIEFS PRESERVED BELOW ---

ATLAS EMBED RUNTIME + GOLD CLOSURE 02 — STANDALONE HOST FULL-ATLAS EXIT / 22 SEP 2026
PARENT=1b61dc67a7212b4d74267ac208c1413c83e43032. The 4NATION standalone host routes ordinary /atlas through NationPage. Embedded /atlas?embed=nation already has a first-party guard, but the previous FULL ATLAS plain /atlas link on the standalone host would not open full ATLAS. Reuse the same canonical Atlas view query; link to 4planet.org/atlas from standalone product hosts and keep same-origin routes on 4planet.org, test.4planet.org, localhost, and existing 4planet-05 Pages previews. The iframe remains first-party; no duplicated renderer, redirected private data or second context. Product source, privacy, status and old Gold control retained. This exact code + brief are atomic. Browser cross-host production behaviour must still be independently verified before Gold; no live release authorized. Concurrent 4NATION journey changes on HEIR are preserved and not reimplemented.
--- PRIOR BRIEFS PRESERVED BELOW ---

4NATION LIVE CLOSURE 04 — BOUNDED HUMAN JOURNEY / 22 SEP 2026
CODE AUTHORITY: existing king/test sole HEIR. This bounded same-commit mutation strengthens focus feedback for the new six-step, source-backed Oslofjord decision journey; preserves current ATLAS shared Embed/worker fix. Earlier 4NATION journey CSS/Page commits were missing SAME-COMMIT Gold brief; historical failures preserved, not waived. Brand tokens #2E2EFF / DM Sans / Instrument Sans / Fragment Mono retained. User: an ordinary citizen or official explores one real proposal with one visible NEXT control, without six dashboard silos. Truth: proposal ≠ adopted policy, existing dated sources, no fake feed/AI/partner/outcome claim. Preview host routing on .4planet-nation.pages.dev is only intended for authorised dedicated noindex preview; no verified Pages host or LIVE 4nation.org. QA state: source/TypeScript existing build previously passed; candidate integrated iframe still under proof. Release: Founder-gated, no 4nation.org DNS/Pages mutation. Maker ≠ Judge. This commit does not imply live or independent Human Gold.
---
ATLAS EMBED RUNTIME + GOLD CLOSURE 02 — EXACT WORKER REPAIR / 22 SEP 2026
STATUS: HEIR TEST CANDIDATE / NO GOLD OR PRODUCTION RELEASE. Parent fbfe292d2bac47a90ec4d84054e4e41e5112b939. Read original Playwright TRACE of 11cd094 before this change: ONE INTERFACE desktop frame requested /assets/maplibre-gl-worker.mjs and received HTTP 200 text/html (Vite SPA fallback), although OpenFreeMap style and tiles responded 200. This is a real executable worker asset failure, not a reason to weaken map-ready/StyleLoaded tests, change basemap provider, duplicate renderer or add new maps. MapLibre v6 official Vite guidance: bundle maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url and call setWorkerUrl before new Map. New browser QA must demonstrate worker JavaScript MIME, isStyleLoaded + MAP READY when applicable, 4NATION lazy iframe on desktop/mobile, preserved canonical context; existing separate tests remain authoritative. Concurrent c512de3 / fbfe292 changed lazy iframe scroll and preview host on same HEIR; this worker repair applies AFTER those changes, no redo or overwrite. Two prior interim commits lacking same-commit Gold brief remain non-compliant history; current change includes this brief in same atomic commit. No production or outreach authorised.
--- PRIOR BRIEFS PRESERVED BELOW ---

CURRENT CORRECTION — 21 SEP 2026 — PRODUCT AUTHORITY ERROR-TO-IMMUNITY
Observed FOUR STATE Founder Review run 35659551649 FAIL for 7f5665a: two prior HEIR performance commits (89c103a, 7f5665a) changed product code without modifying this GOLD_CURRENT_BRIEF.md in the SAME commit. This is a real control-protocol defect, not a missing Cloudflare deploy. Preserve failed run and history; this correction does not retroactively mark earlier commits compliant.
This SAME correction commit adds an actual 4NATION desktop/mobile iframe/browser path, declares exact AtlasEmbed scope and reiterates independent Gold/release gates. Future performance fixes must include this brief in the same code change. Source for recovery: https://github.com/odinskogen-dev/4Planet.05/actions/runs/35659551649 .
--- PRIOR CURRENT BRIEF AND HISTORICAL RECORDS PRESERVED BELOW ---

# CURRENT GOLD BRIEF — ATLAS SHARED ENGINE + EMBED 01
CHANGE ID: ATLAS-SHARED-EMBED-2026-09-21
STATUS: HEIR TEST CODE CANDIDATE / NOT GOLD / NO PUBLIC RELEASE
BASE: king/test@e71f343af57f04a17a4468038b89e142794a083a; one controlled atomic commit. Existing ATLAS sandbox PR #263 remains separate and is not overwritten.
FOUNDER LAW: ONE PLANET. MANY WAYS TO SEE IT. Standalone Atlas Explore plus purpose-specific AtlasEmbed reusing the same MapLibre/PLANETBRAIN engine.
P1 DOMINANT: A person sees a focused interactive map inside an existing SPECIES profile or a dated 4NATION public decision, not the full ATLAS console.
P2 ORIENTATION: Source, geometry and time caveats are adjacent. A PLACE navigation bbox is not an official catchment, a taxon occurrence is not a live animal/range, a proposal is not a decided outcome.
P3 ACTION / NEXT: Open exact matching context in full ATLAS. On standalone product hosts /atlas?embed=... resolves to shared ATLAS rather than re-entering standalone product.
P4 DEPTH: MapLibre data layers and ProductContext retain authority. NEWS/IMPACT/BRANDS/PERSONAL/SOLUTIONS are typed consumers without fabricated content/private URL projection; MAGAZINE requires sourced Story/Place relation before adding a public pin.
WHAT CAN BE REMOVED: Coordinates-only pseudo-map in 4NATION and duplicate ATLAS chrome inside iframe. Never remove existing source/proof caveats, species Atlas links or editorial content.
WHAT MUST BE REUSED: existing World/PublicWorld; productContext camera+record authority; planet places and taxon identities; first-party embed and resize donor selectively; no second map engine, backend, source registry, private tenant store or independent AtlasNews.
MOBILE-FIRST RISK: WebKit zero-size embedded canvas, overlays intercepting touch pan, cross-host /atlas recursion. Only viewport resize recovery; full ATLAS exit remains available.
HUMAN SUCCESS: Desktop/mobile user opens real 4NATION Oslofjord navigation view and SPECIES canonical taxon view in shared ATLAS; full ATLAS remains useful, no misleading geography or false live state.
MAKER ≠ JUDGE: Exact SHA npm typecheck/build/smoke/browser, HEIR Pages readback, independent Gold and founder review before promotion. Inherited MAP READY defect stays open. No domain LIVE mutation, paid service, partner claim or external send. Capital APP-130 remains separate P0.
--- PRIOR GOLD BRIEFS PRESERVED BELOW ---

# CURRENT GOLD BRIEF

This file is the machine-readable human contract for the **current bounded TEST KING change**. Historical briefs belong in issue/PR evidence; this file always reflects the current mutation.

**CHANGE ID:** 4SAPIEN-CORE-FINANCE-01-2026-09-20

**STATUS:** HEIR / TEST-ONLY / PERSONAL ECONOMY CORE / NO PRODUCTION LIVE RELEASE

**BASE AUTHORITY:** `king/test` / sole HEIR integration line

**LIVE IDENTITY:** `https://4sapien.com/` remains unchanged; LIVE promotion is outside this change

**FOUNDER DIRECTION:** make personal economy useful in practice first; add legal/provider-ready bank connectivity and manual portfolio value without widening into a generic Life OS.

## USER ARRIVES BECAUSE
A person wants one honest view of the money they can use, what they owe, and what their manually entered investments are worth now.

## ONE THING TO UNDERSTAND
4SAPIEN can calculate a useful personal money picture immediately from user-entered facts. Bank data is shown as connected only after an authorised account-information provider and explicit user consent exist. Four bank refreshes per day is a target constrained by the bank/provider, never a universal guarantee.

## PRIMARY ACTION
Add or update an account or holding and immediately see recorded liquidity, debt, portfolio cost, current market value and unrealised change.

## SECONDARY DEPTH
Show source, as-of time, missing values, currency boundaries, bank consent/sync state, last successful sync, next eligible sync and provider limits. Manual current prices remain clearly manual until a licensed market-data source is configured.

## P1 DOMINANT

## 2026-10-07 — FOUNDER COLOUR NEUTRAL LOCK / HOMEPAGE SYNC

**FOUNDER DECISION:** Current 4PLANET neutral naming and production code are White / Black. White = `#FFFFFF`. Black = `#000000`. Former Paper / Ink naming is superseded for current use; former Ink `#0A0A0A` is superseded by Black `#000000`.

**BOUNDED IMPLEMENTATION:** Shared neutral token values and the 4PLANET homepage/public shell were reconciled to true Black and White. Homepage-facing `#080808` / `#0A0A0A` black text/fallback values were removed from the bounded homepage style seam; white literals were normalised to `#FFFFFF`. Natural imagery, scrims and intentionally translucent semantic values remain content/functional treatments rather than neutral-substrate replacements.

**BRAND AUTHORITY:** 4PLANET BRAND OS — MASTER CANON, PLATFORM, IDENTITY & PRODUCTION SYSTEM, Founder Colour Naming + True Black Lock, 07 October 2026.

**PROTECTED INVARIANTS:** 4PLANET Blue remains `#2E2EFF`; contextual domain colours remain unchanged; semantic/secondary grey may remain bounded where functionally required; Earth/map/documentary colour is not flattened into the neutral system.

**ROLLBACK:** revert the bounded neutral commits after the exact pre-change HEIR `5dc63fe8ddd1daea32d62d102066705d3c7efbfe`.

**HUMAN EFFECT:** white surfaces are true white, primary black text is true black, and the homepage no longer carries an unintended near-black / warm-neutral drift.


## 4PLANET ID Google OAuth incident — 08 Oct 2026

Founder observed Google account selection returning to /login without authenticated session on 4planet.org. Supabase auth logs at 2026-10-07 23:08 UTC show Google login accepted, but end-to-end cross-origin session handoff is not verified. Scoped candidate updates IdentityApp to react to late SIGNED_IN after bootstrap, guard duplicate transfers, and use canonical #2E2EFF / #FFFFFF / #0A0A0A colours instead of green. Preserves existing Supabase Auth, endpoint and user IDs. No production acceptance until verified actual Google OAuth, bridge function, callback, mobile Safari, 4planet.org session and rollback. Never claim live from repository commit alone.

## 4PLANET ID — SINGLE GOOGLE REDIRECT P0 — 09 OCT 2026

**USER ARRIVES BECAUSE:** Founder taps "Fortsett med Google" at id.4planet.org, immediately bounces to login or never observes Google account selection, while 4SAPIEN Claude auth flow works.

**ONE THING TO UNDERSTAND:** Previous IdentityApp invoked supabase.auth.signInWithOAuth without skipBrowserRedirect (SDK auto-navigates) AND explicitly assigned result.data.url (second navigation). Browser auth callback could race and lose handoff. The ID-specific dynamic SDK loader also used a non-canonical CDN UMD filename and retained rejected promises.

**PRIMARY ACTION:** Invoke Supabase OAuth with skipBrowserRedirect:true, validate the returned Supabase /auth/v1/authorize URL, and navigate exactly once. Use the pinned package CDN entrypoints documented by Supabase, with failover, timeout and singleton client.

**SECONDARY DEPTH:** Preserve 4SAPIEN's lesson: simple redirect, persist session, prove user via Supabase and keep post-login return path. No replacement auth system, no change to Supabase provider, no user migration.

**P1 DOMINANT:** Google account choice reliably opens, callback writes session, first-party identity bridge returns to 4planet.org.
**P2 ORIENTATION:** Dedicated Node ID contract ensures OAuth single navigation, retryable SDK and retained bridge.
**P3 ACTION / NEXT:** Merge tested candidate to king/test, then founder-authorised bounded P0 hotfix main; verify live deployed asset and authenticated browser callback.
**P4 DEPTH:** Record CDN fallback errors, redirect loop evidence, actual bridge function invocations and matching deployment hash, without recording secrets.
**WHAT CAN BE REMOVED:** Second conflicting OAuth navigation, unsafe SDK loading failure.
**WHAT MUST BE REUSED:** Existing unified Supabase Auth, 4PLANET ID bridge, original account IDs, Claude 4SAPIEN's proven OAuth/session principles.
**TRUTH BOUNDARY:** Code merge and static tests cannot prove that production Cloudflare deployed, browser opened Google, or 4planet.org received a session.
**MOBILE-FIRST RISK:** Safari same-site and cross-site storage, delayed redirect and OAuth account-selection behaviour.
**HUMAN SUCCESS:** Google account chooser opens once, authenticated landing succeeds and survives reload.

## 4PLANET ID — POST-GOOGLE RETURN P0 — 09 OCT 2026

**USER ARRIVES BECAUSE:** Google approves account on id.4planet.org but returns to the same login form without confirmation or forwarding; founder verified this in external browser. 4SAPIEN must remain intact.

**ONE THING TO UNDERSTAND:** In prior ID code SIGNED_IN/INITIAL_SESSION during bootstrap was ignored unless `bootstrapped` was already true; `getSession` then waited for nonessential profile hydration before starting cross-domain session bridge. Supabase auth logs confirm Google callback succeeded but function_edge_logs show no bridge calls in observed window. These are evidenced code-path risks, exact production browser root cause requires authenticated end-to-end evidence.

**PRIMARY ACTION:** Accept the earliest authenticated session event, asynchronously queue one secure handoff without waiting on readProfile/getUserIdentities, retain existing account and bridge architecture; provide explicit Google return progress and no-session error.

**SECONDARY DEPTH:** Preserve 4SAPIEN unchanged. Google callback now carries first-party auth_return marker for status. Keep SDK session handling, CORS and origin allowlist.

**P1 DOMINANT:** Google accepts → ID callback receives browser session → bridge POST → target callback verifies OTP → target URL with persisted session.
**P2 ORIENTATION:** No extra identity brains/databases. No raw tokens in telemetry or diagnostics.
**P3 ACTION / NEXT:** Tested king/test patch → bounded production PR → live deploy verified by asset and browser → user authentically retries.
**P4 DEPTH:** Track anonymous phase, not personally identifying data; revisit bridge only after POST is seen.
**WHAT CAN BE REMOVED:** Bootstrap discard and profile-before-bridge dependency.
**WHAT MUST BE REUSED:** Existing Supabase Google provider, profile backend, active four-planet-id-bridge function, original 4SAPIEN login.
**TRUTH BOUNDARY:** Code, CI and synthetic session tests do not prove real Google user completed browser handoff.
**MOBILE-FIRST RISK:** Safari callback event order; localStorage persistence and auth SDK lifecycle.
**HUMAN SUCCESS:** After picking Google account, founder is transparently informed and lands on requested 4planet.org logged in without a loop.

## P0 4PLANET ID — CLOUDFLARE CSP BLOCKS SUPABASE — 09 OCT 2026

**USER ARRIVES BECAUSE:** Google approves sign-in, but id.4planet.org returns to login without a retained session at 4planet.org.
**ONE THING TO UNDERSTAND:** Cloudflare Pages public/_headers CSP connect-src on both general and Jaguar paths does not permit https://ghvdzetmplqkdtfqiror.supabase.co. Therefore browser calls to Supabase Auth and /functions/v1/four-planet-id-bridge are blocked by policy, explaining the observed absence of bridge logs even when Google callback succeeds.
**PRIMARY ACTION:** Add only this existing 4PLANET Supabase origin to existing connect-src directives. Preserve all other CSP directives and limits.
**SECONDARY DEPTH:** Maintain Google provider, application logic, working 4SAPIEN Claude login and existing 4PLANET session bridge.
**P1 DOMINANT:** Browser permits valid authenticated Supabase fetch and sends bridge request after Google session.
**P2 ORIENTATION:** Add exact origin CSP contract test. Do not widen to *.supabase.co.
**P3 ACTION / NEXT:** Release verified king/test policy to main as bounded P0, verify served HTTP CSP, rerun live synthetic bridge test and real founder Google callback.
**P4 DEPTH:** Check that browser can perform preflight and POST without CSP violations or token leaks.
**WHAT CAN BE REMOVED:** Missing Supabase allowlist entry only.
**WHAT MUST BE REUSED:** Existing Cloudflare Pages, Supabase project, first-party session bridge and secure origin list.
**TRUTH BOUNDARY:** A CSP allowlist update fixes a proven browser enforcement blocker; this alone does not certify every third-party account callback or every site.
**MOBILE-FIRST RISK:** Safari and chat in-app browsers may also have distinct storage/redirect behaviour.
**HUMAN SUCCESS:** Google account approval → transparent ID success → actual bridge POST → authenticated 4planet.org.
**FOUNDER RELEASE:** Founder authorised emergency ID production repair 08–09 Oct 2026. Scope public/_headers plus one regression test and existing GOLD release control only. No 4SAPIEN changes.

## UNIVERSAL IMPACT — EXPLICIT INDEPENDENT VERIFICATION INTEGRITY — 09 OCT 2026

**USER ARRIVES BECAUSE:** A person following an IMPACT action needs `VERIFIED` to mean that independent verification is physically referenced, not merely that some evidence link exists.

**ONE THING TO UNDERSTAND:** `evidenceRefs` can identify provider or delivery material. It is not, by itself, proof that an independent verifier assessed the action.

**PRIMARY ACTION:** Fail closed when a lifecycle record reaches `VERIFIED` or a later state without a non-empty `integrity.independentVerificationRef`.

**SECONDARY DEPTH:** Preserve existing quantity, delivery, contradiction, provider-only, refund and evidence-time checks. Preserve TEST/PRODUCTION and D0–D4 separation.

**P1 DOMINANT:** Missing independent-verification metadata is reported as `missing_independent_verification_reference`.
**P2 ORIENTATION:** Empty and whitespace-only references fail exactly like omitted metadata.
**P3 ACTION / NEXT:** Independent Gold judges the exact HEIR correction and regression before any release controller advances it.
**P4 DEPTH:** A reference proves only that metadata is linked; it does not itself establish delivery, outcome, impact or external user value.
**WHAT CAN BE REMOVED:** The fail-open path where `VERIFIED` accepts absent integrity metadata.
**WHAT MUST BE REUSED:** Existing `ActionEvidenceIntegrity`, lifecycle validator, issue #151 receiver, HEIR and IMPACT test suite.
**TRUTH BOUNDARY:** Code and deterministic tests do not certify a real provider, verifier, delivery, outcome, impact, payment or production runtime.
**MOBILE-FIRST RISK:** Not applicable — no interface or layout changes. Existing UI must continue to render validator results without claim promotion.
**HUMAN SUCCESS:** A missing independent-verification record cannot be silently presented as verified IMPACT.
**BASE / ROLLBACK:** `king/test@15446ba4890613e1554e93644903d9806fe9d1a5`; revert the bounded correction commit if independent Gold finds a contract regression.
**MAKER ≠ JUDGE:** Factory implements; independent Gold decides. No main merge or production release is authorised by this brief.
# DISCOVERY ENGINE 01 — EARTH NOW DESTINATION TRUTH CORRECTION — 10 OCT 2026

**STATUS:** BOUNDED HEIR COPY + REGRESSION CORRECTION / NO GOLD / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** A person scans Earth Now for a current planetary signal and expects every signal promise to describe the page reached by its arrow.

**ONE THING TO UNDERSTAND:** Earth Now is an index over existing canonical Discovery pages; a broad source layer must not make a narrower destination appear to cover storms, volcanoes or the whole ocean.

**PRIMARY ACTION:** Choose a signal and continue to the matching evidence page or open the same configured view in full ATLAS.

**SECONDARY DEPTH:** The existing iframe, source clock, limitations and permanent topic guides remain available without a new route, map or content system.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** latest-available Earth signals / explicit source clock / matching Discovery destination or full ATLAS / source and interpretation limits.

**WHAT CAN BE REMOVED:** Broad “Natural events”, “Atmosphere” and “Ocean conditions” promises whose destinations only cover fire, air-quality context and climate evidence.

**WHAT MUST BE REUSED:** Current Earth Now registry, existing canonical topic routes, shared ATLAS embed, PublicShell, Browser Product Proof and sole `king/test` HEIR. PR #403 remains read-only donor evidence.

**TRUTH BOUNDARY:** Copy equivalence and deterministic/browser contracts do not prove source freshness, iframe delivery by the remote host, real-user value, Gold acceptance, deployment or LIVE state.

**MOBILE-FIRST RISK:** Longer precise labels must wrap without horizontal overflow; the existing 390/430 browser projects retain that gate.

**HUMAN SUCCESS:** Every signal label/detail is semantically bounded to its destination, and the visible full-ATLAS link preserves the same map mode, layers, centre and zoom as the embed.

**ROLLBACK:** Exact pre-change HEIR parent `f8b1da5ba63836902ad2a7452bb66829b49f8c5e`.

**GOLD:** Maker correction only. Independent Judge remains required before any promotion or LIVE claim.

# ATLAS → LIVING SYSTEMS DEEP-LINK IDENTITY — 10 OCT 2026

**STATUS:** TEST HEIR MAKER CANDIDATE / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.

**USER JOB:** a person following a Living Systems object from an ATLAS-owned URL must reach the same canonical object, with explicit return/source query context intact.

**DEFECT:** the ATLAS host redirected every `/livingsystems/*` request to the Living Systems root and did not recognise the equivalent `/living-systems/*` deep-path alias. Object identity was therefore discarded at the product boundary.

**BOUNDED CORRECTION:** keep ATLAS and Living Systems as separate canonical owners; permanently redirect both aliases to `https://4planet.org/livingsystems/`, preserving a normalised deep-path suffix and the original query string. No data, map, source, route ownership or Living Systems content is duplicated.

**ACCEPTANCE:** the executable middleware contract must prove root aliases, `/species/orca`, `/ecosystems/EC_AMAZON_RAINFOREST`, query preservation and canonical trailing-slash collapse. Typecheck, production build, doctrine and Product Authority gates must pass on the exact candidate. Independent Gold must judge the immutable SHA; no LIVE promotion is authorised here.

# SPECIES MEDIA RIGHTS — MOCKED GBIF REQUEST-PATH IMMUNITY — 10 OCT 2026

**STATUS:** BOUNDED HEIR REGRESSION COMPLETION / NO PRODUCT BYTE / NO GOLD / NO LIVE RELEASE.
**USER ARRIVES BECAUSE:** a person opens a SPECIES profile and must never be shown an occurrence image whose reuse rights are only implied by the parent occurrence record.
**ONE THING TO UNDERSTAND:** media rights belong to the exact media item; an occurrence-level licence cannot be inherited by an image.
**PRIMARY ACTION:** exercise the public `fetchResolvedSpeciesImages` request path with mocked GBIF country-first and global-fallback responses.
**SECONDARY DEPTH:** prove an unlicensed item stays withheld while a sibling item with its own displayable licence is returned with trimmed licence metadata.
**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** lawful image plane / item provenance / fail closed / inspect source record and rights metadata.
**WHAT CAN BE REMOVED:** source-text-only confidence as the sole regression proof for this rights boundary.
**WHAT MUST BE REUSED:** existing SPECIES media resolver, GBIF query path, country-first fallback, rights classifier and `test:species-media-rights` gate.
**TRUTH BOUNDARY:** mocked deterministic tests prove resolver behaviour only. They do not prove provider availability, current provider metadata, independent Gold, deployment, LIVE state or user value.
**MOBILE-FIRST RISK:** none introduced; no rendered byte or interaction changes.
**HUMAN SUCCESS:** missing item-level rights cannot leak an image through either the Norway request or the global fallback; a genuinely item-licensed image remains available.
**BASE / ROLLBACK:** `king/test@7819e6410d397874832ff1166a3bdc7e02e75552`; revert this test/control-only commit if it creates an invalid resolver expectation.
**MAKER ≠ JUDGE:** Factory completes the missing regression; independent Gold decides. No release or production mutation is authorised.

# 4SAPIEN LIFE-8 — LOCAL WEEK MEAL-PLAN IDENTITY — 10 OCT 2026

**STATUS:** BOUNDED HEIR FUNCTIONAL CORRECTION / INDEPENDENT GOLD PENDING / NO LIVE RELEASE.

**USER ARRIVES BECAUSE:** a signed-in person opens Mat early on Monday and expects this week's saved dinners, not the prior UTC week's plan.

**ONE THING TO UNDERSTAND:** weekly meal-plan identity follows the person's local calendar week. Oslo Monday begins at local midnight in both summer and winter time; UTC is only an explicit fail-closed fallback when no valid browser time zone exists.

**PRIMARY ACTION:** load and save the authenticated user's meal plan under the correct local Monday `week_start` key.

**SECONDARY DEPTH:** preserve owner-scoped Supabase rows, existing meal selection, handleliste generation, partial-sync truth and the current 4PLANET ID session. Rehydrate when the derived week key changes.

**P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH:** this week's chosen dinners / Mat under the signed-in identity / choose dinners and create a handleliste / budget, ingredients and sync state.

**WHAT CAN BE REMOVED:** UTC-derived week identity that can select the prior row during local Monday.

**WHAT MUST BE REUSED:** existing `four_sapien_meal_plans` owner/RLS contract, `week_start` primary key, canonical materializer, LIFE-8/#317 receiver and sole `king/test` HEIR.

**TRUTH BOUNDARY:** deterministic Oslo summer/winter/Sunday tests and materialized read/write contracts prove calendar-key behaviour only. They do not prove a real authenticated return session, Supabase availability, independent Gold, deployment, LIVE state or observed user value.

**MOBILE-FIRST RISK:** browser time-zone support can be absent or invalid; the helper must use deterministic UTC fallback without changing layout or touch behaviour.

**HUMAN SUCCESS:** the same signed-in person who returns just after local Monday midnight reads and writes the new week's plan; Sunday 23:59 remains in the ending week.

**BASE / ROLLBACK:** `king/test@7ba56706d3fd56383c63d380ab398d34534a95f3`; revert the bounded local-week correction if independent Gold finds a calendar or hydration regression.

**MAKER ≠ JUDGE:** Factory implements and regression-tests the correction. Independent Gold must judge the exact immutable SHA before any promotion; Founder-controlled LIVE remains unchanged.
