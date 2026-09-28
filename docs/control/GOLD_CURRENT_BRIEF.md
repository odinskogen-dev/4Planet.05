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
The dominant layer is the user's recorded economy: liquid accounts, debt and holdings. Empty states lead directly to a useful first entry.

## P2 ORIENTATION
The surface says whether data is MANUAL, CONNECTED, STALE, PARTIAL or UNKNOWN. It never presents a provider-ready seam as an active bank connection.

## P3 ACTION / NEXT
The next action is one of: add account, add holding, update current price, inspect sync status or remove local TEST data. No trade execution or personalised BUY / SELL instruction exists.

## P4 DEPTH
Deep evidence includes per-record source and as-of time, portfolio formula inputs, consent expiry, rate-limit state, sync receipts and explicit gaps. Provider credentials and bank link references stay server-side outside browser-readable tables.

## WHAT CAN BE REMOVED
Remove the old finance placeholder, fake-connected states, zero-as-unknown arithmetic, silent cross-currency totals and any market-data integration without production-use rights. Preserve the existing `GOLD-TEMPLATE-REFINEMENT-02` human hierarchy, provenance, privacy boundaries and Founder release gate.

## TRUTH BOUNDARY
- Manual values are user-entered facts, not bank-verified facts.
- Current holding price is a manual quote until a licensed provider is configured.
- Different currencies are never silently added together without an FX rate.
- Unknown is never coerced to zero.
- Four bank syncs per day is an adaptive target; provider/bank limits may allow fewer.
- Portfolio monitoring is factual arithmetic, not investment advice or trade execution.
- Yahoo/yfinance is not introduced as a commercial production dependency.

## PRIVACY AND SECURITY
- Authenticated canonical finance rows remain owner-scoped under RLS.
- Anonymous users receive no canonical finance-table privileges.
- Provider credentials and provider connection references are never exposed to the browser.
- The HEIR proof may use clearly labelled device-local storage only; it is not canonical authenticated state and can be cleared by the user.
- Analytics must never receive balances, holdings, tickers, quantities, prices, bank names or free text.

## MOBILE-FIRST RISK
Account and holding forms, summary cards, tables and sync state must remain complete at 390/430 widths with no horizontal overflow or hidden truth labels.

## HUMAN SUCCESS
Within two minutes, a first-time user can enter one liquid account and one holding, understand the resulting totals, update a price, reload without losing TEST state, and explain which values are manual versus bank/provider verified.

## WHAT MUST BE REUSED
Existing 4SAPIEN/Embla route, `king/test` HEIR, Product Surface Registry, Finance Twin truth rules, canonical `4Planet_ OS` Supabase project, owner RLS pattern, Cloudflare exact-SHA review surface and existing privacy-safe analytics spine. No new BRAIN, product, database, auth system or branch.

## CURRENT BOUNDED DELTAS
- Replace the `/4sapien/finance` placeholder with a working TEST-only manual economy and portfolio surface.
- Add deterministic finance arithmetic and adaptive bank-sync scheduling contracts.
- Add an additive Supabase migration for owner-scoped holdings, quotes, public connection status and private provider references.
- Record a provider boundary compatible with an authorised PSD2 account-information provider; do not activate credentials or consent externally.
- Correct the stale 4SAPIEN LIVE registry fact without granting LIVE write authority.
- Selectively adopt finance truth conventions from the read-only 4SAPIEN production donor; do not wholesale-merge it.

## OUT OF SCOPE / FOUNDER GATES
- No mutation or release to `4sapien.com`.
- `ENIG LIVE` remains the separate explicit production-release command; this change does not contain it.
- No provider signup, commercial agreement, credential creation or bank consent.
- No production database migration or Edge Function deployment.
- No payment, transfer, order, trade execution, NAV workflow or personalised financial recommendation.
- No automated Yahoo Finance dependency.

## ACCEPTANCE
1. `king/test` remains the sole write-authorised HEIR; LIVE remains unchanged.
2. Manual accounts and holdings persist on the device in HEIR TEST and can be deliberately cleared.
3. Liquidity, debt, cost basis, market value and unrealised change are deterministic and currency-safe.
4. Bank status explicitly says NOT CONNECTED until an authorised provider is configured and consented.
5. The bank scheduler respects consent and provider rate limits while targeting at most four successful refreshes per day.
6. Database objects are owner-scoped, explicitly granted, indexed and separated from provider secrets.
7. No sensitive finance values or identifiers are emitted to analytics.
8. Typecheck, build, finance contracts, product-authority gate and relevant 390/430/desktop browser tests pass on the exact HEIR head.
9. A working Founder-visible HEIR URL exists before delivery is called complete.
10. Production release remains a separate explicit Founder decision.

## MAKER ≠ JUDGE
The builder may prove deterministic calculations, security shape and browser behaviour, but may not self-certify Human Gold or release to LIVE. Founder review and separate production authority remain required.

## BOUNDED SECURITY REPAIR — VERIFIED VALUE CLOSURE 03
- ATLAS `src/earth/World.tsx` uses a MapLibre named namespace import in preparation for patched MapLibre 6.10.0 ESM; this is compatibility only, not new ATLAS capability.
- SAFE HEIR workflow must run npm audit, typecheck, build, smoke and assets on exact HEIR before committing package/lock; security remains RED until independent tests pass. No LIVE promotion or inflated product proof.


## BOUNDED PARALLEL 4NATION CANDIDATE — 21 SEPTEMBER 2026
- This addendum records a separate, isolated `work/4nation-first-gold-prototype-01` candidate. It DOES NOT replace the current 4SAPIEN finance HEIR brief above, promote the 4NATION branch to TEST KING, or authorise live mutation. No parallel write authority is claimed.
- USER ARRIVES BECAUSE: a citizen wants to know what is being considered in their place; an institutional analyst wants the factual decision context.
- ONE THING TO UNDERSTAND: a sourced Oslofjord 2026–2030 proposal is still under consideration, not a final adopted plan; six integrated lenses share one official evidence projection.
- PRIMARY ACTION: inspect one government hearing, its dates/status, original sources and human/ecological/financial constraints; switch between people and institutional views.
- SECONDARY DEPTH: scientific models versus measured outcomes, a separate grant announcement versus complete costs, unknowns and original source links.
- REUSE: existing PLANETBRAIN `src/planet/places.ts` Oslofjord place; `src/planet/decisionIntelligence.ts` donor as reference ONLY due unverified source states; Brand fonts/colors, `src/App.tsx` isolated host pattern and existing routes. No auth, DB, new BRAIN or paid service.
- TRUTH: 21 September 2026 dated manually reviewed primary-source fixture; ordinary hearing deadline 15 September passed, local/regional extended deadline 15 October; no fake AI, live feed, policy winner or governmental endorsement.
- MOBILE / HUMAN GOLD: two comprehensible user journeys with six lenses, source drawer and responsive 390px desktop; runtime QA pending.
- ACCEPTANCE: exact candidate commit, separate tests, independent source/UX/accessibility/security review and Founder release before 4nation.org. Do not merge this branch to main directly; reconcile via authorised `king/test` TEST KING path only after all gates.
- Project Home: https://docs.google.com/document/d/1IAB_myJZ3pT0rx58QNBJmuCutxhGlWBKBuOjO__NuBo/edit


## 4NATION WORLD-CLASS PRODUCT CONVERGENCE 02 — BOUNDED CHANGE / 21 SEPTEMBER 2026

**AUTHORISATION:** Existing `king/test` sole HEIR; independent production release remains a separate Founder decision. No change to live domains, no duplicate BRAIN, no new registered sandbox.

**USER ARRIVES BECAUSE:** People want to see a real public decision immediately; public-sector readers want inspectable evidence and material constraints without a six-app learning curve.

**ONE THING TO UNDERSTAND:** The proposed Oslofjord 2026–2030 plan is *under consideration*; both audiences share one date-stamped official-source case.

**PRIMARY ACTION:** Open the decision card directly from the first viewport, choose person/institution perspective, inspect the government record, follow the timeline or copy a deep link retaining the selected perspective and decision lens.

**SECONDARY DEPTH:** Progressively navigate Atlas, source-grounded Brain summary (NOT live AI), Solutions, Economy and Outcomes. Sources are adjacent to claims; unknowns are explicit.

**P1 DOMINANT:** Real Oslofjord decision is the first feature, not an abstract invented fjord illustration, giant manifesto or six equal app modules.

**P2 ORIENTATION:** Ministry, jurisdiction, snapshot date, proposal vs adopted distinction, ordinary consultation deadline vs special local/regional deadline.

**P3 ACTION / NEXT:** Explore public decisions / Explore decision intelligence / original proposal / copy case link, each advertised control actually functional.

**P4 DEPTH:** Case timeline with original sources, separate grants versus plan costs, model versus measured outcomes, PLACE lineage to existing ATLAS.

**WHAT CAN BE REMOVED:** Faux-geographical decorative hero; unsupported coordinates on home; redundant opening paragraphs, hidden and generic app-nav hierarchy; source-list-only access.

**WHAT MUST BE REUSED:** Existing `src/planet/places.ts`, Brand typography/color variables and main app route/host seam, shared authority, existing Gold/test and dated decision case.

**TRUTH BOUNDARY:** One dated, manually verified official decision candidate, no live feed, official partnership, policy recommendation, autonomous public action or proven ecological effect. Accessibility and rights checks remain independent QA.

**MOBILE-FIRST RISK:** 390/430 widths must display both entry actions and visible real case; no clipped case actions, horizontal overflow or inaccessible drawer. Reduced-motion scroll respected.

**HUMAN SUCCESS:** Within seconds a visitor understands 4NATION and notices the real Oslofjord issue; completes exact sourced status, authority, next step and original source in fewer clicks than initial large abstract hero. Two journeys share one case; no design success asserted until visually and human reviewed.

**MAKER ≠ JUDGE / RELEASE:** Factual source check and scoped technical tests are necessary but not sufficient for production. Existing FOUR STATE Founder Review exact ATLAS sandbox evidence and baseline Oslofjord MAP READY failure are open. No direct domain change, auto-promotion or false live claim from this brief.

Gold QA repair, 21 Sep: Source-contract test updated to assert the clearer actual UI wording ‘Proposal, not an adopted plan.’ No weakening of underlying claim; official status remains UNDER CONSIDERATION. This fix and its Gold brief are in one bounded TEST KING commit. No live authority.


## 4NATION 07 — ONE CASE FIRST / HUMAN-FIRST CORRECTION — 28 SEP 2026

STATUS: BOUNDED HEIR PRODUCT CHANGE / CANDIDATE QA REQUIRED / PUBLIC LIVE ORIGIN UNCHANGED BY THIS CHANGE.

USER JOB: A first-time person should immediately understand one real public decision without passing through source-search tools or internal product architecture first.

CHANGE: The Oslofjord case is again the first-screen object. The hero asks “What is happening to the Oslofjord?”, retains the single UX06 primary CTA “Explore public decisions”, and keeps source/status beside the case. Stortinget case discovery and SSB statistical context remain available but move behind progressive disclosure after the six-lens case journey. No source adapter, shared fact model, ATLAS contract, 4PLANET ID path or political decision logic is replaced.

SOURCE/TRUTH: Official Norwegian Ministry hearing record re-checked 28 Sep 2026. Public status remains under consideration; ordinary consultation deadline 15 Sep 2026 has passed; separate municipality/county politically processed deadline is 15 Oct 2026. Proposal, consultation, decision, implementation and measured outcome remain distinct. No policy recommendation or government affiliation is implied.

ACCEPTANCE: 4NATION source-state contracts, typecheck/build/smoke/lint, desktop 1440 and mobile 390/430 browser journey, primary-source access, people/institution views, six lenses, timeline disclosure, ATLAS embed/full route and progressive source-tool disclosure must pass. Human craft/Founder visual review remains distinct from maker implementation.

ROLLBACK: revert the bounded 4NATION 07 commit(s). Existing public 4nation.org Worker stays pinned to its previously verified immutable UX06 origin until a separately authorised exact tested artifact is promoted.

QA CORRECTION / 28 SEP 2026: 4NATION source-date contract advanced with the verified snapshot from 22 Sep to 28 Sep; no political status, deadline, source identity or decision semantics changed.

UX CONTRACT CORRECTION / 28 SEP 2026: “Understand your nation.” remains visible as the 4NATION product proposition, but is no longer a second competing hero heading. The Oslofjord question is the single hero heading. Browser acceptance now asserts that hierarchy directly. The compact factual status label remains “PROPOSAL · UNDER CONSIDERATION”.


## 4NATION 08 — HUMAN NATION + MUNICIPAL DECISION MAP — 28 SEP 2026

STATUS: BOUNDED HEIR PRODUCT CANDIDATE. 4NATION 07 is the current verified live origin while this exact 08 candidate completes Gold + hosted visual QA. Founder has explicitly authorised live iteration; only an exact tested immutable 08 artifact may replace the live origin.

PRODUCT JOB: make public decisions understandable as one connected journey: NORWAY → PLACE → PUBLIC DECISION → DECISION THREAD → ATLAS → ORIGINAL EVIDENCE.

DESIGN: 4NATION now adopts the existing 4SAPIEN human-first visual grammar rather than creating a parallel design system: white paper, soft 20–22px rounded cards, calm hairlines, compact rounded controls, Instrument Sans + DM Sans, and persistent light/dark mode. 4NATION keeps its own semantic identity and neutral public-decision status language.

CANONICAL OBJECT: src/planet/nationPublicDecisions.ts defines one PublicDecision shape for national and municipal records. Proposal, consultation, decided, implementing and measured remain distinct stages. A case may have additional evidence/process events without silently promoting its political state.

FIRST PLACE MODELS:
- NORWAY_ — Oslofjord proposal remains the national source-reviewed anchor.
- BERGEN_ — Bergen municipal model uses the official political case for “Et tryggere samfunn – sammen”, including recorded treatment through city government, committees and City Council.
- OSLO_ — Oslo municipal model includes the 2026 land-use-plan consultation and the separately adopted district reform, so consultation and implementation states are visibly different.

ATLAS: existing shared 4PLANET ATLAS is the geographic navigation surface for Norway, Bergen and Oslo through canonical PLACE ids. Current map extent is navigational context. Kartverket/Geonorge official administrative boundary data is registered as the authoritative boundary source, but 08 MUST NOT claim that legal municipal polygons or decision-specific implementation geometry are rendered until that overlay is physically integrated and verified.

DATA BACKBONE: official-source federation is exposed progressively: Kartverket/Geonorge geography, Stortinget open-data search, SSB Statbank search, Bergen municipality and Oslo municipality. Existing PLANETBRAIN/PLACE/ATLAS infrastructure remains shared; no Government Brain or duplicate truth database is created.

MOBILE / ACCESSIBILITY: place selector, municipality lookup, case selector, decision stage path, ATLAS and source thread must work at 390/430 and desktop widths without horizontal document overflow. Theme state persists locally; reduced-motion and existing source/dialog contracts remain.

POLITICAL / TRUTH BOUNDARY: 4NATION describes sourced procedural state and evidence. It does not rank political options, recommend a vote or policy choice, infer motives, claim governmental endorsement, or convert proposals/consultations into adopted or implemented policy.

ACCEPTANCE: source-contract test, typecheck, build, smoke, lint, desktop 1440 + mobile 390/430 browser proof, hosted immutable Founder Visual Preview, Norway/Bergen/Oslo place journey, shared ATLAS, original-source links and persistent light/dark mode must all pass on the exact artifact before live promotion.

LIVE PROOF CONTROL: the real-domain browser workflow derives the expected SOURCE_SHA from the canonical 4NATION Worker and waits for that exact artifact on 4nation.org before testing. No stale hard-coded live SHA is accepted.


4NATION 08 QA NOTE / 28 SEP 2026: Browser assertions are explicitly scoped to the intended decision surface and ATLAS iframe. This preserves both the new place-level map and the existing deep Oslofjord map without weakening either product contract. Real-domain proof now also triggers on canonical Worker source changes.
